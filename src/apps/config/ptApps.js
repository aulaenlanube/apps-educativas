// src/apps/config/ptApps.js — Pedagogía Terapéutica
import materiasData from '../../../public/data/materias.json';

import {
  appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas,
  appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo,
  appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appBuscaElIntruso, appRosco, appRunner, appLluviaDePalabras, appParejas,
  appClasificador, appSnake, appJuegoMemoria, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appIslaDeLaCalma, appBancoRecursosTutoria, appGeneradorPersonajes
} from './commonApps';

export const ptSubjects = materiasData.pt;

export const ptApps = {
  '1': {
    'tutoria':               [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes],
    'atencion':              [appVelocidadRespuesta, appSopaDeLetras, appLluviaDePalabras, appSnake, appRunner, appExcavacionSelectiva, appAnagramas, appJuegoMemoria, appParejas, appDetectiveDePalabras, appCriptograma],
    'memoria':               [appJuegoMemoria, appParejas, appConectaParejas, appCriptograma, appSopaDeLetras, appAnagramas, appRosco, appCrucigrama, appVelocidadRespuesta],
    'funciones-ejecutivas':  [appTorrePalabras, appClasificador, appOrdenaLaFrase, appOrdenaLaHistoria, appCriptograma, appAnagramas, appCrucigrama, appDetectiveDePalabras, appSnake, appRunner],
    'habilidades-sociales':  [appComprensionEscrita, appComprensionOral, appOrdenaLaHistoria, appIslaDeLaCalma, appConectaParejas, appMillonario, appBuscaElIntruso, appOrdenaLaFrase],
    'razonamiento':          [appBuscaElIntruso, appClasificador, appMillonario, appTorrePalabras, appCriptograma, appAnagramas, appConectaParejas, appOrdenaLaHistoria, appCrucigrama],
    'autonomia':             [appIslaDeLaCalma, appOrdenaLaHistoria, appOrdenaLaFrase, appClasificador, appTorrePalabras, appComprensionEscrita, appMillonario],
    'lectoescritura-adaptada': [appDictadoInteractivo, appAhorcado, appAnagramas, appSopaDeLetras, appCrucigrama, appDetectiveDePalabras, appOrdenaLaFrase, appLluviaDePalabras, appCriptograma, appVelocidadRespuesta, appRosco],
  }
};
