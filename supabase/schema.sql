-- ============================================================
-- EduApps - Schema para sistema de autenticación
-- Ejecutar este SQL en el SQL Editor de Supabase
-- ============================================================

-- Habilitar pgcrypto para hasheo de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLAS
-- ============================================================

-- Tabla de docentes (vinculada a auth.users de Supabase)
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  teacher_code TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Storage bucket para avatares de docentes
-- NOTA: Tambien puedes crear el bucket manualmente en Supabase Dashboard > Storage > New bucket "avatars" (publico)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politicas de storage para avatares
CREATE POLICY "Teachers can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Teachers can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Tabla de grupos
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, name)
);

-- Tabla de alumnos (auth custom, sin email)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🎓',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, username)
);

-- ============================================================
-- FUNCIONES
-- ============================================================

-- Genera un código único para el docente (ej: PROF-A3X7)
CREATE OR REPLACE FUNCTION generate_teacher_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'PROF-' || upper(substr(md5(random()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM public.teachers WHERE teacher_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger: crear fila en teachers automáticamente al registrarse un usuario
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (id, email, display_name, teacher_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    generate_teacher_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Login de alumno (llamado desde el cliente)
CREATE OR REPLACE FUNCTION student_login(
  p_teacher_code TEXT,
  p_username TEXT,
  p_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_teacher RECORD;
BEGIN
  SELECT id INTO v_teacher
  FROM public.teachers
  WHERE teacher_code = upper(trim(p_teacher_code));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Código de profesor no encontrado');
  END IF;

  SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
         s.password_hash, g.name as group_name
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.teacher_id = v_teacher.id
    AND s.username = lower(trim(p_username));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  IF v_student.password_hash != crypt(p_password, v_student.password_hash) THEN
    RETURN json_build_object('error', 'Contraseña incorrecta');
  END IF;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'avatar_emoji', v_student.avatar_emoji
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear alumno (solo el docente autenticado puede crear alumnos en sus grupos)
CREATE OR REPLACE FUNCTION create_student(
  p_group_id UUID,
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_avatar_emoji TEXT DEFAULT '🎓'
) RETURNS JSON AS $$
DECLARE
  v_group RECORD;
  v_student_id UUID;
BEGIN
  SELECT g.id, g.teacher_id INTO v_group
  FROM public.groups g
  WHERE g.id = p_group_id
    AND g.teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Grupo no encontrado o no autorizado');
  END IF;

  INSERT INTO public.students (group_id, teacher_id, username, password_hash, display_name, avatar_emoji)
  VALUES (
    p_group_id,
    v_group.teacher_id,
    lower(trim(p_username)),
    crypt(p_password, gen_salt('bf')),
    p_display_name,
    p_avatar_emoji
  )
  RETURNING id INTO v_student_id;

  RETURN json_build_object('success', true, 'student_id', v_student_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('error', 'Ya existe un alumno con ese nombre de usuario');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar contraseña de alumno
CREATE OR REPLACE FUNCTION update_student_password(
  p_student_id UUID,
  p_new_password TEXT
) RETURNS JSON AS $$
BEGIN
  UPDATE public.students
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_student_id
    AND teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado o no autorizado');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Teachers: solo su propio registro
CREATE POLICY "teachers_select_own" ON public.teachers
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "teachers_update_own" ON public.teachers
  FOR UPDATE USING (id = auth.uid());

-- Groups: CRUD solo sus propios grupos
CREATE POLICY "groups_select_own" ON public.groups
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "groups_insert_own" ON public.groups
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "groups_update_own" ON public.groups
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "groups_delete_own" ON public.groups
  FOR DELETE USING (teacher_id = auth.uid());

-- Students: CRUD solo alumnos de sus propios grupos
CREATE POLICY "students_select_own" ON public.students
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "students_update_own" ON public.students
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "students_delete_own" ON public.students
  FOR DELETE USING (teacher_id = auth.uid());
