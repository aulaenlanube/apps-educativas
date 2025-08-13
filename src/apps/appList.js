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


import DetectiveDePalabras from '@/apps/detective-de-palabras/DetectiveDePalabras';

import SumasPrimaria1 from '@/apps/sumas/primaria-1/SumasPrimaria1';
import SumasPrimaria2 from '@/apps/sumas/primaria-2/SumasPrimaria2';
import SumasPrimaria3 from '/src/apps/sumas/primaria-3/SumasPrimaria3';
import SumasPrimaria4 from '/src/apps/sumas/primaria-4/SumasPrimaria4';
import SumasPrimaria5 from '/src/apps/sumas/primaria-5/SumasPrimaria5';

// CORRECCIÓN: Usar el alias de ruta '@' para una importación más robusta.
import materiasData from './../../public/data/materias.json';

// APPS COMUNES
const appIslaDeLaCalma = { id: 'isla-de-la-calma', name: 'Isla de la Calma', description: 'Un ejercicio de respiración guiada para encontrar la calma.', component: IslaDeLaCalma };
const appOrdenaLaFrase = { id: 'ordena-la-frase', name: 'Ordena la Frase', description: 'Arrastra las palabras para construir frases con sentido.', component: OrdenaLaFraseJuego };
const appOrdenaLaHistoria = { id: 'ordena-la-historia', name: 'Ordena la Historia', description: 'Pon en orden los eventos para reconstruir un relato.', component: OrdenaLaHistoriaJuego };

const appDetectiveDePalabras = {
  id: 'detective-de-palabras', // El ID ahora es genérico
  name: 'Detective de Palabras',
  description: 'Encuentra los espacios ocultos para separar las palabras de la frase.',
  component: DetectiveDePalabras // Siempre usamos el mismo componente
};


// APPS DE PRIMARIA
export const primariaApps = {
    '1': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, {
                id: 'sumas-primaria-1',
                name: 'Sumas sin Llevadas',
                description: 'Aprende a sumar números de dos cifras.',
                // Asocia el componente importado
                component: SumasPrimaria1 
            }, { ...appDetectiveDePalabras, id: 'detective-de-palabras-1', name: 'Detective de Palabras' }, { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }],
    '2': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, {
                id: 'sumas-primaria-2-drag',
                name: 'Sumas con Llevadas (2º)',
                description: 'Resuelve sumas de dos cifras con llevadas.',
                // Asocia el nuevo componente
                component: SumasPrimaria2
            }, { ...appDetectiveDePalabras, id: 'detective-de-palabras-2', name: 'Detective de Palabras' },{ id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 }],
    '3': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria,
        {
                id: 'sumas-primaria-3-drag',
                name: 'Sumas con Llevadas (3º)',
                description: 'Resuelve sumas de 3 y 4 cifras con llevadas.',
                // Asocia el nuevo componente
                component: SumasPrimaria3
            }, { ...appDetectiveDePalabras, id: 'detective-de-palabras-3', name: 'Detective de Palabras' },{ id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 }],
    '4': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, {
                id: 'sumas-primaria-4-drag',
                name: 'Sumas triples (4º)',
                description: 'Resuelve sumas triples de 3 y 4 cifras con llevadas.',
                // Asocia el nuevo componente
                component: SumasPrimaria4
            }, { ...appDetectiveDePalabras, id: 'detective-de-palabras-4', name: 'Detective de Palabras' },{ id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 }],
    '5': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, {
                id: 'sumas-primaria-5-drag',
                name: 'Sumas con Decimales (5º)',
                description: 'Resuelve sumas con decimales.',
                // Asocia el nuevo componente
                component: SumasPrimaria5
            }, { ...appDetectiveDePalabras, id: 'detective-de-palabras-5', name: 'Detective de Palabras' },{ id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 }],
    '6': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras-6', name: 'Detective de Palabras' },{ id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 }],
};

// ASIGNATURAS Y APPS DE LA ESO
export const esoSubjects = materiasData.eso;

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
    }
};


export const findAppById = (id, level, grade) => {
    if (level === 'primaria') {
        const gradeApps = primariaApps[grade] || [];
        const foundApp = gradeApps.find(app => app.id === id);
        if (foundApp) {
            return {
                app: foundApp,
                level: 'primaria',
                grade: grade
            };
        }
    }

    if (level === 'eso') {
        for (const subjectKey in esoApps[grade]) {
            const subjectApps = esoApps[grade][subjectKey] || [];
            const foundApp = subjectApps.find(app => app.id === id);
            if (foundApp) {
                return {
                    app: foundApp,
                    level: 'eso',
                    grade: grade,
                    subjectId: subjectKey
                };
            }
        }
    }

    return null; // Si no encuentra nada, devuelve null
};