// Motor de DIANAS VOLADORAS (puro, sin r3f). Una diana es una palabra del pool que
// vuela por el cielo describiendo un arco parabólico (gravedad suave). Hay dos tipos:
//   · 'cross' → entra por un lado y cruza el campo de visión hacia el otro.
//   · 'rise'  → se lanza hacia arriba desde el suelo, sube y vuelve a caer.
// La verdad lógica vive en números (px,py,pz / vx,vy,vz); el render (Flyer.jsx) solo
// pinta el panel y el halo, y la integración del movimiento la hace la escena en un
// único useFrame (imperativo sobre el mesh, para que el raycast del disparo use la
// posición de ESTE frame). Cada diana lleva una palabra: válida (categoría que
// puntúa), neutra (señuelo) o la respuesta a una definición activa.
import { FLYER } from './config';

let FLYER_ID = 0;

// Elige una palabra para una diana. `forceWord` (respuesta de definición) tiene
// prioridad; si no, sortea válida/neutra según validRatio (con fallbacks si falta
// alguno de los dos conjuntos).
function pickWord(pool, rng, validRatio) {
  const valids = (pool && pool.validWords) || [];
  const neutrals = (pool && pool.neutralWords) || [];
  let useValid;
  if (!valids.length) useValid = false;
  else if (!neutrals.length) useValid = true;
  else useValid = rng() < validRatio;
  const src = useValid ? valids : neutrals;
  const wd = src[Math.floor(rng() * src.length)] || valids[0] || neutrals[0];
  return wd || { text: '¿?', value: 0, valid: false, category: '__none__' };
}

// Trayectoria de una diana. `speed` escala la velocidad horizontal (no la vertical,
// para que el arco siga siendo legible). Las dianas de definición ('rise' centrado y
// calmado) son un poco más lentas y longevas para que dé tiempo a encontrarlas.
function makeTrajectory(rng, speed, isDef) {
  const G = FLYER.gravity;
  if (isDef) {
    const px = (rng() * 2 - 1) * 7;
    const vy = 7.0 + rng() * 1.6;
    return {
      kind: 'rise',
      px, py: FLYER.riseY, pz: FLYER.zMin + rng() * (FLYER.zMax - FLYER.zMin),
      vx: (rng() * 2 - 1) * 1.4, vy, vz: (rng() * 2 - 1) * 0.5,
      maxLife: (2 * vy) / G + 2.4,
    };
  }
  // 55% cruzan de lado, 45% ascienden desde el suelo
  if (rng() < 0.55) {
    const s = rng() < 0.5 ? -1 : 1;
    const cross = (6.4 + rng() * 3.2) * speed;
    return {
      kind: 'cross',
      px: s * FLYER.spawnHalfW,
      py: 4 + rng() * 5,
      pz: FLYER.zMin + rng() * (FLYER.zMax - FLYER.zMin),
      vx: -s * cross, vy: 3.6 + rng() * 2.8, vz: (rng() * 2 - 1) * 0.9,
      maxLife: (2 * FLYER.spawnHalfW) / cross + 1.4,
    };
  }
  const vy = (8.2 + rng() * 3.4);
  return {
    kind: 'rise',
    px: (rng() * 2 - 1) * (FLYER.spawnHalfW - 3),
    py: FLYER.riseY,
    pz: FLYER.zMin + rng() * (FLYER.zMax - FLYER.zMin),
    vx: (rng() * 2 - 1) * 2.4 * speed, vy, vz: (rng() * 2 - 1) * 0.9,
    maxLife: (2 * vy) / FLYER.gravity + 1.2,
  };
}

// Crea una diana. `opts.def` = { word, points } fuerza la palabra-respuesta (sin
// marcarla; valid:false para no puntuar como categoría). `opts.validRatio`/`speed`
// vienen de la dificultad.
export function spawnFlyer(pool, rng, { validRatio = 0.55, speed = 1, def = null } = {}) {
  const isDef = !!def;
  let text; let value; let valid; let category;
  if (isDef) {
    text = def.word; value = def.points || 5; valid = false; category = '__def__';
  } else {
    const wd = pickWord(pool, rng, validRatio);
    text = wd.text; value = wd.value || 0; valid = !!wd.valid; category = wd.category;
  }
  const traj = makeTrajectory(rng, speed, isDef);
  return {
    id: ++FLYER_ID,
    text, value, valid, category, isDef,
    ...traj,
    age: 0, escaping: false, _mesh: null,
  };
}

// Integra el movimiento (parábola) un paso dt. Devuelve `true` si sigue viva.
export function updateFlyer(f, dt) {
  f.age += dt;
  f.vy -= FLYER.gravity * dt;
  f.px += f.vx * dt;
  f.py += f.vy * dt;
  f.pz += f.vz * dt;
  return f.age < f.maxLife
    && f.py > FLYER.floorY
    && Math.abs(f.px) < FLYER.spawnHalfW + 9;
}

// Marca una diana para que HUYA: se acelera hacia arriba y afuera y se desvanece
// pronto (penalización al disparar un señuelo: las válidas en vuelo escapan).
export function makeEscape(f) {
  if (!f || f.escaping) return;
  f.escaping = true;
  f.vy = Math.max(f.vy, 0) + 7.5;
  f.vx *= 2.4;
  f.maxLife = Math.min(f.maxLife, f.age + 0.85);
}

export function resetFlyerIds() { FLYER_ID = 0; }
