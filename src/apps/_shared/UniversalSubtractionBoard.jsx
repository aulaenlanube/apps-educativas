import React from 'react';
import { ColumnOperationBoard } from './UniversalSumBoard'; // Misma rejilla y lógica de columnas que las sumas
import { OpGrid, OpGuide, OpDigit, OpComma, OpOperator, OpRule, OpSlot, placeOf } from './MathOperationLayout';
import '/src/apps/_shared/MathBoxShared.css';
import '/src/apps/_shared/Restas.css';

/**
 * Tablero Universal para Restas (1º): misma estructura que el de sumas con el
 * signo de restar. API original intacta.
 */
const UniversalSubtractionBoard = (props) => <ColumnOperationBoard operator="−" {...props} />;

/**
 * Ceros a la izquierda: en el cuaderno no se escriben ("07" → "7"). Devuelve,
 * por cifra, si se pinta. Nunca oculta las unidades ni una cifra modificada
 * por una llevada. Solo presentación.
 */
export function hideLeadingZeros(digits, intDigits) {
  let leading = true;
  return digits.map((d, i) => {
    const isZero = String(d?.value) === '0' && !d?.modified;
    if (leading && isZero && i < intDigits - 1) return false;
    leading = false;
    return true;
  });
}

/**
 * Tablero de resta con préstamo ("me llevo una") para 2º-5º.
 * Solo presentación: cada app calcula valores y estados y los pasa aquí.
 *
 * props:
 * - top           : string con las cifras del minuendo (sin coma), una por columna
 * - bottom        : [{ value, modified }] cifras del sustraendo (modified = +1 por llevada)
 * - intDigits     : nº de cifras enteras (la coma va antes de la cifra intDigits)
 * - decimals      : nº de cifras decimales (0 = sin coma)
 * - showTopComma  : pinta también la coma en el minuendo (por defecto true)
 * - resultSlots, carrySlots : arrays de strings
 * - resultState(i), carryState(i) : '' | 'correct' | 'incorrect'
 * - activeSlot    : { type: 'result' | 'carry', index }
 * - onSelect(slot): tocar una casilla
 * - onDropDigit(slot, digit): soltar un número arrastrado sobre una casilla (opcional)
 * - showHelp      : muestra las burbujas de préstamo
 */
export function BorrowSubtractionBoard({
  top, bottom, intDigits, decimals = 0, showTopComma = true,
  resultSlots, carrySlots, resultState, carryState, activeSlot, onSelect, onDropDigit, showHelp,
}) {
  const total = top.length;
  const topShown = hideLeadingZeros(top.split('').map((v) => ({ value: v })), intDigits);
  const bottomShown = hideLeadingZeros(bottom, intDigits);
  const dropOn = (slot) => (onDropDigit ? (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (/^\d$/.test(data)) onDropDigit(slot, Number(data));
  } : undefined);
  const R_LABEL = 1;
  const R_TOP = 2;
  const R_BOTTOM = 3;
  const R_RULE = 4;
  const R_RESULT = 5;

  const columns = ['op'];
  const pieces = [];
  let col = 2;
  for (let i = 0; i < total; i++) {
    if (decimals > 0 && i === intDigits) {
      columns.push('comma');
      if (showTopComma) pieces.push(<OpComma key="cm-t" r={R_TOP} c={col} />);
      pieces.push(<OpComma key="cm-b" r={R_BOTTOM} c={col} />);
      pieces.push(<OpComma key="cm-r" r={R_RESULT} c={col} />);
      col++;
    }
    const gapCol = col;
    const cellCol = col + 1;
    columns.push('gap', 'cell');
    col += 2;

    const pos = i < intDigits ? intDigits - 1 - i : -(i - intDigits + 1);
    const [, placeName] = placeOf(pos);
    pieces.push(<OpGuide key={`g-${i}`} c={cellCol} pos={pos} alt={i % 2 === 1} labelRow={R_LABEL} />);

    if (i !== 0) {
      pieces.push(
        <OpSlot
          key={`b-${i}`}
          r={R_TOP}
          c={gapCol}
          kind="borrow"
          className="opb-borrow"
          value={carrySlots[i]}
          state={carryState(i)}
          selected={activeSlot?.type === 'carry' && activeSlot?.index === i}
          hidden={!showHelp}
          label={`Llevada en las ${placeName.toLowerCase()}`}
          onSelect={() => onSelect({ type: 'carry', index: i })}
          onDrop={dropOn({ type: 'carry', index: i })}
        />
      );
    }
    if (topShown[i]) pieces.push(<OpDigit key={`t-${i}`} r={R_TOP} c={cellCol}>{top[i]}</OpDigit>);
    if (bottomShown[i]) {
      pieces.push(
        <OpDigit key={`s-${i}`} r={R_BOTTOM} c={cellCol} modified={bottom[i]?.modified}>{bottom[i]?.value}</OpDigit>
      );
    }
    pieces.push(
      <OpSlot
        key={`r-${i}`}
        r={R_RESULT}
        c={cellCol}
        kind="result"
        value={resultSlots[i]}
        state={resultState(i)}
        selected={activeSlot?.type === 'result' && activeSlot?.index === i}
        label={`Resultado: ${placeName.toLowerCase()}`}
        onSelect={() => onSelect({ type: 'result', index: i })}
        onDrop={dropOn({ type: 'result', index: i })}
      />
    );
  }

  return (
    <OpGrid columns={columns} rows={['label', 'num', 'num', 'rule', 'result']} label="Resta" className="opb-grid--borrow">
      {pieces}
      <OpOperator r={R_BOTTOM} symbol="−" />
      <OpRule r={R_RULE} />
    </OpGrid>
  );
}

export default UniversalSubtractionBoard;
