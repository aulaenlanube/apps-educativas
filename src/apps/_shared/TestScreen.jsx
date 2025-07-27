// src/apps/supermercado-primaria-X/TestScreen.jsx (CORREGIDO)

import React from 'react';
import './SupermercadoShared.css';

const TestScreen = ({ game, productos }) => {
    // La barra de progreso ahora refleja la pregunta actual, no la completada
    const progressPercentage = ((game.currentQuestionIndex + 1) / game.TOTAL_TEST_QUESTIONS) * 100;

    // Helper para formatear precios consistentemente
    const formatPrice = (price) => {
        // Si el precio es un número entero, no muestra decimales
        if (Number.isInteger(price)) {
            return price;
        }
        // Si tiene decimales, lo formatea a dos y usa coma
        return price.toFixed(2).replace('.', ',');
    };

    if (game.showResults) {
        const correctAnswers = game.testQuestions.filter((q, i) => {
            const userAnswer = parseFloat(String(game.userAnswers[i]).replace(',', '.'));
            return Math.abs(userAnswer - q.solucion) < 0.001;
        }).length;

        return (
            <div id="supermercado-app-container" className="test-results">
                <h1 className="supermercado-title">¡Test Completado!</h1>
                <div className="score">Tu puntuación: <span>{game.score}</span></div>
                <p>Has acertado {correctAnswers} de {game.TOTAL_TEST_QUESTIONS} preguntas.</p>
                {game.elapsedTime > 0 && <p>Tiempo total: {game.elapsedTime} segundos.</p>}
                
                <div className="results-summary">
                    {game.testQuestions.map((q, i) => (
                        <div key={i} className="result-item">
                            <p><strong>Pregunta {i + 1}:</strong> {q.texto}</p>
                            <p className={Math.abs(parseFloat(String(game.userAnswers[i]).replace(',', '.')) - q.solucion) < 0.001 ? 'correcta' : 'incorrecta'}>
                                Tu respuesta: {game.userAnswers[i] || 'N/A'} | Correcta: {formatPrice(q.solucion)}€
                            </p>
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
        <div id="supermercado-app-container">
            <h1 className="supermercado-title gradient-text text-4xl font-bold mb-4">🛒 Test Matemático</h1>
            
            <div id="panel-productos">
                {productos.map(p => (
                    <div key={p.nombre} className="producto">
                        {p.emoji} {p.nombre} - {formatPrice(p.precio)}€
                    </div>
                ))}
            </div>

            <div className="test-header">
                <div className="question-counter">Pregunta {game.currentQuestionIndex + 1} / {game.TOTAL_TEST_QUESTIONS}</div>
                {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            
            <div className="mision">
                <h2>¡Pregunta {game.currentQuestionIndex + 1}!</h2>
                <p id="textoMision">{game.mision.texto}</p>
            </div>
            <div className="respuesta-usuario">
                <input 
                    type="text" 
                    value={game.respuesta} 
                    onChange={(e) => game.setRespuesta(e.target.value)}
                    placeholder="Tu respuesta..."
                    autoFocus
                    onKeyPress={(event) => event.key === 'Enter' && game.handleNextQuestion()}
                />
                <button onClick={game.handleNextQuestion} className="btn-test">
                    {game.currentQuestionIndex === game.TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
};

export default TestScreen;