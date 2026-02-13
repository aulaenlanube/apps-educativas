// src/apps/mesa-crafteo/MoleculeBuilder3D.jsx
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import Atom3D from './Atom3D';
import Bond3D from './Bond3D';
import { ATOM_RADIUS } from './atomConfig';

// Componente interno de la escena 3D
const Scene = ({
    placedAtoms,
    bonds,
    selectedElement,
    onPortClick,
    onEmptyClick,
}) => {
    const hasAtoms = placedAtoms.length > 0;
    const hasSelection = !!selectedElement;

    return (
        <>
            {/* Iluminación */}
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} castShadow />
            <pointLight position={[-5, -3, -5]} intensity={0.3} color="#818cf8" />
            <pointLight position={[0, -5, 3]} intensity={0.2} color="#10b981" />

            {/* Controles de órbita */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableDamping={true}
                dampingFactor={0.1}
                minDistance={2}
                maxDistance={20}
                makeDefault
            />

            {/* Grid sutil de fondo */}
            <gridHelper
                args={[12, 12, '#2a2a3a', '#1a1a2a']}
                position={[0, -2, 0]}
                rotation={[0, 0, 0]}
            />

            {/* Estado vacío: sin elemento seleccionado y sin átomos */}
            {!hasAtoms && !hasSelection && (
                <Html center position={[0, 0, 0]}>
                    <div className="canvas-empty-msg">
                        Selecciona un elemento del inventario
                    </div>
                </Html>
            )}

            {/* Estado: elemento seleccionado pero sin átomos → ghost + click area */}
            {!hasAtoms && hasSelection && (
                <>
                    <Atom3D
                        position={[0, 0, 0]}
                        element={selectedElement.symbol}
                        elementData={selectedElement}
                        ports={[]}
                        atomIndex={-1}
                        isGhost={true}
                    />
                    {/* Plano invisible para capturar click */}
                    <mesh
                        position={[0, 0, 0]}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEmptyClick([0, 0, 0]);
                        }}
                    >
                        <sphereGeometry args={[ATOM_RADIUS * 1.5, 16, 16]} />
                        <meshBasicMaterial transparent opacity={0} />
                    </mesh>
                </>
            )}

            {/* Átomos colocados */}
            {placedAtoms.map((atom, idx) => (
                <Atom3D
                    key={`atom-${idx}`}
                    position={atom.position}
                    element={atom.element}
                    elementData={atom.elementData}
                    ports={atom.ports}
                    atomIndex={idx}
                    onPortClick={onPortClick}
                    isGhost={false}
                />
            ))}

            {/* Enlaces */}
            {bonds.map(([a, b], idx) => (
                <Bond3D
                    key={`bond-${idx}`}
                    start={placedAtoms[a]?.position || [0, 0, 0]}
                    end={placedAtoms[b]?.position || [0, 0, 0]}
                />
            ))}
        </>
    );
};

const MoleculeBuilder3D = ({
    placedAtoms,
    bonds,
    selectedElement,
    onPortClick,
    onEmptyClick,
}) => {
    return (
        <div className="molecule-canvas-container">
            <Canvas
                camera={{ position: [0, 2, 5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <color attach="background" args={['#0c1222']} />
                <fog attach="fog" args={['#0c1222', 8, 25]} />
                <Scene
                    placedAtoms={placedAtoms}
                    bonds={bonds}
                    selectedElement={selectedElement}
                    onPortClick={onPortClick}
                    onEmptyClick={onEmptyClick}
                />
            </Canvas>

            {/* Indicador de controles */}
            <div className="canvas-controls-hint">
                <span>Girar: Click izq.</span>
                <span>Zoom: Scroll</span>
                <span>Mover: Click der.</span>
            </div>
        </div>
    );
};

export default MoleculeBuilder3D;
