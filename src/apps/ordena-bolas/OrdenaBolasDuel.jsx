import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { Swords, Trophy, X, LogOut, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useDuel from '@/hooks/useDuel';
import UserAvatar from '@/components/ui/UserAvatar';
import DuelChatBar from '@/components/duel/DuelChatBar';

// El duelo es una experiencia rápida y predecible: cantidad fija de bolas, solo
// con números, rotación moderada del recipiente y "siguiente valor" siempre
// visible. El profesor/alumno no elige nada — entra y se juega.
const BALL_COUNT = 15;
const FIXED_DIFFICULTY = {
  id: 'duel-default',
  ops: ['numbers'],
  rotation: 3,
  randomSize: false,
  showNext: true,
};

// Persistencia local del estado del duelo. Si un jugador refresca la página
// (F5, accidente, navegación rara), recuperamos el progreso de la partida en
// curso para que no se reinicie. Clave por duelId — al terminar se limpia.
const STORAGE_PREFIX = 'orderballsduel:';
function loadCheckpoint(duelId) {
  if (!duelId || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + duelId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.phase === 'ended') return null;
    return parsed;
  } catch (_) { return null; }
}
function saveCheckpoint(duelId, data) {
  if (!duelId || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + duelId, JSON.stringify(data));
  } catch (_) { /* quota / private mode → ignorar */ }
}
function clearCheckpoint(duelId) {
  if (!duelId || typeof window === 'undefined') return;
  try { window.localStorage.removeItem(STORAGE_PREFIX + duelId); } catch (_) {}
}

function makeOperand(type) {
  switch (type) {
    case 'numbers': { const val = Math.floor(Math.random()*50)+1; return { val, label: `${val}` }; }
    case 'add': { const a = Math.floor(Math.random()*20)+1, b = Math.floor(Math.random()*20)+1; return { val: a+b, label: `${a} + ${b}` }; }
    case 'sub': { const val = Math.floor(Math.random()*40)+1; const b = Math.floor(Math.random()*20)+1; return { val, label: `${val+b} - ${b}` }; }
    case 'mul': { const a = Math.floor(Math.random()*9)+2, b = Math.floor(Math.random()*9)+2; return { val: a*b, label: `${a} × ${b}` }; }
    case 'div': { const a = Math.floor(Math.random()*9)+2, b = Math.floor(Math.random()*9)+2; return { val: a, label: `${a*b} ÷ ${b}` }; }
    case 'pow': { const base = Math.floor(Math.random()*5)+2, exp = Math.floor(Math.random()*2)+2; return { val: Math.pow(base,exp), label: exp===2 ? `${base}²` : `${base}³` }; }
    case 'sqrt': { const val = Math.floor(Math.random()*10)+2; return { val, label: `√${val*val}` }; }
    case 'eq': {
      const t = Math.floor(Math.random()*3);
      if (t === 0) { const x = Math.floor(Math.random()*15)+1, a = Math.floor(Math.random()*10)+1; return { val: x, label: `x + ${a} = ${x+a}` }; }
      if (t === 1) { const x = Math.floor(Math.random()*15)+5, a = Math.floor(Math.random()*5)+1; return { val: x, label: `x - ${a} = ${x-a}` }; }
      { const x = Math.floor(Math.random()*10)+2, a = Math.floor(Math.random()*4)+2; return { val: x, label: `${a}x = ${x*a}` }; }
    }
    default: return { val: 0, label: '?' };
  }
}

function generateBallData(diff) {
  const balls = [];
  const used = new Set();
  const tryAdd = (type, maxTries = 200) => {
    for (let i = 0; i < maxTries; i++) {
      const { val, label } = makeOperand(type);
      if (val > 0 && !used.has(val)) {
        used.add(val);
        balls.push({ value: val, label });
        return true;
      }
    }
    return false;
  };

  if (diff.fixedOps) {
    const distribution = [];
    for (const [type, count] of Object.entries(diff.fixedOps)) {
      for (let i = 0; i < count; i++) distribution.push(type);
    }
    while (distribution.length < BALL_COUNT) distribution.push('numbers');
    for (const type of distribution) tryAdd(type);
  } else {
    let attempts = 0;
    while (balls.length < BALL_COUNT && attempts < 3000) {
      attempts++;
      const type = diff.ops[Math.floor(Math.random() * diff.ops.length)];
      tryAdd(type, 1);
    }
  }

  return balls.slice(0, BALL_COUNT).map((b, i) => ({
    id: i,
    value: b.value,
    label: b.label,
    x0: 0.5 + (Math.random() - 0.5) * 0.5,
    y0: 0.5 + (Math.random() - 0.5) * 0.5,
    sizeFactor: Math.random(),
  }));
}

export default function OrdenaBolasDuel({ onGameComplete, registerDuelExit }) {
  const duel = useDuel();
  const navigate = useNavigate();
  const { duelId, me, rival, channel, reportResult } = duel;

  // Si el navegador se refresca, recuperamos el estado guardado para no
  // reiniciar la partida. Lo leemos UNA vez al montar (lazy init de useState).
  const [restoredCheckpoint] = useState(() => loadCheckpoint(duelId));

  // Estado síncrono. Si hubo refresh y había una partida en curso, saltamos
  // directamente a la fase 'playing' (sin volver a hacer la cuenta atrás).
  const [phase, setPhase] = useState(() => {
    if (restoredCheckpoint && restoredCheckpoint.phase) {
      return restoredCheckpoint.phase === 'countdown' ? 'playing' : restoredCheckpoint.phase;
    }
    return 'connecting';
  });
  const [difficulty, setDifficulty] = useState(restoredCheckpoint?.difficulty ?? null);
  const [ballsData, setBallsData]   = useState(restoredCheckpoint?.ballsData ?? null);
  const [state, setState]           = useState(restoredCheckpoint?.state ?? null);
  const [winnerId, setWinnerId]     = useState(restoredCheckpoint?.winnerId ?? null);
  const [countdown, setCountdown]   = useState(null);
  const reportedRef = useRef(false);
  // Si restauramos, marcamos como ya iniciado para que el host NO regenere
  // las bolas al volver a montarse.
  const startedRef = useRef(!!restoredCheckpoint);

  const stateRef = useRef(null); stateRef.current = state;
  const ballsDataRef = useRef(null); ballsDataRef.current = ballsData;
  const chanRef = useRef(channel); chanRef.current = channel;

  // ============ HOST ============

  const startWithDifficulty = useCallback((diff) => {
    if (!me?.isHost) return;
    const balls = generateBallData(diff);
    const sortedVals = [...balls].map(b => b.value).sort((a, b) => a - b);
    const init = {
      marks: {},
      scores: { [me.id]: 0, [rival.id]: 0 },
      remaining: sortedVals,
    };
    setDifficulty(diff); setBallsData(balls); setState(init);
    stateRef.current = init; ballsDataRef.current = balls;
    channel?.broadcast('setup', { difficulty: diff, ballsData: balls });
    channel?.broadcast('state', init);
    // cuenta atrás
    runCountdown();
  }, [me?.isHost, me?.id, rival?.id, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  const runCountdown = useCallback(() => {
    let n = 3;
    setPhase('countdown'); setCountdown(n);
    channel?.broadcast('phase', { phase: 'countdown', countdown: n });
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setPhase('playing'); setCountdown(null);
        channel?.broadcast('phase', { phase: 'playing', countdown: 0 });
      } else {
        setCountdown(n);
        channel?.broadcast('phase', { phase: 'countdown', countdown: n });
      }
    }, 1000);
  }, [channel]);

  // Host: procesa un intento de marca (local o remoto). Supabase no hace
  // eco de broadcasts al emisor, asi que el host debe llamar esto directo.
  const processMarkRequest = useCallback(({ ballId, by }) => {
    if (!me?.isHost) return;
    const s = stateRef.current; const bd = ballsDataRef.current;
    if (!s || !bd) return;
    if (s.marks[ballId]) return; // ya marcada
    const ball = bd.find(b => b.id === ballId);
    if (!ball) return;
    const nextTarget = s.remaining[0];
    const correct = ball.value === nextTarget;
    const scorer = correct ? by : (by === me.id ? rival.id : me.id);
    const newRemaining = s.remaining.filter(v => v !== ball.value);
    const next = {
      marks: { ...s.marks, [ballId]: { by, correct } },
      scores: { ...s.scores, [scorer]: (s.scores[scorer] || 0) + 1 },
      remaining: newRemaining,
    };
    stateRef.current = next;
    setState(next);
    chanRef.current?.broadcast('state', next);
    if (newRemaining.length === 0) {
      const w = next.scores[me.id] >= next.scores[rival.id] ? me.id : rival.id;
      setWinnerId(w); setPhase('ended');
      chanRef.current?.broadcast('game_end', { winner_id: w });
    }
  }, [me?.isHost, me?.id, rival?.id]);

  const processMarkRef = useRef(processMarkRequest);
  processMarkRef.current = processMarkRequest;

  // Host: listeners
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('mark_request', (payload) => processMarkRef.current?.(payload));
    channel.onBroadcast('request_state', () => {
      if (difficulty) channel.broadcast('setup', { difficulty, ballsData: ballsDataRef.current });
      if (stateRef.current) channel.broadcast('state', stateRef.current);
      channel.broadcast('phase', { phase });
    });
    channel.onBroadcast('forfeit_request', () => {
      if (reportedRef.current || !me?.id) return;
      setWinnerId(me.id); setPhase('ended');
      channel.broadcast('game_end', { winner_id: me.id });
    });
  }, [me?.isHost, channel?.isConnected, me?.id, rival?.id, difficulty, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Host: arranca automáticamente con la dificultad fija en cuanto se conecta.
  // No hay selección manual — el duelo es siempre el mismo formato.
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    if (startedRef.current) return;
    startedRef.current = true;
    startWithDifficulty(FIXED_DIFFICULTY);
  }, [me?.isHost, channel?.isConnected, startWithDifficulty]);

  // Si restauramos un checkpoint mid-game, el host re-emite setup+state y la
  // fase 'playing' al canal en cuanto se conecta para que el guest (que pudo
  // no haber refrescado) reciba el estado más reciente.
  useEffect(() => {
    if (!restoredCheckpoint) return;
    if (!me?.isHost || !channel?.isConnected) return;
    if (!ballsData || !difficulty || !state) return;
    channel.broadcast('setup', { difficulty, ballsData });
    channel.broadcast('state', state);
    channel.broadcast('phase', { phase: 'playing' });
  }, [restoredCheckpoint, me?.isHost, channel?.isConnected, ballsData, difficulty, state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persistencia: guarda el progreso del duelo cada vez que cambia algo
  // relevante. Al terminar (phase 'ended') borra la entrada.
  useEffect(() => {
    if (!duelId) return;
    if (phase === 'ended') { clearCheckpoint(duelId); return; }
    if (phase === 'connecting') return; // todavía nada que guardar
    if (!ballsData || !difficulty || !state) return;
    saveCheckpoint(duelId, { phase, difficulty, ballsData, state, winnerId });
  }, [duelId, phase, difficulty, ballsData, state, winnerId]);

  // ============ GUEST ============

  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('setup', ({ difficulty: d, ballsData: bd }) => {
      setDifficulty(d); setBallsData(bd);
    });
    channel.onBroadcast('state', (s) => setState(s));
    channel.onBroadcast('phase', ({ phase: p, countdown: c }) => {
      if (p) setPhase(p);
      if (c !== undefined) setCountdown(c > 0 ? c : null);
    });
    channel.onBroadcast('game_end', ({ winner_id }) => {
      setWinnerId(winner_id); setPhase('ended');
    });
    // Pedir estado al entrar
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id]);

  // ============ Host reporta resultado ============
  useEffect(() => {
    if (!me?.isHost || phase !== 'ended' || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    // mode 'duel' para que NO cuente como intento de examen en la tarea.
    onGameComplete?.({ mode: 'duel', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0 });
  }, [me?.isHost, phase, winnerId, reportResult, onGameComplete]);

  // ============ Forfeit handler (igual que otros duelos) ============
  const meRef = useRef(me); meRef.current = me;
  const rivalRef = useRef(rival); rivalRef.current = rival;
  const reportResultRef = useRef(reportResult); reportResultRef.current = reportResult;

  useEffect(() => {
    if (!registerDuelExit) return;
    if (phase === 'ended') { registerDuelExit(null); return; }
    if (!me?.id || !rival?.id) { registerDuelExit(null); return; }
    const forfeit = async () => {
      const m = meRef.current; const rv = rivalRef.current; const ch = chanRef.current;
      if (!m || !rv) return;
      if (m.isHost) {
        try { await reportResultRef.current?.(rv.id); } catch (_) { /* ignore */ }
        ch?.broadcast('game_end', { winner_id: rv.id });
      } else {
        ch?.broadcast('forfeit_request', { from: m.id });
        await new Promise(r => setTimeout(r, 1200));
      }
    };
    registerDuelExit(forfeit);
    return () => registerDuelExit(null);
  }, [registerDuelExit, phase, me?.id, me?.isHost, rival?.id]);

  // ============ Física Matter.js (ambos jugadores) ============
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const ballBodiesRef = useRef([]); // array aligned by index === ballId

  // Inicializar matter cuando tenemos ballsData y estamos en countdown o playing
  useEffect(() => {
    if (!ballsData || !difficulty) return;
    if (phase !== 'countdown' && phase !== 'playing') return;
    const container = sceneRef.current;
    if (!container) return;

    const Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner,
          Bodies = Matter.Bodies, Composite = Matter.Composite, Events = Matter.Events, Query = Matter.Query;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = container.clientWidth;
    const height = 700; // tablero más grande que la versión 1P

    const render = Render.create({
      element: container, engine,
      options: { width, height, wireframes: false, background: 'transparent', pixelRatio: 1, showSleeping: false },
    });

    const boxSize = Math.min(620, width - 40);
    const wallThickness = 40;
    const centerX = width / 2;
    const centerY = height / 2;
    const wallStyle = { fillStyle: '#334155', strokeStyle: '#334155', lineWidth: 1 };
    const wallOptions = { isStatic: true, render: wallStyle, friction: 1, restitution: 0.2 };

    const offset = (boxSize - wallThickness) / 2;
    const floor   = Bodies.rectangle(centerX, centerY + offset, boxSize, wallThickness, wallOptions);
    const ceiling = Bodies.rectangle(centerX, centerY - offset, boxSize, wallThickness, wallOptions);
    const sideH   = boxSize - 2 * wallThickness;
    const leftW   = Bodies.rectangle(centerX - offset, centerY, wallThickness, sideH, wallOptions);
    const rightW  = Bodies.rectangle(centerX + offset, centerY, wallThickness, sideH, wallOptions);

    const boxComp = Composite.create();
    Composite.add(boxComp, [floor, ceiling, leftW, rightW]);
    Composite.add(engine.world, boxComp);

    // Bolas (más grandes que la versión 1P)
    const sortedVals = [...ballsData].map(b => b.value).sort((a, b) => a - b);
    const minV = sortedVals[0], maxV = sortedVals[sortedVals.length - 1];
    const range = maxV - minV || 1;
    const balls = ballsData.map((data) => {
      let size;
      if (difficulty.randomSize) {
        size = 35 + data.sizeFactor * 40; // 35-75
      } else {
        const factor = (data.value - minV) / range;
        size = 35 + factor * 40;
      }
      return Bodies.circle(
        centerX + (data.x0 - 0.5) * 220,
        centerY + (data.y0 - 0.5) * 220,
        size,
        {
          restitution: 0.9, friction: 0.01, frictionAir: 0.01, density: 0.04,
          label: 'ball',
          plugin: { id: data.id, value: data.value, text: data.label },
          render: { fillStyle: '#3b82f6', strokeStyle: '#1d4ed8', lineWidth: 3 },
        }
      );
    });
    ballBodiesRef.current = balls;
    Composite.add(engine.world, balls);

    // Click handler
    const onClick = (event) => {
      if (stateRef.current?.remaining?.length === 0) return;
      const phaseNow = phase;
      if (phaseNow !== 'playing') return;
      const rect = render.canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const hit = Query.point(balls, { x: clickX, y: clickY }).find(b => b.label === 'ball');
      if (!hit) return;
      const id = hit.plugin.id;
      if (stateRef.current?.marks?.[id]) return;
      if (me?.isHost) {
        processMarkRef.current?.({ ballId: id, by: me.id });
      } else {
        chanRef.current?.broadcast('mark_request', { ballId: id, by: me.id });
      }
    };
    render.canvas.addEventListener('pointerdown', onClick);

    // Rotación
    Events.on(engine, 'beforeUpdate', () => {
      const rot = (difficulty.rotation || 0) * 0.001;
      if (rot > 0) Composite.rotate(boxComp, rot, { x: centerX, y: centerY });
    });

    // Etiquetas + marcas visuales
    Events.on(render, 'afterRender', () => {
      const ctx = render.context; if (!ctx) return;
      ctx.globalAlpha = 1;
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const marks = stateRef.current?.marks || {};
      balls.forEach(ball => {
        const mk = marks[ball.plugin.id];
        if (mk) {
          ball.render.fillStyle = '#334155';
          ball.render.strokeStyle = '#0f172a';
        }
        const { x, y } = ball.position;
        ctx.fillStyle = mk ? '#e2e8f0' : 'white';
        ctx.fillText(ball.plugin.text, x, y);
      });
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
      if (render.canvas) {
        render.canvas.removeEventListener('pointerdown', onClick);
        render.canvas.remove();
      }
      Render.stop(render);
      Runner.stop(runner);
      if (engineRef.current) {
        Composite.clear(engineRef.current.world);
        Engine.clear(engineRef.current);
      }
    };
  }, [ballsData, difficulty, phase, me?.id, me?.isHost]);

  if (duel.err) return <Err text={duel.err} />;
  if (duel.loading || !me || !rival) return <Loading />;

  const myScore    = state?.scores?.[me.id] ?? 0;
  const rivalScore = state?.scores?.[rival.id] ?? 0;
  const nextTarget = state?.remaining?.[0];

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-4 gap-4">
      {/* Header con avatares enfrentados (sustituye a la barra plana de antes) */}
      <div className="w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden border border-indigo-200">
        <div className="flex items-stretch bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
          <PlayerHeader
            side="left"
            avatarCode={me.selectedAvatarCode}
            avatarEmoji={me.emoji}
            avatarColor={me.color}
            name="Tú"
            sub={me.name}
            score={myScore}
            scoreColor="bg-emerald-400 text-emerald-900"
          />
          <div className="flex flex-col items-center justify-center px-3 py-2 bg-black/20">
            <Swords className="w-5 h-5 mb-1 opacity-90" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Ordena Bolas</span>
            <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 text-white shadow">
              {BALL_COUNT} bolas
            </span>
          </div>
          <PlayerHeader
            side="right"
            avatarCode={rival.hidden ? null : rival.selectedAvatarCode}
            avatarEmoji={rival.emoji}
            avatarColor={rival.hidden ? null : rival.color}
            name={rival.hidden ? 'Rival' : rival.name}
            sub={rival.hidden ? 'Oculto' : ' '}
            score={rivalScore}
            scoreColor="bg-rose-400 text-rose-900"
          />
        </div>
      </div>

      {phase === 'connecting' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 text-white"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
               style={{ background: 'radial-gradient(circle at 20% 0%, rgba(244,114,182,0.7), transparent 60%), radial-gradient(circle at 80% 100%, rgba(56,189,248,0.6), transparent 60%)' }} />

          <div className="relative p-6">
            <div className="grid grid-cols-3 items-center gap-3 mb-4">
              <DuelistCard
                avatarCode={me.selectedAvatarCode}
                avatarEmoji={me.emoji}
                avatarColor={me.color}
                name={me.name}
                tag="Tú"
                tagClass="bg-emerald-400/90 text-emerald-950"
                from="left"
              />
              <div className="flex flex-col items-center justify-center select-none">
                <motion.div
                  initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
                  className="text-5xl sm:text-6xl font-black drop-shadow-lg"
                  style={{ background: 'linear-gradient(180deg, #fde68a, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  VS
                </motion.div>
                <Sparkles className="w-4 h-4 text-amber-300 mt-1 animate-pulse" />
              </div>
              <DuelistCard
                avatarCode={rival.hidden ? null : rival.selectedAvatarCode}
                avatarEmoji={rival.emoji}
                avatarColor={rival.hidden ? null : rival.color}
                name={rival.hidden ? 'Oculto' : rival.name}
                tag="Rival"
                tagClass="bg-rose-400/90 text-rose-950"
                from="right"
              />
            </div>
            <p className="text-sm text-center text-white/90">
              {BALL_COUNT} bolas con números, de menor a mayor. El primero en marcar correctamente gana el punto; si falla, el rival se lleva el punto.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-white/80 text-xs">
              <span className="animate-pulse">Preparando partida…</span>
              <span className="inline-flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-white"
                  />
                ))}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {(phase === 'countdown' || phase === 'playing' || phase === 'ended') && (
        <div className="relative w-full max-w-4xl">
          {phase === 'playing' && nextTarget != null && difficulty?.showNext && (
            <div className="text-center mb-2">
              <span className="text-xs uppercase text-slate-500 tracking-widest">Siguiente valor</span>
              <div className="text-2xl font-black text-indigo-700">
                {ballsData?.find(b => b.value === nextTarget)?.label} <span className="text-slate-400 text-base font-bold">(= {nextTarget})</span>
              </div>
            </div>
          )}
          <div ref={sceneRef} className="w-full h-[700px] cursor-pointer rounded-xl overflow-hidden bg-slate-50/30" />

          <AnimatePresence>
            {countdown != null && countdown > 0 && (
              <motion.div key={countdown}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: 140, fontWeight: 900, color: '#fbbf24', textShadow: '0 0 40px #f59e0b' }}>
                  {countdown}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'ended' && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4 border-2 ${winnerId === me.id ? 'border-emerald-500' : 'border-rose-500'}`}>
                <Trophy className={`w-14 h-14 mx-auto mb-2 ${winnerId === me.id ? 'text-emerald-500' : 'text-rose-400'}`} />
                <h3 className={`text-2xl font-black ${winnerId === me.id ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {winnerId === me.id ? '¡Has ganado!' : 'Has perdido'}
                </h3>
                <div className="grid grid-cols-2 gap-4 my-4">
                  <div><div className="text-3xl font-black text-emerald-600">{myScore}</div><div className="text-xs text-slate-400 uppercase">Tú</div></div>
                  <div><div className="text-3xl font-black text-rose-500">{rivalScore}</div><div className="text-xs text-slate-400 uppercase">Rival</div></div>
                </div>
                <Button onClick={() => navigate('/mi-panel')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <LogOut className="w-4 h-4 mr-2" /> Salir a mi panel
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      )}

      <div className="max-w-3xl text-center text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 mr-3"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> acierto → punto para quien marca</span>
        <span className="inline-flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-500" /> fallo → punto para el rival</span>
      </div>

      {/* Botón flotante de frases (chat predefinido) + bocadillo del rival.
          Se autoposiciona (fixed); no necesita wrapper. */}
      <DuelChatBar channel={channel} me={me} rival={rival} />
    </div>
  );
}

function PlayerHeader({ side, avatarCode, avatarEmoji, avatarColor, name, sub, score, scoreColor }) {
  return (
    <div className={`flex-1 flex items-center gap-3 px-4 py-3 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <UserAvatar
        selectedAvatarCode={avatarCode}
        avatarEmoji={avatarEmoji}
        avatarColor={avatarColor}
        size="md"
        showRarityBorder={false}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">{name}</p>
        {sub && <p className="text-sm font-bold truncate">{sub}</p>}
      </div>
      <span className={`shrink-0 px-2.5 py-1 rounded-lg font-black text-sm shadow ${scoreColor}`}>{score}</span>
    </div>
  );
}

function DuelistCard({ avatarCode, avatarEmoji, avatarColor, name, tag, tagClass, from }) {
  const initial = from === 'left' ? { x: -50, opacity: 0 } : { x: 50, opacity: 0 };
  return (
    <motion.div
      initial={initial}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-2xl opacity-50"
             style={{ background: from === 'left' ? '#22d3ee' : '#f472b6' }} />
        <div className="relative">
          <UserAvatar
            selectedAvatarCode={avatarCode}
            avatarEmoji={avatarEmoji}
            avatarColor={avatarColor}
            size="hero"
            showRarityGlow
          />
        </div>
      </div>
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tagClass}`}>
        {tag}
      </span>
      <p className="text-sm font-bold truncate max-w-[160px]">{name}</p>
    </motion.div>
  );
}

function Loading() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>; }
function Err({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
