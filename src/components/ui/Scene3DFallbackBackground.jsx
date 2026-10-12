import React from 'react';
import './Scene3DFallbackBackground.css';

// Fondo PLANO de repuesto para cuando no hay WebGL (Brave con bloqueo de huella
// digital en "estricto", aceleración por hardware desactivada, GPU en lista
// negra…). No es un adorno opcional: las páginas que van sobre el fondo 3D
// (home, asignaturas, apps) pintan su texto en blanco, así que sin un fondo
// oscuro detrás quedarían ilegibles sobre el degradado claro del body.
//
// Tres variantes, según el entorno elegido (src/services/backgroundScene.js):
//   'naturaleza' → imita la isla (cielo de día + horizonte + suelo)
//   'ciudad'     → skyline futurista en SVG ligero (3 capas de siluetas,
//                  ventanas por patrón, planeta anillado, canal de neón).
//   'espacio'    → el viaje a las estrellas en SVG ligero (estrellas, nebulosas
//                  con degradados radiales, galaxia espiral, agujero negro con
//                  disco de acreción, gigante anillado, limbo del planeta de
//                  origen y la puerta estelar).
// Sin filtros ni animación: cero coste. Tema claro/oscuro por CSS.
// Lleva el mismo velo (`scrim`) que la escena 3D, para que el cambio pase
// desapercibido salvo por la falta de movimiento. También sirve de "cielo"
// mientras se descarga el chunk de la escena 3D de la ciudad o del espacio.

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

// ---------------------------------------------------------------------------
// Variante 'espacio'
// ---------------------------------------------------------------------------
// Estrellas deterministas agrupadas por tamaño: un único <path> por grupo
// (cada estrella es un círculo de dos arcos), así el SVG tiene pocos nodos.
function starPath(seed, count, rMin, rMax) {
  const rng = mulberry32(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = rng() * 1600;
    // más densidad en la banda diagonal (la "vía láctea" de la escena 3D)
    const band = rng() < 0.45;
    const y = band ? 900 - x * 0.5 + (rng() - 0.5) * 260 : rng() * 900;
    const r = rMin + rng() * (rMax - rMin);
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
  }
  return d;
}
const STARS_S = starPath(101, 220, 0.6, 1.1);
const STARS_M = starPath(202, 60, 1.2, 1.9);
const STARS_L = starPath(303, 12, 2.0, 2.8);

// brazos de la galaxia: espiral logarítmica (dos brazos) en el plano del disco
function spiralArm(phase) {
  let d = '';
  for (let i = 0; i <= 40; i++) {
    const r = 0.08 + (i / 40) * 0.92;
    const a = phase + Math.log(r) * 2.4;
    const x = Math.cos(a) * r * 150;
    const y = Math.sin(a) * r * 150;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
const ARM_A = spiralArm(0);
const ARM_B = spiralArm(Math.PI);

function SpaceScape() {
  return (
    <svg className="cfb-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sfb-neb-a" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" className="sfb-neb-a1" />
          <stop offset="1" className="sfb-neb-a0" />
        </radialGradient>
        <radialGradient id="sfb-neb-b" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" className="sfb-neb-b1" />
          <stop offset="1" className="sfb-neb-b0" />
        </radialGradient>
        <radialGradient id="sfb-core" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7ea" />
          <stop offset="0.25" stopColor="#ffd9a8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#a5b4fc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sfb-disk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f472b6" stopOpacity="0" />
          <stop offset="0.3" stopColor="#fff1d6" />
          <stop offset="0.7" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#c026d3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sfb-giant" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fde4cf" />
          <stop offset="0.55" stopColor="#d9826b" />
          <stop offset="1" stopColor="#3b1f4a" />
        </radialGradient>
        <radialGradient id="sfb-home" cx="0.5" cy="0.05" r="0.75">
          <stop offset="0" className="sfb-home-1" />
          <stop offset="1" className="sfb-home-0" />
        </radialGradient>
        <radialGradient id="sfb-portal" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ecfeff" />
          <stop offset="0.35" stopColor="#67e8f9" stopOpacity="0.8" />
          <stop offset="1" stopColor="#4c1d95" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      {/* nebulosas */}
      <ellipse cx="1180" cy="230" rx="520" ry="300" fill="url(#sfb-neb-a)" />
      <ellipse cx="420" cy="660" rx="560" ry="260" fill="url(#sfb-neb-a)" opacity="0.6" />
      <ellipse cx="300" cy="180" rx="420" ry="260" fill="url(#sfb-neb-b)" />
      <path d={STARS_S} className="sfb-star" opacity="0.7" />
      <path d={STARS_M} className="sfb-star" />
      <path d={STARS_L} className="sfb-star sfb-star--big" />
      {/* galaxia espiral, inclinada */}
      <g transform="translate(330 205) rotate(-24) scale(1 0.46)" className="sfb-galaxy">
        <circle r="150" fill="url(#sfb-core)" opacity="0.5" />
        <path d={ARM_A} className="sfb-arm" />
        <path d={ARM_B} className="sfb-arm" />
        <circle r="26" fill="url(#sfb-core)" />
      </g>
      {/* estrella del sistema */}
      <circle cx="870" cy="170" r="60" fill="url(#sfb-core)" />
      {/* agujero negro: mitad lejana del disco, arco lensado, sombra, mitad cercana */}
      <g transform="translate(1250 190) rotate(-11)">
        <ellipse rx="190" ry="30" fill="none" stroke="url(#sfb-disk)" strokeWidth="10" opacity="0.5" />
        <path d="M-58 0 A58 58 0 0 1 58 0" fill="none" stroke="#fde68a" strokeWidth="12" opacity="0.75" />
        <circle r="46" className="sfb-hole" />
        <circle r="48" fill="none" stroke="#fff1d6" strokeWidth="2" opacity="0.9" />
        <path d="M-190 0 A190 30 0 0 0 190 0" fill="none" stroke="url(#sfb-disk)" strokeWidth="12" />
      </g>
      {/* gigante gaseoso anillado */}
      <g transform="translate(1470 560)">
        <ellipse rx="230" ry="44" transform="rotate(-12)" fill="none" className="sfb-ring" strokeWidth="16" />
        <circle r="110" fill="url(#sfb-giant)" />
        <path d="M-230 0 A230 44 0 0 0 230 0" transform="rotate(-12)" fill="none" className="sfb-ring" strokeWidth="16" />
      </g>
      {/* puerta estelar */}
      <circle cx="1260" cy="760" r="78" fill="url(#sfb-portal)" opacity="0.85" />
      <circle cx="1260" cy="760" r="84" fill="none" className="sfb-gate" strokeWidth="9" />
      {/* planeta de origen: limbo con atmósfera */}
      <circle cx="260" cy="1620" r="1000" fill="url(#sfb-home)" />
      <circle cx="260" cy="1620" r="1000" fill="none" className="sfb-limb" strokeWidth="5" />
    </svg>
  );
}

export default function Scene3DFallbackBackground({ scrim = 0.3, variant = 'naturaleza', className = '', style }) {
  const city = variant === 'ciudad';
  const space = variant === 'espacio';
  return (
    <div
      className={`scene3d-bg scene3d-bg--fallback ${city ? 'cfb' : space ? 'sfb' : ''} ${className}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        ...(city || space ? null : {
          background: 'linear-gradient(180deg, #2f7fc9 0%, #6fa9dd 38%, #bfe3ff 56%, #2c4f6e 59%, #0a1a2e 100%)',
        }),
        ...style,
      }}
    >
      {city && <CitySkyline />}
      {space && <SpaceScape />}
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
