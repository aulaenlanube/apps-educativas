// Viewport 3D común a todas las escenas del laboratorio.
// - Aplica el tier de calidad global: dpr, antialias y sombras se fijan al CREAR
//   el contexto WebGL, por eso un cambio de tier remonta el Canvas (key). El
//   estado físico vive en `world` (fuera de React) y sobrevive al remount.
// - Gestiona la pérdida de contexto WebGL (móviles con poca memoria): remonta
//   y la escena se reconstruye desde `world`.
// - Governor de FPS: con preferencia 'auto', si el equipo no sostiene los FPS
//   se baja un tier en caliente.
import React, { useCallback, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  GLOBAL_QUALITY_PARAMS, effectiveDpr, createFpsGovernor, lowerTier,
} from '@/services/graphicsQuality';

function GovernorTicker({ onDowngrade }) {
  const govRef = useRef(null);
  if (!govRef.current) govRef.current = createFpsGovernor({ onDowngrade });
  useFrame((_, delta) => govRef.current.tick(delta));
  return null;
}

export default function SimViewport({
  tier = 'medium',
  prefAuto = false,
  onAutoDowngrade,
  camera,
  controls,
  background = '#0b1026',
  children,
  className = '',
}) {
  const Q = GLOBAL_QUALITY_PARAMS[tier] || GLOBAL_QUALITY_PARAMS.medium;
  const [ctxKey, setCtxKey] = useState(0);

  const onCreated = useCallback(({ gl }) => {
    const el = gl.domElement;
    el.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      // pequeño respiro y remount: la escena se reconstruye desde `world`
      setTimeout(() => setCtxKey((k) => k + 1), 350);
    }, false);
  }, []);

  const handleDowngrade = useCallback(() => {
    const next = lowerTier(tier);
    if (next !== tier) onAutoDowngrade?.(next);
  }, [tier, onAutoDowngrade]);

  return (
    <div className={`fislab-viewport ${className}`}>
      <Canvas
        key={`${tier}-${ctxKey}`}
        dpr={effectiveDpr(tier)}
        shadows={Q.shadows}
        gl={{ antialias: Q.antialias, powerPreference: 'high-performance' }}
        camera={{ position: camera?.position || [9, 6, 11], fov: camera?.fov || 45 }}
        onCreated={onCreated}
      >
        <color attach="background" args={[background]} />
        <fog attach="fog" args={[background, 38, 90]} />
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#bfe3ff', '#2c2354', 0.55]} />
        <directionalLight
          position={[10, 16, 7]}
          intensity={1.2}
          castShadow={Q.shadows}
          shadow-mapSize-width={Q.shadowMapSize || 512}
          shadow-mapSize-height={Q.shadowMapSize || 512}
          shadow-camera-left={-22}
          shadow-camera-right={22}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
          shadow-camera-far={60}
          shadow-bias={-0.0004}
        />
        {prefAuto && <GovernorTicker onDowngrade={handleDowngrade} />}
        {children}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={controls?.minDistance ?? 4}
          maxDistance={controls?.maxDistance ?? 45}
          maxPolarAngle={controls?.maxPolarAngle ?? Math.PI * 0.49}
          target={controls?.target || [0, 2, 0]}
          enablePan={controls?.enablePan ?? false}
        />
      </Canvas>
    </div>
  );
}
