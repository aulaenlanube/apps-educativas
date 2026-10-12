import React from 'react';
import { Target } from 'lucide-react';
import { OpBoard, OpNum, OpCell, OpNote } from '../multiplicaciones/OpTablero';
import '/src/apps/_shared/Divisiones.css';

/**
 * Tablero del modo examen de las divisiones (rediseño 2026): la galera con
 * el dividendo y el divisor, y la bandeja del cociente con una casilla por
 * cifra. El alumno escribe el cociente con el teclado del layout.
 *
 * Props:
 *  - dividend, divisor : number|string (enteros)
 *  - resultSlots       : array de strings (1 por cifra del cociente)
 *  - activeSlotIndex   : number | null
 *  - onSlotClick       : fn(index)
 */
export default function DivisionTestBoard({ dividend, divisor, resultSlots, activeSlotIndex, onSlotClick }) {
  const dStr = String(dividend);
  const len = dStr.length;
  const units = len * 1.14 + 0.6 + Math.max(String(divisor).length * 0.62 + 0.6, resultSlots.length * 1.14 + 0.5) + 0.6;

  return (
    <OpBoard className="dv-board">
      <div
        className="op-grid dv-grid"
        style={{ '--units': units, gridTemplateColumns: `repeat(${len}, var(--cell)) calc(var(--cell) * .45) auto` }}
      >
        <div className="dv-cap" style={{ gridRow: 1, gridColumn: `1 / ${len + 1}` }}><span>dividendo</span></div>
        <div className="dv-cap" style={{ gridRow: 1, gridColumn: len + 2 }}><span>divisor</span></div>

        {dStr.split('').map((d, i) => <OpNum key={`d-${i}`} at={{ gridRow: 2, gridColumn: i + 1 }}>{d}</OpNum>)}
        <div className="dv-divisor" style={{ gridRow: 2, gridColumn: len + 2 }}>
          <span className="dv-divisor__num">{divisor}</span>
        </div>

        <div className="dv-quotient" style={{ gridRow: 3, gridColumn: len + 2 }}>
          {resultSlots.map((v, idx) => (
            <OpCell
              key={`q-${idx}`}
              i={idx}
              value={v}
              active={activeSlotIndex === idx}
              onClick={() => onSlotClick(idx)}
              label={`Cifra ${idx + 1} del cociente`}
            />
          ))}
          <span className="dv-tag dv-tag--q">cociente</span>
        </div>
      </div>
      <OpNote icon={Target}>Escribe solo el cociente, de izquierda a derecha</OpNote>
    </OpBoard>
  );
}
