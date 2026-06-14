// Cazapalabras 3D — FPS educativo de vocabulario a pantalla completa.
// Disparas a palabras en MONTONES 3D con gravedad (de la BD: categorías del runner +
// definiciones del rosco). SOLO 2 categorías puntúan: principal (+5) y secundaria
// (+2); el resto son neutras (sin pistas visuales) y dispararlas NO resta puntos pero
// hace desaparecer válidas del montón. Retos de definición sin resaltar. Cámara por
// secciones (calmada, sin avance). Modo práctica (3 dificultades) + examen, por TIEMPO.
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
  DIFICULTADES, MODOS, DEF_BONUS_MULT, notaColor, notaMensaje,
} from './engine/config';
import './Cazapalabras3D.css';

const MODE_DESC = {
  facil: 'Más tiempo y definiciones más espaciadas. Ideal para empezar.',
  medio: 'Ritmo equilibrado. El reto estándar.',
  dificil: 'Menos tiempo, cadencia rápida y más definiciones. Para expertos.',
  examen: 'Tu nota sale de las definiciones que encuentres y aciertes.',
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

  // Material de estudio: palabras de las 2 categorías que puntúan, agrupadas por su
  // VALOR (5 = principal · 2 = secundaria). Las "otras" (neutras, no puntúan) se
  // listan aparte para reconocerlas.
  const wordsByValue = useMemo(() => {
    const m = new Map();
    (pool?.validWords || []).forEach((w) => {
      if (!m.has(w.value)) m.set(w.value, []);
      m.get(w.value).push(w.text);
    });
    return m;
  }, [pool]);
  const neutralWordsList = useMemo(
    () => (pool?.neutralWords || []).filter((w) => w.category !== 'rosco').map((w) => w.text),
    [pool],
  );

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
    // la palabra-respuesta de la definición se reconoce por TEXTO (no se resalta)
    const isDef = !!gs.activeDef && !!data.text
      && data.text.trim().toLowerCase() === gs.activeDef.word.trim().toLowerCase();
    const hitKind = isDef ? 'answer' : (data.valid ? 'word' : 'penalty');
    // fb() actualiza feedback + hit-marker y emite UN único setHud por impacto
    // (nunca por frame): re-render puntual del HUD/mirilla, no del Canvas (memo).
    const fb = (text, color) => {
      const id = ++fbId.current;
      gs.feedback = { text, color, id };
      gs.feedbackUntil = now + 1100;
      gs.hit = { id, kind: hitKind };
      setHud(snapshot(gs, now));
    };

    if (isDef) {
      const pts = (gs.activeDef.points || 5) * DEF_BONUS_MULT;
      gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo);
      gs.defSolved += 1; gs.activeDef = null; gs.activeDefCounted = false; gs.defTimer = gs.params.defEverySec;
      fb(`📖 ¡Correcto! +${pts}`, '#fde68a');
      return;
    }

    // palabra VÁLIDA (categoría principal +5 / secundaria +2)
    if (data.valid) {
      const pts = data.value || 1;
      gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo); gs.wordsHit += 1;
      fb(`+${pts}`, '#a5f3fc'); // color neutro: el resultado no revela el valor por color
      return;
    }

    // palabra NO válida: SIN penalización de puntos, pero desaparecen válidas del montón
    gs.combo = 0;
    const rv = data.removedValid || 0;
    fb(rv > 0 ? `❌ No válida · ${rv} válida${rv > 1 ? 's' : ''} menos` : '❌ No válida', '#fca5a5');
  }, []);

  // ---- iniciar partida ----
  const start = useCallback((mode) => {
    if (!pool) return;
    const params = DIFICULTADES[mode];
    gsRef.current = {
      running: true, paused: false, mode, params, pool,
      timeLeft: params.durationSec, totalTime: params.durationSec,
      score: 0, combo: 0, bestCombo: 0, wordsHit: 0, nextShotAt: 0,
      activeDef: null, activeDefCounted: false, defEndsAt: 0, defTimer: params.defEverySec, defPresented: 0, defSolved: 0,
      feedback: null, feedbackUntil: 0,
    };
    controlRef.current = { yaw: 0, pitch: 0, shootQueued: false };
    trackedRef.current = false;
    sessionStartRef.current = Date.now();
    setSummary(null);
    setHud(snapshot(gsRef.current, performance.now()));
    setScreen('play');
  }, [pool]);

  // ---- bucle maestro (tiempo, definiciones, HUD) ----
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
        if (gs.activeDef) {
          if (now > gs.defEndsAt) { gs.activeDef = null; gs.activeDefCounted = false; gs.defTimer = gs.params.defEverySec; }
        } else {
          gs.defTimer -= dt;
          if (gs.defTimer <= 0 && gs.pool.definitions.length) {
            const d = gs.pool.definitions[Math.floor(Math.random() * gs.pool.definitions.length)];
            gs.activeDef = { word: d.word, definition: d.definition, points: d.points };
            gs.activeDefCounted = false;
            gs.defEndsAt = now + gs.params.defWindowSec * 1000;
            // defPresented++ lo hace Scene al INYECTAR la palabra en un montón (visible),
            // para no inflar la nota si todavía no hay montón donde mostrarla.
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
        <p><strong>En ordenador:</strong> haz clic para capturar el ratón; luego <strong>mueve el ratón</strong> para girar y <strong>haz clic</strong> para disparar a la mirilla (pulsa <kbd>ESC</kbd> para soltar el ratón). <strong>En tablet/móvil:</strong> arrastra para mirar y toca para disparar. La cámara está casi quieta y de vez en cuando <strong>gira</strong> para encarar otro montón (no avanza ni se desplaza).</p>
        <h3>🧱 Montones con gravedad</h3>
        <p>Las palabras forman <strong>montones</strong> de cajas apiladas que aparecen a tu alrededor. Elige bien a cuáles disparas: si rompes las de abajo, las de arriba <strong>caen</strong> para rellenar el hueco.</p>
        <h3>🗂️ Solo 2 categorías puntúan</h3>
        <p>Todas las palabras se ven <strong>igual</strong>: no hay pistas. Mira la leyenda de abajo: la categoría <b style={{ color: '#fde68a' }}>principal da +5</b> y la <b style={{ color: '#a5f3fc' }}>secundaria +2</b>. Reconoce a qué categoría pertenece cada palabra y <strong>lee antes de disparar</strong>. El resto de palabras <strong>no puntúan</strong>: si disparas una, <strong>no pierdes puntos pero desaparecen varias válidas</strong> del montón (optas a menos puntos).</p>
        <h3>📖 Retos de definición</h3>
        <p>De vez en cuando aparece una <strong>definición</strong> arriba. Esa palabra está en los montones como una más (<strong>no se resalta</strong>): tienes que encontrarla y dispararle. En el examen, <strong>tu nota sale de estas definiciones</strong>.</p>
        <p>La calidad gráfica se adapta a tu equipo automáticamente; puedes cambiarla a mano abajo.</p>
      </InstructionsModal>

      {/* ============ MATERIAL DE ESTUDIO ============ */}
      <InstructionsModal isOpen={showVocab} onClose={() => setShowVocab(false)} title={`Material de estudio · ${asignatura}`}>
        {pool.categories.length > 0 && (
          <>
            <h3>🗂️ Categorías que puntúan</h3>
            {pool.categories.map((c) => {
              const words = wordsByValue.get(c.points) || [];
              if (!words.length) return null;
              return (
                <div key={c.name} className="cz3d-study-cat">
                  <h4>
                    ✓ {c.name} <span>{c.role === 'principal' ? 'principal · +5' : 'secundaria · +2'}</span>
                  </h4>
                  <p className="cz3d-study-words">{words.join(' · ')}</p>
                </div>
              );
            })}
          </>
        )}
        {neutralWordsList.length > 0 && (
          <div className="cz3d-study-cat">
            <h4 className="pen">🚫 Otras palabras (no puntúan)</h4>
            <p className="cz3d-study-words">{neutralWordsList.join(' · ')}</p>
            <p className="cz3d-study-note">Dispararlas no resta puntos, pero hace <strong>desaparecer válidas</strong> del montón.</p>
          </div>
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
