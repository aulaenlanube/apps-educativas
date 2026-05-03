-- Frases especiales por avatar + frases desbloqueables.
--
-- 1. Cada avatar tiene una "signature_phrase" + "signature_emoji". Mientras
--    el alumno tiene ese avatar equipado, esa frase aparece como 5º botón
--    en la chat bar del duelo. Visible también en la galería antes de equipar.
-- 2. duel_phrase_definitions ahora alberga frases NO default con
--    unlock_requirement (mismo schema que avatares). Tabla pivote
--    student_unlocked_phrases para cachear desbloqueos.

ALTER TABLE public.avatar_definitions
  ADD COLUMN IF NOT EXISTS signature_phrase TEXT,
  ADD COLUMN IF NOT EXISTS signature_emoji  TEXT;

CREATE TABLE IF NOT EXISTS public.student_unlocked_phrases (
  student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  phrase_id    UUID NOT NULL REFERENCES public.duel_phrase_definitions(id) ON DELETE CASCADE,
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, phrase_id)
);
CREATE INDEX IF NOT EXISTS idx_student_unlocked_phrases_student
  ON public.student_unlocked_phrases (student_id);

ALTER TABLE public.student_unlocked_phrases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_unlocked_phrases_no_direct" ON public.student_unlocked_phrases;
CREATE POLICY "student_unlocked_phrases_no_direct"
  ON public.student_unlocked_phrases FOR ALL
  TO authenticated, anon USING (FALSE) WITH CHECK (FALSE);
REVOKE ALL ON public.student_unlocked_phrases FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helper: ¿puede usar esta phrase?
--   Default ⇒ sí. No-default ⇒ sí si está en student_unlocked_phrases.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._student_can_use_phrase(
  p_student_id UUID, p_phrase_id UUID
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.duel_phrase_definitions d
    WHERE d.id = p_phrase_id AND d.active = TRUE AND (
      d.is_default = TRUE
      OR EXISTS (
        SELECT 1 FROM public.student_unlocked_phrases up
        WHERE up.student_id = p_student_id AND up.phrase_id = p_phrase_id
      )
    )
  );
$$;

REVOKE ALL ON FUNCTION public._student_can_use_phrase(UUID, UUID) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: phrase_check_unlocks
--   Revisa todos los unlock_requirement de phrases NO default y otorga las
--   que cumplen el criterio (usa _avatar_progress, mismo schema). Devuelve
--   las nuevas.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.phrase_check_unlocks(
  p_student_id UUID, p_session_token TEXT DEFAULT NULL
) RETURNS TABLE(phrase_id UUID, code TEXT, text TEXT, emoji TEXT, rarity TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sid UUID;
  v_def RECORD;
  v_progress JSONB;
BEGIN
  IF p_session_token IS NOT NULL THEN
    v_sid := public._resolve_student_session(p_session_token);
    IF v_sid IS NULL OR v_sid <> p_student_id THEN RETURN; END IF;
  END IF;

  FOR v_def IN
    SELECT d.id, d.code, d.text, d.emoji, d.rarity, d.unlock_requirement
    FROM public.duel_phrase_definitions d
    WHERE d.active = TRUE AND d.is_default = FALSE
      AND d.unlock_requirement IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.student_unlocked_phrases up
        WHERE up.student_id = p_student_id AND up.phrase_id = d.id
      )
  LOOP
    v_progress := public._avatar_progress(p_student_id, v_def.unlock_requirement);
    IF (v_progress->>'progress')::int >= (v_progress->>'target')::int THEN
      INSERT INTO public.student_unlocked_phrases (student_id, phrase_id)
      VALUES (p_student_id, v_def.id)
      ON CONFLICT DO NOTHING;
      -- IMPORTANTE: usamos FOUND, no `RETURNING phrase_id INTO ...`, porque
      -- la columna phrase_id de la tabla colisiona con el OUT parameter
      -- homónimo de esta función (RETURNS TABLE(phrase_id ...)).
      IF FOUND THEN
        phrase_id := v_def.id;
        code      := v_def.code;
        text      := v_def.text;
        emoji     := v_def.emoji;
        rarity    := v_def.rarity;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.phrase_check_unlocks(UUID, TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC actualizada: student_get_my_phrases
--   Devuelve { slots, available, locked, signature }.
--   - signature: { phrase_id=null (es del avatar, no de duel_phrase_definitions),
--                  text, emoji, avatar_code } cuando hay avatar equipado con
--                  signature configurada, si no null.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_get_my_phrases(
  p_student_id UUID, p_session_token TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sid UUID;
  v_slots JSONB;
  v_available JSONB;
  v_locked JSONB;
  v_signature JSONB := NULL;
  v_avatar RECORD;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error','Sesion invalida');
  END IF;

  -- Auto-check de unlocks por si han llegado nuevos requisitos
  PERFORM public.phrase_check_unlocks(p_student_id, NULL);

  -- Slots
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'slot', sdp.slot,
    'phrase_id', d.id,
    'code', d.code,
    'text', d.text,
    'emoji', d.emoji,
    'category', d.category,
    'rarity', d.rarity
  ) ORDER BY sdp.slot), '[]'::jsonb)
  INTO v_slots
  FROM public.student_duel_phrases sdp
  JOIN public.duel_phrase_definitions d ON d.id = sdp.phrase_id
  WHERE sdp.student_id = p_student_id;

  -- Available: default + desbloqueadas
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'phrase_id', d.id,
    'code', d.code,
    'text', d.text,
    'emoji', d.emoji,
    'category', d.category,
    'rarity', d.rarity,
    'is_default', d.is_default,
    'unlocked', NOT d.is_default
  ) ORDER BY d.is_default DESC, d.sort_order, d.code), '[]'::jsonb)
  INTO v_available
  FROM public.duel_phrase_definitions d
  WHERE d.active = TRUE
    AND (d.is_default = TRUE OR EXISTS (
      SELECT 1 FROM public.student_unlocked_phrases up
      WHERE up.student_id = p_student_id AND up.phrase_id = d.id
    ));

  -- Locked: no-default sin desbloquear, con progreso
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'phrase_id', d.id,
    'code', d.code,
    'text', d.text,
    'emoji', d.emoji,
    'category', d.category,
    'rarity', d.rarity,
    'unlock_requirement', d.unlock_requirement,
    'progress', public._avatar_progress(p_student_id, d.unlock_requirement)
  ) ORDER BY d.sort_order, d.code), '[]'::jsonb)
  INTO v_locked
  FROM public.duel_phrase_definitions d
  WHERE d.active = TRUE AND d.is_default = FALSE
    AND NOT EXISTS (
      SELECT 1 FROM public.student_unlocked_phrases up
      WHERE up.student_id = p_student_id AND up.phrase_id = d.id
    );

  -- Signature: la del avatar equipado
  SELECT a.code, a.title, a.signature_phrase, a.signature_emoji, a.rarity
    INTO v_avatar
  FROM public.students s
  JOIN public.avatar_definitions a ON a.code = s.selected_avatar_code
  WHERE s.id = p_student_id AND a.signature_phrase IS NOT NULL;

  IF FOUND THEN
    v_signature := jsonb_build_object(
      'avatar_code', v_avatar.code,
      'avatar_title', v_avatar.title,
      'rarity', v_avatar.rarity,
      'text', v_avatar.signature_phrase,
      'emoji', COALESCE(v_avatar.signature_emoji, '✨')
    );
  END IF;

  RETURN jsonb_build_object(
    'slots', v_slots,
    'available', v_available,
    'locked', v_locked,
    'signature', v_signature
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_get_my_phrases(UUID, TEXT) TO anon, authenticated;
