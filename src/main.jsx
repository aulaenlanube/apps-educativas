import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfettiProvider } from '/src/apps/_shared/ConfettiProvider';
import { AuthProvider } from '@/contexts/AuthContext';

import App from '@/App';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage.jsx';
import SubjectPage from '@/pages/SubjectPage.jsx';
import AppListPage from '@/pages/AppListPage.jsx';
import AppRunnerPage from '@/pages/AppRunnerPage.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import RegisterFreePage from '@/pages/auth/RegisterFreePage.jsx';
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx';
import ProfilePage from '@/pages/auth/ProfilePage.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminPanel from '@/pages/admin/AdminPanel.jsx';
import StudentDashboard from '@/pages/dashboard/StudentDashboard.jsx';
import FreeUserDashboard from '@/pages/dashboard/FreeUserDashboard.jsx';

import '@/index.css';
import { Toaster } from '@/components/ui/toaster';

// definición del router de la aplicación
// utilizamos rutas dinámicas para soportar primaria y ESO con la misma estructura:
//   /curso/:level/:grade           → lista de asignaturas de un curso
//   /curso/:level/:grade/:subjectId → lista de apps de una asignatura
//   /curso/:level/:grade/:subjectId/app/:appId → ejecución de una app concreta
const router = createBrowserRouter(
  [
    {
      element: <App />,
      children: [
        {
          element: <MainLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: 'curso/:level/:grade', element: <SubjectPage /> },
            { path: 'curso/:level/:grade/:subjectId', element: <AppListPage /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'registro', element: <RegisterPage /> },
            { path: 'registro-libre', element: <RegisterFreePage /> },
            {
              path: 'perfil',
              element: (
                <ProtectedRoute role="teacher">
                  <ProfilePage />
                </ProtectedRoute>
              )
            },
            {
              path: 'dashboard',
              element: (
                <ProtectedRoute role="teacher">
                  <DashboardPage />
                </ProtectedRoute>
              )
            },
            {
              path: 'mi-panel',
              element: (
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              )
            },
            {
              path: 'mi-zona',
              element: (
                <ProtectedRoute role="free">
                  <FreeUserDashboard />
                </ProtectedRoute>
              )
            },
            {
              path: 'admin',
              element: (
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              )
            },
          ],
        },
        { path: '/curso/:level/:grade/:subjectId/app/:appId', element: <AppRunnerPage /> },
      ],
    },
  ],
  { future: { v7_startTransition: true, v7_relativeSplatPath: true } }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ConfettiProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </ConfettiProvider>
    </HelmetProvider>
  </React.StrictMode>
);
