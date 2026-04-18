import React from 'react';
import '/src/apps/_shared/MathBoxShared.css';

/**
 * Tablero simplificado para el modo examen de las apps de multiplicaciones.
 * Muestra "N1 × N2 =" y una fila de casillas donde el alumno escribe el
 * resultado digito a digito usando la paleta numerica del layout.
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

  return (
    <div id="problem-area" style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${ancho}, 45px)`,
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {/* Multiplicando */}
        {Array.from({ length: ancho }).map((_, c) => (
          <div key={`n1-${c}`} className="digit-display" style={{ gridRow: 1, gridColumn: c + 1 }}>
            {n1Str[c] === ' ' ? '' : n1Str[c]}
          </div>
        ))}

        {/* Multiplicador (con x delante del primer dígito visible) */}
        {(() => {
          let xPuesto = false;
          return Array.from({ length: ancho }).map((_, c) => {
            const ch = n2Str[c];
            let content = ch === ' ' ? '' : ch;
            if (ch !== ' ' && !xPuesto) {
              content = (
                <>
                  <span className="cross-inline" style={{ marginRight: 4 }}>×</span>
                  <span>{ch}</span>
                </>
              );
              xPuesto = true;
            }
            return (
              <div key={`n2-${c}`} className="digit-display" style={{ gridRow: 2, gridColumn: c + 1, position: 'relative' }}>
                {content}
              </div>
            );
          });
        })()}

        {/* Línea */}
        <hr className="operation-line" style={{ gridRow: 3, gridColumn: '1 / -1' }} />

        {/* Resultado: un slot por dígito de la solución, alineado a la derecha */}
        {Array.from({ length: ancho }).map((_, c) => {
          const idx = c - (ancho - resultSlots.length);
          if (idx < 0) {
            return <div key={`r-pad-${c}`} style={{ gridRow: 4, gridColumn: c + 1 }} />;
          }
          return (
            <div
              key={`r-${c}`}
              className={`box result-box ${activeSlotIndex === idx ? 'selected' : ''}`}
              onClick={() => onSlotClick(idx)}
              style={{ gridRow: 4, gridColumn: c + 1 }}
            >
              {resultSlots[idx]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
