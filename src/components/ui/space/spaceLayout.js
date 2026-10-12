// Generación PROCEDURAL y determinista del fondo 3D "espacio": el futuro viaje
// de la humanidad, los robots y la IA hacia las estrellas.
//
// Composición (encuadre de escritorio; en vertical se recompone, ver
// composeSpace): la cámara deriva despacio cerca del origen mirando a -Z.
//   · En el infinito (no hay paralaje): campo de estrellas, nebulosas (mapa
//     horneado en la GPU al arrancar), una galaxia espiral arriba a la
//     izquierda y un AGUJERO NEGRO con disco de acreción arriba a la derecha.
//   · Lejos: la estrella del sistema envuelta en un ENJAMBRE DE DYSON (la
//     megaestructura de la IA), un gigante gaseoso anillado con su luna y un
//     planeta helado diminuto.
//   · Medio: el planeta de origen (abajo a la izquierda, lado nocturno con
//     ciudades y el amanecer en el limbo), la ESTACIÓN en anillo, la PUERTA
//     ESTELAR (abajo a la derecha) y la ruta balizada entre ambas, por la que
//     sale el convoy de naves-arca escoltado por la sonda-robot (la mascota).
//     Un haz de datos de luz une el enjambre con la puerta (la IA la alimenta).
//   · Cerca: un río de asteroides que cruza la esquina inferior derecha y
//     polvo que fluye hacia la cámara (sensación de viaje).
//
// Todo sale de semillas fijas. Lo que depende de la densidad se genera UNA vez
// a la máxima y cada nivel se queda con un PREFIJO estable (mismas estrellas y
// rocas en el mismo sitio), así que cambiar de nivel en caliente no "salta".
// Nada de texturas ni modelos descargados (ver SpaceScene.jsx).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '@/components/ui/bg3d/bgEnv';

export const SPACE = {
  FAR: 7000,            // plano lejano de la cámara
  SKY_R: 2600,          // esfera del cielo (sigue a la cámara)
  STAR_R: 2350,         // estrellas "en el infinito"
  NEB_G: [1.9, 1.25],   // semiextensión gnomónica del mapa de nebulosa (±62° · ±51°)
  NEB_SIZE: [1024, 672],
  NOISE: 128,           // baldosa de ruido periódica (CPU, RGBA)
  MAX_SHIPS: 12,
};

// Presupuesto de contenido por densidad ('low' en móvil/equipos modestos y
// fotograma fijo). Ver SpaceBackground.jsx y los números medidos en SpaceScene.jsx.
export const DENSITY = {
  high: { stars: 5200, starsMid: 1300, bright: 30, galaxy: 9000, swarm: 3400, dust: 480, rocks: 300, rockDetail: 1, ships: 9, beacons: 36, pulses: 44 },
  medium: { stars: 3400, starsMid: 760, bright: 24, galaxy: 5600, swarm: 2100, dust: 260, rocks: 170, rockDetail: 1, ships: 7, beacons: 28, pulses: 30 },
  low: { stars: 2000, starsMid: 360, bright: 18, galaxy: 2800, swarm: 1100, dust: 0, rocks: 90, rockDetail: 0, ships: 5, beacons: 20, pulses: 16 },
};
const MAX = DENSITY.high;

const D2R = Math.PI / 180;
export function dirYP(yawDeg, pitchDeg, out = new THREE.Vector3()) {
  const y = yawDeg * D2R;
  const p = pitchDeg * D2R;
  return out.set(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
}

// ---------------------------------------------------------------------------
// Composición: dos encuadres (apaisado / vertical) que se interpolan según la
// forma de la pantalla. yaw (+ derecha) y pitch (+ arriba) en grados respecto
// a -Z; dist en unidades de mundo; R = radio.
// ---------------------------------------------------------------------------
const WIDE = {
  fov: 50,
  bh: { yaw: 24.5, pitch: 16, b: 0.044, roll: -0.2 },
  gal: { yaw: -26, pitch: 16.5, rad: 0.25, tilt: 62, pa: -24 },
  sun: { yaw: 3.5, pitch: 16.5, dist: 2600, R: 30 },
  home: { yaw: -30, pitch: -58, dist: 820, R: 610 },
  giant: { yaw: 31, pitch: -2.5, dist: 980, R: 92 },
  moon: { yaw: 25.2, pitch: 4.6, dist: 900, R: 13 },
  ice: { yaw: -9, pitch: 6, dist: 2100, R: 19 },
  station: { yaw: -8, pitch: -12.5, dist: 92, R: 8.5 },
  gate: { yaw: 22.5, pitch: -12.5, dist: 210, R: 15 },
  rocks: { p0: [33, -44, 30], p1: [35, -25, 80], p2: [47, -14, 270] },
  comet: { yaw: -12, pitch: 21, dist: 1500 },
};
const TALL = {
  fov: 66,
  bh: { yaw: 10.5, pitch: 24.5, b: 0.042, roll: -0.2 },
  gal: { yaw: -15, pitch: 34, rad: 0.34, tilt: 64, pa: -28 },
  sun: { yaw: -10.5, pitch: 14, dist: 2600, R: 28 },
  home: { yaw: -16, pitch: -64, dist: 820, R: 610 },
  giant: { yaw: 15, pitch: -6, dist: 980, R: 80 },
  moon: { yaw: 10.5, pitch: -1, dist: 900, R: 12 },
  ice: { yaw: -11, pitch: 20, dist: 2100, R: 17 },
  station: { yaw: -6, pitch: -19, dist: 92, R: 8.5 },
  gate: { yaw: 6, pitch: -23, dist: 210, R: 15 },
  rocks: { p0: [21, -50, 30], p1: [23, -34, 72], p2: [32, -20, 260] },
  comet: { yaw: -4, pitch: 30, dist: 1500 },
};

const lerp = (a, b, k) => a + (b - a) * k;
function lerpObj(a, b, k) {
  const o = {};
  for (const key of Object.keys(a)) {
    const va = a[key];
    const vb = b[key];
    if (typeof va === 'number') o[key] = lerp(va, vb, k);
    else if (Array.isArray(va)) o[key] = va.map((v, i) => lerp(v, vb[i], k));
    else o[key] = lerpObj(va, vb, k);
  }
  return o;
}

const at = (o) => dirYP(o.yaw, o.pitch).multiplyScalar(o.dist);

// aspect = ancho / alto de la pantalla
export function composeSpace(aspect) {
  const k = THREE.MathUtils.clamp((1.3 - aspect) / (1.3 - 0.55), 0, 1); // 0 apaisado · 1 vertical
  const C = lerpObj(WIDE, TALL, k);
  const sunPos = at(C.sun);
  const stationPos = at(C.station);
  const gatePos = at(C.gate);
  // la puerta mira (más o menos) hacia la estación: el convoy entra de frente
  const gateAxis = stationPos.clone().sub(gatePos).normalize().lerp(new THREE.Vector3(0, 0, 1), 0.45).normalize();
  // ruta del convoy: estación → puerta con una ligera curva hacia arriba
  const routeA = stationPos.clone().add(new THREE.Vector3(2.5, 1.5, -2));
  const routeE = gatePos.clone();
  const routeC = routeA.clone().lerp(routeE, 0.5).add(new THREE.Vector3(-6, 13, 18));
  // enlace de datos de luz: enjambre de Dyson → puerta (la IA la alimenta)
  const linkA = sunPos.clone().multiplyScalar(0.96);
  const linkE = gatePos.clone().add(gateAxis.clone().multiplyScalar(-6));
  const linkC = linkA.clone().lerp(linkE, 0.5).add(new THREE.Vector3(60, 40, 0));
  const rockP = [C.rocks.p0, C.rocks.p1, C.rocks.p2].map(([yaw, pitch, dist]) => dirYP(yaw, pitch).multiplyScalar(dist));
  return {
    k,
    fov: C.fov,
    C,
    bhDir: dirYP(C.bh.yaw, C.bh.pitch),
    galDir: dirYP(C.gal.yaw, C.gal.pitch),
    sunPos,
    sunDir: sunPos.clone().normalize(),
    stationPos,
    gatePos,
    gateAxis,
    route: [routeA, routeC, routeE],
    link: [linkA, linkC, linkE],
    rockP,
    cometPos: at(C.comet),
  };
}

// Datos por instancia de los cuerpos tipo "billboard" (planetas, luna, estrella)
// ordenados de lejos a cerca (se pintan en ese orden en una sola llamada).
// aCenter: xyz + radio · aAxis: eje de giro/anillos + radio exterior del anillo
// aKind: tipo (0 gigante, 1 planeta de origen, 2 luna, 3 helado, 4 estrella),
//        semilla, radio interior del anillo, escala del quad.
export function buildBodies(comp) {
  const { C } = comp;
  const list = [
    { type: 4, pos: comp.sunPos, R: C.sun.R, axis: [0, 1, 0], ringO: 0, ringI: 0, quad: 8, seed: 0.3 },
    { type: 3, pos: dirYP(C.ice.yaw, C.ice.pitch).multiplyScalar(C.ice.dist), R: C.ice.R, axis: [0.3, 1, 0.1], ringO: 0, ringI: 0, quad: 1.45, seed: 0.7 },
    { type: 0, pos: dirYP(C.giant.yaw, C.giant.pitch).multiplyScalar(C.giant.dist), R: C.giant.R, axis: [-0.32, 1, 0.42], ringO: 2.35, ringI: 1.32, quad: 2.4, seed: 0.1 },
    { type: 2, pos: dirYP(C.moon.yaw, C.moon.pitch).multiplyScalar(C.moon.dist), R: C.moon.R, axis: [0, 1, 0], ringO: 0, ringI: 0, quad: 1.2, seed: 0.5 },
    { type: 1, pos: dirYP(C.home.yaw, C.home.pitch).multiplyScalar(C.home.dist), R: C.home.R, axis: [0.25, 1, -0.2], ringO: 0, ringI: 0, quad: 1.3, seed: 0.9 },
  ];
  list.sort((a, b) => b.pos.length() - a.pos.length());
  const n = list.length;
  const center = new Float32Array(n * 4);
  const axis = new Float32Array(n * 4);
  const kind = new Float32Array(n * 4);
  const ax = new THREE.Vector3();
  list.forEach((b, i) => {
    center.set([b.pos.x, b.pos.y, b.pos.z, b.R], i * 4);
    ax.set(...b.axis).normalize();
    axis.set([ax.x, ax.y, ax.z, b.ringO], i * 4);
    kind.set([b.type, b.seed, b.ringI, b.quad], i * 4);
  });
  return { count: n, center, axis, kind };
}

// ---------------------------------------------------------------------------
// Puntos lejanos (una sola llamada): estrellas en el infinito, estrellas a
// media distancia (paralaje) y estrellas de la galaxia (marco de la galaxia).
// aStar: tamaño px, fase, temperatura/color, tipo (0 cielo · 1 media · 2 galaxia)
// ---------------------------------------------------------------------------
let FAR_FULL = null;
function genFar() {
  const rng = mulberry32(7331);
  const gauss = () => {
    let u = 0;
    for (let i = 0; i < 4; i++) u += rng();
    return (u - 2) * 1.732;
  };
  // banda galáctica (círculo máximo) que cruza en diagonal hacia el agujero negro
  const bandN = new THREE.Vector3(0.36, 0.9, 0.24).normalize();
  const v = new THREE.Vector3();
  const sky = [];
  while (sky.length < MAX.stars + MAX.bright) {
    v.set(gauss(), gauss(), gauss()).normalize();
    if (v.z > 0.3) continue; // la cámara nunca mira hacia atrás
    const band = Math.exp(-((v.dot(bandN) / 0.2) ** 2));
    if (rng() > 0.35 + 0.65 * band) continue;
    sky.push(v.clone());
  }
  const n = MAX.stars + MAX.bright + MAX.starsMid + MAX.galaxy;
  const pos = new Float32Array(n * 3);
  const data = new Float32Array(n * 4);
  let o = 0;
  const push = (x, y, z, size, phase, temp, kind) => {
    pos.set([x, y, z], o * 3);
    data.set([size, phase, temp, kind], o * 4);
    o++;
  };
  // estrellas brillantes (con picos de difracción) primero: todas las densidades las tienen
  const order = { bright: [0, 0], sky: [0, 0], mid: [0, 0], gal: [0, 0] };
  order.bright[0] = o;
  for (let i = 0; i < MAX.bright; i++) {
    const d = sky[i];
    push(d.x * SPACE.STAR_R, d.y * SPACE.STAR_R, d.z * SPACE.STAR_R, 7 + rng() * 9, rng(), rng(), 0);
  }
  order.bright[1] = o;
  order.sky[0] = o;
  for (let i = MAX.bright; i < sky.length; i++) {
    const d = sky[i];
    const size = 0.9 + 2.3 * Math.pow(rng(), 5.5);
    push(d.x * SPACE.STAR_R, d.y * SPACE.STAR_R, d.z * SPACE.STAR_R, size, rng(), rng(), 0);
  }
  order.sky[1] = o;
  order.mid[0] = o;
  for (let i = 0; i < MAX.starsMid; i++) {
    v.set(gauss(), gauss() * 0.7, -Math.abs(gauss()) - 0.4).normalize();
    const r = 380 + rng() * 900;
    push(v.x * r, v.y * r, v.z * r, 1.0 + 1.4 * Math.pow(rng(), 3), rng(), rng(), 1);
  }
  order.mid[1] = o;
  order.gal[0] = o;
  for (let i = 0; i < MAX.galaxy; i++) {
    const kindR = rng();
    let x;
    let y;
    let temp;
    if (kindR < 0.18) {
      // bulbo
      const r = Math.abs(gauss()) * 0.07;
      const a = rng() * Math.PI * 2;
      x = Math.cos(a) * r; y = Math.sin(a) * r;
      temp = 0.75 + rng() * 0.25;
    } else {
      // brazos (espiral logarítmica, la misma fase que el shader del disco)
      const r = Math.min(1.05, 0.06 + -Math.log(1 - rng() * 0.96) * 0.28);
      const arm = rng() < 0.5 ? 0 : Math.PI;
      const a = arm + Math.log(r) * 2.4 + gauss() * (kindR < 0.75 ? 0.22 : 0.6);
      x = Math.cos(a) * r; y = Math.sin(a) * r;
      // 0..0.3 azul · rosa (regiones HII) codificado como 0.45
      temp = rng() < 0.12 ? 0.45 : rng() * 0.3;
    }
    push(x, y, gauss() * 0.012, 0.8 + 1.5 * Math.pow(rng(), 4), rng(), temp, 2);
  }
  order.gal[1] = o;
  return { pos, data, order };
}

// Para una densidad: índices [inicio, fin) por grupo → se compacta en arrays nuevos
export function buildFarPoints(density) {
  if (!FAR_FULL) FAR_FULL = genFar();
  const D = DENSITY[density] || DENSITY.medium;
  const F = FAR_FULL;
  const take = [
    [F.order.bright[0], D.bright],
    [F.order.sky[0], D.stars],
    [F.order.mid[0], D.starsMid],
    [F.order.gal[0], D.galaxy],
  ];
  const n = take.reduce((s, [, c]) => s + c, 0);
  const pos = new Float32Array(n * 3);
  const data = new Float32Array(n * 4);
  let o = 0;
  for (const [start, count] of take) {
    pos.set(F.pos.subarray(start * 3, (start + count) * 3), o * 3);
    data.set(F.data.subarray(start * 4, (start + count) * 4), o * 4);
    o += count;
  }
  return { count: n, pos, data };
}

// ---------------------------------------------------------------------------
// Puntos cercanos (una sola llamada). aB.x = tipo:
//   1 enjambre de Dyson (órbitas alrededor de la estrella)
//   2 polvo que fluye hacia la cámara (caja que envuelve a la cámara)
//   3 balizas de la ruta (dos filas, pulso que "corre" hacia la puerta)
//   4 luces del anillo de la puerta
//   5 luces de la estación (marco local; aB.y = 1 si giran con el anillo)
// position: datos del tipo · aA: rgb + tamaño (px o mundo según tipo) · aB: tipo + parámetros
// ---------------------------------------------------------------------------
let NEAR_FULL = null;
const NEON = [
  [0.66, 0.55, 0.98], [0.96, 0.45, 0.71], [0.13, 0.83, 0.93], [0.98, 0.75, 0.14], [0.51, 0.55, 0.97],
];
function genNear() {
  const rng = mulberry32(4242);
  const groups = {};
  const pos = [];
  const A = [];
  const B = [];
  const group = (name, fn, count) => {
    const start = pos.length / 3;
    for (let i = 0; i < count; i++) fn(i, count);
    groups[name] = start;
  };
  // estación y puerta primero (fijas en todas las densidades)
  group('station', (i) => {
    // puntas del eje, del anillo (giran) y paneles
    if (i < 2) { pos.push(0, i ? 14 : -14, 0); A.push(1.0, 0.35, 0.45, 0.9); B.push(5, 0, i, 1); return; }
    if (i < 4) { pos.push(i === 2 ? 9 : -9, 9.6, 0); A.push(0.4, 0.9, 1.0, 0.55); B.push(5, 0, i, 2); return; }
    const a = ((i - 4) / 12) * Math.PI * 2;
    pos.push(Math.cos(a) * 9.6, 0, Math.sin(a) * 9.6);
    const c = NEON[(i - 4) % 5];
    A.push(c[0], c[1], c[2], 0.55);
    B.push(5, 1, i, 2);
  }, 16);
  group('gate', (i) => {
    const a = (i / 16) * Math.PI * 2;
    pos.push(a, 0, 0);
    const c = i % 2 ? NEON[0] : NEON[2];
    A.push(c[0], c[1], c[2], 0.85);
    B.push(4, 0, i / 16, 0);
  }, 16);
  group('beacons', (i, n) => {
    const s = 0.06 + (Math.floor(i / 2) / Math.ceil(n / 2)) * 0.86;
    pos.push(s, i % 2 ? 1 : -1, 0);
    A.push(0.98, 0.75, 0.3, 0.8);
    B.push(3, 0, rng(), 0);
  }, MAX.beacons);
  group('swarm', () => {
    // anillos orbitales (estructura) + nube dispersa
    const ringed = rng() < 0.62;
    const ring = Math.floor(rng() * 6);
    const rr = ringed ? 1.7 + ring * 0.5 + (rng() - 0.5) * 0.22 : 1.6 + Math.pow(rng(), 0.7) * 3.4;
    const node = ringed ? ring * 1.07 + 0.3 : rng() * Math.PI * 2;
    const inc = ringed ? 0.35 + ((ring * 0.61) % 1.25) : rng() * Math.PI;
    const speed = (ringed ? 0.05 : 0.03) * Math.pow(2.0 / rr, 1.5) * (ring % 2 ? 1 : -1);
    pos.push(rr, rng() * Math.PI * 2, speed);
    const warm = rng() < 0.6;
    A.push(warm ? 1.0 : 0.45, warm ? 0.82 : 0.9, warm ? 0.55 : 1.0, 1.3 + rng() * 1.2);
    B.push(1, node, inc, rng());
  }, MAX.swarm);
  group('dust', () => {
    pos.push(rng(), rng(), rng());
    const c = NEON[Math.floor(rng() * 5)];
    A.push(0.75 + c[0] * 0.25, 0.75 + c[1] * 0.25, 0.75 + c[2] * 0.25, 0.9 + rng() * 1.1);
    B.push(2, rng(), 0, 0);
  }, MAX.dust);
  return { pos: new Float32Array(pos), A: new Float32Array(A), B: new Float32Array(B), groups };
}

export function buildNearPoints(density) {
  if (!NEAR_FULL) NEAR_FULL = genNear();
  const D = DENSITY[density] || DENSITY.medium;
  const F = NEAR_FULL;
  const g = F.groups;
  const take = [[g.station, 16], [g.gate, 16], [g.beacons, D.beacons], [g.swarm, D.swarm], [g.dust, D.dust]];
  const n = take.reduce((s, [, c]) => s + c, 0);
  const pos = new Float32Array(n * 3);
  const A = new Float32Array(n * 4);
  const B = new Float32Array(n * 4);
  let o = 0;
  for (const [start, count] of take) {
    pos.set(F.pos.subarray(start * 3, (start + count) * 3), o * 3);
    A.set(F.A.subarray(start * 4, (start + count) * 4), o * 4);
    B.set(F.B.subarray(start * 4, (start + count) * 4), o * 4);
    o += count;
  }
  return { count: n, pos, A, B };
}

// ---------------------------------------------------------------------------
// Asteroides: un "río" de rocas que fluye hacia la cámara a lo largo de una
// curva (rockP) por la esquina inferior derecha. aRock: fase, ángulo y radio en
// la sección, tamaño · aSpin: eje (xyz) + velocidad de giro.
// ---------------------------------------------------------------------------
let ROCK_FULL = null;
function genRocks() {
  const rng = mulberry32(9090);
  const n = MAX.rocks;
  const rock = new Float32Array(n * 4);
  const spin = new Float32Array(n * 4);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const big = rng() < 0.08;
    const size = big ? 1.6 + rng() * 1.6 : 0.25 + Math.pow(rng(), 2.2) * 1.2;
    rock.set([rng(), rng() * Math.PI * 2, Math.sqrt(rng()), size], i * 4);
    v.set(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
    spin.set([v.x, v.y, v.z, (0.05 + rng() * 0.25) * (rng() < 0.5 ? -1 : 1)], i * 4);
  }
  return { rock, spin };
}
export function buildRocks(density) {
  if (!ROCK_FULL) ROCK_FULL = genRocks();
  const D = DENSITY[density] || DENSITY.medium;
  return { count: D.rocks, rock: ROCK_FULL.rock.slice(0, D.rocks * 4), spin: ROCK_FULL.spin.slice(0, D.rocks * 4) };
}

// ---------------------------------------------------------------------------
// Convoy: naves-arca por la ruta estación → puerta. Todas a la misma velocidad
// (así la puerta sabe cuándo destella sin leer nada de la CPU).
// aRoute: fase, desvío lateral x/y, escala · aShip: tipo, semilla.
// ---------------------------------------------------------------------------
export const SHIP_SPEED = 1 / 62; // vueltas por segundo (≈62 s de la estación a la puerta)
export function buildShips(density) {
  const D = DENSITY[density] || DENSITY.medium;
  const rng = mulberry32(555);
  const n = D.ships;
  const route = new Float32Array(n * 4);
  const ship = new Float32Array(n * 4);
  const phases = [];
  for (let i = 0; i < n; i++) {
    // repartidas por la ruta con algo de holgura (no en fila perfecta)
    const p = (i + 0.15 + rng() * 0.3) / n;
    const big = i % 3 === 0;
    route.set([p, (rng() - 0.5) * 5.5, (rng() - 0.5) * 3.2, big ? 1.25 : 0.7 + rng() * 0.25], i * 4);
    ship.set([big ? 0 : 1, rng(), 0, 0], i * 4);
    phases.push(p);
  }
  return { count: n, route, ship, phases };
}

// ---------------------------------------------------------------------------
// Estelas (una sola llamada, quads orientados): aStr.x = tipo
//   0 motor de una nave (mismos datos que su nave) · 1 propulsor de la sonda-robot
//   2 cometa · 3 pulso del enlace de datos enjambre → puerta
// ---------------------------------------------------------------------------
export function buildStreaks(density, ships) {
  const D = DENSITY[density] || DENSITY.medium;
  const rng = mulberry32(777);
  const n = ships.count + 1 + 2 + D.pulses;
  const a = new Float32Array(n * 4);
  const b = new Float32Array(n * 4);
  let o = 0;
  for (let i = 0; i < ships.count; i++, o++) {
    a.set([0, ships.route[i * 4], ships.route[i * 4 + 1], ships.route[i * 4 + 2]], o * 4);
    b.set([ships.route[i * 4 + 3], ships.ship[i * 4], 0, 0], o * 4);
  }
  a.set([1, 0, 0, 0], o * 4); o++;
  // cometas: dirección de deriva (yaw/pitch relativos) y largo de la cola
  a.set([2, 0, 0, 0], o * 4); b.set([0, 1, 1, 0], o * 4); o++;
  a.set([2, 1, 0, 0], o * 4); b.set([1, 0.55, 1, 0], o * 4); o++;
  for (let i = 0; i < D.pulses; i++, o++) {
    a.set([3, i / D.pulses + rng() * 0.3 / D.pulses, rng(), rng()], o * 4);
    b.set([0.5 + rng() * 0.8, 0, 0, 0], o * 4);
  }
  return { count: n, a, b };
}

// ---------------------------------------------------------------------------
// Baldosa de ruido periódica (128², RGBA = 4 campos fbm independientes).
// Es la ÚNICA textura generada en CPU: turbulencia del disco de acreción,
// bandas de los planetas, continentes, nubes… (~5 ms una vez).
// ---------------------------------------------------------------------------
export function makeNoiseTile(N = SPACE.NOISE) {
  const out = new Uint8Array(N * N * 4);
  const hash = (x, y, c, o) => {
    let h = (x * 374761393 + y * 668265263 + c * 1442695041 + o * 2654435761) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const field = new Float32Array(N * N);
  for (let c = 0; c < 4; c++) {
    field.fill(0);
    let amp = 0.5;
    let norm = 0;
    for (let o = 0; o < 5; o++) {
      const P = 4 << o; // celdas por baldosa (periódico)
      const cell = N / P;
      for (let y = 0; y < N; y++) {
        const fy = y / cell;
        const iy = Math.floor(fy);
        let ty = fy - iy; ty = ty * ty * (3 - 2 * ty);
        const y0 = iy % P;
        const y1 = (iy + 1) % P;
        for (let x = 0; x < N; x++) {
          const fx = x / cell;
          const ix = Math.floor(fx);
          let tx = fx - ix; tx = tx * tx * (3 - 2 * tx);
          const x0 = ix % P;
          const x1 = (ix + 1) % P;
          const a = hash(x0, y0, c, o);
          const b = hash(x1, y0, c, o);
          const d = hash(x0, y1, c, o);
          const e = hash(x1, y1, c, o);
          field[y * N + x] += amp * (a + (b - a) * tx + (d - a) * ty + (a - b - d + e) * tx * ty);
        }
      }
      norm += amp;
      amp *= 0.55;
    }
    // estirar el contraste (el fbm se concentra en torno a 0,5)
    for (let i = 0; i < N * N; i++) {
      const v = (field[i] / norm - 0.5) * 2.1 + 0.5;
      out[i * 4 + c] = Math.max(0, Math.min(255, Math.round(v * 255)));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Geometrías (primitivas de three fusionadas; nada descargado)
// ---------------------------------------------------------------------------
function withPart(geo, part) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const n = g.getAttribute('position').count;
  g.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(n).fill(part), 1));
  if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
  if (geo !== g) geo.dispose();
  return g;
}

// Estación (marco local, eje Y) + puerta estelar (marco local, eje Z). aPart:
//   0 anillo habitado (gira) · 1 radios y buje (giran) · 2 eje y módulos ·
//   3 paneles solares · 4 anillo de la puerta · 5 nodos de la puerta · 6 portal
export function buildStructureGeometry() {
  const parts = [];
  const ring = new THREE.TorusGeometry(9.6, 1.05, 10, 80).rotateX(Math.PI / 2);
  parts.push(withPart(ring, 0));
  for (let i = 0; i < 4; i++) {
    const s = new THREE.CylinderGeometry(0.22, 0.22, 8.2, 6).rotateZ(Math.PI / 2).translate(4.9, 0, 0).rotateY((i / 4) * Math.PI * 2 + 0.4);
    parts.push(withPart(s, 1));
  }
  parts.push(withPart(new THREE.CylinderGeometry(1.7, 1.7, 3.2, 18), 1));
  parts.push(withPart(new THREE.CylinderGeometry(0.55, 0.55, 28, 10), 2));
  for (const y of [-11.5, -8.5, 6.5, 9.5]) parts.push(withPart(new THREE.BoxGeometry(1.8, 1.6, 1.8).translate(0, y, 0), 2));
  parts.push(withPart(new THREE.SphereGeometry(1.1, 12, 8).translate(0, 14, 0), 2));
  for (const sx of [-1, 1]) {
    parts.push(withPart(new THREE.BoxGeometry(6.5, 0.08, 2.4).translate(sx * 4.9, 10.2, 0), 3));
    parts.push(withPart(new THREE.BoxGeometry(6.5, 0.08, 2.4).translate(sx * 4.9, -10.2, 0), 3));
  }
  parts.push(withPart(new THREE.TorusGeometry(15, 0.85, 8, 72), 4));
  parts.push(withPart(new THREE.TorusGeometry(16.4, 0.3, 5, 72), 4));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const box = new THREE.BoxGeometry(2.2, 2.2, 3.2).rotateZ(a).translate(Math.cos(a) * 15.4, Math.sin(a) * 15.4, 0);
    parts.push(withPart(box, 5));
  }
  parts.push(withPart(new THREE.CircleGeometry(14.3, 64), 6));
  const geo = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return geo;
}

// Nave-arca (eje +Z hacia delante): casco, proa, anillo habitado, motores.
// aPart: 0 casco · 1 anillo con ventanas · 2 motores (emisivos) · 3 cabina
export function buildShipGeometry() {
  const parts = [];
  parts.push(withPart(new THREE.CylinderGeometry(0.42, 0.55, 4.6, 8).rotateX(Math.PI / 2), 0));
  parts.push(withPart(new THREE.ConeGeometry(0.42, 1.5, 8).rotateX(Math.PI / 2).translate(0, 0, 3.05), 3));
  parts.push(withPart(new THREE.TorusGeometry(1.25, 0.2, 6, 22).translate(0, 0, 0.5), 1));
  for (const a of [0.4, 0.4 + Math.PI / 2, 0.4 + Math.PI, 0.4 + Math.PI * 1.5]) {
    parts.push(withPart(new THREE.BoxGeometry(0.1, 1.1, 0.25).translate(0, 0.75, 0.5).rotateZ(a), 0));
  }
  for (const sx of [-1, 1]) parts.push(withPart(new THREE.BoxGeometry(0.5, 0.5, 2.0).translate(sx * 0.85, 0, -1.2), 0));
  parts.push(withPart(new THREE.CylinderGeometry(0.75, 0.62, 0.7, 10).rotateX(Math.PI / 2).translate(0, 0, -2.6), 2));
  const geo = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  return geo;
}

export function buildRockGeometry(detail) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const ng = g.index ? g.toNonIndexed() : g;
  if (ng !== g) g.dispose();
  // deformación por vértice (misma posición → mismo desplazamiento: sin grietas)
  const p = ng.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i); const y = p.getY(i); const z = p.getZ(i);
    const h = Math.sin(x * 4.1 + y * 1.7) * 0.5 + Math.sin(y * 3.3 - z * 2.9) * 0.35 + Math.sin(z * 5.2 + x * 2.2) * 0.25;
    const k = 1 + h * 0.16;
    p.setXYZ(i, x * k * 1.18, y * k * 0.86, z * k);
  }
  ng.deleteAttribute('normal');
  ng.deleteAttribute('uv');
  return ng;
}
