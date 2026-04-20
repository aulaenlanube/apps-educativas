import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDuelState, reportDuelResult, voidDuel } from '@/services/duelService';
import useDuelChannel from './useDuelChannel';

// Hook compartido para apps jugadas en modo duelo. Carga el estado del
// duelo, conecta al canal, y expone helpers para reportar resultado.
// Solo el host puede reportar; el guest llama broadcasts que el host
// recoge y traduce en llamadas autoritativas.
export default function useDuel() {
  const { student } = useAuth();
  const [sp] = useSearchParams();
  const duelId = sp.get('duel');
  const [duel, setDuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const finishedRef = useRef(false);

  const load = useCallback(async () => {
    if (!duelId || !student) return;
    try {
      const s = await getDuelState({
        studentId: student.id, sessionToken: student.session_token, duelId,
      });
      setDuel(s);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [duelId, student]);

  useEffect(() => { load(); }, [load]);

  const me = useMemo(() => {
    if (!duel || !student) return null;
    const isHost = duel.challenger_id === student.id;
    return {
      id: student.id,
      name: student.display_name || student.username,
      emoji: student.avatar_emoji || '🎓',
      role: isHost ? 'host' : 'guest',
      isHost,
    };
  }, [duel, student]);

  const rival = useMemo(() => {
    if (!duel || !student) return null;
    const isHost = duel.challenger_id === student.id;
    const info = isHost ? duel.opponent : duel.challenger;
    return {
      id: isHost ? duel.opponent_id : duel.challenger_id,
      name: info?.hidden ? 'Oculto' : info?.name,
      emoji: info?.hidden ? '🕵️' : (info?.emoji || '🎓'),
      hidden: !!info?.hidden,
    };
  }, [duel, student]);

  const channel = useDuelChannel(duelId, me, !!me && !!duel);

  const reportResult = useCallback(async (winnerId, rounds = null) => {
    if (!me?.isHost || finishedRef.current) return;
    finishedRef.current = true;
    try {
      await reportDuelResult({
        studentId: student.id, sessionToken: student.session_token,
        duelId, winnerId, rounds,
      });
      channel.broadcast('duel_finished', { winner_id: winnerId });
    } catch (e) { setErr(e.message); finishedRef.current = false; }
  }, [me, duelId, student, channel]);

  const voidGame = useCallback(async (reason) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      await voidDuel({ studentId: student.id, sessionToken: student.session_token, duelId, reason });
      channel.broadcast('duel_voided', { reason });
    } catch (e) { setErr(e.message); }
  }, [duelId, student, channel]);

  return {
    duelId, duel, me, rival, loading, err,
    channel, reportResult, voidGame, reload: load,
  };
}
