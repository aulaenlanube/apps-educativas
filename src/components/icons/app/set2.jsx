// Ilustraciones (rediseño 2026). Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: comprension-oral, sumas-primaria, restas-primaria, multiplicaciones-primaria, divisiones-primaria, supermercado-matematico, numeros-romanos, mayor-menor, medidas, fracciones-eso, rotaciones-grid, ordena-bolas, ordena-numeros, mesa-crafteo, entrenador-tabla, sistema-solar, celula
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

const FONT = 'Fredoka, system-ui, sans-serif';

/* ---------- Baldosa común ----------
   Fondo 48×48 rx 12 con degradado propio (c = [claro, base, oscuro]), luz
   superior izquierda, viñeta inferior y brillo en el tercio superior. El borde
   interior (<Rim />) se pinta al final, encima del motivo. */
const Tile = ({ id, url, c, light = 0.45 }) => (
  <>
    <defs>
      <linearGradient id={id('t-bg')} x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stopColor={c[0]} />
        <stop offset="52%" stopColor={c[1]} />
        <stop offset="100%" stopColor={c[2]} />
      </linearGradient>
      <radialGradient id={id('t-lt')} cx="0.28" cy="0.08" r="0.8">
        <stop offset="0%" stopColor="#fff" stopOpacity={light} />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id('t-vg')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="55%" stopColor={c[2]} stopOpacity="0" />
        <stop offset="100%" stopColor={c[2]} stopOpacity="0.55" />
      </linearGradient>
      <GlossGradient id={id('t-gl')} opacity={0.3} />
    </defs>
    <rect width="48" height="48" rx="12" fill={url('t-bg')} />
    <rect width="48" height="48" rx="12" fill={url('t-lt')} />
    <rect width="48" height="48" rx="12" fill={url('t-vg')} />
    <path d="M1.2 12.4 A11.2 11.2 0 0 1 12.4 1.2 H35.6 A11.2 11.2 0 0 1 46.8 12.4 V14.6 C33 18.8 15 18.8 1.2 14.6 Z" fill={url('t-gl')} />
  </>
);

const Rim = () => (
  <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
);

// Número suelto del dibujo (centrado en cx, cy).
const Num = ({ x, y, s, fill, children, opacity }) => (
  <text x={x} y={y + s * 0.36} fontSize={s} textAnchor="middle" fontFamily={FONT} fontWeight="700" fill={fill} opacity={opacity}>
    {children}
  </text>
);

/* ---------- Familia de operaciones (sumas, restas, multiplicaciones, divisiones) ----------
   Misma composición: signo de porcelana extruido en el centro, ficha dorada
   arriba a la derecha y ficha blanca abajo a la izquierda. Cambian el color de
   la baldosa, el signo y los números.
   Hover: el signo crece y las fichas saltan. Reposo: la ficha dorada flota y
   titila un destello. */
const plus = (S, h, r) =>
  `M${-h + r} ${-S} H${h - r} Q${h} ${-S} ${h} ${-S + r} V${-h} H${S - r} Q${S} ${-h} ${S} ${-h + r} V${h - r} Q${S} ${h} ${S - r} ${h} H${h} V${S - r} Q${h} ${S} ${h - r} ${S} H${-h + r} Q${-h} ${S} ${-h} ${S - r} V${h} H${-S + r} Q${-S} ${h} ${-S} ${h - r} V${-h + r} Q${-S} ${-h} ${-S + r} ${-h} H${-h} V${-S + r} Q${-h} ${-S} ${-h + r} ${-S} Z`;

const OPS = {
  sum: { parts: [{ t: 'path', d: plus(11.6, 4.3, 2.4) }], spec: 'M-1.9 -9 V-5.6' },
  sub: { parts: [{ t: 'rect', x: -12, y: -4.4, w: 24, h: 8.8, rx: 4.4 }], spec: 'M-8.6 -2 H-3.4' },
  mul: { parts: [{ t: 'path', d: plus(12.4, 4.2, 2.4), rot: 45 }], spec: 'M-7.4 -5.6 L-5.3 -3.5' },
  div: {
    parts: [
      { t: 'rect', x: -12, y: -3.3, w: 24, h: 6.6, rx: 3.3 },
      { t: 'circle', cx: 0, cy: -9.4, r: 3.7 },
      { t: 'circle', cx: 0, cy: 9.4, r: 3.7 },
    ],
    spec: 'M-8.6 -1.2 H-4.2 M-1.6 -11.2 Q-0.9 -12 0.2 -12',
  },
};

const OX = 24;
const OY = 24.5;
const opShapes = (parts, dx, dy, props) => parts.map((p, i) => {
  const transform = `translate(${OX + dx} ${OY + dy})${p.rot ? ` rotate(${p.rot})` : ''}`;
  if (p.t === 'path') return <path key={i} d={p.d} transform={transform} {...props} />;
  if (p.t === 'rect') return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.rx} transform={transform} {...props} />;
  return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} transform={transform} {...props} />;
});

// Ficha numérica con canto (dado plano).
const Chip = ({ cx, cy, rot, face, edge, ink, gloss, digit }) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    <rect x={cx - 4.9} y={cy - 3.3} width="9.8" height="9.8" rx="2.9" fill={edge} />
    <rect x={cx - 4.9} y={cy - 4.9} width="9.8" height="9.8" rx="2.9" fill={face} />
    <rect x={cx - 4.1} y={cy - 4.3} width="8.2" height="3.8" rx="1.9" fill={gloss} />
    <Num x={cx} y={cy + 0.2} s={7.4} fill={ink}>{digit}</Num>
  </g>
);

const Arith = ({ op, c, face, edge, ink, nums }) => {
  const [id, url] = useArtIds();
  const { parts, spec } = OPS[op];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={c} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.4} />
        <ShadowGradient id={id('shadow')} color={edge} opacity={0.6} />
        <MaterialGradient id={id('face')} light="#FFFFFF" base={face[0]} dark={face[1]} />
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#D97706" />
        <MaterialGradient id={id('white')} light="#FFFFFF" base="#F8FAFC" dark="#CBD5E1" />
        <GlossGradient id={id('gloss')} opacity={0.75} />
        <linearGradient id={id('rimL')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('rimD')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="45%" stopColor={edge} stopOpacity="0" />
          <stop offset="100%" stopColor={edge} stopOpacity="0.5" />
        </linearGradient>
        <clipPath id={id('clip')}>{opShapes(parts, 0, 0)}</clipPath>
      </defs>

      {/* aura y sombra de contacto */}
      <circle cx="24" cy="25" r="18" fill={url('aura')} />
      <ellipse cx="24" cy="40.6" rx="13" ry="2.6" fill={url('shadow')} />

      {/* signo: canto, cara, filos de luz y sombra, brillo */}
      <g className="art-h-pop" style={{ '--pop': '1.12' }}>
        {opShapes(parts, 0, 2.3, { fill: edge })}
        {opShapes(parts, 0, 0, { fill: url('face') })}
        <g clipPath={url('clip')}>
          {opShapes(parts, 0, 0, { stroke: url('rimL'), strokeWidth: 2 })}
          {opShapes(parts, 0, 0, { stroke: url('rimD'), strokeWidth: 2.4 })}
        </g>
        <path d={spec} transform={`translate(${OX} ${OY})`} stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      </g>

      {/* fichas numéricas */}
      <g className="art-h-jump" style={{ '--jump': '-5px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.6s' }}>
          <Chip cx={37.2} cy={10.8} rot={12} face={url('gold')} edge="#B45309" ink="#7C2D12" gloss={url('gloss')} digit={nums[0]} />
        </g>
      </g>
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <Chip cx={10.6} cy={37.2} rot={-10} face={url('white')} edge={face[2]} ink={ink} gloss={url('gloss')} digit={nums[1]} />
      </g>

      <Sparkle x={9.4} y={10.4} r={2.6} idle delay={0.6} />
      <Rim />
    </svg>
  );
};

const Sumas = () => (
  <Arith op="sum" c={['#86EFAC', '#10B981', '#047857']} face={['#F0FDF4', '#A7F3D0', '#6EE7B7']} edge="#065F46" ink="#047857" nums={['3', '2']} />
);
const Restas = () => (
  <Arith op="sub" c={['#FDA4AF', '#F43F5E', '#9F1239']} face={['#FFF1F2', '#FECDD3', '#FDA4AF']} edge="#881337" ink="#BE123C" nums={['9', '5']} />
);
const Multiplicaciones = () => (
  <Arith op="mul" c={['#C4B5FD', '#8B5CF6', '#5B21B6']} face={['#F5F3FF', '#DDD6FE', '#C4B5FD']} edge="#4C1D95" ink="#6D28D9" nums={['6', '3']} />
);
const Divisiones = () => (
  <Arith op="div" c={['#93C5FD', '#3B82F6', '#1E40AF']} face={['#EFF6FF', '#BFDBFE', '#93C5FD']} edge="#1E3A8A" ink="#1D4ED8" nums={['8', '2']} />
);

/* Comprensión oral — auriculares rosas con ecualizador y notas musicales.
   Hover: el ecualizador crece y las notas suben. Reposo: las notas flotan y
   titila un destello. */
const ComprensionOral = () => {
  const [id, url] = useArtIds();
  const bars = [[17.7, 4.6], [20.4, 8.8], [23.1, 12.6], [25.8, 8.4], [28.5, 5]];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#A5F3FC', '#22D3EE', '#0369A1']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.42} />
        <ShadowGradient id={id('shadow')} color="#083344" opacity={0.5} />
        <MaterialGradient id={id('cup')} light="#FBCFE8" base="#EC4899" dark="#9D174D" />
        <MaterialGradient id={id('pad')} light="#6366F1" base="#3730A3" dark="#1E1B4B" />
        <linearGradient id={id('band')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id={id('bar')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CFFAFE" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      <circle cx="24" cy="26" r="18" fill={url('aura')} />
      <ellipse cx="24" cy="41.4" rx="16" ry="2.4" fill={url('shadow')} />

      {/* diadema */}
      <path d="M9.6 26 C9.6 8.8 38.4 8.8 38.4 26" stroke={url('band')} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M10.4 21.5 C11.6 9 36.4 9 37.6 21.5" stroke="#fff" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />

      {/* almohadillas (detrás) y carcasas */}
      <rect x="12" y="24" width="5.6" height="13.6" rx="2.6" fill={url('pad')} />
      <rect x="30.4" y="24" width="5.6" height="13.6" rx="2.6" fill={url('pad')} />
      {[4.4, 33.2].map((x) => (
        <g key={x}>
          <rect x={x} y="22.6" width="10.4" height="16.4" rx="5.2" fill={url('cup')} />
          <rect x={x + 1.5} y="24.2" width="3.2" height="8.6" rx="1.6" fill={url('gloss')} />
          <circle cx={x + 5.2} cy="31.6" r="2.3" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
          <path d={`M${x + 9} 27 V35`} stroke="#831843" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}

      {/* ecualizador */}
      <g className="art-h-pop" style={{ '--pop': '1.2' }}>
        {bars.map(([x, h]) => (
          <rect key={x} x={x} y={31 - h / 2} width="1.8" height={h} rx="0.9" fill={url('bar')} />
        ))}
      </g>

      {/* notas */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.2px', '--dur': '3.4s' }}>
          <path d="M37.4 9.4 V3.9 L42.8 2.7 V8.2" stroke="#fff" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M37.4 3.9 L42.8 2.7 V4.4 L37.4 5.6 Z" fill="#fff" />
          <ellipse cx="35.8" cy="9.6" rx="1.9" ry="1.45" transform="rotate(-20 35.8 9.6)" fill="#fff" />
          <ellipse cx="41.2" cy="8.4" rx="1.9" ry="1.45" transform="rotate(-20 41.2 8.4)" fill="#fff" />
        </g>
      </g>

      <Sparkle x={7.4} y={10.6} r={2.5} idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={24} y={6.4} r={2.4} fill="#FEF3C7" /></g>
      <Rim />
    </svg>
  );
};

/* Supermercado matemático — carrito índigo con fruta, cartón y botella, y una
   moneda de euro. Hover: el carrito avanza, la manzana asoma y la moneda
   salta. Reposo: la moneda flota y titila un destello. */
const Supermercado = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#FED7AA', '#FB923C', '#C2410C']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.4} />
        <ShadowGradient id={id('shadow')} color="#7C2D12" opacity={0.55} />
        <MaterialGradient id={id('basket')} light="#A5B4FC" base="#6366F1" dark="#3730A3" />
        <MaterialGradient id={id('apple')} light="#FECACA" base="#EF4444" dark="#991B1B" />
        <MaterialGradient id={id('bottle')} light="#BBF7D0" base="#22C55E" dark="#166534" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('carton')} light="#FFFFFF" base="#F1F5F9" dark="#CBD5E1" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('gold')} light="#FEF9C3" base="#FACC15" dark="#CA8A04" />
        <GlossGradient id={id('gloss')} opacity={0.75} />
      </defs>

      <circle cx="24" cy="24" r="18" fill={url('aura')} />
      <ellipse cx="25" cy="41.6" rx="15.5" ry="2.3" fill={url('shadow')} />

      <g className="art-h-slide" style={{ '--slide': '2.5px' }}>
        {/* productos que asoman */}
        <rect x="31.4" y="8.6" width="5" height="10" rx="1.6" fill={url('bottle')} />
        <rect x="32.7" y="5.8" width="2.4" height="3.4" rx="0.8" fill={url('bottle')} />
        <rect x="32.4" y="4.6" width="3" height="1.7" rx="0.6" fill="#E11D48" />
        <rect x="31.4" y="11.6" width="5" height="2.4" fill="#fff" opacity="0.85" />
        <path d="M32.5 9.6 V16.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M23 9.8 L24.6 7 H28.8 L30.4 9.8 Z" fill="#E2E8F0" />
        <rect x="23" y="9.8" width="7.4" height="9" rx="0.8" fill={url('carton')} />
        <rect x="23" y="12.4" width="7.4" height="2.6" fill="#3B82F6" />
        <g className="art-h-lift" style={{ '--lift': '-3px' }}>
          <circle cx="18.2" cy="14.4" r="4.6" fill={url('apple')} />
          <path d="M18.2 10.4 Q18 8.6 19 7.6" stroke="#7C2D12" strokeWidth="0.9" strokeLinecap="round" />
          <path d="M18.8 9.6 Q21.4 7.4 23 8.8 Q20.6 10.8 18.8 9.6 Z" fill="#22C55E" />
          <ellipse cx="16.5" cy="12.6" rx="1.3" ry="1" fill="#fff" opacity="0.7" />
        </g>

        {/* asa */}
        <path d="M5 12.4 H8.6 L12 17" stroke="#312E81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.2 12.4 H7.2" stroke="#EC4899" strokeWidth="2.8" strokeLinecap="round" />

        {/* cesta */}
        <path d="M11.8 16.6 H38.8 Q40.6 16.6 40.1 18.4 L37 30 Q36.6 31.4 35.2 31.4 H15.4 Q14 31.4 13.6 30 L10.4 18.4 Q10 16.6 11.8 16.6 Z" fill={url('basket')} />
        {[16.8, 21.2, 25.6, 30, 34.4].map((x) => (
          <path key={x} d={`M${x} 19.8 L${(x + (25.6 - x) * 0.1).toFixed(2)} 28.4`} stroke="#312E81" strokeOpacity="0.5" strokeWidth="1.7" strokeLinecap="round" />
        ))}
        <path d="M11 17 H39.8" stroke="#C7D2FE" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12.6 19.6 L14.9 28.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />

        {/* chasis y ruedas */}
        <path d="M14.8 31.4 L16.2 35 H36.4" stroke="#312E81" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {[18.4, 33.6].map((x) => (
          <g key={x}>
            <circle cx={x} cy="37.6" r="2.7" fill="#1E1B4B" />
            <circle cx={x} cy="37.6" r="1" fill="#C7D2FE" />
          </g>
        ))}
      </g>

      {/* moneda */}
      <g className="art-h-jump" style={{ '--jump': '-5px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.8s' }}>
          <circle cx="40.4" cy="9.4" r="5.4" fill="#A16207" />
          <circle cx="40.4" cy="8.8" r="5.4" fill={url('gold')} />
          <circle cx="40.4" cy="8.8" r="3.9" stroke="#A16207" strokeOpacity="0.5" strokeWidth="0.8" />
          <Num x={40.4} y={8.9} s={6.2} fill="#854D0E">€</Num>
          <path d="M37 6.6 Q38 4.6 40.2 4.2" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </g>

      <Sparkle x={6} y={23.4} r={2.3} idle delay={0.9} />
      <Rim />
    </svg>
  );
};

/* Números romanos — lápida de mármol con «XII» grabado y corona de laurel.
   Hover: la lápida sube y las ramas se abren. Reposo: titilan dos destellos. */
const leaf = (x, y, ang, len, w) => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const f = (n) => n.toFixed(2);
  const mx = x + c * len * 0.5;
  const my = y + s * len * 0.5;
  return `M${f(x)} ${f(y)} Q${f(mx - s * w)} ${f(my + c * w)} ${f(x + c * len)} ${f(y + s * len)} Q${f(mx + s * w)} ${f(my - c * w)} ${f(x)} ${f(y)} Z`;
};
const branch = (p0, p1, p2, n, len, w, spread) => {
  let d = '';
  for (let i = 1; i <= n; i += 1) {
    const t = i / n;
    const u = 1 - t;
    const bx = u * u * p0[0] + 2 * t * u * p1[0] + t * t * p2[0];
    const by = u * u * p0[1] + 2 * t * u * p1[1] + t * t * p2[1];
    const ang = Math.atan2(2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]), 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]));
    d += leaf(bx, by, ang - spread, len, w) + leaf(bx, by, ang + spread, len, w);
    if (i === n) d += leaf(bx, by, ang, len * 1.1, w);
  }
  return d;
};
const LAUREL_L = branch([22.6, 41.4], [7.6, 41.2], [5.2, 25.6], 6, 4.2, 1.6, 0.6);
const LAUREL_R = branch([25.4, 41.4], [40.4, 41.2], [42.8, 25.6], 6, 4.2, 1.6, 0.6);
const ROMAN_XII = (() => {
  const top = 16.6;
  const bot = 27.4;
  const R = (x, y, w, h) => `M${x} ${y} h${w} v${h} h${-w} Z`;
  const xc = 18.2;
  let d = `M${xc - 4.7} ${top + 1} L${xc - 2.2} ${top + 1} L${xc + 4.7} ${bot - 1} L${xc + 2.2} ${bot - 1} Z`;
  d += `M${xc + 2.7} ${top + 1} L${xc + 4.1} ${top + 1} L${xc - 2.7} ${bot - 1} L${xc - 4.1} ${bot - 1} Z`;
  d += R(xc - 5.3, top, 3.8, 1.1) + R(xc + 1.6, top, 3.8, 1.1) + R(xc - 5.3, bot - 1.1, 3.8, 1.1) + R(xc + 1.6, bot - 1.1, 3.8, 1.1);
  [26.6, 32.2].forEach((ic) => {
    d += R(ic - 1.15, top + 0.6, 2.3, bot - top - 1.2) + R(ic - 2.3, top, 4.6, 1.1) + R(ic - 2.3, bot - 1.1, 4.6, 1.1);
  });
  return d;
})();

const NumerosRomanos = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#FDE68A', '#F59E0B', '#B45309']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.45} />
        <ShadowGradient id={id('shadow')} color="#78350F" opacity={0.55} />
        <MaterialGradient id={id('marble')} light="#FFFFFF" base="#F1F5F9" dark="#CBD5E1" />
        <MaterialGradient id={id('ink')} light="#F43F5E" base="#BE123C" dark="#881337" />
        <MaterialGradient id={id('leaf')} light="#D9F99D" base="#65A30D" dark="#365314" />
        <GlossGradient id={id('gloss')} opacity={0.9} />
      </defs>

      <circle cx="24" cy="23" r="19" fill={url('aura')} />
      <ellipse cx="24" cy="41.8" rx="16" ry="2.3" fill={url('shadow')} />

      {/* lápida */}
      <g className="art-h-lift" style={{ '--lift': '-2.5px' }}>
        <rect x="8" y="13.2" width="32" height="22" rx="3.2" fill="#64748B" />
        <rect x="8" y="11" width="32" height="22" rx="3.2" fill={url('marble')} />
        <rect x="10.2" y="13.2" width="27.6" height="17.6" rx="1.8" stroke="#94A3B8" strokeOpacity="0.7" strokeWidth="0.8" />
        <rect x="10.9" y="13.9" width="27.6" height="17.6" rx="1.8" stroke="#fff" strokeWidth="0.6" />
        <path d="M11.2 29.6 C14.4 27.4 16.6 29.4 19.6 26.4 M30.4 14 C32 16.2 34.6 15.6 36.8 18.4" stroke="#94A3B8" strokeOpacity="0.45" strokeWidth="0.55" strokeLinecap="round" />
        <rect x="9.4" y="11.7" width="29.2" height="3.4" rx="1.7" fill={url('gloss')} />
        {/* numerales grabados: labio de luz + tinta */}
        <path d={ROMAN_XII} transform="translate(0.35 0.5)" fill="#fff" />
        <path d={ROMAN_XII} fill={url('ink')} />
      </g>

      {/* corona de laurel */}
      <g className="art-h-tilt" style={{ '--tilt': '-9deg', transformOrigin: '100% 100%' }}>
        <path d="M22.6 41.4 Q7.6 41.2 5.2 25.6" stroke="#365314" strokeWidth="0.9" strokeLinecap="round" />
        <path d={LAUREL_L} fill={url('leaf')} />
      </g>
      <g className="art-h-tilt-r" style={{ '--tilt': '9deg', transformOrigin: '0% 100%' }}>
        <path d="M25.4 41.4 Q40.4 41.2 42.8 25.6" stroke="#365314" strokeWidth="0.9" strokeLinecap="round" />
        <path d={LAUREL_R} fill={url('leaf')} />
      </g>
      <path d="M24 41.2 L20.4 39.4 L20.8 43.2 Z M24 41.2 L27.6 39.4 L27.2 43.2 Z" fill="#BE123C" />
      <circle cx="24" cy="41.2" r="1.3" fill="#E11D48" />

      <Sparkle x={37.6} y={12} r={2.4} idle delay={0.2} />
      <Sparkle x={7.4} y={7.6} r={2} fill="#FEF3C7" idle delay={1.5} />
      <Rim />
    </svg>
  );
};

/* ---------- Pareja mayor-menor / ordena-números ----------
   Comparten los cubos numéricos (dorado, rosa, blanco) y un glifo de porcelana
   extruido como los signos de la familia de operaciones. */
const CUBES = {
  amber: { light: '#FEF3C7', base: '#FBBF24', dark: '#D97706', top: '#FDE68A', side: '#B45309', ink: '#7C2D12' },
  pink: { light: '#FCE7F3', base: '#F472B6', dark: '#DB2777', top: '#FBCFE8', side: '#9D174D', ink: '#831843' },
  white: { light: '#FFFFFF', base: '#F8FAFC', dark: '#CBD5E1', top: '#FFFFFF', side: '#94A3B8', ink: '#334155' },
};
const CubeDefs = ({ id }) => (
  <>
    {Object.entries(CUBES).map(([k, m]) => (
      <MaterialGradient key={k} id={id(`cube-${k}`)} light={m.light} base={m.base} dark={m.dark} />
    ))}
    <GlossGradient id={id('cube-gloss')} opacity={0.7} />
  </>
);
const Cube = ({ url, m, x, y, s, k, digit, ink }) => {
  const c = CUBES[m];
  return (
    <>
      <path d={`M${x} ${y + s} V${y} L${x + k} ${y - k} H${x + s + k} V${y + s - k} L${x + s} ${y + s} Z`} fill={c.side} stroke={c.side} strokeWidth="1" strokeLinejoin="round" />
      <path d={`M${x} ${y} L${x + k} ${y - k} H${x + s + k} L${x + s} ${y} Z`} fill={c.top} stroke={c.top} strokeWidth="0.5" strokeLinejoin="round" />
      <rect x={x} y={y} width={s} height={s} rx="0.9" fill={url(`cube-${m}`)} />
      <rect x={x + 0.8} y={y + 0.7} width={s - 1.6} height={s * 0.34} rx="0.9" fill={url('cube-gloss')} />
      <path d={`M${x + k * 0.5 + 0.6} ${y - k * 0.5} H${x + s + k * 0.5 - 0.6}`} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.5" strokeLinecap="round" />
      <Num x={x + s / 2} y={y + s / 2 + 0.3} s={s * 0.68} fill={ink || c.ink}>{digit}</Num>
    </>
  );
};

/* Mayor, menor o igual — cubo grande «9», signo «>» y cubo pequeño «3».
   Hover: el cubo grande crece, el pequeño encoge y el signo da un mordisco.
   Reposo: el signo flota y titila un destello. */
const MayorMenor = () => {
  const [id, url] = useArtIds();
  const chev = 'M25 24.6 L30.2 30 L25 35.4';
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#99F6E4', '#14B8A6', '#0F766E']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.42} />
        <ShadowGradient id={id('shadow')} color="#134E4A" opacity={0.6} />
        <CubeDefs id={id} />
        <MaterialGradient id={id('chev')} light="#FFFFFF" base="#F0FDFA" dark="#99F6E4" />
      </defs>

      <circle cx="24" cy="25" r="19" fill={url('aura')} />
      <ellipse cx="24" cy="39.8" rx="20" ry="2.7" fill={url('shadow')} />

      <g className="art-h-pop art-o-bottom" style={{ '--pop': '1.08' }}>
        <Cube url={url} m="amber" x={3} y={20.6} s={17} k={3.5} digit="9" />
      </g>
      <g className="art-h-shrink art-o-bottom" style={{ '--shrink': '.86' }}>
        <Cube url={url} m="white" x={32.6} y={27.2} s={10.4} k={2.4} digit="3" ink="#0F766E" />
      </g>

      <g className="art-h-wiggle">
        <g className="art-i-bob" style={{ '--amp': '-1px', '--dur': '3.2s' }}>
          <path d={chev} transform="translate(0 2.1)" stroke="#115E59" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d={chev} stroke={url('chev')} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24.6 23.8 L27.2 26.4" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        </g>
      </g>

      <Sparkle x={39.6} y={11.6} r={2.6} idle delay={0.5} />
      <Rim />
    </svg>
  );
};

/* Ordena los números — tres cubos de menor a mayor («2», «5», «9») bajo una
   flecha ascendente de porcelana. Hover: los cubos suben en escalera.
   Reposo: la flecha flota y titila un destello. */
const OrdenaNumeros = () => {
  const [id, url] = useArtIds();
  const arrow = 'M7.8 21.6 C13 12.8 24 9.6 34.4 11.4';
  const head = 'M39.4 12.4 L34.2 15.4 L35.6 7.4 Z';
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#C7D2FE', '#6366F1', '#3730A3']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.4} />
        <ShadowGradient id={id('shadow')} color="#1E1B4B" opacity={0.6} />
        <CubeDefs id={id} />
        <MaterialGradient id={id('arrow')} light="#FFFFFF" base="#EEF2FF" dark="#C7D2FE" />
      </defs>

      <circle cx="24" cy="25" r="19" fill={url('aura')} />
      <ellipse cx="24" cy="40.4" rx="20" ry="2.6" fill={url('shadow')} />

      <g className="art-h-lift" style={{ '--lift': '-1.5px' }}>
        <Cube url={url} m="white" x={3.6} y={28.6} s={9.4} k={2.2} digit="2" ink="#4338CA" />
      </g>
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <Cube url={url} m="pink" x={14.2} y={27} s={11} k={2.5} digit="5" />
      </g>
      <g className="art-h-lift" style={{ '--lift': '-4.5px' }}>
        <Cube url={url} m="amber" x={27.2} y={25.4} s={12.6} k={2.8} digit="9" />
      </g>

      <g className="art-i-bob" style={{ '--amp': '-1.2px', '--dur': '3.6s' }}>
        <g transform="translate(0 1.8)">
          <path d={arrow} stroke="#312E81" strokeWidth="3.6" strokeLinecap="round" />
          <path d={head} fill="#312E81" stroke="#312E81" strokeWidth="1.4" strokeLinejoin="round" />
        </g>
        <path d={arrow} stroke={url('arrow')} strokeWidth="3.6" strokeLinecap="round" />
        <path d={head} fill={url('arrow')} stroke="#EEF2FF" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M9.4 18.4 C11.6 15.2 14.4 13.2 17.4 11.8" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      <Sparkle x={41.6} y={21} r={2.3} idle delay={1} />
      <Rim />
    </svg>
  );
};

/* Medidas — flexómetro amarillo con la cinta fuera y una pesa de «kg».
   Hover: la cinta sale un poco más, el flexómetro se inclina y la pesa salta.
   Reposo: la pesa flota y titila un destello. */
const Medidas = () => {
  const [id, url] = useArtIds();
  const ticks = [23.4, 25.2, 27, 28.8, 30.6, 32.4, 34.2, 36, 37.8, 39.6];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#BAE6FD', '#38BDF8', '#0369A1']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.42} />
        <ShadowGradient id={id('shadow')} color="#082F49" opacity={0.55} />
        <MaterialGradient id={id('case')} light="#FEF9C3" base="#FACC15" dark="#CA8A04" />
        <MaterialGradient id={id('metal')} light="#FFFFFF" base="#E2E8F0" dark="#94A3B8" />
        <MaterialGradient id={id('weight')} light="#C7D2FE" base="#6366F1" dark="#312E81" />
        <linearGradient id={id('tape')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      <circle cx="22" cy="25" r="18" fill={url('aura')} />
      <ellipse cx="23" cy="39.6" rx="18" ry="2.5" fill={url('shadow')} />

      {/* cinta (sale por detrás de la carcasa) */}
      <g className="art-h-slide" style={{ '--slide': '3px' }}>
        <rect x="16" y="31.4" width="25.4" height="4.8" rx="0.8" fill="#A16207" />
        <rect x="16" y="30.4" width="25.4" height="4.8" rx="0.8" fill={url('tape')} />
        {ticks.map((x, i) => (
          <path key={x} d={`M${x} 30.4 V${i % 2 ? 32 : 33.2}`} stroke="#422006" strokeOpacity="0.7" strokeWidth="0.6" />
        ))}
        <rect x="40.4" y="28.6" width="2.2" height="8" rx="0.7" fill={url('metal')} />
      </g>

      {/* carcasa */}
      <g className="art-h-tilt" style={{ '--tilt': '-7deg' }}>
        {/* parachoques de goma (negro) bajo la carcasa amarilla */}
        <rect x="3.6" y="13.4" width="23" height="23.4" rx="7" fill="#1E1B4B" />
        <rect x="3.6" y="12.4" width="23" height="23" rx="7" fill="#312E81" />
        <rect x="6" y="12.4" width="20.6" height="20.6" rx="6.2" fill={url('case')} />
        <rect x="7.6" y="13.6" width="17.4" height="5" rx="2.5" fill={url('gloss')} />
        <path d="M5.4 18 V29.6" stroke="#6366F1" strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
        {/* tapa circular con tornillo */}
        <circle cx="16.3" cy="22.7" r="6.4" fill="#EAB308" />
        <circle cx="16.3" cy="22.7" r="6.4" stroke="#A16207" strokeOpacity="0.55" strokeWidth="0.8" />
        <circle cx="16.3" cy="22.7" r="4.4" fill="#FEF08A" />
        <circle cx="16.3" cy="22.7" r="1.7" fill={url('metal')} />
        <path d="M15.4 22.7 H17.2" stroke="#64748B" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M12.2 20.4 A4.6 4.6 0 0 1 15 18.2" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />
        {/* boca de salida de la cinta y freno */}
        <rect x="21.8" y="29.6" width="5.2" height="6" rx="1.4" fill="#1E1B4B" />
        <rect x="11.8" y="10.6" width="7" height="2.6" rx="1.1" fill="#312E81" />
      </g>

      {/* pesa */}
      <g className="art-h-jump" style={{ '--jump': '-5px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.3px', '--dur': '3.8s' }}>
          <path d="M33.6 12.4 C33.6 7.4 39.4 7.4 39.4 12.4" stroke="#312E81" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 12 H41 Q42.2 12 42.5 13.2 L44.2 21.2 Q44.4 22.6 43 22.6 H30 Q28.6 22.6 28.8 21.2 L30.5 13.2 Q30.8 12 32 12 Z" fill={url('weight')} />
          <path d="M31.4 13.6 L30.1 20.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
          <Num x={36.5} y={17.6} s={5.6} fill="#fff">kg</Num>
        </g>
      </g>

      <Sparkle x={41.4} y={41.4} r={2.2} idle delay={0.7} />
      <Rim />
    </svg>
  );
};

/* Fracciones — tarta circular con un cuarto dorado que sale de su sitio.
   Hover: el cuarto se separa más en diagonal. Reposo: el cuarto respira y
   titila un destello. */
const Fracciones = () => {
  const [id, url] = useArtIds();
  const rest = 'M21.5 26.5 L34.5 26.5 A13 13 0 1 1 21.5 13.5 Z';
  const slice = 'M21.5 26.5 L21.5 13.5 A13 13 0 0 1 34.5 26.5 Z';
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#FBCFE8', '#EC4899', '#9D174D']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.42} />
        <ShadowGradient id={id('shadow')} color="#500724" opacity={0.55} />
        <MaterialGradient id={id('pie')} light="#C7D2FE" base="#6366F1" dark="#3730A3" />
        <MaterialGradient id={id('slice')} light="#FEF3C7" base="#FBBF24" dark="#D97706" />
        <GlossGradient id={id('gloss')} opacity={0.6} />
      </defs>

      <circle cx="23" cy="25" r="19" fill={url('aura')} />
      <ellipse cx="22.5" cy="42.2" rx="14" ry="2.3" fill={url('shadow')} />

      {/* tres cuartos */}
      <path d={rest} transform="translate(0 2.4)" fill="#312E81" />
      <path d={rest} fill={url('pie')} />
      <path d="M21.5 26.5 H8.5 M21.5 26.5 V39.5" stroke="#312E81" strokeOpacity="0.5" strokeWidth="0.9" />
      <path d="M21.5 27.2 H9 M22.2 26.5 V39" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.6" />
      <path d="M10.2 21 A12 12 0 0 1 19.4 14.7" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.4 33.6 A12 12 0 0 0 14.8 36.8" stroke={url('gloss')} strokeWidth="1" strokeLinecap="round" />
      <circle cx="16" cy="32" r="1.1" fill="#fff" opacity="0.35" />

      {/* cuarto que se separa */}
      <g className="art-h-lift" style={{ '--lift': '-2.6px' }}>
        <g className="art-h-slide" style={{ '--slide': '2.6px' }}>
          <g className="art-i-pulse" style={{ '--amp': '1.04', '--dur': '3.4s' }}>
            <g transform="translate(3.2 -3.2)">
              <path d={slice} transform="translate(0 2.4)" fill="#B45309" />
              <path d={slice} fill={url('slice')} />
              <path d="M22.6 15 A11.8 11.8 0 0 1 29.6 18" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round" />
              <path d="M22.2 25.8 V15" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round" />
              <circle cx="27" cy="21.4" r="1.2" fill="#FEF3C7" opacity="0.7" />
            </g>
          </g>
        </g>
      </g>

      <Sparkle x={41} y={8.6} r={2.5} idle delay={0.3} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={42.4} y={30} r={2.4} fill="#FEF3C7" /></g>
      <Rim />
    </svg>
  );
};

/* Rotaciones en la cuadrícula — pieza en L dorada, su silueta girada 90° y
   una flecha de giro. Hover: la pieza gira hasta la orientación de la silueta
   y la flecha acompaña. Reposo: la silueta brilla y titila un destello. */
const ROT_PIECE = [[8, 16], [8, 24], [16, 24]];
const ROT_GHOST = [[24, 8], [32, 8], [24, 16]];
const Rotaciones = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#F5D0FE', '#D946EF', '#86198F']} />
      <defs>
        <MaterialGradient id={id('block')} light="#FEF3C7" base="#FBBF24" dark="#D97706" />
        <linearGradient id={id('board')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4A044E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4A044E" stopOpacity="0.42" />
        </linearGradient>
        <ShadowGradient id={id('shadow')} color="#4A044E" opacity={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      {/* tablero */}
      <rect x="7" y="7" width="34" height="34" rx="5" fill={url('board')} />
      <rect x="7.4" y="7.4" width="33.2" height="33.2" rx="4.6" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
      <path d="M16 8 V40 M24 8 V40 M32 8 V40 M8 16 H40 M8 24 H40 M8 32 H40" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.6" />

      {/* silueta girada */}
      <g className="art-i-glow" style={{ '--lo': '.45', '--hi': '1', '--dur': '2.8s' }}>
        {ROT_GHOST.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x + 0.9} y={y + 0.9} width="6.2" height="6.2" rx="1.6" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="0.8" strokeDasharray="1.6 1.1" />
        ))}
      </g>

      {/* flecha de giro */}
      <g className="art-h-spin" style={{ '--spin': '40deg' }}>
        <path d="M14.2 17.6 A11 11 0 0 1 26.6 13.2" transform="translate(0 1.4)" stroke="#701A75" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M14.2 17.6 A11 11 0 0 1 26.6 13.2" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M30.4 15.2 L25.2 17.2 L26.4 10.4 Z" fill="#fff" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
      </g>

      {/* pieza en L */}
      <ellipse cx="17" cy="39.6" rx="11" ry="1.8" fill={url('shadow')} />
      <g className="art-h-spin" style={{ '--spin': '90deg' }}>
        {ROT_PIECE.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x + 0.5} y={y + 0.5} width="7" height="7" rx="1.7" fill={url('block')} />
            <rect x={x + 0.5} y={y + 0.5} width="7" height="7" rx="1.7" stroke="#92400E" strokeOpacity="0.45" strokeWidth="0.6" />
            <rect x={x + 1.3} y={y + 1.2} width="5.4" height="2.4" rx="1.1" fill={url('gloss')} />
            <path d={`M${x + 6.8} ${y + 3} V${y + 6.6} H${x + 3}`} stroke="#92400E" strokeOpacity="0.35" strokeWidth="0.8" strokeLinecap="round" />
          </g>
        ))}
      </g>

      <Sparkle x={36} y={33.6} r={2.4} idle delay={0.8} />
      <g className="art-h-burst" style={{ '--d': '.25s' }}><Sparkle x={36} y={21} r={2.6} fill="#FEF3C7" /></g>
      <Rim />
    </svg>
  );
};

/* Ordena las bolas — tres bolas de billar de menor a mayor peso (1, 2, 3).
   Hover: saltan, más alto la más ligera. Reposo: la pequeña bota suave y
   titila un destello. */
const BALLS = [
  { cx: 9.4, cy: 32.6, r: 5.9, m: ['#FEF3C7', '#FBBF24', '#B45309'], n: '1', ink: '#92400E', jump: '-7px' },
  { cx: 21.4, cy: 30.6, r: 7.9, m: ['#A5F3FC', '#06B6D4', '#155E75'], n: '2', ink: '#155E75', jump: '-5px' },
  { cx: 35.4, cy: 28.2, r: 10.3, m: ['#C7D2FE', '#6366F1', '#312E81'], n: '3', ink: '#312E81', jump: '-3px' },
];
const OrdenaBolas = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#FECACA', '#EF4444', '#991B1B']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.4} />
        <ShadowGradient id={id('shadow')} color="#450A0A" opacity={0.6} />
        {BALLS.map((b) => (
          <radialGradient key={b.n} id={id(`ball${b.n}`)} cx="0.36" cy="0.3" r="0.78">
            <stop offset="0%" stopColor={b.m[0]} />
            <stop offset="45%" stopColor={b.m[1]} />
            <stop offset="100%" stopColor={b.m[2]} />
          </radialGradient>
        ))}
        <GlossGradient id={id('gloss')} opacity={0.9} />
      </defs>

      <circle cx="24" cy="25" r="19" fill={url('aura')} />
      {BALLS.map((b) => (
        <ellipse key={b.n} cx={b.cx + 0.6} cy="38.8" rx={b.r * 0.95} ry={b.r * 0.22 + 0.6} fill={url('shadow')} />
      ))}

      {BALLS.map((b, i) => {
        const ball = (
          <>
            <circle cx={b.cx} cy={b.cy} r={b.r} fill={url(`ball${b.n}`)} />
            <path d={`M${b.cx + b.r * 0.86} ${b.cy + b.r * 0.2} A${b.r * 0.9} ${b.r * 0.9} 0 0 1 ${b.cx + b.r * 0.1} ${b.cy + b.r * 0.88}`} stroke="#fff" strokeOpacity="0.3" strokeWidth={b.r * 0.12} strokeLinecap="round" />
            <circle cx={b.cx - b.r * 0.05} cy={b.cy + b.r * 0.02} r={b.r * 0.46} fill="#fff" />
            <Num x={b.cx - b.r * 0.05} y={b.cy + b.r * 0.04} s={b.r * 0.66} fill={b.ink}>{b.n}</Num>
            <ellipse cx={b.cx - b.r * 0.4} cy={b.cy - b.r * 0.5} rx={b.r * 0.32} ry={b.r * 0.19} transform={`rotate(-32 ${b.cx - b.r * 0.4} ${b.cy - b.r * 0.5})`} fill={url('gloss')} />
          </>
        );
        return (
          <g key={b.n} className="art-h-jump" style={{ '--jump': b.jump }}>
            {i === 0 ? <g className="art-i-bob" style={{ '--amp': '-1.2px', '--dur': '2.6s' }}>{ball}</g> : ball}
          </g>
        );
      })}

      <Sparkle x={40.4} y={11} r={2.6} idle delay={0.4} />
      <Rim />
    </svg>
  );
};

/* Mesa de crafteo — mesa de trabajo de madera en isométrica, con la rejilla
   3×3 encima, y una molécula de agua flotando sobre un halo cian.
   Hover: la molécula sube y gira. Reposo: la molécula flota y el halo late. */
const MesaCrafteo = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#A5F3FC', '#818CF8', '#6D28D9']} />
      <defs>
        <ShadowGradient id={id('shadow')} color="#2E1065" opacity={0.6} />
        <GlowGradient id={id('halo')} color="#67E8F9" opacity={0.85} mid={0.4} />
        <MaterialGradient id={id('top')} light="#FDE7C2" base="#F2B66D" dark="#C47A32" />
        <MaterialGradient id={id('left')} light="#D9864A" base="#B4612D" dark="#8A4320" x1={0} y1={0} x2={1} y2={0.4} />
        <MaterialGradient id={id('right')} light="#8F4A22" base="#743817" dark="#55260E" x1={0} y1={0} x2={1} y2={0.4} />
        <radialGradient id={id('oxy')} cx="0.36" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="45%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>
        <radialGradient id={id('hyd')} cx="0.36" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>
      </defs>

      <ellipse cx="24" cy="42.2" rx="17" ry="2.6" fill={url('shadow')} />

      {/* bloque: caras izquierda y derecha con tablones */}
      <path d="M8 25 L24 33 V42 L8 34 Z" fill={url('left')} />
      <path d="M24 33 L40 25 V34 L24 42 Z" fill={url('right')} />
      <path d="M8 28 L24 36 M8 31 L24 39" stroke="#5E2A12" strokeOpacity="0.45" strokeWidth="0.6" />
      <path d="M24 36 L40 28 M24 39 L40 31" stroke="#2A1206" strokeOpacity="0.45" strokeWidth="0.6" />
      <path d="M13.4 29.7 V35.6 M33.6 29.2 V35.2" stroke="#2A1206" strokeOpacity="0.3" strokeWidth="0.6" />
      {/* tapa con rejilla 3×3 */}
      <path d="M8 25 L24 17 L40 25 L24 33 Z" fill={url('top')} />
      <path d="M11.6 25 L24 18.8 L36.4 25 L24 31.2 Z" fill="#7C3F17" opacity="0.32" />
      <path d="M15.73 22.93 L28.13 29.13 M19.87 20.87 L32.27 27.07 M15.73 27.07 L28.13 20.87 M19.87 29.13 L32.27 22.93" stroke="#6B3410" strokeOpacity="0.7" strokeWidth="0.8" />
      <path d="M8.4 24.6 L23.6 17" stroke="#fff" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M24 33.4 V41.6" stroke="#FDE7C2" strokeOpacity="0.45" strokeWidth="0.7" />

      {/* halo de energía */}
      <g className="art-i-glow" style={{ '--lo': '.55', '--hi': '1', '--dur': '2.6s' }}>
        <ellipse cx="24" cy="24.6" rx="11" ry="5.4" fill={url('halo')} />
      </g>

      {/* molécula H₂O */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-i-bob" style={{ '--amp': '-1.4px', '--dur': '3.6s' }}>
          <g className="art-h-spin" style={{ '--spin': '-24deg' }}>
            <path d="M24 11.4 L15.8 16.4 M24 11.4 L32.2 16.4" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M24 11 L15.8 16 M24 11 L32.2 16" stroke="#E2E8F0" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="15.6" cy="16.6" r="3.3" fill={url('hyd')} />
            <circle cx="32.4" cy="16.6" r="3.3" fill={url('hyd')} />
            <circle cx="24" cy="11" r="5.2" fill={url('oxy')} />
            <ellipse cx="22.2" cy="8.9" rx="1.6" ry="1.1" transform="rotate(-30 22.2 8.9)" fill="#fff" opacity="0.8" />
            <circle cx="14.6" cy="15.5" r="0.9" fill="#fff" />
            <circle cx="31.4" cy="15.5" r="0.9" fill="#fff" />
          </g>
        </g>
      </g>

      <g className="art-h-burst" style={{ '--d': '.1s' }}><Sparkle x={40.6} y={11.6} r={2.6} /></g>
      <Rim />
    </svg>
  );
};

/* Entrenador de tabla periódica — abanico de fichas de elementos con «Fe»
   delante. Hover: las fichas de atrás se abren y la de delante sube.
   Reposo: titilan dos destellos. */
const ElementCard = ({ url, fill, children }) => (
  <>
    <rect x="15" y="14.6" width="18" height="23" rx="3.4" fill="#2E1065" opacity="0.35" />
    <rect x="15" y="12.6" width="18" height="23" rx="3.4" fill={fill} />
    <rect x="15.5" y="13.1" width="17" height="22" rx="2.9" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
    <rect x="16.4" y="13.6" width="15.2" height="6" rx="2.6" fill={url('gloss')} />
    {children}
  </>
);
const EntrenadorTabla = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#E9D5FF', '#A855F7', '#6B21A8']} />
      <defs>
        <GlowGradient id={id('aura')} color="#fff" opacity={0.42} />
        <ShadowGradient id={id('shadow')} color="#3B0764" opacity={0.6} />
        <MaterialGradient id={id('front')} light="#FFFFFF" base="#F8FAFC" dark="#DDD6FE" />
        <MaterialGradient id={id('cyan')} light="#CFFAFE" base="#22D3EE" dark="#0E7490" />
        <MaterialGradient id={id('pink')} light="#FCE7F3" base="#F472B6" dark="#BE185D" />
        <MaterialGradient id={id('band')} light="#FDE68A" base="#FBBF24" dark="#D97706" x1={0} y1={0.5} x2={1} y2={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.6} />
      </defs>

      <circle cx="24" cy="25" r="19" fill={url('aura')} />
      <ellipse cx="24" cy="40.8" rx="16" ry="2.4" fill={url('shadow')} />

      {/* fichas de atrás */}
      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-9deg' }}>
        <g transform="rotate(-19 24 40)">
          <ElementCard url={url} fill={url('cyan')}>
            <Num x={18.6} y={19.4} s={6.4} fill="#fff">H</Num>
          </ElementCard>
        </g>
      </g>
      <g className="art-h-tilt-r art-o-bottom" style={{ '--tilt': '9deg' }}>
        <g transform="rotate(19 24 40)">
          <ElementCard url={url} fill={url('pink')}>
            <Num x={29.4} y={19.4} s={6.4} fill="#fff">O</Num>
          </ElementCard>
        </g>
      </g>

      {/* ficha principal */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <ElementCard url={url} fill={url('front')}>
          <rect x="15" y="31.4" width="18" height="4.2" fill={url('band')} />
          <path d="M15 31.4 H33 V32.2 Q33 35.6 29.6 35.6 H18.4 Q15 35.6 15 32.2 Z" fill={url('band')} />
          <Num x={18.9} y={16.2} s={4.2} fill="#7E22CE">26</Num>
          <Num x={24} y={24.2} s={11} fill="#3B0764">Fe</Num>
          <rect x="19.4" y="29" width="9.2" height="1.3" rx="0.65" fill="#7E22CE" opacity="0.35" />
        </ElementCard>
      </g>

      <Sparkle x={39.6} y={9.6} r={2.6} idle delay={0.2} />
      <Sparkle x={8} y={12.4} r={2} fill="#FEF3C7" idle delay={1.4} />
      <Rim />
    </svg>
  );
};

/* Sistema solar — sol con halo, dos órbitas, la Tierra y Saturno (las caras
   iluminadas miran al sol). Hover: los planetas avanzan por su órbita y el sol
   crece. Reposo: el halo del sol late y titila una estrella. */
const SistemaSolar = () => {
  const [id, url] = useArtIds();
  const stars = [[7, 9, 0.5], [40.5, 6.6, 0.6], [43, 26, 0.45], [5.4, 22, 0.4], [30, 43, 0.45], [13.6, 41.6, 0.5], [35, 37, 0.4]];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#6366F1', '#312E81', '#0F0A2E']} light={0.3} />
      <defs>
        <GlowGradient id={id('nebula')} color="#EC4899" opacity={0.4} />
        <GlowGradient id={id('halo')} color="#FBBF24" opacity={0.75} mid={0.3} />
        <radialGradient id={id('sun')} cx="0.38" cy="0.34" r="0.7">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
        <radialGradient id={id('earth')} cx="0.25" cy="0.75" r="0.85">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="45%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
        <radialGradient id={id('saturn')} cx="0.75" cy="0.25" r="0.85">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </radialGradient>
        <radialGradient id={id('mars')} cx="0.55" cy="0.85" r="0.85">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
      </defs>

      <circle cx="38" cy="38" r="16" fill={url('nebula')} />
      {stars.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.75" />)}

      {/* órbitas */}
      <circle cx="24" cy="24" r="11.5" stroke="#C7D2FE" strokeOpacity="0.35" strokeWidth="0.6" />
      <circle cx="24" cy="24" r="18" stroke="#C7D2FE" strokeOpacity="0.28" strokeWidth="0.6" strokeDasharray="1.4 1.2" />

      {/* sol */}
      <g className="art-i-glow" style={{ '--lo': '.6', '--hi': '1', '--dur': '3.2s' }}>
        <circle cx="24" cy="24" r="13" fill={url('halo')} />
      </g>
      <g className="art-h-pop" style={{ '--pop': '1.12' }}>
        <circle cx="24" cy="24" r="7.6" fill={url('sun')} />
        <path d="M19.4 21.4 A5.4 5.4 0 0 1 23 18.4" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" strokeLinecap="round" />
        <circle cx="26.6" cy="26.4" r="1.1" fill="#EA580C" opacity="0.45" />
        <circle cx="22.4" cy="27.4" r="0.7" fill="#EA580C" opacity="0.35" />
      </g>

      {/* órbita interior: la Tierra (el círculo invisible centra el giro en el sol) */}
      <g className="art-h-spin" style={{ '--spin': '-70deg' }}>
        <circle cx="24" cy="24" r="14.5" />
        <circle cx="32.8" cy="16.6" r="3.2" fill={url('earth')} />
        <path d="M31.4 15.6 Q32.6 14.6 33.6 15.8 Q33 17 31.8 16.8 Z" fill="#22C55E" opacity="0.85" />
      </g>
      {/* órbita exterior: Saturno y Marte */}
      <g className="art-h-spin" style={{ '--spin': '-36deg' }}>
        <circle cx="24" cy="24" r="22" />
        <ellipse cx="9.3" cy="34.3" rx="6.2" ry="1.9" transform="rotate(-24 9.3 34.3)" stroke="#FDE68A" strokeOpacity="0.55" strokeWidth="1.2" />
        <circle cx="9.3" cy="34.3" r="3.6" fill={url('saturn')} />
        <path d="M4 36.6 Q9.3 35.4 14.6 32" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="21" cy="6.2" r="1.9" fill={url('mars')} />
      </g>

      <Sparkle x={40.4} y={12.4} r={2.2} idle delay={0.6} />
      <Rim />
    </svg>
  );
};

/* Célula — célula animal con núcleo, retículo, mitocondrias y vesículas.
   Hover: el núcleo crece, una mitocondria se agita y una vesícula sube.
   Reposo: el nucléolo late y titila un destello. */
const Celula = () => {
  const [id, url] = useArtIds();
  const blob = 'M24 8.6 C32.6 8.2 40.2 12.8 41 21 C41.8 29.6 36.8 38 27.6 39.8 C18.4 41.6 9.2 37.4 7.6 28.6 C6 19.8 14 9 24 8.6 Z';
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <Tile id={id} url={url} c={['#D9F99D', '#84CC16', '#3F6212']} />
      <defs>
        <ShadowGradient id={id('shadow')} color="#1A2E05" opacity={0.55} />
        <MaterialGradient id={id('cyto')} light="#FFFFFF" base="#FCE7F3" dark="#F9A8D4" />
        <MaterialGradient id={id('nucleus')} light="#DDD6FE" base="#8B5CF6" dark="#4C1D95" />
        <MaterialGradient id={id('mito')} light="#FED7AA" base="#FB923C" dark="#C2410C" />
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      <ellipse cx="24.4" cy="42.4" rx="15" ry="2.3" fill={url('shadow')} />

      {/* membrana y citoplasma */}
      <path d={blob} transform="translate(0.4 2)" fill="#9D174D" opacity="0.55" />
      <path d={blob} fill={url('cyto')} />
      <path d={blob} stroke="#EC4899" strokeWidth="1.5" />
      <path d="M11.2 19.4 C13.6 14 18.4 10.8 23.6 10.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M38.6 27 C37.6 32.6 33.6 36.8 27.6 37.8" stroke="#DB2777" strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />

      {/* retículo endoplasmático */}
      <path d="M29.2 16.4 Q32.4 19.2 30 22.6 Q27.8 25.8 30.6 29.2 M32.2 15.2 Q35.6 18.6 33 22.4 Q30.8 25.6 33.6 28.6" stroke="#DB2777" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />

      {/* mitocondrias */}
      <g className="art-h-wiggle">
        <g transform="rotate(-28 31.6 32.6)">
          <rect x="26.8" y="30.2" width="9.6" height="4.8" rx="2.4" fill={url('mito')} />
          <path d="M28.4 32.6 L29.6 31.2 L30.8 34 L32 31.2 L33.2 34 L34.4 31.2 L35.2 32.6" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.6" strokeLinejoin="round" />
          <rect x="27.8" y="30.8" width="7" height="1.4" rx="0.7" fill="#fff" opacity="0.45" />
        </g>
      </g>
      <g transform="rotate(24 13.4 32)">
        <rect x="9.6" y="30.2" width="7.6" height="3.8" rx="1.9" fill={url('mito')} />
        <path d="M11 32.1 L12 31 L13 33.2 L14 31 L15 33.2 L15.8 32.1" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.55" strokeLinejoin="round" />
      </g>

      {/* núcleo */}
      <g className="art-h-pop" style={{ '--pop': '1.1' }}>
        <circle cx="20.6" cy="23.4" r="7.6" fill="#5B21B6" opacity="0.35" transform="translate(0.4 1.2)" />
        <circle cx="20.6" cy="23.4" r="7.6" fill={url('nucleus')} />
        <circle cx="20.6" cy="23.4" r="6.6" stroke="#EDE9FE" strokeOpacity="0.45" strokeWidth="0.6" strokeDasharray="1.4 1" />
        <g className="art-i-pulse" style={{ '--amp': '1.15', '--dur': '3s' }}>
          <circle cx="21.8" cy="24.6" r="2.6" fill="#3B0764" />
        </g>
        <ellipse cx="17.8" cy="19.8" rx="2.4" ry="1.4" transform="rotate(-30 17.8 19.8)" fill={url('gloss')} />
      </g>

      {/* vesículas y ribosomas */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <circle cx="35.4" cy="21.6" r="1.8" fill="#fff" stroke="#F472B6" strokeWidth="0.7" />
      </g>
      <circle cx="13.2" cy="17.4" r="1.4" fill="#fff" stroke="#F472B6" strokeWidth="0.6" />
      {[[26.6, 13.6], [12.4, 25.4], [24.4, 34.4], [36.2, 26.4], [29.6, 36]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.75" fill="#7C3AED" opacity="0.7" />
      ))}

      <Sparkle x={41.6} y={9} r={2.5} idle delay={0.5} />
      <Rim />
    </svg>
  );
};

const ICONS = {
  'comprension-oral': ComprensionOral,
  'mesa-crafteo': MesaCrafteo,
  'entrenador-tabla': EntrenadorTabla,
  'sistema-solar': SistemaSolar,
  celula: Celula,
  medidas: Medidas,
  'fracciones-eso': Fracciones,
  'rotaciones-grid': Rotaciones,
  'ordena-bolas': OrdenaBolas,
  'supermercado-matematico': Supermercado,
  'numeros-romanos': NumerosRomanos,
  'mayor-menor': MayorMenor,
  'ordena-numeros': OrdenaNumeros,
  'sumas-primaria': Sumas,
  'restas-primaria': Restas,
  'multiplicaciones-primaria': Multiplicaciones,
  'divisiones-primaria': Divisiones,
};

export default ICONS;
