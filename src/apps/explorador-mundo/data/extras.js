// Datos complementarios del Explorador del Mundo: territorios del mapa que no
// son países del juego, océanos, banderas parecidas y ciudades famosas.

// Geometrías que se dibujan y cuentan como parte de un país (posición de la ONU).
export const MERGE_INTO = {
  NCY: 'cy', // Chipre del Norte
  SOL: 'so', // Somalilandia
  344: 'cn', // Hong Kong
  446: 'cn', // Macao
  248: 'fi', // Åland
};

// Resto de geometrías: territorios dependientes, disputados o sin país.
// cont: continente al que pertenecen (minijuego "Toca el continente").
export const TERRITORIES = {
  '010': { name: 'Antártida', note: 'Continente sin países: lo regula el Tratado Antártico.', cont: 'antartida' },
  304: { name: 'Groenlandia', note: 'Territorio autónomo de Dinamarca.', cont: 'america' },
  732: { name: 'Sáhara Occidental', note: 'Territorio no autónomo según la ONU, pendiente de descolonización.', cont: 'africa' },
  158: { name: 'Taiwán', note: 'Tiene gobierno propio, pero la ONU no lo reconoce como Estado.', cont: 'asia' },
  KOS: { name: 'Kosovo', note: 'Declaró su independencia de Serbia en 2008; España no la reconoce.', cont: 'europa' },
  SIA: { name: 'Glaciar de Siachen', note: 'Zona disputada entre la India y Pakistán.', cont: 'asia' },
  630: { name: 'Puerto Rico', note: 'Estado libre asociado a Estados Unidos.', cont: 'america' },
  238: { name: 'Islas Malvinas', note: 'Administradas por el Reino Unido y reclamadas por Argentina.', cont: 'america' },
  540: { name: 'Nueva Caledonia', note: 'Territorio de Francia.', cont: 'oceania' },
  258: { name: 'Polinesia Francesa', note: 'Territorio de Francia.', cont: 'oceania' },
  260: { name: 'Tierras Australes Francesas', note: 'Territorio de Francia.', cont: 'antartida' },
  234: { name: 'Islas Feroe', note: 'Territorio autónomo de Dinamarca.', cont: 'europa' },
  '060': { name: 'Bermudas', note: 'Territorio del Reino Unido.', cont: 'america' },
  316: { name: 'Guam', note: 'Territorio de Estados Unidos.', cont: 'oceania' },
  580: { name: 'Islas Marianas del Norte', note: 'Territorio de Estados Unidos.', cont: 'oceania' },
  '016': { name: 'Samoa Americana', note: 'Territorio de Estados Unidos.', cont: 'oceania' },
  850: { name: 'Islas Vírgenes de EE. UU.', note: 'Territorio de Estados Unidos.', cont: 'america' },
  '092': { name: 'Islas Vírgenes Británicas', note: 'Territorio del Reino Unido.', cont: 'america' },
  136: { name: 'Islas Caimán', note: 'Territorio del Reino Unido.', cont: 'america' },
  796: { name: 'Islas Turcas y Caicos', note: 'Territorio del Reino Unido.', cont: 'america' },
  660: { name: 'Anguila', note: 'Territorio del Reino Unido.', cont: 'america' },
  500: { name: 'Montserrat', note: 'Territorio del Reino Unido.', cont: 'america' },
  533: { name: 'Aruba', note: 'País del Reino de los Países Bajos.', cont: 'america' },
  531: { name: 'Curazao', note: 'País del Reino de los Países Bajos.', cont: 'america' },
  534: { name: 'Sint Maarten', note: 'País del Reino de los Países Bajos.', cont: 'america' },
  663: { name: 'San Martín', note: 'Territorio de Francia.', cont: 'america' },
  652: { name: 'San Bartolomé', note: 'Territorio de Francia.', cont: 'america' },
  666: { name: 'San Pedro y Miquelón', note: 'Territorio de Francia.', cont: 'america' },
  876: { name: 'Wallis y Futuna', note: 'Territorio de Francia.', cont: 'oceania' },
  832: { name: 'Jersey', note: 'Dependencia de la Corona británica.', cont: 'europa' },
  831: { name: 'Guernsey', note: 'Dependencia de la Corona británica.', cont: 'europa' },
  833: { name: 'Isla de Man', note: 'Dependencia de la Corona británica.', cont: 'europa' },
  654: { name: 'Santa Elena', note: 'Territorio del Reino Unido.', cont: 'africa' },
  612: { name: 'Islas Pitcairn', note: 'Territorio del Reino Unido.', cont: 'oceania' },
  239: { name: 'Georgia del Sur', note: 'Territorio del Reino Unido, reclamado por Argentina.', cont: 'america' },
  '086': { name: 'Territorio Británico del Océano Índico', note: 'Territorio del Reino Unido.', cont: 'asia' },
  570: { name: 'Niue', note: 'Estado asociado a Nueva Zelanda.', cont: 'oceania' },
  184: { name: 'Islas Cook', note: 'Estado asociado a Nueva Zelanda.', cont: 'oceania' },
  574: { name: 'Isla Norfolk', note: 'Territorio de Australia.', cont: 'oceania' },
  334: { name: 'Islas Heard y McDonald', note: 'Territorio de Australia.', cont: 'antartida' },
  IOT: { name: 'Islas Christmas y Cocos', note: 'Territorios de Australia.', cont: 'asia' },
};

// Países sin geometría en la resolución 1:50m: se dibujan como un punto.
export const POINT_COUNTRIES = {
  tv: [179.2, -8.5], // Tuvalu (Funafuti)
};

// Océanos: punto donde se señala cada uno en el mapa.
export const OCEANS = [
  { id: 'pacifico', name: 'Pacífico', full: 'océano Pacífico', at: [-140, -5] },
  { id: 'atlantico', name: 'Atlántico', full: 'océano Atlántico', at: [-32, 12] },
  { id: 'indico', name: 'Índico', full: 'océano Índico', at: [78, -20] },
  { id: 'artico', name: 'Ártico', full: 'océano Glacial Ártico', at: [8, 83] },
  { id: 'antartico', name: 'Antártico', full: 'océano Glacial Antártico', at: [20, -60] },
];

// Banderas que se confunden entre sí: distractores en Medio y Examen.
export const SIMILAR_FLAGS = [
  ['td', 'ro', 'ad', 'md'],
  ['id', 'mc', 'pl', 'sg'],
  ['ie', 'ci', 'it', 'mx', 'hu'],
  ['nl', 'lu', 'ru', 'fr', 'hr', 'rs', 'si', 'sk', 'py'],
  ['co', 'ec', 've', 'bo'],
  ['au', 'nz', 'fj', 'tv'],
  ['no', 'is', 'dk', 'se', 'fi'],
  ['ar', 'uy', 'sv', 'ni', 'hn', 'gt'],
  ['ml', 'gn', 'sn', 'cm', 'gh', 'bf', 'bj', 'et'],
  ['ye', 'sy', 'eg', 'iq', 'sd'],
  ['ae', 'kw', 'jo', 'ps', 'sd'],
  ['lv', 'at', 'lb', 'pe', 'ca'],
  ['be', 'de', 'ug'],
  ['us', 'lr', 'my', 'cu', 'gr', 'uy'],
  ['bg', 'hu', 'ir', 'tj', 'in'],
  ['ee', 'bw', 'sl'],
  ['jp', 'bd', 'pw', 'kr'],
  ['tr', 'tn', 'dz', 'pk', 'mr', 'az'],
  ['ch', 'dk', 'to', 'ge'],
  ['cl', 'cz', 'cu', 'ph'],
  ['mm', 'gh', 'lt', 'bo'],
];

// Banderas prácticamente idénticas a este tamaño: nunca salen juntas.
export const IDENTICAL_FLAGS = [['id', 'mc'], ['td', 'ro'], ['nl', 'lu']];

// Ciudades famosas que no son capitales: [nombre, país, escalón, países que no
// pueden salir como distractor porque tienen una ciudad homónima].
export const CITIES = [
  ['Nueva York', 'us', 1], ['Los Ángeles', 'us', 1], ['Chicago', 'us', 2], ['San Francisco', 'us', 2], ['Miami', 'us', 2],
  ['Toronto', 'ca', 2], ['Montreal', 'ca', 2], ['Vancouver', 'ca', 3],
  ['Cancún', 'mx', 2], ['Monterrey', 'mx', 3],
  ['São Paulo', 'br', 1], ['Río de Janeiro', 'br', 1], ['Salvador de Bahía', 'br', 3],
  ['Rosario', 'ar', 3], ['Mendoza', 'ar', 3],
  ['Medellín', 'co', 2, ['es']], ['Cartagena de Indias', 'co', 2], ['Cali', 'co', 3],
  ['Cuzco', 'pe', 2], ['Arequipa', 'pe', 3],
  ['Valparaíso', 'cl', 2],
  ['Guayaquil', 'ec', 2],
  ['Santa Cruz de la Sierra', 'bo', 3],
  ['Maracaibo', 've', 3],
  ['Sídney', 'au', 1], ['Melbourne', 'au', 2], ['Perth', 'au', 3, ['gb']],
  ['Auckland', 'nz', 2],
  ['Shanghái', 'cn', 1], ['Hong Kong', 'cn', 2], ['Cantón', 'cn', 3],
  ['Osaka', 'jp', 2], ['Kioto', 'jp', 2], ['Hiroshima', 'jp', 2],
  ['Busan', 'kr', 3],
  ['Bombay', 'in', 2], ['Calcuta', 'in', 2], ['Bangalore', 'in', 3],
  ['Karachi', 'pk', 3], ['Lahore', 'pk', 3],
  ['Ciudad Ho Chi Minh', 'vn', 3],
  ['Estambul', 'tr', 1], ['Esmirna', 'tr', 3],
  ['Dubái', 'ae', 1],
  ['La Meca', 'sa', 2], ['Yeda', 'sa', 3],
  ['Tel Aviv', 'il', 2],
  ['Alejandría', 'eg', 2], ['Luxor', 'eg', 3],
  ['Casablanca', 'ma', 1], ['Marrakech', 'ma', 2], ['Fez', 'ma', 3],
  ['Johannesburgo', 'za', 2], ['Ciudad del Cabo', 'za', 2], ['Durban', 'za', 3],
  ['Lagos', 'ng', 2, ['pt']],
  ['Mombasa', 'ke', 3],
  ['Dar es Salaam', 'tz', 3], ['Zanzíbar', 'tz', 3],
  ['Abiyán', 'ci', 3],
  ['Marsella', 'fr', 1], ['Lyon', 'fr', 2], ['Niza', 'fr', 2], ['Burdeos', 'fr', 2],
  ['Milán', 'it', 1], ['Venecia', 'it', 1], ['Florencia', 'it', 2, ['co']], ['Nápoles', 'it', 2],
  ['Múnich', 'de', 1], ['Hamburgo', 'de', 2], ['Fráncfort', 'de', 2], ['Colonia', 'de', 3, ['uy']],
  ['Mánchester', 'gb', 2], ['Liverpool', 'gb', 2], ['Edimburgo', 'gb', 2],
  ['Barcelona', 'es', 1, ['ve']], ['Sevilla', 'es', 1], ['Bilbao', 'es', 2],
  ['Oporto', 'pt', 1],
  ['Zúrich', 'ch', 2], ['Ginebra', 'ch', 2],
  ['Róterdam', 'nl', 2],
  ['Amberes', 'be', 3], ['Brujas', 'be', 3],
  ['San Petersburgo', 'ru', 2],
  ['Cracovia', 'pl', 3],
  ['Salónica', 'gr', 3],
  ['Gotemburgo', 'se', 3],
  ['Salzburgo', 'at', 3],
  ['Dubrovnik', 'hr', 3],
  ['Odesa', 'ua', 3],
  ['Almatý', 'kz', 3],
  ['Samarcanda', 'uz', 3],
  ['Rangún', 'mm', 3],
  ['Colombo', 'lk', 3],
  ['Isfahán', 'ir', 3],
  ['Basora', 'iq', 3],
  ['Alepo', 'sy', 3],
].map(([name, c, t, notWith = []]) => ({ name, c, t, notWith }));
