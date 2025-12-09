import { useState, useEffect, useCallback, useRef } from 'react';

export const useRoscoGame = (rawData) => {
    // --- ESTADO ---
    const [players, setPlayers] = useState([]);
    const [activePlayerIndex, setActivePlayerIndex] = useState(0);
    const [gameState, setGameState] = useState('config'); // 'config', 'playing', 'finished'
    const [feedback, setFeedback] = useState(null);
    const [animState, setAnimState] = useState('none'); // 'none', 'pasapalabra-out', 'pasapalabra-in', 'turn-change'
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    
    // Semáforo para evitar dobles acciones
    const isProcessing = useRef(false);
    
    // --- CONFIGURACIÓN ---
    const [config, setConfig] = useState({
        numPlayers: 1,
        questionCount: 26,
        useTimer: false,
        timeLimit: 150,
        player1: { name: 'Jugador 1', icon: '🦊' },
        player2: { name: 'Jugador 2', icon: '🐼' }
    });

    const timerRef = useRef(null);

    // Reiniciar al cargar nuevos datos
    useEffect(() => {
        if (rawData) setGameState('config');
        isProcessing.current = false;
        setAnimState('none');
        setShowExitConfirm(false);
    }, [rawData]);

    // --- TEMPORIZADOR ---
    useEffect(() => {
        if (gameState === 'playing' && config.useTimer && !showExitConfirm) {
            timerRef.current = setInterval(() => {
                setPlayers(prevPlayers => {
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
    }, [gameState, activePlayerIndex, config.useTimer, showExitConfirm]);

    // --- HELPER: NORMALIZAR TEXTO ---
    const cleanText = (text) => {
        if (!text) return "";
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
        setAnimState('none');
        setShowExitConfirm(false);

        const newPlayers = [];
        const grouped = rawData.reduce((acc, curr) => {
            if (!acc[curr.letra]) acc[curr.letra] = [];
            acc[curr.letra].push(curr);
            return acc;
        }, {});

        for (let i = 0; i < gameConfig.numPlayers; i++) {
            let selectedQuestions = [];
            
            // CORRECCIÓN: Usar localeCompare para ordenar correctamente la Ñ en español
            const availableLetters = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'es'));
            
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
        if (isProcessing.current || showExitConfirm) return;
        isProcessing.current = true;

        const currentPlayer = players[activePlayerIndex];
        const currentQ = currentPlayer.questions[currentPlayer.currentParams.index];
        
        // Calculamos la corrección ANTES de actualizar el estado
        const isAnswerCorrect = cleanText(userAnswer) === cleanText(currentQ.solucion);
        
        setPlayers(prev => {
            const newPlayers = prev.map(p => ({
                ...p,
                letterStatus: { ...p.letterStatus }, 
                currentParams: { ...p.currentParams }
            }));

            const p = newPlayers[activePlayerIndex];
            const q = p.questions[p.currentParams.index];
            
            p.letterStatus[q.letra] = isAnswerCorrect ? 'correct' : 'wrong';
            if (isAnswerCorrect) p.score += 1;
            
            return newPlayers;
        });

        if (isAnswerCorrect) {
            // Comparación laxa para el feedback (si solo fallan acentos/mayúsculas es verde)
            if (userAnswer.trim().toLowerCase() === currentQ.solucion.trim().toLowerCase()) {
                setFeedback({ type: 'success', text: '¡Correcto!' });
                setTimeout(() => finishCorrectAnswerAnim(), 1000);
            } else {
                setFeedback({ type: 'success', text: `¡Bien! Se escribe: ${currentQ.solucion}` });
                setTimeout(() => finishCorrectAnswerAnim(), 2000);
            }
        } else {
            setFeedback({ type: 'error', text: `¡Era "${currentQ.solucion}"!` });
            setTimeout(() => {
                handleTurnChange(); 
            }, 1500);
        }
    }, [players, activePlayerIndex, showExitConfirm]);

    // Helper animación acierto
    const finishCorrectAnswerAnim = () => {
        setFeedback(null);
        setAnimState('pasapalabra-in');
        advancePlayerIndex(activePlayerIndex); 
        setTimeout(() => {
             setAnimState('none');
             isProcessing.current = false; 
        }, 400); 
    };

    // --- PASAPALABRA ---
    const pasapalabra = useCallback(() => {
        if (isProcessing.current || showExitConfirm) return;
        isProcessing.current = true;

        setFeedback({ type: 'info', text: '¡Pasapalabra!' });
        setAnimState('pasapalabra-out');
        
        setTimeout(() => {
            handleTurnChange();
        }, 400);
    }, [activePlayerIndex, showExitConfirm]);

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
        let playerChanged = false;
        
        setPlayers(prevPlayers => {
            const newPlayers = prevPlayers.map(p => ({
                ...p,
                currentParams: { ...p.currentParams }
            }));
            
            const allFinished = newPlayers.every(p => p.finished || (config.useTimer && p.timeLeft <= 0));
            if (allFinished) {
                setGameState('finished');
                isProcessing.current = false;
                setAnimState('none');
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
                    playerChanged = true;
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

        if (playerChanged) {
            setAnimState('turn-change');
        } else {
            setAnimState('pasapalabra-in');
        }

        setTimeout(() => {
            setAnimState('none');
            isProcessing.current = false;
        }, 600);
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

    // --- GESTIÓN DE SALIDA ---
    const requestExit = () => setShowExitConfirm(true);
    const cancelExit = () => setShowExitConfirm(false);
    
    const confirmExit = () => {
        setShowExitConfirm(false);
        setGameState('config');
        setAnimState('none');
        isProcessing.current = false;
    };

    const restartGame = () => {
        setGameState('config');
        setAnimState('none');
        isProcessing.current = false;
    };

    const activePlayer = players[activePlayerIndex];
    const currentQuestion = activePlayer ? activePlayer.questions[activePlayer.currentParams.index] : null;

    return {
        gameState, players, activePlayer, activePlayerIndex, currentQuestion, feedback,
        checkAnswer, pasapalabra, restartGame, startGame, config, setConfig,
        maxQuestions: rawData ? Object.keys(rawData.reduce((acc,v)=>{acc[v.letra]=1;return acc},{})).length : 26,
        animState,
        showExitConfirm, requestExit, cancelExit, confirmExit
    };
};