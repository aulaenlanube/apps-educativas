-- =====================================================================
-- Revisión rosco · Primaria · Programación · 1º a 6º
-- 5 updates. Asignatura muy limpia.
-- =====================================================================

BEGIN;

UPDATE rosco_questions SET definition = 'Organización por niveles de importancia o mando.' WHERE id = 14448; -- jerarquía
UPDATE rosco_questions SET definition = 'Dimensión o medida de un objeto digital (contiene Ñ).' WHERE id = 14477; -- tamaño
UPDATE rosco_questions SET definition = 'Pieza de código que se arrastra en Scratch para programar (contiene Q).' WHERE id = 14490; -- bloque
UPDATE rosco_questions SET definition = 'Conjunto de componentes físicos del ordenador (contiene Q).' WHERE id = 14491; -- equipo
UPDATE rosco_questions SET definition = 'Verbo: juntar o concatenar dos cadenas de texto.' WHERE id = 14515; -- unir

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
