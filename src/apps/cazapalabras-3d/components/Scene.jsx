// Escena de juego: luces, entorno, cámara en primera persona (orientación por
// arrastre + avance) y gestor de objetivos (spawn / movimiento / raycast de
// disparo desde el CENTRO de la pantalla / estallidos). Toda la lógica de
// puntuación vive en el shell; aquí solo se emite onHit(data) por cada impacto.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Target from './Target';
import Environment from './Environment';
import { SPECIAL_GOOD, SPECIALS, TIERS } from '../engine/config';

let TID = 0;
const rnd = (a, b) => a + Math.random() * (b - a);
const YAW_MAX = 0.85;
const PITCH_MAX = 0.5;

function Burst({ pos, color, onDone }) {
  const ref = useRef();
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const k = t.current / 0.45;
    if (k >= 1) { onDone(); return; }
    if (ref.current) {
      ref.current.scale.setScalar(0.3 + k * 2.4);
      ref.current.material.opacity = (1 - k) * 0.85;
    }
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export default function Scene({ gameRef, controlRef, onHit, onShoot, quality }) {
  const { camera } = useThree();
  const groupRef = useRef();
  const [targets, setTargets] = useState([]);
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const [bursts, setBursts] = useState([]);
  const spawnAcc = useRef(0);
  const answerWord = useRef(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const budget = quality?.particleBudget ?? 0.8;

  const removeTarget = useCallback((id) => {
    setTargets((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const addBurst = useCallback((pos, color) => {
    const id = ++TID;
    setBursts((b) => [...b, { id, pos: [pos.x, pos.y, pos.z], color }]);
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

    if (!isAnswer) {
      const r = Math.random();
      if (r < p.bombChance) { kind = 'special'; special = 'bomb'; }
      else if (r < p.bombChance + p.specialChance) {
        kind = 'special';
        special = SPECIAL_GOOD[Math.floor(Math.random() * SPECIAL_GOOD.length)];
      }
    }
    if (kind === 'word') {
      if (forceWord) { text = forceWord.text; points = forceWord.points; }
      else {
        const wd = pool.words[Math.floor(Math.random() * pool.words.length)];
        text = wd.text; points = wd.points;
      }
    }

    const max = p.maxTargets + (isAnswer ? 5 : 0);
    setTargets((ts) => {
      if (ts.length >= max) return ts;
      return [...ts, {
        id: ++TID, kind, special, text, points, isAnswer: !!isAnswer,
        x: rnd(-5.5, 5.5), y: rnd(1.1, 4.3), z: rnd(-48, -40),
        vz: rnd(p.speed[0], p.speed[1]), vx: rnd(-0.5, 0.5),
        bobAmp: rnd(0.05, 0.28), bobFreq: rnd(0.4, 1.3), phase: Math.random() * 6,
      }];
    });
  }, [gameRef]);

  useFrame((state, dt) => {
    const g = gameRef.current;
    const c = controlRef.current;

    // --- cámara: orientación por arrastre + avance con leve balanceo ---
    euler.set(
      Math.max(-PITCH_MAX, Math.min(PITCH_MAX, c.pitch)),
      Math.max(-YAW_MAX, Math.min(YAW_MAX, c.yaw)),
      0, 'YXZ',
    );
    camera.quaternion.setFromEuler(euler);
    const tt = state.clock.elapsedTime;
    camera.position.set(Math.sin(tt * 0.5) * 0.18, 2.4 + Math.sin(tt * 0.9) * 0.07, 7);

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
        onShoot?.();
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
              : (TIERS[data.points]?.color || '#fff');
            if (point) addBurst(point, col);
            onHit?.(data);
            removeTarget(hitId);
          }
        }
      }
    }
  });

  const Q = quality || {};
  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 18, 70]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#a5d8ff', '#1e1b3a', 0.6]} />
      <directionalLight
        position={[8, 18, 6]}
        intensity={1.15}
        castShadow={!!Q.shadows}
        shadow-mapSize-width={Q.shadowMapSize || 1024}
        shadow-mapSize-height={Q.shadowMapSize || 1024}
      />
      <pointLight position={[0, 6, 2]} intensity={0.7} color="#38bdf8" distance={40} />
      <pointLight position={[-10, 4, -20]} intensity={0.5} color="#a855f7" distance={50} />

      <Environment budget={budget} />

      <group ref={groupRef}>
        {targets.map((t) => (
          <Target key={t.id} data={t} onExpire={removeTarget} />
        ))}
      </group>

      {bursts.map((b) => (
        <Burst key={b.id} pos={b.pos} color={b.color} onDone={() => setBursts((x) => x.filter((y) => y.id !== b.id))} />
      ))}
    </>
  );
}
