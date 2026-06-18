// Render de UNA diana voladora: un grupo billboard (la escena lo orienta a la cámara
// cada frame y mueve su posición de forma imperativa) con dos hijos:
//   · halo luminoso (en BLOOM_LAYER → brilla) detrás, que le da el aspecto de "diana".
//   · panel con la palabra (textura de canvas, NO en la capa de bloom → texto nítido).
// El grupo lleva userData.targetId para que el raycast del disparo lo identifique.
// No tiene useFrame propio: toda la animación la dirige la escena (Scene.jsx) en un
// único bucle, para que el raycast impacte donde la diana está en ESTE frame.
import React, { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BLOOM_LAYER, FLYER } from '../engine/config';
import { makeWallWordTexture } from '../engine/wordTexture';

const markBloom = (o) => { if (o) o.layers.enable(BLOOM_LAYER); };

function FlyerRaw({ flyer }) {
  const ref = useRef();
  const { texture, aspect } = makeWallWordTexture(flyer.text);
  useEffect(() => {
    const g = ref.current;
    if (g) { g.userData.targetId = flyer.id; flyer._mesh = g; }
    return () => { if (flyer._mesh === g) flyer._mesh = null; };
  }, [flyer]);

  const w = FLYER.panelW;
  const h = w / (aspect || 2.4);
  const r = w * FLYER.haloScale;

  return (
    <group ref={ref} position={[flyer.px, flyer.py, flyer.pz]}>
      {/* halo luminoso (brilla con el bloom; color neutro: no revela el valor) */}
      <mesh ref={markBloom} position={[0, 0, -0.05]}>
        <circleGeometry args={[r, 30]} />
        <meshBasicMaterial
          color="#86d8ff"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* panel con la palabra (nítido, doble cara para que el raycast siempre acierte) */}
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
