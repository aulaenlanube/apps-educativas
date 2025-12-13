import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import '/src/apps/_shared/Restas.css';

const RestasPrimaria6 = () => {
  // --- Estados ---
  const [problemData, setProblemData] = useState({
    num1: 0,
    num2: 0,
    result: 0,
    hiddenPart: 'subtrahend', // 'minuend' (arriba) o 'subtrahend' (abajo)
  });

  const [structure, setStructure] = useState({
    maxIntDigits: 0,
    maxDecimalPlaces: 0,
    totalDigits: 0,
    // Strings formateados para pintar
    n1Str: '',
    n2Str: '',
    resStr: ''
  });

  // Array de inputs del usuario
  const [userSlots, setUserSlots] = useState([]);
  
  const [feedback, setFeedback] = useState({ text: '', className: '' });
  const [activeSlot, setActiveSlot] = useState(null); // { index: number }

  // --- Generación del Problema ---
  const generateNewProblem = useCallback(() => {
    const hiddenPart = Math.random() < 0.5 ? 'minuend' : 'subtrahend';

    // Generación idéntica a tu lógica original (1-2 enteros, 1-3 decimales)
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
    if (parseFloat(num2Raw) >= num1) {
        num2Raw = (num1 * 0.9).toFixed(num2DecimalPlaces);
    }
    const num2 = parseFloat(num2Raw);
    const result = num1 - num2;

    // Formateo para alinear decimales
    const [n1IntStr, n1DecStr = ''] = num1.toString().split('.');
    const [n2IntStr, n2DecStr = ''] = num2.toString().split('.');
    // El resultado puede tener más decimales o enteros según la operación
    const [resIntStr, resDecStr = ''] = result.toFixed(Math.max(n1DecStr.length, n2DecStr.length)).split('.');

    const maxIntDigits = Math.max(n1IntStr.length, n2IntStr.length, resIntStr.length);
    const maxDecimalPlaces = Math.max(n1DecStr.length, n2DecStr.length, resDecStr.length);
    const totalDigits = maxIntDigits + maxDecimalPlaces;

    // Función auxiliar para paddear
    const formatNum = (intStr, decStr) => {
        return intStr.padStart(maxIntDigits, '0') + decStr.padEnd(maxDecimalPlaces, '0');
    }

    const n1Str = formatNum(n1IntStr, n1DecStr);
    const n2Str = formatNum(n2IntStr, n2DecStr);
    // Para el resultado usamos toFixed para asegurar redondeo correcto visual
    const [rInt, rDec = ''] = result.toFixed(maxDecimalPlaces).split('.');
    const resStr = formatNum(rInt, rDec);

    setProblemData({ num1, num2, result, hiddenPart });
    setStructure({ maxIntDigits, maxDecimalPlaces, totalDigits, n1Str, n2Str, resStr });
    
    // Reiniciamos inputs
    setUserSlots(new Array(totalDigits).fill(''));
    setFeedback({ text: '', className: '' });
    
    // Auto-foco en la última cifra (derecha)
    setActiveSlot({ index: totalDigits - 1 });

  }, []);

  useEffect(() => { generateNewProblem(); }, [generateNewProblem]);

  // --- Manejadores ---

  const handlePaletteClick = (val) => {
    if (!activeSlot) return;
    const strVal = val.toString();

    // Actualizar el slot activo
    const newSlots = [...userSlots];
    newSlots[activeSlot.index] = strVal;
    setUserSlots(newSlots);

    // Auto-avance hacia la izquierda
    const nextIdx = activeSlot.index - 1;
    if (nextIdx >= 0) {
      setActiveSlot({ index: nextIdx });
    } else {
      setActiveSlot(null); // Terminado
    }
  };

  const checkAnswer = () => {
    // Reconstruir el número del usuario respetando la posición de la coma
    const rawUserStr = userSlots.map(s => s || '0').join('');
    // Insertamos el punto decimal en la posición correcta (después de maxIntDigits)
    const userStrWithDot = rawUserStr.slice(0, structure.maxIntDigits) + '.' + rawUserStr.slice(structure.maxIntDigits);
    const userNum = parseFloat(userStrWithDot);

    let correctAnswer = 0;
    let targetStr = '';

    if (problemData.hiddenPart === 'minuend') {
        correctAnswer = problemData.num1;
        targetStr = structure.n1Str;
    } else {
        correctAnswer = problemData.num2;
        targetStr = structure.n2Str;
    }

    // Comprobación numérica con tolerancia pequeña para decimales
    const isCorrect = Math.abs(userNum - correctAnswer) < 0.001;

    // Validación visual (rojo/verde) casilla a casilla
    // Comparamos contra el string formateado original (targetStr)
    // Nota: targetStr tiene el padding completo.
    
    if (isCorrect) {
        setFeedback({ text: '¡Correcto! Has encontrado el número que faltaba. ✅', className: 'feedback-correct' });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setActiveSlot(null);
    } else {
        setFeedback({ text: '¡Ups! Ese no es el número correcto. Inténtalo de nuevo. ❌', className: 'feedback-incorrect' });
    }
  };

  // --- Renderizado Grid Dinámico ---
  const columnTemplate = "60px "; // Usamos columnas más anchas al no haber círculos de llevada aquí
  let gridColumnsCSS = "35px "; // Operador
  for(let i=0; i < structure.maxIntDigits; i++) gridColumnsCSS += columnTemplate;
  if(structure.maxDecimalPlaces > 0) gridColumnsCSS += "35px "; // Comma
  for(let i=0; i < structure.maxDecimalPlaces; i++) gridColumnsCSS += columnTemplate;

  return (
    <div id="app-container">
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
        <span role="img" aria-label="Resta">📝</span>{' '}
        <span className="gradient-text">Completa la resta</span>
      </h1>

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
        <div className="operator" style={{ gridRow: '2', gridColumn: '1' }}>-</div>
        
        {/* Línea horizontal que abarca todo */}
        <hr className="operation-line" style={{ gridRow: '3', gridColumn: `2 / span ${structure.totalDigits + (structure.maxDecimalPlaces > 0 ? 1 : 0)}` }} />

        {(() => {
            const elements = [];
            let currentGridCol = 2;

            for (let i = 0; i < structure.totalDigits; i++) {
                // Insertar Coma
                if (i === structure.maxIntDigits && structure.maxDecimalPlaces > 0) {
                    elements.push(
                        <React.Fragment key="comma">
                            <div className="digit-display" style={{ gridRow: '1', gridColumn: currentGridCol }}>{structure.n1Str ? '' : ','}</div>
                            <div className="digit-display" style={{ gridRow: '2', gridColumn: currentGridCol }}>,</div>
                            <div className="digit-display" style={{ gridRow: '4', gridColumn: currentGridCol }}>,</div>
                        </React.Fragment>
                    );
                    currentGridCol++;
                }

                // Determinamos qué mostramos en cada fila
                const showInput = (
                    (problemData.hiddenPart === 'minuend' && 'row1') || 
                    (problemData.hiddenPart === 'subtrahend' && 'row2')
                );

                // --- Fila 1 (Minuendo) ---
                if (showInput === 'row1') {
                    // Input Usuario
                    const targetChar = structure.n1Str[i];
                    const isFilled = userSlots[i] !== '';
                    const isCorrectDigit = userSlots[i] === targetChar;
                    const cellClass = feedback.text && isFilled ? (isCorrectDigit ? 'correct' : 'incorrect') : '';
                    
                    elements.push(
                        <div 
                            key={`input-${i}`}
                            className={`box result-box ${cellClass} ${activeSlot?.index === i ? 'selected' : ''}`}
                            style={{ gridRow: '1', gridColumn: String(currentGridCol), cursor: 'pointer' }}
                            onClick={() => setActiveSlot({ index: i })}
                        >
                            {userSlots[i]}
                        </div>
                    );
                } else {
                    // Número fijo
                    elements.push(
                        <div key={`n1-${i}`} className="digit-display" style={{ gridRow: '1', gridColumn: String(currentGridCol) }}>
                            {structure.n1Str[i]}
                        </div>
                    );
                }

                // --- Fila 2 (Sustraendo) ---
                if (showInput === 'row2') {
                    // Input Usuario
                    const targetChar = structure.n2Str[i];
                    const isFilled = userSlots[i] !== '';
                    const isCorrectDigit = userSlots[i] === targetChar;
                    const cellClass = feedback.text && isFilled ? (isCorrectDigit ? 'correct' : 'incorrect') : '';

                    elements.push(
                        <div 
                            key={`input-${i}`}
                            className={`box result-box ${cellClass} ${activeSlot?.index === i ? 'selected' : ''}`}
                            style={{ gridRow: '2', gridColumn: String(currentGridCol), cursor: 'pointer' }}
                            onClick={() => setActiveSlot({ index: i })}
                        >
                            {userSlots[i]}
                        </div>
                    );
                } else {
                    // Número fijo
                    elements.push(
                        <div key={`n2-${i}`} className="digit-display" style={{ gridRow: '2', gridColumn: String(currentGridCol) }}>
                            {structure.n2Str[i]}
                        </div>
                    );
                }

                // --- Fila 4 (Resultado - Siempre visible) ---
                elements.push(
                    <div key={`res-${i}`} className="digit-display" style={{ gridRow: '4', gridColumn: String(currentGridCol) }}>
                        {structure.resStr[i]}
                    </div>
                );

                currentGridCol++;
            }
            return elements;
        })()}

      </div>

      <div id="feedback-message" className={`mb-4 ${feedback.className}`}>{feedback.text}</div>

      <div id="controls">
        <button id="check-button" onClick={checkAnswer}>Comprobar</button>
        <button id="new-problem-button" onClick={generateNewProblem}>Nuevo Problema</button>
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

export default RestasPrimaria6;