// tools/build-world-geo.mjs
// Genera los datos estáticos de la app "Explorador del Mundo":
//   · public/data/geo/world-50m.json  → topología de países (Natural Earth 1:50m,
//     paquete world-atlas) simplificada y sin propiedades. Las geometrías sin
//     código ISO reciben uno propio (KOS, NCY, SOL, IOT, SIA).
//   · public/images/flags/<iso2>.svg  → banderas 4:3 de flag-icons (MIT) de los
//     195 países del juego.
//   · public/data/geo/relief-50m.json → ríos, cordilleras, desiertos, mares y lagos
//     del minijuego de relieve (Natural Earth 1:50m, dominio público), una
//     geometría por id de src/apps/explorador-mundo/data/relief.js.
//
// Uso: node tools/build-world-geo.mjs (descarga y cachea las capas de Natural Earth)
// Solo hace falta volver a lanzarlo si cambia la lista de países o la resolución.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { presimplify, simplify, quantile } from 'topojson-simplify';
import { quantize } from 'topojson-client';
import { COUNTRIES } from '../src/apps/explorador-mundo/data/countries.js';
import { RELIEF } from '../src/apps/explorador-mundo/data/relief.js';
import { naturalEarth, propOf, mergeGeometries, partsInBox } from './geo-helpers.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Fracción de vértices que se conserva y rejilla de cuantización: compromiso
// entre peso (~150 KB gzip) y siluetas nítidas de países pequeños.
const KEEP = 0.55;
const QUANTIZE = 1e5;

const NO_ID = {
  Kosovo: 'KOS',
  'N. Cyprus': 'NCY',
  Somaliland: 'SOL',
  'Indian Ocean Ter.': 'IOT',
  'Siachen Glacier': 'SIA',
};

const src = require.resolve('world-atlas/countries-50m.json');
const topo = JSON.parse(fs.readFileSync(src, 'utf8'));
delete topo.objects.land;
for (const g of topo.objects.countries.geometries) {
  if (g.id == null) {
    g.id = NO_ID[g.properties?.name];
    if (!g.id) throw new Error(`Geometría sin id desconocida: ${g.properties?.name}`);
  }
  delete g.properties;
}

const pre = presimplify(topo);
const out = quantize(simplify(pre, quantile(pre, KEEP)), QUANTIZE);
const geoDir = path.join(ROOT, 'public/data/geo');
fs.mkdirSync(geoDir, { recursive: true });
const json = JSON.stringify(out);
fs.writeFileSync(path.join(geoDir, 'world-50m.json'), json);
console.log(`world-50m.json: ${(json.length / 1024).toFixed(0)} KB, ${out.objects.countries.geometries.length} geometrías`);

const flagSrc = path.join(path.dirname(require.resolve('flag-icons/package.json')), 'flags/4x3');
const flagDir = path.join(ROOT, 'public/images/flags');
fs.mkdirSync(flagDir, { recursive: true });
let bytes = 0;
for (const k of COUNTRIES) {
  const file = path.join(flagSrc, `${k.c}.svg`);
  fs.copyFileSync(file, path.join(flagDir, `${k.c}.svg`));
  bytes += fs.statSync(file).size;
}
console.log(`banderas: ${COUNTRIES.length} (${(bytes / 1024).toFixed(0)} KB)`);

// ───────── relieve ─────────
const LAYERS = {
  rivers: 'ne_50m_rivers_lake_centerlines',
  regions: 'ne_50m_geography_regions_polys',
  marine: 'ne_50m_geography_marine_polys',
  lakes: 'ne_50m_lakes',
};
const layerData = {};
for (const [k, layer] of Object.entries(LAYERS)) layerData[k] = (await naturalEarth(layer)).features;

const relief = {};
const missing = [];
for (const r of RELIEF) {
  const wanted = new Set(r.names.map((n) => n.toLowerCase()));
  const found = layerData[r.src]
    .filter((f) => f.geometry && wanted.has(String(propOf(f.properties, 'name') || '').toLowerCase()))
    .map((f) => (r.bbox ? partsInBox(f.geometry, r.bbox) : f.geometry))
    .filter(Boolean);
  const geom = mergeGeometries(found, r.src === 'rivers' ? 0.02 : 0.04);
  if (geom) relief[r.id] = geom; else missing.push(r.id);
}
if (missing.length) throw new Error(`Relieve sin geometría: ${missing.join(', ')}`);
const reliefJson = JSON.stringify(relief);
fs.writeFileSync(path.join(geoDir, 'relief-50m.json'), reliefJson);
console.log(`relief-50m.json: ${(reliefJson.length / 1024).toFixed(0)} KB, ${Object.keys(relief).length} elementos`);
