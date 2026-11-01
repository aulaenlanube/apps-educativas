// Ilustraciones del Explorador de España (120 × 84). Las comunes se toman del
// Explorador del Mundo; aquí van el puzle de provincias y el atlas de España.
import React, { useId } from 'react';
import WorldArt from '../../explorador-mundo/components/GameArt';

function useIds() {
  const base = useId().replace(/:/g, '');
  return (name) => `${base}-${name}`;
}

// Península estilizada: España en piezas de colores y Portugal en gris.
const PENINSULA = 'M30 22 L44 17 L60 19 L74 15 L88 22 L99 24 L95 33 L87 40 L83 51 L75 59 L62 65 L47 67 L36 63 L33 56 L35 47 L33 36 Z';
const PORTUGAL = 'M22 28 L32 25 L33 36 L35 47 L33 56 L36 63 L28 64 L23 54 L21 42 Z';

function Provincias() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bae6fd" /><stop offset="1" stopColor="#38bdf8" /></linearGradient>
        <clipPath id={id('sp')}><path d={PENINSULA} /></clipPath>
        <radialGradient id={id('sh')} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#0f172a" stopOpacity="0.32" /><stop offset="1" stopColor="#0f172a" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="62" cy="76" rx="42" ry="5" fill={`url(#${id('sh')})`} />
      <rect x="12" y="8" width="96" height="64" rx="12" fill={`url(#${id('sea')})`} />
      <path d={PORTUGAL} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      <g clipPath={`url(#${id('sp')})`}>
        <rect x="20" y="10" width="40" height="30" fill="#7dd3fc" />
        <rect x="60" y="10" width="45" height="30" fill="#fca5a5" />
        <rect x="20" y="40" width="34" height="30" fill="#bef264" />
        <rect x="54" y="40" width="22" height="30" fill="#f9a8d4" />
        <rect x="76" y="40" width="30" height="30" fill="#a5b4fc" />
        <rect x="20" y="54" width="60" height="20" fill="#fde68a" />
      </g>
      <path d={PENINSULA} fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinejoin="round" />
      {/* pieza que sale del puzle */}
      <g transform="translate(78 4) rotate(12)">
        <path d="M0 6 h10 q2 -5 6 0 h8 v8 q-5 2 0 6 v8 h-24 Z" fill="#f9a8d4" stroke="#9d174d" strokeWidth="1" />
        <path d="M2 8 h6" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <circle cx="102" cy="44" r="3" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="0.6" />
      <circle cx="96" cy="50" r="2" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="0.6" />
    </svg>
  );
}

function AtlasEspana() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bae6fd" /><stop offset="1" stopColor="#0ea5e9" /></linearGradient>
        <linearGradient id={id('land')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#fcd34d" /></linearGradient>
        <radialGradient id={id('pin')} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fda4af" /><stop offset="0.5" stopColor="#f43f5e" /><stop offset="1" stopColor="#9f1239" /></radialGradient>
      </defs>
      <rect x="12" y="8" width="96" height="64" rx="12" fill={`url(#${id('sea')})`} />
      <path d={PORTUGAL} fill="#e2e8f0" />
      <path d={PENINSULA} fill={`url(#${id('land')})`} stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
      <path d="M40 30 q14 -4 30 2 M38 44 q20 4 40 -2" stroke="#2563eb" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M56 36 q6 -6 14 -2" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="102" cy="44" r="3" fill={`url(#${id('land')})`} stroke="#b45309" strokeWidth="0.6" />
      <circle cx="20" cy="66" r="2" fill={`url(#${id('land')})`} stroke="#b45309" strokeWidth="0.6" />
      <circle cx="25" cy="64" r="1.6" fill={`url(#${id('land')})`} stroke="#b45309" strokeWidth="0.6" />
      <path d="M58 40 v-10" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="58" cy="26" r="6" fill={`url(#${id('pin')})`} />
      <circle cx="56" cy="24" r="1.8" fill="#fff" opacity="0.8" />
    </svg>
  );
}

const OWN = { provincias: Provincias, atlas: AtlasEspana };

export default function EspanaArt({ game }) {
  const Art = OWN[game];
  return Art ? <Art /> : <WorldArt game={game} />;
}
