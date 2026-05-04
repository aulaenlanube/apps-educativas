-- Reasigna criterios al trío "computación" para que compartan métrica
-- (subject_exams programacion con un 10) y formen una escalera coherente:
--   Grace Hopper (avatar_061): 20 apps  — la más asequible del trío
--   Ada Lovelace (avatar_063): 30 apps  — intermedia
--   Alan Turing  (avatar_049): 40 apps  — la más exigente
-- Las tres mantienen su rareza legendary (points_bonus 0.4).

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Programación en 20 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"programacion","count":20,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_061';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Programación en 30 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"programacion","count":30,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_063';

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Programación en 40 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"programacion","count":40,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_049';
