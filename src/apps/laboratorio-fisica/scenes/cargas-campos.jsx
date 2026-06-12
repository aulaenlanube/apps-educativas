// Simulación — Cargas y campos: Coulomb y Lorentz (2º Bachillerato).
// Montaje Coulomb: fuerza entre dos cargas (cuasi-estático, vectores mutuos).
// Montaje Lorentz: ion didáctico girando en un campo B uniforme vertical;
// el radio R = m·v/(q·B) y el periodo T = 2π·m/(q·B) — que NO depende de v.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const K_E = 8.99e9;   // constante de Coulomb
const ALTURA = 1.6;   // plano del ion

function reinit(world, params) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    // estado del ion (Lorentz): parte del origen hacia +x
    x: 0, z: 0, vx: params.v, vz: 0,
    trail: [],
    lastTrailT: 0,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, showTrajectory, quality, onTelemetry }) {
  const ionRef = useRef(null);
  const trailRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.montaje, params.qL, params.masa, params.v, params.B]);

  useFixedStep(world, playing, speed, (dt) => {
    const p = paramsRef.current;
    if (p.montaje !== 'lorentz') return;
    const d = world.data;
    const q = p.qL * 1e-3;   // mC → C
    const m = p.masa * 1e-3; // g → kg
    if (Math.abs(q) < 1e-9) {
      // sin carga: el ion sigue recto
      d.x += d.vx * dt;
      d.z += d.vz * dt;
    } else {
      // F = q·(v × B) con B = (0, B, 0) → a = (q/m)·(−vz·B, 0, vx·B)
      const ax = (q / m) * (-d.vz * p.B);
      const az = (q / m) * (d.vx * p.B);
      d.vx += ax * dt;
      d.vz += az * dt;
      d.x += d.vx * dt;
      d.z += d.vz * dt;
    }
    // reaparece si se aleja demasiado (qL = 0 o radios enormes)
    if (Math.hypot(d.x, d.z) > 13) { d.x = 0; d.z = 0; d.trail.length = 0; }
    if (world.t - d.lastTrailT > 0.05 && d.trail.length < 200) {
      d.trail.push([d.x, d.z]);
      d.lastTrailT = world.t;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    if (ionRef.current) ionRef.current.position.set(d.x, ALTURA, d.z);
    const inst = trailRef.current;
    if (inst) {
      const m = new THREE.Matrix4();
      const n = (showTrajectory && p.montaje === 'lorentz') ? d.trail.length : 0;
      for (let i = 0; i < n; i++) {
        m.setPosition(d.trail[i][0], ALTURA, d.trail[i][1]);
        inst.setMatrixAt(i, m);
      }
      inst.count = n;
      inst.instanceMatrix.needsUpdate = true;
    }
    const q = p.qL * 1e-3;
    const m = p.masa * 1e-3;
    const F = (K_E * Math.abs(p.q1 * p.q2) * 1e-12) / (p.r * p.r); // µC → C
    const R = Math.abs(q) > 1e-9 ? (m * p.v) / (Math.abs(q) * p.B) : Infinity;
    const T = Math.abs(q) > 1e-9 ? (2 * Math.PI * m) / (Math.abs(q) * p.B) : Infinity;
    const esCoulomb = p.montaje === 'coulomb';
    onTelemetry?.({
      t: world.t,
      done: false,
      readouts: esCoulomb
        ? [
          { label: 'Fuerza F', value: F, unit: 'N', decimals: 3 },
          { label: 'Tipo', value: p.q1 * p.q2 < 0 ? '🧲 Atracción' : p.q1 * p.q2 > 0 ? '↔️ Repulsión' : '— (carga nula)', unit: '' },
          { label: 'Distancia', value: p.r, unit: 'm', decimals: 1 },
        ]
        : [
          { label: 'Radio R', value: Number.isFinite(R) ? R : NaN, unit: 'm', decimals: 2 },
          { label: 'Periodo T', value: Number.isFinite(T) ? T : NaN, unit: 's', decimals: 2 },
          { label: '|v| (no cambia)', value: Math.hypot(d.vx, d.vz), unit: 'm/s', decimals: 2 },
        ],
      formulaViva: esCoulomb
        ? `F = k·q₁·q₂/r² = 8,99·10⁹ · ${fmt(Math.abs(p.q1), 0)}·${fmt(Math.abs(p.q2), 0)} µC² / ${fmt(p.r, 1)}² = ${fmt(F, 3)} N`
        : `R = m·v/(q·B) = ${fmt(m, 3)}·${fmt(p.v, 0)}/(${fmt(Math.abs(q), 3)}·${fmt(p.B, 2)}) = ${Number.isFinite(R) ? fmt(R, 2) : '∞'} m`,
      extra: { F, R: Number.isFinite(R) ? R : null, T: Number.isFinite(T) ? T : null, atrae: p.q1 * p.q2 < 0 },
    });
  });

  const d = world.data || { x: 0, z: 0, vx: 1, vz: 0 };
  const p = params;
  const esCoulomb = p.montaje === 'coulomb';
  const F = (K_E * Math.abs(p.q1 * p.q2) * 1e-12) / (p.r * p.r);
  const half = (p.r * 1.1) / 2;
  const signoColor = (qq) => (qq > 0 ? '#f87171' : qq < 0 ? '#60a5fa' : '#94a3b8');
  const atraccion = p.q1 * p.q2 < 0;

  if (esCoulomb) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[12, 40]} />
          <meshStandardMaterial color="#1c2840" roughness={0.95} />
        </mesh>
        <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

        {[{ q: p.q1, lado: -1 }, { q: p.q2, lado: 1 }].map(({ q, lado }) => (
          <group key={lado} position={[lado * half, 0, 0]}>
            <mesh position={[0, 0.65, 0]} castShadow={quality.shadows}>
              <cylinderGeometry args={[0.3, 0.42, 1.3, 14]} />
              <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.85, 0]} castShadow={quality.shadows}>
              <sphereGeometry args={[0.55, 22, 22]} />
              <meshStandardMaterial color={signoColor(q)} emissive={signoColor(q)} emissiveIntensity={0.3} roughness={0.4} />
            </mesh>
            <Billboard position={[0, 1.85, 0.62]}>
              <Text fontSize={0.5} color="#0f172a" anchorX="center">{q > 0 ? '+' : q < 0 ? '−' : '0'}</Text>
            </Billboard>
            <Billboard position={[0, 2.85, 0]}>
              <Text fontSize={0.3} color="#cbd5e1" anchorX="center">{fmt(q, 0)} µC</Text>
            </Billboard>
          </group>
        ))}

        <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, half * 2, 6]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
        <Billboard position={[0, 0.6, 0]}>
          <Text fontSize={0.3} color="#fbbf24" anchorX="center">r = {fmt(p.r, 1)} m</Text>
        </Billboard>
        <Billboard position={[0, 3.7, 0]}>
          <Text fontSize={0.5} color="#67e8f9" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            F = {fmt(F, 3)} N {atraccion ? '(atracción)' : p.q1 * p.q2 > 0 ? '(repulsión)' : ''}
          </Text>
        </Billboard>

        {/* fuerzas mutuas: 3ª ley */}
        {showVectors && Math.abs(p.q1 * p.q2) > 0 && (
          <group>
            <VectorArrow origin={[-half + 0.6, 1.85, 0]} dir={[atraccion ? 1 : -1, 0, 0]} length={Math.min(2.2, F * 1.8 + 0.3)} color="#4ade80" label="F sobre q₁" thickness={0.04} />
            <VectorArrow origin={[half - 0.6, 1.85, 0]} dir={[atraccion ? -1 : 1, 0, 0]} length={Math.min(2.2, F * 1.8 + 0.3)} color="#4ade80" label="F sobre q₂" thickness={0.04} />
          </group>
        )}
      </group>
    );
  }

  // montaje Lorentz
  const q = p.qL * 1e-3;
  const m = p.masa * 1e-3;
  const R = Math.abs(q) > 1e-9 ? (m * p.v) / (Math.abs(q) * p.B) : null;
  const ionPos = [d.x, ALTURA, d.z];
  const vNorm = Math.hypot(d.vx, d.vz) || 1;
  // F = q·v×B apunta al centro del giro
  const fDir = [(q > 0 ? -1 : 1) * -d.vz, 0, (q > 0 ? -1 : 1) * d.vx];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[13, 44]} />
        <meshStandardMaterial color="#13203c" roughness={0.95} />
      </mesh>
      <gridHelper args={[26, 13, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* símbolos de B saliente (⊙) en una malla */}
      {[-8, -4, 0, 4, 8].map((x) => [-8, -4, 0, 4, 8].map((z) => (
        <group key={`${x}-${z}`} position={[x, 0.06, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.22, 16]} />
            <meshBasicMaterial color="#a78bfa" transparent opacity={0.55} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 8]} />
            <meshBasicMaterial color="#a78bfa" transparent opacity={0.7} />
          </mesh>
        </group>
      )))}
      <Billboard position={[-9, 1.2, -9]}>
        <Text fontSize={0.4} color="#a78bfa" anchorX="center">B = {fmt(p.B, 2)} T (saliente ⊙)</Text>
      </Billboard>

      {/* círculo teórico R = m·v/(qB) */}
      {R != null && R < 12 && (
        <mesh position={[q > 0 ? 0 : 0, 0.04, q > 0 ? R : -R]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(0.02, R - 0.03), R + 0.03, 72]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.25} />
        </mesh>
      )}

      {/* rastro */}
      <instancedMesh ref={trailRef} args={[undefined, undefined, 200]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
      </instancedMesh>

      {/* ion */}
      <mesh ref={ionRef} position={ionPos} castShadow={quality.shadows}>
        <sphereGeometry args={[0.28, 18, 18]} />
        <meshStandardMaterial color={signoColor(p.qL)} emissive={signoColor(p.qL)} emissiveIntensity={0.45} roughness={0.35} />
      </mesh>

      {showVectors && (
        <group>
          <VectorArrow origin={ionPos} dir={[d.vx / vNorm, 0, d.vz / vNorm]} length={Math.min(2.2, vNorm * 0.09 + 0.2)} color="#4ade80" label={`v = ${fmt(vNorm, 1)} m/s`} thickness={0.035} />
          {Math.abs(q) > 1e-9 && (
            <VectorArrow origin={ionPos} dir={fDir} length={1.1} color="#f87171" label="F = q·v×B" thickness={0.035} />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'cargas-campos',
  nombre: 'Cargas y campos',
  icono: '⚡',
  descripcion: 'La fuerza de Coulomb entre cargas y un ion girando en un campo magnético (Lorentz).',
  curso: { level: 'bachillerato', grade: 2 },
  paramsDef: [
    {
      key: 'montaje', label: 'Montaje', type: 'select', def: 'coulomb',
      options: [
        { value: 'coulomb', label: '🔋 Coulomb (dos cargas)' },
        { value: 'lorentz', label: '🧲 Lorentz (ion en campo B)' },
      ],
    },
    { key: 'q1', label: 'q₁ (µC · Coulomb)', min: -10, max: 10, step: 1, def: 5, unit: 'µC' },
    { key: 'q2', label: 'q₂ (µC · Coulomb)', min: -10, max: 10, step: 1, def: 5, unit: 'µC' },
    { key: 'r', label: 'Distancia r (Coulomb)', min: 0.5, max: 5, step: 0.1, def: 1, unit: 'm', decimals: 1 },
    { key: 'qL', label: 'Carga del ion (mC · Lorentz)', min: -20, max: 20, step: 1, def: 10, unit: 'mC' },
    { key: 'masa', label: 'Masa del ion (Lorentz)', min: 5, max: 50, step: 1, def: 20, unit: 'g' },
    { key: 'v', label: 'Velocidad (Lorentz)', min: 2, max: 20, step: 1, def: 10, unit: 'm/s' },
    { key: 'B', label: 'Campo B (Lorentz)', min: 0.5, max: 5, step: 0.25, def: 1, unit: 'T', decimals: 2 },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Ley de Coulomb', expr: 'F = k·q₁·q₂ / r²', leyenda: 'k = 8,99·10⁹ N·m²/C² · signos opuestos → atracción' },
    { titulo: 'Fuerza de Lorentz', expr: 'F = q·v×B', leyenda: 'perpendicular a v: no hace trabajo, |v| constante' },
    { titulo: 'Radio de giro', expr: 'R = m·v/(q·B)', leyenda: 'T = 2π·m/(q·B): ¡el periodo no depende de v!' },
  ],
  fondo: () => '#0d1530',
  camara: { position: [8, 8, 11], fov: 45 },
  controles: { target: [0, 1, 0], maxDistance: 35 },
  Scene,
  retos: [
    {
      id: 'newton-de-nada',
      titulo: 'Un newton de nada',
      descripcion: 'Consigue una fuerza de Coulomb entre 0,8 y 1 N.',
      pista: 'Con 10 µC y 10 µC a 1 m: F = 8,99·10⁹·10⁻¹⁰ = 0,899 N.',
      check: (tel, p) => p.montaje === 'coulomb' && tel.extra?.F >= 0.8 && tel.extra?.F <= 1,
    },
    {
      id: 'polos-opuestos',
      titulo: 'Polos opuestos',
      descripcion: 'Consigue una ATRACCIÓN con fuerza mayor de 0,2 N.',
      pista: 'Signos contrarios y cargas grandes a poca distancia.',
      check: (tel, p) => p.montaje === 'coulomb' && tel.extra?.atrae && tel.extra?.F > 0.2,
    },
    {
      id: 'circulo-de-2',
      titulo: 'Círculo de 2 metros',
      descripcion: 'En el montaje Lorentz, consigue un radio de giro entre 1,9 y 2,1 m.',
      pista: 'R = m·v/(q·B). Con 20 g, 10 m/s, 20 mC y B = 5 T sale exactamente 2 m.',
      check: (tel, p) => p.montaje === 'lorentz' && tel.extra?.R != null
        && tel.extra.R >= 1.9 && tel.extra.R <= 2.1 && tel.t > 1,
    },
    {
      id: 'cronometro-magnetico',
      titulo: 'Cronómetro magnético',
      descripcion: 'Consigue un periodo de giro entre 0,9 y 1,1 s… y comprueba que NO depende de la velocidad.',
      pista: 'T = 2π·m/(q·B). Con 8 g, 10 mC y B = 5 T sale 1,0 s — luego cambia v y mira el periodo.',
      check: (tel, p) => p.montaje === 'lorentz' && tel.extra?.T != null
        && tel.extra.T >= 0.9 && tel.extra.T <= 1.1 && tel.t > 1,
    },
  ],
  examTemplates: [
    {
      id: 'coulomb',
      generar: (rng) => {
        const q1 = randInt(rng, 2, 10);
        const q2 = randInt(rng, 2, 10);
        const r = randInt(rng, 1, 4);
        const F = (K_E * q1 * q2 * 1e-12) / (r * r);
        return {
          enunciado: `Dos cargas de ${q1} µC y ${q2} µC están separadas ${r} m. ¿Con qué fuerza se repelen? (k = 8,99·10⁹; 1 µC = 10⁻⁶ C)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: F,
          toleranciaAbs: 0.002,
          simParams: { montaje: 'coulomb', q1, q2, r, qL: 10, masa: 20, v: 10, B: 1 },
          simDuracion: 3,
          explica: {
            pregunta: '¿En qué se parece la ley de Coulomb a la de gravitación?',
            opciones: [
              'Ambas decaen con 1/r² y actúan a distancia entre dos "cargas"',
              'Ambas son siempre atractivas',
              'Ambas dependen de la velocidad de las partículas',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'radio-lorentz',
      generar: (rng) => {
        const masaG = pick(rng, [10, 20, 40]);
        const qmC = pick(rng, [5, 10, 20]);
        const v = randInt(rng, 4, 18);
        const B = pick(rng, [1, 2, 4]);
        const R = ((masaG / 1000) * v) / ((qmC / 1000) * B);
        return {
          enunciado: `Un ion de ${masaG} g con carga ${qmC} mC entra a ${v} m/s perpendicular a un campo de ${B} T. ¿Qué radio tiene su circunferencia? (R = m·v/(q·B))`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: R,
          toleranciaAbs: 0.05,
          simParams: { montaje: 'lorentz', q1: 5, q2: 5, r: 1, qL: qmC, masa: masaG, v, B },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué describe un círculo y no acelera en línea recta?',
            opciones: [
              'Porque F = q·v×B es siempre perpendicular a v: solo curva, no acelera el módulo',
              'Porque el campo magnético frena al ion',
              'Porque la carga se va gastando al girar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'mitad-distancia',
      generar: (rng) => {
        const r = pick(rng, [2, 4]);
        return {
          enunciado: `Dos cargas se repelen con una fuerza F a ${r} m. Si las acercamos a ${r / 2} m (la mitad), la fuerza pasa a ser…`,
          tipo: 'opciones',
          opciones: ['El cuádruple (4·F)', 'El doble (2·F)', 'La mitad (F/2)'],
          correcta: 0,
          simParams: { montaje: 'coulomb', q1: 8, q2: 8, r: r / 2, qL: 10, masa: 20, v: 10, B: 1 },
          simDuracion: 3,
          explica: {
            pregunta: '¿Qué término de la fórmula lo explica?',
            opciones: [
              'El r² del denominador: a mitad de r, el denominador queda en un cuarto',
              'La constante k, que se duplica al acercarse',
              'El producto q₁·q₂, que crece con la cercanía',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'trabajo-magnetico',
      generar: (rng) => {
        const B = pick(rng, [1, 2, 3]);
        return {
          enunciado: `Un ion gira en un campo magnético uniforme de ${B} T. Tras muchas vueltas, su RAPIDEZ…`,
          tipo: 'opciones',
          opciones: ['Sigue siendo exactamente la misma', 'Disminuye poco a poco', 'Aumenta en cada vuelta'],
          correcta: 0,
          simParams: { montaje: 'lorentz', q1: 5, q2: 5, r: 1, qL: 10, masa: 20, v: 10, B },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué la fuerza magnética no cambia la rapidez?',
            opciones: [
              'Es perpendicular al desplazamiento: su trabajo es cero',
              'Es demasiado pequeña para notarse',
              'Se compensa con la fuerza centrífuga',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
