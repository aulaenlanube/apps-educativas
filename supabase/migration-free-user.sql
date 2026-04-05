-- ============================================================
-- MIGRACIÓN: Soporte para usuarios "Soy Libre"
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Permitir rol 'free' en la tabla teachers
-- (Si hay un CHECK constraint en la columna role, actualizarlo)
-- Primero verificamos si existe el constraint y lo actualizamos
DO $$
BEGIN
  -- Intentar eliminar constraint existente si lo hay
  BEGIN
    ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS teachers_role_check;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Añadir constraint actualizado que permita 'free'
ALTER TABLE public.teachers
  ADD CONSTRAINT teachers_role_check
  CHECK (role IN ('teacher', 'admin', 'free'));

-- 2. Actualizar el trigger handle_new_user para que asigne role='free'
--    cuando el usuario se registra con metadata role='free'
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Detectar si el usuario se registra como 'free'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');

  INSERT INTO public.teachers (id, email, display_name, teacher_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    generate_teacher_code(),
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Permitir user_type 'free' en game_sessions si hay constraint
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_user_type_check;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- 4. RLS: free users can insert/select their own sessions (same as teachers)
CREATE POLICY "free_insert_own_sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (
    user_type = 'free' AND user_id = auth.uid()
  );

CREATE POLICY "free_select_own_sessions" ON public.game_sessions
  FOR SELECT USING (
    user_type = 'free' AND user_id = auth.uid()
  );

-- 5. Actualizar admin_get_users_paginated para soportar filtro 'free'
CREATE OR REPLACE FUNCTION admin_get_users_paginated(
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20,
  p_filter TEXT DEFAULT 'all',        -- 'all', 'teachers', 'students', 'free'
  p_search TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_users JSON;
  v_total INTEGER;
  v_teachers_count INTEGER;
  v_students_count INTEGER;
  v_free_count INTEGER;
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
  WHERE te.role IN ('teacher', 'admin')
    AND (v_search IS NULL OR LOWER(te.display_name) LIKE v_search OR LOWER(te.email) LIKE v_search);

  SELECT COUNT(*) INTO v_free_count
  FROM public.teachers te
  WHERE te.role = 'free'
    AND (v_search IS NULL OR LOWER(te.display_name) LIKE v_search OR LOWER(te.email) LIKE v_search);

  SELECT COUNT(*) INTO v_students_count
  FROM public.students st
  WHERE (v_search IS NULL OR LOWER(st.display_name) LIKE v_search OR LOWER(st.username) LIKE v_search);

  -- Apply type filter to total
  IF p_filter = 'teachers' THEN
    v_total := v_teachers_count;
  ELSIF p_filter = 'free' THEN
    v_total := v_free_count;
  ELSIF p_filter = 'students' THEN
    v_total := v_students_count;
  ELSE
    v_total := v_teachers_count + v_free_count + v_students_count;
  END IF;

  -- Unified paginated query using UNION ALL
  SELECT json_agg(u) INTO v_users FROM (
    SELECT * FROM (
      -- Teachers (role teacher/admin)
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
        FROM public.game_sessions WHERE user_type IN ('teacher', 'free') GROUP BY user_id
      ) gs ON gs.user_id = te.id
      WHERE (
        (p_filter = 'all' AND te.role IN ('teacher', 'admin'))
        OR (p_filter = 'teachers' AND te.role IN ('teacher', 'admin'))
        OR (p_filter = 'free' AND te.role = 'free')
      )
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
    'free_count', v_free_count,
    'students_count', v_students_count,
    'page', p_page,
    'page_size', p_page_size
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Actualizar admin_get_global_stats para incluir conteo de libres
CREATE OR REPLACE FUNCTION admin_get_global_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  SELECT json_build_object(
    'total_teachers', (SELECT COUNT(*) FROM public.teachers WHERE role IN ('teacher', 'admin')),
    'total_free', (SELECT COUNT(*) FROM public.teachers WHERE role = 'free'),
    'total_students', (SELECT COUNT(*) FROM public.students),
    'total_groups', (SELECT COUNT(*) FROM public.groups),
    'total_sessions', (SELECT COUNT(*) FROM public.game_sessions),
    'completed_sessions', (SELECT COUNT(*) FROM public.game_sessions WHERE completed = true),
    'abandoned_sessions', (SELECT COUNT(*) FROM public.game_sessions WHERE completed = false),
    'anonymous_sessions', (SELECT COUNT(*) FROM public.game_sessions WHERE user_type = 'anonymous'),
    'abandonment_rate', (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE completed = false)::numeric / COUNT(*) * 100, 1)
        ELSE 0 END
      FROM public.game_sessions
    ),
    'avg_duration_seconds', (SELECT AVG(duration_seconds) FROM public.game_sessions WHERE duration_seconds IS NOT NULL),
    'sessions_today', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= CURRENT_DATE),
    'sessions_this_week', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'sessions_this_month', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'top_apps', (
      SELECT json_agg(a) FROM (
        SELECT app_id, app_name,
               COUNT(*) as play_count,
               COUNT(*) FILTER (WHERE completed = true) as completed_count,
               COUNT(*) FILTER (WHERE completed = false) as abandoned_count,
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

-- 7. Funcion admin para crear usuario libre sin verificacion de email
-- Usa auth.admin API via una funcion SECURITY DEFINER que llama a supabase_admin
-- NOTA: Esta funcion usa extensions de Supabase para crear auth users
CREATE OR REPLACE FUNCTION admin_create_free_user(
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Solo admins pueden crear usuarios
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  -- Verificar que el email no exista ya
  IF EXISTS (SELECT 1 FROM public.teachers WHERE email = p_email) THEN
    RETURN json_build_object('error', 'Ya existe un usuario con ese email');
  END IF;

  -- Crear usuario en auth.users directamente (SECURITY DEFINER permite esto)
  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(), -- email confirmado inmediatamente
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('full_name', p_display_name, 'role', 'free')::jsonb,
    '', '', ''
  );

  -- El trigger handle_new_user deberia crear la fila en teachers automaticamente
  -- pero por si acaso, verificamos y creamos si no existe
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = v_user_id) THEN
    INSERT INTO public.teachers (id, email, display_name, teacher_code, role)
    VALUES (v_user_id, p_email, p_display_name, generate_teacher_code(), 'free');
  END IF;

  -- Asegurar que el rol sea 'free'
  UPDATE public.teachers SET role = 'free' WHERE id = v_user_id AND role != 'free';

  RETURN json_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN unique_violation THEN
  RETURN json_build_object('error', 'Ya existe un usuario con ese email en el sistema de autenticacion');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Permisos
GRANT EXECUTE ON FUNCTION admin_create_free_user TO authenticated;
