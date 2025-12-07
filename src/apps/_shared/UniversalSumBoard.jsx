import React, { useMemo } from 'react';
import '/src/apps/_shared/Sumas.css';

// --- Utilidades de cálculo de columnas (Portadas de P6) ---
const countDecimals = (s) => (s.includes(',') ? s.split(',')[1].length : 0);

// Genera el plan de columnas (dónde va la coma, cuántas columnas de enteros, etc.)
export function buildColumnPlan(nums, minIntegerDigits = 2) {
  const maxDec = Math.max(...nums.map(n => countDecimals(n.toString().replace('.',',')))); // asegurar formato coma
  
  // Columnas totales = Guardia + Enteros + (Coma + Decimales si hay)
  // Calculamos maxIntegerDigits de los números actuales para ajustar el ancho
  const maxInt = Math.max(...nums.map(n => n.toString().split(',')[0].length));
  const effectiveIntegerDigits = Math.max(minIntegerDigits, maxInt);
  
  const totalCols = 1 + effectiveIntegerDigits + (maxDec > 0 ? (1 + maxDec) : 0);

  // Función para padear cada número a la estructura
  const padNumero = (num) => {
    const s = num.toString().replace('.',',');
    const [ent, dec = ''] = s.includes(',') ? s.split(',') : [s, ''];
    const entPad = ent.padStart(effectiveIntegerDigits + 1, ' '); // +1 por guardia
    if (maxDec > 0) {
      const decPad = dec.padEnd(maxDec, ' ');
      return `${entPad},${decPad}`;
    }
    return entPad;
  };

  const rows = nums.map(n => padNumero(n).split(''));
  const commaIndex = maxDec > 0 ? rows[0].indexOf(',') : -1;
  
  // Índices lógicos para mapear los inputs de resultado (saltando la coma)
  const digitIndices = Array.from({ length: totalCols }, (_, i) => i).filter(i => i !== commaIndex);

  return { totalCols, commaIndex, digitIndices, rows, maxDec };
}

/**
 * Tablero Universal.
 * props:
 * - nums: Array de strings/numbers (ej: ['12', '34'] o ['12,5', '3,1'])
 * - resultSlots: Array strings
 * - carrySlots: Array strings
 * - actions: { updateResult, updateCarry, setActiveSlot }
 * - activeSlot: { type, index }
 * - showCarries: bool
 * - validation: { expectedResult (array), expectedCarries (array), firstNonZeroIdx } (Opcional, para pintar rojo/verde)
 * - minIntegerDigits: number (para forzar anchura, ej: 2 o 3 columnas de enteros)
 */
const UniversalSumBoard = ({
  nums,
  resultSlots,
  carrySlots,
  actions,
  activeSlot,
  showCarries,
  validation,
  minIntegerDigits = 2
}) => {
  // Calculamos la estructura visual
  const plan = useMemo(() => buildColumnPlan(nums, minIntegerDigits), [nums, minIntegerDigits]);

  // -- Event Handlers --
  const onDragOver = (e) => e.preventDefault();

  const handleDrop = (type, index, e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!/^\d$/.test(data)) return;
    if (type === 'result') actions.updateResult(index, data);
    if (type === 'carry') actions.updateCarry(index, data);
    actions.setActiveSlot({ type, index });
  };

  const handleClick = (type, index, e) => {
    e.stopPropagation();
    if (activeSlot && activeSlot.type === type && activeSlot.index === index) {
      actions.setActiveSlot(null);
    } else {
      actions.setActiveSlot({ type, index });
    }
  };

  // -- Clases CSS --
  const isSelected = (type, index) => activeSlot?.type === type && activeSlot?.index === index;
  
  const getValidationClass = (type, idx) => {
    if (!validation?.show) return '';
    const userVal = (type === 'result' ? resultSlots[idx] : carrySlots[idx]) || '';
    const expected = (type === 'result' ? validation.expectedResult[idx] : validation.expectedCarries?.[idx])?.toString() || '0';
    
    // Lógica especial para ceros a la izquierda en resultado (vacío = correcto si es 0 a la izq)
    if (type === 'result' && userVal === '' && expected === '0' && 
       (validation.firstNonZeroIdx === -1 || idx < validation.firstNonZeroIdx)) {
      return '';
    }
    // Lógica para llevadas (vacío = 0)
    if (type === 'carry' && userVal === '' && expected === '0') return 'correct';
    
    return userVal === expected ? 'correct' : 'incorrect';
  };

  let digitCounter = 0;

  return (
    <div className={`board ${!showCarries ? 'carries-hidden' : ''}`}>
      <div className="operator">+</div>

      {Array.from({ length: plan.totalCols }).map((_, colIdx) => {
        const isComma = colIdx === plan.commaIndex;
        const showCarryBox = !isComma && colIdx !== plan.totalCols - 1;
        
        let currentDigitIdx = null;
        if (!isComma) {
          currentDigitIdx = digitCounter;
          digitCounter++;
        }

        return (
          <div className="column" key={colIdx}>
            {/* Caja de Llevada */}
            {showCarryBox ? (
              <div
                className={`box carry-box ${getValidationClass('carry', currentDigitIdx)} ${isSelected('carry', currentDigitIdx) ? 'selected' : ''}`}
                onDragOver={onDragOver}
                onDrop={(e) => handleDrop('carry', currentDigitIdx, e)}
                onClick={(e) => handleClick('carry', currentDigitIdx, e)}
              >
                {carrySlots[currentDigitIdx]}
              </div>
            ) : (
              <div className="carry-placeholder" />
            )}

            {/* Filas de números (operandos) */}
            {plan.rows.map((row, rIdx) => (
              <div className="digit-display" key={rIdx}>{row[colIdx] ?? ' '}</div>
            ))}

            <hr className="operation-line" />

            {/* Caja de Resultado o Coma */}
            {isComma ? (
              <div className="box comma-box"><span>,</span></div>
            ) : (
              <div
                className={`box result-box ${getValidationClass('result', currentDigitIdx)} ${isSelected('result', currentDigitIdx) ? 'selected' : ''}`}
                onDragOver={onDragOver}
                onDrop={(e) => handleDrop('result', currentDigitIdx, e)}
                onClick={(e) => handleClick('result', currentDigitIdx, e)}
              >
                {resultSlots[currentDigitIdx]}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="operator-spacer" />
    </div>
  );
};

export default UniversalSumBoard;
