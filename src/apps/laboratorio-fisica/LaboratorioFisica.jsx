// Laboratorio de Física 3D — simulador de fuerzas y fluidos (ESO + Bachillerato).
// Tres modos estándar de la plataforma: Explora (sandbox), Retos (guiado) y
// Examen (POE, genera nota /10 + puntos paralelos). Catálogo acumulativo por
// curso definido en registry.js. Calidad gráfica: ajuste global de plataforma.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Compass, Target, GraduationCap, Lightbulb, Check, X, FlaskConical,
  SlidersHorizontal, ChevronDown, LineChart, Info, Star, LayoutGrid, RefreshCw, Brain, Eye,
  PanelRightClose, Play, Pause, RotateCcw, Trophy, Settings2, ChevronRight, Sparkles,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ModeSelect, ModeChip, Panel, GameButton, ProgressBar,
  ResultsScreen, FeedbackItem,
} from '../_shared/kit';
import SimInfoModal from './components/SimInfoModal';
import SIM_INFO from './simInfo';
import { temaDeSim, pickAmbience, NEUTRAL_AMBIENCE } from './engine/ambiences';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import Scene3DBackground from '@/components/ui/Scene3DBackground';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { GLOBAL_QUALITY_PARAMS, QUALITY_LABELS } from '@/services/graphicsQuality';
import SimViewport from './components/SimViewport';
import ParamPanel from './components/ParamPanel';
import GraphPanel from './components/GraphPanel';
import EnergyBars from './components/EnergyBars';
import ExamScreen from './components/ExamScreen';
import { SIMS, catalogoPara, defaultsDe, simPorId } from './registry';
import { generarExamen, examPool, cursoLabel } from './engine/exam';
import './LaboratorioFisica.css';

const EXAM_MAX_SCORE = 2200; // 10 preguntas × máximo de 220 puntos

// Colores de la app (icono: cristal azul + violeta). Se aplican al escenario
// del kit y a las capas a pantalla completa que heredan sus variables.
const ACCENT = '#0ea5e9';
const ACCENT_2 = '#8b5cf6';
const SCOPE_STYLE = { '--gk-accent': ACCENT, '--gk-accent-2': ACCENT_2 };

// Tinte de cada grupo del catálogo (solo presentación).
const GROUP_TINT = {
  '1º ESO': '#10b981', '2º ESO': '#14b8a6', '3º ESO': '#0ea5e9', '4º ESO': '#6366f1',
  '1º Bach': '#f59e0b', '2º Bach': '#f43f5e', ampliacion: '#d946ef',
};

function RetosList({ sim, done, pistas, onTogglePista }) {
  return (
    <section className="fislab-section fislab-retos">
      <h5 className="fislab-section__title">
        <Target size={13} /> Retos
        <span className="fislab-section__count">{done.length}/{sim.retos.length}</span>
      </h5>
      <ProgressBar value={done.length} max={sim.retos.length} tone="good" />
      {sim.retos.map((reto, i) => {
        const isDone = done.includes(reto.id);
        const pistaKey = `${sim.id}:${reto.id}`;
        return (
          <div key={reto.id} className={`fislab-reto ${isDone ? 'is-done' : ''}`}>
            <span className="fislab-reto__medal">{isDone ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <div className="fislab-reto__body">
              <strong>{reto.titulo}</strong>
              <p>{reto.descripcion}</p>
              {!isDone && !pistas[pistaKey] && (
                <button type="button" className="fislab-reto__hintbtn" onClick={() => onTogglePista(pistaKey)}>
                  <Lightbulb size={13} /> Ver pista <small>(pierdes el bonus de +25)</small>
                </button>
              )}
              {pistas[pistaKey] && !isDone && (
                <p className="fislab-reto__hint"><Lightbulb size={14} /> {reto.pista}</p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

const LaboratorioFisica = ({ level: levelProp, grade: gradeProp, onGameComplete }) => {
  const routeParams = useParams();
  const level = levelProp || routeParams.level || 'eso';
  const grade = useMemo(
    () => parseInt(gradeProp ?? routeParams.grade, 10) || 1,
    [gradeProp, routeParams.grade],
  );
  const catalogo = useMemo(() => catalogoPara(level, grade), [level, grade]);
  const examIncluidos = useMemo(() => examPool(SIMS, level, grade), [level, grade]);
  // ¿hay simulaciones explorables (otros cursos / ampliación) que NO se examinan?
  const hayExcluidasDelExamen = useMemo(
    () => catalogo.some(({ sim }) => !examIncluidos.includes(sim)),
    [catalogo, examIncluidos],
  );

  // ---- calidad gráfica global + governor ----
  const { pref, tier: prefTier } = useGraphicsQuality();
  const [tierOverride, setTierOverride] = useState(null);
  useEffect(() => { setTierOverride(null); }, [pref, prefTier]);
  const tier = tierOverride || prefTier;
  const [gfxToast, setGfxToast] = useState(null);
  const gfxToastTimer = useRef(null);
  const handleAutoDowngrade = useCallback((next) => {
    setTierOverride(next);
    setGfxToast(`Rendimiento bajo: calidad ajustada a ${QUALITY_LABELS[next]}`);
    clearTimeout(gfxToastTimer.current);
    gfxToastTimer.current = setTimeout(() => setGfxToast(null), 4500);
  }, []);
  const qualityObj = useMemo(() => ({
    tier,
    particleBudget: GLOBAL_QUALITY_PARAMS[tier].particleBudget,
    shadows: GLOBAL_QUALITY_PARAMS[tier].shadows,
  }), [tier]);

  // ---- estado de juego ----
  const [screen, setScreen] = useState('select'); // select | catalog | sim | exam | summary
  const [mode, setMode] = useState('explora');    // explora | retos | examen
  const [activeSimId, setActiveSimId] = useState(null);
  const [params, setParams] = useState({});
  const [playing, setPlaying] = useState(false);
  const [simDone, setSimDone] = useState(false); // la simulación llegó a su final (congelada)
  const [ambiente, setAmbiente] = useState(null); // clima/entorno sorteado al entrar
  const [speed, setSpeed] = useState(1);
  const [resetToken, setResetToken] = useState(0);
  const [showVectors, setShowVectors] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [readouts, setReadouts] = useState([]);
  const [formulaViva, setFormulaViva] = useState('');
  const [energia, setEnergia] = useState(null);
  const [retosDone, setRetosDone] = useState({});
  const [retosPoints, setRetosPoints] = useState(0);
  const [pistasAbiertas, setPistasAbiertas] = useState({});
  const [retoToast, setRetoToast] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFormulario, setShowFormulario] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showInfo, setShowInfo] = useState(false);          // modal de info de la simulación
  const [infoHidden, setInfoHidden] = useState(() => {       // "No volver a mostrar" (global)
    try { return localStorage.getItem('fislab-info-hidden') === '1'; } catch { return false; }
  });
  const [panelOpen, setPanelOpen] = useState(true);   // panel de control flotante (pantalla de simulación)
  const [graphOpen, setGraphOpen] = useState(true);   // gráfica flotante
  const [examQuestions, setExamQuestions] = useState(null);
  const [summary, setSummary] = useState(null);

  // data: null (no {}) — así el guard `if (!d) return` de cada escena salta hasta
  // que su reinit (en useEffect) puebla world.data; con {} (truthy) el useFrame
  // rápido leía subcampos aún inexistentes (d.trail.length…) en el primer frame.
  const worldRef = useRef({ t: 0, _acc: 0, data: null });
  const seriesRef = useRef([]);
  const lastUiRef = useRef(0);
  const visitedRef = useRef(new Set());
  const sessionStartRef = useRef(null);
  const trackedRef = useRef(false);
  const examResultsRef = useRef([]);
  const retoToastTimer = useRef(null);

  // espejo del estado para callbacks estables (telemetría a 60 Hz) y cleanup
  const stateRef = useRef({});
  stateRef.current = {
    screen, mode, activeSimId, params, playing, simDone, retosDone, retosPoints,
    pistasAbiertas, examQuestions,
  };

  const activeSim = activeSimId ? simPorId(activeSimId) : null;

  // ---- retos ----
  const completarReto = useCallback((simId, reto) => {
    setRetosDone((prev) => {
      const cur = prev[simId] || [];
      if (cur.includes(reto.id)) return prev;
      const sinPista = !stateRef.current.pistasAbiertas[`${simId}:${reto.id}`];
      const pts = 50 + (sinPista ? 25 : 0);
      setRetosPoints((p) => p + pts);
      setRetoToast(`🏆 ¡Reto superado! ${reto.titulo} (+${pts} pts)`);
      clearTimeout(retoToastTimer.current);
      retoToastTimer.current = setTimeout(() => setRetoToast(null), 3500);
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.72 } });
      return { ...prev, [simId]: [...cur, reto.id] };
    });
  }, []);

  // ---- telemetría (llega a 60 Hz desde la escena; la UI se actualiza a 10 Hz) ----
  const handleTelemetry = useCallback((tel) => {
    const st = stateRef.current;
    if (tel.series) {
      const buf = seriesRef.current;
      const lastT = buf.length ? buf[buf.length - 1].t : -1;
      if (tel.t < lastT) buf.length = 0; // la escena se reinició
      else if (tel.t - lastT >= 1 / 30) buf.push({ t: tel.t, ...tel.series });
      if (buf.length > 2400) buf.splice(0, buf.length - 2400);
    }
    if (tel.done) { if (st.playing) setPlaying(false); if (!st.simDone) setSimDone(true); }
    if (st.mode === 'retos' && st.activeSimId) {
      const sim = simPorId(st.activeSimId);
      const done = st.retosDone[st.activeSimId] || [];
      sim?.retos?.forEach((reto) => {
        if (done.includes(reto.id)) return;
        let ok = false;
        try { ok = !!reto.check(tel, st.params); } catch { ok = false; }
        if (ok) completarReto(st.activeSimId, reto);
      });
    }
    const now = performance.now();
    if (now - lastUiRef.current > 100) {
      lastUiRef.current = now;
      setReadouts(tel.readouts || []);
      setFormulaViva(tel.formulaViva || '');
      setEnergia(tel.energia || null);
    }
  }, [completarReto]);

  // ---- tracking: una llamada a onGameComplete por partida ----
  const firePractice = useCallback(() => {
    if (trackedRef.current) return;
    const visited = visitedRef.current.size;
    if (!visited) return;
    trackedRef.current = true;
    const st = stateRef.current;
    const durationSeconds = Math.round((Date.now() - (sessionStartRef.current || Date.now())) / 1000);
    const cat = catalogoPara(level, grade);
    if (st.mode === 'retos') {
      const totalRetos = cat.reduce((acc, c) => acc + (c.sim.retos?.length || 0), 0);
      const doneCount = Object.values(st.retosDone).reduce((a, l) => a + l.length, 0);
      onGameComplete?.({
        mode: 'practice', score: st.retosPoints, maxScore: totalRetos * 75,
        correctAnswers: doneCount, totalQuestions: totalRetos, durationSeconds,
      });
    } else {
      onGameComplete?.({
        mode: 'practice', score: visited * 20, maxScore: cat.length * 20,
        correctAnswers: visited, totalQuestions: cat.length, durationSeconds,
      });
    }
  }, [level, grade, onGameComplete]);

  const computeExamTotals = useCallback((results, total) => {
    let qScore = 0; let predCorrect = 0; let explCorrect = 0; let points = 0;
    results.forEach((r) => {
      if (!r) return;
      qScore += (r.predOk ? 0.7 : 0) + (r.explOk ? 0.3 : 0);
      if (r.predOk) predCorrect++;
      if (r.explOk) explCorrect++;
      points += r.puntos || 0;
    });
    const nota = Math.round((qScore / total) * 100) / 10;
    return { nota, predCorrect, explCorrect, points };
  }, []);

  const finishExam = useCallback((results) => {
    const total = stateRef.current.examQuestions?.length || 10;
    const { nota, predCorrect, explCorrect, points } = computeExamTotals(results, total);
    const durationSeconds = Math.round((Date.now() - (sessionStartRef.current || Date.now())) / 1000);
    if (!trackedRef.current) {
      trackedRef.current = true;
      onGameComplete?.({
        mode: 'test', score: points, maxScore: EXAM_MAX_SCORE,
        correctAnswers: predCorrect, totalQuestions: total, durationSeconds, nota,
      });
    }
    setSummary({ nota, points, predCorrect, explCorrect, total, results });
    setScreen('summary');
    setShowAbandon(false);
    if (nota >= 5) confetti({ particleCount: 170, spread: 95, origin: { y: 0.55 } });
  }, [computeExamTotals, onGameComplete]);

  // abandono a mitad de examen → nota parcial (patrón Anagramas), también al desmontar
  const cleanupRef = useRef(() => {});
  cleanupRef.current = () => {
    if (trackedRef.current) return;
    const st = stateRef.current;
    if (st.screen === 'exam' && st.examQuestions) {
      const total = st.examQuestions.length;
      const { nota, predCorrect, points } = computeExamTotals(examResultsRef.current || [], total);
      trackedRef.current = true;
      onGameComplete?.({
        mode: 'test', score: points, maxScore: EXAM_MAX_SCORE,
        correctAnswers: predCorrect, totalQuestions: total,
        durationSeconds: Math.round((Date.now() - (sessionStartRef.current || Date.now())) / 1000),
        nota,
      });
    } else if ((st.screen === 'catalog' || st.screen === 'sim') && visitedRef.current.size) {
      firePractice();
    }
  };
  useEffect(() => () => { cleanupRef.current(); }, []);

  // ---- navegación ----
  const startMode = (m) => {
    setMode(m);
    visitedRef.current = new Set();
    setRetosDone({});
    setRetosPoints(0);
    setPistasAbiertas({});
    trackedRef.current = false;
    sessionStartRef.current = Date.now();
    // El examen pasa primero por una pantalla de aviso (temas incluidos) y
    // arranca de verdad con comenzarExamen().
    setScreen(m === 'examen' ? 'exam-intro' : 'catalog');
  };

  const comenzarExamen = () => {
    examResultsRef.current = [];
    trackedRef.current = false;
    sessionStartRef.current = Date.now();
    setExamQuestions(generarExamen(SIMS, level, grade, (Date.now() & 0x7fffffff) || 1));
    setScreen('exam');
  };

  const abrirSim = (sim) => {
    setActiveSimId(sim.id);
    setParams(defaultsDe(sim));
    worldRef.current = { t: 0, _acc: 0, data: null }; // ver nota en la def. de worldRef
    seriesRef.current = [];
    setResetToken((t) => t + 1);
    setPlaying(false);
    setSimDone(false);
    setReadouts([]);
    setFormulaViva('');
    setPanelOpen(true);
    setGraphOpen(true);
    visitedRef.current.add(sim.id);
    // cámaras cerradas (túnel) → estudio neutro; el resto, clima sorteado al entrar
    setAmbiente(sim.entornoNeutro ? NEUTRAL_AMBIENCE : pickAmbience(temaDeSim(sim.id), Math.random()));
    setShowInfo(!infoHidden); // se abre la info al entrar (salvo "no volver a mostrar")
    setScreen('sim');
  };

  // "No volver a mostrar": preferencia global persistente (afecta solo a la apertura
  // automática; el botón "Info" de la barra sigue funcionando siempre).
  const toggleInfoHidden = useCallback(() => {
    setInfoHidden((h) => {
      const next = !h;
      try { localStorage.setItem('fislab-info-hidden', next ? '1' : '0'); } catch { /* noop */ }
      return next;
    });
  }, []);

  const resetSim = () => {
    seriesRef.current = [];
    setResetToken((t) => t + 1);
    setPlaying(false);
    setSimDone(false);
  };

  // Play/Pause: si la simulación ya terminó (congelada en el final), al pulsar Play
  // se reinicia desde el principio y se reproduce de nuevo (evita un botón "muerto").
  const handlePlayPause = () => {
    if (!playing && simDone) {
      seriesRef.current = [];
      setSimDone(false);
      setResetToken((t) => t + 1);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  // Cambiar un parámetro tras finalizar quita el estado "congelado" (la escena
  // se reinicia con las nuevas condiciones iniciales mientras está en pausa).
  const handleParamChange = (key, value) => {
    if (simDone) setSimDone(false);
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const volverACatalogo = () => { setScreen('catalog'); setActiveSimId(null); };
  const volverASelect = () => {
    if (mode !== 'examen') firePractice();
    setScreen('select');
    setActiveSimId(null);
    setSummary(null);
  };

  const ActiveScene = activeSim?.Scene;
  const cursoActual = cursoLabel({ level, grade });

  // las pantallas de menú (sin escenario propio) muestran el entorno 3D de fondo
  const enPantallaMenu = screen === 'select' || screen === 'catalog' || screen === 'summary';

  // ---- derivados SOLO de presentación ----
  // Catálogo agrupado por curso (respeta el orden de SIMS) para pintar secciones.
  const grupos = useMemo(() => {
    const out = [];
    const byKey = new Map();
    catalogo.forEach((entry) => {
      const key = entry.comoAmpliacion ? 'ampliacion' : cursoLabel(entry.sim.curso);
      let g = byKey.get(key);
      if (!g) {
        g = { key, label: entry.comoAmpliacion ? 'Ampliación' : key, items: [], nueva: false };
        byKey.set(key, g);
        out.push(g);
      }
      g.items.push(entry);
      if (entry.esNueva && !entry.comoAmpliacion) g.nueva = true;
    });
    return out;
  }, [catalogo]);
  const totalRetos = catalogo.reduce((acc, c) => acc + (c.sim.retos?.length || 0), 0);
  const retosHechos = Object.values(retosDone).reduce((acc, l) => acc + l.length, 0);
  const modeTone = mode === 'retos' ? 'medium' : mode === 'examen' ? 'exam' : 'easy';
  const modeLabel = mode === 'retos' ? 'Retos' : mode === 'examen' ? 'Examen' : 'Explora';
  const simEstado = playing ? 'run' : simDone ? 'done' : 'pause';
  const simEstadoLabel = playing ? 'Simulando' : simDone ? 'Terminada' : 'En pausa';
  const shellProps = { accent: ACCENT, accent2: ACCENT_2, theme: 'dark', className: 'fislab-shell' };

  return (
    <div className="fislab-root">
      {enPantallaMenu && <Scene3DBackground />}

      {/* ============ SELECCIÓN DE MODO ============ */}
      {screen === 'select' && (
        <GameShell {...shellProps}>
          <ModeSelect
            description={`${catalogo.length} simulaciones 3D de fuerzas y fluidos para ${cursoActual}: experimenta, supera retos y examínate.`}
            modes={[
              {
                id: 'explora', tone: 'easy', icon: Compass, title: 'Explora', cta: 'Entrar',
                desc: 'Laboratorio libre: mueve los parámetros y mira qué pasa.',
                features: ['Vectores, trayectorias y gráficas', `${catalogo.length} simulaciones`],
              },
              {
                id: 'retos', tone: 'medium', icon: Target, title: 'Retos',
                desc: 'Misiones guiadas dentro de cada simulación.',
                features: ['Pistas opcionales', `${totalRetos} retos que suman puntos`],
              },
              {
                id: 'examen', tone: 'exam', title: 'Examen',
                desc: '10 preguntas: Predice → Observa → Explica, sin ayudas.',
                features: ['Nota sobre 10', 'Puntos por rapidez, precisión y racha'],
              },
            ]}
            onSelect={startMode}
            onHelp={() => setShowHelp(true)}
            onStudy={() => setShowFormulario(true)}
            extra={<GraphicsQualitySelector className="gfxsel-on-dark fislab-gfx" />}
          />
        </GameShell>
      )}

      {/* ============ CATÁLOGO ============ */}
      {screen === 'catalog' && (
        <GameShell {...shellProps}>
          <GameHeader
            mode={modeTone}
            modeLabel={modeLabel}
            onHelp={() => setShowHelp(true)}
            onStudy={() => setShowFormulario(true)}
            right={(
              <Hud>
                {mode === 'retos' && <HudStat icon={Star} tone="score" value={retosPoints} label="puntos" />}
                {mode === 'retos' && <HudStat icon={Target} tone="good" value={`${retosHechos}/${totalRetos}`} label="retos" />}
                {mode !== 'retos' && <HudStat icon={FlaskConical} tone="progress" value={catalogo.length} label="simulaciones" />}
              </Hud>
            )}
          />
          <div className="fislab-toolbar">
            <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={volverASelect}>Cambiar modo</GameButton>
            <span className="fislab-toolbar__hint">
              {mode === 'retos'
                ? 'Elige una simulación y supera sus misiones.'
                : 'Elige una simulación para entrar al laboratorio.'}
            </span>
          </div>

          {grupos.map((g, gi) => (
            <section key={g.key} className="fislab-group" style={{ '--tint': GROUP_TINT[g.key] || ACCENT }}>
              <header className="fislab-group__head">
                <span className="fislab-group__label">{g.label}</span>
                {g.nueva && <span className="fislab-group__new"><Sparkles size={12} /> Tu curso</span>}
                <span className="fislab-group__line" aria-hidden="true" />
                <span className="fislab-group__count">{g.items.length}</span>
              </header>
              <div className="fislab-grid">
                {g.items.map(({ sim, esNueva, comoAmpliacion }, idx) => {
                  const done = retosDone[sim.id]?.length || 0;
                  const nRetos = sim.retos?.length || 0;
                  return (
                    <motion.button
                      key={sim.id}
                      type="button"
                      className="fislab-sim"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(gi * 2 + idx, 14) * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => abrirSim(sim)}
                    >
                      <span className="fislab-sim__tile" aria-hidden="true">
                        <span className="fislab-sim__emoji">{sim.icono}</span>
                      </span>
                      <span className="fislab-sim__body">
                        <span className="fislab-sim__name">{sim.nombre}</span>
                        <span className="fislab-sim__desc">{sim.descripcion}</span>
                        <span className="fislab-sim__meta">
                          {esNueva && !comoAmpliacion && <span className="fislab-tag fislab-tag--new">Nuevo en {cursoActual}</span>}
                          {comoAmpliacion && <span className="fislab-tag fislab-tag--amp">Ampliación</span>}
                          {!esNueva && !comoAmpliacion && <span className="fislab-tag">{cursoLabel(sim.curso)}</span>}
                        </span>
                        {mode === 'retos' && nRetos > 0 && (
                          <span className={`fislab-sim__retos ${done === nRetos ? 'is-complete' : ''}`}>
                            <Target size={12} /> {done}/{nRetos}
                            <ProgressBar value={done} max={nRetos} tone="good" />
                          </span>
                        )}
                      </span>
                      <ChevronRight className="fislab-sim__go" size={18} aria-hidden="true" />
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </GameShell>
      )}

      {/* ============ SIMULACIÓN (escenario 3D a pantalla completa) ============ */}
      {screen === 'sim' && activeSim && (
        <div className="fislab-stage gk-shell gk-theme-dark" style={SCOPE_STYLE}>
          {/* 3D a sangre completa, de fondo */}
          <div className="fislab-stage-canvas">
            <SimViewport
              tier={tier}
              prefAuto={pref === 'auto'}
              onAutoDowngrade={handleAutoDowngrade}
              camera={activeSim.camara}
              controls={activeSim.controles}
              ambience={ambiente}
              groundY={activeSim.entornoY}
              className="fislab-viewport-full"
            >
              <ActiveScene
                world={worldRef.current}
                params={params}
                playing={playing}
                speed={speed}
                resetToken={resetToken}
                showVectors={showVectors}
                showTrajectory={showTrajectory}
                quality={qualityObj}
                onTelemetry={handleTelemetry}
              />
            </SimViewport>
          </div>

          {/* Barra superior flotante (pointer-events solo en los botones: se puede orbitar por los huecos) */}
          <div className={`fislab-hudtop ${panelOpen ? 'with-panel' : ''}`}>
            <div className="fislab-hudtop__left">
              <GameButton variant="soft" size="sm" icon={ArrowLeft} onClick={volverACatalogo}>
                <span className="fislab-hide-sm">Catálogo</span>
              </GameButton>
              <div className="fislab-simtitle">
                <span className="fislab-simtitle__tile" aria-hidden="true">{activeSim.icono}</span>
                <span className="fislab-simtitle__text">
                  <strong>{activeSim.nombre}</strong>
                  <span className="fislab-simtitle__meta">
                    <ModeChip mode={modeTone} label={modeLabel} />
                    <span className={`fislab-status is-${simEstado}`}><i aria-hidden="true" /> {simEstadoLabel}</span>
                  </span>
                </span>
              </div>
              <GameButton variant="primary" size="sm" icon={Info} onClick={() => setShowInfo(true)} title="¿Qué es esta simulación?">
                <span className="fislab-hide-sm">Info</span>
              </GameButton>
            </div>
            <div className="fislab-hudtop__right">
              {mode === 'retos' && (
                <Hud className="fislab-hud-retos">
                  <HudStat icon={Star} tone="score" value={retosPoints} label="puntos" />
                </Hud>
              )}
              {!panelOpen && (
                <GameButton variant="primary" size="sm" icon={SlidersHorizontal} onClick={() => setPanelOpen(true)}>
                  <span className="fislab-hide-sm">Controles</span>
                </GameButton>
              )}
            </div>
          </div>

          {/* Fila inferior: gráfica (izq.), fórmula viva (centro) y mando rápido (dcha.).
              Flex en lugar de posiciones sueltas: nunca se solapan. */}
          <div className={`fislab-hudbottom ${panelOpen ? 'with-panel' : ''}`}>
            {activeSim.graficas && (
              <div className={`fislab-graphcard ${graphOpen ? '' : 'is-collapsed'}`}>
                <button type="button" className="fislab-graphcard__toggle" onClick={() => setGraphOpen((o) => !o)} aria-expanded={graphOpen}>
                  <span className="fislab-graphcard__ico"><LineChart size={14} /></span>
                  Gráfica en vivo
                  <ChevronDown size={16} className="fislab-graphcard__chev" />
                </button>
                {graphOpen && <GraphPanel seriesRef={seriesRef} lines={activeSim.graficas} height={130} />}
              </div>
            )}

            {formulaViva && (
              <div className="fislab-formula">
                <span className="fislab-formula__tag" aria-hidden="true">ƒ</span>
                <span className="fislab-formula__text">{formulaViva}</span>
              </div>
            )}

            {/* Mando rápido cuando el panel está plegado (mismos manejadores del panel) */}
            {!panelOpen && (
              <div className="fislab-dock">
                <GameButton variant={playing ? 'warning' : 'success'} icon={playing ? Pause : Play} onClick={handlePlayPause}>
                  <span className="fislab-hide-sm">{playing ? 'Pausa' : 'Reproducir'}</span>
                </GameButton>
                <button type="button" className="gk-iconbtn" onClick={resetSim} title="Reiniciar" aria-label="Reiniciar">
                  <RotateCcw size={17} />
                </button>
              </div>
            )}
          </div>

          {/* Panel de control flotante (derecha, plegable) */}
          <AnimatePresence>
            {panelOpen && (
              <motion.aside
                className="fislab-drawer"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                <header className="fislab-drawer__head">
                  <span className="fislab-drawer__title">
                    <span className="fislab-drawer__ico"><SlidersHorizontal size={15} /></span>
                    Panel de control
                  </span>
                  <button type="button" className="gk-iconbtn" onClick={() => setPanelOpen(false)} title="Ocultar panel" aria-label="Ocultar panel">
                    <PanelRightClose size={18} />
                  </button>
                </header>
                <div className="fislab-drawer__body">
                  <ParamPanel
                    simDef={activeSim}
                    params={params}
                    onParamChange={handleParamChange}
                    playing={playing}
                    onPlayPause={handlePlayPause}
                    onReset={resetSim}
                    speed={speed}
                    onSpeedChange={setSpeed}
                    showVectors={showVectors}
                    onToggleVectors={() => setShowVectors((v) => !v)}
                    showTrajectory={showTrajectory}
                    onToggleTrajectory={() => setShowTrajectory((v) => !v)}
                    readouts={readouts}
                  >
                    {energia?.length > 0 && <EnergyBars items={energia} />}
                    {mode === 'retos' && activeSim.retos?.length > 0 && (
                      <RetosList
                        sim={activeSim}
                        done={retosDone[activeSim.id] || []}
                        pistas={pistasAbiertas}
                        onTogglePista={(key) => setPistasAbiertas((prev) => ({ ...prev, [key]: true }))}
                      />
                    )}
                  </ParamPanel>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ============ AVISO PREVIO AL EXAMEN ============ */}
      {screen === 'exam-intro' && (
        <GameShell {...shellProps}>
          <GameHeader mode="exam" modeLabel="Examen" onHelp={() => setShowHelp(true)} onStudy={() => setShowFormulario(true)} />
          <Panel variant="surface" className="fislab-intro">
            <ol className="fislab-poe fislab-poe--intro" aria-label="Pasos de cada pregunta">
              <li><span className="fislab-poe__ico"><Lightbulb size={18} /></span><strong>Predice</strong><small>Responde antes de ver nada</small></li>
              <li><span className="fislab-poe__ico"><Eye size={18} /></span><strong>Observa</strong><small>La simulación real lo comprueba</small></li>
              <li><span className="fislab-poe__ico"><Brain size={18} /></span><strong>Explica</strong><small>Elige el porqué correcto</small></li>
            </ol>
            <p className="fislab-intro__lead">
              <strong>10 preguntas</strong> en tres pasos. La predicción vale el 70% de cada pregunta y la explicación el 30%.
              El examen de <strong>{cursoActual}</strong> solo pregunta sobre estos temas:
            </p>
            <div className="fislab-intro__temas">
              {examIncluidos.map((s) => (
                <span key={s.id} className="fislab-intro__tema">
                  <span className="fislab-intro__emoji" aria-hidden="true">{s.icono}</span>
                  <span className="fislab-intro__nombre">{s.nombre}</span>
                  <small>{cursoLabel(s.curso)}</small>
                </span>
              ))}
            </div>
            {hayExcluidasDelExamen && (
              <p className="fislab-intro__nota">
                <Info size={16} />
                <span>
                  En <strong>Explora</strong> y <strong>Retos</strong> tienes más simulaciones (de otros cursos o de ampliación)
                  para practicar, pero <strong>no entran en el examen de {cursoActual}</strong>.
                </span>
              </p>
            )}
            <div className="fislab-intro__actions">
              <GameButton variant="primary" size="lg" icon={GraduationCap} onClick={comenzarExamen}>Comenzar examen</GameButton>
              <GameButton variant="soft" size="lg" icon={LayoutGrid} onClick={volverASelect}>Volver</GameButton>
            </div>
          </Panel>
        </GameShell>
      )}

      {/* ============ EXAMEN ============ */}
      {screen === 'exam' && examQuestions && (
        <GameShell {...shellProps} className="fislab-shell fislab-shell--exam">
          <ExamScreen
            questions={examQuestions}
            tier={tier}
            prefAuto={pref === 'auto'}
            onAutoDowngrade={handleAutoDowngrade}
            onProgress={(r) => { examResultsRef.current = r; }}
            onFinish={finishExam}
            onAbandon={() => setShowAbandon(true)}
          />
        </GameShell>
      )}

      {/* ============ RESUMEN ============ */}
      {screen === 'summary' && summary && (
        <GameShell {...shellProps}>
          <ResultsScreen
            subtitle={`Laboratorio de Física 3D · ${cursoActual}`}
            nota={summary.nota}
            points={summary.points}
            stats={[
              { icon: Lightbulb, tone: 'good', label: 'Predicciones', value: `${summary.predCorrect}/${summary.total}` },
              { icon: Brain, tone: 'progress', label: 'Explicaciones', value: `${summary.explCorrect}/${summary.total}` },
            ]}
            actions={[
              { label: 'Repetir examen', onClick: () => startMode('examen'), icon: RefreshCw },
              { label: 'Volver al menú', onClick: volverASelect, icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {summary.results.filter(Boolean).map((r) => (
              <FeedbackItem key={r.numero} index={r.numero} ok={r.predOk} title={`${r.simIcono} ${r.simNombre}`}>
                <span className="fislab-fb__text">{r.enunciado}</span>
                <span className="fislab-fb__marks">
                  <span className={`fislab-fb__mark ${r.predOk ? 'is-ok' : 'is-ko'}`}>
                    <Lightbulb size={12} /> Predicción {r.predOk ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <span className={`fislab-fb__mark ${r.explOk ? 'is-ok' : 'is-ko'}`}>
                    <Brain size={12} /> Explicación {r.explOk ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                </span>
              </FeedbackItem>
            ))}
          </ResultsScreen>
        </GameShell>
      )}

      {/* ============ TOASTS ============ */}
      {/* Ámbito del kit (display: contents, sin caja ni contexto de apilado) para
          las capas fijas de la raíz: avisos, diálogo y modales heredan el tema
          oscuro y los colores de la app. */}
      <div className="gk-shell gk-theme-dark fislab-portal" style={SCOPE_STYLE}>
      <div className="fislab-toasts" aria-live="polite">
        <AnimatePresence>
          {gfxToast && (
            <motion.div key="gfx" className="fislab-toast" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="fislab-toast__ico"><Settings2 size={15} /></span> {gfxToast}
            </motion.div>
          )}
          {retoToast && (
            <motion.div key="reto" className="fislab-toast fislab-toast--reto" initial={{ opacity: 0, y: -12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
              <span className="fislab-toast__ico"><Trophy size={15} /></span> {retoToast.replace(/^🏆\s*/u, '')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ MODAL ABANDONAR EXAMEN ============ */}
      <AnimatePresence>
        {showAbandon && (
          <motion.div
            className="fislab-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAbandon(false)}
          >
            <motion.div
              className="fislab-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="fislab-abandon-title"
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="fislab-dialog__medal gk-tone-exam"><GraduationCap size={26} /></span>
              <h3 id="fislab-abandon-title">¿Entregar el examen ahora?</h3>
              <p>Las preguntas sin responder contarán como 0. Se registrará la nota de lo que llevas hecho.</p>
              <div className="fislab-dialog__actions">
                <GameButton variant="soft" onClick={() => setShowAbandon(false)}>Seguir con el examen</GameButton>
                <GameButton variant="danger" icon={X} onClick={() => finishExam(examResultsRef.current || [])}>Entregar y salir</GameButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ INSTRUCCIONES ============ */}
      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Laboratorio de Física 3D">
        <h3>🎯 Objetivo</h3>
        <p>Experimenta con simulaciones 3D de fuerzas y fluidos: cambia los parámetros, observa qué ocurre y comprende la física que hay detrás.</p>
        <h3>🎓 Modos de juego</h3>
        <div className="instr-modes">
          <div className="instr-mode easy">
            <strong>Explora</strong>
            Laboratorio libre: entra en cualquier simulación, mueve los parámetros y activa vectores, trayectoria y gráficas para entender el porqué.
          </div>
          <div className="instr-mode medium">
            <strong>Retos</strong>
            Cada simulación esconde misiones («consigue que la caja se pare entre los 10 y los 14 m»). Supéralas para ganar puntos; las pistas ayudan pero restan bonus.
          </div>
          <div className="instr-mode exam">
            <strong>Examen</strong>
            10 preguntas: <strong>predice</strong> el resultado, <strong>observa</strong> la simulación real y <strong>explica</strong> el porqué. La predicción vale el 70% de cada pregunta y la explicación el 30%. Sumas puntos extra por rapidez, precisión y racha.
          </div>
        </div>
        <h3>🕹️ Controles</h3>
        <ul>
          <li>Arrastra sobre el escenario para girar la cámara y usa la rueda o el pellizco para acercarte.</li>
          <li>El <strong>panel de control</strong> (derecha) tiene reproducir/pausa, velocidad, ayudas visuales, parámetros y medidas en vivo. Puedes plegarlo para ver mejor.</li>
          <li>El botón <strong>Info</strong> explica qué estás viendo y las leyes que usa cada simulación.</li>
        </ul>
        <div className="instr-tips">
          <strong>💡 Consejo:</strong> en las respuestas numéricas puedes usar coma o punto decimal. Usa g = 9,8 m/s² salvo que el enunciado diga otra cosa.
        </div>
      </InstructionsModal>

      {/* ============ FORMULARIO ============ */}
      <InstructionsModal isOpen={showFormulario} onClose={() => setShowFormulario(false)} title={`Formulario · ${cursoActual}`}>
        {catalogo.map(({ sim, comoAmpliacion }) => (
          sim.formulas?.length > 0 && (
            <div key={sim.id} className="fislab-formulario">
              <h3>{sim.icono} {sim.nombre}{comoAmpliacion ? ' · ampliación' : ''}</h3>
              {sim.formulas.map((f) => (
                <div key={f.titulo} className="fislab-formulario__row">
                  <span className="fislab-formulario__title">{f.titulo}</span>
                  <code>{f.expr}</code>
                  {f.leyenda && <small>{f.leyenda}</small>}
                </div>
              ))}
            </div>
          )
        ))}
      </InstructionsModal>

      {/* ============ INFO DE LA SIMULACIÓN ============ */}
      <SimInfoModal
        isOpen={showInfo && screen === 'sim'}
        onClose={() => setShowInfo(false)}
        sim={activeSim}
        info={activeSimId ? SIM_INFO[activeSimId] : null}
        dontShow={infoHidden}
        onToggleDontShow={toggleInfoHidden}
      />
      </div>
    </div>
  );
};

export default LaboratorioFisica;
