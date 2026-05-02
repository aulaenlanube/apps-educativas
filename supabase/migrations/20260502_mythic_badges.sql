-- =====================================================
-- INSIGNIAS MÍTICAS — 10 insignias top tier (1000 XP cada una)
-- =====================================================

-- 1) Permitir rareza 'mythic' en badge_definitions (idempotente)
DO $$
BEGIN
  ALTER TABLE badge_definitions DROP CONSTRAINT IF EXISTS badge_definitions_rarity_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE badge_definitions
    ADD CONSTRAINT badge_definitions_rarity_check
    CHECK (rarity IN ('common','rare','epic','legendary','mythic'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Insertar las 10 insignias míticas (idempotente)
INSERT INTO badge_definitions (code, category, name_es, description_es, icon, rarity, xp_reward, check_type, check_params, sort_order, active) VALUES
  ('mythic_max_level',              'mythic', 'Cima del Saber',                  'Has alcanzado el nivel máximo de la plataforma. La cumbre absoluta del aprendizaje.',                                          'mythic_max_level',              'mythic', 1000, 'mythic_special', '{"target": 50}'::jsonb,    1001, true),
  ('mythic_duels_500',              'mythic', 'Maestro de los Duelos',           'Has ganado 500 duelos. Eres una leyenda imbatible en el 1 contra 1.',                                                          'mythic_duels_500',              'mythic', 1000, 'mythic_special', '{"target": 500}'::jsonb,   1002, true),
  ('mythic_battles_100',            'mythic', 'Emperador de las Batallas',       'Has ganado 100 batallas Quiz. Indomable cuando la clase entera mira.',                                                         'mythic_battles_100',            'mythic', 1000, 'mythic_special', '{"target": 100}'::jsonb,   1003, true),
  ('mythic_exams_1000',             'mythic', 'Mil Exámenes Aprobados',          'Has aprobado 1000 exámenes. Constancia y dominio absolutos.',                                                                  'mythic_exams_1000',             'mythic', 1000, 'mythic_special', '{"target": 1000}'::jsonb,  1004, true),
  ('mythic_games_10000',            'mythic', 'Diez Mil Partidas',                'Has completado 10.000 partidas. Tu dedicación no tiene rival.',                                                                'mythic_games_10000',            'mythic', 1000, 'mythic_special', '{"target": 10000}'::jsonb, 1005, true),
  ('mythic_top_global_100_apps',    'mythic', 'Cima del Mundo',                   'Has sido el primero global en 100 apps distintas. La élite total de la plataforma.',                                            'mythic_top_global_100_apps',    'mythic', 1000, 'mythic_special', '{"target": 100}'::jsonb,   1006, true),
  ('mythic_streak_365',             'mythic', 'Año Eterno',                       'Has jugado 365 días seguidos. Una constancia mítica.',                                                                          'mythic_streak_365',             'mythic', 1000, 'mythic_special', '{"target": 365}'::jsonb,   1007, true),
  ('mythic_perfect_100_primaria',   'mythic', 'Mente Maestra de Primaria',        'Has sacado un 10 en 100 apps distintas de Primaria. Dominio absoluto.',                                                         'mythic_perfect_100_primaria',   'mythic', 1000, 'mythic_special', '{"target": 100, "level": "primaria"}'::jsonb,     1008, true),
  ('mythic_perfect_100_eso',        'mythic', 'Mente Maestra de la ESO',          'Has sacado un 10 en 100 apps distintas de la ESO. Dominio absoluto.',                                                          'mythic_perfect_100_eso',        'mythic', 1000, 'mythic_special', '{"target": 100, "level": "eso"}'::jsonb,          1009, true),
  ('mythic_perfect_100_bachillerato','mythic','Mente Maestra de Bachillerato',    'Has sacado un 10 en 100 apps distintas de Bachillerato. Dominio absoluto.',                                                    'mythic_perfect_100_bachillerato','mythic',1000, 'mythic_special', '{"target": 100, "level": "bachillerato"}'::jsonb, 1010, true)
ON CONFLICT (code) DO UPDATE SET
  category       = EXCLUDED.category,
  name_es        = EXCLUDED.name_es,
  description_es = EXCLUDED.description_es,
  icon           = EXCLUDED.icon,
  rarity         = EXCLUDED.rarity,
  xp_reward      = EXCLUDED.xp_reward,
  check_type     = EXCLUDED.check_type,
  check_params   = EXCLUDED.check_params,
  sort_order     = EXCLUDED.sort_order,
  active         = EXCLUDED.active;

-- 3) Función interna que evalúa y otorga las 10 insignias míticas a un alumno.
--    Cada insignia tiene su propia regla en función del code.
--    Granula XP, recalcula nivel y registra en xp_log. Idempotente: solo otorga
--    insignias que el alumno aún no tiene.
CREATE OR REPLACE FUNCTION public._check_mythic_badges(p_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_badges jsonb := '[]'::jsonb;
  v_xp_gained int := 0;
  v_badge record;
  v_meets boolean;
  v_count int;
BEGIN
  IF p_student_id IS NULL THEN
    RETURN jsonb_build_object('new_badges', '[]'::jsonb, 'badge_xp', 0);
  END IF;

  FOR v_badge IN
    SELECT bd.id, bd.code, bd.name_es, bd.description_es, bd.xp_reward, bd.rarity, bd.icon
    FROM badge_definitions bd
    WHERE bd.category = 'mythic' AND bd.active = true
      AND NOT EXISTS (
        SELECT 1 FROM student_badges sb
        WHERE sb.student_id = p_student_id AND sb.badge_id = bd.id
      )
    ORDER BY bd.sort_order
  LOOP
    v_meets := false;

    IF v_badge.code = 'mythic_max_level' THEN
      SELECT COALESCE(level, 1) >= 50 INTO v_meets
      FROM student_xp WHERE student_id = p_student_id;

    ELSIF v_badge.code = 'mythic_duels_500' THEN
      SELECT COUNT(*) >= 500 INTO v_meets
      FROM duels
      WHERE winner_id = p_student_id AND status = 'finished';

    ELSIF v_badge.code = 'mythic_battles_100' THEN
      SELECT COUNT(*) >= 100 INTO v_meets
      FROM quiz_battle_sessions
      WHERE user_type = 'student' AND user_id = p_student_id
        AND COALESCE(rank, 99) = 1
        AND COALESCE(player_count, 0) >= 2;

    ELSIF v_badge.code = 'mythic_exams_1000' THEN
      SELECT COUNT(*) >= 1000 INTO v_meets
      FROM game_sessions
      WHERE user_type = 'student' AND user_id = p_student_id AND completed = true
        AND mode = 'test' AND COALESCE(nota, 0) >= 5;

    ELSIF v_badge.code = 'mythic_games_10000' THEN
      SELECT COUNT(*) >= 10000 INTO v_meets
      FROM game_sessions
      WHERE user_type = 'student' AND user_id = p_student_id AND completed = true;

    ELSIF v_badge.code = 'mythic_top_global_100_apps' THEN
      SELECT COUNT(DISTINCT app_id) >= 100 INTO v_meets
      FROM user_ranking_achievements
      WHERE user_type = 'student' AND user_id = p_student_id
        AND COALESCE(global_rank, 99) = 1;

    ELSIF v_badge.code = 'mythic_streak_365' THEN
      WITH daily AS (
        SELECT DISTINCT DATE(created_at) AS play_date
        FROM game_sessions
        WHERE user_type = 'student' AND user_id = p_student_id AND completed = true
      ),
      grouped AS (
        SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp
        FROM daily
      )
      SELECT COALESCE(MAX(c), 0) >= 365 INTO v_meets
      FROM (SELECT COUNT(*) AS c FROM grouped GROUP BY grp) s;

    ELSIF v_badge.code = 'mythic_perfect_100_primaria' THEN
      SELECT COUNT(*) >= 100 INTO v_meets
      FROM (
        SELECT DISTINCT app_id, COALESCE(subject_id,'') AS s, COALESCE(grade,'') AS g
        FROM game_sessions
        WHERE user_type = 'student' AND user_id = p_student_id AND completed = true
          AND mode = 'test' AND COALESCE(nota, 0) >= 9.95
          AND level = 'primaria'
      ) t;

    ELSIF v_badge.code = 'mythic_perfect_100_eso' THEN
      SELECT COUNT(*) >= 100 INTO v_meets
      FROM (
        SELECT DISTINCT app_id, COALESCE(subject_id,'') AS s, COALESCE(grade,'') AS g
        FROM game_sessions
        WHERE user_type = 'student' AND user_id = p_student_id AND completed = true
          AND mode = 'test' AND COALESCE(nota, 0) >= 9.95
          AND level = 'eso'
      ) t;

    ELSIF v_badge.code = 'mythic_perfect_100_bachillerato' THEN
      SELECT COUNT(*) >= 100 INTO v_meets
      FROM (
        SELECT DISTINCT app_id, COALESCE(subject_id,'') AS s, COALESCE(grade,'') AS g
        FROM game_sessions
        WHERE user_type = 'student' AND user_id = p_student_id AND completed = true
          AND mode = 'test' AND COALESCE(nota, 0) >= 9.95
          AND level = 'bachillerato'
      ) t;
    END IF;

    IF COALESCE(v_meets, false) THEN
      INSERT INTO student_badges (student_id, badge_id, earned_at)
      VALUES (p_student_id, v_badge.id, NOW())
      ON CONFLICT DO NOTHING;

      INSERT INTO xp_log (student_id, xp_amount, source, source_id)
      VALUES (p_student_id, v_badge.xp_reward, 'badge', v_badge.id::text);

      v_xp_gained := v_xp_gained + v_badge.xp_reward;

      v_new_badges := v_new_badges || jsonb_build_array(jsonb_build_object(
        'code', v_badge.code,
        'name_es', v_badge.name_es,
        'description_es', v_badge.description_es,
        'rarity', v_badge.rarity,
        'icon', v_badge.icon,
        'xp_reward', v_badge.xp_reward
      ));
    END IF;
  END LOOP;

  -- Aplicar XP y recalcular nivel si se ha otorgado al menos una insignia.
  -- Fórmula del sistema (ver XPConfigPanel): xp_acumulada(L) = 200*(L-1) + 17*(L-1)*(L-2)
  IF v_xp_gained > 0 THEN
    UPDATE student_xp
    SET total_xp = total_xp + v_xp_gained,
        updated_at = NOW()
    WHERE student_id = p_student_id;

    UPDATE student_xp
    SET level = (
      SELECT COALESCE(MAX(L), 1)
      FROM generate_series(1, 50) AS L
      WHERE (200 * (L - 1) + 17 * (L - 1) * (L - 2)) <= student_xp.total_xp
    )
    WHERE student_id = p_student_id;
  END IF;

  RETURN jsonb_build_object(
    'new_badges', v_new_badges,
    'badge_xp', v_xp_gained
  );
END;
$$;

-- 4) RPC pública que el frontend llama tras gamification_process_session.
--    Valida la sesión del alumno y delega en _check_mythic_badges.
CREATE OR REPLACE FUNCTION public.mythic_badges_check(
  p_student_id uuid,
  p_session_token text
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sid uuid;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error', 'invalid_session', 'new_badges', '[]'::jsonb, 'badge_xp', 0);
  END IF;

  RETURN public._check_mythic_badges(p_student_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public._check_mythic_badges(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mythic_badges_check(uuid, text) TO anon, authenticated;
