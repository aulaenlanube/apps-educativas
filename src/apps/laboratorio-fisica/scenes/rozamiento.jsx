// Simulación 2 — Empuja la caja: fuerzas y rozamiento (1º ESO).
// Rozamiento estático vs dinámico sobre tres superficies. La fuerza aplicada
// se puede cambiar EN VIVO con el slider (soltar la caja a mitad de carrera
// para verla frenar es parte de la gracia).
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { SUPERFICIES } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const VS = 0.5;       // 1 m real = 0,5 unidades
const META = 20;      // metros hasta la meta
const G = 9.8;

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    x: 0, v: 0, a: 0,
    frActual: 0,
    seMovio: false,   // llegó a vencer el rozamiento estático en algún momento
    parada: false,    // se movió y volvió a pararse
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const boxRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world);
  }, [world, playing, params.superficie, params.masa]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const { muS, muK } = SUPERFICIES[p.superficie];
    const N = p.masa * G;
    const F = p.fuerza;

    if (Math.abs(d.v) < 1e-4) {
      // en reposo: el rozamiento estático equilibra hasta su máximo μs·N
      if (F > muS * N) {
        d.frActual = muK * N;
        d.a = (F - d.frActual) / p.masa;
        d.seMovio = true;
        d.parada = false;
      } else {
        d.v = 0;
        d.frActual = F; // equilibra exactamente a la fuerza aplicada
        d.a = 0;
        if (d.seMovio) d.parada = true;
      }
    } else {
      // en movimiento: rozamiento dinámico opuesto a la velocidad
      d.frActual = muK * N;
      d.a = (F - d.frActual * Math.sign(d.v)) / p.masa;
    }
    const vPrev = d.v;
    d.v += d.a * dt;
    // si la velocidad cruza el cero, la caja se detiene (no rebota hacia atrás)
    if (vPrev > 0 && d.v <= 0) { d.v = 0; }
    d.x += d.v * dt;
    if (d.x < 0) { d.x = 0; d.v = 0; }
    if (d.x >= META) { d.x = META; d.done = true; }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (boxRef.current) boxRef.current.position.x = d.x * VS - (META * VS) / 2;
    const p = paramsRef.current;
    const { muS, muK } = SUPERFICIES[p.superficie];
    const N = p.masa * G;
    const estatico = Math.abs(d.v) < 1e-4;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'F rozamiento', value: d.frActual, unit: 'N', decimals: 1 },
        { label: 'Aceleración', value: d.a, unit: 'm/s²', decimals: 2 },
        { label: 'Velocidad', value: d.v, unit: 'm/s', decimals: 2 },
        { label: 'Posición', value: d.x, unit: 'm', decimals: 2 },
      ],
      series: { x: d.x, v: d.v },
      formulaViva: estatico
        ? `Reposo: F_roz equilibra → máx = μs·N = ${fmt(muS, 2)} · ${fmt(N, 1)} = ${fmt(muS * N, 1)} N`
        : `F_roz = μk·N = ${fmt(muK, 2)} · ${fmt(N, 1)} = ${fmt(muK * N, 1)} N`,
      extra: { seMovio: d.seMovio, parada: d.parada, xFinal: d.x },
    });
  });

  const d = world.data || { x: 0, v: 0, frActual: 0 };
  const p = params;
  const sup = SUPERFICIES[p.superficie];
  const boxX = d.x * VS - (META * VS) / 2;
  const boxY = 0.55;
  const N = p.masa * G;

  return (
    <group>
      {/* suelo base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[34, 18]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      {/* pista con el material de la superficie elegida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[META * VS + 3, 3]} />
        <meshStandardMaterial color={sup.color} roughness={p.superficie === 'hielo' ? 0.15 : 0.9} metalness={p.superficie === 'hielo' ? 0.3 : 0} />
      </mesh>
      {/* marcas cada 5 m */}
      {[0, 5, 10, 15, 20].map((m) => (
        <group key={m} position={[m * VS - (META * VS) / 2, 0.02, 1.8]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 0.5]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Billboard position={[0, 0.5, 0.4]}>
            <Texto3D fontSize={0.32} color="#cbd5e1" anchorX="center">{m} m</Texto3D>
          </Billboard>
        </group>
      ))}
      {/* meta */}
      <group position={[(META * VS) / 2, 0, 0]}>
        <mesh position={[0, 1.1, -1.6]} castShadow={quality.shadows}>
          <boxGeometry args={[0.08, 2.2, 0.08]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0.35, 1.9, -1.6]}>
          <planeGeometry args={[0.7, 0.45]} />
          <meshBasicMaterial color="#22c55e" side={2} />
        </mesh>
        <Billboard position={[0, 2.6, -1.6]}>
          <Texto3D fontSize={0.36} color="#4ade80" anchorX="center">META</Texto3D>
        </Billboard>
      </group>

      {/* la caja */}
      <mesh ref={boxRef} position={[boxX, boxY, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} />
      </mesh>

      {/* vectores (anclados a la posición actual leída de world.data, 12 Hz) */}
      {showVectors && (
        <group>
          {p.fuerza > 0.5 && (
            <VectorArrow
              origin={[boxX - 0.7, boxY, 0]}
              dir={[1, 0, 0]}
              length={Math.min(3.2, p.fuerza * 0.03 + 0.2)}
              color="#fbbf24"
              label={`F = ${fmt(p.fuerza, 0)} N`}
            />
          )}
          {d.frActual > 0.5 && (
            <VectorArrow
              origin={[boxX + 0.7, boxY - 0.25, 0]}
              dir={[-1, 0, 0]}
              length={Math.min(3.2, d.frActual * 0.03 + 0.2)}
              color="#f87171"
              label={`F_roz = ${fmt(d.frActual, 1)} N`}
            />
          )}
          <VectorArrow
            origin={[boxX, boxY + 0.6, 0]}
            dir={[0, 1, 0]}
            length={Math.min(2.4, N * 0.012 + 0.3)}
            color="#a78bfa"
            label="N"
            thickness={0.04}
          />
          <VectorArrow
            origin={[boxX, boxY - 0.6, 0]}
            dir={[0, -1, 0]}
            length={Math.min(2.4, N * 0.012 + 0.3)}
            color="#60a5fa"
            label={`P = ${fmt(N, 0)} N`}
            thickness={0.04}
          />
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'rozamiento',
  nombre: 'Empuja la caja',
  icono: '📦',
  descripcion: 'Rozamiento estático y dinámico: descubre cuánta fuerza hace falta para mover la caja en hielo, madera o goma.',
  curso: { level: 'eso', grade: 1 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'fuerza', label: 'Fuerza aplicada', min: 0, max: 100, step: 1, def: 30, unit: 'N' },
    { key: 'masa', label: 'Masa de la caja', min: 1, max: 20, step: 1, def: 6, unit: 'kg' },
    {
      key: 'superficie', label: 'Superficie', type: 'select', def: 'madera',
      options: Object.entries(SUPERFICIES).map(([value, s]) => ({ value, label: s.label })),
    },
  ],
  graficas: [
    { key: 'x', label: 'posición (m)', color: '#67e8f9' },
    { key: 'v', label: 'velocidad (m/s)', color: '#4ade80' },
  ],
  formulas: [
    { titulo: 'Rozamiento estático máximo', expr: 'F_roz,max = μs·N', leyenda: 'la caja no se mueve hasta superar este valor' },
    { titulo: 'Rozamiento dinámico', expr: 'F_roz = μk·N', leyenda: 'N = m·g en superficie horizontal' },
    { titulo: '2ª ley de Newton', expr: 'a = (F − F_roz) / m', leyenda: 'F: fuerza aplicada (N)' },
  ],
  fondo: () => '#0e1830',
  camara: { position: [0, 7, 14], fov: 45 },
  controles: { target: [0, 1, 0], maxDistance: 35 },
  Scene,
  retos: [
    {
      id: 'justo-al-limite',
      titulo: 'Justo al límite',
      descripcion: 'Mueve la caja sobre madera con una fuerza que supere el mínimo necesario en 5 N o menos.',
      pista: 'El mínimo es F = μs·N = 0,45 · m · 9,8. Calcúlalo para tu masa y afina el slider.',
      check: (tel, p) => tel.extra?.seMovio && p.superficie === 'madera'
        && p.fuerza <= 0.45 * p.masa * G + 5,
    },
    {
      id: 'frenada-precisa',
      titulo: 'Frenada de precisión',
      descripcion: 'Pon la caja en marcha y luego baja la fuerza a 0: tiene que pararse entre los 10 y los 14 m.',
      pista: 'El rozamiento dinámico frena la caja cuando dejas de empujar. En hielo desliza mucho; en goma, casi nada.',
      check: (tel, p) => tel.extra?.parada && p.fuerza < 1
        && tel.extra.xFinal >= 10 && tel.extra.xFinal <= 14,
    },
    {
      id: 'carrera-en-goma',
      titulo: 'Sprint sobre goma',
      descripcion: 'Llega a la meta (20 m) sobre goma en menos de 8 segundos.',
      pista: 'En goma el rozamiento es enorme: necesitas mucha fuerza o poca masa.',
      check: (tel, p) => tel.done && p.superficie === 'goma' && tel.t < 8,
    },
    {
      id: 'patinaje',
      titulo: 'Patinaje artístico',
      descripcion: 'Llega a la meta sobre hielo aplicando 20 N o menos.',
      pista: 'En hielo μ es pequeñísimo: hasta una fuerza pequeña acelera la caja.',
      check: (tel, p) => tel.done && p.superficie === 'hielo' && p.fuerza <= 20,
    },
  ],
  examTemplates: [
    {
      id: 'fr-dinamico',
      generar: (rng) => {
        const m = randInt(rng, 4, 18);
        const supKey = pick(rng, ['madera', 'goma']);
        const sup = SUPERFICIES[supKey];
        const fr = sup.muK * m * G;
        return {
          enunciado: `Una caja de ${m} kg se desliza sobre ${sup.label.toLowerCase().replace(/^\S+\s/, '')} (μk = ${fmt(sup.muK, 2)}). ¿Cuánto vale la fuerza de rozamiento dinámico? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: fr,
          toleranciaAbs: 0.5,
          simParams: { fuerza: Math.ceil(sup.muS * m * G) + 15, masa: m, superficie: supKey },
          simDuracion: 4,
          explica: {
            pregunta: '¿Qué es la N que aparece en F_roz = μk·N?',
            opciones: [
              'La fuerza normal: aquí vale el peso m·g porque el suelo es horizontal',
              'La fuerza que aplicamos nosotros al empujar',
              'El número de newtons del rozamiento',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'fuerza-minima',
      generar: (rng) => {
        const m = randInt(rng, 4, 16);
        const fMin = 0.45 * m * G;
        return {
          enunciado: `Una caja de ${m} kg está en reposo sobre madera (μs = 0,45). ¿Qué fuerza mínima hace falta para empezar a moverla? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: fMin,
          toleranciaAbs: 0.5,
          simParams: { fuerza: Math.ceil(fMin) + 2, masa: m, superficie: 'madera' },
          simDuracion: 4,
          explica: {
            pregunta: 'Una vez en marcha, ¿hace falta la misma fuerza para mantener la velocidad?',
            opciones: [
              'No: el rozamiento dinámico (μk) es menor que el estático (μs)',
              'Sí: el rozamiento es siempre el mismo',
              'No: en movimiento ya no hay rozamiento',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'masa-doble-fuerza',
      generar: (rng) => {
        const m = randInt(rng, 3, 9);
        return {
          enunciado: `Para mover una caja de ${m} kg sobre una superficie hace falta una fuerza mínima F. Si la caja pasa a tener ${m * 2} kg, ¿qué fuerza mínima hará falta?`,
          tipo: 'opciones',
          opciones: ['La misma F', 'El doble (2·F)', 'La mitad (F/2)'],
          correcta: 1,
          simParams: { fuerza: Math.ceil(0.45 * m * 2 * G) + 5, masa: m * 2, superficie: 'madera' },
          simDuracion: 4,
          explica: {
            pregunta: '¿Por qué se duplica?',
            opciones: [
              'Porque F_roz,max = μs·m·g es proporcional a la masa',
              'Porque la caja grande tiene más superficie de contacto',
              'Porque la gravedad aumenta con la masa',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'aceleracion',
      generar: (rng) => {
        const m = randInt(rng, 4, 12);
        const frK = 0.3 * m * G;
        const F = Math.round(frK + randInt(rng, 10, 40));
        const a = (F - frK) / m;
        return {
          enunciado: `Empujamos una caja de ${m} kg sobre madera (μk = 0,30) con ${F} N. ¿Qué aceleración lleva? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm/s²',
          respuesta: a,
          toleranciaAbs: 0.05,
          simParams: { fuerza: F, masa: m, superficie: 'madera' },
          simDuracion: 4,
          explica: {
            pregunta: '¿Qué pasaría si F fuese exactamente igual a la fuerza de rozamiento?',
            opciones: [
              'La caja seguiría a velocidad constante (a = 0)',
              'La caja se pararía de golpe',
              'La caja iría cada vez más rápido',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
