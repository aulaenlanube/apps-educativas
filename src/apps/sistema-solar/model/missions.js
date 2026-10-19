// src/apps/sistema-solar/model/missions.js
// Catálogo de misiones del Sistema Solar 3D y nivel de dificultad por curso.
// Cada misión terminada es una partida con nota (app single_mode): ver
// missionScoring.js y el contrato de onGameComplete en SistemaSolar.jsx.

// Nivel de dificultad 1–5 a partir del curso.
//   1 Primaria 1º-3º (y Atención a la Diversidad) · 2 Primaria 4º-6º
//   3 ESO 1º-2º · 4 ESO 3º-4º · 5 Bachillerato
export function tierFor(level, grade) {
  const g = parseInt(grade, 10) || 1;
  if (level === 'primaria') return g <= 3 ? 1 : 2;
  if (level === 'eso') return g <= 2 ? 3 : 4;
  if (level === 'bachillerato') return 5;
  if (level === 'ad') return 1;
  return 3;
}

export const TIER_LABEL = { 1: 'Nivel inicial', 2: 'Nivel explorador', 3: 'Nivel ESO', 4: 'Nivel ESO avanzado', 5: 'Nivel Bachillerato' };

// unlock = estrellas totales necesarias. kind decide la pantalla:
//   order (ordenar), riddle (en la escena 3D), layers (visor de capas), quiz (preguntas)
export const MISSIONS = [
  {
    id: 'ordena', kind: 'order', unlock: 0, tone: '#818cf8',
    title: 'Ordena el Sistema Solar',
    desc: 'Coloca los planetas por distancia, tamaño, masa o densidad.',
    skill: 'Orden y escalas',
  },
  {
    id: 'adivina', kind: 'riddle', unlock: 0, tone: '#f472b6',
    title: '¿Qué planeta soy?',
    desc: 'Lee las pistas y toca el astro en la escena 3D. Menos pistas, más puntos.',
    skill: 'Características',
  },
  {
    id: 'versus', kind: 'quiz', unlock: 0, tone: '#34d399',
    title: '¿Más o menos?',
    desc: 'Duelos rápidos de datos: ¿cuál es más grande, más caliente, más denso…?',
    skill: 'Comparar datos',
  },
  {
    id: 'capas', kind: 'layers', unlock: 2, tone: '#fb923c',
    title: 'Viaje al interior',
    desc: 'Abre los planetas por la mitad y encuentra cada capa.',
    skill: 'Estructura interna',
  },
  {
    id: 'viaje', kind: 'quiz', unlock: 4, tone: '#38bdf8',
    title: 'Plan de vuelo',
    desc: 'Calcula distancias, la velocidad de la luz y cuánto dura cada viaje.',
    skill: 'Distancias y cálculo',
  },
  {
    id: 'examen', kind: 'quiz', unlock: 7, tone: '#fbbf24',
    title: 'Gran examen del explorador',
    desc: 'Diez preguntas de todo lo aprendido para ganar tu insignia.',
    skill: 'Todo',
  },
];

export const missionById = (id) => MISSIONS.find((m) => m.id === id);

// Número de preguntas por misión y nivel
export function questionCount(missionId, tier) {
  switch (missionId) {
    case 'adivina': return tier <= 2 ? 5 : tier <= 4 ? 6 : 7;
    case 'versus': return tier <= 2 ? 8 : 10;
    case 'capas': return tier <= 2 ? 5 : tier <= 4 ? 7 : 8;
    case 'viaje': return tier <= 2 ? 5 : tier <= 4 ? 6 : 7;
    case 'examen': return 10;
    default: return 8;
  }
}

// Segundos de referencia por pregunta para el bonus de rapidez
export const SPEED_LIMIT = { versus: 12, viaje: 30, examen: 25, capas: 20, adivina: 40 };
