import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Header = ({ children }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-md">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduApps
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Apps Educativas</p>
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