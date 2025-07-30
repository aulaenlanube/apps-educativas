// src/pages/SubjectPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Folder, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
// --- CORRECCIÓN: Importamos la lista de asignaturas desde el archivo central ---
import { esoSubjects } from '@/apps/appList';

const SubjectList = ({ subjects, level, grade }) => {
    const navigate = useNavigate();

    const handleSubjectClick = (subjectId) => {
        navigate(`/curso/${level}/${grade}/${subjectId}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {subjects.map((subject, index) => (
                <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-indigo-100 flex items-center space-x-4"
                    onClick={() => handleSubjectClick(subject.id)}
                >
                    <div className="text-4xl">{subject.icon}</div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{subject.name}</h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const SubjectPage = () => {
  const { grade } = useParams();
  const navigate = useNavigate();

  const fullTitle = `${grade}º ESO`;
  
  // --- CORRECCIÓN: Ahora usa la lista importada ---
  const subjectsForCourse = esoSubjects[grade] || [];

  return (
    <>
      <Helmet>
        <title>{`Asignaturas para ${fullTitle} - EduApps`}</title>
      </Helmet>
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 min-h-screen">
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
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

        <main className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Folder className="w-10 h-10 text-indigo-500" />
              <h1 className="text-5xl md:text-6xl font-bold gradient-text">{fullTitle}</h1>
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 mt-4">
              ¡Selecciona una asignatura para ver las apps disponibles!
            </p>
          </motion.div>

          {subjectsForCourse.length > 0 ? (
            <SubjectList subjects={subjectsForCourse} level="eso" grade={grade} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl"
            >
               <img  className="w-56 h-56 mb-8" alt="Un cohete despegando hacia las estrellas" src="https://images.unsplash.com/photo-1508693484929-012827ef8c81" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Próximamente!</h2>
              <p className="text-lg text-gray-600 max-w-md">
                Estamos trabajando para añadir las asignaturas y apps de este curso. ¡Vuelve pronto!
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default SubjectPage;