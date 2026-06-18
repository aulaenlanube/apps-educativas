// Construye el pool de juego combinando datos de BD:
//  - getRunnerData → { categoria: [palabras] }  (palabras por categoría)
//  - getRoscoData  → [{ solucion, definicion, difficulty, tipo }]  (definiciones)
//
// A diferencia del modelo antiguo (2 categorías fijas), aquí las 2 categorías que
// PUNTÚAN van ROTANDO durante la partida. Por eso el pool no precalcula valid/value:
// expone TODAS las categorías (byCategory) y la lista de las que pueden puntuar
// (rotatableNames). En tiempo de juego se elige un par principal/secundaria y el
// valor de cada palabra se calcula con valueForCategory (engine/flyers.js).

const tierFromDifficulty = (d) => (d >= 3 ? 5 : d === 2 ? 2 : 1);
const clean = (w) => String(w == null ? '' : w).trim();
const ok = (t) => t.length > 0 && t.length <= 24 && !/^\d+$/.test(t);

export const VOC_CAT = '__voc__';   // categoría única cuando solo hay rosco
export const ROSCO_CAT = '__rosco__'; // soluciones del rosco como señuelos (no puntúan)
const MIN_ROTATABLE = 3;            // palabras mínimas para que una categoría pueda puntuar

export function buildPool(roscoData = [], runnerData = null) {
  // 1) categorías del runner con sus palabras (deduplicadas a su PRIMERA categoría,
  //    para que cada palabra pertenezca a una sola → su valor es consistente).
  const runnerCats = [];
  if (runnerData && typeof runnerData === 'object' && !Array.isArray(runnerData)) {
    Object.keys(runnerData).forEach((cat) => {
      if (!Array.isArray(runnerData[cat])) return;
      const words = [...new Set(runnerData[cat].map(clean).filter(ok))];
      if (words.length) runnerCats.push({ name: cat, words });
    });
  }

  // 2) rosco: definiciones + soluciones (las soluciones son señuelos neutros salvo
  //    cuando son la respuesta activa a una definición, que se reconoce por texto).
  const definitions = [];
  const seenDef = new Set();
  const roscoWords = [];
  const roscoSeen = new Set();
  (Array.isArray(roscoData) ? roscoData : []).forEach((it) => {
    const word = clean(it && it.solucion);
    const def = clean(it && it.definicion);
    if (!ok(word)) return;
    const key = word.toLowerCase();
    const points = tierFromDifficulty(Number(it && it.difficulty) || 1);
    if (!roscoSeen.has(key)) { roscoSeen.add(key); roscoWords.push(word); }
    if (def && def.length >= 6) {
      const dk = `${key}|${def.toLowerCase()}`;
      if (!seenDef.has(dk)) { seenDef.add(dk); definitions.push({ word, definition: def, points }); }
    }
  });

  const byCategory = new Map();   // nombre → [palabras]
  const display = new Map();      // nombre → etiqueta visible
  let onlyVoc = false;

  if (runnerCats.length) {
    const assigned = new Set();
    runnerCats.forEach((c) => {
      const uniq = c.words.filter((w) => {
        const k = w.toLowerCase();
        if (assigned.has(k)) return false;
        assigned.add(k); return true;
      });
      if (uniq.length) { byCategory.set(c.name, uniq); display.set(c.name, c.name); }
    });
    // soluciones del rosco que no estén ya en una categoría → señuelos ("Otras")
    const roscoNeutral = roscoWords.filter((w) => !assigned.has(w.toLowerCase()));
    if (roscoNeutral.length) { byCategory.set(ROSCO_CAT, roscoNeutral); display.set(ROSCO_CAT, 'Otras'); }
  } else if (roscoWords.length) {
    // solo rosco: una única categoría "Vocabulario" (todo puntúa, sin señuelos)
    onlyVoc = true;
    byCategory.set(VOC_CAT, roscoWords); display.set(VOC_CAT, 'Vocabulario');
  }

  const categoryNames = [...byCategory.keys()];
  // categorías que pueden PUNTUAR (rotan): runner cats con suficientes palabras,
  // ordenadas por tamaño desc; si ninguna llega al mínimo, se usan todas las del runner.
  let rotatableNames;
  if (onlyVoc) {
    rotatableNames = [VOC_CAT];
  } else {
    const eligible = runnerCats
      .map((c) => c.name)
      .filter((n) => (byCategory.get(n)?.length || 0) >= MIN_ROTATABLE);
    const list = eligible.length ? eligible : runnerCats.map((c) => c.name).filter((n) => byCategory.has(n));
    rotatableNames = list.sort((a, b) => (byCategory.get(b)?.length || 0) - (byCategory.get(a)?.length || 0));
  }

  // todas las palabras con su categoría (para el material de estudio)
  const words = [];
  byCategory.forEach((list, cat) => list.forEach((text) => words.push({ text, category: cat })));

  return {
    definitions,
    byCategory,
    categoryNames,
    rotatableNames,
    onlyVoc,
    words,
    displayName: (n) => display.get(n) || n,
  };
}

// ¿Hay datos suficientes para jugar? Necesitamos palabras y al menos una categoría
// que pueda puntuar.
export const poolUsable = (pool) => !!pool
  && pool.words.length >= 6
  && pool.rotatableNames.length >= 1;
