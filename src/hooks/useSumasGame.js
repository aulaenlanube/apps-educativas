// src/hooks/useSumasGame.js
import { useState, useCallback, useEffect } from 'react';

const TOTAL_TEST_QUESTIONS = 5;

export const useSumasGame = ({ withTimer = false } = {}) => {
  // Operandos actuales a mostrar en el tablero
  const [currentOperands, setCurrentOperands] = useState({ num1: 0, num2: 0 });

  // Respuesta actual del usuario (p. ej. "07"); la escribe el tablero React
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Modo y estado de Test
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]); // [{num1,num2}]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Timer (opcional)
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Generación sin llevadas (dos cifras)
  const generateOperandsNoCarry = useCallback(() => {
    let num1, num2;
    do {
      num1 = Math.floor(Math.random() * 90) + 10; // 10..99
      num2 = Math.floor(Math.random() * 90) + 10; // 10..99
    } while (
      (num1 % 10) + (num2 % 10) >= 10 ||
      (Math.floor(num1 / 10) + Math.floor(num2 / 10)) >= 10
    );
    return { num1, num2 };
  }, []);

  // ----- PRÁCTICA -----
  const startPracticeMission = useCallback(() => {
    const { num1, num2 } = generateOperandsNoCarry();
    setCurrentOperands({ num1, num2 });
    setCurrentAnswer('');
  }, [generateOperandsNoCarry]);

  const checkPracticeAnswer = useCallback(() => {
    const { num1, num2 } = currentOperands;
    const correct = (num1 + num2).toString().padStart(2, '0');
    return {
      isCorrect: currentAnswer === correct,
      correct,
      user: currentAnswer || '—'
    };
  }, [currentOperands, currentAnswer]);

  // ----- TEST -----
  const startTest = useCallback(() => {
    const qs = [];
    while (qs.length < TOTAL_TEST_QUESTIONS) qs.push(generateOperandsNoCarry());
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setScore(0);
    setIsTestMode(true);

    const { num1, num2 } = qs[0];
    setCurrentOperands({ num1, num2 });
    setCurrentAnswer('');

    if (withTimer) {
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [generateOperandsNoCarry, withTimer]);

  useEffect(() => {
    if (!isTestMode || !withTimer || showResults) return;
    const t = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [isTestMode, withTimer, showResults, startTime]);

  const handleNextQuestion = useCallback(() => {
    // Guardar respuesta actual y avanzar
    const newAnswers = [...userAnswers, currentAnswer];
    setUserAnswers(newAnswers);

    const isLast = currentQuestionIndex >= TOTAL_TEST_QUESTIONS - 1;

    if (!isLast) {
      const next = currentQuestionIndex + 1;
      setCurrentQuestionIndex(next);
      const { num1, num2 } = testQuestions[next];
      setCurrentOperands({ num1, num2 });
      setCurrentAnswer('');
    } else {
      const finalTime = withTimer ? Math.floor((Date.now() - startTime) / 1000) : 0;

      let correctCount = 0;
      testQuestions.forEach((q, i) => {
        const correct = (q.num1 + q.num2).toString().padStart(2, '0');
        if (newAnswers[i] === correct) correctCount++;
      });

      let base = correctCount * 200;
      if (withTimer && correctCount > 0) {
        const bonus = Math.max(0, 100 - finalTime * 2);
        base += bonus;
      }
      setScore(Math.floor(base));
      setElapsedTime(finalTime);
      setShowResults(true);
    }
  }, [currentAnswer, userAnswers, currentQuestionIndex, testQuestions, withTimer, startTime]);

  const exitTestMode = useCallback(() => {
    setIsTestMode(false);
    setShowResults(false);
    startPracticeMission();
  }, [startPracticeMission]);

  // Arranque en práctica
  useEffect(() => {
    if (!isTestMode) startPracticeMission();
  }, [isTestMode, startPracticeMission]);

  return {
    // modo
    isTestMode, startTest, exitTestMode,

    // práctica
    startPracticeMission, checkPracticeAnswer,

    // test
    TOTAL_TEST_QUESTIONS, currentQuestionIndex, elapsedTime,
    showResults, score, testQuestions, userAnswers, handleNextQuestion,

    // datos actuales
    currentOperands, currentAnswer, setCurrentAnswer,
  };
};
