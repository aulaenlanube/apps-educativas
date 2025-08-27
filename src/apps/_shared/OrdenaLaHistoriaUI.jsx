// UI unificada: si game.isTestMode muestra Test, si no, Práctica
import React from 'react';
import './OrdenaLaHistoriaShared.css';

const OrdenaLaHistoriaUI = ({ game }) => {
  const progressPct = ((game.currentStoryIndex + 1) / game.TOTAL_TEST_STORIES) * 100;

  // Cabecera común con slider de tipografía
  const Header = ({ titulo, subtitulo }) => (
    <>
      <h1 className="main-title text-5xl mb-2">
        <span role="img" aria-label="Icono">📚</span> <span className="gradient-text">{titulo}</span>
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

  // Contenedor con clase de estilo visual
  const cls = `ordena-historia-container font-${game.fontStyle}`;

  if (game.isTestMode) {
    // Modo test
    if (game.showResults) {
      const correct = game.testQuestions.filter((story, i) => {
        const u = game.userAnswers[i].map(f => f.texto).join();
        const c = story.map(f => f.texto).join();
        return u === c;
      }).length;

      return (
        <div className={`${cls} test-results`}>
          <Header titulo="¡Test Completado!" />
          <div className="score">Tu puntuación: <span>{game.score}</span></div>
          <p>Has acertado {correct} de {game.TOTAL_TEST_STORIES} historias</p>
          {game.elapsedTime > 0 && <p>Tiempo total: {game.elapsedTime} s</p>}
          <div className="results-summary">
            {game.testQuestions.map((story, i) => (
              <div key={i} className="result-item">
                <p><strong>Historia {i + 1} (orden correcto):</strong></p>
                <ol>{story.map(frase => <li key={frase.id}>{frase.texto}</li>)}</ol>
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

    return (
      <div className={cls} onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd}>
        <Header titulo="Test de Historias" />
        <div className="test-header">
          <div>Historia {game.currentStoryIndex + 1} / {game.TOTAL_TEST_STORIES}</div>
          {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="zona-frases" ref={game.dropZoneRef} onDrop={game.handleDrop} onDragOver={game.handleDragOver}>
          {game.frasesDesordenadas.map((frase) => (
            <div
              key={frase.id}
              data-id={frase.id}
              className="frase"
              draggable
              onDragStart={(e) => game.handleDragStart(e, frase)}
              onDragEnd={game.handleDragEnd}
              onTouchStart={(e) => game.handleTouchStart(e, frase)}
            >
              {frase.texto}
            </div>
          ))}
        </div>

        <div className="controles">
          <button onClick={game.handleNextStory} className="btn-test">
            {game.currentStoryIndex === game.TOTAL_TEST_STORIES - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    );
  }

  // Modo práctica
  return (
    <div className={cls} onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd}>
      <Header titulo="Ordena la Historia" subtitulo="Arrastra las frases para ordenarlas y que la historia tenga sentido" />

      <div className="mode-selection">
        <button className="btn-mode active">Práctica Libre</button>
        <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
      </div>

      <div className="zona-frases" ref={game.dropZoneRef} onDrop={game.handleDrop} onDragOver={game.handleDragOver}>
        {game.frasesDesordenadas.map((frase) => (
          <div
            key={frase.id}
            data-id={frase.id}
            className="frase"
            draggable
            onDragStart={(e) => game.handleDragStart(e, frase)}
            onDragEnd={game.handleDragEnd}
            onTouchStart={(e) => game.handleTouchStart(e, frase)}
          >
            {frase.texto}
          </div>
        ))}
      </div>

      <div className="controles">
        <button onClick={game.checkStory}>Comprobar</button>
        <button onClick={game.cargarSiguienteHistoria} className="btn-saltar">Otra Historia</button>
      </div>

      <p id="feedback" className={game.feedback.clase}>{game.feedback.texto}</p>
    </div>
  );
};

export default OrdenaLaHistoriaUI;
