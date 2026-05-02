-- Rate limiting para los RPC de autenticación de alumno.
--
-- student_login y student_set_password aceptan tráfico anónimo (anon role) sin
-- pasar por GoTrue, así que carecen del rate limit estándar de Auth. Antes de
-- esta migración, cualquiera podía probar cuántas combinaciones quisiera.
--
-- Política:
--   - Máx 10 intentos fallidos por (teacher_code, username) en ventana de 5 min.
--   - Cada intento (éxito o fallo) consume una fila durante la ventana.
--   - Un éxito limpia los fallos previos del mismo identificador.
--   - student_set_password rate-limitado por (group_code, username).

CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id          BIGSERIAL PRIMARY KEY,
  scope       TEXT NOT NULL,        -- 'student_login' | 'student_set_password'
  identifier  TEXT NOT NULL,        -- lower(teacher_code|group_code) || '|' || lower(username)
  succeeded   BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para la ventana deslizante.
CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup
  ON public.auth_attempts (scope, identifier, attempted_at DESC);

-- Sin RLS expuesto: la tabla solo se toca desde funciones SECURITY DEFINER.
-- Bloqueamos el acceso directo de anon/authenticated por seguridad.
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_attempts_no_direct_access" ON public.auth_attempts;
CREATE POLICY "auth_attempts_no_direct_access"
  ON public.auth_attempts FOR ALL
  TO authenticated, anon
  USING (FALSE) WITH CHECK (FALSE);

REVOKE ALL ON public.auth_attempts FROM PUBLIC, anon, authenticated;

COMMENT ON TABLE public.auth_attempts IS
  'Registro de intentos de auth custom (alumno) para rate limiting. Solo accesible desde RPCs SECURITY DEFINER.';

-- ---------------------------------------------------------------------------
-- Helper: comprueba el límite y registra el intento. Devuelve true si está
-- dentro del límite y se debe permitir el intento; false si está bloqueado.
-- Lanza el INSERT del intento; el resultado (succeeded) lo decide la RPC
-- llamadora con _record_auth_outcome.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._check_auth_rate_limit(
  p_scope TEXT,
  p_identifier TEXT,
  p_max_attempts INT DEFAULT 10,
  p_window_seconds INT DEFAULT 300
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_recent_failures INT;
BEGIN
  -- Contamos solo los fallos en la ventana. Los éxitos no cuentan.
  SELECT COUNT(*)
    INTO v_recent_failures
  FROM public.auth_attempts
  WHERE scope = p_scope
    AND identifier = p_identifier
    AND succeeded = FALSE
    AND attempted_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  RETURN v_recent_failures < p_max_attempts;
END;
$$;

-- Registra el resultado del intento. Si succeeded=true, además limpia los
-- fallos previos del mismo identificador para no penalizar al usuario tras
-- recordar la contraseña.
CREATE OR REPLACE FUNCTION public._record_auth_outcome(
  p_scope TEXT,
  p_identifier TEXT,
  p_succeeded BOOLEAN
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.auth_attempts (scope, identifier, succeeded)
  VALUES (p_scope, p_identifier, p_succeeded);

  IF p_succeeded THEN
    DELETE FROM public.auth_attempts
    WHERE scope = p_scope
      AND identifier = p_identifier
      AND succeeded = FALSE
      AND attempted_at > NOW() - INTERVAL '1 hour';
  END IF;

  -- Garbage collection oportunista: borra atempts antiguos cuando se hace
  -- un INSERT con probabilidad ~1%. Sin pg_cron, esto evita que la tabla
  -- crezca indefinidamente sin necesidad de scheduler.
  IF random() < 0.01 THEN
    DELETE FROM public.auth_attempts
    WHERE attempted_at < NOW() - INTERVAL '1 day';
  END IF;
END;
$$;

-- IMPORTANTE: cada role en una sentencia separada. La forma `FROM PUBLIC, anon`
-- en una sola línea no aplica todos los REVOKEs en algunas versiones; las
-- separamos para garantizar que anon/authenticated no puedan llamar al helper
-- directamente y saltarse el rate limit.
REVOKE ALL ON FUNCTION public._check_auth_rate_limit(TEXT, TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._check_auth_rate_limit(TEXT, TEXT, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION public._check_auth_rate_limit(TEXT, TEXT, INT, INT) FROM authenticated;
REVOKE ALL ON FUNCTION public._record_auth_outcome(TEXT, TEXT, BOOLEAN)    FROM PUBLIC;
REVOKE ALL ON FUNCTION public._record_auth_outcome(TEXT, TEXT, BOOLEAN)    FROM anon;
REVOKE ALL ON FUNCTION public._record_auth_outcome(TEXT, TEXT, BOOLEAN)    FROM authenticated;

-- ---------------------------------------------------------------------------
-- student_login con rate limiting
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_login(
  p_teacher_code TEXT,
  p_username     TEXT,
  p_password     TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_student RECORD;
  v_teacher RECORD;
  v_group RECORD;
  v_token TEXT;
  v_identifier TEXT;
BEGIN
  v_identifier := lower(trim(COALESCE(p_teacher_code, ''))) || '|' || lower(trim(COALESCE(p_username, '')));

  IF NOT public._check_auth_rate_limit('student_login', v_identifier, 10, 300) THEN
    RETURN json_build_object('error', 'Demasiados intentos. Espera 5 minutos antes de volver a probar.');
  END IF;

  IF upper(trim(p_teacher_code)) LIKE 'GRP-%' THEN
    SELECT g.id, g.teacher_id INTO v_group
    FROM public.groups g
    WHERE g.group_code = upper(trim(p_teacher_code));
    IF NOT FOUND THEN
      PERFORM public._record_auth_outcome('student_login', v_identifier, FALSE);
      RETURN json_build_object('error', 'Codigo de grupo no encontrado');
    END IF;
    SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
           s.avatar_color, s.selected_avatar_code, s.password_hash,
           g.name as group_name,
           g.level as group_level, g.grade as group_grade, g.subject_id as group_subject_id
    INTO v_student
    FROM public.students s JOIN public.groups g ON g.id = s.group_id
    WHERE s.group_id = v_group.id AND s.username = lower(trim(p_username));
  ELSE
    SELECT id INTO v_teacher FROM public.teachers WHERE teacher_code = upper(trim(p_teacher_code));
    IF NOT FOUND THEN
      PERFORM public._record_auth_outcome('student_login', v_identifier, FALSE);
      RETURN json_build_object('error', 'Codigo no encontrado');
    END IF;
    SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
           s.avatar_color, s.selected_avatar_code, s.password_hash,
           g.name as group_name,
           g.level as group_level, g.grade as group_grade, g.subject_id as group_subject_id
    INTO v_student
    FROM public.students s JOIN public.groups g ON g.id = s.group_id
    WHERE s.teacher_id = v_teacher.id AND s.username = lower(trim(p_username));
  END IF;

  IF NOT FOUND THEN
    PERFORM public._record_auth_outcome('student_login', v_identifier, FALSE);
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  IF v_student.password_hash IS NULL THEN
    -- No marcamos fallo: es flujo de primera vez, no un intento sospechoso.
    RETURN json_build_object(
      'needs_password', true,
      'student_id', v_student.id,
      'display_name', v_student.display_name
    );
  END IF;

  IF v_student.password_hash != crypt(p_password, v_student.password_hash) THEN
    PERFORM public._record_auth_outcome('student_login', v_identifier, FALSE);
    RETURN json_build_object('error', 'Contrasena incorrecta');
  END IF;

  PERFORM public._record_auth_outcome('student_login', v_identifier, TRUE);
  v_token := public._issue_student_session(v_student.id);

  RETURN json_build_object(
    'success', true,
    'session_token', v_token,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'group_level', v_student.group_level,
      'group_grade', v_student.group_grade,
      'group_subject_id', v_student.group_subject_id,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500'),
      'selected_avatar_code', v_student.selected_avatar_code
    )
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- student_set_password con rate limiting
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_set_password(
  p_student_id   UUID,
  p_group_code   TEXT,
  p_username     TEXT,
  p_new_password TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_student RECORD;
  v_token TEXT;
  v_identifier TEXT;
BEGIN
  v_identifier := lower(trim(COALESCE(p_group_code, ''))) || '|' || lower(trim(COALESCE(p_username, '')));

  IF NOT public._check_auth_rate_limit('student_set_password', v_identifier, 5, 300) THEN
    RETURN json_build_object('error', 'Demasiados intentos. Espera 5 minutos antes de volver a probar.');
  END IF;

  SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
         s.avatar_color, s.password_hash, g.name as group_name
  INTO v_student
  FROM public.students s JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id
    AND g.group_code = upper(trim(p_group_code))
    AND s.username = lower(trim(p_username));

  IF NOT FOUND THEN
    PERFORM public._record_auth_outcome('student_set_password', v_identifier, FALSE);
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  IF v_student.password_hash IS NOT NULL THEN
    PERFORM public._record_auth_outcome('student_set_password', v_identifier, FALSE);
    RETURN json_build_object('error', 'Este alumno ya tiene contrasena establecida');
  END IF;

  IF length(p_new_password) < 4 THEN
    -- No rate-limit por longitud: error de UI, no abuso.
    RETURN json_build_object('error', 'La contrasena debe tener al menos 4 caracteres');
  END IF;

  UPDATE public.students
  SET password_hash = crypt(p_new_password, gen_salt('bf')), updated_at = now()
  WHERE id = p_student_id;

  PERFORM public._record_auth_outcome('student_set_password', v_identifier, TRUE);
  v_token := public._issue_student_session(v_student.id);

  RETURN json_build_object(
    'success', true,
    'session_token', v_token,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500')
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_login(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.student_set_password(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
