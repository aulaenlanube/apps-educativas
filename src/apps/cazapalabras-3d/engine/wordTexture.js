// Texturas de canvas 2D para las cajas-palabra de los muros. Se usan en lugar de
// troika/drei <Text> porque: (a) son raycasteables al ir sobre un mesh,
// (b) no usan Web Worker (sin el escollo CSP de troika importScripts blob:),
// (c) se cachean por texto (una textura por palabra, reutilizada en todo el muro).
import * as THREE from 'three';

const cache = new Map();
const DPR = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
const FONT = (fs) => `800 ${fs}px Inter, "Segoe UI", system-ui, sans-serif`;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Textura UNIFORME de palabra para las celdas del muro: aspecto fijo (coincide
// con la cara de la celda), marco neutro ÚNICO e idéntico para TODAS las palabras
// (sin pistas de valor: ni color por tier, ni pastilla, ni penalización), y texto
// autoescalado para caber. Cache por solo el texto → misma palabra = misma textura.
export function makeWallWordTexture(text) {
  const key = `ww|${text}`;
  if (cache.has(key)) return cache.get(key);

  const W = 384; const H = 160; // aspecto ≈ 2.4 (= CELL.w / CELL.h)
  const c = document.createElement('canvas');
  c.width = Math.ceil(W * DPR);
  c.height = Math.ceil(H * DPR);
  const ctx = c.getContext('2d');
  ctx.scale(DPR, DPR);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#111a30');
  grad.addColorStop(1, '#0a1124');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(0, 0, W, H * 0.3);

  const accent = '#3a4a6b'; // marco neutro constante (idéntico en todas las cajas)
  ctx.lineWidth = 6;
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 10;
  roundRect(ctx, 7, 7, W - 14, H - 14, 16);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // texto autoescalado para caber en el ancho de la celda
  const maxW = W - 68;
  let fs = 78;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  do { ctx.font = FONT(fs); if (ctx.measureText(text).width <= maxW) break; fs -= 4; } while (fs > 26);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 8;
  ctx.fillText(text, W / 2, H / 2 + 2);
  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(c);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  const out = { texture, aspect: W / H };
  cache.set(key, out);
  return out;
}

// Halo radial suave (aditivo) — lo usa ImpactFX para el fogonazo del disparo.
export function makeGlowTexture(color = '#fbbf24') {
  const key = `g|${color}`;
  if (cache.has(key)) return cache.get(key);
  const size = 160;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const out = { texture, aspect: 1 };
  cache.set(key, out);
  return out;
}

export function clearTextureCache() {
  cache.forEach((v) => v.texture.dispose());
  cache.clear();
}
