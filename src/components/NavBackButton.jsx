import { useEffect } from 'react';
import { motion } from 'framer-motion';

/* ── CSS keyframes (singleton) ─────────────────────────────── */
let injected = false;
function injectStyles() {
  if (injected) return;
  injected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes nb-border-spin {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -138; }
    }
    @keyframes nb-glow {
      0%, 100% { opacity: 0.5; }
      50%      { opacity: 1; }
    }
    @keyframes nb-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-1.5px); }
    }
    .nb-btn {
      cursor: pointer;
      border: none;
      background: none;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nb-btn:focus-visible {
      outline: 2px solid #8B5CF6;
      outline-offset: 3px;
      border-radius: 9999px;
    }
    .nb-icon-wrap {
      width: 42px;
      height: 42px;
      flex-shrink: 0;
    }
    .nb-btn:hover .nb-arrow {
      transform: translateX(-2px);
      transition: transform 0.25s ease;
    }
    .nb-arrow {
      transition: transform 0.25s ease;
    }
    /* ── AnimatedBorderButton ──────────────── */
    @keyframes nb-rect-dash {
      0%   { stroke-dashoffset: 0; }
      50%  { stroke-dashoffset: -200; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes nb-rect-glow {
      0%, 100% { opacity: 0.4; }
      50%      { opacity: 0.85; }
    }
    .nb-rect-btn {
      position: relative;
      cursor: pointer;
      border: none;
      background: none;
      padding: 6px 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-sizing: border-box;
    }
    .nb-rect-btn:focus-visible {
      outline: 2px solid #8B5CF6;
      outline-offset: 3px;
      border-radius: 12px;
    }
    .nb-rect-btn .nb-rect-border {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .nb-rect-btn:hover .nb-rect-text {
      background-size: 200% 200%;
    }
  `;
  document.head.appendChild(s);
}

/* ── Configuración de variantes ────────────────────────────── */
const variants = {
  home: {
    label: 'Inicio',
    gradId: 'nb-grad-home',
    colors: ['#A855F7', '#EC4899'],       // purple → pink
    glowColor: 'rgba(168,85,247,0.35)',
    initialRotate: -180,
  },
  subjects: {
    label: 'Asignaturas',
    gradId: 'nb-grad-subj',
    colors: ['#3B82F6', '#8B5CF6'],       // blue → purple
    glowColor: 'rgba(59,130,246,0.35)',
    initialRotate: 180,
  },
};

/* ── Componente principal ──────────────────────────────────── */
const NavBackButton = ({ variant = 'home', onClick }) => {
  useEffect(() => { injectStyles(); }, []);

  const v = variants[variant];

  return (
    <motion.button
      className="nb-btn"
      onClick={onClick}
      initial={{ scale: 0.5, opacity: 0, rotate: v.initialRotate }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18, mass: 0.8 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* SVG icon */}
      <div className="nb-icon-wrap">
        <svg viewBox="0 0 44 44" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id={v.gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={v.colors[0]} />
              <stop offset="100%" stopColor={v.colors[1]} />
            </linearGradient>
          </defs>

          {/* Outer glow ring */}
          <circle cx="22" cy="22" r="20" fill="none"
            stroke={v.glowColor} strokeWidth="3"
            style={{ animation: 'nb-glow 2.5s ease-in-out infinite' }} />

          {/* Animated dashed border */}
          <circle cx="22" cy="22" r="20" fill="none"
            stroke={`url(#${v.gradId})`} strokeWidth="2"
            strokeDasharray="8 5"
            strokeLinecap="round"
            style={{ animation: 'nb-border-spin 6s linear infinite' }} />

          {/* Background circle */}
          <circle cx="22" cy="22" r="17" fill="white" opacity="0.15" />

          {/* Flecha estilizada */}
          <g className="nb-arrow" style={{ animation: 'nb-float 3s ease-in-out infinite' }}>
            <path d="M26 30 L17 22 L26 14"
              stroke={`url(#${v.gradId})`} strokeWidth="2.8"
              strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="18" y1="22" x2="30" y2="22"
              stroke={`url(#${v.gradId})`} strokeWidth="2.8"
              strokeLinecap="round" />
          </g>

        </svg>
      </div>

      {/* Label text */}
      <motion.span
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
        className="text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent whitespace-nowrap"
        style={{
          backgroundImage: `linear-gradient(to right, ${v.colors[0]}, ${v.colors[1]})`,
        }}
      >
        {v.label}
      </motion.span>
    </motion.button>
  );
};

/* ── Botón flecha circular con borde animado ──────────────── */
export const NavArrowButton = ({ direction = 'left', onClick, colors = ['#6366F1', '#8B5CF6'], glowColor = 'rgba(99,102,241,0.35)' }) => {
  useEffect(() => { injectStyles(); }, []);

  const gradId = `nb-arrow-${direction}`;
  const isLeft = direction === 'left';

  return (
    <motion.button
      className="nb-btn"
      onClick={onClick}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      whileHover={{ scale: 1.12, x: isLeft ? -4 : 4 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="nb-icon-wrap">
        <svg viewBox="0 0 44 44" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          <circle cx="22" cy="22" r="20" fill="none"
            stroke={glowColor} strokeWidth="3"
            style={{ animation: 'nb-glow 2.5s ease-in-out infinite' }} />
          <circle cx="22" cy="22" r="20" fill="none"
            stroke={`url(#${gradId})`} strokeWidth="2"
            strokeDasharray="8 5" strokeLinecap="round"
            style={{ animation: 'nb-border-spin 6s linear infinite' }} />
          <circle cx="22" cy="22" r="17" fill="white" opacity="0.15" />
          <g style={{ animation: 'nb-float 3s ease-in-out infinite' }}>
            {isLeft ? (
              <path d="M26 14 L17 22 L26 30" stroke={`url(#${gradId})`}
                strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ) : (
              <path d="M18 14 L27 22 L18 30" stroke={`url(#${gradId})`}
                strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            )}
          </g>
        </svg>
      </div>
    </motion.button>
  );
};

/* ── Botón con borde animado rectangular ───────────────────── */
export const AnimatedBorderButton = ({
  children,
  onClick,
  colors = ['#A855F7', '#EC4899'],
  glowColor = 'rgba(168,85,247,0.3)',
  shape = 'rect',
  className = '',
}) => {
  useEffect(() => { injectStyles(); }, []);

  const isArrow = shape === 'arrow';
  const gradId = `nb-rect-${colors[0].replace('#', '')}`;
  const arrowPath = 'M 2,20 L 18,3 L 112,3 Q 118,3 118,9 L 118,31 Q 118,37 112,37 L 18,37 Z';

  return (
    <motion.button
      className={className}
      onClick={onClick}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isArrow ? '14px 20px 14px 28px' : '14px 20px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        lineHeight: 1,
        boxSizing: 'border-box',
      }}
    >
      <svg
        viewBox={isArrow ? '0 0 120 40' : '0 0 100 40'}
        preserveAspectRatio="none"
        fill="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {/* Glow */}
        {isArrow ? (
          <path d={arrowPath} fill="none" stroke={glowColor} strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ animation: 'nb-rect-glow 2.5s ease-in-out infinite' }}
            vectorEffect="non-scaling-stroke" />
        ) : (
          <rect x="1.5" y="1.5" width="97" height="37" rx="12" ry="12"
            fill="none" stroke={glowColor} strokeWidth="2.5"
            style={{ animation: 'nb-rect-glow 2.5s ease-in-out infinite' }}
            vectorEffect="non-scaling-stroke" />
        )}
        {/* Animated dashes */}
        {isArrow ? (
          <path d={arrowPath} fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8"
            strokeDasharray="10 6" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'nb-rect-dash 16s ease-in-out infinite' }}
            vectorEffect="non-scaling-stroke" />
        ) : (
          <rect x="1.5" y="1.5" width="97" height="37" rx="12" ry="12"
            fill="none" stroke={`url(#${gradId})`} strokeWidth="1.8"
            strokeDasharray="10 6" strokeLinecap="round"
            style={{ animation: 'nb-rect-dash 16s ease-in-out infinite' }}
            vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: '14px',
          fontWeight: 600,
          backgroundImage: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </span>
    </motion.button>
  );
};

export default NavBackButton;
