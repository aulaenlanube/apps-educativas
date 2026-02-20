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
    @keyframes gc-prism-shift{0%{stop-color:#93C5FD}25%{stop-color:#C4B5FD}50%{stop-color:#F9A8D4}75%{stop-color:#6EE7B7}100%{stop-color:#93C5FD}}

    .gc-icon{animation:gc-float 4.5s ease-in-out infinite}
    .gc-icon-inner{transition:transform 0.55s cubic-bezier(0.34,1.56,0.64,1),filter 0.55s ease}

    .group:hover .gc-backpack .gc-icon-inner{transform:rotate(-8deg) scale(1.06);filter:drop-shadow(0 0 14px rgba(236,72,153,0.55))}
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
    {/* Palette body – subtle rock */}
    <g style={{ transformOrigin: '38px 42px', animation: 'gc-rock 5s ease-in-out infinite' }}>
      <ellipse cx="38" cy="42" rx="30" ry="26" fill="url(#pg)" transform="rotate(-10 38 42)" />
      <ellipse cx="38" cy="42" rx="30" ry="26" fill="none" stroke="rgba(200,195,180,0.5)" strokeWidth="1" transform="rotate(-10 38 42)" />
      <ellipse cx="38" cy="42" rx="24" ry="20" fill="none" stroke="rgba(180,170,150,0.1)" strokeWidth="0.5" transform="rotate(-10 38 42)" />
      <ellipse cx="30" cy="52" rx="7" ry="6" fill="rgba(0,0,0,0.15)" />
      {/* Paint blobs – staggered pulse */}
      <g style={{ transformOrigin: '22px 27px', animation: 'gc-pulse 3s ease-in-out 0s infinite' }}>
        <circle cx="22" cy="27" r="6.5" fill="#E53E3E" />
        <circle cx="20.5" cy="25" r="2.5" fill="rgba(255,255,255,0.35)" />
      </g>
      <g style={{ transformOrigin: '36px 21px', animation: 'gc-pulse 3s ease-in-out 0.5s infinite' }}>
        <circle cx="36" cy="21" r="6" fill="#3182CE" />
        <circle cx="34.5" cy="19" r="2.2" fill="rgba(255,255,255,0.35)" />
      </g>
      <g style={{ transformOrigin: '52px 25px', animation: 'gc-pulse 3s ease-in-out 1s infinite' }}>
        <circle cx="52" cy="25" r="6.5" fill="#ECC94B" />
        <circle cx="50" cy="23" r="2.5" fill="rgba(255,255,255,0.4)" />
      </g>
      <g style={{ transformOrigin: '57px 40px', animation: 'gc-pulse 3s ease-in-out 1.5s infinite' }}>
        <circle cx="57" cy="40" r="5.5" fill="#38A169" />
        <circle cx="55.5" cy="38" r="2" fill="rgba(255,255,255,0.3)" />
      </g>
      <g style={{ transformOrigin: '49px 54px', animation: 'gc-pulse 3s ease-in-out 2s infinite' }}>
        <circle cx="49" cy="54" r="5" fill="#805AD5" />
        <circle cx="47.5" cy="52" r="1.8" fill="rgba(255,255,255,0.3)" />
      </g>
    </g>
    {/* Paint smears */}
    <path d="M28 27 Q32 22 36 21" stroke="rgba(200,60,60,0.2)" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M42 22 Q47 21 52 25" stroke="rgba(50,130,206,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Brush – painting motion swing */}
    <g style={{ transformOrigin: '62px 12px', animation: 'gc-swing 2.5s ease-in-out infinite' }}>
      <rect x="60" y="4" width="5" height="34" rx="2.5" fill="rgba(255,255,255,0.85)" transform="rotate(16 62 21)" />
      <rect x="61" y="5" width="1.8" height="30" rx="0.9" fill="rgba(255,255,255,0.2)" transform="rotate(16 62 21)" />
      <rect x="59.5" y="4" width="6" height="3" rx="1" fill="rgba(200,200,210,0.7)" transform="rotate(16 62 6)" />
      <rect x="58" y="0" width="9" height="8" rx="2" fill="#E53E3E" transform="rotate(16 62 4)" />
      <rect x="59" y="1" width="3" height="5" rx="1" fill="rgba(255,255,255,0.2)" transform="rotate(16 61 4)" />
    </g>
    {/* Paint drip rising */}
    <circle cx="62" cy="38" r="1.5" fill="#E53E3E" opacity="0.4" style={{ animation: 'gc-rise 3.5s ease-out infinite' }} />
    <circle cx="66" cy="44" r="1" fill="#3182CE" opacity="0.3" style={{ animation: 'gc-rise 4s ease-out 1s infinite' }} />
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
    {/* Exhaust trail – animated shimmer */}
    <line x1="36" y1="70" x2="32" y2="78" stroke="rgba(255,180,30,0.15)" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'gc-shimmer 2s ease-in-out infinite' }} />
    <line x1="40" y1="72" x2="40" y2="80" stroke="rgba(255,180,30,0.12)" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'gc-shimmer 2s ease-in-out 0.3s infinite' }} />
    <line x1="44" y1="70" x2="48" y2="78" stroke="rgba(255,180,30,0.15)" strokeWidth="1.5" strokeLinecap="round"
      style={{ animation: 'gc-shimmer 2s ease-in-out 0.6s infinite' }} />
    {/* Shadow */}
    <path d="M41 6 Q51 19 51 43 L46 55 L36 55 L31 43 Q31 19 41 6 Z" fill="rgba(0,0,0,0.06)" />
    {/* Body – subtle sway like flying */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-sway 4s ease-in-out infinite' }}>
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
      {/* Main window – glowing */}
      <circle cx="40" cy="22" r="7" fill="#2563EB" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <circle cx="40" cy="22" r="5" fill="#3B82F6" style={{ animation: 'gc-glow 3s ease-in-out infinite' }} />
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
    </g>
    {/* Flames – dynamic flickering */}
    <g style={{ transformOrigin: '40px 58px', animation: 'gc-flame 1.2s ease-in-out infinite' }}>
      <ellipse cx="40" cy="66" rx="8" ry="12" fill="rgba(255,170,20,0.7)" />
      <ellipse cx="40" cy="64" rx="6" ry="9" fill="#FF6B35" opacity="0.85" />
      <ellipse cx="40" cy="62" rx="3.5" ry="6" fill="#FFBA08" style={{ animation: 'gc-flicker 2s ease-in-out infinite' }} />
      <ellipse cx="40" cy="60" rx="1.8" ry="4" fill="rgba(255,255,220,0.9)" />
    </g>
    {/* Stars – twinkling */}
    <circle cx="10" cy="14" r="1.5" fill="rgba(255,255,255,0.6)" style={{ animation: 'gc-glow 2.5s ease-in-out infinite' }} />
    <circle cx="70" cy="10" r="2" fill="rgba(255,255,255,0.5)" style={{ animation: 'gc-glow 3s ease-in-out 0.8s infinite' }} />
    <circle cx="12" cy="60" r="1.2" fill="rgba(255,255,255,0.4)" style={{ animation: 'gc-glow 2.8s ease-in-out 1.5s infinite' }} />
    <circle cx="68" cy="44" r="1" fill="rgba(255,255,255,0.3)" style={{ animation: 'gc-glow 3.2s ease-in-out 2s infinite' }} />
    {/* Speed lines */}
    <line x1="14" y1="30" x2="4" y2="30" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round"
      style={{ animation: 'gc-shimmer 2s ease-in-out infinite' }} />
    <line x1="16" y1="38" x2="6" y2="38" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" strokeLinecap="round"
      style={{ animation: 'gc-shimmer 2s ease-in-out 0.5s infinite' }} />
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
    {/* Glow behind trophy */}
    <ellipse cx="40" cy="34" rx="22" ry="20" fill="rgba(255,220,50,0.06)" style={{ transformOrigin: '40px 34px', animation: 'gc-breathe 3.5s ease-in-out infinite' }} />
    {/* Trophy shadow */}
    <path d="M23 15 L25 45 Q27 55 41 55 Q55 55 57 45 L59 15 Z" fill="rgba(0,0,0,0.06)" />
    {/* Trophy body */}
    <path d="M22 13 L24 44 Q26 54 40 54 Q54 54 56 44 L58 13 Z" fill="url(#tg1)" />
    <path d="M26 15 L27 42 Q28 50 36 52 L34 15 Z" fill="rgba(255,255,255,0.22)" />
    {/* Shine sweep – scans down */}
    <rect x="26" y="13" width="8" height="40" rx="3" fill="rgba(255,255,255,0.08)"
      style={{ animation: 'gc-scan 5s ease-in-out infinite' }} />
    <path d="M28 20 Q40 16 52 20" stroke="rgba(200,160,0,0.25)" strokeWidth="0.6" fill="none" />
    <path d="M27 38 Q40 42 53 38" stroke="rgba(200,160,0,0.2)" strokeWidth="0.6" fill="none" />
    {/* Rim */}
    <rect x="19" y="11" width="42" height="5" rx="2.5" fill="#FFE566" />
    <rect x="21" y="12" width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.35)" />
    {/* Handles – breathing */}
    <g style={{ transformOrigin: '8px 32px', animation: 'gc-breathe 4s ease-in-out infinite' }}>
      <path d="M22 19 Q8 19 8 32 Q8 45 22 42" stroke="url(#tg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M22 20 Q10 20 10 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
    <g style={{ transformOrigin: '72px 32px', animation: 'gc-breathe 4s ease-in-out 0.5s infinite' }}>
      <path d="M58 19 Q72 19 72 32 Q72 45 58 42" stroke="url(#tg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
    {/* Stem + Base */}
    <rect x="35" y="54" width="10" height="10" rx="2" fill="url(#tg2)" />
    <rect x="36" y="55" width="4" height="8" rx="1" fill="rgba(255,255,255,0.18)" />
    <rect x="25" y="64" width="30" height="4" rx="2" fill="#E6A800" />
    <rect x="23" y="67" width="34" height="5" rx="2.5" fill="#FFD700" />
    <rect x="25" y="68" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
    {/* Star emblem – shimmering glow */}
    <g style={{ transformOrigin: '40px 33px', animation: 'gc-breathe 3s ease-in-out infinite' }}>
      <path d="M40 22 L42.5 29 L50 29 L44 34 L46 41 L40 36 L34 41 L36 34 L30 29 L37.5 29 Z"
        fill="rgba(255,255,255,0.45)" />
      <path d="M40 24 L41.5 29 L47 29.5 L43 33 L44 39 L40 35.5 L36 39 L37 33 L33 29.5 L38.5 29 Z"
        fill="rgba(255,255,255,0.15)" style={{ animation: 'gc-glow 2.5s ease-in-out infinite' }} />
    </g>
    <circle cx="40" cy="32" r="13" fill="none" stroke="rgba(200,160,0,0.15)" strokeWidth="0.5" />
    {/* Victory sparkles */}
    <circle cx="20" cy="8" r="1.5" fill="#FFE566" style={{ animation: 'gc-bounce 2.5s ease-in-out infinite' }} />
    <circle cx="60" cy="6" r="1.2" fill="#FFD700" style={{ animation: 'gc-bounce 3s ease-in-out 0.7s infinite' }} />
  </svg>
);

/* 6º Primaria – Diamante con rotación 3D eje Y */
const Diamond = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="dg1" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="50%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="dg3" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="50%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Shadow on ground – breathes */}
    <ellipse cx="40" cy="74" rx="16" ry="3" fill="rgba(96,165,250,0.1)"
      style={{ transformOrigin: '40px 74px', animation: 'gc-breathe 6s ease-in-out infinite' }} />
    {/* Diamond body – 3D Y-axis rotation */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-flipY-swing 6s ease-in-out infinite' }}>
      <polygon points="40,4 66,28 40,76 14,28" fill="url(#dg1)" />
      {/* Crown facets – each side different color for 3D effect */}
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
      <line x1="40" y1="4" x2="40" y2="28" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <line x1="40" y1="28" x2="40" y2="76" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="14" y1="28" x2="40" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <line x1="66" y1="28" x2="40" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {/* Girdle – bright edge */}
      <polyline points="14,28 26,28 40,28 54,28 66,28" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      {/* Highlight facets – shimmer on rotation */}
      <polygon points="28,14 40,28 33,28" fill="rgba(255,255,255,0.45)"
        style={{ animation: 'gc-shimmer 3s ease-in-out infinite' }} />
      <polygon points="40,4 50,20 46,28 40,28" fill="rgba(255,255,255,0.25)"
        style={{ animation: 'gc-shimmer 3s ease-in-out 1.5s infinite' }} />
      {/* Inner glow – pulses as it rotates */}
      <polygon points="40,28 50,40 40,60 30,40" fill="rgba(255,255,255,0.12)"
        style={{ animation: 'gc-glow 3s ease-in-out infinite' }} />
      {/* Outline */}
      <polygon points="40,4 66,28 40,76 14,28" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
    {/* Prismatic light rays – shooting out with draw animation */}
    <line x1="26" y1="16" x2="6" y2="4" stroke="rgba(255,100,100,0.35)" strokeWidth="1.2" strokeLinecap="round"
      strokeDasharray="22" style={{ animation: 'gc-draw 3s ease-in-out infinite' }} />
    <line x1="28" y1="20" x2="8" y2="12" stroke="rgba(100,255,100,0.3)" strokeWidth="1" strokeLinecap="round"
      strokeDasharray="22" style={{ animation: 'gc-draw 3s ease-in-out 0.4s infinite' }} />
    <line x1="30" y1="24" x2="12" y2="20" stroke="rgba(100,100,255,0.3)" strokeWidth="1" strokeLinecap="round"
      strokeDasharray="22" style={{ animation: 'gc-draw 3s ease-in-out 0.8s infinite' }} />
    {/* Right side rays */}
    <line x1="54" y1="16" x2="74" y2="4" stroke="rgba(255,200,50,0.3)" strokeWidth="1" strokeLinecap="round"
      strokeDasharray="22" style={{ animation: 'gc-draw 3s ease-in-out 1.2s infinite' }} />
    <line x1="52" y1="20" x2="72" y2="12" stroke="rgba(200,100,255,0.25)" strokeWidth="0.8" strokeLinecap="round"
      strokeDasharray="22" style={{ animation: 'gc-draw 3s ease-in-out 1.6s infinite' }} />
    {/* Top sparkle burst – pulsing */}
    <g style={{ transformOrigin: '40px 4px', animation: 'gc-pulse 2.5s ease-in-out infinite' }}>
      <line x1="40" y1="4" x2="40" y2="-4" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      <line x1="40" y1="4" x2="34" y2="0" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <line x1="40" y1="4" x2="46" y2="0" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </g>
    {/* Floating sparkle orbits */}
    <circle cx="68" cy="12" r="2.2" fill="white" opacity="0.5" style={{ animation: 'gc-bounce 2.5s ease-in-out infinite' }} />
    <circle cx="12" cy="46" r="1.8" fill="white" opacity="0.4" style={{ animation: 'gc-bounce 3s ease-in-out 0.8s infinite' }} />
    <circle cx="68" cy="54" r="1.5" fill="white" opacity="0.35" style={{ animation: 'gc-bounce 3.5s ease-in-out 1.5s infinite' }} />
    {/* Ripple waves from diamond center */}
    <circle cx="40" cy="40" r="0" fill="none" stroke="rgba(96,165,250,0.25)" strokeWidth="0.5"
      style={{ animation: 'gc-ripple 3.5s ease-out infinite' }} />
    <circle cx="40" cy="40" r="0" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="0.5"
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
    {/* Diploma – centered below cap */}
    <g transform="translate(26 58)">
      <g style={{ transformOrigin: '14px 9px', animation: 'gc-rock 5s ease-in-out infinite' }}>
        <rect x="0" y="0" width="28" height="18" rx="2.5" fill="#FEF3C7" />
        <rect x="0" y="0" width="28" height="18" rx="2.5" fill="none" stroke="#D97706" strokeWidth="0.8" opacity="0.5" />
        <rect x="2" y="2" width="24" height="14" rx="1.5" fill="none" stroke="#D97706" strokeWidth="0.5" opacity="0.25" />
        {/* Text lines – drawing effect */}
        <line x1="6" y1="5" x2="22" y2="5" stroke="#92400E" strokeWidth="0.8" opacity="0.25"
          strokeDasharray="18" style={{ animation: 'gc-draw 4s ease-in-out infinite' }} />
        <line x1="8" y1="8" x2="20" y2="8" stroke="#92400E" strokeWidth="0.6" opacity="0.2"
          strokeDasharray="14" style={{ animation: 'gc-draw 4s ease-in-out 0.5s infinite' }} />
        <line x1="6" y1="11" x2="18" y2="11" stroke="#92400E" strokeWidth="0.6" opacity="0.2"
          strokeDasharray="14" style={{ animation: 'gc-draw 4s ease-in-out 1s infinite' }} />
        {/* Seal – pulsing */}
        <g style={{ transformOrigin: '22px 13px', animation: 'gc-pulse 2.5s ease-in-out infinite' }}>
          <circle cx="22" cy="13" r="3" fill="#DC2626" />
          <circle cx="22" cy="13" r="2" fill="#EF4444" />
          <circle cx="22" cy="13" r="1" fill="#FCA5A5" />
        </g>
        <path d="M20 15 L19 19 M24 15 L25 19" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
    {/* Celebration sparkles */}
    <circle cx="20" cy="8" r="1.5" fill="#FBBF24" style={{ animation: 'gc-bounce 2.5s ease-in-out infinite' }} />
    <circle cx="60" cy="6" r="1.2" fill="#F43F5E" style={{ animation: 'gc-bounce 3s ease-in-out 0.5s infinite' }} />
    <circle cx="74" cy="16" r="1" fill="#38BDF8" style={{ animation: 'gc-bounce 2.8s ease-in-out 1s infinite' }} />
  </svg>
);

/* ── Icon map ────────────────────────────────────────────────── */
const iconMap = {
  'primaria-1': { Component: Backpack, cls: 'gc-backpack' },
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
