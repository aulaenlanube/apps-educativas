import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sun, Moon } from 'lucide-react';
import MascotLogo from '../ui/MascotLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LoginButton from '@/components/auth/LoginButton';
import UserMenu from '@/components/auth/UserMenu';
import NotificationBell from '@/components/ui/NotificationBell';

const Header = ({ children, rightExtra, subtitle = "Apps Educativas" }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-purple-100 dark:border-purple-900/40 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <MascotLogo className="w-14 h-14 transition-transform group-hover:scale-110 group-hover:rotate-3" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                EduApps
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">{subtitle}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {children}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {!loading && isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
            {!loading && isAuthenticated && <NotificationBell />}
            {!loading && (isAuthenticated ? <UserMenu /> : <LoginButton />)}
            {rightExtra}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;