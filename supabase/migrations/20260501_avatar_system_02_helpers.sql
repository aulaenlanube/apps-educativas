-- =====================================================
-- AVATAR SYSTEM — paso 2: helpers (progreso y bonus)
-- =====================================================

-- Calcula progreso/objetivo de un requisito de desbloqueo para un alumno.
-- Devuelve jsonb con: progress, target, pct.
CREATE OR REPLACE FUNCTION public._avatar_progress(
  p_student_id uuid,
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
      WHERE user_type='student' AND user_id=p_student_id AND completed=true;

    WHEN 'total_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'unique_apps' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode);

    WHEN 'app_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND app_id = v_app_id
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'subject_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND subject_id = v_subject_id
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'perfect_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;

    WHEN 'high_score_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'badges_count' THEN
      SELECT COUNT(*) INTO v_progress
      FROM student_badges WHERE student_id = p_student_id;

    WHEN 'level' THEN
      v_target := COALESCE((p_requirement->>'value')::int, 1);
      SELECT COALESCE(level, 1) INTO v_progress
      FROM student_xp WHERE student_id = p_student_id;

    WHEN 'xp' THEN
      v_target := COALESCE((p_requirement->>'amount')::int, 1);
      SELECT COALESCE(total_xp, 0) INTO v_progress
      FROM student_xp WHERE student_id = p_student_id;

    WHEN 'duels_won' THEN
      SELECT COUNT(*) INTO v_progress
      FROM duels
      WHERE winner_id = p_student_id AND status = 'finished';

    WHEN 'battles_won' THEN
      v_position := COALESCE((p_requirement->>'position')::int, 1);
      SELECT COUNT(*) INTO v_progress
      FROM quiz_battle_sessions
      WHERE user_type='student' AND user_id = p_student_id
        AND COALESCE(rank, 99) <= v_position
        AND COALESCE(player_count, 0) >= 2;

    WHEN 'top_class' THEN
      v_target := 1;
      v_position := COALESCE((p_requirement->>'position')::int, 3);
      SELECT CASE WHEN COALESCE(MIN(class_rank), 99) <= v_position THEN 1 ELSE 0 END
      INTO v_progress
      FROM user_ranking_achievements
      WHERE user_type='student' AND user_id = p_student_id AND class_rank IS NOT NULL;
      v_progress := COALESCE(v_progress, 0);

    WHEN 'top_global' THEN
      v_target := 1;
      v_position := COALESCE((p_requirement->>'position')::int, 1);
      SELECT CASE WHEN COALESCE(MIN(global_rank), 99) <= v_position THEN 1 ELSE 0 END
      INTO v_progress
      FROM user_ranking_achievements
      WHERE user_type='student' AND user_id = p_student_id AND global_rank IS NOT NULL;
      v_progress := COALESCE(v_progress, 0);

    WHEN 'streak_days' THEN
      WITH daily AS (
        SELECT DISTINCT DATE(created_at) AS play_date
        FROM game_sessions
        WHERE user_type='student' AND user_id = p_student_id AND completed=true
      ),
      grouped AS (
        SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp
        FROM daily
      )
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (SELECT COUNT(*) AS c FROM grouped GROUP BY grp) s;

    ELSE
      v_target := 1;
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

-- Bonus de avatares para nota: suma points_bonus de los avatares desbloqueados,
-- capado a +0.50.
CREATE OR REPLACE FUNCTION public._avatar_bonus(p_student_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ROUND(LEAST(0.5, COALESCE(SUM(a.points_bonus), 0))::numeric, 3)
  FROM student_avatars sa
  JOIN avatar_definitions a ON a.id = sa.avatar_id
  WHERE sa.student_id = p_student_id AND a.active = true;
$$;
