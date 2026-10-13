import { describe, it, expect } from 'vitest';
import {
  createWordPicker, runnerCategories, VALID_MIN, VALID_MAX, MAX_WRONG_STREAK, MAX_GOOD_STREAK,
} from '../apps/_shared/runnerWords';

// generador determinista para que el test no dependa del azar
const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const DATA = {
  title: 'Runner',
  animales: ['perro', 'gato', 'vaca', 'oveja', 'cerdo'],
  frutas: ['pera', 'manzana', 'uva', 'kiwi'],
  colores: ['rojo', 'azul', 'verde', 'gato'], // 'gato' también es animal
  vacia: [],
  muebles: ['silla', 'mesa'],
};

describe('Education Dash: reparto de palabras', () => {
  it('solo cuenta como categoría las listas con palabras', () => {
    expect(runnerCategories(DATA)).toEqual(['animales', 'frutas', 'colores', 'muebles']);
  });

  it('entre el 40 % y el 60 % de las palabras son de la misión en cada partida', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const picker = createWordPicker(DATA, 'animales', seeded(seed));
      expect(picker.ratio).toBeGreaterThanOrEqual(VALID_MIN);
      expect(picker.ratio).toBeLessThanOrEqual(VALID_MAX);
      let valid = 0;
      const N = 2000;
      for (let i = 0; i < N; i++) if (picker.next().valid) valid++;
      expect(valid / N).toBeGreaterThan(0.38);
      expect(valid / N).toBeLessThan(0.66);
    }
  });

  it('respeta las rachas máximas y las palabras incorrectas nunca son de la misión', () => {
    const picker = createWordPicker(DATA, 'animales', seeded(7));
    let good = 0;
    let wrong = 0;
    for (let i = 0; i < 3000; i++) {
      const { text, valid } = picker.next();
      expect(valid).toBe(DATA.animales.includes(text));
      if (valid) { good++; wrong = 0; } else { wrong++; good = 0; }
      expect(good).toBeLessThanOrEqual(MAX_GOOD_STREAK);
      expect(wrong).toBeLessThanOrEqual(MAX_WRONG_STREAK);
    }
  });

  it('recorre toda la lista de la misión antes de repetir', () => {
    const picker = createWordPicker(DATA, 'frutas', seeded(3));
    const seen = [];
    while (seen.length < DATA.frutas.length) {
      const w = picker.next();
      if (w.valid) seen.push(w.text);
    }
    expect(new Set(seen).size).toBe(DATA.frutas.length);
  });

  it('con una sola categoría todas las palabras son válidas', () => {
    const picker = createWordPicker({ unica: ['a', 'b'] }, 'unica', seeded(1));
    for (let i = 0; i < 20; i++) expect(picker.next().valid).toBe(true);
  });
});
