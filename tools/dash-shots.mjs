#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// dash-shots — capturas de los paneles logueados usando el MODO MOCK de
// desarrollo (src/dev/mock). No necesita credenciales: entra con ?mock=<rol>.
//
// Requiere el servidor de desarrollo arrancado (pnpm run dev). Uso:
//
//   node tools/dash-shots.mjs --role=student --path=/mi-panel --out=shots/alumno --tabs
//   node tools/dash-shots.mjs --role=teacher --path=/dashboard --out=shots/docente --tabs --click="3º ESO B"
//   node tools/dash-shots.mjs --role=free --path=/mi-zona --out=shots/libre
//
// Opciones:
//   --role=student|teacher|free   rol del mock (obligatorio)
//   --path=/ruta                  ruta a abrir (por defecto según rol)
//   --out=<dir>                   carpeta de salida (se crea si no existe)
//   --base=http://localhost:5199  URL del dev server (o env DASH_BASE)
//   --tabs[=A,B,C]                recorre las pestañas: sin valor las detecta
//                                 ([role=tab] o la barra de botones), con valor
//                                 usa esas etiquetas visibles (match por prefijo)
//   --click=Texto[,Texto2]        clics previos (se repite; uno por captura): texto
//                                 visible, title/aria-label de botones de icono, o
//                                 "css:<selector>" (p. ej. --click='css:button[title="Ver estadisticas"]')
//                                 o "key:<Tecla>" (p. ej. --click=key:Escape para cerrar un diálogo)
//   --width=1440 --height=900     viewport (por defecto 1440x900)
//   --mobile                      viewport de móvil (390x844 @2x)
//   --viewport                    captura solo el viewport (por defecto página completa)
//   --dark                        tema oscuro de la app (preferencia por usuario) + prefers-color-scheme
//   --wait=1200                   ms de espera tras cada navegación/clic
//   --strict                      sale con código 1 si hay errores de página/consola
//
// Imprime los errores de consola / pageerror y las RPC que el mock no conoce
// (window.__eduappsDevMock.unknownRpcs) para poder añadir fixtures.
// ─────────────────────────────────────────────────────────────────────────────
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(repoRoot, 'package.json'));
const puppeteer = require('puppeteer');

// ─── Argumentos ──────────────────────────────────────────────────────────────
const args = {};
const clicks = [];
for (const raw of process.argv.slice(2)) {
  const m = raw.match(/^--([^=]+)(?:=(.*))?$/);
  if (!m) continue;
  const [, k, v] = m;
  if (k === 'click') {
    const val = String(v || '');
    if (val.startsWith('css:')) clicks.push(val); // los selectores pueden llevar comas
    else clicks.push(...val.split(',').map((s) => s.trim()).filter(Boolean));
  }
  else args[k] = v === undefined ? true : v;
}
const DEFAULT_PATHS = { student: '/mi-panel', teacher: '/dashboard', free: '/mi-zona' };
const role = args.role;
if (!DEFAULT_PATHS[role]) {
  console.error('Uso: node tools/dash-shots.mjs --role=student|teacher|free [--path=/ruta] --out=<dir> [--tabs] [--click=Texto]');
  process.exit(2);
}
const base = String(args.base || process.env.DASH_BASE || 'http://localhost:5199').replace(/\/$/, '');
const route = args.path || DEFAULT_PATHS[role];
const outDir = path.resolve(String(args.out || path.join('shots', role)));
const waitMs = Number(args.wait || 1200);
const fullPage = !args.viewport;
fs.mkdirSync(outDir, { recursive: true });

const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\(\d+\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Navegador ───────────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-3d-apis'],
});
const page = await browser.newPage();
if (args.mobile) await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
else await page.setViewport({ width: Number(args.width || 1440), height: Number(args.height || 900), deviceScaleFactor: 1 });
if (args.dark) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
// Oculta el banner de cookies para que no tape las capturas. Con --dark, además,
// la preferencia de tema por usuario (`eduapps-theme-<id>`, ThemeContext) vale
// 'dark' para cualquier id: el tema de la app no sale de prefers-color-scheme.
await page.evaluateOnNewDocument((dark) => {
  try { localStorage.setItem('cookie-consent', 'rejected'); } catch { /* noop */ }
  if (!dark) return;
  try {
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function patchedGetItem(key) {
      if (typeof key === 'string' && key.startsWith('eduapps-theme-')) return 'dark';
      return getItem.call(this, key);
    };
  } catch { /* noop */ }
}, Boolean(args.dark));

const problems = [];
page.on('pageerror', (e) => problems.push({ kind: 'pageerror', text: String(e?.message || e) }));
// Ruido conocido del dev server (no es de la app): el parche de fetch del
// plugin de Horizons (vite.config.js) registra "Fetch error from : " también
// con el mock apagado.
const KNOWN_DEV_NOISE = [/^Fetch error from :\s*$/];
page.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  const text = msg.text();
  if (KNOWN_DEV_NOISE.some((re) => re.test(text))) return;
  problems.push({ kind: 'console.error', text });
});
page.on('requestfailed', (req) => {
  const url = req.url();
  if (/\/@vite\/|hot-update|favicon/.test(url)) return;
  problems.push({ kind: 'requestfailed', text: `${req.failure()?.errorText || 'failed'} ${url}` });
});

async function settle() {
  try { await page.waitForNetworkIdle({ idleTime: 400, timeout: 15000 }); } catch { /* sigue */ }
  await sleep(waitMs);
}

/** Recorre la página para que carguen las imágenes `loading="lazy"` y vuelve arriba. */
async function loadLazyContent() {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  try { await page.waitForNetworkIdle({ idleTime: 300, timeout: 8000 }); } catch { /* sigue */ }
  await sleep(250);
}

let shotIndex = 0;
async function shot(label) {
  const file = path.join(outDir, `${role}-${String(shotIndex).padStart(2, '0')}-${slug(label)}.png`);
  shotIndex += 1;
  if (fullPage) await loadLazyContent();
  await page.screenshot({ path: file, fullPage });
  console.log(`📸 ${file}`);
  return file;
}

/**
 * Clic REAL de ratón (mousedown/up/click: las pestañas de Radix se activan en
 * mousedown) sobre el elemento visible más específico cuyo texto coincida.
 */
async function clickByText(text) {
  if (text.startsWith('key:')) { // "key:Escape" → pulsa una tecla (cerrar diálogos…)
    await page.keyboard.press(text.slice(4));
    await settle();
    return true;
  }
  const point = await page.evaluate((needle) => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const st = window.getComputedStyle(el);
      return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none';
    };
    const center = (el) => {
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + (r.width / 2), y: r.top + (r.height / 2) };
    };
    // "css:<selector>" → primer elemento visible que case con el selector
    if (needle.startsWith('css:')) {
      const el = [...document.querySelectorAll(needle.slice(4))].find(visible);
      return el ? center(el) : null;
    }
    const prefer = ['[role="tab"]', 'button', 'a', '[role="button"]', 'li', 'h1', 'h2', 'h3', 'h4', 'p', 'span', 'div'];
    const groups = prefer.map((sel) => [...document.querySelectorAll(sel)].filter(visible));
    // 1) texto exacto  2) title/aria-label exacto (botones de icono)  3) prefijo
    const passes = [
      (el) => norm(el.innerText) === needle,
      (el) => [el.getAttribute('title'), el.getAttribute('aria-label')].some((v) => norm(v) === needle),
      (el) => norm(el.innerText).startsWith(needle),
    ];
    for (const test of passes) {
      for (const els of groups) {
        const target = els.find(test);
        if (target) return center(target);
      }
    }
    return null;
  }, text);
  if (!point) {
    console.warn(`⚠️  No encontré nada clicable con el texto "${text}"`);
    return false;
  }
  await page.mouse.click(point.x, point.y);
  await settle();
  return true;
}

/** Detecta las pestañas: [role=tab] o la primera barra con ≥4 botones hermanos. */
async function detectTabs() {
  return page.evaluate(() => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const roleTabs = [...document.querySelectorAll('[role="tab"]')].map((el) => norm(el.innerText)).filter(Boolean);
    if (roleTabs.length) return roleTabs;
    const candidates = [...document.querySelectorAll('div, nav')].filter((el) => {
      const kids = [...el.children];
      return kids.length >= 4
        && kids.every((k) => k.tagName === 'BUTTON' && norm(k.innerText).length > 0 && norm(k.innerText).length < 40);
    });
    if (!candidates.length) return [];
    return [...candidates[0].children].map((k) => norm(k.innerText));
  });
}

// ─── Recorrido ───────────────────────────────────────────────────────────────
const sep = route.includes('?') ? '&' : '?';
const url = `${base}${route}${sep}mock=${role}`;
console.log(`→ ${url}`);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await settle();
await shot('inicio');

for (const c of clicks) {
  await clickByText(c);
  await shot(`click-${c}`);
}

if (args.tabs) {
  const labels = args.tabs === true
    ? await detectTabs()
    : String(args.tabs).split(',').map((s) => s.trim()).filter(Boolean);
  if (!labels.length) console.warn('⚠️  No se detectaron pestañas (usa --tabs=Etiqueta1,Etiqueta2)');
  else console.log(`Pestañas: ${labels.join(' · ')}`);
  for (const label of labels) {
    // Las etiquetas pueden llevar contadores ("Tareas (2)"): clic por prefijo.
    const bare = label.replace(/\s*\(\d+\)\s*$/, '');
    await clickByText(bare);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(`tab-${bare}`);
  }
}

const unknown = await page.evaluate(() => {
  const m = window.__eduappsDevMock;
  return m ? { role: m.role, rpcs: [...m.unknownRpcs], tables: [...m.unknownTables] } : null;
});
await browser.close();

// ─── Resumen ─────────────────────────────────────────────────────────────────
if (!unknown) console.warn('⚠️  El modo mock no estaba activo (¿dev server sin el mock o build de producción?)');
else if (unknown.rpcs.length || unknown.tables.length) {
  console.log(`ℹ️  RPC sin fixture: ${unknown.rpcs.join(', ') || '—'} · tablas: ${unknown.tables.join(', ') || '—'}`);
}
const seen = new Set();
const uniq = problems.filter((p) => {
  const k = `${p.kind}|${p.text}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});
if (uniq.length) {
  console.log(`\n✖ ${uniq.length} problema(s) en la página:`);
  uniq.forEach((p) => console.log(`  [${p.kind}] ${p.text}`));
} else {
  console.log('\n✔ Sin errores de página ni de consola');
}
process.exit(args.strict && uniq.length ? 1 : 0);
