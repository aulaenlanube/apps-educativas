// src/apps/sistema-solar/desafioScoring.js
// Nota y puntos del "Desafío de planetas" del Sistema Solar 3D (app single_mode:
// cada desafío terminado cuenta para la tarea). Explorar los puntos de interés
// es la fase de estudio y no lleva nota; el desafío la pone a prueba.
//
// Se puntúa lo que el alumno hace A LA PRIMERA (después puede corregir hasta
// terminar, para aprender):
//   · Ordena: cada planeta que está en su sitio en la primera comprobación.
//   · Relaciona: cada planeta emparejado sin ningún intento fallido antes.
// nota = aciertos / (planetas · 2) · 10   (CLAUDE.md §3.1)
// Puntos paralelos (§3.2): 100 por acierto + rapidez (escalada por aciertos) + pleno.

export const POINTS_PER_HIT = 100;
export const PAR_SECONDS_PER_ITEM = 15;
export const SPEED_POINTS_PER_SECOND = 2;
export const PERFECT_POINTS = 200;

// Cuántos planetas están en su posición correcta.
export function aciertosOrden(currentIds = [], correctIds = []) {
  return correctIds.reduce((n, id, i) => n + (currentIds[i] === id ? 1 : 0), 0);
}

export function resultadoDesafio({ orderHits = 0, matchHits = 0, planets = 8, durationSeconds = 0 }) {
  const total = planets * 2;
  const correct = Math.max(0, Math.min(total, (orderHits || 0) + (matchHits || 0)));
  const ratio = total > 0 ? correct / total : 0;
  const nota = total > 0 ? Math.round(ratio * 100) / 10 : 0;
  const par = total * PAR_SECONDS_PER_ITEM;
  const speedBonus = Math.round(Math.max(0, par - Math.max(0, durationSeconds || 0)) * SPEED_POINTS_PER_SECOND * ratio);
  const perfectBonus = total > 0 && correct === total ? PERFECT_POINTS : 0;
  const points = correct * POINTS_PER_HIT + speedBonus + perfectBonus;
  const maxScore = total * POINTS_PER_HIT + par * SPEED_POINTS_PER_SECOND + PERFECT_POINTS;
  return { correct, total, nota, points, maxScore, speedBonus, perfectBonus };
}
