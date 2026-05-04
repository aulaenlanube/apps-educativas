import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getDuelState, reportDuelResult, voidDuel,
  teacherGetDuelState, teacherReportDuelResult, teacherVoidDuel,
} from '@/services/duelService';
import useDuelActor from './useDuelActor';
import useDuelChannel from './useDuelChannel';

// Hook compartido para apps jugadas en modo duelo. Carga el estado del
// duelo, conecta al canal Realtime y expone helpers para reportar el
// resultado. Solo el host (challenger) puede reportar; el guest envía
// broadcasts que el host recoge y traduce en llamadas autoritativas.
//
// Funciona tanto si el participante actual es alumno como si es docente
// (los duelos profesor → alumno son siempre amistosos, stake=0).
export default function useDuel() {
  const actor = useDuelActor();
  const [sp] = useSearchParams();
  const duelId = sp.get('duel');
  const [duel, setDuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const finishedRef = useRef(false);

  const load = useCallback(async () => {
    if (!duelId || !actor) return;
    try {
      const s = actor.type === 'teacher'
        ? await teacherGetDuelState({ duelId })
        : await getDuelState({
            studentId: actor.id,
            sessionToken: actor.sessionToken,
            duelId,
          });
      setDuel(s);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [duelId, actor]);

  useEffect(() => { load(); }, [load]);

  const me = useMemo(() => {
    if (!duel || !actor) return null;
    const isHost = duel.challenger_id === actor.id && duel.challenger_type === actor.type;
    return {
      id: actor.id,
      type: actor.type,
      name: actor.name,
      emoji: actor.emoji,
      color: actor.color,
      selectedAvatarCode: actor.selectedAvatarCode,
      role: isHost ? 'host' : 'guest',
      isHost,
    };
  }, [duel, actor]);

  const rival = useMemo(() => {
    if (!duel || !actor) return null;
    const isHost = duel.challenger_id === actor.id && duel.challenger_type === actor.type;
    const info = isHost ? duel.opponent : duel.challenger;
    const hidden = !!info?.hidden;
    return {
      id: isHost ? duel.opponent_id : duel.challenger_id,
      type: isHost ? duel.opponent_type : duel.challenger_type,
      name: hidden ? 'Oculto' : info?.name,
      emoji: hidden ? '🕵️' : (info?.emoji || '🎓'),
      color: hidden ? null : info?.color,
      selectedAvatarCode: hidden ? null : info?.selected_avatar_code,
      hidden,
      isTeacher: !hidden && (info?.is_teacher === true || (isHost ? duel.opponent_type : duel.challenger_type) === 'teacher'),
    };
  }, [duel, actor]);

  const channel = useDuelChannel(duelId, me, !!me && !!duel);

  const reportResult = useCallback(async (winnerId, rounds = null) => {
    if (!me?.isHost || finishedRef.current) return;
    finishedRef.current = true;
    try {
      const isWinnerChallenger = winnerId === duel.challenger_id;
      const winnerType = isWinnerChallenger ? duel.challenger_type : duel.opponent_type;

      if (actor.type === 'teacher') {
        await teacherReportDuelResult({ duelId, winnerId, winnerType, rounds });
      } else {
        await reportDuelResult({
          studentId: actor.id, sessionToken: actor.sessionToken,
          duelId, winnerId, rounds,
        });
      }
      channel.broadcast('duel_finished', { winner_id: winnerId });
    } catch (e) { setErr(e.message); finishedRef.current = false; }
  }, [me, duel, duelId, actor, channel]);

  const voidGame = useCallback(async (reason) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      if (actor?.type === 'teacher') {
        await teacherVoidDuel({ duelId, reason });
      } else if (actor) {
        await voidDuel({
          studentId: actor.id, sessionToken: actor.sessionToken,
          duelId, reason,
        });
      }
      channel.broadcast('duel_voided', { reason });
    } catch (e) { setErr(e.message); }
  }, [actor, duelId, channel]);

  return {
    duelId, duel, me, rival, loading, err,
    channel, reportResult, voidGame, reload: load,
  };
}
