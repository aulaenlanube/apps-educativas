// Structured app catalog for cascading selection (level → grade → subject → app)
import { primariaApps, esoApps, bachilleratoApps } from './appList';
import materiasData from '../../public/data/materias.json';

const LEVEL_LABELS = {
  primaria: 'Primaria',
  eso: 'ESO',
  bachillerato: 'Bachillerato',
};

const GRADE_LABELS = {
  primaria: { '1': '1º Primaria', '2': '2º Primaria', '3': '3º Primaria', '4': '4º Primaria', '5': '5º Primaria', '6': '6º Primaria' },
  eso: { '1': '1º ESO', '2': '2º ESO', '3': '3º ESO', '4': '4º ESO' },
  bachillerato: { '1': '1º Bachillerato', '2': '2º Bachillerato' },
};

const APP_CONFIGS = {
  primaria: primariaApps,
  eso: esoApps,
  bachillerato: bachilleratoApps,
};

/** Returns array of levels: [{ id: 'primaria', label: 'Primaria' }, ...] */
export function getLevels() {
  return Object.entries(LEVEL_LABELS).map(([id, label]) => ({ id, label }));
}

/** Returns grades for a level: [{ id: '1', label: '1º Primaria' }, ...] */
export function getGrades(level) {
  const grades = GRADE_LABELS[level];
  if (!grades) return [];
  return Object.entries(grades).map(([id, label]) => ({ id, label }));
}

/** Returns subjects for a level+grade: [{ id: 'lengua', nombre: '...', icon: '...' }, ...] */
export function getSubjects(level, grade) {
  const levelData = materiasData[level];
  if (!levelData || !levelData[grade]) return [];
  return levelData[grade];
}

/** Returns apps for level+grade+subject: [{ id, name }, ...] (no component) */
export function getApps(level, grade, subjectId) {
  const config = APP_CONFIGS[level];
  if (!config || !config[grade] || !config[grade][subjectId]) return [];
  return config[grade][subjectId].map(app => ({ id: app.id, name: app.name }));
}

// Keep backward compatibility — flat list for other uses.
// Each entry also includes the first location where the app is registered,
// so admin/testing tools can link directly to it.
export function getAllAppsFlat() {
  const seen = new Set();
  const result = [];
  const extract = (level, appsConfig) => {
    for (const grade in appsConfig) {
      for (const subject in appsConfig[grade]) {
        for (const app of appsConfig[grade][subject]) {
          if (!seen.has(app.id)) {
            seen.add(app.id);
            result.push({
              id: app.id,
              name: app.name,
              level,
              grade,
              subjectId: subject,
            });
          }
        }
      }
    }
  };
  extract('primaria', primariaApps);
  extract('eso', esoApps);
  extract('bachillerato', bachilleratoApps);
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
