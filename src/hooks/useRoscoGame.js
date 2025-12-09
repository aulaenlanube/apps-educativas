import { useState, useEffect, useCallback, useRef } from 'react';

export const useRoscoGame = (rawData) => {
    // --- ESTADO ---
    const [players, setPlayers] = useState([]);
    const [activePlayerIndex, setActivePlayerIndex] = useState(0);
    const [gameState, setGameState] = useState('config'); // 'config', 'playing', 'finished'
    const [feedback, setFeedback] = useState(null);
    
    // Semáforo para evitar dobles clics
    const isProcessing = useRef(false);
    
    // --- CONFIGURACIÓN ---
    const [config, setConfig] = useState({
        numPlayers: 1,
        questionCount: 26,
        useTimer: false,
        timeLimit: 150,
        player1: { name: 'Jugador 1', icon: '🦊' },
        player2: { name: 'Jugador 2', icon: 'panda' }
    });

    const timerRef = useRef(null);

    // Reiniciar al cargar nuevos datos
    useEffect(() => {
        if (rawData) setGameState('config');
        isProcessing.current = false;
    }, [rawData]);

    // --- TEMPORIZADOR ---
    useEffect(() => {
        if (gameState === 'playing' && config.useTimer) {
            timerRef.current = setInterval(() => {
                setPlayers(prevPlayers => {
                    // Copia PROFUNDA necesaria
                    const newPlayers = prevPlayers.map(p => ({
                        ...p,
                        currentParams: { ...p.currentParams } 
                    }));
                    
                    const activeP = newPlayers[activePlayerIndex];
                    
                    if (!activeP.finished && activeP.timeLeft > 0) {
                        activeP.timeLeft -= 1;
                    } 
                    
                    if (activeP.timeLeft === 0 && !activeP.finished) {
                        activeP.finished = true;
                        setTimeout(() => handleTurnChange(), 0);
                    }
                    
                    return newPlayers;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [gameState, activePlayerIndex, config.useTimer]);

    // --- HELPER: NORMALIZAR TEXTO ---
    // Esto quita acentos y pone todo en minúsculas para la COMPARACIÓN
    const cleanText = (text) => {
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
            .trim();
    };

    // --- INICIAR JUEGO ---
    const startGame = (gameConfig) => {
        if (!rawData || rawData.length === 0) return;
        setConfig(gameConfig);
        isProcessing.current = false;

        const newPlayers = [];
        const grouped = rawData.reduce((acc, curr) => {
            if (!acc[curr.letra]) acc[curr.letra] = [];
            acc[curr.letra].push(curr);
            return acc;
        }, {});

        for (let i = 0; i < gameConfig.numPlayers; i++) {
            let selectedQuestions = [];
            const availableLetters = Object.keys(grouped).sort();
            
            availableLetters.forEach(letra => {
                const options = grouped[letra];
                const randIndex = Math.floor(Math.random() * options.length);
                selectedQuestions.push(options[randIndex]);
            });

            if (gameConfig.questionCount < selectedQuestions.length) {
                const indices = new Set();
                while(indices.size < gameConfig.questionCount) {
                    indices.add(Math.floor(Math.random() * selectedQuestions.length));
                }
                selectedQuestions = selectedQuestions.filter((_, idx) => indices.has(idx));
            }

            const initialStatus = {};
            selectedQuestions.forEach(q => initialStatus[q.letra] = 'pending');

            const pInfo = i === 0 ? gameConfig.player1 : gameConfig.player2;
            
            newPlayers.push({
                id: i,
                name: pInfo.name,
                icon: pInfo.icon,
                score: 0,
                questions: selectedQuestions,
                letterStatus: initialStatus,
                currentParams: { index: 0 },
                timeLeft: gameConfig.useTimer ? gameConfig.timeLimit : null,
                finished: false
            });
        }

        setPlayers(newPlayers);
        setActivePlayerIndex(0);
        setFeedback(null);
        setGameState('playing');
    };

    // --- COMPROBAR RESPUESTA ---
    const checkAnswer = useCallback((userAnswer) => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        let isAnswerCorrect = false;
        
        setPlayers(prev => {
            const newPlayers = prev.map(p => ({
                ...p,
                letterStatus: { ...p.letterStatus }, 
                currentParams: { ...p.currentParams }
            }));

            const p = newPlayers[activePlayerIndex];
            const currentQ = p.questions[p.currentParams.index];
            
            // 1. Comparamos usando la versión "limpia" (sin acentos, minúsculas)
            // Esto asegura que "avion" == "avión" sea TRUE
            isAnswerCorrect = cleanText(userAnswer) === cleanText(currentQ.solucion);
            
            p.letterStatus[currentQ.letra] = isAnswerCorrect ? 'correct' : 'wrong';
            if (isAnswerCorrect) p.score += 1;
            
            return newPlayers;
        });

        // 2. Gestionamos el Feedback Educativo
        if (isAnswerCorrect) {
            const currentPlayer = players[activePlayerIndex];
            const currentQ = currentPlayer.questions[currentPlayer.currentParams.index];
            
            // Verificamos si lo escribió EXACTO (teniendo en cuenta acentos/mayúsculas del original)
            // Si el original es "árbol" y escribió "arbol", entra aquí.
            if (userAnswer.trim() !== currentQ.solucion.trim()) {
                // Es correcto (gana punto), pero mostramos la forma perfecta
                setFeedback({ type: 'success', text: `¡Bien! Se escribe: ${currentQ.solucion}` });
                // Damos un poco más de tiempo (2s) para que lea la corrección
                setTimeout(() => {
                    setFeedback(null);
                    advancePlayerIndex(activePlayerIndex); 
                    isProcessing.current = false; 
                }, 2000);

            } else {
                // Perfecto
                setFeedback({ type: 'success', text: '¡Correcto!' });
                setTimeout(() => {
                    setFeedback(null);
                    advancePlayerIndex(activePlayerIndex); 
                    isProcessing.current = false; 
                }, 1000);
            }

        } else {
            // Fallo
            const currentPlayer = players[activePlayerIndex];
            const currentQ = currentPlayer.questions[currentPlayer.currentParams.index];
            
            setFeedback({ type: 'error', text: `¡Era "${currentQ.solucion}"!` });
            
            setTimeout(() => {
                handleTurnChange(); 
                isProcessing.current = false; 
            }, 1500);
        }

    }, [players, activePlayerIndex]);

    // --- PASAPALABRA ---
    const pasapalabra = useCallback(() => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        setFeedback({ type: 'info', text: '¡Pasapalabra!' });
        
        setTimeout(() => {
            handleTurnChange();
            isProcessing.current = false; 
        }, 1000);
    }, [activePlayerIndex]);

    // --- AVANZAR ÍNDICE ---
    const advancePlayerIndex = (playerIdx) => {
        setPlayers(prev => {
            const newPlayers = prev.map(p => ({
                ...p,
                currentParams: { ...p.currentParams }
            }));
            
            const p = newPlayers[playerIdx];
            advancePlayerIndexInternal(p);
            
            if (p.finished) {
                 setTimeout(() => handleTurnChange(), 0);
            }
            return newPlayers;
        });
    };

    // --- CAMBIAR DE TURNO ---
    const handleTurnChange = () => {
        setFeedback(null);
        
        setPlayers(prevPlayers => {
            const newPlayers = prevPlayers.map(p => ({
                ...p,
                currentParams: { ...p.currentParams }
            }));
            
            const allFinished = newPlayers.every(p => p.finished || (config.useTimer && p.timeLeft <= 0));
            if (allFinished) {
                setGameState('finished');
                return newPlayers;
            }

            const currentP = newPlayers[activePlayerIndex];
            const nextIdx = (activePlayerIndex + 1) % newPlayers.length;
            const nextP = newPlayers[nextIdx];

            if (!currentP.finished) {
                advancePlayerIndexInternal(currentP);
            }

            if (newPlayers.length > 1) {
                if (!nextP.finished && (!config.useTimer || nextP.timeLeft > 0)) {
                    setActivePlayerIndex(nextIdx);
                } else {
                    if (!currentP.finished && (!config.useTimer || currentP.timeLeft > 0)) {
                        // Sigo yo
                    } else {
                        setGameState('finished');
                    }
                }
            } else {
                if (currentP.finished || (config.useTimer && currentP.timeLeft <= 0)) {
                    setGameState('finished');
                }
            }

            return newPlayers;
        });
    };

    const advancePlayerIndexInternal = (p) => {
        let nextIndex = p.currentParams.index + 1;
        let loopCount = 0;
        let foundPending = false;

        while (loopCount < p.questions.length) {
            if (nextIndex >= p.questions.length) nextIndex = 0;
            const nextLetter = p.questions[nextIndex].letra;
            
            if (p.letterStatus[nextLetter] === 'pending') {
                p.currentParams.index = nextIndex;
                foundPending = true;
                break;
            }
            nextIndex++;
            loopCount++;
        }

        if (!foundPending) {
            p.finished = true;
        }
    };

    const restartGame = () => {
        setGameState('config');
    };

    const activePlayer = players[activePlayerIndex];
    const currentQuestion = activePlayer ? activePlayer.questions[activePlayer.currentParams.index] : null;

    return {
        gameState,
        players,
        activePlayer,
        activePlayerIndex,
        currentQuestion,
        feedback,
        checkAnswer,
        pasapalabra,
        restartGame,
        startGame,
        config,
        setConfig,
        maxQuestions: rawData ? Object.keys(rawData.reduce((acc,v)=>{acc[v.letra]=1;return acc},{})).length : 26
    };
};