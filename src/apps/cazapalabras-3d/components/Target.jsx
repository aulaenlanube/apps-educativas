// Un objetivo disparable.
//  · Palabra: PRISMA 3D (rectángulo con grosor) con la palabra impresa en la
//    cara frontal y un marco de color luminoso en los cantos. Tiene orientación
//    de mundo (NO billboard) y gira/oscila según su estilo de movimiento para
//    que se aprecie el volumen; opcionalmente un halo radial detrás.
//  · Especial: orbe (power-up / bomba) con anillo, billboard hacia la cámara.
// Cada movimiento (avance + serpenteo + rotación) se anima en useFrame; cuando
// rebasa la cámara llama onExpire(id). userData.targetId en los meshes para el
// raycast de disparo desde el centro de pantalla.
import React, { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TIERS, SPECIALS, BLOOM_LAYER } from '../engine/config';
import { makeWordTexture, makeIconTexture, makeGlowTexture } from '../engine/wordTexture';

const markBloom = (o) => { if (o) o.layers.enable(BLOOM_LAYER); };
const WORD_H = 1.02;   // alto base del prisma (unidades de mundo)
const DEPTH = 0.22;    // grosor del prisma
const DESPAWN_Z = 5.5; // se desvanecen 1.5u antes de la cámara (z=7)

function Target({ data, onExpire }) {
  const grp = useRef();   // posición (serpenteo + avance)
  const box = useRef();   // rotación propia del prisma
  const ring = useRef();
  const orb = useRef();
  const expired = useRef(false);
  const motion = useRef(null);
  if (!motion.current) motion.current = { t: data.phase || 0, z: data.z };

  const visual = useMemo(() => {
    if (data.kind === 'special') {
      const sp = SPECIALS[data.special] || SPECIALS.gem;
      return { type: 'special', sp, iconTex: makeIconTexture(sp.icon).texture };
    }
    const tier = TIERS[data.points] || TIERS[1];
    const accent = data.isAnswer ? '#fbbf24' : tier.color;
    const { texture, aspect } = makeWordTexture(data.text, {
      accent, design: data.design || 0, points: data.points, isAnswer: data.isAnswer,
    });
    const halo = (data.isAnswer || data.points === 5)
      ? { tex: makeGlowTexture(data.isAnswer ? '#fbbf24' : tier.emissive).texture, opacity: data.isAnswer ? 0.95 : 0.55 }
      : null;
    return { type: 'word', tier, accent, edgeEmissive: data.isAnswer ? '#f59e0b' : tier.emissive, texture, aspect, halo };
  }, [data]);

  useFrame((state, dt) => {
    const m = motion.current;
    const step = Math.min(dt, 0.05);
    m.t += step;
    m.z += data.vz * step;

    const wx = data.weaveAmpX ? data.weaveAmpX * Math.sin(m.t * data.weaveFreqX + data.weavePhX) : 0;
    const wy = data.weaveAmpY ? data.weaveAmpY * Math.sin(m.t * data.weaveFreqY + data.weavePhY) : 0;
    const bob = Math.sin(m.t * data.bobFreq + data.phase) * data.bobAmp;

    if (data.kind === 'special') {
      if (grp.current) {
        grp.current.position.set(data.x + wx, data.y + bob, m.z);
        grp.current.quaternion.copy(state.camera.quaternion); // billboard del orbe
      }
      if (orb.current) orb.current.rotation.y += step * 0.9;
      if (ring.current) ring.current.rotation.z += step * 1.6;
    } else {
      if (grp.current) grp.current.position.set(data.x + wx, data.y + wy + bob, m.z);
      if (box.current) {
        box.current.rotation.set(
          data.pitchAmp * Math.sin(m.t * data.pitchFreq + data.pitchPh),
          data.yawAmp * Math.sin(m.t * data.yawFreq + data.yawPh) + data.spinY * m.t,
          data.rollAmp * Math.sin(m.t * data.rollFreq + data.rollPh),
        );
      }
    }

    if (!expired.current && m.z > DESPAWN_Z) {
      expired.current = true;
      onExpire(data.id);
    }
  });

  if (visual.type === 'special') {
    const sp = visual.sp;
    return (
      <group ref={grp} position={[data.x, data.y, data.z]} userData={{ targetId: data.id }}>
        <mesh ref={(o) => { orb.current = o; markBloom(o); }} userData={{ targetId: data.id }}>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={sp.color}
            emissive={sp.emissive}
            emissiveIntensity={1.5}
            metalness={0.4}
            roughness={0.2}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh ref={(o) => { ring.current = o; markBloom(o); }}>
          <ringGeometry args={[0.74, 0.96, 40]} />
          <meshBasicMaterial
            color={sp.color}
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]} ref={markBloom} userData={{ targetId: data.id }}>
          <planeGeometry args={[1.15, 1.15]} />
          <meshBasicMaterial map={visual.iconTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    );
  }

  const h = WORD_H * (visual.tier.scale || 1);
  const w = h * visual.aspect;
  const big = Math.max(w, h);
  return (
    <group ref={grp} position={[data.x, data.y, data.z]} userData={{ targetId: data.id }}>
      {visual.halo && (
        <mesh position={[0, 0, -DEPTH / 2 - 0.06]} ref={markBloom}>
          <planeGeometry args={[big * 1.9, big * 1.9]} />
          <meshBasicMaterial
            map={visual.halo.tex}
            transparent
            opacity={visual.halo.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh ref={box} userData={{ targetId: data.id }} castShadow>
        <boxGeometry args={[w, h, DEPTH]} />
        {/* cantos (px, nx, py, ny) — marco luminoso del prisma */}
        <meshStandardMaterial attach="material-0" color="#0b1228" emissive={visual.edgeEmissive} emissiveIntensity={0.9} metalness={0.45} roughness={0.35} />
        <meshStandardMaterial attach="material-1" color="#0b1228" emissive={visual.edgeEmissive} emissiveIntensity={0.9} metalness={0.45} roughness={0.35} />
        <meshStandardMaterial attach="material-2" color="#0b1228" emissive={visual.edgeEmissive} emissiveIntensity={0.9} metalness={0.45} roughness={0.35} />
        <meshStandardMaterial attach="material-3" color="#0b1228" emissive={visual.edgeEmissive} emissiveIntensity={0.9} metalness={0.45} roughness={0.35} />
        {/* cara frontal (+z) — palabra impresa (fog:false → legible al spawnear lejos) */}
        <meshBasicMaterial attach="material-4" map={visual.texture} toneMapped={false} fog={false} />
        {/* cara trasera (-z) — reverso oscuro */}
        <meshStandardMaterial attach="material-5" color="#0a1024" emissive={visual.edgeEmissive} emissiveIntensity={0.25} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

// memo: cada target solo se re-renderiza si cambian sus datos (su movimiento es
// imperativo en useFrame), no en cada re-render de la escena.
export default memo(Target);
