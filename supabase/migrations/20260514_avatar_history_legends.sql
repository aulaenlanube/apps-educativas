-- Endurece los requisitos de los 4 avatares "leyendas históricas":
--   - avatar_069 Einstein  → nota perfecta en 101 apps distintas
--   - avatar_060 M. Curie  → nota perfecta en 50 apps distintas de Naturales/Biología
--   - avatar_052 Da Vinci  → 101 insignias
--   - avatar_051 Cleopatra → racha de 101 días seguidos jugando
--
-- El requisito de Marie Curie obliga a soportar varias asignaturas en `subject_exams`
-- (ciencias-naturales en Primaria + biologia en ESO/Bachillerato), porque ahora mismo
-- el campo `subject_id` solo aceptaba un id literal y "naturales" ni siquiera está
-- en materias.json (era un id muerto que ningún examen real cumplía).
--
-- Por eso se extiende _avatar_progress: si el requisito trae `subject_ids` (array),
-- se cuenta cualquier asignatura de la lista. Si solo trae `subject_id` (string),
-- comportamiento idéntico al actual — retrocompatible con los avatares ya existentes.

CREATE OR REPLACE FUNCTION public._avatar_progress(p_student_id uuid, p_requirement jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_type text := p_requirement->>'type';
  v_target int := COALESCE(NULLIF(p_requirement->>'count','')::int, 1);
  v_progress int := 0;
  v_app_id text := p_requirement->>'app_id';
  v_mode text := p_requirement->>'mode';
  v_min_nota numeric := COALESCE((p_requirement->>'min_nota')::numeric, 0);
  v_subject_id text := p_requirement->>'subject_id';
  v_subject_ids text[] := CASE
    WHEN jsonb_typeof(p_requirement->'subject_ids') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(p_requirement->'subject_ids'))
    ELSE NULL
  END;
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
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test'
        AND (
          (v_subject_ids IS NOT NULL AND subject_id = ANY(v_subject_ids))
          OR (v_subject_ids IS NULL AND subject_id = v_subject_id)
        )
        AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'perfect_exams' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;
    WHEN 'high_score_exams' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
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
    WHEN 'apps_rated' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM app_ratings
      WHERE user_type = 'student' AND user_id = p_student_id;
    WHEN 'feedback_messages' THEN
      SELECT COUNT(*) INTO v_progress
      FROM app_feedback_messages
      WHERE sender_type = 'student' AND sender_id = p_student_id;
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
$function$;

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue nota perfecta en 101 apps distintas',
    unlock_requirement = '{"type":"perfect_exams","count":101}'::jsonb
WHERE code = 'avatar_069';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue nota perfecta en 50 apps distintas de Naturales o Biología',
    unlock_requirement = '{"type":"subject_exams","subject_ids":["ciencias-naturales","biologia"],"count":50,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_060';

UPDATE public.avatar_definitions
SET unlock_label = 'Desbloquea 101 insignias',
    unlock_requirement = '{"type":"badges_count","count":101}'::jsonb
WHERE code = 'avatar_052';

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 101 días seguidos jugando',
    unlock_requirement = '{"type":"streak_days","count":101}'::jsonb
WHERE code = 'avatar_051';
