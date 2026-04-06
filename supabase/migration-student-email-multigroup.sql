-- ============================================================
-- Migración: Cuentas permanentes de alumno con email + multi-grupo
-- ============================================================

-- ═══════════════════════════════════════════════
-- 1. AÑADIR COLUMNAS EMAIL A STUDENTS
-- ═══════════════════════════════════════════════

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email_verification_code TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;

-- Índice único para email (solo si no es null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email_unique ON public.students(email) WHERE email IS NOT NULL;

-- ═══════════════════════════════════════════════
-- 2. TABLA JUNCTION MULTI-GRUPO
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_student_groups_student ON public.student_groups(student_id);
CREATE INDEX IF NOT EXISTS idx_student_groups_group ON public.student_groups(group_id);
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;

-- Backfill: insertar grupos primarios existentes
INSERT INTO public.student_groups (student_id, group_id, teacher_id)
SELECT id, group_id, teacher_id FROM public.students
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- 3. RPC: Vincular email (genera codigo 6 digitos)
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_link_email(
  p_student_id UUID,
  p_group_id UUID,
  p_email TEXT
) RETURNS JSON AS $$
DECLARE
  v_code TEXT;
  v_clean_email TEXT;
BEGIN
  -- Verificar alumno
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  v_clean_email := lower(trim(p_email));

  -- Verificar email no usado por otro alumno
  IF EXISTS (SELECT 1 FROM public.students WHERE email = v_clean_email AND id != p_student_id) THEN
    RETURN json_build_object('error', 'Este email ya esta vinculado a otra cuenta');
  END IF;

  -- Verificar email no usado por un docente
  IF EXISTS (SELECT 1 FROM public.teachers WHERE email = v_clean_email) THEN
    RETURN json_build_object('error', 'Este email ya esta en uso por un docente');
  END IF;

  -- Generar codigo 6 digitos
  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  UPDATE public.students
  SET email = v_clean_email,
      email_verified = false,
      email_verification_code = v_code,
      email_verification_expires = now() + interval '15 minutes',
      updated_at = now()
  WHERE id = p_student_id;

  RETURN json_build_object('success', true, 'code', v_code, 'email', v_clean_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_link_email TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 4. RPC: Verificar codigo email
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_verify_email(
  p_student_id UUID,
  p_code TEXT
) RETURNS JSON AS $$
BEGIN
  UPDATE public.students
  SET email_verified = true,
      email_verification_code = NULL,
      email_verification_expires = NULL,
      updated_at = now()
  WHERE id = p_student_id
    AND email_verification_code = p_code
    AND email_verification_expires > now();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Codigo incorrecto o expirado');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_verify_email TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 5. RPC: Login con email (sin grupo)
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_login_email(
  p_email TEXT,
  p_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_groups JSON;
BEGIN
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.avatar_color,
         s.password_hash, s.group_id, g.name as group_name, g.group_code,
         s.email, s.email_verified
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.email = lower(trim(p_email))
    AND s.email_verified = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Email no encontrado o no verificado');
  END IF;

  IF v_student.password_hash IS NULL THEN
    RETURN json_build_object('error', 'Debes establecer una contrasena primero desde tu grupo');
  END IF;

  IF v_student.password_hash != crypt(p_password, v_student.password_hash) THEN
    RETURN json_build_object('error', 'Contrasena incorrecta');
  END IF;

  -- Obtener todos los grupos del alumno
  SELECT json_agg(json_build_object(
    'group_id', sg.group_id,
    'group_name', grp.name,
    'group_code', grp.group_code,
    'teacher_name', t.display_name
  ) ORDER BY sg.joined_at)
  INTO v_groups
  FROM public.student_groups sg
  JOIN public.groups grp ON grp.id = sg.group_id
  JOIN public.teachers t ON t.id = sg.teacher_id
  WHERE sg.student_id = v_student.id;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'group_code', v_student.group_code,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500'),
      'email', v_student.email,
      'email_verified', v_student.email_verified
    ),
    'groups', COALESCE(v_groups, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_login_email TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 6. RPC: Unirse a un grupo con codigo
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_join_group(
  p_student_id UUID,
  p_group_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_group RECORD;
  v_student RECORD;
BEGIN
  -- Verificar alumno con email verificado
  SELECT id, email, email_verified, display_name, username
  INTO v_student
  FROM public.students WHERE id = p_student_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  IF v_student.email IS NULL OR v_student.email_verified = false THEN
    RETURN json_build_object('error', 'Necesitas vincular y verificar tu email para unirte a otros grupos');
  END IF;

  -- Buscar grupo
  SELECT g.id, g.teacher_id, g.name, g.group_code
  INTO v_group
  FROM public.groups g
  WHERE g.group_code = upper(trim(p_group_code));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Codigo de grupo no encontrado');
  END IF;

  -- Ya inscrito?
  IF EXISTS (SELECT 1 FROM public.student_groups WHERE student_id = p_student_id AND group_id = v_group.id) THEN
    RETURN json_build_object('error', 'Ya perteneces a este grupo');
  END IF;

  -- Insertar
  INSERT INTO public.student_groups (student_id, group_id, teacher_id)
  VALUES (p_student_id, v_group.id, v_group.teacher_id);

  RETURN json_build_object(
    'success', true,
    'group', json_build_object(
      'group_id', v_group.id,
      'group_name', v_group.name,
      'group_code', v_group.group_code
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_join_group TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 7. RPC: Listar grupos del alumno
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_get_my_groups(
  p_student_id UUID
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(json_build_object(
      'group_id', sg.group_id,
      'group_name', g.name,
      'group_code', g.group_code,
      'teacher_name', t.display_name,
      'joined_at', sg.joined_at
    ) ORDER BY sg.joined_at), '[]'::json)
    FROM public.student_groups sg
    JOIN public.groups g ON g.id = sg.group_id
    JOIN public.teachers t ON t.id = sg.teacher_id
    WHERE sg.student_id = p_student_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_get_my_groups TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 8. RPC: Reenviar codigo de verificacion
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_resend_verification(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_code TEXT;
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM public.students
  WHERE id = p_student_id AND email IS NOT NULL AND email_verified = false;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'No hay email pendiente de verificar');
  END IF;

  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  UPDATE public.students
  SET email_verification_code = v_code,
      email_verification_expires = now() + interval '15 minutes',
      updated_at = now()
  WHERE id = p_student_id;

  RETURN json_build_object('success', true, 'code', v_code, 'email', v_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_resend_verification TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 9. Actualizar student_get_gamification para aceptar group_id NULL
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_get_gamification(
  p_student_id UUID,
  p_group_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_xp INTEGER;
  v_level INTEGER;
  v_earned JSON;
  v_all JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.students WHERE id = p_student_id
      AND (p_group_id IS NULL OR group_id = p_group_id)
  ) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  SELECT COALESCE(total_xp, 0), COALESCE(level, 1) INTO v_xp, v_level
  FROM public.student_xp WHERE student_id = p_student_id;
  IF NOT FOUND THEN v_xp := 0; v_level := 1; END IF;

  SELECT json_agg(sub ORDER BY sub.earned_at DESC) INTO v_earned FROM (
    SELECT bd.code, bd.name_es, bd.description_es, bd.icon, bd.rarity,
           bd.xp_reward, bd.category, sb.earned_at
    FROM public.student_badges sb
    JOIN public.badge_definitions bd ON bd.id = sb.badge_id
    WHERE sb.student_id = p_student_id
  ) sub;

  SELECT json_agg(sub ORDER BY sub.sort_order) INTO v_all FROM (
    SELECT bd.code, bd.name_es, bd.description_es, bd.icon, bd.rarity,
           bd.xp_reward, bd.category, bd.sort_order,
           EXISTS(SELECT 1 FROM public.student_badges sb WHERE sb.student_id = p_student_id AND sb.badge_id = bd.id) as earned
    FROM public.badge_definitions bd WHERE bd.active = true
  ) sub;

  RETURN json_build_object(
    'success', true, 'total_xp', v_xp, 'level', v_level,
    'xp_for_current_level', xp_for_level(v_level), 'xp_for_next_level', xp_for_level(v_level + 1),
    'earned_badges', COALESCE(v_earned, '[]'::json), 'all_badges', COALESCE(v_all, '[]'::json),
    'total_earned', (SELECT COUNT(*) FROM public.student_badges WHERE student_id = p_student_id),
    'total_available', (SELECT COUNT(*) FROM public.badge_definitions WHERE active = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_get_gamification TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 10. Actualizar student_get_dashboard para aceptar group_id NULL
-- ═══════════════════════════════════════════════
-- Nota: La función student_get_dashboard debe recrearse con la misma lógica
-- pero cambiando la verificación de:
--   WHERE s.id = p_student_id AND s.group_id = p_group_id
-- a:
--   WHERE s.id = p_student_id AND (p_group_id IS NULL OR s.group_id = p_group_id)
-- Esto se hará en una actualización separada si es necesario.
