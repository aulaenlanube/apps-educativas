import React, { useEffect } from 'react';

/* ── CSS keyframes injected once ─────────────────────────────── */
let stylesInjected = false;
const injectStyles = () => {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
    @keyframes gc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes gc-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes gc-spin-slow{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
    @keyframes gc-spin-rev{0%{transform:rotate(360deg)}100%{transform:rotate(0deg)}}
    @keyframes gc-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.7}}
    @keyframes gc-wiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    @keyframes gc-shimmer{0%{opacity:.1}50%{opacity:.9}100%{opacity:.1}}
    @keyframes gc-orbit{0%{transform:rotate(0deg) translateX(18px) rotate(0deg)}100%{transform:rotate(360deg) translateX(18px) rotate(-360deg)}}
    @keyframes gc-orbit2{0%{transform:rotate(120deg) translateX(20px) rotate(-120deg)}100%{transform:rotate(480deg) translateX(20px) rotate(-480deg)}}
    @keyframes gc-orbit3{0%{transform:rotate(240deg) translateX(15px) rotate(-240deg)}100%{transform:rotate(600deg) translateX(15px) rotate(-600deg)}}
    @keyframes gc-flicker{0%,100%{opacity:.6;transform:scaleY(1) scaleX(1)}30%{opacity:1;transform:scaleY(1.35) scaleX(0.9)}60%{opacity:.8;transform:scaleY(1.1) scaleX(1.1)}90%{opacity:1;transform:scaleY(1.25) scaleX(0.95)}}
    @keyframes gc-sway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
    @keyframes gc-bounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}60%{transform:translateY(2px)}}
    @keyframes gc-page{0%,100%{transform:skewY(0deg)}50%{transform:skewY(-3deg)}}
    @keyframes gc-tassel{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
    @keyframes gc-drift{0%,100%{transform:translateX(0) translateY(0)}25%{transform:translateX(4px) translateY(-3px)}50%{transform:translateX(-2px) translateY(-6px)}75%{transform:translateX(-4px) translateY(-2px)}}
    @keyframes gc-twinkle{0%,100%{transform:scale(0);opacity:0}50%{transform:scale(1);opacity:1}}
    @keyframes gc-glow-pulse{0%,100%{filter:drop-shadow(0 0 3px rgba(255,255,255,0.2))}50%{filter:drop-shadow(0 0 10px rgba(255,255,255,0.5))}}
    @keyframes gc-rock{0%,100%{transform:rotate(-3deg)}25%{transform:rotate(2deg)}50%{transform:rotate(-2deg)}75%{transform:rotate(3deg)}}
    @keyframes gc-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
    @keyframes gc-swing{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
    @keyframes gc-dash{0%{stroke-dashoffset:100}100%{stroke-dashoffset:0}}
    @keyframes gc-needle{0%,100%{transform:rotate(-8deg)}30%{transform:rotate(4deg)}60%{transform:rotate(-3deg)}80%{transform:rotate(2deg)}}
    @keyframes gc-flame-dance{0%,100%{transform:scaleX(1) scaleY(1)}20%{transform:scaleX(0.85) scaleY(1.2)}40%{transform:scaleX(1.1) scaleY(0.9)}60%{transform:scaleX(0.9) scaleY(1.15)}80%{transform:scaleX(1.05) scaleY(0.95)}}
    @keyframes gc-page-flip{0%,100%{transform:rotateY(0deg) skewY(0)}50%{transform:rotateY(-15deg) skewY(-2deg)}}
    @keyframes gc-nucleus{0%,100%{transform:scale(1)}25%{transform:scale(1.08)}50%{transform:scale(0.95)}75%{transform:scale(1.05)}}
    @keyframes gc-confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-20px) rotate(180deg);opacity:0}}
  `;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
};

/* ── Particles ───────────────────────────────────────────────── */
const particleConfigs = {
  'primaria-1': [
    { shape: 'star4', x: 8, y: 12, size: 7, delay: 0, dur: 3, color: 'rgba(255,255,100,0.8)' },
    { shape: 'circle', x: 88, y: 18, size: 4, delay: 1.2, dur: 2.5, color: 'rgba(255,255,255,0.7)' },
    { shape: 'diamond', x: 3, y: 72, size: 5, delay: 0.5, dur: 3.5, color: 'rgba(255,220,100,0.6)' },
    { shape: 'star4', x: 92, y: 68, size: 5, delay: 2, dur: 2.8, color: 'rgba(255,255,200,0.6)' },
    { shape: 'star4', x: 48, y: 2, size: 4, delay: 1.8, dur: 3.2, color: 'rgba(255,255,150,0.6)' },
    { shape: 'circle', x: 15, y: 45, size: 3, delay: 0.8, dur: 2.2, color: 'rgba(255,230,80,0.5)' },
  ],
  'primaria-2': [
    { shape: 'circle', x: 5, y: 22, size: 8, delay: 0, dur: 2.5, color: 'rgba(255,80,80,0.65)' },
    { shape: 'circle', x: 90, y: 12, size: 6, delay: 0.8, dur: 3, color: 'rgba(80,180,255,0.65)' },
    { shape: 'circle', x: 8, y: 78, size: 7, delay: 1.5, dur: 2.8, color: 'rgba(80,255,130,0.55)' },
    { shape: 'circle', x: 88, y: 72, size: 5, delay: 0.3, dur: 3.2, color: 'rgba(255,200,50,0.6)' },
    { shape: 'circle', x: 50, y: 92, size: 5, delay: 2, dur: 2.6, color: 'rgba(200,100,255,0.5)' },
    { shape: 'circle', x: 45, y: 5, size: 4, delay: 1, dur: 2.8, color: 'rgba(255,110,110,0.5)' },
  ],
  'primaria-3': [
    { shape: 'star4', x: 8, y: 28, size: 5, delay: 0, dur: 2, color: 'rgba(255,255,255,0.7)' },
    { shape: 'star4', x: 90, y: 16, size: 4, delay: 0.7, dur: 2.5, color: 'rgba(255,255,255,0.55)' },
    { shape: 'circle', x: 12, y: 62, size: 3, delay: 1.3, dur: 2.2, color: 'rgba(255,200,50,0.55)' },
    { shape: 'star4', x: 85, y: 58, size: 5, delay: 0.4, dur: 3, color: 'rgba(255,255,200,0.55)' },
    { shape: 'circle', x: 3, y: 8, size: 4, delay: 1.8, dur: 2.8, color: 'rgba(255,150,50,0.5)' },
    { shape: 'star4', x: 50, y: 95, size: 3, delay: 2.2, dur: 2, color: 'rgba(255,180,30,0.4)' },
  ],
  'primaria-4': [
    { shape: 'diamond', x: 5, y: 18, size: 5, delay: 0.5, dur: 3, color: 'rgba(255,255,255,0.55)' },
    { shape: 'circle', x: 92, y: 22, size: 4, delay: 0, dur: 2.8, color: 'rgba(255,80,80,0.5)' },
    { shape: 'cross', x: 8, y: 75, size: 6, delay: 1.2, dur: 3.5, color: 'rgba(255,255,255,0.4)' },
    { shape: 'diamond', x: 88, y: 70, size: 4, delay: 1.8, dur: 2.5, color: 'rgba(255,220,100,0.45)' },
    { shape: 'circle', x: 48, y: 95, size: 3, delay: 0.8, dur: 2.5, color: 'rgba(255,255,255,0.35)' },
  ],
  'primaria-5': [
    { shape: 'star4', x: 3, y: 12, size: 7, delay: 0, dur: 2.5, color: 'rgba(255,240,80,0.8)' },
    { shape: 'star4', x: 94, y: 8, size: 6, delay: 0.8, dur: 3, color: 'rgba(255,255,150,0.7)' },
    { shape: 'diamond', x: 5, y: 72, size: 5, delay: 1.5, dur: 2.8, color: 'rgba(255,220,50,0.5)' },
    { shape: 'star4', x: 90, y: 68, size: 5, delay: 0.3, dur: 3.2, color: 'rgba(255,255,100,0.55)' },
    { shape: 'star4', x: 48, y: 3, size: 4, delay: 2, dur: 2.5, color: 'rgba(255,255,200,0.5)' },
    { shape: 'circle', x: 50, y: 94, size: 3, delay: 1.2, dur: 2.2, color: 'rgba(255,240,100,0.4)' },
  ],
  'primaria-6': [
    { shape: 'diamond', x: 5, y: 15, size: 6, delay: 0, dur: 3, color: 'rgba(180,220,255,0.7)' },
    { shape: 'diamond', x: 92, y: 20, size: 5, delay: 1, dur: 2.8, color: 'rgba(200,180,255,0.6)' },
    { shape: 'star4', x: 3, y: 70, size: 5, delay: 0.5, dur: 3.5, color: 'rgba(255,255,255,0.5)' },
    { shape: 'diamond', x: 90, y: 75, size: 6, delay: 1.8, dur: 2.5, color: 'rgba(150,200,255,0.55)' },
    { shape: 'circle', x: 48, y: 94, size: 3, delay: 2.2, dur: 2.8, color: 'rgba(200,200,255,0.4)' },
    { shape: 'diamond', x: 48, y: 3, size: 4, delay: 0.8, dur: 3, color: 'rgba(180,200,255,0.45)' },
  ],
  'eso-1': [
    { shape: 'circle', x: 5, y: 15, size: 5, delay: 0, dur: 2.5, color: 'rgba(100,255,180,0.65)' },
    { shape: 'circle', x: 92, y: 28, size: 4, delay: 1, dur: 3, color: 'rgba(100,200,255,0.55)' },
    { shape: 'circle', x: 8, y: 78, size: 4, delay: 0.5, dur: 2.8, color: 'rgba(255,200,100,0.5)' },
    { shape: 'cross', x: 88, y: 72, size: 5, delay: 1.5, dur: 3.2, color: 'rgba(255,255,255,0.4)' },
    { shape: 'circle', x: 48, y: 5, size: 3, delay: 2, dur: 2.2, color: 'rgba(165,94,234,0.45)' },
  ],
  'eso-2': [
    { shape: 'cross', x: 5, y: 18, size: 5, delay: 0, dur: 3, color: 'rgba(255,255,255,0.5)' },
    { shape: 'circle', x: 90, y: 12, size: 4, delay: 0.8, dur: 2.5, color: 'rgba(200,150,255,0.55)' },
    { shape: 'diamond', x: 8, y: 75, size: 5, delay: 1.5, dur: 3.2, color: 'rgba(255,200,255,0.45)' },
    { shape: 'star4', x: 88, y: 70, size: 5, delay: 0.3, dur: 2.8, color: 'rgba(255,255,200,0.4)' },
    { shape: 'circle', x: 48, y: 92, size: 3, delay: 1, dur: 2.5, color: 'rgba(255,107,107,0.4)' },
  ],
  'eso-3': [
    { shape: 'circle', x: 3, y: 12, size: 4, delay: 0, dur: 2, color: 'rgba(56,189,248,0.55)' },
    { shape: 'circle', x: 94, y: 18, size: 3, delay: 0.6, dur: 2.5, color: 'rgba(244,114,182,0.55)' },
    { shape: 'circle', x: 5, y: 80, size: 4, delay: 1.2, dur: 2.2, color: 'rgba(52,211,153,0.5)' },
    { shape: 'circle', x: 90, y: 78, size: 4, delay: 1.8, dur: 2.8, color: 'rgba(255,255,150,0.45)' },
    { shape: 'circle', x: 48, y: 95, size: 3, delay: 0.4, dur: 2, color: 'rgba(56,189,248,0.4)' },
  ],
  'eso-4': [
    { shape: 'star4', x: 5, y: 18, size: 5, delay: 0, dur: 2.5, color: 'rgba(255,240,80,0.65)' },
    { shape: 'diamond', x: 92, y: 12, size: 5, delay: 1, dur: 3, color: 'rgba(255,255,200,0.55)' },
    { shape: 'star4', x: 8, y: 75, size: 4, delay: 0.5, dur: 2.8, color: 'rgba(255,220,100,0.5)' },
    { shape: 'circle', x: 88, y: 70, size: 3, delay: 1.5, dur: 3.2, color: 'rgba(255,255,255,0.4)' },
    { shape: 'star4', x: 48, y: 3, size: 4, delay: 2, dur: 2.5, color: 'rgba(255,71,87,0.4)' },
  ],
};

const ParticleShape = ({ shape, x, y, size, delay, dur, color }) => {
  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    animation: `gc-drift ${dur}s ease-in-out ${delay}s infinite`,
    pointerEvents: 'none',
  };
  if (shape === 'circle') {
    return (
      <div style={style}>
        <svg width={size * 2} height={size * 2} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill={color} style={{ animation: `gc-twinkle ${dur}s ease-in-out ${delay}s infinite` }} />
        </svg>
      </div>
    );
  }
  if (shape === 'star4') {
    return (
      <div style={style}>
        <svg width={size * 2} height={size * 2} viewBox="0 0 12 12">
          <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill={color}
            style={{ animation: `gc-twinkle ${dur}s ease-in-out ${delay}s infinite` }} />
        </svg>
      </div>
    );
  }
  if (shape === 'diamond') {
    return (
      <div style={style}>
        <svg width={size * 2} height={size * 2} viewBox="0 0 10 10">
          <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={color}
            style={{ animation: `gc-twinkle ${dur * 0.8}s ease-in-out ${delay}s infinite` }} />
        </svg>
      </div>
    );
  }
  if (shape === 'cross') {
    return (
      <div style={style}>
        <svg width={size * 2} height={size * 2} viewBox="0 0 10 10">
          <path d="M5 1 L5 9 M1 5 L9 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"
            style={{ animation: `gc-twinkle ${dur}s ease-in-out ${delay}s infinite` }} />
        </svg>
      </div>
    );
  }
  return null;
};

const Particles = ({ type, grade }) => {
  const config = particleConfigs[`${type}-${grade}`] || [];
  return config.map((p, i) => <ParticleShape key={i} {...p} />);
};

/* ── SVG Icons ───────────────────────────────────────────────── */

/* 1º Primaria – Estrella mágica con varita y destellos */
const Star = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3s ease-in-out infinite' }}>
    <defs>
      <radialGradient id="sg1" cx="0.4" cy="0.35" r="0.6">
        <stop offset="0%" stopColor="#FFF7AE" />
        <stop offset="60%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#F0A500" />
      </radialGradient>
      <radialGradient id="sg2" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="rgba(255,255,200,0.6)" />
        <stop offset="100%" stopColor="rgba(255,200,50,0)" />
      </radialGradient>
    </defs>
    <g style={{ animation: 'gc-float 3s ease-in-out infinite' }}>
      {/* Outer glow ring */}
      <circle cx="38" cy="36" r="28" fill="url(#sg2)" style={{ animation: 'gc-breathe 4s ease-in-out infinite' }} />
      {/* Shadow star */}
      <path d="M40 9 L46.5 25.5 L64 26 L50.5 37 L55 54 L40 44.5 L25 54 L29.5 37 L16 26 L33.5 25.5 Z"
        fill="rgba(0,0,0,0.08)" transform="translate(1.5,1.5)" />
      {/* Main star with gradient */}
      <path d="M40 8 L46.5 25 L64.5 25.5 L50 37 L55 55 L40 44 L25 55 L30 37 L15.5 25.5 L33.5 25 Z"
        fill="url(#sg1)" stroke="#FFE566" strokeWidth="0.8" />
      {/* Inner star - bright highlight */}
      <path d="M40 16 L43.5 27 L54 27.5 L46 34 L49 46 L40 39 L31 46 L34 34 L26 27.5 L36.5 27 Z"
        fill="rgba(255,255,255,0.35)" />
      {/* Center sparkle */}
      <circle cx="40" cy="34" r="4" fill="rgba(255,255,255,0.5)" />
      <circle cx="40" cy="34" r="2" fill="rgba(255,255,255,0.7)" />
      {/* Star surface texture lines */}
      <line x1="40" y1="18" x2="40" y2="28" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      <line x1="33" y1="32" x2="40" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="47" y1="32" x2="40" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      {/* Wand - more detailed */}
      <g style={{ transformOrigin: '56px 54px', animation: 'gc-rock 3s ease-in-out infinite' }}>
        <rect x="54" y="50" width="3.5" height="26" rx="1.8" fill="rgba(255,255,255,0.85)" transform="rotate(35 56 62)" />
        <rect x="54.5" y="51" width="1.5" height="22" rx="0.8" fill="rgba(255,255,255,0.2)" transform="rotate(35 56 62)" />
        {/* Wand bands */}
        <rect x="54" y="55" width="3.5" height="2" rx="1" fill="rgba(200,160,50,0.5)" transform="rotate(35 56 62)" />
        <rect x="54" y="62" width="3.5" height="2" rx="1" fill="rgba(200,160,50,0.5)" transform="rotate(35 56 62)" />
        {/* Wand tip glow */}
        <circle cx="72" cy="72" r="3.5" fill="rgba(255,255,200,0.6)" style={{ animation: 'gc-pulse 1.8s ease-in-out infinite' }} />
        <circle cx="72" cy="72" r="1.5" fill="rgba(255,255,255,0.9)" />
      </g>
      {/* Sparkles orbiting */}
      <g style={{ transformOrigin: '38px 36px', animation: 'gc-spin-slow 12s linear infinite' }}>
        <circle cx="66" cy="12" r="2.5" fill="#FFF7AE" opacity="0.85" />
        <circle cx="12" cy="52" r="2" fill="#FFE566" opacity="0.7" />
      </g>
      {/* Fixed sparkles */}
      <circle cx="16" cy="14" r="2" fill="#FFF7AE" style={{ animation: 'gc-shimmer 2s ease-in-out infinite .7s' }} />
      <circle cx="68" cy="50" r="1.8" fill="#FFE566" style={{ animation: 'gc-shimmer 2.5s ease-in-out infinite .3s' }} />
      <circle cx="10" cy="40" r="1.2" fill="rgba(255,255,200,0.6)" style={{ animation: 'gc-shimmer 2s ease-in-out infinite 1.2s' }} />
      {/* Trail sparkle dots from wand */}
      <circle cx="58" cy="56" r="1.5" fill="rgba(255,255,150,0.7)" style={{ animation: 'gc-shimmer 1.2s infinite .1s' }} />
      <circle cx="63" cy="61" r="1.2" fill="rgba(255,255,200,0.6)" style={{ animation: 'gc-shimmer 1.5s infinite .4s' }} />
      <circle cx="67" cy="65" r="1" fill="rgba(255,255,200,0.5)" style={{ animation: 'gc-shimmer 1.3s infinite .7s' }} />
    </g>
  </svg>
);

/* 2º Primaria – Paleta con pincel, gotas y textura */
const Palette = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3.5s ease-in-out infinite' }}>
    <defs>
      <radialGradient id="pg" cx="0.4" cy="0.38" r="0.65">
        <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
        <stop offset="80%" stopColor="rgba(240,238,230,0.95)" />
        <stop offset="100%" stopColor="rgba(220,218,210,0.9)" />
      </radialGradient>
    </defs>
    <g style={{ animation: 'gc-float 3.5s ease-in-out infinite' }}>
      {/* Shadow */}
      <ellipse cx="39" cy="44" rx="30" ry="26" fill="rgba(0,0,0,0.08)" transform="rotate(-10 39 44)" />
      {/* Palette body with gradient */}
      <ellipse cx="38" cy="42" rx="30" ry="26" fill="url(#pg)" transform="rotate(-10 38 42)" />
      {/* Palette rim */}
      <ellipse cx="38" cy="42" rx="30" ry="26" fill="none" stroke="rgba(200,195,180,0.5)" strokeWidth="1" transform="rotate(-10 38 42)" />
      {/* Wood grain texture */}
      <ellipse cx="38" cy="42" rx="24" ry="20" fill="none" stroke="rgba(180,170,150,0.1)" strokeWidth="0.5" transform="rotate(-10 38 42)" />
      <ellipse cx="38" cy="42" rx="18" ry="14" fill="none" stroke="rgba(180,170,150,0.08)" strokeWidth="0.5" transform="rotate(-10 38 42)" />
      {/* Thumb hole */}
      <ellipse cx="30" cy="52" rx="7" ry="6" fill="rgba(0,0,0,0.15)" />
      <ellipse cx="30" cy="52" rx="5" ry="4" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
      {/* Paint blobs with 3D depth */}
      <g style={{ animation: 'gc-pulse 2.5s ease-in-out infinite' }}>
        <circle cx="22" cy="27" r="6.5" fill="#E53E3E" />
        <circle cx="20.5" cy="25" r="2.5" fill="rgba(255,255,255,0.35)" />
        <circle cx="24" cy="30" r="1" fill="rgba(0,0,0,0.1)" />
      </g>
      <g style={{ animation: 'gc-pulse 2.8s ease-in-out infinite .5s' }}>
        <circle cx="36" cy="21" r="6" fill="#3182CE" />
        <circle cx="34.5" cy="19" r="2.2" fill="rgba(255,255,255,0.35)" />
      </g>
      <g style={{ animation: 'gc-pulse 3s ease-in-out infinite 1s' }}>
        <circle cx="52" cy="25" r="6.5" fill="#ECC94B" />
        <circle cx="50" cy="23" r="2.5" fill="rgba(255,255,255,0.4)" />
      </g>
      <g style={{ animation: 'gc-pulse 2.5s ease-in-out infinite 1.5s' }}>
        <circle cx="57" cy="40" r="5.5" fill="#38A169" />
        <circle cx="55.5" cy="38" r="2" fill="rgba(255,255,255,0.3)" />
      </g>
      <g style={{ animation: 'gc-pulse 2.8s ease-in-out infinite .8s' }}>
        <circle cx="49" cy="54" r="5" fill="#805AD5" />
        <circle cx="47.5" cy="52" r="1.8" fill="rgba(255,255,255,0.3)" />
      </g>
      {/* Paint smear between blobs */}
      <path d="M28 27 Q32 22 36 21" stroke="rgba(200,60,60,0.2)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M42 22 Q47 21 52 25" stroke="rgba(50,130,206,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Brush - detailed */}
      <g style={{ transformOrigin: '66px 18px', animation: 'gc-swing 2.8s ease-in-out infinite' }}>
        {/* Handle */}
        <rect x="60" y="4" width="5" height="34" rx="2.5" fill="rgba(255,255,255,0.85)" transform="rotate(16 62 21)" />
        <rect x="61" y="5" width="1.8" height="30" rx="0.9" fill="rgba(255,255,255,0.2)" transform="rotate(16 62 21)" />
        {/* Metal ferrule */}
        <rect x="59.5" y="4" width="6" height="3" rx="1" fill="rgba(200,200,210,0.7)" transform="rotate(16 62 6)" />
        {/* Bristles */}
        <rect x="58" y="0" width="9" height="8" rx="2" fill="#E53E3E" transform="rotate(16 62 4)" />
        <rect x="59" y="1" width="3" height="5" rx="1" fill="rgba(255,255,255,0.2)" transform="rotate(16 61 4)" />
        {/* Paint drip from brush tip */}
        <circle cx="57" cy="2" r="1.5" fill="#E53E3E" opacity="0.6" transform="rotate(16 62 4)"
          style={{ animation: 'gc-shimmer 2s ease-in-out infinite' }} />
      </g>
      {/* Floating paint drops */}
      <circle cx="14" cy="14" r="2" fill="#3182CE" opacity="0.5" style={{ animation: 'gc-confetti 3s ease-out infinite' }} />
      <circle cx="68" cy="62" r="1.5" fill="#38A169" opacity="0.4" style={{ animation: 'gc-confetti 3.5s ease-out 1s infinite' }} />
    </g>
  </svg>
);

/* 3º Primaria – Cohete con estela, ventanas y detalles */
const Rocket = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 2.8s ease-in-out infinite' }}>
    <defs>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
        <stop offset="50%" stopColor="rgba(245,245,250,0.96)" />
        <stop offset="100%" stopColor="rgba(220,225,235,0.92)" />
      </linearGradient>
    </defs>
    <g style={{ animation: 'gc-float 2.8s ease-in-out infinite' }}>
      {/* Exhaust trail - long fading streaks */}
      <line x1="36" y1="70" x2="32" y2="78" stroke="rgba(255,180,30,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="72" x2="40" y2="80" stroke="rgba(255,180,30,0.12)" strokeWidth="1" strokeLinecap="round" />
      <line x1="44" y1="70" x2="48" y2="78" stroke="rgba(255,180,30,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Shadow */}
      <path d="M41 6 Q51 19 51 43 L46 55 L36 55 L31 43 Q31 19 41 6 Z" fill="rgba(0,0,0,0.06)" />
      {/* Body */}
      <path d="M40 4 Q51 18 51 42 L45 55 L35 55 L29 42 Q29 18 40 4 Z" fill="url(#rg)" />
      {/* Body center line */}
      <path d="M40 6 L40 52" stroke="rgba(200,210,225,0.3)" strokeWidth="0.5" />
      {/* Left highlight */}
      <path d="M40 6 Q35 18 34 42 L35 50 L40 8 Z" fill="rgba(255,255,255,0.15)" />
      {/* Rivets */}
      {[18, 28, 36].map(y => (
        <g key={`rv${y}`}>
          <circle cx="33" cy={y} r="0.8" fill="rgba(180,190,200,0.4)" />
          <circle cx="47" cy={y} r="0.8" fill="rgba(180,190,200,0.4)" />
        </g>
      ))}
      {/* Main window - vivid blue with reflection */}
      <circle cx="40" cy="22" r="7" fill="#2563EB" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      <circle cx="40" cy="22" r="5" fill="#3B82F6" />
      <circle cx="38" cy="20" r="2.5" fill="rgba(255,255,255,0.5)" />
      <circle cx="42" cy="24" r="1" fill="rgba(255,255,255,0.2)" />
      {/* Small porthole */}
      <circle cx="40" cy="35" r="3" fill="rgba(59,130,246,0.4)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <circle cx="39" cy="34" r="1" fill="rgba(255,255,255,0.3)" />
      {/* Nose cone stripes - vivid */}
      <path d="M35 12 Q40 7 45 12" stroke="#FF4757" strokeWidth="2.5" fill="none" />
      <path d="M37 15 Q40 12 43 15" stroke="#FF4757" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Fins - detailed with shading */}
      <path d="M29 36 L17 54 L29 49 Z" fill="#FF4757" />
      <path d="M51 36 L63 54 L51 49 Z" fill="#FF4757" />
      <path d="M29 36 L20 52 L27 48 Z" fill="rgba(255,255,255,0.15)" />
      <path d="M51 36 L58 52 L53 48 Z" fill="rgba(0,0,0,0.08)" />
      {/* Fin details */}
      <line x1="24" y1="44" x2="29" y2="42" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="56" y1="44" x2="51" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      {/* Engine nozzle */}
      <path d="M35 52 L33 56 L47 56 L45 52" fill="rgba(180,190,200,0.7)" />
      <path d="M34 54 L35 52 L40 52" fill="rgba(255,255,255,0.15)" />
      {/* Flames - complex multi-layer */}
      <g style={{ transformOrigin: '40px 56px', animation: 'gc-flame-dance 0.5s ease-in-out infinite' }}>
        <ellipse cx="40" cy="66" rx="8" ry="12" fill="rgba(255,170,20,0.8)" style={{ animation: 'gc-flicker 0.3s ease-in-out infinite' }} />
        <ellipse cx="40" cy="64" rx="6" ry="9" fill="#FF6B35" style={{ animation: 'gc-flicker 0.25s ease-in-out infinite .06s' }} />
        <ellipse cx="40" cy="62" rx="3.5" ry="6" fill="#FFBA08" style={{ animation: 'gc-flicker 0.28s ease-in-out infinite .12s' }} />
        <ellipse cx="40" cy="60" rx="1.8" ry="4" fill="rgba(255,255,220,0.95)" style={{ animation: 'gc-flicker 0.22s ease-in-out infinite .03s' }} />
      </g>
      {/* Side flame wisps */}
      <ellipse cx="34" cy="62" rx="2" ry="4" fill="rgba(255,170,20,0.4)" style={{ animation: 'gc-flicker 0.35s ease-in-out infinite .1s' }} />
      <ellipse cx="46" cy="62" rx="2" ry="4" fill="rgba(255,170,20,0.4)" style={{ animation: 'gc-flicker 0.35s ease-in-out infinite .2s' }} />
      {/* Stars background */}
      <circle cx="10" cy="14" r="1.5" fill="rgba(255,255,255,0.8)" style={{ animation: 'gc-shimmer 2s infinite' }} />
      <circle cx="70" cy="10" r="2" fill="rgba(255,255,255,0.7)" style={{ animation: 'gc-shimmer 2.5s infinite .5s' }} />
      <circle cx="12" cy="60" r="1.2" fill="rgba(255,255,255,0.5)" style={{ animation: 'gc-shimmer 2s infinite 1s' }} />
      <circle cx="68" cy="44" r="1" fill="rgba(255,255,255,0.4)" style={{ animation: 'gc-shimmer 2.2s infinite 1.5s' }} />
      <circle cx="8" cy="36" r="0.8" fill="rgba(255,255,255,0.4)" style={{ animation: 'gc-shimmer 1.8s infinite 0.8s' }} />
    </g>
  </svg>
);

/* 4º Primaria – Brújula con rosa de los vientos */
const Compass = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3.2s ease-in-out infinite' }}>
    <defs>
      <radialGradient id="cg1" cx="0.45" cy="0.42" r="0.55">
        <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
      </radialGradient>
    </defs>
    <g style={{ animation: 'gc-float 3.2s ease-in-out infinite' }}>
      {/* Outer bezel shadow */}
      <circle cx="41" cy="41" r="33" fill="rgba(0,0,0,0.06)" />
      {/* Outer bezel ring */}
      <circle cx="40" cy="40" r="33" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.9)" strokeWidth="2.8" />
      {/* Inner ring */}
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
      {/* Intercardinal marks */}
      <text x="55" y="29" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">NE</text>
      <text x="25" y="29" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">NO</text>
      <text x="55" y="57" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">SE</text>
      <text x="25" y="57" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">SO</text>
      {/* Rose of winds - decorative inner star */}
      <g opacity="0.12">
        <polygon points="40,18 43,37 40,35 37,37" fill="white" />
        <polygon points="40,62 43,43 40,45 37,43" fill="white" />
        <polygon points="18,40 37,37 35,40 37,43" fill="white" />
        <polygon points="62,40 43,37 45,40 43,43" fill="white" />
      </g>
      {/* Needle - animated with realistic sway */}
      <g style={{ transformOrigin: '40px 40px', animation: 'gc-needle 5s ease-in-out infinite' }}>
        {/* North (red) */}
        <polygon points="40,13 44,38 40,35 36,38" fill="#FF4757" />
        <polygon points="40,13 42,38 40,35" fill="#FF6B7A" />
        {/* South (white) */}
        <polygon points="40,67 44,42 40,45 36,42" fill="rgba(255,255,255,0.75)" />
        <polygon points="40,67 42,42 40,45" fill="rgba(255,255,255,0.2)" />
        {/* Needle shadow */}
        <polygon points="40,14 43,38 40,36" fill="rgba(0,0,0,0.05)" />
      </g>
      {/* Center hub - detailed */}
      <circle cx="40" cy="40" r="5" fill="rgba(255,255,255,0.92)" />
      <circle cx="40" cy="40" r="3.5" fill="rgba(200,200,210,0.3)" />
      <circle cx="40" cy="40" r="2" fill="rgba(0,0,0,0.12)" />
      <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.6)" />
      {/* Glass reflection */}
      <path d="M20 25 Q28 18 40 16" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

/* 5º Primaria – Trofeo con grabados y confeti */
const TrophyIcon = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3s ease-in-out infinite' }}>
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
    <g style={{ animation: 'gc-bounce 3.5s ease-in-out infinite' }}>
      {/* Glow */}
      <ellipse cx="40" cy="34" rx="22" ry="20" fill="rgba(255,220,50,0.08)" style={{ animation: 'gc-breathe 3s ease-in-out infinite' }} />
      {/* Shadow */}
      <path d="M23 15 L25 45 Q27 55 41 55 Q55 55 57 45 L59 15 Z" fill="rgba(0,0,0,0.06)" />
      {/* Cup body */}
      <path d="M22 13 L24 44 Q26 54 40 54 Q54 54 56 44 L58 13 Z" fill="url(#tg1)" />
      {/* Cup highlight */}
      <path d="M26 15 L27 42 Q28 50 36 52 L34 15 Z" fill="rgba(255,255,255,0.22)" />
      {/* Engraving lines on cup */}
      <path d="M28 20 Q40 16 52 20" stroke="rgba(200,160,0,0.25)" strokeWidth="0.6" fill="none" />
      <path d="M27 38 Q40 42 53 38" stroke="rgba(200,160,0,0.2)" strokeWidth="0.6" fill="none" />
      {/* Rim */}
      <rect x="19" y="11" width="42" height="5" rx="2.5" fill="#FFE566" />
      <rect x="21" y="12" width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.35)" />
      {/* Handles - detailed */}
      <path d="M22 19 Q8 19 8 32 Q8 45 22 42" stroke="url(#tg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M58 19 Q72 19 72 32 Q72 45 58 42" stroke="url(#tg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M22 20 Q10 20 10 32" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <rect x="35" y="54" width="10" height="10" rx="2" fill="url(#tg2)" />
      <rect x="36" y="55" width="4" height="8" rx="1" fill="rgba(255,255,255,0.18)" />
      {/* Base - layered */}
      <rect x="25" y="64" width="30" height="4" rx="2" fill="#E6A800" />
      <rect x="23" y="67" width="34" height="5" rx="2.5" fill="#FFD700" />
      <rect x="25" y="68" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
      {/* Star emblem on cup */}
      <path d="M40 22 L42.5 29 L50 29 L44 34 L46 41 L40 36 L34 41 L36 34 L30 29 L37.5 29 Z"
        fill="rgba(255,255,255,0.45)" />
      <path d="M40 24 L41.5 29 L47 29.5 L43 33 L44 39 L40 35.5 L36 39 L37 33 L33 29.5 L38.5 29 Z"
        fill="rgba(255,255,255,0.15)" />
      {/* Engraved ring around star */}
      <circle cx="40" cy="32" r="13" fill="none" stroke="rgba(200,160,0,0.15)" strokeWidth="0.5" />
      {/* Confetti-like sparkles */}
      <rect x="10" y="8" width="3" height="1.5" rx="0.75" fill="#FF4757" opacity="0.7" transform="rotate(30 11.5 8.75)"
        style={{ animation: 'gc-confetti 3s ease-out infinite' }} />
      <rect x="66" y="6" width="2.5" height="1.2" rx="0.6" fill="#3B82F6" opacity="0.6" transform="rotate(-20 67 6.6)"
        style={{ animation: 'gc-confetti 3.5s ease-out 0.5s infinite' }} />
      <circle cx="14" cy="4" r="1.5" fill="#2ED573" opacity="0.6" style={{ animation: 'gc-confetti 4s ease-out 1s infinite' }} />
      <circle cx="68" cy="2" r="1.2" fill="#FFD700" opacity="0.7" style={{ animation: 'gc-confetti 3.2s ease-out 1.5s infinite' }} />
      {/* Sparkles */}
      <circle cx="6" cy="52" r="1.5" fill="rgba(255,255,200,0.7)" style={{ animation: 'gc-shimmer 2s infinite' }} />
      <circle cx="74" cy="50" r="1.5" fill="rgba(255,255,200,0.6)" style={{ animation: 'gc-shimmer 2.2s infinite .8s' }} />
    </g>
  </svg>
);

/* 6º Primaria – Diamante multifaceta con prisma de luz */
const Diamond = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3s ease-in-out infinite' }}>
    <defs>
      <linearGradient id="dg1" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="50%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
    <g style={{ animation: 'gc-float 3.5s ease-in-out infinite' }}>
      {/* Bottom glow */}
      <ellipse cx="40" cy="50" rx="18" ry="10" fill="rgba(96,165,250,0.1)" style={{ animation: 'gc-breathe 4s ease-in-out infinite' }} />
      {/* Shadow */}
      <polygon points="41,6 65,29 41,76 17,29" fill="rgba(0,0,0,0.06)" />
      {/* Main gem body */}
      <polygon points="40,4 66,28 40,76 14,28" fill="url(#dg1)" />
      {/* Crown (top) facets */}
      <polygon points="40,4 54,28 40,28" fill="#A5C8FD" />
      <polygon points="40,4 26,28 40,28" fill="#8BB8FC" />
      <polygon points="40,4 66,28 54,28" fill="#5B9DF8" />
      <polygon points="40,4 14,28 26,28" fill="#78AEF9" />
      {/* Pavilion (bottom) facets */}
      <polygon points="40,76 54,28 40,28" fill="#4B8DF8" />
      <polygon points="40,76 26,28 40,28" fill="#5F9CF7" />
      <polygon points="40,76 66,28 54,28" fill="#2B6CE6" />
      <polygon points="40,76 14,28 26,28" fill="#5B93F5" />
      {/* Extra facet lines for complexity */}
      <line x1="40" y1="4" x2="40" y2="28" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <line x1="40" y1="28" x2="40" y2="76" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <line x1="14" y1="28" x2="40" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="66" y1="28" x2="40" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Girdle (middle line) */}
      <polyline points="14,28 26,28 40,28 54,28 66,28" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
      {/* Highlight facets */}
      <polygon points="28,14 40,28 33,28" fill="rgba(255,255,255,0.4)" />
      <polygon points="40,4 50,20 46,28 40,28" fill="rgba(255,255,255,0.2)" />
      <polygon points="40,4 30,20 34,28 40,28" fill="rgba(255,255,255,0.08)" />
      {/* Prismatic light refraction beams */}
      <line x1="28" y1="14" x2="8" y2="4" stroke="rgba(255,100,100,0.3)" strokeWidth="1" strokeLinecap="round"
        style={{ animation: 'gc-shimmer 3s ease-in-out infinite' }} />
      <line x1="30" y1="16" x2="12" y2="10" stroke="rgba(100,255,100,0.25)" strokeWidth="0.8" strokeLinecap="round"
        style={{ animation: 'gc-shimmer 3s ease-in-out infinite 0.3s' }} />
      <line x1="32" y1="18" x2="16" y2="16" stroke="rgba(100,100,255,0.25)" strokeWidth="0.8" strokeLinecap="round"
        style={{ animation: 'gc-shimmer 3s ease-in-out infinite 0.6s' }} />
      {/* Outline */}
      <polygon points="40,4 66,28 40,76 14,28" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Sparkle flares */}
      <g style={{ animation: 'gc-shimmer 2.2s ease-in-out infinite' }}>
        <line x1="30" y1="12" x2="24" y2="6" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
        <line x1="30" y1="12" x2="36" y2="6" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
        <line x1="30" y1="12" x2="24" y2="12" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
        <line x1="30" y1="12" x2="30" y2="6" stroke="white" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      </g>
      {/* Corner sparkles */}
      <circle cx="68" cy="12" r="2.2" fill="white" opacity="0.6" style={{ animation: 'gc-shimmer 1.8s infinite .5s' }} />
      <circle cx="12" cy="46" r="1.5" fill="white" opacity="0.5" style={{ animation: 'gc-shimmer 2s infinite 1s' }} />
      <circle cx="58" cy="62" r="1.2" fill="rgba(180,210,255,0.6)" style={{ animation: 'gc-shimmer 2.2s infinite 1.5s' }} />
      <circle cx="22" cy="60" r="1" fill="rgba(200,200,255,0.5)" style={{ animation: 'gc-shimmer 2.5s infinite 2s' }} />
    </g>
  </svg>
);

/* 1º ESO – Microscopio científico detallado */
const Microscope = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3.5s ease-in-out infinite' }}>
    <defs>
      <linearGradient id="mg1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="100%" stopColor="rgba(220,225,235,0.85)" />
      </linearGradient>
    </defs>
    <g style={{ animation: 'gc-float 3.5s ease-in-out infinite' }}>
      {/* Base - layered */}
      <rect x="12" y="67" width="56" height="6" rx="3" fill="rgba(255,255,255,0.82)" />
      <rect x="14" y="68" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      <rect x="20" y="58" width="40" height="11" rx="4" fill="rgba(255,255,255,0.72)" />
      <rect x="22" y="59" width="16" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
      {/* Base feet */}
      <rect x="16" y="72" width="8" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="56" y="72" width="8" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
      {/* Pillar - with highlight */}
      <rect x="33" y="18" width="14" height="42" rx="3.5" fill="url(#mg1)" />
      <rect x="35" y="20" width="4" height="38" rx="1.5" fill="rgba(255,255,255,0.2)" />
      {/* Pillar bolts */}
      <circle cx="40" cy="22" r="1" fill="rgba(180,190,200,0.3)" />
      <circle cx="40" cy="56" r="1" fill="rgba(180,190,200,0.3)" />
      {/* Stage platform */}
      <rect x="22" y="48" width="36" height="5" rx="1.5" fill="rgba(255,255,255,0.88)" />
      <rect x="24" y="49" width="14" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
      {/* Stage clips */}
      <rect x="26" y="47" width="3" height="7" rx="1" fill="rgba(200,210,220,0.5)" />
      <rect x="51" y="47" width="3" height="7" rx="1" fill="rgba(200,210,220,0.5)" />
      {/* Tube angled - detailed */}
      <g transform="rotate(-25 40 26)">
        <rect x="33" y="2" width="14" height="38" rx="4.5" fill="url(#mg1)" />
        <rect x="36" y="4" width="4.5" height="34" rx="1.5" fill="rgba(255,255,255,0.18)" />
        {/* Eyepiece */}
        <rect x="31" y="-2" width="18" height="7" rx="3.5" fill="rgba(255,255,255,0.92)" />
        <rect x="33" y="-1" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="40" cy="-2" rx="5" ry="2" fill="rgba(200,210,220,0.3)" />
        {/* Objective lens cluster */}
        <rect x="32" y="38" width="16" height="7" rx="3" fill="rgba(255,255,255,0.78)" />
        <circle cx="37" cy="44" r="2.5" fill="rgba(100,180,255,0.3)" />
        <circle cx="43" cy="44" r="2.5" fill="rgba(100,180,255,0.2)" />
      </g>
      {/* Focus knobs - coarse & fine */}
      <circle cx="52" cy="34" r="5.5" fill="rgba(255,255,255,0.68)" />
      <circle cx="52" cy="34" r="3" fill="rgba(255,255,255,0.3)" />
      <circle cx="52" cy="34" r="1.2" fill="rgba(0,0,0,0.08)" />
      {/* Knob ridges */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(d => (
        <line key={`k${d}`} x1="52" y1="29" x2="52" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
          transform={`rotate(${d} 52 34)`} />
      ))}
      <circle cx="52" cy="42" r="3.5" fill="rgba(255,255,255,0.55)" />
      <circle cx="52" cy="42" r="1.8" fill="rgba(255,255,255,0.2)" />
      {/* Slide on stage - glowing green */}
      <rect x="34" y="49" width="12" height="3" rx="1" fill="rgba(46,213,115,0.4)" style={{ animation: 'gc-breathe 3s ease-in-out infinite' }} />
      {/* Microscopy particles - vivid */}
      <circle cx="16" cy="12" r="2.5" fill="#2ED573" style={{ animation: 'gc-shimmer 1.6s infinite' }} />
      <circle cx="66" cy="20" r="1.8" fill="#3B82F6" style={{ animation: 'gc-shimmer 2.5s infinite .5s' }} />
      <circle cx="12" cy="40" r="2" fill="#FF6B6B" style={{ animation: 'gc-shimmer 2s infinite 1s' }} />
      <circle cx="68" cy="50" r="1.5" fill="#FFD700" style={{ animation: 'gc-shimmer 2.2s infinite 1.5s' }} />
      <circle cx="8" cy="56" r="1" fill="#A55EEA" style={{ animation: 'gc-shimmer 2s infinite .8s' }} />
      <circle cx="72" cy="36" r="1.2" fill="#2ED573" style={{ animation: 'gc-shimmer 1.8s infinite 1.2s' }} />
    </g>
  </svg>
);

/* 2º ESO – Libro abierto con páginas flotantes */
const Book = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3s ease-in-out infinite' }}>
    <g style={{ animation: 'gc-float 3s ease-in-out infinite' }}>
      {/* Book shadow */}
      <path d="M41 18 Q29 16 11 20 L11 66 Q29 62 41 64 Q53 62 69 66 L69 20 Q53 16 41 18 Z" fill="rgba(0,0,0,0.06)" />
      {/* Left page - with subtle curl */}
      <g style={{ transformOrigin: '40px 44px', animation: 'gc-page-flip 5s ease-in-out infinite' }}>
        <path d="M40 16 Q26 13 8 18 L8 66 Q26 62 40 64 Z" fill="rgba(255,255,255,0.92)" />
        {/* Page edge shadow */}
        <path d="M10 18 L10 64" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
        {/* Text lines */}
        {[26, 32, 38, 44, 50, 56].map((y, i) => (
          <line key={`ll${i}`} x1="16" y1={y} x2={34 - (i % 3) * 2} y2={y}
            stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
        ))}
        {/* Small illustration on left page */}
        <rect x="18" y="48" width="8" height="6" rx="1" fill="rgba(59,130,246,0.12)" />
        <circle cx="22" cy="51" r="2" fill="rgba(59,130,246,0.08)" />
      </g>
      {/* Right page */}
      <g style={{ transformOrigin: '40px 44px', animation: 'gc-page-flip 5s ease-in-out infinite reverse' }}>
        <path d="M40 16 Q54 13 72 18 L72 66 Q54 62 40 64 Z" fill="rgba(255,255,255,0.96)" />
        <path d="M70 18 L70 64" stroke="rgba(0,0,0,0.03)" strokeWidth="2" />
        {[26, 32, 38, 44, 50, 56].map((y, i) => (
          <line key={`rl${i}`} x1="46" y1={y} x2={64 - (i % 3) * 2} y2={y}
            stroke="rgba(0,0,0,0.07)" strokeWidth="0.8" />
        ))}
        {/* Small chart on right page */}
        <rect x="52" y="46" width="12" height="10" rx="1" fill="rgba(46,213,115,0.08)" />
        {[0, 1, 2, 3].map(i => (
          <rect key={`b${i}`} x={54 + i * 3} y={52 - i * 1.5} width="2" height={4 + i * 1.5} rx="0.5"
            fill={`rgba(46,213,115,${0.1 + i * 0.04})`} />
        ))}
      </g>
      {/* Spine - detailed */}
      <line x1="40" y1="16" x2="40" y2="64" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
      <path d="M39 16 Q40 40 39 64" stroke="rgba(0,0,0,0.06)" strokeWidth="2.5" fill="none" />
      {/* Back pages visible */}
      <path d="M40 17 Q27 15 10 19 L9 19 Q26 14.5 40 17" fill="rgba(230,230,230,0.5)" />
      <path d="M40 17 Q53 15 70 19 L71 19 Q54 14.5 40 17" fill="rgba(230,230,230,0.4)" />
      {/* Bookmark ribbon */}
      <path d="M52 16 L52 6 L56 10 L60 6 L60 18" stroke="#FF4757" strokeWidth="1.5" fill="#FF4757" opacity="0.6" />
      {/* Floating letters - VIVID with varied animation */}
      <text x="14" y="10" fill="#FF4757" fontSize="11" fontWeight="bold"
        style={{ animation: 'gc-shimmer 2.5s infinite, gc-drift 4s ease-in-out infinite' }}>A</text>
      <text x="58" y="8" fill="#3B82F6" fontSize="10" fontWeight="bold"
        style={{ animation: 'gc-shimmer 2.5s infinite .8s, gc-drift 4.5s ease-in-out 0.5s infinite' }}>β</text>
      <text x="68" y="46" fill="#2ED573" fontSize="9" fontWeight="bold"
        style={{ animation: 'gc-shimmer 3s infinite 1.5s, gc-drift 3.8s ease-in-out 1s infinite' }}>∑</text>
      <text x="2" y="52" fill="#FFD700" fontSize="8" fontWeight="bold"
        style={{ animation: 'gc-shimmer 2.8s infinite 1s, gc-drift 4.2s ease-in-out 0.8s infinite' }}>π</text>
      <text x="36" y="78" fill="#A55EEA" fontSize="8" fontWeight="bold"
        style={{ animation: 'gc-shimmer 2.5s infinite 2s, gc-drift 3.5s ease-in-out 1.5s infinite' }}>∞</text>
      <text x="24" y="5" fill="#FF6B6B" fontSize="7" fontWeight="bold"
        style={{ animation: 'gc-shimmer 3s infinite 0.5s, gc-drift 4s ease-in-out 0.3s infinite' }}>Ω</text>
    </g>
  </svg>
);

/* 3º ESO – Átomo con núcleo complejo y estelas */
const Atom = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3s ease-in-out infinite' }}>
    <defs>
      <radialGradient id="ag1" cx="0.45" cy="0.42" r="0.5">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
        <stop offset="60%" stopColor="rgba(240,240,255,0.85)" />
        <stop offset="100%" stopColor="rgba(200,210,230,0.7)" />
      </radialGradient>
    </defs>
    {/* Orbit glow */}
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="6" />
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(244,114,182,0.06)" strokeWidth="6" transform="rotate(60 40 40)" />
    <ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="rgba(52,211,153,0.06)" strokeWidth="6" transform="rotate(-60 40 40)" />
    {/* Orbit paths - dashed */}
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2"
      strokeDasharray="3 2" style={{ animation: 'gc-spin-slow 30s linear infinite' }} />
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"
      strokeDasharray="3 2" transform="rotate(60 40 40)" style={{ animation: 'gc-spin-rev 25s linear infinite' }} />
    <ellipse cx="40" cy="40" rx="34" ry="12" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"
      strokeDasharray="3 2" transform="rotate(-60 40 40)" style={{ animation: 'gc-spin-slow 28s linear infinite' }} />
    {/* Nucleus glow */}
    <circle cx="40" cy="40" r="14" fill="rgba(255,255,255,0.06)" style={{ animation: 'gc-nucleus 3s ease-in-out infinite' }} />
    <circle cx="40" cy="40" r="10" fill="rgba(255,255,255,0.08)" />
    {/* Nucleus - protons and neutrons */}
    <g style={{ animation: 'gc-nucleus 3s ease-in-out infinite' }}>
      <circle cx="40" cy="40" r="8" fill="url(#ag1)" />
      {/* Inner particles */}
      <circle cx="37" cy="38" r="3.5" fill="rgba(255,100,100,0.25)" />
      <circle cx="43" cy="38" r="3" fill="rgba(100,100,255,0.2)" />
      <circle cx="40" cy="43" r="3.2" fill="rgba(255,100,100,0.2)" />
      <circle cx="38" cy="41" r="2.5" fill="rgba(100,100,255,0.15)" />
      {/* Highlight */}
      <circle cx="37" cy="37" r="2.5" fill="rgba(255,255,255,0.45)" />
      <circle cx="42" cy="43" r="1" fill="rgba(0,0,0,0.05)" />
    </g>
    {/* Electron 1 - Blue with trail */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-orbit 2.8s linear infinite' }}>
      {/* Trail */}
      <circle cx="40" cy="40" r="2" fill="rgba(56,189,248,0.2)" style={{ transform: 'translateX(14px)' }} />
      <circle cx="40" cy="40" r="1.5" fill="rgba(56,189,248,0.1)" style={{ transform: 'translateX(10px)' }} />
      {/* Electron */}
      <circle cx="40" cy="40" r="4" fill="#38BDF8" style={{ transform: 'translateX(18px)' }} />
      <circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,0.55)" style={{ transform: 'translateX(17px) translateY(-1px)' }} />
    </g>
    {/* Electron 2 - Pink with trail */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-orbit2 3.6s linear infinite' }}>
      <circle cx="40" cy="40" r="1.5" fill="rgba(244,114,182,0.15)" transform="rotate(60 40 40)" style={{ transform: 'translateX(16px)' }} />
      <circle cx="40" cy="40" r="3.5" fill="#F472B6" transform="rotate(60 40 40)" />
      <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.45)" transform="rotate(60 40 40)" />
    </g>
    {/* Electron 3 - Green with trail */}
    <g style={{ transformOrigin: '40px 40px', animation: 'gc-orbit3 3.2s linear infinite' }}>
      <circle cx="40" cy="40" r="1.5" fill="rgba(52,211,153,0.15)" transform="rotate(-60 40 40)" style={{ transform: 'translateX(12px)' }} />
      <circle cx="40" cy="40" r="3.5" fill="#34D399" transform="rotate(-60 40 40)" />
      <circle cx="39" cy="39" r="1.2" fill="rgba(255,255,255,0.45)" transform="rotate(-60 40 40)" />
    </g>
    {/* Energy particles */}
    <circle cx="8" cy="18" r="1.2" fill="rgba(56,189,248,0.55)" style={{ animation: 'gc-shimmer 2s infinite' }} />
    <circle cx="72" cy="14" r="1" fill="rgba(244,114,182,0.5)" style={{ animation: 'gc-shimmer 2.5s infinite .5s' }} />
    <circle cx="6" cy="62" r="1" fill="rgba(52,211,153,0.5)" style={{ animation: 'gc-shimmer 2s infinite 1s' }} />
    <circle cx="74" cy="60" r="0.8" fill="rgba(56,189,248,0.4)" style={{ animation: 'gc-shimmer 2.2s infinite 1.5s' }} />
  </svg>
);

/* 4º ESO – Birrete con diploma detallado y confeti */
const GradCap = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" style={{ animation: 'gc-glow-pulse 3s ease-in-out infinite' }}>
    <g style={{ animation: 'gc-float 3s ease-in-out infinite' }}>
      {/* Shadow */}
      <polygon points="41,11 77,27 41,39 5,27" fill="rgba(0,0,0,0.05)" />
      {/* Board (top) */}
      <polygon points="40,10 78,27 40,39 2,27" fill="rgba(255,255,255,0.92)" />
      <polygon points="40,10 78,27 40,27" fill="rgba(0,0,0,0.05)" />
      {/* Board edge */}
      <line x1="2" y1="27" x2="78" y2="27" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      {/* Board texture */}
      <line x1="20" y1="22" x2="60" y2="22" stroke="rgba(0,0,0,0.02)" strokeWidth="0.5" />
      <line x1="15" y1="30" x2="65" y2="30" stroke="rgba(0,0,0,0.02)" strokeWidth="0.5" />
      {/* Band - with folds */}
      <path d="M12 29 L12 47 Q22 59 40 59 Q58 59 68 47 L68 29 L40 39 Z" fill="rgba(255,255,255,0.78)" />
      <path d="M12 29 L12 42 Q22 52 40 52 L40 39 Z" fill="rgba(255,255,255,0.15)" />
      {/* Band stitching */}
      <path d="M14 29 L14 46 Q24 57 40 57" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
      <path d="M66 29 L66 46 Q56 57 40 57" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
      {/* Button - detailed */}
      <circle cx="40" cy="27" r="3.5" fill="rgba(255,255,255,0.95)" />
      <circle cx="40" cy="27" r="2.5" fill="rgba(220,220,225,0.3)" />
      <circle cx="39" cy="26" r="1.2" fill="rgba(255,255,255,0.5)" />
      {/* Tassel string */}
      <path d="M40 27 Q50 25 58 26 Q64 27 68 26" stroke="#FFD700" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Tassel - vivid gold with detail */}
      <g style={{ transformOrigin: '68px 26px', animation: 'gc-tassel 2.5s ease-in-out infinite' }}>
        <line x1="68" y1="26" x2="68" y2="50" stroke="#FFD700" strokeWidth="2" />
        {/* Tassel knot */}
        <circle cx="68" cy="48" r="2.5" fill="#FFD700" />
        <circle cx="67.5" cy="47.5" r="1" fill="rgba(255,255,255,0.2)" />
        {/* Tassel fringe - multiple strands */}
        <path d="M64 50 L63 60 M65.5 50 L65 59 M67 50 L67 60 M68.5 50 L69 59 M70 50 L71 60 M72 50 L73 58"
          stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" />
        {/* Fringe tips */}
        {[63, 65, 67, 69, 71, 73].map((x, i) => (
          <circle key={`ft${i}`} cx={x} cy={58 + (i % 2) * 2} r="0.8" fill="#FFE566" />
        ))}
      </g>
      {/* Diploma - very detailed */}
      <g transform="translate(8 56)">
        <rect x="0" y="0" width="28" height="18" rx="2.5" fill="rgba(255,248,230,0.88)" />
        <rect x="0" y="0" width="28" height="18" rx="2.5" fill="none" stroke="rgba(200,180,140,0.4)" strokeWidth="0.8" />
        {/* Diploma inner border */}
        <rect x="2" y="2" width="24" height="14" rx="1.5" fill="none" stroke="rgba(200,180,140,0.15)" strokeWidth="0.5" />
        {/* Text lines */}
        <line x1="6" y1="5" x2="22" y2="5" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
        <line x1="8" y1="8" x2="20" y2="8" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
        <line x1="6" y1="11" x2="18" y2="11" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
        {/* Seal - detailed */}
        <circle cx="22" cy="13" r="3" fill="#FF4757" />
        <circle cx="22" cy="13" r="2" fill="#FF6B7A" />
        <circle cx="22" cy="13" r="1" fill="rgba(255,255,255,0.3)" />
        {/* Ribbon from seal */}
        <path d="M20 15 L19 19 M24 15 L25 19" stroke="#FF4757" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* Confetti */}
      <rect x="8" y="6" width="3" height="1.5" rx="0.75" fill="#FF4757" opacity="0.7" transform="rotate(30 9.5 6.75)"
        style={{ animation: 'gc-confetti 3s ease-out infinite' }} />
      <rect x="70" y="4" width="2.5" height="1.2" rx="0.6" fill="#3B82F6" opacity="0.6" transform="rotate(-20 71 4.6)"
        style={{ animation: 'gc-confetti 3.5s ease-out 0.5s infinite' }} />
      <circle cx="14" cy="2" r="1.5" fill="#2ED573" opacity="0.6" style={{ animation: 'gc-confetti 4s ease-out 1s infinite' }} />
      <rect x="62" y="0" width="2" height="1" rx="0.5" fill="#FFD700" opacity="0.7" transform="rotate(45 63 0.5)"
        style={{ animation: 'gc-confetti 3.2s ease-out 1.5s infinite' }} />
      <circle cx="4" cy="44" r="1" fill="#A55EEA" opacity="0.5" style={{ animation: 'gc-confetti 3.8s ease-out 2s infinite' }} />
      {/* Sparkles */}
      <circle cx="76" cy="44" r="1.5" fill="rgba(255,255,200,0.7)" style={{ animation: 'gc-shimmer 1.8s infinite' }} />
      <circle cx="4" cy="16" r="1.2" fill="rgba(255,220,100,0.6)" style={{ animation: 'gc-shimmer 2s infinite .7s' }} />
    </g>
  </svg>
);

/* ── Icon map ────────────────────────────────────────────────── */
const icons = {
  'primaria-1': Star,
  'primaria-2': Palette,
  'primaria-3': Rocket,
  'primaria-4': Compass,
  'primaria-5': TrophyIcon,
  'primaria-6': Diamond,
  'eso-1': Microscope,
  'eso-2': Book,
  'eso-3': Atom,
  'eso-4': GradCap,
};

const GradeCardIcon = ({ type, grade, className = '' }) => {
  useEffect(() => { injectStyles(); }, []);
  const Icon = icons[`${type}-${grade}`];
  if (!Icon) return null;
  const size = type === 'primaria' ? 140 : 120;
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: `${size}px`, height: `${size}px`, margin: '0 auto' }}>
      <Particles type={type} grade={grade} />
      <Icon />
    </div>
  );
};

export default GradeCardIcon;
