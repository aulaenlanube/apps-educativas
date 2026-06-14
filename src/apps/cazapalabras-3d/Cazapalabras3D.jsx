// Cazapalabras 3D — FPS educativo de vocabulario a pantalla completa.
// Disparas a objetos 3D con palabras (de la BD: categorías del runner +
// definiciones del rosco). Categorías con distinto valor (1/2/5) para priorizar;
// objetos especiales (power-ups y bombas); retos de definición. Modo práctica
// (3 dificultades) + examen, todos POR TIEMPO. Calidad gráfica global + manual.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Target as TargetIcon, BookOpen, Square, Trophy } from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { QUALITY_LABELS } from '@/services/graphicsQuality';
import { getRoscoData, getRunnerData } from '@/services/gameDataService';
import GameCanvas from './components/GameCanvas';
import Crosshair from './components/Crosshair';
import HUD from './components/HUD';
import { buildPool, poolUsable } from './engine/pool';
import { clearTextureCache } from './engine/wordTexture';
import {
  DIFICULTADES, MODOS, POWERUP, TIERS, DEF_BONUS_MULT, notaColor, notaMensaje,
} from './engine/config';
import './Cazapalabras3D.css';

const MODE_DESC = {
  facil: 'Más tiempo, menos objetos y más lentos. Ideal para empezar.',
  medio: 'Ritmo y densidad equilibrados. El reto estándar.',
  dificil: 'Rápido, lleno de objetos y más bombas. Para expertos.',
  examen: 'Sin ayudas. Tu nota sale de las definiciones que aciertes.',
};

const Cazapalabras3D = ({ level: levelProp, grade: gradeProp, subjectId: subjectProp, onGameComplete, isPaused }) => {
  const routeParams = useParams();
  const level = levelProp || routeParams.level || 'eso';
  const grade = useMemo(() => parseInt(gradeProp ?? routeParams.grade, 10) || 1, [gradeProp, routeParams.grade]);
  const subjectId = subjectProp || routeParams.subjectId;
  const asignatura = subjectId || (level === 'primaria' ? 'lengua' : 'general');

  // ---- calidad gráfica global + governor ----
  const { pref, tier: prefTier } = useGraphicsQuality();
  const [tierOverride, setTierOverride] = useState(null);
  useEffect(() => { setTierOverride(null); }, [pref, prefTier]);
  const tier = tierOverride || prefTier;
  const [gfxToast, setGfxToast] = useState(null);
  const gfxTimer = useRef(null);
  const handleAutoDowngrade = useCallback((next) => {
    setTierOverride(next);
    setGfxToast(`Rendimiento bajo: calidad ajustada a ${QUALITY_LABELS[next]}`);
    clearTimeout(gfxTimer.current);
    gfxTimer.current = setTimeout(() => setGfxToast(null), 4500);
  }, []);

  // ---- datos → pool ----
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    if (!level || !grade) return undefined;
    let cancelled = false;
    setLoading(true); setLoadError(false);
    (async () => {
      try {
        let rosco = await getRoscoData(level, grade, asignatura);
        let runner = await getRunnerData(level, grade, asignatura);
        if ((!rosco || !rosco.length) && asignatura !== 'general') rosco = await getRoscoData(level, grade, 'general');
        if ((!runner || !Object.keys(runner || {}).length) && asignatura !== 'general') runner = await getRunnerData(level, grade, 'general');
        const p = buildPool(rosco || [], runner || null);
        if (cancelled) return;
        if (!poolUsable(p)) setLoadError(true); else setPool(p);
        setLoading(false);
      } catch {
        if (!cancelled) { setLoadError(true); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [level, grade, asignatura]);

  // Material de estudio: palabras agrupadas por su categoría (las del rosco van
  // en la sección "con definición"). Conserva el orden del catálogo de categorías.
  const wordsByCategory = useMemo(() => {
    const m = new Map();
    (pool?.words || []).forEach((w) => {
      if (w.category === 'rosco') return;
      if (!m.has(w.category)) m.set(w.category, []);
      m.get(w.category).push(w.text);
    });
    return m;
  }, [pool]);

  // ---- estado de juego (autoritativo en ref, espejo en React para el HUD) ----
  const [screen, setScreen] = useState('select'); // select | play | summary
  const screenRef = useRef(screen); screenRef.current = screen;
  const gsRef = useRef({ running: false });
  const controlRef = useRef({ yaw: 0, pitch: 0, shootQueued: false });
  const pausedRef = useRef(false);
  pausedRef.current = !!isPaused;
  const trackedRef = useRef(false);
  const sessionStartRef = useRef(null);
  const fbId = useRef(0);
  const [hud, setHud] = useState(null);
  const [cooling, setCooling] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showVocab, setShowVocab] = useState(false);

  // ---- registro de resultado (una sola vez por partida) ----
  const commitResult = useCallback(() => {
    if (trackedRef.current) return;
    const gs = gsRef.current;
    trackedRef.current = true;
    const durationSeconds = Math.round((Date.now() - (sessionStartRef.current || Date.now())) / 1000);
    const isExam = !!gs.params?.isExam;
    const nota = isExam ? (gs.defPresented > 0 ? Math.round((gs.defSolved / gs.defPresented) * 100) / 10 : 0) : undefined;
    onGameComplete?.({
      mode: isExam ? 'test' : 'practice',
      score: gs.score || 0,
      maxScore: Math.round((gs.totalTime || 90) * 12),
      correctAnswers: isExam ? (gs.defSolved || 0) : (gs.wordsHit || 0),
      totalQuestions: isExam ? Math.max(1, gs.defPresented || 0) : Math.max(1, gs.wordsHit || 0),
      durationSeconds,
      ...(isExam ? { nota } : {}),
    });
  }, [onGameComplete]);

  const endGame = useCallback(() => {
    const gs = gsRef.current;
    gs.running = false;
    const isExam = !!gs.params?.isExam;
    const nota = isExam ? (gs.defPresented > 0 ? Math.round((gs.defSolved / gs.defPresented) * 100) / 10 : 0) : null;
    commitResult();
    setSummary({
      isExam, nota, score: gs.score || 0, wordsHit: gs.wordsHit || 0,
      bestCombo: gs.bestCombo || 0, defSolved: gs.defSolved || 0, defPresented: gs.defPresented || 0,
    });
    setScreen('summary');
    if (!isExam || (nota != null && nota >= 5)) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 } });
    }
  }, [commitResult]);
  const endGameRef = useRef(endGame); endGameRef.current = endGame;

  // ---- impacto (llamado desde la escena durante el frame r3f) ----
  const onHit = useCallback((data) => {
    const gs = gsRef.current;
    if (!gs.running || gs.paused) return;
    const now = performance.now();
    const hitKind = data.kind === 'special'
      ? (data.special === 'bomb' ? 'bomb' : 'special')
      : (data.penalty ? 'penalty' : (data.isAnswer ? 'answer' : 'word'));
    // fb() actualiza feedback + hit-marker y emite UN único setHud por impacto
    // (nunca por frame): re-render puntual del HUD/mirilla, no del Canvas (memo).
    const fb = (text, color) => {
      const id = ++fbId.current;
      gs.feedback = { text, color, id };
      gs.feedbackUntil = now + 1100;
      gs.hit = { id, kind: hitKind };
      setHud(snapshot(gs, now));
    };

    if (data.kind === 'special') {
      switch (data.special) {
        case 'bomb':
          gs.score = Math.max(0, gs.score - POWERUP.bombPenaltyPoints);
          gs.timeLeft = Math.max(0, gs.timeLeft - POWERUP.bombPenaltySec);
          gs.combo = 0;
          fb(`💀 −${POWERUP.bombPenaltyPoints}`, '#fca5a5');
          break;
        case 'time':
          gs.timeLeft += POWERUP.timeBonusSec;
          fb(`⏱️ +${POWERUP.timeBonusSec}s`, '#34d399');
          break;
        case 'rapid':
          gs.rapid = true; gs.rapidUntil = now + POWERUP.rapidMs;
          fb('⚡ ¡Cadencia rápida!', '#c4b5fd');
          break;
        case 'x2':
          gs.mult = 2; gs.x2Until = now + POWERUP.x2Ms;
          fb('✖️ ¡Puntos ×2!', '#f9a8d4');
          break;
        default: { // gem
          const pts = POWERUP.gemPoints * gs.mult;
          gs.score += pts; fb(`💎 +${pts}`, '#7dd3fc');
        }
      }
      return;
    }

    if (data.isAnswer && gs.activeDef) {
      const pts = (data.points || 5) * DEF_BONUS_MULT * gs.mult;
      gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo);
      gs.defSolved += 1; gs.activeDef = null; gs.defTimer = gs.params.defEverySec;
      fb(`📖 ¡Correcto! +${pts}`, '#fde68a');
      return;
    }

    // palabra de categoría PENALIZADORA: resta puntos y rompe el combo
    if (data.penalty) {
      const pen = data.points || 3;
      gs.score = Math.max(0, gs.score - pen);
      gs.combo = 0;
      fb(`⛔ −${pen}`, '#fca5a5');
      return;
    }

    const pts = (data.points || 1) * gs.mult;
    gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo); gs.wordsHit += 1;
    fb(`+${pts}`, TIERS[data.points]?.color || '#e2e8f0');
  }, []);

  // ---- iniciar partida ----
  const start = useCallback((mode) => {
    if (!pool) return;
    const params = DIFICULTADES[mode];
    gsRef.current = {
      running: true, paused: false, mode, params, pool,
      timeLeft: params.durationSec, totalTime: params.durationSec,
      score: 0, combo: 0, bestCombo: 0, wordsHit: 0, mult: 1,
      rapid: false, rapidUntil: 0, x2Until: 0, nextShotAt: 0,
      activeDef: null, defEndsAt: 0, defTimer: params.defEverySec, defPresented: 0, defSolved: 0,
      feedback: null, feedbackUntil: 0,
    };
    controlRef.current = { yaw: 0, pitch: 0, shootQueued: false };
    trackedRef.current = false;
    sessionStartRef.current = Date.now();
    setSummary(null);
    setHud(snapshot(gsRef.current, performance.now()));
    setScreen('play');
  }, [pool]);

  // ---- bucle maestro (tiempo, definiciones, power-ups, HUD) ----
  useEffect(() => {
    if (screen !== 'play') return undefined;
    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const gs = gsRef.current;
      gs.paused = pausedRef.current;
      if (!gs.running) return;
      if (!gs.paused) {
        gs.timeLeft -= dt;
        if (gs.rapid && now > gs.rapidUntil) gs.rapid = false;
        if (gs.mult > 1 && now > gs.x2Until) gs.mult = 1;
        if (gs.activeDef) {
          if (now > gs.defEndsAt) { gs.activeDef = null; gs.defTimer = gs.params.defEverySec; }
        } else {
          gs.defTimer -= dt;
          if (gs.defTimer <= 0 && gs.pool.definitions.length) {
            const d = gs.pool.definitions[Math.floor(Math.random() * gs.pool.definitions.length)];
            gs.activeDef = { word: d.word, definition: d.definition, points: d.points };
            gs.defEndsAt = now + gs.params.defWindowSec * 1000;
            gs.defPresented += 1;
          }
        }
        if (gs.timeLeft <= 0) { gs.timeLeft = 0; endGameRef.current(); return; }
      }
      hudAcc += dt;
      if (hudAcc > 0.085) {
        hudAcc = 0;
        if (gs.feedback && now > gs.feedbackUntil) gs.feedback = null;
        setHud(snapshot(gs, now));
        setCooling(now < (gs.nextShotAt || 0));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  // ---- abandono (desmontaje a mitad de partida) → resultado parcial ----
  const cleanupRef = useRef(() => {});
  cleanupRef.current = () => {
    if (screenRef.current === 'play' && gsRef.current.running) commitResult();
  };
  useEffect(() => () => { cleanupRef.current(); clearTimeout(gfxTimer.current); clearTextureCache(); }, []);

  // Nota: ESC ya NO termina la partida — con mouse-look (pointer lock) ESC libera
  // el ratón; para terminar está el botón "Terminar".

  const cursoLabel = level === 'bachillerato' ? `${grade}º Bach` : `${grade}º ESO`;

  // ====================== RENDER ======================
  if (loading) {
    return (
      <div className="cz3d-root cz3d-center">
        <div className="cz3d-spinner" />
        <p>Cargando vocabulario de {cursoLabel}…</p>
      </div>
    );
  }
  if (loadError || !pool) {
    return (
      <div className="cz3d-root cz3d-center">
        <span className="cz3d-big-emoji">🛰️</span>
        <h2>Sin vocabulario disponible</h2>
        <p>No hay suficientes palabras para <strong>{asignatura}</strong> en {cursoLabel}.<br />Prueba con otra asignatura o curso.</p>
      </div>
    );
  }

  return (
    <div className="cz3d-root">
      {/* ============ SELECCIÓN ============ */}
      {screen === 'select' && (
        <motion.div className="cz3d-select" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="cz3d-hero">
            <span className="cz3d-hero-icon">🎯</span>
            <h1>Cazapalabras 3D</h1>
            <p className="cz3d-hero-sub">
              Dispara a las palabras del entorno y aprende vocabulario y definiciones de <strong>{asignatura}</strong> · {cursoLabel}
            </p>
            <InstructionsButton className="cz3d-help-btn" onClick={() => setShowHelp(true)} />
          </div>

          <div className="cz3d-modes">
            {MODOS.map((m) => {
              const d = DIFICULTADES[m];
              return (
                <motion.button
                  key={m}
                  type="button"
                  className={`cz3d-mode ${m}`}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => start(m)}
                >
                  <span className="cz3d-mode-icon">{d.icon}</span>
                  <span className="cz3d-mode-name">{d.label}</span>
                  <span className="cz3d-mode-desc">{MODE_DESC[m]}</span>
                  <span className="cz3d-mode-time">⏱ {d.durationSec}s</span>
                </motion.button>
              );
            })}
          </div>

          <div className="cz3d-select-actions">
            <button type="button" className="cz3d-study-btn" onClick={() => setShowVocab(true)}>
              <BookOpen size={16} /> Ver material de estudio
            </button>
          </div>

          <GraphicsQualitySelector className="gfxsel-on-dark cz3d-gfx" />
        </motion.div>
      )}

      {/* ============ JUEGO ============ */}
      {screen === 'play' && (
        <div className="cz3d-play">
          <GameCanvas
            tier={tier}
            prefAuto={pref === 'auto'}
            onAutoDowngrade={handleAutoDowngrade}
            gameRef={gsRef}
            controlRef={controlRef}
            onHit={onHit}
          />
          <div
            className="cz3d-vignette"
            data-hot={hud && hud.combo >= 5 ? '1' : '0'}
            style={{ opacity: Math.min(0.55, (hud?.combo || 0) * 0.045) }}
          />
          <Crosshair cooling={cooling} hit={hud?.hit} />
          {hud && (
            <HUD
              timeLeft={hud.timeLeft}
              totalTime={hud.totalTime}
              score={hud.score}
              combo={hud.combo}
              mult={hud.mult}
              rapid={hud.rapid}
              activeDef={hud.activeDef}
              defRemaining={hud.defRemaining}
              defWindow={hud.defWindow}
              feedback={hud.feedback}
              examInfo={hud.isExam ? `${hud.defSolved}/${hud.defPresented}` : null}
              categories={pool.categories}
            />
          )}
          <button type="button" className="cz3d-exit" onClick={endGame}>
            <Square size={14} /> Terminar
          </button>
          {isPaused && <div className="cz3d-paused"><span>⏸️ En pausa</span></div>}
        </div>
      )}

      {/* ============ RESUMEN ============ */}
      {screen === 'summary' && summary && (
        <motion.div className="cz3d-summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          {summary.isExam ? (
            <>
              <h2>Resultado del examen</h2>
              <div className="cz3d-nota" style={{ color: notaColor(summary.nota), borderColor: notaColor(summary.nota) }}>
                {Number(summary.nota).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
              <p className="cz3d-nota-msg" style={{ color: notaColor(summary.nota) }}>{notaMensaje(summary.nota)}</p>
            </>
          ) : (
            <>
              <h2>¡Partida terminada!</h2>
              <div className="cz3d-final-score"><Trophy size={26} /> {summary.score.toLocaleString('es-ES')} pts</div>
            </>
          )}
          <div className="cz3d-summary-stats">
            <div><strong>{summary.score.toLocaleString('es-ES')}</strong><span>puntos</span></div>
            <div><strong>{summary.wordsHit}</strong><span>palabras</span></div>
            <div><strong>{summary.defSolved}/{summary.defPresented}</strong><span>definiciones</span></div>
            <div><strong>×{summary.bestCombo}</strong><span>mejor combo</span></div>
          </div>
          <div className="cz3d-summary-actions">
            <button type="button" className="cz3d-btn-primary" onClick={() => setScreen('select')}>
              <TargetIcon size={16} /> Jugar otra vez
            </button>
          </div>
        </motion.div>
      )}

      {/* ============ TOAST CALIDAD ============ */}
      <AnimatePresence>
        {gfxToast && (
          <motion.div className="cz3d-toast" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            ⚙️ {gfxToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ INSTRUCCIONES ============ */}
      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cazapalabras 3D">
        <h3>🎯 Cómo se juega</h3>
        <p><strong>En ordenador:</strong> haz clic para capturar el ratón y empezar a disparar; luego <strong>mueve el ratón</strong> para girar y <strong>haz clic</strong> para disparar a la mirilla (pulsa <kbd>ESC</kbd> para soltar el ratón). <strong>En tablet/móvil:</strong> arrastra para mirar y toca para disparar. La cámara avanza sola por un recorrido cambiante con giros inesperados.</p>
        <h3>⭐ Categorías que puntúan y que penalizan</h3>
        <p>Abajo verás qué <strong>categorías dan puntos</strong> (✓) y cuáles <strong>penalizan</strong> (⛔, marco rojo): <b style={{ color: '#fca5a5' }}>no dispares a esas</b>. Entre las que puntúan, la rareza vale más: <b style={{ color: '#e2e8f0' }}>blanca = 1</b>, <b style={{ color: '#a5f3fc' }}>cian = 2</b>, <b style={{ color: '#fde68a' }}>dorada = 5</b>. <strong>Lee la palabra antes de disparar.</strong></p>
        <h3>📖 Retos de definición</h3>
        <p>De vez en cuando aparece una definición arriba. Dispara a la palabra <b style={{ color: '#fbbf24' }}>resaltada en dorado</b> que la cumple para ganar muchos puntos. En el examen, <strong>tu nota sale de estas definiciones</strong>.</p>
        <h3>✨ Objetos especiales</h3>
        <p>⏱️ +5 segundos · ⚡ cadencia rápida · ✖️ puntos ×2 · 💎 bonus gordo. Cuidado con las <b style={{ color: '#fca5a5' }}>💀 bombas</b>: si disparas a una, pierdes puntos y tiempo.</p>
        <p>La calidad gráfica se adapta a tu equipo automáticamente; puedes cambiarla a mano abajo.</p>
      </InstructionsModal>

      {/* ============ MATERIAL DE ESTUDIO ============ */}
      <InstructionsModal isOpen={showVocab} onClose={() => setShowVocab(false)} title={`Material de estudio · ${asignatura}`}>
        {pool.categories.length > 0 && (
          <>
            <h3>🗂️ Categorías y sus palabras</h3>
            {pool.categories.map((c) => {
              const words = wordsByCategory.get(c.name) || [];
              if (!words.length) return null;
              return (
                <div key={c.name} className="cz3d-study-cat">
                  <h4 className={c.penalty ? 'pen' : ''}>
                    {c.penalty ? '⛔' : '✓'} {c.name}
                    <span>{c.penalty ? `−${c.points} · no dispares` : `+${c.points}`}</span>
                  </h4>
                  <p className="cz3d-study-words">{words.join(' · ')}</p>
                </div>
              );
            })}
          </>
        )}
        {pool.definitions.length > 0 && (
          <>
            <h3>📖 Palabras con definición</h3>
            {pool.definitions.map((d, i) => (
              <p key={`${d.word}-${i}`} className="cz3d-vocab-row"><strong>{d.word}:</strong> {d.definition}</p>
            ))}
          </>
        )}
      </InstructionsModal>
    </div>
  );
};

// Espejo del estado autoritativo → props del HUD.
function snapshot(gs, now) {
  return {
    mode: gs.mode,
    isExam: !!gs.params?.isExam,
    timeLeft: gs.timeLeft,
    totalTime: gs.totalTime,
    score: gs.score,
    combo: gs.combo,
    mult: gs.mult,
    rapid: gs.rapid,
    activeDef: gs.activeDef,
    defRemaining: gs.activeDef ? (gs.defEndsAt - now) / 1000 : 0,
    defWindow: gs.params?.defWindowSec || 9,
    defSolved: gs.defSolved,
    defPresented: gs.defPresented,
    feedback: gs.feedback,
    hit: gs.hit,
  };
}

export default Cazapalabras3D;
