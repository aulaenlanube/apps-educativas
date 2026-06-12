// src/apps/la-fortaleza/quality.js
// Knobs de calidad ESPECÍFICOS de La Fortaleza. La preferencia del usuario, la
// detección de hardware y el governor de FPS viven en el servicio GLOBAL de la
// plataforma (src/services/graphicsQuality.js) — la misma elección vale para
// todas las apps 3D — y se re-exportan aquí para no tocar a los consumidores
// (LaFortaleza.jsx, FortalezaGame.jsx, render3d.js). El renderer lee la tabla
// de parámetros y el juego puede cambiar de nivel sin reiniciar la partida
// (la escena se reconstruye desde el estado del engine, que no se toca — el
// determinismo de seeds y duelos queda intacto).

export {
  QUALITY_LEVELS, QUALITY_LABELS,
  loadQualityPref, saveQualityPref,
  detectGPUTier, resolveQuality, lowerTier, createFpsGovernor,
} from '../../services/graphicsQuality';

export const QUALITY_PARAMS = {
  low: {
    antialias: false,
    pixelRatio: 1,
    shadows: false,      // estado clásico: cero pase de sombras
    shadowMapSize: 0,
    unitShadows: false,  // enemigos/aliados nunca proyectan
    rounded: false,      // cajas sin biselar
    envMap: false,
    bloom: false,
    keepLights: 0,       // luces puntuales extra en fortalezas enemigas
    decorDensity: 0.55,  // menos árboles/rocas/flores
  },
  medium: {
    antialias: true,
    pixelRatio: 1.5,
    shadows: true,
    shadowMapSize: 1024,
    unitShadows: false,
    rounded: true,
    envMap: true,
    bloom: false,
    keepLights: 0,
    decorDensity: 1,
  },
  high: {
    antialias: true,
    pixelRatio: 2,
    shadows: true,
    shadowMapSize: 2048,
    unitShadows: true,
    rounded: true,
    envMap: true,
    bloom: true,
    keepLights: 3,
    decorDensity: 1,
  },
};
