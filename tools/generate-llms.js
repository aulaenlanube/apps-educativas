#!/usr/bin/env node
// tools/generate-llms.js
//
// Genera public/llms.txt y public/llms-full.txt siguiendo el estándar
// llmstxt.org, leyendo la MISMA fuente de verdad que el resto de la web:
// los .md de src/blog/posts/ y las categorías de src/blog/categories.js.
//
// Por qué esto importa más de lo que parece:
// la web es una SPA de Vite sin SSR ni prerender, así que cualquier ruta
// devuelve el mismo index.html vacío. Googlebot ejecuta JS y acaba viendo el
// contenido, pero los crawlers de motores generativos (GPTBot, ClaudeBot,
// PerplexityBot...) NO ejecutan JavaScript: para ellos, /blog/<slug> es una
// página en blanco. Estos dos ficheros son hoy el único canal por el que
// pueden leer el contenido real del blog, de ahí que llms-full.txt incluya
// el cuerpo completo de cada post y no solo un índice de enlaces.
//
// Se ejecuta en `pnpm run build` ANTES de vite, para que Vite copie el
// resultado de public/ a dist/.
//
// La salida es determinista: mismos posts → mismo fichero, sin diffs ruidosos.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://apps-educativas.com';

// ─── Identidad del sitio ──────────────────────────────────────────────────
// Lo primero que lee un LLM. Concreto y verificable: nada de "innovadora".

const SITE_NAME = 'Apps Educativas';
const SITE_SUMMARY =
  'Plataforma web gratuita con más de 100 apps y juegos educativos para ' +
  'Primaria (1.º-6.º), ESO (1.º-4.º), Bachillerato (1.º-2.º) y Atención a la ' +
  'Diversidad. Se juega desde el navegador, sin descargas, sin publicidad y ' +
  'sin registro. El profesorado puede crear grupos, asignar tareas con modo ' +
  'examen y seguir la nota del alumnado.';

const SITE_NOTES = [
  'Autor: Edu Torregrosa, profesor de informática en un instituto público de la Comunidad Valenciana.',
  'El alumnado juega sin cuenta; el registro solo hace falta para el panel del docente.',
  'Contenido completo del blog en texto plano: ' + `${SITE}/llms-full.txt`,
  'Índice de URLs para crawlers: ' + `${SITE}/sitemap.xml`,
];

// ─── Páginas estáticas destacadas ─────────────────────────────────────────
// Curadas a mano. Si añades una sección nueva a la web, edítala aquí.

const STATIC_PAGES = [
  { loc: '/', title: 'Portada', desc: 'Acceso por etapa y curso a todas las apps educativas.' },
  { loc: '/catalogo', title: 'Catálogo de apps', desc: 'Ficha de cada app: qué es, cómo se juega y en qué cursos y asignaturas está disponible.' },
  { loc: '/blog', title: 'Blog', desc: 'Artículos sobre IA en educación, gamificación, metodologías activas y atención a la diversidad.' },
];

const COURSE_PAGES = [
  ...['1', '2', '3', '4', '5', '6'].map((g) => ({
    loc: `/curso/primaria/${g}`,
    title: `${g}.º de Primaria`,
    desc: `Apps y juegos educativos de ${g}.º de Primaria por asignatura.`,
  })),
  ...['1', '2', '3', '4'].map((g) => ({
    loc: `/curso/eso/${g}`,
    title: `${g}.º de ESO`,
    desc: `Apps y juegos educativos de ${g}.º de ESO por asignatura.`,
  })),
  ...['1', '2'].map((g) => ({
    loc: `/curso/bachillerato/${g}`,
    title: `${g}.º de Bachillerato`,
    desc: `Apps y juegos educativos de ${g}.º de Bachillerato por asignatura.`,
  })),
  {
    loc: '/curso/ad/1',
    title: 'Atención a la Diversidad',
    desc: 'Apps adaptadas para alumnado con necesidades específicas de apoyo educativo.',
  },
];

// ─── Carga de datos ───────────────────────────────────────────────────────

async function loadCategories() {
  // Importamos el módulo real para no duplicar la lista (se desincroniza:
  // el sitemap llegó a perderse una categoría entera por tenerla a mano).
  const modPath = path.join(ROOT, 'src', 'blog', 'categories.js');
  const mod = await import(pathToFileURL(modPath).href);
  return mod.BLOG_CATEGORIES ?? [];
}

async function loadPosts() {
  const postsDir = path.join(ROOT, 'src', 'blog', 'posts');
  let files = [];
  try {
    files = await fs.readdir(postsDir);
  } catch {
    return [];
  }

  const posts = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(postsDir, file), 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) continue;

    let data;
    try {
      data = yaml.load(match[1]);
    } catch {
      continue;
    }
    // Mismo contrato que src/blog/loader.js: sin slug/title/date no es un post,
    // y los borradores no se publican.
    if (!data?.slug || !data?.title || !data?.date) continue;
    if (data.draft === true) continue;

    const dateStr =
      data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);

    posts.push({
      slug: data.slug,
      title: data.title,
      date: dateStr,
      category: data.category ?? null,
      excerpt: (data.excerpt ?? '').trim(),
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      tldr: Array.isArray(data.tldr) ? data.tldr : [],
      faq: Array.isArray(data.faq) ? data.faq.filter((f) => f?.q && f?.a) : [],
      body: match[2].trim(),
    });
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1)); // recientes primero
  return posts;
}

// ─── Serialización ────────────────────────────────────────────────────────

function link({ loc, title, desc }) {
  return desc ? `- [${title}](${SITE}${loc}): ${desc}` : `- [${title}](${SITE}${loc})`;
}

function buildLlmsTxt(posts, categories) {
  const byCategory = (slug) => posts.filter((p) => p.category === slug);

  const sections = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_SUMMARY}`,
    '',
    SITE_NOTES.map((n) => `- ${n}`).join('\n'),
    '',
    '## Secciones principales',
    '',
    STATIC_PAGES.map(link).join('\n'),
    '',
    '## Cursos',
    '',
    COURSE_PAGES.map(link).join('\n'),
    '',
    '## Blog',
    '',
    `${posts.length} artículos publicados. Texto completo en ${SITE}/llms-full.txt`,
    '',
  ];

  // Los posts agrupados por categoría: da al modelo la estructura temática,
  // no solo una lista plana de 35 enlaces.
  for (const cat of categories) {
    const catPosts = byCategory(cat.slug);
    if (catPosts.length === 0) continue;
    sections.push(`### ${cat.name}`, '', `${cat.description}.`, '');
    sections.push(
      catPosts
        .map((p) => link({ loc: `/blog/${p.slug}`, title: p.title, desc: p.excerpt || undefined }))
        .join('\n'),
      ''
    );
  }

  // Posts cuya categoría no existe en categories.js: mejor listarlos que
  // perderlos en silencio.
  const known = new Set(categories.map((c) => c.slug));
  const orphans = posts.filter((p) => !known.has(p.category));
  if (orphans.length > 0) {
    sections.push('### Otros', '');
    sections.push(
      orphans
        .map((p) => link({ loc: `/blog/${p.slug}`, title: p.title, desc: p.excerpt || undefined }))
        .join('\n'),
      ''
    );
  }

  return sections.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function buildLlmsFullTxt(posts, categories) {
  const catName = (slug) => categories.find((c) => c.slug === slug)?.name ?? slug ?? '—';

  const head = [
    `# ${SITE_NAME} — contenido completo del blog`,
    '',
    `> ${SITE_SUMMARY}`,
    '',
    `Texto íntegro de los ${posts.length} artículos publicados en ${SITE}/blog.`,
    'Índice de enlaces y estructura del sitio en ' + `${SITE}/llms.txt`,
    '',
    '---',
    '',
  ].join('\n');

  const chunks = posts.map((p) => {
    const parts = [
      `# ${p.title}`,
      '',
      `- URL: ${SITE}/blog/${p.slug}`,
      `- Publicado: ${p.date}`,
      `- Categoría: ${catName(p.category)}`,
      p.keywords.length ? `- Temas: ${p.keywords.join(', ')}` : null,
      '',
    ].filter((x) => x !== null);

    if (p.excerpt) parts.push(`${p.excerpt}`, '');
    if (p.tldr.length) {
      parts.push('## Resumen rápido', '', p.tldr.map((t) => `- ${t}`).join('\n'), '');
    }

    parts.push(p.body, '');

    if (p.faq.length) {
      parts.push('## Preguntas frecuentes', '');
      for (const { q, a } of p.faq) parts.push(`**${q}**`, '', a, '');
    }

    parts.push('---', '');
    return parts.join('\n');
  });

  return (head + chunks.join('\n')).replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const [posts, categories] = await Promise.all([loadPosts(), loadCategories()]);

  if (posts.length === 0) {
    console.error('[llms] No se ha encontrado ningún post en src/blog/posts/');
    process.exit(1);
  }

  const outDir = path.join(ROOT, 'public');
  await fs.mkdir(outDir, { recursive: true });

  const llms = buildLlmsTxt(posts, categories);
  const llmsFull = buildLlmsFullTxt(posts, categories);

  await fs.writeFile(path.join(outDir, 'llms.txt'), llms, 'utf8');
  await fs.writeFile(path.join(outDir, 'llms-full.txt'), llmsFull, 'utf8');

  const kb = (s) => Math.round(Buffer.byteLength(s, 'utf8') / 1024);
  console.log(
    `[llms] ${posts.length} posts · ${categories.length} categorías → ` +
      `llms.txt (${kb(llms)} KB) + llms-full.txt (${kb(llmsFull)} KB)`
  );
}

main().catch((err) => {
  console.error('[llms] Error:', err);
  process.exit(1);
});
