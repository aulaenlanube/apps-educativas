// Sombreado de las láminas del cuerpo humano: acabado de ilustración médica
// (luz principal arriba-izquierda, relleno frío, brillo especular, borde de luz,
// oclusión ambiental, trazo de contorno) con texturas sugeridas: fibras en los
// músculos y poro en el hueso. La piel puede ir como holograma translúcido.
import { VIEWS, ambientOcclusion } from './raster.mjs';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a, b, t) => a + (b - a) * t;

// Ruido de valor 3D (determinista).
function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise3(x, y, z) {
  const xi = Math.floor(x); const yi = Math.floor(y); const zi = Math.floor(z);
  const xf = x - xi; const yf = y - yi; const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf); const v = yf * yf * (3 - 2 * yf); const w = zf * zf * (3 - 2 * zf);
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return mix(
    mix(mix(c(0, 0, 0), c(1, 0, 0), u), mix(c(0, 1, 0), c(1, 1, 0), u), v),
    mix(mix(c(0, 0, 1), c(1, 0, 1), u), mix(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

// Eje principal de una malla (análisis de componentes, iteración de potencia).
export function principalAxis(m) {
  const n = m.pos.length / 3;
  const c = [0, 0, 0];
  for (let i = 0; i < m.pos.length; i += 3) { c[0] += m.pos[i]; c[1] += m.pos[i + 1]; c[2] += m.pos[i + 2]; }
  c[0] /= n; c[1] /= n; c[2] /= n;
  const C = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < m.pos.length; i += 3) {
    const d = [m.pos[i] - c[0], m.pos[i + 1] - c[1], m.pos[i + 2] - c[2]];
    for (let a = 0; a < 3; a += 1) for (let b = 0; b < 3; b += 1) C[a * 3 + b] += d[a] * d[b];
  }
  let v = [0.3, 0.4, 0.86];
  for (let it = 0; it < 30; it += 1) {
    const w = [0, 1, 2].map((a) => C[a * 3] * v[0] + C[a * 3 + 1] * v[1] + C[a * 3 + 2] * v[2]);
    const l = Math.hypot(...w) || 1;
    v = w.map((x) => x / l);
  }
  return v;
}

export const MATERIALS = {
  bone: { base: '#e9dcc0', dark: '#8a6f4e', spec: 0.12, shin: 18, rim: '#fff4dc', rimK: 0.25, porous: 0.07 },
  cartilage: { base: '#cfe2e6', dark: '#6f8f99', spec: 0.35, shin: 30, rim: '#ffffff', rimK: 0.3 },
  tooth: { base: '#f3efe2', dark: '#9b8f72', spec: 0.4, shin: 40, rim: '#ffffff', rimK: 0.3 },
  muscle: { base: '#b9352f', dark: '#5c1214', spec: 0.22, shin: 24, rim: '#ff9a8a', rimK: 0.28, fiber: 0.2 },
  tendon: { base: '#e9e1d2', dark: '#94876f', spec: 0.35, shin: 30, rim: '#ffffff', rimK: 0.3, fiber: 0.1 },
  artery: { base: '#d42a2a', dark: '#6b0d12', spec: 0.45, shin: 40, rim: '#ffb0a8', rimK: 0.3 },
  vein: { base: '#2f5fc4', dark: '#0f2253', spec: 0.45, shin: 40, rim: '#a8c4ff', rimK: 0.3 },
  nerve: { base: '#f2cf3b', dark: '#8a6a06', spec: 0.4, shin: 30, rim: '#fff3b0', rimK: 0.3, fiber: 0.08 },
  brain: { base: '#e7b3ac', dark: '#8e4f52', spec: 0.25, shin: 20, rim: '#ffe0dc', rimK: 0.25 },
  organ: { base: '#d9897e', dark: '#6e2a2a', spec: 0.5, shin: 36, rim: '#ffd6cc', rimK: 0.28 },
  skin: { base: '#e3b394', dark: '#8a5a44', spec: 0.15, shin: 16, rim: '#fff0e4', rimK: 0.25 },
};

// Hologramas (piel fantasma y figura exterior).
export const HOLO = {
  ghost: { glow: '#5eead4', core: '#0e3a4a', a0: 0.05, a1: 0.55, pow: 2.4 },
  body: { glow: '#67e8f9', core: '#155e75', a0: 0.5, a1: 0.45, pow: 1.8 },
};

// mats: Map(id → { mat, color?, dark?, axis? }) · opts: { ss, outline, aoRadius, holo? }
export function shade(buf, mats, opts = {}) {
  const { W, H, depth, id, nx, ny, nz, back, view, frame, scale } = buf;
  const v = VIEWS[view];
  const ss = opts.ss || 1;
  const ao = opts.ao === false ? null : ambientOcclusion(buf, { radius: (opts.aoRadius || 9) * ss, range: opts.aoRange || 22, samples: 14 });
  const rgba = new Uint8ClampedArray(W * H * 4);
  const L1 = [-0.45, 0.55, 0.7]; const l1 = Math.hypot(...L1); L1[0] /= l1; L1[1] /= l1; L1[2] /= l1;
  const L2 = [0.65, -0.25, 0.5]; const l2 = Math.hypot(...L2); L2[0] /= l2; L2[1] /= l2; L2[2] /= l2;
  const Hv = [L1[0], L1[1], L1[2] + 1]; const hl = Math.hypot(...Hv); Hv[0] /= hl; Hv[1] /= hl; Hv[2] /= hl;

  const resolved = new Map();
  for (const [k, m] of mats) {
    const base = MATERIALS[m.mat] || MATERIALS.organ;
    resolved.set(k, {
      ...base,
      ...m,
      c: hex(m.color || base.base),
      d: hex(m.dark || base.dark),
      r: hex(m.rim || base.rim),
      cut: hex(m.cut || m.color || base.base),
      holo: m.holo ? HOLO[m.holo] : null,
    });
  }
  const outline = opts.outline ?? 1;
  const edgeT = (opts.edgeDepth || 6);

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = y * W + x;
      const k = id[i];
      if (!k) continue;
      const M = resolved.get(k);
      if (!M) continue;
      const o = i * 4;
      let n0 = nx[i]; let n1 = ny[i]; let n2 = nz[i];
      if (M.holo) {
        const H0 = M.holo;
        const fr = Math.pow(1 - Math.abs(n2), H0.pow);
        const g = hex(H0.glow); const cc = hex(H0.core);
        const lit = 0.55 + 0.45 * clamp(n0 * L1[0] + n1 * L1[1] + Math.abs(n2) * L1[2]);
        for (let ch = 0; ch < 3; ch += 1) rgba[o + ch] = 255 * clamp(mix(cc[ch] * lit, g[ch], clamp(fr * 1.2)));
        rgba[o + 3] = 255 * clamp(H0.a0 + H0.a1 * fr);
        continue;
      }
      // Cara interior vista a través de un corte: superficie de sección plana.
      // Sin corte, una cara trasera visible es una malla abierta o del revés:
      // se sombrea como si fuera delantera.
      if (back[i] && opts.cutFaces) {
        const a = ao ? ao[i] : 0;
        for (let ch = 0; ch < 3; ch += 1) rgba[o + ch] = 255 * clamp(M.cut[ch] * (0.92 - 0.25 * a));
        rgba[o + 3] = 255;
        continue;
      }
      if (n2 < 0) { n0 = -n0; n1 = -n1; n2 = -n2; }
      const wrap = 0.35;
      const d1 = clamp((n0 * L1[0] + n1 * L1[1] + n2 * L1[2] + wrap) / (1 + wrap));
      const d2 = clamp(n0 * L2[0] + n1 * L2[1] + n2 * L2[2]);
      const occ = ao ? ao[i] : 0;
      let light = 0.3 * (1 - 0.65 * occ) + 0.72 * d1 * (1 - 0.35 * occ) + 0.18 * d2;
      // Texturas en coordenadas del mundo
      if (M.fiber || M.porous) {
        const sxw = x / (scale * ss) + frame.x0;
        const syw = frame.y1 - y / (scale * ss);
        const P = [0, 1, 2].map((c) => v.right[c] * sxw + v.up[c] * syw + v.fwd[c] * depth[i]);
        if (M.fiber && M.axis) {
          const a = M.axis;
          let w = [a[1] * v.fwd[2] - a[2] * v.fwd[1], a[2] * v.fwd[0] - a[0] * v.fwd[2], a[0] * v.fwd[1] - a[1] * v.fwd[0]];
          const wl = Math.hypot(...w) || 1; w = w.map((q) => q / wl);
          const u = P[0] * w[0] + P[1] * w[1] + P[2] * w[2];
          const along = P[0] * a[0] + P[1] * a[1] + P[2] * a[2];
          const jitter = noise3(P[0] * 0.15, P[1] * 0.15, P[2] * 0.15) * 2.2 + noise3(along * 0.05, u * 0.05, 1.7) * 1.5;
          const fine = 0.5 + 0.5 * Math.sin((u + jitter) * 2.4);
          const band = 0.5 + 0.5 * Math.sin((u * 0.45 + jitter * 1.3));
          light *= 1 - M.fiber * (0.55 * fine * fine + 0.45 * band * band * 0.6);
        }
        if (M.porous) {
          const nz3 = noise3(P[0] * 0.6, P[1] * 0.6, P[2] * 0.6) * 0.6 + noise3(P[0] * 1.9, P[1] * 1.9, P[2] * 1.9) * 0.4;
          light *= 1 - M.porous + M.porous * 2 * nz3 * 0.9;
        }
      }
      const sp = M.spec * Math.pow(clamp(n0 * Hv[0] + n1 * Hv[1] + n2 * Hv[2]), M.shin) * (1 - 0.6 * occ);
      const rim = M.rimK * Math.pow(1 - n2, 2.6);
      for (let ch = 0; ch < 3; ch += 1) {
        // Mezcla entre el tono oscuro y el base según la luz, con un poco de sobreexposición.
        const t = clamp(light);
        let col = t < 0.75 ? mix(M.d[ch], M.c[ch], t / 0.75) : mix(M.c[ch], 1, (t - 0.75) * 0.6);
        col += sp + rim * M.r[ch] * 0.6;
        rgba[o + ch] = 255 * clamp(col);
      }
      rgba[o + 3] = 255;
    }
  }

  // Trazo de contorno: cambio de estructura o salto de profundidad.
  if (outline > 0) {
    const R = Math.max(1, Math.round(outline * ss));
    const dark = new Float32Array(W * H);
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const i = y * W + x;
        const k = id[i];
        if (!k || resolved.get(k)?.holo) continue;
        let e = 0;
        for (let dy = -R; dy <= R; dy += 1) {
          for (let dx = -R; dx <= R; dx += 1) {
            if (!dx && !dy) continue;
            const X = x + dx; const Y = y + dy;
            if (X < 0 || Y < 0 || X >= W || Y >= H) { e += 1; continue; }
            const j = Y * W + X;
            if (id[j] !== k) {
              // Solo dibuja el borde la estructura de delante (o el borde exterior).
              if (!id[j] || depth[j] > depth[i]) e += 1;
            } else if (depth[j] - depth[i] > edgeT) e += 0.6;
          }
        }
        dark[i] = Math.min(1, e / (R * 4));
      }
    }
    for (let i = 0; i < W * H; i += 1) {
      if (!dark[i]) continue;
      const M = resolved.get(id[i]);
      const o = i * 4;
      const t = 0.7 * dark[i];
      for (let ch = 0; ch < 3; ch += 1) rgba[o + ch] = 255 * mix(rgba[o + ch] / 255, M.d[ch] * 0.7, t);
    }
  }
  return rgba;
}
