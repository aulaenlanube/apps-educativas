import React from 'react';

/**
 * Animacion SVG espectacular y original para la zona central durante la batalla.
 * Multiples capas: anillos giratorios, nucleo pulsante, ondas expansivas, particulas orbitales.
 * Pointer-events none, posicionada absolutamente detras del contenido.
 *
 * Prop `intensity`: 'normal' | 'critical' (cuando timer < 5s -> mas rapido y rojizo).
 */
export default function QBStageAnimation({ intensity = 'normal' }) {
  const isCritical = intensity === 'critical';
  const palette = isCritical
    ? { c1: '#ef4444', c2: '#f97316', c3: '#fbbf24', c4: '#dc2626', glow: '#fca5a5' }
    : { c1: '#8b5cf6', c2: '#ec4899', c3: '#06b6d4', c4: '#3b82f6', glow: '#c4b5fd' };

  return (
    <div className="qb-stage-anim" aria-hidden="true">
      <svg viewBox="-200 -200 400 400" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="qbCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.95" />
            <stop offset="40%" stopColor={palette.c1} stopOpacity="0.7" />
            <stop offset="100%" stopColor={palette.c2} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="qbRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.c1} />
            <stop offset="50%" stopColor={palette.c2} />
            <stop offset="100%" stopColor={palette.c3} />
          </linearGradient>
          <linearGradient id="qbRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.c4} />
            <stop offset="100%" stopColor={palette.c3} />
          </linearGradient>
          <filter id="qbBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="qbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Halo difuso */}
        <circle cx="0" cy="0" r="140" fill="url(#qbCoreGrad)" filter="url(#qbBlur)" className="qb-stage-pulse" />

        {/* Ondas expansivas */}
        {[0, 1, 2].map(i => (
          <circle
            key={`wave${i}`}
            cx="0" cy="0" r="60"
            fill="none"
            stroke={palette.c2}
            strokeWidth="1.5"
            opacity="0"
            className={`qb-stage-wave qb-stage-wave-${i}`}
          />
        ))}

        {/* Anillo exterior dashed (giro CW) */}
        <g className={`qb-stage-rotate-cw ${isCritical ? 'is-fast' : ''}`}>
          <circle cx="0" cy="0" r="160"
            fill="none"
            stroke="url(#qbRingGrad)"
            strokeWidth="2"
            strokeDasharray="14 8"
            opacity="0.55"
            filter="url(#qbGlow)"
          />
        </g>

        {/* Anillo medio poligonal (giro CCW) */}
        <g className={`qb-stage-rotate-ccw ${isCritical ? 'is-fast' : ''}`}>
          <polygon
            points="120,0 60,104 -60,104 -120,0 -60,-104 60,-104"
            fill="none"
            stroke="url(#qbRingGrad2)"
            strokeWidth="2.5"
            opacity="0.45"
            filter="url(#qbGlow)"
          />
          <polygon
            points="100,0 50,87 -50,87 -100,0 -50,-87 50,-87"
            fill="none"
            stroke={palette.c3}
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.6"
          />
        </g>

        {/* Triangulos contra-rotantes */}
        <g className="qb-stage-rotate-cw is-slow">
          <polygon points="0,-78 67,39 -67,39"
            fill="none" stroke={palette.c1} strokeWidth="1.5" opacity="0.4" />
        </g>
        <g className="qb-stage-rotate-ccw is-slow">
          <polygon points="0,78 67,-39 -67,-39"
            fill="none" stroke={palette.c4} strokeWidth="1.5" opacity="0.4" />
        </g>

        {/* Particulas orbitales */}
        <g className="qb-stage-rotate-cw">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = 130;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            return (
              <circle
                key={`p${i}`}
                cx={x} cy={y} r="3"
                fill={i % 2 === 0 ? palette.c2 : palette.c3}
                filter="url(#qbGlow)"
                className={`qb-stage-particle qb-stage-particle-${i % 4}`}
              />
            );
          })}
        </g>

        {/* Nucleo central */}
        <g className="qb-stage-core-spin">
          <circle cx="0" cy="0" r="22" fill={palette.c1} opacity="0.85" filter="url(#qbGlow)" />
          <circle cx="0" cy="0" r="14" fill={palette.glow} opacity="0.9" />
          <polygon points="0,-8 7,4 -7,4" fill="white" opacity="0.85" />
        </g>

        {/* Rayos de luz */}
        <g className="qb-stage-rays" opacity="0.18">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * 360;
            return (
              <rect
                key={`ray${i}`}
                x="-1" y="-180" width="2" height="60"
                fill={palette.glow}
                transform={`rotate(${a})`}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
