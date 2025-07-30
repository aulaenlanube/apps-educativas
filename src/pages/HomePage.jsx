// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Sparkles, GraduationCap, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AboutModal from '@/components/ui/AboutModal';

const HomePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const primaryGrades = [
    { grade: '1', title: '1º Primaria', color: 'from-red-400 to-pink-500', icon: '🌟' },
    { grade: '2', title: '2º Primaria', color: 'from-orange-400 to-red-500', icon: '🎨' },
    { grade: '3', title: '3º Primaria', color: 'from-yellow-400 to-orange-500', icon: '🚀' },
    { grade: '4', title: '4º Primaria', color: 'from-green-400 to-yellow-500', icon: '🎯' },
    { grade: '5', title: '5º Primaria', color: 'from-blue-400 to-green-500', icon: '🏆' },
    { grade: '6', title: '6º Primaria', color: 'from-purple-400 to-blue-500', icon: '💎' }
  ];

  const esoGrades = [
    { grade: '1', title: '1º ESO', color: 'from-indigo-500 to-purple-600', icon: '🔬' },
    { grade: '2', title: '2º ESO', color: 'from-purple-500 to-pink-600', icon: '📚' },
    { grade: '3', title: '3º ESO', color: 'from-pink-500 to-red-600', icon: '🧮' },
    { grade: '4', title: '4º ESO', color: 'from-red-500 to-orange-600', icon: '🎓' }
  ];

  const handleGradeClick = (level, grade) => {
    navigate(`/curso/${level}/${grade}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div> 
      <AboutModal open={isModalOpen} onOpenChange={setIsModalOpen} />

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
            <nav className="flex items-center">
              <Button variant="ghost" className="text-gray-700 hover:text-purple-600" onClick={() => setIsModalOpen(true)}>
                Quién soy
              </Button>
            </nav>
          </div>
        </div>
      </header>

       <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative py-20 px-6 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl transform -rotate-12 scale-150"></div>
        
        <div className="relative z-10 container mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-16 leading-normal">
              ¡Aprende Jugando!
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Descubre las mejores apps educativas organizadas por cursos. 
              Desde 1º de Primaria hasta 4º de ESO, ¡el aprendizaje nunca fue tan divertido!
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center space-x-4 mb-12"
          >
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-700 font-medium">+100 Apps</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700 font-medium">Miles de Estudiantes</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700 font-medium">Aprendizaje Garantizado</span>
            </div>
          </motion.div>

          <motion.div
            className="floating-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <img  className="w-96 h-64 mx-auto rounded-3xl shadow-2xl pulse-glow object-cover" alt="Niños aprendiendo con tablets y apps educativas" src="/images/portada.webp" />
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-6"
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <h2 className="text-4xl font-bold gradient-text">Educación Primaria</h2>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Apps diseñadas especialmente para los más pequeños, con contenido adaptado a cada nivel
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {primaryGrades.map((grade) => (
              <motion.div
                key={grade.grade}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                className="card-hover"
              >
                <div 
                  className={`bg-gradient-to-br ${grade.color} p-8 rounded-3xl shadow-xl cursor-pointer relative overflow-hidden`}
                  onClick={() => handleGradeClick('primaria', grade.grade)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative z-10 text-center text-white">
                    <div className="text-6xl mb-4">{grade.icon}</div>
                    <h3 className="text-3xl font-bold mb-2">{grade.grade}º</h3>
                    <p className="text-xl font-medium mb-4">Primaria</p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                      <span className="text-sm font-medium">Explorar Apps</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-6 bg-gradient-to-r from-indigo-50 to-purple-50"
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-500" />
              <h2 className="text-4xl font-bold gradient-text">Educación Secundaria</h2>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Contenido avanzado y especializado para estudiantes de ESO, preparándolos para el futuro
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {esoGrades.map((grade) => (
              <motion.div
                key={grade.grade}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="card-hover"
              >
                <div 
                  className={`bg-gradient-to-br ${grade.color} p-8 rounded-3xl shadow-xl cursor-pointer relative overflow-hidden`}
                  onClick={() => handleGradeClick('eso', grade.grade)}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>
                  
                  <div className="relative z-10 text-center text-white">
                    <div className="text-5xl mb-4">{grade.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{grade.grade}º</h3>
                    <p className="text-lg font-medium mb-4">ESO</p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 inline-block">
                      <span className="text-sm font-medium">Ver Asignaturas</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-6"
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">¿Por qué elegir EduApps?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma está diseñada para hacer el aprendizaje más efectivo y divertido
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Contenido de calidad</h3>
              <p className="text-gray-600">
                Todas nuestras apps están cuidadosamente verificadas y organizadas por niveles educativos 
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Aprendizaje Divertido</h3>
              <p className="text-gray-600">
                Gamificación y elementos interactivos que mantienen a los estudiantes motivados y comprometidos
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Progreso Medible</h3>
              <p className="text-gray-600">
                Seguimiento del progreso y logros para motivar el aprendizaje continuo y celebrar los éxitos
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;