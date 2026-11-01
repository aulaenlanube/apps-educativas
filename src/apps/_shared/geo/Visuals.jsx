// Piezas visuales del motor de mapas: bandera, silueta y glifo.
import React, { useId } from 'react';

// Ruta de una bandera: código ISO de país (flag-icons) o ruta completa.
export const flagSrc = (flag) => (!flag ? null : flag.includes('/') ? flag : `/images/flags/${flag}.svg`);

// Bandera 4:3 con marco y brillo. `flag`: código ISO ('es') o ruta.
export function Flag({ flag, className = '', hidden = false, alt = '' }) {
  const src = flagSrc(flag);
  return (
    <span className={`gq-flag ${hidden ? 'is-hidden' : ''} ${className}`}>
      {hidden || !src ? (
        <span className="gq-flag__unknown" aria-hidden="true">?</span>
      ) : (
        <img src={src} alt={alt} draggable={false} decoding="async" />
      )}
    </span>
  );
}

const SHAPE_TONES = {
  emerald: ['#a7f3d0', '#10b981', '#047857', '#022c22'],
  amber: ['#fde68a', '#f59e0b', '#b45309', '#451a03'],
  sky: ['#bae6fd', '#0ea5e9', '#0369a1', '#082f49'],
  rose: ['#fecdd3', '#f43f5e', '#be123c', '#4c0519'],
};

// Silueta con volumen: sombra desplazada, relleno en degradado y borde de luz.
// `d` es la ruta ya encajada en un cuadrado de `size`.
export function Shape({ d, size = 220, tone = 'emerald', className = '', label = 'Silueta' }) {
  const uid = useId().replace(/:/g, '');
  const c = SHAPE_TONES[tone] || SHAPE_TONES.emerald;
  return (
    <svg className={`gq-shape ${className}`} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${uid}-f`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.55" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </linearGradient>
      </defs>
      <path d={d} transform={`translate(${size * 0.018} ${size * 0.03})`} fill={c[3]} opacity="0.55" />
      <path d={d} fill={`url(#${uid}-f)`} stroke={c[0]} strokeWidth={size / 160} strokeLinejoin="round" />
    </svg>
  );
}

// Glifo pequeño (silueta de continente o comunidad) en una caja de 64 × 44.
export function Glyph({ d, color = '#34d399', deep = '#059669', className = '' }) {
  return (
    <svg className={`gq-glyph ${className}`} viewBox="0 0 64 44" aria-hidden="true">
      <path d={d || ''} fill={color} stroke={deep} strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}
