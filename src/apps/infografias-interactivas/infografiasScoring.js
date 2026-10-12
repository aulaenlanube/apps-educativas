// src/apps/infografias-interactivas/infografiasScoring.js
// Puntos paralelos del examen de una infografía (CLAUDE.md §3.2). La nota /10
// sigue siendo aciertos/total; los puntos no tienen tope de 10 y premian
// acertar, responder con soltura y hacer pleno, para que dos alumnos con la
// misma nota puedan distinguirse en el ranking.
//
// Solo cuenta el tiempo de la fase de preguntas: estudiar la infografía con
// calma no penaliza.

export const POINTS_PER_CORRECT = 100;
// Tiempo de referencia por pregunta: cada segundo por debajo da puntos.
export const PAR_SECONDS_PER_QUESTION = 20;
export const SPEED_POINTS_PER_SECOND = 5;
export const PERFECT_POINTS_PER_QUESTION = 20;

export function calcularPuntosInfografia({ correct, total, durationSeconds = 0 }) {
  const safeTotal = Math.max(0, total || 0);
  const ok = Math.max(0, Math.min(correct || 0, safeTotal));
  const ratio = safeTotal ? ok / safeTotal : 0;
  const base = ok * POINTS_PER_CORRECT;
  // El bonus de rapidez se escala por la proporción de aciertos: contestar
  // deprisa y mal no da puntos.
  const par = safeTotal * PAR_SECONDS_PER_QUESTION;
  const speedBonus = Math.round(Math.max(0, par - Math.max(0, durationSeconds || 0)) * SPEED_POINTS_PER_SECOND * ratio);
  const perfectBonus = safeTotal > 0 && ok === safeTotal ? safeTotal * PERFECT_POINTS_PER_QUESTION : 0;
  const maxScore = safeTotal * (POINTS_PER_CORRECT + PAR_SECONDS_PER_QUESTION * SPEED_POINTS_PER_SECOND + PERFECT_POINTS_PER_QUESTION);
  return { base, speedBonus, perfectBonus, total: base + speedBonus + perfectBonus, maxScore };
}
