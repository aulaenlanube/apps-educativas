#!/usr/bin/env node
// tools/generate-sitemap.mjs
//
// Genera public/sitemap.xml de forma determinista combinando las URLs estáticas
// de la web (home, cursos, legal, blog index, categorías) con las URLs
// dinámicas de los posts del blog leídas de src/blog/posts/*.md.
//
// Se ejecuta en el build script ANTES de vite, así Vite copia el sitemap.xml
// resultante a dist/.
//
// La salida es estable: si los posts no cambian, el sitemap no cambia (no
// genera diffs ruidosos en git).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://apps-educativas.com';

// ─── URLs estáticas curadas a mano ────────────────────────────────────────
// Si añades una nueva sección a la web, edita aquí.

const STATIC_URLS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },

  // Primaria
  ...['1', '2', '3', '4', '5', '6'].map((g) => ({
    loc: `/curso/primaria/${g}`,
    changefreq: 'monthly',
    priority: '0.9',
  })),

  // ESO
  ...['1', '2', '3', '4'].map((g) => ({
    loc: `/curso/eso/${g}`,
    changefreq: 'monthly',
    priority: '0.9',
  })),

  // Bachillerato
  ...['1', '2'].map((g) => ({
    loc: `/curso/bachillerato/${g}`,
    changefreq: 'monthly',
    priority: '0.8',
  })),

  // Atención a la Diversidad
  { loc: '/curso/ad/1', changefreq: 'monthly', priority: '0.7' },

  // Blog
  { loc: '/blog', changefreq: 'weekly', priority: '0.9' },

  // Categorías del blog (slugs sincronizados con src/blog/categories.js)
  ...[
    'plataforma-eduapps',
    'ia-en-educacion',
    'gamificacion',
    'flipped-classroom',
    'abp',
    'innovacion-educativa',
    'atencion-diversidad',
  ].map((slug) => ({
    loc: `/blog/categoria/${slug}`,
    changefreq: 'weekly',
    priority: '0.6',
  })),

  // Legal
  { loc: '/politica-privacidad', changefreq: 'yearly', priority: '0.2' },
  { loc: '/politica-cookies',    changefreq: 'yearly', priority: '0.2' },
  { loc: '/aviso-legal',         changefreq: 'yearly', priority: '0.2' },
];

// ─── Carga dinámica de posts ──────────────────────────────────────────────

async function loadPosts() {
  const postsDir = path.join(ROOT, 'src', 'blog', 'posts');
  let files = [];
  try {
    files = await fs.readdir(postsDir);
  } catch {
    return [];
  }
  const out = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(postsDir, file), 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?[\s\S]*$/);
    if (!match) continue;
    let data;
    try {
      data = yaml.load(match[1]);
    } catch {
      continue;
    }
    if (!data?.slug || !data?.date || data?.draft === true) continue;
    const dateStr = data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date);
    out.push({ slug: data.slug, date: dateStr });
  }
  // Más recientes primero (el orden no afecta a los crawlers, pero ayuda
  // a leer el sitemap a humanos).
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return out;
}

// ─── Serialización ────────────────────────────────────────────────────────

function urlEntry({ loc, changefreq, priority, lastmod }) {
  const lines = [
    '  <url>',
    `    <loc>${SITE}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ].filter(Boolean);
  return lines.join('\n');
}

async function main() {
  const posts = await loadPosts();

  const staticBlock = STATIC_URLS.map(urlEntry).join('\n\n');

  const postsBlock = posts
    .map((p) =>
      urlEntry({
        loc: `/blog/${p.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: p.date,
      })
    )
    .join('\n\n');

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${staticBlock}

  <!-- Blog posts (generados desde src/blog/posts/) -->
${postsBlock}

</urlset>
`;

  const outPath = path.join(ROOT, 'public', 'sitemap.xml');
  await fs.writeFile(outPath, xml, 'utf8');
  console.log(`[sitemap] ${STATIC_URLS.length} URLs estáticas + ${posts.length} posts → public/sitemap.xml`);
}

main().catch((err) => {
  console.error('[sitemap] Error:', err);
  process.exit(1);
});
