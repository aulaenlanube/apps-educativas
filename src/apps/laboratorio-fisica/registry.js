// Catálogo de simulaciones del Laboratorio de Física 3D.
// Cada escena vive en scenes/<id>.jsx y cumple CONTRATO_ESCENAS.md.
// Reglas de visibilidad:
//  - ESO (1º-4º): TODOS los cursos ven el catálogo COMPLETO de la ESO (lo mismo
//    que 4º ESO), para que el docente elija qué simulaciones usar. Cada tarjeta
//    se etiqueta con su curso nativo.
//  - Bachillerato (1º-2º): ACUMULATIVO (ve lo suyo + todo lo de cursos previos).
//  - Las de ampliación se muestran marcadas y nunca entran en el examen.
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
  const realIdx = courseIndex(level, grade);
  // En ESO el filtro usa siempre 4º ESO → todos los cursos de la ESO ven el
  // mismo catálogo completo. En Bachillerato el filtro es el curso real (acumulativo).
  const esoFull = level !== 'bachillerato';
  const filterIdx = esoFull ? courseIndex('eso', 4) : realIdx;
  return SIMS
    .filter((s) => {
      const sIdx = courseIndex(s.curso.level, s.curso.grade);
      if (sIdx <= filterIdx) return true;
      if (s.ampliacionEn && courseIndex(s.ampliacionEn.level, s.ampliacionEn.grade) <= filterIdx) return true;
      return false;
    })
    .map((s) => {
      const sIdx = courseIndex(s.curso.level, s.curso.grade);
      return {
        sim: s,
        esNueva: sIdx === realIdx, // "Nuevo en este curso" = sim nativa del curso real
        // En ESO no marcamos "Ampliación" a las sims de otros cursos de ESO: se
        // etiquetan con su curso nativo. En Bachillerato sí (curso superior).
        comoAmpliacion: !!s.esAmpliacion || (!esoFull && sIdx > realIdx),
      };
    });
}

export function simPorId(id) {
  return SIMS.find((s) => s.id === id) || null;
}
