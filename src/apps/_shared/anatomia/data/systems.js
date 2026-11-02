// Aparatos y sistemas del cuerpo humano (grupos del catálogo de estructuras).
// n = [castellano, inglés, valenciano]; g = género en castellano y valenciano
// para el artículo (m, f, mp, fp). color/deep = tono de la lámina y de la UI.

export const SYSTEMS = [
  { id: 'ext', n: ['Partes del cuerpo', 'Parts of the body', 'Parts del cos'], color: '#38bdf8', deep: '#0369a1', icon: 'cuerpo' },
  { id: 'sentidos', n: ['Órganos de los sentidos', 'Sense organs', 'Òrgans dels sentits'], color: '#a78bfa', deep: '#6d28d9', icon: 'ojo' },
  { id: 'oseo', n: ['Sistema óseo', 'Skeletal system', 'Sistema ossi'], color: '#f5e6c8', deep: '#a8875a', icon: 'femur' },
  { id: 'articular', n: ['Articulaciones', 'Joints', 'Articulacions'], color: '#7dd3fc', deep: '#0284c7', icon: 'rodilla' },
  { id: 'muscular', n: ['Sistema muscular', 'Muscular system', 'Sistema muscular'], color: '#f87171', deep: '#b91c1c', icon: 'biceps' },
  { id: 'nervioso', n: ['Sistema nervioso', 'Nervous system', 'Sistema nerviós'], color: '#facc15', deep: '#a16207', icon: 'cerebro' },
  { id: 'digestivo', n: ['Aparato digestivo', 'Digestive system', 'Aparell digestiu'], color: '#fb923c', deep: '#c2410c', icon: 'estomago' },
  { id: 'respiratorio', n: ['Aparato respiratorio', 'Respiratory system', 'Aparell respiratori'], color: '#f9a8d4', deep: '#be185d', icon: 'pulmones' },
  { id: 'circulatorio', n: ['Aparato circulatorio', 'Circulatory system', 'Aparell circulatori'], color: '#ef4444', deep: '#991b1b', icon: 'corazon' },
  { id: 'excretor', n: ['Aparato excretor', 'Excretory system', 'Aparell excretor'], color: '#facc15', deep: '#854d0e', icon: 'rinones' },
  { id: 'endocrino', n: ['Sistema endocrino', 'Endocrine system', 'Sistema endocrí'], color: '#c084fc', deep: '#7e22ce', icon: 'tiroides' },
  { id: 'inmune', n: ['Sistema linfático e inmunitario', 'Lymphatic and immune system', 'Sistema limfàtic i immunitari'], color: '#4ade80', deep: '#15803d', icon: 'ganglios' },
  { id: 'reproductor', n: ['Aparato reproductor', 'Reproductive system', 'Aparell reproductor'], color: '#fb7185', deep: '#be123c', icon: 'utero' },
  { id: 'organizacion', n: ['Organización del cuerpo', 'Body organisation', 'Organització del cos'], color: '#2dd4bf', deep: '#0f766e', icon: 'celula' },
];

export const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map((s) => [s.id, s]));

// Grupos de las partes externas (cabeza, tronco y extremidades).
export const EXT_GROUPS = [
  { id: 'cabeza', n: ['Cabeza', 'Head', 'Cap'] },
  { id: 'tronco', n: ['Tronco', 'Trunk', 'Tronc'] },
  { id: 'ext-sup', n: ['Extremidades superiores', 'Upper limbs', 'Extremitats superiors'] },
  { id: 'ext-inf', n: ['Extremidades inferiores', 'Lower limbs', 'Extremitats inferiors'] },
];

export const LANGS = ['es', 'en', 'va'];
export const LANG_INDEX = { es: 0, en: 1, va: 2 };
