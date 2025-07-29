// src/apps/appList.js (ACTUALIZADO Y COMPLETO)

// --- Importamos los componentes de cada App ---
import SupermercadoMatematico1 from '@/apps/supermercado-primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '@/apps/supermercado-primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '@/apps/supermercado-primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '@/apps/supermercado-primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '@/apps/supermercado-primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '@/apps/supermercado-primaria-6/SupermercadoMatematico6';
import IslaDeLaCalma from '@/apps/isla-de-la-calma/IslaDeLaCalma';
import OrdenaLaFrase1 from '@/apps/ordena-la-frase-primaria-1/OrdenaLaFrase1';
import OrdenaLaFrase2 from '@/apps/ordena-la-frase-primaria-2/OrdenaLaFrase2';
import OrdenaLaFrase3 from '@/apps/ordena-la-frase-primaria-3/OrdenaLaFrase3';
import OrdenaLaFrase4 from '@/apps/ordena-la-frase-primaria-4/OrdenaLaFrase4';
import OrdenaLaFrase5 from '@/apps/ordena-la-frase-primaria-5/OrdenaLaFrase5';
import OrdenaLaFrase6 from '@/apps/ordena-la-frase-primaria-6/OrdenaLaFrase6';
import OrdenaLaHistoria1 from '@/apps/ordena-la-historia-primaria-1/OrdenaLaHistoria1';


// --- Creamos un objeto para la app de relajación para no repetir código ---
const appIslaDeLaCalma = {
  id: 'isla-de-la-calma',
  name: 'Isla de la Calma',
  description: 'Un ejercicio de respiración guiada para encontrar la calma.',
  component: IslaDeLaCalma
};

export const courseApps = {
  primaria: {
    '1': [
      appIslaDeLaCalma,
      { id: 'ordena-la-historia-1', name: 'Ordena la Historia (Nivel 1)', description: 'Arrastra las frases para crear una pequeña historia con sentido.', component: OrdenaLaHistoria1 },
      { id: 'ordena-la-frase-1', name: 'Ordena la Frase (Nivel 1)', description: 'Arrastra y ordena las palabras para formar frases sencillas.', component: OrdenaLaFrase1 },
      { id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }
    ],
    '2': [
      appIslaDeLaCalma,
      { id: 'ordena-la-frase-2', name: 'Ordena la Frase (Nivel 2)', description: 'Forma frases un poco más largas con adjetivos y adverbios.', component: OrdenaLaFrase2 },
      { id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 }
    ],
    '3': [
      appIslaDeLaCalma,
      { id: 'ordena-la-frase-3', name: 'Ordena la Frase (Nivel 3)', description: 'Construye frases usando diferentes tiempos verbales.', component: OrdenaLaFrase3 },
      { id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 }
    ],
    '4': [
       appIslaDeLaCalma,
      { id: 'ordena-la-frase-4', name: 'Ordena la Frase (Nivel 4)', description: 'Crea frases complejas uniendo ideas con conjunciones.', component: OrdenaLaFrase4 },
      { id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 }
    ],
    '5': [
       appIslaDeLaCalma,
      { id: 'ordena-la-frase-5', name: 'Ordena la Frase (Nivel 5)', description: 'Practica con oraciones compuestas y vocabulario más rico.', component: OrdenaLaFrase5 },
      { id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 }
    ],
    '6': [
       appIslaDeLaCalma,
      { id: 'ordena-la-frase-6', name: 'Ordena la Frase (Nivel 6)', description: 'Domina la estructura de frases con voz pasiva y elementos complejos.', component: OrdenaLaFrase6 },
      { id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 }
    ],
  },
  eso: {}
};

// --- La función findAppById se queda igual ---
export const findAppById = (id) => {
    for (const level of Object.values(courseApps)) {
        for (const grade of Object.values(level)) {
            const foundApp = grade.find(app => app.id === id);
            if (foundApp) return foundApp;
        }
    }
    return null;
};