import React from 'react';

/**
 * Animacion SVG minimalista para zona central durante la batalla.
 * 3 anillos concentricos finos que rotan lentamente + 4 puntos cardinales
 * que laten suavemente. Diseno limpio, sin distracciones.
 *
 * Prop `intensity`: 'normal' | 'critical' (acelera y vira a rojo).
 */
export default function QBStageAnimationSimple({ intensity = 'normal' }) {
  const isCritical = intensity === 'critical';
  const stroke = isCritical ? '#ef4444' : '#8b5cf6';
  const dot = isCritical ? '#f97316' : '#ec4899';

  return (
    <div className="qb-stage-anim qb-stage-simple" aria-hidden="true">
      <svg viewBox="-200 -200 400 400" preserveAspectRatio="xMidYMid meet">
        <g className={`qb-simple-rotate-cw ${isCritical ? 'is-fast' : ''}`}>
          <circle cx="0" cy="0" r="170" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.35" strokeDasharray="2 6" />
        </g>
        <g className={`qb-simple-rotate-ccw ${isCritical ? 'is-fast' : ''}`}>
          <circle cx="0" cy="0" r="120" fill="none" stroke={stroke} strokeWidth="1.4" opacity="0.5" strokeDasharray="4 10" />
        </g>
        <circle cx="0" cy="0" r="70" fill="none" stroke={stroke} strokeWidth="1.6" opacity="0.6" className="qb-simple-pulse" />

        {[[0, -150], [150, 0], [0, 150], [-150, 0]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={dot} className={`qb-simple-dot qb-simple-dot-${i}`} />
        ))}

        <circle cx="0" cy="0" r="6" fill={dot} opacity="0.85" className="qb-simple-core" />
      </svg>
    </div>
  );
}
