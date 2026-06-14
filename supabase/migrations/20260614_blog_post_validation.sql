-- =============================================================================
-- Validación de posts del blog por administradores
-- Calca el patrón de blog_post_overrides: estado en tabla con RLS sin política
-- permisiva (solo accesible vía RPC SECURITY DEFINER con guard de admin).
-- El slug es la identidad del post (igual que en blog_post_overrides).
-- =============================================================================

-- Estado actual de validación por post.
CREATE TABLE IF NOT EXISTS public.blog_post_validations (
  slug              text PRIMARY KEY,
  validated         boolean NOT NULL DEFAULT false,
  validated_at      timestamptz,
  validated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by_name text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_post_validations ENABLE ROW LEVEL SECURITY;
-- Sin política permisiva a propósito: lectura/escritura solo vía RPC admin.

-- Historial de validaciones y cancelaciones de validación (no se borra nada).
CREATE TABLE IF NOT EXISTS public.blog_post_validation_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL,
  action      text NOT NULL CHECK (action IN ('validate', 'unvalidate')),
  actor_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_post_validation_log_slug
  ON public.blog_post_validation_log (slug, created_at DESC);

ALTER TABLE public.blog_post_validation_log ENABLE ROW LEVEL SECURITY;
-- Sin política permisiva: solo accesible vía RPC admin.

-- -----------------------------------------------------------------------------
-- RPC: alterna el estado de validación de un post (solo admin) + registra log.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.blog_admin_set_post_validation(p_slug text, p_validated boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller   uuid := auth.uid();
  v_is_admin boolean;
  v_name     text;
  v_slug     text := NULLIF(TRIM(COALESCE(p_slug, '')), '');
  v_val      boolean := COALESCE(p_validated, false);
  v_at       timestamptz := now();
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT role = 'admin', display_name INTO v_is_admin, v_name
  FROM public.teachers WHERE id = v_caller;

  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;

  IF v_slug IS NULL THEN
    RETURN jsonb_build_object('error', 'Slug vacío');
  END IF;

  INSERT INTO public.blog_post_validations (slug, validated, validated_at, validated_by, validated_by_name, updated_at)
  VALUES (
    v_slug,
    v_val,
    CASE WHEN v_val THEN v_at ELSE NULL END,
    CASE WHEN v_val THEN v_caller ELSE NULL END,
    CASE WHEN v_val THEN v_name ELSE NULL END,
    v_at
  )
  ON CONFLICT (slug) DO UPDATE SET
    validated         = EXCLUDED.validated,
    validated_at      = CASE WHEN EXCLUDED.validated THEN v_at ELSE NULL END,
    validated_by      = CASE WHEN EXCLUDED.validated THEN v_caller ELSE NULL END,
    validated_by_name = CASE WHEN EXCLUDED.validated THEN v_name ELSE NULL END,
    updated_at        = v_at;

  INSERT INTO public.blog_post_validation_log (slug, action, actor_id, actor_name, created_at)
  VALUES (
    v_slug,
    CASE WHEN v_val THEN 'validate' ELSE 'unvalidate' END,
    v_caller,
    v_name,
    v_at
  );

  RETURN jsonb_build_object(
    'ok', true,
    'slug', v_slug,
    'validated', v_val,
    'validated_at', CASE WHEN v_val THEN v_at ELSE NULL END,
    'validated_by_name', CASE WHEN v_val THEN v_name ELSE NULL END
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.blog_admin_set_post_validation(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_admin_set_post_validation(text, boolean) TO authenticated;

-- -----------------------------------------------------------------------------
-- RPC: lista los posts validados (solo admin). Para pintar iconos en listados.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.blog_admin_list_post_validations()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller   uuid := auth.uid();
  v_is_admin boolean;
  v_rows     jsonb;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT role = 'admin' INTO v_is_admin
  FROM public.teachers WHERE id = v_caller;

  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'slug', slug,
    'validated', validated,
    'validated_at', validated_at,
    'validated_by_name', validated_by_name
  )), '[]'::jsonb)
  INTO v_rows
  FROM public.blog_post_validations
  WHERE validated = true;

  RETURN jsonb_build_object('ok', true, 'validations', v_rows);
END;
$function$;

REVOKE ALL ON FUNCTION public.blog_admin_list_post_validations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_admin_list_post_validations() TO authenticated;

-- -----------------------------------------------------------------------------
-- RPC: historial de validaciones/cancelaciones de un post (solo admin).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.blog_admin_get_post_validation_log(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller   uuid := auth.uid();
  v_is_admin boolean;
  v_slug     text := NULLIF(TRIM(COALESCE(p_slug, '')), '');
  v_rows     jsonb;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT role = 'admin' INTO v_is_admin
  FROM public.teachers WHERE id = v_caller;

  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;

  IF v_slug IS NULL THEN
    RETURN jsonb_build_object('error', 'Slug vacío');
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'action', action,
    'actor_name', actor_name,
    'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO v_rows
  FROM public.blog_post_validation_log
  WHERE slug = v_slug;

  RETURN jsonb_build_object('ok', true, 'log', v_rows);
END;
$function$;

REVOKE ALL ON FUNCTION public.blog_admin_get_post_validation_log(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.blog_admin_get_post_validation_log(text) TO authenticated;
