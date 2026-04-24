import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { Swords, Trophy, X, LogOut, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useDuel from '@/hooks/useDuel';

const BALL_COUNT = 21;

const DIFFICULTIES = [
  { id: 'easy',      label: 'Fácil',     ops: ['numbers'],                                           rotation: 2, randomSize: false, showNext: true,  emoji: '🟢', color: 'from-emerald-500 to-emerald-600', ring: '#10b981' },
  { id: 'medium',    label: 'Medio',     ops: ['numbers','add','sub'],                               rotation: 4, randomSize: false, showNext: true,  emoji: '🔵', color: 'from-blue-500 to-blue-600',       ring: '#3b82f6' },
  { id: 'hard',      label: 'Difícil',   ops: ['numbers','add','sub','mul','div'],                   rotation: 6, randomSize: false, showNext: false, fixedOps: { add: 1, sub: 1, mul: 1, div: 1 }, emoji: '🟠', color: 'from-amber-500 to-orange-600', ring: '#f59e0b' },
  { id: 'nightmare', label: 'Pesadilla', ops: ['numbers','add','sub','mul','div','pow','sqrt','eq'], rotation: 8, randomSize: true,  showNext: false, emoji: '💀', color: 'from-rose-600 to-rose-900', ring: '#e11d48' },
];

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
  const { me, rival, channel, reportResult } = duel;

  // Estado síncrono
  const [phase, setPhase] = useState('picking'); // picking | countdown | playing | ended
  const [difficulty, setDifficulty] = useState(null); // object
  const [ballsData, setBallsData] = useState(null); // [{id, value, label, x0, y0, sizeFactor}]
  const [state, setState] = useState(null); // { marks: {id:{by,correct}}, scores: {uid: n}, remaining: [vals sorted asc] }
  const [winnerId, setWinnerId] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const reportedRef = useRef(false);

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
      <div className="w-full max-w-4xl flex items-center gap-3 bg-white/90 dark:bg-slate-800/90 rounded-2xl px-4 py-3 shadow-lg border border-indigo-100">
        <Swords className="w-5 h-5 text-indigo-600" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Ordena las Bolas · Duelo</h2>
        {difficulty && phase !== 'picking' && (
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${difficulty.color}`}>
            {difficulty.emoji} {difficulty.label}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-sm border border-emerald-200">
            Tú · {myScore}
          </span>
          <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 font-black text-sm border border-rose-200">
            {rival.hidden ? 'Rival' : rival.name} · {rivalScore}
          </span>
        </div>
      </div>

      {phase === 'picking' && (
        <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-indigo-100">
          {me.isHost ? (
            <>
              <h3 className="text-xl font-black text-slate-800 mb-1 text-center">Elige la dificultad</h3>
              <p className="text-sm text-slate-500 text-center mb-4">21 bolas, de menor a mayor. El primero en marcar correctamente gana el punto. Si falla, el rival se lleva el punto.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTIES.map(d => (
                  <button key={d.id}
                    onClick={() => startWithDifficulty(d)}
                    className={`p-4 rounded-xl text-white font-black flex flex-col items-center gap-1 bg-gradient-to-br ${d.color} hover:scale-[1.03] transition-transform shadow-lg`}>
                    <span className="text-3xl">{d.emoji}</span>
                    <span className="uppercase tracking-wide text-sm">{d.label}</span>
                    <span className="text-[10px] font-medium opacity-90 text-center leading-tight mt-1">
                      {d.ops.length === 1 ? 'Solo números' :
                       d.ops.length === 3 ? 'Sumas y restas' :
                       d.ops.length === 5 ? '+ Multiplicación y división' :
                       'Todo, con tamaño engañoso'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse text-3xl mb-3">⏳</div>
              <p className="font-bold text-slate-700">Esperando a que el retador elija la dificultad…</p>
            </div>
          )}
        </div>
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
    </div>
  );
}

function Loading() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>; }
function Err({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
