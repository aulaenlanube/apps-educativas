-- Reescritura de texto de dos frases spicy.
--   spicy_12 (legendary, tease, 🚀):
--     "El siguiente nivel ni lo verás"  →  "Esto va directo al museo de palizas"
--   spicy_15 (mythic, tease, 🎤):
--     "Bienvenido a clase. Yo soy el profe"  →  "Eres pesim@, literalmente"
--
-- Las condiciones de desbloqueo, rareza, emoji y categoría no cambian:
-- los alumnos/docentes que ya las tenían equipadas siguen viendo el slot
-- ocupado, pero con el nuevo texto la próxima vez que se rendericen.

UPDATE public.duel_phrase_definitions
SET text = 'Esto va directo al museo de palizas'
WHERE code = 'spicy_12';

UPDATE public.duel_phrase_definitions
SET text = 'Eres pesim@, literalmente'
WHERE code = 'spicy_15';
