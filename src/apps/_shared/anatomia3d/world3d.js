// Modo 3D de las apps del cuerpo: amplía el mundo de láminas con ámbitos 3D
// ('3d:<lámina>') que el motor de juego usa igual que una lámina (entradas por
// clave, nombres, grupos), pero que se pintan con el visor 3D (scope.View).
//
// Las preguntas se generan como siempre sobre láminas y to3d() pasa a 3D las de
// localizar y las de «¿qué es esto?» cuyas estructuras existen en el modelo.
import { BY_KEY } from '../anatomia/data/structures';
import { loadIndex3d } from './model';
import { SCENES, PLATE_SCENE, DIRS, BODY_PLATES, MOVES3D, sceneIdOf, plateOfScene } from './scenes';

const GP = new Set(['arterias', 'venas', 'nervios']);
const EMPTY = new Map();
let Map3DViewLazy = null;

// Clave que se muestra según el nivel: si la pieza es de un nivel superior, su grupo
// (en 2.º de Primaria el frontal es «el cráneo»).
export function keyForLevel(part, lv) {
  if (!part) return null;
  const chain = [part.k, ...(part.up || [])];
  return chain.find((k) => (BY_KEY[k]?.l ?? 9) <= lv) || part.k;
}

// cont = grupo con el que se juega a «toca cualquier…» (como en las láminas)
const contOf = (k, part) => (part?.up || []).find((u) => GP.has(u)) || BY_KEY[k]?.grp || BY_KEY[k]?.s;

function unionBox(boxes) {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const x of boxes) for (let i = 0; i < 3; i += 1) { b[i] = Math.min(b[i], x[i]); b[i + 3] = Math.max(b[i + 3], x[i + 3]); }
  return b;
}

// Cámara que encuadra una caja desde una dirección (fov vertical 32°).
export function cameraFor(box, dir, pad = 1.25) {
  const c = [(box[0] + box[3]) / 2, (box[1] + box[4]) / 2, (box[2] + box[5]) / 2];
  const r = Math.max(0.06, Math.hypot(box[3] - box[0], box[4] - box[1], box[5] - box[2]) / 2);
  const d = DIRS[dir] || DIRS.front;
  const l = Math.hypot(...d);
  const dist = Math.min(4.2, (r / Math.sin((16 * Math.PI) / 180)) * pad * 0.82);
  return { camera: [c[0] + (d[0] / l) * dist, c[1] + (d[1] / l) * dist, c[2] + (d[2] / l) * dist], target: c };
}

function makeScope3d(world, index, plateId) {
  const [sceneId, dir, side] = PLATE_SCENE[plateId];
  const scene = SCENES[sceneId];
  const entries = new Map();
  for (const lid of scene.pick) {
    const layer = index.layers[lid];
    if (!layer) continue;
    const allowed = scene.only?.[lid] ? new Set(scene.only[lid].flatMap((k) => layer.byKey.get(k) || [])) : null;
    for (const [k, nums] of layer.byKey) {
      const ns = allowed ? nums.filter((n) => allowed.has(n)) : nums;
      if (!ns.length || !BY_KEY[k] || entries.has(k)) continue;
      const parts = ns.map((n) => layer.parts[n - 1]);
      const box = unionBox(parts.map((p) => p.b));
      const contains = [...new Set(parts.map((p) => p.k).filter((x) => x !== k))];
      entries.set(k, {
        key: k,
        layerId: lid,
        get name() { return world.nameOf(k); },
        cont: contOf(k, parts.find((p) => p.k === k) || parts[0]),
        centroid: [(box[0] + box[3]) / 2, (box[1] + box[4]) / 2, (box[2] + box[5]) / 2],
        box,
        contains,
        covered: false,
        area: 1,
      });
    }
  }
  // encuadre: las estructuras de la lámina 2D que existen aquí (cuerpo entero en las de cuerpo)
  let cam;
  if (BODY_PLATES.has(plateId)) {
    cam = cameraFor([-0.4, 0, -0.2, 0.4, 1.76, 0.2], dir, 1.08);
  } else {
    const keys = (world.index?.plates?.[plateId]?.keys || []).filter((k) => entries.has(k));
    const boxes = [];
    for (const k of keys) {
      const e = entries.get(k);
      const layer = index.layers[e.layerId];
      const nums = layer.byKey.get(k) || [];
      for (const n of nums) {
        const p = layer.parts[n - 1];
        if (!side || !p.side || p.side === side) boxes.push(p.b);
      }
    }
    cam = cameraFor(boxes.length ? unionBox(boxes) : [-0.4, 0, -0.2, 0.4, 1.76, 0.2], dir, 1.15);
  }
  const views = { world: { ...cam, x: 0, y: 0, w: 1, h: 1 }, full: { ...cam, x: 0, y: 0, w: 1, h: 1 } };
  return {
    id: sceneIdOf(plateId),
    is3d: true,
    plateId,
    scene,
    views,
    entries,
    layer: () => entries,
    nameOf: (k) => world.nameOf(k),
    groupName: (g) => world.groupName(g),
    neighborsOf: () => [],
    features: EMPTY,
    featureView: () => views.world,
    focusView: () => views.world,
    around: () => views.world,
    className: 'ana-map ana-map--3d',
    get View() { return Map3DViewLazy; },
  };
}

// Añade el modo 3D a un mundo de láminas (una vez). View: componente Map3DView;
// index: el índice 3D ya preparado (tests); si no, se descarga.
export async function attach3d(world, View, preloaded = null) {
  if (world.index3d) return world;
  const index = preloaded || await loadIndex3d();
  Map3DViewLazy = View;
  const scopes = new Map();
  const baseScope = world.scope.bind(world);
  const baseLayer = world.layer.bind(world);
  world.index3d = index;
  world.scope = (id) => {
    const plate = plateOfScene(id);
    if (!plate) return baseScope(id);
    if (!PLATE_SCENE[plate]) return world;
    if (!scopes.has(id)) scopes.set(id, makeScope3d(world, index, plate));
    return scopes.get(id);
  };
  world.layer = (id) => (plateOfScene(id) ? (world.scope(id).entries || EMPTY) : baseLayer(id));
  return world;
}

/* ───────── preguntas ───────── */

const has3d = (world, plate, keys) => {
  if (!world.index3d || !PLATE_SCENE[plate]) return false;
  const s = world.scope(sceneIdOf(plate));
  return keys.every((k) => s.entries?.has(k));
};

// Pasa una pregunta a 3D si se puede (si no, la deja como está).
export function to3d(q, world) {
  if (!world?.index3d) return q;
  if ((q.kind === 'locate' || q.kind === 'sequence') && q.layer) {
    // las de Viaje traen estela (claves de las paradas anteriores): también tienen que estar
    const keys = [...(q.kind === 'sequence' ? q.stops : [q.target]), ...(q.trail || []), ...(q.robotFrom ? [q.robotFrom] : [])];
    if (!has3d(world, q.layer, keys)) return q;
    const { viewBox, ...rest } = q;
    return { ...rest, layer: sceneIdOf(q.layer), plate2d: q.layer };
  }
  if (q.kind === 'locate-group' && q.layer) {
    if (!PLATE_SCENE[q.layer] || !world.index3d) return q;
    const s = world.scope(sceneIdOf(q.layer));
    if (![...s.entries.values()].some((e) => e.cont === q.target)) return q;
    const { viewBox, ...rest } = q;
    return { ...rest, layer: sceneIdOf(q.layer), plate2d: q.layer };
  }
  // movimientos: el esqueleto 3D articulado en lugar del maniquí
  if (q.subject?.type === 'move' && MOVES3D[q.subject.fig]) return { ...q, subject: { ...q.subject, type: 'move3d', wide: true } };
  if (q.subject?.type === 'map' && q.subject.layer && has3d(world, q.subject.layer, [q.subject.key, ...(q.trail || [])])) {
    const { viewBox, ...subject } = q.subject;
    return { ...q, subject: { ...subject, layer: sceneIdOf(q.subject.layer), interactive: true, plate2d: q.subject.layer } };
  }
  return q;
}
