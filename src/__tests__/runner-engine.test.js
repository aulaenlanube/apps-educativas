import { describe, it, expect } from 'vitest';
import { CHUNKS, createWorld, spawnChunk, step, jump, physicsOf } from '../apps/_shared/runnerEngine';
import { createWordPicker } from '../apps/_shared/runnerWords';

const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const DATA = {
  reptiles: ['lagarto', 'serpiente', 'tortuga', 'cocodrilo', 'camaleón', 'iguana', 'geco'],
  mamiferos: ['perro', 'gato', 'ballena', 'murciélago', 'elefante'],
  aves: ['águila', 'gorrión', 'pingüino', 'avestruz'],
};

// Copia del mundo para explorar ramas (las fichas que "montan" en una
// plataforma móvil apuntan a ella: se reenlazan por índice).
function clone(w) {
  const ents = w.entities.map((e) => ({ ...e }));
  w.entities.forEach((e, i) => { if (e.ride) ents[i].ride = ents[w.entities.indexOf(e.ride)]; });
  return { ...w, player: { ...w.player }, entities: ents };
}

// ¿Existe una forma de saltar (o no) en cada frame que pase el bloque entero
// recogiendo TODAS sus palabras correctas sin tocar pinchos ni incorrectas?
function solvable(chunkId, speed, gravity, seed) {
  const rnd = seeded(seed);
  const w0 = createWorld({ speed, gravity, picker: createWordPicker(DATA, 'reptiles', rnd), rnd, ramp: false });
  w0.first = false;
  w0.baseSpeed = speed;
  const built = spawnChunk(w0, chunkId);
  if (!built) return { skipped: true };
  w0.untilNext = Infinity;
  const validIds = new Set(built.ents.filter((e) => e.type === 'item' && e.valid).map((e) => e.id));
  const maxFrames = Math.ceil((w0.spawnX + 1600) / speed);

  const seen = new Set();
  const stack = [{ w: w0, f: 0, got: 0 }];
  while (stack.length) {
    const s = stack.pop();
    const key = `${s.f}|${Math.round(s.w.player.y)}|${Math.round(s.w.player.vy)}|${s.w.player.onPlatform}|${s.got}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const grounded = s.w.player.y <= 0.5 || s.w.player.onPlatform;
    for (const doJump of grounded ? [false, true] : [false]) {
      const w = clone(s.w);
      if (doJump) jump(w);
      const ev = step(w, 1);
      let got = s.got;
      let dead = false;
      for (const e of ev) {
        if (e.type === 'spike' || e.type === 'wrong') dead = true;
        if (e.type === 'collect' && validIds.has(e.ent.id)) got++;
      }
      if (dead) continue;
      const passed = w.entities.every((e) => e.x + e.width < w.player.x - 20);
      if (passed) {
        if (got === validIds.size) return { ok: true };
        continue;
      }
      if (s.f + 1 < maxFrames) stack.push({ w, f: s.f + 1, got });
    }
  }
  return { ok: false };
}

const CONFIGS = [
  [8, 1], [5, 1], [11, 1], [14, 1], [8, 0.7], [8, 1.4], [10.4, 1], [6, 1.2],
];

describe('Education Dash: motor', () => {
  for (const id of Object.keys(CHUNKS)) {
    it(`el bloque «${id}» siempre se puede superar recogiendo sus palabras correctas`, () => {
      let tested = 0;
      for (const [speed, gravity] of CONFIGS) {
        if (!CHUNKS[id].ok({ ...physicsOf(speed, gravity) })) continue;
        for (let seed = 1; seed <= 6; seed++) {
          const r = solvable(id, speed, gravity, seed * 97 + Math.round(speed * 10));
          if (r.skipped) continue;
          tested++;
          expect(r.ok, `${id} · velocidad ${speed} · gravedad ${gravity} · semilla ${seed}`).toBe(true);
        }
      }
      expect(tested).toBeGreaterThan(0);
    });
  }

  it('con el ajuste por defecto salen todos los tipos de bloque y nunca el mismo dos veces seguidas', () => {
    const rnd = seeded(5);
    const w = createWorld({ speed: 8, gravity: 1, picker: createWordPicker(DATA, 'reptiles', rnd), rnd });
    const seen = new Set();
    let prev = null;
    for (let i = 0; i < 400; i++) {
      const c = spawnChunk(w);
      expect(c.id).not.toBe(prev);
      prev = c.id;
      seen.add(c.id);
      w.entities = [];
    }
    expect([...seen].sort()).toEqual(Object.keys(CHUNKS).sort());
  });

  it('al menos la mitad de las palabras que salen en la pista son de la misión', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const rnd = seeded(seed);
      const w = createWorld({ speed: 8, gravity: 1, picker: createWordPicker(DATA, 'reptiles', rnd), rnd });
      let valid = 0;
      let total = 0;
      // también en tramos cortos (las primeras ~20 palabras de una partida)
      for (let i = 0; i < 300; i++) {
        const c = spawnChunk(w);
        for (const e of c.ents) if (e.type === 'item') { total++; if (e.valid) valid++; }
        if (total >= 20 && i < 40) {
          expect(valid / total, `semilla ${seed}, primeras ${total}`).toBeGreaterThanOrEqual(0.45);
        }
        w.entities = [];
      }
      expect(valid / total, `semilla ${seed}`).toBeGreaterThanOrEqual(0.5);
      expect(valid / total, `semilla ${seed}`).toBeLessThanOrEqual(0.64);
    }
  });

  it('la primera palabra de la carrera es de la misión', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const rnd = seeded(seed);
      const w = createWorld({ speed: 8, gravity: 1, picker: createWordPicker(DATA, 'reptiles', rnd), rnd });
      const c = spawnChunk(w);
      const items = c.ents.filter((e) => e.type === 'item');
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].valid).toBe(true);
    }
  });
});
