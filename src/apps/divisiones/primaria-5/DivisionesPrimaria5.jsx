import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ArrowDown, Grid3x3 } from 'lucide-react';
import '/src/apps/_shared/Divisiones.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import { GameButton } from '../../_shared/kit';
import DivisionTestBoard from '../DivisionTestBoard';
import { OpBoard, OpNum, OpCell } from '../../multiplicaciones/OpTablero';

const TOTAL_TEST_QUESTIONS = 5;

const DivisionesPrimaria5 = ({ onGameComplete } = {}) => {
  // --- Estados ---
  const [operands, setOperands] = useState({ dividend: 0, divisor: 1 });
  const [steps, setSteps] = useState([]); 
  const [userInputs, setUserInputs] = useState({});
  const [activeSlot, setActiveSlot] = useState(null); 
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  
  // Opciones
  const [showHelp, setShowHelp] = useState(true); // Ayudas visuales (colores)
  const [showTable, setShowTable] = useState(false); // Ayudas extra (tabla multiplicar)

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

  // --- 1. Lógica de Cálculo ---
  const calculateSolutionPlan = (D, d) => {
    const D_str = D.toString();
    const d_str = d.toString();
    const plan = [];
    
    let idx = d_str.length - 1; 
    let currentPartStr = D_str.substring(0, d_str.length);
    let currentPart = parseInt(currentPartStr);

    if (currentPart < d && idx + 1 < D_str.length) {
        idx++;
        currentPartStr = D_str.substring(0, idx + 1);
        currentPart = parseInt(currentPartStr);
    }

    while (idx < D_str.length) {
      const q = Math.floor(currentPart / d);
      const r = currentPart % d;
      
      const r_str = r.toString();
      const remainderDigits = [];
      for (let k = 0; k < r_str.length; k++) {
          const digitVal = r_str[k];
          const colPos = idx - (r_str.length - 1 - k);
          remainderDigits.push({ val: digitVal, col: colPos });
      }

      let broughtDown = null;
      if (idx + 1 < D_str.length) {
          broughtDown = {
              val: D_str[idx + 1],
              col: idx + 1
          };
      }

      plan.push({
        stepIndex: plan.length,
        quotientVal: q.toString(),
        remainderDigits: remainderDigits, 
        broughtDown: broughtDown,
        dividendIndex: idx
      });

      idx++;
      if (idx < D_str.length) {
        const nextDigit = parseInt(D_str[idx]);
        currentPart = r * 10 + nextDigit;
      }
    }
    return plan;
  };

  // --- 2. Generación ---
  const generateNewProblem = useCallback(() => {
    const isTwoDigits = Math.random() > 0.4; 
    const minDivisor = isTwoDigits ? 11 : 101; 
    const maxDivisor = isTwoDigits ? 99 : 999;
    const divisor = Math.floor(Math.random() * (maxDivisor - minDivisor + 1)) + minDivisor; 

    const minDividend = 1500; 
    const maxDividend = 150000;
    let dividend = Math.floor(Math.random() * (maxDividend - minDividend + 1)) + minDividend;
    if (dividend < divisor) dividend = divisor * 13;

    const plan = calculateSolutionPlan(dividend, divisor);

    setOperands({ dividend, divisor });
    setSteps(plan);
    setUserInputs({});
    setFeedback({ text: '', className: '' });
    setActiveSlot('q-0');
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Test mode helpers ---
  const generarParTest = useCallback(() => {
    const divisor = Math.floor(Math.random() * 89) + 11; // 11..99 (2 cifras)
    const dividend = Math.floor(Math.random() * 4800) + 200; // 200..4999
    return [dividend.toString(), divisor.toString()];
  }, []);

  const prepareTestQuestion = (pair) => {
    const [a, b] = pair;
    const coc = Math.floor(parseInt(a) / parseInt(b));
    const len = Math.max(1, coc.toString().length);
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

  // --- 3. Navegación ---
  const inputOrder = useMemo(() => {
      const order = [];
      steps.forEach((step, sIdx) => {
          order.push(`q-${sIdx}`);
          // Resto: Derecha a Izquierda
          [...step.remainderDigits].reverse().forEach(rd => {
              order.push(`r-${sIdx}-${rd.col}`);
          });
      });
      return order;
  }, [steps]);

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

    setUserInputs(prev => ({ ...prev, [activeSlot]: valStr }));

    const currentIndex = inputOrder.indexOf(activeSlot);
    if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
        setActiveSlot(inputOrder[currentIndex + 1]);
    } else {
        setActiveSlot(null);
    }
  };

  const checkAnswer = () => {
    let allCorrect = true;
    for (const key of inputOrder) {
        const userVal = userInputs[key];
        let expectedVal = '';
        if (key.startsWith('q')) {
            const idx = parseInt(key.split('-')[1]);
            expectedVal = steps[idx].quotientVal;
        } else {
            const [, sIdx, col] = key.split('-');
            const step = steps[parseInt(sIdx)];
            const rDigit = step.remainderDigits.find(r => r.col === parseInt(col));
            expectedVal = rDigit ? rDigit.val : '';
        }

        if (userVal !== expectedVal) {
            allCorrect = false;
            break;
        }
    }

    if (allCorrect) {
      setFeedback({ text: '¡Excelente! Operación correcta 🎉', className: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: 'Revisa los números en rojo.', className: 'feedback-incorrect' });
    }
  };

  // --- 4. Helpers Visuales ---
  // Estado de cada casilla (mismas reglas de antes): activa mientras no se ha
  // comprobado; tras comprobar, correcta o incorrecta.
  const getSlotProps = (key, expectedVal) => {
    const currentVal = userInputs[key];
    if (feedback.text === '') {
        return { active: activeSlot === key, state: '' };
    } else {
        return { active: false, state: currentVal === expectedVal ? 'correct' : 'incorrect' };
    }
  };

  const isStepVisible = (stepIdx) => {
      if (stepIdx === 0) return true;
      const prevStep = steps[stepIdx - 1];
      const allFilled = prevStep.remainderDigits.every(rd => {
          const key = `r-${stepIdx-1}-${rd.col}`;
          return userInputs[key] !== undefined && userInputs[key] !== '';
      });
      return allFilled;
  };

  const getActiveStepIndex = () => {
      if (!activeSlot) return -1;
      if (activeSlot.startsWith('q')) return parseInt(activeSlot.split('-')[1]);
      return parseInt(activeSlot.split('-')[1]); 
  };
  const activeStepIdx = getActiveStepIndex();

  // --- Renderizado ---
  // Rejilla: fila 1 = etiquetas; fila 2 = dividendo y divisor; filas 3.. = cociente y restos.
  const dividendStr = operands.dividend.toString();
  const len = dividendStr.length;
  const units = len * 1.14 + 0.6 + Math.max(String(operands.divisor).length * 0.62 + 0.6, steps.length * 1.14 + 0.5) + 0.6;

  return (
    <MathOperationLayout
      title="Divide entre 2 y 3 cifras"
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
            <li>Sigue el orden: primero la cifra del <strong>cociente</strong> (azul) y después el <strong>resto</strong> (naranja), de derecha a izquierda. Al terminar un paso, baja la siguiente cifra del dividendo.</li>
            <li>Con <strong>Mostrar ayudas</strong> se iluminan las cifras con las que trabajas y una flecha marca la cifra que se baja.</li>
            <li>El botón <strong>Tabla del…</strong> muestra los productos del divisor por 1, 2, 3… 9 para buscar la cifra del cociente.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 divisiones entre 2 cifras. Escribe solo el cociente (la parte entera del resultado).</p>
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

          {/* Dividendo */}
          {dividendStr.split('').map((digit, i) => {
            const isHighlighted = showHelp && activeStepIdx === 0 && i <= steps[0].dividendIndex;
            return (
              <OpNum key={`div-${i}`} at={{ gridRow: 2, gridColumn: i + 1 }} focus={isHighlighted}>{digit}</OpNum>
            );
          })}

          {/* Divisor */}
          <div
            className={`dv-divisor ${showHelp && activeStepIdx !== -1 ? 'is-focus' : ''}`}
            style={{ gridRow: 2, gridColumn: len + 2 }}
          >
            <span className="dv-divisor__num">{operands.divisor}</span>
          </div>

          {/* Cociente */}
          <div className="dv-quotient" style={{ gridRow: 3, gridColumn: len + 2 }}>
            {steps.map((step, i) => {
              if (!isStepVisible(i)) return null;
              const key = `q-${i}`;
              return (
                <OpCell
                  key={key}
                  i={i}
                  stamp
                  {...getSlotProps(key, step.quotientVal)}
                  value={userInputs[key]}
                  onClick={() => setActiveSlot(key)}
                  label={`Cifra ${i + 1} del cociente`}
                />
              );
            })}
            <span className="dv-tag dv-tag--q">cociente</span>
          </div>

          {/* Restos y cifras que se bajan */}
          {steps.map((step, i) => {
              const quotientKey = `q-${i}`;
              const isQuotientFilled = userInputs[quotientKey] !== undefined && userInputs[quotientKey] !== '';

              if (!isStepVisible(i) || !isQuotientFilled) return null;

              const gridRow = i + 3;
              const isOperandForNext = showHelp && activeStepIdx === i + 1;
              const isLastStep = i === steps.length - 1;

              return (
                  <React.Fragment key={`step-row-${i}`}>
                      {step.remainderDigits.map((digitInfo, k) => {
                          const cellKey = `r-${i}-${digitInfo.col}`;
                          const isTagCell = isLastStep && k === step.remainderDigits.length - 1;
                          return (
                              <OpCell
                                  key={cellKey}
                                  className="dv-rest"
                                  at={{ gridRow, gridColumn: digitInfo.col + 1 }}
                                  i={k}
                                  stamp={isLastStep}
                                  focus={isOperandForNext}
                                  {...getSlotProps(cellKey, digitInfo.val)}
                                  value={userInputs[cellKey]}
                                  onClick={() => setActiveSlot(cellKey)}
                                  label={isLastStep ? 'Cifra del resto final' : `Cifra del resto del paso ${i + 1}`}
                              >
                                  {isTagCell && <span className="dv-tag dv-tag--rest">resto</span>}
                              </OpCell>
                          );
                      })}

                      {/* Cifra bajada */}
                      {step.broughtDown && (
                          (() => {
                              const allRemFilled = step.remainderDigits.every(rd => userInputs[`r-${i}-${rd.col}`]);
                              if (!allRemFilled) return null;

                              return (
                                  <OpNum
                                      className="dv-down"
                                      at={{ gridRow, gridColumn: step.broughtDown.col + 1 }}
                                      focus={isOperandForNext}
                                  >
                                      {step.broughtDown.val}
                                      {showHelp && <span className="dv-down__arrow" aria-hidden="true"><ArrowDown size={12} strokeWidth={3} /></span>}
                                  </OpNum>
                              );
                          })()
                      )}
                  </React.Fragment>
              );
          })}
        </div>

        {/* Tabla de multiplicar del divisor (ayuda extra) */}
        <div className="dv-extra">
          <GameButton
            variant={showTable ? 'primary' : 'soft'}
            size="sm"
            icon={Grid3x3}
            aria-pressed={showTable}
            onClick={() => setShowTable(v => !v)}
          >
            {showTable ? 'Ocultar la tabla' : `Tabla del ${operands.divisor}`}
          </GameButton>
          {showTable && (
            <div className="dv-table" aria-label={`Tabla del ${operands.divisor}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <span key={n} className="dv-table__row">
                  {operands.divisor} × {n} = <strong>{operands.divisor * n}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      </OpBoard>
      )}

    </MathOperationLayout>
  );
};

export default DivisionesPrimaria5;
