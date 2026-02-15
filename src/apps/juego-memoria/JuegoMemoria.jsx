// src/apps/juego-memoria/JuegoMemoria.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import './JuegoMemoria.css';

const GAME_TIME = 60; // 1 minute
const MEMORIZE_TIME = 5; // 5 seconds
const GRID_SIZE = 9;
const FIXED_SEQUENCE = [4, 0, 8, 2, 6, 1, 7, 3, 5]; // Predefined non-sequential order for "Fixed" mode (LEGACY - NOT USED)



const JuegoMemoria = ({ level = 'eso', grade = 1, subjectId = 'biologia' }) => {
    const [words, setWords] = useState([]);
    const [targetOrder, setTargetOrder] = useState([]); // Random order to ask
    const [currentIndex, setCurrentIndex] = useState(0); // Index in targetOrder
    const [gameState, setGameState] = useState('loading'); // loading, memorize, playing, won, lost
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(MEMORIZE_TIME);
    const [revealedIndex, setRevealedIndex] = useState(null); // Temporarily revealed card index
    const [correctIndices, setCorrectIndices] = useState(new Set()); // Permanently revealed correct cards
    const [errorMsg, setErrorMsg] = useState(null);
    const [category, setCategory] = useState('');
    const [errorIndex, setErrorIndex] = useState(null);
    const [errorCountdown, setErrorCountdown] = useState(null); // Visual countdown for error state
    const [showHelp, setShowHelp] = useState(false);
    // State for Config
    const [gridSize, setGridSize] = useState(9); // 6, 9, 12
    const [gameTime, setGameTime] = useState(60); // 40, 60, 80
    const [errorWaitTime, setErrorWaitTime] = useState(2); // 1, 2, 3
    const [showSettings, setShowSettings] = useState(false);

    // Config Options
    const GRID_OPTIONS = [6, 9, 12];
    const TIME_OPTIONS = [40, 60, 80];
    const WAIT_OPTIONS = [1, 2, 3];

    const [isRandomOrder, setIsRandomOrder] = useState(false); // false = Sequential (Position 1), true = Random (Position 2)

    const timerRef = useRef(null);

    // Helper for robust shuffling
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };



    // Function to load words - Extracted to be reusable
    const fetchWords = async () => {
        try {
            setErrorMsg(null);
            const response = await fetch(`/data/${level}/${grade}/${subjectId}-runner.json`);
            if (!response.ok) throw new Error("No se pudo cargar los datos");
            const data = await response.json();

            const categories = Object.keys(data);
            if (categories.length === 0) {
                setErrorMsg(`No hay categorías en ${subjectId}.`);
                return;
            }

            // Using dynamic gridSize here
            const validCategories = categories.filter(c => Array.isArray(data[c]) && data[c].length >= gridSize);

            let selectedWords = [];
            let selectedCategory = '';

            if (validCategories.length > 0) {
                selectedCategory = validCategories[Math.floor(Math.random() * validCategories.length)];
                selectedWords = data[selectedCategory];
            } else {
                selectedCategory = 'General';
                let allWords = [];
                Object.values(data).forEach(arr => {
                    if (Array.isArray(arr)) allWords = [...allWords, ...arr];
                });
                selectedWords = allWords;
            }

            selectedWords = [...new Set(selectedWords)];

            if (selectedWords.length < gridSize) {
                setErrorMsg(`No hay suficientes palabras para ${gridSize} cartas.`);
                return;
            }

            setCategory(selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace(/-/g, ' ').replace(/_/g, ' '));

            // Re-shuffle the selection
            const shuffled = shuffleArray(selectedWords);
            const selected = shuffled.slice(0, gridSize);
            setWords(selected);

            // ALWAYS START WITH A RANDOM SEQUENCE for this specific game
            const order = shuffleArray(Array.from({ length: gridSize }, (_, i) => i));
            setTargetOrder(order);

            // Reset Game Logic
            setCorrectIndices(new Set());
            setRevealedIndex(null);
            setCurrentIndex(0);
            setMemorizeTimeLeft(MEMORIZE_TIME);
            setTimeLeft(gameTime); // Use dynamic gameTime

            // Start Memorize
            setGameState('memorize');
        } catch (err) {
            console.error(err);
            setErrorMsg("Error cargando palabras.");
        }
    };

    // Initial Load
    useEffect(() => {
        fetchWords();
    }, [grade, subjectId]);

    const handleNewGame = async () => {
        // 1. Hide everything immediately to avoid showcasing old words
        setCorrectIndices(new Set());
        setRevealedIndex(null);

        // 2. Vibrate/Shake to indicate change (while hidden)
        setGameState('shaking');
        await new Promise(r => setTimeout(r, 1000));

        // 3. Load new words immediately (this sets gameState to 'memorize')
        await fetchWords();
    };

    // Memorize Timer
    useEffect(() => {
        if (gameState === 'memorize') {
            const interval = setInterval(() => {
                setMemorizeTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setGameState('playing');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState]);


    // Game Timer
    useEffect(() => {
        if (gameState === 'playing') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 0.1;
                    if (next <= 0) {
                        clearInterval(timerRef.current);
                        setGameState('lost');
                        return 0;
                    }
                    return parseFloat(next.toFixed(1));
                });
            }, 100);
            return () => clearInterval(timerRef.current);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [gameState]);





    const handleBoxClick = (index) => {
        if (gameState !== 'playing') return;
        if (correctIndices.has(index)) return; // Already solved
        if (revealedIndex !== null) return; // Wait for animation

        // Always reveal the clicked box temporarily
        setRevealedIndex(index);

        const currentTargetIndex = targetOrder[currentIndex]; // The index we want


        // Check if correct
        if (index === currentTargetIndex) {
            // Correct!
            setTimeout(() => {
                // Add to correct set
                const newCorrect = new Set(correctIndices);
                newCorrect.add(index);
                setCorrectIndices(newCorrect);

                setRevealedIndex(null);

                if (newCorrect.size >= gridSize) {
                    setGameState('won');
                    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 }, zIndex: 3000 });
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 800);
        } else {
            // Incorrect
            setErrorIndex(index);
            setErrorCountdown(errorWaitTime); // Start countdown using Config

            // Update countdown every 100ms
            const interval = setInterval(() => {
                setErrorCountdown(prev => {
                    const next = prev - 0.1;
                    return next < 0 ? 0 : parseFloat(next.toFixed(1));
                });
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                setRevealedIndex(null);
                setErrorIndex(null);
                setErrorCountdown(null);

                // Reset progress (penalty)
                setCorrectIndices(new Set());
                setCurrentIndex(0);

                // Additional Difficulty: Reshuffle target order on failure if in Random Mode
                if (isRandomOrder) {
                    // Create a new shuffled array of indices 0..gridSize-1
                    const neOrder = shuffleArray(Array.from({ length: gridSize }, (_, i) => i));
                    setTargetOrder(neOrder);
                }
            }, errorWaitTime * 1000); // Use Config Wait Time (ms)
        }
    };


    // Keypad Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            const key = parseInt(e.key);
            if (!isNaN(key) && key >= 1 && key <= gridSize) {
                handleBoxClick(key - 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, revealedIndex, correctIndices, targetOrder, currentIndex]);



    const targetWord = words.length > 0 && targetOrder.length > 0 ? words[targetOrder[currentIndex]] : '';

    return (
        <div className="memory-game-container full-screen">
            <h1 className="game-title">
                Juego de Memoria
            </h1>

            {category && (
                <div className={`category-badge ${gameState === 'shaking' ? 'category-shake' : ''}`}>
                    📖 {category.replace(/_/g, ' ')}
                </div>
            )}

            {errorMsg && <div className="error-msg">{errorMsg}</div>}

            {/* Target Word Display Container - Used for Memorize Instruction AND Target Word */}
            {(gameState === 'playing' || gameState === 'memorize') && (
                <div className="target-word-container">
                    {gameState === 'memorize' ? (
                        <>
                            <span className="target-label text-yellow-400">🧠 FASE DE MEMORIZACIÓN</span>
                            <span className="target-word text-xl blink">¡Memoriza las posiciones!</span>
                        </>
                    ) : (
                        <>
                            <span className="target-label">ENCUENTRA:</span>
                            <span className="target-word">{targetWord}</span>
                        </>
                    )}
                </div>
            )}


            <div className={`memory-grid grid-${gridSize} ${gameState === 'memorize' ? 'memorizing' : ''}`}>
                {words.map((word, idx) => {
                    const isRevealed = gameState === 'memorize' ||
                        revealedIndex === idx ||
                        correctIndices.has(idx) ||
                        gameState === 'lost' ||
                        gameState === 'won';

                    return (
                        <div
                            key={idx}
                            className={`memory-box ${isRevealed ? 'revealed' : ''} ${correctIndices.has(idx) ? 'correct' : ''} ${gameState === 'shaking' ? 'shaking' : ''} ${errorIndex === idx ? 'error' : ''}`}
                            onClick={() => handleBoxClick(idx)}
                        >
                            <div className="memory-card-inner">
                                {/* Front: Hidden State (Face Down) */}
                                <div className="memory-card-front">
                                    <div className="card-pattern"></div>
                                    <span className="card-number">{idx + 1}</span>
                                </div>

                                {/* Back: Revealed State (Face Up) */}
                                <div className="memory-card-back">
                                    <span className="word-text">{word}</span>
                                    {errorIndex === idx && (
                                        <div className="error-countdown">
                                            <span>⏱️</span>
                                            <span>{Number(errorCountdown).toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="game-status-bar">
                <div className="status-group-top">
                    <div className="timer-box">
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-val">{gameState === 'memorize' ? memorizeTimeLeft : Number(timeLeft).toFixed(1)}s</span>
                    </div>
                    <div className="phase-indicator">
                        {/* Status messages handled in top container now */}
                    </div>
                </div>

                <div className="status-group-bottom">
                    <button className="help-btn" onClick={() => setShowHelp(true)} title="Instrucciones">
                        ❓ Ayuda
                    </button>
                    <button className="restart-btn-new" onClick={handleNewGame} title="Nueva Partida">
                        ✨ Nueva partida
                    </button>
                    <button className="settings-btn" onClick={() => setShowSettings(true)} title="Configuración">
                        ⚙️
                    </button>
                </div>
            </div>




            {/* Won / Lost Messages (Modal Style) */}
            <AnimatePresence>
                {(gameState === 'won' || gameState === 'lost') && (
                    <motion.div
                        className="game-result-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="result-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            {gameState === 'won' ? (
                                <div className="result-msg win-msg">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h1>¡ENHORABUENA!</h1>
                                    <p>¡Has encontrado todas las palabras!</p>
                                    <div className="final-score">
                                        Nota: 10 / 10
                                    </div>
                                </div>
                            ) : (
                                <div className="result-msg lose-msg">
                                    <div className="text-6xl mb-4">⏳</div>
                                    <h1>¡TIEMPO AGOTADO!</h1>
                                    <p>Se acabó el tiempo.</p>
                                    <div className="final-score">
                                        Nota: {Math.round((correctIndices.size / GRID_SIZE) * 10)} / 10
                                    </div>
                                </div>
                            )}

                            <button className="restart-btn-modal" onClick={handleNewGame}>
                                ✨ Jugar de nuevo
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            className="settings-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-btn" onClick={() => setShowSettings(false)}>✖</button>
                            <h2>⚙️ Configuración</h2>

                            <div className="setting-group">
                                <label>Número de Cajas:</label>
                                <div className="slider-container">
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="1"
                                        value={GRID_OPTIONS.indexOf(gridSize)}
                                        onChange={(e) => setGridSize(GRID_OPTIONS[parseInt(e.target.value)])}
                                    />
                                    <div className="slider-labels">
                                        {GRID_OPTIONS.map(val => (
                                            <span key={val} className={gridSize === val ? 'active' : ''}>{val}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Tiempo de Juego:</label>
                                <div className="options-row">
                                    {TIME_OPTIONS.map(time => (
                                        <button
                                            key={time}
                                            className={`option-btn ${gameTime === time ? 'active' : ''}`}
                                            onClick={() => setGameTime(time)}
                                        >
                                            {time}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Tiempo de Espera (Error):</label>
                                <div className="options-row">
                                    {WAIT_OPTIONS.map(wait => (
                                        <button
                                            key={wait}
                                            className={`option-btn ${errorWaitTime === wait ? 'active' : ''}`}
                                            onClick={() => setErrorWaitTime(wait)}
                                        >
                                            {wait}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Modo de Orden (Dado 🎲):</label>
                                <div className="options-row">
                                    <button
                                        className={`option-btn ${!isRandomOrder ? 'active' : ''}`}
                                        onClick={() => setIsRandomOrder(false)}
                                    >
                                        Fijo
                                    </button>
                                    <button
                                        className={`option-btn ${isRandomOrder ? 'active' : ''}`}
                                        onClick={() => setIsRandomOrder(true)}
                                    >
                                        Aleatorio
                                    </button>
                                </div>
                            </div>

                            <button className="confirm-settings-btn" onClick={() => {
                                setShowSettings(false);
                                handleNewGame();
                            }}>
                                ✅ Guardar y Nueva Partida
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        className="help-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div
                            className="help-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="close-help-btn" onClick={() => setShowHelp(false)}>✖</button>
                            <h2>📜 Instrucciones</h2>
                            <ul>
                                <li><strong>Objetivo:</strong> Encuentra las palabras ocultas antes de que se agote el tiempo.</li>
                                <li>Tienes <strong>5 segundos</strong> al inicio para memorizar la ubicación de las palabras.</li>
                                <li>Haz clic en una carta (o usa los números 1-9) para revelarla.</li>
                                <li>Si aciertas, la carta se queda visible.</li>
                                <li>Si fallas, la carta se marcará en <strong>rojo</strong> y tendrás que esperar {errorWaitTime} segundos.</li>
                            </ul>
                            <h3 className="mt-4 mb-2 text-lg font-bold text-blue-400 border-b border-gray-700 pb-1">⚙️ Configuración (Dado 🎲)</h3>
                            <ul>
                                <li><strong>Izquierda (Desactivado):</strong> Modo Fijo. Se genera un orden aleatorio al inicio, pero este orden se mantiene durante toda la partida. Si fallas, sigues buscando la misma palabra.</li>
                                <li><strong>Derecha (Activado):</strong> Modo Aleatorio. El orden de las palabras se reorganiza cada vez que cometes un error, cambiando la siguiente palabra a encontrar.</li>
                            </ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div >
    );
};

export default JuegoMemoria;
