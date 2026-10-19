// src/apps/sistema-solar/ui/MissionArt.jsx
// Ilustraciones SVG de las tarjetas de misión (gradientes con volumen; sin
// filtros ni animación SMIL). Los ids de los gradientes son únicos por
// instancia (useId) para que no choquen entre tarjetas.
import React, { useId } from 'react';

function Defs({ p }) {
  return (
    <defs>
      <radialGradient id={`${p}sun`} cx="38%" cy="34%" r="70%">
        <stop offset="0" stopColor="#fffbe6" /><stop offset=".35" stopColor="#fde047" /><stop offset=".75" stopColor="#f59e0b" /><stop offset="1" stopColor="#c2410c" />
      </radialGradient>
      <radialGradient id={`${p}halo`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fbbf24" stopOpacity=".55" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}earth`} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#bae6fd" /><stop offset=".45" stopColor="#0ea5e9" /><stop offset="1" stopColor="#0c4a6e" />
      </radialGradient>
      <radialGradient id={`${p}mars`} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#fecaca" /><stop offset=".5" stopColor="#ef4444" /><stop offset="1" stopColor="#7f1d1d" />
      </radialGradient>
      <radialGradient id={`${p}jup`} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#fef3c7" /><stop offset=".5" stopColor="#f59e0b" /><stop offset="1" stopColor="#78350f" />
      </radialGradient>
      <radialGradient id={`${p}nep`} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#c7d2fe" /><stop offset=".5" stopColor="#6366f1" /><stop offset="1" stopColor="#1e1b4b" />
      </radialGradient>
      <radialGradient id={`${p}core`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fffbeb" /><stop offset=".5" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" />
      </radialGradient>
      <linearGradient id={`${p}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1e1b4b" /><stop offset="1" stopColor="#0b0a1f" />
      </linearGradient>
      <linearGradient id={`${p}gold`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
  );
}

const Stars = () => (
  <g fill="#fff">
    {[[14, 18, 1.2], [104, 14, 1], [118, 52, 1.4], [28, 66, 0.9], [70, 10, 0.8], [88, 70, 1]].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity=".8" />)}
  </g>
);

const ART = {
  ordena: (p) => (
    <>
      <circle cx="8" cy="42" r="30" fill={`url(#${p}halo)`} />
      <circle cx="4" cy="42" r="17" fill={`url(#${p}sun)`} />
      {[30, 46, 62, 80, 102].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="58" x2={x} y2="66" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
          <circle cx={x} cy="42" r={[3.5, 5, 5.5, 4, 10][i]} fill={`url(#${p}${['mars', 'jup', 'earth', 'mars', 'jup'][i]})`} />
          <text x={x} y="76" textAnchor="middle" fontSize="7" fontWeight="800" fill="#c7d2fe">{i + 1}</text>
        </g>
      ))}
      <path d="M22 26 L112 26" stroke="#818cf8" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M108 22 L114 26 L108 30" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  adivina: (p) => (
    <>
      <circle cx="64" cy="44" r="30" fill={`url(#${p}nep)`} />
      <ellipse cx="64" cy="46" rx="46" ry="9" fill="none" stroke="#f9a8d4" strokeWidth="3" opacity=".85" />
      <path d="M18 46 A46 9 0 0 0 110 46" fill="none" stroke="#fbcfe8" strokeWidth="3" />
      <text x="64" y="56" textAnchor="middle" fontSize="34" fontWeight="900" fill="#fff" opacity=".95">?</text>
      <circle cx="104" cy="18" r="8" fill="#f472b6" /><text x="104" y="22" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">1</text>
    </>
  ),
  versus: (p) => (
    <>
      <circle cx="36" cy="42" r="24" fill={`url(#${p}jup)`} />
      <path d="M14 36 Q36 30 58 36" stroke="#78350f" strokeWidth="3" fill="none" opacity=".45" />
      <path d="M13 46 Q36 52 59 46" stroke="#78350f" strokeWidth="2.5" fill="none" opacity=".35" />
      <circle cx="96" cy="48" r="11" fill={`url(#${p}earth)`} />
      <rect x="54" y="62" width="22" height="14" rx="7" fill="#10b981" />
      <text x="65" y="72.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">VS</text>
      <path d="M86 20 L96 12 L106 20" fill="none" stroke="#6ee7b7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96 12 L96 32" stroke="#6ee7b7" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  capas: (p) => (
    <>
      <circle cx="64" cy="44" r="32" fill="#7c6a55" />
      <path d="M64 44 L64 12 A32 32 0 0 1 96 44 Z" fill="#0b0a1f" />
      <circle cx="64" cy="44" r="26" fill="#ea7a2e" />
      <path d="M64 44 L64 18 A26 26 0 0 1 90 44 Z" fill="#c2410c" />
      <circle cx="64" cy="44" r="15" fill="#f59e0b" />
      <path d="M64 44 L64 29 A15 15 0 0 1 79 44 Z" fill="#fbbf24" />
      <circle cx="64" cy="44" r="6" fill={`url(#${p}core)`} />
      <path d="M64 12 L64 44 L96 44" fill="none" stroke="#fde68a" strokeWidth="1.5" opacity=".7" />
    </>
  ),
  viaje: (p) => (
    <>
      <circle cx="16" cy="58" r="10" fill={`url(#${p}earth)`} />
      <circle cx="108" cy="22" r="12" fill={`url(#${p}mars)`} />
      <path d="M24 52 Q60 8 96 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
      <g transform="translate(58 30) rotate(-32)">
        <path d="M-9 0 Q0 -6 10 0 Q0 6 -9 0 Z" fill="#e0f2fe" />
        <circle cx="3" cy="0" r="2" fill="#0ea5e9" />
        <path d="M-9 0 L-15 -4 L-15 4 Z" fill="#fb923c" />
      </g>
    </>
  ),
  examen: (p) => (
    <>
      <circle cx="64" cy="42" r="30" fill={`url(#${p}halo)`} />
      <path d="M52 58 L46 80 L56 74 L62 82 L64 60 Z" fill="#6366f1" />
      <path d="M76 58 L82 80 L72 74 L66 82 L64 60 Z" fill="#818cf8" />
      <circle cx="64" cy="40" r="22" fill={`url(#${p}gold)`} />
      <circle cx="64" cy="40" r="16" fill="none" stroke="#fff7ed" strokeWidth="1.6" opacity=".7" />
      <path d="M64 28 L67.5 36 L76 36.6 L69.4 42 L71.6 50.4 L64 45.8 L56.4 50.4 L58.6 42 L52 36.6 L60.5 36 Z" fill="#fff" />
    </>
  ),
};

export default function MissionArt({ id }) {
  const uid = useId().replace(/:/g, '');
  const p = `ma${uid}`;
  const draw = ART[id] || ART.examen;
  return (
    <svg className="ss-mart" viewBox="0 0 128 88" aria-hidden="true">
      <Defs p={p} />
      <rect width="128" height="88" rx="14" fill={`url(#${p}sky)`} />
      <Stars />
      {draw(p)}
    </svg>
  );
}
