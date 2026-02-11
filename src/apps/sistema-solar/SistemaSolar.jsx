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
    sun: { id: 'oHg5SJYRHA0', title: '¿Las tormentas solares pueden destruir la civilización?', label: '☀️ Tormentas Solares' },
    mercury: { id: 'Ict4WE9Vq_E', title: 'La sustancia más peligrosa del universo: estrellas extrañas', label: '⭐ Estrellas Extrañas' },
    venus: { id: 'vyyK3om1a10', title: 'Cómo terraformar Venus (rápidamente)', label: '🔥 Terraformar Venus' },
    earth: { id: 'R9o6B-2u-aA', title: '¿Puede la humanidad detener un asteroide que mata planetas?', label: '☄️ Asteroides' },
    mars: { id: 'k_B0S0T-H4Q', title: 'Construir una base en Marte es una idea horrible: ¡hagámoslo!', label: '🚀 Base en Marte' },
    jupiter: { id: 'MXyqfK260Bw', title: 'Bombas de agujeros negros y civilizaciones de agujeros negros', label: '🕳️ Agujeros Negros' },
    saturn: { id: 'fD69KtLjjfQ', title: 'Estrellas de neutrones: los astros más extremos', label: '💫 Estrellas de Neutrones' },
    uranus: { id: 'EhAemz1v7dQ', title: 'La fusión nuclear: la energía del futuro', label: '⚡ Fusión Nuclear' },
    neptune: { id: 'k_gWq_o5x_o', title: '¿Qué pasaría si la Luna se precipitara sobre la Tierra?', label: '🌙 La Luna cae' },
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
                    <div className="extra-stats">
                        <div className="stat-item">
                            <span className="stat-label">Tipo</span>
                            <span className="stat-value">{planet.type === 'star' ? '⭐ Estrella' : '🪐 Planeta'}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Distancia al Sol</span>
                            <span className="stat-value">{planet.distance === 0 ? '0' : Math.round(planet.distance * 10)} M.km</span>
                        </div>
                    </div>

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
