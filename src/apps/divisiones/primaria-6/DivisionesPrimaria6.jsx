import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Divisiones.css';

const DivisionesPrimaria6 = () => {
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

    if (userCommaIndex !== expectedCommaIndex) allCorrect = false;

    if (allCorrect) {
      setFeedback({ text: '¡Fantástico! Dominas los decimales 🌟', className: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: 'Algo falla. Revisa los números o la posición de la coma.', className: 'feedback-incorrect' });
    }
  };

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

  const getCommaClass = (index) => {
      let cls = 'comma-slot';
      if (userCommaIndex === index) cls += ' active';
      if (feedback.text !== '') {
          if (userCommaIndex === index && userCommaIndex === expectedCommaIndex) cls += ' correct';
          else if (userCommaIndex === index && userCommaIndex !== expectedCommaIndex) cls += ' incorrect';
          else if (index === expectedCommaIndex) cls += ' incorrect'; 
      }
      return cls;
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
  const dividendChars = operands.dividend.split('');
  
  // CAMBIO AQUÍ: Ancho de columna de la coma aumentado a 30px
  let gridColsCSS = "";
  dividendChars.forEach(char => {
      if (char === ',') gridColsCSS += "30px "; 
      else gridColsCSS += "50px ";
  });
  gridColsCSS += "20px auto";

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Dividir">➗</span>{' '}
        <span className="gradient-text">Divisiones con Decimales</span>
      </h1>

      <div id="options-area" className="flex flex-wrap justify-center gap-8 mb-6">
        <label className="flex items-center cursor-pointer select-none">
          <span className="mr-3 font-medium text-gray-600">Mostrar ayudas</span>
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={showHelp} onChange={e => setShowHelp(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showHelp ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showHelp ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>

        <label className="flex items-center cursor-pointer select-none">
          <span className="mr-3 font-medium text-gray-600">Ayudas extra</span>
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={showTable} onChange={e => setShowTable(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showTable ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showTable ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>

      <div className="game-content">
        
        <div className="division-grid" style={{ gridTemplateColumns: gridColsCSS }}>
          
          {/* Fila 1: Dividendo */}
          {dividendChars.map((char, i) => {
            const isHighlighted = showHelp && activeStepIdx === 0 && steps.length > 0 && i <= steps[0].dividendIndex;
            return (
              <div 
                key={`div-${i}`} 
                className={`digit-display ${char === ',' ? 'dividend-comma' : ''} ${isHighlighted ? 'operand-highlight' : ''}`}
                style={{ gridRow: 1, gridColumn: i + 1 }}
              >
                {char}
              </div>
            );
          })}
          
          {/* Divisor */}
          <div 
            style={{ gridRow: 1, gridColumn: dividendChars.length + 2 }} 
            className={`divisor-container ${showHelp && activeStepIdx !== -1 ? 'operand-highlight' : ''}`}
          >
            <span className="divisor-number">{operands.divisor}</span>
          </div>

          {/* Fila 2: Cociente */}
          <div style={{ gridRow: 2, gridColumn: dividendChars.length + 2 }} className="quotient-area">
            <div className={getCommaClass(0)} onClick={() => handleCommaClick(0)}>,</div>
            {steps.map((step, i) => {
              if (!isStepVisible(i)) return null;
              const key = `q-${i}`;
              return (
                <React.Fragment key={key}>
                    <div 
                      className={getSlotClass(key, step.quotientVal)}
                      onClick={() => setActiveSlot(key)}
                    >
                      {userInputs[key]}
                    </div>
                    <div className={getCommaClass(i + 1)} onClick={() => handleCommaClick(i + 1)}>,</div>
                </React.Fragment>
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

      <div id="feedback-message" className={`mb-4 ${feedback.className}`}>{feedback.text}</div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>Comprobar</button>
        <button id="new-problem-button" onClick={generateNewProblem}>Nueva</button>
      </div>

      <div id="number-palette">
        <h2>Teclado</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map((n) => (
            <div key={n} className="number-tile" onClick={() => handlePaletteClick(n)}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DivisionesPrimaria6;