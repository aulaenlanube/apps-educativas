// src/apps/la-fortaleza/FortIcons.jsx
// Iconos SVG propios para construcciones, habilidades y mejoras de la
// fortaleza. Mini-ilustraciones planas con los colores de identidad de cada
// torre (los mismos del modelo 3D), pensadas para fondos oscuros. Sin
// imágenes externas y sin emojis.

import React from 'react';

const icons = {
  arquero: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M7 12 L16 4 L25 12 Z" fill="#b45309" />
      <path d="M9 12 L16 5.6 L23 12 Z" fill="#f59e0b" />
      <rect x="10" y="12" width="2.4" height="14" rx="1" fill="#92400e" />
      <rect x="19.6" y="12" width="2.4" height="14" rx="1" fill="#92400e" />
      <rect x="8.5" y="25" width="15" height="2.6" rx="1.3" fill="#78350f" />
      <rect x="9.5" y="14.5" width="13" height="2.2" rx="1.1" fill="#b45309" />
      <path d="M11 21.5 Q16 17.5 21 21.5" stroke="#fde68a" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 23.5 L16 17.2" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 15.4 L14.4 18 L17.6 18 Z" fill="#fbbf24" />
      <rect x="7" y="12" width="18" height="1.4" rx="0.7" fill="rgba(255,255,255,0.25)" />
    </svg>
  ),

  rafaga: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="10" y="22" width="12" height="4" rx="1.5" fill="#334155" />
      <rect x="11.5" y="17.5" width="9" height="4" rx="1.5" fill="#64748b" />
      <rect x="13" y="13" width="6" height="4" rx="1.5" fill="#334155" />
      <circle cx="16" cy="9" r="3.6" fill="#facc15" />
      <circle cx="15" cy="8" r="1.1" fill="#fef9c3" />
      <path d="M16 9 L22.5 5.5" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 9 L9.5 5.5" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 11.5 L25 10" stroke="#fde047" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 11.5 L7 10" stroke="#fde047" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="16" cy="9" rx="6.4" ry="2.3" stroke="#fde047" strokeWidth="1" opacity="0.55" />
    </svg>
  ),

  canon: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M8 24 A8 8 0 0 1 24 24 Z" fill="#475569" />
      <rect x="6.5" y="23" width="19" height="3" rx="1.5" fill="#334155" />
      <g transform="rotate(-35 16 18)">
        <rect x="13.5" y="6" width="5" height="13" rx="2" fill="#1f2937" />
        <rect x="12.7" y="5" width="6.6" height="3.4" rx="1.6" fill="#0f172a" />
        <rect x="13.5" y="10.5" width="5" height="1.4" fill="#475569" />
      </g>
      <circle cx="24.5" cy="7.5" r="2" fill="#fb923c" />
      <circle cx="24.5" cy="7.5" r="0.9" fill="#fde047" />
      <circle cx="9" cy="21" r="2.1" fill="#1f2937" />
      <circle cx="8.3" cy="20.3" r="0.6" fill="#64748b" />
    </svg>
  ),

  hielo: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 3 L21 14 L16 27 L11 14 Z" fill="#7dd3fc" />
      <path d="M16 3 L21 14 L16 27" fill="#38bdf8" opacity="0.55" />
      <path d="M16 6.5 L18.6 13.8 L16 22.5" stroke="#e0f2fe" strokeWidth="1.1" opacity="0.8" />
      <rect x="9" y="26" width="14" height="2.4" rx="1.2" fill="#0c4a6e" />
      <path d="M6.5 10 L8.9 11.4 M7.7 9.1 L7.7 12.3" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 17 L26.4 18.4 M25.2 16.1 L25.2 19.3" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),

  prisma: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 4 L22 14 L16 24 L10 14 Z" fill="#a855f7" />
      <path d="M16 4 L22 14 L16 24" fill="#7c3aed" />
      <path d="M16 4 L18.5 14 L16 24 L13.5 14 Z" fill="#c084fc" />
      <ellipse cx="16" cy="14" rx="10" ry="3.4" stroke="#e9d5ff" strokeWidth="1.3" opacity="0.85" />
      <ellipse cx="16" cy="14" rx="7" ry="2.3" stroke="#c084fc" strokeWidth="1" opacity="0.6" transform="rotate(-14 16 14)" />
      <circle cx="16" cy="27.4" r="1.6" fill="#7c3aed" opacity="0.6" />
    </svg>
  ),

  muralla: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="5" y="5" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="13" y="5" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="21" y="5" width="6" height="5" rx="1" fill="#94a3b8" />
      <rect x="5" y="10" width="22" height="17" rx="1.6" fill="#64748b" />
      <path d="M5 15.5 H27 M5 21.2 H27" stroke="#475569" strokeWidth="1.4" />
      <path d="M12 10 V15.5 M20 10 V15.5 M9 15.5 V21.2 M16 15.5 V21.2 M23 15.5 V21.2 M12 21.2 V27 M20 21.2 V27" stroke="#475569" strokeWidth="1.4" />
      <rect x="5" y="10" width="22" height="1.6" fill="rgba(255,255,255,0.2)" />
    </svg>
  ),

  oraculo: (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="13" r="7.5" fill="#0e7490" />
      <circle cx="16" cy="13" r="6" fill="#22d3ee" />
      <circle cx="13.4" cy="10.4" r="2" fill="#a5f3fc" opacity="0.9" />
      <ellipse cx="16" cy="13" rx="10" ry="3.2" stroke="#67e8f9" strokeWidth="1.3" opacity="0.8" />
      <path d="M11 22 L21 22 L23 27 L9 27 Z" fill="#334155" />
      <rect x="13" y="20.5" width="6" height="2.4" rx="1.2" fill="#475569" />
      <path d="M16 2.4 L16.9 4.6 L19 5.4 L16.9 6.2 L16 8.4 L15.1 6.2 L13 5.4 L15.1 4.6 Z" fill="#a5f3fc" />
    </svg>
  ),

  santuario: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 27 C8 21 5.5 15.5 8.5 10.8 C10.8 7.2 15 7.6 16 11 C17 7.6 21.2 7.2 23.5 10.8 C26.5 15.5 24 21 16 27 Z" fill="#ec4899" />
      <path d="M16 27 C24 21 26.5 15.5 23.5 10.8 C21.2 7.2 17 7.6 16 11 Z" fill="#db2777" />
      <path d="M16 11 L19 16 L16 23 L13 16 Z" fill="#f9a8d4" />
      <circle cx="6.5" cy="7" r="1.2" fill="#f9a8d4" />
      <circle cx="25.5" cy="6" r="1" fill="#f9a8d4" />
      <circle cx="27" cy="13" r="0.9" fill="#fbcfe8" />
    </svg>
  ),

  meteoro: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M26 4 L14 16" stroke="#fde047" strokeWidth="3.4" strokeLinecap="round" opacity="0.7" />
      <path d="M28 8 L19 17" stroke="#fb923c" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <circle cx="12" cy="20" r="7" fill="#9a3412" />
      <circle cx="12" cy="20" r="5.4" fill="#c2410c" />
      <circle cx="10" cy="18" r="1.6" fill="#7c2d12" />
      <circle cx="14.5" cy="21.5" r="1.2" fill="#7c2d12" />
      <path d="M5.5 17.5 A7 7 0 0 0 16 26.2" stroke="#fdba74" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),

  ventisca: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M8 14 a4.5 4.5 0 0 1 1.4-8.8 a5.5 5.5 0 0 1 10.6-1 a4.8 4.8 0 0 1 3.6 9.3 Z" fill="#e0f2fe" />
      <path d="M8 14 H24" stroke="#bae6fd" strokeWidth="1.2" />
      {[[9, 19], [16, 22], [23, 19], [12, 26], [20, 27]].map(([x, y], i) => (
        <g key={i} stroke="#7dd3fc" strokeWidth="1.3" strokeLinecap="round">
          <path d={`M${x - 2.2} ${y} H${x + 2.2} M${x} ${y - 2.2} V${y + 2.2}`} />
          <path d={`M${x - 1.5} ${y - 1.5} L${x + 1.5} ${y + 1.5} M${x + 1.5} ${y - 1.5} L${x - 1.5} ${y + 1.5}`} opacity="0.7" />
        </g>
      ))}
    </svg>
  ),

  rayo: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M18.5 3 L8 18 L14.5 18 L12 29 L24 13.5 L17 13.5 Z" fill="#facc15" />
      <path d="M18.5 3 L8 18 L14.5 18 Z" fill="#fde047" />
      <path d="M17 13.5 L24 13.5 L12 29 Z" fill="#eab308" />
    </svg>
  ),

  muralla_fort: (
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M6 6 L6 9 L9 9 L9 6 L13 6 L13 9 L19 9 L19 6 L23 6 L23 9 L26 9 L26 6 L26 16 C26 23 21.5 27 16 29 C10.5 27 6 23 6 16 Z" fill="#8b5cf6" />
      <path d="M16 8.5 L16 26.8 C20.5 24.9 23.8 21.5 23.8 16 L23.8 8.8 Z" fill="#7c3aed" />
      <path d="M16 12 L17.2 14.6 L20 15 L18 17 L18.5 19.8 L16 18.5 L13.5 19.8 L14 17 L12 15 L14.8 14.6 Z" fill="#fbbf24" />
    </svg>
  ),

  torretas_fort: (
    <svg viewBox="0 0 32 32" fill="none">
      {[[10], [22]].map(([cx], i) => (
        <g key={i}>
          <rect x={cx - 3} y="12" width="6" height="14" rx="1.4" fill="#ddd6fe" />
          <rect x={cx - 3.8} y="24.5" width="7.6" height="2.6" rx="1.3" fill="#8b5cf6" />
          <circle cx={cx} cy="10" r="3" fill="#22d3ee" />
          <circle cx={cx - 1} cy="9" r="0.9" fill="#cffafe" />
          <rect x={cx - 0.7} y="4.5" width="1.4" height="3.5" rx="0.7" fill="#0e7490" />
        </g>
      ))}
      <rect x="13" y="18" width="6" height="2.2" rx="1.1" fill="#8b5cf6" />
    </svg>
  ),

  canon_fort: (
    <svg viewBox="0 0 32 32" fill="none">
      <g transform="rotate(-20 16 16)">
        <rect x="4" y="13" width="20" height="6.5" rx="3" fill="#1f2937" />
        <rect x="22" y="11.8" width="4.5" height="8.9" rx="2" fill="#0f172a" />
        <rect x="8" y="13" width="2.2" height="6.5" fill="#475569" />
        <rect x="4" y="13" width="20" height="1.6" rx="0.8" fill="rgba(255,255,255,0.18)" />
      </g>
      <path d="M9 26.5 A7 7 0 0 1 23 26.5 Z" fill="#8b5cf6" />
      <rect x="7.5" y="25.6" width="17" height="2.6" rx="1.3" fill="#6d28d9" />
      <circle cx="28" cy="8" r="1.6" fill="#c4b5fd" opacity="0.8" />
    </svg>
  ),
};

/** Icono por id de construcción/habilidad/mejora. */
const FortIcon = ({ id, size = 26, className = '' }) => {
  const icon = icons[id];
  if (!icon) return null;
  return (
    <span className={`fort-icon ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {icon}
    </span>
  );
};

export default FortIcon;
