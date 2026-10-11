import React, { useEffect, useRef, useState } from 'react';
import '/src/apps/_shared/MathBoxShared.css';
import { BookOpen, GraduationCap, Trophy, Zap, Star } from 'lucide-react';
import InstructionsModal, { InstructionsButton } from './InstructionsModal';

/**
 * Layout unificado para TODAS las apps de operaciones matematicas
 * (sumas, restas, multiplicaciones, divisiones).
 *
 * Gestiona: Header, Modos, Toggle, Paleta, Controles, Feedback,
 * Resultados del Test e Instrucciones.
 *
 * Props:
 * - title          : Texto del titulo (ej: "Suma como en el cole (1º)")
 * - emoji          : Emoji del titulo (ej: "🧮")  [default: "🧮"]
 *
 * TEST MODE (opcional — si no se pasan, no se muestra selector de modo):
 * - isTestMode     : bool
 * - setTestMode    : fn
 * - testState      : { currentQuestionIndex, totalQuestions, showResults, score, testQuestions, userAnswers }
 * - actions.startPractice, actions.startTest, actions.nextQuestion, actions.exitTest
 *
 * PRACTICA:
 * - feedback       : { text, cls } | { text, className } | { texto, tipo }
 * - onCheck        : fn — handler del boton Comprobar
 * - onNew          : fn — handler del boton Nueva
 * - newLabel       : string — texto del boton (default: "Nueva")
 *
 * TOGGLE (opcional):
 * - toggleLabel    : string (ej: "Ayuda con llevadas")
 * - toggleValue    : bool
 * - onToggleChange : fn(newValue)
 *
 * PALETA:
 * - onPaletteClick : fn(number)
 * - paletteLabel   : string (default: "Arrastra o pulsa los números 👇")
 *
 * TRACKING:
 * - onGameComplete : fn (callback de tracking)
 *
 * INSTRUCCIONES:
 * - instructions   : JSX con el contenido del modal
 *
 * CHILDREN:
 * - children       : El tablero (Board) se pasa como hijo
 */
const MathOperationLayout = ({
  title,
  emoji = '🧮',

  // Test mode (todo opcional)
  isTestMode,
  setTestMode,
  testState,
  actions,          // { startPractice, startTest, nextQuestion, exitTest } — solo para test mode

  // Practica
  feedback: feedbackRaw,
  onCheck,
  onNew,
  newLabel = 'Nueva',

  // Toggle
  toggleLabel,
  toggleValue,
  onToggleChange,

  // Paleta
  onPaletteClick,
  paletteLabel = 'Arrastra o pulsa los números 👇',

  // Tracking
  onGameComplete,
  // Funcion opcional para calcular la respuesta correcta a partir de una pregunta.
  // Por defecto suma los numeros (compat con sumas/restas). Las multiplicaciones
  // pasan su propio calculo (q[0] * q[1]).
  calculateExpected,

  // Instrucciones
  instructions,

  children
}) => {
  const [showHelp, setShowHelp] = useState(false);

  // --- Normalizar feedback (acepta 3 formatos) ---
  const feedback = feedbackRaw
    ? {
        text: feedbackRaw.text ?? feedbackRaw.texto ?? '',
        cls: feedbackRaw.cls ?? feedbackRaw.className ?? feedbackRaw.tipo ?? ''
      }
    : { text: '', cls: '' };

  // --- Test mode state ---
  const hasTestMode = isTestMode !== undefined && setTestMode !== undefined && testState;
  const { currentQuestionIndex, totalQuestions, showResults, testQuestions, userAnswers } = testState || {};
  const progressPct = testState ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // --- Puntuacion con bonus de velocidad ---
  // Base: 200 puntos por acierto. Bonus: 5 puntos por cada segundo ahorrado
  // bajo un presupuesto de 30s/pregunta. Asi dos examenes con nota 10 pueden
  // tener puntuaciones distintas en el ranking global segun la velocidad.
  const BASE_POINTS_PER_HIT = 200;
  const TIME_BUDGET_PER_Q = 30;
  const SPEED_COEF = 5;

  const startTimeRef = useRef(null);
  const [finalElapsed, setFinalElapsed] = useState(0);

  // Reset del cronometro cada vez que se arranca un nuevo test (nueva array de preguntas)
  useEffect(() => {
    if (testQuestions && testQuestions.length > 0) {
      startTimeRef.current = Date.now();
      setFinalElapsed(0);
    }
  }, [testQuestions]);

  // Captura del tiempo final al mostrar resultados
  useEffect(() => {
    if (hasTestMode && showResults && startTimeRef.current) {
      setFinalElapsed(Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000)));
    }
  }, [hasTestMode, showResults]);

  const calcExpected = calculateExpected
    || ((q) => q.reduce((a, b) => a + parseInt(b), 0).toString());
  const testHits = (testQuestions && userAnswers)
    ? testQuestions.filter((q, i) => userAnswers[i] === calcExpected(q)).length
    : 0;
  const testTotal = totalQuestions || 0;
  const testNota = testTotal > 0 ? Math.min(10, Math.round((testHits / testTotal) * 100) / 10) : 0;
  const timeBudget = TIME_BUDGET_PER_Q * testTotal;
  const timeBonus = Math.max(0, Math.round((timeBudget - finalElapsed) * SPEED_COEF));
  const basePoints = testHits * BASE_POINTS_PER_HIT;
  const testScore = basePoints + timeBonus;

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  // Tracking: reportar cuando se muestran resultados del test (con score que incluye bonus de velocidad)
  const trackedRef = useRef(false);
  useEffect(() => {
    if (!hasTestMode) return;
    if (showResults && !trackedRef.current && finalElapsed > 0) {
      trackedRef.current = true;
      onGameComplete?.({
        mode: 'test',
        score: testScore,
        maxScore: testTotal * BASE_POINTS_PER_HIT + timeBudget * SPEED_COEF,
        correctAnswers: testHits,
        totalQuestions: testTotal,
        durationSeconds: finalElapsed,
      });
    }
    if (!showResults) trackedRef.current = false;
  }, [hasTestMode, showResults, finalElapsed, testScore, testTotal, testHits, timeBudget, onGameComplete]);

  // Determinar si estamos viendo resultados del test
  const showingTestResults = hasTestMode && isTestMode && showResults;

  return (
    <div id="app-container" className="math-shell">
      {/* Capa decorativa: orbes de luz + rejilla sutil */}
      <span className="math-bg-fx" aria-hidden="true" />

      {/* Header */}
      <div className="math-header flex items-center justify-center gap-3 mb-4">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
          <span className="math-title-emoji" role="img" aria-label={title}>{emoji}</span>{' '}
          <span className="gradient-text">{title}</span>
        </h1>
        <InstructionsButton onClick={() => setShowHelp(true)} />
      </div>

      {/* Selector de Modo (solo si tiene test mode) */}
      {hasTestMode && (
        <div className="mode-selection">
          <button
            className={`btn-mode math-mode-btn math-mode-btn--practice ${!isTestMode ? 'active' : ''}`}
            onClick={() => { setTestMode(false); actions.startPractice(); }}
          >
            <span className="math-mode-icon" aria-hidden="true"><BookOpen size={18} /></span>
            Practica Libre
          </button>
          <button className={`btn-mode math-mode-btn math-mode-btn--exam ${isTestMode ? 'is-current' : ''}`} onClick={actions.startTest}>
            <span className="math-mode-icon" aria-hidden="true"><GraduationCap size={18} /></span>
            Iniciar Examen
          </button>
        </div>
      )}

      {/* Toggle (opcional) */}
      {toggleLabel && onToggleChange && (
        <div id="options-area" className="math-options">
          <span className="math-toggle-label">{toggleLabel}</span>
          <div
            className={`math-toggle ${toggleValue ? 'is-on' : ''}`}
            onClick={() => onToggleChange(!toggleValue)}
            role="switch"
            aria-checked={!!toggleValue}
            aria-label={toggleLabel}
          >
            <div className="math-toggle-knob" />
          </div>
        </div>
      )}

      {/* Cabecera del Test (Progreso) */}
      {hasTestMode && isTestMode && !showResults && (
        <>
          <div className="test-header math-test-header">
            <div key={currentQuestionIndex} className="math-q-chip">Pregunta {currentQuestionIndex + 1} / {totalQuestions}</div>
          </div>
          <div className="progress-bar-container math-progress">
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {/* AREA PRINCIPAL: Resultados del Test O el Tablero */}
      {showingTestResults ? (
        <div className="test-results math-results" style={{ marginTop: 20 }}>
          {/* Nota /10 — prominente, coloreada */}
          {(() => {
            const notaColor = testNota >= 8 ? '#16a34a' : testNota >= 5 ? '#2563eb' : '#dc2626';
            const msg = testNota >= 9 ? '¡Excelente! 🌟'
              : testNota >= 7 ? '¡Muy bien! 👏'
              : testNota >= 5 ? 'Aprobado 💪'
              : 'Necesitas repasar 📖';
            return (
              <div className="math-grade-hero">
                <div className="math-grade-label">
                  Nota final
                </div>
                {/* Anillo con la nota (color >=8 verde, >=5 azul, <5 rojo) */}
                <div
                  className="math-grade-ring"
                  style={{ '--math-grade': testNota, '--math-grade-color': notaColor }}
                >
                  <div className="math-grade-value" style={{ color: notaColor }}>
                    {testNota.toFixed(1)}<span className="math-grade-max">/10</span>
                  </div>
                </div>
                <div className="math-grade-msg" style={{ color: notaColor }}>{msg}</div>
              </div>
            );
          })()}

          {/* Puntuacion + desglose de velocidad */}
          <div className="math-points-card">
            <div className="math-points-row">
              <span><Star size={14} className="math-points-ico" aria-hidden="true" /> Aciertos ({testHits}/{testTotal} × {BASE_POINTS_PER_HIT})</span>
              <strong>{basePoints} pts</strong>
            </div>
            <div className={`math-points-row ${timeBonus > 0 ? 'is-bonus' : 'is-muted'}`}>
              <span><Zap size={14} className="math-points-ico" aria-hidden="true" /> Bonus velocidad ({formatElapsed(finalElapsed)})</span>
              <strong>+{timeBonus} pts</strong>
            </div>
            <div className="math-points-row math-points-total">
              <strong><Trophy size={16} className="math-points-ico" aria-hidden="true" /> Puntuación total</strong>
              <strong className="math-points-total-value">{testScore.toLocaleString('es-ES')}</strong>
            </div>
          </div>

          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              const userAnswer = userAnswers[i] || '—';
              const expected = calcExpected(q);
              const ok = userAnswer === expected;
              return (
                <div key={i} className={`result-item ${ok ? 'math-result-ok' : 'math-result-ko'}`}>
                  <p><strong>Pregunta {i + 1}</strong></p>
                  <p>
                    Tu respuesta: <strong>{userAnswer}</strong>{' '}
                    <span style={{ color: ok ? '#16a34a' : '#dc2626' }}>{ok ? '✅' : `❌ (${expected})`}</span>
                  </p>
                </div>
              );
            })}
          </div>
          <div className="test-controls" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <button onClick={actions.startTest} className="btn-test">Volver a intentar</button>
            <button onClick={actions.exitTest} className="btn-mode">Modo Practica</button>
          </div>
        </div>
      ) : (
        children
      )}

      {/* Controles y Feedback (solo si NO estamos viendo resultados del test) */}
      {!showingTestResults && (
        <>
          {/* Controles Test */}
          {hasTestMode && isTestMode && (
            <div className="controles" style={{ marginTop: 16 }}>
              <button onClick={actions.nextQuestion} className="btn-test">
                {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          )}

          {/* Controles Practica */}
          {(!hasTestMode || !isTestMode) && (
            <>
              <div id="feedback-message" key={feedback.text} className={feedback.cls}>
                {feedback.text}
              </div>
              <div id="controls">
                <button id="check-button" onClick={onCheck}>Comprobar</button>
                <button id="new-problem-button" onClick={onNew}>{newLabel}</button>
              </div>
            </>
          )}

          {/* Paleta Numerica */}
          <div id="number-palette">
            <h2>{paletteLabel}</h2>
            <div className="number-tiles-container">
              {[...Array(10).keys()].map(n => (
                <div
                  key={n}
                  className="number-tile"
                  draggable="true"
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', n)}
                  onClick={() => onPaletteClick(n)}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <InstructionsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title={`Como jugar: ${title}`}
      >
        {instructions || (
          <>
            <h3>Objetivo</h3>
            <p>Completa la operacion colocando los digitos correctos en cada casilla vacia.</p>
            <h3>Como se juega</h3>
            <ul>
              <li>Pulsa en una casilla vacia para seleccionarla (se resalta en azul).</li>
              <li>Luego pulsa un numero de la paleta inferior para colocarlo.</li>
              <li>Tambien puedes arrastrar los numeros directamente a las casillas.</li>
              <li>Si te equivocas, pulsa otra vez la casilla y pon otro numero.</li>
            </ul>
          </>
        )}
      </InstructionsModal>
    </div>
  );
};

export default MathOperationLayout;
