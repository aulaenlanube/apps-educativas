// Dibujo de las bolas y del recipiente en el canvas de Matter.js (SOLO dibujo).
// Se llama desde el evento 'afterRender', DESPUÉS de que Matter pinte los
// cuerpos: pinta encima una esfera con volumen real (luz arriba-izquierda,
// sombra propia, luz de borde y brillo especular) y el texto ajustado al
// tamaño de la bola. No toca posiciones, velocidades ni nada de la física.
//
// Rendimiento: cada combinación (tono, radio, densidad de píxeles) se pinta UNA
// vez en un canvas auxiliar y en cada frame solo se copia con drawImage. Los
// anchos de texto también se cachean.

// Paletas por estado de la bola: hi (luz), base, lo (sombra), rim (luz de borde)
export const BALL_TONES = {
  idle: { hi: '#e0e7ff', base: '#4f6ef7', lo: '#1e2a78', rim: '#a5b4fc' },   // pendiente
  done: { hi: '#d1fae5', base: '#10b981', lo: '#064e3b', rim: '#6ee7b7' },   // marcada (en orden)
  mine: { hi: '#cffafe', base: '#06b6d4', lo: '#134e4a', rim: '#67e8f9' },   // duelo: acierto mío
  rival: { hi: '#fce7f3', base: '#ec4899', lo: '#701a45', rim: '#f9a8d4' },  // duelo: acierto del rival
  miss: { hi: '#e2e8f0', base: '#64748b', lo: '#1e293b', rim: '#cbd5e1' },   // duelo: marcada por error
};

const spriteCache = new Map();

function makeSprite(tone, r, pr) {
  const pal = BALL_TONES[tone] || BALL_TONES.idle;
  const pad = 8;
  const size = Math.ceil((r + pad) * 2 * pr);
  const c = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(size, size)
    : Object.assign(document.createElement('canvas'), { width: size, height: size });
  const g = c.getContext('2d');
  g.scale(pr, pr);
  const cx = r + pad;
  const cy = r + pad;

  // Halo de estado (solo bolas ya marcadas)
  if (tone !== 'idle') {
    g.beginPath();
    g.arc(cx, cy, r + 4, 0, Math.PI * 2);
    g.strokeStyle = pal.rim;
    g.globalAlpha = 0.55;
    g.lineWidth = 3;
    g.stroke();
    g.globalAlpha = 1;
  }

  // Cuerpo: degradado radial desplazado hacia la luz
  const body = g.createRadialGradient(cx - r * 0.35, cy - r * 0.42, r * 0.08, cx, cy, r);
  body.addColorStop(0, pal.hi);
  body.addColorStop(0.42, pal.base);
  body.addColorStop(1, pal.lo);
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fillStyle = body;
  g.fill();

  // Luz de borde (rebote) abajo-derecha
  const rim = g.createRadialGradient(cx + r * 0.25, cy + r * 0.35, r * 0.55, cx, cy, r);
  rim.addColorStop(0, 'rgba(255,255,255,0)');
  rim.addColorStop(0.82, 'rgba(255,255,255,0)');
  rim.addColorStop(1, hexA(pal.rim, 0.55));
  g.fillStyle = rim;
  g.fill();

  // Brillo especular: mancha suave + punto nítido
  const hx = cx - r * 0.36;
  const hy = cy - r * 0.42;
  const gloss = g.createRadialGradient(hx, hy, 0, hx, hy, r * 0.62);
  gloss.addColorStop(0, 'rgba(255,255,255,0.75)');
  gloss.addColorStop(0.35, 'rgba(255,255,255,0.22)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gloss;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(hx, hy, r * 0.16, r * 0.1, -0.6, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fill();

  // Contorno fino en la sombra para despegar del fondo
  g.beginPath();
  g.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
  g.strokeStyle = hexA(pal.lo, 0.7);
  g.lineWidth = 1.5;
  g.stroke();

  return { canvas: c, half: r + pad };
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// Pinta una bola con volumen. tone: idle | done | mine | rival | miss
export function drawBall3D(ctx, ball, { tone = 'idle', pixelRatio = 1 } = {}) {
  const r = ball.circleRadius;
  if (!ctx || !r) return;
  const pr = Math.max(1, Math.min(2, pixelRatio));
  const key = `${tone}|${Math.round(r * 2) / 2}|${pr}`;
  let sprite = spriteCache.get(key);
  if (!sprite) {
    sprite = makeSprite(tone, r, pr);
    spriteCache.set(key, sprite);
  }
  const { x, y } = ball.position;
  ctx.drawImage(sprite.canvas, x - sprite.half, y - sprite.half, sprite.half * 2, sprite.half * 2);
}

// Texto de la bola: se encoge para caber y lleva contorno (más barato que shadowBlur).
const widthCache = new Map();
export function drawBallLabel(ctx, text, x, y, color = '#fff', maxWidth = 0, baseSize = 18) {
  const label = String(text);
  let size = baseSize;
  if (maxWidth > 0) {
    let w100 = widthCache.get(label);
    if (w100 == null) {
      ctx.save();
      ctx.font = '700 100px Fredoka, Arial, sans-serif';
      w100 = ctx.measureText(label).width;
      ctx.restore();
      widthCache.set(label, w100);
    }
    size = Math.max(10, Math.min(baseSize, (maxWidth / w100) * 100));
  }
  ctx.save();
  ctx.font = `700 ${size}px Fredoka, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2.5, size / 6);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.strokeText(label, x, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(label, x, y + 1);
  ctx.restore();
}

// Paredes del recipiente: material metálico-cristal con canto iluminado.
// `walls` son los cuerpos rectangulares estáticos (rotan con el recipiente).
export function drawWalls(ctx, walls) {
  if (!ctx || !walls) return;
  for (const w of walls) {
    const v = w.vertices;
    if (!v || v.length < 4) continue;
    const ax = v[1].x - v[0].x; const ay = v[1].y - v[0].y;
    const bx = v[3].x - v[0].x; const by = v[3].y - v[0].y;
    const short = Math.hypot(ax, ay) < Math.hypot(bx, by) ? { x: ax, y: ay } : { x: bx, y: by };
    const grad = ctx.createLinearGradient(v[0].x, v[0].y, v[0].x + short.x, v[0].y + short.y);
    grad.addColorStop(0, '#c7d2fe');
    grad.addColorStop(0.18, '#818cf8');
    grad.addColorStop(0.55, '#4f46e5');
    grad.addColorStop(1, '#1e1b4b');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(v[0].x, v[0].y);
    for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 231, 255, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}
