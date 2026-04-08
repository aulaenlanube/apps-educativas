-- =====================================================================
-- Revisión rosco · Primaria · Tutoría · 1º a 6º
-- 4 updates. Asignatura muy limpia.
-- =====================================================================

BEGIN;

UPDATE rosco_questions SET definition = 'Órganos del sentido de la vista.' WHERE id = 14620; -- ojos
UPDATE rosco_questions SET definition = 'Forma de comportarse en sociedad.' WHERE id = 14739; -- modales
UPDATE rosco_questions SET definition = 'Verbo: transmitir conocimientos a otra persona (contiene Ñ).' WHERE id = 14750; -- enseñar
UPDATE rosco_questions SET definition = 'Que tiene la habilidad o aptitud para algo (contiene Z).' WHERE id = 14807; -- capaz

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
