-- Recalibra los criterios de valoración (apps_rated, feedback_messages),
-- duelos y batallas. Los topes anteriores (200 ratings legendary, 95 duelos
-- legendary, 75 batallas mítico) eran exagerados.
--
-- Plan:
--   apps_rated         common 2 / rare 10 / epic 25 / legendary 50
--   feedback_messages  common 2 / rare 8 / epic 25 / legendary 60
--   duels_won          rare 6,12 / epic 18,25,32,40 / legendary 50,60,75 / mythic 101
--   battles_won        rare 5 / epic 10,15 / legendary 20 (Cristiano), 40 (Kobe) / mythic 50 (Jordan)

-- ============================================================================
-- VALORACIÓN — apps_rated
-- ============================================================================
UPDATE public.avatar_definitions
SET unlock_label = 'Valora 10 apps distintas',
    unlock_requirement = '{"type":"apps_rated","count":10}'::jsonb
WHERE code = 'avatar_093';

UPDATE public.avatar_definitions
SET unlock_label = 'Valora 25 apps distintas',
    unlock_requirement = '{"type":"apps_rated","count":25}'::jsonb
WHERE code = 'avatar_001';

UPDATE public.avatar_definitions
SET unlock_label = 'Valora 50 apps distintas',
    unlock_requirement = '{"type":"apps_rated","count":50}'::jsonb
WHERE code = 'avatar_065';

-- ============================================================================
-- VALORACIÓN — feedback_messages
-- ============================================================================
UPDATE public.avatar_definitions
SET unlock_label = 'Publica 8 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":8}'::jsonb
WHERE code = 'avatar_017';

UPDATE public.avatar_definitions
SET unlock_label = 'Publica 25 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":25}'::jsonb
WHERE code = 'avatar_021';

UPDATE public.avatar_definitions
SET unlock_label = 'Publica 60 comentarios de valoración',
    unlock_requirement = '{"type":"feedback_messages","count":60}'::jsonb
WHERE code = 'avatar_044';

-- ============================================================================
-- DUELOS
-- ============================================================================
-- Epic
UPDATE public.avatar_definitions
SET unlock_label = 'Gana 18 duelos',
    unlock_requirement = '{"type":"duels_won","count":18}'::jsonb
WHERE code = 'avatar_004';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 25 duelos',
    unlock_requirement = '{"type":"duels_won","count":25}'::jsonb
WHERE code = 'avatar_097';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 32 duelos',
    unlock_requirement = '{"type":"duels_won","count":32}'::jsonb
WHERE code = 'avatar_029';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 40 duelos',
    unlock_requirement = '{"type":"duels_won","count":40}'::jsonb
WHERE code = 'avatar_064';

-- Legendary (cap = 75)
UPDATE public.avatar_definitions
SET unlock_label = 'Gana 50 duelos',
    unlock_requirement = '{"type":"duels_won","count":50}'::jsonb
WHERE code = 'avatar_037';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 60 duelos',
    unlock_requirement = '{"type":"duels_won","count":60}'::jsonb
WHERE code = 'avatar_067';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 75 duelos',
    unlock_requirement = '{"type":"duels_won","count":75}'::jsonb
WHERE code = 'avatar_041';

-- Mythic (Goku) se mantiene en 101.

-- ============================================================================
-- BATALLAS — Jordan 50, Kobe 40, Cristiano 20
-- ============================================================================
-- Rare
UPDATE public.avatar_definitions
SET unlock_label = 'Gana 5 batallas',
    unlock_requirement = '{"type":"battles_won","count":5}'::jsonb
WHERE code = 'avatar_019';

-- Epic
UPDATE public.avatar_definitions
SET unlock_label = 'Gana 10 batallas',
    unlock_requirement = '{"type":"battles_won","count":10}'::jsonb
WHERE code = 'avatar_018';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 15 batallas',
    unlock_requirement = '{"type":"battles_won","count":15}'::jsonb
WHERE code = 'avatar_042';

-- Legendary
UPDATE public.avatar_definitions
SET unlock_label = 'Gana 20 batallas',
    unlock_requirement = '{"type":"battles_won","count":20}'::jsonb
WHERE code = 'avatar_047';  -- Cristiano

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 40 batallas',
    unlock_requirement = '{"type":"battles_won","count":40}'::jsonb
WHERE code = 'avatar_045';  -- Kobe

-- Mythic (Jordan)
UPDATE public.avatar_definitions
SET unlock_label = 'Gana 50 batallas',
    unlock_requirement = '{"type":"battles_won","count":50}'::jsonb
WHERE code = 'avatar_046';
