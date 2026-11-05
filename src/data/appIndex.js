// src/data/appIndex.js
// Índice VIVO de apps y adaptaciones, calculado del registro real
// (src/apps/appList.js) con las funciones puras de appStats.js. Lo usan la
// página /adaptaciones, las sugerencias de «Propón una app» y el panel de
// propuestas del admin. Importa todo el registro: cárgalo solo en páginas o
// componentes perezosos (la portada usa `virtual:app-stats`, que es mínimo).
import {
  primariaApps, esoApps, bachilleratoApps, adApps,
  primariaSubjects, esoSubjects, bachilleratoSubjects, adSubjects,
} from '@/apps/appList';
import { APP_FAMILIES } from '@/apps/config/commonApps';
import { buildAdaptationIndex, summarizeAppStats } from './appStats';

export const APP_INDEX = buildAdaptationIndex({
  primaria: { apps: primariaApps, subjects: primariaSubjects },
  eso: { apps: esoApps, subjects: esoSubjects },
  bachillerato: { apps: bachilleratoApps, subjects: bachilleratoSubjects },
  ad: { apps: adApps, subjects: adSubjects },
}, APP_FAMILIES);

export const LIVE_APP_STATS = summarizeAppStats(APP_INDEX);

/** Minúsculas, sin tildes ni signos: «¿Fracciones?» → «fracciones». */
export function normalizeText(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'una', 'uno', 'unos', 'unas', 'app', 'apps', 'aplicacion', 'juego', 'juegos', 'para', 'que', 'con',
  'los', 'las', 'del', 'por', 'como', 'sobre', 'donde', 'cual', 'quiero', 'querria', 'me', 'gustaria',
  'tener', 'hacer', 'algo', 'alumnos', 'alumnado', 'clase', 'curso', 'cursos', 'primaria', 'eso',
  'bachillerato', 'practicar', 'aprender', 'repasar', 'tipo', 'estilo', 'mas', 'muy', 'pero', 'entre',
]);

// Pre-normalizamos una vez: nombre (y nombres de versiones) + descripción.
const SEARCHABLE = APP_INDEX.map((e) => {
  const names = normalizeText([e.name, ...Object.values(e.variants).map((v) => v.name)].join(' '));
  return {
    entry: e,
    names,
    nameWords: new Set(names.split(' ').filter((w) => w.length >= 4)),
    desc: normalizeText(Object.values(e.variants).map((v) => v.description).join(' ')),
  };
});

/**
 * Apps existentes que se parecen a lo que alguien escribe en «¿Qué app
 * querrías?». Puntúa coincidencias en el nombre (2) y en la descripción (1);
 * las palabras cortas o genéricas («juego», «para», «primaria») no cuentan.
 */
export function suggestExistingApps(query, limit = 4) {
  const tokens = [...new Set(normalizeText(query).split(' '))]
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];
  const stem = (t) => (t.length > 5 ? t.replace(/(es|s)$/, '') : t);
  const scored = [];
  for (const s of SEARCHABLE) {
    let score = 0;
    for (const t of tokens) {
      const st = stem(t);
      if (s.names.includes(st) || [...s.nameWords].some((w) => st.includes(stem(w)))) score += 2;
      else if (s.desc.includes(st)) score += 1;
    }
    if (score >= 2) scored.push({ score, entry: s.entry });
  }
  scored.sort((a, b) => b.score - a.score || b.entry.adaptations.length - a.entry.adaptations.length);
  return scored.slice(0, limit).map((x) => x.entry);
}
