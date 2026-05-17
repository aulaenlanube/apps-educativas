// Carga estática de todos los posts del blog en build-time.
// Cada .md tiene un frontmatter YAML (parseado con js-yaml) y un cuerpo en
// markdown. Vite carga los .md como strings con import.meta.glob.

import yaml from 'js-yaml';
import { BLOG_CATEGORIES } from './categories';

const VALID_CATEGORIES = new Set(BLOG_CATEGORIES.map((c) => c.slug));

function parseFrontmatter(raw) {
  // Espera bloque ---\n...\n--- al inicio. Devuelve { data, body }.
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  let data = {};
  try {
    data = yaml.load(match[1]) || {};
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn('[blog] Frontmatter YAML inválido:', err.message);
    }
  }
  return { data, body: match[2] };
}

// Vite carga todos los .md de la carpeta posts como strings al hacer build.
const rawFiles = import.meta.glob('./posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function buildPostsIndex() {
  const posts = [];
  for (const [path, raw] of Object.entries(rawFiles)) {
    const { data, body } = parseFrontmatter(raw);
    if (!data.slug || !data.title || !data.date) {
      // En dev nos enteramos rápido si falta algo crítico.
      if (import.meta.env?.DEV) {
        console.warn(`[blog] Post sin frontmatter mínimo: ${path}`);
      }
      continue;
    }
    if (data.draft === true) continue;
    if (!VALID_CATEGORIES.has(data.category)) {
      if (import.meta.env?.DEV) {
        console.warn(`[blog] Categoría desconocida "${data.category}" en ${path}`);
      }
    }
    // js-yaml deserializa fechas YYYY-MM-DD a objetos Date. Normalizamos
    // a string ISO YYYY-MM-DD para mantener el contrato del resto del código.
    const dateStr = data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date);

    posts.push({
      slug: data.slug,
      title: data.title,
      seoTitle: data.seo_title || data.title,
      date: dateStr,
      category: data.category,
      excerpt: data.excerpt || '',
      hero: data.hero || null,
      videoId: data.video_id || null,
      videoDurationMin: data.duration_min || null,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      tldr: Array.isArray(data.tldr) ? data.tldr : [],
      faq: Array.isArray(data.faq)
        ? data.faq.filter((item) => item && item.q && item.a)
        : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      body,
      // Estimación tosca de lectura: ~200 palabras/minuto.
      readingMinutes: Math.max(2, Math.round(body.split(/\s+/).length / 200)),
    });
  }
  // Más recientes primero.
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export const ALL_POSTS = buildPostsIndex();

export function getPostBySlug(slug) {
  return ALL_POSTS.find((p) => p.slug === slug) || null;
}

export function getPostsByCategory(categorySlug) {
  return ALL_POSTS.filter((p) => p.category === categorySlug);
}

export function getRelatedPosts(slug, limit = 3) {
  const post = getPostBySlug(slug);
  if (!post) return [];
  const sameCategory = ALL_POSTS.filter(
    (p) => p.category === post.category && p.slug !== slug
  );
  const others = ALL_POSTS.filter(
    (p) => p.category !== post.category && p.slug !== slug
  );
  return [...sameCategory, ...others].slice(0, limit);
}
