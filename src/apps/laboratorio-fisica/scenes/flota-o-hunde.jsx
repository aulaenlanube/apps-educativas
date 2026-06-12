// Simulación 5 — ¿Flota o se hunde? (3º ESO).
// Principio de Arquímedes: un cubo macizo cae sobre un tanque de líquido y
// flota (fracción sumergida = ρ_obj/ρ_liq) o se hunde hasta el fondo
// (ρ_obj ≥ ρ_liq). Dinámica vertical con empuje + amortiguación para que se
// asiente; las magnitudes medibles salen de la fórmula analítica.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges, Text } from '@react-three/drei';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { MATERIALES, LIQUIDOS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { empuje } from '../engine/forces';
import { randInt, pick } from '../engine/rng';

const G = 9.8;
const VS = 6;            // escala visual: 1 m real = 6 unidades de escena
const PROF = 0.8;        // profundidad del líquido en el tanque (m)
const DROP = 0.35;       // altura inicial del cubo sobre la superficie (m)
const ANCHO = 0.9;       // anchura interior del tanque (m)
const ALTO_TANQUE = 1.2; // altura del cristal (m)

const LIQ_KEYS = ['gasolina', 'aceite', 'agua', 'mercurio'];

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ladoDe = (volumenL) => Math.cbrt(volumenL / 1000); // arista del cubo (m)
// '🧊 Hielo' → 'hielo' (para enunciados en mitad de frase)
const nombreDe = (label) => label.replace(/^\S+\s/, '').toLowerCase();

function reinit(world, params) {
  const L = ladoDe(params.volumen);
  world.t = 0;
  world._acc = 0;
  world.data = {
    y: PROF + DROP + L / 2, // altura del centro del cubo sobre el fondo (m)
    v: 0,                   // velocidad vertical (m/s, positiva hacia arriba)
    settleT: 0,
    asentado: false,
    fondo: false,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const cubeRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.material, params.volumen, params.liquido]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const L = ladoDe(p.volumen);
    const rhoObj = MATERIALES[p.material].rho;
    const rhoLiq = LIQUIDOS[p.liquido].rho;
    const m = rhoObj * (p.volumen / 1000);
    const flota = rhoObj < rhoLiq;
    const hSub = clamp(PROF - (d.y - L / 2), 0, L); // altura sumergida del cubo
    const vSum = hSub * L * L;                      // volumen sumergido (m³)
    // Amortiguación: fuerte en la superficie (bamboleo, ζ = 0,5 → c = ω) y
    // suave a cubo hundido para que el descenso al fondo se vea.
    const omega = Math.sqrt((rhoLiq * G * L * L) / m);
    let c = 0;
    if (hSub > 0) c = hSub < L ? omega : Math.min(omega, 2);
    const a = -G + empuje(rhoLiq, G, vSum) / m - c * d.v;
    d.v += a * dt;
    d.y += d.v * dt;
    if (d.y - L / 2 <= 0) {
      d.y = L / 2;
      d.v = 0;
      d.fondo = true;
      d.done = true;
    }
    // asentado: cubo que flota con |v| < 0,02 m/s sostenido medio segundo
    if (!d.fondo && flota && hSub > 0 && Math.abs(d.v) < 0.02) {
      d.settleT += dt;
      if (d.settleT >= 0.5) { d.asentado = true; d.done = true; }
    } else {
      d.settleT = 0;
    }
  });

  useFrame(() => {
    const d = world.data;
    if (!d) return;
    if (cubeRef.current) cubeRef.current.position.y = d.y * VS;
    const p = paramsRef.current;
    const L = ladoDe(p.volumen);
    const rhoObj = MATERIALES[p.material].rho;
    const rhoLiq = LIQUIDOS[p.liquido].rho;
    const flota = rhoObj < rhoLiq;
    const hSub = clamp(PROF - (d.y - L / 2), 0, L);
    const E = empuje(rhoLiq, G, hSub * L * L);
    const pct = (hSub / L) * 100;
    const pctEq = Math.min(100, (rhoObj / rhoLiq) * 100);
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'ρ objeto', value: rhoObj, unit: 'kg/m³', decimals: 0 },
        { label: 'ρ líquido', value: rhoLiq, unit: 'kg/m³', decimals: 0 },
        { label: 'Sumergido', value: pct, unit: '%', decimals: 1 },
        { label: 'Empuje E', value: E, unit: 'N', decimals: 1 },
      ],
      formulaViva: flota
        ? `ρ_obj = ${fmt(rhoObj, 0)} < ρ_liq = ${fmt(rhoLiq, 0)} → FLOTA (${fmt(pctEq, 1)} % sumergido)`
        : `ρ_obj = ${fmt(rhoObj, 0)} ≥ ρ_liq = ${fmt(rhoLiq, 0)} → SE HUNDE`,
      extra: { flota, pctSumergido: pct, asentado: d.asentado },
    });
  });

  const p = params;
  const L = ladoDe(p.volumen);
  const d = world.data || { y: PROF + DROP + L / 2, v: 0, done: false };
  const lado = L * VS;
  const rhoObj = MATERIALES[p.material].rho;
  const rhoLiq = LIQUIDOS[p.liquido].rho;
  const m = rhoObj * (p.volumen / 1000);
  const flota = rhoObj < rhoLiq;
  const hSub = clamp(PROF - (d.y - L / 2), 0, L);
  const E = empuje(rhoLiq, G, hSub * L * L);
  const P = m * G;
  const pct = (hSub / L) * 100;
  const cubeY = d.y * VS;
  const liqColor = LIQUIDOS[p.liquido].color;
  const matColor = MATERIALES[p.material].color;
  const liqH = PROF * VS;
  const tankW = ANCHO * VS;
  const glassW = tankW + 0.16;
  const glassH = ALTO_TANQUE * VS;
  const esMetal = p.material === 'aluminio' || p.material === 'acero' || p.material === 'oro';
  // misma escala para P y E: comparar las flechas ES la lección
  const base = Math.max(P, E, 1e-6);
  const lenP = 1.7 * (P / base);
  const lenE = Math.min(3, 1.7 * (E / base));

  return (
    <group>
      {/* suelo del laboratorio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[11, 44]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[22, 11, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* tanque de cristal */}
      <mesh position={[0, glassH / 2, 0]}>
        <boxGeometry args={[glassW, glassH, glassW]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.06} depthWrite={false} />
        <Edges color="#7dd3fc" />
      </mesh>

      {/* líquido */}
      <mesh position={[0, liqH / 2, 0]}>
        <boxGeometry args={[tankW, liqH, tankW]} />
        <meshStandardMaterial color={liqColor} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* línea de flotación (superficie del líquido) */}
      <mesh position={[0, liqH, 0]}>
        <boxGeometry args={[tankW, 0.025, tankW]} />
        <meshBasicMaterial color={liqColor} transparent opacity={0.65} />
      </mesh>
      <Billboard position={[glassW / 2 + 1.7, liqH, 0]}>
        <Text fontSize={0.26} color="#94a3b8" anchorX="center">línea de flotación</Text>
      </Billboard>

      {/* el cubo (imperativo en useFrame) */}
      <mesh ref={cubeRef} position={[0, cubeY, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[lado, lado, lado]} />
        <meshStandardMaterial
          color={matColor}
          roughness={esMetal ? 0.3 : 0.6}
          metalness={esMetal ? 0.65 : 0.05}
          transparent={p.material === 'hielo'}
          opacity={p.material === 'hielo' ? 0.85 : 1}
        />
        <Edges color="#1e293b" />
      </mesh>
      <Billboard position={[-(glassW / 2) - 1.6, cubeY + lado / 2 + 0.45, 0]}>
        <Text fontSize={0.28} color="#e2e8f0" anchorX="center">
          m = {fmt(m, 2)} kg · {fmt(p.volumen, 1)} L
        </Text>
      </Billboard>

      {/* densidades a un lado del tanque */}
      <Billboard position={[-(glassW / 2) - 1.6, liqH + 1.5, 0]}>
        <Text fontSize={0.3} color={matColor} outlineWidth={0.015} outlineColor="#0f172a" anchorX="center">
          ρ obj = {fmt(rhoObj, 0)} kg/m³
        </Text>
      </Billboard>
      <Billboard position={[-(glassW / 2) - 1.6, liqH + 0.9, 0]}>
        <Text fontSize={0.3} color={liqColor} outlineWidth={0.015} outlineColor="#0f172a" anchorX="center">
          ρ líq = {fmt(rhoLiq, 0)} kg/m³
        </Text>
      </Billboard>

      {/* marcador sobre el tanque */}
      {d.done && (
        <Billboard position={[0, glassH + 1.5, 0]}>
          <Text
            fontSize={0.56}
            color={flota ? '#4ade80' : '#f87171'}
            outlineWidth={0.025}
            outlineColor="#0f172a"
            anchorX="center"
          >
            {flota ? 'FLOTA' : 'SE HUNDE'}
          </Text>
        </Billboard>
      )}
      <Billboard position={[0, glassH + 0.8, 0]}>
        <Text fontSize={0.34} color="#cbd5e1" anchorX="center">
          {fmt(pct, 1)} % sumergido · E = {fmt(E, 1)} N
        </Text>
      </Billboard>

      {/* vectores peso y empuje (declarativos, 12 Hz) */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={[-(lado / 2) - 0.45, cubeY, 0]}
            dir={[0, -1, 0]}
            length={lenP}
            color="#f87171"
            label={`P = ${fmt(P, 1)} N`}
          />
          {E > 0.01 && (
            <VectorArrow
              origin={[lado / 2 + 0.45, cubeY, 0]}
              dir={[0, 1, 0]}
              length={lenE}
              color="#60a5fa"
              label={`E = ${fmt(E, 1)} N`}
            />
          )}
        </group>
      )}
    </group>
  );
}

const MATERIAL_OPTIONS = Object.entries(MATERIALES).map(([value, mat]) => ({
  value,
  label: `${mat.label} · ${mat.rho}`,
}));
const LIQUIDO_OPTIONS = LIQ_KEYS.map((k) => ({
  value: k,
  label: `${LIQUIDOS[k].label} · ${LIQUIDOS[k].rho}`,
}));

// parejas (material, líquido) en las que el cubo flota, para los exámenes
const PAREJAS_FLOTAN = [
  ['hielo', 'agua'],
  ['madera', 'agua'],
  ['madera', 'aceite'],
  ['corcho', 'agua'],
  ['corcho', 'gasolina'],
  ['aluminio', 'mercurio'],
  ['acero', 'mercurio'],
];

const simDef = {
  id: 'flota-o-hunde',
  nombre: '¿Flota o se hunde?',
  icono: '🛟',
  descripcion: 'Suelta cubos de siete materiales en cuatro líquidos y descubre el principio de Arquímedes.',
  curso: { level: 'eso', grade: 3 },
  usaTrayectoria: false,
  usaVectores: true,
  paramsDef: [
    {
      key: 'material', label: 'Material (ρ en kg/m³)', type: 'select', def: 'madera',
      options: MATERIAL_OPTIONS,
    },
    { key: 'volumen', label: 'Volumen del cubo', min: 1, max: 10, step: 0.5, def: 4, unit: 'L', decimals: 1 },
    {
      key: 'liquido', label: 'Líquido (ρ en kg/m³)', type: 'select', def: 'agua',
      options: LIQUIDO_OPTIONS,
    },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Empuje de Arquímedes', expr: 'E = ρ_liq · g · V_sumergido', leyenda: 'igual al peso del líquido desalojado' },
    { titulo: '¿Flota o se hunde?', expr: 'flota si ρ_obj < ρ_liq', leyenda: 'un cuerpo macizo se hunde si ρ_obj ≥ ρ_liq' },
    { titulo: 'Fracción sumergida', expr: '% sumergido = ρ_obj / ρ_liq · 100', leyenda: 'en equilibrio el empuje iguala al peso (E = P)' },
  ],
  fondo: () => '#0b1730',
  camara: { position: [9, 6, 11], fov: 45 },
  controles: { target: [0, 3.4, 0], maxDistance: 32 },
  Scene,
  retos: [
    {
      id: 'iceberg',
      titulo: 'Iceberg a la vista',
      descripcion: 'Consigue que un cubo flote asentado con entre el 88 % y el 95 % de su volumen sumergido.',
      pista: 'Es lo que les pasa a los icebergs: fracción sumergida = ρ_obj/ρ_liq. Prueba 917/1000.',
      check: (tel) => tel.extra?.asentado && tel.extra.flota
        && tel.extra.pctSumergido >= 88 && tel.extra.pctSumergido <= 95,
    },
    {
      id: 'acero-que-flota',
      titulo: 'Acero que flota',
      descripcion: 'Haz que un cubo de acero flote sin hundirse.',
      pista: 'El acero (7850 kg/m³) se hunde en casi todo… busca un líquido todavía MÁS denso que él.',
      check: (tel, p) => p.material === 'acero' && tel.extra?.asentado && tel.extra.flota,
    },
    {
      id: 'madera-al-fondo',
      titulo: 'Madera al fondo',
      descripcion: 'Consigue que un cubo de madera se hunda hasta el fondo del tanque.',
      pista: 'La madera (700 kg/m³) flota en el agua. Necesitas un líquido MENOS denso que ella.',
      check: (tel, p) => p.material === 'madera' && tel.done && tel.extra && !tel.extra.flota,
    },
    {
      id: 'un-tercio-hundido',
      titulo: 'Solo un tercio hundido',
      descripcion: 'Consigue que un cubo flote asentado con entre el 30 % y el 40 % de su volumen sumergido.',
      pista: 'Necesitas un cociente ρ_obj/ρ_liq entre 0,30 y 0,40: combina el material menos denso con el líquido menos denso.',
      check: (tel) => tel.extra?.asentado && tel.extra.flota
        && tel.extra.pctSumergido >= 30 && tel.extra.pctSumergido <= 40,
    },
  ],
  examTemplates: [
    {
      id: 'flota-o-no',
      generar: (rng) => {
        const matKey = pick(rng, Object.keys(MATERIALES));
        const liqKey = pick(rng, LIQ_KEYS);
        const rhoObj = MATERIALES[matKey].rho;
        const rhoLiq = LIQUIDOS[liqKey].rho;
        const flota = rhoObj < rhoLiq;
        return {
          enunciado: `Un cubo macizo de ${nombreDe(MATERIALES[matKey].label)} (ρ = ${fmt(rhoObj, 0)} kg/m³) se suelta sobre un tanque de ${nombreDe(LIQUIDOS[liqKey].label)} (ρ = ${fmt(rhoLiq, 0)} kg/m³). ¿Qué le ocurre?`,
          tipo: 'opciones',
          opciones: [
            'Flota: su densidad es menor que la del líquido',
            'Se hunde hasta el fondo: su densidad es mayor o igual que la del líquido',
            'Depende del tamaño: si el cubo es muy grande, se hunde',
          ],
          correcta: flota ? 0 : 1,
          simParams: { material: matKey, volumen: 4, liquido: liqKey },
          simDuracion: 7,
          explica: {
            pregunta: 'Si partimos el cubo por la mitad, ¿qué hace cada mitad?',
            opciones: [
              'Lo mismo que el cubo entero: la densidad no depende del tamaño',
              'Flotan mejor, porque cada mitad pesa menos',
              'Se hunden, porque cada mitad recibe menos empuje',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'pct-sumergido',
      generar: (rng) => {
        const [matKey, liqKey] = pick(rng, PAREJAS_FLOTAN);
        const rhoObj = MATERIALES[matKey].rho;
        const rhoLiq = LIQUIDOS[liqKey].rho;
        const pct = (rhoObj / rhoLiq) * 100;
        return {
          enunciado: `Un cubo de ${nombreDe(MATERIALES[matKey].label)} (ρ = ${fmt(rhoObj, 0)} kg/m³) flota en ${nombreDe(LIQUIDOS[liqKey].label)} (ρ = ${fmt(rhoLiq, 0)} kg/m³). ¿Qué porcentaje de su volumen queda sumergido?`,
          tipo: 'numerica',
          unidad: '%',
          respuesta: pct,
          toleranciaAbs: 0.5,
          simParams: { material: matKey, volumen: 4, liquido: liqKey },
          simDuracion: 6,
          explica: {
            pregunta: '¿De dónde sale esa fracción sumergida?',
            opciones: [
              'Del equilibrio: el empuje ρ_liq·g·V_sum iguala al peso ρ_obj·g·V',
              'De la presión atmosférica que aprieta la cara superior del cubo',
              'De la viscosidad del líquido, que sujeta al cubo',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'doble-volumen',
      generar: (rng) => {
        const [matKey, liqKey] = pick(rng, [['madera', 'agua'], ['hielo', 'agua'], ['corcho', 'agua']]);
        const pct = (MATERIALES[matKey].rho / LIQUIDOS[liqKey].rho) * 100;
        const V = randInt(rng, 2, 5);
        return {
          enunciado: `Un cubo de ${nombreDe(MATERIALES[matKey].label)} de ${V} L flota en agua con el ${fmt(pct, 1)} % de su volumen sumergido. Si usamos un cubo de ${V * 2} L (el doble) del mismo material, ¿cómo flotará?`,
          tipo: 'opciones',
          opciones: [
            `Igual: con el ${fmt(pct, 1)} % de su volumen sumergido`,
            'Más hundido, porque pesa el doble',
            'Menos hundido, porque tiene más volumen para flotar',
          ],
          correcta: 0,
          simParams: { material: matKey, volumen: V * 2, liquido: liqKey },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué no cambia la fracción sumergida al duplicar el volumen?',
            opciones: [
              'Peso y empuje crecen en la misma proporción: el cociente ρ_obj/ρ_liq no cambia',
              'Porque el agua compensa el peso extra con más presión',
              'Porque los cuerpos grandes desplazan menos agua',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'barco-de-acero',
      generar: (rng) => {
        const V = pick(rng, [3, 4, 5]);
        return {
          enunciado: 'El acero (ρ = 7.850 kg/m³) es mucho más denso que el agua (ρ = 1.000 kg/m³) y un cubo macizo de acero se hunde. Sin embargo, un barco de acero flota. ¿Por qué?',
          tipo: 'opciones',
          opciones: [
            'Porque su densidad MEDIA (acero + aire del casco hueco) es menor que la del agua',
            'Porque el agua del mar, al ser salada, empuja muchísimo más',
            'Porque los motores lo mantienen a flote constantemente',
          ],
          correcta: 0,
          simParams: { material: 'acero', volumen: V, liquido: 'agua' },
          simDuracion: 5,
          explica: {
            pregunta: '¿Qué pasa si el casco se llena de agua?',
            opciones: [
              'La densidad media supera a la del agua y el barco se hunde',
              'Nada: el acero del casco sigue siendo el mismo',
              'Flota mejor, porque el agua extra lo estabiliza',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
