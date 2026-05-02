-- =====================================================
-- AVATAR SYSTEM — paso 3: RPCs públicas
-- =====================================================

-- Catálogo público (todos los avatares activos, sin progreso del alumno)
CREATE OR REPLACE FUNCTION public.avatar_list_definitions()
RETURNS TABLE (
  code text,
  title text,
  description text,
  rarity text,
  points_bonus numeric,
  image_lg text,
  image_md text,
  image_sm text,
  unlock_label text,
  unlock_requirement jsonb,
  sort_order int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.code, a.title, a.description, a.rarity, a.points_bonus,
         a.image_lg, a.image_md, a.image_sm,
         a.unlock_label, a.unlock_requirement, a.sort_order
  FROM avatar_definitions a
  WHERE a.active = true
  ORDER BY a.sort_order, a.code;
$$;
GRANT EXECUTE ON FUNCTION public.avatar_list_definitions() TO anon, authenticated;

-- Colección del alumno con progreso, propiedad y selección
CREATE OR REPLACE FUNCTION public.avatar_get_my_collection(
  p_student_id uuid,
  p_session_token text
)
RETURNS TABLE (
  code text,
  title text,
  description text,
  rarity text,
  points_bonus numeric,
  image_lg text,
  image_md text,
  image_sm text,
  unlock_label text,
  unlock_requirement jsonb,
  owned boolean,
  earned_at timestamptz,
  selected boolean,
  progress int,
  target int,
  pct int,
  sort_order int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sid uuid;
  v_selected text;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN;
  END IF;

  SELECT s.selected_avatar_code INTO v_selected
  FROM students s WHERE s.id = p_student_id;

  RETURN QUERY
  SELECT
    a.code, a.title, a.description, a.rarity, a.points_bonus,
    a.image_lg, a.image_md, a.image_sm,
    a.unlock_label, a.unlock_requirement,
    sa.id IS NOT NULL AS owned,
    sa.earned_at,
    a.code = v_selected AS selected,
    (p.j->>'progress')::int AS progress,
    (p.j->>'target')::int AS target,
    (p.j->>'pct')::int AS pct,
    a.sort_order
  FROM avatar_definitions a
  LEFT JOIN student_avatars sa
    ON sa.student_id = p_student_id AND sa.avatar_id = a.id
  CROSS JOIN LATERAL (
    SELECT public._avatar_progress(p_student_id, a.unlock_requirement) AS j
  ) p
  WHERE a.active = true
  ORDER BY a.sort_order, a.code;
END;
$$;
GRANT EXECUTE ON FUNCTION public.avatar_get_my_collection(uuid, text) TO anon, authenticated;

-- Selecciona avatar (debe ser propiedad del alumno o NULL = revertir a emoji)
CREATE OR REPLACE FUNCTION public.avatar_select(
  p_student_id uuid,
  p_session_token text,
  p_code text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sid uuid;
  v_avatar_id uuid;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error', 'Sesion invalida');
  END IF;

  IF p_code IS NULL THEN
    UPDATE students SET selected_avatar_code = NULL WHERE id = p_student_id;
    RETURN jsonb_build_object('ok', true, 'selected', NULL);
  END IF;

  SELECT a.id INTO v_avatar_id
  FROM avatar_definitions a
  WHERE a.code = p_code AND a.active = true;

  IF v_avatar_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Avatar no encontrado');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM student_avatars
    WHERE student_id = p_student_id AND avatar_id = v_avatar_id
  ) THEN
    RETURN jsonb_build_object('error', 'Avatar bloqueado');
  END IF;

  UPDATE students SET selected_avatar_code = p_code WHERE id = p_student_id;
  RETURN jsonb_build_object('ok', true, 'selected', p_code);
END;
$$;
GRANT EXECUTE ON FUNCTION public.avatar_select(uuid, text, text) TO anon, authenticated;

-- Comprueba todos los avatares y otorga los nuevos. Devuelve la lista de
-- códigos recién desbloqueados (para que la UI muestre toasts/notificación).
CREATE OR REPLACE FUNCTION public.avatar_check_unlocks(
  p_student_id uuid,
  p_session_token text DEFAULT NULL
) RETURNS TABLE (
  code text,
  title text,
  rarity text,
  points_bonus numeric,
  image_lg text,
  unlock_label text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sid uuid;
  v_def RECORD;
  v_progress jsonb;
  v_inserted_id uuid;
BEGIN
  IF p_session_token IS NOT NULL THEN
    v_sid := public._resolve_student_session(p_session_token);
    IF v_sid IS NULL OR v_sid <> p_student_id THEN
      RETURN;
    END IF;
  END IF;

  FOR v_def IN
    SELECT a.id, a.code, a.title, a.rarity, a.points_bonus, a.image_lg,
           a.unlock_label, a.unlock_requirement
    FROM avatar_definitions a
    WHERE a.active = true
      AND NOT EXISTS (
        SELECT 1 FROM student_avatars sa
        WHERE sa.student_id = p_student_id AND sa.avatar_id = a.id
      )
  LOOP
    v_progress := public._avatar_progress(p_student_id, v_def.unlock_requirement);
    IF (v_progress->>'progress')::int >= (v_progress->>'target')::int THEN
      INSERT INTO student_avatars (student_id, avatar_id)
      VALUES (p_student_id, v_def.id)
      ON CONFLICT DO NOTHING
      RETURNING id INTO v_inserted_id;

      IF v_inserted_id IS NOT NULL THEN
        code := v_def.code;
        title := v_def.title;
        rarity := v_def.rarity;
        points_bonus := v_def.points_bonus;
        image_lg := v_def.image_lg;
        unlock_label := v_def.unlock_label;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.avatar_check_unlocks(uuid, text) TO anon, authenticated;
