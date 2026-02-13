// src/apps/mesa-crafteo/Atom3D.jsx
import React, { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { getElementColor } from './elementColors';
import { ATOM_RADIUS, PORT_RADIUS, quaternionFromDirection } from './atomConfig';

const Atom3D = ({ position, element, elementData, ports, atomIndex, onPortClick, isGhost }) => {
    const [hoveredPort, setHoveredPort] = useState(null);

    const color = useMemo(() => {
        return getElementColor(element, elementData?.category);
    }, [element, elementData]);

    const darkerColor = useMemo(() => {
        const c = new THREE.Color(color);
        c.multiplyScalar(0.6);
        return '#' + c.getHexString();
    }, [color]);

    if (isGhost) {
        return (
            <group position={position}>
                <mesh>
                    <sphereGeometry args={[ATOM_RADIUS, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={0.25}
                        roughness={0.3}
                    />
                </mesh>
                <Html position={[0, ATOM_RADIUS + 0.35, 0]} center distanceFactor={10}
                    style={{ pointerEvents: 'none' }}>
                    <div className="atom-label ghost-label">
                        Haz click para colocar <strong>{element}</strong>
                    </div>
                </Html>
            </group>
        );
    }

    return (
        <group position={position}>
            {/* Esfera principal del átomo */}
            <mesh>
                <sphereGeometry args={[ATOM_RADIUS, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.2}
                    metalness={0.1}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Sombra interior para efecto de profundidad */}
            <mesh>
                <sphereGeometry args={[ATOM_RADIUS * 0.98, 32, 32]} />
                <meshStandardMaterial
                    color={darkerColor}
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Etiqueta flotante */}
            <Html position={[0, ATOM_RADIUS + 0.3, 0]} center distanceFactor={10}
                style={{ pointerEvents: 'none' }}>
                <div className="atom-label">
                    <span className="atom-label-number">{elementData?.atomicNumber}</span>
                    <span className="atom-label-symbol">{element}</span>
                </div>
            </Html>

            {/* Puertos de conexión */}
            {ports.map((port, idx) => {
                const portPos = port.direction.map(v => v * ATOM_RADIUS);
                const quat = quaternionFromDirection(port.direction);
                const isHovered = hoveredPort === idx && !port.occupied;
                const isFree = !port.occupied;

                return (
                    <group key={idx} position={portPos} quaternion={quat}>
                        {/* Disco plano del puerto */}
                        <mesh
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isFree && onPortClick) onPortClick(atomIndex, idx);
                            }}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                if (isFree) {
                                    setHoveredPort(idx);
                                    document.body.style.cursor = 'pointer';
                                }
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation();
                                setHoveredPort(null);
                                document.body.style.cursor = 'default';
                            }}
                        >
                            <circleGeometry args={[PORT_RADIUS, 16]} />
                            <meshStandardMaterial
                                color={port.occupied ? '#555' : (isHovered ? '#00ff88' : '#e8e8e8')}
                                emissive={port.occupied ? '#000' : (isHovered ? '#00ff44' : '#333')}
                                emissiveIntensity={isHovered ? 0.6 : 0.1}
                                side={THREE.DoubleSide}
                                roughness={0.2}
                            />
                        </mesh>
                        {/* Anillo del puerto para mejor visibilidad */}
                        {isFree && (
                            <mesh position={[0, 0, 0.001]}>
                                <ringGeometry args={[PORT_RADIUS * 0.7, PORT_RADIUS, 16]} />
                                <meshBasicMaterial
                                    color={isHovered ? '#00ff88' : '#aaa'}
                                    transparent
                                    opacity={isHovered ? 0.8 : 0.3}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        )}
                    </group>
                );
            })}
        </group>
    );
};

export default Atom3D;
