// UI unificada para práctica y test
import React from 'react';
import './OrdenaLaFraseShared.css';

const OrdenaLaFraseUI = ({ game }) => {
  const progressPct = ((game.currentQuestionIndex + 1) / game.TOTAL_TEST_QUESTIONS) * 100;
  const cls = `ordena-frase-container font-${game.fontStyle}`;

  const Header = ({ titulo, subtitulo }) => (
    <>
      <h1 className="ordena-frase-main-title text-5xl mb-4">
        <span role="img" aria-label="Icono de libreta">📝</span> <span className="gradient-text">{titulo}</span>
      </h1>
      {subtitulo && <p className="instrucciones">{subtitulo}</p>}

      {/* Slider de tipografía (solo cambia clase CSS) */}
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

  // Modo TEST: resultados
  if (game.isTestMode && game.showResults) {
    const correct = game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length;

    return (
      <div className={`${cls} test-results`}>
        <Header titulo="¡Test Completado!" />
        <div className="score">Tu puntuación: <span>{game.score}</span></div>
        <p>Has acertado {correct} de {game.TOTAL_TEST_QUESTIONS} frases</p>
        {game.elapsedTime > 0 && <p>Tiempo total: {game.elapsedTime} segundos</p>}

        <div className="results-summary">
          {game.testQuestions.map((q, i) => (
            <div key={i} className="result-item">
              <p><strong>Frase {i + 1}:</strong></p>
              <p className={q.solucion === game.userAnswers[i] ? 'correcta' : 'incorrecta'}>
                Tu respuesta: {game.userAnswers[i] || 'No contestada'}
              </p>
              {q.solucion !== game.userAnswers[i] && (
                <p className="correcta">Solución: {q.solucion}</p>
              )}
            </div>
          ))}
        </div>

        <div className="test-controls">
          <button onClick={game.startTest} className="btn-test">Volver a intentar</button>
          <button onClick={game.exitTestMode} className="btn-mode">Modo Práctica</button>
        </div>
      </div>
    );
  }

  // Modo TEST: en curso
  if (game.isTestMode) {
    return (
      <div className={cls} onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd}>
        <Header titulo="Test de Frases" />
        <div className="test-header">
          <div>Frase {game.currentQuestionIndex + 1} / {game.TOTAL_TEST_QUESTIONS}</div>
          {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="zona-destino" ref={game.dropZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
          {game.palabrasDestino.map(p => (
            <div key={p.id} data-id={p.id} className="palabra" draggable
                 onDragStart={(e) => game.handleDragStart(e, p)} onDragEnd={game.handleDragEnd}
                 onTouchStart={(e) => game.handleTouchStart(e, p)}>
              {p.texto}
            </div>
          ))}
        </div>

        <div className="zona-origen" ref={game.originZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
          {game.palabrasOrigen.map(p => (
            <div key={p.id} data-id={p.id} className="palabra" draggable
                 onDragStart={(e) => game.handleDragStart(e, p)} onDragEnd={game.handleDragEnd}
                 onTouchStart={(e) => game.handleTouchStart(e, p)}>
              {p.texto}
            </div>
          ))}
        </div>

        <div className="controles">
          <button onClick={game.handleNextQuestion} className="btn-test">
            {game.currentQuestionIndex === game.TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    );
  }

  // Modo PRÁCTICA
  return (
    <div className={cls} onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd}>
      <Header
        titulo="Ordena la Frase"
        subtitulo="Arrastra las palabras para formar una frase con sentido"
      />

      <div className="mode-selection">
        <button className="btn-mode active">Práctica Libre</button>
        <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
      </div>

      <div className="zona-destino" ref={game.dropZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
        {game.palabrasDestino.map(p => (
          <div key={p.id} data-id={p.id} className="palabra" draggable
               onDragStart={(e) => game.handleDragStart(e, p)} onDragEnd={game.handleDragEnd}
               onTouchStart={(e) => game.handleTouchStart(e, p)}>
            {p.texto}
          </div>
        ))}
      </div>

      <div className="zona-origen" ref={game.originZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
        {game.palabrasOrigen.map(p => (
          <div key={p.id} data-id={p.id} className="palabra" draggable
               onDragStart={(e) => game.handleDragStart(e, p)} onDragEnd={game.handleDragEnd}
               onTouchStart={(e) => game.handleTouchStart(e, p)}>
            {p.texto}
          </div>
        ))}
      </div>

      <div className="controles">
        <button onClick={game.checkPracticeAnswer}>Comprobar</button>
        <button onClick={game.startPracticeMission} className="btn-saltar">Otra Frase</button>
      </div>

      <p id="feedback" className={game.feedback.clase}>{game.feedback.texto}</p>
    </div>
  );
};

export default OrdenaLaFraseUI;
