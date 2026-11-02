// Niveles, minijuegos y filtros de Huesos y Músculos (aparato locomotor).

export function courseLevel(level, grade) {
  const g = Number(grade) || 1;
  if (level === 'primaria') return g <= 2 ? 1 : g <= 4 ? 2 : 3;
  if (level === 'eso') return g <= 2 ? 4 : 5;
  if (level === 'bachillerato') return 6;
  return 2;
}

// t = [título es, en, va] · d = [descripción es, en, va]
export const GAMES = [
  { id: 'huesos', from: 1, usesRegion: true, plates: () => ['esq-a', 'esq-p'], t: ['El esqueleto', 'The skeleton', "L'esquelet"], d: ['Encuentra cada hueso del cuerpo.', 'Find each bone in the body.', 'Troba cada os del cos.'] },
  { id: 'musculos', from: 2, usesRegion: true, plates: () => ['mus-a', 'mus-p'], t: ['Los músculos', 'The muscles', 'Els músculs'], d: ['Los músculos de delante y de detrás.', 'Muscles on the front and the back.', 'Els músculs de davant i de darrere.'] },
  { id: 'detalle', from: 4, usesRegion: false, plates: (lv) => ['craneo-a', 'craneo-l', 'columna-l', ...(lv >= 5 ? ['torax-a', 'mano', 'pie'] : [])], t: ['Huesos en detalle', 'Bones in detail', 'Ossos en detall'], d: ['Cráneo, columna, tórax, mano y pie.', 'Skull, spine, rib cage, hand and foot.', 'Crani, columna, tòrax, mà i peu.'] },
  { id: 'hueso', from: 3, usesRegion: false, plates: (lv) => (lv >= 4 ? ['hueso-largo', ...(lv >= 5 ? ['musculos-tipo'] : [])] : []), t: ['El hueso por dentro', 'Inside a bone', "L'os per dins"], d: ['Tipos de huesos y sus partes.', 'Types of bones and their parts.', "Tipus d'ossos i les seues parts."] },
  { id: 'articulaciones', from: 3, usesRegion: false, plates: (lv) => (lv >= 4 ? ['articulacion'] : []), t: ['Articulaciones', 'Joints', 'Articulacions'], d: ['Cómo se unen los huesos y cómo se mueven.', 'How bones join and move.', 'Com s\'uneixen els ossos i com es mouen.'] },
  { id: 'accion', from: 2, usesRegion: true, plates: () => [], t: ['Músculos en acción', 'Muscles in action', 'Músculs en acció'], d: ['Qué músculo hace cada cosa y en cada ejercicio.', 'Which muscle does what, and in each exercise.', 'Quin múscul fa cada cosa i en cada exercici.'] },
  { id: 'movimientos', from: 4, usesRegion: false, plates: () => [], t: ['Movimientos', 'Movements', 'Moviments'], d: ['Flexión, extensión, abducción, rotación…', 'Flexion, extension, abduction, rotation…', 'Flexió, extensió, abducció, rotació…'] },
  { id: 'biomecanica', from: 6, usesRegion: false, plates: () => [], t: ['Biomecánica', 'Biomechanics', 'Biomecànica'], d: ['Palancas, contracciones, planos y ejes.', 'Levers, contractions, planes and axes.', 'Palanques, contraccions, plans i eixos.'] },
];
export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));
export const gamesFor = (lv) => GAMES.filter((g) => g.from <= lv);

export function platesFor(gameId, lv) {
  if (gameId === 'exam' || gameId === 'duel') return [...new Set(gamesFor(lv).flatMap((g) => g.plates(lv)))];
  return GAME_BY_ID[gameId]?.plates(lv) || [];
}

// Filtro por zona del cuerpo.
export const regionsFor = (lv) => (lv >= 2 ? ['cabeza', 'tronco', 'ext-sup', 'ext-inf'] : null);
