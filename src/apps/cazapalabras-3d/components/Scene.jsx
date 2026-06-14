// Escena de juego: luces, entorno, cámara en primera persona (orientación por
// arrastre + avance) y gestor de objetivos (spawn / movimiento / raycast de
// disparo desde el CENTRO de la pantalla / estallidos). Toda la lógica de
// puntuación vive en el shell; aquí solo se emite onHit(data) por cada impacto.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Target from './Target';
import Environment from './Environment';
import ImpactFX from './ImpactFX';
import { SPECIAL_GOOD, SPECIALS, TIERS } from '../engine/config';

const prefersReducedMotion = () => typeof window !== 'undefined'
  && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let TID = 0;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const YAW_MAX = 0.85;
const PITCH_MAX = 0.5;

// Estilo de movimiento de cada palabra. Las de más valor y la respuesta usan
// estilos siempre legibles (sin giro completo); las comunes pueden voltear.
function pickStyle(isAnswer, points) {
  if (isAnswer) return pick(['drift', 'weave', 'rise']);
  if (points >= 5) return pick(['drift', 'weave', 'spiral']);
  if (points >= 2) return pick(['drift', 'weave', 'spiral', 'rise']);
  return pick(['drift', 'weave', 'spiral', 'rise', 'tumble']);
}

function buildMotion(style) {
  const m = {
    weaveAmpX: 0, weaveFreqX: 0, weavePhX: 0,
    weaveAmpY: 0, weaveFreqY: 0, weavePhY: 0,
    yawAmp: rnd(0.12, 0.30), yawFreq: rnd(0.5, 1.1), yawPh: rnd(0, 6),
    pitchAmp: rnd(0.05, 0.14), pitchFreq: rnd(0.5, 1.0), pitchPh: rnd(0, 6),
    rollAmp: rnd(0.03, 0.10), rollFreq: rnd(0.4, 0.9), rollPh: rnd(0, 6),
    spinY: 0,
    bobAmp: rnd(0.06, 0.22), bobFreq: rnd(0.5, 1.2), phase: rnd(0, 6),
  };
  switch (style) {
    case 'weave':
      m.weaveAmpX = rnd(1.2, 2.4); m.weaveFreqX = rnd(0.5, 0.9); m.weavePhX = rnd(0, 6);
      break;
    case 'spiral':
      m.weaveAmpX = rnd(0.8, 1.6); m.weaveFreqX = rnd(0.6, 1.0); m.weavePhX = rnd(0, 6);
      m.weaveAmpY = rnd(0.5, 1.1); m.weaveFreqY = rnd(0.6, 1.0); m.weavePhY = rnd(0, 6);
      break;
    case 'rise':
      m.weaveAmpY = rnd(0.8, 1.6); m.weaveFreqY = rnd(0.4, 0.8); m.weavePhY = rnd(0, 6);
      m.pitchAmp = rnd(0.10, 0.20);
      break;
    case 'tumble':
      m.spinY = rnd(0.5, 1.0) * (Math.random() < 0.5 ? -1 : 1); m.yawAmp = 0;
      m.rollAmp = rnd(0.08, 0.18);
      break;
    default: break; // drift: solo balanceo base
  }
  return m;
}

export default function Scene({ gameRef, controlRef, onHit, quality, tier }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const fxRef = useRef();
  const [targets, setTargets] = useState([]);
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const spawnAcc = useRef(0);
  const answerWord = useRef(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const reduceMotion = useMemo(prefersReducedMotion, []);
  const budget = quality?.particleBudget ?? 0.8;

  const removeTarget = useCallback((id) => {
    setTargets((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const spawnTarget = useCallback((forceWord, isAnswer) => {
    const g = gameRef.current;
    const pool = g.pool;
    const p = g.params;
    if (!pool || !pool.words.length) return;

    let kind = 'word';
    let special = null;
    let text = null;
    let points = 1;
    let penalty = false;

    if (!isAnswer) {
      const r = Math.random();
      if (r < p.bombChance) { kind = 'special'; special = 'bomb'; }
      else if (r < p.bombChance + p.specialChance) {
        kind = 'special';
        special = SPECIAL_GOOD[Math.floor(Math.random() * SPECIAL_GOOD.length)];
      }
    }
    if (kind === 'word') {
      if (forceWord) { text = forceWord.text; points = forceWord.points; } // respuesta de definición: nunca penaliza
      else {
        const wd = pool.words[Math.floor(Math.random() * pool.words.length)];
        text = wd.text; points = wd.points; penalty = !!wd.penalty;
      }
    }

    const max = p.maxTargets + (isAnswer ? 5 : 0);
    const motion = kind === 'word' ? buildMotion(pickStyle(isAnswer, points)) : {
      bobAmp: rnd(0.08, 0.26), bobFreq: rnd(0.5, 1.2), phase: Math.random() * 6,
      weaveAmpX: rnd(0, 0.6), weaveFreqX: rnd(0.4, 0.9), weavePhX: rnd(0, 6),
    };
    setTargets((ts) => {
      if (ts.length >= max) return ts;
      return [...ts, {
        id: ++TID, kind, special, text, points, penalty, isAnswer: !!isAnswer,
        design: Math.floor(rnd(0, 4)),
        x: rnd(-5.2, 5.2), y: rnd(1.2, 4.2), z: rnd(-48, -40),
        vz: rnd(p.speed[0], p.speed[1]),
        ...motion,
      }];
    });
  }, [gameRef]);

  useFrame((state, dt) => {
    const g = gameRef.current;
    const c = controlRef.current;

    // --- cámara: mouse-look del jugador (c.yaw/c.pitch) SOBRE un rumbo
    // PROCEDURAL impredecible (sumas de senos con frecuencias inconmensurables +
    // componente lenta para giros amplios), con alabeo (banking) y vaivén → da
    // sensación de volar un recorrido cambiante. El jugador corrige con el ratón.
    const tt = state.clock.elapsedTime;
    const mo = reduceMotion ? 0.12 : 1; // accesibilidad: casi sin movimiento procedural
    const procYaw = (0.07 * Math.sin(tt * 0.31 + 0.6)
                   + 0.05 * Math.sin(tt * 0.137 + 2.1)
                   + 0.06 * Math.sin(tt * 0.083 + 4.0)) * mo;
    const procPitch = (0.035 * Math.sin(tt * 0.27 + 1.3)
                     + 0.025 * Math.sin(tt * 0.119 + 3.2)) * mo;
    const bank = (0.10 * Math.sin(tt * 0.23 + 0.9)
                + 0.06 * Math.sin(tt * 0.061 + 2.7)) * mo; // alabeo de los giros (solo visual: no mueve la mirilla)
    const yaw = procYaw + Math.max(-YAW_MAX, Math.min(YAW_MAX, c.yaw));
    const pitch = procPitch + Math.max(-PITCH_MAX, Math.min(PITCH_MAX, c.pitch));
    euler.set(pitch, yaw, bank, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    camera.position.set(
      (Math.sin(tt * 0.41) * 0.35 + Math.sin(tt * 0.17 + 1.0) * 0.25) * mo,
      2.4 + (Math.sin(tt * 0.53) * 0.10 + Math.sin(tt * 0.23 + 2.0) * 0.06) * mo,
      7,
    );

    if (!g.running || g.paused) return;
    const p = g.params;

    // --- spawn por intervalo ---
    spawnAcc.current += dt * 1000;
    if (spawnAcc.current >= p.spawnMs) {
      spawnAcc.current -= p.spawnMs;
      spawnTarget();
    }

    // --- target-respuesta de la definición activa ---
    const def = g.activeDef; // { word, points } | null
    if (def && answerWord.current !== def.word) {
      answerWord.current = def.word;
      spawnTarget({ text: def.word, points: def.points || 5 }, true);
    } else if (!def && answerWord.current) {
      answerWord.current = null;
      setTargets((ts) => ts.filter((t) => !t.isAnswer));
    }

    // --- disparo: raycast desde el centro (mirilla), con cooldown de cadencia ---
    if (c.shootQueued) {
      c.shootQueued = false;
      const now = performance.now();
      if (now >= (g.nextShotAt || 0)) {
        g.nextShotAt = now + (g.rapid ? 110 : (p.fireCooldownMs || 320));
        fxRef.current?.onShoot();
        g.shake = Math.max(g.shake || 0, 0.12); // leve retroceso
        // recomponer matrixWorld desde el position/quaternion ya fijados ESTE frame:
        // r3f la actualiza tras los useFrame, así que sin esto el rayo iría 1 frame
        // tarde (al girar rápido el disparo no coincidiría con la mirilla pintada).
        camera.updateMatrixWorld();
        raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        const inter = groupRef.current ? raycaster.intersectObjects(groupRef.current.children, true) : [];
        let hitId = null;
        let point = null;
        for (const h of inter) {
          let o = h.object;
          while (o && (o.userData == null || o.userData.targetId == null)) o = o.parent;
          if (o && o.userData.targetId != null) { hitId = o.userData.targetId; point = h.point; break; }
        }
        if (hitId != null) {
          const data = targetsRef.current.find((t) => t.id === hitId);
          if (data) {
            const col = data.kind === 'special'
              ? (SPECIALS[data.special]?.color || '#fff')
              : (data.penalty ? '#ef4444' : (TIERS[data.points]?.color || '#fff'));
            const power = data.kind === 'special'
              ? (data.special === 'bomb' ? 2 : data.special === 'gem' ? 2 : 1.5)
              : (data.penalty ? 1.8 : data.isAnswer ? 2 : data.points >= 5 ? 1.6 : 1);
            fxRef.current?.onHit(point, col, { combo: g.combo || 0, power });
            g.shake = Math.max(g.shake || 0, data.kind === 'special' ? 0.45 : 0.22 + power * 0.06);
            onHit?.(data);
            removeTarget(hitId);
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
  });

  const Q = quality || {};
  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fogExp2 attach="fog" args={['#070a18', 0.014]} />
      <ambientLight intensity={0.4} />
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
        {targets.map((t) => (
          <Target key={t.id} data={t} onExpire={removeTarget} />
        ))}
      </group>
    </>
  );
}
