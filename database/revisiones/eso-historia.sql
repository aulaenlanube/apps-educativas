-- =====================================================================
-- Revisión rosco · ESO · Historia · 1º a 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

-- Bug: 20214 'homo sapiens' H/contiene con def de jeroglífico
UPDATE rosco_questions
SET solution = 'alhambra',
    definition = 'Conjunto monumental nazarí de Granada (contiene H).'
WHERE id = 20214;

-- Bug ortográfico: 20213 'hieroglífico' duplica concepto con jeroglífico (20231 J)
DELETE FROM rosco_questions WHERE id = 20213;

-- Triplicado 'conquista' en Q (20311 y 20312 con definiciones absurdas)
DELETE FROM rosco_questions WHERE id IN (20311, 20312);

-- Duplicado: 20406 zona Z duplica con 20401
DELETE FROM rosco_questions WHERE id = 20406;

-- Bug: 20407 'capa de ozono' Z con def de cenit
UPDATE rosco_questions
SET definition = 'Zona de la atmósfera que protege a la Tierra de los rayos UV (contiene Z).'
WHERE id = 20407;

-- Bug: 20386 'máximo' X con def de Pontifex Maximus
UPDATE rosco_questions
SET definition = 'Adjetivo: lo más grande, opuesto a mínimo (contiene X).'
WHERE id = 20386;

-- Definición que da pista: 20259 lítico
UPDATE rosco_questions
SET definition = 'Adjetivo: relativo a la piedra como material.'
WHERE id = 20259;

-- Reclasificación 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id = 20143; -- arquitectura

-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Duplicado: 20438 Carlos (mayúscula) duplica con 20439 carlos
DELETE FROM rosco_questions WHERE id = 20438;

-- Bug: 20683 'capa de ozono' Z con def de Aljafería
UPDATE rosco_questions
SET solution = 'aljafería',
    definition = 'Palacio árabe situado en Zaragoza (contiene Z).'
WHERE id = 20683;

-- Duplicados placeholder: 20684 y 20685 zona Z
DELETE FROM rosco_questions WHERE id IN (20684, 20685);

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Definiciones que dan pista
UPDATE rosco_questions
SET definition = 'Reyes que unificaron España e iniciaron la conquista de América.'
WHERE id = 20708; -- católicos

UPDATE rosco_questions
SET definition = 'Tratamiento honorífico para fundadores religiosos canonizados.'
WHERE id = 20886; -- san

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Bug: 21073 Legión (mayúscula)
UPDATE rosco_questions
SET solution = 'legión'
WHERE id = 21073;

-- Bug: 21195 war definición pobre
UPDATE rosco_questions
SET definition = 'Palabra inglesa para "guerra", clave en la 2GM (World ... II).'
WHERE id = 21195;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
