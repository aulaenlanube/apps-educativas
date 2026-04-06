-- ============================================================
-- Función: Reiniciar experiencia de un usuario (admin only)
-- Soporta students y teachers/free
-- ============================================================

CREATE OR REPLACE FUNCTION admin_reset_gamification(
  p_user_id UUID,
  p_user_type TEXT  -- 'student' | 'teacher' | 'free'
) RETURNS JSON AS $$
DECLARE
  v_deleted_badges INTEGER;
BEGIN
  IF p_user_type = 'student' THEN
    -- Verificar que existe
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_user_id) THEN
      RETURN json_build_object('error', 'Alumno no encontrado');
    END IF;

    SELECT COUNT(*) INTO v_deleted_badges FROM public.student_badges WHERE student_id = p_user_id;
    DELETE FROM public.student_badges WHERE student_id = p_user_id;
    DELETE FROM public.xp_log WHERE student_id = p_user_id;
    DELETE FROM public.student_xp WHERE student_id = p_user_id;

  ELSIF p_user_type IN ('teacher', 'free') THEN
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = p_user_id) THEN
      RETURN json_build_object('error', 'Usuario no encontrado');
    END IF;

    SELECT COUNT(*) INTO v_deleted_badges FROM public.teacher_badges WHERE teacher_id = p_user_id;
    DELETE FROM public.teacher_badges WHERE teacher_id = p_user_id;
    DELETE FROM public.teacher_xp_log WHERE teacher_id = p_user_id;
    DELETE FROM public.teacher_xp WHERE teacher_id = p_user_id;

  ELSE
    RETURN json_build_object('error', 'Tipo de usuario no valido');
  END IF;

  RETURN json_build_object(
    'success', true,
    'badges_removed', v_deleted_badges
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION admin_reset_gamification TO anon, authenticated;
