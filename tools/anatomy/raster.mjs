// Rasterizador por software para las láminas del cuerpo humano.
// Proyección ortográfica de mallas 3D (BodyParts3D, coordenadas en mm:
// x+ izquierda del sujeto, y+ posterior, z+ arriba) a un lienzo con
// profundidad, identificador de estructura, normal y cara trasera por píxel.
// Sin GPU ni navegador: es determinista y no depende de WebGL.

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// right/up = ejes de la pantalla; fwd = hacia dónde mira la cámara.
export const VIEWS = {
  anterior: { right: [1, 0, 0], up: [0, 0, 1], fwd: [0, 1, 0] },
  posterior: { right: [-1, 0, 0], up: [0, 0, 1], fwd: [0, -1, 0] },
  'lateral-d': { right: [0, -1, 0], up: [0, 0, 1], fwd: [1, 0, 0] },
  'lateral-i': { right: [0, 1, 0], up: [0, 0, 1], fwd: [-1, 0, 0] },
  superior: { right: [-1, 0, 0], up: [0, -1, 0], fwd: [0, 0, -1] },
};

// Normales por vértice (media ponderada por área de las caras).
export function vertexNormals(pos, idx) {
  const n = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3; const b = idx[t + 1] * 3; const c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a]; const uy = pos[b + 1] - pos[a + 1]; const uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a]; const vy = pos[c + 1] - pos[a + 1]; const vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy; const ny = uz * vx - ux * vz; const nz = ux * vy - uy * vx;
    for (const v of [a, b, c]) { n[v] += nx; n[v + 1] += ny; n[v + 2] += nz; }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
  return n;
}

// Encuadre en coordenadas de vista (mm) de un conjunto de mallas.
export function viewBounds(meshes, view) {
  const v = VIEWS[view];
  let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
  for (const m of meshes) {
    const p = m.pos;
    const used = new Uint8Array(p.length / 3);
    for (let t = 0; t < m.idx.length; t += 1) used[m.idx[t]] = 1;
    for (let i = 0; i < p.length; i += 3) {
      if (!used[i / 3]) continue;
      const P = [p[i], p[i + 1], p[i + 2]];
      const x = dot(P, v.right); const y = dot(P, v.up);
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { x0, x1, y0, y1 };
}

// meshes: [{ id (1..65535), pos: Float32Array, idx: Uint32Array, nrm?: Float32Array }]
// frame: { x0, x1, y0, y1 } en mm (coordenadas de vista); scale: píxeles por mm.
// near: profundidad mínima (corte); lo que queda delante se descarta y las caras
// interiores que se ven por el corte quedan marcadas en `back`.
export function rasterize(meshes, { view, frame, scale, near = -Infinity }) {
  const v = VIEWS[view];
  const W = Math.max(1, Math.round((frame.x1 - frame.x0) * scale));
  const H = Math.max(1, Math.round((frame.y1 - frame.y0) * scale));
  const N = W * H;
  const depth = new Float32Array(N).fill(Infinity);
  const id = new Uint16Array(N);
  const nx = new Float32Array(N); const ny = new Float32Array(N); const nz = new Float32Array(N);
  const back = new Uint8Array(N);
  const sx = new Float32Array(3); const sy = new Float32Array(3); const sz = new Float32Array(3);
  const vn = [new Float32Array(3), new Float32Array(3), new Float32Array(3)];

  for (const m of meshes) {
    const { pos, idx } = m;
    const nrm = m.nrm || (m.nrm = vertexNormals(pos, idx));
    const flip = m.flip ? -1 : 1;
    const bias = m.bias || 0;
    for (let t = 0; t < idx.length; t += 3) {
      for (let k = 0; k < 3; k += 1) {
        const o = idx[t + k] * 3;
        const P0 = pos[o]; const P1 = pos[o + 1]; const P2 = pos[o + 2];
        sx[k] = ((P0 * v.right[0] + P1 * v.right[1] + P2 * v.right[2]) - frame.x0) * scale;
        sy[k] = (frame.y1 - (P0 * v.up[0] + P1 * v.up[1] + P2 * v.up[2])) * scale;
        sz[k] = P0 * v.fwd[0] + P1 * v.fwd[1] + P2 * v.fwd[2] + bias;
        const n0 = nrm[o] * flip; const n1 = nrm[o + 1] * flip; const n2 = nrm[o + 2] * flip;
        vn[k][0] = n0 * v.right[0] + n1 * v.right[1] + n2 * v.right[2];
        vn[k][1] = n0 * v.up[0] + n1 * v.up[1] + n2 * v.up[2];
        vn[k][2] = -(n0 * v.fwd[0] + n1 * v.fwd[1] + n2 * v.fwd[2]);
      }
      const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
      if (area === 0) continue;
      // En pantalla y crece hacia abajo: área negativa = cara de frente (giro antihorario en el mundo).
      const isBack = (area > 0) !== Boolean(m.flip) ? 1 : 0;
      const minX = Math.max(0, Math.floor(Math.min(sx[0], sx[1], sx[2])));
      const maxX = Math.min(W - 1, Math.ceil(Math.max(sx[0], sx[1], sx[2])));
      const minY = Math.max(0, Math.floor(Math.min(sy[0], sy[1], sy[2])));
      const maxY = Math.min(H - 1, Math.ceil(Math.max(sy[0], sy[1], sy[2])));
      if (minX > maxX || minY > maxY) continue;
      const inv = 1 / area;
      for (let py = minY; py <= maxY; py += 1) {
        const cy = py + 0.5;
        for (let px = minX; px <= maxX; px += 1) {
          const cx = px + 0.5;
          const w0 = ((sx[1] - cx) * (sy[2] - cy) - (sx[2] - cx) * (sy[1] - cy)) * inv;
          const w1 = ((sx[2] - cx) * (sy[0] - cy) - (sx[0] - cx) * (sy[2] - cy)) * inv;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * sz[0] + w1 * sz[1] + w2 * sz[2];
          if (z < near) continue;
          const i = py * W + px;
          if (z >= depth[i]) continue;
          depth[i] = z;
          id[i] = m.id;
          back[i] = isBack;
          let a = w0 * vn[0][0] + w1 * vn[1][0] + w2 * vn[2][0];
          let b = w0 * vn[0][1] + w1 * vn[1][1] + w2 * vn[2][1];
          let c = w0 * vn[0][2] + w1 * vn[1][2] + w2 * vn[2][2];
          const l = Math.hypot(a, b, c) || 1;
          a /= l; b /= l; c /= l;
          nx[i] = a; ny[i] = b; nz[i] = c;
        }
      }
    }
  }
  return { W, H, depth, id, nx, ny, nz, back, view, frame, scale };
}

// Oclusión ambiental en espacio de pantalla a partir de la profundidad.
// Devuelve 0 (sin oclusión) … 1 (muy ocluido). radius en píxeles, range en mm.
export function ambientOcclusion(buf, { radius = 12, range = 25, samples = 16 } = {}) {
  const { W, H, depth } = buf;
  const ao = new Float32Array(W * H);
  const offs = [];
  for (let s = 0; s < samples; s += 1) {
    const a = (s / samples) * Math.PI * 2 + 0.37 * s;
    const r = radius * (0.35 + 0.65 * (((s * 7) % samples) / samples));
    offs.push([Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)]);
  }
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = y * W + x;
      const d = depth[i];
      if (d === Infinity) continue;
      let occ = 0;
      for (const [ox, oy] of offs) {
        const X = x + ox; const Y = y + oy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const ds = depth[Y * W + X];
        if (ds === Infinity) continue;
        const diff = d - ds; // >0: la muestra está más cerca de la cámara
        if (diff > 0.5) occ += Math.min(1, diff / range) * (1 - Math.min(1, diff / (range * 4)));
      }
      ao[i] = Math.min(1, occ / (samples * 0.5));
    }
  }
  return ao;
}

// Reparte el fondo cercano entre las estructuras más próximas (zonas de toque
// más generosas para lo fino: vasos, nervios). Devuelve un nuevo id.
export function growIds(buf, radius) {
  const { W, H } = buf;
  const out = new Uint16Array(buf.id);
  const dist = new Float32Array(W * H).fill(Infinity);
  for (let i = 0; i < out.length; i += 1) if (out[i]) dist[i] = 0;
  const pass = (forward) => {
    const ys = forward ? [0, H, 1] : [H - 1, -1, -1];
    const xs = forward ? [0, W, 1] : [W - 1, -1, -1];
    const nb = forward ? [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.414], [1, -1, 1.414]] : [[1, 0, 1], [0, 1, 1], [1, 1, 1.414], [-1, 1, 1.414]];
    for (let y = ys[0]; y !== ys[1]; y += ys[2]) {
      for (let x = xs[0]; x !== xs[1]; x += xs[2]) {
        const i = y * W + x;
        for (const [dx, dy, c] of nb) {
          const X = x + dx; const Y = y + dy;
          if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
          const j = Y * W + X;
          const nd = dist[j] + c;
          if (nd < dist[i] && nd <= radius) { dist[i] = nd; out[i] = out[j]; }
        }
      }
    }
  };
  pass(true); pass(false);
  return out;
}

// Reduce un búfer de identificadores supersampleado (ss×ss) al tamaño final:
// en cada bloque gana el identificador más repetido (el fondo solo si domina).
export function downsampleIds(id, W, H, ss) {
  const w = Math.floor(W / ss); const h = Math.floor(H / ss);
  const out = new Uint16Array(w * h);
  const counts = new Map();
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      counts.clear();
      for (let j = 0; j < ss; j += 1) {
        for (let i = 0; i < ss; i += 1) {
          const v = id[(y * ss + j) * W + x * ss + i];
          counts.set(v, (counts.get(v) || 0) + 1);
        }
      }
      let best = 0; let bc = -1;
      for (const [v, c] of counts) if (c > bc || (c === bc && v !== 0)) { best = v; bc = c; }
      out[y * w + x] = best;
    }
  }
  return { id: out, W: w, H: h };
}
