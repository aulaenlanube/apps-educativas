// tools/geo-helpers.mjs
// Utilidades compartidas por los generadores de datos de los Exploradores
// (build-world-geo.mjs, build-espana-geo.mjs): descarga cacheada de capas de
// Natural Earth (dominio público), simplificación y montaje de geometrías.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { geoArea } from 'd3-geo';

const NE_BASE = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson';
const CACHE = path.join(os.tmpdir(), 'eduapps-natural-earth');

// Capa de Natural Earth en GeoJSON (se descarga una vez y se guarda en caché).
export async function naturalEarth(layer) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${layer}.geojson`);
  if (!fs.existsSync(file)) {
    const res = await fetch(`${NE_BASE}/${layer}.geojson`);
    if (!res.ok) throw new Error(`No se pudo descargar ${layer}: HTTP ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export const propOf = (p, k) => (k in p ? p[k] : p[k.toUpperCase()]);

// Douglas-Peucker en grados (suficiente a esta escala).
function simplifyLine(pts, tol) {
  if (pts.length <= 2) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1e-12;
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i += 1) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

// Anillo cerrado: el primer y el último punto coinciden, así que se simplifica en dos mitades.
function simplifyRing(ring, tol) {
  if (ring.length < 6) return ring;
  const mid = Math.floor(ring.length / 2);
  const a = simplifyLine(ring.slice(0, mid + 1), tol);
  const b = simplifyLine(ring.slice(mid), tol);
  return [...a, ...b.slice(1)];
}

const round = (pts, digits) => pts.map(([x, y]) => [Number(x.toFixed(digits)), Number(y.toFixed(digits))]);

// Une varias geometrías del mismo tipo en una (MultiLineString / MultiPolygon),
// simplificadas y redondeadas.
export function mergeGeometries(geoms, tol = 0.02, digits = 3) {
  const lines = [];
  const polys = [];
  for (const g of geoms) {
    if (!g) continue;
    if (g.type === 'LineString') lines.push(g.coordinates);
    else if (g.type === 'MultiLineString') lines.push(...g.coordinates);
    else if (g.type === 'Polygon') polys.push(g.coordinates);
    else if (g.type === 'MultiPolygon') polys.push(...g.coordinates);
  }
  if (lines.length) {
    const out = lines.map((l) => round(simplifyLine(l, tol), digits)).filter((l) => l.length >= 2);
    return out.length === 1 ? { type: 'LineString', coordinates: out[0] } : { type: 'MultiLineString', coordinates: out };
  }
  const out = polys
    .map((poly) => poly.map((ring) => round(simplifyRing(ring, tol), digits)).filter((ring) => ring.length >= 4))
    .filter((poly) => poly.length)
    // d3-geo pinta el complementario si el anillo va al revés (área > media esfera).
    .map((poly) => (geoArea({ type: 'Polygon', coordinates: poly }) > 2 * Math.PI ? poly.map((ring) => [...ring].reverse()) : poly));
  if (!out.length) return null;
  return out.length === 1 ? { type: 'Polygon', coordinates: out[0] } : { type: 'MultiPolygon', coordinates: out };
}

// ¿Algún vértice de la geometría cae dentro del recuadro [oeste, sur, este, norte]?
export function touchesBox(geometry, [w, s, e, n]) {
  const flat = JSON.stringify(geometry.coordinates).match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || [];
  return flat.some((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return x >= w && x <= e && y >= s && y <= n;
  });
}

// Se queda solo con las partes (líneas o polígonos) de una geometría múltiple
// que tocan el recuadro: en Natural Earth algunos ríos homónimos vienen juntos
// (el Colorado de Estados Unidos y el de Argentina).
export function partsInBox(geometry, box) {
  if (geometry.type === 'MultiLineString') {
    const lines = geometry.coordinates.filter((c) => touchesBox({ coordinates: c }, box));
    return lines.length ? { type: 'MultiLineString', coordinates: lines } : null;
  }
  if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates.filter((c) => touchesBox({ coordinates: c }, box));
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null;
  }
  return touchesBox(geometry, box) ? geometry : null;
}
