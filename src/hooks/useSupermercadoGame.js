// src/hooks/useSupermercadoGame.js
import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti'; // 1. Importamos la librería

const TOTAL_TEST_QUESTIONS = 5;

export const useSupermercadoGame = ({ generarNuevaMision, withTimer = false }) => {
    const [isTestMode, setIsTestMode] = useState(false);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [mision, setMision] = useState({ texto: '', solucion: 0 });
    const [respuesta, setRespuesta] = useState('');
    const [feedback, setFeedback] = useState({ texto: '', clase: '' });
    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // 2. Creamos la referencia
    const containerRef = useRef(null);

    // Genera una misión para el modo práctica
    const startPracticeMission = useCallback(() => {
        setFeedback({ texto: '', clase: '' });
        setRespuesta('');
        setMision(generarNuevaMision());
    }, [generarNuevaMision]);

    useEffect(() => {
        startPracticeMission();
    }, [startPracticeMission]);

    // Inicia el modo Test
    const startTest = () => {
        const questions = Array.from({ length: TOTAL_TEST_QUESTIONS }, generarNuevaMision);
        setTestQuestions(questions);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setMision(questions[0]);
        setRespuesta('');
        setFeedback({ texto: '', clase: '' });
        setShowResults(false);
        setScore(0);
        setIsTestMode(true);
        // Siempre registramos el tiempo en modo test para que la puntuación
        // pueda tener en cuenta la velocidad (aunque no se muestre el cronómetro).
        setStartTime(Date.now());
        setElapsedTime(0);
    };

    // Lógica del temporizador (siempre activo en test para puntuar por tiempo)
    useEffect(() => {
        let timer;
        if (isTestMode && !showResults) {
            timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTestMode, showResults, startTime]);

    // Calcula la puntuación final. El tiempo SIEMPRE cuenta: dos alumnos con
    // la misma nota pueden tener puntuaciones distintas según su rapidez.
    const calculateScore = (correctCount, time) => {
        const baseScore = correctCount * 200; // 200 puntos por respuesta correcta
        if (correctCount === 0) return 0;
        // Bonus decreciente por tiempo: hasta ~20s cae 10 pt/s, luego suaviza.
        // Aun tras 60s queda algo de bonus para diferenciar a los que acaban.
        const fastBonus = Math.max(0, 200 - time * 10);        // 0..200 pt
        const longBonus = Math.max(0, 100 - Math.floor(time / 2)); // 0..100 pt
        const perCorrect = correctCount / TOTAL_TEST_QUESTIONS; // escala con aciertos
        const timeBonus = Math.round((fastBonus + longBonus) * perCorrect);
        return baseScore + timeBonus;
    };

    // Pasa a la siguiente pregunta del test
    const handleNextQuestion = () => {
        const newAnswers = [...userAnswers, respuesta];
        setUserAnswers(newAnswers);
        setRespuesta('');

        if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setMision(testQuestions[currentQuestionIndex + 1]);
        } else {
            // Fin del test
            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            setElapsedTime(finalTime);
            
            let correctCount = 0;
            testQuestions.forEach((q, index) => {
                const userAns = parseFloat(String(newAnswers[index]).replace(',', '.'));
                if (Math.abs(userAns - q.solucion) < 0.001) {
                    correctCount++;
                }
            });

            setScore(calculateScore(correctCount, finalTime));
            setShowResults(true);
        }
    };

    // Vuelve al modo práctica
    const exitTestMode = () => {
        setIsTestMode(false);
        setShowResults(false);
        startPracticeMission();
    };

    // Comprueba la respuesta en modo práctica
    const checkPracticeAnswer = () => {
        const respuestaNum = parseFloat(respuesta.replace(',', '.'));
        if (isNaN(respuestaNum)) {
             setFeedback({ texto: "Por favor, escribe un número.", clase: 'incorrecta' });
            return;
        }
        if (Math.abs(respuestaNum - mision.solucion) < 0.001) {
            setFeedback({ texto: "¡Correcto! ¡Muy bien!", clase: 'correcta' });
            
            // 3. Lógica del confetti
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;

                confetti({
                    origin: { x, y },
                    particleCount: 150,
                    spread: 70,
                    startVelocity: 30,
                    zIndex: 1000
                });
            }

        } else {
            setFeedback({ texto: `Casi... La respuesta correcta era ${mision.solucion.toFixed(2).replace('.', ',')}€. ¡Inténtalo de nuevo!`, clase: 'incorrecta' });
        }
    };

    return {
        isTestMode,
        startTest,
        exitTestMode,
        currentQuestionIndex,
        TOTAL_TEST_QUESTIONS,
        mision,
        respuesta,
        setRespuesta,
        feedback,
        elapsedTime,
        showResults,
        score,
        testQuestions,
        userAnswers,
        handleNextQuestion,
        checkPracticeAnswer,
        startPracticeMission,
        containerRef // 4. Devolvemos la referencia
    };
};