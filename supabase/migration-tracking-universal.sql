-- ============================================================
-- Migracion: Tracking universal de partidas (incluye anonimos)
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Modificar game_sessions para soportar sesiones anonimas y mas datos
-- Hacer user_id nullable
ALTER TABLE public.game_sessions ALTER COLUMN user_id DROP NOT NULL;

-- Actualizar constraint de user_type para incluir 'anonymous'
ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_user_type_check;
ALTER TABLE public.game_sessions ADD CONSTRAINT game_sessions_user_type_check
  CHECK (user_type IN ('teacher', 'student', 'anonymous'));

-- Nuevas columnas
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS abandoned BOOLEAN DEFAULT false;
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS difficulty TEXT;

-- Rellenar started_at para sesiones existentes que no lo tengan
UPDATE public.game_sessions SET started_at = created_at WHERE started_at IS NULL;

-- Indice para consultas de sesiones abandonadas
CREATE INDEX IF NOT EXISTS idx_game_sessions_abandoned ON public.game_sessions(abandoned) WHERE abandoned = true;

-- 2. RLS: permitir al rol anon insertar via las funciones SECURITY DEFINER
-- (Las funciones ya son SECURITY DEFINER, no necesitan RLS directa para anon)

-- 3. Funcion: iniciar sesion (crea registro con completed=false)
-- Retorna el session_id para poder actualizarla despues
CREATE OR REPLACE FUNCTION track_session_start(
  p_user_type TEXT DEFAULT 'anonymous',
  p_user_id UUID DEFAULT NULL,
  p_app_id TEXT DEFAULT '',
  p_app_name TEXT DEFAULT '',
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO public.game_sessions (
    user_type, user_id, app_id, app_name,
    level, grade, subject_id,
    mode, score, max_score, correct_answers, total_questions,
    completed, abandoned, started_at
  ) VALUES (
    COALESCE(p_user_type, 'anonymous'),
    p_user_id,
    p_app_id,
    p_app_name,
    p_level, p_grade, p_subject_id,
    'practice', 0, 0, 0, 0,
    false, false, now()
  )
  RETURNING id INTO v_session_id;

  RETURN json_build_object('success', true, 'session_id', v_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Funcion: finalizar sesion con resultados
CREATE OR REPLACE FUNCTION track_session_finish(
  p_session_id UUID,
  p_mode TEXT DEFAULT 'practice',
  p_score INTEGER DEFAULT 0,
  p_max_score INTEGER DEFAULT 0,
  p_correct_answers INTEGER DEFAULT 0,
  p_total_questions INTEGER DEFAULT 0,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_completed BOOLEAN DEFAULT true,
  p_difficulty TEXT DEFAULT NULL
) RETURNS JSON AS $$
BEGIN
  UPDATE public.game_sessions SET
    mode = p_mode,
    score = p_score,
    max_score = p_max_score,
    correct_answers = p_correct_answers,
    total_questions = p_total_questions,
    duration_seconds = p_duration_seconds,
    completed = p_completed,
    abandoned = false,
    difficulty = p_difficulty,
    finished_at = now()
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Sesion no encontrada');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Funcion: marcar sesion como abandonada
CREATE OR REPLACE FUNCTION track_session_abandon(
  p_session_id UUID,
  p_duration_seconds INTEGER DEFAULT NULL
) RETURNS JSON AS $$
BEGIN
  UPDATE public.game_sessions SET
    abandoned = true,
    completed = false,
    duration_seconds = p_duration_seconds,
    finished_at = now()
  WHERE id = p_session_id
    AND completed = false;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Funcion: iniciar y finalizar en un solo paso (fallback si no se llamo a start)
CREATE OR REPLACE FUNCTION track_session_start_and_finish(
  p_user_type TEXT DEFAULT 'anonymous',
  p_user_id UUID DEFAULT NULL,
  p_app_id TEXT DEFAULT '',
  p_app_name TEXT DEFAULT '',
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL,
  p_mode TEXT DEFAULT 'practice',
  p_score INTEGER DEFAULT 0,
  p_max_score INTEGER DEFAULT 0,
  p_correct_answers INTEGER DEFAULT 0,
  p_total_questions INTEGER DEFAULT 0,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_completed BOOLEAN DEFAULT true,
  p_difficulty TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
BEGIN
  -- Calcular started_at restando la duracion
  IF p_duration_seconds IS NOT NULL THEN
    v_started_at := now() - (p_duration_seconds || ' seconds')::interval;
  ELSE
    v_started_at := now();
  END IF;

  INSERT INTO public.game_sessions (
    user_type, user_id, app_id, app_name,
    level, grade, subject_id,
    mode, score, max_score, correct_answers, total_questions,
    duration_seconds, completed, abandoned, difficulty,
    started_at, finished_at
  ) VALUES (
    COALESCE(p_user_type, 'anonymous'),
    p_user_id,
    p_app_id, p_app_name,
    p_level, p_grade, p_subject_id,
    p_mode, p_score, p_max_score, p_correct_answers, p_total_questions,
    p_duration_seconds, p_completed, false, p_difficulty,
    v_started_at, now()
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Actualizar la funcion track_student_session existente para incluir nuevos campos
CREATE OR REPLACE FUNCTION track_student_session(
  p_student_id UUID,
  p_app_id TEXT,
  p_app_name TEXT,
  p_level TEXT,
  p_grade TEXT,
  p_subject_id TEXT,
  p_mode TEXT DEFAULT 'practice',
  p_score INTEGER DEFAULT 0,
  p_max_score INTEGER DEFAULT 0,
  p_correct_answers INTEGER DEFAULT 0,
  p_total_questions INTEGER DEFAULT 0,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_completed BOOLEAN DEFAULT true
) RETURNS JSON AS $$
DECLARE
  v_started_at TIMESTAMPTZ;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  IF p_duration_seconds IS NOT NULL THEN
    v_started_at := now() - (p_duration_seconds || ' seconds')::interval;
  ELSE
    v_started_at := now();
  END IF;

  INSERT INTO public.game_sessions (
    user_type, user_id, app_id, app_name, level, grade, subject_id,
    mode, score, max_score, correct_answers, total_questions,
    duration_seconds, completed, started_at, finished_at
  ) VALUES (
    'student', p_student_id, p_app_id, p_app_name, p_level, p_grade, p_subject_id,
    p_mode, p_score, p_max_score, p_correct_answers, p_total_questions,
    p_duration_seconds, p_completed, v_started_at, now()
  );

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Actualizar stats globales del admin para incluir datos de abandono
CREATE OR REPLACE FUNCTION admin_get_global_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  SELECT json_build_object(
    'total_teachers', (SELECT COUNT(*) FROM public.teachers),
    'total_students', (SELECT COUNT(*) FROM public.students),
    'total_groups', (SELECT COUNT(*) FROM public.groups),
    'total_sessions', (SELECT COUNT(*) FROM public.game_sessions),
    'completed_sessions', (SELECT COUNT(*) FROM public.game_sessions WHERE completed = true),
    'abandoned_sessions', (SELECT COUNT(*) FROM public.game_sessions WHERE abandoned = true),
    'anonymous_sessions', (SELECT COUNT(*) FROM public.game_sessions WHERE user_type = 'anonymous'),
    'sessions_today', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= CURRENT_DATE),
    'sessions_this_week', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'sessions_this_month', (SELECT COUNT(*) FROM public.game_sessions WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'avg_duration_seconds', (SELECT COALESCE(ROUND(AVG(duration_seconds)), 0) FROM public.game_sessions WHERE duration_seconds IS NOT NULL AND completed = true),
    'abandonment_rate', (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE abandoned = true)::numeric / COUNT(*) * 100, 1)
        ELSE 0 END
      FROM public.game_sessions
    ),
    'top_apps', (
      SELECT json_agg(a) FROM (
        SELECT app_id, app_name, COUNT(*) as play_count,
               ROUND(AVG(score)) as avg_score,
               COUNT(*) FILTER (WHERE completed = true) as completed_count,
               COUNT(*) FILTER (WHERE abandoned = true) as abandoned_count
        FROM public.game_sessions
        GROUP BY app_id, app_name
        ORDER BY play_count DESC
        LIMIT 10
      ) a
    ),
    'sessions_by_level', (
      SELECT json_agg(l) FROM (
        SELECT level, COUNT(*) as count
        FROM public.game_sessions
        WHERE level IS NOT NULL
        GROUP BY level
        ORDER BY count DESC
      ) l
    ),
    'sessions_by_grade', (
      SELECT json_agg(g) FROM (
        SELECT level, grade, COUNT(*) as count
        FROM public.game_sessions
        WHERE grade IS NOT NULL
        GROUP BY level, grade
        ORDER BY level, grade
      ) g
    ),
    'sessions_by_user_type', (
      SELECT json_agg(u) FROM (
        SELECT user_type, COUNT(*) as count
        FROM public.game_sessions
        GROUP BY user_type
        ORDER BY count DESC
      ) u
    ),
    'recent_activity', (
      SELECT json_agg(d) FROM (
        SELECT date_trunc('day', created_at)::date as day, COUNT(*) as count
        FROM public.game_sessions
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY day
        ORDER BY day
      ) d
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Permisos
GRANT EXECUTE ON FUNCTION track_session_start TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_session_finish TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_session_abandon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_session_start_and_finish TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_student_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_get_global_stats TO authenticated;
