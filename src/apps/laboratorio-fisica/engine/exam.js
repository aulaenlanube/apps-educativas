// Generador del examen POE: 10 preguntas del catálogo ACUMULADO del curso
// (las simulaciones de ampliación nunca entran), con ~60% de peso para las
// simulaciones estrenadas en el curso actual y el resto de repaso.
import { mulberry32, shuffle } from './rng';

// Índice ordinal de curso: 1º ESO=1 … 4º ESO=4, 1º Bach=5, 2º Bach=6
export function courseIndex(level, grade) {
  const g = parseInt(grade, 10) || 1;
  return level === 'bachillerato' ? 4 + Math.min(Math.max(g, 1), 2) : Math.min(Math.max(g, 1), 4);
}

export function cursoLabel(curso) {
  return curso.level === 'bachillerato' ? `${curso.grade}º Bach` : `${curso.grade}º ESO`;
}

// Simulaciones que SÍ entran en el examen del curso (mismo criterio que
// generarExamen). Sirve para avisar de antemano de qué temas se preguntará.
export function examPool(sims, level, grade) {
  const idx = courseIndex(level, grade);
  return sims.filter((s) => !s.esAmpliacion
    && courseIndex(s.curso.level, s.curso.grade) <= idx
    && s.examTemplates?.length);
}

export function generarExamen(sims, level, grade, seed, total = 10) {
  const idx = courseIndex(level, grade);
  const pool = examPool(sims, level, grade);
  const rng = mulberry32(seed >>> 0);

  const nuevas = pool.filter((s) => courseIndex(s.curso.level, s.curso.grade) === idx);
  const repaso = pool.filter((s) => courseIndex(s.curso.level, s.curso.grade) < idx);
  const tNew = shuffle(rng, nuevas.flatMap((s) => s.examTemplates.map((t) => ({ sim: s, t }))));
  const tOld = shuffle(rng, repaso.flatMap((s) => s.examTemplates.map((t) => ({ sim: s, t }))));

  const picked = [];
  if (tOld.length === 0) {
    picked.push(...tNew.slice(0, total));
  } else if (tNew.length === 0) {
    picked.push(...tOld.slice(0, total));
  } else {
    picked.push(...tNew.slice(0, Math.min(Math.round(total * 0.6), tNew.length)));
    picked.push(...tOld.slice(0, total - picked.length));
    if (picked.length < total) picked.push(...tNew.slice(picked.length - tOld.length));
  }
  // si aún faltan, se repiten plantillas: cada generar(rng) sortea números nuevos
  const all = [...tNew, ...tOld];
  while (picked.length < total && all.length) {
    picked.push(all[Math.floor(rng() * all.length)]);
  }

  shuffle(rng, picked);
  return picked.slice(0, total).map(({ sim, t }, i) => ({
    numero: i + 1,
    simId: sim.id,
    simNombre: sim.nombre,
    simIcono: sim.icono,
    ...t.generar(rng),
  }));
}

// Puntos paralelos (sin tope) de una pregunta del examen
export function puntosPregunta({ predOk, explOk, timeMs, precision, streak }) {
  let pts = 0;
  if (predOk) {
    pts += 100;
    const secs = timeMs / 1000;
    pts += Math.round(Math.max(0, Math.min(50, 50 * (1 - (secs - 10) / 50))));
    if (precision) pts += 25;
    if (streak >= 2) pts += 15;
  }
  if (explOk) pts += 30;
  return pts;
}
