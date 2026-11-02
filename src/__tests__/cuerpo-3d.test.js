/**
 * Modelo 3D del cuerpo humano (public/data/anatomia3d + public/models/anatomia),
 * modo 3D de las apps del cuerpo (escenas, paso de preguntas a 3D) y Anatomía 3D.
 */
import fs from 'node:fs';
import { describe, it, expect, beforeAll } from 'vitest';
import { BY_KEY } from '@/apps/_shared/anatomia/data/structures';
import { EXT_GROUPS } from '@/apps/_shared/anatomia/data/systems';
import { makeBodyWorld } from '@/apps/_shared/anatomia/world';
import { setLang } from '@/apps/_shared/anatomia/text';
import { prepareIndex3d } from '@/apps/_shared/anatomia3d/model';
import { attach3d, to3d, keyForLevel, cameraFor } from '@/apps/_shared/anatomia3d/world3d';
import { SCENES, PLATE_SCENE, sceneIdOf } from '@/apps/_shared/anatomia3d/scenes';
import { STOPS, stopConfig, UI3D, VIEW_TEXT } from '@/apps/_shared/anatomia3d/ui3d';
import { judgeMapPick } from '@/apps/_shared/geo/QuizPlay';
import * as Cuerpo from '@/apps/explorador-cuerpo/engine/questions';
import * as A3 from '@/apps/anatomia-3d/engine/questions';
import { courseLevel as a3Level, gamesFor as a3Games, GAMES as A3_GAMES } from '@/apps/anatomia-3d/engine/config';
import { mulberry32 } from '@/apps/sistema-solar/model/rng';

const DATA = 'public/data/anatomia';
const index = JSON.parse(fs.readFileSync(`${DATA}/index.json`, 'utf8'));
const index3d = prepareIndex3d(JSON.parse(fs.readFileSync('public/data/anatomia3d/index.json', 'utf8')));
const loader = async (id) => JSON.parse(fs.readFileSync(`${DATA}/${id}.json`, 'utf8'));
const View = () => null;
let world;
beforeAll(async () => {
  world = makeBodyWorld(index, loader);
  await world.ensure(Object.keys(index.plates));
  await attach3d(world, View, index3d);
});

describe('Modelo 3D', () => {
  it('cada capa tiene sus dos niveles de detalle en disco y dentro del presupuesto', () => {
    expect(index3d.order).toEqual(['piel', 'musculos', 'musculos-prof', 'organos', 'vasos', 'nervios', 'esqueleto']);
    let light = 0;
    for (const id of index3d.order) {
      const L = index3d.layers[id];
      for (const lod of ['l', 'h']) {
        const file = `public${L.files[lod]}`;
        expect(fs.existsSync(file), file).toBe(true);
        expect(fs.statSync(file).size).toBe(L.bytes[lod]);
      }
      expect(L.tris.l).toBeLessThan(L.tris.h);
      light += L.bytes.l;
    }
    // todo el cuerpo en ligero: menos de 2,5 MB
    expect(light).toBeLessThan(2.5 * 1024 * 1024);
  });

  it('las piezas tienen clave del catálogo, contenedores del catálogo, lado y caja', () => {
    for (const L of Object.values(index3d.layers)) {
      for (const p of L.parts) {
        expect(BY_KEY[p.k], `${L.id}: ${p.k}`).toBeTruthy();
        for (const u of p.up) expect(BY_KEY[u] || EXT_GROUPS.some((g) => g.id === u), `${L.id}: ${p.k} ⊂ ${u}`).toBeTruthy();
        expect(['', 'R', 'L']).toContain(p.side);
        expect(p.b).toHaveLength(6);
        for (let i = 0; i < 3; i += 1) expect(p.b[i]).toBeLessThanOrEqual(p.b[i + 3]);
      }
    }
  });

  it('el cuerpo está de pie, centrado y con el suelo en y = 0', () => {
    const b = index3d.layers.esqueleto.parts.flatMap((p) => [p.b]);
    const minY = Math.min(...b.map((x) => x[1]));
    const maxY = Math.max(...b.map((x) => x[4]));
    expect(minY).toBeGreaterThanOrEqual(-0.01);
    expect(maxY).toBeGreaterThan(1.5);
    expect(maxY).toBeLessThan(1.9);
    const femurR = index3d.layers.esqueleto.parts.find((p) => p.k === 'femur' && p.side === 'R');
    const femurL = index3d.layers.esqueleto.parts.find((p) => p.k === 'femur' && p.side === 'L');
    // x = izquierda del sujeto
    expect(femurL.c[0]).toBeGreaterThan(0);
    expect(femurR.c[0]).toBeLessThan(0);
    // el esternón queda delante de la columna (z = delante)
    const est = index3d.layers.esqueleto.parts.find((p) => p.k === 'cuerpo-esternon');
    const lum = index3d.layers.esqueleto.parts.find((p) => p.k === 'lumbares');
    expect(est.c[2]).toBeGreaterThan(lum.c[2]);
  });

  it('los grupos encienden todas sus piezas (cráneo, corazón, cuádriceps…)', () => {
    const esq = index3d.layers.esqueleto;
    expect(esq.byKey.get('craneo').length).toBeGreaterThan(8);
    expect(esq.byKey.get('carpo').length).toBe(16);
    expect(index3d.layers.organos.byKey.get('corazon').length).toBeGreaterThan(6);
    expect(index3d.layers.organos.byKey.get('pulmones').length).toBeGreaterThanOrEqual(5);
    expect(index3d.layers.musculos.byKey.get('cuadriceps')?.length).toBeGreaterThanOrEqual(6);
  });

  it('nivel: en Primaria el frontal es «el cráneo»', () => {
    const frontal = index3d.layers.esqueleto.parts.find((p) => p.k === 'frontal');
    expect(keyForLevel(frontal, 6)).toBe('frontal');
    expect(keyForLevel(frontal, BY_KEY.craneo.l)).toBe('craneo');
  });
});

describe('Escenas 3D y paso de preguntas a 3D', () => {
  it('cada lámina con escena existe y casi todas sus estructuras están en 3D', () => {
    for (const [plate, [scene]] of Object.entries(PLATE_SCENE)) {
      expect(SCENES[scene], plate).toBeTruthy();
      if (!index.plates[plate]) continue;
      const s = world.scope(sceneIdOf(plate));
      expect(s.is3d).toBe(true);
      const keys = index.plates[plate].keys;
      const inside = keys.filter((k) => s.entries.has(k));
      expect(inside.length / keys.length, plate).toBeGreaterThan(0.5);
      expect(s.views.world.camera).toHaveLength(3);
    }
  });

  it('una pregunta de localizar pasa a 3D y se juzga con piezas o grupos', () => {
    const q = to3d({ kind: 'locate', layer: 'esq-a', target: 'craneo', attempts: 2, viewBox: { x: 0 } }, world);
    expect(q.layer).toBe('3d:esq-a');
    expect(q.viewBox).toBeUndefined();
    const s = world.scope(q.layer);
    expect(judgeMapPick(q, 'frontal', s.entries.get('frontal').cont, [], s)).toBe(true);
    expect(judgeMapPick(q, 'craneo', null, [], s)).toBe(true);
    expect(judgeMapPick(q, 'femur', null, [], s)).toBe(false);
    // lo que no existe en 3D se queda en la lámina
    const q2 = to3d({ kind: 'locate', layer: 'digestivo-a', target: 'lengua', attempts: 1 }, world);
    expect(q2.layer).toBe('digestivo-a');
    // los recorridos de Viaje con estela, también
    const q3 = to3d({ kind: 'sequence', layer: 'org-a', stops: ['esofago', 'estomago'], trail: [[0, 0]] }, world);
    expect(q3.layer).toBe('org-a');
  });

  it('las rondas del Explorador en 3D: lo que pasa a 3D se puede tocar', () => {
    setLang('es');
    const rng = mulberry32(7);
    const w = world;
    for (const lv of [3, 4, 5, 6]) {
      const qs = Cuerpo.buildRound({ lv, region: 'all', difficulty: 'medium', world: w, lang: 'es', rng }, 'organos', 10);
      const q3 = qs.map((q) => to3d(q, w));
      expect(q3).toHaveLength(10);
      for (const q of q3) {
        if (q.kind === 'locate' && q.layer.startsWith('3d:')) expect(w.scope(q.layer).entries.has(q.target), q.target).toBe(true);
        if (q.subject?.type === 'map' && q.subject.layer.startsWith('3d:')) expect(w.scope(q.subject.layer).entries.has(q.subject.key)).toBe(true);
      }
    }
  });

  it('encuadre: la cámara mira a la caja desde la dirección pedida', () => {
    const c = cameraFor([-0.1, 1.5, -0.1, 0.1, 1.7, 0.1], 'front');
    expect(c.target).toEqual([0, 1.6, 0]);
    expect(c.camera[2]).toBeGreaterThan(0.3);
    const b = cameraFor([-0.1, 1.5, -0.1, 0.1, 1.7, 0.1], 'back');
    expect(b.camera[2]).toBeLessThan(-0.3);
  });
});

describe('Visor 3D: capas y textos', () => {
  it('cada parada del deslizador deja algo sólido y la lupa recorta y descubre', () => {
    for (const st of STOPS) {
      const c = stopConfig(st.id, { lens: true });
      expect(Object.values(c.layers)).toContain('solid');
      expect(c.lensCut.length).toBeGreaterThan(0);
      for (const k of c.lensCut) expect(c.layers[k]).toBe('solid');
    }
    expect(stopConfig('piel', { vessels: true }).layers.piel).toBe('ghost');
  });

  it('textos del visor en los tres idiomas', () => {
    for (const lang of ['es', 'en', 'va']) {
      expect(Object.keys(UI3D[lang]).sort()).toEqual(Object.keys(UI3D.es).sort());
      expect(VIEW_TEXT[lang].d3).toBeTruthy();
    }
  });
});

describe('Anatomía 3D', () => {
  it('niveles y minijuegos por curso', () => {
    expect(a3Level('primaria', 5)).toBe(3);
    expect(a3Level('eso', 1)).toBe(4);
    expect(a3Level('eso', 4)).toBe(5);
    expect(a3Level('bachillerato', 1)).toBe(6);
    expect(a3Games(3).map((g) => g.id)).toEqual(['donde', 'quees', 'monta']);
    expect(a3Games(6)).toHaveLength(A3_GAMES.length);
    for (const g of A3_GAMES) expect(g.t).toHaveLength(3);
  });

  it('rondas completas y válidas en todos los niveles, idiomas y modos', () => {
    const rng = mulberry32(11);
    for (const lang of ['es', 'en', 'va']) {
      setLang(lang);
      for (const lv of [3, 4, 5, 6]) {
        for (const difficulty of ['easy', 'medium', 'exam']) {
          for (const g of [...a3Games(lv).map((x) => x.id), 'exam']) {
            const qs = A3.buildRound({ lv, region: 'all', difficulty, world, lang, rng }, g, 10);
            expect(qs, `${lang} ${lv} ${difficulty} ${g}`).toHaveLength(10);
            for (const q of qs) {
              expect(q.prompt).toBeTruthy();
              if (q.kind === 'locate') {
                expect(q.layer.startsWith('3d:')).toBe(true);
                expect(world.scope(q.layer).entries.has(q.target), q.target).toBe(true);
                expect(BY_KEY[q.target].l).toBeLessThanOrEqual(lv);
              } else if (q.kind === 'custom') {
                expect(q.type).toBe('place');
                const part = index3d.layers[q.layer].parts[q.n - 1];
                expect(part.k).toBe(q.key);
                expect(q.camera.camera).toHaveLength(3);
                expect(q.start.some((v) => Math.abs(v) > 0.01)).toBe(true);
              } else {
                expect(q.kind).toBe('choice');
                expect(q.options.length).toBeGreaterThanOrEqual(2);
                expect(q.options.map((o) => o.key)).toContain(q.answer[0]);
                expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length);
              }
            }
          }
        }
      }
    }
  });

  it('el duelo no tiene preguntas de arrastrar', () => {
    const qs = A3.buildRound({ lv: 6, region: 'all', difficulty: 'exam', world, lang: 'es', rng: mulberry32(3), duel: true }, 'duel', 30);
    expect(qs.length).toBe(30);
    expect(qs.some((q) => q.kind === 'custom')).toBe(false);
  });

  it('por aparatos', () => {
    for (const region of ['oseo', 'muscular', 'digestivo', 'circulatorio', 'nervioso']) {
      const qs = A3.buildRound({ lv: 6, region, difficulty: 'medium', world, lang: 'es', rng: mulberry32(5) }, 'donde', 10);
      expect(qs, region).toHaveLength(10);
    }
  });
});
