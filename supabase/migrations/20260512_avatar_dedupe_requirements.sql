-- Avatares con requisitos duplicados: cada par compartía exactamente el mismo
-- unlock_requirement, así que se desbloqueaban a la vez. Reasigno los segundos
-- de cada par a criterios únicos coherentes con su temática.
--
-- Pares originales (pre-migración):
--   avatar_029 Gladiador Imperial  = avatar_058 Espíritu de Lucha  → duels_won 15
--   avatar_037 Señor Oscuro        = avatar_047 El Comandante       → duels_won 30
--
-- Tras esta migración:
--   avatar_058 Espíritu de Lucha  → streak_days 21 (perseverancia, semanas peleando)
--   avatar_047 El Comandante      → battles_won 15 en 1ª posición (líder de la tropa)
--
-- Validación: SELECT unlock_requirement::text, COUNT(*) FROM avatar_definitions
-- GROUP BY 1 HAVING COUNT(*) > 1; debe devolver 0 filas.

UPDATE public.avatar_definitions
SET unlock_label = 'Mantén una racha de 21 días',
    unlock_requirement = '{"type":"streak_days","count":21}'::jsonb
WHERE code = 'avatar_058';

UPDATE public.avatar_definitions
SET unlock_label = 'Gana 15 Quiz Battles en 1ª posición',
    unlock_requirement = '{"type":"battles_won","count":15,"position":1}'::jsonb
WHERE code = 'avatar_047';
