// Motor de MONTONES de palabras (puro, sin r3f). Un montón es un grupito de cajas
// apiladas en pocas columnas con alturas IRREGULARES (aspecto de "montón", no de
// rejilla) y ligero jitter visual. Cada caja lleva una palabra del pool; pocas son
// VÁLIDAS (categoría principal/secundaria), el resto son neutras (decoys).
//
// Las cajas NO se mueven salvo por GRAVEDAD: al destruir una, las de su columna por
// encima caen para rellenar el hueco (column-settling determinista; sin motor de
// físicas). La verdad lógica es (col,row)+targetY; la `y` animada es solo visual (la
// integra WordWall). Determinismo por mulberry32 (semilla por partida).
import { CELL, CAM } from './config';

let PILE_ID = 0;
let BOX_ID = 0;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const stepX = CELL.w + CELL.gap;
const stepY = CELL.h + CELL.gap;

// Posición local de una celda (fila 0 = INFERIOR, col 0 = izquierda).
export function cellLocal(col, row, cols) {
  return { x: (col - (cols - 1) / 2) * stepX, y: CELL.baseY + row * stepY };
}

// Yaw para que un punto (x,z) ENCARE la cámara (y para que la cámara lo encare):
// la cámara está fija en CAM.pos mirando -Z. faceYaw(pilePos) === yaw de la cámara
// para mirarlo (ver pilePos en layoutPiles).
export function faceYaw(x, z) {
  return Math.atan2(CAM.pos[0] - x, CAM.pos[2] - z);
}

function belowSameText(w, col, row, text) {
  if (row === 0) return false;
  const id = w.slots[col + (row - 1) * w.cols];
  if (id < 0) return false;
  const b = w.boxes.get(id);
  return !!b && b.text === text;
}

function shuffleIndices(n, rng) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Reparte `total` cajas en `cols` columnas con alturas irregulares (cada una ≥1,
// capada a maxRows) → silueta de montón.
function distributeHeights(total, cols, rng, maxRows) {
  const h = new Array(cols).fill(1);
  let rem = total - cols;
  let guard = 0;
  while (rem > 0 && guard < 1000) {
    const c = Math.floor(rng() * cols);
    if (h[c] < maxRows) { h[c] += 1; rem -= 1; }
    guard += 1;
  }
  return h;
}

// Construye (o recicla, si se pasa `pile`) un montón. `validBudget` = nº de cajas
// VÁLIDAS (pocas); el resto son neutras. Evita repetir palabra justo debajo.
export function buildPile(pool, rng, {
  cols = 3, total = 7, validBudget = 2, x = 0, y = 0, z = 0, pile,
} = {}) {
  const w = pile || { id: ++PILE_ID };
  const valids = (pool && pool.validWords) || [];
  const neutrals = (pool && pool.neutralWords) || [];

  total = Math.max(1, total);
  cols = Math.max(1, Math.min(cols, total));
  const maxRows = Math.max(2, Math.ceil(total / cols) + 1);
  const heights = distributeHeights(total, cols, rng, maxRows);
  const rows = Math.max(...heights);

  w.cols = cols; w.rows = rows; w.x = x; w.y = y; w.z = z;
  w.slots = new Int32Array(cols * rows).fill(-1);
  w.boxes = new Map();

  // Celdas reales del montón; elegir cuáles serán VÁLIDAS (las primeras tras barajar).
  const cells = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < heights[c]; r++) cells.push({ c, r });
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = cells[i]; cells[i] = cells[j]; cells[j] = t;
  }
  let validCount = valids.length ? Math.min(validBudget, cells.length) : 0;
  if (!neutrals.length) validCount = cells.length; // sin decoys → todas válidas
  const validSet = new Set(cells.slice(0, validCount).map((p) => `${p.c},${p.r}`));

  const vOrder = shuffleIndices(valids.length, rng);
  const nOrder = shuffleIndices(neutrals.length, rng);
  let vi = 0; let ni = 0;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < heights[c]; r++) {
      const wantValid = validSet.has(`${c},${r}`);
      const useValid = (wantValid && valids.length) || !neutrals.length;
      const src = useValid ? valids : neutrals;
      const order = useValid ? vOrder : nOrder;
      let wd; let tries = 0;
      do {
        const k = useValid ? (vi++ % order.length) : (ni++ % order.length);
        wd = src[order[k]];
        tries += 1;
      } while (tries < order.length && wd && belowSameText(w, c, r, wd.text));
      if (!wd) continue;
      const id = ++BOX_ID;
      const local = cellLocal(c, r, cols);
      w.slots[c + r * cols] = id;
      w.boxes.set(id, {
        id, col: c, row: r,
        x: local.x + (rng() - 0.5) * CELL.w * 0.18, // jitter horizontal (montón)
        z: (rng() - 0.5) * CELL.depth * 1.4,
        jrot: (rng() - 0.5) * 0.10,                 // ligera inclinación
        y: local.y, targetY: local.y, vy: 0, settling: false,
        text: wd.text, value: wd.value || 0, valid: !!wd.valid, category: wd.category,
      });
    }
  }
  return w;
}

// Destruye una caja y RECOMPACTA su columna hacia abajo: las que quedan por encima
// del hueco bajan a la primera fila libre (gravedad). Devuelve las cajas desplazadas
// (marcadas settling) para que el render anime su caída.
export function destroyBox(w, boxId) {
  const box = w && w.boxes.get(boxId);
  if (!box) return [];
  const { col } = box;
  w.boxes.delete(boxId);
  w.slots[col + box.row * w.cols] = -1;

  const moved = [];
  let write = 0;
  for (let r = 0; r < w.rows; r += 1) {
    const idx = col + r * w.cols;
    const id = w.slots[idx];
    if (id < 0) continue;
    if (r !== write) {
      w.slots[idx] = -1;
      w.slots[col + write * w.cols] = id;
      const b = w.boxes.get(id);
      if (b) {
        b.row = write;
        b.targetY = cellLocal(col, write, w.cols).y;
        b.settling = true; // caerá hasta targetY (WordWall integra la gravedad)
        moved.push(b);
      }
    }
    write += 1;
  }
  return moved;
}

// Quita hasta `k` cajas VÁLIDAS del montón (penalización al disparar una neutra):
// no resta puntos pero reduce los objetivos disponibles. Devuelve cuántas quitó.
export function removeValidBoxes(w, exceptId, k) {
  if (!w || !w.boxes) return 0;
  const ids = [];
  w.boxes.forEach((b) => { if (b.valid && b.id !== exceptId) ids.push(b.id); });
  const n = Math.min(k, ids.length);
  for (let i = 0; i < n; i += 1) destroyBox(w, ids[i]);
  return n;
}

export const pileEmpty = (w) => !w || !w.boxes || w.boxes.size === 0;
export const pileHasValid = (w) => {
  if (!w || !w.boxes) return false;
  for (const b of w.boxes.values()) if (b.valid) return true;
  return false;
};

// Inyecta una palabra (respuesta de definición) en una caja del montón SIN marcarla:
// si ya está, no hace nada; si no, reemplaza preferentemente una caja NEUTRA (para no
// borrar un objetivo válido). Devuelve {boxId, saved} para restaurarla al expirar.
export function injectWord(w, word, value) {
  if (!w || !w.boxes || !w.boxes.size) return null;
  const lw = word.toLowerCase();
  for (const b of w.boxes.values()) if (b.text.toLowerCase() === lw) return { boxId: b.id, saved: null };
  let pick = null;
  for (const b of w.boxes.values()) { if (!b.valid) { pick = b; break; } } // preferir neutra
  if (!pick) pick = w.boxes.values().next().value;
  if (!pick) return null;
  const saved = { text: pick.text, value: pick.value, valid: pick.valid, category: pick.category };
  pick.text = word; pick.value = value; pick.valid = false; pick.category = '__def__';
  return { boxId: pick.id, saved };
}

export function restoreBox(w, boxId, saved) {
  if (!w || !saved) return;
  const b = w.boxes.get(boxId);
  if (b) { b.text = saved.text; b.value = saved.value; b.valid = saved.valid; b.category = saved.category; }
}

// Posición de un montón a un ángulo `a` (rad) respecto a la cámara, a distancia
// aleatoria. Cumple faceYaw(x,z) === a (la cámara gira a ese yaw para encararlo y el
// montón se orienta de frente con la misma rotación).
function pilePos(a, layout, rng) {
  const d = layout.distMin + rng() * (layout.distMax - layout.distMin);
  return {
    x: CAM.pos[0] - Math.sin(a) * d,
    z: CAM.pos[2] - Math.cos(a) * d,
    y: layout.baseYMin + rng() * (layout.baseYMax - layout.baseYMin),
    angle: a,
  };
}

// Reparte n montones por un arco a ambos lados de la cámara (con jitter para que no
// queden perfectamente alineados en yaw).
export function layoutPiles(n, rng, layout) {
  const span = layout.angleMax * 2;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const base = -layout.angleMax + span * ((i + 0.5) / n);
    const a = base + (rng() - 0.5) * (span / n) * 0.6;
    out.push(pilePos(a, layout, rng));
  }
  return out;
}

// Posición nueva al azar dentro del arco (para reubicar un montón agotado).
export function randomPilePos(rng, layout) {
  return pilePos((rng() * 2 - 1) * layout.angleMax, layout, rng);
}
