import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Divisiones.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';

const DivisionesPrimaria5 = () => {
  // --- Estados ---
  const [operands, setOperands] = useState({ dividend: 0, divisor: 1 });
  const [steps, setSteps] = useState([]); 
  const [userInputs, setUserInputs] = useState({});
  const [activeSlot, setActiveSlot] = useState(null); 
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  
  // Opciones
  const [showHelp, setShowHelp] = useState(true); // Ayudas visuales (colores)
  const [showTable, setShowTable] = useState(false); // Ayudas extra (tabla multiplicar)

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
            const [_, sIdx, col] = key.split('-');
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
  const getSlotClass = (key, expectedVal) => {
    const currentVal = userInputs[key];
    const isFilled = currentVal !== undefined && currentVal !== '';
    const filledClass = isFilled ? ' filled' : '';
    
    if (feedback.text === '') {
        return `division-box${filledClass} ${activeSlot === key ? 'selected' : ''}`;
    } else {
        return `division-box${filledClass} ${currentVal === expectedVal ? 'correct' : 'incorrect'}`;
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
  const dividendStr = operands.dividend.toString();
  const gridTemplateCols = `repeat(${dividendStr.length}, 50px) 20px auto`;

  return (
    <MathOperationLayout
      title="Divisiones (5º)"
      emoji="➗"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nueva"
      toggleLabel="Mostrar ayudas"
      toggleValue={showHelp}
      onToggleChange={setShowHelp}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Teclado"
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Resuelve la division paso a paso: calcula el cociente y los restos parciales.</p>
          <h3>Como se juega</h3>
          <ul>
            <li>Pulsa en una casilla vacia para seleccionarla.</li>
            <li>Coloca el digito correcto desde el teclado numerico.</li>
            <li>Sigue el orden: primero el cociente, luego los restos.</li>
          </ul>
        </>
      }
    >
      {/* Extra toggle for table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 500, color: 'var(--app-text-secondary)', fontSize: '0.95em' }}>Ayudas extra</span>
        <div
          onClick={() => setShowTable(v => !v)}
          style={{ width: 52, height: 28, borderRadius: 14, cursor: 'pointer', background: showTable ? '#7c3aed' : '#cbd5e1', position: 'relative', transition: 'background 0.2s' }}
        >
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: showTable ? 27 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      <div className="game-content">
        
        {/* 1. La Rejilla de División */}
        <div className="division-grid" style={{ gridTemplateColumns: gridTemplateCols }}>
          
          {/* Fila 1: Dividendo */}
          {dividendStr.split('').map((digit, i) => {
            const isHighlighted = showHelp && activeStepIdx === 0 && i <= steps[0].dividendIndex;
            return (
              <div 
                key={`div-${i}`} 
                className={`digit-display ${isHighlighted ? 'operand-highlight' : ''}`}
                style={{ gridRow: 1, gridColumn: i + 1 }}
              >
                {digit}
              </div>
            );
          })}
          
          {/* Divisor */}
          <div 
            style={{ gridRow: 1, gridColumn: dividendStr.length + 2 }} 
            className={`divisor-container ${showHelp && activeStepIdx !== -1 ? 'operand-highlight' : ''}`}
          >
            <span className="divisor-number">{operands.divisor}</span>
          </div>

          {/* Fila 2: Cociente */}
          <div style={{ gridRow: 2, gridColumn: dividendStr.length + 2 }} className="quotient-area">
            {steps.map((step, i) => {
              if (!isStepVisible(i)) return null;
              const key = `q-${i}`;
              return (
                <div 
                  key={key}
                  className={getSlotClass(key, step.quotientVal)}
                  onClick={() => setActiveSlot(key)}
                >
                  {userInputs[key]}
                </div>
              );
            })}
          </div>

          {/* Filas de Restos */}
          {steps.map((step, i) => {
              const quotientKey = `q-${i}`;
              const isQuotientFilled = userInputs[quotientKey] !== undefined && userInputs[quotientKey] !== '';
              
              if (!isStepVisible(i) || !isQuotientFilled) return null;

              const gridRow = i + 2;
              const isOperandForNext = showHelp && activeStepIdx === i + 1;

              return (
                  <React.Fragment key={`step-row-${i}`}>
                      {/* Celdas del Resto */}
                      {step.remainderDigits.map((digitInfo) => {
                          const cellKey = `r-${i}-${digitInfo.col}`;
                          const extraClass = isOperandForNext ? ' operand-highlight' : '';
                          
                          return (
                              <div
                                  key={cellKey}
                                  style={{ gridRow: gridRow, gridColumn: digitInfo.col + 1 }}
                                  className={getSlotClass(cellKey, digitInfo.val) + extraClass}
                                  onClick={() => setActiveSlot(cellKey)}
                              >
                                  {userInputs[cellKey]}
                              </div>
                          );
                      })}

                      {/* Cifra bajada */}
                      {step.broughtDown && (
                          (() => {
                              const allRemFilled = step.remainderDigits.every(rd => userInputs[`r-${i}-${rd.col}`]);
                              if (!allRemFilled) return null;

                              return (
                                  <div 
                                      className={`digit-display ${isOperandForNext ? 'operand-highlight' : ''}`}
                                      style={{ gridRow: gridRow, gridColumn: step.broughtDown.col + 1 }}
                                  >
                                      {step.broughtDown.val}
                                      {showHelp && <span className="arrow-helper">↓</span>}
                                  </div>
                              );
                          })()
                      )}
                  </React.Fragment>
              );
          })}
        </div>

        {/* 2. La Tabla de Multiplicar Lateral (Si está activada) */}
        {showTable && (
          <div className="multiplication-table-panel">
            <h3>Tabla del {operands.divisor}</h3>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <div key={n} className="table-row">
                <span>{operands.divisor} × {n} = </span>
                <strong>{operands.divisor * n}</strong>
              </div>
            ))}
          </div>
        )}

      </div>

    </MathOperationLayout>
  );
};

export default DivisionesPrimaria5;