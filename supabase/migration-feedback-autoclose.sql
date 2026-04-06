-- ============================================================
-- Migración: Auto-resolver feedback según nota y dificultad
-- + Notificación al resolver
-- ============================================================

-- Recrear create_feedback con auto-resolución
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
  v_status TEXT := 'open';
  v_user_rating INTEGER;
  v_is_difficulty_issue BOOLEAN;
BEGIN
  -- Detectar si es un reporte de dificultad inadecuada
  v_is_difficulty_issue := (
    p_message LIKE '%[Demasiado facil para el nivel]%' OR
    p_message LIKE '%[Demasiado dificil para el nivel]%'
  );

  -- Si NO es problema de dificultad, mirar la nota del usuario
  IF NOT v_is_difficulty_issue THEN
    SELECT rating INTO v_user_rating
    FROM public.app_ratings
    WHERE user_type = p_user_type AND user_id = p_user_id
      AND app_id = p_app_id AND level = p_level AND grade = p_grade AND subject_id = p_subject_id;

    -- Si la nota es 8 o más (en escala 0-10), auto-resolver
    IF v_user_rating IS NOT NULL AND v_user_rating >= 8 THEN
      v_status := 'resolved';
    END IF;
  END IF;
  -- Si es problema de dificultad, siempre queda 'open' (valor por defecto)

  -- Crear el hilo
  INSERT INTO public.app_feedback (user_type, user_id, user_display_name, app_id, app_name, level, grade, subject_id, status)
  VALUES (p_user_type, p_user_id, p_user_display_name, p_app_id, p_app_name, p_level, p_grade, p_subject_id, v_status)
  RETURNING id INTO v_feedback_id;

  -- Crear el primer mensaje
  INSERT INTO public.app_feedback_messages (feedback_id, sender_type, sender_id, sender_name, message)
  VALUES (v_feedback_id, 'user', p_user_id, p_user_display_name, p_message);

  RETURN json_build_object('success', true, 'feedback_id', v_feedback_id, 'status', v_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION create_feedback TO anon, authenticated;

-- Función: resolver feedback + enviar notificación al usuario
CREATE OR REPLACE FUNCTION admin_resolve_feedback(
  p_feedback_id UUID,
  p_message TEXT DEFAULT NULL
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

  -- Marcar como resuelto
  UPDATE public.app_feedback SET status = 'resolved', updated_at = now() WHERE id = p_feedback_id;

  -- Si hay mensaje del admin, insertarlo
  IF p_message IS NOT NULL AND p_message != '' THEN
    INSERT INTO public.app_feedback_messages (feedback_id, sender_type, sender_id, sender_name, message)
    VALUES (p_feedback_id, 'admin', auth.uid(), v_admin_name, p_message);
  END IF;

  -- Notificar al usuario
  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES (
    v_feedback.user_type,
    v_feedback.user_id,
    'feedback_resolved',
    'Comentario resuelto',
    'Tu comentario sobre ' || v_feedback.app_name || ' ha sido revisado y resuelto.',
    json_build_object(
      'feedback_id', p_feedback_id,
      'app_name', v_feedback.app_name,
      'app_id', v_feedback.app_id
    )::jsonb
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION admin_resolve_feedback TO authenticated;
