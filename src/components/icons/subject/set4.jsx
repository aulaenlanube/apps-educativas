// Ilustraciones de las tarjetas de asignatura de Atención a la Diversidad
// (Audición y Lenguaje + Pedagogía Terapéutica). Rediseño 2026.
// Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: articulacion, vocabulario, morfosintaxis, pragmatica, conciencia-fonologica, comprension-oral, lectoescritura, atencion, memoria, funciones-ejecutivas, habilidades-sociales, razonamiento, autonomia, lectoescritura-adaptada
//
// Tono: cálido, amable e inclusivo. Formas redondeadas, objetos y personajes
// simpáticos y metáforas claras a 58 px. Los destellos usan tonos de color
// (no blanco puro) para que se vean sobre la tarjeta de cristal blanco.
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

const FONT = 'Fredoka, system-ui, sans-serif';
const f = (n) => Math.round(n * 100) / 100;

/* ---------- Geometría precalculada (una vez por módulo) ---------- */

// Estrella de n puntas
const starPath = (cx, cy, R, r = R * 0.46, n = 5) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))} `;
  }
  return `${d}Z`;
};

// Engranaje de n dientes (n par → caja simétrica, gira sin bambolearse)
const gearPath = (cx, cy, R, r, n) => {
  const s = (Math.PI * 2) / n;
  const pt = (rad, a) => `${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + i * s;
    d += `${i ? 'L' : 'M'}${pt(r, a - s * 0.3)} L${pt(R, a - s * 0.15)} L${pt(R, a + s * 0.15)} L${pt(r, a + s * 0.3)} `;
  }
  return `${d}Z`;
};

// Pieza de puzle cuadrada (lado s) con muesca a la izquierda y/o pestaña a la derecha
const piecePath = (x, y, s, { notch = false, tab = false } = {}) => {
  const r = 2.2;
  const k = 2.3;
  const h = k * 0.72;
  const my = y + s / 2;
  return [
    `M${f(x + r)} ${f(y)}`,
    `H${f(x + s - r)}`,
    `Q${f(x + s)} ${f(y)} ${f(x + s)} ${f(y + r)}`,
    tab ? `V${f(my - h)} A${k} ${k} 0 1 1 ${f(x + s)} ${f(my + h)}` : '',
    `V${f(y + s - r)}`,
    `Q${f(x + s)} ${f(y + s)} ${f(x + s - r)} ${f(y + s)}`,
    `H${f(x + r)}`,
    `Q${f(x)} ${f(y + s)} ${f(x)} ${f(y + s - r)}`,
    notch ? `V${f(my + h)} A${k} ${k} 0 1 0 ${f(x)} ${f(my - h)}` : '',
    `V${f(y + r)}`,
    `Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)}`,
    'Z',
  ].join(' ');
};

/* ---------- Piezas comunes ---------- */

// Defs comunes: aura del color de acento, sombra de contacto y brillo especular
const BaseDefs = ({ id, accent, shadow = '#1e1b4b', aura = 0.3 }) => (
  <>
    <GlowGradient id={id('aura')} color={accent} opacity={aura} mid={0.42} />
    <ShadowGradient id={id('shadow')} color={shadow} opacity={0.42} />
    <GlossGradient id={id('gloss')} opacity={0.78} />
  </>
);

// Aura detrás del objeto + sombra de contacto en el suelo
const Ground = ({ url, cx = 24, cy = 43, rx = 15, ry = 2.4 }) => (
  <>
    <circle cx="24" cy="24" r="22.5" fill={url('aura')} />
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={url('shadow')} />
  </>
);

/* =====================================================================
   AUDICIÓN Y LENGUAJE
   ===================================================================== */

/* Articulación — Boca abierta pronunciando, con ondas de sonido.
   Hover: la boca se infla, las ondas avanzan y aparece una tercera.
   Reposo: las ondas laten y titila un destello. */
const LIPS = 'M6.5 24.5 C8 18.5 12 14 16.5 14 C18.2 14 19.2 15.4 20 15.4 C20.8 15.4 21.8 14 23.5 14 C28 14 32 18.5 33.5 24.5 C32 31.5 26.8 36 20 36 C13.2 36 8 31.5 6.5 24.5 Z';
const MOUTH = 'M10.5 24.2 C12.5 20.8 16 19.6 20 19.8 C24 19.6 27.5 20.8 29.5 24.2 C27.8 28.8 24.4 31.2 20 31.2 C15.6 31.2 12.2 28.8 10.5 24.2 Z';

const Articulacion = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#F97316" shadow="#431407" />
        <MaterialGradient id={id('lips')} light="#FDBA74" base="#F97316" dark="#B4380B" />
        <MaterialGradient id={id('inside')} light="#9A3412" base="#6B1A0E" dark="#3B0B0A" />
        <MaterialGradient id={id('tongue')} light="#FDA4AF" base="#FB7185" dark="#BE123C" />
        <linearGradient id={id('teeth')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FBE3D3" />
        </linearGradient>
        <clipPath id={id('mouth')}><path d={MOUTH} /></clipPath>
      </defs>

      <Ground url={url} cx={21} cy={41.6} rx={14} />

      {/* labios */}
      <g className="art-h-pop" style={{ '--pop': '1.06' }}>
        <path d={LIPS} transform="translate(0.7 1.1)" fill="#7C2D12" opacity="0.55" />
        <path d={LIPS} fill={url('lips')} />
        <path d={MOUTH} fill={url('inside')} />
        <g clipPath={url('mouth')}>
          <ellipse cx="20" cy="30.6" rx="7.4" ry="3.8" fill={url('tongue')} />
          <path d="M20 28.3 V30.3" stroke="#9F1239" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
          <ellipse cx="17.3" cy="28.7" rx="2.1" ry="0.65" fill="#fff" opacity="0.5" />
          <path d="M9 18.5 H31 V22.6 C26 24 14 24 9 22.6 Z" fill={url('teeth')} />
          <path d="M16.6 21.6 V23.3 M20 21.9 V23.6 M23.4 21.6 V23.3" stroke="#E2BFA8" strokeWidth="0.45" />
        </g>
        <path d={MOUTH} stroke="#7C2D12" strokeOpacity="0.5" strokeWidth="0.6" />
        {/* luces: borde superior y brillos de los labios */}
        <path d="M8.3 21.8 C9.8 17.8 12.8 15.2 16.4 15" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="16" cy="33.3" rx="4.4" ry="1.1" fill={url('gloss')} transform="rotate(-6 16 33.3)" />
        <ellipse cx="25.6" cy="16.6" rx="2.2" ry="0.65" fill="#fff" opacity="0.55" transform="rotate(14 25.6 16.6)" />
      </g>

      {/* ondas de sonido */}
      <g className="art-h-slide" style={{ '--slide': '2.5px' }}>
        <g className="art-i-glow" style={{ '--lo': '0.55' }}>
          <path d="M36.4 19.6 Q39.6 25 36.4 30.4" stroke="#F97316" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M40.2 15.8 Q45.2 25 40.2 34.2" stroke="#FB923C" strokeWidth="2.1" strokeLinecap="round" />
        </g>
        <path className="art-h-show" d="M43.6 12.4 Q49.6 25 43.6 37.6" stroke="#FDBA74" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      <Sparkle x={6} y={9} r={2.6} fill="#FDBA74" idle delay={0.4} />
    </svg>
  );
};

/* Vocabulario — Tarjetas de vocabulario: pictograma (manzana) + palabra, y
   detrás una tarjeta con letra. Hover: abanico de tarjetas y destello.
   Reposo: dos destellos titilan. */
const APPLE = 'M29 17.4 C27.6 16.4 24.6 16.2 23.9 19.4 C23.2 22.8 25.2 26.2 27.2 26.4 C28 26.5 28.4 26 29 26 C29.6 26 30 26.5 30.8 26.4 C32.8 26.2 34.8 22.8 34.1 19.4 C33.4 16.2 30.4 16.4 29 17.4 Z';

const Vocabulario = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#EC4899" shadow="#500724" />
        <MaterialGradient id={id('back')} light="#C4B5FD" base="#8B5CF6" dark="#5B21B6" />
        <MaterialGradient id={id('card')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('apple')} light="#FDA4AF" base="#F43F5E" dark="#9F1239" />
        <MaterialGradient id={id('leaf')} light="#BBF7D0" base="#22C55E" dark="#15803D" />
        <linearGradient id={id('face')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FCE7F3" />
        </linearGradient>
      </defs>

      <Ground url={url} cx={23} cy={43} rx={16} />

      {/* tarjeta trasera con letra */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-9deg' }}>
        <g transform="rotate(-13 16 26)">
          <rect x="6.8" y="13" width="19" height="27" rx="4" fill="#3B0764" opacity="0.5" />
          <rect x="6" y="12" width="19" height="27" rx="4" fill={url('back')} />
          <path d="M7.3 35 V16.4 C7.3 14.6 8.5 13.3 10.4 13.3 H20" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
          <text x="12.4" y="24.6" fontFamily={FONT} fontWeight="700" fontSize="9" fill="#4C1D95" opacity="0.6">A</text>
          <text x="11.9" y="24" fontFamily={FONT} fontWeight="700" fontSize="9" fill="#fff">A</text>
        </g>
      </g>

      {/* tarjeta delantera: pictograma + palabra */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-h-tilt-r" style={{ '--tilt': '5deg' }}>
          <g transform="rotate(8 29 24)">
            <rect x="18.8" y="10.5" width="22" height="30" rx="4.4" fill="#831843" opacity="0.5" />
            <rect x="18" y="9.5" width="22" height="30" rx="4.4" fill={url('card')} />
            <path d="M19.2 34 V14 C19.2 11.9 20.4 10.7 22.4 10.7 H32" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
            <rect x="20.4" y="12" width="17.2" height="17.6" rx="3" fill={url('face')} />
            {/* manzana */}
            <ellipse cx="29" cy="27.3" rx="4.6" ry="0.9" fill="#9D174D" opacity="0.18" />
            <path d={APPLE} fill={url('apple')} />
            <path d="M29 17.6 C29 16.2 29.4 15.2 30.2 14.4" stroke="#78350F" strokeWidth="1" strokeLinecap="round" />
            <path d="M29.8 15.8 C31.2 14 33.4 14 34.4 14.8 C33.4 16.4 31.4 16.8 29.8 15.8 Z" fill={url('leaf')} />
            <ellipse cx="26.2" cy="19.8" rx="1.05" ry="1.9" fill="#fff" opacity="0.75" transform="rotate(18 26.2 19.8)" />
            {/* palabra */}
            <rect x="21.4" y="32.2" width="9.4" height="2.3" rx="1.15" fill="#fff" opacity="0.92" />
            <rect x="32.4" y="32.2" width="4.6" height="2.3" rx="1.15" fill="#fff" opacity="0.6" />
          </g>
        </g>
      </g>

      <Sparkle x={5} y={8} r={2.4} fill="#F9A8D4" idle delay={0} />
      <Sparkle x={44.5} y={40} r={1.8} fill="#C4B5FD" idle delay={1.6} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={43.5} y={7} r={2.8} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Morfosintaxis — Frase como piezas de puzle (quién · acción · qué, al estilo
   de los pictogramas). Hover: la última pieza encaja en su hueco y salta un
   destello. Reposo: la pieza suelta flota y titila un destello. */
const MS = 13.6;
const MY = 25;
const P1 = piecePath(3.6, MY, MS, { tab: true });
const P2 = piecePath(17.2, MY, MS, { notch: true, tab: true });
const P3 = piecePath(30.8, MY, MS, { notch: true });
const MS_STAR = starPath(38.9, 31.8, 3.6);

const Morfosintaxis = () => {
  const [id, url] = useArtIds();
  const piece = (d, fill, depth, rim) => (
    <>
      <path d={d} transform="translate(0.4 1.5)" fill={depth} />
      <path d={d} fill={fill} />
      <path d={d} stroke={depth} strokeOpacity="0.55" strokeWidth="0.5" />
      <path d={rim} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
    </>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#7C3AED" shadow="#2e1065" />
        <MaterialGradient id={id('p1')} light="#DDD6FE" base="#8B5CF6" dark="#5B21B6" />
        <MaterialGradient id={id('p2')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('p3')} light="#FDE68A" base="#F59E0B" dark="#B45309" />
      </defs>

      <Ground url={url} cx={24} cy={42.2} rx={20} ry={2.3} />

      {/* hueco donde encaja la pieza que falta */}
      <path className="art-h-hide" d={P3} stroke="#A78BFA" strokeWidth="0.8" strokeDasharray="1.6 1.3" />

      {/* pieza 2 (acción) y pieza 1 (quién): de derecha a izquierda para que cada pestaña quede encima */}
      {piece(P2, url('p2'), '#831843', `M19.6 ${MY + 0.8} H28.2`)}
      <path d="M22.4 31.8 H28.4 M26 29.2 L28.6 31.8 L26 34.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {piece(P1, url('p1'), '#4C1D95', `M6 ${MY + 0.8} H14.6`)}
      <circle cx="10.4" cy="29.5" r="1.85" fill="#fff" />
      <path d="M7.1 35.3 C7.1 32.1 13.7 32.1 13.7 35.3 Z" fill="#fff" />

      {/* pieza 3 (qué): flota inclinada y encaja al pasar el ratón */}
      <g className="art-h-drop" style={{ '--drop': '9px' }}>
        <g className="art-h-slide" style={{ '--slide': '-1.8px' }}>
          <g className="art-h-tilt" style={{ '--tilt': '-14deg' }}>
            <g transform="translate(1.8 -9) rotate(14 37.6 31.8)">
              <g className="art-i-bob" style={{ '--amp': '-1.4px' }}>
                {piece(P3, url('p3'), '#92400E', `M35.4 ${MY + 0.8} H41.8`)}
                <path d={MS_STAR} transform="translate(0.4 0.5)" fill="#92400E" opacity="0.45" />
                <path d={MS_STAR} fill="#fff" />
              </g>
            </g>
          </g>
        </g>
      </g>

      <Sparkle x={6} y={11} r={2.6} fill="#C4B5FD" idle delay={0.8} />
      <g className="art-h-burst" style={{ '--d': '.3s' }}><Sparkle x={30.8} y={21.6} r={3} fill="#FDE68A" /></g>
    </svg>
  );
};

/* Pragmática — Conversación: dos bocadillos (uno «escribiendo…», otro que
   responde con una sonrisa). Hover: el primero se inclina, el segundo se
   infla y salta un destello. Reposo: los puntos laten y titila un destello. */
const BUBBLE_A = 'M12 7 H22 A8 8 0 0 1 30 15 V17 A8 8 0 0 1 22 25 H15.6 L8.6 31 L10.4 24.6 A8 8 0 0 1 4 17 V15 A8 8 0 0 1 12 7 Z';
const BUBBLE_B = 'M26.5 19 H35.5 A8.5 8.5 0 0 1 44 27.5 A8.5 8.5 0 0 1 38.6 35.4 L41.8 41.2 L32 36 H26.5 A8.5 8.5 0 0 1 18 27.5 A8.5 8.5 0 0 1 26.5 19 Z';

const Pragmatica = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#06B6D4" shadow="#083344" />
        <MaterialGradient id={id('a')} light="#A5F3FC" base="#22D3EE" dark="#0E7490" />
        <MaterialGradient id={id('b')} light="#DDD6FE" base="#8B5CF6" dark="#5B21B6" />
      </defs>

      <Ground url={url} cx={25} cy={43.4} rx={16} />

      {/* bocadillo 1: escribiendo… */}
      <g className="art-h-tilt" style={{ '--tilt': '-6deg', transformOrigin: '20% 100%' }}>
        <path d={BUBBLE_A} transform="translate(0.6 1.2)" fill="#155E75" opacity="0.7" />
        <path d={BUBBLE_A} fill={url('a')} />
        <rect x="8.5" y="8.4" width="16" height="3.6" rx="1.8" fill={url('gloss')} />
        <path d="M5.4 16 C5.4 11.4 8.2 8.4 12.4 8.3" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
        <g className="art-i-glow" style={{ '--lo': '0.5', '--dur': '2.4s' }}>
          <circle cx="11.2" cy="16.4" r="1.9" fill="#fff" />
          <circle cx="17" cy="16.4" r="1.9" fill="#fff" />
          <circle cx="22.8" cy="16.4" r="1.9" fill="#fff" />
        </g>
      </g>

      {/* bocadillo 2: respuesta con sonrisa */}
      <g className="art-h-pop" style={{ '--pop': '1.08' }}>
        <path d={BUBBLE_B} transform="translate(0.6 1.2)" fill="#2E1065" opacity="0.6" />
        <path d={BUBBLE_B} fill={url('b')} />
        <rect x="22.5" y="20.3" width="14" height="3.4" rx="1.7" fill={url('gloss')} opacity="0.8" />
        <path d="M19.5 28 C19.4 23.6 22 20.5 26.4 20.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="28" cy="26.4" r="1.3" fill="#fff" />
        <circle cx="34" cy="26.4" r="1.3" fill="#fff" />
        <path d="M27.2 29.4 Q31 32.8 34.8 29.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      <Sparkle x={4.5} y={38} r={2.2} fill="#67E8F9" idle delay={1} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={41} y={11} r={2.8} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Conciencia fonológica — Tres cubos de letras (S·O·L) bajo una onda de voz.
   Hover: los cubos saltan como sílabas que suenan. Reposo: la onda late y
   titila un destello. */
const CUBE_S = 11;
const CUBE_D = 2.8;
const CUBES = [
  { x: 2.8, y: 26.5, l: 'S', k: 'c1', top: '#FDE68A', side: '#B45309', deep: '#92400E', jump: '-4px' },
  { x: 17.2, y: 26.5, l: 'O', k: 'c2', top: '#FBCFE8', side: '#9D174D', deep: '#831843', jump: '-6.5px' },
  { x: 31.6, y: 26.5, l: 'L', k: 'c3', top: '#DDD6FE', side: '#5B21B6', deep: '#4C1D95', jump: '-4px' },
];
const WAVE = [2.4, 4.6, 7.6, 5, 9.6, 12, 8.4, 10, 6, 3.8, 2.2];

const ConcienciaFonologica = () => {
  const [id, url] = useArtIds();
  const s = CUBE_S;
  const d = CUBE_D;
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#F59E0B" shadow="#451a03" />
        <MaterialGradient id={id('c1')} light="#FEF3C7" base="#F59E0B" dark="#B45309" />
        <MaterialGradient id={id('c2')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('c3')} light="#DDD6FE" base="#8B5CF6" dark="#5B21B6" />
        <linearGradient id={id('wave')} gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="40" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      <Ground url={url} cx={24} cy={40} rx={20} ry={2.2} />

      {/* onda de voz */}
      <g className="art-i-pulse" style={{ '--amp': '1.08', '--dur': '2.4s' }}>
        {WAVE.map((h, i) => (
          <line key={i} x1={9 + i * 3} y1={f(13 - h / 2)} x2={9 + i * 3} y2={f(13 + h / 2)} stroke={url('wave')} strokeWidth="1.8" strokeLinecap="round" />
        ))}
      </g>

      {/* cubos de letras */}
      {CUBES.map((c) => (
        <g key={c.k} className="art-h-jump" style={{ '--jump': c.jump }}>
          <path d={`M${c.x + s} ${c.y} L${f(c.x + s + d)} ${f(c.y - d)} L${f(c.x + s + d)} ${f(c.y + s - d)} L${c.x + s} ${c.y + s} Z`} fill={c.side} />
          <path d={`M${f(c.x + 0.6)} ${c.y} L${f(c.x + d + 0.6)} ${f(c.y - d)} L${f(c.x + s + d)} ${f(c.y - d)} L${c.x + s} ${c.y} Z`} fill={c.top} />
          <rect x={c.x} y={c.y} width={s} height={s} rx="1.3" fill={url(c.k)} />
          <rect x={f(c.x + 0.9)} y={f(c.y + 0.8)} width={s - 1.8} height="2.6" rx="1.2" fill={url('gloss')} opacity="0.7" />
          <rect x={f(c.x + 0.5)} y={f(c.y + 0.5)} width={s - 1} height={s - 1} rx="1" stroke="#fff" strokeOpacity="0.32" strokeWidth="0.5" />
          <text x={f(c.x + s / 2 + 0.45)} y={f(c.y + 8.75)} textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="8.6" fill={c.deep} opacity="0.65">{c.l}</text>
          <text x={f(c.x + s / 2)} y={f(c.y + 8.2)} textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="8.6" fill="#fff">{c.l}</text>
        </g>
      ))}

      <Sparkle x={44} y={6} r={2.4} fill="#FBBF24" idle delay={0.6} />
    </svg>
  );
};

/* Comprensión oral — Auriculares con ecualizador y check de «entendido».
   Hover: los auriculares se balancean al ritmo, el ecualizador crece y el
   check se infla. Reposo: el ecualizador late y titila un destello. */
const BAND = 'M9 27 C9 13.6 15.6 7.6 24 7.6 C32.4 7.6 39 13.6 39 27';
const EQ = [[19.2, 5], [21.6, 9], [24, 13], [26.4, 8.4], [28.8, 4.6]];

const ComprensionOral = () => {
  const [id, url] = useArtIds();
  const cup = (x, cushX, glossX) => (
    <>
      <rect x={x + 0.8} y="22.6" width="9" height="15.4" rx="4.5" fill="#134E4A" opacity="0.6" />
      <rect x={x} y="21.6" width="9" height="15.4" rx="4.5" fill={url('cup')} />
      <rect x={cushX} y="23.4" width="4.2" height="11.8" rx="2.1" fill={url('cush')} />
      <rect x={glossX} y="23.2" width="2.2" height="8.6" rx="1.1" fill="#fff" opacity="0.5" />
      <circle cx={x + 4.5} cy="31.6" r="1.6" fill="#fff" opacity="0.28" />
    </>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#14B8A6" shadow="#042f2e" />
        <MaterialGradient id={id('cup')} light="#99F6E4" base="#14B8A6" dark="#0F766E" />
        <MaterialGradient id={id('band')} light="#5EEAD4" base="#0D9488" dark="#115E59" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('cush')} light="#2DD4BF" base="#115E59" dark="#0B3B37" />
        <MaterialGradient id={id('ok')} light="#BBF7D0" base="#22C55E" dark="#15803D" />
        <linearGradient id={id('eq')} gradientUnits="userSpaceOnUse" x1="0" y1="23" x2="0" y2="36">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      <Ground url={url} cx={24} cy={42} rx={18} ry={2.2} />

      {/* ecualizador: lo que se escucha */}
      <g className="art-h-pop" style={{ '--pop': '1.2' }}>
        <g className="art-i-pulse" style={{ '--amp': '1.1', '--dur': '1.8s' }}>
          {EQ.map(([x, h]) => (
            <line key={x} x1={x} y1={f(29.6 - h / 2)} x2={x} y2={f(29.6 + h / 2)} stroke={url('eq')} strokeWidth="1.7" strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* auriculares */}
      <g className="art-h-wiggle art-o-bottom">
        <path d={BAND} stroke="#0F4F4A" strokeWidth="4.6" strokeLinecap="round" />
        <path d={BAND} stroke={url('band')} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M11 20.4 C12.4 13.6 17.4 10 24 9.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
        {cup(4.4, 11.6, 5.7)}
        {cup(34.6, 32.2, 35.9)}
      </g>

      {/* check de comprensión */}
      <g className="art-h-pop" style={{ '--pop': '1.22' }}>
        <circle cx="41.1" cy="9.8" r="5" fill="#14532D" opacity="0.5" />
        <circle cx="40.6" cy="9" r="5" fill={url('ok')} />
        <ellipse cx="39.2" cy="6.9" rx="2.5" ry="1.1" fill="#fff" opacity="0.5" />
        <path d="M38.2 9.2 L40 11 L43.2 7.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <Sparkle x={5} y={10} r={2.2} fill="#5EEAD4" idle delay={1.2} />
    </svg>
  );
};

/* Lectoescritura — Libreta de espiral con letra y trazo, y lápiz escribiendo.
   Hover: el lápiz garabatea, la letra se infla y salta un destello.
   Reposo: dos destellos titilan. */
const RINGS = [9.4, 13.2, 17, 20.8, 24.6, 28.4];

const Lectoescritura = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#E11D48" shadow="#4c0519" />
        <MaterialGradient id={id('cover')} light="#FDA4AF" base="#F43F5E" dark="#9F1239" />
        <MaterialGradient id={id('pencil')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('metal')} light="#F8FAFC" base="#CBD5E1" dark="#64748B" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('eraser')} light="#FBCFE8" base="#F472B6" dark="#BE185D" x1={0} y1={0} x2={0} y2={1} />
        <linearGradient id={id('paper')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFE4E6" />
        </linearGradient>
        <linearGradient id={id('wood')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDECD2" />
          <stop offset="100%" stopColor="#E3AE7A" />
        </linearGradient>
      </defs>

      <Ground url={url} cx={23} cy={43} rx={16} />

      {/* libreta */}
      <g transform="rotate(-7 19 25)">
        <rect x="7.6" y="11" width="24" height="30" rx="3" fill="#9F1239" opacity="0.5" />
        <rect x="6.8" y="10" width="24" height="30" rx="3" fill={url('paper')} />
        <path d="M6.8 13 C6.8 11.3 8.1 10 9.8 10 H27.8 C29.5 10 30.8 11.3 30.8 13 V15.6 H6.8 Z" fill={url('cover')} />
        <rect x="8.6" y="10.9" width="20" height="1.4" rx="0.7" fill="#fff" opacity="0.35" />
        {[22, 27.5, 33, 38].map((y) => (
          <line key={y} x1="9" y1={y} x2="28.8" y2={y} stroke="#FDA4AF" strokeWidth="0.6" />
        ))}
        <line x1="11.4" y1="16.2" x2="11.4" y2="39.6" stroke="#FB7185" strokeOpacity="0.6" strokeWidth="0.5" />
        <path d="M7.6 17 V37.6" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" strokeLinecap="round" />
        {/* anillas de la espiral */}
        {RINGS.map((x) => (
          <g key={x}>
            <circle cx={x} cy="13.4" r="0.75" fill="#881337" />
            <rect x={x - 0.75} y="7.6" width="1.5" height="5.6" rx="0.75" fill={url('metal')} />
          </g>
        ))}
        {/* letra y trazos escritos */}
        <text className="art-h-pop" style={{ '--pop': '1.2' }} x="13.2" y="21.6" fontFamily={FONT} fontWeight="700" fontSize="7.6" fill="#E11D48">A</text>
        <path d="M13 26.9 C14.2 24.4 15.6 24.4 15.8 26.4 C16 28.2 17.6 24.8 18.8 25 C20 25.2 19.6 27.4 21 27.2 C22.2 27 22.8 25.2 23.8 25.4 C24.8 25.6 24.6 27.2 26 26.8" stroke="#BE123C" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 32.4 C14.2 29.9 15.6 29.9 15.8 31.9 C16 33.7 17.6 30.3 18.8 30.5 C20 30.7 19.8 32.6 21.2 32.5 C21.8 32.4 22.2 31.9 22.5 31.6" stroke="#BE123C" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* lápiz (punta en el trazo) */}
      <g className="art-h-wiggle" style={{ transformOrigin: '0% 100%' }}>
        <g transform="translate(23.4 32.1) rotate(-50)">
          <path d="M0.6 1.6 L5.4 4.2 L20 4.2 L20 3.3 Z" fill="#7C2D12" opacity="0.18" />
          <path d="M0 0 L5.4 -2.7 L5.4 2.7 Z" fill={url('wood')} />
          <path d="M0 0 L1.9 -0.95 L1.9 0.95 Z" fill="#334155" />
          <rect x="5.4" y="-2.7" width="14.6" height="5.4" fill={url('pencil')} />
          <rect x="5.4" y="-2.2" width="14.6" height="1" fill="#fff" opacity="0.45" />
          <rect x="5.4" y="0.9" width="14.6" height="0.5" fill="#92400E" opacity="0.3" />
          <rect x="20" y="-2.8" width="2.8" height="5.6" fill={url('metal')} />
          <path d="M20.9 -2.8 V2.8 M21.9 -2.8 V2.8" stroke="#64748B" strokeWidth="0.45" />
          <path d="M22.8 -2.7 H25.2 C26.4 -2.7 26.9 -1.6 26.9 0 C26.9 1.6 26.4 2.7 25.2 2.7 H22.8 Z" fill={url('eraser')} />
        </g>
      </g>

      <Sparkle x={5} y={7} r={2.4} fill="#FDA4AF" idle delay={0.2} />
      <Sparkle x={44} y={22} r={1.8} fill="#FBBF24" idle delay={1.5} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={38.6} y={38.4} r={2.6} fill="#FBBF24" /></g>
    </svg>
  );
};

/* =====================================================================
   PEDAGOGÍA TERAPÉUTICA
   ===================================================================== */

/* Atención — Diana con dardo en el centro.
   Hover: el dardo vibra al clavarse, aparecen los corchetes de enfoque que se
   cierran sobre la diana y salta un destello. Reposo: anillo de foco que late
   y un destello. */
const Atencion = () => {
  const [id, url] = useArtIds();
  const C = [22.5, 25.5];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#EF4444" shadow="#450a0a" />
        <MaterialGradient id={id('red')} light="#FCA5A5" base="#EF4444" dark="#991B1B" />
        <MaterialGradient id={id('rim')} light="#B91C1C" base="#7F1D1D" dark="#450A0A" />
        <MaterialGradient id={id('white')} light="#FFFFFF" base="#FFF1F2" dark="#FECACA" />
        <MaterialGradient id={id('barrel')} light="#C7D2FE" base="#6366F1" dark="#312E81" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('steel')} light="#F8FAFC" base="#CBD5E1" dark="#64748B" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('flight')} light="#FDE68A" base="#FBBF24" dark="#D97706" />
      </defs>

      <Ground url={url} cx={23.5} cy={43.6} rx={14} />

      {/* anillo de foco */}
      <circle className="art-i-pulse" style={{ '--amp': '1.07' }} cx={C[0]} cy={C[1]} r="17.8" stroke="#F87171" strokeOpacity="0.55" strokeWidth="0.9" />

      {/* diana */}
      <circle cx="23.7" cy="27" r="15.2" fill={url('rim')} />
      <circle cx={C[0]} cy={C[1]} r="15.2" fill={url('red')} />
      <circle cx={C[0]} cy={C[1]} r="11.6" fill={url('white')} />
      <circle cx={C[0]} cy={C[1]} r="8" fill={url('red')} />
      <circle cx={C[0]} cy={C[1]} r="4.5" fill={url('white')} />
      <circle cx={C[0]} cy={C[1]} r="2" fill={url('red')} />
      <path d="M9.91 20.92 A13.4 13.4 0 0 1 17.92 12.91" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.8 23.4 A9.8 9.8 0 0 1 16.6 17.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx={C[0]} cy={C[1]} r="1.1" fill="#450A0A" />

      {/* dardo clavado */}
      <g className="art-h-wiggle" style={{ transformOrigin: '0% 100%' }}>
        <g transform={`translate(${C[0]} ${C[1]}) rotate(-38)`}>
          <path d="M13 0 L19.4 -4 L20.4 -3.6 L17.6 0 Z" fill={url('flight')} />
          <rect x="9.8" y="-0.6" width="7.4" height="1.2" rx="0.6" fill="#475569" />
          <path d="M13 0 L19.4 4 L20.4 3.6 L17.6 0 Z" fill="#B45309" />
          <path d="M0 0 L3.4 -0.55 L3.4 0.55 Z" fill={url('steel')} />
          <rect x="3.4" y="-1.5" width="6.4" height="3" rx="1.2" fill={url('barrel')} />
          <rect x="3.8" y="-1.2" width="5.6" height="0.7" rx="0.35" fill="#fff" opacity="0.55" />
          <path d="M5.2 -1.4 V1.4 M6.4 -1.4 V1.4 M7.6 -1.4 V1.4" stroke="#312E81" strokeOpacity="0.55" strokeWidth="0.45" />
        </g>
      </g>

      {/* corchetes de enfoque (aparecen y se cierran) */}
      <g className="art-h-show">
        <g className="art-h-shrink" style={{ '--shrink': '.88' }}>
          <path d="M2.5 10.5 V8.3 Q2.5 5.5 5.3 5.5 H7.5 M37.5 5.5 H39.7 Q42.5 5.5 42.5 8.3 V10.5 M42.5 40.5 V42.7 Q42.5 45.5 39.7 45.5 H37.5 M7.5 45.5 H5.3 Q2.5 45.5 2.5 42.7 V40.5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      <Sparkle x={42} y={36} r={2.2} fill="#FCA5A5" idle delay={0.9} />
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={9} y={10} r={2.6} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Memoria — Cerebro simpático con dos cartas del juego de parejas.
   Hover: las cartas se abren en abanico y el cerebro se infla.
   Reposo: dos destellos titilan. */
const BRAIN = 'M10 26 C7 24 7 18 11 16 C11 11 16 8 20 9.5 C22.5 6.5 28 6.5 30.5 9.5 C35 8.5 39.5 12 39 16.5 C42.5 18.5 42.5 24 39.5 26.5 C40 30.5 36.5 33.5 32.5 32.5 C30.5 35 26.5 35 24.5 33 C21.5 35.5 16.5 35 15 32 C11 32.5 8.5 29.5 10 26 Z';
const MEM_STAR = starPath(13.5, 35.3, 3.5);

const Memoria = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#7C3AED" shadow="#2e1065" />
        <MaterialGradient id={id('brain')} light="#F5D0FE" base="#C084FC" dark="#7E22CE" />
        <MaterialGradient id={id('ca')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('cb')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
      </defs>

      <Ground url={url} cx={24.5} cy={43.4} rx={16} />

      {/* cerebro */}
      <g className="art-h-pop" style={{ '--pop': '1.05' }}>
        <path d={BRAIN} transform="translate(0.8 1.2)" fill="#581C87" opacity="0.6" />
        <path d={BRAIN} fill={url('brain')} />
        <g stroke="#6B21A8" strokeOpacity="0.5" strokeWidth="0.95" strokeLinecap="round">
          <path d="M24.6 8.6 C23.4 12.6 25.8 15.8 24.4 19.8 C23.2 23.8 25.6 27.4 24.6 33" />
          <path d="M11.6 18.6 C14.2 16.8 16.4 19.2 19.4 17.6" />
          <path d="M10.4 24.6 C13 23 15.6 25.4 19 23.8" />
          <path d="M14 13.6 C15.8 12.4 17.6 13.6 19 12.4" />
          <path d="M37.6 18.6 C35 16.8 32.8 19.2 29.8 17.6" />
          <path d="M38.8 24.6 C36.2 23 33.6 25.4 30.2 23.8" />
          <path d="M35.2 13.6 C33.4 12.4 31.6 13.6 30.2 12.4" />
        </g>
        <path d="M9.2 22 C8.2 19.4 9.2 16.8 11.4 16 M12.8 12.2 C14.2 10.2 16.6 9.2 19.4 9.9" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="29.6" cy="10.6" rx="3.4" ry="1.3" fill={url('gloss')} transform="rotate(14 29.6 10.6)" />
      </g>

      {/* carta con estrella */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-11deg' }}>
        <g transform="rotate(-12 13.5 35.5)">
          <rect x="8.6" y="29.2" width="11" height="13.6" rx="2.4" fill="#78350F" opacity="0.55" />
          <rect x="8" y="28.4" width="11" height="13.6" rx="2.4" fill={url('ca')} />
          <rect x="9.2" y="29.6" width="8.6" height="11.2" rx="1.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" />
          <path d={MEM_STAR} transform="translate(0.35 0.45)" fill="#92400E" opacity="0.4" />
          <path d={MEM_STAR} fill="#fff" />
        </g>
      </g>

      {/* carta boca abajo */}
      <g className="art-h-tilt-r art-o-bottom" style={{ '--tilt': '11deg' }}>
        <g transform="rotate(12 34.5 35.5)">
          <rect x="29.6" y="29.2" width="11" height="13.6" rx="2.4" fill="#1E1B4B" opacity="0.55" />
          <rect x="29" y="28.4" width="11" height="13.6" rx="2.4" fill={url('cb')} />
          <rect x="30.2" y="29.6" width="8.6" height="11.2" rx="1.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" />
          <text x="34.5" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="9" fill="#fff">?</text>
        </g>
      </g>

      <Sparkle x={5} y={8} r={2.4} fill="#C4B5FD" idle delay={0} />
      <Sparkle x={43.5} y={7} r={2} fill="#FBBF24" idle delay={1.4} />
    </svg>
  );
};

/* Funciones ejecutivas — Cabeza de perfil con engranajes que piensan.
   Hover: los engranajes giran en sentidos opuestos y salta un destello.
   Reposo: el ojo parpadea y titila un destello. */
const HEAD = 'M15 39.6 V35.6 C10 32.6 7.4 27.6 7.6 21.4 C7.9 12.6 14.8 6.4 23.6 6.4 C32.2 6.4 38.6 12.2 38.6 19.6 C38.6 20.9 38.8 21.9 39.4 22.9 L41.8 27 C42.3 27.9 41.8 28.8 40.8 28.8 H38.8 V32.4 C38.8 34.4 37.2 35.8 35.2 35.8 H31.4 V39.6 Q31.4 41 30 41 H16.4 Q15 41 15 39.6 Z';
const GEAR_BIG = gearPath(20.4, 20, 7.6, 5.8, 10);
const GEAR_SMALL = gearPath(29.8, 14.2, 5, 3.6, 6);

const FuncionesEjecutivas = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#2563EB" shadow="#172554" />
        <MaterialGradient id={id('head')} light="#BFDBFE" base="#3B82F6" dark="#1E40AF" />
        <MaterialGradient id={id('g1')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('g2')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
        <GlowGradient id={id('gshade')} color="#172554" opacity={0.45} mid={0.6} />
      </defs>

      <Ground url={url} cx={23} cy={43} rx={13} />

      {/* cabeza */}
      <path d={HEAD} transform="translate(0.8 1)" fill="#1E3A8A" opacity="0.6" />
      <path d={HEAD} fill={url('head')} />
      <path d="M9.4 25 C8.6 18 12.6 10.8 20 8.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="33.4" cy="10.4" rx="2.6" ry="1" fill={url('gloss')} transform="rotate(32 33.4 10.4)" />
      <g className="art-i-blink" style={{ '--dur': '4.6s' }}>
        <ellipse cx="35.3" cy="22.4" rx="0.95" ry="1.25" fill="#172554" />
      </g>
      <path d="M36.6 31 Q37.9 31.8 38.8 31" stroke="#1E3A8A" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />

      {/* sombras suaves bajo los engranajes */}
      <circle cx="21" cy="20.9" r="8.6" fill={url('gshade')} />
      <circle cx="30.3" cy="15" r="5.8" fill={url('gshade')} />

      {/* engranaje grande */}
      <g className="art-h-spin" style={{ '--spin': '72deg' }}>
        <path d={GEAR_BIG} fill={url('g1')} stroke="#92400E" strokeOpacity="0.45" strokeWidth="0.5" strokeLinejoin="round" />
        <circle cx="20.4" cy="20" r="2.6" fill="#B45309" />
        <circle cx="20.4" cy="20" r="1.1" fill="#FEF3C7" />
        <path d="M15.6 17.4 A5.4 5.4 0 0 1 18.6 15" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      {/* engranaje pequeño (gira al revés) */}
      <g className="art-h-spin" style={{ '--spin': '-120deg' }}>
        <path d={GEAR_SMALL} fill={url('g2')} stroke="#155E75" strokeOpacity="0.45" strokeWidth="0.45" strokeLinejoin="round" />
        <circle cx="29.8" cy="14.2" r="1.6" fill="#0E7490" />
        <circle cx="29.8" cy="14.2" r="0.7" fill="#CFFAFE" />
      </g>

      <Sparkle x={5} y={7.5} r={2.4} fill="#93C5FD" idle delay={0.5} />
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={41} y={8} r={2.8} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Habilidades sociales — Dos amigos sonrientes y un corazón.
   Hover: se inclinan el uno hacia el otro y el corazón salta.
   Reposo: el corazón late y titila un destello. */
const HEART = 'M24 14.4 C18.2 11 17.6 6.6 20 4.9 C21.9 3.6 23.5 4.6 24 6.2 C24.5 4.6 26.1 3.6 28 4.9 C30.4 6.6 29.8 11 24 14.4 Z';

const Kid = ({ url, cx, skin, hair, shirt, curly }) => (
  <>
    {/* cuerpo */}
    <path d={`M${cx - 11} 41 C${cx - 11} 33.4 ${cx - 6.4} 29.4 ${cx} 29.4 C${cx + 6.4} 29.4 ${cx + 11} 33.4 ${cx + 11} 41 Z`} fill={url(shirt)} />
    <path d={`M${cx - 9.4} 38.6 C${cx - 9} 34.2 ${cx - 6.2} 31.4 ${cx - 2.6} 30.8`} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
    <path d={`M${cx - 3.2} 29.8 L${cx} 33 L${cx + 3.2} 29.8`} stroke="#fff" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    {/* cabeza */}
    <ellipse cx={cx} cy="29.2" rx="4.6" ry="1.2" fill="#1e1b4b" opacity="0.22" />
    <circle cx={cx} cy="20.5" r="7.6" fill={url(skin)} />
    {curly ? (
      <path d={`M${cx - 7.6} 20.4 C${cx - 8.6} 17.6 ${cx - 7.4} 14.4 ${cx - 5.4} 13.8 C${cx - 5} 11.6 ${cx - 2.2} 10.6 ${cx} 11.8 C${cx + 2.2} 10.6 ${cx + 5} 11.6 ${cx + 5.4} 13.8 C${cx + 7.4} 14.4 ${cx + 8.6} 17.6 ${cx + 7.6} 20.4 C${cx + 6.6} 17.6 ${cx + 4} 16.4 ${cx} 16.6 C${cx - 4} 16.4 ${cx - 6.6} 17.6 ${cx - 7.6} 20.4 Z`} fill={url(hair)} />
    ) : (
      <path d={`M${cx - 7.6} 20.2 C${cx - 8} 14.6 ${cx - 4.4} 12.2 ${cx} 12.2 C${cx + 4.6} 12.2 ${cx + 8} 14.8 ${cx + 7.6} 20.2 C${cx + 6} 17.2 ${cx + 3.4} 16.2 ${cx + 0.6} 16.8 C${cx - 1.8} 17.4 ${cx - 4.8} 17 ${cx - 7.6} 20.2 Z`} fill={url(hair)} />
    )}
    <ellipse cx={cx - 3} cy="13.9" rx="2.4" ry="0.8" fill="#fff" opacity="0.35" transform={`rotate(-18 ${cx - 3} 13.9)`} />
    {/* cara */}
    <circle cx={cx - 2.5} cy="21.2" r="0.95" fill="#2A1A10" />
    <circle cx={cx + 2.5} cy="21.2" r="0.95" fill="#2A1A10" />
    <circle cx={cx - 4.4} cy="23.7" r="1.3" fill="#FB7185" opacity="0.45" />
    <circle cx={cx + 4.4} cy="23.7" r="1.3" fill="#FB7185" opacity="0.45" />
    <path d={`M${cx - 2.4} 24 Q${cx} 26.3 ${cx + 2.4} 24`} stroke="#7C2D12" strokeWidth="0.9" strokeLinecap="round" />
  </>
);

const HabilidadesSociales = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#EC4899" shadow="#500724" />
        <MaterialGradient id={id('skin1')} light="#FFE8D2" base="#F8C9A0" dark="#D6956A" />
        <MaterialGradient id={id('skin2')} light="#D9A272" base="#B07448" dark="#74462A" />
        <MaterialGradient id={id('hair1')} light="#D97706" base="#92400E" dark="#5C2A0B" />
        <MaterialGradient id={id('hair2')} light="#57381F" base="#2E1C10" dark="#160C06" />
        <MaterialGradient id={id('shirt1')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
        <MaterialGradient id={id('shirt2')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('heart')} light="#FECDD3" base="#F43F5E" dark="#BE123C" />
      </defs>

      <Ground url={url} cx={24} cy={42.4} rx={19} ry={2.2} />

      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-6deg' }}>
        <Kid url={url} cx={33.2} skin="skin2" hair="hair2" shirt="shirt2" curly />
      </g>
      <g className="art-h-tilt-r art-o-bottom" style={{ '--tilt': '6deg' }}>
        <Kid url={url} cx={14.8} skin="skin1" hair="hair1" shirt="shirt1" />
      </g>

      {/* corazón */}
      <g className="art-h-jump" style={{ '--jump': '-4px' }}>
        <g className="art-i-pulse" style={{ '--amp': '1.1', '--dur': '1.6s' }}>
          <path d={HEART} transform="translate(0.5 0.8)" fill="#881337" opacity="0.45" />
          <path d={HEART} fill={url('heart')} />
          <ellipse cx="21.3" cy="7.1" rx="1.5" ry="0.9" fill="#fff" opacity="0.75" transform="rotate(-35 21.3 7.1)" />
        </g>
      </g>

      <Sparkle x={42.5} y={7} r={2.2} fill="#F9A8D4" idle delay={0.7} />
    </svg>
  );
};

/* Razonamiento — Bombilla encendida con insignia «?».
   Hover: la duda «?» se convierte en «!» y la bombilla lanza rayos.
   Reposo: el halo de luz respira y titila un destello. */
const BULB = 'M24 5 C16.3 5 11 10.6 11 17.6 C11 22.2 13.2 25.4 16 27.8 C17.3 29 18 30.4 18 32 L18 33.4 L30 33.4 L30 32 C30 30.4 30.7 29 32 27.8 C34.8 25.4 37 22.2 37 17.6 C37 10.6 31.7 5 24 5 Z';
const RAYS = [180, 220, 270, 0].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { k: deg, x1: f(24 + 14.8 * Math.cos(a)), y1: f(17.6 + 14.8 * Math.sin(a)), x2: f(24 + 17.2 * Math.cos(a)), y2: f(17.6 + 17.2 * Math.sin(a)) };
});

const Razonamiento = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#F59E0B" shadow="#451a03" />
        <GlowGradient id={id('halo')} color="#FBBF24" opacity={0.55} mid={0.4} />
        <GlowGradient id={id('core')} color="#fff" opacity={0.9} mid={0.45} />
        <radialGradient id={id('glass')} cx="0.42" cy="0.38" r="0.66">
          <stop offset="0%" stopColor="#FFFDF2" />
          <stop offset="45%" stopColor="#FEF08A" />
          <stop offset="80%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <MaterialGradient id={id('base')} light="#C7D2FE" base="#6366F1" dark="#312E81" x1={0} y1={0} x2={1} y2={0.4} />
        <MaterialGradient id={id('badge')} light="#DDD6FE" base="#8B5CF6" dark="#5B21B6" />
      </defs>

      <circle cx="24" cy="24" r="22.5" fill={url('aura')} />
      <ellipse cx="24" cy="43.6" rx="10" ry="2" fill={url('shadow')} />
      <circle className="art-i-glow" style={{ '--lo': '0.5', '--dur': '3.4s' }} cx="24" cy="18" r="17" fill={url('halo')} />

      {/* rayos (aparecen al pasar el ratón) */}
      <g className="art-h-show">
        {RAYS.map((r) => (
          <line key={r.k} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#F59E0B" strokeWidth="1.7" strokeLinecap="round" />
        ))}
      </g>

      {/* casquillo */}
      <rect x="18.4" y="33" width="11.2" height="2.7" rx="1.3" fill={url('base')} />
      <rect x="18.8" y="35.6" width="10.4" height="2.5" rx="1.2" fill={url('base')} />
      <rect x="19.6" y="38" width="8.8" height="2.3" rx="1.1" fill={url('base')} />
      <path d="M18.8 35.65 H29.2 M19.4 38.05 H28.6" stroke="#1E1B4B" strokeOpacity="0.4" strokeWidth="0.5" />
      <path d="M19.4 33.7 H24.4 M19.8 36.3 H23.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M22 40.2 H26 C26 41.6 25.2 42.4 24 42.4 C22.8 42.4 22 41.6 22 40.2 Z" fill="#312E81" />

      {/* cristal con filamento */}
      <path d={BULB} fill={url('glass')} />
      <circle cx="24" cy="21" r="8.4" fill={url('core')} />
      <path d={BULB} stroke="#D97706" strokeOpacity="0.55" strokeWidth="0.7" />
      <path d="M21.6 33 V25.4 M26.4 33 V25.4" stroke="#B45309" strokeOpacity="0.8" strokeWidth="0.7" />
      <path d="M21.6 25.4 C21.6 22.2 23 21.4 24 23 C25 21.4 26.4 22.2 26.4 25.4" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M21.6 25.4 C21.6 22.2 23 21.4 24 23 C25 21.4 26.4 22.2 26.4 25.4" stroke="#FFFBEB" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M15.6 15.6 C15.8 11.6 18.6 8.6 22 7.8" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="15.5" cy="19.2" r="0.9" fill="#fff" opacity="0.8" />

      {/* insignia: ? → ! */}
      <circle cx="39.6" cy="9.6" r="5.2" fill="#2E1065" opacity="0.45" />
      <circle cx="39" cy="8.8" r="5.2" fill={url('badge')} />
      <ellipse cx="37.6" cy="6.6" rx="2.4" ry="1" fill="#fff" opacity="0.5" />
      <text className="art-h-hide" x="39" y="11.6" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="7.8" fill="#fff">?</text>
      <g className="art-h-show">
        <text className="art-h-pop" style={{ '--pop': '1.25' }} x="39" y="11.6" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="7.8" fill="#FDE68A">!</text>
      </g>

      <Sparkle x={6} y={34} r={2.2} fill="#FBBF24" idle delay={1.1} />
    </svg>
  );
};

/* Autonomía — Zapatilla con el lazo atado y medalla de «¡lo conseguí!».
   Hover: la zapatilla da un salto, el lazo se menea y la medalla se infla.
   Reposo: el lazo se mece y titila un destello. */
const SHOE = 'M6 31.8 L6.6 19.5 C6.8 16.8 8.6 15.4 11.2 15.4 L17 15.4 C18.4 15.4 19.2 16.2 19.6 17.4 C20.6 20.4 22.6 22 25.4 22.4 L32 23.6 C36.8 24.4 40.6 26.4 42.4 29.4 C42.9 30.3 43 31.2 42.8 31.8 Z';
const SOLE = 'M5 33.4 C5 36.6 7 38.2 10 38.2 L39.5 38.2 C42.8 38.2 44.4 36.6 44.4 34.2 C44.4 33 43.8 32 42.8 31.5 L5.6 31.5 Z';

const Autonomia = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#10B981" shadow="#022c22" />
        <MaterialGradient id={id('upper')} light="#A7F3D0" base="#10B981" dark="#047857" />
        <MaterialGradient id={id('toe')} light="#ECFDF5" base="#A7F3D0" dark="#34D399" />
        <MaterialGradient id={id('sole')} light="#FFFFFF" base="#F1F5F9" dark="#A8B4C6" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('stripe')} light="#FDE68A" base="#FBBF24" dark="#D97706" />
        <MaterialGradient id={id('medal')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <linearGradient id={id('bow')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D1FAE5" />
        </linearGradient>
      </defs>

      <Ground url={url} cx={24.5} cy={40.6} rx={19} ry={2.3} />

      <g className="art-h-jump" style={{ '--jump': '-5px' }}>
        {/* lengüeta */}
        <path d="M17.4 16.8 C17.8 13.4 19.6 11.6 22 11.8 C23.4 12 23.8 13 23.4 14.2 L21.6 20.6 Z" fill="#6EE7B7" />
        <path d="M18.4 15.6 C18.8 13.6 20 12.6 21.4 12.6" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
        {/* empeine */}
        <path d={SHOE} transform="translate(0.5 0.6)" fill="#064E3B" opacity="0.5" />
        <path d={SHOE} fill={url('upper')} />
        <path d="M33 23.8 C37.4 24.6 40.8 26.6 42.4 29.4 C42.9 30.3 43 31.2 42.8 31.8 L34.5 31.8 C34.8 29 34.4 26.2 33 23.8 Z" fill={url('toe')} />
        <path d="M11.6 29.4 C17 28.6 22 26.6 27.6 27 C24.4 29 18 30.6 11.6 30.6 Z" fill={url('stripe')} />
        <path d="M10.4 15.6 C11.8 14.6 15.8 14.6 17.4 15.8 C16 17 12 17.2 10.4 15.6 Z" fill="#064E3B" />
        <path d="M7.6 29.6 L8 20 C8.2 17.8 9.2 16.6 10.8 16.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="38.4" cy="26.4" rx="2.2" ry="0.8" fill="#fff" opacity="0.7" transform="rotate(22 38.4 26.4)" />
        {/* cordones */}
        <path d="M21.7 22.2 L23.3 18.9 M24.9 23.3 L26.5 20.1 M28.1 24.3 L29.6 21.3" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <path d="M21.7 22.2 L23.3 18.9 M24.9 23.3 L26.5 20.1 M28.1 24.3 L29.6 21.3" stroke="#fff" strokeWidth="1.05" strokeLinecap="round" />
        {/* suela */}
        <path d={SOLE} fill={url('sole')} />
        <path d="M6.4 35.6 H43.2" stroke="#94A3B8" strokeOpacity="0.6" strokeWidth="0.6" strokeDasharray="1.6 1.2" />
        <path d="M6.6 32.4 H42" stroke="#fff" strokeWidth="0.7" strokeLinecap="round" />
        {/* lazo */}
        <g className="art-h-wiggle">
          <g className="art-i-sway" style={{ '--amp': '5deg', '--dur': '3.6s', transformOrigin: '50% 70%' }}>
            <path d="M22.6 16.4 C21.8 18.4 20.6 19.6 18.8 20.4 M23.4 16.4 C24.4 18.2 25.6 19.4 27.4 19.9" stroke="#047857" strokeWidth="2.1" strokeLinecap="round" />
            <path d="M22.6 16.4 C21.8 18.4 20.6 19.6 18.8 20.4 M23.4 16.4 C24.4 18.2 25.6 19.4 27.4 19.9" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M23 16 C20.4 12.2 16.2 12.4 16.7 15.3 C17.1 17.5 20.6 17.1 23 16 Z" fill={url('bow')} stroke="#047857" strokeWidth="0.75" strokeLinejoin="round" />
            <path d="M23 16 C25.9 12.4 30.1 12.9 29.4 15.9 C28.9 18 25.3 17.2 23 16 Z" fill={url('bow')} stroke="#047857" strokeWidth="0.75" strokeLinejoin="round" />
            <path d="M18.6 14.9 C19.8 14.9 21.2 15.3 22.2 15.9 M27.6 15.1 C26.4 15.1 25 15.4 23.9 15.9" stroke="#047857" strokeOpacity="0.55" strokeWidth="0.55" strokeLinecap="round" />
            <circle cx="23" cy="16.1" r="1.3" fill="#fff" stroke="#047857" strokeWidth="0.7" />
          </g>
        </g>
      </g>

      {/* medalla de logro */}
      <g className="art-h-pop" style={{ '--pop': '1.22' }}>
        <circle cx="40.1" cy="10.3" r="5.2" fill="#78350F" opacity="0.45" />
        <circle cx="39.5" cy="9.5" r="5.2" fill={url('medal')} />
        <circle cx="39.5" cy="9.5" r="3.9" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" />
        <ellipse cx="38" cy="7.2" rx="2.3" ry="0.9" fill="#fff" opacity="0.6" />
        <path d="M37.2 9.7 L38.9 11.4 L42 8.1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <Sparkle x={6} y={9} r={2.4} fill="#6EE7B7" idle delay={0.3} />
    </svg>
  );
};

/* Lectoescritura adaptada — Libro abierto con letras grandes y lupa.
   Hover: la lupa se acerca inclinándose, la «A» se agranda y salta un destello.
   Reposo: la lupa flota suavemente y titila un destello. */
const Lupa = ({ url }) => (
  <>
    <path d="M37.6 30.6 L43 36.8" stroke="#1E1B4B" strokeOpacity="0.35" strokeWidth="4.2" strokeLinecap="round" transform="translate(0.5 0.8)" />
    <path d="M37.6 30.6 L43 36.8" stroke={url('handle')} strokeWidth="3.6" strokeLinecap="round" />
    <path d="M38.6 30.8 L42.2 35" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" strokeLinecap="round" />
    <circle cx="32" cy="24.4" r="7.6" fill={url('lens')} />
    <text x="32" y="28.6" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="12" fill="#4F46E5">a</text>
    <circle cx="32" cy="24.4" r="7.6" stroke={url('gold')} strokeWidth="2.2" />
    <circle cx="32" cy="24.4" r="6.4" stroke="#92400E" strokeOpacity="0.3" strokeWidth="0.5" />
    <path d="M26.7 22 A5.6 5.6 0 0 1 30.2 18.9" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" />
  </>
);

const LectoescrituraAdaptada = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <BaseDefs id={id} accent="#6366F1" shadow="#1e1b4b" />
        <MaterialGradient id={id('cover')} light="#A5B4FC" base="#6366F1" dark="#3730A3" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('handle')} light="#F9A8D4" base="#EC4899" dark="#9D174D" />
        <linearGradient id={id('pageL')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id={id('pageR')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="30%" stopColor="#F5F7FF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <radialGradient id={id('lens')} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#CFFAFE" stopOpacity="0.88" />
        </radialGradient>
      </defs>

      <Ground url={url} cx={24} cy={43} rx={19} ry={2.2} />

      {/* libro abierto */}
      <path d="M3 16.4 C10 13.8 17.4 14.4 24 17.6 C30.6 14.4 38 13.8 45 16.4 V39.8 C38 37.6 30.6 38 24 41.4 C17.4 38 10 37.6 3 39.8 Z" fill={url('cover')} />
      <path d="M4 38.4 C10.6 36.6 17.4 37.2 23.4 40" stroke="#E0E7FF" strokeWidth="0.7" />
      <path d="M44 38.4 C37.4 36.6 30.6 37.2 24.6 40" stroke="#E0E7FF" strokeWidth="0.7" />
      <path d="M5 16 C10.6 13.6 17.4 14 23.4 17 V38.6 C17.4 35.8 10.6 35.4 5 37.6 Z" fill={url('pageL')} />
      <path d="M43 16 C37.4 13.6 30.6 14 24.6 17 V38.6 C30.6 35.8 37.4 35.4 43 37.6 Z" fill={url('pageR')} />
      <path d="M5.8 17.4 C10.8 15.4 16.6 15.6 21.6 17.8" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />

      {/* letra grande en la página izquierda */}
      <text className="art-h-pop" style={{ '--pop': '1.15' }} x="14.2" y="31" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="13" fill="#4338CA">A</text>
      <line x1="8" y1="33.6" x2="20.4" y2="33.6" stroke="#A5B4FC" strokeWidth="0.7" strokeDasharray="1.6 1" />
      {[22, 25.5, 29].map((y) => (
        <line key={y} x1="27.4" y1={y} x2="40.4" y2={y} stroke="#A5B4FC" strokeWidth="0.9" strokeLinecap="round" />
      ))}

      {/* lupa */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-h-tilt" style={{ '--tilt': '-10deg' }}>
          <g className="art-i-bob" style={{ '--amp': '-1.2px', '--dur': '4.4s' }}>
            <Lupa url={url} />
          </g>
        </g>
      </g>

      <Sparkle x={6} y={8} r={2.4} fill="#A5B4FC" idle delay={0.6} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={41} y={11} r={2.8} fill="#FBBF24" /></g>
    </svg>
  );
};

const ICONS = {
  articulacion: Articulacion,
  vocabulario: Vocabulario,
  morfosintaxis: Morfosintaxis,
  pragmatica: Pragmatica,
  'conciencia-fonologica': ConcienciaFonologica,
  'comprension-oral': ComprensionOral,
  lectoescritura: Lectoescritura,
  atencion: Atencion,
  memoria: Memoria,
  'funciones-ejecutivas': FuncionesEjecutivas,
  'habilidades-sociales': HabilidadesSociales,
  razonamiento: Razonamiento,
  autonomia: Autonomia,
  'lectoescritura-adaptada': LectoescrituraAdaptada,
};

export default ICONS;
