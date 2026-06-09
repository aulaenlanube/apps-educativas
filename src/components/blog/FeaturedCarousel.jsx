import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { buildPostUrl, formatDateLong } from '@/blog/utils';
import { getCategory } from '@/blog/categories';
import './FeaturedCarousel.css';

const SLIDE_MS = 6000;

// Transición direccional de los slides: entra desde el lado hacia el que
// avanzamos, sale hacia el opuesto, con un punto de profundidad (scale + blur).
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '60%' : '-60%',
    opacity: 0,
    scale: 1.04,
    filter: 'blur(14px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? '-50%' : '50%',
    opacity: 0,
    scale: 1.04,
    filter: 'blur(14px)',
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  }),
};

// Revelado escalonado del contenido textual de cada slide.
const contentParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};
const contentChild = {
  hidden: { y: 26, opacity: 0, filter: 'blur(6px)' },
  show: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FeaturedCarousel({ posts }) {
  const slides = useMemo(() => (posts || []).slice(0, 5), [posts]);
  const count = slides.length;
  const [[index, dir], setState] = useState([0, 0]);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const go = useCallback(
    (target) => setState(([cur]) => [target, target > cur ? 1 : target < cur ? -1 : 0]),
    []
  );

  const paginate = useCallback(
    (step) => setState(([cur]) => [((cur + step) % count + count) % count, step]),
    [count]
  );

  // Auto-avance, reiniciado en cada cambio de slide y pausado al interactuar.
  useEffect(() => {
    if (count <= 1 || paused) return undefined;
    timer.current = setTimeout(() => paginate(1), SLIDE_MS);
    return () => clearTimeout(timer.current);
  }, [index, paused, count, paginate]);

  if (count === 0) return null;

  const post = slides[index];
  const category = getCategory(post.category);
  const heroSrc = post.hero || (post.videoId ? `https://i.ytimg.com/vi/${post.videoId}/maxresdefault.jpg` : null);
  const gradient = category?.gradient || 'from-indigo-600 via-purple-600 to-fuchsia-600';
  const accent = category?.accent || '#7C3AED';

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="group/carousel relative mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 aspect-[3/4] sm:aspect-[16/9] md:aspect-[5/2]">
        {/* Capa de slides */}
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={post.slug}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {/* Fondo: imagen con Ken Burns o gradiente de categoría */}
            {heroSrc ? (
              <img
                key={`img-${post.slug}`}
                src={heroSrc}
                alt={post.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="fc-kenburns absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
            )}

            {/* Orbes de color a juego con la categoría */}
            <div
              className="fc-orb-a absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-50"
              style={{ background: accent }}
            />
            <div
              className="fc-orb-b absolute -right-20 bottom-0 h-80 w-80 rounded-full blur-3xl opacity-40"
              style={{ background: accent }}
            />

            {/* Scrims de legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/45 to-slate-950/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />
            <div className="fc-grain absolute inset-0 opacity-[0.07] pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Badges fijados arriba a la izquierda: independientes de la altura
            del texto, así nunca los recorta el overflow del contenedor. */}
        <div className="absolute left-5 top-5 z-20 sm:left-7 sm:top-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${post.slug}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              {category && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg ring-1 ring-white/30 backdrop-blur-sm"
                  style={{ background: `linear-gradient(110deg, ${accent}, ${accent}cc)` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {category.name}
                </span>
              )}
              {post.videoId && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg ring-1 ring-white/30">
                  <Play className="h-3 w-3 fill-current" /> Vídeo
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Contenido textual (sobre los slides, animado por clave) */}
        <div className="absolute inset-0 flex items-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${post.slug}`}
              variants={contentParent}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
              className="relative z-10 w-full p-6 sm:p-8 md:p-10 lg:max-w-3xl"
            >
              <motion.h2
                variants={contentChild}
                className="text-2xl font-black leading-[1.1] text-white drop-shadow-xl sm:text-3xl md:text-4xl line-clamp-2"
              >
                <Link to={buildPostUrl(post.slug)} className="transition-opacity hover:opacity-90">
                  {post.title}
                </Link>
              </motion.h2>

              {post.excerpt && (
                <motion.p
                  variants={contentChild}
                  className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-slate-200/90 sm:block md:text-base line-clamp-2"
                >
                  {post.excerpt}
                </motion.p>
              )}

              <motion.div variants={contentChild} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  to={buildPostUrl(post.slug)}
                  className="fc-shine group/cta relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-xl transition-transform duration-300 hover:scale-[1.03]"
                >
                  Leer artículo
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </Link>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateLong(post.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingMinutes} min
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flechas (aparecen al hover en desktop) */}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => paginate(-1)}
              className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2 text-white opacity-0 backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/30 group-hover/carousel:opacity-100 md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => paginate(1)}
              className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2 text-white opacity-0 backdrop-blur-md ring-1 ring-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/30 group-hover/carousel:opacity-100 md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Barras de progreso / paginación */}
        {count > 1 && (
          <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2 sm:bottom-5 sm:right-7">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                aria-label={`Ir al artículo ${i + 1}`}
                onClick={() => go(i)}
                className="group/dot relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-500"
                style={{ width: i === index ? 40 : 14 }}
              >
                {i === index && !paused && (
                  <span
                    key={`fill-${index}`}
                    className="fc-progress-fill absolute inset-0 rounded-full bg-white"
                    style={{ animationDuration: `${SLIDE_MS}ms` }}
                  />
                )}
                {i === index && paused && (
                  <span className="absolute inset-0 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
