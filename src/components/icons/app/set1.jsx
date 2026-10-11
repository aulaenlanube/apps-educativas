// Ilustraciones (rediseño 2026). Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: ahorcado, anagramas, rosco-del-saber, crucigrama, sopa-de-letras, millonario, busca-el-intruso, nave-palabras, runner, snake, lluvia-de-palabras, parejas, clasificador, ordena-la-frase, ordena-la-historia, detective-de-palabras, juego-memoria, excavacion-selectiva, comprension-escrita, porcentajes-proporciones, regla-de-tres
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

/* ==========================================================================
   Baldosa común de las apps (48×48, rx 12)
   - Degradado propio en userSpaceOnUse: así otras piezas pueden "recortar"
     el fondo pintándose con el mismo degradado (rayas del sol del runner…).
   - Luz arriba-izquierda, viñeta inferior, brillo superior y borde interior
     de luz que se apaga hacia abajo.
   ========================================================================== */
const TileDefs = ({ id, light, base, dark, deep }) => (
  <>
    <linearGradient id={id('tile')} x1="8" y1="0" x2="34" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor={light} />
      <stop offset="52%" stopColor={base} />
      <stop offset="100%" stopColor={dark} />
    </linearGradient>
    <radialGradient id={id('tileLight')} cx="13" cy="8" r="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.36" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={id('tileVig')} x1="0" y1="24" x2="0" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor={deep} stopOpacity="0" />
      <stop offset="100%" stopColor={deep} stopOpacity="0.3" />
    </linearGradient>
    <linearGradient id={id('tileGloss')} x1="0" y1="1" x2="0" y2="18" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.36" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <linearGradient id={id('tileRim')} x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
      <stop offset="50%" stopColor="#fff" stopOpacity="0.32" />
      <stop offset="100%" stopColor="#fff" stopOpacity="0.16" />
    </linearGradient>
  </>
);

// Baldosa completa: fondo detrás, motivo (children) y borde de luz delante.
const Tile = ({ id, url, colors, defs, children }) => (
  <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <TileDefs id={id} {...colors} />
      {defs}
    </defs>
    <rect width="48" height="48" rx="12" fill={url('tile')} />
    <rect width="48" height="48" rx="12" fill={url('tileLight')} />
    <rect width="48" height="48" rx="12" fill={url('tileVig')} />
    <path d="M1 12.5 C1 6 6 1 12.5 1 H35.5 C42 1 47 6 47 12.5 V15 C33 19.2 15 19.2 1 15 Z" fill={url('tileGloss')} />
    {children}
    <rect x="0.4" y="0.4" width="47.2" height="47.2" rx="11.6" stroke={url('tileRim')} strokeWidth="0.8" />
  </svg>
);

// Esfera con luz arriba-izquierda (bolas, pelotas, perlas).
const SphereGradient = ({ id, light, base, dark }) => (
  <radialGradient id={id} cx="0.36" cy="0.3" r="0.78">
    <stop offset="0%" stopColor={light} />
    <stop offset="45%" stopColor={base} />
    <stop offset="100%" stopColor={dark} />
  </radialGradient>
);

// Estrella de 5 puntas (ro radio exterior, ri interior).
const starPath = (cx, cy, ro, ri) => Array.from({ length: 10 }, (_, i) => {
  const a = ((-90 + i * 36) * Math.PI) / 180;
  const r = i % 2 ? ri : ro;
  return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
}).join(' ') + ' Z';

// Atributos comunes del texto dibujado (letras/números sueltos).
const T = { fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: '700', textAnchor: 'middle' };

/* --------------------------------------------------------------------------
   Ahorcado — horca de madera con el muñeco colgando y la palabra C A _ A.
   Reposo: el muñeco se balancea y titila un destello.
   Hover: el muñeco se agita, aparece la letra que faltaba (S) y salta una chispa.
   -------------------------------------------------------------------------- */
const Ahorcado = () => {
  const [id, url] = useArtIds();
  const tiles = [
    { x: 7, l: 'C' }, { x: 16, l: 'A' }, { x: 25, l: null }, { x: 34, l: 'A' },
  ];
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FFDDB0', base: '#FB923C', dark: '#E0521B', deep: '#7C2D12' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#7C2D12" opacity={0.5} />
          <MaterialGradient id={id('woodV')} light="#F3B47C" base="#A8541C" dark="#5E2A0C" x1={0} y1={0.5} x2={1} y2={0.5} />
          <MaterialGradient id={id('woodH')} light="#F0B07A" base="#A04E18" dark="#5E2A0C" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('card')} light="#FFFFFF" base="#FFF7ED" dark="#FDC896" />
          <SphereGradient id={id('head')} light="#FFFFFF" base="#FFF4E6" dark="#FDBA74" />
        </>
      )}
    >
      {/* sombra de contacto de la horca */}
      <ellipse cx="19" cy="31.4" rx="13.5" ry="1.9" fill={url('shadow')} />

      {/* horca: poste, travesaño, tornapunta y base */}
      <rect x="7" y="27.8" width="24" height="3.4" rx="1.4" fill={url('woodH')} />
      <path d="M8.2 28.5 H29.8" stroke="#FFE2C2" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
      <rect x="11" y="6.4" width="3.8" height="22.4" rx="1.2" fill={url('woodV')} />
      <path d="M12 9 V26.6" stroke="#FFE2C2" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M14 16.6 L20.2 9.4" stroke="#7A3610" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M14.2 15.6 L19.4 9.6" stroke="#E9A066" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />
      <rect x="9.6" y="5.8" width="22.6" height="3.6" rx="1.3" fill={url('woodH')} />
      <path d="M11 6.5 H31" stroke="#FFE2C2" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
      <circle cx="12.9" cy="7.6" r="0.6" fill="#FCD34D" />
      <circle cx="12.9" cy="25" r="0.6" fill="#FCD34D" />

      {/* muñeco con su cuerda (reposo: balanceo · hover: se agita) */}
      <g className="art-i-sway art-o-top" style={{ '--amp': '3deg', '--dur': '4.2s' }}>
        <g className="art-h-wiggle art-o-top">
          <path d="M28.6 9.3 V13.4" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M28.6 9.6 V13.2" stroke="#B45309" strokeWidth="1.2" strokeDasharray="0.55 0.75" />
          <ellipse cx="28.6" cy="13.7" rx="1.4" ry="0.75" stroke="#FDE68A" strokeWidth="0.8" />
          {/* sombra del cuerpo (desplazada) y cuerpo de tiza */}
          <path d="M28.6 19.4 V24.2 M25.8 22.6 L28.6 20.8 L31.4 22.6 M26.4 27.8 L28.6 24.2 L30.8 27.8" transform="translate(0.55 0.6)" stroke="#9A3412" strokeOpacity="0.38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M28.6 19.4 V24.2 M25.8 22.6 L28.6 20.8 L31.4 22.6 M26.4 27.8 L28.6 24.2 L30.8 27.8" stroke="#FFFBF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28.6" cy="16.9" r="2.75" fill={url('head')} />
          <circle cx="27.7" cy="16.7" r="0.38" fill="#7C2D12" />
          <circle cx="29.5" cy="16.7" r="0.38" fill="#7C2D12" />
          <path d="M27.9 18.3 H29.3" stroke="#7C2D12" strokeWidth="0.5" strokeLinecap="round" />
          <ellipse cx="27.7" cy="15.4" rx="1" ry="0.55" fill="#fff" opacity="0.9" />
        </g>
      </g>

      {/* palabra oculta C A _ A */}
      <ellipse cx="24" cy="41.8" rx="18" ry="1.5" fill={url('shadow')} />
      {tiles.map(({ x, l }) => (
        <g key={x}>
          {l ? (
            <>
              <rect x={x} y="34.3" width="7" height="7" rx="1.7" fill="#9A3412" opacity="0.75" />
              <rect x={x} y="33.3" width="7" height="7" rx="1.7" fill={url('card')} />
              <rect x={x + 0.9} y="33.8" width="5.2" height="1.3" rx="0.65" fill="#fff" opacity="0.8" />
              <text {...T} x={x + 3.5} y="38.9" fontSize="5.4" fill="#9A3412">{l}</text>
            </>
          ) : (
            <>
              {/* hueco: casilla hundida con guion */}
              <rect x={x} y="33.8" width="7" height="7" rx="1.7" fill="#7C2D12" opacity="0.32" />
              <rect x={x + 0.35} y="34.15" width="6.3" height="6.3" rx="1.4" stroke="#FFEDD5" strokeOpacity="0.85" strokeWidth="0.6" strokeDasharray="1.1 0.8" />
              <path d={`M${x + 2} 38.9 H${x + 5}`} stroke="#FFF7ED" strokeWidth="0.9" strokeLinecap="round" />
            </>
          )}
        </g>
      ))}
      <g className="art-h-show">
        <rect x="25" y="33.3" width="7" height="7" rx="1.7" fill={url('card')} />
        <text {...T} x="28.5" y="38.9" fontSize="5.4" fill="#15803D">S</text>
      </g>

      {/* destellos */}
      <Sparkle x={40.5} y={12} r={2.4} fill="#FFF7ED" idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={36.5} y={27} r={2.6} fill="#FEF3C7" /></g>
    </Tile>
  );
};

// Ficha de letra con grosor (Anagramas).
const LetterTile = ({ url, x, letter, rot }) => (
  <g transform={`rotate(${rot} ${x + 5.5} 24.5)`}>
    <rect x={x} y="20" width="11" height="12" rx="2.4" fill="#86198F" />
    <rect x={x} y="18.4" width="11" height="12" rx="2.4" fill={url('ivory')} />
    <rect x={x + 1} y="19.1" width="9" height="2.6" rx="1.3" fill="#fff" opacity="0.85" />
    <text {...T} x={x + 5.3} y="27.6" fontSize="8.2" fill="#86198F">{letter}</text>
    <text {...T} x={x + 9.1} y="29.5" fontSize="2.4" fill="#C026D3">1</text>
  </g>
);

/* --------------------------------------------------------------------------
   Anagramas — fichas de letras (S O L) con flechas de intercambio.
   Reposo: las flechas laten y titila un destello.
   Hover: S y L se intercambian (SOL → LOS) y la O salta para dejarlas pasar.
   -------------------------------------------------------------------------- */
const Anagramas = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#F8D4FF', base: '#D946EF', dark: '#9333EA', deep: '#4A044E' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#4A044E" opacity={0.5} />
          <MaterialGradient id={id('ivory')} light="#FFFFFF" base="#FDF4FF" dark="#F2C4FB" />
        </>
      )}
    >
      {/* flechas de intercambio (reposo: laten) */}
      <g className="art-i-glow" style={{ '--lo': '.55', '--dur': '2.6s' }}>
        <path d="M11.4 15.6 C15.4 8.4 32.6 8.4 36.6 15.6" stroke="#701A75" strokeOpacity="0.28" strokeWidth="1.6" strokeLinecap="round" transform="translate(0.4 0.6)" />
        <path d="M11.4 15.6 C15.4 8.4 32.6 8.4 36.6 15.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M34.3 14.6 L37.4 16.8 L37.7 13 Z" fill="#fff" />
        <path d="M36.6 35.4 C32.6 42.2 15.4 42.2 11.4 35.4" stroke="#701A75" strokeOpacity="0.28" strokeWidth="1.6" strokeLinecap="round" transform="translate(0.4 0.6)" />
        <path d="M36.6 35.4 C32.6 42.2 15.4 42.2 11.4 35.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M13.7 36.4 L10.6 34.2 L10.3 38 Z" fill="#fff" />
      </g>

      <ellipse cx="24" cy="33.4" rx="19" ry="1.9" fill={url('shadow')} />

      {/* fichas: S y L se cruzan en hover, la O salta */}
      <g className="art-h-jump" style={{ '--jump': '-7px' }}><LetterTile url={url} x={18.5} letter="O" rot={2} /></g>
      <g className="art-h-slide" style={{ '--slide': '-26px' }}><LetterTile url={url} x={31.5} letter="L" rot={7} /></g>
      <g className="art-h-slide" style={{ '--slide': '26px' }}><LetterTile url={url} x={5.5} letter="S" rot={-7} /></g>

      <Sparkle x={42} y={7.5} r={2.2} fill="#FDF4FF" idle delay={0.9} />
    </Tile>
  );
};

// Bola del rosco con brillo especular.
const Ball = ({ url, x, y, k }) => {
  const r = k === 'on' ? 4.3 : 3.5;
  return (
    <>
      <circle cx={x} cy={y} r={r} fill={url(k)} />
      <ellipse cx={x - r * 0.3} cy={y - r * 0.42} rx={r * 0.42} ry={r * 0.26} fill="#fff" opacity="0.85" />
    </>
  );
};

/* --------------------------------------------------------------------------
   Rosco del saber — anillo de letras (verde acierto, rojo fallo, ámbar activa)
   con la letra en juego en el centro.
   Reposo: la bola activa late y titila un destello.
   Hover: el rosco avanza una posición y la A pasa a B ("¡pasapalabra!").
   -------------------------------------------------------------------------- */
const Rosco = () => {
  const [id, url] = useArtIds();
  const C = { x: 24, y: 24.6 };
  const R = 14.8;
  const kinds = ['on', 'pearl', 'pearl', 'pearl', 'pearl', 'pearl', 'pearl', 'pearl', 'ok', 'ok', 'ko', 'ok'];
  const balls = kinds.map((k, i) => {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    return { k, i, x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) };
  });
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#A5CDFF', base: '#3B82F6', dark: '#1E40AF', deep: '#172554' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#172554" opacity={0.45} />
          <SphereGradient id={id('pearl')} light="#FFFFFF" base="#E6EEFF" dark="#93AEE0" />
          <SphereGradient id={id('ok')} light="#BBF7D0" base="#22C55E" dark="#166534" />
          <SphereGradient id={id('ko')} light="#FECACA" base="#EF4444" dark="#991B1B" />
          <SphereGradient id={id('on')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
          <SphereGradient id={id('core')} light="#4F6FE0" base="#1E3A8A" dark="#0B1640" />
          <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
          <GlossGradient id={id('gloss')} opacity={0.5} />
        </>
      )}
    >
      <ellipse cx="24" cy="43.6" rx="13" ry="1.6" fill={url('shadow')} />
      {/* surco del rosco */}
      <circle cx={C.x} cy={C.y} r={R} stroke="#172554" strokeOpacity="0.3" strokeWidth="6.4" />
      <circle cx={C.x} cy={C.y} r={R - 3.4} stroke="#fff" strokeOpacity="0.22" strokeWidth="0.6" />

      {/* bolas: avanzan una posición en hover */}
      <g className="art-h-spin" style={{ '--spin': '30deg', transformBox: 'view-box', transformOrigin: `${C.x}px ${C.y}px` }}>
        {balls.filter((b) => b.k !== 'on').map((b) => <Ball url={url} key={b.i} {...b} />)}
        {balls.filter((b) => b.k === 'on').map((b) => (
          <g key={b.i} className="art-i-pulse" style={{ '--amp': '1.14', '--dur': '2.4s' }}>
            <circle cx={b.x} cy={b.y} r="5.6" fill="#FDE68A" opacity="0.45" />
            <Ball url={url} {...b} />
          </g>
        ))}
      </g>

      {/* núcleo con la letra en juego */}
      <circle cx={C.x} cy={C.y} r="8.6" fill={url('core')} />
      <circle cx={C.x} cy={C.y} r="8.6" stroke={url('gold')} strokeWidth="1.2" />
      <path d="M17.6 22.4 C18.6 18.8 21 17 24 17 C27 17 29.4 18.8 30.4 22.4 C27 21 21 21 17.6 22.4 Z" fill={url('gloss')} />
      <g className="art-h-hide">
        <text {...T} x={C.x} y="28.6" fontSize="11" fill="#fff">A</text>
      </g>
      <g className="art-h-show">
        <text {...T} x={C.x} y="28.6" fontSize="11" fill="#FDE68A">B</text>
      </g>

      <Sparkle x={42} y={7.6} r={2.2} idle delay={1.3} />
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Crucigrama — hoja con rejilla (SOL / LUZ / PAZ), casillas negras índigo y
   lápiz escribiendo en la casilla activa.
   Reposo: la casilla activa brilla y titila un destello.
   Hover: el lápiz garabatea, aparece la letra y salta una chispa.
   -------------------------------------------------------------------------- */
const Crucigrama = () => {
  const [id, url] = useArtIds();
  const O = { x: 9.5, y: 11.5 };
  const S = 6.5;
  const cell = (r, c) => ({ x: O.x + c * S, y: O.y + r * S });
  const blacks = [[0, 3], [1, 0], [2, 3], [3, 0]];
  const letters = [[0, 0, 'S'], [0, 1, 'O'], [0, 2, 'L'], [1, 2, 'U'], [2, 0, 'P'], [2, 1, 'A'], [2, 2, 'Z']];
  const active = cell(1, 3);
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#CDD5FF', base: '#6366F1', dark: '#3730A3', deep: '#1E1B4B' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#1E1B4B" opacity={0.5} />
          <MaterialGradient id={id('paper')} light="#FFFFFF" base="#F7F8FF" dark="#D5DBFF" />
          <MaterialGradient id={id('ink')} light="#4F46E5" base="#312E81" dark="#1E1B4B" />
          <MaterialGradient id={id('hot')} light="#FEF3C7" base="#FCD34D" dark="#F59E0B" />
          <GlossGradient id={id('gloss')} opacity={0.6} />
          <linearGradient id={id('pencil')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="33%" stopColor="#FDE68A" />
            <stop offset="34%" stopColor="#FBBF24" />
            <stop offset="66%" stopColor="#FBBF24" />
            <stop offset="67%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </>
      )}
    >
      <ellipse cx="23" cy="40.6" rx="16" ry="2" fill={url('shadow')} />
      {/* hoja con grosor */}
      <rect x="8.9" y="11" width="29" height="29" rx="2.6" fill="#1E1B4B" opacity="0.3" />
      <rect x="8" y="10" width="29" height="29" rx="2.6" fill={url('paper')} />
      <rect x="8" y="10" width="29" height="9" rx="2.6" fill={url('gloss')} />

      {/* casilla activa (reposo: brilla) */}
      <g className="art-i-glow" style={{ '--lo': '.6', '--dur': '2.4s' }}>
        <rect x={active.x + 0.3} y={active.y + 0.3} width={S - 0.6} height={S - 0.6} rx="0.8" fill={url('hot')} />
      </g>
      {blacks.map(([r, c]) => {
        const p = cell(r, c);
        return <rect key={`${r}${c}`} x={p.x + 0.3} y={p.y + 0.3} width={S - 0.6} height={S - 0.6} rx="0.8" fill={url('ink')} />;
      })}
      {/* rejilla */}
      <path d={`M16 11.5 V37.5 M22.5 11.5 V37.5 M29 11.5 V37.5 M9.5 18 H35.5 M9.5 24.5 H35.5 M9.5 31 H35.5`} stroke="#A5B4FC" strokeWidth="0.55" />
      <rect x="9.5" y="11.5" width="26" height="26" rx="1" stroke="#818CF8" strokeWidth="0.7" />
      {letters.map(([r, c, l]) => {
        const p = cell(r, c);
        return <text key={`${r}${c}`} {...T} x={p.x + S / 2} y={p.y + 4.95} fontSize="5.1" fill="#312E81">{l}</text>;
      })}
      <g className="art-h-show">
        <text {...T} x={active.x + S / 2} y={active.y + 4.95} fontSize="5.1" fill="#B45309">A</text>
      </g>

      {/* lápiz escribiendo en la casilla activa */}
      <g className="art-h-wiggle" style={{ transformBox: 'view-box', transformOrigin: '33.6px 21px' }}>
        <g transform="translate(33.6 21) rotate(40)">
          <path d="M-2.1 -12.2 L2.1 -12.2 L2.1 -4.4 L-2.1 -4.4 Z" fill="#1E1B4B" opacity="0.25" transform="translate(0.9 0.5)" />
          <path d="M-2.1 -4.4 L0 0 L2.1 -4.4 Z" fill="#F8D7A8" />
          <path d="M-0.75 -1.6 L0 0 L0.75 -1.6 Z" fill="#334155" />
          <rect x="-2.1" y="-12.2" width="4.2" height="7.8" fill={url('pencil')} />
          <rect x="-2.1" y="-13.8" width="4.2" height="1.6" fill="#CBD5E1" />
          <rect x="-2.1" y="-13.8" width="4.2" height="0.5" fill="#fff" opacity="0.8" />
          <path d="M-2.1 -13.8 V-15 C-2.1 -16.2 2.1 -16.2 2.1 -15 V-13.8 Z" fill="#F472B6" />
        </g>
      </g>

      <Sparkle x={42} y={41} r={2.2} fill="#E0E7FF" idle delay={0.6} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={42.5} y={26} r={2.6} fill="#FEF3C7" /></g>
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Sopa de letras — tarjeta 4×4 con palabras rodeadas por cápsulas de
   rotulador (SOL en ámbar, SAL en rosa).
   Reposo: la cápsula ámbar late y titila un destello.
   Hover: se marca una palabra nueva (MAR, cian), la tarjeta sube y salta una chispa.
   -------------------------------------------------------------------------- */
const SopaDeLetras = () => {
  const [id, url] = useArtIds();
  const grid = ['SOLE', 'AMAR', 'LUZP', 'TENO'];
  const found = new Set(['00', '01', '02', '10', '20']);
  const O = { x: 10, y: 10.5 };
  const S = 7;
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#B4F5D8', base: '#10B981', dark: '#047857', deep: '#022C22' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#022C22" opacity={0.5} />
          <MaterialGradient id={id('card')} light="#FFFFFF" base="#F5FFFA" dark="#CBF3E3" />
          <GlossGradient id={id('gloss')} opacity={0.7} />
        </>
      )}
    >
      <ellipse cx="24" cy="41.2" rx="17" ry="2" fill={url('shadow')} />
      <g className="art-h-lift" style={{ '--lift': '-2px' }}>
        {/* tarjeta con grosor */}
        <rect x="8.9" y="9.4" width="32" height="32" rx="4" fill="#064E3B" opacity="0.3" />
        <rect x="8" y="8.4" width="32" height="32" rx="4" fill={url('card')} />
        <rect x="9.2" y="9.3" width="29.6" height="8" rx="3.4" fill={url('gloss')} />

        {/* cápsulas de rotulador */}
        <rect x="10.7" y="11.2" width="5.6" height="19.6" rx="2.8" fill="#F472B6" fillOpacity="0.35" stroke="#EC4899" strokeWidth="0.7" />
        <g className="art-i-glow" style={{ '--lo': '.6', '--dur': '2.8s' }}>
          <rect x="10.7" y="11.2" width="19.6" height="5.6" rx="2.8" fill="#FBBF24" fillOpacity="0.45" stroke="#F59E0B" strokeWidth="0.75" />
        </g>
        <g className="art-h-show">
          <rect x="17.7" y="18.2" width="19.6" height="5.6" rx="2.8" fill="#22D3EE" fillOpacity="0.4" stroke="#06B6D4" strokeWidth="0.75" />
        </g>

        {grid.map((row, r) => row.split('').map((l, c) => (
          <text
            key={`${r}${c}`}
            {...T}
            x={O.x + c * S + S / 2}
            y={O.y + r * S + 5.3}
            fontSize="5.6"
            fill={found.has(`${r}${c}`) ? '#064E3B' : '#64748B'}
          >
            {l}
          </text>
        )))}
      </g>

      <Sparkle x={42.6} y={7.2} r={2.2} fill="#ECFDF5" idle delay={1.1} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={41.5} y={22} r={2.6} fill="#FEF9C3" /></g>
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Millonario — plató nocturno: moneda de oro bajo el foco y los cuatro
   comodines de respuesta (uno marcado como "respuesta final").
   Reposo: el foco respira y titila un destello.
   Hover: la moneda gira, la respuesta marcada se vuelve verde y salta una chispa.
   -------------------------------------------------------------------------- */
const Millonario = () => {
  const [id, url] = useArtIds();
  const bar = (x, y, w = 17, h = 5.2) => `M${x + 2.6} ${y} H${x + w - 2.6} L${x + w} ${y + h / 2} L${x + w - 2.6} ${y + h} H${x + 2.6} L${x} ${y + h / 2} Z`;
  const bars = [[5.5, 31.6], [25.5, 31.6], [5.5, 38.4], [25.5, 38.4]];
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#7C4DFF', base: '#40198F', dark: '#170F45', deep: '#05031A' }}
      defs={(
        <>
          <GlowGradient id={id('halo')} color="#FDE68A" opacity={0.5} />
          <linearGradient id={id('beam')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </linearGradient>
          <MaterialGradient id={id('gold')} light="#FFF7D1" base="#FBBF24" dark="#B45309" />
          <linearGradient id={id('edge')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <MaterialGradient id={id('slot')} light="#3B3A9E" base="#1E1B5E" dark="#100C33" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('final')} light="#FEF3C7" base="#F59E0B" dark="#B45309" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('ok')} light="#BBF7D0" base="#22C55E" dark="#15803D" x1={0.5} y1={0} x2={0.5} y2={1} />
          <GlossGradient id={id('gloss')} opacity={0.75} />
        </>
      )}
    >
      {/* foco cenital (reposo: respira) */}
      <g className="art-i-glow" style={{ '--lo': '.55', '--dur': '3.4s' }}>
        <path d="M18.5 0 H29.5 L37 30 H11 Z" fill={url('beam')} />
        <circle cx="24" cy="17.5" r="15" fill={url('halo')} />
      </g>

      {/* moneda (hover: gira) */}
      <g className="art-h-spin" style={{ '--spin': '360deg' }}>
        <circle cx="24" cy="18.9" r="9.6" fill={url('edge')} />
        <circle cx="24" cy="17.4" r="9.6" fill={url('gold')} />
        <circle cx="24" cy="17.4" r="7.5" stroke="#B45309" strokeOpacity="0.55" strokeWidth="0.8" />
        <circle cx="24" cy="17.4" r="6.8" stroke="#FEF3C7" strokeOpacity="0.55" strokeWidth="0.5" />
        <text {...T} x="23.6" y="21" fontSize="10.5" fill="#FEF3C7" opacity="0.8">€</text>
        <text {...T} x="24" y="21.4" fontSize="10.5" fill="#92400E">€</text>
        <path d="M16.4 14.6 C17.6 10.9 21.4 8.9 25.2 9.3" stroke={url('gloss')} strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* comodines de respuesta, unidos por la línea del plató */}
      <path d="M2.5 34.2 H45.5 M2.5 41 H45.5" stroke="#A5B4FC" strokeOpacity="0.45" strokeWidth="0.6" />
      {bars.map(([x, y], i) => (
        <g key={i}>
          <path d={bar(x, y)} fill={i === 3 ? url('final') : url('slot')} stroke={i === 3 ? '#FEF3C7' : '#A5B4FC'} strokeOpacity={i === 3 ? 0.9 : 0.75} strokeWidth="0.6" />
          <path d={`M${x + 3.6} ${y + 1.6} L${x + 4.6} ${y + 2.6} L${x + 3.6} ${y + 3.6} L${x + 2.6} ${y + 2.6} Z`} fill={i === 3 ? '#fff' : '#FBBF24'} />
          <path d={`M${x + 6.6} ${y + 2.6} H${x + (i % 2 ? 12.6 : 13.8)}`} stroke="#fff" strokeOpacity={i === 3 ? 0.9 : 0.5} strokeWidth="0.9" strokeLinecap="round" />
        </g>
      ))}
      <g className="art-h-show">
        <path d={bar(25.5, 38.4)} fill={url('ok')} stroke="#DCFCE7" strokeWidth="0.6" />
        <path d="M31.4 41 L33.2 42.6 L36.6 39.4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <Sparkle x={9} y={9} r={2.2} fill="#FEF3C7" idle delay={0.3} />
      <circle cx="40" cy="7" r="0.6" fill="#fff" opacity="0.8" />
      <circle cx="42.5" cy="22" r="0.5" fill="#FDE68A" opacity="0.8" />
      <circle cx="5.5" cy="21" r="0.45" fill="#fff" opacity="0.6" />
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={36.5} y={10.5} r={2.8} fill="#FEF3C7" /></g>
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Busca el intruso — tres esferas iguales y una estrella distinta en el
   punto de mira.
   Reposo: la mira late y titila un destello.
   Hover: la mira gira un cuarto de vuelta y la estrella da un salto.
   -------------------------------------------------------------------------- */
const BuscaIntruso = () => {
  const [id, url] = useArtIds();
  const spheres = [[14.5, 14.5], [33.5, 14.5], [14.5, 33.5]];
  const S = { x: 33.5, y: 33.5 };
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FEF6B8', base: '#FACC15', dark: '#D97706', deep: '#713F12' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#713F12" opacity={0.5} />
          <SphereGradient id={id('ball')} light="#DBEAFE" base="#3B82F6" dark="#1E3A8A" />
          <MaterialGradient id={id('star')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
          <GlowGradient id={id('aura')} color="#fff" opacity={0.55} />
        </>
      )}
    >
      {spheres.map(([x, y]) => (
        <g key={`${x}${y}`}>
          <ellipse cx={x + 0.6} cy={y + 6.3} rx="5.6" ry="1.4" fill={url('shadow')} />
          <circle cx={x} cy={y} r="6.3" fill={url('ball')} />
          <path d={`M${x - 4.6} ${y + 1.2} C${x - 4} ${y + 4.2} ${x - 1.4} ${y + 5.4} ${x + 1.2} ${y + 5.1}`} stroke="#BFDBFE" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />
          <ellipse cx={x - 2} cy={y - 2.8} rx="2.4" ry="1.4" fill="#fff" opacity="0.85" transform={`rotate(-25 ${x - 2} ${y - 2.8})`} />
        </g>
      ))}

      {/* intruso: estrella con aura */}
      <circle cx={S.x} cy={S.y} r="8.4" fill={url('aura')} />
      <ellipse cx={S.x + 0.6} cy={S.y + 6.6} rx="5" ry="1.3" fill={url('shadow')} />
      <g className="art-h-jump" style={{ '--jump': '-5px' }}>
        <path d={starPath(S.x, S.y, 7, 3.1)} fill={url('star')} />
        <path d={`M${S.x} ${S.y - 7} L${S.x + 1.82} ${S.y - 2.5} L${S.x} ${S.y} L${S.x - 6.66} ${S.y - 2.16} L${S.x - 2.95} ${S.y - 0.96} Z`} fill="#fff" opacity="0.32" />
        <path d={`M${S.x} ${S.y} L${S.x + 4.11} ${S.y + 5.66} L${S.x + 2.95} ${S.y + 0.96} L${S.x + 6.66} ${S.y - 2.16} Z`} fill="#831843" opacity="0.25" />
        <circle cx={S.x - 1.6} cy={S.y - 3} r="0.8" fill="#fff" opacity="0.9" />
      </g>

      {/* punto de mira (reposo: late · hover: gira) */}
      <g className="art-i-pulse" style={{ '--amp': '1.06', '--dur': '2.2s' }}>
        <g className="art-h-spin" style={{ '--spin': '90deg' }}>
          <circle cx={S.x} cy={S.y} r="9.6" stroke="#fff" strokeOpacity="0.65" strokeWidth="2.4" />
          <circle cx={S.x} cy={S.y} r="9.6" stroke="#DC2626" strokeWidth="1.3" />
          <path d={`M${S.x} ${S.y - 8} V${S.y - 11.4} M${S.x} ${S.y + 8} V${S.y + 11.4} M${S.x - 8} ${S.y} H${S.x - 11.4} M${S.x + 8} ${S.y} H${S.x + 11.4}`} stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </g>

      <Sparkle x={24} y={24} r={2} fill="#fff" idle delay={0.8} />
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Nave de palabras — nave espacial disparando a una palabra (LUZ) entre
   nebulosas.
   Reposo: la llama del motor parpadea y titila una estrella.
   Hover: la nave sube, sale una ráfaga láser y la palabra recibe el impacto.
   -------------------------------------------------------------------------- */
const NavePalabras = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#5B54E8', base: '#2B2378', dark: '#0E0B2E', deep: '#05031A' }}
      defs={(
        <>
          <GlowGradient id={id('nebP')} color="#EC4899" opacity={0.5} />
          <GlowGradient id={id('nebC')} color="#22D3EE" opacity={0.32} />
          <MaterialGradient id={id('word')} light="#A7F3D0" base="#10B981" dark="#047857" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('hull')} light="#FFFFFF" base="#E0E7FF" dark="#8B98C9" x1={0} y1={0.5} x2={1} y2={0.5} />
          <MaterialGradient id={id('wing')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
          <SphereGradient id={id('glass')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
          <linearGradient id={id('flame')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="45%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </linearGradient>
          <GlowGradient id={id('bolt')} color="#22D3EE" opacity={0.7} />
          <GlossGradient id={id('gloss')} opacity={0.6} />
        </>
      )}
    >
      {/* nebulosas y estrellas */}
      <circle cx="37" cy="11" r="15" fill={url('nebP')} />
      <circle cx="9" cy="31" r="13" fill={url('nebC')} />
      {[[7, 8, 0.55], [42, 30, 0.5], [12, 20, 0.4], [39, 41, 0.45], [5, 42, 0.4], [30, 4, 0.4]].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.85" />
      ))}

      {/* palabra objetivo */}
      <rect x="13" y="7.8" width="22" height="8.4" rx="4.2" fill="#022C22" opacity="0.4" transform="translate(0.6 1)" />
      <rect x="13" y="7.8" width="22" height="8.4" rx="4.2" fill={url('word')} />
      <rect x="15" y="8.5" width="18" height="2.6" rx="1.3" fill={url('gloss')} />
      <text {...T} x="24" y="14.3" fontSize="5.8" fill="#fff">LUZ</text>
      <g className="art-h-burst" style={{ '--d': '.2s' }}>
        <circle cx="24" cy="15.6" r="5" fill={url('bolt')} />
        <Sparkle x={24} y={15.8} r={3.4} fill="#CFFAFE" />
      </g>

      {/* láser: un disparo en reposo, ráfaga en hover */}
      <rect x="22.4" y="19.6" width="3.2" height="5.4" rx="1.6" fill={url('bolt')} />
      <rect x="23.35" y="20.2" width="1.3" height="4.2" rx="0.65" fill="#E0FFFF" />
      <g className="art-h-show">
        <rect x="23.35" y="17.4" width="1.3" height="1.8" rx="0.65" fill="#E0FFFF" />
        <rect x="23.35" y="25.6" width="1.3" height="2.4" rx="0.65" fill="#A5F3FC" />
      </g>

      {/* nave (hover: sube) */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-i-flicker art-o-top" style={{ '--dur': '.5s' }}>
          <path d="M21.6 39.4 Q24 48.6 26.4 39.4 Z" fill={url('flame')} />
          <path d="M22.9 39.4 Q24 44.4 25.1 39.4 Z" fill="#FFFBEB" opacity="0.9" />
        </g>
        <path d="M20.8 31.6 L12.8 38.6 L13.4 41.2 L21 39 Z" fill={url('wing')} />
        <path d="M27.2 31.6 L35.2 38.6 L34.6 41.2 L27 39 Z" fill={url('wing')} />
        <path d="M13.4 39 L20.8 33" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
        <circle cx="13.3" cy="40" r="0.75" fill="#A5F3FC" />
        <circle cx="34.7" cy="40" r="0.75" fill="#A5F3FC" />
        <path d="M24 26.2 C26.6 28.6 27.7 32.2 27.7 36 L27.1 40 H20.9 L20.3 36 C20.3 32.2 21.4 28.6 24 26.2 Z" fill={url('hull')} />
        <path d="M24 26.2 C26.6 28.6 27.7 32.2 27.7 36 L27.1 40 H24 Z" fill="#312E81" opacity="0.18" />
        <path d="M21.6 34 C21.6 31.4 22.4 29.4 23.6 28" stroke="#fff" strokeWidth="0.7" strokeLinecap="round" />
        <ellipse cx="24" cy="32.2" rx="1.75" ry="2.6" fill={url('glass')} />
        <ellipse cx="23.5" cy="31.2" rx="0.6" ry="0.9" fill="#fff" opacity="0.9" />
        <rect x="21.4" y="39.2" width="5.2" height="1.4" rx="0.6" fill="#64748B" />
      </g>

      <Sparkle x={40} y={21} r={1.8} idle delay={0.7} />
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Runner — cubo saltarín sobre suelo de neón con sol retro, pincho y
   estrella de bonus.
   Reposo: la estrella flota y titila un destello.
   Hover: el cubo salta girando un cuarto de vuelta y la estrella crece.
   -------------------------------------------------------------------------- */
const Runner = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FF8FCB', base: '#A855F7', dark: '#3B0F7A', deep: '#12052E' }}
      defs={(
        <>
          <clipPath id={id('clip')}><rect width="48" height="48" rx="12" /></clipPath>
          <linearGradient id={id('sun')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="55%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
          <linearGradient id={id('ground')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E1065" />
            <stop offset="100%" stopColor="#12052E" />
          </linearGradient>
          <MaterialGradient id={id('cube')} light="#FEF9C3" base="#FACC15" dark="#D97706" />
          <MaterialGradient id={id('spike')} light="#7C3AED" base="#3B0764" dark="#1E0B3B" />
          <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
          <GlossGradient id={id('trail')} opacity={0.7} vertical={false} />
          <ShadowGradient id={id('shadow')} color="#05010F" opacity={0.6} />
        </>
      )}
    >
      {/* sol retro con franjas (las franjas son "huecos" pintados con el fondo) */}
      <circle cx="27" cy="31" r="11.5" fill={url('sun')} />
      {[[30.4, 1], [33.2, 1.4], [35.8, 1.8]].map(([y, h]) => (
        <g key={y}>
          <rect x="14" y={y} width="26" height={h} fill={url('tile')} />
          <rect x="14" y={y} width="26" height={h} fill={url('tileVig')} />
        </g>
      ))}

      {/* suelo de neón con rejilla en perspectiva */}
      <g clipPath={url('clip')}>
        <rect x="0" y="37.2" width="48" height="11" fill={url('ground')} />
        <path d="M20 37.2 L12 48 M28 37.2 L36 48 M14 37.2 L-2 48 M34 37.2 L50 48 M24 37.2 V48 M0 40.6 H48 M0 44.6 H48" stroke="#D946EF" strokeOpacity="0.55" strokeWidth="0.5" />
        <path d="M0 37.2 H48" stroke="#22D3EE" strokeOpacity="0.35" strokeWidth="2.6" />
        <path d="M0 37.2 H48" stroke="#A5F3FC" strokeWidth="0.8" />
      </g>

      {/* pincho */}
      <path d="M31.2 37.2 L35.4 29.2 L39.6 37.2 Z" fill={url('spike')} stroke="#22D3EE" strokeWidth="0.7" strokeLinejoin="round" />
      <path d="M33 36.4 L35.4 31.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />

      {/* trayectoria del salto */}
      <path d="M20 26 Q28 11 40.5 24" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeDasharray="1.2 1.6" strokeLinecap="round" />

      {/* estela */}
      <path d="M3.5 20.5 H9.5 M2.5 24.5 H9 M4 28.5 H9.5" stroke={url('trail')} strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="15.6" cy="37.6" rx="6.2" ry="1.1" fill={url('shadow')} />

      {/* cubo (hover: salto con giro) */}
      <g className="art-h-jump" style={{ '--jump': '-6px' }}>
        <g className="art-h-spin" style={{ '--spin': '90deg' }}>
          <g transform="rotate(-14 15.6 24.6)">
            <rect x="10" y="19" width="11.2" height="11.2" rx="1.6" fill={url('cube')} stroke="#92400E" strokeWidth="0.8" />
            <rect x="12.2" y="21.2" width="6.8" height="6.8" rx="0.8" stroke="#B45309" strokeOpacity="0.55" strokeWidth="0.6" />
            <path d="M11 20.6 H19.6" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" strokeLinecap="round" />
            <rect x="12.6" y="22.2" width="2.2" height="2.6" rx="0.5" fill="#1E1B4B" />
            <rect x="16.4" y="22.2" width="2.2" height="2.6" rx="0.5" fill="#1E1B4B" />
            <rect x="13" y="22.5" width="0.8" height="0.8" fill="#fff" />
            <rect x="16.8" y="22.5" width="0.8" height="0.8" fill="#fff" />
            <rect x="13.4" y="26.4" width="4.4" height="1" rx="0.5" fill="#1E1B4B" opacity="0.75" />
          </g>
        </g>
      </g>

      {/* estrella de bonus (reposo: flota · hover: crece) */}
      <g className="art-i-bob" style={{ '--amp': '-1.6px', '--dur': '3s' }}>
        <g className="art-h-pop" style={{ '--pop': '1.3' }}>
          <path d="M39.5 6.2 L40.9 9 L44 9.4 L41.8 11.6 L42.3 14.7 L39.5 13.2 L36.7 14.7 L37.2 11.6 L35 9.4 L38.1 9 Z" fill={url('gold')} />
          <path d="M39.5 6.2 L40.9 9 L39.5 10.6 L35 9.4 L38.1 9 Z" fill="#fff" opacity="0.45" />
        </g>
      </g>

      <Sparkle x={7} y={9} r={2} fill="#FFE4F3" idle delay={1.2} />
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Snake — serpiente con escamas sobre tablero a cuadros, a punto de
   comerse la manzana.
   Reposo: la manzana flota y titila un destello.
   Hover: la cabeza se lanza, la manzana encoge (¡ñam!) y salta una chispa.
   -------------------------------------------------------------------------- */
const Snake = () => {
  const [id, url] = useArtIds();
  const body = 'M8.6 38.6 V30.2 H20 V20.4 H30.6';
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#E6FBB0', base: '#A3E635', dark: '#4D7C0F', deep: '#1A2E05' }}
      defs={(
        <>
          <pattern id={id('chk')} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#fff" opacity="0.2" />
            <rect x="4" y="4" width="4" height="4" fill="#fff" opacity="0.2" />
          </pattern>
          <linearGradient id={id('body')} x1="6" y1="38" x2="32" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <SphereGradient id={id('head')} light="#86EFAC" base="#22C55E" dark="#166534" />
          <SphereGradient id={id('apple')} light="#FECACA" base="#EF4444" dark="#991B1B" />
          <ShadowGradient id={id('shadow')} color="#1A2E05" opacity={0.45} />
        </>
      )}
    >
      <rect width="48" height="48" rx="12" fill={url('chk')} />

      {/* cuerpo: sombra, contorno, volumen, brillo y escamas */}
      <path d={body} transform="translate(0.9 1.4)" stroke="#1A2E05" strokeOpacity="0.28" strokeWidth="7.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.1 38.4 Q6.9 43.4 8.6 45.6 Q10.3 43.4 12.1 38.4 Z" fill="#15803D" />
      <path d={body} stroke="#14532D" strokeWidth="7.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={body} stroke={url('body')} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d={body} transform="translate(-0.7 -1.1)" stroke="#BBF7D0" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d={body} stroke="#14532D" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="0.01 2.4" strokeLinecap="round" />

      {/* cabeza (hover: se lanza hacia la manzana) */}
      <g transform="translate(-0.2 -4.6)">
      <g className="art-h-slide" style={{ '--slide': '2.5px' }}>
        <ellipse cx="32.8" cy="25" rx="5.3" ry="4.6" fill="#14532D" />
        <ellipse cx="32.8" cy="25" rx="4.7" ry="4" fill={url('head')} />
        <path d="M37.2 25 H39.2 M39.2 25 L40.2 24.2 M39.2 25 L40.2 25.8" stroke="#E11D48" strokeWidth="0.6" strokeLinecap="round" />
        <circle cx="33.6" cy="22.6" r="1.25" fill="#fff" />
        <circle cx="33.6" cy="27.4" r="1.25" fill="#fff" />
        <circle cx="34.1" cy="22.6" r="0.65" fill="#1E1B4B" />
        <circle cx="34.1" cy="27.4" r="0.65" fill="#1E1B4B" />
        <ellipse cx="31" cy="23.4" rx="1.4" ry="0.7" fill="#fff" opacity="0.5" />
      </g>
      </g>

      {/* manzana (reposo: flota · hover: se la come) */}
      <g transform="translate(0 -4.6)">
      <ellipse cx="41" cy="30.2" rx="3.4" ry="0.9" fill={url('shadow')} />
      <g className="art-i-bob" style={{ '--amp': '-1.2px', '--dur': '2.6s' }}>
        <g className="art-h-shrink" style={{ '--shrink': '.45' }}>
          <path d="M41 21.6 C42.8 20.6 45.2 21.6 45.2 24.6 C45.2 27.6 43.2 29.4 41 28.6 C38.8 29.4 36.8 27.6 36.8 24.6 C36.8 21.6 39.2 20.6 41 21.6 Z" fill={url('apple')} />
          <path d="M41 21.8 C41 20.6 41.4 19.6 42 19" stroke="#78350F" strokeWidth="0.7" strokeLinecap="round" />
          <path d="M41.6 20.2 C42.6 18.6 44.4 18.6 45 19.2 C44.2 20.4 42.8 20.8 41.6 20.2 Z" fill="#22C55E" />
          <ellipse cx="39.2" cy="23.2" rx="0.9" ry="0.6" fill="#fff" opacity="0.85" />
        </g>
      </g>
      </g>

      <Sparkle x={8.6} y={9.6} r={2.2} fill="#F7FEE7" idle delay={0.5} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={37.4} y={8.6} r={2.6} fill="#FEF9C3" /></g>
    </Tile>
  );
};

// Gota con la punta hacia arriba (r: radio de la parte redonda).
const drop = (cx, cy, r) => `M${cx} ${cy - 1.75 * r} C${cx + 0.35 * r} ${cy - 1.2 * r} ${cx + r} ${cy - 0.6 * r} ${cx + r} ${cy} A${r} ${r} 0 0 1 ${cx - r} ${cy} C${cx - r} ${cy - 0.6 * r} ${cx - 0.35 * r} ${cy - 1.2 * r} ${cx} ${cy - 1.75 * r} Z`;

// Gota de lluvia con letra (Lluvia de palabras).
const Drop = ({ url, cx, cy, fill, letter }) => (
  <>
    <path d={drop(cx + 0.6, cy + 0.9, 4.2)} fill="#082F49" opacity="0.22" />
    <path d={drop(cx, cy, 4.2)} fill={url(fill)} />
    <path d={`M${cx - 2.6} ${cy - 1.4} C${cx - 2.4} ${cy - 3.2} ${cx - 1.4} ${cy - 4.6} ${cx - 0.4} ${cy - 5.6}`} stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" strokeLinecap="round" />
    <text {...T} x={cx} y={cy + 2} fontSize="5.4" fill="#fff">{letter}</text>
  </>
);

/* --------------------------------------------------------------------------
   Lluvia de palabras — nube esponjosa que deja caer gotas con letras.
   Reposo: la nube flota y titila un destello.
   Hover: las gotas caen y la que llega al suelo forma una onda.
   -------------------------------------------------------------------------- */
const LluviaPalabras = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#C8F1FF', base: '#38BDF8', dark: '#0369A1', deep: '#082F49' }}
      defs={(
        <>
          <MaterialGradient id={id('cloud')} light="#FFFFFF" base="#F4FAFF" dark="#B4D3EC" x1={0.3} y1={0} x2={0.6} y2={1} />
          <MaterialGradient id={id('pink')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
          <MaterialGradient id={id('amber')} light="#FEF3C7" base="#F59E0B" dark="#B45309" />
          <MaterialGradient id={id('indigo')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
          <ShadowGradient id={id('shadow')} color="#082F49" opacity={0.4} />
        </>
      )}
    >
      {/* rastro de lluvia */}
      <path d="M9 22 L7.6 26 M19.6 21.4 L18.2 25.4 M30 21.6 L28.6 25.6 M40.4 22.4 L39 26.4 M42 33 L40.8 36.4 M6 34 L4.8 37.4" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round" />

      {/* onda en el suelo (hover) y sombra */}
      <ellipse cx="24.5" cy="44.6" rx="7" ry="1.4" fill={url('shadow')} />
      <g className="art-h-show">
        <ellipse cx="24.5" cy="44.4" rx="7.4" ry="1.6" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.6" />
        <ellipse cx="24.5" cy="44.4" rx="4" ry="0.9" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.6" />
      </g>

      {/* gotas con letras (hover: caen) */}
      <g className="art-h-drop" style={{ '--drop': '5px' }}>
        <Drop url={url} cx={12.5} cy={31} fill="pink" letter="A" />
        <Drop url={url} cx={36} cy={29.6} fill="indigo" letter="C" />
      </g>
      <g className="art-h-drop" style={{ '--drop': '2.5px' }}>
        <Drop url={url} cx={24.5} cy={36.4} fill="amber" letter="B" />
      </g>

      {/* nube (reposo: flota) */}
      <g className="art-i-bob" style={{ '--amp': '-1.2px', '--dur': '4.4s' }}>
        <path d="M11 20.2 C7.6 20.2 5.4 18 5.4 15.3 C5.4 12.5 7.6 10.6 10.2 10.8 C11 7.4 14 5.3 17.4 5.6 C19.6 3.2 22.9 2.4 26 3.5 C28.8 4.4 30.6 6.5 31.2 8.8 C32.6 8 34.6 7.8 36.2 8.5 C38.9 9.6 40.4 12 40.1 14.6 C42.3 15 43.8 16.8 43.4 18.6 C43.1 19.7 42.3 20.2 41.3 20.2 Z" fill="#0C4A6E" opacity="0.25" transform="translate(0.8 1.4)" />
        <path d="M11 20.2 C7.6 20.2 5.4 18 5.4 15.3 C5.4 12.5 7.6 10.6 10.2 10.8 C11 7.4 14 5.3 17.4 5.6 C19.6 3.2 22.9 2.4 26 3.5 C28.8 4.4 30.6 6.5 31.2 8.8 C32.6 8 34.6 7.8 36.2 8.5 C38.9 9.6 40.4 12 40.1 14.6 C42.3 15 43.8 16.8 43.4 18.6 C43.1 19.7 42.3 20.2 41.3 20.2 Z" fill={url('cloud')} />
        <path d="M8.2 13.4 C8.8 12 10 11.4 11 11.6 M18 7.2 C19.6 5.4 22 4.6 24.4 5" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M8 19 C14 17.8 33 17.8 42.4 19" stroke="#7FB2D9" strokeOpacity="0.5" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      <Sparkle x={41.6} y={5.6} r={2} fill="#fff" idle delay={0.9} />
    </Tile>
  );
};

// Carta boca arriba con estrella (Parejas).
const Card = ({ url, cx, rot }) => (
  <g transform={`rotate(${rot} ${cx} 25)`}>
    <rect x={cx - 7.5 + 0.8} y={15 + 1.2} width="15" height="20" rx="2.6" fill="#2E1065" opacity="0.3" />
    <rect x={cx - 7.5} y="15" width="15" height="20" rx="2.6" fill={url('face')} />
    <rect x={cx - 6.3} y="16.2" width="12.6" height="17.6" rx="1.8" stroke="#A78BFA" strokeOpacity="0.55" strokeWidth="0.6" />
    <path d={starPath(cx, 25.4, 4.8, 2.1)} fill={url('gold')} />
    <path d={`M${cx} ${25.4 - 4.8} L${cx + 1.23} ${25.4 - 1.7} L${cx} ${25.4} L${cx - 4.57} ${25.4 - 1.48} L${cx - 2} ${25.4 - 0.65} Z`} fill="#fff" opacity="0.4" />
    <rect x={cx - 6} y="15.8" width="12" height="3" rx="1.5" fill="#fff" opacity="0.7" />
  </g>
);

/* --------------------------------------------------------------------------
   Parejas de cartas — dos cartas boca arriba con la misma estrella sobre
   una carta boca abajo y el sello verde de pareja encontrada.
   Reposo: el sello late y titila un destello.
   Hover: las cartas se abren en abanico y el sello crece.
   -------------------------------------------------------------------------- */
const Parejas = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#E6DEFF', base: '#8B5CF6', dark: '#5B21B6', deep: '#2E1065' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#2E1065" opacity={0.5} />
          <MaterialGradient id={id('face')} light="#FFFFFF" base="#FBF9FF" dark="#DCD0FF" />
          <MaterialGradient id={id('back')} light="#F9A8D4" base="#DB2777" dark="#831843" />
          <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
          <SphereGradient id={id('ok')} light="#BBF7D0" base="#22C55E" dark="#15803D" />
        </>
      )}
    >
      <ellipse cx="24" cy="39.6" rx="17" ry="2" fill={url('shadow')} />

      {/* carta boca abajo (detrás) */}
      <rect x="17" y="8.4" width="14" height="19" rx="2.4" fill={url('back')} />
      <rect x="18.2" y="9.6" width="11.6" height="16.6" rx="1.6" stroke="#FCE7F3" strokeOpacity="0.8" strokeWidth="0.6" />
      <path d="M18.6 13.6 L24 9.8 L29.4 13.6 M18.6 18 L24 14.2 L29.4 18 M18.6 22.4 L24 18.6 L29.4 22.4" stroke="#FCE7F3" strokeOpacity="0.45" strokeWidth="0.55" />

      {/* cartas boca arriba (hover: se abren) */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-7deg' }}><Card url={url} cx={15.4} rot={-13} /></g>
      <g className="art-h-tilt-r art-o-bottom" style={{ '--tilt': '7deg' }}><Card url={url} cx={32.6} rot={13} /></g>

      {/* sello de pareja (reposo: late · hover: crece) */}
      <g className="art-i-pulse" style={{ '--amp': '1.08', '--dur': '2.6s' }}>
        <g className="art-h-pop" style={{ '--pop': '1.25' }}>
          <circle cx="24" cy="36.4" r="4.6" fill="#14532D" opacity="0.3" transform="translate(0.4 0.7)" />
          <circle cx="24" cy="36.4" r="4.6" fill={url('ok')} />
          <circle cx="24" cy="36.4" r="4.6" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.7" />
          <path d="M21.9 36.5 L23.4 38 L26.3 35" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      <Sparkle x={41.5} y={8.6} r={2.2} fill="#F5F3FF" idle delay={0.2} />
      <Sparkle x={7} y={9.5} r={1.8} fill="#FEF3C7" opacity={0.85} />
    </Tile>
  );
};

// Cubo clasificador con emblema de forma (Clasificador).
const Bin = ({ url, x, mat, emblem }) => (
  <>
    <path d={`M${x} 27 H${x + 17} L${x + 15.4} 42 H${x + 1.6} Z`} fill={url(mat)} />
    <path d={`M${x + 11.5} 27 H${x + 17} L${x + 15.4} 42 H${x + 11} Z`} fill="#042F2E" opacity="0.18" />
    <path d={`M${x + 1.6} 29.6 L${x + 2.7} 40.4`} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
    <rect x={x - 0.8} y="25.6" width="18.6" height="3.2" rx="1.6" fill={url(mat)} />
    <rect x={x - 0.2} y="25.9" width="17.4" height="1.1" rx="0.55" fill="#fff" opacity="0.55" />
    {emblem === 'circle'
      ? <circle cx={x + 8.5} cy="35.4" r="3" stroke="#fff" strokeWidth="1.3" />
      : <rect x={x + 5.6} y="32.5" width="5.8" height="5.8" rx="0.8" stroke="#fff" strokeWidth="1.3" />}
  </>
);

/* --------------------------------------------------------------------------
   Clasificador — dos cubos de colores (círculos / cuadrados) y las piezas
   cayendo cada una en el suyo.
   Reposo: las piezas flotan.
   Hover: cada pieza cae dentro de su cubo y salta una chispa.
   -------------------------------------------------------------------------- */
const Clasificador = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#B9FBEE', base: '#14B8A6', dark: '#0F766E', deep: '#042F2E' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#042F2E" opacity={0.5} />
          <MaterialGradient id={id('amberBin')} light="#FDE68A" base="#F59E0B" dark="#B45309" />
          <MaterialGradient id={id('indigoBin')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
          <SphereGradient id={id('ball')} light="#FEF3C7" base="#FBBF24" dark="#C2410C" />
          <MaterialGradient id={id('cube')} light="#A5B4FC" base="#6366F1" dark="#312E81" />
        </>
      )}
    >
      <ellipse cx="24" cy="42.8" rx="20" ry="1.8" fill={url('shadow')} />
      {/* interior de los cubos (detrás de las piezas) */}
      <rect x="5" y="25.2" width="17" height="3" rx="1.5" fill="#78350F" />
      <rect x="26" y="25.2" width="17" height="3" rx="1.5" fill="#1E1B4B" />

      {/* trayectorias */}
      <path d="M13.5 6.5 V12 M34.5 3.6 V7" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeDasharray="1.2 1.4" strokeLinecap="round" />

      {/* piezas (reposo: flotan · hover: caen en su cubo) */}
      <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.2s' }}>
        <g className="art-h-drop" style={{ '--drop': '10px' }}>
          <circle cx="13.5" cy="17" r="4.6" fill={url('ball')} />
          <ellipse cx="12" cy="15.1" rx="1.6" ry="1" fill="#fff" opacity="0.85" />
        </g>
      </g>
      <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.2s', '--d': '-1.4s' }}>
        <g className="art-h-drop" style={{ '--drop': '12px' }}>
          <g transform="rotate(12 34.5 13.5)">
            <rect x="30.3" y="9.3" width="8.4" height="8.4" rx="1.6" fill={url('cube')} />
            <rect x="31.2" y="10" width="6.6" height="1.6" rx="0.8" fill="#fff" opacity="0.55" />
            <rect x="35.8" y="10.6" width="2.4" height="6.6" rx="1" fill="#1E1B4B" opacity="0.2" />
          </g>
        </g>
      </g>

      {/* cubos (por delante de las piezas) */}
      <Bin url={url} x={5} mat="amberBin" emblem="circle" />
      <Bin url={url} x={26} mat="indigoBin" emblem="square" />

      <Sparkle x={24} y={10.5} r={2} fill="#F0FDFA" />
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={24} y={21} r={2.6} fill="#FEF9C3" /></g>
    </Tile>
  );
};

// Ficha de palabra con grosor (Ordena la frase).
const Chip = ({ url, x, y, w, word, mat = 'chip', ink = '#881337' }) => (
  <>
    <rect x={x} y={y + 1.1} width={w} height="8.4" rx="2.8" fill="#881337" opacity="0.55" />
    <rect x={x} y={y} width={w} height="8.4" rx="2.8" fill={url(mat)} />
    <rect x={x + 1.1} y={y + 0.7} width={w - 2.2} height="2.4" rx="1.2" fill="#fff" opacity="0.6" />
    <text {...T} x={x + w / 2} y={y + 6.2} fontSize="5.8" fill={ink}>{word}</text>
  </>
);

/* --------------------------------------------------------------------------
   Ordena la frase — bandeja con "El" "sol" y el hueco donde falta "sale",
   que espera arrastrada por el cursor.
   Reposo: la ficha arrastrada flota y titila un destello.
   Hover: la ficha se endereza y encaja en su hueco; salta una chispa.
   -------------------------------------------------------------------------- */
const OrdenaFrase = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FFD5DE', base: '#FB7185', dark: '#BE123C', deep: '#4C0519' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#4C0519" opacity={0.45} />
          <MaterialGradient id={id('chip')} light="#FFFFFF" base="#FFF5F7" dark="#FBC8D4" />
          <MaterialGradient id={id('hot')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
          <linearGradient id={id('tray')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4C0519" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#4C0519" stopOpacity="0.14" />
          </linearGradient>
        </>
      )}
    >
      {/* bandeja de la frase: El · sol · [hueco] */}
      <ellipse cx="24" cy="41.4" rx="20" ry="1.6" fill={url('shadow')} />
      <rect x="3.6" y="28" width="40.8" height="12" rx="4" fill={url('tray')} />
      <rect x="3.6" y="28" width="40.8" height="12" rx="4" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.6" />
      <Chip url={url} x={5.4} y={29.6} w={9} word="El" />
      <Chip url={url} x={15.6} y={29.6} w={12} word="sol" />
      <rect x="28.8" y="29.8" width="14" height="8.4" rx="2.8" stroke="#fff" strokeWidth="0.75" strokeDasharray="1.4 1" />

      {/* trayectoria hasta el hueco */}
      <path d="M29.4 15.4 C34.6 16 36.8 20.6 36 25.8" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.9" strokeDasharray="1.3 1.1" strokeLinecap="round" />
      <path d="M34.4 25.4 L35.9 27.9 L37.4 25.6 Z" fill="#fff" opacity="0.9" />

      {/* ficha arrastrada (reposo: flota · hover: se endereza y encaja) */}
      <g className="art-i-bob" style={{ '--amp': '-1.5px', '--dur': '3.4s' }}>
        <g className="art-h-slide" style={{ '--slide': '15.8px' }}>
          <g className="art-h-drop" style={{ '--drop': '19.6px' }}>
            <g className="art-h-tilt" style={{ '--tilt': '8deg' }}>
              <g transform="rotate(-8 20 14.2)">
                <Chip url={url} x={13} y={10} w={14} word="sale" mat="hot" ink="#fff" />
              </g>
            </g>
            {/* cursor de arrastre */}
            <path d="M24.6 17.6 V23 L25.9 21.8 L26.9 23.9 L27.8 23.5 L26.9 21.5 L28.6 21.3 Z" fill="#fff" stroke="#4C0519" strokeOpacity="0.7" strokeWidth="0.55" strokeLinejoin="round" />
          </g>
        </g>
      </g>

      <Sparkle x={40.6} y={9} r={2.4} fill="#FFF1F2" idle delay={0.6} />
      <Sparkle x={6.4} y={20.4} r={1.6} fill="#FFE4E6" opacity={0.85} />
    </Tile>
  );
};

// Foto con marco, escena y número de orden (Ordena la historia).
const Photo = ({ url, cx, cy, rot, n, sky, children }) => {
  const x = cx - 7;
  const y = cy - 8.4;
  const bx = n === '3' ? 12.7 : 1.3;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <rect x={x + 0.8} y={y + 1.3} width="14" height="16.8" rx="1.5" fill="#450A0A" opacity="0.32" />
      <rect x={x} y={y} width="14" height="16.8" rx="1.5" fill={url('frame')} />
      <rect x={x + 1.1} y={y + 1.1} width="11.8" height="11.4" rx="0.7" fill={url(sky)} />
      {children(x + 1.1, y + 1.1, 11.8, 11.4)}
      <circle cx={x + bx} cy={y + 1.3} r="2.8" fill={url('badge')} />
      <circle cx={x + bx} cy={y + 1.3} r="2.8" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.45" />
      <text {...T} x={x + bx} y={y + 2.7} fontSize="3.9" fill="#fff">{n}</text>
    </g>
  );
};

/* --------------------------------------------------------------------------
   Ordena la historia — tres fotos numeradas en abanico que cuentan un día:
   amanecer, mediodía y noche.
   Reposo: el sol de la foto central late y titila un destello.
   Hover: el abanico se abre y la foto central sube.
   -------------------------------------------------------------------------- */
const OrdenaHistoria = () => {
  const [id, url] = useArtIds();
  const hill = (px, py, pw, ph, fill) => (
    <path d={`M${px} ${py + ph - 2.6} Q${px + pw * 0.45} ${py + ph - 5.6} ${px + pw} ${py + ph - 3} V${py + ph} H${px} Z`} fill={fill} />
  );
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FFCABE', base: '#F87171', dark: '#B91C1C', deep: '#450A0A' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#450A0A" opacity={0.45} />
          <MaterialGradient id={id('frame')} light="#FFFFFF" base="#FFFBF5" dark="#F1DCCB" />
          <SphereGradient id={id('badge')} light="#A5B4FC" base="#4F46E5" dark="#312E81" />
          <linearGradient id={id('dawn')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FBCFE8" /><stop offset="100%" stopColor="#FDBA74" /></linearGradient>
          <linearGradient id={id('day')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7DD3FC" /><stop offset="100%" stopColor="#E0F2FE" /></linearGradient>
          <linearGradient id={id('night')} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E1B4B" /><stop offset="100%" stopColor="#4338CA" /></linearGradient>
          <SphereGradient id={id('sun')} light="#FEF9C3" base="#FBBF24" dark="#F59E0B" />
        </>
      )}
    >
      <ellipse cx="24" cy="39.8" rx="19" ry="2" fill={url('shadow')} />

      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-8deg' }}>
        <Photo url={url} cx={12.4} cy={25.6} rot={-14} n="1" sky="dawn">
          {(px, py, pw, ph) => (
            <>
              <circle cx={px + pw * 0.6} cy={py + ph - 4} r="2.8" fill={url('sun')} />
              {hill(px, py, pw, ph, '#16A34A')}
            </>
          )}
        </Photo>
      </g>
      <g className="art-h-tilt-r art-o-bottom" style={{ '--tilt': '8deg' }}>
        <Photo url={url} cx={35.6} cy={25.6} rot={14} n="3" sky="night">
          {(px, py, pw, ph) => (
            <>
              <circle cx={px + 7.4} cy={py + 4} r="2.6" fill="#FEF3C7" />
              <circle cx={px + 8.6} cy={py + 3.2} r="2.2" fill="#262271" />
              <circle cx={px + 2.9} cy={py + 5.1} r="0.5" fill="#fff" />
              <circle cx={px + 10.1} cy={py + 7.2} r="0.45" fill="#fff" />
              {hill(px, py, pw, ph, '#14532D')}
            </>
          )}
        </Photo>
      </g>
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <Photo url={url} cx={24} cy={22.8} rot={0} n="2" sky="day">
          {(px, py, pw, ph) => (
            <>
              <g className="art-i-pulse" style={{ '--amp': '1.15', '--dur': '2.8s' }}>
                <circle cx={px + pw * 0.5} cy={py + 3.8} r="3.8" fill="#FEF08A" opacity="0.5" />
                <circle cx={px + pw * 0.5} cy={py + 3.8} r="2.6" fill={url('sun')} />
              </g>
              {hill(px, py, pw, ph, '#22C55E')}
            </>
          )}
        </Photo>
      </g>

      <Sparkle x={42} y={7.6} r={2.2} fill="#FFF1F2" idle delay={1} />
      <Sparkle x={6.4} y={8.6} r={1.8} fill="#FEF3C7" opacity={0.85} />
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Detective de palabras — documento con texto y lupa dorada que agranda la
   palabra clave (OJO) resaltada.
   Reposo: titila el destello del cristal.
   Hover: la lupa se acerca, la palabra clave crece y salta una chispa.
   -------------------------------------------------------------------------- */
const Detective = () => {
  const [id, url] = useArtIds();
  const L = { x: 29, y: 23.4, r: 9.4 };
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#D6E5F8', base: '#5B7FB0', dark: '#1E3A5F', deep: '#0B1A2E' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#0B1A2E" opacity={0.5} />
          <MaterialGradient id={id('paper')} light="#FFFFFF" base="#F8FAFC" dark="#D3DEEC" />
          <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
          <MaterialGradient id={id('key')} light="#FEF3C7" base="#FCD34D" dark="#F59E0B" x1={0.5} y1={0} x2={0.5} y2={1} />
          <linearGradient id={id('handle')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id={id('glass')} cx="0.38" cy="0.32" r="0.75">
            <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.32" />
          </radialGradient>
          <clipPath id={id('lens')}><circle cx={L.x} cy={L.y} r={L.r} /></clipPath>
        </>
      )}
    >
      {/* documento */}
      <ellipse cx="18.5" cy="39.8" rx="14" ry="1.7" fill={url('shadow')} />
      <g transform="rotate(-7 18 23)">
        <rect x="7.4" y="8.6" width="22" height="29" rx="2.2" fill="#0B1A2E" opacity="0.3" />
        <rect x="6.6" y="7.4" width="22" height="29" rx="2.2" fill={url('paper')} />
        <rect x="12.6" y="21.2" width="8" height="2.8" rx="1.4" fill="#FCD34D" />
        <path d="M9.6 12.4 H24.6 M9.6 15.8 H22 M9.6 19.2 H25.4 M9.6 22.6 H11.2 M22 22.6 H25 M9.6 26 H23.6 M9.6 29.4 H20.4 M9.6 32.8 H24" stroke="#94A3B8" strokeWidth="1.1" strokeLinecap="round" />
      </g>

      {/* lupa (hover: se acerca) */}
      <g className="art-h-lift" style={{ '--lift': '-2.5px' }}>
        <ellipse cx="33" cy="41" rx="9" ry="1.4" fill={url('shadow')} />
        {/* mango y casquillo */}
        <path d="M38.2 32.6 L43.2 37.6" stroke={url('handle')} strokeWidth="4" strokeLinecap="round" />
        <path d="M38.6 32.2 L42.6 36.2" stroke="#94A3B8" strokeOpacity="0.7" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M36 30.4 L38.6 33" stroke={url('gold')} strokeWidth="4.4" strokeLinecap="round" />
        {/* lo que se ve a través del cristal */}
        <g clipPath={url('lens')}>
          <circle cx={L.x} cy={L.y} r={L.r} fill="#F8FAFC" />
          <path d="M19 17.4 H38 M19 29.6 H33" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
          <g className="art-h-pop" style={{ '--pop': '1.15' }}>
            <rect x="21.2" y="20.1" width="15.6" height="6.8" rx="3.4" fill={url('key')} />
            <text {...T} x={L.x} y="25.6" fontSize="5.8" fill="#78350F">OJO</text>
          </g>
          <circle cx={L.x} cy={L.y} r={L.r} fill={url('glass')} />
        </g>
        <circle cx={L.x} cy={L.y} r={L.r} stroke={url('gold')} strokeWidth="2.6" />
        <circle cx={L.x} cy={L.y} r={L.r - 1.3} stroke="#92400E" strokeOpacity="0.45" strokeWidth="0.5" />
        <path d="M21.4 20.2 C22.4 17.4 24.6 15.6 27.4 15" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M21.2 18.8 C22.6 15.8 25.4 14.2 28.4 14" stroke="#FEF3C7" strokeOpacity="0.8" strokeWidth="0.6" strokeLinecap="round" />
        <Sparkle x={24.6} y={18.2} r={1.9} idle delay={0.5} />
      </g>

      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={41.6} y={9.6} r={2.6} fill="#FEF3C7" /></g>
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Juego de memoria — cerebro brillante con circunvoluciones y engranaje.
   Reposo: el engranaje gira despacio y titila un destello.
   Hover: el cerebro se infla, el engranaje da un giro extra y salta una chispa.
   -------------------------------------------------------------------------- */
const Memoria = () => {
  const [id, url] = useArtIds();
  const brain = 'M12 30 C8 29 6 25.5 7 22 C6.2 18 9 14.6 12.6 14.4 C13.6 10.6 17.6 8.4 21.4 9.4 C23.6 7.2 28 7 30.6 9.2 C34 8.6 37.6 11 38.2 14.6 C41.4 15.8 42.8 19.6 41.6 22.8 C42.6 26.4 40.4 30 36.8 30.4 C35.6 33.2 32.2 34.4 29.4 33.4 C27.4 35.4 23.8 35.6 21.6 33.8 C18.6 35 14.8 33.4 13.8 30.6 Z';
  const gear = (() => {
    const cx = 38.6;
    const cy = 9.6;
    const pt = (r, deg) => {
      const a = (deg * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    };
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = i * 45;
      pts.push(pt(3.7, a - 22.5), pt(3.7, a - 12), pt(5, a - 8), pt(5, a + 8), pt(3.7, a + 12));
    }
    return `M${pts.join(' L')} Z`;
  })();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FFCBE8', base: '#EC4899', dark: '#9D174D', deep: '#500724' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#500724" opacity={0.5} />
          <GlowGradient id={id('aura')} color="#fff" opacity={0.4} />
          <MaterialGradient id={id('brain')} light="#FFF4FA" base="#FBCFE8" dark="#F472B6" />
          <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        </>
      )}
    >
      <circle cx="24" cy="23" r="19" fill={url('aura')} />
      <ellipse cx="24" cy="41.4" rx="15" ry="1.8" fill={url('shadow')} />

      {/* cerebro (hover: se infla) */}
      <g className="art-h-pop" style={{ '--pop': '1.07' }}>
        <g transform="translate(1.2 3) scale(0.95)">
          <path d={brain} fill="#500724" opacity="0.28" transform="translate(1 1.6)" />
          <path d={brain} fill={url('brain')} />
          <path d="M24.4 9.6 C23.2 12.4 24.8 14.4 24 17.6 C23.2 21 25.4 23 24.6 26.6 C24 29.4 24.8 31.8 24 34" stroke="#BE185D" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M15 16.5 C17 18 17 20.5 15.2 22 M19.4 11.4 C19.2 13.8 20.8 15.4 22.6 15.2 M30.5 11.2 C29.5 13.8 31 16.2 34 16.6 M10.5 25 C13 24.6 15 26 15.6 28.4 M17.6 21.6 C19.6 20 21.6 21 22 23 M27.6 20.2 C29 22.4 31.4 23 33.4 21.8 M36.8 20 C35.2 22 35.6 25 37.6 26.4 M18.6 27.6 C20 29.6 21.8 30 23 29 M27.6 27.6 C28.6 29.6 31 30.6 33.4 29.6" stroke="#DB2777" strokeOpacity="0.55" strokeWidth="0.85" strokeLinecap="round" />
          <path d="M9.2 18.8 C9.6 16.6 11 15.4 12.8 15.2 M15.4 12.4 C16.8 10.6 18.8 9.8 21 10.2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M37.4 28.4 C39.4 27.6 40.6 25.6 40.4 23.4" stroke="#BE185D" strokeOpacity="0.35" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      </g>

      {/* engranaje (reposo: gira · hover: giro extra) */}
      <g className="art-h-spin" style={{ '--spin': '120deg' }}>
        <g className="art-i-spin" style={{ '--dur': '12s' }}>
          <path d={gear} fill={url('gold')} />
          <circle cx="38.6" cy="9.6" r="3" stroke="#FEF3C7" strokeOpacity="0.7" strokeWidth="0.5" />
          <circle cx="38.6" cy="9.6" r="1.4" fill="#9D174D" />
        </g>
      </g>

      <Sparkle x={7.6} y={8.6} r={2.3} fill="#FFF1F7" idle delay={0.8} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={42} y={33} r={2.6} fill="#FEF3C7" /></g>
    </Tile>
  );
};

// Gema tallada: silueta, corona y facetas.
const gem = (x, y, k = 1) => `M${x - 2.2 * k} ${y - 2.4 * k} H${x + 2.2 * k} L${x + 3.2 * k} ${y - 0.8 * k} L${x} ${y + 2.8 * k} L${x - 3.2 * k} ${y - 0.8 * k} Z`;
const facets = (x, y, k = 1) => `M${x - 3.2 * k} ${y - 0.8 * k} H${x + 3.2 * k} M${x - 1.1 * k} ${y - 2.4 * k} L${x - 1.4 * k} ${y - 0.8 * k} L${x} ${y + 2.8 * k} L${x + 1.4 * k} ${y - 0.8 * k} L${x + 1.1 * k} ${y - 2.4 * k}`;
const crown = (x, y, k = 1) => `M${x - 2.2 * k} ${y - 2.4 * k} H${x + 2.2 * k} L${x + 3.2 * k} ${y - 0.8 * k} H${x - 3.2 * k} Z`;

// Gema enterrada con halo (Excavación).
const Gem = ({ url, x, y, k, mat, glow }) => (
  <>
    <circle cx={x} cy={y} r={5.4 * k} fill={url(glow)} />
    <path d={gem(x, y, k)} fill={url(mat)} />
    <path d={crown(x, y, k)} fill="#fff" opacity="0.4" />
    <path d={facets(x, y, k)} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.45" strokeLinejoin="round" />
    <circle cx={x - 1.2 * k} cy={y - 1.7 * k} r={0.45 * k} fill="#fff" />
  </>
);

/* --------------------------------------------------------------------------
   Excavación selectiva — corte del terreno por estratos con gemas
   enterradas y un pico golpeando la superficie.
   Reposo: brilla la gema esmeralda y titila la chispa del golpe.
   Hover: el pico golpea, la gema rosa asoma (crece) y saltan chispas.
   -------------------------------------------------------------------------- */
const Excavacion = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FFF6D6', base: '#FCD34D', dark: '#F59E0B', deep: '#78350F' }}
      defs={(
        <>
          <clipPath id={id('clip')}><rect width="48" height="48" rx="12" /></clipPath>
          <MaterialGradient id={id('l1')} light="#EDC17C" base="#C9893F" dark="#A0601F" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('l2')} light="#A86A30" base="#8A4C1C" dark="#6E3712" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('l3')} light="#6B3410" base="#55270B" dark="#3B1906" x1={0.5} y1={0} x2={0.5} y2={1} />
          <MaterialGradient id={id('pink')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
          <MaterialGradient id={id('emerald')} light="#A7F3D0" base="#10B981" dark="#065F46" />
          <MaterialGradient id={id('cyan')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
          <GlowGradient id={id('gPink')} color="#F9A8D4" opacity={0.55} />
          <GlowGradient id={id('gEmerald')} color="#6EE7B7" opacity={0.6} />
          <GlowGradient id={id('gCyan')} color="#67E8F9" opacity={0.6} />
          <MaterialGradient id={id('metal')} light="#F1F5F9" base="#94A3B8" dark="#475569" />
          <linearGradient id={id('wood')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </>
      )}
    >
      {/* estratos del terreno */}
      <g clipPath={url('clip')}>
        <path d="M0 22.8 C6 20.8 10.4 23.6 16.2 22.2 C21.4 21 23.6 23.8 30 22.4 C36.4 21 40.6 23.2 48 21.8 V48 H0 Z" fill={url('l1')} />
        <path d="M0 31.6 C8 30 14 32.6 22 31.2 C30 29.8 38 32.4 48 30.6 V48 H0 Z" fill={url('l2')} />
        <path d="M0 40.4 C9 39 17 41.4 26 40 C34 38.8 41 40.6 48 39.6 V48 H0 Z" fill={url('l3')} />
        <path d="M0 22.8 C6 20.8 10.4 23.6 16.2 22.2 C21.4 21 23.6 23.8 30 22.4 C36.4 21 40.6 23.2 48 21.8" stroke="#FFE9BF" strokeOpacity="0.8" strokeWidth="0.8" />
        <path d="M0 31.6 C8 30 14 32.6 22 31.2 C30 29.8 38 32.4 48 30.6 M0 40.4 C9 39 17 41.4 26 40 C34 38.8 41 40.6 48 39.6" stroke="#FCD9A8" strokeOpacity="0.3" strokeWidth="0.6" />
        <ellipse cx="6.6" cy="27" rx="1.5" ry="0.8" fill="#8A4C1C" opacity="0.7" />
        <ellipse cx="41" cy="27.4" rx="1.2" ry="0.7" fill="#8A4C1C" opacity="0.7" />
        <ellipse cx="19.4" cy="36.6" rx="1.3" ry="0.7" fill="#5B2A0B" opacity="0.7" />
        <ellipse cx="38" cy="44.6" rx="1.6" ry="0.8" fill="#2B1204" opacity="0.7" />
      </g>

      {/* hoyo del golpe */}
      <ellipse cx="29.4" cy="23.4" rx="4.8" ry="1.6" fill="#5B2A0B" />
      <path d="M24.6 23.2 C25.4 21.8 26.6 21.6 27.4 22.2 M31.4 22.2 C32.4 21.4 33.6 21.8 34.2 23" stroke="#EDC17C" strokeWidth="0.9" strokeLinecap="round" />

      {/* gemas enterradas */}
      <g className="art-h-pop" style={{ '--pop': '1.25' }}><Gem url={url} x={12.4} y={34.2} k={1.35} mat="pink" glow="gPink" /></g>
      <g className="art-i-glow" style={{ '--lo': '.55', '--dur': '2.6s' }}><Gem url={url} x={35.6} y={35.2} k={1.3} mat="emerald" glow="gEmerald" /></g>
      <Gem url={url} x={24.2} y={42.4} k={1.05} mat="cyan" glow="gCyan" />

      {/* pico (hover: golpea) */}
      <g className="art-h-wiggle" style={{ transformBox: 'view-box', transformOrigin: '37.4px 3.6px' }}>
        <path d="M37.6 3.4 L25 16.6" stroke="#3B1906" strokeOpacity="0.3" strokeWidth="2.6" strokeLinecap="round" transform="translate(0.6 0.8)" />
        <path d="M37.6 3.4 L25 16.6" stroke={url('wood')} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M36.6 3.8 L26.4 14.6" stroke="#FDE68A" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M36.4 5.6 L35 4.2 M35 7 L33.6 5.6" stroke="#3B1906" strokeOpacity="0.6" strokeWidth="0.7" />
        <path d="M18.6 11.8 Q21.2 20.6 30.2 22.4 Q24 18 18.6 11.8 Z" fill={url('metal')} />
        <path d="M19.4 13.4 Q21.8 18.8 27 21" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.5" strokeLinecap="round" />
        <rect x="22.6" y="14.6" width="3.6" height="3.6" rx="0.8" transform="rotate(44 24.4 16.4)" fill="#475569" />
      </g>

      {/* chispas del golpe */}
      <path d="M32.4 20 L34.2 18.2 M33.4 22.4 L35.8 22 M31.6 18.6 L32 16.6" stroke="#FFFBEB" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="35.6" cy="19.4" r="0.6" fill="#A0601F" />
      <circle cx="23.6" cy="20.6" r="0.5" fill="#A0601F" />
      <Sparkle x={31.4} y={22} r={2} fill="#FFFBEB" idle delay={0.3} dur={2.4} />
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={9.6} y={9} r={2.8} fill="#fff" /></g>
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Comprensión escrita — libro abierto con la respuesta subrayada, bocadillo
   de pregunta y sello verde de acierto.
   Reposo: el sello late y titila un destello.
   Hover: la pregunta se agita, el sello crece y salta una chispa.
   -------------------------------------------------------------------------- */
const Comprension = () => {
  const [id, url] = useArtIds();
  const lines = (x0, x1, dir) => [0, 3, 6, 9, 12].map((dy) => {
    const y = 23.6 + dy;
    const c = dir > 0 ? -0.9 : -0.9;
    return `M${x0} ${y} C${x0 + (x1 - x0) * 0.35} ${y + c} ${x0 + (x1 - x0) * 0.7} ${y + c * 0.6} ${x1} ${y + 0.6}`;
  }).join(' ');
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#C6F6FF', base: '#06B6D4', dark: '#0E7490', deep: '#083344' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#083344" opacity={0.5} />
          <MaterialGradient id={id('cover')} light="#818CF8" base="#4F46E5" dark="#312E81" />
          <MaterialGradient id={id('pageL')} light="#FFFFFF" base="#FBFDFF" dark="#E2ECF5" x1={0} y1={0} x2={1} y2={0.6} />
          <MaterialGradient id={id('pageR')} light="#F1F6FB" base="#FBFDFF" dark="#FFFFFF" x1={0} y1={0} x2={1} y2={0.6} />
          <linearGradient id={id('spine')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#155E75" stopOpacity="0" />
            <stop offset="50%" stopColor="#155E75" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#155E75" stopOpacity="0" />
          </linearGradient>
          <MaterialGradient id={id('bubble')} light="#FFFFFF" base="#F5F7FF" dark="#C7D2FE" />
          <SphereGradient id={id('ok')} light="#BBF7D0" base="#22C55E" dark="#15803D" />
        </>
      )}
    >
      <ellipse cx="24" cy="42" rx="19" ry="1.8" fill={url('shadow')} />
      {/* libro: tapa, cantos y páginas */}
      <path d="M24 23.6 C19.6 21.2 11.6 20.6 4.6 22.4 V40.4 C11.6 38.8 19.6 39.4 24 41.8 C28.4 39.4 36.4 38.8 43.4 40.4 V22.4 C36.4 20.6 28.4 21.2 24 23.6 Z" fill={url('cover')} />
      <path d="M24 22.6 C19.8 20.2 12.4 19.6 6 21.2 V38.8 C12.4 37.4 19.8 38 24 40.4 C28.2 38 35.6 37.4 42 38.8 V21.2 C35.6 19.6 28.2 20.2 24 22.6 Z" fill="#CBD5E1" />
      <path d="M24 21.6 C19.8 19.2 12.6 18.6 6.6 20.2 V37.8 C12.6 36.4 19.8 37 24 39.4 Z" fill={url('pageL')} />
      <path d="M24 21.6 C28.2 19.2 35.4 18.6 41.4 20.2 V37.8 C35.4 36.4 28.2 37 24 39.4 Z" fill={url('pageR')} />
      <path d="M20.6 20.4 C22 20.6 23.2 21 24 21.6 C24.8 21 26 20.6 27.4 20.4 V38.2 C26 38.4 24.8 38.8 24 39.4 C23.2 38.8 22 38.4 20.6 38.2 Z" fill={url('spine')} />
      <path d={lines(9.4, 21.4, 1)} stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
      <path d={lines(26.6, 38.6, -1)} stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M26.6 29.6 C30.8 28.7 35 29 38.6 30.2" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M26.6 29.6 C30.8 28.7 35 29 38.6 30.2" stroke="#78350F" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />

      {/* bocadillo de pregunta (hover: se agita) */}
      <g className="art-h-wiggle art-o-bottom">
        <path d="M10.6 4.6 H17.4 C19.6 4.6 21 6 21 8.2 V11.4 C21 13.6 19.6 15 17.4 15 H15.2 L12.4 18 L12.6 15 H10.6 C8.4 15 7 13.6 7 11.4 V8.2 C7 6 8.4 4.6 10.6 4.6 Z" fill="#083344" opacity="0.25" transform="translate(0.6 0.9)" />
        <path d="M10.6 4.6 H17.4 C19.6 4.6 21 6 21 8.2 V11.4 C21 13.6 19.6 15 17.4 15 H15.2 L12.4 18 L12.6 15 H10.6 C8.4 15 7 13.6 7 11.4 V8.2 C7 6 8.4 4.6 10.6 4.6 Z" fill={url('bubble')} />
        <rect x="8.6" y="5.4" width="10.8" height="2.4" rx="1.2" fill="#fff" opacity="0.85" />
        <text {...T} x="14" y="13.2" fontSize="8" fill="#4F46E5">?</text>
      </g>

      {/* sello de acierto (reposo: late · hover: crece) */}
      <g className="art-i-pulse" style={{ '--amp': '1.07', '--dur': '2.6s' }}>
        <g className="art-h-pop" style={{ '--pop': '1.2' }}>
          <circle cx="35.4" cy="10.6" r="5.6" fill="#083344" opacity="0.25" transform="translate(0.5 0.8)" />
          <circle cx="35.4" cy="10.6" r="5.6" fill={url('ok')} />
          <circle cx="35.4" cy="10.6" r="5.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.7" />
          <ellipse cx="33.6" cy="8.2" rx="1.8" ry="1" fill="#fff" opacity="0.55" />
          <path d="M32.8 10.8 L34.6 12.6 L38 9" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      <Sparkle x={26.2} y={7.4} r={1.8} fill="#ECFEFF" idle delay={1.1} />
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={43.2} y={18} r={2.4} fill="#FEF9C3" /></g>
    </Tile>
  );
};

/* --------------------------------------------------------------------------
   Porcentajes y proporciones — gráfico circular 3D con la porción del 25 %
   separada y sello de "%".
   Reposo: el sello flota y titila un destello.
   Hover: la porción se separa más y el sello crece.
   -------------------------------------------------------------------------- */
const Porcentajes = () => {
  const [id, url] = useArtIds();
  const c = { x: 21, y: 22.4 };
  const rx = 14;
  const ry = 10.2;
  const d = 3.4;
  const o = { x: c.x + 2.4, y: c.y - 2.2 };
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#FFE8A6', base: '#FB923C', dark: '#DB2777', deep: '#500724' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#500724" opacity={0.5} />
          <MaterialGradient id={id('a')} light="#A5B4FC" base="#6366F1" dark="#3730A3" />
          <linearGradient id={id('aWall')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <MaterialGradient id={id('b')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
          <MaterialGradient id={id('c')} light="#FFFFFF" base="#FEF3C7" dark="#FBBF24" />
          <SphereGradient id={id('badge')} light="#FFFFFF" base="#FFF1F7" dark="#F9A8D4" />
        </>
      )}
    >
      <ellipse cx="22" cy="37.4" rx="16" ry="2.2" fill={url('shadow')} />
      {/* pastel: pared frontal + porciones */}
      <path d={`M${c.x + rx} ${c.y} A${rx} ${ry} 0 0 1 ${c.x - rx} ${c.y} V${c.y + d} A${rx} ${ry} 0 0 0 ${c.x + rx} ${c.y + d} Z`} fill={url('aWall')} />
      <path d={`M${c.x} ${c.y} L${c.x + rx} ${c.y} A${rx} ${ry} 0 0 1 ${c.x - rx} ${c.y} Z`} fill={url('a')} />
      <path d={`M${c.x} ${c.y} L${c.x - rx} ${c.y} A${rx} ${ry} 0 0 1 ${c.x} ${c.y - ry} Z`} fill={url('b')} />
      <path d={`M${c.x - rx + 1.6} ${c.y - 2.6} C${c.x - rx + 3.4} ${c.y - 6.6} ${c.x - 6} ${c.y - ry + 0.8} ${c.x - 1.4} ${c.y - ry + 0.4}`} stroke="#fff" strokeOpacity="0.75" strokeWidth="0.9" strokeLinecap="round" />
      <path d={`M${c.x - 7} ${c.y + ry - 1.4} C${c.x - 1} ${c.y + ry + 0.2} ${c.x + 6} ${c.y + ry - 0.4} ${c.x + 10.6} ${c.y + ry - 3.6}`} stroke="#C7D2FE" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />

      {/* porción separada (hover: se aleja) */}
      <g className="art-h-slide" style={{ '--slide': '1.8px' }}>
        <g className="art-h-lift" style={{ '--lift': '-1.8px' }}>
          <path d={`M${o.x} ${o.y} L${o.x + rx} ${o.y} V${o.y + d} L${o.x} ${o.y + d} Z`} fill="#D97706" />
          <path d={`M${o.x} ${o.y} L${o.x} ${o.y - ry} A${rx} ${ry} 0 0 1 ${o.x + rx} ${o.y} Z`} fill={url('c')} />
          <path d={`M${o.x + 2} ${o.y - ry + 0.6} C${o.x + 6} ${o.y - ry + 0.4} ${o.x + 10} ${o.y - ry + 2.4} ${o.x + 12} ${o.y - 4}`} stroke="#fff" strokeWidth="0.9" strokeLinecap="round" />
          <text {...T} x={o.x + 5.6} y={o.y - 2.6} fontSize="5.2" fill="#B45309">25</text>
        </g>
      </g>

      {/* sello de % (reposo: flota · hover: crece) */}
      <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.6s' }}>
        <g className="art-h-pop" style={{ '--pop': '1.18' }}>
          <circle cx="37.6" cy="36.6" r="6.6" fill="#500724" opacity="0.28" transform="translate(0.6 1)" />
          <circle cx="37.6" cy="36.6" r="6.6" fill={url('badge')} />
          <text {...T} x="37.6" y="39.6" fontSize="8.4" fill="#DB2777">%</text>
          <ellipse cx="35.2" cy="32.8" rx="2" ry="1" fill="#fff" opacity="0.9" />
        </g>
      </g>

      <Sparkle x={41.6} y={7.6} r={2.3} fill="#FFF7ED" idle delay={0.4} />
    </Tile>
  );
};

// Tecla 3D con número (Regla de tres).
const Key = ({ url, x, y, mat, edge, label }) => (
  <>
    <rect x={x} y={y + 1.7} width="13" height="11.4" rx="3" fill={edge} />
    <rect x={x} y={y} width="13" height="11.4" rx="3" fill={url(mat)} />
    <rect x={x + 1.2} y={y + 0.7} width="10.6" height="3" rx="1.5" fill="#fff" opacity="0.4" />
    {label && <text {...T} x={x + 6.5} y={y + 8.7} fontSize="8.4" fill="#fff">{label}</text>}
  </>
);

/* --------------------------------------------------------------------------
   Regla de tres — teclas 3 → 9 y 5 → ? con el aspa de la multiplicación
   cruzada en el centro.
   Reposo: la tecla incógnita brilla y titila un destello.
   Hover: el aspa gira y la incógnita se resuelve (? → 15).
   -------------------------------------------------------------------------- */
const ReglaDeTres = () => {
  const [id, url] = useArtIds();
  return (
    <Tile
      id={id}
      url={url}
      colors={{ light: '#D6E9FF', base: '#818CF8', dark: '#4338CA', deep: '#1E1B4B' }}
      defs={(
        <>
          <ShadowGradient id={id('shadow')} color="#1E1B4B" opacity={0.5} />
          <MaterialGradient id={id('indigo')} light="#A5B4FC" base="#6366F1" dark="#3730A3" />
          <MaterialGradient id={id('pink')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
          <MaterialGradient id={id('blank')} light="#FFFFFF" base="#F8FAFF" dark="#DDE3FF" />
          <SphereGradient id={id('x')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        </>
      )}
    >
      <ellipse cx="24" cy="41.6" rx="19" ry="1.7" fill={url('shadow')} />

      {/* aspa de la multiplicación cruzada */}
      <path d="M17.6 20.4 L30.4 27.6 M30.4 20.4 L17.6 27.6" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" strokeDasharray="1.2 1.1" strokeLinecap="round" />

      <Key url={url} x={5.4} y={7.6} mat="indigo" edge="#312E81" label="3" />
      <Key url={url} x={29.6} y={7.6} mat="indigo" edge="#312E81" label="9" />
      <Key url={url} x={5.4} y={27} mat="pink" edge="#9D174D" label="5" />
      <Key url={url} x={29.6} y={27} mat="blank" edge="#A5B4FC" />

      {/* incógnita (reposo: brilla · hover: se resuelve) */}
      <g className="art-i-glow" style={{ '--lo': '.45', '--dur': '2.4s' }}>
        <rect x="30.4" y="27.8" width="11.4" height="9.8" rx="2.4" stroke="#F59E0B" strokeWidth="1" strokeDasharray="1.6 1.1" />
      </g>
      <g className="art-h-hide">
        <text {...T} x="36.1" y="35.8" fontSize="8.6" fill="#7C3AED">?</text>
      </g>
      <g className="art-h-show">
        <text {...T} x="36.1" y="35.6" fontSize="7.4" fill="#15803D">15</text>
      </g>

      {/* flechas de correspondencia */}
      <path d="M20.2 13.3 H27.2 M25.2 11.4 L27.4 13.3 L25.2 15.2 M20.2 32.7 H27.2 M25.2 30.8 L27.4 32.7 L25.2 34.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />

      {/* botón × (hover: gira) */}
      <g className="art-h-spin" style={{ '--spin': '90deg' }}>
        <circle cx="24" cy="24" r="3.4" fill="#1E1B4B" opacity="0.3" transform="translate(0.4 0.6)" />
        <circle cx="24" cy="24" r="3.4" fill={url('x')} />
        <path d="M22.7 22.7 L25.3 25.3 M25.3 22.7 L22.7 25.3" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
      </g>

      <Sparkle x={43.4} y={22.4} r={1.9} fill="#EEF2FF" idle delay={0.9} />
    </Tile>
  );
};

const ICONS = {
  ahorcado: Ahorcado,
  anagramas: Anagramas,
  'rosco-del-saber': Rosco,
  crucigrama: Crucigrama,
  'sopa-de-letras': SopaDeLetras,
  millonario: Millonario,
  'busca-el-intruso': BuscaIntruso,
  'nave-palabras': NavePalabras,
  runner: Runner,
  snake: Snake,
  'lluvia-de-palabras': LluviaPalabras,
  parejas: Parejas,
  clasificador: Clasificador,
  'ordena-la-frase': OrdenaFrase,
  'ordena-la-historia': OrdenaHistoria,
  'detective-de-palabras': Detective,
  'juego-memoria': Memoria,
  'excavacion-selectiva': Excavacion,
  'comprension-escrita': Comprension,
  'porcentajes-proporciones': Porcentajes,
  'regla-de-tres': ReglaDeTres,
};

export default ICONS;
