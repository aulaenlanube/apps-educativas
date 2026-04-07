-- =====================================================================
-- Revisión rosco · ESO · Lengua · 1º a 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

-- Bug: 22447 'común' con def de campo léxico (y duplica solución con 22448)
UPDATE rosco_questions
SET solution = 'copla',
    definition = 'Estrofa popular española de cuatro versos.'
WHERE id = 22447;

-- Bug: 22664 'examen' X con def de prefijo (duplica con 22669)
UPDATE rosco_questions
SET solution = 'axioma',
    definition = 'Verdad evidente que no necesita demostración (contiene X).'
WHERE id = 22664;

-- Bug: 22433 ballade -> balada
UPDATE rosco_questions
SET solution = 'balada',
    definition = 'Poema narrativo breve de carácter épico-lírico.'
WHERE id = 22433;

-- Bug ortográfico: 22446 campo semantico -> campo semántico
UPDATE rosco_questions
SET solution = 'campo semántico'
WHERE id = 22446;

-- Definiciones ambiguas hiperónimo/hipónimo
UPDATE rosco_questions
SET definition = 'Palabra cuyo significado engloba a otras (ej: flor es hiperónimo de rosa).'
WHERE id = 22499;

UPDATE rosco_questions
SET definition = 'Palabra cuyo significado está incluido en otra más general (ej: rosa es hipónimo de flor).'
WHERE id = 22498;

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  22431, -- bibliografía
  22439, -- comunicación
  22452, -- determinante
  22501, -- interrogación
  22505, -- introducción
  22586  -- protagonista
);

-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Bug crítico: triplicado 'arte mayor' (22695, 22696, 22697)
DELETE FROM rosco_questions WHERE id IN (22696, 22697);
UPDATE rosco_questions
SET definition = 'Versos de nueve o más sílabas.'
WHERE id = 22695;

-- Bug crítico conceptual: 22853 oxítona (la def actual describe sobreesdrújula)
UPDATE rosco_questions
SET definition = 'Palabra con el acento en la última sílaba (sinónimo de aguda).'
WHERE id = 22853;

-- Bug: 22877 enfoque (def absurda 'antónimo de riqueza')
UPDATE rosco_questions
SET definition = 'Punto de vista o forma de abordar un tema (contiene Q).'
WHERE id = 22877;

-- Bug: 22876 flaqueza definición circular
UPDATE rosco_questions
SET definition = 'Debilidad física o moral, falta de fuerza (contiene Q).'
WHERE id = 22876;

-- Bug: 22840 enseñar definición circular (Ñ)
UPDATE rosco_questions
SET definition = 'Verbo: instruir o transmitir conocimientos (contiene Ñ).'
WHERE id = 22840;

-- Bug: 22945 'examen' X duplica con 22949 y def describe prefijo
UPDATE rosco_questions
SET solution = 'axioma',
    definition = 'Verdad evidente sin necesidad de demostración (contiene X).'
WHERE id = 22945;

-- Bug: 22815 literaria con definición incompleta
-- (id 22810 ya tiene 'literatura', así que renombramos a 'lírico')
UPDATE rosco_questions
SET solution = 'lírico',
    definition = 'Adjetivo: relativo a la poesía y los sentimientos.'
WHERE id = 22815;

-- Bug ortográfico: 22754 femenino con "Gènere" (catalán)
UPDATE rosco_questions
SET definition = 'Género gramatical opuesto al masculino.'
WHERE id = 22754;

-- Bug ortográfico: 22719 comedia con "Gènere" (catalán)
UPDATE rosco_questions
SET definition = 'Género teatral con final feliz y tono humorístico.'
WHERE id = 22719;

-- Duplicado: 22765 'género' duplica con 22755
DELETE FROM rosco_questions WHERE id = 22765;

-- Bug ortográfico: 22748 familia lexica -> familia léxica
UPDATE rosco_questions
SET solution = 'familia léxica'
WHERE id = 22748;

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  22709, -- bibliografía
  22725, -- determinante
  22781, -- interrogación
  22785, -- instrucciones
  22865, -- personificación
  22866  -- protagonista
);

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Duplicados de mayúscula
DELETE FROM rosco_questions WHERE id = 22976; -- Auto (mayúscula) duplicado de 22977 auto
DELETE FROM rosco_questions WHERE id = 23000; -- Carpe (mayúscula) duplicado de 23001 carpe

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  22985, -- bibliografía
  23004, -- determinante
  23056, -- interrogación
  23060  -- introducción
);

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Bug crítico: 23420 anotación interna del autor filtrada
UPDATE rosco_questions
SET definition = 'Régimen político español (1939-1975) que afectó profundamente a la literatura (contiene Q).'
WHERE id = 23420;

-- Bug crítico: 23337 'juegos olimpicos' con definición de literatura juvenil
UPDATE rosco_questions
SET solution = 'juvenil',
    definition = 'Literatura destinada a los jóvenes lectores.',
    difficulty = 2
WHERE id = 23337;

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  23326, -- interrogación
  23331, -- introducción
  23332  -- interjección
);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
