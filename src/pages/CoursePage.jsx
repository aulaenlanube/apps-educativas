import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CoursePage = () => {
  const { level, grade } = useParams();
  const navigate = useNavigate();

  const levelName = level === 'primaria' ? 'Primaria' : 'ESO';
  const fullTitle = `${grade}º ${levelName}`;

  return (
    <>
      <Helmet>
        <title>{`Apps para ${fullTitle} - EduApps`}</title>
        <meta name="description" content={`Encuentra las mejores apps educativas para ${fullTitle}.`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50"
        >
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
        </motion.header>

        {/* Course Content Section */}
        <main className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <BookOpen className="w-10 h-10 text-blue-500" />
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">
                {fullTitle}
              </h1>
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 mt-4">
              ¡Explora las aplicaciones educativas que hemos preparado para ti!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl"
          >
            <img  class="w-56 h-56 mb-8" alt="Un cohete despegando hacia las estrellas" src="https://images.unsplash.com/photo-1508693484929-012827ef8c81" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Próximamente!</h2>
            <p className="text-lg text-gray-600 max-w-md">
              Estamos trabajando para traerte las mejores apps para este curso. ¡Vuelve pronto para descubrir nuevo contenido increíble!
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-12 px-6 mt-16"
        >
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">EduApps</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Transformando la educación a través de la tecnología. 
              Hacemos que aprender sea una aventura emocionante para todos los estudiantes.
            </p>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400">
                © 2025 EduApps. Todos los derechos reservados. Hecho con ❤️ para la educación.
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default CoursePage;