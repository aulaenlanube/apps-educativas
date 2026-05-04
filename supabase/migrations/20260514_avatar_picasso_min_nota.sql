-- Endurece el avatar Picasso (avatar_056, "Maestro Cubista", legendary):
--   antes: 10 apps distintas de Plástica con cualquier nota
--   ahora: 20 apps distintas de Plástica con un 9,5 o más

UPDATE public.avatar_definitions
SET unlock_label = 'Aprueba con un 9,5 o más en 20 apps distintas de Plástica',
    unlock_requirement = '{"type":"subject_exams","subject_id":"plastica","count":20,"min_nota":9.5}'::jsonb
WHERE code = 'avatar_056';
