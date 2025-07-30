// src/App.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function App() {
  // --- CÓDIGO AÑADIDO ---
  // Obtiene la ubicación actual de la página
  const { pathname } = useLocation();

  // Este efecto se ejecuta cada vez que la ruta (pathname) cambia
  useEffect(() => {
    // Sube el scroll de la ventana a la posición superior (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]); // El efecto se activa solo cuando el pathname es diferente

  return (
    <>
      <Helmet>
        <title>EduApps - Apps Educativas para Primaria y ESO</title>
        <meta name="description" content="Descubre las mejores apps educativas organizadas por cursos." />
      </Helmet>
      
      <Outlet />
    </>
  );
}

export default App;