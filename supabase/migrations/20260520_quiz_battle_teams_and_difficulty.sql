-- Quiz Battle: dificultad numérica 1-10, asignatura "global" y batallas por equipos.
--
-- Diseño:
--
--  Dificultad 1-10
--    Antes había 4 niveles (principiante/intermedio/avanzado/experto). Ahora el
--    builder de preguntas es continuo. Para retrocompat, los strings antiguos
--    siguen aceptándose en frontend (mapeados a 3/5/7/9). Persistimos el valor
--    numérico en quiz_battle_sessions.difficulty.
--
--  Asignatura "global"
--    Cuando el profe elige "Global (todas)" el frontend usa el sentinela
--    '__global__' como subject_id y llama a get_rosco_data_global(level, grade).
--    Las batallas globales no contarán para avatares atados a una asignatura
--    concreta (subject_exams, etc.) porque su subject_id no coincide con
--    ninguno real, pero sí cuentan para todas las insignias de batalla.
--
--  Batallas por equipos
--    Permite jugar 1 vs 1 entre equipos. Solo el "representante" (elegido al
--    azar al generar los equipos) se conecta al PC y juega; los demás
--    miembros del equipo van presencialmente al PC del rep en clase.
--    Resultado: el equipo entero recibe el rank/score del rep y cada miembro
--    obtiene su fila en quiz_battle_sessions con battle_kind='team'. Los
--    bonos/insignias/avatares se calculan por miembro como en cualquier
--    batalla individual; battle_kind queda persistido para poder definir
--    avatares/insignias específicas en el futuro.

-- ============================================================================
-- 1) Schema: quiz_battle_teams + columnas en quiz_battle_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_battle_teams (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code       text NOT NULL,
  group_id        uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  team_index      int  NOT NULL,
  team_name       text NOT NULL,
  rep_student_id  uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  member_ids      uuid[] NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_code, team_index)
);

CREATE INDEX IF NOT EXISTS qb_teams_room_code_idx
  ON public.quiz_battle_teams(room_code);
CREATE INDEX IF NOT EXISTS qb_teams_rep_idx
  ON public.quiz_battle_teams(rep_student_id);

ALTER TABLE public.quiz_battle_teams ENABLE ROW LEVEL SECURITY;

-- Las RPCs SECURITY DEFINER hacen el trabajo. Ningún cliente lee/escribe directo.
DROP POLICY IF EXISTS qb_teams_no_client ON public.quiz_battle_teams;
CREATE POLICY qb_teams_no_client ON public.quiz_battle_teams FOR ALL
  USING (false) WITH CHECK (false);

ALTER TABLE public.quiz_battle_sessions
  ADD COLUMN IF NOT EXISTS battle_kind         text NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS team_id             uuid REFERENCES public.quiz_battle_teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS played_by_user_id   uuid REFERENCES public.students(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS difficulty          smallint;

ALTER TABLE public.quiz_battle_sessions DROP CONSTRAINT IF EXISTS quiz_battle_sessions_kind_check;
ALTER TABLE public.quiz_battle_sessions
  ADD CONSTRAINT quiz_battle_sessions_kind_check
    CHECK (battle_kind IN ('individual','team'));

CREATE INDEX IF NOT EXISTS qb_sessions_team_idx
  ON public.quiz_battle_sessions(team_id);

-- ============================================================================
-- 2) RPC: get_rosco_data_global — preguntas de TODAS las asignaturas
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_rosco_data_global(
  p_level text,
  p_grade integer,
  p_max_difficulty integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'letra', letter,
      'tipo', type,
      'definicion', definition,
      'solucion', solution,
      'materia', subject_id,
      'difficulty', difficulty
    ) ORDER BY subject_id, letter, difficulty
  )
  FROM public.rosco_questions
  WHERE level = p_level
    AND p_grade = ANY(grades)
    AND difficulty <= p_max_difficulty;
$$;

GRANT EXECUTE ON FUNCTION public.get_rosco_data_global(text, integer, integer)
  TO anon, authenticated;

-- ============================================================================
-- 3) RPC: teacher_create_team_battle — graba equipos y notifica
-- ============================================================================
--
-- p_teams: jsonb array con [{ name?, rep_student_id, member_ids[] }, ...].
-- El frontend ya elige al rep (aleatorio o manual). Esta RPC valida que el
-- profe sea dueño del grupo y persiste los equipos + notifica a cada alumno
-- con un mensaje distinto según sea rep o miembro.

CREATE OR REPLACE FUNCTION public.teacher_create_team_battle(
  p_group_id     uuid,
  p_room_code    text,
  p_teams        jsonb,
  p_teacher_name text DEFAULT 'Tu profesor',
  p_group_name   text DEFAULT 'tu grupo'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_team        jsonb;
  v_team_index  int := 0;
  v_team_name   text;
  v_rep_id      uuid;
  v_rep_name    text;
  v_member_ids  uuid[];
  v_member_id   uuid;
  v_team_id     uuid;
  v_count       int := 0;
  v_is_owner    boolean;
  v_is_admin    boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('error','not_authenticated');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.groups WHERE id = p_group_id AND teacher_id = auth.uid()
  ) INTO v_is_owner;
  SELECT EXISTS (
    SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin;
  IF NOT (v_is_owner OR v_is_admin) THEN
    RETURN json_build_object('error','forbidden');
  END IF;

  IF jsonb_typeof(p_teams) <> 'array' OR jsonb_array_length(p_teams) = 0 THEN
    RETURN json_build_object('error','no_teams');
  END IF;

  FOR v_team IN SELECT * FROM jsonb_array_elements(p_teams) LOOP
    v_team_index := v_team_index + 1;
    v_rep_id   := NULLIF(v_team->>'rep_student_id','')::uuid;
    v_team_name := COALESCE(NULLIF(v_team->>'name',''), 'Equipo ' || v_team_index);

    SELECT array_agg(value::text::uuid)
      INTO v_member_ids
    FROM jsonb_array_elements_text(v_team->'member_ids');

    IF v_rep_id IS NULL OR v_member_ids IS NULL OR array_length(v_member_ids, 1) IS NULL THEN
      CONTINUE;
    END IF;

    -- El rep debe estar en la lista de miembros
    IF NOT (v_rep_id = ANY(v_member_ids)) THEN
      v_member_ids := array_append(v_member_ids, v_rep_id);
    END IF;

    INSERT INTO public.quiz_battle_teams
      (room_code, group_id, team_index, team_name, rep_student_id, member_ids)
    VALUES
      (p_room_code, p_group_id, v_team_index, v_team_name, v_rep_id, v_member_ids)
    RETURNING id INTO v_team_id;

    SELECT display_name INTO v_rep_name FROM public.students WHERE id = v_rep_id;

    FOREACH v_member_id IN ARRAY v_member_ids LOOP
      IF v_member_id = v_rep_id THEN
        INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
        VALUES (
          'student', v_member_id, 'quiz_battle_team_rep',
          '¡Te toca representar a tu equipo!',
          p_teacher_name || ' ha lanzado una batalla por equipos. Eres el representante del ' || v_team_name || '. Conéctate ahora con el código ' || p_room_code || ' y juega por todos.',
          jsonb_build_object(
            'room_code', p_room_code,
            'team_id', v_team_id,
            'team_name', v_team_name,
            'group_name', p_group_name
          )
        );
      ELSE
        INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
        VALUES (
          'student', v_member_id, 'quiz_battle_team_member',
          'Tu equipo juega ahora',
          'Tu equipo es "' || v_team_name || '". El representante es ' ||
            COALESCE(v_rep_name, 'tu compañero/a') ||
            '. Vete a su PC para apoyar — solo se puede conectar uno.',
          jsonb_build_object(
            'room_code', p_room_code,
            'team_id', v_team_id,
            'team_name', v_team_name,
            'rep_name', v_rep_name,
            'group_name', p_group_name
          )
        );
      END IF;
      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'teams_created', v_team_index,
    'students_notified', v_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_create_team_battle(uuid, text, jsonb, text, text)
  TO authenticated;

-- ============================================================================
-- 4) RPC: get_team_for_battle — el host valida quién es rep antes de aceptar
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_team_for_battle(
  p_room_code text,
  p_student_id uuid
)
RETURNS json
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  v_team RECORD;
BEGIN
  SELECT id, team_name, rep_student_id, member_ids
    INTO v_team
  FROM public.quiz_battle_teams
  WHERE room_code = p_room_code
    AND p_student_id = ANY(member_ids)
  LIMIT 1;

  IF v_team.id IS NULL THEN
    RETURN json_build_object('found', false);
  END IF;

  RETURN json_build_object(
    'found', true,
    'team_id', v_team.id,
    'team_name', v_team.team_name,
    'is_rep', v_team.rep_student_id = p_student_id,
    'rep_student_id', v_team.rep_student_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_for_battle(text, uuid)
  TO anon, authenticated;

-- ============================================================================
-- 5) save_quiz_battle_results — versión nueva con team support
-- ============================================================================
-- Limpiamos las 3 sobrecargas previas (8 / 9 / 10 args) para evitar ambigüedad
-- en PostgREST. La nueva versión añade p_battle_kind y p_difficulty manteniendo
-- los demás argumentos.

DROP FUNCTION IF EXISTS public.save_quiz_battle_results(text, uuid, text, text, text, integer, integer, jsonb);
DROP FUNCTION IF EXISTS public.save_quiz_battle_results(text, uuid, text, text, text, integer, integer, jsonb, smallint);
DROP FUNCTION IF EXISTS public.save_quiz_battle_results(text, uuid, text, text, text, integer, integer, jsonb, smallint, uuid);

CREATE OR REPLACE FUNCTION public.save_quiz_battle_results(
  p_room_code         text,
  p_host_id           uuid,
  p_level             text,
  p_grade             text,
  p_subject_id        text,
  p_time_per_question integer,
  p_total_questions   integer,
  p_players           jsonb,
  p_term              smallint DEFAULT NULL,
  p_group_id          uuid     DEFAULT NULL,
  p_battle_kind       text     DEFAULT 'individual',
  p_difficulty        smallint DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_player        jsonb;
  v_player_count  integer;
  v_student_id    uuid;
  v_gamif         json;
  v_new_badges    jsonb;
  v_player_badges jsonb := '{}'::jsonb;
  v_tz            text;
  v_has_hours     boolean;
  v_in_window     boolean;
  v_team_id       uuid;
  v_team_name     text;
  v_member_id     uuid;
  v_member_ids    uuid[];
  v_rep_id        uuid;
  v_rank          integer;
  v_score         integer;
  v_correct       integer;
BEGIN
  IF p_battle_kind NOT IN ('individual','team') THEN
    p_battle_kind := 'individual';
  END IF;

  IF p_group_id IS NOT NULL THEN
    SELECT COALESCE(t.timezone, 'Europe/Madrid')
      INTO v_tz
    FROM public.groups g
    JOIN public.teachers t ON t.id = g.teacher_id
    WHERE g.id = p_group_id;
    v_tz := COALESCE(v_tz, 'Europe/Madrid');

    SELECT EXISTS (SELECT 1 FROM public.group_class_hours WHERE group_id = p_group_id)
      INTO v_has_hours;
    IF NOT v_has_hours THEN
      RETURN json_build_object('error','Configura el horario de clase del grupo para poder lanzar batallas.');
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM public.group_class_hours
      WHERE group_id = p_group_id
        AND weekday = EXTRACT(ISODOW FROM (now() AT TIME ZONE v_tz))::int
        AND (now() AT TIME ZONE v_tz)::time BETWEEN start_time AND end_time
    ) INTO v_in_window;
    IF NOT v_in_window THEN
      RETURN json_build_object('error','Solo se pueden guardar batallas dentro del horario de clase.');
    END IF;
  END IF;

  -- Para team battles, p_players es un array por EQUIPO (no por jugador):
  -- [{ team_id, rank, score, correct_answers, played_by_user_id }, ...].
  -- player_count = nº de equipos (= contendientes reales).
  IF p_battle_kind = 'team' THEN
    v_player_count := jsonb_array_length(p_players);
  ELSE
    v_player_count := jsonb_array_length(p_players);
  END IF;

  INSERT INTO public.quiz_battle_sessions (
    room_code, user_type, user_id, display_name, avatar_emoji,
    rank, score, correct_answers, total_questions,
    level, grade, subject_id, time_per_question, player_count, term,
    battle_kind, difficulty
  ) VALUES (
    p_room_code, 'host', p_host_id, '', '',
    0, 0, 0, p_total_questions,
    p_level, p_grade, p_subject_id, p_time_per_question, v_player_count, p_term,
    p_battle_kind, p_difficulty
  );

  IF p_battle_kind = 'team' THEN
    FOR v_player IN SELECT * FROM jsonb_array_elements(p_players) LOOP
      v_team_id := NULLIF(v_player->>'team_id','')::uuid;
      v_rep_id  := NULLIF(v_player->>'played_by_user_id','')::uuid;
      v_rank    := COALESCE(NULLIF(v_player->>'rank','')::int, 0);
      v_score   := COALESCE(NULLIF(v_player->>'score','')::int, 0);
      v_correct := COALESCE(NULLIF(v_player->>'correct_answers','')::int, 0);

      IF v_team_id IS NOT NULL THEN
        SELECT member_ids, team_name
          INTO v_member_ids, v_team_name
        FROM public.quiz_battle_teams
        WHERE id = v_team_id;
      END IF;

      IF v_member_ids IS NULL OR array_length(v_member_ids, 1) IS NULL THEN
        -- Fallback: leer del payload por si el equipo no se persistió
        SELECT array_agg(value::text::uuid)
          INTO v_member_ids
        FROM jsonb_array_elements_text(v_player->'member_ids');
        v_team_name := COALESCE(v_team_name, NULLIF(v_player->>'team_name',''), 'Equipo');
      END IF;

      IF v_member_ids IS NULL THEN CONTINUE; END IF;

      FOREACH v_member_id IN ARRAY v_member_ids LOOP
        INSERT INTO public.quiz_battle_sessions (
          room_code, user_type, user_id, display_name, avatar_emoji,
          rank, score, correct_answers, total_questions,
          level, grade, subject_id, time_per_question, player_count, term,
          battle_kind, team_id, played_by_user_id, difficulty
        )
        SELECT
          p_room_code, 'student', s.id, s.display_name,
          COALESCE(NULLIF(s.avatar_emoji, ''), '🛡️'),
          v_rank, v_score, v_correct, p_total_questions,
          p_level, p_grade, p_subject_id, p_time_per_question, v_player_count, p_term,
          'team', v_team_id, v_rep_id, p_difficulty
        FROM public.students s
        WHERE s.id = v_member_id;

        BEGIN
          v_gamif := public.gamification_process_battle(v_member_id);
          v_new_badges := COALESCE((v_gamif->>'new_badges')::jsonb, '[]'::jsonb);
          IF jsonb_array_length(v_new_badges) > 0 THEN
            v_player_badges := v_player_badges
              || jsonb_build_object(v_member_id::text, v_new_badges);
          END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;
      END LOOP;

      v_member_ids := NULL;
      v_team_name  := NULL;
    END LOOP;
  ELSE
    FOR v_player IN SELECT * FROM jsonb_array_elements(p_players) LOOP
      INSERT INTO public.quiz_battle_sessions (
        room_code, user_type, user_id, display_name, avatar_emoji,
        rank, score, correct_answers, total_questions,
        level, grade, subject_id, time_per_question, player_count, term,
        battle_kind, difficulty
      ) VALUES (
        p_room_code,
        v_player->>'user_type',
        CASE WHEN v_player->>'user_id' IS NOT NULL AND v_player->>'user_id' <> ''
             THEN (v_player->>'user_id')::uuid ELSE NULL END,
        COALESCE(v_player->>'display_name', ''),
        COALESCE(v_player->>'avatar_emoji', ''),
        (v_player->>'rank')::integer,
        (v_player->>'score')::integer,
        (v_player->>'correct_answers')::integer,
        p_total_questions,
        p_level, p_grade, p_subject_id, p_time_per_question, v_player_count, p_term,
        'individual', p_difficulty
      );

      IF v_player->>'user_type' = 'student'
         AND v_player->>'user_id' IS NOT NULL AND v_player->>'user_id' <> '' THEN
        v_student_id := (v_player->>'user_id')::uuid;
        BEGIN
          v_gamif := public.gamification_process_battle(v_student_id);
          v_new_badges := COALESCE((v_gamif->>'new_badges')::jsonb, '[]'::jsonb);
          IF jsonb_array_length(v_new_badges) > 0 THEN
            v_player_badges := v_player_badges
              || jsonb_build_object(v_student_id::text, v_new_badges);
          END IF;
        EXCEPTION WHEN OTHERS THEN NULL; END;
      END IF;
    END LOOP;
  END IF;

  RETURN json_build_object(
    'success', true,
    'player_count', v_player_count,
    'player_badges', v_player_badges
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_quiz_battle_results(
  text, uuid, text, text, text, integer, integer, jsonb,
  smallint, uuid, text, smallint
) TO authenticated;
