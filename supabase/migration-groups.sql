-- ============================================================
-- Migracion: Sistema de grupos con codigo y alumnos sin contrasena
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Funcion para generar codigo de grupo unico (GRP-XXXX)
CREATE OR REPLACE FUNCTION generate_group_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'GRP-' || upper(substr(md5(random()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE group_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 2. Anadir columna group_code a la tabla groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS group_code TEXT UNIQUE;

-- Generar codigos para grupos existentes que no tengan
DO $$
DECLARE
  g RECORD;
BEGIN
  FOR g IN SELECT id FROM public.groups WHERE group_code IS NULL LOOP
    UPDATE public.groups SET group_code = generate_group_code() WHERE id = g.id;
  END LOOP;
END $$;

-- Ahora hacerla NOT NULL
ALTER TABLE public.groups ALTER COLUMN group_code SET NOT NULL;
ALTER TABLE public.groups ALTER COLUMN group_code SET DEFAULT generate_group_code();

-- 3. Hacer password_hash nullable (NULL = debe crear contrasena en primer login)
ALTER TABLE public.students ALTER COLUMN password_hash DROP NOT NULL;

-- 4. Funcion: crear alumnos en lote (sin contrasena)
CREATE OR REPLACE FUNCTION create_students_bulk(
  p_group_id UUID,
  p_usernames TEXT[]
) RETURNS JSON AS $$
DECLARE
  v_group RECORD;
  v_username TEXT;
  v_created INTEGER := 0;
  v_errors TEXT[] := '{}';
  v_clean_username TEXT;
BEGIN
  -- Verificar que el grupo pertenece al docente autenticado
  SELECT g.id, g.teacher_id INTO v_group
  FROM public.groups g
  WHERE g.id = p_group_id
    AND g.teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Grupo no encontrado o no autorizado');
  END IF;

  FOREACH v_username IN ARRAY p_usernames LOOP
    v_clean_username := lower(trim(v_username));
    -- Saltar lineas vacias
    IF v_clean_username = '' THEN CONTINUE; END IF;

    BEGIN
      INSERT INTO public.students (group_id, teacher_id, username, display_name, password_hash)
      VALUES (
        p_group_id,
        v_group.teacher_id,
        v_clean_username,
        v_clean_username,  -- display_name = username por defecto
        NULL               -- sin contrasena, la creara en primer login
      );
      v_created := v_created + 1;
    EXCEPTION
      WHEN unique_violation THEN
        v_errors := array_append(v_errors, v_clean_username || ' (ya existe)');
    END;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'created', v_created,
    'errors', v_errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Funcion: verificar si alumno existe y necesita crear contrasena
-- Retorna: { needs_password: true } o { error: '...' } o { success: true, student: {...} }
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
  -- Intentar buscar por codigo de grupo primero (GRP-XXXX)
  IF upper(trim(p_teacher_code)) LIKE 'GRP-%' THEN
    SELECT g.id, g.teacher_id INTO v_group
    FROM public.groups g
    WHERE g.group_code = upper(trim(p_teacher_code));

    IF NOT FOUND THEN
      RETURN json_build_object('error', 'Codigo de grupo no encontrado');
    END IF;

    SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
           s.password_hash, g.name as group_name
    INTO v_student
    FROM public.students s
    JOIN public.groups g ON g.id = s.group_id
    WHERE s.group_id = v_group.id
      AND s.username = lower(trim(p_username));
  ELSE
    -- Fallback: buscar por codigo de profesor (PROF-XXXX) para compatibilidad
    SELECT id INTO v_teacher
    FROM public.teachers
    WHERE teacher_code = upper(trim(p_teacher_code));

    IF NOT FOUND THEN
      RETURN json_build_object('error', 'Codigo no encontrado');
    END IF;

    SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
           s.password_hash, g.name as group_name
    INTO v_student
    FROM public.students s
    JOIN public.groups g ON g.id = s.group_id
    WHERE s.teacher_id = v_teacher.id
      AND s.username = lower(trim(p_username));
  END IF;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  -- Si no tiene contrasena, necesita crearla
  IF v_student.password_hash IS NULL THEN
    RETURN json_build_object(
      'needs_password', true,
      'student_id', v_student.id,
      'display_name', v_student.display_name
    );
  END IF;

  -- Verificar contrasena
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
      'avatar_emoji', v_student.avatar_emoji
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Funcion: alumno establece su contrasena (primer login o tras reset)
CREATE OR REPLACE FUNCTION student_set_password(
  p_student_id UUID,
  p_group_code TEXT,
  p_username TEXT,
  p_new_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
BEGIN
  -- Verificar que el alumno existe, pertenece al grupo y no tiene contrasena
  SELECT s.id, s.username, s.display_name, s.group_id, s.avatar_emoji,
         s.password_hash, g.name as group_name
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
      'avatar_emoji', v_student.avatar_emoji
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Modificar reset de contrasena del docente: pone password_hash a NULL
CREATE OR REPLACE FUNCTION reset_student_password(
  p_student_id UUID
) RETURNS JSON AS $$
BEGIN
  UPDATE public.students
  SET password_hash = NULL,
      updated_at = now()
  WHERE id = p_student_id
    AND teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado o no autorizado');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Actualizar create_student para que la contrasena sea opcional
CREATE OR REPLACE FUNCTION create_student(
  p_group_id UUID,
  p_username TEXT,
  p_password TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL,
  p_avatar_emoji TEXT DEFAULT '🎓'
) RETURNS JSON AS $$
DECLARE
  v_group RECORD;
  v_student_id UUID;
  v_hash TEXT := NULL;
  v_display TEXT;
BEGIN
  SELECT g.id, g.teacher_id INTO v_group
  FROM public.groups g
  WHERE g.id = p_group_id
    AND g.teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Grupo no encontrado o no autorizado');
  END IF;

  IF p_password IS NOT NULL AND p_password != '' THEN
    v_hash := crypt(p_password, gen_salt('bf'));
  END IF;

  v_display := COALESCE(NULLIF(trim(p_display_name), ''), lower(trim(p_username)));

  INSERT INTO public.students (group_id, teacher_id, username, password_hash, display_name, avatar_emoji)
  VALUES (
    p_group_id,
    v_group.teacher_id,
    lower(trim(p_username)),
    v_hash,
    v_display,
    p_avatar_emoji
  )
  RETURNING id INTO v_student_id;

  RETURN json_build_object('success', true, 'student_id', v_student_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('error', 'Ya existe un alumno con ese nombre de usuario');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
