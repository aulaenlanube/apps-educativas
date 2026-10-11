// Ilustraciones de las tarjetas de asignatura — set 3 (rediseño 2026).
// Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: filosofia, historia-mundo, historia-espana, dibujo-tecnico, literatura-universal, economia-empresa, geografia, arte, quimica
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

// Sombra propia: degradado horizontal de transparente al tono oscuro del
// material (se pinta encima del volumen y oscurece su lado derecho).
const CoreGradient = ({ id, color, opacity = 0.42, from = 0.45 }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset={from} stopColor={color} stopOpacity="0" />
    <stop offset="1" stopColor={color} stopOpacity={opacity} />
  </linearGradient>
);

const FONT = 'Fredoka, system-ui, sans-serif';

/* Filosofía — Búho de Atenea posado sobre un libro.
   Hover: ladea la cabeza, curioso, y aparece un bocadillo con «?».
   Reposo (nivel alto): parpadea y titila un destello. */
const OWL = 'M14 7.6 L18.8 12.2 Q23 10.8 27.2 12.2 L32 7.6 Q34.3 13 33.7 18.4 Q35.3 23.6 34.3 29.6 Q33.1 37.5 23 37.7 Q12.9 37.5 11.7 29.6 Q10.7 23.6 12.3 18.4 Q11.7 13 14 7.6 Z';

const Filosofia = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#8B5CF6" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#2e1065" opacity={0.42} />
        <MaterialGradient id={id('body')} light="#DDD6FE" base="#8B5CF6" dark="#4C1D95" />
        <MaterialGradient id={id('wing')} light="#8B5CF6" base="#6D28D9" dark="#3B0764" />
        <MaterialGradient id={id('face')} light="#FFFFFF" base="#F5F3FF" dark="#C4B5FD" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('book')} light="#A5B4FC" base="#4F46E5" dark="#1E1B4B" />
        <linearGradient id={id('pages')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FCD34D" />
        </linearGradient>
        <CoreGradient id={id('core')} color="#2e1065" opacity={0.45} />
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="23.5" cy="44.4" rx="16" ry="2.4" fill={url('shadow')} />

      {/* libro sobre el que se posa (lomo a la izquierda, cantos de las hojas al frente) */}
      <rect x="8" y="36" width="31" height="7.2" rx="2" fill={url('book')} />
      <rect x="11" y="37.5" width="27.4" height="4" rx="0.7" fill={url('pages')} />
      <path d="M11.6 38.9 H38 M11.6 40.3 H38" stroke="#B45309" strokeOpacity="0.35" strokeWidth="0.45" />
      <path d="M9.4 36.7 H37.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M31 42.6 V46.2 L32.3 45.2 L33.6 46.2 V42.6 Z" fill="#EC4899" />

      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-7deg' }}>
        {/* cuerpo + sombra propia */}
        <path d={OWL} fill={url('body')} />
        <path d={OWL} fill={url('core')} />
        {/* alas plegadas */}
        <path d="M12.6 21 C10.4 26 11 32.6 15.8 36.6 C17.4 36.4 18.2 35 17.7 33.4 C15.4 29.4 15 25 16 21.6 C14.9 20.5 13.6 20.4 12.6 21 Z" fill={url('wing')} />
        <path d="M33.4 21 C35.6 26 35 32.6 30.2 36.6 C28.6 36.4 27.8 35 28.3 33.4 C30.6 29.4 31 25 30 21.6 C31.1 20.5 32.4 20.4 33.4 21 Z" fill={url('wing')} />
        <path d="M13.3 26.4 q1.4 .5 2.1 1.8 M13.8 30.4 q1.4 .5 2.1 1.8 M32.7 26.4 q-1.4 .5 -2.1 1.8 M32.2 30.4 q-1.4 .5 -2.1 1.8" stroke="#C4B5FD" strokeOpacity="0.7" strokeWidth="0.55" strokeLinecap="round" />
        {/* pecho con plumas en V */}
        <ellipse cx="23" cy="31" rx="6.4" ry="5.9" fill={url('face')} opacity="0.62" />
        <path d="M19.2 29 q1 1.1 2 0 M22 29 q1 1.1 2 0 M24.8 29 q1 1.1 2 0 M20.6 32.2 q1 1.1 2 0 M23.4 32.2 q1 1.1 2 0" stroke="#7C3AED" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
        {/* borde de luz y brillo en el penacho */}
        <path d="M13.7 9.8 Q12.6 13.8 12.7 17.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M12.1 23.4 C11.6 27.4 12.4 31.6 14.6 34.6" stroke="#EDE9FE" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
        {/* disco facial y cejas en V */}
        <circle cx="18.8" cy="19" r="5.4" fill={url('face')} />
        <circle cx="27.2" cy="19" r="5.4" fill={url('face')} />
        <path d="M19.6 13.5 Q23 15 26.4 13.5 L23 21.6 Z" fill="#8B5CF6" />
        {/* ojos (parpadean en reposo) */}
        <g className="art-i-blink" style={{ '--dur': '5.5s' }}>
          <circle cx="18.8" cy="19.4" r="3.6" fill={url('gold')} />
          <circle cx="27.2" cy="19.4" r="3.6" fill={url('gold')} />
          <circle cx="19" cy="19.6" r="2" fill="#1E1B4B" />
          <circle cx="27.4" cy="19.6" r="2" fill="#1E1B4B" />
          <circle cx="18.2" cy="18.7" r="0.85" fill="#fff" />
          <circle cx="26.6" cy="18.7" r="0.85" fill="#fff" />
        </g>
        {/* pico y patas */}
        <path d="M21.5 22.8 H24.5 L23 26 Z" fill={url('gold')} />
        <path d="M18.6 36.6 v1.6 M20 36.8 v1.6 M21.4 36.6 v1.6 M24.6 36.6 v1.6 M26 36.8 v1.6 M27.4 36.6 v1.6" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* bocadillo de pensamiento (hover) */}
      <g className="art-h-show">
        <g className="art-h-lift" style={{ '--lift': '-2px' }}>
          <circle cx="35.6" cy="14.8" r="1" fill="#C4B5FD" />
          <circle cx="37.9" cy="11.6" r="1.5" fill="#C4B5FD" />
          <circle cx="41.4" cy="6.4" r="4.8" fill="#fff" stroke="#A78BFA" strokeWidth="0.7" />
          <text x="41.4" y="8.7" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="6.6" fill="#7C3AED">?</text>
        </g>
      </g>

      <Sparkle x={7.4} y={13} r={2.4} fill="#A78BFA" idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={6.4} y={30} r={2.2} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Historia del Mundo — Globo antiguo con meridiano de latón y reloj de arena.
   Hover: los continentes se desplazan (el globo gira) y el reloj se da la vuelta.
   Reposo: titila un destello. */
const HistoriaMundo = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#3B82F6" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#172554" opacity={0.42} />
        <radialGradient id={id('sea')} cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#DBEAFE" />
          <stop offset="0.32" stopColor="#60A5FA" />
          <stop offset="0.72" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E3A8A" />
        </radialGradient>
        <MaterialGradient id={id('land')} light="#FEF3C7" base="#FCD34D" dark="#D97706" />
        <MaterialGradient id={id('brass')} light="#FEF3C7" base="#FBBF24" dark="#92400E" />
        <MaterialGradient id={id('wood')} light="#FDBA74" base="#C2410C" dark="#7C2D12" />
        <MaterialGradient id={id('sand')} light="#FEF3C7" base="#FBBF24" dark="#D97706" />
        <linearGradient id={id('night')} x1="0.25" y1="0.15" x2="0.95" y2="0.95">
          <stop offset="0.45" stopColor="#172554" stopOpacity="0" />
          <stop offset="1" stopColor="#172554" stopOpacity="0.55" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.75} />
        <clipPath id={id('ball')}><circle cx="22" cy="20" r="12.5" /></clipPath>
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="27" cy="43.8" rx="17" ry="2.4" fill={url('shadow')} />

      {/* peana de madera y vástago */}
      <path d="M14.4 40 H29.6 V41.4 C29.6 42.8 26.2 43.8 22 43.8 C17.8 43.8 14.4 42.8 14.4 41.4 Z" fill="#7C2D12" />
      <ellipse cx="22" cy="40" rx="7.6" ry="1.9" fill={url('wood')} />
      <path d="M16.6 39.5 Q22 38.2 27.4 39.5" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
      <rect x="21" y="34.4" width="2" height="5.4" fill={url('brass')} />
      <ellipse cx="22" cy="34.9" rx="2" ry="0.85" fill={url('brass')} />

      {/* esfera: océano, continentes (se desplazan en hover), meridianos, noche y brillo */}
      <circle cx="22" cy="20" r="12.5" fill={url('sea')} />
      <g clipPath={url('ball')}>
        <g className="art-h-slide" style={{ '--slide': '6px' }}>
          <g fill={url('land')} stroke="#B45309" strokeOpacity="0.35" strokeWidth="0.4">
            <path d="M2.6 16 C4.2 14 7.4 14.2 8.2 16.2 C8.8 17.8 7.4 19.4 5.8 19.6 C4.2 19.8 2.2 18 2.6 16 Z" />
            <path d="M5 24 C6.4 23 8.4 23.6 8.6 25 C8.8 26.4 7.2 27.2 6 26.8 C4.8 26.4 4.4 24.8 5 24 Z" />
            <path d="M11 12.4 C13.4 9.6 18 9.2 20 11.4 C21 12.8 19.6 14.2 18 14.6 C16.8 15 17 17 15.6 18 C14.2 19 12.6 17.8 12 16.2 C11.4 14.6 10.2 13.6 11 12.4 Z" />
            <path d="M17.2 21 C19 20.4 20.8 21.6 20.6 23.6 C20.4 25.6 19.2 27 18.6 29 C18.2 30.4 17 30.6 16.8 29.2 C16.6 27.2 15.8 25.6 16 23.6 C16.1 22.2 16.2 21.4 17.2 21 Z" />
            <path d="M25.4 13.8 C24.8 12.2 25.8 10.4 27.6 10 C29.4 9.6 31.4 10.2 31.8 11.6 C32.2 13 30.6 13.8 29.2 13.8 C27.8 13.8 26.4 14.8 25.4 13.8 Z" />
            <path d="M25.2 16 C27.2 15 30.8 15.4 32.2 17.2 C33.4 18.8 32.6 20.8 31.4 22.4 C30.4 24 30.2 26.4 28.6 27.6 C27.4 28.4 26.6 27 26.4 25.4 C26.2 23.6 24.4 22.4 24.2 20.4 C24 18.4 24.2 16.8 25.2 16 Z" />
          </g>
        </g>
        <g transform="rotate(20 22 20)" stroke="#fff" strokeOpacity="0.32" strokeWidth="0.45">
          <ellipse cx="22" cy="20" rx="12.5" ry="3.4" />
          <ellipse cx="22" cy="20" rx="5.2" ry="12.5" />
        </g>
      </g>
      <circle cx="22" cy="20" r="12.5" fill={url('night')} />
      <ellipse cx="17.6" cy="13.8" rx="5.2" ry="3" transform="rotate(-35 17.6 13.8)" fill={url('gloss')} />
      <path d="M11.1 16 A11.6 11.6 0 0 1 18 9.1" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />

      {/* meridiano de latón inclinado */}
      <path d="M26.99 6.28 A14.6 14.6 0 0 1 17.49 33.89" stroke={url('brass')} strokeWidth="2" strokeLinecap="round" />
      <path d="M26.75 6.94 A13.9 13.9 0 0 1 17.7 33.22" stroke="#FEF3C7" strokeOpacity="0.85" strokeWidth="0.5" />
      <circle cx="27" cy="6.3" r="1.25" fill={url('brass')} />
      <circle cx="17.5" cy="33.9" r="1.25" fill={url('brass')} />

      {/* reloj de arena (se da la vuelta en hover) */}
      <g className="art-h-spin" style={{ '--spin': '180deg' }}>
        <path d="M35.6 32.4 H41.6 C41.6 35.6 39.4 36.4 39.2 37.2 C39.4 38 41.6 38.8 41.6 42 H35.6 C35.6 38.8 37.8 38 38 37.2 C37.8 36.4 35.6 35.6 35.6 32.4 Z" fill="#E0F2FE" fillOpacity="0.6" stroke="#93C5FD" strokeWidth="0.5" />
        <path d="M36.3 33.6 H40.9 C40.6 35.2 39.4 36 38.6 36.5 C37.8 36 36.6 35.2 36.3 33.6 Z" fill={url('sand')} />
        <path d="M36.2 42 C36.5 40.2 37.6 39.2 38.6 39 C39.6 39.2 40.7 40.2 41 42 Z" fill={url('sand')} />
        <path d="M38.6 36.5 V39.2" stroke="#F59E0B" strokeWidth="0.5" />
        <path d="M36.4 33 C36.6 35 37.6 35.9 37.9 36.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M35.35 32 V42.4 M41.85 32 V42.4" stroke="#7C2D12" strokeWidth="0.9" />
        <rect x="34" y="30.8" width="9.2" height="1.9" rx="0.9" fill={url('wood')} />
        <rect x="34" y="41.8" width="9.2" height="1.9" rx="0.9" fill={url('wood')} />
        <path d="M34.8 31.3 H40" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.45" strokeLinecap="round" />
      </g>

      <Sparkle x={15.4} y={11.6} r={1.3} fill="#fff" />
      <Sparkle x={6} y={7} r={2.3} fill="#60A5FA" idle delay={0.3} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={42} y={10} r={2.4} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Historia de España — Escudo partido (castillo · barras) bajo corona real.
   Hover: la corona se alza y se ladea, y salta un destello.
   Reposo: titilan dos destellos. */
const SHIELD = 'M11.5 17.4 H36.5 V29.6 C36.5 37.6 31.6 41.8 24 44.6 C16.4 41.8 11.5 37.6 11.5 29.6 Z';
const FIELD = 'M13.4 19.3 H34.6 V29.5 C34.6 36.4 30.4 40.1 24 42.5 C17.6 40.1 13.4 36.4 13.4 29.5 Z';
const CROWN = 'M14.4 14.6 L12.8 7.6 L17.6 10.6 L19.4 6.8 L21.8 9.8 L24 4.6 L26.2 9.8 L28.6 6.8 L30.4 10.6 L35.2 7.6 L33.6 14.6 Z';

const HistoriaEspana = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#EF4444" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#450a0a" opacity={0.42} />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('field')} light="#FDE68A" base="#F59E0B" dark="#B45309" />
        <MaterialGradient id={id('red')} light="#FCA5A5" base="#DC2626" dark="#7F1D1D" />
        <MaterialGradient id={id('pearl')} light="#FFFFFF" base="#FDF4FF" dark="#C4B5FD" />
        <CoreGradient id={id('core')} color="#450a0a" opacity={0.4} />
        <clipPath id={id('clip')}><path d={FIELD} /></clipPath>
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="45" rx="12" ry="2" fill={url('shadow')} />

      {/* escudo: marco dorado y campo partido */}
      <path d={SHIELD} fill={url('gold')} />
      <g clipPath={url('clip')}>
        <rect x="13" y="19" width="11" height="24" fill={url('red')} />
        <rect x="24" y="19" width="11" height="24" fill={url('field')} />
        <path d="M25.3 19 V43 M27.8 19 V43 M30.3 19 V43 M32.8 19 V43" stroke="#DC2626" strokeWidth="1.3" />
        {/* castillo */}
        <path d="M15 31.8 V24.6 H15.9 V23.6 H16.5 V24.6 H17.1 V22.2 H17.7 V21.2 H18.4 V22.2 H19.2 V21.2 H19.9 V22.2 H20.5 V24.6 H21.1 V23.6 H21.7 V24.6 H22.6 V31.8 Z" fill={url('gold')} />
        <path d="M17.8 31.8 V29.8 A1 1 0 0 1 19.8 29.8 V31.8 Z M16 26.2 h1 v1.4 h-1 Z M20.6 26.2 h1 v1.4 h-1 Z" fill="#7F1D1D" />
        <path d="M15.6 25.2 V31.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.45" />
        {/* reflejo diagonal */}
        <path d="M13 19 H22.4 L13 33 Z" fill="#fff" opacity="0.16" />
      </g>
      <path d={FIELD} stroke="#7C2D12" strokeOpacity="0.4" strokeWidth="0.6" />
      <path d={SHIELD} fill={url('core')} />
      <path d="M12.4 18.6 V29.6 C12.4 34.6 14.6 38.2 18.2 40.8" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="24" cy="18.3" rx="10" ry="0.9" fill="#7F1D1D" opacity="0.32" />

      {/* corona (se alza y ladea en hover) */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-9deg' }}>
          <path d={CROWN} fill={url('gold')} />
          <path d={CROWN} fill={url('core')} />
          <path d="M14 8.8 L15.4 13.6 M19.6 8.6 L20.6 11.4" stroke="#FEF3C7" strokeWidth="0.55" strokeLinecap="round" />
          <rect x="13.6" y="13.4" width="20.8" height="4.2" rx="1.3" fill={url('gold')} />
          <path d="M14.8 14.2 H33.2" stroke="#FEF3C7" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M14.6 17 H33.4" stroke="#92400E" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
          <ellipse cx="24" cy="15.5" rx="1.6" ry="1.2" fill={url('red')} />
          <circle cx="18.6" cy="15.5" r="0.95" fill="#6366F1" />
          <circle cx="29.4" cy="15.5" r="0.95" fill="#6366F1" />
          <path d="M23.3 15 h0.7 M18.2 15.1 h0.4 M29 15.1 h0.4" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.45" strokeLinecap="round" />
          {[[12.8, 7.6], [19.4, 6.8], [24, 4.6], [28.6, 6.8], [35.2, 7.6]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.15" fill={url('pearl')} />
          ))}
        </g>
      </g>

      <Sparkle x={39} y={9} r={2.3} fill="#FBBF24" idle delay={0.2} />
      <Sparkle x={8.4} y={25} r={1.6} fill="#F87171" idle delay={1.5} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={8.6} y={9} r={2.4} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Dibujo Técnico — Compás de acero trazando un arco sobre un plano, con cartabón.
   Hover: el compás gira sobre su aguja y el lápiz completa el arco.
   Reposo: titila el brillo de la cabeza del compás. */
const NEEDLE = [23, 36];
const HINGE = [30.2, 7.4];
const RADIUS = 14;
const polar = (deg) => [NEEDLE[0] + RADIUS * Math.cos((deg * Math.PI) / 180), NEEDLE[1] + RADIUS * Math.sin((deg * Math.PI) / 180)];
const unit = ([x1, y1], [x2, y2]) => { const l = Math.hypot(x2 - x1, y2 - y1); return [(x2 - x1) / l, (y2 - y1) / l]; };
const along = ([x, y], [ux, uy], s) => [x + ux * s, y + uy * s];
const fx = (n) => n.toFixed(2);
// cuadrilátero que se estrecha de a (ancho wa) a b (ancho wb)
const taper = (a, b, wa, wb) => {
  const [ux, uy] = unit(a, b);
  const [nx, ny] = [-uy, ux];
  const p = ([x, y], w, s) => `${fx(x + nx * w * s / 2)} ${fx(y + ny * w * s / 2)}`;
  return `M${p(a, wa, 1)} L${p(b, wb, 1)} L${p(b, wb, -1)} L${p(a, wa, -1)} Z`;
};
const PENCIL_TIP = polar(-4);
const L_DIR = unit(HINGE, NEEDLE);
const R_DIR = unit(HINGE, PENCIL_TIP);
const L_END = along(NEEDLE, L_DIR, -3.4);
const R_END = along(PENCIL_TIP, R_DIR, -5.4);
const R_CONE = along(PENCIL_TIP, R_DIR, -2.3);
const R_LEAD = along(PENCIL_TIP, R_DIR, -0.9);
const arc = (from, to) => { const [a, b] = [polar(from), polar(to)]; return `M${fx(a[0])} ${fx(a[1])} A${RADIUS} ${RADIUS} 0 0 0 ${fx(b[0])} ${fx(b[1])}`; };
const DT = {
  legL: taper(HINGE, L_END, 3, 1.5),
  legR: taper(HINGE, R_END, 3, 1.5),
  body: taper(R_END, R_CONE, 2.3, 2.3),
  cone: taper(R_CONE, PENCIL_TIP, 2.3, 0.15),
  lead: taper(R_LEAD, PENCIL_TIP, 0.75, 0.1),
  shineL: `M${fx(HINGE[0] - 0.9)} ${fx(HINGE[1] + 2)} L${fx(L_END[0] - 0.45)} ${fx(L_END[1] - 0.6)}`,
  shineR: `M${fx(HINGE[0] + 0.4)} ${fx(HINGE[1] + 2.2)} L${fx(R_END[0] - 0.45)} ${fx(R_END[1] - 0.8)}`,
  drawn: arc(14, -4),
  extra: arc(-4, -24),
};

const DibujoTecnico = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#64748B" opacity={0.32} />
        <ShadowGradient id={id('shadow')} color="#0f172a" opacity={0.42} />
        <MaterialGradient id={id('paper')} light="#93C5FD" base="#2563EB" dark="#1E3A8A" />
        <MaterialGradient id={id('steel')} light="#F8FAFC" base="#94A3B8" dark="#334155" />
        <MaterialGradient id={id('wood')} light="#FDE68A" base="#F59E0B" dark="#B45309" />
        <linearGradient id={id('square')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FDE68A" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#FBBF24" stopOpacity="0.85" />
          <stop offset="1" stopColor="#D97706" stopOpacity="0.9" />
        </linearGradient>
        <CoreGradient id={id('core')} color="#0f172a" opacity={0.35} />
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44" rx="18" ry="2.4" fill={url('shadow')} />

      {/* plano azul con cuadrícula y trazos */}
      <g transform="rotate(-5 24 27)">
        <rect x="6" y="12" width="35" height="29" rx="2" fill={url('paper')} />
        <path d="M12 12 V41 M18 12 V41 M24 12 V41 M30 12 V41 M36 12 V41 M6 18 H41 M6 24 H41 M6 30 H41 M6 36 H41" stroke="#fff" strokeOpacity="0.16" strokeWidth="0.4" />
        <rect x="7.6" y="13.6" width="31.8" height="25.8" rx="1" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.45" />
        <circle cx="15.4" cy="21.4" r="4.4" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.6" />
        <path d="M9.8 21.4 H21 M15.4 15.8 V27" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.4" strokeDasharray="1 0.8" />
        <rect x="31" y="35" width="7.6" height="3.6" rx="0.4" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.45" />
        <path d="M6 12 H20 L6 26 Z" fill="#fff" opacity="0.12" />
        <rect x="6" y="12" width="35" height="29" rx="2" fill={url('core')} />
        <path d="M7.4 12.4 H39.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
      </g>

      {/* cartabón translúcido */}
      <path d="M7.4 41.8 L7.4 21.4 L27.8 41.8 Z M11.2 38 L18.8 38 L11.2 30.4 Z" fill={url('square')} fillRule="evenodd" />
      <path d="M8 22.8 V41.2 H26" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.55" strokeLinecap="round" />
      <path d="M11.8 31.8 V37.4 H17.4" stroke="#B45309" strokeOpacity="0.55" strokeWidth="0.5" />
      <path d="M7.4 24.4 h1.4 M7.4 26.4 h0.9 M7.4 28.4 h1.4 M7.4 30.4 h0.9 M7.4 32.4 h1.4 M7.4 34.4 h0.9 M7.4 36.4 h1.4 M7.4 38.4 h0.9" stroke="#92400E" strokeOpacity="0.7" strokeWidth="0.45" />

      {/* arco trazado y su continuación (hover) */}
      <path d={DT.drawn} stroke="#A5F3FC" strokeWidth="0.8" strokeLinecap="round" />
      <path className="art-h-show" d={DT.extra} stroke="#A5F3FC" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M21.6 36 H24.4 M23 34.6 V37.4" stroke="#A5F3FC" strokeOpacity="0.8" strokeWidth="0.45" />

      {/* compás: gira sobre la punta de la aguja */}
      <g className="art-h-tilt" style={{ '--tilt': '-20deg', transformBox: 'view-box', transformOrigin: `${NEEDLE[0]}px ${NEEDLE[1]}px` }}>
        <path d={`M${fx(L_END[0])} ${fx(L_END[1])} L${NEEDLE[0]} ${NEEDLE[1]}`} stroke="#1E293B" strokeWidth="0.7" strokeLinecap="round" />
        <path d={DT.legL} fill={url('steel')} />
        <path d={DT.legR} fill={url('steel')} />
        <path d={DT.shineL} stroke="#fff" strokeOpacity="0.75" strokeWidth="0.45" strokeLinecap="round" />
        <path d={DT.shineR} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.45" strokeLinecap="round" />
        <circle cx={L_END[0]} cy={L_END[1]} r="0.95" fill="#475569" />
        {/* lápiz en la pierna derecha */}
        <path d={DT.body} fill={url('wood')} />
        <path d={DT.cone} fill="#FDE6B8" />
        <path d={DT.lead} fill="#334155" />
        <circle cx={R_END[0]} cy={R_END[1]} r="1.15" fill="#475569" />
        {/* cabeza y mango */}
        <rect x={HINGE[0] - 0.95} y={HINGE[1] - 5.6} width="1.9" height="4.4" rx="0.9" fill={url('steel')} />
        <path d={`M${HINGE[0] - 0.95} ${HINGE[1] - 4.2} h1.9 M${HINGE[0] - 0.95} ${HINGE[1] - 3} h1.9`} stroke="#334155" strokeOpacity="0.6" strokeWidth="0.35" />
        <circle cx={HINGE[0]} cy={HINGE[1]} r="2.9" fill={url('steel')} />
        <circle cx={HINGE[0]} cy={HINGE[1]} r="1" fill="#334155" />
        <path d={`M${HINGE[0] - 1.9} ${HINGE[1] - 0.4} A2 2 0 0 1 ${HINGE[0] - 0.2} ${HINGE[1] - 2}`} stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" strokeLinecap="round" />
      </g>

      <Sparkle x={HINGE[0] - 3.6} y={HINGE[1] - 2.6} r={1.9} fill="#fff" idle delay={0.6} />
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={41.5} y={26} r={2.3} fill="#22D3EE" /></g>
    </svg>
  );
};

/* Literatura Universal — Pila de clásicos con tintero y pluma.
   Hover: la pluma sale del tintero y se endereza, y salta un destello.
   Reposo: la pluma se mece y titila un destello. */
// Libro tumbado visto por el lomo: nervios dobles, tejuelo con título dorado
// y cantos de las hojas asomando por la derecha.
const Book = ({ x, y, w, h, fill, band, panel, rotate }) => (
  <g transform={rotate ? `rotate(${rotate} ${x + w / 2} ${y + h / 2})` : undefined}>
    <rect x={x} y={y} width={w} height={h} rx="1.6" fill={fill} />
    <rect x={x + w - 4} y={y + 0.9} width="3.2" height={h - 1.8} rx="0.6" fill="#FFF7ED" />
    <path d={`M${x + w - 3.6} ${y + h / 2} h2.4`} stroke="#D97706" strokeOpacity="0.4" strokeWidth="0.4" />
    <path d={`M${x + 2.6} ${y} V${y + h} M${x + 4} ${y} V${y + h} M${x + w - 7.6} ${y} V${y + h} M${x + w - 6.2} ${y} V${y + h}`} stroke={band} strokeWidth="0.7" />
    <rect x={x + 6.6} y={y + h / 2 - 1.3} width={w - 15.8} height="2.6" rx="0.6" fill={panel} opacity="0.6" />
    <path d={`M${x + 8} ${y + h / 2} H${x + w - 10.6}`} stroke="#FDE68A" strokeWidth="0.7" strokeLinecap="round" />
    <path d={`M${x + 1.4} ${y + 0.7} H${x + w - 4.8}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
  </g>
);

const LiteraturaUniversal = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#DB2777" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#500724" opacity={0.42} />
        <MaterialGradient id={id('rose')} light="#F9A8D4" base="#DB2777" dark="#831843" />
        <MaterialGradient id={id('indigo')} light="#A5B4FC" base="#6366F1" dark="#312E81" />
        <MaterialGradient id={id('amber')} light="#FDE68A" base="#F59E0B" dark="#92400E" />
        <MaterialGradient id={id('ink')} light="#818CF8" base="#3730A3" dark="#1E1B4B" />
        <MaterialGradient id={id('feather')} light="#FFFFFF" base="#FBCFE8" dark="#EC4899" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="23" cy="44" rx="17" ry="2.4" fill={url('shadow')} />

      {/* pila de libros */}
      <Book x={7} y={36} w={31} h={6.6} fill={url('rose')} band="#FBBF24" panel="#500724" />
      <Book x={10} y={30.2} w={26} h={5.8} fill={url('indigo')} band="#FBBF24" panel="#1E1B4B" rotate={-2} />
      <Book x={8.6} y={25} w={23} h={5.2} fill={url('amber')} band="#92400E" panel="#78350F" rotate={2.5} />

      {/* pluma (detrás del cuello del tintero) */}
      <g className="art-h-lift" style={{ '--lift': '-4px' }}>
        <g className="art-h-tilt" style={{ '--tilt': '-10deg', transformBox: 'view-box', transformOrigin: '15.5px 17.6px' }}>
          <g className="art-i-sway" style={{ '--amp': '2.5deg', '--dur': '4.6s', transformBox: 'view-box', transformOrigin: '15.5px 17.6px' }}>
            <g transform="translate(15.5 17.6) rotate(40) scale(1.1)">
              <path d="M-0.8 -3.2 H0.8 L0.5 1 L0 2 L-0.5 1 Z" fill={url('gold')} />
              <path d="M0 -3.2 C-3.2 -6.4 -4.4 -12.6 -1.4 -18.6 C-0.9 -19.4 -0.4 -19.8 0 -20 C2.6 -15.4 3.4 -8.4 0 -3.2 Z" fill={url('feather')} />
              <path d="M-3.6 -10.6 L-1.4 -11.6 M-3.2 -14.4 L-1.2 -15.2 M2.6 -12.2 L0.8 -13.2 M2.2 -8.2 L0.6 -9" stroke="#DB2777" strokeOpacity="0.6" strokeWidth="0.5" strokeLinecap="round" />
              <path d="M-2.4 -8 C-2.8 -11.4 -2.4 -14.6 -1.2 -17" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" strokeLinecap="round" />
              <path d="M0 0 V-19.4" stroke="#9D174D" strokeOpacity="0.85" strokeWidth="0.6" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>

      {/* tintero de cristal */}
      <path d="M10.4 25.2 C9.8 22.4 10.1 20.2 11.6 19 H19.4 C20.9 20.2 21.2 22.4 20.6 25.2 Z" fill={url('ink')} />
      <rect x="13.4" y="16.9" width="4.2" height="2.6" rx="0.6" fill={url('ink')} />
      <rect x="12.8" y="16.1" width="5.4" height="1.5" rx="0.75" fill={url('gold')} />
      <path d="M11.5 23.8 C11.1 22.2 11.3 20.8 12.3 20" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.75" strokeLinecap="round" />
      <path d="M18.2 24.3 h1.4" stroke="#C7D2FE" strokeOpacity="0.55" strokeWidth="0.5" strokeLinecap="round" />

      <Sparkle x={38} y={12} r={2.4} fill="#F472B6" idle delay={0.5} />
      <Sparkle x={42} y={21} r={1.4} fill="#FBBF24" />
      <g className="art-h-burst" style={{ '--d': '.18s' }}><Sparkle x={40.5} y={4.5} r={2.3} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Economía de la Empresa — Maletín de piel esmeralda y pila de monedas.
   Hover: la moneda salta y asoma una flecha de crecimiento.
   Reposo: titila un destello y brilla el cierre. */
const Coin = ({ y, top, side }) => (
  <g>
    <path d={`M33.6 ${y} V${y + 1.6} A5 1.7 0 0 0 43.6 ${y + 1.6} V${y} Z`} fill={side} />
    <ellipse cx="38.6" cy={y} rx="5" ry="1.7" fill={top} />
    <path d={`M34.8 ${y - 0.5} Q38.6 ${y - 1.6} 42.4 ${y - 0.5}`} stroke="#FEF3C7" strokeWidth="0.4" strokeLinecap="round" />
  </g>
);

const EconomiaEmpresa = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#10B981" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#022c22" opacity={0.42} />
        <MaterialGradient id={id('leather')} light="#6EE7B7" base="#059669" dark="#064E3B" />
        <MaterialGradient id={id('strap')} light="#34D399" base="#047857" dark="#022c22" />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('arrow')} light="#A7F3D0" base="#10B981" dark="#047857" />
        <GlossGradient id={id('gloss')} opacity={0.7} vertical={false} />
        <CoreGradient id={id('core')} color="#022c22" opacity={0.4} />
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="43.6" rx="19" ry="2.4" fill={url('shadow')} />

      {/* flecha de crecimiento (hover) */}
      <g className="art-h-show">
        <g className="art-h-lift" style={{ '--lift': '-3px' }}>
          <path d="M27.4 14.6 L31.6 10.2 L34.4 12.6 L39.8 6.6" stroke={url('arrow')} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M36.6 5.4 L41.8 4.6 L41 9.8 Z" fill="#10B981" />
        </g>
      </g>

      {/* asa */}
      <path d="M15.6 17 V13.8 Q15.6 10.8 18.6 10.8 H22.4 Q25.4 10.8 25.4 13.8 V17" stroke="#065F46" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16.6 15.6 V13.9 Q16.6 11.9 18.6 11.9 H21" stroke="#6EE7B7" strokeOpacity="0.85" strokeWidth="0.7" strokeLinecap="round" />
      <rect x="14.2" y="15.6" width="2.8" height="1.8" rx="0.6" fill={url('gold')} />
      <rect x="24" y="15.6" width="2.8" height="1.8" rx="0.6" fill={url('gold')} />

      {/* cuerpo */}
      <rect x="5.5" y="16.8" width="30" height="23.6" rx="3.8" fill={url('leather')} />
      <rect x="10.6" y="16.8" width="2.6" height="23.6" fill={url('strap')} />
      <rect x="27.8" y="16.8" width="2.6" height="23.6" fill={url('strap')} />
      <rect x="5.5" y="16.8" width="30" height="23.6" rx="3.8" fill={url('core')} />
      <rect x="7.4" y="18.6" width="26.2" height="20" rx="2.6" stroke="#fff" strokeOpacity="0.32" strokeWidth="0.45" strokeDasharray="1.1 1" />
      <path d="M5.9 24.6 H35.1" stroke="#022c22" strokeOpacity="0.45" strokeWidth="0.8" />
      <path d="M6 25.4 H35" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.5" />
      <path d="M9 18.3 Q20 17.1 31.6 18" stroke={url('gloss')} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.4 21 V36.8" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M5.9 36.4 V37.6 Q5.9 40 8.3 40 H9.6 M35.1 36.4 V37.6 Q35.1 40 32.7 40 H31.4" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />

      {/* hebillas y cierre */}
      <rect x="10.1" y="22.8" width="3.6" height="3.4" rx="0.7" fill={url('gold')} />
      <rect x="10.9" y="23.6" width="2" height="1.8" rx="0.3" fill="#065F46" />
      <rect x="27.3" y="22.8" width="3.6" height="3.4" rx="0.7" fill={url('gold')} />
      <rect x="28.1" y="23.6" width="2" height="1.8" rx="0.3" fill="#065F46" />
      <rect x="17.6" y="22.4" width="5.8" height="4.6" rx="1.2" fill={url('gold')} />
      <path d="M18.4 23 H22.2" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.45" strokeLinecap="round" />
      <circle cx="20.5" cy="24.4" r="0.7" fill="#78350F" />
      <rect x="20.2" y="24.6" width="0.6" height="1.3" rx="0.2" fill="#78350F" />

      {/* monedas */}
      <Coin y={41.2} top={url('gold')} side="#B45309" />
      <Coin y={39.4} top={url('gold')} side="#B45309" />
      <Coin y={37.6} top={url('gold')} side="#92400E" />
      <g className="art-h-jump" style={{ '--jump': '-7px' }}>
        <circle cx="39.2" cy="32.4" r="4.4" fill="#B45309" />
        <circle cx="38.6" cy="32.4" r="4.4" fill={url('gold')} />
        <circle cx="38.6" cy="32.4" r="3.3" stroke="#B45309" strokeOpacity="0.6" strokeWidth="0.5" />
        <text x="38.6" y="34.4" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="5.4" fill="#92400E">€</text>
        <path d="M35.4 30.6 A3.6 3.6 0 0 1 37.4 28.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" strokeLinecap="round" />
      </g>

      <Sparkle x={6.4} y={9.4} r={2.4} fill="#34D399" idle delay={0.3} />
      <g className="art-i-glow" style={{ '--dur': '3.4s', '--lo': '.2' }}><Sparkle x={22.6} y={23.2} r={1.3} fill="#fff" /></g>
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={44} y={13} r={2.3} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Geografía — Mapa plegado en tres paneles, chincheta y brújula.
   Hover: la chincheta salta y la aguja da una vuelta completa.
   Reposo: la aguja oscila y titila un destello. */
const MAP = 'M5 12.6 L17 9.6 L29 12.6 L41 9.6 L41 37.6 L29 40.6 L17 37.6 L5 40.6 Z';
const PIN = 'M35 21.2 C33.2 18.6 31.2 16.8 31.2 14.2 A3.8 3.8 0 0 1 38.8 14.2 C38.8 16.8 36.8 18.6 35 21.2 Z';

const Geografia = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#14B8A6" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#042f2e" opacity={0.42} />
        <MaterialGradient id={id('sea')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
        <MaterialGradient id={id('land')} light="#BBF7D0" base="#4ADE80" dark="#15803D" />
        <MaterialGradient id={id('pin')} light="#FECACA" base="#EF4444" dark="#991B1B" />
        <MaterialGradient id={id('brass')} light="#FEF3C7" base="#FBBF24" dark="#92400E" />
        <MaterialGradient id={id('face')} light="#FFFFFF" base="#F0FDFA" dark="#99F6E4" />
        <CoreGradient id={id('core')} color="#042f2e" opacity={0.35} />
        <clipPath id={id('clip')}><path d={MAP} /></clipPath>
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="23" cy="43.4" rx="19" ry="2.4" fill={url('shadow')} />

      {/* mapa: mar, tierras, relieve y ruta */}
      <path d={MAP} fill={url('sea')} />
      <g clipPath={url('clip')}>
        <path d="M3 26 C7 20 13 22 16 18 C19 14 25 16 27 20 C29 24 25 27 26 31 C27 35 33 34 36 38 L40 44 L3 44 Z" fill={url('land')} />
        <path d="M31 17 C33 14.6 37.4 15 38.4 17.6 C39.2 20 36.6 22 34 21.6 C31.8 21.2 30.2 19.2 31 17 Z" fill={url('land')} />
        <path d="M9.5 31 C11 28.6 15.6 28.6 17 31 C18 33 14.6 34.4 12.6 34 C10.6 33.6 8.8 32.6 9.5 31 Z M12 31.2 C12.8 30.2 14.6 30.4 15 31.4 C15.2 32.4 13.4 32.8 12.6 32.4" stroke="#166534" strokeOpacity="0.5" strokeWidth="0.5" />
        <path d="M20.6 25 L23 20.6 L25.4 25 Z" fill="#A16207" />
        <path d="M22.1 22.4 L23 20.6 L23.9 22.4 L23.3 22 L23 22.6 L22.6 22 Z" fill="#fff" />
        <path d="M9 35.2 C12.6 30.8 17.4 30.6 20.6 27 C23.6 23.6 28.6 25.8 32.6 22.2" stroke="#fff" strokeWidth="0.9" strokeDasharray="1.4 1.1" strokeLinecap="round" />
        {/* paneles: el central queda en sombra, el izquierdo recibe luz */}
        <path d="M5 12.6 L17 9.6 L17 37.6 L5 40.6 Z" fill="#fff" opacity="0.14" />
        <path d="M17 9.6 L29 12.6 L29 40.6 L17 37.6 Z" fill="#134E4A" opacity="0.3" />
        <path d="M29 12.6 L41 9.6 L41 37.6 L29 40.6 Z" fill={url('core')} />
      </g>
      <path d={MAP} stroke="#0F766E" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M17 9.9 V37.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.5" />
      <path d="M5.4 12.9 L17 10 L29 12.9 L40.6 10" stroke="#fff" strokeOpacity="0.65" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* chincheta (salta en hover) */}
      <ellipse cx="35.4" cy="21.3" rx="1.8" ry="0.7" fill="#042f2e" opacity="0.4" />
      <g className="art-h-jump" style={{ '--jump': '-5px' }}>
        <path d={PIN} fill={url('pin')} />
        <path d={PIN} fill={url('core')} />
        <circle cx="35" cy="14.2" r="1.35" fill="#fff" />
        <ellipse cx="33.5" cy="12.6" rx="1.1" ry="0.6" transform="rotate(-35 33.5 12.6)" fill="#fff" opacity="0.7" />
      </g>

      {/* brújula de latón */}
      <circle cx="11" cy="36.6" r="6.2" fill={url('brass')} />
      <circle cx="11" cy="36.6" r="4.7" fill={url('face')} />
      <path d="M11 32.4 V33.3 M11 39.9 V40.8 M6.8 36.6 H7.7 M14.3 36.6 H15.2" stroke="#0F766E" strokeWidth="0.5" strokeLinecap="round" />
      <g className="art-i-sway" style={{ '--amp': '14deg', '--dur': '4.2s' }}>
        <g className="art-h-spin" style={{ '--spin': '360deg' }}>
          <path d="M11 32.9 L12.15 36.6 H9.85 Z" fill="#EF4444" />
          <path d="M11 40.3 L12.15 36.6 H9.85 Z" fill="#475569" />
        </g>
      </g>
      <circle cx="11" cy="36.6" r="0.7" fill={url('brass')} />
      <path d="M7.6 34.6 A4.2 4.2 0 0 1 12.6 32.4" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M5.6 35 A5.8 5.8 0 0 1 9.6 31" stroke="#FEF3C7" strokeWidth="0.6" strokeLinecap="round" />

      <Sparkle x={43} y={5.6} r={2.2} fill="#2DD4BF" idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={41.4} y={18} r={2.2} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Arte — Paleta de pintor con óleos y pincel.
   Hover: el pincel se inclina hacia la pintura y un color se hincha.
   Reposo: titilan dos destellos. */
const PALETTE = 'M6.5 25 C6.5 14.5 16 8.5 26.5 9 C37.5 9.5 43.5 16.5 42.5 24.5 C42 29.5 37.6 30.4 34 30.2 C30.6 30 29.4 32.4 30.6 35.2 C32 38.4 29.6 42.6 23 42.6 C13.4 42.6 6.5 35.6 6.5 25 Z';
const PAINTS = [
  { k: 'red', x: 12.4, y: 23.4, r: 2.7, c: ['#FECACA', '#EF4444', '#991B1B'] },
  { k: 'amber', x: 15.8, y: 16.4, r: 2.6, c: ['#FEF3C7', '#FBBF24', '#B45309'] },
  { k: 'green', x: 22.8, y: 13.2, r: 2.5, c: ['#A7F3D0', '#10B981', '#065F46'] },
  { k: 'blue', x: 30.4, y: 13.4, r: 2.5, c: ['#BFDBFE', '#3B82F6', '#1E3A8A'] },
  { k: 'pink', x: 36.8, y: 18, r: 2.4, c: ['#FBCFE8', '#EC4899', '#9D174D'] },
  { k: 'white', x: 11.8, y: 30.6, r: 2.2, c: ['#FFFFFF', '#F8FAFC', '#CBD5E1'] },
];

const Arte = () => {
  const [id, url] = useArtIds();
  const blob = ({ k, x, y, r }) => (
    <g key={k}>
      <circle cx={x} cy={y + 0.5} r={r} fill="#581C87" opacity="0.3" />
      <circle cx={x} cy={y} r={r} fill={url(k)} />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.38} ry={r * 0.24} transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.4})`} fill="#fff" opacity="0.85" />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#A855F7" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#3b0764" opacity={0.42} />
        <MaterialGradient id={id('palette')} light="#FAF5FF" base="#E9D5FF" dark="#A855F7" />
        <MaterialGradient id={id('handle')} light="#FDE68A" base="#F59E0B" dark="#B45309" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('ferrule')} light="#F8FAFC" base="#94A3B8" dark="#334155" x1={0} y1={0.5} x2={1} y2={0.5} />
        <linearGradient id={id('bristle')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9A8D4" />
          <stop offset="0.45" stopColor="#DB2777" />
          <stop offset="0.6" stopColor="#7C2D12" />
          <stop offset="1" stopColor="#451A03" />
        </linearGradient>
        {PAINTS.map(({ k, c }) => <MaterialGradient key={k} id={id(k)} light={c[0]} base={c[1]} dark={c[2]} />)}
        <GlossGradient id={id('gloss')} opacity={0.8} vertical={false} />
        <CoreGradient id={id('core')} color="#3b0764" opacity={0.3} />
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="25" cy="44.4" rx="18" ry="2.4" fill={url('shadow')} />

      {/* paleta: canto, cara, sombra propia, borde de luz y agujero del pulgar */}
      <path d={PALETTE} transform="translate(0.5 1.5)" fill="#6B21A8" />
      <path d={PALETTE} fill={url('palette')} />
      <path d={PALETTE} fill={url('core')} />
      <path d="M8.2 29 C7.2 19.6 14.4 11.8 24.6 10.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M16 12.6 Q21 10.6 27 10.8" stroke={url('gloss')} strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="23.4" cy="35.2" rx="2.7" ry="2.3" fill="#581C87" />
      <path d="M21.2 36.3 Q23.4 38 25.6 36.3" stroke="#F5D0FE" strokeWidth="0.6" strokeLinecap="round" />

      {/* óleos (el verde se hincha en hover) */}
      {PAINTS.filter((p) => p.k !== 'green').map(blob)}
      <g className="art-h-pop" style={{ '--pop': '1.28' }}>{blob(PAINTS[2])}</g>

      {/* pincel: se inclina sobre el extremo del mango */}
      <g className="art-h-tilt" style={{ '--tilt': '-12deg', transformBox: 'view-box', transformOrigin: '42px 40px' }}>
        <g transform="translate(26.4 21.6) rotate(-40)">
          <path d="M-1.6 10.6 H1.6 L1.1 24 C1.3 25.4 1.4 26.6 0 27.4 C-1.4 26.6 -1.3 25.4 -1.1 24 Z" fill={url('handle')} />
          <path d="M-0.7 11.4 L-0.45 24" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.5" strokeLinecap="round" />
          <rect x="-1.75" y="6.2" width="3.5" height="4.6" rx="0.5" fill={url('ferrule')} />
          <path d="M-1.75 7.4 H1.75 M-1.75 9.4 H1.75" stroke="#475569" strokeOpacity="0.6" strokeWidth="0.4" />
          <path d="M0 -0.6 C1.6 1.4 1.9 4.2 1.6 6.4 H-1.6 C-1.9 4.2 -1.6 1.4 0 -0.6 Z" fill={url('bristle')} />
          <path d="M-0.6 1.2 C-0.9 2.4 -1 3.6 -0.9 4.8" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.4" strokeLinecap="round" />
        </g>
      </g>

      <Sparkle x={41} y={8} r={2.4} fill="#C084FC" idle delay={0.2} />
      <Sparkle x={5} y={14} r={1.6} fill="#F472B6" idle delay={1.6} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={19.4} y={6} r={2.3} fill="#FBBF24" /></g>
    </svg>
  );
};

/* Química — Matraz Erlenmeyer con reactivo luminoso y molécula flotante.
   Hover: suben burbujas por el cuello y la molécula gira.
   Reposo: la molécula flota y titila un destello. */
const FLASK = 'M20.6 9 V19.4 L10 36.2 Q8.6 38.8 10.4 40.6 Q11.6 41.8 14 41.8 H34 Q36.4 41.8 37.6 40.6 Q39.4 38.8 38 36.2 L27.4 19.4 V9 Z';

const Quimica = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#8B5CF6" opacity={0.3} />
        <GlowGradient id={id('react')} color="#F0ABFC" opacity={0.7} mid={0.4} />
        <ShadowGradient id={id('shadow')} color="#2e1065" opacity={0.42} />
        <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="0.55" stopColor="#EDE9FE" stopOpacity="0.35" />
          <stop offset="1" stopColor="#C4B5FD" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id('liquid')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E879F9" />
          <stop offset="0.5" stopColor="#A855F7" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
        <MaterialGradient id={id('rim')} light="#F5F3FF" base="#C4B5FD" dark="#7C3AED" />
        <MaterialGradient id={id('atomO')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
        <MaterialGradient id={id('atomH')} light="#FCE7F3" base="#EC4899" dark="#9D174D" />
        <CoreGradient id={id('core')} color="#2e1065" opacity={0.32} />
        <clipPath id={id('clip')}><path d={FLASK} /></clipPath>
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44" rx="16" ry="2.4" fill={url('shadow')} />

      {/* cristal y reactivo */}
      <path d={FLASK} fill={url('glass')} />
      <g clipPath={url('clip')}>
        <rect x="8" y="27.6" width="32" height="15" fill={url('liquid')} />
        <circle cx="24" cy="35.4" r="9" fill={url('react')} />
        <ellipse cx="24" cy="27.6" rx="8.8" ry="1.3" fill="#F5D0FE" />
        <g fill="#fff">
          <circle cx="19.4" cy="36.6" r="1.2" opacity="0.6" />
          <circle cx="24.6" cy="33.4" r="0.8" opacity="0.7" />
          <circle cx="28.6" cy="37.4" r="1.4" opacity="0.5" />
          <circle cx="22.4" cy="39.6" r="0.7" opacity="0.6" />
          <circle cx="26.2" cy="30.6" r="0.55" opacity="0.8" />
        </g>
        <path d={FLASK} fill={url('core')} />
      </g>
      <path d={FLASK} stroke="#8B5CF6" strokeOpacity="0.8" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M21.9 10.2 V19.8 L12.2 35.2" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36.6 37.4 Q37.4 39.4 35.6 40.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M30.6 23.6 h2 M32.2 26.2 h1.4" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.5" strokeLinecap="round" />
      <rect x="19" y="6.4" width="10" height="2.8" rx="1.4" fill={url('rim')} />
      <path d="M20.2 7.2 H25.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" strokeLinecap="round" />

      {/* burbujas que escapan por el cuello (hover) */}
      <g className="art-h-show">
        <g className="art-h-lift" style={{ '--lift': '-5px' }}>
          <g fill="#fff" fillOpacity="0.65" stroke="#C084FC" strokeWidth="0.5">
            <circle cx="23" cy="4.6" r="1.2" />
            <circle cx="25.8" cy="2.4" r="0.85" />
            <circle cx="22.4" cy="0.6" r="0.6" />
          </g>
        </g>
      </g>

      {/* molécula de agua: flota en reposo, gira en hover */}
      <g className="art-i-bob" style={{ '--amp': '-1.6px', '--dur': '3.8s' }}>
        <g className="art-h-spin" style={{ '--spin': '120deg' }}>
          <path d="M34.4 7.6 L38.6 11.4 L42.8 7.8" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="34.4" cy="7.6" r="1.9" fill={url('atomH')} />
          <circle cx="42.8" cy="7.8" r="1.9" fill={url('atomH')} />
          <circle cx="38.6" cy="11.4" r="3" fill={url('atomO')} />
          <circle cx="37.6" cy="10.3" r="0.9" fill="#fff" opacity="0.85" />
          <circle cx="33.8" cy="7" r="0.55" fill="#fff" opacity="0.85" />
          <circle cx="42.2" cy="7.2" r="0.55" fill="#fff" opacity="0.85" />
        </g>
      </g>

      <Sparkle x={8} y={14} r={2.4} fill="#C084FC" idle delay={0.5} />
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={42} y={24} r={2.2} fill="#FBBF24" /></g>
    </svg>
  );
};

const ICONS = {
  filosofia: Filosofia,
  'historia-mundo': HistoriaMundo,
  'historia-espana': HistoriaEspana,
  'dibujo-tecnico': DibujoTecnico,
  'literatura-universal': LiteraturaUniversal,
  'economia-empresa': EconomiaEmpresa,
  geografia: Geografia,
  arte: Arte,
  quimica: Quimica,
};

export default ICONS;
