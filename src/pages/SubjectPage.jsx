import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { NavArrowButton, AnimatedBorderButton } from '@/components/NavBackButton';
import Header from '@/components/layout/Header';
import { AnimatedGradientTitle } from '@/components/ui/GradientTitle';
import { esoSubjects, primariaSubjects, bachilleratoSubjects, adSubjects } from '@/apps/appList';
import SubjectIcon, { getSubjectAccent } from '@/components/SubjectIcon';
import { tiltProps, accentFor, keyActivate } from './navTilt';
import './NavPages.css';

const SubjectList = ({ subjects, level, grade }) => {
  const navigate = useNavigate();

  const handleSubjectClick = (subjectId) => {
    navigate(`/curso/${level}/${grade}/${subjectId}`);
  };

  // Entrada escalonada en CSS (.np-enter, wrapper) y tilt 3D en la tarjeta
  // interior: así la animación de entrada no pisa el transform del tilt.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-12">
      {subjects.map((subject, i) => (
        <div key={subject.id} className="np-enter" style={{ '--i': i }}>
          <div
            role="link"
            tabIndex={0}
            aria-label={subject.nombre}
            className="np-card np-card--row fx-spotlight fx-shine group"
            style={{ '--np-accent': getSubjectAccent(subject.id) || accentFor(i) }}
            onClick={() => handleSubjectClick(subject.id)}
            onKeyDown={keyActivate(() => handleSubjectClick(subject.id))}
            {...tiltProps}
          >
            <span className="np-card__glare" aria-hidden="true" />
            <span className="np-card__ring" aria-hidden="true" />
            <div className="np-card__body">
              <span className="np-icon">
                <SubjectIcon subjectId={subject.id} />
              </span>
              <h3 className="np-title text-lg md:text-xl">{subject.nombre}</h3>
              <span className="np-arrow" aria-hidden="true">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SubjectPage = () => {
  const { level, grade } = useParams();
  const navigate = useNavigate();

  // Guardamos el índice anterior para saber la dirección
  const prevIndexRef = React.useRef(null);
  const [direction, setDirection] = React.useState(0);

  const levelNames = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Atención a la Diversidad' };
  const levelName = levelNames[level] || 'Primaria';
  const isSpecialLevel = level === 'ad';
  const fullTitle = isSpecialLevel ? levelName : `${grade}º ${levelName}`;

  const subjectsDataMap = { primaria: primariaSubjects, eso: esoSubjects, bachillerato: bachilleratoSubjects, ad: adSubjects };
  const subjectsData = subjectsDataMap[level] || primariaSubjects;
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
    { level: 'bachillerato', grade: '1' },
    { level: 'bachillerato', grade: '2' },
    { level: 'ad', grade: '1' },
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
        <title>{`${grade}º ${levelName} — Asignaturas y apps educativas · Apps Educativas`}</title>
        <meta name="description" content={`Apps y juegos educativos para ${grade}º de ${levelName}. Lengua, matemáticas, ciencias, inglés y más. Gratis, sin descargas.`} />
        <link rel="canonical" href={`https://apps-educativas.com/curso/${level}/${grade}`} />
        <meta property="og:title" content={`${grade}º ${levelName} — Apps educativas`} />
        <meta property="og:description" content={`Apps y juegos educativos para ${grade}º de ${levelName}.`} />
        <meta property="og:url" content={`https://apps-educativas.com/curso/${level}/${grade}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://apps-educativas.com/" },
            { "@type": "ListItem", "position": 2, "name": `${grade}º ${levelName}`, "item": `https://apps-educativas.com/curso/${level}/${grade}` },
          ],
        })}</script>
      </Helmet>
      <div className="relative min-h-screen overflow-x-hidden">
        <div className="relative z-10">
        <Header>
          <AnimatedBorderButton
            onClick={() => navigate('/')}
            colors={['#ffffff', '#ffffff']}
            glowColor="rgba(255,255,255,0.45)"
            borderColor="#ffffff"
            shape="arrow"
          >
            Inicio
          </AnimatedBorderButton>
        </Header>
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
              <div className="np-enter mb-5" style={{ '--i': 0 }}>
                <span className="np-kicker">
                  <span className="np-kicker__dot" aria-hidden="true" />
                  {isSpecialLevel ? 'Bloques de trabajo' : 'Elige tu asignatura'}
                  {subjectsForCourse.length > 0 && <span className="np-count">{subjectsForCourse.length}</span>}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-3 md:space-x-8 mb-4">
                {prevStep && (
                  <NavArrowButton direction="left" colors={['#ffffff', '#ffffff']} borderColor="#ffffff" glowColor="rgba(255,255,255,0.5)" onClick={() => navigate(`/curso/${prevStep.level}/${prevStep.grade}`)} />
                )}

                <AnimatedGradientTitle className="text-5xl md:text-6xl tracking-tight uppercase whitespace-nowrap">{fullTitle}</AnimatedGradientTitle>

                {nextStep && (
                  <NavArrowButton direction="right" colors={['#ffffff', '#ffffff']} borderColor="#ffffff" glowColor="rgba(255,255,255,0.5)" onClick={() => navigate(`/curso/${nextStep.level}/${nextStep.grade}`)} />
                )}
              </div>
              <div className="relative inline-flex flex-col items-center mt-2">
                <div className="np-sub">
                  <Sparkles className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
                  <p className="text-lg md:text-xl">¡Selecciona {isSpecialLevel ? 'un bloque' : 'una asignatura'} para ver las apps disponibles!</p>
                </div>
              </div>
            </div>

            {subjectsForCourse.length > 0 ? (
              <SubjectList subjects={subjectsForCourse} level={level} grade={grade} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="np-panel mt-16 flex flex-col items-center justify-center text-center p-12 rounded-[3rem]"
              >
                <motion.img
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-56 h-56 mb-8 drop-shadow-2xl"
                  alt="Cohete"
                  src="/images/portada.webp"
                />
                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">¡Próximamente!</h2>
                <p className="text-lg text-white/80 max-w-md">Estamos preparando los mejores contenidos para este nivel. ¡Vuelve pronto!</p>
              </motion.div>
            )}
          </motion.div>
        </main>
        </div>
      </div>
    </>
  );
};

export default SubjectPage;