-- 1) Heisenberg (avatar_104): endurece de "9+" a "un 10" en 15 apps
--    distintas de Física y Química.
-- 2) Turing (avatar_049, "Padre de la Computación"): epic → legendary.
--    points_bonus 0.3 → 0.4. Sube el listón de 12 apps con 9 a 18 apps
--    con 9 — encaja entre épicos (12 con 9) y leyenda Mente Cósmica
--    (22 con 9,5).

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue un 10 en un examen de Física y Química en 15 apps distintas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"fisica","count":15,"min_nota":9.95}'::jsonb
WHERE code = 'avatar_104';

UPDATE public.avatar_definitions
SET rarity = 'legendary',
    points_bonus = 0.4,
    unlock_label = 'Aprueba con 9 o más en 18 apps distintas de Matemáticas',
    unlock_requirement = '{"type":"subject_exams","subject_id":"matematicas","count":18,"min_nota":9}'::jsonb
WHERE code = 'avatar_049';
