import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { primariaSubjects, esoSubjects } from '@/apps/appList';
import Header from '@/components/layout/Header';
import GradientTitle from '@/components/ui/GradientTitle';
import { ArrowLeft, Folder, Sparkles } from 'lucide-react'; // Importamos los iconos necesarios

/**
 * Lista de asignaturas disponibles para un curso con el nuevo diseño de tarjetas.
 */
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
          className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-indigo-100 flex items-center space-x-4"
          onClick={() => handleSubjectClick(subject.id)}
        >
          <div className="text-4xl">{subject.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{subject.nombre}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Página que muestra las materias de un curso, soportando tanto Primaria como ESO.
 */
const SubjectPage = () => {
  const params = useParams();
  const level = params.level ?? 'primaria';
  const grade = params.grade;
  const navigate = useNavigate();

  const subjectsForCourse = level === 'primaria'
    ? (primariaSubjects && primariaSubjects[grade]) || []
    : (esoSubjects && esoSubjects[grade]) || [];
  const levelName = level === 'primaria' ? 'Primaria' : 'ESO';
  const fullTitle = `${grade}º ${levelName}`;

  return (
    <>
      <Helmet>
        <title>{`Asignaturas para ${fullTitle} - EduApps`}</title>
      </Helmet>
      
      {/* Usamos el Header reutilizable */}
      <Header>
        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
        </Button>
      </Header>

      <main className="container mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
          
          {/* Título con los iconos (emojis) recuperados */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Folder className="w-10 h-10 text-indigo-500" />
            <GradientTitle tag="h1" className="text-5xl md:text-6xl">
              {fullTitle}
            </GradientTitle>
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>

          <p className="text-xl text-gray-600 mt-4">¡Selecciona una asignatura para ver las apps disponibles!</p>
        </motion.div>

        {subjectsForCourse.length > 0 ? (
          <SubjectList subjects={subjectsForCourse} level={level} grade={grade} />
        ) : (
          // Mensaje "Próximamente" con el nuevo diseño
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2, duration: 0.5 }} 
            className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl"
          >
            <img className="w-56 h-56 mb-8 object-cover rounded-full" alt="Un cohete despegando hacia las estrellas" src="/images/portada.webp" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Próximamente!</h2>
            <p className="text-lg text-gray-600 max-w-md">Estamos trabajando para añadir las asignaturas y apps de este curso. ¡Vuelve pronto!</p>
          </motion.div>
        )}
      </main>
    </>
  );
};

export default SubjectPage;