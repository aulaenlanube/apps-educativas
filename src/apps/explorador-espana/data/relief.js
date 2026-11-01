// Relieve de España para el minijuego "Relieve".
//   Ríos: los grandes salen de Natural Earth 1:10m (dominio público) con
//     tools/build-espana-geo.mjs; los cortos de la vertiente cantábrica y de
//     Cataluña, que no están a esa escala, se trazan aquí de forma esquemática.
//   Sistemas montañosos: trazado esquemático de su eje, como en los mapas de
//     relieve de los libros de texto.
//   Mares: punto donde se señala cada uno. Islas: se recortan de la geometría
//     de las provincias (punto de referencia → isla más cercana).
// t: escalón 1-3 · v: vertiente del río (cantabrica | atlantica | mediterranea)

export const VERTIENTES = {
  cantabrica: { id: 'cantabrica', name: 'Cantábrica', full: 'vertiente cantábrica' },
  atlantica: { id: 'atlantica', name: 'Atlántica', full: 'vertiente atlántica' },
  mediterranea: { id: 'mediterranea', name: 'Mediterránea', full: 'vertiente mediterránea' },
};

export const RELIEF_TYPES = {
  river: { one: 'río', question: '¿Qué río es este?' },
  range: { one: 'sistema montañoso', question: '¿Qué sistema montañoso es este?' },
  sea: { one: 'mar', question: '¿Qué mar es este?' },
  island: { one: 'isla', question: '¿Qué isla es esta?' },
};

// ne: nombres en Natural Earth · line: trazado [lon, lat] si no está a esa escala
export const RIVERS = [
  { id: 'mino', name: 'Río Miño', short: 'Miño', art: 'el río Miño', v: 'atlantica', t: 1, ne: ['Mio', 'Minho'], fact: 'Es el río más caudaloso de Galicia; en su tramo final hace de frontera con Portugal.' },
  { id: 'duero', name: 'Río Duero', short: 'Duero', art: 'el río Duero', v: 'atlantica', t: 1, ne: ['Duero'], fact: 'Nace en los Picos de Urbión (Soria) y tiene la cuenca más grande de la península.' },
  { id: 'tajo', name: 'Río Tajo', short: 'Tajo', art: 'el río Tajo', v: 'atlantica', t: 1, ne: ['Tajo', 'Tejo'], fact: 'Es el río más largo de la península (1.007 km): pasa por Toledo y desemboca en Lisboa.' },
  { id: 'guadiana', name: 'Río Guadiana', short: 'Guadiana', art: 'el río Guadiana', v: 'atlantica', t: 1, ne: ['Guadiana'], fact: 'En su tramo final hace de frontera con Portugal.' },
  { id: 'guadalquivir', name: 'Río Guadalquivir', short: 'Guadalquivir', art: 'el río Guadalquivir', v: 'atlantica', t: 1, ne: ['Guadalquivir'], fact: 'Pasa por Córdoba y Sevilla, y es navegable hasta Sevilla.' },
  { id: 'ebro', name: 'Río Ebro', short: 'Ebro', art: 'el río Ebro', v: 'mediterranea', t: 1, ne: ['Ebro'], fact: 'Es el río más caudaloso de España: nace en Cantabria y forma un delta en Tarragona.' },
  { id: 'jucar', name: 'Río Júcar', short: 'Júcar', art: 'el río Júcar', v: 'mediterranea', t: 2, ne: ['Júcar'], fact: 'Nace en la serranía de Cuenca y desemboca en Cullera (Valencia).' },
  { id: 'segura', name: 'Río Segura', short: 'Segura', art: 'el río Segura', v: 'mediterranea', t: 2, ne: ['Segura'], fact: 'Riega la huerta de Murcia.' },
  { id: 'turia', name: 'Río Turia', short: 'Turia', art: 'el río Turia', v: 'mediterranea', t: 2, ne: ['Turia'], fact: 'Su antiguo cauce en Valencia es hoy un gran jardín.' },
  { id: 'nalon', name: 'Río Nalón', short: 'Nalón', art: 'el río Nalón', v: 'cantabrica', t: 2, line: [[-5.22, 43.08], [-5.56, 43.25], [-5.69, 43.3], [-5.9, 43.33], [-6.11, 43.49], [-6.08, 43.56]], fact: 'Es el río más largo de Asturias.' },
  { id: 'nervion', name: 'Río Nervión', short: 'Nervión', art: 'el río Nervión', v: 'cantabrica', t: 2, line: [[-3.03, 42.97], [-3.0, 43.0], [-3.0, 43.05], [-2.96, 43.14], [-2.93, 43.26], [-3.02, 43.32]], fact: 'Su ría atraviesa Bilbao.' },
  { id: 'sil', name: 'Río Sil', short: 'Sil', art: 'el río Sil', v: 'atlantica', t: 3, ne: ['Sil'], fact: 'Es el principal afluente del Miño y forma los cañones de la Ribeira Sacra.' },
  { id: 'genil', name: 'Río Genil', short: 'Genil', art: 'el río Genil', v: 'atlantica', t: 3, ne: ['Genil'], fact: 'Nace en Sierra Nevada, pasa por Granada y desemboca en el Guadalquivir.' },
  { id: 'pisuerga', name: 'Río Pisuerga', short: 'Pisuerga', art: 'el río Pisuerga', v: 'atlantica', t: 3, ne: ['Pisuerga'], fact: 'Pasa por Valladolid y desemboca en el Duero.' },
  { id: 'esla', name: 'Río Esla', short: 'Esla', art: 'el río Esla', v: 'atlantica', t: 3, ne: ['Esla'], fact: 'Afluente del Duero que recorre León y Zamora.' },
  { id: 'tormes', name: 'Río Tormes', short: 'Tormes', art: 'el río Tormes', v: 'atlantica', t: 3, ne: ['Tormes'], fact: 'Pasa por Salamanca y desemboca en el Duero.' },
  { id: 'segre', name: 'Río Segre', short: 'Segre', art: 'el río Segre', v: 'mediterranea', t: 3, ne: ['Segre'], fact: 'Nace en Francia, pasa por Lleida y desemboca en el Ebro.' },
  { id: 'llobregat', name: 'Río Llobregat', short: 'Llobregat', art: 'el río Llobregat', v: 'mediterranea', t: 3, line: [[2.02, 42.28], [1.85, 42.1], [1.83, 41.73], [1.93, 41.47], [2.1, 41.3]], fact: 'Desemboca junto a Barcelona, en El Prat.' },
  { id: 'ter', name: 'Río Ter', short: 'Ter', art: 'el río Ter', v: 'mediterranea', t: 3, line: [[2.27, 42.42], [2.19, 42.2], [2.28, 42.0], [2.55, 41.95], [2.82, 41.98], [3.0, 42.05], [3.2, 42.04]], fact: 'Pasa por Girona y desemboca en la Costa Brava.' },
  { id: 'bidasoa', name: 'Río Bidasoa', short: 'Bidasoa', art: 'el río Bidasoa', v: 'cantabrica', t: 3, line: [[-1.52, 43.14], [-1.68, 43.28], [-1.79, 43.34], [-1.79, 43.38]], fact: 'En su desembocadura hace de frontera con Francia.' },
];

export const RANGES = [
  { id: 'pirineos', name: 'Pirineos', short: 'Pirineos', art: 'los Pirineos', t: 1, line: [[-1.7, 43.1], [-1.0, 42.95], [-0.3, 42.8], [0.6, 42.65], [1.4, 42.5], [2.2, 42.4], [3.1, 42.45]], fact: 'Separan España de Francia; su pico más alto es el Aneto (3.404 m).' },
  { id: 'cantabrica', name: 'Cordillera Cantábrica', short: 'Cordillera Cantábrica', art: 'la cordillera Cantábrica', t: 1, line: [[-7.0, 42.95], [-6.2, 43.0], [-5.3, 43.05], [-4.6, 43.1], [-3.9, 43.05], [-3.4, 43.0]], fact: 'Recorre el norte de España; en ella están los Picos de Europa.' },
  { id: 'central', name: 'Sistema Central', short: 'Sistema Central', art: 'el Sistema Central', t: 1, line: [[-7.2, 40.25], [-6.4, 40.3], [-5.6, 40.3], [-4.9, 40.35], [-4.2, 40.8], [-3.6, 41.05], [-3.0, 41.2]], fact: 'Divide la Meseta en submeseta norte y sur; su pico más alto es el Almanzor (2.591 m).' },
  { id: 'iberico', name: 'Sistema Ibérico', short: 'Sistema Ibérico', art: 'el Sistema Ibérico', t: 1, line: [[-3.3, 42.2], [-2.6, 41.95], [-2.0, 41.6], [-1.6, 41.1], [-1.4, 40.6], [-1.1, 40.2], [-0.8, 39.9]], fact: 'Separa la Meseta de la depresión del Ebro; su cima es el Moncayo (2.314 m).' },
  { id: 'morena', name: 'Sierra Morena', short: 'Sierra Morena', art: 'Sierra Morena', t: 1, line: [[-7.4, 38.0], [-6.6, 37.95], [-5.8, 38.05], [-5.0, 38.25], [-4.2, 38.35], [-3.3, 38.35], [-2.6, 38.4]], fact: 'Separa la Meseta del valle del Guadalquivir.' },
  { id: 'beticos', name: 'Sistemas Béticos', short: 'Sistemas Béticos', art: 'los Sistemas Béticos', t: 1, lines: [[[-5.4, 36.95], [-4.6, 37.2], [-3.8, 37.55], [-3.0, 37.85], [-2.2, 38.1], [-1.4, 38.4], [-0.6, 38.75]], [[-5.6, 36.45], [-4.8, 36.7], [-3.9, 36.88], [-3.2, 37.05], [-2.4, 37.15]]], fact: 'Aquí está Sierra Nevada, con el Mulhacén (3.479 m), el pico más alto de la península.' },
  { id: 'toledo', name: 'Montes de Toledo', short: 'Montes de Toledo', art: 'los montes de Toledo', t: 2, line: [[-5.6, 39.45], [-5.0, 39.5], [-4.4, 39.55], [-3.8, 39.45]], fact: 'Separan las cuencas del Tajo y del Guadiana.' },
  { id: 'galaico', name: 'Macizo Galaico-Leonés', short: 'Macizo Galaico-Leonés', art: 'el macizo Galaico-Leonés', t: 2, line: [[-8.3, 42.9], [-7.6, 42.5], [-7.0, 42.3], [-6.4, 42.3]], fact: 'Montañas muy antiguas y desgastadas del noroeste.' },
  { id: 'vascos', name: 'Montes Vascos', short: 'Montes Vascos', art: 'los montes Vascos', t: 2, line: [[-3.2, 43.05], [-2.6, 43.02], [-2.0, 43.0], [-1.6, 43.05]], fact: 'Unen la cordillera Cantábrica con los Pirineos.' },
  { id: 'catalana', name: 'Cordillera Costero-Catalana', short: 'Costero-Catalana', art: 'la cordillera Costero-Catalana', t: 2, line: [[0.6, 40.9], [1.2, 41.3], [1.9, 41.6], [2.5, 41.9]], fact: 'Discurre paralela a la costa de Cataluña.' },
];

export const SEAS = [
  { id: 'cantabrico', name: 'Mar Cantábrico', short: 'Cantábrico', art: 'el mar Cantábrico', t: 1, at: [-4.5, 43.72], fact: 'Baña la costa norte, de Galicia al País Vasco.' },
  { id: 'atlantico', name: 'Océano Atlántico', short: 'Atlántico', art: 'el océano Atlántico', t: 1, at: [-10.0, 42.55], fact: 'Baña Galicia, el golfo de Cádiz y las islas Canarias.' },
  { id: 'mediterraneo', name: 'Mar Mediterráneo', short: 'Mediterráneo', art: 'el mar Mediterráneo', t: 1, at: [1.5, 40.3], fact: 'Baña la costa este y sur, y rodea las islas Baleares.' },
];

export const ISLANDS = [
  { id: 'mallorca', name: 'Mallorca', short: 'Mallorca', art: 'Mallorca', t: 2, at: [2.95, 39.6], prov: '07', fact: 'La isla más grande de España; su capital es Palma.' },
  { id: 'menorca', name: 'Menorca', short: 'Menorca', art: 'Menorca', t: 2, at: [4.1, 39.95], prov: '07', fact: 'La isla más oriental de España.' },
  { id: 'ibiza', name: 'Ibiza', short: 'Ibiza', art: 'Ibiza', t: 2, at: [1.4, 38.98], prov: '07', fact: 'Forma con Formentera las islas Pitiusas.' },
  { id: 'formentera', name: 'Formentera', short: 'Formentera', art: 'Formentera', t: 3, at: [1.47, 38.7], prov: '07', fact: 'La más pequeña de las Baleares habitadas.' },
  { id: 'tenerife', name: 'Tenerife', short: 'Tenerife', art: 'Tenerife', t: 2, at: [-16.6, 28.27], prov: '38', fact: 'En ella está el Teide (3.715 m), el pico más alto de España.' },
  { id: 'grancanaria', name: 'Gran Canaria', short: 'Gran Canaria', art: 'Gran Canaria', t: 2, at: [-15.6, 27.95], prov: '35', fact: 'Su capital, Las Palmas de Gran Canaria, es la ciudad más poblada de Canarias.' },
  { id: 'lanzarote', name: 'Lanzarote', short: 'Lanzarote', art: 'Lanzarote', t: 3, at: [-13.65, 29.05], prov: '35', fact: 'Famosa por sus paisajes volcánicos de Timanfaya.' },
  { id: 'fuerteventura', name: 'Fuerteventura', short: 'Fuerteventura', art: 'Fuerteventura', t: 3, at: [-14.0, 28.4], prov: '35', fact: 'La isla canaria más cercana a África.' },
  { id: 'lapalma', name: 'La Palma', short: 'La Palma', art: 'La Palma', t: 3, at: [-17.85, 28.65], prov: '38', fact: 'Llamada «la isla bonita»; en 2021 entró en erupción su volcán de Tajogaite.' },
  { id: 'lagomera', name: 'La Gomera', short: 'La Gomera', art: 'La Gomera', t: 3, at: [-17.23, 28.1], prov: '38', fact: 'Allí se conserva el silbo gomero, un lenguaje silbado.' },
  { id: 'elhierro', name: 'El Hierro', short: 'El Hierro', art: 'El Hierro', t: 3, at: [-18.0, 27.75], prov: '38', fact: 'La isla más occidental y meridional de España.' },
];

export const ALL_RELIEF = [
  ...RIVERS.map((r) => ({ ...r, type: 'river' })),
  ...RANGES.map((r) => ({ ...r, type: 'range' })),
  ...SEAS.map((r) => ({ ...r, type: 'sea' })),
  ...ISLANDS.map((r) => ({ ...r, type: 'island' })),
];
export const RELIEF_BY_ID = Object.fromEntries(ALL_RELIEF.map((r) => [r.id, r]));
