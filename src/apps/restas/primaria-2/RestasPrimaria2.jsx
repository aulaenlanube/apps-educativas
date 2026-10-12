import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import { BorrowSubtractionBoard } from '../../_shared/UniversalSubtractionBoard';

const TOTAL_TEST_QUESTIONS = 5;

const RestasPrimaria2 = ({ onGameComplete } = {}) => {
  const [operands, setOperands] = useState({ num1: 0, num2: 0 });
  const [numDigits, setNumDigits] = useState(2);
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Test mode ---
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const generateNewProblem = useCallback(() => {
    const digits = Math.floor(Math.random() * 2) + 2;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits);
    let n1, n2;
    do {
      n1 = Math.floor(Math.random() * (max - min)) + min;
      n2 = Math.floor(Math.random() * n1);
    } while (n1 === n2);

    setOperands({ num1: n1, num2: n2 });
    setNumDigits(digits);
    setResultSlots(new Array(digits).fill(''));
    setCarrySlots(new Array(digits).fill(''));
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'result', index: digits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Test mode helpers ---
  const generateOperandsPair = useCallback(() => {
    const digits = Math.floor(Math.random() * 2) + 2;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits);
    let n1, n2;
    do {
      n1 = Math.floor(Math.random() * (max - min)) + min;
      n2 = Math.floor(Math.random() * n1);
    } while (n1 === n2);
    return [n1.toString(), n2.toString()];
  }, []);

  const prepareTestQuestion = (pair) => {
    const [a, b] = pair;
    const n1 = parseInt(a); const n2 = parseInt(b);
    const digits = Math.max(a.length, b.length);
    setOperands({ num1: n1, num2: n2 });
    setNumDigits(digits);
    setResultSlots(new Array(digits).fill(''));
    setCarrySlots(new Array(digits).fill(''));
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'result', index: digits - 1 });
  };

  const startTest = () => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, generateOperandsPair);
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setShowResults(false);
    setIsTestMode(true);
    setShowHelp(false);
    prepareTestQuestion(qs[0]);
  };

  const nextTestQuestion = () => {
    const userVal = parseInt(resultSlots.join('') || '0', 10).toString();
    const newAnswers = [...userAnswers, userVal];
    setUserAnswers(newAnswers);
    if (currentQuestionIndex < TOTAL_TEST_QUESTIONS - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      prepareTestQuestion(testQuestions[nextIdx]);
    } else {
      let hits = 0;
      testQuestions.forEach((q, i) => {
        const expected = (parseInt(q[0]) - parseInt(q[1])).toString();
        if (newAnswers[i] === expected) hits++;
      });
      setScore(hits * 200);
      setShowResults(true);
    }
  };

  const exitTest = () => { setIsTestMode(false); setShowResults(false); generateNewProblem(); };

  const strNum1 = operands.num1.toString().padStart(numDigits, '0');
  const strNum2 = operands.num2.toString().padStart(numDigits, '0');
  const correctResult = (operands.num1 - operands.num2).toString().padStart(numDigits, '0');

  const expectedCarries = useMemo(() => {
    const carries = new Array(numDigits).fill(0);
    let currentCarry = 0;
    for (let i = numDigits - 1; i >= 0; i--) {
      const val1 = parseInt(strNum1[i]);
      const val2 = parseInt(strNum2[i]) + currentCarry;
      if (val1 < val2) { carries[i] = 1; currentCarry = 1; }
      else { carries[i] = 0; currentCarry = 0; }
    }
    return carries;
  }, [numDigits, strNum1, strNum2]);

  const getVisualSubtrahendDigit = (index) => {
    const baseVal = parseInt(strNum2[index]);
    const rightCarryIndex = index + 1;
    const userHasCarryFromRight = rightCarryIndex < numDigits && carrySlots[rightCarryIndex] === '1';
    if (!showHelp) return baseVal;
    return userHasCarryFromRight ? (baseVal + 1) % 10 : baseVal;
  };

  // Coloca un número en una casilla (la activa al pulsar el teclado, o la de
  // destino al arrastrar). Misma lógica que antes tenía handlePaletteClick.
  const applyDigit = (slot, val) => {
    const strVal = val.toString();

    if (slot.type === 'result') {
      const newResults = [...resultSlots];
      newResults[slot.index] = strVal;
      setResultSlots(newResults);

      if (strVal === correctResult[slot.index] && showHelp) {
        const newCarries = [...carrySlots];
        newCarries[slot.index] = expectedCarries[slot.index] === 1 ? '1' : '0';
        setCarrySlots(newCarries);
      }

      const nextIdx = slot.index - 1;
      if (nextIdx >= 0) setActiveSlot({ type: 'result', index: nextIdx });
      else setActiveSlot(null);

    } else if (slot.type === 'carry') {
      const newCarries = [...carrySlots];
      newCarries[slot.index] = strVal === '0' ? '' : strVal;
      setCarrySlots(newCarries);
      setActiveSlot(null);
    }
  };

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    applyDigit(activeSlot, val);
  };

  const checkAnswer = () => {
    const userStr = resultSlots.map(s => s || '0').join('');
    const userNum = parseInt(userStr);
    const correctNum = operands.num1 - operands.num2;
    let isCorrect = userNum === correctNum;
    let allCarriesCorrect = true;

    if (showHelp) {
      allCarriesCorrect = expectedCarries.every((val, i) => {
        if (i === 0) return true;
        const userVal = carrySlots[i] === '1' ? 1 : 0;
        return val === userVal;
      });
    }

    if (isCorrect) {
      if (!showHelp || allCarriesCorrect) {
        setFeedback({ text: '¡Perfecto! ¡Resta correcta! ✅', cls: 'feedback-correct' });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setActiveSlot(null);
      } else {
        setFeedback({ text: 'El resultado es correcto, pero revisa las llevadas 🔴', cls: 'feedback-incorrect' });
      }
    } else {
      setFeedback({ text: '¡Ups! Revisa los números en rojo ❌', cls: 'feedback-incorrect' });
    }
  };

  // --- Tablero (solo presentación): estado de cada casilla, igual que antes ---
  const resultState = (i) => {
    const isResultFilled = resultSlots[i] !== '';
    const isResultCorrect = resultSlots[i] === correctResult[i];
    return feedback.text && isResultFilled
      ? (isResultCorrect ? 'correct' : 'incorrect')
      : '';
  };
  const carryState = (i) => {
    const isCarryFilled = carrySlots[i] === '1';
    const isCarryCorrect = expectedCarries[i] === 1;
    return (feedback.text && showHelp && i !== 0)
      ? (isCarryFilled === isCarryCorrect ? (isCarryFilled ? 'correct' : '') : 'incorrect')
      : '';
  };
  const bottomDigits = Array.from({ length: numDigits }, (_, i) => {
    const value = getVisualSubtrahendDigit(i);
    return { value, modified: value !== parseInt(strNum2[i]) };
  });

  return (
    <MathOperationLayout
      title="Resta como en el cole (2º)"
      emoji="📝"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nueva resta"
      toggleLabel={!isTestMode ? "Ayuda con llevadas" : undefined}
      toggleValue={showHelp}
      onToggleChange={setShowHelp}
      onPaletteClick={handlePaletteClick}
      padLayout="side"
      onGameComplete={onGameComplete}
      isTestMode={isTestMode}
      setTestMode={setIsTestMode}
      testState={{ currentQuestionIndex, totalQuestions: TOTAL_TEST_QUESTIONS, showResults, score, testQuestions, userAnswers }}
      actions={{
        startPractice: () => { setIsTestMode(false); setShowResults(false); generateNewProblem(); },
        startTest,
        nextQuestion: nextTestQuestion,
        exitTest,
      }}
      calculateExpected={(q) => (parseInt(q[0]) - parseInt(q[1])).toString()}
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Completa la resta colocando la cifra correcta en cada casilla vacía.</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla para seleccionarla.</li>
            <li>Después toca un número del teclado para colocarlo (o arrástralo hasta la casilla).</li>
            <li>Con la ayuda activada, cuando la cifra de arriba es menor aparece la llevada: la burbuja con el 1 y el <strong>+1</strong> en la cifra de abajo de la siguiente columna.</li>
            <li>Pulsa <strong>Comprobar</strong> para ver qué casillas están bien (verde) o mal (rojo).</li>
          </ul>
        </>
      }
    >
      <BorrowSubtractionBoard
        top={strNum1}
        bottom={bottomDigits}
        intDigits={numDigits}
        resultSlots={resultSlots}
        carrySlots={carrySlots}
        resultState={resultState}
        carryState={carryState}
        activeSlot={activeSlot}
        onSelect={setActiveSlot}
        onDropDigit={applyDigit}
        showHelp={showHelp}
      />
    </MathOperationLayout>
  );
};

export default RestasPrimaria2;
