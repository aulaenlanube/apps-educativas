import React from 'react';
import { useNavigate } from 'react-router-dom';
import MascotLogo from '../ui/MascotLogo';

const Header = ({ children, subtitle = "Apps Educativas" }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <MascotLogo className="w-14 h-14 transition-transform group-hover:scale-110 group-hover:rotate-3" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduApps
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">{subtitle}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {children}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;