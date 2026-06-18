// Configuración de Cazapalabras 3D (FPS educativo de vocabulario).
// La calidad gráfica NO se configura aquí: se hereda del ajuste global de
// plataforma (graphicsQuality) + selector dentro de la app.
//
// MECÁNICA: "dianas voladoras". Las palabras NO están quietas: surcan el cielo de
// la isla (la misma escena 3D de la plataforma) describiendo arcos — unas cruzan de
// lado a lado, otras se lanzan hacia arriba desde el suelo y caen. El jugador apunta
// con la mirilla y dispara a las de las 2 categorías que puntúan. El resto son
// señuelos: dispararlas no resta puntos pero hace huir válidas (optas a menos puntos).

// Capa de render reservada al BLOOM SELECTIVO (post-proceso). Solo los objetos
// "luminosos" (halos de las dianas, FX de impacto, sol) brillan; el panel con el
// TEXTO de la palabra NO se marca, para que quede SIEMPRE nítido (sin difuminarse).
export const BLOOM_LAYER = 1;

// ── Cámara en primera persona (FIJA: ni avanza ni gira sola; el jugador apunta) ──
// El jugador está de pie en la isla mirando al cielo/horizonte; solo el mouse-look
// (yaw/pitch) mueve la vista para seguir las dianas. Respiración cosmética mínima.
export const CAM = {
  pos: [0, 5, 20],            // posición FIJA sobre la pradera de la isla
  basePitch: -0.06,           // leve inclinación hacia el campo de juego
  yawMax: 1.05,               // arco horizontal que el jugador puede barrer (rad)
  pitchMax: 0.62,             // arco vertical
  breathPos: 0.05, breathY: 0.03, breathRoll: 0.01, // micro-respiración (no marea)
};

// ── Dianas voladoras ──
// Geometría del panel de palabra (billboard que SIEMPRE encara la cámara → legible),
// límites del campo de vuelo y gravedad (arcos suaves para poder leer y seguir).
export const FLYER = {
  gravity: 3.4,               // gravedad suave → arcos amplios y trackeable
  panelW: 3.7,                // ancho del panel (la altura sale del aspecto del texto)
  haloScale: 0.66,            // radio del halo luminoso tras el panel (∝ panelW)
  spawnHalfW: 20,             // medio-ancho de aparición (x ∈ [-20, 20], sobre la pradera)
  zMin: -13, zMax: 6,         // banda de profundidad frente a la cámara
  floorY: -3,                 // por debajo de esto la diana "cae" y desaparece
  riseY: -1.4,                // altura de lanzamiento de las dianas que ascienden
};

// Calidad PROPIA de la app: nº MÁXIMO de dianas vivas a la vez por tier.
export const FLYER_QUALITY = {
  low: { max: 5, minLive: 2 },
  medium: { max: 7, minLive: 3 },
  high: { max: 9, minLive: 3 },
};

// Tamaños de las palabras (multiplicador sobre panelW). Más variedad = más
// rejugabilidad y dificultad: las "tiny" son MUY pequeñas y difíciles de acertar.
// `sizeBias` (por dificultad) sesga la distribución hacia tamaños pequeños.
export const SIZE = {
  tiny: [0.40, 0.58],
  small: [0.58, 0.82],
  normal: [0.82, 1.08],
  big: [1.08, 1.42],
};

// Dianas de BONIFICACIÓN: gemas pequeñas y MUY rápidas (objetos, no palabras) que,
// al acertarlas, dan puntos extra. No cuentan como palabra ni como definición (no
// afectan a la nota de examen; suman a los puntos paralelos). No penalizan si fallas.
export const BONUS = {
  everyMin: 6.5, everyMax: 11,   // segundos entre apariciones
  points: 9,                     // bonificación base por acierto
  scaleMin: 0.5, scaleMax: 0.7,  // pequeñas
  speedMult: 2.0,                // pasan MUY rápido (cruzan)
};

// Puntuación por categoría: SOLO 2 categorías puntúan.
export const SCORE_PRINCIPAL = 5;   // categoría principal
export const SCORE_SECUNDARIA = 2;  // categoría secundaria
// Al disparar una palabra NO válida no se restan puntos, pero HUYEN N válidas que
// estuvieran volando (se aceleran y escapan → optas a menos puntos).
export const WRONG_REMOVES_VALID = 2;

// Puntos de la respuesta a una definición (sobre los puntos base de la palabra).
export const DEF_BONUS_MULT = 4;

// Dificultades (práctica) + examen. Todas las partidas son por TIEMPO. El valor de
// cada palabra sale de su categoría (principal/secundaria), no de la dificultad.
//   spawnEverySec → cadencia de aparición de dianas
//   validRatio    → proporción de dianas que pertenecen a una categoría que puntúa
//   speed         → multiplicador de velocidad de vuelo (más alto = más difícil leer)
//   defEverySec   → cada cuánto aparece un reto de definición
//   defWindowSec  → ventana para acertar la definición
export const DIFICULTADES = {
  facil: {
    key: 'facil', label: 'Fácil', icon: '🟢',
    durationSec: 60, spawnEverySec: 0.9, validRatio: 0.62, speed: 0.82, sizeBias: 0.06,
    defEverySec: 14, defWindowSec: 12, fireCooldownMs: 300, catRotateSec: 24,
  },
  medio: {
    key: 'medio', label: 'Medio', icon: '🟡',
    durationSec: 60, spawnEverySec: 0.72, validRatio: 0.56, speed: 1.0, sizeBias: 0.28,
    defEverySec: 11, defWindowSec: 10, fireCooldownMs: 270, catRotateSec: 18,
  },
  dificil: {
    key: 'dificil', label: 'Difícil', icon: '🔴',
    durationSec: 60, spawnEverySec: 0.56, validRatio: 0.5, speed: 1.22, sizeBias: 0.55,
    defEverySec: 9, defWindowSec: 8, fireCooldownMs: 240, catRotateSec: 13,
  },
  // Examen: nota = definiciones acertadas / presentadas.
  examen: {
    key: 'examen', label: 'Examen', icon: '🎓', isExam: true,
    durationSec: 60, spawnEverySec: 0.68, validRatio: 0.55, speed: 1.05, sizeBias: 0.34,
    defEverySec: 8, defWindowSec: 10, fireCooldownMs: 270, catRotateSec: 18,
  },
};

export const MODOS = ['facil', 'medio', 'dificil', 'examen'];

// Colores del summary según nota.
export const notaColor = (n) => (n >= 8 ? '#10b981' : n >= 5 ? '#3b82f6' : '#ef4444');
export const notaMensaje = (n) => (n >= 9 ? '¡Excelente!' : n >= 7 ? '¡Muy bien!' : n >= 5 ? 'Aprobado' : 'Necesitas repasar');
