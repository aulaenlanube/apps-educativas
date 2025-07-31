// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from '@/App';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage.jsx';
import CoursePage from '@/pages/CoursePage.jsx';
import SubjectPage from '@/pages/SubjectPage.jsx';
import AppListPage from '@/pages/AppListPage.jsx';
import AppRunnerPage from '@/pages/AppRunnerPage.jsx';

import '@/index.css';
import { Toaster } from '@/components/ui/toaster';

const router = createBrowserRouter(
  [
    {
      element: <App />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: <HomePage />,
            },
            {
              // Ruta para los cursos de Primaria (no tienen asignaturas)
              path: 'curso/primaria/:grade',
              element: <CoursePage />,
            },
            {
              // Ruta para seleccionar la asignatura en ESO
              path: 'curso/eso/:grade',
              element: <SubjectPage />,
            },
            {
              // Ruta para ver la lista de apps de una asignatura concreta
              path: 'curso/eso/:grade/:subjectId',
              element: <AppListPage />,
            }
          ],
        },
        // --- CORRECCIÓN CLAVE: RUTA ÚNICA PARA MOSTRAR CUALQUIER APP ---
        {
          // Esta ruta ahora gestiona todas las apps, tanto de Primaria como de ESO.
          // Para Primaria, ':subjectId' será siempre "general".
          path: '/curso/:level/:grade/:subjectId/app/:appId',
          element: <AppRunnerPage />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster />
    </HelmetProvider>
  </React.StrictMode>
);