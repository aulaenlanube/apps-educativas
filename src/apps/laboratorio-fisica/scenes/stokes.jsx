// Simulación — Viscosidad y ley de Stokes (AMPLIACIÓN, 2º Bach).
// Bola cayendo en un fluido viscoso: peso − empuje − 6π·η·R·v. La gráfica de v
// tiende asintóticamente a la velocidad terminal; el número de Reynolds avisa
// cuando el modelo de Stokes deja de valer (esa es la otra lección).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges, Text } from '@react-three/drei';
import * as THREE from 'three';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { LIQUIDOS, MATERIALES } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { mulberry32 } from '../engine/rng';

const G = 9.8;
const PROFUNDIDAD = 1.2;  // m de tubo
const VSY = 4;            // 1 m real = 4 unidades visuales
const MATS = ['plastico', 'aluminio', 'acero', 'oro'];

function propiedades(params) {
  const R = params.radio / 1000; // mm → m
  const rhoB = MATERIALES[params.material].rho;
  const { rho: rhoF, mu: eta } = LIQUIDOS[params.fluido];
  const m = rhoB * (4 / 3) * Math.PI * R ** 3;
  const vt = (2 * R * R * G * (rhoB - rhoF)) / (9 * eta);
  return { R, rhoB, rhoF, eta, m, vt };
}

function reinit(world, params) {
  const { rhoB, rhoF } = propiedades(params);
  world.t = 0;
  world._acc = 0;
  world.data = {
    h: 0,      // profundidad recorrida (m)
    v: 0,
    flota: rhoB <= rhoF,
    done: false,
  };
}

// motas en suspensión (visual puro)
function Motas({ world, params, budget }) {
  const ref = useRef(null);
  const MAX = 140;
  const mat = useMemo(() => new THREE.Matrix4(), []);
  useEffect(() => {
    const count = Math.max(15, Math.round(MAX * budget));
    const rng = mulberry32(4242);
    world.data.motas = Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * 1.5,
      y: -rng() * PROFUNDIDAD * VSY,
      z: (rng() - 0.5) * 1.5,
      f: 0.3 + rng() * 0.7,
    }));
  }, [world, budget]);
  useFrame(({ clock }) => {
    const inst = ref.current;
    const motas = world.data?.motas;
    if (!inst || !motas) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < motas.length; i++) {
      const q = motas[i];
      mat.setPosition(q.x + Math.sin(t * q.f + i) * 0.05, q.y, q.z + Math.cos(t * q.f * 0.7 + i) * 0.05);
      inst.setMatrixAt(i, mat);
    }
    inst.count = motas.length;
    inst.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[0.025, 5, 5]} />
      <meshBasicMaterial color="#e2e8f0" transparent opacity={0.35} />
    </instancedMesh>
  );
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const bolaRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.radio, params.material, params.fluido]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const { R, rhoB, rhoF, eta, m } = propiedades(p);
    if (d.flota) return; // no se hunde: ρ_bola ≤ ρ_fluido
    // a = g·(1 − ρf/ρb) − (6π·η·R/m)·v
    const a = G * (1 - rhoF / rhoB) - ((6 * Math.PI * eta * R) / m) * d.v;
    d.v += a * dt;
    if (d.v < 0) d.v = 0;
    d.h += d.v * dt;
    if (d.h >= PROFUNDIDAD) {
      d.h = PROFUNDIDAD;
      d.done = true;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (bolaRef.current) bolaRef.current.position.y = -d.h * VSY;
    const p = paramsRef.current;
    const { R, rhoF, eta, vt } = propiedades(p);
    const re = (rhoF * d.v * 2 * R) / eta;
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Velocidad', value: d.v * 100, unit: 'cm/s', decimals: 2 },
        { label: 'v terminal teórica', value: vt * 100, unit: 'cm/s', decimals: 2 },
        { label: '% de v terminal', value: vt > 0 ? (d.v / vt) * 100 : 0, unit: '%', decimals: 0 },
        { label: 'Reynolds Re', value: re, unit: '', decimals: 2 },
      ],
      series: { v: d.v * 100 },
      formulaViva: d.flota
        ? `ρ_bola = ${fmt(MATERIALES[p.material].rho, 0)} ≤ ρ_fluido = ${fmt(rhoF, 0)} kg/m³ → ¡FLOTA!`
        : `v_t = 2·R²·g·(ρ_b−ρ_f)/(9·η) = ${fmt(vt * 100, 2)} cm/s`
        + (re > 1 ? ' · ⚠️ Re > 1: la ley de Stokes deja de ser válida' : ''),
      extra: { v: d.v, vt, re, pctVt: vt > 0 ? (d.v / vt) * 100 : 0, flota: d.flota },
    });
  });

  const d = world.data || { h: 0, flota: false };
  const p = params;
  const liq = LIQUIDOS[p.fluido];
  const matInfo = MATERIALES[p.material];
  const radioVisual = Math.max(0.12, (p.radio / 1000) * 28); // exagerado para verse
  const tuboAlto = PROFUNDIDAD * VSY + 1;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -PROFUNDIDAD * VSY - 0.7, 0]} receiveShadow>
        <circleGeometry args={[8, 36]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>

      {/* tubo de cristal con el fluido */}
      <group position={[0, -PROFUNDIDAD * VSY / 2 + 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.1, tuboAlto, 28, 1, true]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
          <Edges color="#7dd3fc" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[1.02, 1.02, tuboAlto - 0.3, 24]} />
          <meshStandardMaterial color={liq.color} transparent opacity={0.32} depthWrite={false} />
        </mesh>
      </group>

      {/* regla lateral cada 0,2 m */}
      {[0, 0.2, 0.4, 0.6, 0.8, 1, 1.2].map((h) => (
        <group key={h} position={[1.45, -h * VSY, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 0.03, 0.03]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Billboard position={[0.65, 0, 0]}>
            <Text fontSize={0.22} color="#94a3b8" anchorX="center">{fmt(h, 1)} m</Text>
          </Billboard>
        </group>
      ))}

      <Motas world={world} params={p} budget={quality.particleBudget || 0.6} />

      {/* la bola */}
      <mesh ref={bolaRef} position={[0, -d.h * VSY, 0]} castShadow={quality.shadows}>
        <sphereGeometry args={[radioVisual, 20, 20]} />
        <meshStandardMaterial color={matInfo.color} metalness={p.material === 'oro' || p.material === 'acero' ? 0.7 : 0.1} roughness={0.35} />
      </mesh>
      <Billboard position={[0, -d.h * VSY + radioVisual + 0.4, 0]}>
        <Text fontSize={0.3} color="#67e8f9" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          {d.flota ? '🛟 flota' : `v = ${fmt((world.data?.v || 0) * 100, 1)} cm/s`}
        </Text>
      </Billboard>

      {/* fuerzas */}
      {showVectors && !d.flota && (
        <group>
          <VectorArrow origin={[-0.5, -d.h * VSY, 0]} dir={[0, -1, 0]} length={0.9} color="#f87171" label="P" thickness={0.03} />
          <VectorArrow origin={[0.5, -d.h * VSY, 0]} dir={[0, 1, 0]} length={0.55} color="#60a5fa" label="E" thickness={0.03} />
          {(world.data?.v || 0) > 0.001 && (
            <VectorArrow origin={[0, -d.h * VSY + radioVisual + 0.05, 0]} dir={[0, 1, 0]} length={Math.min(1.4, (world.data.v / Math.max(propiedades(p).vt, 1e-6)) * 0.8)} color="#fbbf24" label="F Stokes" thickness={0.03} />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'stokes',
  nombre: 'Viscosidad (ley de Stokes)',
  icono: '🍯',
  descripcion: 'Deja caer bolas en miel, glicerina o agua y observa la velocidad terminal… y los límites de Stokes.',
  curso: { level: 'bachillerato', grade: 2 },
  esAmpliacion: true,
  usaTrayectoria: false,
  paramsDef: [
    { key: 'radio', label: 'Radio de la bola', min: 1, max: 10, step: 0.5, def: 3, unit: 'mm', decimals: 1 },
    {
      key: 'material', label: 'Material', type: 'select', def: 'acero',
      options: MATS.map((value) => ({ value, label: MATERIALES[value].label })),
    },
    {
      key: 'fluido', label: 'Fluido', type: 'select', def: 'glicerina',
      options: ['agua', 'aceite', 'glicerina', 'miel'].map((value) => ({ value, label: LIQUIDOS[value].label })),
    },
  ],
  graficas: [{ key: 'v', label: 'velocidad (cm/s)', color: '#4ade80' }],
  formulas: [
    { titulo: 'Arrastre de Stokes', expr: 'F = 6π·η·R·v', leyenda: 'válido para Re < 1 (flujo laminar)' },
    { titulo: 'Velocidad terminal', expr: 'v_t = 2·R²·g·(ρ_b−ρ_f)/(9·η)', leyenda: 'peso = empuje + arrastre' },
    { titulo: 'Número de Reynolds', expr: 'Re = ρ_f·v·2R/η', leyenda: 'si Re > 1, Stokes deja de valer' },
  ],
  fondo: () => '#0d1426',
  camara: { position: [5, -1, 7], fov: 45 },
  controles: { target: [0, -2.2, 0], maxDistance: 22, maxPolarAngle: Math.PI },
  Scene,
  retos: [
    {
      id: 'velocidad-terminal',
      titulo: 'Crucero de profundidad',
      descripcion: 'Alcanza el 95% de la velocidad terminal antes de tocar el fondo.',
      pista: 'En glicerina con bola de acero de 3 mm la asíntota llega enseguida.',
      check: (tel) => !tel.extra?.flota && (tel.extra?.pctVt ?? 0) >= 95,
    },
    {
      id: 'camara-lenta',
      titulo: 'Cámara lenta',
      descripcion: 'Consigue una velocidad terminal menor de 2 cm/s (¡que se vea caer a cámara lenta de verdad!).',
      pista: 'Miel (η = 10) y una bola poco densa: aluminio pequeño.',
      check: (tel) => !tel.extra?.flota && tel.extra?.vt != null && tel.extra.vt > 0 && tel.extra.vt * 100 < 2,
    },
    {
      id: 'stokes-roto',
      titulo: 'Stokes roto',
      descripcion: 'Consigue que el número de Reynolds supere 1 (el aviso de que el modelo deja de valer).',
      pista: 'Fluido poco viscoso (agua) y bola grande y densa: la velocidad se dispara.',
      check: (tel) => (tel.extra?.re ?? 0) > 1,
    },
    {
      id: 'burbuja',
      titulo: 'La bola que no quiso hundirse',
      descripcion: 'Encuentra una combinación en la que la bola NO se hunda.',
      pista: 'ρ_bola < ρ_fluido: plástico (1100) en miel (1420).',
      check: (tel) => !!tel.extra?.flota,
    },
  ],
  examTemplates: [], // ampliación: nunca entra en examen
};

export default simDef;
