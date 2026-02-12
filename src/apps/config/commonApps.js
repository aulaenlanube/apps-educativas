// src/apps/config/commonApps.js

// Supermercado
import SupermercadoMatematico1 from '../supermercado-matematico/primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '../supermercado-matematico/primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '../supermercado-matematico/primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '../supermercado-matematico/primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '../supermercado-matematico/primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '../supermercado-matematico/primaria-6/SupermercadoMatematico6';

// Sumas
import SumasPrimaria1 from '../sumas/primaria-1/SumasPrimaria1';
import SumasPrimaria2 from '../sumas/primaria-2/SumasPrimaria2';
import SumasPrimaria3 from '../sumas/primaria-3/SumasPrimaria3';
import SumasPrimaria4 from '../sumas/primaria-4/SumasPrimaria4';
import SumasPrimaria5 from '../sumas/primaria-5/SumasPrimaria5';
import SumasPrimaria6 from '../sumas/primaria-6/SumasPrimaria6';

// Restas
import RestasPrimaria1 from '../restas/primaria-1/RestasPrimaria1';
import RestasPrimaria2 from '../restas/primaria-2/RestasPrimaria2';
import RestasPrimaria3 from '../restas/primaria-3/RestasPrimaria3';
import RestasPrimaria4 from '../restas/primaria-4/RestasPrimaria4';
import RestasPrimaria5 from '../restas/primaria-5/RestasPrimaria5';
import RestasPrimaria6 from '../restas/primaria-6/RestasPrimaria6';

// Multiplicaciones
import MultiplicacionesPrimaria3 from '../multiplicaciones/primaria-3/MultiplicacionesPrimaria3';
import MultiplicacionesPrimaria4 from '../multiplicaciones/primaria-4/MultiplicacionesPrimaria4';
import MultiplicacionesPrimaria5 from '../multiplicaciones/primaria-5/MultiplicacionesPrimaria5';
import MultiplicacionesPrimaria6 from '../multiplicaciones/primaria-6/MultiplicacionesPrimaria6';

// Divisiones
import DivisionesPrimaria4 from '../divisiones/primaria-4/DivisionesPrimaria4';
import DivisionesPrimaria5 from '../divisiones/primaria-5/DivisionesPrimaria5';
import DivisionesPrimaria6 from '../divisiones/primaria-6/DivisionesPrimaria6';

import IslaDeLaCalma from '../isla-de-la-calma/IslaDeLaCalma';
import OrdenaLaFraseJuego from '../_shared/OrdenaLaFraseJuego';
import OrdenaLaHistoriaJuego from '../_shared/OrdenaLaHistoriaJuego';
import DetectiveDePalabras from '@/apps/_shared/DetectiveDePalabrasJuego';
import { NumerosRomanos3, NumerosRomanos4, NumerosRomanos5, NumerosRomanos6, NumerosRomanosESO } from '../_shared/NumerosRomanosGame';
import { MayorMenor1, MayorMenor2, MayorMenor3, MayorMenor4, MayorMenor5, MayorMenor6 } from '../_shared/MayorMenorGame';
import { Medidas1, Medidas2, Medidas3, Medidas4, Medidas5, Medidas6 } from '../_shared/MedidasGame';
import GeneradorPersonajes from '../generador-personajes/GeneradorPersonajes';
import BuscaElIntruso from '../busca-el-intruso/BuscaElIntruso.jsx';
import RoscoJuego from '../rosco/RoscoJuego';
import OrdenaBolas from '@/apps/ordena-bolas/OrdenaBolas';
import Runner from '../_shared/Runner';
import VisualizadorFiguras3D from '../visualizador-figuras-3d/VisualizadorFiguras3D';
import ParejasDeCartas from '../parejas-de-cartas/ParejasDeCartas';
import LluviaDePalabras from '../lluvia-de-palabras/LluviaDePalabras';
import Clasificador from '../_shared/Clasificador';
import Snake from '../snake/SnakePalabras.jsx';
// ... imports existentes
import LenguaComprensionEscrita from '../comprension/ComprensionEscrita.jsx';
import LenguaComprensionOral from '../comprension/ComprensionOral.jsx';

import ExcavacionSelectiva from '../excavacion-selectiva/ExcavacionSelectiva.jsx';
import MesaCrafteo from '../mesa-crafteo/MesaCrafteo.jsx';
import EntrenadorTabla from '../entrenador-tabla/EntrenadorTabla.jsx';
import LaboratorioFunciones2D from '../laboratorio-funciones-2d/LaboratorioFunciones2D';
import RotacionesGrid from '../rotaciones-grid/RotacionesGrid';
import FraccionesESO from '../fracciones-eso/FraccionesESO';
import BancoRecursosTutoria from '../banco-recursos-tutoria/BancoRecursosTutoria';


// Apps Comunes
export const appLaboratorioFunciones2D = {
  id: 'laboratorio-funciones-2d',
  name: '📈 Laboratorio de Funciones 2D',
  description: 'Explora y visualiza funciones matemáticas en un plano cartesiano interactivo.',
  component: LaboratorioFunciones2D
};
export const appMesaCrafteo = {
  id: 'mesa-crafteo',
  name: '🧪 Mesa de Crafteo',
  description: 'Simula el crafteo de moléculas a partir de elementos químicos.',
  component: MesaCrafteo
};

export const appEntrenadorTabla = {
  id: 'entrenador-tabla',
  name: '🔬 Entrenador de Tabla Periódica',
  description: 'Aprende nombres, símbolos y números atómicos de forma divertida.',
  component: EntrenadorTabla
};

export const appIslaDeLaCalma = {
  id: 'isla-de-la-calma',
  name: '🏝️ Isla de la Calma',
  description: 'Un ejercicio de respiración guiada para encontrar la calma.',
  component: IslaDeLaCalma
};

export const appOrdenaLaFrase = {
  id: 'ordena-la-frase',
  name: '📝 Ordena la Frase',
  description: 'Arrastra las palabras para construir frases con sentido.',
  component: OrdenaLaFraseJuego
};

export const appOrdenaLaHistoria = {
  id: 'ordena-la-historia',
  name: '📚 Ordena la Historia',
  description: 'Pon en orden los eventos para reconstruir un relato.',
  component: OrdenaLaHistoriaJuego
};

export const appDetectiveDePalabras = {
  id: 'detective-de-palabras',
  name: '🕵️‍♂️ Detective de Palabras',
  description: 'Encuentra los espacios ocultos para separar las palabras de la frase.',
  component: DetectiveDePalabras
};

export const appGeneradorPersonajes = {
  id: 'generador-personajes-historicos',
  name: '✨ Generador de personajes históricos',
  description: 'Genera personajes históricos aleatorios con filtros por sexo y categoría.',
  component: GeneradorPersonajes
};

export const appBuscaElIntruso = {
  id: 'busca-el-intruso',
  name: '🔎 Busca el Intruso',
  description: 'Encuentra el concepto que no encaja con los demás.',
  component: BuscaElIntruso
};

export const appRosco = {
  id: 'rosco-del-saber',
  name: '🅿️ Pasapalabra',
  description: 'Adivina la palabra que se esconde detrás de cada letra.',
  component: RoscoJuego
};

export const appOrdenaBolas = {
  id: 'ordena-bolas',
  name: '🔴 Ordena las Bolas',
  description: 'Juego de física. Pulsa las bolas de menor a mayor peso.',
  component: OrdenaBolas
};

export const appRunner = {
  id: 'runner',
  name: '🟨 Education Dash',
  description: 'Corre, salta y atrapa los elementos correctos.',
  component: Runner
};

export const appVisualizador3D = {
  id: 'visualizador-3d',
  name: '🧊 Laboratorio de Figuras 3D',
  description: 'Explora, rota y analiza las principales figuras geométricas en 3D.',
  component: VisualizadorFiguras3D
};

export const appLluviaDePalabras = {
  id: 'lluvia-de-palabras',
  name: '🌧️ Lluvia de Palabras',
  description: 'Atrapa las palabras correctas que caen del cielo.',
  component: LluviaDePalabras
};

export const appParejas = {
  id: 'parejas',
  name: '🃏 Parejas de Cartas',
  description: 'Entrena tu memoria visual encontrando las parejas.',
  component: ParejasDeCartas
};

export const appClasificador = {
  id: 'clasificador',
  name: '🗂️ Clasificador',
  description: 'Clasifica los conceptos en su categoría correcta.',
  component: Clasificador
};

export const appSnake = {
  id: 'snake',
  name: '🐍 Snake',
  description: 'Guía a la serpiente para comer las palabras del tema correcto.',
  component: Snake

};

export const appComprensionEscrita = {
  id: 'comprension-escrita',
  name: '📖 Comprensión Escrita',
  description: 'Mejora tu comprensión escrita con textos y preguntas.',
  component: LenguaComprensionEscrita
};

export const appComprensionOral = {
  id: 'comprension-oral',
  name: '🎧 Comprensión Oral',
  description: 'Desarrolla tus habilidades de comprensión auditiva con ejercicios prácticos.',
  component: LenguaComprensionOral
};

export const appExcavacionSelectiva = {
  id: 'excavacion-selectiva',
  name: '⛏️ Excavación Selectiva',
  description: 'Aprende mientras excavas selectivamente.',
  component: ExcavacionSelectiva
};

// Apps de Matemáticas compartidas (Romanos, MayorMenor, Medidas)
export const appNumerosRomanos3 = { id: 'numeros-romanos-3', name: '🏛️ Números Romanos (Básico)', description: 'Aprende los números romanos del 1 al 20.', component: NumerosRomanos3 };
export const appNumerosRomanos4 = { id: 'numeros-romanos-4', name: '🏛️ Números Romanos (Intermedio)', description: 'Practica números romanos hasta el 100.', component: NumerosRomanos4 };
export const appNumerosRomanos5 = { id: 'numeros-romanos-5', name: '🏛️ Números Romanos (Avanzado)', description: 'Domina los números romanos hasta el 3999.', component: NumerosRomanos5 };
export const appNumerosRomanos6 = { id: 'numeros-romanos-6', name: '🏛️ Números Romanos (Experto)', description: 'Aprende los números romanos hasta 1.000.000 con la raya horizontal.', component: NumerosRomanos6 };
export const appNumerosRomanosESO = { id: 'numeros-romanos-eso', name: '🏛️ Números Romanos (ESO)', description: 'Domina los números romanos hasta 1.000.000 con la raya horizontal.', component: NumerosRomanosESO };

export const appMayorMenor1 = { id: 'mayor-menor-1', name: '⚖️ Mayor, Menor o Igual', description: 'Aprende a comparar números del 1 al 20.', component: MayorMenor1 };
export const appMayorMenor2 = { id: 'mayor-menor-2', name: '⚖️ Comparar Números', description: 'Compara números hasta el 100 y sumas sencillas.', component: MayorMenor2 };
export const appMayorMenor3 = { id: 'mayor-menor-3', name: '⚖️ Comparar Multiplicaciones', description: 'Compara resultados de tablas de multiplicar.', component: MayorMenor3 };
export const appMayorMenor4 = { id: 'mayor-menor-4', name: '⚖️ Comparar Operaciones', description: '¿Qué resultado es mayor? Operaciones combinadas.', component: MayorMenor4 };
export const appMayorMenor5 = { id: 'mayor-menor-5', name: '⚖️ Comparar Decimales', description: 'Trabaja con números mayores y decimales.', component: MayorMenor5 };
export const appMayorMenor6 = { id: 'mayor-menor-6', name: '⚖️ Reto de Comparación', description: 'Expresiones matemáticas complejas.', component: MayorMenor6 };

export const appMedidas1 = { id: 'medidas-1', name: '📏 Medidas: Iniciación', description: 'Aprende a comparar medidas básicas de longitud, peso y capacidad.', component: Medidas1 };
export const appMedidas2 = { id: 'medidas-2', name: '📏 Medidas: Unidades Básicas', description: 'Practica con las unidades principales: metros, litros y gramos.', component: Medidas2 };
export const appMedidas3 = { id: 'medidas-3', name: '📏 Medidas: Conversión Simple', description: 'Empieza a convertir unidades de longitud, masa y capacidad.', component: Medidas3 };
export const appMedidas4 = { id: 'medidas-4', name: '📏 Medidas: Sistema Completo', description: 'Domina la escalera de unidades de todas las magnitudes.', component: Medidas4 };
export const appMedidas5 = { id: 'medidas-5', name: '📏 Medidas: Expresiones Complejas', description: 'Trabaja con medidas compuestas en cualquier magnitud (ej. 1kg 200g).', component: Medidas5 };
export const appMedidas6 = { id: 'medidas-6', name: '📏 Medidas: Reto Experto', description: 'Enfréntate a conversiones difíciles y números grandes en las 3 magnitudes.', component: Medidas6 };


// --- NUEVAS EXPORTACIONES DE APPS DE PRIMARIA ---

// Sumas
export const appSumasPrimaria1 = { id: 'sumas-primaria-1', name: '➕ Sumas sin llevadas', description: 'Aprende a sumar números de dos cifras.', component: SumasPrimaria1 };
export const appSumasPrimaria2 = { id: 'sumas-primaria-2-drag', name: '➕ Sumas con llevadas', description: 'Resuelve sumas de dos cifras.', component: SumasPrimaria2 };
export const appSumasPrimaria3 = { id: 'sumas-primaria-3-drag', name: '➕ Sumas con llevadas', description: 'Sumas de 3 y 4 cifras.', component: SumasPrimaria3 };
export const appSumasPrimaria4 = { id: 'sumas-primaria-4-drag', name: '➕ Sumas triples', description: 'Sumas complejas.', component: SumasPrimaria4 };
export const appSumasPrimaria5 = { id: 'sumas-primaria-5-drag', name: '➕ Sumas con decimales', description: 'Sumas con decimales.', component: SumasPrimaria5 };
export const appSumasPrimaria6 = { id: 'sumas-primaria-6-drag', name: '➕ Sumas triples con Decimales', description: 'Sumas avanzadas.', component: SumasPrimaria6 };

// Restas
export const appRestasPrimaria1 = { id: 'restas-primaria-1', name: '➖ Restas sin llevadas', description: 'Restas de 2 cifras sin llevadas', component: RestasPrimaria1 };
export const appRestasPrimaria2 = { id: 'restas-primaria-2', name: '➖ Restas con llevadas', description: 'Restas de 2 cifras con llevadas', component: RestasPrimaria2 };
export const appRestasPrimaria3 = { id: 'restas-primaria-3', name: '➖ Restas con llevadas', description: 'Restas de 3 y 4 cifras.', component: RestasPrimaria3 };
export const appRestasPrimaria4 = { id: 'restas-primaria-4', name: '➖ Restas con decimal', description: 'Introducción a decimales.', component: RestasPrimaria4 };
export const appRestasPrimaria5 = { id: 'restas-primaria-5', name: '➖ Restas con decimales', description: 'Restas complejas.', component: RestasPrimaria5 };
export const appRestasPrimaria6 = { id: 'restas-primaria-6', name: '➖ Restas a completar', description: 'Completa la resta.', component: RestasPrimaria6 };

// Multiplicaciones
export const appMultiplicacionesPrimaria3 = { id: 'multiplicaciones-primaria-3', name: '✖️ Multiplicaciones', description: 'Multiplicador de 1 cifra.', component: MultiplicacionesPrimaria3 };
export const appMultiplicacionesPrimaria4 = { id: 'multiplicaciones-primaria-4', name: '✖️ Multiplicaciones', description: 'Varias cifras.', component: MultiplicacionesPrimaria4 };
export const appMultiplicacionesPrimaria5 = { id: 'multiplicaciones-primaria-5', name: '✖️ Multiplicaciones', description: 'Varios dígitos.', component: MultiplicacionesPrimaria5 };
export const appMultiplicacionesPrimaria6 = { id: 'multiplicaciones-primaria-6', name: '✖️ Multiplicaciones', description: 'Con decimales.', component: MultiplicacionesPrimaria6 };

// Divisiones
export const appDivisionesPrimaria4 = { id: 'divisiones-primaria-4', name: '➗ Divisiones', description: 'Iniciación a la división.', component: DivisionesPrimaria4 };
export const appDivisionesPrimaria5 = { id: 'divisiones-primaria-5', name: '➗ Divisiones', description: 'Divisores de 2 y 3 cifras.', component: DivisionesPrimaria5 };
export const appDivisionesPrimaria6 = { id: 'divisiones-primaria-6', name: '➗ Divisiones', description: 'Con decimales.', component: DivisionesPrimaria6 };

// Supermercado
export const appSupermercadoMatematico1 = { id: 'supermercado-matematico-1', name: '🛒 Supermercado Matemático', description: 'Resuelve sumas sencillas.', component: SupermercadoMatematico1 };
export const appSupermercadoMatematico2 = { id: 'supermercado-matematico-2', name: '🛒 Supermercado Matemático', description: 'Suma precios con llevadas.', component: SupermercadoMatematico2 };
export const appSupermercadoMatematico3 = { id: 'supermercado-matematico-3', name: '🛒 Supermercado Matemático', description: 'Multiplicaciones.', component: SupermercadoMatematico3 };
export const appSupermercadoMatematico4 = { id: 'supermercado-matematico-4', name: '🛒 Supermercado Matemático', description: 'Decimales.', component: SupermercadoMatematico4 };
export const appSupermercadoMatematico5 = { id: 'supermercado-matematico-5', name: '🛒 Supermercado Matemático', description: 'Calcula el cambio.', component: SupermercadoMatematico5 };
export const appSupermercadoMatematico6 = { id: 'supermercado-matematico-6', name: '🛒 Supermercado Matemático', description: 'Descuentos.', component: SupermercadoMatematico6 };

import TerminalRetro from '../terminal-retro/TerminalRetro';
export const appTerminalRetro = {
  id: 'terminal-retro',
  name: '📟 Terminal de Hackeo',
  description: 'Hackea el sistema introduciendo los comandos correctos en la consola.',
  component: TerminalRetro
};

import ProgramacionBloques from '../programacion-bloques/ProgramacionBloques';
export const appProgramacionBloques = {
  id: 'programacion-bloques-windows',
  name: '💾 Programación Visual 3.1',
  description: 'Ordena los bloques de código en un entorno clásico de ventanas.',
  component: ProgramacionBloques
};

export const appBancoRecursosTutoria = {
  id: 'banco-recursos-tutoria',
  name: '🎓 Banco de Recursos Tutoriales',
  description: 'Dossier completo de dinámicas y recursos para la acción tutorial.',
  component: BancoRecursosTutoria
};

export const appRotacionesGrid = {
  id: 'rotaciones-grid',
  name: '🔄 Giros y Rotaciones',
  description: 'Dibuja las figuras resultantes de aplicar rotaciones sobre una cuadrícula.',
  component: RotacionesGrid
};

import SistemaSolar from '../sistema-solar/SistemaSolar';

export const appSistemaSolar = {
  id: 'sistema-solar',
  name: '🌌 Sistema Solar 3D',
  description: 'Explora y aprende sobre los planetas de nuestro sistema solar en 3D.',
  component: SistemaSolar
};

export const appFraccionesESO = {
  id: 'fracciones-eso',
  name: '🧮 Fracciones PRO',
  description: 'Domina las sumas, restas, multiplicaciones, m.c.m. y M.C.D. de fracciones.',
  component: FraccionesESO
};

import CelulaAnimal from '../celula-animal/CelulaAnimal';

export const appCelulaAnimal = {
  id: 'celula-animal',
  name: '🔬 La Célula Animal',
  description: 'Explora la célula animal en detalle: orgánulos, funciones y curiosidades.',
  component: CelulaAnimal
};

import CelulaVegetal from '../celula-vegetal/CelulaVegetal';

export const appCelulaVegetal = {
  id: 'celula-vegetal',
  name: '🌿 La Célula Vegetal',
  description: 'Descubre las partes de la célula vegetal, la fotosíntesis y la pared celular.',
  component: CelulaVegetal
};


