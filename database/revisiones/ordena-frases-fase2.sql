-- =====================================================================
-- Revisión Ordena Frases · Fase 2 · Limpieza cosmética
-- 4 updates: trim de espacios al final.
-- =====================================================================

BEGIN;

UPDATE ordena_frases SET sentence = TRIM(sentence) WHERE id IN (3711, 3714, 3726, 3729);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
