// src/apps/config/esoApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta

// Importar apps comunes
import {
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner,
  appVisualizador3D, appLluviaDePalabras, appParejas, appClasificador, appSnake, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appMesaCrafteo, appEntrenadorTabla, appNumerosRomanosESO
} from './commonApps';

export const esoSubjects = materiasData.eso;

export const esoApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appNumerosRomanosESO,
      appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]
  },
  '2': {
    'lengua': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appNumerosRomanosESO,
      appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake]
  },
  '3': {
    'lengua': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appNumerosRomanosESO,
      appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]
  },
  '4': {
    'lengua': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appNumerosRomanosESO,
      appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'latin': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'economia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]
  }
};