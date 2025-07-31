// src/apps/appList.js
import SupermercadoMatematico1 from '@/apps/supermercado-primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '@/apps/supermercado-primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '@/apps/supermercado-primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '@/apps/supermercado-primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '@/apps/supermercado-primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '@/apps/supermercado-primaria-6/SupermercadoMatematico6';
import IslaDeLaCalma from '@/apps/isla-de-la-calma/IslaDeLaCalma';

// ¡IMPORTAMOS LOS NUEVOS COMPONENTES GENÉRICOS!
import OrdenaLaFraseJuego from '@/apps/_shared/OrdenaLaFraseJuego';
import OrdenaLaHistoriaJuego from '@/apps/_shared/OrdenaLaHistoriaJuego';

// --- APPS COMUNES ---
const appIslaDeLaCalma = {
  id: 'isla-de-la-calma', name: 'Isla de la Calma',
  description: 'Un ejercicio de respiración guiada para encontrar la calma.',
  component: IslaDeLaCalma
};

const appOrdenaLaFrase = {
    id: 'ordena-la-frase', name: 'Ordena la Frase',
    description: 'Arrastra las palabras para construir frases con sentido.',
    component: OrdenaLaFraseJuego
};

const appOrdenaLaHistoria = {
    id: 'ordena-la-historia', name: 'Ordena la Historia',
    description: 'Pon en orden los eventos para reconstruir un relato.',
    component: OrdenaLaHistoriaJuego
};

// --- APPS DE PRIMARIA ---
export const primariaApps = {
    '1': [ appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }],
    '2': [ appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 }],
    '3': [ appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 }],
    '4': [ appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 }],
    '5': [ appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 }],
    '6': [ appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 }],
};

// --- ASIGNATURAS Y APPS DE LA ESO ---
export { default as esoSubjects } from '@/data/materias.json';

export const esoApps = {
    '1': { 
        'lengua': [appOrdenaLaFrase], 
        'matematicas': [appOrdenaLaFrase], 
        'historia': [appOrdenaLaFrase], 
        'ingles': [appOrdenaLaFrase], 
        'biologia': [appOrdenaLaFrase], 
        'fisica': [appOrdenaLaFrase], 
        'musica': [appOrdenaLaFrase], 
        'plastica': [appOrdenaLaFrase], 
        'tecnologia': [appOrdenaLaFrase], 
        'ed-fisica': [appOrdenaLaFrase], 
        'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] 
    },
    // Cuando tengas contenido para más cursos, solo tienes que añadirlo aquí
    '2': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'musica': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] },
    '3': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'biologia': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] },
    '4': { 'lengua': [appOrdenaLaFrase], 'matematicas': [appOrdenaLaFrase], 'historia': [appOrdenaLaFrase], 'ingles': [appOrdenaLaFrase], 'ed-fisica': [appOrdenaLaFrase], 'biologia': [appOrdenaLaFrase], 'fisica': [appOrdenaLaFrase], 'latin': [appOrdenaLaFrase], 'economia': [appOrdenaLaFrase], 'tecnologia': [appOrdenaLaFrase], 'tutoria': [appIslaDeLaCalma, appOrdenaLaFrase] }
};

// --- FUNCIÓN PARA BUSCAR APPS (MODIFICADA) ---
// --- FUNCIÓN findAppById (CORREGIDA) ---
export const findAppById = (level, grade, subjectId, appId) => {
    let appCollection;

    if (level === 'primaria') {
        appCollection = primariaApps[grade] || [];
    } else if (level === 'eso') {
        // Para la ESO, necesitamos el subjectId para encontrar el array correcto de apps
        appCollection = esoApps[grade]?.[subjectId] || [];
    } else {
        return null; // Nivel no encontrado
    }

    const foundApp = appCollection.find(app => app.id === appId);

    if (foundApp) {
        return {
            app: foundApp,
            level,
            grade,
            // Nos aseguramos de tener siempre un subjectId, 'general' para primaria
            subjectId: subjectId || 'general'
        };
    }

    return null;
};