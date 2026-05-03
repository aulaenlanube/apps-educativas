-- Cambio semántico en _avatar_progress: los contadores de exámenes ahora cuentan
-- APPS DISTINTAS, no sesiones totales. Objetivo: incentivar el uso de toda la
-- plataforma; antes un alumno podía sacar 50 exámenes perfectos repitiendo el
-- mismo juego, ahora necesita demostrar nota en N apps diferentes.
--
-- Tipos afectados:
--   - perfect_exams      → COUNT(DISTINCT app_id) WHERE mode='test' AND nota>=9.95
--   - high_score_exams   → COUNT(DISTINCT app_id) WHERE mode='test' AND nota>=min_nota
--   - subject_exams      → COUNT(DISTINCT app_id) WHERE mode='test' AND subject_id=X AND nota>=min_nota
--
-- El resto de tipos (app_sessions, total_sessions, unique_apps, etc) se quedan
-- igual. Los valores 'count' de avatars.json se ajustan en el siguiente commit
-- a metas alcanzables con el nuevo cómputo.

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
      -- CAMBIO: cuenta apps distintas con al menos 1 examen >= min_nota en la asignatura.
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND subject_id = v_subject_id
        AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'perfect_exams' THEN
      -- CAMBIO: cuenta apps distintas con al menos 1 examen perfecto.
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;
    WHEN 'high_score_exams' THEN
      -- CAMBIO: cuenta apps distintas con al menos 1 examen >= min_nota.
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

-- Actualiza el catálogo (avatar_definitions) con los nuevos labels y requisitos.
-- 26 avatares afectados. Los avatares ya desbloqueados por alumnos NO se revocan
-- (avatar_check_unlocks solo INSERTA en student_avatars).
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥8.5 en 6 apps distintas',
  unlock_requirement = '{"type":"high_score_exams","count":6,"min_nota":8.5}'::jsonb
  WHERE code = 'avatar_002';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9 en 8 apps distintas de Lengua',
  unlock_requirement = '{"type":"subject_exams","subject_id":"lengua","count":8,"min_nota":9}'::jsonb
  WHERE code = 'avatar_003';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba 5 exámenes de Ahorcado con nota ≥ 8',
  unlock_requirement = '{"type":"app_sessions","app_id":"ahorcado","mode":"test","count":5,"min_nota":8}'::jsonb
  WHERE code = 'avatar_006';
UPDATE public.avatar_definitions SET unlock_label = 'Consigue nota perfecta en 8 apps distintas',
  unlock_requirement = '{"type":"perfect_exams","count":8}'::jsonb
  WHERE code = 'avatar_007';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥8 en 5 apps distintas de Lengua',
  unlock_requirement = '{"type":"subject_exams","subject_id":"lengua","count":5,"min_nota":8}'::jsonb
  WHERE code = 'avatar_013';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥8 en 5 apps distintas de Sociales',
  unlock_requirement = '{"type":"subject_exams","subject_id":"sociales","count":5,"min_nota":8}'::jsonb
  WHERE code = 'avatar_025';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥7 en 5 apps distintas',
  unlock_requirement = '{"type":"high_score_exams","count":5,"min_nota":7}'::jsonb
  WHERE code = 'avatar_028';
UPDATE public.avatar_definitions SET unlock_label = 'Completa 5 misiones de Robótica',
  unlock_requirement = '{"type":"app_sessions","app_id":"misiones-roboticas","count":5}'::jsonb
  WHERE code = 'avatar_035';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥7 en 6 apps distintas',
  unlock_requirement = '{"type":"high_score_exams","count":6,"min_nota":7}'::jsonb
  WHERE code = 'avatar_036';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥8 en 5 apps distintas de Naturales',
  unlock_requirement = '{"type":"subject_exams","subject_id":"naturales","count":5,"min_nota":8}'::jsonb
  WHERE code = 'avatar_038';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥8 en 6 apps distintas de Matemáticas',
  unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":6,"min_nota":8}'::jsonb
  WHERE code = 'avatar_039';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9 en 5 apps distintas de Matemáticas',
  unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":5,"min_nota":9}'::jsonb
  WHERE code = 'avatar_049';
UPDATE public.avatar_definitions SET unlock_label = 'Consigue nota perfecta en 5 apps distintas de Naturales',
  unlock_requirement = '{"type":"subject_exams","subject_id":"naturales","count":5,"min_nota":9.5}'::jsonb
  WHERE code = 'avatar_050';
UPDATE public.avatar_definitions SET unlock_label = 'Consigue nota perfecta en 30 apps distintas',
  unlock_requirement = '{"type":"perfect_exams","count":30}'::jsonb
  WHERE code = 'avatar_051';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9 en 10 apps distintas',
  unlock_requirement = '{"type":"high_score_exams","count":10,"min_nota":9}'::jsonb
  WHERE code = 'avatar_053';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9.5 en 8 apps distintas de Matemáticas',
  unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":8,"min_nota":9.5}'::jsonb
  WHERE code = 'avatar_054';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9.5 en 9 apps distintas de Matemáticas',
  unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":9,"min_nota":9.5}'::jsonb
  WHERE code = 'avatar_055';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba 4 apps distintas de Plástica',
  unlock_requirement = '{"type":"subject_exams","subject_id":"plastica","count":4}'::jsonb
  WHERE code = 'avatar_056';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9 en 5 apps distintas de Lengua',
  unlock_requirement = '{"type":"subject_exams","subject_id":"lengua","count":5,"min_nota":9}'::jsonb
  WHERE code = 'avatar_059';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9.5 en 10 apps distintas de Naturales',
  unlock_requirement = '{"type":"subject_exams","subject_id":"naturales","count":10,"min_nota":9.5}'::jsonb
  WHERE code = 'avatar_060';
UPDATE public.avatar_definitions SET unlock_label = 'Juega a 50 apps distintas de la plataforma',
  unlock_requirement = '{"type":"unique_apps","count":50}'::jsonb
  WHERE code = 'avatar_061';
UPDATE public.avatar_definitions SET unlock_label = 'Consigue nota perfecta en 20 apps distintas',
  unlock_requirement = '{"type":"perfect_exams","count":20}'::jsonb
  WHERE code = 'avatar_069';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9.5 en 6 apps distintas',
  unlock_requirement = '{"type":"high_score_exams","count":6,"min_nota":9.5}'::jsonb
  WHERE code = 'avatar_070';
UPDATE public.avatar_definitions SET unlock_label = 'Consigue nota perfecta en 12 apps distintas',
  unlock_requirement = '{"type":"perfect_exams","count":12}'::jsonb
  WHERE code = 'avatar_092';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥8 en 6 apps distintas',
  unlock_requirement = '{"type":"high_score_exams","count":6,"min_nota":8}'::jsonb
  WHERE code = 'avatar_094';
UPDATE public.avatar_definitions SET unlock_label = 'Aprueba con ≥9 en 7 apps distintas de Naturales',
  unlock_requirement = '{"type":"subject_exams","subject_id":"naturales","count":7,"min_nota":9}'::jsonb
  WHERE code = 'avatar_099';
