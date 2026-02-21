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

/* 2º Primaria – Cuaderno abierto con lápiz */
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

      {/* Contraportada verde (asoma por detrás) */}
      <path d="M4 34 Q4 20 38 20 L38 72 Q4 72 4 62 Z" fill="url(#nb-cover)" />
      <path d="M76 34 Q76 20 42 20 L42 72 Q76 72 76 62 Z" fill="url(#nb-cover)" />
      {/* Bordes de cubierta */}
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

      {/* Espiral del cuaderno */}
      {[26, 32, 38, 44, 50, 56, 62].map((y, i) => (
        <g key={`sp${i}`}>
          <circle cx="40" cy={y} r="2.5" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
          <circle cx="40" cy={y} r="1" fill="#CBD5E1" />
        </g>
      ))}

      {/* ── Contenido página izquierda: líneas de texto ── */}
      {[28, 33, 38, 43, 48, 53, 58].map((y, i) => (
        <line key={`tl${i}`} x1="14" y1={y} x2={28 - (i % 3)} y2={y}
          stroke="rgba(59,130,246,0.3)" strokeWidth="0.8" strokeLinecap="round"
          strokeDasharray={i < 5 ? 'none' : '3 2'}
          style={i >= 5 ? { animation: `gc-draw 3s ease-in-out ${i * 0.3}s infinite` } : undefined} />
      ))}
      {/* Título "ABC" en la página izquierda */}
      <text x="21" y="28" textAnchor="middle" fill="#2563EB" fontSize="5" fontWeight="bold" fontFamily="Fredoka, sans-serif"
        style={{ animation: 'gc-glow 3s ease-in-out infinite' }}>ABC</text>

      {/* ── Contenido página derecha: dibujitos infantiles ── */}
      {/* Sol */}
      <g style={{ transformOrigin: '56px 32px', animation: 'gc-breathe 3.5s ease-in-out infinite' }}>
        <circle cx="56" cy="32" r="4" fill="#FBBF24" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <line key={`ray${i}`} x1="56" y1="26" x2="56" y2="24"
            stroke="#FBBF24" strokeWidth="1" strokeLinecap="round"
            transform={`rotate(${deg} 56 32)`} />
        ))}
      </g>

      {/* Casita */}
      <rect x="48" y="48" width="12" height="10" rx="1" fill="#F87171" opacity="0.6" />
      <path d="M46 48 L54 41 L62 48" stroke="#DC2626" strokeWidth="1.2" fill="#FCA5A5" opacity="0.6" strokeLinejoin="round" />
      <rect x="52" y="52" width="4" height="6" rx="0.5" fill="#92400E" opacity="0.4" />
      <rect x="49" y="50" width="3" height="3" rx="0.3" fill="#93C5FD" opacity="0.5" />

      {/* Flor */}
      <g style={{ transformOrigin: '64px 56px', animation: 'gc-sway 4s ease-in-out infinite' }}>
        <line x1="64" y1="56" x2="64" y2="64" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="64" cy="54" r="2.5" fill="#F472B6" opacity="0.6" />
        <circle cx="64" cy="54" r="1.2" fill="#FBBF24" opacity="0.7" />
        {/* Pétalos */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <circle key={`pt${i}`} cx="64" cy="51.5" r="1.5" fill="#F9A8D4" opacity="0.5"
            transform={`rotate(${deg} 64 54)`} />
        ))}
      </g>

      {/* Nube pequeña */}
      <g opacity="0.4">
        <ellipse cx="50" cy="30" rx="4" ry="2.5" fill="#93C5FD" />
        <ellipse cx="47" cy="30" rx="2.5" ry="2" fill="#93C5FD" />
        <ellipse cx="53" cy="30" rx="2.5" ry="2" fill="#93C5FD" />
      </g>
    </g>

    {/* ── Lápiz escribiendo – encima del cuaderno ── */}
    <g style={{ transformOrigin: '28px 66px', animation: 'gc-swing 2.5s ease-in-out infinite' }}>
      <g transform="rotate(-45 28 66)">
        <rect x="25" y="32" width="6" height="34" rx="1.2" fill="#FBBF24" />
        <rect x="25" y="32" width="6" height="5" rx="1.2" fill="#F59E0B" />
        <rect x="25" y="32" width="2.5" height="34" rx="0.8" fill="rgba(255,255,255,0.18)" />
        {/* Banda metálica + goma */}
        <rect x="24.5" y="31" width="7" height="4" rx="0.5" fill="#94A3B8" />
        <rect x="24.5" y="28" width="7" height="4" rx="1.5" fill="#F9A8D4" />
        {/* Punta */}
        <path d="M25 66 L28 72 L31 66 Z" fill="#FBBF24" />
        <path d="M27 66 L28 70 L29 66 Z" fill="#FDE68A" />
        <line x1="28" y1="69" x2="28" y2="72" stroke="#1C1917" strokeWidth="0.8" />
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
        <stop offset="30%" stopColor="#FCD34D" />
        <stop offset="70%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="ky-bow" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#92400E" />
      </linearGradient>
      <radialGradient id="ky-gem" cx="0.4" cy="0.35" r="0.5">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#4C1D95" />
      </radialGradient>
      <radialGradient id="ky-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(251,191,36,0.25)" />
        <stop offset="100%" stopColor="rgba(251,191,36,0)" />
      </radialGradient>
    </defs>

    {/* Halo dorado de fondo */}
    <circle cx="22" cy="34" r="20" fill="url(#ky-glow)"
      style={{ transformOrigin: '22px 34px', animation: 'gc-breathe 4s ease-in-out infinite' }} />

    {/* Llave – flotación + rotación combinada */}
    <g style={{ transformOrigin: '40px 46px', animation: 'gc-key-float 4s ease-in-out infinite' }}>

      {/* ── Cabeza de la llave (bow) – anillo ornamental ── */}
      {/* Anillo exterior */}
      <circle cx="24" cy="32" r="16" fill="url(#ky-bow)" />
      <circle cx="24" cy="32" r="12.5" fill="rgba(15,23,42,0.85)" />
      {/* Brillo en anillo */}
      <path d="M12 24 A16 16 0 0 1 36 24" fill="none" stroke="#FEF3C7" strokeWidth="1.5" opacity="0.4" />
      {/* Borde interior */}
      <circle cx="24" cy="32" r="12.5" fill="none" stroke="#D97706" strokeWidth="1" />
      <circle cx="24" cy="32" r="16" fill="none" stroke="#B45309" strokeWidth="0.8" />

      {/* Ornamentos en el anillo */}
      <path d="M16 20 Q20 16 24 20 Q28 16 32 20" stroke="#FCD34D" strokeWidth="1" fill="none" />
      <circle cx="24" cy="17" r="1.5" fill="#FCD34D" />
      <circle cx="10" cy="32" r="1.2" fill="#FCD34D" />
      <circle cx="38" cy="32" r="1.2" fill="#FCD34D" />
      <path d="M16 44 Q20 48 24 44 Q28 48 32 44" stroke="#FCD34D" strokeWidth="1" fill="none" />
      <circle cx="24" cy="47" r="1.5" fill="#FCD34D" />

      {/* Gema central – amatista */}
      <g style={{ transformOrigin: '24px 32px', animation: 'gc-pulse 3s ease-in-out infinite' }}>
        <circle cx="24" cy="32" r="5.5" fill="url(#ky-gem)" />
        <circle cx="24" cy="32" r="5.5" fill="none" stroke="#FBBF24" strokeWidth="1.2" />
        <circle cx="22.5" cy="30" r="2" fill="rgba(255,255,255,0.3)" />
        <circle cx="26" cy="34" r="0.8" fill="rgba(255,255,255,0.15)" />
      </g>

      {/* ── Vástago (shaft) ── */}
      <rect x="38" y="29" width="30" height="6" rx="2" fill="url(#ky-shaft)" />
      <rect x="40" y="30" width="26" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
      {/* Muescas decorativas */}
      <rect x="46" y="28" width="2" height="8" rx="1" fill="#D97706" opacity="0.4" />
      <rect x="54" y="28" width="2" height="8" rx="1" fill="#D97706" opacity="0.4" />

      {/* ── Dientes de la llave (bit) ── */}
      <path d="M64 35 L64 44 L60 44 L60 39 L58 39 L58 35" fill="url(#ky-shaft)" />
      <path d="M66 35 L66 48 L62 48 L62 35" fill="url(#ky-shaft)" />
      <rect x="66" y="29" width="4" height="6" rx="1.5" fill="#F59E0B" />
      <path d="M60 40 L60 44 L62 44" fill="rgba(255,255,255,0.15)" />
      <path d="M62 36 L62 48 L64 48 L64 36" fill="rgba(255,255,255,0.1)" />
    </g>

    {/* Destellos */}
    <circle cx="10" cy="12" r="1.5" fill="#FDE68A" opacity="0.6"
      style={{ animation: 'gc-twinkle 3s ease-in-out infinite' }} />
    <circle cx="72" cy="20" r="1.2" fill="#FDE68A" opacity="0.5"
      style={{ animation: 'gc-twinkle 3.5s ease-in-out 0.8s infinite' }} />
    <circle cx="68" cy="66" r="1" fill="#FDE68A" opacity="0.4"
      style={{ animation: 'gc-twinkle 2.8s ease-in-out 1.6s infinite' }} />
    <circle cx="14" cy="68" r="1.3" fill="#FDE68A" opacity="0.45"
      style={{ animation: 'gc-twinkle 3.2s ease-in-out 2.2s infinite' }} />

    {/* Resplandor */}
    <circle cx="30" cy="40" r="0" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="0.5"
      style={{ animation: 'gc-ripple 4s ease-out infinite' }} />
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
};

const GradeCardIcon = ({ type, grade, className = '' }) => {
  useEffect(() => { injectStyles(); }, []);

  const entry = iconMap[`${type}-${grade}`];
  if (!entry) return null;

  const { Component, cls } = entry;
  const size = type === 'primaria' ? 160 : 155;

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
