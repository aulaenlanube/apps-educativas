import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import GradientTitle from '@/components/ui/GradientTitle';
import useSEO from '@/hooks/useSEO';
import { ALL_POSTS } from '@/blog/loader';
import PostCard from '@/components/blog/PostCard';
import CategoryNav from '@/components/blog/CategoryNav';

const SITE_URL = 'https://apps-educativas.com';

export default function BlogIndexPage() {
  useSEO({
    title: 'Blog · IA, gamificación e innovación educativa',
    description:
      'Artículos sobre educación, IA en el aula, gamificación, flipped classroom, ABP y atención a la diversidad. Por Edu Torregrosa, profesor de informática.',
    canonical: `${SITE_URL}/blog`,
  });

  const [featured, ...rest] = ALL_POSTS;

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
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Artículos sobre IA en el aula, gamificación, flipped classroom, ABP y todo lo que se está
            cociendo en innovación educativa. Honesto, directo y sin humo.
          </motion.p>
          <CategoryNav activeSlug={null} />
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {ALL_POSTS.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              <p className="text-xl">Pronto habrá artículos por aquí. Quédate atento.</p>
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
              {featured && (
                <motion.div
                  variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  className="md:col-span-2 lg:col-span-3"
                >
                  <PostCard post={featured} featured />
                </motion.div>
              )}
              {rest.map((post) => (
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
