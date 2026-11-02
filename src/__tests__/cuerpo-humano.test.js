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
import { MUSCLES_DEEP, MUSCLES_A, MUSCLES_P } from '../../tools/anatomy/plates.mjs';
import { ORIGEN_INSERCION, related } from '@/apps/_shared/anatomia/data/structures';
import { distractors } from '@/apps/_shared/anatomia/qkit';
import { oriOf, insOf } from '@/apps/_shared/anatomia/text';
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

describe('Musculatura profunda, grupos y origen e inserción', () => {
  it('MUSCLES_DEEP: claves únicas, del catálogo, sin repetir las de mus-a/mus-p y con el mismo grupo que el catálogo', () => {
    const keys = MUSCLES_DEEP.map((p) => p.k);
    expect(new Set(keys).size).toBe(keys.length);
    const shallow = new Set([...MUSCLES_A, ...MUSCLES_P].map((p) => p.k));
    for (const p of MUSCLES_DEEP) {
      expect(BY_KEY[p.k]?.t, p.k).toBe('mus');
      expect(shallow.has(p.k), p.k).toBe(false);
      expect(p.grp ?? null, p.k).toBe(BY_KEY[p.k].grp ?? null);
      p.el.forEach((re) => expect(re.source, p.k).toMatch(/\(left\|right\)|^\^spinalis\$$/i));
    }
    expect(STRUCTURES.filter((s) => s.t === 'mus').length).toBeGreaterThanOrEqual(75);
  });

  it('los grupos apuntan a claves del catálogo y las láminas profundas los usan como cont', () => {
    for (const s of STRUCTURES) {
      if (s.grp && s.s !== 'ext' && s.t !== 'reg') expect(BY_KEY[s.grp], `${s.k} → ${s.grp}`).toBeTruthy();
      (s.sim || []).forEach((k) => expect(BY_KEY[k], `${s.k} sim ${k}`).toBeTruthy());
    }
    const conts = (id) => [...world.layer(id).values()].map((e) => e.cont);
    expect(conts('mus-prof-a').filter((c) => c === 'cuadriceps').length).toBeGreaterThanOrEqual(3);
    expect(conts('mus-prof-p').filter((c) => c === 'isquiotibiales').length).toBe(3);
    expect(conts('mus-prof-p').filter((c) => c === 'manguito-rotador').length).toBeGreaterThanOrEqual(3);
    const q = { kind: 'locate-group', layer: 'mus-prof-a', target: 'cuadriceps' };
    expect(judgeMapPick(q, 'vasto-lateral', 'cuadriceps', [], world)).toBe(true);
    expect(judgeMapPick(q, 'aductor-largo', 'aductores', [], world)).toBe(false);
  });

  it('un músculo y su grupo (o uno de acción parecida) no salen como opción falsa', () => {
    expect(related('recto-femoral', 'cuadriceps')).toBe(true);
    expect(related('cuadriceps', 'vasto-medial')).toBe(true);
    expect(related('menisco-medial', 'menisco')).toBe(true);
    expect(related('braquial', 'biceps')).toBe(true);
    expect(related('vasto-lateral', 'recto-femoral')).toBe(false);
    expect(related('cuello', 'cabeza')).toBe(false);
    const ctx = { difficulty: 'exam', lang: 'es', rng: mulberry32(3) };
    for (let i = 0; i < 20; i += 1) {
      const ds = distractors({ ...ctx, rng: mulberry32(i) }, 'recto-femoral', ['cuadriceps', 'iliopsoas', 'vasto-lateral', 'sartorio', 'aductores', 'gemelos'], 3);
      expect(ds).not.toContain('cuadriceps');
      expect(ds).not.toContain('iliopsoas');
    }
  });

  it('origen e inserción: músculos del catálogo, en los tres idiomas', () => {
    for (const k of Object.keys(ORIGEN_INSERCION)) {
      expect(BY_KEY[k]?.t, k).toBe('mus');
      for (const lang of ['es', 'en', 'va']) {
        expect(oriOf(k, lang), `${k} ${lang}`).toBeTruthy();
        expect(insOf(k, lang), `${k} ${lang}`).toBeTruthy();
      }
    }
    expect(Object.keys(ORIGEN_INSERCION).length).toBeGreaterThanOrEqual(40);
  });

  it('el minijuego de origen e inserción no repite respuestas entre las opciones', () => {
    for (const lang of ['es', 'en', 'va']) {
      setLang(lang);
      for (let seed = 1; seed <= 12; seed += 1) {
        const ctx = { lv: 6, region: 'all', difficulty: 'exam', world, lang, rng: mulberry32(seed * 31) };
        const qs = HM.buildRound(ctx, 'origen', 10);
        expect(qs).toHaveLength(10);
        for (const q of qs) {
          checkQuestion(q, ctx);
          if (q.kind === 'choice') {
            const labels = q.options.map((o) => o.label);
            expect(new Set(labels).size, q.prompt).toBe(labels.length);
            const right = q.answer[0];
            q.options.filter((o) => o.key !== right).forEach((o) => expect(related(o.key, right), `${q.prompt}: ${o.key}`).toBe(false));
          }
        }
      }
    }
    setLang('es');
  });

  it('láminas nuevas: perfiles, músculos profundos, rodilla y hombro', () => {
    for (const id of ['mus-prof-a', 'mus-prof-p', 'esq-l', 'mus-l', 'rodilla', 'hombro']) expect(index.plates[id], id).toBeTruthy();
    const rod = world.layer('rodilla');
    for (const k of ['ligamento-cruzado-anterior', 'menisco-medial', 'menisco-lateral', 'ligamento-colateral-medial']) expect(rod.get(k)?.area, k).toBeGreaterThan(1500);
    expect(rod.get('rotula').covered).toBe(true);
    const hom = world.layer('hombro');
    for (const k of ['supraespinoso', 'bursa-subacromial', 'rodete-glenoideo', 'tendon-biceps']) expect(hom.get(k)?.area, k).toBeGreaterThan(1500);
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
