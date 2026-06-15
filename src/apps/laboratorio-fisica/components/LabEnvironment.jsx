// Entorno 3D ambiental del laboratorio (r3f), inspirado en "La Fortaleza":
// cúpula de cielo con degradado, sol o luna, nubes geométricas que derivan,
// montañas low-poly lejanas, estrellas, lluvia y nebulosa. Todo procedural (sin
// assets) y SOLO decorativo: vive LEJOS (niebla de por medio) para no tapar el
// escenario central de cada simulación. Las cantidades escalan con la calidad.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const rnd = (a, b) => a + Math.random() * (b - a);

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
    // cielo vívido arriba, franja de brillo en el horizonte y base OSCURA debajo
    // (se funde con el suelo oscuro del escenario, sin corte brusco)
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
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} frustumCulled={false}>
      <sphereGeometry args={[185, 32, 20]} />
    </mesh>
  );
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
      const a = Math.random() * Math.PI * 2;       // azimut
      const e = 0.02 + (Math.random() ** 1.9) * 1.25; // elevación sesgada al horizonte (donde mira la cámara)
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
    <points geometry={geo}>
      <pointsMaterial color="#dfe8ff" size={2.2} sizeAttenuation={false} transparent opacity={0.95} depthWrite={false} fog={false} toneMapped={false} />
    </points>
  );
}

/* ----------------------------- nebulosa (sprites aditivos) ----------------------------- */
function Nebula() {
  const glow = useMemo(makeGlowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);
  const blobs = useMemo(() => Array.from({ length: 4 }, () => ({
    pos: [rnd(-90, 90), rnd(25, 80), -rnd(90, 150)],
    scale: rnd(60, 120),
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

/* ----------------------------- montañas lejanas ----------------------------- */
function Mountains({ count }) {
  const data = useMemo(() => {
    const palette = ['#3f6fb0', '#5b6fc4', '#2c8f8a', '#2f9e6b', '#4a6a9e'];
    return Array.from({ length: count }, (_, i) => {
      // repartidas por todo el horizonte, algo más cerca y altas → visibles tras el escenario
      const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const d = 58 + Math.random() * 30;
      const h = 17 + Math.random() * 20;
      const rad = 12 + Math.random() * 15;
      return {
        pos: [Math.cos(a) * d, h / 2 - 8, Math.sin(a) * d],
        rad, h, ry: Math.random() * Math.PI,
        color: palette[Math.floor(Math.random() * palette.length)],
        snow: h > 30,
      };
    });
  }, [count]);
  return (
    <group>
      {data.map((m, i) => (
        <group key={i} position={m.pos} rotation={[0, m.ry, 0]}>
          <mesh>
            <coneGeometry args={[m.rad, m.h, 5 + (i % 3)]} />
            <meshLambertMaterial color={m.color} flatShading />
          </mesh>
          {m.snow && (
            <mesh position={[0, m.h * 0.34, 0]}>
              <coneGeometry args={[m.rad * 0.34, m.h * 0.3, 5]} />
              <meshLambertMaterial color="#f1f5fb" flatShading />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/* ----------------------------- nubes que derivan ----------------------------- */
function Clouds({ count, night }) {
  const ref = useRef();
  const clouds = useMemo(() => Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const d = 34 + Math.random() * 38;
    const blocks = 3 + Math.floor(Math.random() * 3);
    return {
      pos: [Math.cos(a) * d, 15 + Math.random() * 16, Math.sin(a) * d],
      blocks: Array.from({ length: blocks }, (_, b) => ({
        p: [b * 4.2 - blocks * 1.9, Math.random() * 1.6, (Math.random() - 0.5) * 2.2],
        s: [6 + Math.random() * 5, 2 + Math.random() * 1.6, 3.4 + Math.random() * 2.4],
      })),
      speed: 0.25 + Math.random() * 0.35,
    };
  }), [count]);
  useFrame((_, delta) => {
    const g = ref.current; if (!g) return;
    const dt = Math.min(delta, 0.05);
    g.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * dt;
      if (cloud.position.x > 90) cloud.position.x = -90;
    });
  });
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: night ? '#5b6885' : '#fbfdff', flatShading: true }), [night]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <group key={i} position={c.pos}>
          {c.blocks.map((bl, j) => (
            <mesh key={j} position={bl.p} material={mat}>
              <boxGeometry args={bl.s} />
            </mesh>
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
  useEffect(() => () => geo.dispose(), [geo]);
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
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#aecbe8" size={0.16} transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

export default function LabEnvironment({ amb, budget = 0.8 }) {
  if (!amb) return null;
  const b = Math.max(0.3, budget);
  const stars = amb.night || amb.space ? Math.round((amb.space ? 460 : 280) * b) : 0;
  const clouds = !amb.space && amb.id !== 'niebla' ? Math.max(3, Math.round(10 * b)) : 0;
  const mountains = amb.mountains ? Math.max(6, Math.round(12 * b)) : 0;
  const rain = amb.rain ? Math.round(420 * b) : 0;
  return (
    <group>
      <Skydome amb={amb} />
      <Astro amb={amb} />
      {stars > 0 && <Stars count={stars} />}
      {amb.nebula && <Nebula />}
      {mountains > 0 && <Mountains count={mountains} />}
      {clouds > 0 && <Clouds count={clouds} night={!!amb.night} />}
      {rain > 0 && <Rain count={rain} />}
    </group>
  );
}
