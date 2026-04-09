// src/apps/appList.js
import { lazy } from 'react';
import { primariaApps, primariaSubjects } from './config/primariaApps';
import { esoApps, esoSubjects } from './config/esoApps';
import { bachilleratoApps, bachilleratoSubjects } from './config/bachilleratoApps';

// Re-exportamos todo
export { primariaApps, esoApps, bachilleratoApps, primariaSubjects, esoSubjects, bachilleratoSubjects };

/**
 * Busca una app por su identificador. Acepta el nivel, curso y materia cuando exista
 * Devuelve un objeto con la app y el contexto si la encuentra, o null en caso contrario
 */
export const findAppById = (id, level, grade, subjectId) => {
  if (level === 'primaria') {
    // si se especifica la materia, buscamos únicamente dentro de esa categoría
    if (subjectId) {
      const appsEnMateria = primariaApps[grade]?.[subjectId] || [];
      const encontrada = appsEnMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'primaria', grade, subjectId };
      }
    }
    // búsqueda general: recorremos todas las materias del curso
    const materiasCurso = primariaApps[grade] || {};
    for (const claveMateria in materiasCurso) {
      const appsMateria = materiasCurso[claveMateria] || [];
      const encontrada = appsMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'primaria', grade, subjectId: claveMateria };
      }
    }
  }
  if (level === 'eso') {
    if (subjectId) {
      const appsEnMateria = esoApps[grade]?.[subjectId] || [];
      const encontrada = appsEnMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'eso', grade, subjectId };
      }
    }
    const materiasCurso = esoApps[grade] || {};
    for (const claveMateria in materiasCurso) {
      const appsMateria = materiasCurso[claveMateria] || [];
      const encontrada = appsMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'eso', grade, subjectId: claveMateria };
      }
    }
  }
  if (level === 'bachillerato') {
    if (subjectId) {
      const appsEnMateria = bachilleratoApps[grade]?.[subjectId] || [];
      const encontrada = appsEnMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'bachillerato', grade, subjectId };
      }
    }
    const materiasCurso = bachilleratoApps[grade] || {};
    for (const claveMateria in materiasCurso) {
      const appsMateria = materiasCurso[claveMateria] || [];
      const encontrada = appsMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'bachillerato', grade, subjectId: claveMateria };
      }
    }
  }
  return null; // si no encuentra la app, devolvemos null
};