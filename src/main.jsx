import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfettiProvider } from '/src/apps/_shared/ConfettiProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Sincroniza el tema con el usuario logueado
function ThemeAuthSync() {
  const { user, student, isAuthenticated } = useAuth();
  const { syncUser } = useTheme();
  useEffect(() => {
    const userId = user?.id || student?.id || null;
    syncUser(isAuthenticated ? userId : null);
  }, [user?.id, student?.id, isAuthenticated, syncUser]);
  return null;
}

import App from '@/App';
import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/pages/HomePage.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Route-level lazy loading for pages not needed on initial render
const SubjectPage = lazy(() => import('@/pages/SubjectPage.jsx'));
const AppListPage = lazy(() => import('@/pages/AppListPage.jsx'));
const AppRunnerPage = lazy(() => import('@/pages/AppRunnerPage.jsx'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage.jsx'));
const RegisterFreePage = lazy(() => import('@/pages/auth/RegisterFreePage.jsx'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage.jsx'));
const ProfilePage = lazy(() => import('@/pages/auth/ProfilePage.jsx'));
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel.jsx'));
const QuizBattleHost = lazy(() => import('@/apps/quiz-battle/QuizBattleHost.jsx'));
const QuizBattlePlayer = lazy(() => import('@/apps/quiz-battle/QuizBattlePlayer.jsx'));
const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard.jsx'));
const FreeUserDashboard = lazy(() => import('@/pages/dashboard/FreeUserDashboard.jsx'));
const GroupLoginPage = lazy(() => import('@/pages/auth/GroupLoginPage.jsx'));

import '@/index.css';
import { Toaster } from '@/components/ui/toaster';

// Reusable suspense loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
  </div>
);

const SuspensePage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

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
            { path: 'curso/:level/:grade', element: <SuspensePage><SubjectPage /></SuspensePage> },
            { path: 'curso/:level/:grade/:subjectId', element: <SuspensePage><AppListPage /></SuspensePage> },
            { path: 'login', element: <SuspensePage><LoginPage /></SuspensePage> },
            { path: 'grupo/:groupCode', element: <SuspensePage><GroupLoginPage /></SuspensePage> },
            { path: 'registro', element: <SuspensePage><RegisterPage /></SuspensePage> },
            { path: 'registro-libre', element: <SuspensePage><RegisterFreePage /></SuspensePage> },
            {
              path: 'perfil',
              element: (
                <ProtectedRoute role="teacher">
                  <SuspensePage><ProfilePage /></SuspensePage>
                </ProtectedRoute>
              )
            },
            {
              path: 'dashboard',
              element: (
                <ProtectedRoute role="teacher">
                  <SuspensePage><DashboardPage /></SuspensePage>
                </ProtectedRoute>
              )
            },
            {
              path: 'mi-panel',
              element: (
                <ProtectedRoute role="student">
                  <SuspensePage><StudentDashboard /></SuspensePage>
                </ProtectedRoute>
              )
            },
            {
              path: 'mi-zona',
              element: (
                <ProtectedRoute role="free">
                  <SuspensePage><FreeUserDashboard /></SuspensePage>
                </ProtectedRoute>
              )
            },
            {
              path: 'quiz-battle/host',
              element: (
                <ProtectedRoute role="teacher">
                  <SuspensePage><QuizBattleHost /></SuspensePage>
                </ProtectedRoute>
              )
            },
            {
              path: 'quiz-battle/join/:code?',
              element: <SuspensePage><QuizBattlePlayer /></SuspensePage>
            },
            {
              path: 'admin',
              element: (
                <ProtectedRoute role="admin">
                  <SuspensePage><AdminPanel /></SuspensePage>
                </ProtectedRoute>
              )
            },
          ],
        },
        { path: '/curso/:level/:grade/:subjectId/app/:appId', element: <SuspensePage><AppRunnerPage /></SuspensePage> },
      ],
    },
  ],
  { future: { v7_startTransition: true, v7_relativeSplatPath: true } }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <ConfettiProvider>
          <AuthProvider>
            <ThemeAuthSync />
            <RouterProvider router={router} />
            <Toaster />
          </AuthProvider>
        </ConfettiProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
