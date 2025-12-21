import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Text, Edges } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Generador de texturas
const generateMinecraftTexture = (r, g, b) => {
  const width = 8;
  const height = 8;
  const size = width * height;
  const data = new Uint8Array(4 * size);
  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    const variation = Math.random() * 20 - 10; 
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

// Partículas (Igual que antes)
const BlockParticles = ({ position, texture }) => {
    const particles = useMemo(() => {
        return Array.from({ length: 8 }).map(() => ({
            velocity: new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()*0.2)+0.1, (Math.random()-0.5)*0.2),
            offset: new THREE.Vector3((Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5),
            rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
            rotationSpeed: Math.random() * 0.2 + 0.1
        }));
    }, []);
    const groupRef = useRef();
    useFrame(() => {
       if (!groupRef.current) return;
       groupRef.current.children.forEach((mesh, i) => {
           const data = particles[i];
           mesh.position.add(data.velocity);
           data.velocity.y -= 0.005; 
           mesh.rotateOnAxis(data.rotationAxis, data.rotationSpeed);
           mesh.scale.multiplyScalar(0.95);
       });
    });
    return (
        <group ref={groupRef} position={position}>
            {particles.map((p, i) => (
                <mesh key={i} position={p.offset}>
                    <boxGeometry args={[0.25, 0.25, 0.25]} />
                    <meshStandardMaterial map={texture} color="#fff" />
                </mesh>
            ))}
        </group>
    );
};

export function Bloque3D({ position, text, onMine, onDestructionComplete, setHoverState, isTarget }) {
  const meshRef = useRef();
  const isHoveredRef = useRef(false);
  const [isClose, setIsClose] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);
  const { camera } = useThree();

  // === DETECTAR SI ES BLOQUE ESTRELLA ===
  const isStarBlock = text === "★";

  // Texturas
  // Normal (Marrón tierra)
  const textureNormal = useMemo(() => generateMinecraftTexture(140, 80, 40), []);
  const textureHover = useMemo(() => generateMinecraftTexture(180, 120, 70), []);
  
  // ESTRELLA (Dorado)
  const textureGold = useMemo(() => generateMinecraftTexture(255, 215, 0), []);     // Oro
  const textureGoldHover = useMemo(() => generateMinecraftTexture(255, 235, 100), []); // Oro brillante

  const initialPosVector = useMemo(() => new THREE.Vector3(...position), [position]);

  useEffect(() => { return () => setHoverState('crosshair'); }, [setHoverState]);

  useFrame((state) => {
    if (isDestroying || !meshRef.current) return;

    // Animación de rotación suave SOLO para la estrella
    if (isStarBlock) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.y = initialPosVector.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    const distance = camera.position.distanceTo(meshRef.current.position);
    const closeEnough = distance < 5;
    if (closeEnough !== isClose) setIsClose(closeEnough);

    if (isHoveredRef.current && closeEnough && !isError) {
       setHoverState('pickaxe');
    }

    if (isError) {
        meshRef.current.position.x = initialPosVector.x + (Math.random() - 0.5) * 0.2;
        meshRef.current.position.z = initialPosVector.z + (Math.random() - 0.5) * 0.2;
    } else if (!isStarBlock) {
        // Reset posición si no es error ni estrella (la estrella se mueve sola)
        meshRef.current.position.copy(initialPosVector);
    }
  });

  const handlePointerOver = (e) => { e.stopPropagation(); isHoveredRef.current = true; };
  const handlePointerOut = (e) => { e.stopPropagation(); isHoveredRef.current = false; setHoverState('crosshair'); };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isClose || isError || isDestroying) return;

    if (isTarget) { // La estrella siempre es isTarget=true
      setHoverState('crosshair');
      onMine(); 
      setIsDestroying(true);
      setTimeout(() => onDestructionComplete(), 400);
    } else {
      setIsError(true);
      setHoverState('crosshair');
      setTimeout(() => setIsError(false), 500);
    }
  };

  // Determinar textura final
  let finalTexture = isStarBlock ? textureGold : textureNormal;
  
  if (!isError && isHoveredRef.current && isClose) {
      finalTexture = isStarBlock ? textureGoldHover : textureHover;
  }
  
  // Color de error o neutro
  let finalColor = isError ? '#ff4444' : 'white'; 

  // Partículas
  if (isDestroying) {
      return <BlockParticles position={position} texture={finalTexture} />;
  }

  const textProps = {
      fontSize: isStarBlock ? 0.5 : 0.3, // Estrella más grande
      color: isStarBlock ? "#FFFF00" : "white", // Texto amarillo si es estrella
      outlineWidth: 0.03,
      outlineColor: "#3d2817",
      anchorX: "center",
      anchorY: "middle"
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={finalTexture} color={finalColor} roughness={1} />
      <Edges scale={1} threshold={15} color={isError ? "#ff0000" : "#2a1a0a"} linewidth={isError ? 4 : 2} />

      {/* Renderizar texto en las caras */}
      <Text position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} {...textProps}>{text}</Text>
      <Text position={[0, 0, 0.51]} {...textProps}>{text}</Text>
      <Text position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} {...textProps}>{text}</Text>
      <Text position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} {...textProps}>{text}</Text>
      <Text position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} {...textProps}>{text}</Text>
    </mesh>
  );
}