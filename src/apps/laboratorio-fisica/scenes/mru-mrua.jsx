// Simulación — Carrera MRU vs MRUA (4º ESO).
// Dos móviles en carriles paralelos hacia una meta a distancia d:
// A lleva velocidad constante (x_A = v·t) y B parte del reposo con aceleración
// constante (x_B = ½·a·t²). El punto de alcance teórico es t* = 2·v_A/a_B,
// x* = 2·v_A²/a_B. Física determinista a paso fijo en world.data; los carros
// se mueven vía ref en useFrame; vectores y textos declarativos a 12 Hz.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const VS = 0.18;     // escala visual: 1 m real = 0,18 unidades (100 m caben en 18)
const Z_A = -1.1;    // carril del móvil A (MRU)
const Z_B = 1.1;     // carril del móvil B (MRUA)
const T_MAX = 60;    // corte de seguridad de la carrera (s)

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    xA: 0, xB: 0, vB: 0,
    tA: null,   // instante de llegada de A (null = aún no ha llegado)
    tB: null,
    done: false,
  };
}

function ganadorDe(d) {
  if (d.tA != null && d.tB != null) {
    if (Math.abs(d.tA - d.tB) < 1e-3) return 'empate';
    return d.tA < d.tB ? 'A' : 'B';
  }
  if (d.done && d.tA != null) return 'A';
  if (d.done && d.tB != null) return 'B';
  return null;
}

// Carro sencillo: caja + cabina + 4 ruedas. Se desplaza por ref (position.x).
function Carro({ innerRef, x0, z, color, shadows }) {
  return (
    <group ref={innerRef} position={[x0, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow={shadows}>
        <boxGeometry args={[1.2, 0.45, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[-0.12, 0.82, 0]} castShadow={shadows}>
        <boxGeometry args={[0.55, 0.28, 0.66]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
      </mesh>
      {[[-0.4, 0.42], [0.4, 0.42], [-0.4, -0.42], [0.4, -0.42]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.2, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.14, 14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const carARef = useRef(null);
  const carBRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world);
  }, [world, params.vA, params.aB, params.meta]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const meta = p.meta;
    // móvil A: MRU (x = v·t). Cruce interpolado dentro del paso → tA exacto.
    if (d.tA == null) {
      const xPrev = d.xA;
      d.xA += p.vA * dt;
      if (d.xA >= meta) {
        d.tA = world.t + (meta - xPrev) / p.vA;
        d.xA = meta;
      }
    }
    // móvil B: MRUA desde reposo. Integración punto medio: exacta para a constante.
    if (d.tB == null) {
      const xPrev = d.xB;
      const vPrev = d.vB;
      d.vB += p.aB * dt;
      d.xB += 0.5 * (vPrev + d.vB) * dt;
      if (d.xB >= meta) {
        const frac = d.xB > xPrev ? (meta - xPrev) / (d.xB - xPrev) : 1;
        d.tB = world.t + frac * dt;
        d.xB = meta;
      }
    }
    if ((d.tA != null && d.tB != null) || world.t + dt >= T_MAX) d.done = true;
  });

  // objetos rápidos + telemetría, cada frame
  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    const half = (p.meta * VS) / 2;
    if (carARef.current) carARef.current.position.x = d.xA * VS - half;
    if (carBRef.current) carBRef.current.position.x = d.xB * VS - half;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Tiempo', value: world.t, unit: 's', decimals: 2 },
        { label: 'Posición de A', value: d.xA, unit: 'm', decimals: 1 },
        { label: 'Posición de B', value: d.xB, unit: 'm', decimals: 1 },
        { label: 'Velocidad de B', value: d.vB, unit: 'm/s', decimals: 2 },
      ],
      series: { xA: d.xA, xB: d.xB },
      formulaViva: d.tB == null
        ? `x_B = ½·a·t² = ½ · ${fmt(p.aB, 1)} · ${fmt(world.t, 2)}² = ${fmt(d.xB, 2)} m`
        : `t_B = √(2·d/a) = √(2 · ${fmt(p.meta, 0)} / ${fmt(p.aB, 1)}) = ${fmt(d.tB, 2)} s`,
      extra: {
        xAlcance: (2 * p.vA * p.vA) / p.aB,
        tA: d.tA,
        tB: d.tB,
        ganador: ganadorDe(d),
        ambosLlegaron: d.tA != null && d.tB != null,
      },
    });
  });

  const d = world.data || { xA: 0, xB: 0, vB: 0, tA: null, tB: null, done: false };
  const p = params;
  const half = (p.meta * VS) / 2;
  const carAX = d.xA * VS - half;
  const carBX = d.xB * VS - half;
  const xStar = (2 * p.vA * p.vA) / p.aB;
  const ganador = ganadorDe(d);
  const marcas = [];
  for (let m = 20; m < p.meta; m += 20) marcas.push(m);

  return (
    <group>
      {/* explanada */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[p.meta * VS + 8, 14]} />
        <meshStandardMaterial color="#16213b" roughness={0.95} />
      </mesh>
      {/* carril A (MRU, verde) y carril B (MRUA, cian) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z_A]} receiveShadow>
        <planeGeometry args={[p.meta * VS + 2.4, 1.7]} />
        <meshStandardMaterial color="#173b2a" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, Z_B]} receiveShadow>
        <planeGeometry args={[p.meta * VS + 2.4, 1.7]} />
        <meshStandardMaterial color="#14394a" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[p.meta * VS + 2.4, 0.06]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* etiquetas de carril */}
      <Billboard position={[-half - 1.7, 0.8, Z_A]}>
        <Texto3D fontSize={0.34} color="#4ade80" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">A · MRU</Texto3D>
      </Billboard>
      <Billboard position={[-half - 1.7, 0.8, Z_B]}>
        <Texto3D fontSize={0.34} color="#22d3ee" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">B · MRUA</Texto3D>
      </Billboard>

      {/* línea y bandera de salida */}
      <group position={[-half, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[0.16, 4.2]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[0, 0.9, -2.5]} castShadow={quality.shadows}>
          <boxGeometry args={[0.08, 1.8, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0.32, 1.55, -2.5]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#fbbf24" side={2} />
        </mesh>
        <Billboard position={[0, 2.25, -2.5]}>
          <Texto3D fontSize={0.36} color="#fbbf24" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">SALIDA</Texto3D>
        </Billboard>
      </group>

      {/* marcas de distancia cada 20 m */}
      {marcas.map((m) => (
        <group key={m} position={[m * VS - half, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[0.05, 4]} />
            <meshBasicMaterial color="#64748b" />
          </mesh>
          <Billboard position={[0, 0.45, 2.55]}>
            <Texto3D fontSize={0.3} color="#94a3b8" anchorX="center">{m} m</Texto3D>
          </Billboard>
        </group>
      ))}

      {/* meta */}
      <group position={[half, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[0.18, 4.2]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 0.9, -2.5]} castShadow={quality.shadows}>
          <boxGeometry args={[0.08, 1.8, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 0.9, 2.5]} castShadow={quality.shadows}>
          <boxGeometry args={[0.08, 1.8, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0.32, 1.55, 2.5]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshBasicMaterial color="#22c55e" side={2} />
        </mesh>
        <Billboard position={[0, 2.35, 0]}>
          <Texto3D fontSize={0.4} color="#4ade80" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            META · {fmt(p.meta, 0)} m
          </Texto3D>
        </Billboard>
      </group>

      {/* punto de alcance teórico x* = 2·v_A²/a_B (solo si cae dentro de la pista) */}
      {xStar <= p.meta && (
        <group position={[xStar * VS - half, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
            <planeGeometry args={[0.08, 4.4]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
          </mesh>
          <Billboard position={[0, 1.7, 0]}>
            <Texto3D fontSize={0.3} color="#fbbf24" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
              Alcance: x* = {fmt(xStar, 1)} m
            </Texto3D>
          </Billboard>
        </group>
      )}

      {/* los dos carros (movidos por ref en useFrame) */}
      <Carro innerRef={carARef} x0={carAX} z={Z_A} color="#22c55e" shadows={quality.shadows} />
      <Carro innerRef={carBRef} x0={carBX} z={Z_B} color="#22d3ee" shadows={quality.shadows} />

      {/* tiempos de llegada */}
      {d.tA != null && (
        <Billboard position={[half + 1, 1.4, Z_A]}>
          <Texto3D fontSize={0.32} color="#4ade80" outlineWidth={0.02} outlineColor="#0f172a" anchorX="left">
            A: {fmt(d.tA, 2)} s
          </Texto3D>
        </Billboard>
      )}
      {d.tB != null && (
        <Billboard position={[half + 1, 1.4, Z_B]}>
          <Texto3D fontSize={0.32} color="#22d3ee" outlineWidth={0.02} outlineColor="#0f172a" anchorX="left">
            B: {fmt(d.tB, 2)} s
          </Texto3D>
        </Billboard>
      )}
      {d.done && ganador && (
        <Billboard position={[0, 3.6, 0]}>
          <Texto3D
            fontSize={0.6}
            color={ganador === 'A' ? '#4ade80' : ganador === 'B' ? '#22d3ee' : '#fbbf24'}
            outlineWidth={0.03}
            outlineColor="#0f172a"
            anchorX="center"
          >
            {ganador === 'empate' ? '¡Empate!' : ganador === 'A' ? '¡Gana A (MRU)!' : '¡Gana B (MRUA)!'}
          </Texto3D>
        </Billboard>
      )}

      {/* vectores de velocidad (declarativos, 12 Hz) */}
      {showVectors && (
        <group>
          {d.tA == null && p.vA > 0.3 && (
            <VectorArrow
              origin={[carAX, 1.05, Z_A]}
              dir={[1, 0, 0]}
              length={Math.min(2.6, 0.3 + p.vA * 0.13)}
              color="#4ade80"
              label={`v_A = ${fmt(p.vA, 1)} m/s`}
            />
          )}
          {d.tB == null && d.vB > 0.3 && (
            <VectorArrow
              origin={[carBX, 1.05, Z_B]}
              dir={[1, 0, 0]}
              length={Math.min(2.6, 0.3 + d.vB * 0.13)}
              color="#22d3ee"
              label={`v_B = ${fmt(d.vB, 1)} m/s`}
            />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'mru-mrua',
  nombre: 'Carrera MRU vs MRUA',
  icono: '🏎️',
  descripcion: 'Velocidad constante contra aceleración: ¿quién cruza antes la meta? Recta contra parábola.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'vA', label: 'Velocidad de A (MRU)', min: 1, max: 15, step: 0.5, def: 6, unit: 'm/s', decimals: 1 },
    { key: 'aB', label: 'Aceleración de B (MRUA)', min: 0.2, max: 3, step: 0.1, def: 1, unit: 'm/s²', decimals: 1 },
    { key: 'meta', label: 'Distancia a la meta', min: 30, max: 100, step: 5, def: 60, unit: 'm' },
  ],
  graficas: [
    { key: 'xA', label: 'x_A (m) · recta', color: '#4ade80' },
    { key: 'xB', label: 'x_B (m) · parábola', color: '#22d3ee' },
  ],
  formulas: [
    { titulo: 'MRU (móvil A)', expr: 'x = v·t', leyenda: 'velocidad constante: recorre lo mismo cada segundo' },
    { titulo: 'MRUA desde reposo (móvil B)', expr: 'x = ½·a·t² · v = a·t', leyenda: 'a: aceleración (m/s²)' },
    { titulo: 'Punto de alcance', expr: 'x* = 2·v_A²/a_B · t* = 2·v_A/a_B', leyenda: 'donde B, saliendo del reposo, alcanza a A' },
    { titulo: 'Velocidad final del MRUA', expr: 'v = √(2·a·d)', leyenda: 'd: distancia recorrida desde el reposo (m)' },
  ],
  fondo: () => '#0d1730',
  camara: { position: [0, 9, 16], fov: 45 },
  controles: { target: [0, 0.5, 0], maxDistance: 45 },
  Scene,
  retos: [
    {
      id: 'foto-finish',
      titulo: 'Foto-finish',
      descripcion: 'Consigue que los dos coches crucen la meta con menos de 0,3 s de diferencia.',
      pista: 't_A = d/v_A y t_B = √(2·d/a_B). Con d = 60 m, v_A = 6 m/s y a_B = 1,2 m/s² los dos tardan 10 s exactos.',
      check: (tel) => tel.done && tel.extra?.ambosLlegaron
        && Math.abs(tel.extra.tA - tel.extra.tB) < 0.3,
    },
    {
      id: 'remontada',
      titulo: 'Remontada épica',
      descripcion: 'Que B alcance a A más allá de los 50 m pero antes de la meta, y gane la carrera.',
      pista: 'El alcance ocurre en x* = 2·v_A²/a_B. Con v_A = 6 y a_B = 1,2 sale x* = 60 m: pon la meta en 80.',
      check: (tel, p) => tel.done && tel.extra?.ganador === 'B'
        && tel.extra.xAlcance > 50 && tel.extra.xAlcance < p.meta,
    },
    {
      id: 'tortuga',
      titulo: 'La tortuga gana',
      descripcion: 'Con la meta a 60 m o más lejos, consigue que gane el coche A (el de velocidad constante).',
      pista: 'A gana si el alcance x* = 2·v_A²/a_B queda más lejos que la meta: v_A alta y a_B baja. Prueba v_A = 10 y a_B = 0,5.',
      check: (tel, p) => tel.done && tel.extra?.ganador === 'A' && p.meta >= 60,
    },
  ],
  examTemplates: [
    {
      id: 'tiempo-mru',
      generar: (rng) => {
        const vA = pick(rng, [5, 10]);
        const meta = vA === 5 ? randInt(rng, 6, 12) * 5 : randInt(rng, 6, 20) * 5;
        const t = meta / vA;
        return {
          enunciado: `En la carrera, el coche A avanza con velocidad constante de ${vA} m/s (MRU). ¿Cuánto tarda en llegar a la meta situada a ${meta} m?`,
          tipo: 'numerica',
          unidad: 's',
          respuesta: t,
          toleranciaAbs: 0.1,
          simParams: { vA, aB: 1, meta },
          simDuracion: t + 1,
          explica: {
            pregunta: '¿Cómo es la gráfica posición-tiempo (x-t) de un MRU?',
            opciones: [
              'Una recta cuya pendiente es la velocidad',
              'Una parábola que se va empinando',
              'Una curva que se aplana hasta hacerse horizontal',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'distancia-mrua',
      generar: (rng) => {
        const a = randInt(rng, 4, 20) / 10;
        const t = randInt(rng, 4, 9);
        const x = 0.5 * a * t * t;
        const metaSim = Math.min(100, Math.max(30, Math.ceil(x / 5) * 5));
        return {
          enunciado: `El coche B parte del reposo con aceleración constante de ${fmt(a, 1)} m/s² (MRUA). ¿Qué distancia recorre en los primeros ${t} s?`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: x,
          toleranciaAbs: 0.2,
          simParams: { vA: 1, aB: a, meta: metaSim },
          simDuracion: t + 1,
          explica: {
            pregunta: '¿Por qué aparece t² en la fórmula x = ½·a·t²?',
            opciones: [
              'Porque la velocidad también crece con t: la distancia es la velocidad media (½·a·t) por el tiempo t',
              'Porque la aceleración va aumentando con el tiempo',
              'Porque el tiempo se cuenta dos veces, a la ida y a la vuelta',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'velocidad-final-mrua',
      generar: (rng) => {
        const a = randInt(rng, 8, 20) / 10;
        const dMeta = randInt(rng, 7, 16) * 5;
        const v = Math.sqrt(2 * a * dMeta);
        const tLlegada = Math.sqrt((2 * dMeta) / a);
        return {
          enunciado: `El coche B parte del reposo y acelera a ${fmt(a, 1)} m/s² constantes. ¿Con qué velocidad cruza la meta situada a ${dMeta} m?`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v,
          toleranciaAbs: 0.1,
          simParams: { vA: 1, aB: a, meta: dMeta },
          simDuracion: tLlegada + 1,
          explica: {
            pregunta: 'Si la distancia recorrida se cuadruplica (×4), la velocidad final del MRUA…',
            opciones: [
              'Se duplica (×2), porque v crece con la raíz cuadrada de la distancia',
              'Se cuadruplica (×4), porque v es proporcional a la distancia',
              'No cambia: solo depende de la aceleración',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'grafica-mrua',
      generar: (rng) => {
        const a = pick(rng, [0.8, 1.2, 1.6]);
        return {
          enunciado: 'Observa la carrera: el coche B parte del reposo y acelera de forma constante (MRUA). ¿Cómo es su gráfica posición-tiempo (x-t)?',
          tipo: 'opciones',
          opciones: [
            'Una recta inclinada de pendiente constante',
            'Una parábola: una curva que se va empinando cada vez más',
            'Una línea horizontal que no sube',
          ],
          correcta: 1,
          simParams: { vA: 6, aB: a, meta: 60 },
          simDuracion: Math.sqrt((2 * 60) / a) + 1,
          explica: {
            pregunta: '¿Por qué la gráfica x-t del MRUA se curva hacia arriba?',
            opciones: [
              'Porque la pendiente de la gráfica x-t es la velocidad, y en un MRUA la velocidad crece con el tiempo',
              'Porque la aceleración va aumentando durante el movimiento',
              'Porque el coche recorre la misma distancia en cada segundo',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
