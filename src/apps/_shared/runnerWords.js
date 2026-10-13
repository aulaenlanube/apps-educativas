// Education Dash (Runner): qué palabras salen en la pista.
//
// Cada partida fija un porcentaje de palabras de la misión entre el 50 % y el
// 60 % (nunca menos de la mitad: si casi todo lo que sale hay que esquivarlo, el
// juego no es divertido). El reparto se COMPENSA sobre la marcha: si van saliendo
// menos correctas de la cuenta, sube la probabilidad de la siguiente, así que en
// cualquier tramo corto de la partida el porcentaje real queda cerca del objetivo.
// Topes de racha: nunca más de 2 incorrectas seguidas ni más de 3 correctas.
// Las palabras salen de "bolsas" barajadas: no se repiten hasta agotar la lista.
//
// Los bloques de la pista (runnerEngine.js) piden palabras con next() (reparto
// automático) o con take(true|false) cuando el bloque necesita una de cada tipo
// (el cruce: una correcta y una incorrecta); ambas cuentan para el reparto.

export const VALID_MIN = 0.5;
export const VALID_MAX = 0.6;
export const MAX_WRONG_STREAK = 2;
export const MAX_GOOD_STREAK = 3;
// fuerza de la compensación (por cada palabra de desvío respecto al objetivo)
const BALANCE = 0.18;

// Categorías jugables: claves cuyo valor es una lista con palabras (el contenido
// puede traer también 'title', 'instructions'…).
export const runnerCategories = (data) =>
  Object.keys(data || {}).filter((k) => Array.isArray(data[k]) && data[k].length > 0);

const shuffled = (list, rnd) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function createWordPicker(data, target, rnd = Math.random) {
  const valid = [...new Set((data?.[target] || []).filter(Boolean))];
  const validSet = new Set(valid);
  // categoría "real" de cada palabra incorrecta (para explicar el fallo)
  const catOf = new Map();
  for (const k of runnerCategories(data)) {
    if (k === target) continue;
    for (const w of data[k]) if (w && !validSet.has(w) && !catOf.has(w)) catOf.set(w, k);
  }
  const wrong = [...catOf.keys()];
  const ratio = VALID_MIN + rnd() * (VALID_MAX - VALID_MIN);
  const bags = { valid: [], wrong: [] };
  let goodStreak = 0;
  let wrongStreak = 0;
  let total = 0;
  let validCount = 0;
  let last = null;

  const draw = (kind) => {
    if (bags[kind].length === 0) {
      const bag = shuffled(kind === 'valid' ? valid : wrong, rnd);
      // que no repita la última palabra al rebarajar
      if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop());
      bags[kind] = bag;
    }
    return bags[kind].pop();
  };

  // ¿Hay de los dos tipos? Si no, todo sale del que haya.
  const canValid = valid.length > 0;
  const canWrong = wrong.length > 0;

  const take = (wantValid) => {
    const isValid = wantValid ? canValid || !canWrong : !canWrong && canValid;
    const text = draw(isValid ? 'valid' : 'wrong');
    total++;
    if (isValid) { validCount++; goodStreak++; wrongStreak = 0; } else { wrongStreak++; goodStreak = 0; }
    last = text;
    return { text, valid: isValid, category: isValid ? target : catOf.get(text) };
  };

  const next = () => {
    let wantValid;
    if (wrongStreak >= MAX_WRONG_STREAK) wantValid = true;
    else if (goodStreak >= MAX_GOOD_STREAK) wantValid = false;
    else {
      // compensación: cuántas correctas "faltan" para ir en el objetivo
      const deficit = ratio * (total + 1) - validCount;
      const p = Math.min(0.92, Math.max(0.08, ratio + (deficit - ratio) * BALANCE * 2));
      wantValid = rnd() < p;
    }
    return take(wantValid);
  };

  return {
    next,
    take,
    ratio,
    isValid: (w) => validSet.has(w),
    categoryOf: (w) => (validSet.has(w) ? target : catOf.get(w)),
    stats: () => ({ total, valid: validCount }),
  };
}
