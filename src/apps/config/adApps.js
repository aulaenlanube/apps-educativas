// src/apps/config/adApps.js — Atención a la Diversidad (AL + PT unificado)
import materiasData from '../../../public/data/materias.json';

import {
  appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas,
  appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo,
  appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appBuscaElIntruso, appRosco, appRunner, appNavePalabras, appLluviaDePalabras, appParejas,
  appClasificador, appSnake, appJuegoMemoria, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appIslaDeLaCalma, appBancoRecursosTutoria, appGeneradorPersonajes
} from './commonApps';

export const adSubjects = materiasData.ad;

export const adApps = {
  '1': {
    // Tutoría (compartido)
    'tutoria':               [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes],
    // Audición y Lenguaje
    'articulacion':          [appAhorcado, appAnagramas, appSopaDeLetras, appDictadoInteractivo, appVelocidadRespuesta, appLluviaDePalabras, appRosco, appCrucigrama, appJuegoMemoria],
    'vocabulario':           [appConectaParejas, appSopaDeLetras, appCrucigrama, appAhorcado, appAnagramas, appBuscaElIntruso, appClasificador, appTorrePalabras, appRosco, appMillonario, appLluviaDePalabras, appSnake, appRunner, appNavePalabras, appExcavacionSelectiva],
    'morfosintaxis':         [appOrdenaLaFrase, appDetectiveDePalabras, appDictadoInteractivo, appCriptograma, appAhorcado, appAnagramas, appConectaParejas, appMillonario, appRosco],
    'pragmatica':            [appComprensionEscrita, appComprensionOral, appOrdenaLaHistoria, appOrdenaLaFrase, appConectaParejas, appMillonario, appBuscaElIntruso, appDetectiveDePalabras],
    'conciencia-fonologica': [appAnagramas, appAhorcado, appSopaDeLetras, appDictadoInteractivo, appLluviaDePalabras, appVelocidadRespuesta, appRosco, appCrucigrama],
    'comprension-oral':      [appComprensionOral, appComprensionEscrita, appOrdenaLaHistoria, appMillonario, appConectaParejas, appBuscaElIntruso, appOrdenaLaFrase],
    'lectoescritura':        [appDictadoInteractivo, appCriptograma, appAhorcado, appAnagramas, appSopaDeLetras, appCrucigrama, appDetectiveDePalabras, appOrdenaLaFrase, appLluviaDePalabras, appVelocidadRespuesta, appRosco],
    // Pedagogía Terapéutica
    'atencion':              [appVelocidadRespuesta, appSopaDeLetras, appLluviaDePalabras, appSnake, appRunner, appNavePalabras, appExcavacionSelectiva, appAnagramas, appJuegoMemoria, appParejas, appDetectiveDePalabras, appCriptograma],
    'memoria':               [appJuegoMemoria, appParejas, appConectaParejas, appCriptograma, appSopaDeLetras, appAnagramas, appRosco, appCrucigrama, appVelocidadRespuesta],
    'funciones-ejecutivas':  [appTorrePalabras, appClasificador, appOrdenaLaFrase, appOrdenaLaHistoria, appCriptograma, appAnagramas, appCrucigrama, appDetectiveDePalabras, appSnake, appRunner],
    'habilidades-sociales':  [appComprensionEscrita, appComprensionOral, appOrdenaLaHistoria, appIslaDeLaCalma, appConectaParejas, appMillonario, appBuscaElIntruso, appOrdenaLaFrase],
    'razonamiento':          [appBuscaElIntruso, appClasificador, appMillonario, appTorrePalabras, appCriptograma, appAnagramas, appConectaParejas, appOrdenaLaHistoria, appCrucigrama],
    'autonomia':             [appIslaDeLaCalma, appOrdenaLaHistoria, appOrdenaLaFrase, appClasificador, appTorrePalabras, appComprensionEscrita, appMillonario],
    'lectoescritura-adaptada': [appDictadoInteractivo, appAhorcado, appAnagramas, appSopaDeLetras, appCrucigrama, appDetectiveDePalabras, appOrdenaLaFrase, appLluviaDePalabras, appCriptograma, appVelocidadRespuesta, appRosco],
  }
};
