-- ============================================================
-- Migración: Sistema de Gamificación (XP, Niveles, Insignias)
-- ============================================================

-- ═══════════════════════════════════════════════
-- 1. TABLAS
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.student_xp (
  student_id UUID PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_xp_level ON public.student_xp(level DESC);
ALTER TABLE public.student_xp ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description_es TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏅',
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER NOT NULL DEFAULT 0,
  check_type TEXT NOT NULL,
  check_params JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_active ON public.badge_definitions(active) WHERE active = true;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badge_definitions" ON public.badge_definitions FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  badge_id INTEGER NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_xp_log_student ON public.xp_log(student_id, created_at DESC);
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;

-- Índice adicional para optimizar las queries de gamificación
CREATE INDEX IF NOT EXISTS idx_game_sessions_student_completed
ON public.game_sessions(user_id, user_type, completed)
WHERE user_type = 'student' AND completed = true;

-- ═══════════════════════════════════════════════
-- 2. FUNCIONES AUXILIARES (Nivel)
-- ═══════════════════════════════════════════════

-- Fórmula: cada nivel cuesta 200 + (nivel-1)*34 XP
-- Nivel 2: 200 XP, Nivel 5: 1004 XP, Nivel 10: 3170 XP, Nivel 50: 49784 XP
CREATE OR REPLACE FUNCTION calculate_level(p_xp INTEGER) RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
  v_threshold INTEGER := 0;
BEGIN
  LOOP
    v_threshold := v_threshold + 200 + (v_level - 1) * 34;
    IF p_xp < v_threshold THEN RETURN v_level; END IF;
    v_level := v_level + 1;
    IF v_level > 50 THEN RETURN 50; END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION xp_for_level(p_level INTEGER) RETURNS INTEGER AS $$
DECLARE
  v_xp INTEGER := 0;
  v_i INTEGER;
BEGIN
  FOR v_i IN 1..(p_level - 1) LOOP
    v_xp := v_xp + 200 + (v_i - 1) * 34;
  END LOOP;
  RETURN v_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ═══════════════════════════════════════════════
-- 3. INSERTAR 35 INSIGNIAS
-- ═══════════════════════════════════════════════

INSERT INTO public.badge_definitions (code, category, name_es, description_es, icon, rarity, xp_reward, check_type, check_params, sort_order) VALUES

-- ═══ GENERAL: partidas completadas (1 → 1000) ═══
('first_game',   'general', 'Primera Partida',       'Completa tu primera partida',         '🎮', 'common',    25, 'completed_games',     '{"min_count": 1}',     1),
('games_5',      'general', 'Principiante',          'Completa 5 partidas',                 '🎲', 'common',    25, 'completed_games',     '{"min_count": 5}',     2),
('games_10',     'general', 'Jugador Dedicado',      'Completa 10 partidas',                '🕹️', 'common',    25, 'completed_games',     '{"min_count": 10}',    3),
('games_25',     'general', 'Aficionado',            'Completa 25 partidas',                '🎯', 'common',    25, 'completed_games',     '{"min_count": 25}',    4),
('games_50',     'general', 'Jugador Veterano',      'Completa 50 partidas',                '🏹', 'rare',      75, 'completed_games',     '{"min_count": 50}',    5),
('games_100',    'general', 'Centenario',            'Completa 100 partidas',               '💯', 'rare',      75, 'completed_games',     '{"min_count": 100}',   6),
('games_250',    'general', 'Incombustible',         'Completa 250 partidas',               '🛡️', 'epic',     200, 'completed_games',     '{"min_count": 250}',   7),
('games_500',    'general', 'Leyenda del Juego',     'Completa 500 partidas',               '👑', 'epic',     200, 'completed_games',     '{"min_count": 500}',   8),
('games_1000',   'general', 'Maestro Absoluto',      'Completa 1000 partidas',              '🏆', 'legendary', 500, 'completed_games',    '{"min_count": 1000}',  9),

-- ═══ EXAMENES: aprobados (1 → 200) ═══
('first_exam',   'exams',   'Primer Examen',         'Aprueba tu primer examen',            '📝', 'common',    25, 'exam_passed',         '{"min_count": 1}',    10),
('exams_3',      'exams',   'Estudiante Aplicado',   'Aprueba 3 examenes',                  '📄', 'common',    25, 'exam_passed',         '{"min_count": 3}',    11),
('exams_5',      'exams',   'Examinado',             'Aprueba 5 examenes',                  '📋', 'common',    25, 'exam_passed',         '{"min_count": 5}',    12),
('exams_10',     'exams',   'Estudiante Formal',     'Aprueba 10 examenes',                 '🎓', 'rare',      75, 'exam_passed',         '{"min_count": 10}',   13),
('exams_25',     'exams',   'Experto en Examenes',   'Aprueba 25 examenes',                 '📚', 'rare',      75, 'exam_passed',         '{"min_count": 25}',   14),
('exams_50',     'exams',   'Maestro de Examenes',   'Aprueba 50 examenes',                 '🧠', 'epic',     200, 'exam_passed',         '{"min_count": 50}',   15),
('exams_100',    'exams',   'Imparable',             'Aprueba 100 examenes',                '⚡', 'epic',     200, 'exam_passed',         '{"min_count": 100}',  16),
('exams_200',    'exams',   'Fuerza de la Naturaleza','Aprueba 200 examenes',               '🌪️', 'legendary', 500, 'exam_passed',        '{"min_count": 200}',  17),

-- ═══ MAESTRIA: notas perfectas (1 → 50) ═══
('perfect_1',        'mastery', 'Primera Matricula',  'Saca un 10 en un examen',             '⭐', 'common',    25, 'perfect_score',       '{"min_count": 1}',   20),
('perfect_3',        'mastery', 'Brillante',          'Saca un 10 en 3 examenes',            '✨', 'common',    25, 'perfect_score',       '{"min_count": 3}',   21),
('perfect_5',        'mastery', 'Genio en Accion',    'Saca un 10 en 5 examenes',            '🌟', 'rare',      75, 'perfect_score',       '{"min_count": 5}',   22),
('perfect_10',       'mastery', 'Perfeccionista',     'Saca un 10 en 10 examenes',           '💫', 'rare',      75, 'perfect_score',       '{"min_count": 10}',  23),
('perfect_25',       'mastery', 'Mente Dorada',       'Saca un 10 en 25 examenes',           '🔱', 'epic',     200, 'perfect_score',       '{"min_count": 25}',  24),
('perfect_50',       'mastery', 'Cerebro de Diamante','Saca un 10 en 50 examenes',           '💎', 'legendary', 500, 'perfect_score',      '{"min_count": 50}',  25),

-- ═══ MAESTRIA: 10 en apps distintas (1 → 15) ═══
('perfect_1_app',    'mastery', 'Primer Diez',        'Saca un 10 en una app',               '🎖️', 'common',    25, 'perfect_distinct_apps','{"min_apps": 1}',   26),
('perfect_3_apps',   'mastery', 'Multiexperto',       'Saca un 10 en 3 apps diferentes',     '🥉', 'rare',      75, 'perfect_distinct_apps','{"min_apps": 3}',   27),
('perfect_5_apps',   'mastery', 'Sabio Universal',    'Saca un 10 en 5 apps diferentes',     '🥈', 'epic',     200, 'perfect_distinct_apps','{"min_apps": 5}',   28),
('perfect_10_apps',  'mastery', 'El Elegido',         'Saca un 10 en 10 apps diferentes',    '🥇', 'legendary', 500, 'perfect_distinct_apps','{"min_apps": 10}', 29),
('perfect_15_apps',  'mastery', 'Ser Superior',       'Saca un 10 en 15 apps diferentes',    '👁️', 'legendary', 500, 'perfect_distinct_apps','{"min_apps": 15}', 30),

-- ═══ EXPLORACION: apps distintas (1 → 30) ═══
('apps_1',       'exploration', 'Curioso',            'Juega tu primera app',                '🔍', 'common',    25, 'distinct_apps',       '{"min_apps": 1}',   40),
('apps_3',       'exploration', 'Explorador',         'Juega en 3 apps diferentes',          '🗺️', 'common',    25, 'distinct_apps',       '{"min_apps": 3}',   41),
('apps_5',       'exploration', 'Aventurero',         'Juega en 5 apps diferentes',          '🧭', 'common',    25, 'distinct_apps',       '{"min_apps": 5}',   42),
('apps_10',      'exploration', 'Trotamundos',        'Juega en 10 apps diferentes',         '🌍', 'rare',      75, 'distinct_apps',       '{"min_apps": 10}',  43),
('apps_15',      'exploration', 'Viajero del Saber',  'Juega en 15 apps diferentes',         '✈️', 'rare',      75, 'distinct_apps',       '{"min_apps": 15}',  44),
('apps_20',      'exploration', 'Ciudadano del Mundo','Juega en 20 apps diferentes',         '🚀', 'epic',     200, 'distinct_apps',       '{"min_apps": 20}',  45),
('apps_30',      'exploration', 'Omnisciente',        'Juega en 30 apps diferentes',         '🌌', 'legendary', 500, 'distinct_apps',      '{"min_apps": 30}',  46),

-- ═══ VELOCIDAD ═══
('speed_60s',    'speed',   'Agil',                   'Aprueba un examen en menos de 60s',   '🏃', 'common',    25, 'speed_exam',          '{"max_seconds": 60, "min_nota": 5}',  50),
('speed_30s',    'speed',   'Veloz',                  'Aprueba un examen en menos de 30s',   '⏱️', 'rare',      75, 'speed_exam',          '{"max_seconds": 30, "min_nota": 5}',  51),
('speed_10s',    'speed',   'Rayo',                   'Aprueba un examen en menos de 10s',   '⚡', 'epic',     200, 'speed_exam',          '{"max_seconds": 10, "min_nota": 5}',  52),
('speed_5s',     'speed',   'Velocidad Luz',          'Aprueba un examen en menos de 5s',    '☄️', 'legendary', 500, 'speed_exam',         '{"max_seconds": 5, "min_nota": 5}',   53),
('speed_perf_60','speed',   'Rapido y Certero',       'Saca un 10 en menos de 60 segundos',  '🎯', 'rare',      75, 'speed_exam',          '{"max_seconds": 60, "min_nota": 10}', 54),
('speed_perf_30','speed',   'Perfecto y Rapido',      'Saca un 10 en menos de 30 segundos',  '💥', 'epic',     200, 'speed_exam',          '{"max_seconds": 30, "min_nota": 10}', 55),
('speed_perf_10','speed',   'Dios del Tiempo',        'Saca un 10 en menos de 10 segundos',  '🕳️', 'legendary', 500, 'speed_exam',         '{"max_seconds": 10, "min_nota": 10}', 56),

-- ═══ RACHAS: dias seguidos (2 → 100) ═══
('streak_2',     'streaks', 'Buen Comienzo',          'Juega 2 dias seguidos',               '🔥', 'common',    25, 'streak_days',         '{"min_days": 2}',   60),
('streak_3',     'streaks', 'Constante',              'Juega 3 dias seguidos',               '🔥', 'common',    25, 'streak_days',         '{"min_days": 3}',   61),
('streak_5',     'streaks', 'Perseverante',           'Juega 5 dias seguidos',               '🔥', 'common',    25, 'streak_days',         '{"min_days": 5}',   62),
('streak_7',     'streaks', 'Semana Completa',        'Juega 7 dias seguidos',               '🔥', 'rare',      75, 'streak_days',         '{"min_days": 7}',   63),
('streak_10',    'streaks', 'Implacable',             'Juega 10 dias seguidos',              '🔥', 'rare',      75, 'streak_days',         '{"min_days": 10}',  64),
('streak_15',    'streaks', 'Quincena de Fuego',      'Juega 15 dias seguidos',              '🔥', 'rare',      75, 'streak_days',         '{"min_days": 15}',  65),
('streak_30',    'streaks', 'Maquina',                'Juega 30 dias seguidos',              '🔥', 'epic',     200, 'streak_days',         '{"min_days": 30}',  66),
('streak_50',    'streaks', 'Leyenda Viviente',       'Juega 50 dias seguidos',              '🔥', 'epic',     200, 'streak_days',         '{"min_days": 50}',  67),
('streak_100',   'streaks', 'Inmortal',               'Juega 100 dias seguidos',             '🔥', 'legendary', 500, 'streak_days',        '{"min_days": 100}', 68),

-- ═══ DEDICACION: tiempo total (30min → 100h) ═══
('time_30m',     'dedication', 'Calentamiento',       'Acumula 30 minutos de juego',         '⏱️', 'common',    25, 'total_time',          '{"min_seconds": 1800}',    70),
('time_1h',      'dedication', 'Primera Hora',        'Acumula 1 hora de juego',             '⏰', 'common',    25, 'total_time',          '{"min_seconds": 3600}',    71),
('time_3h',      'dedication', 'Entusiasta',          'Acumula 3 horas de juego',            '🕑', 'common',    25, 'total_time',          '{"min_seconds": 10800}',   72),
('time_5h',      'dedication', 'Maratonista',         'Acumula 5 horas de juego',            '⏳', 'rare',      75, 'total_time',          '{"min_seconds": 18000}',   73),
('time_10h',     'dedication', 'Atleta Mental',       'Acumula 10 horas de juego',           '🧗', 'rare',      75, 'total_time',          '{"min_seconds": 36000}',   74),
('time_20h',     'dedication', 'Incansable',          'Acumula 20 horas de juego',           '🕐', 'epic',     200, 'total_time',          '{"min_seconds": 72000}',   75),
('time_50h',     'dedication', 'Eterno',              'Acumula 50 horas de juego',           '♾️', 'epic',     200, 'total_time',          '{"min_seconds": 180000}',  76),
('time_100h',    'dedication', 'Leyenda del Tiempo',  'Acumula 100 horas de juego',          '🌅', 'legendary', 500, 'total_time',         '{"min_seconds": 360000}',  77),

-- ═══ ASIGNATURAS: distintas (1 → 10) ═══
('subjects_1',   'subjects', 'Primer Paso',           'Juega en una asignatura',             '📗', 'common',    25, 'distinct_subjects',   '{"min_subjects": 1}',  80),
('subjects_3',   'subjects', 'Multidisciplinar',      'Juega en 3 asignaturas diferentes',   '📖', 'common',    25, 'distinct_subjects',   '{"min_subjects": 3}',  81),
('subjects_5',   'subjects', 'Polifacetico',          'Juega en 5 asignaturas diferentes',   '📚', 'rare',      75, 'distinct_subjects',   '{"min_subjects": 5}',  82),
('subjects_8',   'subjects', 'Erudito',               'Juega en 8 asignaturas diferentes',   '🎓', 'epic',     200, 'distinct_subjects',   '{"min_subjects": 8}',  83),
('subjects_10',  'subjects', 'Renacentista',          'Juega en 10 asignaturas diferentes',  '🏛️', 'legendary', 500, 'distinct_subjects',  '{"min_subjects": 10}', 84)

ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 4. FUNCIÓN PRINCIPAL: procesar sesión
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION gamification_process_session(
  p_student_id UUID,
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
  v_today_count INTEGER;
  v_xp_capped BOOLEAN := false;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
    RETURN json_build_object('error', 'Student not found');
  END IF;

  INSERT INTO public.student_xp (student_id, total_xp, level)
  VALUES (p_student_id, 0, 1)
  ON CONFLICT (student_id) DO NOTHING;

  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM public.student_xp WHERE student_id = p_student_id;

  -- Comprobar límite: max 5 partidas con XP por app y día
  SELECT COUNT(*) INTO v_today_count
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student'
    AND app_id = p_session_app_id AND completed = true
    AND DATE(created_at) = CURRENT_DATE;

  -- Calcular XP de sesión (0 si se supera el límite diario)
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

  INSERT INTO public.xp_log (student_id, xp_amount, source, source_id)
  VALUES (p_student_id, v_session_xp, 'session', p_session_app_id);

  -- Comprobar insignias no obtenidas
  FOR v_badge IN
    SELECT bd.*
    FROM public.badge_definitions bd
    WHERE bd.active = true
      AND NOT EXISTS (
        SELECT 1 FROM public.student_badges sb
        WHERE sb.student_id = p_student_id AND sb.badge_id = bd.id
      )
    ORDER BY bd.sort_order
  LOOP
    v_earned := false;

    CASE v_badge.check_type

      WHEN 'completed_games' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student' AND completed = true;

      WHEN 'exam_passed' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student'
          AND mode = 'test' AND completed = true AND nota >= 5;

      WHEN 'perfect_score' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student'
          AND mode = 'test' AND nota >= 10;

      WHEN 'perfect_distinct_apps' THEN
        SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student' AND nota >= 10;

      WHEN 'distinct_apps' THEN
        SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student' AND completed = true;

      WHEN 'speed_exam' THEN
        SELECT EXISTS(
          SELECT 1 FROM public.game_sessions
          WHERE user_id = p_student_id AND user_type = 'student'
            AND mode = 'test' AND completed = true
            AND duration_seconds IS NOT NULL
            AND duration_seconds <= (v_badge.check_params->>'max_seconds')::int
            AND nota >= (v_badge.check_params->>'min_nota')::numeric
        ) INTO v_earned;

      WHEN 'streak_days' THEN
        WITH daily AS (
          SELECT DISTINCT DATE(created_at) as play_date
          FROM public.game_sessions
          WHERE user_id = p_student_id AND user_type = 'student' AND completed = true
        ),
        grouped AS (
          SELECT play_date,
                 play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp
          FROM daily
        ),
        streaks AS (
          SELECT COUNT(*) as streak_len FROM grouped GROUP BY grp
        )
        SELECT COALESCE(MAX(streak_len), 0) >= (v_badge.check_params->>'min_days')::int
        INTO v_earned FROM streaks;

      WHEN 'total_time' THEN
        SELECT COALESCE(SUM(duration_seconds), 0) >= (v_badge.check_params->>'min_seconds')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student' AND completed = true;

      WHEN 'distinct_subjects' THEN
        SELECT COUNT(DISTINCT subject_id) >= (v_badge.check_params->>'min_subjects')::int INTO v_earned
        FROM public.game_sessions
        WHERE user_id = p_student_id AND user_type = 'student'
          AND completed = true AND subject_id IS NOT NULL;

      ELSE
        v_earned := false;
    END CASE;

    IF v_earned THEN
      INSERT INTO public.student_badges (student_id, badge_id)
      VALUES (p_student_id, v_badge.id)
      ON CONFLICT DO NOTHING;

      v_badge_xp := v_badge_xp + v_badge.xp_reward;

      INSERT INTO public.xp_log (student_id, xp_amount, source, source_id)
      VALUES (p_student_id, v_badge.xp_reward, 'badge', v_badge.code);

      v_new_badges_arr := v_new_badges_arr || jsonb_build_object(
        'code', v_badge.code,
        'name_es', v_badge.name_es,
        'description_es', v_badge.description_es,
        'icon', v_badge.icon,
        'rarity', v_badge.rarity,
        'xp_reward', v_badge.xp_reward
      );
    END IF;
  END LOOP;

  -- Actualizar XP total (incremento relativo para evitar race conditions)
  v_new_xp := v_old_xp + v_session_xp + v_badge_xp;
  v_new_level := calculate_level(v_new_xp);

  UPDATE public.student_xp
  SET total_xp = v_new_xp, level = v_new_level, updated_at = now()
  WHERE student_id = p_student_id;

  RETURN json_build_object(
    'success', true,
    'session_xp', v_session_xp,
    'badge_xp', v_badge_xp,
    'total_xp_gained', v_session_xp + v_badge_xp,
    'old_xp', v_old_xp,
    'new_xp', v_new_xp,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'level_up', v_new_level > v_old_level,
    'new_badges', v_new_badges_arr,
    'xp_for_current_level', xp_for_level(v_new_level),
    'xp_for_next_level', xp_for_level(v_new_level + 1),
    'xp_capped', v_xp_capped
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION gamification_process_session TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 5. FUNCIÓN: obtener estado de gamificación
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION student_get_gamification(
  p_student_id UUID,
  p_group_id UUID
) RETURNS JSON AS $$
DECLARE
  v_xp INTEGER;
  v_level INTEGER;
  v_earned JSON;
  v_all JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.students WHERE id = p_student_id AND group_id = p_group_id
  ) THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  SELECT COALESCE(total_xp, 0), COALESCE(level, 1)
  INTO v_xp, v_level
  FROM public.student_xp WHERE student_id = p_student_id;

  IF NOT FOUND THEN
    v_xp := 0; v_level := 1;
  END IF;

  SELECT json_agg(sub ORDER BY sub.earned_at DESC) INTO v_earned FROM (
    SELECT bd.code, bd.name_es, bd.description_es, bd.icon, bd.rarity,
           bd.xp_reward, bd.category, sb.earned_at
    FROM public.student_badges sb
    JOIN public.badge_definitions bd ON bd.id = sb.badge_id
    WHERE sb.student_id = p_student_id
  ) sub;

  SELECT json_agg(sub ORDER BY sub.sort_order) INTO v_all FROM (
    SELECT bd.code, bd.name_es, bd.description_es, bd.icon, bd.rarity,
           bd.xp_reward, bd.category, bd.sort_order,
           EXISTS(
             SELECT 1 FROM public.student_badges sb
             WHERE sb.student_id = p_student_id AND sb.badge_id = bd.id
           ) as earned
    FROM public.badge_definitions bd
    WHERE bd.active = true
  ) sub;

  RETURN json_build_object(
    'success', true,
    'total_xp', v_xp,
    'level', v_level,
    'xp_for_current_level', xp_for_level(v_level),
    'xp_for_next_level', xp_for_level(v_level + 1),
    'earned_badges', COALESCE(v_earned, '[]'::json),
    'all_badges', COALESCE(v_all, '[]'::json),
    'total_earned', (SELECT COUNT(*) FROM public.student_badges WHERE student_id = p_student_id),
    'total_available', (SELECT COUNT(*) FROM public.badge_definitions WHERE active = true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION student_get_gamification TO anon, authenticated;

-- ═══════════════════════════════════════════════
-- 6. FUNCIÓN: cálculo retroactivo para un alumno
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION gamification_retroactive_calculate(
  p_student_id UUID
) RETURNS JSON AS $$
DECLARE
  v_total_xp INTEGER := 0;
  v_session RECORD;
  v_session_xp INTEGER;
  v_badge RECORD;
  v_earned BOOLEAN;
  v_badge_count INTEGER := 0;
BEGIN
  DELETE FROM public.student_badges WHERE student_id = p_student_id;
  DELETE FROM public.xp_log WHERE student_id = p_student_id;
  DELETE FROM public.student_xp WHERE student_id = p_student_id;

  FOR v_session IN
    SELECT mode, nota FROM public.game_sessions
    WHERE user_id = p_student_id AND user_type = 'student' AND completed = true
    ORDER BY created_at
  LOOP
    v_session_xp := 10;
    IF v_session.mode = 'test' THEN v_session_xp := v_session_xp + 5; END IF;
    IF v_session.nota >= 5  THEN v_session_xp := v_session_xp + 5;  END IF;
    IF v_session.nota >= 7  THEN v_session_xp := v_session_xp + 5;  END IF;
    IF v_session.nota >= 9  THEN v_session_xp := v_session_xp + 5;  END IF;
    IF v_session.nota >= 10 THEN v_session_xp := v_session_xp + 10; END IF;
    v_total_xp := v_total_xp + v_session_xp;
  END LOOP;

  FOR v_badge IN SELECT * FROM public.badge_definitions WHERE active = true ORDER BY sort_order
  LOOP
    v_earned := false;
    CASE v_badge.check_type
      WHEN 'completed_games' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND completed = true;
      WHEN 'exam_passed' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND mode = 'test' AND completed = true AND nota >= 5;
      WHEN 'perfect_score' THEN
        SELECT COUNT(*) >= (v_badge.check_params->>'min_count')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND mode = 'test' AND nota >= 10;
      WHEN 'perfect_distinct_apps' THEN
        SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND nota >= 10;
      WHEN 'distinct_apps' THEN
        SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND completed = true;
      WHEN 'speed_exam' THEN
        SELECT EXISTS(SELECT 1 FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student'
          AND mode = 'test' AND completed = true AND duration_seconds IS NOT NULL
          AND duration_seconds <= (v_badge.check_params->>'max_seconds')::int
          AND nota >= (v_badge.check_params->>'min_nota')::numeric) INTO v_earned;
      WHEN 'streak_days' THEN
        WITH daily AS (SELECT DISTINCT DATE(created_at) as play_date FROM public.game_sessions
          WHERE user_id = p_student_id AND user_type = 'student' AND completed = true),
        grouped AS (SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp FROM daily),
        streaks AS (SELECT COUNT(*) as streak_len FROM grouped GROUP BY grp)
        SELECT COALESCE(MAX(streak_len), 0) >= (v_badge.check_params->>'min_days')::int INTO v_earned FROM streaks;
      WHEN 'total_time' THEN
        SELECT COALESCE(SUM(duration_seconds), 0) >= (v_badge.check_params->>'min_seconds')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND completed = true;
      WHEN 'distinct_subjects' THEN
        SELECT COUNT(DISTINCT subject_id) >= (v_badge.check_params->>'min_subjects')::int INTO v_earned
        FROM public.game_sessions WHERE user_id = p_student_id AND user_type = 'student' AND completed = true AND subject_id IS NOT NULL;
      ELSE v_earned := false;
    END CASE;

    IF v_earned THEN
      INSERT INTO public.student_badges (student_id, badge_id) VALUES (p_student_id, v_badge.id) ON CONFLICT DO NOTHING;
      v_total_xp := v_total_xp + v_badge.xp_reward;
      v_badge_count := v_badge_count + 1;
    END IF;
  END LOOP;

  INSERT INTO public.student_xp (student_id, total_xp, level)
  VALUES (p_student_id, v_total_xp, calculate_level(v_total_xp));

  INSERT INTO public.xp_log (student_id, xp_amount, source, source_id)
  VALUES (p_student_id, v_total_xp, 'retroactive', 'initial_migration');

  RETURN json_build_object('success', true, 'total_xp', v_total_xp, 'level', calculate_level(v_total_xp), 'badges_earned', v_badge_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION gamification_retroactive_calculate TO anon, authenticated;

-- Batch para todos los alumnos
CREATE OR REPLACE FUNCTION gamification_retroactive_all() RETURNS JSON AS $$
DECLARE
  v_student RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_student IN SELECT id FROM public.students LOOP
    PERFORM gamification_retroactive_calculate(v_student.id);
    v_count := v_count + 1;
  END LOOP;
  RETURN json_build_object('success', true, 'students_processed', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION gamification_retroactive_all TO anon, authenticated;
