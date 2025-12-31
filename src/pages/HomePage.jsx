import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Sparkles, GraduationCap, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '@/components/layout/Header';
import GradientTitle from '@/components/ui/GradientTitle';

const HomePage = () => {
  const navigate = useNavigate();
  // Ahora obtenemos la función del modal desde el MainLayout
  const { setIsModalOpen } = useOutletContext();

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
      <Header>
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          onClick={() => setIsModalOpen(true)}
        >
          Quién soy
        </Button>
      </Header>

      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative py-20 px-6 text-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl transform -rotate-12 scale-150 pointer-events-none"></div>

        <div className="relative z-10 container mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <GradientTitle tag="h1" className="text-5xl md:text-7xl mb-8 leading-tight">
              ¡Aprende Jugando!
            </GradientTitle>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre las mejores apps educativas organizadas por cursos. <br className="hidden md:block" />
              Desde 1º de Primaria hasta 4º de ESO, ¡el aprendizaje nunca fue tan divertido!
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {[
              { icon: Users, text: "Apps por niveles", color: "text-blue-500" },
              { icon: Star, text: "100% gratis", color: "text-yellow-500" },
              { icon: Trophy, text: "Aprendizaje basado en el juego", color: "text-purple-500" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-white/60 backdrop-blur-md px-5 py-3 rounded-full shadow-sm border border-white/50">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-gray-700 font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="floating-animation relative inline-block"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2rem] blur opacity-30"></div>
            <img
              className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl object-cover h-[200px] md:h-[300px]"
              alt="Niños aprendiendo con tablets y apps educativas"
              src="/images/portada.webp"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Sección Primaria */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 px-6"
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <GradientTitle tag="h2" className="text-4xl">Educación Primaria</GradientTitle>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Apps diseñadas especialmente para los más pequeños, con contenido adaptado a cada nivel.
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <div
                  className={`bg-gradient-to-br ${grade.color} p-8 rounded-3xl shadow-lg cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-2xl`}
                  onClick={() => handleGradeClick('primaria', grade.grade)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 transition-transform group-hover:scale-110"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 transition-transform group-hover:scale-110"></div>

                  <div className="relative z-10 text-center text-white">
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{grade.icon}</div>
                    <h3 className="text-4xl font-bold mb-2">{grade.grade}º</h3>
                    <p className="text-xl font-medium mb-6 opacity-90">Primaria</p>
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-2 inline-block border border-white/30 group-hover:bg-white/30 transition-colors">
                      <span className="text-sm font-bold">Explorar</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Sección Secundaria */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 px-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50"
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-500" />
              <GradientTitle tag="h2" className="text-4xl">Educación Secundaria</GradientTitle>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Contenido avanzado y especializado para estudiantes de ESO.
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <div
                  className={`bg-gradient-to-br ${grade.color} p-8 rounded-3xl shadow-lg cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-2xl`}
                  onClick={() => handleGradeClick('eso', grade.grade)}
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 translate-x-14 group-hover:scale-110 transition-transform"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10 group-hover:scale-110 transition-transform"></div>

                  <div className="relative z-10 text-center text-white">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{grade.icon}</div>
                    <h3 className="text-3xl font-bold mb-2">{grade.grade}º</h3>
                    <p className="text-lg font-medium mb-6 opacity-90">ESO</p>
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-2 inline-block border border-white/30 group-hover:bg-white/30 transition-colors">
                      <span className="text-sm font-bold">Ver Asignaturas</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer Promocional */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-20 px-6"
      >
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <GradientTitle tag="h2" className="text-4xl mb-4">¿Por qué elegir EduApps?</GradientTitle>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Una plataforma diseñada para hacer el aprendizaje más efectivo y divertido.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: BookOpen, title: "Contenido de calidad", desc: "Apps verificadas y organizadas por niveles educativos.", color: "from-blue-500 to-purple-600" },
              { icon: Star, title: "Aprendizaje Divertido", desc: "No es gamificación, es una plataforma de educación basada en el juego para mantener la motivación alta.", color: "from-purple-500 to-pink-600" },
              { icon: Trophy, title: "Progreso Medible", desc: "Modo de práctica y modo examen.", color: "from-green-500 to-blue-600" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;