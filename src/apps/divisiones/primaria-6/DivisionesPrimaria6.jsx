import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ArrowDown, Grid3x3 } from 'lucide-react';
import '/src/apps/_shared/Divisiones.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';
import { GameButton } from '../../_shared/kit';
import DivisionTestBoard from '../DivisionTestBoard';
import { OpBoard, OpNum, OpCell, OpComma } from '../../multiplicaciones/OpTablero';

const TOTAL_TEST_QUESTIONS = 5;

const DivisionesPrimaria6 = ({ onGameComplete } = {}) => {
  // --- Estados ---
  const [operands, setOperands] = useState({ dividend: '0', divisor: 1 });
  const [steps, setSteps] = useState([]); 
  const [userInputs, setUserInputs] = useState({});
  const [activeSlot, setActiveSlot] = useState(null); 
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  
  // Posición de la coma en el cociente
  const [userCommaIndex, setUserCommaIndex] = useState(null);
  const [expectedCommaIndex, setExpectedCommaIndex] = useState(-1);

  // Opciones
  const [showHelp, setShowHelp] = useState(true);
  const [showTable, setShowTable] = useState(false);

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
  const calculateSolutionPlan = (D_str, d) => {
    const digits = D_str.split(''); 
    const plan = [];
    
    let idx = 0;
    let currentPartStr = "";
    let quotientDigitsCount = 0;
    let calculatedCommaPos = -1;

    while (idx < digits.length) {
        const char = digits[idx];
        
        if (char === ',') {
            calculatedCommaPos = quotientDigitsCount;
            idx++;
            continue;
        }

        currentPartStr += char;
        const currentVal = parseInt(currentPartStr);
        const isInitial = plan.length === 0;
        
        if (isInitial && currentVal < d && idx < digits.length - 1) {
            idx++;
            continue;
        }

        // Dividir
        const q = Math.floor(currentVal / d);
        const r = currentVal % d;
        quotientDigitsCount++;

        // Restos (Alineación saltando comas)
        const r_str = r.toString();
        const remainderDigits = [];
        let pointer = idx; 
        
        for (let k = r_str.length - 1; k >= 0; k--) {
            while (pointer >= 0 && digits[pointer] === ',') {
                pointer--;
            }
            remainderDigits.unshift({ val: r_str[k], col: pointer });
            pointer--; 
        }

        // Bajar cifra
        let broughtDown = null;
        let nextIdx = idx + 1;
        if (nextIdx < digits.length && digits[nextIdx] === ',') {
            if (calculatedCommaPos === -1) calculatedCommaPos = quotientDigitsCount;
            nextIdx++; 
        }
        
        if (nextIdx < digits.length) {
            broughtDown = { val: digits[nextIdx], col: nextIdx };
        }

        plan.push({
            stepIndex: plan.length,
            quotientVal: q.toString(),
            remainderDigits: remainderDigits,
            broughtDown: broughtDown,
            dividendIndex: idx
        });

        currentPartStr = r.toString(); 
        idx++;
    }

    return { plan, commaPos: calculatedCommaPos };
  };

  // --- 2. Generación ---
  const generateNewProblem = useCallback(() => {
    const divisor = Math.floor(Math.random() * 89) + 11; 
    const intPart = Math.floor(Math.random() * 900) + 100;
    const decPart = Math.floor(Math.random() * 99) + 1; 
    
    const dividendStr = `${intPart},${decPart.toString().padStart(2, '0').replace(/0+$/, '')}`; 

    const { plan, commaPos } = calculateSolutionPlan(dividendStr, divisor);

    setOperands({ dividend: dividendStr, divisor: divisor });
    setSteps(plan);
    setExpectedCommaIndex(commaPos);
    setUserInputs({});
    setUserCommaIndex(null); 
    setFeedback({ text: '', className: '' });
    setActiveSlot('q-0');
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Test mode helpers (enteros para evitar coma en el cociente) ---
  const generarParTest = useCallback(() => {
    const divisor = Math.floor(Math.random() * 899) + 100; // 100..998 (3 cifras)
    const dividend = Math.floor(Math.random() * 89000) + 1000; // 1000..89999
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

  const handleCommaClick = (index) => {
      if (userCommaIndex === index) setUserCommaIndex(null);
      else setUserCommaIndex(index);
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

    if (userCommaIndex !== expectedCommaIndex) allCorrect = false;

    if (allCorrect) {
      setFeedback({ text: '¡Fantástico! Dominas los decimales 🌟', className: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: 'Algo falla. Revisa los números o la posición de la coma.', className: 'feedback-incorrect' });
    }
  };

  // Estado de cada casilla y de cada ranura de coma (mismas reglas de antes):
  // activa mientras no se ha comprobado; tras comprobar, correcta o incorrecta.
  const getSlotProps = (key, expectedVal) => {
    const currentVal = userInputs[key];
    if (feedback.text === '') {
        return { active: activeSlot === key, state: '' };
    } else {
        return { active: false, state: currentVal === expectedVal ? 'correct' : 'incorrect' };
    }
  };

  const getCommaProps = (index) => {
      const on = userCommaIndex === index;
      let state = '';
      if (feedback.text !== '') {
          if (on && userCommaIndex === expectedCommaIndex) state = 'correct';
          else if (on && userCommaIndex !== expectedCommaIndex) state = 'incorrect';
          else if (index === expectedCommaIndex) state = 'incorrect';
      }
      return { on, state };
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

  // --- RENDERIZADO GRID ---
  // Rejilla: fila 1 = etiquetas; fila 2 = dividendo y divisor; filas 3.. = cociente y restos.
  // La coma del dividendo ocupa una columna estrecha.
  const dividendChars = operands.dividend.split('');
  const nCommas = dividendChars.filter((ch) => ch === ',').length;
  const gridColsCSS = dividendChars.map((ch) => (ch === ',' ? 'calc(var(--cell) * .42)' : 'var(--cell)')).join(' ')
    + ' calc(var(--cell) * .45) auto';
  const units = (dividendChars.length - nCommas) * 1.14 + nCommas * 0.56 + 0.6
    + Math.max(String(operands.divisor).length * 0.62 + 0.6, steps.length * 1.14 + (steps.length + 1) * 0.56 + 0.5) + 0.6;
  const nCols = dividendChars.length;

  return (
    <MathOperationLayout
      title="Divide con decimales"
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
          <p>Resuelve la división con decimales paso a paso y coloca la coma en el cociente.</p>
          <h3>Cómo se juega</h3>
          <ul>
            <li>Toca una casilla para elegirla (se ilumina) y escribe la cifra con el teclado de la pantalla o con el del ordenador.</li>
            <li>Sigue el orden: primero la cifra del <strong>cociente</strong> (azul) y después el <strong>resto</strong> (naranja). Al terminar un paso, baja la siguiente cifra.</li>
            <li>Cuando bajes la primera cifra decimal del dividendo, pon la coma en el cociente: toca el punto que hay entre dos casillas.</li>
            <li>El botón <strong>Tabla del…</strong> muestra los productos del divisor por 1, 2, 3… 9.</li>
          </ul>
          <h3>🔴 Modo Examen</h3>
          <p>5 divisiones de números enteros entre 3 cifras. Escribe solo el cociente (la parte entera).</p>
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
        <div className="op-grid dv-grid" style={{ '--units': units, gridTemplateColumns: gridColsCSS }}>
          <div className="dv-cap" style={{ gridRow: 1, gridColumn: `1 / ${nCols + 1}` }}><span>dividendo</span></div>
          <div className="dv-cap" style={{ gridRow: 1, gridColumn: nCols + 2 }}><span>divisor</span></div>

          {/* Dividendo (con su coma) */}
          {dividendChars.map((char, i) => {
            if (char === ',') return <OpComma key={`div-${i}`} at={{ gridRow: 2, gridColumn: i + 1 }} />;
            const isHighlighted = showHelp && activeStepIdx === 0 && steps.length > 0 && i <= steps[0].dividendIndex;
            return (
              <OpNum key={`div-${i}`} at={{ gridRow: 2, gridColumn: i + 1 }} focus={isHighlighted}>{char}</OpNum>
            );
          })}

          {/* Divisor */}
          <div
            className={`dv-divisor ${showHelp && activeStepIdx !== -1 ? 'is-focus' : ''}`}
            style={{ gridRow: 2, gridColumn: nCols + 2 }}
          >
            <span className="dv-divisor__num">{operands.divisor}</span>
          </div>

          {/* Cociente con sus ranuras para la coma */}
          <div className="dv-quotient" style={{ gridRow: 3, gridColumn: nCols + 2 }}>
            <OpComma {...getCommaProps(0)} onClick={() => handleCommaClick(0)} />
            {steps.map((step, i) => {
              if (!isStepVisible(i)) return null;
              const key = `q-${i}`;
              return (
                <React.Fragment key={key}>
                    <OpCell
                      i={i}
                      stamp
                      {...getSlotProps(key, step.quotientVal)}
                      value={userInputs[key]}
                      onClick={() => setActiveSlot(key)}
                      label={`Cifra ${i + 1} del cociente`}
                    />
                    <OpComma {...getCommaProps(i + 1)} onClick={() => handleCommaClick(i + 1)} />
                </React.Fragment>
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

export default DivisionesPrimaria6;
