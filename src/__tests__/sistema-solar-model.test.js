/**
 * Sistema Solar 3D: datos, generadores de preguntas, nota/puntos de las
 * misiones y progreso local. La nota y los puntos que se envían a
 * onGameComplete salen de missionScoring.buildPayload.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  FACTS, PLANET_IDS, fmt, fmtSmart, fmtHours, fmtSeconds, fmtTravel, volumeVsEarth, weightOn, ageOn, lightSeconds,
} from '@/apps/sistema-solar/model/planetFacts';
import { INTERIORS, layersFor, visualLayerRadii, MIN_VISUAL_THICKNESS } from '@/apps/sistema-solar/model/interiors';
import { RIDDLES } from '@/apps/sistema-solar/model/riddles';
import { MISSIONS, tierFor, questionCount } from '@/apps/sistema-solar/model/missions';
import {
  makeVersusQuestions, makeTripQuestions, makeRiddles, makeLayerQuestions, makeExamQuestions,
  correctOrder, orderRoundsFor, scrambled, METRICS, isClearPair, RIDDLE_BODIES, clueGivesAway,
} from '@/apps/sistema-solar/model/questions';
import { mulberry32 } from '@/apps/sistema-solar/model/rng';
import {
  notaSobre10, missionResult, buildPayload, speedBonus, streakBonus, PERFECT_BONUS,
} from '@/apps/sistema-solar/missionScoring';
import {
  emptyProgress, recordMission, totalStars, rankFor, isUnlocked, starsForNota, loadProgress, saveProgress,
  progressKey, sanitize, MAX_STARS,
} from '@/apps/sistema-solar/progress';
import {
  lineupPositions, orbitRadius, bodySize, meanLongitude, orbitRate, spinRate, SIM_SECONDS_PER_YEAR,
} from '@/apps/sistema-solar/scene/layout';

describe('Datos de los planetas', () => {
  it('los planetas van ordenados por distancia al Sol', () => {
    const au = PLANET_IDS.map((id) => FACTS[id].au);
    expect([...au].sort((a, b) => a - b)).toEqual(au);
    expect(correctOrder('distance')).toEqual(PLANET_IDS);
  });

  it('coherencia física: densidad ≈ masa / volumen y UA ≈ millones de km / 149,6', () => {
    for (const id of [...PLANET_IDS, 'moon']) {
      const f = FACTS[id];
      const r = (f.diameterKm / 2) * 1e5; // cm
      const rho = (f.massKg * 1000) / ((4 / 3) * Math.PI * r ** 3);
      expect(Math.abs(rho - f.density) / f.density).toBeLessThan(0.12);
      if (id !== 'moon') expect(Math.abs(f.distMkm / 149.6 - f.au) / f.au).toBeLessThan(0.01);
    }
  });

  it('3ª ley de Kepler: T² ≈ a³ con los periodos de la ficha', () => {
    for (const id of PLANET_IDS) {
      const T = FACTS[id].orbitDays / 365.25;
      expect(Math.abs(T ** 2 - FACTS[id].au ** 3) / FACTS[id].au ** 3).toBeLessThan(0.02);
    }
  });

  it('órdenes de tamaño, masa y densidad conocidos', () => {
    expect(correctOrder('size')).toEqual(['jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'mercury']);
    expect(correctOrder('mass')).toEqual(['jupiter', 'saturn', 'neptune', 'uranus', 'earth', 'venus', 'mars', 'mercury']);
    expect(correctOrder('density')[0]).toBe('earth');
    expect(correctOrder('density').at(-1)).toBe('saturn');
    // Venus es el más caliente aunque Mercurio esté más cerca
    expect(FACTS.venus.tempMeanC).toBeGreaterThan(FACTS.mercury.tempMeanC);
  });

  it('formato español con millares y decimales', () => {
    expect(fmt(4879)).toBe('4.879');
    expect(fmt(1392700)).toBe('1.392.700');
    expect(fmt(-65)).toBe('−65');
    expect(fmt(3.71, 2)).toBe('3,71');
    expect(fmtSmart(0.387)).toBe('0,387');
    expect(fmtSmart(5.204)).toBe('5,2');
    expect(fmtHours(23.93)).toBe('23 h 56 min');
    expect(fmtHours(9.93)).toBe('9 h 56 min');
    expect(fmtSeconds(499)).toBe('8 min 19 s');
    expect(fmtTravel(24 * 400)).toBe('400 días');
  });

  it('cálculos de la ficha: volumen, peso, edad y luz', () => {
    expect(Math.round(volumeVsEarth('jupiter').times)).toBe(1320);
    expect(volumeVsEarth('mars').bigger).toBe(false);
    const w = weightOn('mars', 50);
    expect(w.scaleKg).toBeCloseTo(18.9, 1);
    expect(w.newtons).toBeCloseTo(185, 0);
    expect(weightOn('mars', 0)).toBeNull();
    expect(ageOn('mercury', 12)).toBeCloseTo(49.8, 1);
    expect(ageOn('moon', 12)).toBeNull();
    expect(lightSeconds('earth')).toBeCloseTo(499, 0);
  });
});

describe('Interiores', () => {
  it('cada cuerpo tiene capas contiguas, ordenadas y una superficie', () => {
    for (const [id, it] of Object.entries(INTERIORS)) {
      for (const set of [it.layers, it.basicLayers].filter(Boolean)) {
        expect(set[0].rIn).toBe(0);
        for (let i = 1; i < set.length; i++) expect(set[i].rIn).toBeCloseTo(set[i - 1].rOut, 6);
        const surf = set.filter((l) => l.surface);
        expect(surf, id).toHaveLength(1);
        expect(surf[0].rOut).toBe(1);
        expect(new Set(set.map((l) => l.id)).size).toBe(set.length);
        for (const l of set) {
          expect(l.name && l.color && l.clue && (l.desc || l.basic), `${id}/${l.id}`).toBeTruthy();
        }
      }
    }
  });

  it('el modelo visual da grosor mínimo a las capas finas y deja la superficie en 1', () => {
    const v = visualLayerRadii(INTERIORS.earth.layers);
    const crust = v.find((l) => l.id === 'crust');
    expect(crust.vOut).toBeCloseTo(1, 6);
    expect(crust.exaggerated).toBe(true);
    expect(crust.vOut - crust.vIn).toBeGreaterThan(MIN_VISUAL_THICKNESS * 0.9);
    for (let i = 1; i < v.length; i++) expect(v[i].vIn).toBeCloseTo(v[i - 1].vOut, 6);
    // la corona del Sol queda fuera de la superficie
    const sun = visualLayerRadii(INTERIORS.sun.layers);
    expect(sun.find((l) => l.id === 'corona').vOut).toBeGreaterThan(1.2);
  });

  it('Primaria usa el modelo sencillo de la Tierra', () => {
    expect(layersFor('earth', 1).map((l) => l.id)).toEqual(['core', 'mantle', 'crust']);
    expect(layersFor('earth', 4)).toHaveLength(5);
  });
});

describe('Generadores de preguntas', () => {
  const tiers = [1, 2, 3, 4, 5];

  it('tierFor según el curso', () => {
    expect(tierFor('primaria', '2')).toBe(1);
    expect(tierFor('primaria', '6')).toBe(2);
    expect(tierFor('eso', '1')).toBe(3);
    expect(tierFor('eso', '4')).toBe(4);
    expect(tierFor('bachillerato', '1')).toBe(5);
  });

  it('¿Más o menos?: número exacto, respuesta = el mayor y pares claros', () => {
    for (const t of tiers) {
      for (let s = 1; s < 40; s++) {
        const qs = makeVersusQuestions(t, mulberry32(s));
        expect(qs).toHaveLength(questionCount('versus', t));
        for (const q of qs) {
          const [a, b] = q.options;
          expect(a).not.toBe(b);
          expect(q.raw[q.answer]).toBe(Math.max(q.raw[a], q.raw[b]));
          const metric = METRICS.find((m) => m.id === q.metric);
          expect(metric.minTier).toBeLessThanOrEqual(t);
          expect(isClearPair(metric, a, b, t)).toBe(true);
        }
      }
    }
  });

  it('nunca pregunta Urano vs Neptuno por temperatura (dato ambiguo)', () => {
    const temp = METRICS.find((m) => m.id === 'temp');
    for (const t of tiers) expect(isClearPair(temp, 'uranus', 'neptune', t)).toBe(false);
  });

  it('Plan de vuelo: opciones distintas y una respuesta válida', () => {
    for (const t of tiers) {
      for (let s = 1; s < 40; s++) {
        const qs = makeTripQuestions(t, mulberry32(s));
        expect(qs).toHaveLength(questionCount('viaje', t));
        for (const q of qs) {
          expect(new Set(q.options).size).toBe(q.options.length);
          if (q.type === 'choice') {
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.answer).toBeLessThan(q.options.length);
          } else {
            expect(q.options).toContain(q.answer);
          }
        }
      }
    }
  });

  it('la luz tarda unos 8 minutos en llegar a la Tierra en la opción correcta', () => {
    for (let s = 1; s < 200; s++) {
      const q = makeTripQuestions(4, mulberry32(s)).find((x) => x.trip === 'light' && x.prompt.includes('la Tierra'));
      if (q) { expect(q.options[q.answer]).toBe('8 min 19 s'); return; }
    }
    throw new Error('no se generó la pregunta');
  });

  it('¿Qué planeta soy?: astros distintos con 3 pistas', () => {
    for (const t of tiers) {
      const r = makeRiddles(t, mulberry32(7));
      expect(r).toHaveLength(questionCount('adivina', t));
      expect(new Set(r.map((x) => x.answer)).size).toBe(r.length);
      for (const x of r) {
        expect(RIDDLE_BODIES).toContain(x.answer);
        expect(x.clues).toHaveLength(3);
      }
    }
    for (const id of RIDDLE_BODIES) expect(RIDDLES[id].basic).toHaveLength(3);
  });

  it('Viaje al interior: capas existentes, sin repetir y agrupadas por cuerpo', () => {
    for (const t of tiers) {
      for (let s = 1; s < 30; s++) {
        const qs = makeLayerQuestions(t, mulberry32(s));
        expect(qs).toHaveLength(questionCount('capas', t));
        const keys = qs.map((q) => `${q.bodyId}/${q.answer}`);
        expect(new Set(keys).size).toBe(keys.length);
        for (const q of qs) expect(layersFor(q.bodyId, t).some((l) => l.id === q.answer)).toBe(true);
        const bodies = qs.map((q) => q.bodyId);
        const changes = bodies.filter((b, i) => i > 0 && b !== bodies[i - 1]).length;
        expect(changes).toBe(new Set(bodies).size - 1);
      }
    }
  });

  it('las descripciones no regalan el nombre de la capa', () => {
    const moon = INTERIORS.moon.layers;
    expect(clueGivesAway(moon.find((l) => l.id === 'molten'), moon)).toBe(true);
    const earth = INTERIORS.earth.layers;
    expect(clueGivesAway(earth.find((l) => l.id === 'outer-core'), earth)).toBe(false);
    for (let s = 1; s < 30; s++) {
      for (const q of makeLayerQuestions(5, mulberry32(s)).filter((x) => x.byClue)) {
        const layers = layersFor(q.bodyId, 5);
        expect(clueGivesAway(layers.find((l) => l.id === q.answer), layers)).toBe(false);
      }
    }
  });

  it('Gran examen: 10 preguntas con respuesta entre las opciones', () => {
    for (const t of tiers) {
      for (let s = 1; s < 20; s++) {
        const qs = makeExamQuestions(t, mulberry32(s));
        expect(qs).toHaveLength(10);
        for (const q of qs) {
          if (q.type === 'choice') expect(q.options[q.answer]).toBeTruthy();
          else expect(q.options).toContain(q.answer);
        }
      }
    }
  });

  it('Ordena: rondas por nivel y barajado nunca resuelto', () => {
    expect(orderRoundsFor(1)).toEqual(['distance']);
    expect(orderRoundsFor(5)).toEqual(['distance', 'mass', 'density']);
    for (let s = 1; s < 50; s++) expect(scrambled(PLANET_IDS, mulberry32(s))).not.toEqual(PLANET_IDS);
  });
});

describe('Nota y puntos de las misiones', () => {
  it('nota = aciertos/total·10 con 1 decimal y capada a 10', () => {
    expect(notaSobre10(7, 10)).toBe(7);
    expect(notaSobre10(5, 6)).toBe(8.3);
    expect(notaSobre10(12, 10)).toBe(10);
    expect(notaSobre10(0, 0)).toBe(0);
  });

  it('pleno suma bonus y los puntos nunca pasan de maxScore', () => {
    const r = missionResult({ correct: 8, total: 8, bonus: 9999, bonusMax: 400 });
    expect(r.nota).toBe(10);
    expect(r.perfectBonus).toBe(PERFECT_BONUS);
    expect(r.points).toBe(r.maxScore);
    const r2 = missionResult({ correct: 4, total: 8, bonus: 120, bonusMax: 400 });
    expect(r2.points).toBe(520);
    expect(r2.nota).toBe(5);
  });

  it('payload de onGameComplete en modo examen', () => {
    const r = missionResult({ correct: 6, total: 10, bonus: 50, bonusMax: 500 });
    expect(buildPayload(r, 61.4)).toEqual({
      mode: 'test', score: 650, maxScore: 1700, correctAnswers: 6, totalQuestions: 10, durationSeconds: 61, nota: 6,
    });
    expect(buildPayload(r, 0).durationSeconds).toBe(1);
  });

  it('bonus de rapidez y racha', () => {
    expect(speedBonus(0, 10, 50)).toBe(50);
    expect(speedBonus(5, 10, 50)).toBe(25);
    expect(speedBonus(30, 10, 50)).toBe(0);
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(3)).toBe(50);
    expect(streakBonus(20)).toBe(100);
  });
});

describe('Progreso del explorador', () => {
  beforeEach(() => localStorage.clear());

  it('estrellas por nota, mejor resultado y rangos', () => {
    expect([4.9, 5, 7, 9].map(starsForNota)).toEqual([0, 1, 2, 3]);
    let p = emptyProgress();
    p = recordMission(p, 'ordena', { nota: 9.5, points: 900 });
    p = recordMission(p, 'ordena', { nota: 6, points: 1000 });
    expect(p.missions.ordena).toMatchObject({ best: 9.5, bestPoints: 1000, plays: 2, stars: 3, last: 6 });
    expect(totalStars(p)).toBe(3);
    expect(rankFor(3).rank.id).toBe('piloto');
    expect(rankFor(MAX_STARS).next).toBeNull();
  });

  it('desbloqueos por estrellas', () => {
    const capas = MISSIONS.find((m) => m.id === 'capas');
    let p = emptyProgress();
    expect(isUnlocked(MISSIONS[0], p)).toBe(true);
    expect(isUnlocked(capas, p)).toBe(false);
    p = recordMission(p, 'versus', { nota: 7 });
    expect(isUnlocked(capas, p)).toBe(true);
  });

  it('guarda por etapa y tolera datos corruptos', () => {
    const p = recordMission(emptyProgress(), 'adivina', { nota: 8, points: 500 });
    saveProgress('eso', p);
    expect(loadProgress('eso').missions.adivina.stars).toBe(2);
    expect(loadProgress('primaria').missions).toEqual({});
    localStorage.setItem(progressKey('eso'), '{roto');
    expect(loadProgress('eso')).toEqual(emptyProgress());
    expect(sanitize({ v: 2, missions: { ordena: { best: 99, stars: 9 } } }).missions.ordena).toMatchObject({ best: 10, stars: 3 });
  });
});

describe('Escalas y movimiento de la escena', () => {
  it('fila de tamaños: sin solaparse y empezando fuera del Sol', () => {
    const pos = lineupPositions();
    let prev = FACTS.sun.radiusRel;
    for (const id of PLANET_IDS) {
      expect(pos[id] - bodySize(id, 'tamanos')).toBeGreaterThan(prev);
      prev = pos[id] + bodySize(id, 'tamanos') * (id === 'saturn' ? 2.35 : 1);
    }
  });

  it('en «distancias reales» el radio es proporcional a la UA y fuera del Sol', () => {
    for (const id of PLANET_IDS) {
      expect(orbitRadius(id, 'distancias') / FACTS[id].au).toBeCloseTo(orbitRadius('earth', 'distancias'), 6);
      expect(orbitRadius(id, 'distancias')).toBeGreaterThan(bodySize('sun', 'distancias') + bodySize(id, 'distancias'));
    }
  });

  it('periodos reales relativos: la Tierra da una vuelta en SIM_SECONDS_PER_YEAR', () => {
    expect((2 * Math.PI) / orbitRate('earth')).toBeCloseTo(SIM_SECONDS_PER_YEAR, 3);
    expect(orbitRate('mercury') / orbitRate('earth')).toBeCloseTo(365.25 / 88, 3);
    expect(spinRate('venus')).toBeLessThan(0);
    expect(spinRate('uranus')).toBeLessThan(0);
    expect(spinRate('jupiter')).toBeGreaterThan(spinRate('earth'));
  });

  it('longitud media: la Tierra avanza ~360° en un año', () => {
    const a = meanLongitude('earth', new Date(Date.UTC(2026, 0, 1)));
    const b = meanLongitude('earth', new Date(Date.UTC(2027, 0, 1, 6)));
    expect(Math.abs(b - a)).toBeLessThan(0.02);
  });
});
