-- ============================================================
-- MIGRACIÓN: Agrupar valoraciones de dificultad en el panel admin
-- - Nuevo RPC: admin_get_difficulty_summary (resumen agregado)
-- - Modificar admin_get_feedbacks para excluir hilos solo-dificultad
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Nuevo RPC: resumen agregado de valoraciones de dificultad por app
CREATE OR REPLACE FUNCTION admin_get_difficulty_summary()
RETURNS JSON AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(r ORDER BY r.total_votes DESC), '[]'::json)
    FROM (
      SELECT
        f.app_id,
        MAX(f.app_name) as app_name,
        COUNT(*) FILTER (WHERE m.message = '[Demasiado facil para el nivel]') as easy_count,
        COUNT(*) FILTER (WHERE m.message = '[Dificultad adecuada para el nivel]') as ok_count,
        COUNT(*) FILTER (WHERE m.message = '[Demasiado dificil para el nivel]') as hard_count,
        COUNT(*) as total_votes
      FROM public.app_feedback f
      JOIN public.app_feedback_messages m ON m.feedback_id = f.id
      WHERE m.sender_type = 'user'
        AND m.message IN (
          '[Demasiado facil para el nivel]',
          '[Dificultad adecuada para el nivel]',
          '[Demasiado dificil para el nivel]'
        )
      GROUP BY f.app_id
    ) r
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION admin_get_difficulty_summary TO authenticated;

-- 2. Modificar admin_get_feedbacks para excluir hilos que SOLO tienen mensajes de dificultad
-- Un hilo se muestra SOLO si tiene al menos un mensaje de usuario que NO sea valoración de dificultad
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

  -- Count (excluyendo hilos solo-dificultad)
  SELECT COUNT(*) INTO v_total
  FROM public.app_feedback fb
  WHERE (p_status = 'all' OR fb.status = p_status)
    AND (v_search IS NULL OR LOWER(fb.app_name) LIKE v_search OR LOWER(fb.user_display_name) LIKE v_search)
    AND EXISTS (
      SELECT 1 FROM public.app_feedback_messages m2
      WHERE m2.feedback_id = fb.id
        AND m2.sender_type = 'user'
        AND m2.message NOT IN (
          '[Demasiado facil para el nivel]',
          '[Dificultad adecuada para el nivel]',
          '[Demasiado dificil para el nivel]'
        )
    );

  -- Feedbacks (excluyendo hilos solo-dificultad, mostrando primer mensaje de texto real)
  SELECT json_agg(f) INTO v_feedbacks
  FROM (
    SELECT
      fb.id, fb.user_type, fb.user_id, fb.user_display_name,
      fb.app_id, fb.app_name, fb.level, fb.grade, fb.subject_id,
      fb.status, fb.created_at, fb.updated_at,
      (SELECT COUNT(*) FROM public.app_feedback_messages WHERE feedback_id = fb.id) as message_count,
      (SELECT message FROM public.app_feedback_messages
       WHERE feedback_id = fb.id AND sender_type = 'user'
         AND message NOT IN (
           '[Demasiado facil para el nivel]',
           '[Dificultad adecuada para el nivel]',
           '[Demasiado dificil para el nivel]'
         )
       ORDER BY created_at ASC LIMIT 1) as first_message,
      (SELECT sender_type FROM public.app_feedback_messages WHERE feedback_id = fb.id ORDER BY created_at DESC LIMIT 1) as last_sender
    FROM public.app_feedback fb
    WHERE (p_status = 'all' OR fb.status = p_status)
      AND (v_search IS NULL OR LOWER(fb.app_name) LIKE v_search OR LOWER(fb.user_display_name) LIKE v_search)
      AND EXISTS (
        SELECT 1 FROM public.app_feedback_messages m2
        WHERE m2.feedback_id = fb.id
          AND m2.sender_type = 'user'
          AND m2.message NOT IN (
            '[Demasiado facil para el nivel]',
            '[Dificultad adecuada para el nivel]',
            '[Demasiado dificil para el nivel]'
          )
      )
    ORDER BY
      CASE WHEN fb.status = 'open' THEN 0 ELSE 1 END,
      fb.updated_at DESC
    LIMIT p_page_size OFFSET v_offset
  ) f;

  RETURN json_build_object(
    'feedbacks', COALESCE(v_feedbacks, '[]'::json),
    'total', v_total,
    'open_count', (
      SELECT COUNT(*) FROM public.app_feedback fb2
      WHERE fb2.status = 'open'
        AND EXISTS (
          SELECT 1 FROM public.app_feedback_messages m2
          WHERE m2.feedback_id = fb2.id AND m2.sender_type = 'user'
            AND m2.message NOT IN (
              '[Demasiado facil para el nivel]',
              '[Dificultad adecuada para el nivel]',
              '[Demasiado dificil para el nivel]'
            )
        )
    ),
    'resolved_count', (
      SELECT COUNT(*) FROM public.app_feedback fb3
      WHERE fb3.status = 'resolved'
        AND EXISTS (
          SELECT 1 FROM public.app_feedback_messages m3
          WHERE m3.feedback_id = fb3.id AND m3.sender_type = 'user'
            AND m3.message NOT IN (
              '[Demasiado facil para el nivel]',
              '[Dificultad adecuada para el nivel]',
              '[Demasiado dificil para el nivel]'
            )
        )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
