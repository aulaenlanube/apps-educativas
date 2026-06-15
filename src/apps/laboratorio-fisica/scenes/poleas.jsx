// Simulación — Cuerdas, poleas y tensión (4º ESO).
// Dos montajes: máquina de Atwood (dos masas colgando) y mesa con polea en el
// borde (m1 desliza, m2 cuelga). La tensión es la fuerza que el RD de 4º ESO
// nombra literalmente y que faltaba en el catálogo.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { SUPERFICIES } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt } from '../engine/rng';

const G = 9.8;
const RECORRIDO_MAX = 3; // m de cuerda disponibles

// dinámica analítica del montaje actual
function calcular(p) {
  if (p.montaje === 'atwood') {
    const a = (G * (p.m2 - p.m1)) / (p.m1 + p.m2); // + → m2 baja
    const T = (2 * p.m1 * p.m2 * G) / (p.m1 + p.m2);
    return { a, T, mueve: Math.abs(p.m2 - p.m1) > 1e-9 };
  }
  const { muS, muK } = SUPERFICIES[p.superficie];
  if (p.m2 * G <= muS * p.m1 * G) return { a: 0, T: p.m2 * G, mueve: false };
  const a = (G * (p.m2 - muK * p.m1)) / (p.m1 + p.m2);
  return { a, T: p.m2 * (G - a), mueve: true };
}

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = { s: 0, v: 0, a: 0, T: 0, enMovimiento: false, done: false };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const m1Ref = useRef(null);
  const m2Ref = useRef(null);
  const cuerda1Ref = useRef(null);
  const cuerda2Ref = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world);
  }, [world, params.montaje, params.m1, params.m2, params.superficie]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const { a, T, mueve } = calcular(p);
    d.a = mueve ? a : 0;
    d.T = T;
    d.enMovimiento = mueve;
    if (mueve) {
      d.v += a * dt;
      d.s += d.v * dt;
      if (Math.abs(d.s) >= RECORRIDO_MAX) {
        d.s = Math.sign(d.s) * RECORRIDO_MAX;
        d.done = true;
      }
    }
  });

  // posiciones de las masas según montaje (s = lo que ha bajado m2)
  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    if (p.montaje === 'atwood') {
      const y1 = 3.2 + d.s; // m1 sube cuando m2 baja
      const y2 = 3.2 - d.s;
      if (m1Ref.current) m1Ref.current.position.set(-1.2, y1, 0);
      if (m2Ref.current) m2Ref.current.position.set(1.2, y2, 0);
      if (cuerda1Ref.current) {
        cuerda1Ref.current.position.set(-1.2, (6.6 + y1) / 2 + 0.3, 0);
        cuerda1Ref.current.scale.y = Math.max(0.05, 6.6 - y1);
      }
      if (cuerda2Ref.current) {
        cuerda2Ref.current.position.set(1.2, (6.6 + y2) / 2 + 0.3, 0);
        cuerda2Ref.current.scale.y = Math.max(0.05, 6.6 - y2);
      }
    } else {
      const x1 = -2.5 + d.s; // m1 avanza por la mesa hacia la polea
      const y2 = 1.6 - d.s;  // m2 baja
      if (m1Ref.current) m1Ref.current.position.set(x1, 2.75, 0);
      if (m2Ref.current) m2Ref.current.position.set(3.6, y2, 0);
      if (cuerda1Ref.current) {
        // tramo horizontal: de m1 a la polea del borde
        const len = Math.max(0.05, 3.1 - x1);
        cuerda1Ref.current.position.set((x1 + 3.1) / 2, 2.95, 0);
        cuerda1Ref.current.scale.y = len;
      }
      if (cuerda2Ref.current) {
        const len = Math.max(0.05, 2.95 - y2 - 0.35);
        cuerda2Ref.current.position.set(3.6, y2 + 0.35 + len / 2, 0);
        cuerda2Ref.current.scale.y = len;
      }
    }
    const p2 = paramsRef.current;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Aceleración', value: d.a, unit: 'm/s²', decimals: 2 },
        { label: 'Tensión T', value: d.T, unit: 'N', decimals: 1 },
        { label: 'Velocidad', value: Math.abs(d.v), unit: 'm/s', decimals: 2 },
        { label: 'Recorrido', value: Math.abs(d.s), unit: 'm', decimals: 2 },
      ],
      series: { v: Math.abs(d.v) },
      formulaViva: p2.montaje === 'atwood'
        ? `a = g·(m₂−m₁)/(m₁+m₂) = ${fmt(d.a, 2)} m/s² · T = ${fmt(d.T, 1)} N`
        : d.enMovimiento
          ? `a = g·(m₂ − μk·m₁)/(m₁+m₂) = ${fmt(d.a, 2)} m/s²`
          : `No se mueve: m₂·g = ${fmt(p2.m2 * G, 1)} N ≤ μs·m₁·g = ${fmt(SUPERFICIES[p2.superficie].muS * p2.m1 * G, 1)} N`,
      extra: { a: d.a, T: d.T, enMovimiento: d.enMovimiento },
    });
  });

  const d = world.data || { s: 0, T: 0 };
  const p = params;
  const esAtwood = p.montaje === 'atwood';
  const m1Pos = esAtwood ? [-1.2, 3.2 + d.s, 0] : [-2.5 + d.s, 2.75, 0];
  const m2Pos = esAtwood ? [1.2, 3.2 - d.s, 0] : [3.6, 1.6 - d.s, 0];
  const lado1 = 0.55 + Math.cbrt(p.m1) * 0.14;
  const lado2 = 0.55 + Math.cbrt(p.m2) * 0.14;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 40]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {esAtwood ? (
        <group>
          {/* pórtico + polea */}
          <mesh position={[0, 3.5, 0]} castShadow={quality.shadows}>
            <boxGeometry args={[0.18, 7, 0.18]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={quality.shadows}>
            <torusGeometry args={[1.2, 0.14, 12, 32]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* tramo de cuerda sobre la polea */}
          <mesh position={[0, 7.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 2.4, 6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      ) : (
        <group>
          {/* mesa con polea en el borde */}
          <mesh position={[0, 1.2, 0]} castShadow={quality.shadows}>
            <boxGeometry args={[6.4, 2.4, 2.4]} />
            <meshStandardMaterial color={SUPERFICIES[p.superficie].color} roughness={0.85} />
          </mesh>
          <mesh position={[3.3, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={quality.shadows}>
            <torusGeometry args={[0.3, 0.07, 10, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* cuerdas (escaladas por ref) */}
      <mesh ref={cuerda1Ref} rotation={esAtwood ? [0, 0, 0] : [0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh ref={cuerda2Ref}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* masas */}
      <mesh ref={m1Ref} position={m1Pos} castShadow={quality.shadows}>
        <boxGeometry args={[lado1, lado1, lado1]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
      </mesh>
      <mesh ref={m2Ref} position={m2Pos} castShadow={quality.shadows}>
        <boxGeometry args={[lado2, lado2, lado2]} />
        <meshStandardMaterial color="#f472b6" roughness={0.5} />
      </mesh>
      <Billboard position={[m1Pos[0] - 1, m1Pos[1], 0]}>
        <Texto3D fontSize={0.3} color="#7dd3fc" anchorX="center">{fmt(p.m1, 0)} kg</Texto3D>
      </Billboard>
      <Billboard position={[m2Pos[0] + 1, m2Pos[1], 0]}>
        <Texto3D fontSize={0.3} color="#f9a8d4" anchorX="center">{fmt(p.m2, 0)} kg</Texto3D>
      </Billboard>

      {/* vectores: tensión y pesos */}
      {showVectors && (
        <group>
          <VectorArrow origin={m1Pos} dir={esAtwood ? [0, 1, 0] : [1, 0, 0]} length={Math.min(2.2, d.T * 0.018 + 0.2)} color="#fbbf24" label={`T = ${fmt(d.T, 1)} N`} thickness={0.04} />
          <VectorArrow origin={m2Pos} dir={[0, 1, 0]} length={Math.min(2.2, d.T * 0.018 + 0.2)} color="#fbbf24" label="T" thickness={0.04} />
          <VectorArrow origin={[m1Pos[0], m1Pos[1] - lado1 / 2, 0]} dir={[0, -1, 0]} length={Math.min(2.2, p.m1 * G * 0.018 + 0.2)} color="#f87171" label={`P₁ = ${fmt(p.m1 * G, 0)} N`} thickness={0.04} />
          <VectorArrow origin={[m2Pos[0], m2Pos[1] - lado2 / 2, 0]} dir={[0, -1, 0]} length={Math.min(2.2, p.m2 * G * 0.018 + 0.2)} color="#f87171" label={`P₂ = ${fmt(p.m2 * G, 0)} N`} thickness={0.04} />
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'poleas',
  nombre: 'Cuerdas, poleas y tensión',
  icono: '🪢',
  descripcion: 'Máquina de Atwood y mesa con polea: descubre cuánto vale la tensión de la cuerda.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  paramsDef: [
    {
      key: 'montaje', label: 'Montaje', type: 'select', def: 'atwood',
      options: [
        { value: 'atwood', label: '⚖️ Atwood (dos colgando)' },
        { value: 'mesa', label: '🛋️ Mesa con polea' },
      ],
    },
    { key: 'm1', label: 'Masa 1 (izquierda / mesa)', min: 1, max: 10, step: 0.5, def: 3, unit: 'kg', decimals: 1 },
    { key: 'm2', label: 'Masa 2 (derecha / colgante)', min: 1, max: 10, step: 0.5, def: 5, unit: 'kg', decimals: 1 },
    {
      key: 'superficie', label: 'Superficie (solo mesa)', type: 'select', def: 'madera',
      options: [
        { value: 'madera', label: SUPERFICIES.madera.label },
        { value: 'hielo', label: SUPERFICIES.hielo.label },
      ],
    },
  ],
  graficas: [{ key: 'v', label: 'velocidad (m/s)', color: '#4ade80' }],
  formulas: [
    { titulo: 'Atwood', expr: 'a = g·(m₂−m₁)/(m₁+m₂)', leyenda: 'T = 2·m₁·m₂·g/(m₁+m₂)' },
    { titulo: 'Mesa con polea', expr: 'a = g·(m₂ − μk·m₁)/(m₁+m₂)', leyenda: 'se mueve solo si m₂·g > μs·m₁·g' },
  ],
  fondo: () => '#101a33',
  camara: { position: [8, 5.5, 10], fov: 45 },
  controles: { target: [0, 3, 0], maxDistance: 30 },
  Scene,
  retos: [
    {
      id: 'equilibrio-perfecto',
      titulo: 'Equilibrio perfecto',
      descripcion: 'En Atwood, consigue que el sistema se quede quieto durante 2 segundos.',
      pista: 'a = g·(m₂−m₁)/(m₁+m₂)… ¿cuándo vale cero esa resta?',
      check: (tel, p) => p.montaje === 'atwood' && Math.abs(tel.extra?.a ?? 1) < 0.01 && tel.t > 2,
    },
    {
      id: 'ascensor-de-obra',
      titulo: 'Ascensor de obra',
      descripcion: 'En Atwood, consigue una aceleración entre 0,5 y 1 m/s² (subida suave).',
      pista: 'Masas parecidas pero no iguales: prueba 9 y 10 kg (a = 0,52).',
      check: (tel, p) => p.montaje === 'atwood' && tel.extra?.enMovimiento
        && Math.abs(tel.extra.a) >= 0.5 && Math.abs(tel.extra.a) <= 1,
    },
    {
      id: 'la-mesa-aguanta',
      titulo: 'La mesa aguanta',
      descripcion: 'En el montaje de mesa, que NO se mueva con una masa colgante de 3 kg o más.',
      pista: 'El rozamiento estático aguanta hasta μs·m₁·g. En madera μs = 0,45: necesitas m₁ grande.',
      check: (tel, p) => p.montaje === 'mesa' && !tel.extra?.enMovimiento && p.m2 >= 3 && tel.t > 2,
    },
    {
      id: 'hielo-traicionero',
      titulo: 'Hielo traicionero',
      descripcion: 'En la mesa con hielo, supera los 4 m/s² de aceleración.',
      pista: 'En hielo casi no hay rozamiento: pon mucha masa colgando y poca en la mesa.',
      check: (tel, p) => p.montaje === 'mesa' && p.superficie === 'hielo' && (tel.extra?.a ?? 0) > 4,
    },
  ],
  examTemplates: [
    {
      id: 'a-atwood',
      generar: (rng) => {
        const m1 = randInt(rng, 2, 6);
        const m2 = m1 + randInt(rng, 1, 4);
        const a = (G * (m2 - m1)) / (m1 + m2);
        return {
          enunciado: `En una máquina de Atwood cuelgan ${m1} kg y ${m2} kg de una polea ideal. ¿Qué aceleración adquiere el sistema? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm/s²',
          respuesta: a,
          toleranciaAbs: 0.05,
          simParams: { montaje: 'atwood', m1, m2, superficie: 'madera' },
          simDuracion: 4,
          explica: {
            pregunta: '¿Por qué la aceleración es menor que g?',
            opciones: [
              'Porque el peso que sobra (m₂−m₁)·g tiene que mover la masa TOTAL (m₁+m₂)',
              'Porque la polea frena la cuerda',
              'Porque la gravedad se reparte entre las dos cuerdas',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 't-atwood',
      generar: (rng) => {
        const m1 = randInt(rng, 2, 5);
        const m2 = m1 + randInt(rng, 1, 4);
        const T = (2 * m1 * m2 * G) / (m1 + m2);
        return {
          enunciado: `En la misma máquina de Atwood con ${m1} kg y ${m2} kg, ¿cuánto vale la tensión de la cuerda? (T = 2·m₁·m₂·g/(m₁+m₂), g = 9,8)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: T,
          toleranciaAbs: 0.5,
          simParams: { montaje: 'atwood', m1, m2, superficie: 'madera' },
          simDuracion: 4,
          explica: {
            pregunta: '¿La tensión es igual en los dos extremos de la cuerda?',
            opciones: [
              'Sí: cuerda ideal sin masa y polea sin rozamiento → la tensión es única',
              'No: del lado pesado la tensión es mayor',
              'Solo si las masas son iguales',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'a-mesa',
      generar: (rng) => {
        const m1 = randInt(rng, 2, 6);
        const m2 = randInt(rng, 3, 8);
        const a = (G * m2) / (m1 + m2);
        return {
          enunciado: `Sobre una mesa SIN rozamiento hay un bloque de ${m1} kg unido por una cuerda y una polea a ${m2} kg que cuelgan. ¿Qué aceleración lleva el sistema? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm/s²',
          respuesta: a,
          toleranciaAbs: 0.05,
          simParams: { montaje: 'mesa', m1, m2, superficie: 'hielo' },
          simDuracion: 3,
          explica: {
            pregunta: 'En la simulación (hielo, μ pequeño) la aceleración sale un pelín menor. ¿Por qué?',
            opciones: [
              'Porque el hielo aún tiene un poco de rozamiento (μk = 0,05); "sin rozamiento" es el caso ideal',
              'Porque la cuerda pesa demasiado',
              'Porque la gravedad del hielo es menor',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'masas-iguales',
      generar: (rng) => {
        const m = randInt(rng, 3, 8);
        return {
          enunciado: `En una máquina de Atwood cuelgan dos masas IGUALES de ${m} kg. Si el sistema parte del reposo, ¿qué hace?`,
          tipo: 'opciones',
          opciones: ['Se queda en reposo', 'Gira lentamente hacia la derecha', 'Oscila como un péndulo'],
          correcta: 0,
          simParams: { montaje: 'atwood', m1: m, m2: m, superficie: 'madera' },
          simDuracion: 3,
          explica: {
            pregunta: '¿Qué ley explica este comportamiento?',
            opciones: [
              'La 1ª ley de Newton: sin fuerza neta, el estado de movimiento no cambia',
              'La ley de Hooke: la cuerda se estira hasta compensar',
              'La 3ª ley de Newton: las masas se atraen entre sí',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
