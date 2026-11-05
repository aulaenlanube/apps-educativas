// src/data/appStats.js
//
// Cifras públicas de la plataforma: cuántas apps hay y cuántas adaptaciones.
// Funciones PURAS (no importan nada): reciben el registro de apps y devuelven
// los números. Las usan, sin copiar la lógica:
//   - tools/generate-app-stats.mjs → public/datos/cifras-apps.json (contrato
//     público que leen los vídeos) y la descripción del manifest;
//   - tools/vite-plugin-app-stats.mjs → módulo `virtual:app-stats` (portada,
//     catálogo, blog) y los {{apps}} de index.html;
//   - src/pages/AdaptacionesPage.jsx → listado completo;
//   - tools/generate-llms.js → llms.txt.
//
// DEFINICIONES (si cambias alguna, cambia también CLAUDE.md):
//   · Adaptación: una app ofrecida en un curso y una asignatura concretos, con
//     el contenido de ese curso y esa asignatura. Es cada entrada (app, nivel,
//     curso, asignatura) de src/apps/config/*Apps.js; la misma tupla que la
//     plataforma ya trata como «app distinta» en avatares, rankings y tareas.
//     Las apps que Bachillerato hereda de `appsBase` cuentan: cada asignatura
//     de Bachillerato tiene su propio banco de contenido.
//   · App: cada juego distinto. Las versiones por curso de un mismo juego
//     (Sumas de 1.º, de 2.º…, marcadas con `family` en commonApps.js) son UNA
//     app con varias adaptaciones. Las definiciones que no están en ningún
//     curso (p. ej. misiones-roboticas) no cuentan.

export const STATS_LEVELS = [
  { level: 'primaria', label: 'Primaria' },
  { level: 'eso', label: 'ESO' },
  { level: 'bachillerato', label: 'Bachillerato' },
  { level: 'ad', label: 'Atención a la Diversidad' },
];

export const SITE_URL = 'https://apps-educativas.com';

// Versión del contrato de /datos/cifras-apps.json. Súbela solo si quitas o
// renombras un campo (añadir campos nuevos no rompe a quien lo lee).
export const STATS_CONTRACT_VERSION = 1;

const EMOJI_RE = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})(️|‍(\p{Emoji_Presentation}|\p{Extended_Pictographic})️?)*\s*/u;

/** Separa el emoji inicial del nombre: «🧍 Anatomía 3D» → { emoji: '🧍', text: 'Anatomía 3D' }. */
export function splitAppName(name = '') {
  const m = String(name).match(EMOJI_RE);
  if (!m) return { emoji: '', text: String(name).trim() };
  return { emoji: m[0].trim(), text: String(name).slice(m[0].length).trim() };
}

export function launchPath(appId, { level, grade, subjectId }) {
  return `/curso/${level}/${grade}/${subjectId}/app/${appId}`;
}

function gradeLabel(level, levelLabel, grade) {
  return level === 'ad' ? levelLabel : `${grade}.º ${levelLabel}`;
}

function gradeOrder(grades) {
  return [...grades].sort((a, b) => Number(a) - Number(b));
}

/**
 * Recorre el registro y devuelve una entrada por app (o familia) con TODAS
 * sus adaptaciones, en el orden de la plataforma (Primaria → ESO →
 * Bachillerato → AD, curso ascendente, asignaturas en el orden del registro).
 *
 * @param {Record<string, {apps: object, subjects: object}>} registry
 *   { primaria: { apps: primariaApps, subjects: primariaSubjects }, … }
 * @param {Record<string, {name: string}>} families  APP_FAMILIES de commonApps.js
 */
export function buildAdaptationIndex(registry, families = {}) {
  const byKey = new Map();

  for (const { level, label } of STATS_LEVELS) {
    const reg = registry[level];
    if (!reg || !reg.apps) continue;
    for (const grade of gradeOrder(Object.keys(reg.apps))) {
      const subjectsOfGrade = (reg.subjects && reg.subjects[grade]) || [];
      const subjectName = Object.fromEntries(subjectsOfGrade.map((s) => [s.id, s.nombre]));
      const bySubject = reg.apps[grade] || {};
      for (const subjectId of Object.keys(bySubject)) {
        const seenInSlot = new Set();
        for (const app of bySubject[subjectId] || []) {
          if (!app || !app.id || seenInSlot.has(app.id)) continue;
          seenInSlot.add(app.id);

          const familyId = app.family && families[app.family] ? app.family : null;
          const key = familyId || app.id;
          let entry = byKey.get(key);
          if (!entry) {
            const { emoji, text } = splitAppName(familyId ? families[familyId].name : app.name);
            entry = {
              key,
              name: text,
              emoji,
              family: familyId,
              ids: [],
              variants: {},
              addedAt: null,
              adaptations: [],
            };
            byKey.set(key, entry);
          }
          if (!entry.variants[app.id]) {
            entry.ids.push(app.id);
            entry.variants[app.id] = {
              id: app.id,
              name: splitAppName(app.name).text,
              description: app.description || '',
              addedAt: app.addedAt || null,
            };
            if (!entry.description) entry.description = app.description || '';
            if (app.addedAt && (!entry.addedAt || app.addedAt < entry.addedAt)) {
              entry.addedAt = app.addedAt; // una familia «nace» con su primera versión
            }
          }
          entry.adaptations.push({
            appId: app.id,
            level,
            levelLabel: label,
            grade: String(grade),
            gradeLabel: gradeLabel(level, label, grade),
            subjectId,
            subjectName: subjectName[subjectId] || subjectId,
            path: launchPath(app.id, { level, grade, subjectId }),
          });
        }
      }
    }
  }

  return [...byKey.values()];
}

/** App más reciente según `addedAt` (null si ninguna lo tiene). */
export function latestApp(index) {
  let best = null;
  for (const e of index) {
    if (!e.addedAt) continue;
    if (!best || e.addedAt > best.addedAt) best = e;
  }
  return best;
}

/**
 * Resumen público. Es EXACTAMENTE el contenido de /datos/cifras-apps.json
 * salvo `generado`, que añade el script al escribir el fichero.
 */
export function summarizeAppStats(index) {
  const porNivel = {};
  for (const { level, label } of STATS_LEVELS) {
    const apps = new Set();
    const grades = new Set();
    let adaptaciones = 0;
    for (const e of index) {
      for (const a of e.adaptations) {
        if (a.level !== level) continue;
        apps.add(e.key);
        grades.add(a.grade);
        adaptaciones += 1;
      }
    }
    if (adaptaciones === 0) continue;
    porNivel[level] = { nombre: label, apps: apps.size, adaptaciones, cursos: grades.size };
  }

  const last = latestApp(index);
  const lastPath = last ? last.adaptations[0].path : null;

  return {
    version: STATS_CONTRACT_VERSION,
    apps: index.length,
    adaptaciones: index.reduce((n, e) => n + e.adaptations.length, 0),
    cursos: Object.values(porNivel).reduce((n, l) => n + l.cursos, 0),
    por_nivel: porNivel,
    ultima_app: last
      ? { id: last.key, nombre: last.name, ruta: lastPath, url: `${SITE_URL}${lastPath}` }
      : null,
  };
}

export function computeAppStats(registry, families = {}) {
  return summarizeAppStats(buildAdaptationIndex(registry, families));
}

const NUMBER_FMT = new Intl.NumberFormat('es-ES');

/** 4550 → «4550»; 12000 → «12.000» (norma RAE: sin punto en cifras de 4 dígitos). */
export function formatCount(n) {
  return NUMBER_FMT.format(n);
}

/**
 * Sustituye {{apps}}, {{adaptaciones}}, {{cursos}} y {{ultima_app}} por las
 * cifras del momento. Lo usan los posts del blog, llms.txt e index.html para
 * no volver a escribir una cifra a mano.
 */
export function fillStatsPlaceholders(text, stats) {
  if (!text || !stats) return text;
  return String(text)
    .replace(/\{\{\s*apps\s*\}\}/g, formatCount(stats.apps))
    .replace(/\{\{\s*adaptaciones\s*\}\}/g, formatCount(stats.adaptaciones))
    .replace(/\{\{\s*cursos\s*\}\}/g, formatCount(stats.cursos))
    .replace(/\{\{\s*ultima_app\s*\}\}/g, stats.ultima_app ? stats.ultima_app.nombre : '');
}
