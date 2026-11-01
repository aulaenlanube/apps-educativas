// Utilidades geométricas del motor de mapas (Explorador del Mundo, Explorador
// de España): rutas SVG compactas, "cuerpo principal" de un país o región sin
// sus partes lejanas, encuadres y vistas.
import { geoPath, geoArea, geoBounds } from 'd3-geo';

/* ───────── rutas SVG compactas ───────── */

const fmt = (v) => String(v).replace(/^(-?)0\./, '$1.');

// Contexto de d3.geoPath que redondea, usa coordenadas relativas y descarta los
// vértices a menos de `tol` del anterior y los anillos que se quedan en nada.
class CompactPath {
  constructor(tol, digits) {
    this.tol = tol;
    this.f = 10 ** digits;
    this.out = [];
    this.ring = null;
  }

  r(v) { return Math.round(v * this.f) / this.f; }

  moveTo(x, y) {
    this.flush();
    this.rx = this.r(x);
    this.ry = this.r(y);
    this.lx = x;
    this.ly = y;
    this.n = 0;
    this.ring = [`M${fmt(this.rx)} ${fmt(this.ry)}`];
  }

  lineTo(x, y) {
    if (Math.abs(x - this.lx) + Math.abs(y - this.ly) < this.tol) return;
    const nx = this.r(x);
    const ny = this.r(y);
    this.ring.push(`l${fmt(this.r(nx - this.rx))} ${fmt(this.r(ny - this.ry))}`);
    this.rx = nx;
    this.ry = ny;
    this.lx = x;
    this.ly = y;
    this.n += 1;
  }

  closePath() {
    if (this.ring && this.n >= 2) this.out.push(`${this.ring.join('')}z`);
    this.ring = null;
  }

  // Líneas abiertas (ríos, retícula): se conservan aunque sean cortas.
  flush() {
    if (this.ring && this.n >= 1) this.out.push(this.ring.join(''));
    this.ring = null;
  }

  arc() {}

  toString() {
    this.flush();
    return this.out.join('');
  }
}

export function pathString(projection, geometry, tol = 0.05, digits = 2) {
  if (!geometry) return '';
  const ctx = new CompactPath(tol, digits);
  geoPath(projection, ctx)(geometry);
  return ctx.toString();
}

/* ───────── cuerpo principal ───────── */

export function polygonsOf(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

export const asGeometry = (polys) => (polys.length === 1
  ? { type: 'Polygon', coordinates: polys[0] }
  : { type: 'MultiPolygon', coordinates: polys });

// Distancia mínima (grados) entre dos intervalos de longitud en el círculo.
function lonGap(a, b) {
  let best = Infinity;
  for (const shift of [-360, 0, 360]) {
    const gap = Math.max(0, Math.max(a[0], b[0] + shift) - Math.min(a[1], b[1] + shift));
    best = Math.min(best, gap);
  }
  return best;
}

function boxGap(a, b) {
  const lg = lonGap([a.w, a.e], [b.w, b.e]);
  const tg = Math.max(0, Math.max(a.s, b.s) - Math.min(a.n, b.n));
  return Math.hypot(lg, tg);
}

// Separa los polígonos conectados (a menos de `gap` grados) con el mayor de
// ellos (`body`) del resto (`remote`).
export function splitBody(geometry, gap = 5) {
  const polys = polygonsOf(geometry).map((coords) => {
    const g = { type: 'Polygon', coordinates: coords };
    const [[w, s], [e, n]] = geoBounds(g);
    return { coords, area: geoArea(g), box: { w, s, e: e < w ? e + 360 : e, n } };
  });
  if (polys.length <= 1) return { body: geometry, remote: [] };
  polys.sort((a, b) => b.area - a.area);
  const kept = [polys[0]];
  let rest = polys.slice(1);
  let grew = true;
  while (grew && rest.length) {
    grew = false;
    const next = [];
    for (const p of rest) {
      if (kept.some((k) => boxGap(k.box, p.box) < gap)) { kept.push(p); grew = true; } else next.push(p);
    }
    rest = next;
  }
  return { body: asGeometry(kept.map((p) => p.coords)), remote: rest.map((p) => p.coords) };
}

export const mainBody = (geometry, gap) => splitBody(geometry, gap).body;

/* ───────── vistas ───────── */

export function padView(v, k = 0.12) {
  return { x: v.x - v.w * k, y: v.y - v.h * k, w: v.w * (1 + 2 * k), h: v.h * (1 + 2 * k) };
}

export const boundsToView = ([[x0, y0], [x1, y1]]) => ({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });

// Vista centrada en unos límites, con margen y tamaño mínimo (para que lo muy
// pequeño no se vea a pantalla completa).
export function focusView(bounds, minW, pad = 0.35) {
  let v = padView(boundsToView(bounds), pad);
  if (v.w < minW) {
    const cx = v.x + v.w / 2;
    const cy = v.y + v.h / 2;
    const h = Math.max(v.h, minW / 2);
    v = { x: cx - minW / 2, y: cy - h / 2, w: minW, h };
  }
  return v;
}

export function unionBounds(list) {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
  for (const [[a, b], [c, d]] of list) {
    x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d);
  }
  return [[x0, y0], [x1, y1]];
}

// Puntos a lo largo del borde de un recuadro [oeste, sur, este, norte].
export function boxSamples(w, s, e, n, steps = 12) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const lon = w + ((e - w) * i) / steps;
    const lat = s + ((n - s) * i) / steps;
    pts.push([lon, s], [lon, n], [w, lat], [e, lat]);
  }
  return pts;
}

// Vista de un recuadro geográfico proyectado.
export function boxView(projection, box, pad = 0.04) {
  const xy = boxSamples(...box).map((p) => projection(p)).filter(Boolean);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  return padView({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, pad);
}
