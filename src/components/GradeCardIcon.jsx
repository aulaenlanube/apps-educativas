import React, { useEffect } from 'react';

/* ── CSS: keyframes + hover transitions ──────────────────────── */
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
    @keyframes gc-needle{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
    @keyframes gc-tassel{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
    @keyframes gc-flame{0%,100%{opacity:0.7;transform:scaleY(0.92)}50%{opacity:1;transform:scaleY(1.08)}}
    @keyframes gc-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes gc-pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.2);opacity:1}}
    @keyframes gc-glow{0%,100%{opacity:0.3}50%{opacity:0.9}}
    @keyframes gc-shimmer{0%,100%{opacity:0.1}50%{opacity:0.55}}
    @keyframes gc-bounce{0%,100%{transform:translateY(0) scaleY(1)}30%{transform:translateY(-5px) scaleY(1.04)}60%{transform:translateY(-1px) scaleY(0.97)}}
    @keyframes gc-swing{0%,100%{transform:rotate(0deg)}25%{transform:rotate(8deg)}75%{transform:rotate(-8deg)}}
    @keyframes gc-ripple{0%{r:0;opacity:0.7}100%{r:14;opacity:0}}
    @keyframes gc-sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
    @keyframes gc-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
    @keyframes gc-wave{0%,100%{transform:skewY(0deg) scaleX(1)}25%{transform:skewY(-1.5deg) scaleX(1.02)}75%{transform:skewY(1.5deg) scaleX(0.98)}}
    @keyframes gc-flicker{0%,100%{opacity:1}10%{opacity:0.3}20%{opacity:1}40%{opacity:0.5}50%{opacity:1}}
    @keyframes gc-scan{0%{transform:translateY(-100%);opacity:0}20%{opacity:0.5}80%{opacity:0.5}100%{transform:translateY(100%);opacity:0}}
    @keyframes gc-rise{0%{transform:translateY(0);opacity:0.5}100%{transform:translateY(-10px);opacity:0}}
    @keyframes gc-draw{0%{stroke-dashoffset:80}100%{stroke-dashoffset:0}}
    @keyframes gc-morph{0%,100%{border-radius:50%}25%{border-radius:40% 60% 60% 40%}50%{border-radius:60% 40% 40% 60%}75%{border-radius:40% 60% 50% 50%}}
    @keyframes gc-rock{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    @keyframes gc-dash{0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
    @keyframes gc-flipY{0%{transform:perspective(400px) rotateY(0deg)}100%{transform:perspective(400px) rotateY(360deg)}}
    @keyframes gc-flipY-swing{0%,100%{transform:perspective(400px) rotateY(-20deg)}50%{transform:perspective(400px) rotateY(20deg)}}
    @keyframes gc-key-float{0%,100%{transform:translateY(0) rotate(-35deg)}25%{transform:translateY(-5px) rotate(-32deg)}50%{transform:translateY(-2px) rotate(-35deg)}75%{transform:translateY(-6px) rotate(-38deg)}}
    @keyframes gc-atom-e2{0%{transform:rotate(60deg) translateX(20px) rotate(-60deg)}100%{transform:rotate(420deg) translateX(20px) rotate(-420deg)}}
    @keyframes gc-atom-e3{0%{transform:rotate(-60deg) translateX(18px) rotate(60deg)}100%{transform:rotate(300deg) translateX(18px) rotate(-300deg)}}
    @keyframes gc-rocket-launch{0%,100%{transform:translateY(0px) rotate(0deg)}25%{transform:translateY(-3px) rotate(0.8deg)}50%{transform:translateY(-1px) rotate(0deg)}75%{transform:translateY(-4px) rotate(-0.8deg)}}
    @keyframes gc-exhaust-flare{0%,100%{transform:scaleY(0.8) scaleX(0.9);opacity:0.6}30%{transform:scaleY(1.2) scaleX(1.1);opacity:1}60%{transform:scaleY(0.95) scaleX(0.95);opacity:0.8}}
    @keyframes gc-star-float{0%,100%{transform:translateY(0) scale(1);opacity:0.85}25%{transform:translateY(-4px) scale(1.1);opacity:1}50%{transform:translateY(-1px) scale(0.95);opacity:0.75}75%{transform:translateY(-5px) scale(1.05);opacity:0.95}}
    @keyframes gc-appear{0%,8%{opacity:0;transform:scale(0.7)}20%{opacity:1;transform:scale(1)}80%{opacity:1;transform:scale(1)}88%,100%{opacity:0;transform:scale(0.7)}}
    @keyframes gc-stroke-draw{0%,8%{stroke-dashoffset:60}50%{stroke-dashoffset:0}80%{stroke-dashoffset:0}100%{stroke-dashoffset:60}}
    @keyframes gc-name1{0%,4%{opacity:0;transform:translateX(-4px)}8%,75%{opacity:1;transform:translateX(0)}83%,100%{opacity:0;transform:translateX(-4px)}}
    @keyframes gc-name2{0%,12%{opacity:0;transform:translateX(-4px)}20%,75%{opacity:1;transform:translateX(0)}83%,100%{opacity:0;transform:translateX(-4px)}}
    @keyframes gc-name3{0%,25%{opacity:0;transform:translateX(-4px)}33%,75%{opacity:1;transform:translateX(0)}83%,100%{opacity:0;transform:translateX(-4px)}}
    @keyframes gc-name-glow{0%,33%{filter:drop-shadow(0 0 0px transparent)}50%{filter:drop-shadow(0 0 3px rgba(99,102,241,0.6))}66%{filter:drop-shadow(0 0 0px transparent)}75%{filter:drop-shadow(0 0 3px rgba(236,72,153,0.5))}83%,100%{filter:drop-shadow(0 0 0px transparent)}}
    @keyframes gc-line-write{0%,8%{stroke-dashoffset:30;opacity:0}16%{opacity:0.4}25%{stroke-dashoffset:0;opacity:0.4}75%{stroke-dashoffset:0;opacity:0.4}83%,100%{stroke-dashoffset:30;opacity:0}}
    @keyframes gc-prism-shift{0%{stop-color:#93C5FD}25%{stop-color:#C4B5FD}50%{stop-color:#F9A8D4}75%{stop-color:#6EE7B7}100%{stop-color:#93C5FD}}

    .gc-icon{animation:gc-float 4.5s ease-in-out infinite}
    .gc-icon-inner{transition:transform 0.55s cubic-bezier(0.34,1.56,0.64,1),filter 0.55s ease}

    .group:hover .gc-backpack .gc-icon-inner{transform:rotate(-8deg) scale(1.06);filter:drop-shadow(0 0 14px rgba(236,72,153,0.55))}
    .group:hover .gc-notebook .gc-icon-inner{transform:rotate(-6deg) scale(1.06);filter:drop-shadow(0 0 14px rgba(52,211,153,0.55))}
    .group:hover .gc-rocket .gc-icon-inner{transform:translateY(-12px);filter:drop-shadow(0 0 14px rgba(255,140,20,0.55))}
    .group:hover .gc-compass .gc-icon-inner{transform:rotate(20deg);filter:drop-shadow(0 0 12px rgba(255,255,255,0.45))}
    .group:hover .gc-globe .gc-icon-inner{transform:scale(1.08);filter:drop-shadow(0 0 14px rgba(59,130,246,0.55))}
    .group:hover .gc-key .gc-icon-inner{transform:rotate(8deg) scale(1.08);filter:drop-shadow(0 0 16px rgba(251,191,36,0.55))}
    .group:hover .gc-microscope .gc-icon-inner{transform:rotate(6deg) translateY(-5px);filter:drop-shadow(0 0 12px rgba(46,213,115,0.45))}
    .group:hover .gc-book .gc-icon-inner{transform:rotate(-8deg);filter:drop-shadow(0 0 12px rgba(160,100,255,0.45))}
    .group:hover .gc-atom .gc-icon-inner{transform:scale(1.12);filter:drop-shadow(0 0 16px rgba(56,189,248,0.55))}
    .group:hover .gc-gradcap .gc-icon-inner{transform:translateY(-12px) rotate(-10deg);filter:drop-shadow(0 0 14px rgba(255,210,50,0.55))}
    .group:hover .gc-telescope .gc-icon-inner{transform:rotate(-6deg) scale(1.06);filter:drop-shadow(0 0 14px rgba(99,102,241,0.5))}
    .group:hover .gc-diploma .gc-icon-inner{transform:rotate(-8deg) translateY(-6px);filter:drop-shadow(0 0 14px rgba(245,158,11,0.5))}
    .group:hover .gc-alcard .gc-icon-inner{transform:scale(1.1);filter:drop-shadow(0 0 14px rgba(251,146,60,0.5))}
    .group:hover .gc-ptcard .gc-icon-inner{transform:scale(1.1);filter:drop-shadow(0 0 14px rgba(45,212,191,0.5))}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
};

/* ── Particles (twinkle) ───────────────────────────────────── */
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
  'bachillerato-1': [
    { shape: 'star4', x: 4, y: 12, size: 4, delay: 0, dur: 3, color: 'rgba(129,140,248,0.5)' },
    { shape: 'circle', x: 92, y: 24, size: 3, delay: 0.8, dur: 2.5, color: 'rgba(253,224,71,0.45)' },
    { shape: 'diamond', x: 6, y: 78, size: 3.5, delay: 1.5, dur: 2.8, color: 'rgba(167,139,250,0.4)' },
  ],
  'bachillerato-2': [
    { shape: 'star4', x: 5, y: 10, size: 5, delay: 0, dur: 2.5, color: 'rgba(251,191,36,0.55)' },
    { shape: 'diamond', x: 93, y: 14, size: 4, delay: 0.6, dur: 3, color: 'rgba(239,68,68,0.45)' },
    { shape: 'star4', x: 6, y: 76, size: 3, delay: 1.2, dur: 2.8, color: 'rgba(167,139,250,0.4)' },
  ],
  'ad-1': [
    { shape: 'diamond', x: 5, y: 12, size: 4, delay: 0, dur: 3, color: 'rgba(45,212,191,0.5)' },
    { shape: 'circle', x: 92, y: 18, size: 3, delay: 0.6, dur: 2.5, color: 'rgba(244,114,182,0.45)' },
    { shape: 'star4', x: 6, y: 76, size: 3.5, delay: 1.2, dur: 2.8, color: 'rgba(167,139,250,0.4)' },
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

/* ── SVG Icons with vivid idle animations ─────────────────────── */

/* 1º Primaria – Mochila escolar */
const Backpack = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="bp-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F472B6" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
      <linearGradient id="bp-body-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
      <linearGradient id="bp-pocket" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="bp-strap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F9A8D4" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>

    {/* ── Mochila – gentle sway como si colgara ── */}
    <g transform="translate(0 3)" style={{ transformOrigin: '40px 15px', animation: 'gc-sway 4s ease-in-out infinite' }}>

      {/* Asa superior */}
      <path d="M34 12 Q34 6 40 6 Q46 6 46 12" stroke="#BE185D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M35 12 Q35 7.5 40 7.5 Q45 7.5 45 12" stroke="#F9A8D4" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Tirantes (detrás del cuerpo, visibles por los lados) */}
      <path d="M20 18 Q16 22 14 38 Q13 48 16 58" stroke="url(#bp-strap)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M60 18 Q64 22 66 38 Q67 48 64 58" stroke="url(#bp-strap)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Hebillas de los tirantes */}
      <rect x="13" y="56" width="8" height="5" rx="2" fill="#FBBF24" style={{ animation: 'gc-glow 3s ease-in-out infinite' }} />
      <rect x="59" y="56" width="8" height="5" rx="2" fill="#FBBF24" style={{ animation: 'gc-glow 3s ease-in-out 1.5s infinite' }} />

      {/* Cuerpo principal */}
      <rect x="18" y="12" width="44" height="52" rx="10" fill="url(#bp-body)" />
      {/* Highlight lateral izquierdo */}
      <path d="M20 18 Q18 38 20 60" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Sombra lateral derecho */}
      <path d="M60 18 Q62 38 60 60" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Bolsillo frontal – redondeado */}
      <rect x="24" y="38" width="32" height="22" rx="7" fill="url(#bp-pocket)" />
      <rect x="24" y="38" width="32" height="22" rx="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      {/* Cremallera del bolsillo */}
      <line x1="32" y1="38" x2="48" y2="38" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tirador de cremallera – bouncing */}
      <g style={{ transformOrigin: '48px 38px', animation: 'gc-bounce 3s ease-in-out infinite' }}>
        <circle cx="50" cy="38" r="2.5" fill="#FBBF24" />
        <circle cx="49.5" cy="37.5" r="1" fill="#FDE68A" />
      </g>

      {/* Estrella decorativa en el bolsillo */}
      <g style={{ transformOrigin: '40px 50px', animation: 'gc-breathe 3s ease-in-out infinite' }}>
        <path d="M40 43 L42 47.5 L47 48 L43.5 51 L44.5 56 L40 53.5 L35.5 56 L36.5 51 L33 48 L38 47.5 Z"
          fill="#FBBF24" />
        <path d="M40 44.5 L41.5 47.8 L45 48.2 L42.5 50.5 L43.2 54 L40 52 L36.8 54 L37.5 50.5 L35 48.2 L38.5 47.8 Z"
          fill="#FDE68A" />
      </g>

      {/* Cremallera principal (curva superior) */}
      <path d="M24 22 Q40 18 56 22" stroke="#C4B5FD" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Dientes de cremallera */}
      {[28, 32, 36, 40, 44, 48, 52].map((x, i) => (
        <line key={`z${i}`} x1={x} y1={20 + Math.abs(x - 40) * 0.08} x2={x} y2={22.5 + Math.abs(x - 40) * 0.08}
          stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" />
      ))}
      {/* Tirador cremallera principal */}
      <g style={{ transformOrigin: '26px 22px', animation: 'gc-swing 4s ease-in-out infinite' }}>
        <circle cx="25" cy="22" r="2" fill="#FBBF24" />
        <circle cx="24.5" cy="21.5" r="0.8" fill="#FDE68A" />
      </g>

      {/* Detalle decorativo – franja horizontal */}
      <rect x="22" y="30" width="36" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />

      {/* Lápiz asomando por arriba */}
      <g style={{ transformOrigin: '55px 8px', animation: 'gc-rock 3.5s ease-in-out infinite' }}>
        <rect x="53" y="2" width="4" height="14" rx="1" fill="#22C55E" />
        <rect x="53" y="2" width="4" height="3" rx="1" fill="#16A34A" />
        <rect x="53" y="2" width="2" height="14" rx="0.5" fill="rgba(255,255,255,0.15)" />
        <path d="M53 16 L55 19 L57 16 Z" fill="#FBBF24" />
      </g>

      {/* Regla asomando por arriba */}
      <g style={{ transformOrigin: '28px 6px', animation: 'gc-rock 4s ease-in-out 0.5s infinite' }}>
        <rect x="26" y="0" width="4" height="16" rx="0.8" fill="#60A5FA" />
        <rect x="26" y="0" width="1.5" height="16" rx="0.5" fill="rgba(255,255,255,0.2)" />
        {[3, 6, 9, 12].map((y, i) => (
          <line key={`rl${i}`} x1="26" y1={y} x2={i % 2 === 0 ? '28.5' : '27.5'} y2={y}
            stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        ))}
      </g>
    </g>

    {/* Sparkles alrededor */}
    <circle cx="6" cy="24" r="1.5" fill="#FCD34D" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="74" cy="18" r="1.3" fill="#F87171" style={{ animation: 'gc-twinkle 3.5s ease-in-out 0.8s infinite' }} />
    <circle cx="8" cy="68" r="1.2" fill="#60A5FA" style={{ animation: 'gc-twinkle 2.8s ease-in-out 1.6s infinite' }} />
    <circle cx="72" cy="66" r="1.4" fill="#A78BFA" style={{ animation: 'gc-twinkle 2.6s ease-in-out 0.4s infinite' }} />
  </svg>
);

/* 2º Primaria – Cuaderno abierto con contenido que aparece progresivamente */
const Notebook = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="nb-cover" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="nb-pageL" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="100%" stopColor="#FFFBEB" />
      </linearGradient>
      <linearGradient id="nb-pageR" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="100%" stopColor="#FEF3C7" />
      </linearGradient>
    </defs>

    {/* Sombra */}
    <path d="M6 38 Q6 18 40 18 Q74 18 74 38 L74 72 Q74 76 40 76 Q6 76 6 72 Z" fill="rgba(0,0,0,0.06)" />

    {/* ── Cuaderno abierto ── */}
    <g style={{ transformOrigin: '40px 50px', animation: 'gc-rock 6s ease-in-out infinite' }}>

      {/* Contraportada verde */}
      <path d="M4 34 Q4 20 38 20 L38 72 Q4 72 4 62 Z" fill="url(#nb-cover)" />
      <path d="M76 34 Q76 20 42 20 L42 72 Q76 72 76 62 Z" fill="url(#nb-cover)" />
      <path d="M6 22 L6 70" stroke="#047857" strokeWidth="1" opacity="0.5" />
      <path d="M74 22 L74 70" stroke="#047857" strokeWidth="1" opacity="0.5" />

      {/* Página izquierda */}
      <path d="M8 32 Q8 22 38 22 L38 70 Q8 70 8 62 Z" fill="url(#nb-pageL)" />
      <path d="M8 32 Q8 22 38 22 L38 70 Q8 70 8 62 Z" fill="none" stroke="rgba(200,180,100,0.25)" strokeWidth="0.5" />

      {/* Página derecha */}
      <path d="M72 32 Q72 22 42 22 L42 70 Q72 70 72 62 Z" fill="url(#nb-pageR)" />
      <path d="M72 32 Q72 22 42 22 L42 70 Q72 70 72 62 Z" fill="none" stroke="rgba(200,180,100,0.25)" strokeWidth="0.5" />

      {/* Lomo central */}
      <line x1="40" y1="22" x2="40" y2="70" stroke="#D97706" strokeWidth="1.5" opacity="0.3" />
      <line x1="39" y1="22" x2="39" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />

      {/* Espiral */}
      {[26, 32, 38, 44, 50, 56, 62].map((y, i) => (
        <g key={`sp${i}`}>
          <circle cx="40" cy={y} r="2.5" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
          <circle cx="40" cy={y} r="1" fill="#CBD5E1" />
        </g>
      ))}

      {/* ── Contenido izquierda: nombres que aparecen progresivamente ── */}

      {/* Líneas de pauta del cuaderno */}
      {[30, 37, 44, 51, 58].map((y, i) => (
        <line key={`pauta${i}`} x1="12" y1={y} x2="36" y2={y}
          stroke="rgba(59,130,246,0.1)" strokeWidth="0.4" />
      ))}

      {/* Nombre 1: Vega – aparece primero, color azul */}
      <g style={{ animation: 'gc-name1 10s ease-in-out infinite, gc-name-glow 10s ease-in-out infinite' }}>
        <text x="14" y="36" fill="#2563EB" fontSize="5.5" fontWeight="bold" fontFamily="Fredoka, sans-serif">Vega</text>
        <line x1="14" y1="37.5" x2="30" y2="37.5"
          stroke="#2563EB" strokeWidth="0.5" strokeLinecap="round" opacity="0.3"
          strokeDasharray="30"
          style={{ animation: 'gc-line-write 10s ease-in-out 0s infinite' }} />
      </g>

      {/* Nombre 2: Marc – aparece segundo, color púrpura */}
      <g style={{ animation: 'gc-name2 10s ease-in-out infinite, gc-name-glow 10s ease-in-out 1.2s infinite' }}>
        <text x="14" y="43.5" fill="#7C3AED" fontSize="5.5" fontWeight="bold" fontFamily="Fredoka, sans-serif">Marc</text>
        <line x1="14" y1="45" x2="29" y2="45"
          stroke="#7C3AED" strokeWidth="0.5" strokeLinecap="round" opacity="0.3"
          strokeDasharray="30"
          style={{ animation: 'gc-line-write 10s ease-in-out 1.2s infinite' }} />
      </g>

      {/* Nombre 3: Anna – aparece tercero, color rosa */}
      <g style={{ animation: 'gc-name3 10s ease-in-out infinite, gc-name-glow 10s ease-in-out 2.5s infinite' }}>
        <text x="14" y="51" fill="#EC4899" fontSize="5.5" fontWeight="bold" fontFamily="Fredoka, sans-serif">Anna</text>
        <line x1="14" y1="52.5" x2="30" y2="52.5"
          stroke="#EC4899" strokeWidth="0.5" strokeLinecap="round" opacity="0.3"
          strokeDasharray="30"
          style={{ animation: 'gc-line-write 10s ease-in-out 2.5s infinite' }} />
      </g>

      {/* Estrellitas decorativas junto a los nombres */}
      <g style={{ animation: 'gc-name3 10s ease-in-out infinite' }}>
        <text x="32" y="36" fill="#FBBF24" fontSize="4" style={{ animation: 'gc-twinkle 2s ease-in-out infinite' }}>★</text>
        <text x="30" y="43.5" fill="#FBBF24" fontSize="3.5" style={{ animation: 'gc-twinkle 2s ease-in-out 0.7s infinite' }}>★</text>
        <text x="31" y="51" fill="#FBBF24" fontSize="4" style={{ animation: 'gc-twinkle 2s ease-in-out 1.4s infinite' }}>★</text>
      </g>

      {/* ── Contenido derecha: dibujitos que aparecen ── */}

      {/* Sol – aparece con los nombres */}
      <g style={{ animation: 'gc-name1 10s ease-in-out infinite' }}>
        <g style={{ transformOrigin: '56px 32px', animation: 'gc-breathe 3.5s ease-in-out infinite' }}>
          <circle cx="56" cy="32" r="4" fill="#FBBF24" />
          <circle cx="55" cy="31" r="1.5" fill="#FDE68A" opacity="0.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <line key={`ray${i}`} x1="56" y1="26" x2="56" y2="24"
              stroke="#FBBF24" strokeWidth="1" strokeLinecap="round"
              transform={`rotate(${deg} 56 32)`} />
          ))}
        </g>
      </g>

      {/* Nube */}
      <g style={{ animation: 'gc-name1 10s ease-in-out infinite' }}>
        <ellipse cx="49" cy="30" rx="4" ry="2.5" fill="#93C5FD" opacity="0.5" />
        <ellipse cx="46" cy="30" rx="2.5" ry="2" fill="#93C5FD" opacity="0.5" />
        <ellipse cx="52" cy="30" rx="2.5" ry="2" fill="#93C5FD" opacity="0.5" />
      </g>

      {/* Casita – con Marc */}
      <g style={{ animation: 'gc-name2 10s ease-in-out infinite' }}>
        <rect x="48" y="47" width="12" height="10" rx="1" fill="#F87171" opacity="0.6" />
        <path d="M46 47 L54 40 L62 47" stroke="#DC2626" strokeWidth="1.2" fill="#FCA5A5" opacity="0.6" strokeLinejoin="round" />
        <rect x="52" y="51" width="4" height="6" rx="0.5" fill="#92400E" opacity="0.4" />
        <rect x="49" y="49" width="3" height="3" rx="0.3" fill="#93C5FD" opacity="0.5" />
      </g>

      {/* Flor – con Anna */}
      <g style={{ animation: 'gc-name3 10s ease-in-out infinite' }}>
        <g style={{ transformOrigin: '64px 55px', animation: 'gc-sway 4s ease-in-out infinite' }}>
          <line x1="64" y1="55" x2="64" y2="63" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="64" cy="53" r="2.5" fill="#F472B6" opacity="0.6" />
          <circle cx="64" cy="53" r="1.2" fill="#FBBF24" opacity="0.7" />
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <circle key={`pt${i}`} cx="64" cy="50.5" r="1.5" fill="#F9A8D4" opacity="0.5"
              transform={`rotate(${deg} 64 53)`} />
          ))}
        </g>
      </g>

      {/* Corazón – con Anna */}
      <g style={{ animation: 'gc-name3 10s ease-in-out infinite' }}>
        <path d="M56 62 C54 59, 50 60, 52 63 L56 67 L60 63 C62 60, 58 59, 56 62 Z"
          fill="#F87171" opacity="0.5" />
      </g>

      {/* Estrella – cuando están todos */}
      <g style={{ animation: 'gc-name3 10s ease-in-out infinite' }}>
        <g style={{ transformOrigin: '48px 64px', animation: 'gc-pulse 3s ease-in-out infinite' }}>
          <polygon points="48,60 49.5,62.5 52,63 50,65 50.5,67.5 48,66.2 45.5,67.5 46,65 44,63 46.5,62.5"
            fill="#FBBF24" opacity="0.7" />
        </g>
      </g>
    </g>

    {/* Sparkles */}
    <circle cx="4" cy="14" r="1.5" fill="#FCD34D" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="76" cy="10" r="1.3" fill="#F87171" style={{ animation: 'gc-twinkle 3.5s ease-in-out 0.8s infinite' }} />
    <circle cx="2" cy="56" r="1.2" fill="#34D399" style={{ animation: 'gc-twinkle 2.8s ease-in-out 1.6s infinite' }} />
    <circle cx="78" cy="52" r="1.4" fill="#A78BFA" style={{ animation: 'gc-twinkle 2.6s ease-in-out 0.4s infinite' }} />
  </svg>
);

/* 3º Primaria – Cohete detallado con animación espectacular */
const Rocket = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="rk-body" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F1F5F9" />
        <stop offset="35%" stopColor="#FFFFFF" />
        <stop offset="65%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
      <linearGradient id="rk-nose" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="rk-fin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
      <linearGradient id="rk-nozzle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="rk-window" x1="0.3" y1="0.2" x2="0.7" y2="0.8">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
      <radialGradient id="rk-flame-out" cx="0.5" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="50%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="rk-flame-in" cx="0.5" cy="0.2" r="0.5">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="60%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F97316" />
      </radialGradient>
    </defs>

    {/* ── Estrellas de fondo ── */}
    {[
      { cx: 6, cy: 10, r: 1.8, d: 0 }, { cx: 74, cy: 8, r: 1.5, d: 0.6 },
      { cx: 10, cy: 55, r: 1.2, d: 1.2 }, { cx: 72, cy: 48, r: 1, d: 1.8 },
      { cx: 18, cy: 30, r: 0.8, d: 2.2 }, { cx: 64, cy: 28, r: 0.9, d: 0.4 },
    ].map((s, i) => (
      <g key={`st${i}`}>
        <circle cx={s.cx} cy={s.cy} r={s.r} fill="#FDE68A" opacity="0.7"
          style={{ animation: `gc-twinkle ${2.5 + i * 0.3}s ease-in-out ${s.d}s infinite` }} />
        <line x1={s.cx - s.r * 1.5} y1={s.cy} x2={s.cx + s.r * 1.5} y2={s.cy}
          stroke="#FDE68A" strokeWidth="0.3" opacity="0.4" />
        <line x1={s.cx} y1={s.cy - s.r * 1.5} x2={s.cx} y2={s.cy + s.r * 1.5}
          stroke="#FDE68A" strokeWidth="0.3" opacity="0.4" />
      </g>
    ))}

    {/* ── Líneas de velocidad ── */}
    {[22, 32, 42, 50].map((y, i) => (
      <line key={`sp${i}`} x1={6 + i * 2} y1={y} x2={0} y2={y}
        stroke="rgba(255,255,255,0.2)" strokeWidth={1.2 - i * 0.2} strokeLinecap="round"
        style={{ animation: `gc-shimmer ${1.8 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }} />
    ))}
    {[20, 35, 46].map((y, i) => (
      <line key={`spr${i}`} x1={74 - i * 2} y1={y} x2={80} y2={y}
        stroke="rgba(255,255,255,0.15)" strokeWidth={1 - i * 0.15} strokeLinecap="round"
        style={{ animation: `gc-shimmer ${2 + i * 0.3}s ease-in-out ${0.5 + i * 0.4}s infinite` }} />
    ))}

    {/* ── Cohete principal con animación de lanzamiento ── */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-rocket-launch 3s ease-in-out infinite' }}>

      {/* ── Llamas del motor (detrás del cohete) ── */}
      <g style={{ transformOrigin: '40px 60px', animation: 'gc-exhaust-flare 0.8s ease-in-out infinite' }}>
        {/* Llama exterior */}
        <ellipse cx="40" cy="68" rx="8" ry="8" fill="url(#rk-flame-out)" opacity="0.8" />
        {/* Llama media */}
        <ellipse cx="40" cy="67" rx="5.5" ry="6" fill="#F97316" opacity="0.85" />
        {/* Llama interior */}
        <ellipse cx="40" cy="66" rx="3.5" ry="5" fill="url(#rk-flame-in)"
          style={{ animation: 'gc-flicker 1.5s ease-in-out infinite' }} />
        {/* Núcleo blanco */}
        <ellipse cx="40" cy="64" rx="1.8" ry="3" fill="#FEF9C3" opacity="0.95" />
        {/* Chispas laterales */}
        <circle cx="34" cy="68" r="1.3" fill="#FBBF24" opacity="0.6"
          style={{ animation: 'gc-rise 1.2s ease-out infinite' }} />
        <circle cx="46" cy="69" r="1" fill="#FB923C" opacity="0.5"
          style={{ animation: 'gc-rise 1.4s ease-out 0.3s infinite' }} />
        <circle cx="37" cy="71" r="0.8" fill="#FDE68A" opacity="0.4"
          style={{ animation: 'gc-rise 1s ease-out 0.6s infinite' }} />
        <circle cx="43" cy="72" r="0.7" fill="#FBBF24" opacity="0.35"
          style={{ animation: 'gc-rise 1.1s ease-out 0.9s infinite' }} />
      </g>

      {/* ── Aletas laterales ── */}
      {/* Aleta izquierda */}
      <path d="M29 42 L14 58 L22 58 L29 50 Z" fill="url(#rk-fin)" />
      <path d="M29 42 L18 56 L24 56 L29 49 Z" fill="rgba(255,255,255,0.12)" />
      <line x1="22" y1="50" x2="17" y2="57" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      {/* Aleta derecha */}
      <path d="M51 42 L66 58 L58 58 L51 50 Z" fill="url(#rk-fin)" />
      <path d="M51 44 L62 56 L56 56 L51 49 Z" fill="rgba(0,0,0,0.1)" />
      <line x1="58" y1="50" x2="63" y2="57" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      {/* Alerones pequeños inferiores */}
      <path d="M33 53 L28 59 L33 57 Z" fill="#DC2626" />
      <path d="M47 53 L52 59 L47 57 Z" fill="#DC2626" />

      {/* ── Cuerpo del cohete ── */}
      <path d="M40 8 Q52 22 52 44 L46 57 L34 57 L28 44 Q28 22 40 8 Z" fill="url(#rk-body)" />
      {/* Brillo lateral izquierdo */}
      <path d="M40 10 Q34 22 33 44 L34 54 L36 54 L35 44 Q35 24 40 12 Z" fill="rgba(255,255,255,0.5)" />
      {/* Sombra lateral derecho */}
      <path d="M40 10 Q48 22 49 44 L47 54 L46 54 L48 44 Q48 24 40 12 Z" fill="rgba(0,0,0,0.04)" />

      {/* ── Punta del cohete (nose cone) ── */}
      <path d="M40 8 Q45 14 46 20 L34 20 Q35 14 40 8 Z" fill="url(#rk-nose)" />
      <path d="M40 9 Q37 14 36 20 L34 20 Q35 14 40 8 Z" fill="rgba(255,255,255,0.2)" />

      {/* ── Franjas decorativas ── */}
      <rect x="30" y="20" width="20" height="2" rx="0.5" fill="#EF4444" />
      <rect x="31" y="45" width="18" height="2" rx="0.5" fill="#3B82F6" opacity="0.6" />
      <rect x="31" y="48" width="18" height="1" rx="0.5" fill="#3B82F6" opacity="0.3" />

      {/* ── Ventana principal ── */}
      <circle cx="40" cy="29" r="7.5" fill="#1E293B" />
      <circle cx="40" cy="29" r="6.5" fill="url(#rk-window)" />
      <circle cx="40" cy="29" r="6.5" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Reflejo de la ventana */}
      <path d="M35 26 Q37 23 40 23 Q37 25 36 29" fill="rgba(255,255,255,0.45)" />
      <circle cx="43" cy="32" r="1.2" fill="rgba(255,255,255,0.2)" />
      {/* Brillo interior pulsante */}
      <circle cx="40" cy="29" r="4" fill="rgba(147,197,253,0.15)"
        style={{ animation: 'gc-glow 3s ease-in-out infinite' }} />

      {/* ── Ventana secundaria ── */}
      <circle cx="40" cy="40" r="3.5" fill="#1E293B" />
      <circle cx="40" cy="40" r="2.8" fill="url(#rk-window)" />
      <circle cx="40" cy="40" r="2.8" fill="none" stroke="#94A3B8" strokeWidth="1" />
      <path d="M38 39 Q39 38 40 38" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" fill="none" />

      {/* ── Remaches y detalles de panel ── */}
      {[24, 33, 42, 50].map(y => (
        <g key={`rv${y}`}>
          <circle cx="32" cy={y} r="0.7" fill="#94A3B8" opacity="0.5" />
          <circle cx="32" cy={y} r="0.3" fill="rgba(255,255,255,0.6)" />
          <circle cx="48" cy={y} r="0.7" fill="#94A3B8" opacity="0.5" />
          <circle cx="48" cy={y} r="0.3" fill="rgba(255,255,255,0.6)" />
        </g>
      ))}
      {/* Líneas de panel */}
      <path d="M34 20 L34 54" stroke="rgba(0,0,0,0.04)" strokeWidth="0.3" />
      <path d="M46 20 L46 54" stroke="rgba(0,0,0,0.04)" strokeWidth="0.3" />

      {/* ── Tobera del motor ── */}
      <path d="M34 55 L32 60 L48 60 L46 55" fill="url(#rk-nozzle)" />
      <path d="M33 57 L32 60 L40 60 L38 57" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="40" cy="60" rx="8" ry="1.5" fill="#334155" />
      <ellipse cx="40" cy="60" rx="5" ry="1" fill="#475569" />
    </g>

    {/* ── Partículas de escape ── */}
    {[
      { cx: 33, cy: 73, r: 1.2, d: 0 }, { cx: 47, cy: 74, r: 1, d: 0.4 },
      { cx: 37, cy: 76, r: 0.8, d: 0.8 }, { cx: 43, cy: 75, r: 0.7, d: 1.2 },
    ].map((p, i) => (
      <circle key={`ep${i}`} cx={p.cx} cy={p.cy} r={p.r}
        fill={['#FBBF24', '#FB923C', '#FDE68A', '#F97316'][i]} opacity="0.5"
        style={{ animation: `gc-rise ${1 + i * 0.3}s ease-out ${p.d}s infinite` }} />
    ))}
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
    {/* Degree marks – staggered glow */}
    {Array.from({ length: 36 }, (_, i) => i * 10).map(deg => (
      <line key={deg} x1="40" y1={deg % 30 === 0 ? 9 : 11} x2="40" y2={deg % 30 === 0 ? 14 : 13}
        stroke={`rgba(255,255,255,${deg % 30 === 0 ? 0.6 : 0.25})`}
        strokeWidth={deg % 30 === 0 ? 1.2 : 0.6}
        transform={`rotate(${deg} 40 40)`}
        style={deg % 90 === 0 ? { animation: `gc-glow 3s ease-in-out ${deg / 90 * 0.5}s infinite` } : undefined} />
    ))}
    {/* Cardinal marks – pulsing N */}
    <text x="40" y="22" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="7" fontWeight="bold" fontFamily="sans-serif"
      style={{ animation: 'gc-glow 3s ease-in-out infinite' }}>N</text>
    <text x="40" y="64" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="sans-serif">S</text>
    <text x="18" y="43" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="sans-serif">O</text>
    <text x="62" y="43" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="6" fontFamily="sans-serif">E</text>
    {/* Intercardinals */}
    <text x="55" y="29" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">NE</text>
    <text x="25" y="29" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">NO</text>
    <text x="55" y="57" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">SE</text>
    <text x="25" y="57" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">SO</text>
    {/* Rose of winds – subtle spin */}
    <g opacity="0.12" style={{ transformOrigin: '40px 40px', animation: 'gc-spin 60s linear infinite' }}>
      <polygon points="40,18 43,37 40,35 37,37" fill="white" />
      <polygon points="40,62 43,43 40,45 37,43" fill="white" />
      <polygon points="18,40 37,37 35,40 37,43" fill="white" />
      <polygon points="62,40 43,37 45,40 43,43" fill="white" />
    </g>
    {/* Needle – searching swing */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-needle 4s ease-in-out infinite' }}>
      <polygon points="40,13 44,38 40,35 36,38" fill="#FF4757" />
      <polygon points="40,13 42,38 40,35" fill="#FF6B7A" />
      <polygon points="40,67 44,42 40,45 36,42" fill="rgba(255,255,255,0.75)" />
      <polygon points="40,67 42,42 40,45" fill="rgba(255,255,255,0.2)" />
    </g>
    {/* Center hub – pulse */}
    <circle cx="40" cy="40" r="5" fill="rgba(255,255,255,0.92)" style={{ transformOrigin: '40px 40px', animation: 'gc-breathe 3s ease-in-out infinite' }} />
    <circle cx="40" cy="40" r="3.5" fill="rgba(200,200,210,0.3)" />
    <circle cx="40" cy="40" r="2" fill="rgba(0,0,0,0.12)" />
    <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.6)" />
    {/* Glass reflection – traveling */}
    <path d="M20 25 Q28 18 40 16" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      style={{ animation: 'gc-shimmer 4s ease-in-out infinite' }} />
    {/* Magnetic field ripple */}
    <circle cx="40" cy="13" r="0" fill="none" stroke="rgba(255,71,87,0.2)" strokeWidth="0.4"
      style={{ animation: 'gc-ripple 4s ease-out infinite' }} />
  </svg>
);

/* 5º Primaria – Globo terráqueo */
const Globe = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="gl-ocean" cx="0.4" cy="0.38" r="0.55">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="60%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </radialGradient>
      <linearGradient id="gl-stand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      <linearGradient id="gl-base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <clipPath id="gl-clip">
        <circle cx="40" cy="34" r="26" />
      </clipPath>
    </defs>

    {/* Sombra del globo */}
    <ellipse cx="40" cy="74" rx="18" ry="3" fill="rgba(59,130,246,0.12)" />

    {/* ── Soporte y base ── */}
    {/* Base */}
    <ellipse cx="40" cy="72" rx="16" ry="4" fill="url(#gl-base)" />
    <ellipse cx="40" cy="72" rx="16" ry="4" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    <ellipse cx="40" cy="71" rx="12" ry="2.5" fill="rgba(255,255,255,0.06)" />
    {/* Columna */}
    <rect x="37" y="58" width="6" height="14" rx="2" fill="url(#gl-stand)" />
    <rect x="38" y="59" width="2" height="12" rx="1" fill="rgba(255,255,255,0.15)" />

    {/* Arco semicircular del soporte */}
    <path d="M14 34 Q14 6 40 6 Q66 6 66 34 Q66 62 40 62 Q14 62 14 34"
      fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="none" />
    <path d="M15 34 Q15 8 40 8 Q65 8 65 34"
      fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

    {/* ── Esfera del globo – rotación lenta ── */}
    <g style={{ transformOrigin: '40px 34px', animation: 'gc-spin 30s linear infinite' }}>
      {/* Océano */}
      <circle cx="40" cy="34" r="26" fill="url(#gl-ocean)" />

      {/* Continentes (formas simplificadas) – recortados al círculo */}
      <g clipPath="url(#gl-clip)">
        {/* América del Norte */}
        <path d="M20 18 Q18 22 20 28 Q24 32 22 36 L18 38 Q16 34 18 28 Q16 24 20 18 Z"
          fill="#22C55E" opacity="0.75" />
        <path d="M22 14 Q28 12 30 16 Q28 20 24 22 Q20 20 22 14 Z"
          fill="#22C55E" opacity="0.7" />

        {/* América del Sur */}
        <path d="M24 40 Q28 38 30 42 Q32 48 28 54 Q24 56 22 50 Q20 44 24 40 Z"
          fill="#22C55E" opacity="0.75" />

        {/* Europa */}
        <path d="M42 16 Q46 14 48 18 Q46 22 42 24 Q40 20 42 16 Z"
          fill="#34D399" opacity="0.7" />

        {/* África */}
        <path d="M44 26 Q48 24 52 28 Q54 36 52 44 Q48 50 44 48 Q40 42 42 34 Q40 30 44 26 Z"
          fill="#34D399" opacity="0.75" />

        {/* Asia */}
        <path d="M50 14 Q58 12 64 18 Q66 24 62 30 Q56 34 52 28 Q54 22 50 18 Q48 16 50 14 Z"
          fill="#22C55E" opacity="0.7" />

        {/* Australia */}
        <path d="M58 42 Q64 40 66 44 Q64 48 60 48 Q56 46 58 42 Z"
          fill="#34D399" opacity="0.7" />
      </g>
    </g>

    {/* Líneas de meridianos y paralelos (fijas, sobre la esfera) */}
    <ellipse cx="40" cy="34" rx="26" ry="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    <ellipse cx="40" cy="34" rx="14" ry="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <ellipse cx="40" cy="34" rx="26" ry="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    <line x1="14" y1="34" x2="66" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
    <line x1="40" y1="8" x2="40" y2="60" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

    {/* Brillo especular */}
    <circle cx="30" cy="24" r="10" fill="rgba(255,255,255,0.15)" />
    <circle cx="28" cy="22" r="5" fill="rgba(255,255,255,0.12)" />

    {/* Borde del globo */}
    <circle cx="40" cy="34" r="26" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

    {/* Avión volando alrededor – orbita */}
    <g style={{ transformOrigin: '40px 34px', animation: 'gc-spin 8s linear infinite' }}>
      <g transform="translate(40 6)">
        <path d="M0 0 L-3 2 L0 -3 L3 2 Z" fill="#F43F5E" />
        <path d="M-5 1 L0 0 L5 1 L0 -0.5 Z" fill="rgba(255,255,255,0.8)" />
      </g>
    </g>

    {/* Estela del avión */}
    <circle cx="40" cy="34" r="28" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"
      strokeDasharray="4 8" style={{ transformOrigin: '40px 34px', animation: 'gc-dash 6s linear infinite' }} />

    {/* Sparkles */}
    <circle cx="8" cy="12" r="1.5" fill="#FCD34D" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="72" cy="10" r="1.3" fill="#60A5FA" style={{ animation: 'gc-twinkle 3.5s ease-in-out 0.8s infinite' }} />
    <circle cx="6" cy="54" r="1.2" fill="#34D399" style={{ animation: 'gc-twinkle 2.8s ease-in-out 1.6s infinite' }} />
    <circle cx="74" cy="56" r="1.4" fill="#F87171" style={{ animation: 'gc-twinkle 2.6s ease-in-out 0.4s infinite' }} />
  </svg>
);

/* 6º Primaria – Llave dorada ornamental */
const GoldenKey = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="ky-shaft" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="25%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="75%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="ky-bow" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="35%" stopColor="#FBBF24" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <radialGradient id="ky-gem" cx="0.35" cy="0.3" r="0.55">
        <stop offset="0%" stopColor="#E0D5FF" />
        <stop offset="30%" stopColor="#A78BFA" />
        <stop offset="60%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#3B0764" />
      </radialGradient>
      <radialGradient id="ky-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(251,191,36,0.35)" />
        <stop offset="50%" stopColor="rgba(251,191,36,0.12)" />
        <stop offset="100%" stopColor="rgba(251,191,36,0)" />
      </radialGradient>
      <radialGradient id="ky-magic" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(167,139,250,0.4)" />
        <stop offset="100%" stopColor="rgba(167,139,250,0)" />
      </radialGradient>
      <filter id="ky-blur">
        <feGaussianBlur stdDeviation="1.5" />
      </filter>
      <filter id="ky-glow-f">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Halo mágico exterior – púrpura */}
    <circle cx="24" cy="34" r="24" fill="url(#ky-magic)"
      style={{ transformOrigin: '24px 34px', animation: 'gc-breathe 5s ease-in-out infinite' }} />
    {/* Halo dorado de fondo */}
    <circle cx="24" cy="34" r="20" fill="url(#ky-glow)"
      style={{ transformOrigin: '24px 34px', animation: 'gc-breathe 4s ease-in-out 0.5s infinite' }} />

    {/* Rayos mágicos desde la gema */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <line key={`ray${i}`}
        x1="24" y1="32"
        x2={24 + 22 * Math.cos(angle * Math.PI / 180)}
        y2={32 + 22 * Math.sin(angle * Math.PI / 180)}
        stroke="#FBBF24" strokeWidth="0.4" opacity="0.15"
        style={{ transformOrigin: '24px 32px', animation: `gc-glow 3s ease-in-out ${i * 0.4}s infinite` }}
      />
    ))}

    {/* Llave – flotación + rotación combinada */}
    <g style={{ transformOrigin: '40px 46px', animation: 'gc-key-float 4s ease-in-out infinite' }}>

      {/* ── Cabeza de la llave (bow) – anillo ornamental ── */}
      {/* Resplandor difuso del anillo */}
      <circle cx="24" cy="32" r="18" fill="#FBBF24" opacity="0.08" filter="url(#ky-blur)" />

      {/* Anillo exterior con doble borde */}
      <circle cx="24" cy="32" r="16.5" fill="url(#ky-bow)" />
      <circle cx="24" cy="32" r="15.5" fill="none" stroke="#FDE68A" strokeWidth="0.5" opacity="0.5" />
      <circle cx="24" cy="32" r="12" fill="rgba(55,30,100,0.75)" />

      {/* Brillo especular en arco superior */}
      <path d="M11 24 A16.5 16.5 0 0 1 37 24" fill="none" stroke="#FEF3C7" strokeWidth="2" opacity="0.35" />
      <path d="M13 22 A14 14 0 0 1 35 22" fill="none" stroke="white" strokeWidth="0.8" opacity="0.2" />

      {/* Bordes del anillo */}
      <circle cx="24" cy="32" r="12" fill="none" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="24" cy="32" r="16.5" fill="none" stroke="#92400E" strokeWidth="0.6" />

      {/* Ornamentos superiores – corona de arcos */}
      <path d="M14 19 Q17 14 20 19 Q22 15 24 19 Q26 15 28 19 Q31 14 34 19"
        stroke="#FCD34D" strokeWidth="0.9" fill="none" />
      <circle cx="24" cy="16" r="2" fill="#FCD34D" />
      <circle cx="24" cy="16" r="1" fill="#FDE68A" />

      {/* Ornamentos laterales */}
      <circle cx="9" cy="32" r="1.5" fill="#FCD34D" />
      <circle cx="9" cy="32" r="0.7" fill="#FDE68A" />
      <circle cx="39" cy="32" r="1.5" fill="#FCD34D" />
      <circle cx="39" cy="32" r="0.7" fill="#FDE68A" />

      {/* Ornamentos inferiores */}
      <path d="M14 45 Q17 50 20 45 Q22 49 24 45 Q26 49 28 45 Q31 50 34 45"
        stroke="#FCD34D" strokeWidth="0.9" fill="none" />
      <circle cx="24" cy="48" r="2" fill="#FCD34D" />
      <circle cx="24" cy="48" r="1" fill="#FDE68A" />

      {/* Filigranas dentro del anillo oscuro */}
      <path d="M16 28 Q20 24 24 28 Q28 24 32 28" stroke="#D97706" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M16 36 Q20 40 24 36 Q28 40 32 36" stroke="#D97706" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M18 26 L18 38" stroke="#D97706" strokeWidth="0.3" opacity="0.25" />
      <path d="M30 26 L30 38" stroke="#D97706" strokeWidth="0.3" opacity="0.25" />

      {/* Gema central – amatista mágica */}
      <g style={{ transformOrigin: '24px 32px', animation: 'gc-pulse 3s ease-in-out infinite' }}>
        {/* Resplandor mágico de la gema */}
        <circle cx="24" cy="32" r="9" fill="#8B5CF6" opacity="0.12" filter="url(#ky-blur)" />
        {/* Gema */}
        <circle cx="24" cy="32" r="6" fill="url(#ky-gem)" />
        {/* Facetas */}
        <path d="M20 29 L24 26 L28 29 L26 35 L22 35 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <path d="M24 26 L24 32 M20 29 L28 29 M22 35 L26 35" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
        {/* Borde dorado */}
        <circle cx="24" cy="32" r="6" fill="none" stroke="#FBBF24" strokeWidth="1.2" />
        <circle cx="24" cy="32" r="6.8" fill="none" stroke="#D97706" strokeWidth="0.4" opacity="0.5" />
        {/* Reflejos */}
        <circle cx="22" cy="29.5" r="2.2" fill="rgba(255,255,255,0.35)" />
        <circle cx="26.5" cy="34" r="1" fill="rgba(255,255,255,0.18)" />
        <circle cx="21" cy="31" r="0.5" fill="white" opacity="0.4" />
      </g>

      {/* ── Vástago (shaft) – más detallado ── */}
      <rect x="38" y="28.5" width="30" height="7" rx="2.5" fill="url(#ky-shaft)" />
      {/* Línea de brillo central */}
      <rect x="40" y="30" width="26" height="2.5" rx="1" fill="rgba(255,255,255,0.22)" />
      {/* Borde superior */}
      <line x1="39" y1="28.5" x2="68" y2="28.5" stroke="#FDE68A" strokeWidth="0.4" opacity="0.4" />
      {/* Grabados en el vástago */}
      <rect x="44" y="27.5" width="2.5" height="9" rx="1" fill="#D97706" opacity="0.3" />
      <rect x="44.5" y="28" width="1.5" height="8" rx="0.8" fill="#FDE68A" opacity="0.1" />
      <rect x="50" y="27.5" width="1.5" height="9" rx="0.8" fill="#D97706" opacity="0.25" />
      <rect x="56" y="27.5" width="2.5" height="9" rx="1" fill="#D97706" opacity="0.3" />
      <rect x="56.5" y="28" width="1.5" height="8" rx="0.8" fill="#FDE68A" opacity="0.1" />

      {/* ── Dientes de la llave (bit) – más elaborados ── */}
      <path d="M63 35.5 L63 45 L59 45 L59 40 L57 40 L57 35.5" fill="url(#ky-shaft)" />
      <path d="M65 35.5 L65 49 L61 49 L61 35.5" fill="url(#ky-shaft)" />
      <path d="M67 35.5 L67 43 L65 43" fill="url(#ky-shaft)" />
      <rect x="67" y="28.5" width="4" height="7" rx="2" fill="#F59E0B" />
      <rect x="68" y="29.5" width="2" height="5" rx="1" fill="#FDE68A" opacity="0.3" />
      {/* Reflejos en dientes */}
      <path d="M59 41 L59 45 L61 45" fill="rgba(255,255,255,0.12)" />
      <path d="M61 36.5 L61 49 L63 49 L63 36.5" fill="rgba(255,255,255,0.08)" />
      <line x1="65" y1="36" x2="65" y2="43" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
    </g>

    {/* Destellos en forma de estrella de 4 puntas */}
    {[
      { x: 8, y: 10, s: 3, d: 0 },
      { x: 74, y: 18, s: 2.5, d: 0.8 },
      { x: 70, y: 65, s: 2, d: 1.6 },
      { x: 12, y: 70, s: 2.8, d: 2.2 },
      { x: 50, y: 8, s: 2, d: 1 },
      { x: 4, y: 48, s: 1.8, d: 1.8 },
    ].map((sp, i) => (
      <g key={`sp${i}`} style={{ transformOrigin: `${sp.x}px ${sp.y}px`, animation: `gc-twinkle 3s ease-in-out ${sp.d}s infinite` }}>
        <line x1={sp.x} y1={sp.y - sp.s} x2={sp.x} y2={sp.y + sp.s} stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" />
        <line x1={sp.x - sp.s} y1={sp.y} x2={sp.x + sp.s} y2={sp.y} stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" />
        <circle cx={sp.x} cy={sp.y} r={sp.s * 0.3} fill="#FDE68A" opacity="0.8" />
      </g>
    ))}

    {/* Partículas mágicas flotantes */}
    {[
      { x: 60, y: 12, color: '#A78BFA', d: 0 },
      { x: 76, y: 42, color: '#FCD34D', d: 0.5 },
      { x: 16, y: 6, color: '#C4B5FD', d: 1.2 },
      { x: 72, y: 72, color: '#FBBF24', d: 1.8 },
      { x: 6, y: 60, color: '#DDD6FE', d: 0.7 },
    ].map((p, i) => (
      <circle key={`mp${i}`} cx={p.x} cy={p.y} r="1" fill={p.color}
        style={{ animation: `gc-bounce 3.5s ease-in-out ${p.d}s infinite` }} />
    ))}

    {/* Ondas mágicas desde la gema */}
    <circle cx="24" cy="32" r="0" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="0.8"
      style={{ animation: 'gc-ripple 3.5s ease-out infinite' }} />
    <circle cx="24" cy="32" r="0" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="0.6"
      style={{ animation: 'gc-ripple 3.5s ease-out 1.75s infinite' }} />
  </svg>
);

/* 1º ESO – Microscopio (colores realistas variados) */
const Microscope = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
      <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      <linearGradient id="mg-lens" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#67E8F9" />
        <stop offset="100%" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>
    {/* Base – dark metal */}
    <rect x="12" y="67" width="56" height="6" rx="3" fill="#1E293B" />
    <rect x="14" y="68" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" />
    <rect x="20" y="58" width="40" height="11" rx="4" fill="#334155" />
    <rect x="22" y="59" width="16" height="5" rx="2" fill="rgba(255,255,255,0.06)" />
    <rect x="16" y="72" width="8" height="2" rx="1" fill="#475569" />
    <rect x="56" y="72" width="8" height="2" rx="1" fill="#475569" />
    {/* Pillar – silver/chrome */}
    <rect x="33" y="18" width="14" height="42" rx="3.5" fill="url(#mg1)" />
    <rect x="35" y="20" width="4" height="38" rx="1.5" fill="rgba(255,255,255,0.35)" />
    <circle cx="40" cy="22" r="1" fill="rgba(0,0,0,0.15)" />
    <circle cx="40" cy="56" r="1" fill="rgba(0,0,0,0.15)" />
    {/* Stage – dark platform with cyan scan */}
    <rect x="22" y="48" width="36" height="5" rx="1.5" fill="#475569" />
    <rect x="22" y="48" width="6" height="5" rx="1" fill="rgba(103,232,249,0.3)"
      style={{ animation: 'gc-scan 3s linear infinite' }} />
    <rect x="26" y="47" width="3" height="7" rx="1" fill="#64748B" />
    <rect x="51" y="47" width="3" height="7" rx="1" fill="#64748B" />
    {/* Tube – subtle rock like adjusting */}
    <g transform="rotate(-25 40 26)" style={{ transformOrigin: '40px 40px', animation: 'gc-rock 6s ease-in-out infinite' }}>
      <rect x="33" y="2" width="14" height="38" rx="4.5" fill="url(#mg2)" />
      <rect x="36" y="4" width="4.5" height="34" rx="1.5" fill="rgba(255,255,255,0.2)" />
      <rect x="31" y="-2" width="18" height="7" rx="3.5" fill="#1E293B" />
      <ellipse cx="40" cy="-2" rx="5" ry="2" fill="rgba(14,165,233,0.3)" />
      <rect x="32" y="38" width="16" height="7" rx="3" fill="#64748B" />
      {/* Lens glow – cyan blue */}
      <circle cx="37" cy="44" r="2.5" fill="url(#mg-lens)" opacity="0.7" style={{ animation: 'gc-glow 3s ease-in-out infinite' }} />
      <circle cx="43" cy="44" r="2.5" fill="url(#mg-lens)" opacity="0.5" style={{ animation: 'gc-glow 3s ease-in-out 0.5s infinite' }} />
    </g>
    {/* Focus knobs – gold/brass */}
    <g style={{ transformOrigin: '52px 34px', animation: 'gc-spin 15s linear infinite' }}>
      <circle cx="52" cy="34" r="5.5" fill="#D97706" />
      <circle cx="52" cy="34" r="3" fill="#FBBF24" />
      <line x1="52" y1="29" x2="52" y2="31" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="57" y1="34" x2="55" y2="34" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
    </g>
    <circle cx="52" cy="34" r="1.2" fill="#FDE68A" />
    <circle cx="52" cy="42" r="3.5" fill="#B45309" />
    {/* Slide – green glowing specimen */}
    <rect x="34" y="49" width="12" height="3" rx="1" fill="rgba(16,185,129,0.6)" style={{ animation: 'gc-glow 2.5s ease-in-out infinite' }} />
    {/* Particles – varied colors */}
    <circle cx="16" cy="12" r="2.5" fill="#22D3EE" opacity="0.6" style={{ animation: 'gc-bounce 3s ease-in-out infinite' }} />
    <circle cx="66" cy="20" r="1.8" fill="#A78BFA" opacity="0.55" style={{ animation: 'gc-bounce 3.5s ease-in-out 0.5s infinite' }} />
    <circle cx="12" cy="40" r="2" fill="#FB7185" opacity="0.5" style={{ animation: 'gc-bounce 2.8s ease-in-out 1s infinite' }} />
    <circle cx="68" cy="50" r="1.5" fill="#FBBF24" opacity="0.45" style={{ animation: 'gc-bounce 3.2s ease-in-out 1.5s infinite' }} />
  </svg>
);

/* 2º ESO – Libro abierto (esquema violeta/índigo) */
const Book = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="bk-pageL" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EDE9FE" />
        <stop offset="100%" stopColor="#DDD6FE" />
      </linearGradient>
      <linearGradient id="bk-pageR" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="100%" stopColor="#EDE9FE" />
      </linearGradient>
      <linearGradient id="bk-spine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#5B21B6" />
      </linearGradient>
    </defs>
    {/* Book shadow */}
    <path d="M41 18 Q29 16 11 20 L11 66 Q29 62 41 64 Q53 62 69 66 L69 20 Q53 16 41 18 Z" fill="rgba(91,33,182,0.1)" />
    {/* Left page – flip animation */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-wave 4s ease-in-out infinite' }}>
      <path d="M40 16 Q26 13 8 18 L8 66 Q26 62 40 64 Z" fill="url(#bk-pageL)" />
      <path d="M10 18 L10 64" stroke="rgba(124,58,237,0.12)" strokeWidth="2" />
      {[26, 32, 38, 44, 50, 56].map((y, i) => (
        <line key={`ll${i}`} x1="16" y1={y} x2={34 - (i % 3) * 2} y2={y}
          stroke={['#8B5CF6','#A78BFA','#7C3AED','#6D28D9','#8B5CF6','#A78BFA'][i]} strokeWidth="0.8" opacity="0.35"
          style={{ animation: `gc-shimmer 3s ease-in-out ${i * 0.3}s infinite` }} />
      ))}
      <rect x="18" y="48" width="8" height="6" rx="1" fill="rgba(139,92,246,0.2)" />
      <circle cx="22" cy="51" r="2" fill="rgba(124,58,237,0.15)" />
    </g>
    {/* Right page */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-wave 4s ease-in-out infinite reverse' }}>
      <path d="M40 16 Q54 13 72 18 L72 66 Q54 62 40 64 Z" fill="url(#bk-pageR)" />
      <path d="M70 18 L70 64" stroke="rgba(124,58,237,0.1)" strokeWidth="2" />
      {[26, 32, 38, 44, 50, 56].map((y, i) => (
        <line key={`rl${i}`} x1="46" y1={y} x2={64 - (i % 3) * 2} y2={y}
          stroke={['#A78BFA','#8B5CF6','#6D28D9','#7C3AED','#A78BFA','#8B5CF6'][i]} strokeWidth="0.8" opacity="0.35"
          style={{ animation: `gc-shimmer 3s ease-in-out ${i * 0.3 + 0.5}s infinite` }} />
      ))}
      <rect x="52" y="46" width="12" height="10" rx="1" fill="rgba(16,185,129,0.15)" />
      {[0, 1, 2, 3].map(i => (
        <rect key={`b${i}`} x={54 + i * 3} y={52 - i * 1.5} width="2" height={4 + i * 1.5} rx="0.5"
          fill={['#34D399','#6EE7B7','#A78BFA','#8B5CF6'][i]} opacity="0.4" />
      ))}
    </g>
    {/* Spine */}
    <line x1="40" y1="16" x2="40" y2="64" stroke="url(#bk-spine)" strokeWidth="2" />
    <path d="M39 16 Q40 40 39 64" stroke="rgba(124,58,237,0.15)" strokeWidth="2.5" fill="none" />
    {/* Back pages */}
    <path d="M40 17 Q27 15 10 19 L9 19 Q26 14.5 40 17" fill="rgba(196,181,253,0.5)" />
    <path d="M40 17 Q53 15 70 19 L71 19 Q54 14.5 40 17" fill="rgba(196,181,253,0.4)" />
    {/* Bookmark – swaying */}
    <g style={{ transformOrigin: '56px 16px', animation: 'gc-swing 3s ease-in-out infinite' }}>
      <path d="M52 16 L52 6 L56 10 L60 6 L60 18" stroke="#F43F5E" strokeWidth="1.5" fill="#F43F5E" opacity="0.75" />
    </g>
    {/* Floating letters – bouncing at different rates */}
    <text x="14" y="10" fill="#F43F5E" fontSize="11" fontWeight="bold" opacity="0.8"
      style={{ animation: 'gc-bounce 2.5s ease-in-out infinite' }}>A</text>
    <text x="58" y="8" fill="#3B82F6" fontSize="10" fontWeight="bold" opacity="0.75"
      style={{ animation: 'gc-bounce 3s ease-in-out 0.4s infinite' }}>β</text>
    <text x="68" y="46" fill="#10B981" fontSize="9" fontWeight="bold" opacity="0.7"
      style={{ animation: 'gc-bounce 3.5s ease-in-out 0.8s infinite' }}>∑</text>
    <text x="2" y="52" fill="#F59E0B" fontSize="8" fontWeight="bold" opacity="0.7"
      style={{ animation: 'gc-bounce 2.8s ease-in-out 1.2s infinite' }}>π</text>
    <text x="36" y="78" fill="#8B5CF6" fontSize="8" fontWeight="bold" opacity="0.65"
      style={{ animation: 'gc-bounce 3.2s ease-in-out 1.6s infinite' }}>∞</text>
  </svg>
);

/* 3º ESO – Átomo (esquema cyan/rosa/verde vibrante) */
const Atom = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <radialGradient id="ag1" cx="0.45" cy="0.42" r="0.5">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="50%" stopColor="#BAE6FD" />
        <stop offset="100%" stopColor="#7DD3FC" />
      </radialGradient>
      {/* Elliptical orbit path for animateMotion */}
      <path id="atom-orbit" d="M 74,40 A 34,12 0 1,1 6,40 A 34,12 0 1,1 74,40" />
    </defs>
    {/* Orbit glows – pulsing, balanced intensity */}
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(56,189,248,0.22)" strokeWidth="5"
      style={{ animation: 'gc-glow 4s ease-in-out infinite' }} />
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(30,64,175,0.25)" strokeWidth="5" transform="rotate(60 40 40)"
      style={{ animation: 'gc-glow 4s ease-in-out 1.3s infinite' }} />
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(52,211,153,0.22)" strokeWidth="5" transform="rotate(-60 40 40)"
      style={{ animation: 'gc-glow 4s ease-in-out 2.6s infinite' }} />
    {/* Orbit paths – dashed animated draw, balanced opacity */}
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5"
      style={{ animation: 'gc-dash 8s linear infinite' }} />
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="#1E40AF" strokeWidth="1.2" strokeDasharray="3 2" transform="rotate(60 40 40)" opacity="0.5"
      style={{ animation: 'gc-dash 10s linear infinite' }} />
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="#34D399" strokeWidth="1.2" strokeDasharray="3 2" transform="rotate(-60 40 40)" opacity="0.5"
      style={{ animation: 'gc-dash 9s linear infinite' }} />
    {/* Nucleus – breathing */}
    <circle cx="40" cy="40" r="10" fill="rgba(56,189,248,0.1)" />
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-breathe 3s ease-in-out infinite' }}>
      <circle cx="40" cy="40" r="8" fill="url(#ag1)" />
      <circle cx="37" cy="38" r="3.5" fill="#FB7185" opacity="0.5" />
      <circle cx="43" cy="38" r="3" fill="#60A5FA" opacity="0.45" />
      <circle cx="40" cy="43" r="3.2" fill="#FB7185" opacity="0.4" />
      <circle cx="38" cy="41" r="2.5" fill="#818CF8" opacity="0.35" />
      <circle cx="37" cy="37" r="2.5" fill="rgba(255,255,255,0.55)" />
    </g>
    {/* Electrons – following exact orbit ellipses */}
    {/* Electron 1 – cyan, follows horizontal orbit */}
    <g>
      <g>
        <animateMotion dur="3.5s" repeatCount="indefinite" begin="0s">
          <mpath href="#atom-orbit" />
        </animateMotion>
        <circle r="4.5" fill="#0EA5E9" />
        <circle r="2" cx="-1" cy="-1" fill="#67E8F9" />
      </g>
    </g>
    {/* Electron 2 – dark blue, follows 60° rotated orbit */}
    <g transform="rotate(60 40 40)">
      <g>
        <animateMotion dur="4.5s" repeatCount="indefinite" begin="-1.5s">
          <mpath href="#atom-orbit" />
        </animateMotion>
        <circle r="4" fill="#1E40AF" />
        <circle r="1.5" cx="-1" cy="-1" fill="#93C5FD" />
      </g>
    </g>
    {/* Electron 3 – green, follows -60° rotated orbit */}
    <g transform="rotate(-60 40 40)">
      <g>
        <animateMotion dur="4s" repeatCount="indefinite" begin="-2.5s">
          <mpath href="#atom-orbit" />
        </animateMotion>
        <circle r="4" fill="#10B981" />
        <circle r="1.5" cx="-1" cy="-1" fill="#A7F3D0" />
      </g>
    </g>
    {/* Energy ripple from nucleus */}
    <circle cx="40" cy="40" r="0" fill="none" stroke="#38BDF8" strokeWidth="0.6" opacity="0.3"
      style={{ animation: 'gc-ripple 3s ease-out infinite' }} />
    <circle cx="40" cy="40" r="0" fill="none" stroke="#1E40AF" strokeWidth="0.6" opacity="0.25"
      style={{ animation: 'gc-ripple 3s ease-out 1.5s infinite' }} />
  </svg>
);

/* 4º ESO – Birrete con diploma (esquema azul marino/dorado) */
const GradCap = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="gc-board" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E3A5F" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="gc-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E3A5F" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <polygon points="41,11 77,27 41,39 5,27" fill="rgba(0,0,0,0.08)" />
    {/* Board – gentle sway */}
    <g style={{ transformOrigin: '40px 27px', animation: 'gc-sway 5s ease-in-out infinite' }}>
      <polygon points="40,10 78,27 40,39 2,27" fill="url(#gc-board)" />
      <polygon points="40,10 78,27 40,27" fill="rgba(255,255,255,0.08)" />
      <line x1="2" y1="27" x2="78" y2="27" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    </g>
    {/* Band */}
    <path d="M12 29 L12 47 Q22 59 40 59 Q58 59 68 47 L68 29 L40 39 Z" fill="url(#gc-band)" />
    <path d="M12 29 L12 42 Q22 52 40 52 L40 39 Z" fill="rgba(255,255,255,0.06)" />
    <path d="M14 29 L14 46 Q24 57 40 57" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
    <path d="M66 29 L66 46 Q56 57 40 57" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
    {/* Button – pulsing gold */}
    <circle cx="40" cy="27" r="3.5" fill="#FBBF24" style={{ transformOrigin: '40px 27px', animation: 'gc-pulse 3s ease-in-out infinite' }} />
    <circle cx="40" cy="27" r="2.5" fill="#F59E0B" />
    <circle cx="39" cy="26" r="1.2" fill="#FDE68A" />
    {/* Tassel string */}
    <path d="M40 27 Q50 25 58 26 Q64 27 68 26" stroke="#FBBF24" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {/* Tassel – animated swing */}
    <g style={{ transformOrigin: '68px 26px', animation: 'gc-tassel 3s ease-in-out infinite' }}>
      <line x1="68" y1="26" x2="68" y2="50" stroke="#FBBF24" strokeWidth="2" />
      <circle cx="68" cy="48" r="2.5" fill="#F59E0B" style={{ transformOrigin: '68px 48px', animation: 'gc-breathe 2s ease-in-out infinite' }} />
      <circle cx="67.5" cy="47.5" r="1" fill="#FDE68A" />
      <path d="M64 50 L63 60 M65.5 50 L65 59 M67 50 L67 60 M68.5 50 L69 59 M70 50 L71 60 M72 50 L73 58"
        stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
      {[63, 65, 67, 69, 71, 73].map((x, i) => (
        <circle key={`ft${i}`} cx={x} cy={58 + (i % 2) * 2} r="0.8" fill="#FDE68A"
          style={{ animation: `gc-glow 2s ease-in-out ${i * 0.3}s infinite` }} />
      ))}
    </g>
    {/* Floating stars celebration */}
    {[
      { x: 10, y: 60, size: 5, color: '#FBBF24', delay: 0 },
      { x: 30, y: 65, size: 4, color: '#F43F5E', delay: 0.8 },
      { x: 50, y: 63, size: 5.5, color: '#38BDF8', delay: 0.4 },
      { x: 70, y: 58, size: 4.5, color: '#A78BFA', delay: 1.2 },
      { x: 22, y: 72, size: 3.5, color: '#34D399', delay: 1.6 },
      { x: 58, y: 73, size: 3.8, color: '#FB923C', delay: 0.6 },
      { x: 40, y: 75, size: 4.2, color: '#FBBF24', delay: 1 },
    ].map((s, i) => (
      <g key={`star${i}`} style={{ transformOrigin: `${s.x}px ${s.y}px`, animation: `gc-star-float 3s ease-in-out ${s.delay}s infinite` }}>
        <polygon
          points={Array.from({ length: 5 }, (_, j) => {
            const outer = s.size;
            const inner = s.size * 0.4;
            const a1 = (j * 72 - 90) * Math.PI / 180;
            const a2 = ((j * 72 + 36) - 90) * Math.PI / 180;
            return `${s.x + outer * Math.cos(a1)},${s.y + outer * Math.sin(a1)} ${s.x + inner * Math.cos(a2)},${s.y + inner * Math.sin(a2)}`;
          }).join(' ')}
          fill={s.color}
          opacity="0.85"
        />
        <circle cx={s.x - s.size * 0.2} cy={s.y - s.size * 0.2} r={s.size * 0.18} fill="white" opacity="0.5" />
      </g>
    ))}
    {/* Celebration sparkles */}
    <circle cx="20" cy="8" r="1.5" fill="#FBBF24" style={{ animation: 'gc-bounce 2.5s ease-in-out infinite' }} />
    <circle cx="60" cy="6" r="1.2" fill="#F43F5E" style={{ animation: 'gc-bounce 3s ease-in-out 0.5s infinite' }} />
    <circle cx="74" cy="16" r="1" fill="#38BDF8" style={{ animation: 'gc-bounce 2.8s ease-in-out 1s infinite' }} />
  </svg>
);

/* 1º Bachillerato – Telescopio apuntando a constelación */
const Telescope = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="tl-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E0E7FF" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
      <linearGradient id="tl-tube" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
      {/* Anillo metálico exterior de la lente (dorado-platino) */}
      <linearGradient id="tl-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F1F5F9" />
        <stop offset="45%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      {/* Cristal de la lente – cielo nocturno profundo */}
      <radialGradient id="tl-lens" cx="35%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#DBEAFE" />
        <stop offset="30%" stopColor="#60A5FA" />
        <stop offset="75%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0F172A" />
      </radialGradient>
      {/* Reflejo de cristal */}
      <radialGradient id="tl-glint" cx="30%" cy="25%" r="40%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    {/* Constelación de fondo */}
    {[
      { x: 8, y: 8 }, { x: 22, y: 5 }, { x: 16, y: 16 }, { x: 4, y: 20 },
      { x: 62, y: 6 }, { x: 72, y: 14 }, { x: 66, y: 22 },
    ].map((s, i) => (
      <circle key={`cs${i}`} cx={s.x} cy={s.y} r={1 + (i % 3) * 0.4} fill="#FDE68A" opacity="0.7"
        style={{ animation: `gc-twinkle ${2.5 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }} />
    ))}
    {/* Constellation lines */}
    <path d="M8 8 L22 5 L16 16 L4 20" stroke="rgba(253,224,71,0.2)" strokeWidth="0.6" fill="none"
      strokeDasharray="2 2" style={{ animation: 'gc-shimmer 4s ease-in-out infinite' }} />
    <path d="M62 6 L72 14 L66 22" stroke="rgba(253,224,71,0.15)" strokeWidth="0.6" fill="none"
      strokeDasharray="2 2" style={{ animation: 'gc-shimmer 4s ease-in-out 1s infinite' }} />

    {/* Trípode */}
    <line x1="38" y1="52" x2="22" y2="74" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="52" x2="58" y2="74" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="54" x2="40" y2="76" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Pies del trípode */}
    <circle cx="22" cy="74" r="2" fill="#475569" />
    <circle cx="58" cy="74" r="2" fill="#475569" />
    <circle cx="40" cy="76" r="2" fill="#475569" />

    {/* Tubo del telescopio – gentle sway */}
    <g style={{ transformOrigin: '40px 48px', animation: 'gc-sway 5s ease-in-out infinite' }}>
      {/* Tubo principal */}
      <rect x="16" y="28" width="48" height="16" rx="8" fill="url(#tl-tube)" transform="rotate(-25 40 36)" />
      <rect x="16" y="28" width="24" height="16" rx="8" fill="rgba(255,255,255,0.08)" transform="rotate(-25 40 36)" />
      {/* Franjas decorativas del tubo */}
      <rect x="28" y="30" width="3" height="12" rx="1" fill="rgba(255,255,255,0.15)" transform="rotate(-25 40 36)" />
      <rect x="48" y="30" width="3" height="12" rx="1" fill="rgba(255,255,255,0.1)" transform="rotate(-25 40 36)" />

      {/* === MIRILLA / FINDERSCOPE — más grande, separada del tubo, con barras de apoyo === */}
      <g transform="rotate(-25 40 36)">
        {/* Barras verticales de apoyo (del tubo al visor) */}
        <rect x="30" y="20" width="1.5" height="8" rx="0.5" fill="#475569" />
        <rect x="39" y="20" width="1.5" height="8" rx="0.5" fill="#475569" />
        {/* Tubo del visor (más grande y separado) */}
        <rect x="25" y="17" width="22" height="5.5" rx="2.5" fill="#4338CA" stroke="#312E81" strokeWidth="0.6" />
        {/* Brillo superior del tubo del visor */}
        <rect x="28" y="17.5" width="16" height="1.5" rx="0.75" fill="rgba(255,255,255,0.12)" />
        {/* Lente frontal del visor */}
        <circle cx="25" cy="19.8" r="3.5" fill="#3B82F6" stroke="#475569" strokeWidth="1" />
        <circle cx="25" cy="19.8" r="2" fill="#1E3A8A" opacity="0.5" />
        <circle cx="24" cy="18.8" r="1" fill="rgba(255,255,255,0.35)" />
        {/* Ocular del visor */}
        <circle cx="47" cy="19.8" r="2.8" fill="#312E81" stroke="#475569" strokeWidth="0.7" />
        <circle cx="47" cy="19.8" r="1.5" fill="#1E1B4B" />
        <circle cx="46.5" cy="19.2" r="0.6" fill="rgba(255,255,255,0.2)" />
      </g>

      {/* Ocular trasero mejorado */}
      <circle cx="60" cy="46" r="6" fill="#312E81" stroke="#4338CA" strokeWidth="1.5" />
      <circle cx="60" cy="46" r="4" fill="#1E1B4B" />
      <circle cx="60" cy="46" r="2.5" fill="#0F172A" />
      <circle cx="58.5" cy="44.5" r="1.2" fill="rgba(255,255,255,0.2)" />

      {/* Pivote mejorado */}
      <circle cx="40" cy="48" r="4.5" fill="#475569" stroke="#334155" strokeWidth="1.5" />
      <circle cx="40" cy="48" r="2.5" fill="#64748B" />
      <circle cx="39" cy="47" r="1" fill="rgba(255,255,255,0.3)" />
    </g>

    {/* Anillos de descubrimiento desde la lente */}
    <circle cx="22" cy="24" r="0" fill="none" stroke="rgba(147,197,253,0.25)" strokeWidth="0.6"
      style={{ animation: 'gc-ripple 3s ease-out infinite' }} />

    {/* Sparkles */}
    <circle cx="6" cy="40" r="1.5" fill="#A78BFA" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="74" cy="36" r="1.2" fill="#FDE68A" style={{ animation: 'gc-twinkle 2.5s ease-in-out 0.8s infinite' }} />
    <circle cx="48" cy="8" r="1" fill="#34D399" style={{ animation: 'gc-twinkle 3.5s ease-in-out 1.5s infinite' }} />
  </svg>
);

/* 2º Bachillerato – Pergamino-diploma con sello y pluma */
const Diploma = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="dp-paper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF9C3" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <linearGradient id="dp-roll" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="dp-seal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="dp-quill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="100%" stopColor="#C4B5FD" />
      </linearGradient>
    </defs>

    {/* Sombra del diploma */}
    <rect x="12" y="16" width="56" height="52" rx="4" fill="rgba(0,0,0,0.06)" />

    {/* Cuerpo del pergamino – gentle sway */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-sway 5s ease-in-out infinite' }}>
      {/* Papel */}
      <rect x="10" y="14" width="56" height="52" rx="3" fill="url(#dp-paper)" />
      <rect x="10" y="14" width="28" height="52" rx="3" fill="rgba(255,255,255,0.15)" />
      {/* Borde decorativo */}
      <rect x="14" y="18" width="48" height="44" rx="2" fill="none" stroke="#D97706" strokeWidth="0.8" strokeDasharray="4 2" opacity="0.4" />

      {/* Texto escrito a mano – apareciendo */}
      <g style={{ animation: 'gc-name1 6s ease-in-out infinite' }}>
        <text x="24" y="30" fill="#92400E" fontSize="6" fontWeight="bold" fontStyle="italic" opacity="0.7">Diploma</text>
      </g>
      {/* Líneas de texto */}
      {[36, 40, 44, 48].map((y, i) => (
        <line key={`tl${i}`} x1="20" y1={y} x2={54 - i * 4} y2={y} stroke="#D97706" strokeWidth="0.6" opacity="0.25"
          strokeDasharray="30" style={{ animation: `gc-line-write 6s ease-in-out ${i * 0.3}s infinite` }} />
      ))}

      {/* Rulo superior */}
      <ellipse cx="38" cy="14" rx="30" ry="4" fill="url(#dp-roll)" />
      <ellipse cx="38" cy="14" rx="28" ry="2.5" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="38" cy="14" rx="30" ry="4" fill="none" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />

      {/* Rulo inferior */}
      <ellipse cx="38" cy="66" rx="30" ry="4" fill="url(#dp-roll)" />
      <ellipse cx="38" cy="66" rx="28" ry="2.5" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="38" cy="66" rx="30" ry="4" fill="none" stroke="#B45309" strokeWidth="0.5" opacity="0.3" />
    </g>

    {/* Sello de cera – pulsando */}
    <g style={{ transformOrigin: '54px 56px', animation: 'gc-breathe 3s ease-in-out infinite' }}>
      <circle cx="54" cy="56" r="8" fill="url(#dp-seal)" />
      <circle cx="54" cy="56" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <circle cx="54" cy="56" r="4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      {/* Estrella en el sello */}
      <polygon points="54,50 55.5,53.5 59,54 56,56.5 57,60 54,58 51,60 52,56.5 49,54 52.5,53.5"
        fill="#FDE68A" opacity="0.8" />
      <circle cx="53" cy="54.5" r="0.8" fill="rgba(255,255,255,0.3)" />
    </g>
    {/* Cintas del sello */}
    <g style={{ transformOrigin: '54px 64px', animation: 'gc-tassel 3s ease-in-out infinite' }}>
      <path d="M50 62 Q48 68 46 74" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M58 62 Q60 68 62 74" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>

    {/* Pluma – escribiendo */}
    <g style={{ transformOrigin: '68px 28px', animation: 'gc-swing 3s ease-in-out infinite' }}>
      <path d="M66 8 Q72 16 68 28" stroke="url(#dp-quill)" strokeWidth="2" fill="none" />
      <path d="M66 8 Q60 12 64 18 Q68 14 66 8 Z" fill="url(#dp-quill)" />
      <path d="M66 9 Q62 12 64.5 16" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" fill="none" />
      <line x1="68" y1="28" x2="68.5" y2="30" stroke="#92400E" strokeWidth="0.8" strokeLinecap="round" />
      {/* Tinta goteando */}
      <circle cx="69" cy="32" r="1" fill="#92400E" opacity="0.4"
        style={{ animation: 'gc-rise 3s ease-out infinite' }} />
    </g>

    {/* Estrellas celebración */}
    <circle cx="4" cy="30" r="1.5" fill="#FBBF24" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="76" cy="22" r="1.2" fill="#A78BFA" style={{ animation: 'gc-twinkle 2.5s ease-in-out 0.5s infinite' }} />
    <circle cx="6" cy="70" r="1" fill="#34D399" style={{ animation: 'gc-twinkle 3.5s ease-in-out 1s infinite' }} />
    <circle cx="76" cy="60" r="1.3" fill="#FB7185" style={{ animation: 'gc-twinkle 2.8s ease-in-out 1.5s infinite' }} />
  </svg>
);

/* Audición y Lenguaje – Oído con ondas y bocadillo de conversación */
const ALCard = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="al-ear" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FED7AA" />
        <stop offset="100%" stopColor="#FDBA74" />
      </linearGradient>
      <linearGradient id="al-bubble" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFF7ED" />
        <stop offset="100%" stopColor="#FFEDD5" />
      </linearGradient>
    </defs>

    {/* Ondas de sonido grandes – pulsando */}
    <path d="M10 20 Q4 30 4 40 Q4 50 10 60" stroke="rgba(251,146,60,0.15)" strokeWidth="2" strokeLinecap="round" fill="none"
      style={{ animation: 'gc-shimmer 3s ease-in-out infinite' }} />
    <path d="M14 24 Q9 32 9 40 Q9 48 14 56" stroke="rgba(251,146,60,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none"
      style={{ animation: 'gc-shimmer 3s ease-in-out 0.4s infinite' }} />
    <path d="M18 28 Q14 34 14 40 Q14 46 18 52" stroke="rgba(251,146,60,0.25)" strokeWidth="1.2" strokeLinecap="round" fill="none"
      style={{ animation: 'gc-shimmer 3s ease-in-out 0.8s infinite' }} />

    {/* Oído principal – breathing */}
    <g style={{ transformOrigin: '32px 40px', animation: 'gc-breathe 4s ease-in-out infinite' }}>
      <path d="M34 16 Q20 18 20 34 Q20 54 32 58 Q38 60 38 54 Q28 50 28 38 Q28 24 36 20"
        stroke="#EA580C" strokeWidth="3" fill="url(#al-ear)" strokeLinecap="round" />
      {/* Canal auditivo */}
      <circle cx="32" cy="38" r="5" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.2" />
      <circle cx="32" cy="38" r="2.5" fill="#EA580C" opacity="0.3" />
      <circle cx="31" cy="37" r="1" fill="rgba(255,255,255,0.4)" />
    </g>

    {/* Bocadillo de diálogo – floating */}
    <g style={{ animation: 'gc-float 3.5s ease-in-out infinite' }}>
      <rect x="46" y="8" width="28" height="22" rx="8" fill="url(#al-bubble)" stroke="#FB923C" strokeWidth="1.2" />
      <path d="M52 30 L48 36 L58 30" fill="url(#al-bubble)" stroke="#FB923C" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Letras dentro */}
      <text x="52" y="18" fill="#EA580C" fontSize="6" fontWeight="bold" opacity="0.8"
        style={{ animation: 'gc-breathe 2.5s ease-in-out infinite', transformOrigin: '56px 16px' }}>Aa</text>
      {/* Líneas de texto */}
      <line x1="50" y1="23" x2="70" y2="23" stroke="#FDBA74" strokeWidth="0.8" opacity="0.5" />
      <line x1="50" y1="26" x2="66" y2="26" stroke="#FDBA74" strokeWidth="0.6" opacity="0.4" />
    </g>

    {/* Notas musicales – simbolizando sonido */}
    <g style={{ animation: 'gc-bounce 3s ease-in-out infinite' }}>
      <text x="44" y="52" fill="#FB923C" fontSize="10" opacity="0.5">♪</text>
    </g>
    <g style={{ animation: 'gc-bounce 2.5s ease-in-out 0.8s infinite' }}>
      <text x="58" y="46" fill="#FDBA74" fontSize="8" opacity="0.4">♫</text>
    </g>

    {/* Ondas de vibración circulares */}
    <circle cx="32" cy="38" r="0" fill="none" stroke="rgba(234,88,12,0.2)" strokeWidth="0.8"
      style={{ animation: 'gc-ripple 2.5s ease-out infinite' }} />
    <circle cx="32" cy="38" r="0" fill="none" stroke="rgba(234,88,12,0.15)" strokeWidth="0.6"
      style={{ animation: 'gc-ripple 2.5s ease-out 1.2s infinite' }} />

    {/* Sparkles */}
    <circle cx="68" cy="60" r="1.5" fill="#FDE68A" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="8" cy="66" r="1.2" fill="#FB923C" style={{ animation: 'gc-twinkle 2.5s ease-in-out 0.5s infinite' }} />
    <circle cx="72" cy="40" r="1" fill="#FDBA74" style={{ animation: 'gc-twinkle 3.5s ease-in-out 1s infinite' }} />
  </svg>
);

/* Pedagogía Terapéutica – Cerebro con piezas de puzzle y corazón */
/* Pedagogía Terapéutica – Varios objetos distribuidos: diana, engranajes, cartas, corazón, bombilla */
const PTCard = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="pt-gear" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
      <linearGradient id="pt-bulb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
      <linearGradient id="pt-card" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>

    {/* Conexiones entre objetos – líneas punteadas */}
    <path d="M18 28 Q40 40 62 28" stroke="#5EEAD4" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.3"
      style={{ animation: 'gc-dash 5s linear infinite' }} />
    <path d="M14 58 Q40 50 66 58" stroke="#99F6E4" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.25"
      style={{ animation: 'gc-dash 6s linear infinite' }} />

    {/* 1. Diana (Atención) – arriba izquierda */}
    <g style={{ transformOrigin: '16px 26px', animation: 'gc-breathe 3.5s ease-in-out infinite' }}>
      <circle cx="16" cy="26" r="12" fill="none" stroke="#F87171" strokeWidth="1.5" opacity="0.4" />
      <circle cx="16" cy="26" r="8" fill="none" stroke="#FCA5A5" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="26" r="4" fill="#FEE2E2" stroke="#F87171" strokeWidth="1.2" />
      <circle cx="16" cy="26" r="1.8" fill="#EF4444" />
      <circle cx="15.5" cy="25.5" r="0.7" fill="rgba(255,255,255,0.4)" />
      {/* Líneas de foco */}
      <line x1="16" y1="12" x2="16" y2="14" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" opacity="0.5"
        style={{ animation: 'gc-shimmer 2s ease-in-out infinite' }} />
      <line x1="28" y1="26" x2="30" y2="26" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" opacity="0.5"
        style={{ animation: 'gc-shimmer 2s ease-in-out 0.5s infinite' }} />
    </g>

    {/* 2. Engranajes (Funciones ejecutivas) – arriba derecha */}
    <g style={{ transformOrigin: '62px 28px', animation: 'gc-spin 10s linear infinite' }}>
      <circle cx="62" cy="28" r="9" fill="rgba(13,148,136,0.12)" stroke="url(#pt-gear)" strokeWidth="1.2" />
      <circle cx="62" cy="28" r="4" fill="#0D9488" />
      <circle cx="62" cy="28" r="2" fill="#CCFBF1" />
      {[0, 51, 102, 153, 204, 255, 306].map((a, i) => (
        <rect key={`g${i}`} x="60.5" y="18" width="3" height="3.5" rx="0.6" fill="#14B8A6" opacity="0.8"
          transform={`rotate(${a} 62 28)`} />
      ))}
    </g>
    {/* Engranaje pequeño acoplado */}
    <g style={{ transformOrigin: '52px 20px', animation: 'gc-spin 7s linear infinite reverse' }}>
      <circle cx="52" cy="20" r="5" fill="rgba(20,184,166,0.1)" stroke="#14B8A6" strokeWidth="0.8" />
      <circle cx="52" cy="20" r="2.2" fill="#14B8A6" />
      <circle cx="52" cy="20" r="1" fill="#CCFBF1" />
      {[0, 72, 144, 216, 288].map((a, i) => (
        <rect key={`gs${i}`} x="51" y="14.5" width="2" height="2.2" rx="0.4" fill="#2DD4BF" opacity="0.7"
          transform={`rotate(${a} 52 20)`} />
      ))}
    </g>

    {/* 3. Cartas de memoria – abajo izquierda */}
    <g style={{ transformOrigin: '16px 58px', animation: 'gc-rock 3.5s ease-in-out infinite' }}>
      {/* Carta trasera */}
      <rect x="6" y="48" width="14" height="18" rx="2.5" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="1"
        transform="rotate(-8 13 57)" />
      {/* Carta frontal */}
      <rect x="10" y="50" width="14" height="18" rx="2.5" fill="url(#pt-card)" stroke="#7C3AED" strokeWidth="1"
        transform="rotate(5 17 59)" />
      <text x="14" y="62" fill="white" fontSize="9" fontWeight="bold" opacity="0.9"
        transform="rotate(5 17 59)">?</text>
    </g>

    {/* 4. Bombilla (Razonamiento) – abajo derecha */}
    <g style={{ transformOrigin: '64px 56px', animation: 'gc-bounce 3s ease-in-out infinite' }}>
      <path d="M64 46 Q56 46 56 56 Q56 62 60 64 L60 68 L68 68 L68 64 Q72 62 72 56 Q72 46 64 46"
        fill="url(#pt-bulb)" stroke="#D97706" strokeWidth="1" />
      <path d="M64 47 Q59 47 58 54" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
      {/* Base */}
      <rect x="60" y="68" width="8" height="2" rx="0.8" fill="#D97706" />
      <rect x="61" y="70" width="6" height="1.5" rx="0.5" fill="#B45309" />
      {/* Filamento */}
      <path d="M62 58 Q64 54 66 58" stroke="#F59E0B" strokeWidth="0.8" fill="none"
        style={{ animation: 'gc-glow 2s ease-in-out infinite' }} />
      {/* Rayos */}
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <line key={`r${i}`} x1="64" y1="42" x2="64" y2="44" stroke="#FBBF24" strokeWidth="0.8" strokeLinecap="round"
          transform={`rotate(${a} 64 56)`} opacity="0.5"
          style={{ animation: `gc-shimmer 2.5s ease-in-out ${i * 0.3}s infinite` }} />
      ))}
    </g>

    {/* Sparkles */}
    <circle cx="38" cy="8" r="1.5" fill="#FDE68A" style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="4" cy="44" r="1.2" fill="#2DD4BF" style={{ animation: 'gc-twinkle 2.5s ease-in-out 0.5s infinite' }} />
    <circle cx="76" cy="48" r="1" fill="#FB7185" style={{ animation: 'gc-twinkle 3.5s ease-in-out 1s infinite' }} />
    <circle cx="40" cy="44" r="1.3" fill="#A78BFA" style={{ animation: 'gc-twinkle 2.8s ease-in-out 1.5s infinite' }} />
  </svg>
);

/* ── Icon map ────────────────────────────────────────────────── */
const iconMap = {
  'primaria-1': { Component: Backpack, cls: 'gc-backpack' },
  'primaria-2': { Component: Notebook, cls: 'gc-notebook' },
  'primaria-3': { Component: Rocket, cls: 'gc-rocket' },
  'primaria-4': { Component: Compass, cls: 'gc-compass' },
  'primaria-5': { Component: Globe, cls: 'gc-globe' },
  'primaria-6': { Component: GoldenKey, cls: 'gc-key' },
  'eso-1': { Component: Microscope, cls: 'gc-microscope' },
  'eso-2': { Component: Book, cls: 'gc-book' },
  'eso-3': { Component: Atom, cls: 'gc-atom' },
  'eso-4': { Component: GradCap, cls: 'gc-gradcap' },
  'bachillerato-1': { Component: Telescope, cls: 'gc-telescope' },
  'bachillerato-2': { Component: Diploma, cls: 'gc-diploma' },
  'ad-1': { Component: PTCard, cls: 'gc-ptcard' },
};

const GradeCardIcon = ({ type, grade, className = '' }) => {
  useEffect(() => { injectStyles(); }, []);

  const entry = iconMap[`${type}-${grade}`];
  if (!entry) return null;

  const { Component, cls } = entry;
  const size = type === 'primaria' ? 160 : type === 'bachillerato' ? 150 : 155;

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
