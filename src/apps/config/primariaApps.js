// src/apps/config/primariaApps.js
import materiasData from '../../../public/data/materias.json';

// Importar TODAS las apps comunes (incluidas las nuevas de matemáticas)
import {
  // Generales
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appBuscaElIntruso, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaBolas, appRunner, appNavePalabras,
  appLluviaDePalabras, appParejas, appClasificador, appSnake, appComprensionEscrita, appComprensionOral,

  // Matemáticas Generales
  appNumerosRomanos3, appNumerosRomanos4, appNumerosRomanos5, appNumerosRomanos6,
  appMayorMenor1, appMayorMenor2, appMayorMenor3, appMayorMenor4, appMayorMenor5, appMayorMenor6,
  appOrdenaNumeros1, appOrdenaNumeros2, appOrdenaNumeros3, appOrdenaNumeros4, appOrdenaNumeros5, appOrdenaNumeros6,
  appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar,

  // Matemáticas Específicas Primaria
  appSumasPrimaria1, appSumasPrimaria2, appSumasPrimaria3, appSumasPrimaria4, appSumasPrimaria5, appSumasPrimaria6,
  appRestasPrimaria1, appRestasPrimaria2, appRestasPrimaria3, appRestasPrimaria4, appRestasPrimaria5, appRestasPrimaria6,
  appMultiplicacionesPrimaria3, appMultiplicacionesPrimaria4, appMultiplicacionesPrimaria5, appMultiplicacionesPrimaria6,
  appDivisionesPrimaria4, appDivisionesPrimaria5, appDivisionesPrimaria6,
  appSupermercadoMatematico1, appSupermercadoMatematico2, appSupermercadoMatematico3, appSupermercadoMatematico4, appSupermercadoMatematico5, appSupermercadoMatematico6,
  appExcavacionSelectiva,
  appBancoRecursosTutoria,
  appRotacionesGrid,
  appReglaDeTres,
  appPorcentajes,
  appSistemaSolar,
  appJuegoMemoria,
  appProgramacionBloques

} from './commonApps';

export const primariaSubjects = materiasData.primaria;

export const primariaApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador,
      appSnake,
      appComprensionEscrita,
      appComprensionOral
    ],
    'matematicas': [
      appSumasPrimaria1,
      appRestasPrimaria1,
      appSupermercadoMatematico1,
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar, appMayorMenor1, appOrdenaNumeros1, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador,
      appSnake,
      appComprensionEscrita,
      appComprensionOral
    ],
    'ciencias-naturales': [appSistemaSolar, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appBancoRecursosTutoria, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appProgramacionBloques, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '2': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador,
      appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appSumasPrimaria2,
      appRestasPrimaria2,
      appSupermercadoMatematico2,
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar, appMayorMenor2, appOrdenaNumeros2, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador,
      appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appSistemaSolar, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appProgramacionBloques, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '3': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appBuscaElIntruso,
      appSumasPrimaria3,
      appRestasPrimaria3,
      appMultiplicacionesPrimaria3,
      appSupermercadoMatematico3,
      appRunner, appNavePalabras, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar, appMayorMenor3, appOrdenaNumeros3, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appSistemaSolar, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appProgramacionBloques, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '4': {
    'lengua': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appSumasPrimaria4,
      appRestasPrimaria4,
      appMultiplicacionesPrimaria4,
      appDivisionesPrimaria4,
      appSupermercadoMatematico4,
      appRotacionesGrid,
      appRunner, appNavePalabras, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar, appMayorMenor4, appOrdenaNumeros4, appNumerosRomanos4, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appJuegoMemoria, appSistemaSolar, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appJuegoMemoria, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appProgramacionBloques, appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '5': {
    'lengua': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appSumasPrimaria5,
      appRestasPrimaria5,
      appMultiplicacionesPrimaria5,
      appSupermercadoMatematico5,
      appDivisionesPrimaria5,
      appReglaDeTres,
      appPorcentajes,
      appRotacionesGrid,
      appRunner, appNavePalabras, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar, appMayorMenor5, appOrdenaNumeros5, appNumerosRomanos5, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appJuegoMemoria, appSistemaSolar, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appJuegoMemoria, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appProgramacionBloques, appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '6': {
    'lengua': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appSumasPrimaria6,
      appRestasPrimaria6,
      appMultiplicacionesPrimaria6,
      appDivisionesPrimaria6,
      appSupermercadoMatematico6,
      appReglaDeTres,
      appPorcentajes,
      appRotacionesGrid,
      appRunner, appNavePalabras, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appLongitudComparar, appLongitudOrdenar, appMasaComparar, appMasaOrdenar, appCapacidadComparar, appCapacidadOrdenar, appMayorMenor6, appOrdenaNumeros6, appNumerosRomanos6, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appJuegoMemoria, appSistemaSolar, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appJuegoMemoria, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appProgramacionBloques, appJuegoMemoria, appBuscaElIntruso, appRunner, appNavePalabras, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
};