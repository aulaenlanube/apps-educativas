// Flecha 3D para visualizar fuerzas y velocidades, con etiqueta billboard.
// `dir` no necesita estar normalizado; `length` es la longitud visual en
// unidades de escena (la escena escala magnitud física → longitud visual).
import React from 'react';
import * as THREE from 'three';
import { Billboard, Text } from '@react-three/drei';

const UP = new THREE.Vector3(0, 1, 0);

export default function VectorArrow({
  origin = [0, 0, 0],
  dir = [0, 1, 0],
  length = 1,
  color = '#f43f5e',
  label,
  labelSize = 0.34,
  thickness = 0.05,
}) {
  if (!(length > 0.04)) return null;
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]);
  if (d.lengthSq() < 1e-12) return null;
  d.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, d);
  const headLen = Math.min(0.34, length * 0.38);
  const shaft = Math.max(length - headLen, 0.01);

  return (
    <group position={origin} quaternion={quat}>
      <mesh position={[0, shaft / 2, 0]}>
        <cylinderGeometry args={[thickness, thickness, shaft, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, shaft + headLen / 2, 0]}>
        <coneGeometry args={[thickness * 2.7, headLen, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {label && (
        <Billboard position={[0, length + 0.32, 0]}>
          <Text
            fontSize={labelSize}
            color={color}
            outlineWidth={0.022}
            outlineColor="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
