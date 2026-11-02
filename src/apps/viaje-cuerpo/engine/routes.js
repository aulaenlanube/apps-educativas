// Rutas de Viaje por el Cuerpo: el robot recorre el cuerpo siguiendo el
// alimento, el aire, la sangre, la orina, el impulso nervioso, la luz, el
// sonido, una hormona, las defensas y la vida; y, en Educación Física y salud,
// el oxígeno hasta el músculo que hace ejercicio y el humo del tabaco.
//
// route = { id, from (nivel), t: [es,en,va], d: [es,en,va], tracks: [track] }
// track = { lv: [min, max], main (lámina del recorrido completo), stops: [stop] }
// stop  = { k (clave del catálogo), plate (lámina, por defecto la principal), lv (nivel mínimo),
//          must (parada clave: siempre se pregunta aunque haya más paradas que preguntas) }
// EV[clave] = qué ocurre en esa parada [es, en, va] (por ruta, si cambia).

const S = (k, plate, lv, must) => ({ k, plate, lv, must });

export const ROUTES = [
  {
    id: 'bocado',
    from: 2,
    t: ['El bocado', 'The bite', 'La mossegada'],
    d: ['Sigue la comida desde la boca hasta el final.', 'Follow food from the mouth to the end.', 'Seguix el menjar des de la boca fins al final.'],
    tracks: [
      { lv: [2, 4], main: 'org-a', stops: [S('boca', 'cara', 2), S('faringe', 'cabeza-s', 4), S('esofago'), S('estomago'), S('intestino-delgado'), S('intestino-grueso')] },
      { lv: [5, 6], main: 'digestivo-a', stops: [S('boca', 'cabeza-s'), S('faringe', 'cabeza-s'), S('esofago'), S('estomago'), S('duodeno'), S('yeyuno', null, 6), S('ileon', null, 6), S('vellosidades', 'vellosidad'), S('ciego', null, 6), S('colon-ascendente'), S('colon-transverso'), S('colon-descendente'), S('colon-sigmoide', null, 6), S('recto'), S('ano')] },
    ],
  },
  {
    id: 'bocanada',
    from: 2,
    t: ['La bocanada', 'A breath of air', "L'alenada"],
    d: ['Viaja con el aire hasta los alvéolos.', 'Travel with the air to the alveoli.', "Viatja amb l'aire fins als alvèols."],
    tracks: [
      { lv: [2, 3], main: 'cabeza-s', stops: [S('fosas-nasales'), S('faringe'), S('laringe', null, 3), S('traquea'), S('pulmones', 'org-a'), S('alveolos', 'alveolo', 3)] },
      { lv: [4, 6], main: 'cabeza-s', stops: [S('fosas-nasales'), S('faringe'), S('laringe'), S('traquea'), S('bronquios', 'bronquios-a'), S('bronquiolos', 'bronquios-a'), S('alveolos', 'alveolo'), S('capilares-alveolo', 'alveolo')] },
    ],
  },
  {
    id: 'globulo',
    from: 3,
    t: ['El glóbulo rojo', 'The red blood cell', 'El glòbul roig'],
    d: ['Da la vuelta a la doble circulación.', 'Go round the double circulation.', 'Fes la volta a la doble circulació.'],
    tracks: [
      { lv: [3, 3], main: 'circulacion', stops: [S('venas-cavas'), S('corazon'), S('arteria-pulmonar'), S('pulmones'), S('venas-pulmonares'), S('aorta'), S('capilares-cuerpo')] },
      { lv: [4, 6], main: 'corazon', stops: [S('vena-cava-sup'), S('auricula-d'), S('valvula-tricuspide', null, 5), S('ventriculo-d'), S('valvula-pulmonar', null, 6), S('arteria-pulmonar'), S('capilares-pulmon', 'circulacion'), S('venas-pulmonares'), S('auricula-i'), S('valvula-mitral', null, 5), S('ventriculo-i'), S('valvula-aortica', null, 6), S('aorta'), S('capilares-cuerpo', 'circulacion')] },
    ],
  },
  {
    id: 'gota',
    from: 3,
    t: ['La gota', 'The drop', 'La gota'],
    d: ['De la sangre a la orina, paso a paso.', 'From blood to urine, step by step.', "De la sang a l'orina, pas a pas."],
    tracks: [
      { lv: [3, 4], main: 'org-prof-a', stops: [S('arteria-renal', null, 4), S('rinones'), S('nefrona', 'rinon', 4), S('ureteres'), S('vejiga')] },
      { lv: [5, 6], main: 'nefrona', stops: [S('arteria-renal', 'org-prof-a'), S('glomerulo'), S('capsula-bowman'), S('tubulo-proximal', null, 6), S('asa-henle'), S('tubulo-distal', null, 6), S('tubo-colector'), S('pelvis-renal', 'rinon'), S('ureteres', 'org-prof-a'), S('vejiga', 'org-prof-a')] },
    ],
  },
  {
    id: 'impulso',
    from: 3,
    t: ['El impulso', 'The nerve impulse', "L'impuls"],
    d: ['Un acto reflejo a la velocidad del rayo.', 'A reflex at lightning speed.', 'Un acte reflex a la velocitat del llamp.'],
    tracks: [
      { lv: [3, 6], main: 'arco-reflejo', stops: [S('receptor'), S('neurona-sensitiva'), S('medula-espinal'), S('interneurona', null, 5), S('neurona-motora'), S('efector')] },
    ],
  },
  {
    id: 'luz',
    from: 3,
    t: ['La luz', 'Light', 'La llum'],
    d: ['Entra en el ojo y llega al cerebro.', 'Enter the eye and reach the brain.', "Entra a l'ull i arriba al cervell."],
    tracks: [
      { lv: [3, 6], main: 'ojo', stops: [S('cornea'), S('humor-acuoso', null, 5), S('pupila'), S('cristalino'), S('humor-vitreo', null, 4), S('retina'), S('nervio-optico'), S('lobulo-occipital', 'encefalo-l', 5)] },
    ],
  },
  {
    id: 'sonido',
    from: 3,
    t: ['El sonido', 'Sound', 'El so'],
    d: ['Del pabellón de la oreja al cerebro.', 'From the outer ear to the brain.', "Del pavelló de l'orella al cervell."],
    tracks: [
      { lv: [3, 6], main: 'oido', stops: [S('pabellon-auditivo'), S('conducto-auditivo'), S('timpano'), S('martillo', null, 4), S('yunque', null, 4), S('estribo', null, 4), S('ventana-oval', null, 6), S('coclea'), S('nervio-auditivo'), S('lobulo-temporal', 'encefalo-l', 5)] },
    ],
  },
  {
    id: 'vida',
    from: 3,
    t: ['La vida', 'Life', 'La vida'],
    d: ['De la ovulación al nacimiento.', 'From ovulation to birth.', "De l'ovulació al naixement."],
    tracks: [
      { lv: [3, 6], main: 'rep-f', stops: [S('ovarios'), S('fimbrias', null, 6), S('trompas'), S('utero'), S('endometrio', null, 5), S('placenta', 'embarazo', 4), S('cordon-umbilical', 'embarazo', 4), S('feto', 'embarazo', 4), S('cuello-utero', null, 4), S('vagina')] },
    ],
  },
  {
    id: 'hormona',
    from: 5,
    t: ['La hormona', 'The hormone', "L'hormona"],
    d: ['Un mensaje químico viaja por la sangre.', 'A chemical message travels in the blood.', 'Un missatge químic viatja per la sang.'],
    tracks: [
      { lv: [5, 6], main: 'endocrino', stops: [S('hipotalamo'), S('hipofisis'), S('tiroides'), S('suprarrenales'), S('pancreas')] },
    ],
  },
  {
    // Educación Física: el oxígeno, del aire al músculo que corre
    id: 'esfuerzo',
    from: 4,
    t: ['El esfuerzo', 'The workout', "L'esforç"],
    d: ['Corre con el oxígeno desde el aire hasta el músculo.', 'Run with oxygen from the air to a working muscle.', "Corre amb l'oxigen des de l'aire fins al múscul."],
    tracks: [
      {
        lv: [4, 6],
        main: 'vas-a',
        stops: [
          S('fosas-nasales', 'cabeza-s'), S('traquea', 'bronquios-a'), S('bronquios', 'bronquios-a'), S('alveolos', 'alveolo'), S('capilares-alveolo', 'alveolo', 5),
          S('venas-pulmonares'), S('corazon', null, 0, true), S('aorta'), S('aorta-abdominal'), S('iliacas-a'), S('arteria-femoral'), S('cuadriceps', 'mus-a', 0, true), S('vena-femoral', null, 5),
        ],
      },
    ],
  },
  {
    // Salud: el humo del tabaco y la nicotina
    id: 'humo',
    from: 4,
    t: ['El humo', 'The smoke', 'El fum'],
    d: ['Lo que el tabaco hace a su paso por el cuerpo.', 'What tobacco smoke does on its way through the body.', 'El que el tabac fa al seu pas pel cos.'],
    tracks: [
      {
        lv: [4, 6],
        main: 'cabeza-s',
        stops: [
          S('boca'), S('faringe'), S('laringe'), S('traquea'), S('bronquios', 'bronquios-a'), S('bronquiolos', 'bronquios-a'),
          S('alveolos', 'alveolo'), S('capilares-alveolo', 'alveolo', 0, true), S('corazon', 'org-a'), S('cerebro', 'org-a', 0, true),
        ],
      },
    ],
  },
  {
    id: 'defensa',
    from: 6,
    t: ['La defensa', 'The defence', 'La defensa'],
    d: ['Así te protege el sistema inmunitario.', 'How your immune system protects you.', 'Així et protegix el sistema immunitari.'],
    tracks: [
      { lv: [6, 6], main: 'linfatico', stops: [S('amigdalas'), S('vasos-linfaticos'), S('ganglios-cervicales'), S('neutrofilo', 'sangre'), S('linfocito', 'sangre'), S('timo'), S('bazo'), S('medula-osea')] },
    ],
  },
];
export const ROUTE_BY_ID = Object.fromEntries(ROUTES.map((r) => [r.id, r]));

// Qué ocurre en cada parada [es, en, va].
export const EV = {
  boca: ['Los dientes trituran la comida y la saliva la ablanda: se forma el bolo alimenticio.', 'Teeth grind the food and saliva softens it: it becomes a bolus.', "Les dents trituren el menjar i la saliva l'estova: es forma el bol alimentari."],
  faringe: ['Al tragar, la epiglotis tapa la laringe para que la comida no vaya a los pulmones.', 'When we swallow, the epiglottis covers the larynx so food does not go into the lungs.', "En empassar, l'epiglotis tapa la laringe perquè el menjar no vaja als pulmons."],
  esofago: ['Sus músculos empujan el bolo hasta el estómago (peristaltismo).', 'Its muscles push the bolus down to the stomach (peristalsis).', "Els seus músculs empenyen el bol fins a l'estómac (peristaltisme)."],
  estomago: ['Los jugos gástricos deshacen la comida y la convierten en quimo.', 'Gastric juices break the food down into chyme.', 'Els sucs gàstrics desfan el menjar i el convertixen en quim.'],
  duodeno: ['Llegan la bilis del hígado y el jugo del páncreas para seguir digiriendo.', 'Bile from the liver and pancreatic juice arrive to keep digesting.', 'Arriben la bilis del fetge i el suc del pàncrees per a continuar digerint.'],
  'intestino-delgado': ['Los nutrientes atraviesan su pared y pasan a la sangre.', 'Nutrients cross its wall and pass into the blood.', 'Els nutrients travessen la seua paret i passen a la sang.'],
  yeyuno: ['Sigue la digestión y se absorbe la mayor parte de los nutrientes.', 'Digestion continues and most nutrients are absorbed.', 'Continua la digestió i s\'absorbix la major part dels nutrients.'],
  ileon: ['Se absorben los últimos nutrientes, como la vitamina B12.', 'The last nutrients, like vitamin B12, are absorbed.', "S'absorbixen els últims nutrients, com la vitamina B12."],
  vellosidades: ['Las vellosidades multiplican la superficie y los nutrientes pasan a sus capilares.', 'The villi multiply the surface and nutrients pass into their capillaries.', 'Les vellositats multipliquen la superfície i els nutrients passen als seus capil·lars.'],
  ciego: ['Lo que no se ha absorbido entra en el intestino grueso.', 'What has not been absorbed enters the large intestine.', "El que no s'ha absorbit entra a l'intestí gros."],
  'intestino-grueso': ['Se absorbe el agua y se forman las heces.', 'Water is absorbed and faeces are formed.', "S'absorbix l'aigua i es formen els excrements."],
  'colon-ascendente': ['Sube por la derecha y empieza a absorber agua.', 'It goes up on the right and starts absorbing water.', 'Puja per la dreta i comença a absorbir aigua.'],
  'colon-transverso': ['Cruza el abdomen mientras sus bacterias trabajan.', 'It crosses the abdomen while its bacteria work.', "Travessa l'abdomen mentre els seus bacteris treballen."],
  'colon-descendente': ['Baja por la izquierda y las heces se compactan.', 'It goes down on the left and the faeces become firmer.', 'Baixa per l\'esquerra i els excrements es compacten.'],
  'colon-sigmoide': ['Con forma de S, lleva las heces hasta el recto.', 'S-shaped, it carries the faeces to the rectum.', 'Amb forma de S, porta els excrements fins al recte.'],
  recto: ['Las heces se guardan hasta que vamos al baño.', 'Faeces are stored until we go to the toilet.', 'Els excrements es guarden fins que anem al bany.'],
  ano: ['Las heces salen del cuerpo: es la defecación.', 'Faeces leave the body: this is defecation.', 'Els excrements ixen del cos: és la defecació.'],
  'fosas-nasales': ['El aire se calienta y se humedece, y los pelos y el moco atrapan el polvo.', 'The air is warmed and moistened, and hairs and mucus trap the dust.', "L'aire s'escalfa i s'humiteja, i els pèls i el moc atrapen la pols."],
  'faringe@bocanada': ['El aire baja por la faringe, el tubo que comparte con la comida.', 'The air goes down the pharynx, the tube it shares with food.', "L'aire baixa per la faringe, el tub que comparteix amb el menjar."],
  laringe: ['Pasa entre las cuerdas vocales, que vibran cuando hablamos.', 'It passes between the vocal cords, which vibrate when we speak.', 'Passa entre les cordes vocals, que vibren quan parlem.'],
  traquea: ['Sus anillos de cartílago la mantienen abierta para que pase el aire.', 'Its cartilage rings keep it open so the air can pass.', "Els seus anells de cartílag la mantenen oberta perquè passe l'aire."],
  bronquios: ['La tráquea se divide en dos bronquios, uno para cada pulmón.', 'The trachea splits into two bronchi, one for each lung.', 'La tràquea es divideix en dos bronquis, un per a cada pulmó.'],
  bronquiolos: ['Los bronquios se ramifican en tubos cada vez más finos.', 'The bronchi branch into thinner and thinner tubes.', 'Els bronquis es ramifiquen en tubs cada vegada més fins.'],
  pulmones: ['En los pulmones el oxígeno pasa a la sangre y sale el dióxido de carbono.', 'In the lungs oxygen passes into the blood and carbon dioxide comes out.', "Als pulmons l'oxigen passa a la sang i ix el diòxid de carboni."],
  alveolos: ['El oxígeno atraviesa la finísima pared del alvéolo y pasa a la sangre.', 'Oxygen crosses the very thin alveolar wall into the blood.', "L'oxigen travessa la finíssima paret de l'alvèol i passa a la sang."],
  'capilares-alveolo': ['La sangre recoge el oxígeno y deja el dióxido de carbono, que expulsamos al espirar.', 'Blood picks up oxygen and leaves carbon dioxide, which we breathe out.', "La sang arreplega l'oxigen i deixa el diòxid de carboni, que expulsem en espirar."],
  'venas-cavas': ['La sangre sin oxígeno vuelve del cuerpo al corazón.', 'Blood without oxygen comes back from the body to the heart.', 'La sang sense oxigen torna del cos al cor.'],
  'vena-cava-sup': ['La sangre sin oxígeno de la cabeza y los brazos vuelve al corazón.', 'Blood without oxygen from the head and arms comes back to the heart.', 'La sang sense oxigen del cap i els braços torna al cor.'],
  corazon: ['El corazón bombea la sangre hacia los pulmones y hacia todo el cuerpo.', 'The heart pumps blood to the lungs and the whole body.', 'El cor bomba la sang cap als pulmons i cap a tot el cos.'],
  'auricula-d': ['La sangre sin oxígeno entra en la aurícula derecha.', 'Blood without oxygen enters the right atrium.', "La sang sense oxigen entra a l'aurícula dreta."],
  'valvula-tricuspide': ['Se abre para que la sangre pase al ventrículo derecho y se cierra para que no vuelva.', 'It opens to let blood into the right ventricle and closes so it cannot flow back.', 'S\'obri perquè la sang passe al ventricle dret i es tanca perquè no torne.'],
  'ventriculo-d': ['Se contrae y empuja la sangre hacia los pulmones.', 'It contracts and pushes blood towards the lungs.', 'Es contrau i empeny la sang cap als pulmons.'],
  'valvula-pulmonar': ['Deja salir la sangre hacia la arteria pulmonar.', 'It lets blood out into the pulmonary artery.', "Deixa eixir la sang cap a l'artèria pulmonar."],
  'arteria-pulmonar': ['Lleva la sangre sin oxígeno a los pulmones.', 'It carries blood without oxygen to the lungs.', 'Porta la sang sense oxigen als pulmons.'],
  'capilares-pulmon': ['La sangre suelta el dióxido de carbono y recoge oxígeno.', 'Blood drops off carbon dioxide and picks up oxygen.', 'La sang deixa el diòxid de carboni i arreplega oxigen.'],
  'venas-pulmonares': ['La sangre, ya con oxígeno, vuelve al corazón.', 'Blood, now full of oxygen, returns to the heart.', 'La sang, ja amb oxigen, torna al cor.'],
  'auricula-i': ['La sangre con oxígeno entra en la aurícula izquierda.', 'Blood with oxygen enters the left atrium.', "La sang amb oxigen entra a l'aurícula esquerra."],
  'valvula-mitral': ['Se abre para que la sangre pase al ventrículo izquierdo.', 'It opens to let blood into the left ventricle.', "S'obri perquè la sang passe al ventricle esquerre."],
  'ventriculo-i': ['Su pared gruesa empuja con fuerza la sangre hacia todo el cuerpo.', 'Its thick wall pushes blood hard to the whole body.', 'La seua paret grossa empeny amb força la sang cap a tot el cos.'],
  'valvula-aortica': ['Deja salir la sangre hacia la aorta.', 'It lets blood out into the aorta.', "Deixa eixir la sang cap a l'aorta."],
  aorta: ['La arteria más grande reparte la sangre con oxígeno por todo el cuerpo.', 'The largest artery carries oxygen-rich blood all over the body.', "L'artèria més gran repartix la sang amb oxigen per tot el cos."],
  'capilares-cuerpo': ['La sangre da oxígeno y nutrientes a las células y recoge sus desechos.', 'Blood gives cells oxygen and nutrients and collects their waste.', 'La sang dona oxigen i nutrients a les cèl·lules i arreplega les seues deixalles.'],
  'arteria-renal': ['La sangre con desechos llega al riñón.', 'Blood with waste arrives at the kidney.', 'La sang amb deixalles arriba al ronyó.'],
  rinones: ['Los riñones filtran la sangre y fabrican la orina.', 'The kidneys filter the blood and make urine.', "Els ronyons filtren la sang i fabriquen l'orina."],
  nefrona: ['En cada nefrona se filtra la sangre y se forma la orina.', 'In each nephron the blood is filtered and urine is formed.', "En cada nefrona es filtra la sang i es forma l'orina."],
  glomerulo: ['La sangre se filtra: el agua y las sustancias pequeñas salen del ovillo de capilares.', 'Blood is filtered: water and small substances leave the tangle of capillaries.', "La sang es filtra: l'aigua i les substàncies menudes ixen del cabdell de capil·lars."],
  'capsula-bowman': ['Recoge el líquido filtrado.', 'It collects the filtered fluid.', 'Arreplega el líquid filtrat.'],
  'tubulo-proximal': ['Se recuperan la glucosa, las sales y mucha agua.', 'Glucose, salts and lots of water are taken back.', 'Es recuperen la glucosa, les sals i molta aigua.'],
  'asa-henle': ['Se recupera más agua y la orina se concentra.', 'More water is taken back and the urine becomes concentrated.', "Es recupera més aigua i l'orina es concentra."],
  'tubulo-distal': ['Se ajustan las sales que quedan en la orina.', 'The remaining salts in the urine are adjusted.', "S'ajusten les sals que queden a l'orina."],
  'tubo-colector': ['Recoge la orina de muchas nefronas.', 'It collects urine from many nephrons.', "Arreplega l'orina de moltes nefrones."],
  'pelvis-renal': ['La orina se junta antes de salir del riñón.', 'Urine gathers before leaving the kidney.', "L'orina s'ajunta abans d'eixir del ronyó."],
  ureteres: ['Los uréteres llevan la orina hasta la vejiga.', 'The ureters carry urine to the bladder.', "Els urèters porten l'orina fins a la bufeta."],
  vejiga: ['La orina se guarda hasta que vamos al baño.', 'Urine is stored until we go to the toilet.', "L'orina es guarda fins que anem al bany."],
  receptor: ['La piel del dedo nota el pinchazo: es el estímulo.', 'The skin of the finger feels the prick: the stimulus.', "La pell del dit nota la punxada: és l'estímul."],
  'neurona-sensitiva': ['Un impulso nervioso viaja hacia la médula espinal.', 'A nerve impulse travels towards the spinal cord.', 'Un impuls nerviós viatja cap a la medul·la espinal.'],
  'medula-espinal': ['La médula recibe el mensaje y responde sin esperar al cerebro.', 'The spinal cord gets the message and answers without waiting for the brain.', 'La medul·la rep el missatge i respon sense esperar el cervell.'],
  interneurona: ['Conecta la neurona sensitiva con la motora dentro de la médula.', 'It connects the sensory neuron to the motor neuron inside the cord.', 'Connecta la neurona sensitiva amb la motora dins de la medul·la.'],
  'neurona-motora': ['Lleva la orden de la médula al músculo.', 'It carries the order from the spinal cord to the muscle.', 'Porta l\'ordre de la medul·la al múscul.'],
  efector: ['El músculo se contrae y retiramos la mano: ¡es un acto reflejo!', 'The muscle contracts and we pull our hand away: a reflex!', 'El múscul es contrau i retirem la mà: és un acte reflex!'],
  cornea: ['La luz entra por la córnea, transparente, que empieza a desviarla.', 'Light enters through the clear cornea, which starts to bend it.', 'La llum entra per la còrnia, transparent, que comença a desviar-la.'],
  'humor-acuoso': ['Atraviesa el humor acuoso, un líquido transparente.', 'It goes through the aqueous humour, a clear liquid.', "Travessa l'humor aquós, un líquid transparent."],
  pupila: ['Pasa por la pupila, que se abre o se cierra según la luz.', 'It passes through the pupil, which opens or closes depending on the light.', 'Passa per la pupil·la, que s\'obri o es tanca segons la llum.'],
  cristalino: ['El cristalino enfoca la imagen como una lupa.', 'The lens focuses the image like a magnifying glass.', 'El cristal·lí enfoca la imatge com una lupa.'],
  'humor-vitreo': ['Cruza el humor vítreo, la gelatina transparente que llena el ojo.', 'It crosses the vitreous humour, the clear jelly that fills the eye.', "Travessa l'humor vitri, la gelatina transparent que omple l'ull."],
  retina: ['En la retina, conos y bastones convierten la luz en impulsos nerviosos.', 'In the retina, cones and rods turn light into nerve impulses.', 'A la retina, cons i bastons convertixen la llum en impulsos nerviosos.'],
  'nervio-optico': ['El nervio óptico lleva la información al encéfalo.', 'The optic nerve takes the information to the brain.', "El nervi òptic porta la informació a l'encèfal."],
  'lobulo-occipital': ['El área visual del cerebro interpreta lo que vemos.', 'The visual area of the brain makes sense of what we see.', "L'àrea visual del cervell interpreta el que veiem."],
  'pabellon-auditivo': ['La oreja recoge el sonido.', 'The outer ear collects the sound.', "L'orella arreplega el so."],
  'conducto-auditivo': ['El sonido viaja por el conducto auditivo.', 'Sound travels along the ear canal.', 'El so viatja pel conducte auditiu.'],
  timpano: ['El sonido hace vibrar el tímpano.', 'Sound makes the eardrum vibrate.', 'El so fa vibrar el timpà.'],
  martillo: ['El martillo recibe la vibración del tímpano.', 'The hammer picks up the vibration from the eardrum.', 'El martell rep la vibració del timpà.'],
  yunque: ['El yunque pasa la vibración al estribo.', 'The anvil passes the vibration to the stirrup.', "L'enclusa passa la vibració a l'estrep."],
  estribo: ['El estribo empuja la ventana oval.', 'The stirrup pushes on the oval window.', "L'estrep empeny la finestra oval."],
  'ventana-oval': ['La vibración entra en el oído interno.', 'The vibration enters the inner ear.', "La vibració entra a l'oïda interna."],
  coclea: ['El líquido de la cóclea se mueve y sus células convierten la vibración en impulsos nerviosos.', 'The fluid in the cochlea moves and its cells turn the vibration into nerve impulses.', 'El líquid de la còclea es mou i les seues cèl·lules convertixen la vibració en impulsos nerviosos.'],
  'nervio-auditivo': ['El nervio auditivo lleva el mensaje al encéfalo.', 'The auditory nerve carries the message to the brain.', "El nervi auditiu porta el missatge a l'encèfal."],
  'lobulo-temporal': ['El cerebro interpreta lo que oímos.', 'The brain makes sense of what we hear.', 'El cervell interpreta el que sentim.'],
  ovarios: ['Un ovario libera un óvulo: es la ovulación.', 'An ovary releases an egg: ovulation.', "Un ovari allibera un òvul: és l'ovulació."],
  fimbrias: ['Las fimbrias recogen el óvulo.', 'The fimbriae catch the egg.', "Les fímbries arrepleguen l'òvul."],
  trompas: ['En la trompa el óvulo puede unirse con un espermatozoide: es la fecundación.', 'In the tube the egg can join a sperm cell: fertilisation.', "A la trompa l'òvul pot unir-se amb un espermatozou: és la fecundació."],
  utero: ['El óvulo fecundado llega al útero y se implanta en su pared.', 'The fertilised egg reaches the uterus and implants in its wall.', "L'òvul fecundat arriba a l'úter i s'implanta a la seua paret."],
  endometrio: ['El embrión se implanta en el endometrio.', 'The embryo implants in the endometrium.', "L'embrió s'implanta en l'endometri."],
  placenta: ['La placenta pasa oxígeno y alimento de la madre al bebé.', 'The placenta passes oxygen and food from the mother to the baby.', 'La placenta passa oxigen i aliment de la mare al bebé.'],
  'cordon-umbilical': ['El cordón une al bebé con la placenta.', 'The cord connects the baby to the placenta.', 'El cordó unix el bebé amb la placenta.'],
  feto: ['El feto crece durante unos nueve meses.', 'The foetus grows for about nine months.', 'El fetus creix durant uns nou mesos.'],
  'cuello-utero': ['En el parto, el cuello del útero se abre (se dilata).', 'During birth, the cervix opens (dilates).', "En el part, el coll de l'úter s'obri (es dilata)."],
  vagina: ['El bebé sale por la vagina: ¡nace!', 'The baby comes out through the vagina: it is born!', 'El bebé ix per la vagina: naix!'],
  hipotalamo: ['El hipotálamo nota que el cuerpo necesita más energía y avisa a la hipófisis.', 'The hypothalamus senses the body needs more energy and alerts the pituitary.', "L'hipotàlem nota que el cos necessita més energia i avisa la hipòfisi."],
  hipofisis: ['La hipófisis fabrica TSH y la envía por la sangre.', 'The pituitary makes TSH and sends it through the blood.', 'La hipòfisi fabrica TSH i l\'envia per la sang.'],
  tiroides: ['El tiroides recibe la TSH y fabrica tiroxina, que acelera el metabolismo.', 'The thyroid receives TSH and makes thyroxine, which speeds up metabolism.', 'La tiroide rep la TSH i fabrica tiroxina, que accelera el metabolisme.'],
  suprarrenales: ['Ante un susto, las suprarrenales lanzan adrenalina: el corazón se acelera.', 'When we get a fright, the adrenal glands release adrenaline: the heart races.', "Davant d'un esglai, les suprarenals llancen adrenalina: el cor s'accelera."],
  pancreas: ['Después de comer, el páncreas fabrica insulina y baja el azúcar de la sangre.', 'After a meal, the pancreas makes insulin and lowers blood sugar.', 'Després de menjar, el pàncrees fabrica insulina i baixa el sucre de la sang.'],
  amigdalas: ['Un microbio entra por la boca y las amígdalas intentan atraparlo.', 'A germ gets in through the mouth and the tonsils try to trap it.', 'Un microbi entra per la boca i les amígdales intenten atrapar-lo.'],
  'vasos-linfaticos': ['La linfa recoge los restos y los microbios de los tejidos.', 'Lymph collects debris and germs from the tissues.', 'La limfa arreplega les restes i els microbis dels teixits.'],
  'ganglios-cervicales': ['En los ganglios, los linfocitos reconocen al microbio y se multiplican: por eso se hinchan.', 'In the lymph nodes, lymphocytes recognise the germ and multiply: that is why they swell.', "Als ganglis, els limfòcits reconeixen el microbi i es multipliquen: per això s'inflen."],
  neutrofilo: ['Los neutrófilos engullen las bacterias (fagocitosis).', 'Neutrophils swallow the bacteria (phagocytosis).', 'Els neutròfils engolixen els bacteris (fagocitosi).'],
  linfocito: ['Los linfocitos B fabrican anticuerpos que marcan al microbio.', 'B lymphocytes make antibodies that tag the germ.', 'Els limfòcits B fabriquen anticossos que marquen el microbi.'],
  timo: ['En el timo maduran los linfocitos T que coordinan la defensa.', 'T cells, which coordinate the defence, mature in the thymus.', 'Al tim maduren els limfòcits T que coordinen la defensa.'],
  bazo: ['El bazo filtra la sangre y destruye microbios y glóbulos rojos viejos.', 'The spleen filters the blood and destroys germs and old red blood cells.', 'La melsa filtra la sang i destruïx microbis i glòbuls rojos vells.'],
  'medula-osea': ['La médula ósea fabrica nuevos glóbulos blancos para la defensa.', 'Bone marrow makes new white blood cells for the defence.', 'La medul·la òssia fabrica nous glòbuls blancs per a la defensa.'],

  /* El esfuerzo: el oxígeno del aire al músculo que corre */
  'fosas-nasales@esfuerzo': ['Empiezas a correr: respiras más deprisa y más hondo, y el aire entra por la nariz y también por la boca.', 'You start running: you breathe faster and more deeply, and air comes in through your nose and your mouth too.', "Comences a córrer: respires més de pressa i més profundament, i l'aire entra pel nas i també per la boca."],
  'traquea@esfuerzo': ['Por este tubo con anillos de cartílago pasa ahora mucho más aire cada minuto que en reposo.', 'Much more air now goes through this tube with rings of cartilage every minute than at rest.', 'Per aquest tub amb anells de cartílag passa ara molt més aire cada minut que en repòs.'],
  'bronquios@esfuerzo': ['El aire se reparte entre los dos pulmones; con el esfuerzo, estos tubos se ensanchan un poco para que pase mejor.', 'The air is shared between the two lungs; during exercise these tubes widen a little so it flows more easily.', "L'aire es repartix entre els dos pulmons; amb l'esforç, aquests tubs s'eixamplen una mica perquè passe millor."],
  'alveolos@esfuerzo': ['En estos saquitos el oxígeno pasa a la sangre; al hacer ejercicio entra más aire y llega más sangre, y el intercambio es mucho mayor.', 'In these tiny sacs oxygen passes into the blood; during exercise more air comes in and more blood arrives, so much more gas is exchanged.', "En aquests saquets l'oxigen passa a la sang; en fer exercici entra més aire i arriba més sang, i l'intercanvi és molt més gran."],
  'capilares-alveolo@esfuerzo': ['La sangre deja aquí el CO₂ que ha traído de los músculos y se carga de oxígeno.', 'Here the blood drops off the CO₂ it brought from the muscles and loads up with oxygen.', "Ací la sang deixa el CO₂ que ha portat dels músculs i es carrega d'oxigen."],
  'venas-pulmonares@esfuerzo': ['La sangre, ya cargada de oxígeno, va de los pulmones al corazón.', 'Blood, now full of oxygen, flows from the lungs to the heart.', "La sang, ja carregada d'oxigen, va dels pulmons al cor."],
  'corazon@esfuerzo': ['Late más deprisa y con más fuerza: puede pasar de unos 70 latidos por minuto en reposo a más de 150 al correr.', 'It beats faster and harder: from about 70 beats a minute at rest to more than 150 when running.', "Batega més de pressa i amb més força: pot passar d'uns 70 batecs per minut en repòs a més de 150 en córrer."],
  'aorta@esfuerzo': ['Sale del ventrículo izquierdo la sangre con oxígeno: al correr, sale hasta cuatro veces más sangre por minuto que en reposo.', 'Oxygen-rich blood leaves the left ventricle: when you run, up to four times more blood leaves every minute than at rest.', "Ix del ventricle esquerre la sang amb oxigen: en córrer, n'ix fins a quatre vegades més per minut que en repòs."],
  'aorta-abdominal@esfuerzo': ['La sangre baja por el abdomen; durante el ejercicio, al estómago y al intestino les llega menos sangre y a los músculos, mucha más.', 'Blood goes down through the abdomen; during exercise the stomach and gut get less blood and the muscles get much more.', "La sang baixa per l'abdomen; durant l'exercici, a l'estómac i a l'intestí els arriba menys sang i als músculs, molta més."],
  'iliacas-a@esfuerzo': ['La gran arteria se divide en dos ramas, una hacia cada pierna.', 'The great artery splits into two branches, one for each leg.', 'La gran artèria es dividix en dues branques, una cap a cada cama.'],
  'arteria-femoral@esfuerzo': ['Baja por el muslo llevando la sangre con oxígeno hasta los músculos que corren.', 'It runs down the thigh, carrying oxygen-rich blood to the running muscles.', 'Baixa per la cuixa portant la sang amb oxigen fins als músculs que corren.'],
  'cuadriceps@esfuerzo': ['Sus fibras usan el oxígeno para sacar energía de la glucosa y de las grasas; producen CO₂ y calor, y la sangre se lleva el CO₂.', 'Its fibres use oxygen to get energy from glucose and fats; they make CO₂ and heat, and the blood carries the CO₂ away.', "Les seues fibres usen l'oxigen per a traure energia de la glucosa i dels greixos; produïxen CO₂ i calor, i la sang s'emporta el CO₂."],
  'vena-femoral@esfuerzo': ['La sangre, cargada de CO₂, vuelve hacia el corazón; de allí irá a los pulmones, donde lo expulsamos al espirar cada vez más deprisa.', 'Blood loaded with CO₂ heads back to the heart; from there it goes to the lungs, where we breathe it out faster and faster.', "La sang, carregada de CO₂, torna cap al cor; d'allí anirà als pulmons, on l'expulsem en espirar cada vegada més de pressa."],

  /* El humo: lo que daña el tabaco a su paso */
  'boca@humo': ['El humo entra caliente: mancha los dientes, da mal aliento y aumenta el riesgo de cáncer de boca.', 'The smoke comes in hot: it stains the teeth, causes bad breath and raises the risk of mouth cancer.', 'El fum entra calent: taca les dents, fa mal alé i augmenta el risc de càncer de boca.'],
  'faringe@humo': ['El humo irrita y reseca el tubo que comparten el aire y la comida, y facilita las infecciones.', 'The smoke irritates and dries out the tube shared by air and food, and makes infections more likely.', "El fum irrita i resseca el tub que compartixen l'aire i el menjar, i facilita les infeccions."],
  'laringe@humo': ['Irrita las cuerdas vocales: aparecen la tos y la ronquera. El tabaco es la principal causa del cáncer de esta zona.', 'It irritates the vocal cords: coughing and hoarseness appear. Tobacco is the main cause of cancer here.', 'Irrita les cordes vocals: apareixen la tos i la ronquera. El tabac és la causa principal del càncer en aquesta zona.'],
  'traquea@humo': ['El humo paraliza los cilios, los pelillos que barren el moco y la suciedad hacia arriba: la suciedad se queda dentro.', 'The smoke paralyses the cilia, the tiny hairs that sweep mucus and dirt upwards: the dirt stays inside.', 'El fum paralitza els cilis, els pèls menuts que agranen el moc i la brutícia cap amunt: la brutícia es queda dins.'],
  'bronquios@humo': ['Sin cilios que lo barran, el moco se acumula: aparecen la tos del fumador y la bronquitis crónica. Aquí suele empezar el cáncer de pulmón.', "With no cilia to sweep it away, mucus builds up: smoker's cough and chronic bronchitis appear. Lung cancer usually starts here.", "Sense cilis que l'agranen, el moc s'acumula: apareixen la tos del fumador i la bronquitis crònica. Ací sol començar el càncer de pulmó."],
  'bronquiolos@humo': ['Se inflaman y se estrechan, y cuesta sacar el aire: es la EPOC, una enfermedad que no tiene cura.', 'They become inflamed and narrow, and breathing out gets hard: this is COPD, a disease with no cure.', "S'inflamen i s'estrenyen, i costa traure l'aire: és la MPOC, una malaltia que no té cura."],
  'alveolos@humo': ['Sus finas paredes se rompen y forman sacos más grandes (enfisema): hay menos superficie para el oxígeno y falta el aire.', 'Their thin walls break down into bigger sacs (emphysema): there is less surface for oxygen and you get short of breath.', "Les seues parets primes es trenquen i formen sacs més grans (emfisema): hi ha menys superfície per a l'oxigen i falta l'aire."],
  'capilares-alveolo@humo': ['La nicotina y el monóxido de carbono pasan a la sangre en segundos; el monóxido ocupa el sitio del oxígeno en los glóbulos rojos.', 'Nicotine and carbon monoxide pass into the blood in seconds; the carbon monoxide takes the place of oxygen in red blood cells.', "La nicotina i el monòxid de carboni passen a la sang en segons; el monòxid ocupa el lloc de l'oxigen en els glòbuls rojos."],
  'corazon@humo': ['La nicotina lo acelera y sube la tensión; con los años, el tabaco estrecha las arterias y multiplica el riesgo de infarto.', 'Nicotine speeds it up and raises blood pressure; over the years, tobacco narrows the arteries and greatly increases the risk of a heart attack.', "La nicotina l'accelera i puja la tensió; amb els anys, el tabac estreny les artèries i multiplica el risc d'infart."],
  'cerebro@humo': ['La nicotina llega en unos segundos y libera dopamina, que da sensación de placer: por eso el tabaco crea adicción.', 'Nicotine arrives within seconds and releases dopamine, which feels good: that is why tobacco is addictive.', 'La nicotina hi arriba en uns segons i allibera dopamina, que dona sensació de plaer: per això el tabac crea addicció.'],
};

// Paradas de una ruta cuyos sucesos se parecen: no salen como opción falsa la una de la otra.
export const NEAR = {
  esfuerzo: [['alveolos', 'capilares-alveolo'], ['corazon', 'aorta'], ['aorta', 'aorta-abdominal'], ['venas-pulmonares', 'capilares-alveolo'], ['cuadriceps', 'vena-femoral']],
  humo: [['faringe', 'laringe'], ['traquea', 'bronquios'], ['bronquios', 'bronquiolos'], ['bronquiolos', 'alveolos'], ['alveolos', 'capilares-alveolo']],
};
export const isNear = (routeId, a, b) => (NEAR[routeId] || []).some(([x, y]) => (x === a && y === b) || (x === b && y === a));

export const eventOf = (routeId, key) => EV[`${key}@${routeId}`] || EV[key];

// Paradas de una ruta en un nivel (y en las láminas disponibles).
export function trackFor(route, lv) {
  const tr = route.tracks.find((t) => lv >= t.lv[0] && lv <= t.lv[1]) || route.tracks[route.tracks.length - 1];
  const stops = tr.stops.filter((s) => (s.lv || 0) <= lv).map((s) => ({ k: s.k, plate: s.plate || tr.main, ...(s.must ? { must: true } : {}) }));
  return { main: tr.main, stops };
}
