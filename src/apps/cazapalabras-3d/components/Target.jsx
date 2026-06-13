// Un objetivo disparable: panel de palabra (textura canvas, billboard hacia la
// cámara) u orbe especial (power-up / bomba). Se anima a sí mismo en useFrame
// avanzando hacia la cámara (+z); cuando la rebasa, llama onExpire(id).
// userData.targetId en cada mesh para el raycast desde el centro de pantalla.
import React, { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TIERS, SPECIALS } from '../engine/config';
import { makeWordTexture, makeIconTexture } from '../engine/wordTexture';

const WORD_H = 1.05; // alto base del panel (unidades de mundo)
const DESPAWN_Z = 5.5; // se desvanecen 1.5u antes de la cámara (z=7), sin agigantarse

function Target({ data, onExpire }) {
  const grp = useRef();
  const ring = useRef();
  const expired = useRef(false);
  const motion = useRef(null);
  if (!motion.current) motion.current = { x: data.x, y: data.y, z: data.z, t: data.phase || 0 };

  const visual = useMemo(() => {
    if (data.kind === 'special') {
      const sp = SPECIALS[data.special] || SPECIALS.gem;
      return { type: 'special', sp, iconTex: makeIconTexture(sp.icon).texture };
    }
    const tier = TIERS[data.points] || TIERS[1];
    const accent = data.isAnswer ? '#fbbf24' : tier.color;
    const { texture, aspect } = makeWordTexture(data.text, { accent });
    return { type: 'word', tier, texture, aspect };
  }, [data]);

  useFrame((state, dt) => {
    const m = motion.current;
    const step = Math.min(dt, 0.05);
    m.t += step;
    m.z += data.vz * step;
    m.x += data.vx * step;
    const g = grp.current;
    if (g) {
      const bob = Math.sin(m.t * data.bobFreq) * data.bobAmp;
      g.position.set(m.x, m.y + bob, m.z);
      g.quaternion.copy(state.camera.quaternion); // billboard
    }
    if (ring.current) ring.current.rotation.z += step * 1.6;
    if (!expired.current && m.z > DESPAWN_Z) {
      expired.current = true;
      onExpire(data.id);
    }
  });

  if (visual.type === 'special') {
    const sp = visual.sp;
    return (
      <group ref={grp} position={[data.x, data.y, data.z]} userData={{ targetId: data.id }}>
        <mesh userData={{ targetId: data.id }}>
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
        <mesh ref={ring}>
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
        <mesh position={[0, 0, 0.05]} userData={{ targetId: data.id }}>
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
      {(data.isAnswer || data.points === 5) && (
        <mesh ref={ring} position={[0, 0, -0.05]}>
          <ringGeometry args={[big * 0.62, big * 0.72, 44]} />
          <meshBasicMaterial
            color={data.isAnswer ? '#fbbf24' : visual.tier.emissive}
            transparent
            opacity={data.isAnswer ? 0.85 : 0.4}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh userData={{ targetId: data.id }}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={visual.texture} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

// memo: cada target solo se re-renderiza si cambian sus datos (su movimiento es
// imperativo en useFrame), no en cada re-render de la escena.
export default memo(Target);
