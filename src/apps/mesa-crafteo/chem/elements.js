// src/apps/mesa-crafteo/chem/elements.js
// Fichas de los átomos que se pueden colocar en la mesa. Un "token" es un
// elemento con su carga formal: 'O', 'O-' (oxígeno con carga −1), 'N+'…
//
// valences: sumas de órdenes de enlace válidas para ese token (el átomo está
//   "completo" cuando la suma de sus enlaces es una de ellas). S y P admiten
//   octeto expandido (S: 2/4/6, P: 3/5), como se dibujan en Bachillerato.
// ve: electrones de valencia del elemento neutro → pares solitarios =
//   (ve − carga − suma de enlaces) / 2. Con eso sale la geometría VSEPR.

export const ELEMENTS = {
  H:  { symbol: 'H',  name: 'Hidrógeno', z: 1,  ve: 1, valences: [1],       color: '#f1f5f9', radius: 0.30, family: 'nonmetal' },
  Be: { symbol: 'Be', name: 'Berilio',   z: 4,  ve: 2, valences: [2],       color: '#c2ff00', radius: 0.40, family: 'alkaline' },
  B:  { symbol: 'B',  name: 'Boro',      z: 5,  ve: 3, valences: [3],       color: '#fda4af', radius: 0.40, family: 'metalloid' },
  C:  { symbol: 'C',  name: 'Carbono',   z: 6,  ve: 4, valences: [4],       color: '#22c55e', radius: 0.42, family: 'nonmetal' },
  N:  { symbol: 'N',  name: 'Nitrógeno', z: 7,  ve: 5, valences: [3],       color: '#3b6cff', radius: 0.40, family: 'nonmetal' },
  O:  { symbol: 'O',  name: 'Oxígeno',   z: 8,  ve: 6, valences: [2],       color: '#ef2b2b', radius: 0.39, family: 'nonmetal' },
  F:  { symbol: 'F',  name: 'Flúor',     z: 9,  ve: 7, valences: [1],       color: '#d9f99d', radius: 0.35, family: 'halogen' },
  Si: { symbol: 'Si', name: 'Silicio',   z: 14, ve: 4, valences: [4],       color: '#f0c8a0', radius: 0.52, family: 'metalloid' },
  P:  { symbol: 'P',  name: 'Fósforo',   z: 15, ve: 5, valences: [3, 5],    color: '#ff8a1f', radius: 0.50, family: 'nonmetal' },
  S:  { symbol: 'S',  name: 'Azufre',    z: 16, ve: 6, valences: [2, 4, 6], color: '#facc15', radius: 0.50, family: 'nonmetal' },
  Cl: { symbol: 'Cl', name: 'Cloro',     z: 17, ve: 7, valences: [1],       color: '#a3e635', radius: 0.48, family: 'halogen' },
  Br: { symbol: 'Br', name: 'Bromo',     z: 35, ve: 7, valences: [1],       color: '#b4432f', radius: 0.52, family: 'halogen' },
  I:  { symbol: 'I',  name: 'Yodo',      z: 53, ve: 7, valences: [1],       color: '#a24bd6', radius: 0.58, family: 'halogen' },
};

// Variantes con carga formal (solo en los niveles de iones).
const CHARGED = {
  'O-': { el: 'O', charge: -1, valences: [1] },
  'O+': { el: 'O', charge: 1,  valences: [3] },
  'N+': { el: 'N', charge: 1,  valences: [4] },
  'C-': { el: 'C', charge: -1, valences: [3] },
};

const SUP = { '+': '⁺', '-': '⁻' };

// Ficha completa de un token: { key, el, charge, valences, ve, color, radius, name, label }
const cache = new Map();
export function tokenInfo(key) {
  if (cache.has(key)) return cache.get(key);
  const ch = CHARGED[key];
  const base = ELEMENTS[ch ? ch.el : key];
  if (!base) return null;
  const charge = ch ? ch.charge : 0;
  const info = {
    key,
    el: base.symbol,
    charge,
    valences: ch ? ch.valences : base.valences,
    ve: base.ve,
    z: base.z,
    color: base.color,
    radius: base.radius,
    family: base.family,
    name: charge ? `${base.name} (${charge > 0 ? 'catión' : 'anión'})` : base.name,
    label: charge ? `${base.symbol}${SUP[charge > 0 ? '+' : '-']}` : base.symbol,
  };
  cache.set(key, info);
  return info;
}

export const isToken = (key) => !!tokenInfo(key);

export const maxValence = (key) => Math.max(...tokenInfo(key).valences);

// Valencia "objetivo" mientras se construye: la menor válida que aún no se ha
// superado. Para S con 3 enlaces → 4; con 5 → 6.
export function targetValence(key, bondSum) {
  const vs = tokenInfo(key).valences;
  return vs.find((v) => v >= bondSum) ?? Math.max(...vs);
}

// Pares solitarios de un átomo con esa suma de enlaces (en su valencia objetivo).
export function lonePairs(key, bondSum) {
  const t = tokenInfo(key);
  const v = targetValence(key, bondSum);
  return Math.max(0, Math.floor((t.ve - t.charge - v) / 2));
}

// Color de texto legible sobre el color del átomo.
export function labelInk(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255; const g = (n >> 8) & 255; const b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#0f172a' : '#ffffff';
}

// Puntos de electrones desapareados que se dibujan en la paleta (= valencia
// principal del token).
export const paletteDots = (key) => tokenInfo(key).valences[0];
