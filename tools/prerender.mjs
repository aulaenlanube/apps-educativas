#!/usr/bin/env node
// tools/prerender.mjs
//
// Prerenderiza las rutas públicas a HTML estático DESPUÉS de `vite build`.
//
// Por qué: la web es una SPA y cualquier ruta devuelve el mismo index.html
// vacío. Googlebot ejecuta JS y acaba viendo el contenido, pero lo hace en una
// segunda oleada (indexación más lenta y frágil), y los crawlers de motores
// generativos (GPTBot, ClaudeBot, PerplexityBot) NO ejecutan JS: para ellos
// cada post era una página en blanco con el <title> genérico de la portada.
//
// Cómo: levantamos el preview de Vite sobre dist/, visitamos cada ruta con
// Chrome headless, esperamos a que React monte y a que react-helmet-async
// aplique los <meta>/JSON-LD, y volcamos el HTML resultante. Renderizamos la
// app REAL en lugar de reconstruir los meta tags a mano: así el SEO de cada
// página sigue viviendo en su componente y no hay dos fuentes que diverjan.
//
// Salida: dist/<ruta>.html como fichero PLANO (blog/mi-post.html), no como
// directorio con index.html. Es deliberado: con directorios, Apache (mod_dir)
// redirige /blog/mi-post → /blog/mi-post/ con un 301, y esa barra final
// contradiría el <link rel="canonical"> que emite la propia página. El
// .htaccess sirve estos ficheros sin redirección (ver regla PRERENDER).
//
// React monta con createRoot().render(), que NO hidrata: descarta el HTML
// servido y renderiza de cero. Así que esto no puede provocar errores de
// hidratación; para el usuario es un first paint más rápido y para el bot es
// la diferencia entre ver el artículo o ver nada.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import { preview } from 'vite';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 4183; // fuera del rango habitual de dev/preview

const CONCURRENCY = 4;
const NAV_TIMEOUT_MS = 30000;
const HELMET_SETTLE_MS = 250; // margen para que Helmet termine de aplicar <meta>

// Sello en el <head> de cada página generada. Sirve para dos cosas: abortar si
// se relanza el prerender sobre un dist/ ya prerenderizado (ver main), y poder
// comprobar de un vistazo en producción si una URL se sirve prerenderizada:
//   curl -s https://apps-educativas.com/blog/<slug> | grep prerendered
const MARKER = '<!-- prerendered by tools/prerender.mjs -->';

// Peticiones que no queremos disparar 54 veces desde un bot propio.
const BLOCKED_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
];

// ─── Rutas a prerenderizar ────────────────────────────────────────────────
// Solo contenido público e indexable. Nada tras login (dashboard, duelos,
// quiz-battle): está en Disallow del robots.txt y depende de sesión.

async function collectRoutes() {
  const { BLOG_CATEGORIES } = await import(
    pathToFileURL(path.join(ROOT, 'src', 'blog', 'categories.js')).href
  );

  const postsDir = path.join(ROOT, 'src', 'blog', 'posts');
  const files = await fs.readdir(postsDir).catch(() => []);
  const postSlugs = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(postsDir, file), 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    let data;
    try {
      data = yaml.load(m[1]);
    } catch {
      continue;
    }
    if (!data?.slug || !data?.title || !data?.date || data.draft === true) continue;
    postSlugs.push(data.slug);
  }

  return [
    '/',
    '/catalogo',
    '/blog',
    ...BLOG_CATEGORIES.map((c) => `/blog/categoria/${c.slug}`),
    ...postSlugs.map((s) => `/blog/${s}`),
    ...['1', '2', '3', '4', '5', '6'].map((g) => `/curso/primaria/${g}`),
    ...['1', '2', '3', '4'].map((g) => `/curso/eso/${g}`),
    ...['1', '2'].map((g) => `/curso/bachillerato/${g}`),
    '/curso/ad/1',
    '/politica-privacidad',
    '/politica-cookies',
    '/aviso-legal',
  ];
}

// ─── Volcado ──────────────────────────────────────────────────────────────

function outputPathFor(route) {
  // '/' es el propio index.html (y el fallback SPA del .htaccess).
  if (route === '/') return path.join(DIST, 'index.html');
  return path.join(DIST, `${route.replace(/^\//, '')}.html`);
}

// Guarda contra la regresión que motivó todo esto: el index.html llegó a
// declarar el canonical y la description de la PORTADA para toda la SPA, así
// que /catalogo y cada /curso/* le decían a Google que eran duplicados de la
// home, y los posts servían dos canonical en conflicto (Google ignora ambos
// cuando hay más de uno). Si alguien vuelve a meter un tag de página en el
// head compartido, o una página deja de fijar el suyo, el build para aquí.
function validate(route, html) {
  const canon = [...html.matchAll(/rel="canonical"[^>]*href="([^"]*)"/g)].map((m) => m[1]);
  const desc = [...html.matchAll(/name="description"[^>]*content="/g)];
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? '';
  const expected = `https://apps-educativas.com${route}`;

  const issues = [];
  if (canon.length === 0) issues.push('sin <link rel="canonical">');
  else if (canon.length > 1) issues.push(`${canon.length} canonical en conflicto: ${canon.join(' | ')}`);
  else if (canon[0] !== expected) issues.push(`canonical apunta a ${canon[0]} (esperado ${expected})`);

  if (desc.length === 0) issues.push('sin <meta name="description">');
  else if (desc.length > 1) issues.push(`${desc.length} <meta name="description">`);

  if (!title.trim()) issues.push('sin <title>');

  return issues;
}

async function renderRoute(browser, route, shellTitle) {
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (BLOCKED_HOSTS.some((h) => url.includes(h))) req.abort().catch(() => {});
      else req.continue().catch(() => {});
    });

    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'load',
      timeout: NAV_TIMEOUT_MS,
    });

    // Esperamos a que la RUTA haya montado y aplicado su SEO, no solo a que
    // haya algo en #root: el layout (cabecera y pie) ya pinta texto mientras
    // el componente lazy de la página sigue cargando, así que esperar por
    // "hay contenido" capturaba la página a medio montar, sin sus <meta>.
    // Todas las rutas públicas fijan su propio <title> (vía useSEO o Helmet),
    // así que un título distinto al del shell es la señal fiable de que la
    // página concreta ya está en el DOM.
    await page.waitForFunction(
      (shell) => {
        const root = document.getElementById('root');
        const mounted = root && root.children.length > 0 && root.innerText.trim().length > 0;
        return mounted && document.title && document.title !== shell;
      },
      { timeout: NAV_TIMEOUT_MS },
      shellTitle
    );

    await new Promise((r) => setTimeout(r, HELMET_SETTLE_MS));

    const html = await page.content();
    const title = await page.title();
    const rootChars = await page.evaluate(
      () => document.getElementById('root')?.innerText.trim().length ?? 0
    );

    return { html, title, rootChars };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  // El shell recién construido por vite: la plantilla que el preview sirve
  // para toda ruta y la referencia contra la que detectamos que una página
  // ya ha montado.
  const shellPath = path.join(DIST, 'index.html');
  const shell = await fs.readFile(shellPath, 'utf8').catch(() => null);
  if (!shell) {
    console.error('[prerender] No hay dist/index.html. Ejecuta `vite build` antes.');
    process.exit(1);
  }
  if (shell.includes(MARKER)) {
    // dist/index.html ya es la home prerenderizada de una pasada anterior:
    // usarlo como shell mezclaría los <meta> de la home en el resto de rutas
    // y rompería la detección de "página montada" (su <title> ya es el final).
    console.error(
      '[prerender] dist/ ya está prerenderizado. Reconstruye con `pnpm run build` (vite build limpia dist/).'
    );
    process.exit(1);
  }
  const shellTitle = shell.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? '';

  const routes = await collectRoutes();
  console.log(`[prerender] ${routes.length} rutas públicas · shell: "${shellTitle}"`);

  const server = await preview({
    root: ROOT,
    preview: { port: PORT, strictPort: true },
    logLevel: 'error',
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  // Renderizamos TODO en memoria y escribimos al final, a propósito: el
  // preview sirve dist/, así que escribir dist/index.html a mitad de faena
  // haría que las rutas siguientes recibiesen la home ya renderizada como
  // plantilla en lugar del shell limpio, heredando su <title> y sus <meta>.
  const rendered = [];
  const failures = [];
  const queue = [...routes];

  async function worker() {
    for (;;) {
      const route = queue.shift();
      if (!route) return;
      try {
        const { html, title, rootChars } = await renderRoute(browser, route, shellTitle);
        rendered.push({ route, html, title, rootChars });
      } catch (err) {
        failures.push({ route, error: err.message });
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await browser.close();
  await server.close();

  if (failures.length > 0) {
    console.error(`\n[prerender] ${failures.length} rutas fallaron:`);
    for (const f of failures) console.error(`  ✗ ${f.route} — ${f.error}`);
    // Fallamos sin escribir nada: un prerender a medias publicaría páginas
    // sin contenido para los bots, que es justo lo que veníamos a arreglar.
    process.exit(1);
  }

  const invalid = rendered
    .map(({ route, html }) => ({ route, issues: validate(route, html) }))
    .filter((r) => r.issues.length > 0);

  if (invalid.length > 0) {
    console.error(`\n[prerender] ${invalid.length} rutas con SEO inválido (no se escribe nada):`);
    for (const { route, issues } of invalid) {
      console.error(`  ✗ ${route}`);
      for (const i of issues) console.error(`      ${i}`);
    }
    process.exit(1);
  }

  for (const { route, html } of rendered) {
    const out = outputPathFor(route);
    await fs.mkdir(path.dirname(out), { recursive: true });
    const stamped = html.includes('</head>') ? html.replace('</head>', `${MARKER}\n</head>`) : html;
    await fs.writeFile(out, stamped, 'utf8');
  }

  rendered.sort((a, b) => a.route.localeCompare(b.route));
  for (const r of rendered) {
    console.log(
      `[prerender] ✓ ${r.route.padEnd(50)} ${String(r.rootChars).padStart(6)} chars  ${r.title.slice(0, 40)}`
    );
  }
  console.log(`\n[prerender] ${rendered.length} rutas → HTML estático en dist/`);
}

main().catch((err) => {
  console.error('[prerender] Error:', err);
  process.exit(1);
});
