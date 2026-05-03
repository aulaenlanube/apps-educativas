-- Permite duelos sin apuesta (stake=0). El alumno puede retar "amistoso"
-- y la nota no se ve afectada para ningún jugador.
--
-- Cambios:
--   * student_create_duel: amplía el whitelist de stake a {0, 0.1, 0.2, 0.3}.
--   * student_report_duel_result: si stake=0 (duelo personal amistoso), no
--     se insertan filas en duel_grade_ledger (ni para ganador ni perdedor).
--     Los duelo-tarea siguen sumando 0.10 al ganador como siempre.

CREATE OR REPLACE FUNCTION public.student_create_duel(
  p_student_id  uuid,
  p_session_token text,
  p_opponent_id uuid,
  p_app_id      text,
  p_app_name    text,
  p_level       text,
  p_grade       text,
  p_subject_id  text,
  p_stake       numeric,
  p_best_of     smallint DEFAULT 1,
  p_is_hidden   boolean  DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sid uuid; v_duel_id uuid; v_teacher_id uuid; v_group_id uuid;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN RETURN jsonb_build_object('error','Sesion invalida'); END IF;
  IF p_student_id = p_opponent_id THEN RETURN jsonb_build_object('error','No puedes retarte a ti mismo'); END IF;
  IF p_stake NOT IN (0, 0.1, 0.2, 0.3) THEN RETURN jsonb_build_object('error','Stake invalido'); END IF;

  v_group_id := public._duel_shared_group(p_student_id, p_opponent_id);
  IF v_group_id IS NULL THEN
    RETURN jsonb_build_object('error','Solo puedes retar a compañeros de tu mismo grupo');
  END IF;
  SELECT teacher_id INTO v_teacher_id FROM public.groups WHERE id = v_group_id;

  IF NOT public._duel_has_any_schedule(p_student_id, p_opponent_id) THEN
    RETURN jsonb_build_object('error','Tu profesor aun no ha configurado el horario de clase. Avisale para poder hacer duelos.');
  END IF;
  IF NOT public._duel_allowed_at(p_student_id, p_opponent_id, now()) THEN
    RETURN jsonb_build_object('error','Solo se pueden crear duelos dentro del horario de clase.');
  END IF;

  INSERT INTO public.duels (
    challenger_id, opponent_id, teacher_id, group_id, app_id, app_name,
    level, grade, subject_id, stake, best_of, is_hidden
  ) VALUES (
    p_student_id, p_opponent_id, v_teacher_id, v_group_id, p_app_id, p_app_name,
    p_level, p_grade, p_subject_id, p_stake, COALESCE(p_best_of, 1), p_is_hidden
  ) RETURNING id INTO v_duel_id;

  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data)
  VALUES ('student', p_opponent_id, 'duel_invite',
    CASE WHEN p_is_hidden THEN 'Te han retado a un duelo oculto' ELSE 'Te han retado a un duelo' END,
    p_app_name,
    jsonb_build_object('duel_id', v_duel_id, 'app_id', p_app_id, 'stake', p_stake, 'hidden', p_is_hidden));
  RETURN jsonb_build_object('duel_id', v_duel_id);
END; $function$;

GRANT EXECUTE ON FUNCTION public.student_create_duel(uuid,text,uuid,text,text,text,text,text,numeric,smallint,boolean) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- student_report_duel_result: omite el ledger en duelos personales con stake=0.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.student_report_duel_result(
  p_student_id    uuid,
  p_session_token text,
  p_duel_id       uuid,
  p_winner_id     uuid,
  p_rounds        jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sid uuid;
  v_duel public.duels%ROWTYPE;
  v_loser uuid;
  v_round jsonb;
  v_is_task boolean;
  v_winner_delta numeric;
  v_loser_delta numeric;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN
    RETURN jsonb_build_object('error','Sesion invalida');
  END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF p_student_id <> v_duel.challenger_id THEN
    RETURN jsonb_build_object('error','Solo el retador puede reportar el resultado');
  END IF;
  IF v_duel.status NOT IN ('in_progress','accepted') THEN
    RETURN jsonb_build_object('error','El duelo no esta en curso');
  END IF;

  IF p_rounds IS NOT NULL THEN
    FOR v_round IN SELECT * FROM jsonb_array_elements(p_rounds) LOOP
      INSERT INTO public.duel_rounds (duel_id, round_index, winner_id, payload)
      VALUES (p_duel_id, (v_round->>'round_index')::smallint,
              NULLIF(v_round->>'winner_id', '')::uuid, v_round->'payload')
      ON CONFLICT (duel_id, round_index) DO NOTHING;
    END LOOP;
  END IF;

  IF p_winner_id IS NULL THEN
    UPDATE public.duels SET status='void', void_reason='no_winner', finished_at=now()
    WHERE id=p_duel_id;
    RETURN jsonb_build_object('status','void');
  END IF;

  IF p_winner_id NOT IN (v_duel.challenger_id, v_duel.opponent_id) THEN
    RETURN jsonb_build_object('error','El ganador debe ser uno de los participantes');
  END IF;

  v_loser := CASE WHEN p_winner_id = v_duel.challenger_id
                  THEN v_duel.opponent_id ELSE v_duel.challenger_id END;
  v_is_task := (v_duel.assignment_pair_id IS NOT NULL);

  UPDATE public.duels
  SET status='finished', winner_id=p_winner_id, finished_at=now()
  WHERE id=p_duel_id;

  IF v_is_task THEN
    -- Duelo-tarea: solo el ganador suma 0.10. Perdedor sin entrada.
    v_winner_delta := 0.10;
    v_loser_delta  := 0;
    INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
    VALUES (p_winner_id, p_duel_id, v_winner_delta, 'win');
  ELSIF v_duel.stake = 0 THEN
    -- Duelo personal amistoso (stake=0): no se toca la nota de nadie.
    v_winner_delta := 0;
    v_loser_delta  := 0;
  ELSE
    -- Duelo personal con apuesta: ganador +stake, perdedor -stake.
    v_winner_delta := v_duel.stake;
    v_loser_delta  := -v_duel.stake;
    INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
    VALUES (p_winner_id, p_duel_id, v_winner_delta, 'win');
    INSERT INTO public.duel_grade_ledger (student_id, duel_id, delta, reason)
    VALUES (v_loser, p_duel_id, v_loser_delta, 'loss');
  END IF;

  INSERT INTO public.user_notifications (user_type, user_id, type, title, message, data) VALUES
    ('student', p_winner_id, 'duel_result',
     CASE WHEN v_is_task THEN 'Has ganado el duelo (tarea)' ELSE 'Has ganado el duelo' END,
     v_duel.app_name,
     jsonb_build_object('duel_id', p_duel_id, 'result', 'win',
                        'delta', v_winner_delta, 'is_task', v_is_task)),
    ('student', v_loser, 'duel_result',
     CASE WHEN v_is_task THEN 'Has perdido el duelo (sin penalizacion)' ELSE 'Has perdido el duelo' END,
     v_duel.app_name,
     jsonb_build_object('duel_id', p_duel_id, 'result', 'loss',
                        'delta', v_loser_delta, 'is_task', v_is_task));

  RETURN jsonb_build_object(
    'status','finished',
    'winner_id', p_winner_id,
    'loser_id', v_loser,
    'stake', v_duel.stake,
    'is_task', v_is_task,
    'winner_delta', v_winner_delta,
    'loser_delta',  v_loser_delta);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.student_report_duel_result(uuid,text,uuid,uuid,jsonb) TO anon, authenticated;

-- CHECK constraint en duels.stake: extiende el ARRAY permitido para aceptar 0.
ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_stake_check;
ALTER TABLE public.duels ADD CONSTRAINT duels_stake_check
  CHECK (stake = ANY (ARRAY[0::numeric, 0.1, 0.2, 0.3]));
