// Niveles, minijuegos y filtros del Explorador del Cuerpo Humano.
// Una sola app para todos los cursos: el curso decide qué estructuras entran
// (campo l del catálogo) y qué minijuegos y láminas se desbloquean.

const LANG_SUBJECTS = { ingles: 'en', valenciano: 'va' };

// Nivel de contenido (1-6) a partir del curso. En las asignaturas de idioma
// (vocabulario del cuerpo) y en Atención a la Diversidad se usa el básico.
export function courseLevel(level, grade, subjectId) {
  const g = Number(grade) || 1;
  let lv;
  if (level === 'primaria') lv = g <= 2 ? 1 : g <= 4 ? 2 : 3;
  else if (level === 'eso') lv = g <= 2 ? 4 : 5;
  else if (level === 'bachillerato') lv = 6;
  else lv = 1;
  if (subjectId === 'ingles') lv = Math.min(lv, 2);
  if (subjectId === 'valenciano') lv = Math.min(lv, 3);
  return lv;
}

export const defaultLang = (level, subjectId) => LANG_SUBJECTS[subjectId] || 'es';

export const LANGUAGES = [
  { id: 'es', label: 'Castellano' },
  { id: 'va', label: 'Valencià' },
  { id: 'en', label: 'English' },
];

// Láminas de "Por dentro" (los huesos van en Huesos y Músculos; los sentidos,
// la reproducción y las glándulas tienen su propio minijuego).
export const DENTRO = [
  { id: 'digestivo-a', lv: 3 }, { id: 'pulmones-a', lv: 3 }, { id: 'bronquios-a', lv: 3 },
  { id: 'corazon-ext', lv: 3 }, { id: 'encefalo-l', lv: 3 }, { id: 'cabeza-s', lv: 3 },
  { id: 'dentadura', lv: 3 }, { id: 'alveolo', lv: 3 }, { id: 'sangre', lv: 3 },
  { id: 'vas-a', lv: 4 }, { id: 'nerv-a', lv: 4 }, { id: 'nerv-p', lv: 4 }, { id: 'diente', lv: 4 }, { id: 'corazon', lv: 4 },
  { id: 'neurona', lv: 4 }, { id: 'circulacion', lv: 4 }, { id: 'arco-reflejo', lv: 4 },
  { id: 'encefalo-s', lv: 5 }, { id: 'rinon', lv: 5 }, { id: 'nefrona', lv: 5 }, { id: 'vellosidad', lv: 5 }, { id: 'linfatico', lv: 5 },
  { id: 'areas', lv: 6 },
];

const SENSE_PLATES = (lv) => (lv >= 3 ? ['cara', 'ojo', 'oido', 'piel', ...(lv >= 5 ? ['lengua'] : [])] : ['cara']);
const REPRO_PLATES = (lv) => ['rep-m', 'rep-f', ...(lv >= 4 ? ['gametos', 'embarazo'] : [])];

// t = [título es, en, va] · d = [descripción es, en, va]
export const GAMES = [
  { id: 'partes', from: 1, usesRegion: false, plates: () => ['cuerpo-a', 'cuerpo-p', 'cara'], t: ['Partes del cuerpo', 'Parts of the body', 'Parts del cos'], d: ['Cabeza, tronco, extremidades y la cara.', 'Head, trunk, limbs and the face.', 'Cap, tronc, extremitats i la cara.'] },
  { id: 'organos', from: 1, usesRegion: true, plates: (lv) => (lv >= 2 ? ['org-a', 'org-prof-a'] : ['org-a']), t: ['¿Dónde está?', 'Where is it?', 'On està?'], d: ['Encuentra cada órgano dentro del cuerpo.', 'Find each organ inside the body.', 'Troba cada òrgan dins del cos.'] },
  { id: 'funciones', from: 1, usesRegion: true, plates: () => [], t: ['¿Para qué sirve?', 'What does it do?', 'Per a què serveix?'], d: ['Cada órgano y su trabajo.', 'Each organ and its job.', 'Cada òrgan i el seu treball.'] },
  { id: 'sentidos', from: 1, usesRegion: false, plates: SENSE_PLATES, t: ['Los sentidos', 'The senses', 'Els sentits'], d: ['Vista, oído, olfato, gusto y tacto.', 'Sight, hearing, smell, taste and touch.', 'Vista, oïda, olfacte, gust i tacte.'] },
  { id: 'sistemas', from: 2, usesRegion: false, plates: () => ['org-a', 'org-prof-a'], t: ['Aparatos y sistemas', 'Body systems', 'Aparells i sistemes'], d: ['¿A qué aparato pertenece cada órgano?', 'Which system does each organ belong to?', 'A quin aparell pertany cada òrgan?'] },
  { id: 'siluetas', from: 2, usesRegion: true, plates: () => ['org-a'], t: ['Siluetas', 'Silhouettes', 'Siluetes'], d: ['Reconoce el órgano solo por su forma.', 'Recognise the organ just by its shape.', "Reconeix l'òrgan només per la seua forma."] },
  { id: 'dentro', from: 3, usesRegion: true, plates: (lv) => DENTRO.filter((p) => p.lv <= lv).map((p) => p.id), t: ['Por dentro', 'Inside', 'Per dins'], d: ['Corazón, encéfalo, pulmones, riñón… en detalle.', 'Heart, brain, lungs, kidney… in detail.', 'Cor, encèfal, pulmons, ronyó… en detall.'] },
  { id: 'reproduccion', from: 3, usesRegion: false, plates: REPRO_PLATES, t: ['Reproducción', 'Reproduction', 'Reproducció'], d: ['Aparatos reproductores, gametos y embarazo.', 'Reproductive systems, gametes and pregnancy.', 'Aparells reproductors, gàmetes i embaràs.'] },
  { id: 'organizacion', from: 4, usesRegion: false, plates: () => ['niveles', 'tejidos'], t: ['Células y tejidos', 'Cells and tissues', 'Cèl·lules i teixits'], d: ['Niveles de organización y tipos de tejidos.', 'Levels of organisation and types of tissue.', "Nivells d'organització i tipus de teixits."] },
  { id: 'hormonas', from: 5, usesRegion: false, plates: () => ['endocrino'], t: ['Glándulas y hormonas', 'Glands and hormones', 'Glàndules i hormones'], d: ['El sistema endocrino y sus mensajeros.', 'The endocrine system and its messengers.', 'El sistema endocrí i els seus missatgers.'] },
  { id: 'salud', from: 5, usesRegion: true, plates: () => [], t: ['Salud', 'Health', 'Salut'], d: ['Enfermedades frecuentes y cómo cuidarnos.', 'Common illnesses and how to stay healthy.', 'Malalties freqüents i com cuidar-nos.'] },
  { id: 'lenguaje', from: 6, usesRegion: false, plates: () => [], t: ['Lenguaje médico', 'Medical language', 'Llenguatge mèdic'], d: ['Raíces, planos y términos de posición.', 'Word roots, planes and directional terms.', 'Arrels, plans i termes de posició.'] },
];
export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export const gamesFor = (lv) => GAMES.filter((g) => g.from <= lv);

// Láminas que necesita un minijuego (o el examen) en un nivel.
export function platesFor(gameId, lv) {
  if (gameId === 'exam' || gameId === 'duel') return [...new Set(gamesFor(lv).flatMap((g) => g.plates(lv)))];
  return GAME_BY_ID[gameId]?.plates(lv) || [];
}

// Filtro por aparato o sistema ("¿Qué parte del cuerpo quieres explorar?").
const REGION_LIST = [
  { id: 'digestivo', from: 2 }, { id: 'respiratorio', from: 2 }, { id: 'circulatorio', from: 2 },
  { id: 'excretor', from: 2 }, { id: 'nervioso', from: 3 }, { id: 'sentidos', from: 3 },
  { id: 'endocrino', from: 5 }, { id: 'inmune', from: 5 },
];
export const regionsFor = (lv) => (lv >= 2 ? REGION_LIST.filter((r) => r.from <= lv).map((r) => r.id) : null);
