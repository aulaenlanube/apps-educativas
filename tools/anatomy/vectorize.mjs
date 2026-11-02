// Vectoriza un búfer de identificadores: silueta visible de cada estructura
// como ruta SVG compacta, su área y un punto de anclaje para etiquetas (el
// punto interior más alejado del borde).
import { contours } from 'd3-contour';

// Douglas-Peucker sobre un anillo cerrado.
function simplifyRing(ring, tol) {
  if (ring.length < 8) return ring;
  const keep = new Uint8Array(ring.length);
  keep[0] = 1; keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  const t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = ring[a]; const [bx, by] = ring[b];
    const dx = bx - ax; const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1e-9;
    let best = -1; let bi = -1;
    for (let i = a + 1; i < b; i += 1) {
      const [px, py] = ring[i];
      let t = ((px - ax) * dx + (py - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px; const ey = ay + t * dy - py;
      const d2 = ex * ex + ey * ey;
      if (d2 > best) { best = d2; bi = i; }
    }
    if (best > t2) {
      keep[bi] = 1;
      stack.push([a, bi], [bi, b]);
    }
  }
  return ring.filter((_, i) => keep[i]);
}

const ringArea = (r) => {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i, i += 1) s += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]);
  return s / 2;
};

const f1 = (v) => {
  const r = Math.round(v * 10) / 10;
  return String(r).replace(/^(-?)0\./, '$1.');
};

// Anillos → ruta SVG con coordenadas relativas y un decimal.
export function ringsToPath(rings) {
  let out = '';
  for (const ring of rings) {
    if (ring.length < 3) continue;
    let [px, py] = ring[0];
    px = Math.round(px * 10) / 10; py = Math.round(py * 10) / 10;
    out += `M${f1(px)} ${f1(py)}`;
    for (let i = 1; i < ring.length; i += 1) {
      const x = Math.round(ring[i][0] * 10) / 10; const y = Math.round(ring[i][1] * 10) / 10;
      const dx = x - px; const dy = y - py;
      if (dx === 0 && dy === 0) continue;
      out += `l${f1(dx)} ${f1(dy)}`.replace(/ -/g, '-');
      px = x; py = y;
    }
    out += 'z';
  }
  return out;
}

// Distancia al borde (chaflán 3-4) dentro de una máscara; devuelve el máximo.
function poleOf(mask, w, h) {
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i += 1) d[i] = mask[i] ? 1e9 : 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 3); else v = Math.min(v, 3);
      if (y > 0) v = Math.min(v, d[i - w] + 3); else v = Math.min(v, 3);
      if (x > 0 && y > 0) v = Math.min(v, d[i - w - 1] + 4);
      if (x < w - 1 && y > 0) v = Math.min(v, d[i - w + 1] + 4);
      d[i] = v;
    }
  }
  let best = -1; let bi = 0;
  for (let y = h - 1; y >= 0; y -= 1) {
    for (let x = w - 1; x >= 0; x -= 1) {
      const i = y * w + x;
      if (!d[i]) continue;
      let v = d[i];
      if (x < w - 1) v = Math.min(v, d[i + 1] + 3); else v = Math.min(v, 3);
      if (y < h - 1) v = Math.min(v, d[i + w] + 3); else v = Math.min(v, 3);
      if (x < w - 1 && y < h - 1) v = Math.min(v, d[i + w + 1] + 4);
      if (x > 0 && y < h - 1) v = Math.min(v, d[i + w - 1] + 4);
      d[i] = v;
      if (v > best) { best = v; bi = i; }
    }
  }
  return [bi % w, Math.floor(bi / w), best / 3];
}

// Cajas de cada identificador en un búfer.
export function idBoxes(id, W, H) {
  const boxes = new Map();
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const v = id[y * W + x];
      if (!v) continue;
      const b = boxes.get(v);
      if (!b) boxes.set(v, [x, y, x, y, 1]);
      else {
        if (x < b[0]) b[0] = x; if (x > b[2]) b[2] = x;
        if (y < b[1]) b[1] = y; if (y > b[3]) b[3] = y;
        b[4] += 1;
      }
    }
  }
  return boxes;
}

// Contorno de un identificador. scale: factor de las coordenadas de salida
// (1/ss si el búfer está supersampleado). tol en píxeles del búfer.
export function traceId(id, W, H, value, box, { scale = 1, tol = 1.2, minArea = 4 } = {}) {
  const [bx0, by0, bx1, by1] = box;
  const w = bx1 - bx0 + 3; const h = by1 - by0 + 3;
  const vals = new Float64Array(w * h);
  const mask = new Uint8Array(w * h);
  for (let y = by0; y <= by1; y += 1) {
    for (let x = bx0; x <= bx1; x += 1) {
      if (id[y * W + x] === value) {
        const i = (y - by0 + 1) * w + (x - bx0 + 1);
        vals[i] = 1; mask[i] = 1;
      }
    }
  }
  const [mp] = contours().size([w, h]).thresholds([0.5])(vals);
  const rings = [];
  let area = 0;
  for (const poly of mp.coordinates) {
    poly.forEach((ring, ri) => {
      const a = Math.abs(ringArea(ring));
      if (a < minArea) return;
      if (ri === 0) area += a; else area -= a;
      const simple = simplifyRing(ring, tol).map(([x, y]) => [(x + bx0 - 1) * scale, (y + by0 - 1) * scale]);
      if (simple.length >= 3) rings.push(simple);
    });
  }
  const [px, py, r] = poleOf(mask, w, h);
  return {
    d: ringsToPath(rings),
    area: area * scale * scale,
    anchor: [Math.round((px + bx0 - 0.5) * scale * 10) / 10, Math.round((py + by0 - 0.5) * scale * 10) / 10],
    inner: Math.round(r * scale * 10) / 10,
    box: [bx0 * scale, by0 * scale, (bx1 + 1) * scale, (by1 + 1) * scale].map((v) => Math.round(v)),
  };
}
