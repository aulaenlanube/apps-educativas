// Simulación — Movimiento circular (4º ESO).
// Bola atada a una cuerda en círculo horizontal: Fc = m·ω²·r. La cuerda
// aguanta 100 N; si la fuerza centrípeta los supera, SE ROMPE y la bola sale
// despedida en línea recta TANGENTE (la lección estrella de la escena).
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt } from '../engine/rng';

const T_MAX = 100;   // N que aguanta la cuerda
const ALTURA = 2.2;  // plano del giro
const VS = 1;        // 1 m = 1 unidad

function reinit(world, params) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    theta: 0,
    rota: false,
    // posición/velocidad tras la rotura (vuelo recto tangente)
    x: params.radio, z: 0, vx: 0, vz: 0,
    trail: [],
    lastTrailT: 0,
    enFranjaDesde: null, // para el reto "al límite"
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, showTrajectory, quality, onTelemetry }) {
  const bolaRef = useRef(null);
  const cuerdaRef = useRef(null);
  const trailRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.radio, params.omega, params.masa]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    if (!d.rota) {
      const fc = p.masa * p.omega * p.omega * p.radio;
      if (fc > T_MAX) {
        // ¡rotura! la bola sale con la velocidad tangencial del instante
        d.rota = true;
        const v = p.omega * p.radio;
        d.x = p.radio * Math.cos(d.theta);
        d.z = p.radio * Math.sin(d.theta);
        d.vx = -v * Math.sin(d.theta);
        d.vz = v * Math.cos(d.theta);
      } else {
        d.theta += p.omega * dt;
        d.x = p.radio * Math.cos(d.theta);
        d.z = p.radio * Math.sin(d.theta);
        // cronometra el tiempo sostenido en la franja 90-100 N (reto)
        if (fc >= 90 && fc <= T_MAX) {
          if (d.enFranjaDesde == null) d.enFranjaDesde = world.t;
        } else {
          d.enFranjaDesde = null;
        }
      }
    } else {
      d.x += d.vx * dt;
      d.z += d.vz * dt;
      const r = Math.hypot(d.x, d.z);
      if (r > 14) d.done = true;
    }
    if (world.t - d.lastTrailT > 0.12 && d.trail.length < 160) {
      d.trail.push([d.x, d.z]);
      d.lastTrailT = world.t;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    if (bolaRef.current) bolaRef.current.position.set(d.x * VS, ALTURA, d.z * VS);
    // cuerda: del poste a la bola (oculta tras la rotura)
    if (cuerdaRef.current) {
      if (d.rota) {
        cuerdaRef.current.visible = false;
      } else {
        cuerdaRef.current.visible = true;
        const len = Math.hypot(d.x, d.z);
        cuerdaRef.current.position.set((d.x / 2) * VS, ALTURA, (d.z / 2) * VS);
        cuerdaRef.current.scale.y = Math.max(0.05, len);
        cuerdaRef.current.rotation.z = Math.PI / 2;
        cuerdaRef.current.rotation.y = -Math.atan2(d.z, d.x);
      }
    }
    const inst = trailRef.current;
    if (inst) {
      const m = new THREE.Matrix4();
      const n = showTrajectory ? d.trail.length : 0;
      for (let i = 0; i < n; i++) {
        m.setPosition(d.trail[i][0] * VS, ALTURA, d.trail[i][1] * VS);
        inst.setMatrixAt(i, m);
      }
      inst.count = n;
      inst.instanceMatrix.needsUpdate = true;
    }
    const fc = d.rota ? 0 : p.masa * p.omega * p.omega * p.radio;
    const v = p.omega * p.radio;
    const franja = d.enFranjaDesde != null ? world.t - d.enFranjaDesde : 0;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Velocidad lineal', value: d.rota ? Math.hypot(d.vx, d.vz) : v, unit: 'm/s', decimals: 2 },
        { label: 'Fuerza centrípeta', value: fc, unit: 'N', decimals: 1 },
        { label: 'Periodo T', value: (2 * Math.PI) / p.omega, unit: 's', decimals: 2 },
        { label: 'Cuerda', value: d.rota ? '💥 ROTA' : 'OK', unit: '' },
      ],
      formulaViva: d.rota
        ? 'Sin fuerza centrípeta la bola sigue RECTA (1ª ley de Newton)'
        : `Fc = m·ω²·r = ${fmt(p.masa, 2)} · ${fmt(p.omega, 2)}² · ${fmt(p.radio, 2)} = ${fmt(fc, 1)} N`,
      extra: { fc, rota: d.rota, franjaSegs: franja, T: (2 * Math.PI) / p.omega },
    });
  });

  const d = world.data || { x: params.radio, z: 0, rota: false };
  const p = params;
  const fc = d.rota ? 0 : p.masa * p.omega * p.omega * p.radio;
  const tensionColor = fc > 90 ? '#f87171' : fc > 70 ? '#fbbf24' : '#4ade80';
  const bolaPos = [d.x * VS, ALTURA, d.z * VS];
  // dirección tangente (para el vector v) y radial (para Fc)
  const tang = d.rota
    ? [d.vx, 0, d.vz]
    : [-Math.sin(d.theta || 0), 0, Math.cos(d.theta || 0)];
  const radial = [-(d.x || 1), 0, -(d.z || 0)];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 48]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[30, 15, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* poste central */}
      <mesh position={[0, ALTURA / 2, 0]} castShadow={quality.shadows}>
        <cylinderGeometry args={[0.12, 0.18, ALTURA, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* círculo guía del radio actual */}
      {!d.rota && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[p.radio * VS - 0.03, p.radio * VS + 0.03, 64]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.3} />
        </mesh>
      )}

      {/* cuerda */}
      <mesh ref={cuerdaRef}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* rastro */}
      <instancedMesh ref={trailRef} args={[undefined, undefined, 160]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.5} />
      </instancedMesh>

      {/* bola */}
      <mesh ref={bolaRef} position={bolaPos} castShadow={quality.shadows}>
        <sphereGeometry args={[0.3 + Math.cbrt(p.masa) * 0.08, 20, 20]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.35} />
      </mesh>

      {/* tensiómetro */}
      <Billboard position={[0, ALTURA + 1.6, 0]}>
        <Texto3D fontSize={0.46} color={tensionColor} outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          {d.rota ? '¡CUERDA ROTA!' : `T cuerda = ${fmt(fc, 1)} N / ${T_MAX}`}
        </Texto3D>
      </Billboard>

      {showVectors && (
        <group>
          <VectorArrow origin={bolaPos} dir={tang} length={Math.min(2.6, (d.rota ? Math.hypot(d.vx, d.vz) : p.omega * p.radio) * 0.12 + 0.2)} color="#4ade80" label={`v = ${fmt(d.rota ? Math.hypot(d.vx, d.vz) : p.omega * p.radio, 1)} m/s`} thickness={0.04} />
          {!d.rota && (
            <VectorArrow origin={bolaPos} dir={radial} length={Math.min(2.6, fc * 0.02 + 0.2)} color="#f87171" label={`Fc = ${fmt(fc, 1)} N`} thickness={0.04} />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'movimiento-circular',
  nombre: 'Movimiento circular',
  icono: '🎡',
  descripcion: 'Haz girar una bola atada a una cuerda… y descubre qué pasa cuando la cuerda no aguanta.',
  curso: { level: 'eso', grade: 4 },
  paramsDef: [
    { key: 'radio', label: 'Radio', min: 0.5, max: 5, step: 0.25, def: 2, unit: 'm', decimals: 2 },
    { key: 'omega', label: 'Velocidad angular ω', min: 0.5, max: 8, step: 0.25, def: 3, unit: 'rad/s', decimals: 2 },
    { key: 'masa', label: 'Masa', min: 0.5, max: 5, step: 0.25, def: 1, unit: 'kg', decimals: 2 },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Velocidad lineal', expr: 'v = ω·r', leyenda: 'ω en rad/s · r en m' },
    { titulo: 'Fuerza centrípeta', expr: 'Fc = m·ω²·r = m·v²/r', leyenda: 'apunta SIEMPRE al centro' },
    { titulo: 'Periodo', expr: 'T = 2π/ω', leyenda: 'tiempo de una vuelta completa' },
  ],
  fondo: () => '#0e1830',
  camara: { position: [9, 8, 11], fov: 45 },
  controles: { target: [0, 1.5, 0], maxDistance: 35 },
  Scene,
  retos: [
    {
      id: 'al-limite',
      titulo: 'Al límite',
      descripcion: 'Mantén la tensión de la cuerda entre 90 y 100 N durante 3 segundos sin que se rompa.',
      pista: 'Fc = m·ω²·r. Con 1 kg y r = 2 m: ω = 6,9 rad/s da 95 N.',
      check: (tel) => !tel.extra?.rota && (tel.extra?.franjaSegs ?? 0) >= 3,
    },
    {
      id: 'lanzamiento-martillo',
      titulo: 'Lanzamiento de martillo',
      descripcion: 'Rompe la cuerda y observa la trayectoria: ¡sale recta, no en espiral!',
      pista: 'Sube ω, r o la masa hasta pasar de 100 N.',
      check: (tel) => !!tel.extra?.rota,
    },
    {
      id: 'tiovivo-suave',
      titulo: 'Tiovivo de bebés',
      descripcion: 'Gira con radio de 3 m o más y fuerza centrípeta menor de 5 N.',
      pista: 'Masa y ω pequeñas: 0,5 kg a 0,5 rad/s con r = 3 → 0,375 N.',
      check: (tel, p) => p.radio >= 3 && !tel.extra?.rota && (tel.extra?.fc ?? 99) < 5 && tel.t > 1,
    },
    {
      id: 'periodo-exacto',
      titulo: 'Vuelta al reloj',
      descripcion: 'Consigue un periodo de giro entre 1,9 y 2,1 segundos.',
      pista: 'T = 2π/ω → para T = 2 s necesitas ω ≈ 3,14 rad/s (prueba 3,25).',
      check: (tel) => !tel.extra?.rota && tel.extra?.T >= 1.9 && tel.extra?.T <= 2.1 && tel.t > 2,
    },
  ],
  examTemplates: [
    {
      id: 'v-lineal',
      generar: (rng) => {
        const r = randInt(rng, 2, 5);
        const w = randInt(rng, 2, 6);
        return {
          enunciado: `Una bola gira en un círculo de ${r} m de radio con velocidad angular ω = ${w} rad/s. ¿Cuál es su velocidad lineal?`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: w * r,
          toleranciaAbs: 0.05,
          simParams: { radio: r, omega: w, masa: 1 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Hacia dónde apunta esa velocidad en cada instante?',
            opciones: [
              'Tangente a la circunferencia (perpendicular al radio)',
              'Hacia el centro del círculo',
              'Hacia fuera del círculo',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'fc',
      generar: (rng) => {
        const m = randInt(rng, 1, 4);
        const r = randInt(rng, 2, 5);
        const v = randInt(rng, 3, 8);
        return {
          enunciado: `Una masa de ${m} kg gira a ${v} m/s en un círculo de ${r} m de radio. ¿Qué fuerza centrípeta necesita? (Fc = m·v²/r)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: (m * v * v) / r,
          toleranciaAbs: 0.2,
          simParams: { radio: r, omega: Math.min(8, Math.round((v / r) * 4) / 4), masa: m },
          simDuracion: 4,
          explica: {
            pregunta: '¿Quién ejerce esa fuerza centrípeta en esta simulación?',
            opciones: [
              'La tensión de la cuerda, tirando hacia el centro',
              'La propia bola, empujándose a sí misma',
              'Una fuerza centrífuga real hacia fuera',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'periodo',
      generar: (rng) => {
        const w = randInt(rng, 2, 8);
        return {
          enunciado: `Un objeto gira con velocidad angular ω = ${w} rad/s. ¿Cuánto tarda en dar una vuelta completa? (T = 2π/ω)`,
          tipo: 'numerica',
          unidad: 's',
          respuesta: (2 * Math.PI) / w,
          toleranciaAbs: 0.05,
          simParams: { radio: 2, omega: w, masa: 1 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Y cuántas vueltas da por segundo (frecuencia)?',
            opciones: [
              'f = 1/T = ω/(2π)',
              'f = 2π·ω',
              'f = T² siempre',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'cuerda-rota',
      generar: (rng) => {
        const r = randInt(rng, 2, 4);
        return {
          enunciado: `Una bola gira atada a una cuerda de ${r} m. De repente, la cuerda se rompe. ¿Qué trayectoria sigue la bola justo después?`,
          tipo: 'opciones',
          opciones: ['Una espiral hacia fuera', 'Una línea recta tangente al círculo', 'Sale disparada hacia fuera en la dirección del radio'],
          correcta: 1,
          simParams: { radio: r, omega: 8, masa: 5 },
          simDuracion: 5,
          explica: {
            pregunta: '¿Qué ley lo explica?',
            opciones: [
              'La 1ª ley de Newton: sin fuerza, el cuerpo sigue recto con la velocidad que tenía',
              'La ley de la fuerza centrífuga, que la empuja hacia fuera',
              'La 3ª ley: la cuerda reacciona lanzando la bola',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
