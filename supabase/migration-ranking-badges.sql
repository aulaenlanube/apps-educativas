-- ============================================================
-- MIGRACION: Insignias de ranking (mejores puntuaciones)
-- ============================================================
-- 25 nuevas insignias basadas en posiciones de ranking.
-- Se agrupan en 5 categorias de logro x 5 hitos (1, 3, 5, 10 apps).
--
-- Categorias:
--   1. top10_global  - Entrar en el top 10 global
--   2. top3_global   - Entrar en el top 3 global
--   3. first_global  - Primero global
--   4. top3_class    - Entrar en el top 3 de la clase
--   5. first_class   - Primero de la clase
--
-- check_type nuevos: 'ranking_top10_global', 'ranking_top3_global',
--   'ranking_first_global', 'ranking_top3_class', 'ranking_first_class'
-- check_params: {"min_apps": N} — en cuantas apps distintas
-- ============================================================

-- ═══════════════════════════════════════════════
-- 1. TABLA DE LOGROS DE RANKING (por usuario)
-- ═══════════════════════════════════════════════
-- Registra en cuantas apps distintas un usuario ha alcanzado cada hito.
-- Se actualiza en cada upsert_high_score.

CREATE TABLE IF NOT EXISTS public.user_ranking_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'free', 'student')),
  app_id TEXT NOT NULL,
  level TEXT,
  grade TEXT,
  subject_id TEXT,
  -- Posiciones alcanzadas
  global_rank INTEGER,          -- mejor posicion global alcanzada
  class_rank INTEGER,           -- mejor posicion en clase alcanzada
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (user_id, user_type, app_id, level, grade, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_ura_user ON public.user_ranking_achievements (user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_ura_global ON public.user_ranking_achievements (user_id, user_type, global_rank) WHERE global_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ura_class ON public.user_ranking_achievements (user_id, user_type, class_rank) WHERE class_rank IS NOT NULL;

ALTER TABLE public.user_ranking_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ranking achievements" ON public.user_ranking_achievements FOR SELECT USING (true);


-- ═══════════════════════════════════════════════
-- 2. INSERTAR 25 INSIGNIAS DE RANKING
-- ═══════════════════════════════════════════════

INSERT INTO public.badge_definitions (code, category, name_es, description_es, icon, rarity, xp_reward, check_type, check_params, sort_order) VALUES

-- ═══ TOP 10 GLOBAL: entrar en top 10 en N apps distintas ═══
('rank_top10_1',    'ranking', 'Top 10',              'Entra en el top 10 global en una app',           '🏅', 'common',     25, 'ranking_top10_global',  '{"min_apps": 1}',   100),
('rank_top10_3',    'ranking', 'Competidor',           'Entra en el top 10 global en 3 apps distintas',  '🏅', 'common',     25, 'ranking_top10_global',  '{"min_apps": 3}',   101),
('rank_top10_5',    'ranking', 'Rival Temible',        'Entra en el top 10 global en 5 apps distintas',  '🏅', 'rare',       75, 'ranking_top10_global',  '{"min_apps": 5}',   102),
('rank_top10_10',   'ranking', 'Elite Global',         'Entra en el top 10 global en 10 apps distintas', '🏅', 'epic',      200, 'ranking_top10_global',  '{"min_apps": 10}',  103),

-- ═══ TOP 3 GLOBAL: podio en N apps distintas ═══
('rank_top3_1',     'ranking', 'Podio',                'Entra en el podio global en una app',            '🥉', 'common',     25, 'ranking_top3_global',   '{"min_apps": 1}',   110),
('rank_top3_3',     'ranking', 'Podio Multiple',       'Entra en el podio global en 3 apps distintas',   '🥉', 'rare',       75, 'ranking_top3_global',   '{"min_apps": 3}',   111),
('rank_top3_5',     'ranking', 'Coleccionista Podios', 'Entra en el podio global en 5 apps distintas',   '🥈', 'epic',      200, 'ranking_top3_global',   '{"min_apps": 5}',   112),
('rank_top3_10',    'ranking', 'Dios del Podio',       'Entra en el podio global en 10 apps distintas',  '🥇', 'legendary', 500, 'ranking_top3_global',   '{"min_apps": 10}',  113),

-- ═══ PRIMERO GLOBAL: numero 1 en N apps distintas ═══
('rank_first_1',    'ranking', 'Numero Uno',           'Se el primero global en una app',                '👑', 'rare',       75, 'ranking_first_global',  '{"min_apps": 1}',   120),
('rank_first_3',    'ranking', 'Triple Corona',        'Se el primero global en 3 apps distintas',       '👑', 'epic',      200, 'ranking_first_global',  '{"min_apps": 3}',   121),
('rank_first_5',    'ranking', 'Pentagono de Oro',     'Se el primero global en 5 apps distintas',       '👑', 'epic',      200, 'ranking_first_global',  '{"min_apps": 5}',   122),
('rank_first_10',   'ranking', 'Leyenda Absoluta',     'Se el primero global en 10 apps distintas',      '👑', 'legendary', 500, 'ranking_first_global',  '{"min_apps": 10}',  123),

-- ═══ TOP 3 CLASE: podio de clase en N apps distintas ═══
('rank_class3_1',   'ranking', 'Podio de Clase',       'Entra en el top 3 de tu clase en una app',       '🎖️', 'common',     25, 'ranking_top3_class',    '{"min_apps": 1}',   130),
('rank_class3_3',   'ranking', 'Estrella de Clase',    'Entra en el top 3 de tu clase en 3 apps',        '🎖️', 'common',     25, 'ranking_top3_class',    '{"min_apps": 3}',   131),
('rank_class3_5',   'ranking', 'Orgullo de Clase',     'Entra en el top 3 de tu clase en 5 apps',        '🎖️', 'rare',       75, 'ranking_top3_class',    '{"min_apps": 5}',   132),
('rank_class3_10',  'ranking', 'Leyenda de Clase',     'Entra en el top 3 de tu clase en 10 apps',       '🎖️', 'epic',      200, 'ranking_top3_class',    '{"min_apps": 10}',  133),

-- ═══ PRIMERO CLASE: numero 1 de la clase en N apps distintas ═══
('rank_class1_1',   'ranking', 'Primero de Clase',     'Se el primero de tu clase en una app',            '🌟', 'common',     25, 'ranking_first_class',   '{"min_apps": 1}',   140),
('rank_class1_3',   'ranking', 'Campeon de Clase',     'Se el primero de tu clase en 3 apps',             '🌟', 'rare',       75, 'ranking_first_class',   '{"min_apps": 3}',   141),
('rank_class1_5',   'ranking', 'Capitan de Clase',     'Se el primero de tu clase en 5 apps',             '🌟', 'epic',      200, 'ranking_first_class',   '{"min_apps": 5}',   142),
('rank_class1_10',  'ranking', 'Dios de la Clase',     'Se el primero de tu clase en 10 apps',            '🌟', 'legendary', 500, 'ranking_first_class',   '{"min_apps": 10}',  143)

ON CONFLICT (code) DO NOTHING;


-- ═══════════════════════════════════════════════
-- 3. FUNCION: Actualizar logros de ranking y comprobar insignias
-- ═══════════════════════════════════════════════
-- Llamar despues de upsert_high_score cuando is_new_record=true.

CREATE OR REPLACE FUNCTION public.process_ranking_badges(
  p_user_id UUID,
  p_user_type TEXT,
  p_app_id TEXT,
  p_level TEXT DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_subject_id TEXT DEFAULT NULL,
  p_score INTEGER DEFAULT 0,
  p_group_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_global_rank INTEGER;
  v_class_rank INTEGER;
  v_badge RECORD;
  v_earned BOOLEAN;
  v_count INTEGER;
  v_new_badges JSONB := '[]'::JSONB;
  v_badge_xp INTEGER := 0;
  v_student_table TEXT;
  v_xp_table TEXT;
BEGIN
  -- Solo procesar para usuarios con ID
  IF p_user_id IS NULL THEN
    RETURN json_build_object('badges', '[]'::jsonb);
  END IF;

  -- Calcular posicion global
  SELECT COUNT(*) + 1 INTO v_global_rank
  FROM public.high_scores
  WHERE app_id = p_app_id
    AND level IS NOT DISTINCT FROM p_level
    AND grade IS NOT DISTINCT FROM p_grade
    AND subject_id IS NOT DISTINCT FROM p_subject_id
    AND score > p_score;

  -- Calcular posicion de clase
  IF p_user_type = 'student' AND p_group_id IS NOT NULL THEN
    SELECT COUNT(*) + 1 INTO v_class_rank
    FROM public.high_scores
    WHERE app_id = p_app_id
      AND user_type = 'student'
      AND group_id = p_group_id
      AND level IS NOT DISTINCT FROM p_level
      AND grade IS NOT DISTINCT FROM p_grade
      AND subject_id IS NOT DISTINCT FROM p_subject_id
      AND score > p_score;
  END IF;

  -- Upsert logro de ranking
  INSERT INTO public.user_ranking_achievements (
    user_id, user_type, app_id, level, grade, subject_id,
    global_rank, class_rank, updated_at
  ) VALUES (
    p_user_id, p_user_type, p_app_id, p_level, p_grade, p_subject_id,
    v_global_rank, v_class_rank, now()
  )
  ON CONFLICT (user_id, user_type, app_id, level, grade, subject_id)
  DO UPDATE SET
    global_rank = LEAST(EXCLUDED.global_rank, user_ranking_achievements.global_rank),
    class_rank = CASE
      WHEN EXCLUDED.class_rank IS NOT NULL THEN
        LEAST(EXCLUDED.class_rank, COALESCE(user_ranking_achievements.class_rank, EXCLUDED.class_rank))
      ELSE user_ranking_achievements.class_rank
    END,
    updated_at = now();

  -- Comprobar insignias de ranking (solo para students con sistema de badges)
  IF p_user_type = 'student' THEN
    FOR v_badge IN
      SELECT bd.*
      FROM public.badge_definitions bd
      WHERE bd.active = true
        AND bd.check_type LIKE 'ranking_%'
        AND NOT EXISTS (
          SELECT 1 FROM public.student_badges sb
          WHERE sb.student_id = p_user_id AND sb.badge_id = bd.id
        )
      ORDER BY bd.sort_order
    LOOP
      v_earned := false;

      CASE v_badge.check_type

        WHEN 'ranking_top10_global' THEN
          SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
          FROM public.user_ranking_achievements
          WHERE user_id = p_user_id AND user_type = 'student'
            AND global_rank IS NOT NULL AND global_rank <= 10;

        WHEN 'ranking_top3_global' THEN
          SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
          FROM public.user_ranking_achievements
          WHERE user_id = p_user_id AND user_type = 'student'
            AND global_rank IS NOT NULL AND global_rank <= 3;

        WHEN 'ranking_first_global' THEN
          SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
          FROM public.user_ranking_achievements
          WHERE user_id = p_user_id AND user_type = 'student'
            AND global_rank IS NOT NULL AND global_rank = 1;

        WHEN 'ranking_top3_class' THEN
          SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
          FROM public.user_ranking_achievements
          WHERE user_id = p_user_id AND user_type = 'student'
            AND class_rank IS NOT NULL AND class_rank <= 3;

        WHEN 'ranking_first_class' THEN
          SELECT COUNT(DISTINCT app_id) >= (v_badge.check_params->>'min_apps')::int INTO v_earned
          FROM public.user_ranking_achievements
          WHERE user_id = p_user_id AND user_type = 'student'
            AND class_rank IS NOT NULL AND class_rank = 1;

        ELSE
          v_earned := false;
      END CASE;

      IF v_earned THEN
        INSERT INTO public.student_badges (student_id, badge_id)
        VALUES (p_user_id, v_badge.id)
        ON CONFLICT DO NOTHING;

        v_badge_xp := v_badge_xp + v_badge.xp_reward;

        INSERT INTO public.xp_log (student_id, xp_amount, source, source_id)
        VALUES (p_user_id, v_badge.xp_reward, 'badge', v_badge.code);

        v_new_badges := v_new_badges || jsonb_build_object(
          'code', v_badge.code,
          'name_es', v_badge.name_es,
          'description_es', v_badge.description_es,
          'icon', v_badge.icon,
          'rarity', v_badge.rarity,
          'xp_reward', v_badge.xp_reward
        );
      END IF;
    END LOOP;

    -- Actualizar XP si se ganaron badges
    IF v_badge_xp > 0 THEN
      UPDATE public.student_xp
      SET total_xp = total_xp + v_badge_xp,
          level = calculate_level(total_xp + v_badge_xp),
          updated_at = now()
      WHERE student_id = p_user_id;
    END IF;
  END IF;

  RETURN json_build_object(
    'global_rank', v_global_rank,
    'class_rank', v_class_rank,
    'new_badges', v_new_badges,
    'badge_xp', v_badge_xp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.process_ranking_badges TO anon, authenticated;

-- ============================================================
-- FIN
-- ============================================================
