// Simulación — Túnel de viento: Bernoulli y sustentación (AMPLIACIÓN, 2º Bach).
// Flujo potencial alrededor de un cilindro CON CIRCULACIÓN fijada por la
// condición de Kutta (Γ = 4π·U·a·senα). Sin circulación la sustentación sería
// CERO (paradoja de d'Alembert); con ella, Kutta-Joukowski da L' = ρ·U·Γ.
// Los trazadores son visuales (advectados por el campo analítico exacto).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import * as THREE from 'three';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { mulberry32 } from '../engine/rng';

const A = 0.8;          // radio del cilindro-perfil
const RHO = 1.2;        // densidad del aire
const X_MIN = -12;
const X_MAX = 12;
const Y_MAX = 6.5;
const VEL_VISUAL = 0.16; // factor velocidad física → visual de los trazadores

// circulación por condición de Kutta y sustentación Kutta-Joukowski
const circulacion = (U, alphaDeg) => 4 * Math.PI * U * A * Math.sin((alphaDeg * Math.PI) / 180);
const sustentacion = (U, alphaDeg) => RHO * U * circulacion(U, alphaDeg);

// campo de velocidades del flujo potencial con circulación (exacto)
function campo(x, y, U, gamma) {
  const r2 = x * x + y * y;
  if (r2 < A * A * 0.92) return { vx: 0, vy: 0, dentro: true };
  const r = Math.sqrt(r2);
  const cos = x / r;
  const sin = y / r;
  const a2r2 = (A * A) / r2;
  const vr = U * (1 - a2r2) * cos;
  const vt = -U * (1 + a2r2) * sin + gamma / (2 * Math.PI * r);
  return {
    vx: vr * cos - vt * sin,
    vy: vr * sin + vt * cos,
    dentro: false,
  };
}

const cFrio = new THREE.Color('#3b82f6');
const cMedio = new THREE.Color('#e2e8f0');
const cRapido = new THREE.Color('#fb923c');

function Trazadores({ world, params, budget, playing }) {
  const ref = useRef(null);
  const MAX = 2600;
  const mat = useMemo(() => new THREE.Matrix4(), []);
  const col = useMemo(() => new THREE.Color(), []);

  // siembra determinista; re-siembra al cambiar el presupuesto
  useEffect(() => {
    const count = Math.max(120, Math.round(MAX * budget));
    const rng = mulberry32(777);
    world.data = world.data || {}; // el efecto del hijo corre antes que el reinit del padre
    world.data.parts = Array.from({ length: count }, () => ({
      x: X_MIN + rng() * (X_MAX - X_MIN),
      y: -Y_MAX + rng() * 2 * Y_MAX,
      seed: rng(),
    }));
  }, [world, budget]);

  useFrame((_, delta) => {
    const inst = ref.current;
    const parts = world.data?.parts;
    if (!inst || !parts) return;
    const p = paramsOf(world, params);
    const gamma = circulacion(p.U, p.alpha);
    const dt = playing ? Math.min(delta, 0.05) : 0;
    const vMax = 2 * p.U + Math.abs(gamma) / (2 * Math.PI * A); // techo de rapidez (sobre el perfil)
    for (let i = 0; i < parts.length; i++) {
      const q = parts[i];
      const { vx, vy, dentro } = campo(q.x, q.y, p.U, gamma);
      if (dt > 0) {
        q.x += vx * VEL_VISUAL * dt;
        q.y += vy * VEL_VISUAL * dt;
      }
      if (dentro || q.x > X_MAX || Math.abs(q.y) > Y_MAX + 0.5) {
        q.x = X_MIN;
        q.y = -Y_MAX + ((q.seed * 9301 + 49297) % 233280) / 233280 * 2 * Y_MAX;
      }
      mat.setPosition(q.x, q.y, 0);
      inst.setMatrixAt(i, mat);
      // color por rapidez local (Bernoulli visible: rápido = naranja)
      const s = Math.min(1, Math.hypot(vx, vy) / vMax);
      if (s < 0.5) col.copy(cFrio).lerp(cMedio, s * 2);
      else col.copy(cMedio).lerp(cRapido, (s - 0.5) * 2);
      inst.setColorAt(i, col);
    }
    inst.count = parts.length;
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[0.055, 6, 6]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

// los trazadores leen los params en vivo a través del world (evita re-crear el efecto)
function paramsOf(world, fallback) {
  return world.data?.params || fallback;
}

function Scene({ world, params, playing, resetToken, showVectors, quality, onTelemetry }) {
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(10);

  useEffect(() => {
    world.t = 0;
    world._acc = 0;
    world.data = world.data || {};
  }, [world, resetToken]);
  // expone los params actuales a los trazadores
  if (world.data) world.data.params = params;

  useFrame((_, delta) => {
    if (playing) world.t = (world.t || 0) + Math.min(delta, 0.05);
    const p = paramsRef.current;
    const gamma = circulacion(p.U, p.alpha);
    const L = sustentacion(p.U, p.alpha);
    onTelemetry?.({
      t: world.t || 0,
      done: false,
      readouts: [
        { label: 'Sustentación L', value: L, unit: 'N/m', decimals: 0 },
        { label: 'Circulación Γ', value: gamma, unit: 'm²/s', decimals: 1 },
        { label: 'v máx sobre el perfil', value: 2 * p.U + Math.abs(gamma) / (2 * Math.PI * A), unit: 'm/s', decimals: 1 },
        { label: 'Ángulo de ataque', value: p.alpha, unit: '°', decimals: 0 },
      ],
      formulaViva: `L = ρ·U·Γ = 1,2 · ${fmt(p.U, 0)} · ${fmt(gamma, 1)} = ${fmt(L, 0)} N/m (Kutta-Joukowski)`
        + (Math.abs(p.alpha) >= 11 ? ' · ⚠️ cerca del límite: el modelo no reproduce la pérdida' : ''),
      extra: { L, gamma },
    });
  });

  const p = params;
  const L = sustentacion(p.U, p.alpha);

  return (
    <group>
      {/* suelo y paredes insinuadas del túnel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -Y_MAX - 0.6, 0]} receiveShadow>
        <planeGeometry args={[28, 10]} />
        <meshStandardMaterial color="#101a33" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, -1.6]}>
        <boxGeometry args={[26, 2 * Y_MAX + 1.4, 0.1]} />
        <meshStandardMaterial color="#0d1730" transparent opacity={0.5} />
        <Edges color="#334155" />
      </mesh>

      {/* "perfil alar": cilindro circular (el campo se calcula con él);
          el aplastado en Y es SOLO estético */}
      <mesh rotation={[0, 0, (-p.alpha * Math.PI) / 180]} scale={[1, 0.55, 1]}>
        <cylinderGeometry args={[A, A, 2.4, 36]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.35} />
      </mesh>

      <Trazadores world={world} params={p} budget={quality.particleBudget || 0.6} playing={playing} />

      {/* flecha de viento de entrada */}
      <VectorArrow origin={[X_MIN + 0.4, Y_MAX - 0.6, 0]} dir={[1, 0, 0]} length={Math.min(2.6, p.U * 0.06 + 0.4)} color="#60a5fa" label={`U = ${fmt(p.U, 0)} m/s`} thickness={0.05} />

      {/* sustentación sobre el perfil */}
      {showVectors && Math.abs(L) > 5 && (
        <VectorArrow
          origin={[0, Math.sign(L) * (A * 0.6), 0]}
          dir={[0, Math.sign(L), 0]}
          length={Math.min(3.2, Math.abs(L) * 0.0022 + 0.3)}
          color="#4ade80"
          label={`L = ${fmt(L, 0)} N/m`}
        />
      )}

      <Billboard position={[0, Y_MAX + 1, 0]}>
        <Texto3D fontSize={0.46} color={L >= 0 ? '#4ade80' : '#f87171'} outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          Sustentación: {fmt(L, 0)} N/m
        </Texto3D>
      </Billboard>
    </group>
  );
}

const simDef = {
  id: 'tunel-viento',
  nombre: 'Túnel de viento (Bernoulli)',
  icono: '🛩️',
  descripcion: 'Mira el aire acelerarse sobre el perfil y mide la sustentación: L = ρ·U·Γ.',
  curso: { level: 'bachillerato', grade: 2 },
  esAmpliacion: true,
  usaTrayectoria: false,
  paramsDef: [
    { key: 'U', label: 'Velocidad del viento', min: 5, max: 40, step: 1, def: 20, unit: 'm/s' },
    { key: 'alpha', label: 'Ángulo de ataque', min: -12, max: 12, step: 1, def: 6, unit: '°' },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Kutta-Joukowski', expr: 'L = ρ·U·Γ', leyenda: 'sustentación por unidad de envergadura (N/m)' },
    { titulo: 'Condición de Kutta', expr: 'Γ = 4π·U·a·senα', leyenda: 'sin circulación, ¡la sustentación sería cero!' },
    { titulo: 'Bernoulli', expr: 'p + ½·ρ·v² = cte', leyenda: 'donde el aire va más rápido, la presión baja' },
  ],
  fondo: () => '#0a1228',
  camara: { position: [0, 0, 19], fov: 50 },
  controles: { target: [0, 0, 0], maxDistance: 40, maxPolarAngle: Math.PI },
  Scene,
  retos: [
    {
      id: 'despegue',
      titulo: 'Despegue',
      descripcion: 'Consigue una sustentación de 500 N/m o más.',
      pista: 'L crece con U² y con senα: 20 m/s a 6° ya rozan los 500.',
      check: (tel) => (tel.extra?.L ?? 0) >= 500,
    },
    {
      id: 'vuelo-invertido',
      titulo: 'Vuelo invertido',
      descripcion: 'Genera sustentación NEGATIVA de al menos 200 N/m (hacia abajo, como un alerón de F1).',
      pista: 'Ángulo de ataque negativo.',
      check: (tel) => (tel.extra?.L ?? 0) <= -200,
    },
    {
      id: 'ley-cuadratica',
      titulo: 'La ley cuadrática',
      descripcion: 'Consigue una sustentación entre 960 y 1040 N/m.',
      pista: 'Si con cierta U logras ≈250 N/m, DUPLICA la velocidad: L ∝ U² → ×4 ≈ 1000.',
      check: (tel) => (tel.extra?.L ?? 0) >= 960 && (tel.extra?.L ?? 0) <= 1040,
    },
  ],
  examTemplates: [], // ampliación: nunca entra en examen
};

export default simDef;
