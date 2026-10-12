// src/apps/mesa-crafteo/CrafteoArt.jsx
// Ilustraciones de la Mesa de Crafteo (rediseño 2026): matraz de síntesis
// (éxito) y matraz agrietado (fallo). Materiales con volumen y luz, sin filtros
// SVG; las burbujas solo se animan con html[data-fx="high"] (ver MesaCrafteo.css).
import React, { useId } from 'react';

const FLASK = 'M50 14 h20 v30 l25 44 q5 10 -6 12 H31 q-11 -2 -6 -12 l25 -44 z';
const LIQUID = 'M27 74 q16 -7 33 0 t33 0 L95 90 q5 10 -6 10 H31 q-11 0 -6 -10 z';

export function FlaskArt({ status = 'ok', className = '' }) {
  const uid = useId().replace(/:/g, '');
  const id = (k) => `mcart-${uid}-${k}`;
  const url = (k) => `url(#${id(k)})`;
  const ok = status === 'ok';
  const liquid = ok ? ['#a5f3fc', '#22d3ee', '#7c3aed'] : ['#fecdd3', '#fb7185', '#be123c'];
  return (
    <svg viewBox="0 0 120 120" className={`mc-art ${ok ? 'is-ok' : 'is-ko'} ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id={id('glow')} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor={liquid[1]} stopOpacity=".55" />
          <stop offset="1" stopColor={liquid[1]} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('liq')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={liquid[0]} />
          <stop offset=".45" stopColor={liquid[1]} />
          <stop offset="1" stopColor={liquid[2]} />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".34" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <radialGradient id={id('shadow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#020617" stopOpacity=".55" />
          <stop offset="1" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('clip')}><path d={FLASK} /></clipPath>
      </defs>

      <circle cx="60" cy="66" r="54" fill={url('glow')} />
      <ellipse cx="60" cy="104" rx="36" ry="6" fill={url('shadow')} />

      {/* vidrio + líquido */}
      <path d={FLASK} fill="#0f172a" fillOpacity=".55" />
      <g clipPath={url('clip')}>
        <path d={LIQUID} fill={url('liq')} />
        <path d="M27 74 q16 -7 33 0 t33 0" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
        <g className="mc-art__bubbles" fill="#fff">
          <circle cx="46" cy="90" r="3" fillOpacity=".55" />
          <circle cx="62" cy="84" r="2.2" fillOpacity=".5" />
          <circle cx="74" cy="92" r="3.4" fillOpacity=".45" />
          <circle cx="55" cy="95" r="1.8" fillOpacity=".6" />
        </g>
        {!ok && (
          <path d="M70 36 l-6 12 l7 6 l-8 14 l6 6 l-6 12" fill="none" stroke="#0b0a1f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </g>
      <path d={FLASK} fill={url('glass')} />
      <path d={FLASK} fill="none" stroke="#e2e8f0" strokeOpacity=".75" strokeWidth="2" strokeLinejoin="round" />
      <path d="M53 20 v26 l-22 40" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="40" cy="84" rx="3" ry="8" fill="#fff" fillOpacity=".28" transform="rotate(28 40 84)" />
      <rect x="45" y="9" width="30" height="8" rx="4" fill={url('rim')} />

      {ok ? (
        <g className="mc-art__sparks" fill="#fde68a">
          <path d="M98 22 l2.5 6.5 l6.5 2.5 l-6.5 2.5 l-2.5 6.5 l-2.5 -6.5 l-6.5 -2.5 l6.5 -2.5 z" />
          <path d="M20 34 l1.8 4.6 l4.6 1.8 l-4.6 1.8 l-1.8 4.6 l-1.8 -4.6 l-4.6 -1.8 l4.6 -1.8 z" fill="#a5f3fc" />
          <circle cx="88" cy="48" r="2.2" fill="#f5d0fe" />
          <circle cx="30" cy="16" r="1.8" />
        </g>
      ) : (
        <g className="mc-art__smoke" fill="#94a3b8">
          <circle cx="60" cy="6" r="6" fillOpacity=".35" />
          <circle cx="70" cy="2" r="4" fillOpacity=".25" />
          <circle cx="50" cy="1" r="3.4" fillOpacity=".22" />
          <path d="M92 30 l6 -6 M96 40 l8 -2 M24 30 l-6 -6 M20 42 l-8 -1" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export default FlaskArt;
