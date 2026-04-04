-- ============================================================
-- EduApps - Migracion: Panel Admin + Tracking de Actividad
-- Ejecutar este SQL en el SQL Editor de Supabase
-- ============================================================

-- 1. Añadir columna role a teachers
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE public.teachers ADD CONSTRAINT teachers_role_check CHECK (role IN ('teacher', 'admin'));

-- 2. Tabla de sesiones de juego (tracking de actividad)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'student')),
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  level TEXT,
  grade TEXT,
  subject_id TEXT,
  mode TEXT DEFAULT 'practice' CHECK (mode IN ('practice', 'test')),
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON public.game_sessions(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_app ON public.game_sessions(app_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created ON public.game_sessions(created_at DESC);

-- 3. RLS para game_sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Teachers autenticados pueden insertar sus propias sesiones
CREATE POLICY "teachers_insert_own_sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (
    user_type = 'teacher' AND user_id = auth.uid()
  );

-- Teachers pueden ver sus propias sesiones
CREATE POLICY "teachers_select_own_sessions" ON public.game_sessions
  FOR SELECT USING (
    user_type = 'teacher' AND user_id = auth.uid()
  );

-- Admin puede ver todas las sesiones
CREATE POLICY "admin_select_all_sessions" ON public.game_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teachers
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Funcion RPC para trackear sesiones de alumnos (no tienen auth de Supabase)
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
  p_completed BOOLEAN DEFAULT true
) RETURNS JSON AS $$
BEGIN
  -- Verificar que el alumno existe
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  INSERT INTO public.game_sessions (
    user_type, user_id, app_id, app_name, level, grade, subject_id,
    mode, score, max_score, correct_answers, total_questions,
    duration_seconds, completed
  ) VALUES (
    'student', p_student_id, p_app_id, p_app_name, p_level, p_grade, p_subject_id,
    p_mode, p_score, p_max_score, p_correct_answers, p_total_questions,
    p_duration_seconds, p_completed
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Funciones RPC para el panel admin

-- Obtener todos los usuarios (teachers + students) con stats
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS JSON AS $$
DECLARE
  v_teachers JSON;
  v_students JSON;
BEGIN
  -- Verificar que el caller es admin
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  -- Teachers con stats
  SELECT json_agg(t) INTO v_teachers FROM (
    SELECT
      te.id, te.email, te.display_name, te.role, te.teacher_code,
      te.avatar_url, te.created_at,
      'teacher' as user_type,
      COALESCE(gs.total_sessions, 0) as total_sessions,
      gs.last_activity
    FROM public.teachers te
    LEFT JOIN (
      SELECT user_id,
        COUNT(*) as total_sessions,
        MAX(created_at) as last_activity
      FROM public.game_sessions
      WHERE user_type = 'teacher'
      GROUP BY user_id
    ) gs ON gs.user_id = te.id
    ORDER BY te.created_at DESC
  ) t;

  -- Students con stats
  SELECT json_agg(s) INTO v_students FROM (
    SELECT
      st.id, st.username, st.display_name, st.avatar_emoji,
      st.group_id, st.teacher_id, st.created_at,
      'student' as user_type,
      g.name as group_name,
      te.display_name as teacher_name,
      COALESCE(gs.total_sessions, 0) as total_sessions,
      gs.last_activity
    FROM public.students st
    JOIN public.groups g ON g.id = st.group_id
    JOIN public.teachers te ON te.id = st.teacher_id
    LEFT JOIN (
      SELECT user_id,
        COUNT(*) as total_sessions,
        MAX(created_at) as last_activity
      FROM public.game_sessions
      WHERE user_type = 'student'
      GROUP BY user_id
    ) gs ON gs.user_id = st.id
    ORDER BY st.created_at DESC
  ) s;

  RETURN json_build_object(
    'teachers', COALESCE(v_teachers, '[]'::json),
    'students', COALESCE(v_students, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Obtener sesiones de un usuario especifico
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

  -- Total de sesiones
  SELECT COUNT(*) INTO v_total
  FROM public.game_sessions
  WHERE user_id = p_user_id AND user_type = p_user_type;

  -- Sesiones paginadas
  SELECT json_agg(s) INTO v_sessions FROM (
    SELECT id, app_id, app_name, level, grade, subject_id, mode,
           score, max_score, correct_answers, total_questions,
           duration_seconds, completed, created_at
    FROM public.game_sessions
    WHERE user_id = p_user_id AND user_type = p_user_type
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) s;

  -- Stats agregadas
  SELECT json_build_object(
    'total_sessions', v_total,
    'total_score', COALESCE(SUM(score), 0),
    'avg_score', COALESCE(ROUND(AVG(score)), 0),
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

-- Estadisticas globales de la plataforma
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
    'top_apps', (
      SELECT json_agg(a) FROM (
        SELECT app_id, app_name, COUNT(*) as play_count,
               ROUND(AVG(score)) as avg_score
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

-- 6. Funcion paginada para listar usuarios (reemplaza admin_get_all_users para escalabilidad)
CREATE OR REPLACE FUNCTION admin_get_users_paginated(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20,
  p_filter TEXT DEFAULT 'all',        -- 'all', 'teachers', 'students'
  p_search TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_users JSON;
  v_total INTEGER;
  v_teachers_count INTEGER;
  v_students_count INTEGER;
  v_offset INTEGER;
  v_search TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  v_offset := (GREATEST(p_page, 1) - 1) * p_page_size;
  v_search := CASE WHEN p_search IS NOT NULL AND p_search <> '' THEN '%' || LOWER(p_search) || '%' ELSE NULL END;

  -- Counts (with search filter applied)
  SELECT COUNT(*) INTO v_teachers_count
  FROM public.teachers te
  WHERE (v_search IS NULL OR LOWER(te.display_name) LIKE v_search OR LOWER(te.email) LIKE v_search);

  SELECT COUNT(*) INTO v_students_count
  FROM public.students st
  WHERE (v_search IS NULL OR LOWER(st.display_name) LIKE v_search OR LOWER(st.username) LIKE v_search);

  -- Apply type filter to total
  IF p_filter = 'teachers' THEN
    v_total := v_teachers_count;
  ELSIF p_filter = 'students' THEN
    v_total := v_students_count;
  ELSE
    v_total := v_teachers_count + v_students_count;
  END IF;

  -- Unified paginated query using UNION ALL
  SELECT json_agg(u) INTO v_users FROM (
    SELECT * FROM (
      -- Teachers
      SELECT
        te.id,
        te.display_name,
        te.email,
        NULL::text as username,
        NULL::text as avatar_emoji,
        te.role,
        te.teacher_code,
        NULL::uuid as group_id,
        NULL::text as group_name,
        NULL::text as teacher_name,
        'teacher'::text as user_type,
        te.created_at,
        COALESCE(gs.total_sessions, 0) as total_sessions,
        gs.last_activity
      FROM public.teachers te
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_sessions, MAX(created_at) as last_activity
        FROM public.game_sessions WHERE user_type = 'teacher' GROUP BY user_id
      ) gs ON gs.user_id = te.id
      WHERE (p_filter = 'all' OR p_filter = 'teachers')
        AND (v_search IS NULL OR LOWER(te.display_name) LIKE v_search OR LOWER(te.email) LIKE v_search)

      UNION ALL

      -- Students
      SELECT
        st.id,
        st.display_name,
        NULL::text as email,
        st.username,
        st.avatar_emoji,
        NULL::text as role,
        NULL::text as teacher_code,
        st.group_id,
        g.name as group_name,
        tch.display_name as teacher_name,
        'student'::text as user_type,
        st.created_at,
        COALESCE(gs.total_sessions, 0) as total_sessions,
        gs.last_activity
      FROM public.students st
      JOIN public.groups g ON g.id = st.group_id
      JOIN public.teachers tch ON tch.id = st.teacher_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_sessions, MAX(created_at) as last_activity
        FROM public.game_sessions WHERE user_type = 'student' GROUP BY user_id
      ) gs ON gs.user_id = st.id
      WHERE (p_filter = 'all' OR p_filter = 'students')
        AND (v_search IS NULL OR LOWER(st.display_name) LIKE v_search OR LOWER(st.username) LIKE v_search)
    ) combined
    ORDER BY created_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) u;

  RETURN json_build_object(
    'users', COALESCE(v_users, '[]'::json),
    'total_count', v_total,
    'teachers_count', v_teachers_count,
    'students_count', v_students_count,
    'page', p_page,
    'page_size', p_page_size
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Permisos de ejecucion
GRANT EXECUTE ON FUNCTION track_student_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_user_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_global_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_users_paginated TO authenticated;
