// Cifras públicas de la plataforma (src/data/appStats.js) y contrato de
// /datos/cifras-apps.json, que leen los vídeos desde otro repo.
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildAdaptationIndex, summarizeAppStats, computeAppStats, latestApp,
  fillStatsPlaceholders, formatCount, splitAppName, STATS_CONTRACT_VERSION,
} from '@/data/appStats';
import {
  primariaApps, esoApps, bachilleratoApps, adApps,
  primariaSubjects, esoSubjects, bachilleratoSubjects, adSubjects,
} from '@/apps/appList';
import * as common from '@/apps/config/commonApps';
import APP_STATS from 'virtual:app-stats';

const ROOT = path.resolve(__dirname, '..', '..');

// ─── Registro de juguete ────────────────────────────────────────────────────
const rosco = { id: 'rosco', name: '🅿️ Rosco', addedAt: '2025-01-01' };
const snake = { id: 'snake', name: '🐍 Snake', addedAt: '2025-03-01' };
const sumas1 = { id: 'sumas-1', family: 'sumas', name: '➕ Sumas sin llevadas', addedAt: '2025-02-01' };
const sumas2 = { id: 'sumas-2', family: 'sumas', name: '➕ Sumas con llevadas', addedAt: '2026-06-01' };
const families = { sumas: { name: '➕ Sumas' } };
const subj = (...ids) => ids.map((id) => ({ id, nombre: id.toUpperCase() }));

const toy = {
  primaria: {
    apps: {
      1: { lengua: [rosco, snake], matematicas: [rosco, sumas1, rosco /* repetida */] },
      2: { lengua: [rosco], matematicas: [sumas2] },
    },
    subjects: { 1: subj('lengua', 'matematicas'), 2: subj('lengua', 'matematicas') },
  },
  eso: { apps: { 1: { lengua: [rosco, snake] } }, subjects: { 1: subj('lengua') } },
  bachillerato: { apps: {}, subjects: {} },
};

describe('appStats · cálculo', () => {
  const index = buildAdaptationIndex(toy, families);
  const stats = summarizeAppStats(index);

  it('una adaptación por (app, nivel, curso, asignatura); las repetidas en una asignatura no suman', () => {
    // rosco: P1 lengua, P1 mates, P2 lengua, E1 lengua = 4 · snake: P1 lengua, E1 lengua = 2 · sumas: 2
    expect(stats.adaptaciones).toBe(8);
  });

  it('las versiones por curso de una familia cuentan como una sola app', () => {
    expect(stats.apps).toBe(3);
    const sumas = index.find((e) => e.key === 'sumas');
    expect(sumas.name).toBe('Sumas');
    expect(sumas.ids).toEqual(['sumas-1', 'sumas-2']);
    expect(sumas.adaptations.map((a) => a.path)).toEqual([
      '/curso/primaria/1/matematicas/app/sumas-1',
      '/curso/primaria/2/matematicas/app/sumas-2',
    ]);
  });

  it('desglose por nivel (los niveles sin apps no salen)', () => {
    expect(stats.por_nivel).toEqual({
      primaria: { nombre: 'Primaria', apps: 3, adaptaciones: 6, cursos: 2 },
      eso: { nombre: 'ESO', apps: 2, adaptaciones: 2, cursos: 1 },
    });
    expect(stats.cursos).toBe(3);
  });

  it('última app: la de addedAt más reciente; una familia nace con su primera versión', () => {
    // sumas-2 es de 2026 pero la familia Sumas existe desde 2025-02 → la última es Snake.
    expect(latestApp(index).key).toBe('snake');
    expect(stats.ultima_app).toEqual({
      id: 'snake',
      nombre: 'Snake',
      ruta: '/curso/primaria/1/lengua/app/snake',
      url: 'https://apps-educativas.com/curso/primaria/1/lengua/app/snake',
    });
  });

  it('una familia desconocida se trata como app suelta', () => {
    const s = computeAppStats(toy, {});
    expect(s.apps).toBe(4);
  });

  it('marcadores {{…}} y formato de cifras', () => {
    expect(formatCount(4550)).toBe('4550');
    expect(formatCount(12000)).toBe('12.000');
    expect(fillStatsPlaceholders('{{apps}} apps y {{ adaptaciones }} adaptaciones; última: {{ultima_app}}', stats))
      .toBe('3 apps y 8 adaptaciones; última: Snake');
    expect(splitAppName('🕵️‍♂️ Detective de Palabras')).toEqual({ emoji: '🕵️‍♂️', text: 'Detective de Palabras' });
    expect(splitAppName('Sin emoji')).toEqual({ emoji: '', text: 'Sin emoji' });
  });
});

// ─── Registro real ──────────────────────────────────────────────────────────
const registry = {
  primaria: { apps: primariaApps, subjects: primariaSubjects },
  eso: { apps: esoApps, subjects: esoSubjects },
  bachillerato: { apps: bachilleratoApps, subjects: bachilleratoSubjects },
  ad: { apps: adApps, subjects: adSubjects },
};
const definitions = Object.values(common).filter((v) => v && typeof v === 'object' && typeof v.id === 'string');
const registeredIds = new Set();
for (const { apps } of Object.values(registry)) {
  for (const bySubject of Object.values(apps)) {
    for (const list of Object.values(bySubject)) list.forEach((a) => registeredIds.add(a.id));
  }
}

describe('appStats · registro real (checklist «crear una app nueva»)', () => {
  it('toda app registrada tiene addedAt válido (AAAA-MM-DD o AAAA-MM-DDTHH:MM)', () => {
    const bad = definitions
      .filter((d) => registeredIds.has(d.id))
      .filter((d) => !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(d.addedAt || ''))
      .map((d) => d.id);
    expect(bad).toEqual([]);
  });

  it('la app más reciente es única (si publicas dos el mismo día, añade la hora)', () => {
    const index = buildAdaptationIndex(registry, common.APP_FAMILIES);
    const last = latestApp(index);
    expect(last).not.toBeNull();
    expect(index.filter((e) => e.addedAt === last.addedAt).map((e) => e.key)).toEqual([last.key]);
  });

  it('cada `family` existe en APP_FAMILIES y agrupa al menos dos versiones', () => {
    const members = {};
    for (const d of definitions) if (d.family) (members[d.family] ||= []).push(d.id);
    for (const [fam, ids] of Object.entries(members)) {
      expect(common.APP_FAMILIES[fam], `family '${fam}' sin nombre en APP_FAMILIES`).toBeTruthy();
      expect(ids.length, `family '${fam}'`).toBeGreaterThan(1);
    }
  });

  it('dos versiones de una misma familia nunca están en la misma asignatura de un curso', () => {
    const clashes = [];
    for (const [level, { apps }] of Object.entries(registry)) {
      for (const [grade, bySubject] of Object.entries(apps)) {
        for (const [subjectId, list] of Object.entries(bySubject)) {
          const seen = {};
          for (const a of list) {
            if (!a.family) continue;
            if (seen[a.family] && seen[a.family] !== a.id) clashes.push(`${level}/${grade}/${subjectId}: ${seen[a.family]} + ${a.id}`);
            seen[a.family] = a.id;
          }
        }
      }
    }
    expect(clashes).toEqual([]);
  });

  it('el módulo virtual:app-stats (portada, blog, index.html) da las mismas cifras que el registro', () => {
    expect(APP_STATS).toEqual(computeAppStats(registry, common.APP_FAMILIES));
  });
});

// ─── Contrato de /datos/cifras-apps.json ────────────────────────────────────
describe('contrato /datos/cifras-apps.json', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cifras-'));
  const out = path.join(tmp, 'cifras-apps.json');
  execFileSync(process.execPath, ['tools/generate-app-stats.mjs', '--out', out, '--no-manifest'], { cwd: ROOT });
  const json = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.rmSync(tmp, { recursive: true, force: true });

  it('tiene los campos del contrato con sus tipos', () => {
    expect(json.version).toBe(STATS_CONTRACT_VERSION);
    expect(Number.isInteger(json.apps) && json.apps > 0).toBe(true);
    expect(Number.isInteger(json.adaptaciones) && json.adaptaciones >= json.apps).toBe(true);
    expect(Number.isInteger(json.cursos)).toBe(true);
    expect(Object.keys(json.por_nivel)).toEqual(['primaria', 'eso', 'bachillerato', 'ad']);
    for (const nivel of Object.values(json.por_nivel)) {
      expect(typeof nivel.nombre).toBe('string');
      expect(Number.isInteger(nivel.apps)).toBe(true);
      expect(Number.isInteger(nivel.adaptaciones)).toBe(true);
      expect(Number.isInteger(nivel.cursos)).toBe(true);
    }
    expect(typeof json.ultima_app.id).toBe('string');
    expect(typeof json.ultima_app.nombre).toBe('string');
    expect(json.ultima_app.ruta).toMatch(/^\/curso\/[a-z]+\/\d+\/[a-z0-9-]+\/app\/[a-z0-9-]+$/);
    expect(json.ultima_app.url).toBe(`https://apps-educativas.com${json.ultima_app.ruta}`);
    expect(new Date(json.generado).toISOString()).toBe(json.generado);
  });

  it('la suma por niveles cuadra con el total de adaptaciones', () => {
    const sum = Object.values(json.por_nivel).reduce((n, l) => n + l.adaptaciones, 0);
    expect(sum).toBe(json.adaptaciones);
  });

  it('el script de build (Node) y la web (Vite) cuentan lo mismo', () => {
    const { generado, ...rest } = json;
    expect(generado).toBeTruthy();
    expect(rest).toEqual(APP_STATS);
  });
});

// ─── «Propón una app»: sugerencias de apps que ya existen ───────────────────
describe('sugerencias de apps existentes', async () => {
  const { suggestExistingApps, LIVE_APP_STATS } = await import('@/data/appIndex');
  const keys = (q) => suggestExistingApps(q).map((e) => e.key);

  it('encuentra la app por su nombre aunque falten tildes o mayúsculas', () => {
    expect(keys('una SOPA DE LETRAS de verbos')).toContain('sopa-de-letras');
    expect(keys('juego de fracciones para 1.º de ESO')).toContain('fracciones-eso');
    expect(keys('practicar las multiplicaciones')).toContain('multiplicaciones');
    expect(keys('números romanos')).toContain('numeros-romanos');
  });

  it('no sugiere nada con palabras genéricas', () => {
    expect(keys('un juego para primaria')).toEqual([]);
    expect(keys('')).toEqual([]);
  });

  it('el índice vivo de /adaptaciones cuadra con las cifras publicadas', () => {
    expect(LIVE_APP_STATS).toEqual(APP_STATS);
  });
});
