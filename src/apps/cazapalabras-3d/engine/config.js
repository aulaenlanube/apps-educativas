// Configuración de Cazapalabras 3D (FPS educativo de vocabulario).
// La calidad gráfica NO se configura aquí: se hereda del ajuste global de
// plataforma (graphicsQuality) + selector dentro de la app.

// Tiers de puntuación de las palabras: color, emisivo (brillo) y escala.
// El jugador prioriza las de más valor (doradas) antes de que pasen de largo.
export const TIERS = {
  1: { points: 1, color: '#e2e8f0', emissive: '#475569', glow: 0.35, scale: 1.0, label: 'común' },
  2: { points: 2, color: '#a5f3fc', emissive: '#0891b2', glow: 0.6, scale: 1.08, label: 'frecuente' },
  5: { points: 5, color: '#fde68a', emissive: '#f59e0b', glow: 1.0, scale: 1.18, label: 'rara' },
};
export const TIER_VALUES = [1, 2, 5];

// Objetos especiales (orbes brillantes, NO paneles de palabra).
export const SPECIALS = {
  time:  { id: 'time',  icon: '⏱️', color: '#34d399', emissive: '#10b981', label: '+5 segundos',   good: true },
  rapid: { id: 'rapid', icon: '⚡', color: '#c4b5fd', emissive: '#7c3aed', label: 'Cadencia rápida', good: true },
  x2:    { id: 'x2',    icon: '✖️', color: '#f9a8d4', emissive: '#db2777', label: 'Puntos ×2',       good: true },
  gem:   { id: 'gem',   icon: '💎', color: '#7dd3fc', emissive: '#0ea5e9', label: 'Bonus gordo',     good: true },
  bomb:  { id: 'bomb',  icon: '💀', color: '#fca5a5', emissive: '#b91c1c', label: '¡Bomba!',         good: false },
};
export const SPECIAL_GOOD = ['time', 'rapid', 'x2', 'gem'];

// Efectos de power-ups.
export const POWERUP = {
  timeBonusSec: 5,
  rapidMs: 8000,       // dispara sin cooldown durante este tiempo
  x2Ms: 10000,         // multiplicador ×2 durante este tiempo
  gemPoints: 20,
  bombPenaltyPoints: 8,
  bombPenaltySec: 2,
};

// Puntos de la respuesta a una definición (sobre los puntos base de la palabra).
export const DEF_BONUS_MULT = 4; // p.ej. palabra rara (5) acertada por definición → 20

// Dificultades (práctica) + examen. Todas las partidas son por TIEMPO.
export const DIFICULTADES = {
  facil: {
    key: 'facil', label: 'Fácil', icon: '🟢',
    durationSec: 120, spawnMs: 1150, maxTargets: 9, speed: [1.6, 2.7],
    specialChance: 0.16, bombChance: 0.10,
    defEverySec: 16, defWindowSec: 11, defDistractors: 4,
    wrongPenaltySec: 0, fireCooldownMs: 360,
  },
  medio: {
    key: 'medio', label: 'Medio', icon: '🟡',
    durationSec: 95, spawnMs: 880, maxTargets: 12, speed: [2.2, 3.6],
    specialChance: 0.18, bombChance: 0.17,
    defEverySec: 13, defWindowSec: 9, defDistractors: 6,
    wrongPenaltySec: 1, fireCooldownMs: 320,
  },
  dificil: {
    key: 'dificil', label: 'Difícil', icon: '🔴',
    durationSec: 80, spawnMs: 660, maxTargets: 15, speed: [3.0, 4.9],
    specialChance: 0.20, bombChance: 0.23,
    defEverySec: 11, defWindowSec: 7.5, defDistractors: 8,
    wrongPenaltySec: 1.5, fireCooldownMs: 280,
  },
  // Examen: sin power-ups de ayuda salvo tiempo; nota = definiciones acertadas / presentadas.
  examen: {
    key: 'examen', label: 'Examen', icon: '🎓', isExam: true,
    durationSec: 90, spawnMs: 850, maxTargets: 12, speed: [2.2, 3.7],
    specialChance: 0.08, bombChance: 0.18,
    defEverySec: 8, defWindowSec: 9, defDistractors: 6,
    wrongPenaltySec: 1, fireCooldownMs: 320,
  },
};

export const MODOS = ['facil', 'medio', 'dificil', 'examen'];

// Colores del summary según nota.
export const notaColor = (n) => (n >= 8 ? '#10b981' : n >= 5 ? '#3b82f6' : '#ef4444');
export const notaMensaje = (n) => (n >= 9 ? '¡Excelente!' : n >= 7 ? '¡Muy bien!' : n >= 5 ? 'Aprobado' : 'Necesitas repasar');
