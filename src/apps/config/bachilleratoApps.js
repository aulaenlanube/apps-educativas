// src/apps/config/bachilleratoApps.js
import materiasData from '../../../public/data/materias.json';

import {
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appJuegoMemoria, appBuscaElIntruso, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLaFortaleza, appOrdenaBolas, appRunner, appNavePalabras,
  appVisualizador3D, appLluviaDePalabras, appParejas, appClasificador, appSnake, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appMesaCrafteo, appEntrenadorTabla, appLaboratorioFisica,
  appLaboratorioFunciones2D, appTerminalRetro, appProgramacionBloques, appBancoRecursosTutoria,
  appFraccionesESO, appSistemaSolar, appCelulaAnimal, appCelulaVegetal,
  appInfografiasInteractivas, appCazapalabras3D
} from './commonApps';

export const bachilleratoSubjects = materiasData.bachillerato;

// Apps base comunes a la mayoría de asignaturas de bachillerato
const appsBase = [
  appCazapalabras3D,
  appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva,
  appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLaFortaleza,
  appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
  appClasificador, appSnake, appComprensionEscrita, appComprensionOral
];

const appsIdioma = [...appsBase.slice(0, appsBase.indexOf(appParejas) + 1), appDetectiveDePalabras, ...appsBase.slice(appsBase.indexOf(appLluviaDePalabras))];

const appsCiencias = [
  appInfografiasInteractivas, appLaboratorioFisica, appMesaCrafteo, appEntrenadorTabla, ...appsBase
];

const appsBiologia = [
  appInfografiasInteractivas, appCelulaAnimal, appCelulaVegetal, appSistemaSolar, ...appsBase
];

const appsMatematicas = [
  appInfografiasInteractivas, appFraccionesESO, appLaboratorioFunciones2D, appVisualizador3D, appOrdenaBolas, ...appsBase
];

const appsTutoria = [
  appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, ...appsBase
];

const appsProgramacion = [appInfografiasInteractivas, appProgramacionBloques, appTerminalRetro, ...appsBase];

const appsTecnologia = [appInfografiasInteractivas, ...appsBase];

const appsQuimica = [appInfografiasInteractivas, appMesaCrafteo, appEntrenadorTabla, ...appsBase];

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
    'tecnologia':           [...appsTecnologia],
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
    'quimica':              [...appsQuimica],
    'dibujo-tecnico':       [...appsBase],
    'economia-empresa':     [...appsBase],
    'latin':                [...appsBase],
    'geografia':            [...appsBase],
    'arte':                 [...appsBase],
    'tecnologia':           [...appsTecnologia],
    'ingles':               [...appsIdioma],
    'valenciano':           [...appsIdioma],
    'frances':              [...appsIdioma],
    'tutoria':              [...appsTutoria],
    'programacion':         [...appsProgramacion],
  }
};
