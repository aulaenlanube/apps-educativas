// Ilustraciones de las tarjetas de curso de Primaria (rediseño 2026).
// Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: primaria-1, primaria-2, primaria-3, primaria-4, primaria-5, primaria-6
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

/* 1º Primaria — Mochila escolar con lápiz y regla.
   Hover: el lápiz sale hacia arriba, la regla se inclina, la estrella gira y
   saltan chispas. Reposo (nivel alto): solo titilan los destellos. */
const Backpack = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <ShadowGradient id={id('shadow')} color="#4a0424" opacity={0.42} />
        <MaterialGradient id={id('body')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('flap')} light="#F9A8D4" base="#DB2777" dark="#831843" />
        <MaterialGradient id={id('pocket')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('pencil')} light="#BBF7D0" base="#22C55E" dark="#166534" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('ruler')} light="#DBEAFE" base="#60A5FA" dark="#1D4ED8" x1={0} y1={0.5} x2={1} y2={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.75} />
        <linearGradient id={id('core')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#500724" stopOpacity="0" />
          <stop offset="100%" stopColor="#500724" stopOpacity="0.42" />
        </linearGradient>
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="42" r="37" fill={url('aura')} />
      <ellipse cx="40" cy="71.5" rx="25" ry="3.6" fill={url('shadow')} />

      {/* regla (detrás, asoma por la izquierda) */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-12deg' }}>
        <g transform="rotate(-9 26 20)">
          <rect x="22.5" y="3" width="7" height="22" rx="1.4" fill={url('ruler')} />
          <rect x="22.5" y="3" width="2" height="22" rx="1" fill="#fff" opacity="0.45" />
          {[6, 9, 12, 15, 18].map((y, i) => (
            <line key={y} x1="29.5" y1={y} x2={i % 2 ? 27.2 : 25.8} y2={y} stroke="#1E3A8A" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* lápiz (detrás, asoma por la derecha) */}
      <g className="art-h-lift" style={{ '--lift': '-6px' }}>
        <g transform="rotate(11 54 14)">
          <path d="M50.5 6.5 L53.8 1.2 L57 6.5 Z" fill="#FCD9A8" />
          <path d="M52.6 3.2 L53.8 1.2 L55 3.2 Z" fill="#334155" />
          <rect x="50.5" y="6.5" width="6.5" height="15" fill={url('pencil')} />
          <rect x="52.6" y="6.5" width="1.4" height="15" fill="#fff" opacity="0.35" />
          <rect x="50.5" y="21" width="6.5" height="2.2" fill="#CBD5E1" />
          <rect x="50.5" y="21" width="6.5" height="0.7" fill="#fff" opacity="0.7" />
        </g>
      </g>

      {/* asa superior */}
      <path d="M33 18.5 C33 9.5 47 9.5 47 18.5" stroke="#831843" strokeWidth="4" strokeLinecap="round" />
      <path d="M34.4 17 C34.6 11.6 45.4 11.6 45.6 17" stroke="#F9A8D4" strokeWidth="1.3" strokeLinecap="round" />

      {/* cuerpo */}
      <path d="M25 17 C19 17 16 21 16 28 L15.2 59 C15.2 65.2 19 69 25 69 L55 69 C61 69 64.8 65.2 64.8 59 L64 28 C64 21 61 17 55 17 Z" fill={url('body')} />
      {/* sombra propia (lado derecho) y borde de luz (izquierdo) */}
      <path d="M54 17 C60.5 17 64 21 64 28 L64.8 59 C64.8 65.2 61 69 55 69 L50 69 C55.6 67 58.6 63.2 58.6 57.6 L58.8 27 C58.8 22 57.2 18.6 54 17 Z" fill={url('core')} />
      <path d="M18.4 31 L17.7 58" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />

      {/* correas de compresión laterales con hebilla */}
      <rect x="15.6" y="44" width="4" height="13" rx="1.6" fill="#9D174D" />
      <rect x="15.4" y="48.4" width="4.4" height="3.2" rx="1" fill={url('gold')} />
      <rect x="60.4" y="44" width="4" height="13" rx="1.6" fill="#831843" />
      <rect x="60.2" y="48.4" width="4.4" height="3.2" rx="1" fill={url('gold')} />

      {/* solapa */}
      <path d="M16.6 30 C16.2 22 19.6 17 25 17 L55 17 C60.4 17 63.8 22 63.4 30 C63 35.6 59.4 38.4 54 38.4 L26 38.4 C20.6 38.4 17 35.6 16.6 30 Z" fill={url('flap')} />
      <path d="M20.4 29.6 C20.4 23.8 22.6 20.6 26.4 20.6 L53.6 20.6 C57.4 20.6 59.6 23.8 59.6 29.6 C59.4 33 57.2 35 53.6 35 L26.4 35 C22.8 35 20.6 33 20.4 29.6 Z" stroke="#fff" strokeOpacity="0.42" strokeWidth="0.8" strokeDasharray="1.6 1.4" />
      <path d="M23 20.4 C28 18.7 36 18.3 44 18.6" stroke={url('gloss')} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 31.5 C18.4 36 21.4 38.2 26 38.4 L54 38.4 C58.6 38.2 61.6 36 63 31.5" stroke="#500724" strokeOpacity="0.25" strokeWidth="1.2" />

      {/* tiras de la solapa con hebillas */}
      {[29, 51].map((x) => (
        <g key={x}>
          <rect x={x - 2.4} y="34" width="4.8" height="11.5" rx="1.4" fill="#BE185D" />
          <rect x={x - 2.4} y="34" width="1.4" height="11.5" rx="0.7" fill="#fff" opacity="0.28" />
          <rect x={x - 3.4} y="42.4" width="6.8" height="4.2" rx="1.2" fill={url('gold')} />
          <rect x={x - 1.8} y="43.6" width="3.6" height="1.8" rx="0.6" fill="#92400E" opacity="0.55" />
        </g>
      ))}

      {/* bolsillo frontal */}
      <rect x="22" y="45.5" width="36" height="19.5" rx="7.5" fill={url('pocket')} />
      <rect x="22.6" y="46.1" width="34.8" height="18.3" rx="7" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M50 64.6 C54.6 64.2 57.4 61.4 57.6 57" stroke="#1E1B4B" strokeOpacity="0.3" strokeWidth="1.4" strokeLinecap="round" />
      {/* cremallera */}
      <line x1="26" y1="49.6" x2="54" y2="49.6" stroke="#E0E7FF" strokeWidth="1.5" strokeLinecap="round" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={27 + i * 2.1} y1="48.7" x2={27 + i * 2.1} y2="50.5" stroke="#312E81" strokeOpacity="0.55" strokeWidth="0.6" />
      ))}
      <g className="art-h-wiggle art-o-top">
        <rect x="51.6" y="48.6" width="3.4" height="2.2" rx="0.8" fill={url('gold')} />
        <path d="M52.1 50.6 L54.5 50.6 L54.1 55.4 Q53.3 56.6 52.5 55.4 Z" fill={url('gold')} />
        <circle cx="53.3" cy="54" r="0.8" fill="#92400E" opacity="0.6" />
      </g>

      {/* estrella del bolsillo */}
      <g className="art-h-spin" style={{ '--spin': '144deg' }}>
        <path d="M40 51.4 L41.9 55.2 L46.1 55.8 L43.05 58.75 L43.75 62.9 L40 60.9 L36.25 62.9 L36.95 58.75 L33.9 55.8 L38.1 55.2 Z" fill={url('gold')} />
        <path d="M40 51.4 L41.9 55.2 L46.1 55.8 L43.05 58.75 L40 57.4 Z" fill="#FEF3C7" opacity="0.55" />
        <path d="M40 60.9 L36.25 62.9 L36.95 58.75 L40 57.4 L43.05 58.75 L43.75 62.9 Z" fill="#92400E" opacity="0.22" />
      </g>

      {/* destellos: titilan en reposo; los de hover estallan */}
      <Sparkle x={8} y={22} r={3.2} idle delay={0} />
      <Sparkle x={72.5} y={31} r={2.4} fill="#FEF3C7" idle delay={1.1} />
      <Sparkle x={71} y={62} r={2} idle delay={2.1} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={9} y={50} r={2.6} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.18s' }}><Sparkle x={66} y={8} r={2.8} /></g>
    </svg>
  );
};

/* ---------- utilidades de trazado (se calculan una vez, al cargar el módulo) ---------- */
const r2 = (n) => Math.round(n * 100) / 100;
const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
};
// Trazo de "letra manuscrita": ondas alternas sobre una línea del cuaderno.
const scribble = (x, y, n, amp = 2, step = 1.6) =>
  `M${x} ${y} q${step / 2} ${-amp} ${step} 0${` t${step} 0`.repeat(n - 1)}`;
// Estrella de 5 puntas centrada en (cx, cy).
const starPath = (cx, cy, R, r = R * 0.46) =>
  `M${Array.from({ length: 10 }, (_, i) => polar(cx, cy, i % 2 ? r : R, -90 + i * 36).join(' ')).join(' L')} Z`;

/* 2º Primaria — Cuaderno de espiral abierto con lápiz.
   Hover: el lápiz garabatea y avanza dejando un trazo nuevo, la esquina de la
   página se levanta, la pegatina de estrella salta y estallan chispas.
   Reposo (nivel alto): solo titilan los destellos. */
const NB_PAGE_L = 'M10 24.6 C18.5 22.4 30.5 22.6 38.8 26.2 L38.8 63.2 C30.5 59.8 18.5 59.6 10 61.6 Z';
const NB_PAGE_R = 'M70 24.6 C61.5 22.4 49.5 22.6 41.2 26.2 L41.2 63.2 C49.5 59.8 61.5 59.6 70 61.6 Z';
const NB_COVER = 'M6.6 27.4 C16.5 25 30 25.4 40 29.2 C50 25.4 63.5 25 73.4 27.4 L73.4 66 C63.5 63.8 50 63.6 40 67.8 C30 63.6 16.5 63.8 6.6 66 Z';
const NB_ROWS = [31, 36, 41, 46, 51, 56];
const NB_LINES_L = NB_ROWS.map((y) => `M12.8 ${y} C20 ${y - 0.8} 30 ${y - 0.7} 37.4 ${y + 0.9}`).join(' ');
const NB_LINES_R = NB_ROWS.map((y) => `M67.2 ${y} C60 ${y - 0.8} 50 ${y - 0.7} 42.6 ${y + 0.9}`).join(' ');
const NB_COILS = [29.6, 33.9, 38.2, 42.5, 46.8, 51.1, 55.4, 59.7];
const NB_HOLES = NB_COILS.map((y) => `M36.45 ${y} a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0 M41.85 ${y} a0.85 0.85 0 1 0 1.7 0 a0.85 0.85 0 1 0 -1.7 0`).join(' ');
const NB_WIRE = NB_COILS.map((y) => `M37.3 ${y} C37.3 ${r2(y - 3.2)} 42.7 ${r2(y - 3.2)} 42.7 ${y}`).join(' ');
const NB_WIRE_HI = NB_COILS.map((y) => `M38.3 ${r2(y - 1.5)} C39.2 ${r2(y - 2.5)} 40.8 ${r2(y - 2.5)} 41.7 ${r2(y - 1.5)}`).join(' ');
const NB_SUN_RAYS = Array.from({ length: 8 }, (_, i) => {
  const [x1, y1] = polar(49.6, 31.2, 3.4, i * 45);
  const [x2, y2] = polar(49.6, 31.2, 4.9, i * 45);
  return `M${x1} ${y1} L${x2} ${y2}`;
}).join(' ');

const Notebook = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <ShadowGradient id={id('shadow')} color="#450a0a" opacity={0.45} />
        <MaterialGradient id={id('cover')} light="#A5B4FC" base="#6366F1" dark="#312E81" />
        <linearGradient id={id('pageL')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.65" stopColor="#FFFAF0" />
          <stop offset="1" stopColor="#F3E6CB" />
        </linearGradient>
        <linearGradient id={id('pageR')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#EEE0C2" />
          <stop offset="0.3" stopColor="#FCF6E9" />
          <stop offset="1" stopColor="#FFF9EF" />
        </linearGradient>
        <linearGradient id={id('gutL')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#92400E" stopOpacity="0" />
          <stop offset="1" stopColor="#92400E" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient id={id('gutR')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#92400E" stopOpacity="0.28" />
          <stop offset="1" stopColor="#92400E" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('flap')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6D3AB" />
        </linearGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        {/* lápiz facetado: tres caras con cortes duros */}
        <linearGradient id={id('pencil')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A5F3FC" />
          <stop offset="0.34" stopColor="#67E8F9" />
          <stop offset="0.34" stopColor="#06B6D4" />
          <stop offset="0.67" stopColor="#0891B2" />
          <stop offset="0.67" stopColor="#0E7490" />
          <stop offset="1" stopColor="#164E63" />
        </linearGradient>
        <MaterialGradient id={id('wood')} light="#FDE9C8" base="#F5C58A" dark="#B7793E" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('metal')} light="#F8FAFC" base="#A5B4C8" dark="#475569" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('eraser')} light="#FBCFE8" base="#F472B6" dark="#BE185D" x1={0} y1={0.5} x2={1} y2={0.5} />
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="42" r="37" fill={url('aura')} />
      {/* escena subida 2,5 u para centrarla en la tarjeta */}
      <g transform="translate(0 -2.5)">
        <ellipse cx="40" cy="70.8" rx="31" ry="3.6" fill={url('shadow')} />

        {/* tapa dura: grosor + cara, borde de luz y hueco del lomo */}
        <path d={NB_COVER} fill="#1E1B4B" transform="translate(0 1.6)" />
        <path d={NB_COVER} fill={url('cover')} />
        <path d="M7.5 29.2 L7.5 64.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
        <rect x="38.6" y="27" width="2.8" height="40.4" fill="#1E1B4B" opacity="0.6" />

        {/* canto del bloque de hojas */}
        <path d={NB_PAGE_L} fill="#DCC69B" transform="translate(-1 2.6)" />
        <path d={NB_PAGE_L} fill="#EFE1C1" transform="translate(-0.5 1.3)" />
        <path d={NB_PAGE_R} fill="#D3BB8E" transform="translate(1 2.6)" />
        <path d={NB_PAGE_R} fill="#E9D9B6" transform="translate(0.5 1.3)" />

        {/* páginas con pauta y margen */}
        <path d={NB_PAGE_L} fill={url('pageL')} />
        <path d={NB_PAGE_R} fill={url('pageR')} />
        <path d={NB_LINES_L} stroke="#60A5FA" strokeOpacity="0.45" strokeWidth="0.5" />
        <path d={NB_LINES_R} stroke="#60A5FA" strokeOpacity="0.45" strokeWidth="0.5" />
        <path d="M16.4 24.4 L16.4 60.2" stroke="#F87171" strokeOpacity="0.8" strokeWidth="0.6" />

        {/* página izquierda: «Aa», escritura y visto bueno */}
        <text x="18.4" y="35.4" fill="#4F46E5" fontSize="9" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">A</text>
        <text x="24.6" y="35.4" fill="#EC4899" fontSize="7" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">a</text>
        <path d={`${scribble(18.6, 40.4, 8)} ${scribble(18.6, 45.4, 5)} ${scribble(28.4, 45.4, 3)}`} stroke="#6366F1" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.8 49.4 L20.4 51 L23.4 47.4" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={scribble(25.4, 50.4, 5)} stroke="#6366F1" strokeOpacity="0.8" strokeWidth="0.7" strokeLinecap="round" />

        {/* página derecha: sol, escritura y arcoíris */}
        <path d={NB_SUN_RAYS} stroke="#F59E0B" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="49.6" cy="31.2" r="2.6" fill={url('gold')} />
        <circle cx="48.8" cy="30.4" r="0.8" fill="#fff" opacity="0.75" />
        <path d={`${scribble(44.4, 40.4, 7)} ${scribble(44.4, 45.4, 4)}`} stroke="#6366F1" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M52.2 57.2 A5.8 5.8 0 0 1 63.8 57.2" stroke="#F472B6" strokeWidth="1.3" />
        <path d="M53.6 57.2 A4.4 4.4 0 0 1 62.4 57.2" stroke="#FBBF24" strokeWidth="1.3" />
        <path d="M55 57.2 A3 3 0 0 1 61 57.2" stroke="#22D3EE" strokeWidth="1.3" />

        {/* sombra del lomo sobre las páginas */}
        <path d="M32.6 24.3 C35.2 24.8 37.2 25.4 38.8 26.2 L38.8 63.2 C37.2 62.3 35.2 61.6 32.6 61.1 Z" fill={url('gutL')} />
        <path d="M47.4 24.3 C44.8 24.8 42.8 25.4 41.2 26.2 L41.2 63.2 C42.8 62.3 44.8 61.6 47.4 61.1 Z" fill={url('gutR')} />

        {/* espiral metálica */}
        <path d={NB_HOLES} fill="#1E1B4B" opacity="0.75" />
        <path d={NB_WIRE} stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <path d={NB_WIRE_HI} stroke="#F1F5F9" strokeWidth="0.6" strokeLinecap="round" />

        {/* pegatina de estrella (salta y gira) */}
        <g className="art-h-pop" style={{ '--pop': '1.3' }}>
          <g className="art-h-spin" style={{ '--spin': '72deg' }}>
            <path d={starPath(33.4, 31.4, 3.6)} fill={url('gold')} stroke="#B45309" strokeOpacity="0.5" strokeWidth="0.4" strokeLinejoin="round" />
            <circle cx="32.5" cy="30.4" r="0.7" fill="#fff" opacity="0.8" />
          </g>
        </g>

        {/* esquina de la página que se levanta */}
        <g className="art-h-pop" style={{ '--pop': '1.5', transformOrigin: '100% 100%' }}>
          <path d="M70 56.4 L70 61.6 L64.6 60.5 Z" fill="#E9D9B6" />
          <path d="M70 55.6 L64.2 54.2 L63.9 60.4 Z" fill="#7C2D12" opacity="0.12" />
          <path d="M70 56.4 L65 55 L64.6 60.5 Z" fill={url('flap')} />
        </g>

        {/* lápiz: su sombra sobre el papel y el lápiz, que escribe al pasar el ratón */}
        <g className="art-h-slide" style={{ '--slide': '4.5px' }}>
          <path d="M51.2 46.6 L68.6 33.6 L67.2 31.6 Z" fill="#7C2D12" opacity="0.16" />
          <g className="art-h-wiggle" style={{ transformOrigin: '0% 100%' }}>
            <g transform="translate(51 46.2) rotate(35)">
              <path d="M-1.15 -3 L-3.5 -10 L3.5 -10 L1.15 -3 Z" fill={url('wood')} />
              <path d="M0 0 L-1.15 -3.1 L1.15 -3.1 Z" fill="#334155" />
              <path d="M-3.5 -10 Q-2.33 -8.7 -1.17 -10 Q0 -8.7 1.17 -10 Q2.33 -8.7 3.5 -10 L3.5 -29.8 L-3.5 -29.8 Z" fill={url('pencil')} />
              <rect x="-2.75" y="-28.8" width="0.8" height="17.6" rx="0.4" fill="#fff" opacity="0.5" />
              <rect x="-3.7" y="-33.6" width="7.4" height="4.2" rx="0.6" fill={url('metal')} />
              <path d="M-3.7 -31.4 H3.7 M-3.7 -32.5 H3.7" stroke="#475569" strokeOpacity="0.6" strokeWidth="0.45" />
              <path d="M-3.5 -33.4 L-3.5 -36 Q-3.5 -38.2 -1.3 -38.2 L1.3 -38.2 Q3.5 -38.2 3.5 -36 L3.5 -33.4 Z" fill={url('eraser')} />
              <rect x="-2.6" y="-37.3" width="1" height="3.2" rx="0.5" fill="#fff" opacity="0.5" />
            </g>
          </g>
        </g>
        {/* trazo nuevo que aparece mientras escribe */}
        <path className="art-h-show" d={scribble(50.8, 45.4, 3)} stroke="#EC4899" strokeWidth="0.75" strokeLinecap="round" />
      </g>

      {/* destellos */}
      <Sparkle x={11} y={14} r={3.2} idle delay={0} />
      <Sparkle x={28} y={15.5} r={1.8} idle delay={1.2} />
      <Sparkle x={75.5} y={71} r={2.2} idle delay={2.2} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={46} y={13} r={2.6} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={77} y={50} r={2.4} /></g>
    </svg>
  );
};

/* 3º Primaria — Cohete despegando entre nubes, con planeta anillado al fondo.
   Hover: el cohete sube por su eje, la llama crece y aparece un penacho de
   fuego, las nubes se hinchan y estallan chispas. Reposo (nivel alto): la
   llama parpadea y titilan los destellos. */
const RK_HULL = 'M0 -25 C8.2 -17.5 10.4 -5.5 9.6 6.5 C9.3 10.6 8.5 13.6 7.2 15.6 L-7.2 15.6 C-8.5 13.6 -9.3 10.6 -9.6 6.5 C-10.4 -5.5 -8.2 -17.5 0 -25 Z';

const Rocket = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.36} />
        <ShadowGradient id={id('shadow')} color="#7c2d12" opacity={0.38} />
        <linearGradient id={id('body')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E0E7FF" />
          <stop offset="0.25" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F5F3FF" />
          <stop offset="0.8" stopColor="#C7D2FE" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id={id('nose')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F9A8D4" />
          <stop offset="0.3" stopColor="#F472B6" />
          <stop offset="0.7" stopColor="#DB2777" />
          <stop offset="1" stopColor="#9D174D" />
        </linearGradient>
        <MaterialGradient id={id('finL')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('finR')} light="#F472B6" base="#BE185D" dark="#831843" />
        <MaterialGradient id={id('band')} light="#C7D2FE" base="#6366F1" dark="#312E81" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('metal')} light="#E2E8F0" base="#94A3B8" dark="#334155" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <radialGradient id={id('glass')} cx="0.36" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#A5F3FC" />
          <stop offset="0.45" stopColor="#6366F1" />
          <stop offset="1" stopColor="#1E1B4B" />
        </radialGradient>
        <linearGradient id={id('core')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#312E81" stopOpacity="0" />
          <stop offset="1" stopColor="#312E81" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={id('flameOut')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FEF3C7" />
          <stop offset="0.35" stopColor="#FB923C" />
          <stop offset="0.8" stopColor="#F43F5E" />
          <stop offset="1" stopColor="#E11D48" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={id('flameIn')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#FEF08A" />
          <stop offset="1" stopColor="#FB923C" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={id('plume')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDE68A" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#FB7185" stopOpacity="0.85" />
          <stop offset="1" stopColor="#E11D48" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('cloud')} gradientUnits="userSpaceOnUse" x1="0" y1="57" x2="0" y2="73">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#A5B4FC" />
        </linearGradient>
        <MaterialGradient id={id('planet')} light="#DDD6FE" base="#8B5CF6" dark="#4C1D95" />
        <clipPath id={id('hull')}><path d={RK_HULL} /></clipPath>
      </defs>

      {/* aura y sombra bajo las nubes */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="24" cy="73.2" rx="22" ry="2.8" fill={url('shadow')} />

      {/* planeta con anillo (fondo) */}
      <g transform="translate(16 19) rotate(-20)">
        <ellipse cx="0" cy="0" rx="11" ry="3.1" stroke="#FBCFE8" strokeWidth="1.5" opacity="0.85" />
        <circle r="6.4" fill={url('planet')} />
        <path d="M-6 -2.2 Q0 -0.4 6 -2.2" stroke="#EDE9FE" strokeOpacity="0.45" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M-5.6 2.8 Q0 4.4 5.6 2.8" stroke="#4C1D95" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="-2.4" cy="-2.8" rx="2.2" ry="1.3" fill="#fff" opacity="0.55" />
        <path d="M-11 0 A11 3.1 0 0 0 11 0" stroke="#FCE7F3" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* estrellitas de fondo (estáticas) */}
      <path d="M29 29 h0.01 M62 50 h0.01 M73 59 h0.01 M41 7 h0.01 M6 47 h0.01" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />

      {/* cohete en diagonal: todo en coordenadas propias (vertical) */}
      <g transform="translate(45 33) rotate(38) scale(1.18)">
        {/* estelas de velocidad */}
        <path d="M14.6 -11 V-2 M19.2 -3.6 V4.4 M-14.4 -13 V-6.6" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" />
        <g className="art-h-lift" style={{ '--lift': '-5px' }}>
          {/* penacho de fuego: solo en hover */}
          <path className="art-h-show" d="M-6.6 19 C-7.8 28.5 -3.6 36.5 0 44 C3.6 36.5 7.8 28.5 6.6 19 Z" fill={url('plume')} />
          {/* llama: parpadea en reposo y crece en hover */}
          <g className="art-h-pop art-o-top" style={{ '--pop': '1.35' }}>
            <g className="art-i-flicker art-o-top">
              <path d="M-5.6 18.6 C-6 24.6 -3 30 0 35 C3 30 6 24.6 5.6 18.6 Z" fill={url('flameOut')} />
              <path d="M-3.2 18.6 C-3.4 23 -1.6 26.6 0 29.4 C1.6 26.6 3.4 23 3.2 18.6 Z" fill={url('flameIn')} />
              <ellipse cx="0" cy="20.8" rx="1.6" ry="2.4" fill="#fff" opacity="0.9" />
            </g>
          </g>

          {/* aletas laterales */}
          <path d="M-8.8 3 C-13.5 5.5 -16.5 10.5 -16.4 18.5 C-16.3 19.6 -15.4 20 -14.6 19.4 L-8 14.6 Z" fill={url('finL')} />
          <path d="M-9.4 5.4 C-13 8 -14.8 12 -15.2 17.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M8.8 3 C13.5 5.5 16.5 10.5 16.4 18.5 C16.3 19.6 15.4 20 14.6 19.4 L8 14.6 Z" fill={url('finR')} />

          {/* tobera */}
          <path d="M-6.2 14.6 L6.2 14.6 L7.6 19.4 Q0 20.8 -7.6 19.4 Z" fill={url('metal')} />
          <path d="M-6.6 16.6 Q0 17.6 6.6 16.6" stroke="#1E293B" strokeOpacity="0.35" strokeWidth="0.5" />

          {/* fuselaje: material + piezas recortadas a su silueta */}
          <path d={RK_HULL} fill={url('body')} />
          <g clipPath={url('hull')}>
            <path d="M-12 -27 H12 V-13 Q0 -10 -12 -13 Z" fill={url('nose')} />
            <path d="M-12 -13 Q0 -10 12 -13" stroke="#831843" strokeOpacity="0.35" strokeWidth="0.6" />
            <path d="M-12 5 Q0 8 12 5 V8.6 Q0 11.6 -12 8.6 Z" fill={url('band')} />
            <path d="M3 -27 C8.8 -16 9.6 -1 7.6 17 H12 V-27 Z" fill={url('core')} />
            <rect x="-6.2" y="-16" width="2" height="29" rx="1" fill="#fff" opacity="0.6" />
          </g>
          <path d={RK_HULL} stroke="#3730A3" strokeOpacity="0.3" strokeWidth="0.6" />
          <path d="M-2 -22.4 C-6.6 -16.4 -8.6 -6 -8.4 5" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />
          {[-5, 0, 5].map((x) => (
            <circle key={x} cx={x} cy={x ? 7.95 : 8.3} r="0.55" fill="#E0E7FF" opacity="0.9" />
          ))}

          {/* ojo de buey con aro dorado */}
          <circle cx="0" cy="-3.5" r="5.9" fill={url('gold')} />
          <circle cx="0" cy="-3.5" r="4.7" fill="#1E1B4B" />
          <circle cx="0" cy="-3.5" r="4.2" fill={url('glass')} />
          <path d="M-2.9 -5.6 A3.2 3.2 0 0 1 0.4 -6.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" />
          <circle cx="1.9" cy="-1.4" r="0.7" fill="#fff" opacity="0.55" />
          <path d="M-4.6 -6.6 A5.4 5.4 0 0 1 -0.4 -8.9" stroke="#FFFBEB" strokeOpacity="0.8" strokeWidth="0.7" strokeLinecap="round" />

        </g>
      </g>

      {/* banco de nubes del despegue (se hincha en hover) */}
      <g className="art-h-pop art-o-bottom" style={{ '--pop': '1.08' }}>
        <g fill={url('cloud')}>
          <circle cx="8" cy="68.4" r="4.6" />
          <circle cx="15.5" cy="65.6" r="6.4" />
          <circle cx="25.5" cy="67.6" r="5.4" />
          <circle cx="33.5" cy="69.6" r="3.6" />
          <rect x="3.4" y="67.6" width="34" height="4.8" rx="2.4" />
        </g>
        <path d="M10.6 62.2 C12.2 60.2 15 59.4 17.6 60" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M23 63.4 C24.4 62.5 26.2 62.3 27.6 62.9" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* destellos */}
      <Sparkle x={8} y={35} r={2.8} idle delay={0} />
      <Sparkle x={67} y={62} r={2.4} idle delay={1.1} />
      <Sparkle x={72} y={8} r={2.2} idle delay={2.1} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={74} y={26} r={2.8} /></g>
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={33} y={9} r={2.4} fill="#FDE68A" /></g>
    </svg>
  );
};

/* 4º Primaria — Brújula de bolsillo sobre un mapa del tesoro.
   Hover: la brújula se inclina y la aguja da una vuelta completa hasta volver
   a apuntar al norte, la argolla se balancea, la X del mapa salta y estallan
   chispas. Reposo (nivel alto): la aguja oscila buscando el norte y
   titilan los destellos. */
const CP_X = 40;
const CP_Y = 43;
const CP_TICKS = Array.from({ length: 72 }, (_, i) => i * 5)
  .filter((d) => d % 45 !== 0)
  .map((d) => {
    const [x1, y1] = polar(CP_X, CP_Y, d % 15 === 0 ? 16.6 : 17.5, d);
    const [x2, y2] = polar(CP_X, CP_Y, 18.6, d);
    return `M${x1} ${y1}L${x2} ${y2}`;
  }).join('');
const CP_TICKS_MAJOR = [45, 135, 225, 315].map((d) => {
  const [x1, y1] = polar(CP_X, CP_Y, 15.6, d);
  const [x2, y2] = polar(CP_X, CP_Y, 18.6, d);
  return `M${x1} ${y1}L${x2} ${y2}`;
}).join('');
// Rosa de los vientos de 8 puntas: mitad clara y mitad oscura de cada punta.
const CP_ROSE = [0, 45, 90, 135, 180, 225, 270, 315].reduce((acc, deg) => {
  const long = deg % 90 === 0;
  const [tx, ty] = polar(CP_X, CP_Y, long ? 11 : 7.4, deg - 90);
  const [lx, ly] = polar(CP_X, CP_Y, long ? 2.4 : 1.8, deg - 135);
  const [rx, ry] = polar(CP_X, CP_Y, long ? 2.4 : 1.8, deg - 45);
  acc[0] += `M${CP_X} ${CP_Y}L${lx} ${ly}L${tx} ${ty}Z`;
  acc[1] += `M${CP_X} ${CP_Y}L${rx} ${ry}L${tx} ${ty}Z`;
  return acc;
}, ['', '']);
const CP_BEZEL_DOTS = [45, 135, 225, 315].map((d) => polar(CP_X, CP_Y, 22.2, d));

const Compass = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <ShadowGradient id={id('drop')} color="#14532d" opacity={0.5} />
        <MaterialGradient id={id('bezel')} light="#C7D2FE" base="#6366F1" dark="#312E81" />
        <radialGradient id={id('dial')} cx="0.38" cy="0.32" r="0.78">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F8FAFC" />
          <stop offset="0.88" stopColor="#E0E7FF" />
          <stop offset="1" stopColor="#C7D2FE" />
        </radialGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('goldH')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0.5} x2={1} y2={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.75} />
      </defs>

      {/* aura */}
      <circle cx="40" cy="41" r="37" fill={url('aura')} />

      {/* mapa plegado en acordeón (detrás) */}
      <g transform="translate(40 45) rotate(-24)">
        <path d="M-30 -15 L-10 -16.6 L-10 15.4 L-30 17 Z" fill="#FEF6DD" />
        <path d="M-10 -16.6 L10 -15 L10 17 L-10 15.4 Z" fill="#F3D99B" />
        <path d="M10 -15 L30 -16.6 L30 15.4 L10 17 Z" fill="#FDF0CF" />
        <path d="M-30 -15 L-10 -16.6 L10 -15 L30 -16.6 L30 15.4 L10 17 L-10 15.4 L-30 17 Z" stroke="#B7793E" strokeOpacity="0.55" strokeWidth="0.5" strokeLinejoin="round" />
        <path d="M-30 -4 C-26 -3 -25 3 -22 5 S-17 8 -15 12" stroke="#38BDF8" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M-28.6 -12 q2 -2 4 0 q1 2 -1.4 3.2 q-2.6 0.4 -2.6 -3.2 Z M26 6 q2 -2.2 3.4 0 q0.4 2.6 -1.8 2.8 q-2 -0.4 -1.6 -2.8 Z" fill="#4ADE80" opacity="0.85" />
        <path d="M-27 12 C-18 4 -6 12 4 2 S18 -8 23.6 -10" stroke="#E11D48" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1.4 1.4" />
        <g className="art-h-pop" style={{ '--pop': '1.6' }}>
          <path d="M24.4 -12.6 L27.8 -9.2 M27.8 -12.6 L24.4 -9.2" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      </g>

      {/* brújula, algo ampliada sobre el mapa: sombra + pieza que se inclina */}
      <g transform="translate(40 44) scale(1.08) translate(-40 -43)">
        <circle cx="42.6" cy="46.8" r="29" fill={url('drop')} />
        <g className="art-h-tilt" style={{ '--tilt': '-10deg' }}>
          {/* argolla (se balancea en hover) y corona */}
          <g className="art-h-wiggle art-o-bottom">
            <circle cx="40" cy="11.4" r="3.6" stroke="#92400E" strokeWidth="2.6" />
            <circle cx="40" cy="11.4" r="3.6" stroke={url('gold')} strokeWidth="1.7" />
            <path d="M37.4 9.4 A3.3 3.3 0 0 1 40.4 8.1" stroke="#FFFBEB" strokeWidth="0.7" strokeLinecap="round" />
          </g>
          <rect x="37.2" y="14.4" width="5.6" height="5.6" rx="1.3" fill={url('goldH')} />
          <path d="M38.6 15 V19.4 M40 15 V19.4 M41.4 15 V19.4" stroke="#92400E" strokeOpacity="0.45" strokeWidth="0.5" />
  
          {/* caja: grosor, bisel moleteado y borde de luz */}
          <circle cx="41" cy="44.8" r="24.5" fill="#1E1B4B" />
          <circle cx={CP_X} cy={CP_Y} r="24.5" fill={url('bezel')} />
          <circle cx={CP_X} cy={CP_Y} r="23.7" stroke="#1E1B4B" strokeOpacity="0.32" strokeWidth="1.1" strokeDasharray="0.55 1" />
          <path d="M19.2 55 A24 24 0 0 1 48.2 20.45" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
          {CP_BEZEL_DOTS.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill={url('gold')} />)}
          <path d="M40 18.9 L41.6 21.2 L38.4 21.2 Z" fill={url('gold')} />
  
          {/* esfera: canto interior, dial, marcas, rosa y letras */}
          <circle cx={CP_X} cy={CP_Y} r="20.4" fill="#1E1B4B" />
          <circle cx={CP_X} cy={CP_Y} r="19.6" fill={url('dial')} />
          <path d="M23.4 52.6 A19 19 0 0 1 49.5 26.55" stroke="#312E81" strokeOpacity="0.16" strokeWidth="1.6" strokeLinecap="round" />
          <path d={CP_TICKS} stroke="#6366F1" strokeOpacity="0.55" strokeWidth="0.45" />
          <path d={CP_TICKS_MAJOR} stroke="#312E81" strokeWidth="0.9" strokeLinecap="round" />
          <path d={CP_ROSE[0]} fill="#FDE68A" />
          <path d={CP_ROSE[1]} fill="#F59E0B" opacity="0.85" />
          <text x="40" y="29.9" textAnchor="middle" fill="#DC2626" fontSize="5.2" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">N</text>
          <text x="55" y="44.6" textAnchor="middle" fill="#312E81" fontSize="4.4" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">E</text>
          <text x="40" y="59.6" textAnchor="middle" fill="#312E81" fontSize="4.4" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">S</text>
          <text x="25" y="44.6" textAnchor="middle" fill="#312E81" fontSize="4.4" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">O</text>
  
          {/* aguja: oscila en reposo; en hover da la vuelta y vuelve al norte */}
          <g className="art-h-spin" style={{ '--spin': '370deg' }}>
            <g className="art-i-sway" style={{ '--amp': '7deg', '--dur': '4.6s' }}>
              {/* círculo invisible: centra la caja de la aguja en el eje de giro */}
              <circle cx={CP_X} cy={CP_Y} r="14" />
              <path d="M40 30.6 L42.6 43 L40 55.4 L37.4 43 Z" fill="#1E1B4B" opacity="0.2" transform="translate(0.9 1.3)" />
              <path d="M40 30.6 L37.4 43 L40 43 Z" fill="#F87171" />
              <path d="M40 30.6 L42.6 43 L40 43 Z" fill="#B91C1C" />
              <path d="M40 55.4 L37.4 43 L40 43 Z" fill="#818CF8" />
              <path d="M40 55.4 L42.6 43 L40 43 Z" fill="#312E81" />
            </g>
          </g>
          <circle cx={CP_X} cy={CP_Y} r="2.6" fill={url('gold')} />
          <circle cx="39.3" cy="42.3" r="0.9" fill="#fff" opacity="0.8" />
  
          {/* cristal: brillo especular */}
          <path d="M22.03 38.19 A18.6 18.6 0 0 1 44.81 25.03 C36 26.4 27.6 30.6 22.03 38.19 Z" fill={url('gloss')} />
        </g>
      </g>

      {/* destellos */}
      <Sparkle x={10} y={17} r={3} idle delay={0} />
      <Sparkle x={72} y={66} r={2.2} idle delay={1.3} />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={70} y={9} r={2.6} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={8} y={30} r={2.2} /></g>
    </svg>
  );
};

/* 5º Primaria — Globo terráqueo de sobremesa con meridiano dorado.
   Hover: el globo gira (los continentes se desplazan dentro de la esfera),
   aparece un avión que recorre su órbita con estela, cae una chincheta sobre
   el mapa y estallan chispas. Reposo (nivel alto): solo titilan los destellos. */
const GB_GRID = 'M0 -22 A11 22 0 0 1 0 22 M0 -22 A11 22 0 0 0 0 22 M0 -22 V22 M0 -22 A18.5 22 0 0 1 0 22 M0 -22 A18.5 22 0 0 0 0 22 M-22 0 A22 3.6 0 0 0 22 0 M-19 -11 A19 3.1 0 0 0 19 -11 M-19 11 A19 3.1 0 0 0 19 11';
const GB_RING = 'M49.96 10.53 A25.5 25.5 0 0 1 30.04 57.47';
const GB_LANDS = [
  // Norteamérica, Groenlandia, Sudamérica
  'M-19 -12 C-17 -16.5 -9.5 -17.5 -5.5 -14.5 C-3 -12.6 -4.6 -9.6 -6.6 -8 C-8.4 -6.6 -8.6 -4.4 -10.2 -3.2 C-12.4 -1.6 -14.6 -3.4 -15.2 -5.8 C-15.8 -8 -19.8 -8.6 -19 -12 Z',
  'M-3.4 -17.8 C-1.6 -18.8 1.4 -18 1.2 -16 C1 -14.2 -1.2 -13.4 -2.6 -14.2 C-3.8 -14.9 -4.4 -17 -3.4 -17.8 Z',
  'M-9.6 -1.4 C-7.2 -1.6 -4.2 0.4 -3.2 3.4 C-2.4 6 -3.6 9.6 -5.2 12.4 C-6.4 14.6 -7.8 16.8 -8.6 15.6 C-9.2 13.2 -8.6 10.4 -9.8 8 C-11 5.6 -12.2 2.4 -9.6 -1.4 Z',
  // Europa, África, Asia, India, Australia
  'M5.4 -14.2 C7.6 -15.6 11 -15 12 -12.8 C12.8 -11 11 -9.6 9.4 -9.8 C8.2 -9.9 7.2 -8.8 5.8 -9.4 C4.4 -10 4 -13.2 5.4 -14.2 Z',
  'M5.2 -7.4 C8.6 -8.6 13.4 -7.6 15.2 -4.4 C16.6 -1.8 15 1.4 13.6 3.6 C12.2 6 12 9.6 9.8 11.6 C8.2 13 6.6 11.4 6.4 9.2 C6.2 6.6 5 4.6 4 2.6 C2.6 -0.2 2 -6.2 5.2 -7.4 Z',
  'M14 -15.6 C19 -18.4 28 -17.6 33 -14.2 C36 -12 35.6 -8 32.6 -6.2 C30 -4.6 27.4 -5.8 25.6 -3.6 C24 -1.6 21.6 -2.6 20.4 -4.8 C19 -7.2 15.4 -7.6 13.6 -9.6 C12.2 -11.4 12 -14.4 14 -15.6 Z',
  'M22 -4.2 C23.6 -4 24.6 -2 24 0.4 C23.6 2 22.4 3.6 21.6 2.6 C20.8 1.2 20.4 -3.8 22 -4.2 Z',
  'M25.6 7.4 C28 6 32.2 6.6 33.4 9 C34.4 11 32.6 13.4 30 13.4 C27.6 13.4 25.2 12.6 24.6 10.6 C24.2 9.2 24.6 8 25.6 7.4 Z',
];
const GB_PIVOT = { transformBox: 'view-box', transformOrigin: '40px 34px' };

const Globe = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.34} />
        <ShadowGradient id={id('shadow')} color="#052e16" opacity={0.45} />
        <radialGradient id={id('ocean')} cx="0.36" cy="0.32" r="0.78">
          <stop offset="0" stopColor="#7DD3FC" />
          <stop offset="0.38" stopColor="#3B82F6" />
          <stop offset="0.78" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#1E3A8A" />
        </radialGradient>
        <radialGradient id={id('shade')} cx="0.36" cy="0.32" r="0.8">
          <stop offset="0.5" stopColor="#0B1B4D" stopOpacity="0" />
          <stop offset="0.85" stopColor="#0B1B4D" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0B1B4D" stopOpacity="0.55" />
        </radialGradient>
        <MaterialGradient id={id('land')} light="#D9F99D" base="#84CC16" dark="#3F6212" />
        <linearGradient id={id('ring')} gradientUnits="userSpaceOnUse" x1="44" y1="8" x2="56" y2="60">
          <stop offset="0" stopColor="#FEF3C7" />
          <stop offset="0.4" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('goldH')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('base')} light="#C7D2FE" base="#6366F1" dark="#312E81" />
        <MaterialGradient id={id('pin')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('plane')} light="#FFFFFF" base="#EEF2FF" dark="#A5B4FC" x1={0.5} y1={0} x2={0.5} y2={1} />
        <GlossGradient id={id('gloss')} opacity={0.7} />
        <clipPath id={id('sphere')}><circle r="22" /></clipPath>
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="40" cy="72.8" rx="20" ry="2.9" fill={url('shadow')} />

      {/* peana */}
      <ellipse cx="40" cy="69.4" rx="15.6" ry="3.5" fill="#1E1B4B" />
      <ellipse cx="40" cy="68.2" rx="15.6" ry="3.5" fill={url('base')} />
      <path d="M24.4 68.2 A15.6 3.5 0 0 0 55.6 68.2" stroke={url('goldH')} strokeWidth="0.9" />
      <path d="M29.6 67.8 C29.6 63.6 34.4 61.4 40 61.4 C45.6 61.4 50.4 63.6 50.4 67.8 Q40 69.8 29.6 67.8 Z" fill={url('base')} />
      <path d="M32.8 65.6 C33.8 63.6 36.2 62.6 38.6 62.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
      <rect x="38.3" y="58.4" width="3.4" height="4.6" rx="0.8" fill={url('goldH')} />
      <ellipse cx="40" cy="62.2" rx="3" ry="1.1" fill={url('gold')} />

      {/* esfera: atmósfera, océano y, en el eje inclinado, continentes y retícula */}
      <circle cx="40" cy="34" r="23.6" stroke="#A5F3FC" strokeOpacity="0.55" strokeWidth="1.6" />
      <circle cx="40" cy="34" r="22" fill={url('ocean')} />
      <g transform="translate(40 34) rotate(23)">
        <g clipPath={url('sphere')}>
          <g className="art-h-slide" style={{ '--slide': '-9px' }}>
            <g fill={url('land')}>
              {GB_LANDS.map((d) => <path key={d} d={d} />)}
            </g>
            <path d="M6.8 -5.2 C9 -6 12.4 -5.6 13.2 -3.6 C12 -2.2 8.6 -2 6.8 -3 Z" fill="#FDE68A" opacity="0.75" />
            <ellipse cx="15.6" cy="7.6" rx="0.9" ry="1.8" fill="#84CC16" />
          </g>
          <ellipse cx="0" cy="-21" rx="9" ry="3.8" fill="#F8FAFC" opacity="0.92" />
          <path d={GB_GRID} stroke="#fff" strokeOpacity="0.22" strokeWidth="0.45" />
        </g>
        {/* pivotes del eje */}
        <path d="M0 -21.8 V-27 M0 21.8 V26" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="0" cy="-27.6" r="1.5" fill={url('gold')} />
      </g>
      {/* volumen: sombra, brillo y borde de luz */}
      <circle cx="40" cy="34" r="22" fill={url('shade')} />
      <ellipse cx="31.6" cy="24.6" rx="9.2" ry="5.4" transform="rotate(-38 31.6 24.6)" fill={url('gloss')} />
      <circle cx="28.4" cy="21.4" r="1.2" fill="#fff" opacity="0.9" />
      <path d="M20 41.3 A21.3 21.3 0 0 1 32.7 14" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />

      {/* meridiano dorado con graduación */}
      <path d={GB_RING} stroke="#92400E" strokeWidth="3.4" strokeLinecap="round" />
      <path d={GB_RING} stroke={url('ring')} strokeWidth="2.4" strokeLinecap="round" />
      <path d={GB_RING} stroke="#78350F" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="0.35 2.2" />
      <path d="M52.5 12.35 A25 25 0 0 1 63.49 42.55" stroke="#FFFBEB" strokeOpacity="0.8" strokeWidth="0.6" strokeLinecap="round" />

      {/* chincheta que cae sobre el mapa (hover) */}
      <g className="art-h-show">
        <g className="art-h-drop" style={{ '--drop': '3px' }}>
          <g transform="translate(41 28)">
            <ellipse cx="0.3" cy="0.2" rx="1.4" ry="0.5" fill="#0B1B4D" opacity="0.35" />
            <path d="M0 0 C-0.8 -1.5 -2.7 -3.1 -2.7 -5 A2.7 2.7 0 0 1 2.7 -5 C2.7 -3.1 0.8 -1.5 0 0 Z" fill={url('pin')} />
            <circle cx="0" cy="-5" r="1.05" fill="#fff" />
          </g>
        </g>
      </g>

      {/* avión en órbita con estela (hover) */}
      <g className="art-h-spin" style={{ '--spin': '55deg', ...GB_PIVOT }}>
        <g className="art-h-show">
          <path d="M12.75 43.9 A29 29 0 0 1 13.5 22.2" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1.4 1.6" />
          <g transform="translate(14.9 19.5) rotate(-60)">
            <path d="M1 0.8 L-1.6 5.2 L-3 5.2 L-1.6 0.8 Z" fill="#BE185D" />
            <path d="M-4.2 -1 L2.8 -1 C4.2 -1 5 -0.5 5 0 C5 0.5 4.2 1 2.8 1 L-4.2 1 Z" fill={url('plane')} />
            <path d="M1 -0.8 L-1.6 -5.2 L-3 -5.2 L-1.6 -0.8 Z" fill="#EC4899" />
            <path d="M-4.2 -0.8 L-5.4 -3 L-4.4 -3 L-3 -0.8 Z" fill="#EC4899" />
            <path d="M3.3 -0.45 L4.4 -0.2" stroke="#22D3EE" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* destellos */}
      <Sparkle x={9} y={12} r={3} idle delay={0} />
      <Sparkle x={72} y={60} r={2.2} fill="#FEF3C7" idle delay={1.2} />
      <Sparkle x={9} y={58} r={2} idle delay={2.2} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={70} y={9} r={2.6} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={47} y={23} r={2.2} /></g>
    </svg>
  );
};

/* 6º Primaria — Llave dorada con gema y cerradura.
   Hover: la llave entra hacia la cerradura y gira, un brillo recorre el metal,
   la gema se agranda, el ojo de la cerradura se ilumina y estallan chispas.
   Reposo (nivel alto): el reflejo de la gema late y titilan los destellos. */
const KY_HOLE = 'M64.6 54.2 A2.4 2.4 0 0 1 65.94 58.59 L66.8 62.2 L62.4 62.2 L63.26 58.59 A2.4 2.4 0 0 1 64.6 54.2 Z';
const KY_RAYS = Array.from({ length: 8 }, (_, i) => {
  const [x1, y1] = polar(64.6, 58.2, 5.4, i * 45 + 22.5);
  const [x2, y2] = polar(64.6, 58.2, 8.4, i * 45 + 22.5);
  return `M${x1} ${y1} L${x2} ${y2}`;
}).join(' ');

const GoldenKey = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#1e1b4b" opacity={0.42} />
        <ShadowGradient id={id('drop')} color="#1e1b4b" opacity={0.45} />
        {/* oro en coordenadas de la llave: sin cortes entre piezas */}
        <linearGradient id={id('gold')} gradientUnits="userSpaceOnUse" x1="0" y1="-15" x2="0" y2="15">
          <stop offset="0" stopColor="#FFF7D6" />
          <stop offset="0.28" stopColor="#FCD34D" />
          <stop offset="0.55" stopColor="#F59E0B" />
          <stop offset="0.8" stopColor="#D97706" />
          <stop offset="1" stopColor="#92400E" />
        </linearGradient>
        <MaterialGradient id={id('rim')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('plate')} light="#818CF8" base="#4F46E5" dark="#1E1B4B" />
        <radialGradient id={id('gem')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#FBCFE8" />
          <stop offset="0.35" stopColor="#F472B6" />
          <stop offset="0.7" stopColor="#DB2777" />
          <stop offset="1" stopColor="#831843" />
        </radialGradient>
        <GlowGradient id={id('holeGlow')} color="#FFFBEB" opacity={0.95} mid={0.4} />
        <linearGradient id={id('holeLight')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBEB" />
          <stop offset="0.5" stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        {/* silueta de la llave (se pinta dos veces: canto oscuro + cara dorada) */}
        <g id={id('sil')}>
          <circle r="10.6" />
          <circle cx="-10.4" r="4.3" />
          <circle cy="-10.4" r="4.3" />
          <circle cy="10.4" r="4.3" />
          <rect x="8.4" y="-4.4" width="6.2" height="8.8" rx="1.6" />
          <rect x="12" y="-2.8" width="33.4" height="5.6" rx="2.8" />
          <path d="M30.4 1.2 H42.4 V8.4 H39.8 V13 H36.8 V9.6 H34.2 V13.8 H30.4 Z" />
        </g>
        <clipPath id={id('keyClip')}>
          <circle r="10.6" />
          <rect x="8.4" y="-4.4" width="6.2" height="8.8" rx="1.6" />
          <rect x="12" y="-2.8" width="33.4" height="5.6" rx="2.8" />
        </clipPath>
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="40" cy="40" r="37" fill={url('aura')} />
      <ellipse cx="50" cy="72.6" rx="22" ry="2.6" fill={url('shadow')} />

      {/* cerradura: medallón de metal con aro de oro */}
      <circle cx="66.4" cy="60.6" r="12.4" fill={url('drop')} />
      <circle cx="64.6" cy="58.4" r="10.6" fill={url('rim')} />
      <circle cx="64.6" cy="58.4" r="9" fill={url('plate')} />
      <circle cx="64.6" cy="58.4" r="7.3" stroke="#1E1B4B" strokeOpacity="0.5" strokeWidth="0.6" />
      <path d="M55.7 61.4 A10 10 0 0 1 61.2 49" stroke="#FFFBEB" strokeOpacity="0.75" strokeWidth="0.8" strokeLinecap="round" />
      <path d={KY_HOLE} fill="#0F0A2E" />
      <path d="M66.4 59.2 L67.2 62.2" stroke="#A5B4FC" strokeOpacity="0.7" strokeWidth="0.5" strokeLinecap="round" />
      {/* el ojo de la cerradura se ilumina (hover) */}
      <g className="art-h-show">
        <circle cx="64.6" cy="57.8" r="8" fill={url('holeGlow')} />
        <path d={KY_RAYS} stroke="#FEF3C7" strokeOpacity="0.85" strokeWidth="0.8" strokeLinecap="round" />
        <path d={KY_HOLE} fill={url('holeLight')} />
      </g>

      {/* llave: entra hacia la cerradura y gira sobre su punta */}
      <g className="art-h-slide" style={{ '--slide': '2.2px' }}>
        <g className="art-h-drop" style={{ '--drop': '1.7px' }}>
          <g className="art-h-wiggle" style={{ transformBox: 'view-box', transformOrigin: '58px 52.7px' }}>
            <g transform="translate(22.5 25) rotate(38)">
              <use href={`#${id('sil')}`} fill="#78350F" transform="translate(1.4 0.8)" />
              <use href={`#${id('sil')}`} fill={url('gold')} />

              {/* aro del ojo: hueco, bisel y gema */}
              <circle r="6.9" fill="#7C2D12" />
              <path d="M4.18 -4.98 A6.5 6.5 0 0 1 4.18 4.98" stroke="#FDE68A" strokeOpacity="0.85" strokeWidth="0.8" strokeLinecap="round" />
              <g className="art-h-pop" style={{ '--pop': '1.18' }}>
                <circle r="5.5" fill={url('gem')} />
                <path d="M0 -2.7 L2.34 -1.35 L2.34 1.35 L0 2.7 L-2.34 1.35 L-2.34 -1.35 Z" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.4" />
                <path d="M0 -2.7 V-5.5 M2.34 -1.35 L4.76 -2.75 M2.34 1.35 L4.76 2.75 M0 2.7 V5.5 M-2.34 1.35 L-4.76 2.75 M-2.34 -1.35 L-4.76 -2.75" stroke="#fff" strokeOpacity="0.2" strokeWidth="0.35" />
                <g className="art-i-glow" style={{ '--lo': '0.45', '--hi': '1', '--dur': '3.2s' }}>
                  <ellipse cx="-1.8" cy="-2" rx="1.9" ry="1.2" transform="rotate(-40 -1.8 -2)" fill="#fff" opacity="0.85" />
                </g>
                <circle cx="2.3" cy="2.4" r="0.7" fill="#fff" opacity="0.55" />
              </g>

              {/* brillos del aro y de los lóbulos */}
              <path d="M-8.7 4.06 A9.6 9.6 0 0 1 -2.97 -9.13" stroke="#FFFBEB" strokeOpacity="0.8" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="-11.6" cy="-1.3" r="1" fill="#fff" opacity="0.7" />
              <circle cx="-1.3" cy="-11.6" r="1" fill="#fff" opacity="0.7" />

              {/* collarín, caña y paletón */}
              <path d="M10.4 -4 V4 M12.6 -4 V4" stroke="#92400E" strokeOpacity="0.55" strokeWidth="0.7" />
              <rect x="14.6" y="-2" width="28.6" height="1.2" rx="0.6" fill="#fff" opacity="0.6" />
              <path d="M14 2.1 H43.4" stroke="#78350F" strokeOpacity="0.35" strokeWidth="0.6" />
              <path d="M20 0 l1.2 -1.2 l1.2 1.2 l-1.2 1.2 Z M24.6 0 l1.2 -1.2 l1.2 1.2 l-1.2 1.2 Z" fill="#B45309" opacity="0.55" />
              <path d="M31.1 2.8 V13" stroke="#FEF3C7" strokeOpacity="0.5" strokeWidth="0.6" />

              {/* brillo que recorre la llave (hover) */}
              <g clipPath={url('keyClip')}>
                <g className="art-h-show">
                  <g className="art-h-slide" style={{ '--slide': '30px' }}>
                    <path d="M-13 -16 L-9.6 -16 L-14.6 16 L-18 16 Z" fill="#fff" opacity="0.75" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* destellos */}
      <Sparkle x={8} y={52} r={3} idle delay={0} />
      <Sparkle x={70} y={18} r={2.6} fill="#FEF3C7" idle delay={1.1} />
      <Sparkle x={40} y={69} r={2} idle delay={2.1} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={48} y={13} r={2.6} fill="#FDE68A" /></g>
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={76} y={42} r={2.2} /></g>
    </svg>
  );
};

const ICONS = {
  'primaria-1': Backpack,
  'primaria-2': Notebook,
  'primaria-3': Rocket,
  'primaria-4': Compass,
  'primaria-5': Globe,
  'primaria-6': GoldenKey,
};

export default ICONS;
