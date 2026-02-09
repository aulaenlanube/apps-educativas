import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { solarSystemData } from './model/solarSystemData';
import './SistemaSolar.css';

// --- HELPER PARA DESCRIPCIONES ---
const getDescription = (planet, level, grade) => {
    if (!planet || !planet.description) return "Descripción no disponible.";
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

    // Luz un poco más tenue para mantener contraste 3D, pero suficiente para ver detalles en sombras
    return <pointLight ref={lightRef} intensity={0.8} distance={60} decay={2} color="#ffffff" />;
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

// --- TEXTURED RING MATERIAL ---
const TexturedRingMaterial = ({ textureUrl }) => {
    const texture = useTexture(textureUrl);
    texture.rotation = -Math.PI / 2;
    // La textura de anillos suele ser una tira horizontal (transparente a opaca a transparente)
    // O una imagen circular completa.
    // Si es la imagen de "2k_saturn_ring_alpha.png", normalmente es una tira vertical u horizontal que representa la opacidad/color radial.
    // Para mapearla en un anillo 3D, necesitamos que las coordenadas UV sigan el radio.

    return (
        <meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent
            opacity={1}
        />
    );
};

// --- COMPONENTE ANILLOS MEJORADO ---
const PlanetRing = ({ size, textureUrl, innerRadius, outerRadius }) => {
    const finalInner = innerRadius || size * 1.4;
    const finalOuter = outerRadius || size * 2.2;
    const ref = useRef();

    // Ajustamos las UVs manualmente para que la textura se mapee radialmente
    useEffect(() => {
        if (ref.current && textureUrl) {
            const geometry = ref.current.geometry;
            const pos = geometry.attributes.position;
            const uv = geometry.attributes.uv;

            // Recorremos los vértices para ajustar UVs
            // ringGeometry crea vértices en orden radial
            // Queremos que V vaya de 0 (radio interior) a 1 (radio exterior)
            // U vaya de 0 a 1 alrededor del círculo (para mantener la textura continua si tuviera variación angular, aunque para anillos suele ser uniforme angularmente y variar radialmente)

            // Sin embargo, para la textura de saturno que suele ser una tira, queremos que esa tira se "estire" del centro hacia afuera.
            // Normalmente mapeamos la coordenada U o V a la distancia del centro.

            // Truco simple: Rotamos el anillo plano para que miren "hacia la cámara" o modificamos la rotación
            // Pero lo mejor es ajustar UVs:

            // THREE.RingGeometry genera UVs de forma que mapea la imagen cuadrada sobre el anillo entero.
            // Para anillos planetarios, queremos mapear una línea de píxeles (gradiente radial) a lo largo del radio.

            // Solución: Usar un trick con lat/long o simplemente re-mapear UVs
            // Vamos a probar forzando que la textura se interprete radialmente
            // Pero como es complejo sin shaders custom, usaremos una rotación en la textura y el mapeo estándar de RingGeometry
            // RingGeometry mapea (0,0) en el centro a (1,1) en la esquina? No, mapea el círculo inscrito.

            const count = pos.count;
            for (let i = 0; i < count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);

                // Radio actual del vértice
                const r = Math.sqrt(x * x + y * y);

                // Normalizamos r entre 0 y 1 relativo al ancho del anillo
                // v = (r - inner) / (outer - inner)
                const v = (r - finalInner) / (finalOuter - finalInner);

                // u = ángulo / 2PI
                const angle = Math.atan2(y, x);
                const u = (angle / (2 * Math.PI)) + 0.5;

                // Ajustamos UVs: queremos que la textura se lea a lo largo del radio.
                // Si la imagen es horizontal (izquierda=interior, derecha=exterior), usamos U=v, V=0
                // Si la imagen es vertical, U=0, V=v

                // Asumiendo textura horizontal para el gradiente del anillo
                uv.setXY(i, v, 0.5);
            }
            geometry.attributes.uv.needsUpdate = true;
        }
    }, [finalInner, finalOuter, textureUrl]);

    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[finalInner, finalOuter, 128]} />
            {textureUrl ? (
                <TextureErrorBoundary fallback={<meshStandardMaterial color="#C0C0C0" side={THREE.DoubleSide} transparent opacity={0.6} />}>
                    <React.Suspense fallback={<meshStandardMaterial color="#C0C0C0" side={THREE.DoubleSide} transparent opacity={0.6} />}>
                        <meshStandardMaterial
                            map={useTexture(textureUrl)}
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.9}
                        />
                    </React.Suspense>
                </TextureErrorBoundary>
            ) : (
                <meshStandardMaterial
                    color="#C0C0C0"
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.6}
                />
            )}
        </mesh>
    );
};

// --- PANEL DE CONFIGURACIÓN ---
const ConfigPanel = ({ config, setConfig }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="config-panel">
            <h3
                className="config-title"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <span>⚙️ Configuración</span>
                <span style={{ fontSize: '0.8em' }}>{isOpen ? '▼' : '▲'}</span>
            </h3>
            <p className="config-instruction">Haz clic en un planeta para viajar a él.</p>

            {isOpen && (
                <div className="config-content">
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
                            <span>Velocidad Rotación</span>
                            <span>{config.rotationSpeed.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="10" step="0.5"
                            value={config.rotationSpeed}
                            onChange={(e) => setConfig({ ...config, rotationSpeed: parseFloat(e.target.value) })}
                            className="config-slider"
                        />
                    </div>

                    <div className="config-item">
                        <div className="config-label-row">
                            <span>Zoom</span>
                            <span>{config.zoomLevel.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.5" max="3" step="0.1"
                            value={config.zoomLevel}
                            onChange={(e) => setConfig({ ...config, zoomLevel: parseFloat(e.target.value) })}
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
            )}
        </div>
    );
};

// --- COMPONENTE LUNA ---
const Moon = ({ moon, simSpeed, rotationSpeed, onClick, registerRef, isPaused }) => {
    const moonGroupRef = useRef();
    const moonMeshRef = useRef();

    // Registrar referencia de la luna para la cámara
    useEffect(() => {
        if (registerRef && moonGroupRef.current) {
            registerRef(moon.id, moonGroupRef);
        }
    }, [registerRef, moon.id]);

    // Estado para la órbita de la luna: Ángulo inicial aleatorio
    const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);
    const angleRef = useRef(initialAngle);

    useFrame((state, delta) => {
        // Rotación de la Luna sobre sí misma
        if (moonMeshRef.current) {
            moonMeshRef.current.rotation.y += 0.005 * rotationSpeed;
        }

        // Movimiento orbital de la Luna
        // Actualizamos el ángulo basado en la velocidad SOLO SI NO ESTÁ PAUSADO
        if (!isPaused) {
            angleRef.current += moon.speed * simSpeed;
        }

        if (moonGroupRef.current) {
            // Posicionamos el grupo de la luna relativo al padre (Planeta)
            moonGroupRef.current.position.x = Math.cos(angleRef.current) * moon.distance;
            moonGroupRef.current.position.z = Math.sin(angleRef.current) * moon.distance;
        }
    });

    return (
        <>
            <group ref={moonGroupRef}>
                <mesh
                    ref={moonMeshRef}
                    onClick={(e) => { e.stopPropagation(); onClick(moon); }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    <sphereGeometry args={[moon.size, 32, 32]} />
                    <PlanetMaterial
                        color={moon.color}
                        textureUrl={moon.textureUrl}
                    />
                </mesh>
            </group>
            {/* Órbita visual de la luna */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[moon.distance - 0.03, moon.distance + 0.03, 128]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
        </>
    );
};

// --- PLANETA INDIVIDUAL ---
const Planet = ({ planet, isPaused, onClick, registerRef, simSpeed, rotationSpeed, showLabels }) => {
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
            meshRef.current.rotation.y += 0.005 * rotationSpeed;
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

    const currentSize = planet.size;

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
                <PlanetRing
                    size={currentSize}
                    textureUrl={planet.ringTextureUrl}
                    innerRadius={planet.ringInnerRadius}
                    outerRadius={planet.ringOuterRadius}
                />
            )}

            {showLabels && (
                <Html position={[0, currentSize + 0.5, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                    <div className="planet-label" style={{ opacity: isPaused ? 0.5 : 1 }}>{planet.name}</div>
                </Html>
            )}

            {/* Renderizar Lunas si existen */}
            {planet.moons && planet.moons.map((moon) => (
                <Moon
                    key={moon.id}
                    moon={moon}
                    simSpeed={simSpeed}
                    rotationSpeed={rotationSpeed}
                    onClick={onClick}
                    registerRef={registerRef}
                    isPaused={isPaused}
                />
            ))}
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
const CameraController = ({ selectedPlanetId, planetRefs, config }) => {
    // Referencia para la posición objetivo suavizada del target (centro de atención)
    const currentTarget = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(({ camera, controls }, delta) => {
        if (!controls) return;

        if (selectedPlanetId && planetRefs.current[selectedPlanetId]?.current) {
            // MODO PLANETA: Enfocar y Acercar
            const planetGroup = planetRefs.current[selectedPlanetId].current;

            // Usamos getWorldPosition para obtener la posición real en el mundo 3D
            // Esto es necesario para objetos anidados como lunas
            const currentWorldPos = new THREE.Vector3();
            planetGroup.getWorldPosition(currentWorldPos);

            const targetVec = currentWorldPos;

            // 1. Suavizar movimiento del Target (hacia donde miramos)
            currentTarget.current.lerp(targetVec, delta * 4);
            controls.target.copy(currentTarget.current);

            // 2. Acercar cámara si está lejos (Animación de Zoom In)
            // Calculamos la distancia ideal basada en el tamaño del planeta
            // Buscamos en planetas Y lunas
            let planetData = solarSystemData.find(p => p.id === selectedPlanetId);
            if (!planetData) {
                // Si no es planeta, buscar en lunas
                for (const p of solarSystemData) {
                    if (p.moons) {
                        const moon = p.moons.find(m => m.id === selectedPlanetId);
                        if (moon) {
                            planetData = moon;
                            break;
                        }
                    }
                }
            }

            const size = planetData?.size || 1;
            // Distancia base modificada por el slider de zoom (inverso: mayor zoom = menor distancia)
            const baseDist = size * 5;
            // zoomLevel 1 = baseDist
            // zoomLevel 2 = baseDist / 2 (más cerca)
            // zoomLevel 0.5 = baseDist * 2 (más lejos)
            const zoomFactor = 1 / (config?.zoomLevel || 1);
            const idealDist = baseDist * zoomFactor;

            // Distancia actual al target
            const dist = camera.position.distanceTo(currentTarget.current);

            // Si la distancia es significativamente diferente a la ideal, interpolamos
            if (Math.abs(dist - idealDist) > 0.5) {
                // Dirección desde el target hacia la cámara actual
                const direction = new THREE.Vector3().subVectors(camera.position, currentTarget.current).normalize();
                // Nueva posición ideal manteniendo la dirección pero ajustando la distancia
                const goalPos = new THREE.Vector3().copy(currentTarget.current).add(direction.multiplyScalar(idealDist));

                camera.position.lerp(goalPos, delta * 2);
            }
            // Si ya estamos cerca, NO forzamos posición, permitiendo orbital con el ratón

        } else {
            // MODO SISTEMA: Volver a visión general
            const defaultTarget = new THREE.Vector3(0, 0, 0); // Sol
            const defaultCamPos = new THREE.Vector3(0, 80, 140); // Arriba y atrás (Ajustado a nueva escala)

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
        rotationSpeed: 1,
        showOrbits: true,
        showLabels: true,
        zoomLevel: 1 // Default zoom level
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
            </div>

            <ConfigPanel config={config} setConfig={setConfig} />

            <Canvas camera={{ position: [0, 80, 140], fov: 50, far: 2000 }} shadows>
                <color attach="background" args={['#020205']} />

                <ambientLight intensity={0.4} />
                <pointLight position={[0, 0, 0]} intensity={2.5} distance={1000} decay={0} color="#FDB813" />
                <CameraLight />
                <Stars radius={350} depth={100} count={8000} factor={6} saturation={0} fade speed={1} />

                <OrbitControls
                    enablePan={!selectedPlanet}
                    enableZoom={!selectedPlanet}
                    makeDefault
                />

                <CameraController
                    selectedPlanetId={selectedPlanet?.id}
                    planetRefs={planetRefs}
                    config={config}
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
                                rotationSpeed={config.rotationSpeed}
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
