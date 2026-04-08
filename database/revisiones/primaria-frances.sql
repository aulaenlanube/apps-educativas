-- =====================================================================
-- Revisión rosco · Primaria · Francés · 6º
-- 4 updates: definiciones que contenían la palabra francesa.
-- =====================================================================

BEGIN;

UPDATE rosco_questions
SET definition = 'Quelque chose qu''on boit, chaude ou froide.'
WHERE id = 11988; -- boisson

UPDATE rosco_questions
SET definition = 'Ce que le soleil nous donne pendant la journée.'
WHERE id = 12038; -- lumière

UPDATE rosco_questions
SET definition = 'La couleur du flamant ou de la fleur del jardin.'
WHERE id = 12067; -- rose

-- 12088 ville: ya cubierta en global-anotaciones.sql con def reescrita
-- pero la def actual aún contiene 'ville'. Reescribir.
UPDATE rosco_questions
SET definition = 'Lieu où vivent beaucoup de personnes (contraire de village).'
WHERE id = 12088; -- ville

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
