// Simulación — Empuje de Arquímedes (4º ESO).
// Experimento del dinamómetro: una grúa-pórtico sumerge despacio un objeto
// cúbico colgado de un dinamómetro en un tanque de líquido. El dinamómetro
// marca el peso aparente m·g − E en tiempo real; si E ≥ m·g la cuerda se
// destensa y el objeto flota (aparente 0). Física cuasiestática 100% analítica
// (E = ρ·g·V_sum), determinista a paso fijo.
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges } from '@react-three/drei';
import Texto3D from '../components/Texto3D';
import useFixedStep from '../components/useFixedStep';
import useThrottledTick from '../components/useThrottledTick';
import VectorArrow from '../components/VectorArrow';
import { LIQUIDOS } from '../engine/constants';
import { fmt } from '../engine/integrator';
import { randInt, pick } from '../engine/rng';

const G = 9.8;
const VS = 8;              // 1 m real = 8 unidades de escena
const SURF_Y = 4;          // altura visual de la superficie del líquido
const PROF_LIQ = 0.5;      // profundidad real del líquido (m)
const ALTO_INICIO = 0.25;  // la base del objeto empieza 25 cm sobre la superficie
const PROF_EXTRA = 0.12;   // la grúa baja hasta dejar la cara superior 12 cm hundida
const V_BAJA = 0.1;        // velocidad de descenso de la grúa (m/s)
const BEAM_Y = 9.5;        // altura del pórtico-grúa
const DYN_Y = 8.55;        // centro del dinamómetro

const FONDOS = { agua: '#0a1c33', aceite: '#16200e', mercurio: '#151a23', gasolina: '#23190a' };
const LIQ_KEYS = ['agua', 'aceite', 'mercurio', 'gasolina'];

const aristaDe = (volumenL) => Math.cbrt(volumenL / 1000); // arista del cubo (m)

function reinit(world, params) {
  const Vm3 = params.volumen / 1000;
  const liq = LIQUIDOS[params.liquido];
  world.t = 0;
  world._acc = 0;
  world.data = {
    craneH: -ALTO_INICIO, // profundidad de la base impuesta por la grúa (m, + bajo superficie)
    h: -ALTO_INICIO,      // profundidad real de la base del objeto (m)
    vSum: 0,              // volumen sumergido (m³)
    P: params.masa * G,   // peso real (N)
    E: 0,                 // empuje (N)
    T: params.masa * G,   // tensión de la cuerda = peso aparente (N)
    flota: liq.rho * Vm3 > params.masa + 1e-9,
    done: false,
  };
}

function Scene({ world, params, playing, speed, resetToken, showVectors, quality, onTelemetry }) {
  const cubeRef = useRef(null);
  const cableRef = useRef(null);
  const cableMatRef = useRef(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  useThrottledTick(12);

  useEffect(() => { reinit(world, paramsRef.current); }, [world, resetToken]);
  useEffect(() => {
    if (!playing) reinit(world, paramsRef.current);
  }, [world, playing, params.masa, params.volumen, params.liquido]);

  useFixedStep(world, playing && !world.data?.done, speed, (dt) => {
    const d = world.data;
    const p = paramsRef.current;
    const Vm3 = p.volumen / 1000;
    const L = aristaDe(p.volumen);
    const liq = LIQUIDOS[p.liquido];
    const hObjetivo = L + PROF_EXTRA;
    d.craneH = Math.min(hObjetivo, d.craneH + V_BAJA * dt);
    // ¿puede flotar? masa de líquido desplazable a inmersión total (kg)
    const masaDesplazable = liq.rho * Vm3;
    d.flota = masaDesplazable > p.masa + 1e-9;
    // calado de equilibrio si flota: ρ·g·h_eq·L² = m·g → h_eq = m / (ρ·L²)
    const hEq = masaDesplazable >= p.masa ? p.masa / (liq.rho * L * L) : Infinity;
    // la cuerda solo tira hacia arriba: el objeto nunca baja de su calado de equilibrio
    d.h = Math.min(d.craneH, hEq);
    const calado = Math.max(0, Math.min(d.h, L));
    d.vSum = calado * L * L;
    d.P = p.masa * G;
    d.E = liq.rho * G * d.vSum;
    d.T = Math.max(0, d.P - d.E);
    if (d.craneH >= hObjetivo - 1e-9) d.done = true; // sumergido del todo o flotando estable
  });

  // objeto y cable imperativos a 60 fps + telemetría cada frame
  useFrame(() => {
    const d = world.data;
    if (!d) return;
    const p = paramsRef.current;
    const liq = LIQUIDOS[p.liquido];
    const Lv = aristaDe(p.volumen) * VS;
    const baseY = SURF_Y - d.h * VS;
    if (cubeRef.current) cubeRef.current.position.y = baseY + Lv / 2;
    const topY = baseY + Lv;
    const cableTop = DYN_Y - 0.5;
    const len = Math.max(0.06, cableTop - topY);
    if (cableRef.current) {
      cableRef.current.position.y = topY + len / 2;
      cableRef.current.scale.y = len;
    }
    const slack = d.flota && d.craneH > d.h + 1e-6;
    if (cableMatRef.current) {
      cableMatRef.current.color.set(slack ? '#64748b' : '#e2e8f0');
      cableMatRef.current.opacity = slack ? 0.4 : 1;
    }
    const pct = Math.min(100, (d.vSum / (p.volumen / 1000)) * 100);
    onTelemetry?.({
      t: world.t,
      done: d.done,
      readouts: [
        { label: 'Peso real', value: d.P, unit: 'N', decimals: 1 },
        { label: 'Empuje E', value: d.E, unit: 'N', decimals: 1 },
        { label: 'Peso aparente', value: d.T, unit: 'N', decimals: 1 },
        { label: 'Sumergido', value: pct, unit: '%', decimals: 0 },
      ],
      formulaViva: `E = ρ·g·V_sum = ${fmt(liq.rho, 0)} · 9,8 · ${fmt(d.vSum * 1000, 2)}·10⁻³ = ${fmt(d.E, 1)} N → aparente = ${fmt(d.T, 1)} N`,
      extra: { E: d.E, aparente: d.T, flota: d.flota, sumergidoPct: pct },
    });
  });

  const d = world.data || {
    craneH: -ALTO_INICIO, h: -ALTO_INICIO, vSum: 0,
    P: params.masa * G, E: 0, T: params.masa * G, flota: false, done: false,
  };
  const p = params;
  const liq = LIQUIDOS[p.liquido];
  const Lv = aristaDe(p.volumen) * VS;
  const baseY = SURF_Y - d.h * VS;
  const centroY = baseY + Lv / 2;
  const topY = baseY + Lv;
  const slack = d.flota && d.craneH > d.h + 1e-6;
  // el dinamómetro se pone verde cuando el empuje "borra" más del 30% del peso
  const colorLectura = slack || (d.P > 0 && d.E / d.P > 0.3) ? '#4ade80' : '#f1f5f9';
  const escala = (F) => Math.min(2, 0.25 + F * 0.011); // N → longitud visual de flecha
  const cableLen = Math.max(0.06, DYN_Y - 0.5 - topY);

  return (
    <group>
      {/* suelo del laboratorio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.21, 0]} receiveShadow>
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial color="#1c2840" roughness={0.95} />
      </mesh>
      <gridHelper args={[26, 13, '#475569', '#27324a']} position={[0, -0.2, 0]} />

      {/* peana del tanque */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.2, 4.2]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* líquido translúcido del color del líquido elegido */}
      <mesh position={[0, SURF_Y - (PROF_LIQ * VS) / 2, 0]}>
        <boxGeometry args={[3.4, PROF_LIQ * VS, 3.4]} />
        <meshStandardMaterial
          color={liq.color}
          transparent
          opacity={p.liquido === 'mercurio' ? 0.85 : 0.45}
          metalness={p.liquido === 'mercurio' ? 0.7 : 0.05}
          roughness={0.25}
          depthWrite={false}
        />
      </mesh>
      {/* lámina de la superficie */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SURF_Y + 0.01, 0]}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshBasicMaterial color={liq.color} transparent opacity={0.55} side={2} />
      </mesh>
      {/* tanque de cristal */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3.7, 5, 3.7]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.07} depthWrite={false} />
        <Edges color="#7dd3fc" />
      </mesh>
      <Billboard position={[0, 0.55, 2.4]}>
        <Texto3D fontSize={0.3} color="#94a3b8" anchorX="center">
          {liq.label.replace(/^\S+\s/, '')} · ρ = {fmt(liq.rho, 0)} kg/m³
        </Texto3D>
      </Billboard>

      {/* pórtico-grúa */}
      {[-3.1, 3.1].map((x) => (
        <mesh key={x} position={[x, BEAM_Y / 2 - 0.1, 0]} castShadow={quality.shadows}>
          <boxGeometry args={[0.24, BEAM_Y + 0.2, 0.24]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, BEAM_Y, 0]} castShadow={quality.shadows}>
        <boxGeometry args={[6.5, 0.28, 0.28]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, BEAM_Y - 0.3, 0]}>
        <boxGeometry args={[0.7, 0.34, 0.5]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>

      {/* dinamómetro (la estrella): cuerpo + lectura GRANDE del peso aparente */}
      <mesh position={[0, DYN_Y, 0]} castShadow={quality.shadows}>
        <cylinderGeometry args={[0.22, 0.22, 1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.45} />
      </mesh>
      <Billboard position={[0.55, DYN_Y + 0.05, 0]}>
        <Texto3D fontSize={0.68} color={colorLectura} outlineWidth={0.026} outlineColor="#0f172a" anchorX="left">
          {fmt(d.T, 1)} N
        </Texto3D>
      </Billboard>
      <Billboard position={[0.55, DYN_Y - 0.55, 0]}>
        <Texto3D fontSize={0.24} color="#94a3b8" anchorX="left">peso aparente</Texto3D>
      </Billboard>

      {/* cable de la grúa (longitud y color actualizados en useFrame) */}
      <mesh ref={cableRef} position={[0, topY + cableLen / 2, 0]} scale={[1, cableLen, 1]}>
        <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
        <meshStandardMaterial ref={cableMatRef} color="#e2e8f0" transparent metalness={0.5} roughness={0.4} />
      </mesh>

      {/* objeto cúbico con su gancho */}
      <group ref={cubeRef} position={[0, centroY, 0]}>
        <mesh castShadow={quality.shadows}>
          <boxGeometry args={[Lv, Lv, Lv]} />
          <meshStandardMaterial color="#d97706" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, Lv / 2 + 0.09, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
      {slack && (
        <Billboard position={[0, topY + 0.8, 0]}>
          <Texto3D fontSize={0.34} color="#4ade80" outlineWidth={0.02} outlineColor="#0f172a" anchorX="center">
            ¡Flota! · cuerda destensada
          </Texto3D>
        </Billboard>
      )}

      {/* vectores: P abajo (rojo), E arriba (azul), T cuerda (ámbar) */}
      {showVectors && (
        <group>
          <VectorArrow
            origin={[-Lv / 2 - 0.45, centroY, 0]}
            dir={[0, -1, 0]}
            length={escala(d.P)}
            color="#f87171"
            label={`P = ${fmt(d.P, 1)} N`}
          />
          {d.E > 0.5 && (
            <VectorArrow
              origin={[Lv / 2 + 0.45, centroY, 0]}
              dir={[0, 1, 0]}
              length={escala(d.E)}
              color="#60a5fa"
              label={`E = ${fmt(d.E, 1)} N`}
            />
          )}
          {d.T > 0.5 && (
            <VectorArrow
              origin={[0, topY + 0.2, Lv / 2 + 0.45]}
              dir={[0, 1, 0]}
              length={escala(d.T)}
              color="#fbbf24"
              label={`T = ${fmt(d.T, 1)} N`}
              thickness={0.04}
            />
          )}
        </group>
      )}
    </group>
  );
}

const simDef = {
  id: 'arquimedes',
  nombre: 'Empuje de Arquímedes',
  icono: '👑',
  descripcion: 'El experimento del dinamómetro: sumerge objetos en distintos líquidos y mide cuánto peso aparente pierden por el empuje.',
  curso: { level: 'eso', grade: 4 },
  usaTrayectoria: false,
  paramsDef: [
    { key: 'masa', label: 'Masa del objeto', min: 0.5, max: 20, step: 0.5, def: 5, unit: 'kg', decimals: 1 },
    { key: 'volumen', label: 'Volumen del objeto', min: 0.5, max: 15, step: 0.5, def: 3, unit: 'L', decimals: 1 },
    {
      key: 'liquido', label: 'Líquido (ρ en kg/m³)', type: 'select', def: 'agua',
      options: LIQ_KEYS.map((k) => ({ value: k, label: `${LIQUIDOS[k].label} ${fmt(LIQUIDOS[k].rho, 0)}` })),
    },
  ],
  graficas: null,
  formulas: [
    { titulo: 'Principio de Arquímedes', expr: 'E = ρ_líq·g·V_sum', leyenda: 'ρ en kg/m³ · V_sum en m³ (1 L = 0,001 m³)' },
    { titulo: 'Peso aparente', expr: 'P_ap = m·g − E', leyenda: 'lo que marca el dinamómetro; si E ≥ m·g, flota y marca 0' },
    { titulo: 'Condición de flotación', expr: 'flota si ρ_obj < ρ_líq', leyenda: 'ρ_obj = m / V' },
    { titulo: 'Volumen desalojado al flotar', expr: 'V_des = m / ρ_líq', leyenda: 'al flotar, el empuje iguala al peso' },
  ],
  fondo: (params) => FONDOS[params.liquido] || '#0a1c33',
  camara: { position: [9.5, 7.5, 13.5], fov: 45 },
  controles: { target: [0, 4.3, 0], maxDistance: 40 },
  Scene,
  retos: [
    {
      id: 'pierde-49',
      titulo: 'Pierde 49 N',
      descripcion: 'Termina la inmersión con un empuje de entre 47 y 51 N.',
      pista: 'E = ρ·g·V_sum. En agua, 5 L totalmente sumergidos dan 1000 · 9,8 · 0,005 = 49 N justos.',
      check: (tel) => tel.done && tel.extra?.E >= 47 && tel.extra.E <= 51,
    },
    {
      id: 'flotabilidad-neutra',
      titulo: 'Flotabilidad neutra',
      descripcion: 'Deja el peso aparente entre 0 y 2 N al final… sin que el objeto llegue a flotar.',
      pista: 'Necesitas que la densidad del objeto iguale (casi) la del líquido. En agua: masa en kg ≈ volumen en L, por ejemplo 5 kg y 5 L.',
      check: (tel) => tel.done && !tel.extra?.flota && tel.extra?.aparente <= 2,
    },
    {
      id: 'superempuje',
      titulo: 'Superempuje',
      descripcion: 'Consigue un empuje real de más de 180 N.',
      pista: 'En agua ni con 15 L llegas (147 N). Busca un líquido densísimo que aguante a flote una masa enorme: si flota, E = m·g.',
      check: (tel) => tel.done && tel.extra?.E > 180,
    },
    {
      id: 'corona-del-rey',
      titulo: 'La corona del rey',
      descripcion: 'La corona de Hierón: oro macizo de ≈ 19,3 kg en 1 L de volumen. Reprodúcela con tu balanza (19,5 kg y 1 L) y comprueba en agua que el peso aparente queda entre 177 y 182 N.',
      pista: 'P_ap = m·g − ρ·g·V. Con 1 L en agua el empuje es solo 9,8 N: 19,5 · 9,8 − 9,8 = 181,3 N.',
      check: (tel, p) => tel.done && p.liquido === 'agua'
        && tel.extra?.aparente >= 177 && tel.extra.aparente <= 182,
    },
  ],
  examTemplates: [
    {
      id: 'empuje-sumergido',
      generar: (rng) => {
        const V = randInt(rng, 2, 12);
        const liquido = pick(rng, ['agua', 'aceite', 'gasolina']);
        const liq = LIQUIDOS[liquido];
        const E = liq.rho * G * (V / 1000);
        const masa = Math.min(20, Math.ceil((liq.rho * V) / 1000) + 4); // se hunde seguro
        return {
          enunciado: `Sumergimos POR COMPLETO una pieza de ${V} L en ${liq.label.replace(/^\S+\s/, '')} (ρ = ${fmt(liq.rho, 0)} kg/m³). ¿Qué empuje recibe? (g = 9,8 m/s²; 1 L = 0,001 m³)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: E,
          toleranciaAbs: 0.5,
          simParams: { masa, volumen: V, liquido },
          simDuracion: 8,
          explica: {
            pregunta: 'Si la pieza pesara el doble pero tuviera el mismo volumen, ¿qué empuje recibiría?',
            opciones: [
              'El mismo: el empuje no depende de la masa del objeto',
              'El doble, porque pesa el doble',
              'La mitad, porque se hunde más deprisa',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'peso-aparente',
      generar: (rng) => {
        const V = randInt(rng, 1, 6);
        const liquido = pick(rng, ['agua', 'aceite']);
        const liq = LIQUIDOS[liquido];
        const masa = V + randInt(rng, 3, 12); // masa > ρ·V → se hunde y la respuesta es positiva
        const ap = masa * G - liq.rho * G * (V / 1000);
        return {
          enunciado: `Una pieza de ${masa} kg y ${V} L cuelga de un dinamómetro y se sumerge por completo en ${liq.label.replace(/^\S+\s/, '')} (ρ = ${fmt(liq.rho, 0)} kg/m³). ¿Qué marca el dinamómetro? (g = 9,8 m/s²)`,
          tipo: 'numerica',
          unidad: 'N',
          respuesta: ap,
          toleranciaAbs: 0.5,
          simParams: { masa, volumen: V, liquido },
          simDuracion: 8,
          explica: {
            pregunta: '¿Por qué el dinamómetro marca menos dentro del líquido que fuera?',
            opciones: [
              'Porque el empuje hacia arriba compensa parte del peso',
              'Porque la gravedad es menor bajo el líquido',
              'Porque el objeto pierde masa al mojarse',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'de-que-depende',
      generar: (rng) => {
        const V = randInt(rng, 2, 6);
        return {
          enunciado: `Dos piezas del MISMO volumen (${V} L), una de 2 kg y otra de 8 kg, se sumergen por completo en agua. ¿Cuál recibe más empuje?`,
          tipo: 'opciones',
          opciones: [
            'Las dos el mismo: el empuje depende del volumen sumergido y de la densidad del líquido',
            'La de 8 kg, porque pesa más',
            'La de 2 kg, porque tiene menos densidad',
          ],
          correcta: 0,
          simParams: { masa: 8, volumen: V, liquido: 'agua' },
          simDuracion: 8,
          explica: {
            pregunta: '¿Qué dice el principio de Arquímedes?',
            opciones: [
              'El empuje es igual al peso del líquido desalojado',
              'El empuje es igual al peso del objeto sumergido',
              'El empuje es igual a la masa del objeto por su volumen',
            ],
            correcta: 0,
          },
        };
      },
    },
    {
      id: 'volumen-desalojado',
      generar: (rng) => {
        const masa = randInt(rng, 2, 6);
        const liquido = pick(rng, ['agua', 'gasolina']);
        const liq = LIQUIDOS[liquido];
        const Vdes = masa / (liq.rho / 1000); // L
        const volumen = Math.min(15, Math.ceil(Vdes) + 2); // holgura para que flote
        return {
          enunciado: `Una boya de ${masa} kg FLOTA en ${liq.label.replace(/^\S+\s/, '')} (ρ = ${fmt(liq.rho, 0)} kg/m³). ¿Qué volumen de líquido desaloja? (resultado en litros)`,
          tipo: 'numerica',
          unidad: 'L',
          respuesta: Vdes,
          toleranciaAbs: 0.1,
          simParams: { masa, volumen, liquido },
          simDuracion: 8,
          explica: {
            pregunta: '¿Por qué al flotar el empuje es exactamente igual al peso?',
            opciones: [
              'Porque está en equilibrio: si E fuese mayor subiría y si fuese menor se hundiría',
              'Porque el líquido siempre empuja con la misma fuerza',
              'Porque la masa de la boya se reparte por el líquido',
            ],
            correcta: 0,
          },
        };
      },
    },
  ],
};

export default simDef;
