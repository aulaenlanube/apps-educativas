// Láminas del cuerpo humano (las genera tools/build-anatomy.mjs en
// public/data/anatomia/<id>.json + public/images/anatomia/<id>.webp).
// t = título [es, en, va] · cat = sección del atlas · pair = la otra vista
// (anterior/posterior) · lv = nivel desde el que aparece en el atlas.

export const PLATE_CATS = [
  { id: 'cuerpo', n: ['Cuerpo entero', 'Whole body', 'Cos sencer'] },
  { id: 'detalle', n: ['Huesos en detalle', 'Bones in detail', 'Ossos en detall'] },
  { id: 'organos', n: ['Órganos de cerca', 'Organs up close', 'Òrgans de prop'] },
  { id: 'dentro', n: ['Por dentro', 'Inside', 'Per dins'] },
  { id: 'esquemas', n: ['Esquemas', 'Diagrams', 'Esquemes'] },
];

export const PLATES = [
  // cuerpo entero (vista anterior / posterior)
  { id: 'cuerpo-a', cat: 'cuerpo', pair: 'cuerpo-p', lv: 1, t: ['Exterior del cuerpo', 'Outside of the body', 'Exterior del cos'] },
  { id: 'cuerpo-p', cat: 'cuerpo', pair: 'cuerpo-a', lv: 1, t: ['Exterior del cuerpo', 'Outside of the body', 'Exterior del cos'] },
  { id: 'esq-a', cat: 'cuerpo', pair: 'esq-p', lv: 1, t: ['Esqueleto', 'Skeleton', 'Esquelet'] },
  { id: 'esq-p', cat: 'cuerpo', pair: 'esq-a', lv: 1, t: ['Esqueleto', 'Skeleton', 'Esquelet'] },
  { id: 'mus-a', cat: 'cuerpo', pair: 'mus-p', lv: 2, t: ['Músculos', 'Muscles', 'Músculs'] },
  { id: 'mus-p', cat: 'cuerpo', pair: 'mus-a', lv: 2, t: ['Músculos', 'Muscles', 'Músculs'] },
  { id: 'org-a', cat: 'cuerpo', lv: 1, t: ['Órganos', 'Organs', 'Òrgans'] },
  { id: 'org-prof-a', cat: 'cuerpo', lv: 2, t: ['Órganos profundos', 'Deep organs', 'Òrgans profunds'] },
  { id: 'vas-a', cat: 'cuerpo', lv: 2, t: ['Vasos sanguíneos', 'Blood vessels', 'Vasos sanguinis'] },
  { id: 'nerv-a', cat: 'cuerpo', pair: 'nerv-p', lv: 2, t: ['Sistema nervioso', 'Nervous system', 'Sistema nerviós'] },
  { id: 'nerv-p', cat: 'cuerpo', pair: 'nerv-a', lv: 2, t: ['Sistema nervioso', 'Nervous system', 'Sistema nerviós'] },
  // huesos en detalle
  { id: 'craneo-a', cat: 'detalle', pair: 'craneo-l', lv: 4, t: ['Cráneo', 'Skull', 'Crani'] },
  { id: 'craneo-l', cat: 'detalle', pair: 'craneo-a', lv: 4, t: ['Cráneo', 'Skull', 'Crani'] },
  { id: 'columna-l', cat: 'detalle', lv: 4, t: ['Columna vertebral', 'Spine', 'Columna vertebral'] },
  { id: 'torax-a', cat: 'detalle', lv: 5, t: ['Tórax', 'Rib cage', 'Tòrax'] },
  { id: 'mano', cat: 'detalle', lv: 5, t: ['Huesos de la mano', 'Bones of the hand', 'Ossos de la mà'] },
  { id: 'pie', cat: 'detalle', lv: 5, t: ['Huesos del pie', 'Bones of the foot', 'Ossos del peu'] },
  { id: 'hueso-largo', cat: 'detalle', lv: 4, t: ['El hueso por dentro', 'Inside a bone', "L'os per dins"] },
  { id: 'articulacion', cat: 'detalle', lv: 4, t: ['Articulación de la rodilla', 'Knee joint', 'Articulació del genoll'] },
  { id: 'musculos-tipo', cat: 'detalle', lv: 5, t: ['Tipos de músculo', 'Types of muscle', 'Tipus de múscul'] },
  // órganos de cerca
  { id: 'cara', cat: 'organos', lv: 1, t: ['La cara', 'The face', 'La cara'] },
  { id: 'encefalo-l', cat: 'organos', pair: 'encefalo-s', lv: 3, t: ['Encéfalo', 'Brain', 'Encèfal'] },
  { id: 'encefalo-s', cat: 'organos', pair: 'encefalo-l', lv: 5, t: ['Encéfalo en corte', 'Brain section', 'Encèfal en tall'] },
  { id: 'areas', cat: 'organos', lv: 6, t: ['Áreas del cerebro', 'Brain areas', 'Àrees del cervell'] },
  { id: 'corazon-ext', cat: 'organos', pair: 'corazon', lv: 3, t: ['Corazón', 'Heart', 'Cor'] },
  { id: 'pulmones-a', cat: 'organos', pair: 'bronquios-a', lv: 3, t: ['Pulmones', 'Lungs', 'Pulmons'] },
  { id: 'bronquios-a', cat: 'organos', pair: 'pulmones-a', lv: 3, t: ['Árbol bronquial', 'Bronchial tree', 'Arbre bronquial'] },
  { id: 'digestivo-a', cat: 'organos', lv: 2, t: ['Aparato digestivo', 'Digestive system', 'Aparell digestiu'] },
  { id: 'cabeza-s', cat: 'organos', lv: 3, t: ['Boca, nariz y garganta', 'Mouth, nose and throat', 'Boca, nas i gola'] },
  { id: 'dentadura', cat: 'organos', lv: 3, t: ['Dentadura', 'Teeth', 'Dentadura'] },
  { id: 'endocrino', cat: 'organos', lv: 4, t: ['Glándulas endocrinas', 'Endocrine glands', 'Glàndules endocrines'] },
  { id: 'linfatico', cat: 'organos', lv: 5, t: ['Sistema linfático', 'Lymphatic system', 'Sistema limfàtic'] },
  { id: 'rep-m', cat: 'organos', pair: 'rep-f', lv: 3, t: ['Aparato reproductor masculino', 'Male reproductive system', 'Aparell reproductor masculí'] },
  { id: 'rep-f', cat: 'organos', pair: 'rep-m', lv: 3, t: ['Aparato reproductor femenino', 'Female reproductive system', 'Aparell reproductor femení'] },
  // por dentro (cortes)
  { id: 'ojo', cat: 'dentro', lv: 3, t: ['El ojo por dentro', 'Inside the eye', "L'ull per dins"] },
  { id: 'oido', cat: 'dentro', lv: 3, t: ['El oído por dentro', 'Inside the ear', "L'orella per dins"] },
  { id: 'piel', cat: 'dentro', lv: 3, t: ['La piel por dentro', 'Inside the skin', 'La pell per dins'] },
  { id: 'lengua', cat: 'dentro', lv: 5, t: ['La lengua', 'The tongue', 'La llengua'] },
  { id: 'diente', cat: 'dentro', lv: 4, t: ['El diente por dentro', 'Inside a tooth', 'La dent per dins'] },
  { id: 'corazon', cat: 'dentro', pair: 'corazon-ext', lv: 4, t: ['El corazón por dentro', 'Inside the heart', 'El cor per dins'] },
  { id: 'alveolo', cat: 'dentro', lv: 3, t: ['Alvéolos pulmonares', 'Alveoli', 'Alvèols pulmonars'] },
  { id: 'vellosidad', cat: 'dentro', lv: 5, t: ['Vellosidades intestinales', 'Intestinal villi', 'Vellositats intestinals'] },
  { id: 'rinon', cat: 'dentro', lv: 5, t: ['El riñón por dentro', 'Inside the kidney', 'El ronyó per dins'] },
  { id: 'nefrona', cat: 'dentro', lv: 5, t: ['La nefrona', 'The nephron', 'La nefrona'] },
  { id: 'neurona', cat: 'dentro', lv: 4, t: ['La neurona', 'The neuron', 'La neurona'] },
  { id: 'sangre', cat: 'dentro', lv: 3, t: ['La sangre al microscopio', 'Blood under the microscope', 'La sang al microscopi'] },
  { id: 'gametos', cat: 'dentro', lv: 4, t: ['Óvulo y espermatozoide', 'Egg and sperm', 'Òvul i espermatozou'] },
  { id: 'embarazo', cat: 'dentro', lv: 4, t: ['El embarazo', 'Pregnancy', "L'embaràs"] },
  // esquemas
  { id: 'circulacion', cat: 'esquemas', lv: 4, t: ['La doble circulación', 'Double circulation', 'La doble circulació'] },
  { id: 'arco-reflejo', cat: 'esquemas', lv: 4, t: ['El acto reflejo', 'The reflex arc', "L'acte reflex"] },
  { id: 'niveles', cat: 'esquemas', lv: 4, t: ['Niveles de organización', 'Levels of organisation', "Nivells d'organització"] },
  { id: 'tejidos', cat: 'esquemas', lv: 4, t: ['Tejidos', 'Tissues', 'Teixits'] },
];

export const PLATE_BY_ID = Object.fromEntries(PLATES.map((p) => [p.id, p]));
export const VIEW_LABEL = {
  anterior: ['De frente', 'Front', 'Davant'],
  posterior: ['De espaldas', 'Back', 'Darrere'],
  'lateral-i': ['De lado', 'Side', 'De costat'],
  'lateral-d': ['En corte', 'Section', 'En tall'],
  superior: ['Desde arriba', 'From above', 'Des de dalt'],
};
