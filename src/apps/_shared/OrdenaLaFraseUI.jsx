// UI unificada para práctica y test
import React, { useEffect, useState } from 'react';
import './OrdenaLaFraseShared.css';

const OrdenaLaFraseUI = ({ game }) => {
  const progressPct = ((game.currentQuestionIndex + 1) / game.TOTAL_TEST_QUESTIONS) * 100;
  const cls = `ordena-frase-container font-${game.fontStyle}`;
  
  // Detectar si es dispositivo táctil para adaptar el mensaje
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const subtitulo = isTouch 
    ? "Toca las palabras para moverlas o usa arrastrar y soltar" 
    : "Arrastra las palabras o haz clic en ellas para formar la frase";

  const Header = ({ titulo, subtitulo }) => (
    <>
      <h1 className="ordena-frase-main-title text-5xl mb-4">
        <span role="img" aria-label="Icono de libreta">📝</span> <span className="gradient-text">{titulo}</span>
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

  // Helper para renderizar palabras
  const renderPalabras = (palabras, isDestino) => (
    palabras.map(p => (
      <div 
        key={p.id} 
        data-id={p.id} 
        className="palabra" 
        draggable
        onDragStart={(e) => game.handleDragStart(e, p)} 
        onDragEnd={game.handleDragEnd}
        onTouchStart={(e) => game.handleTouchStart(e, p)}
        // FIX: Añadido onTouchCancel para evitar que se queden flotando
        onTouchCancel={game.handleTouchCancel} 
        onClick={!isDestino ? () => game.handleOriginWordClick(p) : undefined}
      >
        {p.texto}
        {isDestino && (
          <button 
            className="btn-remove-word" 
            onClick={(e) => { 
              e.stopPropagation(); 
              game.handleRemoveWord(p); 
            }}
            aria-label="Eliminar palabra"
            // FIX: En táctil, evitar que el toque se propague y cause comportamientos raros
            onTouchEnd={(e) => e.stopPropagation()} 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>
    ))
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
      <div className={cls} onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd} onTouchCancel={game.handleTouchCancel}>
        <Header titulo="Test de Frases" />
        <div className="test-header">
          <div>Frase {game.currentQuestionIndex + 1} / {game.TOTAL_TEST_QUESTIONS}</div>
          {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="zona-destino" ref={game.dropZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
          {renderPalabras(game.palabrasDestino, true)}
        </div>

        <div className="zona-origen" ref={game.originZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
          {renderPalabras(game.palabrasOrigen, false)}
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
    <div className={cls} onTouchMove={game.handleTouchMove} onTouchEnd={game.handleTouchEnd} onTouchCancel={game.handleTouchCancel}>
      <Header
        titulo="Ordena la Frase"
        subtitulo={subtitulo}
      />

      <div className="mode-selection">
        <button className="btn-mode active">Práctica Libre</button>
        <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
      </div>

      <div className="zona-destino" ref={game.dropZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
        {renderPalabras(game.palabrasDestino, true)}
      </div>

      <div className="zona-origen" ref={game.originZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
        {renderPalabras(game.palabrasOrigen, false)}
      </div>

      <div className="controles">
        <button onClick={game.checkPracticeAnswer}>Comprobar</button>
        <button onClick={game.startPracticeMission} className="btn-saltar">Otra Frase</button>
        <button 
          onClick={game.toggleSolution} 
          className="btn-ver-solucion"
        >
          {game.showSolution ? 'Ocultar' : 'Solución'}
        </button>
      </div>

      {game.showSolution && (
        <div className="caja-solucion">
          <strong>Solución:</strong> {game.mision.solucion}
        </div>
      )}

      <p id="feedback" className={game.feedback.clase}>{game.feedback.texto}</p>
    </div>
  );
};

export default OrdenaLaFraseUI;