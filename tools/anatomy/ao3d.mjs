// Oclusión ambiental por vértice para el modelo 3D (tools/build-anatomy-3d.mjs).
// Se rasteriza la capa entera en profundidad desde ~80 direcciones repartidas por
// la esfera y cada vértice suma las direcciones desde las que se ve, pesadas por
// su normal. Queda en part.ao (0-255) y el visor la usa sin coste en tiempo real.
import { vertexNormals } from './raster.mjs';

const DIRS = 80;
const BIAS = 0.0028; // m
const MAX_PX = 1500;

function fibonacciSphere(n) {
  const out = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    out.push([Math.cos(g * i) * r, y, Math.sin(g * i) * r]);
  }
  return out;
}

function basis(d) {
  const a = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const r = [a[1] * d[2] - a[2] * d[1], a[2] * d[0] - a[0] * d[2], a[0] * d[1] - a[1] * d[0]];
  const lr = Math.hypot(...r);
  r[0] /= lr; r[1] /= lr; r[2] /= lr;
  const u = [d[1] * r[2] - d[2] * r[1], d[2] * r[0] - d[0] * r[2], d[0] * r[1] - d[1] * r[0]];
  return { r, u };
}

// pieces: [{ part: { pos, idx }, lod: { h, l } }] — rellena part.ao
export function bakeAO(pieces, occluderLod = 'h') {
  const t0 = Date.now();
  const parts = [...new Set(pieces.map((p) => p.part))];
  // triángulos que tapan: los del LOD de detalle de toda la capa
  let nt = 0;
  for (const pc of pieces) nt += pc.lod[occluderLod].length / 3;
  const tri = new Float32Array(nt * 9);
  let o = 0;
  for (const pc of pieces) {
    const { pos } = pc.part; const idx = pc.lod[occluderLod];
    for (let i = 0; i < idx.length; i += 1) { tri.set(pos.subarray(idx[i] * 3, idx[i] * 3 + 3), o); o += 3; }
  }
  // vértices a evaluar (los que usa algún LOD) con su normal
  const evals = parts.map((part) => {
    const mine = pieces.filter((p) => p.part === part);
    const cat = (n) => {
      const all = mine.map((p) => p.lod[n]);
      const out = new Uint32Array(all.reduce((s, a) => s + a.length, 0));
      let k = 0;
      for (const a of all) { out.set(a, k); k += a.length; }
      return out;
    };
    const hi = cat('h'); const lo = cat('l');
    const nh = vertexNormals(part.pos, hi); const nl = vertexNormals(part.pos, lo);
    const used = new Uint8Array(part.pos.length / 3);
    for (const a of [hi, lo]) for (let i = 0; i < a.length; i += 1) used[a[i]] = 1;
    const verts = [];
    for (let v = 0; v < used.length; v += 1) if (used[v]) verts.push(v);
    const nrm = new Float32Array(verts.length * 3);
    verts.forEach((v, i) => {
      const src = nh[v * 3] || nh[v * 3 + 1] || nh[v * 3 + 2] ? nh : nl;
      nrm[i * 3] = src[v * 3]; nrm[i * 3 + 1] = src[v * 3 + 1]; nrm[i * 3 + 2] = src[v * 3 + 2];
    });
    return { part, verts: Uint32Array.from(verts), nrm, acc: new Float32Array(verts.length), wsum: new Float32Array(verts.length), hi };
  });

  // extensión de la capa
  let ext = 0;
  const lo3 = [Infinity, Infinity, Infinity]; const hi3 = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < tri.length; i += 3) for (let a = 0; a < 3; a += 1) { if (tri[i + a] < lo3[a]) lo3[a] = tri[i + a]; if (tri[i + a] > hi3[a]) hi3[a] = tri[i + a]; }
  const center = lo3.map((v, a) => (v + hi3[a]) / 2);
  ext = Math.hypot(hi3[0] - lo3[0], hi3[1] - lo3[1], hi3[2] - lo3[2]);
  const px = Math.max(ext / MAX_PX, 0.0007);
  const N = Math.ceil(ext / px) + 4;
  const depth = new Float32Array(N * N);
  const PX = new Float32Array(nt * 3); const PY = new Float32Array(nt * 3); const PZ = new Float32Array(nt * 3);

  for (const d of fibonacciSphere(DIRS)) {
    const { r, u } = basis(d);
    depth.fill(-Infinity);
    const cx = center[0]; const cy = center[1]; const cz = center[2]; const h = N / 2;
    // proyección de todos los vértices de los triángulos (sin reservar memoria en el bucle)
    for (let i = 0, k = 0; i < tri.length; i += 3, k += 1) {
      const x = tri[i] - cx; const y = tri[i + 1] - cy; const z = tri[i + 2] - cz;
      PX[k] = (x * r[0] + y * r[1] + z * r[2]) / px + h;
      PY[k] = (x * u[0] + y * u[1] + z * u[2]) / px + h;
      PZ[k] = x * d[0] + y * d[1] + z * d[2];
    }
    for (let k = 0; k < PX.length; k += 3) {
      const ax = PX[k]; const ay = PY[k]; const bx = PX[k + 1]; const by = PY[k + 1]; const qx = PX[k + 2]; const qy = PY[k + 2];
      const area = (bx - ax) * (qy - ay) - (by - ay) * (qx - ax);
      if (Math.abs(area) < 1e-9) continue;
      const az = PZ[k]; const bz = PZ[k + 1]; const qz = PZ[k + 2];
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, qx)));
      const x1 = Math.min(N - 1, Math.ceil(Math.max(ax, bx, qx)));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by, qy)));
      const y1 = Math.min(N - 1, Math.ceil(Math.max(ay, by, qy)));
      for (let y = y0; y <= y1; y += 1) {
        const py = y + 0.5;
        for (let x = x0; x <= x1; x += 1) {
          const pxx = x + 0.5;
          const w0 = ((bx - pxx) * (qy - py) - (by - py) * (qx - pxx)) / area;
          const w1 = ((qx - pxx) * (ay - py) - (qy - py) * (ax - pxx)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = w0 * az + w1 * bz + w2 * qz;
          const i = y * N + x;
          if (z > depth[i]) depth[i] = z;
        }
      }
    }
    for (const ev of evals) {
      const P = ev.part.pos;
      for (let i = 0; i < ev.verts.length; i += 1) {
        const v = ev.verts[i] * 3;
        const w = ev.nrm[i * 3] * d[0] + ev.nrm[i * 3 + 1] * d[1] + ev.nrm[i * 3 + 2] * d[2];
        if (w <= 0) continue;
        const x = P[v] - cx; const y = P[v + 1] - cy; const z = P[v + 2] - cz;
        const xi = Math.min(N - 1, Math.max(0, Math.floor((x * r[0] + y * r[1] + z * r[2]) / px + h)));
        const yi = Math.min(N - 1, Math.max(0, Math.floor((x * u[0] + y * u[1] + z * u[2]) / px + h)));
        const zz = x * d[0] + y * d[1] + z * d[2];
        if (depth[yi * N + xi] <= zz + BIAS) ev.acc[i] += w;
        ev.wsum[i] += w;
      }
    }
  }

  // a 0-255, suavizada una pasada con los vecinos
  for (const ev of evals) {
    const nv = ev.part.pos.length / 3;
    const ao = new Float32Array(nv).fill(1);
    for (let i = 0; i < ev.verts.length; i += 1) ao[ev.verts[i]] = ev.wsum[i] > 0 ? ev.acc[i] / ev.wsum[i] : 1;
    const sum = new Float32Array(nv); const cnt = new Float32Array(nv);
    const idx = ev.hi;
    for (let t = 0; t < idx.length; t += 3) {
      for (let j = 0; j < 3; j += 1) {
        const a = idx[t + j];
        sum[a] += ao[idx[t]] + ao[idx[t + 1]] + ao[idx[t + 2]];
        cnt[a] += 3;
      }
    }
    const out = new Uint8Array(nv).fill(255);
    for (let i = 0; i < ev.verts.length; i += 1) {
      const v = ev.verts[i];
      const s = cnt[v] ? (ao[v] + sum[v] / cnt[v]) / 2 : ao[v];
      out[v] = Math.round(Math.max(0, Math.min(1, s)) * 255);
    }
    ev.part.ao = out;
  }
  console.log(`  oclusión: ${evals.reduce((s, e) => s + e.verts.length, 0)} vértices · ${nt} triángulos · ${N}² · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
