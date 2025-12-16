// src/apps/config/esoApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta

// Importar apps comunes
import {
    appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
    appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner, 
    appVisualizador3D, appLluviaDePalabras, appParejas
} from './commonApps';

export const esoSubjects = materiasData.eso;

export const esoApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ]
  },
  '2': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ]
  },
  '3': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ]
  },
  '4': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'latin': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'economia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],    
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],   
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras
    ]
  }
};