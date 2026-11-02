// Modelo 3D del cuerpo humano: índice de capas y piezas, y carga de cada capa
// (GLB comprimido con meshopt, generado por tools/build-anatomy-3d.mjs).
//
// Cada capa es UNA malla (una llamada de dibujo) con, por vértice: posición,
// normal, color (albedo + oclusión ambiental en alfa) y aPC = (número de pieza,
// material). Las piezas se encienden, tiñen, ocultan o mueven desde una textura
// de datos (ver material.js), así que una capa de 200 piezas sigue siendo barata.
import * as THREE from 'three';

export const MODEL_BASE = '/data/anatomia3d/index.json';
export const LAYER_IDS = ['piel', 'musculos', 'musculos-prof', 'organos', 'vasos', 'nervios', 'esqueleto'];
export const MAT_CODES = ['skin', 'bone', 'cartilage', 'tooth', 'muscle', 'tendon', 'artery', 'vein', 'nerve', 'brain', 'organ'];

let indexPromise = null;

// Índice: { layers: { id: { parts: [{ k, up, side, c, b }], files: { l, h }, tris, bytes } }, order, landmarks, credits }
// Se añade a cada capa: byKey (clave → [números de pieza]) y groups (clave de grupo → [números]).
export function loadIndex3d() {
  if (!indexPromise) {
    indexPromise = fetch(MODEL_BASE)
      .then((r) => {
        if (!r.ok) throw new Error(`index 3D: ${r.status}`);
        return r.json();
      })
      .then(prepareIndex3d)
      .catch((e) => {
        indexPromise = null;
        throw e;
      });
  }
  return indexPromise;
}

// Añade a cada capa id, número de pieza (n) y byKey (también lo usan los tests).
export function prepareIndex3d(idx) {
  for (const [id, layer] of Object.entries(idx.layers)) {
    layer.id = id;
    layer.byKey = new Map();
    layer.parts.forEach((p, i) => {
      const n = i + 1;
      p.n = n;
      for (const k of [p.k, ...(p.up || [])]) {
        if (!layer.byKey.has(k)) layer.byKey.set(k, []);
        layer.byKey.get(k).push(n);
      }
    });
  }
  return idx;
}

/* ───────── carga de capas ───────── */

let loaderPromise = null;
async function getLoader() {
  if (!loaderPromise) {
    loaderPromise = Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ]).then(async ([{ GLTFLoader }, { MeshoptDecoder }]) => {
      await MeshoptDecoder.ready;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      return loader;
    });
  }
  return loaderPromise;
}

const geomCache = new Map(); // `${capa}.${lod}` → Promise<{ geometry, matrix }>

// Geometría de una capa en un nivel de detalle ('l' ligero, 'h' detalle).
// matrix: la del nodo del GLB (descuantiza las posiciones a metros).
export function loadLayerGeometry(index, layerId, lod = 'l') {
  const key = `${layerId}.${lod}`;
  if (!geomCache.has(key)) {
    const url = index.layers[layerId]?.files?.[lod];
    if (!url) return Promise.reject(new Error(`capa 3D sin fichero: ${key}`));
    const p = getLoader()
      .then((loader) => loader.loadAsync(url))
      .then((gltf) => {
        let mesh = null;
        gltf.scene.traverse((o) => { if (!mesh && o.isMesh) mesh = o; });
        if (!mesh) throw new Error(`capa 3D vacía: ${key}`);
        mesh.updateWorldMatrix(true, false);
        const g = mesh.geometry;
        // nombres propios para el sombreado (el cargador los llama color y _pc)
        g.setAttribute('aCol', g.getAttribute('color'));
        g.deleteAttribute('color');
        g.setAttribute('aPC', g.getAttribute('_pc'));
        g.deleteAttribute('_pc');
        g.computeBoundingSphere();
        g.boundingSphere.applyMatrix4(mesh.matrixWorld);
        return { geometry: g, matrix: mesh.matrixWorld.clone() };
      })
      .catch((e) => {
        geomCache.delete(key);
        throw e;
      });
    geomCache.set(key, p);
  }
  return geomCache.get(key);
}

/* ───────── consultas ───────── */

// Números de pieza de una clave en una capa (la pieza o todas las que contiene).
export function partsOf(layer, key) {
  return layer?.byKey.get(key) || [];
}

// Centro y caja de un conjunto de piezas (para encuadrar la cámara).
export function boundsOf(layer, nums) {
  const box = new THREE.Box3();
  for (const n of nums) {
    const b = layer.parts[n - 1]?.b;
    if (b) box.union(new THREE.Box3(new THREE.Vector3(b[0], b[1], b[2]), new THREE.Vector3(b[3], b[4], b[5])));
  }
  return box;
}

// Claves que se pueden tocar en una capa: piezas y grupos (cráneo, intestino delgado…).
export function keysOf(layer) {
  return [...layer.byKey.keys()];
}
