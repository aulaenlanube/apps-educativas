/**
 * Apps del cuerpo humano · funciones del atlas y de las láminas:
 * deslizador de capas, órganos vivos (latido y respiración), elección de voz
 * para la pronunciación y maquetación de las láminas imprimibles.
 */
import fs from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';
import { makeBodyWorld } from '@/apps/_shared/anatomia/world';
import {
  LAYER_BASES, layerStack, stackFor, layerMix, dominantLayer, stepLayer, createMixStore, layerBase,
} from '@/apps/_shared/anatomia/layers';
import { livingOf, livingPaused, originPct, LUNG_LOBES } from '@/apps/_shared/anatomia/living';
import { pickVoice, voiceScore } from '@/apps/_shared/anatomia/speech';
import {
  spread, layoutCallouts, printPlan, fitPlate, wrapLabel, PAGE_MM, RESERVE_H, MUTE,
} from '@/apps/_shared/anatomia/printLayout';
import { nameOf } from '@/apps/_shared/anatomia/text';
import { APP_UI } from '@/apps/_shared/anatomia/uiStrings';

const DATA = 'public/data/anatomia';
const index = JSON.parse(fs.readFileSync(`${DATA}/index.json`, 'utf8'));
const loader = async (id) => JSON.parse(fs.readFileSync(`${DATA}/${id}.json`, 'utf8'));
let world;
beforeAll(async () => {
  world = makeBodyWorld(index, loader);
  await world.ensure(Object.keys(index.plates));
});

describe('Deslizador de capas', () => {
  it('cada vista apila sus láminas de cuerpo entero de fuera adentro', () => {
    for (const view of ['a', 'p']) {
      const s = layerStack(index, view);
      expect(s.length, view).toBeGreaterThanOrEqual(2);
      expect(s[0]).toBe(`cuerpo-${view}`);
      expect(s[s.length - 1]).toBe(`esq-${view}`);
      // en el orden de LAYER_BASES, solo láminas de cuerpo entero de esa vista y mismo encuadre
      const ranks = s.map((id) => LAYER_BASES.indexOf(layerBase(id)));
      expect([...ranks].sort((x, y) => x - y)).toEqual(ranks);
      for (const id of s) {
        expect(index.plates[id].frame, id).toBe('body');
        expect(id.endsWith(`-${view}`), id).toBe(true);
        expect([index.plates[id].w, index.plates[id].h]).toEqual([index.plates[s[0]].w, index.plates[s[0]].h]);
      }
      // vasos y nervios no son capas
      expect(s.some((id) => /^(vas|nerv)-/.test(id))).toBe(false);
    }
  });

  it('pila de una lámina: solo capas, filtradas por el atlas del curso', () => {
    expect(stackFor(index, 'org-a')).toContain('org-a');
    expect(stackFor(index, 'vas-a')).toBeNull();
    expect(stackFor(index, 'corazon')).toBeNull();
    expect(stackFor(index, 'org-a', (id) => id !== 'org-a')).toBeNull();
    const twoOnly = stackFor(index, 'cuerpo-a', (id) => id === 'cuerpo-a' || id === 'esq-a');
    expect(twoOnly).toEqual(['cuerpo-a', 'esq-a']);
    expect(stackFor(index, 'cuerpo-a', (id) => id === 'cuerpo-a')).toBeNull();
    // láminas de detalle que acaban en -l (de lado) no son capas
    expect(stackFor(index, 'craneo-l')).toBeNull();
    expect(stackFor(index, 'columna-l')).toBeNull();
    // una pila ficticia de lado
    const fake = { plates: { 'mus-l': { frame: 'body' }, 'esq-l': { frame: 'body' }, 'craneo-l': {} } };
    expect(stackFor(fake, 'esq-l')).toEqual(['mus-l', 'esq-l']);
  });

  it('mezcla: en cada capa entera solo se ve esa; entre dos, la de fuera se desvanece', () => {
    for (const n of [2, 4, 6]) {
      for (let i = 0; i < n; i += 1) {
        const m = layerMix(i, n);
        expect(m[i]).toBe(1);
        expect(m.filter((x) => x > 0)).toHaveLength(1);
      }
      for (let v = 0; v <= n - 1; v += 0.05) {
        const m = layerMix(v, n);
        m.forEach((x) => { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(1); });
        expect(m.filter((x) => x > 0).length).toBeLessThanOrEqual(2);
        // continuo: un paso pequeño no da saltos
        const m2 = layerMix(v + 0.001, n);
        m.forEach((x, j) => expect(Math.abs(x - m2[j])).toBeLessThan(0.01));
      }
    }
    expect(layerMix(0.5, 4)).toEqual([0.5, 1, 0, 0]);
    expect(layerMix(-3, 3)).toEqual([1, 0, 0]);
    expect(layerMix(99, 3)).toEqual([0, 0, 1]);
    expect(layerMix(0.4, 1)).toEqual([1]);
  });

  it('capa dominante y pasos con las flechas', () => {
    expect(dominantLayer(0.49, 4)).toBe(0);
    expect(dominantLayer(0.51, 4)).toBe(1);
    expect(dominantLayer(7, 4)).toBe(3);
    expect(dominantLayer(-1, 4)).toBe(0);
    expect(stepLayer(0, 1, 4)).toBe(1);
    expect(stepLayer(1.3, 1, 4)).toBe(2);
    expect(stepLayer(1.3, -1, 4)).toBe(1);
    expect(stepLayer(2, -1, 4)).toBe(1);
    expect(stepLayer(3, 1, 4)).toBe(3);
    expect(stepLayer(0, -1, 4)).toBe(0);
  });

  it('el canal del deslizador avisa solo si cambia algo', () => {
    const s = createMixStore();
    let calls = 0;
    const off = s.subscribe(() => { calls += 1; });
    s.set({ v: 1.5 });
    s.set({ v: 1.5 });
    expect(calls).toBe(1);
    expect(s.get().v).toBe(1.5);
    off();
    s.set({ v: 2 });
    expect(calls).toBe(1);
  });

  it('el mundo arma un ámbito de capas con el encuadre común', () => {
    const ids = layerStack(index, 'a');
    const mix = createMixStore();
    const sc = world.scopeLayers(ids, mix);
    expect(sc.layers.map((p) => p.id)).toEqual(ids);
    expect(sc.mix).toBe(mix);
    expect(sc.Backdrop).toBeTypeOf('function');
    expect(sc.width).toBe(index.plates[ids[0]].w);
    expect(world.scopeLayers([ids[0]], mix)).toBeNull();
    expect(world.lensOf('esq-a')).toMatchObject({ img: index.plates['esq-a'].img });
  });

  it('nombres de las capas en los tres idiomas', () => {
    for (const lang of ['es', 'en', 'va']) {
      for (const b of LAYER_BASES) {
        expect(APP_UI[lang].layerNames[b], `${lang} ${b}`).toBeTruthy();
        expect(APP_UI[lang].layerShort[b], `${lang} ${b}`).toBeTruthy();
      }
    }
  });
});

describe('Órganos vivos', () => {
  const live = (id) => livingOf(world.plates.get(id));

  it('en las láminas del cuerpo entero late el corazón y respiran los pulmones (recortados)', () => {
    const org = live('org-a');
    expect(org.map((g) => g.type).sort()).toEqual(['beat', 'breath']);
    expect(org.find((g) => g.type === 'beat').keys).toEqual(['corazon']);
    expect(org.find((g) => g.type === 'breath').keys).toEqual(['pulmones']);
    expect(org.every((g) => !g.whole)).toBe(true);
    expect(live('vas-a').map((g) => g.type)).toEqual(['beat']);
  });

  it('en las láminas del propio órgano se mueve la imagen entera', () => {
    const heart = live('corazon-ext');
    expect(heart).toHaveLength(1);
    expect(heart[0]).toMatchObject({ type: 'beat', whole: true });
    expect(heart[0].keys.length).toBeGreaterThanOrEqual(2);
    const lungs = live('pulmones-a');
    expect(lungs).toHaveLength(1);
    expect(lungs[0]).toMatchObject({ type: 'breath', whole: true });
    expect(lungs[0].keys.every((k) => LUNG_LOBES.includes(k))).toBe(true);
    expect(live('bronquios-a')[0]).toMatchObject({ type: 'breath', whole: true });
  });

  it('nada se mueve donde no hay corazón ni pulmones (ni con los lóbulos del cerebro)', () => {
    for (const id of ['esq-a', 'mus-a', 'cuerpo-a', 'encefalo-l', 'craneo-a', 'alveolo']) {
      if (world.plates.get(id)) expect(live(id), id).toEqual([]);
    }
  });

  it('en las láminas dibujadas (esquemas y cortes) no, aunque salgan corazón o pulmones', () => {
    for (const p of world.plates.values()) if (p.kind !== 'render') expect(livingOf(p), p.id).toEqual([]);
    expect(world.plates.get('circulacion').entries.has('corazon')).toBe(true);
  });

  it('el origen cae dentro de la lámina y en %', () => {
    for (const p of world.plates.values()) {
      for (const g of livingOf(p)) {
        const [x, y] = g.origin;
        expect(x, p.id).toBeGreaterThanOrEqual(0);
        expect(x, p.id).toBeLessThanOrEqual(p.w);
        expect(y, p.id).toBeGreaterThanOrEqual(0);
        expect(y, p.id).toBeLessThanOrEqual(p.h);
        expect(originPct(g, p.w, p.h)).toMatch(/^\d+(\.\d+)?% \d+(\.\d+)?%$/);
        // los pulmones se hinchan desde arriba
        if (g.type === 'breath') expect(y, p.id).toBeLessThanOrEqual(g.box[1] + 1e-6);
      }
    }
  });

  it('se para con la estructura marcada (o con cualquier marca si se mueve la lámina entera)', () => {
    const clip = { keys: ['corazon'], whole: false };
    const whole = { keys: ['auricula-d'], whole: true };
    expect(livingPaused(clip, null)).toBe(false);
    expect(livingPaused(clip, { corazon: 'correct' })).toBe(true);
    expect(livingPaused(clip, { higado: 'wrong' })).toBe(false);
    expect(livingPaused(clip, { corazon: 'dim' })).toBe(false);
    expect(livingPaused(whole, { aorta: 'selected' })).toBe(true);
    expect(livingPaused(whole, {})).toBe(false);
  });
});

describe('Pronunciación: elección de voz', () => {
  const v = (lang, name, extra = {}) => ({ lang, name, localService: true, ...extra });

  it('castellano de España antes que de otros países', () => {
    const voices = [v('es-MX', 'Paulina'), v('es-ES', 'Mónica'), v('en-GB', 'Daniel')];
    expect(pickVoice(voices, 'es').name).toBe('Mónica');
    expect(pickVoice([v('es-US', 'Google español de Estados Unidos')], 'es').lang).toBe('es-US');
  });

  it('inglés británico antes que americano', () => {
    const voices = [v('en-US', 'Samantha'), v('en_GB', 'Daniel'), v('es-ES', 'Mónica')];
    expect(pickVoice(voices, 'en').name).toBe('Daniel');
    expect(pickVoice([v('en-US', 'Alex')], 'en').name).toBe('Alex');
  });

  it('valenciano: voz valenciana, si no catalana; nunca castellana', () => {
    const cat = v('ca-ES', 'Montse');
    const val = v('ca-ES-valencia', 'Pau');
    expect(pickVoice([cat, val, v('es-ES', 'Jorge')], 'va').name).toBe('Pau');
    expect(pickVoice([cat, v('es-ES', 'Jorge')], 'va').name).toBe('Montse');
    expect(pickVoice([v('es-ES', 'Jorge')], 'va')).toBeNull();
  });

  it('sin voces del idioma no hay botón; las voces naturales ganan', () => {
    expect(pickVoice([], 'es')).toBeNull();
    expect(pickVoice(undefined, 'en')).toBeNull();
    const voices = [v('en-GB', 'Microsoft Hazel'), v('en-GB', 'Microsoft Sonia Online (Natural)', { localService: false })];
    expect(pickVoice(voices, 'en').name).toMatch(/Natural/);
    expect(voiceScore(v('fr-FR', 'Thomas'), 'es')).toBe(-1);
  });
});

describe('Láminas imprimibles', () => {
  it('reparto en columna: sin solapes, dentro de los límites y sin moverse si cabe', () => {
    expect(spread([10, 40, 80], [5, 5, 5], 0, 100)).toEqual([10, 40, 80]);
    const ys = [50, 50.5, 51, 52, 90];
    const sizes = [6, 6, 6, 6, 6];
    const out = spread(ys, sizes, 0, 100);
    for (let i = 1; i < out.length; i += 1) expect(out[i] - out[i - 1]).toBeGreaterThanOrEqual(6 - 1e-9);
    expect(out[0]).toBeGreaterThanOrEqual(3 - 1e-9);
    expect(out[out.length - 1]).toBeLessThanOrEqual(97 + 1e-9);
    // el grupo apretado se centra en lo que quería (no se va todo hacia abajo)
    expect((out[0] + out[1] + out[2] + out[3]) / 4).toBeCloseTo((50 + 50.5 + 51 + 52) / 4, 6);
    // pegados al borde
    const top = spread([0, 0, 0], [10, 10, 10], 0, 100);
    expect(top).toEqual([5, 15, 25]);
    const bottom = spread([100, 100], [10, 10], 0, 100);
    expect(bottom).toEqual([85, 95]);
    // no caben: se aprietan y llenan el hueco
    const tight = spread([1, 2, 3, 4], [30, 30, 30, 30], 0, 100);
    expect(tight[0]).toBeCloseTo(12.5);
    expect(tight[3]).toBeCloseTo(87.5);
  });

  it('llamadas: numeradas 1..n, izquierda primero y de arriba abajo, lados equilibrados', () => {
    const items = [
      { k: 'a', x: 10, y: 50, size: 6 }, { k: 'b', x: 90, y: 10, size: 6 }, { k: 'c', x: 12, y: 20, size: 6 },
      { k: 'd', x: 49, y: 70, size: 6 }, { k: 'e', x: 51, y: 30, size: 6 }, { k: 'f', x: 50, y: 90, size: 6 },
    ];
    const out = layoutCallouts(items, { width: 100, height: 100 });
    expect(out.map((c) => c.n)).toEqual([1, 2, 3, 4, 5, 6]);
    const L = out.filter((c) => c.side === 'L');
    const R = out.filter((c) => c.side === 'R');
    expect(Math.abs(L.length - R.length)).toBeLessThanOrEqual(1);
    expect(Math.max(...L.map((c) => c.n))).toBeLessThan(Math.min(...R.map((c) => c.n)));
    for (const side of [L, R]) for (let i = 1; i < side.length; i += 1) expect(side[i].ly).toBeGreaterThan(side[i - 1].ly);
  });

  it('nombres largos en dos líneas', () => {
    expect(wrapLabel('Corazón')).toEqual(['Corazón']);
    expect(wrapLabel('Músculos extensores del antebrazo')).toEqual(['Músculos extensores', 'del antebrazo']);
    expect(wrapLabel('Esternocleidomastoideooooooooooo')).toHaveLength(1);
  });

  it('orientación: vertical para el cuerpo entero, horizontal para láminas anchas', () => {
    expect(fitPlate(730, 1800, 80).landscape).toBe(false);
    expect(fitPlate(1300, 750, 80).landscape).toBe(true);
  });

  it('todas las láminas caben en un A4 en las dos versiones y en los tres idiomas', () => {
    for (const p of world.plates.values()) {
      const entries = [...p.entries.values()].map((e) => ({ k: e.key, c: e.centroid }));
      for (const mode of ['mute', 'named']) {
        for (const lang of ['es', 'en', 'va']) {
          const plan = printPlan({ plate: p, entries, nameOf: (k) => nameOf(k, lang), mode });
          const [pw, ph] = plan.landscape ? PAGE_MM.landscape : PAGE_MM.portrait;
          const side = plan.figW + (mode === 'mute' ? MUTE.panel + MUTE.gap : 0);
          expect(side, `${p.id} ${mode} ${lang}`).toBeLessThanOrEqual(pw + 1e-6);
          expect(plan.figH, `${p.id} ${mode} ${lang}`).toBeLessThanOrEqual(ph - RESERVE_H + 1e-6);
          expect(plan.callouts).toHaveLength(entries.length);
          expect(new Set(plan.callouts.map((c) => c.n)).size).toBe(entries.length);
          for (const c of plan.callouts) {
            expect(c.ly, `${p.id} ${c.k}`).toBeGreaterThanOrEqual(-1e-6);
            expect(c.ly, `${p.id} ${c.k}`).toBeLessThanOrEqual(plan.figH + 1e-6);
            expect(c.x).toBeGreaterThanOrEqual(-1e-6);
            expect(c.x).toBeLessThanOrEqual(plan.plateW + 1e-6);
            expect(c.name).toBeTruthy();
          }
          if (mode === 'mute') expect(plan.answers.rowH).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('cuerpo entero en A4 vertical con la figura grande', () => {
    const p = world.plates.get('mus-a');
    const plan = printPlan({ plate: p, entries: [...p.entries.values()].map((e) => ({ k: e.key, c: e.centroid })), nameOf: (k) => nameOf(k, 'es'), mode: 'mute' });
    expect(plan.landscape).toBe(false);
    expect(plan.figH).toBeGreaterThan(200);
  });
});
