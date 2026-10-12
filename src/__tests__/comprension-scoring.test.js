/**
 * Comprensión Escrita/Oral: los puntos del resumen y los enviados a
 * onGameComplete salen de la misma función (antes había dos fórmulas).
 */
import { describe, it, expect } from 'vitest';
import { calcularPuntosComprension } from '@/apps/comprension/comprensionScoring';

describe('calcularPuntosComprension', () => {
  it('suma 100 por acierto más los dos bonus de tiempo', () => {
    // 4 aciertos, 60 s leyendo (150·(1-60/180)=100), 30 s respondiendo (150·(1-30/120)=112,5→113)
    const p = calcularPuntosComprension({ aciertos: 4, totalPreguntas: 5, readingSeconds: 60, answerSeconds: 30 });
    expect(p).toEqual({ base: 400, readBonus: 100, answerBonus: 113, total: 613, maxScore: 800 });
  });

  it('los bonus no bajan de 0 con tiempos largos', () => {
    const p = calcularPuntosComprension({ aciertos: 2, totalPreguntas: 5, readingSeconds: 600, answerSeconds: 500 });
    expect(p.readBonus).toBe(0);
    expect(p.answerBonus).toBe(0);
    expect(p.total).toBe(200);
  });

  it('nunca supera maxScore', () => {
    const p = calcularPuntosComprension({ aciertos: 6, totalPreguntas: 6, readingSeconds: 0, answerSeconds: 0 });
    expect(p.total).toBe(900);
    expect(p.total).toBeLessThanOrEqual(p.maxScore);
  });

  it('tolera tiempos sin definir', () => {
    const p = calcularPuntosComprension({ aciertos: 1, totalPreguntas: 3 });
    expect(p.total).toBe(400);
    expect(p.maxScore).toBe(600);
  });
});
