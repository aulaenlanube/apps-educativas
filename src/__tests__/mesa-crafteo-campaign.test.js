// Mesa de Crafteo: campaña, estrellas, desbloqueos, paletas, examen y progreso.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  WORLDS, worldLevels, worldsForRank, computeStars, levelPoints, levelMaxPoints, isWorldUnlocked, isLevelUnlocked,
  paletteFor, labPalette, pickExamMolecules, examPalette, emptyProgress, recordLevel, addToAlbum,
  loadProgress, saveProgress, PROGRESS_KEY, worldStats,
} from '@/apps/mesa-crafteo/campaign';
import { MOLECULES, MOLECULE_BY_ID, moleculesForRank, tokensOf } from '@/apps/mesa-crafteo/chem/molecules';
import { EXAM_DIFFICULTY } from '@/apps/mesa-crafteo/crafteoScoring';

const done = (ids) => ({ ...emptyProgress(), levels: Object.fromEntries(ids.map((id) => [id, { stars: 1, points: 10 }])) });

describe('mundos', () => {
  it('cada nivel apunta a una molécula del catálogo y respeta el curso del mundo', () => {
    for (const w of WORLDS) {
      for (const lv of worldLevels(w)) {
        expect(lv.molecule, lv.id).toBeTruthy();
        expect(lv.molecule.rank, lv.id).toBeLessThanOrEqual(w.rank);
        expect(lv.par).toBeGreaterThan(10);
      }
    }
  });
  it('ESO 1-2 ve 3 mundos, 3º ESO 4, 4º ESO 5 y Bachillerato 7', () => {
    expect(worldsForRank(1)).toHaveLength(3);
    expect(worldsForRank(3)).toHaveLength(4);
    expect(worldsForRank(4)).toHaveLength(5);
    expect(worldsForRank(5)).toHaveLength(7);
  });
  it('ninguna molécula se repite en la campaña', () => {
    const ids = WORLDS.flatMap((w) => w.levels.map((l) => l.mol));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('estrellas y puntos', () => {
  it('3 estrellas: sin pistas ni errores y rápido', () => {
    expect(computeStars({ hints: 0, wrong: 0, seconds: 20, par: 30, extraAtoms: 0 }).stars).toBe(3);
    expect(computeStars({ hints: 1, wrong: 0, seconds: 20, par: 30 }).stars).toBe(2);
    expect(computeStars({ hints: 0, wrong: 0, seconds: 40, par: 30 }).stars).toBe(2);
    expect(computeStars({ hints: 0, wrong: 2, seconds: 99, par: 30 }).stars).toBe(1);
    expect(computeStars({ hints: 0, wrong: 0, seconds: 10, par: 30, extraAtoms: 3 }).stars).toBe(2);
  });
  it('los puntos nunca superan el máximo', () => {
    const m = MOLECULE_BY_ID.h2o;
    expect(levelPoints(m, 3, 0, 30)).toBeLessThanOrEqual(levelMaxPoints(m, 30));
    expect(levelPoints(m, 1, 999, 30)).toBe(50 * m.diff + 25);
  });
});

describe('desbloqueos', () => {
  const w = worldsForRank(5);
  it('ESO 1: el mundo 2 se abre con el 60 % del mundo 1', () => {
    const ws = worldsForRank(1);
    expect(isWorldUnlocked(ws, 0, emptyProgress(), 1)).toBe(true);
    expect(isWorldUnlocked(ws, 1, emptyProgress(), 1)).toBe(false);
    const need = worldStats(ws[0], emptyProgress()).need;
    const ids = worldLevels(ws[0]).slice(0, need).map((l) => l.id);
    expect(isWorldUnlocked(ws, 1, done(ids), 1)).toBe(true);
    expect(isWorldUnlocked(ws, 1, done(ids.slice(1)), 1)).toBe(false);
  });
  it('los niveles se abren en orden', () => {
    const ws = worldsForRank(1);
    expect(isLevelUnlocked(ws, 0, 0, emptyProgress(), 1)).toBe(true);
    expect(isLevelUnlocked(ws, 0, 1, emptyProgress(), 1)).toBe(false);
    expect(isLevelUnlocked(ws, 0, 1, done(['w1-1']), 1)).toBe(true);
  });
  it('Bachillerato: los mundos de ESO son repaso abierto y el primero de su curso también', () => {
    for (let i = 0; i < 6; i++) expect(isWorldUnlocked(w, i, emptyProgress(), 5)).toBe(true);
    expect(isLevelUnlocked(w, 2, 5, emptyProgress(), 5)).toBe(true); // repaso: niveles sueltos
    expect(isLevelUnlocked(w, 5, 1, emptyProgress(), 5)).toBe(false); // su curso: en orden
    expect(isWorldUnlocked(w, 6, emptyProgress(), 5)).toBe(false);
  });
});

describe('paletas', () => {
  it('incluyen siempre los átomos de la molécula y los rellenos pedidos', () => {
    for (const m of MOLECULES) {
      for (const extras of [0, 1, 2]) {
        const p = paletteFor(m, extras);
        tokensOf(m).forEach((t) => expect(p).toContain(t));
        expect(p.length).toBe(tokensOf(m).length + extras);
      }
    }
  });
  it('el laboratorio de Bachillerato trae los átomos con carga', () => {
    expect(labPalette(1)).not.toContain('O-');
    expect(labPalette(5)).toContain('O-');
  });
  it('la paleta del examen difícil contiene lo necesario', () => {
    for (const m of moleculesForRank(5)) {
      const p = examPalette(m, 'hard', 5);
      tokensOf(m).forEach((t) => expect(p).toContain(t));
    }
  });
});

describe('examen', () => {
  it('hay moléculas suficientes y sin repetir para cada curso y dificultad', () => {
    for (const rank of [1, 2, 3, 4, 5, 6]) {
      const pool = moleculesForRank(rank);
      for (const d of Object.keys(EXAM_DIFFICULTY)) {
        const qs = pickExamMolecules(pool, d, EXAM_DIFFICULTY[d].questions);
        expect(qs).toHaveLength(EXAM_DIFFICULTY[d].questions);
        expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
        qs.forEach((q) => expect(q.rank).toBeLessThanOrEqual(rank));
      }
    }
  });
  it('Fácil elige moléculas más sencillas que Difícil', () => {
    const pool = moleculesForRank(5);
    let seed = 1;
    const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const avg = (qs) => qs.reduce((s, q) => s + q.diff, 0) / qs.length;
    expect(avg(pickExamMolecules(pool, 'easy', 4, rng))).toBeLessThan(avg(pickExamMolecules(pool, 'hard', 10, rng)));
  });
});

describe('progreso', () => {
  beforeEach(() => { try { localStorage.clear(); } catch { /* sin storage */ } });
  it('recordLevel guarda lo mejor y suma solo lo ganado', () => {
    let p = emptyProgress();
    let r = recordLevel(p, 'w1-1', { stars: 2, points: 100 });
    expect(r.improved).toBe(true);
    p = r.progress;
    r = recordLevel(p, 'w1-1', { stars: 1, points: 80 });
    expect(r.improved).toBe(false);
    expect(r.progress.levels['w1-1']).toEqual({ stars: 2, points: 100 });
    expect(r.progress.points).toBe(100);
    r = recordLevel(r.progress, 'w1-1', { stars: 3, points: 130 });
    expect(r.progress.points).toBe(130);
  });
  it('álbum sin duplicados', () => {
    let { progress, isNew } = addToAlbum(emptyProgress(), 'h2o');
    expect(isNew).toBe(true);
    ({ progress, isNew } = addToAlbum(progress, 'h2o'));
    expect(isNew).toBe(false);
    expect(progress.album).toEqual(['h2o']);
  });
  it('guarda y carga (y migra los descubrimientos antiguos por nombre)', () => {
    if (typeof localStorage === 'undefined' || !localStorage?.setItem) return;
    localStorage.setItem('mesa_crafteo_discoveries', JSON.stringify(['Agua', 'Metano', 'Inexistente']));
    expect(loadProgress(MOLECULES).album.sort()).toEqual(['ch4', 'h2o']);
    const p = { ...emptyProgress(), album: ['co2'] };
    saveProgress(p);
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)).album).toEqual(['co2']);
    expect(loadProgress(MOLECULES).album).toEqual(['co2']);
  });
  it('datos corruptos no rompen la carga', () => {
    if (typeof localStorage === 'undefined' || !localStorage?.setItem) return;
    localStorage.setItem(PROGRESS_KEY, '{no json');
    expect(loadProgress(MOLECULES)).toEqual(emptyProgress());
  });
});
