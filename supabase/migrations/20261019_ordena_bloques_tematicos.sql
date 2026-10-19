-- Ordena la Frase / Ordena la Historia: bloques temáticos.
-- Cada frase/historia lleva un `topic` (bloque temático del curso/asignatura) para que el
-- alumno pueda jugar con todo mezclado (como siempre) o filtrar por bloque.
-- Las RPCs antiguas (get_ordena_frases_data / get_ordena_historias_data) no cambian: las
-- usan también Dictado, Ahorcado, Criptograma y la mascota con el formato de siempre.
-- La clasificación (UPDATE ... SET topic) y las frases/historias nuevas se cargan aparte
-- (datos, no esquema).

ALTER TABLE public.ordena_frases    ADD COLUMN IF NOT EXISTS topic text;
ALTER TABLE public.ordena_historias ADD COLUMN IF NOT EXISTS topic text;

-- [{ "s": "frase", "t": "bloque" | null }]
CREATE OR REPLACE FUNCTION public.get_ordena_frases_bloques(p_level text, p_grade integer, p_subject text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('s', sentence, 't', topic)), '[]'::jsonb)
  FROM ordena_frases
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$function$;

-- [{ "s": ["frase 1", ...], "t": "bloque" | null }]
CREATE OR REPLACE FUNCTION public.get_ordena_historias_bloques(p_level text, p_grade integer, p_subject text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('s', sentences, 't', topic)), '[]'::jsonb)
  FROM ordena_historias
  WHERE level = p_level
    AND subject_id = p_subject
    AND p_grade = ANY(grades);
$function$;

GRANT EXECUTE ON FUNCTION public.get_ordena_frases_bloques(text, integer, text)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_ordena_historias_bloques(text, integer, text) TO anon, authenticated;
