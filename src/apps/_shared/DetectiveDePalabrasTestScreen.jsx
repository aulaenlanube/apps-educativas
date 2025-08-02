// src/apps/_shared/DetectiveDePalabrasTestScreen.jsx (CORREGIDO)
import React from 'react';
import './DetectiveDePalabrasShared.css';

const TOTAL_TEST_QUESTIONS = 5;

const DetectiveDePalabrasTestScreen = ({ game }) => {
    const {
        letras,
        indiceFraseActual,
        toggleSeparador,
        handleNextQuestion,
        showResults,
        score,
        elapsedTime,
        userAnswers,
        testQuestions,
        startTest,
        exitTestMode,
        getTransformedSolution // Mantenemos esta función para mostrar resultados correctamente
    } = game;

    const progressPercentage = ((indiceFraseActual + 1) / TOTAL_TEST_QUESTIONS) * 100;

    if (showResults) {
        // La lógica de `getTransformedSolution` aquí se asegura de que si el test
        // se inició en mayúsculas, los resultados se muestren también en mayúsculas.
        const correctAnswers = testQuestions.filter((q, i) => getTransformedSolution(q.solucion) === userAnswers[i]).length;

        return (
            <div className="detective-container test-results">
                <h1 className="detective-title gradient-text text-5xl">¡Test Completado!</h1>
                <div className="score" style={{ fontSize: '2rem', margin: '20px 0' }}>Tu puntuación: <span style={{ fontSize: '2.5rem', color: '#673de6' }}>{score}</span></div>
                <p>Has acertado {correctAnswers} de {TOTAL_TEST_QUESTIONS} frases.</p>
                {game.withTimer && elapsedTime > 0 && <p>Tiempo total: {elapsedTime} segundos.</p>}
                
                <div className="results-summary" style={{ marginTop: '20px', textAlign: 'left' }}>
                    {testQuestions.map((q, i) => {
                        const transformedSolution = getTransformedSolution(q.solucion);
                        return (
                            <div key={i} className="result-item" style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                <p><strong>Frase {i + 1}:</strong></p>
                                <p className={transformedSolution === userAnswers[i] ? 'correcto' : 'incorrecto'}>
                                    Tu respuesta: {userAnswers[i] || 'No contestada'}
                                </p>
                                {transformedSolution !== userAnswers[i] && (
                                    <p className="correcto">Solución: {transformedSolution}</p>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="test-controls" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                    <button onClick={startTest} className="btn-siguiente">Volver a intentar</button>
                    <button onClick={exitTestMode} className="btn-mode">Modo Práctica</button>
                </div>
            </div>
        );
    }

    // CAMBIO: Se ha eliminado la clase `font-${fontStyle}` y el slider de tipografía
    return (
        <div className="detective-container">
            <h1 className="detective-title gradient-text text-4xl font-bold mb-4">📝 Test del Detective</h1>
            
            <div className="test-header">
                <div className="question-counter">Frase {indiceFraseActual + 1} / {TOTAL_TEST_QUESTIONS}</div>
                {game.withTimer && <div className="timer">Tiempo: {elapsedTime}s</div>}
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercentage}%`, background: '#4a90e2' }}></div>
            </div>
            
            <div className="detective-frase-container">
                {letras.map((letra, index) => (
                    <React.Fragment key={index}>
                        <span className="detective-letra" onClick={() => toggleSeparador(index)}>
                            {letra.char}
                        </span>
                        {letra.separador && index < letras.length - 1 && (
                            <span className="detective-separador" onClick={() => toggleSeparador(index)}></span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="controles">
                 <button onClick={handleNextQuestion} className="btn-siguiente">
                    {indiceFraseActual === TOTAL_TEST_QUESTIONS - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
};

export default DetectiveDePalabrasTestScreen;