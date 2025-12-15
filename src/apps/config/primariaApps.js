// src/apps/config/primariaApps.js
import materiasData from '../../../public/data/materias.json';

// Importar apps comunes
import {
    appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
    appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner,
    appNumerosRomanos3, appNumerosRomanos4, appNumerosRomanosAdvanced,
    appMayorMenor1, appMayorMenor2, appMayorMenor3, appMayorMenor4, appMayorMenor5, appMayorMenor6,
    appMedidas1, appMedidas2, appMedidas3, appMedidas4, appMedidas5, appMedidas6
} from './commonApps';

// Importaciones específicas de Primaria
import SupermercadoMatematico1 from '../supermercado-matematico/primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '../supermercado-matematico/primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '../supermercado-matematico/primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '../supermercado-matematico/primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '../supermercado-matematico/primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '../supermercado-matematico/primaria-6/SupermercadoMatematico6';

// Nueva App: Parejas de Cartas
import ParejasDeCartas from '../parejas-de-cartas/ParejasDeCartas';

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

// Definición base de la app Parejas
const appParejas = {
  id: 'parejas',
  name: 'Parejas de Cartas',
  description: 'Entrena tu memoria visual encontrando las parejas.',
  component: ParejasDeCartas
};

export const primariaApps = {
  '1': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-1', name: 'Busca el Intruso', description: 'Encuentra la letra diferente.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-1', name: 'Parejas: Material Escolar' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-1', name: 'Sumas sin llevadas', description: 'Aprende a sumar números de dos cifras.', component: SumasPrimaria1 },
      { id: 'restas-primaria-1', name: 'Restas sin llevadas', description: 'Restas de 2 cifras sin llevadas', component: RestasPrimaria1 },
      { id: 'supermercado-matematico-1', name: 'Supermercado Matemático', description: 'Resuelve sumas sencillas.', component: SupermercadoMatematico1 },
      { id: 'busca-el-intruso-matematicas-1', name: 'Busca el Intruso', description: 'Encuentra el número diferente.', component: appBuscaElIntruso.component },
      appRunner, appOrdenaBolas, appRosco, appMedidas1, appMayorMenor1, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-1', name: 'Parejas: Números y Formas' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-1', name: 'Busca el Intruso', description: 'Encuentra el elemento diferente.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-naturales-1', name: 'Parejas: Seres Vivos' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-1', name: 'Busca el Intruso', description: 'Encuentra el elemento diferente.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-sociales-1', name: 'Parejas: Ciudad y Oficios' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-1', name: 'Find the Odd One', description: 'Find the different letter.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-1', name: 'Pairs: Toys & Food' }
    ],
    'tutoria': [
      appRunner, appRosco, appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-1', name: 'Busca el Intruso', description: 'Encuentra la emoción diferente.', component: appBuscaElIntruso.component },
      appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-1', name: 'Parejas: Emociones' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-1', name: "Busca l'Intrus", description: 'Troba la lletra diferent!', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-1', name: 'Parelles: Cultura' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-1', name: "Trouve l'Intrus", description: 'Trouve le symbole différent!', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-1', name: 'Paires: Symboles' }
    ]
  },
  '2': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-2', name: 'Busca el Intruso', description: 'Gramática y vocabulario.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-2', name: 'Parejas de Cartas' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-2-drag', name: 'Sumas con llevadas', description: 'Resuelve sumas de dos cifras.', component: SumasPrimaria2 },
      { id: 'restas-primaria-2', name: 'Restas con llevadas', description: 'Restas de 2 cifras con llevadas', component: RestasPrimaria2 },
      { id: 'supermercado-matematico-2', name: 'Supermercado Matemático', description: 'Suma precios con llevadas.', component: SupermercadoMatematico2 },
      { id: 'busca-el-intruso-matematicas-2', name: 'Busca el Intruso', description: 'Encuentra el intruso.', component: appBuscaElIntruso.component },
      appRunner, appOrdenaBolas, appRosco, appMedidas2, appMayorMenor2, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-2', name: 'Parejas de Cartas' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-2', name: 'Busca el Intruso', description: 'Animales y plantas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-naturales-2', name: 'Parejas de Cartas' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-2', name: 'Busca el Intruso', description: 'Sociedad y entorno.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-sociales-2', name: 'Parejas de Cartas' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-2', name: 'Find the Odd One', description: 'Vocabulary check.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-2', name: 'Memory Game' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-2', name: 'Busca el Intruso', description: 'Valores y hábitos.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-2', name: 'Parejas de Cartas' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-2', name: "Busca l'Intrus", description: "Vocabulari.", component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-2', name: 'Parelles de Cartes' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-2', name: "Trouve l'Intrus", description: 'Vocabulaire.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-2', name: 'Jeu de Paires' }
    ]
  },
  '3': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-3', name: 'Busca el Intruso', description: 'Categorías gramaticales.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-3', name: 'Parejas de Cartas' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-3', name: 'Busca el Intruso', description: 'Cálculo mental.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-3-drag', name: 'Sumas con llevadas', description: 'Sumas de 3 y 4 cifras.', component: SumasPrimaria3 },
      { id: 'restas-primaria-3', name: 'Restas con llevadas', description: 'Restas de 3 y 4 cifras.', component: RestasPrimaria3 },
      { id: 'multiplicaciones-primaria-3', name: 'Multiplicaciones', description: 'Multiplicador de 1 cifra.', component: MultiplicacionesPrimaria3 },
      { id: 'supermercado-matematico-3', name: 'Supermercado Matemático', description: 'Multiplicaciones.', component: SupermercadoMatematico3 },
      appRunner, appOrdenaBolas, appRosco, appMedidas3, appMayorMenor3, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-3', name: 'Parejas de Cartas' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-3', name: 'Busca el Intruso', description: 'Ecosistemas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-naturales-3', name: 'Parejas de Cartas' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-3', name: 'Busca el Intruso', description: 'Geografía y sociedad.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-sociales-3', name: 'Parejas de Cartas' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-3', name: 'Find the Odd One', description: 'Vocabulary & Grammar.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-3', name: 'Memory Game' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-3', name: 'Busca el Intruso', description: 'Convivencia.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-3', name: 'Parejas de Cartas' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-3', name: "Busca l'Intrus", description: 'Gramàtica.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-3', name: 'Parelles de Cartes' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-3', name: "Trouve l'Intrus", description: 'Vocabulaire et grammaire.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-3', name: 'Jeu de Paires' }
    ]
  },
  '4': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-4', name: 'Busca el Intruso', description: 'Morfología y semántica.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-4', name: 'Parejas de Cartas' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-4', name: 'Busca el Intruso', description: 'Operaciones y medidas.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-4-drag', name: 'Sumas triples', description: 'Sumas complejas.', component: SumasPrimaria4 },
      { id: 'restas-primaria-4', name: 'Restas con decimal', description: 'Introducción a decimales.', component: RestasPrimaria4 },
      { id: 'multiplicaciones-primaria-4', name: 'Multiplicaciones', description: 'Varias cifras.', component: MultiplicacionesPrimaria4 },
      { id: 'divisiones-primaria-4', name: 'Divisiones', description: 'Iniciación a la división.', component: DivisionesPrimaria4 },
      { id: 'supermercado-matematico-4', name: 'Supermercado Matemático', description: 'Decimales.', component: SupermercadoMatematico4 },
      appRunner, appOrdenaBolas, appRosco, appMedidas4, appMayorMenor4, appNumerosRomanos4, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-4', name: 'Parejas de Cartas' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-4', name: 'Busca el Intruso', description: 'Materia y energía.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-naturales-4', name: 'Parejas de Cartas' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-4', name: 'Busca el Intruso', description: 'Población y territorio.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-sociales-4', name: 'Parejas de Cartas' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-4', name: 'Find the Odd One', description: 'Intermediate challenge.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-4', name: 'Memory Game' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-4', name: 'Busca el Intruso', description: 'Resolución de conflictos.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-4', name: 'Parejas de Cartas' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-4', name: "Busca l'Intrus", description: 'Reforç.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-4', name: 'Parelles de Cartes' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-4', name: "Trouve l'Intrus", description: 'Exercices de vocabulaire.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-4', name: 'Jeu de Paires' }
    ]
  },
  '5': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-5', name: 'Busca el Intruso', description: 'Sintaxis y morfología.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-5', name: 'Parejas de Cartas' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-5', name: 'Busca el Intruso', description: 'Fracciones y decimales.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-5-drag', name: 'Sumas con decimales', description: 'Sumas con decimales.', component: SumasPrimaria5 },
      { id: 'restas-primaria-5', name: 'Restas con decimales', description: 'Restas complejas.', component: RestasPrimaria5 },
      { id: 'multiplicaciones-primaria-5', name: 'Multiplicaciones', description: 'Varios dígitos.', component: MultiplicacionesPrimaria5 },
      { id: 'supermercado-matematico-5', name: 'Supermercado Matemático', description: 'Calcula el cambio.', component: SupermercadoMatematico5 },
      { id: 'divisiones-primaria-5', name: 'Divisiones', description: 'Divisores de 2 y 3 cifras.', component: DivisionesPrimaria5 },
      appRunner, appOrdenaBolas, appRosco, appMedidas5, appMayorMenor5, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-5', name: 'Parejas de Cartas' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-5', name: 'Busca el Intruso', description: 'Cuerpo humano y células.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-naturales-5', name: 'Parejas de Cartas' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-5', name: 'Busca el Intruso', description: 'Universo y Edad Media.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-sociales-5', name: 'Parejas de Cartas' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-5', name: 'Find the Odd One', description: 'Advanced vocabulary.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-5', name: 'Memory Game' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-5', name: 'Busca el Intruso', description: 'Autoconocimiento.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-5', name: 'Parejas de Cartas' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-5', name: "Busca l'Intrus", description: 'Perfeccionament.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-5', name: 'Parelles de Cartes' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-5', name: "Trouve l'Intrus", description: 'Vocabulaire avancé.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-5', name: 'Jeu de Paires' }
    ]
  },
  '6': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-6', name: 'Busca el Intruso', description: 'Repaso general.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-6', name: 'Parejas de Cartas' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-6', name: 'Busca el Intruso', description: 'Lógica matemática.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-6-drag', name: 'Sumas triples con Decimales', description: 'Sumas avanzadas.', component: SumasPrimaria6 },
      { id: 'restas-primaria-6', name: 'Restas a completar', description: 'Completa la resta.', component: RestasPrimaria6 },
      { id: 'multiplicaciones-primaria-6', name: 'Multiplicaciones', description: 'Con decimales.', component: MultiplicacionesPrimaria6 },
      { id: 'divisiones-primaria-6', name: 'Divisiones', description: 'Con decimales.', component: DivisionesPrimaria6 },
      { id: 'supermercado-matematico-6', name: 'Supermercado Matemático', description: 'Descuentos.', component: SupermercadoMatematico6 },
      appRunner, appOrdenaBolas, appRosco, appMedidas6, appMayorMenor6, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-6', name: 'Parejas de Cartas' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-6', name: 'Busca el Intruso', description: 'Salud y energía.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-naturales-6', name: 'Parejas de Cartas' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-6', name: 'Busca el Intruso', description: 'Historia contemporánea.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-sociales-6', name: 'Parejas de Cartas' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-6', name: 'Find the Odd One', description: 'Challenge.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-6', name: 'Memory Game' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-6', name: 'Busca el Intruso', description: 'Transición a secundaria.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-6', name: 'Parejas de Cartas' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-6', name: "Busca l'Intrus", description: 'Repàs general.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-6', name: 'Parelles de Cartes' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-6', name: "Trouve l'Intrus", description: 'Challenge.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-6', name: 'Jeu de Paires' }
    ]
  }
};