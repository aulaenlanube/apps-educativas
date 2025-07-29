// src/main.jsx (MODIFICADO)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// CAMBIO: Importamos los componentes de las páginas y layouts aquí
import App from '@/App';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage.jsx';
import CoursePage from '@/pages/CoursePage.jsx';
import AppRunnerPage from '@/pages/AppRunnerPage.jsx';

import '@/index.css';
import { Toaster } from '@/components/ui/toaster';

// CAMBIO: Creamos el router con la configuración de rutas
const router = createBrowserRouter(
  [
    {
      // La ruta raíz ahora usa el componente App como "envoltorio" o "shell"
      // que contendrá el Helmet por defecto y un Outlet para las rutas hijas.
      element: <App />,
      children: [
        {
          // Este grupo de rutas se renderizará dentro de MainLayout
          element: <MainLayout />,
          children: [
            {
              index: true, // Esta es la página de inicio (path: "/")
              element: <HomePage />,
            },
            {
              path: 'curso/:level/:grade',
              element: <CoursePage />,
            },
          ],
        },
        {
          // Esta ruta no usa MainLayout, tal como lo tenías antes
          path: '/curso/:level/:grade/app/:appId',
          element: <AppRunnerPage />,
        },
      ],
    },
  ],
  {
    // CAMBIO: Añadimos las "future flags" para eliminar los warnings
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

// CAMBIO: Renderizamos la app usando RouterProvider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster />
    </HelmetProvider>
  </React.StrictMode>
);