import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import OperationTestBoard from '../../_shared/OperationTestBoard';
import { BorrowSubtractionBoard } from '../../_shared/UniversalSubtractionBoard';

const TOTAL_TEST_QUESTIONS = 5;

const RestasPrimaria4 = ({ onGameComplete } = {}) => {
  const [operands, setOperands] = useState({ num1: 0, num2: 0 });
  const [structure, setStructure] = useState({ intDigits: 2, decimalPlaces: 1, totalDigits: 3 });
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
  const [testN1, setTestN1] = useState(0);
  const [testN2, setTestN2] = useState(0);
  const [testResultSlots, setTestResultSlots] = useState([]);
  const [testActiveIdx, setTestActiveIdx] = useState(null);

  const generateNewProblem = useCallback(() => {
    const intDigits = Math.floor(Math.random() * 2) + 1;
    const decimalPlaces = 1;
    const totalDigits = intDigits + decimalPlaces;
    const factor = Math.pow(10, decimalPlaces);
    const min = Math.pow(10, totalDigits - 1);
    const max = Math.pow(10, totalDigits);
    let n1Int, n2Int;
    do {
      n1Int = Math.floor(Math.random() * (max - min)) + min;
      n2Int = Math.floor(Math.random() * n1Int);
    } while (n1Int === n2Int);

    setOperands({ num1: n1Int / factor, num2: n2Int / factor });
    setStructure({ intDigits, decimalPlaces, totalDigits });
    setResultSlots(new Array(totalDigits).fill(''));
    setCarrySlots(new Array(totalDigits).fill(''));
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'result', index: totalDigits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Test mode helpers (enteros para simplificar la paleta) ---
  const generarParTest = useCallback(() => {
    const digits = 2 + Math.floor(Math.random() * 2); // 2 o 3 cifras
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
    const diff = parseInt(a) - parseInt(b);
    const len = diff.toString().length;
    setTestN1(parseInt(a)); setTestN2(parseInt(b));
    setTestResultSlots(new Array(len).fill(''));
    setTestActiveIdx(len - 1);
  };

  const startTest = () => {
    const qs = Array.from({ length: TOTAL_TEST_QUESTIONS }, generarParTest);
    setTestQuestions(qs);
    setCurrentQuestionIndex(0);
    setUserAnswers([]); setScore(0); setShowResults(false);
    setIsTestMode(true);
    prepareTestQuestion(qs[0]);
  };

  const nextTestQuestion = () => {
    const userVal = parseInt(testResultSlots.join('') || '0', 10).toString();
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

  const factor = Math.pow(10, structure.decimalPlaces);
  const num1Int = Math.round(operands.num1 * factor);
  const num2Int = Math.round(operands.num2 * factor);
  const strNum1 = num1Int.toString().padStart(structure.totalDigits, '0');
  const strNum2 = num2Int.toString().padStart(structure.totalDigits, '0');
  const correctResultStr = (num1Int - num2Int).toString().padStart(structure.totalDigits, '0');

  const expectedCarries = useMemo(() => {
    const carries = new Array(structure.totalDigits).fill(0);
    let currentCarry = 0;
    for (let i = structure.totalDigits - 1; i >= 0; i--) {
      const val1 = parseInt(strNum1[i]);
      const val2 = parseInt(strNum2[i]) + currentCarry;
      if (val1 < val2) { carries[i] = 1; currentCarry = 1; }
      else { carries[i] = 0; currentCarry = 0; }
    }
    return carries;
  }, [structure.totalDigits, strNum1, strNum2]);

  const getVisualSubtrahendDigit = (index) => {
    const baseVal = parseInt(strNum2[index]);
    const rightCarryIndex = index + 1;
    const userHasCarryFromRight = rightCarryIndex < structure.totalDigits && carrySlots[rightCarryIndex] === '1';
    if (!showHelp) return baseVal;
    return userHasCarryFromRight ? (baseVal + 1) % 10 : baseVal;
  };

  // Examen: coloca un número en la casilla idx (la activa, o la de destino al
  // arrastrar). Misma lógica que antes tenía handlePaletteClick.
  const applyTestDigit = (idx, val) => {
    const strVal = val.toString();
    const next = [...testResultSlots];
    next[idx] = strVal;
    setTestResultSlots(next);
    const nextIdx = idx - 1;
    setTestActiveIdx(nextIdx >= 0 ? nextIdx : null);
  };

  // Práctica: coloca un número en una casilla (la activa al pulsar el teclado,
  // o la de destino al arrastrar). Misma lógica que antes.
  const applyDigit = (slot, val) => {
    const strVal = val.toString();

    if (slot.type === 'result') {
      const newResults = [...resultSlots];
      newResults[slot.index] = strVal;
      setResultSlots(newResults);

      if (strVal === correctResultStr[slot.index] && showHelp) {
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
    if (isTestMode) {
      if (testActiveIdx == null) return;
      applyTestDigit(testActiveIdx, val);
      return;
    }
    if (!activeSlot) return;
    applyDigit(activeSlot, val);
  };

  const checkAnswer = () => {
    const userStr = resultSlots.map(s => s || '0').join('');
    const userInt = parseInt(userStr);
    const correctInt = num1Int - num2Int;
    let isCorrect = userInt === correctInt;
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
    const isResultCorrect = resultSlots[i] === correctResultStr[i];
    return feedback.text && isResultFilled ? (isResultCorrect ? 'correct' : 'incorrect') : '';
  };
  const carryState = (i) => {
    const isCarryFilled = carrySlots[i] === '1';
    const isCarryCorrect = expectedCarries[i] === 1;
    return (feedback.text && showHelp && i !== 0)
      ? (isCarryFilled === isCarryCorrect ? (isCarryFilled ? 'correct' : '') : 'incorrect') : '';
  };
  const bottomDigits = Array.from({ length: structure.totalDigits }, (_, i) => {
    const value = getVisualSubtrahendDigit(i);
    return { value, modified: value !== parseInt(strNum2[i]) };
  });

  return (
    <MathOperationLayout
      title="Restas con un decimal"
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
        startTest, nextQuestion: nextTestQuestion, exitTest,
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
          <h3>Examen</h3>
          <p>5 restas seguidas: escribe solo el resultado. La nota llega al final.</p>
        </>
      }
    >
      {isTestMode ? (
        <OperationTestBoard
          operator="−"
          n1={testN1}
          n2={testN2}
          resultSlots={testResultSlots}
          activeSlotIndex={testActiveIdx}
          onSlotClick={(i) => setTestActiveIdx(i)}
          onSlotDrop={applyTestDigit}
        />
      ) : (
      <BorrowSubtractionBoard
        top={strNum1}
        bottom={bottomDigits}
        intDigits={structure.intDigits}
        decimals={structure.decimalPlaces}
        resultSlots={resultSlots}
        carrySlots={carrySlots}
        resultState={resultState}
        carryState={carryState}
        activeSlot={activeSlot}
        onSelect={setActiveSlot}
        onDropDigit={applyDigit}
        showHelp={showHelp}
      />
      )}
    </MathOperationLayout>
  );
};

export default RestasPrimaria4;
