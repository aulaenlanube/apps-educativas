// Maquetación de las láminas imprimibles del atlas (A4): tamaño de la figura,
// orientación, llamadas con línea guía desde el ancla de cada estructura (`c`)
// hasta su número o su nombre en los márgenes, y filas de respuesta.
// Todo en milímetros. Funciones puras (tests en
// src/__tests__/cuerpo-humano-extras.test.js); lo pinta PlatePrint.jsx.

// A4 menos 10 mm de margen por lado.
export const PAGE_MM = { portrait: [190, 277], landscape: [277, 190] };
export const PAGE_MARGIN_MM = 10;
// Alto que se reserva para cabecera, enunciado y pie.
export const RESERVE_H = 42;

// Lámina muda: número en un círculo + panel de respuestas a un lado.
export const MUTE = { col: 8, label: 6.4, panel: 58, gap: 6, r: 2.7 };
// Con nombres: texto en los márgenes.
export const NAMED = { font: 3.1, line: 3.7, wrap: 24, charW: 1.72, minCol: 26, maxCol: 54 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const avg = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);

// Parte un nombre largo en dos líneas por el espacio más cercano a la mitad.
export function wrapLabel(text, max = NAMED.wrap) {
  const s = String(text || '');
  if (s.length <= max || !s.includes(' ')) return [s];
  const mid = s.length / 2;
  let cut = -1;
  for (let i = 0; i < s.length; i += 1) if (s[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
  return [s.slice(0, cut), s.slice(cut + 1)];
}

// Escala (mm por unidad de la lámina) y orientación que dejan la figura más grande.
//   side: mm horizontales que ocupan los márgenes de llamadas y el panel.
export function fitPlate(w, h, side, reserveH = RESERVE_H) {
  const fit = ([pw, ph]) => Math.max(0.01, Math.min((pw - side) / w, (ph - reserveH) / h));
  const sp = fit(PAGE_MM.portrait);
  const sl = fit(PAGE_MM.landscape);
  const landscape = sl > sp * 1.04;
  const s = landscape ? sl : sp;
  return { landscape, s, plateW: w * s, plateH: h * s };
}

// Reparte etiquetas en una columna sin que se solapen: cada una ocupa sizes[i]
// (alto) y quiere estar en ys[i] (centro, ya ordenadas). Los grupos que chocan
// se juntan y se centran en la media de lo que querían. Todo dentro de [lo, hi].
export function spread(ys, sizes, lo, hi) {
  const n = ys.length;
  if (!n) return [];
  const total = sizes.reduce((a, b) => a + b, 0);
  const k = total > hi - lo ? (hi - lo) / total : 1; // no caben: se aprietan
  const sz = sizes.map((x) => x * k);
  const place = (g) => {
    let off = 0;
    const tops = [];
    for (let i = g.a; i <= g.b; i += 1) {
      tops.push(ys[i] - off - sz[i] / 2);
      off += sz[i];
    }
    g.size = off;
    g.top = clamp(avg(tops), lo, hi - off);
  };
  let groups = ys.map((_, i) => ({ a: i, b: i }));
  groups.forEach(place);
  for (let merged = true; merged;) {
    merged = false;
    for (let i = 1; i < groups.length; i += 1) {
      const p = groups[i - 1];
      const q = groups[i];
      if (p.top + p.size > q.top + 1e-9) {
        const g = { a: p.a, b: q.b };
        place(g);
        groups = [...groups.slice(0, i - 1), g, ...groups.slice(i + 1)];
        merged = true;
        break;
      }
    }
  }
  const out = [];
  for (const g of groups) {
    let y = g.top;
    for (let i = g.a; i <= g.b; i += 1) {
      out.push(y + sz[i] / 2);
      y += sz[i];
    }
  }
  return out;
}

// Llamadas a izquierda y derecha. items = [{ k, x, y, size }] en mm (x, y =
// ancla dentro de la figura de ancho `width` y alto `height`). Lo que está
// cerca del centro se pasa al lado con menos llamadas para equilibrar.
// Numeración: columna izquierda de arriba abajo y luego la derecha.
// → [{ ...item, side: 'L'|'R', ly, n }]
export function layoutCallouts(items, { width, height, center = 0.2 }) {
  const mid = width / 2;
  const L = [];
  const R = [];
  for (const it of items) (it.x < mid ? L : R).push(it);
  const near = (it) => Math.abs(it.x - mid) <= width * center;
  while (Math.abs(L.length - R.length) > 1) {
    const [from, to] = L.length > R.length ? [L, R] : [R, L];
    const cand = from.filter(near).sort((a, b) => Math.abs(a.x - mid) - Math.abs(b.x - mid))[0];
    if (!cand) break;
    from.splice(from.indexOf(cand), 1);
    to.push(cand);
  }
  const column = (list, side) => {
    const s = [...list].sort((a, b) => a.y - b.y || a.x - b.x);
    const ys = spread(s.map((it) => it.y), s.map((it) => it.size), 0, height);
    return s.map((it, i) => ({ ...it, side, ly: ys[i] }));
  };
  return [...column(L, 'L'), ...column(R, 'R')].map((it, i) => ({ ...it, n: i + 1 }));
}

// Plan completo de una lámina para imprimir.
//   plate: { w, h }, entries: [{ k, c: [x, y] }], nameOf(k) → texto, mode: 'mute' | 'named'
export function printPlan({ plate, entries, nameOf, mode = 'mute' }) {
  const named = mode === 'named';
  const labels = entries.map((e) => ({ k: e.k, c: e.c, lines: named ? wrapLabel(nameOf(e.k)) : [String(nameOf(e.k))] }));
  const longest = Math.max(1, ...labels.map((l) => Math.max(...l.lines.map((x) => x.length))));
  const col = named ? clamp(longest * NAMED.charW + 5, NAMED.minCol, NAMED.maxCol) : MUTE.col;
  const panel = named ? 0 : MUTE.panel + MUTE.gap;
  const fit = fitPlate(plate.w, plate.h, 2 * col + panel);
  const { s, plateW, plateH } = fit;
  const items = labels.map((l) => ({
    k: l.k,
    name: l.lines.join(' '),
    lines: l.lines,
    x: l.c[0] * s,
    y: l.c[1] * s,
    size: named ? l.lines.length * NAMED.line + 1.4 : MUTE.label,
  }));
  const callouts = layoutCallouts(items, { width: plateW, height: plateH });
  // Filas del panel de respuestas: 1 o 2 columnas según quepan.
  const n = callouts.length;
  let answerCols = 1;
  let rowH = n ? plateH / n : 9;
  if (rowH < 6.5 && n > 1) {
    answerCols = 2;
    rowH = plateH / Math.ceil(n / 2);
  }
  return {
    mode,
    landscape: fit.landscape,
    s,
    col,
    plateW,
    plateH,
    figW: plateW + 2 * col,
    figH: plateH,
    panelW: named ? 0 : MUTE.panel,
    callouts,
    answers: { cols: answerCols, rowH: clamp(rowH, 4.5, 9.5) },
  };
}
