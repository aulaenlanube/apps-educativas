-- ============================================================
-- Migracion: Sistema de chat profesor-alumno y co-docentes
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABLA: co-docentes de un grupo
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_group_teachers_group ON public.group_teachers(group_id);
CREATE INDEX IF NOT EXISTS idx_group_teachers_teacher ON public.group_teachers(teacher_id);

ALTER TABLE public.group_teachers ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 2. TABLA: mensajes de chat profesor-alumno
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- NULL = broadcast a todo el grupo
  sender_type TEXT NOT NULL CHECK (sender_type IN ('teacher', 'student')),
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_student ON public.group_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created ON public.group_messages(created_at);

ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 3. TABLA: estado de lectura por hilo de chat
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'student')),
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- NULL = hilo de broadcast
  last_read_at TIMESTAMPTZ DEFAULT now()
);

-- Indice unico para hilos con student_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_read_with_student
  ON public.chat_read_status (user_type, user_id, group_id, student_id)
  WHERE student_id IS NOT NULL;

-- Indice unico para hilos de broadcast (student_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_read_broadcast
  ON public.chat_read_status (user_type, user_id, group_id)
  WHERE student_id IS NULL;

ALTER TABLE public.chat_read_status ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 4. FUNCION HELPER: comprobar si un docente tiene acceso a un grupo
--    (es propietario o co-docente)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_teacher_of_group(
  p_teacher_id UUID,
  p_group_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.groups WHERE id = p_group_id AND teacher_id = p_teacher_id
    UNION ALL
    SELECT 1 FROM public.group_teachers WHERE group_id = p_group_id AND teacher_id = p_teacher_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 5. RLS para group_teachers
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "teachers_view_group_teachers" ON public.group_teachers
  FOR SELECT USING (is_teacher_of_group(auth.uid(), group_id));

CREATE POLICY "owner_manage_group_teachers" ON public.group_teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND teacher_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- 6. ACTUALIZAR RLS de groups para incluir co-docentes
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "groups_select_own" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_own" ON public.groups;
DROP POLICY IF EXISTS "groups_update_own" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_own" ON public.groups;
-- Limpiar intentos previos de esta migracion
DROP POLICY IF EXISTS "teachers_read_groups" ON public.groups;
DROP POLICY IF EXISTS "teachers_write_own_groups" ON public.groups;
DROP POLICY IF EXISTS "teachers_update_own_groups" ON public.groups;
DROP POLICY IF EXISTS "teachers_delete_own_groups" ON public.groups;

-- Politica de lectura: propietario o co-docente
CREATE POLICY "teachers_read_groups" ON public.groups
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_teachers gt WHERE gt.group_id = id AND gt.teacher_id = auth.uid())
  );

-- Politica de escritura: solo propietario
CREATE POLICY "teachers_write_own_groups" ON public.groups
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "teachers_update_own_groups" ON public.groups
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "teachers_delete_own_groups" ON public.groups
  FOR DELETE USING (teacher_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 7. ACTUALIZAR RLS de students para incluir co-docentes
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "students_select_own" ON public.students;
DROP POLICY IF EXISTS "students_update_own" ON public.students;
DROP POLICY IF EXISTS "students_delete_own" ON public.students;
-- Limpiar intentos previos de esta migracion
DROP POLICY IF EXISTS "teachers_read_students" ON public.students;
DROP POLICY IF EXISTS "teachers_write_students" ON public.students;
DROP POLICY IF EXISTS "teachers_update_students" ON public.students;
DROP POLICY IF EXISTS "teachers_delete_students" ON public.students;

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

-- ─────────────────────────────────────────────────────────────
-- 8. ACTUALIZAR RLS de assignments para incluir co-docentes
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "teachers_crud_own_assignments" ON public.assignments;
-- Limpiar intentos previos de esta migracion
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

-- ─────────────────────────────────────────────────────────────
-- 9. RPC: obtener grupos del docente (propios + co-docente)
-- ─────────────────────────────────────────────────────────────
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
      gr.teacher_id = auth.uid() AS is_owner,
      (SELECT COUNT(*) FROM public.students s WHERE s.group_id = gr.id) AS student_count,
      -- Info del propietario (para co-docentes)
      t.display_name AS owner_name,
      -- Co-docentes del grupo
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

-- ─────────────────────────────────────────────────────────────
-- 10. RPC: anadir co-docente por codigo de profesor
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_co_teacher(
  p_group_id UUID,
  p_teacher_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_group RECORD;
  v_co_teacher RECORD;
BEGIN
  -- Verificar que el grupo pertenece al docente actual
  SELECT id, teacher_id INTO v_group
  FROM public.groups
  WHERE id = p_group_id AND teacher_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Solo el propietario del grupo puede anadir co-docentes');
  END IF;

  -- Buscar al profesor por codigo
  SELECT id, display_name, teacher_code INTO v_co_teacher
  FROM public.teachers
  WHERE teacher_code = upper(trim(p_teacher_code));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Codigo de profesor no encontrado');
  END IF;

  -- No puede anadirse a si mismo
  IF v_co_teacher.id = auth.uid() THEN
    RETURN json_build_object('error', 'No puedes anadirte a ti mismo como co-docente');
  END IF;

  -- Insertar
  BEGIN
    INSERT INTO public.group_teachers (group_id, teacher_id, added_by)
    VALUES (p_group_id, v_co_teacher.id, auth.uid());
  EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object('error', 'Este profesor ya es co-docente de este grupo');
  END;

  RETURN json_build_object(
    'success', true,
    'teacher', json_build_object(
      'id', v_co_teacher.id,
      'display_name', v_co_teacher.display_name,
      'teacher_code', v_co_teacher.teacher_code
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 11. RPC: eliminar co-docente
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION remove_co_teacher(
  p_group_id UUID,
  p_teacher_id UUID
) RETURNS JSON AS $$
BEGIN
  -- Solo el propietario puede eliminar co-docentes
  IF NOT EXISTS (SELECT 1 FROM public.groups WHERE id = p_group_id AND teacher_id = auth.uid()) THEN
    RETURN json_build_object('error', 'Solo el propietario del grupo puede eliminar co-docentes');
  END IF;

  DELETE FROM public.group_teachers
  WHERE group_id = p_group_id AND teacher_id = p_teacher_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Co-docente no encontrado');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 12. RPC: docente envia mensaje (individual o broadcast)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION teacher_send_message(
  p_group_id UUID,
  p_student_id UUID, -- NULL = broadcast a todo el grupo
  p_message TEXT
) RETURNS JSON AS $$
DECLARE
  v_teacher RECORD;
  v_msg_id UUID;
BEGIN
  -- Verificar acceso al grupo
  IF NOT is_teacher_of_group(auth.uid(), p_group_id) THEN
    RETURN json_build_object('error', 'No tienes acceso a este grupo');
  END IF;

  -- Obtener datos del docente
  SELECT id, display_name INTO v_teacher
  FROM public.teachers WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Docente no encontrado');
  END IF;

  -- Si es mensaje individual, verificar que el alumno pertenece al grupo
  IF p_student_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id) THEN
      RETURN json_build_object('error', 'Alumno no encontrado en este grupo');
    END IF;
  END IF;

  INSERT INTO public.group_messages (group_id, student_id, sender_type, sender_id, sender_name, message)
  VALUES (p_group_id, p_student_id, 'teacher', auth.uid(), v_teacher.display_name, p_message)
  RETURNING id INTO v_msg_id;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 13. RPC: alumno envia mensaje al profesor (privado)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION student_send_message(
  p_student_id UUID,
  p_group_id UUID,
  p_message TEXT
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_msg_id UUID;
BEGIN
  -- Verificar que el alumno existe en el grupo
  SELECT id, display_name INTO v_student
  FROM public.students
  WHERE id = p_student_id AND group_id = p_group_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado en este grupo');
  END IF;

  -- El alumno siempre envia a su propio hilo privado (student_id = su id)
  INSERT INTO public.group_messages (group_id, student_id, sender_type, sender_id, sender_name, message)
  VALUES (p_group_id, p_student_id, 'student', p_student_id, v_student.display_name, p_message)
  RETURNING id INTO v_msg_id;

  RETURN json_build_object('success', true, 'message_id', v_msg_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 14. RPC: obtener mensajes de un hilo (para docente)
--     student_id = NULL → broadcasts, student_id = UUID → hilo privado
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_chat_messages(
  p_group_id UUID,
  p_student_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar acceso al grupo (docente)
  IF NOT is_teacher_of_group(auth.uid(), p_group_id) THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  SELECT json_agg(m ORDER BY m.created_at ASC) INTO v_result
  FROM (
    SELECT id, sender_type, sender_id, sender_name, message, created_at
    FROM public.group_messages
    WHERE group_id = p_group_id
      AND (
        (p_student_id IS NULL AND student_id IS NULL) -- broadcasts
        OR (p_student_id IS NOT NULL AND student_id = p_student_id) -- hilo privado
      )
    ORDER BY created_at ASC
  ) m;

  -- Actualizar last_read
  IF p_student_id IS NOT NULL THEN
    INSERT INTO public.chat_read_status (user_type, user_id, group_id, student_id, last_read_at)
    VALUES ('teacher', auth.uid(), p_group_id, p_student_id, now())
    ON CONFLICT (user_type, user_id, group_id, student_id) WHERE student_id IS NOT NULL
    DO UPDATE SET last_read_at = now();
  ELSE
    INSERT INTO public.chat_read_status (user_type, user_id, group_id, student_id, last_read_at)
    VALUES ('teacher', auth.uid(), p_group_id, NULL, now())
    ON CONFLICT (user_type, user_id, group_id) WHERE student_id IS NULL
    DO UPDATE SET last_read_at = now();
  END IF;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 15. RPC: obtener mensajes visibles para un alumno
--     Devuelve broadcasts + su hilo privado, separados
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION student_get_chat_messages(
  p_student_id UUID,
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_broadcasts JSON;
  v_private JSON;
  v_unread_broadcasts INT;
  v_unread_private INT;
  v_last_read_broadcast TIMESTAMPTZ;
  v_last_read_private TIMESTAMPTZ;
BEGIN
  -- Verificar alumno
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  -- Obtener last_read de broadcasts
  SELECT last_read_at INTO v_last_read_broadcast
  FROM public.chat_read_status
  WHERE user_type = 'student' AND user_id = p_student_id AND group_id = p_group_id AND student_id IS NULL;

  -- Obtener last_read de privado
  SELECT last_read_at INTO v_last_read_private
  FROM public.chat_read_status
  WHERE user_type = 'student' AND user_id = p_student_id AND group_id = p_group_id AND student_id = p_student_id;

  -- Broadcasts
  SELECT json_agg(m ORDER BY m.created_at ASC) INTO v_broadcasts
  FROM (
    SELECT id, sender_type, sender_id, sender_name, message, created_at
    FROM public.group_messages
    WHERE group_id = p_group_id AND student_id IS NULL
    ORDER BY created_at ASC
  ) m;

  -- Hilo privado
  SELECT json_agg(m ORDER BY m.created_at ASC) INTO v_private
  FROM (
    SELECT id, sender_type, sender_id, sender_name, message, created_at
    FROM public.group_messages
    WHERE group_id = p_group_id AND student_id = p_student_id
    ORDER BY created_at ASC
  ) m;

  -- Contar no leidos
  SELECT COUNT(*) INTO v_unread_broadcasts
  FROM public.group_messages
  WHERE group_id = p_group_id AND student_id IS NULL
    AND sender_type = 'teacher'
    AND (v_last_read_broadcast IS NULL OR created_at > v_last_read_broadcast);

  SELECT COUNT(*) INTO v_unread_private
  FROM public.group_messages
  WHERE group_id = p_group_id AND student_id = p_student_id
    AND sender_type = 'teacher'
    AND (v_last_read_private IS NULL OR created_at > v_last_read_private);

  -- Marcar como leido (broadcast)
  INSERT INTO public.chat_read_status (user_type, user_id, group_id, student_id, last_read_at)
  VALUES ('student', p_student_id, p_group_id, NULL, now())
  ON CONFLICT (user_type, user_id, group_id) WHERE student_id IS NULL
  DO UPDATE SET last_read_at = now();

  -- Marcar como leido (privado)
  INSERT INTO public.chat_read_status (user_type, user_id, group_id, student_id, last_read_at)
  VALUES ('student', p_student_id, p_group_id, p_student_id, now())
  ON CONFLICT (user_type, user_id, group_id, student_id) WHERE student_id IS NOT NULL
  DO UPDATE SET last_read_at = now();

  RETURN json_build_object(
    'broadcasts', COALESCE(v_broadcasts, '[]'::json),
    'private_messages', COALESCE(v_private, '[]'::json),
    'unread_broadcasts', v_unread_broadcasts,
    'unread_private', v_unread_private
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 16. RPC: resumen de chat para docente (overview de todos los hilos)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION teacher_get_chat_overview(
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_threads JSON;
  v_broadcast_count INT;
  v_broadcast_last JSON;
BEGIN
  -- Verificar acceso
  IF NOT is_teacher_of_group(auth.uid(), p_group_id) THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  -- Hilos privados con ultimo mensaje y no leidos
  SELECT json_agg(t ORDER BY t.has_unread DESC, t.last_message_at DESC) INTO v_threads
  FROM (
    SELECT
      s.id AS student_id,
      s.display_name,
      s.avatar_emoji,
      (SELECT COUNT(*) FROM public.group_messages gm WHERE gm.group_id = p_group_id AND gm.student_id = s.id) AS message_count,
      (SELECT MAX(gm.created_at) FROM public.group_messages gm WHERE gm.group_id = p_group_id AND gm.student_id = s.id) AS last_message_at,
      (SELECT gm.message FROM public.group_messages gm WHERE gm.group_id = p_group_id AND gm.student_id = s.id ORDER BY gm.created_at DESC LIMIT 1) AS last_message,
      (SELECT gm.sender_type FROM public.group_messages gm WHERE gm.group_id = p_group_id AND gm.student_id = s.id ORDER BY gm.created_at DESC LIMIT 1) AS last_sender,
      -- No leidos para este docente
      (
        SELECT COUNT(*) FROM public.group_messages gm
        WHERE gm.group_id = p_group_id AND gm.student_id = s.id
          AND gm.sender_type = 'student'
          AND gm.created_at > COALESCE(
            (SELECT last_read_at FROM public.chat_read_status
             WHERE user_type = 'teacher' AND user_id = auth.uid() AND group_id = p_group_id AND student_id = s.id),
            '1970-01-01'::timestamptz
          )
      ) AS unread_count,
      (
        SELECT COUNT(*) FROM public.group_messages gm
        WHERE gm.group_id = p_group_id AND gm.student_id = s.id
          AND gm.sender_type = 'student'
          AND gm.created_at > COALESCE(
            (SELECT last_read_at FROM public.chat_read_status
             WHERE user_type = 'teacher' AND user_id = auth.uid() AND group_id = p_group_id AND student_id = s.id),
            '1970-01-01'::timestamptz
          )
      ) > 0 AS has_unread
    FROM public.students s
    WHERE s.group_id = p_group_id
  ) t;

  -- Conteo de broadcasts
  SELECT COUNT(*) INTO v_broadcast_count
  FROM public.group_messages WHERE group_id = p_group_id AND student_id IS NULL;

  -- Ultimo broadcast
  SELECT json_build_object(
    'message', gm.message,
    'sender_name', gm.sender_name,
    'created_at', gm.created_at
  ) INTO v_broadcast_last
  FROM public.group_messages gm
  WHERE gm.group_id = p_group_id AND gm.student_id IS NULL
  ORDER BY gm.created_at DESC LIMIT 1;

  RETURN json_build_object(
    'threads', COALESCE(v_threads, '[]'::json),
    'broadcast_count', v_broadcast_count,
    'last_broadcast', v_broadcast_last
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 17. RPC: contar mensajes no leidos para un alumno (para badge)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION student_count_unread_messages(
  p_student_id UUID,
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_unread INT := 0;
  v_last_read_b TIMESTAMPTZ;
  v_last_read_p TIMESTAMPTZ;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id) THEN
    RETURN json_build_object('count', 0);
  END IF;

  SELECT last_read_at INTO v_last_read_b
  FROM public.chat_read_status
  WHERE user_type = 'student' AND user_id = p_student_id AND group_id = p_group_id AND student_id IS NULL;

  SELECT last_read_at INTO v_last_read_p
  FROM public.chat_read_status
  WHERE user_type = 'student' AND user_id = p_student_id AND group_id = p_group_id AND student_id = p_student_id;

  SELECT COUNT(*) INTO v_unread FROM public.group_messages
  WHERE group_id = p_group_id
    AND sender_type = 'teacher'
    AND (
      (student_id IS NULL AND (v_last_read_b IS NULL OR created_at > v_last_read_b))
      OR
      (student_id = p_student_id AND (v_last_read_p IS NULL OR created_at > v_last_read_p))
    );

  RETURN json_build_object('count', v_unread);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 18. ACTUALIZAR teacher_get_assignments_progress para co-docentes
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION teacher_get_assignments_progress(
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar que el docente tiene acceso al grupo (propietario o co-docente)
  IF NOT is_teacher_of_group(auth.uid(), p_group_id) THEN
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
      asg.teacher_id,
      -- Nombre del docente que asigno
      t.display_name as teacher_name,
      -- Si es individual, nombre del alumno
      st.display_name as student_name,
      -- Progreso
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
      CASE
        WHEN asg.student_id IS NOT NULL THEN 1
        ELSE (SELECT COUNT(*) FROM public.students WHERE group_id = p_group_id)
      END as total_students
    FROM public.assignments asg
    JOIN public.teachers t ON t.id = asg.teacher_id
    LEFT JOIN public.students st ON st.id = asg.student_id
    WHERE asg.group_id = p_group_id
  ) a;

  RETURN json_build_object(
    'success', true,
    'assignments', COALESCE(v_result, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────
-- 19. ACTUALIZAR teacher_get_student_stats para co-docentes
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION teacher_get_student_stats(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_stats JSON;
  v_apps_detail JSON;
  v_recent JSON;
BEGIN
  -- Verificar que el alumno pertenece a un grupo del docente (propietario o co-docente)
  SELECT s.id, s.username, s.display_name, s.avatar_emoji, s.group_id,
         s.created_at, g.name as group_name
  INTO v_student
  FROM public.students s
  JOIN public.groups g ON g.id = s.group_id
  WHERE s.id = p_student_id
    AND is_teacher_of_group(auth.uid(), s.group_id);

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

-- ─────────────────────────────────────────────────────────────
-- 20. PERMISOS
-- ─────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION is_teacher_of_group TO authenticated;
GRANT EXECUTE ON FUNCTION get_teacher_groups TO authenticated;
GRANT EXECUTE ON FUNCTION add_co_teacher TO authenticated;
GRANT EXECUTE ON FUNCTION remove_co_teacher TO authenticated;
GRANT EXECUTE ON FUNCTION teacher_send_message TO authenticated;
GRANT EXECUTE ON FUNCTION student_send_message TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION student_get_chat_messages TO anon, authenticated;
GRANT EXECUTE ON FUNCTION teacher_get_chat_overview TO authenticated;
GRANT EXECUTE ON FUNCTION student_count_unread_messages TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 21b. RPC: obtener alumnos de un grupo (SECURITY DEFINER)
--      Evita problemas con RLS
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_group_students(
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar acceso al grupo
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

-- ─────────────────────────────────────────────────────────────
-- 21. ACTUALIZAR create_students_bulk para co-docentes
-- ─────────────────────────────────────────────────────────────
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
  -- Verificar que el docente tiene acceso al grupo (propietario o co-docente)
  SELECT g.id, g.teacher_id INTO v_group
  FROM public.groups g
  WHERE g.id = p_group_id
    AND is_teacher_of_group(auth.uid(), p_group_id);

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Grupo no encontrado o no autorizado');
  END IF;

  FOREACH v_username IN ARRAY p_usernames LOOP
    v_clean_username := lower(trim(v_username));
    IF v_clean_username = '' THEN CONTINUE; END IF;

    BEGIN
      INSERT INTO public.students (group_id, teacher_id, username, display_name, password_hash)
      VALUES (
        p_group_id,
        v_group.teacher_id,  -- siempre el propietario del grupo
        v_clean_username,
        v_clean_username,
        NULL
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

-- ─────────────────────────────────────────────────────────────
-- 22. ACTUALIZAR reset_student_password para co-docentes
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reset_student_password(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_student RECORD;
BEGIN
  -- Verificar que el alumno pertenece a un grupo del docente
  SELECT s.id, s.group_id INTO v_student
  FROM public.students s
  WHERE s.id = p_student_id
    AND is_teacher_of_group(auth.uid(), s.group_id);

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Alumno no encontrado o no autorizado');
  END IF;

  UPDATE public.students
  SET password_hash = NULL,
      updated_at = now()
  WHERE id = p_student_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- 23. ACTUALIZAR create_student para co-docentes
-- ─────────────────────────────────────────────────────────────
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
    AND is_teacher_of_group(auth.uid(), p_group_id);

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
    v_group.teacher_id,  -- siempre el propietario del grupo
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
