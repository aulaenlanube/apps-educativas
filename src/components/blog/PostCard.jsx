import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import { buildPostUrl, buildCategoryUrl, formatDateLong } from '@/blog/utils';
import { getCategory } from '@/blog/categories';
import PostValidationBadge from '@/components/blog/PostValidationBadge';

export default function PostCard({ post, featured = false }) {
  const category = getCategory(post.category);
  const titleSize = featured ? 'text-2xl md:text-3xl' : 'text-xl';

  return (
    <article
      className={`group flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow border border-slate-100 dark:border-slate-700 ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <Link to={buildPostUrl(post.slug)} className="block relative overflow-hidden">
        <PostValidationBadge slug={post.slug} className="absolute top-3 right-3 z-10 h-7 w-7" />
        {post.hero ? (
          <div className="relative aspect-video bg-slate-900">
            <img
              src={post.hero}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {post.videoId && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white bg-red-600/90 shadow-lg">
                ▶ Vídeo
              </span>
            )}
          </div>
        ) : post.videoId ? (
          <div className="relative aspect-video bg-slate-900">
            <img
              src={`https://i.ytimg.com/vi/${post.videoId}/hqdefault.jpg`}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white bg-red-600/90 shadow-lg">
              ▶ Vídeo
            </span>
          </div>
        ) : (
          <div className={`relative aspect-video bg-gradient-to-br ${category?.gradient || 'from-slate-600 to-slate-800'}`}>
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <span className="text-white/90 font-black text-2xl md:text-3xl text-center leading-tight drop-shadow-lg line-clamp-3">
                {post.title}
              </span>
            </div>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-grow p-5">
        {category && (
          <Link
            to={buildCategoryUrl(category.slug)}
            className="inline-block self-start mb-3 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: category.accent }}
          >
            {category.name}
          </Link>
        )}

        <Link to={buildPostUrl(post.slug)} className="block group/title">
          <h3 className={`${titleSize} font-black text-slate-900 dark:text-slate-100 leading-tight mb-3 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors`}>
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 flex-grow">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateLong(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.readingMinutes} min lectura
          </span>
        </div>
      </div>
    </article>
  );
}
