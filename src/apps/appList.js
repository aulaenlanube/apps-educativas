// src/apps/appList.js
import SupermercadoMatematico1 from '@/apps/supermercado-primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '@/apps/supermercado-primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '@/apps/supermercado-primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '@/apps/supermercado-primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '@/apps/supermercado-primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '@/apps/supermercado-primaria-6/SupermercadoMatematico6';
import OrdenaLaFrase1 from '@/apps/ordena-la-frase-primaria-1/OrdenaLaFrase1';
import OrdenaLaFrase2 from '@/apps/ordena-la-frase-primaria-2/OrdenaLaFrase2';
import OrdenaLaFrase3 from '@/apps/ordena-la-frase-primaria-3/OrdenaLaFrase3';
import OrdenaLaFrase4 from '@/apps/ordena-la-frase-primaria-4/OrdenaLaFrase4';
import OrdenaLaFrase5 from '@/apps/ordena-la-frase-primaria-5/OrdenaLaFrase5';
import OrdenaLaFrase6 from '@/apps/ordena-la-frase-primaria-6/OrdenaLaFrase6';
import OrdenaLaHistoria1 from '@/apps/ordena-la-historia-primaria-1/OrdenaLaHistoria1';
import OrdenaLaHistoria2 from '@/apps/ordena-la-historia-primaria-2/OrdenaLaHistoria2';
import OrdenaLaHistoria3 from '@/apps/ordena-la-historia-primaria-3/OrdenaLaHistoria3';
import OrdenaLaHistoria4 from '@/apps/ordena-la-historia-primaria-4/OrdenaLaHistoria4';
import OrdenaLaHistoria5 from '@/apps/ordena-la-historia-primaria-5/OrdenaLaHistoria5';
import OrdenaLaHistoria6 from '@/apps/ordena-la-historia-primaria-6/OrdenaLaHistoria6';
import IslaDeLaCalma from '@/apps/isla-de-la-calma/IslaDeLaCalma';
import OrdenaLaFraseEso1Castellano from '@/apps/ordena-la-frase-eso-1-castellano/OrdenaLaFraseEso1Castellano';
import OrdenaLaFraseEso1Historia from '@/apps/ordena-la-frase-eso-1-historia/OrdenaLaFraseEso1Historia';
import OrdenaLaFraseEso1Ingles from '@/apps/ordena-la-frase-eso-1-ingles/OrdenaLaFraseEso1Ingles';
import OrdenaLaFraseEso1Biologia from '@/apps/ordena-la-frase-eso-1-biologia/OrdenaLaFraseEso1Biologia';
import OrdenaLaFraseEso1Fisica from '@/apps/ordena-la-frase-eso-1-fisica/OrdenaLaFraseEso1Fisica';
import OrdenaLaFraseEso1Mates from '@/apps/ordena-la-frase-eso-1-mates/OrdenaLaFraseEso1Mates';
import OrdenaLaFraseEso1Musica from '@/apps/ordena-la-frase-eso-1-musica/OrdenaLaFraseEso1Musica';
import OrdenaLaFraseEso1Plastica from '@/apps/ordena-la-frase-eso-1-plastica/OrdenaLaFraseEso1Plastica';
import OrdenaLaFraseEso1Tecnologia from '@/apps/ordena-la-frase-eso-1-tecnologia/OrdenaLaFraseEso1Tecnologia';
import OrdenaLaFraseEso1EF from '@/apps/ordena-la-frase-eso-1-ef/OrdenaLaFraseEso1EF';
import OrdenaLaFraseEso1Tutoria from '@/apps/ordena-la-frase-eso-1-tutoria/OrdenaLaFraseEso1Tutoria';

const appIslaDeLaCalma = {
  id: 'isla-de-la-calma', name: 'Isla de la Calma',
  description: 'Un ejercicio de respiración guiada para encontrar la calma.',
  component: IslaDeLaCalma
};

const appOrdenaLaFraseEso1Castellano = {
  id: 'ordena-la-frase-eso-1-castellano', name: 'Ordena la Frase (Lengua)',
  description: 'Construye frases sobre conceptos de Lengua Castellana y Literatura.',
  component: OrdenaLaFraseEso1Castellano
};

const appOrdenaLaFraseEso1Historia = {
  id: 'ordena-la-frase-eso-1-historia', name: 'Ordena la Frase (Historia)',
  description: 'Construye frases sobre conceptos de Geografía e Historia.',
  component: OrdenaLaFraseEso1Historia
};

const appOrdenaLaFraseEso1Ingles = {
  id: 'ordena-la-frase-eso-1-ingles', name: 'Order the Sentence (English)',
  description: 'Build sentences to practice English grammar and vocabulary.',
  component: OrdenaLaFraseEso1Ingles
};

const appOrdenaLaFraseEso1Biologia = {
  id: 'ordena-la-frase-eso-1-biologia', name: 'Ordena la Frase (Biología)',
  description: 'Construye frases sobre conceptos de Biología y Geología.',
  component: OrdenaLaFraseEso1Biologia
};

const appOrdenaLaFraseEso1Fisica = {
  id: 'ordena-la-frase-eso-1-fisica', name: 'Ordena la Frase (Física)',
  description: 'Construye frases sobre conceptos de Física y Química.',
  component: OrdenaLaFraseEso1Fisica
};

const appOrdenaLaFraseEso1Mates = {
  id: 'ordena-la-frase-eso-1-mates', name: 'Ordena la Frase (Mates)',
  description: 'Construye frases sobre conceptos de Matemáticas.',
  component: OrdenaLaFraseEso1Mates
};

const appOrdenaLaFraseEso1Musica = {
  id: 'ordena-la-frase-eso-1-musica', name: 'Ordena la Frase (Música)',
  description: 'Construye frases sobre conceptos de Música.',
  component: OrdenaLaFraseEso1Musica
};

const appOrdenaLaFraseEso1Plastica = {
  id: 'ordena-la-frase-eso-1-plastica', name: 'Ordena la Frase (Plástica)',
  description: 'Construye frases sobre conceptos de Educación Plástica.',
  component: OrdenaLaFraseEso1Plastica
};

const appOrdenaLaFraseEso1Tecnologia = {
  id: 'ordena-la-frase-eso-1-tecnologia', name: 'Ordena la Frase (Tecnología)',
  description: 'Construye frases sobre conceptos de Tecnología.',
  component: OrdenaLaFraseEso1Tecnologia
};

const appOrdenaLaFraseEso1EF = {
  id: 'ordena-la-frase-eso-1-ef', name: 'Ordena la Frase (Ed. Física)',
  description: 'Construye frases sobre conceptos de Educación Física.',
  component: OrdenaLaFraseEso1EF
};

const appOrdenaLaFraseEso1Tutoria = {
  id: 'ordena-la-frase-eso-1-tutoria', name: 'Ordena la Frase (Tutoría)',
  description: 'Construye frases sobre convivencia y desarrollo personal.',
  component: OrdenaLaFraseEso1Tutoria
};

export const primariaApps = {
    '1': [ appIslaDeLaCalma, { id: 'ordena-la-frase-1', name: 'Ordena la Frase (Nivel 1)', description: 'Arrastra y ordena las palabras para formar frases sencillas.', component: OrdenaLaFrase1 }, { id: 'ordena-la-historia-1', name: 'Ordena la Historia (Nivel 1)', description: 'Pon en orden los eventos para reconstruir una pequeña historia.', component: OrdenaLaHistoria1 }, { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }],
    '2': [ appIslaDeLaCalma, { id: 'ordena-la-frase-2', name: 'Ordena la Frase (Nivel 2)', description: 'Forma frases un poco más largas con adjetivos y adverbios.', component: OrdenaLaFrase2 }, { id: 'ordena-la-historia-2', name: 'Ordena la Historia (Nivel 2)', description: 'Ordena secuencias de eventos un poco más complejas.', component: OrdenaLaHistoria2 }, { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 }],
    '3': [ appIslaDeLaCalma, { id: 'ordena-la-frase-3', name: 'Ordena la Frase (Nivel 3)', description: 'Construye frases usando diferentes tiempos verbales.', component: OrdenaLaFrase3 }, { id: 'ordena-la-historia-3', name: 'Ordena la Historia (Nivel 3)', description: 'Organiza párrafos cortos para dar coherencia a un relato.', component: OrdenaLaHistoria3 }, { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 }],
    '4': [ appIslaDeLaCalma, { id: 'ordena-la-frase-4', name: 'Ordena la Frase (Nivel 4)', description: 'Crea frases complejas uniendo ideas con conjunciones.', component: OrdenaLaFrase4 }, { id: 'ordena-la-historia-4', name: 'Ordena la Historia (Nivel 4)', description: 'Establece el orden cronológico en historias con más detalles.', component: OrdenaLaHistoria4 }, { id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 }],
    '5': [ appIslaDeLaCalma, { id: 'ordena-la-frase-5', name: 'Ordena la Frase (Nivel 5)', description: 'Practica con oraciones compuestas y vocabulario más rico.', component: OrdenaLaFrase5 }, { id: 'ordena-la-historia-5', name: 'Ordena la Historia (Nivel 5)', description: 'Identifica la estructura narrativa en textos más elaborados.', component: OrdenaLaHistoria5 }, { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 }],
    '6': [ appIslaDeLaCalma, { id: 'ordena-la-frase-6', name: 'Ordena la Frase (Nivel 6)', description: 'Domina la estructura de frases con voz pasiva y elementos complejos.', component: OrdenaLaFrase6 }, { id: 'ordena-la-historia-6', name: 'Ordena la Historia (Nivel 6)', description: 'Analiza y ordena la secuencia lógica en narraciones complejas.', component: OrdenaLaHistoria6 }, { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 }],
};

export const esoSubjects = {
    '1': [
        { id: 'lengua', name: 'Lengua Castellana y Literatura', icon: '✍️' },
        { id: 'matematicas', name: 'Matemáticas', icon: '🧮' },
        { id: 'historia', name: 'Geografía e Historia', icon: '🌍' },
        { id: 'ingles', name: 'Inglés', icon: '🇬🇧' },
        { id: 'biologia', name: 'Biología y Geología', icon: '🔬' },
        { id: 'fisica', name: 'Física y Química', icon: '🧪' },
        { id: 'musica', name: 'Música', icon: '🎵' },
        { id: 'plastica', name: 'Educación Plástica y Visual', icon: '🎨' },
        { id: 'tecnologia', name: 'Tecnología y Digitalización', icon: '💻' },
        { id: 'ed-fisica', name: 'Educación Física', icon: '🤸' },
        { id: 'tutoria', name: 'Tutoría', icon: '🤝' },
    ],
    '2': [
        { id: 'lengua', name: 'Lengua Castellana y Literatura', icon: '✍️' },
        { id: 'matematicas', name: 'Matemáticas', icon: '🧮' },
        { id: 'historia', name: 'Geografía e Historia', icon: '🌍' },
        { id: 'ingles', name: 'Inglés', icon: '🇬🇧' },
        { id: 'fisica', name: 'Física y Química', icon: '🧪' },
        { id: 'musica', name: 'Música', icon: '🎵' },
        { id: 'tecnologia', name: 'Tecnología y Digitalización', icon: '💻' },
        { id: 'ed-fisica', name: 'Educación Física', icon: '🤸' },
        { id: 'tutoria', name: 'Tutoría', icon: '🤝' },
    ],
    '3': [
        { id: 'lengua', name: 'Lengua Castellana y Literatura', icon: '✍️' },
        { id: 'matematicas', name: 'Matemáticas', icon: '🧮' },
        { id: 'historia', name: 'Geografía e Historia', icon: '🌍' },
        { id: 'ingles', name: 'Inglés', icon: '🇬🇧' },
        { id: 'biologia', name: 'Biología y Geología', icon: '🔬' },
        { id: 'fisica', name: 'Física y Química', icon: '🧪' },
        { id: 'tecnologia', name: 'Tecnología y Digitalización', icon: '💻' },
        { id: 'ed-fisica', name: 'Educación Física', icon: '🤸' },
        { id: 'tutoria', name: 'Tutoría', icon: '🤝' },
    ],
    '4': [
        { id: 'lengua', name: 'Lengua Castellana y Literatura', icon: '✍️' },
        { id: 'matematicas', name: 'Matemáticas', icon: '🧮' },
        { id: 'historia', name: 'Geografía e Historia', icon: '🌍' },
        { id: 'ingles', name: 'Inglés', icon: '🇬🇧' },
        { id: 'ed-fisica', name: 'Educación Física', icon: '🤸' },
        { id: 'biologia', name: 'Biología y Geología', icon: '🔬' },
        { id: 'fisica', name: 'Física y Química', icon: '🧪' },
        { id: 'latin', name: 'Latín', icon: '🏛️' },
        { id: 'economia', name: 'Economía y Emprendimiento', icon: '📈' },
        { id: 'tecnologia', name: 'Tecnología', icon: '🤖' },
        { id: 'tutoria', name: 'Tutoría', icon: '🤝' },
    ]
};

export const esoApps = {
    '1': { 
        'lengua': [appOrdenaLaFraseEso1Castellano], 
        'matematicas': [appOrdenaLaFraseEso1Mates], 
        'historia': [appOrdenaLaFraseEso1Historia], 
        'ingles': [appOrdenaLaFraseEso1Ingles], 
        'biologia': [appOrdenaLaFraseEso1Biologia], 
        'fisica': [appOrdenaLaFraseEso1Fisica], 
        'musica': [appOrdenaLaFraseEso1Musica], 
        'plastica': [appOrdenaLaFraseEso1Plastica], 
        'tecnologia': [appOrdenaLaFraseEso1Tecnologia], 
        'ed-fisica': [appOrdenaLaFraseEso1EF], 
        'tutoria': [appIslaDeLaCalma, appOrdenaLaFraseEso1Tutoria] 
    },
    '2': { 'lengua': [], 'matematicas': [], 'historia': [], 'ingles': [], 'fisica': [], 'musica': [], 'tecnologia': [], 'ed-fisica': [], 'tutoria': [appIslaDeLaCalma] },
    '3': { 'lengua': [], 'matematicas': [], 'historia': [], 'ingles': [], 'biologia': [], 'fisica': [], 'tecnologia': [], 'ed-fisica': [], 'tutoria': [appIslaDeLaCalma] },
    '4': { 'lengua': [], 'matematicas': [], 'historia': [], 'ingles': [], 'ed-fisica': [], 'biologia': [], 'fisica': [], 'latin': [], 'economia': [], 'tecnologia': [], 'tutoria': [appIslaDeLaCalma] }
};

export const findAppById = (id) => {
    for (const gradeKey in primariaApps) {
        const foundApp = primariaApps[gradeKey].find(app => app.id === id);
        if (foundApp) {
            return {
                app: foundApp,
                level: 'primaria',
                grade: gradeKey
            };
        }
    }
    for (const gradeKey in esoApps) {
        for (const subjectKey in esoApps[gradeKey]) {
            const foundApp = esoApps[gradeKey][subjectKey].find(app => app.id === id);
            if (foundApp) {
                return {
                    app: foundApp,
                    level: 'eso',
                    grade: gradeKey,
                    subjectId: subjectKey
                };
            }
        }
    }
    return null;
};
