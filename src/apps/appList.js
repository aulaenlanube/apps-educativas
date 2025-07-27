// src/apps/appList.js (MODIFICADO)

// --- Importamos los componentes de cada App ---
import SupermercadoMatematico1 from '@/apps/supermercado-primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '@/apps/supermercado-primaria-2/SupermercadoMatematico2';
import SupermercadoMatematico3 from '@/apps/supermercado-primaria-3/SupermercadoMatematico3';
import SupermercadoMatematico4 from '@/apps/supermercado-primaria-4/SupermercadoMatematico4';
import SupermercadoMatematico5 from '@/apps/supermercado-primaria-5/SupermercadoMatematico5';
import SupermercadoMatematico6 from '@/apps/supermercado-primaria-6/SupermercadoMatematico6';

export const courseApps = {
  primaria: {
    '1': [{ id: 'supermercado-matematico-1', name: 'Supermercado Matemático (Sumas)', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }],
    '2': [{ id: 'supermercado-matematico-2', name: 'Supermercado Matemático (Sumas llevando)', description: 'Suma los precios de varios productos, ¡a veces tendrás que llevar!', component: SupermercadoMatematico2 }],
    '3': [{ id: 'supermercado-matematico-3', name: 'Supermercado Matemático (Multiplicación)', description: 'Calcula el coste de comprar varias unidades del mismo producto.', component: SupermercadoMatematico3 }],
    '4': [{ id: 'supermercado-matematico-4', name: 'Supermercado Matemático (Decimales)', description: 'Practica sumas y restas con precios con céntimos.', component: SupermercadoMatematico4 }],
    '5': [{ id: 'supermercado-matematico-5', name: 'Supermercado Matemático (El Cambio)', description: 'Calcula el cambio correcto al pagar con billetes.', component: SupermercadoMatematico5 }],
    '6': [{ id: 'supermercado-matematico-6', name: 'Supermercado Matemático (Descuentos)', description: 'Aplica descuentos y calcula el precio final de la compra.', component: SupermercadoMatematico6 }],
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