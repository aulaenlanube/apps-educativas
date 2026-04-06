-- Función para eliminar la valoración + feedbacks relacionados
CREATE OR REPLACE FUNCTION delete_app_rating(
  p_user_type TEXT,
  p_user_id UUID,
  p_app_id TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_deleted_feedbacks INTEGER;
BEGIN
  -- Eliminar valoración
  DELETE FROM public.app_ratings
  WHERE user_type = p_user_type AND user_id = p_user_id
    AND app_id = p_app_id AND level = p_level AND grade = p_grade AND subject_id = p_subject_id;

  -- Eliminar mensajes de los feedbacks de esta app/curso/asignatura del usuario
  DELETE FROM public.app_feedback_messages
  WHERE feedback_id IN (
    SELECT id FROM public.app_feedback
    WHERE user_type = p_user_type AND user_id = p_user_id
      AND app_id = p_app_id AND level = p_level AND grade = p_grade AND subject_id = p_subject_id
  );

  -- Eliminar los feedbacks
  DELETE FROM public.app_feedback
  WHERE user_type = p_user_type AND user_id = p_user_id
    AND app_id = p_app_id AND level = p_level AND grade = p_grade AND subject_id = p_subject_id
  RETURNING 1 INTO v_deleted_feedbacks;

  GET DIAGNOSTICS v_deleted_feedbacks = ROW_COUNT;

  RETURN json_build_object('success', true, 'feedbacks_removed', v_deleted_feedbacks);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION delete_app_rating TO anon, authenticated;

-- Función para obtener la última dificultad indicada por el usuario para una app
CREATE OR REPLACE FUNCTION get_user_difficulty(
  p_user_type TEXT,
  p_user_id UUID,
  p_app_id TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_last_msg TEXT;
  v_difficulty TEXT := null;
BEGIN
  SELECT m.message INTO v_last_msg
  FROM public.app_feedback_messages m
  JOIN public.app_feedback f ON f.id = m.feedback_id
  WHERE f.user_type = p_user_type AND f.user_id = p_user_id
    AND f.app_id = p_app_id AND f.level = p_level AND f.grade = p_grade AND f.subject_id = p_subject_id
    AND m.sender_type = 'user'
    AND (m.message LIKE '%[Demasiado facil%' OR m.message LIKE '%[Dificultad adecuada%' OR m.message LIKE '%[Demasiado dificil%')
  ORDER BY m.created_at DESC
  LIMIT 1;

  IF v_last_msg LIKE '%[Demasiado facil%' THEN v_difficulty := 'easy';
  ELSIF v_last_msg LIKE '%[Dificultad adecuada%' THEN v_difficulty := 'ok';
  ELSIF v_last_msg LIKE '%[Demasiado dificil%' THEN v_difficulty := 'hard';
  END IF;

  RETURN json_build_object('difficulty', v_difficulty);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_user_difficulty TO anon, authenticated;
