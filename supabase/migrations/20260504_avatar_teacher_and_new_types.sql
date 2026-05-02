-- =====================================================
-- AVATAR SYSTEM — paso 7: avatares para docentes + nuevos
-- check_types (apps_rated, feedback_messages)
-- =====================================================
-- 1) Amplía _avatar_progress con dos nuevos tipos:
--    - apps_rated         → COUNT(DISTINCT app_id) en app_ratings del alumno
--    - feedback_messages  → COUNT(*) de mensajes enviados por el alumno
-- 2) Crea _teacher_avatar_progress y _teacher_avatar_bonus
-- 3) Crea RPCs públicas para docentes equivalentes a las del alumno:
--    - teacher_avatar_get_my_collection()
--    - teacher_avatar_select(p_code)
--    - teacher_avatar_check_unlocks()
-- 4) Sincroniza avatar_definitions con los 8 avatares modificados.
-- =====================================================

-- 1) Ampliación de _avatar_progress (alumno)
CREATE OR REPLACE FUNCTION public._avatar_progress(
  p_student_id uuid,
  p_requirement jsonb
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text := p_requirement->>'type';
  v_target int := COALESCE(NULLIF(p_requirement->>'count','')::int, 1);
  v_progress int := 0;
  v_app_id text := p_requirement->>'app_id';
  v_mode text := p_requirement->>'mode';
  v_min_nota numeric := COALESCE((p_requirement->>'min_nota')::numeric, 0);
  v_subject_id text := p_requirement->>'subject_id';
  v_position int;
BEGIN
  IF p_requirement IS NULL OR p_requirement = '{}'::jsonb THEN
    RETURN jsonb_build_object('progress', 0, 'target', 1, 'pct', 0);
  END IF;

  CASE v_type
    WHEN 'first_session' THEN
      v_target := 1;
      SELECT LEAST(1, COUNT(*)) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true;

    WHEN 'total_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'unique_apps' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode);

    WHEN 'app_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND app_id = v_app_id
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'subject_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND subject_id = v_subject_id
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'perfect_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;

    WHEN 'high_score_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='student' AND user_id=p_student_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'badges_count' THEN
      SELECT COUNT(*) INTO v_progress
      FROM student_badges WHERE student_id = p_student_id;

    WHEN 'level' THEN
      v_target := COALESCE((p_requirement->>'value')::int, 1);
      SELECT COALESCE(level, 1) INTO v_progress
      FROM student_xp WHERE student_id = p_student_id;

    WHEN 'xp' THEN
      v_target := COALESCE((p_requirement->>'amount')::int, 1);
      SELECT COALESCE(total_xp, 0) INTO v_progress
      FROM student_xp WHERE student_id = p_student_id;

    WHEN 'duels_won' THEN
      SELECT COUNT(*) INTO v_progress
      FROM duels
      WHERE winner_id = p_student_id AND status = 'finished';

    WHEN 'battles_won' THEN
      v_position := COALESCE((p_requirement->>'position')::int, 1);
      SELECT COUNT(*) INTO v_progress
      FROM quiz_battle_sessions
      WHERE user_type='student' AND user_id = p_student_id
        AND COALESCE(rank, 99) <= v_position
        AND COALESCE(player_count, 0) >= 2;

    WHEN 'top_class' THEN
      v_target := 1;
      v_position := COALESCE((p_requirement->>'position')::int, 3);
      SELECT CASE WHEN COALESCE(MIN(class_rank), 99) <= v_position THEN 1 ELSE 0 END
      INTO v_progress
      FROM user_ranking_achievements
      WHERE user_type='student' AND user_id = p_student_id AND class_rank IS NOT NULL;
      v_progress := COALESCE(v_progress, 0);

    WHEN 'top_global' THEN
      v_target := 1;
      v_position := COALESCE((p_requirement->>'position')::int, 1);
      SELECT CASE WHEN COALESCE(MIN(global_rank), 99) <= v_position THEN 1 ELSE 0 END
      INTO v_progress
      FROM user_ranking_achievements
      WHERE user_type='student' AND user_id = p_student_id AND global_rank IS NOT NULL;
      v_progress := COALESCE(v_progress, 0);

    WHEN 'streak_days' THEN
      WITH daily AS (
        SELECT DISTINCT DATE(created_at) AS play_date
        FROM game_sessions
        WHERE user_type='student' AND user_id = p_student_id AND completed=true
      ),
      grouped AS (
        SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp
        FROM daily
      )
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (SELECT COUNT(*) AS c FROM grouped GROUP BY grp) s;

    WHEN 'apps_rated' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM app_ratings
      WHERE user_type = 'student' AND user_id = p_student_id;

    WHEN 'feedback_messages' THEN
      SELECT COUNT(*) INTO v_progress
      FROM app_feedback_messages
      WHERE sender_type = 'student' AND sender_id = p_student_id;

    ELSE
      v_target := 1;
      v_progress := 0;
  END CASE;

  v_progress := COALESCE(v_progress, 0);
  IF v_target IS NULL OR v_target < 1 THEN v_target := 1; END IF;

  RETURN jsonb_build_object(
    'progress', LEAST(v_progress, v_target),
    'target', v_target,
    'pct', ROUND(LEAST(100, (v_progress::numeric / v_target * 100))::numeric)::int
  );
END;
$$;

-- 2) Helper de progreso para docentes
CREATE OR REPLACE FUNCTION public._teacher_avatar_progress(
  p_teacher_id uuid,
  p_requirement jsonb
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text := p_requirement->>'type';
  v_target int := COALESCE(NULLIF(p_requirement->>'count','')::int, 1);
  v_progress int := 0;
  v_app_id text := p_requirement->>'app_id';
  v_mode text := p_requirement->>'mode';
  v_min_nota numeric := COALESCE((p_requirement->>'min_nota')::numeric, 0);
  v_subject_id text := p_requirement->>'subject_id';
  v_position int;
BEGIN
  IF p_requirement IS NULL OR p_requirement = '{}'::jsonb THEN
    RETURN jsonb_build_object('progress', 0, 'target', 1, 'pct', 0);
  END IF;

  CASE v_type
    WHEN 'first_session' THEN
      v_target := 1;
      SELECT LEAST(1, COUNT(*)) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true;

    WHEN 'total_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'unique_apps' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND (v_mode IS NULL OR mode = v_mode);

    WHEN 'app_sessions' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND app_id = v_app_id
        AND (v_mode IS NULL OR mode = v_mode)
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'subject_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND subject_id = v_subject_id
        AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'perfect_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= 9.95;

    WHEN 'high_score_exams' THEN
      SELECT COUNT(*) INTO v_progress
      FROM game_sessions
      WHERE user_type='teacher' AND user_id=p_teacher_id AND completed=true
        AND mode='test' AND COALESCE(nota, 0) >= v_min_nota;

    WHEN 'badges_count' THEN
      SELECT COUNT(*) INTO v_progress
      FROM teacher_badges WHERE teacher_id = p_teacher_id;

    WHEN 'level' THEN
      v_target := COALESCE((p_requirement->>'value')::int, 1);
      SELECT COALESCE(level, 1) INTO v_progress
      FROM teacher_xp WHERE teacher_id = p_teacher_id;

    WHEN 'xp' THEN
      v_target := COALESCE((p_requirement->>'amount')::int, 1);
      SELECT COALESCE(total_xp, 0) INTO v_progress
      FROM teacher_xp WHERE teacher_id = p_teacher_id;

    WHEN 'battles_won' THEN
      v_position := COALESCE((p_requirement->>'position')::int, 1);
      SELECT COUNT(*) INTO v_progress
      FROM quiz_battle_sessions
      WHERE user_type='teacher' AND user_id = p_teacher_id
        AND COALESCE(rank, 99) <= v_position
        AND COALESCE(player_count, 0) >= 2;

    WHEN 'streak_days' THEN
      WITH daily AS (
        SELECT DISTINCT DATE(created_at) AS play_date
        FROM game_sessions
        WHERE user_type='teacher' AND user_id = p_teacher_id AND completed=true
      ),
      grouped AS (
        SELECT play_date, play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::int AS grp
        FROM daily
      )
      SELECT COALESCE(MAX(c), 0) INTO v_progress
      FROM (SELECT COUNT(*) AS c FROM grouped GROUP BY grp) s;

    WHEN 'apps_rated' THEN
      SELECT COUNT(DISTINCT app_id) INTO v_progress
      FROM app_ratings
      WHERE user_type = 'teacher' AND user_id = p_teacher_id;

    WHEN 'feedback_messages' THEN
      SELECT COUNT(*) INTO v_progress
      FROM app_feedback_messages
      WHERE sender_type = 'teacher' AND sender_id = p_teacher_id;

    -- duels_won, top_class, top_global no aplican a docentes → progress 0
    ELSE
      v_target := 1;
      v_progress := 0;
  END CASE;

  v_progress := COALESCE(v_progress, 0);
  IF v_target IS NULL OR v_target < 1 THEN v_target := 1; END IF;

  RETURN jsonb_build_object(
    'progress', LEAST(v_progress, v_target),
    'target', v_target,
    'pct', ROUND(LEAST(100, (v_progress::numeric / v_target * 100))::numeric)::int
  );
END;
$$;

-- 3) RPC: catálogo + estado de la colección del docente
CREATE OR REPLACE FUNCTION public.teacher_avatar_get_my_collection()
RETURNS TABLE (
  code text,
  title text,
  description text,
  rarity text,
  points_bonus numeric,
  image_lg text,
  image_md text,
  image_sm text,
  unlock_label text,
  unlock_requirement jsonb,
  owned boolean,
  earned_at timestamptz,
  selected boolean,
  progress int,
  target int,
  pct int,
  sort_order int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_selected text;
BEGIN
  IF v_tid IS NULL THEN
    RETURN;
  END IF;

  SELECT t.selected_avatar_code INTO v_selected FROM teachers t WHERE t.id = v_tid;

  RETURN QUERY
  SELECT
    a.code, a.title, a.description, a.rarity, a.points_bonus,
    a.image_lg, a.image_md, a.image_sm,
    a.unlock_label, a.unlock_requirement,
    ta.id IS NOT NULL AS owned,
    ta.earned_at,
    a.code = v_selected AS selected,
    (p.j->>'progress')::int AS progress,
    (p.j->>'target')::int AS target,
    (p.j->>'pct')::int AS pct,
    a.sort_order
  FROM avatar_definitions a
  LEFT JOIN teacher_avatars ta
    ON ta.teacher_id = v_tid AND ta.avatar_id = a.id
  CROSS JOIN LATERAL (
    SELECT public._teacher_avatar_progress(v_tid, a.unlock_requirement) AS j
  ) p
  WHERE a.active = true
  ORDER BY a.sort_order, a.code;
END;
$$;
GRANT EXECUTE ON FUNCTION public.teacher_avatar_get_my_collection() TO authenticated;

-- RPC: equipa avatar (debe ser propiedad del docente o NULL = revertir a emoji)
CREATE OR REPLACE FUNCTION public.teacher_avatar_select(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_avatar_id uuid;
BEGIN
  IF v_tid IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthenticated');
  END IF;

  IF p_code IS NULL THEN
    UPDATE teachers SET selected_avatar_code = NULL WHERE id = v_tid;
    RETURN jsonb_build_object('ok', true, 'selected', NULL);
  END IF;

  SELECT a.id INTO v_avatar_id
  FROM avatar_definitions a
  WHERE a.code = p_code AND a.active = true;

  IF v_avatar_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Avatar no encontrado');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM teacher_avatars
    WHERE teacher_id = v_tid AND avatar_id = v_avatar_id
  ) THEN
    RETURN jsonb_build_object('error', 'Avatar bloqueado');
  END IF;

  UPDATE teachers SET selected_avatar_code = p_code WHERE id = v_tid;
  RETURN jsonb_build_object('ok', true, 'selected', p_code);
END;
$$;
GRANT EXECUTE ON FUNCTION public.teacher_avatar_select(text) TO authenticated;

-- RPC: comprueba todos los avatares y otorga los nuevos al docente
CREATE OR REPLACE FUNCTION public.teacher_avatar_check_unlocks()
RETURNS TABLE (
  code text,
  title text,
  rarity text,
  points_bonus numeric,
  image_lg text,
  unlock_label text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_def RECORD;
  v_progress jsonb;
  v_inserted_id uuid;
BEGIN
  IF v_tid IS NULL THEN
    RETURN;
  END IF;

  FOR v_def IN
    SELECT a.id, a.code, a.title, a.rarity, a.points_bonus, a.image_lg,
           a.unlock_label, a.unlock_requirement
    FROM avatar_definitions a
    WHERE a.active = true
      AND NOT EXISTS (
        SELECT 1 FROM teacher_avatars ta
        WHERE ta.teacher_id = v_tid AND ta.avatar_id = a.id
      )
  LOOP
    v_progress := public._teacher_avatar_progress(v_tid, v_def.unlock_requirement);
    IF (v_progress->>'progress')::int >= (v_progress->>'target')::int THEN
      INSERT INTO teacher_avatars (teacher_id, avatar_id)
      VALUES (v_tid, v_def.id)
      ON CONFLICT DO NOTHING
      RETURNING id INTO v_inserted_id;

      IF v_inserted_id IS NOT NULL THEN
        code := v_def.code;
        title := v_def.title;
        rarity := v_def.rarity;
        points_bonus := v_def.points_bonus;
        image_lg := v_def.image_lg;
        unlock_label := v_def.unlock_label;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION public.teacher_avatar_check_unlocks() TO authenticated;

-- 4) Sincronizar avatar_definitions con los nuevos requisitos (8 avatares)
UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'apps_rated', 'count', 1),
  unlock_label = 'Valora 1 app'
WHERE code = 'avatar_077';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'apps_rated', 'count', 10),
  unlock_label = 'Valora 10 apps distintas'
WHERE code = 'avatar_093';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'apps_rated', 'count', 50),
  unlock_label = 'Valora 50 apps distintas'
WHERE code = 'avatar_001';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'apps_rated', 'count', 100),
  unlock_label = 'Valora 100 apps distintas'
WHERE code = 'avatar_065';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'feedback_messages', 'count', 1),
  unlock_label = 'Publica tu primer comentario de valoración'
WHERE code = 'avatar_057';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'feedback_messages', 'count', 10),
  unlock_label = 'Publica 10 comentarios de valoración'
WHERE code = 'avatar_017';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'feedback_messages', 'count', 50),
  unlock_label = 'Publica 50 comentarios de valoración'
WHERE code = 'avatar_021';

UPDATE public.avatar_definitions SET
  unlock_requirement = jsonb_build_object('type', 'feedback_messages', 'count', 100),
  unlock_label = 'Publica 100 comentarios de valoración'
WHERE code = 'avatar_044';
