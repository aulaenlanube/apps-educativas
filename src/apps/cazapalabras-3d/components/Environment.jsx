// Entorno 3D que transmite AVANCE: suelo con rejilla neón cuya textura se
// desplaza hacia la cámara, obeliscos laterales que vienen de lejos y se
// reciclan, y un campo de estrellas de fondo. Todo escala con el tier de
// calidad (cantidad de decorado ∝ particleBudget).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function makeGridTexture() {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#070a18';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, s, s);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const p = (s / 4) * i;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(s, p); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(40, 80);
  return tex;
}

function Stars({ count }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = Math.random() * 60 + 4;
      pos[i * 3 + 2] = -Math.random() * 140 - 20;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.01; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.45} color="#bae6fd" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Obelisks({ count }) {
  const grp = useRef();
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({
    side: i % 2 === 0 ? -1 : 1,
    x: (i % 2 === 0 ? -1 : 1) * (9 + Math.random() * 7),
    h: 3 + Math.random() * 7,
    z: -Math.random() * 140,
    hue: Math.random() < 0.5 ? '#6d28d9' : '#0e7490',
    speed: 6 + Math.random() * 4,
  })), [count]);
  const refs = useRef([]);
  useFrame((_, dt) => {
    items.forEach((it, i) => {
      it.z += it.speed * dt;
      if (it.z > 14) { it.z = -140 - Math.random() * 20; }
      const m = refs.current[i];
      if (m) m.position.set(it.x, it.h / 2, it.z);
    });
  });
  return (
    <group ref={grp}>
      {items.map((it, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[it.x, it.h / 2, it.z]}>
          <boxGeometry args={[1.1, it.h, 1.1]} />
          <meshStandardMaterial color="#0b1026" emissive={it.hue} emissiveIntensity={0.7} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export default function Environment({ budget = 1 }) {
  const grid = useMemo(makeGridTexture, []);
  const matRef = useRef();
  useEffect(() => () => grid.dispose(), [grid]); // libera la textura al desmontar
  useFrame((_, dt) => {
    // desplaza la rejilla hacia la cámara → sensación de avance constante
    grid.offset.y -= dt * 0.6;
  });
  const stars = Math.round(700 * budget) + 120;
  const obel = Math.max(6, Math.round(16 * budget));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]} receiveShadow>
        <planeGeometry args={[160, 240]} />
        <meshStandardMaterial ref={matRef} map={grid} color="#0a0f24" emissive="#0b2a44" emissiveIntensity={0.35} roughness={0.9} metalness={0.1} />
      </mesh>
      <Obelisks count={obel} />
      <Stars count={stars} />
    </group>
  );
}
