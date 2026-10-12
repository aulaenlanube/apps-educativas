// src/apps/ahorcado/AhorcadoDuel.jsx
// Duelo 1 vs 1 de Ahorcado. Rediseño 2026 con el kit de interfaz de juego
// (_shared/kit): escenario, marcador de los dos jugadores con su horca, palabra
// en pantalla nocturna, teclado del kit y avisos de ronda. La lógica del duelo
// (useDuel, mensajes del canal, turnos, puntuación y reporte) no cambia.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Trophy, LogOut, Lightbulb, Send, Hourglass, Crown } from 'lucide-react';
import { getRoscoData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';
import DuelChatBar from '@/components/duel/DuelChatBar';
import UserAvatar from '@/components/ui/UserAvatar';
import useArtIds from '@/components/art/useArtIds';
import {
  GameShell, GameHeader, Chip, Panel, KeyTile, GameButton, Lives, RoundBanner,
  GameLoading, GameEmpty,
} from '../_shared/kit';
import './AhorcadoDuel.css';

const LIVES = 6;
const TARGET_WINS = 3;
const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

function normWord(s) {
  return (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buildRound(pool, firstTurn) {
  const q = pool[Math.floor(Math.random() * pool.length)];
  const answer = normWord(q.solucion);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    answer,
    hint: q.definicion,
    letter: (q.letra || '').toUpperCase(),
    revealed: answer.split('').map(ch => /[A-ZÑ]/.test(ch) ? null : ch),
    hostLives: LIVES,
    guestLives: LIVES,
    usedLetters: [],
    turn: firstTurn,          // 'host' | 'guest' — turno estricto
    firstTurn,                // Quien abrio esta ronda (para recuperar rotacion en rejoin)
    roundWinner: undefined,   // undefined = aun jugando, null = empate, uuid = ganador
  };
}

// Escena del ahorcado de cada jugador: horca de madera sobre una colina y un
// muñeco que aparece pieza a pieza (mismo estilo que la versión en solitario).
// La camiseta lleva el color del jugador. Sin filtros SVG.
function HangmanSvg({ fails, tint = '#8b5cf6' }) {
  const [id, url] = useArtIds();
  const lost = fails >= LIVES;
  const parts = [
    // cabeza
    <g key="head">
      <circle cx="96" cy="62" r="15" fill={url('skin')} />
      <circle cx="96" cy="62" r="15" fill="none" stroke="#b45309" strokeOpacity=".35" strokeWidth="1.5" />
      <ellipse cx="91" cy="56" rx="5" ry="3.4" fill="#fff" opacity=".55" />
      {lost ? (
        <g stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round">
          <path d="M88 58 l5 5 M93 58 l-5 5 M99 58 l5 5 M104 58 l-5 5" />
          <path d="M90 70 q6 -4 12 0" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx="90.5" cy="61" r="2.3" fill="#1e1b4b" />
          <circle cx="101.5" cy="61" r="2.3" fill="#1e1b4b" />
          <circle cx="91.3" cy="60.2" r=".8" fill="#fff" />
          <circle cx="102.3" cy="60.2" r=".8" fill="#fff" />
          <path d={fails >= 4 ? 'M90 70 q6 -4 12 0' : 'M90 68 q6 4 12 0'} stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <ellipse cx="86" cy="67" rx="3" ry="1.8" fill="#fb7185" opacity=".5" />
          <ellipse cx="106" cy="67" rx="3" ry="1.8" fill="#fb7185" opacity=".5" />
        </g>
      )}
    </g>,
    // cuerpo (camiseta del color del jugador)
    <path key="torso" d="M83 82 q13 -6 26 0 l3 30 q-16 6 -32 0 Z" fill={url('shirt')} />,
    <path key="armL" d="M85 86 q-12 8 -16 22" stroke={url('shirt')} strokeWidth="8" strokeLinecap="round" fill="none" />,
    <path key="armR" d="M107 86 q12 8 16 22" stroke={url('shirt')} strokeWidth="8" strokeLinecap="round" fill="none" />,
    <path key="legL" d="M89 111 l-6 26" stroke="#3730a3" strokeWidth="8.5" strokeLinecap="round" />,
    <path key="legR" d="M103 111 l6 26" stroke="#3730a3" strokeWidth="8.5" strokeLinecap="round" />,
  ];
  return (
    <svg viewBox="0 0 160 170" className="ahd-art" aria-label={`Ahorcado: ${fails} fallos de ${LIVES}`}>
      <defs>
        <linearGradient id={id('wood')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b45309" />
          <stop offset=".45" stopColor="#d97706" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={id('wood-h')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={id('hill')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lost ? '#fda4af' : '#86efac'} />
          <stop offset="1" stopColor={lost ? '#e11d48' : '#16a34a'} />
        </linearGradient>
        <radialGradient id={id('skin')} cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#fde7c8" />
          <stop offset=".7" stopColor="#f6c08f" />
          <stop offset="1" stopColor="#e8a46a" />
        </radialGradient>
        <linearGradient id={id('shirt')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tint} stopOpacity=".75" />
          <stop offset="1" stopColor={tint} />
        </linearGradient>
        <radialGradient id={id('sun')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={lost ? '#fecaca' : '#e0e7ff'} />
          <stop offset="1" stopColor={lost ? '#fecaca' : '#e0e7ff'} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="122" cy="40" r="34" fill={url('sun')} />
      <path d="M0 152 Q50 132 100 146 T160 140 V170 H0 Z" fill={url('hill')} />
      <path d="M0 152 Q50 132 100 146 T160 140" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" />
      {/* horca */}
      <rect x="14" y="146" width="76" height="9" rx="4" fill={url('wood-h')} />
      <rect x="30" y="18" width="10" height="132" rx="3" fill={url('wood')} />
      <rect x="31.5" y="22" width="2.4" height="124" rx="1.2" fill="#fde68a" opacity=".5" />
      <rect x="28" y="14" width="78" height="10" rx="4" fill={url('wood-h')} />
      <path d="M40 38 L58 24" stroke={url('wood')} strokeWidth="6" strokeLinecap="round" />
      <path d="M96 24 v22" stroke="#a16207" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 2" />
      {parts.slice(0, fails).map((el, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {el}
        </motion.g>
      ))}
    </svg>
  );
}

export default function AhorcadoDuel({ onGameComplete, registerDuelExit }) {
  const { level, grade, subjectId } = useParams();
  const navigate = useNavigate();
  const duel = useDuel();
  const { duel: duelInfo, me, rival, channel, reportResult } = duel;

  const [pool, setPool] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [round, setRound] = useState(null);
  const [score, setScore] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(null);
  const [finished, setFinished] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [guess, setGuess] = useState('');
  const reportedRef = useRef(false);
  const lastSettledRef = useRef(null);
  const nextFirstTurnRef = useRef('host');
  const recoveryAttemptedRef = useRef(false);
  const recoveryTimerRef = useRef(null);

  // Refs para que los handlers registrados una sola vez accedan siempre a
  // los valores actuales (evita cerrar sobre estado obsoleto).
  const roundRef = useRef(round);  roundRef.current = round;
  const scoreRef = useRef(score);  scoreRef.current = score;
  const hintsRef = useRef(hintsUsed); hintsRef.current = hintsUsed;
  const chanRef  = useRef(channel); chanRef.current = channel;

  // Cargar pool
  useEffect(() => {
    if (!duelInfo) return;
    const lvl = duelInfo.level || level;
    const gr = duelInfo.grade || grade;
    const sj = duelInfo.subject_id || subjectId || 'lengua';
    setLoadingData(true);
    getRoscoData(lvl, gr, sj)
      .then(d => setPool(d || []))
      .catch(() => setPool([]))
      .finally(() => setLoadingData(false));
  }, [duelInfo, level, grade, subjectId]);

  // Host: init primera ronda — pero antes intenta recuperar estado previo
  // por si es un rejoin (otro jugador ya en sala con estado vivo).
  useEffect(() => {
    if (!me?.isHost || !pool || pool.length < 5 || round) return;
    if (!channel?.isConnected) return;
    if (recoveryAttemptedRef.current) return;
    recoveryAttemptedRef.current = true;

    // Pedir estado al canal; si alguien responde, adoptamos y cancelamos init.
    channel.broadcast('request_state', { from: me.id });
    recoveryTimerRef.current = setTimeout(() => {
      if (roundRef.current) return; // ya recuperado
      const sc = { [me.id]: 0, [rival.id]: 0 };
      const hu = { [me.id]: null, [rival.id]: null };
      const r = buildRound(pool, 'host'); // retador empieza la 1a ronda
      nextFirstTurnRef.current = 'guest';
      setScore(sc); setRound(r); setHintsUsed(hu);
      channel.broadcast('score', sc);
      channel.broadcast('round', r);
      channel.broadcast('hints', hu);
    }, 1500);

    return () => {
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
    };
  }, [me?.isHost, pool, round, rival?.id, me?.id, channel?.isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guest: listeners (registrar UNA sola vez por conexion)
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('score', s => setScore(s));
    channel.onBroadcast('round', r => setRound(r));
    channel.onBroadcast('hints', h => setHintsUsed(h));
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
    // Responder si el otro jugador (host) acaba de reconectar y pide estado
    channel.onBroadcast('request_state', () => {
      const ch = chanRef.current;
      if (scoreRef.current) ch.broadcast('score', scoreRef.current);
      if (roundRef.current) ch.broadcast('round', roundRef.current);
      if (hintsRef.current) ch.broadcast('hints', hintsRef.current);
    });
  }, [channel?.isConnected, me?.isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Host: responde peticiones de estado + acciones del guest
  const applyAction = useCallback((action) => {
    setRound(prev => {
      if (!prev || prev.roundWinner !== undefined) return prev;
      const mySide = action.by === 'host' ? 'host' : 'guest';
      // Turno obligatorio SOLO para letras. Resolver la palabra se permite
      // a cualquiera en cualquier momento (clásico ahorcado 1v1).
      if (action.type === 'letter' && prev.turn !== mySide) return prev;

      const next = structuredClone(prev);

      if (action.type === 'letter') {
        const L = action.letter;
        if (next.usedLetters.includes(L)) return prev;
        next.usedLetters.push(L);
        let found = false;
        for (let i = 0; i < next.answer.length; i++) {
          if (next.answer[i] === L) { next.revealed[i] = L; found = true; }
        }
        if (!found) {
          if (mySide === 'host') next.hostLives = Math.max(0, next.hostLives - 1);
          else next.guestLives = Math.max(0, next.guestLives - 1);
        }
        // comprobaciones de fin de ronda
        if (!next.revealed.includes(null)) {
          // Completada por el jugador que tiro la letra ganadora
          next.roundWinner = mySide === 'host' ? me?.id : rival?.id;
        } else if (next.hostLives === 0 && next.guestLives === 0) {
          next.roundWinner = null;
        } else if (next.hostLives === 0) {
          next.roundWinner = rival?.id;
        } else if (next.guestLives === 0) {
          next.roundWinner = me?.id;
        } else {
          // cambio de turno
          next.turn = mySide === 'host' ? 'guest' : 'host';
        }
      } else if (action.type === 'solve') {
        const proposed = normWord(action.word).replace(/\s+/g, '');
        const expected = next.answer.replace(/\s+/g, '');
        if (proposed === expected) {
          for (let i = 0; i < next.answer.length; i++) {
            if (next.revealed[i] === null) next.revealed[i] = next.answer[i];
          }
          next.roundWinner = mySide === 'host' ? me?.id : rival?.id;
        } else {
          if (mySide === 'host') next.hostLives = Math.max(0, next.hostLives - 2);
          else next.guestLives = Math.max(0, next.guestLives - 2);
          if (next.hostLives === 0 && next.guestLives === 0) next.roundWinner = null;
          else if (next.hostLives === 0) next.roundWinner = rival?.id;
          else if (next.guestLives === 0) next.roundWinner = me?.id;
          else next.turn = mySide === 'host' ? 'guest' : 'host';
        }
      }
      return next;
    });
  }, [me?.id, rival?.id]);

  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      const ch = chanRef.current;
      if (scoreRef.current) ch.broadcast('score', scoreRef.current);
      if (roundRef.current) ch.broadcast('round', roundRef.current);
      if (hintsRef.current) ch.broadcast('hints', hintsRef.current);
    });
    channel.onBroadcast('action', payload => applyAction({ ...payload, by: 'guest' }));
    channel.onBroadcast('use_hint', ({ player_id, round_id }) => {
      setHintsUsed(prev => {
        if (!prev || prev[player_id]) return prev;
        const next = { ...prev, [player_id]: round_id };
        chanRef.current?.broadcast('hints', next);
        return next;
      });
    });
    // Recuperacion de estado: si el host acaba de reconectar y no tiene
    // ronda propia, adopta la que emita el guest.
    channel.onBroadcast('score', s => { if (!scoreRef.current) setScore(s); });
    channel.onBroadcast('hints', h => { if (!hintsRef.current) setHintsUsed(h); });
    channel.onBroadcast('round', r => {
      if (roundRef.current) return;
      setRound(r);
      // Reconstruir la rotacion del proximo turno a partir de firstTurn
      nextFirstTurnRef.current = r?.firstTurn === 'host' ? 'guest' : 'host';
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
    });
    // Guest abandona → el host reporta victoria (host gana)
    channel.onBroadcast('forfeit_request', () => {
      if (reportedRef.current || !me?.id) return;
      setWinnerId(me.id);
      setFinished(true);
      channel.broadcast('game_end', { winner_id: me.id });
    });
  }, [me?.isHost, channel?.isConnected, applyAction, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guest: pedir estado al entrar (una sola vez por conexion)
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Host: al cambiar ronda, difundir
  useEffect(() => {
    if (!me?.isHost || !round) return;
    chanRef.current?.broadcast('round', round);
  }, [me?.isHost, round]);

  // Host: fin de ronda → sumar punto + siguiente ronda o fin de duelo
  useEffect(() => {
    if (!me?.isHost || !round) return;
    const settled = round.roundWinner !== undefined;
    if (!settled) return;
    const key = `${round.answer}|${round.roundWinner}|${round.hostLives}|${round.guestLives}`;
    if (lastSettledRef.current === key) return;
    lastSettledRef.current = key;

    const t = setTimeout(() => {
      setScore(prev => {
        if (!prev) return prev;
        const ns = { ...prev };
        if (round.roundWinner) ns[round.roundWinner] = (ns[round.roundWinner] || 0) + 1;
        channel.broadcast('score', ns);
        const maxW = Math.max(...Object.values(ns));
        if (maxW >= TARGET_WINS) {
          const finalWinner = Object.entries(ns).find(([, v]) => v === maxW)?.[0];
          setWinnerId(finalWinner);
          setFinished(true);
          channel.broadcast('game_end', { winner_id: finalWinner });
        } else {
          const first = nextFirstTurnRef.current;
          nextFirstTurnRef.current = first === 'host' ? 'guest' : 'host';
          const r = buildRound(pool, first);
          setRound(r);
          channel.broadcast('round', r);
        }
        return ns;
      });
    }, 1800);
    return () => clearTimeout(t);
  }, [me?.isHost, round, channel, pool]);

  // Host: reporta resultado final
  useEffect(() => {
    if (!me?.isHost || !finished || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    // mode 'duel' para que NO cuente como intento de examen en la tarea.
    onGameComplete?.({ mode: 'duel', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0, durationSeconds: 0 });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  // Registrar handler de abandono voluntario. AppRunnerPage lo llama cuando
  // el usuario confirma salir a mitad de la partida (cuenta como derrota).
  // Usamos refs dentro del closure para que el handler sea estable y lea
  // siempre valores frescos (evita ventanas donde el ref quede desregistrado).
  const meRef = useRef(me); meRef.current = me;
  const rivalRef = useRef(rival); rivalRef.current = rival;
  const reportResultRef = useRef(reportResult); reportResultRef.current = reportResult;

  useEffect(() => {
    if (!registerDuelExit) return;
    // Si ya termino, no registramos — el back navega directo sin modal.
    if (finished) { registerDuelExit(null); return; }
    // Esperar a tener me/rival para no registrar un handler con refs vacias.
    if (!me?.id || !rival?.id) { registerDuelExit(null); return; }
    const forfeit = async () => {
      const m = meRef.current;
      const rv = rivalRef.current;
      const ch = chanRef.current;
      if (!m || !rv) return;
      if (m.isHost) {
        // Host abandona → rival gana
        try { await reportResultRef.current?.(rv.id); } catch (_) { /* ignore */ }
        ch?.broadcast('game_end', { winner_id: rv.id });
      } else {
        // Guest abandona → avisar al host para que reporte y esperar un poco
        ch?.broadcast('forfeit_request', { from: m.id });
        await new Promise(r => setTimeout(r, 1200));
      }
    };
    registerDuelExit(forfeit);
    return () => registerDuelExit(null);
  }, [registerDuelExit, finished, me?.id, me?.isHost, rival?.id]);

  function sendAction(action) {
    if (!round || round.roundWinner !== undefined || finished) return;
    const mySide = me.isHost ? 'host' : 'guest';
    // Para 'letter' exigimos turno; 'solve' lo puede hacer cualquiera.
    if (action.type === 'letter' && round.turn !== mySide) return;
    if (me.isHost) applyAction({ ...action, by: 'host' });
    else channel.broadcast('action', action);
  }

  function handleUseHint() {
    if (!round || !hintsUsed || hintsUsed[me.id] || round.roundWinner !== undefined || finished) return;
    if (me.isHost) {
      setHintsUsed(prev => {
        if (!prev || prev[me.id]) return prev;
        const next = { ...prev, [me.id]: round.id };
        chanRef.current?.broadcast('hints', next);
        return next;
      });
    } else {
      channel.broadcast('use_hint', { player_id: me.id, round_id: round.id });
    }
  }

  if (duel.err) return <Err text={duel.err} />;
  if (duel.loading || loadingData || !round || !score || !hintsUsed) return <Loading />;

  const myLives = me.isHost ? round.hostLives : round.guestLives;
  const rivalLives = me.isHost ? round.guestLives : round.hostLives;
  const myPoints = score[me.id] || 0;
  const rivalPoints = score[rival.id] || 0;
  const myTurn = round.turn === (me.isHost ? 'host' : 'guest');

  const roundOver = round.roundWinner !== undefined;
  const rivalName = rival.hidden ? 'tu rival' : rival.name;
  const iWon = finished && winnerId === me.id;

  return (
    <>
      <GameShell accent="#f97316" accent2="#ec4899" className="ahd-shell">
        <GameHeader
          title="Ahorcado · Duelo"
          subtitle={`Al mejor de ${TARGET_WINS * 2 - 1} · turnos alternos`}
          right={<Chip tone="accent" icon={Swords}>Duelo 1 vs 1</Chip>}
        />

        {/* Los dos jugadores: horca, vidas y rondas ganadas */}
        <div className="ahd-arena">
          <PlayerPanel
            label="Tú" name={me.name}
            emoji={me.emoji} avatarColor={me.color} avatarCode={me.selectedAvatarCode}
            lives={myLives} fails={LIVES - myLives}
            points={myPoints} target={TARGET_WINS}
            color="#8b5cf6" isTurn={!roundOver && !finished && myTurn}
          />
          <span className="ahd-vs" aria-hidden="true"><Swords size={20} /></span>
          <PlayerPanel
            label="Rival" name={rival.hidden ? 'Oculto' : rival.name}
            emoji={rival.emoji} avatarColor={rival.color} avatarCode={rival.selectedAvatarCode}
            lives={rivalLives} fails={LIVES - rivalLives}
            points={rivalPoints} target={TARGET_WINS}
            color="#f59e0b" isTurn={!roundOver && !finished && !myTurn}
          />
        </div>

        {/* Palabra */}
        <Panel variant="screen" className={`ahd-board ${roundOver ? (round.roundWinner === me.id ? 'is-won' : round.roundWinner === rival.id ? 'is-lost' : 'is-draw') : ''}`}>
          <div className={`ahd-word ${round.answer.length > 12 ? 'is-long' : ''}`}>
            {round.answer.split('').map((ch, i) => {
              const isLetter = /[A-ZÑ]/.test(ch);
              const shown = round.revealed[i];
              return (
                <span
                  key={i}
                  className={`ahd-tile ${isLetter ? (shown ? 'is-revealed' : '') : 'is-punct'}`}
                >
                  {shown || (isLetter ? '' : ch)}
                </span>
              );
            })}
          </div>
        </Panel>

        {/* Comodín de pista (1 por partida) */}
        <div className="ahd-hint">
          {hintsUsed[me.id] === round.id ? (
            <motion.div className="ahd-hint__box" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Lightbulb size={18} />
              <span><b>Pista:</b> {round.hint}</span>
            </motion.div>
          ) : hintsUsed[me.id] ? (
            <Chip icon={Lightbulb}>Comodín gastado</Chip>
          ) : (
            <GameButton
              variant="warning"
              size="sm"
              icon={Lightbulb}
              onClick={handleUseHint}
              disabled={round.roundWinner !== undefined || finished}
            >
              Ver pista (1 por partida)
            </GameButton>
          )}
          {hintsUsed[rival.id] && (
            <Chip icon={Lightbulb}>El rival usó su comodín</Chip>
          )}
        </div>

        {/* Indicador de turno */}
        {!finished && (
          <div className={`ahd-turn ${roundOver ? 'is-over' : myTurn ? 'is-mine' : 'is-rival'}`}>
            {roundOver ? <Hourglass size={16} /> : myTurn ? <Crown size={16} /> : <Hourglass size={16} />}
            <span>
              {roundOver
                ? 'Ronda terminada'
                : myTurn
                  ? '¡Es tu turno! Elige una letra o resuelve la palabra'
                  : `Turno de ${rivalName}… (puedes resolver si lo sabes)`}
            </span>
          </div>
        )}

        {/* Letras */}
        <div className={`ahd-keyboard ${!myTurn || roundOver || finished ? 'is-waiting' : ''}`} role="group" aria-label="Teclado">
          {LETTERS.map(L => {
            const used = round.usedLetters.includes(L);
            const inWord = used && round.answer.includes(L);
            const disabled = used || round.roundWinner !== undefined || finished || !myTurn;
            return (
              <KeyTile
                key={L}
                state={used ? (inWord ? 'correct' : 'wrong') : 'idle'}
                disabled={disabled}
                onClick={() => sendAction({ type: 'letter', letter: L })}
                aria-label={`Letra ${L}`}
              >
                {L}
              </KeyTile>
            );
          })}
        </div>

        {/* Resolver entera — disponible para cualquiera en cualquier momento */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (guess.trim()) sendAction({ type: 'solve', word: guess }); setGuess(''); }}
          className="ahd-solve"
        >
          <input
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="Resuelve la palabra entera…"
            disabled={round.roundWinner !== undefined || finished}
            className="ahd-solve__input"
          />
          <GameButton
            type="submit"
            icon={Send}
            disabled={!guess.trim() || round.roundWinner !== undefined || finished}
          >
            Resolver
          </GameButton>
        </form>
        <p className="ahd-solve__note">Si fallas al resolver pierdes 2 vidas.</p>

        <RoundBanner
          show={round.roundWinner !== undefined && !finished}
          status={round.roundWinner === me.id ? 'won' : round.roundWinner === rival.id ? 'lost' : 'info'}
          title={round.roundWinner === me.id ? '¡Ronda para ti!' :
            round.roundWinner === rival.id ? 'Ronda para el rival' : 'Ronda en empate'}
          subtitle={<>Palabra: <strong>{round.answer}</strong></>}
        />

        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className={`ahd-final ${iWon ? 'is-won' : 'is-lost'}`}
          >
            <span className="ahd-final__medal"><Trophy size={34} /></span>
            <div className="ahd-final__text">
              <strong>{iWon ? '¡Has ganado el duelo!' : 'Has perdido el duelo'}</strong>
              <span>{myPoints} – {rivalPoints} en rondas</span>
            </div>
            <GameButton variant="soft" icon={LogOut} onClick={() => navigate('/mi-panel')}>
              Salir a mi panel
            </GameButton>
          </motion.div>
        )}
      </GameShell>
      <DuelChatBar channel={channel} me={me} rival={rival} />
    </>
  );
}

function PlayerPanel({ label, name, emoji, avatarColor, avatarCode, lives, fails, points, target, color, isTurn }) {
  return (
    <div className={`ahd-player ${isTurn ? 'is-turn' : ''} ${fails >= LIVES ? 'is-hanged' : ''}`} style={{ '--pc': color }}>
      <div className="ahd-player__head">
        <UserAvatar
          selectedAvatarCode={avatarCode}
          avatarEmoji={emoji}
          avatarColor={avatarColor}
          size="lg"
          showRarityGlow={isTurn}
        />
        <div className="ahd-player__id">
          <span>{label}</span>
          <strong>{name}</strong>
        </div>
        {isTurn && <span className="ahd-player__turn">Turno</span>}
        <span className="ahd-player__points" title="Rondas ganadas">{points}</span>
      </div>
      {/* Dibujo del ahorcado */}
      <div className="ahd-player__art">
        <HangmanSvg fails={fails} tint={color} />
      </div>
      {/* Vidas + rondas ganadas */}
      <div className="ahd-player__foot">
        <Lives total={LIVES} left={lives} />
        <span className="ahd-player__rounds" aria-label={`${points} de ${target} rondas`}>
          {Array.from({ length: target }).map((_, i) => (
            <i key={i} className={i < points ? 'is-on' : ''} />
          ))}
        </span>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <GameShell accent="#f97316" accent2="#ec4899">
      <GameLoading label="Preparando el duelo…" />
    </GameShell>
  );
}
function Err({ text }) {
  return (
    <GameShell accent="#f97316" accent2="#ec4899">
      <GameEmpty title="Error">{text}</GameEmpty>
    </GameShell>
  );
}
