// src/services/graphicsQuality.js
// Ajuste GLOBAL de calidad gráfica de la plataforma (extraído de la-fortaleza/quality.js).
// Una única preferencia por dispositivo (localStorage) compartida por todas las apps
// con gráficos 3D/avanzados. La preferencia puede ser 'auto' | 'low' | 'medium' | 'high';
// 'auto' se resuelve a un tier real con detectGPUTier(). Las apps consumen el tier
// resuelto: los parámetros genéricos salen de GLOBAL_QUALITY_PARAMS y cada app puede
// definir además sus knobs propios indexados por el mismo tier.

export const QUALITY_LEVELS = [
  { id: 'low', name: 'Bajo', icon: '🔋' },
  { id: 'medium', name: 'Medio', icon: '⚖️' },
  { id: 'high', name: 'Alto', icon: '✨' },
];

export const QUALITY_LABELS = { auto: 'Auto', low: 'Bajo', medium: 'Medio', high: 'Alto' };

// Parámetros genéricos que cualquier app 3D puede aplicar tal cual a su renderer.
// particleBudget multiplica el nº de partículas de los sistemas visuales (las
// magnitudes físicas medibles NUNCA deben depender de él).
export const GLOBAL_QUALITY_PARAMS = {
  low: { antialias: false, pixelRatio: 1, shadows: false, shadowMapSize: 0, envMap: false, bloom: false, particleBudget: 0.3 },
  medium: { antialias: true, pixelRatio: 1.5, shadows: true, shadowMapSize: 1024, envMap: true, bloom: false, particleBudget: 0.6 },
  high: { antialias: true, pixelRatio: 2, shadows: true, shadowMapSize: 2048, envMap: true, bloom: true, particleBudget: 1 },
};

// dpr efectivo para <Canvas dpr={...}> de r3f: nunca supersamplear por encima
// del devicePixelRatio real de la pantalla.
export const effectiveDpr = (tier) => Math.min(
  (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
  GLOBAL_QUALITY_PARAMS[tier]?.pixelRatio || 1,
);

export const PREF_KEY = 'eduapps-graphics-quality';
const LEGACY_KEY = 'fortaleza-quality'; // preferencia previa al ajuste global: se adopta una vez
const VALID = ['auto', 'low', 'medium', 'high'];

// Evento para sincronizar todos los consumidores (hook, selectores, apps abiertas)
export const QUALITY_EVENT = 'eduapps:graphics-quality-change';

export function loadQualityPref() {
  try {
    const v = localStorage.getItem(PREF_KEY);
    if (VALID.includes(v)) return v;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (VALID.includes(legacy)) {
      localStorage.setItem(PREF_KEY, legacy);
      return legacy;
    }
    return 'auto';
  } catch {
    return 'auto';
  }
}

export function saveQualityPref(v) {
  if (!VALID.includes(v)) return;
  try { localStorage.setItem(PREF_KEY, v); } catch { /* modo privado */ }
  try { window.dispatchEvent(new CustomEvent(QUALITY_EVENT, { detail: v })); } catch { /* tests sin DOM */ }
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
