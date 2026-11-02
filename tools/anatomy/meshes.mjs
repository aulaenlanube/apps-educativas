// Mallas de BodyParts3D (OBJ por elemento FJxxxx) y mallas procedurales
// (elipsoides y tubos) para lo que el modelo no trae: tiroides, cóccix,
// colon sigmoide, parótidas, nervios periféricos…
import fs from 'node:fs';
import path from 'node:path';

/* ───────── BodyParts3D ───────── */

// Índice concepto → elementos y nombre, de las dos jerarquías (IS-A y PART-OF).
export function loadIndex(dir) {
  const names = new Map();
  const elems = new Map();
  for (const f of ['isa_parts_list_e.txt', 'partof_parts_list_e.txt']) {
    for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      const p = line.split('\t');
      if (p.length >= 3 && /^(FMA|BP)/.test(p[0])) names.set(p[0], p[2].trim());
    }
  }
  for (const f of ['isa_element_parts.txt', 'partof_element_parts.txt']) {
    for (const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      const p = line.split('\t');
      if (p.length >= 3 && /^(FMA|BP)/.test(p[0])) {
        if (!elems.has(p[0])) elems.set(p[0], new Set());
        elems.get(p[0]).add(p[2].trim());
      }
    }
  }
  return { names, elems };
}

const objCache = new Map();

function findObj(dir, fj) {
  for (const sub of ['isa', 'partof']) {
    const p = path.join(dir, 'obj', sub, `${fj}.obj`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Malla de un elemento: { pos: Float32Array, idx: Uint32Array }.
export function loadElement(dir, fj) {
  if (objCache.has(fj)) return objCache.get(fj);
  const file = findObj(dir, fj);
  if (!file) {
    objCache.set(fj, null);
    return null;
  }
  const pos = [];
  const idx = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (line.startsWith('v ')) {
      const p = line.trim().split(/\s+/);
      pos.push(+p[1], +p[2], +p[3]);
    } else if (line.startsWith('f ')) {
      const p = line.trim().split(/\s+/).slice(1).map((s) => parseInt(s, 10) - 1);
      for (let i = 1; i + 1 < p.length; i += 1) idx.push(p[0], p[i], p[i + 1]);
    }
  }
  const m = { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
  objCache.set(fj, m);
  return m;
}

// Une varias mallas en una sola.
export function mergeMeshes(list) {
  const ok = list.filter(Boolean);
  let nv = 0; let ni = 0;
  for (const m of ok) { nv += m.pos.length; ni += m.idx.length; }
  const pos = new Float32Array(nv);
  const idx = new Uint32Array(ni);
  let ov = 0; let oi = 0;
  for (const m of ok) {
    pos.set(m.pos, ov);
    const base = ov / 3;
    for (let i = 0; i < m.idx.length; i += 1) idx[oi + i] = m.idx[i] + base;
    ov += m.pos.length; oi += m.idx.length;
  }
  return { pos, idx };
}

// Malla de uno o varios conceptos (FMA…), con o sin elementos excluidos.
export function conceptMesh(dir, index, concepts, { exclude = [] } = {}) {
  const skip = new Set();
  for (const c of exclude) for (const e of index.elems.get(c) || []) skip.add(e);
  const files = new Set();
  for (const c of concepts) {
    const set = index.elems.get(c);
    if (!set) throw new Error(`Concepto sin elementos: ${c}`);
    for (const e of set) if (!skip.has(e)) files.add(e);
  }
  return mergeMeshes([...files].map((f) => loadElement(dir, f)));
}

/* ───────── utilidades geométricas ───────── */

export function bbox(m) {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < m.pos.length; i += 3) {
    for (let k = 0; k < 3; k += 1) {
      if (m.pos[i + k] < b[k]) b[k] = m.pos[i + k];
      if (m.pos[i + k] > b[k + 3]) b[k + 3] = m.pos[i + k];
    }
  }
  return { min: b.slice(0, 3), max: b.slice(3), center: [0, 1, 2].map((k) => (b[k] + b[k + 3]) / 2), size: [0, 1, 2].map((k) => b[k + 3] - b[k]) };
}

// Vértice más extremo en una dirección (con filtro opcional).
export function extreme(m, dir, filter) {
  let best = -Infinity; let at = null;
  for (let i = 0; i < m.pos.length; i += 3) {
    const p = [m.pos[i], m.pos[i + 1], m.pos[i + 2]];
    if (filter && !filter(p)) continue;
    const v = p[0] * dir[0] + p[1] * dir[1] + p[2] * dir[2];
    if (v > best) { best = v; at = p; }
  }
  return at;
}

export function centroid(m, filter) {
  const s = [0, 0, 0]; let n = 0;
  for (let i = 0; i < m.pos.length; i += 3) {
    const p = [m.pos[i], m.pos[i + 1], m.pos[i + 2]];
    if (filter && !filter(p)) continue;
    s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n += 1;
  }
  return n ? s.map((v) => v / n) : null;
}

// Quita triángulos cuyo centro cumple `drop(p)`.
export function cutTriangles(m, drop) {
  const keep = [];
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3; const b = m.idx[t + 1] * 3; const c = m.idx[t + 2] * 3;
    const p = [0, 1, 2].map((k) => (m.pos[a + k] + m.pos[b + k] + m.pos[c + k]) / 3);
    if (!drop(p)) keep.push(m.idx[t], m.idx[t + 1], m.idx[t + 2]);
  }
  return { pos: m.pos, idx: new Uint32Array(keep) };
}

/* ───────── procedurales ───────── */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// Elipsoide de semiejes r = [rx, ry, rz] centrado en c (ejes del mundo,
// con giro opcional `rotZ` en radianes alrededor del eje vertical).
export function ellipsoid(c, r, { seg = 22, ring = 14, rotZ = 0, rotY = 0 } = {}) {
  const pos = []; const idx = [];
  const cz = Math.cos(rotZ); const sz = Math.sin(rotZ);
  const cy = Math.cos(rotY); const sy = Math.sin(rotY);
  for (let i = 0; i <= ring; i += 1) {
    const th = (i / ring) * Math.PI;
    for (let j = 0; j <= seg; j += 1) {
      const ph = (j / seg) * Math.PI * 2;
      let x = r[0] * Math.sin(th) * Math.cos(ph);
      let y = r[1] * Math.sin(th) * Math.sin(ph);
      let z = r[2] * Math.cos(th);
      [x, z] = [x * cy + z * sy, -x * sy + z * cy];
      [x, y] = [x * cz - y * sz, x * sz + y * cz];
      pos.push(c[0] + x, c[1] + y, c[2] + z);
    }
  }
  for (let i = 0; i < ring; i += 1) {
    for (let j = 0; j < seg; j += 1) {
      const a = i * (seg + 1) + j; const b = a + seg + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}

// Catmull-Rom por los puntos de control.
export function spline(points, steps = 10) {
  const out = [];
  const P = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < P.length - 2; i += 1) {
    for (let s = 0; s < steps; s += 1) {
      const t = s / steps; const t2 = t * t; const t3 = t2 * t;
      out.push([0, 1, 2].map((k) => 0.5 * ((2 * P[i][k]) + (-P[i - 1][k] + P[i + 1][k]) * t
        + (2 * P[i - 1][k] - 5 * P[i][k] + 4 * P[i + 1][k] - P[i + 2][k]) * t2
        + (-P[i - 1][k] + 3 * P[i][k] - 3 * P[i + 1][k] + P[i + 2][k]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

// Tubo a lo largo de una curva. radius: número o función (0..1) → radio.
export function tube(points, radius, { sides = 10, steps = 10, caps = true } = {}) {
  const path = points.length > 2 ? spline(points, steps) : points;
  const rad = typeof radius === 'function' ? radius : () => radius;
  const pos = []; const idx = [];
  let prevN = null;
  path.forEach((p, i) => {
    const t = norm(sub(path[Math.min(i + 1, path.length - 1)], path[Math.max(i - 1, 0)]));
    let n = prevN ? norm(sub(prevN, mul(t, prevN[0] * t[0] + prevN[1] * t[1] + prevN[2] * t[2]))) : null;
    if (!n || !Number.isFinite(n[0])) {
      const ref = Math.abs(t[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
      n = norm(cross(t, ref));
    }
    prevN = n;
    const b = cross(t, n);
    const r = rad(i / (path.length - 1));
    for (let s = 0; s < sides; s += 1) {
      const a = (s / sides) * Math.PI * 2;
      const off = add(mul(n, Math.cos(a) * r), mul(b, Math.sin(a) * r));
      pos.push(p[0] + off[0], p[1] + off[1], p[2] + off[2]);
    }
  });
  for (let i = 0; i < path.length - 1; i += 1) {
    for (let s = 0; s < sides; s += 1) {
      const a = i * sides + s; const b = i * sides + ((s + 1) % sides);
      idx.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  if (caps) {
    for (const [ci, flip] of [[0, true], [path.length - 1, false]]) {
      const c = pos.length / 3;
      pos.push(...path[ci]);
      for (let s = 0; s < sides; s += 1) {
        const a = ci * sides + s; const b = ci * sides + ((s + 1) % sides);
        if (flip) idx.push(c, b, a); else idx.push(c, a, b);
      }
    }
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}

export const vec = { sub, add, mul, cross, norm };

/* ───────── índice por nombre de pieza ───────── */

// Cada OBJ trae en la cabecera su concepto y su nombre en inglés. Se cachea en
// elements.json: [{ fj, c, n }].
export function loadElementNames(dir) {
  const cache = path.join(dir, 'elements.json');
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8'));
  const out = [];
  const objDir = path.join(dir, 'obj', 'isa');
  for (const f of fs.readdirSync(objDir)) {
    if (!f.endsWith('.obj')) continue;
    const head = fs.readFileSync(path.join(objDir, f), 'utf8').slice(0, 1200);
    const c = /Concept ID : (\S+)/.exec(head)?.[1] || '';
    const n = /English name : (.+)/.exec(head)?.[1]?.trim() || '';
    out.push({ fj: f.slice(0, -4), c, n });
  }
  fs.writeFileSync(cache, JSON.stringify(out));
  return out;
}

// Elementos cuyo nombre casa con alguna expresión (y con ninguna de `not`).
export function elementsMatching(names, include, not = []) {
  const inc = [].concat(include);
  return names.filter((e) => inc.some((r) => r.test(e.n)) && !not.some((r) => r.test(e.n))).map((e) => e.fj);
}

/* ───────── suavizado de una zona (maniquí) ───────── */

// Laplaciano con los vértices de fuera de la zona fijos: lo que sobresale se
// convierte en una superficie lisa que cierra el hueco.
export function smoothRegion(m, inRegion, iterations = 200) {
  const nv = m.pos.length / 3;
  const pos = new Float32Array(m.pos);
  const nb = Array.from({ length: nv }, () => new Set());
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t]; const b = m.idx[t + 1]; const c = m.idx[t + 2];
    nb[a].add(b); nb[a].add(c); nb[b].add(a); nb[b].add(c); nb[c].add(a); nb[c].add(b);
  }
  const region = [];
  for (let i = 0; i < nv; i += 1) if (inRegion([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]])) region.push(i);
  const lists = region.map((i) => [...nb[i]]);
  const next = new Float32Array(region.length * 3);
  for (let it = 0; it < iterations; it += 1) {
    region.forEach((i, r) => {
      const l = lists[r];
      if (!l.length) { next[r * 3] = pos[i * 3]; next[r * 3 + 1] = pos[i * 3 + 1]; next[r * 3 + 2] = pos[i * 3 + 2]; return; }
      let x = 0; let y = 0; let z = 0;
      for (const j of l) { x += pos[j * 3]; y += pos[j * 3 + 1]; z += pos[j * 3 + 2]; }
      const n = l.length;
      next[r * 3] = x / n; next[r * 3 + 1] = y / n; next[r * 3 + 2] = z / n;
    });
    region.forEach((i, r) => { pos[i * 3] = next[r * 3]; pos[i * 3 + 1] = next[r * 3 + 1]; pos[i * 3 + 2] = next[r * 3 + 2]; });
  }
  return { pos, idx: m.idx, smoothed: region.length };
}

// Copia de los triángulos de una malla que cumplen `keep(centroide, normal)`,
// desplazada `inset` mm hacia dentro (contra la normal). Sirve para fabricar
// láminas que siguen la forma de la piel (músculos que el modelo no trae).
export function surfacePatch(m, keep, inset = 4) {
  const nrm = new Float32Array(m.pos.length);
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3; const b = m.idx[t + 1] * 3; const c = m.idx[t + 2] * 3;
    const ux = m.pos[b] - m.pos[a]; const uy = m.pos[b + 1] - m.pos[a + 1]; const uz = m.pos[b + 2] - m.pos[a + 2];
    const vx = m.pos[c] - m.pos[a]; const vy = m.pos[c + 1] - m.pos[a + 1]; const vz = m.pos[c + 2] - m.pos[a + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    for (const v of [a, b, c]) { nrm[v] += n[0]; nrm[v + 1] += n[1]; nrm[v + 2] += n[2]; }
  }
  const map = new Map();
  const pos = []; const idx = [];
  const vert = (v) => {
    if (map.has(v)) return map.get(v);
    const o = v * 3;
    const l = Math.hypot(nrm[o], nrm[o + 1], nrm[o + 2]) || 1;
    pos.push(m.pos[o] - (nrm[o] / l) * inset, m.pos[o + 1] - (nrm[o + 1] / l) * inset, m.pos[o + 2] - (nrm[o + 2] / l) * inset);
    map.set(v, pos.length / 3 - 1);
    return map.get(v);
  };
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3; const b = m.idx[t + 1] * 3; const c = m.idx[t + 2] * 3;
    const cen = [0, 1, 2].map((k) => (m.pos[a + k] + m.pos[b + k] + m.pos[c + k]) / 3);
    const ux = m.pos[b] - m.pos[a]; const uy = m.pos[b + 1] - m.pos[a + 1]; const uz = m.pos[b + 2] - m.pos[a + 2];
    const vx = m.pos[c] - m.pos[a]; const vy = m.pos[c + 1] - m.pos[a + 1]; const vz = m.pos[c + 2] - m.pos[a + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const l = Math.hypot(...n) || 1;
    if (!keep(cen, [n[0] / l, n[1] / l, n[2] / l])) continue;
    idx.push(vert(m.idx[t]), vert(m.idx[t + 1]), vert(m.idx[t + 2]));
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}

// Divide una malla en dos por una condición sobre el centro de cada triángulo.
export function splitMesh(m, test) {
  const a = []; const b = [];
  for (let t = 0; t < m.idx.length; t += 3) {
    const i0 = m.idx[t] * 3; const i1 = m.idx[t + 1] * 3; const i2 = m.idx[t + 2] * 3;
    const cen = [0, 1, 2].map((k) => (m.pos[i0 + k] + m.pos[i1 + k] + m.pos[i2 + k]) / 3);
    (test(cen) ? a : b).push(m.idx[t], m.idx[t + 1], m.idx[t + 2]);
  }
  return [{ pos: m.pos, idx: new Uint32Array(a) }, { pos: m.pos, idx: new Uint32Array(b) }];
}

/* ───────── superficies desde un campo de vóxeles (surface nets) ───────── */

// field: Float32Array nx·ny·nz (x más rápido); iso: umbral; origin/step en mm.
// Devuelve una malla cerrada con las caras hacia fuera (de >iso a <iso).
export function surfaceNets(field, [nx, ny, nz], origin, step, iso = 0.5) {
  const at = (x, y, z) => field[x + nx * (y + ny * z)];
  const vid = new Int32Array(nx * ny * nz).fill(-1);
  const pos = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  for (let z = 0; z < nz - 1; z += 1) {
    for (let y = 0; y < ny - 1; y += 1) {
      for (let x = 0; x < nx - 1; x += 1) {
        const v = C.map(([a, b, c]) => at(x + a, y + b, z + c));
        let mask = 0;
        v.forEach((val, i) => { if (val > iso) mask |= 1 << i; });
        if (mask === 0 || mask === 255) continue;
        let sx = 0; let sy = 0; let sz = 0; let n = 0;
        for (const [a, b] of E) {
          if ((v[a] > iso) === (v[b] > iso)) continue;
          const t = (iso - v[a]) / (v[b] - v[a]);
          sx += C[a][0] + (C[b][0] - C[a][0]) * t;
          sy += C[a][1] + (C[b][1] - C[a][1]) * t;
          sz += C[a][2] + (C[b][2] - C[a][2]) * t;
          n += 1;
        }
        vid[x + nx * (y + ny * z)] = pos.length / 3;
        pos.push(origin[0] + (x + sx / n) * step, origin[1] + (y + sy / n) * step, origin[2] + (z + sz / n) * step);
      }
    }
  }
  const idx = [];
  const V = (x, y, z) => vid[x + nx * (y + ny * z)];
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  };
  for (let z = 1; z < nz - 1; z += 1) {
    for (let y = 1; y < ny - 1; y += 1) {
      for (let x = 1; x < nx - 1; x += 1) {
        const inside = at(x, y, z) > iso;
        if (x < nx - 1 && inside !== (at(x + 1, y, z) > iso)) quad(V(x, y - 1, z - 1), V(x, y, z - 1), V(x, y, z), V(x, y - 1, z), !inside);
        if (y < ny - 1 && inside !== (at(x, y + 1, z) > iso)) quad(V(x - 1, y, z - 1), V(x - 1, y, z), V(x, y, z), V(x, y, z - 1), !inside);
        if (z < nz - 1 && inside !== (at(x, y, z + 1) > iso)) quad(V(x - 1, y - 1, z), V(x, y - 1, z), V(x, y, z), V(x - 1, y, z), !inside);
      }
    }
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}

// Desenfoque de caja 3D separable (radio r vóxeles), en el sitio.
export function blur3(field, [nx, ny, nz], r = 1, passes = 2) {
  const tmp = new Float32Array(field.length);
  for (let p = 0; p < passes; p += 1) {
    // x
    for (let z = 0; z < nz; z += 1) for (let y = 0; y < ny; y += 1) {
      const o = nx * (y + ny * z);
      for (let x = 0; x < nx; x += 1) {
        let s = 0; let c = 0;
        for (let k = -r; k <= r; k += 1) { const X = x + k; if (X >= 0 && X < nx) { s += field[o + X]; c += 1; } }
        tmp[o + x] = s / c;
      }
    }
    // y
    for (let z = 0; z < nz; z += 1) for (let x = 0; x < nx; x += 1) {
      for (let y = 0; y < ny; y += 1) {
        let s = 0; let c = 0;
        for (let k = -r; k <= r; k += 1) { const Y = y + k; if (Y >= 0 && Y < ny) { s += tmp[x + nx * (Y + ny * z)]; c += 1; } }
        field[x + nx * (y + ny * z)] = s / c;
      }
    }
    // z
    for (let y = 0; y < ny; y += 1) for (let x = 0; x < nx; x += 1) {
      for (let z = 0; z < nz; z += 1) {
        let s = 0; let c = 0;
        for (let k = -r; k <= r; k += 1) { const Z = z + k; if (Z >= 0 && Z < nz) { s += field[x + nx * (y + ny * Z)]; c += 1; } }
        tmp[x + nx * (y + ny * z)] = s / c;
      }
    }
    field.set(tmp);
  }
  return field;
}

// Envolvente convexa 2D (cadena monótona).
export function hull2(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = []; const upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (let i = p.length - 1; i >= 0; i -= 1) { const q = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export function inHull(h, x, y, margin = 0) {
  if (h.length < 3) return false;
  for (let i = 0; i < h.length; i += 1) {
    const a = h[i]; const b = h[(i + 1) % h.length];
    const ex = b[0] - a[0]; const ey = b[1] - a[1];
    const l = Math.hypot(ex, ey) || 1;
    if ((ex * (y - a[1]) - ey * (x - a[0])) / l < -margin) return false;
  }
  return true;
}

// Se queda con las piezas conexas grandes (quita restos sueltos).
export function keepLargest(m, minFrac = 0.15) {
  const nv = m.pos.length / 3;
  const parent = new Int32Array(nv).map((_, i) => i);
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = find(m.idx[t]); const b = find(m.idx[t + 1]); const c = find(m.idx[t + 2]);
    parent[b] = a; parent[find(c)] = a;
  }
  const count = new Map();
  for (let t = 0; t < m.idx.length; t += 3) { const r = find(m.idx[t]); count.set(r, (count.get(r) || 0) + 1); }
  const max = Math.max(...count.values());
  const idx = [];
  for (let t = 0; t < m.idx.length; t += 3) if (count.get(find(m.idx[t])) >= max * minFrac) idx.push(m.idx[t], m.idx[t + 1], m.idx[t + 2]);
  return { pos: m.pos, idx: new Uint32Array(idx) };
}

// Volumen con signo (positivo si las caras miran hacia fuera).
export function signedVolume(m) {
  let v = 0;
  for (let t = 0; t < m.idx.length; t += 3) {
    const a = m.idx[t] * 3; const b = m.idx[t + 1] * 3; const c = m.idx[t + 2] * 3;
    v += m.pos[a] * (m.pos[b + 1] * m.pos[c + 2] - m.pos[b + 2] * m.pos[c + 1])
      - m.pos[a + 1] * (m.pos[b] * m.pos[c + 2] - m.pos[b + 2] * m.pos[c])
      + m.pos[a + 2] * (m.pos[b] * m.pos[c + 1] - m.pos[b + 1] * m.pos[c]);
  }
  return v / 6;
}
