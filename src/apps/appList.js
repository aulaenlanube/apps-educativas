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

import DetectiveDePalabras from '@/apps/detective-de-palabras/DetectiveDePalabras';

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
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-1', name: 'Sumas sin Llevadas', description: 'Aprende a sumar números de dos cifras.', component: SumasPrimaria1 },
      { id: 'restas-primaria-1', name: 'Resta 1º Primaria', description: 'Restas de 2 cifras sin llevadas', component: RestasPrimaria1 },
      { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'ingles': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ],
    // añadimos francés con las mismas tres apps para 1º de primaria
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }
    ]
  },
  '2': {
    'lengua': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-2-drag', name: 'Sumas con Llevadas (2º)', description: 'Resuelve sumas de dos cifras con llevadas.', component: SumasPrimaria2 },
      { id: 'restas-primaria-2', name: 'Resta 2º Primaria', description: 'Restas de 2 cifras con llevadas', component: RestasPrimaria2 },
      { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'ingles': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ],
    // añadimos francés para 2º de primaria
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' }
    ]
  },
  '3': {
    'lengua': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-3-drag', name: 'Sumas con Llevadas (3º)', description: 'Resuelve sumas de 3 y 4 cifras con llevadas.', component: SumasPrimaria3 },
      { id: 'restas-primaria-3', name: 'Resta 3º Primaria', description: 'Restas de 3 y 4 cifras con llevadas', component: RestasPrimaria3 },
      { id: 'multiplicaciones-primaria-3', name: 'Multiplicaciones 3º Primaria', description: 'Multiplicaciones de 1 cifra en el multiplicador', component: MultiplicacionesPrimaria3 },
      { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'ingles': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ],
    // añadimos francés para 3º de primaria
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' }
    ]
  },
  '4': {
    'lengua': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-4-drag', name: 'Sumas triples (4º)', description: 'Resuelve sumas triples de 3 y 4 cifras con llevadas.', component: SumasPrimaria4 },
      { id: 'restas-primaria-4', name: 'Resta 4º Primaria', description: 'Restas con 1 decimal', component: RestasPrimaria4 },
      { id: 'multiplicaciones-primaria-4', name: 'Multiplicaciones 4º Primaria', description: 'Multiplica por más de 1 cifra', component: MultiplicacionesPrimaria4 },
      { id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'ingles': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ],
    // añadimos francés para 4º de primaria
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' }
    ]
  },
  '5': {
    'lengua': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-5-drag', name: 'Sumas con Decimales (5º)', description: 'Resuelve sumas con decimales.', component: SumasPrimaria5 },
      { id: 'restas-primaria-5', name: 'Resta 5º Primaria', description: 'Restas con varios decimales', component: RestasPrimaria5 },
      { id: 'multiplicaciones-primaria-5', name: 'Multiplicaciones 5º Primaria', description: 'Multiplica por varios dígitos', component: MultiplicacionesPrimaria5 },
      { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'ingles': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ],
    // añadimos francés para 5º de primaria
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' }
    ]
  },
  '6': {
    'lengua': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'matematicas': [
      { id: 'sumas-primaria-6-drag', name: 'Sumas triples con Decimales (6º)', description: 'Resuelve sumas triples con hasta 3 decimales.', component: SumasPrimaria6 },
      { id: 'restas-primaria-6', name: 'Resta 6º Primaria', description: 'Completa la resta', component: RestasPrimaria6 },
      { id: 'multiplicaciones-primaria-6', name: 'Multiplicaciones 6º Primaria', description: 'Multiplicaciones con decimales', component: MultiplicacionesPrimaria6 },
      { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 },
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ciencias-naturales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ciencias-sociales': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'ingles': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'tutoria': [
      appIslaDeLaCalma,
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ],
    // añadimos francés para 6º de primaria
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' }
    ]
  }
};

/*
 * esoApps se mantiene con la misma estructura original: por curso y materia
 * cada materia de la ESO contiene de momento apps genéricas que se irán completando
 */
export const esoApps = {
  '1': {
    'lengua': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'matematicas': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'historia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ingles': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'biologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'musica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'plastica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tecnologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ed-fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria]
    ,
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ],
    // añadimos francés como nueva materia con las tres apps en 1º de ESO
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ]
  },
  '2': {
    'lengua': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'matematicas': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'historia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ingles': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'biologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'musica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'plastica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tecnologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ed-fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria]
    ,
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ],
    // añadimos francés en 2º de ESO
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ]
  },
  '3': {
    'lengua': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'matematicas': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'historia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ingles': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'biologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'musica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'plastica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tecnologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ed-fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria]
    ,
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ],
    // añadimos francés en 3º de ESO
    'frances': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ]
  },
  '4': {
    'lengua': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'matematicas': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'historia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ingles': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'ed-fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'biologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'fisica': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'latin': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'economia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tecnologia': [appOrdenaLaFrase, appOrdenaLaHistoria],
    'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria]
    ,
    'valenciano': [
      appOrdenaLaFrase,
      appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ],
    // añadimos francés en 4º de ESO
    'frances': [
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