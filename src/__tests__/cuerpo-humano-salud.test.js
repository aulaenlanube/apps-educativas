/**
 * Apps del cuerpo humano · Educación Física y salud: lesiones y primeros
 * auxilios y estiramientos (Huesos y Músculos) y las rutas «El esfuerzo» y
 * «El humo» (Viaje por el Cuerpo).
 */
import fs from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';
import { BY_KEY, related } from '@/apps/_shared/anatomia/data/structures';
import { makeBodyWorld } from '@/apps/_shared/anatomia/world';
import { setLang, nameOf } from '@/apps/_shared/anatomia/text';
import { OPTION_COUNT } from '@/apps/_shared/anatomia/qkit';
import * as HM from '@/apps/huesos-musculos/engine/questions';
import { gamesFor as hmGames, platesFor as hmPlates } from '@/apps/huesos-musculos/engine/config';
import {
  LESIONS, LESION_BY_ID, CARE, careWrong, INJURY_TYPES, SPRAIN_GRADES, PRICE_LETTERS, PAS_LETTERS, AID, STRETCHES, STRETCH_RULES,
} from '@/apps/huesos-musculos/engine/salud';
import {
  STRETCH_POSES, STRETCH_FIGS, resolveStretch, VIEWBOX,
} from '@/apps/huesos-musculos/components/stretchRig';
import { HEALTH_TOPICS } from '@/apps/huesos-musculos/components/HealthFigure';
import * as Viaje from '@/apps/viaje-cuerpo/engine/questions';
import {
  ROUTE_BY_ID, EV, NEAR, eventOf, trackFor,
} from '@/apps/viaje-cuerpo/engine/routes';
import { mulberry32 } from '@/apps/sistema-solar/model/rng';

const DATA = 'public/data/anatomia';
const index = JSON.parse(fs.readFileSync(`${DATA}/index.json`, 'utf8'));
const loader = async (id) => JSON.parse(fs.readFileSync(`${DATA}/${id}.json`, 'utf8'));
let world;
beforeAll(async () => {
  world = makeBodyWorld(index, loader);
  await world.ensure(Object.keys(index.plates));
});

const LANGS = ['es', 'en', 'va'];
const DIFFS = ['easy', 'medium', 'exam'];
const tri = (arr, what) => {
  expect(arr, what).toHaveLength(3);
  arr.forEach((t) => expect(typeof t === 'string' && t.trim().length > 0, what).toBe(true));
};

function checkQuestion(q, ctx, { full = false } = {}) {
  expect(q.prompt, JSON.stringify(q).slice(0, 120)).toBeTruthy();
  expect(q.answerLabel).toBeTruthy();
  if (q.kind === 'choice') {
    const keys = q.options.map((o) => o.key);
    const labels = q.options.map((o) => o.label);
    expect(new Set(keys).size, q.prompt).toBe(keys.length);
    expect(new Set(labels).size, q.prompt).toBe(labels.length);
    expect(q.answer.some((a) => keys.includes(a)), q.prompt).toBe(true);
    labels.forEach((l) => expect(l, q.prompt).toBeTruthy());
    // siempre con todas las opciones del modo
    if (full) expect(q.options.length, `${q.game}: ${q.prompt}`).toBe(OPTION_COUNT[ctx.difficulty]);
    if (q.subject?.type === 'map') expect(ctx.world.layer(q.subject.layer).has(q.subject.key), q.prompt).toBe(true);
    if (q.subject?.type === 'stretch') expect(STRETCH_POSES[q.subject.fig], q.subject.fig).toBeTruthy();
    if (q.subject?.type === 'aid') expect(HEALTH_TOPICS, q.subject.topic).toContain(q.subject.topic);
  } else if (q.kind === 'locate') {
    expect(ctx.world.layer(q.layer).has(q.target), `${q.layer}/${q.target}`).toBe(true);
    (q.trail || []).forEach((k) => expect(ctx.world.layer(q.layer).has(k), `trail ${k}`).toBe(true));
  } else if (q.kind === 'sequence') {
    q.stops.forEach((k) => expect(ctx.world.layer(q.layer).has(k), `${q.layer}/${k}`).toBe(true));
    expect(new Set(q.stops).size).toBe(q.stops.length);
  } else if (q.kind !== 'locate-group') {
    throw new Error(`tipo desconocido ${q.kind}`);
  }
}

describe('Lesiones y primeros auxilios: datos', () => {
  it('lesiones en tres idiomas, con qué hacer y estructuras del catálogo', () => {
    expect(LESIONS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(LESIONS.map((l) => l.id)).size).toBe(LESIONS.length);
    for (const l of LESIONS) {
      tri(l.n, `${l.id} n`); tri(l.desc, `${l.id} desc`); tri(l.info, `${l.id} info`);
      expect(l.lv, l.id).toBeGreaterThanOrEqual(4);
      expect(l.lv, l.id).toBeLessThanOrEqual(6);
      expect(CARE[l.care], `${l.id} care`).toBeTruthy();
      if (l.k) expect(BY_KEY[l.k], `${l.id}: ${l.k}`).toBeTruthy();
      (l.near || []).forEach((id) => expect(LESION_BY_ID[id], `${l.id} near ${id}`).toBeTruthy());
      // la descripción no dice el nombre de la lesión
      LANGS.forEach((lang, i) => expect(l.desc[i].toLowerCase().includes(l.n[i].toLowerCase()), `${l.id} ${lang}`).toBe(false));
    }
    // las que pide el temario
    for (const id of ['esguince-tobillo', 'rotura-lca', 'menisco', 'rotura-isquios', 'rotura-gemelo', 'contractura', 'calambre', 'tendinitis-rotuliana', 'tendinitis-aquilea', 'rotura-aquiles', 'fractura-muneca', 'luxacion-hombro', 'manguito', 'epicondilitis', 'periostitis', 'fascitis']) {
      expect(LESION_BY_ID[id], id).toBeTruthy();
    }
  });

  it('«¿Qué se lesiona?»: respuesta y opciones falsas del catálogo, sin parientes', () => {
    for (const l of LESIONS) {
      for (const q of l.qs) {
        tri(q.t, `${l.id} qs`);
        expect(BY_KEY[q.k], `${l.id}: ${q.k}`).toBeTruthy();
        expect(q.wk.length, l.id).toBeGreaterThanOrEqual(3);
        for (const k of q.wk) {
          expect(BY_KEY[k], `${l.id} wk ${k}`).toBeTruthy();
          expect(related(k, q.k) || k === q.k, `${l.id}: ${k} ~ ${q.k}`).toBe(false);
        }
      }
    }
  });

  it('«Toca…»: la estructura está en su lámina y el minijuego carga esa lámina', () => {
    let taps = 0;
    for (const l of LESIONS) {
      for (const t of l.taps) {
        taps += 1;
        tri(t.t, `${l.id} tap`);
        const lv = Math.max(l.lv, t.lv || 0);
        expect(world.layer(t.plate).has(t.k), `${l.id}: ${t.plate}/${t.k}`).toBe(true);
        expect(hmPlates('lesiones', lv), `${l.id}: ${t.plate} en nivel ${lv}`).toContain(t.plate);
      }
    }
    expect(taps).toBeGreaterThanOrEqual(12);
    // el cruzado anterior se toca en la rodilla; el manguito, en el hombro
    expect(LESION_BY_ID['rotura-lca'].taps[0]).toMatchObject({ plate: 'rodilla', k: 'ligamento-cruzado-anterior' });
    expect(LESION_BY_ID.manguito.taps[0]).toMatchObject({ plate: 'hombro', k: 'supraespinoso' });
  });

  it('qué hacer, tipos de lesión, PRICE, PAS y grados en tres idiomas', () => {
    for (const [id, c] of Object.entries(CARE)) {
      tri(c.r, `care ${id}`);
      const w = careWrong(id);
      expect(w.length, id).toBeGreaterThanOrEqual(3);
      w.forEach((x) => tri(x.t, `care ${id} ${x.id}`));
    }
    // nada de calor ni masaje en una lesión aguda
    expect(careWrong('price').map((x) => x.id)).toContain('heat');
    expect(careWrong('inmovilizar').map((x) => x.id)).toContain('reset');
    for (const t of INJURY_TYPES) { tri(t.n, t.id); tri(t.a, t.id); tri(t.d, t.id); }
    expect(PRICE_LETTERS.map((x) => x.l).join('')).toBe('PRICE');
    expect(PAS_LETTERS.map((x) => x.l).join('')).toBe('PAS');
    [...PRICE_LETTERS, ...PAS_LETTERS].forEach((x) => tri(x.m, x.l));
    SPRAIN_GRADES.forEach((g) => tri(g.d, g.id));
  });

  it('preguntas de primeros auxilios completas y fieles al ERC 2021', () => {
    expect(new Set(AID.map((a) => a.id)).size).toBe(AID.length);
    for (const a of AID) {
      tri(a.p, a.id); tri(a.r, a.id);
      if (a.x) tri(a.x, a.id);
      expect(a.w.length, a.id).toBeGreaterThanOrEqual(3);
      a.w.forEach((w) => tri(w, a.id));
      expect(HEALTH_TOPICS, a.id).toContain(a.topic);
    }
    const r = (id) => AID.find((a) => a.id === id).r[0];
    expect(r('rcp-ritmo-30-2')).toMatch(/30 compresiones y 2 insuflaciones/);
    expect(r('rcp-frecuencia')).toMatch(/100 a 120/);
    expect(r('rcp-profundidad')).toMatch(/5 y 6 cent/);
    expect(r('rcp-manos')).toMatch(/centro del pecho/);
    expect(r('rcp-solo-compresiones')).toMatch(/Solo compresiones/);
    expect(r('dea-cuando')).toMatch(/En cuanto llega/);
    expect(r('pls-quien')).toMatch(/respira con normalidad/);
    expect(r('pls-despues')).toMatch(/vigilar que siga respirando/);
    // RCP y posición lateral de seguridad desde 1.º de ESO
    for (const topic of ['rcp', 'pls', 'pas', 'price', 'dea']) expect(AID.some((a) => a.topic === topic && a.lv === 4), topic).toBe(true);
  });
});

describe('Estiramientos: datos y posturas', () => {
  it('cada estiramiento: nombre, cómo se hace, músculo del catálogo visible en su lámina', () => {
    expect(STRETCHES.length).toBeGreaterThanOrEqual(8);
    for (const s of STRETCHES) {
      tri(s.n, s.id); tri(s.how, s.id);
      expect(BY_KEY[s.mus]?.t, s.id).toBe('mus');
      s.also.forEach((k) => expect(BY_KEY[k], `${s.id} also ${k}`).toBeTruthy());
      expect(s.also, s.id).not.toContain(s.mus);
      expect(world.layer(s.plate).has(s.mus), `${s.id}: ${s.plate}/${s.mus}`).toBe(true);
      expect(STRETCH_FIGS, s.id).toContain(s.fig);
      // el nombre del ejercicio no dice el músculo
      LANGS.forEach((lang, i) => expect(s.n[i].toLowerCase().includes(nameOf(s.mus, lang).toLowerCase()), `${s.id} ${lang}`).toBe(false));
    }
    for (const a of STRETCH_RULES) { tri(a.p, a.id); tri(a.r, a.id); expect(a.w.length).toBeGreaterThanOrEqual(3); a.w.forEach((w) => tri(w, a.id)); }
  });

  it('las posturas se resuelven: ángulos finitos, manos y pies en su sitio y todo dentro del dibujo', () => {
    for (const fig of STRETCH_FIGS) {
      const poses = resolveStretch(STRETCH_POSES[fig]);
      expect(poses).toHaveLength(2);
      for (const p of poses) {
        Object.values(p.j).forEach((v) => expect(Number.isFinite(v), fig).toBe(true));
        Object.entries(p.reach).forEach(([limb, err]) => expect(err, `${fig} ${limb}`).toBeLessThan(1.5));
        for (const [name, [x, y]] of Object.entries(p.pts)) {
          expect(x, `${fig} ${name}`).toBeGreaterThanOrEqual(4);
          expect(x, `${fig} ${name}`).toBeLessThanOrEqual(VIEWBOX - 4);
          expect(y, `${fig} ${name}`).toBeGreaterThanOrEqual(4);
          expect(y, `${fig} ${name}`).toBeLessThanOrEqual(VIEWBOX - 4);
        }
      }
      // las dos posturas son distintas (hay movimiento) y el giro es corto
      const [a, b] = poses;
      const moves = Object.keys({ ...a.j, ...b.j }).some((k) => Math.abs((a.j[k] ?? 0) - (b.j[k] ?? 0)) > 3);
      expect(moves, fig).toBe(true);
      Object.keys(b.j).filter((k) => !/^(lt|ls)/.test(k)).forEach((k) => expect(Math.abs((b.j[k] || 0) - (a.j[k] || 0)), `${fig} ${k}`).toBeLessThanOrEqual(180));
      // el músculo iluminado al responder
      expect(STRETCH_POSES[fig].hl.length, fig).toBeGreaterThan(0);
    }
  });
});

describe('Huesos y Músculos: minijuegos de salud', () => {
  it('solo desde 1.º de ESO (nivel 4)', () => {
    expect(hmGames(3).map((g) => g.id)).not.toContain('lesiones');
    expect(hmGames(3).map((g) => g.id)).not.toContain('estiramientos');
    expect(hmGames(4).map((g) => g.id)).toEqual(expect.arrayContaining(['lesiones', 'estiramientos']));
  });

  it('rondas de 10 completas en todos los niveles, idiomas y modos, con todas las opciones', () => {
    let seed = 7;
    for (const lv of [4, 5, 6]) {
      for (const g of ['lesiones', 'estiramientos']) {
        for (const lang of LANGS) {
          for (const difficulty of DIFFS) {
            setLang(lang);
            const ctx = { lv, region: 'all', difficulty, world, lang, rng: mulberry32(seed += 1) };
            const qs = HM.buildRound(ctx, g, 10);
            expect(qs.length, `${g} ${lv} ${lang} ${difficulty}`).toBe(10);
            qs.forEach((q) => { expect(q.game, q.prompt).toBe(g); checkQuestion(q, ctx, { full: true }); });
          }
        }
      }
    }
    setLang('es');
  });

  it('a lo largo de varias rondas salen todos los tipos de pregunta', () => {
    const seen = { locate: 0, stretch: 0, map: 0, aid: 0 };
    const prompts = new Set();
    for (let seed = 1; seed <= 25; seed += 1) {
      const ctx = { lv: 6, region: 'all', difficulty: 'medium', world, lang: 'es', rng: mulberry32(seed) };
      for (const q of [...HM.buildRound(ctx, 'lesiones', 10), ...HM.buildRound({ ...ctx, rng: mulberry32(seed + 100) }, 'estiramientos', 10)]) {
        if (q.kind === 'locate') seen.locate += 1;
        if (q.subject?.type) seen[q.subject.type] = (seen[q.subject.type] || 0) + 1;
        prompts.add(q.prompt);
      }
    }
    Object.entries(seen).forEach(([k, v]) => expect(v, k).toBeGreaterThan(0));
    expect([...prompts].some((p) => /RCP/.test(p))).toBe(true);
    expect([...prompts].some((p) => /posición lateral de seguridad/.test(p))).toBe(true);
    expect([...prompts].some((p) => /cruzado anterior/.test(p))).toBe(true);
  });

  it('en «¿Qué músculo estira?» ninguna opción falsa la estira también', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const ctx = { lv: 5, region: 'all', difficulty: 'exam', world, lang: 'es', rng: mulberry32(seed) };
      for (const q of HM.buildRound(ctx, 'estiramientos', 10)) {
        if (q.subject?.type !== 'stretch') continue;
        const s = STRETCHES.find((x) => x.fig === q.subject.fig);
        q.options.filter((o) => o.key !== s.mus).forEach((o) => {
          expect(s.also.includes(o.key) || related(o.key, s.mus), `${s.id}: ${o.key}`).toBe(false);
        });
      }
    }
  });

  it('el examen mezcla los minijuegos de salud desde el nivel 4', () => {
    const games = new Set();
    for (let seed = 1; seed <= 12; seed += 1) {
      HM.buildRound({ lv: 4, region: 'all', difficulty: 'exam', world, lang: 'es', rng: mulberry32(seed) }, 'exam', 10).forEach((q) => games.add(q.game));
    }
    expect(games.has('lesiones')).toBe(true);
    expect(games.has('estiramientos')).toBe(true);
  });
});

describe('Viaje por el Cuerpo: «El esfuerzo» y «El humo»', () => {
  it('rutas desde el nivel 4, paradas en sus láminas y sucesos propios en tres idiomas', () => {
    for (const id of ['esfuerzo', 'humo']) {
      const r = ROUTE_BY_ID[id];
      expect(r, id).toBeTruthy();
      expect(r.from).toBe(4);
      tri(r.t, id); tri(r.d, id);
      expect(Viaje.gamesFor(3).map((x) => x.id)).not.toContain(id);
      expect(Viaje.gamesFor(4).map((x) => x.id)).toContain(id);
      for (const lv of [4, 5, 6]) {
        const { stops } = trackFor(r, lv);
        expect(stops.length, `${id} ${lv}`).toBeGreaterThanOrEqual(9);
        for (const s of stops) {
          expect(world.layer(s.plate).has(s.k), `${id}: ${s.plate}/${s.k}`).toBe(true);
          expect(EV[`${s.k}@${id}`], `${id}: ${s.k} sin suceso propio`).toBeTruthy();
          tri(eventOf(id, s.k), `${id} ${s.k}`);
        }
        expect(new Set(stops.map((s) => s.k)).size, `${id} ${lv}`).toBe(stops.length);
      }
      (NEAR[id] || []).flat().forEach((k) => expect(trackFor(r, 6).stops.some((s) => s.k === k), `${id} near ${k}`).toBe(true));
    }
    const esf = trackFor(ROUTE_BY_ID.esfuerzo, 4).stops.map((s) => s.k);
    expect(esf[0]).toBe('fosas-nasales');
    expect(esf.indexOf('alveolos')).toBeLessThan(esf.indexOf('corazon'));
    expect(esf.indexOf('aorta')).toBeLessThan(esf.indexOf('arteria-femoral'));
    expect(esf[esf.length - 1]).toBe('cuadriceps');
    const humo = trackFor(ROUTE_BY_ID.humo, 4).stops.map((s) => s.k);
    expect(humo[0]).toBe('boca');
    expect(humo.slice(-1)[0]).toBe('cerebro');
  });

  it('rondas de 10 completas en todos los niveles, idiomas y modos, y llegan al músculo y al cerebro', () => {
    let seed = 300;
    for (const lv of [4, 5, 6]) {
      for (const id of ['esfuerzo', 'humo']) {
        for (const lang of LANGS) {
          for (const difficulty of DIFFS) {
            setLang(lang);
            const ctx = { lv, region: 'all', difficulty, world, lang, rng: mulberry32(seed += 1) };
            const qs = Viaje.buildRound(ctx, id, 10);
            expect(qs.length, `${id} ${lv} ${lang} ${difficulty}`).toBe(10);
            qs.forEach((q) => checkQuestion(q, ctx));
            expect(qs[qs.length - 1].kind, `${id}: ordenar al final`).toBe('sequence');
            const key = id === 'esfuerzo' ? 'cuadriceps' : 'cerebro';
            expect(qs.some((q) => q.card?.title === nameOf(key, lang)), `${id} ${lv} ${lang}: ${key}`).toBe(true);
          }
        }
      }
    }
    setLang('es');
  });

  it('con más paradas que preguntas se reparten, con las claves y la última', () => {
    const stops = Array.from({ length: 14 }, (_, i) => ({ k: `s${i}`, must: i === 5 }));
    const idx = Viaje.firstPassStops(stops, 8);
    expect(idx).toHaveLength(8);
    expect(idx).toContain(5);
    expect(idx).toContain(13);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(Viaje.firstPassStops(stops.slice(0, 6), 8)).toEqual([1, 2, 3, 4, 5]);
  });
});
