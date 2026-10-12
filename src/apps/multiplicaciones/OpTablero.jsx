// Piezas del tablero de las operaciones en columna (rediseño 2026).
// Solo presentación: cada app decide qué casilla está activa, qué hay escrito
// y si está bien o mal; estas piezas solo lo pintan. Estilos en OpTablero.css.
// Las usan multiplicaciones (3º-6º) y divisiones (4º-6º).
import React from 'react';
import './OpTablero.css';

const cx = (...c) => c.filter(Boolean).join(' ');
const hasValue = (v) => v !== undefined && v !== null && v !== '';

// Contenedor del tablero: mide el ancho disponible para ajustar las casillas.
export function OpBoard({ children, className = '' }) {
  return <div className={cx('op-board', className)}>{children}</div>;
}

// Cifra fija (operandos, cifras bajadas). `row` tiñe la cifra del multiplicador.
export function OpNum({ children, at, focus = false, row, className = '' }) {
  return (
    <div className={cx('op-num', focus && 'is-focus', className)} data-row={row} style={at}>
      {children}
    </div>
  );
}

// Casilla para escribir una cifra.
//   state: 'correct' | 'incorrect' | '' (lo que ya calculaba la app al comprobar)
//   off: no hay casilla en esa posición (se reserva el hueco)
//   focus: cifra que interviene en el paso actual (ayudas)
//   i: columna, para la cascada de la animación de acierto
//   stamp: sello ✓ al acertar (filas de resultado); el ✕ sale siempre al fallar
export function OpCell({
  value, state = '', active = false, off = false, focus = false, stamp = false, row, i = 0,
  at, onClick, label, className = '', children,
}) {
  const filled = hasValue(value);
  // Una casilla "sin cifra" que la app deja activa se ve (tenue) para que no
  // se escriba a ciegas.
  const hidden = off && !active;
  return (
    <button
      type="button"
      className={cx(
        'op-cell',
        filled && 'is-filled',
        active && 'is-active',
        state === 'correct' && 'is-ok',
        state === 'incorrect' && 'is-ko',
        focus && 'is-focus',
        stamp && 'is-stamp',
        hidden && 'is-off',
        off && active && 'is-phantom',
        className,
      )}
      data-row={row}
      style={{ ...at, '--i': i }}
      onClick={onClick}
      disabled={hidden}
      tabIndex={hidden ? -1 : undefined}
      aria-label={label || (filled ? `Casilla con ${value}` : 'Casilla vacía')}
      aria-pressed={active || undefined}
    >
      {filled && <span key={value} className="op-cell__digit">{value}</span>}
      {children}
    </button>
  );
}

// Llevada ("me llevo…"): moneda pequeña sobre la columna. Con onClick se puede
// elegir y escribir en ella; sin onClick solo se muestra.
//   ghost: columna sin llevada (se pinta muy tenue) · off: oculta
export function OpCarry({ value, state = '', active = false, off = false, ghost = false, at, onClick }) {
  const filled = hasValue(value);
  const cls = cx(
    'op-carry',
    filled && 'is-filled',
    active && 'is-active',
    state === 'correct' && 'is-ok',
    state === 'incorrect' && 'is-ko',
    ghost && !filled && 'is-ghost',
    off && 'is-off',
  );
  const digit = filled ? <span key={value} className="op-cell__digit">{value}</span> : null;
  if (!onClick || off) {
    return <div className={cls} style={at} aria-hidden={off || undefined}>{digit}</div>;
  }
  return (
    <button
      type="button"
      className={cls}
      style={at}
      onClick={onClick}
      aria-label={filled ? `Llevada: ${value}` : 'Llevada vacía'}
      aria-pressed={active || undefined}
    >
      {digit}
    </button>
  );
}

// Signo de la operación (× ÷ +) como ficha de porcelana, igual que en el icono.
export function OpSign({ op = 'mul', at }) {
  const label = op === 'mul' ? 'por' : op === 'add' ? 'más' : 'entre';
  const d = op === 'mul' ? 'M7 7l10 10M17 7L7 17' : op === 'add' ? 'M12 5.5v13M5.5 12h13' : 'M5.5 12h13';
  return (
    <span className={`op-sign op-sign--${op}`} style={at} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={d} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        {op === 'div' && (
          <>
            <circle cx="12" cy="6.4" r="2.2" fill="currentColor" />
            <circle cx="12" cy="17.6" r="2.2" fill="currentColor" />
          </>
        )}
      </svg>
    </span>
  );
}

export function OpRule({ at }) {
  return <div className="op-rule" style={at} aria-hidden="true" />;
}

// Coma: fija (sin onClick) o ranura que se pulsa para ponerla/quitarla.
//   on: puesta · state: 'correct' | 'incorrect' tras comprobar
export function OpComma({ at, on = false, state = '', onClick, label }) {
  if (!onClick) {
    return <div className="op-comma" style={at} aria-label="coma"><span className="op-comma__glyph">,</span></div>;
  }
  return (
    <button
      type="button"
      className={cx('op-comma', on && 'is-on', state === 'correct' && 'is-ok', state === 'incorrect' && 'is-ko')}
      style={at}
      onClick={onClick}
      aria-pressed={on}
      aria-label={label || (on ? 'Quitar la coma de aquí' : 'Poner la coma aquí')}
    >
      <span className="op-comma__glyph">,</span>
    </button>
  );
}

// Nota corta bajo el tablero (p. ej. "Escribe solo el cociente").
export function OpNote({ icon: Icon, children }) {
  return <p className="op-note">{Icon && <Icon size={14} />}{children}</p>;
}
