// src/App.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Helmet>        
        <title>Apps Educativas para Primaria y secundaria en España</title>
        <meta name="description" content="Descubre las mejores apps educativas gratuitas organizadas por cursos de Primaria y ESO." />
        <meta name="author" content="Edu Torregrosa" />
      </Helmet>
      
      <Outlet />
    </>
  );
}

export default App;