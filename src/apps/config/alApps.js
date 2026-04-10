// src/apps/config/alApps.js — Audición y Lenguaje
import materiasData from '../../../public/data/materias.json';

import {
  appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas,
  appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo,
  appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appBuscaElIntruso, appRosco, appRunner, appLluviaDePalabras, appParejas,
  appClasificador, appSnake, appJuegoMemoria, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes
} from './commonApps';

export const alSubjects = materiasData.al;

// Apps base para AL — priorizamos apps de palabras y lenguaje
const appsLenguajeBase = [
  appAhorcado, appAnagramas, appCrucigrama, appSopaDeLetras, appDictadoInteractivo,
  appConectaParejas, appVelocidadRespuesta, appCriptograma, appMillonario,
  appRosco, appOrdenaLaFrase, appDetectiveDePalabras, appLluviaDePalabras,
  appTorrePalabras, appBuscaElIntruso, appRunner, appClasificador, appSnake,
  appJuegoMemoria, appExcavacionSelectiva
];

export const alApps = {
  '1': {
    'tutoria':             [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes],
    'articulacion':        [appAhorcado, appAnagramas, appSopaDeLetras, appDictadoInteractivo, appVelocidadRespuesta, appLluviaDePalabras, appRosco, appCrucigrama, appJuegoMemoria],
    'vocabulario':         [appConectaParejas, appSopaDeLetras, appCrucigrama, appAhorcado, appAnagramas, appBuscaElIntruso, appClasificador, appTorrePalabras, appRosco, appMillonario, appLluviaDePalabras, appSnake, appRunner, appExcavacionSelectiva],
    'morfosintaxis':       [appOrdenaLaFrase, appDetectiveDePalabras, appDictadoInteractivo, appCriptograma, appAhorcado, appAnagramas, appConectaParejas, appMillonario, appRosco],
    'pragmatica':          [appComprensionEscrita, appComprensionOral, appOrdenaLaHistoria, appOrdenaLaFrase, appConectaParejas, appMillonario, appBuscaElIntruso, appDetectiveDePalabras],
    'conciencia-fonologica': [appAnagramas, appAhorcado, appSopaDeLetras, appDictadoInteractivo, appLluviaDePalabras, appVelocidadRespuesta, appRosco, appCrucigrama],
    'comprension-oral':    [appComprensionOral, appComprensionEscrita, appOrdenaLaHistoria, appMillonario, appConectaParejas, appBuscaElIntruso, appOrdenaLaFrase],
    'lectoescritura':      [appDictadoInteractivo, appCriptograma, appAhorcado, appAnagramas, appSopaDeLetras, appCrucigrama, appDetectiveDePalabras, appOrdenaLaFrase, appLluviaDePalabras, appVelocidadRespuesta, appRosco],
  }
};
