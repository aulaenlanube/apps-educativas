// src/apps/sistema-solar/model/planetFacts.js
// Datos físicos de los cuerpos del Sistema Solar (sin imports de texturas: lo
// usan las misiones, la ficha y los tests).
//
// Fuente principal: NASA Planetary Fact Sheet (nssdc.gsfc.nasa.gov) — valores
// medios. Gravedad y temperatura de los gigantes: al nivel de 1 bar (no tienen
// suelo). Rotación con signo negativo = retrógrada. Lunas confirmadas en 2025
// (la cifra cambia con cada descubrimiento: Saturno pasó de 146 a 274 en 2025).

export const EARTH_RADIUS_KM = 6371;
export const AU_KM = 149597871;
export const LIGHT_KM_S = 299792.458;
export const G_EARTH = 9.8;

// Color de cada astro en la interfaz (chips, barras, órbitas)
export const BODY_COLOR = {
  sun: '#FDB813', mercury: '#A5A5A5', venus: '#E3BB76', earth: '#22A6B3', moon: '#D4D4D8',
  mars: '#EB4D4B', jupiter: '#F9CA24', saturn: '#F0932B', uranus: '#7ED6DF', neptune: '#6272ff',
};

export const BODY_ORDER = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
export const PLANET_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

export const FACTS = {
  sun: {
    id: 'sun', name: 'Sol', kind: 'star', typeLabel: 'Estrella · enana amarilla G2',
    diameterKm: 1392700, radiusRel: 109.2,
    massKg: 1.989e30, massEarth: 333000, density: 1.41,
    gravity: 274, escapeKmS: 617.7,
    rotationHours: 609.1, // ~25,4 días en el ecuador (unos 35 en los polos)
    dayHours: null, orbitDays: null, au: 0, distMkm: 0, orbitKmS: null, eccentricity: null,
    obliquityDeg: 7.25,
    tempMeanC: 5500, tempText: '5.500 °C en la superficie · 15 millones °C en el núcleo',
    moons: null, rings: false,
    magnetic: 'Muy intenso y cambiante: se invierte cada 11 años (ciclo solar)',
    atmosphere: 'Cromosfera y corona de plasma (1–3 millones °C)',
    composition: '73 % hidrógeno, 25 % helio (en masa) y trazas de oxígeno, carbono…',
    ageText: 'Unos 4.600 millones de años',
  },
  mercury: {
    id: 'mercury', name: 'Mercurio', kind: 'planet', typeLabel: 'Planeta rocoso (interior)',
    diameterKm: 4879, radiusRel: 0.383,
    massKg: 3.30e23, massEarth: 0.0553, density: 5.43,
    gravity: 3.7, escapeKmS: 4.3,
    rotationHours: 1407.6, dayHours: 4222.6, orbitDays: 88.0,
    au: 0.387, distMkm: 57.9, orbitKmS: 47.4, eccentricity: 0.206, obliquityDeg: 0.034,
    tempMeanC: 167, tempText: 'De −173 °C (noche) a 427 °C (día)',
    moons: 0, rings: false,
    magnetic: 'Débil (≈1 % del terrestre)',
    atmosphere: 'Exosfera casi vacía: oxígeno, sodio, hidrógeno, helio y potasio',
    composition: 'Enorme núcleo de hierro (más del 80 % del radio) y manto de silicatos',
    pressureText: 'Prácticamente 0',
  },
  venus: {
    id: 'venus', name: 'Venus', kind: 'planet', typeLabel: 'Planeta rocoso (interior)',
    diameterKm: 12104, radiusRel: 0.950,
    massKg: 4.87e24, massEarth: 0.815, density: 5.24,
    gravity: 8.9, escapeKmS: 10.4,
    rotationHours: -5832.5, dayHours: 2802.0, orbitDays: 224.7,
    au: 0.723, distMkm: 108.2, orbitKmS: 35.0, eccentricity: 0.007, obliquityDeg: 177.4,
    tempMeanC: 464, tempText: '464 °C casi constantes (día y noche)',
    moons: 0, rings: false,
    magnetic: 'No tiene campo magnético propio',
    atmosphere: '96,5 % CO₂ y 3,5 % N₂, con nubes de ácido sulfúrico',
    composition: 'Silicatos y núcleo de hierro y níquel, parecido a la Tierra',
    pressureText: '92 veces la terrestre (92 bar)',
  },
  earth: {
    id: 'earth', name: 'Tierra', kind: 'planet', typeLabel: 'Planeta rocoso (interior)',
    diameterKm: 12756, radiusRel: 1,
    massKg: 5.97e24, massEarth: 1, density: 5.51,
    gravity: 9.8, escapeKmS: 11.2,
    rotationHours: 23.93, dayHours: 24.0, orbitDays: 365.25,
    au: 1.0, distMkm: 149.6, orbitKmS: 29.8, eccentricity: 0.017, obliquityDeg: 23.44,
    tempMeanC: 15, tempText: 'De −89 °C (Antártida) a 57 °C (desierto)',
    moons: 1, rings: false,
    magnetic: 'Sí, generado por el núcleo externo líquido (geodinamo)',
    atmosphere: '78 % N₂, 21 % O₂, 0,9 % argón y 0,04 % CO₂',
    composition: 'Hierro (32 %), oxígeno (30 %), silicio (15 %), magnesio (14 %)…',
    pressureText: '1 bar (nivel del mar)',
  },
  moon: {
    id: 'moon', name: 'Luna', kind: 'moon', typeLabel: 'Satélite natural de la Tierra',
    diameterKm: 3475, radiusRel: 0.273,
    massKg: 7.3e22, massEarth: 0.0123, density: 3.34,
    gravity: 1.6, escapeKmS: 2.4,
    rotationHours: 655.7, dayHours: 708.7, orbitDays: 27.3,
    au: 1.0, distMkm: 0.384, orbitKmS: 1.0, eccentricity: 0.055, obliquityDeg: 6.7,
    tempMeanC: -20, tempText: 'De −173 °C (noche) a 127 °C (día)',
    moons: null, rings: false,
    magnetic: 'No tiene campo global (sí restos magnetizados en las rocas)',
    atmosphere: 'Exosfera prácticamente inexistente',
    composition: 'Silicatos (anortosita y basalto) y un núcleo pequeño de hierro',
    pressureText: 'Prácticamente 0',
    distanceNote: 'A 384.400 km de la Tierra (1,3 segundos luz)',
  },
  mars: {
    id: 'mars', name: 'Marte', kind: 'planet', typeLabel: 'Planeta rocoso (interior)',
    diameterKm: 6792, radiusRel: 0.532,
    massKg: 6.42e23, massEarth: 0.107, density: 3.93,
    gravity: 3.7, escapeKmS: 5.0,
    rotationHours: 24.62, dayHours: 24.66, orbitDays: 687.0,
    au: 1.524, distMkm: 228.0, orbitKmS: 24.1, eccentricity: 0.094, obliquityDeg: 25.2,
    tempMeanC: -65, tempText: 'De −140 °C (polos) a 20 °C (ecuador, en verano)',
    moons: 2, rings: false,
    magnetic: 'No tiene campo global (lo perdió hace miles de millones de años)',
    atmosphere: '95 % CO₂, 2,8 % N₂ y 2 % argón; muy tenue',
    composition: 'Basalto rico en hierro; el óxido de hierro del polvo lo tiñe de rojo',
    pressureText: '0,006 bar (menos del 1 % de la terrestre)',
  },
  jupiter: {
    id: 'jupiter', name: 'Júpiter', kind: 'planet', typeLabel: 'Gigante gaseoso (exterior)',
    diameterKm: 142984, radiusRel: 10.97,
    massKg: 1.898e27, massEarth: 317.8, density: 1.33,
    gravity: 23.1, escapeKmS: 59.5,
    rotationHours: 9.93, dayHours: 9.93, orbitDays: 4331,
    au: 5.204, distMkm: 778.5, orbitKmS: 13.1, eccentricity: 0.049, obliquityDeg: 3.1,
    tempMeanC: -110, tempText: '−110 °C en lo alto de las nubes',
    moons: 95, moonsText: '95 (y siguen apareciendo)', rings: true, ringsText: 'Sí, muy tenues (de polvo)',
    magnetic: 'El más potente de los planetas: unas 20.000 veces el terrestre (momento magnético)',
    atmosphere: '≈ 90 % H₂ y 10 % He (en volumen); nubes de amoníaco',
    composition: 'Hidrógeno y helio; en su interior el hidrógeno se vuelve metálico',
    pressureText: 'Sin superficie: los datos se dan a 1 bar',
  },
  saturn: {
    id: 'saturn', name: 'Saturno', kind: 'planet', typeLabel: 'Gigante gaseoso (exterior)',
    diameterKm: 120536, radiusRel: 9.14,
    massKg: 5.68e26, massEarth: 95.2, density: 0.687,
    gravity: 9.0, escapeKmS: 35.5,
    rotationHours: 10.66, dayHours: 10.66, orbitDays: 10747,
    au: 9.572, distMkm: 1432.0, orbitKmS: 9.7, eccentricity: 0.052, obliquityDeg: 26.7,
    tempMeanC: -140, tempText: '−140 °C en lo alto de las nubes',
    moons: 274, moonsText: '274 (récord, 2025)', rings: true, ringsText: 'Sí: hielo y roca, más de 270.000 km de diámetro',
    magnetic: 'Sí, unas 580 veces el terrestre (momento magnético)',
    atmosphere: '≈ 96 % H₂ y 3 % He; nubes de amoníaco',
    composition: 'Hidrógeno y helio; es el planeta menos denso (menos que el agua)',
    pressureText: 'Sin superficie: los datos se dan a 1 bar',
  },
  uranus: {
    id: 'uranus', name: 'Urano', kind: 'planet', typeLabel: 'Gigante helado (exterior)',
    diameterKm: 51118, radiusRel: 3.98,
    massKg: 8.68e25, massEarth: 14.5, density: 1.27,
    gravity: 8.7, escapeKmS: 21.3,
    rotationHours: -17.24, dayHours: 17.24, orbitDays: 30589,
    au: 19.16, distMkm: 2867.0, orbitKmS: 6.8, eccentricity: 0.047, obliquityDeg: 97.8,
    tempMeanC: -195, tempText: '−195 °C (mínimo de −224 °C, el más frío)',
    moons: 29, moonsText: '29 (la última, en 2025)', rings: true, ringsText: 'Sí: 13 anillos oscuros y estrechos',
    magnetic: 'Sí, muy inclinado y desplazado del centro',
    atmosphere: '≈ 83 % H₂, 15 % He y 2 % metano (le da el color cian)',
    composition: 'Manto de «hielos» (agua, amoníaco, metano) sobre un núcleo rocoso',
    pressureText: 'Sin superficie: los datos se dan a 1 bar',
  },
  neptune: {
    id: 'neptune', name: 'Neptuno', kind: 'planet', typeLabel: 'Gigante helado (exterior)',
    diameterKm: 49528, radiusRel: 3.86,
    massKg: 1.02e26, massEarth: 17.1, density: 1.64,
    gravity: 11.0, escapeKmS: 23.5,
    rotationHours: 16.11, dayHours: 16.11, orbitDays: 59800,
    au: 30.07, distMkm: 4495.0, orbitKmS: 5.4, eccentricity: 0.010, obliquityDeg: 28.3,
    tempMeanC: -200, tempText: '−200 °C en lo alto de las nubes',
    moons: 16, moonsText: '16', rings: true, ringsText: 'Sí: 5 anillos oscuros y tenues',
    magnetic: 'Sí, muy inclinado (47°) respecto al eje de giro',
    atmosphere: '≈ 80 % H₂, 19 % He y 1,5 % metano',
    composition: 'Manto de «hielos» (agua, amoníaco, metano) sobre un núcleo rocoso',
    pressureText: 'Sin superficie: los datos se dan a 1 bar',
  },
};

// Misiones espaciales destacadas (año · nombre · agencia · logro).
export const SPACE_MISSIONS = {
  sun: [
    { year: '1995', name: 'SOHO', agency: 'ESA/NASA', text: 'Vigila el Sol sin descanso desde el punto L1, a 1,5 millones de km.' },
    { year: '2018', name: 'Parker Solar Probe', agency: 'NASA', text: 'Atraviesa la corona: en 2024 pasó a 6,1 millones de km de la superficie, el objeto humano más rápido.' },
    { year: '2020', name: 'Solar Orbiter', agency: 'ESA', text: 'Primeras imágenes de los polos del Sol.' },
  ],
  mercury: [
    { year: '1974', name: 'Mariner 10', agency: 'NASA', text: 'Primera nave en visitarlo: fotografió casi la mitad de su superficie.' },
    { year: '2011', name: 'MESSENGER', agency: 'NASA', text: 'Primera en orbitarlo; confirmó hielo de agua en cráteres polares en sombra.' },
    { year: '2018', name: 'BepiColombo', agency: 'ESA/JAXA', text: 'Lanzada en 2018; llega a su órbita a finales de 2026.' },
  ],
  venus: [
    { year: '1970', name: 'Venera 7', agency: 'URSS', text: 'Primer aterrizaje con éxito en otro planeta (resistió 23 minutos).' },
    { year: '1990', name: 'Magellan', agency: 'NASA', text: 'Cartografió el 98 % de la superficie con radar, atravesando las nubes.' },
    { year: '2006', name: 'Venus Express', agency: 'ESA', text: 'Estudió su atmósfera y halló indicios de volcanismo reciente.' },
  ],
  earth: [
    { year: '1957', name: 'Sputnik 1', agency: 'URSS', text: 'Primer satélite artificial de la historia.' },
    { year: '1998', name: 'Estación Espacial Internacional', agency: '5 agencias', text: 'Laboratorio en órbita a ~400 km, habitado sin interrupción desde el año 2000.' },
    { year: '2014', name: 'Copernicus (Sentinel)', agency: 'UE/ESA', text: 'Satélites que vigilan clima, océanos, incendios y cultivos.' },
  ],
  moon: [
    { year: '1959', name: 'Luna 2', agency: 'URSS', text: 'Primer objeto humano en llegar a la Luna.' },
    { year: '1969', name: 'Apolo 11', agency: 'NASA', text: 'Armstrong y Aldrin, primeras personas en pisarla.' },
    { year: '2019', name: "Chang'e 4", agency: 'CNSA', text: 'Primer alunizaje en la cara oculta.' },
  ],
  mars: [
    { year: '1965', name: 'Mariner 4', agency: 'NASA', text: 'Primeras fotos de cerca: un mundo lleno de cráteres.' },
    { year: '2012', name: 'Curiosity', agency: 'NASA', text: 'Rover que demostró que el cráter Gale tuvo un lago habitable.' },
    { year: '2021', name: 'Perseverance + Ingenuity', agency: 'NASA', text: 'Recoge muestras en el cráter Jezero; Ingenuity fue el primer helicóptero en otro planeta.' },
  ],
  jupiter: [
    { year: '1979', name: 'Voyager 1 y 2', agency: 'NASA', text: 'Descubrieron volcanes activos en Ío y los anillos de Júpiter.' },
    { year: '1995', name: 'Galileo', agency: 'NASA', text: 'Primera en orbitarlo; halló indicios de un océano bajo el hielo de Europa.' },
    { year: '2016', name: 'Juno', agency: 'NASA', text: 'Estudia su interior y polos; reveló un núcleo «difuso».' },
    { year: '2023', name: 'JUICE', agency: 'ESA', text: 'En camino a las lunas heladas (llegada prevista en 2031).' },
  ],
  saturn: [
    { year: '1979', name: 'Pioneer 11', agency: 'NASA', text: 'Primera nave en visitarlo.' },
    { year: '2004', name: 'Cassini-Huygens', agency: 'NASA/ESA/ASI', text: '13 años en órbita; Huygens aterrizó en Titán en 2005.' },
    { year: '2028', name: 'Dragonfly', agency: 'NASA', text: 'Dron que volará sobre Titán (lanzamiento previsto en 2028).' },
  ],
  uranus: [
    { year: '1986', name: 'Voyager 2', agency: 'NASA', text: 'La única visita hasta hoy: descubrió 10 lunas y 2 anillos.' },
  ],
  neptune: [
    { year: '1989', name: 'Voyager 2', agency: 'NASA', text: 'Única visita: fotografió la Gran Mancha Oscura y los géiseres de Tritón.' },
  ],
};

/* ──────────────────────── Formato (es-ES) ──────────────────────── */

// Número con punto de millares y coma decimal (siempre agrupa, también 4 cifras).
export function fmt(n, decimals = 0) {
  if (n == null || Number.isNaN(n)) return '—';
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '−' : ''}${grouped}${dec ? `,${dec}` : ''}`;
}

// Cifras significativas razonables según el tamaño del número.
export function fmtSmart(n) {
  if (n == null) return '—';
  const a = Math.abs(n);
  if (a >= 100) return fmt(n, 0);
  if (a >= 10) return fmt(n, 1).replace(/,0$/, '');
  if (a >= 1) return fmt(n, 2).replace(/0$/, '').replace(/,$/, '');
  return fmt(n, 3).replace(/0+$/, '').replace(/,$/, '');
}

// Duración a partir de horas: "9 h 56 min", "58,6 días", "11,9 años".
export function fmtHours(hours) {
  if (hours == null) return '—';
  const h = Math.abs(hours);
  if (h < 48) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    if (mm === 60) return `${hh + 1} h`;
    return mm ? `${hh} h ${mm} min` : `${hh} h`;
  }
  return fmtDays(h / 24);
}

export function fmtDays(days) {
  if (days == null) return '—';
  if (days < 2) return fmtHours(days * 24);
  if (days < 1000) return `${fmtSmart(days)} días`;
  return `${fmtSmart(days / 365.25)} años`;
}

// Segundos → "8 min 19 s", "4 h 10 min", "1,3 s"
export function fmtSeconds(sec) {
  if (sec < 60) return `${fmtSmart(sec)} s`;
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return s ? `${m} min ${s} s` : `${m} min`;
  }
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Horas de viaje → texto legible (días/años)
export function fmtTravel(hours) {
  if (hours < 48) return fmtHours(hours);
  const days = hours / 24;
  if (days < 730) return `${fmt(Math.round(days))} días`;
  const years = days / 365.25;
  return years >= 100 ? `${fmt(Math.round(years))} años` : `${fmtSmart(years)} años`;
}

// 1,9 · 10²⁷
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function fmtSci(n, decimals = 2) {
  if (!n) return '0';
  const e = Math.floor(Math.log10(Math.abs(n)));
  const m = n / 10 ** e;
  return `${fmt(m, decimals).replace(/,?0+$/, '')} · 10${String(e).split('').map((c) => SUP[c]).join('')}`;
}

export const fmtTemp = (c) => `${fmt(c)} °C`;

/* ──────────────────────── Cálculos didácticos ──────────────────────── */

// Veces que cabe la Tierra (volumen) — o que el cuerpo cabe en la Tierra.
export function volumeVsEarth(id) {
  const r = FACTS[id]?.radiusRel;
  if (!r) return null;
  const v = r ** 3;
  return v >= 1 ? { bigger: true, times: v } : { bigger: false, times: 1 / v };
}

// Lo que marcaría una báscula (kg) y el peso en newtons.
export function weightOn(id, massKg) {
  const g = FACTS[id]?.gravity;
  const m = Number(massKg);
  if (!g || !(m > 0)) return null;
  return { scaleKg: m * (g / G_EARTH), newtons: m * g, ratio: g / G_EARTH };
}

// Edad en años del planeta (años de su órbita alrededor del Sol).
export function ageOn(id, ageYears) {
  const T = FACTS[id]?.orbitDays;
  const a = Number(ageYears);
  if (!T || !(a > 0) || FACTS[id].kind !== 'planet') return null;
  return a * (365.25 / T);
}

// Tiempo que tarda la luz del Sol (s).
export const lightSeconds = (id) => (FACTS[id]?.au ? (FACTS[id].au * AU_KM) / LIGHT_KM_S : null);

// Altura de salto relativa (si en la Tierra saltas 50 cm…).
export const jumpOn = (id, cmOnEarth = 50) => (FACTS[id]?.gravity ? cmOnEarth * (G_EARTH / FACTS[id].gravity) : null);

export const bodyName = (id) => FACTS[id]?.name || id;

// Con artículo cuando lo lleva en español: «la Tierra», «el Sol», «la Luna».
const ARTICLE = { sun: 'el Sol', earth: 'la Tierra', moon: 'la Luna' };
export const theName = (id) => ARTICLE[id] || bodyName(id);
// «del Sol», «de la Tierra», «de Marte»
export const ofName = (id) => (id === 'sun' ? 'del Sol' : `de ${theName(id)}`);
export const TheName = (id) => { const n = theName(id); return n.charAt(0).toUpperCase() + n.slice(1); };
