import React from 'react';
import './BadgeIcon.css';

// ─────────────────────────────────────────────────────────────────────────────
// 64 insignias multicolor + animadas. Cada SVG (viewBox 64×64) usa varios
// colores explícitos. La capa <g className="ba-anim anim-X"> aplica una
// animación CSS sutil definida en BadgeIcon.css.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  ind: '#6366f1', pur: '#8b5cf6', pin: '#ec4899', mag: '#d946ef',
  red: '#ef4444', ora: '#f97316', amb: '#f59e0b', yel: '#fbbf24', gld: '#d97706',
  lim: '#84cc16', grn: '#10b981', emr: '#059669', tea: '#14b8a6',
  cya: '#06b6d4', sky: '#0ea5e9', blu: '#2563eb', nav: '#1e3a8a',
  sl6: '#475569', sl4: '#94a3b8', sl2: '#e2e8f0',
  whi: '#ffffff', crm: '#fef3c7', stn: '#1f2937',
};

// Tonos extra para los rediseños
const X = {
  bronze1: '#e0a872', bronze2: '#92400e',
  silver1: '#e2e8f0', silver2: '#64748b',
  gold1:   '#fde68a', gold2:   '#b45309',
  paper:   '#fffbeb', shadow:  '#1f2937',
  sky1:    '#bae6fd', sky2:    '#0369a1',
  fire1:   '#fde047', fire2:   '#f97316', fire3: '#dc2626', fire4: '#7f1d1d',
  green1:  '#bbf7d0', green2:  '#15803d',
  pur1:    '#e9d5ff', pur2:    '#6b21a8',
};

const SW = 3.2; // grosor base trazo

// Helper: stroke + line caps
const S = { strokeWidth: SW, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };

const SVGS = {
  // ═══════════════════════ GENERAL ═══════════════════════
  first_game: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="0.5" stopColor="#6366f1" />
          <stop offset="1" stopColor="#312e81" />
        </linearGradient>
        <radialGradient id={`${id}scr`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="0.7" stopColor="#0891b2" />
          <stop offset="1" stopColor="#164e63" />
        </radialGradient>
      </defs>
      {/* Cuerpo handheld con highlight */}
      <path d="M8 22 Q4 22 4 30 V44 Q4 52 12 52 H22 L26 48 H38 L42 52 H52 Q60 52 60 44 V30 Q60 22 56 22 Z"
            fill={`url(#${id}body)`} stroke="#1e1b4b" {...S} />
      <path d="M8 24 Q6 24 6 28" stroke="#a5b4fc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Pantalla */}
      <rect x="20" y="26" width="22" height="14" rx="2" fill={`url(#${id}scr)`} stroke="#0e7490" strokeWidth="1.5" />
      <line x1="20" y1="29" x2="42" y2="29" stroke="#67e8f9" strokeWidth="0.6" opacity="0.5" />
      <line x1="20" y1="33" x2="42" y2="33" stroke="#67e8f9" strokeWidth="0.6" opacity="0.5" />
      <line x1="20" y1="37" x2="42" y2="37" stroke="#67e8f9" strokeWidth="0.6" opacity="0.5" />
      {/* Pixel sprite que parpadea */}
      <g className="ba-anim anim-blink-seq" style={{ transformOrigin: '31px 33px' }}>
        <rect x="29" y="31" width="2" height="2" fill="#fef3c7" />
        <rect x="33" y="31" width="2" height="2" fill="#fef3c7" />
        <rect x="27" y="33" width="2" height="2" fill="#fbbf24" />
        <rect x="31" y="33" width="2" height="2" fill="#fbbf24" />
        <rect x="35" y="33" width="2" height="2" fill="#fbbf24" />
        <rect x="29" y="35" width="2" height="2" fill="#f97316" />
        <rect x="33" y="35" width="2" height="2" fill="#f97316" />
      </g>
      {/* D-pad pulsante */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '13px 36px' }}>
        <rect x="9" y="34" width="8" height="4" rx="0.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <rect x="11" y="32" width="4" height="8" rx="0.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <circle cx="13" cy="36" r="0.8" fill="#475569" />
      </g>
      {/* Botones ABXY con sombra */}
      <circle cx="50" cy="30" r="2.6" fill="#fbbf24" stroke="#92400e" strokeWidth="1.2" />
      <circle cx="55" cy="35" r="2.6" fill="#10b981" stroke="#064e3b" strokeWidth="1.2" />
      <circle cx="45" cy="35" r="2.6" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.2" />
      <circle cx="50" cy="40" r="2.6" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
      <circle cx="49.4" cy="29.4" r="0.7" fill="#fef3c7" />
      <circle cx="44.4" cy="34.4" r="0.7" fill="#bfdbfe" />
      {/* Antena con ondas de señal */}
      <line x1="56" y1="14" x2="56" y2="22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <circle cx="56" cy="12" r="1.8" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '56px 12px' }}>
        <circle cx="56" cy="12" r="3" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      </g>
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '56px 12px', animationDelay: '1s' }}>
        <circle cx="56" cy="12" r="3" fill="none" stroke="#fde047" strokeWidth="1.2" />
      </g>
    </>
  ),
  games_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fee2e2" />
          <stop offset="1" stopColor="#fca5a5" />
        </linearGradient>
        <linearGradient id={`${id}left`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id={`${id}right`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </linearGradient>
      </defs>
      {/* Líneas de movimiento detrás */}
      <g className="ba-anim anim-dash-slide">
        <line x1="4" y1="20" x2="14" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="32" x2="12" y2="32" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <line x1="4" y1="44" x2="14" y2="44" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Dado isométrico — 3 caras */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '36px 32px' }}>
        {/* Top face */}
        <path d="M36 8 L56 18 L36 28 L16 18 Z" fill={`url(#${id}top)`} stroke="#7f1d1d" {...S} />
        {/* Left face */}
        <path d="M16 18 L36 28 L36 52 L16 42 Z" fill={`url(#${id}left)`} stroke="#7f1d1d" {...S} />
        {/* Right face */}
        <path d="M56 18 L36 28 L36 52 L56 42 Z" fill={`url(#${id}right)`} stroke="#7f1d1d" {...S} />
        {/* 5 puntos cara izquierda */}
        <circle cx="22" cy="26" r="1.6" fill="#fef2f2" />
        <circle cx="30" cy="30" r="1.6" fill="#fef2f2" />
        <circle cx="22" cy="34" r="1.6" fill="#fef2f2" />
        <circle cx="30" cy="38" r="1.6" fill="#fef2f2" />
        <circle cx="26" cy="34" r="1.6" fill="#fef2f2" />
        {/* puntos cara derecha (3) */}
        <circle cx="42" cy="32" r="1.6" fill="#fecaca" />
        <circle cx="46" cy="36" r="1.6" fill="#fecaca" />
        <circle cx="50" cy="40" r="1.6" fill="#fecaca" />
        {/* punto cara superior */}
        <circle cx="36" cy="18" r="1.6" fill="#fff" />
      </g>
      {/* Chispas alrededor */}
      <g className="ba-anim anim-twinkle">
        <path d="M52 10 L54 12 L56 10 L54 8 Z" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M10 50 L12 52 L14 50 L12 48 Z" fill="#fde047" />
      </g>
    </>
  ),
  games_10: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}base`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#78350f" />
        </radialGradient>
        <radialGradient id={`${id}ball`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#fecaca" />
          <stop offset="0.6" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* Base arcade plataforma */}
      <ellipse cx="32" cy="52" rx="20" ry="6" fill={`url(#${id}base)`} stroke="#78350f" {...S} />
      <ellipse cx="32" cy="50" rx="20" ry="2" fill="none" stroke="#fde68a" strokeWidth="1" opacity="0.6" />
      {/* Decoraciones LED en la base */}
      <g className="ba-anim anim-blink-seq">
        <circle cx="18" cy="52" r="1.2" fill="#22d3ee" />
      </g>
      <g className="ba-anim anim-blink-seq" style={{ animationDelay: '.4s' }}>
        <circle cx="32" cy="55" r="1.2" fill="#a78bfa" />
      </g>
      <g className="ba-anim anim-blink-seq" style={{ animationDelay: '.8s' }}>
        <circle cx="46" cy="52" r="1.2" fill="#22d3ee" />
      </g>
      {/* Eje del joystick */}
      <line x1="32" y1="48" x2="32" y2="24" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="48" x2="32" y2="26" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bola del joystick orbitando */}
      <g className="ba-anim anim-orbit-cw" style={{ transformOrigin: '32px 32px' }}>
        <g transform="translate(0,-10)">
          <circle cx="32" cy="22" r="8" fill={`url(#${id}ball)`} stroke="#450a0a" {...S} />
          <circle cx="29" cy="19" r="2.5" fill="#fecaca" opacity="0.8" />
          <circle cx="34" cy="24" r="0.8" fill="#fef2f2" />
        </g>
      </g>
      {/* Chispitas */}
      <g className="ba-anim anim-twinkle">
        <circle cx="50" cy="18" r="1.5" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="14" cy="22" r="1.5" fill="#22d3ee" />
      </g>
    </>
  ),
  games_25: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}r1`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fde047" />
        </radialGradient>
        <radialGradient id={`${id}r2`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#bfdbfe" />
          <stop offset="1" stopColor="#1d4ed8" />
        </radialGradient>
        <radialGradient id={`${id}bull`} cx="0.4" cy="0.4">
          <stop offset="0" stopColor="#fca5a5" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>
      {/* Anillos concéntricos */}
      <circle cx="32" cy="32" r="26" fill="#fff" stroke="#0f172a" {...S} />
      <circle cx="32" cy="32" r="22" fill={`url(#${id}r2)`} stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="18" fill={`url(#${id}r1)`} stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="14" fill="#fca5a5" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="10" fill="#fff" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="6" fill={`url(#${id}bull)`} stroke="#0f172a" strokeWidth="1.2" />
      {/* Líneas divisoras */}
      <line x1="32" y1="6" x2="32" y2="58" stroke="#0f172a" strokeWidth="0.8" opacity="0.4" />
      <line x1="6" y1="32" x2="58" y2="32" stroke="#0f172a" strokeWidth="0.8" opacity="0.4" />
      <line x1="14" y1="14" x2="50" y2="50" stroke="#0f172a" strokeWidth="0.8" opacity="0.4" />
      <line x1="50" y1="14" x2="14" y2="50" stroke="#0f172a" strokeWidth="0.8" opacity="0.4" />
      {/* Anillo expansivo (impacto) */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="6" fill="none" stroke="#fbbf24" strokeWidth="2" />
      </g>
      {/* Dardo volando hacia el centro */}
      <g className="ba-anim anim-dart-fly" style={{ transformOrigin: '32px 32px' }}>
        <line x1="20" y1="20" x2="32" y2="32" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 32 L29 30 L30 33 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        <path d="M18 18 L14 16 L16 22 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
        <path d="M18 18 L20 14 L22 17 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
      </g>
    </>
  ),
  games_50: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#d97706" />
          <stop offset="1" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id={`${id}arr`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a16207" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id={`${id}target`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.45" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* Diana al fondo derecha */}
      <circle cx="50" cy="32" r="11" fill={`url(#${id}target)`} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="50" cy="32" r="7" fill="none" stroke="#fef3c7" strokeWidth="1" opacity="0.7" />
      <circle cx="50" cy="32" r="3" fill="#fef3c7" stroke="#0f172a" strokeWidth="1" />
      {/* Arco */}
      <path d="M14 10 Q4 32 14 54" fill="none" stroke={`url(#${id}bow)`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M14 10 Q6 30 6 32 Q6 34 14 54" fill="none" stroke="#fef3c7" strokeWidth="1" opacity="0.5" />
      {/* Cuerda del arco con tensión */}
      <line x1="14" y1="10" x2="14" y2="54" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="32" x2="20" y2="32" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      {/* Empuñadura */}
      <rect x="11" y="28" width="6" height="8" rx="1" fill="#7c2d12" stroke="#451a03" strokeWidth="1" />
      {/* Flecha que vuela */}
      <g className="ba-anim anim-dart-fly" style={{ transformOrigin: '50px 32px' }}>
        <line x1="20" y1="32" x2="48" y2="32" stroke={`url(#${id}arr)`} strokeWidth="2.5" strokeLinecap="round" />
        {/* Punta */}
        <path d="M48 32 L44 30 L44 34 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        {/* Plumas */}
        <path d="M20 32 L16 28 L18 32 L16 36 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
        <path d="M22 32 L18 29 L20 32 L18 35 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
      </g>
      {/* Anillo de impacto en diana */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '50px 32px' }}>
        <circle cx="50" cy="32" r="3" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      </g>
    </>
  ),
  games_100: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}d1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}d2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" /><stop offset="0.5" stopColor="#f59e0b" /><stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}c0`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#92400e" />
        </radialGradient>
      </defs>
      {/* Rayos detrás */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 24;
          const y1 = 32 - Math.cos(a) * 24;
          const x2 = 32 + Math.sin(a) * 30;
          const y2 = 32 - Math.cos(a) * 30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />;
        })}
      </g>
      {/* "1" — barra vertical */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '14px 32px' }}>
        <rect x="9" y="14" width="10" height="36" rx="2" fill={`url(#${id}d1)`} stroke="#7c2d12" strokeWidth="2" />
        <rect x="9" y="14" width="10" height="3" fill="#fff" opacity="0.5" />
        <path d="M9 14 L4 18 L9 22" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Primer "0" */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '30px 32px', animationDelay: '.2s' }}>
        <ellipse cx="30" cy="32" rx="9" ry="16" fill={`url(#${id}d2)`} stroke="#7c2d12" strokeWidth="2" />
        <ellipse cx="30" cy="32" rx="4" ry="9" fill="#fffbeb" stroke="#7c2d12" strokeWidth="1.5" />
        <ellipse cx="27" cy="24" rx="2" ry="3" fill="#fff" opacity="0.8" />
      </g>
      {/* Segundo "0" */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '50px 32px', animationDelay: '.4s' }}>
        <ellipse cx="50" cy="32" rx="9" ry="16" fill={`url(#${id}c0)`} stroke="#7c2d12" strokeWidth="2" />
        <ellipse cx="50" cy="32" rx="4" ry="9" fill="#fffbeb" stroke="#7c2d12" strokeWidth="1.5" />
        <ellipse cx="47" cy="24" rx="2" ry="3" fill="#fff" opacity="0.8" />
      </g>
      {/* Confeti */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '14px 8px' }}>
        <rect x="13" y="6" width="2" height="3" fill="#ec4899" transform="rotate(15 14 8)" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '54px 10px', animationDelay: '.7s' }}>
        <rect x="53" y="8" width="2" height="3" fill="#22d3ee" transform="rotate(-20 54 10)" />
      </g>
    </>
  ),
  games_250: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.4" stopColor="#0284c7" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}sh2`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfdbfe" />
          <stop offset="0.5" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <radialGradient id={`${id}gem`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.85" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
        <clipPath id={`${id}clp`}>
          <path d="M32 6 L54 14 V32 Q54 48 32 58 Q10 48 10 32 V14 Z" />
        </clipPath>
      </defs>
      {/* Sombra */}
      <path d="M34 8 L56 16 V34 Q56 50 34 60 Q12 50 12 34 V16 Z" fill="#0f172a" opacity="0.3" />
      {/* Escudo principal */}
      <path d="M32 6 L54 14 V32 Q54 48 32 58 Q10 48 10 32 V14 Z" fill={`url(#${id}sh)`} stroke="#0c4a6e" strokeWidth="3" strokeLinejoin="round" />
      {/* Patrón heráldico interno: cuartelado */}
      <g clipPath={`url(#${id}clp)`}>
        <path d="M32 6 L32 58" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
        <path d="M10 32 L54 32" stroke="#fff" strokeWidth="0.8" opacity="0.4" />
        <path d="M32 6 L54 14 L32 32 L10 14 Z" fill={`url(#${id}sh2)`} opacity="0.5" />
        <path d="M32 32 L54 50 L32 58 L10 50 Z" fill="#1e3a8a" opacity="0.4" />
      </g>
      {/* Borde decorado dorado */}
      <path d="M32 6 L54 14 V32 Q54 48 32 58 Q10 48 10 32 V14 Z" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.7" />
      {/* Espadas cruzadas detrás de la gema */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        <line x1="20" y1="20" x2="44" y2="44" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="20" x2="20" y2="44" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="20" r="1.5" fill="#fbbf24" />
        <circle cx="44" cy="20" r="1.5" fill="#fbbf24" />
        <circle cx="20" cy="44" r="1.5" fill="#fbbf24" />
        <circle cx="44" cy="44" r="1.5" fill="#fbbf24" />
      </g>
      {/* Gema central pulsando */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 22 L34.5 28 L41 28 L36 32 L38 38 L32 34 L26 38 L28 32 L23 28 L29.5 28 Z" fill={`url(#${id}gem)`} stroke="#7c2d12" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="30" cy="28" r="1" fill="#fff" opacity="0.8" />
      </g>
      {/* Estrellas en el escudo */}
      <g className="ba-anim anim-twinkle">
        <circle cx="20" cy="14" r="1" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="44" cy="14" r="1" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="32" cy="48" r="1" fill="#fef9c3" />
      </g>
      {/* Brillo sweep diagonal */}
      <g clipPath={`url(#${id}clp)`}>
        <g className="ba-anim anim-gleam">
          <rect x="22" y="0" width="6" height="64" fill="#fff" opacity="0.4" transform="skewX(-20)" />
        </g>
      </g>
    </>
  ),
  games_500: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}m1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.5" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}m2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="0.5" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`${id}m3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fed7aa" />
          <stop offset="0.5" stopColor="#fb923c" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
      </defs>
      {/* Pedestal escalonado */}
      <rect x="6" y="46" width="52" height="10" rx="1.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="6" y1="50" x2="58" y2="50" stroke="#475569" strokeWidth="1" opacity="0.6" />
      {/* Tres podios */}
      <rect x="22" y="32" width="20" height="14" fill={`url(#${id}m1)`} stroke="#7c2d12" strokeWidth="1.5" />
      <text x="32" y="44" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fef9c3" stroke="#7c2d12" strokeWidth="0.6">1</text>
      <rect x="6" y="38" width="16" height="8" fill={`url(#${id}m2)`} stroke="#0f172a" strokeWidth="1.5" />
      <text x="14" y="45" textAnchor="middle" fontSize="6" fontWeight="900" fill="#f1f5f9" stroke="#0f172a" strokeWidth="0.4">2</text>
      <rect x="42" y="40" width="16" height="6" fill={`url(#${id}m3)`} stroke="#7c2d12" strokeWidth="1.5" />
      <text x="50" y="45" textAnchor="middle" fontSize="5" fontWeight="900" fill="#fffbeb" stroke="#7c2d12" strokeWidth="0.4">3</text>
      {/* Trofeo en el centro */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 22px' }}>
        <path d="M22 6 H42 V18 Q42 26 32 26 Q22 26 22 18 Z" fill={`url(#${id}m1)`} stroke="#7c2d12" strokeWidth="1.5" />
        <path d="M22 8 Q14 8 14 14 Q14 20 20 22" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 8 Q50 8 50 14 Q50 20 44 22" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        <rect x="29" y="26" width="6" height="6" fill={`url(#${id}m1)`} stroke="#7c2d12" strokeWidth="1.2" />
        <ellipse cx="26" cy="12" rx="1.5" ry="3" fill="#fffbeb" opacity="0.7" />
      </g>
      {/* Confeti subiendo */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '14px 30px' }}>
        <rect x="13" y="28" width="2" height="3" fill="#ec4899" transform="rotate(15)" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '50px 30px', animationDelay: '.5s' }}>
        <rect x="49" y="28" width="2" height="3" fill="#22d3ee" transform="rotate(-20)" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '32px 4px', animationDelay: '1s' }}>
        <circle cx="32" cy="4" r="1" fill="#fde047" />
      </g>
      {/* Estrellas */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 14 L9 16 L11 16 L9.5 17.5 L10 20 L8 18.5 L6 20 L6.5 17.5 L5 16 L7 16 Z" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M56 14 L57 16 L59 16 L57.5 17.5 L58 20 L56 18.5 L54 20 L54.5 17.5 L53 16 L55 16 Z" fill="#fde047" />
      </g>
    </>
  ),
  games_1000: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cup`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.3" stopColor="#fde047" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}gemR`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#fecaca" />
          <stop offset="0.5" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
        <radialGradient id={`${id}gemG`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#bbf7d0" />
          <stop offset="0.5" stopColor="#10b981" />
          <stop offset="1" stopColor="#064e3b" />
        </radialGradient>
        <radialGradient id={`${id}gemB`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#bfdbfe" />
          <stop offset="0.5" stopColor="#2563eb" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
        <radialGradient id={`${id}halo1k`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#fde047" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="32" fill={`url(#${id}halo1k)`} />
      {/* Rayos giratorios */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 26;
          const y1 = 32 - Math.cos(a) * 26;
          const x2 = 32 + Math.sin(a) * 32;
          const y2 = 32 - Math.cos(a) * 32;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth={i % 2 ? 1 : 1.8} strokeLinecap="round" opacity="0.7" />;
        })}
      </g>
      {/* Pedestal escalonado */}
      <rect x="18" y="54" width="28" height="6" rx="1" fill={`url(#${id}base)`} stroke="#451a03" strokeWidth="1.5" />
      <rect x="20" y="56" width="24" height="2" fill="#fffbeb" opacity="0.5" />
      <rect x="22" y="48" width="20" height="6" rx="0.8" fill={`url(#${id}base)`} stroke="#451a03" strokeWidth="1.2" />
      {/* Tallo */}
      <rect x="28" y="40" width="8" height="10" fill={`url(#${id}cup)`} stroke="#7c2d12" strokeWidth="1.5" />
      <line x1="28" y1="42" x2="36" y2="42" stroke="#fef3c7" strokeWidth="0.6" opacity="0.7" />
      {/* Trofeo monumental */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 24px' }}>
        {/* Cuerpo principal */}
        <path d="M14 8 H50 V22 Q50 38 32 40 Q14 38 14 22 Z" fill={`url(#${id}cup)`} stroke="#451a03" strokeWidth="2.5" />
        {/* Banda decorativa superior */}
        <rect x="14" y="8" width="36" height="3" fill="#7c2d12" opacity="0.4" />
        {/* Banda inferior */}
        <rect x="16" y="34" width="32" height="2" fill="#7c2d12" opacity="0.4" />
        {/* Asas dobles izquierda */}
        <path d="M14 10 Q2 10 2 20 Q2 30 14 32" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        <path d="M14 12 Q5 12 5 20" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        {/* Asas dobles derecha */}
        <path d="M50 10 Q62 10 62 20 Q62 30 50 32" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 12 Q59 12 59 20" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        {/* Gemas alineadas */}
        <circle cx="22" cy="20" r="2.5" fill={`url(#${id}gemB)`} stroke="#0c4a6e" strokeWidth="0.8" />
        <circle cx="32" cy="22" r="3" fill={`url(#${id}gemR)`} stroke="#7f1d1d" strokeWidth="1" />
        <circle cx="42" cy="20" r="2.5" fill={`url(#${id}gemG)`} stroke="#064e3b" strokeWidth="0.8" />
        <circle cx="32" cy="22" r="0.8" fill="#fff" opacity="0.9" />
        {/* "1000" */}
        <text x="32" y="32" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12" stroke="#fef3c7" strokeWidth="0.5">1000</text>
        {/* Highlight */}
        <ellipse cx="20" cy="14" rx="2" ry="6" fill="#fffbeb" opacity="0.6" />
      </g>
      {/* Coronita arriba */}
      <g className="ba-anim anim-twinkle">
        <path d="M26 4 L28 8 L32 4 L36 8 L38 4 L37 10 L27 10 Z" fill="#fde047" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="32" cy="6" r="0.8" fill="#dc2626" />
      </g>
      {/* Confeti */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '8px 24px' }}>
        <rect x="7" y="22" width="2" height="3" fill="#ec4899" transform="rotate(20)" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '56px 24px', animationDelay: '.5s' }}>
        <rect x="55" y="22" width="2" height="3" fill="#22d3ee" transform="rotate(-20)" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '14px 56px', animationDelay: '1s' }}>
        <circle cx="14" cy="56" r="1" fill="#fde047" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '50px 56px', animationDelay: '1.5s' }}>
        <circle cx="50" cy="56" r="1" fill="#a78bfa" />
      </g>
    </>
  ),

  // ═══════════════════════ EXAMENES ═══════════════════════
  first_exam: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0e7ff" />
        </linearGradient>
        <linearGradient id={`${id}fold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      {/* Sombra del papel */}
      <path d="M18 12 H42 L50 20 V58 H18 Z" fill="#cbd5e1" opacity="0.4" />
      {/* Papel */}
      <path d="M16 8 H40 L48 16 V56 H16 Z" fill={`url(#${id}paper)`} stroke="#1e3a8a" {...S} />
      <path d="M40 8 V16 H48" fill={`url(#${id}fold)`} stroke="#1e3a8a" {...S} />
      {/* Líneas de texto */}
      <line x1="20" y1="22" x2="36" y2="22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="26" x2="42" y2="26" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="30" x2="38" y2="30" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sello en círculo */}
      <circle cx="40" cy="48" r="5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.2" />
      <text x="40" y="50.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#fef2f2" stroke="none">A</text>
      {/* Check animado */}
      <g className="ba-anim anim-checkdraw">
        <path d="M20 38 L26 44 L40 30" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Estrellas que aparecen */}
      <g className="ba-anim anim-twinkle">
        <path d="M52 14 L53 17 L56 17 L54 19 L55 22 L52 20 L49 22 L50 19 L48 17 L51 17 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.6" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M8 48 L9 51 L12 51 L10 53 L11 56 L8 54 L5 56 L6 53 L4 51 L7 51 Z" fill="#fde047" stroke="#b45309" strokeWidth="0.6" />
      </g>
    </>
  ),
  exams_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}p1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fce7f3" />
          <stop offset="1" stopColor="#f9a8d4" />
        </linearGradient>
        <linearGradient id={`${id}p2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={`${id}p3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcfce7" />
          <stop offset="1" stopColor="#86efac" />
        </linearGradient>
      </defs>
      {/* Pila de 3 papeles abanicados con sway */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 50px' }}>
        {/* Papel atrás (rosa) */}
        <g transform="rotate(-12 32 50)">
          <path d="M14 12 H38 L44 18 V52 H14 Z" fill={`url(#${id}p1)`} stroke="#be185d" {...S} />
          <line x1="20" y1="22" x2="38" y2="22" stroke="#be185d" strokeWidth="1.2" opacity="0.5" />
          <line x1="20" y1="28" x2="36" y2="28" stroke="#be185d" strokeWidth="1.2" opacity="0.5" />
        </g>
        {/* Papel medio (azul) */}
        <g transform="rotate(-2 32 50)">
          <path d="M14 12 H38 L44 18 V52 H14 Z" fill={`url(#${id}p2)`} stroke="#1d4ed8" {...S} />
          <line x1="20" y1="22" x2="38" y2="22" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.5" />
          <line x1="20" y1="28" x2="36" y2="28" stroke="#1d4ed8" strokeWidth="1.2" opacity="0.5" />
        </g>
        {/* Papel frente (verde) con check */}
        <g transform="rotate(8 32 50)">
          <path d="M14 12 H38 L44 18 V52 H14 Z" fill={`url(#${id}p3)`} stroke="#15803d" {...S} />
          <path d="M20 32 L24 36 L34 24" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Cinta dorada */}
          <circle cx="36" cy="44" r="3" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
          <path d="M34 47 L33 52 L36 50 L39 52 L38 47" fill="#fbbf24" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
        </g>
      </g>
    </>
  ),
  exams_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}clip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${id}board`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      {/* Tabla portafolio */}
      <rect x="12" y="14" width="40" height="46" rx="3" fill={`url(#${id}board)`} stroke="#1e3a8a" {...S} />
      {/* Pinza superior */}
      <rect x="22" y="8" width="20" height="10" rx="2" fill={`url(#${id}clip)`} stroke="#92400e" {...S} />
      <rect x="26" y="6" width="12" height="4" rx="1" fill="#92400e" />
      {/* 5 items de checklist */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="17" y={24 + i * 7} width="4" height="4" rx="0.8" fill="#fff" stroke="#1e3a8a" strokeWidth="1.2" />
          <line x1="24" y1={26 + i * 7} x2={42 - i * 2} y2={26 + i * 7} stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
      {/* Checks que aparecen secuencialmente */}
      <g className="ba-anim anim-blink-seq" style={{ transformOrigin: '19px 26px' }}>
        <path d="M17 26 L19 28 L22 24" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <g className="ba-anim anim-blink-seq" style={{ transformOrigin: '19px 33px', animationDelay: '.3s' }}>
        <path d="M17 33 L19 35 L22 31" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <g className="ba-anim anim-blink-seq" style={{ transformOrigin: '19px 40px', animationDelay: '.6s' }}>
        <path d="M17 40 L19 42 L22 38" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <g className="ba-anim anim-blink-seq" style={{ transformOrigin: '19px 47px', animationDelay: '.9s' }}>
        <path d="M17 47 L19 49 L22 45" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <g className="ba-anim anim-blink-seq" style={{ transformOrigin: '19px 54px', animationDelay: '1.2s' }}>
        <path d="M17 54 L19 56 L22 52" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      {/* Estrella dorada arriba */}
      <g className="ba-anim anim-twinkle">
        <path d="M48 18 L49 20 L51 20 L49.5 22 L50 24 L48 23 L46 24 L46.5 22 L45 20 L47 20 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
    </>
  ),
  exams_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="0.5" stopColor="#1e1b4b" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={`${id}capTop`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4c1d95" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id={`${id}tas`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
      </defs>
      {/* Sombra */}
      <ellipse cx="32" cy="50" rx="22" ry="2.5" fill="#0f172a" opacity="0.3" />
      {/* Base del birrete (cono truncado) */}
      <path d="M16 32 V42 Q32 50 48 42 V32" fill={`url(#${id}cap)`} stroke="#020617" {...S} />
      <path d="M16 32 Q32 38 48 32" fill="none" stroke="#4c1d95" strokeWidth="1.5" />
      {/* Tablero plano superior */}
      <path d="M4 26 L32 14 L60 26 L32 38 Z" fill={`url(#${id}capTop)`} stroke="#020617" {...S} strokeLinejoin="round" />
      <path d="M4 26 L32 18 L60 26" fill="none" stroke="#7c3aed" strokeWidth="1.2" opacity="0.7" />
      {/* Botón central */}
      <circle cx="32" cy="26" r="2.5" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
      <circle cx="31" cy="25" r="0.8" fill="#fef3c7" />
      {/* Cordón colgante */}
      <path d="M32 26 Q40 24 50 28 L58 30" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      {/* Borla con sway */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '58px 30px' }}>
        <line x1="58" y1="30" x2="58" y2="42" stroke={`url(#${id}tas)`} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="58" cy="46" rx="4" ry="5" fill={`url(#${id}tas)`} stroke="#92400e" strokeWidth="1.2" />
        {/* Hilos de la borla */}
        <line x1="55" y1="44" x2="54" y2="50" stroke="#a16207" strokeWidth="0.8" />
        <line x1="58" y1="44" x2="58" y2="51" stroke="#a16207" strokeWidth="0.8" />
        <line x1="61" y1="44" x2="62" y2="50" stroke="#a16207" strokeWidth="0.8" />
      </g>
      {/* Estrellas de honor */}
      <g className="ba-anim anim-twinkle">
        <path d="M10 12 L11 14 L13 14 L11.5 15.5 L12 18 L10 16.5 L8 18 L8.5 15.5 L7 14 L9 14 Z" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M52 8 L53 10 L55 10 L53.5 11.5 L54 14 L52 12.5 L50 14 L50.5 11.5 L49 10 L51 10 Z" fill="#fde047" />
      </g>
    </>
  ),
  exams_25: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}lp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbeafe" /><stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`${id}rp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fce7f3" /><stop offset="1" stopColor="#be185d" />
        </linearGradient>
      </defs>
      {/* Sombra */}
      <ellipse cx="32" cy="56" rx="24" ry="2" fill="#0f172a" opacity="0.3" />
      {/* Libro abierto */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 32px' }}>
        {/* Página izquierda */}
        <path d="M6 14 L30 12 L32 18 V52 L30 50 L6 52 Z" fill={`url(#${id}lp)`} stroke="#0f172a" {...S} />
        {/* Página derecha */}
        <path d="M58 14 L34 12 L32 18 V52 L34 50 L58 52 Z" fill={`url(#${id}rp)`} stroke="#0f172a" {...S} />
        {/* Lomo central */}
        <line x1="32" y1="18" x2="32" y2="52" stroke="#0f172a" strokeWidth="2" />
        {/* Líneas de texto izquierda */}
        <line x1="10" y1="22" x2="28" y2="20" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="10" y1="28" x2="28" y2="26" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="10" y1="34" x2="26" y2="32" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="10" y1="40" x2="28" y2="38" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        {/* Líneas de texto derecha */}
        <line x1="36" y1="20" x2="54" y2="22" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="36" y1="26" x2="54" y2="28" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="36" y1="32" x2="52" y2="34" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="36" y1="38" x2="54" y2="40" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      </g>
      {/* Lápiz que escribe */}
      <g className="ba-anim anim-runner" style={{ transformOrigin: '44px 46px' }}>
        <line x1="40" y1="40" x2="50" y2="50" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M50 50 L52 48 L54 52 L52 54 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        <path d="M40 40 L38 42 L40 44 L42 42 Z" fill="#1f2937" />
      </g>
      {/* Letras flotando */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '14px 10px' }}>
        <text x="14" y="9" fontSize="5" fontWeight="900" fill="#1d4ed8">A</text>
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '50px 10px', animationDelay: '.8s' }}>
        <text x="50" y="9" fontSize="5" fontWeight="900" fill="#be185d">B</text>
      </g>
      {/* Estrella decorativa */}
      <g className="ba-anim anim-twinkle">
        <path d="M32 8 L33 11 L36 11 L34 13 L35 16 L32 14 L29 16 L30 13 L28 11 L31 11 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
    </>
  ),
  exams_50: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}brain`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fce7f3" />
          <stop offset="0.4" stopColor="#f9a8d4" />
          <stop offset="0.85" stopColor="#be185d" />
          <stop offset="1" stopColor="#500724" />
        </radialGradient>
        <linearGradient id={`${id}elec`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Halo de actividad cerebral */}
      <circle cx="32" cy="32" r="28" fill="#ec4899" opacity="0.1" />
      <circle cx="32" cy="32" r="24" fill="#f472b6" opacity="0.12" />
      {/* Forma del cerebro */}
      <path d="M22 14 Q14 14 14 22 Q6 24 10 32 Q6 40 16 42 Q18 50 28 48 Q32 54 36 48 Q46 50 48 42 Q58 40 54 32 Q58 24 50 22 Q50 14 42 14 Q38 6 32 12 Q26 6 22 14 Z"
            fill={`url(#${id}brain)`} stroke="#831843" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Surcos cerebrales */}
      <path d="M16 22 Q22 26 18 32 Q22 38 16 40" fill="none" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M48 22 Q42 26 46 32 Q42 38 48 40" fill="none" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 18 Q26 24 24 30 Q22 36 26 42" fill="none" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 18 Q38 24 40 30 Q42 36 38 42" fill="none" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="12" x2="32" y2="48" stroke="#831843" strokeWidth="1.5" strokeLinecap="round" />
      {/* Highlights */}
      <ellipse cx="22" cy="20" rx="3" ry="2" fill="#fff" opacity="0.5" />
      <ellipse cx="42" cy="20" rx="3" ry="2" fill="#fff" opacity="0.5" />
      {/* Rayos eléctricos saliendo (sinapsis) */}
      <g className="ba-anim anim-bolt">
        <path d="M14 8 L18 14 L16 16 L20 22" fill="none" stroke={`url(#${id}elec)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="ba-anim anim-bolt" style={{ animationDelay: '.4s' }}>
        <path d="M50 8 L46 14 L48 16 L44 22" fill="none" stroke={`url(#${id}elec)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="ba-anim anim-bolt" style={{ animationDelay: '.8s' }}>
        <path d="M6 36 L12 38 L10 42 L14 44" fill="none" stroke={`url(#${id}elec)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="ba-anim anim-bolt" style={{ animationDelay: '1.2s' }}>
        <path d="M58 36 L52 38 L54 42 L50 44" fill="none" stroke={`url(#${id}elec)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Bombilla de idea */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="30" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="32" cy="30" r="1" fill="#fef9c3" />
      </g>
    </>
  ),
  exams_100: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bolt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.85" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}halo100`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fef9c3" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo radial */}
      <circle cx="32" cy="32" r="30" fill={`url(#${id}halo100)`} />
      {/* Anillo de impacto */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="6" fill="none" stroke="#fde047" strokeWidth="2" />
      </g>
      {/* Rayos contra rotación detrás */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 22;
          const y1 = 32 - Math.cos(a) * 22;
          const x2 = 32 + Math.sin(a) * 30;
          const y2 = 32 - Math.cos(a) * 30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />;
        })}
      </g>
      {/* Rayo principal con doble glow */}
      <g className="ba-anim anim-bolt" style={{ transformOrigin: '32px 32px' }}>
        <path d="M36 6 L14 36 H30 L26 58 L50 26 H32 Z" fill="none" stroke="#fde047" strokeWidth="7" strokeLinejoin="round" opacity="0.5" />
        <path d="M36 6 L14 36 H30 L26 58 L50 26 H32 Z" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinejoin="round" opacity="0.7" />
        <path d="M36 6 L14 36 H30 L26 58 L50 26 H32 Z" fill={`url(#${id}bolt)`} stroke="#7c2d12" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M34 10 L18 34 L22 34" fill="none" stroke="#fffbeb" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Chispas eléctricas */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 16 L11 13 L9 18 L11 23 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M56 16 L53 13 L55 18 L53 23 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="48" cy="48" r="1.5" fill="#fef9c3" />
      </g>
      <g className="ba-anim anim-twinkle">
        <circle cx="14" cy="50" r="1.5" fill="#fef9c3" />
      </g>
    </>
  ),
  exams_200: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}sky200`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="0.5" stopColor="#0369a1" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}rng`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id={`${id}eye200`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.4" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
        <radialGradient id={`${id}haloT`} cx="0.5" cy="0.3">
          <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.45" />
          <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloT)`} />
      {/* Vórtice de capas giratorias */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 30px' }}>
        <path d="M4 14 H60 L48 24 H16 Z" fill={`url(#${id}sky200)`} stroke="#082f49" strokeWidth="2" strokeLinejoin="round" opacity="0.8" />
        <path d="M14 26 H50 L42 36 H22 Z" fill="#0891b2" stroke="#082f49" strokeWidth="2" strokeLinejoin="round" opacity="0.85" />
        <path d="M22 38 L42 38 L36 48 H28 Z" fill="#14b8a6" stroke="#082f49" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      </g>
      {/* Anillos de poder */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 30px' }}>
        <circle cx="32" cy="30" r="18" fill="none" stroke={`url(#${id}rng)`} strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        <circle cx="32" cy="30" r="12" fill="none" stroke={`url(#${id}rng)`} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      </g>
      {/* Ojo central omnisciente */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 30px' }}>
        <ellipse cx="32" cy="30" rx="8" ry="6" fill={`url(#${id}eye200)`} stroke="#082f49" strokeWidth="1.5" />
        <circle cx="32" cy="30" r="3" fill="#0c4a6e" stroke="#082f49" strokeWidth="0.8" />
        <circle cx="32" cy="30" r="1.5" fill="#fef3c7" />
        <ellipse cx="30" cy="28" rx="1" ry="0.6" fill="#fff" opacity="0.9" />
      </g>
      {/* Pilar inferior */}
      <line x1="32" y1="48" x2="32" y2="58" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="60" r="3" fill="#0891b2" stroke="#082f49" strokeWidth="1.5" />
      <circle cx="32" cy="60" r="1" fill="#fbbf24" />
      {/* "200" inscrito */}
      <text x="32" y="42" textAnchor="middle" fontSize="5" fontWeight="900" fill="#fef3c7" stroke="#082f49" strokeWidth="0.4">200</text>
      {/* Chispas */}
      <g className="ba-anim anim-twinkle">
        <circle cx="6" cy="6" r="1.2" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="58" cy="6" r="1.2" fill="#22d3ee" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="10" cy="58" r="1" fill="#fde047" />
      </g>
    </>
  ),

  // ═══════════════════════ MAESTRIA: notas perfectas ═══════════════════════
  perfect_1: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}star`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.5" stopColor="#fde047" />
          <stop offset="1" stopColor="#b45309" />
        </radialGradient>
      </defs>
      {/* Halo / rayos largos detrás */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        <line x1="32" y1="2" x2="32" y2="10" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="54" x2="32" y2="62" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="32" x2="10" y2="32" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <line x1="54" y1="32" x2="62" y2="32" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <line x1="11" y1="11" x2="16" y2="16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="48" x2="53" y2="53" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="53" y1="11" x2="48" y2="16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="48" x2="11" y2="53" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Estrella principal con glow */}
      <g className="ba-anim anim-glow">
        <path d="M32 8 L39 24 L57 26 L43 38 L48 56 L32 47 L16 56 L21 38 L7 26 L25 24 Z"
              fill={`url(#${id}star)`} stroke="#7c2d12" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Estrella interior */}
        <path d="M32 16 L35 26 L46 27 L37 33 L40 44 L32 38 L24 44 L27 33 L18 27 L29 26 Z"
              fill="#fef9c3" opacity="0.5" />
        {/* Highlight */}
        <circle cx="27" cy="22" r="2" fill="#fffbeb" opacity="0.9" />
      </g>
      {/* Mini chispa orbitando */}
      <g className="ba-anim anim-orbit-cw" style={{ transformOrigin: '32px 32px' }}>
        <g transform="translate(0,-22)">
          <circle cx="32" cy="32" r="1.6" fill="#fef3c7" />
        </g>
      </g>
    </>
  ),
  perfect_3: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}s1`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#dbeafe" /><stop offset="1" stopColor="#1d4ed8" />
        </radialGradient>
        <radialGradient id={`${id}s2`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fce7f3" /><stop offset="1" stopColor="#be185d" />
        </radialGradient>
        <radialGradient id={`${id}s3`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#b45309" />
        </radialGradient>
      </defs>
      {/* Arco de luz conectando */}
      <path d="M10 24 Q32 6 54 24" fill="none" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
      {/* Estrella izquierda (azul) */}
      <g className="ba-anim anim-twinkle" style={{ transformOrigin: '14px 24px' }}>
        <path d="M14 10 L17 19 L26 20 L19 25 L21 33 L14 29 L7 33 L9 25 L2 20 L11 19 Z"
              fill={`url(#${id}s1)`} stroke="#1e3a8a" {...S} />
        <circle cx="11" cy="18" r="1" fill="#fff" opacity="0.8" />
      </g>
      {/* Estrella derecha (rosa) */}
      <g className="ba-anim anim-twinkle-2" style={{ transformOrigin: '50px 24px' }}>
        <path d="M50 10 L53 19 L62 20 L55 25 L57 33 L50 29 L43 33 L45 25 L38 20 L47 19 Z"
              fill={`url(#${id}s2)`} stroke="#831843" {...S} />
        <circle cx="47" cy="18" r="1" fill="#fff" opacity="0.8" />
      </g>
      {/* Estrella central grande (oro) */}
      <g className="ba-anim anim-twinkle-3" style={{ transformOrigin: '32px 44px' }}>
        <path d="M32 26 L36 38 L48 39 L39 47 L42 58 L32 51 L22 58 L25 47 L16 39 L28 38 Z"
              fill={`url(#${id}s3)`} stroke="#7c2d12" {...S} />
        <circle cx="29" cy="36" r="1.4" fill="#fffbeb" opacity="0.9" />
      </g>
      {/* Chispas pequeñas */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="20" r="1" fill="#fef3c7" />
      </g>
    </>
  ),
  perfect_5: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}sun`} cx="0.4" cy="0.4">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.8" stopColor="#f97316" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
        <linearGradient id={`${id}ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Rayos triangulares grandes (12) */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 18;
          const y1 = 32 - Math.cos(a) * 18;
          const x2 = 32 + Math.sin(a) * 30;
          const y2 = 32 - Math.cos(a) * 30;
          const ax = 32 + Math.sin(a + 0.18) * 18;
          const ay = 32 - Math.cos(a + 0.18) * 18;
          const bx = 32 + Math.sin(a - 0.18) * 18;
          const by = 32 - Math.cos(a - 0.18) * 18;
          return (
            <path key={i} d={`M${ax} ${ay} L${x2} ${y2} L${bx} ${by} Z`} fill={`url(#${id}ray)`} stroke="#7f1d1d" strokeWidth="1" strokeLinejoin="round" />
          );
        })}
      </g>
      {/* Rayos cortos contra-rotación */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i * 30 + 15) * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 14;
          const y1 = 32 - Math.cos(a) * 14;
          const x2 = 32 + Math.sin(a) * 18;
          const y2 = 32 - Math.cos(a) * 18;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />;
        })}
      </g>
      {/* Núcleo del sol */}
      <circle cx="32" cy="32" r="14" fill={`url(#${id}sun)`} stroke="#7c2d12" strokeWidth="2" />
      {/* Cara sonriente */}
      <circle cx="27" cy="30" r="1.5" fill="#7c2d12" />
      <circle cx="37" cy="30" r="1.5" fill="#7c2d12" />
      <path d="M26 35 Q32 40 38 35" fill="none" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
      {/* Highlight */}
      <ellipse cx="27" cy="26" rx="3" ry="2" fill="#fffbeb" opacity="0.7" />
    </>
  ),
  perfect_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bolt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.8" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id={`${id}cloud`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* Nubes detrás */}
      <g opacity="0.8">
        <ellipse cx="14" cy="14" rx="8" ry="4" fill={`url(#${id}cloud)`} stroke="#1e293b" strokeWidth="1.2" />
        <ellipse cx="18" cy="12" rx="6" ry="3" fill={`url(#${id}cloud)`} stroke="#1e293b" strokeWidth="1.2" />
        <ellipse cx="50" cy="50" rx="8" ry="4" fill={`url(#${id}cloud)`} stroke="#1e293b" strokeWidth="1.2" />
        <ellipse cx="46" cy="48" rx="5" ry="2.5" fill={`url(#${id}cloud)`} stroke="#1e293b" strokeWidth="1.2" />
      </g>
      {/* Anillo de impacto inferior */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '24px 58px' }}>
        <circle cx="24" cy="58" r="3" fill="none" stroke="#fde047" strokeWidth="2" />
      </g>
      {/* Rayo principal con glow */}
      <g className="ba-anim anim-bolt" style={{ transformOrigin: '32px 32px' }}>
        {/* Glow exterior */}
        <path d="M50 6 L34 28 L42 32 L24 58 L32 36 L22 32 Z" fill="none" stroke="#fde047" strokeWidth="6" strokeLinejoin="round" opacity="0.5" />
        {/* Cuerpo */}
        <path d="M50 6 L34 28 L42 32 L24 58 L32 36 L22 32 Z" fill={`url(#${id}bolt)`} stroke="#7c2d12" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Highlight interior */}
        <path d="M48 8 L36 26 L40 30" fill="none" stroke="#fffbeb" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Chispas eléctricas alrededor */}
      <g className="ba-anim anim-twinkle">
        <path d="M10 32 L14 28 L12 32 L14 36 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M54 32 L50 28 L52 32 L50 36 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="56" cy="20" r="1.2" fill="#fef9c3" />
      </g>
    </>
  ),
  perfect_25: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cup`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.4" stopColor="#fbbf24" />
          <stop offset="0.85" stopColor="#d97706" />
          <stop offset="1" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}gemP`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="28" fill="#fbbf24" opacity="0.12" />
      {/* Rayos */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 26;
          const y1 = 32 - Math.cos(a) * 26;
          const x2 = 32 + Math.sin(a) * 31;
          const y2 = 32 - Math.cos(a) * 31;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.7" />;
        })}
      </g>
      {/* Pedestal */}
      <rect x="22" y="50" width="20" height="8" rx="1" fill={`url(#${id}base)`} stroke="#451a03" strokeWidth="1.5" />
      <rect x="24" y="52" width="16" height="2" fill="#fffbeb" opacity="0.4" />
      {/* Tallo */}
      <rect x="29" y="42" width="6" height="10" fill={`url(#${id}cup)`} stroke="#7c2d12" strokeWidth="1.5" />
      {/* Copa principal */}
      <path d="M14 12 H50 V24 Q50 40 32 42 Q14 40 14 24 Z" fill={`url(#${id}cup)`} stroke="#7c2d12" {...S} strokeLinejoin="round" />
      {/* Asa izquierda doble */}
      <path d="M14 14 Q4 14 4 22 Q4 30 14 32" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M14 16 Q6 16 6 22" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      {/* Asa derecha doble */}
      <path d="M50 14 Q60 14 60 22 Q60 30 50 32" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M50 16 Q58 16 58 22" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      {/* Borde superior decorado */}
      <line x1="14" y1="14" x2="50" y2="14" stroke="#fffbeb" strokeWidth="1" opacity="0.7" />
      {/* Highlight */}
      <ellipse cx="20" cy="20" rx="2.5" ry="6" fill="#fffbeb" opacity="0.65" />
      {/* "25" inscrito */}
      <text x="32" y="30" textAnchor="middle" fontSize="11" fontWeight="900" fill="#7c2d12" stroke="#fef3c7" strokeWidth="0.6">25</text>
      {/* Gema arriba */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 12px' }}>
        <path d="M28 6 L36 6 L38 12 L32 18 L26 12 Z" fill={`url(#${id}gemP)`} stroke="#7c2d12" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M28 6 L32 12 L36 6" fill="none" stroke="#fffbeb" strokeWidth="0.8" />
      </g>
      {/* Estrellas decorativas */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 40 L9 42 L11 42 L9.5 43.5 L10 46 L8 44.5 L6 46 L6.5 43.5 L5 42 L7 42 Z" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M56 40 L57 42 L59 42 L57.5 43.5 L58 46 L56 44.5 L54 46 L54.5 43.5 L53 42 L55 42 Z" fill="#fbbf24" />
      </g>
    </>
  ),
  perfect_50: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}diam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="0.3" stopColor="#38bdf8" />
          <stop offset="0.7" stopColor="#0284c7" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}crn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id={`${id}haloDi`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}dcl`}>
          <path d="M14 22 L24 8 H40 L50 22 L32 58 Z" />
        </clipPath>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloDi)`} />
      {/* Rayos exteriores */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 28;
          const y1 = 32 - Math.cos(a) * 28;
          const x2 = 32 + Math.sin(a) * 34;
          const y2 = 32 - Math.cos(a) * 34;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />;
        })}
      </g>
      {/* Diamante cuerpo */}
      <path d="M14 22 L24 8 H40 L50 22 L32 58 Z" fill={`url(#${id}diam)`} stroke="#075985" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Facetas interiores */}
      <line x1="14" y1="22" x2="50" y2="22" stroke="#e0f2fe" strokeWidth="1.5" />
      <line x1="24" y1="8" x2="32" y2="22" stroke="#bae6fd" strokeWidth="1" />
      <line x1="40" y1="8" x2="32" y2="22" stroke="#bae6fd" strokeWidth="1" />
      <line x1="32" y1="22" x2="32" y2="58" stroke="#bae6fd" strokeWidth="1" opacity="0.7" />
      <line x1="14" y1="22" x2="32" y2="58" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="22" x2="32" y2="58" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.6" />
      {/* Brillos interiores triangulares */}
      <path d="M26 10 L32 22 L20 22 Z" fill="#e0f2fe" opacity="0.5" />
      <path d="M38 10 L32 22 L44 22 Z" fill="#bae6fd" opacity="0.35" />
      <path d="M32 22 L20 22 L32 42 Z" fill="#7dd3fc" opacity="0.2" />
      {/* Sweep luminoso */}
      <g clipPath={`url(#${id}dcl)`}>
        <g className="ba-anim anim-gleam">
          <rect x="22" y="-4" width="8" height="70" fill="#fff" opacity="0.6" transform="skewX(-15)" />
        </g>
      </g>
      {/* Highlight superior */}
      <ellipse cx="28" cy="14" rx="2" ry="3" fill="#fff" opacity="0.8" />
      {/* Corona debajo — pedestal */}
      <path d="M22 58 L26 54 L29 58 L32 54 L35 58 L38 54 L42 58 L41 62 L23 62 Z" fill={`url(#${id}crn)`} stroke="#7c2d12" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Chispas de diamante */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 14 L10 12 L8 10 L6 12 Z" fill="#fff" stroke="#38bdf8" strokeWidth="0.5" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M56 14 L58 12 L56 10 L54 12 Z" fill="#fff" stroke="#38bdf8" strokeWidth="0.5" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="6" cy="36" r="1" fill="#bae6fd" />
      </g>
      <g className="ba-anim anim-twinkle">
        <circle cx="58" cy="36" r="1" fill="#bae6fd" />
      </g>
    </>
  ),

  // ═══════════════════════ MAESTRIA: 10 en apps distintas ═══════════════════════
  perfect_1_app: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}rib1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id={`${id}rib2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dc2626" /><stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <radialGradient id={`${id}med`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.85" stopColor="#d97706" />
          <stop offset="1" stopColor="#78350f" />
        </radialGradient>
        <clipPath id={`${id}clip`}>
          <circle cx="32" cy="40" r="14" />
        </clipPath>
      </defs>
      {/* Cintas cruzadas */}
      <path d="M14 6 L24 8 L32 26 L22 24 Z" fill={`url(#${id}rib1)`} stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M50 6 L40 8 L32 26 L42 24 Z" fill={`url(#${id}rib2)`} stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Medalla balanceando */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 24px' }}>
        {/* Anillo */}
        <rect x="29" y="22" width="6" height="6" rx="1.5" fill="#fbbf24" stroke="#92400e" strokeWidth="1.2" />
        {/* Disco principal */}
        <circle cx="32" cy="40" r="14" fill={`url(#${id}med)`} stroke="#7c2d12" {...S} />
        {/* Borde decorado */}
        <circle cx="32" cy="40" r="11" fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="2 2" />
        {/* Estrella central */}
        <path d="M32 32 L34 38 L40 38 L35 41 L37 47 L32 43 L27 47 L29 41 L24 38 L30 38 Z"
              fill="#fef9c3" stroke="#78350f" strokeWidth="1.2" strokeLinejoin="round" />
        {/* Highlight */}
        <ellipse cx="27" cy="34" rx="3" ry="2" fill="#fffbeb" opacity="0.6" />
        {/* Sweep brillante */}
        <g clipPath={`url(#${id}clip)`}>
          <g className="ba-anim anim-gleam">
            <rect x="24" y="20" width="6" height="40" fill="#fff" opacity="0.5" transform="skewX(-20)" />
          </g>
        </g>
      </g>
    </>
  ),
  perfect_3_apps: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}rib1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" /><stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id={`${id}rib2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}brz`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#fed7aa" />
          <stop offset="0.4" stopColor="#fb923c" />
          <stop offset="0.85" stopColor="#9a3412" />
          <stop offset="1" stopColor="#431407" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle cx="32" cy="40" r="16" />
        </clipPath>
      </defs>
      {/* Cintas zigzag */}
      <path d="M14 4 L24 8 L18 18 L28 22 L22 32 L32 26" fill={`url(#${id}rib1)`} stroke="#451a03" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M50 4 L40 8 L46 18 L36 22 L42 32 L32 26" fill={`url(#${id}rib2)`} stroke="#451a03" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Medalla */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 24px' }}>
        {/* Gancho */}
        <rect x="29" y="22" width="6" height="4" rx="1" fill="#a16207" stroke="#451a03" strokeWidth="1" />
        {/* Disco */}
        <circle cx="32" cy="40" r="16" fill={`url(#${id}brz)`} stroke="#451a03" strokeWidth="2.5" />
        {/* Borde rayado decorativo */}
        <circle cx="32" cy="40" r="13" fill="none" stroke="#7c2d12" strokeWidth="1" />
        {/* Laurel izquierdo */}
        <path d="M22 36 Q20 40 22 44 Q24 42 25 38 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
        <path d="M21 38 Q19 42 21 46 Q23 44 24 40 Z" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        {/* Laurel derecho */}
        <path d="M42 36 Q44 40 42 44 Q40 42 39 38 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
        <path d="M43 38 Q45 42 43 46 Q41 44 40 40 Z" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        {/* Número 3 grande */}
        <text x="32" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fef3c7" stroke="#7c2d12" strokeWidth="0.8">3</text>
        {/* Highlight */}
        <ellipse cx="26" cy="32" rx="3" ry="2" fill="#fffbeb" opacity="0.6" />
        {/* Sweep */}
        <g clipPath={`url(#${id}c)`}>
          <g className="ba-anim anim-gleam">
            <rect x="22" y="20" width="6" height="40" fill="#fff" opacity="0.5" transform="skewX(-20)" />
          </g>
        </g>
      </g>
    </>
  ),
  perfect_5_apps: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}rib1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}rib2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9a8d4" /><stop offset="1" stopColor="#831843" />
        </linearGradient>
        <radialGradient id={`${id}slv`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#e2e8f0" />
          <stop offset="0.85" stopColor="#475569" />
          <stop offset="1" stopColor="#0f172a" />
        </radialGradient>
        <clipPath id={`${id}c5`}>
          <circle cx="32" cy="40" r="17" />
        </clipPath>
      </defs>
      {/* Cintas dobles */}
      <path d="M10 4 L20 6 L26 16 L34 14 L32 24 L20 22 Z" fill={`url(#${id}rib1)`} stroke="#082f49" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M54 4 L44 6 L38 16 L30 14 L32 24 L44 22 Z" fill={`url(#${id}rib2)`} stroke="#500724" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Medalla */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 24px' }}>
        {/* Anilla */}
        <rect x="29" y="22" width="6" height="4" rx="1" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" />
        {/* Disco principal */}
        <circle cx="32" cy="40" r="17" fill={`url(#${id}slv)`} stroke="#0f172a" strokeWidth="2.5" />
        {/* Borde decorado */}
        <circle cx="32" cy="40" r="14" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="2 2" />
        {/* Laureles izquierdo */}
        <path d="M20 36 Q18 40 19 44 Q22 42 23 38 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
        <path d="M19 39 Q17 43 18 47 Q21 45 22 41 Z" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        <path d="M18 42 Q16 46 17 50 Q20 48 21 44 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
        {/* Laureles derecho */}
        <path d="M44 36 Q46 40 45 44 Q42 42 41 38 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
        <path d="M45 39 Q47 43 46 47 Q43 45 42 41 Z" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
        <path d="M46 42 Q48 46 47 50 Q44 48 43 44 Z" fill="#15803d" stroke="#14532d" strokeWidth="0.8" />
        {/* Número 5 */}
        <text x="32" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6">5</text>
        {/* 5 puntos pequeños alrededor del centro (5 apps) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = ((i * 72 - 90) * Math.PI) / 180;
          const x = 32 + Math.cos(a) * 8;
          const y = 40 + Math.sin(a) * 8;
          return <circle key={i} cx={x} cy={y} r="1" fill="#fbbf24" />;
        })}
        {/* Highlight */}
        <ellipse cx="26" cy="32" rx="3" ry="2" fill="#fff" opacity="0.7" />
        {/* Sweep */}
        <g clipPath={`url(#${id}c5)`}>
          <g className="ba-anim anim-gleam">
            <rect x="22" y="20" width="6" height="40" fill="#fff" opacity="0.55" transform="skewX(-20)" />
          </g>
        </g>
      </g>
      {/* Estrellas */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 14 L9 16 L11 16 L9.5 17.5 L10 20 L8 18.5 L6 20 L6.5 17.5 L5 16 L7 16 Z" fill="#fde047" />
      </g>
    </>
  ),
  perfect_10_apps: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}rib10a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dc2626" /><stop offset="1" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id={`${id}rib10b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#451a03" />
        </linearGradient>
        <radialGradient id={`${id}gld10`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.3" stopColor="#fde047" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#451a03" />
        </radialGradient>
        <radialGradient id={`${id}haloG`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}c10`}>
          <circle cx="32" cy="40" r="18" />
        </clipPath>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="36" r="32" fill={`url(#${id}haloG)`} />
      {/* Cintas cruzadas anchas */}
      <path d="M8 2 L22 6 L28 18 L36 16 L32 26 L20 24 Z" fill={`url(#${id}rib10a)`} stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M56 2 L42 6 L36 18 L28 16 L32 26 L44 24 Z" fill={`url(#${id}rib10b)`} stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Medalla con sway */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 24px' }}>
        {/* Anilla */}
        <rect x="28" y="20" width="8" height="6" rx="2" fill="#d97706" stroke="#451a03" strokeWidth="1.2" />
        {/* Disco */}
        <circle cx="32" cy="40" r="18" fill={`url(#${id}gld10)`} stroke="#451a03" strokeWidth="3" />
        {/* Borde decorado */}
        <circle cx="32" cy="40" r="15" fill="none" stroke="#7c2d12" strokeWidth="1.2" strokeDasharray="2 2" />
        {/* Laureles (5 hojas cada lado) */}
        {[-1, 1].map((side) => (
          Array.from({ length: 5 }).map((_, i) => {
            const cx = 32 + side * 12;
            const y = 30 + i * 4;
            return (
              <ellipse key={`${side}${i}`} cx={cx} cy={y} rx="2.5" ry="1.5"
                fill={i % 2 ? '#16a34a' : '#15803d'} stroke="#14532d" strokeWidth="0.6"
                transform={`rotate(${side * (-20 + i * 8)} ${cx} ${y})`} />
            );
          })
        ))}
        {/* "10" grande */}
        <text x="32" y="46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fef3c7" stroke="#7c2d12" strokeWidth="0.8">10</text>
        {/* 10 puntos pequeños alrededor */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = ((i * 36 - 90) * Math.PI) / 180;
          const x = 32 + Math.cos(a) * 10;
          const y = 40 + Math.sin(a) * 10;
          return <circle key={i} cx={x} cy={y} r="0.8" fill="#fef3c7" />;
        })}
        {/* Highlight */}
        <ellipse cx="24" cy="30" rx="4" ry="2" fill="#fffbeb" opacity="0.6" />
        {/* Sweep */}
        <g clipPath={`url(#${id}c10)`}>
          <g className="ba-anim anim-gleam">
            <rect x="20" y="18" width="8" height="48" fill="#fff" opacity="0.5" transform="skewX(-20)" />
          </g>
        </g>
      </g>
    </>
  ),
  perfect_15_apps: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}iris`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.3" stopColor="#22d3ee" />
          <stop offset="0.7" stopColor="#0284c7" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
        <linearGradient id={`${id}lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <radialGradient id={`${id}haloE`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.45" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloE)`} />
      {/* Aura pulsante */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="8" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
      </g>
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 32px', animationDelay: '1s' }}>
        <circle cx="32" cy="32" r="8" fill="none" stroke="#fde047" strokeWidth="2" />
      </g>
      {/* Triángulo místico */}
      <path d="M32 6 L58 50 H6 Z" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <path d="M32 56 L6 14 H58 Z" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      {/* Ojo de la providencia */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        {/* Forma del ojo */}
        <path d="M4 32 Q32 10 60 32 Q32 54 4 32 Z" fill={`url(#${id}lid)`} stroke="#1e1b4b" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Iris */}
        <circle cx="32" cy="32" r="10" fill={`url(#${id}iris)`} stroke="#0c4a6e" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="5" fill="#0f172a" stroke="#0c4a6e" strokeWidth="0.8" />
        <circle cx="32" cy="32" r="2" fill="#fef3c7" />
        {/* Highlights */}
        <circle cx="29" cy="28" r="2" fill="#fff" opacity="0.9" />
        <circle cx="36" cy="34" r="1" fill="#fff" opacity="0.5" />
      </g>
      {/* Rayos de visión */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 20;
          const y1 = 32 - Math.cos(a) * 20;
          const x2 = 32 + Math.sin(a) * 26;
          const y2 = 32 - Math.cos(a) * 26;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />;
        })}
      </g>
      {/* "15" debajo */}
      <text x="32" y="60" textAnchor="middle" fontSize="7" fontWeight="900" fill="#fef3c7" stroke="#1e1b4b" strokeWidth="0.5">15 APPS</text>
    </>
  ),

  // ═══════════════════════ EXPLORACION ═══════════════════════
  apps_1: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}lens`} cx="0.35" cy="0.35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#0369a1" />
        </radialGradient>
        <linearGradient id={`${id}map`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      {/* Mapa de fondo */}
      <rect x="6" y="14" width="40" height="36" rx="2" fill={`url(#${id}map)`} stroke="#92400e" {...S} />
      {/* Carreteras */}
      <path d="M10 22 Q24 16 30 28 T44 36" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M14 46 Q22 36 32 42" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Pin de ubicación */}
      <path d="M22 24 Q22 18 26 18 Q30 18 30 24 Q30 28 26 32 Q22 28 22 24 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.2" />
      <circle cx="26" cy="23" r="1.5" fill="#fff" />
      {/* Lupa con shake */}
      <g className="ba-anim anim-shake" style={{ transformOrigin: '40px 38px' }}>
        {/* Lente */}
        <circle cx="40" cy="38" r="11" fill={`url(#${id}lens)`} stroke="#0f172a" strokeWidth="2.5" opacity="0.85" />
        {/* Reflejo */}
        <ellipse cx="36" cy="34" rx="3" ry="2" fill="#fff" opacity="0.7" />
        {/* Mango */}
        <line x1="48" y1="46" x2="58" y2="56" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
        <line x1="48" y1="46" x2="58" y2="56" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <circle cx="58" cy="56" r="2" fill="#7c2d12" />
      </g>
    </>
  ),
  apps_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bk1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fda4af" /><stop offset="1" stopColor="#9f1239" />
        </linearGradient>
        <linearGradient id={`${id}bk2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" /><stop offset="1" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={`${id}bk3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      {/* Tres libros apilados verticalmente */}
      <g className="ba-anim anim-wave" style={{ transformOrigin: '32px 50px' }}>
        {/* Libro inferior */}
        <rect x="6" y="42" width="52" height="12" rx="1.5" fill={`url(#${id}bk1)`} stroke="#7f1d1d" {...S} />
        <rect x="10" y="44" width="48" height="2" fill="#fecdd3" opacity="0.6" />
        <line x1="14" y1="48" x2="50" y2="48" stroke="#7f1d1d" strokeWidth="1" opacity="0.5" />
        {/* Libro medio */}
        <rect x="10" y="28" width="44" height="12" rx="1.5" fill={`url(#${id}bk2)`} stroke="#14532d" {...S} />
        <rect x="14" y="30" width="40" height="2" fill="#bbf7d0" opacity="0.6" />
        <line x1="18" y1="34" x2="50" y2="34" stroke="#14532d" strokeWidth="1" opacity="0.5" />
        {/* Libro superior */}
        <rect x="14" y="14" width="36" height="12" rx="1.5" fill={`url(#${id}bk3)`} stroke="#1e3a8a" {...S} />
        <rect x="18" y="16" width="32" height="2" fill="#bfdbfe" opacity="0.6" />
        <line x1="22" y1="20" x2="46" y2="20" stroke="#1e3a8a" strokeWidth="1" opacity="0.5" />
        {/* Marcador de cinta */}
        <path d="M45 14 L45 22 L43 20 L41 22 L41 14" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
      </g>
      {/* Letras flotando hacia arriba */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '20px 14px' }}>
        <text x="20" y="12" fontSize="6" fontWeight="900" fill="#3b82f6">A</text>
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '32px 14px', animationDelay: '.6s' }}>
        <text x="32" y="12" fontSize="6" fontWeight="900" fill="#10b981">B</text>
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '44px 14px', animationDelay: '1.2s' }}>
        <text x="44" y="12" fontSize="6" fontWeight="900" fill="#dc2626">C</text>
      </g>
    </>
  ),
  apps_5: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}face`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.6" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#78350f" />
        </radialGradient>
      </defs>
      {/* Cuerpo brújula */}
      <circle cx="32" cy="32" r="26" fill="#1e293b" stroke="#0f172a" {...S} />
      <circle cx="32" cy="32" r="22" fill={`url(#${id}face)`} stroke="#7c2d12" strokeWidth="1.5" />
      {/* Marcas cardinales */}
      <text x="32" y="14" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12">N</text>
      <text x="32" y="55" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12">S</text>
      <text x="52" y="35" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12">E</text>
      <text x="12" y="35" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12">O</text>
      {/* Marcas tick */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 32 + Math.sin(a) * 18;
        const y1 = 32 - Math.cos(a) * 18;
        const x2 = 32 + Math.sin(a) * 20;
        const y2 = 32 - Math.cos(a) * 20;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7c2d12" strokeWidth="1" />;
      })}
      {/* Aguja */}
      <g className="ba-anim anim-needle" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 14 L36 32 L32 50 L28 32 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M32 14 L34 32 L32 32 Z" fill="#fecaca" />
        <path d="M32 50 L30 32 L32 32 Z" fill="#fff" />
      </g>
      {/* Centro */}
      <circle cx="32" cy="32" r="2.5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
    </>
  ),
  apps_10: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}globe`} cx="0.35" cy="0.3">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="0.5" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
        <clipPath id={`${id}gc`}>
          <circle cx="32" cy="32" r="22" />
        </clipPath>
      </defs>
      {/* Esfera */}
      <circle cx="32" cy="32" r="22" fill={`url(#${id}globe)`} stroke="#0c4a6e" {...S} />
      {/* Continentes (siluetas verdes) */}
      <g clipPath={`url(#${id}gc)`}>
        <path d="M14 24 Q18 20 24 22 Q28 24 30 28 Q32 32 28 36 Q22 38 18 34 Q14 30 14 24 Z" fill="#15803d" stroke="#14532d" strokeWidth="1" />
        <path d="M36 18 Q42 16 48 20 Q50 24 46 28 Q40 28 38 24 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
        <path d="M34 38 Q40 38 44 42 Q46 46 42 50 Q36 50 34 44 Z" fill="#15803d" stroke="#14532d" strokeWidth="1" />
        <path d="M16 42 Q22 42 24 46 Q24 50 20 50 Q14 48 16 42 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
      </g>
      {/* Meridianos rotando */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="10" ry="22" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
        <ellipse cx="32" cy="32" rx="18" ry="22" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.4" />
      </g>
      {/* Ecuador y trópicos fijos */}
      <line x1="10" y1="32" x2="54" y2="32" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
      <line x1="14" y1="22" x2="50" y2="22" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <line x1="14" y1="42" x2="50" y2="42" stroke="#fff" strokeWidth="1" opacity="0.5" />
      {/* Avión orbitando */}
      <g className="ba-anim anim-orbit-cw" style={{ transformOrigin: '32px 32px' }}>
        <g transform="translate(0,-26)">
          <path d="M30 32 L34 28 L38 32 L34 36 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
          <path d="M34 28 L34 24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
      {/* Estrella de marca */}
      <g className="ba-anim anim-twinkle">
        <path d="M52 12 L53 14 L55 14 L53.5 15.5 L54 18 L52 16.5 L50 18 L50.5 15.5 L49 14 L51 14 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      </g>
    </>
  ),
  apps_15: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="0.5" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={`${id}wing`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      {/* Estela */}
      <g className="ba-anim anim-dash-slide">
        <path d="M2 50 Q14 44 22 38" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M4 56 Q14 52 20 48" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </g>
      {/* Sol al fondo */}
      <circle cx="50" cy="14" r="6" fill="#fbbf24" stroke="#92400e" strokeWidth="1.2" />
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '50px 14px' }}>
        <line x1="50" y1="4" x2="50" y2="6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="22" x2="50" y2="24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="14" x2="42" y2="14" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="58" y1="14" x2="60" y2="14" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Avión */}
      <g className="ba-anim anim-zoom-pop" style={{ transformOrigin: '32px 32px' }}>
        {/* Fuselaje */}
        <path d="M14 36 Q22 28 38 26 L52 22 L48 32 L52 42 L38 38 Q22 36 14 36 Z" fill={`url(#${id}body)`} stroke="#0f172a" {...S} strokeLinejoin="round" />
        {/* Ala superior */}
        <path d="M28 28 L36 14 L40 14 L34 30 Z" fill={`url(#${id}wing)`} stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Ala inferior */}
        <path d="M28 36 L34 50 L38 50 L34 36 Z" fill={`url(#${id}wing)`} stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Cabina */}
        <path d="M40 30 L48 26 L48 30 Z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth="1" />
        <ellipse cx="44" cy="28" rx="2" ry="1" fill="#fff" opacity="0.6" />
        {/* Hélice */}
        <line x1="52" y1="28" x2="52" y2="36" stroke="#0f172a" strokeWidth="1.5" />
        <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '52px 32px' }}>
          <line x1="48" y1="32" x2="56" y2="32" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </>
  ),
  apps_20: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#cbd5e1" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={`${id}strip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <radialGradient id={`${id}win`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#bfdbfe" />
          <stop offset="0.7" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
        <linearGradient id={`${id}flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset="0.3" stopColor="#fbbf24" />
          <stop offset="0.7" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      {/* Estrellas del fondo */}
      <g className="ba-anim anim-twinkle">
        <circle cx="8" cy="12" r="0.8" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="56" cy="14" r="0.8" fill="#fef3c7" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="14" cy="22" r="0.6" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle">
        <circle cx="50" cy="22" r="0.6" fill="#fff" />
      </g>
      {/* Cohete (fijo) */}
      <g className="ba-anim anim-rise" style={{ transformOrigin: '32px 32px' }}>
        {/* Cuerpo del cohete */}
        <path d="M32 4 Q44 16 44 32 V42 H20 V32 Q20 16 32 4 Z" fill={`url(#${id}body)`} stroke="#0f172a" {...S} strokeLinejoin="round" />
        {/* Banda decorativa */}
        <rect x="20" y="32" width="24" height="3" fill={`url(#${id}strip)`} stroke="#0f172a" strokeWidth="0.8" />
        {/* Líneas decorativas */}
        <line x1="20" y1="38" x2="44" y2="38" stroke="#475569" strokeWidth="1" />
        {/* Ventanilla */}
        <circle cx="32" cy="22" r="5" fill="#0f172a" stroke="#0f172a" strokeWidth="1.2" />
        <circle cx="32" cy="22" r="4" fill={`url(#${id}win)`} stroke="#0c4a6e" strokeWidth="0.8" />
        <circle cx="30" cy="20" r="1.5" fill="#fff" opacity="0.8" />
        {/* Ventanilla pequeña inferior */}
        <circle cx="32" cy="34.5" r="1.2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
        {/* Aletas */}
        <path d="M20 42 L12 56 L20 50 Z" fill={`url(#${id}strip)`} stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M44 42 L52 56 L44 50 Z" fill={`url(#${id}strip)`} stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M28 42 L26 50 L32 48 L38 50 L36 42 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" strokeLinejoin="round" />
      </g>
      {/* Llamas debajo (escala vertical) */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M26 48 Q24 54 28 58 Q30 54 30 50 Q32 56 32 52 Q34 58 34 50 Q34 54 36 58 Q40 54 38 48 Z"
              fill={`url(#${id}flame)`} stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
      </g>
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.15s' }}>
        <path d="M28 50 Q27 54 30 56 Q32 53 32 52 Q34 56 34 50 Q35 54 36 56 Q39 54 36 50 Z" fill="#fef9c3" />
      </g>
      {/* Humo abajo */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '24px 60px' }}>
        <circle cx="24" cy="60" r="2" fill="#cbd5e1" opacity="0.5" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '40px 60px', animationDelay: '.5s' }}>
        <circle cx="40" cy="60" r="2" fill="#cbd5e1" opacity="0.5" />
      </g>
    </>
  ),
  apps_30: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}neb`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="0.5" stopColor="#312e81" />
          <stop offset="0.8" stopColor="#4c1d95" />
          <stop offset="1" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id={`${id}star30`} cx="0.35" cy="0.35">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="1" stopColor="#92400e" />
        </radialGradient>
        <radialGradient id={`${id}haloN`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Fondo de nebulosa */}
      <circle cx="32" cy="32" r="30" fill={`url(#${id}neb)`} />
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloN)`} />
      {/* Polvo cósmico */}
      <circle cx="14" cy="14" r="0.7" fill="#fff" opacity="0.8" />
      <circle cx="52" cy="12" r="0.5" fill="#fff" opacity="0.6" />
      <circle cx="22" cy="50" r="0.5" fill="#fff" opacity="0.5" />
      <circle cx="46" cy="48" r="0.7" fill="#fff" opacity="0.6" />
      <circle cx="8" cy="30" r="0.4" fill="#fef3c7" opacity="0.5" />
      <circle cx="56" cy="36" r="0.4" fill="#fef3c7" opacity="0.5" />
      {/* Órbita exterior */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="26" ry="12" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
        <circle cx="58" cy="32" r="2" fill="#ec4899" stroke="#831843" strokeWidth="0.8" />
      </g>
      {/* Órbita interior contra */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="12" ry="24" fill="none" stroke="#f9a8d4" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.5" />
        <circle cx="32" cy="8" r="1.5" fill="#22d3ee" stroke="#0c4a6e" strokeWidth="0.6" />
      </g>
      {/* Órbita diagonal */}
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" transform="rotate(45 32 32)" />
        <circle cx="44" cy="18" r="1.2" fill="#fde047" />
      </g>
      {/* Sol central */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="8" fill={`url(#${id}star30)`} stroke="#7c2d12" strokeWidth="2" />
        <circle cx="32" cy="32" r="4" fill="#fffbeb" opacity="0.6" />
        <circle cx="30" cy="30" r="1.5" fill="#fff" opacity="0.9" />
      </g>
      {/* "30" etiqueta */}
      <text x="32" y="60" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fde047" stroke="#0f172a" strokeWidth="0.5">30 APPS</text>
      {/* Estrellas de fondo twinkling */}
      <g className="ba-anim anim-twinkle">
        <path d="M10 8 L11 10 L13 10 L11.5 11.5 L12 14 L10 12.5 L8 14 L8.5 11.5 L7 10 L9 10 Z" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M54 50 L55 52 L57 52 L55.5 53.5 L56 56 L54 54.5 L52 56 L52.5 53.5 L51 52 L53 52 Z" fill="#fef3c7" />
      </g>
    </>
  ),

  // ═══════════════════════ VELOCIDAD ═══════════════════════
  speed_60s: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bae6fd" /><stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {/* Suelo */}
      <line x1="4" y1="52" x2="60" y2="52" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      {/* Líneas de velocidad detrás */}
      <g className="ba-anim anim-dash-slide">
        <line x1="2" y1="22" x2="20" y2="22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="32" x2="22" y2="32" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="2" y1="42" x2="18" y2="42" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Corredor */}
      <g className="ba-anim anim-runner" style={{ transformOrigin: '36px 36px' }}>
        {/* Cabeza */}
        <circle cx="40" cy="14" r="4" fill={`url(#${id}body)`} stroke="#7f1d1d" strokeWidth="1.5" />
        {/* Banda */}
        <line x1="36" y1="13" x2="44" y2="13" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        {/* Torso */}
        <path d="M40 18 L34 30 L36 38" stroke={`url(#${id}body)`} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Brazo trasero */}
        <path d="M34 22 L26 18" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
        {/* Brazo delantero */}
        <path d="M36 24 L46 20" stroke="#fb923c" strokeWidth="3.5" strokeLinecap="round" />
        {/* Pierna trasera */}
        <path d="M36 38 L28 50" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
        {/* Pierna delantera */}
        <path d="M36 38 L46 46 L52 44" stroke="#fb923c" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
      {/* Cronómetro pequeño esquina */}
      <circle cx="14" cy="12" r="6" fill="#fff" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="14" y2="8" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '14px 12px' }}>
        <line x1="14" y1="12" x2="14" y2="8" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </>
  ),
  speed_30s: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}case`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#475569" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id={`${id}face`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fbbf24" />
        </radialGradient>
      </defs>
      {/* Botón superior */}
      <rect x="29" y="2" width="6" height="4" rx="1" fill={`url(#${id}case)`} stroke="#0f172a" strokeWidth="1" />
      <line x1="32" y1="6" x2="32" y2="10" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      {/* Botón izquierdo */}
      <rect x="14" y="14" width="4" height="3" rx="0.8" fill="#475569" stroke="#0f172a" strokeWidth="0.8" transform="rotate(-30 16 16)" />
      {/* Botón derecho */}
      <rect x="46" y="14" width="4" height="3" rx="0.8" fill="#475569" stroke="#0f172a" strokeWidth="0.8" transform="rotate(30 48 16)" />
      {/* Carcasa exterior */}
      <circle cx="32" cy="36" r="22" fill={`url(#${id}case)`} stroke="#0f172a" {...S} />
      {/* Cara */}
      <circle cx="32" cy="36" r="19" fill={`url(#${id}face)`} stroke="#0f172a" strokeWidth="1.5" />
      {/* Marcas tick — 60 segundos */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const big = i % 5 === 0;
        const r1 = big ? 14 : 16;
        const r2 = 18;
        const x1 = 32 + Math.sin(a) * r1;
        const y1 = 36 - Math.cos(a) * r1;
        const x2 = 32 + Math.sin(a) * r2;
        const y2 = 36 - Math.cos(a) * r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7c2d12" strokeWidth={big ? 1.5 : 0.6} strokeLinecap="round" />;
      })}
      {/* Números */}
      <text x="32" y="22" textAnchor="middle" fontSize="5" fontWeight="900" fill="#7c2d12">0</text>
      <text x="46" y="38.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#7c2d12">15</text>
      <text x="32" y="54" textAnchor="middle" fontSize="5" fontWeight="900" fill="#7c2d12">30</text>
      <text x="18" y="38.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#7c2d12">45</text>
      {/* Zona roja (de 0 a 30s) */}
      <path d="M32 36 L32 18 A18 18 0 0 1 32 54 Z" fill="#dc2626" opacity="0.15" />
      {/* Manecilla principal — gira rápida */}
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '32px 36px' }}>
        <line x1="32" y1="36" x2="32" y2="20" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="20" r="1.5" fill="#dc2626" />
      </g>
      {/* Manecilla pequeña fija */}
      <line x1="32" y1="36" x2="38" y2="36" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      {/* Núcleo */}
      <circle cx="32" cy="36" r="2.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
      {/* "30" en grande */}
      <text x="32" y="48" textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626" stroke="none">30s</text>
    </>
  ),
  speed_10s: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bolt10`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.8" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}halo10`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fef9c3" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo radial */}
      <circle cx="32" cy="32" r="28" fill={`url(#${id}halo10)`} />
      {/* Líneas de velocidad horizontales (a izquierda y derecha) */}
      <g className="ba-anim anim-dash-slide">
        <line x1="2" y1="14" x2="18" y2="14" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="24" x2="20" y2="24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="2" y1="34" x2="18" y2="34" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="44" x2="16" y2="44" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="2" y1="54" x2="18" y2="54" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Anillo de impacto */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '34px 32px' }}>
        <circle cx="34" cy="32" r="6" fill="none" stroke="#fde047" strokeWidth="2" />
      </g>
      {/* Rayo principal con triple capa */}
      <g className="ba-anim anim-bolt" style={{ transformOrigin: '34px 32px' }}>
        <path d="M40 6 L20 34 H32 L26 58 L48 28 H34 Z" fill="none" stroke="#fde047" strokeWidth="8" strokeLinejoin="round" opacity="0.5" />
        <path d="M40 6 L20 34 H32 L26 58 L48 28 H34 Z" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinejoin="round" opacity="0.7" />
        <path d="M40 6 L20 34 H32 L26 58 L48 28 H34 Z" fill={`url(#${id}bolt10)`} stroke="#7c2d12" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M38 10 L24 32" fill="none" stroke="#fffbeb" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Cronómetro circular esquina */}
      <circle cx="52" cy="48" r="9" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
      <circle cx="52" cy="48" r="7" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" />
      <text x="52" y="51" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fde047" stroke="none">10</text>
      <line x1="52" y1="40" x2="52" y2="42" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
      {/* Chispas */}
      <g className="ba-anim anim-twinkle">
        <path d="M48 8 L51 5 L49 10 L51 15 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="56" cy="20" r="1.2" fill="#fef9c3" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="14" cy="50" r="1.2" fill="#fde047" />
      </g>
    </>
  ),
  speed_5s: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}comet`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.8" stopColor="#f97316" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
        <linearGradient id={`${id}trail`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde047" stopOpacity="1" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}haloC`} cx="0.7" cy="0.3">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Cielo oscuro */}
      <circle cx="32" cy="32" r="30" fill="#0f172a" opacity="0.4" />
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloC)`} />
      {/* Estrellas lejanas */}
      <circle cx="10" cy="14" r="0.6" fill="#fff" opacity="0.7" />
      <circle cx="22" cy="8" r="0.4" fill="#fff" opacity="0.5" />
      <circle cx="56" cy="42" r="0.5" fill="#fff" opacity="0.6" />
      <circle cx="50" cy="50" r="0.4" fill="#fff" opacity="0.5" />
      {/* Estela — múltiples capas */}
      <g className="ba-anim anim-zoom-pop" style={{ transformOrigin: '46px 18px' }}>
        {/* Cola triple con fade */}
        <path d="M42 22 L4 58" stroke={`url(#${id}trail)`} strokeWidth="6" strokeLinecap="round" opacity="0.3" />
        <path d="M42 22 L6 56" stroke={`url(#${id}trail)`} strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
        <path d="M42 22 L8 54" stroke={`url(#${id}trail)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        {/* Partículas de la estela */}
        <circle cx="22" cy="40" r="1" fill="#fbbf24" opacity="0.6" />
        <circle cx="16" cy="46" r="0.7" fill="#f97316" opacity="0.4" />
        <circle cx="10" cy="52" r="0.5" fill="#fbbf24" opacity="0.3" />
        <circle cx="28" cy="34" r="1.2" fill="#fde047" opacity="0.7" />
        <circle cx="36" cy="26" r="0.8" fill="#fef3c7" opacity="0.8" />
        {/* Núcleo del cometa */}
        <circle cx="46" cy="18" r="10" fill={`url(#${id}comet)`} stroke="#7c2d12" strokeWidth="2" />
        <circle cx="46" cy="18" r="5" fill="#fffbeb" opacity="0.7" />
        <circle cx="43" cy="15" r="2.5" fill="#fff" opacity="0.9" />
      </g>
      {/* Cronómetro "5s" */}
      <rect x="44" y="42" width="16" height="10" rx="2" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="52" y="50" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fde047">5s</text>
      {/* Chispas */}
      <g className="ba-anim anim-twinkle">
        <path d="M56 8 L57 10 L59 10 L57.5 11 L58 13 L56 11.5 L54 13 L54.5 11 L53 10 L55 10 Z" fill="#fff" />
      </g>
    </>
  ),
  speed_perf_60: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}b`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.85" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
        <linearGradient id={`${id}arr`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="1" stopColor="#fde047" />
        </linearGradient>
      </defs>
      {/* Diana — anillos */}
      <circle cx="28" cy="36" r="22" fill="#fff" stroke="#0f172a" {...S} />
      <circle cx="28" cy="36" r="22" fill={`url(#${id}b)`} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="28" cy="36" r="17" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      <circle cx="28" cy="36" r="12" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      <circle cx="28" cy="36" r="7" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.2" />
      <circle cx="28" cy="36" r="3" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
      {/* Líneas de cruz divisoras */}
      <line x1="28" y1="14" x2="28" y2="58" stroke="#0f172a" strokeWidth="0.6" opacity="0.5" />
      <line x1="6" y1="36" x2="50" y2="36" stroke="#0f172a" strokeWidth="0.6" opacity="0.5" />
      {/* Anillo de impacto */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '28px 36px' }}>
        <circle cx="28" cy="36" r="3" fill="none" stroke="#fef3c7" strokeWidth="2" />
      </g>
      {/* Reloj en esquina sup-derecha */}
      <circle cx="50" cy="14" r="9" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="50" y1="6" x2="50" y2="8" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="20" x2="50" y2="22" stroke="#0f172a" strokeWidth="0.8" />
      <line x1="42" y1="14" x2="44" y2="14" stroke="#0f172a" strokeWidth="0.8" />
      <line x1="56" y1="14" x2="58" y2="14" stroke="#0f172a" strokeWidth="0.8" />
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '50px 14px' }}>
        <line x1="50" y1="14" x2="50" y2="8" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="14" r="1" fill="#0f172a" />
      {/* Flecha que vuela hacia el centro */}
      <g className="ba-anim anim-dart-fly" style={{ transformOrigin: '28px 36px' }}>
        <line x1="6" y1="14" x2="26" y2="34" stroke={`url(#${id}arr)`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 34 L22 32 L24 36 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
        <path d="M6 14 L2 10 L4 16 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
      {/* Estrella de "Perfecto" */}
      <g className="ba-anim anim-twinkle">
        <path d="M48 50 L49.5 53 L52.5 53 L50 55 L51 58 L48 56 L45 58 L46 55 L43.5 53 L46.5 53 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.6" />
      </g>
    </>
  ),
  speed_perf_30: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}imp`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.85" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id={`${id}sg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="30" fill="#fbbf24" opacity="0.15" />
      {/* Estrella explosión grande con spin */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 2 L38 22 L58 16 L44 30 L60 42 L40 42 L34 62 L28 44 L8 50 L20 34 L4 22 L24 24 Z"
              fill={`url(#${id}sg)`} stroke="#451a03" strokeWidth="2" strokeLinejoin="round" opacity="0.5" />
      </g>
      {/* Estrella media contra-rotación */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 6 L37 22 L54 18 L42 30 L56 42 L40 40 L34 58 L28 42 L12 48 L20 34 L8 22 L24 24 Z"
              fill={`url(#${id}imp)`} stroke="#7f1d1d" strokeWidth="2" strokeLinejoin="round" />
      </g>
      {/* Núcleo central blanco con anillo */}
      <circle cx="32" cy="32" r="6" fill="#fffbeb" stroke="#7c2d12" strokeWidth="1.5" />
      <text x="32" y="35" textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626" stroke="none">30</text>
      {/* Anillo de impacto */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="6" fill="none" stroke="#fde047" strokeWidth="2.5" />
      </g>
      {/* Chispas alrededor */}
      <g className="ba-anim anim-twinkle">
        <circle cx="8" cy="8" r="1.2" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="56" cy="8" r="1.2" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="8" cy="56" r="1.2" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-twinkle">
        <circle cx="56" cy="56" r="1.2" fill="#fde047" />
      </g>
    </>
  ),
  speed_perf_10: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}core10`} cx="0.35" cy="0.35">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.4" stopColor="#fde047" />
          <stop offset="0.8" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
        <radialGradient id={`${id}haloBH`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#ec4899" stopOpacity="0.25" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Fondo oscuro */}
      <circle cx="32" cy="32" r="30" fill="#0f172a" opacity="0.5" />
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloBH)`} />
      {/* Disco de acreción exterior */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray="8 4" opacity="0.6" />
        <ellipse cx="32" cy="32" rx="24" ry="8" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
      </g>
      {/* Disco de acreción interior — contra */}
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="18" ry="6" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.6" />
        <ellipse cx="32" cy="32" rx="12" ry="4" fill="none" stroke="#f9a8d4" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
      </g>
      {/* Anillo vertical */}
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '32px 32px' }}>
        <ellipse cx="32" cy="32" rx="4" ry="22" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      </g>
      {/* Singularidad central */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="8" fill={`url(#${id}core10)`} stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="32" cy="32" r="1.5" fill="#fffbeb" />
      </g>
      {/* Anillo de evento */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="5" fill="none" stroke="#fde047" strokeWidth="2" />
      </g>
      {/* "10s" */}
      <text x="32" y="58" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fde047" stroke="#0f172a" strokeWidth="0.5">10s</text>
      {/* Partículas capturadas */}
      <g className="ba-anim anim-twinkle">
        <circle cx="10" cy="10" r="1" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="54" cy="12" r="1" fill="#fef3c7" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="12" cy="52" r="0.8" fill="#a78bfa" />
      </g>
      <g className="ba-anim anim-twinkle">
        <circle cx="52" cy="50" r="0.8" fill="#ec4899" />
      </g>
    </>
  ),

  // ═══════════════════════ RACHAS ═══════════════════════
  streak_2: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}f1`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset="0.4" stopColor="#fb923c" />
          <stop offset="0.85" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>
      {/* Base de leña */}
      <line x1="20" y1="56" x2="44" y2="56" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="58" x2="42" y2="58" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      {/* Llama exterior */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 56 Q18 50 22 36 Q26 40 26 32 Q32 36 32 22 Q40 32 38 40 Q42 36 42 28 Q50 42 42 52 Q38 56 32 56 Z"
              fill={`url(#${id}f1)`} stroke="#7f1d1d" {...S} />
      </g>
      {/* Llama interior */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.3s' }}>
        <path d="M32 52 Q26 48 28 40 Q30 42 30 36 Q34 40 34 30 Q38 38 36 44 Q40 42 38 50 Z"
              fill="#fef08a" stroke="#fb923c" strokeWidth="1.2" />
      </g>
      {/* Ember en el centro */}
      <circle cx="32" cy="48" r="2" fill="#fff" opacity="0.85" />
      {/* Chispas subiendo */}
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '28px 30px' }}>
        <circle cx="28" cy="30" r="1" fill="#fde047" />
      </g>
      <g className="ba-anim anim-rise-fade" style={{ transformOrigin: '36px 28px', animationDelay: '.8s' }}>
        <circle cx="36" cy="28" r="1" fill="#fb923c" />
      </g>
    </>
  ),
  streak_3: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}f`} cx="0.5" cy="0.8">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset="0.35" stopColor="#fbbf24" />
          <stop offset="0.7" stopColor="#ea580c" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>
      {/* Pedestal */}
      <ellipse cx="32" cy="58" rx="14" ry="2" fill="#1f2937" opacity="0.4" />
      <line x1="20" y1="56" x2="44" y2="56" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
      {/* Llama capa exterior */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 48px' }}>
        <path d="M32 58 Q14 50 20 32 Q24 38 24 28 Q32 34 30 14 Q42 28 40 38 Q46 32 46 24 Q54 42 46 54 Q40 58 32 58 Z"
              fill={`url(#${id}f)`} stroke="#7f1d1d" {...S} />
      </g>
      {/* Capa media */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 48px', animationDelay: '.2s' }}>
        <path d="M32 52 Q22 46 26 34 Q28 38 28 30 Q34 34 32 22 Q40 30 38 38 Q42 34 42 28 Q48 42 42 50 Z"
              fill="#fbbf24" stroke="#ea580c" strokeWidth="1.2" />
      </g>
      {/* Núcleo */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 48px', animationDelay: '.4s' }}>
        <path d="M32 48 Q28 44 30 38 Q32 40 32 32 Q36 38 34 44 Z" fill="#fef9c3" />
      </g>
      {/* Chispas */}
      <g className="ba-anim anim-ember" style={{ '--ex': '-4px', '--ey': '-14px' }}>
        <circle cx="28" cy="20" r="1.2" fill="#fde047" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '6px', '--ey': '-16px', animationDelay: '.6s' }}>
        <circle cx="36" cy="22" r="1" fill="#fb923c" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '0px', '--ey': '-12px', animationDelay: '1.2s' }}>
        <circle cx="32" cy="18" r="1" fill="#fef9c3" />
      </g>
    </>
  ),
  streak_5: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}fa`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fef08a" /><stop offset="0.5" stopColor="#fb923c" /><stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id={`${id}fb`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fde047" /><stop offset="0.5" stopColor="#dc2626" /><stop offset="1" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* Base */}
      <line x1="6" y1="56" x2="58" y2="56" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
      {/* Llama izquierda */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '16px 50px' }}>
        <path d="M16 56 Q6 50 10 38 Q12 42 14 36 Q18 42 16 28 Q24 36 22 44 Q26 40 26 34 Q30 46 22 54 Z"
              fill={`url(#${id}fa)`} stroke="#7f1d1d" {...S} />
      </g>
      {/* Llama central (más alta) */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.15s' }}>
        <path d="M32 56 Q20 50 24 36 Q26 40 26 32 Q32 36 30 16 Q40 30 38 38 Q44 34 44 26 Q52 40 44 52 Z"
              fill={`url(#${id}fb)`} stroke="#7f1d1d" {...S} />
      </g>
      {/* Llama derecha */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '48px 50px', animationDelay: '.3s' }}>
        <path d="M48 56 Q38 50 42 38 Q44 42 46 36 Q50 42 48 28 Q56 36 54 44 Q58 40 58 34 Q62 46 54 54 Z"
              fill={`url(#${id}fa)`} stroke="#7f1d1d" {...S} />
      </g>
      {/* Núcleo central blanco */}
      <ellipse cx="32" cy="46" rx="2" ry="3" fill="#fff" opacity="0.7" />
      {/* Chispas voladoras */}
      <g className="ba-anim anim-ember" style={{ '--ex': '-3px', '--ey': '-12px' }}>
        <circle cx="20" cy="24" r="1" fill="#fde047" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '4px', '--ey': '-14px', animationDelay: '.7s' }}>
        <circle cx="44" cy="22" r="1" fill="#fb923c" />
      </g>
    </>
  ),
  streak_7: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e0e7ff" />
        </linearGradient>
        <linearGradient id={`${id}top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef4444" /><stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>
      <rect x="12" y="16" width="44" height="42" rx="4" fill="#0f172a" opacity="0.25" />
      <rect x="10" y="14" width="44" height="42" rx="4" fill={`url(#${id}cal)`} stroke="#1e3a8a" {...S} />
      <path d="M10 18 Q10 14 14 14 H50 Q54 14 54 18 V24 H10 Z" fill={`url(#${id}top)`} stroke="#1e3a8a" strokeWidth="2" />
      <line x1="20" y1="10" x2="20" y2="20" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="10" x2="44" y2="20" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="10" r="1.5" fill="#94a3b8" />
      <circle cx="44" cy="10" r="1.5" fill="#94a3b8" />
      {['L','M','X','J','V','S','D'].map((d, i) => (
        <text key={d} x={14 + i * 6} y="22" fontSize="3.5" fontWeight="900" fill="#fff">{d}</text>
      ))}
      {[0,1,2,3,4,5,6].map((i) => (
        <g key={i}>
          <rect x={12.5 + i * 6} y="28" width="5" height="5" rx="0.6" fill="#f1f5f9" stroke="#1e3a8a" strokeWidth="1" />
          <g className="ba-anim anim-blink-seq" style={{ animationDelay: `${i * 0.2}s` }}>
            <path d={`M${13.5 + i * 6} 30.5 L${15 + i * 6} 32 L${17 + i * 6} 29.5`} stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        </g>
      ))}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 54 Q24 50 26 42 Q28 44 28 38 Q32 42 32 32 Q38 40 36 46 Q40 44 40 38 Q44 48 38 54 Z" fill="#fb923c" stroke="#7f1d1d" strokeWidth="1.5" />
        <path d="M32 50 Q28 48 30 42 Q32 44 32 36 Q36 42 32 50 Z" fill="#fde047" />
      </g>
      <text x="46" y="52" fontSize="9" fontWeight="900" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.5">7</text>
    </>
  ),
  streak_10: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}fOuter`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.3" stopColor="#fbbf24" />
          <stop offset="0.7" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id={`${id}fMid`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#fde047" />
          <stop offset="1" stopColor="#f97316" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="40" r="26" fill="#fb923c" opacity="0.15" />
      <circle cx="32" cy="40" r="20" fill="#fbbf24" opacity="0.18" />
      <line x1="14" y1="58" x2="50" y2="58" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="60" x2="46" y2="60" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 58 Q10 50 16 28 Q20 34 22 22 Q30 28 28 6 Q42 22 40 36 Q46 30 46 18 Q58 36 50 52 Q42 60 32 58 Z" fill={`url(#${id}fOuter)`} stroke="#7f1d1d" {...S} />
      </g>
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.15s' }}>
        <path d="M32 52 Q18 46 22 30 Q24 34 26 26 Q30 30 30 16 Q40 28 38 36 Q42 32 42 24 Q50 38 44 50 Z" fill={`url(#${id}fMid)`} stroke="#ea580c" strokeWidth="1.2" />
      </g>
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.3s' }}>
        <path d="M32 48 Q26 44 28 36 Q30 38 30 30 Q34 34 34 22 Q40 32 36 44 Z" fill="#fffbeb" />
      </g>
      <text x="32" y="50" textAnchor="middle" fontSize="9" fontWeight="900" fill="#7f1d1d" stroke="#fef3c7" strokeWidth="0.6">10</text>
      <g className="ba-anim anim-ember" style={{ '--ex': '-4px', '--ey': '-16px' }}>
        <circle cx="22" cy="18" r="1.2" fill="#fde047" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '6px', '--ey': '-18px', animationDelay: '.5s' }}>
        <circle cx="40" cy="14" r="1" fill="#fb923c" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '-2px', '--ey': '-14px', animationDelay: '1s' }}>
        <circle cx="32" cy="10" r="1.1" fill="#fef9c3" />
      </g>
    </>
  ),
  streak_15: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}troph`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.4" stopColor="#fbbf24" />
          <stop offset="0.8" stopColor="#d97706" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}flame15`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset="0.5" stopColor="#fb923c" />
          <stop offset="1" stopColor="#dc2626" />
        </radialGradient>
      </defs>
      <rect x="20" y="50" width="24" height="6" rx="1" fill="#7c2d12" stroke="#451a03" strokeWidth="1.5" />
      <rect x="22" y="52" width="20" height="2" fill="#a16207" opacity="0.6" />
      <rect x="28" y="40" width="8" height="12" fill={`url(#${id}troph)`} stroke="#7c2d12" strokeWidth="1.5" />
      <path d="M16 14 H48 V28 Q48 40 32 40 Q16 40 16 28 Z" fill={`url(#${id}troph)`} stroke="#7c2d12" {...S} />
      <path d="M16 16 Q6 16 6 24 Q6 32 16 32" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 16 Q58 16 58 24 Q58 32 48 32" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="22" cy="20" rx="2" ry="4" fill="#fffbeb" opacity="0.7" />
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 36 Q22 30 26 18 Q28 22 28 14 Q34 18 32 6 Q40 16 38 24 Q42 22 42 14 Q48 26 42 34 Z" fill={`url(#${id}flame15)`} stroke="#7f1d1d" strokeWidth="1.5" />
      </g>
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 32px', animationDelay: '.2s' }}>
        <path d="M32 32 Q26 28 28 20 Q30 22 30 16 Q34 20 32 12 Q38 18 36 24 Z" fill="#fef9c3" />
      </g>
      <rect x="26" y="42" width="12" height="8" rx="1.5" fill="#fff" stroke="#7c2d12" strokeWidth="1" />
      <text x="32" y="48.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626">15</text>
      <g className="ba-anim anim-twinkle">
        <path d="M8 8 L9 11 L12 11 L10 13 L11 16 L8 14 L5 16 L6 13 L4 11 L7 11 Z" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M56 6 L57 9 L60 9 L58 11 L59 14 L56 12 L53 14 L54 11 L52 9 L55 9 Z" fill="#fbbf24" />
      </g>
    </>
  ),
  streak_30: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}fO`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.25" stopColor="#fbbf24" />
          <stop offset="0.6" stopColor="#dc2626" />
          <stop offset="1" stopColor="#450a0a" />
        </radialGradient>
        <radialGradient id={`${id}fM`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#fde047" />
          <stop offset="1" stopColor="#f97316" />
        </radialGradient>
        <radialGradient id={`${id}halo30`} cx="0.5" cy="0.6">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo radial intenso */}
      <circle cx="32" cy="40" r="30" fill={`url(#${id}halo30)`} />
      {/* Suelo + leña */}
      <ellipse cx="32" cy="60" rx="22" ry="2" fill="#0f172a" opacity="0.4" />
      <line x1="12" y1="58" x2="52" y2="58" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="60" x2="48" y2="60" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      {/* Llama exterior con doble onda */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 58 Q6 50 12 26 Q18 32 20 18 Q28 24 26 4 Q42 18 40 32 Q48 26 48 14 Q62 32 52 52 Q42 62 32 58 Z"
              fill={`url(#${id}fO)`} stroke="#7f1d1d" {...S} />
      </g>
      {/* Llama media */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.15s' }}>
        <path d="M32 54 Q14 46 18 26 Q22 32 24 22 Q30 26 28 10 Q40 22 38 32 Q44 28 44 18 Q54 34 46 50 Z"
              fill={`url(#${id}fM)`} stroke="#ea580c" strokeWidth="1.2" />
      </g>
      {/* Núcleo blanco */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.3s' }}>
        <path d="M32 50 Q22 44 26 32 Q28 36 28 28 Q32 32 32 18 Q40 28 38 38 Z" fill="#fffbeb" />
      </g>
      {/* "30" inscrito */}
      <text x="32" y="50" textAnchor="middle" fontSize="9" fontWeight="900" fill="#7f1d1d" stroke="#fef3c7" strokeWidth="0.6">30</text>
      {/* Múltiples chispas */}
      <g className="ba-anim anim-ember" style={{ '--ex': '-6px', '--ey': '-18px' }}>
        <circle cx="20" cy="20" r="1.4" fill="#fde047" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '8px', '--ey': '-20px', animationDelay: '.4s' }}>
        <circle cx="42" cy="16" r="1.2" fill="#fb923c" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '0px', '--ey': '-16px', animationDelay: '.8s' }}>
        <circle cx="32" cy="14" r="1.4" fill="#fef9c3" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '-4px', '--ey': '-22px', animationDelay: '1.2s' }}>
        <circle cx="26" cy="10" r="1" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '6px', '--ey': '-14px', animationDelay: '1.6s' }}>
        <circle cx="40" cy="22" r="1" fill="#fef3c7" />
      </g>
    </>
  ),
  streak_50: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}phoenix`} cx="0.5" cy="0.85">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.3" stopColor="#fbbf24" />
          <stop offset="0.6" stopColor="#dc2626" />
          <stop offset="0.9" stopColor="#7c2d12" />
          <stop offset="1" stopColor="#1e1b4b" />
        </radialGradient>
        <linearGradient id={`${id}wing`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <radialGradient id={`${id}halo50`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo radial */}
      <circle cx="32" cy="32" r="32" fill={`url(#${id}halo50)`} />
      {/* Alas extendidas (fénix) */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 36px' }}>
        {/* Ala izquierda */}
        <path d="M32 28 Q22 24 12 20 Q14 30 22 32 Q14 36 8 38 Q18 42 26 38 Q22 46 28 50 Q30 40 32 36 Z"
              fill={`url(#${id}wing)`} stroke="#7f1d1d" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 24 L22 30 M18 32 L24 36 M14 38 L22 40" stroke="#fef9c3" strokeWidth="1" strokeLinecap="round" />
        {/* Ala derecha */}
        <path d="M32 28 Q42 24 52 20 Q50 30 42 32 Q50 36 56 38 Q46 42 38 38 Q42 46 36 50 Q34 40 32 36 Z"
              fill={`url(#${id}wing)`} stroke="#7f1d1d" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M48 24 L42 30 M46 32 L40 36 M50 38 L42 40" stroke="#fef9c3" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* Cuerpo / llama central del ave */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 56 Q22 50 26 36 Q28 40 28 32 Q32 36 30 18 Q38 30 36 38 Q42 34 42 28 Q50 40 44 50 Q38 58 32 56 Z"
              fill={`url(#${id}phoenix)`} stroke="#451a03" strokeWidth="1.5" />
      </g>
      {/* Cabeza con cresta */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 18px', animationDelay: '.2s' }}>
        <path d="M28 18 Q26 12 30 10 Q32 14 32 8 Q34 12 36 10 Q34 14 36 18 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1.2" strokeLinejoin="round" />
      </g>
      <circle cx="30" cy="18" r="1" fill="#fef3c7" />
      <circle cx="34" cy="18" r="1" fill="#fef3c7" />
      <circle cx="30" cy="18" r="0.4" fill="#0f172a" />
      <circle cx="34" cy="18" r="0.4" fill="#0f172a" />
      {/* Pico */}
      <path d="M32 20 L31 22 L33 22 Z" fill="#fbbf24" />
      {/* "50" en el pecho */}
      <text x="32" y="46" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fef3c7" stroke="#7f1d1d" strokeWidth="0.6">50</text>
      {/* Chispas voladoras múltiples */}
      <g className="ba-anim anim-ember" style={{ '--ex': '-8px', '--ey': '-20px' }}>
        <circle cx="14" cy="14" r="1.2" fill="#fde047" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '8px', '--ey': '-20px', animationDelay: '.4s' }}>
        <circle cx="50" cy="14" r="1.2" fill="#fb923c" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '-4px', '--ey': '-14px', animationDelay: '.8s' }}>
        <circle cx="20" cy="8" r="1" fill="#fef9c3" />
      </g>
      <g className="ba-anim anim-ember" style={{ '--ex': '6px', '--ey': '-14px', animationDelay: '1.2s' }}>
        <circle cx="44" cy="8" r="1" fill="#fef9c3" />
      </g>
    </>
  ),
  streak_100: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}inferno`} cx="0.5" cy="0.7">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.2" stopColor="#fde047" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="0.8" stopColor="#dc2626" />
          <stop offset="1" stopColor="#1c1917" />
        </radialGradient>
        <radialGradient id={`${id}haloInf`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#dc2626" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="1" stopColor="#dc2626" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo de calor */}
      <circle cx="32" cy="32" r="34" fill={`url(#${id}haloInf)`} />
      {/* Anillo de expansión */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 38px' }}>
        <circle cx="32" cy="38" r="6" fill="none" stroke="#fde047" strokeWidth="2.5" />
      </g>
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '32px 38px', animationDelay: '1s' }}>
        <circle cx="32" cy="38" r="6" fill="none" stroke="#fb923c" strokeWidth="2" />
      </g>
      {/* Inferno exterior */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 2 Q42 16 40 26 Q52 18 54 8 Q64 28 54 44 Q62 38 60 28 Q66 52 52 60 H12 Q-2 52 4 28 Q2 38 10 44 Q0 28 10 8 Q12 18 24 26 Q22 16 32 2 Z"
              fill={`url(#${id}inferno)`} stroke="#7f1d1d" strokeWidth="2" strokeLinejoin="round" />
      </g>
      {/* Capa media */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.15s' }}>
        <path d="M32 8 Q40 20 38 28 Q48 24 48 14 Q58 30 50 46 Q56 40 54 32 Q58 50 48 56 H16 Q6 50 10 32 Q8 40 14 46 Q6 30 16 14 Q16 24 26 28 Q24 20 32 8 Z"
              fill="#fbbf24" stroke="#ea580c" strokeWidth="1.5" opacity="0.9" />
      </g>
      {/* Núcleo interior */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '32px 50px', animationDelay: '.3s' }}>
        <path d="M32 18 Q38 26 36 32 Q42 30 42 22 Q48 34 42 44 Q48 40 46 34 Q50 46 42 52 H22 Q14 46 18 34 Q16 40 22 44 Q16 34 22 22 Q22 30 28 32 Q26 26 32 18 Z"
              fill="#fef9c3" stroke="#f97316" strokeWidth="1" opacity="0.85" />
      </g>
      {/* "100" central */}
      <text x="32" y="46" textAnchor="middle" fontSize="12" fontWeight="900" fill="#450a0a" stroke="#fef3c7" strokeWidth="0.6">100</text>
      {/* Chispas voladoras — muchas */}
      {[
        { cx: 16, cy: 8, ex: '-6px', ey: '-18px', d: 0 },
        { cx: 48, cy: 6, ex: '6px', ey: '-20px', d: 0.3 },
        { cx: 10, cy: 16, ex: '-8px', ey: '-14px', d: 0.6 },
        { cx: 54, cy: 14, ex: '8px', ey: '-14px', d: 0.9 },
        { cx: 32, cy: 4, ex: '0px', ey: '-16px', d: 1.2 },
        { cx: 24, cy: 10, ex: '-4px', ey: '-18px', d: 1.5 },
        { cx: 40, cy: 8, ex: '4px', ey: '-16px', d: 1.8 },
      ].map((s, i) => (
        <g key={i} className="ba-anim anim-ember" style={{ '--ex': s.ex, '--ey': s.ey, animationDelay: `${s.d}s` }}>
          <circle cx={s.cx} cy={s.cy} r={i % 2 ? 1 : 1.3} fill={i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#fb923c' : '#fef9c3'} />
        </g>
      ))}
    </>
  ),

  // ═══════════════════════ DEDICACION ═══════════════════════
  time_30m: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}face`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#93c5fd" />
        </radialGradient>
        <linearGradient id={`${id}ring`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" /><stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {/* Anillo exterior */}
      <circle cx="32" cy="32" r="25" fill={`url(#${id}ring)`} stroke="#0f172a" {...S} />
      <circle cx="32" cy="32" r="22" fill={`url(#${id}face)`} stroke="#1e3a8a" strokeWidth="1" />
      {/* Marcas horarias 12 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 32 + Math.sin(a) * 17;
        const y1 = 32 - Math.cos(a) * 17;
        const x2 = 32 + Math.sin(a) * 20;
        const y2 = 32 - Math.cos(a) * 20;
        const big = i % 3 === 0;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e3a8a" strokeWidth={big ? 2 : 1} strokeLinecap="round" />;
      })}
      {/* Números clave */}
      <text x="32" y="14" textAnchor="middle" fontSize="5" fontWeight="900" fill="#1e3a8a">12</text>
      <text x="32" y="55" textAnchor="middle" fontSize="5" fontWeight="900" fill="#1e3a8a">6</text>
      {/* Manecilla horaria */}
      <line x1="32" y1="32" x2="32" y2="20" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      {/* Manecilla minutera */}
      <line x1="32" y1="32" x2="44" y2="32" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      {/* Segundero girando */}
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '32px 32px' }}>
        <line x1="32" y1="32" x2="32" y2="14" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="14" r="1.5" fill="#dc2626" />
      </g>
      {/* Núcleo */}
      <circle cx="32" cy="32" r="2.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
    </>
  ),
  time_1h: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}gl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${id}sand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <clipPath id={`${id}top`}>
          <path d="M16 8 H48 L34 30 H30 Z" />
        </clipPath>
        <clipPath id={`${id}bot`}>
          <path d="M30 34 H34 L48 56 H16 Z" />
        </clipPath>
      </defs>
      {/* Marcos del reloj de arena */}
      <line x1="14" y1="6" x2="50" y2="6" stroke={`url(#${id}gl)`} strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="58" x2="50" y2="58" stroke={`url(#${id}gl)`} strokeWidth="3" strokeLinecap="round" />
      {/* Vidrio (forma de reloj) */}
      <path d="M16 8 H48 L34 30 L48 56 H16 L30 30 Z" fill="rgba(255,255,255,0.5)" stroke="#92400e" {...S} strokeLinejoin="round" />
      {/* Arena superior (bajando) */}
      <path d="M18 10 H46 L34 28 H30 Z" fill={`url(#${id}sand)`} clipPath={`url(#${id}top)`} />
      {/* Arena inferior (acumulándose) */}
      <path d="M18 56 L30 36 H34 L46 56 Z" fill={`url(#${id}sand)`} clipPath={`url(#${id}bot)`} />
      {/* Hilo de arena cayendo */}
      <line x1="32" y1="30" x2="32" y2="38" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      {/* Granos animados */}
      <g className="ba-anim anim-fall" style={{ transformOrigin: '32px 34px' }}>
        <circle cx="32" cy="34" r="1" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-fall" style={{ transformOrigin: '32px 34px', animationDelay: '.5s' }}>
        <circle cx="32" cy="34" r="0.8" fill="#f59e0b" />
      </g>
      <g className="ba-anim anim-fall" style={{ transformOrigin: '32px 34px', animationDelay: '1s' }}>
        <circle cx="32" cy="34" r="1" fill="#fbbf24" />
      </g>
      {/* Sello "1h" arriba */}
      <text x="32" y="22" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12" stroke="none">1h</text>
    </>
  ),
  time_3h: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}face`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#a78bfa" />
        </radialGradient>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" /><stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      {/* Marco */}
      <circle cx="32" cy="32" r="26" fill={`url(#${id}rim)`} stroke="#0f172a" {...S} />
      <circle cx="32" cy="32" r="23" fill={`url(#${id}face)`} stroke="#4c1d95" strokeWidth="1" />
      {/* Números romanos */}
      <text x="32" y="15" textAnchor="middle" fontSize="6" fontWeight="900" fill="#4c1d95">XII</text>
      <text x="50" y="35" textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626">III</text>
      <text x="32" y="56" textAnchor="middle" fontSize="6" fontWeight="900" fill="#4c1d95">VI</text>
      <text x="14" y="35" textAnchor="middle" fontSize="6" fontWeight="900" fill="#4c1d95">IX</text>
      {/* Marcas */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 32 + Math.sin(a) * 18;
        const y1 = 32 - Math.cos(a) * 18;
        const x2 = 32 + Math.sin(a) * 20;
        const y2 = 32 - Math.cos(a) * 20;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4c1d95" strokeWidth="1" strokeLinecap="round" />;
      })}
      {/* Manecillas */}
      <g className="ba-anim anim-tick" style={{ transformOrigin: '32px 32px' }}>
        <line x1="32" y1="32" x2="42" y2="34" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '32px 32px' }}>
        <line x1="32" y1="32" x2="32" y2="16" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <line x1="32" y1="32" x2="32" y2="20" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
    </>
  ),
  time_5h: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}gl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}sandT`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}sandB`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <clipPath id={`${id}top5`}>
          <path d="M16 8 H48 L34 30 H30 Z" />
        </clipPath>
        <clipPath id={`${id}bot5`}>
          <path d="M30 34 H34 L48 56 H16 Z" />
        </clipPath>
      </defs>
      {/* Marcos dorados */}
      <line x1="12" y1="6" x2="52" y2="6" stroke={`url(#${id}gl)`} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="12" y1="58" x2="52" y2="58" stroke={`url(#${id}gl)`} strokeWidth="3.5" strokeLinecap="round" />
      {/* Pilares laterales */}
      <line x1="14" y1="6" x2="14" y2="58" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="6" x2="50" y2="58" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cristal del reloj */}
      <path d="M16 8 H48 L34 30 L48 56 H16 L30 30 Z" fill="rgba(186,230,253,0.35)" stroke="#92400e" {...S} strokeLinejoin="round" />
      <path d="M18 10 L34 30 L18 50" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
      {/* Arena superior — disminuyendo */}
      <g className="ba-anim anim-bar" style={{ transformOrigin: '32px 30px' }}>
        <path d="M18 10 H46 L34 28 H30 Z" fill={`url(#${id}sandT)`} clipPath={`url(#${id}top5)`} />
      </g>
      {/* Arena inferior — creciendo */}
      <path d="M18 56 L30 38 H34 L46 56 Z" fill={`url(#${id}sandB)`} clipPath={`url(#${id}bot5)`} />
      {/* Hilo central */}
      <line x1="32" y1="30" x2="32" y2="42" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      {/* Granos cayendo */}
      <g className="ba-anim anim-fall" style={{ transformOrigin: '32px 36px' }}>
        <circle cx="32" cy="36" r="1.2" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-fall" style={{ transformOrigin: '32px 36px', animationDelay: '.4s' }}>
        <circle cx="32" cy="36" r="1" fill="#f59e0b" />
      </g>
      <g className="ba-anim anim-fall" style={{ transformOrigin: '32px 36px', animationDelay: '.8s' }}>
        <circle cx="32" cy="36" r="1.2" fill="#fbbf24" />
      </g>
      {/* Sello "5h" */}
      <text x="32" y="20" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12" stroke="none">5h</text>
      {/* Estrellas decorativas */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 32 L9 34 L11 34 L9.5 35.5 L10 38 L8 36.5 L6 38 L6.5 35.5 L5 34 L7 34 Z" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M56 32 L57 34 L59 34 L57.5 35.5 L58 38 L56 36.5 L54 38 L54.5 35.5 L53 34 L55 34 Z" fill="#fde047" />
      </g>
    </>
  ),
  time_10h: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#312e81" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={`${id}mt1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={`${id}mt2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="1" stopColor="#14532d" />
        </linearGradient>
      </defs>
      {/* Cielo */}
      <rect x="2" y="6" width="60" height="46" rx="2" fill={`url(#${id}sky)`} />
      {/* Estrellas */}
      <circle cx="14" cy="14" r="0.8" fill="#fff" opacity="0.9" />
      <circle cx="26" cy="10" r="0.6" fill="#fff" opacity="0.7" />
      <circle cx="50" cy="12" r="0.8" fill="#fff" opacity="0.9" />
      <g className="ba-anim anim-twinkle">
        <circle cx="20" cy="18" r="1" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="40" cy="16" r="1" fill="#fef3c7" />
      </g>
      {/* Luna creciente */}
      <g className="ba-anim anim-glow">
        <circle cx="48" cy="16" r="5" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="50" cy="14" r="4.5" fill={`url(#${id}sky)`} />
      </g>
      {/* Montañas atrás */}
      <path d="M2 48 L14 28 L22 36 L30 24 L40 38 L52 22 L62 48 Z" fill={`url(#${id}mt1)`} stroke="#0c4a6e" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 28 L18 32 L22 32" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M30 24 L33 28 L37 28" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M52 22 L56 26 L60 26" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      {/* Montañas frente */}
      <path d="M2 52 L10 38 L18 46 L26 32 L36 44 L46 30 L58 48 L62 52 Z" fill={`url(#${id}mt2)`} stroke="#052e16" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Suelo */}
      <line x1="2" y1="52" x2="62" y2="52" stroke="#052e16" strokeWidth="2" strokeLinecap="round" />
      {/* Caminante con bandera */}
      <g className="ba-anim anim-runner" style={{ transformOrigin: '40px 36px' }}>
        <line x1="40" y1="32" x2="40" y2="40" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 32 L46 28 L46 32 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
        <circle cx="40" cy="42" r="1.5" fill="#fef3c7" stroke="#7c2d12" strokeWidth="0.8" />
      </g>
      {/* Etiqueta 10h */}
      <rect x="22" y="54" width="20" height="8" rx="1.5" fill="#fef3c7" stroke="#7c2d12" strokeWidth="1.2" />
      <text x="32" y="60.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="#7c2d12">10h</text>
    </>
  ),
  time_20h: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}rim20`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <radialGradient id={`${id}face20`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#a78bfa" />
        </radialGradient>
      </defs>
      {/* Sombra */}
      <ellipse cx="32" cy="58" rx="22" ry="2" fill="#0f172a" opacity="0.3" />
      {/* Marco doble */}
      <circle cx="32" cy="32" r="27" fill={`url(#${id}rim20)`} stroke="#0f172a" strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.7" />
      <circle cx="32" cy="32" r="22" fill={`url(#${id}face20)`} stroke="#4c1d95" strokeWidth="1.2" />
      {/* Engranajes decorativos */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '12px 12px' }}>
        <circle cx="12" cy="12" r="3" fill="none" stroke="#fbbf24" strokeWidth="1" />
        <line x1="12" y1="8" x2="12" y2="9" stroke="#fbbf24" strokeWidth="1" />
        <line x1="12" y1="15" x2="12" y2="16" stroke="#fbbf24" strokeWidth="1" />
        <line x1="8" y1="12" x2="9" y2="12" stroke="#fbbf24" strokeWidth="1" />
        <line x1="15" y1="12" x2="16" y2="12" stroke="#fbbf24" strokeWidth="1" />
      </g>
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '52px 52px' }}>
        <circle cx="52" cy="52" r="3" fill="none" stroke="#fbbf24" strokeWidth="1" />
        <line x1="52" y1="48" x2="52" y2="49" stroke="#fbbf24" strokeWidth="1" />
        <line x1="52" y1="55" x2="52" y2="56" stroke="#fbbf24" strokeWidth="1" />
        <line x1="48" y1="52" x2="49" y2="52" stroke="#fbbf24" strokeWidth="1" />
        <line x1="55" y1="52" x2="56" y2="52" stroke="#fbbf24" strokeWidth="1" />
      </g>
      {/* Marcas tick (24 marcas — 24 horas) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 15 * Math.PI) / 180;
        const big = i % 6 === 0;
        const r1 = big ? 16 : 18;
        const r2 = 20;
        const x1 = 32 + Math.sin(a) * r1;
        const y1 = 32 - Math.cos(a) * r1;
        const x2 = 32 + Math.sin(a) * r2;
        const y2 = 32 - Math.cos(a) * r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4c1d95" strokeWidth={big ? 1.8 : 0.8} strokeLinecap="round" />;
      })}
      {/* Números romanos */}
      <text x="32" y="14.5" textAnchor="middle" fontSize="5" fontWeight="900" fill="#4c1d95">XII</text>
      <text x="50" y="34" textAnchor="middle" fontSize="5" fontWeight="900" fill="#4c1d95">III</text>
      <text x="32" y="55" textAnchor="middle" fontSize="5" fontWeight="900" fill="#4c1d95">VI</text>
      <text x="14" y="34" textAnchor="middle" fontSize="5" fontWeight="900" fill="#4c1d95">IX</text>
      {/* "20" inscrito */}
      <text x="32" y="46" textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626">20h</text>
      {/* Manecillas */}
      <line x1="32" y1="32" x2="42" y2="38" stroke="#4c1d95" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="32" y1="32" x2="32" y2="18" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
      {/* Segundero rojo girando rápido */}
      <g className="ba-anim anim-spin-fast" style={{ transformOrigin: '32px 32px' }}>
        <line x1="32" y1="32" x2="32" y2="14" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="14" r="1.5" fill="#dc2626" />
      </g>
      {/* Centro */}
      <circle cx="32" cy="32" r="2.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
    </>
  ),
  time_50h: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}inf`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <radialGradient id={`${id}halo50t`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}orbit`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Halo radial */}
      <circle cx="32" cy="32" r="30" fill={`url(#${id}halo50t)`} />
      {/* Anillo orbital exterior */}
      <ellipse cx="32" cy="32" rx="26" ry="6" fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
      {/* Símbolo infinito triple capa */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        {/* Glow exterior */}
        <path d="M16 32 Q16 18 24 18 Q32 18 32 32 Q32 46 40 46 Q48 46 48 32 Q48 18 40 18 Q32 18 32 32 Q32 46 24 46 Q16 46 16 32 Z"
              fill="none" stroke="#c4b5fd" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        {/* Línea principal */}
        <path d="M16 32 Q16 18 24 18 Q32 18 32 32 Q32 46 40 46 Q48 46 48 32 Q48 18 40 18 Q32 18 32 32 Q32 46 24 46 Q16 46 16 32 Z"
              fill="none" stroke={`url(#${id}inf)`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Highlight interior */}
        <path d="M16 32 Q16 18 24 18 Q32 18 32 32 Q32 46 40 46 Q48 46 48 32 Q48 18 40 18 Q32 18 32 32 Q32 46 24 46 Q16 46 16 32 Z"
              fill="none" stroke="#fffbeb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      </g>
      {/* Bolas que viajan por el infinito */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        <g transform="translate(0,-26)">
          <circle cx="32" cy="32" r="2.5" fill={`url(#${id}orbit)`} stroke="#7f1d1d" strokeWidth="0.8" />
        </g>
      </g>
      <g className="ba-anim anim-spin-back" style={{ transformOrigin: '32px 32px' }}>
        <g transform="translate(0,26)">
          <circle cx="32" cy="32" r="2" fill="#fde047" stroke="#92400e" strokeWidth="0.8" />
        </g>
      </g>
      {/* Etiqueta 50h */}
      <rect x="22" y="50" width="20" height="9" rx="2" fill="#0f172a" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="32" y="57" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fde047">50h</text>
      {/* Estrellas */}
      <g className="ba-anim anim-twinkle">
        <circle cx="8" cy="8" r="1.2" fill="#fff" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <circle cx="56" cy="8" r="1.2" fill="#fde047" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="8" cy="56" r="1" fill="#fff" />
      </g>
    </>
  ),
  time_100h: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}sk100`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.3" stopColor="#fde047" />
          <stop offset="0.6" stopColor="#fb923c" />
          <stop offset="0.85" stopColor="#dc2626" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id={`${id}sun100`} cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.3" stopColor="#fde047" />
          <stop offset="0.7" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
        <linearGradient id={`${id}water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="0.5" stopColor="#dc2626" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <radialGradient id={`${id}haloS`} cx="0.5" cy="0.35">
          <stop offset="0" stopColor="#fde047" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Cielo degradado */}
      <rect x="0" y="0" width="64" height="42" fill={`url(#${id}sk100)`} />
      {/* Mar / horizonte */}
      <rect x="0" y="42" width="64" height="22" fill={`url(#${id}water)`} />
      <line x1="0" y1="42" x2="64" y2="42" stroke="#7c2d12" strokeWidth="0.8" />
      {/* Reflejo del sol en el agua */}
      <line x1="32" y1="44" x2="32" y2="58" stroke="#fde047" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="32" y1="46" x2="32" y2="56" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
      {/* Ondas del mar */}
      <path d="M0 50 Q8 47 16 50 Q24 53 32 50 Q40 47 48 50 Q56 53 64 50" fill="none" stroke="#fef3c7" strokeWidth="0.8" opacity="0.5" />
      <path d="M0 54 Q8 51 16 54 Q24 57 32 54 Q40 51 48 54 Q56 57 64 54" fill="none" stroke="#fef3c7" strokeWidth="0.8" opacity="0.4" />
      {/* Halo solar */}
      <circle cx="32" cy="32" r="28" fill={`url(#${id}haloS)`} />
      {/* Rayos largos */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 16;
          const y1 = 32 - Math.cos(a) * 16;
          const x2 = 32 + Math.sin(a) * 26;
          const y2 = 32 - Math.cos(a) * 26;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fde047" strokeWidth={i % 2 ? 1 : 1.5} strokeLinecap="round" opacity="0.7" />;
        })}
      </g>
      {/* Sol con sunrise */}
      <g className="ba-anim anim-rise" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="12" fill={`url(#${id}sun100)`} stroke="#7c2d12" strokeWidth="2" />
        {/* Cara sonriente */}
        <circle cx="28" cy="30" r="1.2" fill="#7c2d12" />
        <circle cx="36" cy="30" r="1.2" fill="#7c2d12" />
        <path d="M27 34 Q32 38 37 34" fill="none" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" />
        {/* Highlight */}
        <ellipse cx="28" cy="26" rx="2" ry="1.5" fill="#fffbeb" opacity="0.8" />
      </g>
      {/* "100h" etiqueta */}
      <rect x="20" y="56" width="24" height="7" rx="1.5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.2" opacity="0.9" />
      <text x="32" y="62" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#fde047">100h</text>
      {/* Pájaros */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '14px 14px' }}>
        <path d="M8 14 Q11 10 14 14 Q17 10 20 14" fill="none" stroke="#451a03" strokeWidth="1.2" />
      </g>
      <g className="ba-anim anim-sway" style={{ transformOrigin: '46px 10px', animationDelay: '.5s' }}>
        <path d="M42 10 Q44 7 46 10 Q48 7 50 10" fill="none" stroke="#451a03" strokeWidth="1" />
      </g>
    </>
  ),

  // ═══════════════════════ ASIGNATURAS ═══════════════════════
  subjects_1: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cov`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="0.6" stopColor="#15803d" />
          <stop offset="1" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id={`${id}page`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      {/* Sombra inferior */}
      <ellipse cx="32" cy="56" rx="22" ry="2" fill="#0f172a" opacity="0.25" />
      {/* Cubierta del libro */}
      <path d="M6 14 Q20 10 32 16 Q44 10 58 14 V52 Q44 48 32 54 Q20 48 6 52 Z" fill={`url(#${id}cov)`} stroke="#14532d" {...S} />
      {/* Páginas blancas */}
      <path d="M9 16 Q20 13 30 18 V50 Q20 47 9 49 Z" fill={`url(#${id}page)`} stroke="#15803d" strokeWidth="1.2" />
      <path d="M55 16 Q44 13 34 18 V50 Q44 47 55 49 Z" fill={`url(#${id}page)`} stroke="#15803d" strokeWidth="1.2" />
      {/* Líneas de texto */}
      <line x1="13" y1="22" x2="26" y2="20" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="13" y1="26" x2="26" y2="24" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="13" y1="30" x2="26" y2="28" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="13" y1="34" x2="24" y2="32" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="20" x2="51" y2="22" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="24" x2="51" y2="26" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="38" y1="28" x2="51" y2="30" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="40" y1="32" x2="51" y2="34" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      {/* Lomo central */}
      <line x1="32" y1="16" x2="32" y2="54" stroke="#14532d" strokeWidth="2" strokeLinecap="round" />
      {/* Página animada que pasa */}
      <g className="ba-anim anim-page" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 18 Q40 16 48 18 V46 Q40 44 32 46 Z" fill="#fffbeb" stroke="#15803d" strokeWidth="1.2" opacity="0.85" />
      </g>
      {/* Brillo arriba */}
      <g className="ba-anim anim-twinkle">
        <path d="M52 8 L53 11 L56 11 L54 13 L55 16 L52 14 L49 16 L50 13 L48 11 L51 11 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
    </>
  ),
  subjects_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}b1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fca5a5" /><stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id={`${id}b2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" /><stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}b3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" /><stop offset="1" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id={`${id}b4`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#93c5fd" /><stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {/* Eje X y Y */}
      <line x1="6" y1="56" x2="60" y2="56" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="8" x2="6" y2="56" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      {/* Marcas eje Y */}
      <line x1="4" y1="18" x2="6" y2="18" stroke="#475569" strokeWidth="1" />
      <line x1="4" y1="32" x2="6" y2="32" stroke="#475569" strokeWidth="1" />
      <line x1="4" y1="46" x2="6" y2="46" stroke="#475569" strokeWidth="1" />
      {/* Barras animadas con altura escalada */}
      <g className="ba-anim anim-bar" style={{ transformOrigin: '15px 56px' }}>
        <rect x="11" y="32" width="9" height="24" rx="1" fill={`url(#${id}b1)`} stroke="#7f1d1d" strokeWidth="1.2" />
        <rect x="11" y="32" width="9" height="2" fill="#fef2f2" opacity="0.6" />
      </g>
      <g className="ba-anim anim-bar" style={{ transformOrigin: '26px 56px', animationDelay: '.3s' }}>
        <rect x="22" y="22" width="9" height="34" rx="1" fill={`url(#${id}b2)`} stroke="#92400e" strokeWidth="1.2" />
        <rect x="22" y="22" width="9" height="2" fill="#fffbeb" opacity="0.6" />
      </g>
      <g className="ba-anim anim-bar" style={{ transformOrigin: '37px 56px', animationDelay: '.6s' }}>
        <rect x="33" y="14" width="9" height="42" rx="1" fill={`url(#${id}b3)`} stroke="#14532d" strokeWidth="1.2" />
        <rect x="33" y="14" width="9" height="2" fill="#f0fdf4" opacity="0.6" />
        {/* Estrella en la barra ganadora */}
        <path d="M37.5 18 L38.5 20.5 L41 20.5 L39 22 L40 24.5 L37.5 23 L35 24.5 L36 22 L34 20.5 L36.5 20.5 Z" fill="#fbbf24" />
      </g>
      <g className="ba-anim anim-bar" style={{ transformOrigin: '48px 56px', animationDelay: '.9s' }}>
        <rect x="44" y="26" width="9" height="30" rx="1" fill={`url(#${id}b4)`} stroke="#1e3a8a" strokeWidth="1.2" />
        <rect x="44" y="26" width="9" height="2" fill="#eff6ff" opacity="0.6" />
      </g>
      {/* Línea de tendencia */}
      <path d="M15 32 L26 22 L37 14 L48 26" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
    </>
  ),
  subjects_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}b1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fca5a5" /><stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id={`${id}b2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" /><stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}b3`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" /><stop offset="1" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id={`${id}b4`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" /><stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${id}b5`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      {/* Sombra */}
      <ellipse cx="32" cy="58" rx="26" ry="2" fill="#0f172a" opacity="0.3" />
      {/* Estantería */}
      <line x1="4" y1="56" x2="60" y2="56" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
      <line x1="4" y1="6" x2="60" y2="6" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* 5 libros con sway grupal */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 56px' }}>
        {/* Libro 1 (rojo, recto) */}
        <g>
          <rect x="6" y="20" width="8" height="36" rx="0.8" fill={`url(#${id}b1)`} stroke="#450a0a" strokeWidth="1.2" />
          <line x1="6" y1="24" x2="14" y2="24" stroke="#fef2f2" strokeWidth="0.8" opacity="0.7" />
          <line x1="6" y1="28" x2="14" y2="28" stroke="#fef2f2" strokeWidth="0.8" opacity="0.7" />
          <line x1="6" y1="52" x2="14" y2="52" stroke="#fef2f2" strokeWidth="0.8" opacity="0.7" />
          <text x="10" y="42" textAnchor="middle" fontSize="4" fontWeight="900" fill="#fff" transform="rotate(-90 10 42)">L</text>
        </g>
        {/* Libro 2 (ámbar, ligeramente inclinado) */}
        <g transform="rotate(-3 18 56)">
          <rect x="14" y="22" width="8" height="34" rx="0.8" fill={`url(#${id}b2)`} stroke="#451a03" strokeWidth="1.2" />
          <line x1="14" y1="26" x2="22" y2="26" stroke="#fffbeb" strokeWidth="0.8" opacity="0.7" />
          <line x1="14" y1="30" x2="22" y2="30" stroke="#fffbeb" strokeWidth="0.8" opacity="0.7" />
          <text x="18" y="42" textAnchor="middle" fontSize="4" fontWeight="900" fill="#fff" transform="rotate(-90 18 42)">M</text>
        </g>
        {/* Libro 3 (verde, recto, central, más alto) */}
        <g>
          <rect x="22" y="14" width="10" height="42" rx="0.8" fill={`url(#${id}b3)`} stroke="#052e16" strokeWidth="1.2" />
          <line x1="22" y1="20" x2="32" y2="20" stroke="#f0fdf4" strokeWidth="0.8" opacity="0.7" />
          <line x1="22" y1="24" x2="32" y2="24" stroke="#f0fdf4" strokeWidth="0.8" opacity="0.7" />
          <line x1="22" y1="50" x2="32" y2="50" stroke="#f0fdf4" strokeWidth="0.8" opacity="0.7" />
          <text x="27" y="40" textAnchor="middle" fontSize="4" fontWeight="900" fill="#fff" transform="rotate(-90 27 40)">CN</text>
          {/* Cinta marcador */}
          <path d="M28 14 L28 18 L26 16 L24 18 L24 14" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
        </g>
        {/* Libro 4 (cian, recto) */}
        <g transform="rotate(2 36 56)">
          <rect x="32" y="18" width="8" height="38" rx="0.8" fill={`url(#${id}b4)`} stroke="#0c4a6e" strokeWidth="1.2" />
          <line x1="32" y1="22" x2="40" y2="22" stroke="#cffafe" strokeWidth="0.8" opacity="0.7" />
          <line x1="32" y1="26" x2="40" y2="26" stroke="#cffafe" strokeWidth="0.8" opacity="0.7" />
          <text x="36" y="42" textAnchor="middle" fontSize="4" fontWeight="900" fill="#fff" transform="rotate(-90 36 42)">EF</text>
        </g>
        {/* Libro 5 (púrpura, inclinado) */}
        <g transform="rotate(8 50 56)">
          <rect x="40" y="22" width="9" height="34" rx="0.8" fill={`url(#${id}b5)`} stroke="#1e1b4b" strokeWidth="1.2" />
          <line x1="40" y1="26" x2="49" y2="26" stroke="#ede9fe" strokeWidth="0.8" opacity="0.7" />
          <line x1="40" y1="30" x2="49" y2="30" stroke="#ede9fe" strokeWidth="0.8" opacity="0.7" />
          <text x="44.5" y="42" textAnchor="middle" fontSize="4" fontWeight="900" fill="#fff" transform="rotate(-90 44.5 42)">A</text>
        </g>
        {/* Tope final apoyado */}
        <rect x="50" y="34" width="6" height="22" rx="0.8" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" transform="rotate(15 53 56)" />
      </g>
      {/* Búho posado en lo alto */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '52px 12px', animationDelay: '.3s' }}>
        <ellipse cx="52" cy="14" rx="5" ry="6" fill="#7c2d12" stroke="#451a03" strokeWidth="1.2" />
        <circle cx="50" cy="13" r="1.8" fill="#fef3c7" stroke="#7c2d12" strokeWidth="0.6" />
        <circle cx="54" cy="13" r="1.8" fill="#fef3c7" stroke="#7c2d12" strokeWidth="0.6" />
        <circle cx="50" cy="13" r="0.7" fill="#0f172a" />
        <circle cx="54" cy="13" r="0.7" fill="#0f172a" />
        <path d="M52 15 L51 16 L53 16 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.4" />
      </g>
      {/* Estrella decorativa */}
      <g className="ba-anim anim-twinkle">
        <path d="M10 10 L11 12 L13 12 L11.5 13.5 L12 16 L10 14.5 L8 16 L8.5 13.5 L7 12 L9 12 Z" fill="#fbbf24" />
      </g>
    </>
  ),
  subjects_8: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}top8`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="0.5" stopColor="#4c1d95" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id={`${id}base8`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id={`${id}tas8`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Sombra */}
      <ellipse cx="32" cy="52" rx="22" ry="2" fill="#0f172a" opacity="0.3" />
      {/* Diploma enrollado al fondo */}
      <g transform="rotate(-12 14 50)">
        <rect x="6" y="44" width="18" height="4" rx="1" fill="#fef3c7" stroke="#92400e" strokeWidth="1.2" />
        <line x1="8" y1="46" x2="22" y2="46" stroke="#92400e" strokeWidth="0.8" opacity="0.6" />
        <circle cx="6" cy="46" r="2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
        <circle cx="24" cy="46" r="2" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
      </g>
      {/* Libro abierto al fondo */}
      <g transform="rotate(8 50 48)">
        <path d="M44 42 H56 V52 H44 Z" fill="#86efac" stroke="#14532d" strokeWidth="1.2" />
        <line x1="50" y1="42" x2="50" y2="52" stroke="#14532d" strokeWidth="1" />
        <line x1="46" y1="44" x2="48.5" y2="44" stroke="#fff" strokeWidth="0.6" />
        <line x1="51.5" y1="44" x2="54" y2="44" stroke="#fff" strokeWidth="0.6" />
      </g>
      {/* Base graduación */}
      <path d="M16 32 V42 Q32 50 48 42 V32" fill={`url(#${id}top8)`} stroke="#020617" strokeWidth="2.5" />
      <path d="M16 32 Q32 38 48 32" fill="none" stroke="#7c3aed" strokeWidth="1.2" opacity="0.6" />
      {/* Tablero plano superior */}
      <path d="M2 26 L32 12 L62 26 L32 40 Z" fill={`url(#${id}top8)`} stroke="#020617" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M2 26 L32 18 L62 26" fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.6" />
      {/* Borde dorado decorativo */}
      <path d="M2 26 L32 12 L62 26 L32 40 Z" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      {/* Botón central con joya */}
      <circle cx="32" cy="26" r="3.5" fill={`url(#${id}base8)`} stroke="#92400e" strokeWidth="1.2" />
      <circle cx="32" cy="26" r="1.5" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.6" />
      {/* Cordón largo */}
      <path d="M32 26 Q44 22 56 30 L60 36" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      {/* Borla con sway */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '60px 36px' }}>
        <line x1="60" y1="36" x2="60" y2="46" stroke={`url(#${id}tas8)`} strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="60" cy="50" rx="5" ry="6" fill={`url(#${id}tas8)`} stroke="#92400e" strokeWidth="1.5" />
        <line x1="56" y1="48" x2="55" y2="56" stroke="#a16207" strokeWidth="0.8" />
        <line x1="58" y1="48" x2="58" y2="58" stroke="#a16207" strokeWidth="0.8" />
        <line x1="60" y1="48" x2="60" y2="58" stroke="#a16207" strokeWidth="0.8" />
        <line x1="62" y1="48" x2="62" y2="58" stroke="#a16207" strokeWidth="0.8" />
        <line x1="64" y1="48" x2="65" y2="56" stroke="#a16207" strokeWidth="0.8" />
      </g>
      {/* "8" inscrito en el tablero */}
      <text x="32" y="29" textAnchor="middle" fontSize="6" fontWeight="900" fill="#fef3c7" stroke="none">8</text>
      {/* Estrellas brillantes */}
      <g className="ba-anim anim-twinkle">
        <path d="M8 8 L9 11 L12 11 L10 13 L11 16 L8 14 L5 16 L6 13 L4 11 L7 11 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.4" />
      </g>
      <g className="ba-anim anim-twinkle-2">
        <path d="M50 6 L51 8 L53 8 L51.5 9.5 L52 12 L50 10.5 L48 12 L48.5 9.5 L47 8 L49 8 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.4" />
      </g>
      <g className="ba-anim anim-twinkle-3">
        <circle cx="56" cy="14" r="1" fill="#fef9c3" />
      </g>
    </>
  ),
  subjects_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}ped`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.5" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id={`${id}col`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="0.5" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <radialGradient id={`${id}haloT10`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Halo */}
      <circle cx="32" cy="32" r="32" fill={`url(#${id}haloT10)`} />
      {/* Escalera base */}
      <rect x="4" y="52" width="56" height="8" rx="1" fill={`url(#${id}ped)`} stroke="#451a03" strokeWidth="1.5" />
      <rect x="4" y="52" width="56" height="2" fill="#fffbeb" opacity="0.5" />
      {/* Arquitrabe (dintel superior) */}
      <path d="M6 12 H58 L56 18 H8 Z" fill={`url(#${id}ped)`} stroke="#451a03" strokeWidth="1.5" />
      <path d="M6 12 H58" stroke="#fffbeb" strokeWidth="0.8" opacity="0.7" />
      {/* Frontón triangular */}
      <path d="M8 12 L32 2 L56 12 Z" fill={`url(#${id}ped)`} stroke="#451a03" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 12 L32 4 L54 12" fill="none" stroke="#fffbeb" strokeWidth="0.8" opacity="0.6" />
      {/* Decoración en el frontón */}
      <g className="ba-anim anim-twinkle">
        <path d="M32 6 L33 8 L35 8 L33.5 9 L34 11 L32 10 L30 11 L30.5 9 L29 8 L31 8 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
      </g>
      {/* 6 columnas estriadas */}
      {[12, 20, 28, 36, 44, 52].map((x, i) => (
        <g key={i}>
          <rect x={x - 2} y="18" width="4" height="34" fill={`url(#${id}col)`} stroke="#94a3b8" strokeWidth="1" />
          {/* Estrías verticales */}
          <line x1={x - 1} y1="20" x2={x - 1} y2="50" stroke="#cbd5e1" strokeWidth="0.5" />
          <line x1={x + 1} y1="20" x2={x + 1} y2="50" stroke="#cbd5e1" strokeWidth="0.5" />
          {/* Capitel superior */}
          <rect x={x - 3} y="16" width="6" height="3" rx="0.5" fill={`url(#${id}col)`} stroke="#94a3b8" strokeWidth="0.8" />
          {/* Basa inferior */}
          <rect x={x - 3} y="50" width="6" height="3" rx="0.5" fill={`url(#${id}col)`} stroke="#94a3b8" strokeWidth="0.8" />
        </g>
      ))}
      {/* Interior entre columnas: libro abierto en el centro */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 38px' }}>
        <path d="M24 30 L32 28 L40 30 V42 L32 44 L24 42 Z" fill="#fef3c7" stroke="#7c2d12" strokeWidth="1.2" />
        <line x1="32" y1="28" x2="32" y2="44" stroke="#7c2d12" strokeWidth="1" />
        {/* Líneas texto */}
        <line x1="26" y1="32" x2="30" y2="31" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="26" y1="35" x2="30" y2="34" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="26" y1="38" x2="30" y2="37" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="34" y1="31" x2="38" y2="32" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="34" y1="34" x2="38" y2="35" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="34" y1="37" x2="38" y2="38" stroke="#94a3b8" strokeWidth="0.6" />
      </g>
      {/* "10" inscrito en el frontón */}
      <text x="32" y="11" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#7c2d12">X</text>
      {/* Antorchas */}
      <g className="ba-anim anim-flame" style={{ transformOrigin: '8px 26px' }}>
        <line x1="8" y1="22" x2="8" y2="30" stroke="#7c2d12" strokeWidth="1.5" />
        <path d="M8 22 Q6 18 8 16 Q10 18 8 22 Z" fill="#fb923c" stroke="#7f1d1d" strokeWidth="0.8" />
      </g>
      <g className="ba-anim anim-flame" style={{ transformOrigin: '56px 26px', animationDelay: '.3s' }}>
        <line x1="56" y1="22" x2="56" y2="30" stroke="#7c2d12" strokeWidth="1.5" />
        <path d="M56 22 Q54 18 56 16 Q58 18 56 22 Z" fill="#fb923c" stroke="#7f1d1d" strokeWidth="0.8" />
      </g>
      {/* Rayos detrás */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const x1 = 32 + Math.sin(a) * 26;
          const y1 = 32 - Math.cos(a) * 26;
          const x2 = 32 + Math.sin(a) * 30;
          const y2 = 32 - Math.cos(a) * 30;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />;
        })}
      </g>
    </>
  ),

  // ═══════════════════════ RANKING ═══════════════════════

  // ─── TOP 10 GLOBAL ───
  rank_top10_1: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}shd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      {/* Escudo */}
      <path d="M32 6 L54 16 V36 Q54 54 32 60 Q10 54 10 36 V16 Z" fill={`url(#${id}shd)`} stroke="#475569" {...S} />
      <path d="M32 10 L50 18 V36 Q50 50 32 56 Q14 50 14 36 V18 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
      {/* 10 grande */}
      <text x="32" y="40" textAnchor="middle" fontSize="18" fontWeight="900" fill="#475569" stroke="#e2e8f0" strokeWidth="0.5">10</text>
      {/* Estrellita arriba */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 18px' }}>
        <path d="M32 14 L33.5 17 L37 17.5 L34.5 19.5 L35 23 L32 21 L29 23 L29.5 19.5 L27 17.5 L30.5 17 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      </g>
    </>
  ),
  rank_top10_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}shd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#64748b" />
        </linearGradient>
      </defs>
      <path d="M32 6 L54 16 V36 Q54 54 32 60 Q10 54 10 36 V16 Z" fill={`url(#${id}shd)`} stroke="#475569" {...S} />
      <path d="M32 10 L50 18 V36 Q50 50 32 56 Q14 50 14 36 V18 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="32" y="40" textAnchor="middle" fontSize="18" fontWeight="900" fill="#334155" stroke="#e2e8f0" strokeWidth="0.5">10</text>
      {/* 3 estrellas */}
      <g className="ba-anim anim-twinkle">
        <circle cx="24" cy="18" r="2" fill="#94a3b8" /><circle cx="32" cy="15" r="2.5" fill="#64748b" /><circle cx="40" cy="18" r="2" fill="#94a3b8" />
      </g>
    </>
  ),
  rank_top10_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}shd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfdbfe" /><stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M32 6 L54 16 V36 Q54 54 32 60 Q10 54 10 36 V16 Z" fill={`url(#${id}shd)`} stroke="#1e3a8a" {...S} />
      <path d="M32 10 L50 18 V36 Q50 50 32 56 Q14 50 14 36 V18 Z" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="32" y="40" textAnchor="middle" fontSize="18" fontWeight="900" fill="#1e3a8a" stroke="#bfdbfe" strokeWidth="0.5">10</text>
      <g className="ba-anim anim-twinkle">
        {[20,26,32,38,44].map((x,i) => <circle key={i} cx={x} cy={17-(i===2?2:0)} r={i===2?2.5:1.8} fill={i===2?'#2563eb':'#60a5fa'} />)}
      </g>
    </>
  ),
  rank_top10_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}shd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#a78bfa" stopOpacity="0.5" /><stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}glow)`} />
      <path d="M32 6 L54 16 V36 Q54 54 32 60 Q10 54 10 36 V16 Z" fill={`url(#${id}shd)`} stroke="#4c1d95" {...S} />
      <path d="M32 10 L50 18 V36 Q50 50 32 56 Q14 50 14 36 V18 Z" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5" />
      <text x="32" y="40" textAnchor="middle" fontSize="18" fontWeight="900" fill="#4c1d95">10</text>
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 16px' }}>
        {Array.from({length:10}).map((_,i) => {
          const a=(i*36*Math.PI)/180; const cx=32+Math.cos(a)*10; const cy=16+Math.sin(a)*6;
          return <circle key={i} cx={cx} cy={cy} r="1.2" fill="#c4b5fd" />;
        })}
      </g>
    </>
  ),

  // ─── TOP 3 GLOBAL (PODIO) ───
  rank_top3_1: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}pod`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      {/* Podio 3 bloques */}
      <rect x="6" y="36" width="16" height="24" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
      <text x="14" y="50" textAnchor="middle" fontSize="10" fontWeight="900" fill="#475569">3</text>
      <rect x="24" y="22" width="16" height="38" rx="2" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
      <text x="32" y="40" textAnchor="middle" fontSize="12" fontWeight="900" fill="#92400e">1</text>
      <rect x="42" y="30" width="16" height="30" rx="2" fill="#d6d3d1" stroke="#78716c" strokeWidth="2" />
      <text x="50" y="46" textAnchor="middle" fontSize="10" fontWeight="900" fill="#57534e">2</text>
      {/* Estrella dorada arriba del 1 */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 14px' }}>
        <path d="M32 8 L34 13 L39 14 L35 17 L36 22 L32 19 L28 22 L29 17 L25 14 L30 13 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
      </g>
    </>
  ),
  rank_top3_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fed7aa" /><stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      {/* 3 medallas superpuestas */}
      <g className="ba-anim anim-sway" style={{ transformOrigin: '20px 18px' }}>
        <circle cx="20" cy="38" r="11" fill={`url(#${id}m)`} stroke="#7c2d12" strokeWidth="2" />
        <text x="20" y="42" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fef3c7">3</text>
        <line x1="20" y1="27" x2="20" y2="14" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="ba-anim anim-sway" style={{ transformOrigin: '32px 14px', animationDelay: '.2s' }}>
        <circle cx="32" cy="34" r="12" fill="#fde68a" stroke="#92400e" strokeWidth="2.5" />
        <text x="32" y="39" textAnchor="middle" fontSize="11" fontWeight="900" fill="#78350f">1</text>
        <line x1="32" y1="22" x2="32" y2="10" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="ba-anim anim-sway" style={{ transformOrigin: '44px 18px', animationDelay: '.4s' }}>
        <circle cx="44" cy="38" r="11" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
        <text x="44" y="42" textAnchor="middle" fontSize="10" fontWeight="900" fill="#475569">2</text>
        <line x1="44" y1="27" x2="44" y2="14" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  ),
  rank_top3_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cup`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9d5ff" /><stop offset="0.5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      {/* Trofeo morado */}
      <rect x="26" y="48" width="12" height="6" rx="1" fill="#7c3aed" stroke="#4c1d95" strokeWidth="1.5" />
      <rect x="22" y="54" width="20" height="4" rx="1" fill="#6d28d9" stroke="#4c1d95" strokeWidth="1.5" />
      <rect x="28" y="40" width="8" height="8" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1.5" />
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 26px' }}>
        <path d="M14 12 H50 V26 Q50 40 32 42 Q14 40 14 26 Z" fill={`url(#${id}cup)`} stroke="#4c1d95" strokeWidth="2.5" />
        <path d="M14 12 Q4 14 4 22 Q4 30 14 32" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 12 Q60 14 60 22 Q60 30 50 32" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
        <text x="32" y="30" textAnchor="middle" fontSize="12" fontWeight="900" fill="#fef3c7" stroke="#4c1d95" strokeWidth="0.4">TOP3</text>
        <ellipse cx="22" cy="16" rx="2" ry="5" fill="#e9d5ff" opacity="0.5" />
      </g>
      {/* 5 estrellas */}
      <g className="ba-anim anim-twinkle">
        {[16,24,32,40,48].map((x,i) => <circle key={i} cx={x} cy={8} r="1.8" fill="#c4b5fd" />)}
      </g>
    </>
  ),
  rank_top3_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cup`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="0.4" stopColor="#fde047" /><stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#fde047" stopOpacity="0.5" /><stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}glow)`} />
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({length:12}).map((_,i) => {
          const a=(i*30*Math.PI)/180; return <line key={i} x1={32+Math.sin(a)*26} y1={32-Math.cos(a)*26} x2={32+Math.sin(a)*31} y2={32-Math.cos(a)*31} stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />;
        })}
      </g>
      <rect x="26" y="48" width="12" height="5" rx="1" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <rect x="22" y="53" width="20" height="5" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      <rect x="28" y="40" width="8" height="8" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 24px' }}>
        <path d="M14 10 H50 V24 Q50 40 32 42 Q14 40 14 24 Z" fill={`url(#${id}cup)`} stroke="#78350f" strokeWidth="2.5" />
        <path d="M14 10 Q4 12 4 20 Q4 28 14 30" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M50 10 Q60 12 60 20 Q60 28 50 30" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
        <text x="32" y="29" textAnchor="middle" fontSize="11" fontWeight="900" fill="#78350f" stroke="#fef3c7" strokeWidth="0.4">TOP3</text>
        <ellipse cx="22" cy="15" rx="2" ry="5" fill="#fffbeb" opacity="0.6" />
      </g>
      <g className="ba-anim anim-twinkle">
        <path d="M32 2 L33.5 6 L38 6.5 L35 9 L36 13 L32 10.5 L28 13 L29 9 L26 6.5 L30.5 6 Z" fill="#fde047" stroke="#92400e" strokeWidth="0.8" />
      </g>
    </>
  ),

  // ─── PRIMERO GLOBAL (CORONA) ───
  rank_first_1: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#92400e" />
        </linearGradient>
      </defs>
      {/* Corona */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 28px' }}>
        <path d="M8 38 L14 18 L24 30 L32 12 L40 30 L50 18 L56 38 Z" fill={`url(#${id}cr)`} stroke="#78350f" {...S} />
        <rect x="8" y="38" width="48" height="8" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="2.5" />
        <circle cx="14" cy="18" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
        <circle cx="32" cy="12" r="3.5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" />
        <circle cx="50" cy="18" r="3" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
        <ellipse cx="18" cy="30" rx="2" ry="4" fill="#fffbeb" opacity="0.5" />
      </g>
      {/* #1 */}
      <text x="32" y="58" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350f">#1</text>
    </>
  ),
  rank_first_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="0.5" stopColor="#f59e0b" /><stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id={`${id}gem`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#fecaca" /><stop offset="0.6" stopColor="#dc2626" /><stop offset="1" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 28px' }}>
        <path d="M6 38 L14 16 L24 30 L32 8 L40 30 L50 16 L58 38 Z" fill={`url(#${id}cr)`} stroke="#78350f" {...S} />
        <rect x="6" y="38" width="52" height="9" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
        <rect x="6" y="38" width="52" height="3" fill="#fde68a" opacity="0.4" />
        <circle cx="14" cy="16" r="3.5" fill={`url(#${id}gem)`} stroke="#7f1d1d" strokeWidth="1" />
        <circle cx="32" cy="8" r="4" fill={`url(#${id}gem)`} stroke="#7f1d1d" strokeWidth="1.2" />
        <circle cx="50" cy="16" r="3.5" fill={`url(#${id}gem)`} stroke="#7f1d1d" strokeWidth="1" />
        <ellipse cx="18" cy="28" rx="2" ry="5" fill="#fffbeb" opacity="0.5" />
      </g>
      <text x="32" y="56" textAnchor="middle" fontSize="9" fontWeight="900" fill="#78350f">x3</text>
    </>
  ),
  rank_first_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="0.4" stopColor="#fbbf24" /><stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id={`${id}gem`} cx="0.4" cy="0.3">
          <stop offset="0" stopColor="#e9d5ff" /><stop offset="0.6" stopColor="#8b5cf6" /><stop offset="1" stopColor="#4c1d95" />
        </radialGradient>
      </defs>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 28px' }}>
        <path d="M6 38 L14 14 L24 28 L32 6 L40 28 L50 14 L58 38 Z" fill={`url(#${id}cr)`} stroke="#78350f" {...S} />
        <rect x="6" y="38" width="52" height="9" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="2.5" />
        <circle cx="14" cy="14" r="3.5" fill={`url(#${id}gem)`} stroke="#4c1d95" strokeWidth="1" />
        <circle cx="32" cy="6" r="4.5" fill={`url(#${id}gem)`} stroke="#4c1d95" strokeWidth="1.2" />
        <circle cx="50" cy="14" r="3.5" fill={`url(#${id}gem)`} stroke="#4c1d95" strokeWidth="1" />
        {/* Puntos gema decorativos */}
        <circle cx="22" cy="42" r="2" fill={`url(#${id}gem)`} stroke="#4c1d95" strokeWidth="0.8" />
        <circle cx="32" cy="42" r="2" fill={`url(#${id}gem)`} stroke="#4c1d95" strokeWidth="0.8" />
        <circle cx="42" cy="42" r="2" fill={`url(#${id}gem)`} stroke="#4c1d95" strokeWidth="0.8" />
        <ellipse cx="18" cy="28" rx="2" ry="5" fill="#fffbeb" opacity="0.5" />
      </g>
      <text x="32" y="58" textAnchor="middle" fontSize="9" fontWeight="900" fill="#4c1d95">x5</text>
    </>
  ),
  rank_first_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}cr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbeb" /><stop offset="0.3" stopColor="#fde047" /><stop offset="0.7" stopColor="#d97706" /><stop offset="1" stopColor="#451a03" />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#fde047" stopOpacity="0.6" /><stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${id}gl)`} />
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({length:16}).map((_,i) => {
          const a=(i*22.5*Math.PI)/180; return <line key={i} x1={32+Math.sin(a)*28} y1={32-Math.cos(a)*28} x2={32+Math.sin(a)*32} y2={32-Math.cos(a)*32} stroke="#fbbf24" strokeWidth={i%2?0.8:1.5} strokeLinecap="round" opacity="0.6" />;
        })}
      </g>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 26px' }}>
        <path d="M6 38 L14 12 L24 28 L32 4 L40 28 L50 12 L58 38 Z" fill={`url(#${id}cr)`} stroke="#78350f" strokeWidth="3" strokeLinejoin="round" />
        <rect x="6" y="38" width="52" height="10" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="2.5" />
        <rect x="6" y="38" width="52" height="3" fill="#fde68a" opacity="0.4" />
        <circle cx="14" cy="12" r="4" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
        <circle cx="32" cy="4" r="5" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.2" />
        <circle cx="50" cy="12" r="4" fill="#10b981" stroke="#064e3b" strokeWidth="1.2" />
        <circle cx="32" cy="4" r="1.5" fill="#bfdbfe" />
        <ellipse cx="18" cy="26" rx="2" ry="6" fill="#fffbeb" opacity="0.6" />
      </g>
      <text x="32" y="56" textAnchor="middle" fontSize="7" fontWeight="900" fill="#fef3c7">LEYENDA</text>
    </>
  ),

  // ─── TOP 3 CLASE ───
  rank_class3_1: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcfce7" /><stop offset="1" stopColor="#86efac" />
        </linearGradient>
      </defs>
      {/* Pizarra / aula */}
      <rect x="8" y="8" width="48" height="34" rx="4" fill="#166534" stroke="#14532d" {...S} />
      <rect x="12" y="12" width="40" height="26" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      {/* Texto podio */}
      <text x="32" y="28" textAnchor="middle" fontSize="10" fontWeight="900" fill="#bbf7d0">TOP 3</text>
      {/* Tiza */}
      <rect x="18" y="44" width="28" height="3" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
      {/* Estrella */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 50px' }}>
        <path d="M32 48 L33.5 51 L37 51.5 L34.5 53.5 L35 57 L32 55 L29 57 L29.5 53.5 L27 51.5 L30.5 51 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
      </g>
    </>
  ),
  rank_class3_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcfce7" /><stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="34" rx="4" fill="#166534" stroke="#14532d" {...S} />
      <rect x="12" y="12" width="40" height="26" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <text x="32" y="28" textAnchor="middle" fontSize="10" fontWeight="900" fill="#bbf7d0">TOP 3</text>
      <rect x="18" y="44" width="28" height="3" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
      {/* 3 estrellas */}
      <g className="ba-anim anim-twinkle">
        <path d="M20 51 L21 54 L24 54 L21.5 56 L22.5 59 L20 57 L17.5 59 L18.5 56 L16 54 L19 54 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
        <path d="M32 48 L33.5 52 L37 52 L34 54.5 L35 58 L32 55.5 L29 58 L30 54.5 L27 52 L30.5 52 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.7" />
        <path d="M44 51 L45 54 L48 54 L45.5 56 L46.5 59 L44 57 L41.5 59 L42.5 56 L40 54 L43 54 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.6" />
      </g>
    </>
  ),
  rank_class3_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bbf7d0" /><stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="34" rx="4" fill="#166534" stroke="#14532d" {...S} />
      <rect x="12" y="12" width="40" height="26" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <text x="32" y="22" textAnchor="middle" fontSize="7" fontWeight="800" fill="#86efac">ORGULLO</text>
      <text x="32" y="33" textAnchor="middle" fontSize="9" fontWeight="900" fill="#dcfce7">DE CLASE</text>
      <rect x="18" y="44" width="28" height="3" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 54px' }}>
        <path d="M24 48 L28 48 L32 44 L36 48 L40 48 L38 52 L40 56 L32 54 L24 56 L26 52 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
      </g>
    </>
  ),
  rank_class3_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bbf7d0" /><stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#4ade80" stopOpacity="0.4" /><stop offset="1" stopColor="#4ade80" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}glow)`} />
      <rect x="8" y="8" width="48" height="34" rx="4" fill="#166534" stroke="#14532d" {...S} />
      <rect x="12" y="12" width="40" height="26" rx="2" fill="#15803d" stroke="#14532d" strokeWidth="1" />
      <text x="32" y="22" textAnchor="middle" fontSize="7" fontWeight="800" fill="#86efac">LEYENDA</text>
      <text x="32" y="33" textAnchor="middle" fontSize="9" fontWeight="900" fill="#dcfce7">DE CLASE</text>
      <rect x="18" y="44" width="28" height="3" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 54px' }}>
        <path d="M22 48 L26 48 L32 42 L38 48 L42 48 L39 53 L42 58 L32 55 L22 58 L25 53 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="32" cy="50" r="2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8" />
      </g>
    </>
  ),

  // ─── PRIMERO DE CLASE ───
  rank_class1_1: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Libro/pupitre */}
      <rect x="10" y="40" width="44" height="18" rx="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2.5" />
      <rect x="10" y="40" width="44" height="4" fill="#2563eb" opacity="0.5" rx="3" />
      <text x="32" y="54" textAnchor="middle" fontSize="7" fontWeight="800" fill="#bfdbfe">#1 CLASE</text>
      {/* Estrella grande encima */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 24px' }}>
        <path d="M32 6 L36 18 L48 20 L39 28 L42 40 L32 34 L22 40 L25 28 L16 20 L28 18 Z"
              fill={`url(#${id}star)`} stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="26" cy="16" rx="2" ry="4" fill="#fffbeb" opacity="0.5" />
      </g>
    </>
  ),
  rank_class1_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef9c3" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <rect x="10" y="42" width="44" height="16" rx="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2.5" />
      <text x="32" y="54" textAnchor="middle" fontSize="7" fontWeight="800" fill="#bfdbfe">CAMPEON</text>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 22px' }}>
        <path d="M32 4 L36 16 L48 17 L39 25 L42 37 L32 31 L22 37 L25 25 L16 17 L28 16 Z"
              fill={`url(#${id}star)`} stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
        <text x="32" y="26" textAnchor="middle" fontSize="8" fontWeight="900" fill="#78350f">x3</text>
        <ellipse cx="26" cy="14" rx="2" ry="4" fill="#fffbeb" opacity="0.5" />
      </g>
    </>
  ),
  rank_class1_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9d5ff" /><stop offset="0.5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <rect x="10" y="42" width="44" height="16" rx="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2.5" />
      <text x="32" y="54" textAnchor="middle" fontSize="7" fontWeight="800" fill="#bfdbfe">CAPITAN</text>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 22px' }}>
        <path d="M32 4 L36 16 L48 17 L39 25 L42 37 L32 31 L22 37 L25 25 L16 17 L28 16 Z"
              fill={`url(#${id}star)`} stroke="#4c1d95" strokeWidth="2" strokeLinejoin="round" />
        <text x="32" y="26" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fef3c7">x5</text>
        <ellipse cx="26" cy="14" rx="2" ry="4" fill="#e9d5ff" opacity="0.5" />
      </g>
      {/* Destellos */}
      <g className="ba-anim anim-twinkle">
        <circle cx="8" cy="12" r="1.5" fill="#a78bfa" /><circle cx="56" cy="12" r="1.5" fill="#c4b5fd" /><circle cx="8" cy="36" r="1" fill="#a78bfa" /><circle cx="56" cy="36" r="1" fill="#c4b5fd" />
      </g>
    </>
  ),
  rank_class1_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbeb" /><stop offset="0.3" stopColor="#fde047" /><stop offset="0.7" stopColor="#d97706" /><stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#fde047" stopOpacity="0.5" /><stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${id}gl)`} />
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({length:12}).map((_,i) => {
          const a=(i*30*Math.PI)/180; return <line key={i} x1={32+Math.sin(a)*27} y1={32-Math.cos(a)*27} x2={32+Math.sin(a)*31} y2={32-Math.cos(a)*31} stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />;
        })}
      </g>
      <rect x="10" y="44" width="44" height="14" rx="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2.5" />
      <text x="32" y="55" textAnchor="middle" fontSize="6" fontWeight="800" fill="#fde68a">DIOS DE CLASE</text>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 22px' }}>
        <path d="M32 2 L37 16 L52 17 L40 27 L44 42 L32 34 L20 42 L24 27 L12 17 L27 16 Z"
              fill={`url(#${id}star)`} stroke="#78350f" strokeWidth="2.5" strokeLinejoin="round" />
        <text x="32" y="27" textAnchor="middle" fontSize="8" fontWeight="900" fill="#78350f">#1</text>
        <ellipse cx="24" cy="14" rx="2" ry="5" fill="#fffbeb" opacity="0.6" />
      </g>
    </>
  ),

  // ═══════════════════════ TEACHER: GRUPOS ═══════════════════════
  teacher_first_group: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sl2} /><stop offset="1" stopColor={C.sl4} />
        </linearGradient>
      </defs>
      {/* Persona */}
      <circle cx="28" cy="22" r="8" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2.5" />
      <path d="M14 48 Q14 36 28 36 Q42 36 42 48" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2.5" strokeLinecap="round" />
      {/* Signo + animado */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '50px 22px' }}>
        <circle cx="50" cy="22" r="9" fill={C.grn} stroke={C.emr} strokeWidth="2" />
        <line x1="50" y1="17" x2="50" y2="27" stroke={C.whi} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="45" y1="22" x2="55" y2="22" stroke={C.whi} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </>
  ),
  teacher_groups_3: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky} /><stop offset="1" stopColor={C.blu} />
        </linearGradient>
      </defs>
      {/* 3 figuritas */}
      <circle cx="16" cy="24" r="6" fill={C.sky} stroke={C.blu} strokeWidth="2" />
      <path d="M6 46 Q6 36 16 36 Q26 36 26 46" fill={C.sky} stroke={C.blu} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="20" r="7" fill={`url(#${id}bg)`} stroke={C.nav} strokeWidth="2.5" />
      <path d="M20 46 Q20 34 32 34 Q44 34 44 46" fill={`url(#${id}bg)`} stroke={C.nav} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="48" cy="24" r="6" fill={C.sky} stroke={C.blu} strokeWidth="2" />
      <path d="M38 46 Q38 36 48 36 Q58 36 58 46" fill={C.sky} stroke={C.blu} strokeWidth="2" strokeLinecap="round" />
      {/* Brillo */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 14px' }}>
        <circle cx="32" cy="10" r="2" fill={C.amb} opacity="0.7" />
      </g>
    </>
  ),
  teacher_groups_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.pur} /><stop offset="1" stopColor={C.ind} />
        </linearGradient>
      </defs>
      {/* Pizarra */}
      <rect x="8" y="6" width="48" height="30" rx="3" fill="#1e293b" stroke={C.sl6} strokeWidth="2.5" />
      <rect x="12" y="10" width="40" height="22" rx="1" fill="#334155" />
      <line x1="16" y1="16" x2="44" y2="16" stroke={C.grn} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="21" x2="38" y2="21" stroke={C.grn} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="26" x2="32" y2="26" stroke={C.grn} strokeWidth="1.5" strokeLinecap="round" />
      {/* Alumnos fila */}
      {[16, 26, 36, 46].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="46" r="4.5" fill={`url(#${id}bg)`} stroke={C.ind} strokeWidth="1.5" />
          <path d={`M${cx-6} 60 Q${cx-6} 54 ${cx} 54 Q${cx+6} 54 ${cx+6} 60`} fill={`url(#${id}bg)`} stroke={C.ind} strokeWidth="1.5" />
        </g>
      ))}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 46px' }}>
        <circle cx="32" cy="46" r="1.5" fill={C.amb} opacity="0.6" />
      </g>
    </>
  ),
  teacher_groups_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
      </defs>
      {/* Edificio escolar */}
      <rect x="12" y="20" width="40" height="32" rx="2" fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2.5" />
      <rect x="16" y="38" width="10" height="14" rx="1" fill={C.stn} stroke={X.gold2} strokeWidth="1.5" /> {/* puerta */}
      <rect x="38" y="24" width="8" height="8" rx="1" fill={C.sky} stroke={X.gold2} strokeWidth="1.5" /> {/* ventana */}
      <rect x="18" y="24" width="8" height="8" rx="1" fill={C.sky} stroke={X.gold2} strokeWidth="1.5" /> {/* ventana */}
      {/* Tejado triangular */}
      <path d="M8 22 L32 6 L56 22 Z" fill={C.red} stroke="#7f1d1d" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Estrella animada en tejado */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 14px' }}>
        <path d="M32 8 L34 12 L38 12 L35 15 L36 19 L32 17 L28 19 L29 15 L26 12 L30 12 Z"
              fill={X.gold1} stroke={X.gold2} strokeWidth="1" strokeLinejoin="round" />
      </g>
    </>
  ),

  // ═══════════════════════ TEACHER: ALUMNOS ═══════════════════════
  teacher_students_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sl2} /><stop offset="1" stopColor={C.sl4} />
        </linearGradient>
      </defs>
      {/* 3 personitas con + */}
      <circle cx="16" cy="24" r="7" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2" />
      <path d="M6 48 Q6 38 16 38 Q26 38 26 48" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="24" r="7" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2" />
      <path d="M22 48 Q22 38 32 38 Q42 38 42 48" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="24" r="7" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2" />
      <path d="M38 48 Q38 38 48 38 Q58 38 58 48" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2" strokeLinecap="round" />
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '54px 12px' }}>
        <circle cx="54" cy="12" r="6" fill={C.grn} stroke={C.emr} strokeWidth="1.5" />
        <text x="54" y="15" textAnchor="middle" fontSize="9" fontWeight="900" fill={C.whi}>+</text>
      </g>
    </>
  ),
  teacher_students_25: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.grn} /><stop offset="1" stopColor={C.emr} />
        </linearGradient>
      </defs>
      {/* Grupo nutrido - 2 filas */}
      {[14, 24, 34, 44, 50].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="18" r="5" fill={`url(#${id}bg)`} stroke={C.emr} strokeWidth="1.5" />
        </g>
      ))}
      {[10, 20, 30, 40, 50].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="34" r="5" fill={`url(#${id}bg)`} stroke={C.emr} strokeWidth="1.5" />
          <path d={`M${cx-5} 48 Q${cx-5} 42 ${cx} 42 Q${cx+5} 42 ${cx+5} 48`} fill={`url(#${id}bg)`} stroke={C.emr} strokeWidth="1.2" />
        </g>
      ))}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 34px' }}>
        <text x="32" y="58" textAnchor="middle" fontSize="8" fontWeight="800" fill={C.emr}>25</text>
      </g>
    </>
  ),
  teacher_students_50: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.pur1} /><stop offset="1" stopColor={X.pur2} />
        </linearGradient>
      </defs>
      {/* Multitud con corona */}
      {[10, 20, 30, 40, 50].map((cx, i) => (
        <g key={`r1-${i}`}><circle cx={cx} cy="26" r="5" fill={`url(#${id}bg)`} stroke={X.pur2} strokeWidth="1.5" /></g>
      ))}
      {[14, 24, 34, 44].map((cx, i) => (
        <g key={`r2-${i}`}>
          <circle cx={cx} cy="38" r="5" fill={`url(#${id}bg)`} stroke={X.pur2} strokeWidth="1.5" />
          <path d={`M${cx-5} 52 Q${cx-5} 46 ${cx} 46 Q${cx+5} 46 ${cx+5} 52`} fill={`url(#${id}bg)`} stroke={X.pur2} strokeWidth="1.2" />
        </g>
      ))}
      {/* Corona */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '30px 10px' }}>
        <path d="M18 16 L22 6 L28 14 L32 4 L36 14 L42 6 L46 16 Z" fill={C.amb} stroke={C.gld} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="32" cy="4" r="1.5" fill={X.gold1} />
      </g>
    </>
  ),
  teacher_students_100: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor={X.fire1} stopOpacity="0.4" /><stop offset="1" stopColor={X.fire1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}gl)`} />
      {/* Estadio */}
      <ellipse cx="32" cy="42" rx="26" ry="12" fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2.5" />
      <ellipse cx="32" cy="42" rx="20" ry="8" fill={C.grn} stroke={C.emr} strokeWidth="1.5" />
      {/* Filas de cabezas */}
      {[12, 20, 28, 36, 44, 52].map((cx, i) => (
        <g key={`h-${i}`}><circle cx={cx} cy="28" r="3.5" fill={C.sl4} stroke={C.sl6} strokeWidth="1" /></g>
      ))}
      {[16, 24, 32, 40, 48].map((cx, i) => (
        <g key={`h2-${i}`}><circle cx={cx} cy="22" r="3" fill={C.sl4} stroke={C.sl6} strokeWidth="1" /></g>
      ))}
      {/* 100 */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 12px' }}>
        <text x="32" y="16" textAnchor="middle" fontSize="14" fontWeight="900" fill={X.gold2} stroke={X.gold1} strokeWidth="0.5">100</text>
      </g>
    </>
  ),

  // ═══════════════════════ TEACHER: TAREAS ═══════════════════════
  teacher_first_task: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sl2} /><stop offset="1" stopColor={C.sl4} />
        </linearGradient>
      </defs>
      {/* Clipboard */}
      <rect x="14" y="10" width="36" height="46" rx="4" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2.5" />
      <rect x="24" y="6" width="16" height="8" rx="3" fill={C.sl6} stroke={C.stn} strokeWidth="1.5" />
      {/* Check */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 36px' }}>
        <polyline points="24,36 30,42 42,28" fill="none" stroke={C.grn} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  ),
  teacher_tasks_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky} /><stop offset="1" stopColor={C.blu} />
        </linearGradient>
      </defs>
      {/* Clipboard con lista */}
      <rect x="14" y="8" width="36" height="48" rx="4" fill={`url(#${id}bg)`} stroke={C.nav} strokeWidth="2.5" />
      <rect x="24" y="4" width="16" height="8" rx="3" fill={C.nav} stroke={C.stn} strokeWidth="1.5" />
      {/* Checks */}
      {[22, 32, 42].map((y, i) => (
        <g key={i}>
          <polyline points={`21,${y} 24,${y+3} 29,${y-2}`} fill="none" stroke={C.grn} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="33" y1={y} x2="44" y2={y} stroke={C.whi} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="44" cy="12" r="1.5" fill={C.amb} opacity="0.7" />
      </g>
    </>
  ),
  teacher_tasks_15: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.pur1} /><stop offset="1" stopColor={C.pur} />
        </linearGradient>
      </defs>
      {/* Pila de clipboards */}
      <rect x="20" y="14" width="32" height="42" rx="3" fill={C.sl4} stroke={C.sl6} strokeWidth="1.5" />
      <rect x="16" y="10" width="32" height="42" rx="3" fill={C.sl2} stroke={C.sl6} strokeWidth="1.5" />
      <rect x="12" y="6" width="32" height="42" rx="4" fill={`url(#${id}bg)`} stroke={X.pur2} strokeWidth="2.5" />
      <rect x="20" y="2" width="16" height="8" rx="3" fill={X.pur2} stroke={C.stn} strokeWidth="1.5" />
      {[18, 28, 38].map((y, i) => (
        <g key={i}>
          <polyline points={`18,${y} 21,${y+3} 26,${y-2}`} fill="none" stroke={C.grn} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="29" y1={y} x2="38" y2={y} stroke={C.whi} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        </g>
      ))}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '28px 28px' }}>
        <circle cx="38" cy="10" r="2" fill={C.mag} opacity="0.6" />
      </g>
    </>
  ),
  teacher_tasks_30: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
      </defs>
      {/* Clipboard dorado */}
      <rect x="14" y="10" width="36" height="46" rx="4" fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2.5" />
      <rect x="24" y="6" width="16" height="8" rx="3" fill={X.gold2} stroke="#78350f" strokeWidth="1.5" />
      {/* Estrella central */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 34px' }}>
        <path d="M32 22 L35 30 L43 31 L37 36 L39 44 L32 40 L25 44 L27 36 L21 31 L29 30 Z"
              fill={X.gold1} stroke={X.gold2} strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="28" cy="28" rx="1.5" ry="3" fill={C.whi} opacity="0.4" />
      </g>
    </>
  ),
  teacher_tasks_50: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.fire1} /><stop offset="0.3" stopColor={X.fire2} /><stop offset="0.7" stopColor={X.fire3} /><stop offset="1" stopColor={X.fire4} />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor={X.fire1} stopOpacity="0.5" /><stop offset="1" stopColor={X.fire1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}gl)`} />
      {/* Clipboard con fuego */}
      <rect x="16" y="14" width="32" height="40" rx="4" fill={`url(#${id}bg)`} stroke={X.fire4} strokeWidth="2.5" />
      <rect x="24" y="10" width="16" height="8" rx="3" fill={X.fire4} stroke="#450a0a" strokeWidth="1.5" />
      {/* Aura de fuego */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 20px' }}>
        <path d="M24 20 Q28 6 32 14 Q36 6 40 20 Q36 16 32 22 Q28 16 24 20 Z" fill={X.fire2} stroke={X.fire3} strokeWidth="1" opacity="0.9" />
        <path d="M28 18 Q30 10 32 16 Q34 10 36 18 Q34 15 32 20 Q30 15 28 18 Z" fill={X.fire1} opacity="0.8" />
      </g>
      <text x="32" y="44" textAnchor="middle" fontSize="10" fontWeight="900" fill={X.fire1}>50</text>
    </>
  ),

  // ═══════════════════════ TEACHER: BATALLAS ═══════════════════════
  teacher_first_battle: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.sl2} /><stop offset="1" stopColor={C.sl4} />
        </linearGradient>
      </defs>
      {/* Dos espadas cruzadas */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <line x1="12" y1="52" x2="44" y2="12" stroke={C.sl6} strokeWidth="4" strokeLinecap="round" />
        <line x1="52" y1="52" x2="20" y2="12" stroke={C.sl6} strokeWidth="4" strokeLinecap="round" />
        {/* Empunaduras */}
        <rect x="8" y="48" width="12" height="5" rx="2" fill={X.bronze1} stroke={X.bronze2} strokeWidth="1.5" transform="rotate(-45,14,50)" />
        <rect x="44" y="48" width="12" height="5" rx="2" fill={X.bronze1} stroke={X.bronze2} strokeWidth="1.5" transform="rotate(45,50,50)" />
        {/* Hojas */}
        <line x1="12" y1="52" x2="44" y2="12" stroke={C.sl2} strokeWidth="2" />
        <line x1="52" y1="52" x2="20" y2="12" stroke={C.sl2} strokeWidth="2" />
      </g>
    </>
  ),
  teacher_battles_5: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky} /><stop offset="1" stopColor={C.blu} />
        </linearGradient>
      </defs>
      {/* Escudo */}
      <path d="M32 4 L56 16 L54 40 Q48 56 32 60 Q16 56 10 40 L8 16 Z" fill={`url(#${id}sh)`} stroke={C.nav} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 8 L52 18 L50 38 Q45 52 32 56 Q19 52 14 38 L12 18 Z" fill="none" stroke={C.whi} strokeWidth="1" opacity="0.4" />
      {/* Espadas cruzadas encima */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
        <line x1="20" y1="44" x2="36" y2="20" stroke={C.sl6} strokeWidth="3" strokeLinecap="round" />
        <line x1="44" y1="44" x2="28" y2="20" stroke={C.sl6} strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="44" x2="36" y2="20" stroke={C.whi} strokeWidth="1.5" />
        <line x1="44" y1="44" x2="28" y2="20" stroke={C.whi} strokeWidth="1.5" />
      </g>
    </>
  ),
  teacher_battles_15: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
      </defs>
      {/* Escudo dorado */}
      <path d="M32 4 L56 16 L54 40 Q48 56 32 60 Q16 56 10 40 L8 16 Z" fill={`url(#${id}sh)`} stroke={X.gold2} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 10 L50 20 L48 38 Q44 50 32 54 Q20 50 16 38 L14 20 Z" fill="none" stroke={C.whi} strokeWidth="1" opacity="0.3" />
      {/* Rayo central */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <path d="M28 16 L36 16 L32 28 L40 28 L26 50 L30 34 L22 34 Z" fill={X.fire1} stroke={X.gold2} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </>
  ),
  teacher_battles_30: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}helm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.3">
          <stop offset="0" stopColor={X.fire1} stopOpacity="0.4" /><stop offset="1" stopColor={X.fire1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}gl)`} />
      {/* Casco gladiador */}
      <path d="M12 36 Q12 12 32 10 Q52 12 52 36 L48 42 L16 42 Z" fill={`url(#${id}helm)`} stroke={X.gold2} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Visera */}
      <path d="M16 34 L48 34 L46 40 L18 40 Z" fill={X.gold2} stroke="#78350f" strokeWidth="1.5" />
      {/* Ranura ojos */}
      <rect x="20" y="35" width="24" height="3" rx="1" fill={C.stn} />
      {/* Cresta */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 8px' }}>
        <path d="M26 12 Q28 2 32 4 Q36 2 38 12" fill={C.red} stroke="#7f1d1d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M28 10 Q30 4 32 6 Q34 4 36 10" fill={X.fire2} opacity="0.7" />
      </g>
      {/* Corona */}
      <path d="M18 46 L22 42 L28 48 L32 42 L36 48 L42 42 L46 46 L44 54 L20 54 Z" fill={C.amb} stroke={X.gold2} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="32" cy="50" r="2" fill={X.gold1} />
    </>
  ),

  // ═══════════════════════ TEACHER: MENSAJES ═══════════════════════
  teacher_first_message: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sl2} /><stop offset="1" stopColor={C.sl4} />
        </linearGradient>
      </defs>
      {/* Bocadillo simple */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '30px 28px' }}>
        <path d="M8 12 Q8 6 14 6 L50 6 Q56 6 56 12 L56 36 Q56 42 50 42 L22 42 L12 54 L14 42 Q8 42 8 36 Z"
              fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="18" y1="18" x2="44" y2="18" stroke={C.sl6} strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="26" x2="38" y2="26" stroke={C.sl6} strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="34" x2="30" y2="34" stroke={C.sl6} strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  ),
  teacher_messages_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sky} /><stop offset="1" stopColor={C.blu} />
        </linearGradient>
      </defs>
      {/* Bocadillo con corazon */}
      <path d="M8 12 Q8 6 14 6 L50 6 Q56 6 56 12 L56 36 Q56 42 50 42 L22 42 L12 54 L14 42 Q8 42 8 36 Z"
            fill={`url(#${id}bg)`} stroke={C.nav} strokeWidth="2.5" strokeLinejoin="round" />
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 24px' }}>
        <path d="M32 32 Q26 20 20 24 Q14 28 20 34 L32 44 L44 34 Q50 28 44 24 Q38 20 32 32 Z"
              fill={C.pin} stroke="#9d174d" strokeWidth="1.5" transform="translate(0,-8) scale(0.7)" style={{ transformOrigin: '32px 28px' }} />
      </g>
    </>
  ),
  teacher_messages_25: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.pur} /><stop offset="1" stopColor={C.ind} />
        </linearGradient>
      </defs>
      {/* Dos bocadillos superpuestos */}
      <path d="M6 16 Q6 10 12 10 L40 10 Q46 10 46 16 L46 32 Q46 38 40 38 L18 38 L10 48 L12 38 Q6 38 6 32 Z"
            fill={C.ind} stroke={C.nav} strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
      <g className="ba-anim anim-bob" style={{ transformOrigin: '38px 30px' }}>
        <path d="M18 20 Q18 14 24 14 L52 14 Q58 14 58 20 L58 38 Q58 44 52 44 L30 44 L22 54 L24 44 Q18 44 18 38 Z"
              fill={`url(#${id}bg)`} stroke={C.nav} strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="26" y1="24" x2="48" y2="24" stroke={C.whi} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <line x1="26" y1="32" x2="42" y2="32" stroke={C.whi} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>
    </>
  ),
  teacher_messages_50: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.pur1} /><stop offset="1" stopColor={X.pur2} />
        </linearGradient>
      </defs>
      {/* Bocadillo con estrella */}
      <path d="M8 12 Q8 6 14 6 L50 6 Q56 6 56 12 L56 36 Q56 42 50 42 L22 42 L12 54 L14 42 Q8 42 8 36 Z"
            fill={`url(#${id}bg)`} stroke={X.pur2} strokeWidth="2.5" strokeLinejoin="round" />
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 24px' }}>
        <path d="M32 10 L35 20 L46 21 L38 27 L40 38 L32 33 L24 38 L26 27 L18 21 L29 20 Z"
              fill={C.amb} stroke={C.gld} strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="28" cy="18" rx="1.5" ry="3" fill={C.whi} opacity="0.4" />
      </g>
    </>
  ),
  teacher_messages_100: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor={X.fire1} stopOpacity="0.4" /><stop offset="1" stopColor={X.fire1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}gl)`} />
      {/* Megafono dorado */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 32px' }}>
        <path d="M10 26 L10 38 L18 38 L18 26 Z" fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2" strokeLinejoin="round" />
        <path d="M18 22 L50 10 L50 54 L18 42 Z" fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="50" cy="32" rx="4" ry="14" fill={X.gold2} stroke="#78350f" strokeWidth="1.5" />
      </g>
      {/* Ondas de sonido */}
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '54px 32px' }}>
        <path d="M56 22 Q62 32 56 42" fill="none" stroke={X.gold1} strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="ba-anim anim-ring-expand" style={{ transformOrigin: '54px 32px', animationDelay: '0.6s' }}>
        <path d="M58 18 Q66 32 58 46" fill="none" stroke={X.gold1} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </>
  ),

  // ═══════════════════════ TEACHER: PLATAFORMA (DIAS) ═══════════════════════
  teacher_days_7: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sl2} /><stop offset="1" stopColor={C.sl4} />
        </linearGradient>
      </defs>
      {/* Calendario */}
      <rect x="8" y="14" width="48" height="42" rx="4" fill={`url(#${id}bg)`} stroke={C.sl6} strokeWidth="2.5" />
      <rect x="8" y="14" width="48" height="12" rx="4" fill={C.red} stroke={C.sl6} strokeWidth="2.5" />
      {/* Anillas */}
      <line x1="22" y1="10" x2="22" y2="18" stroke={C.sl6} strokeWidth="3" strokeLinecap="round" />
      <line x1="42" y1="10" x2="42" y2="18" stroke={C.sl6} strokeWidth="3" strokeLinecap="round" />
      {/* Check */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 40px' }}>
        <polyline points="22,40 28,46 42,32" fill="none" stroke={C.grn} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  ),
  teacher_days_30: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.bronze1} /><stop offset="1" stopColor={X.bronze2} />
        </linearGradient>
      </defs>
      {/* Calendario bronce */}
      <rect x="8" y="14" width="48" height="42" rx="4" fill={`url(#${id}bg)`} stroke={X.bronze2} strokeWidth="2.5" />
      <rect x="8" y="14" width="48" height="12" rx="4" fill={X.bronze2} stroke="#78350f" strokeWidth="2.5" />
      <line x1="22" y1="10" x2="22" y2="18" stroke={X.bronze2} strokeWidth="3" strokeLinecap="round" />
      <line x1="42" y1="10" x2="42" y2="18" stroke={X.bronze2} strokeWidth="3" strokeLinecap="round" />
      {/* Corona bronce */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 42px' }}>
        <path d="M20 46 L24 34 L28 42 L32 32 L36 42 L40 34 L44 46 Z" fill={X.bronze1} stroke={X.bronze2} strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="20" y="46" width="24" height="5" rx="1" fill={X.bronze1} stroke={X.bronze2} strokeWidth="1" />
      </g>
    </>
  ),
  teacher_days_90: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.pur1} /><stop offset="1" stopColor={C.pur} />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.5">
          <stop offset="0" stopColor={C.mag} stopOpacity="0.3" /><stop offset="1" stopColor={C.mag} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill={`url(#${id}gl)`} />
      {/* Reloj */}
      <circle cx="32" cy="32" r="22" fill={`url(#${id}bg)`} stroke={X.pur2} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="18" fill={C.whi} stroke={X.pur2} strokeWidth="1.5" />
      {/* Marcas */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const a = (deg * Math.PI) / 180; return <line key={i} x1={32 + Math.sin(a) * 15} y1={32 - Math.cos(a) * 15} x2={32 + Math.sin(a) * 17} y2={32 - Math.cos(a) * 17} stroke={X.pur2} strokeWidth="1.5" strokeLinecap="round" />;
      })}
      {/* Manecillas */}
      <line x1="32" y1="32" x2="32" y2="20" stroke={X.pur2} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="32" x2="42" y2="32" stroke={C.mag} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2" fill={X.pur2} />
      {/* Aura */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <circle cx="32" cy="32" r="25" fill="none" stroke={C.mag} strokeWidth="1.5" opacity="0.4" />
      </g>
    </>
  ),
  teacher_days_365: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
        <radialGradient id={`${id}gl`} cx="0.5" cy="0.4">
          <stop offset="0" stopColor={X.fire1} stopOpacity="0.5" /><stop offset="1" stopColor={X.fire1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}gl)`} />
      {/* Trofeo dorado */}
      <path d="M20 18 L20 34 Q20 46 32 48 Q44 46 44 34 L44 18 Z" fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Asas */}
      <path d="M20 22 Q10 22 10 30 Q10 38 20 36" fill="none" stroke={X.gold2} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 22 Q54 22 54 30 Q54 38 44 36" fill="none" stroke={X.gold2} strokeWidth="2.5" strokeLinecap="round" />
      {/* Base */}
      <rect x="26" y="48" width="12" height="4" rx="1" fill={X.gold2} stroke="#78350f" strokeWidth="1" />
      <rect x="22" y="52" width="20" height="5" rx="2" fill={X.gold2} stroke="#78350f" strokeWidth="1.5" />
      {/* 365 */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <text x="32" y="36" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350f">365</text>
      </g>
      {/* Rayos giratorios */}
      <g className="ba-anim anim-spin" style={{ transformOrigin: '32px 32px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45 * Math.PI) / 180; return <line key={i} x1={32 + Math.sin(a) * 28} y1={32 - Math.cos(a) * 28} x2={32 + Math.sin(a) * 31} y2={32 - Math.cos(a) * 31} stroke={X.gold1} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />;
        })}
      </g>
    </>
  ),

  // ═══════════════════════ TEACHER: RATINGS ═══════════════════════
  teacher_first_rating: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.yel} /><stop offset="1" stopColor={C.amb} />
        </linearGradient>
      </defs>
      {/* Estrella simple */}
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '32px 32px' }}>
        <path d="M32 6 L38 22 L56 24 L43 35 L46 54 L32 46 L18 54 L21 35 L8 24 L26 22 Z"
              fill={`url(#${id}bg)`} stroke={C.gld} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="24" cy="20" rx="2.5" ry="5" fill={C.whi} opacity="0.4" />
      </g>
    </>
  ),
  teacher_ratings_10: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={X.gold1} /><stop offset="0.5" stopColor={C.amb} /><stop offset="1" stopColor={X.gold2} />
        </linearGradient>
      </defs>
      {/* 3 estrellas */}
      <g className="ba-anim anim-bob" style={{ transformOrigin: '32px 18px' }}>
        <path d="M32 2 L35 12 L46 13 L38 19 L40 30 L32 25 L24 30 L26 19 L18 13 L29 12 Z"
              fill={`url(#${id}bg)`} stroke={X.gold2} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="27" cy="10" rx="2" ry="4" fill={C.whi} opacity="0.4" />
      </g>
      <path d="M14 30 L17 38 L26 39 L20 43 L22 52 L14 48 L6 52 L8 43 L2 39 L11 38 Z"
            fill={C.amb} stroke={C.gld} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 30 L53 38 L62 39 L56 43 L58 52 L50 48 L42 52 L44 43 L38 39 L47 38 Z"
            fill={C.amb} stroke={C.gld} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Brillos */}
      <g className="ba-anim anim-twinkle">
        <circle cx="8" cy="20" r="1.5" fill={X.gold1} />
        <circle cx="56" cy="20" r="1.5" fill={X.gold1} />
        <circle cx="32" cy="56" r="1" fill={C.amb} />
      </g>
    </>
  ),
};

// ─── Halo de fondo por rareza ───
const RARITY = {
  common:    { from: '#f1f5f9', to: '#e2e8f0', ring: 'rgba(100,116,139,0.35)' },
  rare:      { from: '#dbeafe', to: '#bfdbfe', ring: 'rgba(59,130,246,0.5)' },
  epic:      { from: '#ede9fe', to: '#e9d5ff', ring: 'rgba(139,92,246,0.55)' },
  legendary: { from: '#fef3c7', to: '#fde68a', ring: 'rgba(245,158,11,0.6)' },
};

/**
 * BadgeIcon — render una insignia multicolor animada por code.
 *
 * Props:
 *  - code:   badge code (ej: 'first_game')
 *  - rarity: 'common' | 'rare' | 'epic' | 'legendary'
 *  - size:   px (default 56)
 *  - earned: bool (default true). false → grayscale + sin animaciones
 */
function BadgeIcon({ code, rarity = 'common', size = 56, earned = true, animated = false }) {
  const reactId = React.useId();
  const idPrefix = `bi${reactId.replace(/[:]/g, '')}-`;
  const entry = SVGS[code];
  const svg = typeof entry === 'function' ? entry(idPrefix) : entry;
  const palette = RARITY[rarity] || RARITY.common;

  if (!entry) {
    return (
      <div
        style={{ width: size, height: size }}
        className="badge-icon-wrap"
      >?</div>
    );
  }

  return (
    <div
      className={`badge-icon-wrap ${earned ? '' : 'is-locked'} ${animated ? 'is-animated' : ''}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${palette.from}, ${palette.to})`,
        boxShadow: `inset 0 0 0 2px ${palette.ring}, 0 1px 3px rgba(0,0,0,0.08)`,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.78)}
        height={Math.round(size * 0.78)}
      >
        {svg}
      </svg>
    </div>
  );
}

export default React.memo(BadgeIcon);
export { SVGS as BADGE_SVGS };
