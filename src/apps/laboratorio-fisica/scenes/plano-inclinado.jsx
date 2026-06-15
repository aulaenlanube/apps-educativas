// Simulación 5 — Plano inclinado (3º ESO).
// Bloque sobre una rampa de 12 m: descompone el peso, comprueba si vence al
// rozamiento estático (desliza solo si tan θ > μs) y, si baja, integra
// a = g·(sen θ − μk·cos θ) a paso fijo. Magnitudes 100% analíticas.
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
const L = 12;               // longitud de la rampa (m)
const VS = 0.6;             // 1 m real = 0,6 unidades de escena
const DEG = Math.PI / 180;
const RAMP_T = 0.35;        // grosor visual de la rampa
const RAMP_D = 2.2;         // profundidad de la rampa (eje z)
const BLO = 0.9;            // arista visual del bloque
const MARCAS = [0, 3, 6, 9, 12];

// Superficies: las tres compartidas + opción extra sin rozamiento
const SUPS = {
  sin: { label: '✨ Sin rozamiento', muS: 0, muK: 0, color: '#38bdf8' },
  ...SUPERFICIES,
};

const geom = (anguloDeg) => {
  const th = anguloDeg * DEG;
  const Lv = L * VS;
  const halfX = (Lv * Math.cos(th)) / 2; // rampa centrada en x
  return { th, Lv, halfX, topY: Lv * Math.sin(th) };
};

// centro del bloque cuando lleva recorridos s metros desde lo alto
function posBloque(anguloDeg, s) {
  const { th, halfX } = geom(anguloDeg);
  const off = BLO / 2 + 0.02; // apoyado sobre la superficie, según la normal
  return [
    -halfX + s * VS * Math.cos(th) + Math.sin(th) * off,
    (L - s) * VS * Math.sin(th) + Math.cos(th) * off,
  ];
}

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    s: 0,          // distancia recorrida sobre la rampa (m)
    v: 0,          // velocidad a lo largo de la rampa (m/s)
    a: 0,
    frActual: 0,   // fuerza de rozamiento actual (N)
    seMovio: false,
    vFinal: null,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const blockRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world);
  }, [world, params.angulo, params.masa, params.superficie]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const { muS, muK } = SUPS[p.superficie];
    const th = p.angulo * DEG;
    const sin = Math.sin(th);
    const cos = Math.cos(th);
    const N = p.masa * G * cos;

    if (d.v < 1e-4) {
      // en reposo: desliza solo si la componente paralela supera μs·N (tan θ > μs)
      if (Math.tan(th) > muS) {
        d.a = G * (sin - muK * cos);
        d.frActual = muK * N;
        d.seMovio = true;
      } else {
        d.a = 0;
        d.v = 0;
        d.frActual = p.masa * G * sin; // el estático equilibra al peso paralelo
        return;
      }
    } else {
      d.a = G * (sin - muK * cos);
      d.frActual = muK * N;
    }
    const vPrev = d.v;
    d.v += d.a * dt;
    if (vPrev > 0 && d.v <= 0) d.v = 0; // si decelera hasta pararse, no retrocede
    d.s += d.v * dt;
    if (d.s >= L) {
      d.s = L;
      d.vFinal = d.v;
      d.done = true;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    const [bx, by] = posBloque(p.angulo, d.s);
    if (blockRef.current) blockRef.current.position.set(bx, by, 0);

    const { muS, muK } = SUPS[p.superficie];
    const th = p.angulo * DEG;
    const N = p.masa * G * Math.cos(th);
    const noDesliza = Math.abs(d.v) < 1e-4 && Math.tan(th) <= muS;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Aceleración', value: d.a, unit: 'm/s²', decimals: 2 },
        { label: 'Velocidad', value: d.v, unit: 'm/s', decimals: 2 },
        { label: 'Distancia s', value: d.s, unit: 'm', decimals: 2 },
        { label: 'Normal N', value: N, unit: 'N', decimals: 1 },
      ],
      series: { s: d.s, v: d.v },
      formulaViva: noDesliza
        ? `No desliza: tan θ = ${fmt(Math.tan(th), 2)} ≤ μs = ${fmt(muS, 2)}`
        : muK === 0
          ? `a = g·sen θ = 9,8 · ${fmt(Math.sin(th), 3)} = ${fmt(G * Math.sin(th), 2)} m/s²`
          : `a = g·(sen θ − μk·cos θ) = 9,8 · (${fmt(Math.sin(th), 3)} − ${fmt(muK, 2)}·${fmt(Math.cos(th), 3)}) = ${fmt(G * (Math.sin(th) - muK * Math.cos(th)), 2)} m/s²`,
      extra: { seMovio: d.seMovio, vFinal: d.vFinal, N },
    });
  });

  const d = world.data || { s: 0, v: 0, a: 0, frActual: 0, seMovio: false };
  const p = params;
  const sup = SUPS[p.superficie];
  const { th, Lv, halfX, topY } = geom(p.angulo);
  const [bx, by] = posBloque(p.angulo, d.s);
  const N = p.masa * G * Math.cos(th);

  return (
    <group>
      {/* suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#16213d" roughness={0.95} />
      </mesh>
      <gridHelper args={[30, 15, '#475569', '#27324a']} position={[0, 0.005, 0]} />

      {/* rampa (caja rotada −θ, su cara superior es la superficie de 12 m) */}
      <mesh
        position={[-Math.sin(th) * (RAMP_T / 2), topY / 2 - Math.cos(th) * (RAMP_T / 2), 0]}
        rotation={[0, 0, -th]}
        receiveShadow
        castShadow={quality.shadows}
      >
        <boxGeometry args={[Lv, RAMP_T, RAMP_D]} />
        <meshStandardMaterial
          color={sup.color}
          roughness={p.superficie === 'hielo' ? 0.15 : 0.85}
          metalness={p.superficie === 'hielo' ? 0.3 : 0}
        />
      </mesh>

      {/* pilar de apoyo bajo el extremo alto */}
      <mesh position={[-halfX, Math.max(0.02, (topY - RAMP_T) / 2), 0]} castShadow={quality.shadows}>
        <boxGeometry args={[0.3, Math.max(0.04, topY - RAMP_T), 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* marcas de distancia cada 3 m sobre la rampa */}
      {MARCAS.map((m) => {
        const mx = -halfX + m * VS * Math.cos(th);
        const my = (L - m) * VS * Math.sin(th);
        return (
          <group key={m}>
            <mesh
              position={[mx + Math.sin(th) * 0.03, my + Math.cos(th) * 0.03, 0]}
              rotation={[0, 0, -th]}
            >
              <boxGeometry args={[0.05, 0.02, RAMP_D + 0.05]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <Billboard position={[mx, my + 0.42, RAMP_D / 2 + 0.35]}>
              <Texto3D fontSize={0.26} color="#cbd5e1" anchorX="center">{m} m</Texto3D>
            </Billboard>
          </group>
        );
      })}

      {/* arco del ángulo en la esquina inferior + etiqueta */}
      <mesh position={[halfX, 0, RAMP_D / 2 + 0.06]}>
        <ringGeometry args={[1.05, 1.18, 32, 1, Math.PI - th, th]} />
        <meshBasicMaterial color="#fbbf24" side={2} transparent opacity={0.9} />
      </mesh>
      <Billboard
        position={[
          halfX - 1.7 * Math.cos(th / 2),
          Math.max(0.4, 1.7 * Math.sin(th / 2)),
          RAMP_D / 2 + 0.1,
        ]}
      >
        <Texto3D fontSize={0.34} color="#fbbf24" anchorX="center">θ = {fmt(p.angulo, 0)}°</Texto3D>
      </Billboard>

      {/* meta al pie de la rampa */}
      <group position={[halfX + 0.7, 0, -1.5]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.07, 1.8, 0.07]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0.32, 1.5, 0]}>
          <planeGeometry args={[0.62, 0.4]} />
          <meshBasicMaterial color="#22c55e" side={2} />
        </mesh>
        <Billboard position={[0, 2.15, 0]}>
          <Texto3D fontSize={0.32} color="#4ade80" anchorX="center">META</Texto3D>
        </Billboard>
      </group>

      {/* el bloque (posición imperativa a 60 fps en useFrame) */}
      <mesh ref={blockRef} position={[bx, by, 0]} rotation={[0, 0, -th]} castShadow={quality.shadows}>
        <boxGeometry args={[BLO, BLO, BLO]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.5} metalness={0.15} />
      </mesh>
      <Billboard position={[bx + 1.0, by + 0.85, 0]}>
        <Texto3D fontSize={0.3} color="#e2e8f0" anchorX="left">{fmt(p.masa, 0)} kg</Texto3D>
      </Billboard>

      {/* vectores: peso, normal y rozamiento (declarativos, 12 Hz) */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={[bx, by, 0]}
            dir={[0, -1, 0]}
            length={Math.min(3, 0.4 + p.masa * G * 0.012)}
            color="#f87171"
            label={`P = ${fmt(p.masa * G, 0)} N`}
          />
          <VectorArrow
            origin={[bx, by, 0]}
            dir={[Math.sin(th), Math.cos(th), 0]}
            length={Math.min(2.6, 0.4 + N * 0.012)}
            color="#a78bfa"
            label={`N = ${fmt(N, 0)} N`}
            thickness={0.04}
          />
          {d.frActual > 0.5 && (
            <VectorArrow
              origin={[bx - Math.cos(th) * 0.55, by + Math.sin(th) * 0.55, 0]}
              dir={[-Math.cos(th), Math.sin(th), 0]}
              length={Math.min(2.4, 0.3 + d.frActual * 0.014)}
              color="#fbbf24"
              label={`F_roz = ${fmt(d.frActual, 1)} N`}
              thickness={0.04}
            />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'plano-inclinado',
  nombre: 'Plano inclinado',
  icono: '📐',
  descripcion: 'Descompón el peso en una rampa: ¿desliza el bloque o lo sujeta el rozamiento? Mide N, a y la velocidad de llegada.',
  curso: { level: 'eso', grade: 3 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'angulo', label: 'Ángulo de la rampa', min: 5, max: 45, step: 1, def: 25, unit: '°' },
    { key: 'masa', label: 'Masa del bloque', min: 1, max: 20, step: 1, def: 5, unit: 'kg' },
    {
      key: 'superficie', label: 'Superficie de la rampa', type: 'select', def: 'madera',
      options: Object.entries(SUPS).map(([value, s]) => ({ value, label: s.label })),
    },
  ],
  graficas: [
    { key: 's', label: 'distancia (m)', color: '#67e8f9' },
    { key: 'v', label: 'velocidad (m/s)', color: '#4ade80' },
  ],
  formulas: [
    { titulo: 'Fuerza normal', expr: 'N = m·g·cos θ', leyenda: 'la rampa solo soporta la componente perpendicular del peso' },
    { titulo: '¿Desliza?', expr: 'tan θ > μs', leyenda: 'si no se cumple, el rozamiento estático sujeta el bloque' },
    { titulo: 'Aceleración bajando', expr: 'a = g·(sen θ − μk·cos θ)', leyenda: 'no depende de la masa' },
    { titulo: 'Velocidad al final', expr: 'v = √(2·a·L)', leyenda: 'L = 12 m (longitud de la rampa)' },
  ],
  fondo: () => '#0e1a33',
  camara: { position: [3, 5.5, 13.5], fov: 45 },
  controles: { target: [0, 2.2, 0], maxDistance: 38 },
  Scene,
  retos: [
    {
      id: 'equilibrio-limite',
      titulo: 'Equilibrio al límite',
      descripcion: 'Sobre madera, pon un ángulo de 20° o más y que el bloque aguante quieto al menos 2 segundos.',
      pista: 'Desliza cuando tan θ > μs = 0,45. El ángulo crítico es arctan 0,45 ≈ 24°: entre 20° y 24° hay margen.',
      check: (tel, p) => tel.t > 2 && !tel.extra?.seMovio && p.angulo >= 20 && p.superficie === 'madera',
    },
    {
      id: 'tobogan-hielo',
      titulo: 'Tobogán de hielo',
      descripcion: 'En hielo, llega al final de la rampa (12 m) en menos de 3 segundos.',
      pista: 'Cuanto mayor es el ángulo, mayor la aceleración: con 45° en hielo se baja en menos de 2 s.',
      check: (tel, p) => tel.done && p.superficie === 'hielo' && tel.t < 3,
    },
    {
      id: 'pegado-goma',
      titulo: 'Pegado a la goma',
      descripcion: 'Consigue que el bloque llegue a deslizar sobre la rampa de goma.',
      pista: 'La goma tiene μs = 0,9: hace falta tan θ > 0,9, es decir, más de 42°.',
      check: (tel, p) => tel.extra?.seMovio && p.superficie === 'goma',
    },
    {
      id: 'velocidad-controlada',
      titulo: 'Velocidad controlada',
      descripcion: 'Llega al final de la rampa con una velocidad entre 6 y 8 m/s.',
      pista: 'v = √(2·a·12): necesitas a entre 1,5 y 2,7 m/s². Sin rozamiento eso es un ángulo de 9° a 15°.',
      check: (tel) => tel.done && tel.extra?.vFinal != null
        && tel.extra.vFinal >= 6 && tel.extra.vFinal <= 8,
    },
  ],
  examTemplates: [
    {
      id: 'a-sin-rozamiento',
      generar: (rng) => {
        const ang = randInt(rng, 15, 40);
        const a = G * Math.sin(ang * DEG);
        return {
          enunciado: `Un bloque baja por una rampa SIN rozamiento inclinada ${ang}°. ¿Qué aceleración lleva? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm/s²',
          respuesta: a,
          toleranciaAbs: 0.05,
          simParams: { angulo: ang, masa: 5, superficie: 'sin' },
          simDuracion: Math.sqrt((2 * L) / a) + 1,
          explica: {
            pregunta: '¿Por qué la masa del bloque no aparece en el resultado?',
            opciones: [
              'La fuerza que tira (m·g·sen θ) es proporcional a la masa y se cancela al dividir entre m',
              'Porque en una rampa los objetos no pesan',
              'Porque la masa solo importa cuando hay rozamiento',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'normal-rampa',
      generar: (rng) => {
        const m = randInt(rng, 2, 15);
        const ang = randInt(rng, 10, 40);
        const N = m * G * Math.cos(ang * DEG);
        return {
          enunciado: `Un bloque de ${m} kg descansa sobre una rampa inclinada ${ang}°. ¿Cuánto vale la fuerza normal N? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: N,
          toleranciaAbs: 0.5,
          simParams: { angulo: ang, masa: m, superficie: 'goma' },
          simDuracion: 3,
          explica: {
            pregunta: '¿Por qué N es menor que el peso m·g?',
            opciones: [
              'La rampa solo soporta la componente perpendicular del peso: m·g·cos θ',
              'Porque al inclinar la rampa el bloque pierde masa',
              'Porque el rozamiento aguanta la mitad del peso',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'a-con-rozamiento',
      generar: (rng) => {
        const ang = randInt(rng, 30, 44);
        const m = randInt(rng, 2, 12);
        const a = G * (Math.sin(ang * DEG) - 0.3 * Math.cos(ang * DEG));
        return {
          enunciado: `Un bloque de ${m} kg baja deslizando por una rampa de madera inclinada ${ang}° (μk = 0,30). ¿Qué aceleración lleva? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm/s²',
          respuesta: a,
          toleranciaAbs: 0.05,
          simParams: { angulo: ang, masa: m, superficie: 'madera' },
          simDuracion: Math.sqrt((2 * L) / a) + 1,
          explica: {
            pregunta: 'Si el cálculo diera un resultado negativo, ¿qué significaría?',
            opciones: [
              'Que el rozamiento puede más que la componente del peso: el bloque no aceleraría bajando',
              'Que el bloque subiría solo por la rampa',
              'Que la gravedad se invierte en ángulos pequeños',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-masa',
      generar: (rng) => {
        const m = randInt(rng, 2, 8);
        return {
          enunciado: `Un bloque de ${m} kg baja deslizando por una rampa con rozamiento. Si lo cambiamos por otro de ${m * 2} kg (el doble) en la misma rampa, ¿qué aceleración llevará?`,
          tipo: 'opciones',
          opciones: ['La misma: la aceleración de bajada no depende de la masa', 'El doble', 'La mitad'],
          correcta: 0,
          simParams: { angulo: 35, masa: m * 2, superficie: 'madera' },
          simDuracion: 3.8,
          explica: {
            pregunta: '¿Por qué se cancela la masa en a = g·(sen θ − μk·cos θ)?',
            opciones: [
              'La fuerza que tira (m·g·sen θ) y el rozamiento (μk·m·g·cos θ) son ambos proporcionales a m',
              'Porque la masa es muy pequeña comparada con la de la rampa',
              'Porque g cambia con la masa y lo compensa',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
