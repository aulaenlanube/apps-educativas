// src/apps/la-fortaleza/FortIcons.jsx
// Iconos SVG propios para construcciones, habilidades y mejoras de la
// fortaleza. Mini-ilustraciones a 48x48 con gradientes, facetas y brillos,
// pensadas para fondos oscuros y coherentes con los colores de identidad de
// cada modelo 3D. Sin imágenes externas y sin emojis.
//
// Nota: los ids de gradiente son fijos por icono; si un icono se pinta varias
// veces, todas las instancias resuelven contra la primera (patrón AppIcon).

import React from 'react';

const icons = {
  arquero: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-arq-roof" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="fi-arq-wood" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#b45309" /><stop offset="1" stopColor="#7c2d12" />
        </linearGradient>
      </defs>
      {/* base de piedra */}
      <path d="M12 41 L36 41 L34 45 L14 45 Z" fill="#475569" />
      <rect x="12" y="39.5" width="24" height="2.6" rx="1.3" fill="#64748b" />
      {/* postes cruzados */}
      <rect x="15" y="18" width="3.4" height="22" rx="1.5" fill="url(#fi-arq-wood)" />
      <rect x="29.6" y="18" width="3.4" height="22" rx="1.5" fill="url(#fi-arq-wood)" />
      <path d="M16 24 L31 35 M31 24 L16 35" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" />
      {/* plataforma */}
      <rect x="12.5" y="20" width="23" height="3.4" rx="1.7" fill="#b45309" />
      <rect x="12.5" y="20" width="23" height="1.2" rx="0.6" fill="rgba(255,255,255,0.3)" />
      {/* tejado cónico */}
      <path d="M9.5 14.5 L24 3.5 L38.5 14.5 Z" fill="url(#fi-arq-roof)" />
      <path d="M24 3.5 L38.5 14.5 L24 14.5 Z" fill="#b45309" opacity="0.45" />
      <path d="M11.5 13.2 L24 4.0 L36.5 13.2" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* banderín */}
      <rect x="23.3" y="0" width="1.4" height="5" rx="0.7" fill="#78350f" />
      <path d="M24.7 0.4 L31 1.8 L24.7 3.4 Z" fill="#f59e0b" />
      {/* ballesta cargada */}
      <path d="M14 28.5 Q24 21.5 34 28.5" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M14 28.5 Q24 27 34 28.5" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <rect x="22.7" y="24" width="2.6" height="11" rx="1.3" fill="#92400e" />
      <path d="M24 21 L20.8 26 L27.2 26 Z" fill="#fbbf24" />
      <circle cx="24" cy="36.5" r="2" fill="#fde047" />
      <circle cx="23.3" cy="35.8" r="0.7" fill="#fffbeb" />
    </svg>
  ),

  rafaga: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-raf-steel" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#94a3b8" /><stop offset="1" stopColor="#475569" />
        </linearGradient>
        <radialGradient id="fi-raf-core" cx="0.4" cy="0.35" r="0.8">
          <stop stopColor="#fef9c3" /><stop offset="0.5" stopColor="#facc15" /><stop offset="1" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      {/* bobina de discos */}
      <rect x="13" y="36" width="22" height="6" rx="2.6" fill="url(#fi-raf-steel)" />
      <rect x="15.5" y="29.5" width="17" height="5.6" rx="2.6" fill="#334155" />
      <rect x="18" y="23.5" width="12" height="5.2" rx="2.4" fill="url(#fi-raf-steel)" />
      <rect x="13" y="36" width="22" height="1.6" rx="0.8" fill="rgba(255,255,255,0.25)" />
      <rect x="18" y="23.5" width="12" height="1.4" rx="0.7" fill="rgba(255,255,255,0.25)" />
      {/* núcleo eléctrico */}
      <circle cx="24" cy="13.5" r="7" fill="url(#fi-raf-core)" />
      <circle cx="21.5" cy="11" r="2" fill="#fffbeb" opacity="0.9" />
      <ellipse cx="24" cy="13.5" rx="10.5" ry="3.6" stroke="#fde047" strokeWidth="1.6" opacity="0.75" />
      {/* arcos eléctricos */}
      <path d="M30.5 9 L36 5.5 L33.5 9.5 L38.5 8" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17.5 9 L12 5.5 L14.5 9.5 L9.5 8" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M24 20.5 L24 23" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="14" r="1.3" fill="#fef08a" />
      <circle cx="10" cy="14" r="1.3" fill="#fef08a" />
    </svg>
  ),

  canon: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-can-stone" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#64748b" /><stop offset="1" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="fi-can-barrel" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#475569" /><stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* tambor de piedra */}
      <path d="M10 42 A14 12 0 0 1 38 42 Z" fill="url(#fi-can-stone)" />
      <rect x="8.5" y="40.5" width="31" height="4" rx="2" fill="#1f2937" />
      <rect x="11" y="33.5" width="26" height="3" rx="1.5" fill="#334155" />
      <rect x="11" y="33.5" width="26" height="1.1" rx="0.55" fill="rgba(255,255,255,0.2)" />
      {/* cañón inclinado */}
      <g transform="rotate(-38 24 26)">
        <rect x="19.5" y="4" width="9" height="22" rx="3.6" fill="url(#fi-can-barrel)" />
        <rect x="18.2" y="2.5" width="11.6" height="5" rx="2.4" fill="#0b1220" />
        <rect x="18.2" y="2.5" width="11.6" height="1.6" rx="0.8" fill="rgba(255,255,255,0.18)" />
        <rect x="19.5" y="12" width="9" height="2.4" fill="#64748b" />
        <rect x="21" y="5" width="2" height="18" rx="1" fill="rgba(255,255,255,0.14)" />
      </g>
      {/* chispa de la mecha */}
      <path d="M38.5 6.5 L39.6 9.2 L42.3 10.3 L39.6 11.4 L38.5 14.1 L37.4 11.4 L34.7 10.3 L37.4 9.2 Z" fill="#fde047" />
      <circle cx="38.5" cy="10.3" r="1.4" fill="#fb923c" />
      {/* balas apiladas */}
      <circle cx="12.5" cy="38" r="3.2" fill="#1f2937" />
      <circle cx="18" cy="39.5" r="3.2" fill="#111827" />
      <circle cx="11.4" cy="36.9" r="1" fill="#64748b" />
      <circle cx="16.9" cy="38.4" r="1" fill="#475569" />
    </svg>
  ),

  hielo: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-hie-cry" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#bae6fd" /><stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {/* anillo de escarcha */}
      <ellipse cx="24" cy="41" rx="13" ry="3.6" fill="#0c4a6e" opacity="0.8" />
      <ellipse cx="24" cy="40.4" rx="13" ry="3.6" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.7" />
      {/* aguja de cristal facetada */}
      <path d="M24 2.5 L31.5 20 L24 41 Z" fill="#0284c7" />
      <path d="M24 2.5 L16.5 20 L24 41 Z" fill="url(#fi-hie-cry)" />
      <path d="M24 2.5 L26.8 20 L24 41 Z" fill="#e0f2fe" opacity="0.55" />
      <path d="M24 7 L27.8 19.4 L24 35" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" fill="none" />
      {/* esquirlas orbitando */}
      <path d="M9.5 22 L11.4 25 L9.5 28 L7.6 25 Z" fill="#7dd3fc" />
      <path d="M38.5 16 L40.4 19 L38.5 22 L36.6 19 Z" fill="#bae6fd" />
      {/* destellos de nieve */}
      <path d="M12 9 V14 M9.5 11.5 H14.5 M10.3 9.8 L13.7 13.2 M13.7 9.8 L10.3 13.2" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M37 33 V37 M35 35 H39" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),

  prisma: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-pri-cry" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e9d5ff" /><stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      {/* haz hacia el suelo */}
      <path d="M21.5 32 L26.5 32 L29 44 L19 44 Z" fill="#c084fc" opacity="0.28" />
      <ellipse cx="24" cy="44" rx="7" ry="2" fill="#c084fc" opacity="0.4" />
      {/* octaedro facetado */}
      <path d="M24 4 L33 19 L24 34 L15 19 Z" fill="#7c3aed" />
      <path d="M24 4 L33 19 L24 34 Z" fill="#6d28d9" />
      <path d="M24 4 L28 19 L24 34 L20 19 Z" fill="url(#fi-pri-cry)" />
      <path d="M24 4 L33 19 L24 34 L15 19 Z" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      {/* anillos giroscópicos */}
      <ellipse cx="24" cy="19" rx="15" ry="4.6" stroke="#e9d5ff" strokeWidth="1.6" opacity="0.9" />
      <ellipse cx="24" cy="19" rx="11" ry="3.4" stroke="#c084fc" strokeWidth="1.2" opacity="0.65" transform="rotate(-18 24 19)" />
      {/* destellos */}
      <path d="M38 6 L38.8 8.2 L41 9 L38.8 9.8 L38 12 L37.2 9.8 L35 9 L37.2 8.2 Z" fill="#e9d5ff" />
      <circle cx="9" cy="29" r="1.3" fill="#c084fc" />
    </svg>
  ),

  muralla: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-mur-stone" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#94a3b8" /><stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* almenas */}
      <rect x="6" y="6" width="8" height="8" rx="1.4" fill="url(#fi-mur-stone)" />
      <rect x="20" y="6" width="8" height="8" rx="1.4" fill="url(#fi-mur-stone)" />
      <rect x="34" y="6" width="8" height="8" rx="1.4" fill="url(#fi-mur-stone)" />
      <rect x="6" y="6" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="20" y="6" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="34" y="6" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      {/* muro con sillares */}
      <rect x="6" y="14" width="36" height="29" rx="2.4" fill="url(#fi-mur-stone)" />
      <path d="M6 22 H42 M6 30 H42 M6 38 H42" stroke="#334155" strokeWidth="2" />
      <path d="M17 14 V22 M29 14 V22 M11 22 V30 M23 22 V30 M35 22 V30 M17 30 V38 M29 30 V38 M11 38 V43 M23 38 V43 M35 38 V43" stroke="#334155" strokeWidth="2" />
      <rect x="6" y="14" width="36" height="2.2" rx="1.1" fill="rgba(255,255,255,0.28)" />
      {/* grietas y musgo (carácter) */}
      <path d="M31 33 L33.5 36 L32 38.5" stroke="#1f2937" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <circle cx="10.5" cy="17.8" r="1.5" fill="#4ade80" opacity="0.8" />
      <circle cx="13" cy="16.9" r="1" fill="#22c55e" opacity="0.8" />
    </svg>
  ),

  oraculo: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="fi-ora-ball" cx="0.38" cy="0.32" r="0.85">
          <stop stopColor="#cffafe" /><stop offset="0.45" stopColor="#22d3ee" /><stop offset="1" stopColor="#0e7490" />
        </radialGradient>
      </defs>
      {/* pedestal */}
      <path d="M16 34 L32 34 L35.5 43 L12.5 43 Z" fill="#334155" />
      <path d="M16 34 L32 34 L33 36.5 L15 36.5 Z" fill="#475569" />
      <rect x="19" y="31.5" width="10" height="3.4" rx="1.7" fill="#fbbf24" />
      {/* esfera de cristal */}
      <circle cx="24" cy="19" r="11.5" fill="url(#fi-ora-ball)" />
      <circle cx="19.5" cy="14.5" r="3.4" fill="#ecfeff" opacity="0.85" />
      <path d="M27 25 Q31 22.5 31.5 18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* anillo orbital */}
      <ellipse cx="24" cy="19" rx="16" ry="5" stroke="#67e8f9" strokeWidth="1.6" opacity="0.85" transform="rotate(-10 24 19)" />
      {/* runas flotantes */}
      <path d="M7.5 26 L9 28.4 L7.5 30.8 L6 28.4 Z" fill="#a5f3fc" />
      <path d="M40 23 L41.5 25.4 L40 27.8 L38.5 25.4 Z" fill="#67e8f9" />
      {/* destello superior */}
      <path d="M24 1 L25.2 4 L28 5.2 L25.2 6.4 L24 9.4 L22.8 6.4 L20 5.2 L22.8 4 Z" fill="#cffafe" />
    </svg>
  ),

  santuario: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-san-heart" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f9a8d4" /><stop offset="1" stopColor="#db2777" />
        </linearGradient>
      </defs>
      {/* halo dorado */}
      <circle cx="24" cy="22" r="16.5" stroke="#fbbf24" strokeWidth="1.6" opacity="0.55" />
      <circle cx="24" cy="22" r="13" stroke="#fde68a" strokeWidth="1" opacity="0.4" />
      {/* corazón facetado */}
      <path d="M24 41 C12.5 32.5 9 24.5 13.5 17.8 C17 12.7 23 13.3 24 18.2 C25 13.3 31 12.7 34.5 17.8 C39 24.5 35.5 32.5 24 41 Z" fill="url(#fi-san-heart)" />
      <path d="M24 41 C35.5 32.5 39 24.5 34.5 17.8 C31 12.7 25 13.3 24 18.2 Z" fill="#be185d" opacity="0.8" />
      <path d="M24 18.2 L29 25 L24 36 L19 25 Z" fill="#fbcfe8" opacity="0.85" />
      <circle cx="17.5" cy="19.5" r="2.2" fill="#fce7f3" opacity="0.8" />
      {/* pétalos orbitando */}
      <circle cx="7" cy="14" r="1.8" fill="#f9a8d4" />
      <circle cx="41" cy="12" r="1.4" fill="#fbcfe8" />
      <circle cx="43" cy="27" r="1.2" fill="#f9a8d4" />
      <path d="M9 36 L9.8 38 L11.8 38.8 L9.8 39.6 L9 41.6 L8.2 39.6 L6.2 38.8 L8.2 38 Z" fill="#fde68a" />
    </svg>
  ),

  meteoro: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <radialGradient id="fi-met-rock" cx="0.4" cy="0.35" r="0.9">
          <stop stopColor="#ea580c" /><stop offset="0.6" stopColor="#9a3412" /><stop offset="1" stopColor="#581c0c" />
        </radialGradient>
      </defs>
      {/* estela de fuego */}
      <path d="M44 2 C36 8 30 13 25.5 19 L31 23 C36 17 40.5 10 44 2 Z" fill="#fde047" opacity="0.85" />
      <path d="M46 8 C40 12 35.5 16 31.5 21.5 L34.5 24 C38.5 19 43 13.5 46 8 Z" fill="#fb923c" opacity="0.8" />
      <path d="M38 3 L31 11" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" />
      {/* roca */}
      <circle cx="18" cy="30" r="11.5" fill="url(#fi-met-rock)" />
      <path d="M8 24.5 A11.5 11.5 0 0 0 24.5 40.5" stroke="#fdba74" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* cráteres */}
      <circle cx="14.5" cy="27" r="2.6" fill="#7c2d12" />
      <circle cx="13.8" cy="26.3" r="1" fill="#fdba74" opacity="0.5" />
      <circle cx="21.5" cy="33.5" r="1.9" fill="#7c2d12" />
      <circle cx="17" cy="36" r="1.2" fill="#7c2d12" />
      {/* chispas */}
      <circle cx="31" cy="28" r="1.4" fill="#fde047" />
      <circle cx="27" cy="13" r="1.1" fill="#fb923c" />
    </svg>
  ),

  ventisca: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-ven-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f0f9ff" /><stop offset="1" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      {/* nube tormentosa */}
      <path d="M11 21 a6.5 6.5 0 0 1 2-12.7 a8 8 0 0 1 15.4-1.5 a7 7 0 0 1 5.2 13.5 Z" fill="url(#fi-ven-cloud)" />
      <path d="M11 21 H38" stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16" cy="11" r="2.4" fill="#ffffff" opacity="0.85" />
      {/* copos detallados */}
      {[[12, 29, 1], [24, 33, 1.25], [36, 29, 1], [17, 41, 0.9], [31, 42, 0.9]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`} stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round">
          <path d="M0 -3.6 V3.6 M-3.6 0 H3.6 M-2.5 -2.5 L2.5 2.5 M2.5 -2.5 L-2.5 2.5" />
          <path d="M-1 -2.8 L0 -3.6 L1 -2.8 M-1 2.8 L0 3.6 L1 2.8" strokeWidth="1" />
        </g>
      ))}
      {/* ráfaga de viento */}
      <path d="M5 35 Q9 33.5 12 35" stroke="#e0f2fe" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M37 37 Q41 35.5 44 37" stroke="#e0f2fe" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  ),

  rayo: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-ray-bolt" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fef08a" /><stop offset="1" stopColor="#eab308" />
        </linearGradient>
      </defs>
      {/* halo */}
      <circle cx="24" cy="24" r="17" fill="#fde047" opacity="0.12" />
      <circle cx="24" cy="24" r="11" fill="#fde047" opacity="0.12" />
      {/* rayo principal con sombreado */}
      <path d="M28.5 3 L12 26 L21.5 26 L18 45 L36.5 20.5 L26 20.5 Z" fill="url(#fi-ray-bolt)" />
      <path d="M28.5 3 L12 26 L21.5 26 Z" fill="#fef9c3" />
      <path d="M26 20.5 L36.5 20.5 L18 45 Z" fill="#ca8a04" opacity="0.75" />
      <path d="M27 6.5 L15.5 23" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round" />
      {/* chispas */}
      <path d="M38 9 L38.7 10.8 L40.5 11.5 L38.7 12.2 L38 14 L37.3 12.2 L35.5 11.5 L37.3 10.8 Z" fill="#fde047" />
      <circle cx="9.5" cy="33" r="1.4" fill="#fde047" />
      <circle cx="40" cy="34" r="1.1" fill="#fef08a" />
    </svg>
  ),

  muralla_fort: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-mf-shield" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a78bfa" /><stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* escudo con borde almenado */}
      <path d="M8 7 L8 11.5 L13 11.5 L13 7 L19 7 L19 11.5 L29 11.5 L29 7 L35 7 L35 11.5 L40 11.5 L40 7 L40 24 C40 34.5 33 40.5 24 44.5 C15 40.5 8 34.5 8 24 Z" fill="url(#fi-mf-shield)" />
      <path d="M24 12.8 L24 41.2 C31 37.6 36.5 32.5 36.5 24 L36.5 13.2 Z" fill="#5b21b6" opacity="0.8" />
      <path d="M8 7 L8 11.5 L13 11.5 L13 7 Z M19 7 L19 11.5 L29 11.5 L29 7 Z M35 7 L35 11.5 L40 11.5 L40 7 Z" fill="rgba(255,255,255,0.22)" />
      {/* remaches */}
      <circle cx="12" cy="16" r="1.1" fill="#e9d5ff" opacity="0.8" />
      <circle cx="36" cy="16" r="1.1" fill="#e9d5ff" opacity="0.8" />
      <circle cx="11.5" cy="27" r="1.1" fill="#e9d5ff" opacity="0.7" />
      <circle cx="36.5" cy="27" r="1.1" fill="#e9d5ff" opacity="0.7" />
      {/* emblema: estrella dorada */}
      <path d="M24 17 L26.2 22 L31.5 22.6 L27.6 26.2 L28.7 31.5 L24 28.8 L19.3 31.5 L20.4 26.2 L16.5 22.6 L21.8 22 Z" fill="#fbbf24" />
      <path d="M24 17 L26.2 22 L31.5 22.6 L27.6 26.2 Z" fill="#f59e0b" />
      <circle cx="22" cy="21" r="1" fill="#fef3c7" opacity="0.9" />
    </svg>
  ),

  torretas_fort: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-tf-body" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ede9fe" /><stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <radialGradient id="fi-tf-head" cx="0.38" cy="0.32" r="0.85">
          <stop stopColor="#cffafe" /><stop offset="0.5" stopColor="#22d3ee" /><stop offset="1" stopColor="#0e7490" />
        </radialGradient>
      </defs>
      {/* muro que une las torretas */}
      <rect x="14" y="28" width="20" height="5" rx="2" fill="#7c3aed" />
      <rect x="14" y="28" width="20" height="1.6" rx="0.8" fill="rgba(255,255,255,0.25)" />
      {[12, 36].map((cx, i) => (
        <g key={i}>
          {/* torre */}
          <rect x={cx - 5} y="17" width="10" height="24" rx="2.4" fill="url(#fi-tf-body)" />
          <rect x={cx - 6.4} y="38.5" width="12.8" height="4" rx="2" fill="#6d28d9" />
          <rect x={cx - 5} y="22" width="10" height="1.6" fill="#8b5cf6" opacity="0.6" />
          <rect x={cx - 1.2} y="26" width="2.4" height="5" rx="1.2" fill="#5b21b6" opacity="0.7" />
          {/* cabeza de energía */}
          <circle cx={cx} cy="12.5" r="5" fill="url(#fi-tf-head)" />
          <circle cx={cx - 1.8} cy="10.8" r="1.4" fill="#ecfeff" opacity="0.9" />
          <ellipse cx={cx} cy="12.5" rx="7.4" ry="2.4" stroke="#67e8f9" strokeWidth="1.1" opacity="0.7" />
          {/* antena */}
          <rect x={cx - 0.8} y="3.5" width="1.6" height="4.5" rx="0.8" fill="#0e7490" />
          <circle cx={cx} cy="3" r="1.4" fill="#a5f3fc" />
        </g>
      ))}
    </svg>
  ),

  canon_fort: (
    <svg viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="fi-cf-barrel" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#475569" /><stop offset="1" stopColor="#0b1220" />
        </linearGradient>
        <linearGradient id="fi-cf-base" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a78bfa" /><stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      {/* gran cañón inclinado */}
      <g transform="rotate(-26 22 22)">
        <rect x="2" y="17.5" width="32" height="9.5" rx="4.4" fill="url(#fi-cf-barrel)" />
        <rect x="31" y="15.8" width="7" height="12.9" rx="3" fill="#0b1220" />
        <rect x="31" y="15.8" width="7" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
        <rect x="10" y="17.5" width="3.4" height="9.5" fill="#fbbf24" />
        <rect x="20" y="17.5" width="3.4" height="9.5" fill="#fbbf24" />
        <rect x="2" y="17.5" width="32" height="2.4" rx="1.2" fill="rgba(255,255,255,0.18)" />
      </g>
      {/* destello de carga en la boca */}
      <path d="M42 7 L43.2 10 L46.2 11.2 L43.2 12.4 L42 15.4 L40.8 12.4 L37.8 11.2 L40.8 10 Z" fill="#c4b5fd" />
      <circle cx="42" cy="11.2" r="1.4" fill="#ede9fe" />
      {/* bastión */}
      <path d="M10 44.5 A9.5 8.5 0 0 1 29 44.5 Z" fill="url(#fi-cf-base)" />
      <rect x="8" y="42.8" width="23" height="3.6" rx="1.8" fill="#5b21b6" />
      <rect x="8" y="42.8" width="23" height="1.2" rx="0.6" fill="rgba(255,255,255,0.2)" />
      {/* banderín de la Biblioteca */}
      <rect x="6.5" y="28" width="1.5" height="12" rx="0.75" fill="#94a3b8" />
      <path d="M8 28.4 L14.5 30 L8 32 Z" fill="#a855f7" />
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
