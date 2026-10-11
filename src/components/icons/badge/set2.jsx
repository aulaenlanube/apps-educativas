// Insignias redibujadas (rediseño 2026). Formato y reglas: src/components/icons/badge/README.md
// CODES de este set: streak_2, streak_3, streak_5, streak_7, streak_10, streak_15, streak_30, streak_50, time_30m, time_1h, time_3h, time_5h, time_10h, time_20h, time_50h, subjects_1, subjects_3, subjects_5, subjects_8, rank_top10_1, rank_top10_3, rank_top10_5, rank_top10_10, rank_top3_1, rank_top3_3, rank_top3_5, rank_first_1, rank_first_3, rank_first_5
//
// Familias (cada una es una progresión con la misma composición base):
//  · Rachas: llama sobre leña (2-3) → brasero de bronce (5-7) → plata/oro con
//    fuego dorado de corazón azul (10-15) → fuego mágico rosa-violeta con gemas
//    y llamas laterales (30) y alas de fénix (50). El número va en la placa.
//  · Tiempo: reloj de arena sobre peana con placa; la arena se acumula abajo a
//    medida que crece el tiempo y el marco pasa de madera a bronce, plata y oro;
//    bisel de reloj detrás desde 3 h, gemas desde 20 h y noche estrellada en 50 h.
//  · Asignaturas: libros de colores en una balda con etiqueta (1, 3, 5, 8);
//    la balda pasa de madera a bronce y oro, y la de 8 lleva birrete.
//  · Ranking: escudo «10» (top 10), podio (top 3) y corona sobre cojín
//    (primero). Las estrellas / la chapa «×N» cuentan las veces; el metal y las
//    gemas suben con N.
import React from 'react';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient } from '@/components/art/primitives';

const FONT = 'Fredoka, system-ui, sans-serif';

// Orígenes de transformación. `.ba-anim` usa transform-box: fill-box, así que
// los porcentajes se refieren a la propia pieza; `at()` fija un punto absoluto
// del viewBox (órbitas, borlas…).
const MID = { transformOrigin: '50% 50%' };
const FOOT = { transformOrigin: '50% 100%' };
const at = (x, y) => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px` });

// ── Degradados ───────────────────────────────────────────────────────────────
const stops = (s) => s.map(([o, c, a = 1], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a} />);
const lin = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>{stops(s)}</linearGradient>
);
const rad = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r}>{stops(s)}</radialGradient>
);

// Materiales: claro arriba-izquierda → base → oscuro → luz reflejada abajo.
const MAT = {
  wood:   { hi: '#e9b47c', base: '#a95f2a', dark: '#6a3311', line: '#45200a', grain: '#5a2a0d' },
  bronze: { hi: '#ffe9d2', base: '#ee8f45', dark: '#9c4310', line: '#5e2507' },
  silver: { hi: '#ffffff', base: '#d5dbe6', dark: '#7e8ba1', line: '#3c465b' },
  gold:   { hi: '#fff7d4', base: '#fcc434', dark: '#c4780a', line: '#7a3d05' },
};
const metal = (id, m, x2 = 0.25) => lin(id, [[0, m.hi], [0.4, m.base], [0.78, m.dark], [1, m.base]], 0, 0, x2, 1);

// Esmaltes de las placas (fondo del número).
const ENAMEL = {
  red:    { hi: '#ff8f7d', base: '#e2362b', dark: '#8c1212' },
  indigo: { hi: '#aab6ff', base: '#5658e2', dark: '#27238c' },
  violet: { hi: '#d9c2ff', base: '#8b5cf6', dark: '#4a1d92' },
  night:  { hi: '#7b7cf0', base: '#30299a', dark: '#130d48' },
  teal:   { hi: '#86efe0', base: '#0fa392', dark: '#0a4d48' },
};

const GEM = {
  ruby:     { hi: '#ffd3da', base: '#e11d48', dark: '#7a0b26' },
  sapphire: { hi: '#d4e3ff', base: '#3070ff', dark: '#15297c' },
  emerald:  { hi: '#ccffe8', base: '#10b981', dark: '#05553d' },
  amethyst: { hi: '#f1deff', base: '#a855f7', dark: '#4c1586' },
  aqua:     { hi: '#dcfcff', base: '#22d3ee', dark: '#0d5e72' },
};
const gemDef = (id, g) => rad(id, [[0, g.hi], [0.45, g.base], [1, g.dark]], 0.36, 0.3, 0.75);
// Gema redonda engastada (necesita un gemDef con `gid`).
const gem = (gid, x, y, r, setting = '#7a3d05', key) => (
  <g key={key}>
    <circle cx={x} cy={y} r={r + 0.8} fill={setting} />
    <circle cx={x} cy={y} r={r} fill={`url(#${gid})`} />
    <path d={`M${x - r * 0.62} ${y - r * 0.05} L${x - r * 0.12} ${y - r * 0.62} L${x + r * 0.18} ${y - r * 0.18} Z`} fill="#fff" opacity="0.5" />
    <circle cx={x - r * 0.36} cy={y - r * 0.38} r={r * 0.26} fill="#fff" />
  </g>
);

// Sombra de contacto en el suelo.
const ground = (id, cx, cy, rx, ry = 2.2) => (
  <>
    <defs><ShadowGradient id={`${id}gs`} opacity={0.42} /></defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}gs)`} />
  </>
);

// Halo de luz detrás de la pieza (sustituye a los glows con blur).
const halo = (id, cx, cy, r, color, opacity = 0.45) => (
  <>
    <defs><GlowGradient id={`${id}hl`} color={color} opacity={opacity} /></defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id}hl)`} />
  </>
);

// Destello animado (máx. 1-2 por insignia).
const twinkle = (x, y, r, fill = '#fff', cls = 'anim-twinkle', key) => (
  <g key={key} className={`ba-anim ${cls}`} style={MID}>
    <Sparkle x={x} y={y} r={r} fill={fill} />
  </g>
);

// Placa con marco metálico y esmalte: lleva el número de la insignia.
const plaque = (id, { cx, cy, w, h, m, e, text, sub, fs = 10.5 }) => {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = Math.min(3.2, h * 0.3);
  return (
    <g>
      <defs>
        {metal(`${id}pf`, m, 0)}
        {lin(`${id}pe`, [[0, e.hi], [0.45, e.base], [1, e.dark]])}
      </defs>
      <rect x={x} y={y + 1.1} width={w} height={h} rx={r} fill={m.line} opacity="0.3" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${id}pf)`} stroke={m.line} strokeWidth="1.5" />
      <rect x={x + 1.6} y={y + 1.6} width={w - 3.2} height={h - 3.2} rx={r * 0.6} fill={`url(#${id}pe)`} stroke={e.dark} strokeWidth="0.8" />
      <rect x={x + 2.3} y={y + 2.1} width={w - 4.6} height={(h - 3.2) * 0.4} rx={r * 0.5} fill="#fff" opacity="0.22" />
      <text x={cx} y={cy + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize={fs}
            fill="#fff" stroke={e.dark} strokeWidth="1.4" strokeLinejoin="round" paintOrder="stroke">
        {text}{sub && <tspan fontSize={fs * 0.64} dx="0.5">{sub}</tspan>}
      </text>
    </g>
  );
};

// Chapa redonda «×N» (veces conseguido) para el ranking.
const CHIP = {
  pink:   { hi: '#ffb3da', base: '#ec4899', dark: '#9d174d', line: '#6b0d36' },
  indigo: { hi: '#c3cbff', base: '#6366f1', dark: '#3730a3', line: '#221d7a' },
};
const chip = (id, x, y, n, c = CHIP.pink, r = 7.8) => (
  <g>
    <defs>{rad(`${id}ch`, [[0, c.hi], [0.5, c.base], [1, c.dark]], 0.36, 0.28, 0.8)}</defs>
    <circle cx={x} cy={y + 1} r={r} fill={c.line} opacity="0.3" />
    <circle cx={x} cy={y} r={r} fill={`url(#${id}ch)`} stroke={c.line} strokeWidth="1.6" />
    <circle cx={x} cy={y} r={r - 1.8} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
    <ellipse cx={x - r * 0.18} cy={y - r * 0.5} rx={r * 0.55} ry={r * 0.26} fill="#fff" opacity="0.35" />
    <text x={x + 0.2} y={y + 3.1} textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize={n >= 10 ? 7.2 : 8.8}
          fill="#fff" stroke={c.line} strokeWidth="1.2" strokeLinejoin="round" paintOrder="stroke">
      <tspan fontSize={n >= 10 ? 5.4 : 6.4}>×</tspan>{n}
    </text>
  </g>
);

// Estrella de 5 puntas.
const star5 = (cx, cy, R, k = 0.46) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = ((-90 + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? R * k : R;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)} `;
  }
  return `${d}Z`;
};

// Forma en coordenadas normalizadas (u: -1..1 horizontal, v: 0..1 hacia arriba)
// → path con curvas cúbicas en el viewBox.
const nshape = (segs, cx, by, w, h) => {
  const X = (u) => +(cx + (u * w) / 2).toFixed(2);
  const Y = (v) => +(by - v * h).toFixed(2);
  let d = `M${X(segs[0][0])} ${Y(segs[0][1])}`;
  for (let i = 1; i < segs.length; i++) {
    const s = segs[i];
    d += ` C${X(s[0])} ${Y(s[1])} ${X(s[2])} ${Y(s[3])} ${X(s[4])} ${Y(s[5])}`;
  }
  return `${d} Z`;
};

// ═════════════════════════════ RACHAS ════════════════════════════════════════
// Llama: tres lenguas (izquierda, punta principal inclinada, derecha).
const F_OUT = [
  [0, 0],
  [-0.6, 0, -1.0, 0.2, -0.97, 0.44],
  [-0.95, 0.58, -0.87, 0.68, -0.75, 0.77],
  [-0.71, 0.65, -0.57, 0.55, -0.42, 0.57],
  [-0.38, 0.75, -0.2, 0.88, 0.04, 1],
  [0.17, 0.86, 0.3, 0.73, 0.39, 0.63],
  [0.5, 0.67, 0.62, 0.75, 0.72, 0.85],
  [0.92, 0.63, 1.0, 0.38, 0.96, 0.27],
  [0.91, 0.08, 0.55, 0, 0, 0],
];
const F_MID = [
  [0, 0],
  [-0.5, 0, -0.76, 0.24, -0.62, 0.46],
  [-0.5, 0.64, -0.2, 0.74, 0.04, 1],
  [0.16, 0.78, 0.62, 0.62, 0.66, 0.36],
  [0.7, 0.12, 0.42, 0, 0, 0],
];
const F_GLINT = [
  [-0.66, 0.2],
  [-0.84, 0.36, -0.82, 0.52, -0.7, 0.64],
  [-0.7, 0.5, -0.64, 0.36, -0.5, 0.26],
  [-0.54, 0.22, -0.6, 0.2, -0.66, 0.2],
];

// Paletas de fuego: o = capa exterior (radial desde la base), m = capa media,
// c = núcleo (azul en los fuegos «más calientes»), line = perfil teñido.
const FLAME = {
  ember: {
    o: [[0, '#ffe066'], [0.4, '#ff9a3c'], [0.75, '#f04a2a'], [1, '#c41e1e']],
    m: [[0, '#ffb13d'], [0.5, '#ffd84d'], [1, '#fff3b0']],
    c: [[0, '#fff8cc'], [1, '#ffffff']],
    line: '#7d1610',
  },
  blaze: {
    o: [[0, '#fff09a'], [0.38, '#ffb02e'], [0.75, '#f5571f'], [1, '#d2261a']],
    m: [[0, '#ffc53d'], [0.5, '#ffe36b'], [1, '#fff8d0']],
    c: [[0, '#ffffff'], [0.55, '#e9fbff'], [1, '#4fd8f2']],
    line: '#7d1d0c',
  },
  gold: {
    o: [[0, '#fff7c8'], [0.42, '#ffd84a'], [0.8, '#fbab1c'], [1, '#f07a12']],
    m: [[0, '#ffe878'], [0.5, '#fff4b8'], [1, '#ffffff']],
    c: [[0, '#ffffff'], [0.5, '#e6fbff'], [1, '#38d6f0']],
    line: '#9a4305',
  },
  magic: {
    o: [[0, '#ffd9ee'], [0.36, '#ff6fb5'], [0.74, '#d63ad6'], [1, '#7b3cf0']],
    m: [[0, '#ffb347'], [0.5, '#ffd84d'], [1, '#fff6c9']],
    c: [[0, '#ffffff'], [0.5, '#e6fbff'], [1, '#38d6f0']],
    line: '#46168a',
  },
};

const Flame = ({ id, cx = 32, by, w, h, pal, still }) => {
  const p = FLAME[pal];
  const d = nshape(F_OUT, cx, by, w, h);
  return (
    <>
      <defs>
        {rad(`${id}o`, p.o, 0.5, 0.95, 0.95)}
        {lin(`${id}m`, p.m)}
        {lin(`${id}c`, p.c)}
        {lin(`${id}s`, [[0.45, p.line, 0], [1, p.line, 0.45]], 0, 0, 1, 0)}
      </defs>
      <g className={still ? undefined : 'ba-anim anim-flame'} style={still ? undefined : FOOT}>
        <path d={d} fill={`url(#${id}o)`} stroke={p.line} strokeWidth="1.8" strokeLinejoin="round" />
        <path d={d} fill={`url(#${id}s)`} />
        <path d={nshape(F_MID, cx + w * 0.02, by - h * 0.04, w * 0.64, h * 0.7)} fill={`url(#${id}m)`} />
        <path d={nshape(F_MID, cx + w * 0.03, by - h * 0.06, w * 0.34, h * 0.4)} fill={`url(#${id}c)`} />
        <path d={nshape(F_GLINT, cx, by, w, h)} fill="#fff" opacity="0.55" />
      </g>
    </>
  );
};

// Chispa que sube (anim-ember / anim-rise-fade). Estática: brasa flotando.
const ember = (x, y, ex, ey, cls = 'anim-ember', r = 1.35) => (
  <g className={`ba-anim ${cls}`} style={{ ...MID, '--ex': `${ex}px`, '--ey': `${ey}px` }}>
    <circle cx={x} cy={y} r={r} fill="#ffc531" stroke="#d9480f" strokeWidth="0.8" />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.38} fill="#fff" />
  </g>
);

// Leña: un tronco con su corte visible.
const LOG_LINE = '#45200a';
const logDefs = (id) => (
  <defs>
    {lin(`${id}lw`, [[0, '#eaa86a'], [0.45, '#b0662f'], [1, '#5e2c0f']])}
    {rad(`${id}lc`, [[0, '#ffe7c2'], [0.6, '#f0bd82'], [1, '#c0813f']], 0.4, 0.4, 0.65)}
  </defs>
);
const log = (id, cx, cy, len, th, angle, capLeft) => {
  const capX = capLeft ? cx - len / 2 + th * 0.42 : cx + len / 2 - th * 0.42;
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <rect x={cx - len / 2} y={cy - th / 2} width={len} height={th} rx={th / 2} fill={`url(#${id}lw)`} stroke={LOG_LINE} strokeWidth="1.6" />
      <path d={`M${cx - len * 0.24} ${cy - th * 0.06} H${cx + len * 0.06} M${cx - len * 0.04} ${cy + th * 0.22} H${cx + len * 0.26}`}
            stroke="#5e2c0e" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
      <path d={`M${cx - len * 0.38} ${cy - th * 0.28} H${cx + len * 0.32}`} stroke="#ffd9a8" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      <ellipse cx={capX} cy={cy} rx={th * 0.34} ry={th * 0.47} fill={`url(#${id}lc)`} stroke={LOG_LINE} strokeWidth="1.2" />
      <ellipse cx={capX} cy={cy} rx={th * 0.15} ry={th * 0.21} fill="none" stroke="#b8783f" strokeWidth="0.8" />
    </g>
  );
};
// Brasas encendidas en la base del fuego.
const coals = (id, cx, cy, rx, ry) => (
  <>
    <defs>{rad(`${id}co`, [[0, '#fff1a8'], [0.35, '#ff9a3c', 0.95], [1, '#e2362b', 0]])}</defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}co)`} />
  </>
);

// Hoguera (rachas 2 y 3): troncos cruzados + fuego + placa delante.
const campfire = (id, { w, h, n, embers }) => (
  <>
    {logDefs(id)}
    {ground(id, 32, 59, 21)}
    {halo(id, 32, 46 - h * 0.42, h * 0.72, '#fb923c', 0.5)}
    {log(id, 32, 47, 44, 7.2, -12, true)}
    {coals(id, 32, 46, 12, 4.2)}
    <Flame id={`${id}f`} by={46.5} w={w} h={h} pal="ember" />
    {log(id, 32, 47, 44, 7.2, 12, false)}
    {embers}
    {plaque(id, { cx: 32, cy: 53.8, w: 17, h: 12.4, m: MAT.wood, e: ENAMEL.red, text: n, fs: 11 })}
  </>
);

// Brasero: parte trasera (labio trasero + lecho de brasas) y delantera.
const BOWL = 'M13 37.6 A19 4 0 0 0 51 37.6 C51 48 42.8 53.8 32 53.8 C21.2 53.8 13 48 13 37.6 Z';
const LIP_BACK = 'M13 37.6 A19 4 0 0 1 51 37.6';
const LIP_FRONT = 'M13 37.6 A19 4 0 0 0 51 37.6';
const brazierBack = (id, m) => (
  <>
    <defs>
      {metal(`${id}bw`, m)}
      {lin(`${id}bs`, [[0.5, m.line, 0], [1, m.line, 0.55]], 0, 0, 1, 0)}
      {rad(`${id}bc`, [[0, '#ffe08a'], [0.4, '#ff8a2a'], [1, '#6a1606']], 0.5, 0.35, 0.65)}
    </defs>
    <path d={LIP_BACK} fill="none" stroke={m.line} strokeWidth="3.8" strokeLinecap="round" />
    <path d={LIP_BACK} fill="none" stroke={m.dark} strokeWidth="1.7" strokeLinecap="round" />
    <ellipse cx="32" cy="37.6" rx="18" ry="3.4" fill={`url(#${id}bc)`} />
  </>
);
const brazierFront = (id, m, { n, e, gid, handles }) => (
  <>
    {/* asas de anilla */}
    {handles && (
      <g fill="none" strokeLinecap="round">
        <path d="M13.4 40.6 C7.6 40.6 7.2 48.6 13.8 48.6 M50.6 40.6 C56.4 40.6 56.8 48.6 50.2 48.6" stroke={m.line} strokeWidth="3.6" />
        <path d="M13.4 40.6 C7.6 40.6 7.2 48.6 13.8 48.6 M50.6 40.6 C56.4 40.6 56.8 48.6 50.2 48.6" stroke={m.base} strokeWidth="1.6" />
      </g>
    )}
    {/* pie */}
    <path d="M25.6 53 H38.4 L41.6 57.8 Q42.2 59.4 40.4 59.4 H23.6 Q21.8 59.4 22.4 57.8 Z" fill={`url(#${id}bw)`} stroke={m.line} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M24.4 57.9 H39.6" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />
    {/* cuenco */}
    <path d={BOWL} fill={`url(#${id}bw)`} stroke={m.line} strokeWidth="1.9" strokeLinejoin="round" />
    <path d={BOWL} fill={`url(#${id}bs)`} />
    <path d="M15.8 41.8 C16.6 46.2 19.6 50 23.8 51.6" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round" />
    {/* labio delantero */}
    <path d={LIP_FRONT} fill="none" stroke={m.line} strokeWidth="3.8" strokeLinecap="round" />
    <path d={LIP_FRONT} fill="none" stroke={m.hi} strokeWidth="1.6" strokeLinecap="round" />
    {gid && (
      <>
        {gem(gid, 17.4, 44, 1.8, m.line)}
        {gem(gid, 46.6, 44, 1.8, m.line)}
      </>
    )}
    {plaque(id, { cx: 32, cy: 47.7, w: 18, h: 11.2, m, e, text: n, fs: 10.4 })}
  </>
);

// Alas de fénix (racha 50): silueta de cuatro plumas-llama abiertas hacia
// arriba desde el «hombro»; la derecha es la izquierda reflejada.
const WING = 'M27 40 C20 41 12 39.5 6.5 33 C10 33.4 12.6 32.6 14 31.6 C9 29.6 5.6 25.6 4.8 20.6 C9 23.6 12.8 25 15.6 25.2 C11.8 21.4 10.6 16.6 11.4 11.6 C15 15.6 18.4 18.8 20.6 19.6 C19.6 16 20.2 12.4 21.6 9 C25.4 15 28 23 29.6 31 Z';
const WING_VEINS = 'M10.6 34.2 C16 35.6 21.4 36 26 36.6 M8.6 23.4 C14.6 28 20.6 31.2 26.4 33.6 M13.6 15.4 C18 21.6 22.4 26.4 27 31 M22.4 12.4 C24.4 18.4 26.2 24 27.8 29';
const wings = (gid) => (
  <>
    {[undefined, 'matrix(-1 0 0 1 64 0)'].map((t, i) => (
      <g key={i} transform={t}>
        <path d={WING} fill={`url(#${gid})`} stroke="#46168a" strokeWidth="1.7" strokeLinejoin="round" />
        <path d={WING_VEINS} fill="none" stroke="#fff3c4" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
      </g>
    ))}
  </>
);

const STREAK = {
  streak_2: (id) => campfire(id, {
    w: 28, h: 30, n: '2',
    embers: ember(45, 24, 4, -9),
  }),
  streak_3: (id) => campfire(id, {
    w: 32, h: 37, n: '3',
    embers: (<>{ember(13.5, 26, -4, -9)}{ember(49.5, 20, 4, -9, 'anim-rise-fade', 1.15)}</>),
  }),
  streak_5: (id) => (
    <>
      {ground(id, 32, 60.2, 17)}
      {halo(id, 32, 24, 24, '#fb923c', 0.5)}
      {brazierBack(id, MAT.bronze)}
      <Flame id={`${id}f`} by={41.5} w={33} h={34} pal="ember" />
      {brazierFront(id, MAT.bronze, { n: '5', e: ENAMEL.red })}
      {ember(12.6, 22, -4, -9)}
      {ember(51.6, 18, 4, -9, 'anim-rise-fade', 1.15)}
    </>
  ),
  streak_7: (id) => (
    <>
      {ground(id, 32, 60.2, 18)}
      {halo(id, 32, 23, 26, '#fbbf24', 0.55)}
      {brazierBack(id, MAT.bronze)}
      <Flame id={`${id}f`} by={41.5} w={35} h={36} pal="blaze" />
      {brazierFront(id, MAT.bronze, { n: '7', e: ENAMEL.red, handles: true })}
      {ember(11.8, 21, -4, -9)}
      {ember(52.2, 17, 4, -9, 'anim-rise-fade', 1.15)}
    </>
  ),
  streak_10: (id) => (
    <>
      {ground(id, 32, 60.2, 18)}
      {halo(id, 32, 23, 28, '#fde047', 0.65)}
      {brazierBack(id, MAT.silver)}
      <Flame id={`${id}f`} by={41.5} w={36} h={36} pal="gold" />
      {brazierFront(id, MAT.silver, { n: '10', e: ENAMEL.indigo, handles: true })}
      {ember(11.4, 21, -4, -9)}
      {twinkle(50, 13, 2.8, '#fff')}
    </>
  ),
  streak_15: (id) => (
    <>
      <defs>{gemDef(`${id}gm`, GEM.ruby)}</defs>
      {ground(id, 32, 60.2, 18)}
      {halo(id, 32, 22, 30, '#fde047', 0.7)}
      {brazierBack(id, MAT.gold)}
      <Flame id={`${id}f`} by={41.5} w={38} h={37.5} pal="gold" />
      {brazierFront(id, MAT.gold, { n: '15', e: ENAMEL.red, handles: true, gid: `${id}gm` })}
      {ember(11, 21, -4, -9)}
      {twinkle(51, 11, 3, '#fff')}
    </>
  ),
  streak_30: (id) => (
    <>
      <defs>{gemDef(`${id}gm`, GEM.amethyst)}</defs>
      {ground(id, 32, 60.2, 19)}
      {halo(id, 32, 22, 31, '#f472b6', 0.6)}
      {brazierBack(id, MAT.gold)}
      {/* llamas laterales, inclinadas hacia fuera */}
      <g transform="rotate(-24 20 40)"><Flame id={`${id}fl`} cx={20} by={40} w={13} h={21} pal="gold" still /></g>
      <g transform="rotate(24 44 40)"><Flame id={`${id}fr`} cx={44} by={40} w={13} h={21} pal="gold" still /></g>
      <Flame id={`${id}f`} by={41.5} w={31} h={38} pal="magic" />
      {brazierFront(id, MAT.gold, { n: '30', e: ENAMEL.violet, handles: true, gid: `${id}gm` })}
      {twinkle(51, 9, 3, '#fff')}
      {twinkle(11, 13, 2.2, '#fde68a', 'anim-twinkle-2')}
    </>
  ),
  streak_50: (id) => (
    <>
      <defs>
        {gemDef(`${id}gm`, GEM.aqua)}
        {rad(`${id}wg`, [[0, '#fff1a8'], [0.3, '#ffb03c'], [0.62, '#f0469a'], [1, '#9b30d9']], 0.95, 1, 1.1)}
      </defs>
      {ground(id, 32, 60.2, 19)}
      {halo(id, 32, 24, 32, '#e879f9', 0.6)}
      {wings(`${id}wg`)}
      {brazierBack(id, MAT.gold)}
      <Flame id={`${id}f`} by={41.5} w={28} h={38} pal="magic" />
      {brazierFront(id, MAT.gold, { n: '50', e: ENAMEL.night, handles: true, gid: `${id}gm` })}
      {twinkle(32, 3.4, 2.4, '#fff')}
      {twinkle(53.5, 7.5, 2, '#fde68a', 'anim-twinkle-2')}
    </>
  ),
};

// ═════════════════════════════ TIEMPO ════════════════════════════════════════
// Reloj de arena sobre peana con placa. La arena de abajo crece con el tiempo.
const GLASS = 'M21 11.5 H43 C43 20.5 36.4 24.4 33.5 28 C36.4 31.6 43 35.5 43 44.5 H21 C21 35.5 27.6 31.6 30.5 28 C27.6 24.4 21 20.5 21 11.5 Z';

const SAND = {
  amber: { s: [[0, '#ffe7a0'], [0.5, '#f8b84a'], [1, '#c87514']], stream: '#e9a23a' },
  gold:  { s: [[0, '#fff5c2'], [0.5, '#ffd23f'], [1, '#d58a0a']], stream: '#f7c234' },
  rose:  { s: [[0, '#ffe0f0'], [0.5, '#f472b6'], [1, '#a21caf']], stream: '#f472b6' },
  star:  { s: [[0, '#e0fbff'], [0.5, '#67e8f9'], [1, '#7c3aed']], stream: '#a5f3fc' },
};

// Bisel de reloj detrás (3 h en adelante): aro con marcas horarias y esfera clara.
const BZ_CY = 30.5;
const BZ_R = 25.4;
const bezel = (id, { m, face, ticks }) => (
  <>
    <defs>
      {metal(`${id}bz`, m, 0.6)}
      {rad(`${id}bf`, face, 0.42, 0.36, 0.7)}
    </defs>
    <circle cx="32" cy={BZ_CY} r={BZ_R} fill={`url(#${id}bf)`} />
    <circle cx="32" cy={BZ_CY} r={BZ_R} fill="none" stroke={m.line} strokeWidth="4" />
    <circle cx="32" cy={BZ_CY} r={BZ_R} fill="none" stroke={`url(#${id}bz)`} strokeWidth="2.2" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const big = i % 3 === 0;
      const r1 = BZ_R - (big ? 6.4 : 5);
      const r2 = BZ_R - 3.2;
      return (
        <line key={i} x1={32 + Math.sin(a) * r1} y1={BZ_CY - Math.cos(a) * r1} x2={32 + Math.sin(a) * r2} y2={BZ_CY - Math.cos(a) * r2}
              stroke={ticks} strokeWidth={big ? 1.7 : 1.1} strokeLinecap="round" />
      );
    })}
  </>
);

const hourglass = (id, c) => {
  const sd = SAND[c.sand];
  const m = c.m;
  const top = c.top;
  const pile = c.pile;
  return (
    <>
      <defs>
        <clipPath id={`${id}gc`}><path d={GLASS} /></clipPath>
        <clipPath id={`${id}nc`}><rect x="30" y="28.5" width="4" height={pile - 28.3} /></clipPath>
        {metal(`${id}fm`, m)}
        {lin(`${id}sd`, sd.s)}
        {c.night
          ? lin(`${id}gl`, [[0, '#4b3fc0', 0.95], [1, '#160f52', 0.97]])
          : lin(`${id}gl`, [[0, '#ffffff', 0.75], [0.6, '#e0f2fe', 0.5], [1, '#93c5fd', 0.55]], 0, 0, 1, 0.3)}
      </defs>
      {/* cristal (fondo) */}
      <path d={GLASS} fill={`url(#${id}gl)`} />
      {c.night && (
        <g fill="#fff">
          <circle cx="25.5" cy="15.6" r="0.8" /><circle cx="36" cy="14.4" r="0.6" /><circle cx="39.4" cy="18.6" r="0.8" />
          <circle cx="25.4" cy="40.6" r="0.6" /><circle cx="38.6" cy="39.4" r="0.7" />
        </g>
      )}
      {/* arena */}
      <g clipPath={`url(#${id}gc)`}>
        <path d={`M20 ${top} Q32 ${top + 2.8} 44 ${top} V29 H20 Z`} fill={`url(#${id}sd)`} />
        <path d={`M20 46 V${pile + 4} Q26.5 ${pile + 3} 32 ${pile} Q37.5 ${pile + 3} 44 ${pile + 4} V46 Z`} fill={`url(#${id}sd)`} />
        <path d={`M20 ${top} Q32 ${top + 2.8} 44 ${top}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" />
      </g>
      <line x1="32" y1="27.4" x2="32" y2={pile + 0.6} stroke={sd.stream} strokeWidth="1.1" strokeLinecap="round" />
      <g clipPath={`url(#${id}nc)`}>
        <g className="ba-anim anim-fall" style={MID}>
          <circle cx="32" cy={(28 + pile) / 2} r="1.05" fill={sd.stream} />
        </g>
      </g>
      {/* brillos del cristal */}
      <path d="M23.8 14.2 C24 19 26.2 22.4 28.8 24.8" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23.8 41.8 C24 37.4 25.8 34.6 28.2 32.4" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M40.6 15.6 C40.4 18.4 39.2 20.6 37.6 22.2" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />
      <path d={GLASS} fill="none" stroke={c.glassLine || '#3b4f78'} strokeWidth="1.3" strokeLinejoin="round" />
      {/* columnas */}
      {[16.4, 44.6].map((x) => (
        <g key={x}>
          <rect x={x} y="10" width="3" height="36" rx="1.4" fill={`url(#${id}fm)`} stroke={m.line} strokeWidth="1.3" />
          {m.grain && <path d={`M${x + 1.5} 14 V22 M${x + 1.5} 33 V41`} stroke={m.grain} strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />}
          <circle cx={x + 1.5} cy="28" r="2.3" fill={`url(#${id}fm)`} stroke={m.line} strokeWidth="1.2" />
        </g>
      ))}
      {/* tapa superior */}
      <rect x="14" y="5.4" width="36" height="6.4" rx="2.6" fill={`url(#${id}fm)`} stroke={m.line} strokeWidth="1.6" />
      <rect x="16" y="6.5" width="32" height="1.4" rx="0.7" fill="#fff" opacity="0.55" />
      {m.grain && <path d="M18 9.6 H27 M31 10.2 H45" stroke={m.grain} strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />}
      {c.gid && (
        <>
          {gem(c.gid, 32, 8.6, 1.7, m.line)}
          {gem(c.gid, 20.5, 8.6, 1.1, m.line)}
          {gem(c.gid, 43.5, 8.6, 1.1, m.line)}
        </>
      )}
      {/* peana con la placa */}
      {plaque(id, { cx: 32, cy: 50.6, w: 38, h: 12.4, m, e: c.e, text: c.n, sub: c.sub, fs: 10 })}
    </>
  );
};

const TIME = {
  time_30m: (id) => (
    <>
      {ground(id, 32, 59.2, 18)}
      {hourglass(id, { m: MAT.wood, sand: 'amber', top: 15.5, pile: 40.4, e: ENAMEL.indigo, n: '30', sub: 'min' })}
    </>
  ),
  time_1h: (id) => (
    <>
      {ground(id, 32, 59.2, 18)}
      {hourglass(id, { m: MAT.wood, sand: 'amber', top: 18.5, pile: 38, e: ENAMEL.teal, n: '1', sub: 'h' })}
      {twinkle(52, 15, 2.6, '#fde68a')}
    </>
  ),
  time_3h: (id) => (
    <>
      {bezel(id, { m: MAT.bronze, face: [[0, '#fff6ec'], [0.6, '#ffdcbc'], [1, '#f6b07c']], ticks: '#9c4310' })}
      {hourglass(id, { m: MAT.bronze, sand: 'amber', top: 20.5, pile: 36.6, e: ENAMEL.red, n: '3', sub: 'h', glassLine: '#5e2507' })}
      {twinkle(54, 10, 2.6, '#fff')}
    </>
  ),
  time_5h: (id) => (
    <>
      {bezel(id, { m: MAT.silver, face: [[0, '#f4f7fc'], [0.6, '#d9e1ef'], [1, '#aab7cf']], ticks: '#3c465b' })}
      {hourglass(id, { m: MAT.silver, sand: 'gold', top: 22.2, pile: 35.2, e: ENAMEL.indigo, n: '5', sub: 'h', glassLine: '#3c465b' })}
      {twinkle(54, 10, 2.6, '#fff')}
    </>
  ),
  time_10h: (id) => (
    <>
      {halo(id, 32, 30, 32, '#fde047', 0.55)}
      {bezel(id, { m: MAT.gold, face: [[0, '#fffbe8'], [0.6, '#ffe7a3'], [1, '#f6c45a']], ticks: '#7a3d05' })}
      {hourglass(id, { m: MAT.gold, sand: 'gold', top: 23.4, pile: 34, e: ENAMEL.indigo, n: '10', sub: 'h', glassLine: '#6b3a0a' })}
      {twinkle(54, 10, 2.8, '#fff')}
    </>
  ),
  time_20h: (id) => (
    <>
      <defs>{gemDef(`${id}gm`, GEM.ruby)}</defs>
      {halo(id, 32, 30, 32, '#f472b6', 0.5)}
      {bezel(id, { m: MAT.gold, face: [[0, '#fbf2ff'], [0.6, '#e7cdff'], [1, '#c39af2']], ticks: '#4a1d92' })}
      {hourglass(id, { m: MAT.gold, sand: 'rose', top: 24.4, pile: 33, e: ENAMEL.violet, n: '20', sub: 'h', glassLine: '#4a1d92', gid: `${id}gm` })}
      {twinkle(54, 10, 2.8, '#fff')}
    </>
  ),
  time_50h: (id) => (
    <>
      <defs>{gemDef(`${id}gm`, GEM.aqua)}</defs>
      {halo(id, 32, 30, 32, '#a78bfa', 0.7)}
      {bezel(id, { m: MAT.gold, face: [[0, '#fdf2ff'], [0.55, '#f3c6ef'], [1, '#c88be8']], ticks: '#4a1d92' })}
      {/* órbita de estrellas */}
      <g className="ba-anim anim-spin" style={at(32, BZ_CY)}>
        <circle cx="32" cy={BZ_CY} r="28.4" fill="none" stroke="#a78bfa" strokeWidth="0.9" strokeDasharray="1.4 3.6" />
        <circle cx="60.4" cy={BZ_CY} r="1.7" fill="#fff7d4" stroke="#7a3d05" strokeWidth="0.8" />
        <circle cx="3.6" cy={BZ_CY} r="1.3" fill="#a5f3fc" stroke="#0d5e72" strokeWidth="0.8" />
      </g>
      {hourglass(id, { m: MAT.gold, sand: 'star', top: 25.4, pile: 32, e: ENAMEL.night, n: '50', sub: 'h', glassLine: '#140d48', gid: `${id}gm`, night: true })}
      {twinkle(54, 9, 2.6, '#fff')}
    </>
  ),
};

// ═════════════════════════════ ASIGNATURAS ═══════════════════════════════════
const BOOK = {
  indigo:  { hi: '#b4bdff', base: '#6366f1', dark: '#3730a3', line: '#262083' },
  pink:    { hi: '#ffc4e4', base: '#ec4899', dark: '#9d174d', line: '#6f0f37' },
  amber:   { hi: '#ffe58f', base: '#f59e0b', dark: '#b45309', line: '#733306' },
  emerald: { hi: '#a7f3d0', base: '#10b981', dark: '#047857', line: '#064e3b' },
  cyan:    { hi: '#b0f4ff', base: '#06b6d4', dark: '#0e7490', line: '#0b4f61' },
  violet:  { hi: '#e0d7ff', base: '#8b5cf6', dark: '#5b21b6', line: '#3b1580' },
  red:     { hi: '#ffc9c9', base: '#ef4444', dark: '#b91c1c', line: '#7a1010' },
  sky:     { hi: '#c4ecff', base: '#0ea5e9', dark: '#0369a1', line: '#0b4669' },
};
const SHELF_Y = 45.5;
const bookDef = (id, b) => lin(id, [[0, b.hi], [0.35, b.base], [1, b.dark]], 0, 0, 1, 0);

// Lomo de libro de pie sobre la balda. `lean` (grados) lo apoya hacia la
// izquierda sobre su esquina inferior izquierda.
const spine = (gid, b, x, w, h, opt = {}) => {
  const y = SHELF_Y - h;
  const band = opt.band || '#fde68a';
  return (
    <g key={opt.key} transform={opt.lean ? `rotate(${-opt.lean} ${x} ${SHELF_Y})` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx="1.2" fill={`url(#${gid})`} stroke={b.line} strokeWidth="1.3" />
      <rect x={x + 0.7} y={y + h * 0.12} width={w - 1.4} height="1.3" fill={band} />
      <rect x={x + 0.7} y={y + h * 0.82} width={w - 1.4} height="1.3" fill={band} />
      {opt.label && <rect x={x + 1.2} y={y + h * 0.36} width={w - 2.4} height={Math.min(6, h * 0.22)} rx="0.6" fill="#fff" opacity="0.85" />}
      {opt.dot && <circle cx={x + w / 2} cy={y + h * 0.5} r={Math.min(1.5, w * 0.24)} fill={band} />}
      <rect x={x + 0.85} y={y + 1} width="0.95" height={h - 2} rx="0.48" fill="#fff" opacity="0.42" />
    </g>
  );
};

// Balda + escuadras + etiqueta con el número.
const shelf = (id, m, e, n) => (
  <>
    <defs>{metal(`${id}sh`, m, 0)}</defs>
    {ground(id, 32, 60, 20, 1.8)}
    {/* sombra de los libros sobre la balda */}
    <rect x="11" y={SHELF_Y - 1} width="42" height="1.4" rx="0.7" fill={m.line} opacity="0.25" />
    <path d="M13.2 50 V55.8 L19 50 Z M50.8 50 V55.8 L45 50 Z" fill={`url(#${id}sh)`} stroke={m.line} strokeWidth="1.2" strokeLinejoin="round" />
    <rect x="8.6" y={SHELF_Y} width="46.8" height="4.8" rx="1.6" fill={`url(#${id}sh)`} stroke={m.line} strokeWidth="1.5" />
    <rect x="10.2" y={SHELF_Y + 0.8} width="43.6" height="1" rx="0.5" fill="#fff" opacity="0.55" />
    {plaque(id, { cx: 32, cy: 55, w: 16.4, h: 10.8, m, e, text: n, fs: 10 })}
  </>
);

// Birrete (asignaturas 8).
const mortarboard = (id, x, y) => (
  <g>
    <defs>
      {lin(`${id}mb`, [[0, '#6f6cf0'], [0.5, '#3a32b8'], [1, '#1c1666']], 0, 0, 0.6, 1)}
      {lin(`${id}mt`, [[0, '#fff3b0'], [1, '#d58a0a']])}
    </defs>
    <path d={`M${x - 6} ${y + 1.5} V${y + 5.8} Q${x} ${y + 8.6} ${x + 6} ${y + 5.8} V${y + 1.5} Z`} fill={`url(#${id}mb)`} stroke="#140f4a" strokeWidth="1.3" />
    <path d={`M${x - 13} ${y} L${x} ${y - 5.4} L${x + 13} ${y} L${x} ${y + 5.4} Z`} fill={`url(#${id}mb)`} stroke="#140f4a" strokeWidth="1.5" strokeLinejoin="round" />
    <path d={`M${x - 10.4} ${y - 0.2} L${x} ${y - 4.4}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
    <circle cx={x} cy={y} r="1.3" fill="#fcd34d" stroke="#7a3d05" strokeWidth="0.8" />
    <g className="ba-anim anim-sway" style={at(x, y)}>
      <path d={`M${x} ${y} Q${x + 8} ${y + 0.6} ${x + 10} ${y + 5}`} fill="none" stroke="#f5b80b" strokeWidth="1.1" strokeLinecap="round" />
      <path d={`M${x + 8.6} ${y + 4.6} H${x + 11.4} L${x + 12.2} ${y + 10} H${x + 7.8} Z`} fill={`url(#${id}mt)`} stroke="#7a3d05" strokeWidth="0.9" strokeLinejoin="round" />
    </g>
  </g>
);

const SUBJECTS = {
  subjects_1: (id) => (
    <>
      <defs>
        {lin(`${id}cv`, [[0, '#9aa6ff'], [0.45, '#6366f1'], [1, '#3730a3']], 0, 0, 0.9, 1)}
        {lin(`${id}pg`, [[0, '#fffaf0'], [1, '#f2dfbd']], 0, 0, 1, 0)}
        {lin(`${id}sp`, [[0, '#4f46e5'], [1, '#262083']], 0, 0, 1, 0)}
        {lin(`${id}sh2`, [[0.55, '#262083', 0], [1, '#262083', 0.5]], 0, 0, 1, 0)}
        {lin(`${id}em`, [[0, '#fff7d4'], [0.5, '#fcc434'], [1, '#c4780a']])}
        <GlossGradient id={`${id}gl`} opacity={0.55} />
      </defs>
      {halo(id, 32, 28, 22, '#a5b4fc', 0.45)}
      {shelf(id, MAT.wood, ENAMEL.indigo, '1')}
      {/* bloque de páginas (lateral) */}
      <path d="M41.6 11.6 L45.8 14 V44.4 L41.6 45.5 Z" fill={`url(#${id}pg)`} stroke="#7a5a2e" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M43 16.4 V43 M44.4 17 V42.6" stroke="#d8c39d" strokeWidth="0.8" />
      {/* lomo */}
      <rect x="19" y="10.6" width="5.8" height="34.9" rx="2" fill={`url(#${id}sp)`} stroke="#262083" strokeWidth="1.4" />
      {/* tapa */}
      <rect x="22.2" y="10.6" width="19.8" height="34.9" rx="1.8" fill={`url(#${id}cv)`} stroke="#262083" strokeWidth="1.7" />
      <rect x="22.2" y="10.6" width="19.8" height="34.9" rx="1.8" fill={`url(#${id}sh2)`} />
      <rect x="23.8" y="12" width="16.6" height="11" rx="1.2" fill={`url(#${id}gl)`} />
      {/* marco dorado + emblema */}
      <rect x="24.8" y="14" width="14.6" height="28" rx="1" fill="none" stroke="#fcd34d" strokeWidth="0.9" opacity="0.9" />
      <circle cx="32.1" cy="26.4" r="6" fill={`url(#${id}em)`} stroke="#7a3d05" strokeWidth="1.2" />
      <path d={star5(32.1, 26.8, 3.9)} fill="#fff7d4" stroke="#b45309" strokeWidth="0.8" strokeLinejoin="round" />
      <rect x="27" y="35.4" width="10.4" height="1.4" rx="0.7" fill="#c7d2fe" opacity="0.85" />
      <rect x="28.4" y="38.4" width="7.6" height="1.4" rx="0.7" fill="#c7d2fe" opacity="0.7" />
      {/* cinta marcapáginas */}
      <path d="M36.8 45 V50.6 L38.3 49.2 L39.8 50.6 V45" fill="#ec4899" stroke="#6f0f37" strokeWidth="0.9" strokeLinejoin="round" />
      {twinkle(50, 10, 2.8, '#fde68a')}
    </>
  ),
  subjects_3: (id) => (
    <>
      <defs>
        {bookDef(`${id}b1`, BOOK.pink)}
        {bookDef(`${id}b2`, BOOK.amber)}
        {bookDef(`${id}b3`, BOOK.indigo)}
      </defs>
      {halo(id, 32, 28, 23, '#fbcfe8', 0.5)}
      {shelf(id, MAT.wood, ENAMEL.indigo, '3')}
      {spine(`${id}b1`, BOOK.pink, 13.8, 9, 30, { label: true })}
      {spine(`${id}b2`, BOOK.amber, 22.8, 10, 35, { dot: true, band: '#fff7d4' })}
      {spine(`${id}b3`, BOOK.indigo, 40.6, 9, 31, { label: true, lean: 14 })}
      {twinkle(51, 10, 2.8, '#fde68a')}
    </>
  ),
  subjects_5: (id) => (
    <>
      <defs>
        {bookDef(`${id}b1`, BOOK.emerald)}
        {bookDef(`${id}b2`, BOOK.pink)}
        {bookDef(`${id}b3`, BOOK.amber)}
        {bookDef(`${id}b4`, BOOK.indigo)}
        {bookDef(`${id}b5`, BOOK.cyan)}
      </defs>
      {halo(id, 32, 27, 24, '#c4b5fd', 0.5)}
      {shelf(id, MAT.bronze, ENAMEL.violet, '5')}
      {spine(`${id}b1`, BOOK.emerald, 10.8, 7, 28, { dot: true })}
      {spine(`${id}b2`, BOOK.pink, 17.8, 7.4, 32.5, { label: true })}
      {spine(`${id}b3`, BOOK.amber, 25.2, 8, 36, { dot: true, band: '#fff7d4' })}
      {spine(`${id}b4`, BOOK.indigo, 33.2, 7.4, 31, { label: true })}
      {spine(`${id}b5`, BOOK.cyan, 47.2, 7, 28, { dot: true, lean: 14 })}
      {twinkle(52, 9, 2.8, '#fff')}
    </>
  ),
  subjects_8: (id) => (
    <>
      <defs>
        {[BOOK.red, BOOK.amber, BOOK.emerald, BOOK.pink, BOOK.indigo, BOOK.cyan, BOOK.violet, BOOK.sky].map((b, i) => (
          <React.Fragment key={i}>{bookDef(`${id}b${i}`, b)}</React.Fragment>
        ))}
      </defs>
      {halo(id, 32, 26, 28, '#fde047', 0.55)}
      {shelf(id, MAT.gold, ENAMEL.violet, '8')}
      {[
        [BOOK.red, 9.8, 4.7, 25, { dot: true }],
        [BOOK.amber, 14.5, 5, 28.5, { band: '#fff7d4' }],
        [BOOK.emerald, 19.5, 4.7, 26.5, { dot: true }],
        [BOOK.pink, 24.2, 5.2, 30.5, {}],
        [BOOK.indigo, 29.4, 5.4, 29.5, { dot: true }],
        [BOOK.cyan, 34.8, 4.8, 27, {}],
        [BOOK.violet, 39.6, 5, 28.5, { dot: true }],
        [BOOK.sky, 50.4, 4.6, 24.5, { lean: 14 }],
      ].map(([b, x, w, h, o], i) => spine(`${id}b${i}`, b, x, w, h, { ...o, key: i }))}
      {mortarboard(id, 28.6, 13.2)}
      {twinkle(53, 9, 2.8, '#fff')}
      {twinkle(9.5, 13, 2, '#fde68a', 'anim-twinkle-2')}
    </>
  ),
};

// ═════════════════════════════ RANKING ═══════════════════════════════════════
// Laurel: hojas a lo largo de un arco (grados SVG: 90 = abajo, 180 = izquierda).
const LEAF = 'M0 -3.3 Q1.75 0 0 3.3 Q-1.75 0 0 -3.3 Z';
const laurel = (gid, line, { cx = 32, cy = 33, R, a0, a1, n, mirror }) => {
  const leaves = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = a0 + (a1 - a0) * t;
    const ar = (a * Math.PI) / 180;
    const side = i % 2 ? 1 : -1;
    const rr = R + side * 1.4;
    const x = cx + Math.cos(ar) * rr;
    const y = cy + Math.sin(ar) * rr;
    const rot = a + 270 + side * 28;
    const s = 0.8 + 0.25 * (1 - t);
    leaves.push(
      <path key={i} d={LEAF} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(2)})`}
            fill={`url(#${gid})`} stroke={line} strokeWidth="0.9" strokeLinejoin="round" />,
    );
  }
  const p = (a) => [cx + Math.cos((a * Math.PI) / 180) * R, cy + Math.sin((a * Math.PI) / 180) * R];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return (
    <g transform={mirror ? `matrix(-1 0 0 1 ${cx * 2} 0)` : undefined}>
      <path d={`M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`} fill="none" stroke={line} strokeWidth="1.2" strokeLinecap="round" />
      {leaves}
    </g>
  );
};

// ─── Top 10: escudo con «10» y estrellas (una por vez, hasta 5) ───
const SHIELD = 'M32 6 C38.5 9.4 44.6 10.8 51 10.6 V29 C51 42.6 43.2 51.4 32 57 C20.8 51.4 13 42.6 13 29 V10.6 C19.4 10.8 25.5 9.4 32 6 Z';
const SHIELD_IN = 'M32 9.8 C37.6 12.5 42.6 13.8 47.6 13.9 V29 C47.6 40.4 41.3 48 32 53 C22.7 48 16.4 40.4 16.4 29 V13.9 C21.4 13.8 26.4 12.5 32 9.8 Z';
const STARS = {
  1: [[32, 20.6, 3.8]],
  3: [[24.6, 21.6, 2.7], [32, 19.2, 3.2], [39.4, 21.6, 2.7]],
  5: [[21.4, 23, 2.2], [26.4, 20.2, 2.5], [32, 18.8, 2.9], [37.6, 20.2, 2.5], [42.6, 23, 2.2]],
};
const shield = (id, { m, e, stars, wreath, chipN, gid }) => (
  <>
    <defs>
      {metal(`${id}sr`, m, 0.5)}
      {rad(`${id}se`, [[0, e.hi], [0.5, e.base], [1, e.dark]], 0.35, 0.25, 0.9)}
      {lin(`${id}ss`, [[0.5, m.line, 0], [1, m.line, 0.45]], 0, 0, 1, 0)}
      {lin(`${id}st`, [[0, '#fffbe6'], [0.5, '#fcd34d'], [1, '#d9900f']])}
      {lin(`${id}lf`, [[0, '#fff3b0'], [0.5, '#f5b80b'], [1, '#b8680a']])}
      <GlossGradient id={`${id}sg`} opacity={0.55} />
    </defs>
    {ground(id, 32, 59.6, 15, 1.8)}
    {wreath && laurel(`${id}lf`, '#7a3d05', { R: 22.5, a0: 112, a1: 228, n: 9, cy: 33 })}
    {wreath && laurel(`${id}lf`, '#7a3d05', { R: 22.5, a0: 112, a1: 228, n: 9, cy: 33, mirror: true })}
    <path d={SHIELD} fill={`url(#${id}sr)`} stroke={m.line} strokeWidth="1.9" strokeLinejoin="round" />
    <path d={SHIELD_IN} fill={`url(#${id}se)`} stroke={m.line} strokeWidth="0.9" strokeOpacity="0.7" />
    <path d={SHIELD_IN} fill={`url(#${id}ss)`} />
    <path d="M18.4 15.6 C22.6 15.2 27 14 31.2 12 V22 C26 23.4 21.6 26.2 18.4 30 Z" fill={`url(#${id}sg)`} />
    <path d="M14.8 13 V29 C14.8 34 16 38.4 18 42" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
    {gid && gem(gid, 32, 8.6, 1.9, m.line)}
    {STARS[stars].map(([x, y, r], i) => (
      <path key={i} d={star5(x, y, r)} fill={`url(#${id}st)`} stroke="#7a3d05" strokeWidth="0.8" strokeLinejoin="round" />
    ))}
    <text x="32" y="43" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="19.5"
          fill="#fff" stroke={e.dark} strokeWidth="2" strokeLinejoin="round" paintOrder="stroke">10</text>
    {chipN && chip(id, 47.6, 48.4, chipN)}
  </>
);

// ─── Top 3: podio dorado/plateado/bronce sobre peana índigo ───
const POD_B = 51.6;
const podium = (id) => {
  const blocks = [
    { k: 2, x: 8, w: 15, y: 34.6, mat: MAT.silver, fs: 10 },
    { k: 1, x: 23, w: 18, y: 27, mat: MAT.gold, fs: 12 },
    { k: 3, x: 41, w: 15, y: 38.6, mat: MAT.bronze, fs: 9.4 },
  ];
  return (
    <>
      <defs>
        {blocks.map((b) => <React.Fragment key={b.k}>{metal(`${id}pd${b.k}`, b.mat, 0.6)}</React.Fragment>)}
        {lin(`${id}pb`, [[0, '#8f92ff'], [0.5, '#4f46e5'], [1, '#231c7a']])}
      </defs>
      {ground(id, 32, 59.8, 24, 1.9)}
      {blocks.map((b) => (
        <g key={b.k}>
          <path d={`M${b.x + 1.4} ${b.y - 2.6} H${b.x + b.w - 1.4} L${b.x + b.w} ${b.y} H${b.x} Z`} fill={b.mat.hi} stroke={b.mat.line} strokeWidth="1.2" strokeLinejoin="round" />
          <rect x={b.x} y={b.y} width={b.w} height={POD_B - b.y} fill={`url(#${id}pd${b.k})`} stroke={b.mat.line} strokeWidth="1.5" strokeLinejoin="round" />
          <rect x={b.x + 1.2} y={b.y + 1.2} width="1.1" height={POD_B - b.y - 2.6} rx="0.55" fill="#fff" opacity="0.6" />
          <text x={b.x + b.w / 2} y={b.y + (POD_B - b.y) / 2 + b.fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight="700"
                fontSize={b.fs} fill="#fff" stroke={b.mat.line} strokeWidth="1.6" strokeLinejoin="round" paintOrder="stroke">{b.k}</text>
        </g>
      ))}
      <rect x="5.8" y={POD_B - 0.2} width="52.4" height="5.4" rx="2.3" fill={`url(#${id}pb)`} stroke="#1a1460" strokeWidth="1.5" />
      <rect x="7.8" y={POD_B + 0.6} width="48.4" height="1.1" rx="0.55" fill="#fff" opacity="0.45" />
    </>
  );
};

// Copa sobre el escalón 1.
const cup = (id, cx, y, m = MAT.gold) => {
  const ear = (s) => `M${cx + s * 7.4} ${y + 1.6} C${cx + s * 11.6} ${y + 1.6} ${cx + s * 11.2} ${y + 8.6} ${cx + s * 5.2} ${y + 9}`;
  return (
    <g>
      <defs>{metal(`${id}cu`, m, 0.6)}</defs>
      {[-1, 1].map((s) => (
        <g key={s} fill="none" strokeLinecap="round">
          <path d={ear(s)} stroke={m.line} strokeWidth="3.4" />
          <path d={ear(s)} stroke={m.base} strokeWidth="1.5" />
        </g>
      ))}
      <path d={`M${cx - 8} ${y} H${cx + 8} V${y + 4.2} C${cx + 8} ${y + 10} ${cx + 4.4} ${y + 13} ${cx} ${y + 13.4} C${cx - 4.4} ${y + 13} ${cx - 8} ${y + 10} ${cx - 8} ${y + 4.2} Z`}
            fill={`url(#${id}cu)`} stroke={m.line} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={`M${cx - 5.6} ${y + 2} V${y + 5} C${cx - 5.6} ${y + 8} ${cx - 4} ${y + 10} ${cx - 2.2} ${y + 11}`} fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round" />
      <rect x={cx - 1.6} y={y + 13} width="3.2" height="3.6" fill={`url(#${id}cu)`} stroke={m.line} strokeWidth="1.1" />
      <rect x={cx - 5.2} y={y + 16.2} width="10.4" height="3.2" rx="1" fill={`url(#${id}cu)`} stroke={m.line} strokeWidth="1.3" />
      <path d={star5(cx, y + 5.8, 2.6)} fill="#fff7d4" stroke={m.line} strokeWidth="0.8" strokeLinejoin="round" />
    </g>
  );
};

// ─── Primero: corona sobre cojín ───
const CROWN3 = 'M14.4 39 L11 19.4 L21.4 28.6 L32 13 L42.6 28.6 L53 19.4 L49.6 39 Z';
const CROWN5 = 'M14.4 39 L10.6 20.6 L18.6 28.8 L23.4 17 L28 27.4 L32 12.6 L36 27.4 L40.6 17 L45.4 28.8 L53.4 20.6 L49.6 39 Z';
const TIPS3 = [[11, 19.4, 2.6], [32, 13, 3.1], [53, 19.4, 2.6]];
const TIPS5 = [[10.6, 20.6, 2.3], [23.4, 17, 2.3], [32, 12.6, 2.9], [40.6, 17, 2.3], [53.4, 20.6, 2.3]];
const CUSHION = {
  indigo: { hi: '#b9c2ff', base: '#5d60e6', dark: '#29248e', line: '#1a1660' },
  red:    { hi: '#ff8fa8', base: '#e11d48', dark: '#7a0b26', line: '#4c0519' },
  violet: { hi: '#c9b2ff', base: '#7c3aed', dark: '#2e1065', line: '#1e0a4a' },
};
const crown = (id, { five, velvet, gems, cushion, tassels }) => (
  <>
    <defs>
      {metal(`${id}cr`, MAT.gold, 0.5)}
      {lin(`${id}cs`, [[0.5, MAT.gold.line, 0], [1, MAT.gold.line, 0.4]], 0, 0, 1, 0)}
      {rad(`${id}pl`, [[0, '#ffffff'], [0.6, '#f3eee4'], [1, '#b9ad97']], 0.35, 0.3, 0.75)}
      {gemDef(`${id}g1`, GEM.ruby)}
      {gemDef(`${id}g2`, GEM.sapphire)}
      {gemDef(`${id}g3`, GEM.emerald)}
      {velvet && rad(`${id}vv`, [[0, '#c69bff'], [0.55, '#7c3aed'], [1, '#2e1065']], 0.45, 0.3, 0.8)}
      {lin(`${id}cu`, [[0, cushion.hi], [0.5, cushion.base], [1, cushion.dark]])}
    </defs>
    {ground(id, 32, 59.2, 23, 2)}
    {/* cojín */}
    <path d="M7.4 48.2 C7.4 42.8 13.4 42 32 42 C50.6 42 56.6 42.8 56.6 48.2 C56.6 53.4 50.6 55.2 32 55.2 C13.4 55.2 7.4 53.4 7.4 48.2 Z"
          fill={`url(#${id}cu)`} stroke={cushion.line} strokeWidth="1.7" />
    <path d="M11 46 C14 44 22 43.6 32 43.6" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
    {tassels && (
      <>
        <path d="M9.2 50.4 C14 52.6 22 53.4 32 53.4 C42 53.4 50 52.6 54.8 50.4" fill="none" stroke="#fcd34d" strokeWidth="1.1" strokeDasharray="1.6 1.4" />
        <path d="M8.4 48.6 l-2.2 5 h3.8 Z M55.6 48.6 l2.2 5 h-3.8 Z" fill="#fcd34d" stroke="#7a3d05" strokeWidth="0.9" strokeLinejoin="round" />
      </>
    )}
    <g className="ba-anim anim-bob" style={MID}>
      {velvet && <path d="M15 38.6 C13.6 7 50.4 7 49 38.6 Z" fill={`url(#${id}vv)`} stroke="#2e1065" strokeWidth="1.4" />}
      <path d={five ? CROWN5 : CROWN3} fill={`url(#${id}cr)`} stroke={MAT.gold.line} strokeWidth="1.9" strokeLinejoin="round" />
      <path d={five ? CROWN5 : CROWN3} fill={`url(#${id}cs)`} />
      <path d="M15.6 36.4 L13.4 23.8" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.3" strokeLinecap="round" />
      {(five ? TIPS5 : TIPS3).map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={`url(#${id}pl)`} stroke={MAT.gold.line} strokeWidth="1.1" />
          <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.3} fill="#fff" />
        </g>
      ))}
      {/* banda */}
      <rect x="12.6" y="37.6" width="38.8" height="8.4" rx="2.4" fill={`url(#${id}cr)`} stroke={MAT.gold.line} strokeWidth="1.8" />
      <rect x="14.4" y="38.6" width="35.2" height="1.4" rx="0.7" fill="#fff" opacity="0.6" />
      {gem(`${id}g1`, 32, 41.8, 2.7, MAT.gold.line)}
      {gems >= 3 && gem(`${id}g2`, 22.4, 41.8, 1.9, MAT.gold.line)}
      {gems >= 3 && gem(`${id}g3`, 41.6, 41.8, 1.9, MAT.gold.line)}
      {gems >= 5 && gem(`${id}g3`, 16.4, 41.8, 1.3, MAT.gold.line)}
      {gems >= 5 && gem(`${id}g2`, 47.6, 41.8, 1.3, MAT.gold.line)}
    </g>
  </>
);

const RANK = {
  rank_top10_1: (id) => shield(id, { m: MAT.silver, e: ENAMEL.indigo, stars: 1 }),
  rank_top10_3: (id) => (
    <>
      {shield(id, { m: MAT.silver, e: ENAMEL.indigo, stars: 3, chipN: 3 })}
      {twinkle(52, 9, 2.4, '#fff')}
    </>
  ),
  rank_top10_5: (id) => (
    <>
      {shield(id, { m: MAT.gold, e: ENAMEL.indigo, stars: 5, chipN: 5 })}
      {twinkle(52, 8, 2.6, '#fff')}
    </>
  ),
  rank_top10_10: (id) => (
    <>
      <defs>{gemDef(`${id}gm`, GEM.ruby)}</defs>
      {halo(id, 32, 32, 32, '#c084fc', 0.5)}
      {shield(id, { m: MAT.gold, e: ENAMEL.violet, stars: 5, chipN: 10, wreath: true, gid: `${id}gm` })}
      {twinkle(53, 8, 2.6, '#fff')}
      {twinkle(10.5, 9, 2, '#fde68a', 'anim-twinkle-2')}
    </>
  ),

  rank_top3_1: (id) => (
    <>
      <defs>{lin(`${id}bs`, [[0, '#fffbe6'], [0.45, '#fcd34d'], [1, '#d9900f']])}</defs>
      {halo(id, 32, 15, 16, '#fde047', 0.6)}
      {podium(id)}
      <g className="ba-anim anim-bob" style={MID}>
        <path d={star5(32, 14.6, 9.6)} fill={`url(#${id}bs)`} stroke="#7a3d05" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M28 11.4 L31 8.8" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      </g>
      {twinkle(50, 12, 2.6, '#fff')}
    </>
  ),
  rank_top3_3: (id) => (
    <>
      {halo(id, 32, 15, 17, '#fde047', 0.55)}
      {podium(id)}
      <g className="ba-anim anim-bob" style={MID}>{cup(id, 32, 5)}</g>
      {chip(id, 51, 15.6, 3, CHIP.indigo)}
    </>
  ),
  rank_top3_5: (id) => (
    <>
      <defs>{lin(`${id}lf`, [[0, '#d9fbe8'], [0.5, '#34d399'], [1, '#047857']])}</defs>
      {halo(id, 32, 15, 20, '#fde047', 0.65)}
      {laurel(`${id}lf`, '#064e3b', { cx: 32, cy: 15, R: 12.6, a0: 95, a1: 205, n: 6 })}
      {laurel(`${id}lf`, '#064e3b', { cx: 32, cy: 15, R: 12.6, a0: 95, a1: 205, n: 6, mirror: true })}
      {podium(id)}
      <g className="ba-anim anim-bob" style={MID}>{cup(id, 32, 5)}</g>
      {chip(id, 51.4, 15.4, 5, CHIP.pink)}
      {twinkle(11, 11, 2.4, '#fff')}
    </>
  ),

  rank_first_1: (id) => (
    <>
      {halo(id, 32, 30, 26, '#fde047', 0.55)}
      {crown(id, { gems: 1, cushion: CUSHION.indigo })}
      {twinkle(52, 10, 2.6, '#fff')}
    </>
  ),
  rank_first_3: (id) => (
    <>
      {halo(id, 32, 30, 28, '#fde047', 0.6)}
      {crown(id, { five: true, gems: 3, cushion: CUSHION.red, tassels: true })}
      {chip(id, 50, 50.4, 3, CHIP.indigo)}
    </>
  ),
  rank_first_5: (id) => (
    <>
      {halo(id, 32, 30, 31, '#f0abfc', 0.6)}
      {crown(id, { five: true, gems: 5, velvet: true, cushion: CUSHION.violet, tassels: true })}
      {chip(id, 50, 50.4, 5, CHIP.pink)}
      {twinkle(52.5, 9, 2.6, '#fff')}
      {twinkle(10, 11, 2, '#fde68a', 'anim-twinkle-2')}
    </>
  ),
};

const BADGES = { ...STREAK, ...TIME, ...SUBJECTS, ...RANK };

export default BADGES;
