// Simulación 4 — Gas de partículas (2º ESO).
// Teoría cinético-molecular: las partículas son VISUALIZACIÓN PURA (su número
// escala con el particleBudget del tier gráfico); todas las magnitudes
// medibles (p, V, T, n) salen de la ley de los gases ideales analítica, así
// la calidad gráfica jamás cambia lo que se mide.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import * as THREE from 'three';
import useThrottledTick from '../components/useThrottledTick';
import { fmt } from '../engine/integrator';
import { mulberry32, randInt, pick } from '../engine/rng';

const R = 8.314; // J/(mol·K)

// presión en kPa con V en litros: p = n·R·T / V
const presionKPa = (n, T, V) => (n * R * T) / V;

// arista visual de la caja a partir del volumen (L)
const aristaDe = (V) => 1.5 + Math.cbrt(V / 10) * 1.35;

const colorFrio = new THREE.Color('#60a5fa');
const colorCalor = new THREE.Color('#f87171');

function Particulas({ world, params, budget }) {
  const ref = useRef(null);
  const MAX = 240;
  const mat = useMemo(() => new THREE.Matrix4(), []);

  // re-siembra las partículas visuales cuando cambian n o V
  useEffect(() => {
    const count = Math.max(10, Math.min(MAX, Math.round(params.n * 70 * budget)));
    const half = aristaDe(params.V) / 2 - 0.12;
    const rng = mulberry32(12345);
    world.data.parts = Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * 2 * half,
      y: (rng() - 0.5) * 2 * half,
      z: (rng() - 0.5) * 2 * half,
      vx: (rng() - 0.5), vy: (rng() - 0.5), vz: (rng() - 0.5),
    }));
  }, [world, params.n, params.V, budget]);

  useFrame((_, delta) => {
    const inst = ref.current;
    const parts = world.data?.parts;
    if (!inst || !parts) return;
    const dt = Math.min(delta, 0.05);
    const half = aristaDe(params.V) / 2 - 0.12;
    const vel = 2.2 * Math.sqrt(params.T / 300); // agitación ∝ √T (visual)
    for (let i = 0; i < parts.length; i++) {
      const q = parts[i];
      q.x += q.vx * vel * dt;
      q.y += q.vy * vel * dt;
      q.z += q.vz * vel * dt;
      if (q.x > half) { q.x = half; q.vx = -Math.abs(q.vx); }
      if (q.x < -half) { q.x = -half; q.vx = Math.abs(q.vx); }
      if (q.y > half) { q.y = half; q.vy = -Math.abs(q.vy); }
      if (q.y < -half) { q.y = -half; q.vy = Math.abs(q.vy); }
      if (q.z > half) { q.z = half; q.vz = -Math.abs(q.vz); }
      if (q.z < -half) { q.z = -half; q.vz = Math.abs(q.vz); }
      mat.setPosition(q.x, q.y, q.z);
      inst.setMatrixAt(i, mat);
    }
    inst.count = parts.length;
    inst.instanceMatrix.needsUpdate = true;
  });

  const tColor = colorFrio.clone().lerp(colorCalor, (params.T - 200) / 400);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[0.085, 8, 8]} />
      <meshStandardMaterial color={tColor} emissive={tColor} emissiveIntensity={0.45} />
    </instancedMesh>
  );
}

function Scene({ world, params, playing, resetToken, quality, onTelemetry }) {
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(8);

  useEffect(() => {
    world.t = 0;
    world._acc = 0;
    world.data = world.data || {};
  }, [world, resetToken]);

  useFrame((_, delta) => {
    if (playing) world.t = (world.t || 0) + Math.min(delta, 0.05);
    const p = paramsRef.current;
    const kPa = presionKPa(p.n, p.T, p.V);
    onTelemetry?.({
      t: world.t || 0,
      done: false,
      readouts: [
        { label: 'Presión', value: kPa, unit: 'kPa', decimals: 1 },
        { label: 'Temperatura', value: p.T, unit: 'K', decimals: 0 },
        { label: 'Volumen', value: p.V, unit: 'L', decimals: 0 },
        { label: 'Cantidad de gas', value: p.n, unit: 'mol', decimals: 1 },
      ],
      formulaViva: `p = n·R·T / V = ${fmt(p.n, 1)} · 8,314 · ${fmt(p.T, 0)} / ${fmt(p.V, 0)} = ${fmt(kPa, 1)} kPa`,
      extra: { p: kPa },
    });
  });

  const p = params;
  const arista = aristaDe(p.V);
  const kPa = presionKPa(p.n, p.T, p.V);
  // el manómetro se tiñe según la presión (verde ~atmosférica, rojo alta)
  const presionColor = kPa > 250 ? '#f87171' : kPa > 130 ? '#fbbf24' : '#4ade80';

  return (
    <group>
      {/* mesa del laboratorio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -arista / 2 - 0.25, 0]} receiveShadow>
        <circleGeometry args={[10, 40]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>

      {/* caja de vidrio (el volumen del gas) */}
      <mesh>
        <boxGeometry args={[arista, arista, arista]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.07} depthWrite={false} />
        <Edges color="#7dd3fc" />
      </mesh>

      <Particulas world={world} params={p} budget={quality.particleBudget || 0.6} />

      {/* manómetro */}
      <Billboard position={[0, arista / 2 + 1.1, 0]}>
        <Texto3D fontSize={0.52} color={presionColor} outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          {fmt(kPa, 1)} kPa
        </Texto3D>
      </Billboard>
      <Billboard position={[0, -arista / 2 - 0.75, 0]}>
        <Texto3D fontSize={0.3} color="#94a3b8" anchorX="center">
          {fmt(p.V, 0)} L · {fmt(p.T, 0)} K · {fmt(p.n, 1)} mol
        </Texto3D>
      </Billboard>
    </group>
  );
}

const simDef = {
  id: 'gases',
  nombre: 'Gas de partículas',
  icono: '💨',
  descripcion: 'La presión y la temperatura explicadas con partículas: comprime, calienta y observa el manómetro.',
  curso: { level: 'eso', grade: 2 },
  usaTrayectoria: false,
  usaVectores: false,
  paramsDef: [
    { key: 'n', label: 'Cantidad de gas', min: 0.5, max: 3, step: 0.1, def: 1, unit: 'mol', decimals: 1 },
    { key: 'T', label: 'Temperatura', min: 200, max: 600, step: 10, def: 300, unit: 'K' },
    { key: 'V', label: 'Volumen', min: 10, max: 50, step: 2, def: 25, unit: 'L' },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Gases ideales', expr: 'p·V = n·R·T', leyenda: 'p en kPa si V va en litros · R = 8,314 J/(mol·K)' },
    { titulo: 'Modelo cinético', expr: 'T ∝ velocidad de las partículas', leyenda: 'más temperatura → más agitación → más choques con las paredes → más presión' },
  ],
  fondo: () => '#0d1530',
  camara: { position: [6, 4, 8], fov: 45 },
  controles: { target: [0, 0, 0], maxDistance: 25, maxPolarAngle: Math.PI * 0.6 },
  Scene,
  retos: [
    {
      id: 'presion-atmosferica',
      titulo: 'Como en casa',
      descripcion: 'Ajusta el gas para que el manómetro marque presión atmosférica: entre 98 y 105 kPa.',
      pista: 'Prueba 1 mol a 300 K en 25 L y afina desde ahí: p = n·R·T/V.',
      check: (tel) => tel.extra?.p >= 98 && tel.extra.p <= 105,
    },
    {
      id: 'olla-a-presion',
      titulo: 'Olla a presión',
      descripcion: 'Supera los 300 kPa sin bajar el volumen de 30 L.',
      pista: 'Si no puedes comprimir, te quedan dos palancas: más gas o más temperatura.',
      check: (tel, p) => tel.extra?.p > 300 && p.V >= 30,
    },
    {
      id: 'vacio-parcial',
      titulo: 'Casi vacío',
      descripcion: 'Baja la presión por debajo de 30 kPa.',
      pista: 'Poco gas, frío y mucho espacio.',
      check: (tel) => tel.extra?.p < 30,
    },
  ],
  examTemplates: [
    {
      id: 'presion-calculo',
      generar: (rng) => {
        const n = randInt(rng, 1, 3);
        const T = randInt(rng, 25, 50) * 10;
        const V = randInt(rng, 6, 25) * 2;
        const p = presionKPa(n, T, V);
        return {
          enunciado: `Un recipiente rígido de ${V} L contiene ${n} mol de gas a ${T} K. ¿Qué presión marca el manómetro? (R = 8,314; resultado en kPa)`,
          tipo: 'numerica',
          unidad: 'kPa',
          respuesta: p,
          toleranciaAbs: 1,
          simParams: { n, T, V },
          simDuracion: 3,
          explica: {
            pregunta: 'Según el modelo de partículas, ¿qué es la presión?',
            opciones: [
              'Los choques de las partículas contra las paredes del recipiente',
              'El peso del gas acumulado en el fondo',
              'La atracción entre las partículas del gas',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-temperatura',
      generar: (rng) => {
        const T = pick(rng, [200, 250, 300]);
        return {
          enunciado: `Un gas encerrado a volumen constante está a ${T} K. Si su temperatura sube a ${T * 2} K (el doble), ¿qué pasa con la presión?`,
          tipo: 'opciones',
          opciones: ['Se duplica', 'No cambia', 'Se reduce a la mitad'],
          correcta: 0,
          simParams: { n: 1, T: T * 2, V: 25 },
          simDuracion: 3,
          explica: {
            pregunta: '¿Por qué sube la presión al calentar?',
            opciones: [
              'Las partículas van más rápido y golpean las paredes más fuerte y más a menudo',
              'El gas pesa más al estar caliente',
              'Las partículas se hacen más grandes con el calor',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'mitad-volumen',
      generar: (rng) => {
        const V = pick(rng, [40, 48]);
        return {
          enunciado: `Comprimimos un gas de ${V} L a ${V / 2} L sin cambiar su temperatura. ¿Qué pasa con la presión?`,
          tipo: 'opciones',
          opciones: ['Se duplica', 'Se reduce a la mitad', 'No cambia'],
          correcta: 0,
          simParams: { n: 1, T: 300, V: V / 2 },
          simDuracion: 3,
          explica: {
            pregunta: '¿Cómo lo explica el modelo de partículas?',
            opciones: [
              'En menos espacio, las partículas chocan con las paredes el doble de a menudo',
              'Al comprimir, las partículas se frenan',
              'Al comprimir, parte del gas desaparece',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'agitacion',
      generar: (rng) => {
        const T = pick(rng, [250, 300, 350]);
        return {
          enunciado: `Dos recipientes iguales contienen el mismo gas: uno a ${T} K y otro a ${T + 200} K. ¿En cuál se mueven más rápido las partículas?`,
          tipo: 'opciones',
          opciones: [`En el de ${T + 200} K`, `En el de ${T} K`, 'En los dos igual'],
          correcta: 0,
          simParams: { n: 1, T: T + 200, V: 25 },
          simDuracion: 3,
          explica: {
            pregunta: '¿Qué es la temperatura según la teoría cinético-molecular?',
            opciones: [
              'Una medida de la energía cinética media de las partículas',
              'La cantidad de calor que contiene el cuerpo',
              'La cantidad de partículas por litro',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
