// Relieve del mundo para el minijuego "Relieve": ríos, cordilleras, desiertos,
// llanuras y mesetas, mares y lagos. La geometría sale de Natural Earth (dominio
// público) con tools/build-world-geo.mjs → public/data/geo/relief-50m.json.
//
//   id     clave              type   river | range | desert | plain | sea | lake
//   name   etiqueta del mapa  short  opción de respuesta   art  con artículo (enunciados)
//   cont   continente         t      escalón 1-3 (1 = muy conocido)
//   src    capa de origen (rivers | regions | marine | lakes) y nombres en Natural Earth
//   bbox   [oeste, sur, este, norte] para quedarse con el río correcto si el nombre se repite
//   fact   dato curioso que se muestra al responder

export const RELIEF_TYPES = {
  river: { label: 'Ríos', one: 'río', question: '¿Qué río es este?' },
  range: { label: 'Montañas', one: 'cordillera', question: '¿Qué cordillera es esta?' },
  desert: { label: 'Desiertos', one: 'desierto', question: '¿Qué desierto es este?' },
  plain: { label: 'Llanuras y mesetas', one: 'llanura o meseta', question: '¿Qué llanura o meseta es esta?' },
  sea: { label: 'Mares', one: 'mar', question: '¿Qué mar es este?' },
  lake: { label: 'Lagos', one: 'lago', question: '¿Qué lago es este?' },
};

// Grupos que se juegan juntos en "toca en el mapa" (lagos con mares, llanuras con desiertos).
export const RELIEF_POOLS = { river: ['river'], range: ['range'], desert: ['desert', 'plain'], plain: ['desert', 'plain'], sea: ['sea', 'lake'], lake: ['sea', 'lake'] };

const R = (id, type, cont, t, name, short, art, src, names, fact, bbox) => ({ id, type, cont, t, name, short, art, src, names, fact, bbox });

export const RELIEF = [
  // ───────────── Ríos ─────────────
  R('nilo', 'river', 'africa', 1, 'Río Nilo', 'Nilo', 'el río Nilo', 'rivers', ['Nile', 'El Bahr el Abyad', 'Bahr el Jebel'], 'Mide unos 6.650 km: es el río más largo de África y, según muchas mediciones, del mundo.'),
  R('amazonas', 'river', 'america', 1, 'Río Amazonas', 'Amazonas', 'el río Amazonas', 'rivers', ['Amazonas', 'Ucayali'], 'Es el río más caudaloso del mundo y le disputa al Nilo el título de más largo.'),
  R('misisipi', 'river', 'america', 1, 'Río Misisipi', 'Misisipi', 'el río Misisipi', 'rivers', ['Mississippi'], 'El gran río de Estados Unidos; desemboca en el golfo de México.'),
  R('yangtse', 'river', 'asia', 1, 'Río Yangtsé', 'Yangtsé', 'el río Yangtsé', 'rivers', ['Chang Jiang', 'Yangtze', 'Jinsha', 'Tongtian'], 'Con unos 6.300 km, es el río más largo de Asia.'),
  R('danubio', 'river', 'europa', 1, 'Río Danubio', 'Danubio', 'el río Danubio', 'rivers', ['Danube', 'Donau'], 'Atraviesa diez países y cuatro capitales: Viena, Bratislava, Budapest y Belgrado.'),
  R('volga', 'river', 'europa', 1, 'Río Volga', 'Volga', 'el río Volga', 'rivers', ['Volga'], 'Es el río más largo de Europa (unos 3.530 km) y desemboca en el mar Caspio.'),
  R('rin', 'river', 'europa', 2, 'Río Rin', 'Rin', 'el río Rin', 'rivers', ['Rhine', 'Rhein', 'Rhin'], 'Nace en los Alpes suizos y desemboca en el mar del Norte.'),
  R('ganges', 'river', 'asia', 2, 'Río Ganges', 'Ganges', 'el río Ganges', 'rivers', ['Ganges'], 'Es un río sagrado para los hindúes; desemboca en el golfo de Bengala.'),
  R('congo', 'river', 'africa', 2, 'Río Congo', 'Congo', 'el río Congo', 'rivers', ['Congo', 'Lualaba'], 'Es el segundo río más caudaloso del mundo y cruza dos veces el ecuador.'),
  R('niger', 'river', 'africa', 2, 'Río Níger', 'Níger', 'el río Níger', 'rivers', ['Niger'], 'El principal río de África Occidental: dibuja un gran arco por el Sahel.'),
  R('parana', 'river', 'america', 2, 'Río Paraná', 'Paraná', 'el río Paraná', 'rivers', ['Paraná'], 'Junto con el río Uruguay forma el Río de la Plata.'),
  R('mekong', 'river', 'asia', 2, 'Río Mekong', 'Mekong', 'el río Mekong', 'rivers', ['Mekong', 'Lancang'], 'Atraviesa seis países, de China a Vietnam.'),
  R('amarillo', 'river', 'asia', 2, 'Río Amarillo', 'Río Amarillo', 'el río Amarillo', 'rivers', ['Huang'], 'Debe su nombre al barro amarillento que arrastra; en sus orillas nació la civilización china.'),
  R('indo', 'river', 'asia', 2, 'Río Indo', 'Indo', 'el río Indo', 'rivers', ['Indus'], 'En su valle surgió una de las primeras civilizaciones de la historia.'),
  R('eufrates', 'river', 'asia', 2, 'Río Éufrates', 'Éufrates', 'el río Éufrates', 'rivers', ['Euphrates', 'Al Furat', 'Firat'], 'Entre el Éufrates y el Tigris estaba Mesopotamia, cuna de la escritura.'),
  R('tigris', 'river', 'asia', 3, 'Río Tigris', 'Tigris', 'el río Tigris', 'rivers', ['Tigris', 'Dicle'], 'Pasa por Bagdad y se une al Éufrates antes de llegar al golfo Pérsico.'),
  R('tajo', 'river', 'europa', 2, 'Río Tajo', 'Tajo', 'el río Tajo', 'rivers', ['Tajo', 'Tejo'], 'Es el río más largo de la península ibérica (unos 1.000 km) y desemboca en Lisboa.'),
  R('ebro', 'river', 'europa', 2, 'Río Ebro', 'Ebro', 'el río Ebro', 'rivers', ['Ebro'], 'Es el río más caudaloso de España y forma un delta en el Mediterráneo.'),
  R('duero', 'river', 'europa', 3, 'Río Duero', 'Duero', 'el río Duero', 'rivers', ['Duero'], 'Nace en Soria y desemboca en Oporto (Portugal).'),
  R('ob', 'river', 'asia', 3, 'Río Obi', 'Obi', 'el río Obi', 'rivers', ['Ob'], 'Gran río de Siberia que desemboca en el océano Ártico.'),
  R('yenisei', 'river', 'asia', 3, 'Río Yeniséi', 'Yeniséi', 'el río Yeniséi', 'rivers', ['Yenisey'], 'Atraviesa Siberia de sur a norte hasta el océano Ártico.'),
  R('lena', 'river', 'asia', 3, 'Río Lena', 'Lena', 'el río Lena', 'rivers', ['Lena'], 'Recorre la Siberia oriental y forma un enorme delta en el Ártico.'),
  R('amur', 'river', 'asia', 3, 'Río Amur', 'Amur', 'el río Amur', 'rivers', ['Amur', 'Heilong Jiang'], 'Marca buena parte de la frontera entre Rusia y China.'),
  R('zambeze', 'river', 'africa', 3, 'Río Zambeze', 'Zambeze', 'el río Zambeze', 'rivers', ['Zambezi'], 'En su curso están las cataratas Victoria.'),
  R('orinoco', 'river', 'america', 3, 'Río Orinoco', 'Orinoco', 'el río Orinoco', 'rivers', ['Orinoco'], 'El gran río de Venezuela; desemboca en el Atlántico con un enorme delta.'),
  R('sanlorenzo', 'river', 'america', 3, 'Río San Lorenzo', 'San Lorenzo', 'el río San Lorenzo', 'rivers', ['St. Lawrence'], 'Une los Grandes Lagos con el océano Atlántico.'),
  R('yukon', 'river', 'america', 3, 'Río Yukón', 'Yukón', 'el río Yukón', 'rivers', ['Yukon'], 'Cruza el noroeste de Canadá y Alaska.'),
  R('colorado', 'river', 'america', 3, 'Río Colorado', 'Colorado', 'el río Colorado', 'rivers', ['Colorado'], 'Ha excavado durante millones de años el Gran Cañón.', [-121, 30, -104, 42]),
  R('mackenzie', 'river', 'america', 3, 'Río Mackenzie', 'Mackenzie', 'el río Mackenzie', 'rivers', ['Mackenzie'], 'Es el río más largo de Canadá.'),
  R('murray', 'river', 'oceania', 3, 'Río Murray', 'Murray', 'el río Murray', 'rivers', ['Murray'], 'Es el río más largo de Australia.'),
  R('loira', 'river', 'europa', 3, 'Río Loira', 'Loira', 'el río Loira', 'rivers', ['Loire'], 'Es el río más largo de Francia, famoso por sus castillos.'),
  R('sena', 'river', 'europa', 3, 'Río Sena', 'Sena', 'el río Sena', 'rivers', ['Seine'], 'Atraviesa París y desemboca en el canal de la Mancha.'),
  R('elba', 'river', 'europa', 3, 'Río Elba', 'Elba', 'el río Elba', 'rivers', ['Elbe'], 'Nace en Chequia y pasa por Hamburgo antes de llegar al mar del Norte.'),
  R('vistula', 'river', 'europa', 3, 'Río Vístula', 'Vístula', 'el río Vístula', 'rivers', ['Vistula'], 'El río más largo de Polonia: pasa por Cracovia y Varsovia.'),
  R('dnieper', 'river', 'europa', 3, 'Río Dniéper', 'Dniéper', 'el río Dniéper', 'rivers', ['Dnepre', 'Dnipro'], 'Pasa por Kiev y desemboca en el mar Negro.'),
  R('po', 'river', 'europa', 3, 'Río Po', 'Po', 'el río Po', 'rivers', ['Po'], 'Es el río más largo de Italia.'),
  R('rodano', 'river', 'europa', 3, 'Río Ródano', 'Ródano', 'el río Ródano', 'rivers', ['Rhône'], 'Nace en un glaciar de los Alpes suizos y desemboca en el Mediterráneo.'),
  R('tamesis', 'river', 'europa', 3, 'Río Támesis', 'Támesis', 'el río Támesis', 'rivers', ['Thames'], 'Atraviesa Londres.'),

  // ───────────── Cordilleras ─────────────
  R('himalaya', 'range', 'asia', 1, 'Himalaya', 'Himalaya', 'el Himalaya', 'regions', ['HIMALAYAS'], 'Aquí está el Everest (8.849 m), la montaña más alta del mundo.'),
  R('andes', 'range', 'america', 1, 'Cordillera de los Andes', 'Andes', 'la cordillera de los Andes', 'regions', ['ANDES'], 'Es la cordillera más larga del mundo; su pico más alto es el Aconcagua (6.961 m).'),
  R('alpes', 'range', 'europa', 1, 'Alpes', 'Alpes', 'los Alpes', 'regions', ['ALPS'], 'Su cima más alta es el Mont Blanc, de unos 4.800 m.'),
  R('rocosas', 'range', 'america', 1, 'Montañas Rocosas', 'Rocosas', 'las montañas Rocosas', 'regions', ['ROCKY MOUNTAINS'], 'Recorren el oeste de Canadá y de Estados Unidos.'),
  R('pirineos', 'range', 'europa', 1, 'Pirineos', 'Pirineos', 'los Pirineos', 'regions', ['PYRENEES'], 'Separan la península ibérica del resto de Europa; su pico más alto es el Aneto (3.404 m).'),
  R('urales', 'range', 'europa', 2, 'Montes Urales', 'Urales', 'los montes Urales', 'regions', ['URAL MOUNTAINS'], 'Marcan el límite tradicional entre Europa y Asia.'),
  R('atlas', 'range', 'africa', 2, 'Cordillera del Atlas', 'Atlas', 'la cordillera del Atlas', 'regions', ['ATLAS MOUNTAINS', 'HAUT ATLAS'], 'Recorre el norte de África: Marruecos, Argelia y Túnez.'),
  R('apalaches', 'range', 'america', 2, 'Apalaches', 'Apalaches', 'los Apalaches', 'regions', ['APPALACHIAN MTS.'], 'Montañas muy antiguas y desgastadas del este de Norteamérica.'),
  R('caucaso', 'range', 'asia', 2, 'Cáucaso', 'Cáucaso', 'el Cáucaso', 'regions', ['CAUCASUS MTS.'], 'Se alza entre el mar Negro y el Caspio; su cima es el Elbrús (5.642 m).'),
  R('carpatos', 'range', 'europa', 2, 'Cárpatos', 'Cárpatos', 'los Cárpatos', 'regions', ['CARPATHIAN MOUNTAINS'], 'Forman un gran arco en Europa del Este, sobre todo en Rumanía.'),
  R('apeninos', 'range', 'europa', 2, 'Apeninos', 'Apeninos', 'los Apeninos', 'regions', ['APPENNINI'], 'Recorren Italia de norte a sur.'),
  R('divisoria', 'range', 'oceania', 2, 'Gran Cordillera Divisoria', 'Gran Cordillera Divisoria', 'la Gran Cordillera Divisoria', 'regions', ['GREAT DIVIDING RANGE'], 'Recorre todo el este de Australia.'),
  R('escandinavos', 'range', 'europa', 3, 'Alpes escandinavos', 'Alpes escandinavos', 'los Alpes escandinavos', 'regions', ['KJØLEN MOUNTAINS'], 'Son la columna vertebral de Noruega y Suecia.'),
  R('zagros', 'range', 'asia', 3, 'Montes Zagros', 'Zagros', 'los montes Zagros', 'regions', ['ZAGROS MOUNTAINS'], 'La gran cordillera de Irán.'),
  R('tianshan', 'range', 'asia', 3, 'Tian Shan', 'Tian Shan', 'el Tian Shan', 'regions', ['TIAN SHAN'], 'Sus «montañas celestiales» se reparten entre China y Asia Central.'),
  R('hindukush', 'range', 'asia', 3, 'Hindú Kush', 'Hindú Kush', 'el Hindú Kush', 'regions', ['HINDU KUSH'], 'Cordillera entre Afganistán y Pakistán.'),
  R('altai', 'range', 'asia', 3, 'Montes Altái', 'Altái', 'los montes Altái', 'regions', ['ALTAY MOUNTAINS'], 'Allí se juntan Rusia, China, Mongolia y Kazajistán.'),
  R('drakensberg', 'range', 'africa', 3, 'Drakensberg', 'Drakensberg', 'el Drakensberg', 'regions', ['DRAKENSBERG'], 'Es la cordillera más alta del sur de África.'),
  R('sierramadre', 'range', 'america', 3, 'Sierra Madre Occidental', 'Sierra Madre Occidental', 'la Sierra Madre Occidental', 'regions', ['SIERRA MADRE OCCIDENTAL'], 'Recorre el oeste de México.'),
  R('karakorum', 'range', 'asia', 3, 'Karakórum', 'Karakórum', 'el Karakórum', 'regions', ['KARAKORAM RA.'], 'Aquí está el K2 (8.611 m), la segunda montaña más alta del mundo.'),

  // ───────────── Desiertos, llanuras y mesetas ─────────────
  R('sahara', 'desert', 'africa', 1, 'Desierto del Sahara', 'Sahara', 'el desierto del Sahara', 'regions', ['SAHARA'], 'Es el mayor desierto cálido del mundo.'),
  R('gobi', 'desert', 'asia', 2, 'Desierto de Gobi', 'Gobi', 'el desierto de Gobi', 'regions', ['GOBI DESERT'], 'Un desierto frío entre China y Mongolia.'),
  R('kalahari', 'desert', 'africa', 2, 'Desierto del Kalahari', 'Kalahari', 'el desierto del Kalahari', 'regions', ['KALAHARI DESERT'], 'Ocupa buena parte de Botsuana, Namibia y Sudáfrica.'),
  R('atacama', 'desert', 'america', 2, 'Desierto de Atacama', 'Atacama', 'el desierto de Atacama', 'regions', ['DESIERTO DE ATACAMA'], 'Está en Chile y es el desierto no polar más seco del mundo.'),
  R('arabigo', 'desert', 'asia', 2, 'Desierto de Rub al-Jali', 'Rub al-Jali', 'el desierto de Rub al-Jali', 'regions', ['RUB’ AL KHALI'], '«El cuarto vacío»: el mayor desierto de arena continua del mundo, en la península arábiga.'),
  R('namib', 'desert', 'africa', 3, 'Desierto del Namib', 'Namib', 'el desierto del Namib', 'regions', ['NAMIB DESERT'], 'Junto a la costa de Namibia; es uno de los desiertos más antiguos del planeta.'),
  R('victoria-des', 'desert', 'oceania', 3, 'Gran Desierto de Victoria', 'Gran Desierto de Victoria', 'el Gran Desierto de Victoria', 'regions', ['GREAT VICTORIA DESERT'], 'Es el mayor desierto de Australia.'),
  R('taklamakan', 'desert', 'asia', 3, 'Desierto de Taklamakán', 'Taklamakán', 'el desierto de Taklamakán', 'regions', ['TAKLIMAKAN DESERT'], 'Gran desierto de arena del oeste de China.'),
  R('thar', 'desert', 'asia', 3, 'Desierto de Thar', 'Thar', 'el desierto de Thar', 'regions', ['THAR DESERT'], 'Se extiende entre la India y Pakistán.'),
  R('tibet', 'plain', 'asia', 2, 'Meseta del Tíbet', 'Meseta del Tíbet', 'la meseta del Tíbet', 'regions', ['PLATEAU OF TIBET'], '«El techo del mundo»: la meseta más alta y extensa de la Tierra.'),
  R('llanuras', 'plain', 'america', 3, 'Grandes Llanuras', 'Grandes Llanuras', 'las Grandes Llanuras', 'regions', ['GREAT PLAINS'], 'Inmensas praderas en el centro de Estados Unidos y Canadá.'),
  R('llanura-europea', 'plain', 'europa', 3, 'Gran Llanura Europea', 'Gran Llanura Europea', 'la Gran Llanura Europea', 'regions', ['NORTHERN EUROPEAN PLAIN'], 'Se extiende desde Francia hasta Rusia.'),
  R('pampa', 'plain', 'america', 3, 'La Pampa', 'Pampa', 'la Pampa', 'regions', ['PAMPAS'], 'Llanura muy fértil de Argentina y Uruguay.'),

  // ───────────── Mares y lagos ─────────────
  R('mediterraneo', 'sea', 'europa', 1, 'Mar Mediterráneo', 'Mediterráneo', 'el mar Mediterráneo', 'marine', ['Mediterranean Sea', 'Balearic Sea', 'Tyrrhenian Sea', 'Ionian Sea', 'Adriatic Sea', 'Aegean Sea', 'Golfe du Lion', 'Strait of Gibraltar'], 'Casi cerrado: solo se comunica con el Atlántico por el estrecho de Gibraltar.'),
  R('caribe', 'sea', 'america', 1, 'Mar Caribe', 'Caribe', 'el mar Caribe', 'marine', ['Caribbean Sea'], 'Lo rodean América Central, América del Sur y las Antillas.'),
  R('norte', 'sea', 'europa', 1, 'Mar del Norte', 'Mar del Norte', 'el mar del Norte', 'marine', ['North Sea'], 'Está entre Gran Bretaña, Noruega, Dinamarca y los Países Bajos.'),
  R('rojo', 'sea', 'africa', 1, 'Mar Rojo', 'Mar Rojo', 'el mar Rojo', 'marine', ['Red Sea'], 'Separa África de la península arábiga.'),
  R('baltico', 'sea', 'europa', 2, 'Mar Báltico', 'Báltico', 'el mar Báltico', 'marine', ['Baltic Sea', 'Gulf of Bothnia', 'Gulf of Finland'], 'Un mar poco salado del norte de Europa.'),
  R('negro', 'sea', 'europa', 2, 'Mar Negro', 'Mar Negro', 'el mar Negro', 'marine', ['Black Sea'], 'Se comunica con el Mediterráneo por los estrechos del Bósforo y los Dardanelos.'),
  R('mexico', 'sea', 'america', 2, 'Golfo de México', 'Golfo de México', 'el golfo de México', 'marine', ['Gulf of Mexico', 'Bahía de Campeche'], 'Lo rodean México, Estados Unidos y Cuba.'),
  R('caspio', 'sea', 'asia', 2, 'Mar Caspio', 'Mar Caspio', 'el mar Caspio', 'marine', ['Caspian Sea'], 'Aunque se llama mar, es el lago más grande del mundo.'),
  R('persico', 'sea', 'asia', 2, 'Golfo Pérsico', 'Golfo Pérsico', 'el golfo Pérsico', 'marine', ['Persian Gulf'], 'Bajo sus aguas y orillas hay algunas de las mayores reservas de petróleo del mundo.'),
  R('arabigo-mar', 'sea', 'asia', 2, 'Mar Arábigo', 'Mar Arábigo', 'el mar Arábigo', 'marine', ['Arabian Sea'], 'Parte del océano Índico entre la península arábiga y la India.'),
  R('bengala', 'sea', 'asia', 2, 'Golfo de Bengala', 'Golfo de Bengala', 'el golfo de Bengala', 'marine', ['Bay of Bengal'], 'Al este de la India; en él desembocan el Ganges y el Brahmaputra.'),
  R('china-mer', 'sea', 'asia', 2, 'Mar de la China Meridional', 'Mar de la China Meridional', 'el mar de la China Meridional', 'marine', ['South China Sea'], 'Entre China, Vietnam, Filipinas y Borneo.'),
  R('japon', 'sea', 'asia', 2, 'Mar de Japón', 'Mar de Japón', 'el mar de Japón', 'marine', ['Sea of Japan'], 'Entre Japón, Corea y Rusia.'),
  R('bering', 'sea', 'asia', 3, 'Mar de Bering', 'Mar de Bering', 'el mar de Bering', 'marine', ['Bering Sea'], 'Separa Rusia de Alaska.'),
  R('coral', 'sea', 'oceania', 3, 'Mar de Coral', 'Mar de Coral', 'el mar de Coral', 'marine', ['Coral Sea'], 'En él está la Gran Barrera de Coral.'),
  R('guinea', 'sea', 'africa', 3, 'Golfo de Guinea', 'Golfo de Guinea', 'el golfo de Guinea', 'marine', ['Gulf of Guinea'], 'Gran golfo del Atlántico en la costa de África Occidental.'),
  R('hudson', 'sea', 'america', 3, 'Bahía de Hudson', 'Bahía de Hudson', 'la bahía de Hudson', 'marine', ['Hudson Bay'], 'Un enorme mar interior en el norte de Canadá.'),
  R('vizcaya', 'sea', 'europa', 3, 'Golfo de Vizcaya', 'Golfo de Vizcaya', 'el golfo de Vizcaya', 'marine', ['Bay of Biscay'], 'Entre España y Francia; su parte española es el mar Cantábrico.'),
  R('noruega', 'sea', 'europa', 3, 'Mar de Noruega', 'Mar de Noruega', 'el mar de Noruega', 'marine', ['Norwegian Sea'], 'Frente a la costa de Noruega, ya muy cerca del Ártico.'),
  R('ojotsk', 'sea', 'asia', 3, 'Mar de Ojotsk', 'Mar de Ojotsk', 'el mar de Ojotsk', 'marine', ['Sea of Okhotsk'], 'En el extremo oriental de Rusia; se congela en invierno.'),
  R('tasmania', 'sea', 'oceania', 3, 'Mar de Tasmania', 'Mar de Tasmania', 'el mar de Tasmania', 'marine', ['Tasman Sea'], 'Separa Australia de Nueva Zelanda.'),
  R('victoria-lago', 'lake', 'africa', 2, 'Lago Victoria', 'Lago Victoria', 'el lago Victoria', 'lakes', ['Lake Victoria'], 'Es el mayor lago de África; de él sale el Nilo Blanco.'),
  R('superior', 'lake', 'america', 2, 'Lago Superior', 'Lago Superior', 'el lago Superior', 'lakes', ['Lake Superior'], 'El mayor de los Grandes Lagos de Norteamérica.'),
  R('baikal', 'lake', 'asia', 2, 'Lago Baikal', 'Lago Baikal', 'el lago Baikal', 'lakes', ['Lake Baikal'], 'Es el lago más profundo y más antiguo del mundo.'),
  R('titicaca', 'lake', 'america', 2, 'Lago Titicaca', 'Lago Titicaca', 'el lago Titicaca', 'lakes', ['Lago Titicaca', 'Lake Titicaca'], 'Entre Perú y Bolivia: el lago navegable más alto del mundo.'),
  R('tanganica', 'lake', 'africa', 3, 'Lago Tanganica', 'Lago Tanganica', 'el lago Tanganica', 'lakes', ['Lake Tanganyika'], 'Es el lago más largo del mundo.'),
  R('michigan', 'lake', 'america', 3, 'Lago Míchigan', 'Lago Míchigan', 'el lago Míchigan', 'lakes', ['Lake Michigan'], 'El único de los Grandes Lagos que está entero en Estados Unidos.'),
  R('ladoga', 'lake', 'europa', 3, 'Lago Ládoga', 'Lago Ládoga', 'el lago Ládoga', 'lakes', ['Lake Ladoga'], 'Es el lago más grande de Europa.'),
  R('malaui', 'lake', 'africa', 3, 'Lago Malaui', 'Lago Malaui', 'el lago Malaui', 'lakes', ['Lake Malawi'], 'Uno de los grandes lagos del valle del Rift, famoso por sus peces de colores.'),
];

export const RELIEF_BY_ID = Object.fromEntries(RELIEF.map((r) => [r.id, r]));
