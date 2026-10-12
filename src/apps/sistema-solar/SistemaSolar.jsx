import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import AppOrientationWarning from '../_shared/AppOrientationWarning';
import InstructionsModal from '../_shared/InstructionsModal';
import {
    Check, X, HelpCircle, ChevronDown, ChevronUp, Compass, Gauge, Eye, Puzzle, RotateCcw, Ruler,
    ArrowDownToLine, Thermometer, RotateCw, Orbit, Satellite, Sun, FlaskConical, Globe2, Lightbulb,
    BarChart3, AlertTriangle, PlayCircle, Settings2,
} from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { GameShell, GameButton, useAppMeta, cleanAppName } from '../_shared/kit';
import { solarSystemData } from './model/solarSystemData';
import SolarSystemActivity, { PlanetOrb } from './SolarSystemActivity';
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
                    <div className="ss-label ss-label--belt">Cinturón de Asteroides</div>
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
        <Html position={position} center className="ss-hotspot-wrap">
            <div className={`ss-hotspot ${isVisited ? 'is-visited' : ''} ${isActive ? 'is-active' : ''}`}>
                <button
                    type="button"
                    className="ss-hotspot__dot"
                    aria-label={title}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick({ title, desc });
                    }}
                >
                    {isVisited ? <Check size={10} strokeWidth={4} /> : <span className="ss-hotspot__pulse"></span>}
                </button>
                {isActive && (
                    <div className="ss-hotspot__card">
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
const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

// Deslizador con relleno (solo presentación: mismo input y mismo onChange)
const RangeField = ({ label, display, min, max, step, value, onChange }) => (
    <label className="ss-range">
        <span className="ss-range__row">
            <span className="ss-range__label">{label}</span>
            <span className="ss-range__value">{display}</span>
        </span>
        <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={onChange}
            style={{ '--p': `${((value - min) / (max - min)) * 100}%` }}
        />
    </label>
);

const ConfigPanel = ({ config, setConfig, onResetProgress, visitedCount, totalCount, onLaunchActivity, onHelp }) => {
    const [isOpen, setIsOpen] = useState(false);
    const meta = useAppMeta();
    const remaining = totalCount - visitedCount;
    const percentage = Math.round((visitedCount / totalCount) * 100);

    return (
        <section className={`ss-control ${isOpen ? 'is-open' : ''}`} aria-label="Centro de control">
            <div className="ss-control__head">
                <button type="button" className="ss-control__toggle" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
                    {meta.appId && hasAppIcon(meta.appId) ? (
                        <span className="ss-control__icon"><AppIcon appId={meta.appId} size={40} /></span>
                    ) : (
                        <span className="ss-control__icon ss-control__icon--gear"><Settings2 size={20} /></span>
                    )}
                    <span className="ss-control__titles">
                        <strong>{cleanAppName(meta.name) || 'Sistema Solar 3D'}</strong>
                        <span>{isOpen ? 'Ajustes del simulador' : 'Centro de control'}</span>
                    </span>
                    {!isOpen && (
                        <span className={`ss-control__pct ${percentage === 100 ? 'is-full' : ''}`}>{percentage}%</span>
                    )}
                    <span className={`ss-control__chev ${isOpen ? 'is-up' : ''}`}><ChevronDown size={18} /></span>
                </button>
                <button type="button" className="gk-iconbtn" onClick={onHelp} title="Cómo se juega" aria-label="Cómo se juega">
                    <HelpCircle size={18} />
                </button>
            </div>

            <div className="ss-hud">
                <div className="ss-hud__ring">
                    <svg viewBox="0 0 36 36" aria-hidden="true">
                        <path className="ss-hud__track" d={RING_PATH} />
                        <path className="ss-hud__arc" style={{ strokeDasharray: `${percentage}, 100` }} d={RING_PATH} />
                    </svg>
                    <span>{percentage}%</span>
                </div>
                <div className="ss-hud__info">
                    <div className="ss-hud__row">
                        <span className="ss-hud__label">Sistema explorado</span>
                        <span className="ss-hud__value">{visitedCount}<small>/{totalCount}</small></span>
                    </div>
                    <div className="ss-hud__dots" aria-hidden="true">
                        {[...Array(totalCount)].map((_, i) => (
                            <i key={i} className={i < visitedCount ? 'is-found' : ''}></i>
                        ))}
                    </div>
                    <span className={`ss-hud__msg ${remaining > 0 ? '' : 'is-done'}`}>
                        {remaining > 0 ? `${remaining} puntos de interés por descubrir` : '¡Base de datos completa!'}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="ss-control__deploy">
                    <div className="ss-sec">
                        <h4 className="ss-sec__title"><Compass size={14} /> Navegación</h4>
                        <p className="ss-sec__text">Selecciona cualquier cuerpo celeste para iniciar el viaje y desplegar sus datos.</p>
                        <GameButton variant="warning" icon={Puzzle} onClick={onLaunchActivity} className="ss-sec__cta">
                            Desafío de planetas
                        </GameButton>
                    </div>

                    <div className="ss-sec">
                        <h4 className="ss-sec__title"><Gauge size={14} /> Simulación cinética</h4>
                        <RangeField
                            label="Velocidad orbital"
                            display={`x${config.simSpeed.toFixed(1)}`}
                            min={0.1} max={5} step={0.1}
                            value={config.simSpeed}
                            onChange={(e) => setConfig({ ...config, simSpeed: parseFloat(e.target.value) })}
                        />
                        <RangeField
                            label="Velocidad de rotación"
                            display={`x${config.rotationSpeed.toFixed(1)}`}
                            min={0} max={10} step={0.1}
                            value={config.rotationSpeed}
                            onChange={(e) => setConfig({ ...config, rotationSpeed: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="ss-sec">
                        <h4 className="ss-sec__title"><Eye size={14} /> Visualización avanzada</h4>
                        <RangeField
                            label="Opacidad de las órbitas"
                            display={`${Math.round(config.orbitOpacity * 100)}%`}
                            min={0} max={0.5} step={0.01}
                            value={config.orbitOpacity}
                            onChange={(e) => setConfig({ ...config, orbitOpacity: parseFloat(e.target.value) })}
                        />
                        <RangeField
                            label="Grosor de las órbitas"
                            display={config.orbitThickness.toFixed(2)}
                            min={0.01} max={0.3} step={0.01}
                            value={config.orbitThickness}
                            onChange={(e) => setConfig({ ...config, orbitThickness: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="ss-sec ss-sec--foot">
                        <GameButton variant="soft" size="sm" icon={RotateCcw} onClick={onResetProgress} className="ss-reset">
                            Reiniciar exploración
                        </GameButton>
                        <p className="ss-credits">
                            Simulador del Sistema Solar v3.0 · Texturas de{' '}
                            <a href="https://www.solarsystemscope.com/" target="_blank" rel="noopener noreferrer">Solar System Scope</a>
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};

// --- COMPONENTE LUNA ---
const Moon = ({ moon, simSpeed, rotationSpeed, onClick, registerRef, isPaused, isSelected, onHotspotClick, visitedHotspots, activeHotspots, onVideoClick }) => {
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

                {/* Video Star Hotspot for Moon */}
                <VideoStarHotspot planetId={moon.id} planetSize={moon.size} onVideoClick={onVideoClick} />
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
    mars: { id: 'u1CZH4OrxBk', title: 'Marte: el planeta rojo', label: '🚀 Marte' },
    jupiter: { id: 'TFhRXnE2xck', title: 'Agujeros negros: los monstruos del universo', label: '🕳️ Agujeros Negros' },
    saturn: { id: 'fD69KtLjjfQ', title: 'Estrellas de neutrones: los astros más extremos', label: '💫 Estrellas de Neutrones' },
    uranus: { id: 'duIDvO_QGBY', title: 'Agujeros de gusano: ¿se puede viajar por el espacio-tiempo?', label: '🌀 Agujeros de Gusano' },
    neptune: { id: '5NBQ2PBiobM', title: 'Cómo construir una Esfera de Dyson', label: '🔆 Esfera de Dyson' },
    moon: { id: 'rF7llfSvEmY', title: 'La Luna: nuestro satélite natural', label: '🌙 La Luna' },
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
                type="button"
                className="ss-star"
                onClick={(e) => {
                    e.stopPropagation();
                    onVideoClick(videoData);
                }}
                title={videoData.title}
                aria-label={`Ver vídeo: ${videoData.title}`}
            >
                <svg className="ss-star__svg" viewBox="0 0 24 24" width="22" height="22">
                    <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill="currentColor"
                    />
                </svg>
                <span className="ss-star__ring"></span>
                <span className="ss-star__ring is-delay"></span>
            </button>
        </Html>
    );
};

// --- VIDEO MODAL (rendered via Portal to escape Canvas stacking context) ---
const VideoModal = ({ video, onClose }) => {
    // Escape para cerrar (el hook va antes del return condicional: reglas de hooks)
    useEffect(() => {
        if (!video) return undefined;
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [video, onClose]);

    if (!video) return null;

    return createPortal(
        <div className="ss-video" onClick={onClose}>
            <div className="ss-video__card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={video.title}>
                <div className="ss-video__head">
                    <span className="ss-video__badge"><PlayCircle size={14} /> Kurzgesagt</span>
                    <h3>{video.title}</h3>
                    <button type="button" className="ss-video__close" onClick={onClose} aria-label="Cerrar vídeo">
                        <X size={20} />
                    </button>
                </div>
                <div className="ss-video__player">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    ></iframe>
                </div>
                <div className="ss-video__foot">En Pocas Palabras – Kurzgesagt</div>
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
                    <div className="ss-label" style={{ opacity: isPaused ? 0.5 : 1, '--pc': planet.color }}>{planet.name}</div>
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
                    onVideoClick={onVideoClick}
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
            const idealDist = baseDist * zoomFactor;

            if (!isUserInteracting) {
                vec3_2.current.subVectors(camera.position, currentTarget.current).normalize();
                const direction = vec3_2.current;

                vec3_3.current.copy(currentTarget.current).add(direction.multiplyScalar(idealDist));
                const goalPos = vec3_3.current;

                camera.position.lerp(goalPos, delta * 2.0);
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
const STAT_ITEMS = [
    { key: 'diameter', label: 'Diámetro', Icon: Ruler },
    { key: 'gravity', label: 'Gravedad', Icon: ArrowDownToLine },
    { key: 'avgTemp', label: 'Temperatura', Icon: Thermometer },
    { key: 'rotationPeriod', label: 'Rotación', Icon: RotateCw },
    { key: 'orbitalPeriod', label: 'Órbita', Icon: Orbit },
    { key: 'moonCount', label: 'Satélites', Icon: Satellite },
];
const BODY_KIND = { star: 'Estrella', planet: 'Planeta' };

const CompareRow = ({ label, ratio, fill, mark, color, dim }) => (
    <div className="ss-compare__row">
        <span className="ss-compare__label">{label} <small>vs Tierra</small></span>
        <span className="ss-compare__track">
            <span className="ss-compare__fill" style={{ transform: `scaleX(${fill / 100})`, background: color, opacity: dim ? 0.75 : 1 }} />
            <span className="ss-compare__mark" style={{ left: `${mark}%` }} title="Tierra" />
        </span>
        <span className="ss-compare__ratio">×{ratio}</span>
    </div>
);

const InfoPanel = ({ planet, level, grade, onClose }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    if (!planet) return null;

    const description = getDescription(planet, level, grade);
    const stats = planetStats[planet.id];

    // Compute comparison bar widths (capped at 100% for visual clarity)
    const sizeBarWidth = stats ? Math.min((stats.sizeRatio / 11) * 100, 100) : 0;
    const gravityBarWidth = stats ? Math.min((stats.gravityRatio / 3) * 100, 100) : 0;

    return (
        <aside className={`ss-info ${showAdvanced ? 'is-expanded' : ''}`} style={{ '--pc': planet.color }} aria-label={`Ficha: ${planet.name}`}>
            <div className="ss-info__head">
                <PlanetOrb id={planet.id} color={planet.color} size={58} />
                <div className="ss-info__titles">
                    <span className="ss-info__kind">{BODY_KIND[planet.type] || 'Satélite'}</span>
                    <h2>{planet.name}</h2>
                </div>
                <button type="button" className="ss-exit" onClick={onClose}>
                    <X size={15} strokeWidth={3} /> Salir
                </button>
            </div>

            <div className="ss-info__body">
                <p className="ss-info__desc">{description}</p>

                {/* --- FICHA TÉCNICA --- */}
                {stats && (
                    <section className="ss-tech">
                        <h4 className="ss-sec__title"><BarChart3 size={14} /> Ficha técnica</h4>
                        <div className="ss-tech__grid">
                            {STAT_ITEMS.map(({ key, label, Icon }) => (
                                <div key={key} className="ss-tech__cell">
                                    <span className="ss-tech__icon"><Icon size={14} /></span>
                                    <span className="ss-tech__label">{label}</span>
                                    <span className="ss-tech__value">{stats[key]}</span>
                                </div>
                            ))}
                        </div>

                        {stats.distanceFromSun !== '—' && (
                            <div className="ss-tech__row">
                                <span className="ss-tech__icon"><Sun size={14} /></span>
                                <span className="ss-tech__label">Distancia al Sol</span>
                                <span className="ss-tech__value">{stats.distanceFromSun}</span>
                            </div>
                        )}

                        {planet.id !== 'sun' && planet.id !== 'moon' && (
                            <div className="ss-compare">
                                <CompareRow label="Tamaño" ratio={stats.sizeRatio} fill={sizeBarWidth} mark={Math.min((1 / 11) * 100, 100)} color={planet.color} />
                                <CompareRow label="Gravedad" ratio={stats.gravityRatio} fill={gravityBarWidth} mark={Math.min((1 / 3) * 100, 100)} color={planet.color} dim />
                            </div>
                        )}
                    </section>
                )}

                <button
                    type="button"
                    className={`ss-more ${showAdvanced ? 'is-on' : ''}`}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? <ChevronUp size={17} /> : <FlaskConical size={17} />}
                    {showAdvanced ? 'Menos información' : 'Composición y datos'}
                </button>

                {showAdvanced && planet.advanced && (
                    <div className="ss-adv">
                        <section className="ss-adv__block">
                            <h4><FlaskConical size={14} /> Composición química</h4>
                            <div className="ss-adv__chips">
                                <span className="ss-adv__k">Elementos</span>
                                {planet.advanced.composition.elements.map((e) => <span key={e} className="ss-chip">{e}</span>)}
                            </div>
                            <div className="ss-adv__chips">
                                <span className="ss-adv__k">Compuestos</span>
                                {planet.advanced.composition.compounds.map((c) => <span key={c} className="ss-chip">{c}</span>)}
                            </div>
                        </section>
                        <section className="ss-adv__block">
                            <h4><Globe2 size={14} /> Geografía y estructura</h4>
                            <p>{planet.advanced.geography}</p>
                        </section>
                        <section className="ss-adv__block">
                            <h4><Lightbulb size={14} /> Curiosidades técnicas</h4>
                            <ul>
                                {planet.advanced.curiosities.map((c, i) => (
                                    <li key={i}>{c}</li>
                                ))}
                            </ul>
                        </section>
                    </div>
                )}
            </div>
        </aside>
    );
};

// --- COMPONENTE MODAL DE REINICIO ---
const ResetModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="ss-confirm" role="dialog" aria-modal="true" aria-label="Reiniciar exploración">
            <div className="ss-confirm__card">
                <span className="ss-confirm__icon"><AlertTriangle size={26} /></span>
                <h3>¿Reiniciar la exploración?</h3>
                <p>Se borrarán todos tus puntos de interés visitados y volverás al estado inicial del sistema.</p>
                <div className="ss-confirm__actions">
                    <GameButton variant="soft" onClick={onCancel}>Cancelar</GameButton>
                    <GameButton variant="danger" icon={RotateCcw} onClick={onConfirm}>Confirmar reinicio</GameButton>
                </div>
            </div>
        </div>
    );
};

// --- PLANET NAV BAR ---
const PlanetNavBar = ({ planets, selectedPlanet, onSelect }) => {
    return (
        <nav className="ss-nav" aria-label="Cuerpos celestes">
            {planets.map((planet) => {
                const active = selectedPlanet?.id === planet.id;
                return (
                    <button
                        type="button"
                        key={planet.id}
                        className={`ss-nav__item ${active ? 'is-active' : ''}`}
                        onClick={() => onSelect(planet)}
                        title={planet.name}
                        aria-pressed={active}
                        style={{ '--pc': planet.color }}
                    >
                        <PlanetOrb id={planet.id} color={planet.color} size={24} />
                        <span className="ss-nav__name">{planet.name}</span>
                    </button>
                );
            })}
        </nav>
    );
};

// --- COMPONENTE PRINCIPAL ---
const SistemaSolar = ({ level, grade }) => {
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [activeHotspots, setActiveHotspots] = useState({});
    const [lastClickedHotspot, setLastClickedHotspot] = useState(null);
    const [introVisible, setIntroVisible] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    const [showActivity, setShowActivity] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

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
        <GameShell
            theme="dark"
            wide
            accent="#818cf8"
            accent2="#fbbf24"
            className={`ss-shell ${isVideoOpen ? 'is-video' : ''} ${introVisible ? 'is-intro' : ''}`}
        >
            <AppOrientationWarning />
            {/* Intro cinematográfica */}
            <div className={`ss-intro ${introVisible ? 'is-visible' : ''}`} aria-hidden={!introVisible}>
                <div className="ss-intro__content">
                    <span className="ss-intro__halo" aria-hidden="true" />
                    <span className="ss-intro__icon"><AppIcon appId="sistema-solar" size={120} /></span>
                    <h1 className="ss-intro__title">Sistema Solar 3D</h1>
                    <p className="ss-intro__subtitle">Explora el universo</p>
                    <div className="ss-intro__bar">
                        <div className="ss-intro__fill"></div>
                    </div>
                </div>
            </div>

            <ConfigPanel
                config={config}
                setConfig={setConfig}
                onResetProgress={handleResetProgress}
                visitedCount={visitedCount}
                totalCount={totalHotspots}
                onLaunchActivity={() => setShowActivity(true)}
                onHelp={() => setShowHelp(true)}
            />

            {showActivity && <SolarSystemActivity onClose={() => setShowActivity(false)} />}

            {/* Escena 3D en su propio contexto de apilado: las etiquetas <Html> de drei
                no pueden pintarse por encima de los paneles de la interfaz */}
            <div className="ss-scene">
            <Canvas camera={{ position: [0, 80, 140], fov: 50, far: 2000 }} shadows frameloop={(isVideoOpen || showActivity) ? 'never' : 'always'}>
                {!showActivity && (
                    <>
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
                    </>
                )}
                {showActivity && <color attach="background" args={['#010103']} />}
            </Canvas>
            </div>

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

            <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Cómo explorar el Sistema Solar">
                <h3>🌌 Objetivo</h3>
                <p>
                    Viaja por el <strong>Sistema Solar en 3D</strong>: descubre cada planeta, su ficha técnica y
                    todos sus <strong>puntos de interés</strong>.
                </p>
                <h3>🕹️ Cómo se explora</h3>
                <ul>
                    <li>Toca un planeta en la escena o en la <strong>barra inferior</strong> para viajar hasta él y abrir su ficha.</li>
                    <li>Los <strong>puntos dorados</strong> sobre el planeta son puntos de interés: tócalos para leerlos (cuentan en tu progreso).</li>
                    <li>La <strong>estrella</strong> junto al planeta abre un vídeo de divulgación.</li>
                    <li>Arrastra para girar la cámara y usa la rueda del ratón para el zoom.</li>
                </ul>
                <h3>🧭 Centro de control</h3>
                <p>
                    Arriba a la derecha verás cuánto has explorado. Despliégalo para ajustar la simulación o lanzar el
                    <strong> Desafío de planetas</strong>: ordénalos por distancia al Sol y relaciona cada uno con su característica.
                </p>
            </InstructionsModal>

            {/* Animación de reinicio del sistema */}
            <div className={`ss-reboot ${isResetting ? 'is-active' : ''}`} aria-hidden={!isResetting}>
                <div className="ss-reboot__wipe"></div>
                <div className="ss-reboot__scan"></div>
                <div className="ss-reboot__bar"></div>
                <div className="ss-reboot__text">
                    <strong>Reiniciando sistema</strong>
                    <span>Borrando datos y calibrando telescopios…</span>
                </div>
            </div>
        </GameShell>
    );
};

export default SistemaSolar;
