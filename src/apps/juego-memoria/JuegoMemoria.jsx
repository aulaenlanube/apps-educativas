// src/apps/juego-memoria/JuegoMemoria.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import './JuegoMemoria.css';

const GAME_TIME = 60; // 1 minute
const MEMORIZE_TIME = 5; // 5 seconds
const GRID_SIZE = 9;

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

    const timerRef = useRef(null);

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

            const validCategories = categories.filter(c => Array.isArray(data[c]) && data[c].length >= GRID_SIZE);

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

            if (selectedWords.length < GRID_SIZE) {
                setErrorMsg(`No hay suficientes palabras.`);
                return;
            }

            setCategory(selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace(/-/g, ' ').replace(/_/g, ' '));

            const shuffled = selectedWords.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, GRID_SIZE);
            setWords(selected);

            const order = Array.from({ length: GRID_SIZE }, (_, i) => i).sort(() => 0.5 - Math.random());
            setTargetOrder(order);

            // Reset Game Logic
            setCorrectIndices(new Set());
            setRevealedIndex(null);
            setCurrentIndex(0);
            setMemorizeTimeLeft(MEMORIZE_TIME);
            setTimeLeft(GAME_TIME);

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

                if (newCorrect.size >= GRID_SIZE) {
                    setGameState('won');
                    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 }, zIndex: 3000 });
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 800);
        } else {
            // Incorrect
            setErrorIndex(index);
            setErrorCountdown(2.0); // Start countdown at 2.0s

            // Update countdown every 100ms
            const interval = setInterval(() => {
                setErrorCountdown(prev => {
                    const next = prev - 0.1;
                    return next < 0 ? 0 : parseFloat(next.toFixed(1));
                });
            }, 100);

            // Wait 2 seconds (user requested: stay red for 2s with countdown)
            setTimeout(() => {
                clearInterval(interval);
                setRevealedIndex(null);
                setErrorIndex(null);
                setErrorCountdown(null);

                // Reset progress (penalty)
                setCorrectIndices(new Set());
                setCurrentIndex(0);
            }, 2000);
        }
    };

    // Keypad Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            const key = parseInt(e.key);
            if (!isNaN(key) && key >= 1 && key <= GRID_SIZE) {
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

            <div className="game-status-bar">
                <div className="timer-box">
                    <span className="timer-icon">⏱️</span>
                    <span className="timer-val">{gameState === 'memorize' ? memorizeTimeLeft : Number(timeLeft).toFixed(1)}s</span>
                </div>
                <div className="phase-indicator">
                    {gameState === 'memorize' && <span className="blink">🧠 ¡Memoriza las posiciones!</span>}
                    {gameState === 'playing' && (
                        <div className="target-display">
                            <span>Encuentra: </span>
                            <span className="target-word-highlight">{targetWord}</span>
                        </div>
                    )}
                    {gameState === 'won' && "🎉 ¡Completado! (Pulsa ✨ para jugar otra vez)"}
                    {gameState === 'lost' && "❌ Tiempo agotado"}
                </div>
                <button className="help-btn" onClick={() => setShowHelp(true)} title="Instrucciones">
                    ❓ Ayuda
                </button>
                <button className="restart-btn-new" onClick={handleNewGame} title="Nueva Partida">
                    ✨ Nueva partida
                </button>
            </div>

            <div className={`memory-grid ${gameState === 'memorize' ? 'memorizing' : ''}`}>
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




            {/* Won / Lost Messages (No Modal) */}
            {(gameState === 'won' || gameState === 'lost') && (
                <div className="game-result-overlay">
                    {gameState === 'won' ? (
                        <div className="result-msg win-msg">
                            <h1>¡ENHORABUENA! 🎉</h1>
                            <p>¡Has encontrado todas las palabras!</p>
                        </div>
                    ) : (
                        <div className="result-msg lose-msg">
                            <h1>¡TIEMPO AGOTADO! ⏳</h1>
                            <p>Nota: {Math.round((correctIndices.size / GRID_SIZE) * 10)} / 10</p>
                        </div>
                    )}
                </div>
            )}

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
                                <li>Si fallas, la carta se marcará en <strong>rojo</strong> y tendrás que esperar 2 segundos.</li>
                            </ul>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default JuegoMemoria;
