// src/hooks/useSupermercadoGame.js

import { useState, useEffect, useCallback } from 'react';

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
        if (withTimer) {
            setStartTime(Date.now());
            setElapsedTime(0);
        }
    };

    // Lógica del temporizador
    useEffect(() => {
        let timer;
        if (isTestMode && withTimer && !showResults) {
            timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTestMode, withTimer, showResults, startTime]);

    // Calcula la puntuación final
    const calculateScore = (correctCount, time) => {
        let baseScore = correctCount * 200; // 200 puntos por respuesta correcta
        if (withTimer && correctCount > 0) {
            // Bonus por tiempo: más rápido = más puntos. Máximo 100 puntos de bonus.
            const timeBonus = Math.max(0, 100 - (time * 2));
            baseScore += timeBonus;
        }
        return Math.floor(baseScore);
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
            const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;
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
        startPracticeMission
    };
};