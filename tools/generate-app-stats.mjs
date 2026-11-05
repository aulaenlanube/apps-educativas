#!/usr/bin/env node
// tools/generate-app-stats.mjs
//
// Calcula las cifras de la plataforma (apps y adaptaciones) a partir del
// registro de apps y escribe:
//   - public/datos/cifras-apps.json → https://apps-educativas.com/datos/cifras-apps.json
//     CONTRATO PÚBLICO: lo leen los vídeos (otro repo). No renombres ni quites
//     campos; si hace falta, añade campos nuevos o sube `version`.
//   - la descripción de public/manifest.webmanifest y la frase de cifras del
//     README.md (entre <!-- cifras:apps --> y <!-- /cifras:apps -->).
//
// Se ejecuta en `pnpm run dev` y `pnpm run build`, antes de vite.
// Opciones: --stdout solo imprime el resumen (lo usa tools/vite-plugin-app-stats.mjs);
// --out <fichero> escribe el JSON en otra ruta y --no-manifest no toca el
// manifest (los usa el test del contrato, src/__tests__/app-stats.test.js).
//
// Las definiciones de «app» y «adaptación» están en src/data/appStats.js.

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, loadAppStats } from './app-registry.mjs';

const argv = process.argv.slice(2);
const outArg = argv.indexOf('--out');
const OUT = outArg >= 0 ? path.resolve(argv[outArg + 1]) : path.join(ROOT, 'public', 'datos', 'cifras-apps.json');
const MANIFEST = path.join(ROOT, 'public', 'manifest.webmanifest');
const README = path.join(ROOT, 'README.md');

const { formatCount } = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'appStats.js')).href);

export function manifestDescription(stats) {
  return `Plataforma gratuita con ${formatCount(stats.apps)} apps y juegos educativos y ` +
    `${formatCount(stats.adaptaciones)} adaptaciones por curso y asignatura para Primaria, ESO, ` +
    'Bachillerato y Atención a la Diversidad.';
}

async function patchManifest(stats) {
  const raw = await fs.readFile(MANIFEST, 'utf8');
  const manifest = JSON.parse(raw);
  const description = manifestDescription(stats);
  if (manifest.description === description) return false;
  manifest.description = description;
  const indent = raw.match(/\n([ \t]+)"/)?.[1] ?? '  ';
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'; // el fichero va en CRLF: no generar diffs de fin de línea
  const json = JSON.stringify(manifest, null, indent).replace(/\n/g, eol);
  await fs.writeFile(MANIFEST, `${json}${eol}`, 'utf8');
  return true;
}

// README.md: la frase entre <!-- cifras:apps --> y <!-- /cifras:apps -->.
async function patchReadme(stats) {
  const raw = await fs.readFile(README, 'utf8').catch(() => null);
  if (!raw) return false;
  const re = /(<!-- cifras:apps -->)[\s\S]*?(<!-- \/cifras:apps -->)/;
  if (!re.test(raw)) return false;
  const text = `**${formatCount(stats.apps)} apps educativas** y **${formatCount(stats.adaptaciones)} adaptaciones** por curso y asignatura`;
  const next = raw.replace(re, `$1${text}$2`);
  if (next === raw) return false;
  await fs.writeFile(README, next, 'utf8');
  return true;
}

async function main() {
  const stats = await loadAppStats();

  if (argv.includes('--stdout')) {
    process.stdout.write(JSON.stringify(stats));
    return;
  }

  const payload = { ...stats, generado: new Date().toISOString() };
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  // --no-manifest: no toca ningún fichero del repo (manifest ni README).
  const touchRepo = !argv.includes('--no-manifest');
  const manifestChanged = touchRepo ? await patchManifest(stats) : false;
  const readmeChanged = touchRepo ? await patchReadme(stats) : false;

  const niveles = Object.values(stats.por_nivel)
    .map((l) => `${l.nombre} ${l.apps}/${l.adaptaciones}`)
    .join(' · ');
  console.log(
    `[cifras] ${stats.apps} apps · ${stats.adaptaciones} adaptaciones (${niveles}) · ` +
    `última: ${stats.ultima_app?.nombre ?? '—'} → ${path.relative(ROOT, OUT)}` +
    (manifestChanged ? ' (+ manifest)' : '') +
    (readmeChanged ? ' (+ README)' : '')
  );
}

main().catch((err) => {
  console.error('[cifras] Error:', err);
  process.exit(1);
});
