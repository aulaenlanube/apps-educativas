import React, { useMemo } from 'react';
import { buildColumnPlan } from './UniversalSumBoard'; // Reutilizamos la lógica de columnas de sumas
import '/src/apps/_shared/Restas.css'; // Usamos el CSS de restas

/**
 * Tablero Universal para Restas.
 * Misma estructura que SumBoard pero con operador de resta.
 */
const UniversalSubtractionBoard = ({
  nums,
  resultSlots,
  carrySlots,
  actions,
  activeSlot,
  showCarries, // En restas, esto controlará si se ven las cajas de "llevadas" (préstamos)
  validation,
  minIntegerDigits = 2
}) => {
  // Calculamos la estructura visual (reutilizamos la lógica robusta de Sumas)
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
    // Si clicamos el mismo slot activo, lo deseleccionamos, si no, lo activamos
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
    
    // Lógica para ceros a la izquierda en resultado (vacío = correcto si es 0 a la izq)
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
      <div className="operator">-</div>

      {Array.from({ length: plan.totalCols }).map((_, colIdx) => {
        const isComma = colIdx === plan.commaIndex;
        // En restas, las "llevadas" (auxiliares) suelen ir arriba también
        const showCarryBox = !isComma && colIdx !== plan.totalCols - 1;
        
        let currentDigitIdx = null;
        if (!isComma) {
          currentDigitIdx = digitCounter;
          digitCounter++;
        }

        return (
          <div className="column" key={colIdx}>
            {/* Caja de Llevada / Préstamo */}
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

export default UniversalSubtractionBoard;