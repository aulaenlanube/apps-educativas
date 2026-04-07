-- =====================================================================
-- Revisión rosco · ESO · Educación Física · 1º a 4º ESO
-- Asignatura mayoritariamente limpia. Solo 9 deletes + 5 updates.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 17069; -- equipo Q duplicado

-- =====================================================================
-- 2º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (
  17266, -- juego limpio J duplicado
  17297, -- motricidad M duplicado
  17347, -- equipo Q duplicado
  17410, -- kiwi W duplicado
  17412  -- kiwi W duplicado
);

UPDATE rosco_questions
SET solution = 'jai alai',
    definition = 'Deporte vasco de pelota jugado con cesta curva.'
WHERE id = 17265;

UPDATE rosco_questions
SET solution = 'kick boxing',
    definition = 'Deporte de contacto que combina boxeo y patadas.'
WHERE id = 17272;

-- =====================================================================
-- 3º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (
  17496, -- Educación duplica con 17497
  17501  -- frecuencia cardiaca duplicado
);

UPDATE rosco_questions
SET solution = 'educación física',
    definition = 'Asignatura escolar dedicada al deporte y la actividad física.'
WHERE id = 17497;

UPDATE rosco_questions
SET solution = 'gesto técnico',
    definition = 'Movimiento corporal específico característico de un deporte.'
WHERE id = 17518;

-- =====================================================================
-- 4º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 17774; -- Educación duplica con 17775

UPDATE rosco_questions
SET solution = 'educación física',
    definition = 'Materia escolar centrada en el desarrollo motor y la actividad física.'
WHERE id = 17775;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
