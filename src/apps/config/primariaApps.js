// src/apps/config/primariaApps.js
import materiasData from '../../../public/data/materias.json';

// Importar apps comunes
import {
    appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
    appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner,
    appNumerosRomanos3, appNumerosRomanos4, appNumerosRomanosAdvanced,
    appMayorMenor1, appMayorMenor2, appMayorMenor3, appMayorMenor4, appMayorMenor5, appMayorMenor6,
    appMedidas1, appMedidas2, appMedidas3, appMedidas4, appMedidas5, appMedidas6, appLluviaDePalabras, appParejas, appClasificador
} from './commonApps';

// Importaciones específicas de Primaria
import SupermercadoMatematico1 from '../supermercado-matematico/primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '../supermercado-matematico/primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '../supermercado-matematico/primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '../supermercado-matematico/primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '../supermercado-matematico/primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '../supermercado-matematico/primaria-6/SupermercadoMatematico6';

// Apps de Matemáticas específicas (Rutas absolutas o alias)
import SumasPrimaria1 from '@/apps/sumas/primaria-1/SumasPrimaria1';
import SumasPrimaria2 from '@/apps/sumas/primaria-2/SumasPrimaria2';
import SumasPrimaria3 from '/src/apps/sumas/primaria-3/SumasPrimaria3';
import SumasPrimaria4 from '/src/apps/sumas/primaria-4/SumasPrimaria4';
import SumasPrimaria5 from '/src/apps/sumas/primaria-5/SumasPrimaria5';
import SumasPrimaria6 from '/src/apps/sumas/primaria-6/SumasPrimaria6';

import RestasPrimaria1 from '../restas/primaria-1/RestasPrimaria1';
import RestasPrimaria2 from '../restas/primaria-2/RestasPrimaria2';
import RestasPrimaria3 from '../restas/primaria-3/RestasPrimaria3';
import RestasPrimaria4 from '../restas/primaria-4/RestasPrimaria4';
import RestasPrimaria5 from '../restas/primaria-5/RestasPrimaria5';
import RestasPrimaria6 from '../restas/primaria-6/RestasPrimaria6';

import MultiplicacionesPrimaria3 from '../multiplicaciones/primaria-3/MultiplicacionesPrimaria3';
import MultiplicacionesPrimaria4 from '../multiplicaciones/primaria-4/MultiplicacionesPrimaria4';
import MultiplicacionesPrimaria5 from '../multiplicaciones/primaria-5/MultiplicacionesPrimaria5';
import MultiplicacionesPrimaria6 from '../multiplicaciones/primaria-6/MultiplicacionesPrimaria6';

import DivisionesPrimaria4 from '../divisiones/primaria-4/DivisionesPrimaria4';
import DivisionesPrimaria5 from '../divisiones/primaria-5/DivisionesPrimaria5';
import DivisionesPrimaria6 from '../divisiones/primaria-6/DivisionesPrimaria6';

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
      { id: 'sumas-primaria-1', name: 'Sumas sin llevadas', description: 'Aprende a sumar números de dos cifras.', component: SumasPrimaria1 },
      { id: 'restas-primaria-1', name: 'Restas sin llevadas', description: 'Restas de 2 cifras sin llevadas', component: RestasPrimaria1 },
      { id: 'supermercado-matematico-1', name: 'Supermercado Matemático', description: 'Resuelve sumas sencillas.', component: SupermercadoMatematico1 },
      appBuscaElIntruso,
      appRunner, appOrdenaBolas, appRosco, appMedidas1, appMayorMenor1, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-sociales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appRunner, appRosco, appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso,
      appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ]
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
      { id: 'sumas-primaria-2-drag', name: 'Sumas con llevadas', description: 'Resuelve sumas de dos cifras.', component: SumasPrimaria2 },
      { id: 'restas-primaria-2', name: 'Restas con llevadas', description: 'Restas de 2 cifras con llevadas', component: RestasPrimaria2 },
      { id: 'supermercado-matematico-2', name: 'Supermercado Matemático', description: 'Suma precios con llevadas.', component: SupermercadoMatematico2 },
      appBuscaElIntruso,
      appRunner, appOrdenaBolas, appRosco, appMedidas2, appMayorMenor2, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-sociales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ]
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
      { id: 'sumas-primaria-3-drag', name: 'Sumas con llevadas', description: 'Sumas de 3 y 4 cifras.', component: SumasPrimaria3 },
      { id: 'restas-primaria-3', name: 'Restas con llevadas', description: 'Restas de 3 y 4 cifras.', component: RestasPrimaria3 },
      { id: 'multiplicaciones-primaria-3', name: 'Multiplicaciones', description: 'Multiplicador de 1 cifra.', component: MultiplicacionesPrimaria3 },
      { id: 'supermercado-matematico-3', name: 'Supermercado Matemático', description: 'Multiplicaciones.', component: SupermercadoMatematico3 },
      appRunner, appOrdenaBolas, appRosco, appMedidas3, appMayorMenor3, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-sociales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ]
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
      { id: 'sumas-primaria-4-drag', name: 'Sumas triples', description: 'Sumas complejas.', component: SumasPrimaria4 },
      { id: 'restas-primaria-4', name: 'Restas con decimal', description: 'Introducción a decimales.', component: RestasPrimaria4 },
      { id: 'multiplicaciones-primaria-4', name: 'Multiplicaciones', description: 'Varias cifras.', component: MultiplicacionesPrimaria4 },
      { id: 'divisiones-primaria-4', name: 'Divisiones', description: 'Iniciación a la división.', component: DivisionesPrimaria4 },
      { id: 'supermercado-matematico-4', name: 'Supermercado Matemático', description: 'Decimales.', component: SupermercadoMatematico4 },
      appRunner, appOrdenaBolas, appRosco, appMedidas4, appMayorMenor4, appNumerosRomanos4, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-sociales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ]
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
      { id: 'sumas-primaria-5-drag', name: 'Sumas con decimales', description: 'Sumas con decimales.', component: SumasPrimaria5 },
      { id: 'restas-primaria-5', name: 'Restas con decimales', description: 'Restas complejas.', component: RestasPrimaria5 },
      { id: 'multiplicaciones-primaria-5', name: 'Multiplicaciones', description: 'Varios dígitos.', component: MultiplicacionesPrimaria5 },
      { id: 'supermercado-matematico-5', name: 'Supermercado Matemático', description: 'Calcula el cambio.', component: SupermercadoMatematico5 },
      { id: 'divisiones-primaria-5', name: 'Divisiones', description: 'Divisores de 2 y 3 cifras.', component: DivisionesPrimaria5 },
      appRunner, appOrdenaBolas, appRosco, appMedidas5, appMayorMenor5, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-sociales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ]
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
      { id: 'sumas-primaria-6-drag', name: 'Sumas triples con Decimales', description: 'Sumas avanzadas.', component: SumasPrimaria6 },
      { id: 'restas-primaria-6', name: 'Restas a completar', description: 'Completa la resta.', component: RestasPrimaria6 },
      { id: 'multiplicaciones-primaria-6', name: 'Multiplicaciones', description: 'Con decimales.', component: MultiplicacionesPrimaria6 },
      { id: 'divisiones-primaria-6', name: 'Divisiones', description: 'Con decimales.', component: DivisionesPrimaria6 },
      { id: 'supermercado-matematico-6', name: 'Supermercado Matemático', description: 'Descuentos.', component: SupermercadoMatematico6 },
      appRunner, appOrdenaBolas, appRosco, appMedidas6, appMayorMenor6, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-naturales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      { ...appParejas, id: 'parejas-naturales-6', name: 'Parejas de Cartas' },
      appLluviaDePalabras,
      appClasificador
    ],
    'ciencias-sociales': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'ingles': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'valenciano': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ],
    'frances': [
      appBuscaElIntruso,
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      appDetectiveDePalabras,
      appParejas,
      appLluviaDePalabras,
      appClasificador
    ]
  }
};