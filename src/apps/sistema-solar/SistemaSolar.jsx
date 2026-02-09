import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { solarSystemData } from './model/solarSystemData';
import './SistemaSolar.css';

// --- HELPER PARA DESCRIPCIONES ---
const getDescription = (planet, level, grade) => {
    if (level === 'eso') return planet.description.secondary;
    if (level === 'primaria') {
        if (['1', '2', '3'].includes(grade)) return planet.description.primaryBasic;
        return planet.description.primaryAdvanced;
    }
    return planet.description.secondary;
};

// --- LUZ DE CÁMARA (Linterna para inspección) ---
const CameraLight = () => {
    const lightRef = useRef();
    useFrame(({ camera }) => {
        if (lightRef.current) {
            lightRef.current.position.copy(camera.position);
        }
    });
    // Luz un poco más tenue para mantener contraste 3D
    return <pointLight ref={lightRef} intensity={0.5} distance={50} decay={2} color="#ffffff" />;
}

// --- MANEJO DE ERRORES DE TEXTURA ---
class TextureErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.warn("Error loading texture:", error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

const TexturedMaterial = ({ textureUrl, emissive, emissiveIntensity }) => {
    // useTexture lanzará un error si falla la carga, que será capturado por el ErrorBoundary
    const texture = useTexture(textureUrl);
    return (
        <meshStandardMaterial
            map={texture}
            emissive={emissive || '#000000'}
            emissiveIntensity={emissiveIntensity || 0}
            roughness={0.5}
            metalness={0.1}
        />
    );
};

const ColoredMaterial = ({ color, emissive, emissiveIntensity }) => {
    return (
        <meshStandardMaterial
            color={color}
            emissive={emissive || '#000000'}
            emissiveIntensity={emissiveIntensity || 0}
            roughness={0.5}
            metalness={0.1}
        />
    );
};

// --- COMPONENTE MATERIAL SEGURO ---
const PlanetMaterial = ({ color, emissive, emissiveIntensity, textureUrl }) => {
    if (textureUrl) {
        return (
            <TextureErrorBoundary fallback={<ColoredMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}>
                <React.Suspense fallback={<ColoredMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}>
                    <TexturedMaterial
                        textureUrl={textureUrl}
                        emissive={emissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </React.Suspense>
            </TextureErrorBoundary>
        );
    }

    return <ColoredMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />;
};

// --- PANEL DE CONFIGURACIÓN ---
const ConfigPanel = ({ config, setConfig }) => {
    return (
        <div className="config-panel">
            <h3 className="config-title">⚙️ Configuración</h3>

            <div className="config-item">
                <div className="config-label-row">
                    <span>Velocidad de Órbita</span>
                    <span>{config.simSpeed.toFixed(1)}x</span>
                </div>
                <input
                    type="range"
                    min="0" max="10" step="0.5"
                    value={config.simSpeed}
                    onChange={(e) => setConfig({ ...config, simSpeed: parseFloat(e.target.value) })}
                    className="config-slider"
                />
            </div>

            <div className="config-item">
                <div className="config-label-row">
                    <span>Tamaño Planetas</span>
                    <span>{config.planetScale.toFixed(1)}x</span>
                </div>
                <input
                    type="range"
                    min="0.5" max="3" step="0.1"
                    value={config.planetScale}
                    onChange={(e) => setConfig({ ...config, planetScale: parseFloat(e.target.value) })}
                    className="config-slider"
                />
            </div>

            <div className="config-toggles">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={config.showOrbits}
                        onChange={(e) => setConfig({ ...config, showOrbits: e.target.checked })}
                        className="toggle-checkbox"
                    />
                    Órbitas
                </label>
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        checked={config.showLabels}
                        onChange={(e) => setConfig({ ...config, showLabels: e.target.checked })}
                        className="toggle-checkbox"
                    />
                    Etiquetas
                </label>
            </div>
        </div>
    );
};

// --- PLANETA INDIVIDUAL ---
const Planet = ({ planet, isPaused, onClick, registerRef, simSpeed, planetScale, showLabels }) => {
    const groupRef = useRef();
    const meshRef = useRef();

    // Ángulo inicial aleatorio para que no estén todos línea
    const startAngle = useMemo(() => Math.random() * Math.PI * 2, []);
    const [angle, setAngle] = useState(startAngle); // Estado para mantener la posición al pausar

    // Registrar referencia
    useEffect(() => {
        if (registerRef && groupRef.current) {
            registerRef(planet.id, groupRef);
        }
    }, [registerRef, planet.id]);

    useFrame(({ clock }, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }

        if (planet.distance > 0) {
            let currentAngle = angle;

            if (!isPaused) {
                currentAngle += planet.speed * simSpeed * 0.5;
                setAngle(currentAngle);
            }

            if (groupRef.current) {
                groupRef.current.position.x = Math.cos(currentAngle) * planet.distance;
                groupRef.current.position.z = Math.sin(currentAngle) * planet.distance;
            }
        }
    });

    const currentSize = planet.size * planetScale;

    return (
        <group ref={groupRef}>
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(planet); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <sphereGeometry args={[currentSize, 64, 64]} />
                <PlanetMaterial
                    color={planet.color}
                    emissive={planet.emissive}
                    emissiveIntensity={planet.emissiveIntensity}
                    textureUrl={planet.textureUrl}
                />
            </mesh>

            {planet.hasRings && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[currentSize * 1.4, currentSize * 2.2, 64]} />
                    <meshStandardMaterial color="#C0C0C0" side={THREE.DoubleSide} transparent opacity={0.6} />
                </mesh>
            )}

            {showLabels && (
                <Html position={[0, currentSize + 0.5, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                    <div className="planet-label" style={{ opacity: isPaused ? 0.5 : 1 }}>{planet.name}</div>
                </Html>
            )}
        </group>
    );
};

// --- ORBITAS VISUALES ---
const OrbitPath = ({ distance, visible }) => {
    if (distance <= 0 || !visible) return null;
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[distance - 0.05, distance + 0.05, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
    );
};

// --- CONTROLADOR DE CÁMARA (ANIMACIÓN) ---
const CameraController = ({ selectedPlanetId, planetRefs }) => {
    // Referencia para la posición objetivo suavizada del target (centro de atención)
    const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(({ camera, controls }, delta) => {
        if (!controls) return;

        if (selectedPlanetId && planetRefs.current[selectedPlanetId]?.current) {
            // MODO PLANETA: Enfocar y Acercar
            const planetGroup = planetRefs.current[selectedPlanetId].current;
            const pPos = planetGroup.position;
            const targetVec = new THREE.Vector3(pPos.x, pPos.y, pPos.z);

            // 1. Suavizar movimiento del Target (hacia donde miramos)
            currentTarget.current.lerp(targetVec, delta * 4);
            controls.target.copy(currentTarget.current);

            // 2. Acercar cámara si está lejos (Animación de Zoom In)
            // Calculamos la distancia ideal basada en el tamaño del planeta
            const planetData = solarSystemData.find(p => p.id === selectedPlanetId);
            const size = planetData?.size || 1;
            const idealDist = size * 4;

            // Distancia actual al target
            const dist = camera.position.distanceTo(currentTarget.current);

            // Si estamos muy lejos, acercamos la cámara suavemente
            if (dist > idealDist + 0.5) {
                // Dirección desde el target hacia la cámara actual
                const direction = new THREE.Vector3().subVectors(camera.position, currentTarget.current).normalize();
                // Nueva posición ideal acercándose
                const goalPos = new THREE.Vector3().copy(currentTarget.current).add(direction.multiplyScalar(idealDist));

                camera.position.lerp(goalPos, delta * 2);
            }
            // Si ya estamos cerca, NO forzamos posición, permitiendo orbital con el ratón

        } else {
            // MODO SISTEMA: Volver a visión general
            const defaultTarget = new THREE.Vector3(0, 0, 0); // Sol
            const defaultCamPos = new THREE.Vector3(0, 30, 45); // Arriba y atrás

            // Interpolamos target
            currentTarget.current.lerp(defaultTarget, delta * 2);
            controls.target.copy(currentTarget.current);

            // Interpolamos cámara a posición original
            if (camera.position.distanceTo(defaultCamPos) > 1) {
                camera.position.lerp(defaultCamPos, delta * 1.5);
            }
        }
    });

    return null;
};

// --- UI OVERLAY ---
const InfoPanel = ({ planet, level, grade, onClose }) => {
    if (!planet) return null;

    const description = getDescription(planet, level, grade);

    return (
        <div className="info-panel-overlay">
            <div className="info-panel-card">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2 style={{ color: planet.color }}>{planet.name}</h2>
                <div className="planet-details">
                    <p className="main-desc">{description}</p>
                    <div className="extra-stats">
                        <div className="stat-item">
                            <strong>Tipo:</strong> {planet.type === 'star' ? 'Estrella' : 'Planeta'}
                        </div>
                        <div className="stat-item">
                            <strong>Distancia:</strong> {planet.distance === 0 ? '0' : Math.round(planet.distance * 10)} M.km
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const SistemaSolar = ({ level, grade }) => {
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const planetRefs = useRef({});

    // Configuración Global
    const [config, setConfig] = useState({
        simSpeed: 1,
        planetScale: 1,
        showOrbits: true,
        showLabels: true
    });

    const handlePlanetClick = (planet) => {
        if (selectedPlanet?.id !== planet.id) {
            setSelectedPlanet(planet);
        }
    };

    const handleClose = () => {
        setSelectedPlanet(null);
    };

    const registerPlanetRef = (id, ref) => {
        planetRefs.current[id] = ref;
    };

    return (
        <div className="sistema-solar-container">
            <div className="ui-header">
                <h1>🌌 Sistema Solar 3D</h1>
                <p>Haz clic en un planeta para viajar a él.</p>
            </div>

            <ConfigPanel config={config} setConfig={setConfig} />

            <Canvas camera={{ position: [0, 30, 40], fov: 45 }} shadows>
                <color attach="background" args={['#020205']} />

                <ambientLight intensity={0.4} />
                <pointLight position={[0, 0, 0]} intensity={2} distance={1000} decay={0} color="#FDB813" />
                <CameraLight />
                <Stars radius={150} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />

                <OrbitControls
                    enablePan={!selectedPlanet}
                    enableZoom={!selectedPlanet}
                    makeDefault
                />

                <CameraController
                    selectedPlanetId={selectedPlanet?.id}
                    planetRefs={planetRefs}
                />

                <React.Suspense fallback={null}>
                    {solarSystemData.map((planet) => (
                        <React.Fragment key={planet.id}>
                            <Planet
                                planet={planet}
                                isPaused={!!selectedPlanet}
                                onClick={handlePlanetClick}
                                registerRef={registerPlanetRef}
                                simSpeed={config.simSpeed}
                                planetScale={config.planetScale}
                                showLabels={config.showLabels}
                            />
                            <OrbitPath
                                distance={planet.distance}
                                visible={config.showOrbits}
                            />
                        </React.Fragment>
                    ))}
                </React.Suspense>
            </Canvas>

            <InfoPanel
                planet={selectedPlanet}
                level={level}
                grade={grade}
                onClose={handleClose}
            />
        </div>
    );
};

export default SistemaSolar;
