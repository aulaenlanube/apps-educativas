import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import useSEO from '@/hooks/useSEO';
import { getCategory } from '@/blog/categories';
import { getPostsByCategory } from '@/blog/loader';
import PostCard from '@/components/blog/PostCard';
import CategoryNav from '@/components/blog/CategoryNav';

const SITE_URL = 'https://apps-educativas.com';

export default function BlogCategoryPage() {
  const { categorySlug } = useParams();
  const category = getCategory(categorySlug);

  // SEO siempre antes de cualquier return condicional, para no llamar al hook
  // de manera condicional (regla de React Hooks).
  useSEO({
    title: category ? `${category.name} · Blog` : 'Blog',
    description: category
      ? `${category.description}. Artículos del blog de Edu Torregrosa.`
      : 'Artículos del blog de Edu Torregrosa.',
    canonical: category
      ? `${SITE_URL}/blog/categoria/${category.slug}`
      : `${SITE_URL}/blog`,
  });

  // Si la categoría no existe redirigimos al índice del blog.
  if (!category) {
    return <Navigate to="/blog" replace />;
  }

  const posts = getPostsByCategory(category.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />

      <section className="relative pt-10 pb-8 px-6 text-center overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4"
              style={{ backgroundColor: category.accent }}
            >
              Categoría
            </span>
            <h1
              className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent leading-tight mb-4`}
            >
              {category.name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {category.description}
            </p>
          </motion.div>

          <CategoryNav activeSlug={category.slug} />
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              <p className="text-xl">Todavía no hay artículos en esta categoría. Pronto los habrá.</p>
              <Link
                to="/blog"
                className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Ver todos los artículos
              </Link>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {posts.map((post) => (
                <motion.div
                  key={post.slug}
                  variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
