-- =====================================================================
-- Revisión rosco · Primaria · Inglés · 1º a 6º
-- 5 deletes + 9 updates.
-- =====================================================================

BEGIN;

-- =====================================================================
-- Letra Ñ rota: en inglés no existe la Ñ, las 5 entradas son N
-- =====================================================================
DELETE FROM rosco_questions WHERE id BETWEEN 12179 AND 12183;
-- Verificación final
DELETE FROM rosco_questions WHERE subject_id='ingles' AND level='primaria' AND letter='Ñ';

-- =====================================================================
-- 1º-3º (compartido)
-- =====================================================================
UPDATE rosco_questions SET definition = 'A living being like a dog, a cat or a bird.' WHERE id = 12111; -- animal
UPDATE rosco_questions SET definition = 'Red, blue, green, yellow are examples of this.' WHERE id = 12123; -- color
UPDATE rosco_questions SET definition = 'A machine that can do tasks automatically.' WHERE id = 12203; -- robot
UPDATE rosco_questions SET definition = 'A car you pay to ride in (contains X).' WHERE id = 12232; -- taxi

-- =====================================================================
-- 4º
-- =====================================================================
-- 12373 size: anotación interna + def de prize
UPDATE rosco_questions
SET definition = 'How big or small something is.'
WHERE id = 12373;

UPDATE rosco_questions SET definition = 'The time of day after midday and before evening.' WHERE id = 12246; -- afternoon
UPDATE rosco_questions SET definition = 'Each one of a group, with no exceptions.' WHERE id = 12268; -- every

-- =====================================================================
-- 5º
-- =====================================================================
UPDATE rosco_questions SET definition = 'A round citrus fruit, also a color.' WHERE id = 12456; -- orange

-- =====================================================================
-- 6º
-- =====================================================================
UPDATE rosco_questions SET definition = 'A narrative or tale (contains Y).' WHERE id = 12643; -- story

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
