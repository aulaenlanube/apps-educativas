-- =====================================================
-- AVATAR SYSTEM — paso 5: integración en cálculo de nota
-- y en gamification_process_session
-- =====================================================

-- Reemplaza _compute_student_term_grades para añadir bonus_avatares (cap +0.5)
CREATE OR REPLACE FUNCTION public._compute_student_term_grades(p_student_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_group_id       uuid;
  v_current_term   smallint;
  v_level          int;
  v_progress_bonus numeric;
  v_avatar_bonus   numeric;
  v_avatar_count   int;
  v_result         json;
BEGIN
  SELECT group_id INTO v_group_id FROM public.students WHERE id = p_student_id;
  IF v_group_id IS NULL THEN
    RETURN json_build_object('error', 'Alumno no encontrado');
  END IF;

  SELECT current_term INTO v_current_term FROM public.groups WHERE id = v_group_id;
  IF v_current_term IS NULL THEN
    v_current_term := (
      CASE
        WHEN EXTRACT(MONTH FROM (now() AT TIME ZONE 'Europe/Madrid'))::int BETWEEN 9 AND 12 THEN 1
        WHEN EXTRACT(MONTH FROM (now() AT TIME ZONE 'Europe/Madrid'))::int BETWEEN 1 AND 3 THEN 2
        ELSE 3
      END
    )::smallint;
  END IF;

  SELECT COALESCE(level, 1) INTO v_level FROM public.student_xp WHERE student_id = p_student_id;
  v_level := COALESCE(v_level, 1);
  v_progress_bonus := ROUND((0.5 * SQRT(LEAST(GREATEST(v_level - 1, 0), 49)::numeric / 49.0))::numeric, 3);

  v_avatar_bonus := COALESCE(public._avatar_bonus(p_student_id), 0);
  SELECT COUNT(*)::int INTO v_avatar_count
  FROM public.student_avatars sa
  JOIN public.avatar_definitions ad ON ad.id = sa.avatar_id
  WHERE sa.student_id = p_student_id AND ad.active = true;

  WITH asg_best AS (
    SELECT asg.id, asg.term, asg.weight, asg.min_score,
      COALESCE(best.best_nota, 0) AS nota,
      (COALESCE(best.best_nota, 0) >= asg.min_score) AS completed
    FROM public.assignments asg
    LEFT JOIN LATERAL (
      SELECT MAX(nota) AS best_nota
      FROM public.game_sessions
      WHERE user_id = p_student_id AND user_type = 'student'
        AND app_id = asg.app_id
        AND public.session_counts_for_task(asg.app_id, mode)
        AND created_at >= asg.created_at
    ) best ON true
    WHERE asg.group_id = v_group_id
      AND (asg.student_id IS NULL OR asg.student_id = p_student_id)
  ),
  per_term_asg AS (
    SELECT term,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE completed)::int AS completed,
      SUM(GREATEST(weight, 1))::numeric AS weight_sum,
      SUM(LEAST(GREATEST(nota, 0), 10) * GREATEST(weight, 1))::numeric AS weighted_nota
    FROM asg_best GROUP BY term
  ),
  total_asg AS (
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE completed)::int AS completed,
      SUM(GREATEST(weight, 1))::numeric AS weight_sum,
      SUM(LEAST(GREATEST(nota, 0), 10) * GREATEST(weight, 1))::numeric AS weighted_nota
    FROM asg_best
  ),
  battle_termed AS (
    SELECT
      COALESCE(
        qbs.term,
        CASE
          WHEN EXTRACT(MONTH FROM (qbs.created_at AT TIME ZONE 'Europe/Madrid'))::int BETWEEN 9 AND 12 THEN 1::smallint
          WHEN EXTRACT(MONTH FROM (qbs.created_at AT TIME ZONE 'Europe/Madrid'))::int BETWEEN 1 AND 3 THEN 2::smallint
          ELSE 3::smallint
        END
      )::smallint AS term,
      qbs.rank
    FROM public.quiz_battle_sessions qbs
    WHERE qbs.user_type = 'student'
      AND qbs.user_id  = p_student_id
      AND qbs.rank BETWEEN 1 AND 3
      AND qbs.player_count >= 2
  ),
  battle_per_term AS (
    SELECT term,
      SUM(CASE rank WHEN 1 THEN 1.0 WHEN 2 THEN 2.0/3.0 WHEN 3 THEN 1.0/3.0 ELSE 0 END)::numeric AS score,
      COUNT(*) FILTER (WHERE rank = 1)::int AS c1,
      COUNT(*) FILTER (WHERE rank = 2)::int AS c2,
      COUNT(*) FILTER (WHERE rank = 3)::int AS c3
    FROM battle_termed
    GROUP BY term
  ),
  duel_events AS (
    SELECT
      CASE
        WHEN EXTRACT(MONTH FROM (l.created_at AT TIME ZONE 'Europe/Madrid'))::int BETWEEN 9 AND 12 THEN 1::smallint
        WHEN EXTRACT(MONTH FROM (l.created_at AT TIME ZONE 'Europe/Madrid'))::int BETWEEN 1 AND 3 THEN 2::smallint
        ELSE 3::smallint
      END AS term,
      l.delta,
      (d.assignment_pair_id IS NOT NULL) AS is_task
    FROM public.duel_grade_ledger l
    JOIN public.duels d ON d.id = l.duel_id
    WHERE l.student_id = p_student_id
  ),
  duel_per_term AS (
    SELECT term,
      COUNT(*) FILTER (WHERE is_task AND delta > 0)::int       AS task_wins,
      COUNT(*) FILTER (WHERE is_task AND delta < 0)::int       AS task_losses,
      COUNT(*) FILTER (WHERE NOT is_task AND delta > 0)::int   AS personal_wins,
      COUNT(*) FILTER (WHERE NOT is_task AND delta < 0)::int   AS personal_losses,
      COALESCE(SUM(delta) FILTER (WHERE is_task),     0)::numeric AS task_delta,
      COALESCE(SUM(delta) FILTER (WHERE NOT is_task), 0)::numeric AS personal_delta
    FROM duel_events
    GROUP BY term
  ),
  all_terms AS (
    SELECT generate_series(1, 3)::smallint AS term
  ),
  combined AS (
    SELECT at.term,
      COALESCE(pa.total, 0)     AS total,
      COALESCE(pa.completed, 0) AS completed,
      pa.weight_sum, pa.weighted_nota,
      COALESCE(bt.score, 0) AS battle_score,
      COALESCE(bt.c1, 0) AS c1, COALESCE(bt.c2, 0) AS c2, COALESCE(bt.c3, 0) AS c3,
      COALESCE(dt.task_wins, 0)       AS d_task_wins,
      COALESCE(dt.task_losses, 0)     AS d_task_losses,
      COALESCE(dt.personal_wins, 0)   AS d_pers_wins,
      COALESCE(dt.personal_losses, 0) AS d_pers_losses,
      COALESCE(dt.task_delta, 0)      AS d_task_delta,
      COALESCE(dt.personal_delta, 0)  AS d_pers_delta
    FROM all_terms at
    LEFT JOIN per_term_asg    pa ON pa.term = at.term
    LEFT JOIN battle_per_term bt ON bt.term = at.term
    LEFT JOIN duel_per_term   dt ON dt.term = at.term
  ),
  combined_calc AS (
    SELECT c.*,
      ROUND((0.5 * SQRT(LEAST(c.battle_score, 10)::numeric / 10.0))::numeric, 3) AS battle_bonus,
      ROUND(LEAST(0.5, GREATEST(0, c.d_task_delta))::numeric, 3) AS task_bonus,
      ROUND(c.d_pers_delta, 3) AS personal_bonus,
      CASE WHEN c.weight_sum > 0 THEN ROUND(c.weighted_nota / c.weight_sum, 1) ELSE NULL END AS base_grade_term
    FROM combined c
  )
  SELECT json_build_object(
    'success', true,
    'level', v_level,
    'progress_bonus', v_progress_bonus,
    'avatar_bonus', v_avatar_bonus,
    'avatar_count', v_avatar_count,
    'current_term', v_current_term,
    'terms', COALESCE((
      SELECT json_agg(json_build_object(
        'term', term, 'total', total, 'completed', completed,
        'base_grade', base_grade_term,
        'battle_bonus', battle_bonus,
        'battle_score', ROUND(battle_score, 2),
        'battle_counts', json_build_object('first', c1, 'second', c2, 'third', c3),
        'duel_bonus', GREATEST(-0.5, LEAST(0.5, (task_bonus + personal_bonus)::numeric)),
        'duel_task_bonus', task_bonus,
        'duel_personal_bonus', personal_bonus,
        'duel_counts', json_build_object(
          'task_wins', d_task_wins, 'task_losses', d_task_losses,
          'personal_wins', d_pers_wins, 'personal_losses', d_pers_losses
        ),
        'progress_bonus', v_progress_bonus,
        'avatar_bonus', v_avatar_bonus,
        'bonus_total', ROUND((
          battle_bonus + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus)) + v_progress_bonus + v_avatar_bonus
        )::numeric, 2),
        'final_grade',
          CASE
            WHEN weight_sum > 0 THEN ROUND(LEAST(10, GREATEST(0,
              weighted_nota / weight_sum
              + battle_bonus
              + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus))
              + v_progress_bonus
              + v_avatar_bonus))::numeric, 2)
            WHEN (battle_bonus
                  + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus))
                  + v_progress_bonus
                  + v_avatar_bonus) <> 0
              THEN ROUND(LEAST(10, GREATEST(0,
                battle_bonus
                + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus))
                + v_progress_bonus
                + v_avatar_bonus))::numeric, 2)
            ELSE NULL
          END
      ) ORDER BY term)
      FROM combined_calc
      WHERE total > 0 OR battle_bonus <> 0 OR (task_bonus + personal_bonus) <> 0
    ), '[]'::json),
    'current_term_data', (
      SELECT json_build_object(
        'term', term,
        'total', total,
        'completed', completed,
        'base_grade', base_grade_term,
        'battle_bonus', battle_bonus,
        'battle_score', ROUND(battle_score, 2),
        'battle_counts', json_build_object('first', c1, 'second', c2, 'third', c3),
        'duel_bonus', GREATEST(-0.5, LEAST(0.5, (task_bonus + personal_bonus)::numeric)),
        'duel_task_bonus', task_bonus,
        'duel_personal_bonus', personal_bonus,
        'duel_counts', json_build_object(
          'task_wins', d_task_wins, 'task_losses', d_task_losses,
          'personal_wins', d_pers_wins, 'personal_losses', d_pers_losses
        ),
        'progress_bonus', v_progress_bonus,
        'avatar_bonus', v_avatar_bonus,
        'final_grade',
          CASE
            WHEN weight_sum > 0 THEN ROUND(LEAST(10, GREATEST(0,
              weighted_nota / weight_sum
              + battle_bonus
              + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus))
              + v_progress_bonus
              + v_avatar_bonus))::numeric, 2)
            WHEN (battle_bonus
                  + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus))
                  + v_progress_bonus
                  + v_avatar_bonus) <> 0
              THEN ROUND(LEAST(10, GREATEST(0,
                battle_bonus
                + GREATEST(-0.5, LEAST(0.5, task_bonus + personal_bonus))
                + v_progress_bonus
                + v_avatar_bonus))::numeric, 2)
            ELSE NULL
          END
      )
      FROM combined_calc
      WHERE term = v_current_term
    ),
    'final_grade_base', (
      SELECT CASE WHEN weight_sum > 0 THEN ROUND(weighted_nota / weight_sum, 1) ELSE NULL END
      FROM total_asg
    ),
    'battle_bonus_total', (
      SELECT ROUND((0.5 * SQRT(LEAST(SUM(battle_score), 10)::numeric / 10.0))::numeric, 3)
      FROM combined_calc
    ),
    'battle_score_total', (
      SELECT ROUND(COALESCE(SUM(battle_score), 0)::numeric, 2) FROM combined_calc
    ),
    'duel_bonus_total', (
      SELECT GREATEST(-0.5, LEAST(0.5, (
        LEAST(0.5, GREATEST(0, SUM(d_task_delta))) + SUM(personal_bonus)
      )::numeric))
      FROM combined_calc
    ),
    'duel_task_bonus_total', (
      SELECT ROUND(LEAST(0.5, GREATEST(0, COALESCE(SUM(d_task_delta), 0)))::numeric, 3)
      FROM combined_calc
    ),
    'duel_personal_bonus_total', (
      SELECT ROUND(COALESCE(SUM(personal_bonus), 0)::numeric, 3) FROM combined_calc
    ),
    'duel_counts_total', (
      SELECT json_build_object(
        'task_wins',       COALESCE(SUM(d_task_wins), 0)::int,
        'task_losses',     COALESCE(SUM(d_task_losses), 0)::int,
        'personal_wins',   COALESCE(SUM(d_pers_wins), 0)::int,
        'personal_losses', COALESCE(SUM(d_pers_losses), 0)::int
      )
      FROM combined_calc
    ),
    'final_grade', (
      SELECT CASE
        WHEN t.weight_sum > 0 THEN ROUND(LEAST(10, GREATEST(0,
          t.weighted_nota / t.weight_sum
          + (0.5 * SQRT(LEAST(COALESCE((SELECT SUM(battle_score) FROM combined_calc), 0), 10)::numeric / 10.0))
          + GREATEST(-0.5, LEAST(0.5, (
              LEAST(0.5, GREATEST(0, COALESCE((SELECT SUM(d_task_delta) FROM combined_calc), 0)))
              + COALESCE((SELECT SUM(personal_bonus) FROM combined_calc), 0)
          )::numeric))
          + v_progress_bonus
          + v_avatar_bonus))::numeric, 2)
        ELSE NULL
      END
      FROM total_asg t
    ),
    'total_assignments',     (SELECT total     FROM total_asg),
    'completed_assignments', (SELECT completed FROM total_asg)
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

-- Reemplaza student_get_grade_with_duel_bonus para exponer avatar_bonus + selected_avatar
CREATE OR REPLACE FUNCTION public.student_get_grade_with_duel_bonus(p_student_id uuid, p_session_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sid             uuid;
  v_duel_bonus_raw  numeric;
  v_term            jsonb;
  v_avatar_code     text;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error', 'Sesion invalida');
  END IF;

  SELECT COALESCE(SUM(delta), 0) INTO v_duel_bonus_raw
  FROM public.duel_grade_ledger WHERE student_id = p_student_id;

  v_term := public._compute_student_term_grades(p_student_id)::jsonb;

  SELECT selected_avatar_code INTO v_avatar_code FROM public.students WHERE id = p_student_id;

  RETURN jsonb_build_object(
    'nota_base',              NULLIF((v_term->>'final_grade_base')::numeric, 0),
    'bonus',                  COALESCE((v_term->>'duel_bonus_total')::numeric, 0),
    'bonus_raw',              v_duel_bonus_raw,
    'battle_bonus',           COALESCE((v_term->>'battle_bonus_total')::numeric, 0),
    'battle_score_total',     COALESCE((v_term->>'battle_score_total')::numeric, 0),
    'progress_bonus',         COALESCE((v_term->>'progress_bonus')::numeric, 0),
    'avatar_bonus',           COALESCE((v_term->>'avatar_bonus')::numeric, 0),
    'avatar_count',           COALESCE((v_term->>'avatar_count')::int, 0),
    'selected_avatar_code',   v_avatar_code,
    'level',                  COALESCE((v_term->>'level')::int, 1),
    'current_term',           (v_term->>'current_term')::smallint,
    'current_term_data',      v_term->'current_term_data',
    'duel_task_bonus',        COALESCE((v_term->>'duel_task_bonus_total')::numeric, 0),
    'duel_personal_bonus',    COALESCE((v_term->>'duel_personal_bonus_total')::numeric, 0),
    'duel_counts',            COALESCE(v_term->'duel_counts_total', '{}'::jsonb),
    'battle_counts', (
      SELECT jsonb_build_object(
        'first',  COALESCE(SUM((t->'battle_counts'->>'first')::int),  0),
        'second', COALESCE(SUM((t->'battle_counts'->>'second')::int), 0),
        'third',  COALESCE(SUM((t->'battle_counts'->>'third')::int),  0)
      )
      FROM jsonb_array_elements(COALESCE(v_term->'terms', '[]'::jsonb)) AS t
    ),
    'nota_final',             COALESCE((v_term->>'final_grade')::numeric, NULL),
    'terms',                  COALESCE(v_term->'terms', '[]'::jsonb),
    'duel_bonus_total',       COALESCE((v_term->>'duel_bonus_total')::numeric, 0),
    'duel_bonus_total_raw',   v_duel_bonus_raw,
    'total_assignments',      COALESCE((v_term->>'total_assignments')::int, 0),
    'debts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id', duel_id, 'app_id', app_id, 'app_name', app_name,
        'level', level, 'grade', grade, 'subject_id', subject_id,
        'original_stake', original_stake, 'remaining', remaining, 'finished_at', finished_at
      ) ORDER BY finished_at ASC)
      FROM public._duel_active_debts(p_student_id)
    ), '[]'::jsonb),
    'history', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'duel_id', l.duel_id, 'delta', l.delta, 'reason', l.reason,
        'app_id', d.app_id, 'app_name', d.app_name, 'at', l.created_at
      ) ORDER BY l.created_at DESC)
      FROM (SELECT * FROM public.duel_grade_ledger WHERE student_id = p_student_id
            ORDER BY created_at DESC LIMIT 20) l
      JOIN public.duels d ON d.id = l.duel_id
    ), '[]'::jsonb)
  );
END;
$function$;

-- Reemplaza gamification_process_session para llamar avatar_check_unlocks al final
CREATE OR REPLACE FUNCTION public.gamification_process_session(p_student_id uuid, p_session_mode text, p_session_nota numeric, p_session_duration integer, p_session_app_id text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_new_avatars_arr JSONB := '[]'::jsonb;
  v_avatar_row RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = p_student_id) THEN
    RETURN json_build_object('error', 'Student not found');
  END IF;

  INSERT INTO public.student_xp (student_id, total_xp, level)
  VALUES (p_student_id, 0, 1)
  ON CONFLICT (student_id) DO NOTHING;

  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM public.student_xp WHERE student_id = p_student_id;

  SELECT COUNT(*) INTO v_today_count
  FROM public.game_sessions
  WHERE user_id = p_student_id AND user_type = 'student'
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

  INSERT INTO public.xp_log (student_id, xp_amount, source, source_id)
  VALUES (p_student_id, v_session_xp, 'session', p_session_app_id);

  FOR v_badge IN
    SELECT bd.* FROM public.badge_definitions bd
    WHERE bd.active = true
      AND NOT EXISTS (SELECT 1 FROM public.student_badges sb WHERE sb.student_id = p_student_id AND sb.badge_id = bd.id)
    ORDER BY bd.sort_order
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
      v_badge_xp := v_badge_xp + v_badge.xp_reward;
      INSERT INTO public.xp_log (student_id, xp_amount, source, source_id) VALUES (p_student_id, v_badge.xp_reward, 'badge', v_badge.code);
      v_new_badges_arr := v_new_badges_arr || jsonb_build_object(
        'code', v_badge.code, 'name_es', v_badge.name_es, 'description_es', v_badge.description_es,
        'icon', v_badge.icon, 'rarity', v_badge.rarity, 'xp_reward', v_badge.xp_reward);
    END IF;
  END LOOP;

  v_new_xp := v_old_xp + v_session_xp + v_badge_xp;
  v_new_level := calculate_level(v_new_xp);

  UPDATE public.student_xp SET total_xp = v_new_xp, level = v_new_level, updated_at = now()
  WHERE student_id = p_student_id;

  -- Comprueba avatares desbloqueados al cierre de partida (después de XP/insignias).
  FOR v_avatar_row IN
    SELECT * FROM public.avatar_check_unlocks(p_student_id, NULL)
  LOOP
    v_new_avatars_arr := v_new_avatars_arr || jsonb_build_object(
      'code', v_avatar_row.code,
      'title', v_avatar_row.title,
      'rarity', v_avatar_row.rarity,
      'points_bonus', v_avatar_row.points_bonus,
      'image_lg', v_avatar_row.image_lg,
      'unlock_label', v_avatar_row.unlock_label
    );
  END LOOP;

  RETURN json_build_object(
    'success', true, 'session_xp', v_session_xp, 'badge_xp', v_badge_xp,
    'total_xp_gained', v_session_xp + v_badge_xp,
    'old_xp', v_old_xp, 'new_xp', v_new_xp,
    'old_level', v_old_level, 'new_level', v_new_level,
    'level_up', v_new_level > v_old_level,
    'new_badges', v_new_badges_arr,
    'new_avatars', v_new_avatars_arr,
    'xp_for_current_level', xp_for_level(v_new_level),
    'xp_for_next_level', xp_for_level(v_new_level + 1),
    'xp_capped', v_xp_capped
  );
END;
$function$;
