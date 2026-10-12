import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import { Swords, Trophy, LogOut, Target } from 'lucide-react';
import useDuel from '@/hooks/useDuel';
import UserAvatar from '@/components/ui/UserAvatar';
import DuelChatBar from '@/components/duel/DuelChatBar';
import { GameShell, GameHeader, Chip, GameButton, GameLoading, GameEmpty } from '../_shared/kit';
import { drawBall3D, drawBallLabel, drawWalls } from './ballFx';
import './OrdenaBolas.css';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // pixelRatio: nitidez en pantallas densas (solo dibujo; el mundo sigue en px CSS)
      options: { width, height, wireframes: false, background: 'transparent', pixelRatio: Math.min(2, window.devicePixelRatio || 1), showSleeping: false },
    });

    const boxSize = Math.min(620, width - 40);
    const wallThickness = 40;
    const centerX = width / 2;
    const centerY = height / 2;
    const wallStyle = { fillStyle: '#4f46e5', strokeStyle: '#c7d2fe', lineWidth: 1 };
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
          render: { fillStyle: '#3b82f6', strokeStyle: '#1d4ed8', lineWidth: 0 }, // contorno: drawBall3D
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

    // Etiquetas + marcas visuales (solo dibujo): recipiente con volumen y
    // esferas coloreadas según quién las marcó (cian = tú, rosa = rival,
    // gris = marcada por error).
    Events.on(render, 'afterRender', () => {
      const ctx = render.context; if (!ctx) return;
      ctx.globalAlpha = 1;
      const marks = stateRef.current?.marks || {};
      drawWalls(ctx, [floor, ceiling, leftW, rightW]);
      balls.forEach(ball => {
        const mk = marks[ball.plugin.id];
        const tone = !mk ? 'idle' : !mk.correct ? 'miss' : (mk.by === me?.id ? 'mine' : 'rival');
        const { x, y } = ball.position;
        drawBall3D(ctx, ball, { tone, pixelRatio: render.options.pixelRatio });
        drawBallLabel(ctx, ball.plugin.text, x, y, mk ? '#f1f5f9' : 'white', ball.circleRadius * 1.7, 22);
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

  const shellProps = { accent: '#f43f5e', accent2: '#6366f1', className: 'ob' };

  if (duel.err) return <Err text={duel.err} shellProps={shellProps} />;
  if (duel.loading || !me || !rival) return <Loading shellProps={shellProps} />;

  const myScore    = state?.scores?.[me.id] ?? 0;
  const rivalScore = state?.scores?.[rival.id] ?? 0;
  const nextTarget = state?.remaining?.[0];
  const iWon = winnerId === me.id;

  return (
    <GameShell {...shellProps}>
      <GameHeader compact right={<Chip tone="accent" icon={Swords}>Duelo · {BALL_COUNT} bolas</Chip>} />

      {/* Marcador con avatares enfrentados */}
      <div className="ob-duel-head">
        <PlayerHeader
          avatarCode={me.selectedAvatarCode}
          avatarEmoji={me.emoji}
          avatarColor={me.color}
          name="Tú"
          sub={me.name}
          score={myScore}
        />
        <span className="ob-vs" aria-hidden="true">VS</span>
        <PlayerHeader
          rivalSide
          avatarCode={rival.hidden ? null : rival.selectedAvatarCode}
          avatarEmoji={rival.emoji}
          avatarColor={rival.hidden ? null : rival.color}
          name={rival.hidden ? 'Rival' : rival.name}
          sub={rival.hidden ? 'Oculto' : 'Rival'}
          score={rivalScore}
        />
      </div>

      {phase === 'connecting' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="ob-lobby"
        >
          <div className="ob-lobby__row">
            <DuelistCard
              avatarCode={me.selectedAvatarCode}
              avatarEmoji={me.emoji}
              avatarColor={me.color}
              name={me.name}
              tag="Tú"
              from="left"
            />
            <motion.span
              initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
              className="ob-lobby__vs"
            >
              VS
            </motion.span>
            <DuelistCard
              avatarCode={rival.hidden ? null : rival.selectedAvatarCode}
              avatarEmoji={rival.emoji}
              avatarColor={rival.hidden ? null : rival.color}
              name={rival.hidden ? 'Oculto' : rival.name}
              tag="Rival"
              rival
              from="right"
            />
          </div>
          <p>
            {BALL_COUNT} bolas con números, de menor a mayor. El primero en marcar correctamente gana el punto; si falla, el rival se lleva el punto.
          </p>
          <GameLoading label="Preparando partida…" />
        </motion.div>
      )}

      {(phase === 'countdown' || phase === 'playing' || phase === 'ended') && (
        <>
          {phase === 'playing' && nextTarget != null && difficulty?.showNext && (
            <div className="ob-next">
              <small><Target size={13} /> Siguiente valor</small>
              <span className="ob-next__ball">{ballsData?.find(b => b.value === nextTarget)?.label}</span>
              <span className="ob-next__eq">= {nextTarget}</span>
            </div>
          )}
          <div className="ob-stage">
            <div ref={sceneRef} className="ob-scene ob-scene--duel" />

            <AnimatePresence>
              {countdown != null && countdown > 0 && (
                <motion.div key={countdown}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ob-countdown">
                  <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                    {countdown}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === 'ended' && (
              <div className="ob-result">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`ob-duel-end ${iWon ? '' : 'is-lost'}`}
                >
                  <span className="ob-duel-end__badge"><Trophy size={36} /></span>
                  <strong className="ob-duel-end__title">{iWon ? '¡Has ganado!' : 'Has perdido'}</strong>
                  <div className="ob-duel-end__scores">
                    <span className="ob-duel-end__score is-me"><b>{myScore}</b><small>Tú</small></span>
                    <span className="ob-duel-end__score is-rival"><b>{rivalScore}</b><small>Rival</small></span>
                  </div>
                  <GameButton size="lg" icon={LogOut} onClick={() => navigate('/mi-panel')}>Salir a mi panel</GameButton>
                </motion.div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="ob-legend">
        <span><i style={{ '--d': '#06b6d4' }} /> Acierto tuyo: punto para ti</span>
        <span><i style={{ '--d': '#ec4899' }} /> Acierto del rival</span>
        <span><i style={{ '--d': '#64748b' }} /> Fallo: punto para el otro</span>
      </div>

      {/* Botón flotante de frases (chat predefinido) + bocadillo del rival.
          Se autoposiciona (fixed); no necesita wrapper. */}
      <DuelChatBar channel={channel} me={me} rival={rival} />
    </GameShell>
  );
}

function PlayerHeader({ avatarCode, avatarEmoji, avatarColor, name, sub, score, rivalSide = false }) {
  return (
    <div className={`ob-player ${rivalSide ? 'ob-player--rival' : ''}`}>
      <UserAvatar
        selectedAvatarCode={avatarCode}
        avatarEmoji={avatarEmoji}
        avatarColor={avatarColor}
        size="md"
        showRarityBorder={false}
      />
      <div className="ob-player__info">
        <span className="ob-player__tag">{name}</span>
        {sub && <span className="ob-player__name">{sub}</span>}
      </div>
      <span key={score} className="ob-player__score">{score}</span>
    </div>
  );
}

function DuelistCard({ avatarCode, avatarEmoji, avatarColor, name, tag, rival = false, from }) {
  const initial = from === 'left' ? { x: -50, opacity: 0 } : { x: 50, opacity: 0 };
  return (
    <motion.div
      initial={initial}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="ob-duelist"
    >
      <UserAvatar
        selectedAvatarCode={avatarCode}
        avatarEmoji={avatarEmoji}
        avatarColor={avatarColor}
        size="hero"
        showRarityGlow
      />
      <span className={`ob-duelist__tag ${rival ? 'is-rival' : ''}`}>{tag}</span>
      <span className="ob-duelist__name">{name}</span>
    </motion.div>
  );
}

function Loading({ shellProps }) {
  return <GameShell {...shellProps}><GameLoading label="Conectando con tu rival…" /></GameShell>;
}
function Err({ text, shellProps }) {
  return <GameShell {...shellProps}><GameEmpty title="No se puede jugar el duelo">{text}</GameEmpty></GameShell>;
}
