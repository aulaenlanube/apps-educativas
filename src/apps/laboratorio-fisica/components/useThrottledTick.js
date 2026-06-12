// Re-render barato de la parte DECLARATIVA de una escena (vectores, textos)
// a ~12 Hz. Los objetos en movimiento rápido (la bola, el carro) NO usan esto:
// se actualizan imperativamente vía ref dentro de useFrame a 60 fps.
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export default function useThrottledTick(hz = 12) {
  const [, setTick] = useState(0);
  const accRef = useRef(0);
  useFrame((_, delta) => {
    accRef.current += delta;
    if (accRef.current >= 1 / hz) {
      accRef.current = 0;
      setTick((t) => t + 1);
    }
  });
}
