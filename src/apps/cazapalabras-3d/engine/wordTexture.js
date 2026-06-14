// Texturas de canvas 2D para los objetos disparables. Se usan en lugar de
// troika/drei <Text> porque: (a) son raycasteables al ir sobre un mesh,
// (b) no usan Web Worker (sin el escollo CSP de troika importScripts blob:),
// (c) rinden mucho mejor con MUCHAS etiquetas en movimiento (sin retipografiar
// por frame: una textura cacheada por texto+estilo).
//
// La palabra ya no va en un plano plano sino en la CARA FRONTAL de un prisma
// 3D (ver Target.jsx): la textura es a sangre (rellena toda la cara) y existen
// varios DISEÑOS de marco para dar variedad visual.
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

// 4 corchetes en L en las esquinas (estética de "objetivo" de FPS).
function drawCorners(ctx, x, y, w, h, len, accent) {
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.shadowColor = accent;
  ctx.shadowBlur = 12;
  const seg = (ax, ay, bx, by, cx, cy) => {
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.stroke();
  };
  seg(x, y + len, x, y, x + len, y);                       // top-left
  seg(x + w - len, y, x + w, y, x + w, y + len);           // top-right
  seg(x + w, y + h - len, x + w, y + h, x + w - len, y + h);// bottom-right
  seg(x + len, y + h, x, y + h, x, y + h - len);           // bottom-left
  ctx.shadowBlur = 0;
}

// Pastilla en una esquina: "+N" (puntúa) o "−N" (penaliza) para que el jugador
// decida de un vistazo si disparar o no.
function drawPill(ctx, cx, cy, label, accent) {
  const r = 24;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0b1024';
  ctx.font = FONT(26);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1);
}

// Panel de palabra "a sangre": gradiente oscuro opaco + marco de color (según
// diseño) + texto claro. Devuelve { texture, aspect } para dimensionar el prisma.
export function makeWordTexture(text, { accent = '#22d3ee', fg = '#ffffff', design = 0, points = 0, isAnswer = false, penalty = false } = {}) {
  const key = `w|${text}|${accent}|${design}|${points}|${isAnswer ? 1 : 0}|${penalty ? 1 : 0}`;
  if (cache.has(key)) return cache.get(key);

  const fontSize = 78;
  const padX = 52;
  const padY = 34;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = FONT(fontSize);
  const textW = Math.ceil(probe.measureText(text).width);
  const w = Math.max(textW + padX * 2, 168);
  const h = fontSize + padY * 2;

  const c = document.createElement('canvas');
  c.width = Math.ceil(w * DPR);
  c.height = Math.ceil(h * DPR);
  const ctx = c.getContext('2d');
  ctx.scale(DPR, DPR);

  // fondo opaco (a sangre, sin esquinas transparentes → cara de prisma limpia)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#111a38');
  grad.addColorStop(0.5, '#0b1228');
  grad.addColorStop(1, '#070b1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // brillo superior sutil
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, 0, w, h * 0.32);

  // marco según diseño
  const inset = (m) => roundRect(ctx, m, m, w - m * 2, h - m * 2, 18);
  ctx.save();
  if (design === 2) {
    drawCorners(ctx, 8, 8, w - 16, h - 16, 28, accent);
  } else if (design === 1) {
    ctx.lineWidth = 5; ctx.strokeStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = 14;
    inset(9); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.lineWidth = 2; ctx.globalAlpha = 0.55; inset(18); ctx.stroke(); ctx.globalAlpha = 1;
  } else if (design === 3) {
    ctx.fillStyle = accent; ctx.fillRect(0, 0, 11, h);
    ctx.fillRect(w - 11, 0, 11, h);
    ctx.lineWidth = 3; ctx.strokeStyle = accent; ctx.globalAlpha = 0.7; inset(7); ctx.stroke(); ctx.globalAlpha = 1;
  } else {
    ctx.lineWidth = 6; ctx.strokeStyle = accent; ctx.shadowColor = accent; ctx.shadowBlur = 18;
    inset(8); ctx.stroke(); ctx.shadowBlur = 0;
  }
  ctx.restore();

  // texto
  ctx.font = FONT(fontSize);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 9;
  ctx.fillText(text, w / 2, h / 2 + 3);
  ctx.shadowBlur = 0;

  // pastilla: penaliza (−N, roja) · estrella de respuesta · puntos (tiers 2 y 5)
  if (penalty) {
    drawPill(ctx, w - 32, 32, `−${points}`, accent);
  } else if (isAnswer) {
    ctx.fillStyle = accent;
    ctx.font = FONT(34);
    ctx.shadowColor = accent; ctx.shadowBlur = 12;
    ctx.fillText('★', 30, 30);
    ctx.shadowBlur = 0;
  } else if (points >= 2) {
    drawPill(ctx, w - 32, 32, `+${points}`, accent);
  }

  const texture = new THREE.CanvasTexture(c);
  texture.anisotropy = 8;
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

// Halo radial suave (aditivo) para destacar palabra-respuesta y tier alto.
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
