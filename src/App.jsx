// src/App.jsx (MODIFICADO)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Importamos las páginas y el nuevo Layout
import HomePage from '@/pages/HomePage.jsx';
import CoursePage from '@/pages/CoursePage.jsx';
import AppRunnerPage from '@/pages/AppRunnerPage.jsx';
import MainLayout from '@/components/layout/MainLayout'; // <-- IMPORTAMOS EL LAYOUT

function App() {
  return (
    <>
      <Helmet>
        <title>EduApps - Apps Educativas para Primaria y ESO</title>
        <meta name="description" content="Descubre las mejores apps educativas organizadas por cursos." />
      </Helmet>
      <Routes>
        {/* Ruta principal que usa el Layout */}
        <Route path="/" element={<MainLayout />}>
          {/* Estas son las rutas "hijas" que se renderizarán dentro del <Outlet /> */}
          <Route index element={<HomePage />} />
          <Route path="curso/:level/:grade" element={<CoursePage />} />
        </Route>
        
        {/* La página de la app no usará el footer, así que la dejamos fuera */}
        <Route path="/curso/:level/:grade/app/:appId" element={<AppRunnerPage />} />
      </Routes>
    </>
  );
}

export default App;