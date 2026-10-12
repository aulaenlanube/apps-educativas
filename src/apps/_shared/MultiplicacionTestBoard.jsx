import React from 'react';
import { Target } from 'lucide-react';
import { OpBoard, OpNum, OpCell, OpSign, OpRule, OpNote } from '../multiplicaciones/OpTablero';
import './Multiplicaciones.css';

/**
 * Tablero del modo examen de las apps de multiplicaciones (rediseño 2026).
 * Muestra la multiplicación en columna y una fila de casillas donde el alumno
 * escribe el resultado cifra a cifra con el teclado del layout.
 *
 * Props:
 *  - multiplicando (number|string)
 *  - multiplicador (number|string)
 *  - resultSlots     : array de strings (1 por digito de la solucion)
 *  - activeSlotIndex : number | null
 *  - onSlotClick     : fn(index)
 */
export default function MultiplicacionTestBoard({
  multiplicando,
  multiplicador,
  resultSlots,
  activeSlotIndex,
  onSlotClick,
}) {
  const ancho = Math.max(resultSlots.length, String(multiplicando).length + 1);
  const n1Str = String(multiplicando).padStart(ancho, ' ');
  const n2Str = String(multiplicador).padStart(ancho, ' ');
  const at = (row, c) => ({ gridRow: row, gridColumn: c + 2 });
  const cols = Array.from({ length: ancho }, (_, c) => c);

  return (
    <OpBoard>
      <div
        className="op-grid mx-grid"
        style={{ '--units': 1.6 + ancho * 1.14, gridTemplateColumns: `calc(var(--cell) * .8) repeat(${ancho}, var(--cell))` }}
      >
        {cols.map((c) => <OpNum key={`n1-${c}`} at={at(1, c)}>{n1Str[c].trim()}</OpNum>)}
        <OpSign op="mul" at={{ gridRow: 2, gridColumn: 1 }} />
        {cols.map((c) => <OpNum key={`n2-${c}`} at={at(2, c)}>{n2Str[c].trim()}</OpNum>)}
        <OpRule at={{ gridRow: 3, gridColumn: '1 / -1' }} />

        {/* Resultado: una casilla por cifra de la solución, alineada a la derecha */}
        {cols.map((c) => {
          const idx = c - (ancho - resultSlots.length);
          if (idx < 0) return <OpCell key={`r-pad-${c}`} at={at(4, c)} off />;
          return (
            <OpCell
              key={`r-${c}`}
              at={at(4, c)}
              i={c}
              value={resultSlots[idx]}
              active={activeSlotIndex === idx}
              onClick={() => onSlotClick(idx)}
              label={`Cifra ${idx + 1} del resultado`}
            />
          );
        })}
      </div>
      <OpNote icon={Target}>Escribe el resultado final, empezando por las unidades</OpNote>
    </OpBoard>
  );
}
