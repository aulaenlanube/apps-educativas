import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowDown } from 'lucide-react';
import '/src/apps/_shared/Divisiones.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import DivisionTestBoard from '../DivisionTestBoard';
import { OpBoard, OpNum, OpCell } from '../../multiplicaciones/OpTablero';

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
    setTestActiveIdx(0); // el cociente se escribe de izquierda a derecha, como se calcula
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
      const nextIdx = testActiveIdx + 1;
      setTestActiveIdx(nextIdx < next.length ? nextIdx : null);
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

  // Estado de cada casilla (mismas reglas de antes): activa mientras no se ha
  // comprobado; tras comprobar, correcta o incorrecta.
  const getSlotProps = (type, row, col, expectedVal, isHighlighted) => {
    let currentVal = '';
    if (type === 'quotient') currentVal = quotientSlots[col];
    if (type === 'remainder') currentVal = remainderSlots[`${row}-${col}`];
    if (feedback.text === '') {
      const isActive = activeSlot?.type === type && (type === 'quotient' ? activeSlot.index === col : (activeSlot.row === row && activeSlot.col === col));
      return { active: isActive, focus: isHighlighted, state: '' };
    } else {
      const isCorrect = parseInt(currentVal) === expectedVal;
      return { active: false, focus: isHighlighted, state: isCorrect ? 'correct' : 'incorrect' };
    }
  };

  const dividendStr = operands.dividend.toString();
  const len = dividendStr.length;
  const currentStepIndex = activeSlot ? (activeSlot.type === 'quotient' ? activeSlot.index : activeSlot.row) : -1;
  // Rejilla: fila 1 = etiquetas; fila 2 = dividendo y divisor; filas 3.. = cociente y restos.
  const units = len * 1.14 + 0.6 + Math.max(String(operands.divisor).length * 0.62 + 0.6, steps.length * 1.14 + 0.5) + 0.6;

  return (
    <MathOperationLayout
      title="Divide entre 1 cifra"
      emoji="➗"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nueva"
      toggleLabel={!isTestMode ? "Mostrar ayudas" : undefined}
      toggleValue={showHelp}
      onToggleChange={setShowHelp}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Toca un número"
      padLayout="side"
      operator="÷"
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
          <p>Resuelve la división paso a paso: cada cifra del cociente y el resto de cada paso.</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla para elegirla (se ilumina) y escribe la cifra con el teclado de la pantalla o con el del ordenador.</li>
            <li>Sigue el orden: primero la cifra del <strong>cociente</strong> (azul) y después el <strong>resto</strong> (naranja). Al terminar un paso, baja la siguiente cifra del dividendo.</li>
            <li>Con <strong>Mostrar ayudas</strong> se iluminan las cifras con las que trabajas y una flecha marca la cifra que se baja.</li>
            <li>Pulsa <strong>Comprobar</strong>: cada casilla se pone en verde o en rojo.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 divisiones. Escribe solo el cociente (la parte entera del resultado).</p>
        </>
      }
    >
      {isTestMode ? (
        <DivisionTestBoard
          dividend={testN1}
          divisor={testN2}
          resultSlots={testResultSlots}
          activeSlotIndex={testActiveIdx}
          onSlotClick={(i) => setTestActiveIdx(i)}
        />
      ) : (
      <OpBoard className="dv-board">
        <div
          className="op-grid dv-grid"
          style={{ '--units': units, gridTemplateColumns: `repeat(${len}, var(--cell)) calc(var(--cell) * .45) auto` }}
        >
          <div className="dv-cap" style={{ gridRow: 1, gridColumn: `1 / ${len + 1}` }}><span>dividendo</span></div>
          <div className="dv-cap" style={{ gridRow: 1, gridColumn: len + 2 }}><span>divisor</span></div>

          {dividendStr.split('').map((digit, i) => {
            const isHighlighted = showHelp && currentStepIndex === 0 && steps.length > 0 && i <= steps[0].digitIndex;
            return (
              <OpNum key={`div-${i}`} at={{ gridRow: 2, gridColumn: i + 1 }} focus={isHighlighted}>{digit}</OpNum>
            );
          })}
          <div
            className={`dv-divisor ${showHelp && currentStepIndex !== -1 ? 'is-focus' : ''}`}
            style={{ gridRow: 2, gridColumn: len + 2 }}
          >
            <span className="dv-divisor__num">{operands.divisor}</span>
          </div>

          {/* Cociente */}
          <div className="dv-quotient" style={{ gridRow: 3, gridColumn: len + 2 }}>
            {steps.map((step, i) => {
              const prevStepKey = i > 0 ? `${i - 1}-${steps[i - 1].digitIndex}` : null;
              const isPrevStepFinished = i === 0 || (remainderSlots[prevStepKey] !== undefined && remainderSlots[prevStepKey] !== '');
              if (!isPrevStepFinished) return null;
              return (
                <OpCell
                  key={`q-${i}`}
                  i={i}
                  stamp
                  {...getSlotProps('quotient', 0, i, step.quotientDigit, false)}
                  value={quotientSlots[i]}
                  onClick={() => setActiveSlot({ type: 'quotient', index: i })}
                  label={`Cifra ${i + 1} del cociente`}
                />
              );
            })}
            <span className="dv-tag dv-tag--q">cociente</span>
          </div>

          {/* Restos y cifras que se bajan */}
          {steps.map((step, i) => {
            const gridRow = i + 3;
            const gridCol = step.digitIndex + 1;
            const isQuotientFilled = quotientSlots[i] !== '' && quotientSlots[i] !== undefined;
            const isRemainderFilled = remainderSlots[`${i}-${step.digitIndex}`] !== undefined && remainderSlots[`${i}-${step.digitIndex}`] !== '';
            const isNextStepActive = currentStepIndex === i + 1;
            const isLastStep = i === steps.length - 1;
            return (
              <React.Fragment key={`step-${i}`}>
                {isQuotientFilled && (
                  <OpCell
                    className="dv-rest"
                    at={{ gridRow, gridColumn: gridCol }}
                    i={i}
                    stamp={isLastStep}
                    {...getSlotProps('remainder', i, step.digitIndex, step.remainder, showHelp && isNextStepActive)}
                    value={remainderSlots[`${i}-${step.digitIndex}`]}
                    onClick={() => setActiveSlot({ type: 'remainder', row: i, col: step.digitIndex })}
                    label={isLastStep ? 'Resto final' : `Resto del paso ${i + 1}`}
                  >
                    {isLastStep && <span className="dv-tag dv-tag--rest">resto</span>}
                  </OpCell>
                )}
                {i < steps.length - 1 && isRemainderFilled && (
                  <OpNum
                    className="dv-down"
                    at={{ gridRow, gridColumn: steps[i + 1].digitIndex + 1 }}
                    focus={showHelp && isNextStepActive}
                  >
                    {dividendStr[steps[i + 1].digitIndex]}
                    {showHelp && <span className="dv-down__arrow" aria-hidden="true"><ArrowDown size={12} strokeWidth={3} /></span>}
                  </OpNum>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </OpBoard>
      )}
    </MathOperationLayout>
  );
};

export default DivisionesPrimaria4;
