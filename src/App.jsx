// src/App.jsx (MODIFICADO)

import React from 'react';
import { Outlet } from 'react-router-dom'; // <-- CAMBIO: Importamos Outlet
import { Helmet } from 'react-helmet-async';

function App() {
  return (
    <>
      <Helmet>
        <title>EduApps - Apps Educativas para Primaria y ESO</title>
        <meta name="description" content="Descubre las mejores apps educativas organizadas por cursos." />
      </Helmet>
      
      {/* CAMBIO: <Routes> se elimina y se reemplaza por <Outlet />.
          React Router inyectará aquí el componente de la ruta activa. */}
      <Outlet />
    </>
  );
}

export default App;