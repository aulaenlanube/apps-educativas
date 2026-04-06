-- ============================================================
-- Migración: Mover chistes de jokes.json a Supabase
-- ============================================================

-- Tabla de chistes
CREATE TABLE IF NOT EXISTS public.jokes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: cualquiera puede leer chistes
ALTER TABLE public.jokes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jokes"
  ON public.jokes FOR SELECT
  USING (true);

-- Función RPC para obtener chistes (devuelve array de strings)
CREATE OR REPLACE FUNCTION get_jokes()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(j.text ORDER BY j.id), '[]'::json)
  FROM public.jokes j;
$$;
