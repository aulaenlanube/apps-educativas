import React, { useState, useRef, useEffect } from 'react';
import '../_shared/RoscoShared.css';

const RoscoUI = ({ 
    gameState, currentQuestion, letterStatus, score, total, 
    checkAnswer, pasapalabra, restartGame, feedback,
    startGame, configCount, setConfigCount, maxQuestions
}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (gameState === 'playing' && inputRef.current && !feedback) {
            inputRef.current.focus();
        }
    }, [currentQuestion, feedback, gameState]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        checkAnswer(inputValue);
        setInputValue('');
    };

    // --- PANTALLA DE CONFIGURACIÓN ---
    if (gameState === 'config') {
        return (
            <div className="rosco-container pt-10">
                <h1 className="text-5xl font-extrabold mb-4 text-blue-600" style={{ fontFamily: 'Fredoka One' }}>
                    El Rosco del Saber
                </h1>
                <p className="mb-8 text-xl text-gray-600">Configura tu partida</p>
                
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md mx-auto">
                    <div className="mb-8">
                        <label className="block text-gray-700 font-bold mb-2 text-xl">
                            Número de preguntas: <span className="text-blue-600 text-3xl ml-2">{configCount}</span>
                        </label>
                        <p className="text-sm text-gray-400 mb-4">
                            {configCount === maxQuestions ? '¡Rosco Completo!' : 'Partida Rápida'}
                        </p>
                        <input 
                            type="range" 
                            min="5" 
                            max={maxQuestions} 
                            value={configCount} 
                            onChange={(e) => setConfigCount(parseInt(e.target.value))}
                            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
                            <span>5 (Mínimo)</span>
                            <span>{maxQuestions} (Completo)</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => startGame(configCount)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-4 px-6 rounded-2xl transition-transform transform hover:scale-105 shadow-lg"
                    >
                        ¡Jugar Ahora!
                    </button>
                </div>
            </div>
        );
    }

    // --- PANTALLA FINAL ---
    if (gameState === 'finished') {
        return (
            <div className="rosco-container pt-10">
                <h1 className="text-5xl font-extrabold mb-8 text-blue-600" style={{ fontFamily: 'Fredoka One' }}>
                    ¡Rosco Completado!
                </h1>
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md mx-auto">
                    <p className="text-2xl mb-2 text-gray-500 font-bold">Puntuación Final</p>
                    <p className="text-8xl font-extrabold text-green-500 mb-10">{score} <span className="text-4xl text-gray-300">/ {total}</span></p>
                    <button 
                        onClick={restartGame} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-10 rounded-full transition-colors shadow-lg w-full"
                    >
                        Nueva Partida
                    </button>
                </div>
            </div>
        );
    }

    // --- PANTALLA DE CARGA ---
    if (gameState === 'loading' || !currentQuestion) {
        return <div className="text-center p-10 text-2xl font-bold text-gray-400">Preparando el Rosco...</div>;
    }

    // --- PANTALLA DE JUEGO ---
    const radius = 135; 
    const letters = Object.keys(letterStatus);
    
    return (
        <div className="rosco-container">
            <div className="flex justify-between items-center px-4 max-w-2xl mx-auto mb-2">
                <div className="bg-white px-4 py-2 rounded-full shadow-sm font-bold text-blue-600">
                    Aciertos: {score} / {total}
                </div>
                <button onClick={restartGame} className="text-sm font-bold text-gray-400 hover:text-red-500">Salir</button>
            </div>

            <div className="rosco-circle">
                {letters.map((letra, index) => {
                    const angle = (index / letters.length) * 2 * Math.PI - (Math.PI / 2);
                    const x = Math.cos(angle) * radius + 150 - 20;
                    const y = Math.sin(angle) * radius + 150 - 20;
                    
                    const isCurrent = currentQuestion.letra === letra;
                    const statusClass = letterStatus[letra]; 

                    return (
                        <div 
                            key={letra} 
                            className={`rosco-letter ${statusClass} ${isCurrent ? 'active' : ''}`}
                            style={{ left: `${x}px`, top: `${y}px` }}
                        >
                            {letra}
                        </div>
                    );
                })}
            </div>

            <div className="rosco-center-box relative">
                {feedback && (
                    <div className={`feedback-overlay feedback-${feedback.type}`}>
                        {feedback.text}
                    </div>
                )}
                
                <div className="rosco-type-label">
                    {currentQuestion.tipo === 'empieza' ? 'Empieza por' : 'Contiene la'} 
                    <span className="text-2xl ml-2 text-blue-600">{currentQuestion.letra}</span>
                </div>
                
                <p className="rosco-definition">{currentQuestion.definicion}</p>
                
                <form onSubmit={handleSubmit} className="rosco-controls">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="rosco-input"
                        placeholder="Respuesta..."
                        autoComplete="off"
                        disabled={!!feedback}
                    />
                    <button type="submit" className="btn-check" disabled={!!feedback}>✓</button>
                    <button type="button" onClick={pasapalabra} className="btn-pass" disabled={!!feedback}>Pasapalabra</button>
                </form>
            </div>
        </div>
    );
};

export default RoscoUI;