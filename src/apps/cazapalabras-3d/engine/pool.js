// Construye el pool de juego combinando datos de BD:
//  - getRunnerData → { categoria: [palabras] }  (palabras por categoría)
//  - getRoscoData  → [{ solucion, definicion, difficulty, tipo }]  (definiciones)
// Cada palabra recibe un TIER de puntos (1 / 2 / 5). Las categorías del runner
// se reparten en tiers (≈55% / 30% / 15%); las del rosco van por su 'difficulty'.

const tierFromDifficulty = (d) => (d >= 3 ? 5 : d === 2 ? 2 : 1);

// Hash estable de un índice → tier, para que el reparto de categorías sea
// variado pero reproducible dentro de una misma sesión.
function tierForCategory(i) {
  const r = Math.abs((i * 2654435761) % 100);
  return r < 15 ? 5 : r < 45 ? 2 : 1;
}

const clean = (w) => String(w == null ? '' : w).trim();
const ok = (t) => t.length > 0 && t.length <= 24 && !/^\d+$/.test(t);

export function buildPool(roscoData = [], runnerData = null) {
  const byText = new Map(); // key minúsculas → { text, points, category }
  const categories = [];

  // 1) Runner: categorías → palabras
  if (runnerData && typeof runnerData === 'object' && !Array.isArray(runnerData)) {
    const cats = Object.keys(runnerData).filter(
      (c) => Array.isArray(runnerData[c]) && runnerData[c].length > 0,
    );
    cats.forEach((cat, i) => {
      const points = tierForCategory(i);
      categories.push({ name: cat, points });
      runnerData[cat].forEach((w) => {
        const text = clean(w);
        if (!ok(text)) return;
        const key = text.toLowerCase();
        if (!byText.has(key)) byText.set(key, { text, points, category: cat });
      });
    });
  }

  // 2) Rosco: definiciones + soluciones (tier por dificultad)
  const definitions = [];
  const seenDef = new Set();
  (Array.isArray(roscoData) ? roscoData : []).forEach((it) => {
    const word = clean(it && it.solucion);
    const def = clean(it && it.definicion);
    if (!ok(word)) return;
    const points = tierFromDifficulty(Number(it && it.difficulty) || 1);
    const key = word.toLowerCase();
    if (!byText.has(key)) byText.set(key, { text: word, points, category: 'rosco' });
    if (def && def.length >= 6) {
      const dk = `${key}|${def.toLowerCase()}`;
      if (!seenDef.has(dk)) { seenDef.add(dk); definitions.push({ word, definition: def, points }); }
    }
  });

  const words = [...byText.values()];
  return { words, categories, definitions };
}

// ¿Hay datos suficientes para jugar?
export const poolUsable = (pool) => pool && pool.words.length >= 6;
