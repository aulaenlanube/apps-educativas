-- ============================================================
-- Migración: Vincular alumnos a Supabase Auth
-- Al vincular email, se crea un usuario en auth.users
-- Supabase gestiona verificación y reset de contraseña
-- ============================================================

-- Añadir columna para vincular con auth.users
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
CREATE INDEX IF NOT EXISTS idx_students_auth_user ON public.students(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Función: buscar alumno por auth_user_id (tras login con email)
CREATE OR REPLACE FUNCTION student_login_by_auth(
  p_auth_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_groups JSON;
BEGIN
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.avatar_color,
         s.group_id, g.name as group_name, g.group_code,
         s.email, s.email_verified
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.auth_user_id = p_auth_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Cuenta de alumno no encontrada');
  END IF;

  -- Obtener todos los grupos
  SELECT json_agg(json_build_object(
    'group_id', sg.group_id,
    'group_name', grp.name,
    'group_code', grp.group_code,
    'teacher_name', t.display_name
  ) ORDER BY sg.joined_at)
  INTO v_groups
  FROM public.student_groups sg
  JOIN public.groups grp ON grp.id = sg.group_id
  JOIN public.teachers t ON t.id = sg.teacher_id
  WHERE sg.student_id = v_student.id;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'group_code', v_student.group_code,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500'),
      'email', v_student.email,
      'email_verified', v_student.email_verified
    ),
    'groups', COALESCE(v_groups, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_login_by_auth TO anon, authenticated;

-- Función: vincular auth_user_id al alumno tras signUp exitoso
CREATE OR REPLACE FUNCTION student_link_auth_user(
  p_student_id UUID,
  p_group_id UUID,
  p_auth_user_id UUID,
  p_email TEXT
) RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  -- Verificar que el auth_user_id no esté ya vinculado a otro alumno
  IF EXISTS (SELECT 1 FROM public.students WHERE auth_user_id = p_auth_user_id AND id != p_student_id) THEN
    RETURN json_build_object('error', 'Esta cuenta ya esta vinculada a otro alumno');
  END IF;

  -- Verificar que el email no esté usado por un docente
  IF EXISTS (SELECT 1 FROM public.teachers WHERE email = lower(trim(p_email))) THEN
    RETURN json_build_object('error', 'Este email ya esta en uso por un docente');
  END IF;

  UPDATE public.students
  SET auth_user_id = p_auth_user_id,
      email = lower(trim(p_email)),
      email_verified = false,
      updated_at = now()
  WHERE id = p_student_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_link_auth_user TO anon, authenticated;

-- Función: marcar email como verificado (llamado cuando Supabase confirma el email)
CREATE OR REPLACE FUNCTION student_confirm_email(
  p_auth_user_id UUID
) RETURNS JSON AS $$
BEGIN
  UPDATE public.students
  SET email_verified = true, updated_at = now()
  WHERE auth_user_id = p_auth_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_confirm_email TO anon, authenticated;
