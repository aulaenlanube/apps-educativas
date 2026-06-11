// src/apps/la-fortaleza/quality.js
// Sistema de calidad gráfica por niveles. Única fuente de verdad: el renderer
// lee la tabla de parámetros y el juego puede cambiar de nivel sin reiniciar
// la partida (la escena se reconstruye desde el estado del engine, que no se
// toca — el determinismo de seeds y duelos queda intacto).

export const QUALITY_LEVELS = [
  { id: 'low', name: 'Bajo', icon: '🔋' },
  { id: 'medium', name: 'Medio', icon: '⚖️' },
  { id: 'high', name: 'Alto', icon: '✨' },
];

export const QUALITY_LABELS = { auto: 'Auto', low: 'Bajo', medium: 'Medio', high: 'Alto' };

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

const PREF_KEY = 'fortaleza-quality';

export function loadQualityPref() {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return ['auto', 'low', 'medium', 'high'].includes(v) ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function saveQualityPref(v) {
  try { localStorage.setItem(PREF_KEY, v); } catch { /* modo privado */ }
}

/**
 * Detección de hardware para el modo Auto. Render por software (SwiftShader,
 * llvmpipe, Basic Render Driver) → Bajo directamente: significa que el equipo
 * NO está usando la GPU y cualquier extra lo hunde. Equipos modestos o
 * móviles → Medio. Resto → Alto (el governor de FPS baja solo si se equivoca).
 */
export function detectGPUTier() {
  let gl = null;
  try {
    const cv = document.createElement('canvas');
    gl = cv.getContext('webgl2', { powerPreference: 'high-performance' })
      || cv.getContext('webgl', { powerPreference: 'high-performance' });
  } catch { /* sin WebGL */ }
  if (!gl) return 'low';
  let gpuName = '';
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (info) gpuName = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
  } catch { /* extensión bloqueada */ }
  try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* ya perdido */ }

  if (/swiftshader|llvmpipe|software|basic render/i.test(gpuName)) return 'low';
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const mobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent || '');
  if (mobile || mem <= 4 || cores <= 4) return 'medium';
  return 'high';
}

export function resolveQuality(pref) {
  return pref === 'auto' ? detectGPUTier() : pref;
}

export const lowerTier = (tier) => (tier === 'high' ? 'medium' : 'low');

/**
 * Governor de FPS: tras un calentamiento, mide la media en ventanas de unos
 * segundos. Si una ventana cae bajo el umbral dispara onDowngrade UNA vez
 * (quien lo usa decide bajar de nivel y crear otro governor para la nueva
 * escena). Las pestañas en segundo plano no cuentan: RAF se congela y no
 * llegan ticks.
 */
export function createFpsGovernor({ warmup = 5, windowSecs = 4, minFps = 42, onDowngrade } = {}) {
  let elapsed = 0;
  let acc = 0;
  let frames = 0;
  let fired = false;
  return {
    tick(dt) {
      if (fired || dt <= 0) return;
      elapsed += dt;
      if (elapsed < warmup) return;
      acc += dt;
      frames++;
      if (acc >= windowSecs) {
        const fps = frames / acc;
        if (fps < minFps) {
          fired = true;
          onDowngrade?.(Math.round(fps));
        }
        acc = 0;
        frames = 0;
      }
    },
  };
}
