// Contexto anatómico para construir las láminas: acceso a las piezas de
// BodyParts3D por nombre, puntos de referencia (articulaciones, ombligo…)
// calculados sobre los huesos del propio modelo, piel de maniquí, regiones
// externas del cuerpo y piezas procedurales (tiroides, cóccix, colon sigmoide,
// parótidas, discos, nervios periféricos y músculos que el modelo no trae).
import fs from 'node:fs';
import {
  loadElementNames, elementsMatching, loadElement, mergeMeshes, smoothRegion, bbox,
  ellipsoid, tube, surfacePatch, splitMesh, vec, surfaceNets, blur3, hull2, inHull, keepLargest,
} from './meshes.mjs';

const avg = (pts) => {
  const s = [0, 0, 0];
  pts.forEach((p) => { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; });
  return s.map((v) => v / (pts.length || 1));
};

// Centro de los vértices en el extremo de una malla en la dirección `dir`.
function endCenter(m, dir, depth = 12) {
  let max = -Infinity;
  for (let i = 0; i < m.pos.length; i += 3) max = Math.max(max, m.pos[i] * dir[0] + m.pos[i + 1] * dir[1] + m.pos[i + 2] * dir[2]);
  const pts = [];
  for (let i = 0; i < m.pos.length; i += 3) {
    const p = [m.pos[i], m.pos[i + 1], m.pos[i + 2]];
    if (p[0] * dir[0] + p[1] * dir[1] + p[2] * dir[2] > max - depth) pts.push(p);
  }
  return avg(pts);
}

export function createContext(dir) {
  const names = loadElementNames(dir);
  const meshCache = new Map();
  const get = (include, not = []) => {
    const key = [].concat(include).map(String).join('|') + '!' + not.map(String).join('|');
    if (!meshCache.has(key)) {
      const files = elementsMatching(names, include, not);
      meshCache.set(key, { ...mergeMeshes(files.map((f) => loadElement(dir, f))), files });
    }
    return meshCache.get(key);
  };
  const ctx = { dir, names, get };

  /* ───── puntos de referencia ───── */
  let L = null;
  ctx.landmarks = () => {
    if (L) return L;
    const side = (s) => (s === 'R' ? 'Right' : 'Left');
    const bone = (s, n) => get([new RegExp(`^${side(s)} ${n}$`, 'i')]);
    L = {};
    for (const s of ['R', 'L']) {
      const hum = bone(s, 'humerus');
      const rad = bone(s, 'radius');
      const uln = bone(s, 'ulna');
      const fem = bone(s, 'femur');
      const tib = bone(s, 'tibia');
      const fib = bone(s, 'fibula');
      const hand = get([new RegExp(`phalanx of ${side(s)} (thumb|index finger|middle finger|ring finger|little finger)$`, 'i')]);
      const footPh = get([new RegExp(`phalanx of ${side(s)} (big|second|third|fourth|little) toe$`, 'i')]);
      const calc = bone(s, 'calcaneus');
      const hip = get([new RegExp(`^${side(s)} hip bone$`, 'i')]);
      const scap = bone(s, 'scapula');
      L[`shoulder${s}`] = endCenter(hum, [0, 0, 1], 25);
      L[`elbow${s}`] = endCenter(hum, [0, 0, -1], 14);
      L[`wrist${s}`] = avg([endCenter(rad, [0, 0, -1], 8), endCenter(uln, [0, 0, -1], 8)]);
      L[`hand${s}`] = endCenter(hand, [0, 0, -1], 6);
      L[`hip${s}`] = endCenter(fem, [0, 0, 1], 30);
      L[`knee${s}`] = endCenter(fem, [0, 0, -1], 18);
      L[`ankle${s}`] = avg([endCenter(tib, [0, 0, -1], 10), endCenter(fib, [0, 0, -1], 10)]);
      L[`toe${s}`] = endCenter(footPh, [0, -1, 0], 6);
      L[`heel${s}`] = endCenter(calc, [0, 1, 0], 10);
      L[`iliac${s}`] = endCenter(hip, [0, 0, 1], 8);
      L[`acromion${s}`] = endCenter(scap, [s === 'R' ? -1 : 1, 0, 0.6], 10);
      L[`scapAngle${s}`] = endCenter(scap, [0, 0, -1], 8);
      L[`fibHead${s}`] = endCenter(fib, [0, 0, 1], 10);
      L[`medEpi${s}`] = endCenter(hum, [s === 'R' ? 1 : -1, 0, -0.5], 6);
    }
    const skull = get([/^(frontal bone|left parietal bone|right parietal bone|occipital bone)$/i]);
    const mand = get([/^mandible$/i]);
    L.headTop = endCenter(skull, [0, 0, 1], 6);
    L.chin = endCenter(mand, [0, -0.3, -1], 6);
    L.jugular = endCenter(get([/^manubrium$/i]), [0, 0, 1], 6);
    L.xiphoid = endCenter(get([/^xiphoid process$/i]), [0, 0, -1], 6);
    L.pubis = endCenter(get([/^(left|right) hip bone$/i]), [0, -1, -0.4], 8);
    L.pubis[0] = 0;
    L.sacrumApex = endCenter(get([/^sacrum$/i]), [0, 0.3, -1], 6);
    L.navel = [0, 0, (L.iliacR[2] + L.iliacL[2]) / 2 + 12];
    const tc = bbox(get([/^thyroid cartilage$/i]));
    L.thyroidCart = tc.center;
    L.thyroidCartBox = tc;
    L.trachea = bbox(get([/^trachea$/i]));
    L.mandBox = bbox(mand);
    L.eyeR = bbox(get([/^right lens$/i])).center;
    L.eyeL = bbox(get([/^left lens$/i])).center;
    L.lip = bbox(get([/^lip$/i])).center;
    const ear = get([/^external ear$/i]);
    L.earBox = bbox(ear);
    L.cord = bbox(get([/^central canal of spinal cord$/i]));
    L.vertebrae = {};
    for (const e of names) {
      if (/^((first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (cervical|thoracic|lumbar) vertebra|atlas|axis)$/i.test(e.n)) L.vertebrae[e.n] = bbox(loadElement(dir, e.fj));
    }
    return L;
  };

  /* ───── piel de maniquí ───── */
  let skin = null;
  ctx.skin = () => {
    if (skin) return skin;
    const raw = get([/^skin$/i]);
    const gen = bbox(get([/penis/i, /testis/i]));
    const pad = 22;
    const inR = (p) => p[0] > gen.min[0] - pad && p[0] < gen.max[0] + pad && p[2] > gen.min[2] - pad * 1.4 && p[2] < gen.max[2] + pad * 0.5 && p[1] < gen.max[1] + 6;
    skin = smoothRegion(raw, inR, 500);
    return skin;
  };

  /* ───── piezas procedurales ───── */
  ctx.proc = {
    // Médula espinal: tubo a lo largo del conducto central (el modelo no trae la médula).
    spinalCord() {
      // Centro del conducto vertebral en cada vértebra: el hueco más grande en y
      // entre el cuerpo y el arco, junto a la línea media.
      const order = ['atlas', 'axis', ...['third', 'fourth', 'fifth', 'sixth', 'seventh'].map((o) => `${o} cervical vertebra`), ...['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'].map((o) => `${o} thoracic vertebra`), 'first lumbar vertebra', 'second lumbar vertebra'];
      const path = [];
      for (const n of order) {
        const m = get([new RegExp(`^${n}$`, 'i')]);
        if (!m.idx.length) continue;
        const b = bbox(m);
        const zc = b.center[2];
        const ys = [];
        for (let i = 0; i < m.pos.length; i += 3) if (Math.abs(m.pos[i]) < 7 && Math.abs(m.pos[i + 2] - zc) < b.size[2] * 0.35) ys.push(m.pos[i + 1]);
        ys.sort((a2, b2) => a2 - b2);
        let gap = 0; let at = b.center[1];
        for (let i = 1; i < ys.length; i += 1) if (ys[i] - ys[i - 1] > gap) { gap = ys[i] - ys[i - 1]; at = (ys[i] + ys[i - 1]) / 2; }
        path.push([0, at, zc]);
      }
      const med = bbox(get([/^medulla oblongata$/i]));
      path.unshift([0, path[0][1] - 2, med.min[2] + 6]);
      const last = path[path.length - 1];
      path.push([0, last[1], last[2] - 30]);
      const zTop = path[0][2]; const zBot = path[path.length - 1][2];
      const r = (t) => {
        const z = zTop - t * (zTop - zBot);
        const cerv = Math.exp(-(((zTop - z) - 90) ** 2) / (2 * 40 ** 2));
        const lumb = Math.exp(-(((z - zBot) - 60) ** 2) / (2 * 30 ** 2));
        return 4.6 + 1.8 * cerv + 1.4 * lumb - (t > 0.9 ? (t - 0.9) * 40 : 0);
      };
      return tube(path, r, { sides: 12, steps: 4 });
    },
    thyroid() {
      const l = ctx.landmarks();
      const t = l.thyroidCartBox;
      const zc = t.min[2] - 22; const y = t.min[1] + 10;
      return mergeMeshes([
        ellipsoid([-17, y + 4, zc], [9, 8, 21], { rotY: 0.18 }),
        ellipsoid([17, y + 4, zc], [9, 8, 21], { rotY: -0.18 }),
        ellipsoid([0, y - 2, zc - 10], [12, 5, 6]),
      ]);
    },
    parathyroid() {
      const l = ctx.landmarks();
      const t = l.thyroidCartBox;
      const zc = t.min[2] - 22; const y = t.min[1] + 16;
      return mergeMeshes([[-19, zc + 10], [19, zc + 10], [-19, zc - 12], [19, zc - 12]].map(([x, z]) => ellipsoid([x, y, z], [3.2, 3.2, 3.2], { seg: 10, ring: 8 })));
    },
    coccyx() {
      const a = ctx.landmarks().sacrumApex;
      return tube([[a[0], a[1], a[2] + 4], [a[0], a[1] + 4, a[2] - 10], [a[0], a[1] + 2, a[2] - 22], [a[0], a[1] - 6, a[2] - 30]], (t) => 9 * (1 - t * 0.6), { sides: 12 });
    },
    sigmoid() {
      const desc = bbox(get([/^descending colon$/i]));
      const rect = bbox(get([/^rectum$/i]));
      const s = [desc.center[0], desc.center[1], desc.min[2] + 6];
      const e = [rect.center[0], rect.center[1], rect.max[2] - 4];
      return tube([s, [s[0] - 10, s[1] - 12, s[2] - 30], [(s[0] + e[0]) / 2 + 20, s[1] - 22, s[2] - 48], [e[0] + 30, e[1] - 18, e[2] + 20], [e[0] + 8, e[1] - 6, e[2] + 6], e], 15, { sides: 14, steps: 8 });
    },
    anus() {
      const rect = bbox(get([/^rectum$/i]));
      const b = [rect.center[0], rect.center[1] + 8, rect.min[2]];
      return tube([b, [b[0], b[1] + 6, b[2] - 22], [b[0], b[1] + 12, b[2] - 36]], 9, { sides: 12 });
    },
    parotid() {
      const l = ctx.landmarks();
      const e = l.earBox;
      const zc = (l.mandBox.max[2] + l.mandBox.min[2]) / 2 + 12;
      const y = e.min[1] - 6;
      return mergeMeshes([
        ellipsoid([e.min[0] + 16, y, zc], [12, 16, 24]),
        ellipsoid([e.max[0] - 16, y, zc], [12, 16, 24]),
      ]);
    },
  };

  /* ───── pulmones (el modelo solo trae bronquios y vasos) ───── */
  // La cavidad torácica (dentro de las costillas, sobre el diafragma y fuera
  // del mediastino) se reparte entre los lóbulos según el árbol bronquial más
  // cercano; cada lóbulo se convierte en superficie (surface nets).
  let lungs = null;
  ctx.lungs = () => {
    if (lungs) return lungs;
    const t0 = Date.now();
    const STEP = 3.5;
    const pts = (m) => { const o = []; for (let i = 0; i < m.pos.length; i += 3) o.push([m.pos[i], m.pos[i + 1], m.pos[i + 2]]); return o; };
    const ribsM = get([/^(left|right) (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib$/i, /costal cartilage/i, /^(manubrium|body of sternum|xiphoid process)$/i, /thoracic vertebra$/i]);
    const ribPts = pts(ribsM);
    const firstRibTop = bbox(get([/^(left|right) first rib$/i])).max[2];
    const dia = get([/^diaphragm$/i]);
    const diaB = bbox(dia);
    const yFront = bbox(ribsM).min[1];
    const forward = (list, keepFrac) => list.concat(list.filter((_, i) => i % 3 === 0).map((p) => [p[0] * keepFrac, yFront, p[2]]));
    const med = [
      forward(pts(get([/^(wall of (atrium|ventricle)|.*auricle)$/i, /(left|right) (atrium|ventricle)$/i], [/cavity/i])), 0.72),
      forward(pts(get([/^(ascending aorta|arch of aorta|pulmonary trunk|superior vena cava)$/i])), 0.8),
      pts(get([/^descending thoracic aorta$/i])),
      pts(get([/^trachea$/i])), pts(get([/^esophagus$/i])), pts(get([/thoracic vertebra$/i])),
    ];
    const zMin = diaB.min[2] - 10; const zMax = firstRibTop + 30;
    const rb = bbox(ribsM);
    const x0 = rb.min[0] - 5; const y0 = rb.min[1] - 5; const nxv = Math.ceil((rb.size[0] + 10) / STEP); const nyv = Math.ceil((rb.size[1] + 10) / STEP); const nzv = Math.ceil((zMax - zMin) / STEP) + 2;
    // envolventes por rodajas
    const slab = (list, z, half) => hull2(list.filter((p) => Math.abs(p[2] - z) < half).map((p) => [p[0], p[1]]));
    const ribH = []; const medH = [];
    for (let k = 0; k < nzv; k += 1) {
      const z = zMin + k * STEP;
      ribH.push(slab(ribPts, Math.min(z, firstRibTop), 16));
      medH.push(med.map((m) => slab(m, z, 5)));
    }
    // diafragma: altura máxima por columna
    const dg = new Map();
    for (const p of pts(dia)) {
      const key = `${Math.round(p[0] / 8)},${Math.round(p[1] / 8)}`;
      dg.set(key, Math.max(dg.get(key) ?? -Infinity, p[2]));
    }
    const diaZ = (x, y) => {
      for (let r = 1; r <= 5; r += 1) {
        let best = -Infinity;
        for (let dx = -r; dx <= r; dx += 1) for (let dy = -r; dy <= r; dy += 1) best = Math.max(best, dg.get(`${Math.round(x / 8) + dx},${Math.round(y / 8) + dy}`) ?? -Infinity);
        if (best > -Infinity) return best;
      }
      return diaB.min[2] + 90;
    };
    // árboles de cada lóbulo
    const lobes = {
      'lobulo-sup-d': 'FMA7333', 'lobulo-medio': 'FMA7383', 'lobulo-inf-d': 'FMA7337', 'lobulo-sup-i': 'FMA7370', 'lobulo-inf-i': 'FMA7371',
    };
    const lobeKeys = Object.keys(lobes);
    const conceptEl = new Map();
    for (const line of fs.readFileSync(`${dir}/isa_element_parts.txt`, 'utf8').split('\n').concat(fs.readFileSync(`${dir}/partof_element_parts.txt`, 'utf8').split('\n'))) {
      const p = line.split('\t');
      if (p.length < 3) continue;
      if (!conceptEl.has(p[0])) conceptEl.set(p[0], new Set());
      conceptEl.get(p[0]).add(p[2].trim());
    }
    const grid = new Map();
    const CELL = 12;
    lobeKeys.forEach((k, li) => {
      for (const fj of conceptEl.get(lobes[k]) || []) {
        const m = loadElement(dir, fj);
        if (!m) continue;
        for (let i = 0; i < m.pos.length; i += 9) {
          const p = [m.pos[i], m.pos[i + 1], m.pos[i + 2]];
          const key = `${Math.floor(p[0] / CELL)},${Math.floor(p[1] / CELL)},${Math.floor(p[2] / CELL)}`;
          if (!grid.has(key)) grid.set(key, []);
          grid.get(key).push([p[0], p[1], p[2], li]);
        }
      }
    });
    const nearestLobe = (x, y, z) => {
      let best = Infinity; let bl = -1;
      const cx = Math.floor(x / CELL); const cy = Math.floor(y / CELL); const cz = Math.floor(z / CELL);
      for (let r = 0; r <= 5 && bl < 0; r += 1) {
        for (let dx = -r; dx <= r; dx += 1) for (let dy = -r; dy <= r; dy += 1) for (let dz = -r; dz <= r; dz += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
          for (const q of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) || []) {
            const d = (q[0] - x) ** 2 + (q[1] - y) ** 2 + (q[2] - z) ** 2;
            if (d < best) { best = d; bl = q[3]; }
          }
        }
      }
      return Math.sqrt(best) < 70 ? bl : -1;
    };
    const N = nxv * nyv * nzv;
    const label = new Int8Array(N).fill(-1);
    for (let k = 0; k < nzv; k += 1) {
      const z = zMin + k * STEP;
      const rh = ribH[k];
      for (let j = 0; j < nyv; j += 1) {
        const y = y0 + j * STEP;
        for (let i = 0; i < nxv; i += 1) {
          const x = x0 + i * STEP;
          if (!inHull(rh, x, y, -7)) continue;
          if (z > firstRibTop - 10 && !inHull(rh, x, y, -18 - (z - firstRibTop + 10) * 0.9)) continue;
          if (z < diaZ(x, y) + 3) continue;
          if (medH[k].some((h, mi) => inHull(h, x, y, mi === 0 ? 4 : 3))) continue;
          label[i + nxv * (j + nyv * k)] = nearestLobe(x, y, z);
        }
      }
    }
    lungs = {};
    lobeKeys.forEach((k, li) => {
      const f = new Float32Array(N);
      for (let n = 0; n < N; n += 1) if (label[n] === li) f[n] = 1;
      blur3(f, [nxv, nyv, nzv], 3, 2);
      lungs[k] = smoothRegion(keepLargest(surfaceNets(f, [nxv, nyv, nzv], [x0, y0, zMin], STEP, 0.5), 0.2), () => true, 16);
    });
    console.log(`  · pulmones reconstruidos en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    return lungs;
  };

  /* ───── hígado (el modelo solo trae sus vasos y vías biliares) ───── */
  let liver = null;
  ctx.liver = () => {
    if (liver) return liver;
    const t0 = Date.now();
    const conceptEl = new Set();
    for (const f of ['isa_element_parts.txt', 'partof_element_parts.txt']) {
      for (const line of fs.readFileSync(`${dir}/${f}`, 'utf8').split('\n')) {
        const p = line.split('\t');
        if (p[0] === 'FMA7197' && p[2]) conceptEl.add(p[2].trim());
      }
    }
    const tree = [];
    for (const fj of conceptEl) {
      const m = loadElement(dir, fj);
      if (m) for (let i = 0; i < m.pos.length; i += 6) tree.push([m.pos[i], m.pos[i + 1], m.pos[i + 2]]);
    }
    const tb = bbox({ pos: Float32Array.from(tree.flat()) });
    const STEP = 3.5; const PAD = 30;
    const x0 = tb.min[0] - PAD; const y0 = tb.min[1] - PAD; const z0 = tb.min[2] - PAD;
    const nx = Math.ceil((tb.size[0] + 2 * PAD) / STEP); const ny = Math.ceil((tb.size[1] + 2 * PAD) / STEP); const nz = Math.ceil((tb.size[2] + 2 * PAD) / STEP);
    const f = new Float32Array(nx * ny * nz);
    const R = 20; const rv = Math.ceil(R / STEP);
    for (const p of tree) {
      const ci = Math.round((p[0] - x0) / STEP); const cj = Math.round((p[1] - y0) / STEP); const ck = Math.round((p[2] - z0) / STEP);
      for (let dk = -rv; dk <= rv; dk += 1) for (let dj = -rv; dj <= rv; dj += 1) for (let di = -rv; di <= rv; di += 1) {
        if ((di * di + dj * dj + dk * dk) * STEP * STEP > R * R) continue;
        const i = ci + di; const j = cj + dj; const k = ck + dk;
        if (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) continue;
        f[i + nx * (j + ny * k)] = 1;
      }
    }
    // Bajo el diafragma y sin pisar vesícula, estómago ni riñón.
    const dia = get([/^diaphragm$/i]);
    const dg = new Map();
    for (let i = 0; i < dia.pos.length; i += 3) {
      const key = `${Math.round(dia.pos[i] / 8)},${Math.round(dia.pos[i + 1] / 8)}`;
      dg.set(key, Math.max(dg.get(key) ?? -Infinity, dia.pos[i + 2]));
    }
    const ptsOf = (m) => { const o = []; for (let i = 0; i < m.pos.length; i += 3) o.push([m.pos[i], m.pos[i + 1], m.pos[i + 2]]); return o; };
    const gb = ptsOf(get([/^gallbladder$/i]));
    const avoid = [gb.concat(gb.map((p) => [p[0], p[1] - 80, p[2]])), ptsOf(get([/^stomach$/i])), ptsOf(get([/^right kidney$/i]))];
    const hulls = new Map();
    const hullAt = (k, z) => {
      if (!hulls.has(k)) hulls.set(k, avoid.map((pl) => hull2(pl.filter((p) => Math.abs(p[2] - z) < 4).map((p) => [p[0], p[1]]))));
      return hulls.get(k);
    };
    blur3(f, [nx, ny, nz], 2, 3);
    for (let k = 0; k < nz; k += 1) {
      const z = z0 + k * STEP;
      const hs = hullAt(k, z);
      for (let j = 0; j < ny; j += 1) {
        const y = y0 + j * STEP;
        for (let i = 0; i < nx; i += 1) {
          const x = x0 + i * STEP;
          const n = i + nx * (j + ny * k);
          if (!f[n]) continue;
          const dz = dg.get(`${Math.round(x / 8)},${Math.round(y / 8)}`);
          if (dz !== undefined && z > dz - 4) { f[n] = 0; continue; }
          if (hs.some((h) => inHull(h, x, y, 3))) f[n] = 0;
        }
      }
    }
    blur3(f, [nx, ny, nz], 1, 1);
    liver = smoothRegion(keepLargest(surfaceNets(f, [nx, ny, nz], [x0, y0, z0], STEP, 0.42), 0.3), () => true, 12);
    console.log(`  · hígado reconstruido en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    return liver;
  };

  /* ───── nervios periféricos (tubos por puntos de referencia) ───── */
  ctx.nerve = (name) => {
    const l = ctx.landmarks();
    const both = (fn) => mergeMeshes(['R', 'L'].map((s) => fn(s, s === 'R' ? -1 : 1)));
    const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const off = (p, dx = 0, dy = 0, dz = 0) => [p[0] + dx, p[1] + dy, p[2] + dz];
    const cord = l.cord;
    const zAt = (frac) => cord.min[2] + (cord.max[2] - cord.min[2]) * frac;
    switch (name) {
      case 'raquideos': {
        const parts = [];
        const n = 31;
        for (let i = 0; i < n; i += 1) {
          const z = l.headTop[2] - 210 - i * ((l.headTop[2] - 210 - (l.sacrumApex[2] + 20)) / n);
          for (const sx of [-1, 1]) {
            const lean = i > 24 ? 0.6 : 0.15;
            parts.push(tube([[sx * 4, cord.center[1], z], [sx * 22, cord.center[1] - 4, z - 6 - lean * 18], [sx * 40, cord.center[1] - 10, z - 14 - lean * 40]], 2.2, { sides: 8, steps: 4 }));
          }
        }
        return mergeMeshes(parts);
      }
      case 'plexo': return both((s, sx) => {
        const root = [sx * 20, cord.center[1], zAt(0.86)];
        const ax = off(l[`shoulder${s}`], -sx * 30, -10, -40);
        return mergeMeshes([0, 1, 2].map((k) => tube([off(root, 0, 0, -k * 12), mix(off(root, 0, -10, -k * 12), ax, 0.5), ax], 3.2, { sides: 8 })));
      });
      case 'mediano': return both((s, sx) => {
        const ax = off(l[`shoulder${s}`], -sx * 26, -12, -60);
        return tube([ax, off(mix(l[`shoulder${s}`], l[`elbow${s}`], 0.55), -sx * 14, -18), off(l[`elbow${s}`], -sx * 6, -22), off(mix(l[`elbow${s}`], l[`wrist${s}`], 0.5), -sx * 2, -14), off(l[`wrist${s}`], 0, -10), off(l[`hand${s}`], sx * 4, -6, 60)], 3.6, { sides: 10 });
      });
      case 'cubital': return both((s, sx) => {
        const ax = off(l[`shoulder${s}`], -sx * 30, -4, -64);
        return tube([ax, off(mix(l[`shoulder${s}`], l[`elbow${s}`], 0.6), -sx * 22, 6), off(l[`medEpi${s}`], 0, 10), off(mix(l[`elbow${s}`], l[`wrist${s}`], 0.5), -sx * 18, -2), off(l[`wrist${s}`], -sx * 20, -6), off(l[`hand${s}`], -sx * 22, -4, 40)], 3.2, { sides: 10 });
      });
      case 'radial': return both((s, sx) => {
        const ax = off(l[`shoulder${s}`], -sx * 24, 6, -60);
        return tube([ax, off(mix(l[`shoulder${s}`], l[`elbow${s}`], 0.4), -sx * 4, 26), off(mix(l[`shoulder${s}`], l[`elbow${s}`], 0.75), sx * 18, 10), off(l[`elbow${s}`], sx * 22, -10), off(mix(l[`elbow${s}`], l[`wrist${s}`], 0.6), sx * 16, -10), off(l[`wrist${s}`], sx * 16, -6)], 3.2, { sides: 10 });
      });
      case 'femoral': return both((s, sx) => {
        const top = [sx * 40, cord.center[1] - 30, l[`iliac${s}`][2] - 10];
        const ing = off(l[`hip${s}`], sx * 8, -48, 30);
        const k = l[`knee${s}`];
        return mergeMeshes([
          tube([top, off(mix(top, ing, 0.5), sx * 10, -20), ing, off(mix(l[`hip${s}`], k, 0.3), sx * 4, -50)], 3.6, { sides: 10 }),
          tube([off(mix(l[`hip${s}`], k, 0.2), sx * 2, -48), off(mix(l[`hip${s}`], k, 0.7), -sx * 26, -18), off(k, -sx * 34, 0), off(mix(k, l[`ankle${s}`], 0.6), -sx * 26, -6), off(l[`ankle${s}`], -sx * 22, -10)], 2.2, { sides: 8 }),
        ]);
      });
      case 'ciatico': return both((s, sx) => {
        const top = [sx * 30, l.sacrumApex[1] - 10, l.sacrumApex[2] + 40];
        const k = l[`knee${s}`];
        return tube([top, off(l[`hip${s}`], -sx * 10, 52, -30), off(mix(l[`hip${s}`], k, 0.45), 0, 48), off(mix(l[`hip${s}`], k, 0.85), 0, 42)], 6, { sides: 12 });
      });
      case 'tibial': return both((s, sx) => {
        const k = l[`knee${s}`];
        return tube([off(mix(l[`hip${s}`], k, 0.85), 0, 42), off(k, 0, 38, -20), off(mix(k, l[`ankle${s}`], 0.5), -sx * 4, 34), off(l[`ankle${s}`], -sx * 20, 22), off(l[`heel${s}`], -sx * 16, -30, -14)], 4, { sides: 10 });
      });
      case 'peroneo': return both((s, sx) => {
        const k = l[`knee${s}`];
        const fh = l[`fibHead${s}`];
        return tube([off(mix(l[`hip${s}`], k, 0.85), 0, 42), off(k, sx * 30, 26, -16), off(fh, sx * 8, 4, -10), off(fh, sx * 4, -16, -40), off(mix(k, l[`ankle${s}`], 0.6), sx * 10, -20), off(l[`ankle${s}`], sx * 4, -26), off(l[`toe${s}`], -sx * 6, 30, 26)], 3, { sides: 10 });
      });
      case 'vago': return both((s, sx) => {
        const st = [sx * 14, cord.center[1] - 22, l.chin[2] + 18];
        return tube([st, [sx * 26, l.trachea.center[1] + 4, l.thyroidCart[2]], [sx * 24, l.trachea.center[1] + 6, l.jugular[2] - 10], [sx * 16, l.trachea.center[1] + 20, l.jugular[2] - 90], [sx * 10, l.trachea.center[1] + 26, l.xiphoid[2] + 10], [sx * 6 + 18, l.trachea.center[1] + 10, l.xiphoid[2] - 50]], 2.6, { sides: 8 });
      });
      case 'intercostales': {
        const parts = [];
        const ribs = names.filter((e) => /^(left|right) (third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) rib$/i.test(e.n));
        for (const r of ribs) {
          const m = loadElement(dir, r.fj);
          const b = bbox(m);
          // Puntos a lo largo del borde inferior de la costilla, por ángulo alrededor del eje vertical.
          const sx = /^right/i.test(r.n) ? -1 : 1;
          const buckets = new Map();
          for (let i = 0; i < m.pos.length; i += 3) {
            const p = [m.pos[i], m.pos[i + 1], m.pos[i + 2]];
            const ang = Math.round(Math.atan2(p[1] - b.center[1], Math.abs(p[0])) * 8);
            const cur = buckets.get(ang);
            if (!cur || p[2] < cur[2]) buckets.set(ang, p);
          }
          const pts = [...buckets.entries()].sort((a, c) => a[0] - c[0]).map(([, p]) => [p[0], p[1], p[2] - 3]);
          if (pts.length >= 3) parts.push(tube(pts, 1.8, { sides: 6, steps: 3 }));
          void sx;
        }
        return mergeMeshes(parts);
      }
      default: throw new Error(`Nervio desconocido: ${name}`);
    }
  };

  /* ───── músculos que el modelo no trae (láminas sobre la piel) ───── */
  // Los bordes de una lámina salen en dientes de sierra (triángulos enteros de la
  // piel): se quitan los picos, triángulos que tocan la lámina por un lado o ninguno.
  const pruneSpikes = (m, passes = 3) => {
    let idx = m.idx;
    for (let p = 0; p < passes; p += 1) {
      const edges = new Map();
      const key = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`);
      for (let t = 0; t < idx.length; t += 3) {
        for (const [a, b] of [[idx[t], idx[t + 1]], [idx[t + 1], idx[t + 2]], [idx[t + 2], idx[t]]]) edges.set(key(a, b), (edges.get(key(a, b)) || 0) + 1);
      }
      const keep = [];
      for (let t = 0; t < idx.length; t += 3) {
        const shared = [[idx[t], idx[t + 1]], [idx[t + 1], idx[t + 2]], [idx[t + 2], idx[t]]].filter(([a, b]) => edges.get(key(a, b)) > 1).length;
        if (shared >= 2) keep.push(idx[t], idx[t + 1], idx[t + 2]);
      }
      if (keep.length === idx.length) break;
      idx = new Uint32Array(keep);
    }
    return { pos: m.pos, idx };
  };
  ctx.patch = (name) => pruneSpikes(rawPatch(name));
  const rawPatch = (name) => {
    const l = ctx.landmarks();
    const s = ctx.skin();
    const inPoly = (pt, poly) => {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const [xi, zi] = poly[i]; const [xj, zj] = poly[j];
        if ((zi > pt[1]) !== (zj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - zi)) / (zj - zi) + xi) inside = !inside;
      }
      return inside;
    };
    switch (name) {
      case 'dorsal-ancho': {
        const polys = ['R', 'L'].map((S) => {
          const sx = S === 'R' ? -1 : 1;
          const ang = l[`scapAngle${S}`];
          const sh = l[`shoulder${S}`];
          const il = l[`iliac${S}`];
          return [[sx * 4, ang[2] + 10], [sx * 4, il[2] - 40], [il[0] * 0.75, il[2] - 6], [il[0] * 1.05, il[2] + 40], [sh[0] - sx * 20, sh[2] - 150], [sh[0] - sx * 26, sh[2] - 70], [ang[0] - sx * 4, ang[2] + 4]];
        });
        // (la piel trae triángulos con el giro cambiado: sin el límite en y, la
        // lámina se cuela también por delante del tronco, que se ve de perfil)
        return surfacePatch(s, (c, n) => n[1] > 0.15 && c[1] > -130 && polys.some((p) => inPoly([c[0], c[2]], p)), 3.5);
      }
      case 'frontal-m': {
        const zTop = l.headTop[2] - 26; const zLow = l.eyeR[2] + 22;
        return surfacePatch(s, (c, n) => n[1] < -0.45 && c[1] < -60 && c[2] > zLow && c[2] < zTop && Math.abs(c[0]) < 56, 2.5);
      }
      case 'temporal-m': {
        const zLow = l.eyeR[2] - 6; const zTop = l.headTop[2] - 42;
        const yc = (l.earBox.min[1] + l.earBox.max[1]) / 2;
        return surfacePatch(s, (c, n) => Math.abs(n[0]) > 0.5 && c[2] > zLow && c[2] < zTop && c[1] < yc + 10 && c[1] > yc - 70 && (c[2] - zLow) < 70 - Math.abs(c[1] - (yc - 30)) * 0.4, 3);
      }
      case 'masetero': {
        const m = l.mandBox;
        const yc = (l.earBox.min[1] + l.earBox.max[1]) / 2;
        return surfacePatch(s, (c, n) => Math.abs(n[0]) > 0.35 && c[2] > m.min[2] + 10 && c[2] < l.eyeR[2] - 18 && c[1] < yc - 6 && c[1] > yc - 52 && Math.abs(c[0]) > 38, 3);
      }
      case 'orbicular-ojos': {
        const ring = (e) => (c) => {
          const dx = (c[0] - e[0]) / 27; const dz = (c[2] - e[2]) / 21;
          const r = dx * dx + dz * dz;
          const ix = (c[0] - e[0]) / 15; const iz = (c[2] - e[2]) / 7;
          return r < 1 && ix * ix + iz * iz > 1;
        };
        const a = ring(l.eyeR); const b = ring(l.eyeL);
        return surfacePatch(s, (c, n) => n[1] < -0.3 && c[1] < -100 && (a(c) || b(c)), 2);
      }
      case 'orbicular-labios': {
        const e = l.lip;
        return surfacePatch(s, (c, n) => {
          const dx = (c[0] - e[0]) / 31; const dz = (c[2] - e[2]) / 19;
          const ix = (c[0] - e[0]) / 22; const iz = (c[2] - e[2]) / 4;
          return n[1] < -0.3 && c[1] < -100 && dx * dx + dz * dz < 1 && ix * ix + iz * iz > 1;
        }, 2);
      }
      default: throw new Error(`Lámina muscular desconocida: ${name}`);
    }
  };

  // Paredes de los ventrículos (una sola pieza en el modelo): cada triángulo va
  // con la cavidad más cercana.
  let walls = null;
  ctx.heartWalls = () => {
    if (walls) return walls;
    const wall = get([/^wall of ventricle$/i]);
    const cav = { d: get([/^cavity of right ventricle$/i]), i: get([/^cavity of left ventricle$/i]) };
    const CELL = 8; const grid = new Map();
    for (const [side, m] of Object.entries(cav)) {
      for (let i = 0; i < m.pos.length; i += 3) {
        const key = `${Math.floor(m.pos[i] / CELL)},${Math.floor(m.pos[i + 1] / CELL)},${Math.floor(m.pos[i + 2] / CELL)}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push([m.pos[i], m.pos[i + 1], m.pos[i + 2], side]);
      }
    }
    const near = (p) => {
      for (let r = 0; r < 8; r += 1) {
        let best = Infinity; let bs = null;
        const cx = Math.floor(p[0] / CELL); const cy = Math.floor(p[1] / CELL); const cz = Math.floor(p[2] / CELL);
        for (let dx = -r; dx <= r; dx += 1) for (let dy = -r; dy <= r; dy += 1) for (let dz = -r; dz <= r; dz += 1) {
          for (const q of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) || []) {
            const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
            if (d < best) { best = d; bs = q[3]; }
          }
        }
        if (bs) return bs;
      }
      return 'i';
    };
    const [d, i] = splitMesh(wall, (c) => near(c) === 'd');
    walls = { d, i };
    return walls;
  };

  // Recto del abdomen = parte medial de la vaina que el modelo une al oblicuo externo.
  ctx.splitOblique = () => {
    const raw = get([/^(left|right) external oblique$/i]);
    // La malla trae triángulos con el giro mezclado: se orientan todos hacia
    // fuera del eje vertical del cuerpo (pared abdominal).
    const yc = -100;
    const idx = new Uint32Array(raw.idx);
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3; const b = idx[t + 1] * 3; const c = idx[t + 2] * 3;
      const P = raw.pos;
      const ux = P[b] - P[a]; const uy = P[b + 1] - P[a + 1]; const uz = P[b + 2] - P[a + 2];
      const vx = P[c] - P[a]; const vy = P[c + 1] - P[a + 1]; const vz = P[c + 2] - P[a + 2];
      const nx = uy * vz - uz * vy; const ny = uz * vx - ux * vz;
      const cx = (P[a] + P[b] + P[c]) / 3; const cy = (P[a + 1] + P[b + 1] + P[c + 1]) / 3;
      if (nx * cx + ny * (cy - yc) < 0) { const tmp = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = tmp; }
    }
    const m = { pos: raw.pos, idx };
    const [rectus, oblique] = splitMesh(m, (c) => Math.abs(c[0]) < 78 && c[1] < -60);
    return { rectus, oblique };
  };

  ctx.discs = () => {
    const l = ctx.landmarks();
    const v = Object.values(l.vertebrae).sort((a, b) => b.center[2] - a.center[2]);
    const parts = [];
    for (let i = 0; i + 1 < v.length; i += 1) {
      const a = v[i]; const b = v[i + 1];
      const gap = a.min[2] - b.max[2];
      const z = (a.min[2] + b.max[2]) / 2;
      const y = Math.min(a.min[1], b.min[1]) + Math.min(a.size[1], b.size[1]) * 0.22;
      const r = Math.min(a.size[0], b.size[0]) * 0.22;
      parts.push(ellipsoid([0, y, z], [r, r * 0.8, Math.max(3, gap * 0.9 + 2)], { seg: 16, ring: 8 }));
    }
    return mergeMeshes(parts);
  };

  ctx.vec = vec;
  return ctx;
}
