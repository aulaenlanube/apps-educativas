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
    '1': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras', name: 'Detective de Palabras (Nivel 1)' }, { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', component: SupermercadoMatematico1 }],
    '2': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras', name: 'Detective de Palabras (Nivel 2)' },{ id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', component: SupermercadoMatematico2 }],
    '3': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras', name: 'Detective de Palabras (Nivel 3)' },{ id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', component: SupermercadoMatematico3 }],
    '4': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras', name: 'Detective de Palabras (Nivel 4)' },{ id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', component: SupermercadoMatematico4 }],
    '5': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras', name: 'Detective de Palabras (Nivel 5)' },{ id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', component: SupermercadoMatematico5 }],
    '6': [appIslaDeLaCalma, appOrdenaLaFrase, appOrdenaLaHistoria, { ...appDetectiveDePalabras, id: 'detective-de-palabras', name: 'Detective de Palabras (Nivel 6)' },{ id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', component: SupermercadoMatematico6 }],
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