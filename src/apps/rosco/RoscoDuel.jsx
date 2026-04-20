import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoscoData } from '@/services/gameDataService';
import { useRoscoGame } from '@/hooks/useRoscoGame';
import RoscoUI from '../_shared/RoscoUI.jsx';
import useDuel from '@/hooks/useDuel';

// Rosco 1 vs 1 reutilizando la UI del modo 2 jugadores.
//   * Host-authority: el retador (player index 0) corre useRoscoGame real.
//   * El host emite snapshots del estado por el canal; el guest los recibe
//     y RoscoUI se pinta igual en ambos lados.
//   * El guest (player index 1) envía sus acciones (answer/pass) como
//     eventos al host, que las aplica via checkAnswer/pasapalabra.
//   * Al terminar (gameState === 'finished'), el host reporta el ganador.

const DEFAULT_QUESTIONS = 26;

// Snapshot del estado que el host comparte con el guest.
// Solo incluye lo estrictamente necesario para renderizar RoscoUI.
function snapshot(api) {
  return {
    gameState: api.gameState,
    players: api.players,
    activePlayerIndex: api.activePlayerIndex,
    feedback: api.feedback,
    animState: api.animState,
    config: api.config,
    showExitConfirm: api.showExitConfirm,
  };
}

function buildViewFromSnapshot(snap) {
  if (!snap) return null;
  const activePlayer = snap.players?.[snap.activePlayerIndex];
  const currentQuestion = activePlayer?.questions?.[activePlayer.currentParams.index];
  return {
    gameState: snap.gameState,
    players: snap.players,
    activePlayer,
    activePlayerIndex: snap.activePlayerIndex,
    currentQuestion,
    feedback: snap.feedback,
    animState: snap.animState,
    config: snap.config,
    showExitConfirm: snap.showExitConfirm,
    maxQuestions: snap.players?.[0]?.questions?.length || DEFAULT_QUESTIONS,
  };
}

export default function RoscoDuel({ onGameComplete }) {
  const { level, grade, subjectId } = useParams();
  const duel = useDuel();
  const { duel: duelInfo, me, rival, channel, reportResult, voidGame } = duel;

  const [rawData, setRawData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  // Siempre llamamos al hook (regla de hooks). Solo el host lo usa
  // realmente; el guest ignora su salida y usa el snapshot remoto.
  const hostApi = useRoscoGame(rawData);
  const hostApiRef = useRef(hostApi);
  hostApiRef.current = hostApi;

  const [remoteSnap, setRemoteSnap] = useState(null);
  const reportedRef = useRef(false);
  const startedRef = useRef(false);

  // === Cargar datos del rosco ===
  useEffect(() => {
    if (!duelInfo) return;
    const lvl = duelInfo.level || level;
    const gr = duelInfo.grade || grade;
    const sj = duelInfo.subject_id || subjectId || 'lengua';
    setLoadingData(true); setLoadErr(null);
    getRoscoData(lvl, gr, sj)
      .then(d => setRawData(d || []))
      .catch(e => setLoadErr(e.message))
      .finally(() => setLoadingData(false));
  }, [duelInfo, level, grade, subjectId]);

  // === HOST: arranca la partida automaticamente cuando tiene los datos ===
  useEffect(() => {
    if (!me?.isHost || !rawData || rawData.length === 0) return;
    if (startedRef.current) return;
    if (hostApi.gameState !== 'config') return;
    startedRef.current = true;
    hostApi.startGame({
      numPlayers: 2,
      questionCount: DEFAULT_QUESTIONS,
      useTimer: false,
      timeLimit: 150,
      player1: { name: me.name, icon: me.emoji },
      player2: { name: rival.name, icon: rival.emoji },
    });
  }, [me?.isHost, rawData, hostApi.gameState, me?.name, me?.emoji, rival?.name, rival?.emoji, hostApi]);

  // === HOST: difunde snapshot en cada cambio de estado ===
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    if (hostApi.gameState === 'config') return;
    channel.broadcast('rosco_state', snapshot(hostApi));
  }, [
    me?.isHost, channel?.isConnected,
    hostApi.gameState, hostApi.players, hostApi.activePlayerIndex,
    hostApi.feedback, hostApi.animState, hostApi.showExitConfirm,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // === HOST: escucha acciones del guest + peticiones de estado ===
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      const api = hostApiRef.current;
      if (api.gameState !== 'config') channel.broadcast('rosco_state', snapshot(api));
    });
    channel.onBroadcast('rosco_action', (action) => {
      const api = hostApiRef.current;
      // Solo aceptar si es el turno del guest (index 1)
      if (api.activePlayerIndex !== 1) return;
      if (action?.type === 'answer') api.checkAnswer(String(action.text || ''));
      else if (action?.type === 'pass') api.pasapalabra();
    });
    channel.onBroadcast('duel_exit_requested', () => {
      // Guest quiere salir → confirmamos como anulado
      voidGame('guest_aborted');
    });
  }, [me?.isHost, channel?.isConnected, voidGame]); // eslint-disable-line react-hooks/exhaustive-deps

  // === GUEST: escucha estado + pide estado inicial ===
  useEffect(() => {
    if (me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('rosco_state', (snap) => setRemoteSnap(snap));
    channel.onBroadcast('duel_voided', () => { /* lobby gestiona */ });
    channel.broadcast('request_state', { from: me?.id });
  }, [me?.isHost, channel?.isConnected, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === HOST: al terminar, reportar ganador ===
  useEffect(() => {
    if (!me?.isHost || hostApi.gameState !== 'finished' || reportedRef.current) return;
    reportedRef.current = true;
    const byScore = [...hostApi.players].sort((a, b) => b.score - a.score);
    const top = byScore[0];
    const second = byScore[1];
    let winnerId;
    if (top && second && top.score === second.score) winnerId = null; // empate
    else winnerId = top?.id === 0 ? me.id : rival.id;
    if (winnerId) reportResult(winnerId);
    else voidGame('tie');
  }, [me?.isHost, hostApi.gameState, hostApi.players, me?.id, rival?.id, reportResult, voidGame]);

  // === Construir API que se pasa a RoscoUI ===
  // Host: wrappers que solo permiten actuar cuando es TU turno (index 0).
  // Guest: acciones van al host por canal (solo si activeIndex === 1).
  const api = useMemo(() => {
    const myIdx = me?.isHost ? 0 : 1;

    if (me?.isHost) {
      return {
        ...hostApi,
        checkAnswer: (text) => {
          if (hostApi.activePlayerIndex !== myIdx) return;
          hostApi.checkAnswer(text);
        },
        pasapalabra: () => {
          if (hostApi.activePlayerIndex !== myIdx) return;
          hostApi.pasapalabra();
        },
        // En duelo no hay "reiniciar" — al terminar se vuelve al lobby/panel.
        restartGame: () => voidGame('host_aborted'),
        // Exit → anular duelo
        requestExit: () => hostApi.requestExit(),
        cancelExit: () => hostApi.cancelExit(),
        confirmExit: () => { hostApi.confirmExit(); voidGame('host_aborted'); },
      };
    }

    const view = buildViewFromSnapshot(remoteSnap);
    if (!view) return null;
    return {
      ...view,
      checkAnswer: (text) => {
        if (view.activePlayerIndex !== myIdx) return;
        channel.broadcast('rosco_action', { type: 'answer', text });
      },
      pasapalabra: () => {
        if (view.activePlayerIndex !== myIdx) return;
        channel.broadcast('rosco_action', { type: 'pass' });
      },
      restartGame: () => {},
      startGame: () => {},
      setConfig: () => {},
      requestExit: () => { channel.broadcast('duel_exit_requested', {}); },
      cancelExit: () => {},
      confirmExit: () => {},
    };
  }, [me?.isHost, hostApi, remoteSnap, channel, voidGame]);

  if (loadErr) {
    return (
      <div className="p-8 text-center text-rose-600">
        <p className="font-bold">No se pudo cargar el Rosco</p>
        <p className="text-sm text-slate-500">{loadErr}</p>
      </div>
    );
  }
  if (loadingData || !api || api.gameState === 'config') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  return <RoscoUI {...api} onGameComplete={onGameComplete} />;
}
