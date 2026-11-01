/**
 * Explorador del Mundo: datos de países, geometría (world-50m.json real),
 * generadores de preguntas de los 7 minijuegos y puntuación.
 */
import fs from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';
import {
  COUNTRIES, BY_ISO, CONTINENTS, INHABITED, SUBREGIONS, formatPopulation, largestCity,
} from '@/apps/explorador-mundo/data/countries';
import { CITIES, OCEANS, SIMILAR_FLAGS, TERRITORIES, IDENTICAL_FLAGS } from '@/apps/explorador-mundo/data/extras';
import { buildWorld, continentGlyphs, attachRelief } from '@/apps/explorador-mundo/geo/world';
import { RELIEF, RELIEF_TYPES } from '@/apps/explorador-mundo/data/relief';
import { courseLevel, LEVELS, gamesFor, countryPool, REGIONS } from '@/apps/explorador-mundo/engine/config';
import { buildRound, examSequence, OPTION_COUNT, ROUND_SIZE } from '@/apps/explorador-mundo/engine/questions';
import { questionPoints, maxRoundPoints, notaFrom, speedBonus, streakBonus } from '@/apps/_shared/geo/scoring';
import { judgeMapPick } from '@/apps/_shared/geo/QuizPlay';
import { mulberry32 } from '@/apps/sistema-solar/model/rng';

let world;
let geo;
beforeAll(() => {
  world = buildWorld(JSON.parse(fs.readFileSync('public/data/geo/world-50m.json', 'utf8')));
  attachRelief(world, JSON.parse(fs.readFileSync('public/data/geo/relief-50m.json', 'utf8')));
  geo = {
    locatable: (iso) => world.entries.has(iso),
    hasShape: (iso) => Boolean(world.entries.get(iso)?.hasShape),
    neighbors: (iso) => world.neighbors.get(iso) || [],
    hasFeature: (id) => world.features.has(id),
  };
});

describe('Datos de países', () => {
  it('195 estados: 193 de la ONU + Vaticano y Palestina', () => {
    expect(COUNTRIES).toHaveLength(195);
    expect(new Set(COUNTRIES.map((k) => k.c)).size).toBe(195);
    expect(new Set(COUNTRIES.map((k) => k.n)).size).toBe(195);
    const byCont = {};
    COUNTRIES.forEach((k) => { byCont[k.cont] = (byCont[k.cont] || 0) + 1; });
    expect(byCont).toEqual({ europa: 45, asia: 47, africa: 54, america: 35, oceania: 14 });
  });

  it('cada país tiene los campos obligatorios bien formados', () => {
    for (const k of COUNTRIES) {
      expect(k.c).toMatch(/^[a-z]{2}$/);
      expect(k.name.length).toBeGreaterThan(2);
      expect(k.cap.length).toBeGreaterThan(2);
      expect(INHABITED).toContain(k.cont);
      if (k.cont2) expect(INHABITED).toContain(k.cont2);
      expect(SUBREGIONS[k.sub]).toBeTruthy();
      expect(k.sub.slice(0, 2)).toBe({ europa: 'eu', asia: 'as', africa: 'af', america: 'am', oceania: 'oc' }[k.cont]);
      expect([1, 2, 3, 4, 5]).toContain(k.t);
      expect(k.pop).toBeGreaterThan(0);
      if (k.city) expect(k.city).not.toBe(k.cap);
      expect(fs.existsSync(`public/images/flags/${k.c}.svg`)).toBe(true);
    }
  });

  it('las ciudades, banderas parecidas y territorios apuntan a datos válidos', () => {
    for (const ci of CITIES) {
      expect(BY_ISO[ci.c]).toBeTruthy();
      expect(ci.name).not.toBe(BY_ISO[ci.c].cap);
      ci.notWith.forEach((c) => expect(BY_ISO[c]).toBeTruthy());
    }
    expect(new Set(CITIES.map((ci) => ci.name)).size).toBe(CITIES.length);
    SIMILAR_FLAGS.flat().forEach((c) => expect(BY_ISO[c]).toBeTruthy());
    Object.values(TERRITORIES).forEach((t) => expect(Object.keys(CONTINENTS)).toContain(t.cont));
    expect(OCEANS).toHaveLength(5);
  });

  it('formatea la población de forma legible', () => {
    expect(formatPopulation(48.6)).toBe('≈ 49 millones');
    expect(formatPopulation(5.3)).toBe('≈ 5,3 millones');
    expect(formatPopulation(0.039)).toBe('≈ 39.000 habitantes');
    expect(formatPopulation(0.0008)).toBe('≈ 800 habitantes');
    expect(largestCity(BY_ISO.au)).toBe('Sídney');
    expect(largestCity(BY_ISO.es)).toBe('Madrid');
    expect(largestCity(BY_ISO.ph)).toBeNull();
  });
});

describe('Geometría del mundo', () => {
  it('todos los países tienen geometría o punto en el mapa', () => {
    for (const k of COUNTRIES) {
      const e = world.entries.get(k.c);
      expect(e, k.c).toBeTruthy();
      expect(e.d.length > 0 || e.marker, k.c).toBe(true);
    }
  });

  it('las geometrías fusionadas cuentan como su país (Chipre del Norte, Hong Kong…)', () => {
    expect([...world.entries.keys()].some((key) => key === 't:NCY' || key === 't:344')).toBe(false);
    expect(world.entries.get('t:KOS').terr.name).toBe('Kosovo');
    expect(world.entries.get('t:010').cont).toBe('antartida');
  });

  it('vecinos por frontera terrestre', () => {
    const nb = (c) => [...world.neighbors.get(c)].sort();
    expect(nb('es')).toEqual(['ad', 'fr', 'pt']);
    expect(nb('pt')).toEqual(['es']);
    expect(nb('fr')).toEqual(expect.arrayContaining(['es', 'be', 'de', 'it', 'ch', 'br']));
    expect(world.neighbors.get('ru').size).toBeGreaterThanOrEqual(13);
    expect(world.neighbors.get('jp').size).toBe(0);
  });

  it('el cuerpo principal deja fuera los territorios lejanos', () => {
    const fr = world.entries.get('fr');
    const [[x0], [x1]] = fr.bodyBounds;
    expect(x1 - x0).toBeLessThan(50); // sin la Guayana ni Reunión
    expect(fr.parts.map((p) => p.cont).sort()).toEqual(['africa', 'america']);
    expect(world.entries.get('es').parts.map((p) => p.cont)).toEqual(['africa']); // Canarias
  });

  it('microestados y archipiélagos llevan punto tocable; siluetas solo si se reconocen', () => {
    for (const c of ['va', 'mc', 'sm', 'ad', 'mt', 'sg', 'tv', 'nr', 'km', 'ki']) expect(world.entries.get(c).marker, c).toBe(true);
    for (const c of ['es', 'it', 'br', 'jp', 'au']) expect(world.entries.get(c).hasShape).toBe(true);
    expect(world.entries.get('va').hasShape).toBe(false);
    expect(world.shapePath('it', 200).length).toBeGreaterThan(200);
    expect(world.shapePath('va', 200)).toBe('');
  });

  it('glifos de continentes ligeros y vistas de país válidas', () => {
    const g = continentGlyphs(world);
    expect(Object.keys(g).sort()).toEqual(['africa', 'america', 'antartida', 'asia', 'europa', 'oceania']);
    Object.values(g).forEach((d) => expect(d.length).toBeLessThan(20000));
    const v = world.focusView('va', null, true);
    expect(v.w).toBeGreaterThanOrEqual(60);
    expect(world.glyph('africa')).toBe(g.africa);
  });
});

describe('Niveles por curso', () => {
  it('cada curso tiene su nivel', () => {
    expect(courseLevel('primaria', 1)).toBe(1);
    expect(courseLevel('primaria', 4)).toBe(2);
    expect(courseLevel('primaria', 6)).toBe(3);
    expect(courseLevel('eso', 2)).toBe(4);
    expect(courseLevel('eso', 4)).toBe(5);
    expect(courseLevel('bachillerato', 1)).toBe(6);
  });

  it('los minijuegos se desbloquean con el curso', () => {
    const ids = (lv) => gamesFor(lv).map((g) => g.id);
    expect(ids(1)).toEqual(['donde', 'siluetas', 'banderas', 'continentes']);
    expect(ids(2)).toContain('capitales');
    expect(ids(2)).not.toContain('relieve');
    expect(ids(3)).toContain('relieve');
    expect(ids(3)).not.toContain('ciudades');
    expect(ids(4)).toContain('ciudades');
    expect(ids(4)).not.toContain('vecinos');
    expect(ids(5)).toContain('vecinos');
  });

  it('el número de países crece con el nivel y la región nunca se queda corta', () => {
    const sizes = [1, 2, 3, 4, 5].map((lv) => countryPool(lv).length);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes[0]).toBe(20);
    expect(sizes[4]).toBe(195);
    for (let lv = 2; lv <= 6; lv += 1) {
      for (const r of REGIONS) expect(countryPool(lv, r.id).length, `${lv}/${r.id}`).toBeGreaterThanOrEqual(8);
    }
    expect(countryPool(5, 'all')).toHaveLength(195);
  });
});

describe('Generadores de preguntas', () => {
  const DIFFS = ['easy', 'medium', 'exam'];

  const checkQuestion = (q, lv, difficulty) => {
    expect(['choice', 'locate', 'locate-group', 'locate-feature']).toContain(q.kind);
    expect(q.prompt).toBeTruthy();
    if (q.kind === 'choice') {
      const keys = q.options.map((o) => o.key);
      expect(new Set(keys).size, q.prompt).toBe(keys.length);
      expect(keys.some((k) => q.answer.includes(k)), q.prompt).toBe(true);
      // solo una opción correcta (salvo continentes transcontinentales: las dos valen)
      if (q.variant !== 'glyphs') expect(keys.filter((k) => q.answer.includes(k))).toHaveLength(1);
      const fixed = q.variant === 'glyphs' || q.subject?.type === 'point';
      if (!fixed) expect(keys.length, q.prompt).toBe(OPTION_COUNT[difficulty]);
      q.options.forEach((o) => expect(o.label).toBeTruthy());
    } else if (q.kind === 'locate') {
      expect(BY_ISO[q.target]).toBeTruthy();
      expect(q.attempts).toBeGreaterThanOrEqual(1);
      expect(world.views[q.view]).toBeTruthy();
    } else if (q.kind === 'locate-feature') {
      expect(world.features.has(q.target)).toBe(true);
      expect(q.featurePool).toContain(q.target);
      expect(q.featurePool.length).toBeGreaterThanOrEqual(3);
      q.featurePool.forEach((id) => expect(world.features.has(id)).toBe(true));
      expect(world.views[q.view]).toBeTruthy();
    } else {
      expect(Object.keys(CONTINENTS)).toContain(q.target);
    }
    if (q.subject?.type === 'feature') expect(world.features.has(q.subject.key)).toBe(true);
    if (q.subject?.type === 'shape') expect(world.entries.get(q.subject.key).hasShape).toBe(true);
    if (q.subject?.type === 'map') expect(world.entries.has(q.subject.key)).toBe(true);
    if (q.subject?.type === 'point') expect(world.points[q.subject.key]).toBeTruthy();
    if (q.variant === 'glyphs') q.options.forEach((o) => expect(world.glyph(o.glyph).length).toBeGreaterThan(50));
    if (q.game === 'capitales' && q.subject.type === 'card') {
      const k = BY_ISO[q.subject.flag];
      expect(k.noCapQ).toBeFalsy();
      (k.capAlt || []).forEach((alt) => expect(q.options.map((o) => o.key)).not.toContain(alt));
      expect(q.answer).toEqual([k.cap]);
      expect(k.t).toBeLessThanOrEqual(Math.max(LEVELS[lv].capTier, 5));
    }
    if (q.game === 'vecinos') {
      const nb = world.neighbors.get(q.highlight);
      expect(nb.has(q.answer[0])).toBe(true);
      q.options.filter((o) => o.key !== q.answer[0]).forEach((o) => {
        expect(nb.has(o.key), q.prompt).toBe(false);
        expect(world.neighbors.get(o.key).size, `${o.key} es una isla`).toBeGreaterThan(0);
      });
    }
    if (q.game === 'siluetas') expect(world.entries.get(q.subject.key).hasShape).toBe(true);
    if (q.game === 'banderas') {
      const keys = q.options.map((o) => o.key);
      IDENTICAL_FLAGS.forEach(([a, b]) => expect(keys.includes(a) && keys.includes(b), q.prompt).toBe(false));
    }
    if (q.game === 'ciudades' && q.subject.type === 'card') {
      expect(q.answer[0]).toBe(largestCity(BY_ISO[q.subject.flag]));
    }
  };

  it('preguntas válidas en todos los cursos, dificultades y regiones', () => {
    let count = 0;
    for (let lv = 1; lv <= 6; lv += 1) {
      for (const difficulty of DIFFS) {
        for (const r of LEVELS[lv].regions ? [{ id: 'all' }, ...REGIONS] : [{ id: 'all' }]) {
          for (const g of gamesFor(lv)) {
            const rng = mulberry32(lv * 1000 + count);
            const round = buildRound({ lv, region: r.id, difficulty, geo, rng }, g.id);
            expect(round).toHaveLength(ROUND_SIZE);
            round.forEach((q) => { expect(q.game).toBe(g.id); checkQuestion(q, lv, difficulty); });
            count += round.length;
          }
        }
      }
    }
    expect(count).toBeGreaterThan(3000);
  });

  it('una ronda no repite país mientras queden', () => {
    const round = buildRound({ lv: 3, region: 'all', difficulty: 'medium', geo, rng: mulberry32(7) }, 'banderas');
    const isos = round.map((q) => q.card.flag);
    expect(new Set(isos).size).toBe(isos.length);
  });

  it('los países del curso no se salen de su escalón (región mundo)', () => {
    for (let lv = 1; lv <= 4; lv += 1) {
      const round = buildRound({ lv, region: 'all', difficulty: 'easy', geo, rng: mulberry32(lv) }, 'donde');
      round.forEach((q) => expect(BY_ISO[q.target].t).toBeLessThanOrEqual(LEVELS[lv].tier));
    }
  });

  it('el examen mezcla minijuegos del curso sin repetir seguido', () => {
    const seq = examSequence(['a', 'b', 'c', 'd'], 10, mulberry32(3));
    expect(seq).toHaveLength(10);
    for (let i = 1; i < seq.length; i += 1) expect(seq[i]).not.toBe(seq[i - 1]);
    const exam = buildRound({ lv: 1, region: 'all', difficulty: 'exam', geo, rng: mulberry32(11) }, 'exam');
    expect(exam).toHaveLength(10);
    const allowed = gamesFor(1).map((g) => g.id);
    exam.forEach((q) => expect(allowed).toContain(q.game));
    expect(new Set(exam.map((q) => q.game)).size).toBe(allowed.length);
    exam.filter((q) => q.kind !== 'choice').forEach((q) => expect(q.attempts).toBe(1));
  });

  it('la trampa de la capital aparece en Medio (Australia → Sídney)', () => {
    let found = false;
    for (let s = 0; s < 400 && !found; s += 1) {
      const round = buildRound({ lv: 2, region: 'oceania', difficulty: 'medium', geo, rng: mulberry32(s) }, 'capitales');
      const q = round.find((x) => x.card?.flag === 'au' && x.subject.type === 'card');
      if (q) { expect(q.options.map((o) => o.key)).toContain('Sídney'); found = true; }
    }
    expect(found).toBe(true);
  });
});

describe('Relieve', () => {
  it('todos los accidentes tienen geometría, nombre y dato curioso', () => {
    expect(new Set(RELIEF.map((r) => r.id)).size).toBe(RELIEF.length);
    for (const r of RELIEF) {
      const f = world.features.get(r.id);
      expect(f, r.id).toBeTruthy();
      expect(f.d.length).toBeGreaterThan(20);
      expect(RELIEF_TYPES[r.type]).toBeTruthy();
      expect(r.art).toMatch(/^(el|la|los|las) /);
      expect(r.fact.length).toBeGreaterThan(15);
      expect(f.kind).toBe(r.type === 'river' ? 'line' : 'area');
      expect(world.featureView(r.id).w).toBeGreaterThan(0);
    }
  });

  it('el río Colorado es el de Estados Unidos, no el de Argentina', () => {
    const [a, b] = world.features.get('colorado').bounds.map((p) => world.projection.invert(p));
    expect(a[0]).toBeGreaterThan(-125);
    expect(b[0]).toBeLessThan(-100);
    expect(b[1]).toBeGreaterThan(25); // hemisferio norte
  });

  it('el examen incluye relieve desde 5.º de Primaria y no antes', () => {
    const games = (lv) => new Set(buildRound({ lv, region: 'all', difficulty: 'exam', geo, rng: mulberry32(99) }, 'exam', 40).map((q) => q.game));
    expect(games(2).has('relieve')).toBe(false);
    expect(games(3).has('relieve')).toBe(true);
  });

  it('juzga bien los toques en el mapa', () => {
    const q = { kind: 'locate-feature', target: 'nilo', featurePool: ['nilo', 'congo', 'niger'] };
    expect(judgeMapPick(q, 'nilo', '', [])).toBe(true);
    expect(judgeMapPick(q, 'congo', '', [])).toBe(false);
    expect(judgeMapPick(q, 'es', 'europa', [])).toBeNull(); // un país no cuenta
    expect(judgeMapPick(q, 'congo', '', [{ key: 'congo' }])).toBeNull(); // ya probado
    const g = { kind: 'locate-group', target: 'europa' };
    expect(judgeMapPick(g, 'fr', 'europa', [])).toBe(true);
    expect(judgeMapPick(g, 'br', 'america', [{ key: 'ar', cont: 'america' }])).toBeNull();
    const l = { kind: 'locate', target: 'es' };
    expect(judgeMapPick(l, 'es', 'europa', [], world)).toBe(true);
    expect(judgeMapPick(l, 'pt', 'europa', [], world)).toBe(false);
  });
});

describe('Puntuación', () => {
  it('nota /10 con un decimal', () => {
    expect(notaFrom(7, 10)).toBe(7);
    expect(notaFrom(2, 3)).toBe(6.7);
    expect(notaFrom(0, 0)).toBe(0);
  });

  it('puntos por acierto, rapidez, racha e intentos', () => {
    expect(questionPoints({ correct: false })).toBe(0);
    expect(questionPoints({ correct: true, seconds: 0, streak: 1 })).toBe(150);
    expect(questionPoints({ correct: true, seconds: 30, streak: 1 })).toBe(100);
    expect(questionPoints({ correct: true, seconds: 30, streak: 3 })).toBe(120);
    expect(questionPoints({ correct: true, attempt: 2, seconds: 0, streak: 1 })).toBe(50);
    expect(questionPoints({ correct: true, seconds: 30, streak: 1, hint: true })).toBe(50);
    expect(speedBonus(7.5)).toBe(25);
    expect(streakBonus(20)).toBe(50);
    expect(maxRoundPoints(10)).toBe(10 * 150 + 350);
  });
});
