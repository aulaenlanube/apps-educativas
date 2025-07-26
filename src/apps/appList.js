// src/apps/appList.js

// --- Importamos los componentes de cada App ---
import SupermercadoMatematico1 from '@/apps/supermercado-primaria-1/SupermercadoMatematico1';
// import SupermercadoMatematico2 from '@/apps/supermercado-primaria-2/SupermercadoMatematico2'; // Descomentarás esto cuando lo crees

export const courseApps = {
  primaria: {
    '1': [{ id: 'supermercado-matematico-1', name: 'Supermercado Matemático', description: 'Resuelve sumas sencillas con productos del súper.', component: SupermercadoMatematico1 }],
    // '2': [{ id: 'supermercado-matematico-2', name: 'Supermercado Matemático 2', description: 'Ahora con llevadas.', component: SupermercadoMatematico2 }],
    // ... etc.
  },
  eso: {}
};

// --- Función para encontrar una app por su ID ---
export const findAppById = (id) => {
    for (const level of Object.values(courseApps)) {
        for (const grade of Object.values(level)) {
            const foundApp = grade.find(app => app.id === id);
            if (foundApp) return foundApp;
        }
    }
    return null;
};