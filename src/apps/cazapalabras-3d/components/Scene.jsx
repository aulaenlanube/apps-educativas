// Escena de juego: luces, entorno, CÁMARA POR SECCIONES (coreografía discreta
// HOLD→TURN→HOLD→ADVANCE con el mouse-look del jugador sumado encima) y GESTOR DE
// MUROS de palabras con gravedad. El raycast del disparo sale del CENTRO de la
// mirilla. Toda la puntuación vive en el shell; aquí solo se emite onHit(data) y se
// recolapsa la columna (destroyBox). Sin pistas de valor: todas las cajas iguales.
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Environment from './Environment';
import ImpactFX from './ImpactFX';
import WordWall from './WordWall';
import { CAM, WALL_LAYOUT, WALL_QUALITY } from '../engine/config';
import {
  mulberry32, buildWall, destroyBox, faceYaw, layoutXs, injectWord, restoreBox, wallEmpty,
} from '../engine/walls';

const prefersReducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const YAW_MAX = 0.85;
const PITCH_MAX = 0.5;
const ADV_TOTAL = WALL_LAYOUT.wrapZ - WALL_LAYOUT.respawnZ; // distancia de un ciclo de avance
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

export default function Scene({ gameRef, controlRef, onHit, quality, tier }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const fxRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const reduceMotion = useMemo(prefersReducedMotion, []);
  const budget = quality?.particleBudget ?? 0.8;
  const wq = WALL_QUALITY[tier] || WALL_QUALITY.medium;

  const wallsRef = useRef([]);
  const prngRef = useRef(null);
  const camRef = useRef(null);
  const defInjRef = useRef(null);
  const [, bumpState] = useReducer((x) => (x + 1) & 0xffff, 0);
  const renderDirty = useRef(false);
  const bump = () => { renderDirty.current = true; };

  const wallById = (id) => wallsRef.current.find((w) => w.id === id);

  // ---- construir la estación inicial de muros al montar (pool ya disponible) ----
  useEffect(() => {
    const g = gameRef.current;
    const pool = g && g.pool;
    const prng = mulberry32((Math.floor(Math.random() * 0x7fffffff)) >>> 0);
    prngRef.current = prng;
    const xs = layoutXs(wq.walls, WALL_LAYOUT.xSpread);
    wallsRef.current = xs.map((x) => buildWall(pool, prng, {
      cols: wq.cols, rows: wq.rows, x, y: 0, z: WALL_LAYOUT.z,
    }));
    camRef.current = {
      phase: 'hold', phaseT: 0, phaseDur: CAM.holdMin,
      fromYaw: 0, toYaw: 0, focusIdx: Math.floor(wq.walls / 2),
      sinceAdvance: 0, advanceEvery: 2,
    };
    // encarar el muro central de salida
    const w0 = wallsRef.current[camRef.current.focusIdx];
    if (w0) { camRef.current.toYaw = faceYaw(w0.x, w0.z); camRef.current.fromYaw = camRef.current.toYaw; }
    bump();
    bumpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- transición de fase de la cámara ----
  const nextPhase = (cam, g) => {
    const prng = prngRef.current;
    const walls = wallsRef.current;
    if (cam.phase === 'hold') {
      const wantAdvance = !g.activeDef && walls.length
        && (walls.some(wallEmpty) || cam.sinceAdvance >= cam.advanceEvery);
      if (wantAdvance) {
        cam.phase = 'advance'; cam.phaseT = 0; cam.phaseDur = CAM.advanceDur;
        cam.fromYaw = cam.toYaw; cam.toYaw = 0; // mirar al frente al avanzar
        cam.sinceAdvance = 0; cam.advanceEvery = 2 + Math.floor(prng() * 2);
      } else {
        // preferir muros NO vacíos para no encarar un muro destruido
        const cand = walls.map((_, i) => i).filter((i) => !wallEmpty(walls[i]));
        const opts = cand.length ? cand : walls.map((_, i) => i);
        let idx = cam.focusIdx;
        if (opts.length > 1) { let t = 0; do { idx = opts[Math.floor(prng() * opts.length)]; t += 1; } while (idx === cam.focusIdx && t < 8); }
        else idx = opts.length ? opts[0] : cam.focusIdx;
        cam.focusIdx = idx;
        const w = walls[idx];
        cam.fromYaw = cam.toYaw; cam.toYaw = w ? faceYaw(w.x, w.z) : 0;
        cam.phase = 'turn'; cam.phaseT = 0; cam.phaseDur = CAM.turnDur;
        cam.sinceAdvance += 1;
      }
    } else {
      if (cam.phase === 'advance') {
        // fin del avance: estación fresca en reposo, encarando el muro de foco
        for (const w of walls) w.z = WALL_LAYOUT.z;
        const w = walls[cam.focusIdx] || walls[0];
        cam.toYaw = w ? faceYaw(w.x, w.z) : 0; cam.fromYaw = cam.toYaw;
        bump();
      }
      cam.phase = 'hold'; cam.phaseT = 0;
      cam.phaseDur = CAM.holdMin + prng() * (CAM.holdMax - CAM.holdMin);
      cam.fromYaw = cam.toYaw;
    }
  };

  useFrame((state, dt) => {
    const g = gameRef.current;
    const c = controlRef.current;
    const cam = camRef.current;
    if (!cam) return;
    const tt = state.clock.elapsedTime;
    const mo = reduceMotion ? 0.12 : 1;
    const active = g.running && !g.paused;

    // --- avanzar cronómetro de fase (congela en pausa) ---
    if (active) {
      cam.phaseT += dt;
      if (cam.phaseT >= cam.phaseDur) nextPhase(cam, g);
    }

    // --- pose base: yaw interpolado de sección + alabeo + respiración ---
    const s = smooth(clamp(cam.phaseDur > 0 ? cam.phaseT / cam.phaseDur : 1, 0, 1));
    const baseYaw = lerp(cam.fromYaw, cam.toYaw, s);
    const turnDelta = cam.toYaw - cam.fromYaw;
    const bankRoll = (cam.phase === 'turn' ? -turnDelta * (CAM.bankRoll / 0.5) * Math.sin(Math.PI * s) : 0);
    const breRoll = Math.sin(tt * 0.7) * CAM.breathRoll * mo;
    const breX = Math.sin(tt * 0.5) * CAM.breathPos * mo;
    const breY = Math.sin(tt * 0.8 + 1) * CAM.breathY * mo;

    const yaw = baseYaw + clamp(c.yaw, -YAW_MAX, YAW_MAX);
    const pitch = clamp(c.pitch, -PITCH_MAX, PITCH_MAX);
    euler.set(pitch, yaw, bankRoll * mo + breRoll, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    camera.position.set(CAM.pos[0] + breX, CAM.pos[1] + breY, CAM.pos[2]);

    if (!active) {
      if (renderDirty.current) { renderDirty.current = false; bumpState(); }
      return;
    }
    const p = g.params;
    const pool = g.pool;
    const prng = prngRef.current;

    // --- ADVANCE: los muros avanzan hacia/pasan la cámara y se reciclan con palabras nuevas ---
    if (cam.phase === 'advance') {
      const v = ADV_TOTAL / CAM.advanceDur;
      const adt = Math.min(dt, 0.05); // clamp: un stutter no teletransporta los muros
      for (const w of wallsRef.current) {
        w.z += v * adt;
        if (w.z > WALL_LAYOUT.wrapZ) {
          w.z -= ADV_TOTAL;
          // si el muro reciclado tenía la palabra-respuesta inyectada, invalidar para reinyectar limpio
          if (defInjRef.current && defInjRef.current.wallId === w.id) defInjRef.current = null;
          buildWall(pool, prng, { cols: w.cols, rows: w.rows, x: w.x, y: w.y, z: w.z, wall: w });
          bump();
        }
      }
    }

    // --- DEFINICIÓN sin resaltar: garantizar la palabra-respuesta en el muro enfocado ---
    const def = g.activeDef;
    const inj = defInjRef.current;
    if (def && (!inj || inj.word !== def.word)) {
      if (inj && inj.saved) restoreBox(wallById(inj.wallId), inj.boxId, inj.saved);
      const focus = wallsRef.current[cam.focusIdx];
      const w = (focus && !wallEmpty(focus)) ? focus : wallsRef.current.find((x) => !wallEmpty(x));
      const res = w ? injectWord(w, def.word, def.points || 5) : null;
      defInjRef.current = res ? { word: def.word, wallId: w.id, boxId: res.boxId, saved: res.saved } : null;
      // cuenta la definición como "presentada" SOLO cuando ya está visible en un muro
      // (si no hay muro con sitio aún, se reintenta el próximo frame y no infla la nota)
      if (res) { g.defPresented += 1; bump(); }
    } else if (!def && inj) {
      if (inj.saved) restoreBox(wallById(inj.wallId), inj.boxId, inj.saved);
      defInjRef.current = null;
      bump();
    }

    // --- disparo: raycast desde el centro (mirilla), con cooldown de cadencia ---
    if (c.shootQueued) {
      c.shootQueued = false;
      const now = performance.now();
      if (now >= (g.nextShotAt || 0)) {
        g.nextShotAt = now + (p.fireCooldownMs || 320);
        fxRef.current?.onShoot();
        g.shake = Math.max(g.shake || 0, 0.12);
        camera.updateMatrixWorld(); // mirilla del frame ACTUAL (no 1 frame tarde)
        raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        raycaster.far = 60;
        // refrescar las matrices de mundo de los muros ESTE frame (avance/gravedad):
        // r3f las recalcula tras los useFrame, así que sin esto el disparo impactaría
        // donde estaban los muros el frame anterior.
        if (groupRef.current) groupRef.current.updateWorldMatrix(false, true);
        const inter = groupRef.current ? raycaster.intersectObjects(groupRef.current.children, true) : [];
        let mesh = null; let point = null;
        for (const h of inter) {
          let o = h.object;
          while (o && (o.userData == null || o.userData.targetId == null)) o = o.parent;
          if (o && o.userData.targetId != null) { mesh = o; point = h.point; break; }
        }
        if (mesh) {
          const w = wallById(mesh.userData.wallId);
          const box = w && w.boxes.get(mesh.userData.targetId);
          if (box) {
            // FX y color NEUTROS (no revelan el valor): el alumno lo deduce por categoría
            fxRef.current?.onHit(point, '#9fc7ff', { combo: g.combo || 0, power: 1.2 });
            g.shake = Math.max(g.shake || 0, 0.28);
            onHit?.({ kind: 'word', text: box.text, points: box.points, penalty: box.penalty, category: box.category });
            destroyBox(w, mesh.userData.targetId);
            if (defInjRef.current && defInjRef.current.boxId === mesh.userData.targetId) defInjRef.current = null;
            bump();
          }
        }
      }
    }

    // --- screen shake: SIEMPRE al final, tras el raycast (no desvía la puntería) ---
    let sh = g.shake || 0;
    if (sh > 0.002 && !reduceMotion) {
      const a = sh * 0.22;
      camera.position.x += (Math.random() - 0.5) * a;
      camera.position.y += (Math.random() - 0.5) * a;
      camera.rotateZ((Math.random() - 0.5) * sh * 0.045);
      g.shake = Math.max(0, sh - dt * 3.2);
    } else if (sh) { g.shake = 0; }

    // re-render React solo si cambió la estructura de algún muro (no por frame)
    if (renderDirty.current) { renderDirty.current = false; bumpState(); }
  });

  const Q = quality || {};
  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fogExp2 attach="fog" args={['#070a18', 0.014]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a5d8ff', '#1e1b3a', 0.55]} />
      <directionalLight
        position={[8, 18, 6]}
        intensity={1.15}
        castShadow={!!Q.shadows}
        shadow-mapSize-width={Q.shadowMapSize || 1024}
        shadow-mapSize-height={Q.shadowMapSize || 1024}
      />
      <pointLight position={[0, 6, 2]} intensity={0.7} color="#38bdf8" distance={40} />
      <pointLight position={[-10, 4, -20]} intensity={0.5} color="#a855f7" distance={50} />

      <Environment budget={budget} tier={tier} />
      <ImpactFX ref={fxRef} quality={Q} />

      <group ref={groupRef}>
        {wallsRef.current.map((w) => (
          <WordWall key={w.id} wall={w} />
        ))}
      </group>
    </>
  );
}
