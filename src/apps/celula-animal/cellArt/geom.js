// Geometría de las ilustraciones de las células (Célula Animal / Vegetal).
// Todo se calcula UNA vez al cargar el módulo (pseudoaleatorio con semilla:
// el dibujo es idéntico en cada render y en cada instancia). El detalle
// repetitivo (cabezas de fosfolípidos, ribosomas, gránulos, fibras) se agrupa
// en un único <path> por capa para mantener bajo el número de nodos.

export const r2 = (n) => Math.round(n * 100) / 100;

// mulberry32: generador determinista
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Muchos círculos en un solo path: pts = [[x, y, r], …]
export const circlesPath = (pts) => pts.map(([x, y, r]) => {
  const d = r2(r * 2);
  return `M${r2(x - r)} ${r2(y)}a${r2(r)} ${r2(r)} 0 1 0 ${d} 0a${r2(r)} ${r2(r)} 0 1 0 ${-d} 0`;
}).join('');

// Muchas elipses giradas en un solo path: [[x, y, rx, ry, angDeg], …]
export const ellipsesPath = (els) => els.map(([x, y, rx, ry, a = 0]) => {
  const t = (a * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const p1 = [x - rx * c, y - rx * s];
  return `M${r2(p1[0])} ${r2(p1[1])}a${r2(rx)} ${r2(ry)} ${r2(a)} 1 0 ${r2(2 * rx * c)} ${r2(2 * rx * s)}a${r2(rx)} ${r2(ry)} ${r2(a)} 1 0 ${r2(-2 * rx * c)} ${r2(-2 * rx * s)}`;
}).join('');

// Segmentos sueltos en un solo path: [[x1, y1, x2, y2], …]
export const segsPath = (segs) => segs.map(([a, b, c, d]) => `M${r2(a)} ${r2(b)}L${r2(c)} ${r2(d)}`).join('');

// Polilínea (abierta o cerrada)
export const polyPath = (pts, closed = false) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`).join('') + (closed ? 'Z' : '');

// Catmull-Rom → Bézier (curva suave que pasa por los puntos)
export function smoothPath(pts, closed = false) {
  const n = pts.length;
  if (n < 2) return '';
  const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

// Contorno orgánico: elipse con armónicos suaves. harm = [[frecuencia, amplitud, fase], …]
export function blobPts(cx, cy, rx, ry, n, harm = []) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    let k = 1;
    for (const [f, a, ph] of harm) k += a * Math.sin(f * t + ph);
    out.push([cx + rx * k * Math.cos(t), cy + ry * k * Math.sin(t)]);
  }
  return out;
}

// Rectángulo redondeado muestreado (sentido horario)
export function roundRectPts(x, y, w, h, r, step = 2) {
  const out = [];
  const line = (x1, y1, x2, y2) => {
    const L = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(L / step));
    for (let i = 0; i < n; i++) out.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
  };
  const arc = (cx, cy, a0) => {
    const n = Math.max(2, Math.round((Math.PI * r) / 2 / step));
    for (let i = 0; i < n; i++) {
      const t = a0 + ((Math.PI / 2) * i) / n;
      out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  };
  line(x + r, y, x + w - r, y);
  arc(x + w - r, y + r, -Math.PI / 2);
  line(x + w, y + r, x + w, y + h - r);
  arc(x + w - r, y + h - r, 0);
  line(x + w - r, y + h, x + r, y + h);
  arc(x + r, y + h - r, Math.PI / 2);
  line(x, y + h - r, x, y + r);
  arc(x + r, y + r, Math.PI);
  return out;
}

// Remuestrea una curva cerrada a paso fijo y devuelve puntos con tangente y
// normal hacia fuera (respecto al centroide).
export function resampleClosed(pts, step) {
  const n = pts.length;
  const seg = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(L);
    total += L;
  }
  const cx = pts.reduce((s, p) => s + p[0], 0) / n;
  const cy = pts.reduce((s, p) => s + p[1], 0) / n;
  const count = Math.max(3, Math.round(total / step));
  const real = total / count;
  const out = [];
  let i = 0;
  let acc = 0;
  for (let k = 0; k < count; k++) {
    const target = k * real;
    while (acc + seg[i] < target && i < n - 1) { acc += seg[i]; i++; }
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const f = seg[i] ? (target - acc) / seg[i] : 0;
    const x = a[0] + (b[0] - a[0]) * f;
    const y = a[1] + (b[1] - a[1]) * f;
    let tx = (b[0] - a[0]) / (seg[i] || 1);
    let ty = (b[1] - a[1]) / (seg[i] || 1);
    let nx = ty;
    let ny = -tx;
    if (nx * (x - cx) + ny * (y - cy) < 0) { nx = -nx; ny = -ny; }
    out.push({ x, y, tx, ty, nx, ny, s: target / total });
  }
  return out;
}

// Curva desplazada a lo largo de la normal
export const offsetPts = (samples, d) => samples.map((p) => [p.x + p.nx * d, p.y + p.ny * d]);

// Banda (anillo) entre dos desplazamientos de una curva cerrada → usar fillRule evenodd
export const bandPath = (samples, dOut, dIn) =>
  polyPath(offsetPts(samples, dOut), true) + polyPath(offsetPts(samples, dIn), true);

// Punto y normal de una curva remuestreada en la fracción s (0..1)
export function at(samples, s) {
  const idx = Math.floor((((s % 1) + 1) % 1) * samples.length) % samples.length;
  return samples[idx];
}

// Ángulo (grados) de un vector
export const deg = (x, y) => (Math.atan2(y, x) * 180) / Math.PI;

// Reparte elementos en N trozos según una clave 0..1 (p. ej. posición en el
// contorno o ángulo): así cada <path> tiene una caja pequeña y, cuando algo se
// mueve encima, el navegador solo vuelve a pintar los trozos que toca.
export function chunk(items, key, n) {
  const out = Array.from({ length: n }, () => []);
  for (const it of items) out[Math.min(n - 1, Math.max(0, Math.floor(key(it) * n)))].push(it);
  return out;
}

// Rejilla: trozos por celdas de tamaño cell (coordenadas del dibujo)
export function tiles(items, cell, xOf = (p) => p[0], yOf = (p) => p[1]) {
  const map = new Map();
  for (const it of items) {
    const k = `${Math.floor(xOf(it) / cell)}:${Math.floor(yOf(it) / cell)}`;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(it);
  }
  return [...map.values()];
}

// Puntos densos sobre una Catmull-Rom abierta (per = muestras por tramo)
export function splinePts(pts, per = 8) {
  const n = pts.length;
  const P = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
        + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push(pts[n - 1]);
  return out;
}

// Túbulo con grosor variable a lo largo de una curva: devuelve el contorno
// cerrado y los bordes (superior/inferior) para luz y sombra.
export function tubeShape(pts, width) {
  const d = splinePts(pts, 10);
  const L = [];
  const Rr = [];
  for (let i = 0; i < d.length; i++) {
    const a = d[Math.max(0, i - 1)];
    const b = d[Math.min(d.length - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const w = width(i / (d.length - 1)) / 2;
    L.push([d[i][0] + nx * w, d[i][1] + ny * w]);
    Rr.push([d[i][0] - nx * w, d[i][1] - ny * w]);
  }
  // el borde "de arriba" es el que mira hacia la luz (arriba-izquierda)
  const upL = L.reduce((s, p, i) => s + (p[1] - Rr[i][1]) + (p[0] - Rr[i][0]) * 0.5, 0) < 0;
  const outline = [...L, ...[...Rr].reverse()];
  return { outline, mid: d, lit: upL ? L : Rr, dark: upL ? Rr : L };
}
