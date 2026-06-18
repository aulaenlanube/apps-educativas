// Render de UNA diana voladora. Dos variantes:
//   · PALABRA → un panel con la palabra (textura de canvas, nítido, SIN halo). La
//     escena lo orienta a la cámara (billboard) cada frame y lo mueve de forma
//     imperativa. El tamaño (flyer.scale) varía mucho: hay palabras diminutas muy
//     difíciles de acertar y otras grandes.
//   · BONIFICACIÓN → una gema emisiva (en BLOOM_LAYER → brilla) que gira sobre sí
//     misma; es pequeña y vuela muy rápido. Acertarla da puntos extra.
// El grupo lleva userData.targetId para que el raycast del disparo lo identifique.
// No tiene useFrame propio: toda la animación la dirige la escena (Scene.jsx).
import React, { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BLOOM_LAYER, FLYER } from '../engine/config';
import { makeWallWordTexture } from '../engine/wordTexture';

const markBloom = (o) => { if (o) o.layers.enable(BLOOM_LAYER); };

function FlyerRaw({ flyer }) {
  const ref = useRef();
  useEffect(() => {
    const g = ref.current;
    if (g) { g.userData.targetId = flyer.id; flyer._mesh = g; }
    return () => { if (flyer._mesh === g) flyer._mesh = null; };
  }, [flyer]);

  // ---- gemas especiales (objetos pequeños y veloces; brillan y giran) ----
  //   dorada (octaedro) = bonificación pura · morada (icosaedro) = trampa (puntos + castigo)
  if (flyer.bonus || flyer.hazard) {
    const s = flyer.scale || 0.6;
    const hz = flyer.hazard;
    return (
      <group ref={ref} position={[flyer.px, flyer.py, flyer.pz]} scale={s}>
        <mesh ref={markBloom}>
          {hz ? <icosahedronGeometry args={[1.0, 0]} /> : <octahedronGeometry args={[1.0, 0]} />}
          <meshStandardMaterial
            color={hz ? '#250a2c' : '#2a1f00'}
            emissive={hz ? '#d946ef' : '#fbbf24'}
            emissiveIntensity={2.0}
            metalness={0.6}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }

  // ---- palabra (panel nítido, sin halo, tamaño variable) ----
  const { texture, aspect } = makeWallWordTexture(flyer.text);
  const w = FLYER.panelW * (flyer.scale || 1);
  const h = w / (aspect || 2.4);
  return (
    <group ref={ref} position={[flyer.px, flyer.py, flyer.pz]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
}

// memo: solo re-crea la diana si cambia su id o su texto (no por movimiento).
const Flyer = memo(FlyerRaw, (a, b) => a.flyer.id === b.flyer.id && a.flyer.text === b.flyer.text);

export default Flyer;
