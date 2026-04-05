-- ============================================================
-- MIGRACIÓN: Sistema de Valoraciones, Feedback y Notificaciones
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de valoraciones por app+level+grade+subject
CREATE TABLE IF NOT EXISTS public.app_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'free', 'student')),
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  level TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_type, user_id, app_id, level, grade, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_app_ratings_app ON public.app_ratings(app_id, level, grade, subject_id);
CREATE INDEX IF NOT EXISTS idx_app_ratings_user ON public.app_ratings(user_type, user_id);

ALTER TABLE public.app_ratings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer las valoraciones (para ver medias)
CREATE POLICY "anyone_select_ratings" ON public.app_ratings
  FOR SELECT USING (true);

-- Teachers/free pueden insertar/actualizar sus propias valoraciones
CREATE POLICY "auth_upsert_own_ratings" ON public.app_ratings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "auth_update_own_ratings" ON public.app_ratings
  FOR UPDATE USING (user_id = auth.uid());

-- 2. Tabla de hilos de feedback
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'free', 'student')),
  user_id UUID NOT NULL,
  user_display_name TEXT NOT NULL,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  level TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_app ON public.app_feedback(app_id, level, grade, subject_id);
CREATE INDEX IF NOT EXISTS idx_app_feedback_user ON public.app_feedback(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_app_feedback_status ON public.app_feedback(status);

ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

-- Usuarios ven sus propios feedbacks
CREATE POLICY "users_select_own_feedback" ON public.app_feedback
  FOR SELECT USING (user_id = auth.uid());

-- Usuarios pueden crear feedbacks
CREATE POLICY "users_insert_feedback" ON public.app_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin puede ver todos los feedbacks
CREATE POLICY "admin_select_all_feedback" ON public.app_feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin puede actualizar feedback (para cambiar status)
CREATE POLICY "admin_update_feedback" ON public.app_feedback
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Tabla de mensajes de feedback (chat)
CREATE TABLE IF NOT EXISTS public.app_feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.app_feedback(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_messages_thread ON public.app_feedback_messages(feedback_id, created_at);

ALTER TABLE public.app_feedback_messages ENABLE ROW LEVEL SECURITY;

-- Usuarios ven mensajes de sus propios feedbacks
CREATE POLICY "users_select_own_messages" ON public.app_feedback_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.app_feedback
      WHERE id = app_feedback_messages.feedback_id AND user_id = auth.uid()
    )
  );

-- Usuarios pueden enviar mensajes en sus propios feedbacks
CREATE POLICY "users_insert_own_messages" ON public.app_feedback_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.app_feedback
      WHERE id = app_feedback_messages.feedback_id AND user_id = auth.uid()
    )
  );

-- Admin puede ver/enviar en todos los feedbacks
CREATE POLICY "admin_select_all_messages" ON public.app_feedback_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_insert_all_messages" ON public.app_feedback_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'free', 'student')),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'feedback_reply',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.user_notifications(user_type, user_id, read, created_at DESC);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Usuarios ven sus propias notificaciones
CREATE POLICY "users_select_own_notifications" ON public.user_notifications
  FOR SELECT USING (user_id = auth.uid());

-- Usuarios pueden marcar como leídas
CREATE POLICY "users_update_own_notifications" ON public.user_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admin puede crear notificaciones para cualquiera
CREATE POLICY "admin_insert_notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- RPCs
-- ============================================================

-- 5. Upsert de valoración (teacher/free usan auth, student via RPC)
CREATE OR REPLACE FUNCTION upsert_app_rating(
  p_user_type TEXT,
  p_user_id UUID,
  p_app_id TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT,
  p_rating INTEGER
) RETURNS JSON AS $$
BEGIN
  INSERT INTO public.app_ratings (user_type, user_id, app_id, level, grade, subject_id, rating)
  VALUES (p_user_type, p_user_id, p_app_id, p_level, p_grade, p_subject_id, p_rating)
  ON CONFLICT (user_type, user_id, app_id, level, grade, subject_id)
  DO UPDATE SET rating = p_rating, updated_at = now();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Obtener media de valoraciones de una app (público)
CREATE OR REPLACE FUNCTION get_app_avg_rating(
  p_app_id TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_avg NUMERIC;
  v_count INTEGER;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1), COUNT(*)
  INTO v_avg, v_count
  FROM public.app_ratings
  WHERE app_id = p_app_id AND level = p_level AND grade = p_grade AND subject_id = p_subject_id;

  RETURN json_build_object(
    'avg_rating', COALESCE(v_avg, 0),
    'total_ratings', v_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Obtener medias de todas las apps de un subject (para AppListPage)
CREATE OR REPLACE FUNCTION get_bulk_avg_ratings(
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(r), '[]'::json)
    FROM (
      SELECT app_id,
             ROUND(AVG(rating)::numeric, 1) as avg_rating,
             COUNT(*) as total_ratings
      FROM public.app_ratings
      WHERE level = p_level AND grade = p_grade AND subject_id = p_subject_id
      GROUP BY app_id
    ) r
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Obtener la valoración del usuario actual en una app
CREATE OR REPLACE FUNCTION get_user_rating(
  p_user_type TEXT,
  p_user_id UUID,
  p_app_id TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object('rating', rating)
    FROM public.app_ratings
    WHERE user_type = p_user_type AND user_id = p_user_id
      AND app_id = p_app_id AND level = p_level AND grade = p_grade AND subject_id = p_subject_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Crear hilo de feedback + primer mensaje
CREATE OR REPLACE FUNCTION create_feedback(
  p_user_type TEXT,
  p_user_id UUID,
  p_user_display_name TEXT,
  p_app_id TEXT,
  p_app_name TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT,
  p_message TEXT
) RETURNS JSON AS $$
DECLARE
  v_feedback_id UUID;
BEGIN
  -- Crear el hilo
  INSERT INTO public.app_feedback (user_type, user_id, user_display_name, app_id, app_name, level, grade, subject_id)
  VALUES (p_user_type, p_user_id, p_user_display_name, p_app_id, p_app_name, p_level, p_grade, p_subject_id)
  RETURNING id INTO v_feedback_id;

  -- Crear el primer mensaje
  INSERT INTO public.app_feedback_messages (feedback_id, sender_type, sender_id, sender_name, message)
  VALUES (v_feedback_id, 'user', p_user_id, p_user_display_name, p_message);

  RETURN json_build_object('success', true, 'feedback_id', v_feedback_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Admin responde a feedback + crea notificación
CREATE OR REPLACE FUNCTION admin_reply_feedback(
  p_feedback_id UUID,
  p_message TEXT
) RETURNS JSON AS $$
DECLARE
  v_admin_name TEXT;
  v_feedback RECORD;
BEGIN
  -- Verificar admin
  SELECT display_name INTO v_admin_name FROM public.teachers WHERE id = auth.uid() AND role = 'admin';
  IF v_admin_name IS NULL THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  -- Obtener info del feedback
  SELECT * INTO v_feedback FROM public.app_feedback WHERE id = p_feedback_id;
  IF v_feedback IS NULL THEN
    RETURN json_build_object('error', 'Feedback no encontrado');
  END IF;

  -- Insertar mensaje de admin
  INSERT INTO public.app_feedback_messages (feedback_id, sender_type, sender_id, sender_name, message)
  VALUES (p_feedback_id, 'admin', auth.uid(), v_admin_name, p_message);

  -- Actualizar timestamp del feedback
  UPDATE public.app_feedback SET updated_at = now() WHERE id = p_feedback_id;

  -- Crear notificación para el usuario
  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES (
    v_feedback.user_type,
    v_feedback.user_id,
    'feedback_reply',
    'Respuesta a tu comentario',
    'Un administrador ha respondido a tu comentario sobre ' || v_feedback.app_name,
    json_build_object(
      'feedback_id', p_feedback_id,
      'app_name', v_feedback.app_name,
      'app_id', v_feedback.app_id
    )::jsonb
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. Obtener feedbacks del usuario (con último mensaje)
CREATE OR REPLACE FUNCTION get_user_feedbacks(
  p_user_type TEXT,
  p_user_id UUID
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(f ORDER BY f.updated_at DESC), '[]'::json)
    FROM (
      SELECT
        fb.id, fb.app_id, fb.app_name, fb.level, fb.grade, fb.subject_id,
        fb.status, fb.created_at, fb.updated_at,
        (SELECT COUNT(*) FROM public.app_feedback_messages WHERE feedback_id = fb.id) as message_count,
        (SELECT message FROM public.app_feedback_messages WHERE feedback_id = fb.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT sender_type FROM public.app_feedback_messages WHERE feedback_id = fb.id ORDER BY created_at DESC LIMIT 1) as last_sender
      FROM public.app_feedback fb
      WHERE fb.user_type = p_user_type AND fb.user_id = p_user_id
    ) f
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. Admin: obtener todos los feedbacks paginados
CREATE OR REPLACE FUNCTION admin_get_feedbacks(
  p_status TEXT DEFAULT 'all',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20,
  p_search TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_feedbacks JSON;
  v_total INTEGER;
  v_offset INTEGER;
  v_search TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  v_offset := (GREATEST(p_page, 1) - 1) * p_page_size;
  v_search := CASE WHEN p_search IS NOT NULL AND p_search <> '' THEN '%' || LOWER(p_search) || '%' ELSE NULL END;

  -- Count
  SELECT COUNT(*) INTO v_total
  FROM public.app_feedback fb
  WHERE (p_status = 'all' OR fb.status = p_status)
    AND (v_search IS NULL OR LOWER(fb.app_name) LIKE v_search OR LOWER(fb.user_display_name) LIKE v_search);

  -- Feedbacks
  SELECT json_agg(f) INTO v_feedbacks
  FROM (
    SELECT
      fb.id, fb.user_type, fb.user_id, fb.user_display_name,
      fb.app_id, fb.app_name, fb.level, fb.grade, fb.subject_id,
      fb.status, fb.created_at, fb.updated_at,
      (SELECT COUNT(*) FROM public.app_feedback_messages WHERE feedback_id = fb.id) as message_count,
      (SELECT message FROM public.app_feedback_messages WHERE feedback_id = fb.id ORDER BY created_at ASC LIMIT 1) as first_message,
      (SELECT sender_type FROM public.app_feedback_messages WHERE feedback_id = fb.id ORDER BY created_at DESC LIMIT 1) as last_sender
    FROM public.app_feedback fb
    WHERE (p_status = 'all' OR fb.status = p_status)
      AND (v_search IS NULL OR LOWER(fb.app_name) LIKE v_search OR LOWER(fb.user_display_name) LIKE v_search)
    ORDER BY
      CASE WHEN fb.status = 'open' THEN 0 ELSE 1 END,
      fb.updated_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) f;

  RETURN json_build_object(
    'feedbacks', COALESCE(v_feedbacks, '[]'::json),
    'total', v_total,
    'open_count', (SELECT COUNT(*) FROM public.app_feedback WHERE status = 'open'),
    'resolved_count', (SELECT COUNT(*) FROM public.app_feedback WHERE status = 'resolved')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. Obtener mensajes de un hilo de feedback
-- p_user_id: necesario para alumnos (no tienen auth.uid())
CREATE OR REPLACE FUNCTION get_feedback_messages(
  p_feedback_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
BEGIN
  -- Verificar que el usuario es dueño del feedback o es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.app_feedback
    WHERE id = p_feedback_id AND (user_id = auth.uid() OR user_id = p_user_id)
    UNION
    SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(m ORDER BY m.created_at ASC), '[]'::json)
    FROM (
      SELECT id, sender_type, sender_id, sender_name, message, created_at
      FROM public.app_feedback_messages
      WHERE feedback_id = p_feedback_id
    ) m
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 14. Obtener notificaciones del usuario
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(n ORDER BY n.created_at DESC), '[]'::json)
    FROM (
      SELECT id, type, title, message, data, read, created_at
      FROM public.user_notifications
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT p_limit
    ) n
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 15. Marcar notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
) RETURNS JSON AS $$
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Marcar todas como leídas
    UPDATE public.user_notifications SET read = true
    WHERE user_id = p_user_id AND read = false;
  ELSE
    -- Marcar las especificadas
    UPDATE public.user_notifications SET read = true
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 16. Contar notificaciones no leídas
CREATE OR REPLACE FUNCTION count_unread_notifications(
  p_user_id UUID
) RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'count', (SELECT COUNT(*) FROM public.user_notifications WHERE user_id = p_user_id AND read = false)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 17. User reply a su propio feedback
CREATE OR REPLACE FUNCTION user_reply_feedback(
  p_feedback_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_message TEXT
) RETURNS JSON AS $$
BEGIN
  -- Verificar que el feedback pertenece al usuario
  IF NOT EXISTS (SELECT 1 FROM public.app_feedback WHERE id = p_feedback_id AND user_id = p_user_id) THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  INSERT INTO public.app_feedback_messages (feedback_id, sender_type, sender_id, sender_name, message)
  VALUES (p_feedback_id, 'user', p_user_id, p_user_name, p_message);

  UPDATE public.app_feedback SET updated_at = now(), status = 'open' WHERE id = p_feedback_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 18. Permisos
GRANT EXECUTE ON FUNCTION upsert_app_rating TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_app_avg_rating TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_bulk_avg_ratings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_rating TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_feedback TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_feedbacks TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_get_feedbacks TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_messages TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reply_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read TO anon, authenticated;
GRANT EXECUTE ON FUNCTION count_unread_notifications TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_reply_feedback TO anon, authenticated;
