-- Fix: las criterios "apps distintas" deben considerar la combinación
-- (app_id, level, grade, subject_id), no sólo app_id.
--
-- Motivación: hay apps con un único app_id que se juegan en múltiples
-- cursos/asignaturas (ej: busca-el-intruso, ordena-la-frase, rosco-del-saber,
-- millonario, ahorcado, ...). Con `COUNT(DISTINCT app_id)`, un alumno que
-- saque 10 en busca-el-intruso de 1ºPrim Lengua y otro 10 en busca-el-intruso
-- de 2ºPrim Inglés sumaba 1 al contador de perfect_exams, no 2.
--
-- Consecuencia real: avatares como Einstein (perfect_exams=101) o El Pulga
-- Mágico (perfect_exams=50) eran matemáticamente inalcanzables porque hay
-- ~50-60 app_id únicos en el catálogo total.
--
-- Tipos afectados: unique_apps, subject_exams, perfect_exams,
-- high_score_exams (en ambas funciones, alumno y docente). Los demás
-- (app_sessions, total_sessions, same_app_*, fast_exams, etc.) cuentan
-- sesiones individuales, no apps distintas, y no necesitan cambio.

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
  v_max_seconds int := COALESCE(NULLIF(p_requirement->>'max_seconds','')::int, 0);
  v_subject_id text := p_requirement->>'subject_id';
  v_subject_ids text[] := CASE
    WHEN jsonb_typeof(p_requirement->'subject_ids') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(p_requirement->'subject_ids'))
    ELSE NULL
  END;
  v_position int;
  v_sub jsonb;
  v_sub_result jsonb;
  v_sum_target int := 0;
  v_sum_progress int := 0;
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
      -- Distinto = app_id × curso × asignatura. Un alumno que juegue Rosco
      -- de Lengua 1º y Rosco de Mates 1º suma 2.
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
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
      -- Dentro de una asignatura, cuenta cada (app, curso) distinto.
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test'
        AND (
          (v_subject_ids IS NOT NULL AND subject_id = ANY(v_subject_ids))
          OR (v_subject_ids IS NULL AND subject_id = v_subject_id)
        )
        AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'perfect_exams' THEN
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;
    WHEN 'high_score_exams' THEN
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'same_app_perfect_exams' THEN
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (
        SELECT app_id, COUNT(*) AS c
        FROM game_sessions
        WHERE user_type='student' AND user_id=p_student_id AND completed=true
          AND mode='test' AND COALESCE(nota, 0) >= 9.95
        GROUP BY app_id
      ) s;
    WHEN 'same_app_sessions' THEN
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (
        SELECT app_id, COUNT(*) AS c
        FROM game_sessions
        WHERE user_type='student' AND user_id=p_student_id AND completed=true
          AND (v_mode IS NULL OR mode = v_mode)
          AND COALESCE(nota, 0) >= v_min_nota
        GROUP BY app_id
      ) s;
    WHEN 'fast_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test'
        AND duration_seconds IS NOT NULL
        AND duration_seconds > 0
        AND duration_seconds <= v_max_seconds
        AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'combined' THEN
      IF jsonb_typeof(p_requirement->'requirements') = 'array' THEN
        FOR v_sub IN SELECT * FROM jsonb_array_elements(p_requirement->'requirements')
        LOOP
          v_sub_result := public._avatar_progress(p_student_id, v_sub);
          v_sum_target := v_sum_target + COALESCE((v_sub_result->>'target')::int, 1);
          v_sum_progress := v_sum_progress + COALESCE((v_sub_result->>'progress')::int, 0);
        END LOOP;
        v_target := GREATEST(v_sum_target, 1);
        v_progress := v_sum_progress;
      ELSE
        v_target := 1;
        v_progress := 0;
      END IF;
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


CREATE OR REPLACE FUNCTION public._teacher_avatar_progress(p_teacher_id uuid, p_requirement jsonb)
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
  v_max_seconds int := COALESCE(NULLIF(p_requirement->>'max_seconds','')::int, 0);
  v_subject_id text := p_requirement->>'subject_id';
  v_subject_ids text[] := CASE
    WHEN jsonb_typeof(p_requirement->'subject_ids') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(p_requirement->'subject_ids'))
    ELSE NULL
  END;
  v_position int;
  v_sub jsonb;
  v_sub_result jsonb;
  v_sum_target int := 0;
  v_sum_progress int := 0;
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
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
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
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test'
        AND (
          (v_subject_ids IS NOT NULL AND subject_id = ANY(v_subject_ids))
          OR (v_subject_ids IS NULL AND subject_id = v_subject_id)
        )
        AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'perfect_exams' THEN
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;
    WHEN 'high_score_exams' THEN
      SELECT COUNT(DISTINCT (app_id, level, grade, subject_id)) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'same_app_perfect_exams' THEN
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (
        SELECT app_id, COUNT(*) AS c
        FROM game_sessions
        WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
          AND mode='test' AND COALESCE(nota, 0) >= 9.95
        GROUP BY app_id
      ) s;
    WHEN 'same_app_sessions' THEN
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (
        SELECT app_id, COUNT(*) AS c
        FROM game_sessions
        WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
          AND (v_mode IS NULL OR mode = v_mode)
          AND COALESCE(nota, 0) >= v_min_nota
        GROUP BY app_id
      ) s;
    WHEN 'fast_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test'
        AND duration_seconds IS NOT NULL
        AND duration_seconds > 0
        AND duration_seconds <= v_max_seconds
        AND COALESCE(nota, 0) >= v_min_nota;
    WHEN 'combined' THEN
      IF jsonb_typeof(p_requirement->'requirements') = 'array' THEN
        FOR v_sub IN SELECT * FROM jsonb_array_elements(p_requirement->'requirements')
        LOOP
          v_sub_result := public._teacher_avatar_progress(p_teacher_id, v_sub);
          v_sum_target := v_sum_target + COALESCE((v_sub_result->>'target')::int, 1);
          v_sum_progress := v_sum_progress + COALESCE((v_sub_result->>'progress')::int, 0);
        END LOOP;
        v_target := GREATEST(v_sum_target, 1);
        v_progress := v_sum_progress;
      ELSE
        v_target := 1;
        v_progress := 0;
      END IF;
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
