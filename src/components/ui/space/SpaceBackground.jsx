// Fondo 3D "espacio": el futuro viaje de la humanidad, los robots y la IA a
// las estrellas (galaxia, nebulosas, agujero negro, enjambre de Dyson, puerta
// estelar, convoy de naves-arca y la mascota como sonda). Tercer entorno del
// fondo de la plataforma, hermano de CityBackground (ciudad, el de por defecto)
// y Scene3DBackground (isla). Ver src/services/backgroundScene.js.
//
// Presupuesto por nivel de efectos (useFxTier, sale del ajuste global de
// calidad gráfica), el mismo esquema que la ciudad:
//
//   nivel   fps  DPR máx  antialias  densidad (escritorio · móvil)
//   high     60   1,25      sí        high   · medium
//   medium   30   1         no        medium · low
//   low       0   1         no        low    · low     (fotograma fijo)
//
// Draw calls, triángulos y puntos medidos por densidad: ver SpaceScene.jsx.
// El coste real es de relleno (cielo a pantalla completa, planeta de origen,
// lente del agujero negro), por eso el DPR va capado y la densidad baja en
// móvil (pantalla < 720 px o táctil). La CPU por frame solo mueve la cámara y
// una docena de uniforms.
//
// Si aun así no llega (frames reales < 60 % del objetivo dos ventanas
// seguidas), baja primero a 30 fps y, si tampoco, se congela (onSlow).
// Con prefers-reduced-motion: fotograma fijo (sin deriva ni convoy).
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import FrameLimiter from '@/components/ui/bg3d/FrameLimiter';
import { PlaySnapshot, PlaySnapshotLayer, usePlaySnapshot } from '@/components/ui/bg3d/PlaySnapshot';
import { useMediaQuery, useHtmlDark } from '@/components/ui/bg3d/bgEnv';
import useFxTier from '@/hooks/useFxTier';
import { lowerTier } from '@/services/graphicsQuality';
import SpaceScene from './SpaceScene';
import './SpaceBackground.css';

const SPACE_BUDGET = {
  high: { fps: 60, dpr: 1.25, antialias: true },
  medium: { fps: 30, dpr: 1, antialias: false },
  low: { fps: 0, dpr: 1, antialias: false },
};

export default function SpaceBackground({ scrim = 0.3, playing = false, className = '', style }) {
  const tier = useFxTier();
  const compact = useMediaQuery('(max-width: 719px)');
  const touch = useMediaQuery('(hover: none) and (pointer: coarse)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const dark = useHtmlDark();

  const B = SPACE_BUDGET[tier] || SPACE_BUDGET.medium;
  // en móvil se baja un escalón de densidad (no de fps)
  const density = compact || touch ? lowerTier(tier) : tier;

  // tope por lentitud: 60 → 30 → congelado. Se reinicia si cambia el nivel.
  const [cap, setCap] = useState(Infinity);
  useEffect(() => { setCap(Infinity); }, [tier]);
  // en partida (playing) se congela y se cubre con su foto difuminada: bg3d/PlaySnapshot.jsx
  const fps = reduced || playing ? 0 : Math.min(B.fps, cap);
  const fpsRef = useRef(fps);
  fpsRef.current = fps;
  const onSlow = useCallback(() => setCap(fpsRef.current > 30 ? 30 : 0), []);

  // el antialias no se puede cambiar en un contexto vivo: se decide al montar
  const [aa] = useState(B.antialias);
  const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, B.dpr);
  const snap = usePlaySnapshot();

  const [ready, setReady] = useState(false);
  const onCreated = useCallback(() => {
    // dejamos pintar un par de frames (y hornear la nebulosa) antes del fundido
    setTimeout(() => setReady(true), 120);
  }, []);

  return (
    <div
      className={`scene3d-bg space-bg ${dark ? 'space-bg--night' : 'space-bg--day'} ${className}`}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }}
    >
      <Canvas
        className="space-bg__canvas"
        style={{ opacity: ready ? 1 : 0 }}
        frameloop="demand"
        dpr={dpr}
        flat
        gl={{ antialias: aa, alpha: false, stencil: false, powerPreference: tier === 'high' ? 'high-performance' : 'default' }}
        camera={{ position: [0, 0, 0], fov: 50, near: 0.5, far: 7000 }}
        onCreated={onCreated}
      >
        <PlaySnapshot playing={playing} snap={snap} />
        <FrameLimiter fps={fps} onSlow={onSlow} />
        <SpaceScene density={density} frozen={fps === 0} night={dark} />
      </Canvas>
      <PlaySnapshotLayer snap={snap} playing={playing} />
      {/* en móvil el texto va centrado sobre toda la anchura: algo más de velo */}
      {scrim > 0 && <div className="space-bg__scrim" style={{ '--space-scrim': compact ? scrim + 0.08 : scrim }} />}
    </div>
  );
}
