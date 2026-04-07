-- =====================================================================
-- Revisión rosco · ESO · Asignaturas menores
-- (Economía, IA, Programación, Robótica)
-- Solo 1 delete + 1 update.
-- =====================================================================

BEGIN;

-- =====================================================================
-- Economía · 4º ESO
-- =====================================================================

UPDATE rosco_questions
SET solution = 'valor añadido',
    definition = 'Diferencia entre el valor del producto final y el coste de las materias primas.'
WHERE id = 31124;

-- =====================================================================
-- Programación · 3º ESO
-- =====================================================================

DELETE FROM rosco_questions WHERE id = 27270; -- wan duplicado

-- =====================================================================
-- IA: sin cambios (todas las soluciones en mayúscula son consistentes)
-- Robótica: sin cambios (limpia)
-- =====================================================================

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
