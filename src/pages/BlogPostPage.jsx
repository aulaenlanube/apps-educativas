import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, Sparkles, HelpCircle, Pencil } from 'lucide-react';
import Header from '@/components/layout/Header';
import { getPostBySlug, getRelatedPosts } from '@/blog/loader';
import { getCategory } from '@/blog/categories';
import { formatDateLong, buildCategoryUrl, buildPostUrl, buildAbsoluteUrl } from '@/blog/utils';
import BlogProse from '@/components/blog/BlogProse';
import BlogPostEditor from '@/components/blog/BlogPostEditor';
import PostValidationToggle from '@/components/blog/PostValidationToggle';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';
import PostCard from '@/components/blog/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const SITE_URL = 'https://apps-educativas.com';
const SITE_NAME = 'Apps Educativas';
const AUTHOR = 'Edu Torregrosa';
const AUTHOR_URL = 'https://edutorregrosa.com/';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const { isAdmin } = useAuth();
  const [overrideBody, setOverrideBody] = useState(null);
  const [overrideUpdatedAt, setOverrideUpdatedAt] = useState(null);
  const [editing, setEditing] = useState(false);

  // Cuando el lector navega entre posts queremos arrancar arriba.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Carga el cuerpo editado por un admin (si existe) para este post.
  useEffect(() => {
    let cancelled = false;
    setOverrideBody(null);
    setOverrideUpdatedAt(null);
    supabase
      .from('blog_post_overrides')
      .select('body, updated_at')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) {
          setOverrideBody(data.body);
          setOverrideUpdatedAt(data.updated_at);
        }
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const category = getCategory(post.category);
  const bodyToRender = overrideBody ?? post.body;
  const dateModified = overrideUpdatedAt ? overrideUpdatedAt.slice(0, 10) : post.date;
  const related = getRelatedPosts(post.slug, 3);
  const canonical = `${SITE_URL}${buildPostUrl(post.slug)}`;
  // Para OG preferimos la miniatura propia del post sobre la de YouTube:
  // la nuestra está pensada para compartir, la de YT lleva branding ajeno.
  const ogImage = post.hero
    ? buildAbsoluteUrl(post.hero)
    : post.videoId
    ? `https://i.ytimg.com/vi/${post.videoId}/maxresdefault.jpg`
    : `${SITE_URL}/images/og-default.png`;

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.excerpt || post.title;

  // BlogPosting + FAQPage + BreadcrumbList se devuelven como un array de
  // schemas para que los crawlers los procesen en un solo bloque.
  const jsonLdGraph = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: seoDescription,
      datePublished: post.date,
      dateModified: dateModified,
      author: { '@type': 'Person', name: AUTHOR, url: AUTHOR_URL },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/og-default.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      image: ogImage,
      articleSection: category?.name,
      keywords: post.keywords?.length ? post.keywords.join(', ') : undefined,
      inLanguage: 'es-ES',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        ...(category
          ? [{
              '@type': 'ListItem',
              position: 3,
              name: category.name,
              item: `${SITE_URL}${buildCategoryUrl(category.slug)}`,
            }]
          : []),
        { '@type': 'ListItem', position: category ? 4 : 3, name: post.title, item: canonical },
      ],
    },
    ...(post.faq?.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{`${seoTitle} · ${SITE_NAME}`}</title>
        <meta name="description" content={seoDescription} />
        {post.keywords?.length > 0 && (
          <meta name="keywords" content={post.keywords.join(', ')} />
        )}
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content={AUTHOR} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={AUTHOR_URL} />
        {category && <meta property="article:section" content={category.name} />}
        {post.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1536" />
        <meta property="og:image:height" content="864" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="es_ES" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:creator" content="@_edu_torregrosa" />
        {/* JSON-LD: BlogPosting + BreadcrumbList + FAQPage opcional */}
        <script type="application/ld+json">{JSON.stringify(jsonLdGraph)}</script>
      </Helmet>

      <Header />

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 pt-8 pb-20">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar post
              </button>
              <PostValidationToggle slug={post.slug} />
            </div>
          )}
        </div>

        <header className="mb-8 pb-8 border-b-2 border-slate-100 dark:border-slate-700">
          {category && (
            <Link
              to={buildCategoryUrl(category.slug)}
              className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: category.accent }}
            >
              {category.name}
            </Link>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDateLong(post.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingMinutes} min lectura
            </span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">por {AUTHOR}</span>
          </div>
        </header>

        {post.videoId ? (
          <div className="mb-10">
            <YouTubeEmbed videoId={post.videoId} title={post.title} />
            {post.videoDurationMin && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">
                Vídeo original · {post.videoDurationMin} min
              </p>
            )}
          </div>
        ) : post.hero ? (
          <div className="mb-10">
            <img
              src={post.hero}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
            />
          </div>
        ) : null}

        {post.tldr?.length > 0 && (
          <aside
            className="mb-10 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 dark:from-indigo-950/40 dark:via-violet-950/30 dark:to-pink-950/30 p-6 sm:p-7 shadow-sm"
            aria-label="Resumen rápido"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 m-0">
                Resumen rápido
              </h2>
            </div>
            <ul className="space-y-2 text-[15px] sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
              {post.tldr.map((point, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <article>
          <BlogProse markdown={bodyToRender} />
        </article>

        {post.faq?.length > 0 && (
          <section className="mt-16 pt-10 border-t-2 border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 m-0">
                Preguntas frecuentes
              </h2>
            </div>
            <div className="space-y-5">
              {post.faq.map(({ q, a }, idx) => (
                <details
                  key={idx}
                  className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-3 font-bold text-slate-900 dark:text-slate-50 text-base sm:text-lg leading-snug">
                    <span>{q}</span>
                    <span className="shrink-0 mt-1 text-indigo-500 transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] sm:text-base">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t-2 border-slate-100 dark:border-slate-700">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-6">
              Sigue leyendo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <PostCard key={r.slug} post={r} />
              ))}
            </div>
          </section>
        )}
      </div>

      {editing && (
        <BlogPostEditor
          slug={post.slug}
          initialBody={bodyToRender}
          onClose={() => setEditing(false)}
          onSaved={(b, t) => { setOverrideBody(b); setOverrideUpdatedAt(t); setEditing(false); }}
          onReset={() => { setOverrideBody(null); setOverrideUpdatedAt(null); setEditing(false); }}
        />
      )}
    </div>
  );
}
