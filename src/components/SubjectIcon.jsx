import React, { useEffect } from 'react';

/* ── CSS ─────────────────────────────────────────────────────── */
let injected = false;
const injectStyles = () => {
  if (injected) return;
  injected = true;
  const css = `
    @keyframes si-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    @keyframes si-sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
    @keyframes si-pulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.18);opacity:1}}
    @keyframes si-blink{0%,45%{opacity:0.7}50%,95%{opacity:0}100%{opacity:0.7}}
    @keyframes si-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes si-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
    @keyframes si-shimmer{0%,100%{opacity:0.15}50%{opacity:0.5}}
    @keyframes si-rise{0%{transform:translateY(0);opacity:0.3}50%{opacity:0.5}100%{transform:translateY(-5px);opacity:0}}
    @keyframes si-wave{0%,100%{transform:skewY(0deg)}50%{transform:skewY(-1.5deg)}}
    @keyframes si-glow{0%,100%{opacity:0.4}50%{opacity:0.9}}
    @keyframes si-rock{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
    @keyframes si-dash{0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
    @keyframes si-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}

    .si-icon{animation:si-float 4.5s ease-in-out infinite}
    .si-icon-inner{transition:transform 0.55s cubic-bezier(0.34,1.56,0.64,1),filter 0.55s ease}
    .group:hover .si-icon-inner{transform:translateY(-3px) scale(1.12);filter:drop-shadow(0 4px 12px var(--si-glow,rgba(99,102,241,0.35)))}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
};

/* ── SVG Icons (48×48 viewBox) with subtle idle animations ──── */

/* Lengua – Libro abierto */
const Lengua = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-len" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    {/* Book shadow */}
    <path d="M25 12 Q15 10 5 14 L5 42 Q15 38 25 40 Q35 38 43 42 L43 14 Q35 10 25 12 Z" fill="rgba(0,0,0,0.05)" />
    {/* Left page – gentle flip */}
    <g style={{ transformOrigin: '24px 28px', animation: 'si-sway 5s ease-in-out infinite' }}>
      <path d="M24 10 Q14 8 4 12 L4 40 Q14 36 24 38 Z" fill="#EEF2FF" />
      <path d="M6 12 L6 38" stroke="rgba(99,102,241,0.06)" strokeWidth="1.5" />
      {/* Text lines */}
      {[18, 22, 26, 30, 34].map((y, i) => (
        <line key={`l${i}`} x1="9" y1={y} x2={20 - (i % 3)} y2={y}
          stroke="#6366F1" strokeWidth="0.6" style={{ animation: `si-shimmer 3.5s ease-in-out ${i * 0.3}s infinite` }} />
      ))}
    </g>
    {/* Right page */}
    <g style={{ transformOrigin: '24px 28px', animation: 'si-sway 5s ease-in-out infinite reverse' }}>
      <path d="M24 10 Q34 8 44 12 L44 40 Q34 36 24 38 Z" fill="white" />
      <path d="M42 12 L42 38" stroke="rgba(99,102,241,0.04)" strokeWidth="1.5" />
      {[18, 22, 26, 30, 34].map((y, i) => (
        <line key={`r${i}`} x1="28" y1={y} x2={39 - (i % 3)} y2={y}
          stroke="#6366F1" strokeWidth="0.6" style={{ animation: `si-shimmer 3.5s ease-in-out ${i * 0.3 + 0.5}s infinite` }} />
      ))}
    </g>
    {/* Spine */}
    <line x1="24" y1="10" x2="24" y2="38" stroke="#4F46E5" strokeWidth="1" opacity="0.15" />
    <path d="M23 10 Q24 24 23 38" stroke="rgba(0,0,0,0.06)" strokeWidth="2" fill="none" />
    {/* Back pages */}
    <path d="M24 11 Q15 9.5 5 13 L4 13 Q14 9 24 11" fill="rgba(200,200,220,0.4)" />
    <path d="M24 11 Q33 9.5 43 13 L44 13 Q34 9 24 11" fill="rgba(200,200,220,0.3)" />
    {/* Bookmark */}
    <path d="M32 10 L32 4 L35 7 L38 4 L38 12" stroke="#EF4444" strokeWidth="1.2" fill="#EF4444" opacity="0.55" />
    {/* Floating letter */}
    <text x="10" y="8" fill="#6366F1" fontSize="8" fontWeight="bold" opacity="0.5"
      style={{ animation: 'si-bob 3s ease-in-out infinite' }}>A</text>
    <text x="36" y="44" fill="#818CF8" fontSize="6" fontWeight="bold" opacity="0.35"
      style={{ animation: 'si-bob 3.5s ease-in-out 0.8s infinite' }}>α</text>
  </svg>
);

/* Matemáticas – Calculadora */
const Matematicas = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-mat" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    <rect x="8" y="4" width="32" height="40" rx="5" fill="url(#si-mat)" />
    <rect x="8" y="4" width="32" height="40" rx="5" fill="none" stroke="#1D4ED8" strokeWidth="0.5" opacity="0.3" />
    {/* Screen – subtle glow */}
    <rect x="12" y="8" width="24" height="10" rx="2.5" fill="#1E3A8A" opacity="0.4" />
    <rect x="12" y="8" width="24" height="10" rx="2.5" fill="none" stroke="#60A5FA" strokeWidth="0.3"
      style={{ animation: 'si-glow 3.5s ease-in-out infinite' }} />
    <text x="32" y="16" textAnchor="end" fill="#93C5FD" fontSize="8" fontWeight="bold" fontFamily="monospace">π</text>
    <rect x="13" y="9" width="10" height="3" rx="1" fill="rgba(255,255,255,0.08)" />
    {/* Blinking cursor on screen */}
    <rect x="15" y="13" width="1.2" height="4" rx="0.4" fill="#93C5FD"
      style={{ animation: 'si-blink 1.2s ease-in-out infinite' }} />
    {/* Buttons grid */}
    {[0, 1, 2].map(r => [0, 1, 2, 3].map(c => (
      <rect key={`${r}${c}`} x={13 + c * 6} y={22 + r * 6} width="4.5" height="4.5" rx="1.2"
        fill={c === 3 ? '#60A5FA' : 'rgba(255,255,255,0.15)'} />
    )))}
    <rect x="13" y="40" width="11" height="3" rx="1" fill="rgba(255,255,255,0.12)" />
    <rect x="26" y="40" width="9" height="3" rx="1" fill="#60A5FA" opacity="0.8" />
    <text x="15.5" y="26" fill="white" fontSize="3.5" fontWeight="bold" opacity="0.7">+</text>
    <text x="21.5" y="26" fill="white" fontSize="3.5" fontWeight="bold" opacity="0.7">−</text>
    <text x="27.5" y="26" fill="white" fontSize="3.5" fontWeight="bold" opacity="0.7">×</text>
  </svg>
);

/* Ciencias Naturales – Brote/planta */
const CienciasNaturales = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-cn1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="si-cn2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
    {/* Stem */}
    <path d="M24 42 C24 34 22 28 24 20" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M24 42 C24 36 23 30 24 22" stroke="#34D399" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    {/* Left leaf – sways in breeze */}
    <g style={{ transformOrigin: '24px 28px', animation: 'si-sway 4s ease-in-out infinite' }}>
      <path d="M24 28 C18 24 10 22 8 16 C14 16 22 20 24 28 Z" fill="url(#si-cn1)" />
      <path d="M24 28 C20 25 14 22 10 18" stroke="#059669" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M16 22 L14 19 M20 25 L17 22" stroke="#059669" strokeWidth="0.4" fill="none" opacity="0.25" />
    </g>
    {/* Right leaf – sways opposite */}
    <g style={{ transformOrigin: '24px 22px', animation: 'si-sway 4.5s ease-in-out 0.5s infinite reverse' }}>
      <path d="M24 22 C30 18 38 16 40 10 C34 10 26 16 24 22 Z" fill="url(#si-cn2)" />
      <path d="M24 22 C28 19 34 16 38 12" stroke="#059669" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M32 16 L34 13 M28 19 L31 16" stroke="#059669" strokeWidth="0.4" fill="none" opacity="0.25" />
    </g>
    {/* Top bud – breathes */}
    <g style={{ transformOrigin: '24px 16px', animation: 'si-breathe 3.5s ease-in-out infinite' }}>
      <ellipse cx="24" cy="16" rx="5" ry="7" fill="url(#si-cn2)" />
      <ellipse cx="23" cy="14" rx="2" ry="3.5" fill="rgba(255,255,255,0.2)" />
    </g>
    {/* Ground dots */}
    <circle cx="18" cy="44" r="1.5" fill="#D2B48C" opacity="0.3" />
    <circle cx="24" cy="45" r="2" fill="#D2B48C" opacity="0.25" />
    <circle cx="30" cy="44" r="1.5" fill="#D2B48C" opacity="0.3" />
    {/* Sparkle – shimmers */}
    <circle cx="36" cy="8" r="1" fill="#FCD34D" style={{ animation: 'si-glow 2.5s ease-in-out infinite' }} />
  </svg>
);

/* Ciencias Sociales – Globo terráqueo */
const CienciasSociales = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="si-cs" cx="0.4" cy="0.35" r="0.6">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="100%" stopColor="#0D9488" />
      </radialGradient>
    </defs>
    <circle cx="24" cy="22" r="17" fill="url(#si-cs)" />
    <circle cx="24" cy="22" r="17" fill="none" stroke="#0F766E" strokeWidth="0.5" opacity="0.3" />
    {/* Continents */}
    <path d="M16 12 C18 10 22 10 24 12 C26 14 28 12 30 14 L28 18 C26 20 22 18 20 20 L16 16 Z" fill="#065F46" opacity="0.35" />
    <path d="M12 22 C14 20 16 22 18 24 C16 28 14 26 12 24 Z" fill="#065F46" opacity="0.3" />
    <path d="M26 24 C28 22 32 24 34 26 C32 30 28 28 26 26 Z" fill="#065F46" opacity="0.3" />
    <path d="M20 28 C22 26 24 28 26 30 C24 34 22 32 20 30 Z" fill="#065F46" opacity="0.25" />
    {/* Meridians – slow spin */}
    <g style={{ transformOrigin: '24px 22px', animation: 'si-spin 30s linear infinite' }}>
      <ellipse cx="24" cy="22" rx="6" ry="17" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
      <ellipse cx="24" cy="22" rx="13" ry="17" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
    </g>
    <line x1="7" y1="22" x2="41" y2="22" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
    <line x1="10" y1="14" x2="38" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="10" y1="30" x2="38" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    {/* Highlight – breathes */}
    <circle cx="18" cy="14" r="5" fill="rgba(255,255,255,0.15)" style={{ transformOrigin: '18px 14px', animation: 'si-breathe 5s ease-in-out infinite' }} />
    {/* Base stand */}
    <path d="M20 40 L24 38 L28 40" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="38" x2="24" y2="42" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 42 L30 42" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* Tutoría – Dos personas / corazón */
const Tutoria = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-tut" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Person left */}
    <circle cx="16" cy="14" r="5" fill="url(#si-tut)" />
    <circle cx="14.5" cy="12.5" r="1.5" fill="rgba(255,255,255,0.2)" />
    <path d="M8 32 C8 24 12 20 16 20 C20 20 24 24 24 32" fill="#FBBF24" />
    <path d="M10 30 C10 25 13 22 16 22" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    {/* Person right */}
    <circle cx="32" cy="14" r="5" fill="#F59E0B" />
    <circle cx="30.5" cy="12.5" r="1.5" fill="rgba(255,255,255,0.2)" />
    <path d="M24 32 C24 24 28 20 32 20 C36 20 40 24 40 32" fill="#F59E0B" />
    <path d="M26 30 C26 25 29 22 32 22" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    {/* Heart – gentle pulse */}
    <g style={{ transformOrigin: '24px 30px', animation: 'si-pulse 2.5s ease-in-out infinite' }}>
      <path d="M24 28 C22 24 18 24 18 27 C18 30 24 34 24 34 C24 34 30 30 30 27 C30 24 26 24 24 28 Z" fill="#EF4444" opacity="0.7" />
      <path d="M22 26 C21 25 20 25 20 27" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
    </g>
    <path d="M6 32 L42 32" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
  </svg>
);

/* Valenciano – Naranja */
const Valenciano = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="si-val" cx="0.4" cy="0.38" r="0.55">
        <stop offset="0%" stopColor="#FDBA74" />
        <stop offset="60%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </radialGradient>
    </defs>
    <ellipse cx="25" cy="42" rx="12" ry="3" fill="rgba(0,0,0,0.08)" />
    <circle cx="24" cy="26" r="15" fill="url(#si-val)" />
    <circle cx="24" cy="26" r="15" fill="none" stroke="#C2410C" strokeWidth="0.5" opacity="0.2" />
    {/* Dimples */}
    <circle cx="18" cy="22" r="0.8" fill="rgba(255,255,255,0.15)" />
    <circle cx="28" cy="20" r="0.7" fill="rgba(255,255,255,0.12)" />
    <circle cx="22" cy="30" r="0.6" fill="rgba(255,255,255,0.1)" />
    <circle cx="30" cy="28" r="0.7" fill="rgba(255,255,255,0.1)" />
    <circle cx="16" cy="28" r="0.5" fill="rgba(255,255,255,0.08)" />
    {/* Highlight – shimmer sweep */}
    <circle cx="19" cy="19" r="5" fill="rgba(255,255,255,0.2)" style={{ animation: 'si-shimmer 4s ease-in-out infinite' }} />
    <circle cx="17" cy="17" r="2" fill="rgba(255,255,255,0.15)" />
    <circle cx="24" cy="38" r="2.5" fill="#C2410C" opacity="0.2" />
    <rect x="22.5" y="9" width="3" height="4" rx="1.5" fill="#65A30D" />
    {/* Leaf – gentle sway */}
    <g style={{ transformOrigin: '25px 11px', animation: 'si-sway 3.5s ease-in-out infinite' }}>
      <path d="M25 11 C28 8 34 6 36 4 C34 8 30 10 25 11 Z" fill="#4ADE80" />
      <path d="M25 11 C29 8 33 6 35 5" stroke="#22C55E" strokeWidth="0.4" fill="none" opacity="0.5" />
    </g>
    <path d="M25 10 C23 7 18 6 16 5 C19 8 22 10 25 10 Z" fill="#4ADE80" opacity="0.7" />
  </svg>
);

/* Inglés – Bandera UK */
const Ingles = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    {/* Flag – subtle wave */}
    <g style={{ transformOrigin: '4px 22px', animation: 'si-wave 4s ease-in-out infinite' }}>
      <rect x="4" y="8" width="40" height="28" rx="3" fill="#1E3A8A" />
      <line x1="4" y1="8" x2="44" y2="36" stroke="white" strokeWidth="4" />
      <line x1="44" y1="8" x2="4" y2="36" stroke="white" strokeWidth="4" />
      <line x1="4" y1="8" x2="44" y2="36" stroke="#DC2626" strokeWidth="1.5" />
      <line x1="44" y1="8" x2="4" y2="36" stroke="#DC2626" strokeWidth="1.5" />
      <rect x="20" y="8" width="8" height="28" fill="white" />
      <rect x="4" y="18" width="40" height="8" fill="white" />
      <rect x="22" y="8" width="4" height="28" fill="#DC2626" />
      <rect x="4" y="20" width="40" height="4" fill="#DC2626" />
      <rect x="4" y="8" width="40" height="28" rx="3" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
    </g>
    {/* Pole */}
    <line x1="4" y1="8" x2="4" y2="44" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Pole top – glows */}
    <circle cx="4" cy="7" r="1.5" fill="#CBD5E1" style={{ animation: 'si-glow 3s ease-in-out infinite' }} />
  </svg>
);

/* Francés – Bandera Francia */
const Frances = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    {/* Flag – subtle wave */}
    <g style={{ transformOrigin: '4px 22px', animation: 'si-wave 4.2s ease-in-out infinite' }}>
      <rect x="4" y="8" width="40" height="28" rx="3" fill="white" />
      <path d="M4 11 C4 9.34 5.34 8 7 8 L17.33 8 L17.33 36 L7 36 C5.34 36 4 34.66 4 33 Z" fill="#2563EB" />
      <path d="M30.67 8 L41 8 C42.66 8 44 9.34 44 11 L44 33 C44 34.66 42.66 36 41 36 L30.67 36 Z" fill="#DC2626" />
      <rect x="4" y="8" width="40" height="8" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="4" y="8" width="40" height="28" rx="3" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
    </g>
    {/* Pole */}
    <line x1="4" y1="8" x2="4" y2="44" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="4" cy="7" r="1.5" fill="#CBD5E1" style={{ animation: 'si-glow 3s ease-in-out 0.5s infinite' }} />
  </svg>
);

/* Programación – Terminal */
const Programacion = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-prog" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="40" height="36" rx="5" fill="#1E293B" />
    {/* Title bar */}
    <rect x="4" y="6" width="40" height="8" rx="5" fill="#334155" />
    <rect x="4" y="12" width="40" height="2" fill="#334155" />
    <circle cx="10" cy="10" r="1.5" fill="#EF4444" opacity="0.7" />
    <circle cx="15" cy="10" r="1.5" fill="#FBBF24" opacity="0.7" />
    <circle cx="20" cy="10" r="1.5" fill="#22C55E" opacity="0.7" />
    {/* Code lines */}
    <text x="9" y="23" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold">&lt;</text>
    <text x="14" y="23" fill="#A78BFA" fontSize="5" fontFamily="monospace">div</text>
    <text x="29" y="23" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold">&gt;</text>
    {/* Content line – animated dash draw */}
    <rect x="12" y="27" width="16" height="2" rx="1" fill="#4ADE80" opacity="0.4"
      style={{ transformOrigin: '12px 28px', animation: 'si-shimmer 3s ease-in-out infinite' }} />
    <text x="9" y="37" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold">&lt;/</text>
    <text x="19" y="37" fill="#A78BFA" fontSize="5" fontFamily="monospace">div</text>
    <text x="34" y="37" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold">&gt;</text>
    {/* Cursor – blinks */}
    <rect x="30" y="26" width="1.5" height="4" rx="0.5" fill="#06B6D4"
      style={{ animation: 'si-blink 1s ease-in-out infinite' }} />
  </svg>
);

/* Historia – Pergamino */
const Historia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-his" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="28" height="32" rx="2" fill="#FEF3C7" />
    <rect x="10" y="8" width="28" height="32" rx="2" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />
    <ellipse cx="24" cy="8" rx="16" ry="4" fill="url(#si-his)" />
    <ellipse cx="24" cy="8" rx="16" ry="4" fill="none" stroke="#B45309" strokeWidth="0.5" opacity="0.2" />
    <ellipse cx="24" cy="8" rx="14" ry="2.5" fill="rgba(255,255,255,0.15)" />
    <ellipse cx="24" cy="40" rx="16" ry="4" fill="url(#si-his)" />
    <ellipse cx="24" cy="40" rx="14" ry="2.5" fill="rgba(255,255,255,0.1)" />
    {/* Text lines – shimmer in sequence */}
    {[16, 20, 24, 28, 32].map((y, i) => (
      <line key={i} x1="16" y1={y} x2={34 - (i % 3) * 3} y2={y}
        stroke="#92400E" strokeWidth="0.7"
        style={{ animation: `si-shimmer 3s ease-in-out ${i * 0.4}s infinite` }} />
    ))}
    {/* Wax seal – pulses with glow */}
    <g style={{ transformOrigin: '34px 34px', animation: 'si-breathe 3.5s ease-in-out infinite' }}>
      <circle cx="34" cy="34" r="3.5" fill="#DC2626" opacity="0.6" />
      <circle cx="34" cy="34" r="2.2" fill="#EF4444" opacity="0.5" />
      <circle cx="34" cy="34" r="1" fill="rgba(255,255,255,0.2)" />
    </g>
  </svg>
);

/* Biología – ADN doble hélice */
const Biologia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-bio" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <path d="M16 4 C16 10 32 14 32 20 C32 26 16 30 16 36 C16 42 32 44 32 46"
      stroke="url(#si-bio)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M32 4 C32 10 16 14 16 20 C16 26 32 30 32 36 C32 42 16 44 16 46"
      stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Rungs */}
    <line x1="19" y1="7" x2="29" y2="7" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="17" y1="12" x2="31" y2="12" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="22" y1="17" x2="26" y2="17" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="17" y1="24" x2="31" y2="24" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="19" y1="29" x2="29" y2="29" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="22" y1="34" x2="26" y2="34" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="17" y1="39" x2="31" y2="39" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* Base pair dots – cascade pulse */}
    <circle cx="24" cy="7" r="1.5" fill="#10B981" style={{ transformOrigin: '24px 7px', animation: 'si-pulse 3s ease-in-out 0s infinite' }} />
    <circle cx="24" cy="17" r="1.5" fill="#34D399" style={{ transformOrigin: '24px 17px', animation: 'si-pulse 3s ease-in-out 0.6s infinite' }} />
    <circle cx="24" cy="29" r="1.5" fill="#10B981" style={{ transformOrigin: '24px 29px', animation: 'si-pulse 3s ease-in-out 1.2s infinite' }} />
    <circle cx="24" cy="39" r="1.5" fill="#34D399" style={{ transformOrigin: '24px 39px', animation: 'si-pulse 3s ease-in-out 1.8s infinite' }} />
  </svg>
);

/* Física y Química – Matraz */
const Fisica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-fis" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C084FC" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <path d="M18 18 L8 38 C6 42 9 44 14 44 L34 44 C39 44 42 42 40 38 L30 18 Z" fill="rgba(196,181,253,0.2)" />
    <path d="M18 18 L8 38 C6 42 9 44 14 44 L34 44 C39 44 42 42 40 38 L30 18 Z" fill="none" stroke="#7C3AED" strokeWidth="1.2" />
    {/* Liquid – gentle wave */}
    <g style={{ transformOrigin: '24px 38px', animation: 'si-sway 5s ease-in-out infinite' }}>
      <path d="M12 34 C16 32 20 35 24 33 C28 31 32 34 36 33 L40 38 C42 42 39 44 34 44 L14 44 C9 44 6 42 8 38 Z" fill="url(#si-fis)" opacity="0.7" />
      <path d="M14 36 C18 34 22 37 26 35 L24 38 C20 40 16 37 14 36 Z" fill="rgba(255,255,255,0.15)" />
    </g>
    <rect x="18" y="4" width="12" height="14" rx="2" fill="none" stroke="#7C3AED" strokeWidth="1.2" />
    <rect x="16" y="4" width="16" height="3" rx="1.5" fill="#A78BFA" opacity="0.5" />
    {/* Bubbles – rise up */}
    <circle cx="20" cy="38" r="2" fill="rgba(255,255,255,0.3)" style={{ animation: 'si-rise 3s ease-out infinite' }} />
    <circle cx="28" cy="36" r="1.5" fill="rgba(255,255,255,0.25)" style={{ animation: 'si-rise 3.5s ease-out 0.8s infinite' }} />
    <circle cx="24" cy="40" r="1.2" fill="rgba(255,255,255,0.2)" style={{ animation: 'si-rise 4s ease-out 1.5s infinite' }} />
    <circle cx="32" cy="39" r="1" fill="rgba(255,255,255,0.2)" style={{ animation: 'si-rise 3.2s ease-out 2s infinite' }} />
    {/* Steam – rises */}
    <path d="M22 3 C22 1 21 0 22 -1" stroke="#C4B5FD" strokeWidth="0.6" fill="none"
      style={{ animation: 'si-shimmer 2.5s ease-in-out infinite' }} />
    <path d="M26 2 C26 0 25 -1 26 -2" stroke="#C4B5FD" strokeWidth="0.6" fill="none"
      style={{ animation: 'si-shimmer 2.5s ease-in-out 1s infinite' }} />
  </svg>
);

/* Música – Notas musicales */
const Musica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-mus" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    {/* Whole notes group – gentle rock */}
    <g style={{ transformOrigin: '26px 24px', animation: 'si-rock 3.5s ease-in-out infinite' }}>
      <ellipse cx="14" cy="34" rx="6" ry="5" fill="url(#si-mus)" transform="rotate(-15 14 34)" />
      <ellipse cx="12.5" cy="32.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" transform="rotate(-15 12.5 32.5)" />
      <ellipse cx="34" cy="30" rx="6" ry="5" fill="url(#si-mus)" transform="rotate(-15 34 30)" />
      <ellipse cx="32.5" cy="28.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" transform="rotate(-15 32.5 28.5)" />
      <line x1="19" y1="31" x2="19" y2="8" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="27" x2="39" y2="6" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 8 L39 6 L39 10 L19 12 Z" fill="#EC4899" />
      <path d="M19 14 L39 12 L39 16 L19 18 Z" fill="#F472B6" opacity="0.6" />
    </g>
    {/* Sparkles – staggered shimmer */}
    <circle cx="8" cy="14" r="1.5" fill="#FDE68A" style={{ animation: 'si-glow 2.5s ease-in-out infinite' }} />
    <circle cx="42" cy="18" r="1" fill="#FDE68A" style={{ animation: 'si-glow 2.5s ease-in-out 0.8s infinite' }} />
    <circle cx="6" cy="26" r="1" fill="#FBCFE8" style={{ animation: 'si-glow 3s ease-in-out 1.5s infinite' }} />
  </svg>
);

/* Educación Plástica – Pincel con arcoíris */
const Plastica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    {/* Color strokes – cascade shimmer */}
    <path d="M8 38 Q16 28 24 36" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 3s ease-in-out 0s infinite' }} />
    <path d="M12 34 Q20 24 28 32" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 3s ease-in-out 0.3s infinite' }} />
    <path d="M16 30 Q24 20 32 28" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 3s ease-in-out 0.6s infinite' }} />
    <path d="M20 26 Q28 16 36 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 3s ease-in-out 0.9s infinite' }} />
    <path d="M24 22 Q32 12 40 20" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 3s ease-in-out 1.2s infinite' }} />
    {/* Brush – gentle rocking */}
    <g transform="rotate(-35 30 14)" style={{ transformOrigin: '28px 15px', animation: 'si-sway 3s ease-in-out infinite' }}>
      <rect x="26" y="4" width="5" height="22" rx="2.5" fill="#92400E" />
      <rect x="27" y="5" width="2" height="18" rx="1" fill="#B45309" opacity="0.4" />
      <rect x="25.5" y="24" width="6" height="3" rx="1" fill="#9CA3AF" />
      <path d="M25 27 L28.5 35 L32 27 Z" fill="#8B5CF6" />
      <path d="M26 27 L28.5 33 L29 27 Z" fill="rgba(255,255,255,0.15)" />
    </g>
  </svg>
);

/* Tecnología – Engranaje */
const Tecnologia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-tec" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Gear – very slow spin */}
    <g style={{ transformOrigin: '24px 24px', animation: 'si-spin 20s linear infinite' }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(d => (
        <rect key={d} x="22" y="2" width="4" height="7" rx="1.5" fill="url(#si-tec)"
          transform={`rotate(${d} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="13" fill="url(#si-tec)" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
      <circle cx="24" cy="24" r="9" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <line x1="16" y1="24" x2="20" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      <line x1="28" y1="24" x2="32" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      <line x1="24" y1="16" x2="24" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      <line x1="24" y1="28" x2="24" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
    </g>
    {/* Center (static) */}
    <circle cx="24" cy="24" r="4" fill="#334155" />
    <circle cx="24" cy="24" r="2.5" fill="#1E293B" />
    <circle cx="23" cy="23" r="1" fill="rgba(255,255,255,0.15)" />
    <circle cx="20" cy="18" r="4" fill="rgba(255,255,255,0.06)" />
    {/* Circuit nodes – blink */}
    <path d="M38 14 L44 14 L44 20" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <path d="M38 34 L42 34 L42 40" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    <circle cx="44" cy="20" r="1.5" fill="#94A3B8" style={{ animation: 'si-glow 2.5s ease-in-out infinite' }} />
    <circle cx="42" cy="40" r="1.5" fill="#94A3B8" style={{ animation: 'si-glow 2.5s ease-in-out 1s infinite' }} />
  </svg>
);

/* Educación Física – Balón */
const EdFisica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="si-ef" cx="0.4" cy="0.35" r="0.6">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="60%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </radialGradient>
    </defs>
    {/* Shadow – breathes with ball */}
    <ellipse cx="24" cy="44" rx="12" ry="2.5" fill="rgba(0,0,0,0.08)"
      style={{ transformOrigin: '24px 44px', animation: 'si-breathe 2.5s ease-in-out infinite' }} />
    {/* Ball – subtle bounce */}
    <g style={{ transformOrigin: '24px 44px', animation: 'si-bob 2.5s ease-in-out infinite' }}>
      <circle cx="24" cy="24" r="17" fill="url(#si-ef)" />
      <path d="M24 7 C24 7 18 16 18 24 C18 32 24 41 24 41" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      <path d="M24 7 C24 7 30 16 30 24 C30 32 24 41 24 41" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      <path d="M8 20 C14 22 20 20 24 18 C28 20 34 22 40 20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <path d="M8 30 C14 28 20 30 24 32 C28 30 34 28 40 30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <circle cx="18" cy="16" r="5" fill="rgba(255,255,255,0.2)" />
      <circle cx="16" cy="14" r="2.5" fill="rgba(255,255,255,0.15)" />
    </g>
    {/* Motion lines – shimmer */}
    <line x1="42" y1="10" x2="46" y2="8" stroke="#FCA5A5" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <line x1="43" y1="14" x2="46" y2="13" stroke="#FCA5A5" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.3s infinite' }} />
    <line x1="42" y1="18" x2="45" y2="18" stroke="#FCA5A5" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.6s infinite' }} />
  </svg>
);

/* Robótica – Robot */
const Robotica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-rob" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
    </defs>
    {/* Antenna */}
    <line x1="24" y1="2" x2="24" y2="10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Antenna light – pulses */}
    <circle cx="24" cy="2" r="2.5" fill="#38BDF8" style={{ transformOrigin: '24px 2px', animation: 'si-pulse 2s ease-in-out infinite' }} />
    <circle cx="23.5" cy="1.5" r="1" fill="rgba(255,255,255,0.3)" />
    {/* Head */}
    <rect x="8" y="10" width="32" height="26" rx="6" fill="url(#si-rob)" />
    <rect x="8" y="10" width="32" height="26" rx="6" fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
    <rect x="12" y="14" width="24" height="18" rx="4" fill="#CBD5E1" opacity="0.3" />
    {/* Eyes – gentle glow pulse */}
    <circle cx="18" cy="22" r="4.5" fill="#1E293B" />
    <circle cx="30" cy="22" r="4.5" fill="#1E293B" />
    <circle cx="18" cy="22" r="3" fill="#38BDF8" style={{ animation: 'si-glow 3s ease-in-out infinite' }} />
    <circle cx="30" cy="22" r="3" fill="#38BDF8" style={{ animation: 'si-glow 3s ease-in-out 0.3s infinite' }} />
    <circle cx="17" cy="21" r="1.2" fill="rgba(255,255,255,0.5)" />
    <circle cx="29" cy="21" r="1.2" fill="rgba(255,255,255,0.5)" />
    {/* Mouth – LEDs blink in sequence */}
    <rect x="18" y="29" width="12" height="2.5" rx="1.25" fill="#475569" />
    <rect x="20" y="29.5" width="2" height="1.5" rx="0.5" fill="#38BDF8"
      style={{ animation: 'si-glow 2s ease-in-out 0s infinite' }} />
    <rect x="23" y="29.5" width="2" height="1.5" rx="0.5" fill="#38BDF8"
      style={{ animation: 'si-glow 2s ease-in-out 0.4s infinite' }} />
    <rect x="26" y="29.5" width="2" height="1.5" rx="0.5" fill="#38BDF8"
      style={{ animation: 'si-glow 2s ease-in-out 0.8s infinite' }} />
    {/* Ears */}
    <rect x="4" y="18" width="5" height="10" rx="2.5" fill="#64748B" />
    <rect x="39" y="18" width="5" height="10" rx="2.5" fill="#64748B" />
    <circle cx="12" cy="12" r="1" fill="#475569" opacity="0.4" />
    <circle cx="36" cy="12" r="1" fill="#475569" opacity="0.4" />
  </svg>
);

/* Inteligencia Artificial – Cerebro anatómico con circuitos */
const IA = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-ia" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="si-ia2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#A78BFA" />
      </linearGradient>
    </defs>
    {/* Brain – breathe */}
    <g style={{ transformOrigin: '24px 24px', animation: 'si-breathe 4s ease-in-out infinite' }}>
      {/* Left hemisphere */}
      <path d="M24 42 L24 8 C18 6 12 8 9 12 C6 16 4 20 5 25 C4 26 3 28 4 31 C5 34 7 36 9 37 C11 40 15 42 20 43 Z"
        fill="url(#si-ia)" opacity="0.9" />
      {/* Right hemisphere (lighter) */}
      <path d="M24 42 L24 8 C30 6 36 8 39 12 C42 16 44 20 43 25 C44 26 45 28 44 31 C43 34 41 36 39 37 C37 40 33 42 28 43 Z"
        fill="url(#si-ia2)" opacity="0.85" />
      {/* Central fissure */}
      <path d="M24 8 L24 42" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      {/* Left hemisphere folds (sulci) */}
      <path d="M8 18 C12 16 16 18 20 16 Q22 15 24 16" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M6 25 C10 23 14 26 18 24 Q21 23 24 24" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M8 32 C12 30 16 33 20 31 Q22 30 24 31" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M12 12 C14 14 18 12 22 13" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Right hemisphere folds */}
      <path d="M24 16 Q26 15 28 16 C32 18 36 16 40 18" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M24 24 Q27 23 30 24 C34 26 38 23 42 25" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M24 31 Q26 30 28 31 C32 33 36 30 40 32" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M26 13 C30 12 34 14 36 12" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Brain stem */}
      <path d="M22 42 Q24 46 26 42" stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.5" />
    </g>
    {/* Circuit nodes – cascade pulse */}
    <circle cx="14" cy="20" r="1.8" fill="rgba(255,255,255,0.55)" style={{ transformOrigin: '14px 20px', animation: 'si-pulse 3s ease-in-out 0s infinite' }} />
    <circle cx="34" cy="20" r="1.8" fill="rgba(255,255,255,0.55)" style={{ transformOrigin: '34px 20px', animation: 'si-pulse 3s ease-in-out 0.6s infinite' }} />
    <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.6)" style={{ transformOrigin: '24px 24px', animation: 'si-pulse 3s ease-in-out 1.2s infinite' }} />
    <circle cx="16" cy="32" r="1.5" fill="rgba(255,255,255,0.4)" style={{ transformOrigin: '16px 32px', animation: 'si-pulse 3s ease-in-out 1.8s infinite' }} />
    <circle cx="32" cy="32" r="1.5" fill="rgba(255,255,255,0.4)" style={{ transformOrigin: '32px 32px', animation: 'si-pulse 3s ease-in-out 2.4s infinite' }} />
    {/* Node connections – shimmer */}
    <line x1="14" y1="20" x2="24" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
      style={{ animation: 'si-shimmer 3s ease-in-out 0s infinite' }} />
    <line x1="34" y1="20" x2="24" y2="24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
      style={{ animation: 'si-shimmer 3s ease-in-out 0.6s infinite' }} />
    <line x1="24" y1="24" x2="16" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"
      style={{ animation: 'si-shimmer 3s ease-in-out 1.2s infinite' }} />
    <line x1="24" y1="24" x2="32" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"
      style={{ animation: 'si-shimmer 3s ease-in-out 1.8s infinite' }} />
    {/* Sparkles */}
    <circle cx="4" cy="10" r="1.2" fill="#DDD6FE" style={{ animation: 'si-glow 2.5s ease-in-out infinite' }} />
    <circle cx="44" cy="10" r="1" fill="#DDD6FE" style={{ animation: 'si-glow 2.5s ease-in-out 1s infinite' }} />
  </svg>
);

/* Latín – Columna romana */
const Latin = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-lat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#CA8A04" />
      </linearGradient>
    </defs>
    <rect x="8" y="4" width="32" height="4" rx="1" fill="url(#si-lat)" />
    <rect x="10" y="7" width="28" height="3" rx="1" fill="#D97706" opacity="0.5" />
    <path d="M10 7 C8 7 6 8 6 10" stroke="#CA8A04" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M38 7 C40 7 42 8 42 10" stroke="#CA8A04" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <rect x="16" y="10" width="16" height="28" fill="#FEF3C7" />
    <rect x="16" y="10" width="16" height="28" fill="none" stroke="#CA8A04" strokeWidth="0.5" opacity="0.2" />
    {/* Fluting – shimmer */}
    <line x1="20" y1="11" x2="20" y2="37" stroke="#D97706" strokeWidth="0.4"
      style={{ animation: 'si-shimmer 4s ease-in-out 0s infinite' }} />
    <line x1="24" y1="11" x2="24" y2="37" stroke="#D97706" strokeWidth="0.4"
      style={{ animation: 'si-shimmer 4s ease-in-out 0.5s infinite' }} />
    <line x1="28" y1="11" x2="28" y2="37" stroke="#D97706" strokeWidth="0.4"
      style={{ animation: 'si-shimmer 4s ease-in-out 1s infinite' }} />
    {/* Highlight – traveling shimmer */}
    <rect x="17" y="11" width="4" height="26" fill="rgba(255,255,255,0.1)"
      style={{ animation: 'si-shimmer 3.5s ease-in-out infinite' }} />
    <rect x="14" y="38" width="20" height="3" rx="1" fill="#D97706" opacity="0.5" />
    <rect x="10" y="40" width="28" height="4" rx="1" fill="url(#si-lat)" />
    <text x="24" y="27" textAnchor="middle" fill="#92400E" fontSize="5" fontWeight="bold" fontFamily="serif" opacity="0.25">SPQR</text>
  </svg>
);

/* Economía – Gráfico */
const Economia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-eco" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
    <line x1="8" y1="6" x2="8" y2="40" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="8" y1="40" x2="44" y2="40" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
    {[14, 22, 30].map(y => (
      <line key={y} x1="8" y1={y} x2="44" y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
    ))}
    {/* Bars – staggered breathe */}
    {[
      { x: 12, h: 10, color: '#BBF7D0', delay: 0 },
      { x: 19, h: 16, color: '#86EFAC', delay: 0.3 },
      { x: 26, h: 12, color: '#4ADE80', delay: 0.6 },
      { x: 33, h: 24, color: '#22C55E', delay: 0.9 },
    ].map(({ x, h, color, delay }) => (
      <g key={x} style={{ transformOrigin: `${x + 2.5}px 40px`, animation: `si-breathe 3.5s ease-in-out ${delay}s infinite` }}>
        <rect x={x} y={40 - h} width="5" height={h} rx="1.5" fill={color} />
        <rect x={x} y={40 - h} width="2" height={h} rx="1" fill="rgba(255,255,255,0.15)" />
      </g>
    ))}
    {/* Trend line – drawn effect */}
    <path d="M14 32 L21 26 L28 30 L35 18" stroke="url(#si-eco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
      strokeDasharray="40" style={{ animation: 'si-dash 4s ease-in-out infinite' }} />
    {/* Arrow tip – pulses */}
    <g style={{ transformOrigin: '35px 18px', animation: 'si-pulse 3s ease-in-out infinite' }}>
      <path d="M33 16 L35 18 L37 15" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
    {/* Arrow up */}
    <g style={{ animation: 'si-bob 2.5s ease-in-out infinite' }}>
      <path d="M40 8 L42 4 L44 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="42" y1="4" x2="42" y2="14" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

/* ── Icon map ───────────────────────────────────────────────── */
const iconMap = {
  'lengua':             { Component: Lengua, glow: 'rgba(99,102,241,0.35)' },
  'matematicas':        { Component: Matematicas, glow: 'rgba(59,130,246,0.35)' },
  'ciencias-naturales': { Component: CienciasNaturales, glow: 'rgba(16,185,129,0.35)' },
  'ciencias-sociales':  { Component: CienciasSociales, glow: 'rgba(20,184,166,0.35)' },
  'tutoria':            { Component: Tutoria, glow: 'rgba(245,158,11,0.35)' },
  'valenciano':         { Component: Valenciano, glow: 'rgba(249,115,22,0.35)' },
  'ingles':             { Component: Ingles, glow: 'rgba(37,99,235,0.35)' },
  'frances':            { Component: Frances, glow: 'rgba(37,99,235,0.35)' },
  'programacion':       { Component: Programacion, glow: 'rgba(6,182,212,0.35)' },
  'historia':           { Component: Historia, glow: 'rgba(217,119,6,0.35)' },
  'biologia':           { Component: Biologia, glow: 'rgba(16,185,129,0.35)' },
  'fisica':             { Component: Fisica, glow: 'rgba(139,92,246,0.35)' },
  'musica':             { Component: Musica, glow: 'rgba(236,72,153,0.35)' },
  'plastica':           { Component: Plastica, glow: 'rgba(168,85,247,0.35)' },
  'tecnologia':         { Component: Tecnologia, glow: 'rgba(100,116,139,0.35)' },
  'ed-fisica':          { Component: EdFisica, glow: 'rgba(239,68,68,0.35)' },
  'robotica':           { Component: Robotica, glow: 'rgba(56,189,248,0.35)' },
  'ia':                 { Component: IA, glow: 'rgba(124,58,237,0.35)' },
  'latin':              { Component: Latin, glow: 'rgba(202,138,4,0.35)' },
  'economia':           { Component: Economia, glow: 'rgba(5,150,105,0.35)' },
};

const SubjectIcon = ({ subjectId, className = '' }) => {
  useEffect(() => { injectStyles(); }, []);

  const entry = iconMap[subjectId];
  if (!entry) return null;

  const { Component, glow } = entry;

  return (
    <div className={`si-icon shrink-0 ${className}`} style={{ width: 58, height: 58, margin: '-5px 0' }}>
      <div className="si-icon-inner w-full h-full" style={{ '--si-glow': glow }}>
        <Component />
      </div>
    </div>
  );
};

export default SubjectIcon;
