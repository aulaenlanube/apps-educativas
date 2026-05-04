-- Cambia el criterio de desbloqueo del avatar de Messi (avatar_048, "El Pulga Mágico").
-- Antes: top_class #1 (compartido con otros mythics, demasiado azaroso para un mítico
-- icónico). Ahora: nota 10 en examen en 50 apps distintas — el reto de mayor amplitud
-- de la colección, coherente con su rareza mythic y el "no hay app que se le resista".

UPDATE public.avatar_definitions
SET unlock_label = 'Consigue nota 10 en examen en 50 apps distintas',
    unlock_requirement = '{"type":"perfect_exams","count":50}'::jsonb
WHERE code = 'avatar_048';
