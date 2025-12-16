// src/apps/config/esoApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta

// Importar apps comunes
import {
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner, 
  appVisualizador3D, appLluviaDePalabras, appParejas, appClasificador
} from './commonApps';

export const esoSubjects = materiasData.eso;

export const esoApps = {
  '1': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ]
  },
  '2': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ]
  },
  '3': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ]
  },
  '4': {
    'lengua': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'matematicas': [
      appBuscaElIntruso, appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'historia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'ed-fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'biologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'fisica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'latin': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'economia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tecnologia': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],    
    'musica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],   
    'plastica': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso, appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador
    ]
  }
};