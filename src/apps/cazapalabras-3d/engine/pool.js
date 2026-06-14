// Construye el pool de juego combinando datos de BD:
//  - getRunnerData → { categoria: [palabras] }  (palabras por categoría)
//  - getRoscoData  → [{ solucion, definicion, difficulty, tipo }]  (definiciones)
//
// SOLO 2 categorías puntúan: la PRINCIPAL (+5) y la SECUNDARIA (+2) — se eligen las
// dos con más palabras. El RESTO de palabras (otras categorías + soluciones del
// rosco) son NEUTRAS (decoys): no dan puntos y dispararlas hace desaparecer válidas.
import { SCORE_PRINCIPAL, SCORE_SECUNDARIA } from './config';

// Tier de puntos de una definición del rosco según su dificultad (para el bonus).
const tierFromDifficulty = (d) => (d >= 3 ? 5 : d === 2 ? 2 : 1);

const clean = (w) => String(w == null ? '' : w).trim();
const ok = (t) => t.length > 0 && t.length <= 24 && !/^\d+$/.test(t);

export function buildPool(roscoData = [], runnerData = null) {
  // 1) Reunir categorías del runner con sus palabras válidas.
  const runnerCats = [];
  if (runnerData && typeof runnerData === 'object' && !Array.isArray(runnerData)) {
    Object.keys(runnerData).forEach((cat) => {
      if (!Array.isArray(runnerData[cat])) return;
      const words = [...new Set(runnerData[cat].map(clean).filter(ok))];
      if (words.length) runnerCats.push({ name: cat, words });
    });
  }

  // 2) Elegir principal y secundaria = las dos categorías con MÁS palabras
  //    (desempate por orden original → estable dentro de un mismo curso).
  const ranked = runnerCats
    .map((c, i) => ({ ...c, i }))
    .sort((a, b) => b.words.length - a.words.length || a.i - b.i);
  let principalName = ranked[0]?.name || null;
  let secundariaName = ranked[1]?.name || null;
  // Fallback: sin categorías del runner pero con soluciones del rosco, todas las
  // palabras forman una única categoría principal (juego sin decoys).
  const onlyRosco = !principalName;

  const valueFor = (cat) => {
    if (onlyRosco) return SCORE_PRINCIPAL;
    if (cat === principalName) return SCORE_PRINCIPAL;
    if (cat === secundariaName) return SCORE_SECUNDARIA;
    return 0;
  };

  // 3) Volcar palabras a un mapa por texto (el mayor valor domina si se repite).
  const byText = new Map(); // key minúsculas → { text, value, valid, category }
  runnerCats.forEach((c) => {
    const value = valueFor(c.name);
    c.words.forEach((text) => {
      const key = text.toLowerCase();
      const existing = byText.get(key);
      if (!existing || value > existing.value) {
        byText.set(key, { text, value, valid: value > 0, category: c.name });
      }
    });
  });

  // 4) Rosco: definiciones + soluciones (las soluciones son decoys neutros salvo
  //    cuando son la respuesta activa a una definición, que se reconoce por texto).
  const definitions = [];
  const seenDef = new Set();
  (Array.isArray(roscoData) ? roscoData : []).forEach((it) => {
    const word = clean(it && it.solucion);
    const def = clean(it && it.definicion);
    if (!ok(word)) return;
    const key = word.toLowerCase();
    const points = tierFromDifficulty(Number(it && it.difficulty) || 1);
    if (!byText.has(key)) {
      const value = onlyRosco ? SCORE_PRINCIPAL : 0;
      byText.set(key, { text: word, value, valid: value > 0, category: onlyRosco ? '__voc__' : 'rosco' });
    }
    if (def && def.length >= 6) {
      const dk = `${key}|${def.toLowerCase()}`;
      if (!seenDef.has(dk)) { seenDef.add(dk); definitions.push({ word, definition: def, points }); }
    }
  });

  const words = [...byText.values()];
  const validWords = words.filter((w) => w.valid);
  const neutralWords = words.filter((w) => !w.valid);

  // Categorías mostradas en la leyenda (solo las que puntúan).
  const categories = [];
  if (onlyRosco) {
    categories.push({ name: 'Vocabulario', role: 'principal', points: SCORE_PRINCIPAL });
    principalName = '__voc__';
  } else {
    if (principalName) categories.push({ name: principalName, role: 'principal', points: SCORE_PRINCIPAL });
    if (secundariaName) categories.push({ name: secundariaName, role: 'secundaria', points: SCORE_SECUNDARIA });
  }

  return {
    words, validWords, neutralWords, categories, definitions,
    principalName, secundariaName: onlyRosco ? null : secundariaName,
  };
}

// ¿Hay datos suficientes para jugar? Necesitamos palabras y al menos una válida.
export const poolUsable = (pool) => !!pool && pool.words.length >= 6 && pool.validWords.length >= 1;
