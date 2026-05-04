-- RPCs admin para gestionar el catálogo de frases de duelo/batalla
-- desde el panel de administración. Mismo patrón que avatar_admin_*.
--
-- Acceso restringido a teachers.role='admin'.
--
-- equipped_count cuenta cuántos usuarios (alumnos + docentes) tienen la
-- frase en alguno de sus 4 slots equipados.

-- ---------------------------------------------------------------------------
-- LIST
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.phrase_admin_list()
RETURNS TABLE(
  id                 UUID,
  code               TEXT,
  text               TEXT,
  emoji              TEXT,
  category           TEXT,
  rarity             TEXT,
  is_default         BOOLEAN,
  unlock_requirement JSONB,
  active             BOOLEAN,
  sort_order         INT,
  created_at         TIMESTAMPTZ,
  equipped_count     BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teachers t WHERE t.id = auth.uid() AND t.role = 'admin') THEN
    RAISE EXCEPTION 'Solo admin';
  END IF;

  RETURN QUERY
  SELECT d.id, d.code, d.text, d.emoji, d.category, d.rarity, d.is_default,
         d.unlock_requirement, d.active, d.sort_order, d.created_at,
         COALESCE(
           (SELECT COUNT(*) FROM student_duel_phrases sdp WHERE sdp.phrase_id = d.id),
           0
         ) +
         COALESCE(
           (SELECT COUNT(*) FROM teacher_duel_phrases tdp WHERE tdp.phrase_id = d.id),
           0
         ) AS equipped_count
  FROM duel_phrase_definitions d
  ORDER BY d.sort_order, d.code;
END;
$$;

REVOKE ALL ON FUNCTION public.phrase_admin_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.phrase_admin_list() TO authenticated;

-- ---------------------------------------------------------------------------
-- UPSERT  (crear/editar)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.phrase_admin_upsert(
  p_code               TEXT,
  p_text               TEXT,
  p_emoji              TEXT,
  p_category           TEXT,
  p_rarity             TEXT,
  p_is_default         BOOLEAN,
  p_unlock_requirement JSONB,
  p_sort_order         INT,
  p_active             BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN jsonb_build_object('error', 'Solo admin');
  END IF;

  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN jsonb_build_object('error', 'Código requerido');
  END IF;
  IF p_text IS NULL OR length(trim(p_text)) = 0 THEN
    RETURN jsonb_build_object('error', 'Texto requerido');
  END IF;
  IF p_category NOT IN ('tease','cheer','funny','neutral') THEN
    RETURN jsonb_build_object('error', 'Categoría inválida');
  END IF;
  IF p_rarity NOT IN ('common','rare','epic','legendary','mythic') THEN
    RETURN jsonb_build_object('error', 'Rareza inválida');
  END IF;

  INSERT INTO duel_phrase_definitions (
    code, text, emoji, category, rarity, is_default,
    unlock_requirement, sort_order, active
  ) VALUES (
    p_code, p_text, NULLIF(p_emoji, ''), p_category, p_rarity, COALESCE(p_is_default, false),
    p_unlock_requirement, COALESCE(p_sort_order, 999), COALESCE(p_active, true)
  )
  ON CONFLICT (code) DO UPDATE SET
    text               = EXCLUDED.text,
    emoji              = EXCLUDED.emoji,
    category           = EXCLUDED.category,
    rarity             = EXCLUDED.rarity,
    is_default         = EXCLUDED.is_default,
    unlock_requirement = EXCLUDED.unlock_requirement,
    sort_order         = EXCLUDED.sort_order,
    active             = EXCLUDED.active;

  RETURN jsonb_build_object('ok', true, 'code', p_code);
END;
$$;

REVOKE ALL ON FUNCTION public.phrase_admin_upsert(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB, INT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.phrase_admin_upsert(TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, JSONB, INT, BOOLEAN) TO authenticated;

-- ---------------------------------------------------------------------------
-- DELETE
-- ---------------------------------------------------------------------------
-- ON DELETE CASCADE en student_duel_phrases / teacher_duel_phrases /
-- student_unlocked_phrases ya limpia los slots y desbloqueos asociados.
CREATE OR REPLACE FUNCTION public.phrase_admin_delete(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN jsonb_build_object('error', 'Solo admin');
  END IF;
  DELETE FROM duel_phrase_definitions WHERE code = p_code;
  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.phrase_admin_delete(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.phrase_admin_delete(TEXT) TO authenticated;
