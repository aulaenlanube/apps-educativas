import React from 'react';
import { OpGrid, OpGuide, OpDigit, OpOperator, OpRule, OpSlot, placeOf } from './MathOperationLayout';
import '/src/apps/_shared/MathBoxShared.css';

/**
 * Tablero simplificado para el modo examen de las apps de operaciones.
 * Muestra "N1 op N2" en columnas y una fila de casillas donde el alumno
 * escribe el resultado cifra a cifra con el teclado del layout.
 * Lo usan restas (3º-6º) y divisiones (4º-6º).
 *
 * Props (API estable):
 *  - operator        : '+' | '-' | '−' | '×' | '÷'
 *  - n1, n2          : number|string — operandos (enteros)
 *  - resultSlots     : array de strings (1 por dígito de la solucion)
 *  - activeSlotIndex : number | null
 *  - onSlotClick     : fn(index)
 *  - onSlotDrop      : fn(index, digit) — opcional: soltar un número arrastrado en una casilla
 */
export default function OperationTestBoard({
  operator = '×',
  n1,
  n2,
  resultSlots,
  activeSlotIndex,
  onSlotClick,
  onSlotDrop,
}) {
  const ancho = Math.max(resultSlots.length, String(n1).length + 1);
  const n1Str = String(n1).padStart(ancho, ' ');
  const n2Str = String(n2).padStart(ancho, ' ');
  const symbol = operator === '-' ? '−' : operator;

  // Columna 1 = signo; columnas 2..ancho+1 = cifras y casillas.
  // Filas: valor posicional · N1 · N2 · raya · resultado.
  const pieces = [];
  for (let c = 0; c < ancho; c++) {
    const col = c + 2;
    const pos = ancho - 1 - c;
    const [, placeName] = placeOf(pos);
    const idx = c - (ancho - resultSlots.length);
    // Columna de guarda vacía (sin cifras ni casilla): sin guía ni etiqueta.
    if (n1Str[c] !== ' ' || n2Str[c] !== ' ' || idx >= 0) {
      pieces.push(<OpGuide key={`g-${c}`} c={col} pos={pos} alt={c % 2 === 1} />);
    }
    if (n1Str[c] !== ' ') pieces.push(<OpDigit key={`n1-${c}`} r={2} c={col}>{n1Str[c]}</OpDigit>);
    if (n2Str[c] !== ' ') pieces.push(<OpDigit key={`n2-${c}`} r={3} c={col}>{n2Str[c]}</OpDigit>);

    // Resultado: un slot por dígito de la solución, alineado a la derecha
    if (idx >= 0) {
      pieces.push(
        <OpSlot
          key={`r-${c}`}
          r={5}
          c={col}
          kind="result"
          value={resultSlots[idx]}
          selected={activeSlotIndex === idx}
          label={`Resultado: ${placeName.toLowerCase()}`}
          onSelect={() => onSlotClick(idx)}
          onDrop={onSlotDrop ? (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if (/^\d$/.test(data)) onSlotDrop(idx, Number(data));
          } : undefined}
        />
      );
    }
  }

  return (
    <OpGrid
      columns={['op', ...Array.from({ length: ancho }, () => 'cell')]}
      rows={['label', 'num', 'num', 'rule', 'result']}
      label={`Operación: ${n1} ${symbol} ${n2}`}
      className="opb-grid--test"
    >
      {pieces}
      <OpOperator r={3} symbol={symbol} />
      <OpRule r={4} />
    </OpGrid>
  );
}
