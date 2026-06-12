// Avanza la física a paso fijo dentro del bucle de r3f. El acumulador vive en
// `world` (objeto persistente del shell) para sobrevivir a los remounts del
// Canvas (cambio de tier, pérdida de contexto WebGL).
import { useFrame } from '@react-three/fiber';
import { FIXED_DT, MAX_FRAME_DT } from '../engine/integrator';

export default function useFixedStep(world, playing, speed, stepFn) {
  useFrame((_, delta) => {
    if (!playing || !world) return;
    let acc = (world._acc || 0) + Math.min(delta, MAX_FRAME_DT) * (speed || 1);
    let guard = 0;
    while (acc >= FIXED_DT && guard < 240) {
      stepFn(FIXED_DT);
      world.t = (world.t || 0) + FIXED_DT;
      acc -= FIXED_DT;
      guard++;
    }
    world._acc = acc;
  });
}
