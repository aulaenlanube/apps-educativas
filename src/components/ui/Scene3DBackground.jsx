// Fondo 3D ambiental REUTILIZABLE para cualquier app de la plataforma.
// Monta un Canvas fijo a pantalla completa (detrás del contenido, sin capturar
// clicks) con el entorno 3D del Laboratorio de Física (isla low-poly: cielo, mar,
// colinas, árboles, montañas) y una cámara que orbita despacio. Respeta el ajuste
// global de calidad y aligera el presupuesto por ser decorativo.
//
// Uso: colócalo como primer hijo del contenedor de tu app y asegúrate de que el
// contenido va por encima (position: relative; z-index: 1). El contenedor debe
// crear contexto de apilado (p. ej. `isolation: isolate`) para acotar el fondo.
//   <div className="mi-app" style={{ isolation: 'isolate' }}>
//     <Scene3DBackground />
//     <div className="mi-contenido"> … </div>
//   </div>
import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import LabEnvironment from '@/apps/laboratorio-fisica/components/LabEnvironment';
import { AMBIENCES, ambienceById } from '@/apps/laboratorio-fisica/engine/ambiences';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { GLOBAL_QUALITY_PARAMS, effectiveDpr } from '@/services/graphicsQuality';

// cámara que orbita despacio alrededor de la isla (vista 3/4 elevada)
function OrbitCam({ radius = 44, height = 18, target = [0, 0.5, 0], speed = 0.03 }) {
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + 0.7;
    state.camera.position.set(Math.cos(t) * radius, height, Math.sin(t) * radius);
    state.camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

export default function Scene3DBackground({
  ambienceId,        // id concreto ('dia','atardecer','noche'…); si no, uno al azar
  scrim = 0.3,       // velo oscuro sobre el 3D para legibilidad del contenido (0..1)
  className = '',
  style,
}) {
  const { tier } = useGraphicsQuality();
  const Q = GLOBAL_QUALITY_PARAMS[tier] || GLOBAL_QUALITY_PARAMS.medium;

  // ambiente fijo indicado, o uno bonito de cielo al azar (estable mientras viva)
  const amb = useMemo(() => {
    if (ambienceId) return ambienceById(ambienceId);
    const opts = AMBIENCES.cielo;
    return opts[Math.floor(Math.random() * opts.length)];
  }, [ambienceId]);

  // de fondo gastamos algo menos que en una simulación a pantalla completa
  const budget = Math.min(Q.particleBudget ?? 0.7, 0.7);

  return (
    <div
      className={`scene3d-bg ${className}`}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }}
    >
      <Canvas
        dpr={effectiveDpr(tier)}
        gl={{ antialias: Q.antialias, powerPreference: 'high-performance' }}
        camera={{ position: [40, 18, 28], fov: 55 }}
      >
        <color attach="background" args={[amb.sky]} />
        <fog attach="fog" args={[amb.horizon, amb.fog[0], amb.fog[1]]} />
        <ambientLight intensity={amb.ambient ?? 0.5} />
        <hemisphereLight args={[amb.hemiSky || '#bfe3ff', amb.hemiGround || '#2c2354', amb.hemi ?? 0.55]} />
        <directionalLight position={amb.sunPos || [10, 16, 7]} color={amb.sun || '#ffffff'} intensity={amb.sunI ?? 1.2} />
        <LabEnvironment amb={amb} budget={budget} />
        <OrbitCam />
      </Canvas>
      {scrim > 0 && (
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `linear-gradient(180deg, rgba(7,11,28,${Math.min(1, scrim + 0.12)}) 0%, rgba(7,11,28,${scrim}) 38%, rgba(7,11,28,${Math.min(1, scrim + 0.16)}) 100%)`,
          }}
        />
      )}
    </div>
  );
}
