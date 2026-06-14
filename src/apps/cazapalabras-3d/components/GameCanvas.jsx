// Canvas r3f a pantalla completa con calidad gráfica global (dpr/AA/sombras por
// tier, remonte al cambiar tier o perder contexto WebGL, governor de FPS en
// modo auto). Captura el control en el wrapper DOM: ARRASTRAR para mirar +
// TAP para disparar (universal ratón/táctil). El disparo se resuelve en la
// escena como raycast desde el CENTRO de la pantalla (la mirilla).
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  GLOBAL_QUALITY_PARAMS, effectiveDpr, createFpsGovernor, lowerTier,
} from '@/services/graphicsQuality';
import Scene from './Scene';
import Effects from './Effects';

function Governor({ onDowngrade }) {
  const ref = useRef(null);
  if (!ref.current) ref.current = createFpsGovernor({ onDowngrade });
  useFrame((_, dt) => ref.current.tick(dt));
  return null;
}

function GameCanvas({ tier, prefAuto, onAutoDowngrade, gameRef, controlRef, onHit }) {
  const Q = GLOBAL_QUALITY_PARAMS[tier] || GLOBAL_QUALITY_PARAMS.medium;
  const [ctxKey, setCtxKey] = useState(0);
  const [lost, setLost] = useState(false);
  const drag = useRef({ down: false, moved: 0, lx: 0, ly: 0, t0: 0 });

  const onCreated = useCallback(({ gl }) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.18;
    const el = gl.domElement;
    el.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setLost(true); // congela el render-loop: no rasterizar sobre el contexto muerto
      setTimeout(() => { setLost(false); setCtxKey((k) => k + 1); }, 350);
    }, false);
  }, []);

  const handleDowngrade = useCallback(() => {
    const next = lowerTier(tier);
    if (next !== tier) onAutoDowngrade?.(next);
  }, [tier, onAutoDowngrade]);

  // ── control: RATÓN = mover gira (pointer lock) + clic dispara · TÁCTIL = arrastrar gira + tap dispara ──
  const hasMouse = useMemo(() => typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(pointer: fine)').matches, []);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const lockTarget = useRef(null);
  const SENS = 0.0022;

  // estado del pointer lock (mover el ratón gira sin arrastrar)
  useEffect(() => {
    const onChange = () => {
      const l = document.pointerLockElement === lockTarget.current;
      lockedRef.current = l; setLocked(l);
      if (!l) drag.current.down = false; // al soltar el lock, desarma el arrastre de respaldo (evita giro espurio)
    };
    const onError = () => {}; // silencia errores de pointer lock (p.ej. re-lock tras ESC en cooldown)
    document.addEventListener('pointerlockchange', onChange);
    document.addEventListener('pointerlockerror', onError);
    return () => {
      document.removeEventListener('pointerlockchange', onChange);
      document.removeEventListener('pointerlockerror', onError);
    };
  }, []);
  // giro por movimiento del ratón mientras está capturado
  useEffect(() => {
    const onMove = (e) => {
      if (!lockedRef.current) return;
      const c = controlRef.current;
      c.yaw -= (e.movementX || 0) * SENS;
      c.pitch -= (e.movementY || 0) * SENS;
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, [controlRef]);
  // al desmontar (fin de partida) libera el ratón para que vuelva el cursor
  useEffect(() => () => { if (document.pointerLockElement) document.exitPointerLock?.(); }, []);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') {
      controlRef.current.shootQueued = true; // clic = disparo (siempre)
      // captura el ratón para girar moviéndolo (no en navegadores automatizados,
      // donde el pointer lock secuestraría el control del test)
      if (!lockedRef.current && !navigator.webdriver && lockTarget.current?.requestPointerLock) {
        try {
          const req = lockTarget.current.requestPointerLock();
          if (req && typeof req.then === 'function') req.catch(() => {}); // rechazo asíncrono (no es throw síncrono)
        } catch { /* denegado: queda el arrastre de respaldo */ }
      }
      const d = drag.current; d.down = true; d.lx = e.clientX; d.ly = e.clientY; // respaldo arrastre si no hay lock
      return;
    }
    const d = drag.current;
    d.down = true; d.moved = 0; d.lx = e.clientX; d.ly = e.clientY; d.t0 = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const c = controlRef.current;
    if (e.pointerType === 'mouse') {
      if (lockedRef.current) return; // el giro lo lleva el listener de mousemove (movementX)
      const d = drag.current;
      if (!d.down) return; // respaldo: solo con botón pulsado mientras no hay lock
      c.yaw -= (e.clientX - d.lx) * 0.0026; c.pitch -= (e.clientY - d.ly) * 0.0024;
      d.lx = e.clientX; d.ly = e.clientY;
      return;
    }
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.lx; const dy = e.clientY - d.ly;
    d.lx = e.clientX; d.ly = e.clientY;
    d.moved += Math.abs(dx) + Math.abs(dy);
    c.yaw -= dx * 0.0026; c.pitch -= dy * 0.0024;
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    if (e.pointerType === 'mouse') { d.down = false; return; }
    if (!d.down) return;
    d.down = false;
    const elapsed = performance.now() - d.t0;
    if (d.moved < 11 && elapsed < 500) controlRef.current.shootQueued = true; // tap → disparo
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="cz3d-canvas"
      ref={lockTarget}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { drag.current.down = false; }}
    >
      {hasMouse && !locked && (
        <div className="cz3d-lockhint">🖱️ Haz clic para mirar y disparar · mueve el ratón para girar</div>
      )}
      <Canvas
        key={`${tier}-${ctxKey}`}
        frameloop={lost ? 'never' : 'always'}
        dpr={effectiveDpr(tier)}
        shadows={Q.shadows}
        gl={{ antialias: Q.antialias, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.4, 7], fov: 64, near: 0.1, far: 240 }}
        onCreated={onCreated}
      >
        {prefAuto && <Governor onDowngrade={handleDowngrade} />}
        <Scene gameRef={gameRef} controlRef={controlRef} onHit={onHit} quality={Q} tier={tier} />
        {Q.bloom && <Effects />}
      </Canvas>
    </div>
  );
}

// memo: el refresco del HUD (~11 Hz) en el shell no debe re-renderizar el Canvas.
export default memo(GameCanvas);
