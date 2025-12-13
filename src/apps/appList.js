// definición de las listas de aplicaciones y materias para el proyecto EduApps
// en este archivo se organizan las apps educativas por niveles, cursos y materias

// importaciones de componentes de aplicaciones para primaria
import SupermercadoMatematico1 from './supermercado-matematico/primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from './supermercado-matematico/primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from './supermercado-matematico/primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from './supermercado-matematico/primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from './supermercado-matematico/primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from './supermercado-matematico/primaria-6/SupermercadoMatematico6';
import IslaDeLaCalma from './isla-de-la-calma/IslaDeLaCalma';
import OrdenaLaFraseJuego from './_shared/OrdenaLaFraseJuego';
import OrdenaLaHistoriaJuego from './_shared/OrdenaLaHistoriaJuego';
import DetectiveDePalabras from '@/apps/_shared/DetectiveDePalabrasJuego';
import { NumerosRomanos3, NumerosRomanos4, NumerosRomanos5y6 } from './_shared/NumerosRomanosGame';
import { MayorMenor1, MayorMenor2, MayorMenor3, MayorMenor4, MayorMenor5, MayorMenor6 } from './_shared/MayorMenorGame';
import { Medidas1, Medidas2, Medidas3, Medidas4, Medidas5, Medidas6 } from './_shared/MedidasGame';

// importaciones de operaciones matemáticas para primaria
import SumasPrimaria1 from '@/apps/sumas/primaria-1/SumasPrimaria1';
import SumasPrimaria2 from '@/apps/sumas/primaria-2/SumasPrimaria2';
import SumasPrimaria3 from '/src/apps/sumas/primaria-3/SumasPrimaria3';
import SumasPrimaria4 from '/src/apps/sumas/primaria-4/SumasPrimaria4';
import SumasPrimaria5 from '/src/apps/sumas/primaria-5/SumasPrimaria5';
import SumasPrimaria6 from '/src/apps/sumas/primaria-6/SumasPrimaria6';

import RestasPrimaria1 from './restas/primaria-1/RestasPrimaria1';
import RestasPrimaria2 from './restas/primaria-2/RestasPrimaria2';
import RestasPrimaria3 from './restas/primaria-3/RestasPrimaria3';
import RestasPrimaria4 from './restas/primaria-4/RestasPrimaria4';
import RestasPrimaria5 from './restas/primaria-5/RestasPrimaria5';
import RestasPrimaria6 from './restas/primaria-6/RestasPrimaria6';

import MultiplicacionesPrimaria3 from './multiplicaciones/primaria-3/MultiplicacionesPrimaria3';
import MultiplicacionesPrimaria4 from './multiplicaciones/primaria-4/MultiplicacionesPrimaria4';
import MultiplicacionesPrimaria5 from './multiplicaciones/primaria-5/MultiplicacionesPrimaria5';
import MultiplicacionesPrimaria6 from './multiplicaciones/primaria-6/MultiplicacionesPrimaria6';

import DivisionesPrimaria4 from './divisiones/primaria-4/DivisionesPrimaria4';
import DivisionesPrimaria5 from './divisiones/primaria-5/DivisionesPrimaria5';

import GeneradorPersonajes from './generador-personajes/GeneradorPersonajes';
import BuscaElIntruso from './busca-el-intruso/BuscaElIntruso.jsx'
import RoscoJuego from './rosco/RoscoJuego'; 
import OrdenaBolas from '@/apps/ordena-bolas/OrdenaBolas';
import Runner from './_shared/Runner';



// importamos los datos de materias (asignaturas) desde un archivo JSON
// contiene la definición de asignaturas para cada nivel y curso
import materiasData from './../../public/data/materias.json';

// definición de las aplicaciones comunes, reutilizadas en varios cursos
// isla de la calma es una app de respiración y relajación
const appIslaDeLaCalma = {
  id: 'isla-de-la-calma',
  name: 'Isla de la Calma',
  description: 'Un ejercicio de respiración guiada para encontrar la calma.',
  component: IslaDeLaCalma
};

// ordena la frase permite ordenar palabras para construir frases con sentido
const appOrdenaLaFrase = {
  id: 'ordena-la-frase',
  name: 'Ordena la Frase',
  description: 'Arrastra las palabras para construir frases con sentido.',
  component: OrdenaLaFraseJuego
};

// ordena la historia permite ordenar eventos para reconstruir un relato
const appOrdenaLaHistoria = {
  id: 'ordena-la-historia',
  name: 'Ordena la Historia',
  description: 'Pon en orden los eventos para reconstruir un relato.',
  component: OrdenaLaHistoriaJuego
};

// detective de palabras es una app de ortografía que inserta espacios en frases
const appDetectiveDePalabras = {
  id: 'detective-de-palabras',
  name: 'Detective de Palabras',
  description: 'Encuentra los espacios ocultos para separar las palabras de la frase.',
  component: DetectiveDePalabras
};

// generador de personajes históricos: nueva app para tutoría en la ESO
const appGeneradorPersonajes = {
  id: 'generador-personajes-historicos',
  name: 'Generador de personajes históricos',
  description: 'Genera personajes históricos aleatorios con filtros por sexo y categoría.',
  component: GeneradorPersonajes
};

// Definimos los objetos de configuración para cada nivel
const appNumerosRomanos3 = {
  id: 'numeros-romanos-3',
  name: 'Números Romanos (Básico)',
  description: 'Aprende los números romanos del 1 al 20.',
  component: NumerosRomanos3
};

const appNumerosRomanos4 = {
  id: 'numeros-romanos-4',
  name: 'Números Romanos (Intermedio)',
  description: 'Practica números romanos hasta el 100.',
  component: NumerosRomanos4
};

const appNumerosRomanosAdvanced = {
  id: 'numeros-romanos-avanzado',
  name: 'Números Romanos (Avanzado)',
  description: 'Domina los números romanos hasta el 3999.',
  component: NumerosRomanos5y6
};

const appMayorMenor1 = { id: 'mayor-menor-1', name: 'Mayor, Menor o Igual', description: 'Aprende a comparar números del 1 al 20.', component: MayorMenor1 };
const appMayorMenor2 = { id: 'mayor-menor-2', name: 'Comparar Números', description: 'Compara números hasta el 100 y sumas sencillas.', component: MayorMenor2 };
const appMayorMenor3 = { id: 'mayor-menor-3', name: 'Comparar Multiplicaciones', description: 'Compara resultados de tablas de multiplicar.', component: MayorMenor3 };
const appMayorMenor4 = { id: 'mayor-menor-4', name: 'Comparar Operaciones', description: '¿Qué resultado es mayor? Operaciones combinadas.', component: MayorMenor4 };
const appMayorMenor5 = { id: 'mayor-menor-5', name: 'Comparar Decimales', description: 'Trabaja con números mayores y decimales.', component: MayorMenor5 };
const appMayorMenor6 = { id: 'mayor-menor-6', name: 'Reto de Comparación', description: 'Expresiones matemáticas complejas.', component: MayorMenor6 };

const appMedidas1 = { 
  id: 'medidas-1', 
  name: 'Medidas: Iniciación', 
  description: 'Aprende a comparar medidas básicas de longitud, peso y capacidad.', 
  component: Medidas1 
};

const appMedidas2 = { 
  id: 'medidas-2', 
  name: 'Medidas: Unidades Básicas', 
  description: 'Practica con las unidades principales: metros, litros y gramos.', 
  component: Medidas2 
};

const appMedidas3 = { 
  id: 'medidas-3', 
  name: 'Medidas: Conversión Simple', 
  description: 'Empieza a convertir unidades de longitud, masa y capacidad.', 
  component: Medidas3 
};

const appMedidas4 = { 
  id: 'medidas-4', 
  name: 'Medidas: Sistema Completo', 
  description: 'Domina la escalera de unidades de todas las magnitudes.', 
  component: Medidas4 
};

const appMedidas5 = { 
  id: 'medidas-5', 
  name: 'Medidas: Expresiones Complejas', 
  description: 'Trabaja con medidas compuestas en cualquier magnitud (ej. 1kg 200g).', 
  component: Medidas5 
};

const appMedidas6 = { 
  id: 'medidas-6', 
  name: 'Medidas: Reto Experto', 
  description: 'Enfréntate a conversiones difíciles y números grandes en las 3 magnitudes.', 
  component: Medidas6 
};


const appBuscaElIntruso = {
    id: 'busca-el-intruso', // El ID será prefijado o único según tu lógica de findAppById
    name: 'Busca el Intruso',
    description: 'Encuentra el concepto que no encaja con los demás.',
    component: BuscaElIntruso
};

const appRosco = { 
    id: 'rosco-del-saber', 
    name: 'El Rosco del Saber', 
    description: 'Adivina la palabra que se esconde detrás de cada letra.', 
    component: RoscoJuego 
};

const appOrdenaBolas = {
    id: 'ordena-bolas',
    name: 'Ordena las Bolas',
    description: 'Juego de física. Pulsa las bolas de menor a mayor peso.',
    component: OrdenaBolas
};

const appRunner = {
    id: 'runner', 
    name: 'Edu Dash',
    description: 'Corre, salta y atrapa los elementos correctos.',
    component: Runner
};

// exportamos las materias para primaria y ESO desde el JSON
export const primariaSubjects = materiasData.primaria;
export const esoSubjects = materiasData.eso;

/*
 * primariaApps almacena las apps de primaria organizadas por curso y materia.
 * A diferencia de la implementación original, en cada materia incluimos
 * también las apps de ordenación de frases, ordenación de historias y
 * detective de palabras. Se conservan las apps específicas de cada materia
 * (como las de matemáticas) y se añaden estas tres apps básicas al final de
 * cada lista. El identificador del detective de palabras se personaliza por
 * curso para evitar colisiones en la navegación.
 */
export const primariaApps = {
  '1': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-1',
        name: 'Busca el Intruso',
        description: 'Encuentra la letra diferente. ¡Practica tu atención con letras!',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-1', name: 'Sumas sin llevadas', description: 'Aprende a sumar números de dos cifras.', component: SumasPrimaria1 },
      { id: 'restas-primaria-1', name: 'Restas sin llevadas', description: 'Restas de 2 cifras sin llevadas', component: RestasPrimaria1 },
      { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 },
      {
        id: 'busca-el-intruso-matematicas-1',
        name: 'Busca el Intruso',
        description: 'Encuentra el número diferente. ¡Entrena tu vista con números!',
        component: BuscaElIntruso
      },
      appRunner,            
      appOrdenaBolas,
      appRosco,
      appMedidas1,
      appMayorMenor1,
      appNumerosRomanos3,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      {
        id: 'busca-el-intruso-naturales-1',
        name: 'Busca el Intruso',
        description: 'Encuentra el elemento diferente. ¡Aprende sobre la naturaleza jugando!',
        component: BuscaElIntruso
      },
      appRunner,      
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      {
        id: 'busca-el-intruso-sociales-1',
        name: 'Busca el Intruso',
        description: 'Encuentra el elemento diferente.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-1',
        name: 'Find the Odd One',
        description: 'Find the different letter.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appRunner,
      appRosco,
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-1',
        name: 'Busca el Intruso',
        description: 'Encuentra la emoción diferente. ¡Aprende sobre sentimientos y emociones!',
        component: BuscaElIntruso
      },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-1',
        name: "Busca l'Intrus",
        description: 'Troba la lletra diferent!',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-1',
        name: "Trouve l'Intrus",
        description: 'Trouve le symbole différent de la culture française!',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ]
  },
  '2': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-2',
        name: 'Busca el Intruso',
        description: 'Identifica la palabra que no pertenece al grupo (gramática y vocabulario).',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-2-drag', name: 'Sumas con llevadas', description: 'Resuelve sumas de dos cifras con llevadas.', component: SumasPrimaria2 },
      { id: 'restas-primaria-2', name: 'Restas con llevadas', description: 'Restas de 2 cifras con llevadas', component: RestasPrimaria2 },
      { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 },
      {
        id: 'busca-el-intruso-matematicas-2',
        name: 'Busca el Intruso',
        description: 'Encuentra el número o figura que no encaja.',
        component: BuscaElIntruso
      },
      appRunner,
      appOrdenaBolas,
      appRosco,
      appMedidas2,
      appMayorMenor2,
      appNumerosRomanos3,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      {
        id: 'busca-el-intruso-naturales-2',
        name: 'Busca el Intruso',
        description: 'Distingue animales, plantas y elementos de la naturaleza.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      {
        id: 'busca-el-intruso-sociales-2',
        name: 'Busca el Intruso',
        description: 'Identifica elementos de la sociedad, profesiones y el entorno.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-2',
        name: 'Find the Odd One',
        description: 'Find the word that does not belong (Vocabulary).',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-2',
        name: 'Busca el Intruso',
        description: 'Identifica emociones, valores y hábitos saludables.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-2',
        name: "Busca l'Intrus",
        description: "Troba la paraula que no pertany al grup.",
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-2',
        name: "Trouve l'Intrus",
        description: 'Trouve le mot qui ne correspond pas.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ]
  },
// ... (mantenemos el código anterior de importaciones y cursos 1 y 2 igual)

  '3': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-3',
        name: 'Busca el Intruso',
        description: 'Identifica la palabra intrusa por su categoría gramatical o significado.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-3',
        name: 'Busca el Intruso',
        description: 'Encuentra el número o resultado que no encaja.',
        component: BuscaElIntruso
      },
      { id: 'sumas-primaria-3-drag', name: 'Sumas con llevadas', description: 'Resuelve sumas de 3 y 4 cifras con llevadas.', component: SumasPrimaria3 },
      { id: 'restas-primaria-3', name: 'Restas con llevadas', description: 'Restas de 3 y 4 cifras con llevadas', component: RestasPrimaria3 },
      { id: 'multiplicaciones-primaria-3', name: 'Multiplicaciones', description: 'Multiplicaciones de 1 cifra en el multiplicador', component: MultiplicacionesPrimaria3 },
      { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 },
      appRunner,            
      appOrdenaBolas,
      appRosco,
      appMedidas3,
      appMayorMenor3,
      appNumerosRomanos3,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      {
        id: 'busca-el-intruso-naturales-3',
        name: 'Busca el Intruso',
        description: 'Clasifica animales, plantas y ecosistemas.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      {
        id: 'busca-el-intruso-sociales-3',
        name: 'Busca el Intruso',
        description: 'Geografía, relieve y sociedad.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-3',
        name: 'Find the Odd One',
        description: 'Find the word that does not belong (Vocabulary & Grammar).',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-3',
        name: 'Busca el Intruso',
        description: 'Valores, emociones y convivencia.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-3',
        name: "Busca l'Intrus",
        description: 'Gramàtica i vocabulari.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-3',
        name: "Trouve l'Intrus",
        description: 'Vocabulaire et grammaire.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ]
  },
  '4': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-4',
        name: 'Busca el Intruso',
        description: 'Análisis morfológico y semántico.',
        component: BuscaElIntruso
      },     
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-4',
        name: 'Busca el Intruso',
        description: 'Operaciones, geometría y medidas.',
        component: BuscaElIntruso
      },
      { id: 'sumas-primaria-4-drag', name: 'Sumas triples', description: 'Resuelve sumas triples de 3 y 4 cifras con llevadas.', component: SumasPrimaria4 },
      { id: 'restas-primaria-4', name: 'Restas con un decimal', description: 'Restas con 1 decimal', component: RestasPrimaria4 },
      { id: 'multiplicaciones-primaria-4', name: 'Multiplicaciones', description: 'Multiplica por más de 1 cifra', component: MultiplicacionesPrimaria4 },
      { 
  id: 'divisiones-primaria-4', 
  name: 'Divisiones (Iniciación)', 
  description: 'Aprende a dividir: Dividendo de 2-3 cifras y divisor de 1 cifra.', 
  component: DivisionesPrimaria4 
},
{ id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 },
      appRunner,      
      appOrdenaBolas,
      appRosco,
      appMedidas4,
      appMayorMenor4,
      appNumerosRomanos4,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
       {
        id: 'busca-el-intruso-naturales-4',
        name: 'Busca el Intruso',
        description: 'Los ecosistemas, la materia y la energía.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      {
        id: 'busca-el-intruso-sociales-4',
        name: 'Busca el Intruso',
        description: 'Historia, población y territorio.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-4',
        name: 'Find the Odd One',
        description: 'Intermediate vocabulary & grammar challenge.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-4',
        name: 'Busca el Intruso',
        description: 'Resolución de conflictos y emociones.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-4',
        name: "Busca l'Intrus",
        description: 'Reforç de vocabulari i gramàtica.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-4',
        name: "Trouve l'Intrus",
        description: 'Exercices de vocabulaire.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ]
  },
  '5': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-5',
        name: 'Busca el Intruso',
        description: 'Sintaxis, morfología y literatura.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-5',
        name: 'Busca el Intruso',
        description: 'Fracciones, decimales y geometría.',
        component: BuscaElIntruso
      },
      { id: 'sumas-primaria-5-drag', name: 'Sumas con decimales', description: 'Resuelve sumas con decimales.', component: SumasPrimaria5 },
      { id: 'restas-primaria-5', name: 'Restas con decimales', description: 'Restas con varios decimales', component: RestasPrimaria5 },
      { id: 'multiplicaciones-primaria-5', name: 'Multiplicaciones', description: 'Multiplica por varios dígitos', component: MultiplicacionesPrimaria5 },
      { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 },
      { 
  id: 'divisiones-primaria-5', 
  name: 'Divisiones (2 y 3 cifras)', 
  description: 'Practica divisiones con divisores de dos y tres cifras.', 
  component: DivisionesPrimaria5 
},
      appRunner,      
      appOrdenaBolas,
      appRosco,
      appMedidas5,
      appMayorMenor5,
      appNumerosRomanosAdvanced,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      {
        id: 'busca-el-intruso-naturales-5',
        name: 'Busca el Intruso',
        description: 'El cuerpo humano, la célula y los reinos.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      {
        id: 'busca-el-intruso-sociales-5',
        name: 'Busca el Intruso',
        description: 'La Edad Media, el universo y el clima.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-5',
        name: 'Find the Odd One',
        description: 'Advanced vocabulary & grammar.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-5',
        name: 'Busca el Intruso',
        description: 'Dinámicas de grupo y autoconocimiento.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-5',
        name: "Busca l'Intrus",
        description: 'Perfeccionament de la llengua.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-5',
        name: "Trouve l'Intrus",
        description: 'Vocabulaire avancé.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ]
  },
  '6': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-6',
        name: 'Busca el Intruso',
        description: 'Repaso general de primaria.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-6',
        name: 'Busca el Intruso',
        description: 'Desafíos matemáticos de lógica.',
        component: BuscaElIntruso
      },
      { id: 'sumas-primaria-6-drag', name: 'Sumas triples con Decimales', description: 'Resuelve sumas triples con hasta 3 decimales.', component: SumasPrimaria6 },
      { id: 'restas-primaria-6', name: 'Restas a completar', description: 'Completa cualquier parte de la resta', component: RestasPrimaria6 },
      { id: 'multiplicaciones-primaria-6', name: 'Multiplicaciones', description: 'Multiplicaciones con decimales', component: MultiplicacionesPrimaria6 },
      { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 },
      appRunner,      
      appOrdenaBolas,
      appRosco,
      appMedidas6,
      appMayorMenor6,
      appNumerosRomanosAdvanced,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      {
        id: 'busca-el-intruso-naturales-6',
        name: 'Busca el Intruso',
        description: 'Electricidad, magnetismo y salud.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      {
        id: 'busca-el-intruso-sociales-6',
        name: 'Busca el Intruso',
        description: 'Historia contemporánea y Europa.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-6',
        name: 'Find the Odd One',
        description: 'Challenge your English skills.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-6',
        name: 'Busca el Intruso',
        description: 'Transición a la secundaria.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-6',
        name: "Busca l'Intrus",
        description: 'Repàs general.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-6',
        name: "Trouve l'Intrus",
        description: 'Challenge de français.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ]
  }
// ... (mantenemos el resto del archivo con esoApps y findAppById igual)
};

/*
 * esoApps almacena las apps de secundaria organizadas por curso y materia.
 * Se incluye "Busca el Intruso" en todas las asignaturas para repasar conceptos clave.
 */
export const esoApps = {
  '1': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-eso-1',
        name: 'Busca el Intruso',
        description: 'Refuerza gramática, comunicación y literatura.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-eso-1',
        name: 'Busca el Intruso',
        description: 'Repasa números enteros, geometría y fracciones.',
        component: BuscaElIntruso
      },
      appRunner,      
      appOrdenaBolas,
      appRosco,      
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'historia': [
      {
        id: 'busca-el-intruso-historia-eso-1',
        name: 'Busca el Intruso',
        description: 'Prehistoria, Edad Antigua y Geografía.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-eso-1',
        name: 'Find the Odd One',
        description: 'Vocabulary and grammar review.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ],
    'biologia': [
      {
        id: 'busca-el-intruso-biologia-eso-1',
        name: 'Busca el Intruso',
        description: 'Los seres vivos y el planeta Tierra.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'fisica': [
      {
        id: 'busca-el-intruso-fisica-eso-1',
        name: 'Busca el Intruso',
        description: 'Introducción a la materia y la energía.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'musica': [
      {
        id: 'busca-el-intruso-musica-eso-1',
        name: 'Busca el Intruso',
        description: 'Lenguaje musical e instrumentos.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'plastica': [
      {
        id: 'busca-el-intruso-plastica-eso-1',
        name: 'Busca el Intruso',
        description: 'Elementos visuales y color.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tecnologia': [
      {
        id: 'busca-el-intruso-tecnologia-eso-1',
        name: 'Busca el Intruso',
        description: 'Materiales, herramientas y proceso tecnológico.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ed-fisica': [
      {
        id: 'busca-el-intruso-ed-fisica-eso-1',
        name: 'Busca el Intruso',
        description: 'Deportes y salud.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-eso-1',
        name: 'Busca el Intruso',
        description: 'Convivencia y técnicas de estudio.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-eso-1',
        name: "Busca l'Intrus",
        description: 'Gramàtica i vocabulari bàsic.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-eso-1',
        name: "Trouve l'Intrus",
        description: 'Vocabulaire de base.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ]
  },
  '2': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-eso-2',
        name: 'Busca el Intruso',
        description: 'Sintaxis y géneros literarios.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-eso-2',
        name: 'Busca el Intruso',
        description: 'Álgebra, funciones y geometría.',
        component: BuscaElIntruso
      },
      appRunner,      
      appOrdenaBolas,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'historia': [
      {
        id: 'busca-el-intruso-historia-eso-2',
        name: 'Busca el Intruso',
        description: 'La Edad Media y el Arte.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-eso-2',
        name: 'Find the Odd One',
        description: 'Grammar and irregular verbs.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ],
    'biologia': [
      {
        id: 'busca-el-intruso-biologia-eso-2',
        name: 'Busca el Intruso',
        description: 'Funciones vitales y ecosistemas.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'fisica': [
      {
        id: 'busca-el-intruso-fisica-eso-2',
        name: 'Busca el Intruso',
        description: 'Materia, energía y fuerzas.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'musica': [
      {
        id: 'busca-el-intruso-musica-eso-2',
        name: 'Busca el Intruso',
        description: 'Historia de la música.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'plastica': [
      {
        id: 'busca-el-intruso-plastica-eso-2',
        name: 'Busca el Intruso',
        description: 'Técnicas artísticas y geometría.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tecnologia': [
      {
        id: 'busca-el-intruso-tecnologia-eso-2',
        name: 'Busca el Intruso',
        description: 'Electricidad y mecanismos.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ed-fisica': [
      {
        id: 'busca-el-intruso-ed-fisica-eso-2',
        name: 'Busca el Intruso',
        description: 'Cualidades físicas y deporte.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-eso-2',
        name: 'Busca el Intruso',
        description: 'Valores y habilidades sociales.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-eso-2',
        name: "Busca l'Intrus",
        description: 'Lèxic i comarques.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-eso-2',
        name: "Trouve l'Intrus",
        description: 'La ville et les vêtements.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ]
  },
  '3': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-eso-3',
        name: 'Busca el Intruso',
        description: 'Literatura clásica y sintaxis.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-eso-3',
        name: 'Busca el Intruso',
        description: 'Estadística, ecuaciones y geometría.',
        component: BuscaElIntruso
      },
      appRunner,
      appOrdenaBolas,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'historia': [
      {
        id: 'busca-el-intruso-historia-eso-3',
        name: 'Busca el Intruso',
        description: 'Edad Moderna y geografía política.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-eso-3',
        name: 'Find the Odd One',
        description: 'Advanced vocabulary and tenses.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ],
    'biologia': [
      {
        id: 'busca-el-intruso-biologia-eso-3',
        name: 'Busca el Intruso',
        description: 'Cuerpo humano y salud.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'fisica': [
      {
        id: 'busca-el-intruso-fisica-eso-3',
        name: 'Busca el Intruso',
        description: 'Química, átomos y tabla periódica.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'musica': [
      {
        id: 'busca-el-intruso-musica-eso-3',
        name: 'Busca el Intruso',
        description: 'Estilos y épocas musicales.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'plastica': [
      {
        id: 'busca-el-intruso-plastica-eso-3',
        name: 'Busca el Intruso',
        description: 'Diseño y perspectiva.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tecnologia': [
      {
        id: 'busca-el-intruso-tecnologia-eso-3',
        name: 'Busca el Intruso',
        description: 'Mecanismos y energía.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ed-fisica': [
      {
        id: 'busca-el-intruso-ed-fisica-eso-3',
        name: 'Busca el Intruso',
        description: 'Entrenamiento y primeros auxilios.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-eso-3',
        name: 'Busca el Intruso',
        description: 'Orientación académica y emociones.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-eso-3',
        name: "Busca l'Intrus",
        description: 'Sociolingüística i literatura.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-eso-3',
        name: "Trouve l'Intrus",
        description: 'Culture et grammaire avancée.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ]
  },
  '4': {
    'lengua': [
      {
        id: 'busca-el-intruso-lengua-eso-4',
        name: 'Busca el Intruso',
        description: 'Literatura contemporánea.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'matematicas': [
      {
        id: 'busca-el-intruso-matematicas-eso-4',
        name: 'Busca el Intruso',
        description: 'Funciones, probabilidad y trigonometría.',
        component: BuscaElIntruso
      },
      appRunner,
      appOrdenaBolas,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'historia': [
      {
        id: 'busca-el-intruso-historia-eso-4',
        name: 'Busca el Intruso',
        description: 'Historia del Mundo Contemporáneo.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'ingles': [
      {
        id: 'busca-el-intruso-ingles-eso-4',
        name: 'Find the Odd One',
        description: 'Complex grammar and idioms.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ],
    'ed-fisica': [
      {
        id: 'busca-el-intruso-ed-fisica-eso-4',
        name: 'Busca el Intruso',
        description: 'Actividad física y salud.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'biologia': [
      {
        id: 'busca-el-intruso-biologia-eso-4',
        name: 'Busca el Intruso',
        description: 'Genética y evolución.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'fisica': [
      {
        id: 'busca-el-intruso-fisica-eso-4',
        name: 'Busca el Intruso',
        description: 'Cinemática, dinámica y fuerzas.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'latin': [
      {
        id: 'busca-el-intruso-latin-eso-4',
        name: 'Busca el Intruso',
        description: 'Cultura romana y declinaciones.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'economia': [
      {
        id: 'busca-el-intruso-economia-eso-4',
        name: 'Busca el Intruso',
        description: 'Conceptos económicos básicos.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tecnologia': [
      {
        id: 'busca-el-intruso-tecnologia-eso-4',
        name: 'Busca el Intruso',
        description: 'Electrónica y robótica.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],     
    'musica': [
      {
        id: 'busca-el-intruso-musica-eso-4',
        name: 'Busca el Intruso',
        description: 'Estilos y épocas musicales.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],   
    'plastica': [
      {
        id: 'busca-el-intruso-plastica-eso-4',
        name: 'Busca el Intruso',
        description: 'Diseño y perspectiva.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appGeneradorPersonajes,
      {
        id: 'busca-el-intruso-tutoria-eso-4',
        name: 'Busca el Intruso',
        description: 'Orientación profesional y futuro.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria
    ],
    'valenciano': [
      {
        id: 'busca-el-intruso-valenciano-eso-4',
        name: "Busca l'Intrus",
        description: 'Literatura i cultura.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ],
    'frances': [
      {
        id: 'busca-el-intruso-frances-eso-4',
        name: "Trouve l'Intrus",
        description: 'Francophonie et culture.',
        component: BuscaElIntruso
      },
      appRunner,
      appRosco,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ]
  }
};


/**
 * Busca una app por su identificador. Acepta el nivel, curso y materia cuando exista
 * Devuelve un objeto con la app y el contexto si la encuentra, o null en caso contrario
 * @param {string} id identificador único de la app
 * @param {string} level nivel educativo ('primaria' o 'eso')
 * @param {string} grade curso dentro del nivel (por ejemplo '1')
 * @param {string} [subjectId] identificador de la materia
 */
export const findAppById = (id, level, grade, subjectId) => {
  if (level === 'primaria') {
    // si se especifica la materia, buscamos únicamente dentro de esa categoría
    if (subjectId) {
      const appsEnMateria = primariaApps[grade]?.[subjectId] || [];
      const encontrada = appsEnMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'primaria', grade, subjectId };
      }
    }
    // búsqueda general: recorremos todas las materias del curso
    const materiasCurso = primariaApps[grade] || {};
    for (const claveMateria in materiasCurso) {
      const appsMateria = materiasCurso[claveMateria] || [];
      const encontrada = appsMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'primaria', grade, subjectId: claveMateria };
      }
    }
  }
  if (level === 'eso') {
    if (subjectId) {
      const appsEnMateria = esoApps[grade]?.[subjectId] || [];
      const encontrada = appsEnMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'eso', grade, subjectId };
      }
    }
    // búsqueda en todas las materias de la ESO cuando no se proporciona subjectId
    const materiasCurso = esoApps[grade] || {};
    for (const claveMateria in materiasCurso) {
      const appsMateria = materiasCurso[claveMateria] || [];
      const encontrada = appsMateria.find((app) => app.id === id);
      if (encontrada) {
        return { app: encontrada, level: 'eso', grade, subjectId: claveMateria };
      }
    }
  }
  return null; // si no encuentra la app, devolvemos null
};