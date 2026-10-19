// src/apps/sistema-solar/scene/SolarScene.jsx
// Escena del Sistema Solar (contenido del <Canvas>): Sol con superficie
// animada y corona, planetas con inclinación del eje y giro real relativo,
// Tierra día/noche con nubes, atmósferas con borde de Fresnel, anillos con
// sombra, cinturones de asteroides y de Kuiper, Vía Láctea y cámara con
// vuelos suaves. Tres escalas (layout.js) con transición animada.
//
// Rendimiento: geometrías/materiales en useMemo y liberados al desmontar,
// cinturones instanciados y estáticos (gira el grupo, no cada roca),
// presupuesto por calidad en quality.js.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { FACTS, PLANET_IDS } from '../model/planetFacts';
import { textureSet, RING_TEXTURE } from './textures';
import {
  createSunMaterial, createCoronaMaterial, createAtmosphereMaterial, createEarthMaterial,
  createRingMaterial, createOrbitMaterial, createOrbitGeometry, glowTexture,
} from './materials';
import {
  VISUAL, bodySize, orbitRadius, lineupX, beltScale, cameraView, meanLongitude, orbitRate, spinRate, orbitXZ, DEG,
} from './layout';

const NAMES = Object.fromEntries(Object.values(FACTS).map((f) => [f.id, f.name]));

const ATMOS = {
  venus: { color: '#ffd89a', power: 2.4, intensity: 1.2 },
  earth: { color: '#5ab8ff', power: 2.8, intensity: 1.45, sunset: 0.1 },
  mars: { color: '#ff9a6b', power: 3.6, intensity: 0.65 },
  jupiter: { color: '#f3d7a8', power: 3.4, intensity: 0.7 },
  saturn: { color: '#f5deb0', power: 3.4, intensity: 0.65 },
  uranus: { color: '#9cf3ff', power: 2.6, intensity: 1.1 },
  neptune: { color: '#6f8dff', power: 2.6, intensity: 1.15 },
};

const ORBIT_COLORS = {
  mercury: '#b8b8c8', venus: '#f0b86a', earth: '#4fc3f7', mars: '#ff7a50',
  jupiter: '#ffcf70', saturn: '#f5c27a', uranus: '#80e5f0', neptune: '#7d8cff',
};

const RINGS = {
  saturn: { inner: 1.31, outer: 2.34, tex: true, opacity: 0.96 },
  uranus: { inner: 1.62, outer: 2.04, tex: false, opacity: 0.55, tint: '#b9c7d8', bands: true },
};

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const damp = (dt, rate = 3.2) => 1 - Math.exp(-dt * rate);

function useDispose(...objs) {
  useEffect(() => () => objs.forEach((o) => o?.dispose?.()), objs); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ───────────────────────── Fondo ───────────────────────── */

function Backdrop({ milky, starCount }) {
  const ref = useRef();
  const camera = useThree((s) => s.camera);
  useFrame(() => { if (ref.current) ref.current.position.copy(camera.position); });
  return (
    <group ref={ref}>
      <mesh scale={5200} renderOrder={-10}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshBasicMaterial map={milky} side={THREE.BackSide} depthWrite={false} color="#c4c9f0" toneMapped={false} />
      </mesh>
      <Stars radius={1400} depth={600} count={starCount} factor={22} saturation={0.15} fade speed={0.5} />
    </group>
  );
}

/* ───────────────────────── Sol ───────────────────────── */

function SunBody({ tex, Q, mode, register, onClick, showLabel, extras, sim }) {
  const group = useRef();
  const corona = useRef();
  const camera = useThree((s) => s.camera);
  const sunMat = useMemo(() => createSunMaterial(tex), [tex]);
  const coronaMat = useMemo(() => createCoronaMaterial({ rays: Q.coronaRays }), [Q.coronaRays]);
  const geo = useMemo(() => new THREE.SphereGeometry(1, Q.seg, Math.round(Q.seg / 2)), [Q.seg]);
  useDispose(sunMat, coronaMat, geo);
  const cur = useRef({ size: bodySize('sun', mode) });

  useEffect(() => { register('sun', group); }, [register]);

  useFrame(({ clock }, dt) => {
    cur.current.size += (bodySize('sun', mode) - cur.current.size) * damp(dt);
    sim.sizes.sun = cur.current.size;
    if (group.current) group.current.scale.setScalar(cur.current.size);
    const t = clock.getElapsedTime();
    sunMat.uniforms.uTime.value = t;
    coronaMat.uniforms.uTime.value = t;
    if (corona.current) corona.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={group}>
      <mesh geometry={geo} material={sunMat} />
      <mesh ref={corona} material={coronaMat} renderOrder={2}>
        <planeGeometry args={[6.4, 6.4]} />
      </mesh>
      <HitSphere id="sun" radius={1.05} onClick={onClick} />
      {showLabel && <BodyLabel id="sun" y={1.25} onClick={onClick} />}
      {extras?.('sun')}
    </group>
  );
}

/* ───────────────────────── Piezas comunes ───────────────────────── */

function HitSphere({ id, radius, onClick }) {
  if (!onClick) return null;
  return (
    <mesh
      scale={radius}
      onClick={(e) => { if (e.delta > 6) return; e.stopPropagation(); onClick(id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = ''; }}
    >
      <sphereGeometry args={[1, 12, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  );
}

function BodyLabel({ id, y, onClick, dim }) {
  return (
    <Html position={[0, y, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: onClick ? 'auto' : 'none' }}>
      <button
        type="button"
        className={`ss-label ss-label--${id} ${dim ? 'is-dim' : ''}`}
        style={{ '--pc': ORBIT_COLORS[id] || '#fbbf24' }}
        tabIndex={-1}
        onClick={(e) => { e.stopPropagation(); onClick?.(id); }}
      >
        {NAMES[id]}
      </button>
    </Html>
  );
}

function Rings({ id, tex, Q, sim, groupRef }) {
  const cfg = RINGS[id];
  const mat = useMemo(() => createRingMaterial({
    map: cfg.tex ? tex : null, inner: cfg.inner, outer: cfg.outer, planetRadius: 1,
    tint: cfg.tint, opacity: cfg.opacity, bands: cfg.bands,
  }), [cfg, tex]);
  const geo = useMemo(() => new THREE.RingGeometry(cfg.inner, cfg.outer, Q.ringSeg, 1), [cfg, Q.ringSeg]);
  useDispose(mat, geo);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(v);
    mat.uniforms.uPlanetPos.value.copy(v);
    mat.uniforms.uPlanetR.value = sim.sizes[id] || 1;
  });
  return <mesh geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3} />;
}

function Atmosphere({ id }) {
  const cfg = ATMOS[id];
  const mat = useMemo(() => (cfg ? createAtmosphereMaterial(cfg) : null), [cfg]);
  useDispose(mat);
  if (!mat) return null;
  return (
    <mesh material={mat} scale={id === 'earth' ? 1.045 : 1.06} renderOrder={4}>
      <sphereGeometry args={[1, 48, 32]} />
    </mesh>
  );
}

function Marker({ id, visible }) {
  const tex = glowTexture();
  return (
    <sprite visible={visible} scale={[0.022, 0.022, 1]} renderOrder={5}>
      <spriteMaterial map={tex} color={ORBIT_COLORS[id]} transparent depthWrite={false} sizeAttenuation={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

/* ───────────────────────── Planeta ───────────────────────── */

function PlanetBody({ id, textures, Q, mode, sim, paused, speed, spin, register, onClick, showLabel, labelDim, extras, children }) {
  const pos = useRef();
  const scaleG = useRef();
  const spinMesh = useRef();
  const clouds = useRef();
  const labelG = useRef();
  const order = PLANET_IDS.indexOf(id);
  const f = FACTS[id];
  const cur = useRef({ dist: orbitRadius(id, mode), size: bodySize(id, mode), blend: mode === 'tamanos' ? 1 : 0 });
  const geo = useMemo(() => new THREE.SphereGeometry(1, Q.seg, Math.round(Q.seg / 2)), [Q.seg]);
  const earthMat = useMemo(() => (id === 'earth' ? createEarthMaterial(textures.earth, textures.earthNight) : null), [id, textures]);
  useDispose(geo, earthMat);

  useEffect(() => { register(id, pos); }, [register, id]);

  useFrame((_, dt) => {
    const c = cur.current;
    const k = damp(dt);
    c.dist += (orbitRadius(id, mode) - c.dist) * k;
    c.size += (bodySize(id, mode) - c.size) * k;
    c.blend += ((mode === 'tamanos' ? 1 : 0) - c.blend) * k;
    if (!paused) sim.angles[id] = (sim.angles[id] || 0) + orbitRate(id) * speed * dt;
    sim.sizes[id] = c.size;
    const [ox, oz] = orbitXZ(sim.angles[id] || 0, c.dist);
    if (pos.current) pos.current.position.set(ox + (lineupX(id) - ox) * c.blend, 0, oz * (1 - c.blend));
    if (scaleG.current) scaleG.current.scale.setScalar(c.size);
    if (spinMesh.current) spinMesh.current.rotation.y += spinRate(id) * spin * dt;
    if (clouds.current) clouds.current.rotation.y += spinRate(id) * spin * dt * 1.18;
    if (labelG.current) {
      // en la fila de tamaños los planetas pequeños alternan la etiqueta arriba/abajo
      const above = c.size * (id === 'saturn' ? 1.7 : 1.45);
      const small = mode === 'tamanos' && f.radiusRel < 2;
      labelG.current.position.y = small ? (order % 2 === 0 ? above + 2.6 : -above - 2.6) : above;
    }
  });

  // eje inclinado hacia la cámara inicial: los anillos de Saturno se ven abiertos
  const tilt = (f.obliquityDeg || 0) * DEG;
  const hasRing = !!RINGS[id];

  return (
    <group ref={pos}>
      <group ref={scaleG}>
        <group rotation={[tilt, 0, 0]}>
          <mesh ref={spinMesh} geometry={geo} material={earthMat || undefined}>
            {!earthMat && <meshStandardMaterial map={textures[id]} roughness={f.kind === 'planet' && f.radiusRel > 3 ? 1 : 0.92} metalness={0} />}
          </mesh>
          {id === 'earth' && (
            <mesh ref={clouds} geometry={geo} scale={1.012}>
              <meshStandardMaterial alphaMap={textures.clouds} color="#ffffff" transparent depthWrite={false} opacity={0.9} roughness={1} />
            </mesh>
          )}
          {hasRing && <Rings id={id} tex={textures.ring} Q={Q} sim={sim} groupRef={pos} />}
        </group>
        <Atmosphere id={id} />
        <Marker id={id} visible={mode === 'distancias'} />
        <HitSphere id={id} radius={hasRing ? 1.6 : 1.7} onClick={onClick} />
        {extras?.(id)}
      </group>
      {showLabel && !(mode === 'distancias' && ['mercury', 'venus', 'mars'].includes(id)) && (
        <group ref={labelG}><BodyLabel id={id} y={0} onClick={onClick} dim={labelDim} /></group>
      )}
      {children}
    </group>
  );
}

function MoonBody({ textures, Q, mode, sim, paused, speed, register, onClick, showLabel, extras }) {
  const pos = useRef();
  const scaleG = useRef();
  const mesh = useRef();
  const cur = useRef({ dist: orbitRadius('moon', mode), size: bodySize('moon', mode), blend: mode === 'tamanos' ? 1 : 0 });
  const geo = useMemo(() => new THREE.SphereGeometry(1, Math.max(24, Q.seg / 2), Math.max(16, Q.seg / 4)), [Q.seg]);
  const orbitGeo = useMemo(() => createOrbitGeometry(128), []);
  const orbitMat = useMemo(() => createOrbitMaterial('#d9dee8', 0.16), []);
  useDispose(geo, orbitGeo, orbitMat);
  const orbitRef = useRef();
  useEffect(() => { register('moon', pos); }, [register]);

  useFrame((_, dt) => {
    const c = cur.current;
    const k = damp(dt);
    c.dist += (orbitRadius('moon', mode) - c.dist) * k;
    c.size += (bodySize('moon', mode) - c.size) * k;
    c.blend += ((mode === 'tamanos' ? 1 : 0) - c.blend) * k;
    if (!paused) sim.angles.moon = (sim.angles.moon || 0) + orbitRate('moon') * speed * dt;
    sim.sizes.moon = c.size;
    const a = sim.angles.moon || 0;
    const [ox, oz] = orbitXZ(a, c.dist);
    const parent = sim.sizes.earth || 1;
    const lx = 0;
    const lz = parent + c.size + 1.4;
    if (pos.current) pos.current.position.set(ox * (1 - c.blend) + lx * c.blend, 0, oz * (1 - c.blend) + lz * c.blend);
    if (scaleG.current) scaleG.current.scale.setScalar(c.size);
    if (mesh.current) mesh.current.rotation.y = a + Math.PI; // rotación síncrona: siempre la misma cara
    if (orbitRef.current) {
      orbitRef.current.scale.setScalar(Math.max(0.001, c.dist));
      orbitRef.current.visible = c.blend < 0.5;
      orbitMat.uniforms.uAngle.value = a;
    }
  });

  return (
    <>
      <lineLoop ref={orbitRef} geometry={orbitGeo} material={orbitMat} />
      <group ref={pos}>
        <group ref={scaleG}>
          <mesh ref={mesh} geometry={geo}>
            <meshStandardMaterial map={textures.moon} roughness={1} metalness={0} />
          </mesh>
          <HitSphere id="moon" radius={2.4} onClick={onClick} />
          {showLabel && <BodyLabel id="moon" y={1.8} onClick={onClick} dim />}
          {extras?.('moon')}
        </group>
      </group>
    </>
  );
}

/* ───────────────────────── Órbitas y cinturones ───────────────────────── */

function OrbitLine({ id, mode, sim, opacity, visible }) {
  const ref = useRef();
  const geo = useMemo(() => createOrbitGeometry(256), []);
  const mat = useMemo(() => createOrbitMaterial(ORBIT_COLORS[id], 0.22), [id]);
  useDispose(geo, mat);
  const cur = useRef({ r: orbitRadius(id, mode), fade: mode === 'tamanos' ? 0 : 1 });
  useFrame((_, dt) => {
    const c = cur.current;
    const k = damp(dt);
    c.r += (orbitRadius(id, mode) - c.r) * k;
    c.fade += ((mode === 'tamanos' || !visible ? 0 : 1) - c.fade) * damp(dt, 5);
    if (ref.current) {
      ref.current.scale.setScalar(Math.max(0.001, c.r));
      ref.current.visible = c.fade > 0.02;
    }
    mat.uniforms.uAngle.value = sim.angles[id] || 0;
    mat.uniforms.uFade.value = c.fade;
    mat.uniforms.uOpacity.value = opacity;
  });
  return <lineLoop ref={ref} geometry={geo} material={mat} />;
}

function rockGeometry(seed = 1) {
  const g = new THREE.IcosahedronGeometry(1, 0);
  const p = g.attributes.position;
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < p.count; i++) {
    const k = 0.7 + rnd() * 0.55;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

// Radio medio del cinturón y su anchura (unidades de la escala visual)
const BELT_R = 33.5;

function AsteroidBelt({ count, mode, speed, paused, showLabel, focused }) {
  const group = useRef();
  const inst = useRef();
  const mat = useRef();
  const geo = useMemo(() => rockGeometry(7), []);
  useDispose(geo);
  const cur = useRef({ s: beltScale(mode, 'asteroid'), vis: mode === 'tamanos' ? 0 : 1 });

  useEffect(() => {
    const m = inst.current;
    if (!m) return;
    const d = new THREE.Object3D();
    let s = 12345;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = BELT_R + (rnd() + rnd() + rnd() - 1.5) * 3.4;
      d.position.set(Math.cos(a) * r, (rnd() - 0.5) * 1.6, Math.sin(a) * r);
      d.rotation.set(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3);
      const base = 0.03 + rnd() ** 3 * 0.2;
      d.scale.set(base * (0.7 + rnd() * 0.6), base * (0.6 + rnd() * 0.5), base);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count]);

  useFrame((_, dt) => {
    const c = cur.current;
    c.s += (beltScale(mode, 'asteroid') - c.s) * damp(dt);
    c.vis += ((mode === 'tamanos' ? 0 : 1) - c.vis) * damp(dt, 4);
    if (!group.current) return;
    // Con un astro enfocado la cámara está tan cerca que las rocas del fondo
    // parecen escombros junto al planeta (y confunden: el cinturón está entre
    // Marte y Júpiter). Se desvanece al enfocar y vuelve en la vista general.
    const near = focused ? 0 : 1;
    c.near = (c.near ?? near) + (near - (c.near ?? near)) * damp(dt, 6);
    if (mat.current) {
      mat.current.opacity = c.near;
      mat.current.transparent = c.near < 0.99;
      mat.current.depthWrite = c.near >= 0.99;
    }
    group.current.scale.setScalar(c.s * Math.max(0.001, c.vis));
    group.current.visible = c.vis > 0.02 && c.near > 0.02;
    if (!paused) group.current.rotation.y += ((2 * Math.PI) / (60 * 4.4)) * speed * dt; // ~2,7 UA: T ≈ 4,4 años
  });

  return (
    <group ref={group}>
      <instancedMesh ref={inst} args={[geo, null, count]} frustumCulled={false}>
        <meshStandardMaterial ref={mat} color="#9b8a74" roughness={1} metalness={0} flatShading />
      </instancedMesh>
      {showLabel && (
        <Html position={[0, 2.2, BELT_R]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="ss-label ss-label--belt">Cinturón de asteroides</div>
        </Html>
      )}
    </group>
  );
}

function KuiperBelt({ count, mode, speed, paused, showLabel }) {
  const group = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    let s = 999;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 98 + (rnd() + rnd() - 1) * 14;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (rnd() - 0.5) * 9;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useDispose(geo);
  const cur = useRef({ s: beltScale(mode, 'kuiper'), vis: mode === 'tamanos' ? 0 : 1 });
  useFrame((_, dt) => {
    const c = cur.current;
    c.s += (beltScale(mode, 'kuiper') - c.s) * damp(dt);
    c.vis += ((mode === 'tamanos' ? 0 : 1) - c.vis) * damp(dt, 4);
    if (!group.current) return;
    group.current.scale.setScalar(c.s);
    group.current.visible = c.vis > 0.05;
    if (!paused) group.current.rotation.y += ((2 * Math.PI) / (60 * 250)) * speed * dt;
  });
  if (!count) return null;
  return (
    <group ref={group}>
      <points geometry={geo}>
        <pointsMaterial color="#9fb6e0" size={0.32} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
      </points>
      {showLabel && (
        <Html position={[0, 6, 98]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="ss-label ss-label--belt">Cinturón de Kuiper · Plutón</div>
        </Html>
      )}
    </group>
  );
}

function ShootingStars({ count }) {
  const ref = useRef();
  const camera = useThree((s) => s.camera);
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({ t: -(3 + i * 4.5), dur: 1.2, from: new THREE.Vector3(), dir: new THREE.Vector3() })), [count]);
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 0.03), []);
  useDispose(geo);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    items.forEach((it, i) => {
      const m = g.children[i];
      it.t += dt;
      if (it.t > it.dur) {
        it.t = -(6 + Math.random() * 14);
        it.from.set((Math.random() - 0.5) * 900, 150 + Math.random() * 250, (Math.random() - 0.5) * 900).add(camera.position);
        it.dir.set(Math.random() - 0.5, -0.4 - Math.random() * 0.4, Math.random() - 0.5).normalize();
      }
      if (!m) return;
      m.visible = it.t > 0;
      if (it.t > 0) {
        const p = it.t / it.dur;
        m.position.copy(it.from).addScaledVector(it.dir, p * 260);
        m.quaternion.copy(camera.quaternion);
        m.scale.set(40, 40, 1);
        m.material.opacity = Math.sin(p * Math.PI) * 0.8;
      }
    });
  });
  if (!count) return null;
  return (
    <group ref={ref}>
      {items.map((_, i) => (
        <mesh key={i} geometry={geo} visible={false}>
          <meshBasicMaterial color="#cfe1ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────────────────── Cámara ───────────────────────── */

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function CameraRig({ focusId, mode, sim, bodies, reduced, frame, introRef }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const size = useThree((s) => s.size);
  const flight = useRef(null);
  const lastP = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!controls) return;
    const intro = introRef.current;
    introRef.current = false;
    if (intro) camera.position.set(0, 300, 640);
    flight.current = {
      from: camera.position.clone(),
      fromT: controls.target.clone(),
      t: 0,
      dur: reduced ? 0.01 : intro ? 3.6 : focusId ? 1.9 : 1.6,
    };
  }, [focusId, mode, controls, camera, reduced, introRef]);

  useFrame((_, dt) => {
    if (!controls) return;
    const aspect = size.width / Math.max(1, size.height);
    let destT;
    let destP;
    let minD = 2;
    let maxD = cameraView(mode).maxDistance;
    const body = focusId && bodies.current[focusId]?.current;
    if (body) {
      body.getWorldPosition(_v1);
      const r = sim.sizes[focusId] || 1;
      const ext = focusId === 'saturn' ? 2.1 : 1;
      const dist = r * ext * 4.6 * Math.max(1, 1.25 / aspect);
      // vista de 3/4 desde el lado del Sol: se ve el terminador día/noche
      const sunward = _v2.copy(_v1).negate();
      if (sunward.lengthSq() < 1e-6) sunward.set(0.4, 0, 1);
      sunward.normalize();
      const side = _v3.crossVectors(UP, sunward).normalize();
      const dir = sunward.multiplyScalar(focusId === 'sun' ? 0.2 : 0.55).add(side.multiplyScalar(0.8)).addScaledVector(UP, 0.32).normalize();
      destP = _v1.clone().addScaledVector(dir, dist);
      destT = _v1.clone();
      // desplaza el encuadre para que el panel no tape el astro
      if (frame === 'left') destT.addScaledVector(new THREE.Vector3().crossVectors(dir, UP).normalize(), r * ext * 1.1);
      if (frame === 'bottom') destT.addScaledVector(UP, -r * ext * (aspect < 0.8 ? 2.1 : 1.05));
      minD = r * 1.25;
      maxD = Math.max(r * 30, 60);
    } else {
      const v = cameraView(mode);
      destP = _v1.set(...v.pos).clone();
      if (aspect < 1) destP.multiplyScalar(1 + (1 - aspect) * 0.9);
      destT = new THREE.Vector3(...v.target);
    }
    controls.minDistance = minD;
    controls.maxDistance = maxD;

    const f = flight.current;
    if (f) {
      f.t = Math.min(1, f.t + dt / f.dur);
      const e = easeInOut(f.t);
      camera.position.lerpVectors(f.from, destP, e);
      camera.position.y += Math.sin(Math.PI * e) * f.from.distanceTo(destP) * 0.12;
      controls.target.lerpVectors(f.fromT, destT, e);
      controls.enabled = false;
      if (f.t >= 1) {
        flight.current = null;
        controls.enabled = true;
        lastP.current.copy(destT);
      }
    } else if (body) {
      // sigue al astro manteniendo la vista que haya elegido el alumno
      const delta = destT.clone().sub(lastP.current);
      camera.position.add(delta);
      controls.target.add(delta);
      lastP.current.copy(destT);
    }
  });
  return null;
}

/* ───────────────────────── Escena ───────────────────────── */

export default function SolarScene({
  Q, mode = 'visual', focusId = null, paused = false, speed = 1, spin = 1,
  showOrbits = true, orbitOpacity = 0.22, showLabels = true, onBodyClick, extras, reduced = false,
  frame = 'center', simRef, interactive = true,
}) {
  const T = textureSet(Q.tex);
  const loaded = useTexture({
    sun: T.sun, mercury: T.mercury, venus: T.venus, earth: T.earth, earthNight: T.earthNight, clouds: T.clouds,
    moon: T.moon, mars: T.mars, jupiter: T.jupiter, saturn: T.saturn, uranus: T.uranus, neptune: T.neptune,
    milky: T.milky, ring: RING_TEXTURE,
  });
  const gl = useThree((s) => s.gl);
  useMemo(() => {
    const aniso = Math.min(4, gl.capabilities.getMaxAnisotropy());
    Object.entries(loaded).forEach(([k, t]) => {
      if (k !== 'clouds') t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      t.needsUpdate = true;
    });
  }, [loaded, gl]);

  const fallbackSim = useRef(null);
  if (!fallbackSim.current) {
    const now = new Date();
    fallbackSim.current = { angles: Object.fromEntries([...PLANET_IDS.map((id) => [id, meanLongitude(id, now)]), ['moon', 0]]), sizes: {}, years: 0 };
  }
  const sim = simRef?.current || fallbackSim.current;
  const bodies = useRef({});
  const register = useMemo(() => (id, ref) => { bodies.current[id] = ref; }, []);
  const introRef = useRef(true);

  useFrame((_, dt) => { if (!paused) sim.years += (speed * dt) / 60; });

  const click = interactive ? onBodyClick : undefined;
  const labels = showLabels && !focusId;

  return (
    <>
      <color attach="background" args={['#010208']} />
      <ambientLight intensity={0.16} color="#9db0ff" />
      <pointLight position={[0, 0, 0]} intensity={2.8} decay={0} distance={0} color="#fff3dd" />
      <Backdrop milky={loaded.milky} starCount={Q.stars} />
      <ShootingStars count={Q.shooting} />

      <SunBody tex={loaded.sun} Q={Q} mode={mode} register={register} onClick={click} showLabel={labels && mode !== 'distancias'} extras={extras} sim={sim} />
      {PLANET_IDS.map((id) => (
        <React.Fragment key={id}>
          <PlanetBody
            id={id} textures={loaded} Q={Q} mode={mode} sim={sim} paused={paused} speed={speed} spin={spin}
            register={register} onClick={click} showLabel={labels} extras={extras}
          >
            {id === 'earth' && (
              <MoonBody textures={loaded} Q={Q} mode={mode} sim={sim} paused={paused} speed={speed} register={register} onClick={click} showLabel={false} extras={extras} />
            )}
          </PlanetBody>
          <OrbitLine id={id} mode={mode} sim={sim} opacity={orbitOpacity} visible={showOrbits} />
        </React.Fragment>
      ))}
      <AsteroidBelt count={Q.asteroids} mode={mode} speed={speed} paused={paused} showLabel={labels && mode === 'visual'} focused={!!focusId} />
      <KuiperBelt count={Q.kuiper} mode={mode} speed={speed} paused={paused} showLabel={labels && mode === 'visual'} />

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan={false} rotateSpeed={0.6} zoomSpeed={0.9} />
      <CameraRig focusId={focusId} mode={mode} sim={sim} bodies={bodies} reduced={reduced} frame={frame} introRef={introRef} />
    </>
  );
}

export { VISUAL };
