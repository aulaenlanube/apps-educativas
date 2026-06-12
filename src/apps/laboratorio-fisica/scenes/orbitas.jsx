// Simulación — Órbitas y satélites (2º Bachillerato).
// Campo gravitatorio terrestre real (μ = G·M). El satélite se integra con
// time-warp (1 s real = 900 s simulados, determinista) y los elementos
// orbitales (a, e, T, perigeo, apogeo) se calculan ANALÍTICAMENTE del estado.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { G_UNIVERSAL } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const MU = G_UNIVERSAL * 5.972e24;  // 3,986e14 m³/s²
const R_T = 6.371e6;                // radio terrestre (m)
const WARP = 900;                   // 1 s real = 900 s simulados
const ESCALA = R_T / 2;             // 1 unidad de escena = R_T/2 → la Tierra mide 2

// manchas "continentes" fijas (decorativas)
const CONTINENTES = [
  [0.9, 0.7, 1.4], [-1.1, 0.4, 1.2], [0.2, -0.9, 1.5], [-0.7, -0.5, -1.4],
  [1.2, -0.2, -1.1], [-0.3, 1.1, -1], [0.5, 0.2, -1.7],
];

function elementos(d) {
  const r = Math.hypot(d.x, d.y);
  const v2 = d.vx * d.vx + d.vy * d.vy;
  const eps = v2 / 2 - MU / r;
  const h = d.x * d.vy - d.y * d.vx;
  const e = Math.sqrt(Math.max(0, 1 + (2 * eps * h * h) / (MU * MU)));
  if (eps >= 0) return { r, v: Math.sqrt(v2), eps, e, a: null, T: null, rp: null, ra: null };
  const a = -MU / (2 * eps);
  return {
    r, v: Math.sqrt(v2), eps, e, a,
    T: 2 * Math.PI * Math.sqrt((a * a * a) / MU),
    rp: a * (1 - e),
    ra: a * (1 + e),
  };
}

function reinit(world, params) {
  const r0 = R_T + params.altura * 1000;
  world.t = 0;
  world._acc = 0;
  world.data = {
    x: r0, y: 0,
    vx: 0, vy: params.velocidad, // lanzamiento tangencial
    trail: [],
    lastTrailT: 0,
    tSim: 0,
    impacto: false,
    escape: false,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, showTrajectory, quality, onTelemetry }) {
  const satRef = useRef(null);
  const trailRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(10);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.altura, params.velocidad]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    // time-warp determinista con sub-pasos para precisión
    const dtSim = dt * WARP;
    const sub = 10;
    const h = dtSim / sub;
    for (let i = 0; i < sub; i++) {
      const r = Math.hypot(d.x, d.y);
      const a = -MU / (r * r * r); // aceleración = -μ·r̂/r²
      d.vx += a * d.x * h;
      d.vy += a * d.y * h;
      d.x += d.vx * h;
      d.y += d.vy * h;
      if (r < R_T) { d.impacto = true; d.done = true; break; }
    }
    d.tSim += dtSim;
    const el = elementos(d);
    if (el.eps >= 0 && el.r > 12 * R_T) { d.escape = true; d.done = true; }
    if (world.t - d.lastTrailT > 0.06 && d.trail.length < 220) {
      d.trail.push([d.x, d.y]);
      d.lastTrailT = world.t;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (satRef.current) satRef.current.position.set(d.x / ESCALA, 0, d.y / ESCALA);
    const inst = trailRef.current;
    if (inst) {
      const m = new THREE.Matrix4();
      const n = showTrajectory ? d.trail.length : 0;
      for (let i = 0; i < n; i++) {
        m.setPosition(d.trail[i][0] / ESCALA, 0, d.trail[i][1] / ESCALA);
        inst.setMatrixAt(i, m);
      }
      inst.count = n;
      inst.instanceMatrix.needsUpdate = true;
    }
    const el = elementos(d);
    const vCirc = Math.sqrt(MU / el.r);
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Distancia r', value: el.r / 1000, unit: 'km', decimals: 0 },
        { label: 'Velocidad', value: el.v, unit: 'm/s', decimals: 0 },
        { label: 'Periodo T', value: el.T != null ? el.T / 60 : NaN, unit: 'min', decimals: 1 },
        { label: 'Excentricidad e', value: el.e, unit: '', decimals: 3 },
      ],
      formulaViva: d.impacto
        ? '💥 Impacto: demasiado lento para esta altura'
        : d.escape
          ? '🚀 ¡Escape! ε ≥ 0: el satélite no volverá'
          : `v circular a esta r = √(μ/r) = ${fmt(vCirc, 0)} m/s · v escape = ${fmt(vCirc * Math.SQRT2, 0)} m/s`,
      extra: {
        e: el.e,
        Tmin: el.T != null ? el.T / 60 : null,
        perigeoKm: el.rp != null ? el.rp / 1000 : null,
        apogeoKm: el.ra != null ? el.ra / 1000 : null,
        impacto: d.impacto,
        escape: d.escape,
        epsilon: el.eps,
      },
    });
  });

  const d = world.data || { x: R_T, y: 0 };
  const satPos = [d.x / ESCALA, 0, d.y / ESCALA];
  const rNorm = Math.hypot(satPos[0], satPos[2]) || 1;

  return (
    <group>
      {/* la Tierra */}
      <mesh castShadow={false}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
      </mesh>
      {CONTINENTES.map((c, i) => (
        <mesh key={i} position={[c[0], c[1], c[2]].map((v) => (v / Math.hypot(...c)) * 2)} scale={[0.55, 0.4, 0.18]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
      ))}
      {/* halo atmosférico */}
      <mesh>
        <sphereGeometry args={[2.12, 32, 32]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* rastro orbital */}
      <instancedMesh ref={trailRef} args={[undefined, undefined, 220]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.6} />
      </instancedMesh>

      {/* satélite */}
      <group ref={satRef} position={satPos}>
        <mesh>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.32, 0, 0]}>
          <boxGeometry args={[0.34, 0.02, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.32, 0, 0]}>
          <boxGeometry args={[0.34, 0.02, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* vectores: velocidad (tangente) y gravedad (al centro) */}
      {showVectors && !world.data?.done && (
        <group>
          <VectorArrow origin={satPos} dir={[d.vx || 0, 0, d.vy || 1]} length={1.3} color="#4ade80" label="v" thickness={0.035} />
          <VectorArrow origin={satPos} dir={[-satPos[0] / rNorm, 0, -satPos[2] / rNorm]} length={1} color="#f87171" label="F" thickness={0.035} />
        </group>
      )}

      <Billboard position={[0, 3.4, 0]}>
        <Text fontSize={0.36} color="#94a3b8" anchorX="center">⏩ 1 s real = 15 min simulados</Text>
      </Billboard>
    </group>
  );
}

const simDef = {
  id: 'orbitas',
  nombre: 'Órbitas y satélites',
  icono: '🛰️',
  descripcion: 'Lanza satélites: demasiado lento caen, demasiado rápido escapan… y en el punto justo, orbitan.',
  curso: { level: 'bachillerato', grade: 2 },
  paramsDef: [
    { key: 'altura', label: 'Altura inicial', min: 200, max: 40000, step: 100, def: 400, unit: 'km' },
    { key: 'velocidad', label: 'Velocidad de inserción', min: 1000, max: 12000, step: 25, def: 7700, unit: 'm/s' },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Velocidad orbital circular', expr: 'v = √(μ/r)', leyenda: 'μ = G·M_T = 3,99·10¹⁴ · r desde el CENTRO de la Tierra' },
    { titulo: 'Velocidad de escape', expr: 'v_e = √(2μ/r) = √2 · v_circular', leyenda: 'energía mecánica ≥ 0' },
    { titulo: '3ª ley de Kepler', expr: 'T² = 4π²·a³/μ', leyenda: 'el periodo solo depende del semieje mayor' },
  ],
  fondo: () => '#03060f',
  camara: { position: [0, 16, 24], fov: 45 },
  controles: { target: [0, 0, 0], maxDistance: 90, maxPolarAngle: Math.PI },
  Scene,
  retos: [
    {
      id: 'orbita-de-manual',
      titulo: 'Órbita de manual',
      descripcion: 'Consigue una órbita casi circular: excentricidad menor que 0,05.',
      pista: 'A 400 km: v = √(μ/r) = 7672 m/s. Con el step de 25 prueba 7675.',
      check: (tel) => tel.extra?.epsilon < 0 && tel.extra?.e < 0.05 && tel.t > 3 && !tel.extra?.impacto,
    },
    {
      id: 'geoestacionaria',
      titulo: 'Geoestacionaria',
      descripcion: 'Pon el satélite en una órbita con periodo entre 23,5 y 24 ,5 horas.',
      pista: 'La GEO vive a unos 35 800 km de altura, donde la v circular es ≈ 3075 m/s.',
      check: (tel) => tel.extra?.Tmin != null && tel.extra.Tmin >= 23.5 * 60 && tel.extra.Tmin <= 24.5 * 60,
    },
    {
      id: 'escape',
      titulo: 'Adiós, Tierra',
      descripcion: 'Alcanza la velocidad de escape y abandona el campo terrestre.',
      pista: 'v_e = √2 · v_circular ≈ 11 km/s a 400 km de altura.',
      check: (tel) => !!tel.extra?.escape,
    },
    {
      id: 'molniya',
      titulo: 'Órbita excéntrica',
      descripcion: 'Logra una órbita estable con perigeo < 8000 km y apogeo > 25 000 km.',
      pista: 'Lanza bajo (1000 km) un poco más rápido que la circular, p. ej. 9200 m/s.',
      check: (tel) => !tel.extra?.impacto && tel.extra?.epsilon < 0
        && tel.extra?.perigeoKm != null && tel.extra.perigeoKm < 8000
        && tel.extra?.apogeoKm != null && tel.extra.apogeoKm > 25000,
    },
  ],
  examTemplates: [
    {
      id: 'v-circular',
      generar: (rng) => {
        const alturaKm = pick(rng, [400, 800, 2000, 20200, 35786]);
        const r = R_T + alturaKm * 1000;
        const v = Math.sqrt(MU / r);
        return {
          enunciado: `Calcula la velocidad orbital circular a ${fmt(alturaKm, 0)} km de altura. (μ = G·M_T = 3,99·10¹⁴ m³/s²; R_T = 6371 km; v = √(μ/r) con r desde el centro)`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v,
          toleranciaAbs: 40,
          simParams: { altura: alturaKm, velocidad: Math.round(v / 25) * 25 },
          simDuracion: 8,
          explica: {
            pregunta: '¿Por qué los satélites más altos van MÁS LENTOS?',
            opciones: [
              'Porque la gravedad disminuye con r y necesita menos velocidad para curvar la trayectoria',
              'Porque arriba hay menos aire que los frene',
              'Porque la Tierra los empuja menos al girar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'v-escape',
      generar: (rng) => {
        const alturaKm = pick(rng, [400, 1000, 5000]);
        const r = R_T + alturaKm * 1000;
        const v = Math.sqrt((2 * MU) / r);
        return {
          enunciado: `¿Qué velocidad de escape corresponde a ${fmt(alturaKm, 0)} km de altura? (v_e = √(2μ/r), μ = 3,99·10¹⁴, R_T = 6371 km)`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v,
          toleranciaAbs: 50,
          simParams: { altura: alturaKm, velocidad: Math.min(12000, Math.round(v / 25) * 25) },
          simDuracion: 8,
          explica: {
            pregunta: '¿Qué le pasa a la energía mecánica del satélite al escapar?',
            opciones: [
              'Es cero o positiva: la cinética compensa toda la potencial',
              'Se hace infinita',
              'Es negativa pero muy pequeña',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'kepler-2',
      generar: (rng) => {
        const v = randInt(rng, 1, 2);
        return {
          enunciado: `Un satélite recorre una órbita elíptica${v === 1 ? ' muy excéntrica' : ''}. ¿En qué punto de la órbita se mueve más rápido?`,
          tipo: 'opciones',
          opciones: ['En el perigeo (el punto más cercano a la Tierra)', 'En el apogeo (el más lejano)', 'Va siempre a la misma velocidad'],
          correcta: 0,
          simParams: { altura: 1000, velocidad: 9200 },
          simDuracion: 9,
          explica: {
            pregunta: '¿Qué ley de Kepler lo explica?',
            opciones: [
              'La 2ª: el radio vector barre áreas iguales en tiempos iguales',
              'La 1ª: las órbitas son elipses',
              'La 3ª: T² es proporcional a a³',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'kepler-3',
      generar: (rng) => {
        const factor = pick(rng, [4, 9]);
        const tFactor = factor === 4 ? 8 : 27;
        return {
          enunciado: `Si el semieje mayor de una órbita se multiplica por ${factor}, ¿por cuánto se multiplica el periodo? (T² ∝ a³)`,
          tipo: 'opciones',
          opciones: [`Por ${tFactor}`, `Por ${factor}`, `Por ${factor * factor}`],
          correcta: 0,
          simParams: { altura: 20000, velocidad: 3900 },
          simDuracion: 8,
          explica: {
            pregunta: '¿Cómo se despeja ese factor?',
            opciones: [
              `T ∝ a^(3/2): ${factor}^(3/2) = ${tFactor}`,
              `T ∝ a²: ${factor}² = ${factor * factor}`,
              'T ∝ a: el factor es el mismo',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
