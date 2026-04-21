import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Zap, Rocket, BookOpen, X, Shuffle, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRunnerData } from '@/services/gameDataService';
import './NavePalabras.css';

const ARENA_W = 800;
const ARENA_H = 520;
const SHIP_W = 70;
const SHIP_H = 36;
// Velocidades en px/seg para ser independientes del framerate (dt-based loop).
const SHIP_SPEED_PXS = 420;      // antes 7 px/frame · 60 = 420 px/s
const PROJ_W = 4;
const PROJ_H = 14;
const PROJ_SPEED_PXS = 720;      // antes 12 px/frame · 60
const WORD_H = 36;
const WORD_SPEED_MIN_PXS = 72;   // antes 1.2 px/frame · 60
const WORD_SPEED_MAX_PXS = 144;  // antes 2.4 px/frame · 60
const GAME_DURATION_MS = 60000;
const BASE_FIRE_MS = 260;
const BASE_SPAWN_MS = 650;
const FLOOR_Y = ARENA_H - 70;

const POWERS = [
  { id: 'rapid',    label: 'Disparo rápido', color: '#22d3ee', icon: '⚡', duration: 6000 },
  { id: 'spawn',    label: 'Lluvia de palabras', color: '#a78bfa', icon: '🌧️', duration: 6000 },
  { id: 'double',   label: 'Puntos x2', color: '#fbbf24', icon: '✨', duration: 8000 },
];

// Penalización por fallos: hasta 3 niveles acumulables.
// Cada fallo resta velocidad y encarece la cadencia. Se recupera un nivel
// por cada 5 aciertos seguidos (combo).
const MAX_PENALTY = 3;
const COMBO_TO_RECOVER = 5;
// La velocidad de la nave es SIEMPRE la misma para todos los jugadores.
// El castigo por fallo afecta SOLO a la cadencia de disparo.
// Al 3er fallo disparas 3× más lento. Recuperas con 5 aciertos seguidos.
const PENALTY_FIRE = [1.00, 1.60, 2.20, 3.00];

// 5 naves con diseños detallados y animaciones sutiles pero únicas
// Cada `render(gradId, color, accent)` devuelve los elementos SVG completos.
export const SHIPS = [
  {
    id: 0, name: 'Clásica', color: '#22d3ee', accent: '#0e7490',
    render: (g, c, a) => (
      <>
        {/* Alerones laterales */}
        <path d="M4 15 L11 19 L11 23 L4 20 Z" fill={a} />
        <path d="M66 15 L59 19 L59 23 L66 20 Z" fill={a} />
        {/* Casco principal */}
        <path d="M35 2 L60 20 L50 30 L35 24 L20 30 L10 20 Z"
          fill={`url(#${g})`} stroke={a} strokeWidth="1.4" strokeLinejoin="round" />
        {/* Línea de chasis */}
        <path d="M15 22 L55 22" stroke={a} strokeWidth="0.7" opacity="0.55" />
        {/* Dos llamas traseras */}
        <rect x="22" y="30" width="5" height="5" rx="1" fill="#fde047" className="np-flame-a" />
        <rect x="43" y="30" width="5" height="5" rx="1" fill="#fde047" className="np-flame-b" />
        {/* Aura de cabina */}
        <circle cx="35" cy="18" r="7" fill={c} opacity="0.25" className="np-halo" />
        <circle cx="35" cy="18" r="4" fill="#fff" />
        <circle cx="35" cy="18" r="2" fill={c} />
      </>
    ),
  },
  {
    id: 1, name: 'Interceptor', color: '#f472b6', accent: '#be185d',
    render: (g, c, a) => (
      <>
        {/* Casco con alas barridas */}
        <path d="M35 3 L48 12 L64 22 L52 28 L40 26 L35 30 L30 26 L18 28 L6 22 L22 12 Z"
          fill={`url(#${g})`} stroke={a} strokeWidth="1.4" strokeLinejoin="round" />
        {/* Detalle de alerón */}
        <path d="M18 28 L30 26 L40 26 L52 28" stroke={a} strokeWidth="0.9" fill="none" opacity="0.7" />
        {/* Canopy (ventana) */}
        <path d="M30 14 Q35 9 40 14 L40 22 L30 22 Z" fill="#fff" opacity="0.9" />
        <path d="M30 14 Q35 11 40 14 L40 20 L30 20 Z" fill={c} opacity="0.55" />
        {/* Luces de ala parpadeantes */}
        <circle cx="7" cy="22" r="1.4" fill="#ef4444" className="np-blink-a" />
        <circle cx="63" cy="22" r="1.4" fill="#ef4444" className="np-blink-b" />
        {/* Motor central */}
        <rect x="32" y="30" width="6" height="4" rx="1" fill="#fde047" className="np-flame-a" />
      </>
    ),
  },
  {
    id: 2, name: 'Bombardero', color: '#fbbf24', accent: '#b45309',
    render: (g, c, a) => (
      <>
        {/* Casco pesado */}
        <path d="M22 4 H48 L58 14 V24 L48 32 H22 L12 24 V14 Z"
          fill={`url(#${g})`} stroke={a} strokeWidth="1.5" strokeLinejoin="round" />
        {/* Placas de blindaje */}
        <rect x="17" y="9" width="36" height="18" fill={a} opacity="0.25" />
        <line x1="35" y1="6" x2="35" y2="30" stroke={a} strokeWidth="0.8" opacity="0.55" />
        <line x1="17" y1="18" x2="53" y2="18" stroke={a} strokeWidth="0.6" opacity="0.4" />
        {/* Ventana de cabina */}
        <rect x="28" y="12" width="14" height="8" rx="1" fill="#fff" opacity="0.9" />
        <rect x="28" y="12" width="14" height="4" rx="1" fill={c} opacity="0.55" />
        {/* Cuatro propulsores alternantes */}
        <rect x="14" y="30" width="5" height="4" fill="#fde047" className="np-thrust-a" />
        <rect x="22" y="30" width="5" height="4" fill="#fde047" className="np-thrust-b" />
        <rect x="43" y="30" width="5" height="4" fill="#fde047" className="np-thrust-b" />
        <rect x="51" y="30" width="5" height="4" fill="#fde047" className="np-thrust-a" />
      </>
    ),
  },
  {
    id: 3, name: 'Sigilo', color: '#10b981', accent: '#065f46',
    render: (g, c, a) => (
      <>
        {/* Triángulo furtivo */}
        <path d="M35 2 L62 30 L35 24 L8 30 Z"
          fill={`url(#${g})`} stroke={a} strokeWidth="1.4" strokeLinejoin="round" className="np-shimmer" />
        {/* Franja interior */}
        <path d="M35 8 L52 26 L35 22 L18 26 Z" fill={a} opacity="0.4" />
        {/* Canopy bajo perfil */}
        <path d="M30 18 Q35 14 40 18 L40 22 L30 22 Z" fill="#fff" opacity="0.8" />
        <path d="M30 18 Q35 16 40 18 L40 21 L30 21 Z" fill={c} opacity="0.5" />
        {/* Contornos brillantes */}
        <path d="M35 2 L62 30" stroke={c} strokeWidth="0.7" opacity="0.55" className="np-shimmer-line-a" />
        <path d="M35 2 L8 30"  stroke={c} strokeWidth="0.7" opacity="0.55" className="np-shimmer-line-b" />
      </>
    ),
  },
  {
    id: 4, name: 'Rayo', color: '#a78bfa', accent: '#5b21b6',
    render: (g, c, a) => (
      <>
        {/* Casco en forma de filo */}
        <path d="M35 0 L45 10 L52 20 L40 30 L35 28 L30 30 L18 20 L25 10 Z"
          fill={`url(#${g})`} stroke={a} strokeWidth="1.4" strokeLinejoin="round" />
        {/* Líneas de velocidad */}
        <line x1="3"  y1="17" x2="16" y2="19" stroke={c} strokeWidth="1" strokeLinecap="round" className="np-trail-a" />
        <line x1="54" y1="19" x2="67" y2="17" stroke={c} strokeWidth="1" strokeLinecap="round" className="np-trail-b" />
        {/* Motor trasero potente */}
        <rect x="28" y="28" width="14" height="6" rx="1.5" fill="#fde047" />
        <rect x="30" y="29" width="10" height="4" rx="1.2" fill="#ffffff" opacity="0.85" className="np-engine-pulse" />
        {/* Cabina */}
        <circle cx="35" cy="16" r="3" fill="#fff" />
        <circle cx="35" cy="16" r="1.5" fill={c} />
      </>
    ),
  },
];

// 3 modos de juego
const MODES = [
  { id: 'easy',   label: 'Fácil',  desc: 'Pistas marcadas y disparo ágil.', icon: '🟢', color: '#10b981' },
  { id: 'medium', label: 'Medio',  desc: 'Con pistas de color en las palabras objetivo.', icon: '🟡', color: '#fbbf24' },
  { id: 'exam',   label: 'Examen', desc: 'Sin pistas. La sesión cuenta para tareas.', icon: '🔴', color: '#ef4444' },
];

function rnd(min, max) { return min + Math.random() * (max - min); }
function formatName(n) { return (n || '').replace(/_/g, ' ').toUpperCase(); }

function estimateTextWidth(text) {
  // approx 10px per char at 14px font-weight 700 + 24 padding
  return Math.max(80, Math.min(240, text.length * 10 + 24));
}

export default function NavePalabras({ level, grade, subjectId, onGameComplete }) {
  const arenaRef = useRef(null);
  const completedRef = useRef(false);

  // Config
  const [gameData, setGameData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [targetCat, setTargetCat] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [shipId, setShipId] = useState(0);
  const [mode, setMode] = useState('medium'); // 'easy' | 'medium' | 'exam'

  // State
  const [phase, setPhase] = useState('menu'); // menu | playing | over
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
  const [activePowers, setActivePowers] = useState({}); // {id: expiresAtMs}
  const [penaltyLevel, setPenaltyLevel] = useState(0);
  const [combo, setCombo] = useState(0);
  const [missFlashKey, setMissFlashKey] = useState(0);
  const [, tick] = useState(0);
  const forceRender = () => tick(v => v + 1);

  // Refs — mutable in loop
  const shipXRef = useRef(ARENA_W / 2 - SHIP_W / 2);
  const wordsRef = useRef([]); // {id, text, category, special, x, y, w, vy}
  const projsRef = useRef([]); // {id, x, y}
  const lastSpawnRef = useRef(0);
  const lastFireRef = useRef(0);
  const keysRef = useRef({ left: false, right: false, fire: false });
  const startTimeRef = useRef(0);
  const powersRef = useRef({});
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const scoreRef = useRef(0);
  const spawnedIdRef = useRef(0);
  const modeRef = useRef(mode);
  const penaltyRef = useRef(0);
  const comboRef = useRef(0);

  const registerMiss = () => {
    comboRef.current = 0;
    setCombo(0);
    if (penaltyRef.current < MAX_PENALTY) {
      penaltyRef.current += 1;
      setPenaltyLevel(penaltyRef.current);
    }
    missesRef.current += 1;
    setMisses(v => v + 1);
    setMissFlashKey(k => k + 1); // dispara flash visual
  };

  const registerHit = () => {
    hitsRef.current += 1;
    setHits(v => v + 1);
    comboRef.current += 1;
    if (comboRef.current >= COMBO_TO_RECOVER) {
      comboRef.current = 0;
      if (penaltyRef.current > 0) {
        penaltyRef.current -= 1;
        setPenaltyLevel(penaltyRef.current);
      }
    }
    setCombo(comboRef.current);
  };

  // Cargar datos
  useEffect(() => {
    if (!level || !grade || !subjectId) return;
    setLoadError(false);
    getRunnerData(level, grade, subjectId)
      .then(data => {
        if (!data || Object.keys(data).length === 0) throw new Error('Sin datos');
        setGameData(data);
        const types = Object.keys(data).filter(k => k !== 'title' && k !== 'instructions');
        if (types.length) setTargetCat(types[Math.floor(Math.random() * types.length)]);
      })
      .catch(() => setLoadError(true));
  }, [level, grade, subjectId]);

  const categories = useMemo(() => {
    if (!gameData) return [];
    return Object.keys(gameData).filter(k => k !== 'title' && k !== 'instructions' && Array.isArray(gameData[k]));
  }, [gameData]);

  const changeCategory = () => {
    if (categories.length <= 1) return;
    const idx = categories.indexOf(targetCat);
    setTargetCat(categories[(idx + 1) % categories.length]);
  };
  const randomCategory = () => {
    if (!categories.length) return;
    setTargetCat(categories[Math.floor(Math.random() * categories.length)]);
  };

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      if (e.repeat) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA')  { keysRef.current.left = true; e.preventDefault(); }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { keysRef.current.right = true; e.preventDefault(); }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { keysRef.current.fire = true; e.preventDefault(); }
    };
    const up = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA')  keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.fire = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Mouse/touch control
  const onPointerMove = (e) => {
    if (phase !== 'playing' || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const scale = ARENA_W / rect.width;
    shipXRef.current = Math.max(0, Math.min(ARENA_W - SHIP_W, (x * scale) - SHIP_W / 2));
  };
  const onPointerDown = (e) => {
    if (phase !== 'playing') return;
    keysRef.current.fire = true;
    onPointerMove(e);
  };
  const onPointerUp = () => { keysRef.current.fire = false; };

  const spawnWord = (now) => {
    if (!gameData || !targetCat) return;
    const types = categories;
    if (!types.length) return;
    // 1/12 chance of special powerup word
    const roll = Math.random();
    const isSpecial = roll < 0.08;
    const power = isSpecial ? POWERS[Math.floor(Math.random() * POWERS.length)] : null;

    // Sesgo hacia la categoría objetivo para que salgan más palabras válidas.
    //   Fácil  → 75% target
    //   Medio  → 60% target
    //   Examen → 50% target
    let catKey;
    if (isSpecial) {
      catKey = targetCat;
    } else {
      const bias = modeRef.current === 'easy' ? 0.75 : modeRef.current === 'exam' ? 0.50 : 0.60;
      if (Math.random() < bias) {
        catKey = targetCat;
      } else {
        const others = types.filter(t => t !== targetCat);
        catKey = others.length ? others[Math.floor(Math.random() * others.length)] : targetCat;
      }
    }
    const list = gameData[catKey] || [];
    if (!list.length) return;
    const text = power ? `${power.icon} ${power.label}` : list[Math.floor(Math.random() * list.length)];
    const w = estimateTextWidth(text);
    const x = rnd(10, ARENA_W - w - 10);
    // vy en px/seg (framerate-independent)
    const vy = rnd(WORD_SPEED_MIN_PXS, WORD_SPEED_MAX_PXS) * (powersRef.current.spawn ? 1.25 : 1);
    wordsRef.current.push({
      id: ++spawnedIdRef.current, text, category: catKey,
      special: power?.id || null,
      x, y: -WORD_H, w, vy, spawnedAt: now,
    });
  };

  const startGame = () => {
    if (!targetCat || !gameData) return;
    modeRef.current = mode;
    setPhase('playing');
    setScore(0); setHits(0); setMisses(0);
    scoreRef.current = 0; hitsRef.current = 0; missesRef.current = 0;
    setActivePowers({}); powersRef.current = {};
    wordsRef.current = []; projsRef.current = [];
    shipXRef.current = ARENA_W / 2 - SHIP_W / 2;
    lastSpawnRef.current = 0; lastFireRef.current = 0;
    startTimeRef.current = performance.now();
    completedRef.current = false;
    setTimeLeftMs(GAME_DURATION_MS);
    penaltyRef.current = 0; comboRef.current = 0;
    setPenaltyLevel(0); setCombo(0);
  };

  const endGame = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('over');
    const correct = hitsRef.current;
    // Examen → 'test' (cuenta para tareas). Fácil/Medio → 'practice'.
    const reportedMode = modeRef.current === 'exam' ? 'test' : 'practice';
    onGameComplete?.({
      mode: reportedMode,
      score: scoreRef.current,
      maxScore: Math.max(scoreRef.current, 500),
      correctAnswers: correct,
      totalQuestions: 10, // objetivo para nota: 10 aciertos = 10/10
      durationSeconds: Math.round(GAME_DURATION_MS / 1000),
    });
  }, [onGameComplete]);

  // Game loop — framerate-independent con deltaTime
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf;
    let lastNow = 0;
    const loop = (now) => {
      if (!lastNow) lastNow = now;
      // dt en segundos, capado a 100ms para proteger del tab background
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;

      // timer
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, GAME_DURATION_MS - elapsed);
      setTimeLeftMs(remaining);
      if (remaining <= 0) { endGame(); return; }

      // expire powers
      const curPow = { ...powersRef.current };
      let changed = false;
      for (const id of Object.keys(curPow)) {
        if (curPow[id] <= now) { delete curPow[id]; changed = true; }
      }
      if (changed) { powersRef.current = curPow; setActivePowers(curPow); }

      // ship movement — velocidad fija e idéntica para todos los jugadores
      const step = SHIP_SPEED_PXS * dt;
      if (keysRef.current.left)  shipXRef.current = Math.max(0, shipXRef.current - step);
      if (keysRef.current.right) shipXRef.current = Math.min(ARENA_W - SHIP_W, shipXRef.current + step);

      // fire: Fácil dispara un 30% más rápido por defecto; penalización lo ralentiza
      const modeFactor = modeRef.current === 'easy' ? 0.7 : 1;
      const penFire = PENALTY_FIRE[penaltyRef.current] || 1;
      const fireInterval = Math.round((powersRef.current.rapid ? BASE_FIRE_MS / 2.5 : BASE_FIRE_MS) * modeFactor * penFire);
      if (keysRef.current.fire && now - lastFireRef.current > fireInterval) {
        lastFireRef.current = now;
        projsRef.current.push({
          id: ++spawnedIdRef.current,
          x: shipXRef.current + SHIP_W / 2 - PROJ_W / 2,
          y: FLOOR_Y - SHIP_H - PROJ_H,
        });
      }

      // spawn
      const spawnInt = powersRef.current.spawn ? Math.round(BASE_SPAWN_MS / 2.2) : BASE_SPAWN_MS;
      if (now - lastSpawnRef.current > spawnInt) {
        lastSpawnRef.current = now;
        spawnWord(now);
      }

      // move words (vy en px/seg)
      for (const w of wordsRef.current) { w.y += w.vy * dt; }
      // cull
      wordsRef.current = wordsRef.current.filter(w => {
        if (w.y > FLOOR_Y) {
          if (!w.special && w.category === targetCat) {
            registerMiss();
          }
          return false;
        }
        return true;
      });

      // move projectiles
      const projStep = PROJ_SPEED_PXS * dt;
      for (const p of projsRef.current) { p.y -= projStep; }
      projsRef.current = projsRef.current.filter(p => p.y > -PROJ_H);

      // collisions projectile vs word
      for (let pi = projsRef.current.length - 1; pi >= 0; pi--) {
        const p = projsRef.current[pi];
        let hit = false;
        for (let wi = wordsRef.current.length - 1; wi >= 0; wi--) {
          const w = wordsRef.current[wi];
          if (p.x < w.x + w.w && p.x + PROJ_W > w.x && p.y < w.y + WORD_H && p.y + PROJ_H > w.y) {
            wordsRef.current.splice(wi, 1);
            hit = true;
            if (w.special) {
              const pow = POWERS.find(pp => pp.id === w.special);
              if (pow) {
                powersRef.current = { ...powersRef.current, [pow.id]: now + pow.duration };
                setActivePowers(powersRef.current);
              }
              scoreRef.current += 5;
            } else if (w.category === targetCat) {
              const mult = powersRef.current.double ? 2 : 1;
              scoreRef.current += 10 * mult;
              registerHit();
            } else {
              // palabra incorrecta → pequeña penalización de puntos + velocidad
              scoreRef.current = Math.max(0, scoreRef.current - 2);
              registerMiss();
            }
            setScore(scoreRef.current);
            break;
          }
        }
        if (hit) projsRef.current.splice(pi, 1);
      }

      forceRender();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targetCat]);

  const secondsLeft = Math.ceil(timeLeftMs / 1000);

  return (
    <div className="np-root">
      <div className={`np-head ${phase === 'playing' ? 'np-head-playing' : ''}`}>
        {phase !== 'playing' && (
          <div className="np-badge"><Rocket className="w-4 h-4" /> Nave Palabras</div>
        )}
        {phase === 'playing' && (
          <>
            <div className="np-hud">⏱ <span className={secondsLeft <= 10 ? 'np-time-low' : ''}>{secondsLeft}s</span></div>
            <div className="np-hud">🎯 {hits}</div>
            <div className="np-hud">★ {score}</div>
            <div className="np-hud-target">
              <Target className="w-3.5 h-3.5" />
              <span>{formatName(targetCat) || '—'}</span>
            </div>
            <div className="np-hud np-hud-speed" title={`Cadencia de disparo (fallos: ${penaltyLevel}/3). Cada fallo dispara más lento.`}>
              {[0, 1, 2].map(i => (
                <span key={i} className={i < (MAX_PENALTY - penaltyLevel) ? 'np-spd-on' : 'np-spd-off'}>⚡</span>
              ))}
              <span className="np-spd-label">CADENCIA</span>
            </div>
            {combo > 0 && penaltyLevel > 0 && (
              <div className="np-hud np-hud-combo" title={`Combo ${combo}/${COMBO_TO_RECOVER} — recupera la cadencia`}>
                🔥 {combo}/{COMBO_TO_RECOVER}
              </div>
            )}
          </>
        )}
      </div>

      <div
        ref={arenaRef}
        className="np-arena"
        style={{ aspectRatio: `${ARENA_W} / ${ARENA_H}` }}
        onMouseMove={onPointerMove}
        onMouseDown={onPointerDown}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchMove={onPointerMove}
        onTouchStart={onPointerDown}
        onTouchEnd={onPointerUp}
      >
        <div className="np-viewport" style={{ width: ARENA_W, height: ARENA_H }}>
          {/* estrellas decorativas */}
          <div className="np-stars" />
          <div className="np-floor" style={{ top: FLOOR_Y }} />

          {/* Flash + texto de fallo */}
          <AnimatePresence>
            {missFlashKey > 0 && (
              <motion.div
                key={missFlashKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.75, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, times: [0, 0.2, 1] }}
                className="np-miss-flash"
                onAnimationComplete={() => { /* noop */ }}
              />
            )}
            {missFlashKey > 0 && (
              <motion.div
                key={`txt-${missFlashKey}`}
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ opacity: 1, scale: 1.1, y: 0 }}
                exit={{ opacity: 0, scale: 1.4, y: -30 }}
                transition={{ duration: 0.7 }}
                className="np-miss-text">
                ¡FALLO!
              </motion.div>
            )}
          </AnimatePresence>

          {/* palabras */}
          {wordsRef.current.map(w => {
            const hintsOn = modeRef.current !== 'exam';
            const cls = w.special
              ? 'np-power'
              : (hintsOn && w.category === targetCat ? 'np-target-word' : 'np-noise');
            return (
              <div key={w.id} className={`np-word ${cls}`}
                style={{ left: w.x, top: w.y, width: w.w, height: WORD_H }}>
                {w.text}
              </div>
            );
          })}

          {/* proyectiles */}
          {projsRef.current.map(p => (
            <div key={p.id} className="np-proj" style={{ left: p.x, top: p.y, width: PROJ_W, height: PROJ_H }} />
          ))}

          {/* nave */}
          {phase === 'playing' && (
            <Ship x={shipXRef.current} y={FLOOR_Y - SHIP_H} rapid={!!powersRef.current.rapid} shipId={shipId} />
          )}

          {/* power badges */}
          <div className="np-powers">
            {Object.keys(activePowers).map(id => {
              const p = POWERS.find(pp => pp.id === id);
              if (!p) return null;
              const remain = Math.max(0, Math.ceil((activePowers[id] - performance.now()) / 1000));
              return (
                <span key={id} className="np-pow-badge" style={{ background: p.color }}>
                  {p.icon} {p.label} · {remain}s
                </span>
              );
            })}
          </div>

          {/* menú inicial */}
          {phase === 'menu' && (
            <div className="np-overlay">
              <div className="np-panel np-panel-menu">
                <h2 className="np-title">🚀 NAVE PALABRAS</h2>
                <p className="np-sub-compact">
                  60s · Dispara solo a la <b>categoría objetivo</b> · Fallar reduce tu cadencia (se recupera con 5 aciertos) · Velocidad de nave igual para todos
                </p>

                <div className="np-menu-cols">
                  {/* Columna izquierda: naves */}
                  <div className="np-menu-col">
                    <div className="np-section-label">Tu nave</div>
                    <div className="np-ship-grid">
                      {SHIPS.map(s => (
                        <button key={s.id}
                          type="button"
                          onClick={() => setShipId(s.id)}
                          className={`np-ship-card ${shipId === s.id ? 'np-ship-card-active' : ''}`}
                          style={{ borderColor: shipId === s.id ? s.color : undefined }}
                          title={s.name}>
                          <ShipPreview design={s} />
                          <span className="np-ship-name" style={{ color: shipId === s.id ? s.color : undefined }}>
                            {s.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Columna derecha: objetivo + dificultad */}
                  <div className="np-menu-col">
                    <div className="np-section-label">Objetivo</div>
                    <div className="np-cat-chooser">
                      <div className="np-cat-current">{formatName(targetCat) || 'Cargando…'}</div>
                      <button className="np-cat-btn" onClick={changeCategory} title="Cambiar categoría">
                        <Shuffle className="w-4 h-4" />
                      </button>
                      <button className="np-cat-btn" onClick={() => setShowHelp(true)} title="Ver palabras válidas">
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="np-section-label" style={{ marginTop: 6 }}>Dificultad</div>
                    <div className="np-mode-grid">
                      {MODES.map(m => (
                        <button key={m.id}
                          type="button"
                          onClick={() => setMode(m.id)}
                          className={`np-mode-card ${mode === m.id ? 'np-mode-card-active' : ''}`}
                          style={{ borderColor: mode === m.id ? m.color : undefined }}>
                          <span className="np-mode-icon">{m.icon}</span>
                          <span className="np-mode-label" style={{ color: mode === m.id ? m.color : undefined }}>
                            {m.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {loadError && <p className="np-err">No se encontraron datos. Prueba otra asignatura.</p>}
                <Button disabled={!targetCat || loadError} onClick={startGame} className="np-play-btn">
                  <Play className="w-5 h-5 mr-2" /> JUGAR
                </Button>
              </div>
            </div>
          )}

          {/* game over */}
          {phase === 'over' && (() => {
            const notaNum = Math.min(10, hits);
            const notaColor = notaNum >= 8 ? '#10b981' : notaNum >= 5 ? '#3b82f6' : '#ef4444';
            const notaMsg  = notaNum >= 9 ? 'Excelente' : notaNum >= 7 ? 'Muy bien' : notaNum >= 5 ? 'Aprobado' : 'Necesitas repasar';
            return (
              <div className="np-overlay">
                <div className="np-panel np-panel-end">
                  <Trophy className="np-trophy" />
                  <h2 className="np-title">¡Fin de partida!</h2>

                  <div className="np-nota-block" style={{ color: notaColor, borderColor: notaColor }}>
                    <div className="np-nota-big">{notaNum.toFixed(1)}</div>
                    <div className="np-nota-over">/ 10</div>
                    <div className="np-nota-msg">{notaMsg}</div>
                  </div>

                  <div className="np-stats-row">
                    <div><div className="np-stat-n">{hits}</div><div className="np-stat-l">Aciertos</div></div>
                    <div><div className="np-stat-n">{misses}</div><div className="np-stat-l">Fallos</div></div>
                    <div><div className="np-stat-n">{score}</div><div className="np-stat-l">Puntos</div></div>
                  </div>
                  <p className="np-nota-hint">
                    La nota es sobre 10. Los puntos son complementarios — dos alumnos pueden tener 10 y distinto ranking.
                  </p>

                  <div className="np-actions-row">
                    <Button onClick={() => setPhase('menu')} className="np-menu-btn">
                      <RotateCcw className="w-4 h-4 mr-2" /> Menú
                    </Button>
                    <Button onClick={startGame} className="np-play-btn">
                      <Play className="w-4 h-4 mr-2" /> Revancha
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* modal guía categorías */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="np-help">
                <div className="np-help-head">
                  <span>Guía de palabras</span>
                  <button onClick={() => setShowHelp(false)} className="np-help-close">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="np-help-body">
                  {categories.map(cat => (
                    <div key={cat} className="np-help-cat">
                      <div className={`np-help-title ${cat === targetCat ? 'np-help-title-active' : ''}`}>
                        {formatName(cat)} {cat === targetCat && '🎯'}
                      </div>
                      <div className="np-help-words">
                        {(gameData?.[cat] || []).map((w, i) => (
                          <span key={i} className="np-help-chip">{w}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile fire button */}
      <div className="np-mobile-fire">
        <button
          onTouchStart={(e) => { e.preventDefault(); keysRef.current.fire = true; }}
          onTouchEnd={() => { keysRef.current.fire = false; }}
          onMouseDown={() => { keysRef.current.fire = true; }}
          onMouseUp={() => { keysRef.current.fire = false; }}
          className="np-fire-btn">
          <Zap className="w-6 h-6" /> DISPARAR
        </button>
      </div>
    </div>
  );
}

// Vista estática de nave (para selector del menú). Sin posicionamiento absoluto.
function ShipPreview({ design }) {
  const gradId = `preview-grad-${design.id}`;
  return (
    <svg viewBox="0 0 70 36" width="64" height="32"
         style={{ filter: `drop-shadow(0 0 6px ${design.color}88)` }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={design.color} />
          <stop offset="1" stopColor={design.accent} />
        </linearGradient>
      </defs>
      {design.render(gradId, design.color, design.accent)}
    </svg>
  );
}

export function Ship({ x, y, rapid, flip = false, color, shipId = 0, size = SHIP_W, height = SHIP_H }) {
  const design = SHIPS[shipId] || SHIPS[0];
  const mainColor = color || design.color;
  const accentColor = color ? '#083344' : design.accent;
  const gradId = `grad-${design.id}-${(mainColor || '').slice(1)}`;
  return (
    <div className={`np-ship ${rapid ? 'np-ship-rapid' : ''}`}
         style={{ left: x, top: y, width: size, height, transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 70 36" width={size} height={height}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={mainColor} />
            <stop offset="1" stopColor={accentColor} />
          </linearGradient>
        </defs>
        {design.render(gradId, mainColor, accentColor)}
      </svg>
    </div>
  );
}
