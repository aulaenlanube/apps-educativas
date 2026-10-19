// src/apps/mesa-crafteo/scene/textures.js
// Texturas generadas en un canvas 2D (sin descargas): etiquetas de los átomos,
// brillo aditivo, sombra suave y el tablero holográfico de la mesa.
// Se cachean por módulo; three las vuelve a subir si el contexto se recrea.
import * as THREE from 'three';
import { tokenInfo, labelInk } from '../chem/elements';

const cache = new Map();

function canvasTexture(key, size, draw) {
  if (cache.has(key)) return cache.get(key);
  const cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d');
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

export function labelTexture(tok) {
  const info = tokenInfo(tok);
  return canvasTexture(`label:${tok}`, 128, (ctx, s) => {
    const ink = labelInk(info.color);
    const text = info.label;
    const fs = text.length > 2 ? 52 : text.length > 1 ? 62 : 74;
    ctx.font = `800 ${fs}px "Fredoka", "Nunito", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = ink === '#ffffff' ? 'rgba(15,23,42,.55)' : 'rgba(255,255,255,.65)';
    ctx.strokeText(text, s / 2, s / 2 + 4);
    ctx.fillStyle = ink;
    ctx.fillText(text, s / 2, s / 2 + 4);
  });
}

export function glowTexture() {
  return canvasTexture('glow', 64, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

export function shadowTexture() {
  return canvasTexture('shadow', 128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(0,0,0,.75)');
    g.addColorStop(0.55, 'rgba(0,0,0,.32)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

// Tablero circular: anillos, marcas y rejilla hexagonal muy tenue.
export function tableTexture() {
  return canvasTexture('table', 512, (ctx, s) => {
    const c = s / 2;
    const bg = ctx.createRadialGradient(c, c, 0, c, c, c);
    bg.addColorStop(0, '#1d2550');
    bg.addColorStop(0.7, '#121838');
    bg.addColorStop(1, '#0a0f26');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(c, c, c, 0, Math.PI * 2); ctx.fill();
    // rejilla hexagonal
    ctx.save();
    ctx.beginPath(); ctx.arc(c, c, c * 0.92, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = 'rgba(129,140,248,.10)';
    ctx.lineWidth = 1.2;
    const r = 18; const h = r * Math.sqrt(3);
    for (let y = -h; y < s + h; y += h) {
      for (let x = -r * 3, k = 0; x < s + r * 3; x += r * 3, k++) {
        for (const off of [0, 1]) {
          const cx = x + off * r * 1.5; const cy = y + off * h / 2;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = (Math.PI / 3) * i;
            const px = cx + r * Math.cos(a); const py = cy + r * Math.sin(a);
            if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.stroke();
        }
      }
    }
    ctx.restore();
    // anillos
    const ring = (rr, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(c, c, rr, 0, Math.PI * 2); ctx.stroke(); };
    ring(c * 0.97, 5, 'rgba(34,211,238,.55)');
    ring(c * 0.9, 1.5, 'rgba(167,139,250,.45)');
    ring(c * 0.55, 1.5, 'rgba(34,211,238,.22)');
    ring(c * 0.25, 1.2, 'rgba(167,139,250,.25)');
    // marcas
    ctx.strokeStyle = 'rgba(34,211,238,.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const r1 = c * (i % 6 === 0 ? 0.84 : 0.875); const r2 = c * 0.9;
      ctx.beginPath();
      ctx.moveTo(c + r1 * Math.cos(a), c + r1 * Math.sin(a));
      ctx.lineTo(c + r2 * Math.cos(a), c + r2 * Math.sin(a));
      ctx.stroke();
    }
  });
}
