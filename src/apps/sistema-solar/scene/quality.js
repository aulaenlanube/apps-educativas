// src/apps/sistema-solar/scene/quality.js
// Presupuesto de la escena por nivel de calidad global (low|medium|high).
// La calidad solo cambia lo visual: datos, misiones y notas son idénticos.
export const SCENE_Q = {
  low: { seg: 32, ringSeg: 96, stars: 1600, asteroids: 380, kuiper: 280, shooting: 0, tex: '1k', coronaRays: false, interiorSeg: 48, fps: 30 },
  medium: { seg: 48, ringSeg: 160, stars: 4200, asteroids: 1100, kuiper: 800, shooting: 2, tex: '2k', coronaRays: true, interiorSeg: 72, fps: 0 },
  high: { seg: 72, ringSeg: 256, stars: 8500, asteroids: 2400, kuiper: 1600, shooting: 4, tex: '2k', coronaRays: true, interiorSeg: 96, fps: 0 },
};

export const sceneQuality = (tier) => SCENE_Q[tier] || SCENE_Q.medium;
