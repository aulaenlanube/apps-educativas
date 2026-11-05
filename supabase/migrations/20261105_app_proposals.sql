-- =============================================================================
-- «Propón una app»: propuestas de apps nuevas que envía el público desde la web
-- (portada, /adaptaciones y /catalogo) y que el admin contesta desde
-- /admin → Propuestas.
--
-- Contiene un dato personal (el correo de contacto), así que:
--   · RLS activado y SIN políticas: nadie (ni anon ni authenticated) puede leer,
--     modificar ni insertar directamente en la tabla. El público solo puede
--     INSERTAR, y solo a través de submit_app_proposal(), que valida el
--     consentimiento y los campos, descarta bots (campo trampa + tiempo
--     mínimo de rellenado) y limita envíos (por IP, por correo y global).
--   · De la IP solo se guarda una huella SHA-256 (para el límite de envíos).
--   · Conservación máxima de 12 meses: cada envío purga las propuestas más
--     antiguas (sin depender de un cron).
--   · Lectura, cambio de estado y borrado: solo admins (teachers.role='admin')
--     vía RPC SECURITY DEFINER, igual que blog_post_validations.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_proposals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  idea             text NOT NULL CHECK (char_length(idea) BETWEEN 5 AND 1000),
  curso            text NOT NULL CHECK (char_length(curso) BETWEEN 2 AND 200),
  email            text NOT NULL CHECK (char_length(email) BETWEEN 6 AND 254),
  consent_at       timestamptz NOT NULL,
  privacy_version  text NOT NULL,
  source           text,
  -- Apps existentes que el formulario le sugirió mientras escribía (ids de app
  -- o de familia). Ayuda a contestar «eso ya existe, está aquí».
  suggested_apps   text[] NOT NULL DEFAULT '{}',
  ip_hash          text,
  status           text NOT NULL DEFAULT 'nueva' CHECK (status IN ('nueva', 'respondida', 'descartada')),
  admin_notes      text,
  answered_at      timestamptz,
  answered_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_app_proposals_created ON public.app_proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_proposals_ip ON public.app_proposals (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_proposals_email ON public.app_proposals (lower(email), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_proposals_status ON public.app_proposals (status, created_at DESC);

ALTER TABLE public.app_proposals ENABLE ROW LEVEL SECURITY;
-- Sin políticas a propósito (ver cabecera). Y por si alguien añade una por
-- error, tampoco hay privilegios de tabla para los roles de la API.
REVOKE ALL ON TABLE public.app_proposals FROM anon, authenticated;

-- -----------------------------------------------------------------------------
-- Envío público
-- Devuelve { ok: true } o { ok: false, error: 'invalid' | 'consent' | 'rate_limited', field? }.
-- A un bot (campo trampa relleno o formulario enviado en menos de 3 s) le
-- devuelve { ok: true } sin guardar nada, para que no aprenda a esquivarlo.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_app_proposal(
  p_idea            text,
  p_curso           text,
  p_email           text,
  p_consent         boolean,
  p_website         text DEFAULT NULL,   -- campo trampa: un humano lo deja vacío
  p_elapsed_ms      integer DEFAULT NULL, -- ms desde que se abrió el formulario
  p_source          text DEFAULT NULL,
  p_suggested_apps  text[] DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_idea    text := btrim(regexp_replace(coalesce(p_idea, ''), '\s+', ' ', 'g'));
  v_curso   text := btrim(regexp_replace(coalesce(p_curso, ''), '\s+', ' ', 'g'));
  v_email   text := lower(btrim(coalesce(p_email, '')));
  v_headers json;
  v_ip      text;
  v_ip_hash text;
  v_source  text := left(nullif(btrim(coalesce(p_source, '')), ''), 40);
  v_sugg    text[];
BEGIN
  -- 1. Bots: respuesta de éxito falsa, sin tocar la tabla.
  IF coalesce(btrim(p_website), '') <> '' OR coalesce(p_elapsed_ms, 0) < 3000 THEN
    RETURN jsonb_build_object('ok', true);
  END IF;

  -- 2. Consentimiento y validación.
  IF p_consent IS DISTINCT FROM true THEN
    RETURN jsonb_build_object('ok', false, 'error', 'consent');
  END IF;
  IF char_length(v_idea) < 5 OR char_length(v_idea) > 1000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'idea');
  END IF;
  IF char_length(v_curso) < 2 OR char_length(v_curso) > 200 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'curso');
  END IF;
  IF char_length(v_email) > 254 OR v_email !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid', 'field', 'email');
  END IF;

  -- 3. Huella de la IP (PostgREST expone las cabeceras de la petición).
  BEGIN
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  EXCEPTION WHEN others THEN
    v_headers := NULL;
  END;
  v_ip := btrim(coalesce(
    v_headers ->> 'cf-connecting-ip',
    split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1),
    v_headers ->> 'x-real-ip',
    ''
  ));
  IF v_ip <> '' THEN
    v_ip_hash := encode(sha256(convert_to('app_proposals:' || v_ip, 'UTF8')), 'hex');
  END IF;

  -- 4. Límite de envíos: 3/hora y 10/día por IP, 3/día por correo, 60/hora en total.
  IF v_ip_hash IS NOT NULL AND (
       (SELECT count(*) FROM app_proposals WHERE ip_hash = v_ip_hash AND created_at > now() - interval '1 hour') >= 3
    OR (SELECT count(*) FROM app_proposals WHERE ip_hash = v_ip_hash AND created_at > now() - interval '1 day') >= 10
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'rate_limited');
  END IF;
  IF (SELECT count(*) FROM app_proposals WHERE lower(email) = v_email AND created_at > now() - interval '1 day') >= 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'rate_limited');
  END IF;
  IF (SELECT count(*) FROM app_proposals WHERE created_at > now() - interval '1 hour') >= 60 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'rate_limited');
  END IF;

  -- 5. Sugerencias: como mucho 8 ids cortos (no confiamos en el cliente).
  SELECT coalesce(array_agg(s), '{}') INTO v_sugg
  FROM (
    SELECT DISTINCT left(s, 60) AS s
    FROM unnest(coalesce(p_suggested_apps, '{}')) AS s
    WHERE s ~ '^[a-z0-9-]{2,60}$'
    LIMIT 8
  ) t;

  -- 6. Conservación máxima de 12 meses.
  DELETE FROM app_proposals WHERE created_at < now() - interval '12 months';

  INSERT INTO app_proposals (idea, curso, email, consent_at, privacy_version, source, suggested_apps, ip_hash)
  VALUES (v_idea, v_curso, v_email, now(), '2026-11-05', v_source, v_sugg, v_ip_hash);

  RETURN jsonb_build_object('ok', true);
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_app_proposal(text, text, text, boolean, text, integer, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_app_proposal(text, text, text, boolean, text, integer, text, text[]) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- Admin: listar (con recuento por estado)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_app_proposals(p_status text DEFAULT 'all')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;
  SELECT role = 'admin' INTO v_is_admin FROM teachers WHERE id = auth.uid();
  IF NOT coalesce(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;

  RETURN jsonb_build_object(
    'proposals', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', p.id, 'created_at', p.created_at, 'idea', p.idea, 'curso', p.curso,
        'email', p.email, 'source', p.source, 'suggested_apps', p.suggested_apps,
        'status', p.status, 'admin_notes', p.admin_notes, 'answered_at', p.answered_at
      ) ORDER BY p.created_at DESC)
      FROM app_proposals p
      WHERE coalesce(p_status, 'all') = 'all' OR p.status = p_status
    ), '[]'::jsonb),
    'counts', jsonb_build_object(
      'nueva', (SELECT count(*) FROM app_proposals WHERE status = 'nueva'),
      'respondida', (SELECT count(*) FROM app_proposals WHERE status = 'respondida'),
      'descartada', (SELECT count(*) FROM app_proposals WHERE status = 'descartada')
    )
  );
END;
$function$;

-- -----------------------------------------------------------------------------
-- Admin: cambiar estado / notas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_app_proposal(p_id uuid, p_status text, p_notes text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;
  SELECT role = 'admin' INTO v_is_admin FROM teachers WHERE id = auth.uid();
  IF NOT coalesce(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;
  IF p_status NOT IN ('nueva', 'respondida', 'descartada') THEN
    RETURN jsonb_build_object('error', 'Estado no válido');
  END IF;

  UPDATE app_proposals SET
    status      = p_status,
    admin_notes = left(nullif(btrim(coalesce(p_notes, '')), ''), 2000),
    answered_at = CASE WHEN p_status = 'respondida' THEN coalesce(answered_at, now()) ELSE NULL END,
    answered_by = CASE WHEN p_status = 'respondida' THEN coalesce(answered_by, auth.uid()) ELSE NULL END
  WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No existe');
  END IF;
  RETURN jsonb_build_object('ok', true);
END;
$function$;

-- -----------------------------------------------------------------------------
-- Admin: borrar (derecho de supresión o spam)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_app_proposal(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;
  SELECT role = 'admin' INTO v_is_admin FROM teachers WHERE id = auth.uid();
  IF NOT coalesce(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;
  DELETE FROM app_proposals WHERE id = p_id;
  RETURN jsonb_build_object('ok', FOUND);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_list_app_proposals(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_app_proposal(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_delete_app_proposal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_app_proposals(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_app_proposal(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_app_proposal(uuid) TO authenticated;
