// src/apps/la-fortaleza/render3d.js
// Renderer 3D procedural con three.js: terreno low-poly, camino, fortaleza,
// torres geométricas, enemigos-blob (icosaedro deformado por semilla),
// etiquetas de palabra como sprites de canvas, partículas y habilidades.
// Nada de imágenes ni modelos externos: todo generado en runtime.

import * as THREE from 'three';
import {
  GRID, WORLD, TOWER_TYPES, towerRange, mulberry32, pointAtDistance, ABILITIES,
} from './engine';

// Mapeo campo 2D (960x540 px) → mundo 3D (16x9 unidades, Y arriba)
const U = 1 / GRID.cell;
const fx = (x) => (x - WORLD.w / 2) * U;
const fz = (y) => (y - WORLD.h / 2) * U;
const toField = (X, Z) => ({ x: X / U + WORLD.w / 2, y: Z / U + WORLD.h / 2 });

const COL = {
  sky: 0x16133a,
  groundA: new THREE.Color('#1d7a45'),
  groundB: new THREE.Color('#0f4d2d'),
  path: 0x92703f,
  pathEdge: 0x3f2d1d,
  wall: 0x7c6f9f,
  wallDark: 0x4c4368,
};

// ---------------------------------------------------------------------------
// Sprites de texto (canvas → textura). Cache global por contenido.
// ---------------------------------------------------------------------------

function makeTextTexture(text, { font = 'bold 30px "Segoe UI", sans-serif', color = '#f8fafc', bg = null, pad = 10 } = {}) {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = 46;
  cv.width = w; cv.height = h;
  const c2 = cv.getContext('2d');
  if (bg) {
    c2.fillStyle = bg;
    c2.beginPath();
    c2.roundRect(0, 0, w, h, 12);
    c2.fill();
  }
  c2.font = font;
  c2.textAlign = 'center';
  c2.textBaseline = 'middle';
  c2.lineWidth = 5;
  c2.strokeStyle = 'rgba(0,0,0,0.7)';
  c2.strokeText(text, w / 2, h / 2);
  c2.fillStyle = color;
  c2.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: w / h };
}

// Etiqueta de enemigo: palabra + barra de vida, redibujada por buckets de HP
function drawEnemyLabel(cv, word, hpRatio, borderColor) {
  const ctx = cv.getContext('2d');
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  const w = Math.max(Math.ceil(ctx.measureText(word).width) + 26, 80);
  const h = 58;
  if (cv.width !== w) { cv.width = w; cv.height = h; }
  const c = cv.getContext('2d');
  c.clearRect(0, 0, w, h);
  c.fillStyle = 'rgba(10,14,30,0.88)';
  c.beginPath(); c.roundRect(0, 0, w, 42, 12); c.fill();
  if (borderColor) {
    c.strokeStyle = borderColor; c.lineWidth = 4;
    c.beginPath(); c.roundRect(2, 2, w - 4, 38, 10); c.stroke();
  }
  c.font = 'bold 30px "Segoe UI", sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#f8fafc';
  c.fillText(word, w / 2, 21);
  if (hpRatio < 1) {
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.beginPath(); c.roundRect(w * 0.1, 46, w * 0.8, 9, 4); c.fill();
    c.fillStyle = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.25 ? '#fbbf24' : '#ef4444';
    c.beginPath(); c.roundRect(w * 0.1, 46, w * 0.8 * Math.max(hpRatio, 0.02), 9, 4); c.fill();
  }
  return w / h;
}

// ---------------------------------------------------------------------------
// Escena
// ---------------------------------------------------------------------------

export function createScene3D(container, game) {
  const rng = mulberry32(game.seed ^ 0x3dfca7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.sky);
  scene.fog = new THREE.Fog(COL.sky, 22, 48);

  // --- cámara orbital ---
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
  const cam = { azimuth: Math.PI / 2, elevation: 0.92, distance: 13, target: new THREE.Vector3(0, 0, 0.4) };
  const applyCamera = () => {
    cam.elevation = THREE.MathUtils.clamp(cam.elevation, 0.35, 1.35);
    cam.distance = THREE.MathUtils.clamp(cam.distance, 6, 20);
    const ce = Math.cos(cam.elevation);
    camera.position.set(
      cam.target.x + cam.distance * ce * Math.cos(cam.azimuth),
      cam.target.y + cam.distance * Math.sin(cam.elevation),
      cam.target.z + cam.distance * ce * Math.sin(cam.azimuth),
    );
    camera.lookAt(cam.target);
  };
  applyCamera();

  // --- luces ---
  scene.add(new THREE.HemisphereLight(0x6a5fd0, 0x0a2540, 0.85));
  const moonLight = new THREE.DirectionalLight(0xb8c2ff, 1.6);
  moonLight.position.set(7, 12, -5);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.left = -11; moonLight.shadow.camera.right = 11;
  moonLight.shadow.camera.top = 8; moonLight.shadow.camera.bottom = -8;
  moonLight.shadow.bias = -0.002;
  scene.add(moonLight);
  const warmLight = new THREE.PointLight(0xffb347, 12, 8);
  scene.add(warmLight);

  // --- cielo: estrellas + luna ---
  {
    const starGeo = new THREE.BufferGeometry();
    const pos = [];
    for (let i = 0; i < 350; i++) {
      const a = rng() * Math.PI * 2, e = rng() * Math.PI * 0.45 + 0.08, r = 38 + rng() * 6;
      pos.push(r * Math.cos(e) * Math.cos(a), r * Math.sin(e), r * Math.cos(e) * Math.sin(a));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.85, fog: false })));
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xfde68a, fog: false }),
    );
    moon.position.set(-14, 16, -26);
    scene.add(moon);
  }

  // --- montañas lejanas low-poly ---
  {
    const mat = new THREE.MeshLambertMaterial({ color: 0x241f55, flatShading: true });
    for (let i = 0; i < 14; i++) {
      const a = rng() * Math.PI * 2;
      const d = 17 + rng() * 9;
      const m = new THREE.Mesh(new THREE.ConeGeometry(2 + rng() * 3.4, 2.5 + rng() * 4, 5), mat);
      m.position.set(Math.cos(a) * d, -0.3, Math.sin(a) * d);
      m.rotation.y = rng() * Math.PI;
      scene.add(m);
    }
  }

  // --- muestras del camino (para aplanar el terreno y construir la cinta) ---
  const pathPts = [];
  for (let d = 0; d <= game.map.totalLen; d += 8) {
    const p = pointAtDistance(game.map, d);
    pathPts.push({ X: fx(p.x), Z: fz(p.y), angle: p.angle });
  }

  // --- terreno low-poly con colores por vértice ---
  {
    const geo = new THREE.PlaneGeometry(26, 17, 52, 34);
    geo.rotateX(-Math.PI / 2);
    const posAttr = geo.attributes.position;
    const colors = [];
    for (let i = 0; i < posAttr.count; i++) {
      const X = posAttr.getX(i), Z = posAttr.getZ(i);
      let nearPath = false;
      for (const p of pathPts) {
        if ((X - p.X) * (X - p.X) + (Z - p.Z) * (Z - p.Z) < 0.81) { nearPath = true; break; }
      }
      const onField = Math.abs(X) < 8.4 && Math.abs(Z) < 4.8;
      const y = nearPath || onField ? (nearPath ? 0 : (rng() - 0.5) * 0.1) : (rng() - 0.5) * 0.55 + 0.1;
      posAttr.setY(i, y);
      const t = rng() * 0.7 + (onField ? 0 : 0.25);
      const col = COL.groundA.clone().lerp(COL.groundB, Math.min(t, 1));
      colors.push(col.r, col.g, col.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // --- camino: cinta de triángulos + bordes + guijarros ---
  {
    const mkRibbon = (halfW, y, color) => {
      const verts = [], idx = [];
      for (let i = 0; i < pathPts.length; i++) {
        const p = pathPts[i];
        const nx = -Math.sin(p.angle) * halfW, nz = Math.cos(p.angle) * halfW;
        verts.push(p.X - nx, y, p.Z - nz, p.X + nx, y, p.Z + nz);
        if (i > 0) {
          const b = i * 2;
          idx.push(b - 2, b - 1, b, b - 1, b + 1, b);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color }));
      m.receiveShadow = true;
      return m;
    };
    scene.add(mkRibbon(0.36, 0.015, COL.pathEdge));
    scene.add(mkRibbon(0.29, 0.025, COL.path));
    // guijarros del centro
    const pebbleGeo = new THREE.SphereGeometry(0.035, 6, 5);
    const pebbleMat = new THREE.MeshBasicMaterial({ color: 0xffe7aa, transparent: true, opacity: 0.5 });
    for (let d = 12; d < game.map.totalLen - 6; d += 42) {
      const p = pointAtDistance(game.map, d);
      const m = new THREE.Mesh(pebbleGeo, pebbleMat);
      m.position.set(fx(p.x), 0.04, fz(p.y));
      scene.add(m);
    }
    // boca de cueva en el inicio
    const cave = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 10, 8, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color: 0x0b0f1e, flatShading: true }),
    );
    const start = pathPts[0];
    cave.position.set(start.X - 0.2, 0.1, start.Z);
    cave.rotation.y = Math.PI / 2;
    cave.scale.set(0.7, 1, 1);
    scene.add(cave);
  }

  // --- fortaleza (al final del camino) ---
  const fortress = new THREE.Group();
  let flagGeo = null;
  let fortWallMat = null;
  {
    const end = pathPts[Math.max(pathPts.length - 4, 0)];
    fortWallMat = new THREE.MeshLambertMaterial({ color: COL.wall, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: COL.wallDark, flatShading: true });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), fortWallMat);
    wall.position.y = 0.45;
    wall.castShadow = true;
    fortress.add(wall);
    for (const side of [-1, 1]) {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 1.5, 8), darkMat);
      tower.position.set(0, 0.75, side * 0.62);
      tower.castShadow = true;
      fortress.add(tower);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0xa855f7, flatShading: true }));
      roof.position.set(0, 1.75, side * 0.62);
      fortress.add(roof);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.18), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
      win.position.set(-0.31, 0.95, side * 0.62);
      win.rotation.y = -Math.PI / 2;
      fortress.add(win);
    }
    // almenas
    for (let i = -2; i <= 2; i++) {
      const cren = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), darkMat);
      cren.position.set(0, 0.98, i * 0.24);
      fortress.add(cren);
    }
    // puerta
    const door = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 10, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: 0x14101f }));
    door.rotation.z = Math.PI / 2;
    door.rotation.y = Math.PI / 2;
    door.position.set(-0.61, 0.3, 0);
    fortress.add(door);
    // mástil + bandera ondeante
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9), new THREE.MeshBasicMaterial({ color: 0xd1d5db }));
    pole.position.set(0, 1.35, 0);
    fortress.add(pole);
    flagGeo = new THREE.PlaneGeometry(0.5, 0.28, 8, 2);
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshLambertMaterial({ color: 0xa855f7, side: THREE.DoubleSide }));
    flag.position.set(0.27, 1.62, 0);
    fortress.add(flag);
    fortress.position.set(end.X + 0.3, 0, end.Z);
    scene.add(fortress);
    warmLight.position.set(end.X + 0.3, 1.2, end.Z);
  }

  // --- puntos de construcción (visibles al colocar) ---
  const gridGroup = new THREE.Group();
  {
    const dotGeo = new THREE.CircleGeometry(0.07, 10);
    dotGeo.rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    for (let c = 0; c < GRID.cols; c++) {
      for (let r = 0; r < GRID.rows; r++) {
        if (game.map.pathCells.has(`${c},${r}`)) continue;
        const m = new THREE.Mesh(dotGeo, dotMat);
        m.position.set(fx(c * GRID.cell + 30), 0.03, fz(r * GRID.cell + 30));
        gridGroup.add(m);
      }
    }
    gridGroup.visible = false;
    scene.add(gridGroup);
  }

  // --- grupos dinámicos ---
  const towerGroup = new THREE.Group(); scene.add(towerGroup);
  const enemyGroup = new THREE.Group(); scene.add(enemyGroup);
  const fxGroup = new THREE.Group(); scene.add(fxGroup);
  const towerMeshes = new Map();   // towerId -> group
  const enemyMeshes = new Map();   // enemyId -> {group, body, mat, label, labelCanvas, lastBucket, ring}
  const projMeshes = new Map();    // projId -> mesh

  // geometrías/materiales compartidos
  const shared = {
    base: new THREE.CylinderGeometry(0.3, 0.36, 0.16, 8),
    body: new THREE.CylinderGeometry(0.18, 0.23, 0.46, 8),
    core: new THREE.SphereGeometry(0.12, 10, 10),
    barrel: new THREE.BoxGeometry(0.36, 0.08, 0.08),
    pip: new THREE.SphereGeometry(0.045, 6, 6),
    projArrow: new THREE.ConeGeometry(0.05, 0.22, 6),
    projBall: new THREE.SphereGeometry(0.1, 8, 8),
    projSpark: new THREE.SphereGeometry(0.055, 6, 6),
    projIce: new THREE.OctahedronGeometry(0.09),
    ringGeo: new THREE.RingGeometry(0.92, 1, 40),
    baseMat: new THREE.MeshLambertMaterial({ color: 0x374151, flatShading: true }),
    bodyMat: new THREE.MeshLambertMaterial({ color: 0x4b5563, flatShading: true }),
    barrelMat: new THREE.MeshLambertMaterial({ color: 0x1f2937 }),
    pipMat: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    eyeWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    eyeDark: new THREE.MeshBasicMaterial({ color: 0x1f2937 }),
    crownMat: new THREE.MeshLambertMaterial({ color: 0xfbbf24 }),
  };
  shared.ringGeo.rotateX(-Math.PI / 2);

  // --- torres ---
  function towerColorHex(tw) {
    if (tw.type === 'hielo') return '#7dd3fc';
    if (tw.type === 'prisma') return '#c084fc';
    return game.categories[tw.catIdx].color;
  }

  function buildTowerMesh(tw) {
    const color = new THREE.Color(towerColorHex(tw));
    const g = new THREE.Group();
    const base = new THREE.Mesh(shared.base, shared.baseMat); base.position.y = 0.08; base.castShadow = true;
    const body = new THREE.Mesh(shared.body, shared.bodyMat); body.position.y = 0.4; body.castShadow = true;
    const coreMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: 0.4 });
    const core = new THREE.Mesh(shared.core, coreMat); core.position.y = 0.55;
    const barrelPivot = new THREE.Group(); barrelPivot.position.y = 0.62;
    const barrel = new THREE.Mesh(shared.barrel, shared.barrelMat); barrel.position.x = 0.2;
    barrelPivot.add(barrel);
    g.add(base, body, core, barrelPivot);

    // copete por tipo
    const topMat = new THREE.MeshLambertMaterial({ color, flatShading: true });
    let top = null;
    if (tw.type === 'arquero') top = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 6), topMat);
    else if (tw.type === 'rafaga') top = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2 }));
    else if (tw.type === 'canon') top = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshLambertMaterial({ color: 0x1f2937 }));
    else if (tw.type === 'hielo') {
      top = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const spike = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.04), topMat);
        spike.rotation.y = (i / 3) * Math.PI;
        top.add(spike);
      }
    } else if (tw.type === 'prisma') {
      const oct = new THREE.OctahedronGeometry(0.16);
      oct.scale(1, 1.7, 1);
      top = new THREE.Mesh(oct, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5, roughness: 0.3 }));
    }
    if (top) { top.position.y = 0.92; g.add(top); }

    const pips = [];
    for (let i = 0; i < 2; i++) {
      const pip = new THREE.Mesh(shared.pip, shared.pipMat);
      pip.position.set(-0.12 + i * 0.24, 0.2, 0.3);
      pip.visible = false;
      g.add(pip); pips.push(pip);
    }

    g.position.set(fx(tw.x), 0, fz(tw.y));
    g.userData = { towerId: tw.id, coreMat, barrelPivot, core, top, pips };
    return g;
  }

  // --- enemigos ---
  function buildEnemyMesh(e) {
    const radius = e.radius * U * 1.45;
    const geo = new THREE.IcosahedronGeometry(radius, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      const k = 0.85 + e.shape[(i * 7) % e.shape.length] * 0.28;
      v.multiplyScalar(k);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();

    const showColor = game.mode !== 'exam';
    const baseColor = showColor ? game.categories[e.catIdx].color : `hsl(${e.hue}, 24%, 52%)`;
    const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(baseColor), flatShading: true });
    const body = new THREE.Mesh(geo, mat);
    body.position.y = radius + 0.06;
    body.castShadow = true;

    // ojos
    const eyeR = Math.max(radius * 0.24, 0.05);
    for (const side of [-1, 1]) {
      const white = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 8, 8), shared.eyeWhite);
      white.position.set(radius * 0.7, radius * 0.25, side * radius * 0.4);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.5, 6, 6), shared.eyeDark);
      pupil.position.set(eyeR * 0.6, 0, 0);
      white.add(pupil);
      body.add(white);
    }
    // corona del jefe
    if (e.type === 'boss') {
      const crown = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), shared.crownMat);
        const a = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(a) * radius * 0.5, radius * 0.95, Math.sin(a) * radius * 0.5);
        crown.add(spike);
      }
      body.add(crown);
    }

    // anillo de clasificado (oculto hasta revelar)
    const ring = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
    ring.scale.setScalar(radius * 1.5);
    ring.position.y = 0.04;
    ring.visible = false;

    // etiqueta con la palabra + vida
    const labelCanvas = document.createElement('canvas');
    const aspect = drawEnemyLabel(labelCanvas, e.word, 1, null);
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    labelTex.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, depthTest: false, transparent: true }));
    const lh = e.type === 'boss' ? 0.62 : 0.5;
    label.scale.set(lh * aspect, lh, 1);
    label.position.y = radius * 2 + 0.55;

    const group = new THREE.Group();
    group.add(body, ring, label);
    group.userData = { enemyId: e.id };
    return { group, body, mat, geo, label, labelCanvas, labelTex, ring, lastBucket: 10, lastBorder: null, radius, baseColor: new THREE.Color(baseColor) };
  }

  // --- pool de anillos de FX y texturas de texto flotante ---
  const ringPool = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    m.visible = false; m.position.y = 0.05;
    fxGroup.add(m); ringPool.push(m);
  }
  const textTexCache = new Map();
  const textPool = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true, opacity: 0 }));
    s.visible = false;
    fxGroup.add(s); textPool.push(s);
  }
  let textCursor = 0;

  // --- chispas (Points con additive blending) ---
  const MAX_SPARKS = 700;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(MAX_SPARKS * 3);
  const sparkCol = new Float32Array(MAX_SPARKS * 3);
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.14, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  sparks.frustumCulled = false;
  scene.add(sparks);

  // --- rayos (habilidad): líneas dentadas ---
  const boltLines = [];

  // --- haz del prisma ---
  const beamMeshes = new Map(); // towerId -> mesh
  const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6, 1, true);
  beamGeo.translate(0, 0.5, 0);
  beamGeo.rotateX(Math.PI / 2); // apunta por +Z

  // --- indicadores: alcance, colocación, habilidad ---
  const rangeRing = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
  rangeRing.position.y = 0.04; rangeRing.visible = false;
  scene.add(rangeRing);
  const placeGhost = new THREE.Group();
  {
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.92), new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.35 }));
    cell.position.y = 0.03;
    const ring = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }));
    ring.position.y = 0.05;
    placeGhost.add(cell, ring);
    placeGhost.visible = false;
    placeGhost.userData = { cell, ring };
    scene.add(placeGhost);
  }
  const abilityGhost = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.6 }));
  abilityGhost.position.y = 0.05; abilityGhost.visible = false;
  scene.add(abilityGhost);

  // ---------------------------------------------------------------------------
  // Picking
  // ---------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();
  const hitPoint = new THREE.Vector3();

  function pick(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);

    const eHits = raycaster.intersectObjects(enemyGroup.children, true);
    if (eHits.length) {
      let o = eHits[0].object;
      while (o && o.userData.enemyId == null) o = o.parent;
      if (o) return { kind: 'enemy', enemyId: o.userData.enemyId };
    }
    const tHits = raycaster.intersectObjects(towerGroup.children, true);
    if (tHits.length) {
      let o = tHits[0].object;
      while (o && o.userData.towerId == null) o = o.parent;
      if (o) return { kind: 'tower', towerId: o.userData.towerId };
    }
    if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
      const f = toField(hitPoint.x, hitPoint.z);
      return {
        kind: 'ground',
        field: f,
        cell: [Math.floor(f.x / GRID.cell), Math.floor(f.y / GRID.cell)],
      };
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Sincronización por frame
  // ---------------------------------------------------------------------------

  function syncTowers(ui) {
    for (const tw of game.towers) {
      let mesh = towerMeshes.get(tw.id);
      if (!mesh) {
        mesh = buildTowerMesh(tw);
        towerMeshes.set(tw.id, mesh);
        towerGroup.add(mesh);
      }
      const { coreMat, barrelPivot, core, pips } = mesh.userData;
      barrelPivot.rotation.y = -tw.aim;
      const type = TOWER_TYPES[tw.type];
      const jammed = type.needsCategory && game.time < game.jams[tw.catIdx];
      const pulse = 1.3 + Math.sin(game.time * 4 + tw.id) * 0.5;
      coreMat.emissiveIntensity = jammed ? 0.15 : (tw.flash > 0 ? 2.6 : pulse);
      core.scale.setScalar(tw.flash > 0 ? 1.35 : 1);
      if (mesh.userData.top) mesh.userData.top.rotation.y = game.time * (tw.type === 'prisma' || tw.type === 'rafaga' ? 1.6 : 0.4);
      pips[0].visible = tw.level >= 2;
      pips[1].visible = tw.level >= 3;

      // haz del prisma
      if (tw.beam) {
        let beam = beamMeshes.get(tw.id);
        if (!beam) {
          beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xe9b8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
          beamMeshes.set(tw.id, beam);
          fxGroup.add(beam);
        }
        const from = new THREE.Vector3(fx(tw.x), 0.62, fz(tw.y));
        const to = new THREE.Vector3(fx(tw.beam.x), 0.3, fz(tw.beam.y));
        beam.position.copy(from);
        beam.lookAt(to);
        beam.scale.set(1, 1, from.distanceTo(to));
        beam.material.opacity = Math.max(tw.beam.life / 0.12, 0);
        beam.visible = true;
      } else {
        const beam = beamMeshes.get(tw.id);
        if (beam) beam.visible = false;
      }
    }
    // torres vendidas
    for (const [id, mesh] of towerMeshes) {
      if (!game.towers.some((t) => t.id === id)) {
        towerGroup.remove(mesh);
        const beam = beamMeshes.get(id);
        if (beam) { fxGroup.remove(beam); beamMeshes.delete(id); }
        towerMeshes.delete(id);
      }
    }
    // anillo de alcance de la torre seleccionada
    const sel = ui.selectedTowerId ? game.towers.find((t) => t.id === ui.selectedTowerId) : null;
    rangeRing.visible = !!sel;
    if (sel) {
      rangeRing.position.set(fx(sel.x), 0.04, fz(sel.y));
      rangeRing.scale.setScalar(towerRange(sel) * U);
    }
  }

  function syncEnemies() {
    const alive = new Set();
    for (const e of game.enemies) {
      if (e.hp <= 0) continue;
      alive.add(e.id);
      let m = enemyMeshes.get(e.id);
      if (!m) {
        m = buildEnemyMesh(e);
        enemyMeshes.set(e.id, m);
        enemyGroup.add(m.group);
      }
      m.group.position.set(fx(e.x), 0, fz(e.y));
      m.body.rotation.y = -e.angle;
      const squash = 1 + Math.sin(game.time * 7 + e.phase) * 0.07;
      m.body.scale.set(1, squash, 1);
      m.body.position.y = m.radius + 0.06 + Math.abs(Math.sin(game.time * 7 + e.phase)) * 0.05;

      // color: flash de daño / ralentizado / revelado
      const slowed = game.time < e.slowUntil;
      if (e.hitFlash > 0) m.mat.color.setHex(0xffffff);
      else if (slowed) m.mat.color.copy(m.baseColor).lerp(new THREE.Color(0x7dd3fc), 0.55);
      else if (e.enraged) m.mat.color.copy(m.baseColor).lerp(new THREE.Color(0xef4444), 0.4);
      else m.mat.color.copy(m.baseColor);

      // anillo de categoría al revelar
      if (e.revealed && !m.ring.visible) {
        m.ring.visible = true;
        m.ring.material.color.set(game.categories[e.catIdx].color);
      }

      // etiqueta: redibujar solo cuando cambia el bucket de vida o el borde
      const bucket = Math.ceil((e.hp / e.maxHp) * 10);
      const border = e.revealed ? game.categories[e.catIdx].color : (e.classified ? '#94a3b8' : null);
      if (bucket !== m.lastBucket || border !== m.lastBorder) {
        m.lastBucket = bucket; m.lastBorder = border;
        const aspect = drawEnemyLabel(m.labelCanvas, e.word, e.hp / e.maxHp, border);
        m.labelTex.needsUpdate = true;
        const lh = e.type === 'boss' ? 0.62 : 0.5;
        m.label.scale.set(lh * aspect, lh, 1);
      }
    }
    for (const [id, m] of enemyMeshes) {
      if (!alive.has(id)) {
        enemyGroup.remove(m.group);
        m.geo.dispose(); m.mat.dispose(); m.labelTex.dispose(); m.label.material.dispose();
        enemyMeshes.delete(id);
      }
    }
  }

  function syncProjectiles() {
    const alive = new Set();
    for (const pr of game.projectiles) {
      alive.add(pr.id);
      let mesh = projMeshes.get(pr.id);
      if (!mesh) {
        if (pr.type === 'arquero') mesh = new THREE.Mesh(shared.projArrow, new THREE.MeshBasicMaterial({ color: 0xfde68a }));
        else if (pr.type === 'rafaga') mesh = new THREE.Mesh(shared.projSpark, new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        else if (pr.type === 'canon') mesh = new THREE.Mesh(shared.projBall, new THREE.MeshLambertMaterial({ color: 0x1f2937 }));
        else mesh = new THREE.Mesh(shared.projIce, new THREE.MeshBasicMaterial({ color: 0xbae6fd }));
        projMeshes.set(pr.id, mesh);
        fxGroup.add(mesh);
      }
      mesh.position.set(fx(pr.x), 0.45, fz(pr.y));
      if (pr.type === 'arquero') {
        mesh.rotation.z = Math.PI / 2 + 0; // base
        mesh.rotation.y = -(pr.angle || 0);
        mesh.rotation.z = -Math.PI / 2;
        mesh.rotation.order = 'YZX';
      } else if (pr.type === 'hielo') {
        mesh.rotation.y = game.time * 6;
      }
    }
    for (const [id, mesh] of projMeshes) {
      if (!alive.has(id)) {
        fxGroup.remove(mesh);
        mesh.material.dispose();
        projMeshes.delete(id);
      }
    }
  }

  function getTextSprite(p) {
    const key = `${p.text}|${p.color}`;
    let entry = textTexCache.get(key);
    if (!entry) {
      entry = makeTextTexture(p.text, { color: p.color });
      textTexCache.set(key, entry);
    }
    const s = textPool[textCursor % textPool.length];
    textCursor++;
    s.material.map = entry.tex;
    s.material.needsUpdate = true;
    s.userData.aspect = entry.aspect;
    return s;
  }

  function syncParticles() {
    let si = 0;
    let ringI = 0;
    const usedTexts = new Set();
    const tmpColor = new THREE.Color();

    for (const p of game.particles) {
      const a = Math.max(p.life / p.maxLife, 0);
      if (p.kind === 'spark' && si < MAX_SPARKS) {
        sparkPos[si * 3] = fx(p.x);
        sparkPos[si * 3 + 1] = 0.25 + (1 - a) * 0.5;
        sparkPos[si * 3 + 2] = fz(p.y);
        tmpColor.set(p.color).multiplyScalar(a);
        sparkCol[si * 3] = tmpColor.r; sparkCol[si * 3 + 1] = tmpColor.g; sparkCol[si * 3 + 2] = tmpColor.b;
        si++;
      } else if (p.kind === 'ring' && ringI < ringPool.length) {
        const r = ringPool[ringI++];
        r.visible = true;
        r.position.set(fx(p.x), 0.05, fz(p.y));
        r.scale.setScalar(Math.max(p.size * U * (1 - a) + 0.2, 0.05));
        r.material.color.set(p.color);
        r.material.opacity = a;
      } else if (p.kind === 'text') {
        if (!p._sprite || p._sprite.userData.owner !== p) {
          p._sprite = getTextSprite(p);
          p._sprite.userData.owner = p;
        }
        const s = p._sprite;
        usedTexts.add(s);
        s.visible = true;
        s.position.set(fx(p.x), 0.9 + (1 - a) * 0.8, fz(p.y));
        const h = 0.42;
        s.scale.set(h * s.userData.aspect, h, 1);
        s.material.opacity = Math.min(a * 1.6, 1);
      } else if (p.kind === 'bolt') {
        if (!p._bolt) {
          const pts = [];
          let bx = fx(p.x), bz = fz(p.y);
          let y = 7;
          while (y > 0.2) {
            pts.push(new THREE.Vector3(bx + (Math.random() - 0.5) * 0.5, y, bz + (Math.random() - 0.5) * 0.5));
            y -= 0.8;
          }
          pts.push(new THREE.Vector3(fx(p.x), 0.3, fz(p.y)));
          const g = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xfde047, transparent: true, linewidth: 2 }));
          p._bolt = line;
          boltLines.push(line);
          fxGroup.add(line);
        }
        p._bolt.material.opacity = a;
      }
    }
    // limpiar rayos muertos
    for (let i = boltLines.length - 1; i >= 0; i--) {
      const line = boltLines[i];
      if (!game.particles.some((p) => p._bolt === line)) {
        fxGroup.remove(line);
        line.geometry.dispose(); line.material.dispose();
        boltLines.splice(i, 1);
      }
    }
    // ocultar sprites de texto no usados este frame
    for (const s of textPool) if (!usedTexts.has(s)) s.visible = false;
    for (let i = ringI; i < ringPool.length; i++) ringPool[i].visible = false;

    sparkGeo.setDrawRange(0, si);
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;
  }

  function syncFortress() {
    const ratio = game.lives / 10;
    fortWallMat.color.setHex(ratio > 0.6 ? COL.wall : ratio > 0.3 ? 0x9f6f6f : 0x9f4f4f);
    // bandera ondeante
    const pos = flagGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(game.time * 6 + x * 7) * 0.05 * (x + 0.25) * 2);
    }
    pos.needsUpdate = true;
    warmLight.intensity = 10 + Math.sin(game.time * 5) * 2.5;
  }

  function syncIndicators(ui) {
    gridGroup.visible = !!ui.placingType;
    placeGhost.visible = !!(ui.placingType && ui.hoverCell);
    if (placeGhost.visible) {
      const [c, r] = ui.hoverCell;
      placeGhost.position.set(fx(c * GRID.cell + 30), 0, fz(r * GRID.cell + 30));
      const col = ui.placingValid ? 0x4ade80 : 0xef4444;
      placeGhost.userData.cell.material.color.setHex(col);
      placeGhost.userData.ring.visible = !!ui.placingValid;
      if (ui.placingValid) placeGhost.userData.ring.scale.setScalar(TOWER_TYPES[ui.placingType].range * U);
    }
    abilityGhost.visible = !!(ui.aimingAbility && ui.hoverField);
    if (abilityGhost.visible) {
      const ab = ABILITIES[ui.aimingAbility];
      abilityGhost.position.set(fx(ui.hoverField.x), 0.05, fz(ui.hoverField.y));
      abilityGhost.scale.setScalar(ab.radius * U);
      abilityGhost.material.color.set(ui.aimingAbility === 'meteoro' ? 0xfb923c : ui.aimingAbility === 'ventisca' ? 0xbae6fd : 0xfde047);
    }
  }

  function render(ui) {
    syncTowers(ui);
    syncEnemies();
    syncProjectiles();
    syncParticles();
    syncFortress();
    syncIndicators(ui);
    applyCamera();
    renderer.render(scene, camera);
  }

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function orbit(dx, dy) {
    cam.azimuth += dx * 0.005;
    cam.elevation += dy * 0.005;
  }
  function zoom(delta) {
    cam.distance *= delta > 0 ? 1.1 : 0.9;
  }

  function dispose() {
    renderer.dispose();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
    for (const { tex } of textTexCache.values()) tex.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { render, pick, resize, orbit, zoom, dispose };
}
