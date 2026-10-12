// Fondo 3D "ciudad futurista": el fondo POR DEFECTO de la plataforma (home,
// catálogo, cursos, asignaturas y apps 'standard'). Hermano de
// Scene3DBackground (isla de naturaleza), que sigue disponible desde el menú de
// usuario / pie (ver src/services/backgroundScene.js).
//
// Presupuesto por nivel de efectos (useFxTier, sale del ajuste global de
// calidad gráfica). A diferencia de la isla, aquí hay tráfico y travelling, así
// que en 'high' se pinta a 60 fps para que se note fluido:
//
//   nivel   fps  DPR máx  antialias  densidad (escritorio · móvil)
//   high     60   1,25      sí        high   · medium
//   medium   30   1         no        medium · low
//   low       0   1         no        low    · low     (fotograma fijo)
//
// Medido con renderer.info (window.__eduCityInfo() en desarrollo), por densidad:
//   high   13 draw calls · ~34 k triángulos · ~4,7 k puntos
//          (1366 cajas + 160 cilindros, 1100 vehículos, 30 hologramas, 6 focos)
//   medium 13 draw calls · ~19 k triángulos · ~2,7 k puntos
//          (765 + 98, 560 vehículos, 18 hologramas, 4 focos)
//   low    12 draw calls · ~9,5 k triángulos · ~1,4 k puntos
//          (357 + 52, 260 vehículos, 9 hologramas, sin focos)
// El coste real es de relleno (fragment shader de fachadas, agua y suelo), por
// eso el DPR va capado y la densidad baja en móvil (pantalla < 720 px o táctil).
// La CPU por frame solo mueve la cámara y media docena de uniforms.
//
// Si aun así no llega (frames reales < 60 % del objetivo dos ventanas
// seguidas), baja primero a 30 fps y, si tampoco, se congela (onSlow).
// Con prefers-reduced-motion: fotograma fijo (sin travelling ni tráfico).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import FrameLimiter from '@/components/ui/bg3d/FrameLimiter';
import { useMediaQuery, useHtmlDark } from '@/components/ui/bg3d/bgEnv';
import useFxTier from '@/hooks/useFxTier';
import { lowerTier } from '@/services/graphicsQuality';
import CityScene from './CityScene';
import './CityBackground.css';

const CITY_BUDGET = {
  high: { fps: 60, dpr: 1.25, antialias: true },
  medium: { fps: 30, dpr: 1, antialias: false },
  low: { fps: 0, dpr: 1, antialias: false },
};

export default function CityBackground({ scrim = 0.3, className = '', style }) {
  const tier = useFxTier();
  const compact = useMediaQuery('(max-width: 719px)');
  const touch = useMediaQuery('(hover: none) and (pointer: coarse)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const dark = useHtmlDark();

  const B = CITY_BUDGET[tier] || CITY_BUDGET.medium;
  // En móvil se baja un escalón de densidad (no de fps)
  const density = compact || touch ? lowerTier(tier) : tier;

  // tope por lentitud: 60 → 30 → congelado. Se reinicia si cambia el nivel.
  const [cap, setCap] = useState(Infinity);
  useEffect(() => { setCap(Infinity); }, [tier]);
  const fps = reduced ? 0 : Math.min(B.fps, cap);
  const fpsRef = useRef(fps);
  fpsRef.current = fps;
  const onSlow = useCallback(() => setCap(fpsRef.current > 30 ? 30 : 0), []);

  // el antialias no se puede cambiar en un contexto vivo: se decide al montar
  // (así un cambio de nivel no recrea el canvas ni parpadea)
  const [aa] = useState(B.antialias);
  const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, B.dpr);

  const [ready, setReady] = useState(false);
  const onCreated = useCallback(() => {
    // dejamos pintar un par de frames antes del fundido de entrada
    setTimeout(() => setReady(true), 120);
  }, []);

  return (
    <div
      className={`scene3d-bg city-bg ${dark ? 'city-bg--night' : 'city-bg--day'} ${className}`}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }}
    >
      <Canvas
        className="city-bg__canvas"
        style={{ opacity: ready ? 1 : 0 }}
        frameloop="demand"
        dpr={dpr}
        flat
        gl={{ antialias: aa, alpha: false, stencil: false, powerPreference: tier === 'high' ? 'high-performance' : 'default' }}
        camera={{ position: [92, 30, 0], fov: 52, near: 0.5, far: 2400 }}
        onCreated={onCreated}
      >
        <FrameLimiter fps={fps} onSlow={onSlow} />
        <CityScene density={density} frozen={fps === 0} night={dark} />
      </Canvas>
      {/* en móvil el texto va centrado sobre toda la anchura: algo más de velo */}
      {scrim > 0 && <div className="city-bg__scrim" style={{ '--city-scrim': compact ? scrim + 0.08 : scrim }} />}
    </div>
  );
}
