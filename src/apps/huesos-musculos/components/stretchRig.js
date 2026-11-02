// Maniquí articulado de los estiramientos (Huesos y Músculos) y de las escenas
// de primeros auxilios: longitudes, cinemática directa e inversa y la postura
// de cada ejercicio. Puro: lo usan la figura animada y los tests.
//
// Ángulos en grados con el convenio de SVG (positivo = horario). Un segmento
// en reposo apunta hacia abajo (0, 1).
// · De perfil (view 'side'), mirando a la derecha (+x es la cara anterior):
//   trunk >0 inclina el tronco hacia delante; neck >0 flexiona el cuello;
//   shX <0 flexiona el hombro (brazo adelante/arriba), >0 lo extiende (atrás);
//   elX <0 flexiona el codo; hipX <0 flexiona la cadera; knX >0 flexiona la
//   rodilla; anX >0 flexión plantar. F = extremidad lejana, N = cercana.
// · De frente (view 'front'): L / R = izquierda / derecha del dibujo;
//   armL >0 y armR <0 separan los brazos (abducción); legL >0 y legR <0 separan
//   las piernas; trunk y neck >0 inclinan hacia la derecha del dibujo.
//   ltX / lsX: largo aparente del muslo y de la pierna (escorzo, 1 = entero).
// root = { x, y, r }: posición de la cadera y giro de todo el cuerpo.

export const LEN = { torso: 50, neck: 54, ua: 31, fa: 27, th: 44, sh: 42 };
export const FRONT = { hipX: 10, shX: 20, shY: 46, neck: 50, ua: 30, fa: 26 };
export const VIEWBOX = 240;
export const FLOOR = 222;

const D = Math.PI / 180;
export const rot = ([x, y], deg) => {
  const c = Math.cos(deg * D); const s = Math.sin(deg * D);
  return [x * c - y * s, x * s + y * c];
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = ([x, y]) => Math.hypot(x, y);
// ángulo con el que el vector (0, 1) apunta hacia d
const dirAngle = ([dx, dy]) => Math.atan2(-dx, dy) / D;
const norm180 = (a) => { let x = ((a + 180) % 360 + 360) % 360 - 180; if (x === -180) x = 180; return x; };

// Brazo o pierna de dos segmentos: ángulo absoluto del primero y relativo del
// segundo para que su extremo llegue a `target`. s = +1 dobla como un codo
// (antebrazo hacia delante), s = -1 como una rodilla.
export function ik2(base, target, L1, L2, s = 1) {
  const d = sub(target, base);
  const dist = Math.min(Math.max(len(d), Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.01);
  const alpha = dirAngle(d);
  const beta = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist)))) / D;
  const gamma = 180 - Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2)))) / D;
  return { upper: alpha + s * beta, lower: -s * gamma };
}

/* ───────── cinemática directa ───────── */

const SIDE_LIMBS = {
  armF: ['shF', 'elF'], armN: ['shN', 'elN'], legF: ['hipF', 'knF', 'anF'], legN: ['hipN', 'knN', 'anN'],
};
const FRONT_LIMBS = {
  armL: ['armL', 'elL'], armR: ['armR', 'elR'], legL: ['legL', 'knL'], legR: ['legR', 'knR'],
};

function fkSide(j, root) {
  const r = root.r || 0;
  const H = [root.x, root.y];
  const t = r + (j.trunk || 0);
  const S = add(H, rot([0, -LEN.torso], t));
  const neckBase = add(H, rot([0, -LEN.neck], t));
  const head = add(neckBase, rot([3, -13], t + (j.neck || 0)));
  const p = { hip: H, shoulder: S, neckBase, head, chest: add(H, rot([0, -36], t)) };
  for (const side of ['F', 'N']) {
    const a1 = t + (j[`sh${side}`] || 0);
    const E = add(S, rot([0, LEN.ua], a1));
    const a2 = a1 + (j[`el${side}`] || 0);
    p[`elbow${side}`] = E;
    p[`wrist${side}`] = add(E, rot([0, LEN.fa], a2));
    p[`hand${side}`] = add(E, rot([0, LEN.fa + 4], a2));
    const b1 = r + (j[`hip${side}`] || 0);
    const K = add(H, rot([0, LEN.th * (j[`lt${side}`] ?? 1)], b1));
    const b2 = b1 + (j[`kn${side}`] || 0);
    const A = add(K, rot([0, LEN.sh * (j[`ls${side}`] ?? 1)], b2));
    const b3 = b2 + (j[`an${side}`] || 0);
    p[`knee${side}`] = K;
    p[`ankle${side}`] = A;
    p[`toe${side}`] = add(A, rot([17, 1], b3));
    p[`heel${side}`] = add(A, rot([-5, 4], b3));
  }
  return p;
}

function fkFront(j, root) {
  const r = root.r || 0;
  const H = [root.x, root.y];
  const t = r + (j.trunk || 0);
  const neckBase = add(H, rot([0, -FRONT.neck], t));
  const p = { hip: H, neckBase, head: add(neckBase, rot([0, -14], t + (j.neck || 0))), chest: add(H, rot([0, -34], t)) };
  for (const [side, sx] of [['L', -1], ['R', 1]]) {
    const S = add(H, rot([sx * FRONT.shX, -FRONT.shY], t));
    const a1 = t + (j[`arm${side}`] || 0);
    const E = add(S, rot([0, FRONT.ua], a1));
    const a2 = a1 + (j[`el${side}`] || 0);
    p[`shoulder${side}`] = S;
    p[`elbow${side}`] = E;
    p[`wrist${side}`] = add(E, rot([0, FRONT.fa], a2));
    p[`hand${side}`] = add(E, rot([0, FRONT.fa + 4], a2));
    const P = add(H, rot([sx * FRONT.hipX, 2], r));
    const b1 = r + (j[`leg${side}`] || 0);
    const K = add(P, rot([0, LEN.th * (j[`lt${side}`] ?? 1)], b1));
    const b2 = b1 + (j[`kn${side}`] || 0);
    p[`hip${side}`] = P;
    p[`knee${side}`] = K;
    p[`ankle${side}`] = add(K, rot([0, LEN.sh * (j[`ls${side}`] ?? 1)], b2));
  }
  return p;
}

export const fk = (view, j, root) => (view === 'front' ? fkFront(j, root) : fkSide(j, root));

/* ───────── resolver una postura ───────── */

// Punto de referencia: nombre de un punto de la cinemática directa, [x, y] o
// una función de los puntos (p. ej. la pared a la altura del hombro).
const pointOf = (pts, ref, off = [0, 0]) => add(typeof ref === 'function' ? ref(pts) : Array.isArray(ref) ? ref : pts[ref], off);

// Base del primer segmento de una extremidad y su ángulo de referencia.
function limbBase(view, limb, j, root, pts) {
  const r = root.r || 0;
  const t = r + (j.trunk || 0);
  if (view === 'front') {
    const side = limb.slice(-1);
    return limb.startsWith('arm') ? [pts[`shoulder${side}`], t] : [pts[`hip${side}`], r];
  }
  return limb.startsWith('arm') ? [pts.shoulder, t] : [pts.hip, r];
}

function limbLens(view, limb, j) {
  if (limb.startsWith('arm')) return view === 'front' ? [FRONT.ua, FRONT.fa] : [LEN.ua, LEN.fa];
  const side = limb.slice(-1);
  return [LEN.th * (j[`lt${side}`] ?? 1), LEN.sh * (j[`ls${side}`] ?? 1)];
}

// spec: { view, root0, root1?, j0, j1?, plant?, ik?, ik0?, ik1? }
// plant: { limb: 'legN', at: [x, y], point: 'ankle' | 'knee' } fija ese punto (mueve la cadera).
// ik: { limb: { to, off?, s?, flat? } } coloca el extremo de la extremidad en `to`.
export function resolvePose(spec, which = 0) {
  const view = spec.view || 'side';
  const j = { ...spec.j0, ...(which ? spec.j1 : {}) };
  const root = { r: 0, ...spec.root0, ...(which ? spec.root1 : {}) };
  const plants = [].concat(spec.plant || [], (which ? spec.plant1 : spec.plant0) || []);
  for (const pl of plants) {
    const [k1, k2] = (view === 'front' ? FRONT_LIMBS : SIDE_LIMBS)[pl.limb];
    const r = root.r || 0;
    const [L1, L2] = limbLens(view, pl.limb, j);
    let v = rot([0, L1], r + (j[k1] || 0));
    if (pl.point !== 'knee') v = add(v, rot([0, L2], r + (j[k1] || 0) + (j[k2] || 0)));
    const hipOff = view === 'front' ? rot([(pl.limb.endsWith('L') ? -1 : 1) * FRONT.hipX, 2], r) : [0, 0];
    [root.x, root.y] = sub(sub(pl.at, v), hipOff);
  }
  const iks = { ...(spec.ik || {}), ...((which ? spec.ik1 : spec.ik0) || {}) };
  const reach = {};
  for (const [limb, g] of Object.entries(iks)) {
    const pts = fk(view, j, root);
    const [base, ref] = limbBase(view, limb, j, root, pts);
    const target = pointOf(pts, g.to, g.off);
    const [L1, L2] = limbLens(view, limb, j);
    const keys = (view === 'front' ? FRONT_LIMBS : SIDE_LIMBS)[limb];
    const s = g.s ?? (limb.startsWith('arm') ? 1 : -1);
    const { upper, lower } = ik2(base, target, L1, L2, s);
    j[keys[0]] = norm180(upper - ref);
    j[keys[1]] = norm180(lower);
    if (g.flat && keys[2]) j[keys[2]] = norm180(-((root.r || 0) + j[keys[0]] + j[keys[1]]) + (g.flat === true ? 0 : g.flat));
    const end = fk(view, j, root)[`${limb.startsWith('arm') ? 'wrist' : 'ankle'}${limb.slice(-1)}`];
    reach[limb] = len(sub(end, target));
  }
  return { view, j, root, pts: fk(view, j, root), reach };
}

// Las dos posturas de un ejercicio, con los ángulos de la segunda llevados al
// giro más corto desde la primera (para que la animación no dé vueltas).
export function resolveStretch(spec) {
  const a = resolvePose(spec, 0);
  const b = resolvePose(spec, 1);
  for (const k of new Set([...Object.keys(a.j), ...Object.keys(b.j)])) {
    if (/^(lt|ls)[LRFN]$/.test(k)) continue;
    const x = a.j[k] || 0;
    let y = b.j[k] || 0;
    while (y - x > 180) y -= 360;
    while (y - x < -180) y += 360;
    b.j[k] = y;
  }
  let r1 = b.root.r || 0;
  const r0 = a.root.r || 0;
  while (r1 - r0 > 180) r1 -= 360;
  while (r1 - r0 < -180) r1 += 360;
  b.root.r = r1;
  return [a, b];
}

/* ───────── posturas ───────── */

const WALL_X = 204;
// punto a una fracción t del segmento de a a b (en los puntos de la cinemática)
const along = (a, b, t, [ox, oy] = [0, 0]) => (p) => [p[a][0] + (p[b][0] - p[a][0]) * t + ox, p[a][1] + (p[b][1] - p[a][1]) * t + oy];
const DOOR_X = 64;

// hl: bandas del músculo estirado (se ven al responder): { seg, side: 'front'|'back'|'in'|'out', from, to }
// props: decorado (suelo, esterilla, pared, puerta)
export const STRETCH_POSES = {
  // Talón al glúteo, de pie (cuádriceps)
  'cuadriceps-pie': {
    view: 'side',
    props: ['floor'],
    root0: { x: 116, y: 131 },
    j0: { shF: -6, elF: -8, shN: 6, elN: -6 },
    j1: { hipN: 10, knN: 158, anN: 35, shF: -55, elF: -20, trunk: 5 },
    ik1: { armN: { to: 'ankleN', off: [0, 0] } },
    plant: { limb: 'legF', at: [116, 217] },
    hl: [{ seg: 'thighN', side: 'front' }],
  },
  // Sentado, manos hacia los pies (isquiotibiales)
  'isquios-sentado': {
    view: 'side',
    props: ['mat'],
    order: 'legsFirst',
    root0: { x: 70, y: 203 },
    j0: { hipF: -90, hipN: -90, anF: -6, anN: -6, trunk: 0, neck: 4 },
    j1: { trunk: 48, neck: 12 },
    ik0: { armF: { to: 'kneeF', off: [-12, -9] }, armN: { to: 'kneeN', off: [-14, -9] } },
    ik1: { armF: { to: 'ankleF', off: [-4, -9] }, armN: { to: 'ankleN', off: [-8, -9] } },
    hl: [{ seg: 'thighN', side: 'back' }],
  },
  // Empujar la pared con la pierna de atrás estirada (gemelos)
  'gemelos-pared': {
    view: 'side',
    props: ['floor', 'wall'],
    j0: { hipN: 15, anN: -15, trunk: 12, shF: -92, elF: -6, shN: -88, elN: -8 },
    j1: { hipN: 27, anN: -27, trunk: 23 },
    plant: { limb: 'legN', at: [92, 217] },
    ik: { legF: { to: [134, 217], s: -1, flat: true } },
    ik1: { armF: { to: (p) => [WALL_X - 7, p.shoulder[1] + 2] }, armN: { to: (p) => [WALL_X - 7, p.shoulder[1] + 6] } },
    hl: [{ seg: 'shankN', side: 'back' }],
  },
  // Antebrazo en el marco de una puerta (pectoral)
  'pectoral-puerta': {
    view: 'side',
    props: ['floor', 'door'],
    j0: { hipN: 10, trunk: 2 },
    j1: { hipN: 18, trunk: 6 },
    plant: { limb: 'legN', at: [84, 217] },
    ik: {
      legF: { to: [112, 217], s: -1, flat: true },
      armF: { to: [DOOR_X + 4, 58], s: -1 }, armN: { to: [DOOR_X + 7, 56], s: -1 },
    },
    hl: [{ seg: 'torso', side: 'front', from: -50, to: -28 }],
  },
  // Mano a la espalda por detrás de la cabeza (tríceps)
  'triceps-cabeza': {
    view: 'side',
    props: ['floor'],
    root0: { x: 116, y: 131 },
    j0: { shN: 4, elN: -6, shF: 4, elF: -6, hipF: -3, hipN: 3 },
    j1: { shN: -172, elN: -148, neck: 14, shF: 2, elF: -10 },
    hl: [{ seg: 'upperArmN', side: 'back' }],
  },
  // Mariposa: sentado con las plantas juntas (aductores)
  'aductores-mariposa': {
    view: 'front',
    props: ['mat'],
    // de frente, los muslos van hacia fuera y hacia delante: se dibujan en escorzo
    root0: { x: 120, y: 201 },
    j0: { legL: 122, knL: -173.4, ltL: 0.7, lsL: 0.89, legR: -122, knR: 173.4, ltR: 0.7, lsR: 0.89 },
    j1: { legL: 98.5, knL: -171.6, ltL: 0.9, lsL: 1.05, legR: -98.5, knR: 171.6, ltR: 0.9, lsR: 1.05 },
    ik: { armL: { to: 'ankleL', off: [-4, -6], s: 1 }, armR: { to: 'ankleR', off: [4, -6], s: -1 } },
    hl: [{ seg: 'thighL', side: 'in' }, { seg: 'thighR', side: 'in' }],
  },
  // Zancada con la rodilla de atrás en el suelo (psoas ilíaco)
  'flexores-zancada': {
    view: 'side',
    props: ['mat'],
    j0: { hipN: 0, knN: 90, anN: 90, trunk: 0 },
    j1: { hipN: 24, knN: 66, anN: 90, trunk: -2 },
    plant: { limb: 'legN', point: 'knee', at: [90, 208] },
    ik: {
      legF: { to: [140, 217], s: -1, flat: true },
      armF: { to: along('hip', 'kneeF', 0.62, [0, -8]) }, armN: { to: along('hip', 'kneeF', 0.55, [0, -7]) },
    },
    hl: [{ seg: 'thighN', side: 'front', from: 0, to: 22 }, { seg: 'torso', side: 'front', from: -14, to: 6 }],
  },
  // Figura de 4, boca arriba (glúteo mayor)
  'gluteo-figura4': {
    view: 'side',
    props: ['mat'],
    // la pierna cruzada apunta hacia fuera (hacia quien mira): va en escorzo
    root0: { x: 122, y: 200, r: -90 },
    j0: { hipF: -84, knF: 92, anF: 15, neck: 2, ltN: 0.8, lsN: 0.66 },
    j1: { hipF: -112, knF: 96, anF: 20, neck: 10 },
    ik: {
      legN: { to: 'kneeF', off: [4, 7], s: 1 },
      armF: { to: along('hip', 'kneeF', 0.55, [-2, 2]), s: 1 }, armN: { to: along('hip', 'kneeF', 0.5, [0, 4]), s: 1 },
    },
    hl: [{ seg: 'thighN', side: 'back', from: -4, to: 18 }],
  },
  // Inclinación lateral con el brazo por encima de la cabeza (dorsal ancho)
  'dorsal-lateral': {
    view: 'front',
    props: ['floor'],
    root0: { x: 120, y: 131 },
    j0: { legL: 4, legR: -4, armL: 8, armR: -150, elR: -10, elL: 0 },
    j1: { trunk: -24, armR: -168, elR: -24, neck: -6 },
    ik1: { armL: { to: 'hipL', off: [-8, -8], s: 1 } },
    hl: [{ seg: 'torso', side: 'out', from: -44, to: -10 }],
  },
  // Inclinar la cabeza hacia el hombro (trapecio)
  'cuello-lateral': {
    view: 'front',
    props: ['floor'],
    root0: { x: 120, y: 131 },
    j0: { legL: 4, legR: -4, armL: 4, armR: -4 },
    j1: { neck: -32, armR: -2 },
    ik1: { armL: { to: 'head', off: [11, -8], s: -1 } },
    hl: [{ seg: 'neckR' }],
  },
};

export const STRETCH_FIGS = Object.keys(STRETCH_POSES);
