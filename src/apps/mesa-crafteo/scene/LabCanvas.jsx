// src/apps/mesa-crafteo/scene/LabCanvas.jsx
// Lienzo 3D de la mesa. Sigue el patrón del Laboratorio de Física:
//  · Canvas con key={tier}: dpr y antialias se fijan al crear el contexto.
//  · Pérdida de contexto WebGL → remonta (el modelo vive fuera, en React).
//  · Governor de FPS (solo con preferencia Auto) → baja un nivel en caliente.
//  · frameloop="demand": en reposo NO se pinta; `activity.wake(ms)` pide
//    fotogramas (al tope del tier) mientras algo se anima.
//  · Encuadre automático con setViewOffset para centrar la molécula en el hueco
//    que dejan los paneles (insets en px).
import React, { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  GLOBAL_QUALITY_PARAMS, effectiveDpr, createFpsGovernor, lowerTier, markWebGLUnavailable,
} from '@/services/graphicsQuality';
import { tierParams } from './quality';
import LabEnvironment from './LabEnvironment';
import ContextLossGuard from '@/components/ui/bg3d/ContextLossGuard';

export function createActivity() {
  let until = 0; let continuous = false; let raf = 0; let last = 0;
  let invalidate = null; let step = 1000 / 60;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const loop = (t) => {
    if (!continuous && now() > until) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (t - last < step - 2) return;
    last = t;
    invalidate?.();
  };
  const start = () => { if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(loop); };
  return {
    bind(inv, fps) { invalidate = inv; step = 1000 / fps; start(); },
    wake(ms = 400) { until = Math.max(until, now() + ms); start(); },
    setContinuous(v) { continuous = !!v; if (continuous) start(); },
    stop() { if (raf) cancelAnimationFrame(raf); raf = 0; invalidate = null; },
  };
}

function Pump({ activity, fps }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    activity.bind(invalidate, fps);
    activity.wake(1500);
    return () => activity.stop();
  }, [activity, invalidate, fps]);
  return null;
}

function Governor({ onDowngrade, capFps }) {
  const gov = useRef(null);
  // Solo baja si no llega a ~60 % del tope de fps de su nivel (el tope de
  // medio/bajo ya está por debajo de 42: antes bajaba siempre).
  if (!gov.current) gov.current = createFpsGovernor({ onDowngrade, minFps: Math.min(42, Math.round(capFps * 0.6)) });
  // En modo "demand" hay huecos sin fotogramas: solo cuentan los seguidos.
  useFrame((_, dt) => { if (dt < 0.2) gov.current.tick(dt); });
  return null;
}

const ORIGIN = new THREE.Vector3();

function AutoFrame({ insets, extentRef, resetKey, activity }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls);
  const fit = useRef({ r: -1, anim: false, lastUser: -1e9, reset: resetKey });

  useEffect(() => {
    const { width: w, height: h } = size;
    const ox = ((insets.right || 0) - (insets.left || 0)) / 2;
    const oy = ((insets.bottom || 0) - (insets.top || 0)) / 2;
    camera.setViewOffset(w, h, ox, oy, w, h);
    camera.updateProjectionMatrix();
    fit.current.anim = true;
    activity.wake(900);
  }, [camera, size, insets.top, insets.right, insets.bottom, insets.left, activity]);

  useEffect(() => {
    if (!controls) return undefined;
    const onStart = () => { fit.current.lastUser = performance.now(); };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controls]);

  useFrame((_, dt) => {
    const f = fit.current;
    const r = extentRef.current?.r ?? 1;
    if (resetKey !== f.reset) {
      f.reset = resetKey; f.anim = true; f.lastUser = -1e9;
      camera.position.set(0, 1.4, 7);
      controls?.target.set(0, 0, 0);
    }
    if (Math.abs(r - f.r) > 0.15) { f.r = r; if (performance.now() - f.lastUser > 1500) f.anim = true; }
    if (!f.anim) return;
    const { width: w, height: h } = size;
    const availH = Math.max(120, h - (insets.top || 0) - (insets.bottom || 0));
    const availW = Math.max(120, w - (insets.left || 0) - (insets.right || 0));
    const t = Math.tan((camera.fov * Math.PI) / 360);
    const want = Math.max(1.5, f.r) * 1.18;
    const dV = want / (t * (availH / h));
    const dH = want / (t * camera.aspect * (availW / w));
    const d = Math.min(22, Math.max(4.2, dV, dH));
    const tgt = controls?.target || ORIGIN;
    const cur = camera.position.distanceTo(tgt);
    const nd = cur + (d - cur) * (1 - Math.exp(-5 * Math.min(dt, 0.05)));
    const dir = camera.position.clone().sub(tgt).normalize();
    camera.position.copy(tgt).addScaledVector(dir, nd);
    if (Math.abs(nd - d) < 0.02) f.anim = false;
    else activity.wake(100);
  });
  return null;
}

class CanvasBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { markWebGLUnavailable(); this.props.onFail?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function LabCanvas({
  tier = 'medium', prefAuto = false, onAutoDowngrade, onFail, insets = {}, extentRef, activity,
  autoRotate = false, resetKey = 0, children,
}) {
  const G = GLOBAL_QUALITY_PARAMS[tier] || GLOBAL_QUALITY_PARAMS.medium;
  const P = tierParams(tier);
  const [ctxKey, setCtxKey] = useState(0);

  const onContextLost = useCallback(() => setCtxKey((k) => k + 1), []);

  const handleDowngrade = useCallback(() => {
    const next = lowerTier(tier);
    if (next !== tier) onAutoDowngrade?.(next);
  }, [tier, onAutoDowngrade]);

  useEffect(() => { activity.setContinuous(autoRotate); }, [activity, autoRotate]);

  return (
    <CanvasBoundary onFail={onFail}>
      <Canvas
        key={`${tier}-${ctxKey}`}
        frameloop="demand"
        dpr={effectiveDpr(tier)}
        gl={{ antialias: G.antialias, powerPreference: 'high-performance', alpha: false }}
        camera={{ position: [0, 1.4, 7], fov: 40, near: 0.1, far: 140 }}
        className="mc-canvas"
      >
        <color attach="background" args={['#070b1d']} />
        <fog attach="fog" args={['#0b1026', 16, 44]} />
        <ambientLight intensity={0.32} />
        <hemisphereLight args={['#c7d2fe', '#1e1b4b', 0.6]} />
        <directionalLight position={[4, 7, 6]} intensity={1.7} />
        <directionalLight position={[-4, 2, -6]} intensity={1.35} color="#7dd3fc" />
        <pointLight position={[-5, -1, 4]} intensity={0.5} color="#f0abfc" />
        <ContextLossGuard onLost={onContextLost} />
        <Pump activity={activity} fps={P.fps} />
        {prefAuto && <Governor onDowngrade={handleDowngrade} capFps={P.fps} />}
        <LabEnvironment params={P} extentRef={extentRef} />
        <Suspense fallback={null}>{children}</Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.09}
          rotateSpeed={0.8}
          minDistance={2.6}
          maxDistance={24}
          autoRotate={autoRotate}
          autoRotateSpeed={1.6}
        />
        <AutoFrame insets={insets} extentRef={extentRef} resetKey={resetKey} activity={activity} />
      </Canvas>
    </CanvasBoundary>
  );
}
