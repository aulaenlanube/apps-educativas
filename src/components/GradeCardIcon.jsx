import React, { useEffect } from 'react';

/* ── CSS: minimal keyframes + hover transitions ─────────────── */
let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
    @keyframes gc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes gc-twinkle{0%,100%{opacity:0;transform:scale(0.5)}50%{opacity:1;transform:scale(1)}}
    @keyframes gc-orbit{0%{transform:rotate(0deg) translateX(18px) rotate(0deg)}100%{transform:rotate(360deg) translateX(18px) rotate(-360deg)}}
    @keyframes gc-orbit2{0%{transform:rotate(120deg) translateX(20px) rotate(-120deg)}100%{transform:rotate(480deg) translateX(20px) rotate(-480deg)}}
    @keyframes gc-orbit3{0%{transform:rotate(240deg) translateX(15px) rotate(-240deg)}100%{transform:rotate(600deg) translateX(15px) rotate(-600deg)}}
    @keyframes gc-needle{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
    @keyframes gc-tassel{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    @keyframes gc-flame{0%,100%{opacity:0.75}50%{opacity:1}}

    .gc-icon{animation:gc-float 4.5s ease-in-out infinite}
    .gc-icon-inner{transition:transform 0.55s cubic-bezier(0.34,1.56,0.64,1),filter 0.55s ease}

    .group:hover .gc-star .gc-icon-inner{transform:rotate(15deg);filter:drop-shadow(0 0 14px rgba(255,220,50,0.55))}
    .group:hover .gc-palette .gc-icon-inner{transform:rotate(-12deg);filter:drop-shadow(0 0 12px rgba(220,80,255,0.45))}
    .group:hover .gc-rocket .gc-icon-inner{transform:translateY(-12px);filter:drop-shadow(0 0 14px rgba(255,140,20,0.55))}
    .group:hover .gc-compass .gc-icon-inner{transform:rotate(20deg);filter:drop-shadow(0 0 12px rgba(255,255,255,0.45))}
    .group:hover .gc-trophy .gc-icon-inner{transform:translateY(-10px);filter:drop-shadow(0 0 14px rgba(255,210,50,0.55))}
    .group:hover .gc-diamond .gc-icon-inner{transform:rotate(-15deg) scale(1.06);filter:drop-shadow(0 0 16px rgba(100,160,255,0.55))}
    .group:hover .gc-microscope .gc-icon-inner{transform:rotate(6deg) translateY(-5px);filter:drop-shadow(0 0 12px rgba(46,213,115,0.45))}
    .group:hover .gc-book .gc-icon-inner{transform:rotate(-8deg);filter:drop-shadow(0 0 12px rgba(160,100,255,0.45))}
    .group:hover .gc-atom .gc-icon-inner{transform:scale(1.12);filter:drop-shadow(0 0 16px rgba(56,189,248,0.55))}
    .group:hover .gc-gradcap .gc-icon-inner{transform:translateY(-12px) rotate(-10deg);filter:drop-shadow(0 0 14px rgba(255,210,50,0.55))}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
};

/* ── Particles (lightweight – twinkle only, no movement) ───── */
const particleConfigs = {
  'primaria-1': [
    { shape: 'star4', x: 6, y: 10, size: 6, delay: 0, dur: 3, color: 'rgba(255,255,100,0.7)' },
    { shape: 'circle', x: 90, y: 16, size: 4, delay: 1.2, dur: 2.8, color: 'rgba(255,255,255,0.6)' },
    { shape: 'star4', x: 8, y: 80, size: 5, delay: 2, dur: 3.2, color: 'rgba(255,220,100,0.5)' },
  ],
  'primaria-2': [
    { shape: 'circle', x: 5, y: 20, size: 7, delay: 0, dur: 2.5, color: 'rgba(255,80,80,0.5)' },
    { shape: 'circle', x: 90, y: 14, size: 5, delay: 0.8, dur: 3, color: 'rgba(80,180,255,0.5)' },
    { shape: 'circle', x: 8, y: 78, size: 6, delay: 1.5, dur: 2.8, color: 'rgba(80,255,130,0.45)' },
  ],
  'primaria-3': [
    { shape: 'star4', x: 6, y: 26, size: 5, delay: 0, dur: 2.2, color: 'rgba(255,255,255,0.6)' },
    { shape: 'star4', x: 90, y: 14, size: 4, delay: 0.8, dur: 2.8, color: 'rgba(255,255,255,0.45)' },
    { shape: 'circle', x: 10, y: 70, size: 3, delay: 1.5, dur: 2.5, color: 'rgba(255,200,50,0.45)' },
  ],
  'primaria-4': [
    { shape: 'diamond', x: 5, y: 16, size: 5, delay: 0.5, dur: 3, color: 'rgba(255,255,255,0.45)' },
    { shape: 'circle', x: 92, y: 20, size: 4, delay: 0, dur: 2.8, color: 'rgba(255,80,80,0.4)' },
    { shape: 'diamond', x: 88, y: 72, size: 4, delay: 1.5, dur: 2.5, color: 'rgba(255,220,100,0.4)' },
  ],
  'primaria-5': [
    { shape: 'star4', x: 3, y: 10, size: 6, delay: 0, dur: 2.5, color: 'rgba(255,240,80,0.65)' },
    { shape: 'star4', x: 94, y: 8, size: 5, delay: 0.8, dur: 3, color: 'rgba(255,255,150,0.55)' },
    { shape: 'diamond', x: 5, y: 74, size: 4, delay: 1.5, dur: 2.8, color: 'rgba(255,220,50,0.4)' },
  ],
  'primaria-6': [
    { shape: 'diamond', x: 5, y: 14, size: 5, delay: 0, dur: 3, color: 'rgba(180,220,255,0.55)' },
    { shape: 'diamond', x: 92, y: 18, size: 4, delay: 1, dur: 2.8, color: 'rgba(200,180,255,0.5)' },
    { shape: 'star4', x: 3, y: 72, size: 4, delay: 0.5, dur: 3.5, color: 'rgba(255,255,255,0.4)' },
  ],
  'eso-1': [
    { shape: 'circle', x: 5, y: 14, size: 4, delay: 0, dur: 2.5, color: 'rgba(100,255,180,0.5)' },
    { shape: 'circle', x: 92, y: 26, size: 3, delay: 1, dur: 3, color: 'rgba(100,200,255,0.45)' },
    { shape: 'circle', x: 8, y: 78, size: 3, delay: 0.5, dur: 2.8, color: 'rgba(255,200,100,0.4)' },
  ],
  'eso-2': [
    { shape: 'diamond', x: 5, y: 16, size: 4, delay: 0, dur: 3, color: 'rgba(255,255,255,0.4)' },
    { shape: 'circle', x: 90, y: 12, size: 3, delay: 0.8, dur: 2.5, color: 'rgba(200,150,255,0.45)' },
    { shape: 'star4', x: 88, y: 72, size: 4, delay: 1.2, dur: 2.8, color: 'rgba(255,255,200,0.35)' },
  ],
  'eso-3': [
    { shape: 'circle', x: 3, y: 12, size: 3, delay: 0, dur: 2, color: 'rgba(56,189,248,0.45)' },
    { shape: 'circle', x: 94, y: 16, size: 3, delay: 0.6, dur: 2.5, color: 'rgba(244,114,182,0.45)' },
    { shape: 'circle', x: 5, y: 80, size: 3, delay: 1.2, dur: 2.2, color: 'rgba(52,211,153,0.4)' },
  ],
  'eso-4': [
    { shape: 'star4', x: 5, y: 16, size: 4, delay: 0, dur: 2.5, color: 'rgba(255,240,80,0.5)' },
    { shape: 'diamond', x: 92, y: 12, size: 4, delay: 1, dur: 3, color: 'rgba(255,255,200,0.45)' },
    { shape: 'star4', x: 8, y: 76, size: 3, delay: 0.5, dur: 2.8, color: 'rgba(255,220,100,0.4)' },
  ],
};

const ParticleShape = ({ shape, x, y, size, delay, dur, color }) => (
  <div style={{
    position: 'absolute', left: `${x}%`, top: `${y}%`,
    opacity: 0, animation: `gc-twinkle ${dur}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
  }}>
    <svg width={size * 2} height={size * 2} viewBox="0 0 10 10">
      {shape === 'circle' && <circle cx="5" cy="5" r="4" fill={color} />}
      {shape === 'star4' && <path d="M5 0 L6.5 3.5 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 3.5 Z" fill={color} />}
      {shape === 'diamond' && <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color} />}
    </svg>
  </div>
);

const Particles = ({ type, grade }) => {
  const config = particleConfigs[`${type}-${grade}`] || [];
  return config.map((p, i) => <ParticleShape key={i} {...p} />);
};

/* ── SVG Icons (static idle – no inline animations except essentials) ── */

/* 1º Primaria – Estrella mágica */
const Star = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="sg1" cx="0.4" cy="0.35" r="0.6">
        <stop offset="0%" stopColor="#FFF7AE" />
        <stop offset="60%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#F0A500" />
      </radialGradient>
      <radialGradient id="sg2" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(255,255,200,0.5)" />
        <stop offset="100%" stopColor="rgba(255,200,50,0)" />
      </radialGradient>
    </defs>
    <circle cx="38" cy="36" r="28" fill="url(#sg2)" />
    <path d="M40 9 L46.5 25.5 L64 26 L50.5 37 L55 54 L40 44.5 L25 54 L29.5 37 L16 26 L33.5 25.5 Z"
      fill="rgba(0,0,0,0.08)" transform="translate(1.5,1.5)" />
    <path d="M40 8 L46.5 25 L64.5 25.5 L50 37 L55 55 L40 44 L25 55 L30 37 L15.5 25.5 L33.5 25 Z"
      fill="url(#sg1)" stroke="#FFE566" strokeWidth="0.8" />
    <path d="M40 16 L43.5 27 L54 27.5 L46 34 L49 46 L40 39 L31 46 L34 34 L26 27.5 L36.5 27 Z"
      fill="rgba(255,255,255,0.35)" />
    <circle cx="40" cy="34" r="4" fill="rgba(255,255,255,0.5)" />
    <circle cx="40" cy="34" r="2" fill="rgba(255,255,255,0.7)" />
    <line x1="40" y1="18" x2="40" y2="28" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
    <line x1="33" y1="32" x2="40" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    <line x1="47" y1="32" x2="40" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    {/* Wand */}
    <g style={{ transformOrigin: '56px 54px' }}>
      <rect x="54" y="50" width="3.5" height="26" rx="1.8" fill="rgba(255,255,255,0.85)" transform="rotate(35 56 62)" />
      <rect x="54.5" y="51" width="1.5" height="22" rx="0.8" fill="rgba(255,255,255,0.2)" transform="rotate(35 56 62)" />
      <rect x="54" y="55" width="3.5" height="2" rx="1" fill="rgba(200,160,50,0.5)" transform="rotate(35 56 62)" />
      <rect x="54" y="62" width="3.5" height="2" rx="1" fill="rgba(200,160,50,0.5)" transform="rotate(35 56 62)" />
      <circle cx="72" cy="72" r="3.5" fill="rgba(255,255,200,0.5)" />
      <circle cx="72" cy="72" r="1.5" fill="rgba(255,255,255,0.8)" />
    </g>
    {/* Fixed sparkles */}
    <circle cx="16" cy="14" r="2" fill="#FFF7AE" opacity="0.6" />
    <circle cx="68" cy="50" r="1.8" fill="#FFE566" opacity="0.5" />
    <circle cx="66" cy="12" r="2.5" fill="#FFF7AE" opacity="0.5" />
    <circle cx="12" cy="52" r="2" fill="#FFE566" opacity="0.4" />
  </svg>
);

/* 2º Primaria – Paleta con pincel */
const Palette = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="pg" cx="0.4" cy="0.38" r="0.65">
        <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
        <stop offset="80%" stopColor="rgba(240,238,230,0.95)" />
        <stop offset="100%" stopColor="rgba(220,218,210,0.9)" />
      </radialGradient>
    </defs>
    <ellipse cx="39" cy="44" rx="30" ry="26" fill="rgba(0,0,0,0.08)" transform="rotate(-10 39 44)" />
    <ellipse cx="38" cy="42" rx="30" ry="26" fill="url(#pg)" transform="rotate(-10 38 42)" />
    <ellipse cx="38" cy="42" rx="30" ry="26" fill="none" stroke="rgba(200,195,180,0.5)" strokeWidth="1" transform="rotate(-10 38 42)" />
    <ellipse cx="38" cy="42" rx="24" ry="20" fill="none" stroke="rgba(180,170,150,0.1)" strokeWidth="0.5" transform="rotate(-10 38 42)" />
    <ellipse cx="30" cy="52" rx="7" ry="6" fill="rgba(0,0,0,0.15)" />
    {/* Paint blobs */}
    <circle cx="22" cy="27" r="6.5" fill="#E53E3E" />
    <circle cx="20.5" cy="25" r="2.5" fill="rgba(255,255,255,0.35)" />
    <circle cx="36" cy="21" r="6" fill="#3182CE" />
    <circle cx="34.5" cy="19" r="2.2" fill="rgba(255,255,255,0.35)" />
    <circle cx="52" cy="25" r="6.5" fill="#ECC94B" />
    <circle cx="50" cy="23" r="2.5" fill="rgba(255,255,255,0.4)" />
    <circle cx="57" cy="40" r="5.5" fill="#38A169" />
    <circle cx="55.5" cy="38" r="2" fill="rgba(255,255,255,0.3)" />
    <circle cx="49" cy="54" r="5" fill="#805AD5" />
    <circle cx="47.5" cy="52" r="1.8" fill="rgba(255,255,255,0.3)" />
    {/* Paint smears */}
    <path d="M28 27 Q32 22 36 21" stroke="rgba(200,60,60,0.2)" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M42 22 Q47 21 52 25" stroke="rgba(50,130,206,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Brush */}
    <g style={{ transformOrigin: '66px 18px' }}>
      <rect x="60" y="4" width="5" height="34" rx="2.5" fill="rgba(255,255,255,0.85)" transform="rotate(16 62 21)" />
      <rect x="61" y="5" width="1.8" height="30" rx="0.9" fill="rgba(255,255,255,0.2)" transform="rotate(16 62 21)" />
      <rect x="59.5" y="4" width="6" height="3" rx="1" fill="rgba(200,200,210,0.7)" transform="rotate(16 62 6)" />
      <rect x="58" y="0" width="9" height="8" rx="2" fill="#E53E3E" transform="rotate(16 62 4)" />
      <rect x="59" y="1" width="3" height="5" rx="1" fill="rgba(255,255,255,0.2)" transform="rotate(16 61 4)" />
    </g>
  </svg>
);

/* 3º Primaria – Cohete */
const Rocket = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
        <stop offset="50%" stopColor="rgba(245,245,250,0.96)" />
        <stop offset="100%" stopColor="rgba(220,225,235,0.92)" />
      </linearGradient>
    </defs>
    {/* Exhaust trail */}
    <line x1="36" y1="70" x2="32" y2="78" stroke="rgba(255,180,30,0.12)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="40" y1="72" x2="40" y2="80" stroke="rgba(255,180,30,0.1)" strokeWidth="1" strokeLinecap="round" />
    <line x1="44" y1="70" x2="48" y2="78" stroke="rgba(255,180,30,0.12)" strokeWidth="1.5" strokeLinecap="round" />
    {/* Shadow */}
    <path d="M41 6 Q51 19 51 43 L46 55 L36 55 L31 43 Q31 19 41 6 Z" fill="rgba(0,0,0,0.06)" />
    {/* Body */}
    <path d="M40 4 Q51 18 51 42 L45 55 L35 55 L29 42 Q29 18 40 4 Z" fill="url(#rg)" />
    <path d="M40 6 L40 52" stroke="rgba(200,210,225,0.3)" strokeWidth="0.5" />
    <path d="M40 6 Q35 18 34 42 L35 50 L40 8 Z" fill="rgba(255,255,255,0.15)" />
    {/* Rivets */}
    {[18, 28, 36].map(y => (
      <g key={`rv${y}`}>
        <circle cx="33" cy={y} r="0.8" fill="rgba(180,190,200,0.4)" />
        <circle cx="47" cy={y} r="0.8" fill="rgba(180,190,200,0.4)" />
      </g>
    ))}
    {/* Main window */}
    <circle cx="40" cy="22" r="7" fill="#2563EB" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
    <circle cx="40" cy="22" r="5" fill="#3B82F6" />
    <circle cx="38" cy="20" r="2.5" fill="rgba(255,255,255,0.5)" />
    <circle cx="42" cy="24" r="1" fill="rgba(255,255,255,0.2)" />
    {/* Small porthole */}
    <circle cx="40" cy="35" r="3" fill="rgba(59,130,246,0.4)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    <circle cx="39" cy="34" r="1" fill="rgba(255,255,255,0.3)" />
    {/* Nose cone stripes */}
    <path d="M35 12 Q40 7 45 12" stroke="#FF4757" strokeWidth="2.5" fill="none" />
    <path d="M37 15 Q40 12 43 15" stroke="#FF4757" strokeWidth="1.5" fill="none" opacity="0.5" />
    {/* Fins */}
    <path d="M29 36 L17 54 L29 49 Z" fill="#FF4757" />
    <path d="M51 36 L63 54 L51 49 Z" fill="#FF4757" />
    <path d="M29 36 L20 52 L27 48 Z" fill="rgba(255,255,255,0.15)" />
    <path d="M51 36 L58 52 L53 48 Z" fill="rgba(0,0,0,0.08)" />
    {/* Engine nozzle */}
    <path d="M35 52 L33 56 L47 56 L45 52" fill="rgba(180,190,200,0.7)" />
    {/* Flames – gentle idle opacity pulse */}
    <g style={{ animation: 'gc-flame 1.5s ease-in-out infinite' }}>
      <ellipse cx="40" cy="66" rx="8" ry="12" fill="rgba(255,170,20,0.7)" />
      <ellipse cx="40" cy="64" rx="6" ry="9" fill="#FF6B35" opacity="0.85" />
      <ellipse cx="40" cy="62" rx="3.5" ry="6" fill="#FFBA08" />
      <ellipse cx="40" cy="60" rx="1.8" ry="4" fill="rgba(255,255,220,0.9)" />
    </g>
    {/* Stars */}
    <circle cx="10" cy="14" r="1.5" fill="rgba(255,255,255,0.6)" />
    <circle cx="70" cy="10" r="2" fill="rgba(255,255,255,0.5)" />
    <circle cx="12" cy="60" r="1.2" fill="rgba(255,255,255,0.4)" />
    <circle cx="68" cy="44" r="1" fill="rgba(255,255,255,0.3)" />
  </svg>
);

/* 4º Primaria – Brújula */
const Compass = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="cg1" cx="0.45" cy="0.42" r="0.55">
        <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
      </radialGradient>
    </defs>
    {/* Outer bezel */}
    <circle cx="41" cy="41" r="33" fill="rgba(0,0,0,0.06)" />
    <circle cx="40" cy="40" r="33" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.9)" strokeWidth="2.8" />
    <circle cx="40" cy="40" r="29" fill="url(#cg1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    {/* Degree marks */}
    {Array.from({ length: 36 }, (_, i) => i * 10).map(deg => (
      <line key={deg} x1="40" y1={deg % 30 === 0 ? 9 : 11} x2="40" y2={deg % 30 === 0 ? 14 : 13}
        stroke={`rgba(255,255,255,${deg % 30 === 0 ? 0.6 : 0.25})`}
        strokeWidth={deg % 30 === 0 ? 1.2 : 0.6}
        transform={`rotate(${deg} 40 40)`} />
    ))}
    {/* Cardinal marks */}
    <text x="40" y="22" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="7" fontWeight="bold" fontFamily="sans-serif">N</text>
    <text x="40" y="64" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="sans-serif">S</text>
    <text x="18" y="43" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="sans-serif">O</text>
    <text x="62" y="43" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="sans-serif">E</text>
    {/* Intercardinals */}
    <text x="55" y="29" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">NE</text>
    <text x="25" y="29" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">NO</text>
    <text x="55" y="57" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">SE</text>
    <text x="25" y="57" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">SO</text>
    {/* Rose of winds */}
    <g opacity="0.12">
      <polygon points="40,18 43,37 40,35 37,37" fill="white" />
      <polygon points="40,62 43,43 40,45 37,43" fill="white" />
      <polygon points="18,40 37,37 35,40 37,43" fill="white" />
      <polygon points="62,40 43,37 45,40 43,43" fill="white" />
    </g>
    {/* Needle – gentle sway */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-needle 6s ease-in-out infinite' }}>
      <polygon points="40,13 44,38 40,35 36,38" fill="#FF4757" />
      <polygon points="40,13 42,38 40,35" fill="#FF6B7A" />
      <polygon points="40,67 44,42 40,45 36,42" fill="rgba(255,255,255,0.75)" />
      <polygon points="40,67 42,42 40,45" fill="rgba(255,255,255,0.2)" />
    </g>
    {/* Center hub */}
    <circle cx="40" cy="40" r="5" fill="rgba(255,255,255,0.92)" />
    <circle cx="40" cy="40" r="3.5" fill="rgba(200,200,210,0.3)" />
    <circle cx="40" cy="40" r="2" fill="rgba(0,0,0,0.12)" />
    <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.6)" />
    {/* Glass reflection */}
    <path d="M20 25 Q28 18 40 16" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

/* 5º Primaria – Trofeo */
const TrophyIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="tg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE566" />
        <stop offset="40%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#E6A800" />
      </linearGradient>
      <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE566" />
        <stop offset="100%" stopColor="#CC8800" />
      </linearGradient>
    </defs>
    <ellipse cx="40" cy="34" rx="22" ry="20" fill="rgba(255,220,50,0.06)" />
    <path d="M23 15 L25 45 Q27 55 41 55 Q55 55 57 45 L59 15 Z" fill="rgba(0,0,0,0.06)" />
    <path d="M22 13 L24 44 Q26 54 40 54 Q54 54 56 44 L58 13 Z" fill="url(#tg1)" />
    <path d="M26 15 L27 42 Q28 50 36 52 L34 15 Z" fill="rgba(255,255,255,0.22)" />
    <path d="M28 20 Q40 16 52 20" stroke="rgba(200,160,0,0.25)" strokeWidth="0.6" fill="none" />
    <path d="M27 38 Q40 42 53 38" stroke="rgba(200,160,0,0.2)" strokeWidth="0.6" fill="none" />
    {/* Rim */}
    <rect x="19" y="11" width="42" height="5" rx="2.5" fill="#FFE566" />
    <rect x="21" y="12" width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.35)" />
    {/* Handles */}
    <path d="M22 19 Q8 19 8 32 Q8 45 22 42" stroke="url(#tg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M58 19 Q72 19 72 32 Q72 45 58 42" stroke="url(#tg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M22 20 Q10 20 10 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Stem + Base */}
    <rect x="35" y="54" width="10" height="10" rx="2" fill="url(#tg2)" />
    <rect x="36" y="55" width="4" height="8" rx="1" fill="rgba(255,255,255,0.18)" />
    <rect x="25" y="64" width="30" height="4" rx="2" fill="#E6A800" />
    <rect x="23" y="67" width="34" height="5" rx="2.5" fill="#FFD700" />
    <rect x="25" y="68" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    {/* Star emblem */}
    <path d="M40 22 L42.5 29 L50 29 L44 34 L46 41 L40 36 L34 41 L36 34 L30 29 L37.5 29 Z"
      fill="rgba(255,255,255,0.45)" />
    <path d="M40 24 L41.5 29 L47 29.5 L43 33 L44 39 L40 35.5 L36 39 L37 33 L33 29.5 L38.5 29 Z"
      fill="rgba(255,255,255,0.15)" />
    <circle cx="40" cy="32" r="13" fill="none" stroke="rgba(200,160,0,0.15)" strokeWidth="0.5" />
  </svg>
);

/* 6º Primaria – Diamante */
const Diamond = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="dg1" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <ellipse cx="40" cy="50" rx="18" ry="10" fill="rgba(96,165,250,0.08)" />
    <polygon points="41,6 65,29 41,76 17,29" fill="rgba(0,0,0,0.06)" />
    <polygon points="40,4 66,28 40,76 14,28" fill="url(#dg1)" />
    {/* Crown facets */}
    <polygon points="40,4 54,28 40,28" fill="#A5C8FD" />
    <polygon points="40,4 26,28 40,28" fill="#8BB8FC" />
    <polygon points="40,4 66,28 54,28" fill="#5B9DF8" />
    <polygon points="40,4 14,28 26,28" fill="#78AEF9" />
    {/* Pavilion facets */}
    <polygon points="40,76 54,28 40,28" fill="#4B8DF8" />
    <polygon points="40,76 26,28 40,28" fill="#5F9CF7" />
    <polygon points="40,76 66,28 54,28" fill="#2B6CE6" />
    <polygon points="40,76 14,28 26,28" fill="#5B93F5" />
    {/* Facet lines */}
    <line x1="40" y1="4" x2="40" y2="28" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    <line x1="40" y1="28" x2="40" y2="76" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="14" y1="28" x2="40" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
    <line x1="66" y1="28" x2="40" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
    {/* Girdle */}
    <polyline points="14,28 26,28 40,28 54,28 66,28" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
    {/* Highlight facets */}
    <polygon points="28,14 40,28 33,28" fill="rgba(255,255,255,0.4)" />
    <polygon points="40,4 50,20 46,28 40,28" fill="rgba(255,255,255,0.2)" />
    {/* Prismatic refraction */}
    <line x1="28" y1="14" x2="8" y2="4" stroke="rgba(255,100,100,0.25)" strokeWidth="1" strokeLinecap="round" />
    <line x1="30" y1="16" x2="12" y2="10" stroke="rgba(100,255,100,0.2)" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="32" y1="18" x2="16" y2="16" stroke="rgba(100,100,255,0.2)" strokeWidth="0.8" strokeLinecap="round" />
    {/* Outline */}
    <polygon points="40,4 66,28 40,76 14,28" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Sparkle flare */}
    <g>
      <line x1="30" y1="12" x2="24" y2="6" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <line x1="30" y1="12" x2="36" y2="6" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <line x1="30" y1="12" x2="24" y2="12" stroke="white" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
      <line x1="30" y1="12" x2="30" y2="6" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </g>
    <circle cx="68" cy="12" r="2.2" fill="white" opacity="0.45" />
    <circle cx="12" cy="46" r="1.5" fill="white" opacity="0.35" />
  </svg>
);

/* 1º ESO – Microscopio */
const Microscope = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="100%" stopColor="rgba(220,225,235,0.85)" />
      </linearGradient>
    </defs>
    {/* Base */}
    <rect x="12" y="67" width="56" height="6" rx="3" fill="rgba(255,255,255,0.82)" />
    <rect x="14" y="68" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
    <rect x="20" y="58" width="40" height="11" rx="4" fill="rgba(255,255,255,0.72)" />
    <rect x="22" y="59" width="16" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
    <rect x="16" y="72" width="8" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
    <rect x="56" y="72" width="8" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
    {/* Pillar */}
    <rect x="33" y="18" width="14" height="42" rx="3.5" fill="url(#mg1)" />
    <rect x="35" y="20" width="4" height="38" rx="1.5" fill="rgba(255,255,255,0.2)" />
    <circle cx="40" cy="22" r="1" fill="rgba(180,190,200,0.3)" />
    <circle cx="40" cy="56" r="1" fill="rgba(180,190,200,0.3)" />
    {/* Stage */}
    <rect x="22" y="48" width="36" height="5" rx="1.5" fill="rgba(255,255,255,0.88)" />
    <rect x="26" y="47" width="3" height="7" rx="1" fill="rgba(200,210,220,0.5)" />
    <rect x="51" y="47" width="3" height="7" rx="1" fill="rgba(200,210,220,0.5)" />
    {/* Tube */}
    <g transform="rotate(-25 40 26)">
      <rect x="33" y="2" width="14" height="38" rx="4.5" fill="url(#mg1)" />
      <rect x="36" y="4" width="4.5" height="34" rx="1.5" fill="rgba(255,255,255,0.18)" />
      <rect x="31" y="-2" width="18" height="7" rx="3.5" fill="rgba(255,255,255,0.92)" />
      <ellipse cx="40" cy="-2" rx="5" ry="2" fill="rgba(200,210,220,0.3)" />
      <rect x="32" y="38" width="16" height="7" rx="3" fill="rgba(255,255,255,0.78)" />
      <circle cx="37" cy="44" r="2.5" fill="rgba(100,180,255,0.3)" />
      <circle cx="43" cy="44" r="2.5" fill="rgba(100,180,255,0.2)" />
    </g>
    {/* Focus knobs */}
    <circle cx="52" cy="34" r="5.5" fill="rgba(255,255,255,0.68)" />
    <circle cx="52" cy="34" r="3" fill="rgba(255,255,255,0.3)" />
    <circle cx="52" cy="34" r="1.2" fill="rgba(0,0,0,0.08)" />
    <circle cx="52" cy="42" r="3.5" fill="rgba(255,255,255,0.55)" />
    {/* Slide */}
    <rect x="34" y="49" width="12" height="3" rx="1" fill="rgba(46,213,115,0.35)" />
    {/* Particles */}
    <circle cx="16" cy="12" r="2.5" fill="#2ED573" opacity="0.5" />
    <circle cx="66" cy="20" r="1.8" fill="#3B82F6" opacity="0.45" />
    <circle cx="12" cy="40" r="2" fill="#FF6B6B" opacity="0.4" />
    <circle cx="68" cy="50" r="1.5" fill="#FFD700" opacity="0.35" />
  </svg>
);

/* 2º ESO – Libro abierto */
const Book = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    {/* Book shadow */}
    <path d="M41 18 Q29 16 11 20 L11 66 Q29 62 41 64 Q53 62 69 66 L69 20 Q53 16 41 18 Z" fill="rgba(0,0,0,0.06)" />
    {/* Left page */}
    <path d="M40 16 Q26 13 8 18 L8 66 Q26 62 40 64 Z" fill="rgba(255,255,255,0.92)" />
    <path d="M10 18 L10 64" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
    {[26, 32, 38, 44, 50, 56].map((y, i) => (
      <line key={`ll${i}`} x1="16" y1={y} x2={34 - (i % 3) * 2} y2={y}
        stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
    ))}
    <rect x="18" y="48" width="8" height="6" rx="1" fill="rgba(59,130,246,0.12)" />
    <circle cx="22" cy="51" r="2" fill="rgba(59,130,246,0.08)" />
    {/* Right page */}
    <path d="M40 16 Q54 13 72 18 L72 66 Q54 62 40 64 Z" fill="rgba(255,255,255,0.96)" />
    <path d="M70 18 L70 64" stroke="rgba(0,0,0,0.03)" strokeWidth="2" />
    {[26, 32, 38, 44, 50, 56].map((y, i) => (
      <line key={`rl${i}`} x1="46" y1={y} x2={64 - (i % 3) * 2} y2={y}
        stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
    ))}
    <rect x="52" y="46" width="12" height="10" rx="1" fill="rgba(46,213,115,0.08)" />
    {[0, 1, 2, 3].map(i => (
      <rect key={`b${i}`} x={54 + i * 3} y={52 - i * 1.5} width="2" height={4 + i * 1.5} rx="0.5"
        fill={`rgba(46,213,115,${0.1 + i * 0.04})`} />
    ))}
    {/* Spine */}
    <line x1="40" y1="16" x2="40" y2="64" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    <path d="M39 16 Q40 40 39 64" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5" fill="none" />
    {/* Back pages */}
    <path d="M40 17 Q27 15 10 19 L9 19 Q26 14.5 40 17" fill="rgba(230,230,230,0.5)" />
    <path d="M40 17 Q53 15 70 19 L71 19 Q54 14.5 40 17" fill="rgba(230,230,230,0.4)" />
    {/* Bookmark */}
    <path d="M52 16 L52 6 L56 10 L60 6 L60 18" stroke="#FF4757" strokeWidth="1.5" fill="#FF4757" opacity="0.6" />
    {/* Floating letters */}
    <text x="14" y="10" fill="#FF4757" fontSize="11" fontWeight="bold" opacity="0.7">A</text>
    <text x="58" y="8" fill="#3B82F6" fontSize="10" fontWeight="bold" opacity="0.6">β</text>
    <text x="68" y="46" fill="#2ED573" fontSize="9" fontWeight="bold" opacity="0.5">∑</text>
    <text x="2" y="52" fill="#FFD700" fontSize="8" fontWeight="bold" opacity="0.5">π</text>
    <text x="36" y="78" fill="#A55EEA" fontSize="8" fontWeight="bold" opacity="0.45">∞</text>
  </svg>
);

/* 3º ESO – Átomo (orbits are essential, kept slow) */
const Atom = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="ag1" cx="0.45" cy="0.42" r="0.5">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="60%" stopColor="rgba(240,240,255,0.85)" />
        <stop offset="100%" stopColor="rgba(200,210,230,0.7)" />
      </radialGradient>
    </defs>
    {/* Orbit glows */}
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(56,189,248,0.06)" strokeWidth="5" />
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(244,114,182,0.05)" strokeWidth="5" transform="rotate(60 40 40)" />
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(52,211,153,0.05)" strokeWidth="5" transform="rotate(-60 40 40)" />
    {/* Orbit paths */}
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 2" />
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="3 2" transform="rotate(60 40 40)" />
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="3 2" transform="rotate(-60 40 40)" />
    {/* Nucleus */}
    <circle cx="40" cy="40" r="10" fill="rgba(255,255,255,0.06)" />
    <circle cx="40" cy="40" r="8" fill="url(#ag1)" />
    <circle cx="37" cy="38" r="3.5" fill="rgba(255,100,100,0.25)" />
    <circle cx="43" cy="38" r="3" fill="rgba(100,100,255,0.2)" />
    <circle cx="40" cy="43" r="3.2" fill="rgba(255,100,100,0.2)" />
    <circle cx="38" cy="41" r="2.5" fill="rgba(100,100,255,0.15)" />
    <circle cx="37" cy="37" r="2.5" fill="rgba(255,255,255,0.45)" />
    {/* Electrons – slow orbits (essential to atom design) */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-orbit 4s linear infinite' }}>
      <circle cx="40" cy="40" r="4" fill="#38BDF8" style={{ transform: 'translateX(18px)' }} />
      <circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,0.5)" style={{ transform: 'translateX(17px) translateY(-1px)' }} />
    </g>
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-orbit2 5s linear infinite' }}>
      <circle cx="40" cy="40" r="3.5" fill="#F472B6" transform="rotate(60 40 40)" />
      <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.4)" transform="rotate(60 40 40)" />
    </g>
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-orbit3 4.5s linear infinite' }}>
      <circle cx="40" cy="40" r="3.5" fill="#34D399" transform="rotate(-60 40 40)" />
      <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.4)" transform="rotate(-60 40 40)" />
    </g>
  </svg>
);

/* 4º ESO – Birrete con diploma */
const GradCap = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    {/* Shadow */}
    <polygon points="41,11 77,27 41,39 5,27" fill="rgba(0,0,0,0.05)" />
    {/* Board */}
    <polygon points="40,10 78,27 40,39 2,27" fill="rgba(255,255,255,0.92)" />
    <polygon points="40,10 78,27 40,27" fill="rgba(0,0,0,0.05)" />
    <line x1="2" y1="27" x2="78" y2="27" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
    {/* Band */}
    <path d="M12 29 L12 47 Q22 59 40 59 Q58 59 68 47 L68 29 L40 39 Z" fill="rgba(255,255,255,0.78)" />
    <path d="M12 29 L12 42 Q22 52 40 52 L40 39 Z" fill="rgba(255,255,255,0.15)" />
    <path d="M14 29 L14 46 Q24 57 40 57" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
    <path d="M66 29 L66 46 Q56 57 40 57" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
    {/* Button */}
    <circle cx="40" cy="27" r="3.5" fill="rgba(255,255,255,0.95)" />
    <circle cx="40" cy="27" r="2.5" fill="rgba(220,220,225,0.3)" />
    <circle cx="39" cy="26" r="1.2" fill="rgba(255,255,255,0.5)" />
    {/* Tassel string */}
    <path d="M40 27 Q50 25 58 26 Q64 27 68 26" stroke="#FFD700" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {/* Tassel – gentle sway */}
    <g style={{ transformOrigin: '68px 26px', animation: 'gc-tassel 4s ease-in-out infinite' }}>
      <line x1="68" y1="26" x2="68" y2="50" stroke="#FFD700" strokeWidth="2" />
      <circle cx="68" cy="48" r="2.5" fill="#FFD700" />
      <circle cx="67.5" cy="47.5" r="1" fill="rgba(255,255,255,0.2)" />
      <path d="M64 50 L63 60 M65.5 50 L65 59 M67 50 L67 60 M68.5 50 L69 59 M70 50 L71 60 M72 50 L73 58"
        stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" />
      {[63, 65, 67, 69, 71, 73].map((x, i) => (
        <circle key={`ft${i}`} cx={x} cy={58 + (i % 2) * 2} r="0.8" fill="#FFE566" />
      ))}
    </g>
    {/* Diploma */}
    <g transform="translate(8 56)">
      <rect x="0" y="0" width="28" height="18" rx="2.5" fill="rgba(255,248,230,0.88)" />
      <rect x="0" y="0" width="28" height="18" rx="2.5" fill="none" stroke="rgba(200,180,140,0.4)" strokeWidth="0.8" />
      <rect x="2" y="2" width="24" height="14" rx="1.5" fill="none" stroke="rgba(200,180,140,0.15)" strokeWidth="0.5" />
      <line x1="6" y1="5" x2="22" y2="5" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
      <line x1="8" y1="8" x2="20" y2="8" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
      <line x1="6" y1="11" x2="18" y2="11" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
      <circle cx="22" cy="13" r="3" fill="#FF4757" />
      <circle cx="22" cy="13" r="2" fill="#FF6B7A" />
      <circle cx="22" cy="13" r="1" fill="rgba(255,255,255,0.3)" />
      <path d="M20 15 L19 19 M24 15 L25 19" stroke="#FF4757" strokeWidth="1" strokeLinecap="round" />
    </g>
  </svg>
);

/* ── Icon map ────────────────────────────────────────────────── */
const iconMap = {
  'primaria-1': { Component: Star, cls: 'gc-star' },
  'primaria-2': { Component: Palette, cls: 'gc-palette' },
  'primaria-3': { Component: Rocket, cls: 'gc-rocket' },
  'primaria-4': { Component: Compass, cls: 'gc-compass' },
  'primaria-5': { Component: TrophyIcon, cls: 'gc-trophy' },
  'primaria-6': { Component: Diamond, cls: 'gc-diamond' },
  'eso-1': { Component: Microscope, cls: 'gc-microscope' },
  'eso-2': { Component: Book, cls: 'gc-book' },
  'eso-3': { Component: Atom, cls: 'gc-atom' },
  'eso-4': { Component: GradCap, cls: 'gc-gradcap' },
};

const GradeCardIcon = ({ type, grade, className = '' }) => {
  useEffect(() => { injectStyles(); }, []);

  const entry = iconMap[`${type}-${grade}`];
  if (!entry) return null;

  const { Component, cls } = entry;
  const size = type === 'primaria' ? 160 : 140;

  return (
    <div
      className={`gc-icon ${cls} relative ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, margin: '-10px auto', overflow: 'visible' }}
    >
      <Particles type={type} grade={grade} />
      <div className="gc-icon-inner w-full h-full">
        <Component />
      </div>
    </div>
  );
};

export default GradeCardIcon;
