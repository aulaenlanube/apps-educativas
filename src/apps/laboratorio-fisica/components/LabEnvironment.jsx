// Entorno 3D ambiental del laboratorio (r3f), inspirado en "La Fortaleza":
// una isla low-poly que rodea el "escenario" central de cada simulación —
// pradera + colinas + playa + mar con oleaje suave, árboles, rocas y flores
// instanciadas, montañas nevadas en el horizonte y, según el clima, sol/luna,
// nubes, lluvia, estrellas o nebulosa. Todo procedural (sin assets), determinista
// por semilla (estable ante remounts de calidad/contexto WebGL) y SOLO decorativo:
// la pradera vive justo por debajo del montaje (no lo tapa) y el relieve arranca
// más allá del radio del escenario más grande. Las cantidades escalan con la calidad.
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TWO_PI = Math.PI * 2;
const smooth = THREE.MathUtils.smoothstep;
const clamp = THREE.MathUtils.clamp;

// --- geometría de la isla (unidades de mundo) ---
const SEA_Y = -3.2;     // nivel del mar (muy por debajo del escenario en y≈0)
const BASE_Y = -0.40;   // pradera plana, por debajo del suelo de TODAS las escenas
                        // (el más bajo es arquimedes en y=-0,21) para que la hierba
                        // nunca asome a traves del suelo oscuro del montaje.
const R_FLAT = 23;      // radio de pradera plana (cubre el escenario más grande)
const R_RAMP = 15;      // transición pradera → colinas
const R_COAST = 62;     // a partir de aquí la tierra cae hacia el mar (visible al fondo)
const R_COASTW = 28;

function mulberry32(a) {
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function tintHex(hex, factor, warmAmt = 0) {
  const c = new THREE.Color(hex).multiplyScalar(factor);
  if (warmAmt) c.lerp(new THREE.Color('#ffb070'), warmAmt);
  return `#${c.getHexString()}`;
}

// relieve compartido: pradera plana en el centro, colinas onduladas alrededor y
// caída al mar en el borde. Función PURA (la fase `ph` se sortea una vez).
function makeHeight(ph) {
  return (x, z) => {
    const r = Math.hypot(x, z);
    const rim = smooth(r, R_FLAT, R_FLAT + R_RAMP);
    if (rim <= 0) return BASE_Y + Math.sin(x * 0.6) * Math.cos(z * 0.55) * 0.04;
    const n = Math.sin(x * 0.085 + ph[0]) * Math.cos(z * 0.10 + ph[1]) * 2.0
      + Math.sin(x * 0.05 + ph[2]) * Math.sin(z * 0.043 + ph[3]) * 3.2
      + Math.sin((x + z) * 0.028 + ph[4]) * Math.cos((x - z) * 0.022 + ph[5]) * 1.6;
    const land = BASE_Y + rim * (2.4 + n) * 0.9;
    const coast = 1 - smooth(r, R_COAST, R_COAST + R_COASTW);
    return land * coast - (1 - coast) * 10;
  };
}

/* ----------------------------- cúpula de cielo ----------------------------- */
const SKY_VERT = /* glsl */`
  varying vec3 vDir;
  void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SKY_FRAG = /* glsl */`
  precision mediump float;
  varying vec3 vDir;
  uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uLow;
  void main() {
    float y = vDir.y;
    vec3 col = (y > 0.0)
      ? mix(uHorizon, uTop, smoothstep(0.0, 0.55, y))
      : mix(uLow, uHorizon, smoothstep(-0.30, 0.0, y));
    gl_FragColor = vec4(col, 1.0);
  }
`;
function Skydome({ amb }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color(amb.sky) },
      uHorizon: { value: new THREE.Color(amb.horizon) },
      uLow: { value: new THREE.Color(amb.low || amb.horizon) },
    },
    vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
    side: THREE.BackSide, fog: false, depthWrite: false,
  }), [amb]);
  const geo = useMemo(() => new THREE.SphereGeometry(185, 32, 20), []);
  useEffect(() => () => { mat.dispose(); geo.dispose(); }, [mat, geo]);
  return <mesh geometry={geo} material={mat} frustumCulled={false} dispose={null} />;
}

/* ----------------------------- halo radial (sprite) ----------------------------- */
function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function Astro({ amb }) {
  const glow = useMemo(makeGlowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);
  const pos = useMemo(() => new THREE.Vector3(...amb.sunPos).normalize().multiplyScalar(150), [amb]);
  const isMoon = !!amb.night;
  const disc = isMoon ? '#e8f1ff' : amb.sun;
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[isMoon ? 5.5 : 7, 24, 24]} />
        <meshBasicMaterial color={disc} fog={false} toneMapped={false} />
      </mesh>
      <sprite scale={isMoon ? 34 : 52}>
        <spriteMaterial map={glow} color={disc} transparent opacity={isMoon ? 0.5 : 0.8} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

/* ----------------------------- estrellas ----------------------------- */
function Stars({ count }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TWO_PI;
      const e = 0.02 + (Math.random() ** 1.9) * 1.25; // sesgo al horizonte
      const d = 135 + Math.random() * 45;
      arr[i * 3] = Math.cos(a) * Math.cos(e) * d;
      arr[i * 3 + 1] = Math.sin(e) * d;
      arr[i * 3 + 2] = Math.sin(a) * Math.cos(e) * d;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points geometry={geo} dispose={null}>
      <pointsMaterial color="#dfe8ff" size={2.2} sizeAttenuation={false} transparent opacity={0.95} depthWrite={false} fog={false} toneMapped={false} />
    </points>
  );
}

/* ----------------------------- nebulosa (sprites aditivos) ----------------------------- */
function Nebula() {
  const glow = useMemo(makeGlowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);
  const blobs = useMemo(() => Array.from({ length: 4 }, () => ({
    pos: [(Math.random() - 0.5) * 180, 25 + Math.random() * 55, -(90 + Math.random() * 60)],
    scale: 60 + Math.random() * 60,
    color: ['#7c3aed', '#2563eb', '#db2777', '#0ea5e9'][Math.floor(Math.random() * 4)],
  })), []);
  return (
    <group>
      {blobs.map((b, i) => (
        <sprite key={i} position={b.pos} scale={b.scale}>
          <spriteMaterial map={glow} color={b.color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  );
}

/* ----------------------------- planeta lejano (temas de espacio) ----------------------------- */
function Planet({ color }) {
  const geo = useMemo(() => new THREE.SphereGeometry(24, 32, 32), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 }), [color]);
  const ringGeo = useMemo(() => new THREE.RingGeometry(31, 44, 64), []);
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, side: THREE.DoubleSide, fog: false }), [color]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); ringGeo.dispose(); ringMat.dispose(); }, [geo, mat, ringGeo, ringMat]);
  return (
    <group position={[-72, 36, -120]} rotation={[0.5, 0, 0.25]}>
      <mesh geometry={geo} material={mat} dispose={null} />
      <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI / 2, 0, 0]} dispose={null} />
    </group>
  );
}

/* ----------------------------- terreno low-poly de la isla ----------------------------- */
function Terrain({ heightFn, palette, seed, seg }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(300, 300, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const rng = mulberry32(seed);
    const colors = [];
    const grassA = new THREE.Color(palette.grassA);
    const grassB = new THREE.Color(palette.grassB);
    const sand = new THREE.Color(palette.sand);
    const sandDeep = sand.clone().multiplyScalar(0.5);
    const peak = new THREE.Color(palette.peak);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const y = heightFn(x, z) + (rng() - 0.5) * 0.08;
      pos.setY(i, y);
      let col;
      if (y < SEA_Y + 0.5) {
        col = sand.clone().lerp(sandDeep, clamp((SEA_Y + 0.5 - y) / 3, 0, 1));
      } else {
        col = grassA.clone().lerp(grassB, clamp(rng() * 0.75, 0, 1));
        if (y > 4) col.lerp(peak, smooth(y, 4, 9) * 0.85);
      }
      colors.push(col.r, col.g, col.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [heightFn, palette, seed, seg]);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), []);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <mesh geometry={geo} material={mat} receiveShadow dispose={null} />;
}

/* ----------------------------- mar con oleaje suave ----------------------------- */
function Sea({ color, seg }) {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(440, 440, seg, seg); g.rotateX(-Math.PI / 2); return g; }, [seg]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.85, flatShading: true }), [color]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const arr = geo.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i], z = base[i + 2];
      arr[i + 1] = Math.sin(x * 0.05 + t * 0.7) * 0.16 + Math.cos(z * 0.06 + t * 0.55) * 0.16;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return <mesh geometry={geo} material={mat} position={[0, SEA_Y, 0]} dispose={null} />;
}

/* ----------------------------- árboles instanciados ----------------------------- */
function Trees({ trunks, leaves }) {
  const trunkRef = useRef();
  const leafRef = useRef();
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.28, 1.1, 6), []);
  const trunkMat = useMemo(() => new THREE.MeshLambertMaterial({ color: 0x6b4423, flatShading: true }), []);
  const leafGeo = useMemo(() => new THREE.ConeGeometry(1, 1, 7), []);
  const leafMat = useMemo(() => new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), []);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    trunks.forEach((t, i) => {
      d.position.set(t.x, t.y, t.z); d.rotation.set(0, t.ry, 0); d.scale.set(t.s, t.s, t.s);
      d.updateMatrix(); trunkRef.current.setMatrixAt(i, d.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leaves.forEach((l, i) => {
      d.position.set(l.x, l.y, l.z); d.rotation.set(0, l.ry, 0); d.scale.set(l.sxz, l.sy, l.sxz);
      d.updateMatrix(); leafRef.current.setMatrixAt(i, d.matrix); leafRef.current.setColorAt(i, l.color);
    });
    leafRef.current.instanceMatrix.needsUpdate = true;
    if (leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
  }, [trunks, leaves]);
  useEffect(() => () => { trunkGeo.dispose(); trunkMat.dispose(); leafGeo.dispose(); leafMat.dispose(); }, [trunkGeo, trunkMat, leafGeo, leafMat]);
  return (
    <>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, trunks.length]} frustumCulled={false} dispose={null} />
      <instancedMesh ref={leafRef} args={[leafGeo, leafMat, leaves.length]} frustumCulled={false} dispose={null} />
    </>
  );
}

/* ----------------------------- rocas instanciadas ----------------------------- */
function Rocks({ items }) {
  const ref = useRef();
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: 0x8a8f99, flatShading: true }), []);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    items.forEach((r, i) => {
      d.position.set(r.x, r.y, r.z); d.rotation.set(r.rx, r.ry, 0); d.scale.setScalar(r.s);
      d.updateMatrix(); ref.current.setMatrixAt(i, d.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} frustumCulled={false} dispose={null} />;
}

/* ----------------------------- flores junto al escenario ----------------------------- */
function Flowers({ stems, petals }) {
  const sRef = useRef();
  const pRef = useRef();
  const sGeo = useMemo(() => new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), []);
  const sMat = useMemo(() => new THREE.MeshLambertMaterial({ color: 0x2f7d3a, flatShading: true }), []);
  const pGeo = useMemo(() => new THREE.IcosahedronGeometry(0.13, 0), []);
  const pMat = useMemo(() => new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), []);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    stems.forEach((s, i) => {
      d.position.set(s.x, s.y, s.z); d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1);
      d.updateMatrix(); sRef.current.setMatrixAt(i, d.matrix);
    });
    sRef.current.instanceMatrix.needsUpdate = true;
    petals.forEach((p, i) => {
      d.position.set(p.x, p.y, p.z); d.updateMatrix();
      pRef.current.setMatrixAt(i, d.matrix); pRef.current.setColorAt(i, p.color);
    });
    pRef.current.instanceMatrix.needsUpdate = true;
    if (pRef.current.instanceColor) pRef.current.instanceColor.needsUpdate = true;
  }, [stems, petals]);
  useEffect(() => () => { sGeo.dispose(); sMat.dispose(); pGeo.dispose(); pMat.dispose(); }, [sGeo, sMat, pGeo, pMat]);
  return (
    <>
      <instancedMesh ref={sRef} args={[sGeo, sMat, stems.length]} frustumCulled={false} dispose={null} />
      <instancedMesh ref={pRef} args={[pGeo, pMat, petals.length]} frustumCulled={false} dispose={null} />
    </>
  );
}

/* ----------------------------- montañas nevadas (horizonte) ----------------------------- */
// Una sola geometría por montaña con nieve por COLOR de vértice (la línea de nieve
// sigue la superficie real) y picos limpios: el ruido craggy se desvanece hacia
// la cima (1−t) → el vértice de la cumbre queda centrado y afilado, sin "fallos".
function makeMountainGeo({ h, rad, sides, seed, rock, snow, snowLine }) {
  const geo = new THREE.ConeGeometry(rad, h, sides, 5);
  const rng = mulberry32(seed);
  const ph = [rng() * TWO_PI, rng() * TWO_PI, rng() * TWO_PI];
  const pos = geo.attributes.position;
  const rockC = new THREE.Color(rock);
  const snowC = new THREE.Color(snow);
  const colors = [];
  for (let i = 0; i < pos.count; i++) {
    let vx = pos.getX(i); const vy = pos.getY(i); let vz = pos.getZ(i);
    const t = clamp((vy + h / 2) / h, 0, 1);
    const ang = Math.atan2(vz, vx);
    const noise = Math.sin(ang * 3 + ph[0]) + Math.sin(ang * 5 + ph[1]) * 0.5 + Math.sin(vy * 0.5 + ph[2]) * 0.6;
    const disp = noise * rad * 0.12 * (1 - t);
    const rr = Math.hypot(vx, vz);
    if (rr > 1e-3) { const k = (rr + disp) / rr; vx *= k; vz *= k; }
    pos.setXYZ(i, vx, vy, vz);
    const line = snowLine + Math.sin(ang * 4 + ph[0]) * 0.04;
    let col;
    if (t > line) col = snowC;
    else if (t > line - 0.12) col = rockC.clone().lerp(snowC, (t - (line - 0.12)) / 0.12);
    else col = rockC;
    colors.push(col.r, col.g, col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}
function Mountains({ specs }) {
  const geos = useMemo(() => specs.map((s) => makeMountainGeo(s)), [specs]);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), []);
  useEffect(() => () => { geos.forEach((g) => g.dispose()); mat.dispose(); }, [geos, mat]);
  return (
    <group>
      {specs.map((s, i) => (
        <mesh key={i} geometry={geos[i]} material={mat} position={s.pos} rotation={[0, s.ry, 0]} dispose={null} />
      ))}
    </group>
  );
}

/* ----------------------------- nubes que derivan ----------------------------- */
function Clouds({ count, night }) {
  const ref = useRef();
  const clouds = useMemo(() => Array.from({ length: count }, () => {
    const a = Math.random() * TWO_PI;
    const d = 34 + Math.random() * 38;
    const blocks = 3 + Math.floor(Math.random() * 3);
    return {
      pos: [Math.cos(a) * d, 20 + Math.random() * 16, Math.sin(a) * d],
      blocks: Array.from({ length: blocks }, (_, b) => ({
        p: [b * 4.2 - blocks * 1.9, Math.random() * 1.6, (Math.random() - 0.5) * 2.2],
        s: [6 + Math.random() * 5, 2 + Math.random() * 1.6, 3.4 + Math.random() * 2.4],
      })),
      speed: 0.25 + Math.random() * 0.35,
    };
  }), [count]);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: night ? '#5b6885' : '#fbfdff', flatShading: true }), [night]);
  const geos = useMemo(() => clouds.flatMap((c) => c.blocks.map((bl) => new THREE.BoxGeometry(...bl.s))), [clouds]);
  useEffect(() => () => { mat.dispose(); geos.forEach((g) => g.dispose()); }, [mat, geos]);
  useFrame((_, delta) => {
    const g = ref.current; if (!g) return;
    const dt = Math.min(delta, 0.05);
    g.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * dt;
      if (cloud.position.x > 90) cloud.position.x = -90;
    });
  });
  let gi = 0;
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <group key={i} position={c.pos}>
          {c.blocks.map((bl, j) => (
            // eslint-disable-next-line no-plusplus
            <mesh key={j} position={bl.p} geometry={geos[gi++]} material={mat} dispose={null} />
          ))}
        </group>
      ))}
    </group>
  );
}

/* ----------------------------- lluvia ----------------------------- */
function Rain({ count }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 44;
      arr[i * 3 + 1] = Math.random() * 26;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: 0xaecbe8, size: 0.16, transparent: true, opacity: 0.5, depthWrite: false }), []);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame((_, delta) => {
    const pts = ref.current; if (!pts) return;
    const dt = Math.min(delta, 0.05);
    const arr = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= (16 + (i % 5)) * dt;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 26;
        arr[i * 3] = (Math.random() - 0.5) * 44;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 36;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });
  return <points ref={ref} geometry={geo} material={mat} dispose={null} />;
}

/* ----------------------------- composición ----------------------------- */
export default function LabEnvironment({ amb, budget = 0.8 }) {
  const seedRef = useRef();
  if (seedRef.current == null) seedRef.current = (Math.random() * 4294967296) >>> 0;

  const env = useMemo(() => {
    if (!amb) return null;
    const b = Math.max(0.3, budget);
    if (amb.space) return { space: true, b };

    const seed = (hashStr(amb.id) ^ seedRef.current) >>> 0;
    const rng = mulberry32(seed);
    const ph = Array.from({ length: 6 }, () => rng() * TWO_PI);
    const heightFn = makeHeight(ph);

    // paleta del terreno y la vegetación, teñida por el clima
    const tf = amb.night ? 0.55 : amb.warm ? 0.92 : 1;
    const warm = amb.warm ? 0.16 : 0;
    const peak = amb.night ? '#7f93a8' : amb.warm ? '#e8d6a0' : '#d8f0c8';
    const palette = { grassA: amb.grass[0], grassB: amb.grass[1], sand: amb.sand, peak };
    const leafPal = ['#3a9b46', '#2f8f3e', '#287a36', '#46a84e']
      .map((hex) => new THREE.Color(tintHex(hex, tf, warm)));

    // --- árboles (anillo de colinas, fuera de la pradera del montaje) ---
    const trunks = []; const leaves = [];
    const addTree = (x, gy, z, s, ry) => {
      trunks.push({ x, y: gy + 0.55 * s, z, s, ry });
      const layers = 2 + Math.floor(rng() * 2);
      for (let l = 0; l < layers; l++) {
        leaves.push({
          x, y: gy + (1.0 + l * 0.66) * s, z,
          sxz: s * (1.35 - l * 0.32), sy: s * 1.05, ry,
          color: leafPal[Math.floor(rng() * leafPal.length)],
        });
      }
    };
    const nTrees = amb.id === 'niebla' ? Math.round(30 * b) : Math.round(54 * b);
    for (let placed = 0, guard = 0; placed < nTrees && guard < nTrees * 7; guard++) {
      const a = rng() * TWO_PI; const d = R_FLAT + 3 + rng() * 52;
      const x = Math.cos(a) * d; const z = Math.sin(a) * d;
      const gy = heightFn(x, z);
      if (gy < SEA_Y + 0.7) continue;
      addTree(x, gy - 0.05, z, 1.0 + rng() * 1.6, rng() * Math.PI);
      placed++;
    }

    // --- rocas ---
    const rocks = [];
    const nRocks = Math.round(30 * b);
    for (let placed = 0, guard = 0; placed < nRocks && guard < nRocks * 7; guard++) {
      const a = rng() * TWO_PI; const d = R_FLAT + 1 + rng() * 56;
      const x = Math.cos(a) * d; const z = Math.sin(a) * d;
      const gy = heightFn(x, z);
      if (gy < SEA_Y + 0.6) continue;
      rocks.push({ x, y: gy + 0.1, z, s: 0.5 + rng() * 1.2, rx: rng() * Math.PI, ry: rng() * Math.PI });
      placed++;
    }

    // --- flores junto al escenario (anillo de pradera) ---
    const stems = []; const petals = [];
    const petalPal = ['#f472b6', '#fbbf24', '#f87171', '#c084fc', '#ffffff']
      .map((hex) => new THREE.Color(tintHex(hex, amb.night ? 0.6 : 1)));
    const nFlowers = Math.round(70 * b);
    for (let i = 0; i < nFlowers; i++) {
      const a = rng() * TWO_PI; const d = 22 + rng() * 12;
      const x = Math.cos(a) * d; const z = Math.sin(a) * d;
      const gy = heightFn(x, z);
      if (gy < SEA_Y + 0.6) continue;
      stems.push({ x, y: gy + 0.16, z });
      petals.push({ x, y: gy + 0.32, z, color: petalPal[Math.floor(rng() * petalPal.length)] });
    }

    // --- montañas (dos capas, la lejana más azulada/brumosa) ---
    const mountains = [];
    const rockPal = ['#5b7fb0', '#6f7fc4', '#3f8f8a', '#4a93b0', '#5566a8'];
    const mFactor = amb.night ? 0.5 : amb.warm ? 0.9 : 1;
    const mWarm = amb.warm ? 0.18 : 0;
    const haze = new THREE.Color(amb.horizon);
    const nNear = Math.max(8, Math.round(12 * b));
    for (let i = 0; i < nNear; i++) {
      const a = (i / nNear) * TWO_PI + (rng() - 0.5) * 0.5;
      const d = 86 + rng() * 22; const h = 18 + rng() * 18; const rad = 11 + rng() * 12;
      mountains.push({
        pos: [Math.cos(a) * d, SEA_Y + h / 2 - 1.5, Math.sin(a) * d], ry: rng() * TWO_PI,
        h, rad, sides: 7 + Math.floor(rng() * 3), seed: (seed ^ (i * 2749 + 13)) >>> 0,
        rock: tintHex(rockPal[Math.floor(rng() * rockPal.length)], mFactor, mWarm),
        snow: tintHex('#eef4fb', amb.night ? 0.6 : 1, mWarm * 0.5),
        snowLine: 0.6 + rng() * 0.08,
      });
    }
    const nFar = Math.max(6, Math.round(9 * b));
    for (let i = 0; i < nFar; i++) {
      const a = (i / nFar) * TWO_PI + (rng() - 0.5) * 0.6;
      const d = 116 + rng() * 26; const h = 24 + rng() * 22; const rad = 16 + rng() * 14;
      const rk = new THREE.Color(rockPal[Math.floor(rng() * rockPal.length)]).multiplyScalar(mFactor).lerp(haze, 0.45);
      mountains.push({
        pos: [Math.cos(a) * d, SEA_Y + h / 2 - 2, Math.sin(a) * d], ry: rng() * TWO_PI,
        h, rad, sides: 7 + Math.floor(rng() * 3), seed: (seed ^ (i * 9133 + 555)) >>> 0,
        rock: `#${rk.getHexString()}`,
        snow: tintHex('#eef4fb', amb.night ? 0.55 : 0.92, mWarm * 0.4),
        snowLine: 0.64 + rng() * 0.08,
      });
    }

    return {
      space: false, b, heightFn, palette,
      terrainSeed: (seed ^ 0x9e3779b9) >>> 0,
      seg: b > 0.7 ? 150 : 96,
      seaSeg: b > 0.5 ? 56 : 28,
      seaColor: amb.sea,
      trees: { trunks, leaves }, rocks, flowers: { stems, petals }, mountains,
    };
  }, [amb, budget]);

  if (!env) return null;

  if (env.space) {
    return (
      <group>
        <Skydome amb={amb} />
        <Astro amb={amb} />
        <Stars count={Math.round(460 * env.b)} />
        {amb.nebula && <Nebula />}
        {amb.planet && <Planet color={amb.planet} />}
      </group>
    );
  }

  const stars = amb.night ? Math.round(280 * env.b) : 0;
  const clouds = amb.id !== 'niebla' ? Math.max(3, Math.round(10 * env.b)) : 0;

  return (
    <group>
      <Skydome amb={amb} />
      <Astro amb={amb} />
      {stars > 0 && <Stars count={stars} />}
      <Terrain heightFn={env.heightFn} palette={env.palette} seed={env.terrainSeed} seg={env.seg} />
      <Sea color={env.seaColor} seg={env.seaSeg} />
      <Mountains specs={env.mountains} />
      {env.trees.trunks.length > 0 && <Trees trunks={env.trees.trunks} leaves={env.trees.leaves} />}
      {env.rocks.length > 0 && <Rocks items={env.rocks} />}
      {env.flowers.stems.length > 0 && <Flowers stems={env.flowers.stems} petals={env.flowers.petals} />}
      {clouds > 0 && <Clouds count={clouds} night={!!amb.night} />}
      {amb.rain && <Rain count={Math.round(420 * env.b)} />}
    </group>
  );
}
