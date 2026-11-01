// Comunidades autónomas, ciudades autónomas y provincias de España.
// Geometría: IGN (vía es-atlas), códigos INE. Población aproximada (millones, INE 2024).
//
// Comunidad: id, ine (código de comunidad en es-atlas), name, short (opciones y
//   mapas), cap, capAlt (otras respuestas válidas), capNote, trap (ciudad que
//   se confunde con la capital), zone (filtro del atlas), flag, color (mapa),
//   pop, t (escalón: 1 = comunidades, 2 = ciudades autónomas)
// Provincia: ine, name, cap, ccaa, alias, capQ (se pregunta su capital porque no
//   coincide con el nombre o tiene trampa), trap

export const ZONES = [
  { id: 'norte', label: 'Norte', color: '#7dd3fc' },
  { id: 'noreste', label: 'Noreste', color: '#fca5a5' },
  { id: 'levante', label: 'Levante y Baleares', color: '#a5b4fc' },
  { id: 'centro', label: 'Centro', color: '#bef264' },
  { id: 'sur', label: 'Sur', color: '#fde68a' },
  { id: 'canarias', label: 'Canarias', color: '#fdba74' },
];

export const CCAA = [
  { id: 'an', ine: '01', name: 'Andalucía', cap: 'Sevilla', zone: 'sur', color: '#fde68a', pop: 8.6, t: 1 },
  { id: 'ar', ine: '02', name: 'Aragón', cap: 'Zaragoza', zone: 'noreste', color: '#fca5a5', pop: 1.35, t: 1 },
  { id: 'as', ine: '03', name: 'Principado de Asturias', short: 'Asturias', cap: 'Oviedo', trap: 'Gijón', zone: 'norte', color: '#a7f3d0', pop: 1.0, t: 1 },
  { id: 'ib', ine: '04', name: 'Islas Baleares', cap: 'Palma', zone: 'levante', color: '#c4b5fd', pop: 1.2, t: 1, alias: ['Illes Balears', 'Baleares'] },
  { id: 'cn', ine: '05', name: 'Canarias', cap: 'Santa Cruz de Tenerife y Las Palmas de Gran Canaria', zone: 'canarias', color: '#fdba74', pop: 2.2, t: 1, capNote: 'La capitalidad es compartida entre Santa Cruz de Tenerife y Las Palmas de Gran Canaria.' },
  { id: 'cb', ine: '06', name: 'Cantabria', cap: 'Santander', zone: 'norte', color: '#fda4af', pop: 0.59, t: 1 },
  { id: 'cl', ine: '07', name: 'Castilla y León', cap: 'Valladolid', trap: 'Burgos', zone: 'centro', color: '#bef264', pop: 2.4, t: 1, capNote: 'No tiene capital oficial: Valladolid es la sede de las Cortes y de la Junta.' },
  { id: 'cm', ine: '08', name: 'Castilla-La Mancha', cap: 'Toledo', trap: 'Albacete', zone: 'centro', color: '#f9a8d4', pop: 2.1, t: 1 },
  { id: 'ct', ine: '09', name: 'Cataluña', cap: 'Barcelona', zone: 'noreste', color: '#fcd34d', pop: 8.0, t: 1, alias: ['Catalunya'] },
  { id: 'ex', ine: '11', name: 'Extremadura', cap: 'Mérida', trap: 'Badajoz', zone: 'centro', color: '#d8b4fe', pop: 1.05, t: 1, capNote: 'Mérida es la capital aunque no es capital de provincia.' },
  { id: 'ga', ine: '12', name: 'Galicia', cap: 'Santiago de Compostela', trap: 'A Coruña', zone: 'norte', color: '#7dd3fc', pop: 2.7, t: 1, capNote: 'Santiago es la capital aunque no es capital de provincia; la ciudad más poblada es Vigo.' },
  { id: 'md', ine: '13', name: 'Comunidad de Madrid', short: 'Madrid', cap: 'Madrid', zone: 'centro', color: '#fdba74', pop: 7.0, t: 1 },
  { id: 'mc', ine: '14', name: 'Región de Murcia', short: 'Murcia', cap: 'Murcia', trap: 'Cartagena', zone: 'levante', color: '#67e8f9', pop: 1.56, t: 1 },
  { id: 'nc', ine: '15', name: 'Comunidad Foral de Navarra', short: 'Navarra', cap: 'Pamplona', zone: 'norte', color: '#f0abfc', pop: 0.68, t: 1 },
  { id: 'pv', ine: '16', name: 'País Vasco', cap: 'Vitoria-Gasteiz', trap: 'Bilbao', zone: 'norte', color: '#6ee7b7', pop: 2.2, t: 1, alias: ['Euskadi'], capNote: 'Vitoria-Gasteiz es la sede del Gobierno y del Parlamento vascos; la ciudad más poblada es Bilbao.' },
  { id: 'vc', ine: '10', name: 'Comunidad Valenciana', cap: 'Valencia', trap: 'Alicante', zone: 'levante', color: '#a5b4fc', pop: 5.3, t: 1, alias: ['Comunitat Valenciana'] },
  { id: 'ri', ine: '17', name: 'La Rioja', cap: 'Logroño', zone: 'norte', color: '#c7d2fe', pop: 0.32, t: 1 },
  { id: 'ce', ine: '18', name: 'Ceuta', cap: 'Ceuta', zone: 'sur', color: '#fecaca', pop: 0.083, t: 2, autonomous: true },
  { id: 'ml', ine: '19', name: 'Melilla', cap: 'Melilla', zone: 'sur', color: '#fecaca', pop: 0.086, t: 2, autonomous: true },
];

export const PROVINCES = [
  { ine: '01', name: 'Álava', cap: 'Vitoria-Gasteiz', ccaa: 'pv', alias: ['Araba'], capQ: true },
  { ine: '02', name: 'Albacete', cap: 'Albacete', ccaa: 'cm' },
  { ine: '03', name: 'Alicante', cap: 'Alicante', ccaa: 'vc', alias: ['Alacant'] },
  { ine: '04', name: 'Almería', cap: 'Almería', ccaa: 'an' },
  { ine: '05', name: 'Ávila', cap: 'Ávila', ccaa: 'cl' },
  { ine: '06', name: 'Badajoz', cap: 'Badajoz', ccaa: 'ex' },
  { ine: '07', name: 'Islas Baleares', cap: 'Palma', ccaa: 'ib', alias: ['Illes Balears', 'Baleares'], capQ: true },
  { ine: '08', name: 'Barcelona', cap: 'Barcelona', ccaa: 'ct' },
  { ine: '09', name: 'Burgos', cap: 'Burgos', ccaa: 'cl' },
  { ine: '10', name: 'Cáceres', cap: 'Cáceres', ccaa: 'ex' },
  { ine: '11', name: 'Cádiz', cap: 'Cádiz', ccaa: 'an', capQ: true, trap: 'Jerez de la Frontera' },
  { ine: '12', name: 'Castellón', cap: 'Castellón de la Plana', ccaa: 'vc', alias: ['Castelló'] },
  { ine: '13', name: 'Ciudad Real', cap: 'Ciudad Real', ccaa: 'cm' },
  { ine: '14', name: 'Córdoba', cap: 'Córdoba', ccaa: 'an' },
  { ine: '15', name: 'A Coruña', cap: 'A Coruña', ccaa: 'ga', alias: ['La Coruña'] },
  { ine: '16', name: 'Cuenca', cap: 'Cuenca', ccaa: 'cm' },
  { ine: '17', name: 'Girona', cap: 'Girona', ccaa: 'ct', alias: ['Gerona'] },
  { ine: '18', name: 'Granada', cap: 'Granada', ccaa: 'an' },
  { ine: '19', name: 'Guadalajara', cap: 'Guadalajara', ccaa: 'cm' },
  { ine: '20', name: 'Gipuzkoa', cap: 'San Sebastián', ccaa: 'pv', alias: ['Guipúzcoa', 'Donostia'], capQ: true },
  { ine: '21', name: 'Huelva', cap: 'Huelva', ccaa: 'an' },
  { ine: '22', name: 'Huesca', cap: 'Huesca', ccaa: 'ar' },
  { ine: '23', name: 'Jaén', cap: 'Jaén', ccaa: 'an' },
  { ine: '24', name: 'León', cap: 'León', ccaa: 'cl' },
  { ine: '25', name: 'Lleida', cap: 'Lleida', ccaa: 'ct', alias: ['Lérida'] },
  { ine: '26', name: 'La Rioja', cap: 'Logroño', ccaa: 'ri', capQ: true },
  { ine: '27', name: 'Lugo', cap: 'Lugo', ccaa: 'ga' },
  { ine: '28', name: 'Madrid', cap: 'Madrid', ccaa: 'md' },
  { ine: '29', name: 'Málaga', cap: 'Málaga', ccaa: 'an' },
  { ine: '30', name: 'Murcia', cap: 'Murcia', ccaa: 'mc' },
  { ine: '31', name: 'Navarra', cap: 'Pamplona', ccaa: 'nc', capQ: true },
  { ine: '32', name: 'Ourense', cap: 'Ourense', ccaa: 'ga', alias: ['Orense'] },
  { ine: '33', name: 'Asturias', cap: 'Oviedo', ccaa: 'as', capQ: true, trap: 'Gijón' },
  { ine: '34', name: 'Palencia', cap: 'Palencia', ccaa: 'cl' },
  { ine: '35', name: 'Las Palmas', cap: 'Las Palmas de Gran Canaria', ccaa: 'cn' },
  { ine: '36', name: 'Pontevedra', cap: 'Pontevedra', ccaa: 'ga', capQ: true, trap: 'Vigo' },
  { ine: '37', name: 'Salamanca', cap: 'Salamanca', ccaa: 'cl' },
  { ine: '38', name: 'Santa Cruz de Tenerife', cap: 'Santa Cruz de Tenerife', ccaa: 'cn' },
  { ine: '39', name: 'Cantabria', cap: 'Santander', ccaa: 'cb', capQ: true },
  { ine: '40', name: 'Segovia', cap: 'Segovia', ccaa: 'cl' },
  { ine: '41', name: 'Sevilla', cap: 'Sevilla', ccaa: 'an' },
  { ine: '42', name: 'Soria', cap: 'Soria', ccaa: 'cl' },
  { ine: '43', name: 'Tarragona', cap: 'Tarragona', ccaa: 'ct' },
  { ine: '44', name: 'Teruel', cap: 'Teruel', ccaa: 'ar' },
  { ine: '45', name: 'Toledo', cap: 'Toledo', ccaa: 'cm' },
  { ine: '46', name: 'Valencia', cap: 'Valencia', ccaa: 'vc', alias: ['València'] },
  { ine: '47', name: 'Valladolid', cap: 'Valladolid', ccaa: 'cl' },
  { ine: '48', name: 'Bizkaia', cap: 'Bilbao', ccaa: 'pv', alias: ['Vizcaya'], capQ: true },
  { ine: '49', name: 'Zamora', cap: 'Zamora', ccaa: 'cl' },
  { ine: '50', name: 'Zaragoza', cap: 'Zaragoza', ccaa: 'ar' },
  { ine: '51', name: 'Ceuta', cap: 'Ceuta', ccaa: 'ce', autonomous: true },
  { ine: '52', name: 'Melilla', cap: 'Melilla', ccaa: 'ml', autonomous: true },
];

export const CCAA_BY_ID = Object.fromEntries(CCAA.map((c) => [c.id, c]));
export const CCAA_BY_INE = Object.fromEntries(CCAA.map((c) => [c.ine, c]));
export const PROV_BY_INE = Object.fromEntries(PROVINCES.map((p) => [p.ine, p]));

// Claves de las regiones en el mapa: comunidades por su id ('an'), provincias con 'p' + INE ('p28').
export const provKey = (p) => `p${p.ine}`;
// ¡Ojo! 'pv' (País Vasco) también empieza por p: las provincias son 'p' + dos cifras.
export const isProvKey = (key) => /^p\d\d$/.test(key);
export const provOfKey = (key) => (isProvKey(key) ? PROV_BY_INE[key.slice(1)] : null);
export const provincesOf = (ccaaId) => PROVINCES.filter((p) => p.ccaa === ccaaId);
export const ccaaShort = (c) => c.short || c.name;
export const ccaaFlag = (c) => `/images/flags/es/${c.id}.svg`;

// Banderas: las de franjas las dibuja tools/build-espana-geo.mjs según su
// Estatuto; Cataluña, Galicia y País Vasco vienen de flag-icons (MIT) y el
// resto de Wikimedia Commons.
export const FLAG_CREDITS = [
  { ids: ['an', 'cn', 'cb', 'ex', 'ri'], text: 'Andalucía, Canarias, Cantabria, Extremadura y La Rioja: dibujadas según su Estatuto de Autonomía.' },
  { ids: ['ct', 'ga', 'pv'], text: 'Cataluña, Galicia y País Vasco: flag-icons (licencia MIT).' },
  { ids: ['as', 'cm', 'vc', 'nc'], text: 'Asturias, Castilla-La Mancha, Comunidad Valenciana y Navarra: Wikimedia Commons, dominio público.' },
  { ids: ['ib', 'md', 'mc'], text: 'Islas Baleares, Comunidad de Madrid y Región de Murcia: Wikimedia Commons, CC0.' },
  { ids: ['cl'], text: 'Castilla y León: Rastrojo, Wikimedia Commons (CC BY 3.0).' },
  { ids: ['ar'], text: 'Aragón: Willtron y otros, Wikimedia Commons (CC BY-SA 3.0).' },
  { ids: ['ce'], text: 'Ceuta: Ulaidh, Wikimedia Commons (CC BY-SA 4.0).' },
  { ids: ['ml'], text: 'Melilla: Xinese-v y otros, Wikimedia Commons (CC BY-SA 3.0).' },
];
