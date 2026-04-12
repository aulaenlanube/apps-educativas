import React, { useEffect, useRef, useState } from 'react';
import '/src/apps/_shared/Sumas.css';
import InstructionsModal, { InstructionsButton } from './InstructionsModal';

/**
 * Layout unificado para todas las apps de sumas.
 * Gestiona: Cabecera, Modos, Opciones, Paleta, Controles y Resultados del Test.
 */
const SumasLayout = ({
  title,
  isTestMode, setTestMode, // Hooks para cambio de modo
  testState,               // { currentQuestionIndex, totalQuestions, showResults, score, testQuestions, userAnswers }
  practiceState,           // { feedback }
  actions,                 // { startPractice, startTest, checkPractice, nextQuestion, exitTest, onPaletteClick }
  options,                 // { showCarries, setShowCarries } (Opcional)
  onGameComplete,          // Callback de tracking
  instructions,            // JSX con el contenido de las instrucciones (opcional)
  children                 // El tablero (Board) se pasa como hijo
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const { currentQuestionIndex, totalQuestions, showResults, score, testQuestions, userAnswers } = testState || {};
  const progressPct = testState ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Tracking: reportar cuando se muestran resultados del test
  const trackedRef = useRef(false);
  useEffect(() => {
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
  }, [showResults, score, totalQuestions, testQuestions, userAnswers, onGameComplete]);

  return (
    <div id="app-container">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
          <span role="img" aria-label="Suma">🧮</span> <span className="gradient-text">{title}</span>
        </h1>
        <InstructionsButton onClick={() => setShowHelp(true)} />
      </div>

      {/* Selector de Modo */}
      <div className="mode-selection">
        <button
          className={`btn-mode ${!isTestMode ? 'active' : ''}`}
          onClick={() => { setTestMode(false); actions.startPractice(); }}
        >
          Práctica Libre
        </button>
        <button className="btn-mode" onClick={actions.startTest}>Iniciar Test</button>
      </div>

      {/* Opciones (ej: Toggle llevadas) */}
      {options && (
        <div id="options-area" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 500, color: 'var(--app-text-secondary)', fontSize: '0.95em' }}>Ayuda con llevadas</span>
          <div
            onClick={() => options.setShowCarries(v => !v)}
            style={{
              width: 52, height: 28, borderRadius: 14, cursor: 'pointer',
              background: options.showCarries ? '#2563eb' : '#cbd5e1',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              position: 'absolute', top: 3,
              left: options.showCarries ? 27 : 3,
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>
      )}

      {/* Cabecera del Test (Progreso) */}
      {isTestMode && !showResults && (
        <>
          <div className="test-header">
            <div>Pregunta {currentQuestionIndex + 1} / {totalQuestions}</div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {/* ÁREA PRINCIPAL: Muestra Resultados O el Tablero (children) */}
      {isTestMode && showResults ? (
        <div className="test-results" style={{ marginTop: 20 }}>
          <h2 className="score">Puntuación: <span>{score}</span></h2>
          <div className="results-summary" style={{ marginTop: 12 }}>
            {testQuestions.map((q, i) => {
              // Lógica de visualización de respuestas simple
              // Nota: Para una visualización perfecta de decimales/enteros, 
              // el padre podría pasar una función de formateo, aquí usamos una genérica simple.
              const userAnswer = userAnswers[i] || '—'; 
              // Simplificación: asumimos que el padre valida y pasa datos simples o formateados si es complejo
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
            <button onClick={actions.exitTest} className="btn-mode">Modo Práctica</button>
          </div>
        </div>
      ) : (
        // Renderizamos el tablero pasado desde la App específica
        children
      )}

      {/* Controles y Feedback (Solo si NO estamos viendo resultados) */}
      {!(isTestMode && showResults) && (
        <>
          {/* Controles Test */}
          {isTestMode && (
            <div className="controles" style={{ marginTop: 16 }}>
              <button onClick={actions.nextQuestion} className="btn-test">
                {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          )}

          {/* Controles Práctica */}
          {!isTestMode && (
            <>
              <div id="feedback-message" className={practiceState.feedback?.cls}>
                {practiceState.feedback?.text}
              </div>
              <div id="controls">
                <button id="check-button" onClick={actions.checkPractice}>Comprobar</button>
                <button id="new-problem-button" onClick={actions.startPractice}>Nueva Suma</button>
              </div>
            </>
          )}

          {/* Paleta Numérica */}
          <div id="number-palette">
            <h2>Arrastra o pulsa los números 👇</h2>
            <div className="number-tiles-container">
              {[...Array(10).keys()].map(n => (
                <div
                  key={n}
                  className="number-tile"
                  draggable="true"
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', n)}
                  onClick={() => actions.onPaletteClick(n)}
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
            <h3>Modos de juego</h3>
            <div className="instr-modes">
              <div className="instr-mode easy"><strong>Practica Libre</strong> — Resuelve operaciones sin limite. Puedes comprobar y generar nuevas tantas veces como quieras.</div>
              <div className="instr-mode exam"><strong>Test</strong> — Responde una serie de operaciones. Al final veras tu puntuacion.</div>
            </div>
            <div className="instr-tips">
              <strong>Consejo:</strong> Activa la ayuda de llevadas si necesitas ver los numeros que te llevas en cada columna.
            </div>
          </>
        )}
      </InstructionsModal>
    </div>
  );
};

export default SumasLayout;
