import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star, Swords, Trophy, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getRunnerData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';

const GRID = 35;               // tablero grande
const TICK_MS = 180;
const ITEM_LIFESPAN = 15000;
const ITEM_BLINK_MS = 5000;
const INITIAL_LEN = 3;
const TARGET_WINS = 3;         // al mejor de 5

function formatName(name) {
  return name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
}

function initialSnake(startX, startY, dir) {
  const body = [];
  for (let i = 0; i < INITIAL_LEN; i++) body.push({ x: startX - i * dir.x, y: startY - i * dir.y });
  return body;
}

function createRound(hostId, guestId) {
  return {
    snakes: {
      [hostId]: {
        owner: hostId,
        body: initialSnake(8, Math.floor(GRID / 2), { x: 1, y: 0 }),
        dir: { x: 1, y: 0 }, pendingDir: null,
        alive: true, size: INITIAL_LEN,
        score: 0, combo: 0, starCombo: 0,
        pendingGrowth: 0, headAnim: null,
      },
      [guestId]: {
        owner: guestId,
        body: initialSnake(GRID - 9, Math.floor(GRID / 2), { x: -1, y: 0 }),
        dir: { x: -1, y: 0 }, pendingDir: null,
        alive: true, size: INITIAL_LEN,
        score: 0, combo: 0, starCombo: 0,
        pendingGrowth: 0, headAnim: null,
      },
    },
    food: [],
    catIndex: 0,
    ticks: 0,
    over: false,
    roundWinner: null,
  };
}

function placeFood(round, type, wordText) {
  const occupied = new Set();
  for (const s of Object.values(round.snakes)) for (const seg of s.body) occupied.add(`${seg.x},${seg.y}`);
  for (const f of round.food) occupied.add(`${f.x},${f.y}`);
  let tries = 0;
  while (tries++ < 200) {
    const x = Math.floor(Math.random() * GRID);
    const y = Math.floor(Math.random() * GRID);
    if (!occupied.has(`${x},${y}`)) {
      return {
        x, y, type, word: wordText,
        id: Date.now() + Math.random(),
        expiresAt: Date.now() + ITEM_LIFESPAN,
      };
    }
  }
  return null;
}

function pickWord(data, categories, catIndex) {
  const targetKey = categories[catIndex];
  const others = categories.filter((_, i) => i !== catIndex);
  const rand = Math.random();
  if (rand > 0.92) return { type: 'bonus', word: '' };
  if (rand > 0.6 && others.length > 0) {
    const k = others[Math.floor(Math.random() * others.length)];
    const ws = data[k]; return { type: 'invalid', word: ws[Math.floor(Math.random() * ws.length)] };
  }
  const ws = data[targetKey];
  return { type: 'valid', word: ws[Math.floor(Math.random() * ws.length)] };
}

export default function SnakeDuel({ onGameComplete }) {
  const { level, grade, subjectId } = useParams();
  const duel = useDuel();
  const { duel: duelInfo, me, rival, channel, reportResult } = duel;

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [score, setScore] = useState(null);         // wins por jugador
  const [round, setRound] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [nextTopic, setNextTopic] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const reportedRef = useRef(false);
  const awardedRef = useRef(null);
  const levelupTimerRef = useRef(null);

  // Refs para que los handlers registrados una sola vez accedan al valor
  // actual (evita acumular listeners por cambio de referencia de canal).
  const roundRef = useRef(round);  roundRef.current = round;
  const scoreRef = useRef(score);  scoreRef.current = score;
  const chanRef  = useRef(channel); chanRef.current = channel;

  // === Cargar datos ===
  useEffect(() => {
    if (!duelInfo) return;
    const lvl = duelInfo.level || level;
    const gr = duelInfo.grade || grade;
    const sj = duelInfo.subject_id || subjectId || 'lengua';
    setLoadingData(true); setLoadErr(false);
    getRunnerData(lvl, gr, sj)
      .then(d => {
        if (!d || Object.keys(d).length === 0) { setLoadErr(true); return; }
        setData(d); setCategories(Object.keys(d));
      })
      .catch(() => setLoadErr(true))
      .finally(() => setLoadingData(false));
  }, [duelInfo, level, grade, subjectId]);

  // === Host: inicializa score + primera ronda + countdown ===
  useEffect(() => {
    if (!me?.isHost || !data || categories.length === 0 || round) return;
    const sc = { [me.id]: 0, [rival.id]: 0 };
    const r = createRound(me.id, rival.id);
    setScore(sc); setRound(r); setCountdown(3);
    channel.broadcast('score', sc);
    channel.broadcast('round', r);
    channel.broadcast('countdown', { value: 3 });
  }, [me?.isHost, data, categories, round, rival?.id, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Guest: listeners (una sola vez por conexion) ===
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('score', s => setScore(s));
    channel.onBroadcast('round', r => setRound(r));
    channel.onBroadcast('countdown', ({ value }) => setCountdown(value));
    channel.onBroadcast('levelup', ({ topic }) => setNextTopic(topic));
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
  }, [channel?.isConnected, me?.isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Guest: pide estado ===
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: responde peticiones + input del guest (una sola vez por conexion) ===
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      const ch = chanRef.current;
      if (scoreRef.current) ch.broadcast('score', scoreRef.current);
      if (roundRef.current) ch.broadcast('round', roundRef.current);
    });
    channel.onBroadcast('input', ({ player_id, dir }) => {
      setRound(prev => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        const s = next.snakes[player_id];
        if (!s || !s.alive) return prev;
        if (s.dir.x + dir.x === 0 && s.dir.y + dir.y === 0) return prev;
        s.pendingDir = dir;
        return next;
      });
    });
  }, [me?.isHost, channel?.isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Countdown ===
  useEffect(() => {
    if (!me?.isHost || countdown <= 0) return;
    const t = setTimeout(() => {
      const n = countdown - 1;
      setCountdown(n);
      channel.broadcast('countdown', { value: n });
    }, 800);
    return () => clearTimeout(t);
  }, [me?.isHost, countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: TICK loop ===
  useEffect(() => {
    if (!me?.isHost || !round || countdown > 0 || finished) return;
    if (round.over || nextTopic) return;

    const id = setInterval(() => {
      setRound(prev => {
        if (!prev || prev.over) return prev;
        const next = structuredClone(prev);
        next.ticks++;

        // Aplicar pendingDir
        for (const k of Object.keys(next.snakes)) {
          const s = next.snakes[k];
          if (s.pendingDir) { s.dir = s.pendingDir; s.pendingDir = null; }
          if (s.headAnim && next.ticks % 3 === 0) s.headAnim = null;
        }

        // Expirar comida
        const now = Date.now();
        next.food = next.food.filter(f => f.expiresAt > now);

        // Mover serpientes
        const alive = Object.keys(next.snakes).filter(k => next.snakes[k].alive);
        for (const k of alive) {
          const s = next.snakes[k];
          const head = s.body[0];
          const nh = { x: head.x + s.dir.x, y: head.y + s.dir.y };
          s.body.unshift(nh);
          if (s.pendingGrowth > 0) s.pendingGrowth -= 1;
          else if (s.body.length > s.size) s.body.pop();
        }

        // Colisiones
        for (const k of alive) {
          const s = next.snakes[k];
          const head = s.body[0];
          if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            s.alive = false; continue;
          }
          // Contra cualquier cuerpo (incluido propio menos cabeza)
          for (const k2 of Object.keys(next.snakes)) {
            const body = k === k2 ? next.snakes[k2].body.slice(1) : next.snakes[k2].body;
            for (const seg of body) {
              if (seg.x === head.x && seg.y === head.y) { s.alive = false; break; }
            }
            if (!s.alive) break;
          }
        }

        // Comer
        for (const k of alive) {
          const s = next.snakes[k];
          if (!s.alive) continue;
          const head = s.body[0];
          const fi = next.food.findIndex(f => f.x === head.x && f.y === head.y);
          if (fi === -1) continue;
          const item = next.food[fi];
          if (item.type === 'valid') {
            s.combo += 1;
            s.score += s.combo * 50;
            s.headAnim = 'success';
            s.pendingGrowth += 1;
            next.food.splice(fi, 1);
          } else if (item.type === 'invalid') {
            s.combo = 0; s.starCombo = 0;
            s.score = Math.max(0, s.score - 15);
            s.headAnim = 'error';
            next.food.splice(fi, 1);
          } else if (item.type === 'bonus') {
            s.starCombo += 1;
            s.score += s.starCombo * 500;
            s.headAnim = 'bonus';
            s.pendingGrowth += 10;
            // cambio de tema → pausa corta, solo la provoca quien la come
            next.catIndex = (next.catIndex + 1) % categories.length;
            next.food = [];
            // marca levelup temporal
            next._levelup = categories.length > 0 ? formatName(categories[next.catIndex]) : '';
            next.food.splice(fi, 1);
          }
        }

        // Reponer comida
        while (next.food.length < 5 && data) {
          const pick = pickWord(data, categories, next.catIndex);
          const item = placeFood(next, pick.type, pick.word);
          if (!item) break;
          next.food.push(item);
        }

        // Fin de ronda si alguien muerto
        const aliveNow = Object.keys(next.snakes).filter(k => next.snakes[k].alive);
        if (aliveNow.length < 2) {
          next.over = true;
          if (aliveNow.length === 1) next.roundWinner = aliveNow[0];
          else {
            // empate: ganador = mayor score
            const arr = Object.values(next.snakes);
            if (arr[0].score > arr[1].score) next.roundWinner = arr[0].owner;
            else if (arr[1].score > arr[0].score) next.roundWinner = arr[1].owner;
            else next.roundWinner = null;
          }
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [me?.isHost, round?.over, countdown, finished, nextTopic, round, data, categories]);

  // === Host: cada vez que round cambia, difunde (con limite para no spamear) ===
  useEffect(() => {
    if (!me?.isHost || !round) return;
    channel.broadcast('round', round);
    // Si hay levelup pendiente, activar pausa de 3s y difundir
    if (round._levelup && !nextTopic) {
      setNextTopic(round._levelup);
      channel.broadcast('levelup', { topic: round._levelup });
      clearTimeout(levelupTimerRef.current);
      levelupTimerRef.current = setTimeout(() => {
        setNextTopic('');
        setRound(prev => {
          if (!prev) return prev;
          const next = structuredClone(prev);
          delete next._levelup;
          return next;
        });
        channel.broadcast('levelup', { topic: '' });
      }, 3000);
    }
  }, [me?.isHost, round, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: fin de ronda → sumar + siguiente ronda o fin ===
  useEffect(() => {
    if (!me?.isHost || !round?.over) return;
    const key = `${round.ticks}|${round.roundWinner}`;
    if (awardedRef.current === key) return;
    awardedRef.current = key;

    const t = setTimeout(() => {
      setScore(prev => {
        if (!prev) return prev;
        const ns = { ...prev };
        const w = round.roundWinner;
        if (w) ns[w] = (ns[w] || 0) + 1;
        channel.broadcast('score', ns);
        const maxW = Math.max(...Object.values(ns));
        if (maxW >= TARGET_WINS) {
          const fw = Object.entries(ns).find(([, v]) => v === maxW)?.[0];
          setWinnerId(fw); setFinished(true);
          channel.broadcast('game_end', { winner_id: fw });
        } else {
          const r = createRound(me.id, rival.id);
          setRound(r); setCountdown(3);
          channel.broadcast('round', r);
          channel.broadcast('countdown', { value: 3 });
        }
        return ns;
      });
    }, 1600);
    return () => clearTimeout(t);
  }, [me?.isHost, round?.over, round, rival?.id, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: reportar resultado final ===
  useEffect(() => {
    if (!me?.isHost || !finished || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    onGameComplete?.({ mode: 'test', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0, durationSeconds: 0 });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  // === Controles ===
  const sendDir = useCallback((dir) => {
    if (!me || !round || round.over || countdown > 0 || finished || nextTopic) return;
    if (me.isHost) {
      setRound(prev => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        const s = next.snakes[me.id];
        if (!s || !s.alive) return prev;
        if (s.dir.x + dir.x === 0 && s.dir.y + dir.y === 0) return prev;
        s.pendingDir = dir;
        return next;
      });
    } else {
      channel.broadcast('input', { player_id: me.id, dir });
    }
  }, [me, round, countdown, finished, nextTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
        W: { x: 0, y: -1 }, S: { x: 0, y: 1 },
        A: { x: -1, y: 0 }, D: { x: 1, y: 0 },
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      sendDir(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sendDir]);

  if (duel.err) return <ErrBox text={duel.err} />;
  if (loadErr) return <ErrBox text="No hay datos disponibles para este curso." />;
  if (duel.loading || loadingData || !me || !round || !score) return <Loader />;

  const mySnake = round.snakes[me.id];
  const rivalSnake = round.snakes[rival.id];
  const myScore = score[me.id] || 0;
  const rivalScore = score[rival.id] || 0;
  const currentCat = categories.length > 0 ? formatName(categories[round.catIndex]) : '';

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 gap-4">
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px) rotate(-5deg)} 75%{transform:translateX(5px) rotate(5deg)} }
        @keyframes popGreen { 0%{transform:scale(1)} 50%{transform:scale(1.3); box-shadow:0 0 20px rgba(34,197,94,0.8)} 100%{transform:scale(1)} }
        @keyframes popGold { 0%{transform:scale(1) rotate(0)} 50%{transform:scale(1.4) rotate(180deg); box-shadow:0 0 30px rgba(250,204,21,0.9)} 100%{transform:scale(1) rotate(360deg)} }
        @keyframes zoomInUp { 0%{opacity:0; transform:scale(0.5) translateY(50px)} 100%{opacity:1; transform:scale(1) translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .anim-err { animation: shake .4s cubic-bezier(.36,.07,.19,.97) both; }
        .anim-ok { animation: popGreen .4s ease-out both; }
        .anim-bonus { animation: popGold .5s ease-out both; }
        .anim-popup { animation: zoomInUp .6s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* HEADER */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-violet-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              NEON DUELO
            </h1>
            {currentCat && (
              <p className="text-xs sm:text-sm text-slate-500">
                Objetivo: <span className="text-yellow-600 font-bold uppercase tracking-wider">{currentCat}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PlayerScore
            name={me.name} emoji={me.emoji}
            color="cyan" wins={myScore} target={TARGET_WINS}
            snakeScore={mySnake?.score || 0} alive={mySnake?.alive}
          />
          <span className="text-slate-400 font-black">VS</span>
          <PlayerScore
            name={rival.hidden ? 'Oculto' : rival.name} emoji={rival.emoji}
            color="fuchsia" wins={rivalScore} target={TARGET_WINS}
            snakeScore={rivalSnake?.score || 0} alive={rivalSnake?.alive}
          />
          {data && (
            <Button
              variant="outline"
              onClick={() => setShowCheatSheet(true)}
              className="h-12 w-12 rounded-full border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
              title="Guía de palabras"
            ><BookOpen className="h-5 w-5" /></Button>
          )}
        </div>
      </div>

      {/* TABLERO */}
      <div className="relative w-full max-w-[900px] aspect-square bg-slate-900 border-4 border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-4 ring-black/10">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: `${100 / GRID}% ${100 / GRID}%`
          }} />

        {/* Popups */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              key={`cd-${countdown}`}
              initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center"
            >
              <div className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">{countdown}</div>
            </motion.div>
          )}
          {nextTopic && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md"
            >
              <div className="anim-popup flex flex-col items-center text-center p-6 rounded-3xl bg-black/40 border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                <div className="relative mb-4 anim-float">
                  <Star className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" fill="currentColor" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase">¡Nueva Temática!</h2>
                <p className="text-4xl font-black bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-500 bg-clip-text text-transparent">
                  {nextTopic}
                </p>
              </div>
            </motion.div>
          )}
          {round.over && !finished && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="text-center text-white">
                <p className="text-3xl font-black">
                  {round.roundWinner === me.id ? '¡Ganas la ronda!' :
                   round.roundWinner === rival.id ? 'Ronda para el rival' : 'Ronda empate'}
                </p>
                <p className="text-sm opacity-80 mt-2">Preparando siguiente…</p>
              </div>
            </motion.div>
          )}
          {finished && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
                winnerId === me.id ? 'bg-emerald-900/90' : 'bg-rose-900/90'
              }`}
            >
              <div className="text-center text-white">
                <Trophy className="w-14 h-14 mx-auto mb-2" />
                <p className="text-4xl font-black">{winnerId === me.id ? '¡HAS GANADO!' : 'HAS PERDIDO'}</p>
              </div>
            </motion.div>
          )}
          {showCheatSheet && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col p-6 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" /> Guía de Palabras
                </h2>
                <button onClick={() => setShowCheatSheet(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center border-2 border-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid gap-3">
                  {data && Object.entries(data).map(([cat, words]) => (
                    <div key={cat} className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
                      <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-2 border-l-4 border-blue-500 pl-2">
                        {cat.replace(/_/g, ' ')}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(words) && words.map((w, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-950/60 text-slate-300 rounded text-[11px] border border-white/5">{w}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CELDAS */}
        <div className="w-full h-full relative" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          gridTemplateRows: `repeat(${GRID}, 1fr)`,
        }}>
          {/* Snakes */}
          {Object.values(round.snakes).map(s => {
            const isMine = s.owner === me.id;
            const headColor = isMine
              ? (s.headAnim === 'error' ? 'bg-red-500 anim-err'
                : s.headAnim === 'success' ? 'bg-green-500 anim-ok'
                : s.headAnim === 'bonus' ? 'bg-yellow-400 anim-bonus'
                : 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-110')
              : (s.headAnim === 'error' ? 'bg-red-500 anim-err'
                : s.headAnim === 'success' ? 'bg-green-500 anim-ok'
                : s.headAnim === 'bonus' ? 'bg-yellow-400 anim-bonus'
                : 'bg-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.6)] scale-110');
            const bodyColor = isMine ? 'bg-cyan-600/80' : 'bg-fuchsia-600/80';
            return s.body.map((seg, i) => {
              const isHead = i === 0;
              return (
                <div
                  key={`${s.owner}-${i}`}
                  className={cn('rounded-sm transition-all duration-75', isHead ? `${headColor} z-20` : `${bodyColor} z-10`, !s.alive && 'opacity-50 grayscale')}
                  style={{ gridColumnStart: seg.x + 1, gridRowStart: seg.y + 1 }}
                >
                  {isHead && (
                    <div className="w-full h-full flex items-center justify-center gap-[1px]">
                      <div className="bg-black w-[20%] h-[20%] rounded-full opacity-60" />
                      <div className="bg-black w-[20%] h-[20%] rounded-full opacity-60" />
                    </div>
                  )}
                </div>
              );
            });
          })}

          {/* Comida */}
          {round.food.map(item => {
            let color = 'bg-slate-700 border-slate-500 text-slate-200';
            if (item.type === 'valid') color = 'bg-green-900/80 border-green-500 text-green-200';
            else if (item.type === 'invalid') color = 'bg-red-900/80 border-red-500 text-red-200';
            else if (item.type === 'bonus') color = 'bg-yellow-500/20 border-yellow-400 text-yellow-200 animate-pulse';
            const timeLeft = item.expiresAt - Date.now();
            const expiring = timeLeft < ITEM_BLINK_MS;
            return (
              <div
                key={item.id}
                className={cn('flex items-center justify-center relative z-0 transition-opacity', expiring && 'animate-pulse')}
                style={{ gridColumnStart: item.x + 1, gridRowStart: item.y + 1 }}
              >
                {item.type === 'bonus' ? (
                  <Star className="w-full h-full text-yellow-400 p-1" fill="currentColor" />
                ) : (
                  <div className={`w-3/4 h-3/4 rounded-full border-2 ${color.split(' ')[0]} ${color.split(' ')[1]}`} />
                )}
                {item.word && (
                  <span
                    className={cn('absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded font-bold border pointer-events-none z-30 shadow-md text-[10px]', color)}
                  >{item.word}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controles móvil */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs 2xl:hidden mt-2">
        <div />
        <Button variant="secondary" className="h-14 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => sendDir({ x: 0, y: -1 })}><ArrowUp /></Button>
        <div />
        <Button variant="secondary" className="h-14 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => sendDir({ x: -1, y: 0 })}><ArrowLeft /></Button>
        <Button variant="secondary" className="h-14 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => sendDir({ x: 0, y: 1 })}><ArrowDown /></Button>
        <Button variant="secondary" className="h-14 bg-slate-800 text-white rounded-2xl active:scale-95 transition-transform" onPointerDown={() => sendDir({ x: 1, y: 0 })}><ArrowRight /></Button>
      </div>
    </div>
  );
}

function PlayerScore({ name, emoji, color, wins, target, snakeScore, alive }) {
  const bg = color === 'cyan' ? 'bg-cyan-500' : 'bg-fuchsia-500';
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border border-slate-100 min-w-[150px]">
      <div className="text-2xl">{emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-700 truncate">{name}</p>
        <p className="text-xs text-slate-500">{snakeScore} pts · {alive ? 'viva' : '💀'}</p>
        <div className="flex gap-1 mt-0.5">
          {Array.from({ length: target }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded ${i < wins ? bg : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Loader() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" /></div>; }
function ErrBox({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
