import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import MathOperationLayout from '../../_shared/MathOperationLayout';

const RestasPrimaria6 = () => {
  const [problemData, setProblemData] = useState({ num1: 0, num2: 0, result: 0, hiddenPart: 'subtrahend' });
  const [structure, setStructure] = useState({ maxIntDigits: 0, maxDecimalPlaces: 0, totalDigits: 0, n1Str: '', n2Str: '', resStr: '' });
  const [userSlots, setUserSlots] = useState([]);
  const [feedback, setFeedback] = useState({ text: '', cls: '' });
  const [activeSlot, setActiveSlot] = useState(null);

  const generateNewProblem = useCallback(() => {
    const hiddenPart = Math.random() < 0.5 ? 'minuend' : 'subtrahend';
    const num1IntDigits = Math.floor(Math.random() * 2) + 1;
    const num1DecimalPlaces = Math.floor(Math.random() * 3) + 1;
    const num1TotalDigits = num1IntDigits + num1DecimalPlaces;
    const num1Factor = Math.pow(10, num1DecimalPlaces);
    const num1Min = Math.pow(10, num1TotalDigits - 1);
    const num1Max = Math.pow(10, num1TotalDigits);
    const num1Int = Math.floor(Math.random() * (num1Max - num1Min)) + num1Min;
    const num1 = num1Int / num1Factor;

    const num2DecimalPlaces = Math.floor(Math.random() * 3) + 1;
    let num2Raw = (Math.random() * num1).toFixed(num2DecimalPlaces);
    if (parseFloat(num2Raw) >= num1) num2Raw = (num1 * 0.9).toFixed(num2DecimalPlaces);
    const num2 = parseFloat(num2Raw);
    const result = num1 - num2;

    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');
    const [resIntStr, resDecStr = ''] = result.toFixed(Math.max(n1DecStr.length, n2DecStr.length)).split('.');

    const maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length, resIntStr.length);
    const maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length, resDecStr.length);
    const totalDigits = maxIntDigits + maxDecimalPlaces;

    const formatNum = (intStr, decStr) => intStr.padStart(maxIntDigits, '0') + decStr.padEnd(maxDecimalPlaces, '0');
    const n1Str = formatNum(n1IntStr, n1DecStr);
    const n2Str = formatNum(n2IntStr, n2DecStr);
    const [rInt, rDec = ''] = result.toFixed(maxDecimalPlaces).split('.');
    const resStr = formatNum(rInt, rDec);

    setProblemData({ num1, num2, result, hiddenPart });
    setStructure({ maxIntDigits, maxDecimalPlaces, totalDigits, n1Str, n2Str, resStr });
    setUserSlots(new Array(totalDigits).fill(''));
    setFeedback({ text: '', cls: '' });
    setActiveSlot({ index: totalDigits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const newSlots = [...userSlots];
    newSlots[activeSlot.index] = val.toString();
    setUserSlots(newSlots);
    const nextIdx = activeSlot.index - 1;
    if (nextIdx >= 0) setActiveSlot({ index: nextIdx });
    else setActiveSlot(null);
  };

  const checkAnswer = () => {
    const rawUserStr = userSlots.map(s => s || '0').join('');
    const userStrWithDot = rawUserStr.slice(0, structure.maxIntDigits) + '.' + rawUserStr.slice(structure.maxIntDigits);
    const userNum = parseFloat(userStrWithDot);
    const correctAnswer = problemData.hiddenPart === 'minuend' ? problemData.num1 : problemData.num2;
    const isCorrect = Math.abs(userNum - correctAnswer) < 0.001;

    if (isCorrect) {
      setFeedback({ text: '¡Correcto! Has encontrado el número que faltaba. ✅', cls: 'feedback-correct' });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setActiveSlot(null);
    } else {
      setFeedback({ text: '¡Ups! Ese no es el número correcto. Inténtalo de nuevo. ❌', cls: 'feedback-incorrect' });
    }
  };

  const columnTemplate = "60px ";
  let gridColumnsCSS = "35px ";
  for (let i = 0; i < structure.maxIntDigits; i++) gridColumnsCSS += columnTemplate;
  if (structure.maxDecimalPlaces > 0) gridColumnsCSS += "35px ";
  for (let i = 0; i < structure.maxDecimalPlaces; i++) gridColumnsCSS += columnTemplate;

  return (
    <MathOperationLayout
      title="Completa la resta"
      emoji="📝"
      feedback={feedback}
      onCheck={checkAnswer}
      onNew={generateNewProblem}
      newLabel="Nuevo Problema"
      onPaletteClick={handlePaletteClick}
      paletteLabel="Toca los números 👇"
      instructions={
        <>
          <h3>Objetivo</h3>
          <p>Encuentra el numero que falta en la resta: puede ser el minuendo (arriba) o el sustraendo (abajo).</p>
          <h3>Como se juega</h3>
          <ul>
            <li>Pulsa en una casilla vacia para seleccionarla.</li>
            <li>Luego pulsa un numero de la paleta inferior para colocarlo.</li>
            <li>Observa el resultado (siempre visible) para deducir el numero correcto.</li>
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
        <hr className="operation-line" style={{ gridRow: '3', gridColumn: `2 / span ${structure.totalDigits + (structure.maxDecimalPlaces > 0 ? 1 : 0)}` }} />

        {(() => {
          const elements = [];
          let currentGridCol = 2;
          const targetStr = problemData.hiddenPart === 'minuend' ? structure.n1Str : structure.n2Str;
          const showInput = problemData.hiddenPart === 'minuend' ? 'row1' : 'row2';

          for (let i = 0; i < structure.totalDigits; i++) {
            if (i === structure.maxIntDigits && structure.maxDecimalPlaces > 0) {
              elements.push(
                <React.Fragment key="comma">
                  <div className="digit-display" style={{ gridRow: '1', gridColumn: currentGridCol }}>{showInput === 'row1' ? '' : ','}</div>
                  <div className="digit-display" style={{ gridRow: '2', gridColumn: currentGridCol }}>,</div>
                  <div className="digit-display" style={{ gridRow: '4', gridColumn: currentGridCol }}>,</div>
                </React.Fragment>
              );
              currentGridCol++;
            }

            // Fila 1 (Minuendo)
            if (showInput === 'row1') {
              const isFilled = userSlots[i] !== '';
              const isCorrectDigit = userSlots[i] === targetStr[i];
              const cellClass = feedback.text && isFilled ? (isCorrectDigit ? 'correct' : 'incorrect') : '';
              elements.push(
                <div key={`input-${i}`}
                  className={`box result-box ${cellClass} ${activeSlot?.index === i ? 'selected' : ''}`}
                  style={{ gridRow: '1', gridColumn: String(currentGridCol), cursor: 'pointer' }}
                  onClick={() => setActiveSlot({ index: i })}
                >{userSlots[i]}</div>
              );
            } else {
              elements.push(
                <div key={`n1-${i}`} className="digit-display" style={{ gridRow: '1', gridColumn: String(currentGridCol) }}>{structure.n1Str[i]}</div>
              );
            }

            // Fila 2 (Sustraendo)
            if (showInput === 'row2') {
              const isFilled = userSlots[i] !== '';
              const isCorrectDigit = userSlots[i] === targetStr[i];
              const cellClass = feedback.text && isFilled ? (isCorrectDigit ? 'correct' : 'incorrect') : '';
              elements.push(
                <div key={`input2-${i}`}
                  className={`box result-box ${cellClass} ${activeSlot?.index === i ? 'selected' : ''}`}
                  style={{ gridRow: '2', gridColumn: String(currentGridCol), cursor: 'pointer' }}
                  onClick={() => setActiveSlot({ index: i })}
                >{userSlots[i]}</div>
              );
            } else {
              elements.push(
                <div key={`n2-${i}`} className="digit-display" style={{ gridRow: '2', gridColumn: String(currentGridCol) }}>{structure.n2Str[i]}</div>
              );
            }

            // Fila 4 (Resultado - siempre visible)
            elements.push(
              <div key={`res-${i}`} className="digit-display" style={{ gridRow: '4', gridColumn: String(currentGridCol) }}>{structure.resStr[i]}</div>
            );
            currentGridCol++;
          }
          return elements;
        })()}
      </div>
    </MathOperationLayout>
  );
};

export default RestasPrimaria6;
