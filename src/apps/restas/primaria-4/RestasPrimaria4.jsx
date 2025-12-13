import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';

const RestasPrimaria4 = () => {
  // --- Estados del Juego ---
  const [operands, setOperands] = useState({ num1: 0, num2: 0 }); 
  
  // Estructura: Enteros + 1 Decimal
  // intDigits variará (2 o 3), decimalPlaces fijo en 1 (según tu código original)
  const [structure, setStructure] = useState({ intDigits: 2, decimalPlaces: 1, totalDigits: 3 });
  
  // Arrays para inputs (strings). Tratamos todos los dígitos como un array plano continuo.
  const [resultSlots, setResultSlots] = useState([]);
  const [carrySlots, setCarrySlots] = useState([]);
  
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  
  const [activeSlot, setActiveSlot] = useState(null);

  // --- Generación del Problema (con decimales) ---
  const generateNewProblem = useCallback(() => {
    const intDigits = Math.floor(Math.random() * 2) + 1; // 2 o 3 enteros
    const decimalPlaces = 1; 
    const totalDigits = intDigits + decimalPlaces;

    const factor = Math.pow(10, decimalPlaces);
    // Generamos como enteros y luego dividimos
    const min = Math.pow(10, totalDigits - 1);
    const max = Math.pow(10, totalDigits);
    
    let n1Int, n2Int;
    do {
      n1Int = Math.floor(Math.random() * (max - min)) + min;
      n2Int = Math.floor(Math.random() * n1Int); // n2 < n1
    } while (n1Int === n2Int);

    setOperands({ num1: n1Int / factor, num2: n2Int / factor });
    setStructure({ intDigits, decimalPlaces, totalDigits });
    
    setResultSlots(new Array(totalDigits).fill(''));
    setCarrySlots(new Array(totalDigits).fill('')); 
    setFeedback({ text: '', className: '' });
    
    // Enfocar última casilla (la de los decimales, que es la última del array)
    setActiveSlot({ type: 'result', index: totalDigits - 1 });
  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Lógica de Cálculo ---
  
  // Trabajamos con strings de dígitos "planos" (sin coma) para facilitar índices
  // Ej: 45.2 -> "452"
  const factor = Math.pow(10, structure.decimalPlaces);
  // Redondeamos para evitar errores de coma flotante js
  const num1Int = Math.round(operands.num1 * factor);
  const num2Int = Math.round(operands.num2 * factor);
  
  const strNum1 = num1Int.toString().padStart(structure.totalDigits, '0');
  const strNum2 = num2Int.toString().padStart(structure.totalDigits, '0');
  
  const diffInt = num1Int - num2Int;
  const correctResultStr = diffInt.toString().padStart(structure.totalDigits, '0');

  // Lógica de llevadas (igual que enteros, ignorando la posición de la coma)
  const expectedCarries = useMemo(() => {
    const carries = new Array(structure.totalDigits).fill(0);
    let currentCarry = 0;
    
    for (let i = structure.totalDigits - 1; i >= 0; i--) {
        const val1 = parseInt(strNum1[i]);
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
  }, [structure.totalDigits, strNum1, strNum2]);

  // Visual Sustraendo: se incrementa si hay llevada a la DERECHA en el array
  const getVisualSubtrahendDigit = (index) => {
    const baseVal = parseInt(strNum2[index]);
    const rightCarryIndex = index + 1;
    // Miramos si existe una llevada marcada en el índice siguiente del array plano
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

      // Auto-Llevada
      if (strVal === correctResultStr[activeSlot.index] && showHelp) {
        const newCarries = [...carrySlots];
        // Si se necesita llevada en esta columna (representada por el círculo a su izquierda)
        if (expectedCarries[activeSlot.index] === 1) {
            newCarries[activeSlot.index] = '1';
        } else {
            newCarries[activeSlot.index] = '0'; 
        }
        setCarrySlots(newCarries);
      }

      // Auto-focus izquierda
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
    const correctInt = num1Int - num2Int; // comparamos enteros
    
    let isCorrect = (userInt === correctInt);
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
  // Construimos string para gridTemplateColumns
  // Cada dígito usa "25px 60px" (círculo + número)
  // La coma usa "35px"
  const columnTemplate = "25px 60px ";
  let gridColumnsCSS = "35px "; // Espacio operador
  // 1. Columnas de la parte entera
  for(let i=0; i < structure.intDigits; i++) gridColumnsCSS += columnTemplate;
  // 2. Columna de la coma
  gridColumnsCSS += "35px ";
  // 3. Columnas de la parte decimal
  for(let i=0; i < structure.decimalPlaces; i++) gridColumnsCSS += columnTemplate;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Restas con un decimal</span>
      </h1>

      <div id="options-area">
        <label htmlFor="help-toggle">Ayuda con llevadas</label>
        <label className="switch">
          <input
            type="checkbox"
            id="help-toggle"
            checked={showHelp}
            onChange={(e) => setShowHelp(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
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
        {/* span visual: calculamos cuantas columnas ocupa: 1 (op) + digits*2 + 1 (coma) */}
        <hr className="operation-line" style={{ gridRow: '3', gridColumn: `2 / span ${structure.totalDigits * 2 + 1}` }} />

        {/* Renderizado de Dígitos y Comas */}
        {(() => {
            const elements = [];
            // Necesitamos un contador para saber en qué columna del GRID estamos pintando
            // Empezamos en columna 2 (la 1 es el operador)
            let currentGridCol = 2; 

            // Iteramos sobre todos los dígitos (planos)
            for (let i = 0; i < structure.totalDigits; i++) {
                
                // SI hemos llegado a la posición donde va la coma, la pintamos antes del dígito
                // La coma va justo después de los enteros (índice i == intDigits)
                if (i === structure.intDigits) {
                    elements.push(
                        <React.Fragment key="comma">
                            <div className="digit-display" style={{ gridRow: '1', gridColumn: currentGridCol }}></div> {/* Hueco arriba */}
                            <div className="digit-display" style={{ gridRow: '2', gridColumn: currentGridCol }}>,</div>
                            <div className="digit-display" style={{ gridRow: '4', gridColumn: currentGridCol }}>,</div>
                        </React.Fragment>
                    );
                    currentGridCol++; // Avanzamos columna grid por la coma
                }

                const circleGridCol = currentGridCol;     // Columna para el círculo
                const digitGridCol = currentGridCol + 1;  // Columna para el número
                currentGridCol += 2; // Avanzamos 2 huecos para el siguiente loop

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
                        {/* Círculo de Llevada (menos en la primera columna) */}
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
                            {strNum1[i]}
                        </div>

                        {/* Sustraendo (Variable visualmente) */}
                        <div 
                            className={`digit-display subtrahend-digit ${getVisualSubtrahendDigit(i) !== parseInt(strNum2[i]) ? 'modified-digit' : ''}`} 
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
    </div>
  );
};

export default RestasPrimaria4;