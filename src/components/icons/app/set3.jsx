// Ilustraciones de las baldosas de app — set 3 (rediseño 2026).
// Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: laboratorio-funciones-2d, visualizador-3d, terminal-retro, programacion-bloques, banco-recursos-tutoria, isla-de-la-calma, generador-personajes-historicos, celula-vegetal, celula-animal, conecta-parejas, criptograma, dictado-interactivo, torre-palabras, velocidad-respuesta, batalla, misiones-roboticas, laboratorio-robotica, infografias-interactivas, la-fortaleza, laboratorio-fisica, cazapalabras-3d
//
// Cada icono es una baldosa 48×48 (fondo propio rx=12). Reposo: ≤ 2 piezas
// animadas (solo nivel de efectos alto). Hover: 1-3 piezas.
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

const FONT = 'Fredoka, system-ui, sans-serif';
const r2 = (n) => Math.round(n * 100) / 100;

/* ---------- geometría precalculada (una vez por módulo) ---------- */

// Flecha recta: trazo + punta triangular.
const arrow = (x1, y1, x2, y2, head = 2, half = 1.4) => {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  return {
    line: `M${r2(x1)} ${r2(y1)}L${r2(bx)} ${r2(by)}`,
    head: `M${r2(x2)} ${r2(y2)}L${r2(bx - uy * half)} ${r2(by + ux * half)}L${r2(bx + uy * half)} ${r2(by - ux * half)}Z`,
  };
};

// Arco con punta de flecha al final (sentido horario de a0 a a1, en grados).
const arcArrow = (cx, cy, r, a0, a1) => {
  const rad = (a) => (a * Math.PI) / 180;
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  const t = rad(a1);
  const [tx, ty, nx, ny] = [-Math.sin(t), Math.cos(t), Math.cos(t), Math.sin(t)];
  return {
    arc: `M${r2(x0)} ${r2(y0)}A${r} ${r} 0 0 1 ${r2(x1)} ${r2(y1)}`,
    head: `M${r2(x1 + tx * 2.6)} ${r2(y1 + ty * 2.6)}L${r2(x1 + nx * 1.8)} ${r2(y1 + ny * 1.8)}L${r2(x1 - nx * 1.8)} ${r2(y1 - ny * 1.8)}Z`,
  };
};

// Estrella de n puntas.
const starPath = (cx, cy, R, r, n = 5, rot = -90) => {
  let d = '';
  for (let i = 0; i < n * 2; i += 1) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const rr = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${r2(cx + rr * Math.cos(a))} ${r2(cy + rr * Math.sin(a))}`;
  }
  return `${d}Z`;
};

// Almenas: n dientes de alto h a lo largo de [x, x+w] sobre la cota y.
const merlons = (x, y, w, n, h) => {
  const step = w / (2 * n - 1);
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i += 1) {
    const x0 = x + i * 2 * step;
    d += `V${r2(y - h)}H${r2(x0 + step)}V${y}`;
    if (i < n - 1) d += `H${r2(x0 + 2 * step)}`;
  }
  return `${d}Z`;
};

// Pieza de puzle tipo Scratch (muesca arriba, saliente abajo).
const blk = (x, y, w, h) => `M${x + 1.4} ${y}H${x + 3}l1 1.2h3l1 -1.2H${r2(x + w - 1.4)}q1.4 0 1.4 1.4V${r2(y + h - 1.4)}q0 1.4 -1.4 1.4H${x + 8}l-1 1.2h-3l-1 -1.2H${x + 1.4}q-1.4 0 -1.4 -1.4V${y + 1.4}q0 -1.4 1.4 -1.4Z`;
// Bloque en C (bucle) que abraza a otro: barra superior t, lomo s, hueco ih, barra inferior b (ancho bw).
const cblk = (x, y, w, t, s, ih, bw, b) => `M${x + 1.4} ${y}H${x + 3}l1 1.2h3l1 -1.2H${r2(x + w - 1.4)}q1.4 0 1.4 1.4V${r2(y + t - 1.4)}q0 1.4 -1.4 1.4H${x + s + 8}l-1 1.2h-3l-1 -1.2H${x + s}V${r2(y + t + ih)}H${r2(x + bw - 1.4)}q1.4 0 1.4 1.4V${r2(y + t + ih + b - 1.4)}q0 1.4 -1.4 1.4H${x + 8}l-1 1.2h-3l-1 -1.2H${x + 1.4}q-1.4 0 -1.4 -1.4V${y + 1.4}q0 -1.4 1.4 -1.4Z`;

/* ---------- baldosa común ---------- */

// Fondo: degradado luminoso + luz cenital arriba-izquierda + viñeta inferior
// + franja de brillo en el tercio superior. c = [claro, base, oscuro].
const TileBg = ({ c, vig = c[2], gloss = 0.32 }) => {
  const [id, url] = useArtIds();
  return (
    <>
      <defs>
        <linearGradient id={id('bg')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={c[0]} />
          <stop offset="52%" stopColor={c[1]} />
          <stop offset="100%" stopColor={c[2]} />
        </linearGradient>
        <radialGradient id={id('hi')} cx="0.26" cy="0.14" r="0.72">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('vig')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor={vig} stopOpacity="0" />
          <stop offset="100%" stopColor={vig} stopOpacity="0.42" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={gloss} />
      </defs>
      <rect width="48" height="48" rx="12" fill={url('bg')} />
      <rect width="48" height="48" rx="12" fill={url('hi')} />
      <rect width="48" height="48" rx="12" fill={url('vig')} />
      <path d="M0 12A12 12 0 0 1 12 0H36A12 12 0 0 1 48 12V15.5C33 19.5 15 19.5 0 15.5Z" fill={url('gloss')} />
    </>
  );
};

// Borde interior de luz + canto inferior en sombra (va encima de todo).
const TileRim = ({ shade = '#000' }) => (
  <>
    <rect x="0.4" y="0.4" width="47.2" height="47.2" rx="11.6" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
    <path d="M4.6 41.6C6.6 45 9.2 46.5 12.6 46.5H35.4C38.8 46.5 41.4 45 43.4 41.6" stroke={shade} strokeOpacity="0.16" strokeWidth="0.8" strokeLinecap="round" />
  </>
);

/* ---------- mascota en miniatura ---------- */

// Robot de la plataforma (ver RobotMascot.jsx): cabeza-monitor índigo, visor
// oscuro, ojos blancos con el DERECHO mayor, iris cian-índigo, antena con orbe
// rosa y, con `body`, torso con núcleo IA cian y propulsor.
// Coordenadas locales: centro de la cabeza en (0,0); cabeza de 16 × 12,8.
// Reposo: parpadeo (`blink`) y halo del orbe (`orb`): cuentan para el presupuesto.
const MiniBot = ({ x, y, s = 1, body = false, blink = true, orb = true }) => {
  const [id, url] = useArtIds();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <MaterialGradient id={id('head')} light="#C7D2FE" base="#6366F1" dark="#312E81" />
        <MaterialGradient id={id('limb')} light="#C4B5FD" base="#5B4FF0" dark="#312E81" />
        <linearGradient id={id('visor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="55%" stopColor="#0B0A24" />
          <stop offset="100%" stopColor="#1A1450" />
        </linearGradient>
        <radialGradient id={id('iris')} cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
        <radialGradient id={id('orb')} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FDF4FF" />
          <stop offset="40%" stopColor="#F0ABFC" />
          <stop offset="100%" stopColor="#A21CAF" />
        </radialGradient>
        <GlowGradient id={id('orbGlow')} color="#F0ABFC" opacity={0.85} />
        <GlowGradient id={id('core')} color="#67E8F9" opacity={0.95} />
      </defs>
      {body && (
        <g>
          {/* propulsor con llama */}
          <path d="M-1.8 17.4Q0 22.6 1.8 17.4Z" fill="#A5F3FC" opacity="0.9" />
          <path d="M-3.4 16.2Q0 19.8 3.4 16.2Z" fill={url('limb')} />
          {/* brazos */}
          <rect x="-8.9" y="8.2" width="2.7" height="6.6" rx="1.35" fill={url('limb')} />
          <rect x="6.2" y="8.2" width="2.7" height="6.6" rx="1.35" fill={url('limb')} />
          {/* torso con brillo y núcleo IA */}
          <rect x="-6.2" y="6.9" width="12.4" height="10" rx="4.2" fill={url('limb')} />
          <path d="M-4.2 8.5Q0 7.3 4.2 8.5" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="0" cy="12" r="3.4" fill={url('core')} />
          <circle cx="0" cy="12" r="1.6" fill="#0E7490" stroke="#A5F3FC" strokeWidth="0.5" />
          <circle cx="0" cy="12" r="0.6" fill="#ECFEFF" />
          {/* cuello */}
          <rect x="-2.2" y="5.6" width="4.4" height="2" rx="0.6" fill="#A5A3C9" />
        </g>
      )}
      {/* antena con orbe rosa */}
      <path d="M0 -6V-9.2L-1.5 -11" stroke="#4338CA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      {orb && <circle className="art-i-glow" style={{ '--lo': '0.3' }} cx="-1.6" cy="-12" r="3.8" fill={url('orbGlow')} />}
      <circle cx="-1.6" cy="-12" r="1.8" fill={url('orb')} />
      <circle cx="-2.15" cy="-12.6" r="0.55" fill="#fff" opacity="0.85" />
      {/* orejeras */}
      <rect x="-9.6" y="-3.3" width="2.6" height="6.4" rx="1.3" fill={url('limb')} />
      <rect x="7" y="-3.3" width="2.6" height="6.4" rx="1.3" fill={url('limb')} />
      {/* carcasa */}
      <rect x="-8" y="-6.4" width="16" height="12.8" rx="5" fill={url('head')} />
      <rect x="-7.7" y="-6.1" width="15.4" height="12.2" rx="4.7" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5" />
      <path d="M-5.2 -5.1Q-1.6 -6.3 2.6 -5.9" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
      {/* visor */}
      <rect x="-6.4" y="-4.4" width="12.8" height="7.6" rx="3.6" fill={url('visor')} stroke="#67E8F9" strokeOpacity="0.45" strokeWidth="0.45" />
      {/* ojos (el derecho, mayor) */}
      <g className={blink ? 'art-i-blink' : undefined}>
        <circle cx="-2.6" cy="-0.5" r="1.8" fill="#fff" />
        <circle cx="2.4" cy="-0.7" r="2.35" fill="#fff" />
        <circle cx="-2.35" cy="-0.35" r="1.05" fill={url('iris')} />
        <circle cx="2.7" cy="-0.5" r="1.35" fill={url('iris')} />
        <circle cx="-2.75" cy="-0.85" r="0.42" fill="#fff" />
        <circle cx="2.2" cy="-1.15" r="0.52" fill="#fff" />
      </g>
      {/* sonrisa y mejillas */}
      <path d="M-1.7 4.3Q0 5.5 1.7 4.3" stroke="#67E8F9" strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="-5.3" cy="4.1" rx="1.3" ry="0.7" fill="#F472B6" opacity="0.6" />
      <ellipse cx="5.3" cy="4.1" rx="1.3" ry="0.7" fill="#F472B6" opacity="0.6" />
    </g>
  );
};

/* ======================================================================
   1. Laboratorio de funciones 2D — papel milimetrado con una senoide que
   desborda la tarjeta. Hover: el punto salta sobre la cresta, f(x) crece y
   estalla un destello. Reposo: halo del punto + un destello.
   ====================================================================== */
const SINE = Array.from({ length: 41 }, (_, i) => {
  const x = 5.5 + i * (37 / 40);
  const y = 23.5 + 9 * Math.sin(((x - 24) * 2 * Math.PI) / 26);
  return `${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`;
}).join('');
const GRID_2D = [11.5, 15.5, 19.5, 28.5, 32.5, 36.5].map((x) => `M${x} 11V36`).join('')
  + [11.5, 15.5, 19.5, 27.5, 31.5, 35.5].map((y) => `M10 ${y}H38`).join('');

const Funciones2D = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#172554" opacity={0.55} />
        <MaterialGradient id={id('card')} light="#FFFFFF" base="#EEF2FF" dark="#C7D2FE" />
        <linearGradient id={id('curve')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="55%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <GlowGradient id={id('halo')} color="#F472B6" opacity={0.9} />
      </defs>
      <TileBg c={['#BFDBFE', '#3B82F6', '#1E3A8A']} />
      <ellipse cx="24" cy="41.4" rx="17" ry="2.6" fill={url('shadow')} />

      {/* tarjeta de papel milimetrado con canto */}
      <rect x="7.5" y="10.2" width="33" height="29" rx="5" fill="#1E40AF" />
      <rect x="7.5" y="8.6" width="33" height="29" rx="5" fill={url('card')} />
      <rect x="8" y="9.1" width="32" height="28" rx="4.5" stroke="#fff" strokeWidth="0.6" />
      <path d={GRID_2D} stroke="#93C5FD" strokeOpacity="0.6" strokeWidth="0.35" />

      {/* ejes */}
      <path d="M10 23.5H37.6M24 35.6V11" stroke="#1E3A8A" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M36.2 22.2L38.4 23.5L36.2 24.8M22.7 12.2L24 10L25.3 12.2" stroke="#1E3A8A" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 15.4V23.5M18.4 14.5H24" stroke="#6366F1" strokeWidth="0.55" strokeDasharray="0.9 0.9" />

      {/* curva: halo, cuerpo con degradado y brillo de tubo */}
      <path d={SINE} stroke="#F9A8D4" strokeOpacity="0.45" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d={SINE} stroke={url('curve')} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={SINE} transform="translate(-0.3 -0.55)" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />

      <g className="art-h-pop" style={{ '--pop': '1.2' }}>
        <text x="32" y="16.2" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="5.4" fill="#4338CA">f(x)</text>
      </g>

      {/* punto sobre la cresta */}
      <g className="art-h-jump" style={{ '--jump': '-3.5px' }}>
        <circle className="art-i-pulse" cx="17.5" cy="14.5" r="4.6" fill={url('halo')} />
        <circle cx="17.5" cy="14.5" r="2.2" fill="#fff" stroke="#EC4899" strokeWidth="1.1" />
        <circle cx="17.5" cy="14.5" r="0.8" fill="#BE185D" />
      </g>

      <Sparkle x={41.6} y={6.8} r={2.2} idle />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={10.6} y={6.4} r={2.4} fill="#FDE68A" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   2. Visualizador 3D — cubo de cristal con aristas ocultas discontinuas y
   flechas de rotación. Hover: las flechas giran, el cubo se eleva y estalla
   un destello. Reposo: el cubo flota + un destello.
   ====================================================================== */
const ROT_A = arcArrow(24.5, 23, 19.5, 148, 212);
const ROT_B = arcArrow(24.5, 23, 19.5, 328, 392);
const CUBE_V = [[27, 9.5], [38.5, 15.5], [10.5, 15], [10.5, 30], [22, 36], [38.5, 30.5]];

const Visualizador3D = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#1E1B4B" opacity={0.55} />
        <GlowGradient id={id('core')} color="#67E8F9" opacity={0.55} />
        <linearGradient id={id('top')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={id('left')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CFFAFE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={id('right')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0891B2" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.8" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.85} />
      </defs>
      <TileBg c={['#C7D2FE', '#6366F1', '#312E81']} />
      <ellipse cx="24.5" cy="40.8" rx="14" ry="2.4" fill={url('shadow')} />

      {/* flechas de rotación */}
      <g className="art-h-spin" style={{ '--spin': '180deg' }}>
        <path d={`${ROT_A.arc}${ROT_B.arc}`} stroke="#fff" strokeOpacity="0.8" strokeWidth="1.3" strokeLinecap="round" />
        <path d={`${ROT_A.head}${ROT_B.head}`} fill="#fff" fillOpacity="0.9" />
      </g>

      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.2px' }}>
          <circle cx="24.5" cy="23" r="12" fill={url('core')} />
          {/* aristas ocultas (se ven a través del cristal) */}
          <path d="M27 24.5L10.5 30M27 24.5L38.5 30.5M27 24.5V9.5" stroke="#E0F2FE" strokeOpacity="0.75" strokeWidth="0.6" strokeDasharray="1.1 0.9" />
          {/* caras */}
          <path d="M10.5 15L22 21V36L10.5 30Z" fill={url('left')} />
          <path d="M22 21L38.5 15.5V30.5L22 36Z" fill={url('right')} />
          <path d="M27 9.5L38.5 15.5L22 21L10.5 15Z" fill={url('top')} />
          <path d="M26.6 11.2L33.4 14.8L23.6 18L17 14.6Z" fill={url('gloss')} opacity="0.55" />
          {/* aristas vivas y brillo especular */}
          <path d="M27 9.5L38.5 15.5V30.5L22 36L10.5 30V15ZM10.5 15L22 21L38.5 15.5M22 21V36" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.7" strokeLinejoin="round" />
          <path d="M12.4 18.6V27.4" stroke="#fff" strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
          {CUBE_V.map(([vx, vy]) => (
            <circle key={`${vx}-${vy}`} cx={vx} cy={vy} r="1" fill="#fff" stroke="#6366F1" strokeWidth="0.45" />
          ))}
          <circle cx="22" cy="21" r="1.5" fill="#F472B6" stroke="#fff" strokeWidth="0.6" />
        </g>
      </g>

      <Sparkle x={40.5} y={7} r={2.2} idle delay={0.6} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={8} y={7.6} r={2.4} fill="#A5F3FC" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   3. Terminal retro — ordenador CRT de plástico crema con pantalla de
   fósforo verde. Hover: se teclea una palabra (el cursor avanza) y un
   destello. Reposo: el cursor parpadea.
   ====================================================================== */
const SCAN = Array.from({ length: 11 }, (_, i) => `M12.4 ${r2(12 + i * 1.45)}H35.6`).join('');

const TerminalRetro = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#022C22" opacity={0.6} />
        <MaterialGradient id={id('case')} light="#FFFDF5" base="#EDE5CF" dark="#B3A585" />
        <MaterialGradient id={id('foot')} light="#E9E1CA" base="#CFC3A3" dark="#8F8165" />
        <linearGradient id={id('bezel')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B604C" />
          <stop offset="100%" stopColor="#D8CDB2" />
        </linearGradient>
        <radialGradient id={id('screen')} cx="0.45" cy="0.42" r="0.7">
          <stop offset="0%" stopColor="#0B6B45" />
          <stop offset="60%" stopColor="#053A26" />
          <stop offset="100%" stopColor="#021A10" />
        </radialGradient>
        <GlowGradient id={id('phos')} color="#34D399" opacity={0.45} />
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5C4F33" stopOpacity="0" />
          <stop offset="100%" stopColor="#5C4F33" stopOpacity="0.38" />
        </linearGradient>
      </defs>
      <TileBg c={['#A7F3D0', '#10B981', '#064E3B']} />
      <ellipse cx="24" cy="41.6" rx="16" ry="2.4" fill={url('shadow')} />

      {/* peana */}
      <path d="M16.5 35H31.5L33.8 39.4Q34.2 40.6 32.9 40.6H15.1Q13.8 40.6 14.2 39.4Z" fill={url('foot')} />
      <path d="M16.5 35H31.5L32.1 36.2H15.9Z" fill="#5C4F33" opacity="0.35" />

      {/* carcasa con sombra propia y borde de luz */}
      <rect x="8" y="6" width="32" height="30" rx="5.5" fill={url('case')} />
      <path d="M34.5 6.2C38 6.6 40 8.6 40 11.5V30.5C40 33.6 37.6 36 34.5 36H31C34 35 35.6 33 35.6 30V11.6C35.6 9 35.4 7.4 34.5 6.2Z" fill={url('side')} />
      <path d="M9.4 12V30" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" />
      <path d="M12.4 7.2Q20 6.4 30 6.8" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />

      {/* marco hundido y pantalla de fósforo */}
      <rect x="11.2" y="9.4" width="25.6" height="19.4" rx="3.8" fill={url('bezel')} />
      <rect x="12.4" y="10.6" width="23.2" height="17" rx="3" fill={url('screen')} />
      <ellipse cx="22.5" cy="19" rx="11" ry="7.5" fill={url('phos')} />
      <path d="M15 13.6L17.2 15L15 16.4M15 20.9L17.2 22.3L15 23.7" stroke="#6EE7B7" strokeWidth="0.95" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="18.8" y="14.3" width="10" height="1.4" rx="0.7" fill="#4ADE80" />
      <rect x="15" y="17.9" width="14.5" height="1.4" rx="0.7" fill="#4ADE80" opacity="0.7" />
      <g className="art-h-show"><rect x="18.8" y="21.6" width="7.4" height="1.4" rx="0.7" fill="#4ADE80" /></g>
      <g className="art-h-slide" style={{ '--slide': '8.4px' }}>
        <rect className="art-i-glow" style={{ '--dur': '1.1s', '--lo': '0.1' }} x="18.8" y="21.1" width="2.4" height="2.4" rx="0.3" fill="#A7F3D0" />
      </g>
      <path d={SCAN} stroke="#000" strokeOpacity="0.16" strokeWidth="0.45" />
      <path d="M13.6 12.2Q19 10.8 27 11.3L26 12.9Q19 12.6 13.8 14.4Z" fill="#fff" opacity="0.16" />

      {/* frontal: rejilla, ranura de disquete y LED */}
      <path d="M13.5 31.4H19M13.5 33H19" stroke="#8F8165" strokeWidth="0.7" strokeLinecap="round" />
      <rect x="25.5" y="31.2" width="10" height="1.6" rx="0.8" fill="#6B604C" />
      <rect x="25.5" y="31.2" width="10" height="0.6" rx="0.3" fill="#3F3727" />
      <circle cx="22" cy="32.2" r="0.9" fill="#34D399" />

      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={41.4} y={7.4} r={2.4} fill="#D1FAE5" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   4. Programación por bloques — piezas de puzle (incluido un bucle en C) y
   la mascota al lado. Hover: la pieza de arriba se levanta, el robot se
   inclina hacia ella y estalla un destello. Reposo: parpadeo + orbe.
   ====================================================================== */
const PB_A = blk(4, 10.4, 19, 6);
const PB_C = cblk(4, 16.4, 20.5, 6, 4, 7.2, 16, 4.4);
const PB_G = blk(8, 22.4, 14, 7.2);

const ProgramacionBloques = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#78350F" opacity={0.5} />
        <MaterialGradient id={id('blue')} light="#BFDBFE" base="#3B82F6" dark="#1E40AF" />
        <MaterialGradient id={id('pink')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('green')} light="#BBF7D0" base="#22C55E" dark="#15803D" />
      </defs>
      <TileBg c={['#FEF3C7', '#FBBF24', '#B45309']} />
      <ellipse cx="24" cy="41.6" rx="19" ry="2.4" fill={url('shadow')} />

      {/* bucle en C con su pieza interior */}
      <path d={PB_C} transform="translate(0 1)" fill="#831843" />
      <path d={PB_C} fill={url('pink')} />
      <path d="M5.8 17.1H23" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />
      <rect x="6.5" y="18.5" width="6.5" height="1.8" rx="0.9" fill="#fff" opacity="0.85" />
      <rect x="15" y="18" width="5.4" height="2.8" rx="1.4" fill="#fff" />
      <path d="M16.7 19.4A1.1 1.1 0 1 0 17.8 18.3" stroke="#BE185D" strokeWidth="0.55" strokeLinecap="round" />
      <path d="M6.5 32.4H13" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
      <path d={PB_G} transform="translate(0 1)" fill="#14532D" />
      <path d={PB_G} fill={url('green')} />
      <path d="M9.8 23.1H21" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />
      <rect x="10.4" y="24.8" width="8.4" height="1.8" rx="0.9" fill="#fff" opacity="0.85" />

      {/* pieza superior (se arrastra al pasar el ratón) */}
      <g className="art-h-lift" style={{ '--lift': '-3.2px' }}>
        <path d={PB_A} transform="translate(0 1)" fill="#1E3A8A" />
        <path d={PB_A} fill={url('blue')} />
        <path d="M5.8 11.1H21.6" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
        <rect x="6.4" y="12.5" width="6" height="1.8" rx="0.9" fill="#fff" opacity="0.85" />
        <rect x="14" y="12" width="6.4" height="2.8" rx="1.4" fill="#fff" />
        <path d="M15.6 13.4H18.6M17.6 12.6L18.6 13.4L17.6 14.2" stroke="#1D4ED8" strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* mascota */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-7deg' }}>
        <MiniBot x={34.6} y={19.2} body />
      </g>

      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={24} y={6.4} r={2.4} /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   5. Banco de recursos de tutoría — carpeta con fichas y corazón.
   Hover: las fichas asoman, el corazón crece y estalla un destello.
   Reposo: halo del corazón (latido) + un destello.
   ====================================================================== */
const HEART = 'M24 36.4C17.2 32.2 17.4 26.4 20.6 25.6C22.4 25.1 23.5 26.2 24 27.4C24.5 26.2 25.6 25.1 27.4 25.6C30.6 26.4 30.8 32.2 24 36.4Z';

const BancoRecursos = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#500724" opacity={0.5} />
        <MaterialGradient id={id('back')} light="#FCD34D" base="#F59E0B" dark="#92400E" />
        <MaterialGradient id={id('front')} light="#FEF3C7" base="#FBBF24" dark="#D97706" />
        <MaterialGradient id={id('paper')} light="#FFFFFF" base="#F8FAFC" dark="#E2E8F0" />
        <MaterialGradient id={id('paper2')} light="#FFFFFF" base="#F0F9FF" dark="#BAE6FD" />
        <MaterialGradient id={id('heart')} light="#FECDD3" base="#F43F5E" dark="#9F1239" />
        <GlowGradient id={id('glow')} color="#FFE4E6" opacity={0.85} />
      </defs>
      <TileBg c={['#FBCFE8', '#EC4899', '#831843']} />
      <ellipse cx="24" cy="42" rx="18" ry="2.6" fill={url('shadow')} />

      {/* trasera con pestaña */}
      <path d="M6.5 15Q6.5 12.2 9.3 12.2H17.2Q18.7 12.2 19.6 13.4L20.9 15.2H38.7Q41.5 15.2 41.5 18V37.5Q41.5 40.3 38.7 40.3H9.3Q6.5 40.3 6.5 37.5Z" fill={url('back')} />

      {/* fichas */}
      <g className="art-h-lift" style={{ '--lift': '-3.5px' }}>
        <g transform="rotate(-8 19 20)">
          <rect x="11.5" y="8" width="15" height="20" rx="1.8" fill={url('paper')} />
          <rect x="13.6" y="10.6" width="7" height="1.8" rx="0.9" fill="#8B5CF6" />
          <path d="M13.6 14.6H24.4M13.6 17.2H23M13.6 19.8H24.4M13.6 22.4H20.5" stroke="#CBD5E1" strokeWidth="0.9" strokeLinecap="round" />
        </g>
        <g transform="rotate(9 31 21)">
          <rect x="23.5" y="9" width="14.5" height="19" rx="1.8" fill={url('paper2')} />
          <rect x="25.6" y="11.6" width="5.5" height="1.8" rx="0.9" fill="#10B981" />
          <path d="M25.6 15.6H35.6M25.6 18.2H34M25.6 20.8H35.6" stroke="#7DD3FC" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </g>

      {/* frontal en perspectiva */}
      <path d="M5.4 20.6H42.6Q44 20.6 43.8 22L41.9 38.4Q41.6 40.6 39.4 40.6H8.6Q6.4 40.6 6.1 38.4L4.2 22Q4 20.6 5.4 20.6Z" fill={url('front')} />
      <path d="M6 21.8H42" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M41 23.4L39.3 38Q39.1 39.3 37.8 39.5" stroke="#92400E" strokeOpacity="0.35" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.9 24.6L8.2 36.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />

      {/* corazón */}
      <circle className="art-i-pulse" style={{ '--amp': '1.15', '--dur': '2.6s' }} cx="24" cy="30.8" r="8.5" fill={url('glow')} />
      <g className="art-h-pop" style={{ '--pop': '1.2' }}>
        <path d={HEART} fill={url('heart')} stroke="#fff" strokeOpacity="0.9" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M20.5 28Q21 26.4 22.6 26.6" stroke="#fff" strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" />
      </g>

      <Sparkle x={40.6} y={8.2} r={2.2} idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={7.6} y={7.4} r={2.4} fill="#FEF3C7" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   6. Isla de la calma — amanecer sobre el mar con una palmera.
   Hover: el sol sube, aparecen gaviotas y las olas se desplazan.
   Reposo: el halo del sol "respira" (inspirar/espirar) + la palmera se mece.
   ====================================================================== */
const Isla = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={id('clip')}><rect width="48" height="48" rx="12" /></clipPath>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="34%" stopColor="#F0ABFC" />
          <stop offset="62%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="45%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#134E4A" />
        </linearGradient>
        <radialGradient id={id('sun')} cx="0.4" cy="0.38" r="0.65">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="45%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#FB923C" />
        </radialGradient>
        <GlowGradient id={id('halo')} color="#FEF3C7" opacity={0.8} />
        <MaterialGradient id={id('sand')} light="#FEF9C3" base="#FCD34D" dark="#B45309" />
        <MaterialGradient id={id('leaf')} light="#BBF7D0" base="#22C55E" dark="#14532D" />
        <linearGradient id={id('trunk')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.3} />
      </defs>
      <g clipPath={url('clip')}>
        <rect width="48" height="48" fill={url('sky')} />
        {/* sol que respira */}
        <circle className="art-i-pulse" style={{ '--amp': '1.14', '--dur': '6s' }} cx="31" cy="29" r="15" fill={url('halo')} />
        <g className="art-h-lift" style={{ '--lift': '-3px' }}>
          <circle cx="31" cy="29.5" r="7.5" fill={url('sun')} />
        </g>
        <path d="M4.6 13.6Q4.6 10.8 7.6 10.8Q8.4 8.4 11.2 8.6Q13.6 8.8 14.2 11Q16.6 11 16.8 13.6Z" fill="#fff" opacity="0.75" />
        <g className="art-h-show">
          <path d="M34.6 12q1.2 -1.2 2.4 0q1.2 -1.2 2.4 0M39.4 15.6q0.9 -0.9 1.8 0q0.9 -0.9 1.8 0" stroke="#6D28D9" strokeOpacity="0.75" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* mar con reflejo del sol */}
        <rect y="29.5" width="48" height="18.5" fill={url('sea')} />
        <path d="M0 29.6H48" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.5" />
        <path d="M25.6 31.8H36.4M27.4 34H34.6M29.2 36.2H32.8" stroke="#FEF3C7" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />
        <g className="art-h-slide" style={{ '--slide': '-2.5px' }}>
          <path d="M3 40q2.5 -1.3 5 0t5 0t5 0M27 43q2.5 -1.3 5 0t5 0t5 0" stroke="#CCFBF1" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
        </g>

        {/* isla */}
        <ellipse cx="15.5" cy="33.6" rx="13" ry="2.8" fill="#99F6E4" opacity="0.55" />
        <path d="M4.5 33.4Q8 27.6 15.5 27.4Q23 27.6 26.5 33.4Z" fill={url('sand')} />
        <path d="M7.4 30.8Q11 28.6 15.5 28.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M4.2 33.5Q15.5 35.3 26.8 33.5" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.7" strokeLinecap="round" />

        {/* palmera */}
        <g className="art-i-sway art-o-bottom" style={{ '--amp': '2.5deg', '--dur': '6s' }}>
          <path d="M15 29.5C14.6 24 16 18.4 19.6 14.6" stroke={url('trunk')} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M15 29.5C14.6 24 16 18.4 19.6 14.6" stroke="#78350F" strokeOpacity="0.55" strokeWidth="2.1" strokeDasharray="0.45 1.5" />
          <path d="M14.3 27C14.2 23 15.2 19 17.6 16.2" stroke="#FDE68A" strokeOpacity="0.6" strokeWidth="0.55" strokeLinecap="round" />
          <path d="M19.8 14.2C15.5 11.4 11 12.6 8.6 16.4C12 14.4 15.6 14.2 19.8 14.2Z" fill={url('leaf')} />
          <path d="M19.8 14.2C17.4 9.6 13.4 8 10 8.8C13.8 10.2 16.8 11.8 19.8 14.2Z" fill={url('leaf')} />
          <path d="M19.8 14.2C21.4 9.8 25.6 8 29 9C25.4 10 22.4 11.8 19.8 14.2Z" fill={url('leaf')} />
          <path d="M19.8 14.2C24.4 12 28.8 13.4 31 17.2C27.4 15.2 23.8 14.6 19.8 14.2Z" fill={url('leaf')} />
          <path d="M19.8 14.2C17.2 15.2 15.4 17.6 15 20.4C16.6 18 18 16.2 19.8 14.2Z" fill={url('leaf')} />
          <circle cx="19" cy="15.5" r="0.95" fill="#92400E" />
          <circle cx="20.6" cy="15.7" r="0.95" fill="#78350F" />
        </g>
        <path d="M0 0H48V15.5C33 19.5 15 19.5 0 15.5Z" fill={url('gloss')} />
      </g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   7. Generador de personajes históricos — camafeo dorado con busto de
   mármol laureado y un dado (azar). Hover: el medallón se balancea, el dado
   rueda y estalla un destello. Reposo: dos destellos.
   ====================================================================== */
const LAUREL = (() => {
  const P0 = [15.4, 25.4];
  const P1 = [14.4, 14.4];
  const P2 = [26.6, 13.2];
  const out = [];
  [0.06, 0.22, 0.38, 0.54, 0.7, 0.86].forEach((t, i) => {
    const mt = 1 - t;
    const x = mt * mt * P0[0] + 2 * mt * t * P1[0] + t * t * P2[0];
    const y = mt * mt * P0[1] + 2 * mt * t * P1[1] + t * t * P2[1];
    const dx = 2 * mt * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * mt * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    const a = (Math.atan2(dy, dx) * 180) / Math.PI;
    out.push({ x: r2(x), y: r2(y), a: r2(a - 40), k: `o${i}` });
    out.push({ x: r2(x), y: r2(y), a: r2(a + 40), k: `i${i}` });
  });
  return out;
})();
const BUST = 'M12.6 36C13.4 32.4 15.2 30.2 17.2 29C15.2 27.2 14.2 24 14.6 20.6C15.2 15.6 18.8 12.6 23.4 12.8C27.6 13 30 15.6 30.2 19L30.6 20.2L32.4 23.4Q32.4 24 31.6 24L30.8 24.1L31.1 25.2L30.6 25.7L30.9 26.6Q30.6 28.6 28.4 29Q26.6 29.2 25.8 30L26.4 32.2C29 32.8 31.6 34 33.4 36.4Z';

const Personajes = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#3B0764" opacity={0.55} />
        <GlowGradient id={id('aura')} color="#fff" opacity={0.32} />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <MaterialGradient id={id('leaf')} light="#FDE68A" base="#F59E0B" dark="#92400E" />
        <radialGradient id={id('field')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="60%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#2E1065" />
        </radialGradient>
        <MaterialGradient id={id('marble')} light="#FFFFFF" base="#EDE9FE" dark="#A78BFA" />
        <MaterialGradient id={id('die')} light="#FFFFFF" base="#F5F3FF" dark="#C4B5FD" />
        <clipPath id={id('cameo')}><circle cx="23" cy="22" r="12.4" /></clipPath>
      </defs>
      <TileBg c={['#E9D5FF', '#A855F7', '#581C87']} />
      <ellipse cx="24" cy="41.6" rx="15" ry="2.4" fill={url('shadow')} />
      <circle cx="23" cy="22" r="20" fill={url('aura')} />

      {/* medallón */}
      <g className="art-h-tilt" style={{ '--tilt': '-7deg' }}>
        <circle cx="23" cy="22" r="15.4" fill={url('gold')} />
        <circle cx="23" cy="22" r="14.15" stroke="#FEF3C7" strokeWidth="0.9" strokeLinecap="round" strokeDasharray="0.01 2.3" />
        <path d="M10.4 15.6A14.6 14.6 0 0 1 20 7.7" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" strokeLinecap="round" />
        <circle cx="23" cy="22" r="12.9" fill="#78350F" />
        <circle cx="23" cy="22" r="12.4" fill={url('field')} />
        <g clipPath={url('cameo')}>
          <path d={BUST} fill={url('marble')} />
          <path d="M15.2 25C16 27.4 17.4 28.6 19 29.2" stroke="#7C3AED" strokeOpacity="0.35" strokeWidth="1.1" strokeLinecap="round" />
          {/* corona de laurel */}
          <path d="M15.4 25.4Q14.4 14.4 26.6 13.2" stroke="#B45309" strokeWidth="0.6" strokeLinecap="round" />
          {LAUREL.map((l) => (
            <ellipse key={l.k} transform={`rotate(${l.a} ${l.x} ${l.y})`} cx={r2(l.x + 1.6)} cy={l.y} rx="1.9" ry="0.85" fill={url('leaf')} />
          ))}
          <path d="M15.6 25.6L13.8 28.4M16.2 25.8L15.6 29" stroke="#F59E0B" strokeWidth="0.8" strokeLinecap="round" />
        </g>
        {/* rasgos */}
        <path d="M27.5 19.7Q28.4 19.2 29.3 19.8" stroke="#6D28D9" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M21.4 19.6Q19.8 21.2 21.2 23.4" stroke="#8B5CF6" strokeOpacity="0.7" strokeWidth="0.7" strokeLinecap="round" />
        <ellipse cx="18" cy="14.6" rx="4.2" ry="1.4" transform="rotate(-30 18 14.6)" fill="#fff" opacity="0.18" />
      </g>

      {/* dado */}
      <g className="art-h-spin" style={{ '--spin': '180deg' }}>
        <g transform="translate(37 35.4) rotate(16)">
          <rect x="-5.2" y="-4.2" width="10.4" height="10.4" rx="2.4" fill="#6D28D9" />
          <rect x="-5.2" y="-5.2" width="10.4" height="10.4" rx="2.4" fill={url('die')} />
          <path d="M-3.4 -4.4H2.4" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="-2.5" cy="-2.5" r="0.95" fill="#EC4899" />
          <circle cx="0" cy="0" r="0.95" fill="#EC4899" />
          <circle cx="2.5" cy="2.5" r="0.95" fill="#EC4899" />
        </g>
      </g>

      <Sparkle x={41} y={9} r={2.4} fill="#FEF3C7" idle />
      <Sparkle x={6} y={36} r={1.8} idle delay={1.3} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={40.6} y={22} r={2.2} fill="#FDE68A" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   8. Célula vegetal — pared celular, gran vacuola, núcleo y cloroplastos.
   Hover: la célula se inclina, el núcleo crece y estalla un destello.
   Reposo: los cloroplastos brillan suavemente + un destello.
   ====================================================================== */
const CHLORO = [[12.2, 29.8, 25], [20.5, 33.6, -6], [30.5, 33.6, 6], [37, 22.5, 75], [30, 13.8, -12], [21.5, 13.6, 10]];

const CelulaVegetal = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#1A2E05" opacity={0.5} />
        <MaterialGradient id={id('wall')} light="#6EE7B7" base="#059669" dark="#064E3B" />
        <radialGradient id={id('cyto')} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="65%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#86EFAC" />
        </radialGradient>
        <radialGradient id={id('vac')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#ECFEFF" />
          <stop offset="60%" stopColor="#A5F3FC" />
          <stop offset="100%" stopColor="#22D3EE" />
        </radialGradient>
        <radialGradient id={id('nuc')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="45%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#4C1D95" />
        </radialGradient>
        <MaterialGradient id={id('chl')} light="#BBF7D0" base="#22C55E" dark="#14532D" />
        <GlossGradient id={id('gloss')} opacity={0.55} />
      </defs>
      <TileBg c={['#FEF9C3', '#A3E635', '#3F6212']} />
      <ellipse cx="24" cy="41.4" rx="17" ry="2.4" fill={url('shadow')} />

      <g className="art-h-tilt" style={{ '--tilt': '-5deg' }}>
        {/* pared y membrana */}
        <rect x="6.5" y="9" width="35" height="29.5" rx="7" fill={url('wall')} />
        <rect x="7.1" y="9.6" width="33.8" height="28.3" rx="6.4" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.6" />
        <rect x="9" y="11.5" width="30" height="24.5" rx="5" fill={url('cyto')} stroke="#10B981" strokeOpacity="0.6" strokeWidth="0.5" />
        {/* vacuola */}
        <ellipse cx="26.4" cy="24" rx="9" ry="7.4" fill={url('vac')} stroke="#06B6D4" strokeOpacity="0.55" strokeWidth="0.5" />
        <ellipse cx="23.4" cy="20.6" rx="3" ry="1.4" transform="rotate(-20 23.4 20.6)" fill="#fff" opacity="0.75" />
        {/* cloroplastos */}
        <g className="art-i-glow" style={{ '--lo': '0.7', '--dur': '4s' }}>
          {CHLORO.map(([cx, cy, a]) => (
            <g key={`${cx}-${cy}`} transform={`rotate(${a} ${cx} ${cy})`}>
              <ellipse cx={cx} cy={cy} rx="2.9" ry="1.6" fill={url('chl')} />
              <path d={`M${cx - 1.3} ${r2(cy - 0.8)}V${r2(cy + 0.8)}M${cx} ${r2(cy - 1.1)}V${r2(cy + 1.1)}M${r2(cx + 1.3)} ${r2(cy - 0.8)}V${r2(cy + 0.8)}`} stroke="#14532D" strokeOpacity="0.55" strokeWidth="0.45" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {/* núcleo */}
        <g className="art-h-pop" style={{ '--pop': '1.25' }}>
          <circle cx="15.6" cy="19.8" r="4.3" fill={url('nuc')} />
          <circle cx="16.5" cy="20.6" r="1.4" fill="#3B0764" opacity="0.6" />
          <circle cx="14.4" cy="18.4" r="1.1" fill="#fff" opacity="0.8" />
        </g>
        {/* brillo de cristal */}
        <path d="M12.5 10.4H35.5Q39.6 10.4 40.4 14.4Q30 12.4 12 14.6Q8.4 15 8 14.4Q8.8 10.4 12.5 10.4Z" fill={url('gloss')} />
      </g>

      <Sparkle x={42} y={6.6} r={2.2} idle delay={0.8} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={6.2} y={6.4} r={2.4} fill="#fff" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   9. Célula animal — membrana orgánica con núcleo, mitocondrias, Golgi,
   retículo y vesículas. Hover: el núcleo crece y las mitocondrias se agitan.
   Reposo: las vesículas flotan + un destello.
   ====================================================================== */
const CELL = 'M24 8.5C32 8.2 39.6 13 40.4 21.6C41.2 30.4 35.4 38.6 26.4 39.6C17.4 40.6 8.6 35.6 7.6 26.4C6.6 17.4 13.6 8.8 24 8.5Z';
const mitoCristae = (x, y) => `M${r2(x - 2.45)} ${y}l0.65 -1 0.9 2 0.9 -2 0.9 2 0.9 -2 0.65 1`;

const CelulaAnimal = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#4C0519" opacity={0.5} />
        <MaterialGradient id={id('mem')} light="#FFE4E6" base="#FDA4AF" dark="#BE123C" />
        <radialGradient id={id('cyto')} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FFF1F2" />
          <stop offset="100%" stopColor="#FECDD3" />
        </radialGradient>
        <radialGradient id={id('nuc')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#312E81" />
        </radialGradient>
        <MaterialGradient id={id('mito')} light="#FED7AA" base="#F97316" dark="#9A3412" />
        <GlossGradient id={id('gloss')} opacity={0.7} />
      </defs>
      <TileBg c={['#FFE4E6', '#FB7185', '#9F1239']} />
      <ellipse cx="24" cy="42" rx="15" ry="2.3" fill={url('shadow')} />

      {/* membrana y citoplasma */}
      <path d={CELL} fill={url('mem')} />
      <path d={CELL} transform="translate(24 24.2) scale(0.88) translate(-24 -24.2)" fill={url('cyto')} />
      {/* retículo endoplasmático */}
      <path d="M13.2 22.6Q11.6 25 13.4 27.2T13.6 31.6M15.6 23.4Q14.2 25.6 15.8 27.6T16 31.4" stroke="#F472B6" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />
      {/* aparato de Golgi */}
      <path d="M29.4 12.6Q33.6 12.4 35 15.6" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M28.8 14.6Q32.6 14.6 33.8 17.4" stroke="#A855F7" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M28.4 16.6Q31.6 16.8 32.6 19.2" stroke="#9333EA" strokeWidth="1" strokeLinecap="round" />
      {/* vesículas */}
      <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.6s' }}>
        <circle cx="36.2" cy="20.8" r="1.1" fill="#F5D0FE" stroke="#C084FC" strokeWidth="0.45" />
        <circle cx="35" cy="23.6" r="0.75" fill="#F5D0FE" stroke="#C084FC" strokeWidth="0.4" />
        <circle cx="25.6" cy="12.4" r="0.85" fill="#F5D0FE" stroke="#C084FC" strokeWidth="0.4" />
      </g>
      {/* mitocondrias */}
      <g className="art-h-wiggle">
        <g transform="rotate(-25 31.6 31)">
          <ellipse cx="31.6" cy="31" rx="3.7" ry="1.9" fill={url('mito')} />
          <path d={mitoCristae(31.6, 31)} stroke="#FFEDD5" strokeWidth="0.45" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <g className="art-h-wiggle">
        <g transform="rotate(32 18.6 33.4)">
          <ellipse cx="18.6" cy="33.4" rx="3.4" ry="1.75" fill={url('mito')} />
          <path d={mitoCristae(18.6, 33.4)} stroke="#FFEDD5" strokeWidth="0.45" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      {/* núcleo */}
      <g className="art-h-pop" style={{ '--pop': '1.18' }}>
        <circle cx="22.6" cy="22.6" r="6.2" fill={url('nuc')} />
        <circle cx="22.6" cy="22.6" r="5.5" stroke="#C7D2FE" strokeOpacity="0.7" strokeWidth="0.5" strokeDasharray="1.6 1" />
        <circle cx="23.8" cy="23.6" r="2" fill="#1E1B4B" opacity="0.55" />
        <circle cx="20.4" cy="20.4" r="1.6" fill="#fff" opacity="0.8" />
      </g>
      {/* brillo */}
      <path d="M13.6 13.6Q18 10 24.4 10" stroke={url('gloss')} strokeWidth="1.8" strokeLinecap="round" />

      <Sparkle x={41.6} y={7} r={2.2} idle delay={0.3} />
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   10. Conecta parejas — dos columnas de tarjetas con símbolos unidas por
   cables de luz cruzados. Hover: las columnas se acercan y estalla un
   destello en el centro. Reposo: un cable brilla + un destello.
   ====================================================================== */
const CP_ROWS = [8.5, 20.5, 32.5];
const CP_STAR_L = starPath(8.6, 12.5, 2.7, 1.15);
const CP_STAR_R = starPath(39.4, 24.5, 2.7, 1.15);
const CP_CABLES = [
  { d: 'M17.5 12.5C24 12.5 24 24.5 30.5 24.5', c: '#FBBF24', k: 'star' },
  { d: 'M17.5 24.5C24 24.5 24 36.5 30.5 36.5', c: '#22D3EE', k: 'circle' },
  { d: 'M17.5 36.5C24 36.5 24 12.5 30.5 12.5', c: '#A3E635', k: 'tri' },
];

const ConectaParejas = () => {
  const [id, url] = useArtIds();
  const card = (x, y, k) => (
    <g key={k}>
      <rect x={x} y={y + 1} width="13" height="8" rx="2.6" fill="#86198F" opacity="0.6" />
      <rect x={x} y={y} width="13" height="8" rx="2.6" fill={url('card')} />
      <rect x={x + 0.4} y={y + 0.4} width="12.2" height="7.2" rx="2.2" stroke="#fff" strokeWidth="0.5" />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#4A044E" opacity={0.5} />
        <MaterialGradient id={id('card')} light="#FFFFFF" base="#FDF4FF" dark="#F0ABFC" />
      </defs>
      <TileBg c={['#FAE8FF', '#D946EF', '#701A75']} />
      <ellipse cx="24" cy="43" rx="18" ry="2" fill={url('shadow')} />

      {/* cables de luz */}
      {CP_CABLES.map((c, i) => (
        <path key={`g${c.k}`} className={i === 0 ? 'art-i-glow' : undefined} style={i === 0 ? { '--lo': '0.25', '--dur': '2.4s' } : undefined} d={c.d} stroke={c.c} strokeOpacity="0.45" strokeWidth="3.4" strokeLinecap="round" />
      ))}
      {CP_CABLES.map((c) => (
        <path key={`c${c.k}`} d={c.d} stroke={c.c} strokeWidth="1.3" strokeLinecap="round" />
      ))}
      <path d="M17.5 12.5C24 12.5 24 24.5 30.5 24.5M17.5 24.5C24 24.5 24 36.5 30.5 36.5M17.5 36.5C24 36.5 24 12.5 30.5 12.5" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.4" strokeLinecap="round" />

      {/* columna izquierda */}
      <g className="art-h-slide" style={{ '--slide': '1.8px' }}>
        {CP_ROWS.map((y) => card(4.5, y, `l${y}`))}
        <path d={CP_STAR_L} fill="#F59E0B" />
        <circle cx="8.6" cy="24.5" r="2.2" fill="#06B6D4" />
        <path d="M8.6 34L11.1 38.3H6.1Z" fill="#65A30D" strokeLinejoin="round" />
        <path d="M12.6 12.5H15.4M12.6 24.5H15.4M12.6 36.5H15.4" stroke="#E879F9" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17.5" cy="12.5" r="1.3" fill="#FBBF24" stroke="#fff" strokeWidth="0.6" />
        <circle cx="17.5" cy="24.5" r="1.3" fill="#22D3EE" stroke="#fff" strokeWidth="0.6" />
        <circle cx="17.5" cy="36.5" r="1.3" fill="#A3E635" stroke="#fff" strokeWidth="0.6" />
      </g>
      {/* columna derecha */}
      <g className="art-h-slide" style={{ '--slide': '-1.8px' }}>
        {CP_ROWS.map((y) => card(30.5, y, `r${y}`))}
        <path d="M39.4 10L41.9 14.3H36.9Z" fill="#65A30D" />
        <path d={CP_STAR_R} fill="#F59E0B" />
        <circle cx="39.4" cy="36.5" r="2.2" fill="#06B6D4" />
        <path d="M32.6 12.5H35.4M32.6 24.5H35.4M32.6 36.5H35.4" stroke="#E879F9" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="30.5" cy="24.5" r="1.3" fill="#FBBF24" stroke="#fff" strokeWidth="0.6" />
        <circle cx="30.5" cy="36.5" r="1.3" fill="#22D3EE" stroke="#fff" strokeWidth="0.6" />
        <circle cx="30.5" cy="12.5" r="1.3" fill="#A3E635" stroke="#fff" strokeWidth="0.6" />
      </g>

      <Sparkle x={24} y={5.4} r={2} idle delay={0.5} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={24} y={24.5} r={3.4} fill="#fff" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   11. Criptograma — candado dorado con visor de cifrado 7·A·?.
   Hover: se abre el candado y la ? se descifra en L.
   Reposo: la ? parpadea + un destello.
   ====================================================================== */
const Criptograma = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#011614" opacity={0.6} />
        <GlowGradient id={id('glow')} color="#2DD4BF" opacity={0.5} />
        <linearGradient id={id('steel')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#78350F" stopOpacity="0" />
          <stop offset="100%" stopColor="#78350F" stopOpacity="0.42" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.7} />
      </defs>
      <TileBg c={['#5EEAD4', '#0F766E', '#042F2E']} vig="#011614" />
      <circle cx="24" cy="26" r="21" fill={url('glow')} />
      <ellipse cx="24" cy="42.2" rx="15" ry="2.3" fill={url('shadow')} />

      {/* arco del candado */}
      <g className="art-h-lift" style={{ '--lift': '-3.6px' }}>
        <path d="M16.8 21V15.6C16.8 11 20 8 24 8S31.2 11 31.2 15.6V21" stroke={url('steel')} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M16.2 19.6V15.4C16.4 11.6 18.8 9.2 22 8.6" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.7" strokeLinecap="round" />
      </g>

      {/* cuerpo */}
      <rect x="10" y="20.8" width="28" height="20.4" rx="5" fill="#92400E" />
      <rect x="10" y="19.6" width="28" height="20.4" rx="5" fill={url('gold')} />
      <path d="M33 19.6C36 19.6 38 21.6 38 24.6V35C38 38 36 40 33 40H30C32.6 39 34 37 34 34.4V24.8C34 22.2 33.8 20.6 33 19.6Z" fill={url('side')} />
      <rect x="12.4" y="20.4" width="23" height="2.4" rx="1.2" fill={url('gloss')} />
      <path d="M11.3 24.4V35.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />

      {/* visor de cifrado */}
      <rect x="12.8" y="23.4" width="22.4" height="9.6" rx="2.4" fill="#022C22" stroke="#5EEAD4" strokeOpacity="0.5" strokeWidth="0.5" />
      <path d="M20.27 24.6V31.8M27.73 24.6V31.8" stroke="#134E4A" strokeWidth="0.6" />
      <text x="16.53" y="30.5" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="6.6" fill="#5EEAD4">7</text>
      <text x="24" y="30.5" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="6.6" fill="#F0FDFA">A</text>
      <g className="art-h-hide">
        <text className="art-i-glow" style={{ '--lo': '0.35', '--dur': '1.6s' }} x="31.47" y="30.5" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="6.6" fill="#FBBF24">?</text>
      </g>
      <g className="art-h-show">
        <text x="31.47" y="30.5" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="6.6" fill="#FDE68A">L</text>
      </g>
      <path d="M13.6 24.2H34.4" stroke="#5EEAD4" strokeOpacity="0.25" strokeWidth="0.6" strokeLinecap="round" />

      {/* bocallave y remaches */}
      <circle cx="24" cy="35.6" r="1.35" fill="#78350F" />
      <path d="M23.3 36.2L22.9 38.4H25.1L24.7 36.2Z" fill="#78350F" />
      <circle cx="13.2" cy="37.4" r="0.75" fill="#FEF3C7" />
      <circle cx="34.8" cy="37.4" r="0.75" fill="#B45309" />

      <Sparkle x={40.4} y={9} r={2.2} fill="#CCFBF1" idle delay={0.7} />
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   12. Dictado interactivo — altavoz que dicta, hoja pautada con escritura
   y lápiz. Hover: el lápiz escribe, el altavoz crece y sale otra onda.
   Reposo: las ondas del altavoz laten.
   ====================================================================== */
const Dictado = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#7C2D12" opacity={0.5} />
        <MaterialGradient id={id('paper')} light="#FFFFFF" base="#F8FAFC" dark="#E2E8F0" />
        <MaterialGradient id={id('spk')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
        <linearGradient id={id('pencil')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
        <linearGradient id={id('metal')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
      <TileBg c={['#FFEDD5', '#FB923C', '#C2410C']} />
      <ellipse cx="25" cy="42.2" rx="15.5" ry="2.4" fill={url('shadow')} />

      {/* hoja pautada (con otra detrás) */}
      <g transform="rotate(4 26 24)">
        <rect x="15.4" y="9.6" width="24" height="31" rx="2.4" fill="#FED7AA" />
        <rect x="14" y="8.4" width="24" height="31" rx="2.4" fill={url('paper')} />
        <path d="M16 14.6H36M16 19H36M16 23.4H36M16 27.8H36M16 32.2H36" stroke="#BFDBFE" strokeWidth="0.45" />
        <path d="M18.6 9V38.8" stroke="#FDA4AF" strokeWidth="0.5" />
        <path d="M19.8 14q0.8 -2 1.6 0t1.6 0t1.6 0t1.6 0t1.6 0" stroke="#4338CA" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.8 18.4q0.8 -2 1.6 0t1.6 0t1.6 0t1.6 0t1.6 0t1.6 0t1.6 0" stroke="#4338CA" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.8 22.8q0.8 -2 1.6 0t1.6 0t1.6 0" stroke="#4338CA" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30.6 13.6L31.6 14.6L33.6 12.4" stroke="#10B981" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* lápiz que escribe */}
      <g className="art-h-wiggle">
        <g transform="translate(24.7 22.7) rotate(50)">
          <path d="M0 0L1.9 -0.75V0.75Z" fill="#1E1B4B" />
          <path d="M1.9 -0.75L5 -2.1V2.1L1.9 0.75Z" fill="#FCD9A8" />
          <rect x="5" y="-2.1" width="9.5" height="4.2" fill={url('pencil')} />
          <rect x="5" y="-1.2" width="9.5" height="0.7" fill="#fff" opacity="0.35" />
          <rect x="14.5" y="-2.2" width="2" height="4.4" fill={url('metal')} />
          <rect x="16.5" y="-2.1" width="2.6" height="4.2" rx="1" fill="#F9A8D4" />
        </g>
      </g>

      {/* altavoz */}
      <g className="art-h-pop" style={{ '--pop': '1.12' }}>
        <circle cx="10.2" cy="13.4" r="6.4" fill="#7C2D12" opacity="0.3" />
        <circle cx="10.2" cy="12.4" r="6.4" fill={url('spk')} />
        <circle cx="10.2" cy="12.4" r="5.9" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" />
        <path d="M6.6 9.4Q8.6 7.2 12 7.2" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M6.9 11H8.5L10.9 9V15.8L8.5 13.8H6.9Z" fill="#fff" />
        <path className="art-i-glow" style={{ '--lo': '0.35', '--dur': '1.8s' }} d="M12.2 10.6Q13.3 12.4 12.2 14.2M13.9 9.4Q15.6 12.4 13.9 15.4" stroke="#fff" strokeWidth="0.85" strokeLinecap="round" />
      </g>
      <g className="art-h-show">
        <path d="M17.6 8.2Q20.2 12.4 17.6 16.6" stroke="#6366F1" strokeWidth="0.95" strokeLinecap="round" />
      </g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   13. Torre de palabras — bloques 3D apilados con etiquetas; el último
   flota sobre su hueco fantasma. Hover: el bloque cae en su sitio y estalla
   un destello. Reposo: el bloque flota + el hueco brilla.
   ====================================================================== */
const TORRE = [
  { x: 10, y: 34, w: 24, c: ['#FED7AA', '#F97316', '#9A3412'], top: '#FDBA74', side: '#C2410C', k: 'o' },
  { x: 11.5, y: 28, w: 21, c: ['#DDD6FE', '#8B5CF6', '#4C1D95'], top: '#C4B5FD', side: '#6D28D9', k: 'v' },
  { x: 12.5, y: 22, w: 19, c: ['#A7F3D0', '#10B981', '#065F46'], top: '#6EE7B7', side: '#047857', k: 'e' },
];
const boxTop = (x, y, w) => `M${x} ${y}L${x + 3} ${y - 2.4}H${r2(x + w + 3)}L${r2(x + w)} ${y}Z`;
const boxSide = (x, y, w, h) => `M${r2(x + w)} ${y}L${r2(x + w + 3)} ${r2(y - 2.4)}V${r2(y + h - 2.4)}L${r2(x + w)} ${r2(y + h)}Z`;

const TorrePalabras = () => {
  const [id, url] = useArtIds();
  const box = (b) => (
    <g key={b.k}>
      <path d={boxSide(b.x, b.y, b.w, 6)} fill={b.side} />
      <path d={boxTop(b.x, b.y, b.w)} fill={b.top} />
      <rect x={b.x} y={b.y} width={b.w} height="6" rx="0.8" fill={url(`f${b.k}`)} />
      <path d={`M${b.x + 0.6} ${b.y + 0.5}H${r2(b.x + b.w - 0.6)}`} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.5" strokeLinecap="round" />
      <rect x={b.x + 2.6} y={b.y + 2.1} width={r2(b.w - 9)} height="1.8" rx="0.9" fill="#fff" opacity="0.9" />
      <circle cx={r2(b.x + b.w - 3.6)} cy={b.y + 3} r="1" fill="#fff" opacity="0.6" />
    </g>
  );
  const pink = { x: 13.5, y: 9, w: 17, c: ['#FBCFE8', '#EC4899', '#831843'], top: '#F9A8D4', side: '#BE185D', k: 'p' };
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#082F49" opacity={0.55} />
        {[...TORRE, pink].map((b) => (
          <MaterialGradient key={b.k} id={id(`f${b.k}`)} light={b.c[0]} base={b.c[1]} dark={b.c[2]} />
        ))}
      </defs>
      <TileBg c={['#E0F2FE', '#38BDF8', '#0369A1']} />
      <ellipse cx="23.5" cy="41.2" rx="17" ry="2.4" fill={url('shadow')} />

      {TORRE.map(box)}
      {/* hueco fantasma donde encaja el último bloque */}
      <rect className="art-i-glow" style={{ '--lo': '0.3', '--dur': '2.2s' }} x="13.5" y="16" width="17" height="6" rx="0.8" stroke="#fff" strokeWidth="0.7" strokeDasharray="1.4 1" />

      <g className="art-h-drop" style={{ '--drop': '7px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.2px' }}>
          {box(pink)}
          <path d="M11 7.6V11.4M33.4 11V14" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.7" strokeLinecap="round" />
        </g>
      </g>

      <g className="art-h-burst" style={{ '--d': '.3s' }}><Sparkle x={36.6} y={17.4} r={2.4} fill="#FEF3C7" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   14. Velocidad — cronómetro cromado y rayo dorado.
   Hover: la aguja da una vuelta, el rayo crece y estalla un destello.
   Reposo: la aguja gira lentamente + el halo del rayo late.
   ====================================================================== */
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const r0 = i % 3 ? 8.6 : 7.6;
  return `M${r2(21 + r0 * Math.sin(a))} ${r2(26.5 - r0 * Math.cos(a))}L${r2(21 + 9.6 * Math.sin(a))} ${r2(26.5 - 9.6 * Math.cos(a))}`;
}).join('');
const BOLT = 'M34 8.5L25.4 26H31L27.2 42L42.2 21.2H36L40.4 8.5Z';

const Velocidad = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#450A0A" opacity={0.55} />
        <MaterialGradient id={id('case')} light="#FFFFFF" base="#E2E8F0" dark="#64748B" />
        <radialGradient id={id('face')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>
        <MaterialGradient id={id('bolt')} light="#FEF9C3" base="#FACC15" dark="#D97706" />
        <GlowGradient id={id('halo')} color="#FEF08A" opacity={0.75} />
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>
      <TileBg c={['#FEE2E2', '#EF4444', '#7F1D1D']} />
      <ellipse cx="24" cy="42.4" rx="16" ry="2.4" fill={url('shadow')} />
      <path d="M2.6 19H7.2M3.6 24.5H6.8M2.6 30H7.2" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" />

      {/* corona y pulsadores */}
      <rect x="15.4" y="10.6" width="2.8" height="3" rx="0.8" transform="rotate(-40 16.8 12.1)" fill={url('case')} />
      <rect x="19.3" y="10.4" width="3.4" height="3.8" fill={url('case')} />
      <rect x="17.2" y="8" width="7.6" height="3" rx="1.5" fill="#DC2626" />
      <rect x="17.8" y="8.4" width="4.6" height="0.8" rx="0.4" fill="#fff" opacity="0.55" />

      {/* caja, bisel y esfera */}
      <circle cx="21" cy="26.5" r="13" fill={url('case')} />
      <circle cx="21" cy="26.5" r="11.6" fill="#1E293B" />
      <circle cx="21" cy="26.5" r="10.7" fill={url('face')} />
      <path d={TICKS} stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
      <g className="art-h-spin" style={{ '--spin': '360deg' }}>
        <g className="art-i-spin" style={{ '--dur': '9s' }}>
          <circle cx="21" cy="26.5" r="9" />
          <path d="M23.1 27.7L13.64 22.25" stroke="#DC2626" strokeWidth="1.1" strokeLinecap="round" />
        </g>
      </g>
      <circle cx="21" cy="26.5" r="1.5" fill="#B91C1C" />
      <circle cx="20.6" cy="26.1" r="0.5" fill="#fff" opacity="0.8" />
      <path d="M12.6 21.4A9.4 9.4 0 0 1 22.8 17.2" stroke={url('gloss')} strokeWidth="2" strokeLinecap="round" />

      {/* rayo */}
      <circle className="art-i-glow" style={{ '--lo': '0.45', '--dur': '2.2s' }} cx="33.5" cy="24" r="12" fill={url('halo')} />
      <g className="art-h-pop" style={{ '--pop': '1.12' }}>
        <path d={BOLT} transform="translate(0.9 1)" fill="#7C2D12" opacity="0.5" />
        <path d={BOLT} fill={url('bolt')} stroke="#FFFBEB" strokeOpacity="0.8" strokeWidth="0.6" strokeLinejoin="round" />
        <path d="M34.6 10L27.6 24.6" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.8" strokeLinecap="round" />
      </g>

      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={43} y={33} r={2.4} fill="#FEF9C3" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   15. Batalla — dos espadas cruzadas que chocan sobre una insignia VS.
   Hover: las espadas se balancean y estalla el choque.
   Reposo: el choque brilla + un destello.
   ====================================================================== */
const CLASH = starPath(24, 19, 5.4, 1.5, 8, -90);

const Batalla = () => {
  const [id, url] = useArtIds();
  const sword = (rot, gem) => (
    <g transform={`translate(24 19) rotate(${rot}) translate(0 6)`}>
      <path d="M0 -20L2 -16.5V4.6H-2V-16.5Z" fill={url('steel')} />
      <path d="M0 -15.6V3.4" stroke="#64748B" strokeOpacity="0.7" strokeWidth="0.6" />
      <path d="M-1.3 -16V3.8" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.45" />
      <rect x="-1.3" y="7.2" width="2.6" height="6.4" rx="0.6" fill="#4C1D95" />
      <path d="M-1.3 8.6L1.3 9.6M-1.3 10.4L1.3 11.4M-1.3 12.2L1.3 13.2" stroke="#A78BFA" strokeWidth="0.45" />
      <rect x="-6.2" y="4.6" width="12.4" height="2.6" rx="1.3" fill={url('gold')} />
      <circle cx="0" cy="5.9" r="1.15" fill={gem} stroke="#FEF3C7" strokeWidth="0.35" />
      <circle cx="0" cy="14.6" r="1.9" fill={url('gold')} />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#0F0326" opacity={0.6} />
        <GlowGradient id={id('clashGlow')} color="#FDE68A" opacity={0.9} />
        <linearGradient id={id('steel')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="55%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <radialGradient id={id('spark')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <radialGradient id={id('badge')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
      </defs>
      <TileBg c={['#FB7185', '#9F1239', '#2E1065']} vig="#0F0326" />
      <ellipse cx="24" cy="42.6" rx="15" ry="2.2" fill={url('shadow')} />
      <circle className="art-i-glow" style={{ '--lo': '0.4', '--dur': '2.4s' }} cx="24" cy="19" r="12" fill={url('clashGlow')} />

      <g className="art-h-tilt" style={{ '--tilt': '-6deg' }}>{sword(-40, '#3B82F6')}</g>
      <g className="art-h-tilt-r" style={{ '--tilt': '6deg' }}>{sword(40, '#EF4444')}</g>

      {/* chispa del choque */}
      <path d={CLASH} fill={url('spark')} />
      <g className="art-h-burst"><path d={starPath(24, 19, 9, 2.4, 8, -67.5)} fill="#FEF3C7" /></g>

      {/* insignia VS */}
      <circle cx="24" cy="36.4" r="6.4" fill="#0F0326" opacity="0.35" />
      <circle cx="24" cy="35.8" r="6" fill={url('badge')} stroke={url('gold')} strokeWidth="1.3" />
      <path d="M20.4 32.8Q22.4 31.2 25.2 31.4" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
      <text x="24" y="37.7" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="5.4" fill="#FCD34D">VS</text>

      <Sparkle x={7} y={9} r={2} fill="#FECDD3" idle delay={0.9} />
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   16. Misiones robóticas — la mascota sobre un tablero en perspectiva,
   con el camino de puntos hasta la bandera. Hover: el robot salta, la
   bandera ondea y estalla un destello en la meta. Reposo: parpadeo + orbe.
   ====================================================================== */
const MR_CELLS = 'M11 22H17.5L16.62 26.6H9.24ZM24 22H30.5L31.38 26.6H24ZM16.62 26.6H24V32.2H15.55ZM31.38 26.6H38.76L40.9 32.2H32.45ZM7.1 32.2H15.55L14.25 39H4.5ZM24 32.2H32.45L33.75 39H24Z';

const MisionesRoboticas = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#042F2E" opacity={0.55} />
        <MaterialGradient id={id('board')} light="#FFFFFF" base="#E0E7FF" dark="#A5B4FC" />
        <linearGradient id={id('flag')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <TileBg c={['#CCFBF1', '#2DD4BF', '#115E59']} />
      <ellipse cx="24" cy="43.4" rx="20" ry="2" fill={url('shadow')} />

      {/* tablero */}
      <path d="M4.5 39H43.5V41.2Q43.5 42 42.7 42H5.3Q4.5 42 4.5 41.2Z" fill="#4338CA" />
      <path d="M11 22H37L43.5 39H4.5Z" fill={url('board')} />
      <path d={MR_CELLS} fill="#A5B4FC" opacity="0.45" />
      <path d="M17.5 22L14.25 39M24 22V39M30.5 22L33.75 39M9.24 26.6H38.76M7.1 32.2H40.9" stroke="#6366F1" strokeOpacity="0.35" strokeWidth="0.45" />
      <path d="M11 22H37" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" />

      {/* camino hasta la meta */}
      <path d="M20.4 35.6H28.6L32.4 26.6" stroke="#EC4899" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.01 2.2" />
      <ellipse cx="34.4" cy="24.4" rx="3" ry="1.2" fill="#FBBF24" opacity="0.45" stroke="#F59E0B" strokeWidth="0.6" />

      {/* bandera */}
      <path d="M34.4 24.4V12.6" stroke="#475569" strokeWidth="0.8" strokeLinecap="round" />
      <g className="art-h-wiggle art-o-left">
        <path d="M34.7 12.8L40.8 15L34.7 17.3Z" fill={url('flag')} />
      </g>
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={38.6} y={20.4} r={2.6} fill="#FEF3C7" /></g>

      {/* mascota */}
      <ellipse cx="15.8" cy="36.6" rx="4.2" ry="1.1" fill="#312E81" opacity="0.3" />
      <g className="art-h-jump" style={{ '--jump': '-4px' }}>
        <MiniBot x={15.8} y={17.6} s={0.86} body />
      </g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   17. Laboratorio de robótica — la mascota cablea una placa tipo Arduino
   y enciende un LED. Hover: el robot salta, el LED crece y destella.
   Reposo: parpadeo + el LED brilla.
   ====================================================================== */
const LabRobotica = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#083344" opacity={0.55} />
        <MaterialGradient id={id('pcb')} light="#93C5FD" base="#2563EB" dark="#1E3A8A" />
        <MaterialGradient id={id('led')} light="#FEF9C3" base="#FBBF24" dark="#D97706" />
        <GlowGradient id={id('ledGlow')} color="#FDE68A" opacity={0.9} />
        <linearGradient id={id('metal')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
      <TileBg c={['#CFFAFE', '#22D3EE', '#155E75']} />
      <ellipse cx="24" cy="41.4" rx="18" ry="2.2" fill={url('shadow')} />

      {/* mascota (detrás de la placa) */}
      <g className="art-h-jump" style={{ '--jump': '-3.5px' }}>
        <MiniBot x={15.6} y={15.4} s={0.86} body orb={false} />
      </g>

      {/* placa */}
      <path d="M42 26.5L39 36V38.4L42 28.9Z" fill="#172554" />
      <path d="M6.5 36H39V37.8Q39 38.4 38.4 38.4H7.1Q6.5 38.4 6.5 37.8Z" fill="#1E3A8A" />
      <path d="M9.5 26.5H42L39 36H6.5Z" fill={url('pcb')} />
      <path d="M9.6 26.6H41.8" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.5" />
      <path d="M12.4 27.7H39.6M9.4 34.7H36.8" stroke="#0F172A" strokeWidth="1.1" strokeDasharray="0.9 0.7" />
      <path d="M13 31.2H17M29.6 31.4H33" stroke="#93C5FD" strokeOpacity="0.55" strokeWidth="0.4" />
      <path d="M8.1 29H11.9L11.3 31.8H7.5Z" fill={url('metal')} />
      {/* microcontrolador */}
      <path d="M17.6 29.4H28.4L27.6 32.6H16.8Z" fill="#1E293B" />
      <path d="M18 29.1H28M17.2 32.9H27.2" stroke="#CBD5E1" strokeWidth="0.6" strokeDasharray="0.5 0.7" />
      <circle cx="18.7" cy="30.3" r="0.35" fill="#64748B" />

      {/* cables */}
      <path d="M26.4 27.6C27.2 24.4 30.4 24 31.6 27.4" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" />
      <path d="M22.4 25.6C25 19.5 31.4 19.4 34 28" stroke="#EF4444" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M23.4 23.2C25.6 20.2 29.8 20 32 23.2" stroke="#FECACA" strokeOpacity="0.8" strokeWidth="0.4" strokeLinecap="round" />

      {/* LED */}
      <circle className="art-i-glow" style={{ '--lo': '0.45', '--dur': '1.8s' }} cx="35.5" cy="28" r="8.5" fill={url('ledGlow')} />
      <g className="art-h-burst"><circle cx="35.5" cy="28" r="8" stroke="#FEF3C7" strokeWidth="0.8" /></g>
      <g className="art-h-pop" style={{ '--pop': '1.25' }}>
        <path d="M34.6 30.5V32.6M36.4 30.5V32.6" stroke="#CBD5E1" strokeWidth="0.6" />
        <rect x="32.4" y="30.1" width="6.2" height="1.1" rx="0.55" fill="#F59E0B" />
        <path d="M32.9 30.6V28.2A2.6 2.6 0 0 1 38.1 28.2V30.6Z" fill={url('led')} />
        <path d="M33.9 28.4Q34.1 26.7 35.3 26.4" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.6" strokeLinecap="round" />
      </g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   18. Infografías interactivas — póster con gráfica de barras, donut y un
   punto interactivo con el cursor. Hover: las barras crecen, el punto se
   amplía y estalla un destello. Reposo: anillo del punto + un destello.
   ====================================================================== */
const IG_BARS = [
  { x: 13, h: 7, c: ['#DDD6FE', '#8B5CF6', '#5B21B6'], k: 'v' },
  { x: 18, h: 11.5, c: ['#FBCFE8', '#EC4899', '#9D174D'], k: 'p' },
  { x: 23, h: 5, c: ['#FEF3C7', '#F59E0B', '#B45309'], k: 'a' },
  { x: 28, h: 9, c: ['#A7F3D0', '#10B981', '#065F46'], k: 'e' },
];
const CURSOR = 'M35.4 28L35.4 36.2L37.6 34.2L39 37.4L40.4 36.8L39 33.7L41.8 33.6Z';

const Infografias = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <ShadowGradient id={id('shadow')} color="#4A044E" opacity={0.5} />
        <MaterialGradient id={id('paper')} light="#FFFFFF" base="#FFFFFF" dark="#E2E8F0" />
        <MaterialGradient id={id('hot')} light="#FEF3C7" base="#FBBF24" dark="#EA580C" />
        {IG_BARS.map((b) => <MaterialGradient key={b.k} id={id(`b${b.k}`)} light={b.c[0]} base={b.c[1]} dark={b.c[2]} />)}
      </defs>
      <TileBg c={['#C4B5FD', '#F472B6', '#F59E0B']} vig="#7C2D12" />
      <ellipse cx="23" cy="42.2" rx="16" ry="2.3" fill={url('shadow')} />

      {/* póster */}
      <rect x="11.4" y="8.4" width="27" height="33.5" rx="3" transform="rotate(6 25 25)" fill="#EDE9FE" opacity="0.9" />
      <rect x="9" y="7" width="27" height="33.5" rx="3" fill={url('paper')} />
      <rect x="9.4" y="7.4" width="26.2" height="32.7" rx="2.6" stroke="#fff" strokeWidth="0.6" />
      <rect x="12" y="10.2" width="12" height="2.2" rx="1.1" fill="#7C3AED" />
      <rect x="12" y="13.6" width="8" height="1.2" rx="0.6" fill="#CBD5E1" />
      {/* donut */}
      <circle cx="29.8" cy="13.6" r="3.4" stroke="#EDE9FE" strokeWidth="2.3" />
      <circle cx="29.8" cy="13.6" r="3.4" transform="rotate(-90 29.8 13.6)" stroke="#EC4899" strokeWidth="2.3" strokeDasharray="12 21.4" />
      <circle cx="29.8" cy="13.6" r="3.4" transform="rotate(-90 29.8 13.6)" stroke="#F59E0B" strokeWidth="2.3" strokeDasharray="5 21.4" strokeDashoffset="-12" />
      {/* barras */}
      <path d="M12 30.6H33" stroke="#CBD5E1" strokeWidth="0.6" strokeLinecap="round" />
      <g className="art-h-pop art-o-bottom" style={{ '--pop': '1.12' }}>
        {IG_BARS.map((b) => (
          <rect key={b.k} x={b.x} y={30.6 - b.h} width="3.6" height={b.h} rx="0.8" fill={url(`b${b.k}`)} />
        ))}
      </g>
      <rect x="12" y="33.4" width="18" height="1.2" rx="0.6" fill="#E2E8F0" />
      <rect x="12" y="36" width="12" height="1.2" rx="0.6" fill="#E2E8F0" />

      {/* punto interactivo y cursor */}
      <circle className="art-i-pulse" style={{ '--amp': '1.3', '--dur': '2.2s' }} cx="34" cy="25.4" r="4.4" stroke="#F59E0B" strokeWidth="0.8" />
      <g className="art-h-pop" style={{ '--pop': '1.2' }}>
        <circle cx="34" cy="25.4" r="3.2" fill={url('hot')} stroke="#fff" strokeWidth="0.9" />
        <text x="34" y="27" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="4.4" fill="#fff">1</text>
      </g>
      <path d={CURSOR} fill="#fff" stroke="#312E81" strokeWidth="0.6" strokeLinejoin="round" />

      <Sparkle x={41.4} y={8} r={2.2} idle delay={0.2} />
      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={40.6} y={20} r={2.4} fill="#FEF3C7" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   19. La Fortaleza — castillo de piedra en una colina al atardecer y un
   enemigo que se acerca por el camino. Hover: la bandera ondea, sale un
   proyectil de la torre y destella sobre el enemigo.
   Reposo: las ventanas titilan + una estrella.
   ====================================================================== */
const Fortaleza = () => {
  const [id, url] = useArtIds();
  const tower = (x) => (
    <g key={x}>
      <rect x={x} y="19" width="8" height="18.6" fill={url('stone')} />
      <rect x={x + 6} y="19" width="2" height="18.6" fill="#78350F" opacity="0.28" />
      <path d={`M${x + 0.7} 21V35.6`} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.6" strokeLinecap="round" />
      <path d={`M${x - 1.2} 19.6L${x + 4} 8.6L${x + 9.2} 19.6Z`} fill={url('roof')} />
      <path d={`M${x + 4} 8.6L${x + 9.2} 19.6H${x + 4}Z`} fill="#831843" opacity="0.35" />
      <rect x={x - 1.4} y="18.8" width="10.8" height="1.5" rx="0.75" fill="#9D174D" />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={id('clip')}><rect width="48" height="48" rx="12" /></clipPath>
        <MaterialGradient id={id('hill')} light="#BBF7D0" base="#22C55E" dark="#14532D" />
        <MaterialGradient id={id('stone')} light="#FFF7ED" base="#E9C68A" dark="#A16207" />
        <MaterialGradient id={id('keep')} light="#FDE9C4" base="#D9AE6C" dark="#92400E" />
        <MaterialGradient id={id('roof')} light="#FBCFE8" base="#EC4899" dark="#831843" />
        <MaterialGradient id={id('slime')} light="#FECACA" base="#EF4444" dark="#991B1B" />
        <linearGradient id={id('flag')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <TileBg c={['#BAE6FD', '#A5B4FC', '#6D28D9']} vig="#2E1065" />
      <g clipPath={url('clip')}>
        <path d="M-1 36Q10 30.5 24 32.5Q37 34.5 49 30V49H-1Z" fill={url('hill')} />
        <path d="M2 34.4Q12 31.2 22 32.3" stroke="#DCFCE7" strokeOpacity="0.8" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M21.4 37.6Q19.6 41 12.6 43.6L7.6 46H15.6Q22 43.4 26.6 37.6Z" fill="#FDE68A" opacity="0.9" />
      </g>

      {/* torre del homenaje y bandera */}
      <path d="M24 14V5.4" stroke="#E2E8F0" strokeWidth="0.7" strokeLinecap="round" />
      <g className="art-h-wiggle art-o-left">
        <path d="M24.3 5.6L30.4 7.6L24.3 9.8Z" fill={url('flag')} />
      </g>
      <path d={merlons(19.8, 15.2, 8.4, 3, 1.8)} fill={url('keep')} />
      <rect x="19.8" y="15.2" width="8.4" height="10" fill={url('keep')} />

      {/* muralla con almenas y puerta */}
      <path d={merlons(15.6, 23.6, 16.8, 4, 1.8)} fill={url('stone')} />
      <rect x="15.6" y="23.6" width="16.8" height="14" fill={url('stone')} />
      <path d="M15.6 27.4H32.4M15.6 31.4H21M27 31.4H32.4M19 23.6V27.4M29 23.6V27.4M18 27.4V31.4M30 27.4V31.4" stroke="#A16207" strokeOpacity="0.35" strokeWidth="0.4" />
      <path d="M21.2 37.6V32Q21.2 28.8 24 28.8Q26.8 28.8 26.8 32V37.6Z" fill="#3B0764" />
      <path d="M22.6 30.2V37.6M24 29V37.6M25.4 30.2V37.6M21.2 33.2H26.8" stroke="#A78BFA" strokeOpacity="0.65" strokeWidth="0.5" />

      {tower(8.6)}
      {tower(31.4)}

      {/* ventanas encendidas */}
      <g className="art-i-glow" style={{ '--lo': '0.55', '--dur': '2.6s' }}>
        <path d="M11.6 27.2V25Q11.6 24 12.6 24Q13.6 24 13.6 25V27.2Z" fill="#FDE68A" />
        <path d="M34.4 27.2V25Q34.4 24 35.4 24Q36.4 24 36.4 25V27.2Z" fill="#FDE68A" />
        <path d="M23 21V19Q23 18 24 18Q25 18 25 19V21Z" fill="#FDE68A" />
      </g>

      {/* enemigo y proyectil */}
      <g clipPath={url('clip')}>
        <path d="M4.6 44.6Q4.6 39.6 8.4 39.6Q12.2 39.6 12.2 44.6Z" fill={url('slime')} />
        <circle cx="7.2" cy="42.2" r="0.8" fill="#fff" />
        <circle cx="9.6" cy="42.2" r="0.8" fill="#fff" />
        <path d="M6.4 40.9L7.8 41.5M10.4 40.9L9 41.5" stroke="#7F1D1D" strokeWidth="0.6" strokeLinecap="round" />
      </g>
      <g className="art-h-show">
        <path d="M12.6 28Q9.4 31.6 8.8 37.4" stroke="#FBBF24" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="1 1" />
        <circle cx="9.2" cy="35.4" r="1.3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.6" />
      </g>
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={8.4} y={39.4} r={2.8} fill="#FEF3C7" /></g>

      <Sparkle x={40.6} y={6.6} r={1.9} idle delay={0.5} />
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   20. Laboratorio de física — plano inclinado 3D con una bola y sus
   fuerzas (normal y peso). Hover: la bola rueda pendiente abajo con sus
   vectores y estalla un destello. Reposo: dos destellos.
   ====================================================================== */
const PF_N = arrow(0, 0, 0, -10);
const PF_G = arrow(0, 0, 5.17, 7.61);
const PF_FLOOR = [0, 8, 16, 24, 32, 40, 48].map((xb) => `M${r2(24 + (xb - 24) / 3)} 36L${xb} 48`).join('')
  + 'M0 38.4H48M0 41.8H48M0 45.8H48';

const LabFisica = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={id('clip')}><rect width="48" height="48" rx="12" /></clipPath>
        <ShadowGradient id={id('shadow')} color="#020617" opacity={0.65} />
        <GlowGradient id={id('glow')} color="#3B82F6" opacity={0.5} />
        <MaterialGradient id={id('slope')} light="#FFFFFF" base="#DDD6FE" dark="#A78BFA" />
        <MaterialGradient id={id('front')} light="#A78BFA" base="#7C3AED" dark="#4C1D95" />
        <radialGradient id={id('ball')} cx="0.38" cy="0.32" r="0.7">
          <stop offset="0%" stopColor="#FDF2F8" />
          <stop offset="45%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#9D174D" />
        </radialGradient>
      </defs>
      <TileBg c={['#60A5FA', '#1E3A8A', '#0B1026']} vig="#020617" />
      <circle cx="24" cy="22" r="22" fill={url('glow')} />
      <g clipPath={url('clip')}>
        <path d={PF_FLOOR} stroke="#38BDF8" strokeOpacity="0.25" strokeWidth="0.4" />
      </g>
      <ellipse cx="24" cy="38.8" rx="18" ry="2.2" fill={url('shadow')} />

      {/* cuña (sube hacia la izquierda): pendiente y frente */}
      <path d="M7 18.5L11.5 15.5L39.5 34.5L35 37.5Z" fill={url('slope')} />
      <path d="M7 18.5V37.5H35Z" fill={url('front')} />
      <path d="M35 37.5L7 18.5L11.5 15.5" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M8 21V35.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M15.4 22.3L17.2 21.1M29.4 31.8L31.2 30.6" stroke="#7C3AED" strokeOpacity="0.45" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M30 37.5A5 5 0 0 1 30.86 34.69" stroke="#FDE68A" strokeWidth="0.7" strokeLinecap="round" />

      {/* bola con sus vectores, en el sistema de la pendiente */}
      <g transform="translate(24.32 21.9) rotate(34.16)">
        <g className="art-h-slide" style={{ '--slide': '5.5px' }}>
          <path d="M-6 -1.8H-10M-5.6 1.3H-8.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" strokeLinecap="round" />
          <ellipse cx="0" cy="4.4" rx="3" ry="0.65" fill="#2E1065" opacity="0.4" />
          <path d={PF_N.line} stroke="#22D3EE" strokeWidth="1" strokeLinecap="round" />
          <path d={PF_N.head} fill="#22D3EE" />
          <path d={PF_G.line} stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
          <path d={PF_G.head} fill="#FBBF24" />
          <g className="art-h-spin" style={{ '--spin': '220deg' }}>
            <circle cx="0" cy="0" r="4.4" fill={url('ball')} />
            <path d="M-4.2 -1.4Q0 1.6 4.2 -1.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" strokeLinecap="round" />
          </g>
          <circle cx="-2" cy="-0.5" r="1.3" fill="#fff" opacity="0.8" />
        </g>
      </g>

      <Sparkle x={8} y={8.6} r={2} fill="#BFDBFE" idle />
      <Sparkle x={41.6} y={9.4} r={1.6} idle delay={1.4} />
      <g className="art-h-burst" style={{ '--d': '.2s' }}><Sparkle x={38.4} y={25} r={2.4} fill="#FBCFE8" /></g>
      <TileRim />
    </svg>
  );
};

/* ======================================================================
   21. Cazapalabras 3D — paneles holográficos de palabras flotando en el
   espacio y una mirilla. Hover: la mirilla fija el blanco, se dispara el
   láser con +5 y estalla un destello. Reposo: el anillo exterior gira +
   un panel lejano flota.
   ====================================================================== */
const CZ_FLOOR = [-8, 4, 16, 24, 32, 44, 56].map((xb) => `M${r2(24 + (xb - 24) / 3)} 36L${xb} 48`).join('')
  + 'M0 38.4H48M0 41.8H48M0 45.8H48';

const Cazapalabras = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={id('clip')}><rect width="48" height="48" rx="12" /></clipPath>
        <GlowGradient id={id('glow')} color="#22D3EE" opacity={0.32} />
        <linearGradient id={id('laser')} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F0ABFC" stopOpacity="0" />
          <stop offset="100%" stopColor="#F0ABFC" />
        </linearGradient>
      </defs>
      <TileBg c={['#8B5CF6', '#3B0764', '#0F0A1F']} vig="#05030D" gloss={0.22} />
      <circle cx="24" cy="23" r="20" fill={url('glow')} />
      <g clipPath={url('clip')}>
        <path d={CZ_FLOOR} stroke="#A78BFA" strokeOpacity="0.3" strokeWidth="0.4" />
      </g>
      <circle cx="40.5" cy="30" r="0.6" fill="#E0E7FF" opacity="0.8" />
      <circle cx="5.6" cy="27" r="0.5" fill="#E0E7FF" opacity="0.6" />

      {/* paneles lejanos */}
      <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.4s' }}>
        <path d="M5.5 9.2L17.5 7.6V14L5.5 15.4Z" fill="#0F172A" fillOpacity="0.75" stroke="#67E8F9" strokeWidth="0.7" strokeLinejoin="round" />
        <text x="11.5" y="14.2" transform="matrix(1 -0.1333 0 1 0 0)" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="4" fill="#A5F3FC">SOL</text>
      </g>
      <path d="M36.5 9.4L43.6 8.6V12.6L36.5 13.6Z" fill="#0F172A" fillOpacity="0.75" stroke="#F472B6" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M38 11.4H42" stroke="#F9A8D4" strokeWidth="0.9" strokeLinecap="round" />

      {/* panel objetivo */}
      <path d="M12.5 19.2L35.5 16.6V27.4L12.5 29.6Z" stroke="#FDE68A" strokeOpacity="0.3" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12.5 19.2L35.5 16.6V27.4L12.5 29.6Z" fill="#0F172A" fillOpacity="0.82" stroke="#FDE68A" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M13.6 20.2L34.4 17.8" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.5" strokeLinecap="round" />
      <text x="24" y="27.6" transform="matrix(1 -0.113 0 1 0 0)" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="6.4" fill="#FDE68A">MAR</text>

      {/* láser y puntos (hover) */}
      <g className="art-h-show">
        <path d="M46 46L25.6 24.4" stroke={url('laser')} strokeWidth="1.4" strokeLinecap="round" />
        <text x="37.6" y="40" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="5.6" fill="#FDE68A">+5</text>
      </g>

      {/* mirilla */}
      <g className="art-i-spin" style={{ '--dur': '14s' }}>
        <circle cx="24" cy="23" r="12" stroke="#A5F3FC" strokeOpacity="0.55" strokeWidth="0.6" strokeDasharray="2.2 1.6" />
      </g>
      <g className="art-h-shrink" style={{ '--shrink': '0.84' }}>
        <circle cx="24" cy="23" r="9.4" stroke="#22D3EE" strokeOpacity="0.3" strokeWidth="3" />
        <circle cx="24" cy="23" r="9.4" stroke="#67E8F9" strokeWidth="1.2" />
        <path d="M24 11.2V15M24 31V34.8M12.2 23H16M32 23H35.8" stroke="#67E8F9" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      <circle cx="24" cy="23" r="1" fill="#fff" />

      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={24} y={23} r={4} fill="#FEF3C7" /></g>
      <TileRim />
    </svg>
  );
};

const ICONS = {
  'laboratorio-funciones-2d': Funciones2D,
  'visualizador-3d': Visualizador3D,
  'terminal-retro': TerminalRetro,
  'programacion-bloques': ProgramacionBloques,
  'banco-recursos-tutoria': BancoRecursos,
  'isla-de-la-calma': Isla,
  'generador-personajes-historicos': Personajes,
  'celula-vegetal': CelulaVegetal,
  'celula-animal': CelulaAnimal,
  'conecta-parejas': ConectaParejas,
  criptograma: Criptograma,
  'dictado-interactivo': Dictado,
  'torre-palabras': TorrePalabras,
  'velocidad-respuesta': Velocidad,
  batalla: Batalla,
  'misiones-roboticas': MisionesRoboticas,
  'laboratorio-robotica': LabRobotica,
  'infografias-interactivas': Infografias,
  'la-fortaleza': Fortaleza,
  'laboratorio-fisica': LabFisica,
  'cazapalabras-3d': Cazapalabras,
};

export default ICONS;
