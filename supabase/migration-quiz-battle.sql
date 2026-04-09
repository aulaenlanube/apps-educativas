-- ============================================================
-- Migration: Quiz Battle statistics
-- ============================================================
-- Tabla para almacenar sesiones de Quiz Battle completadas.
-- Cada fila = una partida para un jugador.
-- El profesor también tiene un registro (role='host').

CREATE TABLE IF NOT EXISTS public.quiz_battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  -- Jugador
  user_type TEXT NOT NULL DEFAULT 'student',  -- 'student' | 'guest' | 'host'
  user_id UUID,                                -- student.id o teacher.id (NULL para guests)
  display_name TEXT NOT NULL DEFAULT '',
  avatar_emoji TEXT NOT NULL DEFAULT '',
  -- Resultado
  rank INTEGER,                                -- posicion final (1 = ganador)
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  -- Configuracion de la partida
  level TEXT,
  grade TEXT,
  subject_id TEXT,
  time_per_question INTEGER,
  player_count INTEGER,                        -- total jugadores en la sala
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qbs_user ON public.quiz_battle_sessions(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_qbs_room ON public.quiz_battle_sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_qbs_created ON public.quiz_battle_sessions(created_at DESC);

ALTER TABLE public.quiz_battle_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: cualquiera puede insertar (los students usan RPC, pero los guests no tienen auth)
CREATE POLICY "quiz_battle_insert_all" ON public.quiz_battle_sessions
  FOR INSERT WITH CHECK (true);

-- RLS: los profes autenticados pueden leer todo
CREATE POLICY "quiz_battle_select_auth" ON public.quiz_battle_sessions
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ────────────────────────────────────────────────────────────
-- RPC: guardar resultados de Quiz Battle (llamada desde el host)
-- Recibe un array JSON con los resultados de todos los jugadores
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION save_quiz_battle_results(
  p_room_code TEXT,
  p_host_id UUID,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT,
  p_time_per_question INTEGER,
  p_total_questions INTEGER,
  p_players JSONB  -- array of { user_type, user_id, display_name, avatar_emoji, rank, score, correct_answers }
) RETURNS JSON AS $$
DECLARE
  v_player JSONB;
  v_player_count INTEGER;
BEGIN
  v_player_count := jsonb_array_length(p_players);

  -- Insertar registro del host (profesor)
  INSERT INTO public.quiz_battle_sessions (
    room_code, user_type, user_id, display_name, avatar_emoji,
    rank, score, correct_answers, total_questions,
    level, grade, subject_id, time_per_question, player_count
  ) VALUES (
    p_room_code, 'host', p_host_id, '', '',
    0, 0, 0, p_total_questions,
    p_level, p_grade, p_subject_id, p_time_per_question, v_player_count
  );

  -- Insertar registro de cada jugador
  FOR v_player IN SELECT * FROM jsonb_array_elements(p_players)
  LOOP
    INSERT INTO public.quiz_battle_sessions (
      room_code, user_type, user_id, display_name, avatar_emoji,
      rank, score, correct_answers, total_questions,
      level, grade, subject_id, time_per_question, player_count
    ) VALUES (
      p_room_code,
      v_player->>'user_type',
      CASE WHEN v_player->>'user_id' IS NOT NULL AND v_player->>'user_id' != ''
           THEN (v_player->>'user_id')::UUID ELSE NULL END,
      COALESCE(v_player->>'display_name', ''),
      COALESCE(v_player->>'avatar_emoji', ''),
      (v_player->>'rank')::INTEGER,
      (v_player->>'score')::INTEGER,
      (v_player->>'correct_answers')::INTEGER,
      p_total_questions,
      p_level, p_grade, p_subject_id, p_time_per_question, v_player_count
    );
  END LOOP;

  RETURN json_build_object('success', true, 'player_count', v_player_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION save_quiz_battle_results TO authenticated;

-- ────────────────────────────────────────────────────────────
-- RPC: obtener estadísticas de Quiz Battle de un alumno
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_student_quiz_battle_stats(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_played', COUNT(*),
    'total_wins', COUNT(*) FILTER (WHERE rank = 1),
    'total_podium', COUNT(*) FILTER (WHERE rank <= 3),
    'total_correct', COALESCE(SUM(correct_answers), 0),
    'total_questions', COALESCE(SUM(total_questions), 0),
    'avg_rank', ROUND(AVG(rank)::numeric, 1),
    'avg_score', ROUND(AVG(score)::numeric, 0),
    'best_score', COALESCE(MAX(score), 0),
    'avg_accuracy', CASE WHEN SUM(total_questions) > 0
      THEN ROUND((SUM(correct_answers)::numeric / SUM(total_questions)::numeric) * 100, 1)
      ELSE 0 END
  ) INTO v_result
  FROM public.quiz_battle_sessions
  WHERE user_id = p_student_id
    AND user_type = 'student';

  RETURN COALESCE(v_result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_student_quiz_battle_stats TO authenticated, anon;

-- ────────────────────────────────────────────────────────────
-- RPC: obtener estadísticas de Quiz Battle de un profesor (host)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_teacher_quiz_battle_stats(
  p_teacher_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_hosted', COUNT(*),
    'total_players_served', COALESCE(SUM(player_count), 0),
    'avg_players', ROUND(AVG(player_count)::numeric, 1),
    'subjects_used', COUNT(DISTINCT subject_id)
  ) INTO v_result
  FROM public.quiz_battle_sessions
  WHERE user_id = p_teacher_id
    AND user_type = 'host';

  RETURN COALESCE(v_result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_teacher_quiz_battle_stats TO authenticated;

-- ────────────────────────────────────────────────────────────
-- RPC: notificar a los alumnos de un grupo que hay un Quiz Battle
-- Inserta una notificación en user_notifications para cada alumno del grupo
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_group_quiz_battle(
  p_group_id UUID,
  p_teacher_name TEXT,
  p_room_code TEXT,
  p_group_name TEXT
) RETURNS JSON AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  SELECT
    'student',
    s.id,
    'quiz_battle_invite',
    'Quiz Battle en directo!',
    p_teacher_name || ' ha creado un Quiz en vivo para ' || p_group_name || '. Codigo: ' || p_room_code,
    json_build_object('room_code', p_room_code, 'group_name', p_group_name)::jsonb
  FROM public.students s
  WHERE s.group_id = p_group_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN json_build_object('success', true, 'notified', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION notify_group_quiz_battle TO authenticated;

-- ────────────────────────────────────────────────────────────
-- Cuota mensual de Quiz Battle por profesor
-- ────────────────────────────────────────────────────────────

-- Columna en teachers: cuota mensual (default 10, admin puede cambiar)
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS quiz_battle_monthly_quota INTEGER NOT NULL DEFAULT 10;

-- RPC: consultar cuota restante del profesor en el mes actual
CREATE OR REPLACE FUNCTION get_teacher_quiz_battle_quota(
  p_teacher_id UUID
) RETURNS JSON AS $$
DECLARE
  v_quota INTEGER;
  v_used INTEGER;
BEGIN
  SELECT COALESCE(quiz_battle_monthly_quota, 10)
  INTO v_quota
  FROM public.teachers
  WHERE id = p_teacher_id;

  SELECT COUNT(*)
  INTO v_used
  FROM public.quiz_battle_sessions
  WHERE user_id = p_teacher_id
    AND user_type = 'host'
    AND created_at >= date_trunc('month', CURRENT_DATE);

  RETURN json_build_object(
    'quota', COALESCE(v_quota, 10),
    'used', COALESCE(v_used, 0),
    'remaining', GREATEST(0, COALESCE(v_quota, 10) - COALESCE(v_used, 0))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_teacher_quiz_battle_quota TO authenticated;

-- RPC admin: modificar cuota mensual de un profesor
CREATE OR REPLACE FUNCTION admin_set_quiz_battle_quota(
  p_teacher_id UUID,
  p_new_quota INTEGER
) RETURNS JSON AS $$
BEGIN
  UPDATE public.teachers
  SET quiz_battle_monthly_quota = p_new_quota
  WHERE id = p_teacher_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Teacher not found');
  END IF;

  RETURN json_build_object('success', true, 'new_quota', p_new_quota);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_set_quiz_battle_quota TO authenticated;
