import React from 'react';
import './OrdenaLaHistoriaShared.css';

const OrdenaLaHistoriaTestScreen = ({ game }) => {
    const progressPercentage = ((game.currentStoryIndex + 1) / game.TOTAL_TEST_STORIES) * 100;

    if (game.showResults) {
        const correctAnswers = game.testQuestions.filter((story, i) => {
            const userOrder = game.userAnswers[i].map(f => f.texto).join();
            const correctOrder = story.map(f => f.texto).join();
            return userOrder === correctOrder;
        }).length;

        return (
            <div className="ordena-historia-container test-results">
                <h1 className="main-title gradient-text text-5xl">¡Test Completado!</h1>
                <div className="score">Tu puntuación: <span>{game.score}</span></div>
                <p>Has acertado {correctAnswers} de {game.TOTAL_TEST_STORIES} historias.</p>
                {game.elapsedTime > 0 && <p>Tiempo total: {game.elapsedTime} segundos.</p>}
                <div className="results-summary">
                    {game.testQuestions.map((story, i) => (
                        <div key={i} className="result-item">
                            <p><strong>Historia {i + 1} (orden correcto):</strong></p>
                            <ol>
                                {story.map(frase => <li key={frase.id}>{frase.texto}</li>)}
                            </ol>
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
        <div className="ordena-historia-container">
            <h1 className="main-title gradient-text text-4xl font-bold mb-4">📝 Test de Historias</h1>
            <div className="test-header">
                <div>Historia {game.currentStoryIndex + 1} / {game.TOTAL_TEST_STORIES}</div>
                {game.elapsedTime > 0 && <div className="timer">Tiempo: {game.elapsedTime}s</div>}
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="zona-frases" onDrop={game.handleDrop} onDragOver={game.handleDragOver}>
                {game.frasesDesordenadas.map((frase) => (
                    <div
                        key={frase.id}
                        data-id={frase.id}
                        className="frase"
                        draggable
                        onDragStart={(e) => game.handleDragStart(e, frase)}
                        onDragEnd={game.handleDragEnd}
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
};

export default OrdenaLaHistoriaTestScreen;