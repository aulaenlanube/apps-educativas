-- ============================================================================
-- Feature: edición de posts del blog desde la propia página (solo admin)
-- Fecha: 2026-06-09
-- ----------------------------------------------------------------------------
-- La web es estática (Hostinger). Los posts viven como markdown en el repo
-- (src/blog/posts/*.md), pero un administrador puede editar el CUERPO de un
-- post publicado desde la propia página. El cuerpo editado se guarda en
-- blog_post_overrides y BlogPostPage lo carga en runtime, sustituyendo al del
-- repo. Solo se edita el body markdown (texto, ## títulos, ### subtítulos,
-- listas, negrita y tablas); no se insertan imágenes.
--
-- Seguridad: lectura pública (todos ven el cuerpo editado); escritura solo vía
-- RPC SECURITY DEFINER con guard teachers.role='admin'. anon NO puede ejecutar
-- las RPCs de escritura.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blog_post_overrides (
  slug        text PRIMARY KEY,
  body        text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.blog_post_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_overrides_public_read ON public.blog_post_overrides;
CREATE POLICY blog_overrides_public_read
  ON public.blog_post_overrides
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.blog_post_overrides TO anon, authenticated;

-- Guardar (upsert) el cuerpo de un post. Solo admin.
CREATE OR REPLACE FUNCTION public.blog_admin_save_post(p_slug text, p_body text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller   uuid := auth.uid();
  v_is_admin boolean;
  v_slug     text := NULLIF(TRIM(COALESCE(p_slug, '')), '');
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;
  SELECT role = 'admin' INTO v_is_admin FROM public.teachers WHERE id = v_caller;
  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;
  IF v_slug IS NULL THEN
    RETURN jsonb_build_object('error', 'Slug vacío');
  END IF;
  IF p_body IS NULL OR length(p_body) = 0 THEN
    RETURN jsonb_build_object('error', 'El cuerpo no puede estar vacío');
  END IF;
  IF length(p_body) > 200000 THEN
    RETURN jsonb_build_object('error', 'El cuerpo es demasiado largo');
  END IF;

  INSERT INTO public.blog_post_overrides (slug, body, updated_at, updated_by)
  VALUES (v_slug, p_body, now(), v_caller)
  ON CONFLICT (slug) DO UPDATE
    SET body = EXCLUDED.body, updated_at = now(), updated_by = v_caller;

  RETURN jsonb_build_object('ok', true, 'slug', v_slug, 'updated_at', now());
END;
$$;

-- Restablecer (borrar override -> vuelve al original del repo). Solo admin.
CREATE OR REPLACE FUNCTION public.blog_admin_reset_post(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller   uuid := auth.uid();
  v_is_admin boolean;
  v_slug     text := NULLIF(TRIM(COALESCE(p_slug, '')), '');
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;
  SELECT role = 'admin' INTO v_is_admin FROM public.teachers WHERE id = v_caller;
  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;
  IF v_slug IS NULL THEN
    RETURN jsonb_build_object('error', 'Slug vacío');
  END IF;
  DELETE FROM public.blog_post_overrides WHERE slug = v_slug;
  RETURN jsonb_build_object('ok', true, 'slug', v_slug);
END;
$$;

REVOKE ALL ON FUNCTION public.blog_admin_save_post(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.blog_admin_reset_post(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.blog_admin_save_post(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.blog_admin_reset_post(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.blog_admin_save_post(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.blog_admin_reset_post(text) TO authenticated;
