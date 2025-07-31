// src/apps/appList.js
import SupermercadoMatematico1 from './supermercado-matematico/primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from './supermercado-matematico/primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from './supermercado-matematico/primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from './supermercado-matematico/primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from './supermercado-matematico/primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from './supermercado-matematico/primaria-6/SupermercadoMatematico6';
import IslaDeLaCalma from './isla-de-la-calma/IslaDeLaCalma';
import OrdenaLaFraseJuego from './_shared/OrdenaLaFraseJuego';
import OrdenaLaHistoriaJuego from './_shared/OrdenaLaHistoriaJuego';
import materiasData from '../data/materias.json';

// APPS COMUNES
const appIslaDeLaCalma = { id: 'isla-de-la-calma', name: 'Isla de la Calma', description: 'Un ejercicio de respiración guiada para encontrar la calma.', component: IslaDeLaCalma };
const appOrdenaLaFrase = { id: 'ordena-la-frase', name: 'Ordena la Frase', description: 'Arrastra las palabras para construir frases con sentido.', component: OrdenaLaFraseJuego };
const appOrdenaLaHistoria = { id: 'ordena-la-historia', name: 'Ordena la Historia', description: 'Pon en orden los eventos para reconstruir un relato.', component: OrdenaLaHistoriaJuego };

// APPS DE PRIMARIA
export const primariaApps = {
    '1': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', component: SupermercadoMatematico1 }],
    '2': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', component: SupermercadoMatematico2 }],
    '3': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', component: SupermercadoMatematico3 }],
    '4': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', component: SupermercadoMatematico4 }],
    '5': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', component: SupermercadoMatematico5 }],
    '6': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', component: SupermercadoMatematico6 }],
};

// ASIGNATURAS Y APPS DE LA ESO
export const esoSubjects = materiasData.eso;

export const esoApps = {
    '1': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'biologia': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'musica': [appOrdenaLaFrase], 'plastica': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] },
    '2': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'musica': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] },
    '3': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'biologia': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] },
    '4': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'biologia': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'latin': [appOrdenaLaFrase], 'economia': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] }
};

// FUNCIÓN DE BÚSQUEDA CORREGIDA
export const findAppById = (level, grade, appId, subjectId = 'general') => {
    let appCollection;
    if (level === 'primaria') {
        appCollection = primariaApps[grade] || [];
    } else if (level === 'eso') {
        appCollection = esoApps[grade]?.[subjectId] || [];
    } else {
        return null;
    }
    const foundApp = appCollection.find(app => app.id === appId);
    if (foundApp) {
        return { app: foundApp, level, grade, subjectId };
    }
    return null;
};