import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Menu } from 'lucide-react';
import MascotLogo from '../ui/MascotLogo';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';
import UserMenu from '@/components/auth/UserMenu';
import NotificationBell from '@/components/ui/NotificationBell';
import MobileSidebar from './MobileSidebar';

const Header = ({ children, rightExtra, subtitle = "Apps Educativas" }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-purple-100 dark:border-purple-900/40 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <MascotLogo className="w-10 h-10 sm:w-14 sm:h-14 transition-transform group-hover:scale-110 group-hover:rotate-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                EduApps
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">{subtitle}</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {children}
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

          {/* Mobile: login button OR hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {!loading && !isAuthenticated && <LoginButton />}
            {!loading && isAuthenticated && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
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