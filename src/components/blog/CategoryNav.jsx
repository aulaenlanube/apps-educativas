import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_CATEGORIES } from '@/blog/categories';
import { buildCategoryUrl } from '@/blog/utils';

export default function CategoryNav({ activeSlug = null }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      <Link
        to="/blog"
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
          activeSlug === null
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
      >
        Todos
      </Link>
      {BLOG_CATEGORIES.map((cat) => {
        const active = cat.slug === activeSlug;
        return (
          <Link
            key={cat.slug}
            to={buildCategoryUrl(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              active
                ? 'text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            style={active ? { backgroundColor: cat.accent } : undefined}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
