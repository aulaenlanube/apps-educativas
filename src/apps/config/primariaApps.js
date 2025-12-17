// src/apps/config/primariaApps.js
import materiasData from '../../../public/data/materias.json';

// Importar TODAS las apps comunes (incluidas las nuevas de matemáticas)
import {
    // Generales
    appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
    appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner,
    appLluviaDePalabras, appParejas, appClasificador,
    
    // Matemáticas Generales
    appNumerosRomanos3, appNumerosRomanos4, appNumerosRomanosAdvanced,
    appMayorMenor1, appMayorMenor2, appMayorMenor3, appMayorMenor4, appMayorMenor5, appMayorMenor6,
    appMedidas1, appMedidas2, appMedidas3, appMedidas4, appMedidas5, appMedidas6,

    // Matemáticas Específicas Primaria
    appSumasPrimaria1, appSumasPrimaria2, appSumasPrimaria3, appSumasPrimaria4, appSumasPrimaria5, appSumasPrimaria6,
    appRestasPrimaria1, appRestasPrimaria2, appRestasPrimaria3, appRestasPrimaria4, appRestasPrimaria5, appRestasPrimaria6,
    appMultiplicacionesPrimaria3, appMultiplicacionesPrimaria4, appMultiplicacionesPrimaria5, appMultiplicacionesPrimaria6,
    appDivisionesPrimaria4, appDivisionesPrimaria5, appDivisionesPrimaria6,
    appSupermercadoMatematico1, appSupermercadoMatematico2, appSupermercadoMatematico3, appSupermercadoMatematico4, appSupermercadoMatematico5, appSupermercadoMatematico6

} from './commonApps';

export const primariaSubjects = materiasData.primaria;

export const primariaApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appSumasPrimaria1,
      appRestasPrimaria1,
      appSupermercadoMatematico1,
      appBuscaElIntruso,
      appRunner, appOrdenaBolas, appRosco, appMedidas1, appMayorMenor1, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ingles': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'tutoria': [appRunner, appRosco, appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'valenciano': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'frances': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador]
  },
  '2': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appSumasPrimaria2,
      appRestasPrimaria2,
      appSupermercadoMatematico2,
      appBuscaElIntruso,
      appRunner, appOrdenaBolas, appRosco, appMedidas2, appMayorMenor2, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ingles': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'tutoria': [appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'valenciano': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'frances': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador]
  },
  '3': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso,
      appSumasPrimaria3,
      appRestasPrimaria3,
      appMultiplicacionesPrimaria3,
      appSupermercadoMatematico3,
      appRunner, appOrdenaBolas, appRosco, appMedidas3, appMayorMenor3, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ingles': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'tutoria': [appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'valenciano': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'frances': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador]
  },
  '4': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso,
      appSumasPrimaria4,
      appRestasPrimaria4,
      appMultiplicacionesPrimaria4,
      appDivisionesPrimaria4,
      appSupermercadoMatematico4,
      appRunner, appOrdenaBolas, appRosco, appMedidas4, appMayorMenor4, appNumerosRomanos4, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ingles': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'tutoria': [appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'valenciano': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'frances': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador]
  },
  '5': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso,
      appSumasPrimaria5,
      appRestasPrimaria5,
      appMultiplicacionesPrimaria5,
      appSupermercadoMatematico5,
      appDivisionesPrimaria5,
      appRunner, appOrdenaBolas, appRosco, appMedidas5, appMayorMenor5, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ingles': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'tutoria': [appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'valenciano': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'frances': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador]
  },
  '6': {
    'lengua': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso,
      appSumasPrimaria6,
      appRestasPrimaria6,
      appMultiplicacionesPrimaria6,
      appDivisionesPrimaria6,
      appSupermercadoMatematico6,
      appRunner, appOrdenaBolas, appRosco, appMedidas6, appMayorMenor6, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ciencias-sociales': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'ingles': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'tutoria': [appIslaDeLaCalma, appGeneradorPersonajes, appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'valenciano': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'frances': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras, appParejas, appLluviaDePalabras, appClasificador]
  }
};