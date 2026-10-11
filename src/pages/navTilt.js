// Tilt 3D + foco de luz para las tarjetas de navegación (asignaturas, apps,
// catálogo). Escribe variables CSS directamente en el elemento (sin setState),
// así no hay re-render de React por frame:
//   --mx / --my  posición del puntero en px (la usa .fx-spotlight)
//   --px / --py  posición normalizada -1..1 (parallax del icono)
//   --rx / --ry  rotación en grados (la usa .np-card)
// En táctil no inclinamos (el dedo tapa la tarjeta y el tilt "salta").

const MAX_TILT = 7; // grados

const reduceMotion = () => {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

export function tiltMove(e) {
  if (e.pointerType === 'touch') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const px = (x / r.width) * 2 - 1;
  const py = (y / r.height) * 2 - 1;
  el.style.setProperty('--mx', `${x}px`);
  el.style.setProperty('--my', `${y}px`);
  if (reduceMotion()) return;
  el.style.setProperty('--px', px.toFixed(3));
  el.style.setProperty('--py', py.toFixed(3));
  el.style.setProperty('--rx', `${(-py * MAX_TILT).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(px * MAX_TILT).toFixed(2)}deg`);
}

export function tiltLeave(e) {
  const el = e.currentTarget;
  el.style.setProperty('--px', '0');
  el.style.setProperty('--py', '0');
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
}

// Props listos para esparcir en el elemento: {...tiltProps}
export const tiltProps = { onPointerMove: tiltMove, onPointerLeave: tiltLeave };

// Paleta de acentos para dar a cada tarjeta un halo propio (violeta · rosa ·
// ámbar · índigo · cian · esmeralda), en rotación por índice.
export const NP_ACCENTS = ['#8b5cf6', '#ec4899', '#f59e0b', '#6366f1', '#22d3ee', '#10b981'];
export const accentFor = (i) => NP_ACCENTS[((i % NP_ACCENTS.length) + NP_ACCENTS.length) % NP_ACCENTS.length];

// Activa una tarjeta no-<button> con Enter/Espacio (accesibilidad de teclado).
export const keyActivate = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};
