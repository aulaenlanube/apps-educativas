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
import Scene3DBackground from '@/components/ui/Scene3DBackground';
import { ambienceById } from '@/apps/laboratorio-fisica/engine/ambiences';
import GameCanvas from './components/GameCanvas';
import Crosshair from './components/Crosshair';
import HUD from './components/HUD';
import { buildPool, poolUsable } from './engine/pool';
import { clearTextureCache } from './engine/wordTexture';
import { pickPair } from './engine/flyers';
import {
  DIFICULTADES, MODOS, DEF_BONUS_MULT, notaColor, notaMensaje,
  SCORE_PRINCIPAL, SCORE_SECUNDARIA,
  DEBUFF, DEBUFF_TYPES, MISS_DEBUFF_CHANCE,
} from './engine/config';
import './Cazapalabras3D.css';

// Etiquetas de los debuffs (penalizaciones de mirilla) para el feedback/HUD.
const DEBUFF_LABEL = { slow: '🐌 mirilla lenta', invert: '🔄 controles al revés', shake: '📳 vibración' };

// Aplica un debuff aleatorio (o el indicado) durante DEBUFF.durationSec. Devuelve el tipo.
function applyDebuff(gs, type) {
  const t = type || DEBUFF_TYPES[Math.floor(Math.random() * DEBUFF_TYPES.length)];
  if (!gs.debuffs) gs.debuffs = { slow: 0, invert: 0, shake: 0 };
  gs.debuffs[t] = DEBUFF.durationSec;
  return t;
}

// Categorías que puntúan AHORA (par activo) en el formato de la leyenda/aviso.
function currentCats(gs) {
  if (!gs) return [];
  const out = [];
  if (gs.principalName) out.push({ name: gs.pool.displayName(gs.principalName), role: 'principal', points: SCORE_PRINCIPAL });
  if (gs.secundariaName) out.push({ name: gs.pool.displayName(gs.secundariaName), role: 'secundaria', points: SCORE_SECUNDARIA });
  return out;
}

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

  // Fondo 3D de la plataforma (la isla low-poly): el MISMO que se ve al elegir la
  // app. Se fija un ambiente de cielo DESPEJADO (buena visibilidad para apuntar) y se
  // comparte entre la pantalla de selección/resumen (Scene3DBackground, isla orbitando)
  // y el mundo de juego (Scene monta la misma isla con cámara en primera persona).
  const ambienceId = useMemo(() => {
    const clear = ['dia', 'atardecer', 'noche'];
    return clear[Math.floor(Math.random() * clear.length)];
  }, []);
  const amb = useMemo(() => ambienceById(ambienceId), [ambienceId]);

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

  // Material de estudio: como las categorías que puntúan ROTAN, se listan TODAS las
  // categorías que pueden puntuar (cada una con sus palabras) y, aparte, las "otras"
  // (señuelos: soluciones del rosco y categorías pequeñas que no rotan).
  const studyCats = useMemo(
    () => (pool?.rotatableNames || []).map((n) => ({ name: pool.displayName(n), words: pool.byCategory.get(n) || [] })),
    [pool],
  );
  const studyOther = useMemo(() => {
    if (!pool) return [];
    const rot = new Set(pool.rotatableNames);
    const out = [];
    pool.categoryNames.forEach((n) => { if (!rot.has(n)) out.push(...(pool.byCategory.get(n) || [])); });
    return [...new Set(out)];
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
  // aviso GRANDE de cambio de categorías (encima de la mirilla, pocos segundos)
  const [catBanner, setCatBanner] = useState(null);
  const catBannerId = useRef(0);
  const catBannerTimer = useRef(null);
  const announceCats = useCallback((gs, isChange) => {
    const id = ++catBannerId.current;
    setCatBanner({ id, isChange, cats: currentCats(gs) });
    clearTimeout(catBannerTimer.current);
    catBannerTimer.current = setTimeout(() => {
      setCatBanner((b) => (b && b.id === id ? null : b));
    }, 3400);
  }, []);

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
      maxScore: Math.round((gs.totalTime || 60) * 12),
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
    const isBonus = data.kind === 'bonus';
    const isHazard = data.kind === 'hazard';
    // la palabra-respuesta de la definición se reconoce por TEXTO (no se resalta)
    const isDef = !isBonus && !isHazard && !!gs.activeDef && !!data.text
      && data.text.trim().toLowerCase() === gs.activeDef.word.trim().toLowerCase();
    const hitKind = (isBonus || isHazard) ? 'bonus' : (isDef ? 'answer' : (data.valid ? 'word' : 'penalty'));
    // fb() actualiza feedback + hit-marker y emite UN único setHud por impacto
    // (nunca por frame): re-render puntual del HUD/mirilla, no del Canvas (memo).
    const fb = (text, color) => {
      const id = ++fbId.current;
      gs.feedback = { text, color, id };
      gs.feedbackUntil = now + 1100;
      gs.hit = { id, kind: hitKind };
      setHud(snapshot(gs));
    };

    // gema de BONIFICACIÓN: puntos extra (paralelos, no cuenta como palabra ni def → no
    // afecta a la nota de examen). Sube el combo como recompensa por acertar algo veloz.
    if (isBonus) {
      const pts = data.value || 9;
      gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo);
      fb(`⭐ +${pts} ¡Bonus!`, '#fde68a');
      return;
    }

    // gema TRAMPA: da MÁS puntos pero aplica una penalización temporal a la mirilla.
    if (isHazard) {
      const pts = data.value || 14;
      gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo);
      const t = applyDebuff(gs);
      fb(`⚡ +${pts} · ${DEBUFF_LABEL[t]}`, '#e879f9');
      return;
    }

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

    // palabra NO válida: SIN penalización de puntos, pero huyen válidas en vuelo y,
    // a veces, FALLAR castiga además con una penalización temporal de mirilla.
    gs.combo = 0;
    const rv = data.removedValid || 0;
    const debuffed = Math.random() < MISS_DEBUFF_CHANCE ? applyDebuff(gs) : null;
    const base = rv > 0 ? `❌ No válida · ${rv} válida${rv > 1 ? 's' : ''} menos` : '❌ No válida';
    fb(debuffed ? `${base} · ${DEBUFF_LABEL[debuffed]}` : base, '#fca5a5');
  }, []);

  // ---- iniciar partida ----
  const start = useCallback((mode) => {
    if (!pool) return;
    const params = DIFICULTADES[mode];
    // par inicial de categorías que puntúan (rotará durante la partida)
    const { principalName, secundariaName } = pickPair(pool.rotatableNames, Math.random);
    gsRef.current = {
      running: true, paused: false, mode, params, pool,
      timeLeft: params.durationSec, totalTime: params.durationSec,
      score: 0, combo: 0, bestCombo: 0, wordsHit: 0, nextShotAt: 0,
      activeDef: null, activeDefCounted: false, defLeft: 0, defTimer: params.defEverySec, defPresented: 0, defSolved: 0,
      principalName, secundariaName, catEpoch: 0, catTimer: params.catRotateSec,
      debuffs: { slow: 0, invert: 0, shake: 0 },
      feedback: null, feedbackUntil: 0,
    };
    controlRef.current = { yaw: 0, pitch: 0, shootQueued: false };
    trackedRef.current = false;
    sessionStartRef.current = Date.now();
    setSummary(null);
    setHud(snapshot(gsRef.current));
    announceCats(gsRef.current, false); // aviso inicial de categorías
    setScreen('play');
  }, [pool, announceCats]);

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
          // ventana de la definición en SEGUNDOS restantes (dt-based → pausa-safe: no
          // caduca al reanudar tras una pausa, a diferencia de un timestamp de reloj).
          gs.defLeft -= dt;
          if (gs.defLeft <= 0) { gs.activeDef = null; gs.activeDefCounted = false; gs.defTimer = gs.params.defEverySec; }
        } else {
          gs.defTimer -= dt;
          // No presentar una definición que NO quepa en el tiempo restante (sería
          // imposible de resolver y contaría como 0 en la nota): exige ≥60% de la ventana.
          if (gs.defTimer <= 0 && gs.pool.definitions.length && gs.timeLeft > gs.params.defWindowSec * 0.6) {
            const d = gs.pool.definitions[Math.floor(Math.random() * gs.pool.definitions.length)];
            gs.activeDef = { word: d.word, definition: d.definition, points: d.points };
            gs.activeDefCounted = false;
            gs.defLeft = gs.params.defWindowSec;
            // defPresented++ lo hace Scene al hacer VISIBLE la palabra (diana voladora),
            // para no inflar la nota si todavía no hay diana donde mostrarla.
          }
        }
        // CAMBIO de las 2 categorías que puntúan cada catRotateSec (si hay ≥2 que roten):
        // se reasigna el par, Scene re-etiqueta las dianas y se avisa en grande en pantalla.
        if (gs.pool.rotatableNames.length >= 2) {
          gs.catTimer -= dt;
          if (gs.catTimer <= 0) {
            const np = pickPair(gs.pool.rotatableNames, Math.random, gs.principalName, gs.secundariaName);
            gs.principalName = np.principalName; gs.secundariaName = np.secundariaName;
            gs.catEpoch += 1;
            gs.catTimer = gs.params.catRotateSec;
            announceCats(gs, true);
          }
        }
        // descontar las penalizaciones de mirilla activas (pausa-safe, dt-based)
        const db = gs.debuffs;
        if (db) {
          if (db.slow > 0) db.slow = Math.max(0, db.slow - dt);
          if (db.invert > 0) db.invert = Math.max(0, db.invert - dt);
          if (db.shake > 0) db.shake = Math.max(0, db.shake - dt);
        }
        if (gs.timeLeft <= 0) { gs.timeLeft = 0; endGameRef.current(); return; }
      }
      hudAcc += dt;
      if (hudAcc > 0.085) {
        hudAcc = 0;
        if (gs.feedback && now > gs.feedbackUntil) gs.feedback = null;
        setHud(snapshot(gs));
        setCooling(now < (gs.nextShotAt || 0));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [screen, announceCats]);

  // ---- abandono (desmontaje a mitad de partida) → resultado parcial ----
  const cleanupRef = useRef(() => {});
  cleanupRef.current = () => {
    if (screenRef.current === 'play' && gsRef.current.running) commitResult();
  };
  useEffect(() => () => { cleanupRef.current(); clearTimeout(gfxTimer.current); clearTimeout(catBannerTimer.current); clearTextureCache(); }, []);

  // Nota: ESC ya NO termina la partida — con mouse-look (pointer lock) ESC libera
  // el ratón; para terminar está el botón "Terminar".

  const cursoLabel = level === 'bachillerato' ? `${grade}º Bach` : `${grade}º ESO`;

  // ====================== RENDER ======================
  return (
    <div className="cz3d-root">
      {/* Fondo 3D de la plataforma (la isla orbitando): el MISMO que se ve al elegir
          la app. En JUEGO no se monta — el mundo de juego ya es esa misma isla en 3D. */}
      {screen !== 'play' && (
        <Scene3DBackground
          ambienceId={ambienceId}
          scrim={0.28}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />
      )}

      {/* ============ CARGA / ERROR ============ */}
      {loading && (
        <div className="cz3d-center">
          <div className="cz3d-spinner" />
          <p>Cargando vocabulario de {cursoLabel}…</p>
        </div>
      )}
      {!loading && (loadError || !pool) && (
        <div className="cz3d-center">
          <span className="cz3d-big-emoji">🛰️</span>
          <h2>Sin vocabulario disponible</h2>
          <p>No hay suficientes palabras para <strong>{asignatura}</strong> en {cursoLabel}.<br />Prueba con otra asignatura o curso.</p>
        </div>
      )}

      {/* ============ SELECCIÓN ============ */}
      {screen === 'select' && !loading && pool && (
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
            {/* El examen puntúa por definiciones acertadas; si la asignatura no tiene
                definiciones del rosco, la nota sería siempre 0 → se oculta ese modo. */}
            {MODOS.filter((m) => m !== 'examen' || pool.definitions.length > 0).map((m) => {
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
          {pool.definitions.length === 0 && (
            <p className="cz3d-modes-note">ℹ️ El modo <strong>Examen</strong> no está disponible para esta asignatura (no tiene definiciones).</p>
          )}

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
            amb={amb}
          />
          <div
            className="cz3d-vignette"
            data-hot={hud && hud.combo >= 5 ? '1' : '0'}
            style={{ opacity: Math.min(0.55, (hud?.combo || 0) * 0.045) }}
          />
          {hud && hud.debuffs && hud.debuffs.length > 0 && <div className="cz3d-debuff-tint" />}
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
              categories={hud.categories}
              debuffs={hud.debuffs}
            />
          )}
          {/* AVISO GRANDE de categorías, justo encima de la mirilla, pocos segundos */}
          <AnimatePresence>
            {catBanner && (
              <motion.div
                key={catBanner.id}
                className="cz3d-catbanner"
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              >
                <span className="cz3d-catbanner-tag">
                  {catBanner.isChange ? '🔄 ¡CAMBIO DE CATEGORÍAS!' : '🎯 DISPARA A ESTAS CATEGORÍAS'}
                </span>
                <span className="cz3d-catbanner-cats">
                  {catBanner.cats.map((c) => (
                    <span key={c.name} className={`cz3d-catbanner-cat ${c.role === 'principal' ? 't5' : 't2'}`}>
                      {c.name} <b>+{c.points}</b>
                    </span>
                  ))}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
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
        <p><strong>En ordenador:</strong> haz clic para capturar el ratón; luego <strong>mueve el ratón</strong> para apuntar y <strong>haz clic</strong> para disparar a la mirilla (pulsa <kbd>ESC</kbd> para soltar el ratón). <strong>En tablet/móvil:</strong> arrastra para apuntar y toca para disparar. Estás de pie en la isla: la cámara no se mueve sola, eres tú quien apunta.</p>
        <h3>🛩️ Dianas voladoras</h3>
        <p>Las palabras <strong>no están quietas</strong>: surcan el cielo describiendo arcos. Unas <strong>cruzan</strong> de lado a lado y otras se <strong>lanzan hacia arriba</strong> y caen. Síguelas con la mirilla y <strong>dispara en el momento justo</strong> antes de que escapen. Aparecen en <strong>distintos tamaños</strong>: las más <strong>pequeñas</strong> son difíciles de acertar (a mayor dificultad, más diminutas).</p>
        <h3>⭐ Gemas de bonificación</h3>
        <p>De vez en cuando cruza una <strong>gema dorada</strong> pequeña y <strong>muy rápida</strong>. Acertarla da <strong>puntos extra</strong> (no cuenta para la nota; suma a la puntuación). Fallar no penaliza, así que dispara solo si puedes alcanzarla.</p>
        <h3>⚡ Gemas trampa (riesgo)</h3>
        <p>Las <strong>gemas moradas</strong> dan <strong>aún más puntos</strong>, pero al acertarlas <strong>fastidian tu mirilla</strong> unos segundos: <b>🐌 más lenta</b>, <b>🔄 al revés</b> o <b>📳 que vibra</b>. ¡Tú decides si el premio compensa! Ojo: <strong>fallar</strong> (disparar una palabra que no puntúa) también puede provocar uno de estos castigos.</p>
        <h3>🗂️ Solo 2 categorías puntúan (¡y van cambiando!)</h3>
        <p>Todas las palabras se ven <strong>igual</strong>: no hay pistas. Mira la leyenda de abajo: la categoría <b style={{ color: '#fde68a' }}>principal da +5</b> y la <b style={{ color: '#a5f3fc' }}>secundaria +2</b>. Cada poco tiempo <strong>cambian las categorías que puntúan</strong> y se avisa <strong>en grande sobre la mirilla</strong>: ¡atento al cambio! Reconoce a qué categoría pertenece cada palabra y <strong>léela antes de disparar</strong>. El resto <strong>no puntúan</strong>: si disparas una, <strong>no pierdes puntos pero huyen varias válidas</strong> que estuvieran volando.</p>
        <h3>📖 Retos de definición</h3>
        <p>De vez en cuando aparece una <strong>definición</strong> arriba. Esa palabra vuela <strong>entre las demás</strong> (<strong>no se resalta</strong>): tienes que reconocerla y dispararle al vuelo. En el examen, <strong>tu nota sale de estas definiciones</strong>.</p>
        <p>La calidad gráfica se adapta a tu equipo automáticamente; puedes cambiarla a mano abajo.</p>
      </InstructionsModal>

      {/* ============ MATERIAL DE ESTUDIO ============ */}
      {pool && (
      <InstructionsModal isOpen={showVocab} onClose={() => setShowVocab(false)} title={`Material de estudio · ${asignatura}`}>
        {studyCats.length > 0 && (
          <>
            <h3>🗂️ Categorías que pueden puntuar</h3>
            {studyCats.length >= 2 && (
              <p className="cz3d-study-note">Durante la partida, 2 de estas categorías puntúan a la vez (+5 y +2) y <strong>van cambiando</strong>.</p>
            )}
            {studyCats.map((c) => {
              if (!c.words.length) return null;
              return (
                <div key={c.name} className="cz3d-study-cat">
                  <h4>✓ {c.name}</h4>
                  <p className="cz3d-study-words">{c.words.join(' · ')}</p>
                </div>
              );
            })}
          </>
        )}
        {studyOther.length > 0 && (
          <div className="cz3d-study-cat">
            <h4 className="pen">🚫 Otras palabras (señuelos, no puntúan)</h4>
            <p className="cz3d-study-words">{studyOther.join(' · ')}</p>
            <p className="cz3d-study-note">Dispararlas no resta puntos, pero hace <strong>huir válidas</strong> que estuvieran volando.</p>
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
      )}
    </div>
  );
};

// Espejo del estado autoritativo → props del HUD.
function snapshot(gs) {
  return {
    mode: gs.mode,
    isExam: !!gs.params?.isExam,
    timeLeft: gs.timeLeft,
    totalTime: gs.totalTime,
    score: gs.score,
    combo: gs.combo,
    activeDef: gs.activeDef,
    defRemaining: gs.activeDef ? gs.defLeft : 0,
    defWindow: gs.params?.defWindowSec || 9,
    defSolved: gs.defSolved,
    defPresented: gs.defPresented,
    feedback: gs.feedback,
    hit: gs.hit,
    categories: currentCats(gs), // par activo (rotan durante la partida)
    debuffs: gs.debuffs ? DEBUFF_TYPES.filter((t) => gs.debuffs[t] > 0) : [],
  };
}

export default Cazapalabras3D;
