-- =====================================================================
-- Revisión Ordena Frases · Fase 1 · Duplicados globales
-- 43 deletes. Mantiene el ID más bajo de cada grupo de duplicados exactos.
-- =====================================================================

BEGIN;

DELETE FROM ordena_frases WHERE id IN (
  -- Pequeños duplicados varios (CCSS, Mat, Bio, IA)
  3718, 3730, 3731, 3732, 3733, 3734, 3755, 3756, 3757,
  -- ESO Francés 2º (8 sobrantes)
  7485, 7487, 7488, 7489, 7490, 7491, 7492, 7493, 7494, 7495, 7496,
  -- ESO Valencià 3º (25 sobrantes)
  7537, 7539, 7540, 7542, 7543, 7545, 7546, 7547, 7548, 7549, 7550,
  7551, 7552, 7553, 7554, 7555, 7556, 7557, 7558, 7559, 7560, 7561, 7562
);

-- Verificación esperada: 43 filas borradas
-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
