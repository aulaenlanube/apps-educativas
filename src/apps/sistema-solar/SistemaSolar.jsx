import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
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
    return <pointLight ref={lightRef} intensity={0.8} distance={60} decay={2} color="#ffffff" />;
}

// --- SUN CORONA GLOW ---
const SunCorona = ({ size }) => {
    const coronaRef = useRef();
    const coronaRef2 = useRef();
    const coronaRef3 = useRef();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (coronaRef.current) {
            coronaRef.current.rotation.z = t * 0.05;
            coronaRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04);
        }
        if (coronaRef2.current) {
            coronaRef2.current.rotation.z = -t * 0.03;
            coronaRef2.current.scale.setScalar(1 + Math.sin(t * 0.5 + 1) * 0.06);
        }
        if (coronaRef3.current) {
            coronaRef3.current.rotation.z = t * 0.02;
            coronaRef3.current.scale.setScalar(1 + Math.sin(t * 1.2 + 2) * 0.03);
        }
    });

    return (
        <group>
            {/* Inner glow */}
            <mesh ref={coronaRef}>
                <sphereGeometry args={[size * 1.15, 64, 64]} />
                <meshBasicMaterial
                    color="#FDB813"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>
            {/* Mid glow */}
            <mesh ref={coronaRef2}>
                <sphereGeometry args={[size * 1.35, 48, 48]} />
                <meshBasicMaterial
                    color="#ff8c00"
                    transparent
                    opacity={0.06}
                    side={THREE.BackSide}
                />
            </mesh>
            {/* Outer halo */}
            <mesh ref={coronaRef3}>
                <sphereGeometry args={[size * 1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#ff4500"
                    transparent
                    opacity={0.025}
                    side={THREE.BackSide}
                />
            </mesh>
            {/* Point light glow effect */}
            <pointLight position={[0, 0, 0]} intensity={3} distance={size * 6} decay={2} color="#FDB813" />
        </group>
    );
};

// --- ATMOSPHERIC GLOW HALO ---
const AtmosphereGlow = ({ size, color, intensity = 0.12 }) => {
    const glowRef = useRef();

    useFrame(({ clock }) => {
        if (glowRef.current) {
            const t = clock.getElapsedTime();
            glowRef.current.scale.setScalar(1 + Math.sin(t * 0.4) * 0.01);
        }
    });

    return (
        <mesh ref={glowRef}>
            <sphereGeometry args={[size * 1.08, 48, 48]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={intensity}
                side={THREE.BackSide}
            />
        </mesh>
    );
};

// --- SHOOTING STARS ---
const ShootingStar = () => {
    const meshRef = useRef();
    const trailRef = useRef();
    const data = useMemo(() => ({
        startPos: new THREE.Vector3(
            (Math.random() - 0.5) * 600,
            (Math.random() - 0.5) * 300 + 100,
            (Math.random() - 0.5) * 600
        ),
        direction: new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            -Math.random() * 1.5 - 0.5,
            (Math.random() - 0.5) * 2
        ).normalize(),
        speed: 80 + Math.random() * 120,
        delay: Math.random() * 15,
        duration: 0.8 + Math.random() * 1.2,
        length: 3 + Math.random() * 5,
    }), []);

    const timeRef = useRef(data.delay);
    const activeRef = useRef(false);

    useFrame((_, delta) => {
        timeRef.current -= delta;

        if (timeRef.current <= 0 && !activeRef.current) {
            activeRef.current = true;
            timeRef.current = data.duration;
            if (meshRef.current) {
                meshRef.current.position.copy(data.startPos);
                meshRef.current.visible = true;
            }
            if (trailRef.current) trailRef.current.visible = true;
        }

        if (activeRef.current) {
            timeRef.current -= delta;
            const progress = 1 - (timeRef.current / data.duration);

            if (meshRef.current) {
                meshRef.current.position.addScaledVector(data.direction, data.speed * delta);
                meshRef.current.material.opacity = Math.max(0, 1 - progress * progress);
            }

            if (trailRef.current) {
                trailRef.current.position.copy(meshRef.current.position);
                trailRef.current.position.addScaledVector(data.direction, -data.length);
                trailRef.current.material.opacity = Math.max(0, 0.4 * (1 - progress));
            }

            if (timeRef.current <= 0) {
                activeRef.current = false;
                timeRef.current = 8 + Math.random() * 20; // Random next appearance
                if (meshRef.current) meshRef.current.visible = false;
                if (trailRef.current) trailRef.current.visible = false;
                // Reset position
                data.startPos.set(
                    (Math.random() - 0.5) * 600,
                    (Math.random() - 0.5) * 300 + 100,
                    (Math.random() - 0.5) * 600
                );
            }
        }
    });

    return (
        <>
            <mesh ref={meshRef} visible={false}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={1} />
            </mesh>
            <mesh ref={trailRef} visible={false}>
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshBasicMaterial color="#aaccff" transparent opacity={0.4} />
            </mesh>
        </>
    );
};

const ShootingStars = () => {
    return (
        <group>
            {[...Array(5)].map((_, i) => (
                <ShootingStar key={i} />
            ))}
        </group>
    );
};

// --- COSMIC DUST (Subtle floating particles) ---
const CosmicDust = () => {
    const pointsRef = useRef();
    const count = 300;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 500;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = clock.getElapsedTime() * 0.003;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#6366f1"
                size={0.3}
                transparent
                opacity={0.25}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

// --- ASTEROID BELT (Instanced for performance) ---
const ASTEROID_COUNT = 600;
const BELT_INNER = 29;
const BELT_OUTER = 38;
const BELT_CENTER = (BELT_INNER + BELT_OUTER) / 2;
const BELT_WIDTH = (BELT_OUTER - BELT_INNER) / 2;

const AsteroidBelt = ({ simSpeed, isPaused, showLabels }) => {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Pre-compute asteroid transforms once
    const asteroidData = useMemo(() => {
        const data = [];
        for (let i = 0; i < ASTEROID_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            // Gaussian-like distribution around center
            const r = BELT_CENTER + (Math.random() - 0.5 + (Math.random() - 0.5)) * BELT_WIDTH;
            const y = (Math.random() - 0.5) * 1.8; // Vertical spread
            const scale = 0.03 + Math.random() * 0.12;
            const rotX = Math.random() * Math.PI * 2;
            const rotY = Math.random() * Math.PI * 2;
            const rotZ = Math.random() * Math.PI * 2;
            // Individual orbit speed variation
            const speedFactor = 0.8 + Math.random() * 0.4;
            data.push({ angle, r, y, scale, rotX, rotY, rotZ, speedFactor });
        }
        return data;
    }, []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const orbitDelta = isPaused ? 0 : delta * simSpeed * 0.3;

        for (let i = 0; i < ASTEROID_COUNT; i++) {
            const a = asteroidData[i];
            if (!isPaused) {
                a.angle += orbitDelta * a.speedFactor * (1 / (a.r * 0.05));
            }
            // Self-rotation
            a.rotX += delta * 0.2;
            a.rotY += delta * 0.15;

            dummy.position.set(
                Math.cos(a.angle) * a.r,
                a.y,
                Math.sin(a.angle) * a.r
            );
            dummy.rotation.set(a.rotX, a.rotY, a.rotZ);
            dummy.scale.setScalar(a.scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[null, null, ASTEROID_COUNT]}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color="#8a7d6b"
                    roughness={0.85}
                    metalness={0.15}
                    emissive="#4a3f30"
                    emissiveIntensity={0.05}
                />
            </instancedMesh>

            {/* Subtle dust glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[BELT_INNER, BELT_OUTER, 128]} />
                <meshBasicMaterial
                    color="#a0906e"
                    transparent
                    opacity={0.015}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {showLabels && (
                <Html position={[0, 3, BELT_CENTER]} center distanceFactor={20} style={{ pointerEvents: 'none' }}>
                    <div className="planet-label asteroid-belt-label">Cinturón de Asteroides</div>
                </Html>
            )}
        </group>
    );
};

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

// --- COMPONENTE NUBES ---
const CloudLayer = ({ textureUrl, size }) => {
    const texture = useTexture(textureUrl);

    return (
        <mesh>
            <sphereGeometry args={[size * 1.015, 64, 64]} />
            <meshStandardMaterial
                map={texture}
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

    useEffect(() => {
        if (ref.current && textureUrl) {
            const geometry = ref.current.geometry;
            const pos = geometry.attributes.position;
            const uv = geometry.attributes.uv;
            const count = pos.count;
            for (let i = 0; i < count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const r = Math.sqrt(x * x + y * y);
                const v = (r - finalInner) / (finalOuter - finalInner);
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

// --- ORBIT GLOW RING ---
const GlowOrbitPath = ({ distance, visible, opacity = 0.08, thickness = 0.05, color = '#4f6bff' }) => {
    if (distance <= 0 || !visible) return null;
    const halfThickness = thickness / 2;
    const glowRef = useRef();

    useFrame(({ clock }) => {
        if (glowRef.current) {
            glowRef.current.material.opacity = opacity * (0.7 + Math.sin(clock.getElapsedTime() * 0.3 + distance) * 0.3);
        }
    });

    return (
        <group>
            {/* Main orbit line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[distance - halfThickness, distance + halfThickness, 256]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={opacity} side={THREE.DoubleSide} />
            </mesh>
            {/* Glow layer */}
            <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[distance - halfThickness * 4, distance + halfThickness * 4, 256]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity * 0.4}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
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
                            <p className="footer-note">Simulador del Sistema Solar v3.0</p>
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

    useEffect(() => {
        if (registerRef && moonGroupRef.current) {
            registerRef(moon.id, moonGroupRef);
        }
    }, [registerRef, moon.id]);

    const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);
    const angleRef = useRef(initialAngle);

    useFrame((state, delta) => {
        if (moonMeshRef.current) {
            moonMeshRef.current.rotation.y += 0.5 * delta * rotationSpeed;
        }

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
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[moon.distance - 0.03, moon.distance + 0.03, 128]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
        </>
    );
};

// --- ATMOSPHERE COLOR MAP ---
const atmosphereColors = {
    sun: null,
    mercury: null,
    venus: '#E3BB76',
    earth: '#4fc3f7',
    mars: '#ff7043',
    jupiter: '#F9CA24',
    saturn: '#F0932B',
    uranus: '#7ED6DF',
    neptune: '#5c6bc0',
};

// --- YOUTUBE VIDEO DATA (Kurzgesagt ES) ---
const planetVideos = {
    sun: { id: 'R89xJYeExPc', title: 'El Sol: nuestra estrella', label: '☀️ El Sol' },
    mercury: { id: 'r0JuWXs7lPA', title: 'Las estrellas más grandes del universo', label: '⭐ Estrellas Gigantes' },
    venus: { id: 'vyyK3om1a10', title: 'Cómo terraformar Venus (rápidamente)', label: '🔥 Terraformar Venus' },
    earth: { id: 'rF7llfSvEmY', title: 'La Luna: nuestro satélite natural', label: '🌙 La Luna' },
    mars: { id: 'u1CZH4OrxBk', title: 'Marte: el planeta rojo', label: '🚀 Marte' },
    jupiter: { id: 'TFhRXnE2xck', title: 'Agujeros negros: los monstruos del universo', label: '🕳️ Agujeros Negros' },
    saturn: { id: 'fD69KtLjjfQ', title: 'Estrellas de neutrones: los astros más extremos', label: '💫 Estrellas de Neutrones' },
    uranus: { id: 'duIDvO_QGBY', title: 'Agujeros de gusano: ¿se puede viajar por el espacio-tiempo?', label: '🌀 Agujeros de Gusano' },
    neptune: { id: '5NBQ2PBiobM', title: 'Cómo construir una Esfera de Dyson', label: '🔆 Esfera de Dyson' },
};

// --- DATOS FÍSICOS REALES ---
const planetStats = {
    sun: {
        diameter: '1.392.700 km', gravity: '274 m/s²', avgTemp: '5.500°C (superficie)',
        rotationPeriod: '~25 días', orbitalPeriod: '—', moonCount: '—',
        distanceFromSun: '—', sizeRatio: 109, gravityRatio: 28,
    },
    mercury: {
        diameter: '4.879 km', gravity: '3,7 m/s²', avgTemp: '167°C (media)',
        rotationPeriod: '59 días', orbitalPeriod: '88 días', moonCount: 0,
        distanceFromSun: '57,9 M km', sizeRatio: 0.38, gravityRatio: 0.38,
    },
    venus: {
        diameter: '12.104 km', gravity: '8,87 m/s²', avgTemp: '464°C',
        rotationPeriod: '243 días', orbitalPeriod: '225 días', moonCount: 0,
        distanceFromSun: '108,2 M km', sizeRatio: 0.95, gravityRatio: 0.91,
    },
    earth: {
        diameter: '12.742 km', gravity: '9,8 m/s²', avgTemp: '15°C',
        rotationPeriod: '23 h 56 min', orbitalPeriod: '365,25 días', moonCount: 1,
        distanceFromSun: '149,6 M km', sizeRatio: 1, gravityRatio: 1,
    },
    mars: {
        diameter: '6.779 km', gravity: '3,71 m/s²', avgTemp: '-65°C',
        rotationPeriod: '24 h 37 min', orbitalPeriod: '687 días', moonCount: 2,
        distanceFromSun: '227,9 M km', sizeRatio: 0.53, gravityRatio: 0.38,
    },
    jupiter: {
        diameter: '139.820 km', gravity: '24,79 m/s²', avgTemp: '-110°C',
        rotationPeriod: '9 h 55 min', orbitalPeriod: '11,86 años', moonCount: 95,
        distanceFromSun: '778,5 M km', sizeRatio: 10.97, gravityRatio: 2.53,
    },
    saturn: {
        diameter: '116.460 km', gravity: '10,44 m/s²', avgTemp: '-140°C',
        rotationPeriod: '10 h 42 min', orbitalPeriod: '29,46 años', moonCount: 146,
        distanceFromSun: '1.434 M km', sizeRatio: 9.14, gravityRatio: 1.07,
    },
    uranus: {
        diameter: '50.724 km', gravity: '8,87 m/s²', avgTemp: '-195°C',
        rotationPeriod: '17 h 14 min', orbitalPeriod: '84 años', moonCount: 28,
        distanceFromSun: '2.871 M km', sizeRatio: 3.98, gravityRatio: 0.91,
    },
    neptune: {
        diameter: '49.244 km', gravity: '11,15 m/s²', avgTemp: '-200°C',
        rotationPeriod: '16 h 06 min', orbitalPeriod: '164,8 años', moonCount: 16,
        distanceFromSun: '4.495 M km', sizeRatio: 3.86, gravityRatio: 1.14,
    },
    moon: {
        diameter: '3.474 km', gravity: '1,62 m/s²', avgTemp: '-23°C (media)',
        rotationPeriod: '27,3 días', orbitalPeriod: '27,3 días', moonCount: '—',
        distanceFromSun: '—', sizeRatio: 0.27, gravityRatio: 0.17,
    },
};

// --- VIDEO STAR HOTSPOT (3D) ---
const VideoStarHotspot = ({ planetId, planetSize, onVideoClick }) => {
    const videoData = planetVideos[planetId];
    if (!videoData) return null;

    // Position the star at an angle above the planet
    const yPos = planetSize * 0.6;
    const xPos = -planetSize * 0.85;

    return (
        <Html position={[xPos, yPos, 0]} center distanceFactor={planetId === 'sun' ? 24 : 8} style={{ pointerEvents: 'auto' }}>
            <button
                className="video-star-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onVideoClick(videoData);
                }}
                title={videoData.title}
            >
                <svg className="video-star-svg" viewBox="0 0 24 24" width="22" height="22">
                    <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill="currentColor"
                    />
                </svg>
                <span className="video-star-pulse-ring"></span>
                <span className="video-star-pulse-ring delay"></span>
            </button>
        </Html>
    );
};

// --- VIDEO MODAL (rendered via Portal to escape Canvas stacking context) ---
const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    // Use Escape key to close
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return createPortal(
        <div className="video-modal-overlay" onClick={onClose}>
            <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="video-modal-header">
                    <div className="video-modal-title-group">
                        <span className="video-modal-badge">Kurzgesagt</span>
                        <h3>{video.title}</h3>
                    </div>
                    <button className="video-modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                <div className="video-modal-player">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    ></iframe>
                </div>
                <div className="video-modal-footer">
                    <span className="video-modal-channel">📺 En Pocas Palabras – Kurzgesagt</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- PLANETA INDIVIDUAL ---
const Planet = ({ planet, isPaused, onClick, registerRef, simSpeed, rotationSpeed, showLabels, isSelected, onHotspotClick, visitedHotspots, activeHotspots, onVideoClick }) => {
    const groupRef = useRef();
    const meshRef = useRef();

    const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);
    const angleRef = useRef(initialAngle);

    useEffect(() => {
        if (registerRef && groupRef.current) {
            registerRef(planet.id, groupRef);
        }
    }, [registerRef, planet.id]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.5 * delta * rotationSpeed;
        }

        if (planet.distance > 0) {
            if (!isPaused) {
                angleRef.current += (planet.speed * 5) * simSpeed * delta;
            }

            if (groupRef.current) {
                groupRef.current.position.x = Math.cos(angleRef.current) * planet.distance;
                groupRef.current.position.z = Math.sin(angleRef.current) * planet.distance;
            }
        }
    });

    const currentSize = planet.size;
    const atmosphereColor = atmosphereColors[planet.id];

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

                {planet.cloudTextureUrl && (
                    <CloudLayer textureUrl={planet.cloudTextureUrl} size={currentSize} />
                )}
            </mesh>

            {/* Sun Corona */}
            {planet.id === 'sun' && <SunCorona size={currentSize} />}

            {/* Atmospheric glow for planets with atmosphere */}
            {atmosphereColor && (
                <AtmosphereGlow
                    size={currentSize}
                    color={atmosphereColor}
                    intensity={planet.id === 'earth' ? 0.18 : 0.1}
                />
            )}

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

            {/* Video Star Hotspot */}
            <VideoStarHotspot planetId={planet.id} planetSize={currentSize} onVideoClick={onVideoClick} />

            {planet.moons && planet.moons.map((moon) => (
                <Moon
                    key={moon.id}
                    moon={moon}
                    simSpeed={simSpeed}
                    rotationSpeed={rotationSpeed}
                    onClick={onClick}
                    registerRef={registerRef}
                    isPaused={isPaused}
                    isSelected={isSelected}
                    onHotspotClick={onHotspotClick}
                    visitedHotspots={visitedHotspots}
                    activeHotspots={activeHotspots}
                />
            ))}
        </group>
    );
};

const CameraController = ({ selectedPlanetId, planetRefs, config, activeHotspot }) => {
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

    useEffect(() => {
        isUserInteractingRef.current = false;
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    }, [selectedPlanetId]);

    useFrame(({ camera, controls }, delta) => {
        if (!controls) return;

        if (!eventsInit.current) {
            controls.addEventListener('start', () => {
                isUserInteractingRef.current = true;
                if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
            });
            controls.addEventListener('end', () => {
                interactionTimeoutRef.current = setTimeout(() => {
                    isUserInteractingRef.current = false;
                }, 4000);
            });
            eventsInit.current = true;
        }

        const isUserInteracting = isUserInteractingRef.current;

        if (selectedPlanetId && planetRefs.current[selectedPlanetId]?.current) {
            const planetGroup = planetRefs.current[selectedPlanetId].current;

            planetGroup.getWorldPosition(vec3_1.current);
            const targetVec = vec3_1.current;

            currentTarget.current.lerp(targetVec, delta * 8);
            controls.target.copy(currentTarget.current);

            let planetData = solarSystemData.find(p => p.id === selectedPlanetId);
            if (!planetData) {
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

            if (!isUserInteracting || hotspotActive) {
                vec3_2.current.subVectors(camera.position, currentTarget.current).normalize();
                const direction = vec3_2.current;

                if (hotspotActive) {
                    rotationTimer.current += delta * 0.3;
                    direction.x = Math.cos(rotationTimer.current);
                    direction.z = Math.sin(rotationTimer.current);
                    direction.y = activeHotspot.tilt || 0.3;
                    direction.normalize();
                }

                vec3_3.current.copy(currentTarget.current).add(direction.multiplyScalar(idealDist));
                const goalPos = vec3_3.current;

                camera.position.lerp(goalPos, delta * (hotspotActive ? 2.5 : 2.0));
            }

        } else {
            vec3_1.current.set(0, 0, 0);
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

// --- INFO PANEL ---
const InfoPanel = ({ planet, level, grade, onClose }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    if (!planet) return null;

    const description = getDescription(planet, level, grade);
    const stats = planetStats[planet.id];

    // Compute comparison bar widths (capped at 100% for visual clarity)
    const sizeBarWidth = stats ? Math.min((stats.sizeRatio / 11) * 100, 100) : 0;
    const gravityBarWidth = stats ? Math.min((stats.gravityRatio / 3) * 100, 100) : 0;

    return (
        <div className={`info-panel-overlay ${showAdvanced ? 'expanded' : ''}`}>
            <div className="info-panel-glow-border"></div>
            <div className="info-panel-card">
                <div className="panel-header">
                    <div className="panel-header-left">
                        <div className="planet-color-indicator" style={{ background: planet.color, boxShadow: `0 0 20px ${planet.color}` }}></div>
                        <h2 style={{ color: planet.color }}>{planet.name}</h2>
                    </div>
                    <button className="btn-exit-planet" onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        Salir
                    </button>
                </div>

                <div className="planet-details">
                    <p className="main-desc">{description}</p>

                    {/* --- FICHA TÉCNICA --- */}
                    {stats && (
                        <div className="tech-card">
                            <h4 className="tech-card-title">
                                <span>📊</span> Ficha Técnica
                            </h4>
                            <div className="tech-stats-grid">
                                <div className="tech-stat-cell">
                                    <span className="tech-icon">📏</span>
                                    <span className="tech-label">Diámetro</span>
                                    <span className="tech-value">{stats.diameter}</span>
                                </div>
                                <div className="tech-stat-cell">
                                    <span className="tech-icon">⚖️</span>
                                    <span className="tech-label">Gravedad</span>
                                    <span className="tech-value">{stats.gravity}</span>
                                </div>
                                <div className="tech-stat-cell">
                                    <span className="tech-icon">🌡️</span>
                                    <span className="tech-label">Temperatura</span>
                                    <span className="tech-value">{stats.avgTemp}</span>
                                </div>
                                <div className="tech-stat-cell">
                                    <span className="tech-icon">🔄</span>
                                    <span className="tech-label">Rotación</span>
                                    <span className="tech-value">{stats.rotationPeriod}</span>
                                </div>
                                <div className="tech-stat-cell">
                                    <span className="tech-icon">🪐</span>
                                    <span className="tech-label">Órbita</span>
                                    <span className="tech-value">{stats.orbitalPeriod}</span>
                                </div>
                                <div className="tech-stat-cell">
                                    <span className="tech-icon">🛰️</span>
                                    <span className="tech-label">Satélites</span>
                                    <span className="tech-value">{stats.moonCount}</span>
                                </div>
                            </div>

                            {stats.distanceFromSun !== '—' && (
                                <div className="tech-distance-row">
                                    <span className="tech-icon">☀️</span>
                                    <span className="tech-label">Distancia al Sol</span>
                                    <span className="tech-value">{stats.distanceFromSun}</span>
                                </div>
                            )}

                            {/* Visual comparisons */}
                            {planet.id !== 'sun' && planet.id !== 'moon' && (
                                <div className="tech-comparisons">
                                    <div className="tech-comparison-row">
                                        <span className="comparison-label">Tamaño vs 🌍</span>
                                        <div className="comparison-track">
                                            <div className="comparison-fill" style={{ width: `${sizeBarWidth}%`, background: planet.color }}></div>
                                            <div className="comparison-earth-mark" style={{ left: `${Math.min((1 / 11) * 100, 100)}%` }}></div>
                                        </div>
                                        <span className="comparison-ratio">×{stats.sizeRatio}</span>
                                    </div>
                                    <div className="tech-comparison-row">
                                        <span className="comparison-label">Gravedad vs 🌍</span>
                                        <div className="comparison-track">
                                            <div className="comparison-fill" style={{ width: `${gravityBarWidth}%`, background: planet.color, opacity: 0.7 }}></div>
                                            <div className="comparison-earth-mark" style={{ left: `${Math.min((1 / 3) * 100, 100)}%` }}></div>
                                        </div>
                                        <span className="comparison-ratio">×{stats.gravityRatio}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        className={`btn-advanced-toggle ${showAdvanced ? 'active' : ''}`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <span className="btn-advanced-icon">{showAdvanced ? '🔼' : '🧪'}</span>
                        {showAdvanced ? 'Menos Información' : 'Composición y Datos'}
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

// --- PLANET NAV BAR ---
const PlanetNavBar = ({ planets, selectedPlanet, onSelect }) => {
    return (
        <div className="planet-nav-bar">
            {planets.map((planet) => (
                <button
                    key={planet.id}
                    className={`planet-nav-item ${selectedPlanet?.id === planet.id ? 'active' : ''}`}
                    onClick={() => onSelect(planet)}
                    title={planet.name}
                >
                    <div className="planet-nav-dot" style={{
                        background: planet.color,
                        boxShadow: selectedPlanet?.id === planet.id ? `0 0 15px ${planet.color}, 0 0 30px ${planet.color}40` : `0 0 6px ${planet.color}60`
                    }}></div>
                    <span className="planet-nav-name">{planet.name}</span>
                </button>
            ))}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const SistemaSolar = ({ level, grade }) => {
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [activeHotspots, setActiveHotspots] = useState({});
    const [lastClickedHotspot, setLastClickedHotspot] = useState(null);
    const [introVisible, setIntroVisible] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

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

    // Dismiss intro
    useEffect(() => {
        const timer = setTimeout(() => setIntroVisible(false), 3500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('solarSystem_visited', JSON.stringify(visitedHotspots));
        } catch (e) {
            console.error("Error saving to localStorage", e);
        }
    }, [visitedHotspots]);

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

    const [config, setConfig] = useState({
        simSpeed: 0.5,
        rotationSpeed: 0.5,
        showOrbits: true,
        showLabels: true,
        zoomLevel: 1,
        orbitOpacity: 0.15,
        orbitThickness: 0.05
    });

    const handleVideoClick = useCallback((videoData) => {
        setActiveVideo(videoData);
    }, []);

    const handlePlanetClick = useCallback((planet) => {
        if (selectedPlanet?.id !== planet.id) {
            setSelectedPlanet(planet);
            setActiveHotspots({});
            setLastClickedHotspot(null);
        }
    }, [selectedPlanet?.id]);

    const handleHotspotClick = useCallback((data, hotspotId) => {
        setActiveHotspots(prev => ({
            ...prev,
            [hotspotId]: data
        }));
        setLastClickedHotspot(data);
        setVisitedHotspots(prev => ({
            ...prev,
            [hotspotId]: true
        }));
    }, []);

    const handleResetProgress = () => {
        setShowResetModal(true);
    };

    const confirmReset = () => {
        setShowResetModal(false);
        setIsResetting(true);

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

    const registerPlanetRef = useCallback((id, ref) => {
        planetRefs.current[id] = ref;
    }, []);

    const visitedCount = Object.keys(visitedHotspots).length;

    // Orbit glow colors for each planet
    const orbitColors = {
        mercury: '#9e9e9e',
        venus: '#e6a85c',
        earth: '#4fc3f7',
        mars: '#ff7043',
        jupiter: '#ffd54f',
        saturn: '#ffb74d',
        uranus: '#80deea',
        neptune: '#7986cb'
    };

    const isVideoOpen = !!activeVideo;

    return (
        <div className={`sistema-solar-container ${isVideoOpen ? 'video-active' : ''}`}>
            {/* Cinematic intro overlay */}
            <div className={`intro-overlay ${introVisible ? 'visible' : ''}`}>
                <div className="intro-content">
                    <div className="intro-icon">🌌</div>
                    <h1 className="intro-title">Sistema Solar 3D</h1>
                    <p className="intro-subtitle">Explora el universo</p>
                    <div className="intro-loading-bar">
                        <div className="intro-loading-fill"></div>
                    </div>
                </div>
            </div>



            <ConfigPanel
                config={config}
                setConfig={setConfig}
                onResetProgress={handleResetProgress}
                visitedCount={visitedCount}
                totalCount={totalHotspots}
            />

            <Canvas camera={{ position: [0, 80, 140], fov: 50, far: 2000 }} shadows frameloop={isVideoOpen ? 'never' : 'always'}>
                <color attach="background" args={['#020205']} />

                <ambientLight intensity={0.4} />
                <pointLight position={[0, 0, 0]} intensity={1.5} distance={1000} decay={0} color="#FDB813" />
                <CameraLight />
                <Stars radius={350} depth={100} count={10000} factor={6} saturation={0} fade speed={0.8} />
                <CosmicDust />
                <ShootingStars />

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
                                onVideoClick={handleVideoClick}
                            />
                            <GlowOrbitPath
                                distance={planet.distance}
                                visible={config.showOrbits}
                                opacity={config.orbitOpacity}
                                thickness={config.orbitThickness}
                                color={orbitColors[planet.id] || '#4f6bff'}
                            />
                        </React.Fragment>
                    ))}

                    {/* Asteroid Belt between Mars and Jupiter */}
                    <AsteroidBelt
                        simSpeed={config.simSpeed}
                        isPaused={!!selectedPlanet}
                        showLabels={config.showLabels}
                    />
                </React.Suspense>
            </Canvas>

            <InfoPanel
                planet={selectedPlanet}
                level={level}
                grade={grade}
                onClose={handleClose}
            />

            <PlanetNavBar
                planets={solarSystemData}
                selectedPlanet={selectedPlanet}
                onSelect={handlePlanetClick}
            />

            <ResetModal
                isOpen={showResetModal}
                onConfirm={confirmReset}
                onCancel={() => setShowResetModal(false)}
            />

            <VideoModal
                video={activeVideo}
                onClose={() => setActiveVideo(null)}
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
