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

// sky = cenit · horizon = franja de brillo en el horizonte · low = base OSCURA bajo
// el horizonte (mezcla con el suelo oscuro de cada escena → sin corte brusco).
export const AMBIENCES = {
  cielo: [
    {
      id: 'dia', name: 'Cielo despejado', w: 5,
      sky: '#2f7fc9', horizon: '#bfe3ff', low: '#0a1a2e', fog: [55, 155],
      ambient: 0.5, hemi: 0.85, hemiSky: '#dff0ff', hemiGround: '#1f6f63',
      sun: '#fff3c4', sunI: 1.6, sunPos: [10, 9, -16], mountains: true,
    },
    {
      id: 'atardecer', name: 'Atardecer dorado', w: 4,
      sky: '#9a4fb0', horizon: '#ffb067', low: '#23122e', fog: [48, 145],
      ambient: 0.46, hemi: 0.75, hemiSky: '#ffcaa0', hemiGround: '#5a2f48',
      sun: '#ff7a2d', sunI: 1.9, sunPos: [4, 4, -18], mountains: true, warm: true,
    },
    {
      id: 'niebla', name: 'Niebla espesa', w: 3,
      sky: '#8b9aab', horizon: '#c2ccd6', low: '#5a6672', fog: [24, 74],
      ambient: 0.7, hemi: 0.85, hemiSky: '#dfe7ee', hemiGround: '#8aa39a',
      sun: '#eef2f7', sunI: 1.0, sunPos: [8, 14, -8], mountains: true,
    },
    {
      id: 'lluvia', name: 'Cielo de tormenta', w: 3,
      sky: '#3a4a5e', horizon: '#7e8fa2', low: '#141d28', fog: [40, 112],
      ambient: 0.5, hemi: 0.75, hemiSky: '#b8c6d4', hemiGround: '#48645d',
      sun: '#cbd6e2', sunI: 1.0, sunPos: [8, 14, -10], rain: true, mountains: true,
    },
    {
      id: 'noche', name: 'Noche estrellada', w: 4,
      sky: '#0a1430', horizon: '#26345e', low: '#060b1c', fog: [46, 135],
      ambient: 0.34, hemi: 0.5, hemiSky: '#8fa8ff', hemiGround: '#1c3a44',
      sun: '#cdd9ff', sunI: 0.7, sunPos: [12, 10, -16], night: true, mountains: true,
    },
  ],
  espacio: [
    {
      id: 'estrellas', name: 'Campo estelar', w: 6,
      sky: '#04060f', horizon: '#0b1024', low: '#02030a', fog: [70, 190],
      ambient: 0.4, hemi: 0.5, hemiSky: '#9db4ff', hemiGround: '#0a0f24',
      sun: '#d6e4ff', sunI: 1.3, sunPos: [16, 9, -16], night: true, space: true,
    },
    {
      id: 'nebulosa', name: 'Nebulosa lejana', w: 4,
      sky: '#0c0826', horizon: '#2a1a5a', low: '#070420', fog: [70, 190],
      ambient: 0.46, hemi: 0.6, hemiSky: '#c8a8ff', hemiGround: '#140a2a',
      sun: '#e6ccff', sunI: 1.2, sunPos: [14, 9, -14], night: true, space: true, nebula: true,
    },
  ],
};

// Simulaciones con escenario "espacial" (gravedad/planetas/órbitas); el resto, cielo.
const ESPACIO = new Set(['caida-libre', 'gravitacion', 'orbitas']);
export function temaDeSim(simId) {
  return ESPACIO.has(simId) ? 'espacio' : 'cielo';
}

// Sortea un ambiente del tema según los pesos. `r` ∈ [0,1).
export function pickAmbience(tema, r) {
  const list = AMBIENCES[tema] || AMBIENCES.cielo;
  const total = list.reduce((s, a) => s + a.w, 0);
  let acc = 0;
  for (const a of list) { acc += a.w; if (r < acc / total) return a; }
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
