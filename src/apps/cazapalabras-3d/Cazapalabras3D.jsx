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
import {
  Target as TargetIcon, Square, Trophy, Crosshair as CrosshairIcon, RefreshCw, LayoutGrid, Settings2,
  BookOpen, Flame, Pause, Sprout, Zap, GraduationCap, Info,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, ModeSelect, ResultsScreen, GameLoading, GameEmpty, GameButton,
} from '../_shared/kit';
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
  DIFICULTADES, MODOS, DEF_BONUS_MULT,
  SCORE_PRINCIPAL, SCORE_SECUNDARIA,
  DEBUFF, DEBUFF_TYPES, MISS_DEBUFF_CHANCE,
  BUFF, BUFF_TYPES,
} from './engine/config';
import './Cazapalabras3D.css';

// Etiquetas de los debuffs (penalizaciones de mirilla) para el feedback/HUD.
const DEBUFF_LABEL = { slow: '🐌 mirilla lenta', invert: '🔄 controles al revés', shake: '📳 vibración' };
// Etiquetas de los buffs (bonificaciones de las gemas doradas) para el feedback.
const BUFF_LABEL = { rapid: '⚡ disparo rápido', swift: '🚀 mirilla ágil', time: `⏱ +${BUFF.timeBonusSec}s` };

// Aplica un debuff aleatorio (o el indicado) durante DEBUFF.durationSec. Devuelve el tipo.
function applyDebuff(gs, type) {
  const t = type || DEBUFF_TYPES[Math.floor(Math.random() * DEBUFF_TYPES.length)];
  if (!gs.debuffs) gs.debuffs = { slow: 0, invert: 0, shake: 0 };
  gs.debuffs[t] = DEBUFF.durationSec;
  return t;
}

// Aplica un buff aleatorio (o el indicado). 'rapid'/'swift' duran BUFF.durationSec;
// 'time' es instantáneo (suma segundos al reloj). Devuelve el tipo.
function applyBuff(gs, type) {
  const t = type || BUFF_TYPES[Math.floor(Math.random() * BUFF_TYPES.length)];
  if (!gs.buffs) gs.buffs = { rapid: 0, swift: 0 };
  // 'time' suma al reloj; también a totalTime para que la barra de tiempo refleje el
  // extra (si solo subiéramos timeLeft, la barra quedaría clavada al 100%).
  if (t === 'time') { gs.timeLeft += BUFF.timeBonusSec; gs.totalTime += BUFF.timeBonusSec; }
  else gs.buffs[t] = BUFF.durationSec;
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

// Presentación de cada modo en la pantalla previa (tono del kit + icono)
const MODE_UI = {
  facil: { tone: 'easy', icon: Sprout },
  medio: { tone: 'medium', icon: Flame },
  dificil: { tone: 'hard', icon: Zap },
  examen: { tone: 'exam', icon: GraduationCap },
};
const SHELL = { accent: '#8b5cf6', accent2: '#22d3ee', theme: 'dark', className: 'cz3d-shell' };
const SCOPE_STYLE = { '--gk-accent': '#8b5cf6', '--gk-accent-2': '#22d3ee' };
// nombres de categoría de la BD (snake_case) legibles en pantalla
const prettyCat = (name) => String(name || '').replace(/[_-]+/g, ' ').trim();

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

    // gema de BONIFICACIÓN (dorada): puntos extra (paralelos, no cuenta como palabra ni
    // def → no afecta a la nota de examen) MÁS un buff: ⚡ disparo rápido, 🚀 mirilla ágil
    // o ⏱ tiempo extra. Sube el combo como recompensa por acertar algo veloz.
    if (isBonus) {
      const pts = data.value || 9;
      gs.score += pts; gs.combo += 1; gs.bestCombo = Math.max(gs.bestCombo, gs.combo);
      const b = applyBuff(gs);
      fb(`⭐ +${pts} · ${BUFF_LABEL[b]}`, '#fde68a');
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
      buffs: { rapid: 0, swift: 0 },
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
        // descontar las penalizaciones (debuffs) y bonificaciones (buffs) temporales
        // activas (pausa-safe, dt-based)
        const db = gs.debuffs;
        if (db) {
          if (db.slow > 0) db.slow = Math.max(0, db.slow - dt);
          if (db.invert > 0) db.invert = Math.max(0, db.invert - dt);
          if (db.shake > 0) db.shake = Math.max(0, db.shake - dt);
        }
        const bf = gs.buffs;
        if (bf) {
          if (bf.rapid > 0) bf.rapid = Math.max(0, bf.rapid - dt);
          if (bf.swift > 0) bf.swift = Math.max(0, bf.swift - dt);
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
  const modosVisibles = pool ? MODOS.filter((m) => m !== 'examen' || pool.definitions.length > 0) : [];
  const asignaturaLabel = prettyCat(asignatura).replace(/^./, (ch) => ch.toUpperCase());
  const sumMode = hud?.mode && DIFICULTADES[hud.mode] ? hud.mode : 'medio';

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

      {/* ============ CARGA / ERROR / SELECCIÓN / RESUMEN (capa con scroll propio) ============ */}
      {screen !== 'play' && (
        <div className="cz3d-scroll">
          {loading && (
            <GameShell {...SHELL}>
              <GameLoading label={`Cargando vocabulario de ${cursoLabel}…`} />
            </GameShell>
          )}
          {!loading && (loadError || !pool) && (
            <GameShell {...SHELL}>
              <GameEmpty title="Sin vocabulario disponible">
                No hay suficientes palabras para <strong>{prettyCat(asignatura)}</strong> en {cursoLabel}. Prueba con otra asignatura o curso.
              </GameEmpty>
            </GameShell>
          )}

          {/* ============ SELECCIÓN ============ */}
          {screen === 'select' && !loading && pool && (
            <GameShell {...SHELL} className={`cz3d-shell ${modosVisibles.length === 4 ? 'cz3d-shell--four' : ''}`}>
              <ModeSelect
                description={`Dispara a las palabras que surcan el cielo y aprende vocabulario y definiciones de ${asignaturaLabel} · ${cursoLabel}.`}
                modes={modosVisibles.map((m) => {
                  const d = DIFICULTADES[m];
                  return {
                    id: m,
                    tone: MODE_UI[m].tone,
                    icon: MODE_UI[m].icon,
                    title: d.label,
                    desc: MODE_DESC[m],
                    features: d.isExam
                      ? ['Nota sobre 10 por definiciones', `${d.durationSec} s de partida`]
                      : [`${d.durationSec} s de partida`, `Definición cada ${d.defEverySec} s`],
                  };
                })}
                onSelect={start}
                onHelp={() => setShowHelp(true)}
                onStudy={() => setShowVocab(true)}
                extra={<GraphicsQualitySelector className="gfxsel-on-dark cz3d-gfx" />}
                footer={pool.definitions.length === 0 ? (
                  <span className="cz3d-note"><Info size={14} /> El modo <strong>Examen</strong> no está disponible para esta asignatura (no tiene definiciones).</span>
                ) : null}
              />
            </GameShell>
          )}

          {/* ============ RESUMEN: EXAMEN ============ */}
          {screen === 'summary' && summary && summary.isExam && (
            <GameShell {...SHELL}>
              <ResultsScreen
                subtitle={`Cazapalabras 3D · ${asignaturaLabel} · ${cursoLabel}`}
                nota={Number(summary.nota) || 0}
                points={summary.score}
                stats={[
                  { icon: BookOpen, tone: 'good', label: 'Definiciones', value: `${summary.defSolved}/${summary.defPresented}` },
                  { icon: TargetIcon, tone: 'score', label: 'Palabras', value: summary.wordsHit },
                  { icon: Flame, tone: 'streak', label: 'Mejor combo', value: `×${summary.bestCombo}` },
                ]}
                actions={[
                  { label: 'Repetir examen', onClick: () => start(gsRef.current.mode), icon: RefreshCw },
                  { label: 'Cambiar de modo', onClick: () => setScreen('select'), icon: LayoutGrid, variant: 'soft' },
                ]}
              />
            </GameShell>
          )}

          {/* ============ RESUMEN: PRÁCTICA ============ */}
          {screen === 'summary' && summary && !summary.isExam && (
            <GameShell {...SHELL}>
              <motion.div
                className="cz3d-sum"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 170, damping: 20 }}
              >
                <div className="cz3d-sum__top">
                  <span className={`gk-chip gk-chip--mode gk-tone-${MODE_UI[sumMode].tone}`}>
                    {React.createElement(MODE_UI[sumMode].icon, { size: 13 })} {DIFICULTADES[sumMode].label}
                  </span>
                  <h2 className="cz3d-sum__title">¡Partida terminada!</h2>
                  <p className="cz3d-sum__subtitle">Cazapalabras 3D · {asignaturaLabel} · {cursoLabel}</p>
                </div>
                <div className="cz3d-sum__hero">
                  <span className="cz3d-sum__burst" aria-hidden="true" />
                  <TargetBadge />
                  <div className="cz3d-sum__verdict">
                    <span className="cz3d-sum__kicker"><Trophy size={15} /> Puntuación final</span>
                    <strong>{summary.score.toLocaleString('es-ES')}</strong>
                    <span className="cz3d-sum__unit">puntos</span>
                  </div>
                </div>
                <div className="cz3d-sum__stats">
                  {[
                    { icon: TargetIcon, tone: 'score', label: 'Palabras', value: summary.wordsHit },
                    { icon: BookOpen, tone: 'good', label: 'Definiciones', value: `${summary.defSolved}/${summary.defPresented}` },
                    { icon: Flame, tone: 'streak', label: 'Mejor combo', value: `×${summary.bestCombo}` },
                  ].map((st) => (
                    <div key={st.label} className={`cz3d-sum__stat gk-stat--${st.tone}`}>
                      <span className="gk-stat__icon"><st.icon size={15} /></span>
                      <span className="cz3d-sum__stat-value">{st.value}</span>
                      <span className="cz3d-sum__stat-label">{st.label}</span>
                    </div>
                  ))}
                </div>
                <div className="cz3d-sum__actions">
                  <GameButton size="lg" icon={RefreshCw} onClick={() => start(gsRef.current.mode)}>Otra partida</GameButton>
                  <GameButton size="lg" variant="soft" icon={LayoutGrid} onClick={() => setScreen('select')}>Cambiar de modo</GameButton>
                </div>
              </motion.div>
            </GameShell>
          )}
        </div>
      )}

      {/* ============ JUEGO ============ */}
      {screen === 'play' && (
        <div className="cz3d-play gk-shell gk-theme-dark" style={SCOPE_STYLE}>
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
              buffs={hud.buffs}
            />
          )}
          {/* AVISO GRANDE de categorías, CENTRADO y arriba, pocos segundos. El centrado
              lo hace el wrapper flex (no `translateX(-50%)` en el motion.div: framer-motion
              sobrescribe `transform` con su y/scale y lo descentraría a la derecha). */}
          <div className="cz3d-catbanner-wrap">
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
                  <span className={`cz3d-catbanner__tag ${catBanner.isChange ? 'is-change' : ''}`}>
                    {catBanner.isChange ? <RefreshCw size={18} /> : <CrosshairIcon size={18} />}
                    {catBanner.isChange ? '¡Cambio de categorías!' : 'Dispara a estas categorías'}
                  </span>
                  <span className="cz3d-catbanner__cats">
                    {catBanner.cats.map((c) => (
                      <span key={c.name} className={`cz3d-catbanner__cat ${c.role === 'principal' ? 't5' : 't2'}`}>
                        {prettyCat(c.name)} <b>+{c.points}</b>
                      </span>
                    ))}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <GameButton variant="danger" size="sm" icon={Square} className="cz3d-exit" onClick={endGame} title="Terminar la partida" aria-label="Terminar la partida">
            <span className="cz3d-hide-sm">Terminar</span>
          </GameButton>
          {isPaused && (
            <div className="cz3d-paused">
              <span className="cz3d-paused__card"><span className="cz3d-paused__ico"><Pause size={22} /></span> En pausa</span>
            </div>
          )}
        </div>
      )}

      {/* Ámbito del kit sin caja (display: contents) para avisos y modales de la raíz */}
      <div className="gk-shell gk-theme-dark cz3d-portal" style={SCOPE_STYLE}>
        {/* ============ TOAST CALIDAD ============ */}
        <AnimatePresence>
          {gfxToast && (
            <motion.div className="cz3d-toast" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="cz3d-toast__ico"><Settings2 size={14} /></span> {gfxToast}
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
          <p>De vez en cuando cruza una <strong>gema dorada</strong> pequeña y <strong>muy rápida</strong>. Acertarla da <strong>puntos extra</strong> (no cuenta para la nota) y además una <strong>ventaja temporal</strong>: <b>⚡ disparo rápido</b>, <b>🚀 mirilla más ágil</b> o <b>⏱ segundos extra</b>. Cada ventaja muestra su <strong>barra de duración</strong> en pantalla. Fallar no penaliza, así que dispara solo si puedes alcanzarla.</p>
          <h3>⚡ Gemas trampa (riesgo)</h3>
          <p>Las <strong>gemas moradas</strong> dan <strong>aún más puntos</strong>, pero al acertarlas <strong>fastidian tu mirilla</strong> unos segundos: <b>🐌 más lenta</b>, <b>🔄 al revés</b> o <b>📳 que vibra</b>. ¡Tú decides si el premio compensa! Ojo: <strong>fallar</strong> (disparar una palabra que no puntúa) también puede provocar uno de estos castigos.</p>
          <h3>🗂️ Solo 2 categorías puntúan (¡y van cambiando!)</h3>
          <p>Todas las palabras se ven <strong>igual</strong>: no hay pistas. Mira la leyenda de abajo: la categoría <b style={{ color: '#fde68a' }}>principal da +5</b> y la <b style={{ color: '#a5f3fc' }}>secundaria +2</b>. Cada poco tiempo <strong>cambian las categorías que puntúan</strong> y se avisa <strong>en grande sobre la mirilla</strong>: ¡atento al cambio! Reconoce a qué categoría pertenece cada palabra y <strong>léela antes de disparar</strong>. El resto <strong>no puntúan</strong>: si disparas una, <strong>no pierdes puntos pero huyen varias válidas</strong> que estuvieran volando.</p>
          <h3>📖 Retos de definición</h3>
          <p>De vez en cuando aparece una <strong>definición</strong> arriba. Esa palabra vuela <strong>entre las demás</strong> (<strong>no se resalta</strong>): tienes que reconocerla y dispararle al vuelo. En el examen, <strong>tu nota sale de estas definiciones</strong>.</p>
          <h3>🎓 Modos de juego</h3>
          <div className="instr-modes">
            <div className="instr-mode easy"><strong>Fácil</strong>Más tiempo y definiciones más espaciadas.</div>
            <div className="instr-mode medium"><strong>Medio · Difícil</strong>Más ritmo, palabras más pequeñas y más definiciones.</div>
            <div className="instr-mode exam"><strong>Examen</strong>Tu nota /10 sale de las definiciones que encuentres y aciertes.</div>
          </div>
          <p>La calidad gráfica se adapta a tu equipo automáticamente; puedes cambiarla a mano en la pantalla de inicio.</p>
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
                    <h4>{prettyCat(c.name)}</h4>
                    <div className="cz3d-study-words">
                      {c.words.map((w) => <span key={w} className="cz3d-study-chip">{w}</span>)}
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {studyOther.length > 0 && (
            <div className="cz3d-study-cat is-decoy">
              <h4>Otras palabras (señuelos, no puntúan)</h4>
              <div className="cz3d-study-words">
                {studyOther.map((w) => <span key={w} className="cz3d-study-chip">{w}</span>)}
              </div>
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
    </div>
  );
};

// Diana dibujada para el resumen de práctica (un solo ejemplar en pantalla).
function TargetBadge() {
  return (
    <svg className="cz3d-target" viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <radialGradient id="cz3d-tg-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#22d3ee" stopOpacity=".45" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cz3d-tg-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="cz3d-tg-core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="cz3d-tg-arrow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0abfc" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="78" fill="url(#cz3d-tg-glow)" />
      <ellipse cx="80" cy="146" rx="42" ry="6" fill="#000" opacity=".3" />
      <circle cx="80" cy="80" r="60" fill="url(#cz3d-tg-ring)" />
      <circle cx="80" cy="80" r="60" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
      <circle cx="80" cy="80" r="46" fill="#1e1b4b" />
      <circle cx="80" cy="80" r="40" fill="url(#cz3d-tg-ring)" />
      <circle cx="80" cy="80" r="27" fill="#1e1b4b" />
      <circle cx="80" cy="80" r="21" fill="url(#cz3d-tg-core)" />
      <circle cx="80" cy="80" r="8" fill="#fff" opacity=".9" />
      <path d="M44 46 C54 36 66 31 80 30" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* flecha clavada en el centro */}
      <path d="M80 80 L132 28" stroke="url(#cz3d-tg-arrow)" strokeWidth="6" strokeLinecap="round" />
      <path d="M124 22 L142 18 L138 36 Z" fill="#a21caf" />
      <path d="M126 16 L138 12 M134 30 L146 26" stroke="#f0abfc" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="80" r="5" fill="#a21caf" />
    </svg>
  );
}

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
    // efectos activos con barra de duración (remaining/total). Debuffs (penalización)
    // y buffs temporizados (bonificación); 'time' es instantáneo → no aparece aquí.
    debuffs: gs.debuffs
      ? DEBUFF_TYPES.filter((t) => gs.debuffs[t] > 0)
        .map((t) => ({ type: t, remaining: gs.debuffs[t], total: DEBUFF.durationSec }))
      : [],
    buffs: gs.buffs
      ? ['rapid', 'swift'].filter((t) => gs.buffs[t] > 0)
        .map((t) => ({ type: t, remaining: gs.buffs[t], total: BUFF.durationSec }))
      : [],
  };
}

export default Cazapalabras3D;
