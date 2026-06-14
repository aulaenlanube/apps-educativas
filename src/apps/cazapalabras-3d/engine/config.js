// Configuración de Cazapalabras 3D (FPS educativo de vocabulario).
// La calidad gráfica NO se configura aquí: se hereda del ajuste global de
// plataforma (graphicsQuality) + selector dentro de la app.

// Capa de render reservada al BLOOM SELECTIVO (post-proceso). Solo los objetos
// "luminosos" (halos, orbes, FX de impacto, estrellas, estructuras emisivas) se
// marcan con layers.enable(BLOOM_LAYER); los prismas de palabra NO, para que el
// texto quede SIEMPRE nítido (no se difumina con el glow).
export const BLOOM_LAYER = 1;

// ── Muros de palabras (estructuras densas con gravedad) ──
// Geometría de cada celda del muro (prisma de palabra de tamaño UNIFORME).
export const CELL = { w: 2.5, h: 1.05, depth: 0.22, gap: 0.16, baseY: 0.8 };
export const GRAV_WALL = 16; // aceleración de caída al recolapsar columnas

// Knob de calidad PROPIO de la app (NO usar particleBudget para capar nº de cajas).
// Define cuántos muros viven a la vez y su tamaño de rejilla por tier.
export const WALL_QUALITY = {
  low: { walls: 2, cols: 4, rows: 4 },
  medium: { walls: 3, cols: 5, rows: 5 },
  high: { walls: 3, cols: 5, rows: 6 },
};

// ── Cámara por secciones (coreografía discreta: HOLD → TURN → HOLD → ADVANCE → …) ──
export const CAM = {
  pos: [0, 2.4, 7],        // posición fija (las fases ADVANCE mueven los MUROS, no la cámara)
  holdMin: 2.4, holdMax: 4.2, // reposo para apuntar/disparar
  turnDur: 1.5,            // duración del giro a un muro lateral
  advanceDur: 1.7,         // duración del avance (los muros pasan de largo)
  breathPos: 0.10, breathY: 0.05, breathRoll: 0.022, // respiración cosmética mínima
  bankRoll: 0.10,          // alabeo proporcional al giro (lean into the turn)
};

// Colocación de los muros de una "estación" (fila de muros que la cámara recorre).
export const WALL_LAYOUT = {
  z: -17,                  // z de reposo de la estación
  xSpread: 7.8,            // separación lateral entre muros
  wrapZ: 3,                // al rebasar esta z (cerca de la cámara) el muro se recicla
  respawnZ: -50,           // z a la que reaparece (lejos) tras reciclar
};

// Puntos de la respuesta a una definición (sobre los puntos base de la palabra).
export const DEF_BONUS_MULT = 4; // p.ej. palabra rara (5) acertada por definición → 20

// Dificultades (práctica) + examen. Todas las partidas son por TIEMPO. El valor
// de cada palabra sale de su categoría (pool), no de la dificultad.
export const DIFICULTADES = {
  facil: {
    key: 'facil', label: 'Fácil', icon: '🟢',
    durationSec: 120, defEverySec: 16, defWindowSec: 11, fireCooldownMs: 360,
  },
  medio: {
    key: 'medio', label: 'Medio', icon: '🟡',
    durationSec: 95, defEverySec: 13, defWindowSec: 9, fireCooldownMs: 320,
  },
  dificil: {
    key: 'dificil', label: 'Difícil', icon: '🔴',
    durationSec: 80, defEverySec: 11, defWindowSec: 7.5, fireCooldownMs: 280,
  },
  // Examen: nota = definiciones acertadas / presentadas.
  examen: {
    key: 'examen', label: 'Examen', icon: '🎓', isExam: true,
    durationSec: 90, defEverySec: 8, defWindowSec: 9, fireCooldownMs: 320,
  },
};

export const MODOS = ['facil', 'medio', 'dificil', 'examen'];

// Colores del summary según nota.
export const notaColor = (n) => (n >= 8 ? '#10b981' : n >= 5 ? '#3b82f6' : '#ef4444');
export const notaMensaje = (n) => (n >= 9 ? '¡Excelente!' : n >= 7 ? '¡Muy bien!' : n >= 5 ? 'Aprobado' : 'Necesitas repasar');
