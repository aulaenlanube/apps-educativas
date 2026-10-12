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

// Acierto o fallo al picar un bloque (para correctAnswers / totalQuestions):
// los bloques de la misión, el oro, la estrella y el hielo son aciertos; los
// distractores y la TNT, fallos. Mismo criterio que el hook de juego.
export function blockOutcome(block) {
  if (!block) return null;
  if (block.isTNT) return 'miss';
  return block.isTarget ? 'hit' : 'miss';
}
