// tools/app-registry.mjs
//
// Carga el registro REAL de apps (src/apps/config/*Apps.js) desde Node, sin
// Vite, para que los scripts de build cuenten las apps con el mismo código que
// la web. Esos ficheros están escritos para Vite: importan JSON sin atributos,
// usan rutas sin extensión y `lazy` de React. Unos hooks de módulos de Node
// cubren justo eso, y SOLO para ficheros de src/:
//   - `react` → stub con un `lazy` que no carga nada (los componentes de cada
//     app nunca se importan: solo queremos ids, nombres y listas);
//   - `.json` → módulo ES con `export default`;
//   - rutas relativas sin extensión → `.js`; alias `@/` → src/.
//
// Los hooks son globales al proceso: importa este módulo solo desde scripts
// de tools/ (el plugin de Vite lo lanza en un proceso aparte).

import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
const SRC_URL = pathToFileURL(path.join(ROOT, 'src') + path.sep).href;

export const REGISTRY_FILES = [
  'src/apps/config/commonApps.js',
  'src/apps/config/primariaApps.js',
  'src/apps/config/esoApps.js',
  'src/apps/config/bachilleratoApps.js',
  'src/apps/config/adApps.js',
  'public/data/materias.json',
];

const REACT_STUB = 'data:text/javascript,' + encodeURIComponent(
  'export const lazy = (load) => ({ $$lazy: load }); export default { lazy };'
);

let hooked = false;
function installHooks() {
  if (hooked) return;
  hooked = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      const fromSrc = context.parentURL && context.parentURL.startsWith(SRC_URL);
      if (!fromSrc) return nextResolve(specifier, context);
      if (specifier === 'react') return { url: REACT_STUB, shortCircuit: true };
      let spec = specifier;
      if (spec.startsWith('@/')) spec = pathToFileURL(path.join(ROOT, 'src', spec.slice(2))).href;
      const isPath = spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('file:');
      if (isPath && !/\.[a-z0-9]+$/i.test(spec)) {
        try { return nextResolve(`${spec}.js`, context); } catch { /* sigue */ }
      }
      return nextResolve(spec, context);
    },
    load(url, context, nextLoad) {
      if (url.startsWith(SRC_URL) || url.includes('/public/data/')) {
        if (url.endsWith('.json')) {
          const source = fs.readFileSync(fileURLToPath(url), 'utf8');
          return { format: 'module', source: `export default ${source};`, shortCircuit: true };
        }
      }
      return nextLoad(url, context);
    },
  });
}

/** Devuelve { registry, families } listo para src/data/appStats.js. */
export async function loadAppRegistry() {
  installHooks();
  const cfg = (file) => import(pathToFileURL(path.join(ROOT, 'src', 'apps', 'config', file)).href);
  const [p, e, b, a, common] = await Promise.all([
    cfg('primariaApps.js'), cfg('esoApps.js'), cfg('bachilleratoApps.js'), cfg('adApps.js'), cfg('commonApps.js'),
  ]);
  return {
    registry: {
      primaria: { apps: p.primariaApps, subjects: p.primariaSubjects },
      eso: { apps: e.esoApps, subjects: e.esoSubjects },
      bachillerato: { apps: b.bachilleratoApps, subjects: b.bachilleratoSubjects },
      ad: { apps: a.adApps, subjects: a.adSubjects },
    },
    families: common.APP_FAMILIES || {},
  };
}

/** Resumen de cifras (sin `generado`) calculado del registro real. */
export async function loadAppStats() {
  const { computeAppStats } = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'appStats.js')).href);
  const { registry, families } = await loadAppRegistry();
  return computeAppStats(registry, families);
}
