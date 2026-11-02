// Anatomía 3D: niveles, minijuegos y aparatos (sin React; lo usan los tests).
//
// Niveles (como el resto de apps del cuerpo): 3 = 5.º-6.º de Primaria,
// 4 = 1.º-2.º de ESO, 5 = 3.º-4.º de ESO, 6 = Bachillerato.

export function courseLevel(level, grade) {
  const g = Number(grade) || 1;
  if (level === 'primaria') return 3;
  if (level === 'eso') return g <= 2 ? 4 : 5;
  if (level === 'bachillerato') return 6;
  return 3;
}

// t = [título es, en, va] · d = [descripción es, en, va]
export const GAMES = [
  { id: 'donde', from: 3, usesRegion: true, t: ['¿Dónde está?', 'Where is it?', 'On està?'], d: ['Gira el cuerpo, quita capas y toca la estructura.', 'Turn the body, peel off layers and tap the structure.', 'Gira el cos, lleva capes i toca l’estructura.'] },
  { id: 'quees', from: 3, usesRegion: true, t: ['¿Qué es?', 'What is it?', 'Què és?'], d: ['Una pieza se ilumina: gírala y di qué es.', 'A part lights up: turn it and say what it is.', 'Una peça s’il·lumina: gira-la i digues què és.'] },
  { id: 'monta', from: 3, usesRegion: true, t: ['Monta el cuerpo', 'Build the body', 'Munta el cos'], d: ['Arrastra cada pieza suelta a su sitio.', 'Drag each loose part back into place.', 'Arrossega cada peça solta al seu lloc.'] },
  { id: 'debajo', from: 4, usesRegion: false, t: ['¿Qué hay debajo?', 'What lies beneath?', 'Què hi ha davall?'], d: ['¿Qué órgano está justo debajo del punto marcado en la piel?', 'Which organ lies right under the point marked on the skin?', 'Quin òrgan hi ha just davall del punt marcat en la pell?'] },
  { id: 'tac', from: 5, usesRegion: false, t: ['Cortes y TAC', 'Sections and CT', 'Talls i TAC'], d: ['Corta el cuerpo como en un escáner: planos y estructuras.', 'Slice the body like a scanner: planes and structures.', 'Talla el cos com en un escàner: plans i estructures.'] },
];
export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));
export const gamesFor = (lv) => GAMES.filter((g) => g.from <= lv);

// Aparatos que se pueden elegir (y las láminas cuyas estructuras se juegan en 3D).
export const REGIONS = ['oseo', 'muscular', 'digestivo', 'respiratorio', 'circulatorio', 'excretor', 'nervioso'];
export const regionsFor = () => REGIONS;

// lámina (2D) → aparato con el que se juega (las claves salen del índice de láminas)
export const PLATE_SYSTEM = {
  'esq-a': 'oseo', 'esq-p': 'oseo', 'craneo-a': 'oseo', 'craneo-l': 'oseo', 'columna-l': 'oseo', 'torax-a': 'oseo', mano: 'oseo', pie: 'oseo',
  'mus-a': 'muscular', 'mus-p': 'muscular', 'mus-prof-a': 'muscular', 'mus-prof-p': 'muscular',
  'org-a': 'organos', 'org-prof-a': 'organos', 'digestivo-a': 'organos', 'pulmones-a': 'organos', 'corazon-ext': 'organos', 'encefalo-l': 'organos', areas: 'organos',
  'vas-a': 'circulatorio', 'nerv-a': 'nervioso', 'nerv-p': 'nervioso',
};

// Lámina de cuerpo entero equivalente (medio y examen: hay que buscar sin acercar ni girar la cámara)
export const BODY_OF = {
  'craneo-a': 'esq-a', 'craneo-l': 'esq-a', 'columna-l': 'esq-p', 'torax-a': 'esq-a', mano: 'esq-a', pie: 'esq-a', 'esq-p': 'esq-a',
  'mus-p': 'mus-a', 'mus-prof-p': 'mus-prof-a',
  'digestivo-a': 'org-a', 'pulmones-a': 'org-a', 'corazon-ext': 'org-a', 'encefalo-l': 'org-a', areas: 'org-a',
  'nerv-p': 'nerv-a',
};
