import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';

const RestasPrimaria4 = () => {
  const [operands, setOperands] = useState({ num1: 0, num2: 0 });
  const [structure, setStructure] = useState({ intDigits: 2, decimalPlaces: 1, totalDigits: 3 });
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

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

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();

    if (activeSlot.type === 'result') {
      const newResults = [...resultSlots];
      newResults[activeSlot.index] = strVal;
      setResultSlots(newResults);

      if (strVal === correctResultStr[activeSlot.index] && showHelp) {
        const newCarries = [...carrySlots];
        newCarries[activeSlot.index] = expectedCarries[activeSlot.index] === 1 ? '1' : '0';
        setCarrySlots(newCarries);
      }

      const nextIdx = activeSlot.index - 1;
      if (nextIdx >= 0) setActiveSlot({ type: 'result', index: nextIdx });
      else setActiveSlot(null);

    } else if (activeSlot.type === 'carry') {
      const newCarries = [...carrySlots];
      newCarries[activeSlot.index] = strVal === '0' ? '' : strVal;
      setCarrySlots(newCarries);
      setActiveSlot(null);
    }
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

  // --- Grid dinámico ---
  const columnTemplate = "25px 60px ";
  let gridColumnsCSS = "35px ";
  for (let i = 0; i < structure.intDigits; i++) gridColumnsCSS += columnTemplate;
  gridColumnsCSS += "35px ";
  for (let i = 0; i < structure.decimalPlaces; i++) gridColumnsCSS += columnTemplate;

  return (
    <MathOperationLayout
      title="Restas con un decimal"
      emoji="📝"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nueva Resta"
      toggleLabel="Ayuda con llevadas"
      toggleValue={showHelp}
      onToggleChange={setShowHelp}
      onPaletteClick={handlePaletteClick}
      paletteLabel="Toca los números 👇"
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Completa la resta colocando los digitos correctos en cada casilla vacia.</p>
          <h3>Como se juega</h3>
          <ul>
            <li>Pulsa en una casilla vacia para seleccionarla.</li>
            <li>Luego pulsa un numero de la paleta inferior para colocarlo.</li>
            <li>Fijate en las llevadas si estan activadas.</li>
          </ul>
        </>
      }
    >
      <div
        id="problem-area"
        style={{
          display: 'inline-grid', justifyItems: 'center', alignItems: 'center',
          gridGap: '5px 0', gridTemplateRows: '60px 60px 12px 60px',
          gridTemplateColumns: gridColumnsCSS
        }}
      >
        <div className="operator" style={{ gridRow: '2', gridColumn: '1' }}>-</div>
        <hr className="operation-line" style={{ gridRow: '3', gridColumn: `2 / span ${structure.totalDigits * 2 + 1}` }} />

        {(() => {
          const elements = [];
          let currentGridCol = 2;

          for (let i = 0; i < structure.totalDigits; i++) {
            if (i === structure.intDigits) {
              elements.push(
                <React.Fragment key="comma">
                  <div className="digit-display" style={{ gridRow: '1', gridColumn: currentGridCol }}></div>
                  <div className="digit-display" style={{ gridRow: '2', gridColumn: currentGridCol }}>,</div>
                  <div className="digit-display" style={{ gridRow: '4', gridColumn: currentGridCol }}>,</div>
                </React.Fragment>
              );
              currentGridCol++;
            }

            const circleGridCol = currentGridCol;
            const digitGridCol = currentGridCol + 1;
            currentGridCol += 2;

            const isResultFilled = resultSlots[i] !== '';
            const isResultCorrect = resultSlots[i] === correctResultStr[i];
            const resultClass = feedback.text && isResultFilled ? (isResultCorrect ? 'correct' : 'incorrect') : '';
            const isCarryFilled = carrySlots[i] === '1';
            const isCarryCorrect = expectedCarries[i] === 1;
            const carryBoxClass = (feedback.text && showHelp && i !== 0)
              ? (isCarryFilled === isCarryCorrect ? (isCarryFilled ? 'correct' : '') : 'incorrect') : '';

            elements.push(
              <React.Fragment key={i}>
                {i !== 0 && (
                  <div
                    className={`borrow-helper-box ${carryBoxClass} ${activeSlot?.type === 'carry' && activeSlot?.index === i ? 'drag-over' : ''}`}
                    style={{
                      gridRow: '1', gridColumn: String(circleGridCol),
                      visibility: showHelp ? 'visible' : 'hidden',
                      width: "40px", height: "40px", borderRadius: "50%",
                      border: "2px dashed #ccc", display: "flex",
                      justifyContent: "center", alignItems: "center",
                      fontSize: "0.8em", color: "#005a9c", marginRight: "-15px",
                      userSelect: "none", cursor: 'pointer',
                      backgroundColor: activeSlot?.type === 'carry' && activeSlot?.index === i ? '#e6f7ff' : 'transparent'
                    }}
                    onClick={() => setActiveSlot({ type: 'carry', index: i })}
                  >
                    {carrySlots[i]}
                  </div>
                )}
                <div className="digit-display" style={{ gridRow: '1', gridColumn: String(digitGridCol) }}>{strNum1[i]}</div>
                <div
                  className={`digit-display subtrahend-digit ${getVisualSubtrahendDigit(i) !== parseInt(strNum2[i]) ? 'modified-digit' : ''}`}
                  style={{ gridRow: '2', gridColumn: String(digitGridCol) }}
                >
                  {getVisualSubtrahendDigit(i)}
                </div>
                <div
                  className={`box result-box ${resultClass} ${activeSlot?.type === 'result' && activeSlot?.index === i ? 'selected' : ''}`}
                  style={{ gridRow: '4', gridColumn: String(digitGridCol), cursor: 'pointer' }}
                  onClick={() => setActiveSlot({ type: 'result', index: i })}
                >
                  {resultSlots[i]}
                </div>
              </React.Fragment>
            );
          }
          return elements;
        })()}
      </div>
    </MathOperationLayout>
  );
};

export default RestasPrimaria4;
