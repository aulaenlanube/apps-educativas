// Láminas dibujadas a mano: SVG con la ilustración y un grupo <g id="hits">
// de rutas con data-key. Se valida, se rasteriza a WebP (sin las zonas de
// toque) y se calculan el punto de etiqueta y el área visible de cada zona.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { HAND_PLATES } from './hand-plates.mjs';
import { STRUCTURES } from '../../src/apps/_shared/anatomia/data/structures.js';
import { idBoxes, traceId } from './vectorize.mjs';

const KEYS = new Set(STRUCTURES.map((s) => s.k));
export const SVG_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'plates-svg');
const MAX_BYTES = 160 * 1024;
const RENDER_W = 1600;

const attr = (tag, name) => new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`).exec(tag)?.[1] ?? null;

// Parte un SVG en { viewBox, art (SVG sin las zonas), hits: [{ k, d }] } y avisa de errores.
export function parsePlate(id, svg) {
  const errors = [];
  const def = HAND_PLATES.find((p) => p.id === id);
  if (!def) errors.push(`Lámina desconocida: ${id}`);
  const vb = attr(/<svg[^>]*>/.exec(svg)?.[0] || '', 'viewBox');
  if (!vb) errors.push('Falta viewBox en <svg>');
  const [, , vw, vh] = (vb || '0 0 0 0').split(/[\s,]+/).map(Number);
  if (def && (Math.abs(vw - def.size[0]) > 0.5 || Math.abs(vh - def.size[1]) > 0.5)) errors.push(`viewBox debe ser 0 0 ${def.size[0]} ${def.size[1]}`);
  for (const bad of ['<text', '<filter', '<image', '<foreignObject', '<script', '<animate', 'filter:', '<style', 'xlink:href="http', 'href="http']) {
    if (svg.includes(bad)) errors.push(`No se permite ${bad}`);
  }
  if (Buffer.byteLength(svg) > MAX_BYTES) errors.push(`Pesa ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KB (máx. ${MAX_BYTES / 1024})`);
  const m = /<g\s+id="hits"[^>]*>([\s\S]*?)<\/g>/.exec(svg);
  const hits = [];
  if (!m) errors.push('Falta <g id="hits">…</g>');
  else {
    if (/transform/.test(m[0])) errors.push('Las zonas (#hits) no pueden llevar transform');
    if (/<g[\s>]/.test(m[1])) errors.push('Dentro de #hits solo puede haber <path>');
    for (const tag of m[1].match(/<path\b[^>]*>/g) || []) {
      const k = attr(tag, 'data-key'); const d = attr(tag, 'd');
      if (!k || !d) { errors.push(`Zona sin data-key o sin d: ${tag.slice(0, 60)}`); continue; }
      if (!KEYS.has(k)) errors.push(`data-key desconocida: ${k}`);
      hits.push({ k, d });
    }
    if (/<(rect|circle|ellipse|polygon|polyline|line)\b/.test(m[1])) errors.push('En #hits solo vale <path> (convierte las formas a path)');
  }
  if (def) {
    const have = new Set(hits.map((h) => h.k));
    for (const k of def.keys) if (!have.has(k)) errors.push(`Falta la zona de ${k}`);
    for (const k of have) if (!def.keys.includes(k)) errors.push(`Zona que no está en la lista de la lámina: ${k}`);
  }
  const art = m ? svg.replace(m[0], '') : svg;
  return { def, vw, vh, art, hits, errors };
}

// Búfer de zonas (la última zona del documento queda encima) a resolución w.
async function hitBuffer(hits, vw, vh, w) {
  const h = Math.round((w * vh) / vw);
  const color = (i) => `rgb(${(i + 1) & 255},${((i + 1) >> 8) & 255},0)`;
  const body = hits.map((hp, i) => `<path d="${hp.d}" fill="${color(i)}" fill-rule="evenodd"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${w}" height="${h}" shape-rendering="crispEdges">${body}</svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const id = new Uint16Array(info.width * info.height);
  for (let i = 0; i < id.length; i += 1) {
    if (data[i * 4 + 3] < 128) continue;
    id[i] = data[i * 4] + data[i * 4 + 1] * 256;
  }
  return { id, W: info.width, H: info.height, scale: vw / info.width };
}

export async function processPlate(id, { outData, outImg, root }) {
  const file = path.join(SVG_DIR, `${id}.svg`);
  const svg = fs.readFileSync(file, 'utf8');
  const { vw, vh, art, hits, errors } = parsePlate(id, svg);
  if (errors.length) throw new Error(`${id}: ${errors.join(' · ')}`);
  const img = `/images/anatomia/${id}.webp`;
  await sharp(Buffer.from(art), { density: (72 * RENDER_W) / vw })
    .resize(RENDER_W)
    .webp({ quality: 80, alphaQuality: 85, effort: 6 })
    .toFile(path.join(outImg, `${id}.webp`));
  const buf = await hitBuffer(hits, vw, vh, 1000);
  const boxes = idBoxes(buf.id, buf.W, buf.H);
  // Varias zonas pueden compartir clave (p. ej. los dos ovarios): se unen.
  const byKey = new Map();
  hits.forEach((hp, i) => {
    if (!byKey.has(hp.k)) byKey.set(hp.k, { ds: [], ids: [] });
    byKey.get(hp.k).ds.push(hp.d);
    byKey.get(hp.k).ids.push(i + 1);
  });
  const entries = [];
  for (const [k, { ds, ids }] of byKey) {
    let best = null;
    let area = 0;
    for (const v of ids) {
      const box = boxes.get(v);
      if (!box) continue;
      const tr = traceId(buf.id, buf.W, buf.H, v, box, { scale: buf.scale, tol: 1, minArea: 2 });
      area += tr.area;
      if (!best || tr.inner > best.inner) best = tr;
    }
    if (!best) throw new Error(`${id}: la zona ${k} queda tapada del todo por otras`);
    entries.push({ k, d: ds.join(' '), c: best.anchor, a: Math.round(area), b: best.box });
  }
  // Zonas contenedoras (corona, útero, plasma…): qué otras zonas quedan dentro,
  // para aceptar un toque en ellas cuando se pide la contenedora.
  const masks = new Map();
  for (const [k, { ds }] of byKey) {
    const one = await hitBuffer(ds.map((d) => ({ k, d })), vw, vh, 500);
    const m = new Uint8Array(one.id.length);
    let n = 0;
    for (let i = 0; i < m.length; i += 1) if (one.id[i]) { m[i] = 1; n += 1; }
    masks.set(k, { m, n });
  }
  const containers = HAND_PLATES.find((p) => p.id === id)?.containers || [];
  for (const e of entries) {
    if (!containers.includes(e.k)) continue;
    const A = masks.get(e.k);
    const inside = [];
    for (const [k, B] of masks) {
      if (k === e.k || !B.n || B.n >= A.n) continue;
      let both = 0;
      for (let i = 0; i < B.m.length; i += 1) if (B.m[i] && A.m[i]) both += 1;
      if (both / B.n >= 0.85) inside.push(k);
    }
    if (inside.length) e.x = inside;
    e.cv = 1;
  }
  const json = { id, kind: 'svg', view: null, w: vw, h: vh, img, entries };
  fs.writeFileSync(path.join(outData, `${id}.json`), JSON.stringify(json));
  return { id, kind: 'svg', view: null, w: vw, h: vh, img, frame: null, keys: entries.map((e) => e.k) };
}

export async function buildHandPlates({ root, only = [], outData, outImg }) {
  const out = [];
  if (!fs.existsSync(SVG_DIR)) return out;
  for (const def of HAND_PLATES) {
    if (only.length && !only.includes(def.id)) continue;
    if (!fs.existsSync(path.join(SVG_DIR, `${def.id}.svg`))) { console.warn(`  · falta la lámina dibujada ${def.id}`); continue; }
    out.push(await processPlate(def.id, { outData, outImg, root }));
    console.log(`✓ ${def.id} (dibujada)`);
  }
  return out;
}
