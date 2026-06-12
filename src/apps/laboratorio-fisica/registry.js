// Catálogo de simulaciones del Laboratorio de Física 3D.
// Cada escena vive en scenes/<id>.jsx y cumple CONTRATO_ESCENAS.md.
// El catálogo es ACUMULATIVO: un curso ve sus simulaciones más todas las de
// cursos anteriores; las de ampliación se muestran marcadas y no entran en
// el examen.
import caidaLibre from './scenes/caida-libre';
import rozamiento from './scenes/rozamiento';
import muelles from './scenes/muelles';
import gases from './scenes/gases';
import planoInclinado from './scenes/plano-inclinado';
import flotaOHunde from './scenes/flota-o-hunde';
import mruMrua from './scenes/mru-mrua';
import poleas from './scenes/poleas';
import presionHidrostatica from './scenes/presion-hidrostatica';
import pascal from './scenes/pascal';
import arquimedes from './scenes/arquimedes';
import presionAtmosferica from './scenes/presion-atmosferica';
import gravitacion from './scenes/gravitacion';
import energia from './scenes/energia';
import movimientoCircular from './scenes/movimiento-circular';
import tiroParabolico from './scenes/tiro-parabolico';
import choques from './scenes/choques';
import estatica from './scenes/estatica';
import orbitas from './scenes/orbitas';
import oscilaciones from './scenes/oscilaciones';
import cargasCampos from './scenes/cargas-campos';
import tunelViento from './scenes/tunel-viento';
import stokes from './scenes/stokes';
import { courseIndex } from './engine/exam';

export const SIMS = [
  // ciclo ESO (1º-2º)
  caidaLibre,
  rozamiento,
  muelles,
  gases,
  // 3º ESO
  planoInclinado,
  flotaOHunde,
  // 4º ESO
  mruMrua,
  poleas,
  presionHidrostatica,
  pascal,
  arquimedes,
  presionAtmosferica,
  gravitacion,
  energia,
  movimientoCircular,
  // 1º Bachillerato
  tiroParabolico,
  choques,
  estatica,
  // 2º Bachillerato
  orbitas,
  oscilaciones,
  cargasCampos,
  // ampliaciones de fluidodinámica (nunca entran en examen)
  tunelViento,
  stokes,
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
