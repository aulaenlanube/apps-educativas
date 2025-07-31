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
              path: 'curso/primaria/:grade',
              element: <CoursePage />,
            },
            {
              path: 'curso/eso/:grade',
              element: <SubjectPage />,
            },
            {
              path: 'curso/eso/:grade/:subjectId',
              element: <AppListPage />,
            }
          ],
        },
        // --- RUTAS CORREGIDAS PARA EL RUNNER ---
        {
          // Ruta para Primaria (level y grade)
          path: '/curso/primaria/:grade/app/:appId',
          element: <AppRunnerPage />,
        },
        {
          // Ruta para ESO (level, grade y subjectId)
          path: '/curso/eso/:grade/:subjectId/app/:appId',
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