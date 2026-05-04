-- Mejora la redacción de los unlock_label de los avatares.
-- No toca los unlock_requirement: solo el texto que ve el alumno.
--
-- Cambios:
--   1) "Consigue nota perfecta en X apps..." / "Consigue nota 10 en examen..."
--      → "Consigue un 10 en un examen ..."  (artículo + claridad)
--   2) "Aprueba con ≥X en N apps..."  → "Aprueba con X o más en N apps..."
--      Sustituye el símbolo ≥ por texto y normaliza los decimales con coma
--      (8,5 / 9,5) según convención española.
--   3) "con nota ≥ X" en exámenes de una app concreta → "con X o más".
--   4) "Aprueba N apps distintas de Plástica" → "Aprueba un examen de
--      Plástica en N apps distintas"  (las apps no se aprueban, los
--      exámenes sí).

-- ============================================================================
-- 1) "nota perfecta" / "nota 10 en examen" → "un 10 en un examen"
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen en 25 apps distintas'
WHERE code = 'avatar_007';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen en 50 apps distintas'
WHERE code = 'avatar_048';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Naturales en 15 apps distintas'
WHERE code = 'avatar_050';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Naturales o Biología en 50 apps distintas'
WHERE code = 'avatar_060';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen en 101 apps distintas'
WHERE code = 'avatar_069';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen en 30 apps distintas'
WHERE code = 'avatar_092';

-- ============================================================================
-- 2) "Aprueba con ≥X en N apps distintas[ de Y]" → "con X o más"
-- ============================================================================

-- Genéricos (sin asignatura)
UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 8,5 o más en 12 apps distintas'
WHERE code = 'avatar_002';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 7 o más en 10 apps distintas'
WHERE code = 'avatar_028';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 7 o más en 14 apps distintas'
WHERE code = 'avatar_036';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9 o más en 25 apps distintas'
WHERE code = 'avatar_053';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9,5 o más en 14 apps distintas'
WHERE code = 'avatar_070';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 8 o más en 14 apps distintas'
WHERE code = 'avatar_094';

-- Con asignatura
UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9 o más en 20 apps distintas de Lengua'
WHERE code = 'avatar_003';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 8 o más en 12 apps distintas de Lengua'
WHERE code = 'avatar_013';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 8 o más en 12 apps distintas de Sociales'
WHERE code = 'avatar_025';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 8 o más en 12 apps distintas de Naturales'
WHERE code = 'avatar_038';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 8 o más en 14 apps distintas de Matemáticas'
WHERE code = 'avatar_039';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9 o más en 12 apps distintas de Matemáticas'
WHERE code = 'avatar_049';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9,5 o más en 20 apps distintas de Matemáticas'
WHERE code = 'avatar_054';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9,5 o más en 22 apps distintas de Matemáticas'
WHERE code = 'avatar_055';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9 o más en 12 apps distintas de Lengua'
WHERE code = 'avatar_059';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con 9 o más en 18 apps distintas de Naturales'
WHERE code = 'avatar_099';

-- ============================================================================
-- 3) Exámenes de app concreta: "con nota ≥ X" → "con X o más"
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 12 exámenes de Ahorcado con 8 o más'
WHERE code = 'avatar_006';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 6 exámenes de Regla de Tres con 8 o más'
WHERE code = 'avatar_014';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 10 exámenes de Velocidad de Respuesta con 7 o más'
WHERE code = 'avatar_040';

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba 12 exámenes de Comprensión Escrita con 8 o más'
WHERE code = 'avatar_098';

-- ============================================================================
-- 4) "Aprueba N apps distintas de Plástica" → "Aprueba un examen de
--    Plástica en N apps distintas"  (las apps no se aprueban, los
--    exámenes sí).
-- ============================================================================

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba un examen de Plástica en 10 apps distintas'
WHERE code = 'avatar_056';
