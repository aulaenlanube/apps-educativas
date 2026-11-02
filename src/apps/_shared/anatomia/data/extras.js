// Contenido de las preguntas que no son de "tocar en la lámina": sentidos,
// hormonas, salud y lenguaje médico. Textos [castellano, inglés, valenciano].

export const SENSES = [
  { id: 'vista', organ: 'ojo', face: 'ojos', n: ['La vista', 'Sight', 'La vista'], q: ['¿Con qué órgano vemos?', 'Which organ do we see with?', 'Amb quin òrgan veiem?'], verb: ['ver los colores del arcoíris', 'see the colours of a rainbow', 'veure els colors de l\'arc de Sant Martí'] },
  { id: 'oido', organ: 'oido', face: 'orejas', n: ['El oído', 'Hearing', 'L\'oïda'], q: ['¿Con qué órgano oímos?', 'Which organ do we hear with?', 'Amb quin òrgan sentim els sons?'], verb: ['escuchar música', 'listen to music', 'escoltar música'] },
  { id: 'olfato', organ: 'nariz', face: 'nariz', n: ['El olfato', 'Smell', 'L\'olfacte'], q: ['¿Con qué órgano olemos?', 'Which organ do we smell with?', 'Amb quin òrgan olorem?'], verb: ['notar el olor de una flor', 'smell a flower', 'notar l\'olor d\'una flor'] },
  { id: 'gusto', organ: 'lengua', face: 'boca', n: ['El gusto', 'Taste', 'El gust'], q: ['¿Con qué órgano notamos los sabores?', 'Which organ do we taste with?', 'Amb quin òrgan notem els sabors?'], verb: ['saber si un limón es ácido', 'know that a lemon is sour', 'saber si una llima és àcida'] },
  { id: 'tacto', organ: 'piel', face: 'dedos', n: ['El tacto', 'Touch', 'El tacte'], q: ['¿Con qué órgano notamos si algo está frío o caliente?', 'Which organ tells us if something is hot or cold?', 'Amb quin òrgan notem si una cosa està freda o calenta?'], verb: ['notar que el agua está fría', 'feel that the water is cold', 'notar que l\'aigua està freda'] },
];

// gland: clave de la glándula en el catálogo
export const HORMONES = [
  { id: 'insulina', gland: 'pancreas', n: ['Insulina', 'Insulin', 'Insulina'], d: ['baja el azúcar de la sangre', 'lowers blood sugar', 'baixa el sucre de la sang'] },
  { id: 'glucagon', gland: 'pancreas', n: ['Glucagón', 'Glucagon', 'Glucagó'], d: ['sube el azúcar de la sangre', 'raises blood sugar', 'apuja el sucre de la sang'] },
  { id: 'tiroxina', gland: 'tiroides', n: ['Tiroxina', 'Thyroxine', 'Tiroxina'], d: ['acelera el metabolismo', 'speeds up metabolism', 'accelera el metabolisme'] },
  { id: 'calcitonina', gland: 'tiroides', n: ['Calcitonina', 'Calcitonin', 'Calcitonina'], d: ['baja el calcio de la sangre', 'lowers blood calcium', 'baixa el calci de la sang'], lv: 6 },
  { id: 'parathormona', gland: 'paratiroides', n: ['Parathormona', 'Parathyroid hormone', 'Parathormona'], d: ['sube el calcio de la sangre', 'raises blood calcium', 'apuja el calci de la sang'], lv: 6 },
  { id: 'adrenalina', gland: 'suprarrenales', n: ['Adrenalina', 'Adrenaline', 'Adrenalina'], d: ['prepara el cuerpo para huir o luchar ante un peligro', 'gets the body ready to fight or run away', 'prepara el cos per a fugir o lluitar davant d\'un perill'] },
  { id: 'cortisol', gland: 'suprarrenales', n: ['Cortisol', 'Cortisol', 'Cortisol'], d: ['ayuda al cuerpo a responder al estrés', 'helps the body cope with stress', 'ajuda el cos a respondre a l\'estrés'], lv: 6 },
  { id: 'crecimiento', gland: 'hipofisis', n: ['Hormona del crecimiento', 'Growth hormone', 'Hormona del creixement'], d: ['hace crecer los huesos y los músculos', 'makes bones and muscles grow', 'fa créixer els ossos i els músculs'] },
  { id: 'tsh', gland: 'hipofisis', n: ['TSH (tirotropina)', 'TSH (thyrotropin)', 'TSH (tirotropina)'], d: ['ordena al tiroides que trabaje', 'tells the thyroid to work', 'ordena a la tiroide que treballe'], lv: 6 },
  { id: 'adh', gland: 'hipofisis', n: ['Hormona antidiurética (ADH)', 'Antidiuretic hormone (ADH)', 'Hormona antidiürètica (ADH)'], d: ['hace que los riñones ahorren agua', 'makes the kidneys save water', 'fa que els ronyons estalvien aigua'], lv: 6 },
  { id: 'oxitocina', gland: 'hipofisis', n: ['Oxitocina', 'Oxytocin', 'Oxitocina'], d: ['provoca las contracciones del parto y la salida de la leche', 'causes labour contractions and milk release', 'provoca les contraccions del part i l\'eixida de la llet'], lv: 6 },
  { id: 'melatonina', gland: 'pineal', n: ['Melatonina', 'Melatonin', 'Melatonina'], d: ['regula el sueño', 'controls sleep', 'regula el son'] },
  { id: 'testosterona', gland: 'testiculos', n: ['Testosterona', 'Testosterone', 'Testosterona'], d: ['produce los cambios masculinos de la pubertad', 'causes male changes at puberty', 'produïx els canvis masculins de la pubertat'] },
  { id: 'estrogenos', gland: 'ovarios', n: ['Estrógenos', 'Oestrogens', 'Estrògens'], d: ['producen los cambios femeninos de la pubertad', 'cause female changes at puberty', 'produïxen els canvis femenins de la pubertat'] },
  { id: 'progesterona', gland: 'ovarios', n: ['Progesterona', 'Progesterone', 'Progesterona'], d: ['prepara el útero para el embarazo', 'gets the uterus ready for pregnancy', "prepara l'úter per a l'embaràs"] },
  { id: 'timosina', gland: 'timo', n: ['Timosina', 'Thymosin', 'Timosina'], d: ['ayuda a madurar los linfocitos T', 'helps T cells mature', 'ajuda a madurar els limfòcits T'], lv: 6 },
];

// organ: clave del órgano afectado
export const DISEASES = [
  { id: 'caries', organ: 'dientes', n: ['Caries', 'Tooth decay', 'Càries'], d: ['las bacterias destruyen el esmalte', 'bacteria destroy the enamel', "els bacteris destruïxen l'esmalt"], tip: ['Cepíllate los dientes después de comer.', 'Brush your teeth after eating.', 'Raspalla\'t les dents després de menjar.'] },
  { id: 'gastritis', organ: 'estomago', n: ['Gastritis', 'Gastritis', 'Gastritis'], d: ['inflamación de la pared del estómago', 'inflammation of the stomach lining', "inflamació de la paret de l'estómac"] },
  { id: 'apendicitis', organ: 'apendice', n: ['Apendicitis', 'Appendicitis', 'Apendicitis'], d: ['inflamación del apéndice', 'inflammation of the appendix', "inflamació de l'apèndix"] },
  { id: 'hepatitis', organ: 'higado', n: ['Hepatitis', 'Hepatitis', 'Hepatitis'], d: ['inflamación del hígado', 'inflammation of the liver', 'inflamació del fetge'] },
  { id: 'asma', organ: 'bronquios', n: ['Asma', 'Asthma', 'Asma'], d: ['los bronquios se estrechan y cuesta respirar', 'the bronchi narrow and breathing is hard', 'els bronquis s\'estrenyen i costa respirar'] },
  { id: 'neumonia', organ: 'pulmones', n: ['Neumonía', 'Pneumonia', 'Pneumònia'], d: ['infección de los pulmones', 'lung infection', 'infecció dels pulmons'] },
  { id: 'bronquitis', organ: 'bronquios', n: ['Bronquitis', 'Bronchitis', 'Bronquitis'], d: ['inflamación de los bronquios', 'inflammation of the bronchi', 'inflamació dels bronquis'] },
  { id: 'faringitis', organ: 'faringe', n: ['Faringitis', 'Sore throat (pharyngitis)', 'Faringitis'], d: ['inflamación de la faringe', 'inflammation of the pharynx', 'inflamació de la faringe'] },
  { id: 'infarto', organ: 'corazon', n: ['Infarto de miocardio', 'Heart attack', 'Infart de miocardi'], d: ['una zona del corazón se queda sin sangre', 'part of the heart muscle loses its blood supply', 'una zona del cor es queda sense sang'], tip: ['El deporte y no fumar cuidan el corazón.', 'Exercise and not smoking protect the heart.', 'L\'esport i no fumar cuiden el cor.'] },
  { id: 'arteriosclerosis', organ: 'arterias', n: ['Arteriosclerosis', 'Arteriosclerosis', 'Arteriosclerosi'], d: ['las arterias se endurecen y se estrechan', 'arteries harden and narrow', 'les artèries s\'endurixen i s\'estrenyen'] },
  { id: 'anemia', organ: 'globulos-rojos', n: ['Anemia', 'Anaemia', 'Anèmia'], d: ['faltan glóbulos rojos o hemoglobina', 'too few red blood cells or haemoglobin', 'falten glòbuls rojos o hemoglobina'] },
  { id: 'calculos', organ: 'rinones', n: ['Cálculos renales', 'Kidney stones', 'Càlculs renals'], d: ['se forman piedras en el riñón', 'stones form in the kidney', 'es formen pedres al ronyó'], tip: ['Beber agua ayuda a evitarlos.', 'Drinking water helps prevent them.', 'Beure aigua ajuda a evitar-los.'] },
  { id: 'cistitis', organ: 'vejiga', n: ['Cistitis', 'Cystitis', 'Cistitis'], d: ['infección de la vejiga', 'bladder infection', 'infecció de la bufeta'] },
  { id: 'diabetes', organ: 'pancreas', n: ['Diabetes', 'Diabetes', 'Diabetis'], d: ['el cuerpo no fabrica o no usa bien la insulina', 'the body does not make or use insulin properly', 'el cos no fabrica o no usa bé la insulina'] },
  { id: 'bocio', organ: 'tiroides', n: ['Bocio', 'Goitre', 'Goll'], d: ['el tiroides se agranda', 'the thyroid gets bigger', 'la tiroide s\'agranda'] },
  { id: 'miopia', organ: 'ojo', n: ['Miopía', 'Short-sightedness', 'Miopia'], d: ['se ve mal de lejos', 'distant things look blurry', 'es veu malament de lluny'] },
  { id: 'cataratas', organ: 'cristalino', n: ['Cataratas', 'Cataracts', 'Cataractes'], d: ['el cristalino se vuelve opaco', 'the lens becomes cloudy', 'el cristal·lí es torna opac'] },
  { id: 'conjuntivitis', organ: 'ojo', n: ['Conjuntivitis', 'Conjunctivitis', 'Conjuntivitis'], d: ['inflamación de la membrana que cubre el ojo', 'inflammation of the membrane covering the eye', "inflamació de la membrana que cobrix l'ull"] },
  { id: 'otitis', organ: 'oido', n: ['Otitis', 'Ear infection (otitis)', 'Otitis'], d: ['inflamación del oído', 'inflammation of the ear', "inflamació de l'orella"] },
  { id: 'alzheimer', organ: 'cerebro', n: ['Alzheimer', "Alzheimer's disease", 'Alzheimer'], d: ['las neuronas mueren y se pierde la memoria', 'neurons die and memory is lost', 'les neurones moren i es perd la memòria'] },
  { id: 'fractura', organ: 'femur', n: ['Fractura', 'Fracture', 'Fractura'], d: ['un hueso se rompe', 'a bone breaks', 'un os es trenca'], sys: 'oseo' },
  { id: 'osteoporosis', organ: 'hueso-esponjoso', n: ['Osteoporosis', 'Osteoporosis', 'Osteoporosi'], d: ['los huesos pierden calcio y se vuelven frágiles', 'bones lose calcium and become fragile', 'els ossos perden calci i es tornen fràgils'] },
  { id: 'esguince', organ: 'ligamento', n: ['Esguince', 'Sprain', 'Torcedura'], d: ['un ligamento se estira o se rompe', 'a ligament is stretched or torn', 'un lligament s\'estira o es trenca'] },
  { id: 'tendinitis', organ: 'tendon', n: ['Tendinitis', 'Tendinitis', 'Tendinitis'], d: ['inflamación de un tendón', 'inflammation of a tendon', "inflamació d'un tendó"] },
  { id: 'escoliosis', organ: 'columna', n: ['Escoliosis', 'Scoliosis', 'Escoliosi'], d: ['la columna se tuerce hacia un lado', 'the spine curves sideways', 'la columna es torç cap a un costat'], tip: ['Llevar bien la mochila y sentarse recto la cuidan.', 'Carrying your backpack properly and sitting up straight help.', 'Portar bé la motxilla i seure recte la cuiden.'] },
  { id: 'artrosis', organ: 'cartilago-articular', n: ['Artrosis', 'Osteoarthritis', 'Artrosi'], d: ['se desgasta el cartílago de las articulaciones', 'joint cartilage wears away', 'es desgasta el cartílag de les articulacions'] },
];

// Raíces del lenguaje médico (Bachillerato)
export const ROOTS = [
  { r: 'gastr-', m: ['estómago', 'stomach', 'estómac'], ex: 'gastritis' },
  { r: 'hepat-', m: ['hígado', 'liver', 'fetge'], ex: 'hepatitis' },
  { r: 'nefr-', m: ['riñón', 'kidney', 'ronyó'], ex: 'nefrona' },
  { r: 'cardi-', m: ['corazón', 'heart', 'cor'], ex: 'cardiología' },
  { r: 'neum-', m: ['pulmón', 'lung', 'pulmó'], ex: 'neumonía' },
  { r: 'oste-', m: ['hueso', 'bone', 'os'], ex: 'osteoporosis' },
  { r: 'mio-', m: ['músculo', 'muscle', 'múscul'], ex: 'miocardio' },
  { r: 'derm-', m: ['piel', 'skin', 'pell'], ex: 'dermatitis' },
  { r: 'neur-', m: ['nervio', 'nerve', 'nervi'], ex: 'neurona' },
  { r: 'hemat- / hemo-', m: ['sangre', 'blood', 'sang'], ex: 'hematoma' },
  { r: 'oftalm-', m: ['ojo', 'eye', 'ull'], ex: 'oftalmólogo' },
  { r: 'ot-', m: ['oído', 'ear', 'orella'], ex: 'otitis' },
  { r: 'rin-', m: ['nariz', 'nose', 'nas'], ex: 'rinitis' },
  { r: 'gloso-', m: ['lengua', 'tongue', 'llengua'], ex: 'glosofaríngeo' },
  { r: 'odont-', m: ['diente', 'tooth', 'dent'], ex: 'odontólogo' },
  { r: 'angi-', m: ['vaso sanguíneo', 'blood vessel', 'vas sanguini'], ex: 'angiografía' },
  { r: 'artr-', m: ['articulación', 'joint', 'articulació'], ex: 'artrosis' },
  { r: 'cefal-', m: ['cabeza', 'head', 'cap'], ex: 'cefalea' },
  { r: 'cist-', m: ['vejiga', 'bladder', 'bufeta'], ex: 'cistitis' },
  { r: 'encefal-', m: ['encéfalo', 'brain', 'encèfal'], ex: 'encefalograma' },
  { r: '-itis', m: ['inflamación', 'inflammation', 'inflamació'], ex: 'apendicitis', suf: true },
  { r: '-algia', m: ['dolor', 'pain', 'dolor'], ex: 'neuralgia', suf: true },
  { r: '-ectomía', m: ['extirpación', 'surgical removal', 'extirpació'], ex: 'apendicectomía', suf: true },
  { r: '-logía', m: ['estudio', 'study', 'estudi'], ex: 'cardiología', suf: true },
  { r: '-scopia', m: ['observación por dentro', 'looking inside', 'observació per dins'], ex: 'endoscopia', suf: true },
];

// Términos de posición (posición anatómica). opts: términos que pueden salir de opción.
export const DIRECTIONS_TERMS = {
  proximal: ['proximal', 'proximal', 'proximal'],
  distal: ['distal', 'distal', 'distal'],
  anterior: ['anterior (ventral)', 'anterior (ventral)', 'anterior (ventral)'],
  posterior: ['posterior (dorsal)', 'posterior (dorsal)', 'posterior (dorsal)'],
  superior: ['superior (craneal)', 'superior (cranial)', 'superior (cranial)'],
  inferior: ['inferior (caudal)', 'inferior (caudal)', 'inferior (caudal)'],
  medial: ['medial', 'medial', 'medial'],
  lateral: ['lateral', 'lateral', 'lateral'],
  superficial: ['superficial', 'superficial', 'superficial'],
  profundo: ['profundo', 'deep', 'profund'],
};
export const DIRECTIONS = [
  { a: 'el codo', b: 'la muñeca', en: ['the elbow', 'the wrist'], va: ['el colze', 'el canell'], ans: 'proximal', axis: 'pd' },
  { a: 'el tobillo', b: 'la rodilla', en: ['the ankle', 'the knee'], va: ['el turmell', 'el genoll'], ans: 'distal', axis: 'pd' },
  { a: 'el hombro', b: 'el codo', en: ['the shoulder', 'the elbow'], va: ["l'espatla", 'el colze'], ans: 'proximal', axis: 'pd' },
  { a: 'los dedos', b: 'la muñeca', en: ['the fingers', 'the wrist'], va: ['els dits', 'el canell'], ans: 'distal', axis: 'pd', pl: true },
  { a: 'el esternón', b: 'la columna vertebral', en: ['the sternum', 'the spine'], va: ["l'estèrnum", 'la columna vertebral'], ans: 'anterior', axis: 'ap' },
  { a: 'la columna vertebral', b: 'el esternón', en: ['the spine', 'the sternum'], va: ['la columna vertebral', "l'estèrnum"], ans: 'posterior', axis: 'ap' },
  { a: 'la nariz', b: 'los ojos', en: ['the nose', 'the eyes'], va: ['el nas', 'els ulls'], ans: 'medial', axis: 'ml' },
  { a: 'las orejas', b: 'la nariz', en: ['the ears', 'the nose'], va: ['les orelles', 'el nas'], ans: 'lateral', axis: 'ml', pl: true },
  { a: 'el pulgar', b: 'el meñique', en: ['the thumb', 'the little finger'], va: ['el polze', 'el dit menut'], ans: 'lateral', axis: 'ml' },
  { a: 'la cabeza', b: 'el cuello', en: ['the head', 'the neck'], va: ['el cap', 'el coll'], ans: 'superior', axis: 'si' },
  { a: 'el ombligo', b: 'el esternón', en: ['the belly button', 'the sternum'], va: ['el melic', "l'estèrnum"], ans: 'inferior', axis: 'si' },
  { a: 'la piel', b: 'los músculos', en: ['the skin', 'the muscles'], va: ['la pell', 'els músculs'], ans: 'superficial', axis: 'sp' },
  { a: 'los huesos', b: 'la piel', en: ['the bones', 'the skin'], va: ['els ossos', 'la pell'], ans: 'profundo', axis: 'sp', pl: true },
  { a: 'el corazón', b: 'los pulmones', en: ['the heart', 'the lungs'], va: ['el cor', 'els pulmons'], ans: 'medial', axis: 'ml' },
];
export const PLANES = [
  { id: 'sagital', n: ['Plano sagital', 'Sagittal plane', 'Pla sagital'], d: ['divide el cuerpo en mitad derecha e izquierda', 'divides the body into right and left halves', 'divideix el cos en meitat dreta i esquerra'] },
  { id: 'frontal', n: ['Plano frontal (coronal)', 'Frontal (coronal) plane', 'Pla frontal (coronal)'], d: ['divide el cuerpo en parte delantera y trasera', 'divides the body into front and back parts', 'divideix el cos en part davantera i part del darrere'] },
  { id: 'transversal', n: ['Plano transversal', 'Transverse plane', 'Pla transversal'], d: ['divide el cuerpo en parte superior e inferior', 'divides the body into upper and lower parts', 'divideix el cos en part superior i part inferior'] },
];
