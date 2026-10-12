import React, { useMemo } from 'react';
import { OpGrid, OpGuide, OpDigit, OpComma, OpOperator, OpRule, OpSlot, placeOf } from './MathOperationLayout';
import '/src/apps/_shared/MathBoxShared.css';
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
 * Tablero en columnas (suma o resta) sobre la hoja de cuaderno.
 * props:
 * - operator: '+' | '−'
 * - nums: Array de strings/numbers (ej: ['12', '34'] o ['12,5', '3,1'])
 * - resultSlots: Array strings
 * - carrySlots: Array strings
 * - actions: { updateResult, updateCarry, setActiveSlot }
 * - activeSlot: { type, index }
 * - showCarries: bool
 * - validation: { expectedResult (array), expectedCarries (array), firstNonZeroIdx } (Opcional, para pintar rojo/verde)
 * - minIntegerDigits: number (para forzar anchura, ej: 2 o 3 columnas de enteros)
 */
export const ColumnOperationBoard = ({
  operator = '+',
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

  // --- Rejilla: [signo] [columnas…]; filas: valor posicional, llevadas, operandos, raya, resultado ---
  const nOps = plan.rows.length;
  const R_LABEL = 1;
  const R_CARRY = 2;
  const R_OP0 = 3;
  const R_RULE = R_OP0 + nOps;
  const R_RESULT = R_RULE + 1;
  const columns = ['op', ...Array.from({ length: plan.totalCols }, (_, i) => (i === plan.commaIndex ? 'comma' : 'cell'))];
  const rows = ['label', 'carry', ...plan.rows.map(() => 'num'), 'rule', 'result'];

  // Posición de cada columna respecto a la coma (0 = unidades, -1 = décimas…)
  const posOf = (colIdx) => {
    if (plan.commaIndex === -1) return plan.totalCols - 1 - colIdx;
    return colIdx < plan.commaIndex ? plan.commaIndex - 1 - colIdx : -(colIdx - plan.commaIndex);
  };
  // La coma de un operando sin decimales no se escribe (" 123,  " → "123")
  const rowHasDecimals = plan.rows.map((row) => plan.commaIndex !== -1 && row.slice(plan.commaIndex + 1).some((ch) => ch !== ' '));

  const pieces = [];
  let digitCounter = 0;
  for (let colIdx = 0; colIdx < plan.totalCols; colIdx++) {
    const c = colIdx + 2;
    const isComma = colIdx === plan.commaIndex;
    if (isComma) {
      plan.rows.forEach((_, rIdx) => {
        if (rowHasDecimals[rIdx]) pieces.push(<OpComma key={`cm-${rIdx}`} r={R_OP0 + rIdx} c={c} />);
      });
      pieces.push(<OpComma key="cm-res" r={R_RESULT} c={c} />);
      continue;
    }
    const currentDigitIdx = digitCounter;
    digitCounter++;
    const pos = posOf(colIdx);
    const [, placeName] = placeOf(pos);
    const showCarryBox = colIdx !== plan.totalCols - 1;

    pieces.push(<OpGuide key={`g-${colIdx}`} c={c} pos={pos} alt={currentDigitIdx % 2 === 1} labelRow={R_LABEL} />);

    if (showCarryBox) {
      pieces.push(
        <OpSlot
          key={`k-${colIdx}`}
          r={R_CARRY}
          c={c}
          kind="carry"
          value={carrySlots[currentDigitIdx]}
          state={getValidationClass('carry', currentDigitIdx)}
          selected={isSelected('carry', currentDigitIdx)}
          hidden={!showCarries}
          label={`Llevada de las ${placeName.toLowerCase()}`}
          onSelect={(e) => handleClick('carry', currentDigitIdx, e)}
          onDrop={(e) => handleDrop('carry', currentDigitIdx, e)}
        />
      );
    }

    plan.rows.forEach((row, rIdx) => {
      const ch = row[colIdx];
      if (ch && ch !== ' ') pieces.push(<OpDigit key={`d-${rIdx}-${colIdx}`} r={R_OP0 + rIdx} c={c}>{ch}</OpDigit>);
    });

    pieces.push(
      <OpSlot
        key={`r-${colIdx}`}
        r={R_RESULT}
        c={c}
        kind="result"
        value={resultSlots[currentDigitIdx]}
        state={getValidationClass('result', currentDigitIdx)}
        selected={isSelected('result', currentDigitIdx)}
        label={`Resultado: ${placeName.toLowerCase()}`}
        onSelect={(e) => handleClick('result', currentDigitIdx, e)}
        onDrop={(e) => handleDrop('result', currentDigitIdx, e)}
      />
    );
  }

  return (
    <OpGrid
      columns={columns}
      rows={rows}
      label={`Operación: ${nums.join(` ${operator} `)}`}
      className={`opb-grid--${operator === '+' ? 'sum' : 'sub'} ${!showCarries ? 'is-carries-hidden' : ''}`}
    >
      {pieces}
      <OpOperator r={R_OP0 + nOps - 1} symbol={operator} />
      <OpRule r={R_RULE} />
    </OpGrid>
  );
};

/** Tablero Universal de sumas (API original intacta). */
const UniversalSumBoard = (props) => <ColumnOperationBoard operator="+" {...props} />;

export default UniversalSumBoard;
