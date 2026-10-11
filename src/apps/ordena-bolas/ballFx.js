// Detalle visual de las bolas en el canvas de Matter.js (solo dibujo).
// Se llama desde el evento 'afterRender', DESPUÉS de que Matter pinte los
// cuerpos: añade un brillo esférico encima del color de la bola y, si está
// marcada, un halo. No toca posiciones, velocidades ni nada de la física.

export function drawBallGloss(ctx, ball, { halo = null } = {}) {
  const r = ball.circleRadius;
  if (!ctx || !r) return;
  const { x, y } = ball.position;

  ctx.save();

  // Halo exterior para bolas ya marcadas
  if (halo) {
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = halo;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Sombra inferior (volumen)
  const shade = ctx.createRadialGradient(x, y + r * 0.35, r * 0.2, x, y, r);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(15,23,42,0.28)');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = shade;
  ctx.fill();

  // Brillo especular arriba-izquierda
  const hx = x - r * 0.35;
  const hy = y - r * 0.42;
  const gloss = ctx.createRadialGradient(hx, hy, r * 0.05, hx, hy, r * 0.75);
  gloss.addColorStop(0, 'rgba(255,255,255,0.6)');
  gloss.addColorStop(0.45, 'rgba(255,255,255,0.12)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = gloss;
  ctx.fill();

  ctx.restore();
}

// Texto de la bola con sombra suave para que se lea sobre el brillo.
export function drawBallLabel(ctx, text, x, y, color = '#fff') {
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.55)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}
