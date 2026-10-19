// src/apps/sistema-solar/progress.js
// Progreso del explorador en ESTE dispositivo (localStorage, por etapa
// educativa): estrellas por misión, rango y diario de exploración. No es la
// nota oficial (esa la guarda onGameComplete en el servidor): sirve para
// desbloquear misiones y motivar. Todo acceso a localStorage va en try/catch.
import { MISSIONS } from './model/missions';

export const PROGRESS_VERSION = 2;
export const progressKey = (level) => `eduapps:sistema-solar:v${PROGRESS_VERSION}:${level || 'general'}`;

export const emptyProgress = () => ({ v: PROGRESS_VERSION, missions: {}, bodies: {}, interiors: {} });

export function starsForNota(nota) {
  if (nota >= 9) return 3;
  if (nota >= 7) return 2;
  if (nota >= 5) return 1;
  return 0;
}

export const RANKS = [
  { id: 'cadete', name: 'Cadete espacial', min: 0 },
  { id: 'piloto', name: 'Piloto en prácticas', min: 2 },
  { id: 'navegante', name: 'Navegante orbital', min: 5 },
  { id: 'comandante', name: 'Comandante de misión', min: 9 },
  { id: 'astronauta', name: 'Astronauta veterano', min: 13 },
  { id: 'leyenda', name: 'Leyenda del Sistema Solar', min: 17 },
];

export const MAX_STARS = MISSIONS.length * 3;

export function totalStars(p) {
  return Object.values(p?.missions || {}).reduce((n, m) => n + (m?.stars || 0), 0);
}

export function rankFor(stars) {
  let index = 0;
  RANKS.forEach((r, i) => { if (stars >= r.min) index = i; });
  const rank = RANKS[index];
  const next = RANKS[index + 1] || null;
  const progress = next ? (stars - rank.min) / (next.min - rank.min) : 1;
  return { rank, index, next, progress: Math.max(0, Math.min(1, progress)) };
}

export function isUnlocked(mission, p) {
  return totalStars(p) >= (mission?.unlock || 0);
}

// Guarda el resultado de una misión: mejor nota, mejores puntos, partidas.
export function recordMission(p, missionId, { nota = 0, points = 0 } = {}) {
  const prev = p.missions[missionId] || { best: 0, bestPoints: 0, plays: 0, stars: 0 };
  const best = Math.max(prev.best || 0, nota);
  const next = {
    best,
    bestPoints: Math.max(prev.bestPoints || 0, points),
    plays: (prev.plays || 0) + 1,
    stars: Math.max(prev.stars || 0, starsForNota(nota)),
    last: nota,
  };
  return { ...p, missions: { ...p.missions, [missionId]: next } };
}

export const markBody = (p, id) => (p.bodies[id] ? p : { ...p, bodies: { ...p.bodies, [id]: true } });
export const markInterior = (p, id) => (p.interiors[id] ? p : { ...p, interiors: { ...p.interiors, [id]: true } });

// Normaliza lo leído (datos viejos/corruptos → vacío)
export function sanitize(raw) {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object' || raw.v !== PROGRESS_VERSION) return base;
  const missions = {};
  for (const m of MISSIONS) {
    const r = raw.missions?.[m.id];
    if (r && typeof r === 'object') {
      missions[m.id] = {
        best: Math.max(0, Math.min(10, Number(r.best) || 0)),
        bestPoints: Math.max(0, Number(r.bestPoints) || 0),
        plays: Math.max(0, Math.floor(Number(r.plays) || 0)),
        stars: Math.max(0, Math.min(3, Math.floor(Number(r.stars) || 0))),
        last: Math.max(0, Math.min(10, Number(r.last) || 0)),
      };
    }
  }
  const flags = (o) => Object.fromEntries(Object.keys(o && typeof o === 'object' ? o : {}).map((k) => [k, true]));
  return { ...base, missions, bodies: flags(raw.bodies), interiors: flags(raw.interiors) };
}

export function loadProgress(level) {
  try {
    const s = localStorage.getItem(progressKey(level));
    return sanitize(s ? JSON.parse(s) : null);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(level, p) {
  try { localStorage.setItem(progressKey(level), JSON.stringify(p)); } catch { /* modo privado / sin espacio */ }
}
