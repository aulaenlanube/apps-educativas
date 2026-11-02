// Recorridos en 3D (Viaje por el Cuerpo en modo 3D): una estela luminosa que une
// las paradas, partículas que circulan por ella y el robot de la plataforma que
// vuela de una parada a la siguiente. Se dibuja siempre por encima del cuerpo.
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const vec = (p) => new THREE.Vector3(p[0], p[1], p[2]);

export function Trail3D({ points }) {
  const invalidate = useThree((s) => s.invalidate);
  const dots = useRef([]);
  const curve = useMemo(() => (points.length > 1 ? new THREE.CatmullRomCurve3(points.map(vec), false, 'centripetal') : null), [points]);
  const geom = useMemo(() => (curve ? new THREE.TubeGeometry(curve, Math.max(24, points.length * 24), 0.0055, 8, false) : null), [curve, points.length]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0.8, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), []);
  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95, depthTest: false, depthWrite: false, toneMapped: false }), []);
  const dotGeom = useMemo(() => new THREE.SphereGeometry(0.011, 12, 8), []);
  useFrame((state) => {
    if (!curve) return;
    const t = state.clock.elapsedTime;
    dots.current.forEach((m, i) => {
      if (!m) return;
      const u = ((t * 0.22) + i / 3) % 1;
      m.position.copy(curve.getPointAt(u));
    });
    invalidate();
  });
  if (!geom) return null;
  return (
    <group renderOrder={30}>
      <mesh geometry={geom} material={mat} renderOrder={30} frustumCulled={false} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { dots.current[i] = m; }} geometry={dotGeom} material={dotMat} renderOrder={31} frustumCulled={false} />
      ))}
    </group>
  );
}

// El robot (cara de RobotMascot) en miniatura, volando de `from` a `to`.
export function Robot3D({ from, to }) {
  const ref = useRef(null);
  const t0 = useRef(null);
  const invalidate = useThree((s) => s.invalidate);
  const a = useMemo(() => vec(from || to), [from, to]);
  const b = useMemo(() => vec(to), [to]);
  useFrame((state) => {
    if (!ref.current) return;
    if (t0.current == null) t0.current = state.clock.elapsedTime;
    const k = Math.min(1, (state.clock.elapsedTime - t0.current) / 1.3);
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    ref.current.position.lerpVectors(a, b, e);
    ref.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.004 + 0.02;
    invalidate();
  });
  return (
    <group ref={ref} position={a}>
      <Html center zIndexRange={[25, 0]} pointerEvents="none">
        <svg className="a3d-robot" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
          <ellipse cx="20" cy="37" rx="9" ry="2" fill="#0b1626" opacity="0.5" />
          <line x1="20" y1="4" x2="20" y2="9" stroke="#a5b4fc" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="20" cy="4" r="2.6" fill="#f472b6" stroke="#fdf2f8" strokeWidth="0.8" />
          <rect x="7" y="9" width="26" height="21" rx="7" fill="#6366f1" stroke="#c7d2fe" strokeWidth="1.2" />
          <rect x="10.5" y="13" width="19" height="12" rx="5" fill="#0f172a" />
          <circle cx="16" cy="19" r="2.6" fill="#fff" />
          <circle cx="24.5" cy="19" r="3.1" fill="#fff" />
          <circle cx="16.3" cy="19.2" r="1.2" fill="#22d3ee" />
          <circle cx="24.8" cy="19.2" r="1.5" fill="#22d3ee" />
          <path d="M13 30h14l-2 4h-10z" fill="#4f46e5" />
        </svg>
      </Html>
    </group>
  );
}
