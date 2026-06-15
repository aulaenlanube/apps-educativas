// Simulación 3 — Muelles y ley de Hooke (2º ESO).
// Muelle vertical con masa colgada y amortiguación ligera: oscila y se asienta
// en el alargamiento de equilibrio x_eq = m·g/k (la "báscula de muelle").
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt } from '../engine/rng';

const G = 9.8;
const L0 = 2.4;     // longitud natural visual del muelle (unidades de escena)
const VSY = 5;      // 1 m de alargamiento real = 5 unidades visuales (exagerado para verse)
const TOP_Y = 7.2;  // anclaje al techo

function reinit(world, params) {
  const xEq = (params.masa * G) / params.k;
  world.t = 0;
  world._acc = 0;
  world.data = {
    x: xEq + params.extra, // alargamiento (m) desde la longitud natural, + hacia abajo
    v: 0,
    settled: false,
    done: false,
  };
}

// Muelle como hélice de bolitas instanciadas, actualizado a 60 fps vía ref
function SpringCoil({ world, params }) {
  const ref = useRef(null);
  const N = 70;
  const mat = useMemo(() => new THREE.Matrix4(), []);
  useFrame(() => {
    const d = world.data;
    const inst = ref.current;
    if (!d || !inst) return;
    const len = L0 + d.x * VSY;
    const coils = 9;
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      mat.setPosition(
        Math.cos(u * coils * Math.PI * 2) * 0.42,
        TOP_Y - u * len,
        Math.sin(u * coils * Math.PI * 2) * 0.42,
      );
      inst.setMatrixAt(i, mat);
    }
    inst.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[0.075, 8, 8]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
    </instancedMesh>
  );
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const massRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world, paramsRef.current);
  }, [world, params.k, params.masa, params.extra]);

  useFixedStep(world, playing, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    // amortiguación ligera (15% de la crítica): oscila y se asienta
    const c = 0.15 * 2 * Math.sqrt(p.k * p.masa);
    const a = G - (p.k / p.masa) * d.x - (c / p.masa) * d.v;
    d.v += a * dt;
    d.x += d.v * dt;
    const xEq = (p.masa * G) / p.k;
    d.settled = Math.abs(d.v) < 0.01 && Math.abs(d.x - xEq) < 0.004;
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (massRef.current) massRef.current.position.y = TOP_Y - L0 - d.x * VSY - 0.45;
    const p = paramsRef.current;
    const xEq = (p.masa * G) / p.k;
    onTelemetry?.({
      t: world.t,
      done: false,
      readouts: [
        { label: 'Alargamiento x', value: d.x * 100, unit: 'cm', decimals: 1 },
        { label: 'F del muelle', value: p.k * d.x, unit: 'N', decimals: 1 },
        { label: 'x equilibrio teórico', value: xEq * 100, unit: 'cm', decimals: 1 },
        { label: 'Peso', value: p.masa * G, unit: 'N', decimals: 1 },
      ],
      series: { x: d.x * 100 },
      formulaViva: `F = k·x = ${fmt(p.k, 0)} · ${fmt(d.x, 3)} = ${fmt(p.k * d.x, 1)} N`,
      extra: { xEq, settled: d.settled, x: d.x },
    });
  });

  const d = world.data || { x: 0.1, v: 0 };
  const p = params;
  const massY = TOP_Y - L0 - d.x * VSY - 0.45;
  const xEq = (p.masa * G) / p.k;
  const eqY = TOP_Y - L0 - xEq * VSY - 0.45;

  return (
    <group>
      {/* suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 40]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* techo / soporte */}
      <mesh position={[0, TOP_Y + 0.2, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[3.4, 0.34, 1.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>

      <SpringCoil world={world} params={p} />

      {/* masa colgada */}
      <mesh ref={massRef} position={[0, massY, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[0.95, 0.9, 0.95]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.5} metalness={0.2} />
      </mesh>
      <Billboard position={[1.35, massY, 0]}>
        <Texto3D fontSize={0.34} color="#e2e8f0" anchorX="left">{fmt(p.masa, 2)} kg</Texto3D>
      </Billboard>

      {/* marca del equilibrio teórico */}
      <group position={[0, eqY, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 4.4, 6]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
        </mesh>
        <Billboard position={[-2.7, 0, 0]}>
          <Texto3D fontSize={0.3} color="#fbbf24" anchorX="center">x_eq = {fmt(xEq * 100, 1)} cm</Texto3D>
        </Billboard>
      </group>

      {/* vectores */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={[0.75, massY + 0.3, 0]}
            dir={[0, 1, 0]}
            length={Math.min(2.8, p.k * d.x * 0.05 + 0.15)}
            color="#4ade80"
            label={`F muelle = ${fmt(p.k * d.x, 1)} N`}
          />
          <VectorArrow
            origin={[-0.75, massY - 0.3, 0]}
            dir={[0, -1, 0]}
            length={Math.min(2.8, p.masa * G * 0.05 + 0.15)}
            color="#f87171"
            label={`P = ${fmt(p.masa * G, 1)} N`}
          />
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'muelles',
  nombre: 'Muelles y ley de Hooke',
  icono: '🪀',
  descripcion: 'Cuelga masas de un muelle y comprueba la ley de Hooke: F = k·x.',
  curso: { level: 'eso', grade: 2 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'k', label: 'Constante del muelle k', min: 20, max: 300, step: 5, def: 100, unit: 'N/m' },
    { key: 'masa', label: 'Masa colgada', min: 0.5, max: 5, step: 0.25, def: 1.5, unit: 'kg', decimals: 2 },
    { key: 'extra', label: 'Estirón inicial extra', min: 0, max: 0.4, step: 0.05, def: 0.15, unit: 'm', decimals: 2 },
  ],
  graficas: [
    { key: 'x', label: 'alargamiento (cm)', color: '#67e8f9' },
  ],
  formulas: [
    { titulo: 'Ley de Hooke', expr: 'F = k·x', leyenda: 'k: constante (N/m) · x: alargamiento (m)' },
    { titulo: 'Equilibrio', expr: 'x_eq = m·g / k', leyenda: 'el muelle estira hasta equilibrar el peso' },
  ],
  fondo: () => '#101b33',
  camara: { position: [7, 5, 9], fov: 45 },
  controles: { target: [0, 3.5, 0], maxDistance: 30 },
  Scene,
  retos: [
    {
      id: 'bascula',
      titulo: 'Calibra la báscula',
      descripcion: 'Consigue que el muelle se asiente con un alargamiento de equilibrio entre 18 y 22 cm.',
      pista: 'x_eq = m·g/k. Por ejemplo: 2 kg y k = 98 N/m dan exactamente 20 cm.',
      check: (tel) => tel.extra?.settled && tel.extra.xEq >= 0.18 && tel.extra.xEq <= 0.22,
    },
    {
      id: 'muelle-duro',
      titulo: 'Muelle de camión',
      descripcion: 'Con 2 kg o más colgados, que el alargamiento de equilibrio no llegue a 8 cm.',
      pista: 'Para estirar poco con mucho peso necesitas una k grande.',
      check: (tel, p) => tel.extra?.settled && p.masa >= 2 && tel.extra.xEq < 0.08,
    },
    {
      id: 'blandito',
      titulo: 'Blandito extremo',
      descripcion: 'Supera los 35 cm de alargamiento de equilibrio sin pasar de 1,5 kg.',
      pista: 'Poca masa pero mucho estirón → k muy pequeña.',
      check: (tel, p) => tel.extra?.settled && p.masa <= 1.5 && tel.extra.xEq > 0.35,
    },
  ],
  examTemplates: [
    {
      id: 'alargamiento-eq',
      generar: (rng) => {
        const m = randInt(rng, 1, 5);
        const k = randInt(rng, 4, 24) * 10;
        const x = (m * G) / k;
        return {
          enunciado: `Colgamos ${m} kg de un muelle de k = ${k} N/m. ¿Cuánto se alarga al quedar en equilibrio? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: x,
          toleranciaAbs: 0.005,
          simParams: { k, masa: m, extra: 0 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Por qué el muelle deja de estirarse justo ahí?',
            opciones: [
              'Porque la fuerza del muelle k·x iguala al peso m·g',
              'Porque el muelle se queda sin elasticidad',
              'Porque la gravedad deja de actuar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'calcula-k',
      generar: (rng) => {
        const m = randInt(rng, 1, 4);
        const xCm = randInt(rng, 10, 40);
        const k = (m * G) / (xCm / 100);
        return {
          enunciado: `Un muelle se alarga ${xCm} cm al colgarle ${m} kg. ¿Cuánto vale su constante k? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'N/m',
          respuesta: k,
          toleranciaAbs: 0.5,
          simParams: { k: Math.round(k), masa: m, extra: 0 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Qué significa una k grande?',
            opciones: [
              'Que el muelle es duro: hace falta mucha fuerza para estirarlo',
              'Que el muelle es muy largo',
              'Que el muelle es blando y fácil de estirar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-masa',
      generar: (rng) => {
        const m = randInt(rng, 1, 2);
        return {
          enunciado: `Un muelle se alarga x al colgarle ${m} kg. Sin pasarse del límite elástico, ¿cuánto se alargará con ${m * 2} kg?`,
          tipo: 'opciones',
          opciones: ['Lo mismo: x', 'El doble: 2·x', 'Cuatro veces más: 4·x'],
          correcta: 1,
          simParams: { k: 80, masa: m * 2, extra: 0 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Qué propiedad de la ley de Hooke estás usando?',
            opciones: [
              'Que la fuerza y el alargamiento son proporcionales (relación lineal)',
              'Que la fuerza depende del cuadrado del alargamiento',
              'Que todos los muelles tienen la misma k',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'fuerza-muelle',
      generar: (rng) => {
        const k = randInt(rng, 5, 25) * 10;
        const xCm = randInt(rng, 5, 35);
        const F = k * (xCm / 100);
        return {
          enunciado: `Un muelle de k = ${k} N/m está estirado ${xCm} cm. ¿Qué fuerza está haciendo?`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: F,
          toleranciaAbs: 0.2,
          simParams: { k, masa: Math.max(0.5, Math.round((F / G) * 4) / 4), extra: 0 },
          simDuracion: 4,
          explica: {
            pregunta: '¿En qué sentido actúa esa fuerza del muelle estirado?',
            opciones: [
              'Hacia arriba: se opone al estiramiento intentando recuperar su longitud',
              'Hacia abajo: acompaña al peso',
              'No tiene sentido definido',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
