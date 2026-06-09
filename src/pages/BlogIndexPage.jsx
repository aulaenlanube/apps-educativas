import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import GradientTitle from '@/components/ui/GradientTitle';
import useSEO from '@/hooks/useSEO';
import { ALL_POSTS } from '@/blog/loader';
import PostCard from '@/components/blog/PostCard';
import CategoryNav from '@/components/blog/CategoryNav';
import FeaturedCarousel from '@/components/blog/FeaturedCarousel';

const SITE_URL = 'https://apps-educativas.com';

export default function BlogIndexPage() {
  useSEO({
    title: 'Blog · IA, gamificación e innovación educativa',
    description:
      'Artículos sobre educación, IA en el aula, gamificación, flipped classroom, ABP y atención a la diversidad. Por Edu Torregrosa, profesor de informática.',
    canonical: `${SITE_URL}/blog`,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Header />

      <section className="relative pt-12 pb-10 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl transform -rotate-6 scale-150 pointer-events-none" />
        <div className="relative z-10 container mx-auto max-w-4xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <BookOpen className="w-8 h-8 text-indigo-500" />
            <GradientTitle tag="h1" className="text-4xl md:text-5xl">El Blog</GradientTitle>
            <Sparkles className="w-8 h-8 text-purple-500" />
          </motion.div>
        </div>
      </section>

      {ALL_POSTS.length > 0 && (
        <section className="px-6 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="container mx-auto max-w-6xl"
          >
            <FeaturedCarousel posts={ALL_POSTS} />
          </motion.div>
          <div className="container mx-auto max-w-6xl mt-8">
            <CategoryNav activeSlug={null} />
          </div>
        </section>
      )}

      <section className="pb-20 pt-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {ALL_POSTS.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              <p className="text-xl">Pronto habrá artículos por aquí. Quédate atento.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Todos los artículos
                </h2>
                <span className="h-px flex-grow bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
              </div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              >
                {ALL_POSTS.map((post) => (
                  <motion.div
                    key={post.slug}
                    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
