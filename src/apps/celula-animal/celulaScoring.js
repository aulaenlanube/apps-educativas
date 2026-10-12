// src/apps/celula-animal/celulaScoring.js
// Nota y puntos de La Célula Animal y La Célula Vegetal (comparten interfaz y
// reglas). Son apps single_mode: cada Test o Reto terminado cuenta para la
// tarea con su nota /10 (CLAUDE.md §3.1) y suma puntos paralelos sin tope de
// 10 (§3.2). Explorar las fichas es la fase de estudio y no lleva nota.

export const notaSobre10 = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) / 10 : 0);

/* ───────────── Test: encuentra cada orgánulo en la célula ───────────── */
// Cada orgánulo se pide una vez; cuenta como acierto si se encuentra A LA
// PRIMERA. Tras un fallo se puede seguir buscando (para aprender), pero ese
// orgánulo ya no suma acierto.

export const TEST_POINTS_FIRST_TRY = 100;
export const TEST_POINTS_LATE = 25;          // encontrado después de fallar
export const TEST_FAST_SECONDS = 10;         // bonus por cada segundo por debajo de 10 s (solo a la primera)
export const TEST_FAST_POINTS_PER_SECOND = 5;
export const TEST_STREAK_POINTS = 20;        // por cada acierto a la primera encadenado (desde el 2º)

// results: [{ firstTry: boolean, seconds: number }] en el orden en que se encontraron.
export function puntosTest(results = [], total = results.length) {
  let points = 0;
  let streak = 0;
  let firstTry = 0;
  for (const r of results) {
    if (r.firstTry) {
      firstTry += 1;
      streak += 1;
      const fast = Math.max(0, TEST_FAST_SECONDS - Math.max(0, r.seconds || 0));
      points += TEST_POINTS_FIRST_TRY + Math.round(fast * TEST_FAST_POINTS_PER_SECOND);
      if (streak >= 2) points += TEST_STREAK_POINTS;
    } else {
      streak = 0;
      points += TEST_POINTS_LATE;
    }
  }
  const maxScore = total * (TEST_POINTS_FIRST_TRY + TEST_FAST_SECONDS * TEST_FAST_POINTS_PER_SECOND)
    + Math.max(0, total - 1) * TEST_STREAK_POINTS;
  return { points, maxScore, firstTry, nota: notaSobre10(firstTry, total) };
}

/* ───────────── Reto: relaciona orgánulo y función ───────────── */

export const RETO_MULT = { 6: 1, 9: 1.25, 12: 1.5 };   // más parejas, más puntos
export const RETO_POINTS_PER_PAIR = 100;
export const RETO_PAR_SECONDS_PER_PAIR = 10;           // cada segundo por debajo da puntos
export const RETO_SPEED_POINTS_PER_SECOND = 5;
export const RETO_PERFECT_POINTS_PER_PAIR = 25;

export function puntosReto({ correct, total, durationSeconds = 0 }) {
  const ok = Math.max(0, Math.min(correct || 0, total || 0));
  const ratio = total > 0 ? ok / total : 0;
  const mult = RETO_MULT[total] ?? 1;
  const base = ok * RETO_POINTS_PER_PAIR;
  // La rapidez se escala por la proporción de aciertos: ir deprisa y fallar no da puntos.
  const speedBonus = Math.round(
    Math.max(0, total * RETO_PAR_SECONDS_PER_PAIR - Math.max(0, durationSeconds || 0)) * RETO_SPEED_POINTS_PER_SECOND * ratio,
  );
  const perfectBonus = total > 0 && ok === total ? total * RETO_PERFECT_POINTS_PER_PAIR : 0;
  const points = Math.round((base + speedBonus + perfectBonus) * mult);
  const maxScore = Math.round(
    total * (RETO_POINTS_PER_PAIR + RETO_PAR_SECONDS_PER_PAIR * RETO_SPEED_POINTS_PER_SECOND + RETO_PERFECT_POINTS_PER_PAIR) * mult,
  );
  return { points, maxScore, speedBonus, perfectBonus, mult, nota: notaSobre10(ok, total) };
}

// Baraja sin mutar (Fisher-Yates).
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
