import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Divisiones.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import OperationTestBoard from '../../_shared/OperationTestBoard';

const TOTAL_TEST_QUESTIONS = 5;

const DivisionesPrimaria4 = ({ onGameComplete } = {}) => {
  const [operands, setOperands] = useState({ dividend: 0, divisor: 1 });
  const [steps, setSteps] = useState([]);
  const [quotientSlots, setQuotientSlots] = useState([]);
  const [remainderSlots, setRemainderSlots] = useState({});
  const [activeSlot, setActiveSlot] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [showHelp, setShowHelp] = useState(true);

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

  const calculateDivisionSteps = (D, d) => {
    const D_str = D.toString();
    const solutionSteps = [];
    let idx = 0;
    let currentPart = parseInt(D_str[0]);
    if (currentPart < d && D_str.length > 1) { currentPart = parseInt(D_str.substring(0, 2)); idx = 1; }
    while (idx < D_str.length) {
      const q = Math.floor(currentPart / d);
      const r = currentPart % d;
      solutionSteps.push({ quotientDigit: q, remainder: r, digitIndex: idx });
      idx++;
      if (idx < D_str.length) { currentPart = r * 10 + parseInt(D_str[idx]); }
    }
    return solutionSteps;
  };

  const generateNewProblem = useCallback(() => {
    const divisor = Math.floor(Math.random() * 8) + 2;
    const isThreeDigits = Math.random() > 0.5;
    const min = isThreeDigits ? 100 : 20;
    const max = isThreeDigits ? 999 : 99;
    const dividend = Math.floor(Math.random() * (max - min + 1)) + min;
    const solSteps = calculateDivisionSteps(dividend, divisor);
    setOperands({ dividend, divisor });
    setSteps(solSteps);
    setQuotientSlots(new Array(solSteps.length).fill(''));
    setRemainderSlots({});
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'quotient', index: 0 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Test mode helpers (cociente exacto o con resto) ---
  const generarParTest = useCallback(() => {
    const divisor = Math.floor(Math.random() * 8) + 2;      // 2..9
    const dividend = Math.floor(Math.random() * 880) + 20;  // 20..899
    return [dividend.toString(), divisor.toString()];
  }, []);

  const prepareTestQuestion = (pair) => {
    const [a, b] = pair;
    const coc = Math.floor(parseInt(a) / parseInt(b));
    const len = coc.toString().length;
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
        const expected = Math.floor(parseInt(q[0]) / parseInt(q[1])).toString();
        if (newAnswers[i] === expected) hits++;
      });
      setScore(hits * 200);
      setShowResults(true);
    }
  };

  const exitTest = () => { setIsTestMode(false); setShowResults(false); generateNewProblem(); };

  const handlePaletteClick = (val) => {
    if (isTestMode) {
      if (testActiveIdx == null) return;
      const strVal = val.toString();
      const next = [...testResultSlots];
      next[testActiveIdx] = strVal;
      setTestResultSlots(next);
      const nextIdx = testActiveIdx - 1;
      setTestActiveIdx(nextIdx >= 0 ? nextIdx : null);
      return;
    }
    if (!activeSlot) return;
    const valStr = val.toString();
    if (activeSlot.type === 'quotient') {
      const newQ = [...quotientSlots];
      newQ[activeSlot.index] = valStr;
      setQuotientSlots(newQ);
      const currentStep = steps[activeSlot.index];
      if (currentStep) setActiveSlot({ type: 'remainder', row: activeSlot.index, col: currentStep.digitIndex });
    } else if (activeSlot.type === 'remainder') {
      const key = `${activeSlot.row}-${activeSlot.col}`;
      setRemainderSlots(prev => ({ ...prev, [key]: valStr }));
      const nextStepIdx = activeSlot.row + 1;
      if (nextStepIdx < steps.length) setActiveSlot({ type: 'quotient', index: nextStepIdx });
      else setActiveSlot(null);
    }
  };

  const checkAnswer = () => {
    let allCorrect = true;
    if (!steps.every((step, i) => parseInt(quotientSlots[i]) === step.quotientDigit)) allCorrect = false;
    if (!steps.every((step, i) => parseInt(remainderSlots[`${i}-${step.digitIndex}`]) === step.remainder)) allCorrect = false;

    if (allCorrect) {
      setFeedback({ text: '¡Genial! División perfecta 🎉', cls: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: 'Hay errores. Revisa los números en rojo.', cls: 'feedback-incorrect' });
    }
  };

  const getSlotClass = (type, row, col, expectedVal, isHighlighted) => {
    let currentVal = '';
    if (type === 'quotient') currentVal = quotientSlots[col];
    if (type === 'remainder') currentVal = remainderSlots[`${row}-${col}`];
    const isFilled = currentVal !== '' && currentVal !== undefined;
    const filledClass = isFilled ? ' filled' : '';
    const highlightClass = isHighlighted ? ' operand-highlight' : '';
    if (feedback.text === '') {
      const isActive = activeSlot?.type === type && (type === 'quotient' ? activeSlot.index === col : (activeSlot.row === row && activeSlot.col === col));
      return `division-box${filledClass}${highlightClass} ${isActive ? 'selected' : ''}`;
    } else {
      const isCorrect = parseInt(currentVal) === expectedVal;
      return `division-box${filledClass}${highlightClass} ${isCorrect ? 'correct' : 'incorrect'}`;
    }
  };

  const dividendStr = operands.dividend.toString();
  const gridTemplateCols = `repeat(${dividendStr.length}, 50px) 20px auto`;
  const currentStepIndex = activeSlot ? (activeSlot.type === 'quotient' ? activeSlot.index : activeSlot.row) : -1;

  return (
    <MathOperationLayout
      title="Divisiones (4º)"
      emoji="➗"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nueva"
      toggleLabel={!isTestMode ? "Mostrar ayudas" : undefined}
      toggleValue={showHelp}
      onToggleChange={setShowHelp}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Teclado"
      onGameComplete={onGameComplete}
      isTestMode={isTestMode}
      setTestMode={setIsTestMode}
      testState={{ currentQuestionIndex, totalQuestions: TOTAL_TEST_QUESTIONS, showResults, score, testQuestions, userAnswers }}
      actions={{
        startPractice: () => { setIsTestMode(false); setShowResults(false); generateNewProblem(); },
        startTest, nextQuestion: nextTestQuestion, exitTest,
      }}
      calculateExpected={(q) => Math.floor(parseInt(q[0]) / parseInt(q[1])).toString()}
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Resuelve la division paso a paso: calcula el cociente y los restos parciales.</p>
          <h3>Como se juega</h3>
          <ul>
            <li>Pulsa en una casilla vacia para seleccionarla.</li>
            <li>Coloca el digito correcto desde el teclado numerico.</li>
            <li>Sigue el orden: primero el cociente, luego los restos.</li>
            <li>Activa "Mostrar ayudas" para ver indicaciones paso a paso.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 divisiones. Escribe solo el cociente (la parte entera del resultado).</p>
        </>
      }
    >
      {isTestMode ? (
        <OperationTestBoard
          operator="÷"
          n1={testN1}
          n2={testN2}
          resultSlots={testResultSlots}
          activeSlotIndex={testActiveIdx}
          onSlotClick={(i) => setTestActiveIdx(i)}
        />
      ) : (
      <div className="division-grid" style={{ gridTemplateColumns: gridTemplateCols }}>
        {dividendStr.split('').map((digit, i) => {
          const isHighlighted = showHelp && currentStepIndex === 0 && steps.length > 0 && i <= steps[0].digitIndex;
          return (
            <div key={`div-${i}`} className={`digit-display ${isHighlighted ? 'operand-highlight' : ''}`} style={{ gridRow: 1, gridColumn: i + 1 }}>{digit}</div>
          );
        })}
        <div style={{ gridRow: 1, gridColumn: dividendStr.length + 2 }} className={`divisor-container ${showHelp && currentStepIndex !== -1 ? 'operand-highlight' : ''}`}>
          <span className="divisor-number">{operands.divisor}</span>
        </div>
        <div style={{ gridRow: 2, gridColumn: dividendStr.length + 2 }} className="quotient-area">
          {steps.map((step, i) => {
            const prevStepKey = i > 0 ? `${i - 1}-${steps[i - 1].digitIndex}` : null;
            const isPrevStepFinished = i === 0 || (remainderSlots[prevStepKey] !== undefined && remainderSlots[prevStepKey] !== '');
            if (!isPrevStepFinished) return null;
            return (
              <div key={`q-${i}`} className={getSlotClass('quotient', 0, i, step.quotientDigit, false)}
                onClick={() => setActiveSlot({ type: 'quotient', index: i })}>{quotientSlots[i]}</div>
            );
          })}
        </div>
        {steps.map((step, i) => {
          const gridRow = i + 2;
          const gridCol = step.digitIndex + 1;
          const isQuotientFilled = quotientSlots[i] !== '' && quotientSlots[i] !== undefined;
          const isRemainderFilled = remainderSlots[`${i}-${step.digitIndex}`] !== undefined && remainderSlots[`${i}-${step.digitIndex}`] !== '';
          const isNextStepActive = currentStepIndex === i + 1;
          return (
            <React.Fragment key={`step-${i}`}>
              {isQuotientFilled && (
                <div style={{ gridRow, gridColumn: gridCol }}
                  className={getSlotClass('remainder', i, step.digitIndex, step.remainder, showHelp && isNextStepActive)}
                  onClick={() => setActiveSlot({ type: 'remainder', row: i, col: step.digitIndex })}>{remainderSlots[`${i}-${step.digitIndex}`]}</div>
              )}
              {i < steps.length - 1 && isRemainderFilled && (
                <div className={`digit-display ${showHelp && isNextStepActive ? 'operand-highlight' : ''}`}
                  style={{ gridRow, gridColumn: steps[i + 1].digitIndex + 1 }}>
                  {dividendStr[steps[i + 1].digitIndex]}
                  {showHelp && <span className="arrow-helper">↓</span>}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      )}
    </MathOperationLayout>
  );
};

export default DivisionesPrimaria4;
