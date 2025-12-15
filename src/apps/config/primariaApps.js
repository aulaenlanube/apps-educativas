// src/apps/config/primariaApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta al JSON

// Importar apps comunes
import {
    appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
    appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner,
    appNumerosRomanos3, appNumerosRomanos4, appNumerosRomanosAdvanced,
    appMayorMenor1, appMayorMenor2, appMayorMenor3, appMayorMenor4, appMayorMenor5, appMayorMenor6,
    appMedidas1, appMedidas2, appMedidas3, appMedidas4, appMedidas5, appMedidas6
} from './commonApps';

// Importaciones específicas de Primaria (Rutas ajustadas con ../)
import SupermercadoMatematico1 from '../supermercado-matematico/primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '../supermercado-matematico/primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '../supermercado-matematico/primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '../supermercado-matematico/primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '../supermercado-matematico/primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '../supermercado-matematico/primaria-6/SupermercadoMatematico6';

// Nueva App: Parejas de Cartas
import ParejasDeCartas from '../pareja-de-cartas/ParejasDeCartas';

// Alias @ y rutas absolutas funcionan igual, rutas relativas necesitan ajuste
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

// Definición de la app base para Parejas
const appParejas = {
  id: 'parejas',
  name: 'Parejas de Cartas',
  description: '¡Encuentra las parejas! Pon a prueba tu memoria.',
  component: ParejasDeCartas
};

export const primariaApps = {
  '1': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-1', name: 'Busca el Intruso', description: 'Encuentra la letra diferente. ¡Practica tu atención con letras!', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-lengua-1', name: 'Parejas: Mayúsculas y Minúsculas' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-1', name: 'Sumas sin llevadas', description: 'Aprende a sumar números de dos cifras.', component: SumasPrimaria1 },
      { id: 'restas-primaria-1', name: 'Restas sin llevadas', description: 'Restas de 2 cifras sin llevadas', component: RestasPrimaria1 },
      { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 },
      { id: 'busca-el-intruso-matematicas-1', name: 'Busca el Intruso', description: 'Encuentra el número diferente. ¡Entrena tu vista con números!', component: appBuscaElIntruso.component },
      appRunner, appOrdenaBolas, appRosco, appMedidas1, appMayorMenor1, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-matematicas-1', name: 'Parejas: Sumas y Números' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-1', name: 'Busca el Intruso', description: 'Encuentra el elemento diferente. ¡Aprende sobre la naturaleza jugando!', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ciencias-naturales-1', name: 'Parejas: Naturaleza' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-1', name: 'Busca el Intruso', description: 'Encuentra el elemento diferente.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ciencias-sociales-1', name: 'Parejas: Entorno Social' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-1', name: 'Find the Odd One', description: 'Find the different letter.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-ingles-1', name: 'Pairs: Words & Pictures' }
    ],
    'tutoria': [
      appRunner, appRosco, appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-1', name: 'Busca el Intruso', description: 'Encuentra la emoción diferente. ¡Aprende sobre sentimientos y emociones!', component: appBuscaElIntruso.component },
      appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-tutoria-1', name: 'Parejas: Emociones' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-1', name: "Busca l'Intrus", description: 'Troba la lletra diferent!', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-valenciano-1', name: 'Parelles: Vocabulari' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-1', name: "Trouve l'Intrus", description: 'Trouve le symbole différent de la culture française!', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' },
      { ...appParejas, id: 'parejas-frances-1', name: 'Paires: Vocabulaire' }
    ]
  },
  '2': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-2', name: 'Busca el Intruso', description: 'Identifica la palabra que no pertenece al grupo (gramática y vocabulario).', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-2-drag', name: 'Sumas con llevadas', description: 'Resuelve sumas de dos cifras con llevadas.', component: SumasPrimaria2 },
      { id: 'restas-primaria-2', name: 'Restas con llevadas', description: 'Restas de 2 cifras con llevadas', component: RestasPrimaria2 },
      { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 },
      { id: 'busca-el-intruso-matematicas-2', name: 'Busca el Intruso', description: 'Encuentra el número o figura que no encaja.', component: appBuscaElIntruso.component },
      appRunner, appOrdenaBolas, appRosco, appMedidas2, appMayorMenor2, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-2', name: 'Busca el Intruso', description: 'Distingue animales, plantas y elementos de la naturaleza.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-2', name: 'Busca el Intruso', description: 'Identifica elementos de la sociedad, profesiones y el entorno.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-2', name: 'Find the Odd One', description: 'Find the word that does not belong (Vocabulary).', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-2', name: 'Busca el Intruso', description: 'Identifica emociones, valores y hábitos saludables.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-2', name: "Busca l'Intrus", description: "Troba la paraula que no pertany al grup.", component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-2', name: "Trouve l'Intrus", description: 'Trouve le mot qui ne correspond pas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ]
  },
  '3': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-3', name: 'Busca el Intruso', description: 'Identifica la palabra intrusa por su categoría gramatical o significado.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-3', name: 'Busca el Intruso', description: 'Encuentra el número o resultado que no encaja.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-3-drag', name: 'Sumas con llevadas', description: 'Resuelve sumas de 3 y 4 cifras con llevadas.', component: SumasPrimaria3 },
      { id: 'restas-primaria-3', name: 'Restas con llevadas', description: 'Restas de 3 y 4 cifras con llevadas', component: RestasPrimaria3 },
      { id: 'multiplicaciones-primaria-3', name: 'Multiplicaciones', description: 'Multiplicaciones de 1 cifra en el multiplicador', component: MultiplicacionesPrimaria3 },
      { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 },
      appRunner, appOrdenaBolas, appRosco, appMedidas3, appMayorMenor3, appNumerosRomanos3, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-3', name: 'Busca el Intruso', description: 'Clasifica animales, plantas y ecosistemas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-3', name: 'Busca el Intruso', description: 'Geografía, relieve y sociedad.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-3', name: 'Find the Odd One', description: 'Find the word that does not belong (Vocabulary & Grammar).', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-3', name: 'Busca el Intruso', description: 'Valores, emociones y convivencia.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-3', name: "Busca l'Intrus", description: 'Gramàtica i vocabulari.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-3', name: "Trouve l'Intrus", description: 'Vocabulaire et grammaire.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ]
  },
  '4': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-4', name: 'Busca el Intruso', description: 'Análisis morfológico y semántico.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-4', name: 'Busca el Intruso', description: 'Operaciones, geometría y medidas.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-4-drag', name: 'Sumas triples', description: 'Resuelve sumas triples de 3 y 4 cifras con llevadas.', component: SumasPrimaria4 },
      { id: 'restas-primaria-4', name: 'Restas con un decimal', description: 'Restas con 1 decimal', component: RestasPrimaria4 },
      { id: 'multiplicaciones-primaria-4', name: 'Multiplicaciones', description: 'Multiplica por más de 1 cifra', component: MultiplicacionesPrimaria4 },
      { id: 'divisiones-primaria-4', name: 'Divisiones (Iniciación)', description: 'Aprende a dividir: Dividendo de 2-3 cifras y divisor de 1 cifra.', component: DivisionesPrimaria4 },
      { id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 },
      appRunner, appOrdenaBolas, appRosco, appMedidas4, appMayorMenor4, appNumerosRomanos4, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-4', name: 'Busca el Intruso', description: 'Los ecosistemas, la materia y la energía.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-4', name: 'Busca el Intruso', description: 'Historia, población y territorio.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-4', name: 'Find the Odd One', description: 'Intermediate vocabulary & grammar challenge.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-4', name: 'Busca el Intruso', description: 'Resolución de conflictos y emociones.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-4', name: "Busca l'Intrus", description: 'Reforç de vocabulari i gramàtica.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-4', name: "Trouve l'Intrus", description: 'Exercices de vocabulaire.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ]
  },
  '5': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-5', name: 'Busca el Intruso', description: 'Sintaxis, morfología y literatura.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-5', name: 'Busca el Intruso', description: 'Fracciones, decimales y geometría.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-5-drag', name: 'Sumas con decimales', description: 'Resuelve sumas con decimales.', component: SumasPrimaria5 },
      { id: 'restas-primaria-5', name: 'Restas con decimales', description: 'Restas con varios decimales', component: RestasPrimaria5 },
      { id: 'multiplicaciones-primaria-5', name: 'Multiplicaciones', description: 'Multiplica por varios dígitos', component: MultiplicacionesPrimaria5 },
      { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 },
      { id: 'divisiones-primaria-5', name: 'Divisiones (2 y 3 cifras)', description: 'Practica divisiones con divisores de dos y tres cifras.', component: DivisionesPrimaria5 },
      appRunner, appOrdenaBolas, appRosco, appMedidas5, appMayorMenor5, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-5', name: 'Busca el Intruso', description: 'El cuerpo humano, la célula y los reinos.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-5', name: 'Busca el Intruso', description: 'La Edad Media, el universo y el clima.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-5', name: 'Find the Odd One', description: 'Advanced vocabulary & grammar.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-5', name: 'Busca el Intruso', description: 'Dinámicas de grupo y autoconocimiento.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-5', name: "Busca l'Intrus", description: 'Perfeccionament de la llengua.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-5', name: "Trouve l'Intrus", description: 'Vocabulaire avancé.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ]
  },
  '6': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-6', name: 'Busca el Intruso', description: 'Repaso general de primaria.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-6', name: 'Busca el Intruso', description: 'Desafíos matemáticos de lógica.', component: appBuscaElIntruso.component },
      { id: 'sumas-primaria-6-drag', name: 'Sumas triples con Decimales', description: 'Resuelve sumas triples con hasta 3 decimales.', component: SumasPrimaria6 },
      { id: 'restas-primaria-6', name: 'Restas a completar', description: 'Completa cualquier parte de la resta', component: RestasPrimaria6 },
      { id: 'multiplicaciones-primaria-6', name: 'Multiplicaciones', description: 'Multiplicaciones con decimales', component: MultiplicacionesPrimaria6 },
      { id: 'divisiones-primaria-6', name: 'Divisiones con Decimales', description: 'Aprende a dividir cuando hay decimales en el dividendo.', component: DivisionesPrimaria6 },
      { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 },
      appRunner, appOrdenaBolas, appRosco, appMedidas6, appMayorMenor6, appNumerosRomanosAdvanced, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      { id: 'busca-el-intruso-naturales-6', name: 'Busca el Intruso', description: 'Electricidad, magnetismo y salud.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      { id: 'busca-el-intruso-sociales-6', name: 'Busca el Intruso', description: 'Historia contemporánea y Europa.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-6', name: 'Find the Odd One', description: 'Challenge your English skills.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-6', name: 'Busca el Intruso', description: 'Transición a la secundaria.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-6', name: "Busca l'Intrus", description: 'Repàs general.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-6', name: "Trouve l'Intrus", description: 'Challenge de français.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ]
  }
};