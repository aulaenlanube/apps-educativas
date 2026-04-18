import React from 'react';
import '/src/apps/_shared/MathBoxShared.css';

/**
 * Tablero simplificado para el modo examen de las apps de operaciones.
 * Muestra "N1 op N2 =" y una fila de casillas donde el alumno escribe el
 * resultado dígito a dígito usando la paleta numérica del layout.
 *
 * Props:
 *  - operator        : '+' | '-' | '×' | '÷'
 *  - n1, n2          : number|string — operandos (enteros)
 *  - resultSlots     : array de strings (1 por dígito de la solucion)
 *  - activeSlotIndex : number | null
 *  - onSlotClick     : fn(index)
 */
export default function OperationTestBoard({
  operator = '×',
  n1,
  n2,
  resultSlots,
  activeSlotIndex,
  onSlotClick,
}) {
  const ancho = Math.max(resultSlots.length, String(n1).length + 1);
  const n1Str = String(n1).padStart(ancho, ' ');
  const n2Str = String(n2).padStart(ancho, ' ');

  // Columna 1 = operador (35px, fuera de la rejilla numérica).
  // Columnas 2..ancho+1 = dígitos y casillas.
  return (
    <div id="problem-area" style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `35px repeat(${ancho}, 45px)`,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {/* Operador — columna propia, color rojo del tema (--app-operator), fila del segundo operando */}
        <div
          style={{
            gridRow: 2,
            gridColumn: 1,
            color: 'var(--app-operator)',
            fontWeight: 800,
            fontSize: '1.8rem',
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {operator}
        </div>

        {/* N1 */}
        {Array.from({ length: ancho }).map((_, c) => (
          <div key={`n1-${c}`} className="digit-display" style={{ gridRow: 1, gridColumn: c + 2 }}>
            {n1Str[c] === ' ' ? '' : n1Str[c]}
          </div>
        ))}

        {/* N2 (sin operador inline) */}
        {Array.from({ length: ancho }).map((_, c) => (
          <div key={`n2-${c}`} className="digit-display" style={{ gridRow: 2, gridColumn: c + 2 }}>
            {n2Str[c] === ' ' ? '' : n2Str[c]}
          </div>
        ))}

        {/* Línea — abarca solo las columnas numéricas, no el operador */}
        <hr className="operation-line" style={{ gridRow: 3, gridColumn: `2 / span ${ancho}` }} />

        {/* Resultado: un slot por dígito de la solución, alineado a la derecha */}
        {Array.from({ length: ancho }).map((_, c) => {
          const idx = c - (ancho - resultSlots.length);
          if (idx < 0) {
            return <div key={`r-pad-${c}`} style={{ gridRow: 4, gridColumn: c + 2 }} />;
          }
          return (
            <div
              key={`r-${c}`}
              className={`box result-box ${activeSlotIndex === idx ? 'selected' : ''}`}
              onClick={() => onSlotClick(idx)}
              style={{ gridRow: 4, gridColumn: c + 2 }}
            >
              {resultSlots[idx]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
