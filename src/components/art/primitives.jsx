import React from 'react';

// Piezas reutilizables para las ilustraciones (sin filtros SVG).

// Destello de 4 puntas. Con `idle` titila en reposo (solo nivel alto).
export const Sparkle = ({ x, y, r = 3, fill = '#fff', opacity = 1, idle = false, delay = 0, dur }) => (
  <path
    className={idle ? 'art-i-twinkle' : undefined}
    style={idle ? { '--d': `${delay}s`, ...(dur ? { '--dur': `${dur}s` } : null) } : undefined}
    d={`M${x} ${y - r} Q${x + r * 0.1} ${y - r * 0.1} ${x + r} ${y} Q${x + r * 0.1} ${y + r * 0.1} ${x} ${y + r} Q${x - r * 0.1} ${y + r * 0.1} ${x - r} ${y} Q${x - r * 0.1} ${y - r * 0.1} ${x} ${y - r} Z`}
    fill={fill}
    opacity={opacity}
  />
);

// Sombra de contacto en el suelo: elipse con degradado radial (necesita el id
// de un radialGradient definido con <ShadowGradient>).
export const ShadowGradient = ({ id, color = '#0f0a32', opacity = 0.35 }) => (
  <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%" stopColor={color} stopOpacity={opacity} />
    <stop offset="70%" stopColor={color} stopOpacity={opacity * 0.35} />
    <stop offset="100%" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

// Halo de luz: radialGradient de un color a transparente (sustituye a los glows con blur).
export const GlowGradient = ({ id, color = '#fff', opacity = 0.6, mid = 0.35 }) => (
  <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%" stopColor={color} stopOpacity={opacity} />
    <stop offset={`${Math.round(mid * 100)}%`} stopColor={color} stopOpacity={opacity * 0.45} />
    <stop offset="100%" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

// Brillo especular en franja (degradado vertical blanco → transparente).
export const GlossGradient = ({ id, opacity = 0.7, vertical = true }) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
    <stop offset="0%" stopColor="#fff" stopOpacity={opacity} />
    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
  </linearGradient>
);

// Degradado de material "3D": claro arriba-izquierda → base → oscuro abajo-derecha.
export const MaterialGradient = ({ id, light, base, dark, x1 = 0.15, y1 = 0, x2 = 0.85, y2 = 1 }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    <stop offset="0%" stopColor={light} />
    <stop offset="48%" stopColor={base} />
    <stop offset="100%" stopColor={dark} />
  </linearGradient>
);
