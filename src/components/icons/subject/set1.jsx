// Ilustraciones de las tarjetas de asignatura (rediseño 2026) — set 1.
// Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: lengua, matematicas, ciencias-naturales, ciencias-sociales, tutoria, valenciano, ingles, frances, programacion, historia
//
// viewBox 48×48, se pintan a 58 px sobre la tarjeta de cristal blanco (claro)
// o morada (oscuro): por eso los destellos son de color (un destello blanco
// desaparece sobre la tarjeta clara) y cada objeto lleva su aura de acento.
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

/* Lengua — Libro abierto con una «A» de caramelo flotando sobre el lomo.
   Reposo: la letra flota y titila un destello. Hover: la letra sube, el
   marcapáginas se balancea y estalla un destello. */
const Lengua = () => {
  const [id, url] = useArtIds();
  const lines = [4.6, 7.4, 10.2, 13];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#6366F1" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#1E1B4B" opacity={0.42} />
        <MaterialGradient id={id('cover')} light="#A5B4FC" base="#6366F1" dark="#312E81" />
        <MaterialGradient id={id('letter')} light="#FBCFE8" base="#EC4899" dark="#9D174D" x1={0.2} y1={0} x2={0.6} y2={1} />
        <MaterialGradient id={id('ribbon')} light="#FDA4AF" base="#F43F5E" dark="#9F1239" x1={0} y1={0.5} x2={1} y2={0.5} />
        <linearGradient id={id('pageL')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="72%" stopColor="#F4F6FF" />
          <stop offset="100%" stopColor="#C3CCFB" />
        </linearGradient>
        <linearGradient id={id('pageR')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B3BEF8" />
          <stop offset="24%" stopColor="#E6EAFF" />
          <stop offset="100%" stopColor="#D9DFFE" />
        </linearGradient>
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="24" cy="24" r="23" fill={url('aura')} />
      <ellipse cx="24" cy="43.4" rx="18" ry="2.6" fill={url('shadow')} />

      {/* tapa (asoma por los lados y por debajo) */}
      <path d="M3.4 23.6 Q14 20.4 24 24.2 Q34 20.4 44.6 23.6 L44.8 39.4 Q34 37 24 41.6 Q14 37 3.2 39.4 Z" fill={url('cover')} />
      <path d="M4.4 38.3 Q13.6 36.2 23 40.2" stroke="#C7D2FE" strokeOpacity="0.75" strokeWidth="0.7" strokeLinecap="round" />
      {/* canto de las hojas */}
      <path d="M5.5 37.3 Q14.6 34.4 24 38.4 L24 40.4 Q14.6 36.4 5.2 39 Z" fill="#E0E7FF" />
      <path d="M42.5 37.3 Q33.4 34.4 24 38.4 L24 40.4 Q33.4 36.4 42.8 39 Z" fill="#B4BFF5" />
      <path d="M6 38.2 Q14.6 35.5 23.6 39.4 M42 38.2 Q33.4 35.5 24.4 39.4" stroke="#818CF8" strokeOpacity="0.45" strokeWidth="0.45" />

      {/* páginas */}
      <path d="M24 22.4 Q14.6 18.4 5.5 21.4 L5.5 37.3 Q14.6 34.4 24 38.4 Z" fill={url('pageL')} />
      <path d="M24 22.4 Q33.4 18.4 42.5 21.4 L42.5 37.3 Q33.4 34.4 24 38.4 Z" fill={url('pageR')} />
      <path d="M5.5 21.4 Q14.6 18.4 24 22.4 Q33.4 18.4 42.5 21.4" stroke="#A5B4FC" strokeWidth="0.6" strokeLinejoin="round" />
      {lines.map((k, i) => (
        <g key={k} stroke="#6366F1" strokeOpacity="0.5" strokeWidth="0.75" strokeLinecap="round">
          <path d={`M8.6 ${21 + k} Q14.6 ${18.9 + k} ${i === 3 ? 16.4 : 21.2} ${i === 3 ? 19.6 + k : 21.9 + k}`} />
          <path d={`M26.8 ${21.9 + k} Q33.4 ${18.9 + k} ${i === 1 ? 35.2 : 39.4} ${i === 1 ? 19.3 + k : 21 + k}`} />
        </g>
      ))}
      {/* sombra que proyecta la letra sobre el lomo */}
      <ellipse cx="24" cy="23.4" rx="5.6" ry="1.2" fill="#312E81" opacity="0.22" />

      {/* marcapáginas */}
      <g className="art-h-wiggle art-o-top">
        <path d="M29.4 37.6 L29.4 45.4 L31.1 43.8 L32.8 45.4 L32.8 37.2 Z" fill={url('ribbon')} />
        <path d="M29.9 38 L29.9 44.2" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.5" strokeLinecap="round" />
      </g>

      {/* letra A flotante (trazos redondeados con volumen) */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.6s' }}>
          <g stroke="#831843" strokeWidth="3.7" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.7 0.9)">
            <path d="M16.8 18.6 L24 4.4 L31.2 18.6" />
            <path d="M20.4 13.8 H27.6" />
          </g>
          <g stroke={url('letter')} strokeWidth="3.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.8 18.6 L24 4.4 L31.2 18.6" />
            <path d="M20.4 13.8 H27.6" />
          </g>
          <path d="M18.4 16.2 L22.9 7.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
          <circle cx="23.6" cy="5.6" r="0.7" fill="#fff" opacity="0.85" />
        </g>
      </g>

      <Sparkle x={39.5} y={10.5} r={2.6} fill="#FBBF24" idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.08s' }}><Sparkle x={8.5} y={12} r={2.4} fill="#F472B6" /></g>
    </svg>
  );
};

/* Matemáticas — Calculadora con volumen y un «+» de caramelo.
   Reposo: el «+» flota y titila un destello. Hover: el «+» gira 45° y se
   convierte en «×», se pulsa la tecla «=» y la pantalla se ilumina. */
const Matematicas = () => {
  const [id, url] = useArtIds();
  const cols = [12.6, 17.5, 22.4];
  const rows = [21.4, 26, 30.6, 35.2];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#3B82F6" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#0C1A4B" opacity={0.42} />
        <MaterialGradient id={id('body')} light="#93C5FD" base="#3B82F6" dark="#1D4ED8" />
        <MaterialGradient id={id('side')} light="#1E40AF" base="#1E3A8A" dark="#172554" />
        <MaterialGradient id={id('key')} light="#FFFFFF" base="#E0E7FF" dark="#A5B4FC" x1={0.3} y1={0} x2={0.7} y2={1} />
        <MaterialGradient id={id('op')} light="#FEF3C7" base="#FBBF24" dark="#D97706" x1={0.3} y1={0} x2={0.7} y2={1} />
        <MaterialGradient id={id('plus')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <linearGradient id={id('screen')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1238" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.55} />
      </defs>

      <circle cx="24" cy="24" r="23" fill={url('aura')} />
      <ellipse cx="23" cy="43.6" rx="15" ry="2.5" fill={url('shadow')} />

      <g transform="rotate(-6 22 24)">
        {/* grosor y cuerpo */}
        <rect x="10" y="6.4" width="25" height="35.6" rx="5.6" fill={url('side')} />
        <rect x="9" y="5" width="25" height="35.6" rx="5.6" fill={url('body')} />
        <path d="M10.3 33 V10.6 Q10.3 6.3 14.6 6.3 H27" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M33.2 29 V35 Q33.2 39.8 28.4 39.8 H17" stroke="#1E3A8A" strokeOpacity="0.4" strokeWidth="1.1" strokeLinecap="round" />

        {/* pantalla */}
        <rect x="12" y="8.6" width="19" height="9.4" rx="2.3" fill={url('screen')} />
        <rect x="12" y="8.6" width="19" height="9.4" rx="2.3" fill="#22D3EE" fillOpacity="0.28" className="art-h-show" />
        <path d="M13.2 9.3 H19.4 L16.4 17.3 H13.2 Z" fill="#fff" opacity="0.09" />
        <path d="M13 18.5 H30" stroke="#DBEAFE" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />
        <text x="29.3" y="16.4" textAnchor="end" fontSize="8.4" fill="#67E8F9" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700">π</text>
        <rect x="14" y="11" width="1" height="5" rx="0.4" fill="#67E8F9" opacity="0.55" />

        {/* teclas numéricas */}
        {rows.map((y) => cols.map((x) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y + 0.6} width="4.1" height="3.5" rx="1.1" fill="#1E3A8A" opacity="0.55" />
            <rect x={x} y={y} width="4.1" height="3.5" rx="1.1" fill={url('key')} />
          </g>
        )))}
        {/* teclas de operación */}
        {rows.slice(0, 3).map((y) => (
          <g key={y}>
            <rect x="27.3" y={y + 0.6} width="4.1" height="3.5" rx="1.1" fill="#92400E" opacity="0.7" />
            <rect x="27.3" y={y} width="4.1" height="3.5" rx="1.1" fill={url('op')} />
          </g>
        ))}
        <g stroke="#7C2D12" strokeWidth="0.7" strokeLinecap="round">
          <path d="M28.6 22.4 L30.1 23.9 M30.1 22.4 L28.6 23.9" />
          <path d="M28.4 27.75 H30.3" />
          <path d="M28.4 32.35 H30.3 M29.35 31.4 V33.3" />
        </g>
        <g className="art-h-drop" style={{ '--drop': '0.7px' }}>
          <rect x="27.3" y={35.8} width="4.1" height="3.5" rx="1.1" fill="#831843" opacity="0.8" />
          <rect x="27.3" y={35.2} width="4.1" height="3.5" rx="1.1" fill={url('plus')} />
          <path d="M28.4 36.5 H30.3 M28.4 37.5 H30.3" stroke="#fff" strokeWidth="0.65" strokeLinecap="round" />
        </g>
        <rect x="11" y="6" width="18" height="2.2" rx="1.1" fill={url('gloss')} />
      </g>

      {/* «+» de caramelo: en hover gira 45° y se convierte en «×» */}
      <g transform="translate(38.6 10.4)">
        <g className="art-i-bob" style={{ '--amp': '-1.3px', '--dur': '3.8s' }}>
          <g className="art-h-spin" style={{ '--spin': '45deg' }}>
            <path d="M-4.3 0 H4.3 M0 -4.3 V4.3" stroke="#831843" strokeWidth="3.6" strokeLinecap="round" transform="translate(0.6 0.9)" />
            <path d="M-4.3 0 H4.3 M0 -4.3 V4.3" stroke={url('plus')} strokeWidth="3.6" strokeLinecap="round" />
            <path d="M-3.6 -0.6 H-1.4 M-0.6 -3.6 V-1.4" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        </g>
      </g>

      <Sparkle x={6.5} y={11} r={2.4} fill="#FBBF24" idle delay={0.9} />
    </svg>
  );
};

/* Ciencias Naturales — Brote con dos hojas brillantes sobre un montículo de
   tierra, con mariquita y gota de rocío. Reposo: la planta se mece y titila un
   destello. Hover: las hojas se abren hacia arriba y brilla la gota. */
const CienciasNaturales = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#10B981" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#1C1206" opacity={0.42} />
        <MaterialGradient id={id('soil')} light="#C08A5B" base="#8B5A2B" dark="#4A2511" />
        <MaterialGradient id={id('leafL')} light="#A7F3D0" base="#34D399" dark="#047857" />
        <MaterialGradient id={id('leafR')} light="#BBF7D0" base="#10B981" dark="#065F46" />
        <MaterialGradient id={id('bud')} light="#D9F99D" base="#84CC16" dark="#3F6212" />
        <MaterialGradient id={id('bug')} light="#FCA5A5" base="#EF4444" dark="#991B1B" />
        <linearGradient id={id('stem')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id={id('drop')} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#A5F3FC" />
          <stop offset="100%" stopColor="#0891B2" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="23" r="23" fill={url('aura')} />
      <ellipse cx="24" cy="43" rx="18" ry="2.6" fill={url('shadow')} />

      {/* planta (se mece desde la base) */}
      <g className="art-i-sway art-o-bottom" style={{ '--amp': '2.5deg', '--dur': '5s' }}>
        {/* tallo */}
        <path d="M24 36 C23.2 30 25 24.6 24.2 16.6" stroke={url('stem')} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M23.4 34 C22.9 29 24.2 24.6 23.7 19" stroke="#D1FAE5" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />

        {/* hoja izquierda (con mariquita) */}
        <g className="art-h-tilt-r" style={{ '--tilt': '9deg', transformOrigin: '100% 100%' }}>
          <path d="M24 27.6 C17.6 28.4 8.4 24.8 5.2 14.4 C13.4 12.6 22.2 17 24 27.6 Z" fill={url('leafL')} />
          <path d="M23.6 27 C18.4 22.8 12 18.4 7.4 15.6" stroke="#065F46" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M13 20 L12.6 17.2 M17.2 23 L17.4 20.4 M13.8 21 L10.8 21.4 M18 24 L15.6 25" stroke="#065F46" strokeOpacity="0.3" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M7.4 15.4 C12.6 14.6 18.6 17.2 21.6 22.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" />
          {/* mariquita */}
          <ellipse cx="13.6" cy="22.6" rx="2.9" ry="2.5" fill="#450A0A" opacity="0.25" transform="rotate(-30 13.6 22.6)" />
          <circle cx="11.6" cy="20.4" r="1.3" fill="#1E1B4B" />
          <ellipse cx="13.2" cy="22" rx="2.8" ry="2.4" fill={url('bug')} transform="rotate(-30 13.2 22)" />
          <path d="M11.8 20.6 L14.6 23.4" stroke="#1E1B4B" strokeWidth="0.5" />
          <circle cx="12.3" cy="22.4" r="0.6" fill="#1E1B4B" />
          <circle cx="14.2" cy="21.4" r="0.6" fill="#1E1B4B" />
          <circle cx="13.8" cy="23.6" r="0.45" fill="#1E1B4B" />
          <circle cx="12.6" cy="20.9" r="0.45" fill="#fff" opacity="0.8" />
        </g>

        {/* hoja derecha (con gota de rocío) */}
        <g className="art-h-tilt" style={{ '--tilt': '-9deg', transformOrigin: '0% 100%' }}>
          <path d="M24.2 22 C25.6 12.4 33.6 6.8 43 7.6 C41.2 17.6 32.6 23.2 24.2 22 Z" fill={url('leafR')} />
          <path d="M24.8 21.4 C29.4 16.8 35.6 12.2 41.2 9.4" stroke="#064E3B" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M31 16.6 L30.4 13.8 M35.4 13.6 L35.2 11 M31.6 16.4 L34.4 17.2 M36 13.4 L38.6 14" stroke="#064E3B" strokeOpacity="0.3" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M26 18.4 C28 13 33.4 9.2 39.6 8.6" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="35.4" cy="16.4" r="1.9" fill={url('drop')} />
          <circle cx="34.8" cy="15.8" r="0.55" fill="#fff" />
        </g>

        {/* yema */}
        <path d="M24.2 17.4 C21.4 14.2 21.8 10.2 24.6 7.8 C27 10.6 26.8 14.6 24.2 17.4 Z" fill={url('bud')} />
        <path d="M23.4 14.6 C22.8 12.6 23.2 10.6 24.4 9.2" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
      </g>

      {/* montículo de tierra */}
      <path d="M6.4 41.4 C8 35.4 15 32.8 24 32.8 C33 32.8 40 35.4 41.6 41.4 Q24 43.8 6.4 41.4 Z" fill={url('soil')} />
      <path d="M9.6 37.4 C12.6 35 17.6 33.8 23 33.7" stroke="#E7C29A" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="17" cy="38.6" rx="1.6" ry="0.9" fill="#D6A574" opacity="0.7" />
      <ellipse cx="30.6" cy="37.4" rx="1.2" ry="0.7" fill="#D6A574" opacity="0.6" />
      <ellipse cx="25.4" cy="40" rx="1" ry="0.6" fill="#3B1D0A" opacity="0.5" />
      <path d="M11.6 36.4 L10.8 33.6 M12.4 36 L13 33.2 M35.8 36.4 L36.6 33.8 M36.6 36.8 L38.2 34.6" stroke="#22C55E" strokeWidth="0.8" strokeLinecap="round" />

      <Sparkle x={40.5} y={27} r={2.3} fill="#FBBF24" idle delay={0.6} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={37.8} y={13.6} r={2.6} fill="#67E8F9" /></g>
    </svg>
  );
};

/* Ciencias Sociales — Globo terráqueo de sobremesa con meridiano de latón.
   Reposo: titilan dos destellos. Hover: los continentes «giran» (se deslizan
   dentro de la esfera) y cae un pin de ubicación. */
const CienciasSociales = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#14B8A6" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#042F2E" opacity={0.42} />
        <radialGradient id={id('ocean')} cx="0.36" cy="0.3" r="0.78">
          <stop offset="0%" stopColor="#99F6E4" />
          <stop offset="35%" stopColor="#2DD4BF" />
          <stop offset="75%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#115E59" />
        </radialGradient>
        <radialGradient id={id('shade')} cx="0.36" cy="0.3" r="0.78">
          <stop offset="55%" stopColor="#042F2E" stopOpacity="0" />
          <stop offset="100%" stopColor="#042F2E" stopOpacity="0.5" />
        </radialGradient>
        <MaterialGradient id={id('land')} light="#ECFCCB" base="#A3E635" dark="#4D7C0F" />
        <MaterialGradient id={id('brass')} light="#FEF3C7" base="#F59E0B" dark="#92400E" />
        <MaterialGradient id={id('pin')} light="#FDA4AF" base="#F43F5E" dark="#9F1239" />
        <GlossGradient id={id('gloss')} opacity={0.75} />
        <clipPath id={id('sphere')}><circle cx="23" cy="20" r="14.2" /></clipPath>
      </defs>

      <circle cx="24" cy="22" r="23" fill={url('aura')} />
      <ellipse cx="24" cy="43.8" rx="14" ry="2.3" fill={url('shadow')} />

      {/* pie */}
      <rect x="21.9" y="35.6" width="2.4" height="4.6" rx="0.8" fill="#B45309" />
      <path d="M14.6 43.4 C14.6 40.6 18.4 39.4 23 39.4 C27.6 39.4 31.4 40.6 31.4 43.4 Z" fill={url('brass')} />
      <path d="M16.6 41.4 C18.4 40.4 21 40.1 23.4 40.1" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />

      {/* esfera */}
      <circle cx="23" cy="20" r="14.2" fill={url('ocean')} />
      <g clipPath={url('sphere')}>
        <g className="art-h-slide" style={{ '--slide': '5px' }}>
          <g fill={url('land')}>
            <path d="M9 9.6 C12 7 17 7 19.6 9 C20.9 10.5 19.1 12.5 17.6 13.1 C16.1 13.7 15.7 15.9 14.1 17.1 C12.7 18.1 11.1 16.5 10.3 14.7 C9.5 12.9 8 11.6 9 9.6 Z" />
            <path d="M15.6 20.6 C17.9 19.8 19.9 21.2 19.7 23.6 C19.5 26.2 17.9 28.6 16.7 31.2 C16.1 32.4 14.9 32 14.9 30.6 C14.9 28 13.9 26.2 13.7 24.2 C13.5 22.2 14.1 21 15.6 20.6 Z" />
            <path d="M25 8.6 C27 7.2 30 7.6 31.6 9 C32.4 10.2 30.8 11.2 29.4 11.6 C28 12 26.4 12.2 25.4 11.4 C24.6 10.6 24.4 9.4 25 8.6 Z" />
            <path d="M26 14 C28.6 13.2 32 13.6 33.6 15.4 C34.8 16.8 34 18.6 33 20 C32 21.6 31.6 24.2 30 26.2 C29 27.4 27.6 27 27.2 25.4 C26.6 23.2 26.8 21.2 25.6 19.6 C24.4 18 24 14.8 26 14 Z" />
            <path d="M34.4 8 C37.4 7.4 40 9 40.6 11.4 L40.6 16 C38.6 16.2 36.6 14.6 35.4 13.2 C34.2 11.8 33.4 9 34.4 8 Z" />
            <path d="M33.8 25.4 C35.4 24.8 37.4 25.6 37.6 27 C37.8 28.4 36 29.2 34.6 28.8 C33.4 28.4 32.8 26.2 33.8 25.4 Z" />
            <path d="M1 11 C3 9.5 6 10 6.6 12 C7 14 5 15.4 3 15 C1.4 14.6 0.2 12.4 1 11 Z" />
            <path d="M2.4 22 C4 21.2 5.8 22 6 23.6 C6.2 25.2 4.6 26 3.2 25.6 C2 25.2 1.4 22.8 2.4 22 Z" />
          </g>
        </g>
        {/* rejilla y sombreado de volumen */}
        <ellipse cx="23" cy="20" rx="14.2" ry="4.6" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.55" />
        <ellipse cx="23" cy="20" rx="6.4" ry="14.2" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.55" />
        <circle cx="23" cy="20" r="14.2" fill={url('shade')} />
      </g>
      <path d="M10.6 14.4 C12.4 9.6 16.4 6.6 21 6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
      <ellipse cx="17" cy="12" rx="4.6" ry="2.6" transform="rotate(-38 17 12)" fill={url('gloss')} />
      <circle cx="15.2" cy="11.8" r="0.9" fill="#fff" opacity="0.9" />

      {/* meridiano de latón y ejes */}
      <path d="M23 3.2 A16.8 16.8 0 0 1 23 36.8" stroke="#78350F" strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" transform="translate(0.5 0.5)" />
      <path d="M23 3.2 A16.8 16.8 0 0 1 23 36.8" stroke={url('brass')} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M27.4 4.2 A16.2 16.2 0 0 1 39 17" stroke="#FEF3C7" strokeOpacity="0.8" strokeWidth="0.6" strokeLinecap="round" />
      <circle cx="23" cy="3.4" r="1.4" fill={url('brass')} />
      <circle cx="23" cy="36.6" r="1.4" fill={url('brass')} />

      {/* pin de ubicación (aparece en hover) */}
      <g className="art-h-show">
        <g className="art-h-jump" style={{ '--jump': '-4px' }}>
          <path d="M28.6 13.6 C26.4 10.6 25.8 9.6 25.8 8.4 C25.8 6.8 27.1 5.6 28.6 5.6 C30.1 5.6 31.4 6.8 31.4 8.4 C31.4 9.6 30.8 10.6 28.6 13.6 Z" fill={url('pin')} />
          <circle cx="28.6" cy="8.4" r="1.1" fill="#fff" />
        </g>
      </g>

      <Sparkle x={41.5} y={33} r={2.2} fill="#FBBF24" idle delay={0.3} />
      <Sparkle x={5} y={30} r={1.8} fill="#2DD4BF" idle delay={1.6} />
    </svg>
  );
};

/* Tutoría — Tutor y alumno abrazados bajo un corazón.
   Reposo: el corazón late y titila un destello. Hover: el corazón sube y
   crece y las cabezas se inclinan la una hacia la otra. */
const Tutoria = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#F59E0B" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#451A03" opacity={0.4} />
        <MaterialGradient id={id('tutor')} light="#FDE68A" base="#F59E0B" dark="#B45309" />
        <MaterialGradient id={id('tutorHead')} light="#FEF3C7" base="#FCD34D" dark="#D97706" />
        <MaterialGradient id={id('kid')} light="#C4B5FD" base="#8B5CF6" dark="#5B21B6" />
        <MaterialGradient id={id('kidHead')} light="#EDE9FE" base="#C4B5FD" dark="#7C3AED" />
        <MaterialGradient id={id('heart')} light="#FDA4AF" base="#F43F5E" dark="#9F1239" />
      </defs>

      <circle cx="24" cy="24" r="23" fill={url('aura')} />
      <ellipse cx="24" cy="43.2" rx="18" ry="2.5" fill={url('shadow')} />

      {/* tutor (detrás, a la izquierda) */}
      <path d="M5.4 40.4 C5.4 30.6 10.2 25.4 17 25.4 C23.8 25.4 28.4 30.6 28.4 40.4 Q28.4 42.4 26.4 42.4 L7.4 42.4 Q5.4 42.4 5.4 40.4 Z" fill={url('tutor')} />
      <path d="M7.4 37.6 C7.6 31.4 10.8 27.6 15.2 27" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
      <g className="art-h-tilt-r art-o-bottom" style={{ '--tilt': '8deg' }}>
        <circle cx="17" cy="16.6" r="6.4" fill={url('tutorHead')} />
        <path d="M10.9 15.2 C11.4 11.2 14.2 9.8 17 9.8 C20.6 9.8 22.8 12 23.2 14.6 C20.4 14.4 17.8 13.2 16.4 11.6 C15.2 13.4 13 14.8 10.9 15.2 Z" fill="#B45309" />
        <path d="M12.6 13.4 C13.6 12 14.8 11.2 16 11" stroke="#FDE68A" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />
        <circle cx="16.6" cy="17" r="0.85" fill="#451A03" />
        <circle cx="20.2" cy="17" r="0.85" fill="#451A03" />
        <path d="M16.9 19.6 Q18.4 20.9 19.9 19.6" stroke="#451A03" strokeWidth="0.7" strokeLinecap="round" />
        <ellipse cx="14.6" cy="19.2" rx="1.1" ry="0.7" fill="#F43F5E" opacity="0.35" />
        <ellipse cx="21.8" cy="19.2" rx="1" ry="0.7" fill="#F43F5E" opacity="0.35" />
      </g>

      {/* alumno (delante, a la derecha) */}
      <path d="M22.6 40.6 C22.6 33.6 26.6 30 31.6 30 C36.6 30 40.6 33.6 40.6 40.6 Q40.6 42.6 38.6 42.6 L24.6 42.6 Q22.6 42.6 22.6 40.6 Z" fill={url('kid')} />
      <path d="M24.6 38.6 C24.8 34.4 27 31.8 30 31.4" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-9deg' }}>
        <circle cx="31.6" cy="23.6" r="5.2" fill={url('kidHead')} />
        <path d="M26.6 22.4 C27 19.4 29.2 18.2 31.6 18.2 C34.2 18.2 36.2 19.8 36.6 22 C34.4 21.6 32.6 20.8 31.4 19.6 C30.2 21 28.4 22 26.6 22.4 Z" fill="#6D28D9" />
        <circle cx="29.2" cy="24" r="0.75" fill="#2E1065" />
        <circle cx="32.2" cy="24" r="0.75" fill="#2E1065" />
        <path d="M29.6 26.1 Q30.7 27.1 31.8 26.1" stroke="#2E1065" strokeWidth="0.65" strokeLinecap="round" />
        <ellipse cx="27.8" cy="25.8" rx="0.9" ry="0.6" fill="#F43F5E" opacity="0.35" />
        <ellipse cx="33.8" cy="25.8" rx="0.9" ry="0.6" fill="#F43F5E" opacity="0.35" />
      </g>

      {/* brazo del tutor sobre el hombro del alumno */}
      <path d="M24.4 32.6 C28 30.4 32.4 30.4 36.2 32.6" stroke="#B45309" strokeWidth="3.2" strokeLinecap="round" transform="translate(0.3 0.6)" />
      <path d="M24.4 32.6 C28 30.4 32.4 30.4 36.2 32.6" stroke={url('tutor')} strokeWidth="3" strokeLinecap="round" />
      <circle cx="36.4" cy="32.8" r="1.8" fill={url('tutorHead')} />
      <path d="M26 31.6 C28.4 30.4 31 30.2 33.4 30.8" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />

      {/* corazón */}
      <g className="art-h-lift" style={{ '--lift': '-2.5px' }}>
        <g className="art-h-pop" style={{ '--pop': '1.18' }}>
          <g className="art-i-pulse" style={{ '--amp': '1.1', '--dur': '1.8s' }}>
            <path d="M25.4 13.6 C23.9 12.4 20.4 10 20.4 6.9 C20.4 5 21.8 3.8 23.3 3.8 C24.3 3.8 25 4.4 25.4 5.2 C25.8 4.4 26.5 3.8 27.5 3.8 C29 3.8 30.4 5 30.4 6.9 C30.4 10 26.9 12.4 25.4 13.6 Z" fill="#881337" transform="translate(0.5 0.7)" />
            <path d="M25.4 13.6 C23.9 12.4 20.4 10 20.4 6.9 C20.4 5 21.8 3.8 23.3 3.8 C24.3 3.8 25 4.4 25.4 5.2 C25.8 4.4 26.5 3.8 27.5 3.8 C29 3.8 30.4 5 30.4 6.9 C30.4 10 26.9 12.4 25.4 13.6 Z" fill={url('heart')} />
            <ellipse cx="22.8" cy="6.2" rx="1.2" ry="0.8" transform="rotate(-35 22.8 6.2)" fill="#fff" opacity="0.8" />
          </g>
        </g>
      </g>

      <Sparkle x={39.5} y={10} r={2.5} fill="#F472B6" idle delay={0.5} />
      <Sparkle x={8} y={6.5} r={1.8} fill="#FBBF24" />
    </svg>
  );
};

/* Valenciano — Naranja brillante con hojas y una senyera ondeando en un
   palillo dorado. Reposo: la bandera ondea suave y titila un destello.
   Hover: la bandera se agita, la hoja se mece y estalla un destello. */
const senyeraWave = (y) => `M29.6 ${y} C33.2 ${y - 1.7} 36.8 ${y + 1.7} 40.4 ${y} C42.2 ${y - 0.9} 44 ${y - 0.9} 45.8 ${y - 0.2}`;
const senyeraBack = (y) => `L45.8 ${y - 0.2} C44 ${y - 0.9} 42.2 ${y - 0.9} 40.4 ${y} C36.8 ${y + 1.7} 33.2 ${y - 1.7} 29.6 ${y} Z`;
const stripe = (y0, y1) => `${senyeraWave(y0)} ${senyeraBack(y1)}`;

const Valenciano = () => {
  const [id, url] = useArtIds();
  const h = 13.4 / 9;
  const bars = [0, 1, 2, 3].map((i) => 3.8 + h * (2 * i + 1));
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#F97316" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#431407" opacity={0.42} />
        <radialGradient id={id('orange')} cx="0.36" cy="0.32" r="0.78">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="28%" stopColor="#FB923C" />
          <stop offset="70%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </radialGradient>
        <MaterialGradient id={id('leaf')} light="#BBF7D0" base="#22C55E" dark="#166534" />
        <MaterialGradient id={id('leaf2')} light="#86EFAC" base="#16A34A" dark="#14532D" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0.5} x2={1} y2={0.5} />
        <linearGradient id={id('folds')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="18%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#7C2D12" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#7C2D12" stopOpacity="0.2" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.7} />
      </defs>

      <circle cx="23" cy="24" r="23" fill={url('aura')} />
      <ellipse cx="21" cy="43.4" rx="14" ry="2.4" fill={url('shadow')} />

      {/* palillo con la senyera */}
      <rect x="28.9" y="2.8" width="1.4" height="21" rx="0.7" fill={url('gold')} />
      <circle cx="29.6" cy="2.6" r="1.35" fill="#FBBF24" />
      <circle cx="29.2" cy="2.2" r="0.45" fill="#fff" />
      <g className="art-h-wiggle art-o-left">
        <g className="art-i-sway art-o-left" style={{ '--amp': '3deg', '--dur': '3.2s' }}>
          <path d={stripe(3.8, 17.2)} fill="#FCD34D" />
          {bars.map((y) => <path key={y} d={stripe(y, y + h)} fill="#DC2626" />)}
          <path d="M29.6 3.8 C31.1 3.1 32.6 3 34 3.5 L34 16.9 C32.6 16.4 31.1 16.5 29.6 17.2 Z" fill="#1D4ED8" />
          <path d="M30.5 6.9 L31 5.5 L31.8 6.4 L32.6 5.5 L33.1 6.9 Z" fill="#FBBF24" />
          <path d={stripe(3.8, 17.2)} fill={url('folds')} />
        </g>
      </g>

      {/* naranja */}
      <circle cx="19.5" cy="29" r="13.2" fill={url('orange')} />
      <path d="M8.2 25.6 C9.4 21 12.8 17.6 17.4 16.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M31 34.6 C29.4 38.6 25.6 41.6 21 42" stroke="#FDBA74" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
      <ellipse cx="14.6" cy="22.6" rx="4.4" ry="2.6" transform="rotate(-35 14.6 22.6)" fill={url('gloss')} />
      <circle cx="13" cy="22.4" r="0.9" fill="#fff" opacity="0.9" />
      <g fill="#7C2D12" opacity="0.25">
        <circle cx="22" cy="25" r="0.45" /><circle cx="26" cy="29" r="0.45" /><circle cx="18" cy="33" r="0.45" />
        <circle cx="24" cy="35.4" r="0.45" /><circle cx="13.4" cy="30" r="0.45" /><circle cx="28" cy="24" r="0.4" />
      </g>
      <g fill="#FFEDD5" opacity="0.45">
        <circle cx="19" cy="26" r="0.4" /><circle cx="15.6" cy="27.4" r="0.35" /><circle cx="21.4" cy="21.4" r="0.35" />
      </g>

      {/* rabito y hojas */}
      <path d="M19.4 16.6 C19.4 15.4 19.8 14.6 20.4 14" stroke="#3F6212" strokeWidth="1.4" strokeLinecap="round" />
      <g className="art-h-tilt" style={{ '--tilt': '-10deg', transformOrigin: '100% 100%' }}>
        <path d="M19.6 15.6 C16.4 10.6 10.6 8.6 6 9.6 C8.2 14.6 13.8 17 19.6 15.6 Z" fill={url('leaf')} />
        <path d="M19 15.2 C15.4 12.8 11.2 11.2 7.6 10.4" stroke="#14532D" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M8 10.2 C11.6 9.8 15.4 11.2 17.8 13.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
      </g>
      <path d="M20.6 15.4 C21.6 12.4 24.2 10.6 27 10.8 C26 13.8 23.4 15.6 20.6 15.4 Z" fill={url('leaf2')} />

      <Sparkle x={41} y={25} r={2.4} fill="#FBBF24" idle delay={0.7} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={5} y={20} r={2.3} fill="#F472B6" /></g>
    </svg>
  );
};

/* Inglés — Union Jack ondeando en un mástil dorado.
   Reposo: la bandera ondea suave y titila un destello. Hover: la bandera se
   agita y el remate del mástil lanza un destello. */
const ukWave = (y) => `M10 ${y} C16 ${y - 3.6} 22 ${y + 3.6} 28 ${y} C32 ${y - 2.4} 38 ${y - 2.6} 43.6 ${y - 0.4}`;
const ukBack = (y) => `L43.6 ${y - 0.4} C38 ${y - 2.6} 32 ${y - 2.4} 28 ${y} C22 ${y + 3.6} 16 ${y - 3.6} 10 ${y} Z`;

const Ingles = () => {
  const [id, url] = useArtIds();
  const top = 7.5;
  const bottom = 31;
  const mid = (top + bottom) / 2;
  const flag = `${ukWave(top)} ${ukBack(bottom)}`;
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#2563EB" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#0C1A4B" opacity={0.42} />
        <MaterialGradient id={id('navy')} light="#2E4DB8" base="#1E3A8A" dark="#172554" />
        <MaterialGradient id={id('base')} light="#FDE68A" base="#D97706" dark="#78350F" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" x1={0} y1={0.5} x2={1} y2={0.5} />
        <radialGradient id={id('knob')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
        <linearGradient id={id('folds')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.12" />
          <stop offset="14%" stopColor="#fff" stopOpacity="0.36" />
          <stop offset="27%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="42%" stopColor="#0F172A" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="78%" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.34" />
        </linearGradient>
        <clipPath id={id('flag')}><path d={flag} /></clipPath>
      </defs>

      <circle cx="25" cy="23" r="23" fill={url('aura')} />
      <ellipse cx="22" cy="43.8" rx="16" ry="2.4" fill={url('shadow')} />

      {/* mástil y base */}
      <rect x="8.2" y="4.6" width="1.9" height="38" rx="0.9" fill={url('gold')} />
      <path d="M4.8 44 C4.8 41.6 6.8 40.6 9.15 40.6 C11.5 40.6 13.5 41.6 13.5 44 Z" fill={url('base')} />
      <path d="M6.2 42.6 C6.8 41.8 7.8 41.4 9 41.3" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />

      {/* bandera */}
      <g className="art-h-wiggle art-o-left">
        <g className="art-i-sway art-o-left" style={{ '--amp': '2.5deg', '--dur': '3.4s' }}>
          <g clipPath={url('flag')}>
            <rect x="8" y="2" width="38" height="34" fill={url('navy')} />
            <path d={`M10 ${top} L43.6 ${bottom - 0.4} M43.6 ${top - 0.4} L10 ${bottom}`} stroke="#fff" strokeWidth="4.6" />
            <path d={`M10 ${top} L43.6 ${bottom - 0.4} M43.6 ${top - 0.4} L10 ${bottom}`} stroke="#DC2626" strokeWidth="1.5" />
            <rect x="23.6" y="0" width="6" height="40" fill="#fff" />
            <path d={ukWave(mid)} stroke="#fff" strokeWidth="6" />
            <rect x="25.1" y="0" width="3" height="40" fill="#DC2626" />
            <path d={ukWave(mid)} stroke="#DC2626" strokeWidth="3" />
            <path d={flag} fill={url('folds')} />
          </g>
          <path d={ukWave(top)} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
        </g>
      </g>

      {/* remate del mástil */}
      <circle cx="9.15" cy="4.2" r="2.1" fill={url('knob')} />
      <circle cx="8.5" cy="3.5" r="0.6" fill="#fff" />
      <g className="art-h-burst" style={{ '--d': '.05s' }}><Sparkle x={9.15} y={4.2} r={4} fill="#FBBF24" /></g>

      <Sparkle x={40} y={38} r={2.4} fill="#FBBF24" idle delay={0.5} />
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={30} y={38.6} r={1.8} fill="#F472B6" /></g>
    </svg>
  );
};

/* Francés — Bocadillo de diálogo con la tricolor y la Torre Eiffel delante.
   Reposo: titila la baliza de la torre y un destello. Hover: el bocadillo se
   agita «hablando», la torre se eleva y estalla un destello en la punta. */
const Frances = () => {
  const [id, url] = useArtIds();
  const bubble = 'M22.4 5 H37 Q44 5 44 12 V19.6 Q44 26.6 37.4 26.8 L39.8 32.6 L31.6 26.8 H22.4 Q15.4 26.8 15.4 19.8 V12 Q15.4 5 22.4 5 Z';
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#2563EB" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#0C1A4B" opacity={0.42} />
        <MaterialGradient id={id('blue')} light="#60A5FA" base="#2563EB" dark="#1E3A8A" />
        <MaterialGradient id={id('white')} light="#FFFFFF" base="#F1F5F9" dark="#CBD5E1" />
        <MaterialGradient id={id('red')} light="#FCA5A5" base="#EF4444" dark="#991B1B" />
        <MaterialGradient id={id('tower')} light="#FDE68A" base="#D97706" dark="#78350F" x1={0} y1={0.3} x2={1} y2={0.7} />
        <linearGradient id={id('puff')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.22" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.75} />
        <GlowGradient id={id('beacon')} color="#FDE68A" opacity={0.95} mid={0.3} />
        <clipPath id={id('bubble')}><path d={bubble} /></clipPath>
      </defs>

      <circle cx="25" cy="22" r="23" fill={url('aura')} />
      <ellipse cx="22" cy="43.6" rx="16" ry="2.4" fill={url('shadow')} />

      {/* bocadillo con la tricolor */}
      <g className="art-h-wiggle" style={{ transformOrigin: '80% 100%' }}>
        <path d={bubble} fill="#1E1B4B" opacity="0.5" transform="translate(0.8 1.3)" />
        <g clipPath={url('bubble')}>
          <rect x="15" y="4" width="10" height="30" fill={url('blue')} />
          <rect x="24.8" y="4" width="9.8" height="30" fill={url('white')} />
          <rect x="34.4" y="4" width="10" height="30" fill={url('red')} />
          <path d={bubble} fill={url('puff')} />
          <rect x="18" y="6.4" width="23" height="3.4" rx="1.7" fill={url('gloss')} />
        </g>
        <path d={bubble} stroke="#1E3A8A" strokeOpacity="0.35" strokeWidth="0.6" />
        <path d="M16.6 19 V12.4 Q16.6 6.2 22.6 6.2 H30" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      {/* Torre Eiffel */}
      <g className="art-h-lift" style={{ '--lift': '-2px' }}>
        <g fill={url('tower')}>
          <path d="M10.9 3.2 H11.5 L11.6 6.4 H10.8 Z" />
          <path d="M10.6 6.4 H11.8 L12.9 16 H9.5 Z" />
          <rect x="8.4" y="15.8" width="5.6" height="1.6" rx="0.5" />
          <path d="M9.2 17.4 H13.2 L15.4 27 H7 Z" />
          <rect x="5.6" y="26.8" width="11.2" height="1.8" rx="0.6" />
          <path d="M6.6 28.6 H15.8 L19.6 42.6 H15.6 C15.2 38.4 13.6 35.8 11.2 35.8 C8.8 35.8 7.2 38.4 6.8 42.6 H2.8 Z" />
        </g>
        <g stroke="#78350F" strokeOpacity="0.55" strokeWidth="0.5" strokeLinecap="round">
          <path d="M9.6 19.2 L12.8 25.4 M12.8 19.2 L9.6 25.4" />
          <path d="M7.4 30.4 L10 33.6 M15 30.4 L12.4 33.6" />
          <path d="M10.4 8.6 L12 14 M12 8.6 L10.4 14" />
        </g>
        <path d="M10.7 6.6 L9.7 15.8 M9.4 17.6 L7.3 26.8 M6.7 28.8 L3.2 42.2" stroke="#FEF3C7" strokeOpacity="0.85" strokeWidth="0.6" strokeLinecap="round" />
        <circle cx="11.2" cy="3.2" r="3" fill={url('beacon')} className="art-i-glow" style={{ '--lo': '.3', '--dur': '2.4s' }} />
        <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={11.2} y={3.2} r={3.4} fill="#FBBF24" /></g>
      </g>

      <Sparkle x={42.5} y={37} r={2.3} fill="#F472B6" idle delay={0.8} />
    </svg>
  );
};

/* Programación — Ventana de código con una ficha «</>» de cristal delante.
   Reposo: parpadea el cursor y titila un destello. Hover: la ficha crece,
   una línea de código se desplaza (como si se escribiera) y estalla un destello. */
const Programacion = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#06B6D4" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#083344" opacity={0.42} />
        <MaterialGradient id={id('win')} light="#3730A3" base="#1E1B4B" dark="#0F0A2E" />
        <MaterialGradient id={id('bar')} light="#4F46E5" base="#3730A3" dark="#312E81" x1={0} y1={0} x2={0} y2={1} />
        <MaterialGradient id={id('chip')} light="#A5F3FC" base="#22D3EE" dark="#0E7490" />
        <GlossGradient id={id('gloss')} opacity={0.7} />
      </defs>

      <circle cx="24" cy="23" r="23" fill={url('aura')} />
      <ellipse cx="25" cy="43.6" rx="17" ry="2.4" fill={url('shadow')} />

      {/* ventana del editor */}
      <rect x="5" y="7.4" width="33" height="28" rx="4.6" fill="#0B0820" opacity="0.6" transform="translate(0.9 1.3)" />
      <rect x="5" y="7.4" width="33" height="28" rx="4.6" fill={url('win')} />
      <path d="M5 12.6 V12 Q5 7.4 9.6 7.4 H33.4 Q38 7.4 38 12 V12.6 Z" fill={url('bar')} />
      <path d="M6 12 Q6 8.4 9.6 8.4 H24" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.7" strokeLinecap="round" />
      <circle cx="9.4" cy="10.1" r="1.1" fill="#F472B6" />
      <circle cx="12.8" cy="10.1" r="1.1" fill="#FBBF24" />
      <circle cx="16.2" cy="10.1" r="1.1" fill="#34D399" />
      <path d="M6 30 V17" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.8" strokeLinecap="round" />

      {/* líneas de código */}
      <rect x="8.6" y="15.4" width="4.6" height="1.7" rx="0.85" fill="#22D3EE" />
      <rect x="14.4" y="15.4" width="8" height="1.7" rx="0.85" fill="#A78BFA" />
      <rect x="11.6" y="19.4" width="5.6" height="1.7" rx="0.85" fill="#F472B6" />
      <rect x="18.4" y="19.4" width="7.4" height="1.7" rx="0.85" fill="#FBBF24" />
      <g className="art-h-slide" style={{ '--slide': '2.5px' }}>
        <rect x="11.6" y="23.4" width="9" height="1.7" rx="0.85" fill="#34D399" />
      </g>
      <rect x="8.6" y="27.4" width="3.8" height="1.7" rx="0.85" fill="#22D3EE" />
      <rect x="13.6" y="27.4" width="4.4" height="1.7" rx="0.85" fill="#A78BFA" />
      <rect x="19.2" y="26.8" width="1.3" height="2.9" rx="0.5" fill="#67E8F9" className="art-i-glow" style={{ '--lo': '.15', '--dur': '1.4s' }} />

      {/* ficha </> de cristal */}
      <g className="art-h-pop" style={{ '--pop': '1.1' }}>
        <rect x="23.6" y="25.4" width="20.4" height="15" rx="5" fill="#0E7490" transform="translate(0 1.4)" />
        <rect x="23.6" y="25.4" width="20.4" height="15" rx="5" fill={url('chip')} />
        <rect x="25.6" y="26.4" width="16" height="4" rx="2" fill={url('gloss')} />
        <path d="M24.8 35.4 V30.4 Q24.8 26.6 28.6 26.6 H33" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
        <g stroke="#155E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 0.8)">
          <path d="M30.2 29.4 L27.4 32.9 L30.2 36.4" />
          <path d="M35 29 L32.6 36.8" />
          <path d="M37.4 29.4 L40.2 32.9 L37.4 36.4" />
        </g>
        <g stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M30.2 29.4 L27.4 32.9 L30.2 36.4" />
          <path d="M35 29 L32.6 36.8" />
          <path d="M37.4 29.4 L40.2 32.9 L37.4 36.4" />
        </g>
      </g>

      <Sparkle x={42} y={10} r={2.5} fill="#FBBF24" idle delay={0.3} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={44} y={22} r={2.2} fill="#F472B6" /></g>
    </svg>
  );
};

/* Historia — Pergamino desplegado con sello de lacre y pluma.
   Reposo: titilan dos destellos. Hover: la pluma «escribe» (se agita desde la
   punta), el sello crece y estalla un destello. */
const Historia = () => {
  const [id, url] = useArtIds();
  const roll = (y) => (
    <g>
      <rect x="9" y={y} width="28" height="5.4" rx="2.7" fill={url('roll')} />
      <path d={`M10.8 ${y + 1.3} H35.2`} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
      <ellipse cx="9" cy={y + 2.7} rx="1.6" ry="2.7" fill={url('wood')} />
      <ellipse cx="37" cy={y + 2.7} rx="1.6" ry="2.7" fill={url('wood')} />
      <ellipse cx="6.4" cy={y + 2.7} rx="1.6" ry="1.9" fill={url('wood')} />
      <ellipse cx="39.6" cy={y + 2.7} rx="1.6" ry="1.9" fill={url('wood')} />
      <ellipse cx="6" cy={y + 2.1} rx="0.5" ry="0.6" fill="#fff" opacity="0.6" />
      <ellipse cx="39.2" cy={y + 2.1} rx="0.5" ry="0.6" fill="#fff" opacity="0.5" />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#D97706" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#451A03" opacity={0.42} />
        <MaterialGradient id={id('paper')} light="#FFFBEB" base="#FDE8B6" dark="#E9B872" />
        <linearGradient id={id('roll')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="40%" stopColor="#F8D79A" />
          <stop offset="85%" stopColor="#D69A4A" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>
        <MaterialGradient id={id('wood')} light="#D6A574" base="#92400E" dark="#451A03" />
        <MaterialGradient id={id('seal')} light="#FCA5A5" base="#DC2626" dark="#7F1D1D" />
        <MaterialGradient id={id('quill')} light="#EDE9FE" base="#A78BFA" dark="#5B21B6" />
        <linearGradient id={id('edge')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400E" stopOpacity="0" />
          <stop offset="100%" stopColor="#92400E" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <circle cx="24" cy="24" r="23" fill={url('aura')} />
      <ellipse cx="23" cy="43.6" rx="17" ry="2.4" fill={url('shadow')} />

      {/* pergamino */}
      <path d="M11 9 H35 C34.4 15 35.6 21 35 27 C34.6 31 35.4 34 35 38 H11 C11.6 33 10.4 28 11 23 C11.4 18 10.6 13.6 11 9 Z" fill={url('paper')} />
      <path d="M29 9 H35 C34.4 15 35.6 21 35 27 C34.6 31 35.4 34 35 38 H29 Z" fill={url('edge')} />
      <path d="M12.4 12 C12 16 12.8 20 12.4 24" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />
      <g stroke="#92400E" strokeOpacity="0.55" strokeWidth="0.75" strokeLinecap="round">
        <path d="M15 14.8 H27" strokeWidth="1.3" strokeOpacity="0.7" />
        <path d="M15 19 H31" />
        <path d="M15 22.4 H29.6" />
        <path d="M15 25.8 H31" />
        <path d="M15 29.2 H24.6" />
      </g>

      {/* rodillos con pomos de madera */}
      {roll(5.4)}
      {roll(35.6)}

      {/* sello de lacre con cintas */}
      <path d="M27.4 37.6 L25.8 44.4 L27.6 43.4 L28.6 45 L30 38.4 Z" fill="#B91C1C" />
      <path d="M30.6 38.4 L32.6 44.8 L33.6 43.2 L35.4 43.8 L33 37.6 Z" fill="#991B1B" />
      <g className="art-h-pop" style={{ '--pop': '1.18' }}>
        <path d="M30.2 30.2 C31.6 29.6 33 30.4 33.8 31 C35 31.2 36 32.4 35.8 33.8 C36.4 35 35.8 36.6 34.6 37.2 C34 38.4 32.4 38.8 31.2 38.4 C29.8 38.8 28.4 38 27.8 36.8 C26.8 36 26.6 34.4 27.2 33.4 C27.2 31.8 28.6 30.4 30.2 30.2 Z" fill={url('seal')} />
        <circle cx="31.4" cy="34.4" r="2.6" stroke="#7F1D1D" strokeOpacity="0.6" strokeWidth="0.6" />
        <path d="M31.4 32.6 L32 33.8 L33.2 34 L32.3 34.8 L32.5 36 L31.4 35.4 L30.3 36 L30.5 34.8 L29.6 34 L30.8 33.8 Z" fill="#FECACA" opacity="0.85" />
        <ellipse cx="29.4" cy="31.8" rx="1.1" ry="0.6" transform="rotate(-30 29.4 31.8)" fill="#fff" opacity="0.7" />
      </g>

      {/* pluma */}
      <g className="art-h-wiggle" style={{ transformOrigin: '0% 100%' }}>
        <path d="M25.4 28.4 C28.4 20.6 34.6 10.6 44.6 3.6 C43.4 12.4 37.4 21.6 27.4 29 Z" fill={url('quill')} />
        <path d="M35 16 L38.6 14.6 M32.6 19.6 L36 18.6 M38 11.6 L41.2 10" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.55" strokeLinecap="round" />
        <path d="M26.2 28.8 C30.4 21 36.6 11.6 44.2 4.2" stroke="#4C1D95" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M28 21.4 C31.4 14.6 36.6 8.8 42.4 5" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M25.4 28.4 L27.4 29 L24.6 31.6 Z" fill="#334155" />
      </g>

      <Sparkle x={6} y={17} r={2.3} fill="#FBBF24" idle delay={0.4} />
      <Sparkle x={42} y={22} r={1.8} fill="#F472B6" idle delay={1.5} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={41} y={30} r={2.4} fill="#FBBF24" /></g>
    </svg>
  );
};

const ICONS = {
  lengua: Lengua,
  matematicas: Matematicas,
  'ciencias-naturales': CienciasNaturales,
  'ciencias-sociales': CienciasSociales,
  tutoria: Tutoria,
  valenciano: Valenciano,
  ingles: Ingles,
  frances: Frances,
  programacion: Programacion,
  historia: Historia,
};

export default ICONS;
