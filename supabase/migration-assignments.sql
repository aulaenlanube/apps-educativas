-- ============================================================
-- Migracion: Sistema de tareas asignadas por docentes
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabla de tareas
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- NULL = tarea para todo el grupo
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  level TEXT,                                  -- 'primaria' o 'eso'
  grade TEXT,                                  -- '1', '2', etc.
  subject_id TEXT,                             -- 'matematicas', 'lengua', etc.
  min_score INTEGER NOT NULL DEFAULT 0,       -- nota minima para superar en modo examen
  title TEXT,                                  -- titulo opcional de la tarea
  description TEXT,                            -- instrucciones opcionales
  due_date TIMESTAMPTZ,                        -- fecha limite (opcional)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_group ON public.assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.assignments(student_id);

-- 2. RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_crud_own_assignments" ON public.assignments
  FOR ALL USING (teacher_id = auth.uid());

-- 3. Funcion: obtener tareas de un alumno con estado de completado
-- Cruza assignments con game_sessions para ver si el alumno ha alcanzado la nota minima
CREATE OR REPLACE FUNCTION student_get_assignments(
  p_student_id UUID,
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar que el alumno existe
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
      -- Mejor puntuacion del alumno en modo examen para esta app
      best.best_score,
      best.attempts,
      best.last_attempt,
      -- Completado si tiene al menos una sesion en modo examen con score >= min_score
      COALESCE(best.best_score, 0) >= asg.min_score as completed
    FROM public.assignments asg
    LEFT JOIN (
      SELECT
        app_id,
        MAX(score) as best_score,
        COUNT(*) as attempts,
        MAX(created_at) as last_attempt
      FROM public.game_sessions
      WHERE user_id = p_student_id
        AND user_type = 'student'
        AND mode = 'test'
      GROUP BY app_id
    ) best ON best.app_id = asg.app_id
    WHERE asg.group_id = p_group_id
      AND (asg.student_id IS NULL OR asg.student_id = p_student_id)
  ) a;

  RETURN json_build_object(
    'success', true,
    'assignments', COALESCE(v_result, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Funcion: docente obtiene tareas de un grupo con progreso de todos los alumnos
CREATE OR REPLACE FUNCTION teacher_get_assignments_progress(
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar que el grupo pertenece al docente
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
      -- Si es individual, nombre del alumno
      st.display_name as student_name,
      -- Progreso: cuantos alumnos del grupo lo han completado
      (
        SELECT COUNT(DISTINCT gs.user_id)
        FROM public.game_sessions gs
        JOIN public.students s2 ON s2.id = gs.user_id
        WHERE gs.app_id = asg.app_id
          AND gs.mode = 'test'
          AND gs.score >= asg.min_score
          AND gs.user_type = 'student'
          AND s2.group_id = p_group_id
          AND (asg.student_id IS NULL OR gs.user_id = asg.student_id)
      ) as completed_count,
      -- Total alumnos que deben completarla
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

-- 5. Funcion: docente ve estadisticas de un alumno especifico
CREATE OR REPLACE FUNCTION teacher_get_student_stats(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_stats JSON;
  v_apps_detail JSON;
  v_recent JSON;
BEGIN
  -- Verificar que el alumno pertenece al docente
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.group_id,
         s.created_at, g.name as group_name
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id AND s.teacher_id = auth.uid();

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
    'days_active', COUNT(DISTINCT DATE(created_at)),
    'last_activity', MAX(created_at)
  ) INTO v_stats
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student';

  -- Detalle por app
  SELECT json_agg(a ORDER BY a.total_plays DESC) INTO v_apps_detail FROM (
    SELECT app_id, app_name,
      COUNT(*) as total_plays,
      COUNT(*) FILTER (WHERE mode = 'practice') as practice_plays,
      COUNT(*) FILTER (WHERE mode = 'test') as test_plays,
      COALESCE(ROUND(AVG(score)), 0) as avg_score,
      COALESCE(ROUND(AVG(score) FILTER (WHERE mode = 'test')), 0) as avg_test_score,
      COALESCE(MAX(score), 0) as best_score,
      COALESCE(MAX(score) FILTER (WHERE mode = 'test'), 0) as best_test_score,
      CASE WHEN SUM(total_questions) > 0
        THEN ROUND(SUM(correct_answers)::numeric / SUM(total_questions) * 100, 1)
        ELSE 0 END as accuracy,
      COALESCE(SUM(duration_seconds), 0) as total_time_seconds,
      MAX(created_at) as last_played
    FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student'
    GROUP BY app_id, app_name
  ) a;

  -- Ultimas 15 sesiones
  SELECT json_agg(s) INTO v_recent FROM (
    SELECT app_id, app_name, mode, score, max_score,
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

-- 6. Columnas adicionales para curso (si la tabla ya existia sin ellas)
DO $$ BEGIN
  ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS level TEXT;
  ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS grade TEXT;
  ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS subject_id TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 7. Permisos
GRANT EXECUTE ON FUNCTION student_get_assignments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION teacher_get_assignments_progress TO authenticated;
GRANT EXECUTE ON FUNCTION teacher_get_student_stats TO authenticated;
