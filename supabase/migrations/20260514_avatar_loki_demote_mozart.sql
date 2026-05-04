-- 1) avatar_101: era un "bardo de las runas" genérico → ahora es Loki
--    (mantiene rareza epic y criterio de Lengua: trickster del verbo).
-- 2) avatar_103 (Gandhi) y avatar_105 (Link): mythic → legendary.
--    Bajan points_bonus 0.5 → 0.4. Gandhi cambia de XP a racha de 75 días
--    (perseverancia en lugar de criterio mítico). Link mantiene level 80,
--    válido para legendary (≈ 197k XP, por debajo del legendary xp 500k).
-- 3) avatar_106 nuevo (Mozart, mythic): exámenes perfectos en 20 apps de
--    Música.

-- ---- Loki ----------------------------------------------------------------
UPDATE public.avatar_definitions
SET title = 'Dios del Engaño',
    description = 'Sonrisa torcida, ojos verdes y un don para cambiar el rumbo de la conversación. No miente: solo elige qué verdad cuenta primero.'
WHERE code = 'avatar_101';

-- ---- Gandhi (mythic → legendary) -----------------------------------------
UPDATE public.avatar_definitions
SET rarity = 'legendary',
    points_bonus = 0.4,
    unlock_label = 'Mantén una racha de 75 días seguidos jugando',
    unlock_requirement = '{"type":"streak_days","count":75}'::jsonb
WHERE code = 'avatar_103';

-- ---- Link (mythic → legendary) -------------------------------------------
UPDATE public.avatar_definitions
SET rarity = 'legendary',
    points_bonus = 0.4
WHERE code = 'avatar_105';

-- ---- Mozart (nuevo mythic) -----------------------------------------------
INSERT INTO public.avatar_definitions
  (code, title, description, rarity, points_bonus, image_lg, image_md, image_sm, unlock_label, unlock_requirement, sort_order)
VALUES
  ('avatar_106', 'Maestro de la Sinfonía',
   'Pluma en una mano, partitura en la otra. Las notas le bailan en la cabeza antes de tocar el piano; cuando suenan, todo cuadra.',
   'mythic', 0.5,
   '/images/avatar/512/avatar-106.webp', '/images/avatar/256/avatar-106.webp', '/images/avatar/128/avatar-106.webp',
   'Consigue un 10 en un examen de Música en 20 apps distintas',
   '{"type":"subject_exams","subject_id":"musica","count":20,"min_nota":9.95}'::jsonb,
   106)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  rarity = EXCLUDED.rarity,
  points_bonus = EXCLUDED.points_bonus,
  image_lg = EXCLUDED.image_lg,
  image_md = EXCLUDED.image_md,
  image_sm = EXCLUDED.image_sm,
  unlock_label = EXCLUDED.unlock_label,
  unlock_requirement = EXCLUDED.unlock_requirement,
  sort_order = EXCLUDED.sort_order;
