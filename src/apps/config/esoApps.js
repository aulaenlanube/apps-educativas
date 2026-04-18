// src/apps/config/esoApps.js
import materiasData from '../../../public/data/materias.json'; // Ajuste de ruta

// Importar apps comunes
import {
  appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, appDetectiveDePalabras,
  appGeneradorPersonajes, appJuegoMemoria, appBuscaElIntruso, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaBolas, appRunner,
  appVisualizador3D, appLluviaDePalabras, appParejas, appClasificador, appSnake, appComprensionEscrita, appComprensionOral,
  appExcavacionSelectiva, appMesaCrafteo, appEntrenadorTabla, appNumerosRomanosESO,
  appMayorMenor6, appOrdenaNumeros6, appMedidas6, appLaboratorioFunciones2D, appTerminalRetro, appProgramacionBloques, appBancoRecursosTutoria,
  appFraccionesESO, appSistemaSolar, appCelulaAnimal, appCelulaVegetal, appLaboratorioRobotica,
  appMisionesRoboticas
} from './commonApps';

export const esoSubjects = materiasData.eso;

export const esoApps = {
  '1': {
    'lengua': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appFraccionesESO,
      appLaboratorioFunciones2D, appMayorMenor6, appOrdenaNumeros6, appMedidas6, appNumerosRomanosESO,
      appJuegoMemoria, appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [appCelulaAnimal, appCelulaVegetal, appSistemaSolar,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appProgramacionBloques, appTerminalRetro, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'robotica': [appLaboratorioRobotica, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ia': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]

  },
  '2': {
    'lengua': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appLaboratorioFunciones2D, appMayorMenor6, appOrdenaNumeros6, appMedidas6, appNumerosRomanosESO,
      appJuegoMemoria, appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [appCelulaAnimal, appCelulaVegetal, appSistemaSolar,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appProgramacionBloques, appTerminalRetro, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'robotica': [appLaboratorioRobotica, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ia': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]

  },
  '3': {
    'lengua': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appLaboratorioFunciones2D, appMayorMenor6, appOrdenaNumeros6, appMedidas6, appNumerosRomanosESO,
      appJuegoMemoria, appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [appCelulaAnimal, appCelulaVegetal, appSistemaSolar,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appProgramacionBloques, appTerminalRetro, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'robotica': [appLaboratorioRobotica, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ia': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]

  },
  '4': {
    'lengua': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'matematicas': [
      appLaboratorioFunciones2D, appMayorMenor6, appOrdenaNumeros6, appMedidas6, appNumerosRomanosESO,
      appJuegoMemoria, appBuscaElIntruso, appVisualizador3D, appRunner, appExcavacionSelectiva, appOrdenaBolas, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'historia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ingles': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'ed-fisica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'biologia': [appCelulaAnimal, appCelulaVegetal, appSistemaSolar,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'fisica': [
      appMesaCrafteo, appEntrenadorTabla, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'latin': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'economia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tecnologia': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'musica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'plastica': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'tutoria': [
      appBancoRecursosTutoria, appIslaDeLaCalma, appGeneradorPersonajes,
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'valenciano': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'frances': [
      appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras,
      appDetectiveDePalabras,
      appClasificador, appSnake, appComprensionEscrita, appComprensionOral
    ],
    'programacion': [appProgramacionBloques, appTerminalRetro, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'robotica': [appLaboratorioRobotica, appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral],
    'ia': [appJuegoMemoria, appBuscaElIntruso, appRunner, appExcavacionSelectiva, appRosco, appAhorcado, appCrucigrama, appSopaDeLetras, appMillonario, appAnagramas, appCriptograma, appVelocidadRespuesta, appConectaParejas, appDictadoInteractivo, appTorrePalabras, appOrdenaLaFrase, appOrdenaLaHistoria, appParejas, appLluviaDePalabras, appClasificador, appSnake, appComprensionEscrita, appComprensionOral]

  }
};