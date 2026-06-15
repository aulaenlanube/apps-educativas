// Simulación — Oscilaciones / MAS (2º Bachillerato; visible en 1º como
// ampliación: los libros lo adelantan). Péndulo simple con la ecuación
// COMPLETA (α = −g/L·senθ) y masa-muelle ideal. Se cronometra el periodo real
// y se compara con el teórico: a amplitudes grandes el péndulo "se retrasa".
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { PLANETAS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const TOP_Y = 7;     // anclaje del péndulo
const VSL = 1.1;     // escala visual de la longitud del péndulo
const VSX = 6;       // escala visual de la elongación del muelle

function reinit(world, params) {
  world.t = 0;
  world._acc = 0;
  const esPendulo = params.montaje === 'pendulo';
  world.data = {
    // péndulo: theta (rad) / muelle: x (m)
    pos: esPendulo ? (params.amplitud * Math.PI) / 180 : params.amplitud / 100,
    vel: 0,
    cruces: [],   // tiempos de cruce ascendente por cero → T medido
    prevPos: null,
    Tmedido: null,
  };
}

function MuelleHorizontal({ world, params }) {
  const ref = useRef(null);
  const N = 60;
  const mat = useMemo(() => new THREE.Matrix4(), []);
  useFrame(() => {
    const d = world.data;
    const inst = ref.current;
    if (!d || !inst) return;
    const len = 3.2 + d.pos * VSX; // de la pared a la masa
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      mat.setPosition(
        -5 + u * len,
        1.1 + Math.sin(u * 9 * Math.PI * 2) * 0.3,
        Math.cos(u * 9 * Math.PI * 2) * 0.3,
      );
      inst.setMatrixAt(i, mat);
    }
    inst.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
    </instancedMesh>
  );
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const bobRef = useRef(null);
  const hiloRef = useRef(null);
  const masaRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world, paramsRef.current);
  }, [world, params.montaje, params.longitud, params.amplitud, params.k, params.masa, params.lugar]);

  useFixedStep(world, playing, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const g = PLANETAS[p.lugar].g;
    const a = p.montaje === 'pendulo'
      ? -(g / p.longitud) * Math.sin(d.pos)
      : -(p.k / p.masa) * d.pos;
    d.vel += a * dt;
    const prev = d.pos;
    d.pos += d.vel * dt;
    // cronómetro del periodo: cruces ascendentes por cero
    if (prev < 0 && d.pos >= 0) {
      d.cruces.push(world.t);
      if (d.cruces.length > 2) d.cruces.shift();
      if (d.cruces.length === 2) d.Tmedido = d.cruces[1] - d.cruces[0];
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    if (p.montaje === 'pendulo') {
      const L = p.longitud * VSL;
      const bx = Math.sin(d.pos) * L;
      const by = TOP_Y - Math.cos(d.pos) * L;
      if (bobRef.current) bobRef.current.position.set(bx, by, 0);
      if (hiloRef.current) {
        hiloRef.current.position.set(bx / 2, (TOP_Y + by) / 2, 0);
        hiloRef.current.scale.y = L;
        hiloRef.current.rotation.z = d.pos;
      }
    } else if (masaRef.current) {
      masaRef.current.position.set(-5 + 3.2 + d.pos * VSX + 0.45, 1.1, 0);
    }
    const g = PLANETAS[p.lugar].g;
    const Tteo = p.montaje === 'pendulo'
      ? 2 * Math.PI * Math.sqrt(p.longitud / g)
      : 2 * Math.PI * Math.sqrt(p.masa / p.k);
    const esPendulo = p.montaje === 'pendulo';
    const ep = esPendulo
      ? p.masa * g * p.longitud * (1 - Math.cos(d.pos))
      : 0.5 * p.k * d.pos * d.pos;
    const ec = esPendulo
      ? 0.5 * p.masa * (p.longitud * d.vel) ** 2
      : 0.5 * p.masa * d.vel * d.vel;
    onTelemetry?.({
      t: world.t,
      done: false,
      readouts: [
        { label: 'T teórico', value: Tteo, unit: 's', decimals: 2 },
        { label: 'T medido', value: d.Tmedido ?? NaN, unit: 's', decimals: 2 },
        { label: esPendulo ? 'Ángulo θ' : 'Elongación x', value: esPendulo ? (d.pos * 180) / Math.PI : d.pos * 100, unit: esPendulo ? '°' : 'cm', decimals: 1 },
        { label: 'Velocidad', value: esPendulo ? p.longitud * d.vel : d.vel, unit: 'm/s', decimals: 2 },
      ],
      series: { x: esPendulo ? (d.pos * 180) / Math.PI : d.pos * 100 },
      energia: [
        { label: 'Ep', value: ep, color: '#60a5fa' },
        { label: 'Ec', value: ec, color: '#4ade80' },
        { label: 'E tot', value: ep + ec, color: '#fbbf24' },
      ],
      formulaViva: esPendulo
        ? `T = 2π·√(L/g) = 2π·√(${fmt(p.longitud, 2)}/${fmt(g, 1)}) = ${fmt(Tteo, 2)} s`
        : `T = 2π·√(m/k) = 2π·√(${fmt(p.masa, 2)}/${fmt(p.k, 0)}) = ${fmt(Tteo, 2)} s`,
      extra: { Tteo, Tmedido: d.Tmedido },
    });
  });

  const d = world.data || { pos: 0.3, vel: 0 };
  const p = params;
  const esPendulo = p.montaje === 'pendulo';
  const L = p.longitud * VSL;
  const bobPos = esPendulo
    ? [Math.sin(d.pos) * L, TOP_Y - Math.cos(d.pos) * L, 0]
    : [-5 + 3.2 + d.pos * VSX + 0.45, 1.1, 0];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 40]} />
        <meshStandardMaterial color={p.lugar === 'luna' ? '#3f3f46' : '#1c2840'} roughness={0.95} />
      </mesh>
      <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {esPendulo ? (
        <group>
          {/* soporte */}
          <mesh position={[0, TOP_Y + 0.25, 0]} castShadow={quality.shadows}>
            <boxGeometry args={[3, 0.3, 1.2]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
          </mesh>
          {/* hilo */}
          <mesh ref={hiloRef}>
            <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          {/* bola */}
          <mesh ref={bobRef} position={bobPos} castShadow={quality.shadows}>
            <sphereGeometry args={[0.3 + Math.cbrt(p.masa) * 0.1, 20, 20]} />
            <meshStandardMaterial color="#f43f5e" roughness={0.4} />
          </mesh>
          {/* arco de amplitud */}
          <mesh position={[0, TOP_Y, 0]} rotation={[0, 0, -Math.PI / 2 - (p.amplitud * Math.PI) / 180]}>
            <torusGeometry args={[L, 0.015, 6, 48, (2 * p.amplitud * Math.PI) / 180]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.4} />
          </mesh>
        </group>
      ) : (
        <group>
          {/* pared + muelle + masa */}
          <mesh position={[-5.2, 1.3, 0]} castShadow={quality.shadows}>
            <boxGeometry args={[0.4, 2.6, 2]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          <MuelleHorizontal world={world} params={p} />
          <mesh ref={masaRef} position={bobPos} castShadow={quality.shadows}>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
          </mesh>
          {/* marca de equilibrio */}
          <mesh position={[-5 + 3.2 + 0.45, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.2, 1.6]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>
      )}

      {/* fuerza restauradora + velocidad */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={bobPos}
            dir={esPendulo ? [-Math.cos(d.pos) * Math.sign(d.pos || 1), -Math.abs(Math.sin(d.pos)), 0] : [-Math.sign(d.pos || 1), 0, 0]}
            length={Math.min(2, Math.abs(d.pos) * (esPendulo ? 2.2 : 8) + 0.15)}
            color="#f87171"
            label="F restauradora"
            thickness={0.035}
          />
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'oscilaciones',
  nombre: 'Oscilaciones (MAS)',
  icono: '🕰️',
  descripcion: 'Péndulo y masa-muelle ideales: cronometra el periodo y compáralo con la fórmula.',
  curso: { level: 'bachillerato', grade: 2 },
  ampliacionEn: { level: 'bachillerato', grade: 1 },
  usaTrayectoria: false,
  paramsDef: [
    {
      key: 'montaje', label: 'Montaje', type: 'select', def: 'pendulo',
      options: [
        { value: 'pendulo', label: '🕰️ Péndulo' },
        { value: 'muelle', label: '🪀 Masa-muelle' },
      ],
    },
    { key: 'longitud', label: 'Longitud L (péndulo)', min: 0.2, max: 5, step: 0.1, def: 1, unit: 'm', decimals: 1 },
    { key: 'amplitud', label: 'Amplitud (° péndulo · cm muelle)', min: 5, max: 60, step: 5, def: 20, unit: '' },
    { key: 'k', label: 'k del muelle', min: 5, max: 200, step: 5, def: 50, unit: 'N/m' },
    { key: 'masa', label: 'Masa', min: 0.5, max: 5, step: 0.25, def: 1, unit: 'kg', decimals: 2 },
    {
      key: 'lugar', label: 'Lugar (péndulo)', type: 'select', def: 'tierra',
      options: [
        { value: 'tierra', label: PLANETAS.tierra.label },
        { value: 'luna', label: PLANETAS.luna.label },
      ],
    },
  ],
  graficas: [{ key: 'x', label: 'elongación (° / cm)', color: '#67e8f9' }],
  formulas: [
    { titulo: 'Periodo del péndulo', expr: 'T = 2π·√(L/g)', leyenda: 'válido para amplitudes pequeñas; NO depende de la masa' },
    { titulo: 'Periodo masa-muelle', expr: 'T = 2π·√(m/k)', leyenda: 'NO depende de la amplitud ni de g' },
    { titulo: 'Frecuencia', expr: 'f = 1/T', leyenda: 'en hercios (Hz)' },
  ],
  fondo: (p) => (p.lugar === 'luna' && p.montaje === 'pendulo' ? '#101018' : '#101b33'),
  camara: { position: [7, 5, 10], fov: 45 },
  controles: { target: [0, 3, 0], maxDistance: 30 },
  Scene,
  retos: [
    {
      id: 'segundero',
      titulo: 'El segundero',
      descripcion: 'Péndulo en la Tierra con periodo MEDIDO entre 1,95 y 2,05 s.',
      pista: 'L = g·(T/2π)². Para T = 2 s sale L ≈ 0,99 m: prueba con 1,0 m.',
      check: (tel, p) => p.montaje === 'pendulo' && p.lugar === 'tierra'
        && tel.extra?.Tmedido != null && tel.extra.Tmedido >= 1.95 && tel.extra.Tmedido <= 2.05,
    },
    {
      id: 'reloj-lunar',
      titulo: 'Reloj lunar',
      descripcion: 'Péndulo en la Luna con T medido > 4 s usando L ≤ 1,1 m.',
      pista: 'Con g = 1,6, hasta un péndulo corto va lentísimo: 2π·√(1/1,6) ≈ 5 s.',
      check: (tel, p) => p.montaje === 'pendulo' && p.lugar === 'luna' && p.longitud <= 1.1
        && tel.extra?.Tmedido != null && tel.extra.Tmedido > 4,
    },
    {
      id: 'vibracion-rapida',
      titulo: 'Vibración de colibrí',
      descripcion: 'Masa-muelle con periodo medido menor de 0,5 s.',
      pista: 'T = 2π·√(m/k): muelle duro (k = 200) y masa pequeña.',
      check: (tel, p) => p.montaje === 'muelle'
        && tel.extra?.Tmedido != null && tel.extra.Tmedido < 0.5,
    },
    {
      id: 'isocronia',
      titulo: 'El secreto de Galileo',
      descripcion: 'Péndulo con amplitud de 50° o más: comprueba que el T medido supera al teórico (¡pero menos de un 10%!).',
      pista: 'La fórmula T = 2π·√(L/g) es solo para amplitudes pequeñas. A 60° el péndulo se retrasa un 7%.',
      check: (tel, p) => p.montaje === 'pendulo' && p.amplitud >= 50
        && tel.extra?.Tmedido != null && tel.extra?.Tteo != null
        && tel.extra.Tmedido / tel.extra.Tteo > 1.02 && tel.extra.Tmedido / tel.extra.Tteo < 1.1,
    },
  ],
  examTemplates: [
    {
      id: 't-pendulo',
      generar: (rng) => {
        const L = randInt(rng, 4, 30) / 10;
        const T = 2 * Math.PI * Math.sqrt(L / 9.8);
        return {
          enunciado: `¿Cuál es el periodo de un péndulo de ${fmt(L, 1)} m en la Tierra (g = 9,8 m/s²), para amplitudes pequeñas?`,
          tipo: 'numerica',
          unidad: 's',
          respuesta: T,
          toleranciaAbs: 0.03,
          simParams: { montaje: 'pendulo', longitud: L, amplitud: 15, k: 50, masa: 1, lugar: 'tierra' },
          simDuracion: Math.min(10, T * 2.5),
          explica: {
            pregunta: '¿De qué NO depende ese periodo?',
            opciones: [
              'De la masa de la bola (ni de la amplitud, si es pequeña)',
              'De la longitud del hilo',
              'De la gravedad del lugar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 't-muelle',
      generar: (rng) => {
        const k = randInt(rng, 2, 40) * 5;
        const m = randInt(rng, 2, 16) / 4;
        const T = 2 * Math.PI * Math.sqrt(m / k);
        return {
          enunciado: `Una masa de ${fmt(m, 2)} kg oscila unida a un muelle de k = ${k} N/m. ¿Cuál es su periodo?`,
          tipo: 'numerica',
          unidad: 's',
          respuesta: T,
          toleranciaAbs: 0.03,
          simParams: { montaje: 'muelle', longitud: 1, amplitud: 20, k, masa: m, lugar: 'tierra' },
          simDuracion: Math.min(10, T * 2.5),
          explica: {
            pregunta: 'Si lleváramos este oscilador a la Luna, ¿qué pasaría con su periodo?',
            opciones: [
              'Nada: T = 2π·√(m/k) no depende de g',
              'Aumentaría como el del péndulo',
              'Disminuiría porque pesa menos',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'masa-pendulo',
      generar: (rng) => {
        const m = pick(rng, [1, 2]);
        return {
          enunciado: `Si duplicamos la masa de la bola de un péndulo (de ${m} a ${m * 2} kg) sin tocar la longitud, su periodo…`,
          tipo: 'opciones',
          opciones: ['No cambia', 'Se duplica', 'Se reduce a la mitad'],
          correcta: 0,
          simParams: { montaje: 'pendulo', longitud: 1, amplitud: 15, k: 50, masa: m * 2, lugar: 'tierra' },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué la masa no aparece en T = 2π·√(L/g)?',
            opciones: [
              'Porque la fuerza restauradora Y la inercia crecen igual con la masa: se cancelan',
              'Porque la masa del péndulo siempre es despreciable',
              'Porque la gravedad compensa el peso extra',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'frecuencia',
      generar: (rng) => {
        const L = randInt(rng, 5, 25) / 10;
        const T = 2 * Math.PI * Math.sqrt(L / 9.8);
        return {
          enunciado: `Un péndulo de ${fmt(L, 1)} m oscila en la Tierra. ¿Cuál es su FRECUENCIA? (f = 1/T)`,
          tipo: 'numerica',
          unidad: 'Hz',
          respuesta: 1 / T,
          toleranciaAbs: 0.01,
          simParams: { montaje: 'pendulo', longitud: L, amplitud: 15, k: 50, masa: 1, lugar: 'tierra' },
          simDuracion: Math.min(10, T * 2.5),
          explica: {
            pregunta: '¿Qué significa una frecuencia de 2 Hz?',
            opciones: [
              'Que completa 2 oscilaciones cada segundo',
              'Que tarda 2 segundos en cada oscilación',
              'Que recorre 2 metros por segundo',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
