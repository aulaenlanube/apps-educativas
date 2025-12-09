import { useState, useEffect, useCallback } from 'react';

export const useRoscoGame = (rawData) => {
    // rawData contiene las 130 preguntas. 
    // questions contendrá solo las seleccionadas para esta partida.
    const [questions, setQuestions] = useState([]); 
    
    const [currentParams, setCurrentParams] = useState({ index: 0, letterStatus: {} }); 
    const [gameState, setGameState] = useState('config'); // 'config', 'loading', 'playing', 'finished'
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [configCount, setConfigCount] = useState(26); // Por defecto el rosco completo

    // Cuando llega la data, ponemos el juego en modo configuración
    useEffect(() => {
        if (rawData && rawData.length > 0) {
            setGameState('config');
        } else if (rawData && rawData.length === 0) {
             // Manejo de error si quieres
        }
    }, [rawData]);

    // Función auxiliar para normalizar texto
    const normalizeText = (text) => {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    };

    // FUNCIÓN PRINCIPAL: Iniciar partida con la configuración deseada
    const startGame = (count) => {
        if (!rawData || rawData.length === 0) return;

        // 1. Agrupar preguntas por letra
        const grouped = rawData.reduce((acc, curr) => {
            if (!acc[curr.letra]) acc[curr.letra] = [];
            acc[curr.letra].push(curr);
            return acc;
        }, {});

        // 2. Seleccionar UNA pregunta aleatoria por cada letra disponible
        let selectedQuestions = [];
        const availableLetters = Object.keys(grouped).sort(); // A, B, C...

        availableLetters.forEach(letra => {
            const options = grouped[letra];
            const randomOption = options[Math.floor(Math.random() * options.length)];
            selectedQuestions.push(randomOption);
        });

        // 3. Filtrar según la cantidad (count)
        // Si el usuario quiere menos de 26, elegimos 'count' letras aleatorias del set seleccionado
        // Si quiere completo (o más de las que hay), dejamos todas.
        if (count < selectedQuestions.length) {
            // Barajar el array de letras seleccionadas para coger un subconjunto aleatorio
            // O mantener orden alfabético pero saltando letras.
            // Para "Rosco", visualmente queda mejor A-Z, así que elegimos N letras aleatorias pero las ordenamos.
            
            // Índices aleatorios
            const indices = new Set();
            while(indices.size < count) {
                indices.add(Math.floor(Math.random() * selectedQuestions.length));
            }
            
            // Filtramos y mantenemos el orden original (alfabético)
            selectedQuestions = selectedQuestions.filter((_, idx) => indices.has(idx));
        }

        // 4. Inicializar estado de juego
        setQuestions(selectedQuestions);
        const initialStatus = {};
        selectedQuestions.forEach(q => initialStatus[q.letra] = 'pending');
        
        setCurrentParams({ index: 0, letterStatus: initialStatus });
        setScore(0);
        setFeedback(null);
        setGameState('playing');
    };

    const checkAnswer = useCallback((userAnswer) => {
        const currentQ = questions[currentParams.index];
        const isCorrect = normalizeText(userAnswer) === normalizeText(currentQ.solucion);
        
        const newStatus = { ...currentParams.letterStatus };
        newStatus[currentQ.letra] = isCorrect ? 'correct' : 'wrong';

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ type: 'success', text: '¡Correcto!' });
        } else {
            setFeedback({ type: 'error', text: `¡Vaya! Era "${currentQ.solucion}"` });
        }

        moveToNextQuestion(newStatus, currentParams.index);
    }, [questions, currentParams]);

    const pasapalabra = useCallback(() => {
        setFeedback({ type: 'info', text: '¡Pasapalabra!' });
        moveToNextQuestion(currentParams.letterStatus, currentParams.index);
    }, [questions, currentParams]);

    const moveToNextQuestion = (currentStatus, currentIndex) => {
        let nextIndex = currentIndex + 1;
        let loopCount = 0;

        while (loopCount < questions.length) {
            if (nextIndex >= questions.length) nextIndex = 0;
            
            const nextLetter = questions[nextIndex].letra;
            if (currentStatus[nextLetter] === 'pending') {
                setTimeout(() => {
                    setCurrentParams({ index: nextIndex, letterStatus: currentStatus });
                    setFeedback(null);
                }, 1000); 
                return;
            }
            nextIndex++;
            loopCount++;
        }

        setCurrentParams({ index: currentIndex, letterStatus: currentStatus });
        setGameState('finished');
    };

    const restartGame = () => {
        // Volvemos a la pantalla de configuración para elegir nuevo número si se quiere
        setGameState('config');
        setFeedback(null);
    };

    return {
        gameState,
        currentQuestion: questions[currentParams.index],
        letterStatus: currentParams.letterStatus,
        score,
        total: questions.length,
        feedback,
        checkAnswer,
        pasapalabra,
        restartGame,
        startGame, // Exponemos la función para iniciar desde la UI
        configCount, 
        setConfigCount,
        maxQuestions: rawData ? Object.keys(rawData.reduce((acc,v)=>{acc[v.letra]=1;return acc},{})).length : 26
    };
};