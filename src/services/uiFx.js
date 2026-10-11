// src/services/uiFx.js
// Nivel de EFECTOS de la interfaz (no del 3D de cada app): decide cuánto adorno
// animado pinta la plataforma — cristal con desenfoque, auroras, iconos con
// animación en reposo, fps del fondo 3D… — según el equipo.
//
// Se publica como atributo en <html data-fx="high|medium|low"> para que el CSS
// (src/styles/fx.css, src/styles/art.css) recorte efectos sin tocar componentes,
// y como hook (useFxTier) para lo que se decide en JS (fps del fondo, órbitas…).
//
// Fuente del nivel:
//   1. La preferencia global de calidad gráfica (graphicsQuality: auto|low|medium|high),
//      la misma que usan las apps 3D. Si el usuario fija un nivel, se respeta.
//   2. En 'auto': detección de hardware (detectGPUTier) + "ahorro de datos" +
//      movimiento reducido del sistema.
//   3. En 'auto' además hay un vigilante de fps: si la página real va a
//      tirones (media < MIN_FPS en una ventana), baja un nivel. La bajada se
//      recuerda en la sesión para no oscilar entre niveles.
import { loadQualityPref, resolveQuality, QUALITY_EVENT, PREF_KEY } from '@/services/graphicsQuality';

export const FX_TIERS = ['low', 'medium', 'high'];
export const FX_EVENT = 'eduapps:fx-tier-change';

const SESSION_KEY = 'eduapps-fx-auto-cap';
const MIN_FPS = 44;
const WINDOW_MS = 2500;
const MAX_WINDOWS = 6; // ~15 s de vigilancia tras cada arranque/navegación

let current = null;
let watching = false;

const rank = (t) => FX_TIERS.indexOf(t);
const minTier = (a, b) => (rank(a) <= rank(b) ? a : b);

function readSessionCap() {
  try {
    const v = sessionStorage.getItem(SESSION_KEY);
    return FX_TIERS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function writeSessionCap(t) {
  try { sessionStorage.setItem(SESSION_KEY, t); } catch { /* modo privado */ }
}

function prefersReducedMotion() {
  try { return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true; } catch { return false; }
}

function saveData() {
  try { return navigator.connection?.saveData === true; } catch { return false; }
}

export function computeFxTier() {
  if (typeof window === 'undefined') return 'medium';
  const pref = loadQualityPref();
  if (pref !== 'auto') return pref; // elección explícita del usuario
  let tier = resolveQuality('auto');
  if (saveData()) tier = 'low';
  if (prefersReducedMotion()) tier = minTier(tier, 'medium');
  const cap = readSessionCap();
  if (cap) tier = minTier(tier, cap);
  return tier;
}

function publish(tier) {
  if (tier === current) return;
  current = tier;
  try { document.documentElement.dataset.fx = tier; } catch { /* sin DOM */ }
  try { window.dispatchEvent(new CustomEvent(FX_EVENT, { detail: tier })); } catch { /* tests */ }
}

export function getFxTier() {
  if (current === null) publish(computeFxTier());
  return current;
}

// Vigilante de fps (solo en 'auto'). Cuenta frames de rAF en ventanas cortas;
// las pestañas ocultas no cuentan (rAF se congela y la ventana se descarta).
export function watchFxPerformance() {
  if (typeof window === 'undefined' || watching) return;
  if (loadQualityPref() !== 'auto' || current === 'low') return;
  watching = true;
  let windows = 0;
  let frames = 0;
  let start = 0;
  let last = 0;
  const loop = (t) => {
    if (!start) { start = t; last = t; }
    // un hueco enorme = pestaña oculta o pausa del depurador: reiniciar ventana
    if (t - last > 400) { start = t; frames = 0; }
    last = t;
    frames++;
    const span = t - start;
    if (span >= WINDOW_MS) {
      const fps = (frames * 1000) / span;
      windows++;
      frames = 0;
      start = t;
      if (fps < MIN_FPS && current !== 'low') {
        const next = FX_TIERS[rank(current) - 1];
        writeSessionCap(next);
        publish(next);
        windows = 0; // dar otra ventana completa al nivel nuevo
      }
      if (windows >= MAX_WINDOWS || current === 'low') { watching = false; return; }
    }
    requestAnimationFrame(loop);
  };
  // arrancar tras el primer pintado: la carga inicial no es representativa
  setTimeout(() => requestAnimationFrame(loop), 1800);
}

let initialized = false;

export function initUiFx() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  publish(computeFxTier());
  const recompute = () => publish(computeFxTier());
  window.addEventListener(QUALITY_EVENT, () => {
    // cambiar la preferencia a mano borra la bajada automática de la sesión
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* modo privado */ }
    recompute();
    watchFxPerformance();
  });
  window.addEventListener('storage', (e) => { if (e.key === PREF_KEY) recompute(); });
  try { window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', recompute); } catch { /* navegadores viejos */ }
  watchFxPerformance();
}
