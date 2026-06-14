// Render de un MONTÓN: grupito de prismas de palabra IDÉNTICOS (sin pistas de valor),
// con alturas irregulares y ligero jitter (posición/rotación) → aspecto de "montón".
// Cada caja es un prisma 3D con la palabra en su textura uniforme (una sola material
// → 1 draw call; el texto va fog:false/toneMapped:false para legibilidad).
// La caída por gravedad (cajas con settling) se integra en UN ÚNICO useFrame del
// montón (no uno por caja) y se escribe imperativamente en mesh.position.y. El grupo
// sigue cada frame la posición/orientación del montón (cambia al reubicarse).
import React, { memo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CELL, GRAV_PILE } from '../engine/config';
import { faceYaw } from '../engine/walls';
import { makeWallWordTexture } from '../engine/wordTexture';

function WordBoxRaw({ box, pileId }) {
  const ref = useRef();
  const { texture } = makeWallWordTexture(box.text);
  useEffect(() => {
    const m = ref.current;
    if (m) { m.userData.targetId = box.id; m.userData.wallId = pileId; box._mesh = m; }
    return () => { if (box._mesh === m) box._mesh = null; };
  }, [box, pileId]);
  return (
    <mesh ref={ref} position={[box.x, box.y, box.z || 0]} rotation={[0, 0, box.jrot || 0]}>
      <boxGeometry args={[CELL.w, CELL.h, CELL.depth]} />
      <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
    </mesh>
  );
}
// memo: solo re-renderiza una caja si cambia su id o su texto (inyección de definición)
const WordBox = memo(WordBoxRaw, (a, b) => a.box.id === b.box.id && a.box.text === b.box.text && a.pileId === b.pileId);

function WordWall({ wall }) {
  const grp = useRef();

  useFrame((_, dtRaw) => {
    const g = grp.current;
    if (g) {
      g.position.set(wall.x, wall.y, wall.z);
      g.rotation.y = faceYaw(wall.x, wall.z);
    }
    const dt = Math.min(dtRaw, 0.05);
    wall.boxes.forEach((b) => {
      if (!b.settling) return;
      b.vy -= GRAV_PILE * dt;
      b.y += b.vy * dt;
      if (b.y <= b.targetY) {
        b.y = b.targetY;
        if (b.vy < -1.4) { b.vy = -b.vy * 0.22; } // rebote leve al posarse
        else { b.vy = 0; b.settling = false; }
      }
      if (b._mesh) b._mesh.position.y = b.y;
    });
  });

  const boxes = [];
  wall.boxes.forEach((b) => boxes.push(b));
  return (
    <group ref={grp} position={[wall.x, wall.y, wall.z]} rotation-y={faceYaw(wall.x, wall.z)}>
      {boxes.map((b) => <WordBox key={b.id} box={b} pileId={wall.id} />)}
    </group>
  );
}

export default WordWall;
