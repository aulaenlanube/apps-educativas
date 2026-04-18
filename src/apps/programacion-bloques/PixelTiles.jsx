import React from 'react';

// Pixel-art para el tablero 8x8 de "Programa al Robot".
// Distribucion por nivel (dentro del curso):
//   0-1 pradera · 2-3 bosque · 4-5 montaña · 6-7 ciudad · 8-9 centro-datos
// Los suelos usan ruido determinista en coordenadas GLOBALES (x*8+px, y*8+py):
// los pixeles de una celda siguen sin "salto" en sus vecinas, así el tablero
// se ve como una sola textura continua sin costuras entre tiles.

const CR = 'crispEdges';
const fs = { width: '100%', height: '100%', display: 'block' };

export function biomeForLevel(levelIndex) {
  if (levelIndex <= 1) return 'meadow';
  if (levelIndex <= 3) return 'forest';
  if (levelIndex <= 5) return 'mountain';
  if (levelIndex <= 7) return 'city';
  return 'datacenter';
}

export const BIOME_INFO = {
  meadow:     { label: 'Pradera',          bg: '#4ade80' },
  forest:     { label: 'Bosque',           bg: '#3aa04a' },
  mountain:   { label: 'Montaña',          bg: '#b4c0cf' },
  city:       { label: 'Ciudad',           bg: '#a8afba' },
  datacenter: { label: 'Centro de Datos',  bg: '#5b6778' },
};

// ====================== SUELOS ======================
// Ruido determinista en coordenadas GLOBALES del tablero: los pixeles de una
// celda encajan perfecto con los de sus vecinas, sin costuras visibles.

function hash32(x, y) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

// Colores muy próximos al base para que los bordes de cada tile desaparezcan.
const FLOOR_THEMES = {
  meadow: {
    base: '#4ade80',
    accents: [ // [probabilidad(%), color]
      [22, '#22c55e'], // verde medio
      [16, '#86efac'], // verde claro
      [10, '#16a34a'], // verde oscuro
      [3,  '#65a30d'], // manchita oliva
      [1,  '#fde047'], // minúscula florecilla
    ],
  },
  forest: {
    base: '#3aa04a',
    accents: [
      [22, '#2f8a3e'],
      [18, '#4bb85d'],
      [10, '#27762f'],
      [4,  '#65a30d'],
      [1,  '#a16207'],
    ],
  },
  mountain: {
    base: '#b4c0cf',
    accents: [
      [22, '#9aa8bb'],
      [16, '#cdd6e0'],
      [10, '#7e8ea3'],
      [6,  '#e2e8f0'],
      [2,  '#f1f5f9'],
    ],
  },
  city: {
    base: '#a8afba',
    accents: [
      [22, '#929aa7'],
      [16, '#bec4cd'],
      [10, '#7c8491'],
      [5,  '#d4d8de'],
      [2,  '#f5f5f5'],
    ],
  },
  datacenter: {
    base: '#5b6778',
    accents: [
      [22, '#4a5567'],
      [16, '#6f7c8d'],
      [10, '#3d4756'],
      [4,  '#4c5b7d'],
      [1,  '#22d3ee'], // chispita ciano ocasional
    ],
  },
};

function NoiseFloor({ x, y, biome }) {
  const theme = FLOOR_THEMES[biome] || FLOOR_THEMES.meadow;
  const { base, accents } = theme;
  const pixels = [];
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const gx = x * 8 + px;
      const gy = y * 8 + py;
      const p = hash32(gx, gy) % 100;
      let cum = 0;
      let color = null;
      for (const [prob, c] of accents) {
        cum += prob;
        if (p < cum) { color = c; break; }
      }
      if (color) pixels.push(<rect key={`${px}-${py}`} x={px} y={py} width="1" height="1" fill={color} />);
    }
  }
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} style={fs}>
      <rect width="8" height="8" fill={base} />
      {pixels}
    </svg>
  );
}

const MeadowFloor     = (p) => <NoiseFloor {...p} biome="meadow" />;
const ForestFloor     = (p) => <NoiseFloor {...p} biome="forest" />;
const MountainFloor   = (p) => <NoiseFloor {...p} biome="mountain" />;
const CityFloor       = (p) => <NoiseFloor {...p} biome="city" />;
const DatacenterFloor = (p) => <NoiseFloor {...p} biome="datacenter" />;

const FLOOR_BY = {
  meadow: MeadowFloor, forest: ForestFloor, mountain: MountainFloor,
  city: CityFloor, datacenter: DatacenterFloor,
};
export function FloorTile({ x = 0, y = 0, biome = 'meadow' }) {
  const Cmp = FLOOR_BY[biome] || MeadowFloor;
  return <Cmp x={x} y={y} />;
}

// ====================== MUROS ======================
// Bloque de BLOQUEO TOTAL: casi negro en todos los biomas para marcar caminos
// con muchísimo contraste. Pequeños detalles cambian según el bioma, pero
// domina el negro — así el tablero "dibuja" el pasillo que debe seguir el robot.

function DarkBlock({ accent = '#1f1f1f', highlight = '#2f2f2f' }) {
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} style={fs}>
      <rect width="8" height="8" fill="#0a0a0a" />
      {/* luces y sombras para dar relieve */}
      <rect x="0" y="0" width="8" height="1" fill={highlight} />
      <rect x="0" y="0" width="1" height="8" fill={highlight} />
      <rect x="0" y="7" width="8" height="1" fill="#000" />
      <rect x="7" y="0" width="1" height="8" fill="#000" />
      {/* manchitas sutiles del bioma */}
      <rect x="3" y="2" width="2" height="1" fill={accent} />
      <rect x="5" y="5" width="1" height="1" fill={accent} />
      <rect x="2" y="4" width="1" height="1" fill={highlight} />
    </svg>
  );
}

const WALL_THEMES = {
  meadow:     { accent: '#14532d', highlight: '#3a3a3a' },
  forest:     { accent: '#1e3a1a', highlight: '#3a3a3a' },
  mountain:   { accent: '#334155', highlight: '#4a4a4a' },
  city:       { accent: '#27272a', highlight: '#404040' },
  datacenter: { accent: '#164e63', highlight: '#3f3f46' },
};

export function WallTile({ x = 0, y = 0, biome = 'meadow' }) {
  const t = WALL_THEMES[biome] || WALL_THEMES.meadow;
  return <DarkBlock accent={t.accent} highlight={t.highlight} />;
}

// ====================== AGUA (bloqueante, liquida) ======================

function WaterTileBase({ colors, x = 0, y = 0 }) {
  const v = (x * 5 + y * 7) % 4;
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} style={fs}>
      <rect width="8" height="8" fill={colors.deep} />
      <rect x="0" y="1" width="8" height="2" fill={colors.mid} />
      <rect x="0" y="5" width="8" height="2" fill={colors.mid} />
      <rect x="0" y="3" width="8" height="2" fill={colors.deep} />
      {/* Ondas animadas */}
      <g className="pb-tile-wave">
        {v === 0 && (
          <>
            <rect x="2" y="2" width="2" height="1" fill={colors.light} />
            <rect x="5" y="5" width="2" height="1" fill={colors.light} />
          </>
        )}
        {v === 1 && (
          <>
            <rect x="4" y="2" width="2" height="1" fill={colors.light} />
            <rect x="1" y="5" width="2" height="1" fill={colors.light} />
          </>
        )}
        {v === 2 && (
          <>
            <rect x="3" y="1" width="1" height="1" fill={colors.light} />
            <rect x="6" y="4" width="1" height="1" fill={colors.light} />
          </>
        )}
        {v === 3 && (
          <>
            <rect x="1" y="3" width="3" height="1" fill={colors.light} />
          </>
        )}
      </g>
    </svg>
  );
}

const WATER_THEMES = {
  meadow:     { deep: '#1e40af', mid: '#2563eb', light: '#93c5fd' },
  forest:     { deep: '#0c4a6e', mid: '#0369a1', light: '#7dd3fc' },
  mountain:   { deep: '#1e3a8a', mid: '#1e40af', light: '#bfdbfe' },
  city:       { deep: '#1e293b', mid: '#334155', light: '#94a3b8' },
  datacenter: { deep: '#1e1b4b', mid: '#4c1d95', light: '#a78bfa' }, // "agua virtual" / plasma
};
export function WaterTile({ x = 0, y = 0, biome = 'meadow' }) {
  return <WaterTileBase x={x} y={y} colors={WATER_THEMES[biome] || WATER_THEMES.meadow} />;
}

// ====================== AGUJEROS ======================
const HOLE_THEMES = {
  meadow:     { edge: '#92400e', deep: '#44403c', abyss: '#1c1917' },
  forest:     { edge: '#3f3f46', deep: '#1c1917', abyss: '#000' },
  mountain:   { edge: '#334155', deep: '#0f172a', abyss: '#000' },
  city:       { edge: '#52525b', deep: '#09090b', abyss: '#000' },
  datacenter: { edge: '#a855f7', deep: '#1e1b4b', abyss: '#0f0520' },
};
export function HoleTile({ biome = 'meadow' }) {
  const t = HOLE_THEMES[biome] || HOLE_THEMES.meadow;
  const glow = biome === 'datacenter';
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} style={fs}>
      <rect width="8" height="8" fill={t.abyss} />
      <rect x="0" y="0" width="8" height="1" fill={t.edge} />
      <rect x="0" y="7" width="8" height="1" fill={t.edge} />
      <rect x="0" y="0" width="1" height="8" fill={t.edge} />
      <rect x="7" y="0" width="1" height="8" fill={t.edge} />
      <rect x="1" y="1" width="6" height="1" fill={t.deep} />
      <rect x="1" y="1" width="1" height="6" fill={t.deep} />
      <rect x="2" y="2" width="4" height="4" fill={t.abyss} />
      {glow && <rect x="3" y="3" width="2" height="2" fill={t.edge} opacity="0.35" className="pb-tile-dc-pit" />}
    </svg>
  );
}

// ====================== ENERGÍA (sustituye a la moneda) ======================
// Batería con carga pulsante
export function EnergyItem() {
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} className="pb-tile-energy" style={fs}>
      {/* Sombra en el suelo */}
      <rect x="2" y="7" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      <g className="pb-tile-energy-sprite">
        {/* Terminal superior de batería */}
        <rect x="3" y="0" width="2" height="1" fill="#52525b" />
        {/* Cuerpo de batería */}
        <rect x="2" y="1" width="4" height="6" fill="#374151" />
        <rect x="2" y="1" width="4" height="1" fill="#4b5563" />
        <rect x="2" y="6" width="4" height="1" fill="#1f2937" />
        {/* Nivel de carga interno */}
        <rect x="3" y="2" width="2" height="4" fill="#064e3b" />
        <g className="pb-tile-energy-fill">
          <rect x="3" y="2" width="2" height="4" fill="#22c55e" />
          <rect x="3" y="2" width="2" height="1" fill="#86efac" />
        </g>
        {/* Símbolo rayo */}
        <rect x="3" y="3" width="1" height="1" fill="#fef9c3" />
        <rect x="4" y="4" width="1" height="1" fill="#fef9c3" />
      </g>
    </svg>
  );
}

// ====================== OBJETIVO (bandera pequeña en poste) ======================
export function TargetFlag() {
  // Renderizada en un div pequeño (no ocupa la celda entera)
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} className="pb-tile-target" style={fs}>
      {/* Sombra */}
      <rect x="2" y="7" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      {/* Poste */}
      <rect x="3" y="2" width="1" height="6" fill="#52525b" />
      <rect x="3" y="2" width="1" height="1" fill="#94a3b8" />
      {/* Bandera a cuadros */}
      <g className="pb-tile-flag-wave">
        <rect x="4" y="1" width="4" height="3" fill="#fafafa" />
        {/* Patrón de ajedrez */}
        <rect x="4" y="1" width="1" height="1" fill="#18181b" />
        <rect x="6" y="1" width="1" height="1" fill="#18181b" />
        <rect x="5" y="2" width="1" height="1" fill="#18181b" />
        <rect x="7" y="2" width="1" height="1" fill="#18181b" />
        <rect x="4" y="3" width="1" height="1" fill="#18181b" />
        <rect x="6" y="3" width="1" height="1" fill="#18181b" />
        {/* Borde derecho ondulante */}
        <rect x="7" y="1" width="1" height="1" fill="#f5f5f5" />
      </g>
    </svg>
  );
}

export function BgStar({ size = 12 }) {
  return (
    <svg viewBox="0 0 8 8" shapeRendering={CR} width={size} height={size}>
      <rect x="3" y="1" width="2" height="6" fill="#fef3c7" />
      <rect x="1" y="3" width="6" height="2" fill="#fef3c7" />
      <rect x="3" y="3" width="2" height="2" fill="#fff" />
    </svg>
  );
}
