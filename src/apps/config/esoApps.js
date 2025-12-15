// src/apps/config/esoApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta

// Importar apps comunes
import {
    appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
    appGeneradorPersonajes, appBuscaElIntruso, appRosco, appOrdenaBolas, appRunner, appVisualizador3D
} from './commonApps';

export const esoSubjects = materiasData.eso;

export const esoApps = {
  '1': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-eso-1', name: 'Busca el Intruso', description: 'Refuerza gramática, comunicación y literatura.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-eso-1', name: 'Busca el Intruso', description: 'Repasa números enteros, geometría y fracciones.', component: appBuscaElIntruso.component },
      appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'historia': [
      { id: 'busca-el-intruso-historia-eso-1', name: 'Busca el Intruso', description: 'Prehistoria, Edad Antigua y Geografía.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-eso-1', name: 'Find the Odd One', description: 'Vocabulary and grammar review.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ],
    'biologia': [
      { id: 'busca-el-intruso-biologia-eso-1', name: 'Busca el Intruso', description: 'Los seres vivos y el planeta Tierra.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'fisica': [
      { id: 'busca-el-intruso-fisica-eso-1', name: 'Busca el Intruso', description: 'Introducción a la materia y la energía.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'musica': [
      { id: 'busca-el-intruso-musica-eso-1', name: 'Busca el Intruso', description: 'Lenguaje musical e instrumentos.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'plastica': [
      { id: 'busca-el-intruso-plastica-eso-1', name: 'Busca el Intruso', description: 'Elementos visuales y color.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tecnologia': [
      { id: 'busca-el-intruso-tecnologia-eso-1', name: 'Busca el Intruso', description: 'Materiales, herramientas y proceso tecnológico.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ed-fisica': [
      { id: 'busca-el-intruso-ed-fisica-eso-1', name: 'Busca el Intruso', description: 'Deportes y salud.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-eso-1', name: 'Busca el Intruso', description: 'Convivencia y técnicas de estudio.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-eso-1', name: "Busca l'Intrus", description: 'Gramàtica i vocabulari bàsic.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-eso-1', name: "Trouve l'Intrus", description: 'Vocabulaire de base.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-1', name: 'Detective de Palabras' }
    ]
  },
  '2': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-eso-2', name: 'Busca el Intruso', description: 'Sintaxis y géneros literarios.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-eso-2', name: 'Busca el Intruso', description: 'Álgebra, funciones y geometría.', component: appBuscaElIntruso.component },
      appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'historia': [
      { id: 'busca-el-intruso-historia-eso-2', name: 'Busca el Intruso', description: 'La Edad Media y el Arte.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-eso-2', name: 'Find the Odd One', description: 'Grammar and irregular verbs.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ],
    'biologia': [
      { id: 'busca-el-intruso-biologia-eso-2', name: 'Busca el Intruso', description: 'Funciones vitales y ecosistemas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'fisica': [
      { id: 'busca-el-intruso-fisica-eso-2', name: 'Busca el Intruso', description: 'Materia, energía y fuerzas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'musica': [
      { id: 'busca-el-intruso-musica-eso-2', name: 'Busca el Intruso', description: 'Historia de la música.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'plastica': [
      { id: 'busca-el-intruso-plastica-eso-2', name: 'Busca el Intruso', description: 'Técnicas artísticas y geometría.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tecnologia': [
      { id: 'busca-el-intruso-tecnologia-eso-2', name: 'Busca el Intruso', description: 'Electricidad y mecanismos.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ed-fisica': [
      { id: 'busca-el-intruso-ed-fisica-eso-2', name: 'Busca el Intruso', description: 'Cualidades físicas y deporte.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-eso-2', name: 'Busca el Intruso', description: 'Valores y habilidades sociales.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-eso-2', name: "Busca l'Intrus", description: 'Lèxic i comarques.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-eso-2', name: "Trouve l'Intrus", description: 'La ville et les vêtements.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-2', name: 'Detective de Palabras' }
    ]
  },
  '3': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-eso-3', name: 'Busca el Intruso', description: 'Literatura clásica y sintaxis.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-eso-3', name: 'Busca el Intruso', description: 'Estadística, ecuaciones y geometría.', component: appBuscaElIntruso.component },
      appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'historia': [
      { id: 'busca-el-intruso-historia-eso-3', name: 'Busca el Intruso', description: 'Edad Moderna y geografía política.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-eso-3', name: 'Find the Odd One', description: 'Advanced vocabulary and tenses.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ],
    'biologia': [
      { id: 'busca-el-intruso-biologia-eso-3', name: 'Busca el Intruso', description: 'Cuerpo humano y salud.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'fisica': [
      { id: 'busca-el-intruso-fisica-eso-3', name: 'Busca el Intruso', description: 'Química, átomos y tabla periódica.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'musica': [
      { id: 'busca-el-intruso-musica-eso-3', name: 'Busca el Intruso', description: 'Estilos y épocas musicales.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'plastica': [
      { id: 'busca-el-intruso-plastica-eso-3', name: 'Busca el Intruso', description: 'Diseño y perspectiva.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tecnologia': [
      { id: 'busca-el-intruso-tecnologia-eso-3', name: 'Busca el Intruso', description: 'Mecanismos y energía.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ed-fisica': [
      { id: 'busca-el-intruso-ed-fisica-eso-3', name: 'Busca el Intruso', description: 'Entrenamiento y primeros auxilios.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-eso-3', name: 'Busca el Intruso', description: 'Orientación académica y emociones.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-eso-3', name: "Busca l'Intrus", description: 'Sociolingüística i literatura.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-eso-3', name: "Trouve l'Intrus", description: 'Culture et grammaire avancée.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-3', name: 'Detective de Palabras' }
    ]
  },
  '4': {
    'lengua': [
      { id: 'busca-el-intruso-lengua-eso-4', name: 'Busca el Intruso', description: 'Literatura contemporánea.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'matematicas': [
      { id: 'busca-el-intruso-matematicas-eso-4', name: 'Busca el Intruso', description: 'Funciones, probabilidad y trigonometría.', component: appBuscaElIntruso.component },
      appVisualizador3D, appRunner, appOrdenaBolas, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'historia': [
      { id: 'busca-el-intruso-historia-eso-4', name: 'Busca el Intruso', description: 'Historia del Mundo Contemporáneo.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'ingles': [
      { id: 'busca-el-intruso-ingles-eso-4', name: 'Find the Odd One', description: 'Complex grammar and idioms.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ],
    'ed-fisica': [
      { id: 'busca-el-intruso-ed-fisica-eso-4', name: 'Busca el Intruso', description: 'Actividad física y salud.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'biologia': [
      { id: 'busca-el-intruso-biologia-eso-4', name: 'Busca el Intruso', description: 'Genética y evolución.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'fisica': [
      { id: 'busca-el-intruso-fisica-eso-4', name: 'Busca el Intruso', description: 'Cinemática, dinámica y fuerzas.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'latin': [
      { id: 'busca-el-intruso-latin-eso-4', name: 'Busca el Intruso', description: 'Cultura romana y declinaciones.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'economia': [
      { id: 'busca-el-intruso-economia-eso-4', name: 'Busca el Intruso', description: 'Conceptos económicos básicos.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tecnologia': [
      { id: 'busca-el-intruso-tecnologia-eso-4', name: 'Busca el Intruso', description: 'Electrónica y robótica.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],    
    'musica': [
      { id: 'busca-el-intruso-musica-eso-4', name: 'Busca el Intruso', description: 'Estilos y épocas musicales.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],   
    'plastica': [
      { id: 'busca-el-intruso-plastica-eso-4', name: 'Busca el Intruso', description: 'Diseño y perspectiva.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'tutoria': [
      appIslaDeLaCalma, appGeneradorPersonajes,
      { id: 'busca-el-intruso-tutoria-eso-4', name: 'Busca el Intruso', description: 'Orientación profesional y futuro.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria
    ],
    'valenciano': [
      { id: 'busca-el-intruso-valenciano-eso-4', name: "Busca l'Intrus", description: 'Literatura i cultura.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ],
    'frances': [
      { id: 'busca-el-intruso-frances-eso-4', name: "Trouve l'Intrus", description: 'Francophonie et culture.', component: appBuscaElIntruso.component },
      appRunner, appRosco, appOrdenaLaFrase, appOrdenaLaHistoria,
      { ...appDetectiveDePalabras, id: 'detective-de-palabras-eso-4', name: 'Detective de Palabras' }
    ]
  }
};