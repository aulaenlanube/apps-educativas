import React, { useEffect, useRef, useState } from 'react';
import '/src/apps/_shared/MathBoxShared.css';
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
  const { currentQuestionIndex, totalQuestions, showResults, score, testQuestions, userAnswers } = testState || {};
  const progressPct = testState ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Tracking: reportar cuando se muestran resultados del test
  const trackedRef = useRef(false);
  useEffect(() => {
    if (!hasTestMode) return;
    if (showResults && !trackedRef.current) {
      trackedRef.current = true;
      const hits = testQuestions?.filter((q, i) => {
        const sum = q.reduce((a, b) => a + parseInt(b), 0);
        return userAnswers[i] === sum.toString();
      }).length || 0;
      onGameComplete?.({
        mode: 'test',
        score: score || 0,
        maxScore: (totalQuestions || 0) * 200,
        correctAnswers: hits,
        totalQuestions: totalQuestions || 0,
      });
    }
    if (!showResults) trackedRef.current = false;
  }, [hasTestMode, showResults, score, totalQuestions, testQuestions, userAnswers, onGameComplete]);

  // Determinar si estamos viendo resultados del test
  const showingTestResults = hasTestMode && isTestMode && showResults;

  return (
    <div id="app-container">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
          <span role="img" aria-label={title}>{emoji}</span>{' '}
          <span className="gradient-text">{title}</span>
        </h1>
        <InstructionsButton onClick={() => setShowHelp(true)} />
      </div>

      {/* Selector de Modo (solo si tiene test mode) */}
      {hasTestMode && (
        <div className="mode-selection">
          <button
            className={`btn-mode ${!isTestMode ? 'active' : ''}`}
            onClick={() => { setTestMode(false); actions.startPractice(); }}
          >
            Practica Libre
          </button>
          <button className="btn-mode" onClick={actions.startTest}>Iniciar Test</button>
        </div>
      )}

      {/* Toggle (opcional) */}
      {toggleLabel && onToggleChange && (
        <div id="options-area" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 500, color: 'var(--app-text-secondary)', fontSize: '0.95em' }}>{toggleLabel}</span>
          <div
            onClick={() => onToggleChange(!toggleValue)}
            style={{
              width: 52, height: 28, borderRadius: 14, cursor: 'pointer',
              background: toggleValue ? '#2563eb' : '#cbd5e1',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3,
              left: toggleValue ? 27 : 3,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>
      )}

      {/* Cabecera del Test (Progreso) */}
      {hasTestMode && isTestMode && !showResults && (
        <>
          <div className="test-header">
            <div>Pregunta {currentQuestionIndex + 1} / {totalQuestions}</div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {/* AREA PRINCIPAL: Resultados del Test O el Tablero */}
      {showingTestResults ? (
        <div className="test-results" style={{ marginTop: 20 }}>
          <h2 className="score">Puntuacion: <span>{score}</span></h2>
          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              const userAnswer = userAnswers[i] || '—';
              return (
                <div key={i} className="result-item">
                  <p><strong>Pregunta {i + 1}</strong></p>
                  <p>Tu respuesta: {userAnswer}</p>
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
              <div id="feedback-message" className={feedback.cls}>
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
