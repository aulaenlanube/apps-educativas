// src/apps/mesa-crafteo/scene/Celebration.jsx
// Momento "¡molécula completa!": estallido de partículas con los colores de los
// átomos y onda expansiva sobre la mesa. Se dispara al cambiar `fireKey`.
// Presupuesto de partículas por nivel de calidad (params.burst).
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { tokenInfo } from '../chem/elements';
import { glowTexture } from './textures';

const DURATION = 1.9;

export default function Celebration({ fireKey, tokens = [], count = 120, extentRef, reduced = false }) {
  const pts = useRef();
  const wave = useRef();
  const st = useRef({ key: fireKey, t: -1 });
  const n = reduced ? Math.round(count * 0.3) : count;

  const { geo, vel } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return { geo: g, vel: new Float32Array(n * 3) };
  }, [n]);
  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.16, map: glowTexture(), vertexColors: true, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0,
  }), []);
  const waveMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), []);
  useEffect(() => () => { geo.dispose(); mat.dispose(); waveMat.dispose(); }, [geo, mat, waveMat]);

  useEffect(() => {
    if (fireKey === st.current.key) return;
    st.current = { key: fireKey, t: 0 };
    const pos = geo.attributes.position.array;
    const col = geo.attributes.color.array;
    const palette = (tokens.length ? tokens : ['C']).map((t) => new THREE.Color(tokenInfo(t)?.color || '#ffffff'));
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1; const a = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const sp = 2.2 + Math.random() * 3.2;
      vel[i * 3] = s * Math.cos(a) * sp; vel[i * 3 + 1] = u * sp + 1.2; vel[i * 3 + 2] = s * Math.sin(a) * sp;
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
      const c = Math.random() < 0.3 ? new THREE.Color('#ffffff') : palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
  }, [fireKey, geo, vel, n, tokens]);

  useFrame((_, rawDt) => {
    const s = st.current;
    if (s.t < 0) return;
    const dt = Math.min(rawDt, 0.05);
    s.t += dt;
    const p = s.t / DURATION;
    const pos = geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      vel[i * 3 + 1] -= 3.2 * dt;
      vel[i * 3] *= 0.985; vel[i * 3 + 2] *= 0.985;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = p < 0.1 ? p * 10 : Math.max(0, 1 - (p - 0.1) / 0.9);
    if (wave.current) {
      const low = extentRef?.current?.low ?? -1;
      wave.current.position.y = Math.min(-1.2, low - 0.9) + 0.03;
      wave.current.scale.setScalar(0.6 + p * 7);
      waveMat.opacity = Math.max(0, 0.85 * (1 - p));
    }
    if (s.t > DURATION) { s.t = -1; mat.opacity = 0; waveMat.opacity = 0; }
  });

  return (
    <>
      <points ref={pts} geometry={geo} material={mat} frustumCulled={false} />
      <mesh ref={wave} rotation={[-Math.PI / 2, 0, 0]} material={waveMat}>
        <ringGeometry args={[0.46, 0.5, 64]} />
      </mesh>
    </>
  );
}
