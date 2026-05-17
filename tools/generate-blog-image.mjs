#!/usr/bin/env node
// tools/generate-blog-image.mjs
//
// Genera una miniatura para un post del blog usando la API de imágenes de
// OpenAI (gpt-image-1 por defecto) y la guarda como webp en
// public/images/blog/<slug>.webp.
//
// Estilo y filosofía → ver BLOG_IMAGES.md.
//
// Uso:
//   node tools/generate-blog-image.mjs <slug>
//   node tools/generate-blog-image.mjs <slug> "tu prompt completo en inglés"
//
// Requiere OPENAI_API_KEY en el entorno (.env.local o `OPENAI_API_KEY=... node ...`).
//
// Si pasas solo el slug, el script busca el preset correspondiente abajo
// (sección PROMPT_PRESETS). Si pasas también un prompt, lo usa tal cual.

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const API_URL = 'https://api.openai.com/v1/images/generations';
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const SIZE = process.env.OPENAI_IMAGE_SIZE || '1536x1024';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY || 'high';

// Fragmento de estilo común que pegamos a CUALQUIER prompt para garantizar
// coherencia visual entre todas las miniaturas. Si BLOG_IMAGES.md cambia,
// actualízalo aquí también.
const STYLE_SUFFIX = `

Style: clean modern editorial illustration, soft 3D depth with flat color blocks, glassmorphism, gentle volumetric lighting. Hero image style similar to Linear, Stripe or Vercel marketing pages.

Color palette: vibrant gradient background blending deep indigo (#312E81), violet (#7C3AED) and pink (#DB2777) with subtle amber accents (#F59E0B). Cyan and emerald highlights for tech elements. Bright, saturated, professional.

Background: gradient mesh with soft bokeh, radial bloom centered behind the subject. Some out-of-focus floating icons (book, pencil, chip, code bracket, mortarboard, formula symbols, sparks) creating depth.

Composition: 16:9 horizontal, subject centered with breathing room on the upper-left third (a label will be overlaid there later). Cinematic perspective. Soft shadows.

Strictly avoid: text overlays of any kind, letters, typography, watermarks, real photographs, trademarked characters or logos, recognizable human faces (especially children), AI-generated artifacts, generic stock-photo aesthetics, and any words written on the image.`;

// Presets por slug — cuando llamas al script sin prompt, busca aquí.
// Cada preset es el "subject + mood" del prompt, sin la parte de estilo
// (que se añade automáticamente con STYLE_SUFFIX).
const PROMPT_PRESETS = {
  'he-creado-la-web-de-apps-educativas-que-siempre-quise': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a glowing, slightly tilted tablet device floating in mid-air against a vibrant gradient background. On the tablet screen, an abstract minimalist grid of colorful educational app tiles (no text, just icon-like shapes: a small atom, a book, a music note, a calculator key, an art palette, a globe). Around the tablet, small particles and sparks of light emerging as if the device is "coming alive". A soft ribbon of golden light gently wraps around the device suggesting a new launch or unveiling.

Mood: hopeful, fresh, inspiring.`,

  'plataforma-educativa-gratis-sin-login-sin-publicidad': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a sleek floating 3D grid or wall of small abstract app cards arranged isometrically, each card a different vibrant color and bearing a tiny minimalist icon (graph, atom, gear, formula bracket, music note, palette, abacus, snake game shape, jigsaw piece, microscope). A few cards levitate slightly out of the grid with glow underneath, suggesting interactivity. No padlock, no advertising banners — clean and open.

Mood: abundant, generous, organized.`,

  'crea-apps-educativas-nivel-pro-con-ia-sin-codigo': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a luminous abstract neural network sphere centered in the frame, made of glowing nodes and synapses in violet and cyan. From the sphere, soft streams of light flow outward and materialize into small floating 3D educational objects: a tiny planet with a ring, a stylized animal cell with organelles as glowing dots, a minimalist molecular structure of three atoms, a small open book. Suggests "AI generating educational apps".

Mood: futuristic, magical, optimistic.`,

  'la-plataforma-educativa-perfecta-sin-programar': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: an elegant cinematic dashboard view rendered in 3D, slightly angled, made of layered floating glassmorphism panels in violet and indigo. The panels suggest (abstractly, no real UI text): a stylized chart with rising bars, a circular progress ring, a small trophy silhouette, several rounded avatar circles, and a lightning bolt for "battle mode". Surrounding the panels, a few small floating icons: a chip, a graduation cap, a controller. The whole composition feels like the cover of a polished software product launch.

Mood: powerful, polished, ambitious.`,
};

function die(msg, code = 1) {
  console.error(`[blog-image] ${msg}`);
  process.exit(code);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    die('Falta OPENAI_API_KEY en el entorno. Añádela a .env.local o exporta antes de lanzar el script.');
  }

  const slug = process.argv[2];
  if (!slug) {
    die('Uso: node tools/generate-blog-image.mjs <slug> ["prompt completo opcional"]');
  }

  const customPrompt = process.argv[3];
  const subject = customPrompt || PROMPT_PRESETS[slug];
  if (!subject) {
    die(`No hay preset para "${slug}" y no me has pasado prompt como segundo argumento. Edita PROMPT_PRESETS en este script o pásalo por CLI.`);
  }

  const fullPrompt = subject.trim() + STYLE_SUFFIX;

  const sourcesDir = path.join(ROOT, 'tools', 'blog-image-sources');
  const outputDir = path.join(ROOT, 'public', 'images', 'blog');
  await fs.mkdir(sourcesDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`[blog-image] Generando "${slug}" (model=${MODEL}, size=${SIZE}, quality=${QUALITY})…`);
  const t0 = Date.now();

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: fullPrompt,
      size: SIZE,
      quality: QUALITY,
      n: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    die(`OpenAI ${res.status}: ${text}`);
  }

  const data = await res.json();
  const item = data?.data?.[0];
  if (!item) die(`Respuesta inesperada de la API: ${JSON.stringify(data).slice(0, 400)}`);

  let pngBuffer;
  if (item.b64_json) {
    pngBuffer = Buffer.from(item.b64_json, 'base64');
  } else if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) die(`Descarga de la URL falló: ${imgRes.status}`);
    pngBuffer = Buffer.from(await imgRes.arrayBuffer());
  } else {
    die('La API no devolvió ni b64_json ni url.');
  }

  // Guardamos el PNG original fuera de public/ para no inflar el bundle.
  const pngPath = path.join(sourcesDir, `${slug}.png`);
  await fs.writeFile(pngPath, pngBuffer);

  // Recorte a 16:9 exacto + webp optimizado a una resolución útil para
  // miniaturas (1536×864, suficiente para las cards y para el detalle).
  const webpPath = path.join(outputDir, `${slug}.webp`);
  await sharp(pngBuffer)
    .resize(1536, 864, { fit: 'cover', position: 'center' })
    .webp({ quality: 88 })
    .toFile(webpPath);

  const stat = await fs.stat(webpPath);
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  const kb = (stat.size / 1024).toFixed(0);

  console.log(`[blog-image] OK · ${slug}.webp (${kb} KB) en ${seconds}s`);
  console.log(`[blog-image] PNG original guardado en: tools/blog-image-sources/${slug}.png`);
  console.log(`[blog-image] webp publicado en: public/images/blog/${slug}.webp`);
}

main().catch((err) => {
  console.error('[blog-image] Error inesperado:', err);
  process.exit(1);
});
