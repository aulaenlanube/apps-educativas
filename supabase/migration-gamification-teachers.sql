-- ============================================================
-- Migración: Gamificación para docentes/free/admin
-- Misma lógica que students pero con tablas separadas
-- ============================================================

-- Tablas
CREATE TABLE IF NOT EXISTS public.teacher_xp (
  teacher_id UUID PRIMARY KEY REFERENCES public.teachers(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.teacher_xp ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.teacher_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_badges_teacher ON public.teacher_badges(teacher_id);
ALTER TABLE public.teacher_badges ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.teacher_xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_teacher_xp_log ON public.teacher_xp_log(teacher_id, created_at DESC);
ALTER TABLE public.teacher_xp_log ENABLE ROW LEVEL SECURITY;

-- Función: procesar sesión para teacher/free/admin
CREATE OR REPLACE FUNCTION gamification_process_teacher_session(
  p_teacher_id UUID,
  p_session_mode TEXT,
  p_session_nota NUMERIC,
  p_session_duration INTEGER,
  p_session_app_id TEXT
) RETURNS JSON AS $$
DECLARE
  v_session_xp INTEGER := 0;
  v_badge_xp INTEGER := 0;
  v_old_xp INTEGER;
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_badge RECORD;
  v_earned BOOLEAN;
  v_new_badges_arr JSONB := '[]'::jsonb;
  v_user_type TEXT;
  v_today_count INTEGER;
  v_xp_capped BOOLEAN := false;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = p_teacher_id) THEN
    RETURN json_build_object('error', 'Teacher not found');
  END IF;

  SELECT CASE WHEN role = 'free' THEN 'free' ELSE 'teacher' END INTO v_user_type
  FROM public.teachers WHERE id = p_teacher_id;

  INSERT INTO public.teacher_xp (teacher_id, total_xp, level)
  VALUES (p_teacher_id, 0, 1)
  ON CONFLICT (teacher_id) DO NOTHING;

  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM public.teacher_xp WHERE teacher_id = p_teacher_id;

  -- Comprobar límite: max 5 partidas con XP por app y día
  SELECT COUNT(*) INTO v_today_count
  FROM public.game_sessions
  WHERE user_id = p_teacher_id AND user_type = v_user_type
    AND app_id = p_session_app_id AND completed = true
    AND DATE(created_at) = CURRENT_DATE;

  IF v_today_count > 5 THEN
    v_session_xp := 0;
    v_xp_capped := true;
  ELSE
    v_session_xp := 10;
    IF p_session_mode = 'test' THEN v_session_xp := v_session_xp + 5; END IF;
    IF p_session_nota >= 5  THEN v_session_xp := v_session_xp + 5;  END IF;
    IF p_session_nota >= 7  THEN v_session_xp := v_session_xp + 5;  END IF;
    IF p_session_nota >= 9  THEN v_session_xp := v_session_xp + 5;  END IF;
    IF p_session_nota >= 10 THEN v_session_xp := v_session_xp + 10; END IF;
  END IF;

  INSERT INTO public.teacher_xp_log (teacher_id, xp_amount, source, source_id)
  VALUES (p_teacher_id, v_session_xp, 'session', p_session_app_id);

  -- Comprobar insignias (usa game_sessions con user_type del teacher)
  FOR v_badge IN
    SELECT bd.*
    FROM public.badge_definitions bd
    WHERE bd.active = true
      AND NOT EXISTS (
        SELECT 1 FROM public.teacher_badges tb
        WHERE tb.teacher_id = p_teacher_id AND tb.badge_id = bd.id
      )
    ORDER BY bd.sort_order
  LOOP
    v_earned := false;

    CASE v_badge.check_type
      WHEN 'completed_games' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND completed = true;
      WHEN 'exam_passed' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND mode = 'test' AND completed = true AND nota >= 5;
      WHEN 'perfect_score' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND mode = 'test' AND nota >= 10;
      WHEN 'perfect_distinct_apps' THEN
        SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND nota >= 10;
      WHEN 'distinct_apps' THEN
        SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND completed = true;
      WHEN 'speed_exam' THEN
        SELECT EXISTS(SELECT 1 FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type
          AND mode = 'test' AND completed = true AND duration_seconds IS NOT NULL
          AND duration_seconds <= (v_badge.check_params->>'max_seconds')::int
          AND nota >= (v_badge.check_params->>'min_nota')::numeric) INTO v_earned;
      WHEN 'streak_days' THEN
        WITH daily AS (SELECT DISTINCT DATE(created_at) as play_date FROM public.game_sessions
          WHERE user_id = p_teacher_id AND user_type = v_user_type AND completed = true),
        grouped AS (SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp FROM daily),
        streaks AS (SELECT COUNT(*) as streak_len FROM grouped GROUP BY grp)
        SELECT COALESCE(MAX(streak_len), 0) >= (v_badge.check_params->>'min_days')::int INTO v_earned FROM streaks;
      WHEN 'total_time' THEN
        SELECT COALESCE(SUM(duration_seconds), 0) >= (v_badge.check_params->>'min_seconds')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND completed = true;
      WHEN 'distinct_subjects' THEN
        SELECT COUNT(DISTINCT subject_id) >= (v_badge.check_params->>'min_subjects')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_teacher_id AND user_type = v_user_type AND completed = true AND subject_id IS NOT NULL;
      ELSE v_earned := false;
    END CASE;

    IF v_earned THEN
      INSERT INTO public.teacher_badges (teacher_id, badge_id) VALUES (p_teacher_id, v_badge.id) ON CONFLICT DO NOTHING;
      v_badge_xp := v_badge_xp + v_badge.xp_reward;
      INSERT INTO public.teacher_xp_log (teacher_id, xp_amount, source, source_id)
      VALUES (p_teacher_id, v_badge.xp_reward, 'badge', v_badge.code);
      v_new_badges_arr := v_new_badges_arr || jsonb_build_object(
        'code', v_badge.code, 'name_es', v_badge.name_es, 'description_es', v_badge.description_es,
        'icon', v_badge.icon, 'rarity', v_badge.rarity, 'xp_reward', v_badge.xp_reward
      );
    END IF;
  END LOOP;

  v_new_xp := v_old_xp + v_session_xp + v_badge_xp;
  v_new_level := calculate_level(v_new_xp);

  UPDATE public.teacher_xp SET total_xp = v_new_xp, level = v_new_level, updated_at = now()
  WHERE teacher_id = p_teacher_id;

  RETURN json_build_object(
    'success', true, 'session_xp', v_session_xp, 'badge_xp', v_badge_xp,
    'total_xp_gained', v_session_xp + v_badge_xp,
    'old_xp', v_old_xp, 'new_xp', v_new_xp,
    'old_level', v_old_level, 'new_level', v_new_level,
    'level_up', v_new_level > v_old_level,
    'new_badges', v_new_badges_arr,
    'xp_for_current_level', xp_for_level(v_new_level),
    'xp_for_next_level', xp_for_level(v_new_level + 1),
    'xp_capped', v_xp_capped
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION gamification_process_teacher_session TO anon, authenticated;

-- Función: obtener gamificación de teacher
CREATE OR REPLACE FUNCTION teacher_get_gamification(
  p_teacher_id UUID
) RETURNS JSON AS $$
DECLARE
  v_xp INTEGER;
  v_level INTEGER;
  v_earned JSON;
  v_all JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = p_teacher_id) THEN
    RETURN json_build_object('error', 'No encontrado');
  END IF;

  SELECT COALESCE(total_xp, 0), COALESCE(level, 1) INTO v_xp, v_level
  FROM public.teacher_xp WHERE teacher_id = p_teacher_id;
  IF NOT FOUND THEN v_xp := 0; v_level := 1; END IF;

  SELECT json_agg(sub ORDER BY sub.earned_at DESC) INTO v_earned FROM (
    SELECT bd.code, bd.name_es, bd.description_es, bd.icon, bd.rarity, bd.xp_reward, bd.category, tb.earned_at
    FROM public.teacher_badges tb JOIN public.badge_definitions bd ON bd.id = tb.badge_id
    WHERE tb.teacher_id = p_teacher_id
  ) sub;

  SELECT json_agg(sub ORDER BY sub.sort_order) INTO v_all FROM (
    SELECT bd.code, bd.name_es, bd.description_es, bd.icon, bd.rarity, bd.xp_reward, bd.category, bd.sort_order,
           EXISTS(SELECT 1 FROM public.teacher_badges tb WHERE tb.teacher_id = p_teacher_id AND tb.badge_id = bd.id) as earned
    FROM public.badge_definitions bd WHERE bd.active = true
  ) sub;

  RETURN json_build_object(
    'success', true, 'total_xp', v_xp, 'level', v_level,
    'xp_for_current_level', xp_for_level(v_level), 'xp_for_next_level', xp_for_level(v_level + 1),
    'earned_badges', COALESCE(v_earned, '[]'::json), 'all_badges', COALESCE(v_all, '[]'::json),
    'total_earned', (SELECT COUNT(*) FROM public.teacher_badges WHERE teacher_id = p_teacher_id),
    'total_available', (SELECT COUNT(*) FROM public.badge_definitions WHERE active = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION teacher_get_gamification TO anon, authenticated;
