// Simulación — El barómetro de Torricelli (4º ESO).
// La atmósfera sostiene la columna del barómetro: h = p_atm / (ρ·g). La
// columna se anima con un lerp determinista a paso fijo hacia su altura de
// equilibrio. La regla lateral es ADAPTATIVA: la escala visual se recalcula
// (VS = 6 / h_max del líquido actual a nivel del mar) para que la columna
// máxima quepa siempre, tanto con mercurio (~0,76 m) como con agua (~10,3 m).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import { LIQUIDOS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { pick } from '../engine/rng';

const G = 9.8;
const P_MAR = 101300;       // Pa a nivel del mar: define la escala visual máxima
const SURF_Y = 0.8;         // altura visual de la superficie del líquido en la cubeta
const COL_MAX_VIS = 6;      // la columna máxima del líquido actual SIEMPRE mide 6 unidades
const TUBO_TOP = SURF_Y + COL_MAX_VIS * 1.1; // interior del tubo: 10% por encima de la columna máxima
const TUBO_BOT = 0.25;      // boca del tubo, sumergida en la cubeta
const COL_BOT = 0.3;        // base visual de la columna dentro del tubo

const LUGARES = {
  mar: { label: '🌊 Nivel del mar', p: 101300, pTxt: '101,3', enun: 'a nivel del mar' },
  'montaña': { label: '⛰️ Montaña 3.000 m', p: 70000, pTxt: '70', enun: 'en una montaña a 3.000 m' },
  everest: { label: '🏔️ Everest', p: 34000, pTxt: '34', enun: 'en la cima del Everest' },
};
const LIQ_KEYS = ['mercurio', 'agua', 'aceite'];
const NOMBRES = { mercurio: 'mercurio', agua: 'agua', aceite: 'aceite' };
const FONDOS = { mar: '#0d1f3c', 'montaña': '#10243d', everest: '#0b142e' };

const hMaxDe = (liquido) => P_MAR / (LIQUIDOS[liquido].rho * G);          // columna a nivel del mar (m)
const hEq = (lugar, liquido) => LUGARES[lugar].p / (LIQUIDOS[liquido].rho * G);
const escalaDe = (liquido) => COL_MAX_VIS / hMaxDe(liquido);              // unidades visuales por metro

// Paso "bonito" para las marcas de la regla adaptativa (≤ 12 marcas)
function pasoRegla(hMax) {
  for (const s of [0.05, 0.1, 0.2, 0.5, 1, 2]) {
    if (hMax / s <= 12) return s;
  }
  return 5;
}

function reinit(world) {
  world.t = 0;
  world._acc = 0;
  world.data = { h: 0, asentado: false };
}

function Scene({ world, params, playing, speed, resetToken, quality, onTelemetry }) {
  const colRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world);
  }, [world, playing, params.liquido, params.lugar]);

  // Lerp determinista hacia el equilibrio; sigue activo tras asentarse para
  // que cambiar el lugar/líquido EN VIVO re-anime la columna hacia el nuevo h.
  useFixedStep(world, playing, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const hObj = hEq(p.lugar, p.liquido);
    d.h += (hObj - d.h) * Math.min(1, 2.2 * dt);
    d.asentado = Math.abs(d.h - hObj) < 0.005 * hObj;
  });

  // columna (objeto en movimiento) imperativa + telemetría, cada frame
  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    const liq = LIQUIDOS[p.liquido];
    const lug = LUGARES[p.lugar];
    const VS = escalaDe(p.liquido);
    const hObj = hEq(p.lugar, p.liquido);
    const col = colRef.current;
    if (col) {
      const len = Math.max(0.04, SURF_Y + d.h * VS - COL_BOT);
      col.scale.y = len;
      col.position.y = COL_BOT + len / 2;
    }
    onTelemetry?.({
      t: world.t,
      done: d.asentado,
      readouts: [
        { label: 'Presión atmosférica', value: lug.p / 1000, unit: 'kPa', decimals: 1 },
        { label: 'Altura de columna h', value: d.h, unit: 'm', decimals: 3 },
        { label: 'h de equilibrio teórica', value: hObj, unit: 'm', decimals: 3 },
        { label: 'Densidad ρ del líquido', value: liq.rho, unit: 'kg/m³', decimals: 0 },
      ],
      formulaViva: `h = p_atm/(ρ·g) = ${fmt(lug.p, 0)} / (${fmt(liq.rho, 0)} · 9,8) = ${fmt(hObj, 3)} m`,
      extra: { h: d.h, asentado: d.asentado },
    });
  });

  const d = world.data || { h: 0, asentado: false };
  const p = params;
  const liq = LIQUIDOS[p.liquido];
  const lug = LUGARES[p.lugar];
  const VS = escalaDe(p.liquido);
  const hMax = hMaxDe(p.liquido);
  const hObj = hEq(p.lugar, p.liquido);
  const hVis = d.h * VS;
  const decH = hMax < 2 ? 3 : 2;
  const esMercurio = p.liquido === 'mercurio';

  // regla adaptativa: marcas "bonitas" según el líquido actual
  const marcas = useMemo(() => {
    const hm = hMaxDe(p.liquido);
    const paso = pasoRegla(hm);
    const out = [];
    for (let v = 0; v <= hm * 1.1 + 1e-9; v += paso) out.push(Math.round(v * 1000) / 1000);
    return { paso, out };
  }, [p.liquido]);
  const decMarcas = marcas.paso < 0.1 ? 2 : marcas.paso < 1 ? 1 : 0;

  return (
    <group>
      {/* suelo del laboratorio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 48]} />
        <meshStandardMaterial color="#16223c" roughness={0.95} />
      </mesh>
      <gridHelper args={[24, 12, '#475569', '#27324a']} position={[0, 0.01, 0]} />

      {/* cubeta */}
      <mesh position={[0, 0.5, 0]} castShadow={quality.shadows}>
        <cylinderGeometry args={[1.9, 1.9, 1, 32, 1, true]} />
        <meshStandardMaterial color="#334155" roughness={0.8} side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.9, 32]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      {/* líquido de la cubeta (superficie en SURF_Y) */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.78, 1.78, 0.7, 32]} />
        <meshStandardMaterial
          color={liq.color}
          roughness={0.25}
          metalness={esMercurio ? 0.8 : 0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* tubo de cristal cerrado por arriba */}
      <mesh position={[0, (TUBO_BOT + TUBO_TOP + 0.12) / 2, 0]}>
        <cylinderGeometry args={[0.34, 0.34, TUBO_TOP + 0.12 - TUBO_BOT, 24, 1, true]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.1} depthWrite={false} side={2} />
        <Edges color="#7dd3fc" />
      </mesh>
      <mesh position={[0, TUBO_TOP + 0.15, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.07, 24]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.45} />
      </mesh>

      {/* columna de líquido (la altura se anima por ref en useFrame) */}
      <mesh ref={colRef} position={[0, COL_BOT + 0.25, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 1, 20]} />
        <meshStandardMaterial
          color={liq.color}
          roughness={0.3}
          metalness={esMercurio ? 0.8 : 0.1}
        />
      </mesh>

      {/* vacío de Torricelli (entre la columna y el cierre del tubo) */}
      <Billboard position={[0, (SURF_Y + hVis + TUBO_TOP) / 2 + 0.05, 0]}>
        <Texto3D fontSize={0.24} color="#94a3b8" anchorX="center">vacío de Torricelli</Texto3D>
      </Billboard>

      {/* lectura de la altura, anclada al nivel de la columna */}
      <Billboard position={[-1.5, SURF_Y + hVis, 0]}>
        <Texto3D fontSize={0.34} color="#fbbf24" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          {`h = ${fmt(d.h, decH)} m`}
        </Texto3D>
      </Billboard>

      {/* línea del equilibrio teórico */}
      <mesh position={[0.2, SURF_Y + hObj * VS, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 2.6, 6]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
      </mesh>

      {/* regla adaptativa: poste + brazo de sujeción + marcas */}
      <mesh position={[1.15, 4, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[0.09, 7.2, 0.09]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.74, TUBO_TOP - 0.2, 0]}>
        <boxGeometry args={[0.82, 0.07, 0.07]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
      </mesh>
      {marcas.out.map((m) => (
        <group key={m} position={[1.15, SURF_Y + m * VS, 0]}>
          <mesh>
            <boxGeometry args={[0.42, 0.04, 0.14]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
          <Billboard position={[0.8, 0, 0]}>
            <Texto3D fontSize={0.26} color="#cbd5e1" anchorX="left">{`${fmt(m, decMarcas)} m`}</Texto3D>
          </Billboard>
        </group>
      ))}

      {/* rótulo del lugar */}
      <Billboard position={[0, TUBO_TOP + 1, 0]}>
        <Texto3D fontSize={0.4} color="#e2e8f0" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
          {`${lug.label} · ${lug.pTxt} kPa`}
        </Texto3D>
      </Billboard>
    </group>
  );
}

const simDef = {
  id: 'presion-atmosferica',
  nombre: 'El barómetro de Torricelli',
  icono: '🌡️',
  descripcion: 'La atmósfera sostiene la columna del barómetro: mide la presión con mercurio, agua o aceite en tres altitudes.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  usaVectores: false,
  paramsDef: [
    {
      key: 'liquido', label: 'Líquido del barómetro', type: 'select', def: 'mercurio',
      options: LIQ_KEYS.map((k) => ({ value: k, label: LIQUIDOS[k].label })),
    },
    {
      key: 'lugar', label: 'Lugar (p atmosférica)', type: 'select', def: 'mar',
      options: Object.entries(LUGARES).map(([value, l]) => ({ value, label: `${l.label} · ${l.pTxt} kPa` })),
    },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Altura de la columna', expr: 'h = p_atm / (ρ·g)', leyenda: 'p_atm en Pa · ρ: densidad (kg/m³) · g = 9,8 m/s²' },
    { titulo: 'Presión hidrostática', expr: 'p = ρ·g·h', leyenda: 'la presión de la columna en su base equilibra a la atmosférica' },
    { titulo: 'Equivalencia clásica', expr: '760 mm Hg ≈ 101,3 kPa = 1 atm', leyenda: 'el experimento de Torricelli (1643)' },
  ],
  fondo: (params) => FONDOS[params.lugar] || '#0d1f3c',
  camara: { position: [7.5, 5.2, 10.5], fov: 45 },
  controles: { target: [0.3, 3.7, 0], maxDistance: 32 },
  Scene,
  retos: [
    {
      id: 'clasico-760',
      titulo: 'Los 760 clásicos',
      descripcion: 'Reproduce el experimento original: mercurio a nivel del mar y columna asentada entre 0,75 y 0,77 m.',
      pista: 'h = 101.300 / (13.600 · 9,8) ≈ 0,76 m. Es el experimento de Torricelli de 1643.',
      check: (tel, p) => p.liquido === 'mercurio' && p.lugar === 'mar'
        && tel.extra?.asentado && tel.extra.h >= 0.75 && tel.extra.h <= 0.77,
    },
    {
      id: 'pajita-imposible',
      titulo: 'La pajita imposible',
      descripcion: 'Comprueba que la columna de agua a nivel del mar supera los 10 m (espera a que se asiente).',
      pista: 'h = 101.300 / (1.000 · 9,8) ≈ 10,3 m. Por eso ninguna bomba de succión saca agua de un pozo de más de ~10 m.',
      check: (tel, p) => p.liquido === 'agua' && p.lugar === 'mar'
        && tel.extra?.asentado && tel.extra.h > 10,
    },
    {
      id: 'everest',
      titulo: 'Everest',
      descripcion: 'Consigue una columna de mercurio asentada por debajo de 0,30 m.',
      pista: 'La columna baja si baja la presión: busca el lugar con menos aire encima. 34.000 / 133.280 ≈ 0,26 m.',
      check: (tel, p) => p.liquido === 'mercurio' && tel.extra?.asentado && tel.extra.h < 0.3,
    },
    {
      id: 'barometro-aceite',
      titulo: 'Barómetro de récord',
      descripcion: 'Consigue una columna asentada de más de 11 m.',
      pista: 'Cuanto menos denso es el líquido, más alta es la columna. El aceite (920 kg/m³) a nivel del mar pasa de 11 m.',
      check: (tel, p) => p.liquido === 'aceite' && tel.extra?.asentado && tel.extra.h > 11,
    },
  ],
  examTemplates: [
    {
      id: 'altura-columna',
      generar: (rng) => {
        const lugar = pick(rng, ['mar', 'montaña', 'everest']);
        const liquido = pick(rng, LIQ_KEYS);
        const lug = LUGARES[lugar];
        const liq = LIQUIDOS[liquido];
        const h = lug.p / (liq.rho * G);
        return {
          enunciado: `Montamos un barómetro de ${NOMBRES[liquido]} (ρ = ${fmt(liq.rho, 0)} kg/m³) ${lug.enun}, donde la presión atmosférica es de ${lug.pTxt} kPa. ¿Qué altura alcanza la columna? (g = 9,8 m/s²; 1 kPa = 1.000 Pa)`,
          tipo: 'numerica',
          unidad: 'm',
          respuesta: h,
          toleranciaAbs: 0.01,
          simParams: { liquido, lugar },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué la columna de mercurio es mucho más corta que la de agua?',
            opciones: [
              'Porque el mercurio es ~13,6 veces más denso: con menos altura ya equilibra la misma presión',
              'Porque el mercurio se evapora dentro del tubo y ocupa menos',
              'Porque el agua se pega al vidrio y trepa por el tubo',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'presion-desde-columna',
      generar: (rng) => {
        const lugar = pick(rng, ['mar', 'montaña', 'everest']);
        const h = Math.round(hEq(lugar, 'mercurio') * 1000) / 1000;
        const pkPa = (13600 * G * h) / 1000;
        return {
          enunciado: `El barómetro de mercurio (ρ = ${fmt(13600, 0)} kg/m³) de una estación meteorológica marca una columna de ${fmt(h, 3)} m. ¿Cuál es la presión atmosférica? Da el resultado en kPa (g = 9,8 m/s²).`,
          tipo: 'numerica',
          unidad: 'kPa',
          respuesta: pkPa,
          toleranciaAbs: 0.5,
          simParams: { liquido: 'mercurio', lugar },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué la columna se queda quieta justo a esa altura?',
            opciones: [
              'Porque la presión de la columna (ρ·g·h) iguala exactamente a la atmosférica',
              'Porque el mercurio se queda pegado a las paredes del vidrio',
              'Porque el vacío de la parte alta tira de ella hacia arriba',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'pajita',
      generar: (rng) => {
        const bebida = pick(rng, ['refresco', 'zumo', 'batido']);
        return {
          enunciado: `Bebes ${bebida} con una pajita. ¿Qué hace subir el líquido por la pajita hasta tu boca?`,
          tipo: 'opciones',
          opciones: [
            'La succión crea un vacío que «tira» del líquido hacia arriba',
            'La presión atmosférica sobre el líquido del vaso, que lo empuja pajita arriba',
            'La capilaridad del plástico de la pajita',
          ],
          correcta: 1,
          simParams: { liquido: 'agua', lugar: 'mar' },
          simDuracion: 6,
          explica: {
            pregunta: '¿Por qué es imposible beber agua con una pajita de 15 m a nivel del mar, por mucho que aspires?',
            opciones: [
              'Porque la atmósfera solo puede sostener unos 10,3 m de columna de agua',
              'Porque a nadie le llega el aliento, pero con una bomba de vacío sí se podría',
              'Porque el agua pesa más cuanto más larga es la pajita',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'altitud',
      generar: (rng) => {
        const lugar = pick(rng, ['montaña', 'everest']);
        const sitio = lugar === 'everest' ? 'la cima del Everest' : 'una montaña de 3.000 m';
        return {
          enunciado: `Subimos un barómetro de mercurio desde la playa hasta ${sitio}. El barómetro marca menos que a nivel del mar porque…`,
          tipo: 'opciones',
          opciones: [
            'el aire frío de la altura pesa más y aplasta el mercurio',
            'la gravedad disminuye tanto que el mercurio casi no pesa',
            'queda menos columna de aire por encima, así que la atmósfera empuja menos',
          ],
          correcta: 2,
          simParams: { liquido: 'mercurio', lugar },
          simDuracion: 6,
          explica: {
            pregunta: '¿Qué le pasa a la columna de mercurio durante la subida?',
            opciones: [
              'Baja poco a poco: menos presión atmosférica sostiene menos columna',
              'Sube, porque el aire de la montaña es más limpio',
              'No cambia: la altura solo depende del líquido del tubo',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
