-- ============================================================
-- Migracion: Dashboard del alumno - Estadisticas detalladas
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- 0. Eliminar versiones anteriores con firma distinta (si existen)
DROP FUNCTION IF EXISTS student_get_dashboard(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS student_update_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 1. Funcion: obtener estadisticas completas del alumno
-- No requiere auth de Supabase (students usan auth custom)
-- Verificacion por student_id + group_id (ambos disponibles en sesion localStorage)
CREATE OR REPLACE FUNCTION student_get_dashboard(
  p_student_id UUID,
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_stats JSON;
  v_apps_detail JSON;
  v_recent_sessions JSON;
  v_daily_activity JSON;
  v_by_subject JSON;
BEGIN
  -- Verificar identidad del alumno
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.group_id,
         s.created_at, g.name as group_name, g.group_code
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id
    AND s.group_id = p_group_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  -- Estadisticas generales
  SELECT json_build_object(
    'total_sessions', COUNT(*),
    'total_time_seconds', COALESCE(SUM(duration_seconds), 0),
    'total_score', COALESCE(SUM(score), 0),
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
    'longest_session_seconds', COALESCE(MAX(duration_seconds), 0),
    'first_activity', MIN(created_at),
    'last_activity', MAX(created_at),
    'days_active', COUNT(DISTINCT DATE(created_at))
  ) INTO v_stats
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student';

  -- Detalle por app
  SELECT json_agg(a ORDER BY a.total_plays DESC) INTO v_apps_detail FROM (
    SELECT
      app_id,
      app_name,
      COUNT(*) as total_plays,
      COUNT(*) FILTER (WHERE mode = 'practice') as practice_plays,
      COUNT(*) FILTER (WHERE mode = 'test') as test_plays,
      COALESCE(ROUND(AVG(score)), 0) as avg_score,
      COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'practice')), 0) as avg_practice_score,
      COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0) as avg_test_score,
      COALESCE(MAX(score), 0) as best_score,
      COALESCE(MAX(score) FILTER (WHERE mode = 'test'), 0) as best_test_score,
      COALESCE(SUM(correct_answers), 0) as total_correct,
      COALESCE(SUM(total_questions), 0) as total_questions,
      CASE
        WHEN SUM(total_questions) > 0
        THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
        ELSE 0
      END as accuracy,
      COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
      COALESCE(ROUND(AVG(duration_seconds)), 0) as avg_duration_seconds,
      MAX(created_at) as last_played,
      level,
      grade,
      subject_id
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    GROUP BY app_id, app_name, level, grade, subject_id
  ) a;

  -- Ultimas 20 sesiones
  SELECT json_agg(s) INTO v_recent_sessions FROM (
    SELECT app_id, app_name, level, grade, subject_id, mode,
           score, max_score, correct_answers, total_questions,
           duration_seconds, completed, created_at
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    ORDER BY created_at DESC
    LIMIT 20
  ) s;

  -- Actividad diaria (ultimos 30 dias)
  SELECT json_agg(d ORDER BY d.day) INTO v_daily_activity FROM (
    SELECT DATE(created_at) as day,
           COUNT(*) as sessions,
           COALESCE(SUM(duration_seconds), 0) as total_seconds
    FROM public.game_sessions
    WHERE user_id = p_student_id
      AND user_type = 'student'
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
  ) d;

  -- Estadisticas por asignatura
  SELECT json_agg(sub) INTO v_by_subject FROM (
    SELECT subject_id,
           COUNT(*) as total_plays,
           COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
           COALESCE(ROUND(AVG(score)), 0) as avg_score,
           CASE
             WHEN SUM(total_questions) > 0
             THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
             ELSE 0
           END as accuracy
    FROM public.game_sessions
    WHERE user_id = p_student_id
      AND user_type = 'student'
      AND subject_id IS NOT NULL
    GROUP BY subject_id
    ORDER BY total_plays DESC
  ) sub;

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
    'recent_sessions', COALESCE(v_recent_sessions, '[]'::json),
    'daily_activity', COALESCE(v_daily_activity, '[]'::json),
    'by_subject', COALESCE(v_by_subject, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Funcion: alumno actualiza su perfil (emoji y contrasena)
CREATE OR REPLACE FUNCTION student_update_profile(
  p_student_id UUID,
  p_group_id UUID,
  p_avatar_emoji TEXT DEFAULT NULL,
  p_new_password TEXT DEFAULT NULL,
  p_current_password TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
BEGIN
  SELECT s.id, s.password_hash, s.avatar_emoji
  INTO v_student
  FROM public.students s
  WHERE s.id = p_student_id
    AND s.group_id = p_group_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  -- Actualizar emoji si se proporciona
  IF p_avatar_emoji IS NOT NULL THEN
    UPDATE public.students
    SET avatar_emoji = p_avatar_emoji, updated_at = now()
    WHERE id = p_student_id;
  END IF;

  -- Cambiar contrasena si se proporciona
  IF p_new_password IS NOT NULL THEN
    -- Verificar contrasena actual
    IF v_student.password_hash IS NOT NULL THEN
      IF p_current_password IS NULL OR
         v_student.password_hash != crypt(p_current_password, v_student.password_hash) THEN
        RETURN json_build_object('error', 'Contrasena actual incorrecta');
      END IF;
    END IF;

    IF length(p_new_password) < 4 THEN
      RETURN json_build_object('error', 'La contrasena debe tener al menos 4 caracteres');
    END IF;

    UPDATE public.students
    SET password_hash = crypt(p_new_password, gen_salt('bf')), updated_at = now()
    WHERE id = p_student_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Permisos
GRANT EXECUTE ON FUNCTION student_get_dashboard TO anon, authenticated;
GRANT EXECUTE ON FUNCTION student_update_profile TO anon, authenticated;
