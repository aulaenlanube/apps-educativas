// Simulación — Montaña rusa de la energía (4º ESO).
// Pista 1D parametrizada por la longitud de arco s: bajada recta a 35° desde
// altura H, llano de 20 m con rozamiento μ y subida recta a 35°. Toda la
// física es analítica sobre s (a = −g·dh/ds − μ·g·sign(v), con μ SOLO en el
// llano); las energías Ep/Ec/E total salen de fórmulas, nunca del visual.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const G = 9.8;
const THETA = (35 * Math.PI) / 180; // 35° de inclinación en ambas rampas
const SIN = Math.sin(THETA);
const COS = Math.cos(THETA);
const TAN = Math.tan(THETA);
const LLANO = 20;       // longitud del tramo llano (m)
const HALF = LLANO / 2; // el llano va de x = −10 a x = +10 (m)
const VS = 0.25;        // 1 m real = 0,25 unidades de escena

// altura h(s) por tramos; s = longitud de arco desde el alto de la 1ª rampa
function alturaEn(s, H) {
  const L = H / SIN;
  if (s < L) return H - s * SIN;
  if (s <= L + LLANO) return 0;
  return (s - L - LLANO) * SIN;
}

// posición (x, y) en metros y ángulo de la pista en s (para orientar el carro)
function posDe(s, H) {
  const L = H / SIN;
  if (s < L) return { x: -HALF - (L - s) * COS, y: H - s * SIN, ang: -THETA };
  if (s <= L + LLANO) return { x: -HALF + (s - L), y: 0, ang: 0 };
  const s3 = s - L - LLANO;
  return { x: HALF + s3 * COS, y: s3 * SIN, ang: THETA };
}

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = {
    s: 0,               // arranca en el alto de la 1ª rampa, en reposo
    v: 0,               // velocidad sobre la pista (m/s, + hacia la 2ª rampa)
    hMax2: 0,           // altura máxima en la 2ª rampa (solo PRIMERA pasada)
    enSubida2: false,
    primeraSubidaHecha: false,
    vMaxValle: 0,
    paradoEnLlano: false,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const cartRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world);
  }, [world, playing, params.altura, params.masa, params.mu]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const L = p.altura / SIN;
    const sFlat0 = L;
    const sFlat1 = L + LLANO;
    const sEnd = sFlat1 + L;
    // dos substeps: reduce el error de Euler al cruzar los cambios de tramo
    const sub = dt / 2;
    for (let i = 0; i < 2; i++) {
      const enLlano = d.s >= sFlat0 && d.s <= sFlat1;
      let a;
      if (d.s < sFlat0) a = G * SIN;        // bajada: acelera hacia +s
      else if (enLlano) a = 0;
      else a = -G * SIN;                    // subida: la gravedad frena
      // rozamiento SOLO en el llano (cosθ = 1), opuesto a la marcha
      if (enLlano && p.mu > 0 && d.v !== 0) a -= p.mu * G * Math.sign(d.v);
      const vPrev = d.v;
      d.v += a * sub;
      // el rozamiento frena pero nunca invierte el sentido de la marcha
      if (enLlano && vPrev !== 0 && Math.sign(d.v) !== Math.sign(vPrev)) d.v = 0;
      d.s += d.v * sub;
      if (d.s < 0) { d.s = 0; if (d.v < 0) d.v = 0; }
      if (d.s > sEnd) { d.s = sEnd; if (d.v > 0) d.v = 0; }
    }
    // registros para retos
    const enLlanoNow = d.s >= sFlat0 && d.s <= sFlat1;
    if (enLlanoNow) d.vMaxValle = Math.max(d.vMaxValle, Math.abs(d.v));
    if (d.s > sFlat1) {
      if (!d.primeraSubidaHecha) d.hMax2 = Math.max(d.hMax2, alturaEn(d.s, p.altura));
      d.enSubida2 = true;
    } else if (d.enSubida2) {
      d.primeraSubidaHecha = true;
      d.enSubida2 = false;
    }
    if (enLlanoNow && Math.abs(d.v) < 0.02 && world.t > 1) {
      d.v = 0;
      d.paradoEnLlano = true;
      d.done = true;
    }
    if (world.t >= 60) d.done = true;
  });

  // carro (rápido) por ref + telemetría, cada frame
  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    const pos = posDe(d.s, p.altura);
    if (cartRef.current) {
      cartRef.current.position.set(pos.x * VS, pos.y * VS, 0);
      cartRef.current.rotation.z = pos.ang;
    }
    const h = alturaEn(d.s, p.altura);
    const ep = p.masa * G * h;
    const ec = 0.5 * p.masa * d.v * d.v;
    const et = ep + ec;
    const dis = Math.max(0, p.masa * G * p.altura - et);
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Velocidad', value: d.v, unit: 'm/s', decimals: 2 },
        { label: 'Altura', value: h, unit: 'm', decimals: 2 },
        { label: 'Ep', value: ep, unit: 'J', decimals: 0 },
        { label: 'Ec', value: ec, unit: 'J', decimals: 0 },
      ],
      series: { v: d.v, h },
      energia: [
        { label: 'Ep', value: ep, color: '#60a5fa' },
        { label: 'Ec', value: ec, color: '#4ade80' },
        { label: 'E total', value: et, color: '#fbbf24' },
      ],
      formulaViva: `E = Ep + Ec = ${fmt(ep, 0)} + ${fmt(ec, 0)} = ${fmt(et, 0)} J (μ disipa ${fmt(dis, 0)} J)`,
      extra: { hMaxSubida: d.hMax2, paradoEnLlano: d.paradoEnLlano, vMaxValle: d.vMaxValle },
    });
  });

  const d = world.data || { s: 0, v: 0 };
  const p = params;
  const pos = posDe(d.s, p.altura);
  const L = p.altura / SIN;          // longitud de cada rampa (m)
  const xTop = HALF + p.altura / TAN; // |x| del alto de las rampas (m)
  const llanoColor = p.mu < 0.005 ? '#475569' : p.mu < 0.15 ? '#92400e' : '#7c2d12';

  // marcas de altura cada 5 m sobre la 2ª rampa
  const marcas = useMemo(() => {
    const out = [];
    for (let h = 5; h <= params.altura; h += 5) out.push(h);
    return out;
  }, [params.altura]);

  // postes de apoyo bajo las rampas
  const postes = useMemo(() => {
    const arr = [];
    [0.45, 0.85].forEach((f) => {
      const hM = params.altura * f;
      const dx = HALF + hM / TAN;
      arr.push({ x: -dx, h: hM }, { x: dx, h: hM });
    });
    return arr;
  }, [params.altura]);

  return (
    <group>
      {/* suelo del recinto de la feria */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color="#16213c" roughness={0.95} />
      </mesh>
      <gridHelper args={[36, 18, '#475569', '#26304a']} position={[0, -0.17, 0]} />

      {/* pista: rampa de bajada — llano — rampa de subida (cajas finas) */}
      <mesh
        position={[(-HALF - p.altura / (2 * TAN)) * VS, (p.altura / 2) * VS - 0.08, 0]}
        rotation={[0, 0, -THETA]}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[L * VS + 0.2, 0.16, 1.1]} />
        <meshStandardMaterial color="#46557a" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.08, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[LLANO * VS + 0.2, 0.16, 1.1]} />
        <meshStandardMaterial color={llanoColor} roughness={0.95} />
      </mesh>
      <mesh
        position={[(HALF + p.altura / (2 * TAN)) * VS, (p.altura / 2) * VS - 0.08, 0]}
        rotation={[0, 0, THETA]}
        castShadow={quality.shadows}
      >
        <boxGeometry args={[L * VS + 0.2, 0.16, 1.1]} />
        <meshStandardMaterial color="#46557a" roughness={0.7} metalness={0.2} />
      </mesh>
      <Billboard position={[0, -0.7, 0.6]}>
        <Text fontSize={0.3} color="#cbd5e1" anchorX="center">llano 20 m · μ = {fmt(p.mu, 2)}</Text>
      </Billboard>

      {/* postes de apoyo */}
      {postes.map((po, i) => {
        const top = po.h * VS - 0.12;
        const len = top + 0.18;
        return len > 0.25 ? (
          <mesh key={i} position={[po.x * VS, (top - 0.18) / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, len, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
        ) : null;
      })}

      {/* plataforma de salida en el alto de la 1ª rampa */}
      <mesh position={[-xTop * VS - 0.6, p.altura * VS - 0.08, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[1.1, 0.16, 1.1]} />
        <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.6} />
      </mesh>
      <Billboard position={[-xTop * VS - 0.6, p.altura * VS + 0.55, 0]}>
        <Text fontSize={0.34} color="#e2e8f0" anchorX="center">SALIDA · H = {fmt(p.altura, 0)} m</Text>
      </Billboard>

      {/* línea de referencia a la altura de salida (¿llega el carro al otro lado?) */}
      <mesh position={[0, p.altura * VS, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 2 * xTop * VS, 6]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.45} />
      </mesh>

      {/* marcas de altura cada 5 m sobre la 2ª rampa */}
      {marcas.map((h) => (
        <group key={h} position={[(HALF + h / TAN) * VS, h * VS, 0.75]}>
          <mesh>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Billboard position={[0.85, 0, 0]}>
            <Text fontSize={0.3} color="#cbd5e1" anchorX="center">{h} m</Text>
          </Billboard>
        </group>
      ))}

      {/* el carro: caja + 4 ruedas, orientado con el ángulo del tramo */}
      <group ref={cartRef} position={[pos.x * VS, pos.y * VS, 0]} rotation={[0, 0, pos.ang]}>
        <mesh position={[0, 0.34, 0]} castShadow={quality.shadows}>
          <boxGeometry args={[0.95, 0.38, 0.7]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[0.6, 0.12, 0.6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.5} />
        </mesh>
        {[[-0.32, 0.36], [0.32, 0.36], [-0.32, -0.36], [0.32, -0.36]].map(([wx, wz], i) => (
          <mesh key={i} position={[wx, 0.13, wz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* vector velocidad, tangente a la pista (declarativo, 12 Hz) */}
      {showVectors && Math.abs(d.v) > 0.3 && (
        <VectorArrow
          origin={[pos.x * VS, pos.y * VS + 0.75, 0]}
          dir={[Math.cos(pos.ang) * Math.sign(d.v), Math.sin(pos.ang) * Math.sign(d.v), 0]}
          length={Math.min(3, 0.3 + Math.abs(d.v) * 0.1)}
          color="#4ade80"
          label={`v = ${fmt(Math.abs(d.v), 1)} m/s`}
        />
      )}
    </group>
  );
}

const simDef = {
  id: 'energia',
  nombre: 'Montaña rusa de la energía',
  icono: '🎢',
  descripcion: 'Suelta el carro desde lo alto y persigue la energía: Ep, Ec y lo que el rozamiento se lleva como calor.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'altura', label: 'Altura inicial', min: 5, max: 30, step: 1, def: 15, unit: 'm' },
    { key: 'masa', label: 'Masa del carro', min: 1, max: 50, step: 1, def: 10, unit: 'kg' },
    { key: 'mu', label: 'Rozamiento del llano μ', min: 0, max: 0.3, step: 0.01, def: 0.08, unit: '', decimals: 2 },
  ],
  graficas: [
    { key: 'v', label: 'velocidad (m/s)', color: '#4ade80' },
    { key: 'h', label: 'altura (m)', color: '#67e8f9' },
  ],
  formulas: [
    { titulo: 'Energía potencial', expr: 'Ep = m·g·h', leyenda: 'h: altura sobre el llano (m)' },
    { titulo: 'Energía cinética', expr: 'Ec = ½·m·v²', leyenda: 'v: velocidad (m/s)' },
    { titulo: 'Conservación', expr: 'Ep + Ec = constante (sin rozamiento)', leyenda: 'en el valle: v = √(2·g·H)' },
    { titulo: 'Trabajo del rozamiento', expr: 'W = μ·m·g·d', leyenda: 'd: metros recorridos en el llano · se transfiere como calor' },
  ],
  fondo: () => '#130f2e',
  camara: { position: [0, 9, 24], fov: 45 },
  controles: { target: [0, 2.2, 0], maxDistance: 60 },
  Scene,
  retos: [
    {
      id: 'conservacion-perfecta',
      titulo: 'Conservación perfecta',
      descripcion: 'Sin rozamiento (μ = 0), consigue que el carro suba en la otra rampa hasta la misma altura de salida (±0,3 m).',
      pista: 'Sin rozamiento la energía mecánica se conserva: toda la Ep se hace Ec en el valle y vuelve a ser Ep al subir. Pon μ = 0 y dale al play.',
      check: (tel, p) => p.mu === 0 && tel.extra?.hMaxSubida > 0
        && Math.abs(tel.extra.hMaxSubida - p.altura) <= 0.3,
    },
    {
      id: 'frenado-de-feria',
      titulo: 'Frenado de feria',
      descripcion: 'Con rozamiento (μ ≥ 0,05), consigue que el carro acabe completamente parado en el llano antes de un minuto.',
      pista: 'Cada cruce del llano disipa W = μ·m·g·20 J. Con μ = 0,2 y H = 15 m el carro muere en el llano en menos de 25 segundos.',
      check: (tel, p) => p.mu >= 0.05 && tel.extra?.paradoEnLlano === true,
    },
    {
      id: 'radar-del-valle',
      titulo: 'Radar del valle',
      descripcion: 'Sin rozamiento, pasa por el llano a una velocidad entre 19 y 21 m/s.',
      pista: 'v = √(2·g·H). Para 20 m/s despeja: H = v²/(2·g) ≈ 20,4 m. Prueba con 20 o 21 m.',
      check: (tel, p) => p.mu === 0 && tel.extra?.vMaxValle >= 19 && tel.extra.vMaxValle <= 21,
    },
    {
      id: 'demuestra-a-galileo',
      titulo: 'Demuestra a Galileo',
      descripcion: 'Pon μ = 0 y la masa al máximo (50 kg): el carro alcanza la misma altura que con 1 kg. La masa no cambia el movimiento.',
      pista: 'En m·g·H = ½·m·v² la masa se cancela en ambos lados: solo cambian las energías (las barras), no la velocidad ni la altura.',
      check: (tel, p) => p.mu === 0 && p.masa >= 50
        && tel.extra?.hMaxSubida >= p.altura - 0.3,
    },
  ],
  examTemplates: [
    {
      id: 'v-valle',
      generar: (rng) => {
        const H = randInt(rng, 5, 30);
        const v = Math.sqrt(2 * G * H);
        const tBajada = Math.sqrt((2 * (H / SIN)) / (G * SIN));
        return {
          enunciado: `Un carro parte del reposo desde ${H} m de altura y baja por una rampa sin rozamiento. ¿A qué velocidad pasa por el valle? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'm/s',
          respuesta: v,
          toleranciaAbs: 0.1,
          simParams: { altura: H, masa: 10, mu: 0 },
          simDuracion: tBajada + 2.5,
          explica: {
            pregunta: '¿Por qué la masa del carro no aparece en v = √(2·g·H)?',
            opciones: [
              'Porque al igualar m·g·H con ½·m·v² la masa se cancela en ambos lados',
              'Porque la masa del carro es demasiado pequeña para influir',
              'Porque el rozamiento compensa exactamente el efecto de la masa',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'ep-calculo',
      generar: (rng) => {
        const m = randInt(rng, 2, 20);
        const h = randInt(rng, 5, 30);
        const ep = m * G * h;
        return {
          enunciado: `Un carro de ${m} kg está en lo alto de la montaña rusa, a ${h} m sobre el llano. ¿Cuál es su energía potencial? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'J',
          respuesta: ep,
          toleranciaAbs: 1,
          simParams: { altura: h, masa: m, mu: 0 },
          simDuracion: 3,
          explica: {
            pregunta: '¿Respecto a qué punto se mide la altura h de la fórmula Ep = m·g·h?',
            opciones: [
              'Respecto al nivel de referencia elegido (aquí, el llano de abajo)',
              'Siempre respecto al nivel del mar',
              'Respecto al punto más alto de la pista',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'ec-calculo',
      generar: (rng) => {
        const m = randInt(rng, 2, 20);
        const v = randInt(rng, 10, 24);
        const ec = 0.5 * m * v * v;
        const H = Math.round(((v * v) / (2 * G)) * 100) / 100;
        const tBajada = Math.sqrt((2 * (H / SIN)) / (G * SIN));
        return {
          enunciado: `Un carro de ${m} kg pasa por el llano de la montaña rusa a ${v} m/s. ¿Cuál es su energía cinética?`,
          tipo: 'numerica',
          unidad: 'J',
          respuesta: ec,
          toleranciaAbs: 1,
          simParams: { altura: H, masa: m, mu: 0 },
          simDuracion: tBajada + 2.5,
          explica: {
            pregunta: 'Si la velocidad se duplicara, ¿qué pasaría con la energía cinética?',
            opciones: [
              'Se multiplicaría por 4, porque la Ec depende de v al cuadrado',
              'Se duplicaría, porque la Ec es proporcional a v',
              'No cambiaría, porque la Ec solo depende de la masa',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'energia-disipada',
      generar: (rng) => {
        const mu = pick(rng, [0.1, 0.2, 0.3]);
        const H = randInt(rng, 8, 20);
        return {
          enunciado: `Un carro baja desde ${H} m y cruza un llano con rozamiento (μ = ${fmt(mu, 2)}). Tras varias pasadas acaba parado: su energía mecánica ya no está. ¿Qué ha ocurrido con ella?`,
          tipo: 'opciones',
          opciones: [
            'Se ha transferido al entorno como calor por el rozamiento',
            'Ha desaparecido: la energía se gasta y deja de existir',
            'Se ha quedado almacenada como energía potencial en el carro',
          ],
          correcta: 0,
          simParams: { altura: H, masa: 10, mu },
          simDuracion: 25,
          explica: {
            pregunta: '¿Se cumple el principio de conservación de la energía?',
            opciones: [
              'Sí: la energía total (mecánica + térmica) se conserva, solo cambia de forma',
              'No: con rozamiento la energía total del universo disminuye',
              'Solo se cumple cuando no hay rozamiento',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
