// Geometría del Explorador del Mundo. A partir de la topología de Natural Earth
// (public/data/geo/world-50m.json, generada con tools/build-world-geo.mjs)
// construye una vez:
//   · el mapa proyectado (Natural Earth I centrada en 11° E para que Oceanía y
//     Rusia no se partan por el antimeridiano),
//   · el "cuerpo principal" de cada país (sin territorios lejanos: Francia sin
//     la Guayana, España sin Canarias…) para siluetas y encuadres; las partes
//     lejanas se dibujan aparte con el continente donde están,
//   · los vecinos por frontera terrestre compartida,
//   · los recuadros de zoom de cada continente,
//   · y, bajo demanda, los accidentes del relieve (relief-50m.json).
// Expone la API del motor de mapas (src/apps/_shared/geo/MapView.jsx).
import { feature, merge, neighbors as topoNeighbors } from 'topojson-client';
import {
  geoNaturalEarth1, geoAzimuthalEqualArea, geoArea, geoCentroid, geoGraticule10, geoPath,
} from 'd3-geo';
import {
  asGeometry, boxSamples, boxView, focusView, mainBody, pathString, splitBody,
} from '../../_shared/geo/paths';
import { COUNTRIES, BY_ISO, CONTINENTS, geoIdOf } from '../data/countries';
import { MERGE_INTO, TERRITORIES, POINT_COUNTRIES, OCEANS } from '../data/extras';
import { RELIEF } from '../data/relief';

export const MAP_W = 1000;
const EARTH_R = 6371;
const ROTATE = [-11, 0];
// Islas a más de esta distancia (grados) del resto del país no entran en la silueta.
const BODY_GAP = 5;
const BODY_GAP_OVERRIDE = { my: 7, no: 2.5 }; // Malasia: península + Borneo; Noruega sin Svalbard
// Siluetas solo para países con un cuerpo principal reconocible.
const SHAPE_MIN_KM2 = 2000;
// Países pequeños (unidades del mapa o km²) se dibujan también como punto tocable.
const MARKER_MAX_SIZE = 3.2;
const MARKER_MAX_KM2 = 5000;

// Recuadros [oeste, sur, este, norte] de cada continente para el zoom.
const CONTINENT_BOXES = {
  europa: [-25, 34, 45, 71],
  africa: [-26, -36, 58, 38],
  asia: [25, -11, 150, 72],
  america: [-168, -56, -30, 78],
  oceania: [110, -48, 189, 15],
};

const ID_TO_ISO = Object.fromEntries(COUNTRIES.map((k) => [geoIdOf(k), k.c]));

function keyOfGeometry(id) {
  if (ID_TO_ISO[id]) return ID_TO_ISO[id];
  if (MERGE_INTO[id]) return MERGE_INTO[id];
  return `t:${id}`;
}

// Continente "geográfico" de un punto según los recuadros de zoom (primero el
// del propio país, porque los recuadros se solapan).
function continentAt([lon, lat], own) {
  const inBox = ([w, s, e, n]) => {
    const l = e > 180 && lon < 0 ? lon + 360 : lon;
    return l >= w && l <= e && lat >= s && lat <= n;
  };
  if (CONTINENT_BOXES[own] && inBox(CONTINENT_BOXES[own])) return own;
  for (const [cont, box] of Object.entries(CONTINENT_BOXES)) if (inBox(box)) return cont;
  return own;
}

/* ───────── construcción del mundo ───────── */

export function buildWorld(topology) {
  const geoms = topology.objects.countries.geometries;
  const projection = geoNaturalEarth1().rotate(ROTATE).fitWidth(MAP_W, { type: 'Sphere' });
  const boundsOf = geoPath(projection).bounds;
  const height = boundsOf({ type: 'Sphere' })[1][1];

  // Agrupar geometrías por país (o territorio).
  const groups = new Map();
  geoms.forEach((g, i) => {
    const key = keyOfGeometry(String(g.id));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  });

  const entries = new Map();
  for (const [key, idxs] of groups) {
    const isCountry = !key.startsWith('t:');
    const geometry = idxs.length > 1
      ? merge(topology, idxs.map((i) => geoms[i]))
      : feature(topology, geoms[idxs[0]]).geometry;
    const iso = isCountry ? key : null;
    const k = iso ? BY_ISO[iso] : null;
    const terr = isCountry ? null : TERRITORIES[key.slice(2)] || { name: 'Territorio', note: '', cont: null };
    const cont = k ? k.cont : terr.cont;
    const { body, remote } = isCountry
      ? splitBody(geometry, BODY_GAP_OVERRIDE[iso] || BODY_GAP)
      : { body: geometry, remote: [] };

    // Partes lejanas agrupadas por el continente en el que están.
    const remoteByCont = new Map();
    for (const coords of remote) {
      const c = continentAt(geoCentroid({ type: 'Polygon', coordinates: coords }), cont);
      if (!remoteByCont.has(c)) remoteByCont.set(c, []);
      remoteByCont.get(c).push(coords);
    }
    const parts = [...remoteByCont].map(([c, polys]) => ({ cont: c, d: pathString(projection, asGeometry(polys)) })).filter((p) => p.d);

    const bodyBounds = boundsOf(body);
    const size = Math.max(bodyBounds[1][0] - bodyBounds[0][0], bodyBounds[1][1] - bodyBounds[0][1]);
    const bodyKm2 = geoArea(body) * EARTH_R * EARTH_R;
    entries.set(key, {
      key,
      iso,
      name: k ? k.name : terr.name,
      cont,
      terr,
      d: pathString(projection, body),
      parts,
      body,
      bodyBounds,
      centroid: projection(geoCentroid(body)),
      areaKm2: geoArea(geometry) * EARTH_R * EARTH_R,
      bodyKm2,
      marker: isCountry && (size < MARKER_MAX_SIZE || bodyKm2 < MARKER_MAX_KM2),
      hasShape: isCountry && bodyKm2 >= SHAPE_MIN_KM2,
    });
  }

  // Países sin geometría a esta resolución: solo punto.
  for (const [iso, lonlat] of Object.entries(POINT_COUNTRIES)) {
    if (entries.has(iso)) continue;
    const [x, y] = projection(lonlat);
    entries.set(iso, {
      key: iso, iso, name: BY_ISO[iso].name, cont: BY_ISO[iso].cont, terr: null, d: '', parts: [], body: null,
      bodyBounds: [[x - 0.5, y - 0.5], [x + 0.5, y + 0.5]], centroid: [x, y], areaKm2: 0, bodyKm2: 0, marker: true, hasShape: false,
    });
  }

  // Vecinos: geometrías que comparten algún arco (frontera terrestre).
  const nb = topoNeighbors(geoms);
  const neighbors = new Map();
  geoms.forEach((g, i) => {
    const a = keyOfGeometry(String(g.id));
    if (a.startsWith('t:')) return;
    if (!neighbors.has(a)) neighbors.set(a, new Set());
    for (const j of nb[i]) {
      const b = keyOfGeometry(String(geoms[j].id));
      if (b !== a && !b.startsWith('t:')) neighbors.get(a).add(b);
    }
  });

  // Vista del mundo sin la mayor parte de la Antártida; la completa, para continentes y océanos.
  const ySouth = projection([0, -62])[1];
  const views = {
    world: { x: 0, y: 0, w: MAP_W, h: ySouth },
    full: { x: 0, y: 0, w: MAP_W, h: height },
    ...Object.fromEntries(Object.entries(CONTINENT_BOXES).map(([c, box]) => [c, boxView(projection, box)])),
  };

  const points = Object.fromEntries(OCEANS.map((o) => [o.id, { name: o.name, xy: projection(o.at) }]));
  const shapeCache = new Map();
  const features = new Map();

  const world = {
    topology,
    width: MAP_W,
    height,
    projection,
    entries,
    neighbors,
    views,
    points,
    features,
    oceans: OCEANS.map((o) => ({ ...o, xy: projection(o.at) })),
    background: {
      sea: pathString(projection, { type: 'Sphere' }, 0.5),
      grid: pathString(projection, geoGraticule10(), 0.5, 1),
    },
    glyphs: null,
    reliefLoaded: false,

    layer: () => entries,
    nameOf: (key) => features.get(key)?.name ?? entries.get(key)?.name ?? null,
    groupName: (id) => CONTINENTS[id]?.name || id,
    neighborsOf: (key) => neighbors.get(key) || [],
    focusView: (key, _layer, atlas) => {
      const e = entries.get(key);
      return e ? focusView(e.bodyBounds, atlas ? 90 : 150) : views.world;
    },
    featureView: (key) => {
      const f = features.get(key);
      return f ? focusView(f.bounds, 220, 0.6) : views.world;
    },
    // Silueta del país (cuerpo principal) en proyección azimutal centrada en él.
    shapePath: (key, size = 200, pad = 10) => {
      const cacheKey = `${key}:${size}:${pad}`;
      if (shapeCache.has(cacheKey)) return shapeCache.get(cacheKey);
      const e = entries.get(key);
      let d = '';
      if (e?.body) {
        const c = geoCentroid(e.body);
        const proj = geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[pad, pad], [size - pad, size - pad]], e.body);
        d = pathString(proj, e.body, size / 700, 1);
      }
      shapeCache.set(cacheKey, d);
      return d;
    },
    glyph: (cont) => continentGlyphs(world)[cont] || '',
  };
  return world;
}

/* ───────── siluetas de continentes ───────── */

// box: recuadro [oeste, sur, este, norte] que encuadra y recorta;
// gap: se queda con el cuerpo principal; polar: vista desde el polo sur.
const GLYPHS = {
  europa: { box: [-25, 34, 60, 72] },
  asia: { box: [26, -11, 180, 78] },
  africa: { gap: 6 },
  america: { gap: 6 },
  oceania: { gap: 15 },
  antartida: { polar: true },
};
const GLYPH_EXTENT = [[2, 2], [62, 42]];

function glyphPath(geometry, spec) {
  let geom = geometry;
  let proj;
  if (spec.polar) {
    proj = geoAzimuthalEqualArea().rotate([0, 90]).fitExtent(GLYPH_EXTENT, geom);
  } else if (spec.box) {
    const [w, s, e, n] = spec.box;
    proj = geoNaturalEarth1().rotate([-(w + e) / 2, 0])
      .fitExtent(GLYPH_EXTENT, { type: 'MultiPoint', coordinates: boxSamples(w, s, e, n, 10) })
      .clipExtent(GLYPH_EXTENT);
  } else {
    geom = mainBody(geom, spec.gap);
    proj = geoNaturalEarth1().rotate([-geoCentroid(geom)[0], 0]).fitExtent(GLYPH_EXTENT, geom);
  }
  return pathString(proj, geom, 0.45, 1);
}

// Silueta de cada continente en una caja de 64 × 44 (botones de respuesta).
// Rusia entra en Europa y en Asia, recortada por el recuadro de cada una.
export function continentGlyphs(world) {
  if (world.glyphs) return world.glyphs;
  const geoms = world.topology.objects.countries.geometries;
  const glyphs = {};
  for (const [cont, spec] of Object.entries(GLYPHS)) {
    const members = geoms.filter((g) => {
      const key = keyOfGeometry(String(g.id));
      return world.entries.get(key)?.cont === cont || (cont === 'asia' && key === 'ru');
    });
    if (members.length) glyphs[cont] = glyphPath(merge(world.topology, members), spec);
  }
  world.glyphs = glyphs;
  return glyphs;
}

/* ───────── relieve ───────── */

// Añade al mundo los accidentes del relieve (ríos, cordilleras, desiertos,
// mares y lagos). `data`: { [id]: GeoJSON geometry } de relief-50m.json.
export function attachRelief(world, data) {
  const path = geoPath(world.projection);
  for (const r of RELIEF) {
    const geometry = data[r.id];
    if (!geometry) continue;
    const isLine = geometry.type === 'LineString' || geometry.type === 'MultiLineString';
    const d = pathString(world.projection, geometry, 0.08, 2);
    if (!d) continue;
    const bounds = path.bounds(geometry);
    // Punto de la etiqueta: centroide (áreas) o vértice central de la línea más larga.
    let xy;
    if (isLine) {
      const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
      const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), lines[0]);
      xy = world.projection(longest[Math.floor(longest.length / 2)]);
    } else {
      xy = world.projection(geoCentroid(geometry));
    }
    world.features.set(r.id, {
      key: r.id, name: r.name, type: r.type, kind: isLine ? 'line' : 'area', d, bounds, xy, cont: r.cont,
    });
  }
  world.reliefLoaded = true;
  return world;
}

/* ───────── carga ───────── */

let worldPromise = null;
let reliefPromise = null;

export function loadWorld() {
  if (!worldPromise) {
    worldPromise = fetch('/data/geo/world-50m.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(buildWorld)
      .catch((err) => {
        worldPromise = null; // permitir reintentar
        throw err;
      });
  }
  return worldPromise;
}

export function loadRelief(world) {
  if (world.reliefLoaded) return Promise.resolve(world);
  if (!reliefPromise) {
    reliefPromise = fetch('/data/geo/relief-50m.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => attachRelief(world, data))
      .catch((err) => {
        reliefPromise = null;
        throw err;
      });
  }
  return reliefPromise;
}

