// Ilustraciones de las tarjetas de curso de ESO, Bachillerato y Atención a la
// Diversidad (rediseño 2026). Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: eso-1, eso-2, eso-3, eso-4, bachillerato-1, bachillerato-2, ad-1
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

/* ---------- utilidades locales (geometría estática, se calcula una vez) ---------- */

const f2 = (n) => Math.round(n * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;

// Degradado esférico (bolas, cristal, botones) con la luz arriba-izquierda.
const SphereGradient = ({ id, light, base, dark, cx = 0.36, cy = 0.3 }) => (
  <radialGradient id={id} cx={cx} cy={cy} r="0.75">
    <stop offset="0%" stopColor={light} />
    <stop offset="55%" stopColor={base} />
    <stop offset="100%" stopColor={dark} />
  </radialGradient>
);

// Sombra propia: de transparente a un tono oscuro (por defecto hacia la derecha).
const ShadeGradient = ({ id, color, opacity = 0.4, x1 = 0, y1 = 0, x2 = 1, y2 = 0 }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    <stop offset="0%" stopColor={color} stopOpacity="0" />
    <stop offset="100%" stopColor={color} stopOpacity={opacity} />
  </linearGradient>
);

// Estrella de 5 puntas y sus facetas (índices de triángulo centro-punta).
const starPt = (cx, cy, R, r, k) => {
  const rr = k % 2 ? r : R;
  const a = rad(-90 + k * 36);
  return `${f2(cx + rr * Math.cos(a))} ${f2(cy + rr * Math.sin(a))}`;
};
const starPath = (cx, cy, R, r = R * 0.43) =>
  `M${Array.from({ length: 10 }, (_, k) => starPt(cx, cy, R, r, k)).join(' L')} Z`;
const starFacets = (cx, cy, R, r, idx) =>
  idx.map((i) => `M${cx} ${cy} L${starPt(cx, cy, R, r, i)} L${starPt(cx, cy, R, r, (i + 1) % 10)} Z`).join(' ');
const STAR_LIT = [7, 8, 9, 0];
const STAR_DARK = [2, 3, 4, 5];

// Roseta festoneada (sello del título).
const rosettePath = (cx, cy, rIn, rOut, n) => {
  const p = (r, a) => `${f2(cx + r * Math.cos(a))} ${f2(cy + r * Math.sin(a))}`;
  let d = `M${p(rIn, 0)}`;
  for (let k = 0; k < n; k += 1) {
    const a1 = ((k + 0.5) / n) * Math.PI * 2;
    const a2 = ((k + 1) / n) * Math.PI * 2;
    d += ` Q${p(rOut, a1)} ${p(rIn, a2)}`;
  }
  return `${d} Z`;
};

// Hojas de laurel a lo largo de una curva de Bézier cúbica.
const bez = (P, t) => {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i]);
};
const bezD = (P, t) => {
  const u = 1 - t;
  return [0, 1].map((i) => 3 * u * u * (P[1][i] - P[0][i]) + 6 * u * t * (P[2][i] - P[1][i]) + 3 * t * t * (P[3][i] - P[2][i]));
};
const LAUREL_STEM = [[38.6, 68.6], [29, 68], [18.6, 61.4], [14.6, 47.6]];
const LAUREL = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.93].map((t, i) => {
  const [x, y] = bez(LAUREL_STEM, t);
  const [dx, dy] = bezD(LAUREL_STEM, t);
  const side = i % 2 ? 1 : -1;
  return { x: f2(x), y: f2(y), a: f2((Math.atan2(dy, dx) * 180) / Math.PI + side * 38), s: 0.85 + t * 0.25 };
});

/* ==========================================================================
   1º ESO — Microscopio con visor de células.
   Hover: el tubo baja a enfocar, la rueda de enfoque gira, se enciende el haz
   de la lámpara y el visor de células crece. Reposo (nivel alto): brilla la
   lámpara, una célula flota y titilan dos destellos.
   ========================================================================== */
const Microscope = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <ShadowGradient id={id('shadow')} color="#1e1b4b" opacity={0.5} />
        <MaterialGradient id={id('enamel')} light="#FFFFFF" base="#EEF2FF" dark="#A5B4FC" />
        <MaterialGradient id={id('tube')} light="#FFFFFF" base="#E0E7FF" dark="#818CF8" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('dark')} light="#818CF8" base="#4338CA" dark="#1E1B4B" />
        <MaterialGradient id={id('steel')} light="#F8FAFC" base="#CBD5E1" dark="#475569" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('goldH')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('ring')} light="#FFFFFF" base="#E0E7FF" dark="#818CF8" />
        <ShadeGradient id={id('armShade')} color="#3730A3" opacity={0.5} />
        <GlowGradient id={id('lamp')} color="#67E8F9" opacity={0.9} />
        <radialGradient id={id('view')} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="60%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
        <SphereGradient id={id('cell')} light="#D1FAE5" base="#34D399" dark="#047857" />
        <SphereGradient id={id('cellPink')} light="#FCE7F3" base="#F472B6" dark="#9D174D" />
        <linearGradient id={id('beam')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A5F3FC" stopOpacity="0.1" />
        </linearGradient>
        <clipPath id={id('lens')}><circle cx="61" cy="17" r="9.4" /></clipPath>
      </defs>

      {/* aura */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />

      {/* escena ampliada un 5 % y centrada */}
      <g transform="matrix(1.05 0 0 1.05 -4.6 -2)">
      <ellipse cx="40" cy="70.6" rx="26" ry="3.4" fill={url('shadow')} />

      {/* base */}
      <path d="M16.5 65 C16.5 62.9 18.1 61.6 20.2 61.6 H59.8 C61.9 61.6 63.5 62.9 63.5 65 V66.6 C63.5 68.5 62.1 69.8 60.2 69.8 H19.8 C17.9 69.8 16.5 68.5 16.5 66.6 Z" fill={url('dark')} />
      <path d="M18.2 63.4 C18.6 62.5 19.3 62.2 20.4 62.2 H59.6 C60.7 62.2 61.4 62.5 61.8 63.4 Z" fill="#C7D2FE" opacity="0.6" />
      <path d="M44 69.8 H60.2 C62.1 69.8 63.5 68.5 63.5 66.6 V65.2" stroke="#0F0A32" strokeOpacity="0.45" strokeWidth="1.1" />
      <path d="M19.4 63.2 H40" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />

      {/* lámpara: brilla en reposo */}
      <g className="art-i-glow" style={{ '--lo': 0.45, '--hi': 1, '--dur': '3.4s' }}>
        <ellipse cx="46" cy="55.6" rx="10" ry="7" fill={url('lamp')} />
      </g>
      <path d="M40.4 62 C40.4 58.2 51.6 58.2 51.6 62 Z" fill={url('dark')} />
      <ellipse cx="46" cy="59.3" rx="3.8" ry="1.1" fill="#CFFAFE" />
      <ellipse cx="45.1" cy="59.1" rx="1.6" ry="0.4" fill="#fff" />

      {/* brazo */}
      <path d="M20.4 63 C17.4 52 17.6 40 22.4 31.6 C25 27 28.4 23.6 32 21.6 L37.4 30.4 C33.6 33.6 31.4 38 30.8 43.6 C30.4 48.4 31.2 54 33.6 63 Z" fill={url('enamel')} />
      <path d="M37.4 30.4 C33.6 33.6 31.4 38 30.8 43.6 C30.4 48.4 31.2 54 33.6 63 L29.6 63 C27.6 54.6 27 48.4 27.6 43 C28.4 37.4 31.4 33 35.4 29.4 Z" fill={url('armShade')} />
      <path d="M21.6 54 C20.8 46.6 21.4 39.4 24.6 33.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />

      {/* haz de luz (hover) */}
      <g className="art-h-show">
        <path d="M42.6 59 L49.4 59 L47.8 50 L44.2 50 Z" fill={url('beam')} />
      </g>

      {/* condensador y platina con la muestra */}
      <rect x="43.2" y="48.8" width="6" height="2.8" rx="0.6" fill={url('steel')} />
      <rect x="26.6" y="45.4" width="36.8" height="3.8" rx="1.9" fill={url('dark')} />
      <rect x="28" y="45.7" width="34" height="1" rx="0.5" fill="#C7D2FE" opacity="0.6" />
      <rect x="37.4" y="43.7" width="18.6" height="1.9" rx="0.5" fill="#CFFAFE" opacity="0.92" />
      <rect x="37.8" y="43.9" width="17.8" height="0.5" rx="0.25" fill="#fff" />
      <ellipse cx="46.4" cy="44.7" rx="2.4" ry="0.75" fill="#EC4899" opacity="0.9" />
      <rect x="34.4" y="43.4" width="5.4" height="1.5" rx="0.75" fill={url('steel')} />
      <rect x="53.6" y="43.4" width="5.4" height="1.5" rx="0.75" fill={url('steel')} />
      <g className="art-h-show">
        <ellipse cx="46.4" cy="44.4" rx="8" ry="3.6" fill={url('lamp')} />
      </g>

      {/* tubo óptico: baja a enfocar */}
      <g className="art-h-drop" style={{ '--drop': '1.8px' }}>
        <g transform="rotate(-31 37 25)">
          <rect x="33.6" y="8.2" width="6.8" height="5.8" rx="1" fill={url('dark')} />
          <rect x="34.4" y="8.8" width="1.3" height="4.8" rx="0.65" fill="#fff" opacity="0.35" />
          <rect x="33" y="6.4" width="8" height="2.6" rx="1.2" fill="#1E1B4B" />
          <rect x="34.2" y="6.8" width="5.6" height="0.8" rx="0.4" fill="#A5F3FC" opacity="0.85" />
          <rect x="32.4" y="13.4" width="9.2" height="2.6" rx="0.9" fill={url('goldH')} />
          <rect x="32.9" y="15.8" width="8.2" height="17" rx="1.4" fill={url('tube')} />
          <rect x="39" y="15.8" width="2.1" height="17" fill="#4338CA" opacity="0.22" />
          <rect x="34" y="16.6" width="1.5" height="15.4" rx="0.75" fill="#fff" opacity="0.9" />
          <rect x="32.9" y="26.4" width="8.2" height="1.5" fill="#6366F1" opacity="0.8" />
          <path d="M31.4 32.4 H42.6 L41.4 36.6 H32.6 Z" fill={url('steel')} />
          <path d="M32.2 35.2 H41.8 L41.4 36.6 H32.6 Z" fill="#334155" opacity="0.45" />
          <path d="M41 36 L44.2 37.2 L42.8 40.6 L40.2 39.6 Z" fill="#64748B" />
          <path d="M34.3 36.4 H39.7 L39.1 41.4 Q37 42.8 34.9 41.4 Z" fill={url('steel')} />
          <rect x="34.5" y="38.2" width="5" height="1.1" fill={url('goldH')} />
          <ellipse cx="37" cy="41.7" rx="1.5" ry="0.6" fill="#67E8F9" />
        </g>
      </g>

      {/* ruedas de enfoque: la grande gira */}
      <circle cx="25.2" cy="55.6" r="2.5" fill={url('dark')} />
      <circle cx="24.5" cy="54.9" r="0.8" fill="#fff" opacity="0.5" />
      <g className="art-h-spin" style={{ '--spin': '220deg' }}>
        <circle cx="24.4" cy="46.4" r="5.4" fill={url('gold')} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = rad(i * 36);
          return (
            <line key={i} x1={f2(24.4 + 4 * Math.cos(a))} y1={f2(46.4 + 4 * Math.sin(a))} x2={f2(24.4 + 5.1 * Math.cos(a))} y2={f2(46.4 + 5.1 * Math.sin(a))} stroke="#92400E" strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" />
          );
        })}
      </g>
      <circle cx="24.4" cy="46.4" r="2.8" fill={url('goldH')} />
      <circle cx="23.4" cy="45.2" r="1" fill="#fff" opacity="0.8" />

      {/* burbujas que unen la muestra con el visor */}
      <circle cx="51" cy="35.8" r="1.1" fill="#fff" opacity="0.9" />
      <circle cx="53.6" cy="31" r="1.6" fill="#fff" opacity="0.9" />

      {/* visor con células: crece al pasar el ratón */}
      <g className="art-h-pop" style={{ '--pop': 1.14 }}>
        <circle cx="61" cy="17" r="11.4" fill={url('ring')} />
        <circle cx="61" cy="17" r="9.4" fill={url('view')} />
        <g clipPath={url('lens')}>
          <circle cx="54.6" cy="11.8" r="0.8" fill="#A5F3FC" opacity="0.7" />
          <circle cx="64" cy="25.6" r="0.7" fill="#A5F3FC" opacity="0.6" />
          <circle cx="56.6" cy="24.2" r="0.6" fill="#F0ABFC" opacity="0.75" />
          <circle cx="58.6" cy="18.4" r="5.4" fill={url('cell')} />
          <circle cx="58.6" cy="18.4" r="4.7" stroke="#ECFDF5" strokeOpacity="0.45" strokeWidth="0.5" />
          <circle cx="59.6" cy="19.4" r="2" fill="#5B21B6" opacity="0.72" />
          <circle cx="59.1" cy="18.9" r="0.7" fill="#DDD6FE" opacity="0.85" />
          <ellipse cx="56.8" cy="16.2" rx="2" ry="1.2" transform="rotate(-30 56.8 16.2)" fill="#fff" opacity="0.6" />
          <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.6s' }}>
            <circle cx="66.2" cy="12.6" r="2.9" fill={url('cellPink')} />
            <circle cx="65.4" cy="11.7" r="0.8" fill="#fff" opacity="0.75" />
          </g>
          <circle cx="66.4" cy="21.8" r="2" fill={url('cell')} />
          <circle cx="65.8" cy="21.2" r="0.6" fill="#fff" opacity="0.75" />
        </g>
        <circle cx="61" cy="17" r="9.4" stroke="#1E1B4B" strokeOpacity="0.35" strokeWidth="0.7" />
        <path d="M54.2 13.6 A7.6 7.6 0 0 1 59.6 9.8" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M51.4 12.8 A10.6 10.6 0 0 1 57.6 6.9" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" />
      </g>
      </g>

      {/* destellos */}
      <Sparkle x={10} y={22} r={3.2} idle delay={0} />
      <Sparkle x={72.5} y={44} r={2.4} fill="#FEF3C7" idle delay={1.3} />
      <Sparkle x={11} y={60} r={1.8} opacity={0.85} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={70} y={34} r={2.6} fill="#A5F3FC" /></g>
      <g className="art-h-burst" style={{ '--d': '.18s' }}><Sparkle x={8} y={40} r={2.6} /></g>
    </svg>
  );
};

/* ==========================================================================
   2º ESO — Libro abierto con magia: de sus páginas sube luz, una estrella y
   letras flotantes.
   Hover: la magia sube, la estrella gira, el brillo se intensifica y el
   marcapáginas se agita. Reposo: las letras flotan y los rayos laten.
   ========================================================================== */
const MagicBook = () => {
  const [id, url] = useArtIds();
  const lines = [0, 1, 2, 3, 4];
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#3b0764" opacity={0.48} />
        <MaterialGradient id={id('cover')} light="#A5B4FC" base="#4F46E5" dark="#312E81" />
        <linearGradient id={id('pageL')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#DDD6FE" />
        </linearGradient>
        <linearGradient id={id('pageR')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="30%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id={id('gutter')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6D28D9" stopOpacity="0" />
          <stop offset="50%" stopColor="#6D28D9" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#6D28D9" stopOpacity="0" />
        </linearGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('ribbon')} light="#FDA4AF" base="#F43F5E" dark="#9F1239" />
        <GlowGradient id={id('magic')} color="#FEF3C7" opacity={0.85} mid={0.3} />
        <GlowGradient id={id('magicHi')} color="#fff" opacity={0.75} mid={0.3} />
        <linearGradient id={id('ray')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('glyph')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FBCFE8" />
        </linearGradient>
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="40" cy="68.6" rx="33" ry="3.6" fill={url('shadow')} />

      {/* tapa dura */}
      <path d="M40 36.6 C31 31.4 19 30.6 7.4 33.4 L7.4 63 C19 60.6 31 61.4 40 66.2 C49 61.4 61 60.6 72.6 63 L72.6 33.4 C61 30.6 49 31.4 40 36.6 Z" fill={url('cover')} />
      <path d="M7.4 63 C19 60.6 31 61.4 40 66.2 C49 61.4 61 60.6 72.6 63 L72.6 65.4 C61 63 49 63.8 40 68.6 C31 63.8 19 63 7.4 65.4 Z" fill="#1E1B4B" />
      <path d="M7.4 33.4 C19 30.6 31 31.4 40 36.6" stroke="#C7D2FE" strokeOpacity="0.7" strokeWidth="0.8" />
      <path d="M7.4 59.6 V63 C9.2 62.6 11 62.3 12.8 62 Z" fill={url('gold')} />
      <path d="M72.6 59.6 V63 C70.8 62.6 69 62.3 67.2 62 Z" fill={url('gold')} />

      {/* bloque de hojas */}
      <path d="M40 35.4 C31 30 20 29.4 9.4 31.8 L9.4 61.4 C20 59.2 31 60 40 64.6 C49 60 60 59.2 70.6 61.4 L70.6 31.8 C60 29.4 49 30 40 35.4 Z" fill="#EDE9FE" />
      <path d="M9.8 60.4 C20 58.2 31 59 40 63.6 C49 59 60 58.2 70.2 60.4" stroke="#C4B5FD" strokeWidth="0.45" />
      <path d="M9.8 61.2 C20 59 31 59.8 40 64.4 C49 59.8 60 59 70.2 61.2" stroke="#C4B5FD" strokeWidth="0.35" />

      {/* páginas abiertas */}
      <path d="M40 33.6 C31 28 20 27 10.8 29.6 L10.8 59.4 C20 57 31 57.8 40 62.6 Z" fill={url('pageL')} />
      <path d="M40 33.6 C49 28 60 27 69.2 29.6 L69.2 59.4 C60 57 49 57.8 40 62.6 Z" fill={url('pageR')} />
      <path d="M35 31.2 C37 31.9 38.8 32.7 40 33.6 C41.2 32.7 43 31.9 45 31.2 L45 59.6 C43 60.4 41.2 61.4 40 62.6 C38.8 61.4 37 60.4 35 59.6 Z" fill={url('gutter')} />
      <path d="M10.8 29.6 C20 27 31 28 40 33.6 C49 28 60 27 69.2 29.6" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />

      {/* renglones */}
      {lines.map((i) => {
        const y = 35.4 + i * 4.5;
        const end = i === 4 ? 27 : 35.6;
        return <path key={`l${i}`} d={`M14.6 ${y} C20.6 ${y - 2.1} 28 ${y - 1.4} ${end} ${y + (i === 4 ? 0.2 : 2.3)}`} stroke={i === 0 ? '#EC4899' : '#8B5CF6'} strokeOpacity={i === 0 ? 0.7 : 0.38} strokeWidth={i === 0 ? 1.3 : 0.9} strokeLinecap="round" />;
      })}
      {lines.map((i) => {
        const y = 35.4 + i * 4.5;
        return <path key={`r${i}`} d={`M44.4 ${y + 2.3} C52 ${y - 1.4} 59.4 ${y - 2.1} 65.4 ${y}`} stroke="#8B5CF6" strokeOpacity="0.38" strokeWidth="0.9" strokeLinecap="round" />;
      })}

      {/* cinta marcapáginas */}
      <g className="art-h-wiggle art-o-top">
        <path d="M41.2 33.4 L44.4 32.6 C45.6 41 46.8 50.6 48.2 60 L49 67.4 L46.9 65.6 L45.2 67.8 L44.6 60.2 C43.6 50.6 42.4 41 41.2 33.4 Z" fill={url('ribbon')} />
        <path d="M42.4 34 C43.4 41.6 44.6 51 45.6 60" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
      </g>

      {/* resplandor mágico */}
      <ellipse cx="40" cy="23" rx="25" ry="21" fill={url('magic')} />
      <g className="art-h-show">
        <ellipse cx="40" cy="24" rx="27" ry="24" fill={url('magicHi')} />
      </g>
      <g className="art-i-glow" style={{ '--lo': 0.45, '--hi': 1, '--dur': '3.6s' }}>
        <path d="M39.2 33 L27.8 9.6 L32.6 7.6 Z" fill={url('ray')} />
        <path d="M40 33 L37.6 4 L42.4 4 Z" fill={url('ray')} />
        <path d="M40.8 33 L47.4 7.6 L52.2 9.6 Z" fill={url('ray')} />
      </g>

      {/* la magia sube al pasar el ratón */}
      <g className="art-h-lift" style={{ '--lift': '-5px' }}>
        <g className="art-i-bob" style={{ '--amp': '-2px', '--dur': '3.8s' }}>
          <text x="21.6" y="26.4" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="12" fill="#6D28D9" opacity="0.45">A</text>
          <text x="20.8" y="25.6" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="12" fill={url('glyph')}>A</text>
        </g>
        <g className="art-i-bob" style={{ '--amp': '-2px', '--dur': '4.2s', '--d': '1.3s' }}>
          <text x="53.4" y="27.4" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="12" fill="#6D28D9" opacity="0.45">π</text>
          <text x="52.6" y="26.6" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="12" fill={url('glyph')}>π</text>
        </g>
        <circle cx="31.6" cy="19.4" r="1" fill="#FDE68A" />
        <circle cx="49" cy="18.6" r="0.9" fill="#fff" />
        <circle cx="45.4" cy="27" r="0.7" fill="#FDE68A" />
        <circle cx="34.6" cy="27.6" r="0.6" fill="#fff" />
        <g className="art-h-spin" style={{ '--spin': '144deg' }}>
          <path d={starPath(40, 14, 7)} fill={url('gold')} />
          <path d={starFacets(40, 14, 7, 3.01, STAR_LIT)} fill="#FFFBEB" opacity="0.55" />
          <path d={starFacets(40, 14, 7, 3.01, STAR_DARK)} fill="#92400E" opacity="0.25" />
        </g>
      </g>

      {/* destellos */}
      <Sparkle x={10} y={17} r={3} idle delay={0.4} />
      <Sparkle x={70} y={16} r={2.2} fill="#FEF3C7" opacity={0.9} />
      <Sparkle x={74} y={46} r={1.8} opacity={0.8} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={64} y={8} r={2.8} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={15} y={8} r={2.4} /></g>
    </svg>
  );
};

/* ==========================================================================
   3º ESO — Átomo: núcleo de protones y neutrones con tres órbitas.
   Cada órbita es un círculo aplastado; al pasar el ratón el electrón recorre
   SU elipse (giro dentro del espacio aplastado + contragiro que lo mantiene
   redondo) y el núcleo crece con una onda de energía.
   Reposo: el halo del núcleo late y titilan dos destellos.
   ========================================================================== */
const ORBIT_R = 31;
const ORBIT_K = 0.34;
const ORBITS = [
  { rot: 0, phi: 12, spin: 220, tint: '#67E8F9' },
  { rot: 60, phi: 192, spin: -210, tint: '#FDE68A' },
  { rot: -60, phi: 168, spin: 240, tint: '#F5D0FE' },
].map((o) => ({ ...o, ex: f2(ORBIT_R * Math.cos(rad(o.phi))), ey: f2(ORBIT_R * Math.sin(rad(o.phi))) }));
const NUCLEUS = [
  { x: 40, y: 35, n: 'p' }, { x: 35.67, y: 37.5, n: 'n' }, { x: 44.33, y: 37.5, n: 'n' },
  { x: 35.67, y: 42.5, n: 'p' }, { x: 44.33, y: 42.5, n: 'p' }, { x: 40, y: 45, n: 'n' },
];
const ORBIT_BACK = `M${-ORBIT_R} 0 A${ORBIT_R} ${ORBIT_R} 0 0 1 ${ORBIT_R} 0`;
const ORBIT_FRONT = `M${ORBIT_R} 0 A${ORBIT_R} ${ORBIT_R} 0 0 1 ${-ORBIT_R} 0`;

const Atom = () => {
  const [id, url] = useArtIds();
  const ring = (o, d, front) => (
    <g key={`${o.rot}-${front ? 'f' : 'b'}`} transform={`rotate(${o.rot} 40 40)`}>
      <g transform={`translate(40 40) scale(1 ${ORBIT_K})`}>
        <path d={d} stroke={o.tint} strokeOpacity={front ? 0.45 : 0.28} strokeWidth="5" strokeLinecap="round" />
        <path d={d} stroke="#fff" strokeOpacity={front ? 0.95 : 0.55} strokeWidth="1.9" strokeLinecap="round" />
      </g>
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.32} />
        <GlowGradient id={id('core')} color="#FEF3C7" opacity={0.95} mid={0.3} />
        <SphereGradient id={id('p')} light="#FEF9C3" base="#FBBF24" dark="#B45309" />
        <SphereGradient id={id('n')} light="#E0E7FF" base="#818CF8" dark="#3730A3" />
        <SphereGradient id={id('c')} light="#FCE7F3" base="#EC4899" dark="#831843" />
        <SphereGradient id={id('e')} light="#ECFEFF" base="#22D3EE" dark="#0E7490" />
        <GlowGradient id={id('eHalo')} color="#A5F3FC" opacity={0.8} />
        <ShadowGradient id={id('shadow')} color="#4c0519" opacity={0.4} />
      </defs>

      {/* aura y sombra suave */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="40" cy="73" rx="20" ry="2.6" fill={url('shadow')} />

      {/* mitad trasera de las órbitas */}
      {ORBITS.map((o) => ring(o, ORBIT_BACK, false))}

      {/* halo del núcleo: late en reposo */}
      <g className="art-i-glow" style={{ '--lo': 0.55, '--hi': 1, '--dur': '3.2s' }}>
        <circle cx="40" cy="40" r="15" fill={url('core')} />
      </g>
      {/* onda de energía (hover) */}
      <g className="art-h-burst" style={{ '--d': '.1s' }}>
        <circle cx="40" cy="40" r="12" stroke="#fff" strokeWidth="1.2" strokeOpacity="0.9" />
      </g>

      {/* núcleo */}
      <g className="art-h-pop" style={{ '--pop': 1.16 }}>
        <circle cx="40" cy="40" r="9.6" fill="#831843" opacity="0.18" />
        {NUCLEUS.map((s) => (
          <g key={`${s.x}-${s.y}`}>
            <circle cx={s.x} cy={s.y} r="4.1" fill={url(s.n)} />
            <circle cx={s.x - 1.2} cy={s.y - 1.3} r="1" fill="#fff" opacity="0.75" />
          </g>
        ))}
        <circle cx="40" cy="40" r="4.6" fill={url('c')} />
        <circle cx="38.5" cy="38.4" r="1.2" fill="#fff" opacity="0.8" />
      </g>

      {/* mitad delantera de las órbitas */}
      {ORBITS.map((o) => ring(o, ORBIT_FRONT, true))}

      {/* electrones: recorren su órbita al pasar el ratón */}
      {ORBITS.map((o) => (
        <g key={`e${o.rot}`} transform={`rotate(${o.rot} 40 40)`}>
          <g transform={`translate(40 40) scale(1 ${ORBIT_K})`}>
            <g className="art-h-spin" style={{ '--spin': `${o.spin}deg`, transformBox: 'view-box', transformOrigin: '0px 0px' }}>
              <g className="art-h-spin" style={{ '--spin': `${-o.spin}deg` }}>
                <g transform={`translate(${o.ex} ${o.ey}) scale(1 ${f2(1 / ORBIT_K)}) rotate(${-o.rot})`}>
                  <circle r="6" fill={url('eHalo')} />
                  <circle r="3.2" fill={url('e')} />
                  <circle cx="-1.1" cy="-1.2" r="0.95" fill="#fff" opacity="0.9" />
                </g>
              </g>
            </g>
          </g>
        </g>
      ))}

      {/* destellos */}
      <Sparkle x={10} y={13} r={3} idle delay={0} />
      <Sparkle x={70} y={67} r={2.4} fill="#FEF3C7" idle delay={1.4} />
      <Sparkle x={71} y={12} r={1.9} opacity={0.85} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={11} y={66} r={2.6} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={66} y={6} r={2.4} /></g>
    </svg>
  );
};

/* ==========================================================================
   4º ESO — Birrete de graduación sobre una corona de laurel.
   Hover: el birrete salta, la borla se balancea, estalla el confeti y la
   corona crece un poco. Reposo: la borla se mece y titilan dos destellos.
   ========================================================================== */
const CONFETTI = [
  { x: 12, y: 18, w: 3.2, h: 1.6, a: -30, c: '#22D3EE' },
  { x: 68, y: 12, w: 3, h: 1.5, a: 35, c: '#F472B6' },
  { x: 74, y: 40, w: 2.8, h: 1.4, a: -50, c: '#FDE68A' },
  { x: 6, y: 44, w: 2.8, h: 1.4, a: 60, c: '#A78BFA' },
  { x: 22, y: 6, w: 2.6, h: 1.3, a: 20, c: '#FDE68A' },
  { x: 54, y: 5, w: 2.6, h: 1.3, a: -15, c: '#22D3EE' },
  { x: 76, y: 24, w: 2.4, h: 1.2, a: 70, c: '#fff' },
  { x: 4, y: 28, w: 2.4, h: 1.2, a: -70, c: '#F472B6' },
];

const GradCap = () => {
  const [id, url] = useArtIds();
  const branch = (fill, keyp) => (
    <g key={keyp}>
      <path d={`M${LAUREL_STEM[0].join(' ')} C${LAUREL_STEM[1].join(' ')} ${LAUREL_STEM[2].join(' ')} ${LAUREL_STEM[3].join(' ')}`} stroke="#B45309" strokeWidth="1.1" strokeLinecap="round" />
      {LAUREL.map((l) => (
        <path key={`${l.x}-${l.y}`} transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${f2(l.s)})`} d="M0 0 Q2.8 -2.1 6.2 0 Q2.8 2.1 0 0 Z" fill={fill} />
      ))}
      <path transform="translate(14.6 47.6) rotate(-100)" d="M0 0 Q2.8 -2 6 0 Q2.8 2 0 0 Z" fill={fill} />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <ShadowGradient id={id('shadow')} color="#431407" opacity={0.42} />
        <MaterialGradient id={id('board')} light="#818CF8" base="#3730A3" dark="#1E1B4B" />
        <MaterialGradient id={id('cap')} light="#6366F1" base="#312E81" dark="#1E1B4B" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('goldV')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0} x2={1} y2={0} />
        <MaterialGradient id={id('leaf')} light="#FEF9C3" base="#FBBF24" dark="#B45309" />
        <ShadeGradient id={id('under')} color="#0F0A32" opacity={0.55} x1={0} y1={1} x2={0} y2={0} />
        <GlossGradient id={id('gloss')} opacity={0.5} />
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="40" cy="72" rx="23" ry="3" fill={url('shadow')} />

      {/* corona de laurel (detrás del birrete) */}
      <g className="art-h-pop" style={{ '--pop': 1.06 }}>
        {branch(url('leaf'), 'l')}
        <g transform="matrix(-1 0 0 1 80 0)">{branch(url('leaf'), 'r')}</g>
        <circle cx="40" cy="68.8" r="1.8" fill={url('gold')} />
      </g>

      {/* confeti en reposo */}
      {CONFETTI.slice(0, 6).map((c) => (
        <rect key={`c${c.x}`} x={c.x - c.w / 2} y={c.y - c.h / 2} width={c.w} height={c.h} rx="0.5" fill={c.c} opacity="0.85" transform={`rotate(${c.a} ${c.x} ${c.y})`} />
      ))}

      {/* birrete: salta al pasar el ratón */}
      <g className="art-h-jump" style={{ '--jump': '-6px' }}>
        {/* casquete */}
        <path d="M18 31.6 V46.4 C18 52.4 28.6 57 40 57 C51.4 57 62 52.4 62 46.4 V31.6 C55 34.6 47 38 40 41 C33 38 25 34.6 18 31.6 Z" fill={url('cap')} />
        <path d="M18 32 C25 35 33 38.4 40 41.4 C47 38.4 55 35 62 32 V37 C55 40 47 43.4 40 46.4 C33 43.4 25 40 18 37 Z" fill={url('under')} />
        <path d="M18 44.4 C18 50.4 28.6 55 40 55 C51.4 55 62 50.4 62 44.4 V46.4 C62 52.4 51.4 57 40 57 C28.6 57 18 52.4 18 46.4 Z" fill="#6366F1" opacity="0.55" />
        <path d="M19.6 47.4 C20.6 51.8 29.6 55.4 40 55.6 C50.4 55.4 59.4 51.8 60.4 47.4" stroke="#fff" strokeOpacity="0.32" strokeWidth="0.55" strokeDasharray="1.2 1.1" />
        <path d="M19.2 38 V46 C19.2 48.6 20.6 50.6 22.8 52.2" stroke="#fff" strokeOpacity="0.38" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M52 54.4 C57.6 52.6 61 50 61.2 46.4 V40" stroke="#0F0A32" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />

        {/* tablero */}
        <path d="M8 25.5 L40 39 L40 41.6 L8 28.1 Z" fill="#312E81" />
        <path d="M40 39 L72 25.5 L72 28.1 L40 41.6 Z" fill="#1E1B4B" />
        <path d="M40 12 L72 25.5 L40 39 L8 25.5 Z" fill={url('board')} />
        <path d="M40 12 L8 25.5 L40 25.5 Z" fill="#fff" opacity="0.1" />
        <ellipse cx="27" cy="20.6" rx="12" ry="1.8" transform="rotate(-22.9 27 20.6)" fill={url('gloss')} />
        <path d="M8.6 25.4 L39.6 12.3" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M40.4 12.3 L71.4 25.4" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M8.6 25.9 L40 39.1" stroke="#A5B4FC" strokeOpacity="0.5" strokeWidth="0.5" />

        {/* cordón sobre el tablero y botón */}
        <path d="M40 25.5 C47 25.9 56 27.4 63.6 29.2" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M40 25.3 C47 25.7 56 27.2 63.6 29" stroke={url('goldV')} strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="40" cy="26.1" rx="3.1" ry="1.9" fill="#78350F" opacity="0.5" />
        <ellipse cx="40" cy="25.4" rx="3.1" ry="1.9" fill={url('gold')} />
        <ellipse cx="39.1" cy="24.8" rx="1.2" ry="0.6" fill="#fff" opacity="0.85" />

        {/* borla: se mece en reposo y se balancea en hover */}
        <g className="art-h-ring art-o-top">
          <g className="art-i-sway art-o-top" style={{ '--amp': '3deg', '--dur': '4.4s' }}>
            <path d="M63.7 29 V45" stroke="#B45309" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M63.5 29.2 V45" stroke="#FDE68A" strokeWidth="0.7" strokeLinecap="round" />
            <path d="M61 48 C61 47 62 46.4 63.7 46.4 C65.4 46.4 66.4 47 66.4 48 L67.6 59.4 C66 60.6 61.4 60.6 59.8 59.4 Z" fill={url('goldV')} />
            {[61.6, 62.9, 64.2, 65.5].map((x, i) => (
              <path key={x} d={`M${x + 0.1} 48.6 L${x - 0.6 + i * 0.5} 59.6`} stroke="#92400E" strokeOpacity="0.45" strokeWidth="0.45" />
            ))}
            <ellipse cx="63.7" cy="46.4" rx="2.6" ry="2.3" fill={url('gold')} />
            <ellipse cx="62.9" cy="45.6" rx="0.9" ry="0.7" fill="#fff" opacity="0.8" />
          </g>
        </g>
      </g>

      {/* confeti que estalla al pasar el ratón */}
      <g className="art-h-burst" style={{ '--d': '.08s' }}>
        {CONFETTI.map((c) => (
          <rect key={`b${c.x}`} x={c.x - c.w / 2} y={c.y - c.h / 2} width={c.w} height={c.h} rx="0.5" fill={c.c} transform={`rotate(${c.a + 40} ${c.x} ${c.y})`} />
        ))}
      </g>

      {/* destellos */}
      <Sparkle x={70} y={56} r={2.6} idle delay={0.3} />
      <Sparkle x={9} y={60} r={2.2} fill="#FEF3C7" idle delay={1.6} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={40} y={5} r={3} fill="#FDE68A" /></g>
    </svg>
  );
};

/* ==========================================================================
   1º Bachillerato — Telescopio sobre trípode ante una ventana de cielo
   nocturno con luna, Casiopea y estrellas.
   Hover: el tubo se eleva, cruza una estrella fugaz, la constelación se
   ilumina y la luna crece. Reposo: brilla la luna y titilan dos estrellas.
   ========================================================================== */
const SKY_STARS = [
  [24, 30, 0.6], [29, 40, 0.55], [50, 24, 0.7], [66, 26, 0.6], [45, 30, 0.5],
  [38, 9, 0.6], [64, 34, 0.55], [23, 38, 0.45], [57, 38, 0.5], [52, 8.6, 0.5], [40, 34, 0.45],
];
const CASSIOPEIA = [[26.6, 19], [31.6, 24.4], [36.6, 18.4], [41.6, 23.6], [46.4, 15.6]];

const Telescope = () => {
  const [id, url] = useArtIds();
  const cas = `M${CASSIOPEIA.map((p) => p.join(' ')).join(' L')}`;
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#022c22" opacity={0.5} />
        <radialGradient id={id('sky')} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
        <MaterialGradient id={id('moon')} light="#FFFBEB" base="#FDE68A" dark="#F59E0B" />
        <GlowGradient id={id('moonGlow')} color="#FEF3C7" opacity={0.55} />
        <MaterialGradient id={id('tube')} light="#FFFFFF" base="#E0E7FF" dark="#818CF8" x1={0.5} y1={0} x2={0.5} y2={1} />
        <MaterialGradient id={id('dew')} light="#A5B4FC" base="#4F46E5" dark="#1E1B4B" x1={0.5} y1={0} x2={0.5} y2={1} />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0.5} y1={0} x2={0.5} y2={1} />
        <MaterialGradient id={id('leg')} light="#94A3B8" base="#475569" dark="#1E293B" />
        <MaterialGradient id={id('head')} light="#818CF8" base="#3730A3" dark="#1E1B4B" />
        <linearGradient id={id('lens')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id={id('trail')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('window')}><circle cx="44" cy="30" r="24.4" /></clipPath>
      </defs>

      {/* aura */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />

      {/* escena ampliada un 4 % y centrada */}
      <g transform="matrix(1.04 0 0 1.04 -4.1 -1.6)">
      <ellipse cx="38.5" cy="70" rx="21" ry="2.8" fill={url('shadow')} />

      {/* ventana de cielo nocturno */}
      <circle cx="44" cy="30" r="25.6" fill="#fff" opacity="0.22" />
      <circle cx="44" cy="30" r="24.4" fill={url('sky')} />
      <g clipPath={url('window')}>
        <ellipse cx="44" cy="30" rx="34" ry="6" transform="rotate(-38 44 30)" fill="#fff" opacity="0.08" />
        {SKY_STARS.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.85" />)}
        {/* Casiopea */}
        <path d={cas} stroke="#fff" strokeOpacity="0.38" strokeWidth="0.5" strokeLinejoin="round" />
        <g className="art-h-show">
          <path d={cas} stroke="#A5F3FC" strokeWidth="0.8" strokeLinejoin="round" />
          {CASSIOPEIA.map(([x, y]) => <circle key={`g${x}`} cx={x} cy={y} r="2.4" fill={url('moonGlow')} />)}
        </g>
        {CASSIOPEIA.map(([x, y]) => <circle key={`c${x}`} cx={x} cy={y} r="1.05" fill="#FEF9C3" />)}
        <Sparkle x={36.6} y={18.4} r={2.4} fill="#FEF9C3" idle delay={0.2} />
        <Sparkle x={24} y={30} r={1.9} idle delay={1.5} />

        {/* luna creciente, justo donde apunta el telescopio */}
        <g className="art-i-glow" style={{ '--lo': 0.5, '--hi': 1, '--dur': '4s' }}>
          <circle cx="57" cy="15.5" r="9.5" fill={url('moonGlow')} />
        </g>
        <g className="art-h-pop" style={{ '--pop': 1.15 }}>
          <path d="M61.57 17.53 A5 5 0 1 1 56.33 10.54 A4.4 4.4 0 0 0 61.57 17.53 Z" fill={url('moon')} />
          <circle cx="54.6" cy="16.1" r="0.8" fill="#F59E0B" opacity="0.35" />
          <circle cx="55.8" cy="18.7" r="0.55" fill="#F59E0B" opacity="0.3" />
        </g>

        {/* estrella fugaz (hover): cruza el cielo libre de la izquierda */}
        <g className="art-h-show">
          <g transform="rotate(-30 35 30.6)">
            <g className="art-h-slide" style={{ '--slide': '-8px' }}>
              <path d="M35 30 L47 30.5 L47 30.7 L35 31.2 Z" fill={url('trail')} />
              <Sparkle x={35} y={30.6} r={2.2} />
            </g>
          </g>
        </g>
      </g>
      <circle cx="44" cy="30" r="24.4" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M23.4 21.6 A22.6 22.6 0 0 1 36.6 8.8" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" strokeLinecap="round" />

      {/* trípode */}
      <path d="M37.2 54 H38.8 L39.6 66.4 H36.6 Z" fill="#1E293B" />
      <path d="M36.2 53.4 L38.6 54.6 L24.8 69.6 L21.8 68.8 Z" fill={url('leg')} />
      <path d="M37.4 54.6 L39.8 53.4 L54.2 68.8 L51.2 69.6 Z" fill={url('leg')} />
      <path d="M36.6 54.4 L22.8 68.6" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M38.6 54 L52.6 68.4" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M30.4 62.6 H46.6" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="23.2" cy="69.4" rx="2.4" ry="0.9" fill="#1E293B" />
      <ellipse cx="52.8" cy="69.4" rx="2.4" ry="0.9" fill="#1E293B" />
      <circle cx="38" cy="54" r="2.6" fill={url('head')} />
      <circle cx="37.2" cy="53.2" r="0.8" fill="#fff" opacity="0.5" />
      <path d="M34.6 48.4 H41.4 L40.4 53.6 H35.6 Z" fill={url('head')} />
      <circle cx="41.8" cy="51" r="1.3" fill={url('gold')} />

      {/* tubo: se eleva al pasar el ratón (pivota en la montura) */}
      <g className="art-h-tilt" style={{ '--tilt': '-7deg', transformBox: 'view-box', transformOrigin: '38px 44px' }}>
        <g transform="rotate(-30 38 44)">
          {/* ocular */}
          <rect x="17.4" y="33.8" width="3.2" height="7.6" rx="0.8" fill={url('head')} />
          <rect x="16.8" y="32.6" width="4.4" height="2" rx="0.8" fill={url('gold')} />
          <rect x="15.6" y="40.4" width="3.8" height="7.2" rx="1.2" fill={url('head')} />
          <rect x="18.6" y="40.8" width="2.6" height="6.4" fill="#94A3B8" />
          {/* tubo principal */}
          <rect x="20.6" y="39.4" width="31.4" height="9.2" rx="2" fill={url('tube')} />
          <rect x="20.6" y="45.6" width="31.4" height="3" rx="1.5" fill="#4338CA" opacity="0.22" />
          <rect x="22" y="40.4" width="28.6" height="1.5" rx="0.75" fill="#fff" />
          <rect x="26" y="39" width="2.2" height="10" rx="0.6" fill={url('gold')} />
          <rect x="35.4" y="38.8" width="5.2" height="10.4" rx="0.8" fill="#94A3B8" />
          <rect x="35.4" y="39.2" width="5.2" height="1.2" rx="0.6" fill="#fff" opacity="0.6" />
          <rect x="45.4" y="39" width="2.2" height="10" rx="0.6" fill={url('gold')} />
          {/* buscador */}
          <rect x="31" y="36.4" width="1.4" height="3.2" fill="#64748B" />
          <rect x="38.6" y="36.4" width="1.4" height="3.2" fill="#64748B" />
          <rect x="29.4" y="33.2" width="12.6" height="3.6" rx="1.4" fill={url('tube')} />
          <rect x="30.4" y="33.8" width="10" height="0.8" rx="0.4" fill="#fff" />
          <rect x="41.4" y="32.8" width="1.8" height="4.4" rx="0.6" fill={url('head')} />
          {/* parasol y objetivo */}
          <rect x="51.6" y="38" width="12.4" height="12" rx="1.6" fill={url('dew')} />
          <rect x="52.6" y="39" width="10.2" height="1.3" rx="0.65" fill="#fff" opacity="0.5" />
          <rect x="62.6" y="37.4" width="2.4" height="13.2" rx="0.9" fill={url('gold')} />
          <ellipse cx="65.2" cy="44" rx="1.5" ry="5.8" fill={url('lens')} />
          <ellipse cx="65" cy="41.4" rx="0.5" ry="1.6" fill="#fff" opacity="0.85" />
        </g>
      </g>
      </g>

      {/* destellos */}
      <Sparkle x={9} y={24} r={2.6} opacity={0.9} />
      <Sparkle x={73} y={60} r={2} fill="#FEF3C7" opacity={0.85} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={72} y={10} r={3} fill="#FEF9C3" /></g>
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={10} y={50} r={2.4} /></g>
    </svg>
  );
};

/* ==========================================================================
   2º Bachillerato — Título enrollado con sello dorado y cintas.
   Hover: el pergamino se endereza, el rodillo inferior se desenrolla, aparece
   la firma, el sello crece girando y las cintas ondean.
   Reposo: el brillo del sello late y titilan dos destellos.
   ========================================================================== */
const ROSETTE = rosettePath(53, 53, 7.2, 9.8, 16);

const Diploma = () => {
  const [id, url] = useArtIds();
  const roll = (y) => (
    <>
      <rect x="15" y={y} width="46" height="7.4" rx="3.7" fill={url('roll')} />
      <rect x="18" y={y + 1} width="40" height="1.4" rx="0.7" fill="#fff" opacity="0.75" />
      <ellipse cx="15.6" cy={y + 3.7} rx="1.9" ry="3.6" fill={url('rollEnd')} />
      <path d={`M15.6 ${y + 2.2} a1.4 1.5 0 1 1 -0.8 2.6`} stroke="#B45309" strokeOpacity="0.6" strokeWidth="0.5" strokeLinecap="round" />
      <ellipse cx="60.4" cy={y + 3.7} rx="1.9" ry="3.6" fill={url('rollEnd')} />
      <path d={`M60.4 ${y + 2.2} a1.4 1.5 0 1 1 -0.8 2.6`} stroke="#B45309" strokeOpacity="0.6" strokeWidth="0.5" strokeLinecap="round" />
    </>
  );
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#042f2e" opacity={0.48} />
        <MaterialGradient id={id('paper')} light="#FFFFFF" base="#FFFBEB" dark="#FDE7B0" />
        <ShadeGradient id={id('paperShade')} color="#B45309" opacity={0.28} />
        <MaterialGradient id={id('roll')} light="#FFFDF5" base="#F7E3B5" dark="#C08A3E" x1={0.5} y1={0} x2={0.5} y2={1} />
        <MaterialGradient id={id('rollEnd')} light="#FDF0D0" base="#E9C98A" dark="#B7791F" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <SphereGradient id={id('goldDisc')} light="#FFFBEB" base="#FCD34D" dark="#D97706" />
        <MaterialGradient id={id('ribbon')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <GlossGradient id={id('gloss')} opacity={0.75} />
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="40" cy="71.4" rx="24" ry="3" fill={url('shadow')} />

      {/* pergamino: se endereza en hover */}
      <g className="art-h-tilt-r" style={{ '--tilt': '5deg' }}>
        <g transform="rotate(-7 40 40)">
          {/* hoja (más larga de lo visible: el rodillo inferior la tapa) */}
          <rect x="19" y="15" width="38" height="49" fill={url('paper')} />
          <rect x="51" y="15" width="6" height="49" fill={url('paperShade')} />
          <rect x="19" y="15" width="1.2" height="49" fill="#fff" />
          <rect x="22.4" y="20.4" width="31.2" height="34.4" rx="1.4" stroke="#D97706" strokeOpacity="0.7" strokeWidth="0.8" />
          <rect x="23.8" y="21.8" width="28.4" height="31.6" rx="1" stroke="#D97706" strokeOpacity="0.32" strokeWidth="0.45" />
          {/* emblema */}
          {[1, -1].map((m) => (
            <g key={m} transform={m < 0 ? 'matrix(-1 0 0 1 76 0)' : undefined}>
              <path d="M33.4 24.4 C32.6 27.4 33.6 30 36 31" stroke="#059669" strokeWidth="0.55" strokeLinecap="round" />
              <ellipse cx="32.7" cy="25.6" rx="0.75" ry="1.5" transform="rotate(-12 32.7 25.6)" fill="#10B981" />
              <ellipse cx="32.8" cy="28.2" rx="0.75" ry="1.5" transform="rotate(-38 32.8 28.2)" fill="#10B981" />
              <ellipse cx="34.4" cy="30.4" rx="0.7" ry="1.4" transform="rotate(-68 34.4 30.4)" fill="#10B981" />
            </g>
          ))}
          <path d={starPath(38, 27.4, 3.6)} fill={url('gold')} />
          <path d={starFacets(38, 27.4, 3.6, 1.55, STAR_LIT)} fill="#fff" opacity="0.45" />
          {/* título y texto */}
          <rect x="28" y="33.4" width="20" height="2" rx="1" fill="#4338CA" opacity="0.85" />
          {[38.2, 41.6, 45].map((y, i) => (
            <path key={y} d={`M26 ${y} H${i === 2 ? 42 : 50}`} stroke="#64748B" strokeOpacity="0.42" strokeWidth="0.9" strokeLinecap="round" />
          ))}
          <path d="M25 51.4 H37" stroke="#94A3B8" strokeWidth="0.6" strokeLinecap="round" />
          {/* firma (hover) */}
          <g className="art-h-show">
            <path d="M25.6 50.6 C26.6 47 27.8 46.4 27.8 49 C27.8 51.2 28.8 50.8 30 48.2 C30.8 46.6 31.8 47.2 31.2 49.2 C30.8 50.8 32.2 50.6 33.6 48.8 C34.4 47.8 35.4 47.8 36.8 48.6" stroke="#4338CA" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* rodillo superior */}
          {roll(9.6)}
          {/* rodillo inferior: se desenrolla en hover */}
          <g className="art-h-drop" style={{ '--drop': '4.5px' }}>
            {roll(56.4)}
          </g>
        </g>
      </g>

      {/* cintas del sello: ondean en hover */}
      <g className="art-h-wiggle art-o-top">
        <path d="M48.4 56.4 L53 58 L50.2 72 L48.2 69.8 L45.6 71.4 Z" fill={url('ribbon')} />
        <path d="M53 58 L57.8 56.4 L61.6 71.2 L59.1 69.6 L57 71.8 Z" fill={url('ribbon')} />
        <path d="M50.4 58 L48 69.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M55.6 58 L58.8 69.6" stroke="#831843" strokeOpacity="0.35" strokeWidth="0.6" strokeLinecap="round" />
      </g>

      {/* sello: crece y gira */}
      <g className="art-h-pop" style={{ '--pop': 1.16 }}>
        <g className="art-h-spin" style={{ '--spin': '45deg' }}>
          <path d={ROSETTE} fill={url('gold')} />
        </g>
        <circle cx="53" cy="53" r="6" fill="#B45309" opacity="0.5" />
        <circle cx="53" cy="53" r="5.5" fill={url('goldDisc')} />
        <circle cx="53" cy="53" r="4.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.45" strokeDasharray="0.7 0.8" />
        <path d={starPath(53, 53.2, 3)} fill="#B45309" opacity="0.75" />
        <path d={starPath(52.8, 52.8, 3)} fill="#FFFBEB" />
        <g className="art-i-glow" style={{ '--lo': 0.35, '--hi': 0.95, '--dur': '3.4s' }}>
          <ellipse cx="50.6" cy="49.6" rx="3.2" ry="1.6" transform="rotate(-35 50.6 49.6)" fill={url('gloss')} />
        </g>
      </g>

      {/* destellos */}
      <Sparkle x={10} y={20} r={3} idle delay={0.2} />
      <Sparkle x={70} y={30} r={2.4} fill="#FEF3C7" idle delay={1.4} />
      <Sparkle x={66} y={8} r={1.8} opacity={0.85} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={67} y={46} r={3} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={9} y={56} r={2.4} /></g>
    </svg>
  );
};

/* ==========================================================================
   Atención a la Diversidad — Dos manos (dos tonos de piel) sostienen un
   corazón de puzle de piezas distintas que encajan; arriba, un bocadillo
   (comunicación) y una bombilla (ideas).
   Hover: el corazón late, las manos lo elevan, la bombilla se enciende con
   rayos y el bocadillo salta. Reposo: el halo del corazón y la bombilla laten.
   ========================================================================== */
const HAND = 'M41 61 C35 62.6 27 61.4 21.2 56.6 C19 54.6 17.8 51.4 17.4 48.4 C17 45.4 13.6 44 12 46.4 C10.6 48.8 10.8 54.4 15.4 59.8 C19 64 24 67.4 28.4 69.4 L38.8 67.4 C39.4 64.6 40 62.6 41 61 Z';
const THUMB = 'M25.4 60.2 C24.2 57.2 25.2 53.8 27.6 52.4 C29.2 51.6 30.6 52.8 30 54.6 C29.4 56.6 29.4 58.4 30 60.2 Z';

const Inclusion = () => {
  const [id, url] = useArtIds();
  const hand = (skin, sleeve) => (
    <>
      <path d="M27.4 68.6 C31.4 69.6 35.8 68.8 39.8 66.8 L40.6 76.6 C36.2 77.6 30.8 77.6 26.4 76.6 Z" fill={sleeve} />
      <path d="M27.4 68.6 C31.4 69.6 35.8 68.8 39.8 66.8 L40 69.4 C36 71.2 31.4 72 27.2 71 Z" fill="#fff" opacity="0.35" />
      <path d={HAND} fill={skin} />
      <path d="M12.2 48.6 C11.8 52.6 13.4 56.6 16.8 60" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M12.2 51.6 C14.4 52.4 16.4 52 18 51 M13.6 55.8 C15.8 56.6 18.2 56 20 54.6 M17.2 60 C19.4 60.8 21.8 60 23.6 58.4" stroke="#7C2D12" strokeOpacity="0.42" strokeWidth="0.7" strokeLinecap="round" />
      <path d={THUMB} fill={skin} />
      <path d="M27.4 53.6 C28.4 53 29.2 53.4 29 54.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M26 60.2 C24.8 57.6 25.4 55 27 53.6" stroke="#7C2D12" strokeOpacity="0.2" strokeWidth="0.6" strokeLinecap="round" />
    </>
  );
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <GlowGradient id={id('halo')} color="#FDF2F8" opacity={0.7} mid={0.4} />
        <MaterialGradient id={id('pink')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('amber')} light="#FEF3C7" base="#FBBF24" dark="#C2410C" />
        <MaterialGradient id={id('skinA')} light="#FFE8D6" base="#F7C29C" dark="#D08A5C" />
        <MaterialGradient id={id('skinB')} light="#D9A27A" base="#A86B45" dark="#6E3F22" x1={0.85} x2={0.15} />
        <MaterialGradient id={id('sleeveA')} light="#C4B5FD" base="#8B5CF6" dark="#5B21B6" />
        <MaterialGradient id={id('sleeveB')} light="#A5B4FC" base="#6366F1" dark="#3730A3" x1={0.85} x2={0.15} />
        <MaterialGradient id={id('bubble')} light="#FFFFFF" base="#F5F3FF" dark="#C4B5FD" />
        <SphereGradient id={id('bulb')} light="#FFFBEB" base="#FDE68A" dark="#F59E0B" />
        <GlowGradient id={id('bulbGlow')} color="#FEF3C7" opacity={0.9} mid={0.3} />
        <MaterialGradient id={id('steel')} light="#F8FAFC" base="#CBD5E1" dark="#64748B" x1={0} y1={0.5} x2={1} y2={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.8} />
        <ShadowGradient id={id('palm')} color="#431407" opacity={0.35} />
      </defs>

      {/* aura */}
      <circle cx="40" cy="42" r="37" fill={url('aura')} />

      {/* bombilla: se enciende con rayos */}
      <g className="art-i-glow" style={{ '--lo': 0.4, '--hi': 1, '--dur': '3.2s' }}>
        <circle cx="63" cy="15" r="12" fill={url('bulbGlow')} />
      </g>
      <g className="art-h-show">
        {[-150, -110, -70, -30, 10, -190].map((a) => {
          const c = Math.cos(rad(a));
          const s = Math.sin(rad(a));
          return <line key={a} x1={f2(63 + 9.4 * c)} y1={f2(14.6 + 9.4 * s)} x2={f2(63 + 12.4 * c)} y2={f2(14.6 + 12.4 * s)} stroke="#FEF3C7" strokeWidth="1.3" strokeLinecap="round" />;
        })}
      </g>
      <g className="art-h-pop" style={{ '--pop': 1.12 }}>
        <path d="M63 7.4 C67 7.4 70.2 10.6 70.2 14.4 C70.2 17 68.8 18.6 67.6 20 C66.8 21 66.4 21.8 66.4 23 H59.6 C59.6 21.8 59.2 21 58.4 20 C57.2 18.6 55.8 17 55.8 14.4 C55.8 10.6 59 7.4 63 7.4 Z" fill={url('bulb')} />
        <path d="M61.6 22.8 L61 17.2 M64.4 22.8 L65 17.2" stroke="#B45309" strokeOpacity="0.5" strokeWidth="0.5" />
        <path d="M61 17.2 C61.4 15.4 62.2 15.4 62.4 16.8 C62.6 18.2 63.4 18.2 63.6 16.8 C63.8 15.4 64.6 15.4 65 17.2" stroke="#C2410C" strokeWidth="0.75" strokeLinecap="round" />
        <circle cx="63" cy="16.6" r="2.2" fill="#fff" opacity="0.45" />
        <ellipse cx="60.4" cy="11.6" rx="1.6" ry="2.6" transform="rotate(30 60.4 11.6)" fill="#fff" opacity="0.85" />
        <rect x="59.4" y="23" width="7.2" height="1.8" rx="0.9" fill={url('steel')} />
        <rect x="59.8" y="24.6" width="6.4" height="1.6" rx="0.8" fill="#94A3B8" />
        <path d="M61 26.2 H65 L64 28 H62 Z" fill="#475569" />
      </g>

      {/* bocadillo: salta en hover */}
      <g className="art-h-jump" style={{ '--jump': '-4px' }}>
        <path d="M12.6 6.4 H21.4 C24.7 6.4 27.4 9.1 27.4 12.4 V14.8 C27.4 18.1 24.7 20.8 21.4 20.8 H21 L24.2 25.6 L15.6 20.8 H12.6 C9.3 20.8 6.6 18.1 6.6 14.8 V12.4 C6.6 9.1 9.3 6.4 12.6 6.4 Z" fill={url('bubble')} />
        <path d="M8.4 11.6 C8.8 9.4 10.6 8 12.8 8 H20" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M27.2 15.4 C26.8 18.4 24.4 20.6 21.4 20.8" stroke="#7C3AED" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
        <circle cx="12" cy="13.6" r="1.75" fill="#EC4899" />
        <circle cx="17" cy="13.6" r="1.75" fill="#F59E0B" />
        <circle cx="22" cy="13.6" r="1.75" fill="#0891B2" />
      </g>

      {/* halo del corazón: late en reposo */}
      <g className="art-i-pulse" style={{ '--amp': 1.08, '--dur': '3s' }}>
        <circle cx="40" cy="40" r="21" fill={url('halo')} />
      </g>

      {/* manos: elevan el corazón */}
      <g className="art-h-lift" style={{ '--lift': '-2px' }}>
        {hand(url('skinA'), url('sleeveA'))}
        <g transform="matrix(-1 0 0 1 80 0)">{hand(url('skinB'), url('sleeveB'))}</g>
        <ellipse cx="40" cy="61.6" rx="9" ry="1.5" fill={url('palm')} />
      </g>

      {/* corazón de puzle: late */}
      <g className="art-h-pop" style={{ '--pop': 1.12 }}>
        <path d="M40 29.6 C41.8 26.4 45 24.2 48.8 24.2 C53.8 24.2 58 28.3 58 33.8 C58 42.8 50 49 40 56 Z" fill={url('amber')} />
        <path d="M40 29.6 C38.2 26.4 35 24.2 31.2 24.2 C26.2 24.2 22 28.3 22 33.8 C22 42.8 30 49 40 56 L40 42.8 C43.2 44 46.4 41.8 46.4 39.2 C46.4 36.6 43.2 34.4 40 35.6 Z" fill={url('pink')} />
        <path d="M58 33.8 C58 42.8 50 49 40 56 L40 52.8 C48 46.8 54.4 41.6 55.6 33.4 Z" fill="#9A3412" opacity="0.25" />
        <path d="M22.6 37.6 C24.6 44 31 49 40 56 L40 53 C32.4 47.6 26.4 43.4 22.6 37.6 Z" fill="#831843" opacity="0.22" />
        <path d="M40 29.6 V35.6 C43.2 34.4 46.4 36.6 46.4 39.2 C46.4 41.8 43.2 44 40 42.8 V56" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M23.2 36 C22.6 30.6 25.8 26.2 30.4 25.6" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="29" cy="30.4" rx="3.8" ry="2.2" transform="rotate(-35 29 30.4)" fill={url('gloss')} />
        <ellipse cx="51.4" cy="29.4" rx="2.6" ry="1.4" transform="rotate(-25 51.4 29.4)" fill="#fff" opacity="0.55" />
      </g>

      {/* destellos */}
      <Sparkle x={72} y={36} r={2.6} idle delay={0.5} />
      <Sparkle x={8} y={36} r={2.2} fill="#FEF3C7" idle delay={1.7} />
      <Sparkle x={70} y={56} r={1.6} opacity={0.8} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={40} y={13} r={3} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={9} y={52} r={2.2} /></g>
    </svg>
  );
};

const ICONS = {
  'eso-1': Microscope,
  'eso-2': MagicBook,
  'eso-3': Atom,
  'eso-4': GradCap,
  'bachillerato-1': Telescope,
  'bachillerato-2': Diploma,
  'ad-1': Inclusion,
};

export default ICONS;
