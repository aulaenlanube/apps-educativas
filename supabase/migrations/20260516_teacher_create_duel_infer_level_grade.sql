-- Hace que teacher_create_duel infiera level/grade/subject_id del grupo
-- del alumno cuando el frontend los pase como vacíos/NULL. Esto evita
-- que la URL del lobby (`/curso/:level/:grade/:subjectId/app/:appId`)
-- quede mal formada.

CREATE OR REPLACE FUNCTION public.teacher_create_duel(
  p_opponent_id uuid,
  p_app_id text, p_app_name text, p_level text, p_grade text, p_subject_id text,
  p_best_of smallint DEFAULT 1
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tid uuid := auth.uid();
  v_duel_id uuid;
  v_group_id uuid;
  v_glevel text; v_ggrade text; v_gsubject text;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;

  SELECT sg.group_id, g.level::text, g.grade::text, g.subject_id
    INTO v_group_id, v_glevel, v_ggrade, v_gsubject
  FROM public.student_groups sg
  JOIN public.groups g ON g.id = sg.group_id
  WHERE sg.student_id = p_opponent_id
    AND (g.teacher_id = v_tid
         OR EXISTS (SELECT 1 FROM public.group_co_teachers ct
                    WHERE ct.group_id = g.id AND ct.teacher_id = v_tid))
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN jsonb_build_object('error','Solo puedes retar a alumnos de tus grupos');
  END IF;

  INSERT INTO public.duels (
    challenger_id, challenger_type, opponent_id, opponent_type,
    teacher_id, group_id, app_id, app_name,
    level, grade, subject_id, stake, best_of, is_hidden
  ) VALUES (
    v_tid, 'teacher', p_opponent_id, 'student',
    v_tid, v_group_id, p_app_id, p_app_name,
    COALESCE(NULLIF(p_level, ''), v_glevel),
    COALESCE(NULLIF(p_grade, ''), v_ggrade),
    COALESCE(NULLIF(p_subject_id, ''), v_gsubject),
    0, COALESCE(p_best_of, 1), false
  ) RETURNING id INTO v_duel_id;

  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES ('student', p_opponent_id, 'duel_invite',
    'Tu profesor te ha retado a un duelo amistoso',
    p_app_name,
    jsonb_build_object('duel_id', v_duel_id, 'app_id', p_app_id, 'stake', 0,
                       'hidden', false, 'from_teacher', true));
  RETURN jsonb_build_object('duel_id', v_duel_id);
END; $$;
GRANT EXECUTE ON FUNCTION public.teacher_create_duel(uuid,text,text,text,text,text,smallint) TO authenticated;
