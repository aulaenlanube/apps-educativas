-- =====================================================================
-- Revisión Detective Sentences · 43 deletes + 5 trim
-- Mismo bug pattern que Ordena Frases (heredado).
-- =====================================================================

BEGIN;

-- Borrar duplicados (34 valencià + 9 francés)
DELETE FROM detective_sentences WHERE id IN (
  2582,2594,2595,2596,2597,2598,2619,2620,2621,
  3244,3246,3247,3248,3249,3250,3251,3252,3253,3254,3255,
  3296,3298,3299,3301,3302,3304,3305,3306,3307,3308,3309,3310,3311,3312,3313,
  3314,3315,3316,3317,3318,3319,3320,3321
);

-- Trim de espacios al inicio/final
UPDATE detective_sentences SET sentence = TRIM(sentence)
WHERE id IN (2575, 2578, 2590, 2593, 2596);
-- Nota: 2596 ya se borra arriba; el UPDATE será no-op.

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
