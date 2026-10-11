#!/usr/bin/env node
// Capturas de la galería de ilustraciones (/__art, solo desarrollo).
//
// Necesita un servidor de desarrollo levantado (por defecto en :5199):
//   pnpm exec vite --port 5199 --strictPort
// Uso:
//   node tools/art-shots.mjs --set=subject-set1 [--only=lengua,ingles] --out=/ruta/salida [--base=http://localhost:5199]
// Escribe <out>/<set>[-<only>].png (página completa) e imprime la ruta.
import path from 'node:path';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=') || true];
}));

const set = args.set || 'grade-primaria';
const only = typeof args.only === 'string' ? args.only : '';
const base = args.base || 'http://localhost:5199';
const out = path.resolve(args.out || '.');
const scale = Number(args.scale) || 1;

await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-3d-apis'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 900, deviceScaleFactor: scale });
  const url = `${base}/__art?set=${encodeURIComponent(set)}${only ? `&only=${encodeURIComponent(only)}` : ''}`;
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('h1', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 900));
  const file = path.join(out, `${set}${only ? `-${only.replace(/,/g, '_').slice(0, 60)}` : ''}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(file);
  const relevant = errors.filter((e) => !/supabase|Failed to load resource|favicon|net::ERR/i.test(e));
  if (relevant.length) console.log('ERRORES EN CONSOLA:\n' + relevant.slice(0, 15).join('\n'));
} finally {
  await browser.close();
}
