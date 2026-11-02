// Escenas 3D equivalentes a las láminas 2D (modo 3D de las apps del cuerpo).
// Una pregunta sobre la lámina `esq-p` se juega en la escena `esq` mirando desde
// detrás; una sobre `mano`, en la misma escena pero encuadrando la mano.
//
// scene: { layers (como Body3D), pick: capas que se tocan, only?: { capa: [claves] } }

export const SCENES = {
  cuerpo: { layers: { piel: 'solid' }, pick: ['piel'] },
  esq: { layers: { piel: 'ghost', esqueleto: 'solid' }, pick: ['esqueleto'] },
  mus: { layers: { piel: 'ghost', musculos: 'solid', 'musculos-prof': 'solid', esqueleto: 'solid' }, pick: ['musculos', 'musculos-prof'] },
  // capa profunda: sin los músculos de encima, pero con los de los grupos que se ven en las láminas
  // profundas (vastos, isquiotibiales, aductores, gemelos, sóleo…), que en 3D están en la capa superficial
  musProf: {
    layers: { piel: 'ghost', musculos: 'solid', 'musculos-prof': 'solid', esqueleto: 'solid' },
    only: {
      musculos: ['serrato', 'pronador-redondo', 'flexor-profundo', 'flexor-largo-pulgar', 'gluteo-medio', 'recto-femoral', 'vasto-lateral', 'vasto-medial', 'vasto-intermedio',
        'aductor-largo', 'pectineo', 'aductor-corto', 'aductor-mayor', 'gracil', 'tibial-anterior', 'peroneos', 'soleo', 'infraespinoso', 'redondo-mayor', 'triceps',
        'biceps-femoral', 'semitendinoso', 'semimembranoso', 'gemelo-interno', 'gemelo-externo', 'tendon-aquiles'],
    },
    pick: ['musculos', 'musculos-prof'],
  },
  org: { layers: { piel: 'ghost', organos: 'solid', esqueleto: 'ghost' }, pick: ['organos'] },
  // órganos profundos: sin hígado, estómago ni intestinos, con los grandes vasos del abdomen
  orgProf: {
    layers: { piel: 'ghost', organos: 'solid', vasos: 'solid', esqueleto: 'ghost' },
    only: {
      organos: ['cerebro', 'cerebelo', 'tronco-encefalico', 'laringe', 'tiroides', 'traquea', 'bronquios', 'esofago', 'corazon', 'bazo', 'pancreas', 'duodeno', 'rinones', 'suprarrenales', 'ureteres', 'vejiga', 'recto'],
      vasos: ['aorta', 'aorta-abdominal', 'vena-cava-inf', 'vena-cava-sup', 'arteria-renal', 'vena-renal', 'iliacas-a', 'iliacas-v'],
    },
    pick: ['organos', 'vasos'],
  },
  // el corazón por fuera con sus grandes vasos
  heart: {
    layers: { piel: 'ghost', organos: 'solid', vasos: 'solid', esqueleto: 'ghost' },
    only: { organos: ['corazon'], vasos: ['aorta', 'arteria-pulmonar', 'venas-pulmonares', 'vena-cava-sup', 'vena-cava-inf'] },
    pick: ['organos', 'vasos'],
  },
  vas: { layers: { piel: 'ghost', vasos: 'solid', organos: 'solid', esqueleto: 'ghost' }, only: { organos: ['corazon'] }, pick: ['vasos', 'organos'] },
  nerv: { layers: { piel: 'ghost', nervios: 'solid', organos: 'solid', esqueleto: 'ghost' }, only: { organos: ['cerebro', 'cerebelo', 'tronco-encefalico'] }, pick: ['nervios', 'organos'] },
};

// lámina → [escena, dirección de la cámara, lado que se encuadra (mano y pie: el derecho)]
export const PLATE_SCENE = {
  'cuerpo-a': ['cuerpo', 'front'], 'cuerpo-p': ['cuerpo', 'back'],
  'esq-a': ['esq', 'front'], 'esq-p': ['esq', 'back'], 'esq-l': ['esq', 'left'],
  'craneo-a': ['esq', 'front'], 'craneo-l': ['esq', 'left'], 'columna-l': ['esq', 'left'], 'torax-a': ['esq', 'front'],
  mano: ['esq', 'back', 'R'], pie: ['esq', 'top', 'R'],
  'mus-a': ['mus', 'front'], 'mus-p': ['mus', 'back'], 'mus-l': ['mus', 'left'],
  'mus-prof-a': ['musProf', 'front'], 'mus-prof-p': ['musProf', 'back'],
  'org-a': ['org', 'front'], 'org-prof-a': ['orgProf', 'front'], 'digestivo-a': ['org', 'front'], 'pulmones-a': ['org', 'front'],
  'corazon-ext': ['heart', 'front'], 'encefalo-l': ['org', 'left'], areas: ['org', 'left'],
  'vas-a': ['vas', 'front'], 'nerv-a': ['nerv', 'front'], 'nerv-p': ['nerv', 'back'],
};

// Direcciones de la cámara (desde dónde se mira). x = izquierda del sujeto, z = delante.
export const DIRS = {
  front: [0.08, 0.06, 1],
  back: [-0.08, 0.06, -1],
  left: [1, 0.08, 0.12],
  right: [-1, 0.08, 0.12],
  top: [0, 1, 0.35],
};

export const BODY_PLATES = new Set(['cuerpo-a', 'cuerpo-p', 'esq-a', 'esq-p', 'esq-l', 'mus-a', 'mus-p', 'mus-l', 'mus-prof-a', 'mus-prof-p', 'vas-a', 'nerv-a', 'nerv-p']);

export const sceneIdOf = (plateId) => `3d:${plateId}`;
export const plateOfScene = (id) => (typeof id === 'string' && id.startsWith('3d:') ? id.slice(3) : null);

// Movimientos que el esqueleto 3D sabe hacer (Huesos y Músculos en 3D, Move3D.jsx).
// joint: punto de referencia del modelo · axis · from/to en grados (signo: ver comentarios)
// x: flexión hacia delante = negativo · z: abducción del lado derecho = negativo
export const MOVES3D = {
  'flex-codo': { joint: 'elbowR', seg: 'forearm', axis: 'x', from: 0, to: -125, view: 'right' },
  'ext-codo': { joint: 'elbowR', seg: 'forearm', axis: 'x', from: -125, to: 0, view: 'right' },
  'flex-rodilla': { joint: 'kneeR', seg: 'leg', axis: 'x', from: 0, to: 110, view: 'right' },
  'ext-rodilla': { joint: 'kneeR', seg: 'leg', axis: 'x', from: 110, to: 0, view: 'right' },
  'abd-hombro': { joint: 'shoulderR', seg: 'arm', axis: 'z', from: 0, to: -90, view: 'front' },
  'add-hombro': { joint: 'shoulderR', seg: 'arm', axis: 'z', from: -90, to: 0, view: 'front' },
  'abd-cadera': { joint: 'hipR', seg: 'thigh', axis: 'z', from: 0, to: -40, view: 'front' },
  'add-cadera': { joint: 'hipR', seg: 'thigh', axis: 'z', from: -40, to: 0, view: 'front' },
  'flex-cadera': { joint: 'hipR', seg: 'thigh', axis: 'x', from: 0, to: -90, view: 'right' },
  'ext-cadera': { joint: 'hipR', seg: 'thigh', axis: 'x', from: 0, to: 25, view: 'right' },
  'flex-plantar': { joint: 'ankleR', seg: 'foot', axis: 'x', from: 0, to: 35, view: 'right' },
  'flex-dorsal': { joint: 'ankleR', seg: 'foot', axis: 'x', from: 0, to: -20, view: 'right' },
  'rot-cabeza': { joint: 'neck', seg: 'head', axis: 'y', from: 0, to: 65, view: 'front' },
};

