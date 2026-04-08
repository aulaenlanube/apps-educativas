-- ============================================================
-- Migration: añadir nivel/curso/asignatura a los grupos
-- ============================================================
-- Esta migración añade tres columnas opcionales al `groups`:
--   level       (TEXT)  → 'primaria' | 'eso'
--   grade       (TEXT)  → '1'..'6' (primaria) | '1'..'4' (eso)
--   subject_id  (TEXT)  → id de la asignatura (ej. 'lengua', 'matematicas')
--                         o NULL para "Sin asignatura"
--
-- Y actualiza las funciones RPC que devuelven grupos para que
-- estos campos viajen al cliente: get_teacher_groups, student_login,
-- student_login_by_auth.

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS subject_id TEXT;

-- ----------------------------------------------------------------
-- Fix: recursión infinita entre RLS de groups <-> group_teachers
-- ----------------------------------------------------------------
-- La política SELECT de groups consultaba group_teachers, y la
-- política FOR ALL de group_teachers consultaba groups → loop.
-- Se reescriben usando una función SECURITY DEFINER para romper el ciclo.

CREATE OR REPLACE FUNCTION is_owner_of_group(
  p_teacher_id UUID,
  p_group_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id AND teacher_id = p_teacher_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- group_teachers: reemplazar la política recursiva
DROP POLICY IF EXISTS "owner_manage_group_teachers" ON public.group_teachers;
DROP POLICY IF EXISTS "teachers_view_group_teachers" ON public.group_teachers;

CREATE POLICY "group_teachers_select" ON public.group_teachers
  FOR SELECT USING (is_teacher_of_group(auth.uid(), group_id));

CREATE POLICY "group_teachers_insert" ON public.group_teachers
  FOR INSERT WITH CHECK (is_owner_of_group(auth.uid(), group_id));

CREATE POLICY "group_teachers_update" ON public.group_teachers
  FOR UPDATE USING (is_owner_of_group(auth.uid(), group_id));

CREATE POLICY "group_teachers_delete" ON public.group_teachers
  FOR DELETE USING (is_owner_of_group(auth.uid(), group_id));

-- groups: reescribir la política SELECT para usar la helper SECURITY DEFINER
DROP POLICY IF EXISTS "teachers_read_groups" ON public.groups;

CREATE POLICY "teachers_read_groups" ON public.groups
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR is_teacher_of_group(auth.uid(), id)
  );

-- ----------------------------------------------------------------
-- get_teacher_groups: devolver level/grade/subject_id
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_teacher_groups()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(row_to_json(g) ORDER BY g.created_at ASC) INTO v_result
  FROM (
    SELECT
      gr.id, gr.name, gr.description, gr.group_code,
      gr.teacher_id, gr.created_at, gr.updated_at,
      gr.level, gr.grade, gr.subject_id,
      gr.teacher_id = auth.uid() AS is_owner,
      (SELECT COUNT(*) FROM public.students s WHERE s.group_id = gr.id) AS student_count,
      t.display_name AS owner_name,
      (
        SELECT json_agg(json_build_object(
          'id', ct.id,
          'teacher_id', ct.teacher_id,
          'display_name', t2.display_name,
          'teacher_code', t2.teacher_code
        ))
        FROM public.group_teachers ct
        JOIN public.teachers t2 ON t2.id = ct.teacher_id
        WHERE ct.group_id = gr.id
      ) AS co_teachers
    FROM public.groups gr
    JOIN public.teachers t ON t.id = gr.teacher_id
    WHERE gr.teacher_id = auth.uid()
       OR EXISTS (SELECT 1 FROM public.group_teachers gt WHERE gt.group_id = gr.id AND gt.teacher_id = auth.uid())
  ) g;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_teacher_groups TO authenticated;

-- ----------------------------------------------------------------
-- student_login: devolver nivel/curso/asignatura del grupo
-- ----------------------------------------------------------------
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
           s.avatar_color, s.password_hash, g.name as group_name,
           g.level as group_level, g.grade as group_grade, g.subject_id as group_subject_id
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
           s.avatar_color, s.password_hash, g.name as group_name,
           g.level as group_level, g.grade as group_grade, g.subject_id as group_subject_id
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
      'group_level', v_student.group_level,
      'group_grade', v_student.group_grade,
      'group_subject_id', v_student.group_subject_id,
      'avatar_emoji', v_student.avatar_emoji,
      'avatar_color', COALESCE(v_student.avatar_color, 'from-blue-500 to-purple-500')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION student_login TO anon, authenticated;

-- ----------------------------------------------------------------
-- student_login_by_auth: idem para login por email
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_login_by_auth(
  p_auth_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_groups JSON;
BEGIN
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.avatar_color,
         s.group_id, g.name as group_name, g.group_code,
         g.level as group_level, g.grade as group_grade, g.subject_id as group_subject_id,
         s.email, s.email_verified
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.auth_user_id = p_auth_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Cuenta de alumno no encontrada');
  END IF;

  SELECT json_agg(json_build_object(
    'group_id', sg.group_id,
    'group_name', grp.name,
    'group_code', grp.group_code,
    'group_level', grp.level,
    'group_grade', grp.grade,
    'group_subject_id', grp.subject_id,
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
      'group_level', v_student.group_level,
      'group_grade', v_student.group_grade,
      'group_subject_id', v_student.group_subject_id,
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
