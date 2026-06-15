// Simulación — Choques y momento lineal (1º Bachillerato).
// Dos carros en un riel sin rozamiento con coeficiente de restitución e:
// el momento total se conserva SIEMPRE; la energía cinética, solo si e = 1.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt } from '../engine/rng';

const VS = 0.55;          // 1 m = 0,55 unidades
const RIEL = 24;          // m de riel
const X1_INI = 4;         // posición inicial del carro 1 (m)
const X2_INI = 14;        // posición inicial del carro 2 (m)

const semiAncho = (m) => (0.5 + Math.cbrt(m) * 0.16) / 2 + 0.3;

function reinit(world, params) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    x1: X1_INI, x2: X2_INI,
    v1: params.v1, v2: params.v2,
    choco: false,
    flash: 0,
    ecAntes: 0.5 * params.m1 * params.v1 ** 2 + 0.5 * params.m2 * params.v2 ** 2,
    ecDespues: null,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const c1Ref = useRef(null);
  const c2Ref = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world, paramsRef.current);
  }, [world, params.m1, params.m2, params.v1, params.v2, params.e]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    d.x1 += d.v1 * dt;
    d.x2 += d.v2 * dt;
    if (d.flash > 0) d.flash -= dt;

    // choque: se tocan y se acercan
    const dist = d.x2 - d.x1;
    const minDist = semiAncho(p.m1) + semiAncho(p.m2);
    if (!d.pegados && dist <= minDist && d.v1 > d.v2) {
      const { m1, m2, e } = p;
      const u1 = d.v1;
      const u2 = d.v2;
      d.v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
      d.v2 = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);
      d.choco = true;
      d.flash = 0.25;
      if (e === 0) d.pegados = true;
      d.ecDespues = 0.5 * m1 * d.v1 ** 2 + 0.5 * m2 * d.v2 ** 2;
      d.x1 = d.x2 - minDist; // evita solaparse
    }
    if (d.choco && (d.x1 < 0 || d.x2 > RIEL || world.t > 25)) d.done = true;
    if (!d.choco && world.t > 25) d.done = true;
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const off = (RIEL * VS) / 2;
    if (c1Ref.current) {
      c1Ref.current.position.x = d.x1 * VS - off;
      c1Ref.current.scale.setScalar(d.flash > 0 ? 1.12 : 1);
    }
    if (c2Ref.current) {
      c2Ref.current.position.x = d.x2 * VS - off;
      c2Ref.current.scale.setScalar(d.flash > 0 ? 1.12 : 1);
    }
    const p = paramsRef.current;
    const pTotal = p.m1 * d.v1 + p.m2 * d.v2;
    const ec = 0.5 * p.m1 * d.v1 ** 2 + 0.5 * p.m2 * d.v2 ** 2;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'p total', value: pTotal, unit: 'kg·m/s', decimals: 2 },
        { label: 'Ec total', value: ec, unit: 'J', decimals: 1 },
        { label: 'v₁', value: d.v1, unit: 'm/s', decimals: 2 },
        { label: 'v₂', value: d.v2, unit: 'm/s', decimals: 2 },
      ],
      series: { v1: d.v1, v2: d.v2 },
      energia: [
        { label: 'Ec₁', value: 0.5 * p.m1 * d.v1 ** 2, color: '#22d3ee' },
        { label: 'Ec₂', value: 0.5 * p.m2 * d.v2 ** 2, color: '#f472b6' },
        { label: 'Ec tot', value: ec, color: '#fbbf24' },
      ],
      formulaViva: `p = m₁v₁ + m₂v₂ = ${fmt(pTotal, 2)} kg·m/s (se conserva)` + (d.choco && d.ecDespues != null
        ? ` · Ec: ${fmt(d.ecAntes, 1)} → ${fmt(d.ecDespues, 1)} J`
        : ''),
      extra: { choco: d.choco, v1Post: d.choco ? d.v1 : null, v2Post: d.choco ? d.v2 : null, pTotal, ecAntes: d.ecAntes, ecDespues: d.ecDespues },
    });
  });

  const d = world.data || { x1: X1_INI, x2: X2_INI, v1: params.v1, v2: params.v2 };
  const p = params;
  const off = (RIEL * VS) / 2;
  const lado1 = 0.5 + Math.cbrt(p.m1) * 0.16;
  const lado2 = 0.5 + Math.cbrt(p.m2) * 0.16;
  const pos1 = [d.x1 * VS - off, 0.45 + lado1 / 2, 0];
  const pos2 = [d.x2 * VS - off, 0.45 + lado2 / 2, 0];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      {/* riel de aire */}
      <mesh position={[0, 0.22, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[RIEL * VS + 1, 0.44, 1.4]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* carros */}
      <group ref={c1Ref} position={pos1}>
        <mesh castShadow={quality.shadows}>
          <boxGeometry args={[lado1, lado1, lado1]} />
          <meshStandardMaterial color="#22d3ee" roughness={0.45} />
        </mesh>
        <Billboard position={[0, lado1 / 2 + 0.5, 0]}>
          <Texto3D fontSize={0.32} color="#67e8f9" anchorX="center">{fmt(p.m1, 1)} kg</Texto3D>
        </Billboard>
      </group>
      <group ref={c2Ref} position={pos2}>
        <mesh castShadow={quality.shadows}>
          <boxGeometry args={[lado2, lado2, lado2]} />
          <meshStandardMaterial color="#f472b6" roughness={0.45} />
        </mesh>
        <Billboard position={[0, lado2 / 2 + 0.5, 0]}>
          <Texto3D fontSize={0.32} color="#f9a8d4" anchorX="center">{fmt(p.m2, 1)} kg</Texto3D>
        </Billboard>
      </group>

      {/* vectores de momento p = m·v */}
      {showVectors && (
        <group>
          {Math.abs(p.m1 * d.v1) > 0.3 && (
            <VectorArrow origin={[pos1[0], pos1[1] + lado1 / 2 + 1.1, 0]} dir={[Math.sign(d.v1), 0, 0]} length={Math.min(2.6, Math.abs(p.m1 * d.v1) * 0.07 + 0.15)} color="#22d3ee" label={`p₁ = ${fmt(p.m1 * d.v1, 1)}`} thickness={0.045} />
          )}
          {Math.abs(p.m2 * d.v2) > 0.3 && (
            <VectorArrow origin={[pos2[0], pos2[1] + lado2 / 2 + 1.1, 0]} dir={[Math.sign(d.v2), 0, 0]} length={Math.min(2.6, Math.abs(p.m2 * d.v2) * 0.07 + 0.15)} color="#f472b6" label={`p₂ = ${fmt(p.m2 * d.v2, 1)}`} thickness={0.045} />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'choques',
  nombre: 'Choques y momento lineal',
  icono: '🎱',
  descripcion: 'Choques elásticos e inelásticos en un riel sin rozamiento: el momento siempre se conserva.',
  curso: { level: 'bachillerato', grade: 1 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'm1', label: 'Masa carro 1', min: 0.5, max: 10, step: 0.5, def: 2, unit: 'kg', decimals: 1 },
    { key: 'm2', label: 'Masa carro 2', min: 0.5, max: 10, step: 0.5, def: 2, unit: 'kg', decimals: 1 },
    { key: 'v1', label: 'Velocidad inicial 1', min: 0, max: 10, step: 0.5, def: 5, unit: 'm/s', decimals: 1 },
    { key: 'v2', label: 'Velocidad inicial 2', min: -10, max: 10, step: 0.5, def: 0, unit: 'm/s', decimals: 1 },
    { key: 'e', label: 'Restitución e (1 = elástico)', min: 0, max: 1, step: 0.05, def: 1, unit: '', decimals: 2 },
  ],
  graficas: [
    { key: 'v1', label: 'v₁ (m/s)', color: '#22d3ee' },
    { key: 'v2', label: 'v₂ (m/s)', color: '#f472b6' },
  ],
  formulas: [
    { titulo: 'Momento lineal', expr: 'p = m·v', leyenda: 'p total constante sin fuerzas externas' },
    { titulo: 'Choque perfectamente inelástico (e = 0)', expr: 'v = (m₁v₁ + m₂v₂)/(m₁+m₂)', leyenda: 'salen pegados' },
    { titulo: 'Choque elástico (e = 1)', expr: 'se conserva p y también Ec', leyenda: 'con m₁ = m₂ y v₂ = 0: intercambian velocidades' },
  ],
  fondo: () => '#0e1830',
  camara: { position: [0, 6, 13], fov: 45 },
  controles: { target: [0, 1, 0], maxDistance: 32 },
  Scene,
  retos: [
    {
      id: 'intercambio-perfecto',
      titulo: 'Intercambio perfecto',
      descripcion: 'Choque elástico (e = 1) con masas iguales y el carro 2 parado: el 1 debe quedarse clavado tras el choque.',
      pista: 'Es el truco del billar: con m₁ = m₂ y e = 1, las velocidades se intercambian.',
      check: (tel, p) => tel.extra?.choco && p.e === 1 && p.m1 === p.m2 && p.v2 === 0
        && Math.abs(tel.extra.v1Post ?? 1) < 0.05,
    },
    {
      id: 'tren-de-mercancias',
      titulo: 'Tren de mercancías',
      descripcion: 'Con e = 0, engancha los carros y que salgan pegados a 2 m/s o más.',
      pista: 'v = (m₁v₁ + m₂v₂)/(m₁+m₂): pon mucha masa y velocidad en el carro 1.',
      check: (tel, p) => tel.extra?.choco && p.e === 0 && (tel.extra.v1Post ?? 0) >= 2,
    },
    {
      id: 'rebote-imposible',
      titulo: 'Rebote contra el muro',
      descripcion: 'Choque elástico contra un carro 2 parado con m₂ ≥ 4·m₁: el carro 1 tiene que salir REBOTADO hacia atrás.',
      pista: 'Cuando chocas contra algo mucho más pesado, rebotas: v₁ final = (m₁−m₂)/(m₁+m₂)·v₁ < 0.',
      check: (tel, p) => tel.extra?.choco && p.e === 1 && p.v2 === 0 && p.m2 >= 4 * p.m1
        && (tel.extra.v1Post ?? 1) < -0.1,
    },
    {
      id: 'choque-frontal',
      titulo: 'Frontal de momento cero',
      descripcion: 'Choque frontal (v₂ negativa) con momento total CERO antes del choque.',
      pista: 'm₁·v₁ = −m₂·v₂. Por ejemplo 2 kg a 5 m/s contra 2 kg a −5 m/s.',
      check: (tel, p) => tel.extra?.choco && p.v2 < 0 && Math.abs(p.m1 * p.v1 + p.m2 * p.v2) < 0.01,
    },
  ],
  examTemplates: [
    {
      id: 'inelastico',
      generar: (rng) => {
        const m1 = randInt(rng, 2, 8);
        const m2 = randInt(rng, 2, 8);
        const v1 = randInt(rng, 3, 8);
        const v = (m1 * v1) / (m1 + m2);
        return {
          enunciado: `Un carro de ${m1} kg a ${v1} m/s choca con otro de ${m2} kg en reposo y quedan ENGANCHADOS. ¿Con qué velocidad salen juntos?`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v,
          toleranciaAbs: 0.05,
          simParams: { m1, m2, v1, v2: 0, e: 0 },
          simDuracion: 6,
          explica: {
            pregunta: '¿Qué se ha conservado en este choque?',
            opciones: [
              'El momento lineal (la Ec ha disminuido: choque inelástico)',
              'La energía cinética (el momento se pierde al engancharse)',
              'Las dos cosas, como en todos los choques',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'p-total',
      generar: (rng) => {
        const m1 = randInt(rng, 2, 6);
        const m2 = randInt(rng, 2, 6);
        const v1 = randInt(rng, 3, 8);
        const v2 = -randInt(rng, 2, 6);
        return {
          enunciado: `Dos carros van al encuentro: ${m1} kg a ${v1} m/s y ${m2} kg a ${v2} m/s (sentido contrario). ¿Cuál es el momento lineal total del sistema?`,
          tipo: 'numerica',
          unidad: 'kg·m/s',
          respuesta: m1 * v1 + m2 * v2,
          toleranciaAbs: 0.1,
          simParams: { m1, m2, v1, v2, e: 1 },
          simDuracion: 6,
          explica: {
            pregunta: '¿Cuánto valdrá ese momento total DESPUÉS del choque?',
            opciones: [
              'Exactamente lo mismo: no hay fuerzas externas horizontales',
              'Cero: el choque lo anula',
              'Depende de si el choque es elástico o no',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'elastico-iguales',
      generar: (rng) => {
        const m = randInt(rng, 2, 6);
        const v1 = randInt(rng, 3, 9);
        return {
          enunciado: `Choque ELÁSTICO: un carro de ${m} kg a ${v1} m/s golpea a otro de ${m} kg en reposo. ¿Con qué velocidad sale el segundo carro?`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v1,
          toleranciaAbs: 0.05,
          simParams: { m1: m, m2: m, v1, v2: 0, e: 1 },
          simDuracion: 6,
          explica: {
            pregunta: '¿Y el primer carro?',
            opciones: [
              'Se queda parado: con masas iguales intercambian velocidades',
              'Sigue a la mitad de velocidad',
              'Rebota hacia atrás con la misma velocidad',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'que-se-conserva',
      generar: (rng) => {
        const e = randInt(rng, 0, 1);
        return {
          enunciado: `En un choque cualquiera entre dos carros sin fuerzas externas (${e === 1 ? 'elástico' : 'inelástico'}), ¿qué magnitud se conserva SIEMPRE?`,
          tipo: 'opciones',
          opciones: ['El momento lineal total', 'La energía cinética total', 'La velocidad de cada carro'],
          correcta: 0,
          simParams: { m1: 3, m2: 5, v1: 6, v2: 0, e },
          simDuracion: 6,
          explica: {
            pregunta: '¿De qué ley deriva la conservación del momento?',
            opciones: [
              'De la 3ª ley de Newton: las fuerzas del choque son iguales y opuestas',
              'De la ley de Hooke aplicada al parachoques',
              'De la conservación de la energía',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
