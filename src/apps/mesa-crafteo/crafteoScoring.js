// src/apps/mesa-crafteo/crafteoScoring.js
// Nota y puntos del examen de la Mesa de Crafteo. Lo usan el resumen y el
// envío a onGameComplete, así que lo que ve el alumno y lo que se guarda salen
// de la misma función.

// Configuración del examen por dificultad.
// La nota del modo Medio es la base (/10). Fácil resta 1 pt (máx. 9) y Difícil
// multiplica la nota ×1,1 (llegar al 10 cuesta menos). La nota mostrada y la
// enviada NUNCA pasan de 10 (CLAUDE.md §3.1): lo que sobre por encima de 10 en
// Difícil se convierte en puntos paralelos. Los puntos escalan con la dificultad.
export const EXAM_DIFFICULTY = {
  easy:   { questions: 4,  gradeMax: 9,  scoreMult: 0.85, label: 'FÁCIL',   note: 'Nota máx. 9 (–1 pt)' },
  medium: { questions: 6,  gradeMax: 10, scoreMult: 1.0,  label: 'MEDIO',   note: 'Nota sobre 10 (base)' },
  hard:   { questions: 10, gradeMax: 11, scoreMult: 1.25, label: 'DIFÍCIL', note: 'Nota ×1,1 (máx. 10)' },
};

// Puntos por cada punto de nota que sobra por encima de 10 (solo Difícil).
export const SURPLUS_POINTS_PER_GRADE = 100;

// Nota /10 del examen (capada a 10) + puntos que salen de lo que sobre.
export function computeCrafteoNota(correct, total, difficulty) {
  const gradeMax = EXAM_DIFFICULTY[difficulty]?.gradeMax ?? 10;
  const raw = total ? (correct / total) * gradeMax : 0;
  const nota = Math.min(10, Math.round(raw * 10) / 10);
  const surplusPoints = Math.round(Math.max(0, raw - 10) * SURPLUS_POINTS_PER_GRADE);
  return { nota, surplusPoints };
}

// Puntuación del examen: base por aciertos + bonus decreciente por tiempo,
// escalado por la proporción de aciertos y por el multiplicador de dificultad,
// más los puntos de la nota sobrante. Dos alumnos con la misma nota pueden
// obtener puntuaciones distintas según lo rápido que respondan y el nivel elegido.
export function computeCrafteoScore(correct, total, timeSec, difficulty) {
  if (!correct || !total) return 0;
  const basePoints = correct * 100;                                 // 0..total*100
  const fastBonus  = Math.max(0, 400 - timeSec * 2);                // 0..400
  const longBonus  = Math.max(0, 300 - Math.floor(timeSec / 3));    // 0..300
  const perCorrect = correct / total;
  const timeBonus  = Math.round((fastBonus + longBonus) * perCorrect);
  const mult       = EXAM_DIFFICULTY[difficulty]?.scoreMult ?? 1.0;
  const { surplusPoints } = computeCrafteoNota(correct, total, difficulty);
  return Math.round((basePoints + timeBonus) * mult) + surplusPoints;
}

// Máximo teórico de computeCrafteoScore (todo bien y en 0 s).
export function crafteoMaxScore(total, difficulty) {
  const mult = EXAM_DIFFICULTY[difficulty]?.scoreMult ?? 1.0;
  return Math.round((total * 100 + 700) * mult) + computeCrafteoNota(total, total, difficulty).surplusPoints;
}
