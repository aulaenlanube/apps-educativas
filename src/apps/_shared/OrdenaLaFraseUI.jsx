// src/apps/_shared/OrdenaLaFraseUI.jsx
import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import './OrdenaLaFraseShared.css';
import './SharedPremium.css';

// Color del anillo de nota (>=8 verde, >=5 azul, <5 rojo) — solo presentación
const gradeColor = (n) => (n >= 8 ? '#10b981' : n >= 5 ? '#3b82f6' : '#ef4444');

const OrdenaLaFraseUI = ({ game, onGameComplete }) => {
  const progressPct = ((game.currentQuestionIndex + 1) / game.TOTAL_TEST_QUESTIONS) * 100;
  const cls = `ordena-frase-container sp-shell font-${game.fontStyle}`;
  
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
      <h1 className="ordena-frase-main-title sp-title text-5xl mb-4">
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

  // Tracking examen
  const trackedRef = useRef(false);
  useEffect(() => {
    if (game.isTestMode && game.showResults && !trackedRef.current) {
      trackedRef.current = true;
      const correct = game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length;
      onGameComplete?.({
        mode: 'test',
        score: game.score,
        maxScore: game.TOTAL_TEST_QUESTIONS * 100 + 300,
        correctAnswers: correct,
        totalQuestions: game.TOTAL_TEST_QUESTIONS,
        durationSeconds: game.elapsedTime || undefined,
      });
    }
    if (!game.showResults) trackedRef.current = false;
  }, [game.isTestMode, game.showResults, game.score, game.testQuestions, game.userAnswers, game.TOTAL_TEST_QUESTIONS, game.elapsedTime, onGameComplete]);

  // Tracking práctica: solo registrar tiempo de juego, sin puntuación
  const practiceTrackedRef = useRef(false);
  useEffect(() => {
    if (!game.isTestMode && game.feedback?.clase === 'correcta' && !practiceTrackedRef.current) {
      practiceTrackedRef.current = true;
      onGameComplete?.({
        mode: 'practice',
        score: 0,
        maxScore: 0,
        correctAnswers: 1,
        totalQuestions: 1,
        durationSeconds: 0,
      });
      // Reset para la siguiente frase
      setTimeout(() => { practiceTrackedRef.current = false; }, 500);
    }
  }, [game.isTestMode, game.feedback, onGameComplete]);

  // Modo TEST: resultados
  if (game.isTestMode && game.showResults) {
    const correct = game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length;
    const nota = Math.round((correct / game.TOTAL_TEST_QUESTIONS) * 100) / 10;
    const notaColor = nota >= 8 ? 'excellent' : nota >= 5 ? 'good' : 'fail';
    const notaMsg = nota >= 9 ? '¡Excelente! 🌟' : nota >= 7 ? '¡Muy bien! 👏' : nota >= 5 ? 'Aprobado 💪' : 'Necesitas repasar 📖';

    return (
      <div className={`${cls} test-results`}>
        <Header titulo="Examen Completado!" />

        <div className={`ordena-nota sp-grade-card ${notaColor}`}>
          <div className="sp-grade-ring" style={{ '--sp-grade': nota, '--sp-grade-color': gradeColor(nota) }}>
            <div className="ordena-nota-big">{nota.toFixed(1)}<span className="ordena-nota-small">/10</span></div>
          </div>
          <div className="ordena-nota-msg sp-grade-msg"><strong>{notaMsg}</strong></div>
          <div className="ordena-nota-detail">{correct} de {game.TOTAL_TEST_QUESTIONS} frases correctas</div>
        </div>

        <div className="ordena-puntos-row">
          <div className="ordena-puntos sp-points">
            <span className="ordena-puntos-icon">⭐</span>
            <span className="ordena-puntos-value">{game.score.toLocaleString('es-ES')}</span>
            <span className="ordena-puntos-label">puntos</span>
          </div>
          {game.elapsedTime > 0 && (
            <div className="ordena-tiempo">
              <span className="ordena-tiempo-icon">⏱️</span>
              <span className="ordena-tiempo-value">{game.elapsedTime}s</span>
            </div>
          )}
        </div>

        <div className="results-summary sp-results">
          {game.testQuestions.map((q, i) => (
            <div key={i} className={`result-item sp-result ${q.solucion === game.userAnswers[i] ? 'is-ok' : 'is-ko'}`}>
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

        <div className="test-controls sp-controls">
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
        <Header titulo="Examen" />
        <div className="test-header">
          <div key={game.currentQuestionIndex} className="sp-q-chip">Frase {game.currentQuestionIndex + 1} / {game.TOTAL_TEST_QUESTIONS}</div>
          {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
        </div>
        <div className="progress-bar-container sp-progress">
          <div className="progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="zona-destino sp-zone" ref={game.dropZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
          {renderPalabras(game.palabrasDestino, true)}
        </div>

        <div className="zona-origen sp-zone" ref={game.originZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
          {renderPalabras(game.palabrasOrigen, false)}
        </div>

        <div className="controles sp-controls">
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
        <button className="btn-mode sp-mode active">
          <span className="sp-mode-icon" aria-hidden="true"><BookOpen size={16} /></span>
          Práctica Libre
        </button>
        <button onClick={game.startTest} className="btn-mode sp-mode sp-mode--exam">
          <span className="sp-mode-icon" aria-hidden="true"><GraduationCap size={16} /></span>
          Examen
        </button>
      </div>

      <div className="zona-destino sp-zone" ref={game.dropZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
        {renderPalabras(game.palabrasDestino, true)}
      </div>

      <p 
        id="feedback" 
        key={game.feedback.id || 'initial'} 
        className={`${game.feedback.clase || ''} sp-fb`}
      >
        {game.feedback.texto}
      </p>

      <div className="zona-origen sp-zone" ref={game.originZoneRef} onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
        {renderPalabras(game.palabrasOrigen, false)}
      </div>

      <div className="controles sp-controls">
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
    </div>
  );
};

export default OrdenaLaFraseUI;