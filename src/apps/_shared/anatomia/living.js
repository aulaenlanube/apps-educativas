// Órganos "vivos" de las láminas: el corazón late (~70 lpm) y los pulmones
// respiran (~14 rpm). Aquí solo se decide QUÉ se mueve en cada lámina y desde
// dónde; el movimiento es CSS (anatomia.css, solo transform y solo con
// html[data-fx="high"] y sin movimiento reducido) y lo pinta world.jsx.
//   - Recorte: una copia de la imagen recortada por la silueta de la
//     estructura, escalada desde su centro, encima de la imagen fija.
//   - Entera: si la estructura es casi toda la lámina (corazón por fuera,
//     pulmones, árbol bronquial), se mueve la propia imagen.
// Solo en las láminas renderizadas: en las dibujadas (esquemas, cortes) las
// zonas cortan por dibujos que siguen fuera (vasos, flechas) y se vería la costura.
// Funciones puras (tests en src/__tests__/cuerpo-humano-extras.test.js).

export const LUNG_LOBES = ['lobulo-sup-d', 'lobulo-medio', 'lobulo-inf-d', 'lobulo-sup-i', 'lobulo-inf-i'];
export const HEART_CHAMBERS = ['auricula-d', 'auricula-i', 'ventriculo-d', 'ventriculo-i'];

// Por tipo, alternativas en orden: se usa la primera que aparezca en la lámina.
const RULES = [
  { type: 'beat', options: [{ keys: ['corazon'] }, { keys: HEART_CHAMBERS }] },
  { type: 'breath', options: [{ keys: ['pulmones'] }, { keys: LUNG_LOBES }, { keys: ['bronquios', 'bronquiolos'] }] },
];

// Si la estructura ocupa al menos esta parte de la lámina (renderizada y sin
// cuerpo entero), se mueve la imagen entera.
const WHOLE_SHARE = 0.4;

const unionBox = (boxes) => boxes.reduce(
  (u, b) => [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.max(u[2], b[2]), Math.max(u[3], b[3])],
  [Infinity, Infinity, -Infinity, -Infinity],
);

// plate = { kind, frame, w, h, entries: Map(key → { box, area, d }) }
// → [{ type: 'beat'|'breath', keys, whole, origin: [x, y], box }]
export function livingOf(plate) {
  const entries = plate?.entries;
  if (plate?.kind !== 'render' || !entries?.size) return [];
  const total = [...entries.values()].reduce((s, e) => s + (e.area || 0), 0) || 1;
  const all = unionBox([...entries.values()].map((e) => e.box).filter(Boolean));
  const out = [];
  for (const rule of RULES) {
    for (const opt of rule.options) {
      const keys = opt.keys.filter((k) => entries.get(k)?.d && entries.get(k)?.box);
      if (!keys.length) continue;
      const box = unionBox(keys.map((k) => entries.get(k).box));
      const share = keys.reduce((s, k) => s + (entries.get(k).area || 0), 0) / total;
      const whole = !plate.frame && share >= WHOLE_SHARE;
      const cx = (box[0] + box[2]) / 2;
      // El corazón late desde su centro; los pulmones se hinchan hacia abajo y
      // hacia fuera desde arriba (si se mueve la lámina entera, desde lo más alto
      // para que la laringe y la tráquea no suban).
      const origin = rule.type === 'beat' ? [cx, (box[1] + box[3]) / 2] : [cx, whole ? all[1] : box[1]];
      out.push({ type: rule.type, keys, whole, origin, box });
      break;
    }
  }
  // Solo una imagen entera puede moverse a la vez.
  const firstWhole = out.findIndex((g) => g.whole);
  return firstWhole < 0 ? out : out.filter((g, i) => !g.whole || i === firstWhole);
}

// ¿Hay que parar el movimiento? Cuando la estructura está marcada (acierto,
// fallo, objetivo, seleccionada) para que su contorno coincida con la imagen;
// si se mueve la lámina entera, con cualquier marca.
const QUIET = new Set(['dim', 'neighbor']);
export function livingPaused(group, states) {
  if (!states) return false;
  const marked = (k) => Boolean(states[k]) && !QUIET.has(states[k]);
  return group.whole ? Object.keys(states).some(marked) : group.keys.some(marked);
}

// Origen de la transformación en % de la lámina (transform-box: fill-box).
export const originPct = (group, w, h) => `${((group.origin[0] / w) * 100).toFixed(2)}% ${((group.origin[1] / h) * 100).toFixed(2)}%`;
