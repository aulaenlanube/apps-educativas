// src/apps/appList.js
import { lazy } from 'react';
import { primariaApps, primariaSubjects } from './config/primariaApps';
import { esoApps, esoSubjects } from './config/esoApps';
import { bachilleratoApps, bachilleratoSubjects } from './config/bachilleratoApps';
import { alApps, alSubjects } from './config/alApps';
import { ptApps, ptSubjects } from './config/ptApps';

// Re-exportamos todo
export { primariaApps, esoApps, bachilleratoApps, alApps, ptApps, primariaSubjects, esoSubjects, bachilleratoSubjects, alSubjects, ptSubjects };

// Mapa unificado de nivel → { apps, subjects }
const levelRegistry = {
  primaria:     { apps: primariaApps,     subjects: primariaSubjects },
  eso:          { apps: esoApps,          subjects: esoSubjects },
  bachillerato: { apps: bachilleratoApps, subjects: bachilleratoSubjects },
  al:           { apps: alApps,           subjects: alSubjects },
  pt:           { apps: ptApps,           subjects: ptSubjects },
};

/**
 * Busca una app por su identificador. Acepta el nivel, curso y materia cuando exista
 * Devuelve un objeto con la app y el contexto si la encuentra, o null en caso contrario
 */
export const findAppById = (id, level, grade, subjectId) => {
  const registry = levelRegistry[level];
  if (!registry) return null;

  const { apps } = registry;

  // si se especifica la materia, buscamos únicamente dentro de esa categoría
  if (subjectId) {
    const appsEnMateria = apps[grade]?.[subjectId] || [];
    const encontrada = appsEnMateria.find((app) => app.id === id);
    if (encontrada) {
      return { app: encontrada, level, grade, subjectId };
    }
  }
  // búsqueda general: recorremos todas las materias del curso
  const materiasCurso = apps[grade] || {};
  for (const claveMateria in materiasCurso) {
    const appsMateria = materiasCurso[claveMateria] || [];
    const encontrada = appsMateria.find((app) => app.id === id);
    if (encontrada) {
      return { app: encontrada, level, grade, subjectId: claveMateria };
    }
  }

  return null; // si no encuentra la app, devolvemos null
};