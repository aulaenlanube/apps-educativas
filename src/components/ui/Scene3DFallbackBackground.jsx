import React from 'react';
import './Scene3DFallbackBackground.css';

// Fondo PLANO de repuesto para cuando no hay WebGL (Brave con bloqueo de huella
// digital en "estricto", aceleración por hardware desactivada, GPU en lista
// negra…). No es un adorno opcional: las páginas que van sobre el fondo 3D
// (home, asignaturas, apps) pintan su texto en blanco, así que sin un fondo
// oscuro detrás quedarían ilegibles sobre el degradado claro del body.
//
// Dos variantes, según el entorno elegido (src/services/backgroundScene.js):
//   'naturaleza' → imita la isla (cielo de día + horizonte + suelo)
//   'ciudad'     → skyline futurista en SVG ligero (3 capas de siluetas,
//                  ventanas por patrón, planeta anillado, canal de neón). Sin
//                  filtros ni animación: cero coste. Tema claro/oscuro por CSS.
// Lleva el mismo velo (`scrim`) que la escena 3D, para que el cambio pase
// desapercibido salvo por la falta de movimiento. También sirve de "cielo"
// mientras se descarga el chunk de la escena 3D de la ciudad.

function mulberry32(a) {
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Siluetas deterministas (se calculan una vez al cargar el módulo)
function skylinePath(seed, { base, minH, maxH, minW, maxW, peakAt, peakBoost, spires = 0 }) {
  const rng = mulberry32(seed);
  let x = -20;
  let d = '';
  const tops = [];
  while (x < 1620) {
    const w = minW + rng() * (maxW - minW);
    const near = Math.exp(-(((x - peakAt) / 260) ** 2));
    const h = minH + Math.pow(rng(), 1.4) * (maxH - minH) + near * peakBoost * (0.6 + rng() * 0.4);
    const top = base - h;
    d += `M${x.toFixed(0)} ${base}V${top.toFixed(0)}H${(x + w).toFixed(0)}V${base}Z`;
    // retranqueo ocasional
    if (h > (maxH - minH) * 0.55 && rng() < 0.5) {
      const iw = w * (0.45 + rng() * 0.2);
      const ix = x + (w - iw) / 2;
      const ih = h * (0.12 + rng() * 0.12);
      d += `M${ix.toFixed(0)} ${top.toFixed(0)}V${(top - ih).toFixed(0)}H${(ix + iw).toFixed(0)}V${top.toFixed(0)}Z`;
      if (spires && rng() < spires) {
        const sx = ix + iw / 2;
        d += `M${(sx - 1.5).toFixed(1)} ${(top - ih).toFixed(0)}L${sx.toFixed(1)} ${(top - ih - h * 0.25).toFixed(0)}L${(sx + 1.5).toFixed(1)} ${(top - ih).toFixed(0)}Z`;
      }
    }
    tops.push({ x, w, top });
    x += w + 2 + rng() * 10;
  }
  return { d, tops };
}

const FAR = skylinePath(11, { base: 640, minH: 30, maxH: 150, minW: 18, maxW: 46, peakAt: 1100, peakBoost: 120 });
const MID = skylinePath(23, { base: 720, minH: 60, maxH: 260, minW: 30, maxW: 70, peakAt: 1150, peakBoost: 230, spires: 0.6 });
const NEAR = skylinePath(37, { base: 900, minH: 90, maxH: 300, minW: 60, maxW: 130, peakAt: 1380, peakBoost: 160 });
// perfiles de neón sobre algunas torres de la capa media
const NEON = MID.tops.filter((_, i) => i % 3 === 1).map((t, i) => ({ ...t, c: ['#a78bfa', '#f472b6', '#22d3ee', '#fbbf24'][i % 4] }));

function CitySkyline() {
  return (
    <svg className="cfb-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="cfb-win" width="9" height="12" patternUnits="userSpaceOnUse">
          <rect x="2" y="3" width="4" height="5" className="cfb-win" />
        </pattern>
        <linearGradient id="cfb-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="cfb-haze-a" />
          <stop offset="1" className="cfb-haze-b" />
        </linearGradient>
      </defs>
      {/* planeta anillado */}
      <g className="cfb-planet">
        <circle cx="1040" cy="190" r="64" className="cfb-planet-disc" />
        <ellipse cx="1040" cy="190" rx="118" ry="26" transform="rotate(-20 1040 190)" className="cfb-planet-ring" />
      </g>
      <path d={FAR.d} className="cfb-far" />
      <rect x="0" y="560" width="1600" height="160" fill="url(#cfb-haze)" />
      <path d={MID.d} className="cfb-mid" />
      <path d={MID.d} fill="url(#cfb-win)" className="cfb-mid-win" />
      {NEON.map((t) => (
        <rect key={t.x} x={t.x} y={t.top} width={t.w} height="2.5" fill={t.c} className="cfb-neon" />
      ))}
      <rect x="0" y="716" width="1600" height="3" className="cfb-canal" />
      <path d={NEAR.d} className="cfb-near" />
      <path d={NEAR.d} fill="url(#cfb-win)" className="cfb-near-win" />
    </svg>
  );
}

export default function Scene3DFallbackBackground({ scrim = 0.3, variant = 'naturaleza', className = '', style }) {
  const city = variant === 'ciudad';
  return (
    <div
      className={`scene3d-bg scene3d-bg--fallback ${city ? 'cfb' : ''} ${className}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        ...(city ? null : {
          background: 'linear-gradient(180deg, #2f7fc9 0%, #6fa9dd 38%, #bfe3ff 56%, #2c4f6e 59%, #0a1a2e 100%)',
        }),
        ...style,
      }}
    >
      {city && <CitySkyline />}
      {scrim > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(180deg, rgba(7,11,28,${Math.min(1, scrim + 0.12)}) 0%, rgba(7,11,28,${scrim}) 38%, rgba(7,11,28,${Math.min(1, scrim + 0.16)}) 100%)`,
          }}
        />
      )}
    </div>
  );
}
