-- Soporte de duelos iniciados por docente y editor de frases para docente.
--
-- Diseño:
--  • Los duelos pueden tener participantes de tipo `student` o `teacher`.
--    Se añaden `challenger_type`/`opponent_type`/`winner_type` con default
--    'student' para mantener compatibilidad. Las FKs duras a `students` se
--    reemplazan por validación en RPCs (un participante teacher referencia
--    `teachers.id`).
--  • El docente solo puede iniciar duelos amistosos (stake=0, sin task).
--    No tiene nota → no entra en duel_grade_ledger.
--  • student_get_duels y student_get_duel_state se actualizan para mostrar
--    correctamente al rival cuando es un docente.
--  • Tablas paralelas para frases del profesor (mismo catálogo, mismas
--    rarezas, mismas RPCs `teacher_*` que las `student_*`).

-- ============================================================================
-- 1) Schema: tipos de participante en duels
-- ============================================================================

ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_challenger_id_fkey;
ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_opponent_id_fkey;
ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_winner_id_fkey;

ALTER TABLE public.duels
  ADD COLUMN IF NOT EXISTS challenger_type text NOT NULL DEFAULT 'student'
    CHECK (challenger_type IN ('student','teacher')),
  ADD COLUMN IF NOT EXISTS opponent_type text NOT NULL DEFAULT 'student'
    CHECK (opponent_type IN ('student','teacher')),
  ADD COLUMN IF NOT EXISTS winner_type text
    CHECK (winner_type IN ('student','teacher'));

-- Reescribimos distinct_players para considerar (type, id) compuesto.
ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_distinct_players;
ALTER TABLE public.duels ADD CONSTRAINT duels_distinct_players CHECK (
  NOT (challenger_id = opponent_id AND challenger_type = opponent_type)
  OR void_reason IS NOT NULL
);

-- Un docente solo puede retar de forma amistosa: stake 0, sin assignment.
ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_teacher_initiated_friendly;
ALTER TABLE public.duels ADD CONSTRAINT duels_teacher_initiated_friendly CHECK (
  challenger_type <> 'teacher' OR (stake = 0 AND assignment_pair_id IS NULL)
);

CREATE INDEX IF NOT EXISTS duels_opponent_type_id_idx
  ON public.duels(opponent_type, opponent_id);
CREATE INDEX IF NOT EXISTS duels_challenger_type_id_idx
  ON public.duels(challenger_type, challenger_id);

-- ============================================================================
-- 2) Helper: info de un actor (estudiante o docente)
-- ============================================================================

CREATE OR REPLACE FUNCTION public._duel_actor_info(p_id uuid, p_type text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_type = 'teacher' THEN (
      SELECT jsonb_build_object(
        'id', t.id,
        'name', COALESCE(NULLIF(t.display_name, ''), 'Docente'),
        'emoji', COALESCE(NULLIF(t.avatar_emoji, ''), '🎓'),
        'color', COALESCE(NULLIF(t.avatar_color, ''), 'from-blue-500 to-purple-500'),
        'selected_avatar_code', t.selected_avatar_code,
        'is_teacher', true
      )
      FROM public.teachers t WHERE t.id = p_id
    )
    ELSE (
      SELECT jsonb_build_object(
        'id', s.id,
        'name', s.display_name,
        'emoji', s.avatar_emoji,
        'color', s.avatar_color,
        'selected_avatar_code', s.selected_avatar_code,
        'is_teacher', false
      )
      FROM public.students s WHERE s.id = p_id
    )
  END;
$$;

-- ============================================================================
-- 3) Adaptación de RPCs del lado alumno
-- ============================================================================

CREATE OR REPLACE FUNCTION public.student_get_duel_state(p_student_id uuid, p_session_token text, p_duel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_sid uuid; v_duel public.duels%ROWTYPE; v_reveal boolean; v_me_is_challenger boolean;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN RETURN jsonb_build_object('error','Sesion invalida'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;

  v_me_is_challenger := (v_duel.challenger_type = 'student' AND v_duel.challenger_id = p_student_id);
  IF NOT v_me_is_challenger
     AND NOT (v_duel.opponent_type = 'student' AND v_duel.opponent_id = p_student_id) THEN
    RETURN jsonb_build_object('error','No eres parte del duelo');
  END IF;

  v_reveal := (NOT v_duel.is_hidden)
           OR v_duel.status IN ('finished','void','in_progress')
           OR v_me_is_challenger;

  RETURN jsonb_build_object(
    'id', v_duel.id, 'status', v_duel.status, 'app_id', v_duel.app_id, 'app_name', v_duel.app_name,
    'level', v_duel.level, 'grade', v_duel.grade, 'subject_id', v_duel.subject_id,
    'stake', v_duel.stake, 'best_of', v_duel.best_of, 'is_hidden', v_duel.is_hidden,
    'winner_id', v_duel.winner_id, 'winner_type', v_duel.winner_type, 'void_reason', v_duel.void_reason,
    'challenger_id', v_duel.challenger_id, 'challenger_type', v_duel.challenger_type,
    'opponent_id', v_duel.opponent_id, 'opponent_type', v_duel.opponent_type,
    'challenger', CASE WHEN v_reveal
                       THEN public._duel_actor_info(v_duel.challenger_id, v_duel.challenger_type)
                       ELSE jsonb_build_object('id', v_duel.challenger_id, 'hidden', true) END,
    'opponent', public._duel_actor_info(v_duel.opponent_id, v_duel.opponent_type),
    'rounds', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('round_index', round_index, 'winner_id', winner_id, 'payload', payload) ORDER BY round_index)
      FROM public.duel_rounds WHERE duel_id = v_duel.id
    ), '[]'::jsonb)
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.student_get_duels(p_student_id uuid, p_session_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_sid uuid;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error','Sesion invalida');
  END IF;
  RETURN jsonb_build_object(
    'incoming', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id', d.id,
        'group_id', d.group_id,
        'challenger', CASE WHEN d.challenger_revealed
                           THEN public._duel_actor_info(d.challenger_id, d.challenger_type)
                           ELSE jsonb_build_object('hidden', true) END,
        'me_revealed',    d.opponent_revealed,
        'rival_revealed', d.challenger_revealed,
        'rival_is_teacher', (d.challenger_type = 'teacher'),
        'app_id', d.app_id, 'app_name', d.app_name, 'stake', d.stake,
        'status', d.status, 'is_hidden', d.is_hidden, 'best_of', d.best_of, 'created_at', d.created_at,
        'is_task', (d.assignment_pair_id IS NOT NULL),
        'in_class_window', (
          d.group_id IS NULL OR EXISTS (
            SELECT 1
            FROM public.group_class_hours gch
            JOIN public.groups g ON g.id = gch.group_id
            JOIN public.teachers t ON t.id = g.teacher_id
            WHERE gch.group_id = d.group_id
              AND gch.weekday = EXTRACT(ISODOW FROM (now() AT TIME ZONE COALESCE(t.timezone,'Europe/Madrid')))::int
              AND (now() AT TIME ZONE COALESCE(t.timezone,'Europe/Madrid'))::time BETWEEN gch.start_time AND gch.end_time
          )
        )
      ) ORDER BY d.created_at DESC)
      FROM public.duels d
      WHERE d.opponent_type = 'student' AND d.opponent_id = p_student_id
        AND d.status IN ('pending','accepted','in_progress')
    ), '[]'::jsonb),
    'outgoing', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id', d.id,
        'group_id', d.group_id,
        'opponent', CASE WHEN d.opponent_revealed
                         THEN public._duel_actor_info(d.opponent_id, d.opponent_type)
                         ELSE jsonb_build_object('hidden', true) END,
        'me_revealed',    d.challenger_revealed,
        'rival_revealed', d.opponent_revealed,
        'rival_is_teacher', (d.opponent_type = 'teacher'),
        'app_id', d.app_id, 'app_name', d.app_name, 'stake', d.stake,
        'status', d.status, 'is_hidden', d.is_hidden, 'best_of', d.best_of, 'created_at', d.created_at,
        'is_task', (d.assignment_pair_id IS NOT NULL),
        'in_class_window', (
          d.group_id IS NULL OR EXISTS (
            SELECT 1
            FROM public.group_class_hours gch
            JOIN public.groups g ON g.id = gch.group_id
            JOIN public.teachers t ON t.id = g.teacher_id
            WHERE gch.group_id = d.group_id
              AND gch.weekday = EXTRACT(ISODOW FROM (now() AT TIME ZONE COALESCE(t.timezone,'Europe/Madrid')))::int
              AND (now() AT TIME ZONE COALESCE(t.timezone,'Europe/Madrid'))::time BETWEEN gch.start_time AND gch.end_time
          )
        )
      ) ORDER BY d.created_at DESC)
      FROM public.duels d
      WHERE d.challenger_type = 'student' AND d.challenger_id = p_student_id
        AND d.status IN ('pending','accepted','in_progress')
    ), '[]'::jsonb)
  );
END;
$function$;

-- student_report_duel_result: el ledger sólo se aplica si AMBOS participantes son alumnos.
-- Si el reto vino de un docente (stake siempre 0), no se inserta nada en el ledger.
-- También aceptamos que reporte el resultado el opponent cuando el challenger es un teacher.
CREATE OR REPLACE FUNCTION public.student_report_duel_result(p_student_id uuid, p_session_token text, p_duel_id uuid, p_winner_id uuid, p_rounds jsonb DEFAULT NULL::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sid uuid;
  v_duel public.duels%ROWTYPE;
  v_loser uuid;
  v_loser_type text;
  v_winner_type text;
  v_round jsonb;
  v_is_task boolean;
  v_winner_delta numeric;
  v_loser_delta numeric;
  v_only_students boolean;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error','Sesion invalida');
  END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  -- Si el challenger es un docente, el alumno (opponent) puede reportar.
  IF NOT (
       (v_duel.challenger_type = 'student' AND v_duel.challenger_id = p_student_id)
    OR (v_duel.challenger_type = 'teacher' AND v_duel.opponent_type = 'student' AND v_duel.opponent_id = p_student_id)
  ) THEN
    RETURN jsonb_build_object('error','No autorizado para reportar este duelo');
  END IF;
  IF v_duel.status NOT IN ('in_progress','accepted') THEN
    RETURN jsonb_build_object('error','El duelo no esta en curso');
  END IF;

  IF p_rounds IS NOT NULL THEN
    FOR v_round IN SELECT * FROM jsonb_array_elements(p_rounds) LOOP
      INSERT INTO public.duel_rounds (duel_id, round_index, winner_id, payload)
      VALUES (p_duel_id, (v_round->>'round_index')::smallint,
              NULLIF(v_round->>'winner_id', '')::uuid, v_round->'payload')
      ON CONFLICT (duel_id, round_index) DO NOTHING;
    END LOOP;
  END IF;

  IF p_winner_id IS NULL THEN
    UPDATE public.duels SET status='void', void_reason='no_winner', finished_at=now()
    WHERE id=p_duel_id;
    RETURN jsonb_build_object('status','void');
  END IF;

  IF p_winner_id NOT IN (v_duel.challenger_id, v_duel.opponent_id) THEN
    RETURN jsonb_build_object('error','El ganador debe ser uno de los participantes');
  END IF;

  IF p_winner_id = v_duel.challenger_id THEN
    v_winner_type := v_duel.challenger_type;
    v_loser := v_duel.opponent_id;
    v_loser_type := v_duel.opponent_type;
  ELSE
    v_winner_type := v_duel.opponent_type;
    v_loser := v_duel.challenger_id;
    v_loser_type := v_duel.challenger_type;
  END IF;

  v_is_task := (v_duel.assignment_pair_id IS NOT NULL);
  v_only_students := (v_duel.challenger_type = 'student' AND v_duel.opponent_type = 'student');

  UPDATE public.duels
  SET status='finished', winner_id=p_winner_id, winner_type=v_winner_type, finished_at=now()
  WHERE id=p_duel_id;

  IF v_is_task AND v_only_students THEN
    v_winner_delta := 0.10;
    v_loser_delta  := 0;
    INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
    VALUES (p_winner_id, p_duel_id, v_winner_delta, 'win');
  ELSIF v_only_students AND v_duel.stake > 0 THEN
    v_winner_delta := v_duel.stake;
    v_loser_delta  := -v_duel.stake;
    INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
    VALUES (p_winner_id, p_duel_id, v_winner_delta, 'win');
    INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
    VALUES (v_loser, p_duel_id, v_loser_delta, 'loss');
  ELSE
    -- stake=0 o duelo con docente: sin ledger.
    v_winner_delta := 0;
    v_loser_delta  := 0;
  END IF;

  -- Notificaciones (sólo a participantes alumnos).
  IF v_winner_type = 'student' THEN
    INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data) VALUES
      ('student', p_winner_id, 'duel_result',
       CASE WHEN v_is_task THEN 'Has ganado el duelo (tarea)' ELSE 'Has ganado el duelo' END,
       v_duel.app_name,
       jsonb_build_object('duel_id', p_duel_id, 'result', 'win',
                          'delta', v_winner_delta, 'is_task', v_is_task));
  END IF;
  IF v_loser_type = 'student' THEN
    INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data) VALUES
      ('student', v_loser, 'duel_result',
       CASE WHEN v_is_task THEN 'Has perdido el duelo (sin penalizacion)' ELSE 'Has perdido el duelo' END,
       v_duel.app_name,
       jsonb_build_object('duel_id', p_duel_id, 'result', 'loss',
                          'delta', v_loser_delta, 'is_task', v_is_task));
  END IF;

  RETURN jsonb_build_object(
    'status','finished',
    'winner_id', p_winner_id,
    'winner_type', v_winner_type,
    'loser_id', v_loser,
    'loser_type', v_loser_type,
    'stake', v_duel.stake,
    'is_task', v_is_task,
    'winner_delta', v_winner_delta,
    'loser_delta',  v_loser_delta);
END;
$function$;

-- student_accept_duel: dejar al alumno aceptar también un reto del docente
CREATE OR REPLACE FUNCTION public.student_accept_duel(p_student_id uuid, p_session_token text, p_duel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_sid uuid; v_duel public.duels%ROWTYPE;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN RETURN jsonb_build_object('error','Sesion invalida'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF NOT (v_duel.opponent_type = 'student' AND v_duel.opponent_id = p_student_id) THEN
    RETURN jsonb_build_object('error','Solo el oponente puede aceptar');
  END IF;
  IF v_duel.status <> 'pending' THEN RETURN jsonb_build_object('error','El duelo ya no esta pendiente'); END IF;
  UPDATE public.duels SET status = 'accepted', accepted_at = now() WHERE id = p_duel_id;
  -- Notificar al challenger sólo si es alumno (al docente lo gestiona Realtime/inbox).
  IF v_duel.challenger_type = 'student' THEN
    INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
    VALUES ('student', v_duel.challenger_id, 'duel_accepted', 'Tu duelo ha sido aceptado', v_duel.app_name,
      jsonb_build_object('duel_id', p_duel_id, 'app_id', v_duel.app_id));
  END IF;
  RETURN jsonb_build_object('ok', true);
END; $function$;

-- student_start_duel: al iniciar, si el rival es docente, no se exige class window
CREATE OR REPLACE FUNCTION public.student_start_duel(p_student_id uuid, p_session_token text, p_duel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_sid uuid; v_duel public.duels%ROWTYPE; v_only_students boolean;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN RETURN jsonb_build_object('error','Sesion invalida'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF NOT (
       (v_duel.challenger_type = 'student' AND v_duel.challenger_id = p_student_id)
    OR (v_duel.opponent_type = 'student' AND v_duel.opponent_id = p_student_id)
  ) THEN
    RETURN jsonb_build_object('error','No eres parte del duelo');
  END IF;
  IF v_duel.status = 'in_progress' THEN RETURN jsonb_build_object('ok', true); END IF;
  IF v_duel.status <> 'accepted' THEN RETURN jsonb_build_object('error','El duelo no esta aceptado'); END IF;
  v_only_students := (v_duel.challenger_type = 'student' AND v_duel.opponent_type = 'student');
  IF v_only_students THEN
    IF NOT public._duel_has_any_schedule(v_duel.challenger_id, v_duel.opponent_id) THEN
      RETURN jsonb_build_object('error','El profesor aun no ha configurado el horario de clase.');
    END IF;
    IF NOT public._duel_allowed_at(v_duel.challenger_id, v_duel.opponent_id, now()) THEN
      RETURN jsonb_build_object('error','Solo se puede jugar el duelo dentro del horario de clase.');
    END IF;
  END IF;
  UPDATE public.duels SET status = 'in_progress', started_at = now() WHERE id = p_duel_id;
  RETURN jsonb_build_object('ok', true);
END; $function$;

-- student_void_duel y student_reject_duel se quedan igual: el chequeo
-- p_student_id IN (challenger_id, opponent_id) sigue funcionando porque el
-- alumno está en uno de los dos campos (con type='student').

-- ============================================================================
-- 4) RPCs nuevas: docente
-- ============================================================================

-- Lista los alumnos de cualquier grupo del docente (potenciales rivales).
CREATE OR REPLACE FUNCTION public.teacher_get_duel_opponents()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_tid uuid := auth.uid(); v_result jsonb;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  WITH my_groups AS (
    SELECT g.id, g.name FROM public.groups g WHERE g.teacher_id = v_tid
    UNION
    SELECT g.id, g.name FROM public.groups g
    JOIN public.group_co_teachers ct ON ct.group_id = g.id
    WHERE ct.teacher_id = v_tid
  ),
  candidates AS (
    SELECT DISTINCT ON (s.id)
           s.id, s.display_name, s.avatar_emoji, s.avatar_color, s.selected_avatar_code,
           sg.group_id, mg.name AS group_name
    FROM public.student_groups sg
    JOIN public.students s ON s.id = sg.student_id
    JOIN my_groups mg ON mg.id = sg.group_id
    ORDER BY s.id, mg.name
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id, 'name', c.display_name, 'emoji', c.avatar_emoji,
    'color', c.avatar_color, 'selected_avatar_code', c.selected_avatar_code,
    'group_id', c.group_id, 'group_name', c.group_name
  ) ORDER BY c.group_name, c.display_name), '[]'::jsonb)
  INTO v_result FROM candidates c;
  RETURN jsonb_build_object('opponents', v_result);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_get_duel_opponents() TO authenticated;

-- Crea un duelo amistoso (siempre stake=0) docente → alumno.
CREATE OR REPLACE FUNCTION public.teacher_create_duel(
  p_opponent_id uuid,
  p_app_id text, p_app_name text, p_level text, p_grade text, p_subject_id text,
  p_best_of smallint DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_duel_id uuid;
  v_group_id uuid;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;

  -- ¿El alumno está en algún grupo donde yo enseño (owner o co-teacher)?
  SELECT sg.group_id INTO v_group_id
  FROM public.student_groups sg
  JOIN public.groups g ON g.id = sg.group_id
  WHERE sg.student_id = p_opponent_id
    AND (g.teacher_id = v_tid
         OR EXISTS (SELECT 1 FROM public.group_co_teachers ct
                    WHERE ct.group_id = g.id AND ct.teacher_id = v_tid))
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN jsonb_build_object('error','Solo puedes retar a alumnos de tus grupos');
  END IF;

  INSERT INTO public.duels (
    challenger_id, challenger_type, opponent_id, opponent_type,
    teacher_id, group_id, app_id, app_name,
    level, grade, subject_id, stake, best_of, is_hidden
  ) VALUES (
    v_tid, 'teacher', p_opponent_id, 'student',
    v_tid, v_group_id, p_app_id, p_app_name,
    p_level, p_grade, p_subject_id, 0, COALESCE(p_best_of, 1), false
  ) RETURNING id INTO v_duel_id;

  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES ('student', p_opponent_id, 'duel_invite',
    'Tu profesor te ha retado a un duelo amistoso',
    p_app_name,
    jsonb_build_object('duel_id', v_duel_id, 'app_id', p_app_id, 'stake', 0,
                       'hidden', false, 'from_teacher', true));
  RETURN jsonb_build_object('duel_id', v_duel_id);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_create_duel(uuid,text,text,text,text,text,smallint) TO authenticated;

-- Inbox del docente: duelos donde participa.
CREATE OR REPLACE FUNCTION public.teacher_get_my_duels()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_tid uuid := auth.uid();
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  RETURN jsonb_build_object(
    -- duelos que YO inicié (challenger=teacher), aún en curso
    'outgoing', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id', d.id,
        'group_id', d.group_id,
        'opponent', public._duel_actor_info(d.opponent_id, d.opponent_type),
        'app_id', d.app_id, 'app_name', d.app_name, 'stake', d.stake,
        'status', d.status, 'is_hidden', false, 'best_of', d.best_of, 'created_at', d.created_at,
        'is_task', false,
        'rival_is_teacher', false
      ) ORDER BY d.created_at DESC)
      FROM public.duels d
      WHERE d.challenger_type = 'teacher' AND d.challenger_id = v_tid
        AND d.status IN ('pending','accepted','in_progress')
    ), '[]'::jsonb)
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_get_my_duels() TO authenticated;

-- State del duelo para el docente.
CREATE OR REPLACE FUNCTION public.teacher_get_duel_state(p_duel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_tid uuid := auth.uid(); v_duel public.duels%ROWTYPE;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF NOT (
       (v_duel.challenger_type = 'teacher' AND v_duel.challenger_id = v_tid)
    OR (v_duel.opponent_type   = 'teacher' AND v_duel.opponent_id   = v_tid)
  ) THEN
    RETURN jsonb_build_object('error','No eres parte del duelo');
  END IF;
  RETURN jsonb_build_object(
    'id', v_duel.id, 'status', v_duel.status, 'app_id', v_duel.app_id, 'app_name', v_duel.app_name,
    'level', v_duel.level, 'grade', v_duel.grade, 'subject_id', v_duel.subject_id,
    'stake', v_duel.stake, 'best_of', v_duel.best_of, 'is_hidden', v_duel.is_hidden,
    'winner_id', v_duel.winner_id, 'winner_type', v_duel.winner_type, 'void_reason', v_duel.void_reason,
    'challenger_id', v_duel.challenger_id, 'challenger_type', v_duel.challenger_type,
    'opponent_id', v_duel.opponent_id, 'opponent_type', v_duel.opponent_type,
    'challenger', public._duel_actor_info(v_duel.challenger_id, v_duel.challenger_type),
    'opponent', public._duel_actor_info(v_duel.opponent_id, v_duel.opponent_type),
    'rounds', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('round_index', round_index, 'winner_id', winner_id, 'payload', payload) ORDER BY round_index)
      FROM public.duel_rounds WHERE duel_id = v_duel.id
    ), '[]'::jsonb)
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_get_duel_state(uuid) TO authenticated;

-- Iniciar duelo (cuando ambos están listos en el lobby).
CREATE OR REPLACE FUNCTION public.teacher_start_duel(p_duel_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_tid uuid := auth.uid(); v_duel public.duels%ROWTYPE;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF NOT (
       (v_duel.challenger_type = 'teacher' AND v_duel.challenger_id = v_tid)
    OR (v_duel.opponent_type   = 'teacher' AND v_duel.opponent_id   = v_tid)
  ) THEN
    RETURN jsonb_build_object('error','No eres parte del duelo');
  END IF;
  IF v_duel.status = 'in_progress' THEN RETURN jsonb_build_object('ok', true); END IF;
  IF v_duel.status <> 'accepted' THEN RETURN jsonb_build_object('error','El duelo no esta aceptado'); END IF;
  UPDATE public.duels SET status = 'in_progress', started_at = now() WHERE id = p_duel_id;
  RETURN jsonb_build_object('ok', true);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_start_duel(uuid) TO authenticated;

-- Cancelar / abandonar duelo.
CREATE OR REPLACE FUNCTION public.teacher_void_duel(p_duel_id uuid, p_reason text DEFAULT 'cancelled')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_tid uuid := auth.uid(); v_duel public.duels%ROWTYPE;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF NOT (
       (v_duel.challenger_type = 'teacher' AND v_duel.challenger_id = v_tid)
    OR (v_duel.opponent_type   = 'teacher' AND v_duel.opponent_id   = v_tid)
  ) THEN
    RETURN jsonb_build_object('error','No eres parte del duelo');
  END IF;
  IF v_duel.status IN ('finished','void','rejected','cancelled') THEN RETURN jsonb_build_object('ok', true); END IF;
  UPDATE public.duels SET status='void', void_reason=p_reason, finished_at=now() WHERE id=p_duel_id;
  RETURN jsonb_build_object('ok', true);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_void_duel(uuid,text) TO authenticated;

-- Reportar resultado (cuando el reto vino del docente).
CREATE OR REPLACE FUNCTION public.teacher_report_duel_result(
  p_duel_id uuid, p_winner_id uuid, p_winner_type text DEFAULT 'student', p_rounds jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_duel public.duels%ROWTYPE;
  v_loser uuid; v_loser_type text;
  v_round jsonb;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF v_duel.challenger_type <> 'teacher' OR v_duel.challenger_id <> v_tid THEN
    RETURN jsonb_build_object('error','Solo el docente que retó puede reportar');
  END IF;
  IF v_duel.status NOT IN ('in_progress','accepted') THEN
    RETURN jsonb_build_object('error','El duelo no esta en curso');
  END IF;

  IF p_rounds IS NOT NULL THEN
    FOR v_round IN SELECT * FROM jsonb_array_elements(p_rounds) LOOP
      INSERT INTO public.duel_rounds (duel_id, round_index, winner_id, payload)
      VALUES (p_duel_id, (v_round->>'round_index')::smallint,
              NULLIF(v_round->>'winner_id','')::uuid, v_round->'payload')
      ON CONFLICT (duel_id, round_index) DO NOTHING;
    END LOOP;
  END IF;

  IF p_winner_id IS NULL THEN
    UPDATE public.duels SET status='void', void_reason='no_winner', finished_at=now() WHERE id=p_duel_id;
    RETURN jsonb_build_object('status','void');
  END IF;

  IF p_winner_id NOT IN (v_duel.challenger_id, v_duel.opponent_id) THEN
    RETURN jsonb_build_object('error','El ganador debe ser uno de los participantes');
  END IF;

  IF p_winner_id = v_duel.challenger_id THEN
    v_loser := v_duel.opponent_id; v_loser_type := v_duel.opponent_type;
  ELSE
    v_loser := v_duel.challenger_id; v_loser_type := v_duel.challenger_type;
  END IF;

  UPDATE public.duels
  SET status='finished', winner_id=p_winner_id, winner_type=p_winner_type, finished_at=now()
  WHERE id=p_duel_id;

  -- Notificar al alumno (sin ledger; siempre amistoso).
  IF v_duel.opponent_type = 'student' THEN
    INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
    VALUES ('student', v_duel.opponent_id, 'duel_result',
      CASE WHEN p_winner_id = v_duel.opponent_id
           THEN 'Has ganado el duelo amistoso con tu profesor'
           ELSE 'Has perdido el duelo amistoso con tu profesor' END,
      v_duel.app_name,
      jsonb_build_object('duel_id', p_duel_id,
                         'result', CASE WHEN p_winner_id = v_duel.opponent_id THEN 'win' ELSE 'loss' END,
                         'delta', 0, 'is_task', false, 'from_teacher', true));
  END IF;

  RETURN jsonb_build_object('status','finished',
    'winner_id', p_winner_id, 'winner_type', p_winner_type,
    'loser_id', v_loser, 'loser_type', v_loser_type,
    'stake', 0, 'is_task', false,
    'winner_delta', 0, 'loser_delta', 0);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_report_duel_result(uuid,uuid,text,jsonb) TO authenticated;

-- ============================================================================
-- 5) Frases del docente
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teacher_duel_phrases (
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  slot smallint NOT NULL CHECK (slot BETWEEN 0 AND 3),
  phrase_id uuid NOT NULL REFERENCES public.duel_phrase_definitions(id) ON DELETE CASCADE,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, slot)
);

CREATE TABLE IF NOT EXISTS public.teacher_unlocked_phrases (
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  phrase_id uuid NOT NULL REFERENCES public.duel_phrase_definitions(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, phrase_id)
);

ALTER TABLE public.teacher_duel_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_unlocked_phrases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_duel_phrases_self ON public.teacher_duel_phrases;
CREATE POLICY teacher_duel_phrases_self ON public.teacher_duel_phrases
  FOR ALL USING ((SELECT auth.uid()) = teacher_id) WITH CHECK ((SELECT auth.uid()) = teacher_id);

DROP POLICY IF EXISTS teacher_unlocked_phrases_self ON public.teacher_unlocked_phrases;
CREATE POLICY teacher_unlocked_phrases_self ON public.teacher_unlocked_phrases
  FOR ALL USING ((SELECT auth.uid()) = teacher_id) WITH CHECK ((SELECT auth.uid()) = teacher_id);

-- Trigger: al crear un docente, se le otorgan las 4 primeras frases default.
CREATE OR REPLACE FUNCTION public._teacher_seed_default_phrases()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.teacher_duel_phrases (teacher_id, slot, phrase_id)
  SELECT NEW.id,
         (idx - 1)::smallint,
         d.id
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order) AS idx
    FROM public.duel_phrase_definitions
    WHERE active = TRUE AND is_default = TRUE
    ORDER BY sort_order
    LIMIT 4
  ) d
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS teacher_seed_phrases_trigger ON public.teachers;
CREATE TRIGGER teacher_seed_phrases_trigger
  AFTER INSERT ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public._teacher_seed_default_phrases();

-- Seed retroactivo para docentes existentes que aún no tienen frases.
INSERT INTO public.teacher_duel_phrases (teacher_id, slot, phrase_id)
SELECT t.id, (d.idx - 1)::smallint, d.id_phrase
FROM public.teachers t
CROSS JOIN LATERAL (
  SELECT id AS id_phrase, ROW_NUMBER() OVER (ORDER BY sort_order) AS idx
  FROM public.duel_phrase_definitions
  WHERE active = TRUE AND is_default = TRUE
  ORDER BY sort_order
  LIMIT 4
) d
WHERE NOT EXISTS (
  SELECT 1 FROM public.teacher_duel_phrases tdp WHERE tdp.teacher_id = t.id
)
ON CONFLICT DO NOTHING;

-- Helper: ¿puede el docente usar esa frase?
CREATE OR REPLACE FUNCTION public._teacher_can_use_phrase(p_teacher_id uuid, p_phrase_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.duel_phrase_definitions d
    WHERE d.id = p_phrase_id AND d.active
      AND (d.is_default OR EXISTS (
        SELECT 1 FROM public.teacher_unlocked_phrases up
        WHERE up.teacher_id = p_teacher_id AND up.phrase_id = p_phrase_id
      ))
  );
$$;

CREATE OR REPLACE FUNCTION public.teacher_get_my_phrases()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_slots jsonb;
  v_available jsonb;
  v_locked jsonb;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'slot', tdp.slot,
    'phrase_id', d.id, 'code', d.code, 'text', d.text, 'emoji', d.emoji,
    'category', d.category, 'rarity', d.rarity
  ) ORDER BY tdp.slot), '[]'::jsonb)
  INTO v_slots
  FROM public.teacher_duel_phrases tdp
  JOIN public.duel_phrase_definitions d ON d.id = tdp.phrase_id
  WHERE tdp.teacher_id = v_tid;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'phrase_id', d.id, 'code', d.code, 'text', d.text, 'emoji', d.emoji,
    'category', d.category, 'rarity', d.rarity, 'is_default', d.is_default,
    'unlocked', NOT d.is_default
  ) ORDER BY d.is_default DESC, d.sort_order, d.code), '[]'::jsonb)
  INTO v_available
  FROM public.duel_phrase_definitions d
  WHERE d.active = TRUE
    AND (d.is_default = TRUE OR EXISTS (
      SELECT 1 FROM public.teacher_unlocked_phrases up
      WHERE up.teacher_id = v_tid AND up.phrase_id = d.id
    ));

  -- Para los locked, no calculamos progreso (los docentes desbloquean
  -- cuando juegan apps; reutiliza _teacher_avatar_progress).
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'phrase_id', d.id, 'code', d.code, 'text', d.text, 'emoji', d.emoji,
    'category', d.category, 'rarity', d.rarity,
    'unlock_requirement', d.unlock_requirement,
    'progress', public._teacher_avatar_progress(v_tid, d.unlock_requirement)
  ) ORDER BY d.sort_order, d.code), '[]'::jsonb)
  INTO v_locked
  FROM public.duel_phrase_definitions d
  WHERE d.active = TRUE AND d.is_default = FALSE
    AND NOT EXISTS (
      SELECT 1 FROM public.teacher_unlocked_phrases up
      WHERE up.teacher_id = v_tid AND up.phrase_id = d.id
    );

  RETURN jsonb_build_object('slots', v_slots, 'available', v_available, 'locked', v_locked);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_get_my_phrases() TO authenticated;

CREATE OR REPLACE FUNCTION public.teacher_set_phrase_slot(p_slot smallint, p_phrase_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_tid uuid := auth.uid();
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  IF p_slot IS NULL OR p_slot < 0 OR p_slot > 3 THEN
    RETURN jsonb_build_object('error','Slot invalido (0-3)');
  END IF;

  IF p_phrase_id IS NULL THEN
    DELETE FROM public.teacher_duel_phrases WHERE teacher_id = v_tid AND slot = p_slot;
    RETURN jsonb_build_object('success', TRUE, 'slot', p_slot, 'phrase_id', NULL);
  END IF;

  IF NOT public._teacher_can_use_phrase(v_tid, p_phrase_id) THEN
    RETURN jsonb_build_object('error','No puedes usar esa frase');
  END IF;

  DELETE FROM public.teacher_duel_phrases
  WHERE teacher_id = v_tid AND phrase_id = p_phrase_id AND slot <> p_slot;

  INSERT INTO public.teacher_duel_phrases (teacher_id, slot, phrase_id, updated_at)
  VALUES (v_tid, p_slot, p_phrase_id, now())
  ON CONFLICT (teacher_id, slot) DO UPDATE
    SET phrase_id = EXCLUDED.phrase_id, updated_at = now();

  RETURN jsonb_build_object('success', TRUE, 'slot', p_slot, 'phrase_id', p_phrase_id);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_set_phrase_slot(smallint,uuid) TO authenticated;
