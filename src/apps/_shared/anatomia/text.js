// Textos del cuerpo humano en castellano (es), inglés (en) y valenciano (va):
// nombres con artículo, función, dato curioso y plantillas de preguntas.
// Las funciones, datos y acciones traducidos están en i18n/en.js e i18n/va.js
// (si falta una traducción, esa pregunta no se hace en ese idioma).
import { BY_KEY } from './data/structures';
import { SYSTEM_BY_ID, EXT_GROUPS, LANG_INDEX } from './data/systems';
import EN from './i18n/en';
import VA from './i18n/va';

const TR = { en: EN, va: VA };
const EXT = Object.fromEntries(EXT_GROUPS.map((g) => [g.id, g]));

// Idioma activo (lo fija la configuración localizada de cada app).
let current = 'es';
export const setLang = (l) => { current = l === 'en' || l === 'va' ? l : 'es'; };
export const getLang = () => current;
const L = (lang) => lang || current;
const idx = (lang) => LANG_INDEX[L(lang)] ?? 0;

const PROPER_EN = /^(Eustachian|Meissner|Pacinian|Broca|Wernicke|Bowman|Fallopian|Achilles|Langerhans)/;
const lowerFirst = (s, lang) => {
  if (!s) return s;
  if (lang === 'en' && PROPER_EN.test(s)) return s;
  return s[0].toLowerCase() + s.slice(1);
};
export const upperFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function nameOf(key, lang) {
  const s = BY_KEY[key];
  if (!s) return SYSTEM_BY_ID[key]?.n[idx(lang)] ?? EXT[key]?.n[idx(lang)] ?? key;
  return s.n[idx(lang)] || s.n[0];
}

// Nombre internacional (desde ESO), si es distinto del habitual.
export function sciOf(key, lang) {
  const s = BY_KEY[key];
  return s?.sci ? s.sci[idx(lang)] || s.sci[0] : null;
}

export const genderOf = (key, lang) => {
  const s = BY_KEY[key];
  if (!s) return 'm';
  return L(lang) === 'va' ? (s.gv || s.g || 'm') : (s.g || 'm');
};
export const isPlural = (key, lang) => genderOf(key, lang).endsWith('p');

// "el corazón" · "the heart" · "el cor" / "l'estómac" / "la uretra"
export function withArt(key, lang) {
  const l = L(lang);
  const n = lowerFirst(nameOf(key, l), l);
  if (l === 'en') return `the ${n}`;
  const g = genderOf(key, l);
  if (l === 'es') return `${{ m: 'el', f: 'la', mp: 'los', fp: 'las' }[g]} ${n}`;
  if (g === 'mp') return `els ${n}`;
  if (g === 'fp') return `les ${n}`;
  if (g === 'm') return /^h?[aeiouàèéíòóú]/i.test(n) ? `l'${n}` : `el ${n}`;
  return /^h?[aeoàèéòóíú]/i.test(n) ? `l'${n}` : `la ${n}`;
}

// "del corazón" · "of the heart" · "del cor" / "de l'estómac"
export function ofArt(key, lang) {
  const l = L(lang);
  const a = withArt(key, l);
  if (l === 'en') return `of ${a}`;
  if (l === 'es') return a.startsWith('el ') ? `del ${a.slice(3)}` : `de ${a}`;
  if (a.startsWith('el ')) return `del ${a.slice(3)}`;
  if (a.startsWith('els ')) return `dels ${a.slice(4)}`;
  return `de ${a}`;
}

const pick = (key, field, lang) => {
  const l = L(lang);
  if (l === 'es') return BY_KEY[key]?.[field] || null;
  return TR[l]?.[key]?.[field] || null;
};
export const funcOf = (key, lang) => pick(key, 'p', lang);
export const factOf = (key, lang) => pick(key, 'f', lang);
export const actOf = (key, lang) => pick(key, 'act', lang);

// Tipo de estructura: [singular, plural] y género en valenciano (para "quin/quina").
const KIND = {
  es: { org: ['órgano', 'órganos'], hue: ['hueso', 'huesos'], mus: ['músculo', 'músculos'], gla: ['glándula', 'glándulas'], vas: ['vaso sanguíneo', 'vasos sanguíneos'], lin: ['vaso linfático', 'vasos linfáticos'], ner: ['nervio', 'nervios'], par: ['parte', 'partes'], reg: ['parte del cuerpo', 'partes del cuerpo'], cel: ['célula', 'células'], tej: ['tejido', 'tejidos'], niv: ['nivel', 'niveles'] },
  en: { org: ['organ', 'organs'], hue: ['bone', 'bones'], mus: ['muscle', 'muscles'], gla: ['gland', 'glands'], vas: ['blood vessel', 'blood vessels'], lin: ['lymphatic vessel', 'lymphatic vessels'], ner: ['nerve', 'nerves'], par: ['part', 'parts'], reg: ['body part', 'body parts'], cel: ['cell', 'cells'], tej: ['tissue', 'tissues'], niv: ['level', 'levels'] },
  va: { org: ['òrgan', 'òrgans'], hue: ['os', 'ossos'], mus: ['múscul', 'músculs'], gla: ['glàndula', 'glàndules'], vas: ['vas sanguini', 'vasos sanguinis'], lin: ['vas limfàtic', 'vasos limfàtics'], ner: ['nervi', 'nervis'], par: ['part', 'parts'], reg: ['part del cos', 'parts del cos'], cel: ['cèl·lula', 'cèl·lules'], tej: ['teixit', 'teixits'], niv: ['nivell', 'nivells'] },
};
const KIND_FEM_VA = new Set(['gla', 'par', 'reg', 'cel']);

export function kindOf(key, lang) {
  const l = L(lang);
  const s = BY_KEY[key];
  const t = s?.t || 'org';
  const pl = isPlural(key, 'es');
  return KIND[l][t]?.[pl ? 1 : 0] || KIND[l].org[pl ? 1 : 0];
}

// "¿Qué órgano …?" · "Which organ …?" · "Quin òrgan …?" / "Quina glàndula …?"
export function whichKind(key, lang) {
  const l = L(lang);
  const k = kindOf(key, l);
  if (l === 'es') return `¿Qué ${k}`;
  if (l === 'en') return `Which ${k}`;
  const t = BY_KEY[key]?.t || 'org';
  const pl = isPlural(key, 'es');
  const q = KIND_FEM_VA.has(t) ? (pl ? 'Quines' : 'Quina') : (pl ? 'Quins' : 'Quin');
  return `${q} ${k}`;
}

export const systemName = (id, lang) => SYSTEM_BY_ID[id]?.n[idx(lang)] ?? EXT[id]?.n[idx(lang)] ?? id;

// "del aparato digestivo" · "of the digestive system" · "de l'aparell digestiu"
export function ofSystem(id, lang) {
  const l = L(lang);
  const n = lowerFirst(systemName(id, l), l);
  if (l === 'en') return `of the ${n}`;
  if (l === 'es') {
    if (/^(órganos)/.test(n)) return `de los ${n}`;
    if (/^(partes|articulaciones)/.test(n)) return `de las ${n}`;
    if (/^organización/.test(n)) return `de la ${n}`;
    return `del ${n}`;
  }
  if (/^òrgans/.test(n)) return `dels ${n}`;
  if (/^(parts|articulacions)/.test(n)) return `de les ${n}`;
  if (/^organització/.test(n)) return `de l'${n}`;
  return /^[aeiouàèéòó]/.test(n) ? `de l'${n}` : `del ${n}`;
}

// Textos de la interfaz propios del cuerpo humano.
export const UI = {
  es: {
    tap: (key) => `Toca ${withArt(key, 'es')}`,
    tapAny: (of) => `Toca cualquier parte ${of}`,
    tapAnyOrgan: (of) => `Toca cualquier órgano ${of}`,
    whatIs: '¿Qué es la parte iluminada?',
    whatShape: '¿De qué órgano es esta silueta?',
    whichSystem: (key) => `¿De qué aparato o sistema ${isPlural(key, 'es') ? 'forman' : 'forma'} parte ${withArt(key, 'es')}?`,
    whatFunction: (key) => `¿Qué función ${isPlural(key, 'es') ? 'tienen' : 'tiene'} ${withArt(key, 'es')}?`,
    whichDoes: (key, pred) => `${whichKind(key, 'es')} ${pred}?`,
    whereIn: (plateTitle) => `En ${plateTitle}`,
    hint: (key) => `Pista: ${systemName(BY_KEY[key]?.s, 'es')}`,
    order: 'Ordena los pasos tocándolos uno tras otro',
  },
  en: {
    tap: (key) => `Tap ${withArt(key, 'en')}`,
    tapAny: (of) => `Tap any part ${of}`,
    tapAnyOrgan: (of) => `Tap any organ ${of}`,
    whatIs: 'What is the highlighted part?',
    whatShape: 'Which organ has this shape?',
    whichSystem: (key) => `Which body system ${isPlural(key, 'en') ? 'are' : 'is'} ${withArt(key, 'en')} part of?`,
    whatFunction: (key) => `What ${isPlural(key, 'en') ? 'do' : 'does'} ${withArt(key, 'en')} do?`,
    whichDoes: (key, pred) => `${whichKind(key, 'en')} ${pred}?`,
    whereIn: (plateTitle) => `In ${plateTitle}`,
    hint: (key) => `Hint: ${systemName(BY_KEY[key]?.s, 'en')}`,
    order: 'Put the steps in order by tapping them one after another',
  },
  va: {
    tap: (key) => `Toca ${withArt(key, 'va')}`,
    tapAny: (of) => `Toca qualsevol part ${of}`,
    tapAnyOrgan: (of) => `Toca qualsevol òrgan ${of}`,
    whatIs: 'Què és la part il·luminada?',
    whatShape: "De quin òrgan és aquesta silueta?",
    whichSystem: (key) => `De quin aparell o sistema ${isPlural(key, 'va') ? 'formen' : 'forma'} part ${withArt(key, 'va')}?`,
    whatFunction: (key) => `Quina funció ${isPlural(key, 'va') ? 'tenen' : 'té'} ${withArt(key, 'va')}?`,
    whichDoes: (key, pred) => `${whichKind(key, 'va')} ${pred}?`,
    whereIn: (plateTitle) => `En ${plateTitle}`,
    hint: (key) => `Pista: ${systemName(BY_KEY[key]?.s, 'va')}`,
    order: "Ordena els passos tocant-los un darrere l'altre",
  },
};
export const ui = (lang) => UI[L(lang)];
