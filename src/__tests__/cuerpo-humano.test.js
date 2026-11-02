/**
 * Apps del cuerpo humano (Explorador del Cuerpo Humano, Huesos y Músculos,
 * Viaje por el Cuerpo): catálogo, láminas generadas (public/data/anatomia),
 * textos en tres idiomas y generadores de preguntas.
 */
import fs from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';
import { STRUCTURES, BY_KEY } from '@/apps/_shared/anatomia/data/structures';
import { SYSTEMS, SYSTEM_BY_ID } from '@/apps/_shared/anatomia/data/systems';
import { PLATES, PLATE_BY_ID } from '@/apps/_shared/anatomia/data/plates';
import { makeBodyWorld } from '@/apps/_shared/anatomia/world';
import {
  withArt, ofSystem, setLang, nameOf, funcOf, kindOf,
} from '@/apps/_shared/anatomia/text';
import { HORMONES, DISEASES, SENSES } from '@/apps/_shared/anatomia/data/extras';
import * as Cuerpo from '@/apps/explorador-cuerpo/engine/questions';
import { courseLevel, gamesFor as cuerpoGames, platesFor as cuerpoPlates, GAMES as CUERPO_GAMES } from '@/apps/explorador-cuerpo/engine/config';
import * as HM from '@/apps/huesos-musculos/engine/questions';
import { gamesFor as hmGames, platesFor as hmPlates } from '@/apps/huesos-musculos/engine/config';
import { ZONE, MOVES, EXERCISES, ANTAGONISTS } from '@/apps/huesos-musculos/engine/data';
import { MOVEMENT_FIGS } from '@/apps/huesos-musculos/components/MovementFigure';
import { judgeMapPick } from '@/apps/_shared/geo/QuizPlay';
import * as Viaje from '@/apps/viaje-cuerpo/engine/questions';
import { ROUTES, EV, eventOf, trackFor } from '@/apps/viaje-cuerpo/engine/routes';
import { HAND_PLATES } from '../../tools/anatomy/hand-plates.mjs';
import { mulberry32 } from '@/apps/sistema-solar/model/rng';

const DATA = 'public/data/anatomia';
const index = JSON.parse(fs.readFileSync(`${DATA}/index.json`, 'utf8'));
const loader = async (id) => JSON.parse(fs.readFileSync(`${DATA}/${id}.json`, 'utf8'));
let world;
beforeAll(async () => {
  world = makeBodyWorld(index, loader);
  await world.ensure(Object.keys(index.plates));
});

describe('Catálogo de estructuras', () => {
  it('claves únicas, sistema conocido, nivel 1-6 y nombre en los tres idiomas', () => {
    const keys = STRUCTURES.map((s) => s.k);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of STRUCTURES) {
      expect(SYSTEM_BY_ID[s.s], s.k).toBeTruthy();
      (s.s2 || []).forEach((x) => expect(SYSTEM_BY_ID[x], `${s.k} s2 ${x}`).toBeTruthy());
      expect(s.l, s.k).toBeGreaterThanOrEqual(1);
      expect(s.l, s.k).toBeLessThanOrEqual(6);
      expect(s.n).toHaveLength(3);
      s.n.forEach((n) => expect(n, s.k).toBeTruthy());
    }
  });

  it('las láminas del índice existen y sus estructuras están en el catálogo', () => {
    for (const [id, p] of Object.entries(index.plates)) {
      expect(PLATE_BY_ID[id], `lámina ${id} sin metadatos`).toBeTruthy();
      expect(fs.existsSync(`public${p.img}`), p.img).toBe(true);
      for (const k of p.keys) expect(BY_KEY[k], `${id}: ${k}`).toBeTruthy();
    }
    for (const p of PLATES) if (p.pair) expect(PLATE_BY_ID[p.pair], p.id).toBeTruthy();
  });

  it('las láminas dibujadas piden claves del catálogo', () => {
    for (const p of HAND_PLATES) for (const k of p.keys) expect(BY_KEY[k], `${p.id}: ${k}`).toBeTruthy();
  });

  it('cada lámina cargada tiene rutas, anclas y encuadre', () => {
    for (const id of Object.keys(index.plates)) {
      const scope = world.scope(id);
      expect(scope.width).toBeGreaterThan(100);
      for (const e of scope.entries.values()) {
        expect(e.d.startsWith('M'), `${id}/${e.key}`).toBe(true);
        expect(e.centroid).toHaveLength(2);
        const v = scope.focusView(e.key);
        expect(v.w).toBeGreaterThan(0);
      }
    }
  });
});

describe('Textos en tres idiomas', () => {
  it('artículos y elisiones', () => {
    expect(withArt('corazon', 'es')).toBe('el corazón');
    expect(withArt('pulmones', 'es')).toBe('los pulmones');
    expect(withArt('corazon', 'en')).toBe('the heart');
    expect(withArt('estomago', 'va')).toBe("l'estómac");
    expect(withArt('uretra', 'va')).toBe('la uretra');
    expect(withArt('hipofisis', 'va')).toBe('la hipòfisi');
    expect(withArt('dientes', 'va')).toBe('les dents');
    expect(withArt('area-broca', 'en')).toBe("the Broca's area");
    expect(ofSystem('digestivo', 'es')).toBe('del aparato digestivo');
    expect(ofSystem('digestivo', 'va')).toBe("de l'aparell digestiu");
    expect(ofSystem('nervioso', 'va')).toBe('del sistema nerviós');
    expect(kindOf('tiroides', 'va')).toBe('glàndula');
  });

  it('datos extra en tres idiomas', () => {
    for (const h of HORMONES) { expect(h.n).toHaveLength(3); expect(h.d).toHaveLength(3); expect(BY_KEY[h.gland], h.id).toBeTruthy(); }
    for (const d of DISEASES) { expect(d.n).toHaveLength(3); expect(BY_KEY[d.organ], d.id).toBeTruthy(); }
    for (const s of SENSES) expect(BY_KEY[s.organ], s.id).toBeTruthy();
    for (const m of MOVES) { expect(m.n).toHaveLength(3); expect(BY_KEY[m.mus], m.id).toBeTruthy(); expect(MOVEMENT_FIGS).toContain(m.fig); }
    for (const e of EXERCISES) e.mus.forEach((m) => expect(BY_KEY[m], e.id).toBeTruthy());
    for (const [a, b] of ANTAGONISTS) { expect(BY_KEY[a]).toBeTruthy(); expect(BY_KEY[b]).toBeTruthy(); }
  });
});

const LEVELS = [1, 2, 3, 4, 5, 6];
const DIFFS = ['easy', 'medium', 'exam'];

function checkQuestion(q, ctx) {
  expect(q.prompt, JSON.stringify(q).slice(0, 120)).toBeTruthy();
  expect(q.answerLabel).toBeTruthy();
  if (q.kind === 'choice') {
    expect(q.options.length, `${q.game}: ${q.prompt}`).toBeGreaterThanOrEqual(2);
    const keys = q.options.map((o) => o.key);
    expect(new Set(keys).size, q.prompt).toBe(keys.length);
    expect(q.answer.some((a) => keys.includes(a)), q.prompt).toBe(true);
    q.options.forEach((o) => expect(o.label, q.prompt).toBeTruthy());
    if (q.subject?.type === 'map') expect(ctx.world.layer(q.subject.layer).has(q.subject.key), q.prompt).toBe(true);
    if (q.subject?.type === 'shape') expect(ctx.world.shapePath(q.subject.key, 300, 18, q.subject.layer)).toMatch(/^M/);
  } else if (q.kind === 'locate') {
    expect(ctx.world.layer(q.layer).has(q.target), `${q.layer}/${q.target}`).toBe(true);
    (q.trail || []).forEach((k) => expect(ctx.world.layer(q.layer).has(k), `trail ${k}`).toBe(true));
  } else if (q.kind === 'locate-group') {
    expect([...ctx.world.layer(q.layer).values()].some((e) => e.cont === q.target), `${q.layer} grupo ${q.target}`).toBe(true);
  } else if (q.kind === 'sequence') {
    q.stops.forEach((k) => expect(ctx.world.layer(q.layer).has(k), `${q.layer}/${k}`).toBe(true));
    expect(new Set(q.stops).size).toBe(q.stops.length);
  } else {
    throw new Error(`tipo desconocido ${q.kind}`);
  }
}

describe.each([
  ['Explorador del Cuerpo Humano', Cuerpo.buildRound, cuerpoGames],
  ['Huesos y Músculos', HM.buildRound, hmGames],
  ['Viaje por el Cuerpo', Viaje.buildRound, Viaje.gamesFor],
])('%s', (name, buildRound, gamesFor) => {
  it('rondas de 10 preguntas válidas en todos los niveles, idiomas y modos', () => {
    let seed = 1;
    for (const lv of LEVELS) {
      for (const g of [...gamesFor(lv).map((x) => x.id), 'exam']) {
        for (const lang of ['es', 'en', 'va']) {
          setLang(lang);
          const difficulty = DIFFS[seed % 3];
          const ctx = { lv, region: 'all', difficulty, world, lang, rng: mulberry32(seed += 1) };
          const qs = buildRound(ctx, g, 10);
          expect(qs.length, `${name} ${g} nivel ${lv} ${lang}`).toBe(10);
          qs.forEach((q) => checkQuestion(q, ctx));
        }
      }
    }
    setLang('es');
  });

  it('el duelo no incluye recorridos para ordenar', () => {
    for (const lv of [3, 5, 6]) {
      const qs = buildRound({ lv, region: 'all', difficulty: 'exam', world, lang: 'es', duel: true, rng: mulberry32(lv) }, 'exam', 10);
      expect(qs).toHaveLength(10);
      qs.forEach((q) => expect(q.kind).not.toBe('sequence'));
    }
  });
});

describe('Configuración por curso', () => {
  it('niveles y asignaturas de idioma', () => {
    expect(courseLevel('primaria', 1)).toBe(1);
    expect(courseLevel('primaria', 6)).toBe(3);
    expect(courseLevel('eso', 3)).toBe(5);
    expect(courseLevel('bachillerato', 2)).toBe(6);
    expect(courseLevel('primaria', 6, 'ingles')).toBe(2);
    expect(courseLevel('ad', 1, 'vocabulario')).toBe(1);
    expect(cuerpoGames(1).length).toBeLessThan(cuerpoGames(6).length);
    expect(cuerpoGames(6)).toHaveLength(CUERPO_GAMES.length);
  });

  it('las láminas que pide cada minijuego están en los metadatos', () => {
    for (const lv of LEVELS) {
      for (const id of [...cuerpoPlates('exam', lv), ...hmPlates('exam', lv), ...Viaje.platesFor('exam', lv)]) {
        expect(PLATE_BY_ID[id], id).toBeTruthy();
      }
    }
  });

  it('zonas de Huesos y Músculos y rutas del Viaje', () => {
    for (const k of Object.keys(ZONE)) expect(BY_KEY[k], k).toBeTruthy();
    for (const r of ROUTES) {
      expect(r.t).toHaveLength(3);
      for (const tr of r.tracks) for (const s of tr.stops) {
        expect(BY_KEY[s.k], `${r.id}: ${s.k}`).toBeTruthy();
        expect(eventOf(r.id, s.k), `${r.id}: ${s.k} sin evento`).toBeTruthy();
        expect(PLATE_BY_ID[s.plate || tr.main], `${r.id}: ${s.plate || tr.main}`).toBeTruthy();
      }
      expect(trackFor(r, 6).stops.length).toBeGreaterThan(2);
    }
    for (const [k, ev] of Object.entries(EV)) expect(ev, k).toHaveLength(3);
  });
});

describe('Zonas contenedoras de las láminas dibujadas', () => {
  it('tocar una zona interior cuenta como la contenedora, pero no al revés', () => {
    const scope = world.scope('diente');
    const q = { kind: 'locate', layer: 'diente', target: 'corona' };
    expect(scope.entries.get('corona').contains).toContain('esmalte');
    expect(judgeMapPick(q, 'esmalte', null, [], scope)).toBe(true);
    expect(judgeMapPick({ ...q, target: 'esmalte' }, 'corona', null, [], scope)).toBe(false);
    const sangre = world.scope('sangre');
    expect(judgeMapPick({ kind: 'locate', layer: 'sangre', target: 'globulos-blancos' }, 'linfocito', null, [], sangre)).toBe(true);
    expect(judgeMapPick({ kind: 'locate', layer: 'sangre', target: 'plasma' }, 'globulos-rojos', null, [], sangre)).toBe(false);
  });
});

describe('Funciones traducidas', () => {
  it('si hay traducción de la función, se usa en ese idioma', () => {
    const k = 'corazon';
    expect(funcOf(k, 'es')).toBe(BY_KEY[k].p);
    const en = funcOf(k, 'en');
    if (en) expect(en).not.toBe(BY_KEY[k].p);
    expect(nameOf(k, 'va')).toBe('Cor');
    expect(SYSTEMS.length).toBeGreaterThan(10);
  });
});
