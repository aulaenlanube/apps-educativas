import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useGAPageView from '@/hooks/useGAPageView';

// Tras un callback OAuth (Google), supabase-js procesa el hash/query y dispara
// SIGNED_IN. Como redirectTo = raiz del sitio, el usuario aterriza en `/`, no
// en su panel. Este efecto redirige una sola vez al dashboard correspondiente
// cuando detecta ese caso.
function OAuthPostLoginRedirect() {
  const navigate = useNavigate();
  const { oauthCallbackPending, loading, isAuthenticated, isTeacher, isStudent, isFreeUser } = useAuth();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!oauthCallbackPending || redirectedRef.current) return;
    if (loading) return;
    if (!isAuthenticated) return;
    redirectedRef.current = true;
    const target = isTeacher ? '/dashboard' : isFreeUser ? '/mi-zona' : isStudent ? '/mi-panel' : '/';
    navigate(target, { replace: true });
  }, [oauthCallbackPending, loading, isAuthenticated, isTeacher, isStudent, isFreeUser, navigate]);

  return null;
}

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useGAPageView();

  return (
    <>
      <OAuthPostLoginRedirect />
      <Outlet />
    </>
  );
}

export default App;