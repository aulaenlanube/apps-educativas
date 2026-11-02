#!/usr/bin/env node
// tools/build-anatomy.mjs
// Genera las láminas del cuerpo humano (Explorador del Cuerpo Humano, Huesos y
// Músculos, Viaje por el Cuerpo):
//   · public/images/anatomia/<lámina>.webp   ilustración (render por software de
//     las mallas de BodyParts3D, CC BY 4.0) o lámina dibujada (SVG)
//   · public/data/anatomia/<lámina>.json      silueta tocable de cada estructura
//     (ruta SVG), punto de etiqueta, área y, en órganos, silueta completa
//   · public/data/anatomia/index.json         índice de láminas
//
// Uso: node tools/build-anatomy.mjs [lámina…] [--hand-only] [--no-hand]
// Necesita las mallas en tools/.cache/bodyparts3d (ver tools/anatomy/README.md).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createContext } from './anatomy/body.mjs';
import { PLATES, VESSEL_MAT } from './anatomy/plates.mjs';
import { rasterize, viewBounds, growIds, VIEWS } from './anatomy/raster.mjs';
import { shade, principalAxis } from './anatomy/shade.mjs';
import { idBoxes, traceId } from './anatomy/vectorize.mjs';
import { loadElement, elementsMatching, bbox, cutTriangles, signedVolume } from './anatomy/meshes.mjs';
import { buildHandPlates } from './anatomy/hand.mjs';
import { regionClassifier } from './anatomy/regions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'tools/.cache/bodyparts3d');
const OUT_DATA = path.join(ROOT, 'public/data/anatomia');
const OUT_IMG = path.join(ROOT, 'public/images/anatomia');
const SS = 2;
const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith('--'));
const flags = new Set(args.filter((a) => a.startsWith('--')));
fs.mkdirSync(OUT_DATA, { recursive: true });
fs.mkdirSync(OUT_IMG, { recursive: true });

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const round1 = (v) => Math.round(v * 10) / 10;

/* ───────── piezas de cada lámina ───────── */

function clipFor(ctx, spec) {
  if (!spec.clipZ && !spec.clipBelowWrist && !spec.clipBox) return null;
  const L = ctx.landmarks();
  if (spec.clipBox === 'heart') {
    const b = bbox(ctx.get([/^wall of (ventricle|right atrium|left atrium)$/i]));
    const m = 22;
    return (p) => p[0] < b.min[0] - m || p[0] > b.max[0] + m || p[1] < b.min[1] - m || p[1] > b.max[1] + m || p[2] < b.min[2] - m || p[2] > b.max[2] + m;
  }
  if (spec.clipZ === 'cerebellumMin') {
    const z = bbox(ctx.get([/^cerebellum$/i])).min[2] - 45;
    return (p) => p[2] < z;
  }
  if (spec.clipZ === 'heartMin') {
    const z = bbox(ctx.get([/^wall of ventricle$/i])).min[2] - 25;
    return (p) => p[2] < z;
  }
  if (spec.clipBelowWrist) return (p) => p[2] > L.wristR[2] + 55;
  if (spec.clipZ === 'pubis') return (p) => p[2] < L.pubis[2] - 12;
  return null;
}

// Mallas de una pieza: [{ mesh, spec (material efectivo), file }]
function partMeshes(ctx, part, used) {
  const out = [];
  const clip = clipFor(ctx, part);
  const add = (mesh, spec, file) => {
    const m = clip ? cutTriangles(mesh, clip) : mesh;
    if (m.idx.length) out.push({ mesh: m, spec, file });
  };
  if (part.mesh) add(part.mesh(ctx), part, null);
  if (part.el?.length) {
    const files = elementsMatching(ctx.names, part.el, part.not ? [].concat(part.not) : []);
    const banned = part.notConcept ? conceptFiles(part.notConcept, part.keepIn) : null;
    for (const f of files) {
      if (used?.has(f) || banned?.has(f)) continue;
      const name = ctx.names.find((e) => e.fj === f)?.n || '';
      const sub = part.sub?.find((s) => s.re.test(name));
      if (sub?.skip) continue;
      let spec = sub ? { ...part, ...sub } : part;
      if (spec.mat === 'auto-vessel') spec = { ...spec, mat: VESSEL_MAT(name) };
      const mesh = loadElement(DIR, f);
      if (mesh) add(mesh, spec, f);
    }
  }
  if (part.extra) add(part.extra(ctx), part, null);
  return out;
}

// Elementos de uno o varios conceptos (FMA), salvo los que casen con keepIn.
const conceptCache = new Map();
function conceptFiles(concepts, keepIn) {
  const out = new Set();
  for (const f of ['isa_element_parts.txt', 'partof_element_parts.txt']) {
    if (!conceptCache.has(f)) conceptCache.set(f, fs.readFileSync(path.join(DIR, f), 'utf8').split('\n').map((l) => l.split('\t')));
    for (const p of conceptCache.get(f)) if (concepts.includes(p[0]) && p[2] && !(keepIn && keepIn.test(p[1]))) out.add(p[2].trim());
  }
  return out;
}

function materialOf(spec, mesh) {
  if (spec.mat === 'holo-lung') return { holo: 'ghost' };
  const m = { mat: spec.mat, color: spec.color, dark: spec.dark, cut: spec.cut };
  if (spec.fiber) m.axis = spec.fiber === 'auto' ? principalAxis(mesh) : (() => { const l = Math.hypot(...spec.fiber); return spec.fiber.map((v) => v / l); })();
  return m;
}

/* ───────── encuadres ───────── */

const frames = {};
function bodyFrame(ctx, view) {
  if (frames[view]) return frames[view];
  const vb = viewBounds([ctx.skin()], view);
  const half = Math.max(Math.abs(vb.x0), Math.abs(vb.x1)) + 24;
  // de frente / de espaldas: centrado en la línea media; de perfil, en el cuerpo
  frames[view] = view.startsWith('lateral')
    ? { x0: vb.x0 - 24, x1: vb.x1 + 24, y0: vb.y0 - 24, y1: vb.y1 + 24 }
    : { x0: -half, x1: half, y0: vb.y0 - 24, y1: vb.y1 + 24 };
  return frames[view];
}

/* ───────── render de una lámina ───────── */

async function renderPlate(ctx, plate) {
  const t0 = Date.now();
  const view = plate.view;
  const items = []; // { mesh, mat, key|null }
  const used = new Set();
  const keys = [];
  if (plate.regions) {
    items.push({ mesh: ctx.skin(), mat: { holo: 'body' }, key: null, region: true });
  }
  for (const part of plate.parts) {
    if (!part) continue;
    const list = partMeshes(ctx, part, used);
    if (!list.length) { console.warn(`  · ${plate.id}: ${part.k} sin piezas`); continue; }
    if (!keys.includes(part.k)) keys.push(part.k);
    for (const it of list) {
      if (it.file) used.add(it.file);
      items.push({ mesh: it.mesh, mat: materialOf(it.spec, it.mesh), key: part.k, gp: part.gp, shape: part.shape });
    }
  }
  for (const c of plate.context || []) {
    for (const it of partMeshes(ctx, c, used)) {
      if (it.file) used.add(it.file);
      items.push({ mesh: it.mesh, mat: materialOf(it.spec, it.mesh), key: null, bias: plate.bias || (c.behind ? 400 : 0) });
    }
  }
  if (items.length > 65000) throw new Error('Demasiadas piezas');

  let frame;
  if (plate.frame === 'body') frame = bodyFrame(ctx, view);
  else {
    const vb = viewBounds(items.filter((it) => it.key || plate.frameAll).map((it) => it.mesh), view);
    const pad = plate.frame.pad || 10;
    frame = { x0: vb.x0 - pad, x1: vb.x1 + pad, y0: vb.y0 - pad, y1: vb.y1 + pad };
  }
  const scale = (plate.height || 1000) / (frame.y1 - frame.y0);
  // Algunas piezas del modelo vienen con las caras al revés: se detecta por el volumen.
  const meshes = items.map((it, i) => ({ id: i + 1, pos: it.mesh.pos, idx: it.mesh.idx, nrm: it.mesh.nrm, bias: it.bias || 0, flip: signedVolume(it.mesh) < 0 }));
  const buf = rasterize(meshes, { view, frame, scale: scale * SS, near: plate.near ?? -Infinity });
  const mats = new Map(items.map((it, i) => [i + 1, it.mat]));
  const rgba = shade(buf, mats, { ss: SS, aoRadius: plate.ao || 9, cutFaces: plate.near != null });
  const W = Math.round(buf.W / SS); const H = Math.round(buf.H / SS);
  const img = `/images/anatomia/${plate.id}.webp`;
  await sharp(Buffer.from(rgba.buffer), { raw: { width: buf.W, height: buf.H, channels: 4 } })
    .resize(W, H, { kernel: 'lanczos3' })
    .webp({ quality: 84, alphaQuality: 90, effort: 5 })
    .toFile(path.join(ROOT, 'public', img));

  // Búfer de claves (0 = nada que tocar)
  const keyIdx = new Map(keys.map((k, i) => [k, i + 1]));
  let kb = new Uint16Array(buf.W * buf.H);
  if (plate.regions) {
    const regionKeys = [];
    const classify = regionClassifier(ctx, view);
    for (let y = 0; y < buf.H; y += 1) {
      const vy = frame.y1 - (y + 0.5) / (scale * SS);
      for (let x = 0; x < buf.W; x += 1) {
        const i = y * buf.W + x;
        if (!buf.id[i]) continue;
        const k = classify(frame.x0 + (x + 0.5) / (scale * SS), vy);
        let n = regionKeys.indexOf(k);
        if (n < 0) { regionKeys.push(k); n = regionKeys.length - 1; }
        kb[i] = n + 1;
      }
    }
    keys.push(...regionKeys);
    regionKeys.forEach((k, i) => keyIdx.set(k, i + 1));
  } else {
    for (let i = 0; i < kb.length; i += 1) {
      const it = items[buf.id[i] - 1];
      if (it?.key) kb[i] = keyIdx.get(it.key);
    }
  }
  if (plate.grow) kb = growIds({ W: buf.W, H: buf.H, id: kb }, plate.grow * SS);

  const boxes = idBoxes(kb, buf.W, buf.H);
  const entries = [];
  for (const k of keys) {
    const v = keyIdx.get(k);
    const box = boxes.get(v);
    if (!box || box[4] < 30) { if (!plate.regions) console.warn(`  · ${plate.id}: ${k} no se ve`); continue; }
    const tr = traceId(kb, buf.W, buf.H, v, box, { scale: 1 / SS, tol: 1.4, minArea: 10 });
    if (!tr.d) continue;
    const part = items.find((it) => it.key === k);
    entries.push({ k, d: tr.d, c: tr.anchor, a: Math.round(tr.area), b: tr.box, ...(part?.gp ? { gp: part.gp } : {}) });
  }

  // Siluetas completas (minijuego de siluetas)
  const shapes = {};
  for (const k of keys) {
    const its = items.filter((it) => it.key === k && it.shape);
    if (!its.length) continue;
    const ms = its.map((it, i) => ({ id: 1, pos: it.mesh.pos, idx: it.mesh.idx, nrm: it.mesh.nrm, i, flip: signedVolume(it.mesh) < 0 }));
    const vb = viewBounds(ms, view);
    const sc = 240 / Math.max(vb.x1 - vb.x0, vb.y1 - vb.y0);
    const fr = { x0: vb.x0 - 4 / sc, x1: vb.x1 + 4 / sc, y0: vb.y0 - 4 / sc, y1: vb.y1 + 4 / sc };
    const b2 = rasterize(ms, { view, frame: fr, scale: sc });
    const bx = idBoxes(b2.id, b2.W, b2.H).get(1);
    if (!bx) continue;
    const tr = traceId(b2.id, b2.W, b2.H, 1, bx, { scale: 1, tol: 0.9, minArea: 8 });
    shapes[k] = { d: tr.d, w: b2.W, h: b2.H };
  }

  const json = { id: plate.id, kind: 'render', view, w: W, h: H, img, entries, ...(Object.keys(shapes).length ? { shapes } : {}) };
  fs.writeFileSync(path.join(OUT_DATA, `${plate.id}.json`), JSON.stringify(json));
  const kb2 = fs.statSync(path.join(ROOT, 'public', img)).size / 1024;
  console.log(`✓ ${plate.id} ${W}×${H} · ${entries.length} estructuras · img ${kb2.toFixed(0)} KB · json ${(JSON.stringify(json).length / 1024).toFixed(0)} KB · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return { id: plate.id, kind: 'render', view, w: W, h: H, img, frame: plate.frame === 'body' ? 'body' : null, keys: entries.map((e) => e.k) };
}

async function renderGhost(ctx, view, height) {
  const frame = bodyFrame(ctx, view);
  const scale = height / (frame.y1 - frame.y0);
  const buf = rasterize([{ id: 1, ...ctx.skin() }], { view, frame, scale: scale * SS });
  const rgba = shade(buf, new Map([[1, { holo: 'ghost' }]]), { ss: SS, ao: false, outline: 0 });
  const img = `/images/anatomia/ghost-${view === 'anterior' ? 'a' : 'p'}.webp`;
  await sharp(Buffer.from(rgba.buffer), { raw: { width: buf.W, height: buf.H, channels: 4 } })
    .resize(Math.round(buf.W / SS), Math.round(buf.H / SS), { kernel: 'lanczos3' })
    .webp({ quality: 80, alphaQuality: 85 })
    .toFile(path.join(ROOT, 'public', img));
  return img;
}

/* ───────── main ───────── */

const indexFile = path.join(OUT_DATA, 'index.json');
const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : { plates: {}, ghosts: {} };

// Rehace el índice a partir de los JSON ya generados (sin volver a renderizar).
function rebuildIndex() {
  const bodyIds = new Set(PLATES.filter((p) => p.frame === 'body').map((p) => p.id));
  index.plates = {};
  for (const f of fs.readdirSync(OUT_DATA)) {
    if (!f.endsWith('.json') || f === 'index.json') continue;
    const j = JSON.parse(fs.readFileSync(path.join(OUT_DATA, f), 'utf8'));
    index.plates[j.id] = { id: j.id, kind: j.kind, view: j.view, w: j.w, h: j.h, img: j.img, frame: bodyIds.has(j.id) ? 'body' : null, keys: j.entries.map((e) => e.k) };
  }
  index.ghosts = { anterior: '/images/anatomia/ghost-a.webp', posterior: '/images/anatomia/ghost-p.webp' };
}

if (flags.has('--index-only')) {
  rebuildIndex();
} else if (!flags.has('--hand-only')) {
  const ctx = createContext(DIR);
  for (const plate of PLATES) {
    if (only.length && !only.includes(plate.id)) continue;
    index.plates[plate.id] = await renderPlate(ctx, plate);
  }
  if (!only.length || only.includes('ghost')) {
    index.ghosts = { anterior: await renderGhost(ctx, 'anterior', 1800), posterior: await renderGhost(ctx, 'posterior', 1800) };
    console.log('✓ ghosts');
  }
}
if (!flags.has('--no-hand') && !flags.has('--index-only')) {
  await buildHandPlates({ root: ROOT, only, outData: OUT_DATA, outImg: OUT_IMG });
}
// El índice siempre se rehace desde los JSON del disco (varias ejecuciones a la vez no se pisan).
rebuildIndex();
index.credits = 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International';
fs.writeFileSync(indexFile, JSON.stringify(index, null, 1));
console.log(`index: ${Object.keys(index.plates).length} láminas`);
