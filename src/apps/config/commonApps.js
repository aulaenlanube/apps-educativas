// src/apps/config/commonApps.js
// Lazy-loaded app components — each app is loaded on-demand when the user navigates to it.
import { lazy } from 'react';

// Supermercado
const SupermercadoMatematico1 = lazy(() => import('../supermercado-matematico/primaria-1/SupermercadoMatematico1'));
const SupermercadoMatematico2 = lazy(() => import('../supermercado-matematico/primaria-2/SupermercadoMatematico2'));
const SupermercadoMatematico3 = lazy(() => import('../supermercado-matematico/primaria-3/SupermercadoMatematico3'));
const SupermercadoMatematico4 = lazy(() => import('../supermercado-matematico/primaria-4/SupermercadoMatematico4'));
const SupermercadoMatematico5 = lazy(() => import('../supermercado-matematico/primaria-5/SupermercadoMatematico5'));
const SupermercadoMatematico6 = lazy(() => import('../supermercado-matematico/primaria-6/SupermercadoMatematico6'));

// Sumas
const SumasPrimaria1 = lazy(() => import('../sumas/primaria-1/SumasPrimaria1'));
const SumasPrimaria2 = lazy(() => import('../sumas/primaria-2/SumasPrimaria2'));
const SumasPrimaria3 = lazy(() => import('../sumas/primaria-3/SumasPrimaria3'));
const SumasPrimaria4 = lazy(() => import('../sumas/primaria-4/SumasPrimaria4'));
const SumasPrimaria5 = lazy(() => import('../sumas/primaria-5/SumasPrimaria5'));
const SumasPrimaria6 = lazy(() => import('../sumas/primaria-6/SumasPrimaria6'));

// Restas
const RestasPrimaria1 = lazy(() => import('../restas/primaria-1/RestasPrimaria1'));
const RestasPrimaria2 = lazy(() => import('../restas/primaria-2/RestasPrimaria2'));
const RestasPrimaria3 = lazy(() => import('../restas/primaria-3/RestasPrimaria3'));
const RestasPrimaria4 = lazy(() => import('../restas/primaria-4/RestasPrimaria4'));
const RestasPrimaria5 = lazy(() => import('../restas/primaria-5/RestasPrimaria5'));
const RestasPrimaria6 = lazy(() => import('../restas/primaria-6/RestasPrimaria6'));

// Multiplicaciones
const MultiplicacionesPrimaria3 = lazy(() => import('../multiplicaciones/primaria-3/MultiplicacionesPrimaria3'));
const MultiplicacionesPrimaria4 = lazy(() => import('../multiplicaciones/primaria-4/MultiplicacionesPrimaria4'));
const MultiplicacionesPrimaria5 = lazy(() => import('../multiplicaciones/primaria-5/MultiplicacionesPrimaria5'));
const MultiplicacionesPrimaria6 = lazy(() => import('../multiplicaciones/primaria-6/MultiplicacionesPrimaria6'));

// Divisiones
const DivisionesPrimaria4 = lazy(() => import('../divisiones/primaria-4/DivisionesPrimaria4'));
const DivisionesPrimaria5 = lazy(() => import('../divisiones/primaria-5/DivisionesPrimaria5'));
const DivisionesPrimaria6 = lazy(() => import('../divisiones/primaria-6/DivisionesPrimaria6'));

// Apps individuales
const IslaDeLaCalma = lazy(() => import('../isla-de-la-calma/IslaDeLaCalma'));
const OrdenaLaFraseJuego = lazy(() => import('../_shared/OrdenaLaFraseJuego'));
const OrdenaLaHistoriaJuego = lazy(() => import('../_shared/OrdenaLaHistoriaJuego'));
const DetectiveDePalabras = lazy(() => import('@/apps/_shared/DetectiveDePalabrasJuego'));

// Numeros Romanos - named exports need wrapper
const NumerosRomanos3 = lazy(() => import('../_shared/NumerosRomanosGame').then(m => ({ default: m.NumerosRomanos3 })));
const NumerosRomanos4 = lazy(() => import('../_shared/NumerosRomanosGame').then(m => ({ default: m.NumerosRomanos4 })));
const NumerosRomanos5 = lazy(() => import('../_shared/NumerosRomanosGame').then(m => ({ default: m.NumerosRomanos5 })));
const NumerosRomanos6 = lazy(() => import('../_shared/NumerosRomanosGame').then(m => ({ default: m.NumerosRomanos6 })));
const NumerosRomanosESO = lazy(() => import('../_shared/NumerosRomanosGame').then(m => ({ default: m.NumerosRomanosESO })));

// Mayor Menor
const MayorMenor1 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.MayorMenor1 })));
const MayorMenor2 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.MayorMenor2 })));
const MayorMenor3 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.MayorMenor3 })));
const MayorMenor4 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.MayorMenor4 })));
const MayorMenor5 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.MayorMenor5 })));
const MayorMenor6 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.MayorMenor6 })));

// Ordena Numeros (mismo motor, fixedMode ordenar)
const OrdenaNumeros1 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.OrdenaNumeros1 })));
const OrdenaNumeros2 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.OrdenaNumeros2 })));
const OrdenaNumeros3 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.OrdenaNumeros3 })));
const OrdenaNumeros4 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.OrdenaNumeros4 })));
const OrdenaNumeros5 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.OrdenaNumeros5 })));
const OrdenaNumeros6 = lazy(() => import('../_shared/MayorMenorGame').then(m => ({ default: m.OrdenaNumeros6 })));

// Medidas
const Medidas1 = lazy(() => import('../_shared/MedidasGame').then(m => ({ default: m.Medidas1 })));
const Medidas2 = lazy(() => import('../_shared/MedidasGame').then(m => ({ default: m.Medidas2 })));
const Medidas3 = lazy(() => import('../_shared/MedidasGame').then(m => ({ default: m.Medidas3 })));
const Medidas4 = lazy(() => import('../_shared/MedidasGame').then(m => ({ default: m.Medidas4 })));
const Medidas5 = lazy(() => import('../_shared/MedidasGame').then(m => ({ default: m.Medidas5 })));
const Medidas6 = lazy(() => import('../_shared/MedidasGame').then(m => ({ default: m.Medidas6 })));

const GeneradorPersonajes = lazy(() => import('../generador-personajes/GeneradorPersonajes'));
const BuscaElIntruso = lazy(() => import('../busca-el-intruso/BuscaElIntruso.jsx'));
const RoscoJuego = lazy(() => import('../rosco/RoscoJuego'));
const OrdenaBolas = lazy(() => import('@/apps/ordena-bolas/OrdenaBolas'));
const Runner = lazy(() => import('../_shared/Runner'));
const NavePalabras = lazy(() => import('../nave-palabras/NavePalabras'));
const VisualizadorFiguras3D = lazy(() => import('../visualizador-figuras-3d/VisualizadorFiguras3D'));
const ParejasDeCartas = lazy(() => import('../parejas-de-cartas/ParejasDeCartas'));
const LluviaDePalabras = lazy(() => import('../lluvia-de-palabras/LluviaDePalabras'));
const Clasificador = lazy(() => import('../_shared/Clasificador'));
const Snake = lazy(() => import('../snake/SnakePalabras.jsx'));
const LenguaComprensionEscrita = lazy(() => import('../comprension/ComprensionEscrita.jsx'));
const LenguaComprensionOral = lazy(() => import('../comprension/ComprensionOral.jsx'));
const ExcavacionSelectiva = lazy(() => import('../excavacion-selectiva/ExcavacionSelectiva.jsx'));
const MesaCrafteo = lazy(() => import('../mesa-crafteo/MesaCrafteo.jsx'));
const EntrenadorTabla = lazy(() => import('../entrenador-tabla/EntrenadorTabla.jsx'));
const LaboratorioFunciones2D = lazy(() => import('../laboratorio-funciones-2d/LaboratorioFunciones2D'));
const RotacionesGrid = lazy(() => import('../rotaciones-grid/RotacionesGrid'));
const FraccionesESO = lazy(() => import('../fracciones-eso/FraccionesESO'));
const BancoRecursosTutoria = lazy(() => import('../banco-recursos-tutoria/BancoRecursosTutoria'));
const TerminalRetro = lazy(() => import('../terminal-retro/TerminalRetro'));
const ProgramacionBloques = lazy(() => import('../programacion-bloques/ProgramacionBloques'));
const LaboratorioRobotica = lazy(() => import('../laboratorio-robotica/LaboratorioRobotica'));
const MisionesRoboticas = lazy(() => import('../misiones-roboticas/MisionesRoboticas'));
const SistemaSolar = lazy(() => import('../sistema-solar/SistemaSolar'));
const CelulaAnimal = lazy(() => import('../celula-animal/CelulaAnimal'));
const CelulaVegetal = lazy(() => import('../celula-vegetal/CelulaVegetal'));
const JuegoMemoria = lazy(() => import('../juego-memoria/JuegoMemoria'));
const Ahorcado = lazy(() => import('../ahorcado/Ahorcado'));
const Crucigrama = lazy(() => import('../crucigrama/Crucigrama'));
const SopaDeLetras = lazy(() => import('../sopa-de-letras/SopaDeLetras'));
const Millonario = lazy(() => import('../millonario/Millonario'));
const Anagramas = lazy(() => import('../anagramas/Anagramas'));
const Criptograma = lazy(() => import('../criptograma/Criptograma'));
const VelocidadRespuesta = lazy(() => import('../velocidad-respuesta/VelocidadRespuesta'));
const ConectaParejas = lazy(() => import('../conecta-parejas/ConectaParejas'));
const DictadoInteractivo = lazy(() => import('../dictado-interactivo/DictadoInteractivo'));
const TorrePalabras = lazy(() => import('../torre-palabras/TorrePalabras'));


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
  name: '🅿️ El Rosco del Saber',
  description: 'Adivina la palabra que se esconde detrás de cada letra.',
  component: RoscoJuego,
  duel: { supported: true, bestOf: 1, mode: 'turn-based' }
};

export const appOrdenaBolas = {
  id: 'ordena-bolas',
  name: '🔴 Ordena las Bolas',
  description: 'Juego de física. Pulsa las bolas de menor a mayor peso.',
  component: OrdenaBolas,
  duel: { supported: true, bestOf: 1, mode: 'shared-board' }
};

export const appRunner = {
  id: 'runner',
  name: '🟨 Education Dash',
  description: 'Corre, salta y atrapa los elementos correctos.',
  component: Runner
};

export const appNavePalabras = {
  id: 'nave-palabras',
  name: '🚀 Nave Palabras',
  description: 'Pilota tu nave y dispara a las palabras de la categoría. 60 segundos. Incluye modo duelo.',
  component: NavePalabras,
  duel: { supported: true, bestOf: 1, mode: 'arena' }
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
  component: Snake,
  duel: { supported: true, bestOf: 5, mode: 'shared-board' }
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
export const appMayorMenor5 = { id: 'mayor-menor-5', name: '⚖️ Comparar Decimales', description: 'Compara números decimales con precisión.', component: MayorMenor5 };
export const appMayorMenor6 = { id: 'mayor-menor-6', name: '⚖️ Reto de Comparación', description: 'Expresiones matemáticas complejas.', component: MayorMenor6 };

export const appOrdenaNumeros1 = { id: 'ordena-numeros-1', name: '🔢 Ordena los Números', description: 'Ordena de menor a mayor hasta el 20.', component: OrdenaNumeros1 };
export const appOrdenaNumeros2 = { id: 'ordena-numeros-2', name: '🔢 Ordena hasta 100', description: 'Ordena números y sumas hasta el 100.', component: OrdenaNumeros2 };
export const appOrdenaNumeros3 = { id: 'ordena-numeros-3', name: '🔢 Ordena Multiplicaciones', description: 'Ordena resultados de las tablas de multiplicar.', component: OrdenaNumeros3 };
export const appOrdenaNumeros4 = { id: 'ordena-numeros-4', name: '🔢 Ordena Operaciones', description: 'Ordena operaciones combinadas de menor a mayor.', component: OrdenaNumeros4 };
export const appOrdenaNumeros5 = { id: 'ordena-numeros-5', name: '🔢 Ordena Decimales', description: 'Ordena números decimales de menor a mayor.', component: OrdenaNumeros5 };
export const appOrdenaNumeros6 = { id: 'ordena-numeros-6', name: '🔢 Reto de Ordenación', description: 'Ordena expresiones matemáticas complejas.', component: OrdenaNumeros6 };

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
export const appTerminalRetro = {
  id: 'terminal-retro',
  name: '📟 Terminal de Hackeo',
  description: 'Hackea el sistema introduciendo los comandos correctos en la consola.',
  component: TerminalRetro
};
export const appProgramacionBloques = {
  id: 'programacion-bloques',
  name: '🤖 Programa al Robot',
  description: 'Editor de bloques con variables, bucles, condiciones y funciones. Ve tu programa en Python, Java y C.',
  component: ProgramacionBloques
};

export const appLaboratorioRobotica = {
  id: 'laboratorio-robotica',
  name: '🤖 Laboratorio de Robótica',
  description: 'Monta circuitos electrónicos y proyectos con Arduino conectando cables. 5 ejercicios por curso con 3 modos de dificultad.',
  component: LaboratorioRobotica
};

export const appMisionesRoboticas = {
  id: 'misiones-roboticas',
  name: '🤖 Programa al Robot',
  description: 'Programa a un robot con bloques visuales tipo puzzle: movimientos, bucles, condicionales y sensores. 10 misiones por curso con 3 modos.',
  component: MisionesRoboticas
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

export const appCelulaAnimal = {
  id: 'celula-animal',
  name: '🔬 La Célula Animal',
  description: 'Explora la célula animal en detalle: orgánulos, funciones y curiosidades.',
  component: CelulaAnimal
};

export const appCelulaVegetal = {
  id: 'celula-vegetal',
  name: '🌿 La Célula Vegetal',
  description: 'Descubre las partes de la célula vegetal, la fotosíntesis y la pared celular.',
  component: CelulaVegetal
};

export const appJuegoMemoria = {
  id: 'juego-memoria',
  name: '🧠 Juego de Memoria',
  description: 'Memoriza las palabras y encuéntralas antes de que se acabe el tiempo.',
  component: JuegoMemoria
};

export const appAhorcado = {
  id: 'ahorcado',
  name: '🎯 Ahorcado',
  description: 'Adivina la palabra o la frase letra a letra antes de que se agoten las vidas.',
  component: Ahorcado,
  duel: { supported: true, bestOf: 5, mode: 'shared-word' }
};

export const appCrucigrama = {
  id: 'crucigrama',
  name: '🧩 Crucigrama',
  description: 'Completa el crucigrama con las palabras del vocabulario. Tres tamaños y modo examen.',
  component: Crucigrama
};

export const appSopaDeLetras = {
  id: 'sopa-de-letras',
  name: '🔍 Sopa de Letras',
  description: 'Encuentra las palabras ocultas en la sopa. Tres tamaños y modo examen con pistas.',
  component: SopaDeLetras
};

export const appMillonario = {
  id: 'millonario',
  name: '💰 Millonario',
  description: 'Tipo test con 4 opciones. Niveles fácil/medio/examen y comodines 50:50, público y cambio.',
  component: Millonario
};

export const appAnagramas = {
  id: 'anagramas',
  name: '🔀 Anagramas',
  description: 'Ordena las fichas de colores para formar la palabra correcta. Con rachas, multiplicadores y comodines.',
  component: Anagramas
};

export const appCriptograma = {
  id: 'criptograma',
  name: '🔐 Criptograma',
  description: 'Descifra la frase secreta adivinando qué letra se esconde tras cada número.',
  component: Criptograma
};

export const appVelocidadRespuesta = {
  id: 'velocidad-respuesta',
  name: '⚡ Velocidad',
  description: 'Lee la definición y escribe la respuesta antes de que se acabe el tiempo. Modo arcade.',
  component: VelocidadRespuesta
};

export const appConectaParejas = {
  id: 'conecta-parejas',
  name: '🧲 Conecta Parejas',
  description: 'Une cada palabra con su definición. Líneas de colores conectan los aciertos.',
  component: ConectaParejas
};

export const appDictadoInteractivo = {
  id: 'dictado-interactivo',
  name: '✍️ Dictado',
  description: 'Escribe la palabra o frase correcta evaluando letra a letra. Bonus por ortografía perfecta.',
  component: DictadoInteractivo
};

export const appTorrePalabras = {
  id: 'torre-palabras',
  name: '🏗️ Torre de Palabras',
  description: 'Clasifica cada palabra en su categoría para apilar bloques. ¡Construye la torre más alta!',
  component: TorrePalabras
};
