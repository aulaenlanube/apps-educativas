import React from 'react';
import '/src/apps/_shared/Sumas.css';

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
  children                 // El tablero (Board) se pasa como hijo
}) => {

  const { currentQuestionIndex, totalQuestions, showResults, score, testQuestions, userAnswers } = testState || {};
  const progressPct = testState ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Suma">🧮</span> <span className="gradient-text">{title}</span>
      </h1>

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
        <div id="options-area" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <label htmlFor="help-toggle">Ayuda con llevadas</label>
          <label className="switch">
            <input
              type="checkbox"
              id="help-toggle"
              checked={options.showCarries}
              onChange={() => options.setShowCarries(v => !v)}
            />
            <span className="slider round"></span>
          </label>
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
    </div>
  );
};

export default SumasLayout;
