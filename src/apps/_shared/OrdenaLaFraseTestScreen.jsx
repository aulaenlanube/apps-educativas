import React from 'react';
import './OrdenaLaFraseShared.css';

const OrdenaLaFraseTestScreen = ({ game }) => {
    const progressPercentage = ((game.currentQuestionIndex + 1) / game.TOTAL_TEST_QUESTIONS) * 100;

    if (game.showResults) {
        const correctAnswers = game.testQuestions.filter((q, i) => q.solucion === game.userAnswers[i]).length;

        return (
            <div className="ordena-frase-container test-results">
                {/* Título con nuevo estilo */}
                <h1 className="ordena-frase-main-title gradient-text text-5xl">¡Test Completado!</h1>
                
                {/* Puntuación con nuevo estilo */}
                <div className="score">Tu puntuación: <span>{game.score}</span></div>
                
                <p>Has acertado {correctAnswers} de {game.TOTAL_TEST_QUESTIONS} frases.</p>
                {game.elapsedTime > 0 && <p>Tiempo total: {game.elapsedTime} segundos.</p>}
                
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

    return (
        <div className="ordena-frase-container">
            {/* Título con nuevo estilo */}
            <h1 className="ordena-frase-main-title gradient-text text-4xl font-bold mb-4">📝 Test de Frases</h1>
            
            <div className="test-header">
                <div className="question-counter">Frase {game.currentQuestionIndex + 1} / {game.TOTAL_TEST_QUESTIONS}</div>
                {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            
            <div className="zona-destino" onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'destino')}>
                {game.palabrasDestino.map(p => (
                    <div key={p.id} id={p.id} className="palabra" draggable onDragStart={(e) => game.handleDragStart(e, p)} onDragEnd={game.handleDragEnd}>{p.texto}</div>
                ))}
            </div>
            <div className="zona-origen" onDragOver={game.handleDragOver} onDrop={(e) => game.handleDrop(e, 'origen')}>
                {game.palabrasOrigen.map(p => (
                    <div key={p.id} id={p.id} className="palabra" draggable onDragStart={(e) => game.handleDragStart(e, p)} onDragEnd={game.handleDragEnd}>{p.texto}</div>
                ))}
            </div>

            <div className="controles">
                 <button onClick={game.handleNextQuestion} className="btn-test">
                    {game.currentQuestionIndex === game.TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
};

export default OrdenaLaFraseTestScreen;