-- Reduce el peso de la base de tareas en la nota final al 90%.
--
-- Antes: final_grade = clamp(base + bonus_batallas + bonus_duelos + bonus_nivel + bonus_avatares, 0, 10)
-- Ahora: final_grade = clamp(base * 0.9 + bonus_batallas + bonus_duelos + bonus_nivel + bonus_avatares, 0, 10)
--
-- Razón: con base 10 y los 4 bonuses al máximo (~+2 puntos) muchos alumnos
-- saturaban el cap a 10 sin esfuerzo. Con el factor 0.9, sacar 10 exige
-- buena nota Y bonuses, manteniendo el incentivo de la gamificación pero
-- evitando que los bonuses anulen la diferenciación en el rango alto.
--
-- La "nota de tareas" (base_grade / base_grade_term) se sigue mostrando en
-- la UI sobre 10 — es solo el peso al combinarse con los bonuses lo que
-- cambia.

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
  v_reset_at       timestamptz;
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

  SELECT progress_reset_at INTO v_reset_at
  FROM public.student_groups
  WHERE student_id = p_student_id AND group_id = v_group_id;

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
      FROM public.game_sessions gs
      WHERE gs.user_id = p_student_id AND gs.user_type = 'student'
        AND gs.app_id = asg.app_id
        AND public.session_counts_for_task(asg.app_id, gs.mode)
        AND gs.created_at >= asg.created_at
        AND (v_reset_at IS NULL OR gs.created_at > v_reset_at)
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
      AND (v_reset_at IS NULL OR qbs.created_at > v_reset_at)
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
      AND d.group_id = v_group_id
      AND (v_reset_at IS NULL OR l.created_at > v_reset_at)
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
    'progress_reset_at', v_reset_at,
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
              (weighted_nota / weight_sum) * 0.9
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
              (weighted_nota / weight_sum) * 0.9
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
          (t.weighted_nota / t.weight_sum) * 0.9
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
