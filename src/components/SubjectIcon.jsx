import React, { useEffect } from 'react';

/* ── CSS ─────────────────────────────────────────────────────── */
let injected = false;
const injectStyles = () => {
  if (injected) return;
  injected = true;
  const css = `
    @keyframes si-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes si-sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
    @keyframes si-pulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.2);opacity:1}}
    @keyframes si-blink{0%,45%{opacity:0.8}50%,90%{opacity:0}95%,100%{opacity:0.8}}
    @keyframes si-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes si-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes si-shimmer{0%,100%{opacity:0.1}50%{opacity:0.6}}
    @keyframes si-rise{0%{transform:translateY(0);opacity:0.5}100%{transform:translateY(-8px);opacity:0}}
    @keyframes si-wave{0%,100%{transform:skewY(0deg) scaleX(1)}25%{transform:skewY(-2deg) scaleX(1.02)}75%{transform:skewY(2deg) scaleX(0.98)}}
    @keyframes si-glow{0%,100%{opacity:0.3}50%{opacity:1}}
    @keyframes si-rock{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    @keyframes si-dash{0%{stroke-dashoffset:50}100%{stroke-dashoffset:0}}
    @keyframes si-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
    @keyframes si-flip{0%,100%{transform:rotateY(0deg)}50%{transform:rotateY(15deg)}}
    @keyframes si-bounce{0%,100%{transform:translateY(0) scaleY(1)}30%{transform:translateY(-6px) scaleY(1.05)}60%{transform:translateY(-1px) scaleY(0.97)}}
    @keyframes si-orbit{0%{transform:rotate(0deg) translateX(5px) rotate(0deg)}100%{transform:rotate(360deg) translateX(5px) rotate(-360deg)}}
    @keyframes si-typewriter{0%{width:0}50%{width:100%}50.1%{width:0}}
    @keyframes si-swing{0%,100%{transform:rotate(0deg)}25%{transform:rotate(8deg)}75%{transform:rotate(-8deg)}}
    @keyframes si-morph{0%,100%{border-radius:50%}25%{border-radius:40% 60% 60% 40%}50%{border-radius:60% 40% 40% 60%}75%{border-radius:40% 60% 50% 50%}}
    @keyframes si-scan{0%{transform:translateY(-100%);opacity:0}20%{opacity:0.6}80%{opacity:0.6}100%{transform:translateY(100%);opacity:0}}
    @keyframes si-ripple{0%{r:0;opacity:0.8}100%{r:12;opacity:0}}
    @keyframes si-draw{0%{stroke-dashoffset:80}100%{stroke-dashoffset:0}}
    @keyframes si-flicker{0%,100%{opacity:1}10%{opacity:0.4}20%{opacity:1}40%{opacity:0.6}50%{opacity:1}}
    @keyframes si-spiral{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.1)}100%{transform:rotate(360deg) scale(1)}}
    @keyframes si-wiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-1.5px)}75%{transform:translateX(1.5px)}}

    .si-icon{animation:si-float 4s ease-in-out infinite}
    .si-icon-inner{transition:transform 0.55s cubic-bezier(0.34,1.56,0.64,1),filter 0.55s ease}
    .group:hover .si-icon-inner{transform:translateY(-3px) scale(1.12);filter:drop-shadow(0 4px 12px var(--si-glow,rgba(99,102,241,0.35)))}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
};

/* ── SVG Icons (48×48 viewBox) with striking idle animations ── */

/* Lengua – Libro abierto con páginas que se pasan */
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
    {/* Left page – flipping animation */}
    <g style={{ transformOrigin: '24px 28px', animation: 'si-flip 5s ease-in-out infinite', perspective: '100px' }}>
      <path d="M24 10 Q14 8 4 12 L4 40 Q14 36 24 38 Z" fill="#EEF2FF" />
      <path d="M6 12 L6 38" stroke="rgba(99,102,241,0.06)" strokeWidth="1.5" />
      {[18, 22, 26, 30, 34].map((y, i) => (
        <line key={`l${i}`} x1="9" y1={y} x2={20 - (i % 3)} y2={y}
          stroke="#6366F1" strokeWidth="0.6" style={{ animation: `si-shimmer 2.5s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </g>
    {/* Right page */}
    <g style={{ transformOrigin: '24px 28px', animation: 'si-flip 5s ease-in-out infinite reverse' }}>
      <path d="M24 10 Q34 8 44 12 L44 40 Q34 36 24 38 Z" fill="white" />
      <path d="M42 12 L42 38" stroke="rgba(99,102,241,0.04)" strokeWidth="1.5" />
      {[18, 22, 26, 30, 34].map((y, i) => (
        <line key={`r${i}`} x1="28" y1={y} x2={39 - (i % 3)} y2={y}
          stroke="#6366F1" strokeWidth="0.6" style={{ animation: `si-shimmer 2.5s ease-in-out ${i * 0.2 + 0.4}s infinite` }} />
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
    {/* Flying letters with different trajectories */}
    <text x="10" y="8" fill="#6366F1" fontSize="7" fontWeight="bold" opacity="0.6"
      style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }}>A</text>
    <text x="36" y="6" fill="#818CF8" fontSize="5" fontWeight="bold" opacity="0.45"
      style={{ animation: 'si-bounce 3s ease-in-out 0.5s infinite' }}>b</text>
    <text x="38" y="44" fill="#A78BFA" fontSize="6" fontWeight="bold" opacity="0.35"
      style={{ animation: 'si-bounce 3.5s ease-in-out 1s infinite' }}>c</text>
  </svg>
);

/* Matemáticas – Calculadora con pantalla viva */
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
    {/* Screen – pulsing glow border */}
    <rect x="12" y="8" width="24" height="10" rx="2.5" fill="#1E3A8A" opacity="0.4" />
    <rect x="12" y="8" width="24" height="10" rx="2.5" fill="none" stroke="#60A5FA" strokeWidth="0.5"
      style={{ animation: 'si-flicker 4s ease-in-out infinite' }} />
    {/* Scanning line across screen */}
    <rect x="12" y="8" width="24" height="2" rx="1" fill="rgba(96,165,250,0.15)"
      style={{ animation: 'si-scan 3s linear infinite' }} />
    <text x="32" y="16" textAnchor="end" fill="#93C5FD" fontSize="8" fontWeight="bold" fontFamily="monospace"
      style={{ animation: 'si-breathe 3s ease-in-out infinite', transformOrigin: '28px 14px' }}>π</text>
    {/* Blinking cursor */}
    <rect x="15" y="13" width="1.2" height="4" rx="0.4" fill="#93C5FD"
      style={{ animation: 'si-blink 1s ease-in-out infinite' }} />
    {/* Buttons grid – ripple effect staggered */}
    {[0, 1, 2].map(r => [0, 1, 2, 3].map(c => (
      <rect key={`${r}${c}`} x={13 + c * 6} y={22 + r * 6} width="4.5" height="4.5" rx="1.2"
        fill={c === 3 ? '#60A5FA' : 'rgba(255,255,255,0.15)'}
        style={{ animation: `si-glow 4s ease-in-out ${(r * 4 + c) * 0.25}s infinite` }} />
    )))}
    <rect x="13" y="40" width="11" height="3" rx="1" fill="rgba(255,255,255,0.12)" />
    <rect x="26" y="40" width="9" height="3" rx="1" fill="#60A5FA" opacity="0.8" />
    <text x="15.5" y="26" fill="white" fontSize="3.5" fontWeight="bold" opacity="0.7">+</text>
    <text x="21.5" y="26" fill="white" fontSize="3.5" fontWeight="bold" opacity="0.7">−</text>
    <text x="27.5" y="26" fill="white" fontSize="3.5" fontWeight="bold" opacity="0.7">×</text>
  </svg>
);

/* Ciencias Naturales – Brote creciendo */
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
    {/* Stem – drawing effect */}
    <path d="M24 42 C24 34 22 28 24 20" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 6s ease-in-out infinite' }} />
    <path d="M24 42 C24 36 23 30 24 22" stroke="#34D399" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
    {/* Left leaf – swinging like in breeze */}
    <g style={{ transformOrigin: '24px 28px', animation: 'si-swing 3s ease-in-out infinite' }}>
      <path d="M24 28 C18 24 10 22 8 16 C14 16 22 20 24 28 Z" fill="url(#si-cn1)" />
      <path d="M24 28 C20 25 14 22 10 18" stroke="#059669" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M16 22 L14 19 M20 25 L17 22" stroke="#059669" strokeWidth="0.4" fill="none" opacity="0.25" />
    </g>
    {/* Right leaf – opposite swing */}
    <g style={{ transformOrigin: '24px 22px', animation: 'si-swing 3.5s ease-in-out 0.3s infinite reverse' }}>
      <path d="M24 22 C30 18 38 16 40 10 C34 10 26 16 24 22 Z" fill="url(#si-cn2)" />
      <path d="M24 22 C28 19 34 16 38 12" stroke="#059669" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M32 16 L34 13 M28 19 L31 16" stroke="#059669" strokeWidth="0.4" fill="none" opacity="0.25" />
    </g>
    {/* Top bud – pulsing with life */}
    <g style={{ transformOrigin: '24px 16px', animation: 'si-breathe 2.5s ease-in-out infinite' }}>
      <ellipse cx="24" cy="16" rx="5" ry="7" fill="url(#si-cn2)" />
      <ellipse cx="23" cy="14" rx="2" ry="3.5" fill="rgba(255,255,255,0.2)" />
    </g>
    {/* Ground dots */}
    <circle cx="18" cy="44" r="1.5" fill="#D2B48C" opacity="0.3" />
    <circle cx="24" cy="45" r="2" fill="#D2B48C" opacity="0.25" />
    <circle cx="30" cy="44" r="1.5" fill="#D2B48C" opacity="0.3" />
    {/* Sparkles – orbiting the plant */}
    <circle cx="36" cy="8" r="1.2" fill="#FCD34D" style={{ transformOrigin: '24px 20px', animation: 'si-orbit 6s linear infinite' }} />
    <circle cx="12" cy="12" r="0.8" fill="#FCD34D" style={{ transformOrigin: '24px 20px', animation: 'si-orbit 8s linear 2s infinite reverse' }} />
  </svg>
);

/* Ciencias Sociales – Globo terráqueo girando */
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
    {/* Meridians – smooth spin */}
    <g style={{ transformOrigin: '24px 22px', animation: 'si-spin 12s linear infinite' }}>
      <ellipse cx="24" cy="22" rx="6" ry="17" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" />
      <ellipse cx="24" cy="22" rx="13" ry="17" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
    </g>
    <line x1="7" y1="22" x2="41" y2="22" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
    <line x1="10" y1="14" x2="38" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="10" y1="30" x2="38" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    {/* Traveling highlight – scans across globe */}
    <ellipse cx="18" cy="14" rx="5" ry="8" fill="rgba(255,255,255,0.12)"
      style={{ transformOrigin: '24px 22px', animation: 'si-spin 8s linear infinite' }} />
    {/* Pulsing ripple rings */}
    <circle cx="24" cy="22" r="0" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
      style={{ animation: 'si-ripple 3s ease-out infinite' }} />
    <circle cx="24" cy="22" r="0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
      style={{ animation: 'si-ripple 3s ease-out 1.5s infinite' }} />
    {/* Base stand */}
    <path d="M20 40 L24 38 L28 40" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="38" x2="24" y2="42" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 42 L30 42" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* Tutoría – Dos personas con corazón latiendo */
const Tutoria = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-tut" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Person left – gentle sway */}
    <g style={{ transformOrigin: '16px 32px', animation: 'si-sway 4s ease-in-out infinite' }}>
      <circle cx="16" cy="14" r="5" fill="url(#si-tut)" />
      <circle cx="14.5" cy="12.5" r="1.5" fill="rgba(255,255,255,0.2)" />
      <path d="M8 32 C8 24 12 20 16 20 C20 20 24 24 24 32" fill="#FBBF24" />
      <path d="M10 30 C10 25 13 22 16 22" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    </g>
    {/* Person right – opposite sway */}
    <g style={{ transformOrigin: '32px 32px', animation: 'si-sway 4s ease-in-out infinite reverse' }}>
      <circle cx="32" cy="14" r="5" fill="#F59E0B" />
      <circle cx="30.5" cy="12.5" r="1.5" fill="rgba(255,255,255,0.2)" />
      <path d="M24 32 C24 24 28 20 32 20 C36 20 40 24 40 32" fill="#F59E0B" />
      <path d="M26 30 C26 25 29 22 32 22" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    </g>
    {/* Heart – heartbeat animation (2-beat pattern) */}
    <g style={{ transformOrigin: '24px 30px', animation: 'si-bounce 1.8s ease-in-out infinite' }}>
      <path d="M24 28 C22 24 18 24 18 27 C18 30 24 34 24 34 C24 34 30 30 30 27 C30 24 26 24 24 28 Z" fill="#EF4444" opacity="0.75" />
      <path d="M22 26 C21 25 20 25 20 27" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
    </g>
    {/* Love ripples from heart */}
    <circle cx="24" cy="30" r="0" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="0.4"
      style={{ animation: 'si-ripple 2.5s ease-out infinite' }} />
    <path d="M6 32 L42 32" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
  </svg>
);

/* Valenciano – Naranja jugosa */
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
    {/* Orange body – gentle morphing wobble */}
    <circle cx="24" cy="26" r="15" fill="url(#si-val)" style={{ animation: 'si-morph 6s ease-in-out infinite' }} />
    <circle cx="24" cy="26" r="15" fill="none" stroke="#C2410C" strokeWidth="0.5" opacity="0.2" />
    {/* Dimples */}
    <circle cx="18" cy="22" r="0.8" fill="rgba(255,255,255,0.15)" />
    <circle cx="28" cy="20" r="0.7" fill="rgba(255,255,255,0.12)" />
    <circle cx="22" cy="30" r="0.6" fill="rgba(255,255,255,0.1)" />
    <circle cx="30" cy="28" r="0.7" fill="rgba(255,255,255,0.1)" />
    {/* Highlight – traveling shimmer */}
    <circle cx="19" cy="19" r="5" fill="rgba(255,255,255,0.2)" style={{ animation: 'si-shimmer 3s ease-in-out infinite' }} />
    <circle cx="17" cy="17" r="2" fill="rgba(255,255,255,0.15)" />
    <circle cx="24" cy="38" r="2.5" fill="#C2410C" opacity="0.2" />
    <rect x="22.5" y="9" width="3" height="4" rx="1.5" fill="#65A30D" />
    {/* Leaf – swinging in wind */}
    <g style={{ transformOrigin: '25px 11px', animation: 'si-swing 2.5s ease-in-out infinite' }}>
      <path d="M25 11 C28 8 34 6 36 4 C34 8 30 10 25 11 Z" fill="#4ADE80" />
      <path d="M25 11 C29 8 33 6 35 5" stroke="#22C55E" strokeWidth="0.4" fill="none" opacity="0.5" />
    </g>
    <path d="M25 10 C23 7 18 6 16 5 C19 8 22 10 25 10 Z" fill="#4ADE80" opacity="0.7" />
    {/* Juice drops floating */}
    <circle cx="36" cy="34" r="1.2" fill="#FDBA74" opacity="0.6"
      style={{ animation: 'si-rise 3s ease-out infinite' }} />
    <circle cx="10" cy="30" r="0.8" fill="#FDBA74" opacity="0.4"
      style={{ animation: 'si-rise 3.5s ease-out 1s infinite' }} />
  </svg>
);

/* Inglés – Bandera UK ondeando */
const Ingles = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    {/* Flag – dynamic wave */}
    <g style={{ transformOrigin: '4px 22px', animation: 'si-wave 2.5s ease-in-out infinite' }}>
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
    {/* Pole top – radiant pulse */}
    <circle cx="4" cy="7" r="1.8" fill="#CBD5E1" style={{ animation: 'si-pulse 2.5s ease-in-out infinite', transformOrigin: '4px 7px' }} />
    {/* Wind particles */}
    <line x1="42" y1="15" x2="46" y2="14" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <line x1="43" y1="22" x2="47" y2="21" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.6s infinite' }} />
  </svg>
);

/* Francés – Bandera Francia ondeando */
const Frances = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    {/* Flag – dynamic wave */}
    <g style={{ transformOrigin: '4px 22px', animation: 'si-wave 2.8s ease-in-out infinite' }}>
      <rect x="4" y="8" width="40" height="28" rx="3" fill="white" />
      <path d="M4 11 C4 9.34 5.34 8 7 8 L17.33 8 L17.33 36 L7 36 C5.34 36 4 34.66 4 33 Z" fill="#2563EB" />
      <path d="M30.67 8 L41 8 C42.66 8 44 9.34 44 11 L44 33 C44 34.66 42.66 36 41 36 L30.67 36 Z" fill="#DC2626" />
      <rect x="4" y="8" width="40" height="8" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="4" y="8" width="40" height="28" rx="3" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
    </g>
    {/* Pole */}
    <line x1="4" y1="8" x2="4" y2="44" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="4" cy="7" r="1.8" fill="#CBD5E1" style={{ animation: 'si-pulse 2.5s ease-in-out infinite', transformOrigin: '4px 7px' }} />
    {/* Wind particles */}
    <line x1="42" y1="18" x2="46" y2="17" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.3s infinite' }} />
    <line x1="43" y1="26" x2="47" y2="25" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.9s infinite' }} />
  </svg>
);

/* Programación – Terminal con código escribiéndose */
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
    {/* Code lines – typing effect with shimmer */}
    <text x="9" y="23" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold"
      style={{ animation: 'si-flicker 5s ease-in-out infinite' }}>&lt;</text>
    <text x="14" y="23" fill="#A78BFA" fontSize="5" fontFamily="monospace"
      style={{ animation: 'si-shimmer 4s ease-in-out 0.2s infinite' }}>div</text>
    <text x="29" y="23" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold"
      style={{ animation: 'si-flicker 5s ease-in-out 0.5s infinite' }}>&gt;</text>
    {/* Content line – draw animation */}
    <rect x="12" y="27" width="16" height="2" rx="1" fill="#4ADE80" opacity="0.5"
      strokeDasharray="20" style={{ animation: 'si-draw 4s ease-in-out infinite' }} />
    <rect x="12" y="31" width="10" height="2" rx="1" fill="#FBBF24" opacity="0.3"
      style={{ animation: 'si-shimmer 3s ease-in-out 1s infinite' }} />
    <text x="9" y="37" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold">&lt;/</text>
    <text x="19" y="37" fill="#A78BFA" fontSize="5" fontFamily="monospace">div</text>
    <text x="34" y="37" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold">&gt;</text>
    {/* Cursor – blinks */}
    <rect x="30" y="26" width="1.5" height="4" rx="0.5" fill="#06B6D4"
      style={{ animation: 'si-blink 0.8s ease-in-out infinite' }} />
    {/* Screen glow */}
    <rect x="4" y="14" width="40" height="28" rx="3" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="0.5"
      style={{ animation: 'si-glow 4s ease-in-out infinite' }} />
  </svg>
);

/* Historia – Pergamino desplegándose */
const Historia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-his" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Parchment body */}
    <rect x="10" y="8" width="28" height="32" rx="2" fill="#FEF3C7" />
    <rect x="10" y="8" width="28" height="32" rx="2" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />
    {/* Top roll – rocking */}
    <g style={{ transformOrigin: '24px 8px', animation: 'si-rock 4s ease-in-out infinite' }}>
      <ellipse cx="24" cy="8" rx="16" ry="4" fill="url(#si-his)" />
      <ellipse cx="24" cy="8" rx="16" ry="4" fill="none" stroke="#B45309" strokeWidth="0.5" opacity="0.2" />
      <ellipse cx="24" cy="8" rx="14" ry="2.5" fill="rgba(255,255,255,0.15)" />
    </g>
    {/* Bottom roll */}
    <ellipse cx="24" cy="40" rx="16" ry="4" fill="url(#si-his)" />
    <ellipse cx="24" cy="40" rx="14" ry="2.5" fill="rgba(255,255,255,0.1)" />
    {/* Text lines – appearing one by one with staggered draw */}
    {[16, 20, 24, 28, 32].map((y, i) => (
      <line key={i} x1="16" y1={y} x2={34 - (i % 3) * 3} y2={y}
        stroke="#92400E" strokeWidth="0.7"
        strokeDasharray="20"
        style={{ animation: `si-draw 3s ease-in-out ${i * 0.5}s infinite` }} />
    ))}
    {/* Wax seal – heartbeat pulse */}
    <g style={{ transformOrigin: '34px 34px', animation: 'si-bounce 2s ease-in-out infinite' }}>
      <circle cx="34" cy="34" r="3.5" fill="#DC2626" opacity="0.65" />
      <circle cx="34" cy="34" r="2.2" fill="#EF4444" opacity="0.5" />
      <circle cx="34" cy="34" r="1" fill="rgba(255,255,255,0.25)" />
    </g>
    {/* Age particles floating up */}
    <circle cx="14" cy="20" r="0.6" fill="#D97706" style={{ animation: 'si-rise 4s ease-out infinite' }} opacity="0.3" />
    <circle cx="32" cy="16" r="0.5" fill="#D97706" style={{ animation: 'si-rise 5s ease-out 1.5s infinite' }} opacity="0.25" />
  </svg>
);

/* Biología – ADN doble hélice con partículas */
const Biologia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-bio" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* DNA strands – slow spiral */}
    <g style={{ transformOrigin: '24px 24px', animation: 'si-spiral 10s linear infinite' }}>
      <path d="M16 4 C16 10 32 14 32 20 C32 26 16 30 16 36 C16 42 32 44 32 46"
        stroke="url(#si-bio)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M32 4 C32 10 16 14 16 20 C16 26 32 30 32 36 C32 42 16 44 16 46"
        stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
    {/* Rungs – staggered glow */}
    <line x1="19" y1="7" x2="29" y2="7" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 0s infinite' }} />
    <line x1="17" y1="12" x2="31" y2="12" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 0.4s infinite' }} />
    <line x1="22" y1="17" x2="26" y2="17" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 0.8s infinite' }} />
    <line x1="17" y1="24" x2="31" y2="24" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 1.2s infinite' }} />
    <line x1="19" y1="29" x2="29" y2="29" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 1.6s infinite' }} />
    <line x1="22" y1="34" x2="26" y2="34" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 2s infinite' }} />
    <line x1="17" y1="39" x2="31" y2="39" stroke="#A7F3D0" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-glow 3s ease-in-out 2.4s infinite' }} />
    {/* Floating particles around DNA */}
    <circle cx="8" cy="14" r="1.2" fill="#34D399" style={{ animation: 'si-orbit 5s linear infinite', transformOrigin: '24px 24px' }} opacity="0.5" />
    <circle cx="40" cy="30" r="1" fill="#6EE7B7" style={{ animation: 'si-orbit 7s linear 2s infinite reverse', transformOrigin: '24px 24px' }} opacity="0.4" />
    <circle cx="10" cy="38" r="0.8" fill="#A7F3D0" style={{ animation: 'si-orbit 6s linear 1s infinite', transformOrigin: '24px 24px' }} opacity="0.35" />
  </svg>
);

/* Física y Química – Matraz burbujeante */
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
    {/* Liquid – active sloshing */}
    <g style={{ transformOrigin: '24px 38px', animation: 'si-wave 3s ease-in-out infinite' }}>
      <path d="M12 34 C16 31 20 36 24 32 C28 28 32 35 36 33 L40 38 C42 42 39 44 34 44 L14 44 C9 44 6 42 8 38 Z" fill="url(#si-fis)" opacity="0.75" />
      <path d="M14 36 C18 33 22 38 26 34 L24 38 C20 41 16 36 14 36 Z" fill="rgba(255,255,255,0.18)" />
    </g>
    <rect x="18" y="4" width="12" height="14" rx="2" fill="none" stroke="#7C3AED" strokeWidth="1.2" />
    <rect x="16" y="4" width="16" height="3" rx="1.5" fill="#A78BFA" opacity="0.5" />
    {/* Bubbles – vigorous rising */}
    <circle cx="18" cy="38" r="2.2" fill="rgba(255,255,255,0.35)" style={{ animation: 'si-rise 2s ease-out infinite' }} />
    <circle cx="28" cy="36" r="1.8" fill="rgba(255,255,255,0.3)" style={{ animation: 'si-rise 2.5s ease-out 0.5s infinite' }} />
    <circle cx="24" cy="40" r="1.5" fill="rgba(255,255,255,0.25)" style={{ animation: 'si-rise 3s ease-out 1s infinite' }} />
    <circle cx="32" cy="39" r="1.2" fill="rgba(255,255,255,0.2)" style={{ animation: 'si-rise 2.8s ease-out 1.5s infinite' }} />
    <circle cx="15" cy="37" r="1" fill="rgba(255,255,255,0.2)" style={{ animation: 'si-rise 3.2s ease-out 2s infinite' }} />
    {/* Steam – wispy rising */}
    <path d="M22 3 C21 0 22 -2 21 -4" stroke="#C4B5FD" strokeWidth="0.8" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <path d="M26 2 C25 -1 26 -3 25 -5" stroke="#C4B5FD" strokeWidth="0.8" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.7s infinite' }} />
    {/* Glow at base */}
    <ellipse cx="24" cy="42" rx="10" ry="2" fill="rgba(168,85,247,0.15)"
      style={{ animation: 'si-glow 3s ease-in-out infinite' }} />
  </svg>
);

/* Música – Notas musicales flotando */
const Musica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-mus" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    {/* Whole notes group – swinging */}
    <g style={{ transformOrigin: '26px 24px', animation: 'si-swing 3s ease-in-out infinite' }}>
      <ellipse cx="14" cy="34" rx="6" ry="5" fill="url(#si-mus)" transform="rotate(-15 14 34)" />
      <ellipse cx="12.5" cy="32.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" transform="rotate(-15 12.5 32.5)" />
      <ellipse cx="34" cy="30" rx="6" ry="5" fill="url(#si-mus)" transform="rotate(-15 34 30)" />
      <ellipse cx="32.5" cy="28.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" transform="rotate(-15 32.5 28.5)" />
      <line x1="19" y1="31" x2="19" y2="8" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="27" x2="39" y2="6" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 8 L39 6 L39 10 L19 12 Z" fill="#EC4899" />
      <path d="M19 14 L39 12 L39 16 L19 18 Z" fill="#F472B6" opacity="0.6" />
    </g>
    {/* Sound wave rings emanating */}
    <circle cx="14" cy="34" r="0" fill="none" stroke="rgba(244,114,182,0.3)" strokeWidth="0.5"
      style={{ animation: 'si-ripple 2.5s ease-out infinite' }} />
    <circle cx="34" cy="30" r="0" fill="none" stroke="rgba(244,114,182,0.25)" strokeWidth="0.5"
      style={{ animation: 'si-ripple 2.5s ease-out 1.2s infinite' }} />
    {/* Sparkles – bouncing */}
    <circle cx="8" cy="14" r="1.5" fill="#FDE68A" style={{ animation: 'si-bounce 2s ease-in-out infinite' }} />
    <circle cx="42" cy="18" r="1" fill="#FDE68A" style={{ animation: 'si-bounce 2.5s ease-in-out 0.5s infinite' }} />
    <circle cx="6" cy="26" r="1" fill="#FBCFE8" style={{ animation: 'si-bounce 3s ease-in-out 1s infinite' }} />
  </svg>
);

/* Educación Plástica – Pincel pintando arcoíris */
const Plastica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    {/* Color strokes – drawing themselves */}
    <path d="M8 38 Q16 28 24 36" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 3s ease-in-out 0s infinite' }} />
    <path d="M12 34 Q20 24 28 32" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 3s ease-in-out 0.4s infinite' }} />
    <path d="M16 30 Q24 20 32 28" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 3s ease-in-out 0.8s infinite' }} />
    <path d="M20 26 Q28 16 36 24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 3s ease-in-out 1.2s infinite' }} />
    <path d="M24 22 Q32 12 40 20" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 3s ease-in-out 1.6s infinite' }} />
    {/* Brush – painting motion */}
    <g transform="rotate(-35 30 14)" style={{ transformOrigin: '28px 15px', animation: 'si-swing 2.5s ease-in-out infinite' }}>
      <rect x="26" y="4" width="5" height="22" rx="2.5" fill="#92400E" />
      <rect x="27" y="5" width="2" height="18" rx="1" fill="#B45309" opacity="0.4" />
      <rect x="25.5" y="24" width="6" height="3" rx="1" fill="#9CA3AF" />
      <path d="M25 27 L28.5 35 L32 27 Z" fill="#8B5CF6" />
      <path d="M26 27 L28.5 33 L29 27 Z" fill="rgba(255,255,255,0.15)" />
    </g>
    {/* Paint splatter particles */}
    <circle cx="10" cy="42" r="1.5" fill="#EF4444" opacity="0.5" style={{ animation: 'si-pulse 3s ease-in-out infinite', transformOrigin: '10px 42px' }} />
    <circle cx="22" cy="40" r="1" fill="#22C55E" opacity="0.4" style={{ animation: 'si-pulse 3s ease-in-out 0.8s infinite', transformOrigin: '22px 40px' }} />
  </svg>
);

/* Tecnología – Engranaje con circuitos vivos */
const Tecnologia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-tec" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Gear – steady spin */}
    <g style={{ transformOrigin: '24px 24px', animation: 'si-spin 12s linear infinite' }}>
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
    {/* Circuit traces – electric pulse traveling */}
    <path d="M38 14 L44 14 L44 20" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.4"
      strokeDasharray="12" style={{ animation: 'si-dash 2s linear infinite' }} />
    <path d="M38 34 L42 34 L42 40" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.4"
      strokeDasharray="12" style={{ animation: 'si-dash 2s linear 0.5s infinite' }} />
    <path d="M10 14 L4 14 L4 8" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.3"
      strokeDasharray="12" style={{ animation: 'si-dash 2s linear 1s infinite' }} />
    {/* Circuit nodes – pulsing */}
    <circle cx="44" cy="20" r="1.8" fill="#38BDF8" style={{ animation: 'si-pulse 2s ease-in-out infinite', transformOrigin: '44px 20px' }} />
    <circle cx="42" cy="40" r="1.8" fill="#38BDF8" style={{ animation: 'si-pulse 2s ease-in-out 0.6s infinite', transformOrigin: '42px 40px' }} />
    <circle cx="4" cy="8" r="1.5" fill="#38BDF8" style={{ animation: 'si-pulse 2s ease-in-out 1.2s infinite', transformOrigin: '4px 8px' }} />
  </svg>
);

/* Educación Física – Balón rebotando */
const EdFisica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="si-ef" cx="0.4" cy="0.35" r="0.6">
        <stop offset="0%" stopColor="#FCA5A5" />
        <stop offset="60%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </radialGradient>
    </defs>
    {/* Shadow – syncs with bounce */}
    <ellipse cx="24" cy="44" rx="12" ry="2.5" fill="rgba(0,0,0,0.08)"
      style={{ transformOrigin: '24px 44px', animation: 'si-breathe 2s ease-in-out infinite' }} />
    {/* Ball – active bounce */}
    <g style={{ transformOrigin: '24px 44px', animation: 'si-bounce 2s ease-in-out infinite' }}>
      <circle cx="24" cy="24" r="17" fill="url(#si-ef)" />
      <path d="M24 7 C24 7 18 16 18 24 C18 32 24 41 24 41" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      <path d="M24 7 C24 7 30 16 30 24 C30 32 24 41 24 41" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      <path d="M8 20 C14 22 20 20 24 18 C28 20 34 22 40 20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <path d="M8 30 C14 28 20 30 24 32 C28 30 34 28 40 30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <circle cx="18" cy="16" r="5" fill="rgba(255,255,255,0.2)" />
      <circle cx="16" cy="14" r="2.5" fill="rgba(255,255,255,0.15)" />
      {/* Spin highlight */}
      <circle cx="20" cy="18" r="3" fill="rgba(255,255,255,0.1)"
        style={{ transformOrigin: '24px 24px', animation: 'si-spin 4s linear infinite' }} />
    </g>
    {/* Motion lines – dynamic */}
    <line x1="42" y1="10" x2="46" y2="8" stroke="#FCA5A5" strokeWidth="1.2" strokeLinecap="round"
      style={{ animation: 'si-wiggle 1.5s ease-in-out infinite' }} />
    <line x1="43" y1="14" x2="47" y2="13" stroke="#FCA5A5" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'si-wiggle 1.5s ease-in-out 0.2s infinite' }} />
    <line x1="42" y1="18" x2="45" y2="18" stroke="#FCA5A5" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'si-wiggle 1.5s ease-in-out 0.4s infinite' }} />
  </svg>
);

/* Robótica – Robot con ojos escaneando */
const Robotica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-rob" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
    </defs>
    {/* Antenna – wobbles */}
    <g style={{ transformOrigin: '24px 10px', animation: 'si-swing 2s ease-in-out infinite' }}>
      <line x1="24" y1="2" x2="24" y2="10" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Antenna light – signal burst */}
      <circle cx="24" cy="2" r="2.5" fill="#38BDF8" style={{ transformOrigin: '24px 2px', animation: 'si-pulse 1.5s ease-in-out infinite' }} />
      <circle cx="23.5" cy="1.5" r="1" fill="rgba(255,255,255,0.3)" />
    </g>
    {/* Signal rings from antenna */}
    <circle cx="24" cy="2" r="0" fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="0.4"
      style={{ animation: 'si-ripple 2s ease-out infinite' }} />
    <circle cx="24" cy="2" r="0" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="0.4"
      style={{ animation: 'si-ripple 2s ease-out 1s infinite' }} />
    {/* Head */}
    <rect x="8" y="10" width="32" height="26" rx="6" fill="url(#si-rob)" />
    <rect x="8" y="10" width="32" height="26" rx="6" fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
    <rect x="12" y="14" width="24" height="18" rx="4" fill="#CBD5E1" opacity="0.3" />
    {/* Eyes – scanner effect */}
    <circle cx="18" cy="22" r="4.5" fill="#1E293B" />
    <circle cx="30" cy="22" r="4.5" fill="#1E293B" />
    <circle cx="18" cy="22" r="3" fill="#38BDF8" style={{ animation: 'si-flicker 3s ease-in-out infinite' }} />
    <circle cx="30" cy="22" r="3" fill="#38BDF8" style={{ animation: 'si-flicker 3s ease-in-out 0.2s infinite' }} />
    {/* Eye scan line */}
    <rect x="15.5" y="20" width="5" height="0.8" rx="0.4" fill="rgba(255,255,255,0.5)"
      style={{ animation: 'si-scan 2.5s linear infinite' }} />
    <rect x="27.5" y="20" width="5" height="0.8" rx="0.4" fill="rgba(255,255,255,0.5)"
      style={{ animation: 'si-scan 2.5s linear 0.3s infinite' }} />
    <circle cx="17" cy="21" r="1.2" fill="rgba(255,255,255,0.5)" />
    <circle cx="29" cy="21" r="1.2" fill="rgba(255,255,255,0.5)" />
    {/* Mouth – LED chasing */}
    <rect x="18" y="29" width="12" height="2.5" rx="1.25" fill="#475569" />
    <rect x="20" y="29.5" width="2" height="1.5" rx="0.5" fill="#38BDF8"
      style={{ animation: 'si-flicker 1.5s ease-in-out 0s infinite' }} />
    <rect x="23" y="29.5" width="2" height="1.5" rx="0.5" fill="#38BDF8"
      style={{ animation: 'si-flicker 1.5s ease-in-out 0.3s infinite' }} />
    <rect x="26" y="29.5" width="2" height="1.5" rx="0.5" fill="#38BDF8"
      style={{ animation: 'si-flicker 1.5s ease-in-out 0.6s infinite' }} />
    {/* Ears */}
    <rect x="4" y="18" width="5" height="10" rx="2.5" fill="#64748B" />
    <rect x="39" y="18" width="5" height="10" rx="2.5" fill="#64748B" />
    <circle cx="12" cy="12" r="1" fill="#475569" opacity="0.4" />
    <circle cx="36" cy="12" r="1" fill="#475569" opacity="0.4" />
  </svg>
);

/* Inteligencia Artificial – Cerebro con pulsos neuronales */
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
    {/* Brain – gentle breathe */}
    <g style={{ transformOrigin: '24px 24px', animation: 'si-breathe 3.5s ease-in-out infinite' }}>
      <path d="M24 42 L24 8 C18 6 12 8 9 12 C6 16 4 20 5 25 C4 26 3 28 4 31 C5 34 7 36 9 37 C11 40 15 42 20 43 Z"
        fill="url(#si-ia)" opacity="0.9" />
      <path d="M24 42 L24 8 C30 6 36 8 39 12 C42 16 44 20 43 25 C44 26 45 28 44 31 C43 34 41 36 39 37 C37 40 33 42 28 43 Z"
        fill="url(#si-ia2)" opacity="0.85" />
      <path d="M24 8 L24 42" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      {/* Sulci */}
      <path d="M8 18 C12 16 16 18 20 16 Q22 15 24 16" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M6 25 C10 23 14 26 18 24 Q21 23 24 24" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M8 32 C12 30 16 33 20 31 Q22 30 24 31" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M12 12 C14 14 18 12 22 13" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M24 16 Q26 15 28 16 C32 18 36 16 40 18" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M24 24 Q27 23 30 24 C34 26 38 23 42 25" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M24 31 Q26 30 28 31 C32 33 36 30 40 32" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M26 13 C30 12 34 14 36 12" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M22 42 Q24 46 26 42" stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.5" />
    </g>
    {/* Neural pulse connections – electric signals traveling */}
    <line x1="14" y1="20" x2="24" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"
      strokeDasharray="4 3" style={{ animation: 'si-dash 1.5s linear infinite' }} />
    <line x1="34" y1="20" x2="24" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"
      strokeDasharray="4 3" style={{ animation: 'si-dash 1.5s linear 0.3s infinite' }} />
    <line x1="24" y1="24" x2="16" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6"
      strokeDasharray="4 3" style={{ animation: 'si-dash 1.5s linear 0.6s infinite' }} />
    <line x1="24" y1="24" x2="32" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6"
      strokeDasharray="4 3" style={{ animation: 'si-dash 1.5s linear 0.9s infinite' }} />
    {/* Nodes – cascading pulse */}
    <circle cx="14" cy="20" r="2" fill="rgba(255,255,255,0.6)" style={{ transformOrigin: '14px 20px', animation: 'si-pulse 2s ease-in-out 0s infinite' }} />
    <circle cx="34" cy="20" r="2" fill="rgba(255,255,255,0.6)" style={{ transformOrigin: '34px 20px', animation: 'si-pulse 2s ease-in-out 0.4s infinite' }} />
    <circle cx="24" cy="24" r="2.5" fill="rgba(255,255,255,0.7)" style={{ transformOrigin: '24px 24px', animation: 'si-pulse 2s ease-in-out 0.8s infinite' }} />
    <circle cx="16" cy="32" r="1.8" fill="rgba(255,255,255,0.45)" style={{ transformOrigin: '16px 32px', animation: 'si-pulse 2s ease-in-out 1.2s infinite' }} />
    <circle cx="32" cy="32" r="1.8" fill="rgba(255,255,255,0.45)" style={{ transformOrigin: '32px 32px', animation: 'si-pulse 2s ease-in-out 1.6s infinite' }} />
    {/* Spark aura */}
    <circle cx="4" cy="10" r="1.2" fill="#DDD6FE" style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }} />
    <circle cx="44" cy="10" r="1" fill="#DDD6FE" style={{ animation: 'si-bounce 3s ease-in-out 0.8s infinite' }} />
  </svg>
);

/* Latín – Columna romana con brillo recorriendo */
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
    {/* Fluting – staggered glow waves */}
    <line x1="20" y1="11" x2="20" y2="37" stroke="#D97706" strokeWidth="0.5"
      style={{ animation: 'si-glow 3s ease-in-out 0s infinite' }} />
    <line x1="24" y1="11" x2="24" y2="37" stroke="#D97706" strokeWidth="0.5"
      style={{ animation: 'si-glow 3s ease-in-out 0.5s infinite' }} />
    <line x1="28" y1="11" x2="28" y2="37" stroke="#D97706" strokeWidth="0.5"
      style={{ animation: 'si-glow 3s ease-in-out 1s infinite' }} />
    {/* Traveling light beam – scans down column */}
    <rect x="16" y="10" width="16" height="4" rx="1" fill="rgba(255,255,255,0.12)"
      style={{ animation: 'si-scan 4s ease-in-out infinite' }} />
    <rect x="14" y="38" width="20" height="3" rx="1" fill="#D97706" opacity="0.5" />
    <rect x="10" y="40" width="28" height="4" rx="1" fill="url(#si-lat)" />
    <text x="24" y="27" textAnchor="middle" fill="#92400E" fontSize="5" fontWeight="bold" fontFamily="serif" opacity="0.3"
      style={{ animation: 'si-shimmer 4s ease-in-out infinite' }}>SPQR</text>
    {/* Age dust particles */}
    <circle cx="12" cy="28" r="0.5" fill="#FDE68A" style={{ animation: 'si-rise 5s ease-out infinite' }} opacity="0.3" />
    <circle cx="36" cy="22" r="0.4" fill="#FDE68A" style={{ animation: 'si-rise 6s ease-out 2s infinite' }} opacity="0.25" />
  </svg>
);

/* Economía – Gráfico con tendencia animada */
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
    {/* Bars – bouncing up staggered */}
    {[
      { x: 12, h: 10, color: '#BBF7D0', delay: 0 },
      { x: 19, h: 16, color: '#86EFAC', delay: 0.2 },
      { x: 26, h: 12, color: '#4ADE80', delay: 0.4 },
      { x: 33, h: 24, color: '#22C55E', delay: 0.6 },
    ].map(({ x, h, color, delay }) => (
      <g key={x} style={{ transformOrigin: `${x + 2.5}px 40px`, animation: `si-bounce 3s ease-in-out ${delay}s infinite` }}>
        <rect x={x} y={40 - h} width="5" height={h} rx="1.5" fill={color} />
        <rect x={x} y={40 - h} width="2" height={h} rx="1" fill="rgba(255,255,255,0.15)" />
      </g>
    ))}
    {/* Trend line – drawing animation */}
    <path d="M14 32 L21 26 L28 30 L35 18" stroke="url(#si-eco)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
      strokeDasharray="50" style={{ animation: 'si-draw 4s ease-in-out infinite' }} />
    {/* Arrow tip – bouncing up */}
    <g style={{ animation: 'si-bounce 2s ease-in-out infinite' }}>
      <path d="M33 16 L35 18 L37 15" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
    {/* Arrow up */}
    <g style={{ animation: 'si-bounce 2.5s ease-in-out 0.3s infinite' }}>
      <path d="M40 8 L42 4 L44 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="42" y1="4" x2="42" y2="14" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    {/* Rising coin */}
    <circle cx="42" cy="4" r="0" fill="none" stroke="rgba(5,150,105,0.3)" strokeWidth="0.4"
      style={{ animation: 'si-ripple 3s ease-out infinite' }} />
  </svg>
);

/* Filosofía – Búho de Atenea pensante */
const Filosofia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-fil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* Body */}
    <ellipse cx="24" cy="30" rx="12" ry="14" fill="#EDE9FE" />
    <ellipse cx="24" cy="30" rx="12" ry="14" stroke="#7C3AED" strokeWidth="0.5" opacity="0.2" fill="none" />
    {/* Head */}
    <circle cx="24" cy="16" r="10" fill="#F5F3FF" />
    <circle cx="24" cy="16" r="10" stroke="#7C3AED" strokeWidth="0.5" opacity="0.15" fill="none" />
    {/* Ears */}
    <path d="M16 10 L14 4 L18 8" fill="#DDD6FE" />
    <path d="M32 10 L34 4 L30 8" fill="#DDD6FE" />
    {/* Eyes – blinking */}
    <g style={{ animation: 'si-blink 5s ease-in-out infinite' }}>
      <circle cx="20" cy="16" r="3.5" fill="url(#si-fil)" />
      <circle cx="28" cy="16" r="3.5" fill="url(#si-fil)" />
      <circle cx="21" cy="15" r="1.2" fill="white" opacity="0.7" />
      <circle cx="29" cy="15" r="1.2" fill="white" opacity="0.7" />
    </g>
    {/* Beak */}
    <path d="M22 20 L24 23 L26 20" fill="#F59E0B" />
    {/* Belly lines */}
    {[26, 30, 34].map((y, i) => (
      <path key={i} d={`M18 ${y} Q24 ${y + 2} 30 ${y}`} stroke="#C4B5FD" strokeWidth="0.7" fill="none"
        style={{ animation: `si-shimmer 3s ease-in-out ${i * 0.4}s infinite` }} />
    ))}
    {/* Thought bubble */}
    <g style={{ animation: 'si-rise 5s ease-out infinite' }}>
      <circle cx="36" cy="8" r="2" fill="#C4B5FD" opacity="0.5" />
      <circle cx="38" cy="4" r="1.2" fill="#C4B5FD" opacity="0.35" />
      <circle cx="40" cy="1" r="0.7" fill="#C4B5FD" opacity="0.2" />
    </g>
  </svg>
);

/* Historia del Mundo – Globo terráqueo con meridianos */
const HistoriaMundo = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-hm" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
    {/* Globe */}
    <circle cx="24" cy="24" r="18" fill="#DBEAFE" />
    <circle cx="24" cy="24" r="18" stroke="url(#si-hm)" strokeWidth="1.5" fill="none" />
    {/* Continents simplified */}
    <ellipse cx="20" cy="18" rx="6" ry="4" fill="#93C5FD" opacity="0.6"
      style={{ animation: 'si-breathe 4s ease-in-out infinite' }} />
    <ellipse cx="28" cy="28" rx="5" ry="6" fill="#93C5FD" opacity="0.5"
      style={{ animation: 'si-breathe 4s ease-in-out 1s infinite' }} />
    <ellipse cx="14" cy="28" rx="3" ry="4" fill="#93C5FD" opacity="0.4" />
    {/* Meridians – spinning */}
    <g style={{ transformOrigin: '24px 24px', animation: 'si-spin 20s linear infinite' }}>
      <ellipse cx="24" cy="24" rx="8" ry="18" stroke="#2563EB" strokeWidth="0.4" opacity="0.25" fill="none" />
      <ellipse cx="24" cy="24" rx="14" ry="18" stroke="#2563EB" strokeWidth="0.4" opacity="0.2" fill="none" />
    </g>
    {/* Equator */}
    <ellipse cx="24" cy="24" rx="18" ry="5" stroke="#2563EB" strokeWidth="0.4" opacity="0.2" fill="none" />
    {/* Stand */}
    <path d="M24 42 L24 46" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 46 L30 46" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
    {/* Arc stand */}
    <path d="M10 24 Q24 2 38 24" stroke="#9CA3AF" strokeWidth="0.8" fill="none" opacity="0.3" />
    {/* Pulse */}
    <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth="0.5"
      style={{ animation: 'si-ripple 4s ease-out infinite' }} />
  </svg>
);

/* Historia de España – Corona sobre escudo */
const HistoriaEspana = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-he" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    {/* Shield */}
    <path d="M12 14 L12 30 Q12 40 24 44 Q36 40 36 30 L36 14 Z" fill="#FEF2F2" />
    <path d="M12 14 L12 30 Q12 40 24 44 Q36 40 36 30 L36 14 Z" stroke="#DC2626" strokeWidth="1" opacity="0.3" fill="none" />
    {/* Quarters */}
    <line x1="24" y1="14" x2="24" y2="44" stroke="#DC2626" strokeWidth="0.5" opacity="0.15" />
    <line x1="12" y1="28" x2="36" y2="28" stroke="#DC2626" strokeWidth="0.5" opacity="0.15" />
    {/* Castle (top-left) */}
    <rect x="16" y="18" width="5" height="7" rx="0.5" fill="#FCD34D" opacity="0.5"
      style={{ animation: 'si-shimmer 3s ease-in-out infinite' }} />
    {/* Lion (top-right) */}
    <circle cx="30" cy="21" r="2.5" fill="#DC2626" opacity="0.3"
      style={{ animation: 'si-shimmer 3s ease-in-out 0.5s infinite' }} />
    {/* Stripes (bottom-left) */}
    {[31, 33, 35, 37].map((y, i) => (
      <line key={i} x1="14" y1={y} x2="23" y2={y} stroke="#FCD34D" strokeWidth="0.8" opacity="0.4"
        style={{ animation: `si-shimmer 3s ease-in-out ${i * 0.3}s infinite` }} />
    ))}
    {/* Crown – rocking */}
    <g style={{ transformOrigin: '24px 12px', animation: 'si-rock 4s ease-in-out infinite' }}>
      <path d="M14 14 L16 6 L20 10 L24 4 L28 10 L32 6 L34 14 Z" fill="#FCD34D" />
      <path d="M14 14 L34 14" stroke="#D97706" strokeWidth="0.5" opacity="0.3" />
      <circle cx="24" cy="4" r="1" fill="#DC2626" opacity="0.6" />
      <circle cx="16" cy="6" r="0.8" fill="#DC2626" opacity="0.5" />
      <circle cx="32" cy="6" r="0.8" fill="#DC2626" opacity="0.5" />
    </g>
    {/* Sparkle */}
    <circle cx="24" cy="4" r="0" fill="none" stroke="rgba(252,211,77,0.4)" strokeWidth="0.3"
      style={{ animation: 'si-ripple 3s ease-out infinite' }} />
  </svg>
);

/* Dibujo Técnico – Compás y escuadra */
const DibujoTecnico = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-dt" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Grid background */}
    {[8, 16, 24, 32, 40].map(v => (
      <g key={v}>
        <line x1={v} y1="4" x2={v} y2="44" stroke="#CBD5E1" strokeWidth="0.3" opacity="0.4" />
        <line x1="4" y1={v} x2="44" y2={v} stroke="#CBD5E1" strokeWidth="0.3" opacity="0.4" />
      </g>
    ))}
    {/* Triangle/Escuadra */}
    <path d="M8 40 L8 16 L32 40 Z" fill="none" stroke="url(#si-dt)" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6" />
    {/* Compass – swaying */}
    <g style={{ transformOrigin: '28px 8px', animation: 'si-sway 4s ease-in-out infinite' }}>
      {/* Hinge */}
      <circle cx="28" cy="8" r="2" fill="#64748B" />
      <circle cx="28" cy="8" r="1" fill="#94A3B8" />
      {/* Left leg */}
      <line x1="28" y1="8" x2="20" y2="38" stroke="url(#si-dt)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="28" y1="8" x2="36" y2="38" stroke="url(#si-dt)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Pencil tip */}
      <circle cx="36" cy="38" r="1.2" fill="#3B82F6" opacity="0.6" />
      {/* Needle */}
      <circle cx="20" cy="38" r="0.8" fill="#475569" />
    </g>
    {/* Drawn arc – drawing animation */}
    <path d="M20 38 Q28 20 36 38" stroke="#3B82F6" strokeWidth="0.8" fill="none" strokeDasharray="40"
      style={{ animation: 'si-draw 5s ease-in-out infinite' }} opacity="0.5" />
  </svg>
);

/* Literatura Universal – Pluma sobre libro */
const LiteraturaUniversal = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-lu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F9A8D4" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
    </defs>
    {/* Book */}
    <rect x="6" y="28" width="36" height="16" rx="2" fill="#FDF2F8" />
    <rect x="6" y="28" width="36" height="16" rx="2" stroke="#BE185D" strokeWidth="0.5" opacity="0.2" fill="none" />
    <line x1="24" y1="28" x2="24" y2="44" stroke="#BE185D" strokeWidth="0.5" opacity="0.1" />
    {/* Pages */}
    <rect x="6" y="26" width="36" height="3" rx="1" fill="#FBCFE8" opacity="0.5" />
    {/* Text lines */}
    {[33, 36, 39].map((y, i) => (
      <line key={i} x1="10" y1={y} x2={20 - i * 2} y2={y} stroke="#BE185D" strokeWidth="0.5" opacity="0.2"
        style={{ animation: `si-shimmer 3s ease-in-out ${i * 0.3}s infinite` }} />
    ))}
    {/* Quill – swaying */}
    <g style={{ transformOrigin: '32px 26px', animation: 'si-sway 3s ease-in-out infinite' }}>
      <path d="M32 26 Q36 14 34 4" stroke="url(#si-lu)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M34 4 Q38 8 36 14 Q34 10 32 14 Q30 8 34 4" fill="#F9A8D4" opacity="0.7" />
      {/* Feather barbs */}
      <path d="M36 10 L40 8" stroke="#FBCFE8" strokeWidth="0.5" opacity="0.5" />
      <path d="M35 14 L39 13" stroke="#FBCFE8" strokeWidth="0.5" opacity="0.4" />
    </g>
    {/* Ink drops */}
    <circle cx="30" cy="27" r="0.8" fill="#BE185D" opacity="0.4"
      style={{ animation: 'si-pulse 3s ease-in-out infinite' }} />
    <circle cx="33" cy="28" r="0.5" fill="#BE185D" opacity="0.3"
      style={{ animation: 'si-pulse 3s ease-in-out 0.5s infinite' }} />
  </svg>
);

/* Economía de la Empresa – Maletín corporativo */
const EconomiaEmpresa = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-ee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Handle */}
    <path d="M18 14 L18 10 Q18 6 22 6 L26 6 Q30 6 30 10 L30 14" stroke="#047857" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Briefcase body */}
    <rect x="6" y="14" width="36" height="24" rx="3" fill="#ECFDF5" />
    <rect x="6" y="14" width="36" height="24" rx="3" stroke="#047857" strokeWidth="0.8" opacity="0.3" fill="none" />
    {/* Belt */}
    <rect x="6" y="24" width="36" height="4" fill="#047857" opacity="0.15" />
    {/* Clasp – bouncing */}
    <g style={{ transformOrigin: '24px 26px', animation: 'si-bounce 3s ease-in-out infinite' }}>
      <rect x="20" y="23" width="8" height="6" rx="1.5" fill="url(#si-ee)" />
      <rect x="22" y="25" width="4" height="2" rx="0.5" fill="rgba(255,255,255,0.3)" />
    </g>
    {/* Chart inside (subtle) */}
    <path d="M12 32 L18 28 L24 30 L30 24 L36 26" stroke="#047857" strokeWidth="0.8" opacity="0.2" fill="none"
      strokeDasharray="30" style={{ animation: 'si-draw 4s ease-in-out infinite' }} />
    {/* Sparkle */}
    <circle cx="36" cy="14" r="0" fill="none" stroke="rgba(4,120,87,0.3)" strokeWidth="0.4"
      style={{ animation: 'si-ripple 4s ease-out infinite' }} />
  </svg>
);

/* Geografía – Mapa con brújula */
const Geografia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-geo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
    </defs>
    {/* Map */}
    <rect x="4" y="8" width="40" height="32" rx="2" fill="#F0FDFA" />
    <rect x="4" y="8" width="40" height="32" rx="2" stroke="#0D9488" strokeWidth="0.5" opacity="0.25" fill="none" />
    {/* Topography lines */}
    <path d="M8 20 Q16 14 24 18 Q32 22 40 16" stroke="#99F6E4" strokeWidth="1" fill="none"
      style={{ animation: 'si-wave 5s ease-in-out infinite' }} />
    <path d="M8 28 Q16 24 28 26 Q36 28 40 24" stroke="#99F6E4" strokeWidth="0.8" fill="none"
      style={{ animation: 'si-wave 5s ease-in-out 0.5s infinite' }} />
    <path d="M8 34 Q20 30 32 33 Q38 34 40 32" stroke="#99F6E4" strokeWidth="0.6" fill="none"
      style={{ animation: 'si-wave 5s ease-in-out 1s infinite' }} />
    {/* Mountain */}
    <path d="M14 28 L20 16 L26 28" fill="#5EEAD4" opacity="0.3" />
    <path d="M20 16 L22 20 L18 20 Z" fill="white" opacity="0.4" />
    {/* Compass rose – spinning */}
    <g style={{ transformOrigin: '36px 32px', animation: 'si-spin 8s linear infinite' }}>
      <circle cx="36" cy="32" r="5" fill="rgba(255,255,255,0.8)" stroke="#0D9488" strokeWidth="0.5" />
      <path d="M36 27 L37.5 32 L36 33 L34.5 32 Z" fill="#DC2626" opacity="0.7" />
      <path d="M36 37 L37.5 32 L36 31 L34.5 32 Z" fill="#E5E7EB" opacity="0.5" />
    </g>
    {/* Pin */}
    <g style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }}>
      <path d="M12 14 Q12 10 15 10 Q18 10 18 14 Q18 16 15 20 Q12 16 12 14 Z" fill="#DC2626" opacity="0.6" />
      <circle cx="15" cy="13" r="1.2" fill="white" opacity="0.4" />
    </g>
  </svg>
);

/* Arte – Paleta de pintor con pincel */
const Arte = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-art" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#9333EA" />
      </linearGradient>
    </defs>
    {/* Palette */}
    <ellipse cx="22" cy="26" rx="16" ry="14" fill="#FDF4FF" stroke="#9333EA" strokeWidth="0.5" opacity="0.25"
      style={{ animation: 'si-breathe 5s ease-in-out infinite' }} />
    {/* Thumb hole */}
    <ellipse cx="16" cy="32" rx="3" ry="2.5" fill="#F5F3FF" stroke="#C084FC" strokeWidth="0.5" opacity="0.4" />
    {/* Paint blobs – pulsing */}
    <circle cx="14" cy="20" r="2.5" fill="#EF4444" style={{ animation: 'si-pulse 3s ease-in-out 0s infinite' }} opacity="0.7" />
    <circle cx="20" cy="16" r="2.2" fill="#F59E0B" style={{ animation: 'si-pulse 3s ease-in-out 0.4s infinite' }} opacity="0.7" />
    <circle cx="28" cy="16" r="2" fill="#3B82F6" style={{ animation: 'si-pulse 3s ease-in-out 0.8s infinite' }} opacity="0.7" />
    <circle cx="32" cy="22" r="2.3" fill="#10B981" style={{ animation: 'si-pulse 3s ease-in-out 1.2s infinite' }} opacity="0.7" />
    <circle cx="28" cy="28" r="1.8" fill="#8B5CF6" style={{ animation: 'si-pulse 3s ease-in-out 1.6s infinite' }} opacity="0.7" />
    {/* Brush – swaying */}
    <g style={{ transformOrigin: '38px 12px', animation: 'si-sway 3s ease-in-out infinite' }}>
      <line x1="38" y1="12" x2="42" y2="42" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="12" x2="42" y2="42" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      {/* Brush tip */}
      <ellipse cx="37" cy="10" rx="3" ry="4" fill="url(#si-art)" transform="rotate(-10 37 10)" />
      <ellipse cx="37" cy="9" rx="1.5" ry="2" fill="rgba(255,255,255,0.2)" transform="rotate(-10 37 9)" />
    </g>
  </svg>
);

/* Química – Matraz Erlenmeyer con burbujas */
const Quimica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-qui" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="60%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#DDD6FE" />
      </linearGradient>
    </defs>
    {/* Flask body */}
    <path d="M18 18 L8 38 Q8 44 16 44 L32 44 Q40 44 40 38 L30 18" fill="#F5F3FF" />
    <path d="M18 18 L8 38 Q8 44 16 44 L32 44 Q40 44 40 38 L30 18" stroke="#7C3AED" strokeWidth="0.8" opacity="0.3" fill="none" />
    {/* Liquid with wave */}
    <path d="M10 34 Q18 31 24 34 Q30 37 38 34 L40 38 Q40 44 32 44 L16 44 Q8 44 8 38 Z" fill="url(#si-qui)" opacity="0.6"
      style={{ animation: 'si-wave 3s ease-in-out infinite' }} />
    {/* Neck */}
    <rect x="18" y="6" width="12" height="12" fill="#F5F3FF" />
    <rect x="18" y="6" width="12" height="12" stroke="#7C3AED" strokeWidth="0.8" opacity="0.3" fill="none" />
    {/* Rim */}
    <rect x="16" y="4" width="16" height="3" rx="1" fill="#DDD6FE" />
    <rect x="16" y="4" width="16" height="3" rx="1" stroke="#7C3AED" strokeWidth="0.5" opacity="0.2" fill="none" />
    {/* Bubbles – rising */}
    <circle cx="20" cy="38" r="1.5" fill="#C4B5FD" style={{ animation: 'si-rise 2.5s ease-out infinite' }} opacity="0.6" />
    <circle cx="26" cy="40" r="1" fill="#DDD6FE" style={{ animation: 'si-rise 3s ease-out 0.5s infinite' }} opacity="0.5" />
    <circle cx="22" cy="36" r="0.8" fill="#C4B5FD" style={{ animation: 'si-rise 3.5s ease-out 1s infinite' }} opacity="0.4" />
    <circle cx="28" cy="37" r="1.2" fill="#DDD6FE" style={{ animation: 'si-rise 2.8s ease-out 1.5s infinite' }} opacity="0.5" />
    <circle cx="24" cy="34" r="0.6" fill="#EDE9FE" style={{ animation: 'si-rise 4s ease-out 2s infinite' }} opacity="0.3" />
    {/* Vapor */}
    <path d="M22 4 Q20 0 24 -2" stroke="#C4B5FD" strokeWidth="0.5" fill="none"
      style={{ animation: 'si-rise 4s ease-out infinite' }} opacity="0.3" />
  </svg>
);

/* ── AL: Audición y Lenguaje ─────────────────────────────────── */

/* Articulación – Boca con ondas de sonido */
const Articulacion = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-art" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FB923C" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
    </defs>
    {/* Face circle */}
    <circle cx="20" cy="24" r="16" fill="#FFF7ED" stroke="url(#si-art)" strokeWidth="1.5" />
    {/* Eyes */}
    <circle cx="15" cy="20" r="2" fill="#EA580C" opacity="0.6"
      style={{ animation: 'si-blink 3s ease-in-out infinite' }} />
    <circle cx="25" cy="20" r="2" fill="#EA580C" opacity="0.6"
      style={{ animation: 'si-blink 3s ease-in-out 0.2s infinite' }} />
    {/* Mouth – opening and closing */}
    <ellipse cx="20" cy="30" rx="6" ry="3.5" fill="#FDBA74" stroke="#EA580C" strokeWidth="0.8"
      style={{ transformOrigin: '20px 30px', animation: 'si-breathe 2s ease-in-out infinite' }} />
    <ellipse cx="20" cy="29" rx="3" ry="1.5" fill="#FFF7ED" opacity="0.5" />
    {/* Sound waves emanating from mouth */}
    <path d="M34 24 Q37 20 34 16" stroke="#FB923C" strokeWidth="1.2" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <path d="M37 26 Q41 20 37 14" stroke="#FDBA74" strokeWidth="1" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.4s infinite' }} />
    <path d="M40 28 Q45 20 40 12" stroke="#FED7AA" strokeWidth="0.8" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.8s infinite' }} />
    {/* Phoneme letters floating */}
    <text x="38" y="10" fill="#EA580C" fontSize="5" fontWeight="bold" opacity="0.5"
      style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }}>r</text>
    <text x="42" y="22" fill="#FB923C" fontSize="4" fontWeight="bold" opacity="0.4"
      style={{ animation: 'si-bounce 3s ease-in-out 0.5s infinite' }}>s</text>
  </svg>
);

/* ALVocabulario – Nube de palabras interconectadas */
const ALVocabulario = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-alv" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* Central word cloud */}
    <rect x="10" y="16" width="28" height="16" rx="8" fill="#FDF2F8" stroke="url(#si-alv)" strokeWidth="1.2" />
    {/* Smaller clouds */}
    <rect x="2" y="6" width="16" height="10" rx="5" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="0.8"
      style={{ animation: 'si-float 3.5s ease-in-out infinite' }} />
    <rect x="30" y="4" width="14" height="9" rx="4.5" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="0.8"
      style={{ animation: 'si-float 4s ease-in-out 0.5s infinite' }} />
    <rect x="6" y="34" width="15" height="10" rx="5" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="0.8"
      style={{ animation: 'si-float 3s ease-in-out 1s infinite' }} />
    <rect x="28" y="36" width="16" height="9" rx="4.5" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="0.8"
      style={{ animation: 'si-float 3.5s ease-in-out 1.5s infinite' }} />
    {/* Words inside clouds */}
    <text x="10" y="12" fill="#DB2777" fontSize="4" fontWeight="bold" opacity="0.7">sol</text>
    <text x="34" y="10" fill="#EC4899" fontSize="3.5" fontWeight="bold" opacity="0.6">mar</text>
    <text x="16" y="26" fill="#BE185D" fontSize="5.5" fontWeight="bold" opacity="0.8"
      style={{ animation: 'si-breathe 3s ease-in-out infinite', transformOrigin: '24px 25px' }}>ABC</text>
    <text x="10" y="41" fill="#DB2777" fontSize="3.5" fontWeight="bold" opacity="0.6">luz</text>
    <text x="32" y="42" fill="#EC4899" fontSize="4" fontWeight="bold" opacity="0.6">pan</text>
    {/* Connecting lines */}
    <line x1="16" y1="16" x2="14" y2="16" stroke="#F9A8D4" strokeWidth="0.6" strokeDasharray="2 1" />
    <line x1="32" y1="13" x2="34" y2="16" stroke="#F9A8D4" strokeWidth="0.6" strokeDasharray="2 1" />
    <line x1="16" y1="32" x2="14" y2="34" stroke="#F9A8D4" strokeWidth="0.6" strokeDasharray="2 1" />
    <line x1="32" y1="32" x2="34" y2="36" stroke="#F9A8D4" strokeWidth="0.6" strokeDasharray="2 1" />
  </svg>
);

/* Morfosintaxis – Bloques de frase ensamblados */
const Morfosintaxis = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-mrf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6D28D9" />
      </linearGradient>
    </defs>
    {/* Sentence blocks – puzzle pieces */}
    <g style={{ animation: 'si-float 4s ease-in-out infinite' }}>
      <rect x="3" y="14" width="12" height="8" rx="2" fill="#8B5CF6" />
      <text x="5" y="20" fill="white" fontSize="4" fontWeight="bold">Suj.</text>
      {/* Puzzle connector right */}
      <circle cx="15" cy="18" r="2" fill="#8B5CF6" />
    </g>
    <g style={{ animation: 'si-float 4s ease-in-out 0.3s infinite' }}>
      <rect x="18" y="14" width="12" height="8" rx="2" fill="#A78BFA" />
      <text x="20" y="20" fill="white" fontSize="4" fontWeight="bold">Ver.</text>
      {/* Puzzle connector left and right */}
      <circle cx="18" cy="18" r="2" fill="#A78BFA" />
      <circle cx="30" cy="18" r="2" fill="#A78BFA" />
    </g>
    <g style={{ animation: 'si-float 4s ease-in-out 0.6s infinite' }}>
      <rect x="33" y="14" width="12" height="8" rx="2" fill="#C4B5FD" />
      <text x="35" y="20" fill="#4C1D95" fontSize="4" fontWeight="bold">Obj.</text>
      <circle cx="33" cy="18" r="2" fill="#C4B5FD" />
    </g>
    {/* Bottom row – being assembled */}
    <g style={{ transformOrigin: '24px 34px', animation: 'si-swing 3s ease-in-out infinite' }}>
      <rect x="6" y="28" width="36" height="10" rx="3" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="0.8" />
      <text x="10" y="35" fill="#6D28D9" fontSize="4" fontWeight="bold" opacity="0.7">El gato come pez</text>
    </g>
    {/* Arrow down */}
    <path d="M24 9 L24 13" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" markerEnd="none"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <path d="M21 11 L24 14 L27 11" stroke="#8B5CF6" strokeWidth="1" fill="none" />
    {/* Sparkles */}
    <circle cx="4" cy="8" r="1.5" fill="#DDD6FE" style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }} />
    <circle cx="44" cy="10" r="1" fill="#C4B5FD" style={{ animation: 'si-bounce 3s ease-in-out 0.5s infinite' }} />
  </svg>
);

/* Pragmatica – Bocadillos de diálogo */
const Pragmatica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-prg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    {/* Person 1 silhouette */}
    <circle cx="10" cy="36" r="4" fill="#0E7490" opacity="0.5" />
    <rect x="7" y="40" width="6" height="6" rx="2" fill="#0E7490" opacity="0.4" />
    {/* Person 2 silhouette */}
    <circle cx="38" cy="36" r="4" fill="#0E7490" opacity="0.5" />
    <rect x="35" y="40" width="6" height="6" rx="2" fill="#0E7490" opacity="0.4" />
    {/* Speech bubble 1 – left */}
    <g style={{ transformOrigin: '16px 18px', animation: 'si-breathe 3s ease-in-out infinite' }}>
      <rect x="4" y="6" width="22" height="14" rx="5" fill="#ECFEFF" stroke="url(#si-prg)" strokeWidth="1" />
      <path d="M12 20 L9 26 L16 20" fill="#ECFEFF" stroke="#06B6D4" strokeWidth="1" strokeLinejoin="round" />
      <text x="8" y="15" fill="#0891B2" fontSize="4.5" fontWeight="bold">Hola!</text>
    </g>
    {/* Speech bubble 2 – right */}
    <g style={{ transformOrigin: '34px 22px', animation: 'si-breathe 3s ease-in-out 1s infinite' }}>
      <rect x="22" y="16" width="22" height="12" rx="5" fill="#CFFAFE" stroke="#06B6D4" strokeWidth="0.8" />
      <path d="M38 28 L40 32 L34 28" fill="#CFFAFE" stroke="#06B6D4" strokeWidth="0.8" strokeLinejoin="round" />
      <text x="26" y="24" fill="#0E7490" fontSize="4" fontWeight="bold">Genial!</text>
    </g>
    {/* Thought dots */}
    <circle cx="24" cy="4" r="1.5" fill="#67E8F9" style={{ animation: 'si-bounce 2s ease-in-out infinite' }} />
    <circle cx="44" cy="8" r="1" fill="#A5F3FC" style={{ animation: 'si-bounce 2.5s ease-in-out 0.5s infinite' }} />
  </svg>
);

/* ConcienciaFonologica – Ondas de sonido con sílabas */
const ConcienciaFonologica = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-fon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Ear shape */}
    <path d="M12 18 Q6 18 6 26 Q6 36 14 38 Q16 38 16 36 Q12 34 12 28 Q12 22 16 20"
      stroke="url(#si-fon)" strokeWidth="2" fill="#FFFBEB" strokeLinecap="round" />
    <circle cx="14" cy="28" r="3" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" />
    {/* Sound wave arcs */}
    <path d="M22 18 Q26 24 22 30" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 1.8s ease-in-out infinite' }} />
    <path d="M26 14 Q32 24 26 34" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 1.8s ease-in-out 0.3s infinite' }} />
    <path d="M30 10 Q38 24 30 38" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 1.8s ease-in-out 0.6s infinite' }} />
    {/* Syllable bubbles */}
    <g style={{ animation: 'si-float 3s ease-in-out infinite' }}>
      <rect x="34" y="8" width="10" height="7" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.7" />
      <text x="36" y="13" fill="#B45309" fontSize="4" fontWeight="bold">pa</text>
    </g>
    <g style={{ animation: 'si-float 3s ease-in-out 0.5s infinite' }}>
      <rect x="36" y="20" width="10" height="7" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.7" />
      <text x="38" y="25" fill="#B45309" fontSize="4" fontWeight="bold">la</text>
    </g>
    <g style={{ animation: 'si-float 3s ease-in-out 1s infinite' }}>
      <rect x="34" y="32" width="12" height="7" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.7" />
      <text x="36" y="37" fill="#B45309" fontSize="4" fontWeight="bold">bra</text>
    </g>
  </svg>
);

/* ALComprensionOral – Oído con check */
const ALComprensionOral = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-alco" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
    </defs>
    {/* Large ear */}
    <path d="M20 8 Q8 10 8 24 Q8 40 20 42 Q24 42 24 38 Q14 36 14 26 Q14 14 22 12"
      stroke="url(#si-alco)" strokeWidth="2.5" fill="#F0FDFA" strokeLinecap="round"
      style={{ transformOrigin: '16px 24px', animation: 'si-breathe 4s ease-in-out infinite' }} />
    <circle cx="20" cy="26" r="4" fill="#99F6E4" stroke="#0D9488" strokeWidth="1" />
    <circle cx="20" cy="26" r="1.5" fill="#14B8A6" />
    {/* Sound entering */}
    <path d="M30 20 Q34 24 30 28" stroke="#2DD4BF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <path d="M34 16 Q40 24 34 32" stroke="#5EEAD4" strokeWidth="1" strokeLinecap="round" fill="none"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.4s infinite' }} />
    {/* Checkmark – understanding */}
    <g style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }}>
      <circle cx="40" cy="10" r="5" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
      <path d="M37.5 10 L39 12 L43 7.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
    {/* Speech text lines */}
    <line x1="30" y1="38" x2="42" y2="38" stroke="#99F6E4" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'si-shimmer 3s ease-in-out infinite' }} />
    <line x1="32" y1="42" x2="40" y2="42" stroke="#99F6E4" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'si-shimmer 3s ease-in-out 0.5s infinite' }} />
  </svg>
);

/* ALLectoescritura – Lápiz escribiendo sobre líneas */
const ALLectoescritura = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-alle" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#BE123C" />
      </linearGradient>
    </defs>
    {/* Paper */}
    <rect x="6" y="4" width="30" height="40" rx="3" fill="white" stroke="#FDA4AF" strokeWidth="0.8" />
    <line x1="12" y1="4" x2="12" y2="44" stroke="#FECDD3" strokeWidth="0.6" />
    {/* Writing lines */}
    {[14, 20, 26, 32, 38].map((y, i) => (
      <line key={i} x1="14" y1={y} x2="34" y2={y} stroke="#FCE7F3" strokeWidth="0.8" />
    ))}
    {/* Handwritten text appearing */}
    <path d="M15 13 Q18 10 20 13 Q22 16 25 13" stroke="#E11D48" strokeWidth="1" fill="none"
      strokeDasharray="20" style={{ animation: 'si-draw 3s ease-in-out infinite' }} />
    <path d="M15 19 Q19 16 22 19 Q25 22 28 19" stroke="#F43F5E" strokeWidth="1" fill="none"
      strokeDasharray="20" style={{ animation: 'si-draw 3s ease-in-out 0.5s infinite' }} />
    <path d="M15 25 Q20 22 24 25" stroke="#FB7185" strokeWidth="1" fill="none"
      strokeDasharray="15" style={{ animation: 'si-draw 3s ease-in-out 1s infinite' }} />
    {/* Pencil – writing motion */}
    <g style={{ transformOrigin: '40px 36px', animation: 'si-swing 2s ease-in-out infinite' }}>
      <rect x="36" y="10" width="5" height="28" rx="1" fill="#FBBF24" transform="rotate(15 38 24)" />
      <polygon points="36,38 38,44 40,38" fill="#F59E0B" transform="rotate(15 38 24)" />
      <rect x="36" y="10" width="5" height="4" rx="1" fill="#FDE68A" transform="rotate(15 38 24)" />
      <line x1="38.5" y1="40" x2="38.5" y2="44" stroke="#92400E" strokeWidth="0.5" transform="rotate(15 38 24)" />
    </g>
    {/* Sparkle */}
    <circle cx="8" cy="8" r="1.5" fill="#FECDD3" style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }} />
  </svg>
);

/* ── PT: Pedagogía Terapéutica ───────────────────────────────── */

/* Atencion – Ojo con foco de luz */
const Atencion = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-ate" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <radialGradient id="si-ate-g" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#FEF2F2" />
        <stop offset="100%" stopColor="#FECACA" />
      </radialGradient>
    </defs>
    {/* Target rings */}
    <circle cx="24" cy="24" r="18" fill="none" stroke="#FECACA" strokeWidth="1"
      style={{ animation: 'si-breathe 3s ease-in-out infinite', transformOrigin: '24px 24px' }} />
    <circle cx="24" cy="24" r="13" fill="none" stroke="#FCA5A5" strokeWidth="1.2"
      style={{ animation: 'si-breathe 3s ease-in-out 0.3s infinite', transformOrigin: '24px 24px' }} />
    <circle cx="24" cy="24" r="8" fill="url(#si-ate-g)" stroke="#F87171" strokeWidth="1.5" />
    {/* Bullseye */}
    <circle cx="24" cy="24" r="3" fill="url(#si-ate)" />
    <circle cx="23" cy="23" r="1" fill="rgba(255,255,255,0.4)" />
    {/* Focus lines – pulsing */}
    <line x1="24" y1="2" x2="24" y2="6" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out infinite' }} />
    <line x1="24" y1="42" x2="24" y2="46" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 0.5s infinite' }} />
    <line x1="2" y1="24" x2="6" y2="24" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 1s infinite' }} />
    <line x1="42" y1="24" x2="46" y2="24" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'si-shimmer 2s ease-in-out 1.5s infinite' }} />
    {/* Sparkle hits */}
    <circle cx="24" cy="24" r="0" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8"
      style={{ animation: 'si-ripple 2s ease-out infinite' }} />
  </svg>
);

/* Memoria – Cerebro con engranajes */
const Memoria = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-mem" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* Brain shape */}
    <path d="M24 6 Q14 6 10 14 Q6 22 10 30 Q14 38 24 42 Q34 38 38 30 Q42 22 38 14 Q34 6 24 6"
      fill="#EDE9FE" stroke="url(#si-mem)" strokeWidth="1.5"
      style={{ transformOrigin: '24px 24px', animation: 'si-breathe 4s ease-in-out infinite' }} />
    {/* Brain fold */}
    <path d="M24 10 Q24 24 24 38" stroke="#C4B5FD" strokeWidth="1" />
    <path d="M14 16 Q20 20 14 26" stroke="#C4B5FD" strokeWidth="0.8" fill="none" />
    <path d="M34 16 Q28 20 34 26" stroke="#C4B5FD" strokeWidth="0.8" fill="none" />
    {/* Memory cards flipping */}
    <g style={{ transformOrigin: '14px 20px', animation: 'si-flip 3s ease-in-out infinite' }}>
      <rect x="11" y="17" width="6" height="6" rx="1" fill="#8B5CF6" />
      <text x="12.5" y="22" fill="white" fontSize="4" fontWeight="bold">?</text>
    </g>
    <g style={{ transformOrigin: '34px 20px', animation: 'si-flip 3s ease-in-out 0.5s infinite' }}>
      <rect x="31" y="17" width="6" height="6" rx="1" fill="#A78BFA" />
      <text x="32.5" y="22" fill="white" fontSize="4" fontWeight="bold">!</text>
    </g>
    {/* Lightning bolt – recall */}
    <path d="M22 28 L26 24 L23 24 L26 20" stroke="#F59E0B" strokeWidth="1.2" fill="none"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'si-flicker 3s ease-in-out infinite' }} />
    {/* Sparkles */}
    <circle cx="6" cy="12" r="1.5" fill="#DDD6FE" style={{ animation: 'si-bounce 2s ease-in-out infinite' }} />
    <circle cx="42" cy="14" r="1" fill="#C4B5FD" style={{ animation: 'si-bounce 2.5s ease-in-out 0.5s infinite' }} />
    <circle cx="8" cy="36" r="1" fill="#EDE9FE" style={{ animation: 'si-bounce 3s ease-in-out 1s infinite' }} />
  </svg>
);

/* FuncionesEjecutivas – Engranajes interconectados */
const FuncionesEjecutivas = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-fej" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    {/* Large gear */}
    <g style={{ transformOrigin: '18px 22px', animation: 'si-spin 8s linear infinite' }}>
      <circle cx="18" cy="22" r="10" fill="#DBEAFE" stroke="url(#si-fej)" strokeWidth="1.5" />
      <circle cx="18" cy="22" r="4" fill="#2563EB" />
      <circle cx="18" cy="22" r="2" fill="#DBEAFE" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <rect key={i} x="16" y="10" width="4" height="4" rx="0.5" fill="#3B82F6"
          transform={`rotate(${angle} 18 22)`} />
      ))}
    </g>
    {/* Small gear – counter-rotating */}
    <g style={{ transformOrigin: '34px 16px', animation: 'si-spin 5s linear infinite reverse' }}>
      <circle cx="34" cy="16" r="6" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.2" />
      <circle cx="34" cy="16" r="2.5" fill="#3B82F6" />
      <circle cx="34" cy="16" r="1" fill="#EFF6FF" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <rect key={i} x="33" y="9" width="2.5" height="2.5" rx="0.4" fill="#60A5FA"
          transform={`rotate(${angle} 34 16)`} />
      ))}
    </g>
    {/* Third gear */}
    <g style={{ transformOrigin: '36px 34px', animation: 'si-spin 6s linear infinite' }}>
      <circle cx="36" cy="34" r="7" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1" />
      <circle cx="36" cy="34" r="3" fill="#3B82F6" />
      <circle cx="36" cy="34" r="1.2" fill="#EFF6FF" />
      {[0, 51, 102, 153, 204, 255, 306].map((angle, i) => (
        <rect key={i} x="34.5" y="26" width="3" height="3" rx="0.4" fill="#60A5FA"
          transform={`rotate(${angle} 36 34)`} />
      ))}
    </g>
    {/* Lightbulb – idea */}
    <g style={{ animation: 'si-glow 3s ease-in-out infinite' }}>
      <circle cx="8" cy="40" r="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.8" />
      <line x1="8" y1="43" x2="8" y2="45" stroke="#F59E0B" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="6" y1="37" x2="5" y2="36" stroke="#FBBF24" strokeWidth="0.5" strokeLinecap="round" />
      <line x1="10" y1="37" x2="11" y2="36" stroke="#FBBF24" strokeWidth="0.5" strokeLinecap="round" />
    </g>
  </svg>
);

/* HabilidadesSociales – Personas conectadas con corazón */
const HabilidadesSociales = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-hs" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    {/* Person 1 */}
    <circle cx="12" cy="16" r="5" fill="#FDF2F8" stroke="url(#si-hs)" strokeWidth="1.2" />
    <circle cx="11" cy="15" r="1" fill="#EC4899" opacity="0.6" />
    <circle cx="14" cy="15" r="1" fill="#EC4899" opacity="0.6" />
    <path d="M10 18.5 Q12 20 14 18.5" stroke="#F472B6" strokeWidth="0.7" fill="none" />
    <path d="M8 22 Q6 26 6 32 L18 32 Q18 26 16 22" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="0.8" />
    {/* Person 2 */}
    <circle cx="36" cy="16" r="5" fill="#FDF2F8" stroke="url(#si-hs)" strokeWidth="1.2" />
    <circle cx="35" cy="15" r="1" fill="#EC4899" opacity="0.6" />
    <circle cx="38" cy="15" r="1" fill="#EC4899" opacity="0.6" />
    <path d="M34 18.5 Q36 20 38 18.5" stroke="#F472B6" strokeWidth="0.7" fill="none" />
    <path d="M32 22 Q30 26 30 32 L42 32 Q42 26 40 22" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="0.8" />
    {/* Connection line */}
    <path d="M18 24 Q24 20 30 24" stroke="#F9A8D4" strokeWidth="1" strokeDasharray="3 2" fill="none"
      style={{ animation: 'si-dash 4s linear infinite' }} />
    {/* Heart in center */}
    <g style={{ transformOrigin: '24px 18px', animation: 'si-breathe 2s ease-in-out infinite' }}>
      <path d="M24 21 Q24 16 21 16 Q18 16 18 19 Q18 22 24 26 Q30 22 30 19 Q30 16 27 16 Q24 16 24 21"
        fill="#F472B6" />
    </g>
    {/* Hands reaching */}
    <g style={{ animation: 'si-float 3s ease-in-out infinite' }}>
      <path d="M16 36 Q20 34 22 36 L22 42 L16 42 Z" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="0.6" />
      <path d="M32 36 Q28 34 26 36 L26 42 L32 42 Z" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="0.6" />
    </g>
    {/* Sparkles */}
    <circle cx="24" cy="6" r="1.5" fill="#FDE68A" style={{ animation: 'si-bounce 2s ease-in-out infinite' }} />
    <circle cx="4" cy="30" r="1" fill="#FBCFE8" style={{ animation: 'si-bounce 3s ease-in-out 0.5s infinite' }} />
    <circle cx="44" cy="30" r="1" fill="#FBCFE8" style={{ animation: 'si-bounce 2.5s ease-in-out 1s infinite' }} />
  </svg>
);

/* Razonamiento – Bombilla con puzzle */
const Razonamiento = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-raz" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Light bulb shape */}
    <path d="M24 4 Q12 4 12 18 Q12 26 18 30 L18 36 L30 36 L30 30 Q36 26 36 18 Q36 4 24 4"
      fill="#FFFBEB" stroke="url(#si-raz)" strokeWidth="1.5"
      style={{ animation: 'si-glow 3s ease-in-out infinite' }} />
    {/* Bulb base */}
    <rect x="18" y="36" width="12" height="3" rx="1" fill="#F59E0B" />
    <rect x="19" y="39" width="10" height="2" rx="1" fill="#D97706" />
    <rect x="20" y="41" width="8" height="2" rx="1" fill="#B45309" />
    <path d="M22 43 Q24 45 26 43" stroke="#92400E" strokeWidth="0.8" fill="none" />
    {/* Puzzle pieces inside bulb */}
    <g style={{ transformOrigin: '21px 18px', animation: 'si-rock 3s ease-in-out infinite' }}>
      <rect x="16" y="14" width="8" height="8" rx="1" fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.6" />
      <circle cx="20" cy="14" r="2" fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.6" />
    </g>
    <g style={{ transformOrigin: '29px 18px', animation: 'si-rock 3s ease-in-out 0.5s infinite' }}>
      <rect x="25" y="14" width="8" height="8" rx="1" fill="#FDE68A" stroke="#FBBF24" strokeWidth="0.6" />
      <circle cx="25" cy="18" r="2" fill="#FDE68A" stroke="#FBBF24" strokeWidth="0.6" />
    </g>
    {/* Rays from bulb */}
    {[0, 45, 90, 135, 180].map((angle, i) => (
      <line key={i} x1="24" y1="0" x2="24" y2="3" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round"
        transform={`rotate(${angle - 90} 24 18)`}
        style={{ animation: `si-shimmer 2s ease-in-out ${i * 0.3}s infinite` }} />
    ))}
    {/* Sparkles */}
    <circle cx="6" cy="10" r="1.5" fill="#FDE68A" style={{ animation: 'si-bounce 2s ease-in-out infinite' }} />
    <circle cx="42" cy="12" r="1" fill="#FCD34D" style={{ animation: 'si-bounce 2.5s ease-in-out 0.5s infinite' }} />
  </svg>
);

/* Autonomia – Casa con persona y checklist */
const Autonomia = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-aut" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* House */}
    <path d="M24 6 L4 22 L10 22 L10 40 L38 40 L38 22 L44 22 Z" fill="#ECFDF5" stroke="url(#si-aut)" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Door */}
    <rect x="20" y="28" width="8" height="12" rx="1" fill="#D1FAE5" stroke="#10B981" strokeWidth="0.8" />
    <circle cx="26" cy="34" r="1" fill="#059669" />
    {/* Window */}
    <rect x="12" y="24" width="6" height="6" rx="1" fill="#A7F3D0" stroke="#10B981" strokeWidth="0.6" />
    <line x1="15" y1="24" x2="15" y2="30" stroke="#10B981" strokeWidth="0.4" />
    <line x1="12" y1="27" x2="18" y2="27" stroke="#10B981" strokeWidth="0.4" />
    {/* Checklist floating */}
    <g style={{ animation: 'si-float 3s ease-in-out infinite' }}>
      <rect x="32" y="6" width="14" height="16" rx="2" fill="white" stroke="#10B981" strokeWidth="0.8" />
      <path d="M35 10 L37 12 L40 8" stroke="#059669" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M35 15 L37 17 L40 13" stroke="#059669" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"
        style={{ animation: 'si-shimmer 2s ease-in-out 0.5s infinite' }} />
      <line x1="35" y1="20" x2="40" y2="20" stroke="#A7F3D0" strokeWidth="0.8" />
    </g>
    {/* Star – achievement */}
    <g style={{ animation: 'si-bounce 2.5s ease-in-out infinite' }}>
      <polygon points="8,8 9.5,5 11,8 14,8.5 11.5,10.5 12.5,14 8,11.5 3.5,14 4.5,10.5 2,8.5"
        fill="#FCD34D" stroke="#F59E0B" strokeWidth="0.4" />
    </g>
  </svg>
);

/* LectoescrituraAdaptada – Libro con lupa y letras grandes */
const LectoescrituraAdaptada = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="si-lea" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    {/* Open book */}
    <path d="M24 12 Q14 10 4 14 L4 38 Q14 34 24 36 Q34 34 44 38 L44 14 Q34 10 24 12 Z"
      fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="0.8" />
    <line x1="24" y1="12" x2="24" y2="36" stroke="#C7D2FE" strokeWidth="0.6" />
    {/* Large letters on pages */}
    <text x="10" y="24" fill="#4F46E5" fontSize="10" fontWeight="bold" opacity="0.7"
      style={{ animation: 'si-breathe 3s ease-in-out infinite', transformOrigin: '14px 22px' }}>A</text>
    <text x="28" y="24" fill="#6366F1" fontSize="10" fontWeight="bold" opacity="0.7"
      style={{ animation: 'si-breathe 3s ease-in-out 0.5s infinite', transformOrigin: '32px 22px' }}>b</text>
    {/* Guide lines – dashed */}
    <line x1="8" y1="28" x2="20" y2="28" stroke="#A5B4FC" strokeWidth="0.5" strokeDasharray="2 1" />
    <line x1="8" y1="32" x2="18" y2="32" stroke="#A5B4FC" strokeWidth="0.5" strokeDasharray="2 1" />
    <line x1="28" y1="28" x2="40" y2="28" stroke="#A5B4FC" strokeWidth="0.5" strokeDasharray="2 1" />
    {/* Magnifying glass */}
    <g style={{ transformOrigin: '38px 10px', animation: 'si-swing 3s ease-in-out infinite' }}>
      <circle cx="36" cy="10" r="6" fill="rgba(238,242,255,0.8)" stroke="url(#si-lea)" strokeWidth="1.5" />
      <line x1="40" y1="14" x2="44" y2="20" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
      {/* Magnified letter inside */}
      <text x="33" y="13" fill="#4F46E5" fontSize="8" fontWeight="bold" opacity="0.6">a</text>
    </g>
    {/* Stars */}
    <circle cx="4" cy="8" r="1.5" fill="#FDE68A" style={{ animation: 'si-bounce 2s ease-in-out infinite' }} />
    <circle cx="20" cy="6" r="1" fill="#C7D2FE" style={{ animation: 'si-bounce 3s ease-in-out 0.5s infinite' }} />
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
  'filosofia':          { Component: Filosofia, glow: 'rgba(124,58,237,0.35)' },
  'historia-mundo':     { Component: HistoriaMundo, glow: 'rgba(37,99,235,0.35)' },
  'historia-espana':    { Component: HistoriaEspana, glow: 'rgba(220,38,38,0.35)' },
  'dibujo-tecnico':     { Component: DibujoTecnico, glow: 'rgba(71,85,105,0.35)' },
  'literatura-universal': { Component: LiteraturaUniversal, glow: 'rgba(190,24,93,0.35)' },
  'economia-empresa':   { Component: EconomiaEmpresa, glow: 'rgba(4,120,87,0.35)' },
  'geografia':          { Component: Geografia, glow: 'rgba(13,148,136,0.35)' },
  'arte':               { Component: Arte, glow: 'rgba(147,51,234,0.35)' },
  'quimica':            { Component: Quimica, glow: 'rgba(124,58,237,0.35)' },
  // AL – Audición y Lenguaje
  'articulacion':       { Component: Articulacion, glow: 'rgba(234,88,12,0.35)' },
  'vocabulario':        { Component: ALVocabulario, glow: 'rgba(219,39,119,0.35)' },
  'morfosintaxis':      { Component: Morfosintaxis, glow: 'rgba(124,58,237,0.35)' },
  'pragmatica':         { Component: Pragmatica, glow: 'rgba(6,182,212,0.35)' },
  'conciencia-fonologica': { Component: ConcienciaFonologica, glow: 'rgba(217,119,6,0.35)' },
  'comprension-oral':   { Component: ALComprensionOral, glow: 'rgba(13,148,136,0.35)' },
  'lectoescritura':     { Component: ALLectoescritura, glow: 'rgba(225,29,72,0.35)' },
  // PT – Pedagogía Terapéutica
  'atencion':           { Component: Atencion, glow: 'rgba(239,68,68,0.35)' },
  'memoria':            { Component: Memoria, glow: 'rgba(124,58,237,0.35)' },
  'funciones-ejecutivas': { Component: FuncionesEjecutivas, glow: 'rgba(37,99,235,0.35)' },
  'habilidades-sociales': { Component: HabilidadesSociales, glow: 'rgba(236,72,153,0.35)' },
  'razonamiento':       { Component: Razonamiento, glow: 'rgba(245,158,11,0.35)' },
  'autonomia':          { Component: Autonomia, glow: 'rgba(16,185,129,0.35)' },
  'lectoescritura-adaptada': { Component: LectoescrituraAdaptada, glow: 'rgba(99,102,241,0.35)' },
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
