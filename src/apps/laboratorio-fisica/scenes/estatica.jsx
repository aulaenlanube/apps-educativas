// Simulación — Estática: momentos de fuerza (1º Bachillerato).
// Balancín sobre fulcro: τ = m₁·g·d₁ − m₂·g·d₂. Equilibrio del sólido rígido
// y momento de una fuerza, con la tabla inclinándose hacia el lado ganador.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt } from '../engine/rng';

const G = 9.8;
const VS = 1.6;       // 1 m de brazo = 1,6 unidades
const ALTURA = 2.1;   // altura del eje

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = { angulo: 0, tau: 0, equilibradoDesde: null, equilibrado: false };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const tablaRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);

  useFixedStep(world, playing, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    // momento neto (positivo → cae la izquierda)
    d.tau = p.m1 * G * p.d1 - p.m2 * G * p.d2;
    const objetivo = Math.max(-22, Math.min(22, d.tau * 0.4)) * (Math.PI / 180);
    // asentamiento suave hacia el ángulo objetivo
    d.angulo += (objetivo - d.angulo) * Math.min(1, 2.2 * dt);
    if (Math.abs(d.tau) < 0.5) {
      if (d.equilibradoDesde == null) d.equilibradoDesde = world.t;
      d.equilibrado = world.t - d.equilibradoDesde >= 1.5;
    } else {
      d.equilibradoDesde = null;
      d.equilibrado = false;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (tablaRef.current) tablaRef.current.rotation.z = -d.angulo;
    const p = paramsRef.current;
    const mIzq = p.m1 * G * p.d1;
    const mDer = p.m2 * G * p.d2;
    onTelemetry?.({
      t: world.t,
      done: false,
      readouts: [
        { label: 'Momento izquierdo', value: mIzq, unit: 'N·m', decimals: 1 },
        { label: 'Momento derecho', value: mDer, unit: 'N·m', decimals: 1 },
        { label: 'Momento neto', value: d.tau, unit: 'N·m', decimals: 1 },
        { label: 'Estado', value: Math.abs(d.tau) < 0.5 ? '✅ Equilibrio' : d.tau > 0 ? '↙ Cae izquierda' : '↘ Cae derecha', unit: '' },
      ],
      formulaViva: `M = F·d → izq: ${fmt(p.m1 * G, 0)}·${fmt(p.d1, 1)} = ${fmt(mIzq, 1)} · der: ${fmt(p.m2 * G, 0)}·${fmt(p.d2, 1)} = ${fmt(mDer, 1)} N·m`,
      extra: { tau: d.tau, equilibrado: d.equilibrado },
    });
  });

  const d = world.data || { angulo: 0, tau: 0 };
  const p = params;
  const lado1 = 0.45 + Math.cbrt(p.m1) * 0.13;
  const lado2 = 0.45 + Math.cbrt(p.m2) * 0.13;
  const eqColor = Math.abs(d.tau) < 0.5 ? '#4ade80' : '#fbbf24';

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 40]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* fulcro */}
      <mesh position={[0, ALTURA / 2, 0]} castShadow={quality.shadows}>
        <coneGeometry args={[0.85, ALTURA, 4]} />
        <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* tabla + pesas (giran juntas alrededor del eje) */}
      <group ref={tablaRef} position={[0, ALTURA + 0.1, 0]}>
        <mesh castShadow={quality.shadows}>
          <boxGeometry args={[2.5 * 2 * VS + 1, 0.18, 1]} />
          <meshStandardMaterial color="#a16207" roughness={0.8} />
        </mesh>
        {/* marcas de distancia cada 0,5 m */}
        {[-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5].map((m) => (
          <mesh key={m} position={[m * VS, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.04, 1]} />
            <meshBasicMaterial color="#fde68a" />
          </mesh>
        ))}
        {/* pesa izquierda */}
        <group position={[-p.d1 * VS, 0.09 + lado1 / 2, 0]}>
          <mesh castShadow={quality.shadows}>
            <boxGeometry args={[lado1, lado1, lado1]} />
            <meshStandardMaterial color="#22d3ee" roughness={0.5} />
          </mesh>
          <Billboard position={[0, lado1 / 2 + 0.42, 0]}>
            <Texto3D fontSize={0.3} color="#67e8f9" anchorX="center">{fmt(p.m1, 0)} kg · {fmt(p.d1, 1)} m</Texto3D>
          </Billboard>
        </group>
        {/* pesa derecha */}
        <group position={[p.d2 * VS, 0.09 + lado2 / 2, 0]}>
          <mesh castShadow={quality.shadows}>
            <boxGeometry args={[lado2, lado2, lado2]} />
            <meshStandardMaterial color="#f472b6" roughness={0.5} />
          </mesh>
          <Billboard position={[0, lado2 / 2 + 0.42, 0]}>
            <Texto3D fontSize={0.3} color="#f9a8d4" anchorX="center">{fmt(p.m2, 0)} kg · {fmt(p.d2, 1)} m</Texto3D>
          </Billboard>
        </group>
      </group>

      {/* indicador del momento neto */}
      <Billboard position={[0, ALTURA + 2.6, 0]}>
        <Texto3D fontSize={0.44} color={eqColor} outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          τ neto = {fmt(d.tau, 1)} N·m
        </Texto3D>
      </Billboard>

      {/* pesos aplicados en cada pesa (aproximados sin la rotación para legibilidad) */}
      {showVectors && (
        <group>
          <VectorArrow origin={[-p.d1 * VS, ALTURA - 0.2, 0]} dir={[0, -1, 0]} length={Math.min(2.2, p.m1 * G * 0.004 + 0.25)} color="#f87171" label={`P₁ = ${fmt(p.m1 * G, 0)} N`} thickness={0.04} />
          <VectorArrow origin={[p.d2 * VS, ALTURA - 0.2, 0]} dir={[0, -1, 0]} length={Math.min(2.2, p.m2 * G * 0.004 + 0.25)} color="#f87171" label={`P₂ = ${fmt(p.m2 * G, 0)} N`} thickness={0.04} />
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'estatica',
  nombre: 'Estática: momentos de fuerza',
  icono: '⚖️',
  descripcion: 'El balancín del sólido rígido: equilibra momentos M = F·d moviendo masas y distancias.',
  curso: { level: 'bachillerato', grade: 1 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'm1', label: 'Masa izquierda', min: 5, max: 50, step: 1, def: 20, unit: 'kg' },
    { key: 'd1', label: 'Distancia izquierda', min: 0.2, max: 2.5, step: 0.1, def: 1, unit: 'm', decimals: 1 },
    { key: 'm2', label: 'Masa derecha', min: 5, max: 50, step: 1, def: 20, unit: 'kg' },
    { key: 'd2', label: 'Distancia derecha', min: 0.2, max: 2.5, step: 0.1, def: 1, unit: 'm', decimals: 1 },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Momento de una fuerza', expr: 'M = F·d', leyenda: 'F perpendicular al brazo · d: distancia al eje' },
    { titulo: 'Equilibrio de rotación', expr: 'Σ M = 0 → m₁·d₁ = m₂·d₂', leyenda: 'los momentos a ambos lados se compensan' },
  ],
  fondo: () => '#101a33',
  camara: { position: [0, 5.5, 11], fov: 45 },
  controles: { target: [0, 2.2, 0], maxDistance: 28 },
  Scene,
  retos: [
    {
      id: 'david-y-goliat',
      titulo: 'David y Goliat',
      descripcion: 'Equilibra el balancín con la masa izquierda al menos DOBLE que la derecha.',
      pista: 'm₁·d₁ = m₂·d₂: la masa grande, cerca del eje. Prueba 40 kg a 0,5 m contra 10 kg a 2 m.',
      check: (tel, p) => tel.extra?.equilibrado && p.m1 >= 2 * p.m2,
    },
    {
      id: 'punto-de-apoyo',
      titulo: 'Dadme un punto de apoyo…',
      descripcion: 'Con 5 kg o menos a la izquierda, levanta 50 kg colocados a 0,2 m a la derecha (que caiga la izquierda).',
      pista: 'Arquímedes: brazo largo. 5 kg a 2,5 m son 12,5 kg·m contra los 10 kg·m de Goliat.',
      check: (tel, p) => p.m1 <= 5 && p.m2 === 50 && p.d2 <= 0.2 && (tel.extra?.tau ?? 0) > 0.5 && tel.t > 1,
    },
    {
      id: 'relojero',
      titulo: 'Precisión de relojero',
      descripcion: 'Consigue el equilibrio con masas que se diferencien en 5 kg o más.',
      pista: 'Compensa la diferencia de masa con la distancia: 25·1,0 = 20·1,25.',
      check: (tel, p) => tel.extra?.equilibrado && Math.abs(p.m1 - p.m2) >= 5,
    },
  ],
  examTemplates: [
    {
      id: 'distancia-equilibrio',
      generar: (rng) => {
        const m1 = randInt(rng, 10, 40);
        const d1 = randInt(rng, 5, 20) / 10;
        const m2 = randInt(rng, 10, 40);
        const d2 = (m1 * d1) / m2;
        return {
          enunciado: `En un balancín, ${m1} kg están a ${fmt(d1, 1)} m del eje. ¿A qué distancia hay que poner ${m2} kg al otro lado para equilibrarlo?`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: d2,
          toleranciaAbs: 0.02,
          simParams: { m1, d1, m2, d2: Math.min(2.5, Math.round(d2 * 10) / 10) },
          simDuracion: 4,
          explica: {
            pregunta: '¿Qué condición de equilibrio estás aplicando?',
            opciones: [
              'Suma de momentos nula: m₁·g·d₁ = m₂·g·d₂',
              'Suma de fuerzas nula: m₁ = m₂',
              'Conservación de la energía en el giro',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'momento',
      generar: (rng) => {
        const m = randInt(rng, 10, 45);
        const dd = randInt(rng, 5, 25) / 10;
        return {
          enunciado: `¿Qué momento produce una masa de ${m} kg colgada a ${fmt(dd, 1)} m del eje de giro? (M = m·g·d, g = 9,8)`,
          tipo: 'numerica',
          unidad: 'N·m',
          respuesta: m * G * dd,
          toleranciaAbs: 1,
          simParams: { m1: m, d1: Math.min(2.5, dd), m2: 5, d2: 0.2 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Por qué un destornillador largo "hace más fuerza" que uno corto?',
            opciones: [
              'Porque con más brazo d, el mismo esfuerzo F produce más momento M = F·d',
              'Porque el metal largo acumula más energía',
              'Porque pesa más y ayuda a girar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-distancia-momento',
      generar: (rng) => {
        const m = randInt(rng, 10, 30);
        return {
          enunciado: `Una masa de ${m} kg produce un momento M a cierta distancia del eje. Si la colocamos al DOBLE de distancia, su momento pasa a ser…`,
          tipo: 'opciones',
          opciones: ['El doble (2·M)', 'El mismo (M)', 'El cuádruple (4·M)'],
          correcta: 0,
          simParams: { m1: m, d1: 2, m2: m, d2: 1 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Y si en vez de la distancia doblamos la masa?',
            opciones: [
              'También se dobla el momento: M es proporcional a ambos',
              'Se cuadruplica',
              'No cambia: solo importa la distancia',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'fuerza-para-equilibrar',
      generar: (rng) => {
        const M = randInt(rng, 50, 200);
        const dd = randInt(rng, 5, 25) / 10;
        return {
          enunciado: `Para equilibrar un momento de ${M} N·m aplicando una fuerza a ${fmt(dd, 1)} m del eje, ¿qué fuerza necesitas? (F = M/d)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: M / dd,
          toleranciaAbs: 1,
          simParams: { m1: Math.min(50, Math.round(M / dd / G)), d1: Math.min(2.5, dd), m2: Math.min(50, Math.round(M / G / 1)), d2: 1 },
          simDuracion: 4,
          explica: {
            pregunta: '¿Dónde conviene empujar una puerta pesada para abrirla con menos esfuerzo?',
            opciones: [
              'Lo más lejos posible de las bisagras (más brazo, menos fuerza)',
              'Justo en el centro de la puerta',
              'Pegado a las bisagras (más cerca del eje)',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
