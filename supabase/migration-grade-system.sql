-- ============================================================
-- Migracion: Sistema de Notas Estandarizado (0-10)
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Añadir columna 'nota' a game_sessions (nota 0.0 - 10.0)
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS nota NUMERIC(3,1) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_game_sessions_nota ON public.game_sessions(nota);

-- 2. Rellenar nota para sesiones existentes que tengan datos validos
UPDATE public.game_sessions
SET nota = LEAST(10, ROUND(
  CASE
    WHEN total_questions > 0 THEN (correct_answers::numeric / total_questions) * 10
    WHEN max_score > 0 THEN (score::numeric / max_score) * 10
    ELSE 0
  END, 1
))
WHERE nota IS NULL
  AND (total_questions > 0 OR max_score > 0);

-- 3. Actualizar student_get_assignments: comparar por nota en vez de score
CREATE OR REPLACE FUNCTION student_get_assignments(
  p_student_id UUID,
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id
  ) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  SELECT json_agg(a ORDER BY a.created_at DESC) INTO v_result FROM (
    SELECT
      asg.id,
      asg.app_id,
      asg.app_name,
      asg.level,
      asg.grade,
      asg.subject_id,
      asg.min_score,
      asg.title,
      asg.description,
      asg.due_date,
      asg.created_at,
      asg.student_id IS NOT NULL as is_individual,
      -- Mejor nota del alumno DESPUES de que se creo esta tarea especifica
      best.best_nota,
      best.best_score,
      best.attempts,
      best.last_attempt,
      -- Completado solo con sesiones posteriores a la creacion de la tarea
      COALESCE(best.best_nota, 0) >= asg.min_score as completed
    FROM public.assignments asg
    LEFT JOIN LATERAL (
      SELECT
        MAX(nota) as best_nota,
        MAX(score) as best_score,
        COUNT(*) as attempts,
        MAX(created_at) as last_attempt
      FROM public.game_sessions
      WHERE user_id = p_student_id
        AND user_type = 'student'
        AND mode = 'test'
        AND app_id = asg.app_id
        AND created_at >= asg.created_at
    ) best ON true
    WHERE asg.group_id = p_group_id
      AND (asg.student_id IS NULL OR asg.student_id = p_student_id)
  ) a;

  RETURN json_build_object(
    'success', true,
    'assignments', COALESCE(v_result, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Actualizar teacher_get_assignments_progress: usar nota
CREATE OR REPLACE FUNCTION teacher_get_assignments_progress(
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.groups WHERE id = p_group_id AND teacher_id = auth.uid()
  ) THEN
    RETURN json_build_object('error', 'Grupo no encontrado');
  END IF;

  SELECT json_agg(a ORDER BY a.created_at DESC) INTO v_result FROM (
    SELECT
      asg.id,
      asg.app_id,
      asg.app_name,
      asg.min_score,
      asg.title,
      asg.description,
      asg.due_date,
      asg.created_at,
      asg.student_id,
      st.display_name as student_name,
      (
        SELECT COUNT(DISTINCT gs.user_id)
        FROM public.game_sessions gs
        JOIN public.students s2 ON s2.id = gs.user_id
        WHERE gs.app_id = asg.app_id
          AND gs.mode = 'test'
          AND gs.nota >= asg.min_score
          AND gs.user_type = 'student'
          AND s2.group_id = p_group_id
          AND (asg.student_id IS NULL OR gs.user_id = asg.student_id)
          AND gs.created_at >= asg.created_at
      ) as completed_count,
      CASE
        WHEN asg.student_id IS NOT NULL THEN 1
        ELSE (SELECT COUNT(*) FROM public.students WHERE group_id = p_group_id)
      END as total_students
    FROM public.assignments asg
    LEFT JOIN public.students st ON st.id = asg.student_id
    WHERE asg.group_id = p_group_id
      AND asg.teacher_id = auth.uid()
  ) a;

  RETURN json_build_object(
    'success', true,
    'assignments', COALESCE(v_result, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Actualizar teacher_get_student_stats: incluir nota
CREATE OR REPLACE FUNCTION teacher_get_student_stats(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_stats JSON;
  v_apps_detail JSON;
  v_recent JSON;
BEGIN
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.group_id,
         s.created_at, g.name as group_name
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id AND s.teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

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
    'avg_nota', COALESCE(ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 1), 0),
    'best_nota', COALESCE(MAX(nota), 0),
    'avg_test_nota', COALESCE(ROUND(AVG(nota) FILTER (WHERE mode = 'test' AND nota IS NOT NULL), 1), 0),
    'apps_played', COUNT(DISTINCT app_id),
    'practice_sessions', COUNT(*) FILTER (WHERE mode = 'practice'),
    'test_sessions', COUNT(*) FILTER (WHERE mode = 'test'),
    'avg_practice_score', COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'practice')), 0),
    'avg_test_score', COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0),
    'best_score', COALESCE(MAX(score), 0),
    'days_active', COUNT(DISTINCT DATE(created_at)),
    'last_activity', MAX(created_at)
  ) INTO v_stats
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student';

  SELECT json_agg(a ORDER BY a.total_plays DESC) INTO v_apps_detail FROM (
    SELECT app_id, app_name,
      COUNT(*) as total_plays,
      COUNT(*) FILTER (WHERE mode = 'practice') as practice_plays,
      COUNT(*) FILTER (WHERE mode = 'test') as test_plays,
      COALESCE(ROUND(AVG(score)), 0) as avg_score,
      COALESCE(MAX(score), 0) as best_score,
      COALESCE(ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 1), 0) as avg_nota,
      COALESCE(MAX(nota), 0) as best_nota,
      COALESCE(ROUND(AVG(nota) FILTER (WHERE mode = 'test' AND nota IS NOT NULL), 1), 0) as avg_test_nota,
      COALESCE(MAX(nota) FILTER (WHERE mode = 'test'), 0) as best_test_nota,
      CASE WHEN SUM(total_questions) > 0
        THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
        ELSE 0 END as accuracy,
      COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
      MAX(created_at) as last_played
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    GROUP BY app_id, app_name
  ) a;

  SELECT json_agg(s) INTO v_recent FROM (
    SELECT app_id, app_name, mode, score, max_score, nota,
           correct_answers, total_questions, duration_seconds, created_at
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Actualizar track_student_session: incluir nota
DROP FUNCTION IF EXISTS track_student_session(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION track_student_session(
  p_student_id UUID,
  p_app_id TEXT,
  p_app_name TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT,
  p_mode TEXT DEFAULT 'practice',
  p_score INTEGER DEFAULT 0,
  p_max_score INTEGER DEFAULT 0,
  p_correct_answers INTEGER DEFAULT 0,
  p_total_questions INTEGER DEFAULT 0,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_completed BOOLEAN DEFAULT true,
  p_nota NUMERIC DEFAULT NULL
) RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  INSERT INTO public.game_sessions (
    user_type, user_id, app_id, app_name, level, grade, subject_id,
    mode, score, max_score, correct_answers, total_questions,
    duration_seconds, completed, nota
  ) VALUES (
    'student', p_student_id, p_app_id, p_app_name, p_level, p_grade, p_subject_id,
    p_mode, p_score, p_max_score, p_correct_answers, p_total_questions,
    p_duration_seconds, p_completed, p_nota
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Actualizar admin_get_global_stats: incluir notas medias
CREATE OR REPLACE FUNCTION admin_get_global_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  SELECT json_build_object(
    'total_teachers', (SELECT COUNT(*) FROM public.teachers),
    'total_students', (SELECT COUNT(*) FROM public.students),
    'total_groups', (SELECT COUNT(*) FROM public.groups),
    'total_sessions', (SELECT COUNT(*) FROM public.game_sessions),
    'sessions_today', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= CURRENT_DATE),
    'sessions_this_week', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'sessions_this_month', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'avg_nota', (SELECT COALESCE(ROUND(AVG(nota), 1), 0) FROM public.game_sessions WHERE nota IS NOT NULL),
    'avg_test_nota', (SELECT COALESCE(ROUND(AVG(nota), 1), 0) FROM public.game_sessions WHERE nota IS NOT NULL AND mode = 'test'),
    'top_apps', (
      SELECT json_agg(a) FROM (
        SELECT app_id, app_name, COUNT(*) as play_count,
               ROUND(AVG(score)) as avg_score,
               COALESCE(ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 1), 0) as avg_nota
        FROM public.game_sessions
        GROUP BY app_id, app_name
        ORDER BY play_count DESC
        LIMIT 10
      ) a
    ),
    'sessions_by_level', (
      SELECT json_agg(l) FROM (
        SELECT level, COUNT(*) as count
        FROM public.game_sessions
        WHERE level IS NOT NULL
        GROUP BY level
        ORDER BY count DESC
      ) l
    ),
    'sessions_by_grade', (
      SELECT json_agg(g) FROM (
        SELECT level, grade, COUNT(*) as count
        FROM public.game_sessions
        WHERE grade IS NOT NULL
        GROUP BY level, grade
        ORDER BY level, grade
      ) g
    ),
    'recent_activity', (
      SELECT json_agg(d) FROM (
        SELECT date_trunc('day', created_at)::date as day, COUNT(*) as count
        FROM public.game_sessions
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day
      ) d
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Actualizar admin_get_user_sessions: incluir nota
CREATE OR REPLACE FUNCTION admin_get_user_sessions(
  p_user_id UUID,
  p_user_type TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_sessions JSON;
  v_total INTEGER;
  v_stats JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM public.game_sessions
  WHERE user_id = p_user_id AND user_type = p_user_type;

  SELECT json_agg(s) INTO v_sessions FROM (
    SELECT id, app_id, app_name, level, grade, subject_id, mode,
           score, max_score, nota, correct_answers, total_questions,
           duration_seconds, completed, created_at
    FROM public.game_sessions
    WHERE user_id = p_user_id AND user_type = p_user_type
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) s;

  SELECT json_build_object(
    'total_sessions', v_total,
    'total_score', COALESCE(SUM(score), 0),
    'avg_score', COALESCE(ROUND(AVG(score)), 0),
    'avg_nota', COALESCE(ROUND(AVG(nota), 1), 0),
    'best_nota', COALESCE(MAX(nota), 0),
    'total_correct', COALESCE(SUM(correct_answers), 0),
    'total_questions', COALESCE(SUM(total_questions), 0),
    'avg_accuracy', CASE
      WHEN SUM(total_questions) > 0
      THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
      ELSE 0
    END,
    'total_time_minutes', COALESCE(ROUND(SUM(duration_seconds)::numeric / 60, 1), 0),
    'apps_played', COUNT(DISTINCT app_id),
    'favorite_app', (
      SELECT app_name FROM public.game_sessions
      WHERE user_id = p_user_id AND user_type = p_user_type
      GROUP BY app_name ORDER BY COUNT(*) DESC LIMIT 1
    )
  ) INTO v_stats
  FROM public.game_sessions
  WHERE user_id = p_user_id AND user_type = p_user_type;

  RETURN json_build_object(
    'sessions', COALESCE(v_sessions, '[]'::json),
    'total', v_total,
    'stats', v_stats
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Permisos
GRANT EXECUTE ON FUNCTION track_student_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION student_get_assignments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION teacher_get_assignments_progress TO authenticated;
GRANT EXECUTE ON FUNCTION teacher_get_student_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_global_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_user_sessions TO authenticated;
