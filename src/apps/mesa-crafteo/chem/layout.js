// src/apps/mesa-crafteo/chem/layout.js
// Geometría 3D de la molécula con un modelo VSEPR "de juguete" (puro, sin three):
//  · cada átomo tiene dominios electrónicos = enlaces σ + huecos libres + pares
//    solitarios; los dominios se repelen sobre una esfera (problema de Thomson),
//    los pares solitarios un poco más → 104,5° del agua, 107° del NH₃…
//  · muelles de enlace (más cortos en dobles y triples), repulsión entre átomos
//    no enlazados y una torsión que mantiene planos los dobles enlaces.
// El cálculo es incremental: parte de las posiciones anteriores, así los
// átomos se deslizan a su sitio en vez de saltar.
//
// layout = { pos: { id: [x,y,z] }, dom: { id: { slots: [[x,y,z]], lps: [[x,y,z]] } } }

import { tokenInfo } from './elements';
import { atomStatus } from './graph';

// ───────── vectores ─────────
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const vec = { add, sub, mul, dot, cross, len, norm };

// Rotación de v alrededor del eje unitario k un ángulo t (Rodrigues).
function rotate(v, k, t) {
  const c = Math.cos(t); const s = Math.sin(t);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}
// Rotación mínima que lleva el unitario a al unitario b, aplicada a v.
function rotateFromTo(v, a, b) {
  const d = dot(a, b);
  if (d > 0.99999) return v;
  if (d < -0.99999) {
    const axis = norm(Math.abs(a[0]) < 0.9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0]));
    return rotate(v, axis, Math.PI);
  }
  return rotate(v, norm(cross(a, b)), Math.acos(d));
}

// ───────── plantillas de dominios ─────────
const TH = Math.acos(1 / Math.sqrt(3)); // 54,74°: semiángulo del tetraedro
const S3 = Math.sqrt(3) / 2;
export const TEMPLATES = {
  1: [[1, 0, 0]],
  2: [[1, 0, 0], [-1, 0, 0]],
  3: [[0, -1, 0], [S3, 0.5, 0], [-S3, 0.5, 0]],
  4: [
    [Math.sin(TH), -Math.cos(TH), 0], [-Math.sin(TH), -Math.cos(TH), 0],
    [0, Math.cos(TH), Math.sin(TH)], [0, Math.cos(TH), -Math.sin(TH)],
  ],
  5: [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-0.5, 0, S3], [-0.5, 0, -S3]],
  6: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
};

// Direcciones libres de un átomo con `total` dominios, sabiendo las de los
// vecinos ya colocados. score(dir) opcional decide el giro cuando hay un solo
// vecino (se prueban 12 giros y gana el de mayor puntuación).
export function freeDirections(existing, total, score) {
  const n = Math.min(6, Math.max(1, total));
  const T = TEMPLATES[n];
  const k = existing.length;
  if (k >= n) return [];
  if (k === 0) return T.map((d) => [...d]);
  const e0 = norm(existing[0]);
  let R = T.map((d) => rotateFromTo(d, T[0], e0));
  if (k === 1) {
    if (score && n > 2) {
      let best = R; let bestS = -Infinity;
      for (let i = 0; i < 12; i++) {
        const t = (i / 12) * Math.PI * 2;
        const cand = R.map((d, j) => (j === 0 ? d : rotate(d, e0, t)));
        const s = cand.slice(1).reduce((acc, d) => Math.min(acc, score(d)), Infinity);
        if (s > bestS + 1e-6) { bestS = s; best = cand; }
      }
      R = best;
    }
    return R.slice(1);
  }
  // Giro alrededor de e0 para que la plantilla más cercana coincida con el 2º vecino.
  const e1 = norm(existing[1]);
  const proj = (v) => norm(sub(v, mul(e0, dot(v, e0))));
  let bestJ = 1; let bestD = -Infinity;
  for (let j = 1; j < n; j++) {
    const d = Math.abs(dot(R[j], e0) - dot(e1, e0)) < 0.35 ? dot(proj(R[j]), proj(e1)) : -2;
    if (d > bestD) { bestD = d; bestJ = j; }
  }
  const a = proj(R[bestJ]); const b = proj(e1);
  const ang = Math.atan2(dot(cross(a, b), e0), dot(a, b));
  R = R.map((d) => rotate(d, e0, ang));
  // Empareja vecinos con plantillas (voraz) y devuelve las sobrantes.
  const used = new Set();
  for (const e of existing) {
    const u = norm(e);
    let bj = -1; let bd = -Infinity;
    R.forEach((d, j) => { if (!used.has(j) && dot(d, u) > bd) { bd = dot(d, u); bj = j; } });
    used.add(bj);
  }
  return R.filter((_, j) => !used.has(j));
}

// ───────── distancias ─────────
const ORDER_SHRINK = { 1: 1, 2: 0.88, 3: 0.8 };
export function bondLength(tokA, tokB, order = 1) {
  const ra = tokenInfo(tokA).radius; const rb = tokenInfo(tokB).radius;
  return (0.5 + 0.95 * (ra + rb)) * (ORDER_SHRINK[order] || 1);
}

// ───────── utilidades de grafo ─────────
function buildIndex(model) {
  const ids = model.atoms.map((a) => a.id);
  const idx = new Map(ids.map((id, i) => [id, i]));
  const nb = ids.map(() => []);
  model.bonds.forEach((b) => {
    const i = idx.get(b.a); const j = idx.get(b.b);
    nb[i].push({ j, order: b.order }); nb[j].push({ j: i, order: b.order });
  });
  return { ids, idx, nb };
}

// Primer ciclo del grafo (lista de índices en orden) o null.
function findCycle(nb) {
  const n = nb.length;
  const parent = new Array(n).fill(-1);
  const state = new Array(n).fill(0);
  for (let s = 0; s < n; s++) {
    if (state[s]) continue;
    const stack = [[s, -1]];
    while (stack.length) {
      const [v, p] = stack.pop();
      if (state[v]) continue;
      state[v] = 1; parent[v] = p;
      for (const { j } of nb[v]) {
        if (j === p) continue;
        if (state[j]) {
          // ciclo v → … → j: sube por los padres de v hasta j
          const path = [v];
          let c = parent[v];
          while (c !== -1 && c !== j) { path.push(c); c = parent[c]; }
          if (c === j) { path.push(j); if (path.length >= 3) return path; }
        } else stack.push([j, v]);
      }
    }
  }
  return null;
}

// Dominios de cada átomo: { sigma, free, lp }
function domainCounts(model, ids) {
  return ids.map((id) => {
    const st = atomStatus(model, id);
    const total = Math.min(6, st.sigma + st.free + st.lonePairs);
    const free = Math.min(st.free, total - st.sigma);
    return { sigma: st.sigma, free, lp: Math.max(0, total - st.sigma - free) };
  });
}

// ───────── relajación ─────────
const W_LP = 1.32;
const W_SLOT = 0.92;

function relax(model, ctx, iters) {
  const { nb, P, D, counts } = ctx;
  const n = P.length;
  const toks = model.atoms.map((a) => a.tok);
  const near13 = nb.map((list) => new Set(list.map((x) => x.j)));
  // vecinos a distancia 2 (1-3)
  const two = nb.map((list, i) => {
    const s = new Set();
    list.forEach(({ j }) => nb[j].forEach(({ j: k }) => { if (k !== i) s.add(k); }));
    return s;
  });
  // Regla de Drago: en los hidruros del 3er periodo en adelante (H₂S, PH₃) los
  // pares solitarios cierran mucho más el ángulo (≈ 92-93°).
  const wLp = nb.map((list, a) => {
    const z = tokenInfo(toks[a]).z;
    return z > 10 && list.length && list.every(({ j }) => toks[j] === 'H') ? 2.1 : W_LP;
  });
  const L = model.bonds.map((b) => bondLength(toks[ctx.idx.get(b.a)], toks[ctx.idx.get(b.b)], b.order));

  for (let it = 0; it < iters; it++) {
    const F = P.map(() => [0, 0, 0]);
    // muelles de enlace
    model.bonds.forEach((b, bi) => {
      const i = ctx.idx.get(b.a); const j = ctx.idx.get(b.b);
      const d = sub(P[j], P[i]); const l = len(d) || 1e-6;
      const f = mul(d, (0.5 * (l - L[bi])) / l);
      F[i] = add(F[i], f); F[j] = sub(F[j], f);
    });
    // repulsión de dominios en cada átomo
    for (let a = 0; a < n; a++) {
      const doms = [];
      nb[a].forEach(({ j, order }) => {
        const d = sub(P[j], P[a]); const l = len(d) || 1e-6;
        doms.push({ u: mul(d, 1 / l), w: order > 1 ? 1.15 : 1, atom: j, l });
      });
      D[a].forEach((u, k) => doms.push({ u, w: k < counts[a].free ? W_SLOT : wLp[a], pseudo: k }));
      if (doms.length < 2) continue;
      for (let p = 0; p < doms.length; p++) {
        let f = [0, 0, 0];
        for (let q = 0; q < doms.length; q++) {
          if (p === q) continue;
          const d = sub(doms[p].u, doms[q].u);
          const l = Math.max(len(d), 0.08);
          f = add(f, mul(d, (doms[p].w * doms[q].w) / (l * l * l)));
        }
        const u = doms[p].u;
        f = sub(f, mul(u, dot(f, u))); // tangente
        if (doms[p].pseudo != null) {
          D[a][doms[p].pseudo] = norm(add(u, mul(f, 0.06)));
        } else {
          const disp = mul(f, 0.06 * doms[p].l);
          F[doms[p].atom] = add(F[doms[p].atom], disp);
          F[a] = sub(F[a], mul(disp, 0.5));
        }
      }
    }
    // repulsión entre átomos no enlazados
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (near13[i].has(j)) continue;
        const is13 = two[i].has(j);
        const R = is13 ? 0.95 : 1.55;
        const d = sub(P[j], P[i]); const l = len(d);
        if (l >= R) continue;
        const dir = l < 1e-6 ? norm([Math.sin(i + 1), Math.cos(j + 1), 0.3]) : mul(d, 1 / l);
        const f = mul(dir, 0.25 * (R - l));
        F[i] = sub(F[i], f); F[j] = add(F[j], f);
      }
    }
    // torsión: dobles enlaces planos
    model.bonds.forEach((b) => {
      if (b.order !== 2) return;
      const i = ctx.idx.get(b.a); const j = ctx.idx.get(b.b);
      const axis = norm(sub(P[j], P[i]));
      const otherDir = (a, skip) => {
        const o = nb[a].find((x) => x.j !== skip);
        if (o) return sub(P[o.j], P[a]);
        return D[a][0] || null;
      };
      const ra = otherDir(i, j); const rb = otherDir(j, i);
      if (!ra || !rb) return;
      const pa = sub(ra, mul(axis, dot(ra, axis))); const pb = sub(rb, mul(axis, dot(rb, axis)));
      if (len(pa) < 1e-3 || len(pb) < 1e-3) return;
      const phi = Math.atan2(dot(cross(pa, pb), axis), dot(pa, pb));
      const delta = phi - Math.round(phi / Math.PI) * Math.PI;
      if (Math.abs(delta) < 1e-3) return;
      const t = -delta * 0.12;
      nb[j].forEach(({ j: k }) => {
        if (k === i) return;
        const r = sub(P[k], P[j]);
        F[k] = add(F[k], sub(rotate(r, axis, t), r));
      });
      D[j] = D[j].map((u) => rotate(u, axis, t));
    });
    // integración (con tope de desplazamiento)
    for (let i = 0; i < n; i++) {
      const l = len(F[i]);
      const m = l > 0.25 ? 0.25 / l : 1;
      P[i] = add(P[i], mul(F[i], m));
    }
  }
}

// Orientación agradable para mostrar: eje mayor en X, el más corto hacia la cámara (Z).
function principalAxes(P) {
  const n = P.length;
  const c = P.reduce((s, p) => add(s, p), [0, 0, 0]).map((v) => v / n);
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  P.forEach((p) => {
    const d = sub(p, c);
    for (let r = 0; r < 3; r++) for (let s = 0; s < 3; s++) C[r][s] += d[r] * d[s];
  });
  // Jacobi 3x3
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const A = C.map((r) => [...r]);
  for (let sweep = 0; sweep < 12; sweep++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(A[p][q]) < 1e-10) continue;
      const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]);
      const cs = Math.cos(th); const sn = Math.sin(th);
      for (let k = 0; k < 3; k++) {
        const akp = A[k][p]; const akq = A[k][q];
        A[k][p] = cs * akp - sn * akq; A[k][q] = sn * akp + cs * akq;
      }
      for (let k = 0; k < 3; k++) {
        const apk = A[p][k]; const aqk = A[q][k];
        A[p][k] = cs * apk - sn * aqk; A[q][k] = sn * apk + cs * aqk;
      }
      for (let k = 0; k < 3; k++) {
        const vkp = V[k][p]; const vkq = V[k][q];
        V[k][p] = cs * vkp - sn * vkq; V[k][q] = sn * vkp + cs * vkq;
      }
    }
  }
  const eig = [0, 1, 2].map((i) => ({ val: A[i][i], vec: [V[0][i], V[1][i], V[2][i]] }));
  eig.sort((x, y) => y.val - x.val);
  return { center: c, axes: eig.map((e) => e.vec) };
}

function orientForDisplay(ctx) {
  const { P, D } = ctx;
  if (P.length < 2) return;
  const { center, axes } = principalAxes(P);
  let [ex, ey] = axes;
  ex = norm(ex); ey = norm(sub(ey, mul(ex, dot(ey, ex))));
  const ez = cross(ex, ey);
  const tf = (v) => [dot(v, ex), dot(v, ey), dot(v, ez)];
  for (let i = 0; i < P.length; i++) {
    P[i] = tf(sub(P[i], center));
    D[i] = D[i].map(tf);
  }
}

/**
 * Calcula la geometría.
 *  prev: layout anterior (o null) · opts.hint: { id, dir } posición inicial
 *  sugerida para un átomo nuevo (el hueco donde se soltó) · opts.fresh: recalcular
 *  desde cero (anillos, soluciones, vista de exposición) · opts.iters.
 */
export function computeLayout(model, prev = null, opts = {}) {
  const { ids, idx, nb } = buildIndex(model);
  const n = ids.length;
  const out = { pos: {}, dom: {} };
  if (!n) return out;
  const counts = domainCounts(model, ids);
  const toks = model.atoms.map((a) => a.tok);
  const fresh = opts.fresh || !prev || !ids.some((id) => prev.pos[id]);

  const P = new Array(n).fill(null);
  if (!fresh) ids.forEach((id, i) => { if (prev.pos[id]) P[i] = [...prev.pos[id]]; });

  if (fresh) {
    const cyc = findCycle(nb);
    if (cyc) {
      const m = cyc.length;
      const bl = bondLength(toks[cyc[0]], toks[cyc[1]], 1);
      const R = bl / (2 * Math.sin(Math.PI / m));
      // anillos de átomos tetraédricos: zigzag para que se plieguen en silla
      const pucker = cyc.every((v) => counts[v].sigma + counts[v].free + counts[v].lp >= 4) ? 0.32 : 0;
      cyc.forEach((v, k) => {
        const t = (2 * Math.PI * k) / m + Math.PI / 2;
        P[v] = [R * Math.cos(t), R * Math.sin(t), k % 2 ? pucker : -pucker];
      });
    } else {
      // raíz: el átomo con más vecinos (el "central")
      let root = 0;
      nb.forEach((l, i) => { if (l.length > nb[root].length) root = i; });
      P[root] = [0, 0, 0];
    }
  }

  // Coloca los átomos que faltan, en anchura desde los ya colocados.
  const placedDirs = (i) => nb[i].filter(({ j }) => P[j]).map(({ j }) => sub(P[j], P[i]));
  let guard = 0;
  while (P.some((p) => !p) && guard++ < n + 2) {
    const queue = [];
    for (let i = 0; i < n; i++) if (P[i]) queue.push(i);
    let progressed = false;
    while (queue.length) {
      const i = queue.shift();
      const pending = nb[i].filter(({ j }) => !P[j]);
      if (!pending.length) continue;
      for (const { j, order } of pending) {
        let dir = null;
        if (opts.hint && opts.hint.id === ids[j] && opts.hint.dir) dir = norm(opts.hint.dir);
        if (!dir) {
          const total = counts[i].sigma + counts[i].free + counts[i].lp;
          const score = (d) => {
            const tip = add(P[i], mul(d, 1.2));
            let mind = Infinity;
            P.forEach((p, k) => { if (p && k !== i) mind = Math.min(mind, len(sub(p, tip))); });
            return mind;
          };
          const prevSlots = !fresh && prev.dom[ids[i]] ? prev.dom[ids[i]].slots : null;
          const cands = prevSlots && prevSlots.length ? prevSlots : freeDirections(placedDirs(i), total, score);
          dir = cands.reduce((best, d) => (score(d) > score(best) ? d : best), cands[0] || [0, -1, 0]);
        }
        P[j] = add(P[i], mul(norm(dir), bondLength(toks[i], toks[j], order)));
        queue.push(j);
        progressed = true;
      }
    }
    if (!progressed) {
      // átomo suelto (no debería pasar): lo dejamos al lado
      const k = P.findIndex((p) => !p);
      P[k] = [k * 0.9, 0, 0];
    }
  }

  // Direcciones de huecos y pares solitarios.
  const D = ids.map((id, i) => {
    const need = counts[i].free + counts[i].lp;
    const old = !fresh && prev.dom[id];
    const oldAll = old ? [...old.slots, ...old.lps] : null;
    if (oldAll && oldAll.length === need && old.slots.length === counts[i].free && old.sigma === counts[i].sigma) {
      return oldAll.map((d) => [...d]);
    }
    const total = counts[i].sigma + need;
    const dirs = freeDirections(placedDirs(i), total);
    // los huecos hacia donde haya más espacio; los pares solitarios, el resto
    const space = (d) => {
      const tip = add(P[i], mul(d, 1.2));
      let mind = Infinity;
      P.forEach((p, k) => { if (k !== i) mind = Math.min(mind, len(sub(p, tip))); });
      return mind;
    };
    return dirs.slice(0, need).sort((x, y) => space(y) - space(x));
  });

  const ctx = { nb, idx, P, D, counts };
  relax(model, ctx, opts.iters ?? (fresh ? 500 : 160));
  if (opts.display) orientForDisplay(ctx);

  // centrar
  const c = P.reduce((s, p) => add(s, p), [0, 0, 0]).map((v) => v / n);
  ids.forEach((id, i) => {
    out.pos[id] = sub(P[i], c);
    out.dom[id] = { slots: D[i].slice(0, counts[i].free), lps: D[i].slice(counts[i].free), sigma: counts[i].sigma };
  });
  return out;
}

// Hueco preferido de un átomo para el siguiente enlace: el que tiene más
// espacio alrededor y queda más en el plano de la pantalla.
export function bestSlot(layout, atomId) {
  const dom = layout.dom[atomId];
  const p = layout.pos[atomId];
  if (!dom || !p || !dom.slots.length) return null;
  let best = null; let bestS = -Infinity;
  dom.slots.forEach((d, k) => {
    const tip = add(p, mul(d, 1.2));
    let mind = Infinity;
    Object.entries(layout.pos).forEach(([id, q]) => { if (+id !== atomId) mind = Math.min(mind, len(sub(q, tip))); });
    // a igualdad de espacio, mejor en el plano de la pantalla (ni tapado ni tapando)
    const s = Math.min(mind, 3) - Math.abs(d[2]) * 0.6 + d[0] * 0.04;
    if (s > bestS) { bestS = s; best = k; }
  });
  return best;
}

// Ángulo (grados) entre dos vecinos de un átomo.
export function bondAngle(layout, center, a, b) {
  const p = layout.pos[center];
  const u = norm(sub(layout.pos[a], p)); const v = norm(sub(layout.pos[b], p));
  return (Math.acos(Math.max(-1, Math.min(1, dot(u, v)))) * 180) / Math.PI;
}

// Radio de la molécula (para encuadrar la cámara).
export function layoutRadius(layout) {
  let r = 0;
  Object.values(layout.pos).forEach((p) => { r = Math.max(r, len(p)); });
  return r;
}
