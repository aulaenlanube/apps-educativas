// Motor de DIANAS VOLADORAS (puro, sin r3f). Una diana es una palabra del pool que
// vuela por el cielo describiendo un arco parabólico (gravedad suave). Hay dos tipos
// de trayectoria:
//   · 'cross' → entra por un lado y cruza el campo de visión hacia el otro.
//   · 'rise'  → se lanza hacia arriba desde el suelo, sube y vuelve a caer.
// Además hay dianas de BONIFICACIÓN: gemas pequeñas y MUY rápidas (no son palabras)
// que dan puntos extra al acertarlas.
// La verdad lógica vive en números (px,py,pz / vx,vy,vz); el render (Flyer.jsx) solo
// pinta el panel o la gema, y la integración del movimiento la hace la escena en un
// único useFrame (imperativo sobre el mesh, para que el raycast del disparo use la
// posición de ESTE frame). Cada diana lleva además un `scale` (tamaño): hay palabras
// muy pequeñas (difíciles de acertar) y grandes, para más rejugabilidad y dificultad.
import {
  FLYER, SIZE, BONUS, HAZARD, SCORE_PRINCIPAL, SCORE_SECUNDARIA,
} from './config';

let FLYER_ID = 0;

const rand = ([a, b], rng) => a + rng() * (b - a);

// Valor de una palabra según el par de categorías ACTIVO (rotan durante la partida):
// principal +5, secundaria +2, resto 0 (señuelo). Lo usan el spawn y el re-etiquetado
// de las dianas en vuelo cuando cambian las categorías.
export function valueForCategory(cat, principalName, secundariaName) {
  if (cat && cat === principalName) return SCORE_PRINCIPAL;
  if (cat && cat === secundariaName) return SCORE_SECUNDARIA;
  return 0;
}

// Elige un nuevo par {principal, secundaria} de entre las categorías que pueden
// puntuar, intentando que sea DISTINTO del actual (aunque sea intercambiando roles).
export function pickPair(rotatable, rng, curP = null, curS = null) {
  if (!rotatable || !rotatable.length) return { principalName: null, secundariaName: null };
  if (rotatable.length === 1) return { principalName: rotatable[0], secundariaName: null };
  let p; let s; let tries = 0;
  do {
    const a = Math.floor(rng() * rotatable.length);
    let b = Math.floor(rng() * (rotatable.length - 1));
    if (b >= a) b += 1;
    p = rotatable[a]; s = rotatable[b];
    tries += 1;
  } while (tries < 8 && p === curP && s === curS);
  return { principalName: p, secundariaName: s };
}

// Tamaño (multiplicador) de una palabra. `bias` (0..1) sesga hacia tamaños pequeños:
// en dificultades altas aparecen MUCHAS palabras diminutas, casi imposibles.
function pickScale(rng, bias = 0) {
  const r = rng();
  const tinyP = 0.10 + bias * 0.24;
  const smallP = 0.26 + bias * 0.10;
  const bigP = Math.max(0.05, 0.14 - bias * 0.10);
  if (r < tinyP) return rand(SIZE.tiny, rng);
  if (r < tinyP + smallP) return rand(SIZE.small, rng);
  if (r > 1 - bigP) return rand(SIZE.big, rng);
  return rand(SIZE.normal, rng);
}

// Elige una palabra para una diana según el par de categorías ACTIVO. Con prob.
// validRatio toma una palabra de una categoría que puntúa (válida); si no, de otra
// categoría (señuelo). Fallbacks si solo hay categorías de un tipo.
function pickWord(pool, rng, active, validRatio) {
  const { principalName, secundariaName } = active || {};
  const scoring = [principalName, secundariaName].filter(Boolean);
  const names = (pool && pool.categoryNames) || [];
  const others = names.filter((n) => !scoring.includes(n));
  let useValid;
  if (!scoring.length) useValid = false;
  else if (!others.length) useValid = true;
  else useValid = rng() < validRatio;
  const pick = useValid ? scoring : others;
  const cat = pick[Math.floor(rng() * pick.length)] || names[0];
  const list = (pool && pool.byCategory && pool.byCategory.get(cat)) || [];
  const text = list[Math.floor(rng() * list.length)] || '¿?';
  const value = valueForCategory(cat, principalName, secundariaName);
  return { text, value, valid: value > 0, category: cat };
}

// Trayectoria de una diana. `speed` escala la velocidad horizontal (no la vertical,
// para que el arco siga siendo legible). `forceKind` fuerza 'cross'/'rise' (las
// gemas de bonificación siempre cruzan, muy rápido). Las dianas de definición
// ('rise' centrado y calmado) son un poco más lentas y longevas.
function makeTrajectory(rng, speed, isDef, forceKind = null) {
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
  const kind = forceKind || (rng() < 0.55 ? 'cross' : 'rise');
  if (kind === 'cross') {
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

// Crea una diana.
//   opts.def   = { word, points } → palabra-respuesta de una definición (sin marcar).
//   opts.bonus = true             → gema de bonificación (objeto pequeño y veloz).
//   opts.validRatio/speed/sizeBias vienen de la dificultad.
export function spawnFlyer(pool, rng, {
  validRatio = 0.55, speed = 1, sizeBias = 0, def = null, bonus = false, hazard = false, active = null,
} = {}) {
  if (bonus || hazard) {
    const cfg = hazard ? HAZARD : BONUS;
    const traj = makeTrajectory(rng, speed * cfg.speedMult, false, 'cross');
    return {
      id: ++FLYER_ID,
      text: '', value: 0, valid: false, category: hazard ? '__hazard__' : '__bonus__', isDef: false,
      bonus: !hazard, hazard, bonusPoints: cfg.points,
      scale: rand([cfg.scaleMin, cfg.scaleMax], rng),
      ...traj, age: 0, escaping: false, spinA: 0, _mesh: null,
    };
  }
  const isDef = !!def;
  let text; let value; let valid; let category;
  if (isDef) {
    text = def.word; value = def.points || 5; valid = false; category = '__def__';
  } else {
    const wd = pickWord(pool, rng, active, validRatio);
    text = wd.text; value = wd.value || 0; valid = !!wd.valid; category = wd.category;
  }
  // las definiciones se mantienen legibles (tamaño normal); el resto varía mucho.
  const scale = isDef ? (0.95 + rng() * 0.2) : pickScale(rng, sizeBias);
  const traj = makeTrajectory(rng, speed, isDef);
  return {
    id: ++FLYER_ID,
    text, value, valid, category, isDef, bonus: false,
    scale,
    ...traj, age: 0, escaping: false, spinA: 0, _mesh: null,
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
