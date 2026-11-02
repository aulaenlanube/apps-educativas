// Contenido propio de Huesos y Músculos (aparato locomotor). Textos [es, en, va].

// Zona del cuerpo de cada hueso y músculo (filtro "¿Qué zona quieres trabajar?").
const Z = (zone, keys) => Object.fromEntries(keys.map((k) => [k, zone]));
export const ZONE = {
  ...Z('cabeza', ['craneo', 'mandibula', 'hioides', 'frontal', 'parietal', 'temporal', 'occipital', 'esfenoides', 'etmoides', 'nasal', 'cigomatico', 'maxilar', 'lagrimal', 'vomer',
    'frontal-m', 'orbicular-ojos', 'orbicular-labios', 'masetero', 'temporal-m', 'esternocleidomastoideo', 'atlas', 'axis', 'cervicales',
    'escalenos', 'esplenio', 'semiespinoso']),
  ...Z('tronco', ['columna', 'sacro', 'coxis', 'costillas', 'esternon', 'dorsales', 'lumbares', 'discos', 'costillas-verdaderas', 'costillas-falsas', 'costillas-flotantes', 'cartilagos-costales', 'manubrio', 'cuerpo-esternon', 'xifoides',
    'trapecio', 'pectoral', 'serrato', 'recto-abdominal', 'oblicuo', 'dorsal-ancho', 'intercostales', 'erectores', 'romboides', 'diafragma',
    'elevador-escapula', 'pectoral-menor', 'iliocostal', 'longisimo', 'espinoso']),
  ...Z('ext-sup', ['clavicula', 'escapula', 'humero', 'radio', 'cubito', 'carpo', 'metacarpo', 'falanges-mano', 'escafoides', 'semilunar', 'piramidal', 'pisiforme', 'trapecio-hueso', 'trapezoide', 'grande', 'ganchoso', 'metacarpianos', 'falanges-proximales', 'falanges-medias', 'falanges-distales',
    'deltoides', 'biceps', 'triceps', 'braquiorradial', 'flexores-antebrazo', 'extensores-antebrazo', 'infraespinoso', 'redondo-mayor',
    'acromion', 'cavidad-glenoidea', 'manguito-rotador', 'supraespinoso', 'subescapular', 'redondo-menor', 'coracobraquial', 'braquial', 'pronador-redondo', 'supinador', 'flexor-profundo', 'flexor-largo-pulgar', 'pronador-cuadrado']),
  ...Z('ext-inf', ['coxal', 'femur', 'rotula', 'tibia', 'perone', 'tarso', 'metatarso', 'falanges-pie', 'astragalo', 'calcaneo', 'navicular', 'cuboides', 'cunas', 'metatarsianos', 'falanges-pie-d',
    'gluteo-mayor', 'gluteo-medio', 'iliopsoas', 'tensor-fascia', 'sartorio', 'cuadriceps', 'isquiotibiales', 'aductores', 'gemelos', 'soleo', 'tibial-anterior', 'peroneos', 'tendon-aquiles',
    'psoas-mayor', 'iliaco', 'gluteo-menor', 'piriforme', 'recto-femoral', 'vasto-lateral', 'vasto-medial', 'vasto-intermedio', 'biceps-femoral', 'semitendinoso', 'semimembranoso',
    'aductor-mayor', 'aductor-largo', 'aductor-corto', 'pectineo', 'gracil', 'gemelo-interno', 'gemelo-externo', 'popliteo', 'tibial-posterior', 'flexor-largo-dedos', 'flexor-largo-dedo-gordo', 'extensor-largo-dedos']),
};
export const ZONES = ['cabeza', 'tronco', 'ext-sup', 'ext-inf'];

export const BONE_TYPES = {
  largo: { n: ['Hueso largo', 'Long bone', 'Os llarg'], d: ['más largo que ancho, como el fémur', 'longer than it is wide, like the femur', 'més llarg que ample, com el fèmur'] },
  corto: { n: ['Hueso corto', 'Short bone', 'Os curt'], d: ['pequeño y con forma de cubo, como los del carpo', 'small and cube-shaped, like the wrist bones', 'menut i amb forma de cub, com els del carp'] },
  plano: { n: ['Hueso plano', 'Flat bone', 'Os pla'], d: ['fino y ancho, protege órganos, como el cráneo', 'thin and wide, protects organs, like the skull', 'prim i ample, protegix òrgans, com el crani'] },
  irregular: { n: ['Hueso irregular', 'Irregular bone', 'Os irregular'], d: ['de forma complicada, como las vértebras', 'with a complex shape, like the vertebrae', 'de forma complicada, com les vèrtebres'] },
  sesamoideo: { n: ['Hueso sesamoideo', 'Sesamoid bone', 'Os sesamoide'], d: ['dentro de un tendón, como la rótula', 'inside a tendon, like the kneecap', 'dins d\'un tendó, com la ròtula'] },
};

// Tipos de articulación. ex: ejemplos [es, en, va]
export const JOINT_TYPES = [
  { id: 'sinartrosis', n: ['Inmóvil (sinartrosis)', 'Immovable (synarthrosis)', 'Immòbil (sinartrosi)'], short: ['Inmóvil', 'Immovable', 'Immòbil'], ex: [['Suturas del cráneo', 'Skull sutures', 'Sutures del crani'], ['Unión de los dientes con el maxilar', 'Teeth in their sockets', 'Unió de les dents amb el maxil·lar']] },
  { id: 'anfiartrosis', n: ['Semimóvil (anfiartrosis)', 'Slightly movable (amphiarthrosis)', 'Semimòbil (amfiartrosi)'], short: ['Semimóvil', 'Slightly movable', 'Semimòbil'], ex: [['Entre dos vértebras', 'Between two vertebrae', 'Entre dues vèrtebres'], ['Sínfisis del pubis', 'Pubic symphysis', 'Símfisi del pubis'], ['Costillas con el esternón', 'Ribs and sternum', 'Costelles amb l\'estèrnum']] },
  { id: 'diartrosis', n: ['Móvil (diartrosis)', 'Freely movable (diarthrosis)', 'Mòbil (diartrosi)'], short: ['Móvil', 'Freely movable', 'Mòbil'], ex: [['Rodilla', 'Knee', 'Genoll'], ['Codo', 'Elbow', 'Colze'], ['Hombro', 'Shoulder', 'Espatla'], ['Cadera', 'Hip', 'Maluc'], ['Tobillo', 'Ankle', 'Turmell'], ['Muñeca', 'Wrist', 'Canell']] },
];
// Bachillerato: tipos de diartrosis
export const DIARTHROSES = [
  { id: 'enartrosis', n: ['Enartrosis (esférica)', 'Ball and socket', 'Enartrosi (esfèrica)'], ex: [['Hombro', 'Shoulder', 'Espatla'], ['Cadera', 'Hip', 'Maluc']], d: ['se mueve en todas las direcciones', 'moves in every direction', 'es mou en totes les direccions'] },
  { id: 'troclear', n: ['Troclear (bisagra)', 'Hinge', 'Troclear (frontissa)'], ex: [['Codo', 'Elbow', 'Colze'], ['Rodilla', 'Knee', 'Genoll'], ['Entre las falanges', 'Between finger bones', 'Entre les falanges']], d: ['solo se dobla y se estira, como una puerta', 'only bends and straightens, like a door', 'només es doblega i s\'estira, com una porta'] },
  { id: 'trocoide', n: ['Trocoide (pivote)', 'Pivot', 'Trocoide (pivot)'], ex: [['Atlas y axis (girar la cabeza)', 'Atlas and axis (turning the head)', 'Atles i axis (girar el cap)'], ['Radio y cúbito junto al codo', 'Radius and ulna near the elbow', 'Radi i cúbit prop del colze']], d: ['un hueso gira sobre otro', 'one bone rotates around another', 'un os gira sobre un altre'] },
  { id: 'condilea', n: ['Condílea', 'Condyloid', 'Condília'], ex: [['Muñeca', 'Wrist', 'Canell']], d: ['se mueve en dos direcciones', 'moves in two directions', 'es mou en dues direccions'] },
  { id: 'silla', n: ['En silla de montar', 'Saddle', 'En sella de muntar'], ex: [['Base del pulgar', 'Base of the thumb', 'Base del polze']], d: ['permite oponer el pulgar', 'lets the thumb oppose the fingers', 'permet oposar el polze'] },
  { id: 'artrodia', n: ['Artrodia (plana)', 'Plane (gliding)', 'Artròdia (plana)'], ex: [['Entre los huesos del carpo', 'Between the wrist bones', 'Entre els ossos del carp']], d: ['las superficies solo se deslizan', 'the surfaces just slide', 'les superfícies només llisquen'] },
];

// Movimientos (la figura animada los hace). fig: animación de components/MovementFigure.jsx
// mus: músculo principal (agonista) · plane: plano en que se hace (Bachillerato)
export const MOVES = [
  { id: 'flex-codo', fig: 'flex-codo', kind: 'flexion', mus: 'biceps', plane: 'sagital', n: ['Flexión del codo', 'Elbow flexion', 'Flexió del colze'] },
  { id: 'ext-codo', fig: 'ext-codo', kind: 'extension', mus: 'triceps', plane: 'sagital', n: ['Extensión del codo', 'Elbow extension', 'Extensió del colze'] },
  { id: 'flex-rodilla', fig: 'flex-rodilla', kind: 'flexion', mus: 'isquiotibiales', plane: 'sagital', n: ['Flexión de la rodilla', 'Knee flexion', 'Flexió del genoll'] },
  { id: 'ext-rodilla', fig: 'ext-rodilla', kind: 'extension', mus: 'cuadriceps', plane: 'sagital', n: ['Extensión de la rodilla', 'Knee extension', 'Extensió del genoll'] },
  { id: 'abd-hombro', fig: 'abd-hombro', kind: 'abduccion', mus: 'deltoides', plane: 'frontal', n: ['Abducción del hombro', 'Shoulder abduction', "Abducció de l'espatla"] },
  { id: 'add-hombro', fig: 'add-hombro', kind: 'aduccion', mus: 'dorsal-ancho', plane: 'frontal', n: ['Aducción del hombro', 'Shoulder adduction', "Adducció de l'espatla"] },
  { id: 'abd-cadera', fig: 'abd-cadera', kind: 'abduccion', mus: 'gluteo-medio', plane: 'frontal', n: ['Abducción de la cadera', 'Hip abduction', 'Abducció del maluc'] },
  { id: 'add-cadera', fig: 'add-cadera', kind: 'aduccion', mus: 'aductores', plane: 'frontal', n: ['Aducción de la cadera', 'Hip adduction', 'Adducció del maluc'] },
  { id: 'flex-cadera', fig: 'flex-cadera', kind: 'flexion', mus: 'iliopsoas', plane: 'sagital', n: ['Flexión de la cadera', 'Hip flexion', 'Flexió del maluc'] },
  { id: 'ext-cadera', fig: 'ext-cadera', kind: 'extension', mus: 'gluteo-mayor', plane: 'sagital', n: ['Extensión de la cadera', 'Hip extension', 'Extensió del maluc'] },
  { id: 'flex-tronco', fig: 'flex-tronco', kind: 'flexion', mus: 'recto-abdominal', plane: 'sagital', n: ['Flexión del tronco', 'Trunk flexion', 'Flexió del tronc'] },
  { id: 'flex-plantar', fig: 'flex-plantar', kind: 'flexion-plantar', mus: 'gemelos', plane: 'sagital', n: ['Flexión plantar (de puntillas)', 'Plantar flexion (on tiptoe)', 'Flexió plantar (de puntetes)'] },
  { id: 'flex-dorsal', fig: 'flex-dorsal', kind: 'flexion-dorsal', mus: 'tibial-anterior', plane: 'sagital', n: ['Flexión dorsal del tobillo', 'Dorsiflexion of the ankle', 'Flexió dorsal del turmell'] },
  { id: 'rot-cabeza', fig: 'rot-cabeza', kind: 'rotacion', mus: 'esternocleidomastoideo', plane: 'transversal', n: ['Rotación de la cabeza', 'Head rotation', 'Rotació del cap'] },
  { id: 'circ-hombro', fig: 'circ-hombro', kind: 'circunduccion', mus: 'deltoides', plane: null, n: ['Circunducción del hombro', 'Shoulder circumduction', "Circumducció de l'espatla"], lv: 5 },
  { id: 'pronacion', fig: 'pronacion', kind: 'pronacion', mus: 'flexores-antebrazo', plane: 'transversal', n: ['Pronación (palma hacia abajo)', 'Pronation (palm down)', 'Pronació (palmell cap avall)'], lv: 5 },
  { id: 'supinacion', fig: 'supinacion', kind: 'supinacion', mus: 'biceps', plane: 'transversal', n: ['Supinación (palma hacia arriba)', 'Supination (palm up)', 'Supinació (palmell cap amunt)'], lv: 5 },
];
export const MOVE_KINDS = {
  flexion: ['Flexión', 'Flexion', 'Flexió'],
  extension: ['Extensión', 'Extension', 'Extensió'],
  abduccion: ['Abducción', 'Abduction', 'Abducció'],
  aduccion: ['Aducción', 'Adduction', 'Adducció'],
  rotacion: ['Rotación', 'Rotation', 'Rotació'],
  circunduccion: ['Circunducción', 'Circumduction', 'Circumducció'],
  pronacion: ['Pronación', 'Pronation', 'Pronació'],
  supinacion: ['Supinación', 'Supination', 'Supinació'],
  'flexion-plantar': ['Flexión plantar', 'Plantar flexion', 'Flexió plantar'],
  'flexion-dorsal': ['Flexión dorsal', 'Dorsiflexion', 'Flexió dorsal'],
};
export const MOVE_DEF = {
  flexion: ['dobla una articulación y acerca los huesos', 'bends a joint and brings the bones closer', 'doblega una articulació i acosta els ossos'],
  extension: ['estira una articulación y separa los huesos', 'straightens a joint', 'estira una articulació i separa els ossos'],
  abduccion: ['separa una parte del cuerpo del centro', 'moves a body part away from the midline', 'separa una part del cos del centre'],
  aduccion: ['acerca una parte del cuerpo al centro', 'moves a body part towards the midline', 'acosta una part del cos al centre'],
  rotacion: ['gira una parte del cuerpo sobre su eje', 'turns a body part around its own axis', 'gira una part del cos sobre el seu eix'],
  circunduccion: ['mueve una extremidad dibujando un cono', 'moves a limb in a cone shape', 'mou una extremitat dibuixant un con'],
};

// Ejercicios (Educación Física): músculos que más trabajan.
export const EXERCISES = [
  { id: 'sentadilla', n: ['Sentadilla', 'Squat', 'Esquat'], mus: ['cuadriceps', 'gluteo-mayor', 'isquiotibiales'] },
  { id: 'flexiones', n: ['Flexiones de brazos', 'Push-ups', 'Flexions de braços'], mus: ['pectoral', 'triceps', 'deltoides'] },
  { id: 'dominadas', n: ['Dominadas', 'Pull-ups', 'Dominades'], mus: ['dorsal-ancho', 'biceps'] },
  { id: 'abdominales', n: ['Abdominales (encogimientos)', 'Crunches', 'Abdominals (encongiments)'], mus: ['recto-abdominal'] },
  { id: 'puntillas', n: ['Elevación de talones', 'Calf raises', 'Elevació de talons'], mus: ['gemelos', 'soleo'] },
  { id: 'remo', n: ['Remo', 'Rowing', 'Rem'], mus: ['dorsal-ancho', 'romboides', 'biceps'] },
  { id: 'press', n: ['Press de hombros', 'Shoulder press', "Press d'espatles"], mus: ['deltoides', 'triceps'] },
  { id: 'zancada', n: ['Zancada', 'Lunge', 'Gambada'], mus: ['cuadriceps', 'gluteo-mayor'] },
  { id: 'puente', n: ['Puente de glúteo', 'Glute bridge', 'Pont de gluti'], mus: ['gluteo-mayor', 'isquiotibiales'] },
  { id: 'curl', n: ['Curl de bíceps', 'Biceps curl', 'Curl de bíceps'], mus: ['biceps'] },
  { id: 'fondos', n: ['Fondos en banco', 'Bench dips', 'Fons en banc'], mus: ['triceps'] },
  { id: 'patada', n: ['Chutar un balón', 'Kicking a ball', 'Xutar una pilota'], mus: ['cuadriceps', 'iliopsoas'] },
  { id: 'remar-piernas', n: ['Saltar a la comba', 'Skipping rope', 'Botar a corda'], mus: ['gemelos', 'soleo'] },
];

// Pares agonista ↔ antagonista
export const ANTAGONISTS = [
  ['biceps', 'triceps'], ['cuadriceps', 'isquiotibiales'], ['tibial-anterior', 'gemelos'], ['iliopsoas', 'gluteo-mayor'],
  ['recto-abdominal', 'erectores'], ['deltoides', 'dorsal-ancho'], ['gluteo-medio', 'aductores'], ['flexores-antebrazo', 'extensores-antebrazo'],
];

// Bachillerato: palancas, contracciones y planos/ejes del movimiento.
export const LEVERS = [
  { id: 1, n: ['Primer género', 'First class', 'Primer gènere'], d: ['el punto de apoyo está entre la fuerza y la resistencia', 'the fulcrum is between the effort and the load', "el punt de suport està entre la força i la resistència"], ex: [['Asentir con la cabeza', 'Nodding the head', 'Assentir amb el cap']] },
  { id: 2, n: ['Segundo género', 'Second class', 'Segon gènere'], d: ['la resistencia está entre el apoyo y la fuerza', 'the load is between the fulcrum and the effort', 'la resistència està entre el suport i la força'], ex: [['Ponerse de puntillas', 'Standing on tiptoe', 'Posar-se de puntetes']] },
  { id: 3, n: ['Tercer género', 'Third class', 'Tercer gènere'], d: ['la fuerza está entre el apoyo y la resistencia', 'the effort is between the fulcrum and the load', 'la força està entre el suport i la resistència'], ex: [['Flexionar el codo con el bíceps', 'Bending the elbow with the biceps', 'Flexionar el colze amb el bíceps'], ['Chutar un balón (cuádriceps)', 'Kicking a ball (quadriceps)', 'Xutar una pilota (quàdriceps)']] },
];
export const CONTRACTIONS = [
  { id: 'concentrica', n: ['Concéntrica', 'Concentric', 'Concèntrica'], d: ['el músculo se acorta mientras hace fuerza', 'the muscle shortens while working', 'el múscul s\'escurça mentre fa força'], ex: [['Subir la pesa en un curl de bíceps', 'Lifting the weight in a biceps curl', 'Pujar la pesa en un curl de bíceps'], ['Subir en una sentadilla', 'Standing up from a squat', 'Pujar en un esquat']] },
  { id: 'excentrica', n: ['Excéntrica', 'Eccentric', 'Excèntrica'], d: ['el músculo se alarga mientras hace fuerza', 'the muscle lengthens while working', 'el múscul s\'allarga mentre fa força'], ex: [['Bajar la pesa despacio', 'Lowering the weight slowly', 'Baixar la pesa a poc a poc'], ['Bajar unas escaleras', 'Walking downstairs', 'Baixar unes escales']] },
  { id: 'isometrica', n: ['Isométrica', 'Isometric', 'Isomètrica'], d: ['el músculo hace fuerza sin cambiar de longitud', 'the muscle works without changing length', 'el múscul fa força sense canviar de longitud'], ex: [['Aguantar una plancha', 'Holding a plank', 'Aguantar una planxa'], ['Empujar una pared', 'Pushing against a wall', 'Empényer una paret']] },
];
export const PLANE_NAMES = {
  sagital: ['Plano sagital (eje transversal)', 'Sagittal plane (transverse axis)', 'Pla sagital (eix transversal)'],
  frontal: ['Plano frontal (eje anteroposterior)', 'Frontal plane (anteroposterior axis)', 'Pla frontal (eix anteroposterior)'],
  transversal: ['Plano transversal (eje longitudinal)', 'Transverse plane (longitudinal axis)', 'Pla transversal (eix longitudinal)'],
};
