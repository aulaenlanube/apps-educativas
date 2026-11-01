/**
 * Explorador de España: datos de comunidades y provincias, geometría real
 * (public/data/geo/espana.json), relieve y generadores de preguntas.
 */
import fs from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';
import {
  CCAA, PROVINCES, CCAA_BY_ID, ZONES, provKey, provincesOf, isProvKey, provOfKey, ccaaFlag,
} from '@/apps/explorador-espana/data/spain';
import { ALL_RELIEF, RIVERS, VERTIENTES } from '@/apps/explorador-espana/data/relief';
import { buildSpain } from '@/apps/explorador-espana/geo/spain';
import { courseLevel, gamesFor, poolText } from '@/apps/explorador-espana/engine/config';
import { buildRound, OPTION_COUNT, ROUND_SIZE } from '@/apps/explorador-espana/engine/questions';
import { geoOf } from '@/apps/explorador-espana/espanaConfig';
import { mulberry32 } from '@/apps/sistema-solar/model/rng';

let spain;
let geo;
beforeAll(() => {
  spain = buildSpain(JSON.parse(fs.readFileSync('public/data/geo/espana.json', 'utf8')));
  geo = geoOf(spain);
});

describe('Datos de España', () => {
  it('17 comunidades + Ceuta y Melilla, 50 provincias + 2 ciudades autónomas', () => {
    expect(CCAA).toHaveLength(19);
    expect(CCAA.filter((c) => !c.autonomous)).toHaveLength(17);
    expect(PROVINCES).toHaveLength(52);
    expect(PROVINCES.filter((p) => !p.autonomous)).toHaveLength(50);
    expect(new Set(PROVINCES.map((p) => p.ine)).size).toBe(52);
  });

  it('cada provincia pertenece a una comunidad y cada comunidad tiene sus provincias', () => {
    const count = Object.fromEntries(CCAA.map((c) => [c.id, provincesOf(c.id).length]));
    expect(count).toMatchObject({ an: 8, cl: 9, cm: 5, ga: 4, ct: 4, vc: 3, pv: 3, ar: 3, cn: 2, ex: 2, md: 1, as: 1, ce: 1, ml: 1 });
    PROVINCES.forEach((p) => expect(CCAA_BY_ID[p.ccaa], p.name).toBeTruthy());
    CCAA.forEach((c) => {
      expect(ZONES.map((z) => z.id)).toContain(c.zone);
      expect(fs.existsSync(`public${ccaaFlag(c)}`), c.id).toBe(true);
    });
  });

  it('las claves de provincia no se confunden con País Vasco', () => {
    expect(isProvKey('p28')).toBe(true);
    expect(isProvKey('pv')).toBe(false);
    expect(provOfKey('p36').name).toBe('Pontevedra');
    expect(provOfKey('pv')).toBeNull();
  });

  it('texto de lo que entra en juego', () => {
    expect(poolText(1)).toBe('17 comunidades autónomas');
    expect(poolText(3)).toBe('19 comunidades y ciudades autónomas y 50 provincias');
  });
});

describe('Geometría de España', () => {
  it('todas las comunidades y provincias del IGN tienen su región en el mapa', () => {
    CCAA.forEach((c) => expect(spain.layers.ccaa.get(c.id)?.d.length, c.id).toBeGreaterThan(10));
    PROVINCES.forEach((p) => expect(spain.layers.prov.get(provKey(p))?.d.length, p.name).toBeGreaterThan(10));
    expect(spain.layers.ccaa.get('t:20').terr.name).toBe('Gibraltar');
    expect(spain.layers.prov.get('p51').marker).toBe(true); // Ceuta
  });

  it('vecinos por límite compartido', () => {
    const nb = (k, l) => [...spain.neighborsOf(k, l)].sort();
    expect(nb('md', 'ccaa')).toEqual(['cl', 'cm']);
    expect(nb('ga', 'ccaa')).toEqual(['as', 'cl']);
    expect(nb('ib', 'ccaa')).toEqual([]);
    expect(nb('cn', 'ccaa')).toEqual([]);
    expect(nb('p28', 'prov')).toEqual(['p05', 'p16', 'p19', 'p40', 'p45']);
    expect(nb('pv', 'ccaa')).toEqual(expect.arrayContaining(['cb', 'cl', 'nc', 'ri']));
  });

  it('Canarias va en su recuadro y no pisa la península', () => {
    const f = spain.views.canarias;
    const inFrame = ([x, y]) => x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h;
    for (const e of spain.layers.prov.values()) {
      if (e.terr) continue;
      expect(inFrame(e.centroid), e.name).toBe(e.canary);
    }
    expect(spain.projection([-6.35, 36.72])[0]).toBeGreaterThan(f.x + f.w); // costa de Cádiz
    expect(spain.projection([-5.32, 35.89])[0]).toBeGreaterThan(f.x + f.w); // Ceuta
  });

  it('relieve completo: ríos, montañas, mares e islas', () => {
    ALL_RELIEF.forEach((r) => expect(spain.features.has(r.id), r.id).toBe(true));
    RIVERS.forEach((r) => expect(Object.keys(VERTIENTES)).toContain(r.v));
    expect(spain.features.get('tenerife').kind).toBe('area');
    expect(spain.features.get('cantabrico').kind).toBe('point');
    expect(spain.features.get('ebro').kind).toBe('line');
  });

  it('siluetas de comunidades y provincias', () => {
    expect(spain.shapePath('an', 200, 10, 'ccaa').length).toBeGreaterThan(200);
    expect(spain.shapePath('p28', 200, 10, 'prov').length).toBeGreaterThan(100);
    expect(spain.shapePath('cn', 200, 10, 'ccaa').length).toBeGreaterThan(100);
  });
});

describe('Preguntas de España', () => {
  it('cada curso tiene sus minijuegos', () => {
    const ids = (lv) => gamesFor(lv).map((g) => g.id);
    expect(courseLevel('primaria', 2)).toBe(1);
    expect(ids(1)).toEqual(['donde', 'siluetas', 'banderas']);
    expect(ids(2)).toEqual(expect.arrayContaining(['capitales', 'relieve']));
    expect(ids(2)).not.toContain('provincias');
    expect(ids(3)).toContain('provincias');
    expect(ids(4)).toContain('vecinos');
  });

  it('preguntas válidas en todos los cursos y dificultades', () => {
    const sp = spain;
    let count = 0;
    for (let lv = 1; lv <= 6; lv += 1) {
      for (const difficulty of ['easy', 'medium', 'exam']) {
        for (const g of [...gamesFor(lv), { id: 'exam' }]) {
          const round = buildRound({ lv, difficulty, geo, rng: mulberry32(lv * 100 + count) }, g.id);
          expect(round).toHaveLength(ROUND_SIZE);
          for (const q of round) {
            expect(q.prompt).toBeTruthy();
            if (q.kind === 'choice') {
              const keys = q.options.map((o) => o.key);
              expect(new Set(keys).size, q.prompt).toBe(keys.length);
              expect(keys.filter((k) => q.answer.includes(k)), q.prompt).toHaveLength(1);
              const fixed = q.prompt.includes('vertiente') || q.prompt.startsWith('¿Cuántas');
              if (!fixed) expect(keys.length, q.prompt).toBe(OPTION_COUNT[difficulty]);
            } else if (q.kind === 'locate') {
              expect(sp.layer(q.layer).has(q.target), q.prompt).toBe(true);
              expect(sp.views[q.view], q.view).toBeTruthy();
            } else if (q.kind === 'locate-feature') {
              expect(q.featurePool).toContain(q.target);
              expect(q.featurePool.length).toBeGreaterThanOrEqual(3);
              expect(sp.views[q.view], q.view).toBeTruthy();
            }
            if (q.subject?.type === 'shape') expect(sp.shapePath(q.subject.key, 100, 6, q.subject.layer).length).toBeGreaterThan(20);
            if (q.subject?.type === 'feature') expect(sp.features.has(q.subject.key)).toBe(true);
            if (q.game === 'vecinos') {
              const layer = isProvKey(q.answer[0]) ? 'prov' : 'ccaa';
              const center = q.subject.key;
              expect(new Set(sp.neighborsOf(center, layer)).has(q.answer[0]), q.prompt).toBe(true);
              q.options.filter((o) => o.key !== q.answer[0]).forEach((o) => expect(new Set(sp.neighborsOf(center, layer)).has(o.key), q.prompt).toBe(false));
            }
            count += 1;
          }
        }
      }
    }
    expect(count).toBeGreaterThan(1000);
  });

  it('en Primaria baja no salen provincias y en 5.º sí', () => {
    const r1 = buildRound({ lv: 1, difficulty: 'easy', geo, rng: mulberry32(5) }, 'donde', 30);
    expect(r1.every((q) => q.layer === 'ccaa')).toBe(true);
    const r3 = buildRound({ lv: 3, difficulty: 'easy', geo, rng: mulberry32(5) }, 'donde', 30);
    expect(r3.some((q) => q.layer === 'prov')).toBe(true);
  });

  it('la trampa de Galicia: Santiago, no A Coruña', () => {
    let found = false;
    for (let s = 0; s < 300 && !found; s += 1) {
      const q = buildRound({ lv: 2, difficulty: 'medium', geo, rng: mulberry32(s) }, 'capitales').find((x) => x.prompt === '¿Cuál es la capital de Galicia?');
      if (q) {
        expect(q.answer).toEqual(['Santiago de Compostela']);
        expect(q.options.map((o) => o.key)).toContain('A Coruña');
        found = true;
      }
    }
    expect(found).toBe(true);
  });
});
