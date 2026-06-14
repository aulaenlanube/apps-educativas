// Configuración de Cazapalabras 3D (FPS educativo de vocabulario).
// La calidad gráfica NO se configura aquí: se hereda del ajuste global de
// plataforma (graphicsQuality) + selector dentro de la app.

// Capa de render reservada al BLOOM SELECTIVO (post-proceso). Solo los objetos
// "luminosos" (halos, FX de impacto, estrellas, estructuras emisivas) se marcan
// con layers.enable(BLOOM_LAYER); los prismas de palabra NO, para que el texto
// quede SIEMPRE nítido (no se difumina con el glow).
export const BLOOM_LAYER = 1;

// ── Montones de palabras (estructuras con gravedad) ──
// Geometría de cada celda del montón (prisma de palabra de tamaño UNIFORME).
// baseY = 0: el origen local del montón coincide con la base de la fila inferior;
// la altura en el mundo la fija PILE_LAYOUT (cada montón flota a distinta altura).
export const CELL = { w: 2.5, h: 1.05, depth: 0.22, gap: 0.16, baseY: 0 };
export const GRAV_PILE = 16; // aceleración de caída al recolapsar columnas

// Knob de calidad PROPIO de la app (NO usar particleBudget para capar nº de cajas).
// Define cuántos MONTONES viven a la vez y de cuántas cajas (pocas válidas).
export const PILE_QUALITY = {
  low: { piles: 3, cols: 2, boxesMin: 5, boxesMax: 7, validMin: 2, validMax: 2 },
  medium: { piles: 5, cols: 3, boxesMin: 6, boxesMax: 9, validMin: 2, validMax: 3 },
  high: { piles: 6, cols: 3, boxesMin: 6, boxesMax: 10, validMin: 2, validMax: 3 },
};

// ── Cámara por secciones (coreografía discreta y CALMADA: HOLD → TURN → HOLD …) ──
// La cámara NO se traslada ni el mundo se desplaza (evita el mareo): solo GIRA para
// encarar montones colocados a distintos ángulos a su alrededor.
export const CAM = {
  pos: [0, 2.4, 7],            // posición FIJA (nunca avanza)
  holdMin: 2.6, holdMax: 4.6,  // reposo para apuntar/disparar
  turnDur: 1.6,                // duración del giro a otro montón
  breathPos: 0.04, breathY: 0.025, breathRoll: 0.012, // respiración cosmética mínima
  bankRoll: 0.08,              // alabeo proporcional al giro (lean into the turn)
};

// Colocación de los montones: un arco a izquierda/derecha de la cámara, a distintas
// distancias y alturas (aparecen "por todas partes" del campo de visión).
export const PILE_LAYOUT = {
  angleMax: 1.15,              // arco máx. (rad) a cada lado que la cámara puede encarar
  distMin: 13, distMax: 19,    // distancia de la cámara
  baseYMin: 1.0, baseYMax: 5.0, // altura de la base del montón
};

// Puntuación por categoría: SOLO 2 categorías puntúan.
export const SCORE_PRINCIPAL = 5;   // categoría principal
export const SCORE_SECUNDARIA = 2;  // categoría secundaria
// Al disparar una palabra NO válida no se restan puntos, pero DESAPARECEN N válidas
// del montón (optas a menos puntos).
export const WRONG_REMOVES_VALID = 2;

// Puntos de la respuesta a una definición (sobre los puntos base de la palabra).
export const DEF_BONUS_MULT = 4;

// Dificultades (práctica) + examen. Todas las partidas son por TIEMPO. El valor de
// cada palabra sale de su categoría (principal/secundaria), no de la dificultad.
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
