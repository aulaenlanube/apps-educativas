// Catálogo de simulaciones del Laboratorio de Física 3D.
// Cada escena vive en scenes/<id>.jsx y cumple CONTRATO_ESCENAS.md.
// El catálogo es ACUMULATIVO: un curso ve sus simulaciones más todas las de
// cursos anteriores; las de ampliación se muestran marcadas y no entran en
// el examen.
import caidaLibre from './scenes/caida-libre';
import rozamiento from './scenes/rozamiento';
import muelles from './scenes/muelles';
import gases from './scenes/gases';
import { courseIndex } from './engine/exam';

export const SIMS = [
  caidaLibre,
  rozamiento,
  muelles,
  gases,
];

// Valores por defecto de los parámetros de una simulación
export function defaultsDe(sim) {
  return Object.fromEntries(sim.paramsDef.map((d) => [d.key, d.def]));
}

// Catálogo visible para un curso, anotado con esNueva / comoAmpliacion
export function catalogoPara(level, grade) {
  const idx = courseIndex(level, grade);
  return SIMS
    .filter((s) => {
      const sIdx = courseIndex(s.curso.level, s.curso.grade);
      if (sIdx <= idx) return true;
      if (s.ampliacionEn && courseIndex(s.ampliacionEn.level, s.ampliacionEn.grade) <= idx) return true;
      return false;
    })
    .map((s) => ({
      sim: s,
      esNueva: courseIndex(s.curso.level, s.curso.grade) === idx,
      comoAmpliacion: !!s.esAmpliacion || courseIndex(s.curso.level, s.curso.grade) > idx,
    }));
}

export function simPorId(id) {
  return SIMS.find((s) => s.id === id) || null;
}
