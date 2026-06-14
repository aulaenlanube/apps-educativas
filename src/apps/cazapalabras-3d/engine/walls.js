// Motor de MUROS de palabras (puro, sin r3f). Un muro es una rejilla cols×rows de
// celdas; cada celda ocupada tiene una "caja" con una palabra del pool. Las cajas
// no se mueven salvo por GRAVEDAD: al destruir una, las de su columna por encima
// caen para rellenar el hueco (column-settling determinista; sin motor de físicas).
// La verdad lógica es (col,row)+targetY; la `y` animada es solo visual (la integra
// WordWall). Determinismo por mulberry32 (semilla por partida).
import { CELL, CAM } from './config';

let WALL_ID = 0;
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
// la cámara está fija en CAM.pos mirando -Z.
export function faceYaw(x, z) {
  return Math.atan2(CAM.pos[0] - x, CAM.pos[2] - z);
}

function belowSame(w, col, row, text) {
  if (row === 0) return false;
  const id = w.slots[col + (row - 1) * w.cols];
  if (id < 0) return false;
  const b = w.boxes.get(id);
  return !!b && b.text === text;
}

// Construye (o recicla, si se pasa `wall`) un muro lleno de palabras barajadas del
// pool, mezclando categorías que puntúan y que penalizan. Evita la misma palabra
// justo debajo en una columna.
export function buildWall(pool, rng, { cols, rows, x, y, z, wall } = {}) {
  const w = wall || { id: ++WALL_ID };
  w.cols = cols; w.rows = rows; w.x = x; w.y = y; w.z = z;
  w.slots = new Int32Array(cols * rows).fill(-1);
  w.boxes = new Map();
  const words = pool && pool.words ? pool.words : [];
  if (!words.length) return w;

  const order = words.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  let oi = 0;
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      let wd; let tries = 0;
      do { wd = words[order[oi % order.length]]; oi += 1; tries += 1; }
      while (tries < order.length && belowSame(w, cc, r, wd.text));
      const id = ++BOX_ID;
      const local = cellLocal(cc, r, cols);
      w.slots[cc + r * cols] = id;
      w.boxes.set(id, {
        id, col: cc, row: r, x: local.x, y: local.y, targetY: local.y, vy: 0, settling: false,
        text: wd.text, points: wd.points, penalty: !!wd.penalty, category: wd.category,
      });
    }
  }
  return w;
}

// Destruye una caja y RECOMPACTA su columna hacia abajo: las que quedan por
// encima del hueco bajan a la primera fila libre (gravedad). Devuelve las cajas
// desplazadas (marcadas settling) para que el render anime su caída.
export function destroyBox(w, boxId) {
  const box = w.boxes.get(boxId);
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

export const wallEmpty = (w) => !w.boxes || w.boxes.size === 0;

// Inyecta una palabra (respuesta de definición) en una caja del muro SIN marcarla:
// si ya está, no hace nada; si no, reemplaza una caja reemplazable (preferentemente
// que NO penalice y en fila no superior, para que se vea). Devuelve {boxId, saved}
// para poder restaurar la caja original al expirar/acertar.
export function injectWord(w, word, points) {
  if (!w || !w.boxes || !w.boxes.size) return null;
  const lw = word.toLowerCase();
  for (const b of w.boxes.values()) {
    if (b.text.toLowerCase() === lw) return { boxId: b.id, saved: null };
  }
  let pick = null;
  const mid = Math.floor(w.rows / 2);
  for (const b of w.boxes.values()) {
    if (b.penalty) continue;
    if (!pick) pick = b;
    if (b.row <= mid) { pick = b; break; }
  }
  if (!pick) pick = w.boxes.values().next().value;
  if (!pick) return null;
  const saved = { text: pick.text, points: pick.points, penalty: pick.penalty, category: pick.category };
  pick.text = word; pick.points = points; pick.penalty = false; pick.category = '__def__';
  return { boxId: pick.id, saved };
}

export function restoreBox(w, boxId, saved) {
  if (!w || !saved) return;
  const b = w.boxes.get(boxId);
  if (b) { b.text = saved.text; b.points = saved.points; b.penalty = saved.penalty; b.category = saved.category; }
}

// Posiciones x simétricas para una "estación" de n muros.
export function layoutXs(n, spread) {
  const out = [];
  for (let i = 0; i < n; i += 1) out.push((i - (n - 1) / 2) * spread);
  return out;
}
