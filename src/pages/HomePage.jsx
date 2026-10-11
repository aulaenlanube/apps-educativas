import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  BookOpen, Star, Sparkles, GraduationCap, Users, Trophy, HeartHandshake, Brain, Play, Gamepad2, Award,
  UserCog, SlidersHorizontal, ArrowRight, Calculator, Atom, Globe2, Music, Puzzle, FlaskConical, Languages, Palette,
} from 'lucide-react';
import { AnimatedBorderButton } from '@/components/NavBackButton';
import { Link, useOutletContext } from 'react-router-dom';
import Header from '@/components/layout/Header';
import GradientTitle from '@/components/ui/GradientTitle';
import Mascot from '@/components/Mascot';
import GradeCardIcon from '@/components/GradeCardIcon';
import TiltCard from '@/components/ui/TiltCard';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import useSEO from '@/hooks/useSEO';
import './HomePage.css';

const primaryGrades = [
  { grade: '1', title: '1º Primaria', color: 'from-red-400 to-pink-500', glow: '#f472b6' },
  { grade: '2', title: '2º Primaria', color: 'from-orange-400 to-red-500', glow: '#fb923c' },
  { grade: '3', title: '3º Primaria', color: 'from-yellow-400 to-orange-500', glow: '#fbbf24' },
  { grade: '4', title: '4º Primaria', color: 'from-green-400 to-yellow-500', glow: '#a3e635' },
  { grade: '5', title: '5º Primaria', color: 'from-blue-400 to-green-500', glow: '#34d399' },
  { grade: '6', title: '6º Primaria', color: 'from-purple-400 to-blue-500', glow: '#818cf8' },
];

const esoGrades = [
  { grade: '1', title: '1º ESO', color: 'from-indigo-500 to-purple-600', glow: '#8b5cf6' },
  { grade: '2', title: '2º ESO', color: 'from-purple-500 to-pink-600', glow: '#d946ef' },
  { grade: '3', title: '3º ESO', color: 'from-pink-500 to-red-600', glow: '#f43f5e' },
  { grade: '4', title: '4º ESO', color: 'from-red-500 to-orange-600', glow: '#f97316' },
];

const bachilleratoGrades = [
  { grade: '1', title: '1º Bachillerato', color: 'from-emerald-600 to-teal-700', glow: '#10b981' },
  { grade: '2', title: '2º Bachillerato', color: 'from-teal-600 to-cyan-700', glow: '#06b6d4' },
];

// Asignaturas que orbitan alrededor del robot en el hero
const ORBIT_CHIPS = [
  { icon: Calculator, label: 'Mates', color: '#f59e0b' },
  { icon: BookOpen, label: 'Lengua', color: '#ec4899' },
  { icon: Atom, label: 'Ciencias', color: '#22d3ee' },
  { icon: Languages, label: 'Inglés', color: '#8b5cf6' },
  { icon: Globe2, label: 'Geografía', color: '#10b981' },
  { icon: Music, label: 'Música', color: '#f472b6' },
  { icon: FlaskConical, label: 'Química', color: '#a3e635' },
  { icon: Puzzle, label: 'Lógica', color: '#6366f1' },
  { icon: Palette, label: 'Arte', color: '#fb923c' },
];

const STATS = [
  { value: 50, suffix: '+', label: 'apps educativas' },
  { value: 13, suffix: '', label: 'cursos y etapas' },
  { value: 128, suffix: '', label: 'insignias' },
  { value: 70, suffix: '', label: 'avatares' },
  { value: 101, suffix: '', label: 'niveles de XP' },
];

const FEATURES = [
  { icon: BookOpen, title: 'Contenido de calidad', desc: 'Apps verificadas y organizadas por niveles educativos, desde 1º de Primaria hasta 2º de Bachillerato.', color: 'from-blue-500 to-purple-600', glow: '#6366f1' },
  { icon: Star, title: 'Aprendizaje Divertido', desc: 'Plataforma de educación basada en el juego para mantener la motivación alta.', color: 'from-purple-500 to-pink-600', glow: '#d946ef' },
  { icon: SlidersHorizontal, title: 'Niveles de dificultad', desc: 'Cada app tiene modo fácil, medio y examen. Practica a tu ritmo y demuestra lo que sabes en el modo examen con nota sobre 10.', color: 'from-green-500 to-blue-600', glow: '#10b981' },
  { icon: Gamepad2, title: 'Experiencia y niveles', desc: 'Gana puntos de experiencia (XP) jugando a las apps. Sube de nivel y compite en el ranking global con alumnos de todos los cursos.', color: 'from-amber-500 to-orange-600', glow: '#f59e0b' },
  { icon: Award, title: 'Insignias coleccionables', desc: 'Desbloquea insignias por tus logros: desde comunes hasta legendarias. Juega cada día, supera récords y completa retos para conseguirlas todas.', color: 'from-rose-500 to-red-600', glow: '#f43f5e' },
  { icon: UserCog, title: 'Gestión docente sencilla', desc: 'Los docentes pueden crear grupos, añadir alumnos y gestionar todo sin necesidad de correo electrónico. El docente tiene el control total.', color: 'from-teal-500 to-emerald-600', glow: '#14b8a6' },
];

const TERMINAL_LINES = [
  { p: '$', t: 'claude "crea una app de fracciones para 1º ESO"' },
  { p: '›', t: 'Diseñando pantallas: fácil · medio · examen…' },
  { p: '›', t: 'Generando ilustraciones y animaciones…' },
  { p: '✓', t: 'App lista. 0 líneas escritas a mano.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { y: 28, opacity: 0, filter: 'blur(6px)' },
  visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Título del hero: letra a letra con flotación y degradado animado (identidad
// original de la home), ahora con un brillo de entrada.
function HeroTitle() {
  const words = '¡Aprende Jugando!'.split(' ');
  let charIndex = 0;
  return (
    <h1 className="home-hero__title font-bold gradient-title-stroke text-5xl sm:text-6xl xl:text-7xl" style={{ lineHeight: 1.25 }}>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          {wi > 0 && <span>{' '}</span>}
          <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
            {word.split('').map((char) => {
              const i = charIndex++;
              return (
                <span key={i} style={{ display: 'inline-block', animation: `hero-float 3s ease-in-out ${i * 0.12}s infinite` }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0 0.04em',
                      margin: '0 -0.04em',
                      backgroundImage: 'linear-gradient(90deg, #2563EB, #7C3AED, #EC4899, #F59E0B, #2563EB)',
                      backgroundSize: '600% 100%',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `hero-enter 0.6s cubic-bezier(.34,1.56,.64,1) ${0.3 + i * 0.045}s both, hero-gradient 6s linear ${i * -0.35}s infinite`,
                    }}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
          </span>
        </React.Fragment>
      ))}
    </h1>
  );
}

// Chips de asignaturas en órbita elíptica alrededor del robot. Posiciones en un
// rAF escribiendo transform directamente (sin re-render); pausa fuera de pantalla.
function OrbitChips() {
  const wrapRef = useRef(null);
  const chipRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    let raf = 0;
    let visible = true;
    let size = { w: wrap.offsetWidth, h: wrap.offsetHeight };
    const n = ORBIT_CHIPS.length;

    const place = (t) => {
      const rx = size.w * 0.47;
      const ry = size.h * 0.12;
      const cy = size.h * 0.64;
      for (let i = 0; i < n; i++) {
        const el = chipRefs.current[i];
        if (!el) continue;
        const a = t * 0.00018 + (i * Math.PI * 2) / n;
        const depth = Math.sin(a); // -1 detrás · 1 delante
        const x = Math.cos(a) * rx;
        const y = cy + depth * ry - size.h / 2;
        const s = 0.72 + (depth + 1) * 0.17;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        el.style.opacity = (0.45 + (depth + 1) * 0.275).toFixed(2);
        el.style.zIndex = depth > 0 ? '4' : '1';
        el.style.filter = depth < -0.35 ? 'blur(1.2px) saturate(.8)' : 'none';
      }
    };

    const loop = (t) => {
      place(t);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const ro = new ResizeObserver(() => { size = { w: wrap.offsetWidth, h: wrap.offsetHeight }; });
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduceMotion) raf = requestAnimationFrame(loop);
    });
    io.observe(wrap);

    if (reduceMotion) place(4000);
    else raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduceMotion]);

  return (
    <div ref={wrapRef} className="home-orbit" aria-hidden="true">
      {ORBIT_CHIPS.map(({ icon: Icon, label, color }, i) => (
        <div key={label} ref={(el) => { chipRefs.current[i] = el; }} className="home-orbit__chip" style={{ '--chip': color }}>
          <span className="home-orbit__icon"><Icon className="w-4 h-4" /></span>
          <span className="home-orbit__label">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Terminal que "escribe" las líneas cuando entra en pantalla.
function AITerminal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState({ line: 0, char: 0 });

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      setTyped({ line: TERMINAL_LINES.length, char: 0 });
      return undefined;
    }
    let { line, char } = { line: 0, char: 0 };
    let timer;
    const tick = () => {
      const current = TERMINAL_LINES[line];
      if (!current) return;
      if (char < current.t.length) {
        char += 1;
        setTyped({ line, char });
        timer = setTimeout(tick, line === 0 ? 34 : 18);
      } else {
        line += 1;
        char = 0;
        setTyped({ line, char });
        timer = setTimeout(tick, 420);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [inView, reduceMotion]);

  return (
    <div ref={ref} className="home-term" aria-hidden="true">
      <div className="home-term__bar">
        <span style={{ background: '#f87171' }} />
        <span style={{ background: '#fbbf24' }} />
        <span style={{ background: '#34d399' }} />
        <em>eduapps — ia</em>
      </div>
      <div className="home-term__body">
        {TERMINAL_LINES.map((l, i) => {
          if (i > typed.line) return null;
          const text = i < typed.line ? l.t : l.t.slice(0, typed.char);
          const done = l.p === '✓';
          return (
            <div key={i} className={`home-term__line ${done ? 'is-done' : ''}`}>
              <span className="home-term__prompt">{l.p}</span>
              <span>{text}</span>
              {i === typed.line && <span className="home-term__caret" />}
            </div>
          );
        })}
        {typed.line >= TERMINAL_LINES.length && (
          <div className="home-term__line"><span className="home-term__prompt">$</span><span className="home-term__caret" /></div>
        )}
      </div>
    </div>
  );
}

function StatsStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="home-stats fx-glass-dark"
    >
      {STATS.map((s) => (
        <div key={s.label} className="home-stats__item">
          <span className="home-stats__value fx-text-grad">
            <AnimatedNumber value={inView ? s.value : 0} duration={1400} />{s.suffix}
          </span>
          <span className="home-stats__label">{s.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

// Encabezado de sección (mantiene GradientTitle, la identidad de la home)
function SectionHeading({ iconLeft: L, iconRight: R, leftClass, rightClass, kicker, title, children }) {
  return (
    <motion.div variants={itemVariants} className="text-center mb-14">
      {kicker && <span className="home-kicker">{kicker}</span>}
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="home-heading-icon"><L className={`w-7 h-7 ${leftClass}`} /></span>
        <GradientTitle tag="h2" className="text-4xl md:text-5xl gradient-title-stroke">{title}</GradientTitle>
        <span className="home-heading-icon"><R className={`w-7 h-7 ${rightClass}`} /></span>
      </div>
      <p className="text-lg md:text-xl text-white/85 drop-shadow max-w-2xl mx-auto">{children}</p>
    </motion.div>
  );
}

function GradeCard({ to, ariaLabel, color, glow, type, grade, number, label, cta, size = 'md' }) {
  return (
    <motion.div variants={itemVariants} whileTap={{ scale: 0.97 }} className="group home-grade-wrap">
      <TiltCard
        as={Link}
        to={to}
        aria-label={ariaLabel}
        max={7}
        className={`home-grade home-grade--${size} bg-gradient-to-br ${color} no-underline`}
        style={{ '--glow': glow }}
      >
        <span className="home-grade__gloss" aria-hidden="true" />
        <span className="home-grade__orbs" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="home-grade__sheen" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center fx-tilt__pop">
          <div className="home-grade__icon">
            <GradeCardIcon type={type} grade={grade} />
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="home-grade__num">{number}</span>
            <span className="home-grade__label">{label}</span>
          </div>
          <div className="home-grade__cta">
            <span>{cta}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

const HomePage = () => {
  // Ahora obtenemos la función del modal desde el MainLayout
  const { setIsModalOpen } = useOutletContext();

  useSEO({
    title: 'Apps Educativas — Juegos interactivos para Primaria, ESO y Bachillerato',
    description: 'Plataforma gratuita con más de 50 apps educativas y juegos interactivos para Primaria (1º-6º), ESO y Bachillerato. Lengua, matemáticas, ciencias, inglés, tutoría y atención a la diversidad. Rosco, ahorcado, quiz battle, duelos 1 vs 1 y panel del docente.',
    canonical: 'https://apps-educativas.com/',
  });

  const scrollToCourses = (e) => {
    e.preventDefault();
    document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="home">
      <Header>
        <AnimatedBorderButton
          onClick={() => setIsModalOpen(true)}
          colors={['#ffffff', '#ffffff']}
          glowColor="rgba(255,255,255,0.45)"
          borderColor="#ffffff"
        >
          Quién soy
        </AnimatedBorderButton>
      </Header>

      {/* ===== HERO ===== */}
      <section className="home-hero relative px-6 pt-10 md:pt-14 pb-10 overflow-hidden">
        <div className="home-hero__aurora" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="home-hero__stars" aria-hidden="true">
          {[...Array(18)].map((_, i) => <i key={i} style={{ '--i': i, left: `${(i * 53) % 96 + 2}%`, top: `${(i * 37) % 72 + 4}%` }} />)}
        </div>

        <div className="relative z-10 container mx-auto grid lg:grid-cols-[1.08fr_1fr] gap-6 lg:gap-4 items-center">
          <div className="text-center lg:text-left">
            <motion.span
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="home-pill"
            >
              <Sparkles className="w-4 h-4" />
              Primaria · ESO · Bachillerato · Diversidad
            </motion.span>

            <HeroTitle />

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-2xl text-white/90 drop-shadow-md max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8"
            >
              Descubre las mejores apps educativas organizadas por cursos.{' '}
              Desde 1º de Primaria hasta 2º de Bachillerato, ¡el aprendizaje nunca fue tan divertido!
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
            >
              <a href="#cursos" onClick={scrollToCourses} className="fx-btn fx-shine fx-shine--auto home-cta no-underline">
                <GraduationCap className="w-5 h-5" />
                Elige tu curso
                <ArrowRight className="w-5 h-5 home-cta__arrow" />
              </a>
              <Link to="/catalogo" className="home-cta-ghost no-underline">
                <Gamepad2 className="w-5 h-5" />
                Ver todas las apps
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } } }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: Users, text: 'Apps por niveles', color: 'text-sky-300' },
                { icon: Star, text: '100% gratis', color: 'text-amber-300' },
                { icon: Trophy, text: 'Sin publicidad', color: 'text-fuchsia-300' },
              ].map((item) => (
                <motion.div key={item.text} variants={itemVariants} className="home-badge">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Robot + órbita */}
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="home-hero__robot"
          >
            <OrbitChips />
            <div className="home-hero__robot-inner">
              <Mascot />
            </div>
          </motion.div>
        </div>

        <motion.a
          href="#cursos"
          onClick={scrollToCourses}
          className="home-scroll-hint no-underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          aria-label="Ir a los cursos"
        >
          <span />
        </motion.a>
      </section>

      {/* ===== CIFRAS ===== */}
      <div className="px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <StatsStrip />
        </div>
      </div>

      {/* ===== IA ===== */}
      <section className="px-6 pt-16 relative">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto max-w-5xl"
        >
          <div className="home-ai fx-aurora-border fx-aurora-glow">
            <div className="home-ai__inner fx-grain">
              <div className="home-ai__grid fx-grid-bg" aria-hidden="true" />
              <div className="relative z-10 grid md:grid-cols-[1.25fr_1fr] gap-8 items-center">
                <div className="text-center md:text-left">
                  <span className="home-kicker home-kicker--dark"><Brain className="w-4 h-4" /> Hecha con IA</span>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                    Programada 100% con{' '}
                    <span className="fx-text-grad">Inteligencia Artificial</span>
                  </h2>
                  <p className="text-base md:text-lg text-indigo-100/85 mb-3 leading-relaxed">
                    Esta plataforma ha sido creada completamente desde cero con IA, sin escribir una sola
                    línea de código de forma manual. Cada app, cada pantalla, cada interacción ha sido
                    generada con inteligencia artificial.
                  </p>
                  <p className="text-sm md:text-base text-indigo-200/65 mb-7">
                    El futuro de la educación ya esta aquí: herramientas creadas con IA para que alumnos
                    y docentes aprendan de la forma más efectiva y divertida posible.
                  </p>
                  <a
                    href="https://www.youtube.com/playlist?list=PLMhQ6qm8uYWCnvsJLZRIDv1mqtKVGmXXI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fx-btn fx-shine no-underline text-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Te lo explico todo aquí
                  </a>
                </div>
                <AITerminal />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <div id="cursos" className="scroll-mt-24" />

      {/* ===== PRIMARIA ===== */}
      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="py-16 px-6">
        <div className="container mx-auto">
          <SectionHeading iconLeft={BookOpen} iconRight={Sparkles} leftClass="text-sky-300" rightClass="text-fuchsia-300" kicker="6 cursos" title="Educación Primaria">
            Apps diseñadas especialmente para los más pequeños, con contenido adaptado a cada nivel.
          </SectionHeading>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {primaryGrades.map((g) => (
              <GradeCard
                key={g.grade}
                to={`/curso/primaria/${g.grade}`}
                ariaLabel={`Apps educativas para ${g.title}`}
                color={g.color}
                glow={g.glow}
                type="primaria"
                grade={g.grade}
                number={`${g.grade}º`}
                label="Primaria"
                cta="Explorar"
                size="lg"
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== ESO ===== */}
      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="py-16 px-6">
        <div className="container mx-auto">
          <SectionHeading iconLeft={GraduationCap} iconRight={Trophy} leftClass="text-indigo-300" rightClass="text-purple-300" kicker="4 cursos" title="Educación Secundaria">
            Contenido avanzado y especializado para estudiantes de ESO.
          </SectionHeading>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {esoGrades.map((g) => (
              <GradeCard
                key={g.grade}
                to={`/curso/eso/${g.grade}`}
                ariaLabel={`Apps educativas para ${g.title}`}
                color={g.color}
                glow={g.glow}
                type="eso"
                grade={g.grade}
                number={`${g.grade}º`}
                label="ESO"
                cta="Ver Asignaturas"
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== BACHILLERATO ===== */}
      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="py-16 px-6">
        <div className="container mx-auto">
          <SectionHeading iconLeft={GraduationCap} iconRight={Star} leftClass="text-emerald-300" rightClass="text-teal-300" kicker="2 cursos" title="Bachillerato">
            Prepárate para la universidad con contenido de alto nivel adaptado a cada asignatura.
          </SectionHeading>
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-7 max-w-2xl mx-auto">
            {bachilleratoGrades.map((g) => (
              <GradeCard
                key={g.grade}
                to={`/curso/bachillerato/${g.grade}`}
                ariaLabel={`Apps educativas para ${g.title}`}
                color={g.color}
                glow={g.glow}
                type="bachillerato"
                grade={g.grade}
                number={`${g.grade}º`}
                label="Bach."
                cta="Ver Asignaturas"
              />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== ATENCIÓN A LA DIVERSIDAD ===== */}
      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="py-16 px-6">
        <div className="container mx-auto">
          <SectionHeading iconLeft={HeartHandshake} iconRight={Brain} leftClass="text-rose-300" rightClass="text-teal-300" kicker="AL · PT · Cognición" title="Atención a la Diversidad">
            Apps especializadas para profesionales de Audición y Lenguaje, Pedagogía Terapéutica y apoyo al desarrollo cognitivo y comunicativo.
          </SectionHeading>

          <motion.div variants={containerVariants} className="flex justify-center max-w-xl mx-auto">
            <motion.div variants={itemVariants} whileTap={{ scale: 0.97 }} className="group w-full home-grade-wrap">
              <TiltCard
                as={Link}
                to="/curso/ad/1"
                aria-label="Apps educativas para Atención a la Diversidad"
                max={5}
                className="home-grade home-grade--lg bg-gradient-to-br from-teal-500 via-cyan-600 to-indigo-600 no-underline"
                style={{ '--glow': '#22d3ee' }}
              >
                <span className="home-grade__gloss" aria-hidden="true" />
                <span className="home-grade__orbs" aria-hidden="true"><i /><i /><i /></span>
                <span className="home-grade__sheen" aria-hidden="true" />
                <div className="relative z-10 flex flex-col items-center fx-tilt__pop">
                  <div className="home-grade__icon">
                    <GradeCardIcon type="ad" grade="1" />
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-black text-white drop-shadow-sm block">Atención a la</span>
                    <span className="text-3xl font-black text-white drop-shadow-sm block">Diversidad</span>
                  </div>
                  <p className="text-white/85 text-sm text-center mb-5 px-4 max-w-md leading-relaxed">
                    Apps especializadas de Audición y Lenguaje, Pedagogía Terapéutica y desarrollo cognitivo. Articulación, vocabulario, pragmática, atención, memoria, funciones ejecutivas, habilidades sociales y mucho más.
                  </p>
                  <div className="home-grade__cta">
                    <span>Explorar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>

          {/* Acceso al catálogo completo: cierra el recorrido por cursos
              (Primaria → ESO → Bachillerato → Diversidad) ofreciendo la vista
              transversal de TODAS las apps. */}
          <motion.div variants={itemVariants} className="flex justify-center mt-14">
            <Link to="/catalogo" className="home-catalog fx-aurora-border fx-shine no-underline">
              <span className="home-catalog__icon"><Gamepad2 className="w-5 h-5" /></span>
              Explora el catálogo de apps
              <ArrowRight className="w-5 h-5 home-cta__arrow" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== POR QUÉ ===== */}
      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-14">
            <span className="home-kicker">Ventajas</span>
            <GradientTitle tag="h2" className="text-4xl md:text-5xl mb-4 gradient-title-stroke">¿Por qué elegir EduApps?</GradientTitle>
            <p className="text-lg md:text-xl text-white/85 drop-shadow max-w-3xl mx-auto">
              Una plataforma diseñada para hacer el aprendizaje más efectivo y divertido.
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <TiltCard max={4} className="home-feature fx-glass h-full" style={{ '--glow': feature.glow }}>
                  <div className={`home-feature__icon bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 home-feature__title">{feature.title}</h3>
                  <p className="leading-relaxed home-feature__desc">{feature.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
