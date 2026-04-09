-- ============================================================
-- MIGRACION: Sistema de mejores puntuaciones (High Scores)
-- ============================================================
-- Tabla de mejores puntuaciones por usuario y contexto de app.
-- Separada de game_sessions para consultas rapidas de ranking.
--
-- Contexto de puntuacion = (app_id, level, grade, subject_id)
-- Para apps por-curso (sumas-primaria-3), level/grade/subject_id
-- pueden ser NULL ya que el app_id ya es unico.
-- ============================================================

-- ═══════════════════════════════════════════════
-- 1. TABLA high_scores
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                       -- NULL para anonimos
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'free', 'student', 'anonymous')),
  app_id TEXT NOT NULL,
  level TEXT,                          -- 'primaria', 'eso', 'bachillerato'
  grade TEXT,                          -- '1'..'6'
  subject_id TEXT,                     -- 'matematicas', 'lengua', etc.
  score INTEGER NOT NULL DEFAULT 0,
  nota NUMERIC(3,1),                   -- 0.0 - 10.0
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  mode TEXT DEFAULT 'practice',        -- 'practice' | 'test'
  group_id UUID,                       -- Para rankings de clase (students)
  achieved_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Un registro por usuario+contexto: se actualiza si se supera la puntuacion
  UNIQUE NULLS NOT DISTINCT (user_id, user_type, app_id, level, grade, subject_id)
);

-- Indices para consultas de ranking
CREATE INDEX IF NOT EXISTS idx_hs_app_context ON public.high_scores (app_id, level, grade, subject_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_hs_global_score ON public.high_scores (app_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_hs_group ON public.high_scores (group_id, app_id, level, grade, subject_id, score DESC) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hs_user ON public.high_scores (user_id, user_type);

ALTER TABLE public.high_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read high_scores" ON public.high_scores FOR SELECT USING (true);


-- ═══════════════════════════════════════════════
-- 2. FUNCION: Registrar/actualizar mejor puntuacion
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.upsert_high_score(
  p_user_id UUID,
  p_user_type TEXT,
  p_app_id TEXT,
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL,
  p_score INTEGER DEFAULT 0,
  p_nota NUMERIC DEFAULT NULL,
  p_correct_answers INTEGER DEFAULT 0,
  p_total_questions INTEGER DEFAULT 0,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_mode TEXT DEFAULT 'practice',
  p_group_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_existing_score INTEGER;
  v_is_new_record BOOLEAN := false;
  v_old_rank INTEGER;
  v_new_rank INTEGER;
BEGIN
  -- Buscar puntuacion existente
  SELECT score INTO v_existing_score
  FROM public.high_scores
  WHERE user_id IS NOT DISTINCT FROM p_user_id
    AND user_type = p_user_type
    AND app_id = p_app_id
    AND level IS NOT DISTINCT FROM p_level
    AND grade IS NOT DISTINCT FROM p_grade
    AND subject_id IS NOT DISTINCT FROM p_subject_id;

  -- Solo actualizar si la nueva puntuacion es mayor
  IF v_existing_score IS NULL THEN
    -- Nuevo registro
    INSERT INTO public.high_scores (
      user_id, user_type, app_id, level, grade, subject_id,
      score, nota, correct_answers, total_questions,
      duration_seconds, mode, group_id, achieved_at, updated_at
    ) VALUES (
      p_user_id, p_user_type, p_app_id, p_level, p_grade, p_subject_id,
      p_score, p_nota, p_correct_answers, p_total_questions,
      p_duration_seconds, p_mode, p_group_id, now(), now()
    );
    v_is_new_record := true;
  ELSIF p_score > v_existing_score THEN
    -- Actualizar record existente
    UPDATE public.high_scores
    SET score = p_score,
        nota = p_nota,
        correct_answers = p_correct_answers,
        total_questions = p_total_questions,
        duration_seconds = p_duration_seconds,
        mode = p_mode,
        group_id = COALESCE(p_group_id, group_id),
        achieved_at = now(),
        updated_at = now()
    WHERE user_id IS NOT DISTINCT FROM p_user_id
      AND user_type = p_user_type
      AND app_id = p_app_id
      AND level IS NOT DISTINCT FROM p_level
      AND grade IS NOT DISTINCT FROM p_grade
      AND subject_id IS NOT DISTINCT FROM p_subject_id;
    v_is_new_record := true;
  END IF;

  -- Calcular posicion global actual
  IF v_is_new_record THEN
    SELECT COUNT(*) + 1 INTO v_new_rank
    FROM public.high_scores
    WHERE app_id = p_app_id
      AND level IS NOT DISTINCT FROM p_level
      AND grade IS NOT DISTINCT FROM p_grade
      AND subject_id IS NOT DISTINCT FROM p_subject_id
      AND score > p_score;
  END IF;

  RETURN json_build_object(
    'is_new_record', v_is_new_record,
    'old_score', COALESCE(v_existing_score, 0),
    'new_score', p_score,
    'global_rank', v_new_rank
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.upsert_high_score TO anon, authenticated;


-- ═══════════════════════════════════════════════
-- 3. FUNCION: Ranking global de mejores puntuaciones
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_high_score_ranking(
  p_app_id TEXT,
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  rank INTEGER,
  display_name TEXT,
  avatar TEXT,
  user_type TEXT,
  score INTEGER,
  nota NUMERIC,
  duration_seconds INTEGER,
  mode TEXT,
  achieved_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY hs.score DESC, hs.duration_seconds ASC NULLS LAST)::INTEGER AS rank,
    COALESCE(
      CASE
        WHEN hs.user_type IN ('teacher', 'free') THEN NULLIF(t.display_name, '')
        WHEN hs.user_type = 'student' THEN NULLIF(s.display_name, '')
        ELSE NULL
      END,
      CASE
        WHEN hs.user_type = 'anonymous' THEN 'Anonimo'
        ELSE 'Jugador'
      END
    )::TEXT AS display_name,
    COALESCE(
      CASE
        WHEN hs.user_type = 'teacher' THEN '👨‍🏫'
        WHEN hs.user_type = 'free' THEN '👤'
        WHEN hs.user_type = 'student' THEN COALESCE(s.avatar_emoji, '🎮')
        ELSE '👻'
      END, '🎮'
    )::TEXT AS avatar,
    hs.user_type::TEXT,
    hs.score,
    hs.nota,
    hs.duration_seconds,
    hs.mode::TEXT,
    hs.achieved_at
  FROM public.high_scores hs
  LEFT JOIN public.teachers t ON hs.user_type IN ('teacher', 'free') AND hs.user_id = t.id
  LEFT JOIN public.students s ON hs.user_type = 'student' AND hs.user_id = s.id
  WHERE hs.app_id = p_app_id
    AND hs.score > 0
    AND (p_level IS NULL OR hs.level IS NOT DISTINCT FROM p_level)
    AND (p_grade IS NULL OR hs.grade IS NOT DISTINCT FROM p_grade)
    AND (p_subject_id IS NULL OR hs.subject_id IS NOT DISTINCT FROM p_subject_id)
  ORDER BY hs.score DESC, hs.duration_seconds ASC NULLS LAST
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_high_score_ranking TO anon, authenticated;


-- ═══════════════════════════════════════════════
-- 4. FUNCION: Ranking de clase (solo alumnos del mismo grupo)
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_class_high_score_ranking(
  p_app_id TEXT,
  p_group_id UUID,
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 3
) RETURNS TABLE (
  rank INTEGER,
  display_name TEXT,
  avatar TEXT,
  student_id UUID,
  score INTEGER,
  nota NUMERIC,
  duration_seconds INTEGER,
  achieved_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY hs.score DESC, hs.duration_seconds ASC NULLS LAST)::INTEGER AS rank,
    COALESCE(NULLIF(s.display_name, ''), 'Alumno')::TEXT AS display_name,
    COALESCE(s.avatar_emoji, '🎮')::TEXT AS avatar,
    hs.user_id AS student_id,
    hs.score,
    hs.nota,
    hs.duration_seconds,
    hs.achieved_at
  FROM public.high_scores hs
  INNER JOIN public.students s ON hs.user_id = s.id
  WHERE hs.app_id = p_app_id
    AND hs.user_type = 'student'
    AND hs.group_id = p_group_id
    AND hs.score > 0
    AND (p_level IS NULL OR hs.level IS NOT DISTINCT FROM p_level)
    AND (p_grade IS NULL OR hs.grade IS NOT DISTINCT FROM p_grade)
    AND (p_subject_id IS NULL OR hs.subject_id IS NOT DISTINCT FROM p_subject_id)
  ORDER BY hs.score DESC, hs.duration_seconds ASC NULLS LAST
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_high_score_ranking TO anon, authenticated;


-- ═══════════════════════════════════════════════
-- 5. FUNCION: Obtener posicion de un usuario en el ranking
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_rank(
  p_user_id UUID,
  p_user_type TEXT,
  p_app_id TEXT,
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_score INTEGER;
  v_global_rank INTEGER;
  v_class_rank INTEGER;
  v_group_id UUID;
BEGIN
  -- Obtener puntuacion del usuario
  SELECT score, group_id INTO v_score, v_group_id
  FROM public.high_scores
  WHERE user_id IS NOT DISTINCT FROM p_user_id
    AND user_type = p_user_type
    AND app_id = p_app_id
    AND level IS NOT DISTINCT FROM p_level
    AND grade IS NOT DISTINCT FROM p_grade
    AND subject_id IS NOT DISTINCT FROM p_subject_id;

  IF v_score IS NULL THEN
    RETURN json_build_object('has_score', false);
  END IF;

  -- Rank global
  SELECT COUNT(*) + 1 INTO v_global_rank
  FROM public.high_scores
  WHERE app_id = p_app_id
    AND level IS NOT DISTINCT FROM p_level
    AND grade IS NOT DISTINCT FROM p_grade
    AND subject_id IS NOT DISTINCT FROM p_subject_id
    AND score > v_score;

  -- Rank de clase (solo students con group_id)
  IF p_user_type = 'student' AND v_group_id IS NOT NULL THEN
    SELECT COUNT(*) + 1 INTO v_class_rank
    FROM public.high_scores
    WHERE app_id = p_app_id
      AND user_type = 'student'
      AND group_id = v_group_id
      AND level IS NOT DISTINCT FROM p_level
      AND grade IS NOT DISTINCT FROM p_grade
      AND subject_id IS NOT DISTINCT FROM p_subject_id
      AND score > v_score;
  END IF;

  RETURN json_build_object(
    'has_score', true,
    'score', v_score,
    'global_rank', v_global_rank,
    'class_rank', v_class_rank
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_user_rank TO anon, authenticated;

-- ============================================================
-- FIN
-- ============================================================
