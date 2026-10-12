-- Sala de duelo: el estado del duelo indica si es un duelo-tarea (assignment_pair_id),
-- para que DuelLobby muestre "+0,10 si ganas · sin penalización si pierdes" en vez
-- de la apuesta (en los duelos-tarea el stake se ignora). Solo añade el campo is_task.

CREATE OR REPLACE FUNCTION public.student_get_duel_state(p_student_id uuid, p_session_token text, p_duel_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_sid uuid; v_duel public.duels%ROWTYPE; v_reveal boolean; v_me_is_challenger boolean;
BEGIN
  v_sid := public._resolve_student_session(p_session_token);
  IF v_sid IS NULL OR v_sid <> p_student_id THEN RETURN jsonb_build_object('error','Sesion invalida'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  v_me_is_challenger := (v_duel.challenger_type = 'student' AND v_duel.challenger_id = p_student_id);
  IF NOT v_me_is_challenger
     AND NOT (v_duel.opponent_type = 'student' AND v_duel.opponent_id = p_student_id) THEN
    RETURN jsonb_build_object('error','No eres parte del duelo');
  END IF;
  v_reveal := (NOT v_duel.is_hidden) OR v_duel.status IN ('finished','void','in_progress') OR v_me_is_challenger;
  RETURN jsonb_build_object(
    'id', v_duel.id, 'status', v_duel.status, 'app_id', v_duel.app_id, 'app_name', v_duel.app_name,
    'level', v_duel.level, 'grade', v_duel.grade, 'subject_id', v_duel.subject_id,
    'stake', v_duel.stake, 'best_of', v_duel.best_of, 'is_hidden', v_duel.is_hidden,
    'is_task', (v_duel.assignment_pair_id IS NOT NULL),
    'winner_id', v_duel.winner_id, 'winner_type', v_duel.winner_type, 'void_reason', v_duel.void_reason,
    'challenger_id', v_duel.challenger_id, 'challenger_type', v_duel.challenger_type,
    'opponent_id', v_duel.opponent_id, 'opponent_type', v_duel.opponent_type,
    'challenger', CASE WHEN v_reveal THEN public._duel_actor_info(v_duel.challenger_id, v_duel.challenger_type)
                       ELSE jsonb_build_object('id', v_duel.challenger_id, 'hidden', true) END,
    'opponent', public._duel_actor_info(v_duel.opponent_id, v_duel.opponent_type),
    'rounds', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('round_index', round_index, 'winner_id', winner_id, 'payload', payload) ORDER BY round_index)
      FROM public.duel_rounds WHERE duel_id = v_duel.id
    ), '[]'::jsonb)
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.teacher_get_duel_state(p_duel_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_tid uuid := auth.uid(); v_duel public.duels%ROWTYPE;
BEGIN
  IF v_tid IS NULL THEN RETURN jsonb_build_object('error','No autenticado'); END IF;
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','Duelo inexistente'); END IF;
  IF NOT (
       (v_duel.challenger_type = 'teacher' AND v_duel.challenger_id = v_tid)
    OR (v_duel.opponent_type   = 'teacher' AND v_duel.opponent_id   = v_tid)
  ) THEN RETURN jsonb_build_object('error','No eres parte del duelo'); END IF;
  RETURN jsonb_build_object(
    'id', v_duel.id, 'status', v_duel.status, 'app_id', v_duel.app_id, 'app_name', v_duel.app_name,
    'level', v_duel.level, 'grade', v_duel.grade, 'subject_id', v_duel.subject_id,
    'stake', v_duel.stake, 'best_of', v_duel.best_of, 'is_hidden', v_duel.is_hidden,
    'is_task', (v_duel.assignment_pair_id IS NOT NULL),
    'winner_id', v_duel.winner_id, 'winner_type', v_duel.winner_type, 'void_reason', v_duel.void_reason,
    'challenger_id', v_duel.challenger_id, 'challenger_type', v_duel.challenger_type,
    'opponent_id', v_duel.opponent_id, 'opponent_type', v_duel.opponent_type,
    'challenger', public._duel_actor_info(v_duel.challenger_id, v_duel.challenger_type),
    'opponent', public._duel_actor_info(v_duel.opponent_id, v_duel.opponent_type),
    'rounds', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('round_index', round_index, 'winner_id', winner_id, 'payload', payload) ORDER BY round_index)
      FROM public.duel_rounds WHERE duel_id = v_duel.id
    ), '[]'::jsonb)
  );
END; $function$;
