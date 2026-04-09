// src/apps/config/bachilleratoApps.js
import materiasData from '../../../public/data/materias.json';

import {
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appJuegoMemoria, appBuscaElIntruso, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appOrdenaBolas, appRunner,
  appVisualizador3D, appLluviaDePalabras, appParejas, appClasificador, appSnake, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appMesaCrafteo, appEntrenadorTabla,
  appLaboratorioFunciones2D, appTerminalRetro, appProgramacionBloques, appBancoRecursosTutoria,
  appFraccionesESO, appSistemaSolar, appCelulaAnimal, appCelulaVegetal
} from './commonApps';

export const bachilleratoSubjects = materiasData.bachillerato;

// Apps base comunes a la mayoría de asignaturas de bachillerato
const appsBase = [
  appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva,
  appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma,
  appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
  appClasificador, appSnake, appComprensionEscrita, appComprensionOral
];

const appsIdioma = [...appsBase.slice(0, appsBase.indexOf(appParejas) + 1), appDetectiveDePalabras, ...appsBase.slice(appsBase.indexOf(appLluviaDePalabras))];

const appsCiencias = [
  appMesaCrafteo, appEntrenadorTabla, ...appsBase
];

const appsBiologia = [
  appCelulaAnimal, appCelulaVegetal, appSistemaSolar, ...appsBase
];

const appsMatematicas = [
  appFraccionesESO, appLaboratorioFunciones2D, appVisualizador3D, appOrdenaBolas, ...appsBase
];

const appsTutoria = [
  appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, ...appsBase
];

const appsProgramacion = [appTerminalRetro, appProgramacionBloques, ...appsBase];

export const bachilleratoApps = {
  '1': {
    'lengua':               [...appsBase],
    'matematicas':          [...appsMatematicas],
    'filosofia':            [...appsBase],
    'historia-mundo':       [...appsBase],
    'biologia':             [...appsBiologia],
    'fisica':               [...appsCiencias],
    'dibujo-tecnico':       [...appsBase],
    'economia':             [...appsBase],
    'latin':                [...appsBase],
    'literatura-universal': [...appsBase],
    'tecnologia':           [...appsBase],
    'ed-fisica':            [...appsBase],
    'ingles':               [...appsIdioma],
    'valenciano':           [...appsIdioma],
    'frances':              [...appsIdioma],
    'tutoria':              [...appsTutoria],
    'programacion':         [...appsProgramacion],
  },
  '2': {
    'lengua':               [...appsBase],
    'matematicas':          [...appsMatematicas],
    'historia-espana':      [...appsBase],
    'filosofia':            [...appsBase],
    'biologia':             [...appsBiologia],
    'fisica':               [...appsCiencias],
    'quimica':              [...appsCiencias],
    'dibujo-tecnico':       [...appsBase],
    'economia-empresa':     [...appsBase],
    'latin':                [...appsBase],
    'geografia':            [...appsBase],
    'arte':                 [...appsBase],
    'tecnologia':           [...appsBase],
    'ingles':               [...appsIdioma],
    'valenciano':           [...appsIdioma],
    'frances':              [...appsIdioma],
    'tutoria':              [...appsTutoria],
    'programacion':         [...appsProgramacion],
  }
};
