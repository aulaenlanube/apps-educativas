// src/apps/la-fortaleza/render.js
// Render 100% procedural en canvas: nada de imágenes. El fondo estático
// (cielo, colinas, camino, rejilla) se pre-renderiza una vez por mapa en un
// canvas offscreen; lo dinámico (torres, enemigos, proyectiles, partículas,
// fortaleza animada) se dibuja cada frame.

import { GRID, WORLD, TOWER_TYPES, towerRange, mulberry32, pointAtDistance } from './engine';

const FONT = '"Segoe UI", system-ui, sans-serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Fondo estático (offscreen, una vez por mapa)
// ---------------------------------------------------------------------------

export function createBackground(map, seed) {
  const cv = document.createElement('canvas');
  cv.width = WORLD.w;
  cv.height = WORLD.h;
  const ctx = cv.getContext('2d');
  const rng = mulberry32(seed ^ 0x9e3779b9);

  // Cielo nocturno violeta → azul profundo
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.45, '#312e81');
  sky.addColorStop(1, '#1e3a5f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  // Estrellas
  for (let i = 0; i < 90; i++) {
    const x = rng() * WORLD.w, y = rng() * WORLD.h * 0.5;
    const r = rng() * 1.4 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + rng() * 0.55})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // Luna
  ctx.fillStyle = '#fde68a';
  ctx.beginPath(); ctx.arc(WORLD.w - 90, 64, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath(); ctx.arc(WORLD.w - 80, 56, 22, 0, Math.PI * 2); ctx.fill();

  // Colinas lejanas (siluetas sinusoidales)
  for (let layer = 0; layer < 2; layer++) {
    const baseY = WORLD.h * (0.42 + layer * 0.1);
    const amp = 26 - layer * 8;
    const phase = rng() * 10;
    ctx.fillStyle = layer === 0 ? 'rgba(49,46,129,0.8)' : 'rgba(30,58,95,0.9)';
    ctx.beginPath();
    ctx.moveTo(0, WORLD.h);
    for (let x = 0; x <= WORLD.w; x += 8) {
      ctx.lineTo(x, baseY + Math.sin(x * 0.008 + phase) * amp + Math.sin(x * 0.02 + phase * 2) * amp * 0.4);
    }
    ctx.lineTo(WORLD.w, WORLD.h);
    ctx.closePath(); ctx.fill();
  }

  // Suelo de hierba
  const ground = ctx.createLinearGradient(0, WORLD.h * 0.5, 0, WORLD.h);
  ground.addColorStop(0, '#14532d');
  ground.addColorStop(1, '#052e16');
  ctx.fillStyle = ground;
  ctx.fillRect(0, WORLD.h * 0.52, WORLD.w, WORLD.h * 0.48);
  // Matas de hierba
  for (let i = 0; i < 240; i++) {
    const x = rng() * WORLD.w, y = WORLD.h * 0.53 + rng() * WORLD.h * 0.46;
    ctx.strokeStyle = `rgba(74,222,128,${0.06 + rng() * 0.12})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 4, y - 3 - rng() * 4);
    ctx.stroke();
  }

  // Camino (triple trazo)
  const pts = map.points;
  const drawPath = (width, color, dash = null) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash(dash || []);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  drawPath(40, '#3f2d1d');
  drawPath(32, '#92703f');
  drawPath(2, 'rgba(255,231,170,0.35)', [10, 12]);

  // Puntos de construcción (celdas libres)
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let c = 0; c < GRID.cols; c++) {
    for (let r2 = 0; r2 < GRID.rows; r2++) {
      if (map.pathCells.has(`${c},${r2}`)) continue;
      ctx.beginPath();
      ctx.arc(c * GRID.cell + GRID.cell / 2, r2 * GRID.cell + GRID.cell / 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return cv;
}

// ---------------------------------------------------------------------------
// Fortaleza (animada: bandera al viento, tinte según vidas)
// ---------------------------------------------------------------------------

function drawFortress(ctx, game) {
  const end = game.map.points[game.map.points.length - 1];
  const x = Math.min(end.x, WORLD.w - 36), y = end.y;
  const ratio = game.lives / 10;
  const wall = ratio > 0.6 ? '#7c6f9f' : ratio > 0.3 ? '#9f6f6f' : '#9f4f4f';
  const dark = '#4c4368';

  ctx.save();
  ctx.translate(x, y);

  // Torres laterales
  ctx.fillStyle = dark;
  ctx.fillRect(-34, -52, 16, 70);
  ctx.fillRect(18, -52, 16, 70);
  // Muro central
  ctx.fillStyle = wall;
  ctx.fillRect(-26, -38, 52, 56);
  // Almenas
  ctx.fillStyle = dark;
  for (let i = -3; i <= 2; i++) ctx.fillRect(i * 9 - 2, -44, 6, 8);
  ctx.fillRect(-36, -60, 20, 8);
  ctx.fillRect(16, -60, 20, 8);
  // Puerta
  ctx.fillStyle = '#2a2440';
  ctx.beginPath();
  ctx.moveTo(-9, 18); ctx.lineTo(-9, -4);
  ctx.arc(0, -4, 9, Math.PI, 0);
  ctx.lineTo(9, 18);
  ctx.closePath(); ctx.fill();
  // Ventanas iluminadas
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-29, -30, 5, 8);
  ctx.fillRect(24, -30, 5, 8);
  // Mástil + bandera ondeante
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, -78); ctx.stroke();
  ctx.fillStyle = ratio > 0.3 ? '#a855f7' : '#ef4444';
  ctx.beginPath();
  ctx.moveTo(0, -78);
  for (let i = 0; i <= 24; i += 4) {
    ctx.lineTo(i, -78 + Math.sin(game.time * 6 + i * 0.3) * 3);
  }
  for (let i = 24; i >= 0; i -= 4) {
    ctx.lineTo(i, -64 + Math.sin(game.time * 6 + i * 0.3) * 3);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Torres
// ---------------------------------------------------------------------------

function towerColor(game, tw) {
  if (tw.type === 'hielo') return '#7dd3fc';
  if (tw.type === 'prisma') return '#c084fc';
  return game.categories[tw.catIdx].color;
}

function drawTower(ctx, game, tw, selected) {
  const type = TOWER_TYPES[tw.type];
  const color = towerColor(game, tw);
  const jammed = type.needsCategory && game.time < game.jams[tw.catIdx];
  const pulse = 0.75 + Math.sin(game.time * 4 + tw.id) * 0.25;

  ctx.save();
  ctx.translate(tw.x, tw.y);
  if (jammed) ctx.globalAlpha = 0.55;

  // Alcance si está seleccionada
  if (selected) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(0, 0, towerRange(tw), 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Base trapezoidal
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.moveTo(-16, 18); ctx.lineTo(16, 18); ctx.lineTo(11, 6); ctx.lineTo(-11, 6);
  ctx.closePath(); ctx.fill();

  // Cuerpo
  ctx.fillStyle = '#4b5563';
  rr(ctx, -11, -16, 22, 24, 5);
  ctx.fill();

  // Núcleo de categoría (brillo pulsante)
  ctx.shadowColor = color;
  ctx.shadowBlur = tw.flash > 0 ? 18 : 9 * pulse;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -4, 6 + (tw.flash > 0 ? 2 : 0), 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // Cañón orientado al objetivo
  ctx.save();
  ctx.translate(0, -10);
  ctx.rotate(tw.aim);
  ctx.fillStyle = '#1f2937';
  if (tw.type === 'canon') { rr(ctx, 2, -5, 18, 10, 4); ctx.fill(); }
  else if (tw.type === 'prisma') {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(8, -6); ctx.lineTo(8, 6); ctx.closePath(); ctx.fill();
  } else { rr(ctx, 2, -3, 16, 6, 3); ctx.fill(); }
  ctx.restore();

  // Copete por tipo
  ctx.fillStyle = color;
  if (tw.type === 'arquero') {
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(7, -16); ctx.lineTo(-7, -16); ctx.closePath(); ctx.fill();
  } else if (tw.type === 'rafaga') {
    ctx.beginPath(); ctx.moveTo(-2, -28); ctx.lineTo(5, -22); ctx.lineTo(0, -21); ctx.lineTo(4, -15);
    ctx.lineTo(-4, -20); ctx.lineTo(1, -21); ctx.closePath(); ctx.fill();
  } else if (tw.type === 'hielo') {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 7, -21 + Math.sin(a) * 7);
      ctx.lineTo(-Math.cos(a) * 7, -21 - Math.sin(a) * 7);
      ctx.stroke();
    }
  } else if (tw.type === 'prisma') {
    ctx.beginPath(); ctx.moveTo(0, -29); ctx.lineTo(6, -21); ctx.lineTo(0, -13); ctx.lineTo(-6, -21);
    ctx.closePath(); ctx.fill();
  } else if (tw.type === 'canon') {
    ctx.beginPath(); ctx.arc(0, -20, 6, 0, Math.PI * 2); ctx.fill();
  }

  // Pips de nivel
  ctx.fillStyle = '#fbbf24';
  for (let i = 0; i < tw.level - 1; i++) {
    ctx.beginPath(); ctx.arc(-8 + i * 8, 13, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // Indicador de atasco
  if (jammed) {
    ctx.globalAlpha = 1;
    ctx.font = `bold 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(Math.sin(game.time * 10) * 0.4);
    ctx.fillText('⚙️', 0, 0);
    ctx.restore();
  }

  // Rayo del prisma
  if (tw.beam) {
    ctx.globalAlpha = Math.max(tw.beam.life / 0.12, 0);
    const grad = ctx.createLinearGradient(0, -10, tw.beam.x - tw.x, tw.beam.y - tw.y);
    grad.addColorStop(0, '#c084fc');
    grad.addColorStop(1, '#f0abfc');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(tw.beam.x - tw.x, tw.beam.y - tw.y); ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Enemigos (blobs procedurales con semilla)
// ---------------------------------------------------------------------------

function drawEnemy(ctx, game, e, showCatColors) {
  const bob = Math.sin(game.time * 6 + e.phase) * 2;
  const slowed = game.time < e.slowUntil;
  const baseColor = showCatColors || e.revealed
    ? game.categories[e.catIdx].color
    : `hsl(${e.hue}, 22%, 52%)`;

  ctx.save();
  ctx.translate(e.x, e.y + bob);

  // Patitas
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const off = (i - 1.5) * e.radius * 0.45;
    const wig = Math.sin(game.time * 10 + e.phase + i * 1.7) * 3;
    ctx.beginPath();
    ctx.moveTo(off, e.radius * 0.5);
    ctx.lineTo(off + wig, e.radius * 0.9 + 3);
    ctx.stroke();
  }

  // Cuerpo: curva cerrada por 8 radios con semilla
  ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : baseColor;
  ctx.beginPath();
  const n = e.shape.length;
  const px = [], py = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + Math.sin(game.time * 5 + e.phase + i * 2.1) * 0.05;
    px.push(Math.cos(a) * e.radius * e.shape[i] * wobble);
    py.push(Math.sin(a) * e.radius * e.shape[i] * wobble);
  }
  ctx.moveTo((px[0] + px[n - 1]) / 2, (py[0] + py[n - 1]) / 2);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ctx.quadraticCurveTo(px[i], py[i], (px[i] + px[j]) / 2, (py[i] + py[j]) / 2);
  }
  ctx.closePath();
  ctx.fill();

  // Contorno: revelado = color de categoría, enfurecido = rojo
  if (e.revealed || e.enraged) {
    ctx.strokeStyle = e.enraged ? '#ef4444' : game.categories[e.catIdx].color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Tinte de ralentización
  if (slowed) {
    ctx.fillStyle = 'rgba(125,211,252,0.4)';
    ctx.fill();
  }

  // Ojos mirando en la dirección de avance
  const lookX = Math.cos(e.angle) * 3;
  const lookY = Math.sin(e.angle) * 2;
  const eyeR = Math.max(e.radius * 0.22, 3);
  for (const side of [-1, 1]) {
    const ex = side * e.radius * 0.34, ey = -e.radius * 0.2;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex, ey, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.beginPath(); ctx.arc(ex + lookX, ey + lookY, eyeR * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  // Ceño del jefe
  if (e.type === 'boss') {
    ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * e.radius * 0.55, -e.radius * 0.5);
      ctx.lineTo(side * e.radius * 0.15, -e.radius * 0.32);
      ctx.stroke();
    }
    // Corona
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-12, -e.radius - 2);
    ctx.lineTo(-12, -e.radius - 14); ctx.lineTo(-6, -e.radius - 7);
    ctx.lineTo(0, -e.radius - 16); ctx.lineTo(6, -e.radius - 7);
    ctx.lineTo(12, -e.radius - 14); ctx.lineTo(12, -e.radius - 2);
    ctx.closePath(); ctx.fill();
  }

  // Barra de vida (solo si está dañado)
  if (e.hp < e.maxHp) {
    const w = e.radius * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    rr(ctx, -w / 2, -e.radius - 10, w, 4, 2); ctx.fill();
    const ratio = Math.max(e.hp / e.maxHp, 0);
    ctx.fillStyle = ratio > 0.5 ? '#4ade80' : ratio > 0.25 ? '#fbbf24' : '#ef4444';
    rr(ctx, -w / 2, -e.radius - 10, w * ratio, 4, 2); ctx.fill();
  }

  ctx.restore();

  // Etiqueta con la palabra (fuera del translate para no heredar el bob doble)
  const word = e.word || '';
  ctx.font = `bold ${e.type === 'boss' ? 13 : 11}px ${FONT}`;
  const tw2 = ctx.measureText(word).width;
  const bx = e.x - tw2 / 2 - 6;
  const by = e.y + bob - e.radius - (e.hp < e.maxHp ? 30 : 24);
  ctx.fillStyle = 'rgba(15,23,42,0.85)';
  rr(ctx, bx, by, tw2 + 12, 17, 8); ctx.fill();
  if (e.classified) {
    ctx.strokeStyle = e.revealed ? game.categories[e.catIdx].color : 'rgba(148,163,184,0.6)';
    ctx.lineWidth = 1.5;
    rr(ctx, bx, by, tw2 + 12, 17, 8); ctx.stroke();
  }
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, e.x, by + 9);
}

// ---------------------------------------------------------------------------
// Proyectiles y partículas
// ---------------------------------------------------------------------------

function drawProjectile(ctx, game, pr) {
  ctx.save();
  ctx.translate(pr.x, pr.y);
  ctx.rotate(pr.angle || 0);
  if (pr.type === 'arquero') {
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(6, 0); ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(3, -3); ctx.lineTo(3, 3); ctx.closePath(); ctx.fill();
  } else if (pr.type === 'rafaga') {
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (pr.type === 'canon') {
    ctx.fillStyle = '#1f2937';
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (pr.type === 'hielo') {
    ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI + game.time * 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
      ctx.lineTo(-Math.cos(a) * 5, -Math.sin(a) * 5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    const a = Math.max(p.life / p.maxLife, 0);
    if (p.kind === 'spark') {
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
    } else if (p.kind === 'ring') {
      ctx.globalAlpha = a;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 - a) + p.size * 0.3, 0, Math.PI * 2); ctx.stroke();
    } else if (p.kind === 'text') {
      ctx.globalAlpha = Math.min(a * 1.5, 1);
      ctx.font = `bold ${p.size}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 3;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Frame completo
// ---------------------------------------------------------------------------

/**
 * ui = { background, selectedTowerId, hoverCell, placingType, showCatColors }
 */
export function renderGame(ctx, game, ui) {
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  if (ui.background) ctx.drawImage(ui.background, 0, 0);

  // Marcador de entrada del camino (cueva de la que salen)
  const start = pointAtDistance(game.map, 8);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.ellipse(2, start.y, 14, 24, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();

  // Previsualización de colocación
  if (ui.placingType && ui.hoverCell) {
    const [c, r2] = ui.hoverCell;
    const valid = ui.placingValid;
    const x = c * GRID.cell, y = r2 * GRID.cell;
    ctx.fillStyle = valid ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)';
    rr(ctx, x + 3, y + 3, GRID.cell - 6, GRID.cell - 6, 8); ctx.fill();
    if (valid) {
      const type = TOWER_TYPES[ui.placingType];
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x + GRID.cell / 2, y + GRID.cell / 2, type.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  for (const tw of game.towers) drawTower(ctx, game, tw, tw.id === ui.selectedTowerId);
  drawFortress(ctx, game);

  // Enemigos ordenados por avance (los más adelantados encima)
  const sorted = [...game.enemies].sort((a, b) => a.dist - b.dist);
  for (const e of sorted) drawEnemy(ctx, game, e, ui.showCatColors);

  for (const pr of game.projectiles) drawProjectile(ctx, game, pr);
  drawParticles(ctx, game);
}
