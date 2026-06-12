// RNG determinista con semilla (mismo patrón que la-fortaleza/engine.js).
// Solo operaciones enteras → 100% reproducible en cualquier motor JS.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randRange = (rng, min, max) => min + rng() * (max - min);
export const randInt = (rng, min, max) => Math.floor(min + rng() * (max - min + 1));
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

// Baraja in-place (Fisher-Yates) determinista
export function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
