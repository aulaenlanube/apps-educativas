// Puntuación del motor de mapas (Explorador del Mundo, Explorador de España y duelos).
// Nota /10 = aciertos / preguntas (CLAUDE.md §3.1) y, en paralelo, puntos sin
// tope por rapidez y racha (§3.2).

export const BASE_POINTS = 100;
export const SPEED_MAX = 50;
export const SPEED_WINDOW = 15; // segundos para conseguir algo de bonus
export const STREAK_STEP = 10;
export const STREAK_CAP = 5;

export const speedBonus = (seconds) => Math.max(0, Math.round(SPEED_MAX * (1 - seconds / SPEED_WINDOW)));
export const streakBonus = (streak) => STREAK_STEP * Math.min(Math.max(streak - 1, 0), STREAK_CAP);

// attempt: intento en que acertó (mapas con varios intentos en práctica)
// streak: racha contando esta respuesta · hint: pidió pista (resta la mitad)
export function questionPoints({ correct, attempt = 1, seconds = 0, streak = 1, hint = false }) {
  if (!correct) return 0;
  const base = attempt <= 1 ? BASE_POINTS : attempt === 2 ? BASE_POINTS / 2 : BASE_POINTS / 4;
  const speed = attempt <= 1 ? speedBonus(seconds) : 0;
  const total = base + speed + streakBonus(streak);
  return Math.round(hint ? total / 2 : total);
}

// Máximo teórico de una ronda de n preguntas (todo a la primera, al instante).
export function maxRoundPoints(n) {
  let total = 0;
  for (let i = 1; i <= n; i += 1) total += BASE_POINTS + SPEED_MAX + streakBonus(i);
  return total;
}

export const notaFrom = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) / 10 : 0);
