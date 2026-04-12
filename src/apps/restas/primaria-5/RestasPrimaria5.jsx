import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';
import InstructionsModal, { InstructionsButton } from '../../_shared/InstructionsModal';

const RestasPrimaria5 = () => {
  // --- Estados del Juego ---
  const [operands, setOperands] = useState({ num1: 0, num2: 0 });
  const [showInstructions, setShowInstructions] = useState(false); 
  
  // Estructura dinámica de la rejilla (varía en cada problema)
  const [structure, setStructure] = useState({ 
    maxIntDigits: 0, 
    maxDecimalPlaces: 0, 
    totalDigits: 0 
  });
  
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Generación del Problema (Decimales variables) ---
  const generateNewProblem = useCallback(() => {
    // 1. Generar Num1 (El mayor)
    // Según tu lógica original: 2-3 cifras enteras, 2-3 cifras decimales
    const num1IntDigits = Math.floor(Math.random() * 2) + 2; 
    const num1DecimalPlaces = Math.floor(Math.random() * 2) + 2; 
    const num1TotalDigits = num1IntDigits + num1DecimalPlaces;

    const num1Factor = Math.pow(10, num1DecimalPlaces);
    const num1Min = Math.pow(10, num1TotalDigits - 1);
    const num1Max = Math.pow(10, num1TotalDigits);
    
    // Generamos como entero y dividimos para tener los decimales exactos
    const num1Int = Math.floor(Math.random() * (num1Max - num1Min)) + num1Min;
    const num1 = num1Int / num1Factor;

    // 2. Generar Num2 (El menor)
    // Decimales variables (1-2) para forzar alineación diferente
    const num2DecimalPlaces = Math.floor(Math.random() * 2) + 1; 
    
    // Generamos num2 asegurando que sea menor que num1
    let num2Raw = (Math.random() * num1).toFixed(num2DecimalPlaces);
    // Corrección por si el random sale muy alto (casi igual a num1) y el toFixed redondea hacia arriba
    if (parseFloat(num2Raw) >= num1) {
        num2Raw = (num1 * 0.9).toFixed(num2DecimalPlaces);
    }
    const num2 = parseFloat(num2Raw);

    // 3. Analizar Estructura para la Rejilla
    // Desglosamos strings para ver longitudes reales
    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');

    // Calculamos el "bounding box" de la operación (alineado a la coma)
    const maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length);
    const maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length); // Normalmente será num1DecimalPlaces, pero por seguridad
    const totalDigits = maxIntDigits + maxDecimalPlaces;

    setOperands({ num1, num2 });
    setStructure({ maxIntDigits, maxDecimalPlaces, totalDigits });
    
    // Arrays planos para inputs (sin contar la coma, la coma es visual)
    setResultSlots(new Array(totalDigits).fill(''));
    setCarrySlots(new Array(totalDigits).fill('')); 
    setFeedback({ text: '', className: '' });
    
    // Enfocar automáticamente la última casilla (la más a la derecha de los decimales)
    setActiveSlot({ type: 'result', index: totalDigits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Lógica de Cálculo y Strings Alineados ---
  
  // Factor común para trabajar con enteros (evita errores flotantes)
  const factor = Math.pow(10, structure.maxDecimalPlaces);
  
  // Convertimos a enteros visuales PADDEADOS.
  // Ejemplo: 12.5 - 5.25  (maxDec=2) -> Operamos con 1250 - 0525
  // PadStart para enteros, PadEnd para decimales
  const n1Padded = useMemo(() => {
    const [int, dec = ''] = operands.num1.toString().split('.');
    return int.padStart(structure.maxIntDigits, '0') + dec.padEnd(structure.maxDecimalPlaces, '0');
  }, [operands.num1, structure]);

  const n2Padded = useMemo(() => {
    const [int, dec = ''] = operands.num2.toString().split('.');
    return int.padStart(structure.maxIntDigits, '0') + dec.padEnd(structure.maxDecimalPlaces, '0');
  }, [operands.num2, structure]);

  // Resultado esperado como string plano (sin coma)
  const correctResultStr = useMemo(() => {
    // Cálculo seguro con enteros
    const val1 = Math.round(operands.num1 * factor);
    const val2 = Math.round(operands.num2 * factor);
    const diff = val1 - val2;
    return diff.toString().padStart(structure.totalDigits, '0');
  }, [operands, factor, structure]);

  // Lógica de Llevadas (recorremos el string plano de derecha a izquierda)
  const expectedCarries = useMemo(() => {
    const carries = new Array(structure.totalDigits).fill(0);
    let currentCarry = 0;
    
    for (let i = structure.totalDigits - 1; i >= 0; i--) {
        const val1 = parseInt(n1Padded[i]);
        const val2 = parseInt(n2Padded[i]) + currentCarry;
        
        if (val1 < val2) {
            carries[i] = 1; 
            currentCarry = 1; 
        } else {
            carries[i] = 0;
            currentCarry = 0;
        }
    }
    return carries;
  }, [structure.totalDigits, n1Padded, n2Padded]);

  // Visual Sustraendo: se incrementa si hay llevada a la DERECHA en el array plano
  const getVisualSubtrahendDigit = (index) => {
    const baseVal = parseInt(n2Padded[index]);
    const rightCarryIndex = index + 1;
    const userHasCarryFromRight = rightCarryIndex < structure.totalDigits && carrySlots[rightCarryIndex] === '1';
    
    if (!showHelp) return baseVal;
    return userHasCarryFromRight ? (baseVal + 1) % 10 : baseVal; 
  };

  // --- Manejadores ---

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();

    if (activeSlot.type === 'result') {
      const newResults = [...resultSlots];
      newResults[activeSlot.index] = strVal;
      setResultSlots(newResults);

      // Auto-completar Llevada
      if (strVal === correctResultStr[activeSlot.index] && showHelp) {
        const newCarries = [...carrySlots];
        // Si esta columna requiere llevada...
        if (expectedCarries[activeSlot.index] === 1) {
            newCarries[activeSlot.index] = '1';
        } else {
            // Si no, borramos/ponemos 0
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
      newCarries[activeSlot.index] = strVal === '0' ? '' : strVal;
      setCarrySlots(newCarries);
      setActiveSlot(null); 
    }
  };

  const checkAnswer = () => {
    const userStr = resultSlots.map(s => s || '0').join('');
    const userInt = parseInt(userStr);
    const correctInt = Math.round((operands.num1 - operands.num2) * factor);
    
    let isCorrect = (userInt === correctInt);
    let allCarriesCorrect = true;

    if (showHelp) {
        allCarriesCorrect = expectedCarries.every((val, i) => {
            if (i === 0) return true; // Ignorar primera columna
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

  // --- Renderizado Dinámico de la Rejilla ---
  // Estilo Grid CSS
  const columnTemplate = "25px 60px ";
  let gridColumnsCSS = "35px "; // Espacio para el operador
  for(let i=0; i < structure.maxIntDigits; i++) gridColumnsCSS += columnTemplate;
  if(structure.maxDecimalPlaces > 0) gridColumnsCSS += "35px "; // Espacio Comma
  for(let i=0; i < structure.maxDecimalPlaces; i++) gridColumnsCSS += columnTemplate;

  return (
    <div id="app-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
          <span role="img" aria-label="Resta">📝</span>{' '}
          <span className="gradient-text">Restas con Decimales</span>
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

      <div 
        id="problem-area" 
        style={{
            display: 'inline-grid',
            justifyItems: 'center',
            alignItems: 'center',
            gridGap: '5px 0',
            gridTemplateRows: '60px 60px 12px 60px',
            gridTemplateColumns: gridColumnsCSS
        }}
      >
        
        {/* Operador */}
        <div className="operator" style={{ gridRow: '2', gridColumn: '1' }}>-</div>
        
        {/* Línea Operación */}
        {/* Calculamos span: 1(op) + int*2 + 1(coma) + dec*2 */}
        <hr className="operation-line" style={{ gridRow: '3', gridColumn: `2 / span ${structure.totalDigits * 2 + 1}` }} />

        {/* Renderizado de Dígitos y Coma */}
        {(() => {
            const elements = [];
            let currentGridCol = 2; 

            for (let i = 0; i < structure.totalDigits; i++) {
                
                // Insertar Coma Visual en el Grid si estamos tras los enteros
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
                const resultClass = feedback.text && isResultFilled 
                    ? (isResultCorrect ? 'correct' : 'incorrect') 
                    : '';

                const isCarryFilled = carrySlots[i] === '1';
                const isCarryCorrect = expectedCarries[i] === 1;
                const carryBoxClass = (feedback.text && showHelp && i !== 0) 
                    ? (isCarryFilled === isCarryCorrect ? (isCarryFilled ? 'correct' : '') : 'incorrect')
                    : '';

                elements.push(
                    <React.Fragment key={i}>
                        {/* Círculo de Llevada (omitir en la primera columna absoluta) */}
                        {i !== 0 && (
                            <div 
                                className={`borrow-helper-box ${carryBoxClass} ${activeSlot?.type === 'carry' && activeSlot?.index === i ? 'drag-over' : ''}`}
                                style={{
                                    gridRow: '1',
                                    gridColumn: String(circleGridCol),
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

                        {/* Minuendo */}
                        <div className="digit-display" style={{ gridRow: '1', gridColumn: String(digitGridCol) }}>
                            {n1Padded[i]}
                        </div>

                        {/* Sustraendo (Modificado si llevada) */}
                        <div 
                            className={`digit-display subtrahend-digit ${getVisualSubtrahendDigit(i) !== parseInt(n2Padded[i]) ? 'modified-digit' : ''}`} 
                            style={{ gridRow: '2', gridColumn: String(digitGridCol) }}
                        >
                            {getVisualSubtrahendDigit(i)}
                        </div>

                        {/* Resultado */}
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

      <div id="feedback-message" className={`mb-4 ${feedback.className}`}>{feedback.text}</div>

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
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Como jugar: Restas con Decimales">
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

export default RestasPrimaria5;