// Insignias redibujadas (rediseño 2026). Formato y reglas: src/components/icons/badge/README.md
// CODES de este set: first_game, games_5, games_10, games_25, games_50, games_100, games_250, games_500, first_exam, exams_3, exams_5, exams_10, exams_25, exams_50, exams_100, perfect_1, perfect_3, perfect_5, perfect_10, perfect_25, perfect_1_app, perfect_3_apps, perfect_5_apps, apps_1, apps_3, apps_5, apps_10, apps_15, apps_20, speed_60s, speed_30s, speed_10s, speed_perf_60, speed_perf_30
//
// Cinco familias, cada una con una composición base fija que se enriquece por
// escalones (rule 4 del README):
//   · Partidas  → mando de juego + cinta con el número.
//   · Exámenes  → pila de exámenes + lápiz + sello-roseta con el número.
//   · Perfectas → estrella facetada con el número dentro.
//   · Apps      → abanico de baldosas de app + cinta con el número.
//     (Perfectas en N apps = el mismo abanico + estrella facetada con N.)
//   · Rapidez   → cronómetro con el tiempo en la esfera y anillo de progreso.
// Escalera de metal para placas: color de familia → bronce → plata → oro, y
// adornos que se van sumando: destellos, halo, rayos, laurel, ribete, corona.
import React from 'react';
import { ShadowGradient, GlowGradient, MaterialGradient, Sparkle } from '@/components/art/primitives';

// ─── utilidades ──────────────────────────────────────────────────────────────

const FONT = 'Fredoka, system-ui, sans-serif';
const rd = (v) => Math.round(v * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;
const polar = (cx, cy, r, deg) => [rd(cx + r * Math.cos(rad(deg))), rd(cy + r * Math.sin(rad(deg)))];

// .ba-anim usa transform-box: fill-box; para girar/escalar alrededor de un
// punto concreto del viewBox fijamos view-box y el origen en unidades del SVG.
const at = (x, y) => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px` });

const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
};

// Materiales: luz (arriba-izq) → base → sombra; `edge` = perfil oscuro teñido.
const MAT = {
  indigo: { light: '#C7D2FE', base: '#6366F1', dark: '#3730A3', edge: '#1E1B4B' },
  violet: { light: '#E9D5FF', base: '#8B5CF6', dark: '#5B21B6', edge: '#2E1065' },
  pink: { light: '#FBCFE8', base: '#EC4899', dark: '#9D174D', edge: '#500724' },
  emerald: { light: '#A7F3D0', base: '#10B981', dark: '#047857', edge: '#022C22' },
  cyan: { light: '#CFFAFE', base: '#22D3EE', dark: '#0E7490', edge: '#083344' },
  amber: { light: '#FEF3C7', base: '#FBBF24', dark: '#D97706', edge: '#78350F' },
  orange: { light: '#FED7AA', base: '#F97316', dark: '#C2410C', edge: '#431407' },
  bronze: { light: '#FBD5B0', base: '#D4803F', dark: '#8A4316', edge: '#3F1A06' },
  silver: { light: '#FFFFFF', base: '#B8C4D6', dark: '#5E6E85', edge: '#26334A' },
  gold: { light: '#FFF6CC', base: '#FBBF24', dark: '#B45309', edge: '#572A05' },
  wing: { light: '#FFFFFF', base: '#E0E7FF', dark: '#A5B4FC', edge: '#312E81' },
};

const mat = (id, name, key, extra) => {
  const m = MAT[key];
  return <MaterialGradient id={`${id}${name}`} light={m.light} base={m.base} dark={m.dark} {...extra} />;
};

const numText = (t, { x, y, size, fill = '#fff', edge, sw = 2.4 }) => (
  <text
    x={x}
    y={rd(y + size * 0.36)}
    textAnchor="middle"
    fontFamily={FONT}
    fontWeight="700"
    fontSize={size}
    fill={fill}
    stroke={edge}
    strokeWidth={edge ? sw : 0}
    strokeLinejoin="round"
    paintOrder="stroke"
  >
    {t}
  </text>
);

// ─── piezas comunes ──────────────────────────────────────────────────────────

// Destello de 4 puntas; con cls = null queda estático (presupuesto de animación).
const sparkle = (x, y, r, fill, cls = 'anim-twinkle') => (
  <g key={`sp${x}-${y}`} className={cls ? `ba-anim ${cls}` : undefined} style={cls ? at(x, y) : undefined}>
    <Sparkle x={x} y={y} r={r} fill={fill} />
  </g>
);

// Aura en anillo (degradado radial que solo se ilumina hacia el borde), para
// que se vea alrededor del objeto aunque este tape el centro.
const glow = (id, { x = 32, y = 30, r = 30, color = '#A78BFA', opacity = 0.55 }) => (
  <>
    <defs>
      <radialGradient id={`${id}glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={color} stopOpacity={opacity * 0.35} />
        <stop offset="0.62" stopColor={color} stopOpacity={opacity * 0.45} />
        <stop offset="0.8" stopColor={color} stopOpacity={opacity} />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id}glow)`} />
  </>
);

// Rayos en cuña (se abren hacia fuera) con degradado radial a transparente.
const rays = (id, { x = 32, y = 30, r0 = 7, r1 = 31, n = 16, color = '#FBBF24', opacity = 0.9, w = 9, spin = true }) => (
  <>
    <defs>
      <radialGradient id={`${id}ray`} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={r1}>
        <stop offset="0" stopColor={color} stopOpacity={opacity} />
        <stop offset="0.6" stopColor={color} stopOpacity={opacity * 0.5} />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <g className={spin ? 'ba-anim anim-spin' : undefined} style={spin ? at(x, y) : undefined}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * 360) / n - 90;
        const long = i % 2 === 0;
        const R = long ? r1 : r1 * 0.8;
        const hw = (long ? w : w * 0.7) / 2;
        const p0 = polar(x, y, r0, a);
        const p1 = polar(x, y, R, a - hw);
        const p2 = polar(x, y, R, a + hw);
        return <path key={i} d={`M${p0[0]} ${p0[1]} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`} fill={`url(#${id}ray)`} />;
      })}
    </g>
  </>
);

// Rama de laurel siguiendo un arco (ángulos SVG: 90 = abajo, 180 = izquierda).
const LEAF = 'M0 0 C1.9 -1.6 2 -4.6 0 -6.8 C-2 -4.6 -1.9 -1.6 0 0 Z';
const laurelBranch = (id, key, { x, y, r, from, to, leaves, metal }) => {
  const m = MAT[metal];
  const dir = Math.sign(to - from);
  const items = [];
  for (let i = 0; i < leaves; i += 1) {
    const th = from + ((to - from) * (i + 0.6)) / leaves;
    const side = i % 2 ? 1 : -1;
    const tx = -Math.sin(rad(th)) * dir;
    const ty = Math.cos(rad(th)) * dir;
    const nx = Math.cos(rad(th));
    const ny = Math.sin(rad(th));
    const tilt = rad(38);
    const dx = tx * Math.cos(tilt) + nx * Math.sin(tilt) * side;
    const dy = ty * Math.cos(tilt) + ny * Math.sin(tilt) * side;
    const rot = rd((Math.atan2(dx, -dy) * 180) / Math.PI);
    const [px, py] = polar(x, y, r + side * 0.7, th);
    items.push(
      <path
        key={i}
        d={LEAF}
        transform={`translate(${px} ${py}) rotate(${rot}) scale(1.25)`}
        fill={`url(#${id}leaf)`}
        stroke={m.edge}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />,
    );
  }
  const [sx, sy] = polar(x, y, r, from);
  const [ex, ey] = polar(x, y, r, to - (to - from) * 0.08);
  const sweep = dir > 0 ? 1 : 0;
  return (
    <g key={key}>
      <path d={`M${sx} ${sy} A${r} ${r} 0 0 ${sweep} ${ex} ${ey}`} stroke={m.edge} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d={`M${sx} ${sy} A${r} ${r} 0 0 ${sweep} ${ex} ${ey}`} stroke={m.base} strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {items}
    </g>
  );
};

const laurel = (id, { x = 32, y = 31, r = 26, metal = 'gold', leaves = 7, span = [102, 214] }) => (
  <>
    <defs>{mat(id, 'leaf', metal)}</defs>
    {laurelBranch(id, 'l', { x, y, r, from: span[0], to: span[1], leaves, metal })}
    {laurelBranch(id, 'r', { x, y, r, from: 180 - span[0], to: 180 - span[1], leaves, metal })}
  </>
);

const gem = (key, x, y, r, color, dark) => (
  <g key={key}>
    <circle cx={x} cy={y} r={r} fill={color} stroke={dark} strokeWidth="0.8" />
    <path d={`M${x - r * 0.75} ${y} L${x} ${y - r * 0.75} L${x + r * 0.75} ${y} Z`} fill="#fff" opacity="0.28" />
    <circle cx={rd(x - r * 0.35)} cy={rd(y - r * 0.35)} r={rd(r * 0.32)} fill="#fff" opacity="0.9" />
  </g>
);

const crown = (id, { x = 32, y = 10, s = 1 }) => (
  <>
    <defs>
      {mat(id, 'crn', 'gold')}
      {mat(id, 'crnb', 'gold', { y1: 0, y2: 1, x1: 0, x2: 0 })}
    </defs>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-9.6 4 L-11 -5.6 L-4.8 -1 L0 -8 L4.8 -1 L11 -5.6 L9.6 4 Z" fill={`url(#${id}crn)`} stroke={MAT.gold.edge} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-8.6 2.4 L-9.4 -3.2 L-4.8 0.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="-10" y="2" width="20" height="4.6" rx="1.6" fill={`url(#${id}crnb)`} stroke={MAT.gold.edge} strokeWidth="1.3" />
      {gem('g1', 0, 4.3, 1.7, '#F43F5E', '#881337')}
      {gem('g2', -5.6, 4.3, 1.2, '#22D3EE', '#155E75')}
      {gem('g3', 5.6, 4.3, 1.2, '#34D399', '#065F46')}
      <circle cx="-11" cy="-5.6" r="1.6" fill="#FEF3C7" stroke={MAT.gold.edge} strokeWidth="0.9" />
      <circle cx="0" cy="-8" r="1.8" fill="#FEF3C7" stroke={MAT.gold.edge} strokeWidth="0.9" />
      <circle cx="11" cy="-5.6" r="1.6" fill="#FEF3C7" stroke={MAT.gold.edge} strokeWidth="0.9" />
    </g>
  </>
);

// Cinta con el número (placa común de Partidas y Apps).
const ribbon = (id, { n, metal = 'gold', x = 32, y = 50, size = 14, gleam = true }) => {
  const m = MAT[metal];
  const t = String(n);
  const w = rd(4.8 + t.length * size * 0.31);
  const h = 12.6;
  const sag = 1.6;
  const top = y - h / 2;
  const bot = y + h / 2;
  // las colas asoman por detrás, más abajo y hacia fuera
  const tTop = top + 4.6;
  const tBot = bot + 2.6;
  const tw = 7.6;
  const tail = (d) => {
    const ex = x + d * w;
    const ox = ex + d * tw;
    const ix = ex - d * 2.6;
    return `M${ix} ${tTop} L${ox} ${tTop} L${ox - d * 2.9} ${rd((tTop + tBot) / 2)} L${ox} ${tBot} L${ix} ${tBot} Z`;
  };
  // pliegue: la parte de la cola que se dobla hacia la banda (cara oscura)
  const fold = (d) => {
    const ex = x + d * w;
    const ix = ex - d * 2.6;
    return `M${ex} ${bot - 1} L${ex} ${tBot} L${ix} ${tBot} L${ix} ${bot + sag} Z`;
  };
  const arc = (yy) => `M${x - w} ${yy} Q${x} ${yy + sag * 2} ${x + w} ${yy}`;
  const band = `${arc(top)} L${x + w} ${bot} Q${x} ${bot + sag * 2} ${x - w} ${bot} Z`;
  return (
    <>
      <defs>
        {mat(id, 'rbn', metal, { x1: 0, y1: 0, x2: 0.2, y2: 1 })}
        <linearGradient id={`${id}rbt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.base} />
          <stop offset="1" stopColor={m.dark} />
        </linearGradient>
        <clipPath id={`${id}rbc`}>
          <path d={band} />
        </clipPath>
      </defs>
      <path d={tail(-1)} fill={`url(#${id}rbt)`} stroke={m.edge} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={tail(1)} fill={`url(#${id}rbt)`} stroke={m.edge} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={fold(-1)} fill={m.edge} />
      <path d={fold(1)} fill={m.edge} />
      <path d={band} fill={`url(#${id}rbn)`} />
      <g clipPath={`url(#${id}rbc)`}>
        <path d={`${arc(top)} L${x + w} ${top + 3.4} Q${x} ${top + 3.4 + sag * 2} ${x - w} ${top + 3.4} Z`} fill="#fff" opacity="0.45" />
        <path d={`${arc(bot - 2.2)} L${x + w} ${bot + 3} L${x - w} ${bot + 3} Z`} fill={m.dark} opacity="0.4" />
        {metal === 'gold' && gleam && (
          <g className="ba-anim anim-gleam" style={at(x, y)}>
            <rect x={x - 3} y={top - 4} width="4.4" height={h + 8} fill="#fff" opacity="0.7" transform="skewX(-24)" />
          </g>
        )}
      </g>
      <path d={band} fill="none" stroke={m.edge} strokeWidth="1.6" strokeLinejoin="round" />
      {numText(t, { x, y: y + sag * 0.9, size, edge: m.edge, sw: 2.8 })}
    </>
  );
};

// ─── PARTIDAS: mando ─────────────────────────────────────────────────────────

const PAD = 'M-12 -11 C-4 -12.6 4 -12.6 12 -11 C18 -10.4 21.2 -7 22.2 -1.5 L23.8 7.5 C24.8 13.2 20.4 16.4 16.6 13.4 L11.4 8.6 C7.4 6.4 -7.4 6.4 -11.4 8.6 L-16.6 13.4 C-20.4 16.4 -24.8 13.2 -23.8 7.5 L-22.2 -1.5 C-21.2 -7 -18 -10.4 -12 -11 Z';
const DPAD = 'M-1.9 -5.6 H1.9 V-1.9 H5.6 V1.9 H1.9 V5.6 H-1.9 V1.9 H-5.6 V-1.9 H-1.9 Z';
const PAD_BTNS = [
  [0, -4.3, '#FCD34D', '#92400E'],
  [4.3, 0, '#F472B6', '#831843'],
  [-4.3, 0, '#67E8F9', '#155E75'],
  [0, 4.3, '#34D399', '#065F46'],
];

const gamepad = (id, { x = 32, y = 26, s = 0.9, trim = false, gems = false }) => {
  const m = MAT.indigo;
  return (
    <>
      <defs>
        {mat(id, 'pad', 'indigo')}
        {trim && mat(id, 'padt', 'gold')}
        <clipPath id={`${id}padc`}>
          <path d={PAD} />
        </clipPath>
        <radialGradient id={`${id}core`} cx="0.38" cy="0.32" r="0.7">
          <stop offset="0" stopColor="#ECFEFF" />
          <stop offset="0.45" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#0E7490" />
        </radialGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d={PAD} fill={m.dark} />
        <g clipPath={`url(#${id}padc)`}>
          <path d={PAD} transform="translate(-1.3 -2.8)" fill={`url(#${id}pad)`} />
          {trim && <path d={PAD} fill="none" stroke={`url(#${id}padt)`} strokeWidth="3.6" />}
          <path d="M-16 -8.6 C-6 -11.6 6 -11.6 16 -8.6 C11 -5.8 -11 -5.8 -16 -8.6 Z" fill="#fff" opacity="0.4" />
        </g>
        <path d={PAD} fill="none" stroke={m.edge} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-21.4 3 L-20.6 -2.2 C-19.6 -6.6 -16.6 -9 -12 -9.6" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        {/* cruceta */}
        <g transform="translate(-12.6 -0.4)">
          <path d={DPAD} transform="translate(0.5 0.9)" fill={m.edge} opacity="0.35" />
          <path d={DPAD} fill="#272361" stroke="#1E1B4B" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M-0.9 -4.6 V-2.2 M-4.6 -0.9 H-2.2" stroke="#A5B4FC" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
        </g>
        {/* botones */}
        <g transform="translate(12.6 -0.4)">
          {PAD_BTNS.map(([bx, by, c, d]) => (
            <g key={`${bx}${by}`}>
              <circle cx={bx + 0.3} cy={by + 0.7} r="2.6" fill={m.edge} opacity="0.4" />
              <circle cx={bx} cy={by} r="2.55" fill={c} stroke={d} strokeWidth="1" />
              <circle cx={bx - 0.8} cy={by - 0.85} r="0.85" fill="#fff" opacity="0.85" />
            </g>
          ))}
        </g>
        {/* núcleo cian (como la mascota) y select/start */}
        <circle cx="0" cy="-4.4" r="2.9" fill={m.edge} opacity="0.55" />
        <circle cx="0" cy="-4.4" r="2.2" fill={gems ? '#F43F5E' : `url(#${id}core)`} stroke={gems ? '#881337' : '#164E63'} strokeWidth="0.8" />
        <circle cx="-0.7" cy="-5.1" r="0.7" fill="#fff" opacity="0.9" />
        <rect x="-6.6" y="1" width="3.8" height="1.9" rx="0.95" fill={m.edge} opacity="0.75" />
        <rect x="2.8" y="1" width="3.8" height="1.9" rx="0.95" fill={m.edge} opacity="0.75" />
        {gems && (
          <>
            {gem('gl', -19.6, 9.6, 1.6, '#22D3EE', '#155E75')}
            {gem('gr', 19.6, 9.6, 1.6, '#34D399', '#065F46')}
          </>
        )}
      </g>
    </>
  );
};

const GAMES = {
  first_game: { n: 1, metal: 'indigo', tier: 1 },
  games_5: { n: 5, metal: 'bronze', tier: 2 },
  games_10: { n: 10, metal: 'bronze', tier: 3 },
  games_25: { n: 25, metal: 'silver', tier: 4 },
  games_50: { n: 50, metal: 'silver', tier: 5 },
  games_100: { n: 100, metal: 'gold', tier: 6 },
  games_250: { n: 250, metal: 'gold', tier: 7 },
  games_500: { n: 500, metal: 'gold', tier: 8 },
};

const gamesBadge = (id, { n, metal, tier }) => {
  const top = tier >= 8;
  const padY = top ? 27.5 : 25;
  return (
    <>
      {tier >= 3 && tier < 5 && glow(id, { y: 27, r: tier >= 4 ? 31 : 29, color: '#818CF8', opacity: tier >= 4 ? 0.65 : 0.5 })}
      {tier === 5 && rays(id, { y: 26, color: '#8B5CF6', opacity: 0.6, n: 16 })}
      {tier >= 6 && rays(id, { y: 26, color: '#F59E0B', opacity: 0.8, n: tier >= 7 ? 20 : 16 })}
      {tier >= 6 && laurel(id, { y: 30, r: 27.5, leaves: 7, span: [112, 208] })}
      <g className="ba-anim anim-bob" style={at(32, padY)}>
        {gamepad(id, { y: padY, s: top ? 0.9 : 0.98, trim: tier >= 7, gems: top })}
      </g>
      {top && crown(id, { y: 10.5, s: 0.95 })}
      {ribbon(id, { n, metal, y: 49.5 })}
      {/* presupuesto: mando + (destellos | rayos + destello | rayos + brillo de la cinta) */}
      {sparkle(top ? 52 : 53, top ? 8 : 10, 3.2, '#FBBF24', tier >= 6 ? null : 'anim-twinkle')}
      {tier >= 2 && sparkle(top ? 12 : 10, top ? 8 : 12, 2.5, '#F472B6', tier >= 5 ? null : 'anim-twinkle-2')}
      {tier >= 4 && !top && sparkle(32, 5.5, 2.1, '#22D3EE', null)}
    </>
  );
};

// ─── EXÁMENES: pila + lápiz + sello ──────────────────────────────────────────

const SHEET = 'M-14 -15.6 Q-14 -18.6 -11 -18.6 L8.4 -18.6 L14 -13 L14 15.6 Q14 18.6 11 18.6 L-11 18.6 Q-14 18.6 -14 15.6 Z';
const BACK_TINTS = ['#C7D2FE', '#FBCFE8', '#A5F3FC'];

const sheetStack = (id, { x = 26, y = 28, sheets = 1 }) => (
  <>
    <defs>
      <linearGradient id={`${id}paper`} x1="0.1" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#F8FAFC" />
        <stop offset="1" stopColor="#DCE3F0" />
      </linearGradient>
      {mat(id, 'hdr', 'emerald', { x1: 0, y1: 0, x2: 1, y2: 0.4 })}
    </defs>
    {Array.from({ length: sheets - 1 }, (_, k) => {
      const i = sheets - 1 - k;
      return (
        <g key={i} transform={`translate(${x - i * 2.3} ${y + i * 0.2}) rotate(${-6 - i * 6.5})`}>
          <path d={SHEET} fill={BACK_TINTS[(i - 1) % 3]} stroke="#312E81" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M-9 -9 H8 M-9 -3 H8" stroke="#6366F1" strokeOpacity="0.25" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      );
    })}
    <g transform={`translate(${x} ${y}) rotate(-6)`}>
      <path d={SHEET} fill={`url(#${id}paper)`} stroke="#312E81" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M-12.2 14.6 L-12.2 -14.6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
      {/* esquina doblada */}
      <path d="M8.4 -18.6 L8.4 -14.6 Q8.4 -13 10 -13 L14 -13 Z" fill="#C7D2FE" stroke="#312E81" strokeWidth="1.1" strokeLinejoin="round" />
      {/* cabecera */}
      <rect x="-10.6" y="-15.2" width="15" height="4.6" rx="1.6" fill={`url(#${id}hdr)`} />
      <rect x="-9.2" y="-14" width="7" height="1.2" rx="0.6" fill="#fff" opacity="0.75" />
      {/* respuestas con su check */}
      {[-5.6, 1.4, 8.4].map((ry) => (
        <g key={ry}>
          <rect x="-10.6" y={ry - 2.3} width="4.6" height="4.6" rx="1.2" fill="#ECFDF5" stroke="#047857" strokeWidth="0.9" />
          <path d={`M-9.7 ${ry} L-8.5 ${ry + 1.3} L-6.2 ${ry - 1.6}`} stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d={`M-3.6 ${ry - 0.8} H9.6 M-3.6 ${ry + 1.6} H5.6`} stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
    </g>
  </>
);

// Lápiz de (x1,y1) [goma] a (x2,y2) [punta].
const pencil = (id, { x1, y1, x2, y2 }) => {
  const L = rd(Math.hypot(x2 - x1, y2 - y1));
  const ang = rd((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI);
  return (
    <>
      <defs>
        {mat(id, 'pcl', 'amber', { x1: 0, y1: 0, x2: 0, y2: 1 })}
        {mat(id, 'pcf', 'silver', { x1: 0, y1: 0, x2: 0, y2: 1 })}
        {mat(id, 'pce', 'pink', { x1: 0, y1: 0, x2: 0, y2: 1 })}
      </defs>
      <g transform={`translate(${x1} ${y1}) rotate(${ang})`}>
        <rect x="-0.4" y="-3.1" width="5" height="6.2" rx="2" fill={`url(#${id}pce)`} stroke="#831843" strokeWidth="1" />
        <rect x="3.6" y="-3.2" width="3.8" height="6.4" fill={`url(#${id}pcf)`} stroke="#334155" strokeWidth="1" />
        <path d="M4.9 -3 V3 M6.1 -3 V3" stroke="#64748B" strokeWidth="0.8" />
        <path d={`M7.4 -3.1 H${L - 7.2} L${L - 7.2} 3.1 H7.4 Z`} fill={`url(#${id}pcl)`} stroke="#92400E" strokeWidth="1" strokeLinejoin="round" />
        <path d={`M7.8 -1.4 H${L - 7.6}`} stroke="#fff" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d={`M7.8 1.3 H${L - 7.6}`} stroke="#B45309" strokeOpacity="0.6" strokeWidth="0.9" />
        <path d={`M${L - 7.2} -3.1 L${L - 1.4} -0.7 L${L - 1.4} 0.7 L${L - 7.2} 3.1 Z`} fill="#FCD9A8" stroke="#92400E" strokeWidth="1" strokeLinejoin="round" />
        <path d={`M${L - 3.2} -1.45 L${L} 0 L${L - 3.2} 1.45 Z`} fill="#334155" stroke="#1E293B" strokeWidth="0.8" strokeLinejoin="round" />
      </g>
    </>
  );
};

// Sello-roseta festoneado con el número y cintas.
const scallop = (x, y, R, bumps = 16) => {
  let d = '';
  for (let i = 0; i < bumps; i += 1) {
    const a0 = (i * 360) / bumps - 90;
    const a1 = ((i + 0.5) * 360) / bumps - 90;
    const a2 = ((i + 1) * 360) / bumps - 90;
    const v0 = polar(x, y, R - 1.1, a0);
    const c = polar(x, y, R + 1.4, a1);
    const v1 = polar(x, y, R - 1.1, a2);
    d += `${i === 0 ? `M${v0[0]} ${v0[1]}` : ''} Q${c[0]} ${c[1]} ${v1[0]} ${v1[1]}`;
  }
  return `${d} Z`;
};

const rosette = (id, { n, metal, x = 45, y = 45, R = 12.8, tails = 'emerald' }) => {
  const m = MAT[metal];
  const t = String(n);
  const tm = MAT[tails];
  const fs = t.length >= 3 ? 9.6 : t.length === 2 ? 12 : 13.5;
  const tail = (d) => `M${x + d * 3.4} ${y + 3} L${x + d * 9.6} ${y + R + 2} L${x + d * 6} ${y + R + 0.6} L${x + d * 4.2} ${y + R + 4} L${x - d * 1.4} ${y + 4} Z`;
  return (
    <>
      <defs>
        {mat(id, 'ros', metal)}
        {mat(id, 'rosi', metal, { x1: 0.85, y1: 1, x2: 0.15, y2: 0 })}
        {mat(id, 'rost', tails, { x1: 0, y1: 0, x2: 1, y2: 0 })}
      </defs>
      <path d={tail(-1)} fill={`url(#${id}rost)`} stroke={tm.edge} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={tail(1)} fill={`url(#${id}rost)`} stroke={tm.edge} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={scallop(x, y, R, 18)} fill={`url(#${id}ros)`} stroke={m.edge} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={x} cy={y} r={R - 2.8} fill={`url(#${id}rosi)`} stroke={m.edge} strokeWidth="1" />
      <circle cx={x} cy={y} r={R - 4} fill={`url(#${id}ros)`} />
      <path d={`M${x - R + 5.2} ${y - 1.6} A${R - 5} ${R - 5} 0 0 1 ${x - 1.6} ${y - R + 5.2}`} stroke="#fff" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {numText(t, { x, y: y + 0.3, size: fs, edge: m.edge, sw: 2.6 })}
    </>
  );
};

const mortarboard = (id, { x, y, s = 1 }) => (
  <>
    <defs>{mat(id, 'cap', 'indigo')}</defs>
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-10)`}>
      <path d="M-6.4 0.6 L-6.4 5.4 Q0 8.6 6.4 5.4 L6.4 0.6 Z" fill={MAT.indigo.dark} stroke={MAT.indigo.edge} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M0 -6.2 L12.6 -0.8 L0 4.6 L-12.6 -0.8 Z" fill={`url(#${id}cap)`} stroke={MAT.indigo.edge} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M-9.8 -0.9 L0 -5" stroke="#fff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
      <circle cx="0" cy="-0.8" r="1.2" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
      <g>
        <path d="M0 -0.8 Q7 -0.6 9 3.6 L9 7.4" stroke="#FBBF24" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M7.8 7 L10.2 7 L10.8 10.6 L7.2 10.6 Z" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" strokeLinejoin="round" />
      </g>
    </g>
  </>
);

const EXAMS = {
  first_exam: { n: 1, metal: 'emerald', tier: 1, sheets: 1 },
  exams_3: { n: 3, metal: 'bronze', tier: 2, sheets: 2 },
  exams_5: { n: 5, metal: 'bronze', tier: 3, sheets: 3 },
  exams_10: { n: 10, metal: 'silver', tier: 4, sheets: 3 },
  exams_25: { n: 25, metal: 'silver', tier: 5, sheets: 4 },
  exams_50: { n: 50, metal: 'gold', tier: 6, sheets: 4 },
  exams_100: { n: 100, metal: 'gold', tier: 7, sheets: 4 },
};

const examsBadge = (id, { n, metal, tier, sheets }) => (
  <>
    {tier >= 4 && tier < 6 && glow(id, { x: 30, y: 30, r: 30, color: '#10B981', opacity: 0.4 })}
    {tier >= 6 && rays(id, { x: 29, y: 29, color: '#F59E0B', opacity: 0.8, n: tier >= 7 ? 20 : 16 })}
    {sheetStack(id, { x: 24.5, y: 28.5, sheets })}
    <g className="ba-anim anim-wave" style={at(42, 31)}>
      {pencil(id, { x1: 58.5, y1: 6.5, x2: 41.5, y2: 31 })}
    </g>
    {tier >= 7 && mortarboard(id, { x: 15, y: 10, s: 0.95 })}
    <g className="ba-anim anim-pulse" style={at(45, 44.5)}>
      {rosette(id, { n, metal, x: 45, y: 44.5 })}
    </g>
    {tier >= 2 && sparkle(7, 47, 2.6, '#34D399', tier >= 6 ? null : 'anim-twinkle-2')}
    {tier >= 3 && sparkle(tier >= 7 ? 30 : 9, tier >= 7 ? 4.5 : 8, 2.4, '#FBBF24', null)}
  </>
);

// ─── PERFECTAS: estrella facetada ────────────────────────────────────────────

const starPts = (x, y, R, r) => Array.from({ length: 10 }, (_, i) => polar(x, y, i % 2 ? r : R, -90 + i * 36));

const STAR_PAL = {
  gold: { light: '#FFF7D1', base: '#FBBF24', dark: '#C2620A', edge: '#5C2A04' },
  pink: { light: '#FFE4F1', base: '#F472B6', dark: '#BE185D', edge: '#500724' },
  violet: { light: '#EDE9FE', base: '#A78BFA', dark: '#6D28D9', edge: '#2E1065' },
  cyan: { light: '#E0FDFF', base: '#22D3EE', dark: '#0E7490', edge: '#083344' },
  gem: { light: '#FCE7F3', base: '#C084FC', dark: '#6D28D9', edge: '#3B0764' },
};

const facetStar = (key, { x, y, R, r, pal = 'gold', edgeW = 2, gloss = true }) => {
  const p = STAR_PAL[pal];
  const pts = starPts(x, y, R, r);
  const L = [-0.6, -0.8];
  return (
    <g key={key}>
      <path d={`M${pts.map((q) => q.join(' ')).join(' L')} Z`} fill={p.edge} stroke={p.edge} strokeWidth={edgeW * 2} strokeLinejoin="round" />
      {pts.map((a, i) => {
        const b = pts[(i + 1) % 10];
        let nx = b[1] - a[1];
        let ny = -(b[0] - a[0]);
        if (nx * ((a[0] + b[0]) / 2 - x) + ny * ((a[1] + b[1]) / 2 - y) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const d = (nx * L[0] + ny * L[1]) / Math.hypot(nx, ny);
        const t = (d + 1) / 2;
        const fill = t > 0.5 ? mix(p.base, p.light, (t - 0.5) * 2) : mix(p.dark, p.base, t * 2);
        return <path key={i} d={`M${x} ${y} L${a[0]} ${a[1]} L${b[0]} ${b[1]} Z`} fill={fill} stroke={fill} strokeWidth="0.4" strokeLinejoin="round" />;
      })}
      {gloss && <ellipse cx={rd(x - R * 0.36)} cy={rd(y - R * 0.3)} rx={rd(R * 0.12)} ry={rd(R * 0.07)} transform={`rotate(-35 ${rd(x - R * 0.36)} ${rd(y - R * 0.3)})`} fill="#fff" opacity="0.85" />}
    </g>
  );
};

const PERFECT = {
  perfect_1: { n: 1, tier: 1 },
  perfect_3: { n: 3, tier: 2 },
  perfect_5: { n: 5, tier: 3 },
  perfect_10: { n: 10, tier: 4 },
  perfect_25: { n: 25, tier: 5 },
};

const MINI = [
  [9.8, 45.5, 6.2, 'pink'],
  [54.2, 45.5, 6.2, 'pink'],
  [11.2, 12.5, 5.2, 'violet'],
  [52.8, 12.5, 5.2, 'violet'],
];

const perfectBadge = (id, { n, tier }) => {
  const minis = tier >= 3 ? 4 : tier === 2 ? 2 : 0;
  const t = String(n);
  const pal = tier >= 5 ? 'gem' : 'gold';
  const cy = 33.5;
  return (
    <>
      <defs>
        <ShadowGradient id={`${id}shd`} color="#3B0764" opacity={0.42} />
      </defs>
      {tier <= 3 && glow(id, { y: cy, r: 29, color: '#F472B6', opacity: 0.5 })}
      {tier >= 4 && rays(id, { y: cy, color: tier >= 5 ? '#A855F7' : '#F59E0B', opacity: 0.8, n: 20 })}
      {tier >= 5 && laurel(id, { y: cy + 1, r: 27, leaves: 7, span: [104, 200] })}
      <ellipse cx="32" cy="57" rx="16" ry="2.8" fill={`url(#${id}shd)`} />
      <g className="ba-anim anim-pulse" style={at(32, cy)}>
        {facetStar('big', { x: 32, y: cy, R: 24.5, r: 12.6, pal, edgeW: 1.1 })}
        {tier >= 5 && gem('gm', 32, 15.5, 2, '#F43F5E', '#881337')}
        {numText(t, { x: 32, y: cy + 1.4, size: t.length > 1 ? 15 : 17.5, edge: STAR_PAL[pal].edge, sw: 3 })}
      </g>
      {MINI.slice(tier >= 5 ? 2 : 0, minis).map(([mx, my, mr, mp], i) => (
        <g key={i} className={i < (tier >= 4 ? 1 : 2) ? `ba-anim ${i % 2 ? 'anim-twinkle-2' : 'anim-twinkle-3'}` : undefined} style={at(mx, my)}>
          {facetStar(`m${i}`, { x: mx, y: my, R: mr, r: mr * 0.5, pal: tier >= 5 ? 'gold' : mp, edgeW: 0.8, gloss: false })}
        </g>
      ))}
      {tier <= 1 && sparkle(52, 12, 3.2, '#F472B6')}
      {tier <= 1 && sparkle(11, 44, 2.4, '#A78BFA', 'anim-twinkle-2')}
    </>
  );
};

// ─── APPS: abanico de baldosas ───────────────────────────────────────────────

const TILE_KINDS = ['indigo', 'pink', 'amber', 'cyan', 'emerald'];

const tileGlyph = (kind) => {
  const sh = { fill: '#fff' };
  switch (kind) {
    case 'pink':
      return <text x="0" y="4.1" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="11.5" {...sh}>A</text>;
    case 'amber':
      return <path d="M-1.6 -4.6 H1.6 V-1.6 H4.6 V1.6 H1.6 V4.6 H-1.6 V1.6 H-4.6 V-1.6 H-1.6 Z" {...sh} />;
    case 'cyan':
      return (
        <>
          <ellipse cx="-1.9" cy="3" rx="2.5" ry="2" transform="rotate(-20 -1.9 3)" {...sh} />
          <path d="M-0.2 3 V-4.8 Q2.8 -4.2 3.8 -1.4 Q2.2 -2.6 1.4 -2.6 V3 Z" {...sh} />
        </>
      );
    case 'emerald':
      return (
        <g stroke="#fff" strokeWidth="1.3" fill="none">
          <circle r="4.4" />
          <ellipse rx="1.9" ry="4.4" />
          <path d="M-4.4 0 H4.4" />
        </g>
      );
    default:
      return <path d="M-2.4 -4.2 L4.4 0 L-2.4 4.2 Z" fill="#fff" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />;
  }
};

const tile = (id, key, { x, y, size, rot, kind, star }) => {
  const m = MAT[kind];
  return (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot}) scale(${rd(size / 16)})`}>
      <rect x="-8" y="-8" width="16" height="16" rx="4.4" fill={m.dark} />
      <rect x="-8" y="-8" width="16" height="14.4" rx="4.4" fill={`url(#${id}t${kind})`} />
      <path d="M-6.8 -4.6 Q-6.8 -6.8 -4.6 -6.8 H4.6 Q6.8 -6.8 6.8 -4.6 Q0 -2.6 -6.8 -4.6 Z" fill="#fff" opacity="0.38" />
      <rect x="-8" y="-8" width="16" height="16" rx="4.4" fill="none" stroke={m.edge} strokeWidth="1.5" />
      <g transform="translate(0 -0.6)" opacity="0.4">
        <g transform="translate(0 1)">{tileGlyph(kind)}</g>
      </g>
      <g transform="translate(0 -0.6)">{tileGlyph(kind)}</g>
      {star && facetStar('s', { x: 5.6, y: -5.6, R: 3.8, r: 1.9, pal: 'gold', edgeW: 0.7, gloss: false })}
    </g>
  );
};

// Posiciones del abanico [hueco, ángulo, tamaño] (de fuera hacia dentro; la
// central se pinta la última).
const FAN = {
  1: [[0, 0, 26]],
  3: [[-1, -27, 18.5], [1, 27, 18.5], [0, 0, 22]],
  5: [[-2, -44, 15.5], [2, 44, 15.5], [-1, -23, 17.5], [1, 23, 17.5], [0, 0, 21]],
};
const FAN_KIND = { 0: 'indigo', '-1': 'pink', 1: 'amber', '-2': 'cyan', 2: 'emerald' };

const fan = (id, { count, px = 32, py = 58, dist = 32, k = 1, star = false }) => (
  <>
    <defs>
      {TILE_KINDS.map((kind) => <React.Fragment key={kind}>{mat(id, `t${kind}`, kind)}</React.Fragment>)}
    </defs>
    {FAN[count].map(([slot, a, size]) => {
      const d = count === 1 ? dist + 1 : dist;
      const [x, y] = polar(px, py, d, a - 90);
      return tile(id, `t${slot}`, { x, y, size: size * k, rot: a, kind: FAN_KIND[slot], star });
    })}
  </>
);

const APPS = {
  apps_1: { n: 1, metal: 'cyan', tier: 1, count: 1 },
  apps_3: { n: 3, metal: 'bronze', tier: 2, count: 3 },
  apps_5: { n: 5, metal: 'bronze', tier: 3, count: 5 },
  apps_10: { n: 10, metal: 'silver', tier: 4, count: 5 },
  apps_15: { n: 15, metal: 'gold', tier: 5, count: 5 },
  apps_20: { n: 20, metal: 'gold', tier: 6, count: 5 },
};

// Rosa de los vientos (exploración) detrás del abanico en el escalón más alto:
// esfera con marcas y puntas cardinales que sobresalen.
const compass = (id, { x = 32, y = 27, R = 30 }) => (
  <>
    <defs>
      {mat(id, 'cmp', 'gold')}
      <GlowGradient id={`${id}cmpg`} color="#22D3EE" opacity={0.45} mid={0.55} />
    </defs>
    <circle cx={x} cy={y} r={R - 4} fill={`url(#${id}cmpg)`} />
    <g className="ba-anim anim-spin" style={at(x, y)}>
      <circle cx={x} cy={y} r={R - 6.5} fill="none" stroke={MAT.gold.edge} strokeWidth="3.4" />
      <circle cx={x} cy={y} r={R - 6.5} fill="none" stroke={`url(#${id}cmp)`} strokeWidth="1.8" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = i * 22.5;
        if (i % 4 === 0) return null;
        const p = polar(x, y, R - 6.5, a);
        return <circle key={i} cx={p[0]} cy={p[1]} r="0.9" fill={MAT.gold.edge} />;
      })}
      {[0, 90, 180, 270].map((a) => {
        const p = polar(x, y, R, a - 90);
        const l = polar(x, y, R - 9, a - 99);
        const r = polar(x, y, R - 9, a - 81);
        return <path key={a} d={`M${p[0]} ${p[1]} L${l[0]} ${l[1]} L${r[0]} ${r[1]} Z`} fill={`url(#${id}cmp)`} stroke={MAT.gold.edge} strokeWidth="1.1" strokeLinejoin="round" />;
      })}
    </g>
  </>
);

const appsBadge = (id, { n, metal, tier, count }) => (
  <>
    {tier === 4 && glow(id, { y: 28, r: 30, color: '#22D3EE', opacity: 0.55 })}
    {tier === 5 && rays(id, { y: 27, color: '#06B6D4', opacity: 0.7, n: 16 })}
    {tier >= 6 && compass(id, { y: 28, R: 31 })}
    <g className="ba-anim anim-bob" style={at(32, 30)}>
      {fan(id, { count })}
    </g>
    {ribbon(id, { n, metal, y: 51 })}
    {sparkle(54, 8, 3, '#FBBF24', tier >= 5 ? null : 'anim-twinkle')}
    {tier >= 3 && sparkle(10, 9, 2.4, '#F472B6', tier >= 5 ? null : 'anim-twinkle-2')}
  </>
);

const PERFECT_APPS = {
  perfect_1_app: { n: 1, tier: 1, count: 1 },
  perfect_3_apps: { n: 3, tier: 2, count: 3 },
  perfect_5_apps: { n: 5, tier: 3, count: 5 },
};

const perfectAppsBadge = (id, { n, tier, count }) => (
  <>
    {tier < 3 && glow(id, { y: 30, r: 29, color: '#F472B6', opacity: 0.45 })}
    {tier >= 3 && rays(id, { y: 28, color: '#F59E0B', opacity: 0.75, n: 20 })}
    <g className="ba-anim anim-bob" style={at(32, 26)}>
      {fan(id, { count, py: 54, dist: 32, k: 0.92, star: true })}
    </g>
    <g className="ba-anim anim-pulse" style={at(32, 45.5)}>
      {facetStar('big', { x: 32, y: 45.5, R: 16.2, r: 8.4, pal: 'gold', edgeW: 1 })}
      {numText(String(n), { x: 32, y: 47.2, size: 13.5, edge: STAR_PAL.gold.edge, sw: 2.6 })}
    </g>
    {sparkle(54, 10, 3, '#F472B6', tier >= 3 ? null : 'anim-twinkle')}
    {tier >= 2 && sparkle(10, 12, 2.4, '#FBBF24', null)}
  </>
);

// ─── RAPIDEZ: cronómetro ─────────────────────────────────────────────────────

const WING = 'M0 0 C2 -6.6 8.2 -11.2 16.8 -11.6 C15.8 -9.4 14.2 -8.2 12.6 -7.4 C15.2 -7 16.8 -5.8 17.6 -4.2 C15 -3.6 12.8 -3.4 10.8 -3 C12.4 -1.8 13.2 -0.4 13.4 1.2 C8.6 1.8 3.6 1.4 0 0 Z';
const BOLT = 'M3.2 -10.5 L-4.6 1.4 L-0.4 1.4 L-2.8 10.5 L5 -1.8 L0.8 -1.8 Z';

const stopwatch = (id, { x = 33, y = 35, s = 1, case: caseKey, n, frac, ringColor }) => {
  const m = MAT[caseKey];
  const R = 11.2;
  const end = polar(0, 0, R, -90 + frac * 360);
  return (
    <>
      <defs>
        {mat(id, 'swc', caseKey)}
        {mat(id, 'swm', 'silver')}
        <radialGradient id={`${id}swf`} cx="0.38" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#C7D2FE" />
        </radialGradient>
        <clipPath id={`${id}swk`}>
          <circle r="17.4" />
        </clipPath>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* pulsador lateral y corona */}
        <g transform="rotate(45)">
          <rect x="-2.2" y="-21.6" width="4.4" height="5" rx="1" fill={`url(#${id}swm)`} stroke={MAT.silver.edge} strokeWidth="1.1" />
        </g>
        <rect x="-2.4" y="-21.8" width="4.8" height="5.4" fill={`url(#${id}swm)`} stroke={MAT.silver.edge} strokeWidth="1.1" />
        <g>
          <rect x="-5.6" y="-26" width="11.2" height="4.8" rx="1.8" fill={`url(#${id}swc)`} stroke={m.edge} strokeWidth="1.4" />
          <rect x="-4" y="-25" width="5" height="1.2" rx="0.6" fill="#fff" opacity="0.6" />
        </g>
        {/* caja */}
        <circle r="17.4" fill={m.dark} />
        <g clipPath={`url(#${id}swk)`}>
          <circle r="17.4" cx="-1.2" cy="-2.2" fill={`url(#${id}swc)`} />
          <path d="M-14 -7 A15.4 15.4 0 0 1 4 -15.2 L3 -12 A12.6 12.6 0 0 0 -11.4 -5.6 Z" fill="#fff" opacity="0.38" />
        </g>
        <circle r="17.4" fill="none" stroke={m.edge} strokeWidth="1.9" />
        {/* esfera */}
        <circle r="14" fill={m.edge} opacity="0.7" />
        <circle r="13.1" fill={`url(#${id}swf)`} />
        <circle r={R} fill="none" stroke="#C7D2FE" strokeWidth="2.6" opacity="0.7" />
        {frac >= 1 ? (
          <circle r={R} fill="none" stroke={ringColor} strokeWidth="2.6" />
        ) : (
          <path d={`M0 ${-R} A${R} ${R} 0 ${frac > 0.5 ? 1 : 0} 1 ${end[0]} ${end[1]}`} stroke={ringColor} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        )}
        {[0, 90, 180, 270].map((a) => {
          const p = polar(0, 0, 8.4, a - 90);
          const q = polar(0, 0, 9.2, a - 90);
          return <path key={a} d={`M${p[0]} ${p[1]} L${q[0]} ${q[1]}`} stroke="#6366F1" strokeWidth="1" strokeLinecap="round" opacity="0.6" />;
        })}
        {numText(String(n), { x: 0, y: 0.6, size: 11.6, fill: '#1E1B4B' })}
        <path d="M-9.6 -5 A10.6 10.6 0 0 1 -4.6 -9.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" fill="none" />
      </g>
    </>
  );
};

const speedLines = (id, { x, y, rows, color }) => (
  <>
    <defs>
      <linearGradient id={`${id}spl`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={color} stopOpacity="0" />
        <stop offset="1" stopColor={color} stopOpacity="0.95" />
      </linearGradient>
    </defs>
    <g className="ba-anim anim-zoom" style={at(x, y)}>
      {rows.map(([dy, len]) => (
        <rect key={dy} x={x - len} y={y + dy - 1.3} width={len} height="2.6" rx="1.3" fill={`url(#${id}spl)`} />
      ))}
    </g>
  </>
);

// Estela de fuego: tres lenguas que salen por detrás del cronómetro.
const FLAME = [
  [2, -12.5], [-4, -13.5], [-10, -14], [-17, -12],
  [-12, -9], [-13, -7], [-15, -6.5],
  [-20, -6], [-24, -4.5], [-27, -3],
  [-22, 0.5], [-19, 2.5], [-17, 3.5],
  [-19, 5], [-20, 7], [-21, 9.5],
  [-14, 12], [-6, 13], [2, 12],
];
const flamePath = (x, y, sx, sy) => {
  const P = FLAME.map(([fx, fy]) => [rd(x + fx * sx), rd(y + fy * sy)]);
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 1; i < P.length; i += 3) d += ` C${P[i][0]} ${P[i][1]} ${P[i + 1][0]} ${P[i + 1][1]} ${P[i + 2][0]} ${P[i + 2][1]}`;
  return `${d} Z`;
};

const flames = (id, { x, y }) => (
  <>
    <defs>
      <linearGradient id={`${id}fl`} gradientUnits="userSpaceOnUse" x1={x} y1="0" x2={x - 21} y2="0">
        <stop offset="0" stopColor="#FDE047" />
        <stop offset="0.4" stopColor="#FB923C" />
        <stop offset="0.8" stopColor="#EF4444" stopOpacity="0.85" />
        <stop offset="1" stopColor="#DC2626" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id={`${id}fli`} gradientUnits="userSpaceOnUse" x1={x} y1="0" x2={x - 15} y2="0">
        <stop offset="0" stopColor="#FFFBEB" />
        <stop offset="0.6" stopColor="#FDE047" />
        <stop offset="1" stopColor="#FDE047" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g className="ba-anim anim-flame" style={at(x, y)}>
      <path d={flamePath(x, y, 0.76, 1)} fill={`url(#${id}fl)`} stroke="#C2410C" strokeOpacity="0.55" strokeWidth="0.9" strokeLinejoin="round" />
      <path d={flamePath(x, y + 0.6, 0.52, 0.58)} fill={`url(#${id}fli)`} />
    </g>
  </>
);

const bolt = (id, { x, y, s = 1, rot = 0, anim = true }) => (
  <>
    <defs>{mat(id, 'blt', 'amber')}</defs>
    <g className={anim ? 'ba-anim anim-bolt' : undefined}>
      <path d={BOLT} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={`url(#${id}blt)`} stroke="#7C2D12" strokeWidth={rd(1.4 / s)} strokeLinejoin="round" />
    </g>
  </>
);

const wings = (id, { x, y, gap, s = 1, metal = 'silver' }) => {
  const m = MAT[metal];
  const w = (sx) => (
    <g transform={`translate(${x + sx * gap} ${y}) scale(${sx * s} ${s})`}>
      <path d={WING} fill={`url(#${id}wng)`} stroke={m.edge} strokeWidth={rd(1.4 / s)} strokeLinejoin="round" />
      <path d="M3 -2.2 C6 -5.4 9 -6.6 12.6 -7.4 M3.4 -0.4 C6 -2 8.4 -2.8 10.8 -3" stroke={m.dark} strokeWidth={rd(0.9 / s)} strokeLinecap="round" fill="none" />
      <path d="M2.2 -4 C4.4 -8 8.6 -10.4 14.4 -10.8" stroke="#fff" strokeOpacity="0.7" strokeWidth={rd(1 / s)} strokeLinecap="round" fill="none" />
    </g>
  );
  return (
    <>
      <defs>{mat(id, 'wng', metal)}</defs>
      {w(-1)}
      {w(1)}
    </>
  );
};

const SPEED = {
  speed_60s: { n: 60, frac: 1, case: 'cyan', ring: '#06B6D4', tier: 1 },
  speed_30s: { n: 30, frac: 0.5, case: 'violet', ring: '#8B5CF6', tier: 2 },
  speed_10s: { n: 10, frac: 1 / 6, case: 'orange', ring: '#F97316', tier: 3 },
  speed_perf_60: { n: 60, frac: 1, case: 'gold', ring: '#EC4899', tier: 1, perfect: true },
  speed_perf_30: { n: 30, frac: 0.5, case: 'gold', ring: '#EC4899', tier: 2, perfect: true },
};

const speedBadge = (id, { n, frac, case: caseKey, ring, tier, perfect }) => {
  if (perfect) {
    return (
      <>
        <defs>
          <ShadowGradient id={`${id}shd`} color="#4A044E" opacity={0.35} />
        </defs>
        {tier >= 2 ? rays(id, { y: 33, color: '#F472B6', opacity: 0.6, n: 20 }) : glow(id, { y: 33, r: 29, color: '#F472B6', opacity: 0.45 })}
        <ellipse cx="32" cy="56.5" rx="14" ry="2.6" fill={`url(#${id}shd)`} />
        <g className="ba-anim anim-sway" style={at(32, 30)}>
          {wings(id, { x: 32, y: 30, gap: 13, s: tier >= 2 ? 1.05 : 0.85, metal: tier >= 2 ? 'gold' : 'wing' })}
        </g>
        {stopwatch(id, { x: 32, y: 35, s: 0.92, case: caseKey, n, frac, ringColor: ring })}
        <g className="ba-anim anim-pulse" style={at(47, 48)}>
          {facetStar('st', { x: 47, y: 48, R: 8.6, r: 4.4, pal: 'pink', edgeW: 0.9 })}
        </g>
        {tier >= 2 && bolt(id, { x: 15, y: 48, s: 0.75, rot: 18, anim: false })}
        {sparkle(52, 9, 2.8, '#FBBF24', tier >= 2 ? null : 'anim-twinkle-2')}
      </>
    );
  }
  return (
    <>
      <defs>
        <ShadowGradient id={`${id}shd`} color="#1E1B4B" opacity={0.35} />
      </defs>
      {tier >= 3 && glow(id, { x: 34, y: 34, r: 30, color: '#FB923C', opacity: 0.5 })}
      <ellipse cx="35" cy="56.5" rx="14" ry="2.6" fill={`url(#${id}shd)`} />
      {tier >= 3
        ? flames(id, { x: 24, y: 36 })
        : speedLines(id, {
          x: 17,
          y: 35,
          color: MAT[caseKey].base,
          rows: tier >= 2 ? [[-9, 9], [-3, 13], [3, 11], [9, 8]] : [[-6, 9], [0, 13], [6, 10]],
        })}
      <g className="ba-anim anim-shake" style={at(35, 35)}>
        {stopwatch(id, { x: 35, y: 35.5, s: 1.04, case: caseKey, n, frac, ringColor: ring })}
      </g>
      {tier >= 2 && bolt(id, { x: 52, y: tier >= 3 ? 50 : 51, s: tier >= 3 ? 0.9 : 0.72, rot: 14 })}
      {sparkle(54, 10, 2.6, '#FBBF24', tier >= 2 ? null : 'anim-twinkle-2')}
    </>
  );
};

// ─── mapa final ──────────────────────────────────────────────────────────────

const build = (table, fn) => Object.fromEntries(Object.entries(table).map(([code, cfg]) => [code, (id) => fn(id, cfg)]));

const BADGES = {
  ...build(GAMES, gamesBadge),
  ...build(EXAMS, examsBadge),
  ...build(PERFECT, perfectBadge),
  ...build(PERFECT_APPS, perfectAppsBadge),
  ...build(APPS, appsBadge),
  ...build(SPEED, speedBadge),
};

export default BADGES;
