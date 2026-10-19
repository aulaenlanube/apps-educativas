// src/apps/mesa-crafteo/campaign.js
// Campaña (mundos y niveles), estrellas, desbloqueos, puntos de práctica,
// progreso por dispositivo y selección de moléculas para el examen. Puro.

import { MOLECULE_BY_ID, tokensOf } from './chem/molecules';
import { tokenInfo } from './chem/elements';

// help: 'guided' (fórmula + contador + plano visibles), 'formula' (fórmula y
// contador; el plano es una pista), 'name' (solo el nombre; las pistas
// revelan la fórmula y luego el plano). extras: elementos de relleno en la paleta.
const L = (mol, help = 'formula', extras = 0) => ({ mol, help, extras });

export const WORLDS = [
  {
    id: 'w1', name: 'Primeros enlaces', subtitle: 'Moléculas diatómicas y el enlace sencillo',
    rank: 1, color: '#38bdf8', color2: '#818cf8',
    levels: [L('h2', 'guided'), L('hcl', 'guided'), L('cl2', 'formula'), L('hf', 'formula', 1), L('f2', 'name', 1), L('hbr', 'name', 2)],
  },
  {
    id: 'w2', name: 'Formas en el espacio', subtitle: 'Agua, amoníaco, metano… y su geometría',
    rank: 1, color: '#22d3ee', color2: '#10b981',
    levels: [L('h2o', 'guided'), L('nh3', 'guided'), L('ch4', 'formula'), L('h2s', 'formula', 1), L('ph3', 'formula', 1), L('ch3cl', 'formula', 2), L('ccl4', 'name', 2), L('h2o2', 'name', 2)],
  },
  {
    id: 'w3', name: 'Dobles y triples', subtitle: 'Toca un enlace para hacerlo doble o triple',
    rank: 1, color: '#f472b6', color2: '#a78bfa',
    levels: [L('o2', 'guided'), L('co2', 'guided'), L('n2', 'formula'), L('hcn', 'formula', 1), L('ch2o', 'formula', 1), L('c2h4', 'formula', 1), L('c2h2', 'name', 2)],
  },
  {
    id: 'w4', name: 'Química del carbono', subtitle: 'Cadenas, alcoholes, aldehídos, cetonas y ácidos',
    rank: 3, color: '#4ade80', color2: '#facc15',
    levels: [L('c2h6', 'guided'), L('c3h8', 'formula'), L('ch3oh', 'formula', 1), L('c2h5oh', 'formula', 1), L('ch3och3', 'formula', 1), L('ch3cho', 'formula', 1), L('ch3coch3', 'name', 2), L('hcooh', 'name', 2), L('ch3cooh', 'name', 2)],
  },
  {
    id: 'w5', name: 'Ácidos y anillos', subtitle: 'Oxoácidos, urea, glicerina y anillos de carbono',
    rank: 4, color: '#fb923c', color2: '#f43f5e',
    levels: [L('hclo', 'formula'), L('h2co3', 'formula', 1), L('ch3nh2', 'formula', 1), L('urea', 'formula', 1), L('glicerina', 'formula', 1), L('c6h12', 'guided'), L('c6h6', 'formula', 1)],
  },
  {
    id: 'w6', name: 'Iones y cargas formales', subtitle: 'Átomos con carga: O⁻, O⁺, N⁺, C⁻',
    rank: 5, color: '#c084fc', color2: '#38bdf8',
    levels: [L('oh-', 'guided'), L('h3o+', 'guided'), L('nh4+', 'formula'), L('cn-', 'formula', 1), L('no3-', 'formula', 1), L('co3--', 'formula', 1), L('o3', 'name', 2), L('hno3', 'name', 2)],
  },
  {
    id: 'w7', name: 'Geometrías VSEPR', subtitle: 'Octeto incompleto, expandido y formas de 5 y 6 dominios',
    rank: 5, color: '#fbbf24', color2: '#ef4444',
    levels: [L('becl2', 'guided'), L('bf3', 'formula'), L('so2', 'formula', 1), L('so3', 'formula', 1), L('h2so4', 'formula', 1), L('h3po4', 'formula', 1), L('pcl5', 'name', 2), L('sf6', 'name', 2)],
  },
];

// Niveles con id estable, molécula resuelta y tiempo par.
export function worldLevels(world) {
  return world.levels.map((lv, i) => {
    const mol = MOLECULE_BY_ID[lv.mol];
    return {
      ...lv,
      id: `${world.id}-${i + 1}`,
      index: i,
      worldId: world.id,
      molecule: mol,
      par: parTime(mol),
    };
  });
}

export const worldsForRank = (rank) => WORLDS.filter((w) => w.rank <= rank);

// Segundos "par" para la estrella de rapidez.
export function parTime(mol) {
  return Math.round(12 + 5 * mol.atoms.length + (mol.ring ? 20 : 0) + mol.bonds.filter((b) => (b[2] || 1) > 1).length * 4);
}

// ───────── estrellas y puntos ─────────

// ★ construida · ★ sin pistas ni errores · ★ rápida y limpia (tiempo ≤ par y como
// mucho 1 átomo de más colocado durante la construcción).
export function computeStars({ hints = 0, wrong = 0, seconds = 0, par = 60, extraAtoms = 0 }) {
  const clean = hints === 0 && wrong === 0;
  const fast = seconds <= par && extraAtoms <= 1;
  return { stars: 1 + (clean ? 1 : 0) + (fast ? 1 : 0), clean, fast };
}

export function levelPoints(mol, stars, seconds, par) {
  return 50 * mol.diff + 25 * stars + Math.max(0, Math.round((par - seconds) * 2));
}
export const levelMaxPoints = (mol, par) => 50 * mol.diff + 75 + 2 * par;

// ───────── desbloqueos ─────────

export const levelDone = (progress, id) => (progress.levels?.[id]?.stars || 0) > 0;

export function worldStats(world, progress) {
  const lv = worldLevels(world);
  const done = lv.filter((l) => levelDone(progress, l.id)).length;
  const stars = lv.reduce((s, l) => s + (progress.levels?.[l.id]?.stars || 0), 0);
  return { done, total: lv.length, stars, maxStars: lv.length * 3, need: Math.ceil(lv.length * 0.6) };
}

// Un mundo se abre si es el primero, si es de un curso inferior al del alumno
// (repaso), si el anterior es de un curso inferior, o con el 60 % del anterior hecho.
export function isWorldUnlocked(worlds, i, progress, rank) {
  if (i === 0) return true;
  const w = worlds[i]; const prev = worlds[i - 1];
  if (w.rank < rank || prev.rank < rank) return true;
  const st = worldStats(prev, progress);
  return st.done >= st.need;
}

export function isLevelUnlocked(worlds, wi, li, progress, rank) {
  if (!isWorldUnlocked(worlds, wi, progress, rank)) return false;
  if (li === 0 || worlds[wi].rank < rank) return true;
  return levelDone(progress, `${worlds[wi].id}-${li}`);
}

// ───────── paleta ─────────

// Tokens de la molécula + `extras` de relleno, ordenados por Z (y carga).
const FILLERS = ['H', 'C', 'N', 'O', 'F', 'Cl', 'S', 'Br', 'P'];
export function paletteFor(mol, extras = 0, seed = 0) {
  const own = tokensOf(mol);
  const pool = FILLERS.filter((t) => !own.includes(t));
  const pick = [];
  for (let k = 0; k < extras && pool.length; k++) {
    const j = Math.abs((seed * 7 + k * 13 + mol.id.length * 5) % pool.length);
    pick.push(pool.splice(j, 1)[0]);
  }
  return sortTokens([...own, ...pick]);
}
export const sortTokens = (toks) => [...toks].sort((a, b) => {
  const A = tokenInfo(a); const B = tokenInfo(b);
  return (A.z - B.z) || (A.charge - B.charge);
});

// Paleta del laboratorio libre según el curso.
export function labPalette(rank) {
  const base = ['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I'];
  if (rank >= 3) base.push('Si');
  if (rank >= 5) base.push('B', 'Be', 'O-', 'O+', 'N+', 'C-');
  return sortTokens(base);
}

// ───────── examen ─────────

// Elige `count` moléculas distintas para el examen: Fácil tira de las más
// sencillas del curso, Difícil de las más complejas, Medio de todas.
export function pickExamMolecules(pool, difficulty, count, rng = Math.random) {
  const sorted = [...pool].sort((a, b) => (a.diff - b.diff) || (a.atoms.length - b.atoms.length));
  const span = Math.max(count, Math.ceil(sorted.length * 0.6));
  let cands = sorted;
  if (difficulty === 'easy') cands = sorted.slice(0, span);
  if (difficulty === 'hard') cands = sorted.slice(Math.max(0, sorted.length - span));
  const bag = [...cands];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag.slice(0, Math.min(count, bag.length)).sort((a, b) => a.diff - b.diff);
}

// Paleta del examen: Fácil = solo lo necesario; Medio = +2 de relleno; Difícil = la del curso.
export function examPalette(mol, difficulty, rank) {
  if (difficulty === 'easy') return paletteFor(mol, 0);
  if (difficulty === 'medium') return paletteFor(mol, 2, mol.atoms.length);
  const lab = labPalette(rank);
  return sortTokens([...new Set([...lab, ...tokensOf(mol)])]);
}

// ───────── progreso (localStorage, por dispositivo) ─────────

export const PROGRESS_KEY = 'eduapps-mesa-crafteo-v2';
const LEGACY_KEY = 'mesa_crafteo_discoveries';

export const emptyProgress = () => ({ levels: {}, album: [], points: 0, tutorialSeen: false, bestRush: 0, bestQuiz: 0 });

export function loadProgress(catalog = []) {
  let p = emptyProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') p = { ...p, ...data, levels: { ...(data.levels || {}) }, album: Array.isArray(data.album) ? data.album : [] };
    } else {
      // migración: descubrimientos de la versión anterior (por nombre)
      const old = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
      const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s*\(.*\)\s*/g, '').trim();
      const byName = new Map(catalog.map((m) => [norm(m.name), m.id]));
      if (Array.isArray(old)) p.album = [...new Set(old.map((n) => byName.get(norm(n))).filter(Boolean))];
    }
  } catch { /* modo privado o datos corruptos: empezamos de cero */ }
  return p;
}

export function saveProgress(p) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* sin almacenamiento */ }
}

// Registra un nivel terminado. Devuelve { progress, improved, prevStars }.
export function recordLevel(progress, levelId, { stars, points }) {
  const prev = progress.levels[levelId] || { stars: 0, points: 0 };
  const improved = stars > prev.stars || points > prev.points;
  const best = { stars: Math.max(prev.stars, stars), points: Math.max(prev.points, points) };
  const gained = Math.max(0, best.points - prev.points);
  return {
    progress: { ...progress, levels: { ...progress.levels, [levelId]: best }, points: (progress.points || 0) + gained },
    improved,
    prevStars: prev.stars,
  };
}

export function addToAlbum(progress, molId) {
  if (progress.album.includes(molId)) return { progress, isNew: false };
  return { progress: { ...progress, album: [...progress.album, molId] }, isNew: true };
}
