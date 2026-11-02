import React, { useState } from 'react';
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import { Shield, Menu, BookOpen } from 'lucide-react';
import MascotLogo from '../ui/MascotLogo';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';
import UserMenu from '@/components/auth/UserMenu';
import NotificationBell from '@/components/ui/NotificationBell';
import MobileSidebar from './MobileSidebar';
import './Header.css';

// Cabecera de la plataforma: cristal OSCURO en los dos temas (casi todas las
// páginas van sobre el fondo 3D, que es nocturno), para que el logo, los botones
// de navegación (NavPill) y el menú de usuario se lean siempre. Sin efectos en
// movimiento. `children` = botón de navegación de la página (Inicio, Asignaturas…).
const Header = ({ children, rightExtra, subtitle = "Apps Educativas" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // El botón de Blog solo se muestra en la página de inicio.
  const isHome = location.pathname === '/';

  return (
    <header className="glass-hdr relative isolate sticky top-0 z-50 backdrop-blur-2xl backdrop-saturate-150">
      {/* Capas decorativas (no interactivas, detrás del contenido). El recorte
          vive aquí, NO en el <header>, para no cortar el desplegable de avisos. */}
      <div className="glass-hdr__sheen" aria-hidden="true">
        <div className="glass-hdr__aurora" />
      </div>
      <div className="glass-hdr__edge" aria-hidden="true" />

      <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="relative flex items-center justify-between gap-3">
          {/* Blog centrado en la cabecera (solo en la home y en escritorio). */}
          {isHome && (
            <NavLink
              to="/blog"
              className={({ isActive }) => `glass-hdr__link hidden md:inline-flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2${isActive ? ' is-active' : ''}`}
            >
              <BookOpen className="w-4 h-4" />
              Blog
            </NavLink>
          )}

          <Link to="/" className="glass-hdr__brand group" aria-label="EduApps, ir al inicio">
            <MascotLogo className="w-10 h-10 sm:w-12 sm:h-12 transition-transform group-hover:scale-110 group-hover:rotate-3" />
            <span className="flex flex-col min-w-0">
              <span className="glass-hdr__title text-xl sm:text-2xl">EduApps</span>
              <span className="glass-hdr__sub">{subtitle}</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {children}
            {!loading && isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 h-10 px-4 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
            {!loading && isAuthenticated && <NotificationBell variant="glass" />}
            {!loading && (isAuthenticated ? <UserMenu /> : <LoginButton />)}
            {rightExtra}
          </nav>

          {/* Mobile: login button OR hamburger */}
          <div className="glass-hdr__mobile flex md:hidden items-center gap-2 min-w-0">
            {children}
            {!loading && !isAuthenticated && <LoginButton />}
            {!loading && isAuthenticated && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menú"
                className="glass-hdr__iconbtn"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isAuthenticated && (
        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
    </header>
  );
};

export default Header;
