// src/apps/sistema-solar/scene/layout.js
// Disposición de la escena según la escala elegida (puro, testeable):
//   visual     → tamaños y distancias comprimidos para verlo todo a la vez.
//   distancias → distancias proporcionales (1 UA = AU_UNITS); los cuerpos se
//                agrandan muchísimo para que se vean.
//   tamanos    → tamaños proporcionales (radio terrestre = 1 unidad): los
//                planetas en fila junto al borde del Sol.
// Movimiento: periodos reales relativos (1 año terrestre = SIM_SECONDS_PER_YEAR
// a velocidad ×1) y posiciones de partida de HOY (longitud media J2000).
import { FACTS, PLANET_IDS } from '../model/planetFacts';

export const SCALE_MODES = [
  { id: 'visual', label: 'Visual', hint: 'Tamaños y distancias comprimidos para verlo todo a la vez.' },
  { id: 'distancias', label: 'Distancias reales', hint: 'Distancias a escala (1 UA = 36 unidades). Los planetas se dibujan unas 1.000 veces más grandes: a escala real serían puntos invisibles.' },
  { id: 'tamanos', label: 'Tamaños reales', hint: 'Tamaños a escala: radio de la Tierra = 1. El Sol (109 radios terrestres) asoma a la izquierda. Las distancias no están a escala.' },
];

export const VISUAL = {
  sun: { size: 8, dist: 0 },
  mercury: { size: 0.38, dist: 12 },
  venus: { size: 0.95, dist: 16 },
  earth: { size: 1, dist: 21 },
  mars: { size: 0.53, dist: 27 },
  jupiter: { size: 3.8, dist: 40 },
  saturn: { size: 3.2, dist: 55 },
  uranus: { size: 1.8, dist: 70 },
  neptune: { size: 1.75, dist: 85 },
  moon: { size: 0.27, dist: 3 },
};

export const AU_UNITS = 36;
export const SIM_SECONDS_PER_YEAR = 60;
export const EARTH_SPIN_SECONDS = 24;
// Extensión lateral en la fila de tamaños (anillos incluidos)
const LINEUP_EXTENT = { saturn: 2.35, uranus: 1.15 };
const LINEUP_GAP = 3;

export function lineupPositions() {
  const sunR = FACTS.sun.radiusRel;
  let x = sunR + 6;
  const pos = {};
  let prevExtent = 0;
  PLANET_IDS.forEach((id, i) => {
    const r = FACTS[id].radiusRel;
    const ext = r * (LINEUP_EXTENT[id] || 1);
    x += (i === 0 ? 0 : prevExtent + LINEUP_GAP) + ext;
    pos[id] = x;
    prevExtent = ext;
  });
  return pos;
}

const LINEUP = lineupPositions();

export function bodySize(id, mode) {
  if (mode === 'tamanos') return FACTS[id].radiusRel;
  if (mode === 'distancias') return id === 'sun' ? 4 : VISUAL[id].size * 1.15;
  return VISUAL[id].size;
}

export function orbitRadius(id, mode) {
  if (id === 'sun') return 0;
  if (id === 'moon') return mode === 'tamanos' ? 0 : VISUAL.moon.dist * (mode === 'distancias' ? 1.15 : 1);
  if (mode === 'distancias') return FACTS[id].au * AU_UNITS;
  if (mode === 'tamanos') return 0;
  return VISUAL[id].dist;
}

export const lineupX = (id) => LINEUP[id] || 0;

// Factor de escala de los cinturones respecto a la escala visual
export function beltScale(mode, belt = 'asteroid') {
  if (mode !== 'distancias') return 1;
  return belt === 'asteroid' ? (2.7 * AU_UNITS) / 33.5 : (40 * AU_UNITS) / 107;
}

export function cameraView(mode) {
  if (mode === 'distancias') return { pos: [0, 640, 1080], target: [0, 0, 0], maxDistance: 3200 };
  if (mode === 'tamanos') {
    const cx = (LINEUP.mercury + LINEUP.neptune) / 2 - 6;
    return { pos: [cx, 26, 150], target: [cx, 0, 0], maxDistance: 700 };
  }
  return { pos: [0, 58, 122], target: [0, 0, 0], maxDistance: 420 };
}

/* ── Movimiento ── */

const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
// Longitud media en J2000 (grados), elementos de JPL
const L0 = { mercury: 252.2503, venus: 181.9791, earth: 100.4646, mars: 355.4466, jupiter: 34.3964, saturn: 49.9542, uranus: 313.2381, neptune: 304.88 };

// Ángulo (rad) de un planeta en una fecha (órbita circular: aproximación)
export function meanLongitude(id, date = new Date()) {
  const f = FACTS[id];
  if (!f?.orbitDays || L0[id] == null) return 0;
  const days = (date.getTime() - J2000) / 86400000;
  const deg = (L0[id] + (360 / f.orbitDays) * days) % 360;
  return ((deg < 0 ? deg + 360 : deg) * Math.PI) / 180;
}

// Velocidad angular en rad por segundo real a velocidad ×1
export function orbitRate(id) {
  const T = FACTS[id]?.orbitDays;
  if (!T) return 0;
  return (2 * Math.PI) / (SIM_SECONDS_PER_YEAR * (T / 365.25));
}

// Giro sobre sí mismo (rad/s a ×1): la Tierra da una vuelta cada EARTH_SPIN_SECONDS.
// Las rotaciones retrógradas (Venus, Urano) salen negativas.
export function spinRate(id) {
  const h = FACTS[id]?.rotationHours;
  if (!h) return 0;
  return ((2 * Math.PI) / EARTH_SPIN_SECONDS) * (FACTS.earth.rotationHours / h);
}

// Posición en el plano de la eclíptica (vista desde el norte, giro antihorario)
export const orbitXZ = (angle, r) => [Math.cos(angle) * r, -Math.sin(angle) * r];

export const DEG = Math.PI / 180;
