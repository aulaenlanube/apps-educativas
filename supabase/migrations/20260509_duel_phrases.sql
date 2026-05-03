-- Sistema de frases de duelo (chat predefinido en duelos 1 vs 1).
--
-- Modelo:
--   * duel_phrase_definitions: catálogo de frases (similar a avatar_definitions).
--     Las frases con is_default=true las puede usar cualquier alumno; las que no
--     requieren desbloqueo vía unlock_requirement (mismo schema que avatares,
--     reservado para fases siguientes).
--   * student_duel_phrases: 4 slots por alumno. Cada slot apunta a una phrase.
--
-- Las frases son efímeras durante la partida (se envían vía Realtime broadcast,
-- no se persiste el chat). El backend solo gestiona catálogo + slots.

CREATE TABLE IF NOT EXISTS public.duel_phrase_definitions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 TEXT NOT NULL UNIQUE,
  text                 TEXT NOT NULL CHECK (char_length(text) <= 80),
  emoji                TEXT,
  category             TEXT NOT NULL CHECK (category IN ('tease','cheer','funny','neutral')),
  rarity               TEXT NOT NULL DEFAULT 'common'
                       CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  is_default           BOOLEAN NOT NULL DEFAULT TRUE,
  unlock_requirement   JSONB,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order           INT NOT NULL DEFAULT 999,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phrase_def_active_sort
  ON public.duel_phrase_definitions (active, sort_order);

CREATE TABLE IF NOT EXISTS public.student_duel_phrases (
  student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  slot         SMALLINT NOT NULL CHECK (slot BETWEEN 0 AND 3),
  phrase_id    UUID NOT NULL REFERENCES public.duel_phrase_definitions(id) ON DELETE CASCADE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_student_duel_phrases_student
  ON public.student_duel_phrases (student_id);

ALTER TABLE public.duel_phrase_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_duel_phrases    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phrase_def_public_read" ON public.duel_phrase_definitions;
CREATE POLICY "phrase_def_public_read"
  ON public.duel_phrase_definitions FOR SELECT
  TO authenticated, anon USING (active = TRUE);

DROP POLICY IF EXISTS "student_phrases_no_direct" ON public.student_duel_phrases;
CREATE POLICY "student_phrases_no_direct"
  ON public.student_duel_phrases FOR ALL
  TO authenticated, anon USING (FALSE) WITH CHECK (FALSE);

REVOKE ALL ON public.student_duel_phrases FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed: 20 frases por defecto, mezcla tease/cheer/funny/neutral.
-- ---------------------------------------------------------------------------
INSERT INTO public.duel_phrase_definitions (code, text, emoji, category, sort_order) VALUES
  ('default_01', '¡Buena suerte!',                       '🍀', 'cheer',   1),
  ('default_02', '¡Que gane el mejor!',                  '🏆', 'cheer',   2),
  ('default_03', '¡Vamos allá!',                         '🚀', 'cheer',   3),
  ('default_04', '¡Qué buen movimiento!',                '⭐', 'cheer',   4),
  ('default_05', '¡Buena partida, rival!',               '🤝', 'cheer',   5),

  ('default_06', '¿Eso es todo lo que tienes?',          '😏', 'tease',   6),
  ('default_07', 'Más despacio, no te hagas daño',       '🐢', 'tease',   7),
  ('default_08', 'Avisa cuando empieces a jugar',        '📢', 'tease',   8),
  ('default_09', 'Casi, casi… pero no',                  '🎯', 'tease',   9),
  ('default_10', 'Te estoy esperando',                   '🥱', 'tease',  10),

  ('default_11', '¡Modo bestia activado!',               '🦁', 'funny',  11),
  ('default_12', '¡Que tiemble la pantalla!',            '⚡', 'funny',  12),
  ('default_13', '¡Aquí vamos!',                         '🎮', 'funny',  13),
  ('default_14', '¡Concentración total!',                '🧘', 'funny',  14),
  ('default_15', '¿Listo para la batalla?',              '⚔️', 'funny',  15),

  ('default_16', '¡A por todas!',                        '🔥', 'cheer',  16),
  ('default_17', '¡No te rindas!',                       '💪', 'cheer',  17),
  ('default_18', 'Ups, ha sido sin querer',              '😅', 'funny',  18),
  ('default_19', '¡Reacciona!',                          '👀', 'tease',  19),
  ('default_20', '¡GG!',                                 '🎉', 'neutral', 20)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- RPC: phrase_list_definitions
--   Devuelve catálogo público (frases activas).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.phrase_list_definitions()
RETURNS TABLE(
  id UUID, code TEXT, text TEXT, emoji TEXT,
  category TEXT, rarity TEXT, is_default BOOLEAN, sort_order INT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, code, text, emoji, category, rarity, is_default, sort_order
  FROM public.duel_phrase_definitions
  WHERE active = TRUE
  ORDER BY sort_order, code;
$$;

GRANT EXECUTE ON FUNCTION public.phrase_list_definitions() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Helper: ¿un alumno puede usar una phrase?
--   Por ahora: is_default=true OR (futuro) tabla student_unlocked_phrases.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._student_can_use_phrase(
  p_student_id UUID, p_phrase_id UUID
) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.duel_phrase_definitions
    WHERE id = p_phrase_id AND active = TRUE AND is_default = TRUE
  );
$$;

REVOKE ALL ON FUNCTION public._student_can_use_phrase(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._student_can_use_phrase(UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public._student_can_use_phrase(UUID, UUID) FROM authenticated;

-- ---------------------------------------------------------------------------
-- RPC: student_get_my_phrases
--   Devuelve: { slots: [4 entradas, una por slot 0..3, null si vacía],
--               available: [todas las phrases que el alumno puede usar] }
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
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error','Sesion invalida');
  END IF;

  -- Slots ocupados
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

  -- Catálogo disponible (por ahora, todas las default)
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'phrase_id', id,
    'code', code,
    'text', text,
    'emoji', emoji,
    'category', category,
    'rarity', rarity
  ) ORDER BY sort_order, code), '[]'::jsonb)
  INTO v_available
  FROM public.duel_phrase_definitions
  WHERE active = TRUE AND is_default = TRUE;

  RETURN jsonb_build_object(
    'slots', v_slots,
    'available', v_available
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_get_my_phrases(UUID, TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: student_set_phrase_slot
--   Asigna (o limpia) una phrase a un slot. p_phrase_id=NULL → vacía el slot.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_set_phrase_slot(
  p_student_id    UUID,
  p_session_token TEXT,
  p_slot          SMALLINT,
  p_phrase_id     UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sid UUID;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error','Sesion invalida');
  END IF;
  IF p_slot IS NULL OR p_slot < 0 OR p_slot > 3 THEN
    RETURN jsonb_build_object('error','Slot invalido (0-3)');
  END IF;

  IF p_phrase_id IS NULL THEN
    DELETE FROM public.student_duel_phrases
    WHERE student_id = p_student_id AND slot = p_slot;
    RETURN jsonb_build_object('success', TRUE, 'slot', p_slot, 'phrase_id', NULL);
  END IF;

  IF NOT public._student_can_use_phrase(p_student_id, p_phrase_id) THEN
    RETURN jsonb_build_object('error','No puedes usar esa frase');
  END IF;

  -- Evita duplicar la misma phrase en otro slot.
  DELETE FROM public.student_duel_phrases
  WHERE student_id = p_student_id AND phrase_id = p_phrase_id AND slot <> p_slot;

  INSERT INTO public.student_duel_phrases (student_id, slot, phrase_id, updated_at)
  VALUES (p_student_id, p_slot, p_phrase_id, NOW())
  ON CONFLICT (student_id, slot) DO UPDATE
    SET phrase_id = EXCLUDED.phrase_id, updated_at = NOW();

  RETURN jsonb_build_object('success', TRUE, 'slot', p_slot, 'phrase_id', p_phrase_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.student_set_phrase_slot(UUID, TEXT, SMALLINT, UUID) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Defaults: si un alumno nuevo no tiene slots, le asignamos las 4 primeras
-- phrases para que tenga algo en su primera partida.
-- Aplica retroactivamente al ejecutar la migración.
-- ---------------------------------------------------------------------------
INSERT INTO public.student_duel_phrases (student_id, slot, phrase_id)
SELECT s.id,
       (idx - 1)::smallint AS slot,
       d.id AS phrase_id
FROM public.students s
CROSS JOIN LATERAL (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order) AS idx
  FROM public.duel_phrase_definitions
  WHERE active = TRUE AND is_default = TRUE
  ORDER BY sort_order
  LIMIT 4
) d
WHERE NOT EXISTS (
  SELECT 1 FROM public.student_duel_phrases sdp WHERE sdp.student_id = s.id
)
ON CONFLICT DO NOTHING;
