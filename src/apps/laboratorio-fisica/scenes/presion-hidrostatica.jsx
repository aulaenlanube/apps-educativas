// Simulación — Presión bajo el agua (4º ESO).
// Presión hidrostática p_h = ρ·g·h y presión total p = p₀ + ρ·g·h. La sonda
// desciende suavemente hacia la profundidad objetivo (lerp determinista a paso
// fijo); TODAS las lecturas son analíticas con la profundidad ACTUAL de la
// sonda. Las burbujas son visualización pura (escaladas por particleBudget).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import { LIQUIDOS, PLANETAS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { mulberry32, randInt, pick } from '../engine/rng';

const VS = 0.55;          // 1 m real = 0,55 unidades de escena
const Y_SURF = 6.2;       // altura visual de la superficie del líquido
const PROF_VIS = 10.8;    // profundidad interior del tanque (m): margen bajo los 10 m medibles
const Y_FONDO = Y_SURF - PROF_VIS * VS; // fondo interior del tanque
const Y_BORDE = 7.1;      // borde superior del cristal
const GANTRY_Y = 7.85;    // pórtico del que cuelga el cable
const TANK_W = 4;         // anchura interior del tanque
const PROBE_R = 0.32;     // radio visual de la sonda
const P0_KPA = 101.3;     // presión atmosférica estándar (kPa)

const LIQ_KEYS = ['agua', 'aceite', 'mercurio'];
const LUGAR_KEYS = ['tierra', 'luna'];

const nombreLiquido = (k) => LIQUIDOS[k].label.replace(/^\S+\s/, '').toLowerCase();
const nombreLugar = (k) => PLANETAS[k].label.replace(/^\S+\s/, '');
const colorPresion = (kPa) => (kPa >= 300 ? '#f87171' : kPa >= 150 ? '#fbbf24' : '#4ade80');

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = { h: 0 }; // la sonda parte de la superficie
}

// Burbujas instanciadas: VISUALIZACIÓN PURA. Su número escala con el
// particleBudget y se mueven con el delta del frame; ninguna lectura sale de aquí.
function Burbujas({ budget }) {
  const ref = useRef(null);
  const bubblesRef = useRef(null);
  const MAX = 90;
  const mat = useMemo(() => new THREE.Matrix4(), []);
  const count = Math.max(8, Math.min(MAX, Math.round(60 * (budget || 0.6))));

  useEffect(() => {
    const rng = mulberry32(20260612);
    bubblesRef.current = Array.from({ length: MAX }, () => ({
      x: (rng() - 0.5) * (TANK_W - 0.6),
      z: (rng() - 0.5) * (TANK_W - 0.6),
      y: Y_FONDO + 0.1 + rng() * (Y_SURF - Y_FONDO - 0.2),
      s: 0.35 + rng() * 0.5,      // velocidad de ascenso (unidades/s)
      w: rng() * Math.PI * 2,     // fase del bamboleo lateral
    }));
  }, []);

  useFrame((_, delta) => {
    const inst = ref.current;
    const bs = bubblesRef.current;
    if (!inst || !bs) return;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      const b = bs[i];
      b.y += b.s * dt;
      b.w += dt * 2.2;
      if (b.y > Y_SURF - 0.08) b.y = Y_FONDO + 0.1;
      mat.setPosition(b.x + Math.sin(b.w) * 0.06, b.y, b.z);
      inst.setMatrixAt(i, mat);
    }
    inst.count = count;
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[0.045, 6, 6]} />
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.45} />
    </instancedMesh>
  );
}

function Scene({ world, params, playing, speed, resetToken, quality, onTelemetry }) {
  const probeRef = useRef(null);
  const cableRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const playingRef = useRef(playing); playingRef.current = playing;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playingRef.current) reinit(world);
  }, [world, params.profundidad, params.liquido, params.lugar]);

  // La sonda desciende suavemente hacia la profundidad objetivo (sin done: continua)
  useFixedStep(world, playing, speed, (dt) => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    d.h += (p.profundidad - d.h) * Math.min(1, 2 * dt);
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const probeY = Y_SURF - d.h * VS;
    if (probeRef.current) probeRef.current.position.y = probeY;
    if (cableRef.current) {
      const top = GANTRY_Y - 0.12;
      const len = Math.max(0.02, top - (probeY + PROBE_R));
      cableRef.current.position.y = (top + probeY + PROBE_R) / 2;
      cableRef.current.scale.y = len;
    }
    // lecturas SIEMPRE analíticas con la profundidad actual de la sonda
    const p = paramsRef.current;
    const rho = LIQUIDOS[p.liquido].rho;
    const g = PLANETAS[p.lugar].g;
    const pHk = (rho * g * d.h) / 1000;
    const pTot = P0_KPA + pHk;
    onTelemetry?.({
      t: world.t,
      done: false,
      readouts: [
        { label: 'Profundidad', value: d.h, unit: 'm', decimals: 2 },
        { label: 'p hidrostática', value: pHk, unit: 'kPa', decimals: 1 },
        { label: 'p total', value: pTot, unit: 'kPa', decimals: 1 },
        { label: 'Densidad ρ', value: rho, unit: 'kg/m³', decimals: 0 },
      ],
      formulaViva: `p = p₀ + ρ·g·h = 101,3 + ${fmt(pHk, 1)} = ${fmt(pTot, 1)} kPa`,
      extra: { pTotal: pTot, pHidro: pHk, h: d.h },
    });
  });

  const d = world.data || { h: 0 };
  const p = params;
  const liq = LIQUIDOS[p.liquido];
  const g = PLANETAS[p.lugar].g;
  const pHk = (liq.rho * g * d.h) / 1000;
  const pTot = P0_KPA + pHk;
  const probeY = Y_SURF - d.h * VS;
  const marcas = useMemo(() => [0, 2, 4, 6, 8, 10], []);

  return (
    <group>
      {/* suelo del laboratorio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[26, 13, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* base del tanque */}
      <mesh position={[0, 0.14, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[TANK_W + 0.9, 0.28, TANK_W + 0.9]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* tanque de cristal */}
      <mesh position={[0, (Y_BORDE + 0.14) / 2, 0]}>
        <boxGeometry args={[TANK_W + 0.22, Y_BORDE - 0.14, TANK_W + 0.22]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.06} depthWrite={false} />
        <Edges color="#7dd3fc" />
      </mesh>

      {/* líquido translúcido del color del catálogo */}
      <mesh position={[0, (Y_SURF + Y_FONDO) / 2, 0]}>
        <boxGeometry args={[TANK_W, Y_SURF - Y_FONDO, TANK_W]} />
        <meshStandardMaterial color={liq.color} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* lámina de la superficie */}
      <mesh position={[0, Y_SURF, 0]}>
        <boxGeometry args={[TANK_W, 0.04, TANK_W]} />
        <meshBasicMaterial color={liq.color} transparent opacity={0.55} />
      </mesh>
      <Billboard position={[0, Y_BORDE + 0.5, 0]}>
        <Texto3D fontSize={0.32} color={liq.color} outlineWidth={0.018} outlineColor="#0f172a" anchorX="center">
          {liq.label} · ρ = {fmt(liq.rho, 0)} kg/m³
        </Texto3D>
      </Billboard>

      {/* pórtico del cable */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (TANK_W / 2 + 0.8), GANTRY_Y / 2, 0]} castShadow={quality.shadows}>
          <boxGeometry args={[0.16, GANTRY_Y, 0.16]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, GANTRY_Y, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[TANK_W + 1.76, 0.18, 0.3]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, GANTRY_Y - 0.22, 0]}>
        <boxGeometry args={[0.46, 0.28, 0.46]} />
        <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* cable (cilindro escalado imperativamente en useFrame) */}
      <mesh
        ref={cableRef}
        position={[0, (GANTRY_Y - 0.12 + Y_SURF + PROBE_R) / 2, 0]}
        scale={[1, Math.max(0.02, GANTRY_Y - 0.12 - Y_SURF - PROBE_R), 1]}
      >
        <cylinderGeometry args={[0.022, 0.022, 1, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* la sonda, con su foco */}
      <group ref={probeRef} position={[0, probeY, 0]}>
        <mesh castShadow={quality.shadows}>
          <sphereGeometry args={[PROBE_R, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, -PROBE_R * 0.85, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#fef9c3" emissive="#fde68a" emissiveIntensity={1.4} />
        </mesh>
        {quality.shadows && (
          <pointLight position={[0, -0.6, 0]} color="#fde68a" intensity={1.4} distance={3.2} decay={2} />
        )}
      </group>

      {/* burbujas (visual puro) */}
      <Burbujas budget={quality.particleBudget} />

      {/* regla lateral con marcas cada 2 m */}
      <group position={[-(TANK_W / 2 + 0.55), 0, 0]}>
        <mesh position={[0, (Y_SURF + 0.25 + Y_SURF - 10 * VS - 0.25) / 2, 0]}>
          <boxGeometry args={[0.1, 10 * VS + 0.5, 0.1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
        </mesh>
        {marcas.map((m) => (
          <group key={m} position={[0, Y_SURF - m * VS, 0]}>
            <mesh>
              <boxGeometry args={[0.44, 0.05, 0.16]} />
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
            <Billboard position={[-0.72, 0, 0]}>
              <Texto3D fontSize={0.3} color="#cbd5e1" anchorX="center">{m} m</Texto3D>
            </Billboard>
          </group>
        ))}
      </group>

      {/* manómetro junto a la sonda (declarativo, 12 Hz) */}
      <Billboard position={[1.35, probeY + 0.16, 0]}>
        <Texto3D
          fontSize={0.48}
          color={colorPresion(pTot)}
          outlineWidth={0.022}
          outlineColor="#0f172a"
          anchorX="center"
        >
          {fmt(pTot, 1)} kPa
        </Texto3D>
      </Billboard>
      <Billboard position={[1.35, probeY - 0.38, 0]}>
        <Texto3D fontSize={0.26} color="#94a3b8" anchorX="center">
          h = {fmt(d.h, 1)} m
        </Texto3D>
      </Billboard>
    </group>
  );
}

const simDef = {
  id: 'presion-hidrostatica',
  nombre: 'Presión bajo el agua',
  icono: '🤿',
  descripcion: 'Sumerge una sonda en agua, aceite o mercurio y mide cómo crece la presión con la profundidad: p = p₀ + ρ·g·h.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  usaVectores: false,
  paramsDef: [
    { key: 'profundidad', label: 'Profundidad objetivo', min: 0, max: 10, step: 0.5, def: 5, unit: 'm', decimals: 1 },
    {
      key: 'liquido', label: 'Líquido', type: 'select', def: 'agua',
      options: LIQ_KEYS.map((k) => ({ value: k, label: LIQUIDOS[k].label })),
    },
    {
      key: 'lugar', label: 'Lugar (g en m/s²)', type: 'select', def: 'tierra',
      options: LUGAR_KEYS.map((k) => ({ value: k, label: `${PLANETAS[k].label} ${fmt(PLANETAS[k].g, 1)}` })),
    },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Presión hidrostática', expr: 'p_h = ρ·g·h', leyenda: 'ρ: densidad (kg/m³) · h: profundidad (m) · resultado en Pa' },
    { titulo: 'Presión total', expr: 'p = p₀ + ρ·g·h', leyenda: 'p₀ = 101,3 kPa: la atmósfera aprieta sobre la superficie' },
    { titulo: 'Cambio de unidades', expr: '1 kPa = 1.000 Pa', leyenda: '1 atm ≈ 101,3 kPa' },
  ],
  fondo: (params) => (params.lugar === 'luna' ? '#0c0c16' : '#08203a'),
  camara: { position: [8, 5.2, 11.5], fov: 45 },
  controles: { target: [0.4, 3.6, 0], maxDistance: 32 },
  Scene,
  retos: [
    {
      id: 'dos-atmosferas',
      titulo: 'Dos atmósferas',
      descripcion: 'Consigue que la presión total sobre la sonda quede entre 195 y 205 kPa.',
      pista: 'En agua y en la Tierra, p = 101,3 + 9,8·h (kPa). Despeja h… te hará falta bajar casi hasta el fondo.',
      check: (tel) => tel.extra?.pTotal >= 195 && tel.extra.pTotal <= 205,
    },
    {
      id: 'plomo-liquido',
      titulo: 'Plomo líquido',
      descripcion: 'Supera los 400 kPa de presión total.',
      pista: 'Ni el agua ni el aceite llegan ni al fondo del tanque: necesitas el líquido más denso del armario… y la gravedad de la Tierra.',
      check: (tel) => tel.extra?.pTotal > 400,
    },
    {
      id: 'buceo-lunar',
      titulo: 'Buceo lunar',
      descripcion: 'En la Luna y en agua, lleva la sonda a 8 m o más manteniendo la presión total por debajo de 120 kPa.',
      pista: 'En la Luna g = 1,6 m/s²: la misma columna de agua aprieta seis veces menos que en la Tierra.',
      check: (tel, p) => p.lugar === 'luna' && p.liquido === 'agua'
        && tel.extra?.h >= 7.95 && tel.extra.pTotal < 120,
    },
  ],
  examTemplates: [
    {
      id: 'p-hidrostatica',
      generar: (rng) => {
        const h = randInt(rng, 2, 10);
        const liquido = pick(rng, LIQ_KEYS);
        const lugar = pick(rng, LUGAR_KEYS);
        const rho = LIQUIDOS[liquido].rho;
        const g = PLANETAS[lugar].g;
        const pH = (rho * g * h) / 1000;
        return {
          enunciado: `Una sonda está sumergida a ${h} m de profundidad en ${nombreLiquido(liquido)} en la ${nombreLugar(lugar)} (ρ = ${fmt(rho, 0)} kg/m³ · g = ${fmt(g, 1)} m/s²). ¿Qué presión soporta debida SOLO al líquido (presión hidrostática)? Responde en kPa.`,
          tipo: 'numerica',
          unidad: 'kPa',
          respuesta: pH,
          toleranciaAbs: 0.5,
          simParams: { profundidad: h, liquido, lugar },
          simDuracion: 5,
          explica: {
            pregunta: '¿Por qué la presión aumenta con la profundidad?',
            opciones: [
              'Porque la columna de líquido que tienes encima pesa más cuanto más bajas',
              'Porque el líquido está más frío en el fondo',
              'Porque la gravedad aumenta al bajar',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'p-total',
      generar: (rng) => {
        const h = randInt(rng, 2, 10);
        const liquido = pick(rng, ['agua', 'aceite']);
        const lugar = pick(rng, LUGAR_KEYS);
        const rho = LIQUIDOS[liquido].rho;
        const g = PLANETAS[lugar].g;
        const pTot = P0_KPA + (rho * g * h) / 1000;
        return {
          enunciado: `El manómetro de una sonda mide la presión TOTAL (atmosférica + hidrostática). Si está a ${h} m en ${nombreLiquido(liquido)} en la ${nombreLugar(lugar)} (ρ = ${fmt(rho, 0)} kg/m³ · g = ${fmt(g, 1)} m/s² · p₀ = 101,3 kPa), ¿qué presión marca? Responde en kPa.`,
          tipo: 'numerica',
          unidad: 'kPa',
          respuesta: pTot,
          toleranciaAbs: 0.5,
          simParams: { profundidad: h, liquido, lugar },
          simDuracion: 5,
          explica: {
            pregunta: '¿Qué representa el término p₀ = 101,3 kPa?',
            opciones: [
              'La presión de la atmósfera que aprieta sobre la superficie del líquido',
              'La presión que hace el fondo del tanque',
              'Una constante de ajuste sin significado físico',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'despeja-profundidad',
      generar: (rng) => {
        const h = randInt(rng, 2, 10);
        const liquido = pick(rng, ['agua', 'mercurio']);
        const rho = LIQUIDOS[liquido].rho;
        const pH = (rho * 9.8 * h) / 1000;
        return {
          enunciado: `Una sonda sumergida en ${nombreLiquido(liquido)} en la Tierra soporta una presión hidrostática de ${fmt(pH, 2)} kPa (ρ = ${fmt(rho, 0)} kg/m³ · g = 9,8 m/s²). ¿A qué profundidad está?`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: h,
          toleranciaAbs: 0.1,
          simParams: { profundidad: h, liquido, lugar: 'tierra' },
          simDuracion: 5,
          explica: {
            pregunta: '¿Cómo se despeja h en p_h = ρ·g·h?',
            opciones: [
              'h = p_h / (ρ·g)',
              'h = p_h · ρ · g',
              'h = ρ·g / p_h',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-profundidad',
      generar: (rng) => {
        const h = randInt(rng, 2, 5);
        return {
          enunciado: `Una sonda está a ${h} m de profundidad en un líquido. Si baja hasta ${h * 2} m (el doble), ¿qué pasa con la presión hidrostática ρ·g·h?`,
          tipo: 'opciones',
          opciones: ['Se duplica', 'No cambia', 'Se cuadruplica'],
          correcta: 0,
          simParams: { profundidad: h * 2, liquido: 'agua', lugar: 'tierra' },
          simDuracion: 5,
          explica: {
            pregunta: '¿Y la presión TOTAL p₀ + ρ·g·h, se duplica también?',
            opciones: [
              'No exactamente: solo se duplica la parte hidrostática; p₀ no cambia',
              'Sí: la presión total siempre se duplica con la profundidad',
              'No: la presión total disminuye al bajar',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
