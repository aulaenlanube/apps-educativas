import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { BLOG_CATEGORIES } from '@/blog/categories';
import { buildCategoryUrl } from '@/blog/utils';

// Pill de categoría con identidad propia: swatch con el gradiente de la
// categoría, glow del color de acento, micro-elevación al hover y un anillo
// animado compartido (layoutId) que se desliza hasta la categoría activa.
function CategoryPill({ to, active, accent, gradient, children, dot }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="relative"
    >
      <Link
        to={to}
        className={`group/pill relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-300 ${
          active
            ? 'text-white'
            : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 backdrop-blur-sm hover:text-slate-900 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700 dark:hover:text-white'
        }`}
        style={
          active
            ? { boxShadow: `0 8px 24px -8px ${accent}aa, 0 0 0 1px ${accent}55` }
            : undefined
        }
      >
        {/* Fondo activo con gradiente: layoutId hace que se deslice de un
            pill a otro al cambiar de categoría. Va detrás del contenido
            (z-0) mientras el texto queda por encima (relative z-10), así
            es visible (antes -z-10 lo ocultaba tras la tarjeta). */}
        {active && (
          <motion.span
            layoutId="cat-active-bg"
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient}`}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          {/* Swatch / punto identificativo de la categoría */}
          {dot ? (
            <LayoutGrid className="h-3 w-3 shrink-0" />
          ) : (
            <span
              className={`h-2 w-2 shrink-0 rounded-full bg-gradient-to-br ${gradient} ${
                active ? 'ring-2 ring-white/70' : 'ring-1 ring-black/5'
              } transition-transform duration-300 group-hover/pill:scale-125`}
            />
          )}
          {children}
        </span>
      </Link>
    </motion.div>
  );
}

export default function CategoryNav({ activeSlug = null }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
      }}
      className="flex flex-wrap justify-center gap-2"
    >
      <motion.div variants={{ hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
        <CategoryPill
          to="/blog"
          active={activeSlug === null}
          accent="#0f172a"
          gradient="from-slate-700 to-slate-900"
          dot
        >
          Todos
        </CategoryPill>
      </motion.div>

      {BLOG_CATEGORIES.map((cat) => (
        <motion.div
          key={cat.slug}
          variants={{ hidden: { y: 12, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        >
          <CategoryPill
            to={buildCategoryUrl(cat.slug)}
            active={cat.slug === activeSlug}
            accent={cat.accent}
            gradient={cat.gradient}
          >
            {cat.name}
          </CategoryPill>
        </motion.div>
      ))}
    </motion.div>
  );
}
