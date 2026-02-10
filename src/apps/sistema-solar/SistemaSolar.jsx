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

const TexturedMaterial = ({ textureUrl, emissive, emissiveIntensity, isSun }) => {
    // useTexture lanzará un error si falla la carga, que será capturado por el ErrorBoundary
    const texture = useTexture(textureUrl);
    return (
        <meshStandardMaterial
            map={texture}
            emissive={emissive || '#000000'}
            emissiveIntensity={emissiveIntensity || 0}
            emissiveMap={isSun ? texture : null}
            roughness={isSun ? 1 : 0.5}
            metalness={isSun ? 0 : 0.1}
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
const PlanetMaterial = ({ color, emissive, emissiveIntensity, textureUrl, isSun }) => {
    if (textureUrl) {
        return (
            <TextureErrorBoundary fallback={<ColoredMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}>
                <React.Suspense fallback={<ColoredMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}>
                    <TexturedMaterial
                        textureUrl={textureUrl}
                        emissive={emissive}
                        emissiveIntensity={emissiveIntensity}
                        isSun={isSun}
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

// --- COMPONENTE HOTSPOT ---
const Hotspot = ({ position, title, desc, onClick, isVisited, isActive }) => {
    return (
        <Html position={position} center className="hotspot-wrapper">
            <div className={`hotspot-container ${isVisited ? 'visited' : ''} ${isActive ? 'active' : ''}`}>
                <button
                    className="hotspot-dot"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick({ title, desc });
                    }}
                >
                    {!isVisited && <span className="hotspot-pulse"></span>}
                </button>
                {isActive && (
                    <div className="hotspot-popup">
                        <h4>{title}</h4>
                        <p>{desc}</p>
                    </div>
                )}
            </div>
        </Html>
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
const ConfigPanel = ({ config, setConfig, onResetProgress, visitedCount, totalCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const remaining = totalCount - visitedCount;
    const percentage = Math.round((visitedCount / totalCount) * 100);

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
            <div className="progress-mini-bar">
                <div className="progress-text">
                    <span>Exploración: <strong>{visitedCount}/{totalCount}</strong></span>
                    {remaining > 0 && <span className="remaining-tag">Quedan {remaining}</span>}
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
            <p className="config-instruction">Haz clic en un planeta para viajar a él.</p>

            {isOpen && (
                <div className="config-content">
                    <div className="config-item">
                        <div className="config-label-row">
                            <span>Velocidad de Órbita</span>
                        </div>
                        <input
                            type="range"
                            min="0.5" max="10" step="0.5"
                            value={config.simSpeed}
                            onChange={(e) => setConfig({ ...config, simSpeed: parseFloat(e.target.value) })}
                            className="config-slider"
                        />
                    </div>

                    <div className="config-item">
                        <div className="config-label-row">
                            <span>Velocidad Rotación</span>
                        </div>
                        <input
                            type="range"
                            min="0.5" max="10" step="0.5"
                            value={config.rotationSpeed}
                            onChange={(e) => setConfig({ ...config, rotationSpeed: parseFloat(e.target.value) })}
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

                    <button className="btn-reset-progress" onClick={onResetProgress}>
                        🔄 Reiniciar Progreso
                    </button>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE LUNA ---
const Moon = ({ moon, simSpeed, rotationSpeed, onClick, registerRef, isPaused, isSelected, onHotspotClick, visitedHotspots, activeHotspots }) => {
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

                {/* Hotspots de la Luna: Solo si la Luna es el cuerpo seleccionado */}
                {isSelected === moon.id && moon.advanced?.hotspots?.map((hs, index) => {
                    const hotspotId = `${moon.id}-${index}`;
                    return (
                        <Hotspot
                            key={index}
                            position={hs.pos}
                            title={hs.title}
                            desc={hs.desc}
                            isVisited={visitedHotspots[hotspotId]}
                            onClick={(data) => onHotspotClick(data, hotspotId)}
                            isActive={!!activeHotspots[hotspotId]}
                        />
                    );
                })}
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
const Planet = ({ planet, isPaused, onClick, registerRef, simSpeed, rotationSpeed, showLabels, isSelected, onHotspotClick, visitedHotspots, activeHotspots }) => {
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
                    isSun={planet.id === 'sun'}
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
                <Html position={[0, currentSize + 1.5, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                    <div className="planet-label" style={{ opacity: isPaused ? 0.5 : 1 }}>{planet.name}</div>
                </Html>
            )}

            {/* Hotspots interactivos: Solo si el planeta está seleccionado */}
            {isSelected === planet.id && planet.advanced?.hotspots?.map((hs, index) => {
                const hotspotId = `${planet.id}-${index}`;
                return (
                    <Hotspot
                        key={index}
                        position={hs.pos}
                        title={hs.title}
                        desc={hs.desc}
                        isVisited={visitedHotspots[hotspotId]}
                        onClick={(data) => onHotspotClick(data, hotspotId)}
                        isActive={!!activeHotspots[hotspotId]}
                    />
                );
            })}

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
                    isSelected={isSelected} // ID del cuerpo seleccionado
                    onHotspotClick={onHotspotClick}
                    visitedHotspots={visitedHotspots}
                    activeHotspots={activeHotspots}
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

const CameraController = ({ selectedPlanetId, planetRefs, config, activeHotspot }) => {
    const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
    const rotationTimer = useRef(0);
    const lastInteractionTime = useRef(0);
    const lastDist = useRef(null);

    useFrame(({ camera, controls }, delta) => {
        if (!controls) return;

        // Detector de interacción de zoom manual
        const currentDist = camera.position.distanceTo(controls.target);
        if (lastDist.current !== null && Math.abs(currentDist - lastDist.current) > 0.001) {
            lastInteractionTime.current = performance.now();
        }
        lastDist.current = currentDist;

        const timeSinceInteraction = performance.now() - lastInteractionTime.current;
        const isUserInteracting = timeSinceInteraction < 4000; // 4 segundos de pausa antes de volver

        if (selectedPlanetId && planetRefs.current[selectedPlanetId]?.current) {
            const planetGroup = planetRefs.current[selectedPlanetId].current;
            const currentWorldPos = new THREE.Vector3();
            planetGroup.getWorldPosition(currentWorldPos);
            const targetVec = currentWorldPos;

            // Suavizado del Target
            currentTarget.current.lerp(targetVec, delta * 4);
            controls.target.copy(currentTarget.current);

            // Parámetros de zoom ideal
            let planetData = solarSystemData.find(p => p.id === selectedPlanetId);
            if (!planetData) {
                for (const p of solarSystemData) {
                    if (p.moons) {
                        const moon = p.moons.find(m => m.id === selectedPlanetId);
                        if (moon) { planetData = moon; break; }
                    }
                }
            }
            const size = planetData?.size || 1;
            const baseDist = size * 5;
            const zoomFactor = 1 / (config?.zoomLevel || 1);
            const hotspotActive = !!activeHotspot;
            const idealDist = hotspotActive ? baseDist * (activeHotspot.zoom || 0.6) : baseDist * zoomFactor;

            // Animación automática de zoom/rotación (solo si no hay interacción reciente)
            if (!isUserInteracting || hotspotActive) {
                const direction = new THREE.Vector3().subVectors(camera.position, currentTarget.current).normalize();

                if (hotspotActive) {
                    rotationTimer.current += delta * 0.3;
                    direction.x = Math.cos(rotationTimer.current);
                    direction.z = Math.sin(rotationTimer.current);
                    direction.y = activeHotspot.tilt || 0.3;
                    direction.normalize();
                } else {
                    rotationTimer.current = Math.atan2(direction.z, direction.x);
                }

                const goalPos = new THREE.Vector3().copy(currentTarget.current).add(direction.multiplyScalar(idealDist));
                // Velocidad de retorno muy lenta (delta * 0.5) para que sea suave
                camera.position.lerp(goalPos, delta * (hotspotActive ? 1.5 : 0.5));
            }

        } else {
            // MODO SISTEMA
            const defaultTarget = new THREE.Vector3(0, 0, 0);
            const defaultCamPos = new THREE.Vector3(0, 80, 140);
            currentTarget.current.lerp(defaultTarget, delta * 2);
            controls.target.copy(currentTarget.current);

            if (!isUserInteracting) {
                camera.position.lerp(defaultCamPos, delta * 0.5);
            }
        }
    });

    return null;
};

const InfoPanel = ({ planet, level, grade, onClose }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    if (!planet) return null;

    const description = getDescription(planet, level, grade);

    return (
        <div className={`info-panel-overlay ${showAdvanced ? 'expanded' : ''}`}>
            <div className="info-panel-card">
                <div className="panel-header">
                    <h2 style={{ color: planet.color }}>{planet.name}</h2>
                    <button className="btn-exit-planet" onClick={onClose}>
                        Salir
                    </button>
                </div>

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

                    <button
                        className={`btn-advanced-toggle ${showAdvanced ? 'active' : ''}`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        {showAdvanced ? '🔼 Menos Información' : '🧪 Composición y Datos'}
                    </button>

                    {showAdvanced && planet.advanced && (
                        <div className="advanced-info-section">
                            <div className="advanced-block">
                                <h3>🧪 Composición Química</h3>
                                <p><strong>Elementos:</strong> {planet.advanced.composition.elements.join(', ')}</p>
                                <p><strong>Compuestos:</strong> {planet.advanced.composition.compounds.join(', ')}</p>
                            </div>
                            <div className="advanced-block">
                                <h3>🌍 Geografía y Estructura</h3>
                                <p>{planet.advanced.geography}</p>
                            </div>
                            <div className="advanced-block">
                                <h3>💡 Curiosidades Técnicas</h3>
                                <ul>
                                    {planet.advanced.curiosities.map((c, i) => (
                                        <li key={i}>{c}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE MODAL DE REINICIO ---
const ResetModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" style={{
            zIndex: 5000
        }}>
            <div className="modal-content" style={{ pointerEvents: 'auto' }}>
                <span className="modal-icon">⚠️</span>
                <h3>¿Reiniciar Exploración?</h3>
                <p>Se borrarán todos tus puntos de interés visitados y volverás al estado inicial del sistema.</p>
                <div className="modal-actions">
                    <button type="button" className="btn-modal-cancel" onClick={onCancel}>Cancelar</button>
                    <button type="button" className="btn-modal-confirm" onClick={onConfirm}>Confirmar Reinicio</button>
                </div>
            </div>
        </div >
    );
};

// --- COMPONENTE PRINCIPAL ---
const SistemaSolar = ({ level, grade }) => {
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [activeHotspots, setActiveHotspots] = useState({}); // Múltiples popups activos
    const [lastClickedHotspot, setLastClickedHotspot] = useState(null); // Para la cámara
    const [visitedHotspots, setVisitedHotspots] = useState({});
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const planetRefs = useRef({});

    // Calcular total de puntos de interés
    const totalHotspots = useMemo(() => {
        let count = 0;
        solarSystemData.forEach(planet => {
            if (planet.advanced?.hotspots) count += planet.advanced.hotspots.length;
            if (planet.moons) {
                planet.moons.forEach(moon => {
                    if (moon.advanced?.hotspots) count += moon.advanced.hotspots.length;
                });
            }
        });
        return count;
    }, []);

    // Configuración Global
    const [config, setConfig] = useState({
        simSpeed: 0.5,
        rotationSpeed: 0.5,
        showOrbits: true,
        showLabels: true,
        zoomLevel: 1 // Default zoom level
    });

    const handlePlanetClick = (planet) => {
        if (selectedPlanet?.id !== planet.id) {
            setSelectedPlanet(planet);
            setActiveHotspots({});
            setLastClickedHotspot(null);
        }
    };

    const handleHotspotClick = (data, hotspotId) => {
        setActiveHotspots(prev => ({
            ...prev,
            [hotspotId]: data
        }));
        setLastClickedHotspot(data);
        setVisitedHotspots(prev => ({
            ...prev,
            [hotspotId]: true
        }));
    };

    const handleResetProgress = () => {
        setShowResetModal(true);
    };

    const confirmReset = () => {
        setShowResetModal(false);
        setIsResetting(true);

        // Simular tiempo de animación de "reinicio de sistema"
        setTimeout(() => {
            setVisitedHotspots({});
            setActiveHotspots({});
            setLastClickedHotspot(null);
            setSelectedPlanet(null);
            setIsResetting(false);
        }, 2500);
    };

    const handleClose = () => {
        setSelectedPlanet(null);
        setActiveHotspots({});
        setLastClickedHotspot(null);
    };

    const registerPlanetRef = (id, ref) => {
        planetRefs.current[id] = ref;
    };

    const visitedCount = Object.keys(visitedHotspots).length;

    return (
        <div className="sistema-solar-container">
            <div className="ui-header">
                <h1>🌌 Sistema Solar 3D</h1>
            </div>

            <ConfigPanel
                config={config}
                setConfig={setConfig}
                onResetProgress={handleResetProgress}
                visitedCount={visitedCount}
                totalCount={totalHotspots}
            />

            <Canvas camera={{ position: [0, 80, 140], fov: 50, far: 2000 }} shadows>
                <color attach="background" args={['#020205']} />

                <ambientLight intensity={0.4} />
                <pointLight position={[0, 0, 0]} intensity={1.5} distance={1000} decay={0} color="#FDB813" />
                <CameraLight />
                <Stars radius={350} depth={100} count={8000} factor={6} saturation={0} fade speed={1} />

                <OrbitControls
                    enablePan={!selectedPlanet}
                    enableZoom={true}
                    makeDefault
                />

                <CameraController
                    selectedPlanetId={selectedPlanet?.id}
                    planetRefs={planetRefs}
                    config={config}
                    activeHotspot={lastClickedHotspot}
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
                                isSelected={selectedPlanet?.id}
                                onHotspotClick={handleHotspotClick}
                                visitedHotspots={visitedHotspots}
                                activeHotspots={activeHotspots}
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

            <ResetModal
                isOpen={showResetModal}
                onConfirm={confirmReset}
                onCancel={() => setShowResetModal(false)}
            />

            {/* Animación de Reinicio de Sistema mejorada */}
            <div className={`reboot-overlay ${isResetting ? 'active' : ''}`}>
                <div className="reboot-wipe"></div>
                <div className="reboot-scanlines"></div>
                <div className="reboot-horizontal-bar"></div>
                <div className="reboot-grid"></div>
                <div className="reboot-text-container">
                    <div className="reboot-text">REBOOTING</div>
                    <span className="reboot-subtext">PURGING DATA & CALIBRATING OPTICS...</span>
                </div>
            </div>
        </div>
    );
};

export default SistemaSolar;
