// Ilustraciones de Quiz Battle (rediseño 2026). SVG con material propio de la
// plataforma (src/components/art/README.md §3): luz arriba-izquierda, sombra
// propia, borde de luz y brillo especular. Sin filtros SVG ni animación inline
// (las animaciones van en QuizBattle.css y solo sobre transform/opacity).
import React, { useId } from 'react';

// Los ids de useId llevan ':' y no se llevan bien dentro de url(#…).
const useSvgId = () => useId().replace(/:/g, '');

/* ───────────── Formas de las 4 respuestas (triángulo, rombo, círculo, cuadrado) ───────────── */

export const SHAPE_NAMES = ['Triángulo', 'Rombo', 'Círculo', 'Cuadrado'];

export function QBShape({ kind = 0, size = 34, className = '' }) {
  const id = useSvgId();
  const fill = `url(#${id}f)`;
  const shapes = [
    <path key="t" d="M20 6.5 L34 32 H6 Z" fill={fill} stroke={fill} strokeWidth="4.5" strokeLinejoin="round" />,
    <path key="d" d="M20 4.5 L35.5 20 L20 35.5 L4.5 20 Z" fill={fill} stroke={fill} strokeWidth="3" strokeLinejoin="round" />,
    <circle key="c" cx="20" cy="20" r="15" fill={fill} />,
    <rect key="s" x="6" y="6" width="28" height="28" rx="5.5" fill={fill} />,
  ];
  const gloss = [
    <path key="gt" d="M17.6 12.4 L11.6 23.6" stroke="#fff" strokeOpacity=".9" strokeWidth="2.6" strokeLinecap="round" />,
    <path key="gd" d="M13.2 15.4 L18.6 10" stroke="#fff" strokeOpacity=".9" strokeWidth="2.6" strokeLinecap="round" />,
    <path key="gc" d="M11.4 16.8 A9.6 9.6 0 0 1 17 10.9" stroke="#fff" strokeOpacity=".9" strokeWidth="2.6" strokeLinecap="round" fill="none" />,
    <path key="gs" d="M11.2 17.4 V12.6 Q11.2 11.2 12.6 11.2 H17.4" stroke="#fff" strokeOpacity=".9" strokeWidth="2.6" strokeLinecap="round" fill="none" />,
  ];
  return (
    <svg className={`qb-shape ${className}`} viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#f3f1ff" />
          <stop offset="1" stopColor="#d9d5f2" />
        </linearGradient>
      </defs>
      <g transform="translate(0 1.6)" opacity=".22">
        {React.cloneElement(shapes[kind % 4], { fill: '#1e1b4b', stroke: kind % 4 < 2 ? '#1e1b4b' : undefined })}
      </g>
      {shapes[kind % 4]}
      {gloss[kind % 4]}
    </svg>
  );
}

/* ───────────── Emblema de Quiz Battle: escudo hexagonal con rayo ───────────── */

export function QBEmblem({ size = 72, className = '' }) {
  const id = useSvgId();
  return (
    <svg className={`qb-emblem ${className}`} viewBox="0 0 96 96" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset=".45" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9a8d4" />
          <stop offset=".5" stopColor="#ec4899" />
          <stop offset="1" stopColor="#9d174d" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset=".35" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id={`${id}s`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#1e1b4b" stopOpacity=".45" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="48" cy="89" rx="26" ry="4.5" fill={`url(#${id}s)`} />
      {/* aro exterior rosa */}
      <path d="M48 4 L86 25 V67 L48 88 L10 67 V25 Z" fill={`url(#${id}r)`} stroke="#9d174d" strokeWidth="1.2" strokeLinejoin="round" />
      {/* cara violeta */}
      <path d="M48 11 L80 29 V63 L48 81 L16 63 V29 Z" fill={`url(#${id}b)`} />
      {/* sombra propia (lado derecho) */}
      <path d="M48 11 L80 29 V63 L48 81 Z" fill="#2e1065" opacity=".22" />
      {/* borde de luz */}
      <path d="M16 62 V29 L48 11" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* brillo superior */}
      <path d="M48 13 L77 29.5 V38 Q48 30 19 38 V29.5 Z" fill={`url(#${id}l)`} />
      {/* rayo dorado */}
      <path d="M53 20 L33 51 H46 L41 76 L64 41 H50 Z" fill="#7c2d12" opacity=".35" transform="translate(1.6 2)" />
      <path d="M53 20 L33 51 H46 L41 76 L64 41 H50 Z" fill={`url(#${id}g)`} stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
      <path d="M51 25 L38.5 45" stroke="#fff" strokeOpacity=".85" strokeWidth="2.2" strokeLinecap="round" />
      {/* destellos */}
      <path d="M74 14 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" fill="#fde68a" />
      <circle cx="22" cy="19" r="1.8" fill="#fbcfe8" />
    </svg>
  );
}

/* ───────────── Corona del campeón ───────────── */

export function QBCrown({ size = 56, className = '' }) {
  const id = useSvgId();
  return (
    <svg className={`qb-crown ${className}`} viewBox="0 0 64 48" width={size} height={size * 0.75} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset=".35" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M6 38 L4 12 L19 24 L32 5 L45 24 L60 12 L58 38 Z" fill={`url(#${id}g)`} stroke="#b45309" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M32 5 L45 24 L60 12 L58 38 H32 Z" fill="#92400e" opacity=".18" />
      <rect x="6" y="37" width="52" height="7" rx="2.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
      <path d="M8 13.5 L9.6 33" stroke="#fff" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="32" cy="27" r="4.6" fill="#ec4899" stroke="#9d174d" strokeWidth="1" />
      <circle cx="18" cy="31" r="3" fill="#22d3ee" stroke="#0e7490" strokeWidth=".9" />
      <circle cx="46" cy="31" r="3" fill="#22d3ee" stroke="#0e7490" strokeWidth=".9" />
      <circle cx="30.6" cy="25.6" r="1.4" fill="#fff" opacity=".85" />
      <circle cx="4" cy="12" r="3" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
      <circle cx="32" cy="5" r="3.2" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
      <circle cx="60" cy="12" r="3" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
    </svg>
  );
}

/* ───────────── Trofeo ───────────── */

export function QBTrophy({ size = 88, className = '' }) {
  const id = useSvgId();
  return (
    <svg className={`qb-trophy ${className}`} viewBox="0 0 80 88" width={size} height={size * 1.1} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset=".3" stopColor="#fcd34d" />
          <stop offset=".75" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
        <radialGradient id={`${id}s`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#0b0826" stopOpacity=".5" />
          <stop offset="1" stopColor="#0b0826" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="83" rx="26" ry="4" fill={`url(#${id}s)`} />
      {/* asas */}
      <path d="M18 16 H7 Q5 34 22 40" fill="none" stroke="#d97706" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 16 H73 Q75 34 58 40" fill="none" stroke="#b45309" strokeWidth="5" strokeLinecap="round" />
      {/* copa */}
      <path d="M16 8 H64 V22 Q64 46 40 52 Q16 46 16 22 Z" fill={`url(#${id}g)`} stroke="#b45309" strokeWidth="1.3" />
      <path d="M40 8 H64 V22 Q64 46 40 52 Z" fill="#92400e" opacity=".2" />
      <path d="M22 13 V24 Q22 36 30 42" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="3" strokeLinecap="round" />
      {/* pie */}
      <path d="M34 51 H46 L48 62 H32 Z" fill="#d97706" />
      <rect x="24" y="61" width="32" height="7" rx="2.5" fill={`url(#${id}g)`} stroke="#b45309" strokeWidth="1" />
      <rect x="19" y="68" width="42" height="12" rx="3.5" fill={`url(#${id}b)`} />
      <rect x="21" y="69.5" width="38" height="2.4" rx="1.2" fill="#fff" opacity=".28" />
      <rect x="31" y="72.5" width="18" height="4.5" rx="1.5" fill="#fcd34d" />
      {/* estrella */}
      <path d="M40 18 l3.2 6.6 7.2 1 -5.2 5 1.3 7.2 -6.5 -3.4 -6.5 3.4 1.3 -7.2 -5.2 -5 7.2 -1 Z" fill="#fffbeb" opacity=".95" />
    </svg>
  );
}

/* ───────────── Medalla de puesto ───────────── */

const MEDAL_TONES = {
  1: { a: '#fef9c3', b: '#fbbf24', c: '#b45309', ribbon: ['#ec4899', '#be185d'], ink: '#78350f' },
  2: { a: '#f8fafc', b: '#cbd5e1', c: '#64748b', ribbon: ['#3b82f6', '#1d4ed8'], ink: '#334155' },
  3: { a: '#ffedd5', b: '#fb923c', c: '#9a3412', ribbon: ['#10b981', '#047857'], ink: '#7c2d12' },
  x: { a: '#ede9fe', b: '#a78bfa', c: '#5b21b6', ribbon: ['#8b5cf6', '#5b21b6'], ink: '#3b0764' },
};

export function QBMedal({ rank, size = 120, className = '' }) {
  const id = useSvgId();
  const t = MEDAL_TONES[rank] || MEDAL_TONES.x;
  const label = rank > 0 ? String(rank) : '–';
  const fs = label.length >= 3 ? 22 : label.length === 2 ? 28 : 34;
  return (
    <svg className={`qb-medal ${className}`} viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.a} />
          <stop offset=".45" stopColor={t.b} />
          <stop offset="1" stopColor={t.c} />
        </linearGradient>
        <linearGradient id={`${id}i`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={t.a} />
          <stop offset=".55" stopColor={t.b} />
          <stop offset="1" stopColor={t.c} />
        </linearGradient>
      </defs>
      {/* cintas */}
      <path d="M30 2 H48 L56 44 H38 Z" fill={t.ribbon[0]} />
      <path d="M70 2 H52 L44 44 H62 Z" fill={t.ribbon[1]} />
      <path d="M33 2 H38 L45 40" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" />
      {/* disco */}
      <circle cx="50" cy="74" r="40" fill={`url(#${id}m)`} stroke={t.c} strokeWidth="1.5" />
      <circle cx="50" cy="74" r="30" fill={`url(#${id}i)`} />
      <circle cx="50" cy="74" r="30" fill="none" stroke={t.c} strokeOpacity=".45" strokeWidth="1.2" strokeDasharray="2.5 3" />
      <path d="M50 34 A40 40 0 0 1 90 74 A40 40 0 0 1 50 114 Z" fill={t.c} opacity=".14" />
      <path d="M17 62 A36 36 0 0 1 38 37" stroke="#fff" strokeOpacity=".75" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <text x="50" y={74 + fs * 0.36} textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize={fs} fill={t.ink}>{label}</text>
    </svg>
  );
}

/* ───────────── Medallón de veredicto (acierto / fallo / sin respuesta) ───────────── */

const VERDICT_TONES = {
  correct: ['#d1fae5', '#10b981', '#047857'],
  wrong: ['#ffe4e6', '#f43f5e', '#9f1239'],
  timeout: ['#e2e8f0', '#64748b', '#334155'],
};

export function QBVerdictArt({ kind = 'correct', size = 108, className = '' }) {
  const id = useSvgId();
  const [a, b, c] = VERDICT_TONES[kind] || VERDICT_TONES.timeout;
  return (
    <svg className={`qb-verdict-art ${className}`} viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset=".4" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="52" r="42" fill={c} />
      <circle cx="50" cy="48" r="42" fill={`url(#${id}m)`} />
      <path d="M50 6 A42 42 0 0 1 92 48 A42 42 0 0 1 50 90 Z" fill={c} opacity=".18" />
      <path d="M15 38 A37 37 0 0 1 36 12" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" fill="none" />
      {kind === 'correct' && (
        <path d="M29 49 L44 63 L72 33" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {kind === 'wrong' && (
        <g stroke="#fff" strokeWidth="10" strokeLinecap="round">
          <path d="M34 32 L66 64" />
          <path d="M66 32 L34 64" />
        </g>
      )}
      {kind === 'timeout' && (
        <g fill="none" stroke="#fff" strokeLinecap="round">
          <circle cx="50" cy="50" r="22" strokeWidth="6" />
          <path d="M50 36 V51 L60 57" strokeWidth="6" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}
