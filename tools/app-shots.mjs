#!/usr/bin/env node
// Capturas de una app (o cualquier ruta) recorriendo pasos, para revisar el
// rediseño visual. Necesita un servidor de desarrollo (por defecto :5199):
//   pnpm exec vite --port 5199 --strictPort
//
// Uso:
//   node tools/app-shots.mjs --path=/curso/primaria/3/lengua/app/ahorcado --out=<dir> \
//     --steps="shot:modos; click:text=Palabras; wait:800; shot:juego; press:A; press:E; shot:letras" \
//     [--width=1280] [--height=900] [--theme=dark] [--fx=high|medium|low] [--mock=student] [--full]
//
// Pasos (separados por ';'):
//   shot:<nombre>          captura de la ventana (o de la página entera con --full)
//   click:<selector>       CSS, o text=<texto visible> (botón/enlace/elemento con ese texto)
//   press:<tecla>          tecla del teclado (A, Enter, ArrowLeft…)
//   type:<texto>           escribe en el elemento con foco
//   wait:<ms>              espera
//   scroll:<y>             desplaza la ventana a y px
//   eval:<js>              ejecuta JS en la página (depuración)
// Imprime las rutas de las capturas y los errores de consola/página.
import path from 'node:path';
import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';
import { chromeLaunchOpts } from './chrome-shm.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=') || true];
}));

const base = args.base || 'http://localhost:5199';
const out = path.resolve(args.out || '.');
const width = Number(args.width) || 1280;
const height = Number(args.height) || 900;
const steps = String(args.steps || 'shot:inicio').split(';').map((s) => s.trim()).filter(Boolean);
const prefix = args.prefix || (String(args.path || 'page').split('/').filter(Boolean).pop() || 'page');

await fs.mkdir(out, { recursive: true });
const browser = await puppeteer.launch({ headless: true, ...chromeLaunchOpts(['--no-sandbox', '--disable-3d-apis']) });
const errors = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: Number(args.scale) || 1 });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await page.evaluateOnNewDocument((opts) => {
    try {
      localStorage.setItem('cookie-consent', 'rejected');
      if (opts.fx) localStorage.setItem('eduapps-graphics-quality', opts.fx);
      if (opts.theme) localStorage.setItem('theme', opts.theme);
    } catch { /* noop */ }
    if (opts.theme === 'dark') document.documentElement?.classList.add('dark');
  }, { fx: args.fx || '', theme: args.theme || '' });

  const q = args.mock ? `${String(args.path).includes('?') ? '&' : '?'}mock=${args.mock}` : '';
  await page.goto(`${base}${args.path || '/'}${q}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  if (args.theme === 'dark') await page.evaluate(() => document.documentElement.classList.add('dark'));

  const clickTarget = async (sel) => {
    if (sel.startsWith('text=')) {
      const text = sel.slice(5).trim();
      const ok = await page.evaluate((t) => {
        const els = [...document.querySelectorAll('button, a, [role="button"], [role="tab"], label, li, div, span')];
        const norm = (s) => s.replace(/\s+/g, ' ').trim();
        const el = els.find((e) => norm(e.innerText || '') === t && e.offsetParent !== null)
          || els.find((e) => norm(e.innerText || '').startsWith(t) && e.offsetParent !== null);
        if (!el) return false;
        (el.closest('button, a, [role="button"], [role="tab"]') || el).click();
        return true;
      }, text);
      if (!ok) errors.push(`click: no encuentro "${text}"`);
    } else {
      const el = await page.$(sel);
      if (el) await el.click(); else errors.push(`click: no encuentro ${sel}`);
    }
    await new Promise((r) => setTimeout(r, 350));
  };

  for (const step of steps) {
    const i = step.indexOf(':');
    const cmd = i === -1 ? step : step.slice(0, i);
    const arg = i === -1 ? '' : step.slice(i + 1).trim();
    if (cmd === 'shot') {
      const file = path.join(out, `${prefix}-${arg || 'shot'}.png`);
      await new Promise((r) => setTimeout(r, 450));
      await page.screenshot({ path: file, fullPage: !!args.full });
      console.log(file);
    } else if (cmd === 'click') await clickTarget(arg);
    else if (cmd === 'press') { await page.keyboard.press(arg); await new Promise((r) => setTimeout(r, 120)); }
    else if (cmd === 'type') await page.keyboard.type(arg, { delay: 30 });
    else if (cmd === 'wait') await new Promise((r) => setTimeout(r, Number(arg) || 500));
    else if (cmd === 'scroll') await page.evaluate((y) => window.scrollTo(0, y), Number(arg) || 0);
    else if (cmd === 'eval') console.log('eval →', await page.evaluate(arg));
  }
} finally {
  await browser.close();
}
const relevant = errors.filter((e) => !/Failed to load resource|favicon|net::ERR|Fetch error|supabase\.co/i.test(e));
if (relevant.length) console.log('ERRORES:\n' + relevant.slice(0, 20).join('\n'));
