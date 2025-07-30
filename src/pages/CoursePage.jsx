// src/pages/CoursePage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { primariaApps } from '@/apps/appList';

const AppList = ({ apps, level, grade }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {apps.map((app, index) => (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-purple-100"
                    onClick={() => navigate(`/curso/${level}/${grade}/app/${app.id}`)}
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{app.name}</h3>
                    <p className="text-gray-600">{app.description}</p>
                </motion.div>
            ))}
        </div>
    );
};

const CoursePage = () => {
  const { grade } = useParams();
  const navigate = useNavigate();

  const level = 'primaria';
  const levelName = 'Primaria';
  const fullTitle = `${grade}º ${levelName}`;
  
  const appsForCourse = primariaApps[grade] || [];

  return (
    <>
      <Helmet>
        <title>{`Apps para ${fullTitle} - EduApps`}</title>
      </Helmet>
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
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
              <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <BookOpen className="w-10 h-10 text-blue-500" />
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">{fullTitle}</h1>
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 mt-4">
              ¡Selecciona una aplicación para empezar a jugar y aprender!
            </p>
          </motion.div>

          {appsForCourse.length > 0 ? (
            <AppList apps={appsForCourse} level={level} grade={grade} />
          ) : (
            <motion.div
              className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl"
            >
               <img  className="w-56 h-56 mb-8" alt="Un cohete despegando hacia las estrellas" src="https://images.unsplash.com/photo-1508693484929-012827ef8c81" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Próximamente!</h2>
              <p className="text-lg text-gray-600 max-w-md">
                Estamos trabajando para traerte las mejores apps para este curso. ¡Vuelve pronto!
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default CoursePage;