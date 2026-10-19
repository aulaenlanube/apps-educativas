// src/apps/sistema-solar/missionScoring.js
// Nota y puntos de las misiones del Sistema Solar 3D (app single_mode: cada
// misión terminada es una partida que cuenta para las tareas).
//
//   nota  = aciertos / preguntas · 10, redondeada a 1 decimal y capada a 10
//           (CLAUDE.md §3.1). Solo cuenta lo acertado A LA PRIMERA.
//   puntos = 100 por acierto + bonus (rapidez, racha, pocas pistas) + 200 por
//           pleno, sin tope de nota (§3.2). maxScore es el techo teórico.
//
// buildPayload produce EXACTAMENTE lo que se envía a onGameComplete.

export const POINTS_PER_HIT = 100;
export const PERFECT_BONUS = 200;
export const STREAK_STEP = 25;
export const STREAK_CAP = 100;

export function notaSobre10(correct, total) {
  if (!total) return 0;
  const c = Math.max(0, Math.min(total, correct || 0));
  return Math.min(10, Math.round((c / total) * 100) / 10);
}

// Bonus por rapidez: lineal desde maxBonus (respuesta inmediata) a 0 (al límite).
export function speedBonus(seconds, limitSeconds, maxBonus = 50) {
  if (!(limitSeconds > 0)) return 0;
  const s = Math.max(0, seconds || 0);
  return Math.round(Math.max(0, 1 - s / limitSeconds) * maxBonus);
}

// Bonus de racha: a partir del 2º acierto seguido, +25 por cada uno (máx. 100).
export function streakBonus(streak) {
  return streak >= 2 ? Math.min(STREAK_CAP, (streak - 1) * STREAK_STEP) : 0;
}

// bonus/bonusMax: puntos extra conseguidos y techo de esos extras.
export function missionResult({ correct = 0, total = 0, bonus = 0, bonusMax = 0 }) {
  const c = Math.max(0, Math.min(total, correct));
  const nota = notaSobre10(c, total);
  const perfectBonus = total > 0 && c === total ? PERFECT_BONUS : 0;
  const maxScore = total * POINTS_PER_HIT + Math.max(0, bonusMax) + PERFECT_BONUS;
  const points = Math.min(maxScore, c * POINTS_PER_HIT + Math.max(0, Math.round(bonus)) + perfectBonus);
  return { correct: c, total, nota, points, maxScore, perfectBonus };
}

// Lo que recibe onGameComplete (contrato de CLAUDE.md §5).
export function buildPayload(result, durationSeconds) {
  return {
    mode: 'test',
    score: result.points,
    maxScore: result.maxScore,
    correctAnswers: result.correct,
    totalQuestions: result.total,
    durationSeconds: Math.max(1, Math.round(durationSeconds || 0)),
    nota: result.nota,
  };
}
