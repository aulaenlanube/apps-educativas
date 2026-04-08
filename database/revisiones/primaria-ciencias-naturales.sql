-- =====================================================================
-- Revisión rosco · Primaria · Ciencias Naturales · 1º a 6º
-- 2 deletes + 11 updates. Asignatura estructuralmente sana.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 2º
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 10278; -- líquido Q con def de néctar y solution sin Q
UPDATE rosco_questions SET definition = 'Parte alargada y gruesa que sostiene las ramas del árbol.' WHERE id = 10291; -- tronco
UPDATE rosco_questions SET definition = 'Líquido que sale al exprimir una fruta (contiene Z).' WHERE id = 10315; -- zumo

-- =====================================================================
-- 3º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Forma en la que se encuentra el agua (sólido, líquido, gas).' WHERE id = 10343; -- estado
UPDATE rosco_questions SET definition = 'Sentido que nos permite percibir los olores.' WHERE id = 10392; -- olfato
UPDATE rosco_questions SET definition = 'Lugar lleno de árboles donde viven muchos animales (contiene Q).' WHERE id = 10403; -- bosque

-- =====================================================================
-- 4º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Agua en estado sólido.' WHERE id = 10481; -- hielo
UPDATE rosco_questions SET definition = 'Aparato que realiza un trabajo (contiene Q).' WHERE id = 10528; -- máquina
UPDATE rosco_questions SET definition = 'Lugar seguro donde protegerse del peligro (contiene U).' WHERE id = 10548; -- refugio
UPDATE rosco_questions SET definition = 'Líquido obtenido al exprimir una fruta (contiene Z).' WHERE id = 10564; -- zumo

-- =====================================================================
-- 5º
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 10700; -- vatio W 'empieza' incorrecto (vatio empieza por V)

UPDATE rosco_questions SET definition = 'Producto que sirve para limpiar y desinfectar (contiene J).' WHERE id = 10623; -- jabón
UPDATE rosco_questions SET definition = 'Perjuicio o destrucción causada al entorno (contiene Ñ).' WHERE id = 10651; -- daño

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
