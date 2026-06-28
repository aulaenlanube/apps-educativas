// src/data/appAvailability.js
// Índice de disponibilidad de cada app: en qué (nivel, curso, asignatura) se puede
// jugar. Se construye recorriendo la configuración real de la plataforma, de modo que
// el catálogo público se mantiene siempre sincronizado con las apps publicadas.
import {
  primariaApps, esoApps, bachilleratoApps, adApps,
  primariaSubjects, esoSubjects, bachilleratoSubjects, adSubjects,
} from '@/apps/appList';

const LEVELS = [
  { level: 'primaria', label: 'Primaria', apps: primariaApps, subjects: primariaSubjects },
  { level: 'eso', label: 'ESO', apps: esoApps, subjects: esoSubjects },
  { level: 'bachillerato', label: 'Bachillerato', apps: bachilleratoApps, subjects: bachilleratoSubjects },
  { level: 'ad', label: 'Atención a la Diversidad', apps: adApps, subjects: adSubjects },
];

const availability = {};
const meta = {};

for (const { level, label, apps, subjects } of LEVELS) {
  for (const grade of Object.keys(apps || {})) {
    const subjectsForGrade = (subjects && subjects[grade]) || [];
    const subjectNameById = {};
    subjectsForGrade.forEach((s) => { subjectNameById[s.id] = s.nombre; });

    const bySubject = apps[grade] || {};
    for (const subjectId of Object.keys(bySubject)) {
      const list = bySubject[subjectId] || [];
      for (const app of list) {
        if (!app || !app.id) continue;
        if (!meta[app.id]) {
          meta[app.id] = { id: app.id, name: app.name, description: app.description };
        }
        if (!availability[app.id]) availability[app.id] = [];
        availability[app.id].push({
          level,
          levelLabel: label,
          grade,
          gradeLabel: level === 'ad' ? 'Atención a la Diversidad' : `${grade}º`,
          subjectId,
          subjectName: subjectNameById[subjectId] || subjectId,
        });
      }
    }
  }
}

export const APP_AVAILABILITY = availability;
export const APP_META = meta;
export const ALL_APP_IDS = Object.keys(meta);

const LEVEL_ORDER = { primaria: 0, eso: 1, bachillerato: 2, ad: 3 };

/** Devuelve las combinaciones de disponibilidad de una app agrupadas por nivel/curso. */
export function getAvailability(appId) {
  return APP_AVAILABILITY[appId] || [];
}

/** Lista ordenada y única de niveles donde aparece la app. */
export function getLevelsFor(appId) {
  const combos = getAvailability(appId);
  const seen = new Map();
  combos.forEach((c) => { if (!seen.has(c.level)) seen.set(c.level, { level: c.level, label: c.levelLabel }); });
  return [...seen.values()].sort((a, b) => (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9));
}

/** Construye la URL para lanzar una app en un contexto concreto. */
export function buildLaunchPath(appId, combo) {
  return `/curso/${combo.level}/${combo.grade}/${combo.subjectId}/app/${appId}`;
}

/** Extrae el emoji inicial del nombre de la app (si lo tiene). */
export function splitEmoji(name = '') {
  const match = name.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
  if (match) return { emoji: match[1], text: name.slice(match[0].length).trim() };
  return { emoji: '', text: name };
}
