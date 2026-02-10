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

// --- COMPONENTE NUBES ---
const CloudLayer = ({ textureUrl, size }) => {
    const texture = useTexture(textureUrl);

    return (
        <mesh>
            <sphereGeometry args={[size * 1.015, 64, 64]} />
            <meshStandardMaterial
                map={texture} // A veces la textura viene con color, probamos map + transparent + blending
                transparent={true}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};

// --- COMPONENTE ANILLOS MEJORADO ---
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
        <div className={`config-panel-v2 ${isOpen ? 'is-open' : ''}`}>
            <div className="config-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="header-left">
                    <div className="config-icon-wrapper">
                        <span className={`config-icon-svg ${isOpen ? 'rotating' : ''}`}>⚙️</span>
                    </div>
                    <div className="header-text-group">
                        <span className="config-main-title">Centro de Control</span>
                        <span className="config-sub-title">{isOpen ? 'Ajustes del simulador' : 'Puntos de exploración encontrados'}</span>
                    </div>
                </div>
                <div className="header-right">
                    {!isOpen && (
                        <div className="mini-stats">
                            <span className="stats-val">{percentage}%</span>
                            <div className="stats-dot" style={{ background: percentage === 100 ? '#10b981' : '#f59e0b' }}></div>
                        </div>
                    )}
                    <span className={`chevron-icon ${isOpen ? 'up' : 'down'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                    </span>
                </div>
            </div>

            <div className="exploration-hud">
                <div className="hud-scanner-line"></div>
                <div className="hud-content">
                    <div className="hud-left">
                        <div className="radial-progress-container">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" style={{ strokeDasharray: `${percentage}, 100` }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <span className="hud-percent">{percentage}%</span>
                        </div>
                    </div>
                    <div className="hud-right">
                        <div className="hud-info-row">
                            <span className="hud-label">SISTEMA EXPLORADO</span>
                            <span className="hud-value">{visitedCount} / {totalCount}</span>
                        </div>
                        <div className="hud-status-bar">
                            {[...Array(totalCount)].map((_, i) => (
                                <div key={i} className={`status-dot ${i < visitedCount ? 'found' : ''}`}></div>
                            ))}
                        </div>
                        <div className="hud-footer-actions">
                            <span className="hud-message">
                                {remaining > 0 ? `DETECTADOS: ${remaining} PUNTOS RESTANTES` : 'BASE DE DATOS COMPLETA'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`config-deploy-container ${isOpen ? 'is-open' : ''}`}>
                <div className="config-scroll-area">
                    <div className="config-section">
                        <h4 className="section-title">Navegación</h4>
                        <p className="config-instruction-v2">Selecciona cualquier cuerpo celeste para iniciar el viaje y desplegar sus datos.</p>
                    </div>

                    <div className="config-section">
                        <h4 className="section-title">Simulación Cinética</h4>

                        <div className="ss-config-item">
                            <div className="ss-config-label-row">
                                <span className="ss-label-name">Velocidad Orbital</span>
                                <span className="ss-label-value">x{config.simSpeed.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.1" max="5" step="0.1"
                                value={config.simSpeed}
                                onChange={(e) => setConfig({ ...config, simSpeed: parseFloat(e.target.value) })}
                                className="config-slider-v2"
                            />
                        </div>

                        <div className="ss-config-item">
                            <div className="ss-config-label-row">
                                <span className="ss-label-name">Velocidad Rotación</span>
                                <span className="ss-label-value">x{config.rotationSpeed.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="10" step="0.1"
                                value={config.rotationSpeed}
                                onChange={(e) => setConfig({ ...config, rotationSpeed: parseFloat(e.target.value) })}
                                className="config-slider-v2"
                            />
                        </div>
                    </div>

                    <div className="config-section">
                        <h4 className="section-title">Visualización Avanzada</h4>

                        <div className="ss-config-item">
                            <div className="ss-config-label-row">
                                <span className="ss-label-name">Opacidad Órbitas</span>
                                <span className="ss-label-value">{Math.round(config.orbitOpacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="0.5" step="0.01"
                                value={config.orbitOpacity}
                                onChange={(e) => setConfig({ ...config, orbitOpacity: parseFloat(e.target.value) })}
                                className="config-slider-v2"
                            />
                        </div>

                        <div className="ss-config-item">
                            <div className="ss-config-label-row">
                                <span className="ss-label-name">Grosor Órbitas</span>
                                <span className="ss-label-value">{config.orbitThickness.toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="0.01" max="0.3" step="0.01"
                                value={config.orbitThickness}
                                onChange={(e) => setConfig({ ...config, orbitThickness: parseFloat(e.target.value) })}
                                className="config-slider-v2"
                            />
                        </div>

                        <div className="config-toggles-v2">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={config.showOrbits}
                                    onChange={(e) => setConfig({ ...config, showOrbits: e.target.checked })}
                                />
                                <span className="switch-slider"></span>
                                <span className="switch-label">Mostrar Órbitas</span>
                            </label>

                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={config.showLabels}
                                    onChange={(e) => setConfig({ ...config, showLabels: e.target.checked })}
                                />
                                <span className="switch-slider"></span>
                                <span className="switch-label">Etiquetas de Datos</span>
                            </label>
                        </div>
                    </div>

                    <div className="config-footer">
                        <button className="btn-reset-v2" onClick={onResetProgress}>
                            <span className="btn-icon">🔄</span>
                            Reiniciar exploración
                        </button>
                        <div className="footer-info">
                            <p className="footer-note">Simulador del Sistema Solar v2.0</p>
                            <p className="footer-credits">
                                Texturas obtenidas de <a href="https://www.solarsystemscope.com/" target="_blank" rel="noopener noreferrer">Solar System Scope</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
            moonMeshRef.current.rotation.y += 0.5 * delta * rotationSpeed;
        }

        // Movimiento orbital de la Luna
        // Actualizamos el ángulo basado en delta para mayor fluidez
        if (!isPaused) {
            angleRef.current += (moon.speed * 10) * simSpeed * delta;
        }

        if (moonGroupRef.current) {
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
    const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);
    const angleRef = useRef(initialAngle);

    // Registrar referencia
    useEffect(() => {
        if (registerRef && groupRef.current) {
            registerRef(planet.id, groupRef);
        }
    }, [registerRef, planet.id]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Rotación propia (delta based)
            meshRef.current.rotation.y += 0.5 * delta * rotationSpeed;
        }

        if (planet.distance > 0) {
            if (!isPaused) {
                // Movimiento orbital fluido con delta
                angleRef.current += (planet.speed * 5) * simSpeed * delta;
            }

            if (groupRef.current) {
                groupRef.current.position.x = Math.cos(angleRef.current) * planet.distance;
                groupRef.current.position.z = Math.sin(angleRef.current) * planet.distance;
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

                {/* Capa de Nubes (Hija del mesh para heredar rotación exacta) */}
                {planet.cloudTextureUrl && (
                    <CloudLayer textureUrl={planet.cloudTextureUrl} size={currentSize} />
                )}
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
const OrbitPath = ({ distance, visible, opacity = 0.08, thickness = 0.05 }) => {
    if (distance <= 0 || !visible) return null;
    const halfThickness = thickness / 2;
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[distance - halfThickness, distance + halfThickness, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
    );
};

const CameraController = ({ selectedPlanetId, planetRefs, config, activeHotspot }) => {
    // Refs para vectores reutilizables (Evita Garbage Collection)
    const currentTarget = useRef(new THREE.Vector3(0, 0, 0));
    const vec3_1 = useRef(new THREE.Vector3());
    const vec3_2 = useRef(new THREE.Vector3());
    const vec3_3 = useRef(new THREE.Vector3());

    const rotationTimer = useRef(0);
    const lastInteractionTime = useRef(0);
    const lastDist = useRef(null);

    const isUserInteractingRef = useRef(false);
    const interactionTimeoutRef = useRef(null);
    const eventsInit = useRef(false);

    // Resetear interacción al cambiar de planeta para forzar el movimiento de cámara
    useEffect(() => {
        isUserInteractingRef.current = false;
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    }, [selectedPlanetId]);

    useFrame(({ camera, controls }, delta) => {
        if (!controls) return;

        // Inicializar eventos UNA VEZ (Hack seguro para acceder a la instancia de controles)
        if (!eventsInit.current) {
            controls.addEventListener('start', () => {
                isUserInteractingRef.current = true;
                if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
            });
            controls.addEventListener('end', () => {
                // Dar un tiempo de gracia generoso después de soltar para evitar saltos inmediatos
                interactionTimeoutRef.current = setTimeout(() => {
                    isUserInteractingRef.current = false;
                    // Al terminar la interacción, resincronizamos el timer de rotación 
                    // para que el movimiento automático continúe suavemente desde donde se dejó
                    // en lugar de saltar a una posición calculada
                }, 4000);
            });
            eventsInit.current = true;
        }

        const isUserInteracting = isUserInteractingRef.current;

        if (selectedPlanetId && planetRefs.current[selectedPlanetId]?.current) {
            const planetGroup = planetRefs.current[selectedPlanetId].current;

            // Obtener posición del mundo sin crear nueva instancia
            planetGroup.getWorldPosition(vec3_1.current);
            const targetVec = vec3_1.current;

            // Suavizado del Target (seguimiento) - Más rápido para evitar lag
            currentTarget.current.lerp(targetVec, delta * 8);
            controls.target.copy(currentTarget.current);

            // Parámetros de zoom ideal
            let planetData = solarSystemData.find(p => p.id === selectedPlanetId);
            // Búsqueda en lunas si es necesario... (Optimizable si solarSystemData es plano, pero ok por ahora)
            if (!planetData) {
                // Búsqueda rápida optimizada
                for (let i = 0; i < solarSystemData.length; i++) {
                    const p = solarSystemData[i];
                    if (p.moons) {
                        const moon = p.moons.find(m => m.id === selectedPlanetId);
                        if (moon) { planetData = moon; break; }
                    }
                }
            }

            const size = planetData?.size || 1;
            const baseDist = size * 3.5;
            const zoomFactor = 1 / (config?.zoomLevel || 1);
            const hotspotActive = !!activeHotspot;
            const idealDist = hotspotActive ? baseDist * (activeHotspot.zoom || 0.6) : baseDist * zoomFactor;

            // Animación automática de zoom/rotación
            if (!isUserInteracting || hotspotActive) {
                // Calcular dirección: (camera.position - currentTarget)
                vec3_2.current.subVectors(camera.position, currentTarget.current).normalize();
                const direction = vec3_2.current;

                if (hotspotActive) {
                    rotationTimer.current += delta * 0.3;
                    direction.x = Math.cos(rotationTimer.current);
                    direction.z = Math.sin(rotationTimer.current);
                    direction.y = activeHotspot.tilt || 0.3;
                    direction.normalize();
                } else {
                    // Mantener ángulo actual
                    // No recalculamos rotationTimer constantemente para evitar saltos, 
                    // simplemente usamos la dirección actual
                }

                // Goal Position = Target + Direction * Distance
                vec3_3.current.copy(currentTarget.current).add(direction.multiplyScalar(idealDist));
                const goalPos = vec3_3.current;

                // Mover cámara suavemente
                camera.position.lerp(goalPos, delta * (hotspotActive ? 2.5 : 2.0));
            }

        } else {
            // MODO SISTEMA (Vista general)
            vec3_1.current.set(0, 0, 0); // Target al sol
            currentTarget.current.lerp(vec3_1.current, delta * 4);
            controls.target.copy(currentTarget.current);

            const defaultCamPos = vec3_3.current.set(0, 80, 140);

            if (!isUserInteracting) {
                camera.position.lerp(defaultCamPos, delta * 1);
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

    // Estado inicial desde localStorage
    const [visitedHotspots, setVisitedHotspots] = useState(() => {
        try {
            const saved = localStorage.getItem('solarSystem_visited');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Error reading localStorage", e);
            return {};
        }
    });

    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const planetRefs = useRef({});

    // Guardar progreso automáticamente
    useEffect(() => {
        try {
            localStorage.setItem('solarSystem_visited', JSON.stringify(visitedHotspots));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    }, [visitedHotspots]);

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
        zoomLevel: 1,
        orbitOpacity: 0.15,
        orbitThickness: 0.05
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
                    enableDamping={true}
                    dampingFactor={0.1}
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
                                opacity={config.orbitOpacity}
                                thickness={config.orbitThickness}
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
