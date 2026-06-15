import React, { Suspense, lazy, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
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
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel.jsx'));
const QuizBattleHost = lazy(() => import('@/apps/quiz-battle/QuizBattleHost.jsx'));
const QuizBattlePlayer = lazy(() => import('@/apps/quiz-battle/QuizBattlePlayer.jsx'));
const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard.jsx'));
const FreeUserDashboard = lazy(() => import('@/pages/dashboard/FreeUserDashboard.jsx'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.jsx'));
const GroupLoginPage = lazy(() => import('@/pages/auth/GroupLoginPage.jsx'));
const DuelLobby = lazy(() => import('@/pages/DuelLobby.jsx'));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage.jsx'));
const CookiesPolicyPage = lazy(() => import('@/pages/legal/CookiesPolicyPage.jsx'));
const LegalNoticePage = lazy(() => import('@/pages/legal/LegalNoticePage.jsx'));
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage.jsx'));
const BlogCategoryPage = lazy(() => import('@/pages/BlogCategoryPage.jsx'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage.jsx'));

import '@/index.css';
import { Toaster } from '@/components/ui/toaster';

// --- Recuperación ante deploys: chunks/CSS antiguos ya no existen en el servidor ---
// Cuando se sube una versión nueva, los hashes de los assets cambian. Un usuario que
// tenía la pestaña abierta (con el index.html / chunks viejos) y dispara un import()
// dinámico recibe un 404 al precargar el .css o el .js → la promesa se rechaza y React
// Router muestra la pantalla de error. Recargamos una vez para traer el index.html nuevo.
// Guarda anti-bucle: si el fallo persiste (404 real), no recargamos en cadena.
(() => {
  const reloadOnce = (label) => {
    const KEY = 'eduapps-chunk-reload';
    let last = 0;
    try { last = Number(sessionStorage.getItem(KEY)) || 0; } catch { /* sin storage */ }
    const now = Date.now();
    if (now - last < 10000) {
      // Ya recargamos hace <10s: el problema no es un deploy stale. No insistir.
      console.error(`[chunk-recovery] fallo persistente (${label}); no se recarga de nuevo.`);
      return;
    }
    try { sessionStorage.setItem(KEY, String(now)); } catch { /* sin storage */ }
    window.location.reload();
  };

  // Evento nativo de Vite cuando falla la precarga de un módulo/CSS dinámico.
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault(); // evita que el error se propague sin control
    reloadOnce('vite:preloadError');
  });

  // Red de seguridad: import() dinámicos que se rechazan por un chunk inexistente.
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event?.reason?.message || event?.reason || '');
    if (/Unable to preload CSS|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(msg)) {
      event.preventDefault();
      reloadOnce('unhandledrejection');
    }
  });
})();

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
            { path: 'politica-privacidad', element: <SuspensePage><PrivacyPolicyPage /></SuspensePage> },
            { path: 'politica-cookies',    element: <SuspensePage><CookiesPolicyPage /></SuspensePage> },
            { path: 'aviso-legal',         element: <SuspensePage><LegalNoticePage /></SuspensePage> },
            { path: 'blog',                              element: <SuspensePage><BlogIndexPage /></SuspensePage> },
            { path: 'blog/categoria/:categorySlug',      element: <SuspensePage><BlogCategoryPage /></SuspensePage> },
            { path: 'blog/:slug',                        element: <SuspensePage><BlogPostPage /></SuspensePage> },
            { path: 'login', element: <SuspensePage><LoginPage /></SuspensePage> },
            { path: 'grupo/:groupCode', element: <SuspensePage><GroupLoginPage /></SuspensePage> },
            { path: 'registro', element: <SuspensePage><RegisterPage /></SuspensePage> },
            { path: 'registro-libre', element: <SuspensePage><RegisterFreePage /></SuspensePage> },
            {
              // /perfil ahora es una pestaña del dashboard del docente.
              // Redirigimos para no romper bookmarks antiguos.
              path: 'perfil',
              element: (
                <ProtectedRoute role="teacher">
                  <Navigate to="/dashboard?tab=perfil" replace />
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
              path: 'duelo/:duelId',
              element: (
                <ProtectedRoute role={['student', 'teacher']}>
                  <SuspensePage><DuelLobby /></SuspensePage>
                </ProtectedRoute>
              )
            },
            {
              path: 'admin',
              element: (
                <ProtectedRoute role="admin">
                  <SuspensePage><AdminPanel /></SuspensePage>
                </ProtectedRoute>
              )
            },
            { path: '*', element: <SuspensePage><NotFoundPage /></SuspensePage> },
          ],
        },
        { path: '/curso/:level/:grade/:subjectId/app/:appId', element: <SuspensePage><AppRunnerPage /></SuspensePage> },
      ],
    },
    { path: '*', element: <SuspensePage><NotFoundPage /></SuspensePage> },
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
