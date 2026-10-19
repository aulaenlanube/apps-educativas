// src/apps/sistema-solar/model/rng.js
// Aleatoriedad con semilla para las misiones: las preguntas de una partida se
// generan una vez al montarla y los tests pueden fijar la semilla.

export function mulberry32(seed = 1) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (list, rng = Math.random) => list[Math.floor(rng() * list.length)];

// n elementos distintos (o todos si hay menos)
export const sample = (list, n, rng = Math.random) => shuffle(list, rng).slice(0, n);
