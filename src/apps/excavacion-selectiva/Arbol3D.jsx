import React, { useMemo } from 'react';
import * as THREE from 'three';

// Generador de texturas (Reutilizado para mantener coherencia visual)
const generatePixelTexture = (r, g, b) => {
  const width = 8;
  const height = 8;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    const variation = Math.random() * 30 - 15;
    data[stride] = Math.max(0, Math.min(255, r + variation));
    data[stride + 1] = Math.max(0, Math.min(255, g + variation));
    data[stride + 2] = Math.max(0, Math.min(255, b + variation));
    data[stride + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

// Generamos las texturas UNA SOLA VEZ fuera del componente para optimizar
// Tronco (Marrón oscuro)
const textureTrunk = generatePixelTexture(101, 67, 33);
// Hojas (Verde bosque)
const textureLeaves = generatePixelTexture(34, 139, 34);

export function Arbol3D({ position }) {
  // Altura aleatoria del tronco para variar un poco (entre 2 y 4 bloques)
  const trunkHeight = useMemo(() => 2 + Math.random() * 2, []);

  return (
    <group position={position}>
      {/* TRONCO */}
      {/* Lo subimos la mitad de su altura para que la base esté en el suelo (y=0) */}
      <mesh position={[0, trunkHeight / 2, 0]}>
        <boxGeometry args={[0.8, trunkHeight, 0.8]} />
        <meshStandardMaterial map={textureTrunk} color="#888888" />
      </mesh>

      {/* HOJAS */}
      {/* Un bloque grande encima del tronco */}
      <mesh position={[0, trunkHeight + 0.5, 0]}>
        <boxGeometry args={[2.5, 2, 2.5]} />
        <meshStandardMaterial map={textureLeaves} color="#aaaaaa" />
      </mesh>
    </group>
  );
}