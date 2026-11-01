// Niveles, minijuegos y regiones del Explorador del Mundo.
// Una sola app para todos los cursos: el curso decide qué países entran
// (escalones de dificultad de countries.js) y qué minijuegos se desbloquean.
import { COUNTRIES, CONTINENTS, INHABITED } from '../data/countries';

// Nivel de contenido (1-6) a partir del curso.
export function courseLevel(level, grade) {
  const g = Number(grade) || 1;
  if (level === 'primaria') return g <= 2 ? 1 : g <= 4 ? 2 : 3;
  if (level === 'eso') return g <= 2 ? 4 : 5;
  if (level === 'bachillerato') return 6;
  return 2;
}

// tier: países que entran · capTier: países cuya capital se pregunta ·
// cityTier: ciudades famosas que entran · reliefTier: accidentes del relieve
// (0 = minijuego bloqueado)
export const LEVELS = {
  1: { tier: 1, capTier: 0, cityTier: 0, reliefTier: 0, neighbors: false, regions: false },
  2: { tier: 2, capTier: 1, cityTier: 0, reliefTier: 0, neighbors: false, regions: true },
  3: { tier: 3, capTier: 3, cityTier: 0, reliefTier: 1, neighbors: false, regions: true },
  4: { tier: 4, capTier: 4, cityTier: 2, reliefTier: 2, neighbors: false, regions: true },
  5: { tier: 5, capTier: 5, cityTier: 3, reliefTier: 3, neighbors: true, regions: true },
  6: { tier: 5, capTier: 5, cityTier: 3, reliefTier: 3, neighbors: true, regions: true },
};

export const GAMES = [
  { id: 'donde', title: '¿Dónde está?', desc: 'Encuentra cada país en el mapa del mundo.', usesRegion: true },
  { id: 'siluetas', title: 'Siluetas', desc: 'Descubre qué país es solo por su forma.', usesRegion: true },
  { id: 'banderas', title: 'Banderas', desc: 'Relaciona cada país con su bandera.', usesRegion: true },
  { id: 'continentes', title: 'Continentes y océanos', desc: 'Sitúa países, continentes y océanos.', usesRegion: false },
  { id: 'capitales', title: 'Capitales', desc: 'La capital de cada país… y al revés.', usesRegion: true },
  { id: 'relieve', title: 'Relieve', desc: 'Ríos, cordilleras, desiertos, mares y lagos.', usesRegion: true },
  { id: 'ciudades', title: 'Grandes ciudades', desc: 'Ciudades famosas y las más pobladas.', usesRegion: true },
  { id: 'vecinos', title: 'Fronteras', desc: '¿Qué países son vecinos?', usesRegion: true },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export function gamesFor(lv) {
  const L = LEVELS[lv];
  return GAMES.filter((g) => {
    if (g.id === 'capitales') return L.capTier > 0;
    if (g.id === 'ciudades') return L.cityTier > 0;
    if (g.id === 'relieve') return L.reliefTier > 0;
    if (g.id === 'vecinos') return L.neighbors;
    return true;
  });
}

// Regiones elegibles (además de "todo el mundo", que es 'all').
export const REGIONS = INHABITED.map((c) => ({ id: c, label: CONTINENTS[c].name }));

export const regionLabel = (id) => REGIONS.find((r) => r.id === id)?.label || 'Todo el mundo';

const MIN_POOL = 8;
const isAll = (region) => !region || region === 'all';

// Países del nivel (y de la región elegida). Si la región se queda corta para
// el curso, se amplía con el siguiente escalón hasta tener variedad.
export function countryPool(lv, region = 'all', { maxTier, filter } = {}) {
  const top = maxTier ?? LEVELS[lv].tier;
  const base = COUNTRIES.filter((k) => (isAll(region) || k.cont === region) && (!filter || filter(k)));
  const upTo = (tier) => base.filter((k) => k.t <= tier);
  let t = Math.max(1, top);
  let pool = upTo(t);
  while (pool.length < MIN_POOL && t < 5) {
    t += 1;
    pool = upTo(t);
  }
  return pool;
}

// Cuántos países hay en juego para mostrarlo en la pantalla de inicio.
export const poolSize = (lv, region) => countryPool(lv, region).length;
