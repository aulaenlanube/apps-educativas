-- =====================================================================
-- Revisión rosco · ESO · Matemáticas · 1º a 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

-- Letra Z: borrar 5 placeholders 'Número que contiene la letra Z (ej: diez)'
-- (mantengo 23780 con def 'Número 10 (contiene Z).')
DELETE FROM rosco_questions WHERE id IN (23781, 23782, 23783, 23784, 23785);

-- Letra K: borrar entradas duplicadas/rotas de 'kilo'
-- (mantengo 23614 'kilo - Prefijo que significa mil')
DELETE FROM rosco_questions WHERE id IN (
  23619, -- 'Fórmula popular para área del triángulo (Base por...)'
  23620, -- anotación interna 'Usaremos: Kilo'
  23623  -- duplicado 'Mil gramos (empieza por K).'
);

-- Otros duplicados 1º ESO
DELETE FROM rosco_questions WHERE id IN (
  23653, -- nonágono duplicado de 23652
  23663, -- mañana Ñ duplicado de 23662
  23757  -- x duplicado de 23756
);

-- Bug: 23735 'valor absoluto' con def que da pista
UPDATE rosco_questions
SET definition = 'Distancia de un número al cero, siempre positivo.'
WHERE id = 23735;

-- Reclasificaciones 3 → 2 / 3 → 1
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  23535, -- cuadrilátero
  23536, -- circunferencia
  23601, -- intersección
  23719, -- transportador
  23690  -- equivalentes
);

UPDATE rosco_questions SET difficulty = 1 WHERE id = 23635; -- multiplicación

-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Letra Z: borrar 5 placeholders
DELETE FROM rosco_questions WHERE id IN (24060, 24061, 24062, 24063, 24064);

-- Letra K: borrar duplicados/rotos
DELETE FROM rosco_questions WHERE id IN (
  23892, -- 'Área de 100x100 metros (contiene K, es Hectárea)'
  23898  -- 'Nombre común del kilogramo' (duplica con 23891)
);

-- Anotación interna filtrada: 23888 'ejemplo' con texto del autor
UPDATE rosco_questions
SET definition = 'Caso concreto que ilustra una regla matemática (contiene J).'
WHERE id = 23888;

-- Anotación interna filtrada: 23972 'arquímedes'
UPDATE rosco_questions
SET definition = 'Famoso matemático griego de Siracusa (contiene Q).'
WHERE id = 23972;

-- Anotación interna filtrada: 23965 'izquierda' (duplica con 23966)
DELETE FROM rosco_questions WHERE id = 23965;

-- Bug ortográfico: 23844 'fúncion lineal' -> 'función lineal'
UPDATE rosco_questions
SET solution = 'función lineal'
WHERE id = 23844;

-- Bug: 23899 'kilómetros' (plural) -> 'kilómetro'
UPDATE rosco_questions
SET solution = 'kilómetro',
    definition = 'Distancia equivalente a mil metros (ej. maratón = 42 km).'
WHERE id = 23899;

-- Otros duplicados 2º ESO
DELETE FROM rosco_questions WHERE id IN (
  23845, -- función duplicado de 23838
  23920, -- múltiplo duplicado de 23916
  23976  -- regla de tres duplicado de 23975
);

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  23802, -- bidimensional
  23814, -- cuadrilátero
  23809, -- circunferencia
  23912, -- multiplicación
  24002, -- transportador
  23964  -- equivalentes
);

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Bug 'examen X': 24310 def describe eje, no examen
UPDATE rosco_questions
SET solution = 'axial',
    definition = 'Que se refiere a un eje (contiene X).'
WHERE id = 24310;

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  24086, -- circunferencia
  24189, -- multiplicación
  24308  -- aproximación
);

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Bug 'examen X': 24580 def describe eje, no examen
UPDATE rosco_questions
SET solution = 'axial',
    definition = 'Que se refiere a un eje (contiene X).'
WHERE id = 24580;

-- Reclasificaciones 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  24356, -- circunferencia
  24459, -- multiplicación
  24578  -- aproximación
);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
