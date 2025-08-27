import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import AboutModal from '@/components/ui/AboutModal';

/**
 * Cabecera reutilizable para toda la aplicación.
 * Muestra el logo y el nombre de la app, y un botón de acción personalizable.
 * @param {object} props
 * @param {React.ReactNode} props.children - El contenido del botón de acción a la derecha.
 * @param {boolean} [props.isSticky=true] - Define si la cabecera se queda fija en la parte superior.
 */
const Header = ({ children, isSticky = true }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false); // LÍNEA CORREGIDA

  const handleAboutClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };
  
  const actionButton = React.Children.map(children, child => {
    if (child.props.onClick && child.props.onClick.toString().includes('setIsModalOpen(true)')) {
      return React.cloneElement(child, { onClick: handleAboutClick });
    }
    return child;
  });

  // Clases CSS condicionales para el comportamiento 'sticky'
  const headerClasses = `bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 ${isSticky ? 'sticky top-0 z-50' : 'relative'}`;

  return (
    <>
      <AboutModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      <header className={headerClasses}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">EduApps</h1>
                <p className="text-sm text-gray-600">Apps Educativas</p>
              </div>
            </div>
            <nav className="flex items-center">
              {actionButton}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;