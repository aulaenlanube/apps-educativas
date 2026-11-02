#!/usr/bin/env node
// tools/build-anatomy-3d.mjs
// Genera el modelo 3D del cuerpo humano (Anatomía 3D y modo 3D de las apps del
// cuerpo) a partir de las mallas de BodyParts3D (CC BY 4.0) y de las piezas que se
// reconstruyen en tools/anatomy/body.mjs:
//   · public/models/anatomia/<capa>.<l|h>.glb   una capa (piel, músculos, órganos…)
//     en dos niveles de detalle (l = ligero, h = detalle), comprimida con meshopt.
//     Un único primitivo por capa: POSITION, NORMAL, COLOR_0 (albedo + oclusión
//     ambiental horneada en alfa) y _PC (número de pieza, material).
//   · public/data/anatomia3d/index.json   capas, piezas (clave, lado, contenedores,
//     centro, caja) y puntos de referencia (articulaciones, recorridos).
//
// Uso: node tools/build-anatomy-3d.mjs [capa…] [--stats] (--stats: solo cuenta)
// Ejes del modelo: metros, x = izquierda del sujeto, y = arriba, z = delante;
// el suelo en y = 0 y el centro del cuerpo en x = z = 0.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { meshopt } from '@gltf-transform/functions';
import { createContext } from './anatomy/body.mjs';
import { LAYERS_3D } from './anatomy/model3d.mjs';
import { loadElement, elementsMatching, signedVolume, bbox } from './anatomy/meshes.mjs';
import { regionClassifier } from './anatomy/regions.mjs';
import { VESSEL_MAT } from './anatomy/plates.mjs';
import { MATERIALS } from './anatomy/shade.mjs';
import { vertexNormals } from './anatomy/raster.mjs';
import { bakeAO } from './anatomy/ao3d.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'tools/.cache/bodyparts3d');
const OUT_MODEL = path.join(ROOT, 'public/models/anatomia');
const OUT_DATA = path.join(ROOT, 'public/data/anatomia3d');
const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith('--'));
const STATS = args.includes('--stats');

// Niveles de detalle: presupuesto de triángulos por capa. Se busca el error
// (igual para todas las piezas de la capa) que lo cumple: calidad uniforme.
export const LODS = {
  h: { piel: 60000, musculos: 220000, 'musculos-prof': 180000, organos: 230000, vasos: 160000, nervios: 16000, esqueleto: 230000 },
  l: { piel: 16000, musculos: 70000, 'musculos-prof': 60000, organos: 75000, vasos: 40000, nervios: 6000, esqueleto: 75000 },
};
const MIN_TRIS = 24;
// Materiales: código en _PC.y (lo usa el sombreado del visor).
export const MAT_CODES = ['skin', 'bone', 'cartilage', 'tooth', 'muscle', 'tendon', 'artery', 'vein', 'nerve', 'brain', 'organ'];

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

/* ───────── coordenadas ───────── */

// BodyParts3D: mm, x+ izquierda, y+ detrás, z+ arriba → metros, y arriba, z delante.
let ORIGIN = [0, 0, 0];
const toModel = (x, y, z) => [(x - ORIGIN[0]) / 1000, (z - ORIGIN[2]) / 1000, -(y - ORIGIN[1]) / 1000];

const regionCache = new WeakMap();
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/* ───────── piezas de una capa ───────── */

const conceptCache = new Map();
function conceptFiles(concepts, keepIn) {
  const out = new Set();
  for (const f of ['isa_element_parts.txt', 'partof_element_parts.txt']) {
    if (!conceptCache.has(f)) conceptCache.set(f, fs.readFileSync(path.join(DIR, f), 'utf8').split('\n').map((l) => l.split('\t')));
    for (const p of conceptCache.get(f)) if (concepts.includes(p[0]) && p[2] && !(keepIn && keepIn.test(p[1]))) out.add(p[2].trim());
  }
  return out;
}

const sideOf = (name) => (/(^|\s)left\b|\bof left\b/i.test(name) ? 'L' : /(^|\s)right\b|\bof right\b/i.test(name) ? 'R' : '');

// Mallas que aporta una pieza: [{ mesh, mat, color, side }]
function specMeshes(ctx, spec, used) {
  const out = [];
  const add = (mesh, s, side = '') => {
    if (!mesh?.idx?.length) return;
    const mat = s.mat;
    out.push({ mesh, mat: mat === 'holo-lung' ? 'organ' : mat, color: s.color, side: spec.side === false ? '' : side });
  };
  if (spec.mesh) add(spec.mesh(ctx), spec);
  if (spec.el?.length) {
    const files = elementsMatching(ctx.names, spec.el, spec.not ? [].concat(spec.not) : []);
    const banned = spec.notConcept ? conceptFiles(spec.notConcept, spec.keepIn) : null;
    for (const f of files) {
      if (used.has(f) || banned?.has(f)) continue;
      const name = ctx.names.find((e) => e.fj === f)?.n || '';
      const sub = spec.sub?.find((s) => s.re.test(name));
      if (sub?.skip) continue;
      let s = sub ? { ...spec, ...sub } : spec;
      if (s.mat === 'auto-vessel') s = { ...s, mat: VESSEL_MAT(name) };
      const mesh = loadElement(DIR, f);
      if (!mesh) continue;
      used.add(f);
      add(mesh, s, sideOf(name));
    }
  }
  if (spec.extra) add(spec.extra(ctx), spec);
  return out;
}

// Une mallas en una pieza: posiciones del modelo, albedo y material por vértice,
// caras orientadas hacia fuera (algunas mallas vienen al revés).
function buildPart(list) {
  let nv = 0; let ni = 0;
  for (const it of list) { nv += it.mesh.pos.length / 3; ni += it.mesh.idx.length; }
  const pos = new Float32Array(nv * 3);
  const col = new Uint8Array(nv * 3);
  const mat = new Uint8Array(nv);
  const idx = new Uint32Array(ni);
  let v0 = 0; let i0 = 0;
  for (const it of list) {
    const m = it.mesh;
    const flip = signedVolume(m) < 0;
    const code = Math.max(0, MAT_CODES.indexOf(it.mat));
    const rgb = hex(it.color || MATERIALS[it.mat]?.base || '#cccccc');
    for (let v = 0; v < m.pos.length / 3; v += 1) {
      const p = toModel(m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]);
      pos.set(p, (v0 + v) * 3);
      col.set(rgb, (v0 + v) * 3);
      mat[v0 + v] = code;
    }
    for (let t = 0; t < m.idx.length; t += 3) {
      idx[i0 + t] = v0 + m.idx[t];
      idx[i0 + t + 1] = v0 + (flip ? m.idx[t + 2] : m.idx[t + 1]);
      idx[i0 + t + 2] = v0 + (flip ? m.idx[t + 1] : m.idx[t + 2]);
    }
    v0 += m.pos.length / 3; i0 += m.idx.length;
  }
  return weld({ pos, col, mat, idx });
}

// Une vértices repetidos (misma posición) para que el simplificador funcione.
// Además se quitan los vértices sin usar: el simplificador los tomaría por costuras.
function weld(p) {
  const remap = MeshoptSimplifier.generatePositionRemap(p.pos, 3);
  const nv = p.pos.length / 3;
  const slot = new Int32Array(nv).fill(-1);
  let n = 0;
  const idx = new Uint32Array(p.idx.length);
  for (let i = 0; i < idx.length; i += 1) {
    const v = remap[p.idx[i]];
    if (slot[v] < 0) slot[v] = n++;
    idx[i] = slot[v];
  }
  const pos = new Float32Array(n * 3); const col = new Uint8Array(n * 3); const mat = new Uint8Array(n);
  for (let v = 0; v < nv; v += 1) {
    const s2 = slot[v];
    if (s2 < 0) continue;
    pos.set(p.pos.subarray(v * 3, v * 3 + 3), s2 * 3);
    col.set(p.col.subarray(v * 3, v * 3 + 3), s2 * 3);
    mat[s2] = p.mat[v];
  }
  return { pos, col, mat, idx };
}

function simplify(part, error) {
  if (part.idx.length <= MIN_TRIS * 3) return part.idx;
  let [out] = MeshoptSimplifier.simplify(part.idx, part.pos, 3, MIN_TRIS * 3, error, ['ErrorAbsolute', 'Prune']);
  // Prune puede borrar una pieza pequeña entera: entonces sin Prune
  if (out.length < MIN_TRIS * 3) [out] = MeshoptSimplifier.simplify(part.idx, part.pos, 3, MIN_TRIS * 3, error, ['ErrorAbsolute']);
  return out;
}

// Error (m) para que la capa quepa en el presupuesto: búsqueda en escala logarítmica.
function simplifyLayer(parts, budget) {
  let lo = Math.log(2e-5); let hi = Math.log(0.03);
  let best = null;
  for (let it = 0; it < 10; it += 1) {
    const e = Math.exp((lo + hi) / 2);
    const res = parts.map((p) => simplify(p, e));
    const tris = res.reduce((s2, r) => s2 + r.length / 3, 0);
    if (tris <= budget) { best = { e, res, tris }; hi = (lo + hi) / 2; } else lo = (lo + hi) / 2;
  }
  if (!best) { const e = Math.exp(hi); const res = parts.map((p) => simplify(p, e)); best = { e, res, tris: res.reduce((s2, r) => s2 + r.length / 3, 0) }; }
  return best;
}

/* ───────── piel por regiones ───────── */

function skinParts(ctx, BY_KEY) {
  const skin = ctx.skin();
  const raw = { pos: skin.pos, idx: skin.idx };
  const part = buildPart([{ mesh: raw, mat: 'skin', color: MATERIALS.skin.base }]);
  const cls = { anterior: regionClassifier(ctx, 'anterior'), posterior: regionClassifier(ctx, 'posterior') };
  // la región de cada triángulo se decide con su centro en BodyParts3D (mm)
  const tri = new Array(part.idx.length / 3);
  const P = skin.pos;
  const inv = signedVolume(skin) < 0 ? -1 : 1;
  for (let t = 0; t < skin.idx.length; t += 3) {
    const a = skin.idx[t] * 3; const b = skin.idx[t + 1] * 3; const c = skin.idx[t + 2] * 3;
    const cx = (P[a] + P[b] + P[c]) / 3; const cy = (P[a + 1] + P[b + 1] + P[c + 1]) / 3; const cz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
    const ny = (P[b + 2] - P[a + 2]) * (P[c] - P[a]) - (P[b] - P[a]) * (P[c + 2] - P[a + 2]);
    const front = ny * inv < 0;
    tri[t / 3] = front ? cls.anterior(cx, cz) : cls.posterior(-cx, cz);
  }
  return { part, tri, keys: [...new Set(tri)].filter((k) => BY_KEY[k]) };
}

/* ───────── main ───────── */

// Contenedores de una clave según el catálogo (grp), si la pieza no los declara.
function upChain(k) {
  const out = [];
  let g = k && BY_KEY[k]?.grp;
  while (g && g !== k && !out.includes(g) && out.length < 4) { out.push(g); g = BY_KEY[g]?.grp; }
  return out;
}

const { BY_KEY } = await import('../src/apps/_shared/anatomia/data/structures.js');
const ctx = createContext(DIR);
{
  const b = bbox(ctx.skin());
  ORIGIN = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, b.min[2]];
}
fs.mkdirSync(OUT_MODEL, { recursive: true });
fs.mkdirSync(OUT_DATA, { recursive: true });
const indexFile = path.join(OUT_DATA, 'index.json');
const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : { layers: {} };
const used = new Set();
const missing = new Set();

// Las piezas se reclaman en este orden, que no es el de las capas: así un hueso
// («radius», «ethmoid»…) nunca acaba en el contexto muscular por su nombre.
const CLAIM = ['esqueleto', 'organos', 'nervios', 'vasos', 'musculos', 'musculos-prof', 'piel'];
const resolved = new Map();
for (const id of CLAIM) {
  const layer = LAYERS_3D.find((l) => l.id === id);
  if (!layer || (layer.regions && only.length && !only.includes(id))) continue;
  const parts = []; // { k, up, side, part (malla unida), skin? }
  if (layer.regions) {
    const sk = skinParts(ctx, BY_KEY);
    parts.push({ k: null, up: [], side: '', part: sk.part, skin: sk });
  } else {
    layer.parts.forEach((spec) => {
      const list = specMeshes(ctx, spec, used);
      if (!list.length) { if (spec.k) console.warn(`  · ${layer.id}: ${spec.k} sin piezas`); return; }
      if (spec.k && !BY_KEY[spec.k]) missing.add(spec.k);
      for (const side of ['', 'R', 'L']) {
        const mine = list.filter((it) => it.side === side);
        if (mine.length) parts.push({ k: spec.k || null, up: spec.up || upChain(spec.k), side, part: buildPart(mine) });
      }
    });
    for (const spec of layer.context || []) {
      const list = specMeshes(ctx, spec, used);
      if (list.length) parts.push({ k: null, up: [], side: '', part: buildPart(list) });
    }
  }
  resolved.set(id, parts);
}

for (const layer of LAYERS_3D) {
  const parts = resolved.get(layer.id);
  if (!parts || (only.length && !only.includes(layer.id))) continue;
  const t0 = Date.now();
  const raw = parts.reduce((s2, p) => s2 + p.part.idx.length / 3, 0);
  const lods = Object.fromEntries(Object.entries(LODS).map(([n, budgets]) => [n, simplifyLayer(parts.map((p) => p.part), budgets[layer.id])]));
  console.log(`${layer.id}: ${parts.length} piezas · ${raw} triángulos → ${Object.entries(lods).map(([n, r]) => `${n} ${r.tris} (error ${(r.e * 1000).toFixed(2)} mm)`).join(' · ')}`);
  if (STATS) continue;
  index.layers[layer.id] = await exportLayer(layer, parts, lods);
  console.log(`✓ ${layer.id} · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
if (missing.size) console.warn(`Claves que no están en el catálogo: ${[...missing].join(', ')}`);

if (!STATS) {
  index.landmarks = landmarks3d(ctx);
  index.credits = 'BodyParts3D, © The Database Center for Life Science, licensed under CC Attribution 4.0 International';
  index.order = LAYERS_3D.map((l) => l.id).filter((id) => index.layers[id]);
  fs.writeFileSync(indexFile, JSON.stringify(index));
  console.log(`index: ${index.order.length} capas`);
}

/* ───────── exportar una capa ───────── */

async function exportLayer(layer, parts, lods) {
  // Piezas finales: la piel se parte por regiones después de simplificar (normales sin costuras).
  const out = { id: layer.id, parts: [], files: {}, tris: {}, bytes: {} };
  const pieces = []; // { meta, idx por LOD, part }
  parts.forEach((p, pi) => {
    if (p.skin) {
      const lodIdx = Object.fromEntries(Object.keys(LODS).map((n) => [n, lods[n].res[pi]]));
      for (const k of p.skin.keys) {
        const pick = (idx) => {
          const keep = [];
          for (let t = 0; t < idx.length; t += 3) {
            // la región del triángulo simplificado = la del triángulo original más cercano (su primer vértice)
            if (regionOfVertex(p, idx[t]) === k) keep.push(idx[t], idx[t + 1], idx[t + 2]);
          }
          return new Uint32Array(keep);
        };
        pieces.push({ meta: { k, up: BY_KEY[k]?.grp ? [BY_KEY[k].grp] : [], side: '' }, part: p.part, lod: Object.fromEntries(Object.entries(lodIdx).map(([n, idx]) => [n, pick(idx)])) });
      }
      return;
    }
    pieces.push({ meta: { k: p.k, up: p.up, side: p.side }, part: p.part, lod: Object.fromEntries(Object.keys(LODS).map((n) => [n, lods[n].res[pi]])) });
  });
  // Oclusión ambiental por vértice, horneada con la capa entera en detalle.
  bakeAO(pieces, 'h');
  // número de pieza: 1..n las que se tocan (en el orden de out.parts); 0 = contexto
  for (const pc of pieces) {
    if (!pc.meta.k) { pc.id = 0; continue; }
    const c = centerOf(pc.part, pc.lod.h);
    out.parts.push({ ...pc.meta, c: c.c, b: c.b });
    pc.id = out.parts.length;
  }
  for (const n of Object.keys(LODS)) {
    const file = `${layer.id}.${n}.glb`;
    const { bytes, tris } = await writeGlb(path.join(OUT_MODEL, file), pieces, n);
    out.files[n] = `/models/anatomia/${file}`;
    out.tris[n] = tris;
    out.bytes[n] = bytes;
    console.log(`  ${file}: ${tris} triángulos · ${(bytes / 1024).toFixed(0)} KB`);
  }
  return out;
}

function regionOfVertex(p, v) {
  // región por vértice = la de su primer triángulo en la malla original
  if (!regionCache.has(p)) {
    const r = new Array(p.part.pos.length / 3);
    for (let t = 0; t < p.part.idx.length; t += 3) for (let j = 0; j < 3; j += 1) if (r[p.part.idx[t + j]] === undefined) r[p.part.idx[t + j]] = p.skin.tri[t / 3];
    regionCache.set(p, r);
  }
  return regionCache.get(p)[v];
}

function centerOf(part, idx) {
  const min = [Infinity, Infinity, Infinity]; const max = [-Infinity, -Infinity, -Infinity];
  const s = [0, 0, 0]; let n = 0;
  for (let i = 0; i < idx.length; i += 1) {
    const v = idx[i] * 3;
    for (let a = 0; a < 3; a += 1) { const x = part.pos[v + a]; if (x < min[a]) min[a] = x; if (x > max[a]) max[a] = x; s[a] += x; }
    n += 1;
  }
  const r4 = (x) => Math.round(x * 10000) / 10000;
  return { c: s.map((x) => r4(x / (n || 1))), b: [...min.map(r4), ...max.map(r4)] };
}

/* ───────── GLB ───────── */

async function writeGlb(file, pieces, lodName) {
  // compacta los vértices usados por este LOD en un único búfer para la capa
  let nv = 0; let ni = 0;
  const maps = pieces.map((pc) => {
    const idx = pc.lod[lodName];
    const map = new Map();
    for (let i = 0; i < idx.length; i += 1) if (!map.has(idx[i])) map.set(idx[i], nv + map.size);
    nv += map.size; ni += idx.length;
    return map;
  });
  const pos = new Float32Array(nv * 3);
  const nrm = new Float32Array(nv * 3);
  const col = new Uint8Array(nv * 4);
  const pc2 = new Uint16Array(nv * 2);
  const ind = new Uint32Array(ni);
  // normales de cada malla de origen con todos sus triángulos de este LOD (sin costuras entre regiones de la piel)
  const srcNormals = new Map();
  for (const pc of pieces) {
    if (srcNormals.has(pc.part)) continue;
    const all = pieces.filter((q) => q.part === pc.part).map((q) => q.lod[lodName]);
    const cat = new Uint32Array(all.reduce((s2, a) => s2 + a.length, 0));
    let o = 0;
    for (const a of all) { cat.set(a, o); o += a.length; }
    srcNormals.set(pc.part, vertexNormals(pc.part.pos, cat));
  }
  let i0 = 0;
  pieces.forEach((pc, pi) => {
    const sn = srcNormals.get(pc.part);
    const idx = pc.lod[lodName];
    const map = maps[pi];
    for (const [src, dst] of map) {
      pos.set(pc.part.pos.subarray(src * 3, src * 3 + 3), dst * 3);
      nrm.set(sn.subarray(src * 3, src * 3 + 3), dst * 3);
      col.set(pc.part.col.subarray(src * 3, src * 3 + 3), dst * 4);
      col[dst * 4 + 3] = pc.part.ao ? pc.part.ao[src] : 255;
      pc2[dst * 2] = pc.id;
      pc2[dst * 2 + 1] = pc.part.mat[src];
    }
    for (let i = 0; i < idx.length; i += 1) ind[i0 + i] = map.get(idx[i]);
    i0 += idx.length;
  });

  const doc = new Document();
  const buffer = doc.createBuffer();
  const acc = (type, array, normalized = false) => doc.createAccessor().setType(type).setArray(array).setBuffer(buffer).setNormalized(normalized);
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', acc('VEC3', pos))
    .setAttribute('NORMAL', acc('VEC3', nrm))
    .setAttribute('COLOR_0', acc('VEC4', col, true))
    .setAttribute('_PC', acc('VEC2', pc2))
    .setIndices(acc('SCALAR', ind));
  const mesh = doc.createMesh(path.basename(file)).addPrimitive(prim);
  const node = doc.createNode('capa').setMesh(mesh);
  doc.createScene().addChild(node);
  // meshopt 'high': reordena, cuantiza posiciones (14 bits) y normales (8 bits, octaédricas) y comprime.
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  const io = new NodeIO().registerExtensions([KHRMeshQuantization, EXTMeshoptCompression]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  const glb = await io.writeBinary(doc);
  fs.writeFileSync(file, glb);
  return { bytes: glb.byteLength, tris: ind.length / 3 };
}

/* ───────── puntos de referencia ───────── */

function landmarks3d(c) {
  const L = c.landmarks();
  const out = {};
  for (const [k, v] of Object.entries(L)) if (Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)) out[k] = toModel(...v).map((x) => Math.round(x * 10000) / 10000);
  return out;
}
