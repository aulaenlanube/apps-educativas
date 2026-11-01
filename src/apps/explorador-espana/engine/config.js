// Niveles y minijuegos del Explorador de España. Una sola app para todos los
// cursos: en los primeros, comunidades autónomas; desde 5.º de Primaria,
// también provincias, y el relieve y las fronteras crecen con el curso.
import { CCAA, PROVINCES } from '../data/spain';

export function courseLevel(level, grade) {
  const g = Number(grade) || 1;
  if (level === 'primaria') return g <= 2 ? 1 : g <= 4 ? 2 : 3;
  if (level === 'eso') return g <= 2 ? 4 : 5;
  if (level === 'bachillerato') return 6;
  return 2;
}

// provinces: entran las provincias · capitals: 0 nada, 1 comunidades, 2 + provincias
// relief: escalón del relieve · neighbors: 0 nada, 1 comunidades, 2 + provincias
// provShare: proporción de preguntas de provincias en "¿Dónde está?" y "Siluetas"
export const LEVELS = {
  1: { provinces: false, capitals: 0, relief: 0, neighbors: 0, provShare: 0 },
  2: { provinces: false, capitals: 1, relief: 1, neighbors: 0, provShare: 0 },
  3: { provinces: true, capitals: 2, relief: 2, neighbors: 0, provShare: 0.5 },
  4: { provinces: true, capitals: 2, relief: 3, neighbors: 1, provShare: 0.6 },
  5: { provinces: true, capitals: 2, relief: 3, neighbors: 2, provShare: 0.65 },
  6: { provinces: true, capitals: 2, relief: 3, neighbors: 2, provShare: 0.7 },
};

export const GAMES = [
  { id: 'donde', title: '¿Dónde está?', desc: 'Encuentra comunidades y provincias en el mapa.' },
  { id: 'siluetas', title: 'Siluetas', desc: 'Reconoce cada comunidad por su forma.' },
  { id: 'banderas', title: 'Banderas', desc: 'Las banderas de las comunidades autónomas.' },
  { id: 'capitales', title: 'Capitales', desc: 'Capitales de comunidades y provincias.' },
  { id: 'provincias', title: 'Provincias', desc: '¿De qué comunidad es cada provincia?', tint: 'provincias' },
  { id: 'relieve', title: 'Relieve', desc: 'Ríos, montañas, mares e islas de España.' },
  { id: 'vecinos', title: 'Fronteras', desc: '¿Qué comunidades y provincias son vecinas?' },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export function gamesFor(lv) {
  const L = LEVELS[lv];
  return GAMES.filter((g) => {
    if (g.id === 'capitales') return L.capitals > 0;
    if (g.id === 'provincias') return L.provinces;
    if (g.id === 'relieve') return L.relief > 0;
    if (g.id === 'vecinos') return L.neighbors > 0;
    return true;
  });
}

// Comunidades que entran en juego (Ceuta y Melilla, desde 5.º de Primaria).
export const ccaaPool = (lv) => CCAA.filter((c) => c.t === 1 || LEVELS[lv].provinces);

export function poolText(lv) {
  const n = ccaaPool(lv).length;
  // 50 provincias: Ceuta y Melilla son ciudades autónomas, no provincias.
  return LEVELS[lv].provinces ? `${n} comunidades y ciudades autónomas y ${PROVINCES.filter((p) => !p.autonomous).length} provincias` : `${n} comunidades autónomas`;
}
