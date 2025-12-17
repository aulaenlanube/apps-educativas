// src/apps/config/esoApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta

// Importar apps comunes
import {
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner, 
  appVisualizador3D, appLluviaDePalabras, appParejas, appClasificador, appSnake
} from './commonApps';

export const esoSubjects = materiasData.eso;

export const esoApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake]
  },
  '2': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake]
  },
  '3': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake]
  },
  '4': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'latin': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'economia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],    
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],   
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake
    ],
    'programacion': [appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake]
  }
};