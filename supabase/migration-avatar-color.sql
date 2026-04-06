-- ============================================================
-- Migración: Añadir color de avatar para alumnos
-- ============================================================

-- 1. Añadir columna avatar_color a students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'from-blue-500 to-purple-500';

-- 2. Actualizar student_update_profile para aceptar color
CREATE OR REPLACE FUNCTION student_update_profile(
  p_student_id UUID,
  p_group_id UUID,
  p_avatar_emoji TEXT DEFAULT NULL,
  p_avatar_color TEXT DEFAULT NULL,
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

  IF p_avatar_emoji IS NOT NULL THEN
    UPDATE public.students
    SET avatar_emoji = p_avatar_emoji, updated_at = now()
    WHERE id = p_student_id;
  END IF;

  IF p_avatar_color IS NOT NULL THEN
    UPDATE public.students
    SET avatar_color = p_avatar_color, updated_at = now()
    WHERE id = p_student_id;
  END IF;

  IF p_new_password IS NOT NULL THEN
    IF v_student.password_hash IS NOT NULL THEN
      IF p_current_password IS NULL OR
         v_student.password_hash != crypt(p_current_password, v_student.password_hash) THEN
        RETURN json_build_object('error', 'Contrasena actual incorrecta');
      END IF;
    END IF;
    UPDATE public.students
    SET password_hash = crypt(p_new_password, gen_salt('bf')), updated_at = now()
    WHERE id = p_student_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION student_update_profile TO anon, authenticated;

-- 3. Actualizar student_login para devolver avatar_color
CREATE OR REPLACE FUNCTION student_login(
  p_teacher_code TEXT,
  p_username TEXT,
  p_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_teacher RECORD;
  v_group RECORD;
BEGIN
  IF upper(trim(p_teacher_code)) LIKE 'GRP-%' THEN
    SELECT g.id, g.teacher_id INTO v_group
    FROM public.groups g
    WHERE g.group_code = upper(trim(p_teacher_code));

    IF NOT FOUND THEN
      RETURN json_build_object('error', 'Codigo de grupo no encontrado');
    END IF;

    SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
           s.avatar_color, s.password_hash, g.name as group_name
    INTO v_student
    FROM public.students s
    JOIN public.groups g ON g.id = s.group_id
    WHERE s.group_id = v_group.id
      AND s.username = lower(trim(p_username));
  ELSE
    SELECT id INTO v_teacher
    FROM public.teachers
    WHERE teacher_code = upper(trim(p_teacher_code));

    IF NOT FOUND THEN
      RETURN json_build_object('error', 'Codigo no encontrado');
    END IF;

    SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
           s.avatar_color, s.password_hash, g.name as group_name
    INTO v_student
    FROM public.students s
    JOIN public.groups g ON g.id = s.group_id
    WHERE s.teacher_id = v_teacher.id
      AND s.username = lower(trim(p_username));
  END IF;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  IF v_student.password_hash IS NULL THEN
    RETURN json_build_object(
      'needs_password', true,
      'student_id', v_student.id,
      'display_name', v_student.display_name
    );
  END IF;

  IF v_student.password_hash != crypt(p_password, v_student.password_hash) THEN
    RETURN json_build_object('error', 'Contrasena incorrecta');
  END IF;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION student_login TO anon, authenticated;

-- 4. Actualizar student_set_password para devolver avatar_color
CREATE OR REPLACE FUNCTION student_set_password(
  p_student_id UUID,
  p_group_code TEXT,
  p_username TEXT,
  p_new_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
BEGIN
  SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
         s.avatar_color, s.password_hash, g.name as group_name
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id
    AND g.group_code = upper(trim(p_group_code))
    AND s.username = lower(trim(p_username));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  IF v_student.password_hash IS NOT NULL THEN
    RETURN json_build_object('error', 'Este alumno ya tiene contrasena establecida');
  END IF;

  IF length(p_new_password) < 4 THEN
    RETURN json_build_object('error', 'La contrasena debe tener al menos 4 caracteres');
  END IF;

  UPDATE public.students
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_student_id;

  RETURN json_build_object(
    'success', true,
    'student', json_build_object(
      'id', v_student.id,
      'username', v_student.username,
      'display_name', v_student.display_name,
      'group_id', v_student.group_id,
      'group_name', v_student.group_name,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION student_set_password TO anon, authenticated;
