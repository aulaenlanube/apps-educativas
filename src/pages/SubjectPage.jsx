import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Folder, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { esoSubjects, primariaSubjects } from '@/apps/appList';
import Mascot from '@/components/Mascot';

const SubjectList = ({ subjects, level, grade }) => {
  const navigate = useNavigate();

  const handleSubjectClick = (subjectId) => {
    navigate(`/curso/${level}/${grade}/${subjectId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: { y: 0, opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
    >
      {subjects.map((subject) => (
        <motion.div
          key={subject.id}
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
          whileTap={{ scale: 0.98 }}
          className="bg-white/80 p-6 rounded-2xl shadow-lg border border-indigo-100 flex items-center space-x-4 cursor-pointer relative overflow-hidden group transition-colors hover:bg-white"
          onClick={() => handleSubjectClick(subject.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{subject.icon}</div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-gray-800">{subject.nombre}</h3>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const SubjectPage = () => {
  const { level, grade } = useParams();
  const navigate = useNavigate();

  // Guardamos el índice anterior para saber la dirección
  const prevIndexRef = React.useRef(null);
  const [direction, setDirection] = React.useState(0);

  const levelName = level === 'eso' ? 'ESO' : 'Primaria';
  const fullTitle = `${grade}º ${levelName}`;

  const subjectsData = level === 'eso' ? esoSubjects : primariaSubjects;
  const subjectsForCourse = subjectsData?.[grade] || [];

  const allSteps = [
    { level: 'primaria', grade: '1' },
    { level: 'primaria', grade: '2' },
    { level: 'primaria', grade: '3' },
    { level: 'primaria', grade: '4' },
    { level: 'primaria', grade: '5' },
    { level: 'primaria', grade: '6' },
    { level: 'eso', grade: '1' },
    { level: 'eso', grade: '2' },
    { level: 'eso', grade: '3' },
    { level: 'eso', grade: '4' },
  ];

  const currentIndex = allSteps.findIndex(s => s.level === level && String(s.grade) === String(grade));
  const prevStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null;
  const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null;

  React.useEffect(() => {
    if (prevIndexRef.current !== null) {
      setDirection(currentIndex > prevIndexRef.current ? 1 : -1);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  const variants = {
    initial: {
      opacity: 0,
      scale: 1.05,
      filter: "blur(8px)"
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(8px)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Asignaturas para ${fullTitle} - EduApps`}</title>
      </Helmet>
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 min-h-screen overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
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
        </header>
        <main className="container mx-auto px-6 py-16">
          <motion.div
            key={`${level}-${grade}`}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 md:space-x-8 mb-4">
                {prevStep && (
                  <motion.div whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/curso/${prevStep.level}/${prevStep.grade}`)}
                      className="rounded-full hover:bg-white/50 w-12 h-12 md:w-16 md:h-16 shrink-0 shadow-sm"
                      title="Curso anterior"
                    >
                      <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                    </Button>
                  </motion.div>
                )}

                <div className="flex items-center gap-4">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                    <Folder className="w-10 h-10 text-indigo-500 hidden md:block" />
                  </motion.div>
                  <h1 className="text-5xl md:text-6xl font-black gradient-text tracking-tight uppercase whitespace-nowrap drop-shadow-sm">{fullTitle}</h1>
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                    <Sparkles className="w-10 h-10 text-purple-500 hidden md:block" />
                  </motion.div>
                </div>

                {nextStep && (
                  <motion.div whileHover={{ scale: 1.1, x: 5 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/curso/${nextStep.level}/${nextStep.grade}`)}
                      className="rounded-full hover:bg-white/50 w-12 h-12 md:w-16 md:h-16 shrink-0 shadow-sm"
                      title="Siguiente curso"
                    >
                      <ChevronRight className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                    </Button>
                  </motion.div>
                )}
              </div>
              <Mascot />
              <p className="text-xl text-gray-600 mt-4">¡Selecciona una asignatura para ver las apps disponibles!</p>
            </div>

            {subjectsForCourse.length > 0 ? (
              <SubjectList subjects={subjectsForCourse} level={level} grade={grade} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-[3rem] shadow-xl border-b-4 border-indigo-200"
              >
                <motion.img
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-56 h-56 mb-8 drop-shadow-2xl"
                  alt="Cohete"
                  src="/images/portada.webp"
                />
                <h2 className="text-3xl font-black text-gray-800 mb-4 uppercase tracking-tight">¡Próximamente!</h2>
                <p className="text-lg text-gray-600 max-w-md">Estamos preparando los mejores contenidos para este nivel. ¡Vuelve pronto!</p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default SubjectPage;