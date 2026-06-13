// Texturas de canvas 2D para los objetos disparables. Se usan en lugar de
// troika/drei <Text> porque: (a) son raycasteables al ir sobre un mesh,
// (b) no usan Web Worker (sin el escollo CSP de troika importScripts blob:),
// (c) rinden mucho mejor con MUCHAS etiquetas en movimiento (sin retipografiar
// por frame: una textura cacheada por texto+estilo).
import * as THREE from 'three';

const cache = new Map();
const DPR = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Panel de palabra: rectángulo oscuro translúcido con borde de color (tier) y
// texto claro. Devuelve { texture, aspect } para dimensionar el plano.
export function makeWordTexture(text, { accent = '#22d3ee', fg = '#ffffff' } = {}) {
  const key = `w|${text}|${accent}|${fg}`;
  if (cache.has(key)) return cache.get(key);

  const fontSize = 72;
  const padX = 38;
  const padY = 26;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `800 ${fontSize}px Inter, "Segoe UI", system-ui, sans-serif`;
  const textW = Math.ceil(probe.measureText(text).width);
  const w = textW + padX * 2;
  const h = fontSize + padY * 2;

  const c = document.createElement('canvas');
  c.width = Math.ceil(w * DPR);
  c.height = Math.ceil(h * DPR);
  const ctx = c.getContext('2d');
  ctx.scale(DPR, DPR);

  // panel
  roundRect(ctx, 3, 3, w - 6, h - 6, 22);
  ctx.fillStyle = 'rgba(8, 13, 30, 0.9)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // texto
  ctx.font = `800 ${fontSize}px Inter, "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);

  const texture = new THREE.CanvasTexture(c);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  const out = { texture, aspect: w / h };
  cache.set(key, out);
  return out;
}

// Icono (emoji) para objetos especiales, sobre fondo transparente.
export function makeIconTexture(emoji) {
  const key = `i|${emoji}`;
  if (cache.has(key)) return cache.get(key);
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size * DPR;
  c.height = size * DPR;
  const ctx = c.getContext('2d');
  ctx.scale(DPR, DPR);
  ctx.font = `${Math.round(size * 0.72)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 4);
  const texture = new THREE.CanvasTexture(c);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  const out = { texture, aspect: 1 };
  cache.set(key, out);
  return out;
}

export function clearTextureCache() {
  cache.forEach((v) => v.texture.dispose());
  cache.clear();
}
