/**
 * Apps de ciencias y exploración: nota /10 y puntos paralelos que se envían a
 * onGameComplete (CLAUDE.md §3.1 y §3.2). Lo que se muestra en el resumen y lo
 * que se guarda salen de estas mismas funciones.
 */
import { describe, it, expect } from 'vitest';
import { computeCrafteoNota, computeCrafteoScore, crafteoMaxScore } from '@/apps/mesa-crafteo/crafteoScoring';
import { calcularPuntosInfografia } from '@/apps/infografias-interactivas/infografiasScoring';
import { notaExcavacion, blockOutcome, XP_FOR_10 } from '@/apps/excavacion-selectiva/excavacionScoring';
import { puntosTest, puntosReto, notaSobre10, shuffle } from '@/apps/celula-animal/celulaScoring';
import { aciertosOrden, resultadoDesafio } from '@/apps/sistema-solar/desafioScoring';

describe('Mesa de Crafteo: nota capada a 10', () => {
  it('Difícil perfecto da 10 (no 11) y el extra va a puntos', () => {
    const r = computeCrafteoNota(10, 10, 'hard');
    expect(r.nota).toBe(10);
    expect(r.surplusPoints).toBe(100);
  });

  it('Difícil multiplica ×1,1 por debajo del tope', () => {
    expect(computeCrafteoNota(9, 10, 'hard')).toEqual({ nota: 9.9, surplusPoints: 0 });
    expect(computeCrafteoNota(5, 10, 'hard')).toEqual({ nota: 5.5, surplusPoints: 0 });
  });

  it('Fácil se queda en 9 como máximo y Medio en 10', () => {
    expect(computeCrafteoNota(4, 4, 'easy').nota).toBe(9);
    expect(computeCrafteoNota(6, 6, 'medium').nota).toBe(10);
    expect(computeCrafteoNota(3, 6, 'medium').nota).toBe(5);
  });

  it('ninguna dificultad pasa de 10', () => {
    for (const d of ['easy', 'medium', 'hard']) {
      for (let c = 0; c <= 10; c++) expect(computeCrafteoNota(c, 10, d).nota).toBeLessThanOrEqual(10);
    }
  });

  it('los puntos incluyen el extra y nunca superan el máximo', () => {
    const pts = computeCrafteoScore(10, 10, 0, 'hard');
    expect(pts).toBe(crafteoMaxScore(10, 'hard'));
    expect(computeCrafteoScore(10, 10, 60, 'hard')).toBeLessThan(pts);
    expect(computeCrafteoScore(0, 10, 10, 'hard')).toBe(0);
  });
});

describe('Infografías: puntos paralelos', () => {
  it('100 por acierto + rapidez escalada por aciertos + pleno', () => {
    // 5/5 en 50 s: rapidez (100-50)·5·1 = 250; pleno 5·20 = 100
    expect(calcularPuntosInfografia({ correct: 5, total: 5, durationSeconds: 50 }))
      .toEqual({ base: 500, speedBonus: 250, perfectBonus: 100, total: 850, maxScore: 1100 });
  });

  it('responder rápido y mal no da bonus de rapidez', () => {
    const p = calcularPuntosInfografia({ correct: 0, total: 5, durationSeconds: 5 });
    expect(p.total).toBe(0);
  });

  it('nunca supera maxScore y tolera tiempos largos', () => {
    const fast = calcularPuntosInfografia({ correct: 5, total: 5, durationSeconds: 0 });
    expect(fast.total).toBe(fast.maxScore);
    expect(calcularPuntosInfografia({ correct: 3, total: 5, durationSeconds: 999 }).speedBonus).toBe(0);
  });
});

describe('Excavación Selectiva: nota desde los XP', () => {
  it('2.000 XP = 10 y la nota no se dispara con pocos XP', () => {
    expect(XP_FOR_10).toBe(2000);
    expect(notaExcavacion(2000)).toBe(10);
    expect(notaExcavacion(2576)).toBe(10);
    // Antes 187 XP se guardaban como un 10 (correctAnswers = totalQuestions).
    expect(notaExcavacion(187)).toBe(0.9);
    expect(notaExcavacion(1046)).toBe(5.2);
    expect(notaExcavacion(0)).toBe(0);
    expect(notaExcavacion(-20)).toBe(0);
  });

  it('clasifica los bloques picados en aciertos y fallos', () => {
    expect(blockOutcome({ isTarget: true })).toBe('hit');
    expect(blockOutcome({ isTarget: true, isGold: true })).toBe('hit');
    expect(blockOutcome({ isTarget: true, isFreeze: true })).toBe('hit');
    expect(blockOutcome({ isTarget: false })).toBe('miss');
    expect(blockOutcome({ isTarget: false, isTNT: true })).toBe('miss');
    expect(blockOutcome(undefined)).toBe(null);
  });
});

describe('Célula Animal/Vegetal', () => {
  it('Test: nota = encontrados a la primera / total', () => {
    const results = [
      { firstTry: true, seconds: 3 },
      { firstTry: true, seconds: 12 },
      { firstTry: false, seconds: 20 },
      { firstTry: true, seconds: 1 },
    ];
    const r = puntosTest(results, 4);
    expect(r.firstTry).toBe(3);
    expect(r.nota).toBe(7.5);
    // 100+35 · 100+0+20(racha) · 25 · 100+45
    expect(r.points).toBe(425);
    expect(r.maxScore).toBe(4 * 150 + 3 * 20);
  });

  it('Test perfecto e instantáneo alcanza el máximo', () => {
    const results = Array.from({ length: 12 }, () => ({ firstTry: true, seconds: 0 }));
    const r = puntosTest(results, 12);
    expect(r.nota).toBe(10);
    expect(r.points).toBe(r.maxScore);
  });

  it('Reto: nota sobre 10 redondeada y puntos que escalan con las parejas', () => {
    const r6 = puntosReto({ correct: 4, total: 6, durationSeconds: 30 });
    expect(r6.nota).toBe(6.7);
    // base 400 + rapidez (60-30)·5·(4/6)=100 → ×1
    expect(r6.points).toBe(500);
    const r12 = puntosReto({ correct: 12, total: 12, durationSeconds: 0 });
    expect(r12.nota).toBe(10);
    expect(r12.points).toBe(r12.maxScore);
    expect(r12.mult).toBe(1.5);
  });

  it('notaSobre10 y shuffle', () => {
    expect(notaSobre10(0, 0)).toBe(0);
    expect(notaSobre10(2, 3)).toBe(6.7);
    const list = [1, 2, 3, 4, 5];
    const out = shuffle(list);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual(list);
    expect(list).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Sistema Solar: desafío de planetas', () => {
  const correct = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  it('cuenta los planetas en su sitio en la primera comprobación', () => {
    expect(aciertosOrden(correct, correct)).toBe(8);
    expect(aciertosOrden(['venus', 'mercury', ...correct.slice(2)], correct)).toBe(6);
    expect(aciertosOrden([], correct)).toBe(0);
  });

  it('nota = (orden + parejas a la primera) / 16', () => {
    const r = resultadoDesafio({ orderHits: 6, matchHits: 7, planets: 8, durationSeconds: 400 });
    expect(r.total).toBe(16);
    expect(r.correct).toBe(13);
    expect(r.nota).toBe(8.1);
    expect(r.speedBonus).toBe(0);
    expect(r.points).toBe(1300);
  });

  it('pleno rápido = nota 10 y puntos máximos', () => {
    const r = resultadoDesafio({ orderHits: 8, matchHits: 8, planets: 8, durationSeconds: 0 });
    expect(r.nota).toBe(10);
    expect(r.points).toBe(r.maxScore);
  });
});
