-- Sube el count de Mozart (avatar_106) a 50 apps distintas con un 10.
-- Iguala el listón de Picasso/Newton/Curie (todos míticos por asignatura).

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Música en 50 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"musica","count":50,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_106';
