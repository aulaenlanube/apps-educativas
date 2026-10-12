// Generación PROCEDURAL y determinista de la metrópolis del fondo 3D.
//
// La ciudad es una cuadrícula de manzanas (BLOCK). El distrito central es una
// ISLA (megatorre en el origen) rodeada por una bahía anular (BAY_IN..BAY_OUT)
// con una autopista elevada en anillo y cuatro puentes; la cámara vuela por la
// orilla exterior (CAM_R) mirando el skyline al otro lado del agua. Fuera
// quedan los barrios con sus propios picos, hasta el horizonte (una silueta
// lejana en shader cierra el anillo). Todo sale de una
// semilla fija: se genera UNA vez a la máxima densidad y cada nivel se queda con
// un SUBCONJUNTO estable (mismos edificios en el mismo sitio), así que cambiar
// de nivel de calidad en caliente no hace "saltar" la ciudad.
//
// Salida por densidad: arrays tipados listos para InstancedMesh / atributos
// instanciados (ver CityScene.jsx). Nada de texturas ni modelos descargados.
import * as THREE from 'three';

export const CITY = {
  BLOCK: 26,        // distancia entre ejes de calle
  STREET_HALF: 3,   // media anchura de calle (m)
  BAY_IN: 70,       // orilla de la isla central
  BAY_OUT: 140,     // orilla exterior de la bahía
  HWY_R: 116,       // autopista elevada en anillo sobre el agua
  HWY_H: 10,        // altura del tablero de la autopista
  CAM_R: 168,       // radio de la trayectoria de la cámara (paseo de la orilla exterior)
  OUTER_FROM: 190,  // primeros edificios de los barrios exteriores
  LINE_L: 360,      // media longitud de las rutas aéreas rectas
  FAR_R: 760,       // radio de la silueta lejana
};

// Presupuesto de contenido por densidad. 'low' en móvil/equipos modestos (y
// fotograma estático); 'high' en escritorio con GPU. Ver CityBackground.jsx.
export const DENSITY = {
  high: { rMax: 340, farFrom: 210, farKeep: 1, holos: 30, vehicles: 1100, glow: 3200, stars: 1400, beams: 6, segs: 14 },
  medium: { rMax: 295, farFrom: 225, farKeep: 0.7, holos: 18, vehicles: 560, glow: 1700, stars: 900, beams: 4, segs: 10 },
  low: { rMax: 245, farFrom: 205, farKeep: 0.45, holos: 9, vehicles: 260, glow: 850, stars: 500, beams: 0, segs: 8 },
};

function mulberry32(a) {
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Picos de rascacielos: distrito central + barrios (ángulo, radio, altura, extensión)
const CLUSTERS = [
  { x: 0, z: 0, peak: 118, s: 42 },
  ...[
    { a: 2.25, r: 262, peak: 92, s: 40 },
    { a: 4.05, r: 250, peak: 84, s: 38 },
    { a: 5.45, r: 285, peak: 76, s: 44 },
    { a: 0.85, r: 270, peak: 66, s: 42 },
    { a: 3.15, r: 310, peak: 58, s: 44 },
  ].map((c) => ({ x: Math.cos(c.a) * c.r, z: Math.sin(c.a) * c.r, peak: c.peak, s: c.s })),
];

function peakAt(x, z) {
  let p = 0;
  for (const c of CLUSTERS) {
    const d2 = (x - c.x) ** 2 + (z - c.z) ** 2;
    p = Math.max(p, c.peak * Math.exp(-d2 / (2 * c.s * c.s)));
  }
  return p;
}

// Colores de neón (índices que entiende el shader: violeta, rosa, cian, ámbar, índigo)
const NEON_RGB = [
  [0.66, 0.55, 0.98], [0.96, 0.45, 0.71], [0.13, 0.83, 0.93], [0.98, 0.75, 0.14], [0.51, 0.55, 0.97],
];

let FULL = null;

// ---------------------------------------------------------------------------
// Generación completa (máxima densidad). Cada pieza lleva r (distancia al
// centro), prio (aleatorio estable) y tall para poder filtrar por densidad.
// ---------------------------------------------------------------------------
function generateFull() {
  const rng = mulberry32(20261012);
  const { BLOCK, BAY_IN, OUTER_FROM } = CITY;
  const R_MAX = DENSITY.high.rMax;
  const parts = [];   // tramos de torre (caja o cilindro) + pasarelas
  const spires = [];
  const rings = [];
  const holoSpots = [];
  const beacons = [];
  const towers = [];

  const N = Math.ceil(R_MAX / BLOCK) + 1;

  const addTower = (t) => {
    towers.push(t);
    const { x, z, w, d, h, cyl, seed, style, neon, trim, lit, r, prio } = t;
    const tall = h > 70;
    let tiers = 1;
    if (h > 36 && rng() < 0.62) tiers = h > 82 ? 3 : 2;
    let y = 0;
    let cw = w;
    let cd = d;
    let rot = t.rot;
    let topW = w;
    let topD = d;
    const tierTops = [];
    for (let k = 0; k < tiers; k++) {
      const last = k === tiers - 1;
      const th = last ? h - y : (h - y) * (k === 0 ? 0.48 + rng() * 0.14 : 0.6 + rng() * 0.12);
      parts.push({
        kind: cyl ? 'cyl' : 'box', x, z, y0: y, w: cw, d: cyl ? cw : cd, h: th, rot,
        seed: seed + k * 0.37, style, neon, trim: trim && (k === tiers - 1 || rng() < 0.5), lit, towerH: h, r, prio, tall,
      });
      tierTops.push(y + th);
      topW = cw; topD = cyl ? cw : cd;
      y += th;
      if (!last) {
        const f = 0.66 + rng() * 0.18;
        // tramo superior girado 45° (corona en diamante) solo si cabe
        if (!cyl && Math.abs(cw - cd) < 2 && rng() < 0.28) {
          rot = t.rot + Math.PI / 4;
          cw = Math.min(cw, cd) * 0.68; cd = cw;
        } else {
          cw *= f; cd *= f;
        }
      }
    }
    // aguja + baliza
    if (h > 62 && rng() < 0.5) {
      const sh = h * (0.16 + rng() * 0.2);
      const sr = Math.max(0.6, Math.min(topW, topD) * 0.16);
      spires.push({ x, z, y0: h, h: sh, rad: sr, seed, r, prio, tall });
      beacons.push({ x, y: h + sh + 0.4, z, c: rng() < 0.6 ? [1, 0.25, 0.32] : NEON_RGB[neon], size: 2.4, mode: 1, ph: rng(), r, prio, tall });
    } else if (h > 45) {
      beacons.push({ x, y: h + 0.8, z, c: rng() < 0.5 ? [1, 0.3, 0.35] : NEON_RGB[neon], size: 1.6, mode: rng() < 0.5 ? 1 : 2, ph: rng(), r, prio, tall });
    }
    // anillos orbitales en torres altas
    if (h > 92 && rng() < 0.55) {
      const n = rng() < 0.4 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        rings.push({
          x, z, y: tierTops[0] * (0.62 + i * 0.3), rad: Math.max(w, d) * (0.8 + i * 0.1),
          tilt: (rng() - 0.5) * 0.25, neon: (neon + i) % 5, seed: rng(), r, prio, tall: true,
        });
      }
    }
    // hueco para holograma: en el primer tramo, cara que mira hacia la bahía
    if (h > 26 && ((r > 24 && r < CITY.BAY_IN) || (r > CITY.OUTER_FROM && r < 280))) {
      holoSpots.push({ x, z, w, d, cyl, tierTop: tierTops[0], h, r, prio: rng(), seed: rng(), rot: t.rot });
    }
  };

  for (let i = -N; i < N; i++) {
    for (let j = -N; j < N; j++) {
      const bx = (i + 0.5) * BLOCK;
      const bz = (j + 0.5) * BLOCK;
      const br = Math.hypot(bx, bz);
      if (br > R_MAX + BLOCK * 0.7) continue;
      const pk = peakAt(bx, bz);
      const island = br < CITY.BAY_IN;
      const downtown = pk > 58 && !island;
      // reparto de la manzana en solares
      let lots;
      if (downtown) {
        const u = rng();
        if (u < 0.6) lots = [[0, 0, 19, 19]];
        else if (u < 0.8) lots = [[0, -5, 19, 9], [0, 5, 19, 9]];
        else lots = [[-5, 0, 9, 19], [5, 0, 9, 19]];
      } else {
        lots = [[-5, -5, 9, 9], [5, -5, 9, 9], [-5, 5, 9, 9], [5, 5, 9, 9]];
        if (rng() < (island ? 0.45 : 0.22)) lots = [[0, -5, 19, 9], [-5, 5, 9, 9], [5, 5, 9, 9]];
      }
      const blockTowers = [];
      for (const [ox, oz, lw, ld] of lots) {
        const x = bx + ox;
        const z = bz + oz;
        const r = Math.hypot(x, z);
        if (r > R_MAX) continue;
        if (r < 26) continue; // plaza de la megatorre
        const halfDiag = Math.hypot(lw, ld) * 0.5;
        // bahía + paseo de la orilla exterior (por donde vuela la cámara)
        if (r + halfDiag > BAY_IN - 3 && r - halfDiag < OUTER_FROM) continue;
        if (!downtown && r > 230 && rng() < 0.12) continue; // plazas sueltas
        const p = peakAt(x, z);
        let h = 6 + rng() * 11 + p * (0.32 + Math.pow(rng(), 1.25) * 0.85);
        if (r < BAY_IN) h = Math.max(h, 30 + rng() * 26); // la isla: todo rascacielos
        if (rng() < 0.05) h *= 1.55;
        h = Math.max(6, h);
        const w = lw * (0.68 + rng() * 0.26);
        const d = ld * (0.68 + rng() * 0.26);
        const square = Math.abs(lw - ld) < 1;
        const cyl = square && rng() < (r < BAY_IN ? 0.22 : 0.12);
        const dt = r < BAY_IN ? 1 : Math.min(1, p / 90);
        const u = rng();
        const t = {
          x, z, w, d, h, cyl, r,
          rot: 0,
          seed: rng() * 97 + 1,
          style: u < 0.42 ? 0 : u < 0.66 ? 1 : u < 0.82 ? 2 : 3,
          neon: Math.floor(rng() * 5),
          trim: rng() < 0.22 + dt * 0.38,
          lit: (r < BAY_IN ? 0.36 : 0.22) + rng() * 0.44,
          prio: rng(),
        };
        addTower(t);
        blockTowers.push({ x, z, w, d, h, r, neon: t.neon, cyl, prio: t.prio });
      }
      // pasarelas aéreas entre torres vecinas de la misma manzana
      for (let a = 0; a < blockTowers.length; a++) {
        for (let b = a + 1; b < blockTowers.length; b++) {
          const A = blockTowers[a]; const B = blockTowers[b];
          if (A.h < 30 || B.h < 30 || rng() > 0.45) continue;
          const alongX = Math.abs(A.z - B.z) < 0.5;
          const alongZ = Math.abs(A.x - B.x) < 0.5;
          if (!alongX && !alongZ) continue;
          // por debajo del primer retranqueo de ambas torres (≥ 48 % de su altura)
          const y = Math.min(A.h, B.h) * (0.3 + rng() * 0.16);
          const gapStart = alongX ? Math.min(A.x, B.x) + (A.x < B.x ? A.w : B.w) * 0.5 : Math.min(A.z, B.z) + (A.z < B.z ? A.d : B.d) * 0.5;
          const gapEnd = alongX ? Math.max(A.x, B.x) - (A.x > B.x ? A.w : B.w) * 0.5 : Math.max(A.z, B.z) - (A.z > B.z ? A.d : B.d) * 0.5;
          const len = gapEnd - gapStart + 1.2;
          if (len < 1.5) continue;
          const mid = (gapStart + gapEnd) / 2;
          parts.push({
            kind: 'box', bridge: true,
            x: alongX ? mid : A.x, z: alongX ? A.z : mid, y0: y, w: alongX ? len : 2.6, d: alongX ? 2.6 : len, h: 1.7, rot: 0,
            seed: rng() * 50, style: 4, neon: A.neon, trim: true, lit: 0, towerH: y + 1.7, r: Math.max(A.r, B.r), prio: Math.max(A.prio, B.prio), tall: false,
          });
        }
      }
    }
  }

  // ---------------- autopista elevada en anillo + puentes ----------------
  // Tableros como cajas finas (estilo 4: cristal oscuro con franja de neón) y
  // pilas cada pocos tramos. Van en la misma malla instanciada que las torres.
  const { HWY_R, HWY_H } = CITY;
  const SEG = 72;
  for (let k = 0; k < SEG; k++) {
    const a = (k / SEG) * Math.PI * 2;
    const x = Math.cos(a) * HWY_R;
    const z = Math.sin(a) * HWY_R;
    const common = { kind: 'box', bridge: true, seed: 7, style: 4, neon: 2, trim: true, lit: 0, r: HWY_R, prio: 0, tall: true };
    parts.push({ ...common, x, z, y0: HWY_H - 1.1, w: (2 * Math.PI * HWY_R) / SEG + 0.5, d: 9, h: 1.1, rot: -(a + Math.PI / 2), towerH: HWY_H });
    if (k % 3 === 0) parts.push({ ...common, x, z, y0: -1, w: 1.8, d: 1.8, h: HWY_H - 1.1, rot: -(a + Math.PI / 2), towerH: HWY_H - 1.1, neon: 0 });
  }
  const BR_H = 5;
  for (let q = 0; q < 4; q++) {
    const a = (q * Math.PI) / 2;
    const ux = Math.round(Math.cos(a));
    const uz = Math.round(Math.sin(a));
    const mid = (CITY.BAY_IN - 4 + CITY.BAY_OUT + 4) / 2;
    const len = CITY.BAY_OUT - CITY.BAY_IN + 8;
    const common = { kind: 'box', bridge: true, seed: 40 + q, style: 4, neon: 1, trim: true, lit: 0, r: mid, prio: 0, tall: true, rot: 0 };
    parts.push({ ...common, x: ux * mid, z: uz * mid, y0: BR_H - 1, w: ux ? len : 9, d: ux ? 9 : len, h: 1, towerH: BR_H });
    for (const pr of [86, 104, 126]) {
      parts.push({ ...common, x: ux * pr, z: uz * pr, y0: -1, w: 1.6, d: 1.6, h: BR_H - 1, towerH: BR_H - 1, neon: 0 });
    }
  }

  // ---------------- megatorre central ----------------
  const megaNeon = 0;
  const mega = [
    { kind: 'cyl', w: 22, y0: 0, h: 52, style: 1 },
    { kind: 'cyl', w: 17, y0: 52, h: 38, style: 1 },
    { kind: 'box', w: 12, y0: 90, h: 22, style: 3, rot: Math.PI / 4 },
    { kind: 'cyl', w: 8, y0: 112, h: 14, style: 1 },
  ];
  for (const m of mega) {
    parts.push({
      kind: m.kind, x: 0, z: 0, y0: m.y0, w: m.w, d: m.w, h: m.h, rot: m.rot || 0,
      seed: 3.3 + m.y0 * 0.01, style: m.style, neon: megaNeon, trim: true, lit: 0.62, towerH: 126, r: 0, prio: 0, tall: true,
    });
  }
  spires.push({ x: 0, z: 0, y0: 126, h: 38, rad: 2.2, seed: 1, r: 0, prio: 0, tall: true });
  beacons.push({ x: 0, y: 165, z: 0, c: [1, 0.45, 0.85], size: 6, mode: 2, ph: 0.1, r: 0, prio: 0, tall: true });
  beacons.push({ x: 0, y: 127, z: 0, c: [0.4, 0.9, 1], size: 3.6, mode: 2, ph: 0.6, r: 0, prio: 0, tall: true });
  rings.push({ x: 0, z: 0, y: 44, rad: 17.5, tilt: 0, neon: 2, seed: 0.2, r: 0, prio: 0, tall: true });
  rings.push({ x: 0, z: 0, y: 74, rad: 23, tilt: 0.16, neon: 1, seed: 0.5, r: 0, prio: 0, tall: true });
  rings.push({ x: 0, z: 0, y: 86, rad: 13, tilt: 0, neon: 0, seed: 0.8, r: 0, prio: 0, tall: true });
  rings.push({ x: 0, z: 0, y: 108, rad: 11, tilt: -0.1, neon: 3, seed: 0.3, r: 0, prio: 0, tall: true });

  // hologramas de la megatorre: el robot de la mascota en las cuatro caras del
  // tramo en diamante (por encima del resto de torres, se ve desde toda la bahía)
  const megaHolos = [0, 1, 2, 3].map((k) => ({
    mega: true, ang: k * Math.PI / 2 + Math.PI / 4, y: 101, size: 10.5, type: 0, prio: 0,
  }));

  FULL = { parts, spires, rings, holoSpots, megaHolos, beacons, towers };
  return FULL;
}

// ---------------------------------------------------------------------------
// Filtro por densidad + empaquetado en arrays tipados
// ---------------------------------------------------------------------------
const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const UP = new THREE.Vector3(0, 1, 0);

function keepFor(D) {
  return (it) => {
    if (it.r > D.rMax) return false;
    if (it.r > D.farFrom && !it.tall && it.prio > D.farKeep) return false;
    return true;
  };
}

function packParts(list) {
  const n = list.length;
  const mat = new Float32Array(n * 16);
  const data = new Float32Array(n * 4);
  const tier = new Float32Array(n * 2);
  list.forEach((b, i) => {
    _p.set(b.x, b.y0, b.z);
    _q.setFromAxisAngle(UP, b.rot || 0);
    _s.set(b.w, b.h, b.d);
    _m.compose(_p, _q, _s).toArray(mat, i * 16);
    data[i * 4] = b.seed;
    data[i * 4 + 1] = b.style;
    data[i * 4 + 2] = b.neon + (b.trim ? 10 : 0);
    data[i * 4 + 3] = b.lit;
    tier[i * 2] = b.towerH;
    tier[i * 2 + 1] = b.y0 + b.h;
  });
  return { count: n, matrices: mat, data, tier };
}

function packSpires(list) {
  const n = list.length;
  const mat = new Float32Array(n * 16);
  const data = new Float32Array(n * 2);
  list.forEach((s, i) => {
    _p.set(s.x, s.y0, s.z);
    _q.identity();
    _s.set(s.rad * 2, s.h, s.rad * 2);
    _m.compose(_p, _q, _s).toArray(mat, i * 16);
    data[i * 2] = s.seed;
    data[i * 2 + 1] = s.y0;
  });
  return { count: n, matrices: mat, data };
}

function packRings(list) {
  const n = list.length;
  const mat = new Float32Array(n * 16);
  const data = new Float32Array(n * 2);
  list.forEach((g, i) => {
    _p.set(g.x, g.y, g.z);
    _e.set(g.tilt, g.seed * 6.28, g.tilt * 0.5);
    _q.setFromEuler(_e);
    _s.setScalar(g.rad);
    _m.compose(_p, _q, _s).toArray(mat, i * 16);
    data[i * 2] = g.neon;
    data[i * 2 + 1] = g.seed;
  });
  return { count: n, matrices: mat, data };
}

// Hologramas: plano pegado a la fachada que mira hacia el canal (donde vuela la
// cámara). Tipos: 0 robot (mascota), 1 rótulo vertical, 2 radar, 3 ecualizador, 4 insignia.
function packHolos(full, D) {
  const rng = mulberry32(777);
  // primero las de la isla (las que más se ven desde la orilla)
  const rank = (s) => s.prio + (s.r < CITY.BAY_IN ? 0 : 0.6);
  const spots = full.holoSpots
    .filter((s) => s.r <= D.rMax)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, Math.max(0, D.holos - full.megaHolos.length));
  const items = [];
  for (const m of full.megaHolos) {
    const nx = Math.cos(m.ang); const nz = Math.sin(m.ang);
    items.push({ x: nx * 6.5, y: m.y, z: nz * 6.5, ry: Math.atan2(nx, nz), w: m.size, h: m.size, type: 0, col: 2, seed: rng() });
  }
  for (const s of spots) {
    // dirección hacia el canal: hacia fuera si la torre está dentro, hacia el centro si está fuera
    const len = Math.hypot(s.x, s.z) || 1;
    const sign = s.r < CITY.CAM_R ? 1 : -1;
    const tx = (s.x / len) * sign; const tz = (s.z / len) * sign;
    // cara del bloque más alineada con esa dirección
    let nx; let nz; let faceW;
    if (Math.abs(tx) > Math.abs(tz)) { nx = Math.sign(tx); nz = 0; faceW = s.d; } else { nx = 0; nz = Math.sign(tz); faceW = s.w; }
    const off = s.cyl ? s.w * 0.5 + 0.6 : (nx !== 0 ? s.w : s.d) * 0.5 + 0.45;
    const u = rng();
    const type = u < 0.24 ? 0 : u < 0.5 ? 1 : u < 0.66 ? 2 : u < 0.84 ? 3 : 4;
    const baseW = Math.min(16, faceW * (s.cyl ? 0.62 : 0.8));
    const w = type === 1 ? baseW * 0.38 : type === 3 ? baseW : baseW * 0.82;
    const h = type === 1 ? Math.min(s.tierTop * 0.6, w * 3.4) : type === 3 ? w * 0.6 : w;
    const y = Math.min(s.tierTop - h * 0.5 - 2, s.tierTop * (0.45 + rng() * 0.3));
    if (y - h * 0.5 < 5) continue;
    items.push({ x: s.x + nx * off, y, z: s.z + nz * off, ry: Math.atan2(nx, nz), w, h, type, col: Math.floor(rng() * 5), seed: rng() });
  }
  const n = items.length;
  const mat = new Float32Array(n * 16);
  const data = new Float32Array(n * 4);
  items.forEach((it, i) => {
    _p.set(it.x, it.y, it.z);
    _q.setFromAxisAngle(UP, it.ry);
    _s.set(it.w, it.h, 1);
    _m.compose(_p, _q, _s).toArray(mat, i * 16);
    data[i * 4] = it.type;
    data[i * 4 + 1] = it.col;
    data[i * 4 + 2] = it.seed;
    data[i * 4 + 3] = it.w / it.h;
  });
  return { count: n, matrices: mat, data };
}

// Tráfico aéreo: carriles circulares (incluida la "autopista" sobre el canal) y
// rectos por encima de las calles. El movimiento lo calcula el vertex shader
// con uTime: la CPU no toca ningún vehículo después de crearlos.
function packVehicles(D) {
  const rng = mulberry32(4242);
  const { HWY_R, HWY_H, BLOCK } = CITY;
  const lanes = [];
  // autopista luminosa sobre la bahía: 4 carriles, 2 por sentido
  lanes.push({ t: 0, a: HWY_R - 3.0, h: HWY_H + 0.55, v: 12, w: 0.2 });
  lanes.push({ t: 0, a: HWY_R - 1.1, h: HWY_H + 0.55, v: 14, w: 0.2 });
  lanes.push({ t: 0, a: HWY_R + 1.1, h: HWY_H + 0.55, v: -13, w: 0.2 });
  lanes.push({ t: 0, a: HWY_R + 3.0, h: HWY_H + 0.55, v: -11, w: 0.2 });
  // puentes (tipos 3/4: rectas que se ocultan al cruzar la isla, "túnel")
  lanes.push({ t: 3, a: -2.2, h: 5.6, v: 14, w: 0.045 });
  lanes.push({ t: 3, a: 2.2, h: 5.6, v: -14, w: 0.045 });
  lanes.push({ t: 4, a: -2.2, h: 5.6, v: -14, w: 0.045 });
  lanes.push({ t: 4, a: 2.2, h: 5.6, v: 14, w: 0.045 });
  // aerodeslizadores rasantes sobre el agua (reflejos)
  lanes.push({ t: 0, a: 92, h: 2.2, v: 7, w: 0.04 });
  lanes.push({ t: 0, a: 128, h: 2.4, v: -6, w: 0.03 });
  // anillos altos: sobre la isla y por encima de los tejados de los barrios
  for (const [a, h, v] of [[52, 132, 7], [44, 112, -8], [226, 66, 11], [252, 92, -12], [290, 74, 12], [324, 100, -10]]) {
    lanes.push({ t: 0, a, h, v, w: 0.05 });
  }
  // rectas sobre calles (eje x y eje z), evitando la franja de altura de la cámara
  const hs = [13, 16, 44, 52, 60, 72, 84];
  for (let k = 0; k < 12; k++) {
    const axis = k % 2 === 0 ? 1 : 2;
    // nunca por el eje 0 (atravesaría la megatorre)
    let si = Math.round((rng() - 0.5) * 22);
    if (si === 0) si = rng() < 0.5 ? -2 : 2;
    const street = si * BLOCK;
    const h = hs[Math.floor(rng() * hs.length)] + rng() * 4;
    lanes.push({ t: axis, a: street, h, v: (rng() < 0.5 ? -1 : 1) * (12 + rng() * 10), w: 0.03 });
  }
  const totalW = lanes.reduce((s, l) => s + l.w, 0);
  const n = D.vehicles;
  const lane = new Float32Array(n * 4);
  const look = new Float32Array(n * 4);
  const phase = new Float32Array(n);
  const PAL = [
    [1.0, 0.32, 0.42], [1.0, 0.36, 0.78], [0.35, 0.86, 1.0], [0.62, 0.52, 1.0], [1.0, 0.72, 0.3], [0.9, 0.94, 1.0],
  ];
  let i = 0;
  lanes.forEach((L, li) => {
    const share = li === lanes.length - 1 ? n - i : Math.round((L.w / totalW) * n);
    for (let k = 0; k < share && i < n; k++, i++) {
      const sp = L.v * (0.85 + rng() * 0.3);
      lane[i * 4] = L.t;
      const tight = L.t >= 3 || (L.t === 0 && (L.w > 0.1 || L.h < 3));
      lane[i * 4 + 1] = L.a + (L.t === 0 || tight ? 0 : (rng() - 0.5) * 2.5);
      lane[i * 4 + 2] = L.h + (rng() - 0.5) * (tight ? 0.25 : 3);
      // circulares: velocidad angular (rad/s); rectas: m/s
      lane[i * 4 + 3] = L.t === 0 ? sp / L.a : sp;
      const c = PAL[(li * 3 + Math.floor(rng() * 3)) % PAL.length];
      look[i * 4] = c[0]; look[i * 4 + 1] = c[1]; look[i * 4 + 2] = c[2];
      look[i * 4 + 3] = 3 + Math.abs(sp) * (0.35 + rng() * 0.35); // largo de la estela
      phase[i] = rng();
    }
  });
  return { count: i, lane, look, phase };
}

// Puntos de luz: balizas de agujas/azoteas + luces del extrarradio (la ciudad
// "sigue" hasta el horizonte sin gastar geometría).
function packGlow(full, D) {
  const rng = mulberry32(99);
  const keep = keepFor(D);
  const pts = full.beacons.filter(keep);
  const n = pts.length + D.glow;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 4);
  const blink = new Float32Array(n * 2);
  let i = 0;
  for (const b of pts) {
    pos.set([b.x, b.y, b.z], i * 3);
    col.set([b.c[0], b.c[1], b.c[2], b.size], i * 4);
    blink.set([b.mode, b.ph], i * 2);
    i++;
  }
  const PAL = [[1, 0.78, 0.5], [1, 0.78, 0.5], [0.92, 0.94, 1], [0.45, 0.88, 1], [1, 0.5, 0.82], [0.7, 0.6, 1]];
  const { BLOCK } = CITY;
  let guard = 0;
  while (i < n && guard++ < n * 20) {
    const k = Math.round((rng() - 0.5) * 2 * (CITY.FAR_R / BLOCK)) * BLOCK;
    const s = (rng() - 0.5) * 2 * CITY.FAR_R;
    const alongX = rng() < 0.5;
    const x = alongX ? s : k + (rng() < 0.5 ? -1.5 : 1.5);
    const z = alongX ? k + (rng() < 0.5 ? -1.5 : 1.5) : s;
    const r = Math.hypot(x, z);
    if (r < D.rMax - 30 || r > CITY.FAR_R - 20) continue;
    const c = PAL[Math.floor(rng() * PAL.length)];
    pos.set([x, 0.8 + rng() * 2.5, z], i * 3);
    col.set([c[0], c[1], c[2], 1.1 + rng() * 1.6], i * 4);
    blink.set([0, rng()], i * 2);
    i++;
  }
  return { count: i, pos, col, blink };
}

function packStars(D) {
  const rng = mulberry32(31337);
  const n = D.stars;
  const pos = new Float32Array(n * 3);
  const data = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const az = rng() * Math.PI * 2;
    const el = Math.asin(0.05 + Math.pow(rng(), 0.8) * 0.95);
    const R = 880;
    pos[i * 3] = Math.cos(az) * Math.cos(el) * R;
    pos[i * 3 + 1] = Math.sin(el) * R;
    pos[i * 3 + 2] = Math.sin(az) * Math.cos(el) * R;
    data[i * 2] = 0.8 + Math.pow(rng(), 3) * 2.2; // tamaño px
    data[i * 2 + 1] = rng();
  }
  return { count: n, pos, data };
}

// Focos que barren el cielo desde azoteas del centro (solo de noche se notan)
function packBeams(full, D) {
  const rng = mulberry32(555);
  const cands = full.towers.filter((t) => t.h > 70 && t.r < 120).sort((a, b) => a.prio - b.prio).slice(0, D.beams);
  const n = cands.length;
  const base = new Float32Array(n * 4);
  const data = new Float32Array(n * 4);
  cands.forEach((t, i) => {
    base.set([t.x, t.h + 0.5, t.z, 240 + rng() * 80], i * 4);
    data.set([0.28 + rng() * 0.22, rng() * 6.28, (rng() < 0.5 ? -1 : 1) * (0.12 + rng() * 0.1), Math.floor(rng() * 5)], i * 4);
  });
  return { count: n, base, data };
}

export function buildCityLayout(densityName = 'medium') {
  const D = DENSITY[densityName] || DENSITY.medium;
  const full = FULL || generateFull();
  const keep = keepFor(D);
  const parts = full.parts.filter(keep);
  return {
    density: densityName,
    D,
    boxes: packParts(parts.filter((p) => p.kind === 'box')),
    cyls: packParts(parts.filter((p) => p.kind === 'cyl')),
    spires: packSpires(full.spires.filter(keep)),
    rings: packRings(full.rings.filter(keep)),
    holos: packHolos(full, D),
    vehicles: packVehicles(D),
    glow: packGlow(full, D),
    stars: packStars(D),
    beams: packBeams(full, D),
  };
}
