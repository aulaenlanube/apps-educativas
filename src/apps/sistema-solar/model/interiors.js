// src/apps/sistema-solar/model/interiors.js
// Estructura interna de cada cuerpo para el visor de capas 3D y la misión
// «Viaje al interior». Radios como fracción del radio del cuerpo (rIn/rOut).
// Las capas muy finas (corteza, fotosfera, nubes…) se dibujan con un grosor
// mínimo y se avisa de que están exageradas.
//
// Fuentes: modelo PREM (Tierra); InSight (Marte, núcleo ≈ 1.830 km);
// MESSENGER (Mercurio); GRAIL y Weber et al. 2011 (Luna); Juno (núcleo
// difuso de Júpiter); NASA/ESA (Sol). Los gigantes y Venus tienen límites
// estimados: se indica en el texto.

export const MIN_VISUAL_THICKNESS = 0.045;

const L = (o) => ({ state: '', temp: '', composition: '', depth: '', desc: '', basic: '', clue: '', ...o });

export const INTERIORS = {
  earth: {
    title: 'Interior de la Tierra',
    note: 'Modelo sísmico: conocemos las capas por cómo viajan las ondas de los terremotos.',
    layers: [
      L({ id: 'inner-core', name: 'Núcleo interno', rIn: 0, rOut: 0.192, color: '#fff3b0', colorIn: '#ffffff', glow: 0.9,
        depth: '5.150–6.371 km', state: 'Sólido', temp: '≈ 5.200–5.400 °C', composition: 'Hierro y níquel',
        desc: 'Tan caliente como la superficie del Sol, pero sólido por la enorme presión (más de 3 millones de atmósferas).',
        basic: 'Es el centro de la Tierra: una bola de metal muy, muy caliente.',
        clue: 'Esfera metálica tan caliente como la superficie del Sol, pero sólida por la presión.' }),
      L({ id: 'outer-core', name: 'Núcleo externo', rIn: 0.192, rOut: 0.546, color: '#f59e0b', colorIn: '#fde68a', glow: 0.65,
        depth: '2.890–5.150 km', state: 'Líquido', temp: '≈ 4.000–5.400 °C', composition: 'Hierro y níquel fundidos (con algo de azufre y oxígeno)',
        desc: 'El metal líquido se mueve y genera el campo magnético terrestre (geodinamo), que nos protege del viento solar.',
        basic: 'Metal fundido que se mueve y crea el campo magnético.',
        clue: 'Metal líquido en movimiento que genera el campo magnético de la Tierra.' }),
      L({ id: 'lower-mantle', name: 'Manto inferior', rIn: 0.546, rOut: 0.896, color: '#c2410c', colorIn: '#ea580c', glow: 0.25,
        depth: '660–2.890 km', state: 'Sólido (fluye muy despacio)', temp: '≈ 1.900–3.700 °C', composition: 'Silicatos de magnesio y hierro (bridgmanita)',
        desc: 'La capa más voluminosa: más de la mitad del volumen de la Tierra. Roca sólida que, a escala de millones de años, se deforma y fluye.',
        basic: 'Roca muy caliente y apretada.',
        clue: 'La capa más voluminosa: roca sólida a enorme presión entre 660 y 2.890 km de profundidad.' }),
      L({ id: 'upper-mantle', name: 'Manto superior', rIn: 0.896, rOut: 0.9945, color: '#ea7a2e', colorIn: '#b45309', glow: 0.1,
        depth: '35–660 km', state: 'Sólido; la astenosfera es plástica', temp: '≈ 500–1.900 °C', composition: 'Peridotita (olivino y piroxenos)',
        desc: 'Su parte plástica, la astenosfera, permite que las placas tectónicas se desplacen unos centímetros al año sobre ella.',
        basic: 'Roca caliente que se mueve muy despacio.',
        clue: 'Capa bajo la corteza cuya parte plástica, la astenosfera, permite que se muevan las placas.' }),
      L({ id: 'crust', name: 'Corteza', rIn: 0.9945, rOut: 1, color: '#7c6a55', colorIn: '#a8896a', surface: true,
        depth: '0–35 km (continental) · 5–10 km (oceánica)', state: 'Sólido', temp: 'De ~15 °C a unos 500–900 °C en su base',
        composition: 'Granito (continentes) y basalto (fondos oceánicos)',
        desc: 'La capa más fina y rígida, donde vivimos. Con la parte alta del manto forma la litosfera, rota en placas tectónicas.',
        basic: 'Es la capa de fuera, de roca, donde vivimos. ¡Es muy fina comparada con las demás!',
        clue: 'Capa sólida más externa, de granito y basalto, rota (con el manto superior) en placas tectónicas.' }),
    ],
    basicLayers: [
      L({ id: 'core', name: 'Núcleo', rIn: 0, rOut: 0.546, color: '#f59e0b', colorIn: '#fff3b0', glow: 0.8,
        depth: '2.890–6.371 km', state: 'Metal (líquido fuera, sólido dentro)', temp: 'Más de 4.000 °C', composition: 'Hierro y níquel',
        basic: 'Es el centro de la Tierra: metal muy caliente. Por fuera está líquido y por dentro sólido.',
        desc: 'Núcleo de hierro y níquel: externo líquido e interno sólido.',
        clue: 'El centro de la Tierra, de metal muy caliente.' }),
      L({ id: 'mantle', name: 'Manto', rIn: 0.546, rOut: 0.9945, color: '#c2410c', colorIn: '#ea580c', glow: 0.2,
        depth: '35–2.890 km', state: 'Roca caliente que se mueve muy despacio', temp: 'De 500 a 3.700 °C', composition: 'Rocas con hierro y magnesio',
        basic: 'La capa más gruesa. Es roca muy caliente que se mueve despacito y empuja los continentes.',
        desc: 'La capa más gruesa de la Tierra.',
        clue: 'La capa más gruesa, de roca muy caliente, entre la corteza y el núcleo.' }),
      L({ id: 'crust', name: 'Corteza', rIn: 0.9945, rOut: 1, color: '#7c6a55', colorIn: '#a8896a', surface: true,
        depth: '0–35 km', state: 'Sólido', temp: 'Templada en la superficie', composition: 'Rocas como el granito y el basalto',
        basic: 'Es la capa de fuera, donde vivimos. Es de roca y muy fina.',
        desc: 'La capa más externa y fina.',
        clue: 'La capa de fuera, de roca, donde vivimos.' }),
    ],
  },

  sun: {
    title: 'Interior del Sol',
    note: 'Lo conocemos por la heliosismología (las «vibraciones» de su superficie) y los neutrinos del núcleo.',
    layers: [
      L({ id: 'core', name: 'Núcleo', rIn: 0, rOut: 0.25, color: '#fff7d6', colorIn: '#ffffff', glow: 1,
        depth: '0–175.000 km del centro', state: 'Plasma muy denso', temp: '≈ 15 millones °C', composition: 'Hidrógeno y helio',
        desc: 'Aquí ocurre la fusión nuclear: cada segundo unos 600 millones de toneladas de hidrógeno se convierten en helio, y la masa que «falta» sale como energía (E = mc²).',
        basic: 'Es el centro del Sol, donde se fabrica su energía.',
        clue: 'Donde la fusión nuclear transforma hidrógeno en helio a unos 15 millones de grados.' }),
      L({ id: 'radiative', name: 'Zona radiativa', rIn: 0.25, rOut: 0.7, color: '#fbbf24', colorIn: '#fde68a', glow: 0.8,
        depth: '0,25–0,7 radios solares', state: 'Plasma', temp: '≈ de 7 a 2 millones °C', composition: 'Hidrógeno y helio ionizados',
        desc: 'La energía avanza como luz que se absorbe y se reemite una y otra vez: un fotón puede tardar decenas de miles de años en cruzarla.',
        basic: 'La energía viaja muy despacio, rebotando como en un laberinto.',
        clue: 'La energía viaja como radiación que rebota partícula a partícula durante miles de años.' }),
      L({ id: 'convective', name: 'Zona convectiva', rIn: 0.7, rOut: 0.998, color: '#f97316', colorIn: '#f59e0b', glow: 0.6,
        depth: '0,7 radios hasta la superficie', state: 'Plasma en ebullición', temp: '≈ de 2 millones a 5.500 °C', composition: 'Hidrógeno y helio',
        desc: 'Burbujas de plasma caliente suben, se enfrían y vuelven a bajar, como el agua al hervir. En la superficie se ven como gránulos.',
        basic: 'El plasma sube y baja como el agua cuando hierve.',
        clue: 'El plasma caliente sube y el frío baja en enormes corrientes, como el agua hirviendo.' }),
      L({ id: 'photosphere', name: 'Fotosfera', rIn: 0.998, rOut: 1, color: '#ffb347', colorIn: '#ff9a1f', glow: 0.7, surface: true,
        depth: '≈ 500 km de espesor', state: 'Plasma', temp: '≈ 5.500 °C (manchas solares: ~3.500 °C)', composition: 'Hidrógeno y helio',
        desc: 'Es la «superficie» visible del Sol. En ella aparecen las manchas solares, zonas más frías por la intensa actividad magnética.',
        basic: 'Es la superficie que vemos brillar.',
        clue: 'La superficie visible del Sol, donde aparecen las manchas solares.' }),
      L({ id: 'chromosphere', name: 'Cromosfera', rIn: 1, rOut: 1.003, color: '#ff5d73', colorIn: '#ff2d55', glow: 0.8, translucent: 0.55,
        depth: '≈ 2.000 km sobre la fotosfera', state: 'Plasma tenue', temp: 'De ~4.000 °C a más de 20.000 °C', composition: 'Hidrógeno (le da el color rojizo)',
        desc: 'Capa rojiza que solo vemos a simple vista en los eclipses totales. De ella surgen espículas y protuberancias.',
        basic: 'Una capa rojiza que solo se ve en los eclipses.',
        clue: 'Capa rojiza sobre la superficie que solo vemos en los eclipses totales.' }),
      L({ id: 'corona', name: 'Corona', rIn: 1.003, rOut: 1.35, color: '#fff1c1', colorIn: '#ffd27a', glow: 1, translucent: 0.22,
        depth: 'Millones de km hacia el espacio', state: 'Plasma muy tenue', temp: '≈ 1 a 3 millones °C', composition: 'Iones muy calientes',
        desc: 'La atmósfera exterior del Sol, cientos de veces más caliente que la superficie (aún se investiga por qué). De ella sale el viento solar.',
        basic: 'El halo de luz que rodea al Sol. ¡Está calentísimo!',
        clue: 'La capa más externa: tenue, a millones de grados, origen del viento solar.' }),
    ],
    basicLayers: [
      L({ id: 'core', name: 'Núcleo', rIn: 0, rOut: 0.25, color: '#fff7d6', colorIn: '#ffffff', glow: 1,
        state: 'Plasma', temp: '15 millones °C', basic: 'Es el centro del Sol, donde se fabrica su energía.',
        desc: 'Donde se produce la fusión nuclear.', clue: 'El centro del Sol, donde se fabrica la energía.' }),
      L({ id: 'interior', name: 'Zonas de transporte', rIn: 0.25, rOut: 0.998, color: '#f97316', colorIn: '#fbbf24', glow: 0.7,
        state: 'Plasma', temp: 'Millones de °C', basic: 'Por aquí viaja la energía desde el centro hasta la superficie.',
        desc: 'Zona radiativa y zona convectiva.', clue: 'La parte por la que la energía viaja desde el centro hasta fuera.' }),
      L({ id: 'photosphere', name: 'Superficie (fotosfera)', rIn: 0.998, rOut: 1, color: '#ffb347', colorIn: '#ff9a1f', glow: 0.7, surface: true,
        state: 'Plasma', temp: '5.500 °C', basic: 'Es la superficie que vemos brillar.', desc: 'La superficie visible.', clue: 'La superficie brillante que vemos.' }),
      L({ id: 'corona', name: 'Corona', rIn: 1, rOut: 1.35, color: '#fff1c1', colorIn: '#ffd27a', glow: 1, translucent: 0.22,
        state: 'Plasma muy tenue', temp: 'Millones de °C', basic: 'El halo de luz que rodea al Sol.', desc: 'La atmósfera exterior.', clue: 'El halo que rodea al Sol.' }),
    ],
  },

  mercury: {
    title: 'Interior de Mercurio',
    note: 'Datos de la sonda MESSENGER: su núcleo es enorme para su tamaño.',
    layers: [
      L({ id: 'inner-core', name: 'Núcleo interno', rIn: 0, rOut: 0.41, color: '#fde68a', colorIn: '#fffbeb', glow: 0.7,
        depth: 'Radio ≈ 1.000 km (estimado)', state: 'Sólido', composition: 'Hierro y níquel',
        desc: 'Un núcleo sólido de hierro, cuyo tamaño exacto aún se estudia.', basic: 'El centro, de metal.', clue: 'Centro sólido de hierro de este pequeño planeta.' }),
      L({ id: 'outer-core', name: 'Núcleo externo', rIn: 0.41, rOut: 0.83, color: '#d97706', colorIn: '#fbbf24', glow: 0.45,
        depth: 'Hasta ≈ 2.020 km del centro', state: 'Líquido', composition: 'Hierro fundido con azufre',
        desc: 'El núcleo metálico ocupa más del 80 % del radio: proporcionalmente, el mayor de los planetas rocosos. Genera un campo magnético débil.',
        basic: 'Metal fundido. ¡El núcleo es casi todo el planeta!', clue: 'Metal líquido que ocupa la mayor parte del radio del planeta.' }),
      L({ id: 'mantle', name: 'Manto', rIn: 0.83, rOut: 0.986, color: '#8b6b4a', colorIn: '#a16207', glow: 0.1,
        depth: '≈ 35–420 km', state: 'Sólido', composition: 'Silicatos',
        desc: 'Un manto muy delgado comparado con el de la Tierra.', basic: 'Roca entre el núcleo y la corteza.', clue: 'Capa fina de silicatos entre la corteza y el gran núcleo.' }),
      L({ id: 'crust', name: 'Corteza', rIn: 0.986, rOut: 1, color: '#9ca3af', colorIn: '#6b7280', surface: true,
        depth: '≈ 0–35 km', state: 'Sólido', composition: 'Silicatos pobres en hierro',
        desc: 'Llena de cráteres y de escarpes: grietas que se formaron cuando el planeta se enfrió y encogió.', basic: 'La superficie, llena de cráteres.', clue: 'Superficie con cráteres y escarpes por el encogimiento del planeta.' }),
    ],
  },

  venus: {
    title: 'Interior de Venus',
    note: 'No se ha medido su sismicidad: el modelo se basa en su parecido con la Tierra.',
    layers: [
      L({ id: 'core', name: 'Núcleo', rIn: 0, rOut: 0.53, color: '#f59e0b', colorIn: '#fde68a', glow: 0.6,
        depth: 'Radio ≈ 3.200 km (estimado)', state: 'Probablemente líquido (no se sabe)', composition: 'Hierro y níquel',
        desc: 'Similar al terrestre, pero Venus no tiene campo magnético propio: quizá su núcleo no tiene convección.', basic: 'El centro, de metal.', clue: 'Núcleo metálico que, a diferencia del terrestre, no genera campo magnético.' }),
      L({ id: 'mantle', name: 'Manto', rIn: 0.53, rOut: 0.995, color: '#c2410c', colorIn: '#ea580c', glow: 0.2,
        depth: '≈ 30–2.900 km', state: 'Sólido', composition: 'Silicatos',
        desc: 'Alimenta un volcanismo muy extenso: el 80 % de la superficie son llanuras de lava.', basic: 'Roca caliente bajo la superficie.', clue: 'Roca caliente que alimenta miles de volcanes.' }),
      L({ id: 'crust', name: 'Corteza', rIn: 0.995, rOut: 1, color: '#a16207', colorIn: '#854d0e', surface: true,
        depth: 'Decenas de km (estimado)', state: 'Sólido', composition: 'Basalto',
        desc: 'Superficie volcánica joven, sin placas tectónicas como las terrestres.', basic: 'El suelo, de roca volcánica.', clue: 'Superficie de basalto volcánico sin placas tectónicas.' }),
      L({ id: 'atmosphere', name: 'Atmósfera', rIn: 1, rOut: 1.04, color: '#fde68a', colorIn: '#fbbf24', glow: 0.3, translucent: 0.42,
        depth: 'Hasta ≈ 250 km de altura', state: 'Gas', temp: '464 °C en el suelo', composition: '96,5 % CO₂; nubes de ácido sulfúrico',
        desc: 'Tan densa (92 bar) que provoca un efecto invernadero desbocado: Venus es el planeta más caliente.', basic: 'Nubes muy gruesas que atrapan el calor.', clue: 'Capa de CO₂ con nubes de ácido que provoca el efecto invernadero más fuerte.' }),
    ],
  },

  moon: {
    title: 'Interior de la Luna',
    note: 'Sismómetros del Apolo y la misión GRAIL revelaron su estructura.',
    layers: [
      L({ id: 'inner-core', name: 'Núcleo interno', rIn: 0, rOut: 0.14, color: '#fde68a', colorIn: '#fffbeb', glow: 0.6,
        depth: 'Radio ≈ 240 km', state: 'Sólido', composition: 'Hierro', desc: 'Un núcleo diminuto: apenas el 1–2 % de la masa lunar.', basic: 'El centro, pequeño y de metal.', clue: 'Centro de hierro diminuto, sólido.' }),
      L({ id: 'outer-core', name: 'Núcleo externo', rIn: 0.14, rOut: 0.19, color: '#f59e0b', colorIn: '#fbbf24', glow: 0.45,
        depth: 'Radio ≈ 330 km', state: 'Líquido', composition: 'Hierro fundido', desc: 'Capa de hierro fundido alrededor del núcleo interno.', basic: 'Metal fundido.', clue: 'Fina capa de hierro fundido alrededor del centro.' }),
      L({ id: 'molten', name: 'Capa parcialmente fundida', rIn: 0.19, rOut: 0.28, color: '#b45309', colorIn: '#d97706', glow: 0.25,
        depth: 'Hasta ≈ 480 km del centro', state: 'Parcialmente fundido', composition: 'Silicatos', desc: 'Roca en parte fundida en la base del manto.', basic: 'Roca medio fundida.', clue: 'Roca en parte fundida en la base del manto.' }),
      L({ id: 'mantle', name: 'Manto', rIn: 0.28, rOut: 0.977, color: '#78716c', colorIn: '#57534e', glow: 0.05,
        depth: '≈ 40–1.250 km', state: 'Sólido', composition: 'Silicatos (olivino, piroxeno)', desc: 'De él salió la lava que formó los «mares» oscuros.', basic: 'Roca bajo la corteza.', clue: 'Roca sólida de la que salió la lava de los mares lunares.' }),
      L({ id: 'crust', name: 'Corteza', rIn: 0.977, rOut: 1, color: '#d6d3d1', colorIn: '#a8a29e', surface: true,
        depth: '≈ 0–40 km', state: 'Sólido', composition: 'Anortosita (tierras altas) y basalto (mares)', desc: 'Más gruesa en la cara oculta que en la visible.', basic: 'La superficie gris con cráteres.', clue: 'Superficie de anortosita y basalto, más gruesa en la cara oculta.' }),
    ],
  },

  mars: {
    title: 'Interior de Marte',
    note: 'El sismómetro de la misión InSight (2018–2022) midió sus capas por primera vez.',
    layers: [
      L({ id: 'core', name: 'Núcleo', rIn: 0, rOut: 0.54, color: '#f59e0b', colorIn: '#fde68a', glow: 0.55,
        depth: 'Radio ≈ 1.830 km', state: 'Líquido', composition: 'Hierro con mucho azufre',
        desc: 'Más grande y menos denso de lo esperado. Hoy no genera campo magnético global.', basic: 'El centro, de metal fundido.', clue: 'Núcleo líquido de hierro con azufre, que ya no genera campo magnético.' }),
      L({ id: 'mantle', name: 'Manto', rIn: 0.54, rOut: 0.985, color: '#b45309', colorIn: '#c2410c', glow: 0.15,
        depth: '≈ 50–1.560 km', state: 'Sólido', composition: 'Silicatos ricos en hierro',
        desc: 'Alimentó volcanes gigantes como el Monte Olimpo.', basic: 'Roca bajo la corteza.', clue: 'Roca que alimentó el mayor volcán del Sistema Solar.' }),
      L({ id: 'crust', name: 'Corteza', rIn: 0.985, rOut: 1, color: '#c1440e', colorIn: '#9a3412', surface: true,
        depth: '≈ 24–72 km', state: 'Sólido', composition: 'Basalto cubierto de polvo de óxido de hierro',
        desc: 'Una sola placa, sin tectónica. El óxido de hierro del polvo la tiñe de rojo.', basic: 'La superficie roja.', clue: 'Superficie de basalto teñida de rojo por el óxido de hierro.' }),
    ],
  },

  jupiter: {
    title: 'Interior de Júpiter',
    note: 'Modelo apoyado en la gravedad medida por la sonda Juno. Los límites son graduales y estimados.',
    layers: [
      L({ id: 'core', name: 'Núcleo difuso', rIn: 0, rOut: 0.25, color: '#fde68a', colorIn: '#ffffff', glow: 0.9,
        depth: 'Sin borde nítido', state: 'Roca y hielos mezclados con hidrógeno', temp: '≈ 20.000 °C (estimado)', composition: 'Roca, metales y hielos',
        desc: 'Juno indicó que no es una bola compacta: se diluye en el hidrógeno que lo rodea hasta casi la mitad del radio.', basic: 'El centro, de roca, muy caliente.', clue: 'Centro de roca y hielos diluido, sin un borde claro, a unos 20.000 °C.' }),
      L({ id: 'metallic-h', name: 'Hidrógeno metálico', rIn: 0.25, rOut: 0.8, color: '#a78bfa', colorIn: '#c4b5fd', glow: 0.45,
        depth: 'Bajo ~0,8 radios', state: 'Líquido conductor', temp: 'Miles de °C', composition: 'Hidrógeno (y helio)',
        desc: 'Con millones de atmósferas de presión el hidrógeno conduce la electricidad como un metal: su movimiento crea el enorme campo magnético.', basic: 'Hidrógeno tan apretado que se comporta como un metal.', clue: 'Hidrógeno a millones de atmósferas que conduce como un metal y crea el campo magnético.' }),
      L({ id: 'molecular-h', name: 'Hidrógeno molecular', rIn: 0.8, rOut: 0.99, color: '#e6b47a', colorIn: '#c7895a', glow: 0.1,
        depth: 'Miles de km bajo las nubes', state: 'Gas que pasa a líquido sin un límite claro', composition: 'H₂ y helio',
        desc: 'No hay suelo: el gas se va comprimiendo hasta comportarse como un líquido.', basic: 'Gas que, al bajar, se vuelve líquido.', clue: 'Gas de H₂ que, al bajar, se comprime hasta parecer líquido, sin suelo.' }),
      L({ id: 'atmosphere', name: 'Atmósfera y nubes', rIn: 0.99, rOut: 1, color: '#d8b48a', colorIn: '#b08060', surface: true,
        depth: 'Capa exterior', state: 'Gas', temp: '−110 °C (a 1 bar)', composition: 'Nubes de amoníaco, hidrosulfuro de amonio y agua',
        desc: 'Bandas de nubes movidas por vientos de cientos de km/h y la Gran Mancha Roja.', basic: 'Las nubes de colores que vemos.', clue: 'Bandas de nubes de amoníaco movidas por vientos huracanados.' }),
    ],
  },

  saturn: {
    title: 'Interior de Saturno',
    note: 'Modelo estimado (Cassini y las «ondas» de sus anillos): límites graduales.',
    layers: [
      L({ id: 'core', name: 'Núcleo', rIn: 0, rOut: 0.25, color: '#fde68a', colorIn: '#ffffff', glow: 0.8,
        depth: 'Difuso', state: 'Roca y hielos', temp: '≈ 12.000 °C (estimado)', composition: 'Roca, metales y hielos',
        desc: 'Probablemente difuso, como el de Júpiter.', basic: 'El centro, de roca.', clue: 'Centro de roca y hielos a unos 12.000 °C.' }),
      L({ id: 'metallic-h', name: 'Hidrógeno metálico', rIn: 0.25, rOut: 0.5, color: '#a78bfa', colorIn: '#c4b5fd', glow: 0.4,
        depth: 'Bajo ~0,5 radios', state: 'Líquido conductor', composition: 'Hidrógeno y helio',
        desc: 'Más fina que en Júpiter porque la presión es menor. En su límite podría «llover» helio.', basic: 'Hidrógeno que se comporta como un metal.', clue: 'Hidrógeno conductor, más fino que el de Júpiter; en su límite llueve helio.' }),
      L({ id: 'molecular-h', name: 'Hidrógeno molecular', rIn: 0.5, rOut: 0.99, color: '#ecd3a0', colorIn: '#caa66e', glow: 0.1,
        state: 'Gas que pasa a líquido', composition: 'H₂ y helio', desc: 'La mayor parte del volumen del planeta.', basic: 'Gas que, al bajar, se vuelve líquido.', clue: 'La capa de H₂ que forma la mayor parte del volumen del planeta.' }),
      L({ id: 'atmosphere', name: 'Atmósfera y nubes', rIn: 0.99, rOut: 1, color: '#e9d1a1', colorIn: '#c9a76f', surface: true,
        state: 'Gas', temp: '−140 °C (a 1 bar)', composition: 'Nubes de amoníaco', desc: 'Vientos de hasta 1.800 km/h y el hexágono del polo norte.', basic: 'Las nubes doradas que vemos.', clue: 'Nubes de amoníaco con un hexágono en el polo norte.' }),
    ],
  },

  uranus: {
    title: 'Interior de Urano',
    note: 'Solo lo visitó la Voyager 2 (1986): modelo estimado.',
    layers: [
      L({ id: 'core', name: 'Núcleo rocoso', rIn: 0, rOut: 0.2, color: '#c084fc', colorIn: '#e9d5ff', glow: 0.6,
        state: 'Sólido', temp: '≈ 5.000 °C (estimado)', composition: 'Silicatos, hierro y níquel', desc: 'Pequeño: menos de una masa terrestre.', basic: 'El centro, de roca.', clue: 'Pequeño centro de roca y metal a unos 5.000 °C.' }),
      L({ id: 'ice-mantle', name: 'Manto de «hielos»', rIn: 0.2, rOut: 0.75, color: '#22d3ee', colorIn: '#67e8f9', glow: 0.3,
        state: 'Fluido caliente y denso', composition: 'Agua, amoníaco y metano', desc: 'Se llaman «hielos» por su composición, pero están calientes y fluidos. Forman la mayor parte de la masa.', basic: 'Agua y otras sustancias muy apretadas.', clue: 'Fluido caliente de agua, amoníaco y metano: la mayor parte de la masa de un gigante helado.' }),
      L({ id: 'envelope', name: 'Envoltura de hidrógeno y helio', rIn: 0.75, rOut: 0.99, color: '#99f6e4', colorIn: '#5eead4', glow: 0.05,
        state: 'Gas', composition: 'H₂, helio y metano', desc: 'Capa gaseosa que se vuelve más densa hacia dentro.', basic: 'Gas.', clue: 'Capa gaseosa de hidrógeno y helio sobre el manto de hielos.' }),
      L({ id: 'atmosphere', name: 'Atmósfera', rIn: 0.99, rOut: 1, color: '#a5f3fc', colorIn: '#67e8f9', surface: true,
        state: 'Gas', temp: '−195 °C', composition: 'Metano (absorbe el rojo)', desc: 'El metano absorbe la luz roja: por eso lo vemos de color cian.', basic: 'Las nubes azul verdoso.', clue: 'Capa con metano que absorbe la luz roja y da el color cian.' }),
    ],
  },

  neptune: {
    title: 'Interior de Neptuno',
    note: 'Solo lo visitó la Voyager 2 (1989): modelo estimado.',
    layers: [
      L({ id: 'core', name: 'Núcleo rocoso', rIn: 0, rOut: 0.25, color: '#c084fc', colorIn: '#e9d5ff', glow: 0.6,
        state: 'Sólido', temp: '≈ 5.000 °C (estimado)', composition: 'Silicatos, hierro y níquel', desc: 'Con una masa algo mayor que la de la Tierra.', basic: 'El centro, de roca.', clue: 'Centro de roca y metal con algo más de una masa terrestre.' }),
      L({ id: 'ice-mantle', name: 'Manto de «hielos»', rIn: 0.25, rOut: 0.8, color: '#3b82f6', colorIn: '#60a5fa', glow: 0.3,
        state: 'Fluido caliente y denso', composition: 'Agua, amoníaco y metano', desc: 'Con la presión, el carbono del metano podría formar diamantes que «llueven» hacia el centro.', basic: 'Agua y otras sustancias muy apretadas.', clue: 'Fluido caliente de agua y metano donde podrían formarse diamantes.' }),
      L({ id: 'envelope', name: 'Envoltura de hidrógeno y helio', rIn: 0.8, rOut: 0.99, color: '#93c5fd', colorIn: '#60a5fa', glow: 0.05,
        state: 'Gas', composition: 'H₂, helio y metano', desc: 'Capa gaseosa sobre el manto.', basic: 'Gas.', clue: 'Capa gaseosa de hidrógeno y helio sobre el manto.' }),
      L({ id: 'atmosphere', name: 'Atmósfera', rIn: 0.99, rOut: 1, color: '#6d8cff', colorIn: '#4f6bff', surface: true,
        state: 'Gas', temp: '−200 °C', composition: 'Metano', desc: 'Con los vientos más rápidos del Sistema Solar: más de 2.000 km/h.', basic: 'Las nubes azules con vientos fortísimos.', clue: 'Capa azul con los vientos más rápidos del Sistema Solar.' }),
    ],
  },
};

export const INTERIOR_IDS = Object.keys(INTERIORS);

// Capas que se usan según el nivel (Primaria baja: modelo sencillo si existe).
export function layersFor(bodyId, tier = 3) {
  const it = INTERIORS[bodyId];
  if (!it) return [];
  return tier <= 2 && it.basicLayers ? it.basicLayers : it.layers;
}

// Radios para dibujar: cada capa con un grosor mínimo; la capa «superficie»
// acaba en 1. Devuelve [{...layer, vIn, vOut, exaggerated}].
export function visualLayerRadii(layers, minT = MIN_VISUAL_THICKNESS) {
  let r = 0;
  const out = layers.map((l) => {
    const real = Math.max(0, l.rOut - l.rIn);
    const t = Math.max(real, minT);
    const v = { ...l, vIn: r, vOut: r + t, exaggerated: t > real * 1.5 };
    r += t;
    return v;
  });
  const surfaceIdx = out.findIndex((l) => l.surface);
  const ref = surfaceIdx >= 0 ? out[surfaceIdx].vOut : r;
  return out.map((l) => ({ ...l, vIn: l.vIn / ref, vOut: l.vOut / ref }));
}
