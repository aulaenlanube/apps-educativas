// src/apps/excavacion-selectiva/excavacionScoring.js
// Nota de Excavación Selectiva (app single_mode: cada partida cuenta para tareas).
// La nota /10 sale de los XP de la partida (2.000 XP = un 10) y es la MISMA que
// se muestra en la pantalla final y la que se envía a onGameComplete. Los XP
// (sin tope) son los puntos paralelos del ranking (CLAUDE.md §3.2).

export const XP_FOR_10 = 2000;

export function notaExcavacion(score) {
  const xp = Math.max(0, Number(score) || 0);
  return Math.round(Math.min(10, (xp / XP_FOR_10) * 10) * 10) / 10;
}

// Penalizaciones al picar lo que no toca. Las aplica el hook de juego
// (useExcavacionSelectiva) y las cuentan las instrucciones de la app con estas
// mismas constantes, para que lo explicado y lo que pasa no se separen.
export const XP_PENALTY_WRONG = 5;          // distractor: −5 XP y se rompe el combo
export const SUDDEN_DEATH_WRONG_SECONDS = 1; // distractor en muerte súbita: además −1 s
export const XP_PENALTY_TNT = 20;           // TNT: −20 XP, se rompe el combo…
export const TNT_TIME_PENALTY = 10;         // …y −10 s

// XP tras una penalización: nunca por debajo de 0.
export function applyXpPenalty(score, penalty) {
  return Math.max(0, (Number(score) || 0) - Math.max(0, Number(penalty) || 0));
}

// Acierto o fallo al picar un bloque (para correctAnswers / totalQuestions):
// los bloques de la misión, el oro, la estrella y el hielo son aciertos; los
// distractores y la TNT, fallos. Mismo criterio que el hook de juego.
export function blockOutcome(block) {
  if (!block) return null;
  if (block.isTNT) return 'miss';
  return block.isTarget ? 'hit' : 'miss';
}
