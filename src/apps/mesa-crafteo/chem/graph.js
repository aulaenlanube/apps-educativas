// src/apps/mesa-crafteo/chem/graph.js
// Modelo de la molécula que se construye en la mesa (puro, sin React ni 3D).
//   model = { atoms: [{ id, tok }], bonds: [{ a, b, order }], nextId }
// Todas las operaciones devuelven un modelo NUEVO (inmutables → deshacer fácil).

import { tokenInfo, maxValence, targetValence, lonePairs } from './elements';

export const emptyModel = () => ({ atoms: [], bonds: [], nextId: 1 });

export const bondSumOf = (model, id) => model.bonds.reduce(
  (s, b) => (b.a === id || b.b === id ? s + b.order : s), 0,
);

export const neighborsOf = (model, id) => model.bonds
  .filter((b) => b.a === id || b.b === id)
  .map((b) => (b.a === id ? b.b : b.a));

export const findBond = (model, a, b) => model.bonds.find(
  (x) => (x.a === a && x.b === b) || (x.a === b && x.b === a),
);

export const atomById = (model, id) => model.atoms.find((a) => a.id === id);

// Estado de valencia de un átomo: enlaces, huecos libres, pares solitarios.
export function atomStatus(model, id) {
  const atom = atomById(model, id);
  if (!atom) return null;
  const sum = bondSumOf(model, id);
  const info = tokenInfo(atom.tok);
  const target = targetValence(atom.tok, sum);
  const max = maxValence(atom.tok);
  return {
    id,
    tok: atom.tok,
    bondSum: sum,
    target,
    free: Math.max(0, target - sum),
    canExpand: sum >= target && sum < max, // S/P: aún admite octeto expandido
    room: max - sum,                       // enlaces que todavía caben
    lonePairs: lonePairs(atom.tok, sum),
    ok: info.valences.includes(sum),
    sigma: neighborsOf(model, id).length,
  };
}

// ¿Todos los átomos tienen una valencia válida? (molécula "cerrada")
export function isSaturated(model) {
  return model.atoms.length > 0 && model.atoms.every((a) => atomStatus(model, a.id).ok);
}

export const totalCharge = (model) => model.atoms.reduce((s, a) => s + tokenInfo(a.tok).charge, 0);

// Modelo a partir de una receta del catálogo (ids 1..n).
export const modelFromMolecule = (mol) => ({
  atoms: mol.atoms.map((tok, i) => ({ id: i + 1, tok })),
  bonds: mol.bonds.map(([a, b, order = 1]) => ({ a: a + 1, b: b + 1, order })),
  nextId: mol.atoms.length + 1,
});

// ───────── Operaciones ─────────

// Coloca el primer átomo o une uno nuevo a parentId con un enlace sencillo.
// Devuelve { model, id } o null si no cabe.
export function addAtom(model, tok, parentId = null) {
  if (!tokenInfo(tok)) return null;
  const id = model.nextId;
  if (parentId == null) {
    if (model.atoms.length) return null; // solo puede haber una molécula
    return { model: { ...model, atoms: [{ id, tok }], nextId: id + 1 }, id };
  }
  const st = atomStatus(model, parentId);
  if (!st || st.room < 1) return null;
  return {
    model: {
      atoms: [...model.atoms, { id, tok }],
      bonds: [...model.bonds, { a: parentId, b: id, order: 1 }],
      nextId: id + 1,
    },
    id,
  };
}

// Enlace nuevo entre dos átomos ya colocados (cerrar anillos).
export function linkAtoms(model, a, b) {
  if (a === b || findBond(model, a, b)) return null;
  const sa = atomStatus(model, a); const sb = atomStatus(model, b);
  if (!sa || !sb || sa.room < 1 || sb.room < 1) return null;
  return { ...model, bonds: [...model.bonds, { a, b, order: 1 }] };
}

// Toca un enlace: sube el orden (1→2→3) si los dos átomos lo admiten; si no, vuelve a 1.
export function cycleBond(model, a, b) {
  const bond = findBond(model, a, b);
  if (!bond) return null;
  const sa = atomStatus(model, a); const sb = atomStatus(model, b);
  const canUp = bond.order < 3 && sa.room >= 1 && sb.room >= 1;
  const order = canUp ? bond.order + 1 : 1;
  if (order === bond.order) return null;
  return { ...model, bonds: model.bonds.map((x) => (x === bond ? { ...x, order } : x)) };
}

// Componentes conexas (listas de ids).
export function components(model) {
  const seen = new Set();
  const out = [];
  for (const a of model.atoms) {
    if (seen.has(a.id)) continue;
    const comp = [];
    const stack = [a.id];
    seen.add(a.id);
    while (stack.length) {
      const c = stack.pop();
      comp.push(c);
      for (const n of neighborsOf(model, c)) if (!seen.has(n)) { seen.add(n); stack.push(n); }
    }
    out.push(comp);
  }
  return out;
}

// Quita un átomo. Si la molécula se parte, se queda el trozo más grande
// (a igualdad, el que contiene el átomo más antiguo).
export function removeAtom(model, id) {
  if (!atomById(model, id)) return null;
  let next = {
    ...model,
    atoms: model.atoms.filter((a) => a.id !== id),
    bonds: model.bonds.filter((b) => b.a !== id && b.b !== id),
  };
  const comps = components(next);
  if (comps.length > 1) {
    comps.sort((x, y) => (y.length - x.length) || (Math.min(...x) - Math.min(...y)));
    const keep = new Set(comps[0]);
    next = {
      ...next,
      atoms: next.atoms.filter((a) => keep.has(a.id)),
      bonds: next.bonds.filter((b) => keep.has(b.a) && keep.has(b.b)),
    };
  }
  return next;
}

// ¿Dónde se une el siguiente átomo? El seleccionado si tiene sitio; si no, el
// colocado más reciente que tenga huecos libres; si no, uno que admita
// octeto expandido.
export function attachTarget(model, selectedId) {
  if (!model.atoms.length) return null;
  if (selectedId != null) {
    const st = atomStatus(model, selectedId);
    if (st && st.free > 0) return selectedId;
  }
  const byRecent = [...model.atoms].sort((x, y) => y.id - x.id);
  const free = byRecent.find((a) => atomStatus(model, a.id).free > 0);
  if (free) return free.id;
  if (selectedId != null && atomStatus(model, selectedId)?.room > 0) return selectedId;
  return null;
}

// ───────── Fórmula ─────────

// Cuenta de tokens { 'C': 2, 'H': 6, 'O-': 1 }
export function tokenCounts(tokens) {
  const c = {};
  for (const t of tokens) c[t] = (c[t] || 0) + 1;
  return c;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const toSub = (n) => String(n).split('').map((d) => SUB[+d]).join('');
const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const toSup = (n) => String(n).split('').map((d) => SUPD[+d]).join('');

// Fórmula empírica en orden de Hill (C, H y el resto alfabético) con carga.
export function hillFormula(tokens) {
  const counts = {};
  let charge = 0;
  for (const t of tokens) {
    const info = tokenInfo(t);
    counts[info.el] = (counts[info.el] || 0) + 1;
    charge += info.charge;
  }
  const els = Object.keys(counts);
  const order = counts.C
    ? ['C', ...(counts.H ? ['H'] : []), ...els.filter((e) => e !== 'C' && e !== 'H').sort()]
    : els.sort();
  let f = order.map((e) => e + (counts[e] > 1 ? toSub(counts[e]) : '')).join('');
  if (charge) f += (Math.abs(charge) > 1 ? toSup(Math.abs(charge)) : '') + (charge > 0 ? '⁺' : '⁻');
  return f;
}

// Cuenta por ELEMENTO (sin carga) para el contador de la misión.
export function elementCounts(tokens) {
  const c = {};
  for (const t of tokens) { const el = tokenInfo(t).el; c[el] = (c[el] || 0) + 1; }
  return c;
}

// ───────── Isomorfismo ─────────

// Grafo normalizado: { labels: [tok], adj: [[{ n, order }]] }
export function toGraph(model) {
  const index = new Map(model.atoms.map((a, i) => [a.id, i]));
  const adj = model.atoms.map(() => []);
  for (const b of model.bonds) {
    const i = index.get(b.a); const j = index.get(b.b);
    adj[i].push({ n: j, order: b.order });
    adj[j].push({ n: i, order: b.order });
  }
  return { labels: model.atoms.map((a) => a.tok), adj };
}

export function recipeGraph(mol) {
  const adj = mol.atoms.map(() => []);
  for (const [i, j, order = 1] of mol.bonds) {
    adj[i].push({ n: j, order });
    adj[j].push({ n: i, order });
  }
  return { labels: [...mol.atoms], adj };
}

// Refinamiento de colores (Weisfeiler-Lehman) con diccionario compartido para
// que los colores de los dos grafos sean comparables.
function refine(g1, g2, ignoreOrder) {
  const dict = new Map();
  const key = (s) => { if (!dict.has(s)) dict.set(s, dict.size); return dict.get(s); };
  let c1 = g1.labels.map((l) => key(`L${l}`));
  let c2 = g2.labels.map((l) => key(`L${l}`));
  for (let it = 0; it < Math.max(g1.labels.length, 1); it++) {
    const step = (g, c) => g.adj.map((ns, i) => key(`${c[i]}|${ns.map((x) => `${ignoreOrder ? 1 : x.order}:${c[x.n]}`).sort().join(',')}`));
    const n1 = step(g1, c1); const n2 = step(g2, c2);
    const same = new Set(n1).size === new Set(c1).size && new Set(n2).size === new Set(c2).size;
    c1 = n1; c2 = n2;
    if (same) break;
  }
  return [c1, c2];
}

const sameMultiset = (a, b) => {
  if (a.length !== b.length) return false;
  const x = [...a].sort((p, q) => p - q); const y = [...b].sort((p, q) => p - q);
  return x.every((v, i) => v === y[i]);
};

// Isomorfismo exacto (colores WL para podar + vuelta atrás). Moléculas de ≤ 30 átomos.
export function isomorphic(g1, g2, { ignoreOrder = false } = {}) {
  const n = g1.labels.length;
  if (n !== g2.labels.length) return false;
  const e1 = g1.adj.reduce((s, x) => s + x.length, 0);
  const e2 = g2.adj.reduce((s, x) => s + x.length, 0);
  if (e1 !== e2) return false;
  if (n === 0) return true;
  const [c1, c2] = refine(g1, g2, ignoreOrder);
  if (!sameMultiset(c1, c2)) return false;

  const bondOrder = (g, i, j) => g.adj[i].find((x) => x.n === j)?.order || 0;
  const map = new Array(n).fill(-1);
  const used = new Array(n).fill(false);
  // Orden de visita: BFS para que cada nodo tenga vecinos ya asignados.
  const order = [];
  const seen = new Array(n).fill(false);
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    const q = [s]; seen[s] = true;
    while (q.length) {
      const v = q.shift(); order.push(v);
      for (const { n: w } of g1.adj[v]) if (!seen[w]) { seen[w] = true; q.push(w); }
    }
  }
  const ok = (v, w) => {
    if (c1[v] !== c2[w]) return false;
    for (const { n: u, order: o } of g1.adj[v]) {
      if (map[u] === -1) continue;
      const o2 = bondOrder(g2, w, map[u]);
      if (!o2 || (!ignoreOrder && o2 !== o)) return false;
    }
    return true;
  };
  const solve = (k) => {
    if (k === n) return true;
    const v = order[k];
    for (let w = 0; w < n; w++) {
      if (used[w] || !ok(v, w)) continue;
      map[v] = w; used[w] = true;
      if (solve(k + 1)) return true;
      map[v] = -1; used[w] = false;
    }
    return false;
  };
  return solve(0);
}

export const matchesMolecule = (model, mol) => isomorphic(toGraph(model), recipeGraph(mol));

// Molécula del catálogo que coincide con lo construido (o null).
export function identify(model, catalog) {
  if (!isSaturated(model)) return null;
  const toks = model.atoms.map((a) => a.tok);
  const f = hillFormula(toks);
  const g = toGraph(model);
  return catalog.find((m) => hillFormula(m.atoms) === f && isomorphic(g, recipeGraph(m))) || null;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Explica por qué lo construido NO es el objetivo (o qué falta).
//   { kind: 'ok' | 'incomplete' | 'counts' | 'isomer' | 'bond-order' | 'other-molecule', text, other? }
export function diagnose(model, target, catalog = []) {
  if (!model.atoms.length) return { kind: 'incomplete', text: 'La mesa está vacía: coloca el primer átomo.' };
  if (matchesMolecule(model, target)) return { kind: 'ok', text: '¡Molécula correcta!' };

  const have = tokenCounts(model.atoms.map((a) => a.tok));
  const need = tokenCounts(target.atoms);
  const parts = [];
  for (const t of new Set([...Object.keys(have), ...Object.keys(need)])) {
    const d = (have[t] || 0) - (need[t] || 0);
    const label = tokenInfo(t).label;
    if (d > 0) parts.push(`te sobra${d > 1 ? 'n' : ''} ${d} ${label}`);
    if (d < 0) parts.push(`te falta${d < -1 ? 'n' : ''} ${-d} ${label}`);
  }
  const saturated = isSaturated(model);
  const unfinished = model.atoms.filter((a) => !atomStatus(model, a.id).ok).length;

  if (saturated) {
    const other = identify(model, catalog.filter((m) => m.id !== target.id));
    if (other) {
      return {
        kind: 'other-molecule', other,
        text: `¡Has formado ${other.name} (${other.formula})! Pero el objetivo es ${target.name}.`
          + (hillFormula(other.atoms) === hillFormula(target.atoms) ? ' Son isómeros: misma fórmula, distinta estructura.' : ''),
      };
    }
  }
  if (!parts.length) {
    const g = toGraph(model); const r = recipeGraph(target);
    if (isomorphic(g, r, { ignoreOrder: true })) {
      return { kind: 'bond-order', text: 'Los átomos están bien unidos, pero revisa los enlaces dobles o triples: toca un enlace para cambiarlo.' };
    }
    if (saturated) {
      return { kind: 'isomer', text: `Tienes los átomos de ${target.formula}, pero unidos de otra forma: es un isómero. Cambia qué átomo va unido a cuál.` };
    }
    return { kind: 'incomplete', text: `Tienes todos los átomos, pero ${plural(unfinished, 'átomo tiene', 'átomos tienen')} enlaces sin completar.` };
  }
  const list = parts.join(' · ');
  return { kind: saturated ? 'counts' : 'incomplete', text: list.charAt(0).toUpperCase() + list.slice(1) + '.' };
}
