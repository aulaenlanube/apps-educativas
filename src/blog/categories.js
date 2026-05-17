// Categorías del blog. El `slug` viaja en la URL (/blog/categoria/:slug)
// y es la referencia que escriben los posts en su frontmatter (`category:`).
// El `gradient` se usa en las tarjetas para que cada categoría tenga
// identidad visual propia, en línea con el resto de la plataforma.

export const BLOG_CATEGORIES = [
  {
    slug: 'plataforma-eduapps',
    name: 'Plataforma EduApps',
    description: 'Novedades, releases y demos de la plataforma apps-educativas.com',
    gradient: 'from-blue-500 via-violet-500 to-fuchsia-500',
    accent: '#7C3AED',
  },
  {
    slug: 'ia-en-educacion',
    name: 'IA en educación',
    description: 'Uso de LLMs y herramientas de IA en el aula, prompts y flujos para docentes',
    gradient: 'from-indigo-500 via-purple-600 to-pink-500',
    accent: '#6366F1',
  },
  {
    slug: 'gamificacion',
    name: 'Gamificación',
    description: 'Insignias, puntos, mecánicas de juego y cómo motivar al alumnado de verdad',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    accent: '#F59E0B',
  },
  {
    slug: 'flipped-classroom',
    name: 'Flipped Classroom',
    description: 'Aula invertida, vídeo como deber y tiempo de clase para práctica guiada',
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    accent: '#0EA5E9',
  },
  {
    slug: 'abp',
    name: 'Aprendizaje basado en proyectos',
    description: 'Proyectos transversales, evaluación por producto y retos reales',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    accent: '#10B981',
  },
  {
    slug: 'innovacion-educativa',
    name: 'Innovación educativa',
    description: 'Metodologías activas, neuroeducación y herramientas que cambian el aula',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
    accent: '#EC4899',
  },
  {
    slug: 'atencion-diversidad',
    name: 'Atención a la diversidad',
    description: 'TDAH, dislexia, TEA, altas capacidades, AL y PT — guía para docentes',
    gradient: 'from-teal-500 via-cyan-600 to-indigo-600',
    accent: '#14B8A6',
  },
];

export const CATEGORIES_BY_SLUG = Object.fromEntries(
  BLOG_CATEGORIES.map((c) => [c.slug, c])
);

export function getCategory(slug) {
  return CATEGORIES_BY_SLUG[slug] || null;
}
