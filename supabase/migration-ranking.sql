-- ============================================================
-- MIGRACION: Ranking global de apps
-- ============================================================
-- Anade funcion RPC `get_app_ranking` que devuelve las mejores
-- puntuaciones para una app concreta, con filtros opcionales por
-- asignatura, modo y rango temporal.
--
-- La funcion usa SECURITY DEFINER para saltarse RLS y poder leer
-- sesiones de otros usuarios (solo devuelve campos publicos: nombre
-- visible, avatar, score, nota, tiempo y fecha).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_app_ranking(
  p_app_id TEXT,
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL,
  p_mode TEXT DEFAULT NULL,        -- 'practice' | 'test' | NULL (todos)
  p_time_range TEXT DEFAULT 'all', -- 'today' | 'week' | 'month' | 'all'
  p_scope TEXT DEFAULT 'subject',  -- 'subject' (mismo curso/asignatura) | 'app' (toda la app) | 'global' (igual)
  p_limit INTEGER DEFAULT 25
) RETURNS TABLE (
  rank INTEGER,
  display_name TEXT,
  avatar TEXT,
  user_type TEXT,
  score INTEGER,
  max_score INTEGER,
  nota NUMERIC,
  correct_answers INTEGER,
  total_questions INTEGER,
  duration_seconds INTEGER,
  mode TEXT,
  level TEXT,
  grade TEXT,
  subject_id TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_since TIMESTAMPTZ;
BEGIN
  -- Calcular fecha limite segun el rango
  IF p_time_range = 'today' THEN
    v_since := CURRENT_DATE;
  ELSIF p_time_range = 'week' THEN
    v_since := CURRENT_DATE - INTERVAL '7 days';
  ELSIF p_time_range = 'month' THEN
    v_since := CURRENT_DATE - INTERVAL '30 days';
  ELSE
    v_since := '1970-01-01'::TIMESTAMPTZ;
  END IF;

  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY gs.score DESC, gs.duration_seconds ASC NULLS LAST, gs.created_at ASC)::INTEGER AS rank,
    COALESCE(
      CASE
        WHEN gs.user_type = 'teacher' THEN NULLIF(t.display_name, '')
        WHEN gs.user_type = 'free'    THEN NULLIF(t.display_name, '')
        WHEN gs.user_type = 'student' THEN NULLIF(s.display_name, '')
        ELSE NULL
      END,
      CASE
        WHEN gs.user_type = 'anonymous' THEN 'Anonimo'
        WHEN gs.user_type = 'free'      THEN 'Usuario'
        ELSE 'Jugador'
      END
    )::TEXT AS display_name,
    COALESCE(
      CASE
        WHEN gs.user_type = 'teacher' THEN '👨‍🏫'
        WHEN gs.user_type = 'free'    THEN '👤'
        WHEN gs.user_type = 'student' THEN s.avatar_emoji
        ELSE '👻'
      END, '🎮'
    )::TEXT AS avatar,
    gs.user_type::TEXT,
    gs.score,
    gs.max_score,
    COALESCE(
      gs.nota,
      CASE
        WHEN gs.total_questions > 0
          THEN ROUND((gs.correct_answers::NUMERIC / gs.total_questions) * 10, 1)
        ELSE 0
      END
    ) AS nota,
    gs.correct_answers,
    gs.total_questions,
    gs.duration_seconds,
    gs.mode::TEXT,
    gs.level::TEXT,
    gs.grade::TEXT,
    gs.subject_id::TEXT,
    gs.created_at
  FROM public.game_sessions gs
  LEFT JOIN public.teachers t ON (gs.user_type IN ('teacher', 'free')) AND gs.user_id = t.id
  LEFT JOIN public.students s ON gs.user_type = 'student' AND gs.user_id = s.id
  WHERE gs.app_id = p_app_id
    AND gs.completed = true
    AND gs.score > 0
    AND (p_mode IS NULL OR gs.mode = p_mode)
    AND gs.created_at >= v_since
    AND (
      -- scope 'subject' filtra por nivel/curso/asignatura
      (p_scope = 'subject'
         AND (p_level IS NULL OR gs.level = p_level)
         AND (p_grade IS NULL OR gs.grade = p_grade)
         AND (p_subject_id IS NULL OR gs.subject_id = p_subject_id))
      -- scope 'app' toma todas las sesiones de esa app (cualquier curso/materia)
      OR p_scope IN ('app', 'global')
    )
  ORDER BY gs.score DESC, gs.duration_seconds ASC NULLS LAST, gs.created_at ASC
  LIMIT p_limit;
END;
$$;

-- Permitir que cualquiera (incluidos anonimos) pueda leer el ranking
GRANT EXECUTE ON FUNCTION public.get_app_ranking TO anon, authenticated;

-- ============================================================
-- FIN
-- ============================================================
