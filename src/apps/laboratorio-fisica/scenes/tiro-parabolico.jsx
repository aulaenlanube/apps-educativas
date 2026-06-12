// Simulación — Tiro parabólico (1º Bachillerato).
// Composición de movimientos: vx constante + vy con gravedad. La descomposición
// del vector velocidad en vx (cian) y vy (amarillo) es el oro didáctico.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const G = 9.8;
const VS = 0.12;          // 1 m real = 0,12 unidades (caben 120 m)
const MASA = 2;           // kg (fija)
const KD = 0.5 * 1.2 * 0.47 * Math.PI * 0.15 * 0.15; // drag cuadrático de la bola

function reinit(world, params) {
  const rad = (params.angulo * Math.PI) / 180;
  world.t = 0;
  world._acc = 0;
  world.data = {
    x: 0,
    y: params.h0,
    vx: params.v0 * Math.cos(rad),
    vy: params.v0 * Math.sin(rad),
    hMax: params.h0,
    trail: [],
    lastTrailT: 0,
    alcance: null,
    tVuelo: null,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, showTrajectory, quality, onTelemetry }) {
  const bolaRef = useRef(null);
  const trailRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.v0, params.angulo, params.h0, params.aire]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    let ax = 0;
    let ay = -G;
    if (p.aire) {
      const v = Math.hypot(d.vx, d.vy);
      ax -= (KD / MASA) * v * d.vx;
      ay -= (KD / MASA) * v * d.vy;
    }
    d.vx += ax * dt;
    d.vy += ay * dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.y > d.hMax) d.hMax = d.y;
    if (world.t - d.lastTrailT > 0.08 && d.trail.length < 110) {
      d.trail.push([d.x, d.y]);
      d.lastTrailT = world.t;
    }
    if (d.y <= 0 && world.t > 0.05) {
      d.y = 0;
      d.alcance = d.x;
      d.tVuelo = world.t;
      d.done = true;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (bolaRef.current) bolaRef.current.position.set(d.x * VS, d.y * VS + 0.25, 0);
    const inst = trailRef.current;
    if (inst) {
      const m = new THREE.Matrix4();
      const n = showTrajectory ? d.trail.length : 0;
      for (let i = 0; i < n; i++) {
        m.setPosition(d.trail[i][0] * VS, d.trail[i][1] * VS + 0.25, 0);
        inst.setMatrixAt(i, m);
      }
      inst.count = n;
      inst.instanceMatrix.needsUpdate = true;
    }
    const v = Math.hypot(d.vx, d.vy);
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Tiempo', value: world.t, unit: 's', decimals: 2 },
        { label: 'Distancia x', value: d.x, unit: 'm', decimals: 1 },
        { label: 'Altura y', value: d.y, unit: 'm', decimals: 1 },
        { label: 'Velocidad', value: v, unit: 'm/s', decimals: 1 },
      ],
      series: { y: d.y, x: d.x },
      formulaViva: `x = v₀·cosθ·t = ${fmt(d.x, 1)} m · y = h₀ + v₀·senθ·t − ½·g·t² = ${fmt(d.y, 1)} m`,
      extra: { alcance: d.alcance, hMax: d.hMax, tVuelo: d.tVuelo },
    });
  });

  const d = world.data || { x: 0, y: params.h0, vx: 1, vy: 1 };
  const p = params;
  const rad = (p.angulo * Math.PI) / 180;
  const bolaPos = [d.x * VS, d.y * VS + 0.25, 0];
  // alcance teórico sin aire desde h0 = 0 (banderín solo en ese caso)
  const alcanceTeorico = (p.v0 * p.v0 * Math.sin(2 * rad)) / G;

  return (
    <group>
      {/* suelo con marcas cada 10 m */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 10]} />
        <meshStandardMaterial color="#1e4d2b" roughness={0.95} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => i * 10).map((m) => (
        <group key={m} position={[m * VS, 0.02, 1.8]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 0.6]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Billboard position={[0, 0.4, 0.5]}>
            <Text fontSize={0.26} color="#cbd5e1" anchorX="center">{m}</Text>
          </Billboard>
        </group>
      ))}

      {/* cañón sobre plataforma a h0 */}
      <group position={[0, p.h0 * VS, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow={quality.shadows}>
          <boxGeometry args={[1, 0.24, 1]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
        <mesh position={[Math.cos(rad) * 0.55, 0.25 + Math.sin(rad) * 0.55, 0]} rotation={[0, 0, rad - Math.PI / 2]} castShadow={quality.shadows}>
          <cylinderGeometry args={[0.14, 0.18, 1.3, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
      {p.h0 > 0 && (
        <mesh position={[0, (p.h0 * VS) / 2, 0]} castShadow={quality.shadows}>
          <boxGeometry args={[0.5, p.h0 * VS, 0.5]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
      )}

      {/* banderín del alcance teórico (solo h0 = 0, sin aire) */}
      {p.h0 === 0 && !p.aire && (
        <group position={[alcanceTeorico * VS, 0, -1.4]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <Billboard position={[0, 1.3, 0]}>
            <Text fontSize={0.3} color="#4ade80" anchorX="center">R teórico = {fmt(alcanceTeorico, 1)} m</Text>
          </Billboard>
        </group>
      )}

      {/* trayectoria */}
      <instancedMesh ref={trailRef} args={[undefined, undefined, 110]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
      </instancedMesh>

      {/* proyectil */}
      <mesh ref={bolaRef} position={bolaPos} castShadow={quality.shadows}>
        <sphereGeometry args={[0.22, 18, 18]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.35} />
      </mesh>

      {/* descomposición del vector velocidad */}
      {showVectors && !d.done && (
        <group>
          {Math.hypot(d.vx, d.vy) > 0.5 && (
            <VectorArrow origin={bolaPos} dir={[d.vx, d.vy, 0]} length={Math.min(2.4, Math.hypot(d.vx, d.vy) * 0.045 + 0.15)} color="#4ade80" label={`v = ${fmt(Math.hypot(d.vx, d.vy), 1)}`} thickness={0.035} />
          )}
          {Math.abs(d.vx) > 0.5 && (
            <VectorArrow origin={bolaPos} dir={[Math.sign(d.vx), 0, 0]} length={Math.min(2, Math.abs(d.vx) * 0.045 + 0.1)} color="#22d3ee" label="vx" thickness={0.03} />
          )}
          {Math.abs(d.vy) > 0.5 && (
            <VectorArrow origin={bolaPos} dir={[0, Math.sign(d.vy), 0]} length={Math.min(2, Math.abs(d.vy) * 0.045 + 0.1)} color="#facc15" label="vy" thickness={0.03} />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'tiro-parabolico',
  nombre: 'Tiro parabólico',
  icono: '🎯',
  descripcion: 'Composición de movimientos: ajusta velocidad y ángulo, traza la parábola y caza el alcance máximo.',
  curso: { level: 'bachillerato', grade: 1 },
  paramsDef: [
    { key: 'v0', label: 'Velocidad inicial v₀', min: 5, max: 50, step: 1, def: 25, unit: 'm/s' },
    { key: 'angulo', label: 'Ángulo de lanzamiento', min: 10, max: 80, step: 1, def: 45, unit: '°' },
    { key: 'h0', label: 'Altura de lanzamiento', min: 0, max: 20, step: 1, def: 0, unit: 'm' },
    { key: 'aire', label: 'Resistencia del aire', type: 'toggle', def: false },
  ],
  graficas: [
    { key: 'y', label: 'altura (m)', color: '#facc15' },
    { key: 'x', label: 'distancia (m)', color: '#22d3ee' },
  ],
  formulas: [
    { titulo: 'Alcance (h₀ = 0)', expr: 'R = v₀²·sen(2θ) / g', leyenda: 'máximo con θ = 45°' },
    { titulo: 'Altura máxima', expr: 'h = (v₀·senθ)² / (2g)', leyenda: 'solo cuenta la componente vertical' },
    { titulo: 'Tiempo de vuelo (h₀ = 0)', expr: 't = 2·v₀·senθ / g', leyenda: 'subir y bajar tardan lo mismo' },
  ],
  fondo: () => '#0c1f3d',
  camara: { position: [8, 5, 13], fov: 50 },
  controles: { target: [6, 2, 0], maxDistance: 40, enablePan: true },
  Scene,
  retos: [
    {
      id: 'diana-a-50',
      titulo: 'Diana a 50 m',
      descripcion: 'Sin aire y desde el suelo (h₀ = 0), consigue un alcance entre 48 y 52 m.',
      pista: 'R = v₀²·sen(2θ)/g. A 45°: v₀ = √(R·g) ≈ 22 m/s.',
      check: (tel, p) => tel.done && !p.aire && p.h0 === 0
        && tel.extra?.alcance >= 48 && tel.extra?.alcance <= 52,
    },
    {
      id: 'angulo-magico',
      titulo: 'El ángulo mágico',
      descripcion: 'Con v₀ = 30 m/s exactos, sin aire y h₀ = 0, supera los 91 m de alcance.',
      pista: 'El alcance máximo teórico de 30 m/s es 91,8 m… ¿con qué ángulo se consigue?',
      check: (tel, p) => tel.done && !p.aire && p.h0 === 0 && p.v0 === 30
        && tel.extra?.alcance >= 91,
    },
    {
      id: 'obus',
      titulo: 'Obús de feria',
      descripcion: 'Alcanza una altura máxima de 40 m o más.',
      pista: 'h = (v₀·senθ)²/(2g): necesitas mucha v₀ y un ángulo muy vertical.',
      check: (tel) => tel.done && tel.extra?.hMax >= 40,
    },
    {
      id: 'contra-el-viento',
      titulo: 'Contra el aire',
      descripcion: 'Con la resistencia del aire activada, supera los 45 m de alcance.',
      pista: 'El aire roba alcance: compensa con velocidad alta y un ángulo algo más bajo que 45°.',
      check: (tel, p) => tel.done && p.aire && tel.extra?.alcance >= 45,
    },
  ],
  examTemplates: [
    {
      id: 'alcance',
      generar: (rng) => {
        const v0 = randInt(rng, 15, 40);
        const ang = pick(rng, [30, 37, 45, 53, 60]);
        const rad = (ang * Math.PI) / 180;
        const R = (v0 * v0 * Math.sin(2 * rad)) / G;
        return {
          enunciado: `Se lanza un proyectil desde el suelo con v₀ = ${v0} m/s y ángulo ${ang}°, sin aire. ¿Qué alcance tiene? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: R,
          toleranciaAbs: 0.5,
          simParams: { v0, angulo: ang, h0: 0, aire: false },
          simDuracion: (2 * v0 * Math.sin(rad)) / G + 1,
          explica: {
            pregunta: '¿Por qué el alcance es máximo a 45°?',
            opciones: [
              'Porque sen(2θ) vale 1 justo cuando 2θ = 90°',
              'Porque a 45° la gravedad afecta menos',
              'Porque a 45° el proyectil va más rápido',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'altura-maxima',
      generar: (rng) => {
        const v0 = randInt(rng, 15, 40);
        const ang = pick(rng, [30, 45, 60, 70]);
        const rad = (ang * Math.PI) / 180;
        const h = (v0 * Math.sin(rad)) ** 2 / (2 * G);
        return {
          enunciado: `Mismo lanzamiento: v₀ = ${v0} m/s a ${ang}° desde el suelo, sin aire. ¿Qué altura máxima alcanza?`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: h,
          toleranciaAbs: 0.3,
          simParams: { v0, angulo: ang, h0: 0, aire: false },
          simDuracion: (2 * v0 * Math.sin(rad)) / G + 1,
          explica: {
            pregunta: '¿Qué vale la velocidad VERTICAL en el punto más alto?',
            opciones: [
              'Cero: toda la velocidad que queda es horizontal',
              'v₀: se conserva entera',
              'g·t: máxima en ese punto',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'tiempo-vuelo',
      generar: (rng) => {
        const v0 = randInt(rng, 15, 40);
        const ang = pick(rng, [30, 45, 60]);
        const rad = (ang * Math.PI) / 180;
        const t = (2 * v0 * Math.sin(rad)) / G;
        return {
          enunciado: `Un proyectil sale del suelo con v₀ = ${v0} m/s a ${ang}°, sin aire. ¿Cuánto dura el vuelo completo?`,
          tipo: 'numerica',
          unidad: 's',
          respuesta: t,
          toleranciaAbs: 0.05,
          simParams: { v0, angulo: ang, h0: 0, aire: false },
          simDuracion: t + 1,
          explica: {
            pregunta: '¿Por qué aparece un 2 en t = 2·v₀·senθ/g?',
            opciones: [
              'Porque subir hasta lo más alto y volver a bajar tardan lo mismo',
              'Porque la gravedad es el doble en la bajada',
              'Por el factor 2 de la energía cinética',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'angulos-complementarios',
      generar: (rng) => {
        const v0 = randInt(rng, 15, 35);
        return {
          enunciado: `Con la misma v₀ = ${v0} m/s lanzamos dos proyectiles: uno a 30° y otro a 60°, sin aire y desde el suelo. ¿Cuál llega más lejos?`,
          tipo: 'opciones',
          opciones: ['El de 30°', 'El de 60°', 'Los dos llegan igual de lejos'],
          correcta: 2,
          simParams: { v0, angulo: 60, h0: 0, aire: false },
          simDuracion: (2 * v0 * Math.sin(Math.PI / 3)) / G + 1,
          explica: {
            pregunta: '¿Por qué empatan?',
            opciones: [
              'Porque sen(60°) = sen(120°): los ángulos complementarios dan el mismo alcance',
              'Porque la gravedad compensa el ángulo',
              'Porque el tiempo de vuelo es el mismo en ambos',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
