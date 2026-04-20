import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, X, Heart } from 'lucide-react';
import { getRoscoData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';

const LIVES = 6;
const TARGET_WINS = 3;
const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

function normWord(s) {
  return (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function lettersOnly(s) { return normWord(s).replace(/[^A-ZÑ]/g, ''); }

function buildRound(pool) {
  const q = pool[Math.floor(Math.random() * pool.length)];
  const answer = normWord(q.solucion);
  return {
    answer,
    hint: q.definicion,
    letter: (q.letra || '').toUpperCase(),
    revealed: answer.split('').map(ch => /[A-ZÑ]/.test(ch) ? null : ch),
    hostLives: LIVES,
    guestLives: LIVES,
    usedLetters: [], // letras globales
    roundWinner: null,
    solvedBy: null,
  };
}

export default function AhorcadoDuel({ onGameComplete }) {
  const { level, grade, subjectId } = useParams();
  const duel = useDuel();
  const { duelId, duel: duelInfo, me, rival, channel, reportResult } = duel;

  const [pool, setPool] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [round, setRound] = useState(null);
  const [score, setScore] = useState(null);
  const [finished, setFinished] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [guess, setGuess] = useState('');
  const reportedRef = useRef(false);

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

  // Host: init
  useEffect(() => {
    if (!me?.isHost || !pool || pool.length < 5 || round) return;
    const sc = { [me.id]: 0, [rival.id]: 0 };
    const r = buildRound(pool);
    setScore(sc); setRound(r);
    channel.broadcast('score', sc);
    channel.broadcast('round', r);
  }, [me?.isHost, pool, round, rival?.id, me?.id, channel]);

  // Guest: listeners
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('score', s => setScore(s));
    channel.onBroadcast('round', r => setRound(r));
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
  }, [channel, me?.isHost]);

  // Host: responde peticiones de estado + acciones
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      if (score) channel.broadcast('score', score);
      if (round) channel.broadcast('round', round);
    });
    channel.onBroadcast('action', (payload) => applyAction({ ...payload, by: 'guest' }));
  }, [me?.isHost, channel, score, round]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guest pide estado
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id, channel]);

  const applyAction = useCallback((action) => {
    setRound(prev => {
      if (!prev || prev.roundWinner) return prev;
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
          if (action.by === 'host') next.hostLives = Math.max(0, next.hostLives - 1);
          else next.guestLives = Math.max(0, next.guestLives - 1);
        }
        // ¿completo?
        if (!next.revealed.includes(null)) {
          next.roundWinner = action.by === 'host' ? me?.id : rival?.id;
          next.solvedBy = next.roundWinner;
        } else if (next.hostLives === 0 && next.guestLives === 0) {
          next.roundWinner = null; // empate de ronda
        } else if (next.hostLives === 0) {
          next.roundWinner = rival?.id;
        } else if (next.guestLives === 0) {
          next.roundWinner = me?.id;
        }
      } else if (action.type === 'solve') {
        const proposed = normWord(action.word).replace(/\s+/g, '');
        const expected = next.answer.replace(/\s+/g, '');
        if (proposed === expected) {
          // Revelar todo
          for (let i = 0; i < next.answer.length; i++) {
            if (next.revealed[i] === null) next.revealed[i] = next.answer[i];
          }
          next.roundWinner = action.by === 'host' ? me?.id : rival?.id;
          next.solvedBy = next.roundWinner;
        } else {
          // Fallo grave: -2 vidas al que propuso
          if (action.by === 'host') next.hostLives = Math.max(0, next.hostLives - 2);
          else next.guestLives = Math.max(0, next.guestLives - 2);
          if (next.hostLives === 0 && next.guestLives === 0) next.roundWinner = null;
          else if (next.hostLives === 0) next.roundWinner = rival?.id;
          else if (next.guestLives === 0) next.roundWinner = me?.id;
        }
      }
      return next;
    });
  }, [me?.id, rival?.id]);

  // Host: al cambiar ronda, difundir
  useEffect(() => {
    if (!me?.isHost || !round) return;
    channel.broadcast('round', round);
  }, [me?.isHost, round, channel]);

  // Host: al ganarse una ronda, avanzar
  useEffect(() => {
    if (!me?.isHost || !round?.roundWinner && round?.roundWinner !== null) return;
    if (!round || round.roundWinner === undefined) return;
    // solo si esta ronda ya ha concluido
    const done = round.roundWinner !== undefined && (round.roundWinner !== null || (round.hostLives === 0 && round.guestLives === 0));
    if (!done || !round._awardedPending) {
      // marcamos como pendiente de awarded para esta ronda concreta; usamos una ref simple
    }
  }, [me?.isHost, round]);

  // Award via efecto separado: detecta transicion a roundWinner set
  const lastSettledRef = useRef(null);
  useEffect(() => {
    if (!me?.isHost || !round) return;
    const settled = round.roundWinner !== undefined && (round.roundWinner !== null || (round.hostLives === 0 && round.guestLives === 0));
    if (!settled) return;
    // evitar doble award en mismo render
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
          const r = buildRound(pool);
          setRound(r);
          channel.broadcast('round', r);
        }
        return ns;
      });
    }, 1800);
    return () => clearTimeout(t);
  }, [me?.isHost, round, channel, pool]);

  // Reporte final (host)
  useEffect(() => {
    if (!me?.isHost || !finished || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    onGameComplete?.({ mode: 'test', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0, durationSeconds: 0 });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  function sendAction(action) {
    if (!round || round.roundWinner || finished) return;
    if (me.isHost) applyAction({ ...action, by: 'host' });
    else channel.broadcast('action', action);
  }

  if (duel.err) return <Err text={duel.err} />;
  if (duel.loading || loadingData || !round || !score) return <Loading />;

  const myLives = me.isHost ? round.hostLives : round.guestLives;
  const rivalLives = me.isHost ? round.guestLives : round.hostLives;
  const myPoints = score[me.id] || 0;
  const rivalPoints = score[rival.id] || 0;

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-violet-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Swords className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold">Ahorcado Duelo · Al mejor de {TARGET_WINS * 2 - 1}</h2>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ScoreCard label="Tú" name={me.name} emoji={me.emoji} lives={myLives} points={myPoints} target={TARGET_WINS} color="bg-violet-600" />
          <ScoreCard label="Rival" name={rival.hidden ? 'Oculto' : rival.name} emoji={rival.emoji} lives={rivalLives} points={rivalPoints} target={TARGET_WINS} color="bg-amber-500" />
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

        {/* Letras */}
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {LETTERS.map(L => {
            const used = round.usedLetters.includes(L);
            const inWord = used && round.answer.includes(L);
            return (
              <button
                key={L}
                disabled={used || round.roundWinner !== null || finished}
                onClick={() => sendAction({ type: 'letter', letter: L })}
                className={`w-8 h-9 rounded text-sm font-bold border transition-colors ${
                  used
                    ? inWord
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-rose-500 text-white border-rose-600 line-through'
                    : 'bg-white hover:bg-violet-50 border-slate-300 text-slate-700'
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
            placeholder="¿Sabes la palabra entera? Escríbela aquí…"
            disabled={round.roundWinner !== null || finished}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-400 outline-none disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={!guess.trim() || round.roundWinner !== null || finished}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold disabled:opacity-40"
          >Resolver</button>
        </form>

        <AnimatePresence>
          {round.roundWinner !== null && !finished && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-slate-100 text-center"
            >
              <p className="font-bold text-slate-700">
                {round.roundWinner === me.id ? '¡Ronda para ti!' :
                 round.roundWinner === rival.id ? 'Ronda para el rival' : 'Ronda empate'}
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
              <p className="text-xl font-black">{winnerId === me.id ? '¡Has ganado el duelo!' : 'Has perdido el duelo'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScoreCard({ label, name, emoji, lives, points, target, color }) {
  return (
    <div className="p-3 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-2xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase text-slate-500 tracking-wide">{label}</p>
          <p className="font-bold truncate text-sm">{name}</p>
        </div>
        <div className={`w-7 h-7 rounded-lg ${color} text-white flex items-center justify-center font-black`}>
          {points}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: LIVES }).map((_, i) => (
          <Heart key={i} className={`w-3.5 h-3.5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded ${i < points ? color : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}

function Loading() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>; }
function Err({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
