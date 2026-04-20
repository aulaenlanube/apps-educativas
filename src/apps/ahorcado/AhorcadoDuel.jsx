import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, X, LogOut } from 'lucide-react';
import { getRoscoData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';

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

// SVG del ahorcado — mismo estilo que la version 1 jugador
function HangmanSvg({ fails, color = 'currentColor' }) {
  const parts = [
    <line key="base" x1="10" y1="140" x2="110" y2="140" stroke={color} strokeWidth="4" strokeLinecap="round" />,
    <line key="poste" x1="30" y1="140" x2="30" y2="20" stroke={color} strokeWidth="4" strokeLinecap="round" />,
    <line key="travesano" x1="30" y1="20" x2="85" y2="20" stroke={color} strokeWidth="4" strokeLinecap="round" />,
    <line key="cuerda" x1="85" y1="20" x2="85" y2="35" stroke={color} strokeWidth="3" strokeLinecap="round" />,
  ];
  const body = [
    <circle key="cabeza" cx="85" cy="45" r="10" stroke={color} strokeWidth="3" fill="none" />,
    <line key="torso" x1="85" y1="55" x2="85" y2="90" stroke={color} strokeWidth="3" strokeLinecap="round" />,
    <line key="brazoI" x1="85" y1="65" x2="70" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" />,
    <line key="brazoD" x1="85" y1="65" x2="100" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" />,
    <line key="piernaI" x1="85" y1="90" x2="72" y2="110" stroke={color} strokeWidth="3" strokeLinecap="round" />,
    <line key="piernaD" x1="85" y1="90" x2="98" y2="110" stroke={color} strokeWidth="3" strokeLinecap="round" />,
  ];
  return (
    <svg viewBox="0 0 120 150" className="w-full h-full" aria-label="Ahorcado">
      {parts}
      {body.slice(0, fails).map((el, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >{el}</motion.g>
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
      const r = buildRound(pool, 'host'); // retador empieza la 1a ronda
      nextFirstTurnRef.current = 'guest';
      setScore(sc); setRound(r);
      channel.broadcast('score', sc);
      channel.broadcast('round', r);
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
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
    // Responder si el otro jugador (host) acaba de reconectar y pide estado
    channel.onBroadcast('request_state', () => {
      const ch = chanRef.current;
      if (scoreRef.current) ch.broadcast('score', scoreRef.current);
      if (roundRef.current) ch.broadcast('round', roundRef.current);
    });
  }, [channel?.isConnected, me?.isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Host: responde peticiones de estado + acciones del guest
  const applyAction = useCallback((action) => {
    setRound(prev => {
      if (!prev || prev.roundWinner !== undefined) return prev;
      // Turno obligatorio
      const mySide = action.by === 'host' ? 'host' : 'guest';
      if (prev.turn !== mySide) return prev;

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
    });
    channel.onBroadcast('action', payload => applyAction({ ...payload, by: 'guest' }));
    // Recuperacion de estado: si el host acaba de reconectar y no tiene
    // ronda propia, adopta la que emita el guest.
    channel.onBroadcast('score', s => { if (!scoreRef.current) setScore(s); });
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
    onGameComplete?.({ mode: 'test', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0, durationSeconds: 0 });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  // Registrar handler de abandono voluntario. AppRunnerPage lo llama cuando
  // el usuario confirma salir a mitad de la partida (cuenta como derrota).
  // Usamos refs dentro del closure para que el handler sea estable y lea
  // siempre valores frescos (evita ventanas donde el ref quede desregistrado).
  const meRef = useRef(me); meRef.current = me;
  const rivalRef = useRef(rival); rivalRef.current = rival;
  const finishedRef2 = useRef(finished); finishedRef2.current = finished;
  const reportResultRef = useRef(reportResult); reportResultRef.current = reportResult;

  useEffect(() => {
    if (!registerDuelExit) return;
    const forfeit = async () => {
      if (finishedRef2.current) return;
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
  }, [registerDuelExit]);

  function sendAction(action) {
    if (!round || round.roundWinner !== undefined || finished) return;
    const mySide = me.isHost ? 'host' : 'guest';
    if (round.turn !== mySide) return; // no es mi turno
    if (me.isHost) applyAction({ ...action, by: 'host' });
    else channel.broadcast('action', action);
  }

  if (duel.err) return <Err text={duel.err} />;
  if (duel.loading || loadingData || !round || !score) return <Loading />;

  const myLives = me.isHost ? round.hostLives : round.guestLives;
  const rivalLives = me.isHost ? round.guestLives : round.hostLives;
  const myPoints = score[me.id] || 0;
  const rivalPoints = score[rival.id] || 0;
  const myTurn = round.turn === (me.isHost ? 'host' : 'guest');

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-violet-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Swords className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold">Ahorcado Duelo · Al mejor de {TARGET_WINS * 2 - 1}</h2>
          <span className="ml-auto text-xs text-slate-500">
            Turnos alternos
          </span>
        </div>

        {/* Dos ahorcados + scoreboard */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <PlayerPanel
            label="Tú" name={me.name} emoji={me.emoji}
            lives={myLives} fails={LIVES - myLives}
            points={myPoints} target={TARGET_WINS}
            color="#8b5cf6" isTurn={myTurn}
          />
          <PlayerPanel
            label="Rival" name={rival.hidden ? 'Oculto' : rival.name} emoji={rival.emoji}
            lives={rivalLives} fails={LIVES - rivalLives}
            points={rivalPoints} target={TARGET_WINS}
            color="#f59e0b" isTurn={!myTurn}
          />
        </div>

        {/* Pista */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-3">
          <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wide">Pista · letra {round.letter}</p>
          <p className="text-sm text-amber-900">{round.hint}</p>
        </div>

        {/* Palabra */}
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {round.answer.split('').map((ch, i) => (
            <span
              key={i}
              className={`w-9 h-11 rounded border-b-2 flex items-center justify-center font-bold text-xl ${
                /[A-ZÑ]/.test(ch)
                  ? round.revealed[i]
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-400 bg-slate-50 text-transparent'
                  : 'border-transparent text-slate-500'
              }`}
            >
              {round.revealed[i] || (/[A-ZÑ]/.test(ch) ? '?' : ch)}
            </span>
          ))}
        </div>

        {/* Indicador de turno */}
        <div className={`text-center py-2 mb-3 rounded-lg text-sm font-bold ${
          round.roundWinner !== undefined
            ? 'bg-slate-100 text-slate-500'
            : myTurn
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
        }`}>
          {round.roundWinner !== undefined
            ? 'Ronda terminada'
            : myTurn
              ? '¡Es tu turno! Elige una letra o resuelve la palabra'
              : `Turno de ${rival.hidden ? 'tu rival' : rival.name}…`}
        </div>

        {/* Letras */}
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {LETTERS.map(L => {
            const used = round.usedLetters.includes(L);
            const inWord = used && round.answer.includes(L);
            const disabled = used || round.roundWinner !== undefined || finished || !myTurn;
            return (
              <button
                key={L}
                disabled={disabled}
                onClick={() => sendAction({ type: 'letter', letter: L })}
                className={`w-8 h-9 rounded text-sm font-bold border transition-colors ${
                  used
                    ? inWord
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-rose-500 text-white border-rose-600 line-through'
                    : myTurn
                      ? 'bg-white hover:bg-violet-50 border-slate-300 text-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                } disabled:cursor-not-allowed`}
              >{L}</button>
            );
          })}
        </div>

        {/* Resolver entera */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (guess.trim()) sendAction({ type: 'solve', word: guess }); setGuess(''); }}
          className="flex gap-2"
        >
          <input
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder={myTurn ? 'Resuelve la palabra entera…' : 'Espera tu turno'}
            disabled={round.roundWinner !== undefined || finished || !myTurn}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-400 outline-none disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={!guess.trim() || round.roundWinner !== undefined || finished || !myTurn}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold disabled:opacity-40"
          >Resolver</button>
        </form>

        <AnimatePresence>
          {round.roundWinner !== undefined && !finished && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-slate-100 text-center"
            >
              <p className="font-bold text-slate-700">
                {round.roundWinner === me.id ? '¡Ronda para ti!' :
                 round.roundWinner === rival.id ? 'Ronda para el rival' : 'Ronda en empate'}
              </p>
              <p className="text-xs text-slate-500">Palabra: {round.answer}</p>
            </motion.div>
          )}
          {finished && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`mt-4 p-4 rounded-xl text-center text-white bg-gradient-to-r ${
                winnerId === me.id ? 'from-emerald-500 to-green-600' : 'from-rose-500 to-rose-700'
              }`}
            >
              <Trophy className="w-8 h-8 mx-auto mb-1" />
              <p className="text-xl font-black mb-3">{winnerId === me.id ? '¡Has ganado el duelo!' : 'Has perdido el duelo'}</p>
              <button
                onClick={() => navigate('/mi-panel')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" /> Salir a mi panel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PlayerPanel({ label, name, emoji, lives, fails, points, target, color, isTurn }) {
  return (
    <div className={`p-3 rounded-xl border-2 transition-colors ${
      isTurn ? 'border-violet-400 bg-violet-50 shadow-sm' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-2xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase text-slate-500 tracking-wide">{label}</p>
          <p className="font-bold truncate text-sm">{name}</p>
        </div>
        {isTurn && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-600 text-white">TURNO</span>}
        <div className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-black" style={{ background: color }}>
          {points}
        </div>
      </div>
      {/* Dibujo del ahorcado */}
      <div className="aspect-[4/5] mx-auto max-w-[140px]" style={{ color: fails >= LIVES ? '#ef4444' : '#475569' }}>
        <HangmanSvg fails={fails} />
      </div>
      {/* Vidas + barra de puntos */}
      <div className="flex items-center justify-center gap-0.5 mt-2">
        {Array.from({ length: LIVES }).map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${i < lives ? 'bg-rose-500' : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="flex gap-1 mt-2">
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded" style={{ background: i < points ? color : '#e2e8f0' }} />
        ))}
      </div>
    </div>
  );
}

function Loading() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>; }
function Err({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
