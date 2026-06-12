// Laboratorio de Física 3D — simulador de fuerzas y fluidos (ESO + Bachillerato).
// Tres modos estándar de la plataforma: Explora (sandbox), Retos (guiado) y
// Examen (POE, genera nota /10 + puntos paralelos). Catálogo acumulativo por
// curso definido en registry.js. Calidad gráfica: ajuste global de plataforma.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, BookOpen, Compass, Target, GraduationCap, Lightbulb,
  CheckCircle2, Circle, X, FlaskConical,
} from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { GLOBAL_QUALITY_PARAMS, QUALITY_LABELS } from '@/services/graphicsQuality';
import SimViewport from './components/SimViewport';
import ParamPanel from './components/ParamPanel';
import GraphPanel from './components/GraphPanel';
import EnergyBars from './components/EnergyBars';
import ExamScreen from './components/ExamScreen';
import { SIMS, catalogoPara, defaultsDe, simPorId } from './registry';
import { generarExamen, cursoLabel } from './engine/exam';
import './LaboratorioFisica.css';

const notaColor = (nota) => (nota >= 8 ? '#10b981' : nota >= 5 ? '#3b82f6' : '#ef4444');
const notaMensaje = (nota) => (nota >= 9 ? '¡Excelente!' : nota >= 7 ? '¡Muy bien!' : nota >= 5 ? 'Aprobado' : 'Necesitas repasar');
const EXAM_MAX_SCORE = 2200; // 10 preguntas × máximo de 220 puntos

function RetosList({ sim, done, pistas, onTogglePista }) {
  return (
    <div className="fislab-retos">
      <h4><Target size={15} /> Retos ({done.length}/{sim.retos.length})</h4>
      {sim.retos.map((reto) => {
        const isDone = done.includes(reto.id);
        const pistaKey = `${sim.id}:${reto.id}`;
        return (
          <div key={reto.id} className={`fislab-reto ${isDone ? 'done' : ''}`}>
            <div className="fislab-reto-head">
              {isDone ? <CheckCircle2 size={16} color="#4ade80" /> : <Circle size={16} color="#64748b" />}
              <strong>{reto.titulo}</strong>
            </div>
            <p>{reto.descripcion}</p>
            {!isDone && !pistas[pistaKey] && (
              <button type="button" className="fislab-reto-pista-btn" onClick={() => onTogglePista(pistaKey)}>
                <Lightbulb size={13} /> Pista (pierdes el bonus de +25)
              </button>
            )}
            {pistas[pistaKey] && !isDone && <p className="fislab-reto-pista">💡 {reto.pista}</p>}
          </div>
        );
      })}
    </div>
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
  const [examQuestions, setExamQuestions] = useState(null);
  const [summary, setSummary] = useState(null);

  const worldRef = useRef({ t: 0, _acc: 0, data: {} });
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
    screen, mode, activeSimId, params, playing, retosDone, retosPoints,
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
    if (tel.done && st.playing) setPlaying(false);
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
    if (m === 'examen') {
      examResultsRef.current = [];
      setExamQuestions(generarExamen(SIMS, level, grade, (Date.now() & 0x7fffffff) || 1));
      setScreen('exam');
    } else {
      setScreen('catalog');
    }
  };

  const abrirSim = (sim) => {
    setActiveSimId(sim.id);
    setParams(defaultsDe(sim));
    worldRef.current = { t: 0, _acc: 0, data: {} };
    seriesRef.current = [];
    setResetToken((t) => t + 1);
    setPlaying(false);
    setReadouts([]);
    setFormulaViva('');
    visitedRef.current.add(sim.id);
    setScreen('sim');
  };

  const resetSim = () => {
    seriesRef.current = [];
    setResetToken((t) => t + 1);
    setPlaying(false);
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

  return (
    <div className="fislab-root">
      {/* ============ SELECCIÓN DE MODO ============ */}
      {screen === 'select' && (
        <motion.div className="fislab-select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="fislab-hero">
            <span className="fislab-hero-icon">🧲</span>
            <h1>Laboratorio de Física 3D</h1>
            <p className="fislab-hero-sub">
              {catalogo.length} simulaciones de fuerzas y fluidos para <strong>{cursoActual}</strong>
            </p>
            <InstructionsButton className="fislab-help-btn" onClick={() => setShowHelp(true)} />
          </div>

          <div className="fislab-modes">
            <motion.button className="fislab-mode explora" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startMode('explora')}>
              <span className="fislab-mode-icon"><Compass size={30} /></span>
              <span className="fislab-mode-name">🟢 Explora</span>
              <span className="fislab-mode-desc">Laboratorio libre · toca todos los parámetros · vectores, gráficas y fórmulas a la vista</span>
            </motion.button>
            <motion.button className="fislab-mode retos" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startMode('retos')}>
              <span className="fislab-mode-icon"><Target size={30} /></span>
              <span className="fislab-mode-name">🟡 Retos</span>
              <span className="fislab-mode-desc">Misiones guiadas en cada simulación · pistas opcionales · suma puntos</span>
            </motion.button>
            <motion.button className="fislab-mode examen" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startMode('examen')}>
              <span className="fislab-mode-icon"><GraduationCap size={30} /></span>
              <span className="fislab-mode-name">🔴 Examen</span>
              <span className="fislab-mode-desc">10 preguntas Predice → Observa → Explica · sin ayudas · nota /10</span>
            </motion.button>
          </div>

          <button className="fislab-study-btn" onClick={() => setShowFormulario(true)}>
            <BookOpen size={16} /> Formulario de {cursoActual}
          </button>

          <GraphicsQualitySelector className="gfxsel-on-dark fislab-gfx-row" />
        </motion.div>
      )}

      {/* ============ CATÁLOGO ============ */}
      {screen === 'catalog' && (
        <motion.div className="fislab-catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="fislab-topbar">
            <button type="button" className="fislab-back" onClick={volverASelect}><ArrowLeft size={17} /> Modos</button>
            <h2>{mode === 'retos' ? '🟡 Retos' : '🟢 Explora'} · {cursoActual}</h2>
            {mode === 'retos' && <span className="fislab-points-badge">⭐ {retosPoints} pts</span>}
          </div>
          <div className="fislab-grid">
            {catalogo.map(({ sim, esNueva, comoAmpliacion }) => {
              const done = retosDone[sim.id]?.length || 0;
              return (
                <motion.button
                  key={sim.id}
                  type="button"
                  className="fislab-card"
                  whileHover={{ scale: 1.025, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => abrirSim(sim)}
                >
                  <span className="fislab-card-icon">{sim.icono}</span>
                  <span className="fislab-card-name">{sim.nombre}</span>
                  <span className="fislab-card-desc">{sim.descripcion}</span>
                  <span className="fislab-card-badges">
                    {esNueva && !comoAmpliacion && <span className="fislab-badge nueva">Nuevo en {cursoActual}</span>}
                    {comoAmpliacion && <span className="fislab-badge ampliacion">Ampliación</span>}
                    {!esNueva && !comoAmpliacion && <span className="fislab-badge repaso">{cursoLabel(sim.curso)}</span>}
                    {mode === 'retos' && sim.retos?.length > 0 && (
                      <span className={`fislab-badge retos ${done === sim.retos.length ? 'completos' : ''}`}>
                        🎯 {done}/{sim.retos.length}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ============ SIMULACIÓN ============ */}
      {screen === 'sim' && activeSim && (
        <div className="fislab-sim-screen">
          <div className="fislab-topbar">
            <button type="button" className="fislab-back" onClick={volverACatalogo}><ArrowLeft size={17} /> Catálogo</button>
            <h2>{activeSim.icono} {activeSim.nombre}</h2>
            {mode === 'retos' && <span className="fislab-points-badge">⭐ {retosPoints} pts</span>}
          </div>
          <div className="fislab-sim-main">
            <div className="fislab-sim-left">
              <SimViewport
                tier={tier}
                prefAuto={pref === 'auto'}
                onAutoDowngrade={handleAutoDowngrade}
                camera={activeSim.camara}
                controls={activeSim.controles}
                background={activeSim.fondo ? activeSim.fondo(params) : '#0b1026'}
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
              {activeSim.graficas && <GraphPanel seriesRef={seriesRef} lines={activeSim.graficas} />}
            </div>
            <div className="fislab-sim-right">
              <ParamPanel
                simDef={activeSim}
                params={params}
                onParamChange={(key, value) => setParams((prev) => ({ ...prev, [key]: value }))}
                playing={playing}
                onPlayPause={() => setPlaying((p) => !p)}
                onReset={resetSim}
                speed={speed}
                onSpeedChange={setSpeed}
                showVectors={showVectors}
                onToggleVectors={() => setShowVectors((v) => !v)}
                showTrajectory={showTrajectory}
                onToggleTrajectory={() => setShowTrajectory((v) => !v)}
                readouts={readouts}
                formulaViva={formulaViva}
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
          </div>
        </div>
      )}

      {/* ============ EXAMEN ============ */}
      {screen === 'exam' && examQuestions && (
        <div className="fislab-exam-wrap">
          <div className="fislab-topbar">
            <h2><GraduationCap size={20} /> Examen · {cursoActual}</h2>
            <button type="button" className="fislab-abandon" onClick={() => setShowAbandon(true)}>
              <X size={15} /> Entregar y salir
            </button>
          </div>
          <ExamScreen
            questions={examQuestions}
            tier={tier}
            prefAuto={pref === 'auto'}
            onAutoDowngrade={handleAutoDowngrade}
            onProgress={(r) => { examResultsRef.current = r; }}
            onFinish={finishExam}
          />
        </div>
      )}

      {/* ============ RESUMEN ============ */}
      {screen === 'summary' && summary && (
        <motion.div className="fislab-summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <h2>Resultado del examen</h2>
          <div className="fislab-nota" style={{ color: notaColor(summary.nota), borderColor: notaColor(summary.nota) }}>
            {summary.nota.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
          <p className="fislab-nota-msg" style={{ color: notaColor(summary.nota) }}>{notaMensaje(summary.nota)}</p>
          <div className="fislab-summary-stats">
            <div><strong>{summary.predCorrect}/{summary.total}</strong><span>predicciones</span></div>
            <div><strong>{summary.explCorrect}/{summary.total}</strong><span>explicaciones</span></div>
            <div><strong>⭐ {summary.points}</strong><span>puntos</span></div>
          </div>
          <div className="fislab-summary-list">
            {summary.results.filter(Boolean).map((r) => (
              <div key={r.numero} className="fislab-summary-row">
                <span className="fislab-summary-sim">{r.simIcono}</span>
                <span className="fislab-summary-enun">{r.enunciado}</span>
                <span className={`fislab-summary-mark ${r.predOk ? 'ok' : 'ko'}`}>{r.predOk ? '✓' : '✗'}</span>
                <span className={`fislab-summary-mark expl ${r.explOk ? 'ok' : 'ko'}`}>🧠{r.explOk ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
          <div className="fislab-summary-actions">
            <button type="button" className="fislab-btn-primary" onClick={() => startMode('examen')}>
              <FlaskConical size={16} /> Repetir examen
            </button>
            <button type="button" className="fislab-btn-ghost" onClick={volverASelect}>Volver al menú</button>
          </div>
        </motion.div>
      )}

      {/* ============ TOASTS ============ */}
      <AnimatePresence>
        {gfxToast && (
          <motion.div className="fislab-toast" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            ⚙️ {gfxToast}
          </motion.div>
        )}
        {retoToast && (
          <motion.div className="fislab-toast reto" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {retoToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODAL ABANDONAR EXAMEN ============ */}
      <AnimatePresence>
        {showAbandon && (
          <motion.div className="fislab-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbandon(false)}>
            <motion.div
              className="fislab-modal"
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>¿Entregar el examen ahora?</h3>
              <p>Las preguntas sin responder contarán como 0. Se registrará la nota de lo que llevas hecho.</p>
              <div className="fislab-modal-actions">
                <button type="button" className="fislab-btn-danger" onClick={() => finishExam(examResultsRef.current || [])}>Entregar y salir</button>
                <button type="button" className="fislab-btn-ghost" onClick={() => setShowAbandon(false)}>Seguir con el examen</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ INSTRUCCIONES ============ */}
      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Laboratorio de Física 3D">
        <h3>🟢 Explora</h3>
        <p>Laboratorio libre: entra en cualquier simulación, mueve los parámetros y observa qué pasa. Activa los vectores de fuerza, la trayectoria y las gráficas para entender el porqué.</p>
        <h3>🟡 Retos</h3>
        <p>Cada simulación esconde misiones ("consigue que la caja se pare entre los 10 y los 14 m"). Supéralas para ganar puntos; las pistas te ayudan pero restan bonus.</p>
        <h3>🔴 Examen</h3>
        <p>10 preguntas en tres pasos: <strong>predice</strong> el resultado, <strong>observa</strong> la simulación real comprobándolo y <strong>explica</strong> el porqué. Tu nota va de 0 a 10: la predicción vale el 70% de cada pregunta y la explicación el 30%. Acumula puntos extra por rapidez, precisión y racha.</p>
        <p>En las respuestas numéricas puedes usar coma o punto decimal. Usa g = 9,8 m/s² salvo que el enunciado diga otra cosa.</p>
      </InstructionsModal>

      {/* ============ FORMULARIO ============ */}
      <InstructionsModal isOpen={showFormulario} onClose={() => setShowFormulario(false)} title={`Formulario · ${cursoActual}`}>
        {catalogo.map(({ sim, comoAmpliacion }) => (
          sim.formulas?.length > 0 && (
            <div key={sim.id} className="fislab-formulario-sim">
              <h3>{sim.icono} {sim.nombre}{comoAmpliacion ? ' · ampliación' : ''}</h3>
              {sim.formulas.map((f) => (
                <p key={f.titulo} className="fislab-formulario-row">
                  <strong>{f.titulo}:</strong> <code>{f.expr}</code>
                  <br /><small>{f.leyenda}</small>
                </p>
              ))}
            </div>
          )
        ))}
      </InstructionsModal>
    </div>
  );
};

export default LaboratorioFisica;
