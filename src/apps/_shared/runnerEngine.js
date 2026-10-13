// Education Dash (Runner): motor del juego, sin React (lo usa Runner.jsx y lo
// prueban los tests con simulaciones: src/__tests__/runner-engine.test.js).
//
// Unidades: px y frames de 60 Hz (el componente pasa timeScale = dt / 16,67).
// y = altura sobre el suelo (bottom). x = borde izquierdo en la pista.
//
// La pista se genera por BLOQUES. Cada bloque se dibuja a partir de lo que
// permite el salto con la velocidad y la gravedad de ESTA partida:
//   H = altura máxima del salto = J² / 2G
//   T = frames en el aire        = 2J / G
//   D = distancia de un salto    = T · velocidad
// así los bloques se pueden superar con cualquier ajuste (y los que no caben con
// un ajuste extremo no salen). El test comprueba con un buscador de saltos que
// cada bloque se puede pasar recogiendo sus palabras correctas.

export const CUBE = 40;
export const JUMP = 18;
export const PLAYER_X = 100;
export const MAX_Y = 290;                 // techo útil de la pista (450 - suelo 60 - margen)
const ITEM_H = 40;
const PLAT_H = 34;
const RAMP_MAX = 0.3;                     // la velocidad sube hasta un +30 %…
const RAMP_DIST = 70000;                  // …a lo largo de ~2,5 min de carrera
const DESPAWN_X = -280;

export const physicsOf = (speed, gravity, jump = JUMP) => {
  const H = (jump * jump) / (2 * gravity);
  const T = (2 * jump) / gravity;
  return { H, T, D: T * speed };
};

// Rectángulo del jugador (más estrecho que el cubo: perdona los roces)
export const playerRect = (p) => ({ x: p.x + 8, y: p.y, width: CUBE - 16, height: CUBE - 4 });
const spikeRect = (e) => ({ x: e.x + e.width * 0.25, y: e.y, width: e.width * 0.5, height: e.height * 0.6 });
const overlap = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

// Ancho de la ficha según el texto (las palabras largas no se salen)
export const itemWidth = (text = '') => Math.round(Math.min(176, Math.max(92, 58 + text.length * 8.5)));

const pick = (rnd, list) => list[Math.floor(rnd() * list.length)];
const between = (rnd, a, b) => a + rnd() * (b - a);

/* ───────────────────────── Bloques ─────────────────────────
   Cada bloque recibe ctx = { H, D, rnd, word(valid?) } y devuelve
   { ents: [...], len } con x relativas al inicio del bloque. word() sin
   argumento usa el reparto automático; word(true|false) fuerza el tipo.     */

const item = (w, x, y, extra = {}) => ({ type: 'item', text: w.text, valid: w.valid, category: w.category, x, y, width: itemWidth(w.text), height: ITEM_H, ...extra });
const platform = (x, y, width, extra = {}) => ({ type: 'platform', x, y, width, height: PLAT_H, ...extra });
const spike = (x, w = 40, h = 40) => ({ type: 'spike', x, y: 0, width: w, height: h });

const SPIKE_SIZES = [[30, 30], [40, 40], [40, 40], [44, 52]];

export const CHUNKS = {
  // Pinchos: 1-3 según lo largo que sea el salto
  spikes: {
    weight: 2.2,
    ok: ({ D }) => D >= 70,
    build: ({ D, H, rnd }) => {
      const max = Math.max(1, Math.min(3, Math.floor((D * 0.45) / 42)));
      const n = 1 + Math.floor(rnd() * max);
      let x = 0;
      const ents = [];
      for (let i = 0; i < n; i++) {
        const [w, h] = pick(rnd, SPIKE_SIZES);
        const hh = Math.min(h, H * 0.42);
        ents.push(spike(x, w, hh));
        x += w;
      }
      return { ents, len: x };
    },
  },
  // Palabra flotando: salta si es de la misión, sigue corriendo si no
  float: {
    weight: 2.4,
    ok: ({ H }) => H >= 90,
    build: ({ H, rnd, word }) => {
      const w = word();
      const it = item(w, 0, Math.min(MAX_Y, H * between(rnd, 0.42, 0.62)));
      return { ents: [it], len: it.width };
    },
  },
  // Palabra en el suelo: si es correcta, atraviésala; si no, sáltala
  ground: {
    weight: 1.6,
    ok: ({ D, H }) => D >= 230 && H >= 80,
    build: ({ word }) => {
      const it = item(word(), 0, 0);
      return { ents: [it], len: it.width };
    },
  },
  // Cruce: una palabra abajo y otra arriba, una correcta y otra no. ¿Saltas?
  fork: {
    weight: 2.4,
    ok: ({ D, H }) => D >= 240 && H >= 130,
    build: ({ H, rnd, word }) => {
      const upValid = rnd() < 0.5;
      const up = word(upValid);
      const down = word(!upValid);
      const low = item(down, 0, 0);
      const high = item(up, 0, Math.min(MAX_Y, H * 0.62), { fork: true });
      // la de arriba un poco más ancha y centrada sobre la de abajo: si saltas
      // por encima de la de abajo, te la llevas seguro
      high.width = Math.max(high.width, low.width) + 36;
      high.x = low.x - 18;
      low.fork = true;
      return { ents: [low, high], len: high.width };
    },
  },
  // Escalón: plataforma con palabra encima. Correcta → sube; incorrecta → pasa por debajo
  step: {
    weight: 1.8,
    ok: ({ H, D }) => H >= 110 && D >= 150,
    build: ({ H, rnd, word }) => {
      const w = word();
      const py = Math.min(MAX_Y - 120, H * between(rnd, 0.32, 0.42));
      const pw = 180;
      const p = platform(0, py, pw);
      const it = item(w, (pw - itemWidth(w.text)) / 2 + 20, py + PLAT_H + 4);
      const ents = [p, it];
      // si la palabra es correcta, un pincho debajo obliga a subir
      if (w.valid && rnd() < 0.55) ents.push(spike(pw * 0.45, 40, Math.min(40, py - 2)));
      return { ents, len: pw };
    },
  },
  // Escalera: 2-3 plataformas subiendo y la palabra arriba del todo
  stairs: {
    weight: 1.3,
    ok: ({ H, D }) => H >= 130 && D >= 200,
    build: ({ H, D, rnd, word }) => {
      const k = H >= 150 ? 2 + Math.floor(rnd() * 2) : 2;
      const rise = Math.min(H * 0.5, 72);
      const dx = Math.min(210, Math.max(140, D * 0.6));
      const pw = 128;
      const ents = [];
      for (let i = 0; i < k; i++) ents.push(platform(i * dx, rise * (i + 1) - PLAT_H, pw, { stair: i }));
      const top = rise * k;
      const w = word();
      const x = (k - 1) * dx + (pw - itemWidth(w.text)) / 2 + 10;
      ents.push(item(w, x, top + 4));
      if (w.valid) ents.push(spike((k - 1) * dx + 30, 40, 40));
      return { ents, len: (k - 1) * dx + pw };
    },
  },
  // Plataforma que sube y baja con la palabra encima: hay que medir el salto
  lift: {
    weight: 1.3,
    ok: ({ H, D }) => H >= 130 && D >= 170,
    build: ({ H, rnd, word }) => {
      const w = word();
      const base = Math.min(MAX_Y - 140, H * 0.36);
      const amp = Math.min(H * 0.16, 30);
      const pw = 170;
      const p = platform(0, base, pw, {
        lift: true, baseY: base, amp, freq: (2 * Math.PI) / between(rnd, 120, 170), phase: rnd() * Math.PI * 2,
      });
      const it = item(w, (pw - itemWidth(w.text)) / 2, base + PLAT_H + 4, { ride: p, dy: 4 });
      return { ents: [p, it], len: pw };
    },
  },
  // Pincho, palabra, pincho: ritmo
  gauntlet: {
    weight: 1.4,
    ok: ({ D, H }) => D >= 220 && H >= 110,
    build: ({ D, H, word }) => {
      const gap = Math.max(170, D * 0.95);
      const w = word();
      const it = item(w, gap, Math.min(MAX_Y, H * 0.5));
      return { ents: [spike(0), it, spike(gap * 2 + it.width - 40)], len: gap * 2 + it.width };
    },
  },
  // Dos palabras seguidas a distinta altura
  duo: {
    weight: 1.5,
    ok: ({ D, H }) => D >= 200 && H >= 110,
    build: ({ D, H, rnd, word }) => {
      const a = item(word(), 0, H * between(rnd, 0.4, 0.55));
      const b = item(word(), a.width + Math.max(150, D * 0.75), Math.min(MAX_Y, H * between(rnd, 0.45, 0.62)));
      return { ents: [a, b], len: b.x + b.width };
    },
  },
  // Estrella de invencibilidad sobre dos plataformas (rara)
  star: {
    weight: 0.35,
    ok: ({ H, D }) => H >= 130 && D >= 200,
    build: ({ H, D }) => {
      const r = Math.min(H * 0.5, 72);
      const dx = Math.min(200, Math.max(150, D * 0.6));
      return {
        ents: [
          platform(0, r - PLAT_H, 120),
          platform(dx, r * 2 - PLAT_H, 140),
          { type: 'star', x: dx + 50, y: r * 2 + 30, width: 40, height: 40 },
        ],
        len: dx + 140,
      };
    },
  },
};

const CHUNK_IDS = Object.keys(CHUNKS);

/* ───────────────────────── Mundo ───────────────────────── */

export function createWorld({ speed = 8, gravity = 1, picker, rnd = Math.random, viewWidth = 1000, chunks, ramp = true } = {}) {
  return {
    baseSpeed: speed,
    ramp,
    speed,
    gravity,
    picker,
    rnd,
    t: 0,
    travelled: 0,
    spawnX: Math.max(1000, viewWidth + 40),
    untilNext: 420,           // primer bloque enseguida
    first: true,
    lastChunk: null,
    nextId: 1,
    chunks: chunks || CHUNK_IDS,
    player: { x: PLAYER_X, y: 0, vy: 0, onPlatform: false },
    entities: [],
  };
}

export function jump(w) {
  const p = w.player;
  if (p.y <= 0.5 || p.onPlatform) {
    p.vy = JUMP;
    p.onPlatform = false;
    return true;
  }
  return false;
}

function chooseChunk(w, ctx) {
  const okIds = w.chunks.filter((id) => CHUNKS[id].ok(ctx));
  if (!okIds.length) return null;
  // el primer bloque siempre trae una palabra correcta fácil de coger
  if (w.first) {
    const firstId = ['float', 'ground', 'step'].find((id) => okIds.includes(id));
    if (firstId) return firstId;
  }
  // nada de repetir el mismo bloque dos veces seguidas
  const pool = okIds.filter((id) => id !== w.lastChunk || okIds.length === 1);
  const total = pool.reduce((s, id) => s + CHUNKS[id].weight, 0);
  let r = w.rnd() * total;
  for (const id of pool) { r -= CHUNKS[id].weight; if (r <= 0) return id; }
  return pool[pool.length - 1];
}

export function spawnChunk(w, forceId) {
  const { H, D } = physicsOf(w.speed, w.gravity);
  const first = w.first;
  const word = (valid) => {
    if (!w.picker) return { text: '?', valid: false };
    if (first && valid === undefined) return w.picker.take(true);
    return valid === undefined ? w.picker.next() : w.picker.take(valid);
  };
  const ctx = { H, D, rnd: w.rnd, word };
  const id = forceId || chooseChunk(w, ctx);
  if (!id) { w.untilNext = 400; return null; }
  const { ents, len } = CHUNKS[id].build(ctx);
  const x0 = w.spawnX;
  for (const e of ents) {
    e.id = w.nextId++;
    e.x += x0;
    e.chunk = id;
  }
  w.entities.push(...ents);
  w.first = false;
  w.lastChunk = id;
  // hueco hasta el siguiente: siempre se puede aterrizar y volver a saltar
  w.untilNext = len + Math.max(230, D * 0.8) + w.rnd() * Math.max(80, D * 0.45);
  return { id, ents };
}

// Avanza un paso. Devuelve los eventos del paso:
//   { type: 'spawn' } · { type: 'despawn', missed: [items correctos no cogidos] }
//   { type: 'collect' | 'wrong' | 'spike' | 'star', ent }
// Las colisiones con 'wrong'/'spike' no deciden nada: el componente sabe si hay
// invencibilidad, vidas o fin de partida. Cada entidad choca una sola vez (hit).
export function step(w, ts = 1) {
  const ev = [];
  const sp = w.speed * ts;
  w.t += ts;
  w.travelled += sp;
  if (w.ramp) w.speed = w.baseSpeed * (1 + Math.min(RAMP_MAX, w.travelled / RAMP_DIST));

  const p = w.player;
  p.vy -= w.gravity * ts;
  p.y += p.vy * ts;
  if (p.y < 0) { p.y = 0; p.vy = 0; p.onPlatform = false; }

  w.untilNext -= sp;
  if (w.untilNext <= 0 && spawnChunk(w)) ev.push({ type: 'spawn' });

  // mover (las plataformas móviles oscilan; lo que va encima las sigue)
  for (const e of w.entities) {
    e.x -= sp;
    if (e.lift) e.y = e.baseY + e.amp * Math.sin(e.phase + w.t * e.freq);
  }
  for (const e of w.entities) if (e.ride) e.y = e.ride.y + PLAT_H + (e.dy || 0);

  const pr = playerRect(p);
  let landed = false;
  for (const e of w.entities) {
    if (e.hit || e.x > pr.x + 200 || e.x + e.width < pr.x - 40) continue;
    if (e.type === 'platform') {
      if (
        p.vy <= 0
        && p.y >= e.y + e.height - 15
        && p.y <= e.y + e.height + 25
        && pr.x + pr.width > e.x
        && pr.x < e.x + e.width
      ) {
        p.y = e.y + e.height;
        p.vy = 0;
        p.onPlatform = true;
        landed = true;
      }
      continue;
    }
    const box = e.type === 'spike' ? spikeRect(e) : e;
    if (!overlap(pr, box)) continue;
    e.hit = true;
    if (e.type === 'star') ev.push({ type: 'star', ent: e });
    else if (e.type === 'spike') ev.push({ type: 'spike', ent: e });
    else if (e.type === 'item') ev.push({ type: e.valid ? 'collect' : 'wrong', ent: e });
  }
  if (!landed && p.y > 0) p.onPlatform = false;

  const before = w.entities.length;
  const missed = [];
  w.entities = w.entities.filter((e) => {
    if (e.x + e.width > DESPAWN_X) return true;
    if (e.type === 'item' && e.valid && !e.hit) missed.push(e);
    return false;
  });
  if (w.entities.length !== before) ev.push({ type: 'despawn', missed });
  return ev;
}
