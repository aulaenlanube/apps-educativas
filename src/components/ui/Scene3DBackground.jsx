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
import React, { useCallback, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import FrameLimiter, { nowSeconds } from '@/components/ui/bg3d/FrameLimiter';
import LabEnvironment from '@/apps/laboratorio-fisica/components/LabEnvironment';
import { ambienceById, pickCieloBackground } from '@/apps/laboratorio-fisica/engine/ambiences';
import useFxTier from '@/hooks/useFxTier';
import { GLOBAL_QUALITY_PARAMS } from '@/services/graphicsQuality';

// Presupuesto del fondo por nivel de efectos (useFxTier). Es DECORATIVO y va
// detrás de cristales con desenfoque, así que no compensa pintarlo a 60 fps ni
// a resolución retina: la cámara se mueve ~1,7°/s y a 24-30 fps se ve igual de
// suave, con la mitad (o menos) de trabajo de GPU para la UI y para las apps
// que se juegan encima. En 'low' se pinta UNA vez y se queda quieto.
const BG_BUDGET = {
  high: { fps: 30, dpr: 1.25, antialias: true },
  medium: { fps: 24, dpr: 1, antialias: false },
  low: { fps: 0, dpr: 1, antialias: false },
};

// Tiempo de la órbita en segundos de reloj real (no de frames): así la
// velocidad no depende de los fps del limitador (ver bg3d/FrameLimiter).
const now = nowSeconds;

// cámara que orbita despacio alrededor de la isla (vista 3/4 elevada)
function OrbitCam({ radius = 44, height = 18, target = [0, 0.5, 0], speed = 0.03, frozen = false }) {
  useFrame((state) => {
    const t = (frozen ? 4 : now()) * speed + 0.7;
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
  const tier = useFxTier();
  const Q = GLOBAL_QUALITY_PARAMS[tier] || GLOBAL_QUALITY_PARAMS.medium;
  const B = BG_BUDGET[tier] || BG_BUDGET.medium;
  // si el limitador detecta que ni así llega, congelamos el fondo en esta sesión
  const [frozen, setFrozen] = useState(false);
  const freeze = useCallback(() => setFrozen(true), []);
  const fps = frozen ? 0 : B.fps;
  const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, B.dpr);

  // ambiente fijo indicado, o uno de cielo al azar PESADO hacia el día despejado /
  // soleado (pickCieloBackground): la plataforma es normalmente de día y con buen
  // tiempo; la noche y el mal tiempo aparecen, pero con baja probabilidad. Estable
  // mientras viva el componente (se sortea una vez por sesión: el fondo persiste).
  const amb = useMemo(() => {
    if (ambienceId) return ambienceById(ambienceId);
    return pickCieloBackground(Math.random());
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
        key={B.antialias ? 'aa' : 'noaa'}
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: B.antialias, powerPreference: tier === 'high' ? 'high-performance' : 'default' }}
        camera={{ position: [40, 18, 28], fov: 55 }}
      >
        <FrameLimiter fps={fps} onSlow={freeze} />
        <color attach="background" args={[amb.sky]} />
        <fog attach="fog" args={[amb.horizon, amb.fog[0], amb.fog[1]]} />
        <ambientLight intensity={amb.ambient ?? 0.5} />
        <hemisphereLight args={[amb.hemiSky || '#bfe3ff', amb.hemiGround || '#2c2354', amb.hemi ?? 0.55]} />
        <directionalLight position={amb.sunPos || [10, 16, 7]} color={amb.sun || '#ffffff'} intensity={amb.sunI ?? 1.2} />
        <LabEnvironment amb={amb} budget={budget} />
        <OrbitCam frozen={fps === 0} />
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
