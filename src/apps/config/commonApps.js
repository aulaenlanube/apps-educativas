// src/apps/config/commonApps.js

// Ajuste de rutas: Subimos un nivel (../) para salir de 'config' y entrar en las carpetas de 'apps'
import IslaDeLaCalma from '../isla-de-la-calma/IslaDeLaCalma';
import OrdenaLaFraseJuego from '../_shared/OrdenaLaFraseJuego';
import OrdenaLaHistoriaJuego from '../_shared/OrdenaLaHistoriaJuego';
import DetectiveDePalabras from '@/apps/_shared/DetectiveDePalabrasJuego';
import { NumerosRomanos3, NumerosRomanos4, NumerosRomanos5y6 } from '../_shared/NumerosRomanosGame';
import { MayorMenor1, MayorMenor2, MayorMenor3, MayorMenor4, MayorMenor5, MayorMenor6 } from '../_shared/MayorMenorGame';
import { Medidas1, Medidas2, Medidas3, Medidas4, Medidas5, Medidas6 } from '../_shared/MedidasGame';
import GeneradorPersonajes from '../generador-personajes/GeneradorPersonajes';
import BuscaElIntruso from '../busca-el-intruso/BuscaElIntruso.jsx';
import RoscoJuego from '../rosco/RoscoJuego'; 
import OrdenaBolas from '@/apps/ordena-bolas/OrdenaBolas';
import Runner from '../_shared/Runner';
import VisualizadorFiguras3D from '../visualizador-figuras-3d/VisualizadorFiguras3D';

// Apps Comunes
export const appIslaDeLaCalma = {
  id: 'isla-de-la-calma',
  name: 'Isla de la Calma',
  description: 'Un ejercicio de respiración guiada para encontrar la calma.',
  component: IslaDeLaCalma
};

export const appOrdenaLaFrase = {
  id: 'ordena-la-frase',
  name: 'Ordena la Frase',
  description: 'Arrastra las palabras para construir frases con sentido.',
  component: OrdenaLaFraseJuego
};

export const appOrdenaLaHistoria = {
  id: 'ordena-la-historia',
  name: 'Ordena la Historia',
  description: 'Pon en orden los eventos para reconstruir un relato.',
  component: OrdenaLaHistoriaJuego
};

export const appDetectiveDePalabras = {
  id: 'detective-de-palabras',
  name: 'Detective de Palabras',
  description: 'Encuentra los espacios ocultos para separar las palabras de la frase.',
  component: DetectiveDePalabras
};

export const appGeneradorPersonajes = {
  id: 'generador-personajes-historicos',
  name: 'Generador de personajes históricos',
  description: 'Genera personajes históricos aleatorios con filtros por sexo y categoría.',
  component: GeneradorPersonajes
};

export const appBuscaElIntruso = {
    id: 'busca-el-intruso',
    name: 'Busca el Intruso',
    description: 'Encuentra el concepto que no encaja con los demás.',
    component: BuscaElIntruso
};

export const appRosco = { 
    id: 'rosco-del-saber', 
    name: 'El Rosco del Saber', 
    description: 'Adivina la palabra que se esconde detrás de cada letra.', 
    component: RoscoJuego 
};

export const appOrdenaBolas = {
    id: 'ordena-bolas',
    name: 'Ordena las Bolas',
    description: 'Juego de física. Pulsa las bolas de menor a mayor peso.',
    component: OrdenaBolas
};

export const appRunner = {
    id: 'runner', 
    name: 'Education Dash',
    description: 'Corre, salta y atrapa los elementos correctos.',
    component: Runner
};

export const appVisualizador3D = { 
    id: 'visualizador-3d', 
    name: 'Laboratorio de Figuras 3D', 
    description: 'Explora, rota y analiza las principales figuras geométricas en 3D.', 
    component: VisualizadorFiguras3D 
};

// Apps de Matemáticas compartidas (Romanos, MayorMenor, Medidas)
export const appNumerosRomanos3 = { id: 'numeros-romanos-3', name: 'Números Romanos (Básico)', description: 'Aprende los números romanos del 1 al 20.', component: NumerosRomanos3 };
export const appNumerosRomanos4 = { id: 'numeros-romanos-4', name: 'Números Romanos (Intermedio)', description: 'Practica números romanos hasta el 100.', component: NumerosRomanos4 };
export const appNumerosRomanosAdvanced = { id: 'numeros-romanos-avanzado', name: 'Números Romanos (Avanzado)', description: 'Domina los números romanos hasta el 3999.', component: NumerosRomanos5y6 };

export const appMayorMenor1 = { id: 'mayor-menor-1', name: 'Mayor, Menor o Igual', description: 'Aprende a comparar números del 1 al 20.', component: MayorMenor1 };
export const appMayorMenor2 = { id: 'mayor-menor-2', name: 'Comparar Números', description: 'Compara números hasta el 100 y sumas sencillas.', component: MayorMenor2 };
export const appMayorMenor3 = { id: 'mayor-menor-3', name: 'Comparar Multiplicaciones', description: 'Compara resultados de tablas de multiplicar.', component: MayorMenor3 };
export const appMayorMenor4 = { id: 'mayor-menor-4', name: 'Comparar Operaciones', description: '¿Qué resultado es mayor? Operaciones combinadas.', component: MayorMenor4 };
export const appMayorMenor5 = { id: 'mayor-menor-5', name: 'Comparar Decimales', description: 'Trabaja con números mayores y decimales.', component: MayorMenor5 };
export const appMayorMenor6 = { id: 'mayor-menor-6', name: 'Reto de Comparación', description: 'Expresiones matemáticas complejas.', component: MayorMenor6 };

export const appMedidas1 = { id: 'medidas-1', name: 'Medidas: Iniciación', description: 'Aprende a comparar medidas básicas de longitud, peso y capacidad.', component: Medidas1 };
export const appMedidas2 = { id: 'medidas-2', name: 'Medidas: Unidades Básicas', description: 'Practica con las unidades principales: metros, litros y gramos.', component: Medidas2 };
export const appMedidas3 = { id: 'medidas-3', name: 'Medidas: Conversión Simple', description: 'Empieza a convertir unidades de longitud, masa y capacidad.', component: Medidas3 };
export const appMedidas4 = { id: 'medidas-4', name: 'Medidas: Sistema Completo', description: 'Domina la escalera de unidades de todas las magnitudes.', component: Medidas4 };
export const appMedidas5 = { id: 'medidas-5', name: 'Medidas: Expresiones Complejas', description: 'Trabaja con medidas compuestas en cualquier magnitud (ej. 1kg 200g).', component: Medidas5 };
export const appMedidas6 = { id: 'medidas-6', name: 'Medidas: Reto Experto', description: 'Enfréntate a conversiones difíciles y números grandes en las 3 magnitudes.', component: Medidas6 };