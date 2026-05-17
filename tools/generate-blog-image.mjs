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

  'gamificacion-en-el-aula-lo-que-funciona': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a large glowing golden trophy slightly off-center, surrounded by floating geometric badges and small medals in violet, pink and cyan, each badge with a different abstract symbol inside (star, flame, target, crown — no text). Above the trophy, a soft beam of light. Below, a stylized progression bar half-filled glowing from indigo to amber. Suggests achievement, levels and structured progress.

Mood: motivating, structured, vibrant.`,

  'flipped-classroom-como-lo-monte-en-mi-clase': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a floating play button icon morphing into an open book on its right side, connected by a soft luminous arc that "flips" between them. Above the play button, a stylized clock and a tiny home silhouette in glow. Below the book, a stylized desk with a pencil and a checked task list (abstract, no real text). Suggests "video at home, practice in class".

Mood: clear, organized, hopeful.`,

  'tdah-en-primaria-12-adaptaciones-que-funcionan': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized glowing brain rendered in 3D with several abstract puzzle pieces softly orbiting around it, each piece a different vibrant color (violet, cyan, amber, pink), some pieces fitting perfectly and others slightly offset. A few small floating icons: a clock, a checklist, a shield, a magnifier — representing structure and support. Soft volumetric glow around the brain.

Mood: empathetic, supportive, hopeful.`,

  'como-empezar-con-ia-en-clase-sin-meter-la-pata': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a friendly stylized AI assistant orb (glowing sphere with abstract neural mesh inside) floating next to a chalkboard rendered in 3D with several minimalist icons drawn on it (lightbulb, atom, book, math symbol — abstract shapes, no real text). A gentle bridge of light connects the AI orb and the chalkboard. Suggests AI as a guide for the teacher entering this new world.

Mood: welcoming, optimistic, calm.`,

  'aprendizaje-basado-en-proyectos-como-disenar-uno-que-enganche': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a large central question mark made of luminous lines, around which orbit several stylized 3D objects representing project outcomes: a small architectural blueprint roll, a gear, a tiny prototype shape, a stylized microphone, a video play icon, a paint palette. The objects connect to the question mark with soft glowing threads, suggesting "one driving question, many outputs".

Mood: curious, ambitious, collaborative.`,

  'neuroeducacion-7-hallazgos-que-cambian-como-doy-clase': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized 3D brain glowing softly from within, with abstract neural pathways lighting up sequentially. Around the brain, seven small glowing nodes connected to it by luminous lines, each node a different geometric symbol (gear, lightbulb, clock, eye, book, heart, infinity — minimalist abstract). Subtle halo of cyan and violet light.

Mood: enlightening, scientific, inspiring.`,

  'sistema-de-insignias-en-clase-metodologia-completa': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a large central hexagonal badge in gold and violet with a stylized star inside (no text), elevated on a glowing pedestal. Around it, smaller badges of different shapes and colors arranged in a fanned pyramid, each suggesting a category: a shield for global, a calendar for trimester, a stack for accumulable, and a crown for super. Glowing connection lines between badges suggest a hierarchy.

Mood: structured, prestigious, motivating.`,

  '20-prompts-de-ia-para-docentes': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized 3D chat bubble or terminal window made of translucent glass, slightly tilted, with abstract glowing lines inside representing prompts (horizontal stripes of varying length, no readable text). Around it, smaller floating bubbles each with a tiny icon: a pencil, a ruler, a checkmark, a magnifier, a graph. Soft sparks of golden light emerge from the main bubble suggesting "ready-to-use answers".

Mood: practical, generous, energizing.`,

  'dislexia-en-el-aula-deteccion-y-adaptacion': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized open book in 3D from which several letters (minimalist abstract shapes, NO real text, NO actual letters of any alphabet) are gently floating upward and rearranging themselves into a clear, ordered pattern in the air above. A subtle ear icon and a small headphone icon float beside the book suggesting audio access. Warm glow emerging from inside the book.

Mood: hopeful, accessible, empathetic.`,

  'microlearning-por-que-funciona-y-cuando-no': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a row of three glowing small capsule-shaped icons (like pills or modular blocks) of different vibrant colors, each containing a tiny abstract symbol (a number, an atom, a music note — minimalist). Above the row, a small clock with the hand positioned at "5 minutes". Below, a stylized stair stepping upward suggesting progress through micro-steps.

Mood: focused, efficient, modern.`,

  'corregir-examenes-con-ia-sigue-siendo-el-docente': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized stack of 3D exam papers slightly fanned out, with a glowing magnifying glass passing over them. From the magnifier, a soft beam of light reveals abstract checkmarks and small marks (no real text). Beside the stack, a small AI orb softly glowing, connected to the magnifier by a thread of light suggesting collaboration between teacher and AI.

Mood: efficient, professional, balanced.`,

  'motivacion-intrinseca-vs-recompensas-en-gamificacion': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a luminous heart shape in violet floating slightly to the left, balanced against a golden coin or medal on the right, both connected by a delicate glowing scale or balance beam. The heart radiates a soft warm light suggesting inner motivation; the coin sparkles but with a colder glow. The scale tips very gently toward the heart, suggesting that intrinsic motivation outweighs external rewards in the long run.

Mood: contemplative, balanced, deep.`,

  'ai-act-en-clase-obligaciones-y-prohibiciones': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized 3D circle of twelve glowing stars arranged like the European Union flag, slightly tilted in perspective, with a soft luminous shield in the centre. Inside the shield, a stylized minimalist scale of justice balancing a small AI chip on one side and a tiny graduation cap on the other. Around the scene, a few floating translucent regulatory documents (no text) and a subtle gavel silhouette in glow. Indigo-to-violet gradient background with soft golden European star accents.

Mood: institutional, serene, authoritative.`,

  'detectores-de-ia-en-deberes-por-que-fallan': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a translucent magnifying glass rendered in 3D hovering over an abstract sheet of paper, with the lens showing a confused glitch effect and broken radar circles inside. Floating around the magnifier, several small question-mark symbols and a tiny "warning triangle" icon in amber. Below, a stack of papers slightly fanned out with some showing soft red highlight marks and others soft green checkmarks (abstract shapes, no real text or letters). The magnifying glass leans slightly to suggest unreliability.

Mood: critical, thoughtful, alert.`,

  'khanmigo-magicschool-chatgpt-edu-tutores-ia': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: three glowing translucent orbs arranged horizontally in the centre, each a different size and accent color. The left orb has a soft mathematical formula symbol inside (abstract, no real text); the middle orb shows a minimalist wand or magic spark with several tool icons orbiting it; the right orb shows an abstract chat bubble pattern. All three orbs are connected by thin luminous lines forming a triangle, and small floating book-and-chip icons drift between them. Suggests three different AI tutors coexisting in an educational ecosystem.

Mood: comparative, modern, sophisticated.`,

  'notebooklm-para-docentes-temario-en-podcast': `Modern editorial illustration for an educational technology blog. 16:9 horizontal composition.

Subject: a stylized 3D open notebook in the centre slightly tilted, from whose pages emerge two glowing translucent sound waves intertwined in violet and cyan, morphing into a small floating headphones icon and a microphone silhouette above the notebook. Around the notebook, several abstract source documents (PDF shape, video play triangle, web globe) levitate, each connected to the notebook by a thin luminous thread. Bright spark of golden light at the centre of the open pages suggesting transformation from text to audio.

Mood: transformative, inspiring, fresh.`,
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
