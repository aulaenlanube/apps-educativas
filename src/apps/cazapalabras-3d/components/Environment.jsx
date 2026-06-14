// Entorno 3D cinematográfico CALMADO (sin sensación de desplazamiento → no marea):
//  · Skydome con shader (gradiente + nebulosa FBM muy lenta).
//  · Suelo con shader tipo Tron ESTÁTICO (rejilla AA por fwidth + pulso de energía
//    radial que NO traslada la rejilla). En tier 'low' una CanvasTexture más barata.
//  · 3 capas de estrellas FIJAS (sin parallax hacia la cámara).
//  · Estructuras flotantes que giran sobre sí mismas EN SU SITIO (no pasan de largo):
//    obeliscos, anillos de energía y esquirlas.
// Los elementos luminosos se marcan en BLOOM_LAYER para el bloom selectivo.
// Todo el decorado escala con particleBudget (∝ tier de calidad).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOOM_LAYER } from '../engine/config';

const markBloom = (o) => { if (o) o.layers.enable(BLOOM_LAYER); };

/* ───────────────────────── Skydome ───────────────────────── */
const SKY_VERT = /* glsl */`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAG = /* glsl */`
  precision highp float;
  varying vec3 vDir;
  uniform float uTime;
  uniform float uOctaves;
  float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
  float noise(vec3 p){
    vec3 i = floor(p); vec3 f = fract(p);
    f = f*f*(3.0-2.0*f);
    float n000=hash(i), n100=hash(i+vec3(1,0,0)), n010=hash(i+vec3(0,1,0)), n110=hash(i+vec3(1,1,0));
    float n001=hash(i+vec3(0,0,1)), n101=hash(i+vec3(1,0,1)), n011=hash(i+vec3(0,1,1)), n111=hash(i+vec3(1,1,1));
    float nx00=mix(n000,n100,f.x), nx10=mix(n010,n110,f.x), nx01=mix(n001,n101,f.x), nx11=mix(n011,n111,f.x);
    return mix(mix(nx00,nx10,f.y), mix(nx01,nx11,f.y), f.z);
  }
  float fbm(vec3 p){
    float v=0.0, a=0.5;
    for(int i=0;i<5;i++){ if(float(i)>=uOctaves) break; v+=a*noise(p); p*=2.02; a*=0.5; }
    return v;
  }
  void main(){
    float h = clamp(vDir.y*0.5+0.5, 0.0, 1.0);
    vec3 top = vec3(0.02,0.03,0.10);
    vec3 mid = vec3(0.05,0.06,0.18);
    vec3 bot = vec3(0.02,0.02,0.06);
    vec3 base = mix(bot, mix(mid, top, smoothstep(0.45,1.0,h)), smoothstep(0.0,0.55,h));
    // nebulosa
    vec3 q = vDir*2.2 + vec3(0.0, 0.0, uTime*0.02);
    float n = fbm(q);
    float neb = smoothstep(0.55, 0.95, n) * smoothstep(0.05, 0.5, h);
    vec3 nebCol = mix(vec3(0.25,0.10,0.45), vec3(0.05,0.25,0.5), n);
    vec3 col = base + nebCol * neb * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Skydome({ tier }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOctaves: { value: tier === 'high' ? 5 : tier === 'medium' ? 3 : 2 } },
    vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, fog: false, depthWrite: false,
  }), [tier]);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((_, dt) => { mat.uniforms.uTime.value += dt; });
  return (
    <mesh material={mat} frustumCulled={false}>
      <sphereGeometry args={[200, 32, 24]} />
    </mesh>
  );
}

/* ───────────────────────── Suelo shader (Tron) ───────────────────────── */
const FLOOR_VERT = /* glsl */`
  varying vec3 vWorld;
  void main(){
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const FLOOR_FRAG = /* glsl */`
  precision highp float;
  varying vec3 vWorld;
  uniform float uTime;
  void main(){
    vec2 coord = vWorld.xz * 0.22;          // rejilla ESTÁTICA (sin scroll → no marea)
    vec2 g = abs(fract(coord) - 0.5);
    vec2 d = fwidth(coord) * 1.5 + 1e-4;
    vec2 l = vec2(1.0) - smoothstep(vec2(0.0), d, g);
    float grid = clamp(max(l.x, l.y), 0.0, 1.0);
    float dist = length(vWorld.xz);
    float fade = 1.0 - smoothstep(20.0, 130.0, dist);
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0 - dist * 0.16);
    vec3 base = vec3(0.015, 0.03, 0.07);
    vec3 lineCol = mix(vec3(0.10,0.65,1.0), vec3(0.55,0.25,1.0), pulse);
    vec3 col = base + lineCol * grid * (0.45 + 0.7 * pulse) * fade;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function makeGridTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#070a18'; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(56,189,248,0.55)'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(56,189,248,0.18)'; ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const p = (s / 4) * i;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(s, p); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 80);
  return tex;
}

function Floor({ tier }) {
  if (tier === 'low') {
    return <FloorCanvas />;
  }
  return <FloorShader />;
}

function FloorShader() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } }, vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, fog: false,
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((_, dt) => { mat.uniforms.uTime.value += dt; });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]} material={mat}>
      <planeGeometry args={[200, 280]} />
    </mesh>
  );
}

function FloorCanvas() {
  const grid = useMemo(makeGridTexture, []);
  useEffect(() => () => grid.dispose(), [grid]); // rejilla estática (sin scroll → no marea)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]} receiveShadow>
      <planeGeometry args={[160, 240]} />
      <meshStandardMaterial map={grid} color="#0a0f24" emissive="#0b2a44" emissiveIntensity={0.35} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

/* ───────────────────────── Estrellas FIJAS (sin parallax → no marea) ───────────────────────── */
function StarLayer({ count, size, color, spread, opacity }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = Math.random() * 70 + 2;
      pos[i * 3 + 2] = -Math.random() * 200 - 10;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, spread]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <points ref={(o) => { ref.current = o; markBloom(o); }} geometry={geo}>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} sizeAttenuation depthWrite={false} toneMapped={false} />
    </points>
  );
}

/* ───────────────────────── Estructuras flotantes (giran EN SU SITIO, no se trasladan) ───────────────────────── */
function FlyByStructures({ count }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => {
    const kind = i % 3; // 0 obelisco · 1 anillo · 2 esquirla
    const side = i % 2 === 0 ? -1 : 1;
    return {
      kind, side,
      x: side * (11 + Math.random() * 13),
      y: kind === 1 ? 4 + Math.random() * 8 : (kind === 2 ? 3 + Math.random() * 10 : 0),
      h: 3 + Math.random() * 8,
      z: -14 - Math.random() * 180, // repartidas en profundidad, sin acercarse nunca
      hue: Math.random() < 0.5 ? '#6d28d9' : '#0e7490',
      rot: Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.5, // giro lento sobre sí mismas
    };
  }), [count]);
  const refs = useRef([]);
  useFrame((_, dt) => {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.rot += it.spin * dt; // solo rota en su sitio (sin trasladarse → no marea)
      const m = refs.current[i];
      if (m) {
        m.position.set(it.x, it.kind === 0 ? it.h / 2 : it.y, it.z);
        m.rotation.set(it.kind === 2 ? it.rot : 0, it.kind === 1 ? it.rot : it.rot * 0.3, it.kind === 1 ? Math.PI / 2.4 : 0);
      }
    }
  });
  return (
    <group>
      {items.map((it, i) => {
        const setRef = (el) => { refs.current[i] = el; };
        if (it.kind === 1) {
          return (
            <mesh key={i} ref={(el) => { setRef(el); markBloom(el); }}>
              <torusGeometry args={[2.4 + (i % 3) * 0.7, 0.16, 10, 36]} />
              <meshStandardMaterial color="#0b1026" emissive={it.hue} emissiveIntensity={1.6} metalness={0.5} roughness={0.3} toneMapped={false} />
            </mesh>
          );
        }
        if (it.kind === 2) {
          return (
            <mesh key={i} ref={(el) => { setRef(el); markBloom(el); }}>
              <octahedronGeometry args={[0.7 + (i % 4) * 0.25, 0]} />
              <meshStandardMaterial color="#0b1026" emissive={it.hue} emissiveIntensity={1.2} metalness={0.7} roughness={0.25} toneMapped={false} />
            </mesh>
          );
        }
        return (
          <mesh key={i} ref={setRef} castShadow>
            <boxGeometry args={[1.1, it.h, 1.1]} />
            <meshStandardMaterial color="#0b1026" emissive={it.hue} emissiveIntensity={0.7} metalness={0.6} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Environment({ budget = 1, tier = 'medium' }) {
  const s1 = Math.round(220 * budget) + 60;
  const s2 = Math.round(380 * budget) + 80;
  const s3 = Math.round(160 * budget) + 40;
  const structs = Math.max(9, Math.round(24 * budget));
  return (
    <group>
      <Skydome tier={tier} />
      <Floor tier={tier} />
      <StarLayer count={s1} size={0.9} color="#e0f2fe" spread={170} opacity={0.95} />
      <StarLayer count={s2} size={0.5} color="#bae6fd" spread={190} opacity={0.8} />
      <StarLayer count={s3} size={1.4} color="#c4b5fd" spread={150} opacity={0.9} />
      <FlyByStructures count={structs} />
    </group>
  );
}
