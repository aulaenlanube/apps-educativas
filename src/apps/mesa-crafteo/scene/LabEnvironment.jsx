// src/apps/mesa-crafteo/scene/LabEnvironment.jsx
// Decorado del laboratorio: cúpula con degradado, mesa holográfica con sombra
// suave, haz de luz y motas de polvo (todo barato: sin sombras dinámicas ni
// posprocesado). Las motas se mueven en el vertex shader.
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { shadowTexture, tableTexture } from './textures';

// Reflejos de entorno generados en local (nada de HDR por red).
function EnvMap() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const rt = pm.fromScene(room, 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      rt.dispose();
      pm.dispose();
      room.dispose?.();
      room.traverse?.((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    };
  }, [gl, scene]);
  return null;
}

const DOME_VS = `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const DOME_FS = `varying vec3 vP;
uniform vec3 cTop; uniform vec3 cMid; uniform vec3 cLow; uniform vec3 cGlow;
void main(){
  float h = vP.y;
  vec3 col = h > 0.0 ? mix(cMid, cTop, smoothstep(0.0, 0.7, h)) : mix(cMid, cLow, smoothstep(0.0, -0.5, h));
  float g = pow(max(0.0, dot(vP, normalize(vec3(0.0, 0.15, -1.0)))), 6.0);
  col += cGlow * g * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

function Dome() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DOME_VS,
    fragmentShader: DOME_FS,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      cTop: { value: new THREE.Color('#1b1648') },
      cMid: { value: new THREE.Color('#0d1433') },
      cLow: { value: new THREE.Color('#04060f') },
      cGlow: { value: new THREE.Color('#5b45d6') },
    },
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[60, 24, 16]} />
    </mesh>
  );
}

const BEAM_VS = `varying vec2 vUv; varying float vFacing;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vFacing = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}`;
const BEAM_FS = `varying vec2 vUv; varying float vFacing; uniform vec3 uColor; uniform float uAlpha;
void main(){ float a = pow(1.0 - vUv.y, 2.4) * pow(vFacing, 2.0) * uAlpha; gl_FragColor = vec4(uColor, a); }`;

const DUST_VS = `uniform float uTime; uniform float uPx; attribute float aSeed; varying float vA;
void main(){
  vec3 p = position;
  float t = uTime * 0.12 + aSeed * 6.2831;
  p.y = mod(p.y + uTime * (0.08 + aSeed * 0.1) + 6.0, 12.0) - 6.0;
  p.x += sin(t) * 0.4; p.z += cos(t * 0.8) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uPx * (0.6 + aSeed) * (8.0 / -mv.z);
  vA = 0.25 + 0.5 * aSeed;
  gl_Position = projectionMatrix * mv;
}`;
const DUST_FS = `varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; gl_FragColor = vec4(0.65, 0.75, 1.0, (0.5 - r) * 2.0 * vA); }`;

function Dust({ count }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 9; const a = Math.random() * Math.PI * 2;
      p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.random() * 12 - 6; p[i * 3 + 2] = Math.sin(a) * r - 2;
      s[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1));
    return g;
  }, [count]);
  const gl = useThree((st) => st.gl);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DUST_VS, fragmentShader: DUST_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: 3 * gl.getPixelRatio() } },
  }), [gl]);
  useFrame((st) => { mat.uniforms.uTime.value = st.clock.elapsedTime; });
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

export default function LabEnvironment({ params, extentRef }) {
  const tableRef = useRef();
  const shadowRef = useRef();
  const beamRef = useRef();
  const tableTex = useMemo(() => tableTexture(), []);
  const shTex = useMemo(() => shadowTexture(), []);
  const beamMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: BEAM_VS, fragmentShader: BEAM_FS, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color('#38bdf8') }, uAlpha: { value: 0.11 } },
  }), []);
  const beamGeo = useMemo(() => new THREE.CylinderGeometry(3.2, 3.55, 1, 48, 1, true).translate(0, 0.5, 0), []);
  useEffect(() => () => { beamMat.dispose(); beamGeo.dispose(); }, [beamMat, beamGeo]);

  // La mesa baja y la sombra crece con el tamaño de la molécula.
  useFrame((_, dt) => {
    const e = extentRef?.current || { r: 1, low: -1 };
    const y = Math.min(-1.2, e.low - 0.9);
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.1));
    const t = tableRef.current;
    if (t) {
      t.position.y += (y - t.position.y) * k;
      // la mesa crece con la molécula (radio base 3,7)
      const sc = Math.max(0.42, (e.r * 0.95 + 0.35) / 3.7);
      t.scale.setScalar(t.scale.x + (sc - t.scale.x) * k);
    }
    if (shadowRef.current) {
      const s = (1.2 + e.r * 1.3) / Math.max(0.5, t ? t.scale.x : 1);
      const cur = shadowRef.current.scale.x;
      shadowRef.current.scale.setScalar(cur + (s - cur) * k);
    }
    if (beamRef.current) beamRef.current.scale.y = Math.max(1, (-y + e.r + 1) / Math.max(0.5, t ? t.scale.x : 1));
  });

  return (
    <>
      {params.env && <EnvMap />}
      <Dome />
      <group ref={tableRef} position={[0, -1.6, 0]} scale={0.6}>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[3.7, 3.95, 0.3, 64, 1]} />
          <meshStandardMaterial color="#121733" metalness={0.65} roughness={0.38} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[3.7, 64]} />
          <meshBasicMaterial map={tableTex} toneMapped={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
          <ringGeometry args={[3.68, 3.78, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} toneMapped={false} />
        </mesh>
        <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shTex} transparent depthWrite={false} opacity={0.75} />
        </mesh>
        {params.beam && (
          <mesh ref={beamRef} geometry={beamGeo} material={beamMat} />
        )}
      </group>
      {params.dust > 0 && <Dust count={params.dust} />}
    </>
  );
}
