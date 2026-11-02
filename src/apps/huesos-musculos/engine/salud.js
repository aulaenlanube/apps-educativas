// Educación Física y salud en Huesos y Músculos: lesiones deportivas, primeros
// auxilios y estiramientos. Textos [es, en, va].
//
// Primeros auxilios según las recomendaciones del European Resuscitation
// Council (ERC) de 2021: soporte vital básico del adulto (RCP 30:2, 100-120
// compresiones por minuto, 5-6 cm, centro del pecho, DEA en cuanto llegue, solo
// compresiones si no se sabe o no se quiere ventilar) y primeros auxilios
// (posición lateral de seguridad para quien no responde pero respira con
// normalidad, vigilando la respiración). Lesiones agudas: método PRICE (sin
// calor ni masaje los primeros días).

/* ───────── lesiones ───────── */

// care: qué hacer (CARE) · k: estructura del catálogo que se lesiona
// qs: «¿Qué … se lesiona?» { t: [pregunta], k: respuesta, wk: opciones falsas (curadas), lv? }
// taps: «Toca …» en una lámina { plate, k, t: [pregunta], lv? }
// desc: descripción sin el nombre («¿Qué lesión es?») · info: qué ocurre (explicación)
// near: lesiones con las que se puede confundir (no salen como opción falsa)
export const LESIONS = [
  {
    id: 'esguince-tobillo', lv: 4, type: 'esguince', care: 'price', k: 'ligamentos-tobillo',
    n: ['Esguince de tobillo', 'Ankle sprain', 'Esquinç de turmell'],
    desc: [
      'Al caer de un salto, el pie se tuerce hacia dentro; duele y se hincha la parte externa del tobillo.',
      'Landing from a jump, the foot twists inwards; the outer side of the ankle hurts and swells.',
      "En caure d'un bot, el peu es torç cap a dins; fa mal i s'inflama la part de fora del turmell.",
    ],
    info: [
      'Se estiran o se rompen los ligamentos del lado externo del tobillo, casi siempre el peroneoastragalino anterior. Es una de las lesiones más frecuentes del deporte.',
      'The ligaments on the outer side of the ankle are stretched or torn, nearly always the anterior talofibular ligament. It is one of the most common sports injuries.',
      "S'estiren o es trenquen els lligaments del costat extern del turmell, quasi sempre el peroneoastragalí anterior. És una de les lesions més freqüents de l'esport.",
    ],
    qs: [{
      t: ['¿Qué se lesiona en un esguince de tobillo?', 'What is injured in an ankle sprain?', 'Què es lesiona en un esquinç de turmell?'],
      k: 'ligamentos-tobillo', wk: ['tendon-aquiles', 'calcaneo', 'gemelos', 'menisco', 'tibial-anterior'],
    }],
    taps: [],
  },
  {
    id: 'rotura-lca', lv: 4, type: 'esguince', care: 'price', k: 'ligamento-cruzado-anterior',
    n: ['Rotura del ligamento cruzado anterior', 'Anterior cruciate ligament (ACL) tear', 'Ruptura del lligament encreuat anterior'],
    desc: [
      'Al girar con el pie clavado en el suelo se oye un chasquido, la rodilla se hincha enseguida y «se va», como si fallara.',
      'Twisting with the foot planted, there is a pop, the knee swells quickly and "gives way".',
      "En girar amb el peu clavat a terra se sent un espetec, el genoll s'inflama de seguida i «se'n va», com si fallara.",
    ],
    info: [
      'Se rompe el ligamento que impide que la tibia se vaya hacia delante. Es típica del fútbol, el baloncesto y el esquí; a menudo hay que operar y la recuperación dura muchos meses.',
      'The ligament that stops the tibia sliding forwards tears. It is typical in football, basketball and skiing; it often needs surgery and recovery takes many months.',
      "Es trenca el lligament que impedix que la tíbia se'n vaja cap avant. És típica del futbol, el bàsquet i l'esquí; sovint cal operar i la recuperació dura molts mesos.",
    ],
    qs: [{
      t: [
        '¿Qué ligamento se rompe al girar la rodilla con el pie clavado, con un chasquido y la rodilla que «se va»?',
        'Which ligament tears when you twist your knee with the foot planted, with a pop and the knee "giving way"?',
        "Quin lligament es trenca en girar el genoll amb el peu clavat, amb un espetec i el genoll que «se'n va»?",
      ],
      k: 'ligamento-cruzado-anterior', wk: ['ligamento-cruzado-posterior', 'ligamento-colateral-lateral', 'ligamentos-tobillo', 'tendon-rotuliano'],
    }],
    taps: [{
      plate: 'rodilla', k: 'ligamento-cruzado-anterior',
      t: ['Toca el ligamento que se rompe en la rotura del cruzado anterior', 'Tap the ligament that tears in an ACL injury', "Toca el lligament que es trenca en la ruptura de l'encreuat anterior"],
    }],
  },
  {
    id: 'esguince-rodilla', lv: 5, type: 'esguince', care: 'price', k: 'ligamento-colateral-medial',
    n: ['Esguince de rodilla (ligamento lateral interno)', 'Knee sprain (medial collateral ligament)', 'Esquinç de genoll (lligament lateral intern)'],
    desc: [
      'Una entrada por fuera empuja la rodilla hacia dentro y duele mucho por su cara interna.',
      'A tackle from the outside pushes the knee inwards, and the inner side of the knee really hurts.',
      'Una entrada per fora empeny el genoll cap a dins i fa molt de mal per la cara interna.',
    ],
    info: [
      'Se estira o se rompe el ligamento que sujeta la rodilla por dentro. Es el esguince de rodilla más frecuente y casi siempre se cura sin operar.',
      'The ligament that holds the knee on the inside is stretched or torn. It is the most common knee sprain and nearly always heals without surgery.',
      "S'estira o es trenca el lligament que subjecta el genoll per dins. És l'esquinç de genoll més freqüent i quasi sempre es cura sense operar.",
    ],
    qs: [{
      t: [
        'Si una entrada empuja la rodilla hacia dentro, ¿qué ligamento se estira?',
        'If a tackle pushes the knee inwards, which ligament is stretched?',
        "Si una entrada empeny el genoll cap a dins, quin lligament s'estira?",
      ],
      k: 'ligamento-colateral-medial', wk: ['ligamento-colateral-lateral', 'ligamentos-tobillo', 'tendon-rotuliano', 'tendon-cuadriceps', 'tendon-aquiles'],
    }],
    taps: [{
      plate: 'rodilla', k: 'ligamento-colateral-medial',
      t: [
        'Toca el ligamento que se lesiona cuando un golpe por fuera empuja la rodilla hacia dentro',
        'Tap the ligament injured when a blow from the outside pushes the knee inwards',
        'Toca el lligament que es lesiona quan un colp per fora empeny el genoll cap a dins',
      ],
    }],
    near: ['rotura-lca', 'menisco'],
  },
  {
    id: 'menisco', lv: 4, type: 'menisco', care: 'price', k: 'menisco-medial',
    n: ['Rotura de menisco', 'Torn meniscus', 'Ruptura de menisc'],
    desc: [
      'Tras girar con la rodilla doblada, duele en un lado de la rodilla y a veces se queda bloqueada sin poder estirarla del todo.',
      'After twisting with the knee bent, one side of the knee hurts and sometimes it locks and will not straighten fully.',
      'Després de girar amb el genoll doblegat, fa mal en un costat del genoll i a vegades es queda bloquejat sense poder estirar-lo del tot.',
    ],
    info: [
      'Se rompe uno de los cartílagos con forma de media luna que amortiguan la rodilla; el interno se lesiona más que el externo.',
      'One of the crescent-shaped cartilages that cushion the knee tears; the medial one is injured more often than the lateral one.',
      "Es trenca un dels cartílags amb forma de mitja lluna que esmorteïxen el genoll; l'intern es lesiona més que l'extern.",
    ],
    qs: [{
      t: ['¿Qué cartílago de la rodilla, con forma de C, se rompe más a menudo?', 'Which C-shaped cartilage in the knee tears most often?', 'Quin cartílag del genoll, amb forma de C, es trenca més sovint?'],
      k: 'menisco-medial', wk: ['menisco-lateral', 'cartilago-articular', 'ligamento-cruzado-posterior', 'tendon-cuadriceps'],
    }],
    taps: [{
      plate: 'rodilla', k: 'menisco-medial',
      t: ['Toca el menisco que se rompe con más frecuencia', 'Tap the meniscus that tears most often', 'Toca el menisc que es trenca més sovint'],
    }],
  },
  {
    id: 'rotura-isquios', lv: 4, type: 'rotura-fibrilar', care: 'price', k: 'isquiotibiales',
    n: ['Rotura fibrilar de los isquiotibiales', 'Hamstring strain (torn fibres)', 'Ruptura fibril·lar dels isquiotibials'],
    desc: [
      'En pleno sprint se nota un pinchazo repentino en la parte de atrás del muslo y hay que parar.',
      'In the middle of a sprint you feel a sudden sharp pain at the back of the thigh and have to stop.',
      'En ple esprint es nota una punxada sobtada a la part de darrere de la cuixa i cal parar.',
    ],
    info: [
      'Se rompen algunas fibras del músculo, a menudo al frenar la pierna al final de la zancada. Es típica del fútbol y del atletismo.',
      'Some of the muscle fibres tear, often while the leg is being slowed down at the end of the stride. It is typical in football and athletics.',
      "Es trenquen algunes fibres del múscul, sovint en frenar la cama al final de la gambada. És típica del futbol i de l'atletisme.",
    ],
    qs: [{
      t: [
        '¿Qué músculos se lesionan con un pinchazo en la parte de atrás del muslo al esprintar?',
        'Which muscles are injured with a sharp pain at the back of the thigh while sprinting?',
        'Quins músculs es lesionen amb una punxada a la part de darrere de la cuixa en esprintar?',
      ],
      k: 'isquiotibiales', wk: ['cuadriceps', 'gemelos', 'tibial-anterior', 'deltoides', 'pectoral', 'biceps'],
    }],
    taps: [{
      plate: 'mus-p', k: 'isquiotibiales',
      t: [
        'Toca los músculos que se lesionan con un pinchazo en la parte de atrás del muslo al esprintar',
        'Tap the muscles injured with a sharp pain at the back of the thigh while sprinting',
        'Toca els músculs que es lesionen amb una punxada a la part de darrere de la cuixa en esprintar',
      ],
    }],
  },
  {
    id: 'rotura-gemelo', lv: 5, type: 'rotura-fibrilar', care: 'price', k: 'gemelos',
    n: ['Rotura fibrilar del gemelo («pierna de tenista»)', 'Calf muscle tear ("tennis leg")', 'Ruptura fibril·lar del bessó («cama de tenista»)'],
    desc: [
      'Al arrancar o saltar se nota como una pedrada en el centro de la pantorrilla, y duele al ponerse de puntillas.',
      'Pushing off or jumping, it feels like being hit by a stone in the middle of the calf, and standing on tiptoe hurts.',
      'En arrancar o botar es nota com una pedrada al mig del panxell, i fa mal posar-se de puntetes.',
    ],
    info: [
      'Se rompen fibras del gemelo, casi siempre del gemelo interno, donde se une con el tendón. Es frecuente en el tenis y el pádel.',
      'Fibres of the calf muscle tear, nearly always in its medial head, where it joins the tendon. It is common in tennis and padel.',
      "Es trenquen fibres del bessó, quasi sempre del bessó intern, on s'unix amb el tendó. És freqüent en el tenis i el pàdel.",
    ],
    qs: [
      {
        t: ['¿Qué músculo se rompe en la «pierna de tenista»?', 'Which muscle tears in "tennis leg"?', 'Quin múscul es trenca en la «cama de tenista»?'],
        k: 'gemelos', wk: ['cuadriceps', 'tibial-anterior', 'biceps', 'deltoides', 'extensores-antebrazo'],
      },
      {
        lv: 6,
        t: ['¿Qué parte del gemelo se rompe casi siempre en la «pierna de tenista»?', 'Which part of the calf muscle nearly always tears in "tennis leg"?', 'Quina part del bessó es trenca quasi sempre en la «cama de tenista»?'],
        k: 'gemelo-interno', wk: ['gemelo-externo', 'popliteo', 'tibial-posterior', 'flexor-largo-dedos'],
      },
    ],
    taps: [
      {
        plate: 'mus-p', k: 'gemelos',
        t: ['Toca el músculo que se rompe en la «pierna de tenista»', 'Tap the muscle that tears in "tennis leg"', 'Toca el múscul que es trenca en la «cama de tenista»'],
      },
      {
        plate: 'mus-prof-p', k: 'gemelo-interno', lv: 6,
        t: ['Toca la parte del gemelo que se rompe en la «pierna de tenista»', 'Tap the part of the calf muscle that tears in "tennis leg"', 'Toca la part del bessó que es trenca en la «cama de tenista»'],
      },
    ],
    near: ['rotura-aquiles'],
  },
  {
    id: 'contractura', lv: 4, type: 'contractura', care: 'calor', k: null,
    n: ['Contractura muscular', 'Muscle knot (contracture)', 'Contractura muscular'],
    desc: [
      'Tras muchas horas con mala postura o un esfuerzo repetido, un músculo de la espalda se queda duro como un nudo y duele al moverse.',
      'After hours of bad posture or repeated effort, a back muscle stays hard like a knot and hurts when you move.',
      "Després de moltes hores amb mala postura o un esforç repetit, un múscul de l'esquena es queda dur com un nus i fa mal en moure's.",
    ],
    info: [
      'Una parte del músculo se queda contraída sin que lo queramos, durante días. Es frecuente en el cuello, la espalda y los gemelos.',
      'Part of the muscle stays contracted without us wanting it to, for days. It is common in the neck, the back and the calves.',
      "Una part del múscul es queda contreta sense que ho vulguem, durant dies. És freqüent al coll, l'esquena i els bessons.",
    ],
    qs: [],
    taps: [],
  },
  {
    id: 'calambre', lv: 4, type: 'calambre', care: 'estirar', k: 'gemelos',
    n: ['Calambre', 'Cramp', 'Rampa'],
    desc: [
      'Al final de un partido largo, el músculo de la pantorrilla se contrae de golpe, se pone duro y duele mucho durante unos segundos o minutos.',
      'At the end of a long match, the calf muscle suddenly tightens, goes hard and hurts a lot for a few seconds or minutes.',
      "Al final d'un partit llarg, el múscul del panxell es contrau de colp, es posa dur i fa molt de mal durant uns segons o minuts.",
    ],
    info: [
      'Es una contracción brusca, involuntaria y dolorosa que dura poco. Suele aparecer con el cansancio del músculo, sobre todo en los gemelos.',
      'It is a sudden, involuntary and painful contraction that does not last long. It usually comes with muscle tiredness, above all in the calves.',
      'És una contracció brusca, involuntària i dolorosa que dura poc. Sol aparéixer amb el cansament del múscul, sobretot als bessons.',
    ],
    qs: [{
      t: ['¿En qué músculos son más típicos los calambres al hacer deporte?', 'In which muscles are cramps most typical during sport?', 'En quins músculs són més típiques les rampes en fer esport?'],
      k: 'gemelos', wk: ['deltoides', 'pectoral', 'trapecio', 'biceps', 'triceps'],
    }],
    taps: [{
      plate: 'mus-p', k: 'gemelos',
      t: ['Toca los músculos donde más a menudo dan calambres al correr', 'Tap the muscles where cramps most often strike when running', 'Toca els músculs on més sovint apareixen rampes en córrer'],
    }],
  },
  {
    id: 'tendinitis-rotuliana', lv: 4, type: 'tendinitis', care: 'sobrecarga', k: 'tendon-rotuliano',
    n: ['Tendinitis rotuliana («rodilla del saltador»)', 'Patellar tendinitis ("jumper\'s knee")', 'Tendinitis rotuliana («genoll del saltador»)'],
    desc: [
      'Después de muchos entrenamientos de saltos duele justo debajo de la rótula, sobre todo al saltar y al bajar escaleras.',
      'After lots of jumping practice, it hurts just below the kneecap, above all when jumping and going downstairs.',
      'Després de molts entrenaments de bots fa mal just davall de la ròtula, sobretot en botar i en baixar escales.',
    ],
    info: [
      'El tendón que une la rótula con la tibia se irrita por sobrecarga. Es típica del baloncesto y el voleibol.',
      'The tendon joining the kneecap to the tibia becomes irritated through overuse. It is typical in basketball and volleyball.',
      "El tendó que unix la ròtula amb la tíbia s'irrita per sobrecàrrega. És típica del bàsquet i el voleibol.",
    ],
    qs: [{
      t: ['¿Qué se irrita en la «rodilla del saltador»?', 'What becomes irritated in "jumper\'s knee"?', "Què s'irrita en el «genoll del saltador»?"],
      k: 'tendon-rotuliano', wk: ['ligamento-cruzado-anterior', 'menisco-lateral', 'ligamento-colateral-lateral', 'tendon-aquiles', 'ligamentos-tobillo'],
    }],
    taps: [{
      plate: 'rodilla', k: 'tendon-rotuliano',
      t: ['Toca el tendón que se irrita en la «rodilla del saltador»', 'Tap the tendon that becomes irritated in "jumper\'s knee"', "Toca el tendó que s'irrita en el «genoll del saltador»"],
    }],
  },
  {
    id: 'tendinitis-aquilea', lv: 4, type: 'tendinitis', care: 'sobrecarga', k: 'tendon-aquiles',
    n: ['Tendinitis aquílea', 'Achilles tendinitis', 'Tendinitis aquil·liana'],
    desc: [
      'Un corredor que ha aumentado de golpe los kilómetros nota dolor y rigidez justo encima del talón, sobre todo por las mañanas.',
      'A runner who has suddenly increased their distance feels pain and stiffness just above the heel, above all in the morning.',
      'Un corredor que ha augmentat de colp els quilòmetres nota dolor i rigidesa just damunt del taló, sobretot als matins.',
    ],
    info: [
      'El tendón más fuerte del cuerpo se irrita por sobrecarga: correr mucho, en cuestas o con un calzado inadecuado.',
      'The strongest tendon in the body becomes irritated through overuse: running a lot, uphill or in the wrong shoes.',
      "El tendó més fort del cos s'irrita per sobrecàrrega: córrer molt, en costeres o amb un calçat inadequat.",
    ],
    qs: [{
      t: [
        '¿Qué tendón se irrita en los corredores que aumentan de golpe los kilómetros y notan dolor encima del talón?',
        'Which tendon becomes irritated in runners who suddenly increase their distance and feel pain above the heel?',
        "Quin tendó s'irrita en els corredors que augmenten de colp els quilòmetres i noten dolor damunt del taló?",
      ],
      k: 'tendon-aquiles', wk: ['tendon-rotuliano', 'tendon-cuadriceps', 'tendon-biceps', 'ligamentos-tobillo'],
    }],
    taps: [{
      plate: 'mus-p', k: 'tendon-aquiles',
      t: ['Toca el tendón que se irrita en la tendinitis aquílea', 'Tap the tendon that becomes irritated in Achilles tendinitis', "Toca el tendó que s'irrita en la tendinitis aquil·liana"],
    }],
  },
  {
    id: 'rotura-aquiles', lv: 4, type: 'rotura-tendon', care: 'inmovilizar', k: 'tendon-aquiles',
    n: ['Rotura del tendón de Aquiles', 'Achilles tendon rupture', "Ruptura del tendó d'Aquil·les"],
    desc: [
      'Al arrancar a correr se siente como una patada o una pedrada encima del talón, a veces con un chasquido, y ya no se puede poner de puntillas.',
      'Pushing off to run, it feels like a kick or a stone hitting just above the heel, sometimes with a snap, and you can no longer stand on tiptoe.',
      'En arrancar a córrer es nota com una puntada de peu o una pedrada damunt del taló, a vegades amb un espetec, i ja no es pot posar de puntetes.',
    ],
    info: [
      'El tendón se rompe del todo. Es más frecuente en adultos, en deportes con arrancadas y saltos como el pádel o el baloncesto; suele necesitar inmovilización o cirugía.',
      'The tendon tears completely. It is more common in adults, in sports with sudden starts and jumps like padel or basketball; it usually needs a cast or surgery.',
      "El tendó es trenca del tot. És més freqüent en adults, en esports amb arrancades i bots com el pàdel o el bàsquet; sol necessitar immobilització o cirurgia.",
    ],
    qs: [],
    taps: [{
      plate: 'mus-p', k: 'tendon-aquiles',
      t: [
        'Toca el tendón que se rompe si notas una pedrada encima del talón y ya no puedes ponerte de puntillas',
        'Tap the tendon that tears if you feel a stone hit above the heel and can no longer stand on tiptoe',
        'Toca el tendó que es trenca si notes una pedrada damunt del taló i ja no et pots posar de puntetes',
      ],
    }],
    near: ['rotura-gemelo'],
  },
  {
    id: 'fractura-muneca', lv: 4, type: 'fractura', care: 'inmovilizar', k: 'radio',
    n: ['Fractura de muñeca (del radio)', 'Broken wrist (radius fracture)', 'Fractura de canell (del radi)'],
    desc: [
      'Al caer y apoyar la mano estirada, la muñeca duele muchísimo, se deforma y no se puede mover.',
      'After falling onto an outstretched hand, the wrist hurts terribly, looks deformed and cannot be moved.',
      'En caure i recolzar la mà estirada, el canell fa moltíssim mal, es deforma i no es pot moure.',
    ],
    info: [
      'Se rompe el radio cerca de la muñeca. Es una de las fracturas más frecuentes en niños y jóvenes, por caídas en el patio, en bici o en patines.',
      'The radius breaks near the wrist. It is one of the most common fractures in children and teenagers, from falls in the playground, on a bike or on skates.',
      "Es trenca el radi prop del canell. És una de les fractures més freqüents en xiquets i joves, per caigudes al pati, amb bici o amb patins.",
    ],
    qs: [{
      t: ['Al caer sobre la mano estirada, ¿qué hueso se rompe con más frecuencia?', 'When you fall onto an outstretched hand, which bone breaks most often?', 'En caure sobre la mà estirada, quin os es trenca més sovint?'],
      k: 'radio', wk: ['femur', 'tibia', 'perone', 'costillas', 'rotula', 'mandibula'],
    }],
    taps: [{
      plate: 'esq-a', k: 'radio',
      t: ['Toca el hueso que más se rompe al caer sobre la mano estirada', 'Tap the bone that breaks most often when you fall onto an outstretched hand', "Toca l'os que més es trenca en caure sobre la mà estirada"],
    }],
  },
  {
    id: 'luxacion-hombro', lv: 4, type: 'luxacion', care: 'inmovilizar', k: 'humero',
    n: ['Luxación de hombro', 'Dislocated shoulder', "Luxació d'espatla"],
    desc: [
      'Tras una caída con el brazo separado y girado hacia fuera, el hombro queda «cuadrado», con un hueco, y no se puede mover.',
      'After a fall with the arm out to the side and turned outwards, the shoulder looks "squared off", with a hollow, and cannot be moved.',
      "Després d'una caiguda amb el braç separat i girat cap a fora, l'espatla queda «quadrada», amb un buit, i no es pot moure.",
    ],
    info: [
      'La cabeza del húmero se sale de la cavidad glenoidea, casi siempre hacia delante. Es la articulación que más se luxa; nunca hay que intentar recolocarla.',
      'The head of the humerus comes out of the glenoid cavity, nearly always forwards. It is the joint that dislocates most often; never try to put it back.',
      "El cap de l'húmer ix de la cavitat glenoïdal, quasi sempre cap avant. És l'articulació que més es luxa; no s'ha d'intentar mai recol·locar-la.",
    ],
    qs: [{
      t: ['En una luxación de hombro, ¿qué hueso se sale de su sitio?', 'In a dislocated shoulder, which bone comes out of place?', "En una luxació d'espatla, quin os ix del seu lloc?"],
      k: 'humero', wk: ['radio', 'cubito', 'esternon', 'costillas', 'femur'],
    }],
    taps: [
      {
        plate: 'hombro', k: 'humero',
        t: ['Toca el hueso que se sale de su sitio en una luxación de hombro', 'Tap the bone that comes out of place in a dislocated shoulder', "Toca l'os que ix del seu lloc en una luxació d'espatla"],
      },
      {
        plate: 'hombro', k: 'cavidad-glenoidea', lv: 5,
        t: ['Toca el hueco del que se sale el húmero en una luxación de hombro', 'Tap the socket the humerus comes out of in a dislocated shoulder', "Toca el buit del qual ix l'húmer en una luxació d'espatla"],
      },
      {
        plate: 'hombro', k: 'rodete-glenoideo', lv: 6,
        t: [
          'Toca el anillo de fibrocartílago que a menudo se arranca cuando se luxa el hombro',
          'Tap the ring of fibrocartilage that is often torn off when the shoulder dislocates',
          "Toca l'anell de fibrocartílag que sovint s'arranca quan es luxa l'espatla",
        ],
      },
    ],
  },
  {
    id: 'manguito', lv: 5, type: 'tendinitis', care: 'sobrecarga', k: 'supraespinoso',
    n: ['Lesión del manguito rotador', 'Rotator cuff injury', 'Lesió del manegot dels rotadors'],
    desc: [
      'Un nadador o un jugador de balonmano nota dolor en el hombro al levantar el brazo por encima de la cabeza y al lanzar.',
      'A swimmer or handball player feels shoulder pain when raising the arm above the head and when throwing.',
      "Un nadador o un jugador d'handbol nota dolor a l'espatla en alçar el braç per damunt del cap i en llançar.",
    ],
    info: [
      'Los tendones que sujetan el hombro se irritan o se rompen; el que más se lesiona es el del supraespinoso, que pasa por un túnel estrecho bajo el acromion.',
      'The tendons that hold the shoulder together become irritated or tear; the one injured most often is the supraspinatus tendon, which runs through a narrow tunnel under the acromion.',
      "Els tendons que subjecten l'espatla s'irriten o es trenquen; el que més es lesiona és el del supraespinós, que passa per un túnel estret davall de l'acromi.",
    ],
    qs: [{
      t: [
        '¿Qué músculo del manguito rotador tiene el tendón que más se lesiona?',
        'Which rotator cuff muscle has the tendon that is injured most often?',
        'Quin múscul del manegot dels rotadors té el tendó que més es lesiona?',
      ],
      k: 'supraespinoso', wk: ['subescapular', 'infraespinoso', 'redondo-menor'],
    }],
    taps: [
      {
        plate: 'hombro', k: 'supraespinoso',
        t: ['Toca el músculo del manguito rotador cuyo tendón se lesiona más a menudo', 'Tap the rotator cuff muscle whose tendon is injured most often', 'Toca el múscul del manegot dels rotadors el tendó del qual es lesiona més sovint'],
      },
      {
        plate: 'hombro', k: 'bursa-subacromial', lv: 6,
        t: ['Toca la bolsa que se inflama (bursitis) cuando se irrita el manguito rotador', 'Tap the sac that becomes inflamed (bursitis) when the rotator cuff is irritated', "Toca la bossa que s'inflama (bursitis) quan s'irrita el manegot dels rotadors"],
      },
    ],
  },
  {
    id: 'epicondilitis', lv: 5, type: 'tendinitis', care: 'sobrecarga', k: 'extensores-antebrazo',
    n: ['Epicondilitis («codo de tenista»)', 'Tennis elbow (lateral epicondylitis)', 'Epicondilitis («colze de tenista»)'],
    desc: [
      'Después de muchos reveses con la raqueta, duele la parte externa del codo al agarrar objetos o girar el pomo de una puerta.',
      'After lots of backhands with a racket, the outer side of the elbow hurts when gripping things or turning a door handle.',
      "Després de molts revessos amb la raqueta, fa mal la part externa del colze en agafar objectes o girar el pom d'una porta.",
    ],
    info: [
      'Se sobrecarga el tendón de los músculos que extienden la muñeca, donde se engancha en el epicóndilo del húmero. Aparece en el tenis, el pádel y en trabajos con movimientos repetidos.',
      'The tendon of the muscles that extend the wrist is overloaded where it attaches to the lateral epicondyle of the humerus. It appears in tennis, padel and in jobs with repeated movements.',
      "Se sobrecarrega el tendó dels músculs que estenen el canell, on s'enganxa a l'epicòndil de l'húmer. Apareix en el tenis, el pàdel i en treballs amb moviments repetits.",
    ],
    qs: [{
      t: ['¿Qué músculos se sobrecargan en el «codo de tenista»?', 'Which muscles are overloaded in "tennis elbow"?', 'Quins músculs se sobrecarreguen en el «colze de tenista»?'],
      k: 'extensores-antebrazo', wk: ['flexores-antebrazo', 'biceps', 'triceps', 'deltoides', 'pectoral'],
    }],
    taps: [{
      plate: 'mus-p', k: 'extensores-antebrazo',
      t: ['Toca los músculos que se sobrecargan en el «codo de tenista»', 'Tap the muscles that are overloaded in "tennis elbow"', 'Toca els músculs que se sobrecarreguen en el «colze de tenista»'],
    }],
  },
  {
    id: 'periostitis', lv: 5, type: 'sobrecarga', care: 'sobrecarga', k: 'periostio',
    n: ['Periostitis tibial', 'Shin splints', 'Periostitis tibial'],
    desc: [
      'Un corredor que entrena sobre asfalto nota dolor a lo largo del borde interno de la espinilla, que aumenta al correr.',
      'A runner who trains on tarmac feels pain along the inner edge of the shin, which gets worse when running.',
      'Un corredor que entrena sobre asfalt nota dolor al llarg de la vora interna de la canyella, que augmenta en córrer.',
    ],
    info: [
      'Se irrita la membrana que recubre la tibia (el periostio) por los impactos repetidos: correr mucho sobre suelo duro, aumentar de golpe el entrenamiento o usar zapatillas gastadas.',
      'The membrane covering the tibia (the periosteum) becomes irritated by repeated impacts: running a lot on hard ground, suddenly training more or wearing worn-out trainers.',
      "S'irrita la membrana que recobrix la tíbia (el periosti) pels impactes repetits: córrer molt sobre terra dur, augmentar de colp l'entrenament o portar sabatilles gastades.",
    ],
    qs: [{
      t: ['¿Qué parte del hueso se irrita en la periostitis tibial?', 'Which part of the bone becomes irritated in shin splints?', "Quina part de l'os s'irrita en la periostitis tibial?"],
      k: 'periostio', wk: ['medula-roja', 'medula-amarilla', 'cartilago-articular', 'cavidad-medular', 'epifisis'],
    }],
    taps: [{
      plate: 'hueso-largo', k: 'periostio',
      t: ['Toca la membrana del hueso que se irrita en la periostitis tibial', 'Tap the membrane of the bone that becomes irritated in shin splints', "Toca la membrana de l'os que s'irrita en la periostitis tibial"],
    }],
  },
  {
    id: 'fascitis', lv: 5, type: 'sobrecarga', care: 'sobrecarga', k: 'talon',
    n: ['Fascitis plantar', 'Plantar fasciitis', 'Fasciïtis plantar'],
    desc: [
      'Duele la planta del pie, bajo el talón, sobre todo al dar los primeros pasos al levantarse por la mañana.',
      'The sole of the foot hurts under the heel, above all with the first steps after getting up in the morning.',
      'Fa mal la planta del peu, davall del taló, sobretot en fer les primeres passes en alçar-se al matí.',
    ],
    info: [
      'Se irrita la fascia plantar, una banda fibrosa que va del calcáneo a los dedos y sostiene el arco del pie. Influyen correr mucho, el sobrepeso y el calzado sin amortiguación.',
      'The plantar fascia, a fibrous band that runs from the heel bone to the toes and supports the arch of the foot, becomes irritated. Running a lot, being overweight and shoes without cushioning all play a part.',
      "S'irrita la fàscia plantar, una banda fibrosa que va del calcani als dits i sosté l'arc del peu. Hi influïxen córrer molt, el sobrepés i el calçat sense esmorteïment.",
    ],
    qs: [{
      t: ['¿Dónde duele la fascitis plantar?', 'Where does plantar fasciitis hurt?', 'On fa mal la fasciïtis plantar?'],
      k: 'talon', wk: ['rodilla', 'pantorrilla', 'muneca', 'codo', 'hombro'],
    }],
    taps: [{
      plate: 'pie', k: 'calcaneo',
      t: ['Toca el hueso del talón donde se engancha la fascia plantar', 'Tap the heel bone where the plantar fascia is attached', "Toca l'os del taló on s'enganxa la fàscia plantar"],
    }],
  },
];
export const LESION_BY_ID = Object.fromEntries(LESIONS.map((l) => [l.id, l]));

/* ───────── qué hacer ───────── */

// r: lo que hay que hacer · w: acciones equivocadas (W) que salen como opción falsa
const W = {
  play: ['Seguir jugando para que se «caliente» y deje de doler', 'Keep playing so it "warms up" and stops hurting', "Continuar jugant perquè «s'escalfe» i deixe de fer mal"],
  more: ['Entrenar más y más fuerte para que el cuerpo se acostumbre cuanto antes', 'Train more and harder so the body gets used to it sooner', "Entrenar més i més fort perquè el cos s'acostume com més prompte millor"],
  reset: ['Tirar con fuerza para colocar el hueso o la articulación en su sitio', 'Pull hard to put the bone or joint back in place', "Estirar amb força per a col·locar l'os o l'articulació al seu lloc"],
  ice: ['Poner hielo directamente sobre la piel durante una hora', 'Put ice straight on the skin for an hour', 'Posar gel directament sobre la pell durant una hora'],
  bounce: ['Estirar con rebotes hasta que deje de doler', 'Stretch with bouncing until it stops hurting', 'Estirar amb rebots fins que deixe de fer mal'],
  heat: ['Calor y un masaje fuerte enseguida para que baje la hinchazón', 'Heat and a hard massage straight away to bring the swelling down', 'Calor i un massatge fort de seguida perquè baixe la inflor'],
  move: ['Moverla mucho para comprobar si está rota', 'Move it a lot to check whether it is broken', 'Moure-la molt per a comprovar si està trencada'],
};
export const CARE = {
  price: {
    r: ['Parar y aplicar PRICE: proteger, reposo, hielo con un paño, compresión y elevación', 'Stop and use PRICE: protection, rest, ice wrapped in a cloth, compression and elevation', 'Parar i aplicar PRICE: protecció, repòs, gel embolicat amb un drap, compressió i elevació'],
    w: ['play', 'ice', 'bounce', 'heat', 'reset'],
  },
  inmovilizar: {
    r: ['No moverla ni intentar recolocarla: inmovilizarla tal como está e ir a urgencias', 'Do not move it or try to put it back: keep it still just as it is and go to A&E', 'No moure-la ni intentar recol·locar-la: immobilitzar-la tal com està i anar a urgències'],
    w: ['play', 'reset', 'heat', 'move', 'ice'],
  },
  estirar: {
    r: ['Parar y estirar el músculo suavemente hasta que se pase; después, beber agua', 'Stop and gently stretch the muscle until it passes; then drink some water', 'Parar i estirar el múscul suaument fins que passe; després, beure aigua'],
    w: ['play', 'reset', 'ice', 'bounce'],
  },
  calor: {
    r: ['Calor suave, masaje y estiramientos suaves, y descansar del esfuerzo que la causó', 'Gentle heat, massage and gentle stretches, and a rest from the effort that caused it', "Calor suau, massatge i estiraments suaus, i descansar de l'esforç que la va causar"],
    w: ['more', 'reset', 'ice', 'bounce'],
  },
  sobrecarga: {
    r: ['Reducir el ejercicio que la provoca, frío después de la actividad y consultar a un médico o fisioterapeuta', 'Cut down the exercise that causes it, use cold after activity and see a doctor or physiotherapist', "Reduir l'exercici que la provoca, fred després de l'activitat i consultar un metge o fisioterapeuta"],
    w: ['more', 'reset', 'ice', 'bounce'],
  },
};
export const careWrong = (care) => CARE[care].w.map((id) => ({ id, t: W[id] }));

/* ───────── tipos de lesión ───────── */

// a: con artículo («¿Qué es un esguince?») · d: definición
export const INJURY_TYPES = [
  { id: 'esguince', n: ['Esguince', 'Sprain', 'Esquinç'], a: ['un esguince', 'a sprain', 'un esquinç'], d: ['Un ligamento se estira demasiado o se rompe', 'A ligament is overstretched or torn', "Un lligament s'estira massa o es trenca"] },
  { id: 'rotura-fibrilar', n: ['Rotura fibrilar', 'Muscle strain (torn fibres)', 'Ruptura fibril·lar'], a: ['una rotura fibrilar', 'a muscle strain', 'una ruptura fibril·lar'], d: ['Se rompen fibras de un músculo', 'Fibres in a muscle tear', "Es trenquen fibres d'un múscul"] },
  { id: 'contractura', n: ['Contractura', 'Muscle knot (contracture)', 'Contractura'], a: ['una contractura', 'a muscle knot', 'una contractura'], d: ['Un músculo se queda contraído y dolorido durante días', 'A muscle stays tight and sore for days', 'Un múscul es queda contret i adolorit durant dies'] },
  { id: 'calambre', n: ['Calambre', 'Cramp', 'Rampa'], a: ['un calambre', 'a cramp', 'una rampa'], d: ['Un músculo se contrae de golpe, sin querer, y duele un rato corto', 'A muscle suddenly tightens without warning and hurts for a short while', 'Un múscul es contrau de colp, sense voler, i fa mal una estona curta'] },
  { id: 'tendinitis', n: ['Tendinitis', 'Tendinitis', 'Tendinitis'], a: ['una tendinitis', 'tendinitis', 'una tendinitis'], d: ['Un tendón se irrita por sobrecarga', 'A tendon becomes irritated through overuse', "Un tendó s'irrita per sobrecàrrega"] },
  { id: 'fractura', n: ['Fractura', 'Fracture', 'Fractura'], a: ['una fractura', 'a fracture', 'una fractura'], d: ['Se rompe un hueso', 'A bone breaks', 'Es trenca un os'] },
  { id: 'luxacion', n: ['Luxación', 'Dislocation', 'Luxació'], a: ['una luxación', 'a dislocation', 'una luxació'], d: ['Un hueso se sale de su articulación', 'A bone comes out of its joint', "Un os ix de la seua articulació"] },
];

// Grados de un esguince (Bachillerato)
export const SPRAIN_GRADES = [
  { id: 'I', d: ['El ligamento se estira, sin llegar a romperse', 'The ligament is stretched but not torn', "El lligament s'estira, sense arribar a trencar-se"] },
  { id: 'II', d: ['Se rompe una parte de las fibras del ligamento', 'Some of the fibres of the ligament tear', 'Es trenca una part de les fibres del lligament'] },
  { id: 'III', d: ['El ligamento se rompe del todo', 'The ligament tears completely', 'El lligament es trenca del tot'] },
];
export const SPRAIN_WRONG = ['Se rompe el hueso que está al lado del ligamento', 'The bone next to the ligament breaks', "Es trenca l'os que està al costat del lligament"];

/* ───────── primeros auxilios ───────── */

// m: qué se hace (sin la palabra clave, para que no se adivine por la inicial)
export const PRICE_LETTERS = [
  { l: 'P', m: ['Evitar nuevos golpes o daños en la zona', 'Keep the area safe from further harm', 'Evitar nous colps o danys a la zona'] },
  { l: 'R', m: ['Dejar la actividad y descansar', 'Stop the activity and take a break', "Deixar l'activitat i descansar"] },
  { l: 'I', m: ['Poner frío, con hielo envuelto en un paño', 'Cool it with a cold pack wrapped in a cloth', 'Posar fred, amb gel embolicat amb un drap'] },
  { l: 'C', m: ['Poner un vendaje que sujete sin apretar demasiado', 'Put on a bandage that is firm but not too tight', 'Posar un embenat que subjecte sense estrényer massa'] },
  { l: 'E', m: ['Levantar la zona por encima del corazón', 'Raise the area above the level of the heart', 'Alçar la zona per damunt del cor'] },
];
export const PRICE_X = [
  'PRICE: Protección, Reposo (Rest), Hielo (Ice), Compresión y Elevación.',
  'PRICE: Protection, Rest, Ice, Compression and Elevation.',
  'PRICE: Protecció, Repòs (Rest), Gel (Ice), Compressió i Elevació.',
];

export const PAS_LETTERS = [
  { l: 'P', m: ['Comprobar que no hay peligro para ti ni para la víctima', 'Make sure there is no danger to you or the casualty', 'Comprovar que no hi ha perill per a tu ni per a la víctima'] },
  { l: 'A', m: ['Llamar al 112 y explicar qué pasa y dónde', 'Call 112 and say what has happened and where', 'Telefonar al 112 i explicar què passa i on'] },
  { l: 'S', m: ['Ayudar a la víctima con los primeros auxilios', 'Help the casualty with first aid', 'Ajudar la víctima amb els primers auxilis'] },
];
export const PAS_X = [
  'PAS: Proteger, Avisar (al 112) y Socorrer, siempre en este orden.',
  'PAS: Protect, Alert (call 112) and Succour, always in this order.',
  'PAS: Protegir, Avisar (el 112) i Socórrer, sempre en aquest ordre.',
];
export const PAS_WRONG = [
  ['Mover a la víctima enseguida, aunque no haya peligro', 'Move the casualty straight away, even if there is no danger', 'Moure la víctima de seguida, encara que no hi haja perill'],
  ['Darle agua o comida para que se recupere', 'Give them food or water so they recover', 'Donar-li aigua o menjar perquè es recupere'],
  ['Hacer fotos para enseñárselas al médico', 'Take photos to show the doctor', 'Fer fotos per a ensenyar-les al metge'],
];

// Preguntas de primeros auxilios: topic (escena), lv, p (pregunta), r (respuesta), w (falsas), x (explicación)
export const AID = [
  /* PRICE */
  {
    id: 'hielo', topic: 'price', lv: 4,
    p: ['¿Cómo se pone el hielo en una lesión?', 'How should you put ice on an injury?', 'Com es posa el gel en una lesió?'],
    r: ['Envuelto en un paño, hasta 20 minutos, varias veces al día', 'Wrapped in a cloth, for up to 20 minutes, several times a day', 'Embolicat amb un drap, fins a 20 minuts, diverses vegades al dia'],
    w: [
      ['Directamente sobre la piel, cuanto más rato mejor', 'Straight onto the skin, the longer the better', 'Directament sobre la pell, com més estona millor'],
      ['Solo una vez, durante toda la noche', 'Just once, all night long', 'Només una vegada, durant tota la nit'],
      ['Nunca: siempre es mejor el calor', 'Never: heat is always better', 'Mai: sempre és millor la calor'],
    ],
    x: ['El hielo directo sobre la piel puede quemarla por el frío.', 'Ice straight on the skin can cause a cold burn.', 'El gel directe sobre la pell la pot cremar pel fred.'],
  },
  {
    id: 'no-calor', topic: 'price', lv: 4,
    p: [
      'En las primeras 48-72 horas tras un esguince o una rotura de fibras, ¿qué NO se debe hacer?',
      'In the first 48-72 hours after a sprain or a muscle strain, what should you NOT do?',
      "En les primeres 48-72 hores després d'un esquinç o una ruptura de fibres, què NO s'ha de fer?",
    ],
    r: ['Poner calor o dar masajes en la zona', 'Put heat on the area or massage it', 'Posar calor o fer massatges a la zona'],
    w: [
      ['Poner hielo envuelto en un paño', 'Put on ice wrapped in a cloth', 'Posar gel embolicat amb un drap'],
      ['Mantener la zona elevada', 'Keep the area raised', 'Mantindre la zona elevada'],
      ['Hacer reposo', 'Rest', 'Fer repòs'],
      ['Poner un vendaje que comprima sin apretar demasiado', 'Use a firm bandage that is not too tight', 'Posar un embenat que comprimisca sense estrényer massa'],
    ],
    x: ['El calor y el masaje aumentan la hinchazón y el sangrado en los primeros días.', 'Heat and massage make the swelling and bleeding worse in the first few days.', 'La calor i el massatge augmenten la inflor i el sagnat els primers dies.'],
  },
  {
    id: 'venda-apretada', topic: 'price', lv: 4,
    p: [
      'Después de vendar un tobillo, los dedos se ponen fríos, pálidos y hormiguean. ¿Qué haces?',
      'After bandaging an ankle, the toes go cold and pale and start tingling. What do you do?',
      "Després d'embenar un turmell, els dits es posen freds i pàl·lids i hi notes formigueig. Què fas?",
    ],
    r: ['Aflojar el vendaje: está demasiado apretado', 'Loosen the bandage: it is too tight', "Afluixar l'embenat: està massa estret"],
    w: [
      ['Apretarlo más para que no se mueva', 'Tighten it more so it does not move', 'Estrényer-lo més perquè no es moga'],
      ['Poner hielo encima de los dedos', 'Put ice on the toes', 'Posar gel damunt dels dits'],
      ['Nada: es lo normal', 'Nothing: that is normal', 'Res: és el normal'],
    ],
  },
  {
    id: 'volver-mover', topic: 'price', lv: 5,
    p: ['Pasados los primeros días de un esguince leve, ¿qué ayuda a recuperarse?', 'Once the first few days of a mild sprain have passed, what helps recovery?', "Passats els primers dies d'un esquinç lleu, què ajuda a recuperar-se?"],
    r: ['Volver a moverse y a apoyar poco a poco, sin que duela mucho', 'Gradually moving and putting weight on it again, without much pain', 'Tornar a moure\'s i a recolzar a poc a poc, sense que faça molt de mal'],
    w: [
      ['Tenerlo inmovilizado varias semanas aunque ya no duela', 'Keeping it immobilised for weeks even when it no longer hurts', 'Tindre\'l immobilitzat diverses setmanes encara que ja no faça mal'],
      ['Poner hielo todo el día durante semanas', 'Using ice all day for weeks', 'Posar gel tot el dia durant setmanes'],
      ['Volver a competir a tope enseguida', 'Going straight back to full competition', 'Tornar a competir a fons de seguida'],
    ],
    x: ['El movimiento y la carga progresivos ayudan a que el ligamento se cure fuerte y evitan recaídas.', 'Gradual movement and loading help the ligament heal strongly and prevent it happening again.', "El moviment i la càrrega progressius ajuden que el lligament es cure fort i eviten recaigudes."],
  },
  /* PAS */
  {
    id: 'pas-orden', topic: 'pas', lv: 4,
    p: ['¿En qué orden se aplica la conducta PAS?', 'In what order do you follow PAS?', 'En quin ordre s\'aplica la conducta PAS?'],
    r: ['Proteger → Avisar → Socorrer', 'Protect → Alert → Succour', 'Protegir → Avisar → Socórrer'],
    w: [
      ['Socorrer → Avisar → Proteger', 'Succour → Alert → Protect', 'Socórrer → Avisar → Protegir'],
      ['Avisar → Socorrer → Proteger', 'Alert → Succour → Protect', 'Avisar → Socórrer → Protegir'],
      ['Socorrer → Proteger → Avisar', 'Succour → Protect → Alert', 'Socórrer → Protegir → Avisar'],
    ],
    x: ['Primero te aseguras de que no hay peligro, luego avisas al 112 y después ayudas a la víctima.', 'First make sure there is no danger, then call 112 and then help the casualty.', 'Primer t\'assegures que no hi ha perill, després avises el 112 i després ajudes la víctima.'],
  },
  /* RCP (ERC 2021) */
  {
    id: 'rcp-cuando', topic: 'rcp', lv: 4,
    p: ['¿Cuándo hay que empezar la RCP?', 'When should you start CPR?', 'Quan cal començar la RCP?'],
    r: ['Si la persona no responde y no respira con normalidad', 'If the person does not respond and is not breathing normally', 'Si la persona no respon i no respira amb normalitat'],
    w: [
      ['Si está consciente pero se ha mareado', 'If they are conscious but feel dizzy', "Si està conscient però s'ha marejat"],
      ['Si no responde pero respira con normalidad', 'If they do not respond but are breathing normally', 'Si no respon però respira amb normalitat'],
      ['Si tiene una herida que sangra', 'If they have a bleeding wound', 'Si té una ferida que sagna'],
    ],
    x: ['Las boqueadas o jadeos sueltos no son una respiración normal: también hay que empezar la RCP.', 'Occasional gasps are not normal breathing: you should start CPR then too.', 'Les boquejades o panteixos solts no són una respiració normal: també cal començar la RCP.'],
  },
  {
    id: 'rcp-ritmo-30-2', topic: 'rcp', lv: 4,
    p: ['En la RCP de un adulto, ¿cuántas compresiones y cuántas insuflaciones se alternan?', 'In adult CPR, how many compressions and how many rescue breaths do you alternate?', "En la RCP d'un adult, quantes compressions i quantes insuflacions s'alternen?"],
    r: ['30 compresiones y 2 insuflaciones', '30 compressions and 2 rescue breaths', '30 compressions i 2 insuflacions'],
    w: [
      ['15 compresiones y 2 insuflaciones', '15 compressions and 2 rescue breaths', '15 compressions i 2 insuflacions'],
      ['5 compresiones y 1 insuflación', '5 compressions and 1 rescue breath', '5 compressions i 1 insuflació'],
      ['2 compresiones y 30 insuflaciones', '2 compressions and 30 rescue breaths', '2 compressions i 30 insuflacions'],
    ],
    x: ['Es lo que recomienda el European Resuscitation Council (2021).', 'This is what the European Resuscitation Council recommends (2021).', 'És el que recomana el European Resuscitation Council (2021).'],
  },
  {
    id: 'rcp-frecuencia', topic: 'rcp', lv: 4,
    p: ['¿A qué ritmo se hacen las compresiones de la RCP?', 'How fast should CPR chest compressions be?', 'A quin ritme es fan les compressions de la RCP?'],
    r: ['De 100 a 120 por minuto', '100 to 120 a minute', 'De 100 a 120 per minut'],
    w: [
      ['De 30 a 40 por minuto', '30 to 40 a minute', 'De 30 a 40 per minut'],
      ['De 60 a 70 por minuto', '60 to 70 a minute', 'De 60 a 70 per minut'],
      ['Más de 200 por minuto', 'More than 200 a minute', 'Més de 200 per minut'],
    ],
    x: ['Casi dos por segundo: ayuda seguir el ritmo de una canción como «La Macarena» o «Stayin’ Alive».', 'Almost two a second: it helps to follow the beat of a song like "Stayin’ Alive".', 'Quasi dues per segon: ajuda seguir el ritme d\'una cançó com «La Macarena» o «Stayin’ Alive».'],
  },
  {
    id: 'rcp-profundidad', topic: 'rcp', lv: 4,
    p: ['¿Cuánto hay que hundir el pecho de un adulto en cada compresión?', 'How deep should each compression push an adult\'s chest?', "Quant cal enfonsar el pit d'un adult en cada compressió?"],
    r: ['Entre 5 y 6 centímetros', 'Between 5 and 6 centimetres', 'Entre 5 i 6 centímetres'],
    w: [
      ['1 o 2 centímetros', '1 or 2 centimetres', '1 o 2 centímetres'],
      ['Unos 10 centímetros', 'About 10 centimetres', 'Uns 10 centímetres'],
      ['Lo justo para tocarlo', 'Just enough to touch it', 'Només el just per a tocar-lo'],
    ],
    x: ['Y hay que dejar que el pecho vuelva a subir del todo entre una compresión y la siguiente.', 'And let the chest come all the way back up between compressions.', 'I cal deixar que el pit torne a pujar del tot entre una compressió i la següent.'],
  },
  {
    id: 'rcp-manos', topic: 'injury', lv: 4, // (la escena de RCP daría la respuesta)
    p: ['¿Dónde se ponen las manos para hacer las compresiones?', 'Where do you put your hands for chest compressions?', 'On es posen les mans per a fer les compressions?'],
    r: ['En el centro del pecho, sobre la mitad inferior del esternón', 'In the centre of the chest, on the lower half of the breastbone', "Al centre del pit, sobre la meitat inferior de l'estèrnum"],
    w: [
      ['Sobre el estómago', 'On the stomach', "Sobre l'estómac"],
      ['En el lado izquierdo, encima del corazón', 'On the left side, over the heart', "Al costat esquerre, damunt del cor"],
      ['En el cuello', 'On the neck', 'Al coll'],
    ],
    x: ['Con los brazos estirados y los hombros justo encima de las manos.', 'With your arms straight and your shoulders right above your hands.', 'Amb els braços estirats i les espatles just damunt de les mans.'],
  },
  {
    id: 'rcp-solo-compresiones', topic: 'rcp', lv: 4,
    p: ['Si no sabes o no quieres hacer las insuflaciones, ¿qué haces?', 'If you cannot or do not want to give rescue breaths, what do you do?', 'Si no saps o no vols fer les insuflacions, què fas?'],
    r: ['Solo compresiones, sin parar, hasta que llegue ayuda', 'Chest compressions only, without stopping, until help arrives', "Només compressions, sense parar, fins que arribe ajuda"],
    w: [
      ['Nada: sin insuflaciones la RCP no sirve', 'Nothing: CPR is useless without rescue breaths', 'Res: sense insuflacions la RCP no servix'],
      ['Esperar a la ambulancia sin tocar a la persona', 'Wait for the ambulance without touching the person', "Esperar l'ambulància sense tocar la persona"],
      ['Ponerla en posición lateral de seguridad', 'Put them in the recovery position', 'Posar-la en posició lateral de seguretat'],
    ],
    x: ['La RCP solo con compresiones también salva vidas.', 'Compression-only CPR also saves lives.', 'La RCP només amb compressions també salva vides.'],
  },
  {
    id: 'dea-cuando', topic: 'dea', lv: 4,
    p: ['Durante una RCP, ¿cuándo se usa el desfibrilador (DEA)?', 'During CPR, when do you use the defibrillator (AED)?', 'Durant una RCP, quan s\'usa el desfibril·lador (DEA)?'],
    r: ['En cuanto llega: se enciende y se siguen sus instrucciones', 'As soon as it arrives: switch it on and follow its instructions', 'Tan prompte com arriba: s\'encén i se seguixen les seues instruccions'],
    w: [
      ['Solo si lo usa un médico', 'Only if a doctor uses it', 'Només si l\'usa un metge'],
      ['Después de 30 minutos de RCP', 'After 30 minutes of CPR', 'Després de 30 minuts de RCP'],
      ['Solo si la persona respira con normalidad', 'Only if the person is breathing normally', 'Només si la persona respira amb normalitat'],
    ],
    x: ['Cualquier persona puede usarlo: analiza el corazón y solo da una descarga si hace falta.', 'Anyone can use it: it checks the heart and only gives a shock if one is needed.', 'Qualsevol persona el pot usar: analitza el cor i només fa una descàrrega si cal.'],
  },
  {
    id: 'dea-no-tocar', topic: 'dea', lv: 5,
    p: ['Mientras el DEA analiza el corazón o da la descarga, ¿qué hay que hacer?', 'While the AED is checking the heart or giving a shock, what must you do?', 'Mentre el DEA analitza el cor o fa la descàrrega, què cal fer?'],
    r: ['Que nadie toque a la persona', 'Make sure nobody touches the person', 'Que ningú toque la persona'],
    w: [
      ['Seguir con las compresiones', 'Carry on with compressions', 'Continuar amb les compressions'],
      ['Sujetarle la cabeza', 'Hold their head', 'Subjectar-li el cap'],
      ['Darle agua', 'Give them some water', 'Donar-li aigua'],
    ],
    x: ['Después, el propio DEA indica cuándo seguir con la RCP.', 'Afterwards, the AED itself tells you when to carry on with CPR.', 'Després, el mateix DEA indica quan continuar amb la RCP.'],
  },
  {
    id: 'rcp-solo', topic: 'rcp', lv: 5,
    p: ['Si estás solo con una persona que no responde y no respira, ¿qué haces primero?', 'If you are alone with someone who does not respond and is not breathing, what do you do first?', 'Si estàs a soles amb una persona que no respon i no respira, què fas primer?'],
    r: ['Llamar al 112 con el altavoz activado y empezar la RCP', 'Call 112 with the speaker on and start CPR', 'Telefonar al 112 amb l\'altaveu activat i començar la RCP'],
    w: [
      ['Ir a buscar ayuda y dejarla sola un buen rato', 'Go and look for help and leave them alone for a long time', 'Anar a buscar ajuda i deixar-la sola una bona estona'],
      ['Esperar a ver si se despierta', 'Wait and see if they wake up', 'Esperar a veure si es desperta'],
      ['Ponerla en posición lateral de seguridad', 'Put them in the recovery position', 'Posar-la en posició lateral de seguretat'],
    ],
    x: ['Desde el 112 te guiarán mientras haces las compresiones.', 'The 112 operator will guide you while you do the compressions.', 'Des del 112 et guiaran mentre fas les compressions.'],
  },
  {
    id: 'rcp-hasta', topic: 'rcp', lv: 5,
    p: ['¿Hasta cuándo se sigue haciendo la RCP?', 'How long do you keep doing CPR?', 'Fins quan es continua fent la RCP?'],
    r: ['Hasta que llegue ayuda profesional, la persona dé señales de vida o estés agotado', 'Until professional help arrives, the person shows signs of life or you are exhausted', "Fins que arribe ajuda professional, la persona done senyals de vida o estigues esgotat"],
    w: [
      ['Solo durante un minuto', 'For just one minute', 'Només durant un minut'],
      ['Hasta hacer 30 compresiones', 'Until you have done 30 compressions', 'Fins a fer 30 compressions'],
      ['Hasta que la persona se ponga pálida', 'Until the person turns pale', 'Fins que la persona es pose pàl·lida'],
    ],
    x: ['Señales de vida: se despierta, se mueve, abre los ojos o respira con normalidad.', 'Signs of life: they wake up, move, open their eyes or breathe normally.', 'Senyals de vida: es desperta, es mou, obri els ulls o respira amb normalitat.'],
  },
  {
    id: 'cadena', topic: 'rcp', lv: 6,
    p: ['¿Cuál es el primer eslabón de la cadena de supervivencia?', 'What is the first link in the chain of survival?', 'Quina és la primera baula de la cadena de supervivència?'],
    r: ['Reconocer la emergencia y llamar al 112', 'Recognising the emergency and calling 112', "Reconéixer l'emergència i telefonar al 112"],
    w: [
      ['Usar el desfibrilador', 'Using the defibrillator', 'Usar el desfibril·lador'],
      ['Los cuidados en el hospital', 'Care in hospital', "Les cures a l'hospital"],
      ['Hacer la RCP', 'Doing CPR', 'Fer la RCP'],
    ],
    x: ['Después vienen la RCP precoz, la desfibrilación precoz y los cuidados tras la reanimación.', 'Then come early CPR, early defibrillation and care after resuscitation.', 'Després vénen la RCP precoç, la desfibril·lació precoç i les cures després de la reanimació.'],
  },
  {
    id: 'rcp-para-que', topic: 'rcp', lv: 6,
    p: ['¿Para qué sirven las compresiones torácicas?', 'What are chest compressions for?', 'Per a què servixen les compressions toràciques?'],
    r: ['Para que la sangre con oxígeno siga llegando al cerebro y al corazón', 'To keep oxygen-rich blood flowing to the brain and heart', 'Perquè la sang amb oxigen continue arribant al cervell i al cor'],
    w: [
      ['Para que el corazón vuelva a latir solo enseguida', 'To make the heart start beating by itself straight away', 'Perquè el cor torne a bategar a soles de seguida'],
      ['Para sacar el agua de los pulmones', 'To get water out of the lungs', "Per a traure l'aigua dels pulmons"],
      ['Para que la persona se despierte del susto', 'To give the person a fright so they wake up', "Perquè la persona es desperte de l'esglai"],
    ],
    x: ['El que puede hacer que el corazón recupere su ritmo es la descarga del desfibrilador.', 'What can get the heart back into rhythm is the shock from the defibrillator.', 'El que pot fer que el cor recupere el seu ritme és la descàrrega del desfibril·lador.'],
  },
  {
    id: 'rcp-relevo', topic: 'rcp', lv: 6,
    p: ['Si dos personas hacen la RCP, ¿cada cuánto conviene cambiarse?', 'If two people are doing CPR, how often should they swap?', 'Si dues persones fan la RCP, cada quant convé canviar-se?'],
    r: ['Cada 2 minutos, más o menos, para no cansarse', 'About every 2 minutes, so they do not get tired', 'Cada 2 minuts, més o menys, per a no cansar-se'],
    w: [
      ['Cada 30 segundos', 'Every 30 seconds', 'Cada 30 segons'],
      ['Cada 15 minutos', 'Every 15 minutes', 'Cada 15 minuts'],
      ['Nunca: siempre la misma persona', 'Never: always the same person', 'Mai: sempre la mateixa persona'],
    ],
    x: ['Las compresiones cansadas son menos profundas; el cambio debe ser rápido, sin parar casi nada.', 'Tired compressions are shallower; the swap should be quick, with hardly any pause.', 'Les compressions cansades són menys profundes; el canvi ha de ser ràpid, quasi sense parar.'],
  },
  /* Posición lateral de seguridad */
  {
    id: 'pls-quien', topic: 'pls', lv: 4,
    p: ['¿A quién se pone en la posición lateral de seguridad?', 'Who should be put in the recovery position?', 'A qui es posa en la posició lateral de seguretat?'],
    r: ['A una persona que no responde pero respira con normalidad', 'Someone who does not respond but is breathing normally', 'A una persona que no respon però respira amb normalitat'],
    w: [
      ['A una persona que no respira', 'Someone who is not breathing', 'A una persona que no respira'],
      ['A una persona consciente con un esguince', 'A conscious person with a sprain', 'A una persona conscient amb un esquinç'],
      ['A alguien que tiene un calambre', 'Someone who has a cramp', 'A algú que té una rampa'],
    ],
    x: ['Si no respira con normalidad, no se pone de lado: hay que empezar la RCP.', 'If they are not breathing normally, do not turn them on their side: start CPR.', 'Si no respira amb normalitat, no es posa de costat: cal començar la RCP.'],
  },
  {
    id: 'pls-para-que', topic: 'pls', lv: 4,
    p: ['¿Para qué sirve la posición lateral de seguridad?', 'What is the recovery position for?', 'Per a què servix la posició lateral de seguretat?'],
    r: ['Para que la vía respiratoria siga abierta y, si vomita, no se ahogue', 'To keep the airway open and stop them choking if they are sick', 'Perquè la via respiratòria continue oberta i, si vomita, no s\'ofegue'],
    w: [
      ['Para que la sangre llegue mejor a las piernas', 'To get more blood to the legs', 'Perquè la sang arribe millor a les cames'],
      ['Para que se despierte antes', 'To make them wake up sooner', 'Perquè es desperte abans'],
      ['Para poder hacerle la RCP', 'So you can do CPR', 'Per a poder fer-li la RCP'],
    ],
  },
  {
    id: 'pls-despues', topic: 'pls', lv: 4,
    p: ['Ya has puesto a la persona en posición lateral de seguridad. ¿Qué haces después?', 'You have put the person in the recovery position. What do you do next?', 'Ja has posat la persona en posició lateral de seguretat. Què fas després?'],
    r: ['Avisar al 112 si no lo has hecho y vigilar que siga respirando', 'Call 112 if you have not already and keep checking that they are breathing', 'Avisar el 112 si no ho has fet i vigilar que continue respirant'],
    w: [
      ['Dejarla sola: ya está a salvo', 'Leave them alone: they are safe now', 'Deixar-la sola: ja està fora de perill'],
      ['Darle agua para que se despierte', 'Give them water so they wake up', 'Donar-li aigua perquè es desperte'],
      ['Sentarla para que respire mejor', 'Sit them up so they breathe better', 'Asseure-la perquè respire millor'],
    ],
    x: ['Si deja de respirar con normalidad, ponla boca arriba y empieza la RCP.', 'If they stop breathing normally, roll them onto their back and start CPR.', 'Si deixa de respirar amb normalitat, posa-la panxa amunt i comença la RCP.'],
  },
  {
    id: 'pls-cabeza', topic: 'injury', lv: 5, // (la escena daría la respuesta)
    p: ['En la posición lateral de seguridad, ¿cómo queda la cabeza?', 'In the recovery position, how is the head placed?', 'En la posició lateral de seguretat, com queda el cap?'],
    r: ['Inclinada hacia atrás, con la boca hacia el suelo', 'Tilted back, with the mouth facing the ground', 'Inclinat cap arrere, amb la boca cap a terra'],
    w: [
      ['Doblada sobre el pecho, con la barbilla abajo', 'Bent onto the chest, chin down', 'Doblegat sobre el pit, amb la barbeta avall'],
      ['Boca arriba, mirando al cielo', 'Face up, looking at the sky', 'Panxa amunt, mirant al cel'],
      ['Sobre una almohada muy alta', 'On a very high pillow', 'Sobre un coixí molt alt'],
    ],
    x: ['Así la vía respiratoria queda abierta y la saliva o el vómito pueden salir por la boca.', 'That keeps the airway open and lets saliva or vomit drain out of the mouth.', 'Així la via respiratòria queda oberta i la saliva o el vòmit poden eixir per la boca.'],
  },
];

/* ───────── estiramientos ───────── */

// fig: postura de components/stretchRig.js · mus: músculo que estira (respuesta)
// also: otros músculos que también se estiran (no salen como opción falsa)
// plate: lámina donde se ve el músculo · how: cómo se hace
export const STRETCHES = [
  {
    id: 'cuadriceps-pie', fig: 'cuadriceps-pie', mus: 'cuadriceps', also: ['iliopsoas', 'tibial-anterior'], plate: 'mus-a',
    n: ['Talón al glúteo, de pie', 'Heel to bottom, standing', 'Taló al gluti, dret'],
    how: ['De pie, coge el empeine y lleva el talón hacia el glúteo, con las rodillas juntas y sin arquear la espalda.', 'Standing, hold your foot and bring your heel towards your bottom, with your knees together and without arching your back.', "Dret, agafa l'empenya i porta el taló cap al gluti, amb els genolls junts i sense arquejar l'esquena."],
  },
  {
    id: 'isquios-sentado', fig: 'isquios-sentado', mus: 'isquiotibiales', also: ['gemelos', 'soleo', 'erectores', 'gluteo-mayor', 'aductores', 'dorsal-ancho'], plate: 'mus-p',
    n: ['Sentado, manos hacia los pies', 'Seated toe reach', 'Assegut, mans cap als peus'],
    how: ['Sentado con las piernas estiradas, inclínate hacia delante desde la cadera con la espalda recta.', 'Sitting with your legs straight, lean forward from your hips with your back straight.', "Assegut amb les cames estirades, inclina't cap avant des del maluc amb l'esquena recta."],
  },
  {
    id: 'gemelos-pared', fig: 'gemelos-pared', mus: 'gemelos', also: ['soleo', 'iliopsoas'], plate: 'mus-p',
    n: ['Empujar la pared con la pierna de atrás estirada', 'Wall push with the back leg straight', 'Empényer la paret amb la cama de darrere estirada'],
    how: ['Con las manos en la pared, adelanta una pierna y deja la de atrás estirada, con el talón en el suelo.', 'With your hands on the wall, step one leg forward and keep the back leg straight with the heel on the floor.', 'Amb les mans a la paret, avança una cama i deixa la de darrere estirada, amb el taló a terra.'],
  },
  {
    id: 'pectoral-puerta', fig: 'pectoral-puerta', mus: 'pectoral', also: ['deltoides', 'biceps', 'pectoral-menor', 'coracobraquial', 'dorsal-ancho'], plate: 'mus-a',
    n: ['Antebrazo en el marco de una puerta', 'Forearm on a door frame', "Avantbraç en el marc d'una porta"],
    how: ['Apoya el antebrazo en el marco de una puerta, con el codo a la altura del hombro, y avanza el cuerpo despacio.', 'Rest your forearm on a door frame with your elbow at shoulder height, and slowly move your body forwards.', "Recolza l'avantbraç en el marc d'una porta, amb el colze a l'altura de l'espatla, i avança el cos a poc a poc."],
  },
  {
    id: 'triceps-cabeza', fig: 'triceps-cabeza', mus: 'triceps', also: ['dorsal-ancho', 'redondo-mayor', 'pectoral'], plate: 'mus-p',
    n: ['Mano a la espalda por detrás de la cabeza', 'Hand down the back, behind the head', "Mà a l'esquena per darrere del cap"],
    how: ['Sube el brazo, dobla el codo para llevar la mano a la espalda y empuja suavemente el codo con la otra mano.', 'Raise your arm, bend the elbow to bring your hand down your back and gently push the elbow with your other hand.', "Puja el braç, doblega el colze per a portar la mà a l'esquena i empeny suaument el colze amb l'altra mà."],
  },
  {
    id: 'aductores-mariposa', fig: 'aductores-mariposa', mus: 'aductores', also: ['gluteo-mayor', 'erectores'], plate: 'mus-a',
    n: ['Mariposa: sentado con las plantas juntas', 'Butterfly: sitting with the soles together', 'Papallona: assegut amb les plantes juntes'],
    how: ['Sentado, junta las plantas de los pies y deja caer las rodillas hacia el suelo sin forzar.', 'Sitting down, put the soles of your feet together and let your knees drop towards the floor without forcing them.', 'Assegut, ajunta les plantes dels peus i deixa caure els genolls cap a terra sense forçar.'],
  },
  {
    id: 'flexores-zancada', fig: 'flexores-zancada', mus: 'iliopsoas', also: ['cuadriceps', 'tensor-fascia', 'aductores', 'gluteo-mayor'], plate: 'mus-a',
    n: ['Zancada con la rodilla de atrás en el suelo', 'Kneeling lunge', 'Gambada amb el genoll de darrere a terra'],
    how: ['Con una rodilla en el suelo y el otro pie delante, lleva la cadera hacia delante con el tronco recto.', 'With one knee on the floor and the other foot in front, push your hips forwards with your trunk upright.', "Amb un genoll a terra i l'altre peu davant, porta el maluc cap avant amb el tronc recte."],
  },
  {
    id: 'gluteo-figura4', fig: 'gluteo-figura4', mus: 'gluteo-mayor', also: ['piriforme', 'gluteo-medio', 'gluteo-menor', 'aductores'], plate: 'mus-p',
    n: ['Figura de 4, tumbado boca arriba', 'Figure four, lying on your back', 'Figura de 4, gitat panxa amunt'],
    how: ['Boca arriba, apoya un tobillo sobre la rodilla contraria y acerca al pecho el muslo de la pierna de apoyo.', 'Lying on your back, rest one ankle on the opposite knee and pull the thigh of the supporting leg towards your chest.', 'Panxa amunt, recolza un turmell sobre el genoll contrari i acosta al pit la cuixa de la cama de suport.'],
  },
  {
    id: 'dorsal-lateral', fig: 'dorsal-lateral', mus: 'dorsal-ancho', also: ['oblicuo', 'pectoral', 'redondo-mayor', 'serrato', 'erectores', 'intercostales', 'triceps', 'trapecio'], plate: 'mus-p',
    n: ['Inclinación lateral con el brazo por encima de la cabeza', 'Side bend with the arm overhead', 'Inclinació lateral amb el braç per damunt del cap'],
    how: ['De pie, sube un brazo por encima de la cabeza e inclina el tronco hacia el lado contrario.', 'Standing, raise one arm above your head and lean your trunk to the opposite side.', 'Dret, puja un braç per damunt del cap i inclina el tronc cap al costat contrari.'],
  },
  {
    id: 'cuello-lateral', fig: 'cuello-lateral', mus: 'trapecio', also: ['esternocleidomastoideo', 'escalenos', 'elevador-escapula', 'esplenio'], plate: 'mus-p',
    n: ['Inclinar la cabeza hacia el hombro', 'Tilt the head towards the shoulder', "Inclinar el cap cap a l'espatla"],
    how: ['Sentado o de pie, inclina la cabeza para acercar la oreja al hombro, sin subir el hombro contrario. Estira sobre todo la parte superior del trapecio.', 'Sitting or standing, tilt your head to bring your ear towards your shoulder, without lifting the other shoulder. It mainly stretches the upper part of the trapezius.', "Assegut o dret, inclina el cap per a acostar l'orella a l'espatla, sense pujar l'espatla contrària. Estira sobretot la part superior del trapezi."],
  },
];

// Cómo se estira bien
export const STRETCH_RULES = [
  {
    id: 'tiempo', lv: 4,
    p: ['¿Cuánto tiempo se mantiene un estiramiento estático?', 'How long do you hold a static stretch?', 'Quant de temps es manté un estirament estàtic?'],
    r: ['Unos 15-30 segundos, sin rebotes', 'About 15-30 seconds, without bouncing', 'Uns 15-30 segons, sense rebots'],
    w: [['1 o 2 segundos', '1 or 2 seconds', '1 o 2 segons'], ['Unos 5 minutos seguidos', 'About 5 minutes in a row', 'Uns 5 minuts seguits'], ['Hasta que duela mucho', 'Until it really hurts', 'Fins que faça molt de mal']],
  },
  {
    id: 'hasta-donde', lv: 4,
    p: ['¿Hasta dónde hay que estirar?', 'How far should you stretch?', 'Fins on cal estirar?'],
    r: ['Hasta notar tensión, sin llegar a sentir dolor', 'Until you feel tension, but never pain', 'Fins a notar tensió, sense arribar a sentir dolor'],
    w: [['Hasta que duela mucho', 'Until it really hurts', 'Fins que faça molt de mal'], ['Con rebotes, cada vez más lejos', 'Bouncing further each time', 'Amb rebots, cada vegada més lluny'], ['Lo menos posible, sin notar nada', 'As little as possible, without feeling anything', 'El mínim possible, sense notar res']],
  },
  {
    id: 'respirar', lv: 4,
    p: ['¿Cuál de estas es una buena norma al estirar?', 'Which of these is a good rule when stretching?', "Quina d'aquestes és una bona norma en estirar?"],
    r: ['Respirar despacio y con normalidad', 'Breathe slowly and normally', 'Respirar a poc a poc i amb normalitat'],
    w: [['Aguantar la respiración', 'Hold your breath', 'Aguantar la respiració'], ['Dar rebotes para llegar más lejos', 'Bounce to reach further', 'Fer rebots per a arribar més lluny'], ['Estirar en frío y con fuerza', 'Stretch hard without warming up', 'Estirar en fred i amb força']],
  },
  {
    id: 'cuando', lv: 5,
    p: ['¿Cuándo es mejor hacer estiramientos estáticos largos?', 'When is the best time for long static stretches?', 'Quan és millor fer estiraments estàtics llargs?'],
    r: ['En la vuelta a la calma, al terminar el ejercicio', 'In the cool-down, after exercising', 'En la tornada a la calma, en acabar l\'exercici'],
    w: [['Justo antes de un sprint, en frío', 'Just before a sprint, without warming up', "Just abans d'un esprint, en fred"], ['En mitad de un partido, con rebotes', 'In the middle of a match, bouncing', "A la meitat d'un partit, amb rebots"], ['Nunca: no sirven para nada', 'Never: they are useless', 'Mai: no servixen per a res']],
    x: ['En el calentamiento se prefieren los estiramientos dinámicos, con movimientos controlados.', 'In the warm-up, dynamic stretches with controlled movements are better.', "En l'escalfament es preferixen els estiraments dinàmics, amb moviments controlats."],
  },
  {
    id: 'dinamico', lv: 6,
    p: ['Una zancada caminando con giro de tronco, sin pararse, ¿qué tipo de estiramiento es?', 'A walking lunge with a trunk twist, without stopping: what type of stretch is it?', 'Una gambada caminant amb gir de tronc, sense parar-se, quin tipus d\'estirament és?'],
    r: ['Dinámico', 'Dynamic', 'Dinàmic'],
    w: [['Estático', 'Static', 'Estàtic'], ['Balístico (con rebotes)', 'Ballistic (bouncing)', 'Balístic (amb rebots)'], ['Pasivo, con la ayuda de un compañero', 'Passive, with a partner helping', "Passiu, amb l'ajuda d'un company"]],
  },
  {
    id: 'fnp', lv: 6,
    p: ['¿En qué consiste la técnica de estiramiento FNP (facilitación neuromuscular propioceptiva)?', 'What does the PNF (proprioceptive neuromuscular facilitation) stretching technique involve?', 'En què consistix la tècnica d\'estirament FNP (facilitació neuromuscular propioceptiva)?'],
    r: ['Contraer el músculo contra una resistencia unos segundos, relajarlo y estirarlo un poco más', 'Contracting the muscle against resistance for a few seconds, relaxing it and stretching it a little further', 'Contraure el múscul contra una resistència uns segons, relaxar-lo i estirar-lo una mica més'],
    w: [['Dar rebotes rápidos al final del movimiento', 'Bouncing quickly at the end of the movement', 'Fer rebots ràpids al final del moviment'], ['Mantener el estiramiento 10 minutos', 'Holding the stretch for 10 minutes', "Mantindre l'estirament 10 minuts"], ['Estirar solo después de una ducha caliente', 'Stretching only after a hot shower', 'Estirar només després d\'una dutxa calenta']],
  },
];
