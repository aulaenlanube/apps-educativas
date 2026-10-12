/**
 * Corrección y puntuación del examen de las apps de operaciones
 * (sumas, restas, multiplicaciones y divisiones sobre MathOperationLayout).
 */
import { describe, it, expect } from 'vitest';
import {
  sameNumber,
  sumOperands,
  operationExamScore,
} from '@/apps/_shared/MathOperationLayout';

describe('sameNumber: compara respuestas como números', () => {
  it('acepta coma o punto decimal', () => {
    expect(sameNumber('145,75', '145,75')).toBe(true);
    expect(sameNumber('145.75', '145,75')).toBe(true);
    expect(sameNumber('145,75', 145.75)).toBe(true);
  });

  it('ignora ceros a la izquierda y ceros finales de los decimales', () => {
    expect(sameNumber('0145,75', '145,75')).toBe(true);
    expect(sameNumber('145,0', '145')).toBe(true);
    expect(sameNumber('57,4', '57,40')).toBe(true);
  });

  it('no trunca los decimales (el fallo del examen de 5º y 6º)', () => {
    expect(sameNumber('145,75', '145')).toBe(false);
    expect(sameNumber('145', '145,75')).toBe(false);
    expect(sameNumber('145,7', '145,75')).toBe(false);
  });

  it('una respuesta vacía o no numérica nunca es correcta', () => {
    expect(sameNumber('', '0')).toBe(false);
    expect(sameNumber(undefined, '12')).toBe(false);
    expect(sameNumber(',', '0')).toBe(false);
    expect(sameNumber('1,2,3', '1,2')).toBe(false);
  });

  it('con enteros se comporta como antes', () => {
    expect(sameNumber('579', '579')).toBe(true);
    expect(sameNumber('579', '578')).toBe(false);
  });
});

describe('sumOperands: solución por defecto del examen', () => {
  it('suma decimales con la coma en su sitio', () => {
    expect(sumOperands(['254,6', '727,6'])).toBe('982,2');
    expect(sumOperands(['50,82', '70,00'])).toBe('120,82');
    expect(sumOperands(['124', '443,4'])).toBe('567,4');
    expect(sumOperands(['87', '68,449', '35'])).toBe('190,449');
  });

  it('no arrastra errores de coma flotante', () => {
    expect(sumOperands(['0,1', '0,2'])).toBe('0,3');
    expect(sumOperands(['0,05', '0,01'])).toBe('0,06');
  });

  it('con enteros devuelve la suma de siempre', () => {
    expect(sumOperands(['12', '30'])).toBe('42');
    expect(sumOperands(['999', '1'])).toBe('1000');
  });
});

describe('operationExamScore: nota y puntos del examen', () => {
  it('sin aciertos no hay bonus de rapidez (antes daba ~720 puntos)', () => {
    const r = operationExamScore({ hits: 0, total: 5, elapsedSec: 6 });
    expect(r.nota).toBe(0);
    expect(r.timeBonus).toBe(0);
    expect(r.score).toBe(0);
  });

  it('el bonus de rapidez es proporcional a los aciertos', () => {
    // presupuesto 5 × 30 s = 150 s; (150 − 50) × 5 = 500 puntos de bonus máximo
    expect(operationExamScore({ hits: 5, total: 5, elapsedSec: 50 }).timeBonus).toBe(500);
    expect(operationExamScore({ hits: 3, total: 5, elapsedSec: 50 }).timeBonus).toBe(300);
    expect(operationExamScore({ hits: 1, total: 5, elapsedSec: 50 }).timeBonus).toBe(100);
  });

  it('nota /10 y puntos base de 200 por acierto', () => {
    const r = operationExamScore({ hits: 4, total: 5, elapsedSec: 200 });
    expect(r.nota).toBe(8);
    expect(r.basePoints).toBe(800);
    expect(r.timeBonus).toBe(0); // fuera de presupuesto
    expect(r.score).toBe(800);
  });

  it('score nunca supera maxScore (maxScore sin cambios)', () => {
    const r = operationExamScore({ hits: 5, total: 5, elapsedSec: 1 });
    expect(r.maxScore).toBe(5 * 200 + 150 * 5);
    expect(r.score).toBeLessThanOrEqual(r.maxScore);
  });
});
