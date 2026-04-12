import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';

const RestasPrimaria5 = () => {
  const [operands, setOperands] = useState({ num1: 0, num2: 0 });
  const [structure, setStructure] = useState({ maxIntDigits: 0, maxDecimalPlaces: 0, totalDigits: 0 });
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

  const generateNewProblem = useCallback(() => {
    const num1IntDigits = Math.floor(Math.random() * 2) + 2;
    const num1DecimalPlaces = Math.floor(Math.random() * 2) + 2;
    const num1TotalDigits = num1IntDigits + num1DecimalPlaces;
    const num1Factor = Math.pow(10, num1DecimalPlaces);
    const num1Min = Math.pow(10, num1TotalDigits - 1);
    const num1Max = Math.pow(10, num1TotalDigits);
    const num1Int = Math.floor(Math.random() * (num1Max - num1Min)) + num1Min;
    const num1 = num1Int / num1Factor;

    const num2DecimalPlaces = Math.floor(Math.random() * 2) + 1;
    let num2Raw = (Math.random() * num1).toFixed(num2DecimalPlaces);
    if (parseFloat(num2Raw) >= num1) num2Raw = (num1 * 0.9).toFixed(num2DecimalPlaces);
    const num2 = parseFloat(num2Raw);

    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');
    const maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length);
    const maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length);
    const totalDigits = maxIntDigits + maxDecimalPlaces;

    setOperands({ num1, num2 });
    setStructure({ maxIntDigits, maxDecimalPlaces, totalDigits });
    setResultSlots(new Array(totalDigits).fill(''));
    setCarrySlots(new Array(totalDigits).fill(''));
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ type: 'result', index: totalDigits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  const factor = Math.pow(10, structure.maxDecimalPlaces);

  const n1Padded = useMemo(() => {
    const [int, dec = ''] = operands.num1.toString().split('.');
    return int.padStart(structure.maxIntDigits, '0') + dec.padEnd(structure.maxDecimalPlaces, '0');
  }, [operands.num1, structure]);

  const n2Padded = useMemo(() => {
    const [int, dec = ''] = operands.num2.toString().split('.');
    return int.padStart(structure.maxIntDigits, '0') + dec.padEnd(structure.maxDecimalPlaces, '0');
  }, [operands.num2, structure]);

  const correctResultStr = useMemo(() => {
    const val1 = Math.round(operands.num1 * factor);
    const val2 = Math.round(operands.num2 * factor);
    return (val1 - val2).toString().padStart(structure.totalDigits, '0');
  }, [operands, factor, structure]);

  const expectedCarries = useMemo(() => {
    const carries = new Array(structure.totalDigits).fill(0);
    let currentCarry = 0;
    for (let i = structure.totalDigits - 1; i >= 0; i--) {
      const val1 = parseInt(n1Padded[i]);
      const val2 = parseInt(n2Padded[i]) + currentCarry;
      if (val1 < val2) { carries[i] = 1; currentCarry = 1; }
      else { carries[i] = 0; currentCarry = 0; }
    }
    return carries;
  }, [structure.totalDigits, n1Padded, n2Padded]);

  const getVisualSubtrahendDigit = (index) => {
    const baseVal = parseInt(n2Padded[index]);
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
    const correctInt = Math.round((operands.num1 - operands.num2) * factor);
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
  for (let i = 0; i < structure.maxIntDigits; i++) gridColumnsCSS += columnTemplate;
  if (structure.maxDecimalPlaces > 0) gridColumnsCSS += "35px ";
  for (let i = 0; i < structure.maxDecimalPlaces; i++) gridColumnsCSS += columnTemplate;

  return (
    <MathOperationLayout
      title="Restas con Decimales"
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
            if (i === structure.maxIntDigits && structure.maxDecimalPlaces > 0) {
              elements.push(
                <React.Fragment key="comma">
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
                <div className="digit-display" style={{ gridRow: '1', gridColumn: String(digitGridCol) }}>{n1Padded[i]}</div>
                <div
                  className={`digit-display subtrahend-digit ${getVisualSubtrahendDigit(i) !== parseInt(n2Padded[i]) ? 'modified-digit' : ''}`}
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

export default RestasPrimaria5;
