import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Cpu, Trash2, Lightbulb, Play, RotateCcw, Check, ArrowRight, Clock, Trophy, Sparkles, Zap } from 'lucide-react';
import InstructionsModal, { InstructionsButton } from '../_shared/InstructionsModal';
import { COMPONENT_TEMPLATES, getExercises } from './roboticaData';
import './LaboratorioRobotica.css';

const BOARD_W = 820;
const BOARD_H = 480;
const COLOR_PALETTE = ['#ef4444', '#22c55e', '#0ea5e9', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

const normPair = (a, b) => [a, b].sort().join('|');

const getPinAbsPos = (component, pin) => ({
  x: component.x + pin.x,
  y: component.y + pin.y,
});

const findPin = (components, pinKey) => {
  const [compId, pinId] = pinKey.split('.');
  const comp = components.find(c => c.id === compId);
  if (!comp) return null;
  const tpl = COMPONENT_TEMPLATES[comp.type];
  const pin = tpl.pins.find(p => p.id === pinId);
  if (!pin) return null;
  return { comp, tpl, pin, abs: getPinAbsPos(comp, pin) };
};

const wireColor = (index) => COLOR_PALETTE[index % COLOR_PALETTE.length];

// --- Renderers -------------------------------------------------------------

const ComponentNode = ({ component, isExam, onPinClick, selectedPin, wiredPins }) => {
  const tpl = COMPONENT_TEMPLATES[component.type];
  if (!tpl) return null;
  return (
    <div
      className="rob-component"
      style={{
        left: component.x,
        top: component.y,
        width: tpl.w,
        height: tpl.h,
        borderColor: tpl.color,
      }}
    >
      <div className="rob-component-header" style={{ background: tpl.color }}>
        <span className="rob-component-icon">{tpl.icon}</span>
        <span className="rob-component-label">{tpl.label}</span>
      </div>
      <div className="rob-component-body">
        <span className="rob-component-id">{component.id}</span>
      </div>
      {tpl.pins.map((pin) => {
        const pinKey = `${component.id}.${pin.id}`;
        const isSelected = selectedPin === pinKey;
        const isWired = wiredPins.has(pinKey);
        return (
          <button
            key={pin.id}
            type="button"
            className={`rob-pin ${isSelected ? 'selected' : ''} ${isWired ? 'wired' : ''}`}
            style={{ left: pin.x, top: pin.y }}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pinKey);
            }}
            aria-label={`Pin ${pin.label} de ${component.id}`}
          >
            <span className="rob-pin-dot" />
            <span className="rob-pin-label">{pin.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const WireLayer = ({ wires, ghostWires, components, pendingStart, mousePos, onWireClick, isExam }) => {
  const getPos = (pinKey) => {
    const p = findPin(components, pinKey);
    return p ? p.abs : null;
  };

  const bezierPath = (a, b) => {
    const dx = Math.max(60, Math.abs(b.x - a.x) * 0.45);
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  };

  const pendingPos = pendingStart ? getPos(pendingStart) : null;

  return (
    <svg className="rob-wires" width={BOARD_W} height={BOARD_H}>
      {ghostWires && ghostWires.map((key, i) => {
        const [a, b] = key.split('|');
        const pa = getPos(a);
        const pb = getPos(b);
        if (!pa || !pb) return null;
        return (
          <path
            key={`ghost-${i}`}
            d={bezierPath(pa, pb)}
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="6 6"
            fill="none"
            opacity="0.55"
          />
        );
      })}

      {wires.map((key, i) => {
        const [a, b] = key.split('|');
        const pa = getPos(a);
        const pb = getPos(b);
        if (!pa || !pb) return null;
        return (
          <g key={`wire-${key}`} className="rob-wire" onClick={() => onWireClick(key)}>
            <path d={bezierPath(pa, pb)} stroke={wireColor(i)} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d={bezierPath(pa, pb)} stroke="transparent" strokeWidth="18" fill="none" />
          </g>
        );
      })}

      {pendingPos && mousePos && (
        <path
          d={bezierPath(pendingPos, mousePos)}
          stroke="#a855f7"
          strokeWidth="4"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.9"
        />
      )}
    </svg>
  );
};

// --- Main App --------------------------------------------------------------

const LaboratorioRobotica = ({ onGameComplete, isPaused }) => {
  const { grade: gradeParam } = useParams();
  const grade = useMemo(() => String(gradeParam || '1'), [gradeParam]);
  const exercises = useMemo(() => getExercises(grade), [grade]);

  // Pantallas: 'intro' → 'practice-select'|'exam' → 'play' → 'summary'
  const [screen, setScreen] = useState('intro');
  const [mode, setMode] = useState('easy'); // easy | medium | exam
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [wires, setWires] = useState([]);
  const [pendingStart, setPendingStart] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  // Estado de examen
  const [examStep, setExamStep] = useState(0);
  const [examResults, setExamResults] = useState([]);
  const [examStartAt, setExamStartAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);
  const boardRef = useRef(null);

  const exercise = exercises[exerciseIndex];
  const targetSet = useMemo(() => new Set(exercise?.target || []), [exercise]);
  const userSet = useMemo(() => new Set(wires), [wires]);
  const wiredPins = useMemo(() => {
    const s = new Set();
    wires.forEach(k => {
      const [a, b] = k.split('|');
      s.add(a); s.add(b);
    });
    return s;
  }, [wires]);

  // Timer para examen
  useEffect(() => {
    if (mode !== 'exam' || screen !== 'play' || isPaused) return;
    const id = setInterval(() => {
      if (examStartAt) setElapsed(Math.floor((Date.now() - examStartAt) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [mode, screen, examStartAt, isPaused]);

  // Limpiar estado al cambiar ejercicio
  useEffect(() => {
    setWires([]);
    setPendingStart(null);
    setFeedback(null);
    setRevealedHints([]);
    setHintsUsed(0);
  }, [exerciseIndex, mode]);

  const startPractice = (difficulty) => {
    setMode(difficulty);
    setExerciseIndex(0);
    setScreen('play');
    completedRef.current = false;
  };

  const startExam = () => {
    setMode('exam');
    setExerciseIndex(0);
    setExamStep(0);
    setExamResults([]);
    setExamStartAt(Date.now());
    setElapsed(0);
    setScreen('play');
    completedRef.current = false;
  };

  const handlePinClick = useCallback((pinKey) => {
    setFeedback(null);
    if (!pendingStart) {
      setPendingStart(pinKey);
      return;
    }
    if (pendingStart === pinKey) {
      setPendingStart(null);
      return;
    }
    const [compA] = pendingStart.split('.');
    const [compB] = pinKey.split('.');
    if (compA === compB) {
      setFeedback({ type: 'warn', text: 'No puedes conectar dos pines del mismo componente entre sí.' });
      setPendingStart(null);
      return;
    }
    const key = normPair(pendingStart, pinKey);
    setWires(prev => prev.includes(key) ? prev : [...prev, key]);
    setPendingStart(null);
  }, [pendingStart]);

  const handleBoardMouseMove = (e) => {
    if (!pendingStart || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleBoardClick = () => {
    if (pendingStart) {
      setPendingStart(null);
      setMousePos(null);
    }
  };

  const removeWire = (key) => {
    if (mode === 'exam') return;
    setWires(prev => prev.filter(w => w !== key));
  };

  const clearWires = () => {
    setWires([]);
    setPendingStart(null);
    setFeedback(null);
  };

  const useHint = () => {
    const missing = exercise.target.filter(t => !userSet.has(t) && !revealedHints.includes(t));
    if (missing.length === 0) return;
    const next = missing[0];
    setRevealedHints(prev => [...prev, next]);
    setHintsUsed(h => h + 1);
  };

  const checkCircuit = () => {
    const correct = wires.filter(w => targetSet.has(w));
    const missing = exercise.target.filter(t => !userSet.has(t));
    const extra = wires.filter(w => !targetSet.has(w));
    const isPerfect = missing.length === 0 && extra.length === 0;

    if (mode === 'exam') {
      const result = {
        exerciseId: exercise.id,
        title: exercise.title,
        correct: correct.length,
        missing: missing.length,
        extra: extra.length,
        totalTargets: exercise.target.length,
        perfect: isPerfect,
      };
      const nextResults = [...examResults, result];
      setExamResults(nextResults);

      if (examStep < exercises.length - 1) {
        setExamStep(s => s + 1);
        setExerciseIndex(i => i + 1);
      } else {
        finishExam(nextResults);
      }
      return;
    }

    if (isPerfect) {
      setFeedback({ type: 'success', text: '¡Circuito correcto! Todas las conexiones son válidas.' });
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } });
    } else {
      const parts = [];
      if (missing.length) parts.push(`faltan ${missing.length} conexión(es)`);
      if (extra.length) parts.push(`sobran ${extra.length} conexión(es)`);
      setFeedback({ type: 'error', text: `Aún no está bien: ${parts.join(' y ')}.` });
    }
  };

  const finishExam = (results) => {
    const totalTargets = results.reduce((s, r) => s + r.totalTargets, 0);
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    const totalExtra = results.reduce((s, r) => s + r.extra, 0);
    // Penalización suave por cables extra (máx 10% menos).
    const penalty = Math.min(totalExtra * 0.05, 0.3);
    const rawRatio = totalTargets === 0 ? 0 : totalCorrect / totalTargets;
    const ratio = Math.max(0, rawRatio * (1 - penalty));
    const nota = Math.round(ratio * 100) / 10;
    const totalSecs = Math.max(1, Math.floor((Date.now() - examStartAt) / 1000));
    const timeBonus = Math.max(0, 300 - totalSecs) * 2;
    const perfectBonus = results.filter(r => r.perfect).length * 100;
    const score = Math.round(totalCorrect * 100 + timeBonus + perfectBonus);

    setScreen('summary');
    if (!completedRef.current && typeof onGameComplete === 'function') {
      completedRef.current = true;
      onGameComplete({
        mode: 'test',
        score,
        maxScore: exercises.length * 400,
        correctAnswers: results.filter(r => r.perfect).length,
        totalQuestions: exercises.length,
        durationSeconds: totalSecs,
        nota,
      });
    }
  };

  const nextExercise = () => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      setScreen('summary');
      if (mode !== 'exam' && !completedRef.current && typeof onGameComplete === 'function') {
        completedRef.current = true;
        onGameComplete({
          mode: 'practice',
          score: 0,
          maxScore: 0,
          correctAnswers: exercises.length,
          totalQuestions: exercises.length,
          durationSeconds: 0,
        });
      }
    }
  };

  const restart = () => {
    setScreen('intro');
    setMode('easy');
    setExerciseIndex(0);
    setWires([]);
    setPendingStart(null);
    setExamResults([]);
    setExamStep(0);
    setExamStartAt(null);
    setElapsed(0);
    completedRef.current = false;
  };

  // ---- Pantallas --------------------------------------------------------

  if (screen === 'intro') {
    return (
      <div className="rob-shell">
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          title="Cómo usar el Laboratorio de Robótica"
        >
          <h3>🎯 Objetivo</h3>
          <p>Monta circuitos electrónicos conectando los cables entre los pines de los componentes, como en un verdadero laboratorio de robótica.</p>
          <h3>🔌 Cómo conectar</h3>
          <ul>
            <li>Haz clic en un <b>pin</b> de un componente para iniciar un cable.</li>
            <li>Haz clic en <b>otro pin</b> para cerrar la conexión.</li>
            <li>Haz clic sobre un cable existente para <b>borrarlo</b>.</li>
          </ul>
          <h3>🎮 Modos</h3>
          <ul>
            <li><b>Fácil</b>: verás la solución en gris como guía + pistas ilimitadas.</li>
            <li><b>Medio</b>: sin solución visible, pero con botón de pista limitada.</li>
            <li><b>Examen</b>: 5 ejercicios del curso seguidos, sin pistas y puntuados sobre 10.</li>
          </ul>
        </InstructionsModal>

        <div className="rob-hero">
          <div className="rob-hero-top">
            <div className="rob-hero-title">
              <div className="rob-hero-badge"><Cpu size={18} /> ESO {grade}º</div>
              <h1>Laboratorio de Robótica</h1>
              <p>Aprende los circuitos básicos, los componentes electrónicos y el control con Arduino conectando cables como en un laboratorio real.</p>
            </div>
            <InstructionsButton onClick={() => setShowInstructions(true)} />
          </div>

          <div className="rob-mode-grid">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rob-mode-card rob-mode-easy"
              onClick={() => startPractice('easy')}
            >
              <div className="rob-mode-icon">🌱</div>
              <h3>Modo Fácil</h3>
              <p>Práctica guiada con la solución sugerida en gris y pistas ilimitadas. Ideal para aprender.</p>
              <span className="rob-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rob-mode-card rob-mode-medium"
              onClick={() => startPractice('medium')}
            >
              <div className="rob-mode-icon">⚡</div>
              <h3>Modo Medio</h3>
              <p>Sin solución visible. Puedes pedir pistas, pero cada una cuenta. Practica con más autonomía.</p>
              <span className="rob-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rob-mode-card rob-mode-exam"
              onClick={startExam}
            >
              <div className="rob-mode-icon">🎯</div>
              <h3>Modo Examen</h3>
              <p>Los 5 ejercicios del curso seguidos, sin ayudas. Obtén nota sobre 10 y entra al ranking.</p>
              <span className="rob-mode-cta">Empezar <ArrowRight size={16} /></span>
            </motion.button>
          </div>

          <div className="rob-exercise-list">
            <h3>📋 Ejercicios de ESO {grade}º</h3>
            <ol>
              {exercises.map((ex) => (
                <li key={ex.id}>{ex.title.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'summary') {
    const isExam = mode === 'exam';
    const perfectCount = examResults.filter(r => r.perfect).length;
    const totalTargets = examResults.reduce((s, r) => s + r.totalTargets, 0);
    const totalCorrect = examResults.reduce((s, r) => s + r.correct, 0);
    const totalExtra = examResults.reduce((s, r) => s + r.extra, 0);
    const penalty = Math.min(totalExtra * 0.05, 0.3);
    const rawRatio = totalTargets === 0 ? 0 : totalCorrect / totalTargets;
    const nota = Math.round(Math.max(0, rawRatio * (1 - penalty)) * 100) / 10;
    const colorClass = nota >= 8 ? 'grade-high' : nota >= 5 ? 'grade-mid' : 'grade-low';
    const msg = nota >= 9 ? '¡Excelente!' : nota >= 7 ? '¡Muy bien!' : nota >= 5 ? 'Aprobado' : 'Necesitas repasar';

    return (
      <div className="rob-shell">
        <div className="rob-summary-card">
          <h1><Trophy size={28} /> {isExam ? 'Examen terminado' : 'Práctica terminada'}</h1>

          {isExam ? (
            <>
              <div className={`rob-note ${colorClass}`}>
                <span className="rob-note-value">{nota.toFixed(1)}</span>
                <span className="rob-note-max">/10</span>
              </div>
              <p className="rob-note-msg">{msg}</p>

              <div className="rob-summary-stats">
                <div className="rob-stat"><span>✅ Ejercicios perfectos</span><b>{perfectCount} / {exercises.length}</b></div>
                <div className="rob-stat"><span>🔌 Conexiones correctas</span><b>{totalCorrect} / {totalTargets}</b></div>
                <div className="rob-stat"><span>⚠️ Cables de más</span><b>{totalExtra}</b></div>
                <div className="rob-stat"><span>⏱️ Tiempo total</span><b>{Math.floor(elapsed / 60)}m {elapsed % 60}s</b></div>
              </div>

              <div className="rob-summary-list">
                {examResults.map((r, i) => (
                  <div key={r.exerciseId} className={`rob-summary-row ${r.perfect ? 'ok' : 'ko'}`}>
                    <span className="rob-summary-idx">{i + 1}.</span>
                    <span className="rob-summary-title">{r.title}</span>
                    <span className="rob-summary-score">{r.correct}/{r.totalTargets}{r.extra ? ` (+${r.extra})` : ''}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="rob-summary-text">Has completado los {exercises.length} ejercicios de ESO {grade}º. ¡Gran trabajo!</p>
          )}

          <div className="rob-summary-actions">
            <button className="rob-btn-primary" onClick={restart}><RotateCcw size={16} /> Volver al menú</button>
            {isExam && (
              <button className="rob-btn-secondary" onClick={startExam}><Play size={16} /> Repetir examen</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ------ Pantalla de juego ---------------------------------------------

  const progress = `${exerciseIndex + 1} / ${exercises.length}`;
  const isExam = mode === 'exam';
  const showGhost = mode === 'easy' || revealedHints.length > 0;
  const ghostWires = mode === 'easy'
    ? exercise.target
    : revealedHints;

  return (
    <div className="rob-shell">
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Cómo conectar el circuito"
      >
        <p>Haz clic en un pin para iniciar un cable y en otro pin para terminarlo. Haz clic sobre un cable para eliminarlo.</p>
        <p>Pulsa <b>Comprobar</b> cuando creas que el circuito está bien.</p>
      </InstructionsModal>

      <div className="rob-playhead">
        <div className="rob-playhead-left">
          <span className={`rob-mode-chip mode-${mode}`}>
            {mode === 'easy' && '🌱 Fácil'}
            {mode === 'medium' && '⚡ Medio'}
            {mode === 'exam' && '🎯 Examen'}
          </span>
          <span className="rob-progress">Ejercicio {progress}</span>
          {isExam && (
            <span className="rob-timer"><Clock size={14} /> {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
          )}
        </div>
        <div className="rob-playhead-right">
          <InstructionsButton onClick={() => setShowInstructions(true)} />
          <button className="rob-icon-btn" onClick={restart} title="Salir al menú"><RotateCcw size={16} /></button>
        </div>
      </div>

      <div className="rob-exercise-card">
        <div className="rob-exercise-title">
          <Zap size={18} />
          <h2>{exercise.title}</h2>
        </div>
        <p className="rob-exercise-desc">{exercise.description}</p>
      </div>

      <div
        className="rob-board"
        ref={boardRef}
        style={{ width: BOARD_W, height: BOARD_H }}
        onMouseMove={handleBoardMouseMove}
        onClick={handleBoardClick}
      >
        <WireLayer
          wires={wires}
          ghostWires={showGhost ? ghostWires : []}
          components={exercise.components}
          pendingStart={pendingStart}
          mousePos={mousePos}
          onWireClick={removeWire}
          isExam={isExam}
        />
        {exercise.components.map(c => (
          <ComponentNode
            key={c.id}
            component={c}
            isExam={isExam}
            onPinClick={handlePinClick}
            selectedPin={pendingStart}
            wiredPins={wiredPins}
          />
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rob-feedback rob-feedback-${feedback.type}`}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rob-toolbar">
        <button className="rob-btn-secondary" onClick={clearWires} disabled={wires.length === 0}>
          <Trash2 size={16} /> Borrar cables
        </button>

        {mode === 'medium' && (
          <button className="rob-btn-hint" onClick={useHint} disabled={hintsUsed >= exercise.target.length}>
            <Lightbulb size={16} /> Pista ({hintsUsed}/{exercise.target.length})
          </button>
        )}

        {mode === 'easy' && (
          <div className="rob-tip"><Sparkles size={14} /> {exercise.hint}</div>
        )}

        <div className="rob-toolbar-spacer" />

        {!isExam && feedback?.type === 'success' ? (
          <button className="rob-btn-primary" onClick={nextExercise}>
            {exerciseIndex < exercises.length - 1 ? 'Siguiente ejercicio' : 'Terminar'} <ArrowRight size={16} />
          </button>
        ) : (
          <button className="rob-btn-primary" onClick={checkCircuit} disabled={wires.length === 0}>
            <Check size={16} /> {isExam ? (exerciseIndex < exercises.length - 1 ? 'Siguiente' : 'Terminar examen') : 'Comprobar'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LaboratorioRobotica;
