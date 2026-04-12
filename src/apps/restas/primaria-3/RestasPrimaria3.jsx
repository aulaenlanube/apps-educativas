import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import InstructionsModal, { InstructionsButton } from '../../_shared/InstructionsModal';

const RestasPrimaria3 = () => {
  // --- Estados del Juego ---
  const [operands, setOperands] = useState({ num1: 0, num2: 0 });
  const [showInstructions, setShowInstructions] = useState(false); 
  const [numDigits, setNumDigits] = useState(3); // 3º Primaria: 3-4 cifras
  
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Generación del Problema (3-4 cifras) ---
  const generateNewProblem = useCallback(() => {
    const digits = Math.floor(Math.random() * 2) + 3; // 3 o 4 cifras
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits);
    
    let n1, n2;
    do {
      n1 = Math.floor(Math.random() * (max - min)) + min;
      n2 = Math.floor(Math.random() * n1);
    } while (n1 === n2);

    setOperands({ num1: n1, num2: n2 });
    setNumDigits(digits);
    
    setResultSlots(new Array(digits).fill(''));
    setCarrySlots(new Array(digits).fill('')); 
    setFeedback({ text: '', className: '' });
    
    // Enfocar automáticamente la última casilla del resultado (unidades)
    setActiveSlot({ type: 'result', index: digits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Lógica de Cálculo y Ayudas ---
  
  const strNum1 = operands.num1.toString().padStart(numDigits, '0');
  const strNum2 = operands.num2.toString().padStart(numDigits, '0');
  const correctResult = (operands.num1 - operands.num2).toString().padStart(numDigits, '0');

  // Lógica de llevadas: Si columna i necesita préstamo, carries[i] = 1.
  const expectedCarries = useMemo(() => {
    const carries = new Array(numDigits).fill(0);
    let currentCarry = 0;
    
    for (let i = numDigits - 1; i >= 0; i--) {
        const val1 = parseInt(strNum1[i]);
        // El sustraendo efectivo incluye la llevada que viene de la derecha
        const val2 = parseInt(strNum2[i]) + currentCarry;
        
        if (val1 < val2) {
            carries[i] = 1; 
            currentCarry = 1; 
        } else {
            carries[i] = 0;
            currentCarry = 0;
        }
    }
    return carries;
  }, [numDigits, strNum1, strNum2]);

  // Cálculo visual del sustraendo (número de abajo)
  // Aumenta si la columna de la derecha (i+1) tiene una llevada marcada
  const getVisualSubtrahendDigit = (index) => {
    const baseVal = parseInt(strNum2[index]);
    const rightCarryIndex = index + 1;
    const userHasCarryFromRight = rightCarryIndex < numDigits && carrySlots[rightCarryIndex] === '1';
    
    if (!showHelp) return baseVal;
    
    return userHasCarryFromRight ? (baseVal + 1) % 10 : baseVal; 
  };

  // --- Manejadores de Interacción ---

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();

    if (activeSlot.type === 'result') {
      const newResults = [...resultSlots];
      newResults[activeSlot.index] = strVal;
      setResultSlots(newResults);

      // --- Auto-completar Llevada ---
      if (strVal === correctResult[activeSlot.index] && showHelp) {
        const newCarries = [...carrySlots];
        
        if (expectedCarries[activeSlot.index] === 1) {
            newCarries[activeSlot.index] = '1';
        } else {
            // Ponemos '0' explícito si no hay llevada
            newCarries[activeSlot.index] = '0'; 
        }
        setCarrySlots(newCarries);
      }

      // Auto-avance a la izquierda
      const nextIdx = activeSlot.index - 1;
      if (nextIdx >= 0) {
        setActiveSlot({ type: 'result', index: nextIdx });
      } else {
        setActiveSlot(null); 
      }

    } else if (activeSlot.type === 'carry') {
      const newCarries = [...carrySlots];
      // Toggle simple para llevadas manuales: 1 o vacío/0
      newCarries[activeSlot.index] = strVal === '0' ? '' : strVal;
      setCarrySlots(newCarries);
      setActiveSlot(null); 
    }
  };

  const checkAnswer = () => {
    const userStr = resultSlots.map(s => s || '0').join('');
    const userNum = parseInt(userStr);
    const correctNum = operands.num1 - operands.num2;
    
    let isCorrect = (userNum === correctNum);
    let allCarriesCorrect = true;

    if (showHelp) {
        allCarriesCorrect = expectedCarries.every((val, i) => {
            if (i === 0) return true; // Ignorar columna más a la izquierda
            const userVal = carrySlots[i] === '1' ? 1 : 0;
            return val === userVal;
        });
    }

    if (isCorrect) {
        if (!showHelp || allCarriesCorrect) {
            setFeedback({ text: '¡Perfecto! ¡Resta correcta! ✅', className: 'feedback-correct' });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setActiveSlot(null);
        } else {
            setFeedback({ text: 'El resultado es correcto, pero revisa las llevadas 🔴', className: 'feedback-incorrect' });
        }
    } else {
        setFeedback({ text: '¡Ups! Revisa los números en rojo ❌', className: 'feedback-incorrect' });
    }
  };

  // UI Grid styles
  const columnTemplate = "25px 60px "; 
  const gridStyle = {
    display: 'inline-grid',
    justifyItems: 'center',
    alignItems: 'center',
    gridGap: '5px 0',
    gridTemplateRows: '60px 60px 12px 60px',
    gridTemplateColumns: `35px ${columnTemplate.repeat(numDigits)}`
  };

  return (
    <div id="app-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
          <span role="img" aria-label="Resta">📝</span>{' '}
          <span className="gradient-text">Restas de 3 y 4 cifras</span>
        </h1>
        <InstructionsButton onClick={() => setShowInstructions(true)} />
      </div>

      <div id="options-area" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 500, color: 'var(--app-text-secondary)', fontSize: '0.95em' }}>Ayuda con llevadas</span>
        <div
          onClick={() => setShowHelp(v => !v)}
          style={{
            width: 52, height: 28, borderRadius: 14, cursor: 'pointer',
            background: showHelp ? '#2563eb' : '#cbd5e1',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: 'white',
            position: 'absolute', top: 3,
            left: showHelp ? 27 : 3,
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>

      <div id="problem-area" style={gridStyle}>
        
        <div className="operator" style={{ gridRow: '2', gridColumn: '1' }}>-</div>
        <hr className="operation-line" style={{ gridRow: '3', gridColumn: `2 / ${2 + numDigits * 2}` }} />

        {Array.from({ length: numDigits }).map((_, i) => {
            const circleCol = 2 + i * 2; 
            const digitCol = 3 + i * 2;  
            
            const isResultFilled = resultSlots[i] !== '';
            const isResultCorrect = resultSlots[i] === correctResult[i];
            const resultClass = feedback.text && isResultFilled 
                ? (isResultCorrect ? 'correct' : 'incorrect') 
                : '';

            const isCarryFilled = carrySlots[i] === '1';
            const isCarryCorrect = expectedCarries[i] === 1;
            const carryBoxClass = (feedback.text && showHelp && i !== 0) 
                ? (isCarryFilled === isCarryCorrect ? (isCarryFilled ? 'correct' : '') : 'incorrect')
                : '';

            return (
                <React.Fragment key={i}>
                    {/* Círculo de Llevada */}
                    {i !== 0 && (
                        <div 
                            className={`borrow-helper-box ${carryBoxClass} ${activeSlot?.type === 'carry' && activeSlot?.index === i ? 'drag-over' : ''}`}
                            style={{
                                gridRow: '1',
                                gridColumn: String(circleCol),
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

                    {/* Minuendo (Arriba) */}
                    <div className="digit-display" style={{ gridRow: '1', gridColumn: String(digitCol) }}>
                        {strNum1[i]}
                    </div>

                    {/* Sustraendo (Abajo) */}
                    <div 
                        className={`digit-display subtrahend-digit ${getVisualSubtrahendDigit(i) !== parseInt(strNum2[i]) ? 'modified-digit' : ''}`} 
                        style={{ gridRow: '2', gridColumn: String(digitCol) }}
                    >
                        {getVisualSubtrahendDigit(i)}
                    </div>

                    {/* Resultado */}
                    <div 
                        className={`box result-box ${resultClass} ${activeSlot?.type === 'result' && activeSlot?.index === i ? 'selected' : ''}`}
                        style={{ gridRow: '4', gridColumn: String(digitCol), cursor: 'pointer' }}
                        onClick={() => setActiveSlot({ type: 'result', index: i })}
                    >
                        {resultSlots[i]}
                    </div>
                </React.Fragment>
            );
        })}

      </div>

      <div id="feedback-message" className={feedback.className}>{feedback.text}</div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>Comprobar</button>
        <button id="new-problem-button" onClick={generateNewProblem}>Nueva Resta</button>
      </div>

      <div id="number-palette">
        <h2>Toca los números 👇</h2>
        <div className="number-tiles-container">
          {[...Array(10).keys()].map((n) => (
            <div
              key={n}
              className="number-tile"
              onClick={() => handlePaletteClick(n)}
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData("text/plain", n.toString())}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Como jugar: Restas de 3 y 4 cifras">
        <h3>Objetivo</h3>
        <p>Completa la resta colocando los digitos correctos en cada casilla vacia.</p>
        <h3>Como se juega</h3>
        <ul>
          <li>Pulsa en una casilla vacia para seleccionarla.</li>
          <li>Luego pulsa un numero de la paleta inferior para colocarlo.</li>
          <li>Tambien puedes arrastrar los numeros a las casillas.</li>
          <li>Fijate en las llevadas si estan activadas.</li>
        </ul>
        <h3>Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Practica Libre</strong> — Resuelve restas sin limite de tiempo.</div>
          <div className="instr-mode exam"><strong>Test</strong> — Responde varias restas y obten tu puntuacion.</div>
        </div>
      </InstructionsModal>
    </div>
  );
};

export default RestasPrimaria3;