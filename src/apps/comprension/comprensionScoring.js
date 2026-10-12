// Puntos paralelos de Comprensión Escrita / Oral (CLAUDE.md §3.2).
// Una sola fórmula para lo que se muestra en el resumen y lo que se envía a
// onGameComplete (antes eran dos distintas: el resumen enseñaba más puntos de
// los que se registraban).
//
//   puntos = 100 · aciertos
//          + bonus de lectura/escucha  (hasta 150: rápido → más; 0 a partir de 3 min)
//          + bonus de respuesta        (hasta 150: rápido → más; 0 a partir de 2 min)
//   maxScore = 100 · preguntas + 300
//
// Es la fórmula que ya se registraba (la del ranking): acotada y coherente con
// maxScore. La nota /10 sigue siendo aciertos / preguntas · 10 (§3.1).

export const READ_REF_SECONDS = 180;
export const ANSWER_REF_SECONDS = 120;
export const MAX_TIME_BONUS = 150;

const timeBonus = (seconds, refSeconds) =>
    Math.max(0, Math.round(MAX_TIME_BONUS * (1 - (Number(seconds) || 0) / refSeconds)));

export function calcularPuntosComprension({ aciertos = 0, totalPreguntas = 0, readingSeconds = 0, answerSeconds = 0 } = {}) {
    const base = aciertos * 100;
    const readBonus = timeBonus(readingSeconds, READ_REF_SECONDS);
    const answerBonus = timeBonus(answerSeconds, ANSWER_REF_SECONDS);
    return {
        base,
        readBonus,
        answerBonus,
        total: base + readBonus + answerBonus,
        maxScore: totalPreguntas * 100 + 2 * MAX_TIME_BONUS,
    };
}
