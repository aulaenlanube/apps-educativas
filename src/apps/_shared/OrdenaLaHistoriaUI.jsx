// UI unificada: si game.isTestMode muestra Test, si no, Práctica
import React, { useLayoutEffect, useRef } from 'react';
import './OrdenaLaHistoriaShared.css';

const OrdenaLaHistoriaUI = ({ game }) => {
  const progressPct = ((game.currentStoryIndex + 1) / game.TOTAL_TEST_STORIES) * 100;
  
  // Refs para animación FLIP
  const itemsRef = useRef(new Map());
  const prevPositions = useRef(new Map());

  useLayoutEffect(() => {
    itemsRef.current.forEach((element, id) => {
      if (!element) return;
      const newRect = element.getBoundingClientRect();
      const oldRect = prevPositions.current.get(id);
      if (oldRect) {
        const deltaY = oldRect.top - newRect.top;
        if (deltaY !== 0) {
          element.style.transform = `translateY(${deltaY}px)`;
          element.style.transition = 'none';
          requestAnimationFrame(() => {
            element.style.transform = '';
            element.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)';
          });
        }
      }
      prevPositions.current.set(id, newRect);
    });
  }, [game.frasesDesordenadas]);

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

  const renderFrasesList = () => (
    <div className="zona-frases" ref={game.dropZoneRef} onDrop={game.handleDrop} onDragOver={game.handleDragOver}>
      {game.frasesDesordenadas.map((frase, index) => {
        const isFirst = index === 0;
        const isLast = index === game.frasesDesordenadas.length - 1;

        return (
          <div
            key={frase.id}
            data-id={frase.id}
            ref={(el) => {
              if (el) itemsRef.current.set(frase.id, el);
              else itemsRef.current.delete(frase.id);
            }}
            className="frase"
            draggable
            onDragStart={(e) => game.handleDragStart(e, frase)}
            onDragEnd={game.handleDragEnd}
            onTouchStart={(e) => game.handleTouchStart(e, frase)}
          >
            <span className="frase-texto">{frase.texto}</span>
            
            <div className="frase-controls">
              {/* BOTÓN SUPERIOR */}
              {isFirst ? (
                // Si es la primera: Botón "Ir al final" (Doble Flecha Abajo)
                <button 
                    className="btn-move btn-double-down" 
                    onClick={(e) => { e.stopPropagation(); game.moveFraseToExtreme(index, 'bottom'); }}
                    onTouchStart={(e) => e.stopPropagation()} 
                    title="Mover al final"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13l5 5 5-5 M7 6l5 5 5-5"/>
                  </svg>
                </button>
              ) : (
                // Si NO es la primera: Botón "Subir" (Flecha Arriba)
                <button 
                    className="btn-move btn-up" 
                    onClick={(e) => { e.stopPropagation(); game.moveFrase(index, -1); }}
                    onTouchStart={(e) => e.stopPropagation()} 
                    title="Subir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </button>
              )}

              {/* BOTÓN INFERIOR */}
              {isLast ? (
                // Si es la última: Botón "Ir al inicio" (Doble Flecha Arriba)
                <button 
                    className="btn-move btn-double-up" 
                    onClick={(e) => { e.stopPropagation(); game.moveFraseToExtreme(index, 'top'); }}
                    onTouchStart={(e) => e.stopPropagation()} 
                    title="Mover al principio"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 11l-5-5-5 5 M17 18l-5-5-5 5"/>
                  </svg>
                </button>
              ) : (
                // Si NO es la última: Botón "Bajar" (Flecha Abajo)
                <button 
                    className="btn-move btn-down" 
                    onClick={(e) => { e.stopPropagation(); game.moveFrase(index, 1); }}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Bajar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const cls = `ordena-historia-container font-${game.fontStyle}`;

  if (game.isTestMode) {
    if (game.showResults) {
      // (Resultados del test...)
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
      <div 
        className={cls} 
        onTouchMove={game.handleTouchMove} 
        onTouchEnd={game.handleTouchEnd}
        onTouchCancel={game.handleTouchCancel}
      >
        <Header titulo="Test de Historias" />
        <div className="test-header">
          <div>Historia {game.currentStoryIndex + 1} / {game.TOTAL_TEST_STORIES}</div>
          {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        {renderFrasesList()}

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
    <div 
      className={cls} 
      onTouchMove={game.handleTouchMove} 
      onTouchEnd={game.handleTouchEnd}
      onTouchCancel={game.handleTouchCancel}
    >
      <Header titulo="Ordena la Historia" subtitulo="Arrastra las frases o usa las flechas para ordenarlas" />

      <div className="mode-selection">
        <button className="btn-mode active">Práctica Libre</button>
        <button onClick={game.startTest} className="btn-mode">Iniciar Test</button>
      </div>

      {renderFrasesList()}

      <div className="controles">
        <button onClick={game.checkStory}>Comprobar</button>
        <button onClick={game.cargarSiguienteHistoria} className="btn-saltar">Otra Historia</button>
        <button 
          onClick={game.toggleSolution} 
          className="btn-ver-solucion"
        >
          {game.showSolution ? 'Ocultar' : 'Solución'}
        </button>
      </div>

      {game.showSolution && (
        <div className="caja-solucion-historia fade-in">
          <p><strong>Orden Correcto:</strong></p>
          <ol>
            {game.historiaCorrecta.map(frase => (
              <li key={frase.id}>{frase.texto}</li>
            ))}
          </ol>
        </div>
      )}

      <p id="feedback" className={game.feedback.clase}>{game.feedback.texto}</p>
    </div>
  );
};

export default OrdenaLaHistoriaUI;