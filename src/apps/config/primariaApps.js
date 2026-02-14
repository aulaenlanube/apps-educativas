// src/apps/config/primariaApps.js
import materiasData from '../../../public/data/materias.json';

// Importar TODAS las apps comunes (incluidas las nuevas de matemáticas)
import {
  // Generales
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner,
  appLluviaDePalabras, appParejas, appClasificador, appSnake, appComprensionEscrita, appComprensionOral,

  // Matemáticas Generales
  appNumerosRomanos3, appNumerosRomanos4, appNumerosRomanos5, appNumerosRomanos6,
  appMayorMenor1, appMayorMenor2, appMayorMenor3, appMayorMenor4, appMayorMenor5, appMayorMenor6,
  appMedidas1, appMedidas2, appMedidas3, appMedidas4, appMedidas5, appMedidas6,

  // Matemáticas Específicas Primaria
  appSumasPrimaria1, appSumasPrimaria2, appSumasPrimaria3, appSumasPrimaria4, appSumasPrimaria5, appSumasPrimaria6,
  appRestasPrimaria1, appRestasPrimaria2, appRestasPrimaria3, appRestasPrimaria4, appRestasPrimaria5, appRestasPrimaria6,
  appMultiplicacionesPrimaria3, appMultiplicacionesPrimaria4, appMultiplicacionesPrimaria5, appMultiplicacionesPrimaria6,
  appDivisionesPrimaria4, appDivisionesPrimaria5, appDivisionesPrimaria6,
  appSupermercadoMatematico1, appSupermercadoMatematico2, appSupermercadoMatematico3, appSupermercadoMatematico4, appSupermercadoMatematico5, appSupermercadoMatematico6,
  appExcavacionSelectiva,
  appBancoRecursosTutoria,
  appRotacionesGrid,
  appSistemaSolar,
  appJuegoMemoria

} from './commonApps';

export const primariaSubjects = materiasData.primaria;

export const primariaApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
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
      appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appMedidas1, appMayorMenor1, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador,
      appSnake,
      appComprensionEscrita,
      appComprensionOral
    ],
    'ciencias-naturales': [appSistemaSolar, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appBancoRecursosTutoria, appRunner, appExcavacionSelectiva, appRosco, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '2': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
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
      appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appMedidas2, appMayorMenor2, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador,
      appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appSistemaSolar, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '3': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
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
      appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appMedidas3, appMayorMenor3, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appSistemaSolar, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '4': {
    'lengua': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
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
      appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appMedidas4, appMayorMenor4, appNumerosRomanos4, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appJuegoMemoria, appSistemaSolar, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appJuegoMemoria, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '5': {
    'lengua': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
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
      appRotacionesGrid,
      appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appMedidas5, appMayorMenor5, appNumerosRomanos5, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appJuegoMemoria, appSistemaSolar, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appJuegoMemoria, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
  '6': {
    'lengua': [
      appJuegoMemoria,
      appBuscaElIntruso,
      appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
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
      appRotacionesGrid,
      appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appMedidas6, appMayorMenor6, appNumerosRomanos6, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ciencias-naturales': [appJuegoMemoria, appSistemaSolar, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ciencias-sociales': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ingles': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'tutoria': [appJuegoMemoria, appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'valenciano': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'frances': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'programacion': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],

  },
};