-- Bug: en _teacher_avatar_progress, el branch ELSE (tipos que no aplican a docentes:
-- duels_won, top_class, top_global) reseteaba v_target := 1, así que la galería del
-- profe mostraba "0/1" en avatares como Goku (Gana 101 duelos) en lugar de "0/101".
--
-- Fix: en el ELSE, dejar el target tal como viene del requisito (count) para que la
-- barra muestre la meta real aunque el progreso del docente sea siempre 0 en estos
-- tipos. Para 'top_class' / 'top_global' el campo es 'position' (no 'count'), así
-- que se usa COALESCE de ambos para no romper esos casos.

CREATE OR REPLACE FUNCTION public._teacher_avatar_progress(
  p_teacher_id uuid,
  p_requirement jsonb
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text := p_requirement->>'type';
  v_target int := COALESCE(NULLIF(p_requirement->>'count','')::int, 1);
  v_progress int := 0;
  v_app_id text := p_requirement->>'app_id';
  v_mode text := p_requirement->>'mode';
  v_min_nota numeric := COALESCE((p_requirement->>'min_nota')::numeric, 0);
  v_subject_id text := p_requirement->>'subject_id';
  v_position int;
BEGIN
  IF p_requirement IS NULL OR p_requirement = '{}'::jsonb THEN
    RETURN jsonb_build_object('progress', 0, 'target', 1, 'pct', 0);
  END IF;

  CASE v_type
    WHEN 'first_session' THEN
      v_target := 1;
      SELECT LEAST(1, COUNT(*)) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true;

    WHEN 'total_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'unique_apps' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode);

    WHEN 'app_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND app_id = v_app_id
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'subject_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND subject_id = v_subject_id
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'perfect_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;

    WHEN 'high_score_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'badges_count' THEN
      SELECT COUNT(*) INTO v_progress
      FROM teacher_badges WHERE teacher_id = p_teacher_id;

    WHEN 'level' THEN
      v_target := COALESCE((p_requirement->>'value')::int, 1);
      SELECT COALESCE(level, 1) INTO v_progress
      FROM teacher_xp WHERE teacher_id = p_teacher_id;

    WHEN 'xp' THEN
      v_target := COALESCE((p_requirement->>'amount')::int, 1);
      SELECT COALESCE(total_xp, 0) INTO v_progress
      FROM teacher_xp WHERE teacher_id = p_teacher_id;

    WHEN 'battles_won' THEN
      v_position := COALESCE((p_requirement->>'position')::int, 1);
      SELECT COUNT(*) INTO v_progress
      FROM quiz_battle_sessions
      WHERE user_type='teacher' AND user_id = p_teacher_id
        AND COALESCE(rank, 99) <= v_position
        AND COALESCE(player_count, 0) >= 2;

    WHEN 'streak_days' THEN
      WITH daily AS (
        SELECT DISTINCT DATE(created_at) AS play_date
        FROM game_sessions
        WHERE user_type='teacher' AND user_id = p_teacher_id AND completed=true
      ),
      grouped AS (
        SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp
        FROM daily
      )
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (SELECT COUNT(*) AS c FROM grouped GROUP BY grp) s;

    WHEN 'apps_rated' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM app_ratings
      WHERE user_type = 'teacher' AND user_id = p_teacher_id;

    WHEN 'feedback_messages' THEN
      SELECT COUNT(*) INTO v_progress
      FROM app_feedback_messages
      WHERE sender_type = 'teacher' AND sender_id = p_teacher_id;

    -- duels_won, top_class, top_global no aplican a docentes → progress 0
    -- pero conservamos el target real (count o position) para que la barra
    -- muestre la meta correcta en lugar del placeholder "0/1".
    ELSE
      v_target := COALESCE(
        NULLIF(p_requirement->>'count','')::int,
        NULLIF(p_requirement->>'position','')::int,
        1
      );
      v_progress := 0;
  END CASE;

  v_progress := COALESCE(v_progress, 0);
  IF v_target IS NULL OR v_target < 1 THEN v_target := 1; END IF;

  RETURN jsonb_build_object(
    'progress', LEAST(v_progress, v_target),
    'target', v_target,
    'pct', ROUND(LEAST(100, (v_progress::numeric / v_target * 100))::numeric)::int
  );
END;
$$;
