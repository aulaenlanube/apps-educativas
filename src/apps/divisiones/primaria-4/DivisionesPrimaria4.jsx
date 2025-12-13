import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Divisiones.css';

const DivisionesPrimaria4 = () => {
  const [operands, setOperands] = useState({ dividend: 0, divisor: 1 });
  const [steps, setSteps] = useState([]); 
  
  const [quotientSlots, setQuotientSlots] = useState([]);
  const [remainderSlots, setRemainderSlots] = useState({}); 
  
  const [activeSlot, setActiveSlot] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  const [showHelp, setShowHelp] = useState(true);

  // --- Lógica (sin cambios) ---
  const calculateDivisionSteps = (D, d) => {
    const D_str = D.toString();
    const solutionSteps = [];
    let idx = 0;
    let currentPart = parseInt(D_str[0]);
    if (currentPart < d && D_str.length > 1) {
      currentPart = parseInt(D_str.substring(0, 2));
      idx = 1;
    }
    while (idx < D_str.length) {
      const q = Math.floor(currentPart / d);
      const r = currentPart % d;
      solutionSteps.push({ quotientDigit: q, remainder: r, digitIndex: idx });
      idx++;
      if (idx < D_str.length) {
        const nextDigit = parseInt(D_str[idx]);
        currentPart = r * 10 + nextDigit;
      }
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
    setFeedback({ text: '', className: '' });
    setActiveSlot({ type: 'quotient', index: 0 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const valStr = val.toString();

    if (activeSlot.type === 'quotient') {
      const newQ = [...quotientSlots];
      newQ[activeSlot.index] = valStr;
      setQuotientSlots(newQ);
      const currentStep = steps[activeSlot.index];
      if (currentStep) {
        setActiveSlot({ type: 'remainder', row: activeSlot.index, col: currentStep.digitIndex });
      }
    } else if (activeSlot.type === 'remainder') {
      const key = `${activeSlot.row}-${activeSlot.col}`;
      setRemainderSlots(prev => ({ ...prev, [key]: valStr }));
      const nextStepIdx = activeSlot.row + 1;
      if (nextStepIdx < steps.length) {
        setActiveSlot({ type: 'quotient', index: nextStepIdx });
      } else {
        setActiveSlot(null);
      }
    }
  };

  const checkAnswer = () => {
    let allCorrect = true;
    const isQuotientCorrect = steps.every((step, i) => parseInt(quotientSlots[i]) === step.quotientDigit);
    if (!isQuotientCorrect) allCorrect = false;
    const isRemainderCorrect = steps.every((step, i) => {
      const key = `${i}-${step.digitIndex}`;
      return parseInt(remainderSlots[key]) === step.remainder;
    });
    if (!isRemainderCorrect) allCorrect = false;

    if (allCorrect) {
      setFeedback({ text: '¡Genial! División perfecta 🎉', className: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: 'Hay errores. Revisa los números en rojo.', className: 'feedback-incorrect' });
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
  // Layout del grid
  const gridTemplateCols = `repeat(${dividendStr.length}, 50px) 20px auto`;

  // Índice del paso actual
  const currentStepIndex = activeSlot ? (activeSlot.type === 'quotient' ? activeSlot.index : activeSlot.row) : -1;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Dividir">➗</span>{' '}
        <span className="gradient-text">Divisiones (4º)</span>
      </h1>

      <div id="options-area">
        <label className="flex items-center cursor-pointer select-none">
          <span className="mr-3 font-medium text-gray-600">Mostrar ayudas</span>
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={showHelp} onChange={e => setShowHelp(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showHelp ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showHelp ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>

      <div className="division-grid" style={{ gridTemplateColumns: gridTemplateCols }}>
        
        {/* Fila 1: Dividendo */}
        {dividendStr.split('').map((digit, i) => {
          const isHighlighted = showHelp && currentStepIndex === 0 && steps.length > 0 && i <= steps[0].digitIndex;
          
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
          className={`divisor-container ${showHelp && currentStepIndex !== -1 ? 'operand-highlight' : ''}`}
        >
          <span className="divisor-number">{operands.divisor}</span>
        </div>

        {/* Fila 2: Cociente */}
        <div style={{ gridRow: 2, gridColumn: dividendStr.length + 2 }} className="quotient-area">
          {steps.map((step, i) => {
            const prevStepKey = i > 0 ? `${i-1}-${steps[i-1].digitIndex}` : null;
            const isPrevStepFinished = i === 0 || (remainderSlots[prevStepKey] !== undefined && remainderSlots[prevStepKey] !== '');
            if (!isPrevStepFinished) return null;

            return (
              <div 
                key={`q-${i}`} 
                className={getSlotClass('quotient', 0, i, step.quotientDigit, false)}
                onClick={() => setActiveSlot({ type: 'quotient', index: i })}
              >
                {quotientSlots[i]}
              </div>
            );
          })}
        </div>

        {/* Filas: Restos y Bajadas */}
        {steps.map((step, i) => {
          const gridRow = i + 2; 
          const gridCol = step.digitIndex + 1;
          const isQuotientFilled = quotientSlots[i] !== '' && quotientSlots[i] !== undefined;
          const isRemainderFilled = remainderSlots[`${i}-${step.digitIndex}`] !== undefined && remainderSlots[`${i}-${step.digitIndex}`] !== '';
          const isNextStepActive = currentStepIndex === i + 1;

          return (
            <React.Fragment key={`step-${i}`}>
              
              {/* Input Resto */}
              {isQuotientFilled && (
                <div 
                  style={{ gridRow: gridRow, gridColumn: gridCol }}
                  className={getSlotClass('remainder', i, step.digitIndex, step.remainder, showHelp && isNextStepActive)}
                  onClick={() => setActiveSlot({ type: 'remainder', row: i, col: step.digitIndex })}
                >
                  {remainderSlots[`${i}-${step.digitIndex}`]}
                </div>
              )}

              {/* Cifra bajada */}
              {i < steps.length - 1 && isRemainderFilled && (
                <div 
                  className={`digit-display ${showHelp && isNextStepActive ? 'operand-highlight' : ''}`}
                  style={{ gridRow: gridRow, gridColumn: steps[i+1].digitIndex + 1 }}
                >
                  {dividendStr[steps[i+1].digitIndex]}
                  {/* Flecha a la derecha usando la clase CSS arrow-helper */}
                  {showHelp && <span className="arrow-helper">↓</span>}
                </div>
              )}
            </React.Fragment>
          );
        })}

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

export default DivisionesPrimaria4;