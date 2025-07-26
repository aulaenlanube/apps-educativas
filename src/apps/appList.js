// src/apps/appList.js (MODIFICADO)

// --- Importamos los componentes de cada App ---
import SupermercadoMatematico1 from '@/apps/supermercado-primaria-1/SupermercadoMatematico1';
import SupermercadoMatematico2 from '@/apps/supermercado-primaria-2/SupermercadoMatematico2'; // <-- 1. IMPORTA LA NUEVA APP

export const courseApps = {
  primaria: {
    '1': [{ id: 'supermercado-matematico-1', name: 'Supermercado Matemático', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }],
    '2': [{ id: 'supermercado-matematico-2', name: 'Supermercado Matemático', description: 'Calcula el total o el cambio con números decimales.', component: SupermercadoMatematico2 }], // <-- 2. AÑADE LA APP AQUÍ
    '3': [], // <-- Puedes dejarlo vacío o añadir más apps en el futuro
    '4': [],
    '5': [],
    '6': [],
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