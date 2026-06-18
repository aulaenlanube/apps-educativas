// Escena de juego: la MISMA isla low-poly 3D de la plataforma (LabEnvironment, el
// entorno del Laboratorio de Física) como mundo, iluminada con el ambiente elegido.
// La cámara es de PRIMERA PERSONA y está FIJA (ni avanza ni gira sola): solo el
// mouse-look del jugador (yaw/pitch) mueve la vista para seguir las DIANAS VOLADORAS.
// Un spawner lanza palabras que surcan el cielo en arcos (motor en engine/flyers.js);
// el disparo es un raycast desde el CENTRO de la mirilla. La puntuación vive en el
// shell (onHit); aquí solo se integran las trayectorias y se resuelven los impactos.
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LabEnvironment from '@/apps/laboratorio-fisica/components/LabEnvironment';
import { DEFAULT_AMBIENCE } from '@/apps/laboratorio-fisica/engine/ambiences';
import ImpactFX from './ImpactFX';
import Flyer from './Flyer';
import { CAM, FLYER_QUALITY, WRONG_REMOVES_VALID } from '../engine/config';
import {
  spawnFlyer, updateFlyer, makeEscape, resetFlyerIds,
} from '../engine/flyers';

const prefersReducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function Scene({ gameRef, controlRef, onHit, quality, tier, amb }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const fxRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const reduceMotion = useMemo(prefersReducedMotion, []);
  const ambience = amb || DEFAULT_AMBIENCE;
  const fog = ambience.fog || [50, 170];
  const Q = quality || {};
  const budget = Math.min(Q.particleBudget ?? 0.8, 0.85);
  const fq = FLYER_QUALITY[tier] || FLYER_QUALITY.medium;

  const flyersRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const defSpawnRef = useRef(0);
  const [, bumpState] = useReducer((x) => (x + 1) & 0xffff, 0);
  const renderDirty = useRef(false);
  const markDirty = () => { renderDirty.current = true; };

  const removeFlyer = (id) => {
    flyersRef.current = flyersRef.current.filter((f) => f.id !== id);
    markDirty();
  };
  const hasLiveDefFlyer = () => flyersRef.current.some((f) => f.isDef && !f.escaping);

  // ---- siembra inicial al montar (pool y params ya disponibles vía start()) ----
  useEffect(() => {
    resetFlyerIds();
    flyersRef.current = [];
    const g = gameRef.current;
    const p = g && g.params;
    if (g && g.pool && p) {
      const seed = Math.min(fq.minLive + 1, fq.max);
      for (let i = 0; i < seed; i += 1) {
        flyersRef.current.push(spawnFlyer(g.pool, Math.random, { validRatio: p.validRatio, speed: p.speed }));
      }
    }
    markDirty();
    bumpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, dtRaw) => {
    const g = gameRef.current;
    const c = controlRef.current;
    if (!g) return;
    const dt = Math.min(0.1, dtRaw);
    const tt = state.clock.elapsedTime;
    const mo = reduceMotion ? 0.12 : 1;
    const active = g.running && !g.paused;
    const p = g.params || {};

    // --- pose de cámara: fija + mouse-look del jugador + micro-respiración ---
    const yaw = clamp(c.yaw, -CAM.yawMax, CAM.yawMax);
    const pitch = clamp(CAM.basePitch + c.pitch, -CAM.pitchMax, CAM.pitchMax);
    const breRoll = Math.sin(tt * 0.7) * CAM.breathRoll * mo;
    const breX = Math.sin(tt * 0.5) * CAM.breathPos * mo;
    const breY = Math.sin(tt * 0.8 + 1) * CAM.breathY * mo;
    euler.set(pitch, yaw, breRoll, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    camera.position.set(CAM.pos[0] + breX, CAM.pos[1] + breY, CAM.pos[2]);

    // --- integrar trayectorias (solo activo) y purgar las que salen del campo ---
    if (active) {
      let changed = false;
      const next = [];
      for (const f of flyersRef.current) {
        if (updateFlyer(f, dt)) next.push(f);
        else changed = true;
      }
      if (changed) { flyersRef.current = next; markDirty(); }
    }

    // --- colocar y orientar (billboard) cada diana viva, también en pausa ---
    for (const f of flyersRef.current) {
      const m = f._mesh;
      if (m) { m.position.set(f.px, f.py, f.pz); m.quaternion.copy(camera.quaternion); }
    }

    if (!active) {
      if (renderDirty.current) { renderDirty.current = false; bumpState(); }
      return;
    }

    const now = performance.now();

    // --- spawner ---
    const def = g.activeDef;
    if (def) {
      // garantizar SIEMPRE una diana con la palabra-respuesta mientras el reto esté vivo
      if (!hasLiveDefFlyer() && now >= defSpawnRef.current) {
        flyersRef.current.push(spawnFlyer(g.pool, Math.random, { def: { word: def.word, points: def.points } }));
        defSpawnRef.current = now + 700;
        if (!g.activeDefCounted) { g.defPresented += 1; g.activeDefCounted = true; }
        markDirty();
      }
    } else {
      // el reto acabó: que huyan las dianas-respuesta que sigan en vuelo
      for (const f of flyersRef.current) if (f.isDef && !f.escaping) makeEscape(f);
    }
    // cadencia normal + relleno si quedan muy pocas en pantalla
    const live = flyersRef.current.length;
    const needFill = live < fq.minLive;
    if (live < fq.max && (now >= lastSpawnRef.current || needFill)) {
      flyersRef.current.push(spawnFlyer(g.pool, Math.random, { validRatio: p.validRatio, speed: p.speed }));
      lastSpawnRef.current = now + (needFill ? 220 : (p.spawnEverySec || 0.75) * 1000);
      markDirty();
    }

    // --- disparo: raycast desde el centro (mirilla), con cooldown de cadencia ---
    if (c.shootQueued) {
      c.shootQueued = false;
      if (now >= (g.nextShotAt || 0)) {
        g.nextShotAt = now + (p.fireCooldownMs || 280);
        fxRef.current?.onShoot();
        g.shake = Math.max(g.shake || 0, 0.1);
        camera.updateMatrixWorld(); // mirilla del frame ACTUAL (no 1 frame tarde)
        raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        raycaster.far = 70;
        // refrescar matrices de mundo de las dianas ESTE frame (las acabo de mover):
        if (groupRef.current) groupRef.current.updateWorldMatrix(false, true);
        const inter = groupRef.current ? raycaster.intersectObjects(groupRef.current.children, true) : [];
        let hitGroup = null; let point = null;
        for (const h of inter) {
          let o = h.object;
          while (o && (o.userData == null || o.userData.targetId == null)) o = o.parent;
          if (o && o.userData.targetId != null) { hitGroup = o; point = h.point; break; }
        }
        if (hitGroup) {
          const f = flyersRef.current.find((x) => x.id === hitGroup.userData.targetId);
          if (f && !f.escaping) {
            const isDef = !!g.activeDef && f.text.trim().toLowerCase() === g.activeDef.word.trim().toLowerCase();
            // al fallar (palabra NO válida y no es la respuesta) huyen válidas en vuelo
            let removedValid = 0;
            if (!isDef && !f.valid) {
              for (const x of flyersRef.current) {
                if (removedValid >= WRONG_REMOVES_VALID) break;
                if (x.valid && !x.escaping && x.id !== f.id) { makeEscape(x); removedValid += 1; }
              }
            }
            // FX/color NEUTROS (no revelan el valor): el alumno lo deduce por categoría
            fxRef.current?.onHit(point, '#9fc7ff', { combo: g.combo || 0, power: isDef ? 1.6 : 1.2 });
            g.shake = Math.max(g.shake || 0, isDef ? 0.4 : (removedValid > 0 ? 0.34 : 0.26));
            onHit?.({
              kind: 'word', text: f.text, value: f.value, valid: f.valid, removedValid,
            });
            removeFlyer(f.id);
          }
        }
      }
    }

    // --- screen shake: SIEMPRE al final, tras el raycast (no desvía la puntería) ---
    let sh = g.shake || 0;
    if (sh > 0.002 && !reduceMotion) {
      const a = sh * 0.2;
      camera.position.x += (Math.random() - 0.5) * a;
      camera.position.y += (Math.random() - 0.5) * a;
      camera.rotateZ((Math.random() - 0.5) * sh * 0.04);
      g.shake = Math.max(0, sh - dt * 3.2);
    } else if (sh) { g.shake = 0; }

    if (renderDirty.current) { renderDirty.current = false; bumpState(); }
  });

  return (
    <>
      <fog attach="fog" args={[ambience.horizon, fog[0], fog[1]]} />
      <ambientLight intensity={ambience.ambient ?? 0.5} />
      <hemisphereLight args={[ambience.hemiSky || '#bfe3ff', ambience.hemiGround || '#2c2354', ambience.hemi ?? 0.55]} />
      <directionalLight
        position={ambience.sunPos || [10, 16, 7]}
        color={ambience.sun || '#ffffff'}
        intensity={ambience.sunI ?? 1.2}
      />

      <LabEnvironment amb={ambience} budget={budget} />
      <ImpactFX ref={fxRef} quality={Q} />

      <group ref={groupRef}>
        {flyersRef.current.map((f) => (
          <Flyer key={f.id} flyer={f} />
        ))}
      </group>
    </>
  );
}
