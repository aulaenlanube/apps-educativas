import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import HomePage from '@/pages/HomePage.jsx';
import CoursePage from '@/pages/CoursePage.jsx';

function App() {
  return (
    <>
      <Helmet>
        <title>EduApps - Apps Educativas para Primaria y ESO</title>
        <meta name="description" content="Descubre las mejores apps educativas organizadas por cursos desde 1º de Primaria hasta 4º de ESO. Aprende jugando con contenido interactivo y divertido." />
      </Helmet>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/curso/:level/:grade" element={<CoursePage />} />
      </Routes>
    </>
  );
}

export default App;