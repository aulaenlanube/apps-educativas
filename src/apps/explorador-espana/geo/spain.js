// Geometría del Explorador de España. A partir de public/data/geo/espana.json
// (tools/build-espana-geo.mjs) construye:
//   · dos capas jugables: comunidades autónomas y provincias (IGN), con
//     Canarias en un recuadro abajo a la izquierda (proyección propia),
//   · los vecinos por límite compartido en cada capa,
//   · los límites de las comunidades para dibujarlos sobre las provincias,
//   · el relieve: ríos, sistemas montañosos esquemáticos, mares e islas,
//   · los países vecinos como contexto (gris, no jugables).
// Expone la API del motor de mapas (src/apps/_shared/geo/MapView.jsx).
import { feature, mesh, neighbors as topoNeighbors } from 'topojson-client';
import {
  geoConicConformal, geoAzimuthalEqualArea, geoPath, geoCentroid, geoGraticule, geoArea,
} from 'd3-geo';
import {
  pathString, mainBody, focusView, padView, boundsToView, polygonsOf, asGeometry, unionBounds,
} from '../../_shared/geo/paths';
import {
  CCAA, CCAA_BY_INE, CCAA_BY_ID, PROV_BY_INE, ZONES, provKey, ccaaShort, isProvKey,
} from '../data/spain';
import { RIVERS, RANGES, SEAS, ISLANDS } from '../data/relief';

export const MAP_W = 1000;
const EARTH_R = 6371;
// Península, Baleares, Ceuta y Melilla.
const MAIN_BOX = [-9.6, 35.15, 4.45, 43.85];
// Recuadro de Canarias en el lienzo (abajo a la izquierda).
const CANARY_BOX = [-18.3, 27.55, -13.3, 29.5];
const CANARY_W = 205;
const MARKER_KM2 = 300;
const GIBRALTAR = { name: 'Gibraltar', note: 'Territorio británico de ultramar; España reclama su soberanía.' };

const isCanary = (ine, layer) => (layer === 'prov' ? ine === '35' || ine === '38' : ine === '05');

function projections() {
  const pad = 14;
  const main = geoConicConformal().parallels([36, 43]).rotate([3, 0])
    .fitWidth(MAP_W - pad * 2, { type: 'MultiPoint', coordinates: [[MAIN_BOX[0], MAIN_BOX[1]], [MAIN_BOX[2], MAIN_BOX[3]], [MAIN_BOX[0], MAIN_BOX[3]], [MAIN_BOX[2], MAIN_BOX[1]]] });
  const t = main.translate();
  main.translate([t[0] + pad, t[1] + pad]);
  const mainPath = geoPath(main);
  const [, [, yMax]] = mainPath.bounds({ type: 'MultiPoint', coordinates: [[MAIN_BOX[0], MAIN_BOX[1]], [MAIN_BOX[2], MAIN_BOX[1]], [MAIN_BOX[0], MAIN_BOX[3]]] });
  const height = yMax + pad;
  // Canarias encajada en un recuadro fijo del Atlántico, abajo a la izquierda
  // (libre de la península y de Marruecos).
  const corners = { type: 'MultiPoint', coordinates: [[CANARY_BOX[0], CANARY_BOX[1]], [CANARY_BOX[2], CANARY_BOX[3]], [CANARY_BOX[0], CANARY_BOX[3]], [CANARY_BOX[2], CANARY_BOX[1]]] };
  const canary = geoConicConformal().parallels([27.5, 29.5]).rotate([15.8, 0]).fitWidth(CANARY_W, corners);
  const cb = geoPath(canary).bounds(corners);
  const w = cb[1][0] - cb[0][0];
  const h = cb[1][1] - cb[0][1];
  const x0 = pad + 4;
  const y0 = height - h - pad - 4;
  canary.translate([canary.translate()[0] + x0 - cb[0][0], canary.translate()[1] + y0 - cb[0][1]]);
  const frame = { x: x0 - 8, y: y0 - 8, w: w + 16, h: h + 16 };
  return { main, canary, height, frame };
}

export function buildSpain(data) {
  const { topology, context, rivers } = data;
  const { main, canary, height, frame } = projections();
  const projOf = (canaryFlag) => (canaryFlag ? canary : main);
  const clipped = geoConicConformal().parallels([36, 43]).rotate([3, 0]).scale(main.scale()).translate(main.translate()).clipExtent([[-MAP_W, -height], [MAP_W * 2, height * 2]]);

  const ccaa = new Map();
  const prov = new Map();
  const zoneOf = (ccaaId) => CCAA_BY_ID[ccaaId]?.zone || 'otros';

  const buildLayer = (objName, layer, target) => {
    const geoms = topology.objects[objName].geometries;
    const keys = geoms.map((g) => {
      const id = String(g.id);
      if (layer === 'ccaa') return CCAA_BY_INE[id]?.id || `t:${id}`;
      return PROV_BY_INE[id] ? provKey(PROV_BY_INE[id]) : `t:${id}`;
    });
    geoms.forEach((g, i) => {
      const key = keys[i];
      const id = String(g.id);
      const geometry = feature(topology, g).geometry;
      const canaryFlag = isCanary(id, layer);
      const proj = projOf(canaryFlag);
      const path = geoPath(proj);
      const isTerr = key.startsWith('t:');
      const c = isTerr ? null : layer === 'ccaa' ? CCAA_BY_INE[id] : CCAA_BY_ID[PROV_BY_INE[id].ccaa];
      const p = layer === 'prov' && !isTerr ? PROV_BY_INE[id] : null;
      const km2 = geoArea(geometry) * EARTH_R * EARTH_R;
      const bounds = path.bounds(geometry);
      target.set(key, {
        key,
        layer,
        ine: id,
        name: isTerr ? GIBRALTAR.name : p ? p.name : c.name,
        ccaa: c?.id || null,
        cont: c ? zoneOf(c.id) : null,
        fill: c?.color || '#e2e8f0',
        fillHover: '#fef9c3',
        terr: isTerr ? GIBRALTAR : null,
        d: pathString(proj, geometry, 0.05, 2),
        parts: [],
        geometry,
        canary: canaryFlag,
        bodyBounds: bounds,
        centroid: proj(geoCentroid(geometry)),
        areaKm2: km2,
        marker: !isTerr && km2 < MARKER_KM2,
      });
    });
    // Vecinos por arco compartido.
    const nb = topoNeighbors(geoms);
    const neighbors = new Map();
    keys.forEach((a, i) => {
      if (a.startsWith('t:')) return;
      neighbors.set(a, new Set(nb[i].map((j) => keys[j]).filter((b) => b !== a && !b.startsWith('t:'))));
    });
    return neighbors;
  };

  const nbCcaa = buildLayer('autonomous_regions', 'ccaa', ccaa);
  const nbProv = buildLayer('provinces', 'prov', prov);
  const layers = { ccaa, prov };

  // Límites entre comunidades (para la capa de provincias).
  const ccaaOfGeom = (g) => PROV_BY_INE[String(g.id)]?.ccaa || String(g.id);
  const ccaaMesh = pathString(main, mesh(topology, topology.objects.provinces, (a, b) => a !== b && ccaaOfGeom(a) !== ccaaOfGeom(b)), 0.05, 2);

  /* ───── relieve ───── */
  const features = new Map();
  const pathMain = geoPath(main);
  const addLine = (r, type, geometry) => {
    features.set(r.id, {
      key: r.id, name: r.name, type, kind: 'line', d: pathString(main, geometry, 0.15, 1), bounds: pathMain.bounds(geometry),
      xy: main(midPoint(geometry)),
    });
  };
  for (const r of RIVERS) {
    const geometry = r.line ? { type: 'LineString', coordinates: r.line } : rivers[r.id];
    if (geometry) addLine(r, 'river', geometry);
  }
  for (const r of RANGES) {
    addLine(r, 'range', r.lines ? { type: 'MultiLineString', coordinates: r.lines } : { type: 'LineString', coordinates: r.line });
  }
  for (const s of SEAS) {
    const [x, y] = main(s.at);
    features.set(s.id, { key: s.id, name: s.name, type: 'sea', kind: 'point', xy: [x, y], bounds: [[x - 1, y - 1], [x + 1, y + 1]] });
  }
  // Islas: cada polígono de Baleares y Canarias se asigna a la isla más cercana.
  const islandPolys = new Map(ISLANDS.map((i) => [i.id, []]));
  for (const g of topology.objects.provinces.geometries) {
    const id = String(g.id);
    if (!['07', '35', '38'].includes(id)) continue;
    for (const coords of polygonsOf(feature(topology, g).geometry)) {
      const [lon, lat] = geoCentroid({ type: 'Polygon', coordinates: coords });
      let best = null;
      let bestD = 0.45;
      for (const isl of ISLANDS.filter((x) => x.prov === id)) {
        const d = Math.hypot(isl.at[0] - lon, isl.at[1] - lat);
        if (d < bestD) { best = isl; bestD = d; }
      }
      if (best) islandPolys.get(best.id).push(coords);
    }
  }
  for (const isl of ISLANDS) {
    const polys = islandPolys.get(isl.id);
    if (!polys.length) continue;
    const geometry = asGeometry(polys);
    const proj = isl.prov === '07' ? main : canary;
    const path = geoPath(proj);
    features.set(isl.id, { key: isl.id, name: isl.name, type: 'island', kind: 'area', d: pathString(proj, geometry, 0.05, 2), bounds: path.bounds(geometry), xy: proj(geoCentroid(geometry)) });
  }

  const graticule = geoGraticule().extent([[-20, 26], [6, 46]]).step([2, 2]);
  const views = {
    world: { x: 0, y: 0, w: MAP_W, h: height },
    peninsula: padView(boundsToView(pathMain.bounds({ type: 'MultiPoint', coordinates: [[-9.4, 36], [3.4, 43.8]] })), 0.04),
    canarias: { ...frame },
  };
  for (const c of CCAA) {
    const e = ccaa.get(c.id);
    if (e) views[c.id] = focusView(e.bodyBounds, 140, 0.25);
  }
  // Zonas (Norte, Centro…): pista de "¿Dónde está?" en Fácil y filtro del atlas.
  for (const z of ZONES) {
    const bounds = CCAA.filter((c) => c.zone === z.id && !c.autonomous).map((c) => ccaa.get(c.id)?.bodyBounds).filter(Boolean);
    if (bounds.length) views[`z-${z.id}`] = focusView(unionBounds(bounds), 200, 0.15);
  }
  const shapeCache = new Map();

  const spain = {
    width: MAP_W,
    height,
    maxZoom: 22,
    projection: main,
    canaryProjection: canary,
    entries: ccaa,
    layers,
    neighbors: { ccaa: nbCcaa, prov: nbProv },
    views,
    points: Object.fromEntries(SEAS.map((s) => [s.id, { name: s.name, xy: main(s.at) }])),
    features,
    background: {
      // Mar más grande que el lienzo: al alejar o en lienzos anchos no quedan bordes.
      sea: `M${-MAP_W} ${-height}H${MAP_W * 2}V${height * 2}H${-MAP_W}Z`,
      grid: pathString(clipped, graticule(), 0.5, 1),
    },
    context: Object.entries(context).map(([key, geometry]) => ({ key, d: pathString(clipped, geometry, 0.08, 1) })),
    frames: `M${frame.x} ${frame.y}h${frame.w}v${frame.h}h${-frame.w}z`,

    layer: (id) => layers[id] || ccaa,
    meshesFor: (id) => (id === 'prov' ? [{ key: 'ccaa', d: ccaaMesh }] : undefined),
    nameOf: (key) => features.get(key)?.name ?? ccaa.get(key)?.name ?? prov.get(key)?.name ?? null,
    groupName: (id) => (CCAA_BY_ID[id] ? ccaaShort(CCAA_BY_ID[id]) : id),
    neighborsOf: (key, layerId) => (layerId === 'prov' || isProvKey(key) ? nbProv.get(key) : nbCcaa.get(key)) || [],
    focusView: (key, layerId, atlas) => {
      const e = (layerId ? layers[layerId] : null)?.get(key) || ccaa.get(key) || prov.get(key);
      return e ? focusView(e.bodyBounds, atlas ? 160 : 220, 0.3) : views.world;
    },
    featureView: (key) => {
      const f = features.get(key);
      if (!f) return views.world;
      return f.kind === 'point' ? views.world : focusView(f.bounds, 260, 0.45);
    },
    // Silueta de una región: azimutal centrada en ella (las de islas, enteras).
    shapePath: (key, size = 200, pad = 10, layerId) => {
      const cacheKey = `${key}:${size}:${pad}`;
      if (shapeCache.has(cacheKey)) return shapeCache.get(cacheKey);
      const e = (layerId ? layers[layerId] : null)?.get(key) || ccaa.get(key) || prov.get(key);
      let d = '';
      if (e) {
        const keepIslands = ['ib', 'cn', 'p07', 'p35', 'p38'].includes(key);
        const body = keepIslands ? e.geometry : mainBody(e.geometry, 1.5);
        const c = geoCentroid(body);
        const proj = geoAzimuthalEqualArea().rotate([-c[0], -c[1]]).fitExtent([[pad, pad], [size - pad, size - pad]], body);
        d = pathString(proj, body, size / 700, 1);
      }
      shapeCache.set(cacheKey, d);
      return d;
    },
    glyph: () => '',
  };
  return spain;
}

// Vértice central de la línea más larga (anclaje de etiquetas).
function midPoint(geometry) {
  const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), lines[0]);
  return longest[Math.floor(longest.length / 2)];
}

/* ───────── carga ───────── */

let spainPromise = null;

export function loadSpain() {
  if (!spainPromise) {
    spainPromise = fetch('/data/geo/espana.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(buildSpain)
      .catch((err) => {
        spainPromise = null;
        throw err;
      });
  }
  return spainPromise;
}
