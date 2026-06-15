// Simulación 1 — Caída libre y gravedad (1º ESO).
// ESCENA DE REFERENCIA: el resto de escenas del laboratorio siguen este patrón
// (ver CONTRATO_ESCENAS.md). Física determinista a paso fijo en world.data;
// objetos rápidos vía ref en useFrame; vectores declarativos a 12 Hz.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { PLANETAS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const VS = 0.4;          // escala visual: 1 m real = 0,4 unidades de escena
const RADIO = 0.3;       // radio físico de la bola (m) para el drag
const CD = 0.47;         // coeficiente de arrastre de una esfera
const RHO_AIRE = 1.2;    // kg/m³ (solo en la Tierra tiene sentido, didácticamente se aplica igual)
const AREA = Math.PI * RADIO * RADIO;

const FONDOS = { tierra: '#0c1f3d', luna: '#101018', marte: '#2a130d', jupiter: '#231a09' };
const SUELOS = { tierra: '#1e4d2b', luna: '#3f3f46', marte: '#7c2d12', jupiter: '#92710c' };

function reinit(world, params) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    y: params.altura,   // altura actual (m)
    v: 0,               // velocidad de caída (m/s, positiva hacia abajo)
    a: PLANETAS[params.planeta].g,
    trail: [],          // posiciones pasadas para la trayectoria
    lastTrailT: 0,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, showTrajectory, quality, onTelemetry }) {
  const ballRef = useRef(null);
  const trailRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  // (re)inicializa al montar, al pulsar Reset y al cambiar condiciones iniciales en pausa
  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world, paramsRef.current);
  }, [world, params.altura, params.planeta, params.aire]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const g = PLANETAS[p.planeta].g;
    // Euler semi-implícito: drag cuadrático opuesto a la velocidad
    const fDrag = p.aire ? 0.5 * RHO_AIRE * CD * AREA * d.v * Math.abs(d.v) : 0;
    d.a = g - fDrag / p.masa;
    d.v += d.a * dt;
    d.y -= d.v * dt;
    if (world.t - d.lastTrailT > 0.2 && d.trail.length < 60) {
      d.trail.push(d.y);
      d.lastTrailT = world.t;
    }
    if (d.y <= 0) {
      d.y = 0;
      d.done = true;
    }
  });

  // objetos rápidos + telemetría, cada frame
  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (ballRef.current) ballRef.current.position.y = d.y * VS + RADIO * 2;
    // trayectoria con instancias (imperativo, sin re-render)
    const inst = trailRef.current;
    if (inst) {
      const m = new THREE.Matrix4();
      const n = showTrajectory ? d.trail.length : 0;
      for (let i = 0; i < n; i++) {
        m.setPosition(0, d.trail[i] * VS + RADIO * 2, 0);
        inst.setMatrixAt(i, m);
      }
      inst.count = n;
      inst.instanceMatrix.needsUpdate = true;
    }
    const p = paramsRef.current;
    const g = PLANETAS[p.planeta].g;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Tiempo', value: world.t, unit: 's', decimals: 2 },
        { label: 'Altura', value: d.y, unit: 'm', decimals: 2 },
        { label: 'Velocidad', value: d.v, unit: 'm/s', decimals: 2 },
        { label: 'Peso', value: p.masa * g, unit: 'N', decimals: 1 },
      ],
      series: { y: d.y, v: d.v },
      formulaViva: p.aire
        ? `a = g − F_aire/m = ${fmt(d.a, 2)} m/s²`
        : `v = g·t = ${fmt(g, 1)} · ${fmt(world.t, 2)} = ${fmt(d.v, 2)} m/s`,
      extra: { vImpacto: d.done ? d.v : null },
    });
  });

  const d = world.data || { y: params.altura, v: 0, a: 9.8 };
  const p = params;
  const g = PLANETAS[p.planeta].g;
  const ballY = d.y * VS + RADIO * 2;
  const marcas = useMemo(() => {
    const out = [];
    for (let h = 0; h <= 30; h += 5) out.push(h);
    return out;
  }, []);

  return (
    <group>
      {/* suelo del planeta */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color={SUELOS[p.planeta]} roughness={0.95} />
      </mesh>
      <gridHelper args={[32, 16, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* poste de medición con marcas cada 5 m */}
      <mesh position={[-1.6, 6.2, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[0.12, 12.6, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
      </mesh>
      {marcas.map((h) => (
        <group key={h} position={[-1.6, h * VS + RADIO * 2, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.05, 0.16]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
          <Billboard position={[-0.8, 0, 0]}>
            <Texto3D fontSize={0.34} color="#cbd5e1" anchorX="center">{h} m</Texto3D>
          </Billboard>
        </group>
      ))}

      {/* plataforma de lanzamiento a la altura inicial */}
      <mesh position={[0.9, p.altura * VS + RADIO * 2 - 0.08, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[1.1, 0.12, 1.1]} />
        <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* trayectoria (instancias actualizadas en useFrame) */}
      <instancedMesh ref={trailRef} args={[undefined, undefined, 60]} frustumCulled={false}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
      </instancedMesh>

      {/* la bola */}
      <mesh ref={ballRef} position={[0, ballY, 0]} castShadow={quality.shadows}>
        <sphereGeometry args={[RADIO * 1.6, 24, 24]} />
        <meshStandardMaterial color="#f43f5e" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* vectores de fuerza y velocidad (declarativos, 12 Hz) */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={[0, ballY, 0]}
            dir={[0, -1, 0]}
            length={Math.min(3, 0.5 + p.masa * g * 0.018)}
            color="#f87171"
            label={`P = ${fmt(p.masa * g, 1)} N`}
          />
          {p.aire && d.v > 0.5 && (
            <VectorArrow
              origin={[0.45, ballY, 0]}
              dir={[0, 1, 0]}
              length={Math.min(2.6, 0.5 * RHO_AIRE * CD * AREA * d.v * d.v * 0.018 + 0.15)}
              color="#60a5fa"
              label="F aire"
            />
          )}
          {Math.abs(d.v) > 0.3 && (
            <VectorArrow
              origin={[-0.55, ballY, 0]}
              dir={[0, -1, 0]}
              length={Math.min(2.6, Math.abs(d.v) * 0.09)}
              color="#4ade80"
              label={`v = ${fmt(d.v, 1)} m/s`}
              thickness={0.035}
            />
          )}
        </group>
      )}
    </group>
  );
}

const PLANETA_OPTIONS = Object.entries(PLANETAS).map(([value, pl]) => ({
  value,
  label: `${pl.label.split(' ')[0]} ${pl.g}`,
}));

const simDef = {
  id: 'caida-libre',
  nombre: 'Caída libre y gravedad',
  icono: '🍎',
  descripcion: 'Suelta objetos en distintos planetas, con o sin aire, y mide tiempo y velocidad.',
  curso: { level: 'eso', grade: 1 },
  paramsDef: [
    { key: 'masa', label: 'Masa', min: 0.5, max: 10, step: 0.5, def: 2, unit: 'kg' },
    { key: 'altura', label: 'Altura inicial', min: 2, max: 30, step: 1, def: 15, unit: 'm' },
    {
      key: 'planeta', label: 'Lugar (g en m/s²)', type: 'select', def: 'tierra',
      options: PLANETA_OPTIONS,
    },
    { key: 'aire', label: 'Resistencia del aire', type: 'toggle', def: false },
  ],
  graficas: [
    { key: 'y', label: 'altura (m)', color: '#67e8f9' },
    { key: 'v', label: 'velocidad (m/s)', color: '#4ade80' },
  ],
  formulas: [
    { titulo: 'Tiempo de caída', expr: 't = √(2·h / g)', leyenda: 'h: altura (m) · g: gravedad (m/s²)' },
    { titulo: 'Velocidad de impacto', expr: 'v = √(2·g·h) = g·t', leyenda: 'sin resistencia del aire' },
    { titulo: 'Peso', expr: 'P = m·g', leyenda: 'm: masa (kg) · P en newtons (N)' },
  ],
  fondo: (params) => FONDOS[params.planeta] || '#0c1f3d',
  camara: { position: [10, 7, 12], fov: 45 },
  controles: { target: [0, 4, 0], maxDistance: 40 },
  Scene,
  retos: [
    {
      id: 'tres-segundos',
      titulo: 'Tres segundos exactos',
      descripcion: 'Sin aire, consigue una caída que dure entre 2,9 y 3,1 segundos.',
      pista: 'h = ½·g·t². En la Tierra harían falta 44 m y el límite es 30… prueba con una gravedad menor: en Marte bastan unos 16,7 m.',
      check: (tel, p) => tel.done && !p.aire && tel.t >= 2.9 && tel.t <= 3.1,
    },
    {
      id: 'gravedad-baja',
      titulo: 'Turista espacial',
      descripcion: 'Consigue una caída de más de 4 segundos sin resistencia del aire.',
      pista: 'Cuanto menor es g, más dura la caída. ¿Qué lugar tiene la gravedad más baja?',
      check: (tel, p) => tel.done && !p.aire && tel.t > 4,
    },
    {
      id: 'paracaidista',
      titulo: 'Aterrizaje suave',
      descripcion: 'Con resistencia del aire, deja caer desde 25 m o más y llega al suelo a menos de 12 m/s.',
      pista: 'El aire frena más cuanto más rápido vas… y cuanto MENOS masa tiene el objeto.',
      check: (tel, p) => tel.done && p.aire && p.altura >= 25 && tel.extra?.vImpacto != null && tel.extra.vImpacto < 12,
    },
    {
      id: 'velocidad-exacta',
      titulo: 'Radar de velocidad',
      descripcion: 'En la Tierra y sin aire, impacta contra el suelo entre 19 y 21 m/s.',
      pista: 'v = √(2·g·h). Despeja la altura para v = 20 m/s.',
      check: (tel, p) => tel.done && p.planeta === 'tierra' && !p.aire
        && tel.extra?.vImpacto != null && tel.extra.vImpacto >= 19 && tel.extra.vImpacto <= 21,
    },
  ],
  examTemplates: [
    {
      id: 'tiempo-caida',
      generar: (rng) => {
        const h = randInt(rng, 5, 28);
        const planeta = pick(rng, ['tierra', 'luna', 'marte']);
        const g = PLANETAS[planeta].g;
        const t = Math.sqrt((2 * h) / g);
        return {
          enunciado: `Se deja caer una bola desde ${h} m en ${PLANETAS[planeta].label} (g = ${fmt(g, 1)} m/s²), sin aire. ¿Cuánto tarda en llegar al suelo?`,
          tipo: 'numerica',
          unidad: 's',
          respuesta: t,
          toleranciaAbs: 0.05,
          simParams: { masa: 2, altura: h, planeta, aire: false },
          simDuracion: t + 1,
          explica: {
            pregunta: '¿Por qué la masa de la bola no aparece en el cálculo?',
            opciones: [
              'Porque sin aire todos los cuerpos caen con la misma aceleración',
              'Porque la masa es demasiado pequeña para influir',
              'Porque la gravedad anula el efecto de la masa al multiplicarla',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'velocidad-impacto',
      generar: (rng) => {
        const h = randInt(rng, 5, 28);
        const planeta = pick(rng, ['tierra', 'marte']);
        const g = PLANETAS[planeta].g;
        const v = Math.sqrt(2 * g * h);
        return {
          enunciado: `Una maceta cae desde ${h} m en ${PLANETAS[planeta].label} (g = ${fmt(g, 1)} m/s²), sin aire. ¿Con qué velocidad llega al suelo?`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v,
          toleranciaAbs: 0.1,
          simParams: { masa: 3, altura: h, planeta, aire: false },
          simDuracion: Math.sqrt((2 * h) / g) + 1,
          explica: {
            pregunta: '¿De dónde sale la fórmula v = √(2·g·h)?',
            opciones: [
              'De igualar la energía potencial m·g·h con la cinética ½·m·v²',
              'De multiplicar la gravedad por la altura',
              'De la ley de Hooke aplicada a la caída',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-altura',
      generar: (rng) => {
        const h = randInt(rng, 5, 14);
        return {
          enunciado: `Una bola tarda un tiempo t en caer desde ${h} m. Si la soltamos desde ${h * 2} m (el doble), ¿cuánto tardará ahora?`,
          tipo: 'opciones',
          opciones: ['El doble (2·t)', 'Un poco más: ×1,41 (√2 · t)', 'Cuatro veces más (4·t)'],
          correcta: 1,
          simParams: { masa: 2, altura: h * 2, planeta: 'tierra', aire: false },
          simDuracion: Math.sqrt((2 * h * 2) / 9.8) + 1,
          explica: {
            pregunta: '¿Por qué el tiempo no se duplica al duplicar la altura?',
            opciones: [
              'Porque h crece con t² (h = ½·g·t²), así que t crece con √h',
              'Porque la gravedad aumenta con la altura',
              'Porque la bola alcanza antes su velocidad máxima',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'masa-doble',
      generar: (rng) => {
        const m = randInt(rng, 1, 4);
        return {
          enunciado: `Dos bolas caen a la vez desde la misma altura, sin aire: una de ${m} kg y otra de ${m * 2} kg. ¿Cuál llega antes al suelo?`,
          tipo: 'opciones',
          opciones: ['La más pesada', 'La más ligera', 'Llegan a la vez'],
          correcta: 2,
          simParams: { masa: m * 2, altura: 20, planeta: 'tierra', aire: false },
          simDuracion: Math.sqrt((2 * 20) / 9.8) + 1,
          explica: {
            pregunta: '¿Qué experimento histórico demostró esto en la Luna?',
            opciones: [
              'El martillo y la pluma del astronauta David Scott (Apolo 15)',
              'El péndulo de Foucault',
              'La manzana de Newton',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
