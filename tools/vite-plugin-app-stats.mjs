// tools/vite-plugin-app-stats.mjs
//
// Da a la web las cifras de apps/adaptaciones SIN cargar el registro entero
// en la portada (commonApps + configs ≈ 15 KB gz que la home no necesita):
//   - `import APP_STATS from 'virtual:app-stats'` → el resumen de
//     src/data/appStats.js (mismo objeto que /datos/cifras-apps.json sin
//     `generado`);
//   - en index.html, {{apps}}, {{adaptaciones}}, {{cursos}} y {{ultima_app}}
//     se sustituyen por las cifras (JSON-LD de la organización y del sitio).
//
// El cálculo corre en un proceso de Node aparte (tools/generate-app-stats.mjs
// --stdout) porque necesita hooks de módulos que no deben afectar a Vite. En
// dev se recalcula al guardar cualquier fichero del registro.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(__dirname, 'generate-app-stats.mjs');
const WATCHED = [
  'src/apps/config/commonApps.js',
  'src/apps/config/primariaApps.js',
  'src/apps/config/esoApps.js',
  'src/apps/config/bachilleratoApps.js',
  'src/apps/config/adApps.js',
  'public/data/materias.json',
].map((f) => path.join(ROOT, f));

const VIRTUAL_ID = 'virtual:app-stats';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

export default function appStatsPlugin() {
  let stats = null;
  let fill = null;

  const compute = () => {
    if (!stats) {
      const out = execFileSync(process.execPath, [SCRIPT, '--stdout'], { cwd: ROOT, encoding: 'utf8' });
      stats = JSON.parse(out);
    }
    return stats;
  };

  return {
    name: 'eduapps-app-stats',

    async buildStart() {
      ({ fillStatsPlaceholders: fill } = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'appStats.js')).href));
      for (const f of WATCHED) this.addWatchFile(f);
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export default ${JSON.stringify(compute())};\n`;
    },

    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (!WATCHED.includes(path.resolve(file))) return;
        stats = null;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.reloadModule(mod);
      });
    },

    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!fill) {
          ({ fillStatsPlaceholders: fill } = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'appStats.js')).href));
        }
        const out = fill(html, compute());
        if (/\{\{\s*(apps|adaptaciones|cursos|ultima_app)\s*\}\}/.test(out)) {
          throw new Error('[app-stats] quedan marcadores {{…}} sin sustituir en index.html');
        }
        return out;
      },
    },
  };
}
