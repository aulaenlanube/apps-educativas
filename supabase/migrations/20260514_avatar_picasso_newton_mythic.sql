-- Promueve Picasso (avatar_056) y Newton (avatar_054) de legendary a mythic.
-- Sube points_bonus de 0.4 a 0.5 (la curva de bonus por avatares desbloqueados
-- premia más a los míticos) y endurece el criterio: nota 10 obligatoria en
-- N apps distintas de la asignatura.
--
--   Picasso (Plástica):    20 apps con un 9,5 o más  →  20 apps con un 10
--   Newton  (Matemáticas): 20 apps con un 9,5 o más  →  25 apps con un 10

UPDATE public.avatar_definitions
SET rarity = 'mythic',
    points_bonus = 0.5,
    unlock_label = 'Consigue un 10 en un examen de Plástica en 20 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"plastica","count":20,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_056';

UPDATE public.avatar_definitions
SET rarity = 'mythic',
    points_bonus = 0.5,
    unlock_label = 'Consigue un 10 en un examen de Matemáticas en 25 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":25,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_054';
