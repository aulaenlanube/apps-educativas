// src/apps/_shared/DetectiveDePalabrasUI.jsx
import React, { useEffect, useRef } from 'react';
import './DetectiveDePalabrasShared.css';

const TOTAL_TEST_QUESTIONS = 5;

const DetectiveDePalabrasUI = ({ game, onGameComplete }) => {
  const progressPct = ((game.indiceFraseActual + 1) / TOTAL_TEST_QUESTIONS) * 100;
  const cls = `detective-container font-${game.fontStyle}`;

  // Cabecera común con slider
  const Header = ({ titulo, subtitulo }) => (
    <>
      <h1 className="detective-title text-5xl mb-4">
        <span role="img" aria-label="Detective">🕵️‍♂️</span> <span className="gradient-text">{titulo}</span>
      </h1>
      {subtitulo && <p className="instrucciones">{subtitulo}</p>}

      <div className="font-slider-container">
        <div className="font-slider-labels">
          <span>Imprenta</span>
          <span>Ligada</span>
          <span>Mayúsculas</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={game.fontStyleIndex}
          onChange={game.handleFontStyleChange}
          className="font-slider"
          aria-label="Selector de tipografía"
        />
      </div>
    </>
  );

  // Aux: solución transformada si el hook expone transformador
  const transformed = (s) =>
    typeof game.getTransformedSolution === 'function' ? game.getTransformedSolution(s) : s;

  // Tracking
  const trackedRef = useRef(false);
  useEffect(() => {
    if (game.isTestMode && game.showResults && !trackedRef.current) {
      trackedRef.current = true;
      const correct = game.testQuestions.filter((q, i) => transformed(q.solucion) === game.userAnswers[i]).length;
      onGameComplete?.({
        mode: 'test',
        score: game.score,
        maxScore: TOTAL_TEST_QUESTIONS * 200,
        correctAnswers: correct,
        totalQuestions: TOTAL_TEST_QUESTIONS,
        durationSeconds: game.elapsedTime || undefined,
      });
    }
    if (!game.showResults) trackedRef.current = false;
  }, [game.isTestMode, game.showResults, game.score, onGameComplete]);

  if (game.isTestMode) {
    // Resultados del test
    if (game.showResults) {
      const correct = game.testQuestions.filter((q, i) => transformed(q.solucion) === game.userAnswers[i]).length;

      return (
        <div className={`${cls} test-results`}>
          <Header titulo="Examen Completado!" />
          <div className="score">Tu puntuación: <span>{game.score}</span></div>
          <p>Has acertado {correct} de {TOTAL_TEST_QUESTIONS} frases</p>
          {game.elapsedTime > 0 && <p>Tiempo total: {game.elapsedTime} segundos</p>}

          <div className="results-summary">
            {game.testQuestions.map((q, i) => (
              <div key={i} className="result-item">
                <p><strong>Frase {i + 1}:</strong></p>
                <p className={transformed(q.solucion) === game.userAnswers[i] ? 'correcto' : 'incorrecto'}>
                  Tu respuesta: {game.userAnswers[i] || 'No contestada'}
                </p>
                {transformed(q.solucion) !== game.userAnswers[i] && (
                  <p className="correcto">Solución: {transformed(q.solucion)}</p>
                )}
              </div>
            ))}
          </div>

          <div className="test-controls">
            <button onClick={game.startTest} className="btn-siguiente">Volver a intentar</button>
            <button onClick={game.exitTestMode} className="btn-mode">Modo Práctica</button>
          </div>
        </div>
      );
    }

    // Test en curso
    return (
      <div className={cls}>
        <Header titulo="Examen" />

        <div className="test-header">
          <div>Frase {game.indiceFraseActual + 1} / {TOTAL_TEST_QUESTIONS}</div>
          {game.withTimer && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="detective-frase-container">
          {game.letras.map((letra, index) => (
            <React.Fragment key={index}>
              <span className="detective-letra" onClick={() => game.toggleSeparador(index)}>
                {letra.char}
              </span>
              {letra.separador && index < game.letras.length - 1 && (
                <span className="detective-separador" onClick={() => game.toggleSeparador(index)} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="controles">
          <button onClick={game.handleNextQuestion} className="btn-siguiente">
            {game.indiceFraseActual === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    );
  }

  // Práctica
  return (
    <div className={cls}>
      <Header titulo="Detective de Palabras" subtitulo="Haz clic entre las letras para separar las palabras y forma la frase" />

      <div className="mode-selection">
        <button className="btn-mode active">Práctica Libre</button>
        <button onClick={game.startTest} className="btn-mode">
          Examen
        </button>
      </div>

      {/* AQUÍ SE HA AÑADIDO ref={game.containerRef} */}
      <div className="detective-frase-container" ref={game.containerRef}>
        {game.letras.map((letra, index) => (
          <React.Fragment key={index}>
            <span className="detective-letra" onClick={() => game.toggleSeparador(index)}>
              {letra.char}
            </span>
            {letra.separador && index < game.letras.length - 1 && (
              <span className={`detective-separador ${letra.status}`} onClick={() => game.toggleSeparador(index)} />
            )}
          </React.Fragment>
        ))}
      </div>

      <p 
        key={game.feedbackKey} 
        className={`detective-feedback ${game.feedback.clase}`}
      >
        {game.feedback.texto}
      </p>

      <div className="controles">
        {!game.fraseResuelta ? (
          <>
            <button onClick={game.comprobarFrase}>¡Comprobar!</button>
            <button onClick={game.siguienteFrase} className="btn-otra-frase">Otra Frase</button>
          </>
        ) : (
          <button onClick={game.siguienteFrase} className="btn-siguiente">Siguiente Frase</button>
        )}
      </div>
    </div>
  );
};

export default DetectiveDePalabrasUI;