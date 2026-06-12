// Simulación — Prensa hidráulica (4º ESO).
// Principio de Pascal: la presión aplicada a un fluido confinado se transmite
// íntegra a todo el fluido → F2 = F1·S2/S1. Todas las magnitudes medibles
// salen de la fórmula analítica; la animación (subir la carga a 0,15 m/s)
// es solo visualización determinista a paso fijo.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges, Text } from '@react-three/drei';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const G = 9.8;
const V_SUBIDA = 0.15;   // velocidad de subida del émbolo grande (m/s)
const D2_MAX = 1;        // recorrido del émbolo grande (m) → done
const VSY = 1.2;         // 1 m real = 1,2 unidades visuales en vertical
const MAX_DROP = 1.65;   // recorrido visual máximo del émbolo pequeño (unidades)
const XS = -3.0;         // x del émbolo pequeño
const XB = 2.6;          // x del émbolo grande
const Y1_PISTON = 3.0;   // centro del émbolo pequeño en reposo
const Y2_PISTON = 1.7;   // centro del émbolo grande en reposo
const FLUID_Y0 = 0.55;   // base de las columnas de fluido
const H_SMALL0 = 2.2;    // altura inicial de la columna pequeña (hasta 2,75)
const H_BIG0 = 0.95;     // altura inicial de la columna grande (hasta 1,5)

// radio visual proporcional a √S (mismo factor en ambos → r2/r1 = √(S2/S1) honesto)
const radioDe = (sCm2) => 0.055 * Math.sqrt(sCm2);
// F2 = F1·S2/S1 (las áreas en cm² se cancelan en el cociente)
const fuerzaGrande = (f1, s1, s2) => (f1 * s2) / s1;
// presión en kPa: p = F1 / (S1·10⁻⁴ m²) Pa = F1·10/S1 kPa
const presionKPa = (f1, s1) => (f1 * 10) / s1;

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = { d2: 0, done: false };
}

// Coche low-poly que viaja sobre el émbolo grande (origen = apoyo de las ruedas)
function Coche({ shadows }) {
  return (
    <group>
      <mesh position={[0, 0.62, 0]} castShadow={shadows}>
        <boxGeometry args={[2.1, 0.52, 1.05]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0.1, 1.05, 0]} castShadow={shadows}>
        <boxGeometry args={[1.1, 0.42, 0.9]} />
        <meshStandardMaterial color="#bae6fd" roughness={0.2} metalness={0.4} />
      </mesh>
      {[[-0.72, 0.55], [-0.72, -0.55], [0.72, 0.55], [0.72, -0.55]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.26, z]} rotation={[Math.PI / 2, 0, 0]} castShadow={shadows}>
          <cylinderGeometry args={[0.26, 0.26, 0.18, 14]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const smallGroupRef = useRef(null);
  const bigGroupRef = useRef(null);
  const smallFluidRef = useRef(null);
  const bigFluidRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world);
  }, [world, playing, params.f1, params.s1, params.s2, params.carga]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const f2 = fuerzaGrande(p.f1, p.s1, p.s2);
    // solo sube si la fuerza transmitida supera el peso de la carga
    if (f2 > p.carga * G) {
      d.d2 += V_SUBIDA * dt;
      if (d.d2 >= D2_MAX) { d.d2 = D2_MAX; d.done = true; }
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    const ratio = p.s2 / p.s1;
    const f2 = fuerzaGrande(p.f1, p.s1, p.s2);
    const peso = p.carga * G;
    const d1 = d.d2 * ratio;                       // conservación de volumen: S1·d1 = S2·d2
    const dropVis = Math.min(d1 * VSY, MAX_DROP);  // recorrido visual limitado
    const lift = d.d2 * VSY;
    if (smallGroupRef.current) smallGroupRef.current.position.y = -dropVis;
    if (bigGroupRef.current) bigGroupRef.current.position.y = lift;
    if (smallFluidRef.current) {
      const h = H_SMALL0 - dropVis;
      smallFluidRef.current.scale.y = h;
      smallFluidRef.current.position.y = FLUID_Y0 + h / 2;
    }
    if (bigFluidRef.current) {
      const h = H_BIG0 + lift;
      bigFluidRef.current.scale.y = h;
      bigFluidRef.current.position.y = FLUID_Y0 + h / 2;
    }
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Presión', value: presionKPa(p.f1, p.s1), unit: 'kPa', decimals: 1 },
        { label: 'F₂ sobre la carga', value: f2, unit: 'N', decimals: 0 },
        { label: 'Peso de la carga', value: peso, unit: 'N', decimals: 0 },
        { label: 'Elevación', value: d.d2, unit: 'm', decimals: 2 },
        { label: 'Bajada émbolo pequeño', value: d1, unit: 'm', decimals: 2 },
      ],
      formulaViva: `F₂ = F₁·S₂/S₁ = ${fmt(p.f1, 0)} · ${fmt(p.s2, 0)}/${fmt(p.s1, 0)} = ${fmt(f2, 0)} N`,
      extra: { f2, levanta: f2 > peso, elevacion: d.d2, peso },
    });
  });

  const d = world.data || { d2: 0, done: false };
  const p = params;
  const r1 = radioDe(p.s1);
  const r2 = radioDe(p.s2);
  const f2 = fuerzaGrande(p.f1, p.s1, p.s2);
  const peso = p.carga * G;
  const levanta = f2 > peso;
  const ratio = p.s2 / p.s1;
  const d1 = d.d2 * ratio;
  const dropVis = Math.min(d1 * VSY, MAX_DROP);
  const lift = d.d2 * VSY;
  const y1c = Y1_PISTON - dropVis;           // centro actual del émbolo pequeño
  const plateTop = y1c + 0.65 + 0.04;        // cara superior del plato de empuje
  const lenF1 = Math.min(2, 0.5 + p.f1 * 0.003);
  const csCoche = Math.min(1.2, Math.max(0.7, r2 / 1.5));
  const colorF2 = levanta ? '#4ade80' : '#f87171';

  return (
    <group>
      {/* suelo del taller */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[26, 13, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* bancada de la prensa */}
      <mesh position={[(XS + XB) / 2, 0.07, 0]} receiveShadow>
        <boxGeometry args={[9, 0.14, 2.3]} />
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* canal horizontal de fluido (la base de la U) */}
      <mesh position={[(XS + XB) / 2, 0.34, 0]}>
        <boxGeometry args={[XB - XS + 1.2, 0.55, 0.95]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.88} roughness={0.25} />
      </mesh>
      <mesh position={[(XS + XB) / 2, 0.36, 0]}>
        <boxGeometry args={[XB - XS + 1.45, 0.72, 1.12]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.12} depthWrite={false} />
        <Edges color="#64748b" />
      </mesh>

      {/* tubo del émbolo pequeño */}
      <mesh position={[XS, 2.05, 0]}>
        <cylinderGeometry args={[r1 + 0.1, r1 + 0.1, 3, 24, 1, true]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.14} depthWrite={false} side={2} />
        <Edges color="#64748b" />
      </mesh>
      {/* tubo del émbolo grande */}
      <mesh position={[XB, 1.6, 0]}>
        <cylinderGeometry args={[r2 + 0.12, r2 + 0.12, 2, 32, 1, true]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.14} depthWrite={false} side={2} />
        <Edges color="#64748b" />
      </mesh>

      {/* columnas de fluido (escaladas imperativamente en useFrame) */}
      <mesh ref={smallFluidRef} position={[XS, FLUID_Y0 + (H_SMALL0 - dropVis) / 2, 0]} scale={[1, H_SMALL0 - dropVis, 1]}>
        <cylinderGeometry args={[r1 + 0.04, r1 + 0.04, 1, 20]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.88} roughness={0.25} />
      </mesh>
      <mesh ref={bigFluidRef} position={[XB, FLUID_Y0 + (H_BIG0 + lift) / 2, 0]} scale={[1, H_BIG0 + lift, 1]}>
        <cylinderGeometry args={[r2 + 0.05, r2 + 0.05, 1, 28]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.88} roughness={0.25} />
      </mesh>

      {/* émbolo pequeño + vástago + plato (baja con d1, recorrido visual limitado) */}
      <group ref={smallGroupRef} position={[0, -dropVis, 0]}>
        <mesh position={[XS, Y1_PISTON, 0]} castShadow={quality.shadows}>
          <cylinderGeometry args={[r1, r1, 0.5, 20]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[XS, Y1_PISTON + 0.65, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[XS, Y1_PISTON + 1.09, 0]} castShadow={quality.shadows}>
          <cylinderGeometry args={[0.38, 0.38, 0.08, 20]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.5} />
        </mesh>
      </group>

      {/* émbolo grande + coche (sube con d2) */}
      <group ref={bigGroupRef} position={[0, lift, 0]}>
        <mesh position={[XB, Y2_PISTON, 0]} castShadow={quality.shadows}>
          <cylinderGeometry args={[r2, r2, 0.4, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.55} roughness={0.35} />
        </mesh>
        <group position={[XB, Y2_PISTON + 0.2, 0]} scale={csCoche}>
          <Coche shadows={quality.shadows} />
        </group>
        <Billboard position={[XB, Y2_PISTON + 0.2 + 1.75 * csCoche, 0]}>
          <Text fontSize={0.3} color="#e2e8f0" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            {fmt(p.carga, 0)} kg · P = {fmt(peso, 0)} N
          </Text>
        </Billboard>
      </group>

      {/* marcador F₂: verde si puede levantar la carga, rojo si no */}
      <Billboard position={[XB, 4.6 + lift, 0]}>
        <Text fontSize={0.5} color={colorF2} outlineWidth={0.024} outlineColor="#0f172a" anchorX="center">
          F₂ = {fmt(f2, 0)} N
        </Text>
      </Billboard>
      {d.done && (
        <Billboard position={[XB, 5.3 + lift, 0]}>
          <Text fontSize={0.34} color="#4ade80" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            ✔ Carga levantada
          </Text>
        </Billboard>
      )}

      {/* conservación del volumen: cuánto baja realmente el émbolo pequeño */}
      {d.d2 > 0.001 && (
        <Billboard position={[XS - 0.2, y1c + 2.3, 0]}>
          <Text fontSize={0.28} color="#67e8f9" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            d₁ = d₂·S₂/S₁ = {fmt(d1, 1)} m (×{fmt(ratio, 0)})
          </Text>
        </Billboard>
      )}

      {/* etiquetas de las superficies */}
      <Billboard position={[XS, 0.42, 1.35]}>
        <Text fontSize={0.26} color="#94a3b8" anchorX="center">S₁ = {fmt(p.s1, 0)} cm²</Text>
      </Billboard>
      <Billboard position={[XB, 0.42, 1.55]}>
        <Text fontSize={0.26} color="#94a3b8" anchorX="center">S₂ = {fmt(p.s2, 0)} cm²</Text>
      </Billboard>

      {/* vectores de fuerza */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={[XS, plateTop + 0.12 + lenF1, 0]}
            dir={[0, -1, 0]}
            length={lenF1}
            color="#fbbf24"
            label={`F₁ = ${fmt(p.f1, 0)} N`}
          />
          <VectorArrow
            origin={[XB + r2 + 0.55, Y2_PISTON + lift - 0.1, 0]}
            dir={[0, 1, 0]}
            length={Math.min(2.2, 0.4 + f2 * 0.00008)}
            color={colorF2}
            label={`F₂ = ${fmt(f2, 0)} N`}
          />
          <VectorArrow
            origin={[XB - r2 - 0.55, Y2_PISTON + lift + 1.7, 0]}
            dir={[0, -1, 0]}
            length={Math.min(2.2, 0.4 + peso * 0.00008)}
            color="#f87171"
            label={`P = ${fmt(peso, 0)} N`}
            thickness={0.04}
          />
        </group>
      )}
    </group>
  );
}

// carga (kg, múltiplo de 50 dentro del slider) que garantiza peso < F2 → se ve subir
const cargaQueSube = (f2) => Math.max(100, Math.min(2000, Math.floor(f2 / G / 50) * 50 - 50));

const simDef = {
  id: 'pascal',
  nombre: 'Prensa hidráulica',
  icono: '🚗',
  descripcion: 'El principio de Pascal en acción: multiplica tu fuerza con dos émbolos comunicados y levanta un coche.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'f1', label: 'Fuerza aplicada F₁', min: 10, max: 500, step: 10, def: 100, unit: 'N' },
    { key: 's1', label: 'Émbolo pequeño S₁', min: 5, max: 50, step: 5, def: 20, unit: 'cm²' },
    { key: 's2', label: 'Émbolo grande S₂', min: 100, max: 2000, step: 50, def: 1000, unit: 'cm²' },
    { key: 'carga', label: 'Carga a levantar', min: 100, max: 2000, step: 50, def: 800, unit: 'kg' },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Principio de Pascal', expr: 'p = F₁/S₁ = F₂/S₂', leyenda: 'la presión se transmite íntegra a todo el fluido confinado' },
    { titulo: 'Multiplicación de la fuerza', expr: 'F₂ = F₁ · S₂/S₁', leyenda: 'para la presión en pascales: 1 cm² = 10⁻⁴ m²' },
    { titulo: 'Conservación del volumen', expr: 'S₁·d₁ = S₂·d₂', leyenda: 'el émbolo pequeño baja d₁ = d₂·S₂/S₁ (mucho más de lo que sube el grande)' },
    { titulo: 'Condición para levantar', expr: 'F₂ > M·g', leyenda: 'M: masa de la carga (kg) · g = 9,8 m/s²' },
  ],
  fondo: () => '#101b33',
  camara: { position: [1, 5.5, 12.5], fov: 45 },
  controles: { target: [0, 1.8, 0], maxDistance: 35 },
  Scene,
  retos: [
    {
      id: 'gato-hidraulico',
      titulo: 'Gato hidráulico',
      descripcion: 'Levanta del todo una carga de 1000 kg o más aplicando como mucho 100 N.',
      pista: 'Necesitas S₂/S₁ ≥ 98. Por ejemplo S₁ = 20 cm² y S₂ = 2000 cm² multiplican ×100: F₂ = 10 000 N > 9800 N.',
      check: (tel, p) => tel.done && p.carga >= 1000 && p.f1 <= 100,
    },
    {
      id: 'con-un-dedo',
      titulo: 'Con un dedo',
      descripcion: 'Levanta del todo una carga de 500 kg o más aplicando 30 N como máximo.',
      pista: 'Hace falta multiplicar al menos ×164. Con S₁ = 10 y S₂ = 2000 multiplicas ×200: 30 · 200 = 6000 N > 4900 N.',
      check: (tel, p) => tel.done && p.carga >= 500 && p.f1 <= 30,
    },
    {
      id: 'ajuste-fino',
      titulo: 'Ajuste fino',
      descripcion: 'Consigue una F₂ entre 5000 y 5500 N.',
      pista: 'F₂ = F₁·S₂/S₁. Con S₁ = 20 y S₂ = 1000 multiplicas ×50: prueba F₁ entre 100 y 110 N.',
      check: (tel) => tel.extra?.f2 >= 5000 && tel.extra.f2 <= 5500,
    },
    {
      id: 'al-limite',
      titulo: 'Al límite',
      descripcion: 'Levanta la carga del todo con una F₂ que no supere su peso en más de un 10 %.',
      pista: 'Con 1000 kg (peso 9800 N) vale una F₂ de 10 000 N: S₁ = 20, S₂ = 2000 y F₁ = 100 N.',
      check: (tel, p) => tel.done && tel.extra?.f2 <= 1.1 * p.carga * G,
    },
  ],
  examTemplates: [
    {
      id: 'fuerza-grande',
      generar: (rng) => {
        const f1 = randInt(rng, 5, 20) * 10;
        const s1 = pick(rng, [10, 20]);
        const s2 = pick(rng, [500, 1000, 2000]);
        const f2 = (f1 * s2) / s1;
        return {
          enunciado: `En una prensa hidráulica aplicamos ${f1} N sobre el émbolo pequeño, de ${s1} cm². Si el émbolo grande tiene ${s2} cm², ¿qué fuerza ejerce sobre la carga?`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: f2,
          toleranciaAbs: 1,
          simParams: { f1, s1, s2, carga: cargaQueSube(f2) },
          simDuracion: 9,
          explica: {
            pregunta: '¿Qué magnitud vale lo mismo en los dos émbolos?',
            opciones: [
              'La presión: p = F/S es la misma en todo el fluido (principio de Pascal)',
              'La fuerza: el fluido la transmite sin cambiarla',
              'La superficie: si no, la prensa no funcionaría',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'fuerza-minima',
      generar: (rng) => {
        const M = randInt(rng, 4, 20) * 100;
        const s1 = pick(rng, [10, 20]);
        const s2 = pick(rng, [1000, 2000]);
        const f1Min = (M * G * s1) / s2;
        const f1Sim = Math.min(500, (Math.ceil(f1Min / 10) + 1) * 10);
        return {
          enunciado: `Queremos levantar un coche de ${M} kg con una prensa de émbolos de ${s1} cm² y ${s2} cm². ¿Qué fuerza mínima hay que aplicar sobre el émbolo pequeño? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: f1Min,
          toleranciaAbs: 0.5,
          simParams: { f1: f1Sim, s1, s2, carga: M },
          simDuracion: 9,
          explica: {
            pregunta: 'Si quisieras levantarlo con todavía menos fuerza, ¿qué harías?',
            opciones: [
              'Aumentar S₂ o reducir S₁, para que el cociente S₂/S₁ sea mayor',
              'Aumentar S₁, para empujar sobre más superficie',
              'Poner más líquido en la prensa',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'presion-fluido',
      generar: (rng) => {
        const f1 = randInt(rng, 5, 30) * 10;
        const s1 = pick(rng, [10, 20, 25, 40, 50]);
        const pKPa = (f1 * 10) / s1;
        const f2 = (f1 * 1000) / s1;
        return {
          enunciado: `Aplicamos ${f1} N sobre un émbolo de ${s1} cm². ¿Qué presión se transmite al fluido? (1 cm² = 10⁻⁴ m²; da el resultado en kPa)`,
          tipo: 'numerica',
          unidad: 'kPa',
          respuesta: pKPa,
          toleranciaAbs: 0.5,
          simParams: { f1, s1, s2: 1000, carga: cargaQueSube(f2) },
          simDuracion: 9,
          explica: {
            pregunta: '¿Por qué hay que pasar los cm² a m²?',
            opciones: [
              'Porque el pascal es N/m²: 1 cm² son 10⁻⁴ m², y olvidarlo da un error de ×10 000',
              'Porque los cm² solo sirven para medir sólidos, no fluidos',
              'No hace falta: la presión sale igual con cualquier unidad de superficie',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'por-que-multiplica',
      generar: (rng) => {
        const ratio = pick(rng, [50, 100, 200]);
        const f1 = pick(rng, [50, 100]);
        const f2 = f1 * ratio;
        const areas = ratio === 50 ? { s1: 20, s2: 1000 } : ratio === 100 ? { s1: 20, s2: 2000 } : { s1: 10, s2: 2000 };
        return {
          enunciado: `En una prensa hidráulica, ${f1} N aplicados en el émbolo pequeño se convierten en ${fmt(f2, 0)} N sobre la carga. ¿Por qué se multiplica la fuerza?`,
          tipo: 'opciones',
          opciones: [
            'Porque la presión es la misma en todo el fluido y en el émbolo grande actúa sobre más superficie (F = p·S)',
            'Porque el fluido empuja con más velocidad en el émbolo grande',
            'Porque el émbolo grande pesa más y su peso ayuda a empujar',
          ],
          correcta: 0,
          simParams: { f1, ...areas, carga: cargaQueSube(f2) },
          simDuracion: 9,
          explica: {
            pregunta: '¿Se gana también energía con la prensa?',
            opciones: [
              'No: lo que se gana en fuerza se pierde en recorrido (el émbolo pequeño baja mucho más de lo que sube el grande)',
              'Sí: la prensa crea energía a partir de la presión del fluido',
              'Sí, pero solo si el fluido es incompresible',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
