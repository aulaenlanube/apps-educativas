// Ambientes (clima / hora del día) del Laboratorio de Física, inspirados en los de
// "La Fortaleza". SOLO capa visual: no afectan a la física ni a las medidas.
// Cada simulación tiene un "tema" (cielo o espacio) y, al entrar, se sortea un
// ambiente de ese tema (igual que La Fortaleza sortea el clima por partida).
//
// Campos de un ambiente:
//   sky/horizon  → colores del cielo (cúpula) y del horizonte/niebla
//   fog: [near, far] (unidades de mundo) → la niebla empieza LEJOS para no tapar
//        el "escenario" central de cada simulación
//   ambient, hemi/hemiSky/hemiGround, sun/sunI/sunPos → iluminación
//   night/rain/nebula/space/mountains → activan elementos del entorno
//   grass:[a,b]/sand/sea → paleta del terreno (isla low-poly que rodea el montaje)
//   planet → color del planeta lejano en los temas de espacio

// sky = cenit · horizon = franja de brillo en el horizonte · low = base OSCURA bajo
// el horizonte (mezcla con el suelo oscuro de cada escena → sin corte brusco).
//
// Pesos de sorteo: `w` (variedad por simulación del laboratorio) y `bgw` (fondo 3D
// DECORATIVO de la plataforma — home/cursos/apps). En `bgw` el día despejado domina y
// el cielo soleado/claro es mucho más probable que la noche o el mal tiempo, para que
// la plataforma sea "normalmente de día". Lo usa pickCieloBackground (ver abajo).
export const AMBIENCES = {
  cielo: [
    {
      id: 'dia', name: 'Cielo despejado', w: 5, bgw: 52,
      sky: '#2f7fc9', horizon: '#bfe3ff', low: '#0a1a2e', fog: [52, 170],
      ambient: 0.52, hemi: 0.9, hemiSky: '#dff0ff', hemiGround: '#2f8f4a',
      sun: '#fff3c4', sunI: 1.55, sunPos: [12, 11, -16], mountains: true,
      grass: ['#5fb85f', '#2f8f3e'], sand: '#e6cf8a', sea: '#3b82c4',
    },
    {
      id: 'atardecer', name: 'Atardecer dorado', w: 4, bgw: 20,
      sky: '#9a4fb0', horizon: '#ffb067', low: '#23122e', fog: [46, 158],
      ambient: 0.46, hemi: 0.8, hemiSky: '#ffcaa0', hemiGround: '#5a3a2f',
      sun: '#ff7a2d', sunI: 1.85, sunPos: [5, 5, -18], mountains: true, warm: true,
      grass: ['#6f9a4e', '#46692f'], sand: '#d8b06a', sea: '#7d5a86',
    },
    {
      id: 'niebla', name: 'Niebla espesa', w: 3, bgw: 8,
      sky: '#8b9aab', horizon: '#c2ccd6', low: '#5a6672', fog: [22, 82],
      ambient: 0.72, hemi: 0.9, hemiSky: '#dfe7ee', hemiGround: '#8aa39a',
      sun: '#eef2f7', sunI: 0.95, sunPos: [8, 16, -8], mountains: true,
      grass: ['#7f9c84', '#5e7d68'], sand: '#b9b39a', sea: '#90a0aa',
    },
    {
      id: 'lluvia', name: 'Cielo de tormenta', w: 3, bgw: 8,
      sky: '#3a4a5e', horizon: '#7e8fa2', low: '#141d28', fog: [40, 134],
      ambient: 0.5, hemi: 0.78, hemiSky: '#b8c6d4', hemiGround: '#44645a',
      sun: '#cbd6e2', sunI: 0.95, sunPos: [9, 15, -10], rain: true, mountains: true,
      grass: ['#4f7a5a', '#33543d'], sand: '#9a9576', sea: '#48667a',
    },
    {
      id: 'noche', name: 'Noche estrellada', w: 4, bgw: 12,
      sky: '#0a1430', horizon: '#26345e', low: '#060b1c', fog: [44, 152],
      ambient: 0.36, hemi: 0.55, hemiSky: '#8fa8ff', hemiGround: '#1c3a44',
      sun: '#cdd9ff', sunI: 0.72, sunPos: [12, 11, -16], night: true, mountains: true,
      grass: ['#2e4f4a', '#1f3a39'], sand: '#585848', sea: '#1c3550',
    },
  ],
  espacio: [
    {
      id: 'estrellas', name: 'Campo estelar', w: 6,
      sky: '#04060f', horizon: '#0b1024', low: '#02030a', fog: [70, 200],
      ambient: 0.4, hemi: 0.5, hemiSky: '#9db4ff', hemiGround: '#0a0f24',
      sun: '#d6e4ff', sunI: 1.3, sunPos: [16, 9, -16], night: true, space: true,
      planet: '#3b6fb0',
    },
    {
      id: 'nebulosa', name: 'Nebulosa lejana', w: 4,
      sky: '#0c0826', horizon: '#2a1a5a', low: '#070420', fog: [70, 200],
      ambient: 0.46, hemi: 0.6, hemiSky: '#c8a8ff', hemiGround: '#140a2a',
      sun: '#e6ccff', sunI: 1.2, sunPos: [14, 9, -14], night: true, space: true, nebula: true,
      planet: '#7a4fc0',
    },
  ],
};

// Simulaciones con escenario "espacial" (gravedad/planetas/órbitas); el resto, cielo.
const ESPACIO = new Set(['caida-libre', 'gravitacion', 'orbitas']);
export function temaDeSim(simId) {
  return ESPACIO.has(simId) ? 'espacio' : 'cielo';
}

// Sortea un ambiente del tema según los pesos `w` (variedad por simulación). `r` ∈ [0,1).
export function pickAmbience(tema, r) {
  const list = AMBIENCES[tema] || AMBIENCES.cielo;
  const total = list.reduce((s, a) => s + a.w, 0);
  let acc = 0;
  for (const a of list) { acc += a.w; if (r < acc / total) return a; }
  return list[0];
}

// Sortea un ambiente de CIELO para el fondo 3D DECORATIVO de la plataforma, pesando
// por `bgw` (no `w`): el día despejado domina y el cielo soleado/claro es mucho más
// probable que la noche o el mal tiempo → la plataforma se ve "normalmente de día".
// `r` ∈ [0,1). (No toca la distribución por simulación del laboratorio, que usa `w`.)
export function pickCieloBackground(r) {
  const list = AMBIENCES.cielo;
  const total = list.reduce((s, a) => s + (a.bgw ?? a.w), 0);
  let acc = 0;
  for (const a of list) { acc += (a.bgw ?? a.w); if (r < acc / total) return a; }
  return list[0];
}

export function ambienceById(id) {
  for (const k of Object.keys(AMBIENCES)) {
    const a = AMBIENCES[k].find((x) => x.id === id);
    if (a) return a;
  }
  return AMBIENCES.cielo[0];
}

export const DEFAULT_AMBIENCE = AMBIENCES.cielo[0];

// Estudio neutro para simulaciones de "cámara cerrada" (túnel de viento): fondo
// oscuro y limpio, SIN isla/vegetación, para que los trazadores de flujo resalten.
// Lo marca el flag `neutral`; LabEnvironment solo dibuja la cúpula degradada.
export const NEUTRAL_AMBIENCE = {
  id: 'estudio', name: 'Estudio', neutral: true,
  sky: '#0e1730', horizon: '#1b2742', low: '#070b18', fog: [55, 200],
  ambient: 0.62, hemi: 0.7, hemiSky: '#9fb4d8', hemiGround: '#2a3550',
  sun: '#dce6ff', sunI: 1.15, sunPos: [10, 12, 6],
};
