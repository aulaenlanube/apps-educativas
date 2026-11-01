// tools/build-espana-geo.mjs
// Genera los datos estáticos de la app "Explorador de España":
//   · public/data/geo/espana.json → { topology, context, rivers }
//       topology: provincias y comunidades del IGN (paquete es-atlas, CC BY 4.0
//                 © Instituto Geográfico Nacional), con sus códigos INE.
//       context:  países y territorios vecinos (Portugal, Francia, Andorra, Italia,
//                 Marruecos, Argelia, Túnez, Sáhara Occidental)
//                 de world-atlas / Natural Earth, recortados a la zona.
//       rivers:   ríos de Natural Earth 1:10m (dominio público) por id de
//                 src/apps/explorador-espana/data/relief.js.
//   · public/images/flags/es/<id>.svg → banderas de las comunidades (créditos en
//     FLAG_CREDITS de data/spain.js).
//
// Uso: node tools/build-espana-geo.mjs (descarga y cachea Natural Earth y Commons)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { RIVERS } from '../src/apps/explorador-espana/data/relief.js';
import { naturalEarth, propOf, mergeGeometries, partsInBox } from './geo-helpers.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_GEO = path.join(ROOT, 'public/data/geo/espana.json');
const OUT_FLAGS = path.join(ROOT, 'public/images/flags/es');

/* ───────── topología del IGN ───────── */

const ign = JSON.parse(fs.readFileSync(require.resolve('es-atlas/es/provinces.json'), 'utf8'));
delete ign.objects.border;

/* ───────── países vecinos ───────── */

const CONTEXT_BOX = [-20, 26, 11, 48];
const world = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
const NEIGHBORS = { pt: '620', fr: '250', ad: '020', ma: '504', dz: '012', it: '380', tn: '788', eh: '732' };
const context = {};
for (const [key, id] of Object.entries(NEIGHBORS)) {
  const geom = world.objects.countries.geometries.find((g) => g.id === id);
  const parts = partsInBox(feature(world, geom).geometry, CONTEXT_BOX);
  if (parts) context[key] = mergeGeometries([parts], 0.01, 3);
}

/* ───────── ríos ───────── */

const SPAIN_BOX = [-10, 35.8, 4.5, 44];
const riverFeatures = [
  ...(await naturalEarth('ne_10m_rivers_lake_centerlines')).features,
  ...(await naturalEarth('ne_10m_rivers_europe')).features,
];
const rivers = {};
const missing = [];
for (const r of RIVERS.filter((x) => x.ne)) {
  const wanted = new Set(r.ne.map((n) => n.toLowerCase()));
  const found = riverFeatures
    .filter((f) => f.geometry && wanted.has(String(propOf(f.properties, 'name') || '').toLowerCase()))
    .map((f) => partsInBox(f.geometry, SPAIN_BOX))
    .filter(Boolean);
  const geom = mergeGeometries(found, 0.006, 3);
  if (geom) rivers[r.id] = geom; else missing.push(r.id);
}
if (missing.length) throw new Error(`Ríos sin geometría: ${missing.join(', ')}`);

const out = JSON.stringify({ topology: ign, context, rivers });
fs.writeFileSync(OUT_GEO, out);
console.log(`espana.json: ${(out.length / 1024).toFixed(0)} KB · ${Object.keys(rivers).length} ríos · ${Object.keys(context).length} países vecinos`);

/* ───────── banderas ───────── */

fs.mkdirSync(OUT_FLAGS, { recursive: true });

// Franjas oficiales según cada Estatuto de Autonomía (3:2).
const stripes = (colors, vertical = false) => {
  const n = colors.length;
  const rects = colors.map((c, i) => (vertical
    ? `<rect x="${(750 / n) * i}" width="${750 / n + 0.5}" height="500" fill="${c}"/>`
    : `<rect y="${(500 / n) * i}" width="750" height="${500 / n + 0.5}" fill="${c}"/>`)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500">${rects}</svg>`;
};
const DRAWN = {
  an: stripes(['#007934', '#ffffff', '#007934']),
  cn: stripes(['#ffffff', '#0768a9', '#ffcc00'], true),
  cb: stripes(['#ffffff', '#d52b1e']),
  ex: stripes(['#007a3d', '#ffffff', '#000000']),
  ri: stripes(['#d52b1e', '#ffffff', '#009a49', '#ffd100']),
};
for (const [id, svg] of Object.entries(DRAWN)) fs.writeFileSync(path.join(OUT_FLAGS, `${id}.svg`), svg);

const flagIcons = path.join(path.dirname(require.resolve('flag-icons/package.json')), 'flags/4x3');
for (const id of ['ct', 'ga', 'pv']) fs.copyFileSync(path.join(flagIcons, `es-${id}.svg`), path.join(OUT_FLAGS, `${id}.svg`));

const COMMONS = {
  as: 'Flag_of_Asturias.svg',
  cm: 'Flag_of_Castile-La_Mancha.svg',
  vc: 'Flag_of_the_Valencian_Community_(2x3).svg',
  nc: 'Flag_of_Navarre.svg',
  ib: 'Flag_of_the_Balearic_Islands.svg',
  md: 'Flag_of_the_Community_of_Madrid.svg',
  mc: 'Flag_of_the_Region_of_Murcia.svg',
  cl: 'Flag_of_Castile_and_León.svg',
  ar: 'Flag_of_Aragon.svg',
  ce: 'Flag_of_Ceuta.svg',
  ml: 'Flag_of_Melilla.svg',
};
const cacheDir = path.join(os.tmpdir(), 'eduapps-commons-flags');
fs.mkdirSync(cacheDir, { recursive: true });
const UA = { 'User-Agent': 'EduApps flag builder (https://apps-educativas.com)' };
for (const [id, file] of Object.entries(COMMONS)) {
  const cached = path.join(cacheDir, file);
  if (!fs.existsSync(cached)) {
    const res = await fetch(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`, { headers: UA, redirect: 'follow' });
    if (!res.ok) throw new Error(`No se pudo descargar ${file}: HTTP ${res.status}`);
    fs.writeFileSync(cached, Buffer.from(await res.arrayBuffer()));
  }
  fs.copyFileSync(cached, path.join(OUT_FLAGS, `${id}.svg`));
}
const total = fs.readdirSync(OUT_FLAGS).reduce((a, f) => a + fs.statSync(path.join(OUT_FLAGS, f)).size, 0);
console.log(`banderas autonómicas: ${fs.readdirSync(OUT_FLAGS).length} (${(total / 1024).toFixed(0)} KB)`);
