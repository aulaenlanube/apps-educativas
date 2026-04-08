-- =====================================================================
-- Revisión rosco · Primaria · Valencià · 1º a 6º
-- 1 delete + 5 updates. La mayoría de bugs ya cubiertos en global-anotaciones.sql.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 3º · Bugs en letra Ñ (NY)
-- =====================================================================

UPDATE rosco_questions
SET definition = 'Llavor del pi, comestible (conté NY).'
WHERE id = 15284; -- pinyó

UPDATE rosco_questions
SET solution = 'llenya',
    definition = 'Fusta tallada per a cremar al foc (conté NY).'
WHERE id = 15285;

-- =====================================================================
-- 5º · Anotaciones internas adicionales
-- =====================================================================

UPDATE rosco_questions
SET definition = 'Línia perpendicular a l''horitzó.'
WHERE id = 15497; -- vertical

UPDATE rosco_questions
SET definition = 'Mamífer corredor de camps i prats, semblant al conill però més gros.'
WHERE id = 15551; -- llebre

UPDATE rosco_questions
SET definition = 'Joguet que puja i baixa per un fil.'
WHERE id = 15632; -- ioiò

DELETE FROM rosco_questions WHERE id = 15633; -- platja Y (en valencià no porta Y)

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
