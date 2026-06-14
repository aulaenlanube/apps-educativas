// Escena de juego: luces, entorno y CÁMARA POR SECCIONES (coreografía discreta y
// CALMADA HOLD→TURN→HOLD: la cámara NO se traslada, solo GIRA para encarar MONTONES
// colocados a su alrededor; el mouse-look del jugador se suma encima). Gestor de
// MONTONES de palabras con gravedad. El raycast del disparo sale del CENTRO de la
// mirilla. La puntuación vive en el shell (onHit); aquí se recolapsa la columna
// (destroyBox) y, al fallar (palabra NO válida), se quitan varias válidas del montón.
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Environment from './Environment';
import ImpactFX from './ImpactFX';
import WordWall from './WordWall';
import {
  CAM, PILE_LAYOUT, PILE_QUALITY, WRONG_REMOVES_VALID,
} from '../engine/config';
import {
  mulberry32, buildPile, destroyBox, faceYaw, layoutPiles, randomPilePos,
  injectWord, restoreBox, pileEmpty, pileHasValid, removeValidBoxes,
} from '../engine/walls';

const prefersReducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const YAW_MAX = 0.85;
const PITCH_MAX = 0.5;
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
  const pq = PILE_QUALITY[tier] || PILE_QUALITY.medium;

  const pilesRef = useRef([]);
  const prngRef = useRef(null);
  const camRef = useRef(null);
  const defInjRef = useRef(null);
  const [, bumpState] = useReducer((x) => (x + 1) & 0xffff, 0);
  const renderDirty = useRef(false);
  const bump = () => { renderDirty.current = true; };

  const pileById = (id) => pilesRef.current.find((w) => w.id === id);
  const randTotal = (prng) => pq.boxesMin + Math.floor(prng() * (pq.boxesMax - pq.boxesMin + 1));
  const randValid = (prng) => pq.validMin + Math.floor(prng() * (pq.validMax - pq.validMin + 1));

  // ---- construir los montones iniciales al montar (pool ya disponible) ----
  useEffect(() => {
    const g = gameRef.current;
    const pool = g && g.pool;
    const prng = mulberry32((Math.floor(Math.random() * 0x7fffffff)) >>> 0);
    prngRef.current = prng;
    const positions = layoutPiles(pq.piles, prng, PILE_LAYOUT);
    pilesRef.current = positions.map((p) => buildPile(pool, prng, {
      cols: pq.cols, total: randTotal(prng), validBudget: randValid(prng), x: p.x, y: p.y, z: p.z,
    }));
    // empezar mirando un montón con válidas
    const startIdx = pilesRef.current.findIndex(pileHasValid);
    const focusIdx = startIdx >= 0 ? startIdx : Math.floor(pq.piles / 2);
    camRef.current = { phase: 'hold', phaseT: 0, phaseDur: CAM.holdMin, fromYaw: 0, toYaw: 0, focusIdx };
    const w0 = pilesRef.current[focusIdx];
    if (w0) { camRef.current.toYaw = faceYaw(w0.x, w0.z); camRef.current.fromYaw = camRef.current.toYaw; }
    bump();
    bumpState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reubica (rellena en sitio nuevo) los montones SIN válidas que no estén enfocados,
  // para que siempre haya objetivos frescos repartidos por el arco.
  const relocateStale = (cam, g) => {
    const prng = prngRef.current;
    const piles = pilesRef.current;
    for (let i = 0; i < piles.length; i += 1) {
      if (i === cam.focusIdx) continue;
      // no reubicar el montón que tiene la definición activa (la dejaría fuera de vista)
      if (defInjRef.current && defInjRef.current.pileId === piles[i].id) continue;
      if (pileHasValid(piles[i])) continue;
      const pos = randomPilePos(prng, PILE_LAYOUT);
      buildPile(g.pool, prng, {
        cols: pq.cols, total: randTotal(prng), validBudget: randValid(prng),
        x: pos.x, y: pos.y, z: pos.z, pile: piles[i],
      });
      bump();
    }
  };

  // ---- transición de fase de la cámara (HOLD ↔ TURN; nunca avanza) ----
  const nextPhase = (cam, g) => {
    const prng = prngRef.current;
    const piles = pilesRef.current;
    if (cam.phase === 'hold') {
      relocateStale(cam, g); // refrescar montones agotados antes de elegir nuevo foco
      const cand = piles.map((_, i) => i).filter((i) => pileHasValid(piles[i]));
      const opts = cand.length ? cand : piles.map((_, i) => i);
      let idx = cam.focusIdx;
      if (opts.length > 1) {
        let t = 0;
        do { idx = opts[Math.floor(prng() * opts.length)]; t += 1; } while (idx === cam.focusIdx && t < 8);
      } else idx = opts.length ? opts[0] : cam.focusIdx;
      cam.focusIdx = idx;
      const w = piles[idx];
      cam.fromYaw = cam.toYaw; cam.toYaw = w ? faceYaw(w.x, w.z) : 0;
      cam.phase = 'turn'; cam.phaseT = 0; cam.phaseDur = CAM.turnDur;
    } else {
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

    // --- pose base: yaw interpolado de sección + alabeo + respiración (mínima) ---
    const s = smooth(clamp(cam.phaseDur > 0 ? cam.phaseT / cam.phaseDur : 1, 0, 1));
    const baseYaw = lerp(cam.fromYaw, cam.toYaw, s);
    const turnDelta = clamp(cam.toYaw - cam.fromYaw, -0.6, 0.6); // alabeo acotado (giro calmado)
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

    // --- DEFINICIÓN sin resaltar: garantizar la palabra-respuesta en un montón ---
    const def = g.activeDef;
    const inj = defInjRef.current;
    if (def && (!inj || inj.word !== def.word)) {
      if (inj && inj.saved) restoreBox(pileById(inj.pileId), inj.boxId, inj.saved);
      // inyectar SIEMPRE en el montón que la cámara mira (foco); si está vacío, el
      // montón no vacío más cercano en yaw a donde apunta la cámara (así es visible).
      const focus = pilesRef.current[cam.focusIdx];
      let w = (focus && !pileEmpty(focus)) ? focus : null;
      if (!w) {
        let bestD = Infinity;
        for (const x of pilesRef.current) {
          if (pileEmpty(x)) continue;
          const d = Math.abs(faceYaw(x.x, x.z) - cam.toYaw);
          if (d < bestD) { bestD = d; w = x; }
        }
      }
      const res = w ? injectWord(w, def.word, def.points || 5) : null;
      defInjRef.current = res ? { word: def.word, pileId: w.id, boxId: res.boxId, saved: res.saved } : null;
      // contar la definición como "presentada" UNA sola vez (aunque se reinyecte tras
      // reubicar el montón): el flag activeDefCounted lo resetea el shell por def.
      if (res) {
        if (!g.activeDefCounted) { g.defPresented += 1; g.activeDefCounted = true; }
        bump();
      }
    } else if (!def && inj) {
      if (inj.saved) restoreBox(pileById(inj.pileId), inj.boxId, inj.saved);
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
        // refrescar las matrices de mundo de los montones ESTE frame (gravedad/reubicación):
        // r3f las recalcula tras los useFrame, así que sin esto el disparo impactaría
        // donde estaban el frame anterior.
        if (groupRef.current) groupRef.current.updateWorldMatrix(false, true);
        const inter = groupRef.current ? raycaster.intersectObjects(groupRef.current.children, true) : [];
        let mesh = null; let point = null;
        for (const h of inter) {
          let o = h.object;
          while (o && (o.userData == null || o.userData.targetId == null)) o = o.parent;
          if (o && o.userData.targetId != null) { mesh = o; point = h.point; break; }
        }
        if (mesh) {
          const w = pileById(mesh.userData.wallId);
          const box = w && w.boxes.get(mesh.userData.targetId);
          if (box) {
            const isDef = !!g.activeDef && box.text.trim().toLowerCase() === g.activeDef.word.trim().toLowerCase();
            // al fallar (palabra NO válida y no es la respuesta) desaparecen válidas
            let removedValid = 0;
            if (!isDef && !box.valid) removedValid = removeValidBoxes(w, mesh.userData.targetId, WRONG_REMOVES_VALID);
            // FX/color NEUTROS (no revelan el valor): el alumno lo deduce por categoría
            fxRef.current?.onHit(point, '#9fc7ff', { combo: g.combo || 0, power: 1.2 });
            g.shake = Math.max(g.shake || 0, removedValid > 0 ? 0.4 : 0.28);
            onHit?.({
              kind: 'word', text: box.text, value: box.value, valid: box.valid, removedValid,
            });
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

    // re-render React solo si cambió la estructura de algún montón (no por frame)
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
        {pilesRef.current.map((w) => (
          <WordWall key={w.id} wall={w} />
        ))}
      </group>
    </>
  );
}
