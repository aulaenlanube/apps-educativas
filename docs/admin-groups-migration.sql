-- ============================================================================
-- Feature: Pestaña de grupos en el panel de administrador
-- Fecha: 2026-04-21
-- ----------------------------------------------------------------------------
-- Incluye:
--   * RPC admin_get_groups      -> listado completo de grupos con metadatos
--                                  (docente propietario, co-docentes, conteo
--                                  de alumnos, numero de sesiones, ultima
--                                  actividad, etc.)
--   * RPC admin_get_group_detail -> detalle de un grupo concreto incluyendo
--                                   la lista completa de alumnos con sus
--                                   datos relevantes (email, ultimo acceso,
--                                   sesiones, XP, nivel...)
--
-- Ambas funciones son SECURITY DEFINER y verifican que el caller sea un
-- administrador (teachers.role = 'admin'). Si no lo es, devuelven un error.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- admin_get_groups
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_groups(
  p_search text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_result jsonb;
  v_search text := NULLIF(TRIM(COALESCE(p_search, '')), '');
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT role = 'admin' INTO v_is_admin
  FROM public.teachers
  WHERE id = v_caller;

  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;

  WITH base AS (
    SELECT
      g.id,
      g.name,
      g.description,
      g.group_code,
      g.level,
      g.grade,
      g.subject_id,
      g.teacher_id,
      g.created_at,
      g.updated_at,
      t.display_name       AS teacher_name,
      t.email              AS teacher_email,
      t.teacher_code       AS teacher_code,
      t.role               AS teacher_role,
      t.avatar_emoji       AS teacher_avatar,
      (
        SELECT COUNT(*)::int
        FROM public.students s
        WHERE s.group_id = g.id
      ) AS student_count,
      (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id',            ct.id,
              'display_name',  ct.display_name,
              'email',         ct.email,
              'teacher_code',  ct.teacher_code
            )
            ORDER BY ct.display_name
          ),
          '[]'::jsonb
        )
        FROM public.group_teachers gt
        JOIN public.teachers ct ON ct.id = gt.teacher_id
        WHERE gt.group_id = g.id
      ) AS co_teachers,
      (
        SELECT COUNT(*)::int
        FROM public.game_sessions gs
        WHERE gs.user_type = 'student'
          AND gs.user_id IN (
            SELECT s2.id FROM public.students s2 WHERE s2.group_id = g.id
          )
      ) AS total_sessions,
      (
        SELECT MAX(gs.created_at)
        FROM public.game_sessions gs
        WHERE gs.user_type = 'student'
          AND gs.user_id IN (
            SELECT s2.id FROM public.students s2 WHERE s2.group_id = g.id
          )
      ) AS last_activity
    FROM public.groups g
    LEFT JOIN public.teachers t ON t.id = g.teacher_id
    WHERE v_search IS NULL
       OR g.name         ILIKE '%' || v_search || '%'
       OR g.group_code   ILIKE '%' || v_search || '%'
       OR t.display_name ILIKE '%' || v_search || '%'
       OR t.email        ILIKE '%' || v_search || '%'
  )
  SELECT jsonb_build_object(
    'total',  (SELECT COUNT(*) FROM base),
    'groups', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id',             b.id,
            'name',           b.name,
            'description',    b.description,
            'group_code',     b.group_code,
            'level',          b.level,
            'grade',          b.grade,
            'subject_id',     b.subject_id,
            'teacher_id',     b.teacher_id,
            'teacher_name',   b.teacher_name,
            'teacher_email',  b.teacher_email,
            'teacher_code',   b.teacher_code,
            'teacher_role',   b.teacher_role,
            'teacher_avatar', b.teacher_avatar,
            'student_count',  b.student_count,
            'co_teachers',    b.co_teachers,
            'total_sessions', b.total_sessions,
            'last_activity',  b.last_activity,
            'created_at',     b.created_at,
            'updated_at',     b.updated_at
          )
          ORDER BY b.created_at DESC NULLS LAST, b.name
        )
        FROM base b
      ),
      '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_groups(text) TO authenticated;

-- ----------------------------------------------------------------------------
-- admin_get_group_detail
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_get_group_detail(
  p_group_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_group jsonb;
  v_students jsonb;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('error', 'No autenticado');
  END IF;

  SELECT role = 'admin' INTO v_is_admin
  FROM public.teachers
  WHERE id = v_caller;

  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('error', 'Solo administradores');
  END IF;

  SELECT jsonb_build_object(
    'id',             g.id,
    'name',           g.name,
    'description',    g.description,
    'group_code',     g.group_code,
    'level',          g.level,
    'grade',          g.grade,
    'subject_id',     g.subject_id,
    'teacher_id',     g.teacher_id,
    'teacher_name',   t.display_name,
    'teacher_email',  t.email,
    'teacher_code',   t.teacher_code,
    'teacher_role',   t.role,
    'teacher_avatar', t.avatar_emoji,
    'created_at',     g.created_at,
    'updated_at',     g.updated_at,
    'co_teachers',    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id',           ct.id,
          'display_name', ct.display_name,
          'email',        ct.email,
          'teacher_code', ct.teacher_code
        )
        ORDER BY ct.display_name
      )
      FROM public.group_teachers gt
      JOIN public.teachers ct ON ct.id = gt.teacher_id
      WHERE gt.group_id = g.id
    ), '[]'::jsonb)
  )
  INTO v_group
  FROM public.groups g
  LEFT JOIN public.teachers t ON t.id = g.teacher_id
  WHERE g.id = p_group_id;

  IF v_group IS NULL THEN
    RETURN jsonb_build_object('error', 'Grupo no encontrado');
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id',             s.id,
        'username',       s.username,
        'display_name',   s.display_name,
        'email',          s.email,
        'avatar_emoji',   s.avatar_emoji,
        'has_password',   (s.password_hash IS NOT NULL),
        'has_auth_user',  (s.auth_user_id IS NOT NULL),
        'created_at',     s.created_at,
        'total_sessions', COALESCE(sess.total_sessions, 0),
        'completed_sessions', COALESCE(sess.completed_sessions, 0),
        'last_activity',  sess.last_activity,
        'xp',             COALESCE(sx.total_xp, 0),
        'level',          COALESCE(sx.level, 1),
        'badge_count',    COALESCE(bc.badge_count, 0)
      )
      ORDER BY LOWER(s.display_name), LOWER(s.username)
    ),
    '[]'::jsonb
  )
  INTO v_students
  FROM public.students s
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)::int                                        AS total_sessions,
      COUNT(*) FILTER (WHERE gs.completed = true)::int     AS completed_sessions,
      MAX(gs.created_at)                                   AS last_activity
    FROM public.game_sessions gs
    WHERE gs.user_type = 'student' AND gs.user_id = s.id
  ) sess ON TRUE
  LEFT JOIN public.student_xp sx ON sx.student_id = s.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS badge_count
    FROM public.student_badges sb
    WHERE sb.student_id = s.id
  ) bc ON TRUE
  WHERE s.group_id = p_group_id;

  RETURN jsonb_build_object(
    'group',    v_group,
    'students', v_students
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_group_detail(uuid) TO authenticated;
