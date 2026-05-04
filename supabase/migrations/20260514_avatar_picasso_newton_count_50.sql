-- Sube el count de Picasso (avatar_056) y Newton (avatar_054) a 50 apps
-- distintas con nota 10. Ambos son míticos desde la migración previa.

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Plástica en 50 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"plastica","count":50,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_056';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Matemáticas en 50 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":50,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_054';
