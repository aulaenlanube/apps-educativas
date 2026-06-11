// src/apps/la-fortaleza/render3d.js
// Renderer 3D procedural con three.js: terreno low-poly, camino, fortaleza,
// torres geométricas, enemigos-blob (icosaedro deformado por semilla),
// etiquetas de palabra como sprites de canvas, partículas y habilidades.
// Nada de imágenes ni modelos externos: todo generado en runtime.

import * as THREE from 'three';
import {
  GRID, WORLD, TOWER_TYPES, towerRange, mulberry32, pointAtDistance, ABILITIES, FORT_WALL_R,
} from './engine';

// Mapeo campo 2D (960x540 px) → mundo 3D (16x9 unidades, Y arriba)
const U = 1 / GRID.cell;
const fx = (x) => (x - WORLD.w / 2) * U;
const fz = (y) => (y - WORLD.h / 2) * U;
const toField = (X, Z) => ({ x: X / U + WORLD.w / 2, y: Z / U + WORLD.h / 2 });

// Paleta diurna vívida (estilo cartoon geométrico)
const COL = {
  sky: 0x53c8ff,
  groundA: new THREE.Color('#4ade80'),
  groundB: new THREE.Color('#16a34a'),
  tile: 0xffd166,
  tileEdge: 0xf59e0b,
  wall: 0xc4b5fd,
  wallDark: 0x8b5cf6,
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
  scene.fog = new THREE.Fog(COL.sky, 30, 95);

  // --- cámara orbital ---
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 220);
  const cam = { azimuth: Math.PI / 2, elevation: 0.92, distance: 13, target: new THREE.Vector3(0, 0, 0.4) };
  const applyCamera = () => {
    cam.elevation = THREE.MathUtils.clamp(cam.elevation, 0.35, 1.35);
    cam.distance = THREE.MathUtils.clamp(cam.distance, 6, 26);
    const ce = Math.cos(cam.elevation);
    camera.position.set(
      cam.target.x + cam.distance * ce * Math.cos(cam.azimuth),
      cam.target.y + cam.distance * Math.sin(cam.elevation),
      cam.target.z + cam.distance * ce * Math.sin(cam.azimuth),
    );
    camera.lookAt(cam.target);
  };
  applyCamera();

  // --- luces (día soleado) ---
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2dd4bf, 1.0));
  const sunLight = new THREE.DirectionalLight(0xfff3c4, 2.2);
  sunLight.position.set(7, 14, -5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -11; sunLight.shadow.camera.right = 11;
  sunLight.shadow.camera.top = 8; sunLight.shadow.camera.bottom = -8;
  sunLight.shadow.bias = -0.002;
  scene.add(sunLight);
  const warmLight = new THREE.PointLight(0xffb347, 8, 8);
  scene.add(warmLight);

  // --- cielo: sol + nubes geométricas ---
  {
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffe372, fog: false }),
    );
    sun.position.set(16, 18, -28);
    scene.add(sun);
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    for (let i = 0; i < 10; i++) {
      const cloud = new THREE.Group();
      const blocks = 2 + Math.floor(rng() * 3);
      for (let b = 0; b < blocks; b++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1.6 + rng() * 1.6, 0.5 + rng() * 0.4, 0.9 + rng() * 0.7), cloudMat);
        m.position.set(b * 1.1 - blocks * 0.5, rng() * 0.3, (rng() - 0.5) * 0.6);
        cloud.add(m);
      }
      const a = rng() * Math.PI * 2;
      const d = 16 + rng() * 14;
      cloud.position.set(Math.cos(a) * d, 7 + rng() * 6, Math.sin(a) * d);
      scene.add(cloud);
    }
  }

  // --- montañas lejanas que emergen del mar (siluetas tras la niebla) ---
  {
    const palettes = [0x60a5fa, 0x818cf8, 0x2dd4bf, 0x34d399];
    const snowMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true });
    for (let i = 0; i < 12; i++) {
      const a = rng() * Math.PI * 2;
      const d = 58 + rng() * 28;
      const h = 8 + rng() * 14;
      const rad = 5 + rng() * 9;
      const mat = new THREE.MeshLambertMaterial({ color: palettes[Math.floor(rng() * palettes.length)], flatShading: true });
      const m = new THREE.Mesh(new THREE.ConeGeometry(rad, h, 5 + Math.floor(rng() * 3)), mat);
      m.position.set(Math.cos(a) * d, h / 2 - 3, Math.sin(a) * d);
      m.rotation.y = rng() * Math.PI;
      scene.add(m);
      if (h > 14) {
        const snow = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.34, h * 0.3, 5), snowMat);
        snow.position.set(m.position.x, h - 3 - h * 0.15, m.position.z);
        snow.rotation.y = m.rotation.y;
        scene.add(snow);
      }
    }
  }

  // --- muestras de TODOS los caminos (terreno, decoración, marcas) ---
  const pathPts = [];
  for (const path of game.map.paths) {
    for (let d = 0; d <= path.totalLen; d += 8) {
      const p = pointAtDistance(path, d);
      pathPts.push({ X: fx(p.x), Z: fz(p.y), angle: p.angle });
    }
  }

  // --- relieve de la isla: altura compartida (terreno + decoración) ---
  // El tablero queda plano; alrededor suben colinas onduladas (ondas senoidales
  // con fase por semilla) que caen al mar en el borde. Las vaguadas que bajan
  // del nivel del mar forman lagos y calas con playa.
  const SEA_Y = -0.42;
  const ph = Array.from({ length: 6 }, () => rng() * Math.PI * 2);
  function terrainHeight(X, Z) {
    const field = Math.max(Math.abs(X) / 9.4, Math.abs(Z) / 5.8);
    const rim = THREE.MathUtils.smoothstep(field, 1, 2.4); // 0 = campo plano → 1 = colinas
    if (rim === 0) return 0;
    const n = Math.sin(X * 0.42 + ph[0]) * Math.cos(Z * 0.46 + ph[1]) * 0.9
      + Math.sin(X * 0.16 + ph[2]) * Math.sin(Z * 0.2 + ph[3]) * 1.5
      + Math.sin((X + Z) * 0.09 + ph[4]) * Math.cos((X - Z) * 0.07 + ph[5]) * 1.1;
    const coast = 1 - THREE.MathUtils.smoothstep(Math.hypot(X, Z), 38, 56);
    return rim * (1.3 + n) * 0.9 * coast - (1 - coast) * 4.2;
  }

  // --- terreno low-poly de la isla, con colores por altura ---
  {
    const geo = new THREE.PlaneGeometry(120, 120, 100, 100);
    geo.rotateX(-Math.PI / 2);
    const posAttr = geo.attributes.position;
    const colors = [];
    const sand = new THREE.Color('#fcd34d');
    const sandDeep = new THREE.Color('#b45309');
    const peak = new THREE.Color('#d9f99d');
    for (let i = 0; i < posAttr.count; i++) {
      const X = posAttr.getX(i), Z = posAttr.getZ(i);
      const onField = Math.abs(X) < 9.4 && Math.abs(Z) < 5.8;
      let y;
      if (onField) {
        let nearPath = false;
        for (const p of pathPts) {
          if ((X - p.X) * (X - p.X) + (Z - p.Z) * (Z - p.Z) < 0.81) { nearPath = true; break; }
        }
        y = nearPath ? 0 : (rng() - 0.5) * 0.1;
      } else {
        y = terrainHeight(X, Z) + (rng() - 0.5) * 0.18;
      }
      posAttr.setY(i, y);
      let col;
      if (y < SEA_Y + 0.18) {
        // playa que se hunde en fondo marino
        col = sand.clone().lerp(sandDeep, THREE.MathUtils.clamp((SEA_Y + 0.18 - y) / 2.4, 0, 1));
      } else {
        const t = rng() * 0.7 + (onField ? 0 : 0.25);
        col = COL.groundA.clone().lerp(COL.groundB, Math.min(t, 1));
        if (y > 1.7) col.lerp(peak, THREE.MathUtils.smoothstep(y, 1.7, 3.6) * 0.85);
      }
      colors.push(col.r, col.g, col.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // --- mar hasta el horizonte (marea suave en render) ---
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(360, 360),
    new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = SEA_Y;
  scene.add(sea);

  // --- camino: baldosas cuadradas (estilo geométrico, giros de 90°) ---
  const portals = []; // {pillarMat, darkMat, dark} por puerta (índice = pathId)
  {
    const edgeGeo = new THREE.BoxGeometry(1.0, 0.05, 1.0);
    const tileGeo = new THREE.BoxGeometry(0.88, 0.07, 0.88);
    const edgeMat = new THREE.MeshLambertMaterial({ color: COL.tileEdge, flatShading: true });
    const tileMat = new THREE.MeshLambertMaterial({ color: COL.tile, flatShading: true });
    for (const key of game.map.pathCells) {
      const [c, r] = key.split(',').map(Number);
      const X = fx(c * GRID.cell + GRID.cell / 2), Z = fz(r * GRID.cell + GRID.cell / 2);
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(X, 0.02, Z);
      edge.receiveShadow = true;
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.position.set(X, 0.05, Z);
      tile.receiveShadow = true;
      scene.add(edge, tile);
    }
    // rombos que marcan la dirección de avance (en cada camino)
    const diamondGeo = new THREE.OctahedronGeometry(0.07);
    diamondGeo.scale(1, 0.4, 1);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 });
    for (const path of game.map.paths) {
      for (let d = 30; d < path.totalLen - 30; d += 60) {
        const p = pointAtDistance(path, d);
        const m = new THREE.Mesh(diamondGeo, diamondMat);
        m.position.set(fx(p.x), 0.1, fz(p.y));
        m.rotation.y = -p.angle;
        scene.add(m);
      }
    }
    // un portal de entrada por camino, orientado según su dirección.
    // Los portales empiezan sellados (gris) y se "abren" cuando el nivel de
    // amenaza activa su puerta (game.gatesOpen) — ver syncGates().
    for (const path of game.map.paths) {
      const p0 = pointAtDistance(path, 6);
      const portal = new THREE.Group();
      const pillarMat = new THREE.MeshLambertMaterial({ color: 0x7c3aed, flatShading: true });
      for (const side of [-1, 1]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), pillarMat);
        pillar.position.set(0, 0.55, side * 0.5);
        portal.add(pillar);
      }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 1.25), pillarMat);
      lintel.position.y = 1.15;
      portal.add(lintel);
      const darkMat = new THREE.MeshBasicMaterial({ color: 0x1e1b4b, side: THREE.DoubleSide });
      const dark = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.0), darkMat);
      dark.position.y = 0.5;
      dark.rotation.y = Math.PI / 2;
      portal.add(dark);
      portal.position.set(fx(p0.x), 0, fz(p0.y));
      portal.rotation.y = -p0.angle;
      scene.add(portal);
      portals.push({ pillarMat, darkMat, dark });
    }
  }

  // --- decoración del escenario: árboles, rocas y flores ---
  {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true });
    const leafMats = [0x16a34a, 0x15803d, 0x65a30d].map((c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af, flatShading: true });
    const flowerMats = [0xf472b6, 0xfbbf24, 0xf87171, 0xc084fc].map((c) => new THREE.MeshBasicMaterial({ color: c }));

    const nearPath = (X, Z, margin) => pathPts.some((p) => (X - p.X) * (X - p.X) + (Z - p.Z) * (Z - p.Z) < margin * margin);

    // árboles en el anillo exterior (no estorban a las torres)
    for (let i = 0; i < 18; i++) {
      const a = rng() * Math.PI * 2;
      const d = 9.6 + rng() * 3.5;
      const X = Math.cos(a) * d, Z = Math.sin(a) * d * 0.65;
      if (Math.abs(Z) > 7.5 || nearPath(X, Z, 1.2)) continue;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6), trunkMat);
      trunk.position.y = 0.25;
      tree.add(trunk);
      const layers = 2 + Math.floor(rng() * 2);
      for (let l = 0; l < layers; l++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.55 - l * 0.14, 0.55, 6), leafMats[Math.floor(rng() * leafMats.length)]);
        leaf.position.y = 0.65 + l * 0.38;
        leaf.castShadow = true;
        tree.add(leaf);
      }
      tree.position.set(X, Math.max(terrainHeight(X, Z) - 0.05, 0), Z);
      tree.rotation.y = rng() * Math.PI;
      scene.add(tree);
    }
    // árboles grandes y rocas sobre las colinas de la isla
    for (let i = 0; i < 30; i++) {
      const a = rng() * Math.PI * 2;
      const d = 13 + rng() * 22;
      const X = Math.cos(a) * d, Z = Math.sin(a) * d;
      const y = terrainHeight(X, Z);
      if (y < SEA_Y + 0.35) continue; // ni en el agua ni en la playa
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6), trunkMat);
      trunk.position.y = 0.25;
      tree.add(trunk);
      const layers = 2 + Math.floor(rng() * 2);
      for (let l = 0; l < layers; l++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.55 - l * 0.14, 0.55, 6), leafMats[Math.floor(rng() * leafMats.length)]);
        leaf.position.y = 0.65 + l * 0.38;
        tree.add(leaf);
      }
      tree.scale.setScalar(1.1 + rng() * 1.3);
      tree.position.set(X, y - 0.08, Z);
      tree.rotation.y = rng() * Math.PI;
      scene.add(tree);
    }
    for (let i = 0; i < 14; i++) {
      const a = rng() * Math.PI * 2;
      const d = 12 + rng() * 24;
      const X = Math.cos(a) * d, Z = Math.sin(a) * d;
      const y = terrainHeight(X, Z);
      if (y < SEA_Y + 0.35) continue;
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + rng() * 0.5, 0), rockMat);
      rock.position.set(X, y, Z);
      rock.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
      scene.add(rock);
    }
    // rocas en celdas libres del campo
    for (let i = 0; i < 9; i++) {
      const X = (rng() - 0.5) * 15, Z = (rng() - 0.5) * 8;
      if (nearPath(X, Z, 1.0)) continue;
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14 + rng() * 0.14, 0), rockMat);
      rock.position.set(X, 0.08, Z);
      rock.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
      rock.castShadow = true;
      scene.add(rock);
    }
    // flores diminutas junto al camino
    const stemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 4);
    const petalGeo = new THREE.SphereGeometry(0.045, 6, 6);
    for (let i = 0; i < 36; i++) {
      const p = pathPts[Math.floor(rng() * pathPts.length)];
      const off = 0.7 + rng() * 0.5;
      const side = rng() < 0.5 ? 1 : -1;
      const X = p.X - Math.sin(p.angle) * off * side;
      const Z = p.Z + Math.cos(p.angle) * off * side;
      if (nearPath(X, Z, 0.55)) continue;
      const stem = new THREE.Mesh(stemGeo, trunkMat);
      stem.position.set(X, 0.07, Z);
      const petal = new THREE.Mesh(petalGeo, flowerMats[Math.floor(rng() * flowerMats.length)]);
      petal.position.set(X, 0.16, Z);
      scene.add(stem, petal);
    }
  }

  // --- fortaleza (al final del camino) ---
  const fortressRoot = new THREE.Group(); // fortaleza + mejoras (picking conjunto)
  scene.add(fortressRoot);
  const fortress = new THREE.Group();
  let flagGeo = null;
  let fortWallMat = null;
  const fortParts = {}; // piezas que las mejoras ocultan/sustituyen
  {
    const end = { X: fx(game.map.fort.x), Z: fz(game.map.fort.y) };
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
    fortParts.pole = pole;
    fortParts.flag = flag;
    fortress.position.set(end.X, 0, end.Z);
    fortressRoot.add(fortress);
    warmLight.position.set(end.X, 1.2, end.Z);
  }

  // --- mejoras de la fortaleza: muralla externa, torretas gemelas, gran cañón ---
  // Se construyen ocultas (o bajo demanda) y syncFortUpgrades() las enseña
  // según lo que el jugador haya comprado en el engine.
  const fortUpWallMat = new THREE.MeshLambertMaterial({ color: 0xddd6fe, flatShading: true });
  const fortUpDarkMat = new THREE.MeshLambertMaterial({ color: 0x8b5cf6, flatShading: true });
  const fortWallGroup = new THREE.Group();
  const fortEmblems = [];
  const fortFrontRoofs = [];
  {
    const W = FORT_WALL_R / GRID.cell; // media anchura del anillo en unidades 3D
    const h = 0.42, thick = 0.16, gate = 0.38;
    const seg = (geo, x, y, z) => {
      const m = new THREE.Mesh(geo, fortUpWallMat);
      m.position.set(x, y, z);
      m.castShadow = true;
      fortWallGroup.add(m);
      return m;
    };
    // frente con hueco de puerta + laterales + trasera
    const frontLen = W - gate;
    seg(new THREE.BoxGeometry(thick, h, frontLen), -W, h / 2, -(gate + frontLen / 2));
    seg(new THREE.BoxGeometry(thick, h, frontLen), -W, h / 2, gate + frontLen / 2);
    seg(new THREE.BoxGeometry(thick, h, 2 * W + thick), W, h / 2, 0);
    seg(new THREE.BoxGeometry(2 * W + thick, h, thick), 0, h / 2, -W);
    seg(new THREE.BoxGeometry(2 * W + thick, h, thick), 0, h / 2, W);
    // almenas sobre los muros
    const crenGeo = new THREE.BoxGeometry(0.11, 0.11, 0.11);
    for (let z = -W + 0.14; z <= W; z += 0.3) {
      if (Math.abs(z) > gate + 0.05) { // el frente respeta la puerta
        const c = new THREE.Mesh(crenGeo, fortUpDarkMat);
        c.position.set(-W, h + 0.05, z);
        fortWallGroup.add(c);
      }
      const cb = new THREE.Mesh(crenGeo, fortUpDarkMat);
      cb.position.set(W, h + 0.05, z);
      fortWallGroup.add(cb);
    }
    for (let x = -W + 0.3; x <= W - 0.2; x += 0.3) {
      for (const side of [-1, 1]) {
        const c = new THREE.Mesh(crenGeo, fortUpDarkMat);
        c.position.set(x, h + 0.05, side * W);
        fortWallGroup.add(c);
      }
    }
    // arco de la puerta (el camino entra por aquí)
    seg(new THREE.BoxGeometry(thick, 0.62, 0.12), -W, 0.31, -gate);
    seg(new THREE.BoxGeometry(thick, 0.62, 0.12), -W, 0.31, gate);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(thick, 0.14, gate * 2 + 0.12), fortUpDarkMat);
    lintel.position.set(-W, 0.69, 0);
    fortWallGroup.add(lintel);
    // postes de esquina con tejadillo (los frontales se ceden a las torretas)
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xa855f7, flatShading: true });
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.62, 8), fortUpDarkMat);
        post.position.set(sx * W, 0.31, sz * W);
        post.castShadow = true;
        fortWallGroup.add(post);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 8), roofMat);
        roof.position.set(sx * W, 0.74, sz * W);
        fortWallGroup.add(roof);
        if (sx === -1) fortFrontRoofs.push(post, roof);
      }
    }
    // emblemas dorados flotantes: una carga de escudo cada uno
    const embGeo = new THREE.OctahedronGeometry(0.09);
    for (const z of [-1.05, -0.62, 0.62, 1.05]) {
      const em = new THREE.Mesh(embGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
      em.position.set(-W, h + 0.36, z);
      em.userData.baseY = h + 0.36;
      fortEmblems.push(em);
      fortWallGroup.add(em);
    }
    fortWallGroup.visible = false;
    fortress.add(fortWallGroup);
  }

  const fortTurretMeshes = []; // paralelo a game.fortTurrets
  let fortCannonMesh = null;

  function buildFortTurretMesh() {
    const g = new THREE.Group();
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.78, 8), fortUpWallMat);
    ped.position.y = 0.39;
    ped.castShadow = true;
    g.add(ped);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.08, 8), fortUpDarkMat);
    collar.position.y = 0.8;
    g.add(collar);
    const pivot = new THREE.Group();
    pivot.position.y = 0.94;
    g.add(pivot);
    const headMat = new THREE.MeshLambertMaterial({ color: 0x22d3ee, emissive: 0x0e7490, emissiveIntensity: 1.2, flatShading: true });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), headMat);
    pivot.add(head);
    const barrels = new THREE.Group();
    for (const side of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.05), shared.barrelMat);
      b.position.set(0.18, 0.02, side * 0.06);
      barrels.add(b);
    }
    pivot.add(barrels);
    return { group: g, pivot, barrels, headMat };
  }

  function buildFortCannonMesh() {
    const g = new THREE.Group();
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.14, 8), fortUpDarkMat);
    platform.position.y = 0.97;
    platform.castShadow = true;
    g.add(platform);
    const pivot = new THREE.Group();
    pivot.position.y = 1.12;
    g.add(pivot);
    const housing = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8), fortUpWallMat);
    housing.castShadow = true;
    pivot.add(housing);
    const barrel = new THREE.Group();
    const tubeGeo = new THREE.CylinderGeometry(0.075, 0.095, 0.8, 10);
    tubeGeo.rotateZ(-Math.PI / 2); // el eje pasa a +X
    const tube = new THREE.Mesh(tubeGeo, shared.barrelMat);
    tube.position.x = 0.42;
    tube.castShadow = true;
    barrel.add(tube);
    const muzzleMat = new THREE.MeshLambertMaterial({ color: 0x1f2937, emissive: 0xc4b5fd, emissiveIntensity: 0.4 });
    const muzzleGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.12, 10);
    muzzleGeo.rotateZ(-Math.PI / 2);
    const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
    muzzle.position.x = 0.78;
    barrel.add(muzzle);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.18), fortUpDarkMat);
    counter.position.x = -0.2;
    barrel.add(counter);
    pivot.add(barrel);
    // el Gran Cañón hereda la bandera (misma geometría: ondea a la vez)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55), new THREE.MeshBasicMaterial({ color: 0xd1d5db }));
    pole.position.set(0, 1.6, 0);
    g.add(pole);
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshLambertMaterial({ color: 0xa855f7, side: THREE.DoubleSide }));
    flag.position.set(0.22, 1.78, 0);
    g.add(flag);
    return { group: g, pivot, barrel, muzzleMat };
  }

  function syncFortUpgrades() {
    // muralla externa: visible con cargas; gris cuando el escudo está roto
    fortWallGroup.visible = game.fortShieldMax > 0;
    if (fortWallGroup.visible) {
      fortUpWallMat.color.setHex(game.fortShield > 0 ? 0xddd6fe : 0x94a3b8);
      fortEmblems.forEach((em, i) => {
        em.visible = i < game.fortShield;
        em.rotation.y = game.time * 2 + i * 1.3;
        em.position.y = em.userData.baseY + Math.sin(game.time * 2.5 + i) * 0.045;
      });
    }
    // torretas gemelas: giran hacia su objetivo y se encienden al disparar
    for (let i = 0; i < game.fortTurrets.length; i++) {
      const tr = game.fortTurrets[i];
      let m = fortTurretMeshes[i];
      if (!m) {
        m = buildFortTurretMesh();
        m.group.position.set(fx(tr.x), 0, fz(tr.y));
        fortTurretMeshes[i] = m;
        fortressRoot.add(m.group);
        for (const r of fortFrontRoofs) r.visible = false; // las torretas ocupan los postes frontales
      }
      m.pivot.rotation.y = -tr.aim;
      m.headMat.emissiveIntensity = tr.flash > 0 ? 2.6 : 1.1 + Math.sin(game.time * 5 + i * 2) * 0.3;
      m.barrels.position.x = tr.flash > 0 ? -0.05 : 0;
    }
    // gran cañón: retroceso al disparar y brillo de carga al estar listo
    if (game.fortCannon && !fortCannonMesh) {
      fortCannonMesh = buildFortCannonMesh();
      fortress.add(fortCannonMesh.group);
      fortParts.pole.visible = false;
      fortParts.flag.visible = false;
    }
    if (fortCannonMesh && game.fortCannon) {
      const c = game.fortCannon;
      fortCannonMesh.pivot.rotation.y = -c.aim;
      fortCannonMesh.barrel.position.x = c.flash > 0 ? -(c.flash / 0.35) * 0.16 : 0;
      fortCannonMesh.muzzleMat.emissiveIntensity = c.cooldown <= 0.4
        ? 1.8 + Math.sin(game.time * 8) * 0.7
        : 0.4;
    }
  }

  // --- puntos de construcción (visibles al colocar) ---
  const gridGroup = new THREE.Group();     // celdas libres (torres)
  const gridPathGroup = new THREE.Group(); // celdas de camino (muralla)
  {
    const dotGeo = new THREE.CircleGeometry(0.07, 10);
    dotGeo.rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const dotPathMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.55 });
    for (let c = 0; c < GRID.cols; c++) {
      for (let r = 0; r < GRID.rows; r++) {
        const onPath = game.map.pathCells.has(`${c},${r}`);
        const m = new THREE.Mesh(dotGeo, onPath ? dotPathMat : dotMat);
        m.position.set(fx(c * GRID.cell + 30), onPath ? 0.09 : 0.03, fz(r * GRID.cell + 30));
        (onPath ? gridPathGroup : gridGroup).add(m);
      }
    }
    gridGroup.visible = false;
    gridPathGroup.visible = false;
    scene.add(gridGroup, gridPathGroup);
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
    projShell: new THREE.SphereGeometry(0.13, 10, 10),
    projIce: new THREE.OctahedronGeometry(0.09),
    ringGeo: new THREE.RingGeometry(0.92, 1, 40),
    baseMat: new THREE.MeshLambertMaterial({ color: 0x374151, flatShading: true }),
    bodyMat: new THREE.MeshLambertMaterial({ color: 0x4b5563, flatShading: true }),
    barrelMat: new THREE.MeshLambertMaterial({ color: 0x1f2937 }),
    pipMat: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    eyeWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    eyeDark: new THREE.MeshBasicMaterial({ color: 0x1f2937 }),
    crownMat: new THREE.MeshLambertMaterial({ color: 0xfbbf24 }),
    woodMat: new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true }),
    woodLightMat: new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true }),
    steelMat: new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true }),
    accentDarkMat: new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }),
    dynamiteMat: new THREE.MeshLambertMaterial({ color: 0xdc2626, flatShading: true }),
    engineMat: new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
    orbMat: new THREE.MeshBasicMaterial({ color: 0xc084fc }),
  };
  shared.ringGeo.rotateX(-Math.PI / 2);

  // Caché de geometrías: enemigos, torres y aliados comparten TODAS sus
  // geometrías entre instancias (dimensiones canónicas por tipo; la variación
  // por semilla se aplica escalando el grupo). Crear un enemigo nuevo no
  // asigna buffers nuevos en la GPU: solo transforms y un material de cuerpo.
  const geoCache = new Map();
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const G = (key, make) => {
    let g = geoCache.get(key);
    if (!g) { g = make(); geoCache.set(key, g); }
    return g;
  };
  const box = (w, h, d) => { w = r3(w); h = r3(h); d = r3(d); return G(`b:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)); };
  const cyl = (rt, rb, h, seg = 8) => { rt = r3(rt); rb = r3(rb); h = r3(h); return G(`c:${rt}:${rb}:${h}:${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)); };
  const cone = (r, h, seg = 6) => { r = r3(r); h = r3(h); return G(`k:${r}:${h}:${seg}`, () => new THREE.ConeGeometry(r, h, seg)); };
  const sph = (r, seg = 8) => { r = r3(r); return G(`s:${r}:${seg}`, () => new THREE.SphereGeometry(r, seg, seg)); };
  const octa = (r) => { r = r3(r); return G(`o:${r}`, () => new THREE.OctahedronGeometry(r)); };
  const octaS = (r, sy) => { r = r3(r); sy = r3(sy); return G(`os:${r}:${sy}`, () => { const g = new THREE.OctahedronGeometry(r); g.scale(1, sy, 1); return g; }); };
  const tor = (r, t) => { r = r3(r); t = r3(t); return G(`t:${r}:${t}`, () => new THREE.TorusGeometry(r, t, 6, 24)); };
  const cylX = (rt, rb, h, seg = 8) => { rt = r3(rt); rb = r3(rb); h = r3(h); return G(`cx:${rt}:${rb}:${h}:${seg}`, () => { const g = new THREE.CylinderGeometry(rt, rb, h, seg); g.rotateZ(-Math.PI / 2); return g; }); };

  // colores reutilizados en el bucle de render (cero allocations por frame)
  const COL_SLOW = new THREE.Color(0x7dd3fc);
  const COL_RAGE = new THREE.Color(0xef4444);

  // --- torres ---
  function towerColorHex(tw) {
    if (tw.type === 'hielo') return '#7dd3fc';
    if (tw.type === 'prisma') return '#c084fc';
    return game.categories[tw.catIdx].color;
  }

  // Barra de vida de estructura (solo visible cuando está dañada)
  const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const hpFgMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
  function addTowerHpBar(g, y) {
    const bg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.06), hpBgMat);
    bg.position.y = y;
    const fg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.07), hpFgMat.clone());
    fg.position.y = y;
    bg.visible = false; fg.visible = false;
    g.add(bg, fg);
    return { bg, fg };
  }
  function syncTowerHpBar(mesh, tw) {
    const bar = mesh.userData.hpBar;
    if (!bar) return;
    const damaged = tw.hp < tw.maxHp;
    bar.bg.visible = damaged;
    bar.fg.visible = damaged;
    if (damaged) {
      const ratio = Math.max(tw.hp / tw.maxHp, 0.02);
      bar.fg.scale.x = ratio;
      bar.fg.position.x = -0.25 * (1 - ratio);
      bar.fg.material.color.setHex(ratio > 0.5 ? 0x4ade80 : ratio > 0.25 ? 0xfbbf24 : 0xef4444);
    }
  }

  // Muralla: bloque de piedra que corta el camino
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true });
  const stoneDarkMat = new THREE.MeshLambertMaterial({ color: 0x64748b, flatShading: true });
  function buildBarrierMesh(tw) {
    const g = new THREE.Group();
    const block = new THREE.Mesh(box(0.6, 0.55, 0.96), stoneMat);
    block.position.y = 0.28;
    block.castShadow = true;
    g.add(block);
    // sillares decorativos
    for (let i = 0; i < 3; i++) {
      const brick = new THREE.Mesh(box(0.64, 0.12, 0.26), stoneDarkMat);
      brick.position.set(0, 0.14 + i * 0.18, (i % 2 === 0 ? -1 : 1) * 0.18);
      g.add(brick);
    }
    // almenas
    for (let i = -1; i <= 1; i++) {
      const cren = new THREE.Mesh(box(0.5, 0.14, 0.18), stoneMat);
      cren.position.set(0, 0.62, i * 0.34);
      g.add(cren);
    }
    g.position.set(fx(tw.x), 0, fz(tw.y));
    g.userData = { towerId: tw.id, barrier: true };
    g.userData.hpBar = addTowerHpBar(g, 1.0);
    return g;
  }

  // Santuario: altar con corazón de cristal levitante y aura curativa
  function buildSanctuaryMesh(tw) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.12, 8), new THREE.MeshLambertMaterial({ color: 0xf9fafb, flatShading: true }));
    base.position.y = 0.06; base.castShadow = true;
    g.add(base);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.08), new THREE.MeshLambertMaterial({ color: 0xe9d5ff, flatShading: true }));
      pillar.position.set(Math.cos(a) * 0.26, 0.38, Math.sin(a) * 0.26);
      g.add(pillar);
    }
    const heartMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xf472b6, emissiveIntensity: 1.8, roughness: 0.3 });
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), heartMat);
    heart.scale.set(1, 1.25, 1);
    heart.position.y = 0.78;
    g.add(heart);
    // anillo de aura en el suelo
    const aura = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color: 0xf9a8d4, transparent: true, opacity: 0.35 }));
    aura.position.y = 0.05;
    aura.scale.setScalar(TOWER_TYPES.santuario.range * U);
    // pétalos orbitando el corazón
    const petals = new THREE.Group();
    petals.position.y = 0.78;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const petal = new THREE.Mesh(sph(0.035, 6), new THREE.MeshBasicMaterial({ color: 0xf9a8d4 }));
      petal.position.set(Math.cos(a) * 0.32, Math.sin(a * 3) * 0.06, Math.sin(a) * 0.32);
      petals.add(petal);
    }
    g.add(aura, petals);
    g.position.set(fx(tw.x), 0, fz(tw.y));
    g.userData = { towerId: tw.id, sanctuary: { heart, heartMat, aura, petals } };
    g.userData.hpBar = addTowerHpBar(g, 1.25);
    return g;
  }

  // El Oráculo no combate: pedestal con esfera de cristal levitante y anillo
  function buildOracleMesh(tw) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.14, 8), shared.baseMat);
    base.position.y = 0.07; base.castShadow = true;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.5, 8), shared.bodyMat);
    column.position.y = 0.38; column.castShadow = true;
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.6, roughness: 0.25 });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), sphereMat);
    sphere.position.y = 0.85;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.022, 8, 30),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.8 }),
    );
    ring.position.y = 0.85;
    ring.rotation.x = Math.PI / 2.3;
    // runas orbitando la esfera
    const runes = new THREE.Group();
    runes.position.y = 0.85;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const rune = new THREE.Mesh(octa(0.04), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
      rune.position.set(Math.cos(a) * 0.34, Math.sin(a * 2) * 0.07, Math.sin(a) * 0.34);
      runes.add(rune);
    }
    g.add(base, column, sphere, ring, runes);
    g.position.set(fx(tw.x), 0, fz(tw.y));
    g.userData = { towerId: tw.id, oracle: { sphere, ring, sphereMat, runes } };
    g.userData.hpBar = addTowerHpBar(g, 1.25);
    return g;
  }

  // Torres de combate: cada tipo tiene su propia arquitectura y animación.
  // Contrato con syncTowers: userData = {coreMat, barrelPivot, core, top?, pips, anim}.
  function buildTowerMesh(tw) {
    if (tw.type === 'oraculo') return buildOracleMesh(tw);
    if (tw.type === 'muralla') return buildBarrierMesh(tw);
    if (tw.type === 'santuario') return buildSanctuaryMesh(tw);
    const color = new THREE.Color(towerColorHex(tw));
    const g = new THREE.Group();
    const anim = {};
    const coreMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: 0.4 });
    const topMat = new THREE.MeshLambertMaterial({ color, flatShading: true });
    const barrelPivot = new THREE.Group();
    let core = null;
    let top = null;

    if (tw.type === 'arquero') {
      // atalaya de madera: postes, plataforma, techo cónico, banderín y ballesta
      const base = new THREE.Mesh(cyl(0.32, 0.38, 0.14), shared.baseMat);
      base.position.y = 0.07; base.castShadow = true;
      g.add(base);
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const post = new THREE.Mesh(box(0.06, 0.6, 0.06), shared.woodMat);
          post.position.set(sx * 0.18, 0.42, sz * 0.18);
          g.add(post);
        }
      }
      const platform = new THREE.Mesh(cyl(0.28, 0.28, 0.06), shared.woodLightMat);
      platform.position.y = 0.74; platform.castShadow = true;
      const roof = new THREE.Mesh(cone(0.3, 0.32, 6), topMat);
      roof.position.y = 1.12; roof.castShadow = true;
      const mast = new THREE.Mesh(box(0.025, 0.28, 0.025), shared.barrelMat);
      mast.position.y = 1.38;
      const pennant = new THREE.Mesh(box(0.02, 0.09, 0.16), topMat);
      pennant.position.set(0, 0.08, 0.1);
      mast.add(pennant);
      anim.pennant = pennant;
      core = new THREE.Mesh(sph(0.1, 10), coreMat);
      core.position.y = 0.42;
      g.add(platform, roof, mast, core);
      // ballesta sobre la plataforma
      barrelPivot.position.y = 0.84;
      const gun = new THREE.Group();
      const stock = new THREE.Mesh(box(0.32, 0.05, 0.07), shared.barrelMat);
      stock.position.x = 0.1;
      gun.add(stock);
      for (const side of [-1, 1]) {
        const armB = new THREE.Mesh(box(0.18, 0.03, 0.04), shared.woodLightMat);
        armB.position.set(0.24, 0, side * 0.08);
        armB.rotation.y = side * 0.7;
        gun.add(armB);
      }
      const bolt = new THREE.Mesh(cone(0.03, 0.14, 4), shared.pipMat);
      bolt.rotation.z = -Math.PI / 2;
      bolt.position.x = 0.3;
      gun.add(bolt);
      barrelPivot.add(gun);
      anim.gun = gun;
    } else if (tw.type === 'rafaga') {
      // torre tesla: bobina de discos con anillos y gatling de tres cañones
      const base = new THREE.Mesh(cyl(0.3, 0.36, 0.14), shared.baseMat);
      base.position.y = 0.07; base.castShadow = true;
      g.add(base);
      for (let i = 0; i < 3; i++) {
        const disc = new THREE.Mesh(cyl(0.17 - i * 0.02, 0.17 - i * 0.02, 0.07), i % 2 ? shared.steelMat : shared.accentDarkMat);
        disc.position.y = 0.2 + i * 0.14;
        g.add(disc);
      }
      core = new THREE.Mesh(sph(0.11, 10), coreMat);
      core.position.y = 0.58;
      const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const halo = new THREE.Mesh(tor(0.17, 0.013), haloMat);
      halo.position.y = 0.58;
      halo.rotation.x = Math.PI / 2;
      g.add(core, halo);
      anim.halo = halo;
      // gatling
      barrelPivot.position.y = 0.78;
      const hub = new THREE.Mesh(box(0.1, 0.12, 0.12), shared.accentDarkMat);
      barrelPivot.add(hub);
      const spinner = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const b = new THREE.Mesh(box(0.3, 0.045, 0.045), shared.barrelMat);
        b.position.set(0.18, Math.cos(a) * 0.055, Math.sin(a) * 0.055);
        spinner.add(b);
      }
      barrelPivot.add(spinner);
      anim.spinner = spinner;
    } else if (tw.type === 'canon') {
      // bastión: tambor de piedra, banda metálica, mortero y pila de balas
      const drum = new THREE.Mesh(cyl(0.34, 0.4, 0.34), shared.baseMat);
      drum.position.y = 0.17; drum.castShadow = true;
      const band = new THREE.Mesh(cyl(0.355, 0.355, 0.06), shared.accentDarkMat);
      band.position.y = 0.3;
      core = new THREE.Mesh(sph(0.1, 10), coreMat);
      core.position.y = 0.5;
      g.add(drum, band, core);
      for (let i = 0; i < 3; i++) { // balas apiladas
        const ball = new THREE.Mesh(sph(0.07, 8), shared.barrelMat);
        ball.position.set(-0.26, 0.07 + (i === 2 ? 0.11 : 0), i === 0 ? -0.09 : i === 1 ? 0.09 : 0);
        g.add(ball);
      }
      barrelPivot.position.y = 0.56;
      const gun = new THREE.Group();
      const tube = new THREE.Mesh(cylX(0.09, 0.12, 0.44, 10), shared.barrelMat);
      tube.position.x = 0.18; tube.castShadow = true;
      const muzzle = new THREE.Mesh(cylX(0.12, 0.12, 0.08, 10), shared.accentDarkMat);
      muzzle.position.x = 0.42;
      gun.add(tube, muzzle);
      barrelPivot.add(gun);
      anim.gun = gun;
    } else if (tw.type === 'hielo') {
      // aguja de cristal con esquirlas orbitando y escarcha en el suelo
      const base = new THREE.Mesh(cyl(0.3, 0.36, 0.14), shared.baseMat);
      base.position.y = 0.07; base.castShadow = true;
      core = new THREE.Mesh(octaS(0.16, 2.4), coreMat);
      core.position.y = 0.62; core.castShadow = true;
      top = core; // la aguja rota lentamente
      g.add(base, core);
      const orbiter = new THREE.Group();
      orbiter.position.y = 0.66;
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const shard = new THREE.Mesh(octa(0.05), topMat);
        shard.position.set(Math.cos(a) * 0.3, Math.sin(a * 2) * 0.08, Math.sin(a) * 0.3);
        orbiter.add(shard);
      }
      g.add(orbiter);
      anim.orbiter = orbiter;
      const frost = new THREE.Mesh(shared.ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22 }));
      frost.position.y = 0.04;
      frost.scale.setScalar(0.4);
      g.add(frost);
      barrelPivot.position.y = 0.62; // foco de hielo orientable
      const focusShard = new THREE.Mesh(octa(0.06), topMat);
      focusShard.position.x = 0.26;
      barrelPivot.add(focusShard);
    } else {
      // prisma: cristal levitante con anillos giroscópicos
      const base = new THREE.Mesh(cyl(0.3, 0.36, 0.14), shared.baseMat);
      base.position.y = 0.07; base.castShadow = true;
      const column = new THREE.Mesh(cyl(0.07, 0.13, 0.42), shared.accentDarkMat);
      column.position.y = 0.34;
      g.add(base, column);
      core = new THREE.Mesh(octaS(0.16, 1.7), coreMat);
      core.position.y = 0.95; core.castShadow = true;
      top = core;
      g.add(core);
      anim.float = { mesh: core, baseY: 0.95 };
      anim.gyros = [];
      const gyroMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65 });
      for (let i = 0; i < 2; i++) {
        const ringG = new THREE.Mesh(tor(0.26 + i * 0.06, 0.012), gyroMat);
        ringG.position.y = 0.95;
        g.add(ringG);
        anim.gyros.push(ringG);
      }
      barrelPivot.position.y = 0.95; // el haz sale del propio cristal
    }

    g.add(barrelPivot);
    const pips = [];
    for (let i = 0; i < 2; i++) {
      const pip = new THREE.Mesh(shared.pip, shared.pipMat);
      pip.position.set(-0.12 + i * 0.24, 0.2, 0.3);
      pip.visible = false;
      g.add(pip); pips.push(pip);
    }

    g.position.set(fx(tw.x), 0, fz(tw.y));
    g.userData = { towerId: tw.id, coreMat, barrelPivot, core, top, pips, anim };
    g.userData.hpBar = addTowerHpBar(g, 1.5);
    return g;
  }

  // --- enemigos: cubos con caras y expresiones (cara en +X, dirección de avance) ---
  const faceWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const faceDarkMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
  const hatMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });

  // Rasgo facial: caja fina pegada a la cara +X del cubo (geometría cacheada)
  function facePart(body, s, { w, h, y, z, mat = faceDarkMat, rotX = 0, depth = 0.02 }) {
    const m = new THREE.Mesh(box(depth, h, w), mat);
    m.position.set(s / 2 + depth / 2, y, z);
    m.rotation.x = rotX;
    body.add(m);
    return m;
  }

  // Pies que caminan, colgados de un pivote propio (no del cuerpo: el squash
  // no los deforma; el pivote gira con la dirección de avance)
  function addFeet(group, s, footY, spread, scale = 1) {
    const pivot = new THREE.Group();
    group.add(pivot);
    const feet = [];
    for (const side of [-1, 1]) {
      const f = new THREE.Mesh(box(s * 0.3 * scale, s * 0.14 * scale, s * 0.22 * scale), shared.accentDarkMat);
      f.position.set(0, footY, side * spread);
      pivot.add(f);
      feet.push(f);
    }
    return { pivot, feet };
  }

  function buildEnemyMesh(e) {
    const radius = e.radius * U * 1.45; // canónico por tipo → geometrías cacheadas
    const showColor = game.mode !== 'exam';
    const base = new THREE.Color(showColor ? game.categories[e.catIdx].color : `hsl(${e.hue}, 30%, 58%)`);
    const mat = new THREE.MeshLambertMaterial({ flatShading: true });
    const wob = 0.9 + e.shape[0] * 0.18; // variación por semilla → escala del grupo

    const group = new THREE.Group();
    let body;
    let hammer = null;
    const anim = { pupils: [], stride: radius * 0.32, footY: radius * 0.12 };
    const s = radius * 1.8; // lado del cubo (canónico)

    if (e.type === 'scout') {
      // corredor flotante: cubo bajo y alargado, visera cíclope, aletas que
      // vibran, motor trasero brillante y antena con luz
      base.lerp(faceWhiteMat.color, 0.2);
      body = new THREE.Mesh(box(s * 1.5, s * 0.65, s * 0.85), mat);
      facePart(body, s * 1.5, { w: s * 0.6, h: s * 0.18, y: s * 0.1, z: 0 }); // visera
      anim.pupils.push(facePart(body, s * 1.5, { w: s * 0.16, h: s * 0.12, y: s * 0.1, z: 0, mat: faceWhiteMat, depth: 0.03 }));
      facePart(body, s * 1.5, { w: s * 0.3, h: s * 0.05, y: -s * 0.18, z: 0 }); // boca fina
      anim.fins = [];
      for (const side of [-1, 1]) {
        const fin = new THREE.Mesh(box(s * 0.5, s * 0.08, s * 0.3), mat);
        fin.position.set(-s * 0.8, s * 0.1, side * s * 0.4);
        fin.rotation.y = side * 0.5;
        body.add(fin);
        anim.fins.push(fin);
      }
      const engine = new THREE.Mesh(box(s * 0.16, s * 0.26, s * 0.45), shared.engineMat);
      engine.position.set(-s * 0.82, -s * 0.08, 0);
      body.add(engine);
      anim.engine = engine;
      const mast = new THREE.Mesh(box(0.02, s * 0.45, 0.02), shared.barrelMat);
      mast.position.set(-s * 0.45, s * 0.5, 0);
      const tip = new THREE.Mesh(sph(0.035, 6), shared.pipMat);
      tip.position.y = s * 0.24;
      mast.add(tip);
      body.add(mast);
      anim.antenna = mast;
      anim.hover = true; // sin pies: levita
    } else if (e.type === 'brute') {
      // mole de asedio: hombreras, puños que se balancean, púas dorsales,
      // cuernos y pisotones lentos
      base.multiplyScalar(0.78);
      body = new THREE.Mesh(box(s * 1.1, s * 1.2, s * 1.1), mat);
      for (const side of [-1, 1]) {
        facePart(body, s * 1.1, { w: s * 0.32, h: s * 0.09, y: s * 0.34, z: side * s * 0.22, rotX: side * 0.5 }); // ceja en V
        facePart(body, s * 1.1, { w: s * 0.14, h: s * 0.14, y: s * 0.16, z: side * s * 0.22, mat: faceWhiteMat }); // ojo
        anim.pupils.push(facePart(body, s * 1.1, { w: s * 0.07, h: s * 0.07, y: s * 0.16, z: side * s * 0.22, depth: 0.035 }));
        const horn = new THREE.Mesh(cone(s * 0.14, s * 0.4, 4), shared.crownMat);
        horn.position.set(0, s * 0.72, side * s * 0.4);
        horn.rotation.x = side * 0.45;
        body.add(horn);
        // hombreras + puños colgantes
        const pad = new THREE.Mesh(box(s * 0.46, s * 0.2, s * 0.34), shared.accentDarkMat);
        pad.position.set(0, s * 0.5, side * s * 0.66);
        body.add(pad);
      }
      anim.fists = [];
      for (const side of [-1, 1]) {
        const arm = new THREE.Group();
        arm.position.set(0, s * 0.32, side * s * 0.72);
        const fist = new THREE.Mesh(box(s * 0.32, s * 0.34, s * 0.28), shared.accentDarkMat);
        fist.position.y = -s * 0.62;
        arm.add(fist);
        body.add(arm);
        anim.fists.push(arm);
      }
      for (let i = 0; i < 3; i++) { // púas dorsales
        const spike = new THREE.Mesh(cone(s * 0.1, s * 0.26, 4), shared.steelMat);
        spike.position.set(-s * 0.56, s * (0.35 - i * 0.28), 0);
        spike.rotation.z = Math.PI / 2;
        body.add(spike);
      }
      facePart(body, s * 1.1, { w: s * 0.5, h: s * 0.12, y: -s * 0.25, z: 0 }); // boca
      for (let i = -1; i <= 1; i++) {
        facePart(body, s * 1.1, { w: s * 0.09, h: s * 0.09, y: -s * 0.23, z: i * s * 0.14, mat: faceWhiteMat, depth: 0.03 }); // dientes
      }
      anim.walk = addFeet(group, s, anim.footY, s * 0.3, 1.4);
      anim.slowWalk = true;
    } else if (e.type === 'sabo') {
      // demoledor: casco de obra, cinturón de herramientas, mochila con
      // dinamita y martillo animado
      body = new THREE.Mesh(box(s, s, s), mat);
      const hat = new THREE.Mesh(box(s * 0.85, s * 0.22, s * 0.85), hatMat);
      hat.position.y = s * 0.58;
      const brim = new THREE.Mesh(box(s * 1.15, s * 0.07, s * 1.0), hatMat);
      brim.position.set(s * 0.1, s * 0.48, 0);
      body.add(hat, brim);
      for (const side of [-1, 1]) {
        facePart(body, s, { w: s * 0.26, h: s * 0.07, y: s * 0.26, z: side * s * 0.2, rotX: side * 0.4 }); // ceño
        facePart(body, s, { w: s * 0.13, h: s * 0.13, y: s * 0.1, z: side * s * 0.2, mat: faceWhiteMat });
        anim.pupils.push(facePart(body, s, { w: s * 0.06, h: s * 0.06, y: s * 0.1, z: side * s * 0.2, depth: 0.035 }));
      }
      facePart(body, s, { w: s * 0.3, h: s * 0.07, y: -s * 0.24, z: 0, rotX: 0.2 }); // mueca
      const belt = new THREE.Mesh(box(s * 1.06, s * 0.12, s * 1.06), shared.accentDarkMat);
      belt.position.y = -s * 0.3;
      const buckle = new THREE.Mesh(box(0.02, s * 0.1, s * 0.12), shared.pipMat);
      buckle.position.set(s * 0.54, -s * 0.3, 0);
      body.add(belt, buckle);
      for (let i = -1; i <= 1; i++) { // cartuchos de dinamita a la espalda
        const stick = new THREE.Mesh(cyl(s * 0.07, s * 0.07, s * 0.45, 6), shared.dynamiteMat);
        stick.position.set(-s * 0.56, s * 0.1 + Math.abs(i) * s * 0.04, i * s * 0.18);
        body.add(stick);
        const fuse = new THREE.Mesh(sph(0.02, 6), shared.pipMat);
        fuse.position.set(-s * 0.56, s * 0.36, i * s * 0.18);
        body.add(fuse);
      }
      hammer = new THREE.Group();
      const handle = new THREE.Mesh(box(0.05, s * 0.8, 0.05), shared.barrelMat);
      handle.position.y = s * 0.4;
      const head = new THREE.Mesh(box(s * 0.28, s * 0.2, s * 0.42), shared.steelMat);
      head.position.y = s * 0.8;
      hammer.add(handle, head);
      hammer.position.set(s * 0.35, 0, s * 0.6);
      body.add(hammer);
      anim.walk = addFeet(group, s, anim.footY, s * 0.24);
    } else {
      // normal y jefe: cubo con carita; el jefe lleva capa, corona y orbes
      body = new THREE.Mesh(box(s, s, s), mat);
      const boss = e.type === 'boss';
      for (const side of [-1, 1]) {
        if (boss) facePart(body, s, { w: s * 0.26, h: s * 0.07, y: s * 0.33, z: side * s * 0.18, rotX: side * 0.45 });
        facePart(body, s, { w: s * 0.18, h: s * 0.18, y: s * 0.14, z: side * s * 0.18, mat: faceWhiteMat }); // ojo
        anim.pupils.push(facePart(body, s, { w: s * 0.09, h: s * 0.09, y: s * 0.12, z: side * s * 0.18, depth: 0.035 }));
      }
      if (boss) {
        facePart(body, s, { w: s * 0.44, h: s * 0.1, y: -s * 0.22, z: 0 });
        for (let i = -1; i <= 1; i += 2) {
          facePart(body, s, { w: s * 0.08, h: s * 0.12, y: -s * 0.18, z: i * s * 0.12, mat: faceWhiteMat, depth: 0.03 }); // colmillos
        }
        // capa ondeante anclada a los hombros
        const capePivot = new THREE.Group();
        capePivot.position.set(-s * 0.48, s * 0.42, 0);
        const cape = new THREE.Mesh(box(s * 0.06, s * 0.95, s * 0.85), shared.accentDarkMat);
        cape.position.y = -s * 0.48;
        capePivot.add(cape);
        body.add(capePivot);
        anim.cape = capePivot;
        anim.slowWalk = true;
        anim.walk = addFeet(group, s, anim.footY, s * 0.24, 1.3);
      } else {
        facePart(body, s, { w: s * 0.32, h: s * 0.06, y: -s * 0.2, z: 0, rotX: -0.15 }); // sonrisilla
        // antenita con muelle y mochila de explorador
        const boing = new THREE.Mesh(box(0.02, s * 0.32, 0.02), shared.barrelMat);
        boing.position.set(0, s * 0.62, 0);
        const bob = new THREE.Mesh(sph(0.035, 6), shared.orbMat);
        bob.position.y = s * 0.2;
        boing.add(bob);
        body.add(boing);
        anim.boing = boing;
        const pack = new THREE.Mesh(box(s * 0.3, s * 0.5, s * 0.55), shared.accentDarkMat);
        pack.position.set(-s * 0.6, 0, 0);
        const flap = new THREE.Mesh(box(s * 0.32, s * 0.14, s * 0.57), shared.steelMat);
        flap.position.set(-s * 0.6, s * 0.3, 0);
        body.add(pack, flap);
        anim.walk = addFeet(group, s, anim.footY, s * 0.24);
      }
    }

    mat.color.copy(base);
    body.position.y = radius + 0.08;
    body.castShadow = true;

    // corona y orbes orbitantes del jefe
    let auraMat = null;
    if (e.type === 'boss') {
      const crown = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(cone(0.07, 0.22, 4), shared.crownMat);
        const a = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(a) * radius * 0.5, radius * 0.95, Math.sin(a) * radius * 0.5);
        crown.add(spike);
      }
      body.add(crown);
      const orbiter = new THREE.Group();
      orbiter.position.y = radius + 0.15;
      for (const side of [-1, 1]) {
        const orb = new THREE.Mesh(octa(0.07), shared.orbMat);
        orb.position.set(side * radius * 1.05, 0, 0);
        orbiter.add(orb);
      }
      group.add(orbiter);
      anim.orbiter = orbiter;
      auraMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.25 });
      const aura = new THREE.Mesh(shared.ringGeo, auraMat);
      aura.scale.setScalar(radius * 1.9);
      aura.position.y = 0.05;
      group.add(aura);
      anim.aura = aura;
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

    group.add(body, ring, label);
    group.scale.setScalar(wob); // variación por semilla sin romper la caché de geometrías
    group.userData = { enemyId: e.id };
    return { group, body, mat, label, labelCanvas, labelTex, ring, hammer, anim, auraMat, lastBucket: 10, lastBorder: null, radius, baseColor: base.clone() };
  }

  // --- caballeros aliados (cubitos con casco y espada) ---
  const allyMeshes = new Map();
  const allyBodyMat = new THREE.MeshLambertMaterial({ color: 0x8b5cf6, flatShading: true });
  const allyHeadMat = new THREE.MeshLambertMaterial({ color: 0xfde68a, flatShading: true });
  const allyHelmMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });

  const allyCapeMat = new THREE.MeshLambertMaterial({ color: 0x6d28d9, flatShading: true });
  const allyShieldMat = new THREE.MeshLambertMaterial({ color: 0xa78bfa, flatShading: true });

  function buildAllyMesh(a) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(box(0.26, 0.3, 0.26), allyBodyMat);
    body.position.y = 0.24;
    body.castShadow = true;
    const chest = new THREE.Mesh(box(0.28, 0.13, 0.28), allyHelmMat); // peto
    chest.position.y = 0.31;
    const belt = new THREE.Mesh(box(0.27, 0.05, 0.27), shared.accentDarkMat);
    belt.position.y = 0.16;
    const head = new THREE.Mesh(box(0.2, 0.18, 0.2), allyHeadMat);
    head.position.y = 0.5;
    const helm = new THREE.Mesh(box(0.23, 0.09, 0.23), allyHelmMat);
    helm.position.y = 0.62;
    const brimH = new THREE.Mesh(box(0.06, 0.025, 0.23), allyHelmMat); // visera
    brimH.position.set(0.12, 0.585, 0);
    const plume = new THREE.Mesh(box(0.06, 0.14, 0.06), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
    plume.position.y = 0.72;
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(box(0.02, 0.035, 0.035), faceDarkMat);
      eye.position.set(0.11, 0.51, side * 0.05);
      g.add(eye);
    }
    // piernas con ciclo de marcha
    const legs = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(box(0.08, 0.17, 0.09), shared.accentDarkMat);
      leg.position.set(0, 0.085, side * 0.07);
      g.add(leg);
      legs.push(leg);
    }
    // escudo en el flanco izquierdo, con emblema
    const shield = new THREE.Group();
    const plate = new THREE.Mesh(box(0.18, 0.26, 0.05), allyShieldMat);
    shield.add(plate);
    const emblem = new THREE.Mesh(sph(0.035, 6), shared.pipMat);
    emblem.position.z = -0.035;
    shield.add(emblem);
    shield.position.set(0.02, 0.28, -0.18);
    // capa ondeante
    const capePivot = new THREE.Group();
    capePivot.position.set(-0.12, 0.42, 0);
    const cape = new THREE.Mesh(box(0.03, 0.34, 0.22), allyCapeMat);
    cape.position.y = -0.16;
    capePivot.add(cape);
    // espada con estela luminosa durante el barrido
    const swordPivot = new THREE.Group();
    const blade = new THREE.Mesh(box(0.34, 0.045, 0.045), allyHelmMat);
    blade.position.x = 0.2;
    const guard = new THREE.Mesh(box(0.04, 0.12, 0.04), shared.barrelMat);
    swordPivot.add(blade, guard);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0xe9d5ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const trail = new THREE.Mesh(box(0.36, 0.005, 0.18), trailMat);
    trail.position.set(0.2, -0.06, 0);
    trail.visible = false;
    swordPivot.add(trail);
    swordPivot.position.set(0.12, 0.3, 0.16);
    g.add(body, chest, belt, head, helm, brimH, plume, shield, capePivot, swordPivot);
    g.userData = { allyId: a.id, swordPivot, body, legs, capePivot, trail, trailMat };
    return g;
  }

  function syncAllies() {
    const alive = new Set();
    for (const a of game.allies) {
      if (a.hp <= 0) continue;
      alive.add(a.id);
      let m = allyMeshes.get(a.id);
      if (!m) {
        m = buildAllyMesh(a);
        allyMeshes.set(a.id, m);
        fxGroup.add(m);
      }
      m.position.set(fx(a.x), Math.abs(Math.sin(game.time * 8 + a.phase)) * 0.04, fz(a.y));
      m.rotation.y = -a.angle;
      const u = m.userData;
      const engaged = !!a.targetId;
      // marcha ligada a la distancia recorrida: en combate, firmes
      const sw = engaged ? 0 : Math.sin(a.dist * 0.45 + a.phase);
      u.legs[0].rotation.x = sw * 0.7;
      u.legs[1].rotation.x = -sw * 0.7;
      u.capePivot.rotation.z = -0.12 - Math.abs(sw) * 0.18 - Math.sin(game.time * 2.2 + a.phase) * 0.05;
      u.body.rotation.z = engaged ? -0.1 : 0; // se inclina al luchar
      // espadazo: la hoja barre hacia delante con estela
      u.swordPivot.rotation.z = a.swing > 0 ? -1.6 * (1 - a.swing / 0.25) : -0.25;
      const swinging = a.swing > 0;
      u.trail.visible = swinging;
      if (swinging) u.trailMat.opacity = (a.swing / 0.25) * 0.7;
      u.body.material = a.hitFlash > 0 ? shared.eyeWhite : allyBodyMat;
    }
    for (const [id, m] of allyMeshes) {
      if (!alive.has(id)) {
        fxGroup.remove(m);
        // geometrías compartidas: solo se libera el material de la estela
        m.userData.trailMat.dispose();
        allyMeshes.delete(id);
      }
    }
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
    if (raycaster.intersectObjects(fortressRoot.children, true).length) {
      return { kind: 'fortress' };
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
      // posición (puede haberse movido con moveTower)
      mesh.position.set(fx(tw.x), 0, fz(tw.y));
      syncTowerHpBar(mesh, tw);

      if (mesh.userData.barrier) {
        // temblor al recibir golpes
        mesh.rotation.z = tw.flash > 0 ? Math.sin(game.time * 40) * 0.04 : 0;
        continue;
      }

      if (mesh.userData.sanctuary) {
        const { heart, heartMat, aura, petals } = mesh.userData.sanctuary;
        heart.position.y = 0.78 + Math.sin(game.time * 2.2 + tw.id) * 0.06;
        heart.rotation.y = game.time * 1.1;
        heartMat.emissiveIntensity = 1.5 + Math.sin(game.time * 3) * 0.5;
        aura.material.opacity = 0.25 + Math.sin(game.time * 3) * 0.12;
        petals.rotation.y = game.time * 0.9;
        continue;
      }

      if (mesh.userData.oracle) {
        const { sphere, ring, sphereMat, runes } = mesh.userData.oracle;
        sphere.position.y = 0.85 + Math.sin(game.time * 2 + tw.id) * 0.07;
        ring.rotation.z = game.time * 1.3;
        runes.rotation.y = game.time * 1.5;
        const soon = game.phase === 'run' && game.questionNextAt - game.time < 3;
        sphereMat.emissiveIntensity = soon ? 2.4 + Math.sin(game.time * 12) * 0.9 : 1.6;
        continue;
      }

      const { coreMat, barrelPivot, core, pips, anim } = mesh.userData;
      barrelPivot.rotation.y = -tw.aim;
      const type = TOWER_TYPES[tw.type];
      const jammed = type.needsCategory && game.time < game.jams[tw.catIdx];
      const pulse = 1.3 + Math.sin(game.time * 4 + tw.id) * 0.5;
      coreMat.emissiveIntensity = jammed ? 0.15 : (tw.flash > 0 ? 2.6 : pulse);
      core.scale.setScalar(tw.flash > 0 ? 1.35 : 1);
      if (mesh.userData.top) mesh.userData.top.rotation.y = game.time * (tw.type === 'prisma' ? 1.6 : 0.4);
      mesh.scale.setScalar(1 + 0.07 * (tw.level - 1)); // mejorar agranda la torre

      // animación por tipo (solo transforms)
      if (anim) {
        if (anim.gun) anim.gun.position.x = tw.flash > 0 ? -(tw.flash / 0.1) * 0.08 : 0; // retroceso
        if (anim.spinner) {
          anim.spin = (anim.spin || 0) + (tw.flash > 0 || tw.cooldown < 0.2 ? 0.5 : 0.05);
          anim.spinner.rotation.x = anim.spin;
        }
        if (anim.orbiter) anim.orbiter.rotation.y = game.time * 1.4 + tw.id;
        if (anim.gyros) {
          anim.gyros[0].rotation.x = game.time * 1.2 + tw.id;
          anim.gyros[1].rotation.z = game.time * 1.7 + tw.id;
        }
        if (anim.pennant) anim.pennant.rotation.x = Math.sin(game.time * 3.2 + tw.id) * 0.35;
        if (anim.halo) {
          anim.halo.position.y = 0.58 + Math.sin(game.time * 2.6 + tw.id) * 0.06;
          anim.halo.rotation.z = game.time * 2;
        }
        if (anim.float) anim.float.mesh.position.y = anim.float.baseY + Math.sin(game.time * 2 + tw.id) * 0.05;
      }
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

      // --- animación por tipo (solo transforms; el ciclo de andar va ligado a
      // la distancia recorrida: si el enemigo está bloqueado, los pies paran) ---
      const w = m.anim;
      const walkT = e.dist * (w.slowWalk ? 0.09 : 0.16) + e.phase;
      if (w.walk) {
        const sw = Math.sin(walkT);
        const [fL, fR] = w.walk.feet;
        w.walk.pivot.rotation.y = -e.angle; // los pies miran hacia donde anda
        fL.position.x = sw * w.stride;
        fR.position.x = -sw * w.stride;
        fL.position.y = w.footY + Math.max(0, sw) * w.stride * 0.5;
        fR.position.y = w.footY + Math.max(0, -sw) * w.stride * 0.5;
      }
      if (w.pupils.length) {
        const blink = Math.sin(game.time * 1.6 + e.phase * 3) > 0.97 ? 0.12 : 1;
        for (const p of w.pupils) p.scale.y = blink;
      }
      if (w.fins) {
        const flut = Math.sin(game.time * 16 + e.phase) * 0.22;
        w.fins[0].rotation.y = 0.5 + flut;
        w.fins[1].rotation.y = -0.5 - flut;
      }
      if (w.engine) w.engine.scale.y = 1 + Math.sin(game.time * 22 + e.phase) * 0.35;
      if (w.antenna) w.antenna.rotation.x = Math.sin(game.time * 5 + e.phase) * 0.25;
      if (w.boing) w.boing.rotation.x = Math.sin(walkT * 2) * 0.35;
      if (w.fists) {
        w.fists[0].rotation.z = Math.sin(walkT) * 0.45;
        w.fists[1].rotation.z = -Math.sin(walkT) * 0.45;
      }
      if (w.cape) w.cape.rotation.z = -0.18 - Math.abs(Math.sin(walkT)) * 0.12 - Math.sin(game.time * 2.4 + e.phase) * 0.06;
      if (w.orbiter) w.orbiter.rotation.y = game.time * 1.8 + e.phase;
      if (w.aura) {
        m.auraMat.opacity = 0.18 + Math.sin(game.time * 3) * 0.08;
        w.aura.rotation.y = game.time * 0.6;
      }

      // color: flash de daño / ralentizado / revelado (colores hoisted, 0 alloc)
      const slowed = game.time < e.slowUntil;
      if (e.hitFlash > 0) m.mat.color.setHex(0xffffff);
      else if (slowed) m.mat.color.copy(m.baseColor).lerp(COL_SLOW, 0.55);
      else if (e.enraged) m.mat.color.copy(m.baseColor).lerp(COL_RAGE, 0.4);
      else m.mat.color.copy(m.baseColor);

      // anillo de categoría al revelar
      if (e.revealed && !m.ring.visible) {
        m.ring.visible = true;
        m.ring.material.color.set(game.categories[e.catIdx].color);
      }

      // martillo del saboteador: golpea mientras demuele (+ inclinación)
      if (m.hammer) {
        const working = !!e.attackTowerId;
        m.hammer.rotation.z = working ? Math.sin(game.time * 10) * 0.9 - 0.4 : -0.2;
        m.body.rotation.z = working ? Math.sin(game.time * 10) * 0.06 : 0;
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
        // OJO: las geometrías son compartidas (caché) — solo se liberan los
        // recursos por-instancia: material del cuerpo, etiqueta, anillo y aura
        m.mat.dispose(); m.labelTex.dispose(); m.label.material.dispose();
        m.ring.material.dispose();
        if (m.auraMat) m.auraMat.dispose();
        enemyMeshes.delete(id);
      }
    }
  }

  // materiales de proyectil compartidos: cero allocations por disparo
  const projMats = {
    arquero: new THREE.MeshBasicMaterial({ color: 0xfde68a }),
    rafaga: new THREE.MeshBasicMaterial({ color: 0xfef08a }),
    canon: new THREE.MeshLambertMaterial({ color: 0x1f2937 }),
    fort_turret: new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
    fort_canon: new THREE.MeshLambertMaterial({ color: 0x4c1d95, emissive: 0x8b5cf6, emissiveIntensity: 0.9 }),
    hielo: new THREE.MeshBasicMaterial({ color: 0xbae6fd }),
  };
  const projGeos = {
    arquero: shared.projArrow, rafaga: shared.projSpark, canon: shared.projBall,
    fort_turret: shared.projSpark, fort_canon: shared.projShell,
  };

  function syncProjectiles() {
    const alive = new Set();
    for (const pr of game.projectiles) {
      alive.add(pr.id);
      let mesh = projMeshes.get(pr.id);
      if (!mesh) {
        mesh = new THREE.Mesh(projGeos[pr.type] || shared.projIce, projMats[pr.type] || projMats.hielo);
        projMeshes.set(pr.id, mesh);
        fxGroup.add(mesh);
      }
      const projY = pr.type === 'fort_canon' ? 1.05 : pr.type === 'fort_turret' ? 0.9 : 0.45;
      mesh.position.set(fx(pr.x), projY, fz(pr.y));
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
        fxGroup.remove(mesh); // geometría y material compartidos: nada que liberar
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
    fortWallMat.color.setHex(ratio > 0.6 ? COL.wall : ratio > 0.3 ? 0xfb923c : 0xf87171);
    // bandera ondeante
    const pos = flagGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(game.time * 6 + x * 7) * 0.05 * (x + 0.25) * 2);
    }
    pos.needsUpdate = true;
    warmLight.intensity = 10 + Math.sin(game.time * 5) * 2.5;
    // marea: el mar sube y baja suavemente sobre las playas
    sea.position.y = SEA_Y + Math.sin(game.time * 0.7) * 0.045;
  }

  function syncGates() {
    for (let i = 0; i < portals.length; i++) {
      const open = i < game.gatesOpen;
      const po = portals[i];
      po.pillarMat.color.setHex(open ? 0x7c3aed : 0x52525b);
      po.darkMat.color.setHex(open ? 0x1e1b4b : 0x3f3f46);
      // el vórtice late cuando la puerta está activa
      po.dark.scale.set(open ? 1 + Math.sin(game.time * 3 + i * 2) * 0.06 : 0.85, open ? 1 : 0.85, 1);
    }
  }

  function syncIndicators(ui) {
    const placingBarrier = ui.placingType && TOWER_TYPES[ui.placingType].kind === 'barrier';
    gridGroup.visible = !!ui.placingType && !placingBarrier;
    gridPathGroup.visible = !!placingBarrier;
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
    syncAllies();
    syncProjectiles();
    syncParticles();
    syncFortress();
    syncFortUpgrades();
    syncGates();
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
    for (const g of geoCache.values()) g.dispose(); // caché compartida (idempotente)
    geoCache.clear();
    for (const { tex } of textTexCache.values()) tex.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { render, pick, resize, orbit, zoom, dispose };
}
