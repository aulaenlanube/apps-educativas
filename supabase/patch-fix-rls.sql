-- ============================================================
-- PARCHE: Crear RPC get_group_students + corregir RLS
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── RPC para obtener alumnos (SECURITY DEFINER, no depende de RLS) ───
CREATE OR REPLACE FUNCTION get_group_students(
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT is_teacher_of_group(auth.uid(), p_group_id) THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(s ORDER BY s.display_name ASC) INTO v_result
  FROM (
    SELECT id, username, display_name, avatar_emoji, password_hash, created_at
    FROM public.students
    WHERE group_id = p_group_id
    ORDER BY display_name ASC
  ) s;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_group_students TO authenticated;

-- ─── STUDENTS RLS (corregir) ─────────────────────────────────
DROP POLICY IF EXISTS "students_select_own" ON public.students;
DROP POLICY IF EXISTS "students_update_own" ON public.students;
DROP POLICY IF EXISTS "students_delete_own" ON public.students;
DROP POLICY IF EXISTS "teachers_read_students" ON public.students;
DROP POLICY IF EXISTS "teachers_write_students" ON public.students;
DROP POLICY IF EXISTS "teachers_update_students" ON public.students;
DROP POLICY IF EXISTS "teachers_delete_students" ON public.students;
DROP POLICY IF EXISTS "teachers_manage_own_students" ON public.students;
DROP POLICY IF EXISTS "teachers_crud_students" ON public.students;

CREATE POLICY "teachers_read_students" ON public.students
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_teachers gt WHERE gt.group_id = group_id AND gt.teacher_id = auth.uid())
  );

CREATE POLICY "teachers_write_students" ON public.students
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teachers_update_students" ON public.students
  FOR UPDATE USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_teachers gt WHERE gt.group_id = group_id AND gt.teacher_id = auth.uid())
  );

CREATE POLICY "teachers_delete_students" ON public.students
  FOR DELETE USING (teacher_id = auth.uid());

-- ─── GROUPS RLS (corregir) ───────────────────────────────────
DROP POLICY IF EXISTS "groups_select_own" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_own" ON public.groups;
DROP POLICY IF EXISTS "groups_update_own" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_own" ON public.groups;
DROP POLICY IF EXISTS "teachers_read_groups" ON public.groups;
DROP POLICY IF EXISTS "teachers_write_own_groups" ON public.groups;
DROP POLICY IF EXISTS "teachers_update_own_groups" ON public.groups;
DROP POLICY IF EXISTS "teachers_delete_own_groups" ON public.groups;

CREATE POLICY "teachers_read_groups" ON public.groups
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_teachers gt WHERE gt.group_id = id AND gt.teacher_id = auth.uid())
  );

CREATE POLICY "teachers_write_own_groups" ON public.groups
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teachers_update_own_groups" ON public.groups
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "teachers_delete_own_groups" ON public.groups
  FOR DELETE USING (teacher_id = auth.uid());

-- ─── ASSIGNMENTS RLS (corregir) ──────────────────────────────
DROP POLICY IF EXISTS "teachers_crud_own_assignments" ON public.assignments;
DROP POLICY IF EXISTS "teachers_read_assignments" ON public.assignments;
DROP POLICY IF EXISTS "teachers_write_assignments" ON public.assignments;
DROP POLICY IF EXISTS "teachers_update_assignments" ON public.assignments;
DROP POLICY IF EXISTS "teachers_delete_assignments" ON public.assignments;

CREATE POLICY "teachers_read_assignments" ON public.assignments
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_teachers gt WHERE gt.group_id = group_id AND gt.teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.teacher_id = auth.uid())
  );

CREATE POLICY "teachers_write_assignments" ON public.assignments
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teachers_update_assignments" ON public.assignments
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "teachers_delete_assignments" ON public.assignments
  FOR DELETE USING (teacher_id = auth.uid());
