// Simulación — Gravitación universal (4º ESO).
// Dos montajes: laboratorio (dos esferas: la fuerza entre masas cotidianas es
// MINÚSCULA, ese es el mensaje) y báscula planetaria (P = m·g en cada cuerpo).
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { G_UNIVERSAL, PLANETAS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const SUELOS = { tierra: '#1e4d2b', luna: '#3f3f46', marte: '#7c2d12', jupiter: '#92710c' };

function Scene({ world, params, playing, resetToken, showVectors, quality, onTelemetry }) {
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(10);

  useEffect(() => {
    world.t = 0;
    world._acc = 0;
    world.data = world.data || {};
  }, [world, resetToken]);

  useFrame((_, delta) => {
    if (playing) world.t = (world.t || 0) + Math.min(delta, 0.05);
    const p = paramsRef.current;
    const F = (G_UNIVERSAL * p.m1 * p.m2) / (p.r * p.r);
    const g = PLANETAS[p.cuerpo].g;
    const P = p.m2 * g;
    const esLab = p.montaje === 'laboratorio';
    onTelemetry?.({
      t: world.t || 0,
      done: false,
      readouts: esLab
        ? [
          { label: 'Fuerza F', value: F * 1e6, unit: 'µN', decimals: 2 },
          { label: 'Masa 1', value: p.m1, unit: 'kg', decimals: 0 },
          { label: 'Masa 2', value: p.m2, unit: 'kg', decimals: 0 },
          { label: 'Distancia', value: p.r, unit: 'm', decimals: 1 },
        ]
        : [
          { label: 'Peso P', value: P, unit: 'N', decimals: 1 },
          { label: 'g del cuerpo', value: g, unit: 'm/s²', decimals: 1 },
          { label: 'Masa', value: p.m2, unit: 'kg', decimals: 0 },
        ],
      formulaViva: esLab
        ? `F = G·m₁·m₂/r² = 6,67·10⁻¹¹ · ${fmt(p.m1, 0)} · ${fmt(p.m2, 0)} / ${fmt(p.r, 1)}² = ${fmt(F * 1e6, 2)} µN`
        : `P = m·g = ${fmt(p.m2, 0)} · ${fmt(g, 1)} = ${fmt(P, 1)} N`,
      extra: { F_uN: F * 1e6, P },
    });
  });

  const p = params;
  const esLab = p.montaje === 'laboratorio';
  const F = (G_UNIVERSAL * p.m1 * p.m2) / (p.r * p.r);
  const g = PLANETAS[p.cuerpo].g;
  const rad1 = 0.35 + Math.cbrt(p.m1) * 0.07;
  const rad2 = 0.35 + Math.cbrt(p.m2) * 0.07;
  const half = (p.r * 0.7) / 2; // escala visual de la distancia

  if (esLab) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[12, 40]} />
          <meshStandardMaterial color="#1c2840" roughness={0.95} />
        </mesh>
        <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

        {/* pedestales + esferas */}
        {[-1, 1].map((lado) => {
          const rad = lado < 0 ? rad1 : rad2;
          return (
            <group key={lado} position={[lado * half, 0, 0]}>
              <mesh position={[0, 0.7, 0]} castShadow={quality.shadows}>
                <cylinderGeometry args={[0.35, 0.5, 1.4, 16]} />
                <meshStandardMaterial color="#475569" roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.4 + rad, 0]} castShadow={quality.shadows}>
                <sphereGeometry args={[rad, 24, 24]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.3} />
              </mesh>
            </group>
          );
        })}

        {/* línea y etiqueta de la distancia */}
        <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, half * 2, 6]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
        </mesh>
        <Billboard position={[0, 0.6, 0]}>
          <Texto3D fontSize={0.3} color="#fbbf24" anchorX="center">r = {fmt(p.r, 1)} m</Texto3D>
        </Billboard>
        <Billboard position={[0, 3.4, 0]}>
          <Texto3D fontSize={0.5} color="#67e8f9" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            F = {fmt(F * 1e6, 2)} µN
          </Texto3D>
        </Billboard>

        {/* fuerzas mutuas (3ª ley): mismo módulo, sentidos opuestos */}
        {showVectors && (
          <group>
            <VectorArrow origin={[-half + rad1, 1.4 + rad1, 0]} dir={[1, 0, 0]} length={Math.min(2, 0.4 + F * 1e6 * 0.02)} color="#4ade80" label="F sobre 1" thickness={0.04} />
            <VectorArrow origin={[half - rad2, 1.4 + rad2, 0]} dir={[-1, 0, 0]} length={Math.min(2, 0.4 + F * 1e6 * 0.02)} color="#4ade80" label="F sobre 2" thickness={0.04} />
          </group>
        )}
      </group>
    );
  }

  // montaje báscula planetaria
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color={SUELOS[p.cuerpo]} roughness={0.95} />
      </mesh>
      {/* báscula */}
      <mesh position={[0, 0.18, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[1.8, 0.36, 1.4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* persona simplificada (cápsula) */}
      <mesh position={[0, 1.5, 0]} castShadow={quality.shadows}>
        <capsuleGeometry args={[0.42, 1.2, 6, 16]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
      </mesh>
      <mesh position={[0, 2.65, 0]} castShadow={quality.shadows}>
        <sphereGeometry args={[0.3, 18, 18]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.6} />
      </mesh>
      {/* display de la báscula */}
      <Billboard position={[0, 0.85, 1.1]}>
        <Texto3D fontSize={0.42} color="#4ade80" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          {fmt(p.m2 * g, 1)} N
        </Texto3D>
      </Billboard>
      <Billboard position={[0, 4, 0]}>
        <Texto3D fontSize={0.4} color="#cbd5e1" anchorX="center">
          {PLANETAS[p.cuerpo].label.replace(/^\S+\s/, '')} · g = {fmt(g, 1)} m/s²
        </Texto3D>
      </Billboard>
      {showVectors && (
        <VectorArrow origin={[1.1, 1.5, 0]} dir={[0, -1, 0]} length={Math.min(3, 0.4 + p.m2 * g * 0.0012)} color="#f87171" label={`P = ${fmt(p.m2 * g, 0)} N`} />
      )}
    </group>
  );
}

const simDef = {
  id: 'gravitacion',
  nombre: 'Gravitación universal',
  icono: '🌍',
  descripcion: 'Mide la atracción entre dos masas y pésate en otros planetas: F = G·m₁·m₂/r².',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  paramsDef: [
    {
      key: 'montaje', label: 'Montaje', type: 'select', def: 'laboratorio',
      options: [
        { value: 'laboratorio', label: '🔬 Dos esferas' },
        { value: 'bascula', label: '⚖️ Báscula planetaria' },
      ],
    },
    { key: 'm1', label: 'Masa 1 (esfera)', min: 10, max: 1000, step: 10, def: 500, unit: 'kg' },
    { key: 'm2', label: 'Masa 2 (esfera o persona)', min: 10, max: 1000, step: 10, def: 500, unit: 'kg' },
    { key: 'r', label: 'Distancia (esferas)', min: 1, max: 10, step: 0.5, def: 3, unit: 'm', decimals: 1 },
    {
      key: 'cuerpo', label: 'Cuerpo celeste (báscula)', type: 'select', def: 'tierra',
      options: Object.entries(PLANETAS).map(([value, pl]) => ({ value, label: pl.label })),
    },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Ley de gravitación universal', expr: 'F = G·m₁·m₂ / r²', leyenda: 'G = 6,674·10⁻¹¹ N·m²/kg²' },
    { titulo: 'Peso', expr: 'P = m·g', leyenda: 'g = G·M/R² en la superficie de cada cuerpo' },
  ],
  fondo: (p) => (p.montaje === 'bascula' ? { tierra: '#0c1f3d', luna: '#101018', marte: '#2a130d', jupiter: '#231a09' }[p.cuerpo] : '#101a33'),
  camara: { position: [7, 4.5, 9], fov: 45 },
  controles: { target: [0, 1.6, 0], maxDistance: 28 },
  Scene,
  retos: [
    {
      id: 'atraccion-fatal',
      titulo: 'Atracción fatal',
      descripcion: 'Consigue más de 50 µN de fuerza entre las dos esferas.',
      pista: 'Masas al máximo (1000 kg) y distancia mínima: F = 6,67·10⁻¹¹·10⁶/1 = 66,7 µN.',
      check: (tel, p) => p.montaje === 'laboratorio' && (tel.extra?.F_uN ?? 0) > 50,
    },
    {
      id: 'dieta-lunar',
      titulo: 'Dieta lunar',
      descripcion: 'En la báscula, que una persona de unos 100 kg marque menos de 200 N.',
      pista: 'En la Luna g = 1,6 m/s²: 100 kg pesan solo 160 N.',
      check: (tel, p) => p.montaje === 'bascula' && p.m2 >= 90 && p.m2 <= 110 && (tel.extra?.P ?? 1e9) < 200,
    },
    {
      id: 'peso-pesado',
      titulo: 'Peso pesado joviano',
      descripcion: 'Supera los 2500 N en la báscula.',
      pista: 'Júpiter aplasta: g = 24,8. Necesitas algo más de 100 kg.',
      check: (tel, p) => p.montaje === 'bascula' && (tel.extra?.P ?? 0) > 2500,
    },
  ],
  examTemplates: [
    {
      id: 'peso-en-otro-cuerpo',
      generar: (rng) => {
        const m = randInt(rng, 40, 120);
        const cuerpo = pick(rng, ['luna', 'marte', 'jupiter']);
        const g = PLANETAS[cuerpo].g;
        return {
          enunciado: `Una astronauta de ${m} kg aterriza en ${PLANETAS[cuerpo].label} (g = ${fmt(g, 1)} m/s²). ¿Cuánto marca su báscula?`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: m * g,
          toleranciaAbs: 1,
          simParams: { montaje: 'bascula', m1: 500, m2: m, r: 3, cuerpo },
          simDuracion: 3,
          explica: {
            pregunta: '¿Cambia su MASA al cambiar de planeta?',
            opciones: [
              'No: la masa es la cantidad de materia; lo que cambia es el peso (la fuerza)',
              'Sí: la masa depende de la gravedad del lugar',
              'Solo si el planeta es más grande que la Tierra',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'g-superficial',
      generar: (rng) => {
        const datos = pick(rng, [
          { nombre: 'Marte', M: '6,4·10²³', Mv: 6.4e23, R: '3,39·10⁶', Rv: 3.39e6 },
          { nombre: 'la Luna', M: '7,35·10²²', Mv: 7.35e22, R: '1,74·10⁶', Rv: 1.74e6 },
          { nombre: 'Mercurio', M: '3,3·10²³', Mv: 3.3e23, R: '2,44·10⁶', Rv: 2.44e6 },
        ]);
        const g = (G_UNIVERSAL * datos.Mv) / (datos.Rv * datos.Rv);
        return {
          enunciado: `Calcula la gravedad superficial de ${datos.nombre}: M = ${datos.M} kg, R = ${datos.R} m, G = 6,674·10⁻¹¹. (g = G·M/R²)`,
          tipo: 'numerica',
          unidad: 'm/s²',
          respuesta: g,
          toleranciaAbs: 0.1,
          simParams: { montaje: 'bascula', m1: 500, m2: 100, r: 3, cuerpo: datos.nombre === 'Marte' ? 'marte' : 'luna' },
          simDuracion: 3,
          explica: {
            pregunta: '¿Por qué la Luna tiene menos gravedad superficial que la Tierra?',
            opciones: [
              'Tiene mucha menos masa (y su radio menor no lo compensa)',
              'Está más lejos del Sol',
              'No tiene atmósfera que empuje hacia abajo',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-distancia',
      generar: (rng) => {
        const r = randInt(rng, 2, 5);
        return {
          enunciado: `Dos masas se atraen con una fuerza F cuando están a ${r} m. Si las separamos al doble de distancia (${r * 2} m), la fuerza pasa a ser…`,
          tipo: 'opciones',
          opciones: ['La mitad (F/2)', 'La cuarta parte (F/4)', 'El doble (2·F)'],
          correcta: 1,
          simParams: { montaje: 'laboratorio', m1: 1000, m2: 1000, r: Math.min(10, r * 2), cuerpo: 'tierra' },
          simDuracion: 3,
          explica: {
            pregunta: '¿Qué parte de la fórmula lo explica?',
            opciones: [
              'El r² del denominador: ley del inverso del cuadrado',
              'La constante G, que disminuye con la distancia',
              'El producto de las masas',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'tercera-ley',
      generar: (rng) => {
        const m = randInt(rng, 50, 90);
        return {
          enunciado: `La Tierra atrae a una persona de ${m} kg con una fuerza de unos ${Math.round(m * 9.8)} N. ¿Con qué fuerza atrae la persona a la Tierra?`,
          tipo: 'opciones',
          opciones: ['Con ninguna: la Tierra es demasiado grande', `Con exactamente la misma: ${Math.round(m * 9.8)} N`, 'Con una fuerza proporcional a su tamaño, casi cero'],
          correcta: 1,
          simParams: { montaje: 'laboratorio', m1: 1000, m2: 1000, r: 1, cuerpo: 'tierra' },
          simDuracion: 3,
          explica: {
            pregunta: 'Entonces, ¿por qué cae la persona y no "sube" la Tierra?',
            opciones: [
              'La fuerza es igual, pero la aceleración a = F/m de la Tierra es ridícula por su masa enorme',
              'Porque la Tierra está sujeta por el Sol',
              'Porque la fuerza de la persona tarda en llegar al centro de la Tierra',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
