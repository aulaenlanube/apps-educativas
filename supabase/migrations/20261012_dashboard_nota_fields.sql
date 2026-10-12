-- Paneles: devolver las notas que la interfaz ya muestra (rediseño 2026).
-- Solo AÑADE campos; el resto del resultado, la seguridad y los parámetros no cambian.
--   student_get_dashboard:   stats.best_nota, stats.avg_test_nota,
--                            apps_detail[].best_nota / best_test_nota,
--                            recent_sessions[].nota
--   teacher_get_student_stats: lo mismo + apps_detail/recent_sessions con
--                            level, grade, subject_id (las apps se agrupan por
--                            app + curso + asignatura, como en el panel del alumno).
-- Antes, "Mejor nota" salía —/10, la nota del Historial vacía y "Tus apps más
-- jugadas" no podía enseñar la nota.

CREATE OR REPLACE FUNCTION public.student_get_dashboard(p_student_id uuid, p_group_id uuid, p_session_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sid uuid;
  v_student RECORD;
  v_stats JSON;
  v_apps_detail JSON;
  v_recent_sessions JSON;
  v_daily_activity JSON;
  v_by_subject JSON;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN json_build_object('error', 'Sesion expirada o invalida');
  END IF;

  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.group_id,
         s.created_at, g.name as group_name, g.group_code
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id AND s.group_id = p_group_id;

  IF NOT FOUND THEN RETURN json_build_object('error', 'Alumno no encontrado'); END IF;

  SELECT json_build_object(
    'total_sessions', COUNT(*),
    'total_time_seconds', COALESCE(SUM(duration_seconds), 0),
    'total_score', COALESCE(SUM(score), 0),
    'total_correct', COALESCE(SUM(correct_answers), 0),
    'total_questions', COALESCE(SUM(total_questions), 0),
    'avg_accuracy', CASE WHEN SUM(total_questions) > 0
      THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1) ELSE 0 END,
    'apps_played', COUNT(DISTINCT app_id),
    'practice_sessions', COUNT(*) FILTER (WHERE mode = 'practice'),
    'test_sessions', COUNT(*) FILTER (WHERE mode = 'test'),
    'avg_practice_score', COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'practice')), 0),
    'avg_test_score', COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0),
    'best_score', COALESCE(MAX(score), 0),
    'best_nota', ROUND(MAX(nota), 1),
    'avg_test_nota', ROUND(AVG(nota) FILTER (WHERE mode = 'test'), 1),
    'longest_session_seconds', COALESCE(MAX(duration_seconds), 0),
    'first_activity', MIN(created_at),
    'last_activity', MAX(created_at),
    'days_active', COUNT(DISTINCT DATE(created_at))
  ) INTO v_stats
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student';

  SELECT json_agg(a ORDER BY a.total_plays DESC) INTO v_apps_detail FROM (
    SELECT app_id, app_name, COUNT(*) as total_plays,
      COUNT(*) FILTER (WHERE mode = 'practice') as practice_plays,
      COUNT(*) FILTER (WHERE mode = 'test') as test_plays,
      COALESCE(ROUND(AVG(score)), 0) as avg_score,
      COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'practice')), 0) as avg_practice_score,
      COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0) as avg_test_score,
      COALESCE(MAX(score), 0) as best_score,
      COALESCE(MAX(score) FILTER (WHERE mode = 'test'), 0) as best_test_score,
      ROUND(MAX(nota), 1) as best_nota,
      ROUND(MAX(nota) FILTER (WHERE mode = 'test'), 1) as best_test_nota,
      COALESCE(SUM(correct_answers), 0) as total_correct,
      COALESCE(SUM(total_questions), 0) as total_questions,
      CASE WHEN SUM(total_questions) > 0
        THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1) ELSE 0 END as accuracy,
      COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
      COALESCE(ROUND(AVG(duration_seconds)), 0) as avg_duration_seconds,
      MAX(created_at) as last_played, level, grade, subject_id
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    GROUP BY app_id, app_name, level, grade, subject_id
  ) a;

  SELECT json_agg(s) INTO v_recent_sessions FROM (
    SELECT app_id, app_name, level, grade, subject_id, mode,
           score, max_score, correct_answers, total_questions, nota,
           duration_seconds, completed, created_at
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    ORDER BY created_at DESC LIMIT 20
  ) s;

  SELECT json_agg(d ORDER BY d.day) INTO v_daily_activity FROM (
    SELECT DATE(created_at) as day, COUNT(*) as sessions,
           COALESCE(SUM(duration_seconds), 0) as total_seconds
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
  ) d;

  SELECT json_agg(sub) INTO v_by_subject FROM (
    SELECT subject_id, COUNT(*) as total_plays,
           COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
           COALESCE(ROUND(AVG(score)), 0) as avg_score,
           CASE WHEN SUM(total_questions) > 0
             THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1) ELSE 0 END as accuracy
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student' AND subject_id IS NOT NULL
    GROUP BY subject_id ORDER BY total_plays DESC
  ) sub;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id, 'username', v_student.username,
      'display_name', v_student.display_name, 'avatar_emoji', v_student.avatar_emoji,
      'group_name', v_student.group_name, 'created_at', v_student.created_at
    ),
    'stats', v_stats,
    'apps_detail', COALESCE(v_apps_detail, '[]'::json),
    'recent_sessions', COALESCE(v_recent_sessions, '[]'::json),
    'daily_activity', COALESCE(v_daily_activity, '[]'::json),
    'by_subject', COALESCE(v_by_subject, '[]'::json)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.teacher_get_student_stats(p_student_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_student RECORD;
  v_stats JSON;
  v_apps_detail JSON;
  v_recent JSON;
BEGIN
  -- Verificar que el alumno pertenece a un grupo del docente (propietario o co-docente)
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.group_id,
         s.created_at, g.name as group_name
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id
    AND is_teacher_of_group(auth.uid(), s.group_id);

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  -- Stats generales
  SELECT json_build_object(
    'total_sessions', COUNT(*),
    'total_time_seconds', COALESCE(SUM(duration_seconds), 0),
    'total_correct', COALESCE(SUM(correct_answers), 0),
    'total_questions', COALESCE(SUM(total_questions), 0),
    'avg_accuracy', CASE
      WHEN SUM(total_questions) > 0
      THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
      ELSE 0
    END,
    'apps_played', COUNT(DISTINCT app_id),
    'practice_sessions', COUNT(*) FILTER (WHERE mode = 'practice'),
    'test_sessions', COUNT(*) FILTER (WHERE mode = 'test'),
    'avg_practice_score', COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'practice')), 0),
    'avg_test_score', COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0),
    'best_score', COALESCE(MAX(score), 0),
    'best_nota', ROUND(MAX(nota), 1),
    'avg_test_nota', ROUND(AVG(nota) FILTER (WHERE mode = 'test'), 1),
    'days_active', COUNT(DISTINCT DATE(created_at)),
    'last_activity', MAX(created_at)
  ) INTO v_stats
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student';

  -- Detalle por app (app + curso + asignatura)
  SELECT json_agg(a ORDER BY a.total_plays DESC) INTO v_apps_detail FROM (
    SELECT app_id, app_name, level, grade, subject_id,
      COUNT(*) as total_plays,
      COUNT(*) FILTER (WHERE mode = 'practice') as practice_plays,
      COUNT(*) FILTER (WHERE mode = 'test') as test_plays,
      COALESCE(ROUND(AVG(score)), 0) as avg_score,
      COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0) as avg_test_score,
      COALESCE(MAX(score), 0) as best_score,
      COALESCE(MAX(score) FILTER (WHERE mode = 'test'), 0) as best_test_score,
      ROUND(MAX(nota), 1) as best_nota,
      ROUND(MAX(nota) FILTER (WHERE mode = 'test'), 1) as best_test_nota,
      CASE WHEN SUM(total_questions) > 0
        THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
        ELSE 0 END as accuracy,
      COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
      MAX(created_at) as last_played
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    GROUP BY app_id, app_name, level, grade, subject_id
  ) a;

  -- Ultimas 15 sesiones
  SELECT json_agg(s) INTO v_recent FROM (
    SELECT app_id, app_name, level, grade, subject_id, mode, score, max_score,
           correct_answers, total_questions, nota, duration_seconds, created_at
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    ORDER BY created_at DESC LIMIT 15
  ) s;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'avatar_emoji', v_student.avatar_emoji,
      'group_name', v_student.group_name,
      'created_at', v_student.created_at
    ),
    'stats', v_stats,
    'apps_detail', COALESCE(v_apps_detail, '[]'::json),
    'recent_sessions', COALESCE(v_recent, '[]'::json)
  );
END;
$function$;
