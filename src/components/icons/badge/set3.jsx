// Insignias redibujadas (rediseño 2026). Formato y reglas: src/components/icons/badge/README.md
// CODES de este set: rank_class3_1, rank_class3_3, rank_class3_5, rank_class3_10, rank_class1_1, rank_class1_3, rank_class1_5, battle_win_1, battle_win_3, battle_win_5, battle_podium_1, battle_podium_3, battle_podium_5, battle_podium_10, battle_played_10, battle_played_25, teacher_first_group, teacher_groups_3, teacher_groups_5, teacher_students_5, teacher_students_25, teacher_students_50, teacher_first_task, teacher_tasks_5, teacher_tasks_15, teacher_tasks_30, teacher_first_battle, teacher_battles_5, teacher_battles_15, teacher_first_message, teacher_messages_10, teacher_messages_25, teacher_messages_50, teacher_days_7, teacher_days_30, teacher_days_90, teacher_first_rating, teacher_ratings_10
//
// Familias y progresión:
//   · rank_class3_*  Pizarra de clase con el podio a tiza + estrella. ×3 → estrellas extra,
//                    ×5 → laurel, ×10 → marco de oro, laurel dorado y rayos.
//   · rank_class1_*  Escarapela con botón de oro "1". ×3 → laurel, ×5 → corona y rayos.
//   · battle_*       Quiz Battle: el RAYO es el emblema común (copa, podio, escudo).
//   · teacher_*      Logros del DOCENTE: todas llevan la MANZANA como sello (arriba a la
//                    derecha). Manzana roja en los primeros escalones, de oro en los altos.
//                    El número de cada contador va en una cinta (o en la hoja del calendario).
import React from 'react';

/* ==========================================================================
   Piezas comunes
   ========================================================================== */

// Texto dibujado (números de cintas, placas y calendarios).
const F = { fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: '700', textAnchor: 'middle' };

// Materiales: [luz, base, sombra, perfil]. El perfil es el tono oscuro teñido con
// el que se contornea cada pieza (nunca negro) para que se lea a 36 px.
const M = {
  gold: ['#FEF3C7', '#FBBF24', '#C2780A', '#92400E'],
  silver: ['#FFFFFF', '#D5DCE6', '#7C8AA0', '#475569'],
  bronze: ['#FFE1C2', '#F0995A', '#A5501F', '#7C2D12'],
  indigo: ['#C7D2FE', '#6366F1', '#3730A3', '#312E81'],
  violet: ['#EDE0FF', '#8B5CF6', '#5B21B6', '#4C1D95'],
  pink: ['#FCE7F3', '#EC4899', '#A3195B', '#831843'],
  red: ['#FFD1D1', '#EF4444', '#A11D1D', '#7F1D1D'],
  apple: ['#FFB4B4', '#EF4444', '#B91C1C', '#7F1D1D'],
  leaf: ['#D9F99D', '#4ADE80', '#15803D', '#166534'],
  emerald: ['#A7F3D0', '#10B981', '#047857', '#064E3B'],
  navy: ['#A5B4FC', '#4F46E5', '#26206B', '#1E1B4B'],
  wood: ['#FDE1B8', '#C98A4B', '#7A3B12', '#5B2A0C'],
  board: ['#3FA58A', '#1B6B57', '#0B3A31', '#062A23'],
  paper: ['#FFFFFF', '#F8FAFC', '#DCE3F0', '#94A3B8'],
  cream: ['#FFFFFF', '#FFF7E6', '#F5D9A8', '#B45309'],
  slate: ['#E2E8F0', '#94A3B8', '#475569', '#334155'],
};

const url = (id, k) => `url(#${id}${k})`;
const f2 = (n) => Number(n.toFixed(2));

// Degradado de material (luz arriba-izquierda → base → sombra abajo-derecha).
const Lin = ({ id, k, m, x1 = 0.15, y1 = 0, x2 = 0.85, y2 = 1 }) => (
  <linearGradient id={`${id}${k}`} x1={x1} y1={y1} x2={x2} y2={y2}>
    <stop offset="0" stopColor={m[0]} />
    <stop offset="0.5" stopColor={m[1]} />
    <stop offset="1" stopColor={m[2]} />
  </linearGradient>
);

// Volumen redondo (esferas, botones, cúpulas).
const Rad = ({ id, k, m, cx = 0.36, cy = 0.3, r = 0.78 }) => (
  <radialGradient id={`${id}${k}`} cx={cx} cy={cy} r={r}>
    <stop offset="0" stopColor={m[0]} />
    <stop offset="0.45" stopColor={m[1]} />
    <stop offset="1" stopColor={m[2]} />
  </radialGradient>
);

// Halo / sombra de contacto: color → transparente.
const Glow = ({ id, k, color, op = 0.5 }) => (
  <radialGradient id={`${id}${k}`} cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor={color} stopOpacity={op} />
    <stop offset="0.6" stopColor={color} stopOpacity={op * 0.35} />
    <stop offset="1" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

// Destello de 4 puntas.
const sparkD = (x, y, r) => {
  const q = r * 0.14;
  return `M${x} ${y - r} Q${x + q} ${y - q} ${x + r} ${y} Q${x + q} ${y + q} ${x} ${y + r} Q${x - q} ${y + q} ${x - r} ${y} Q${x - q} ${y - q} ${x} ${y - r} Z`;
};

// Destellos ámbar con núcleo blanco (se ven sobre cualquier cara del medallón).
const Sparks = ({ pts, anim = 'twinkle' }) => (
  <g className={`ba-anim anim-${anim}`} style={{ transformOrigin: '50% 50%' }}>
    {pts.map(([x, y, r, c = '#F59E0B'], i) => (
      <g key={i}>
        <path d={sparkD(x, y, r)} fill={c} />
        <path d={sparkD(x, y, r * 0.45)} fill="#FFFFFF" />
      </g>
    ))}
  </g>
);

// Puntos de una estrella de n puntas.
const starPts = (cx, cy, R, r, n = 5) => Array.from({ length: n * 2 }, (_, i) => {
  const a = ((-90 + (i * 180) / n) * Math.PI) / 180;
  const rr = i % 2 ? r : R;
  return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
});
const ptsD = (pts) => `${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f2(x)} ${f2(y)}`).join(' ')} Z`;

// Estrella biselada: cada punta con una cara clara y otra en sombra.
const Star = ({ id, k = 'st', cx, cy, R, r = R * 0.5, m = M.gold, sw = 1.4 }) => {
  const p = starPts(cx, cy, R, r);
  return (
    <g>
      <defs><Lin id={id} k={k} m={m} /></defs>
      <path d={ptsD(p)} fill={url(id, k)} stroke={m[3]} strokeWidth={sw} strokeLinejoin="round" />
      {p.map((pt, i) => (i % 2 ? null : (
        <g key={i}>
          <path d={ptsD([[cx, cy], p[(i + 9) % 10], pt])} fill="#FFFFFF" opacity="0.32" />
          <path d={ptsD([[cx, cy], pt, p[(i + 1) % 10]])} fill={m[3]} opacity="0.14" />
        </g>
      )))}
      <path d={sparkD(cx - R * 0.28, cy - R * 0.3, R * 0.22)} fill="#FFFFFF" opacity="0.95" />
    </g>
  );
};

// Rayo de Quiz Battle (centrado en 0,0; alto 18).
const BOLT = 'M-0.5 -9 H5 L1.5 -2.2 H5.5 L-3 9 L-0.8 1.2 H-5 Z';
const Bolt = ({ id, k = 'bo', x, y, s = 1, m = M.gold }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs><Lin id={id} k={k} m={m} /></defs>
    <path d={BOLT} fill={url(id, k)} stroke={m[3]} strokeWidth={1.5 / s} strokeLinejoin="round" />
    <path d="M0.4 -7.6 H3.2 L0.4 -2.6" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth={0.9 / s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M-1.6 4.6 L3.4 -1" stroke={m[3]} strokeOpacity="0.25" strokeWidth={1 / s} strokeLinecap="round" />
  </g>
);

// Cinta con el número del contador (siempre en la franja inferior).
const Ribbon = ({ id, k = 'rb', text, m = M.indigo, cy = 52, w = 26, fs = 9.6, dark = false }) => {
  const h = 10.4;
  const x0 = 32 - w / 2;
  const x1 = 32 + w / 2;
  const y0 = cy - h / 2;
  const d = 2.4;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m[0]} />
          <stop offset="0.38" stopColor={m[1]} />
          <stop offset="1" stopColor={m[2]} />
        </linearGradient>
      </defs>
      <path d={`M${x0 + 2.5} ${y0 + d} H${x0 - 6} L${x0 - 3.3} ${cy + d} L${x0 - 6} ${y0 + h + d} H${x0 + 2.5} Z`} fill={m[2]} stroke={m[3]} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={`M${x1 - 2.5} ${y0 + d} H${x1 + 6} L${x1 + 3.3} ${cy + d} L${x1 + 6} ${y0 + h + d} H${x1 - 2.5} Z`} fill={m[2]} stroke={m[3]} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={`M${x0} ${y0 + h} L${x0 + 2.5} ${y0 + h + d} V${y0 + h} Z`} fill={m[3]} />
      <path d={`M${x1} ${y0 + h} L${x1 - 2.5} ${y0 + h + d} V${y0 + h} Z`} fill={m[3]} />
      <path d={`M${x0} ${y0} Q32 ${y0 - 2} ${x1} ${y0} V${y0 + h} Q32 ${y0 + h - 2} ${x0} ${y0 + h} Z`} fill={url(id, k)} stroke={m[3]} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={`M${x0 + 1.6} ${y0 + 1.3} Q32 ${y0 - 0.6} ${x1 - 1.6} ${y0 + 1.3}`} stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <text {...F} x="32" y={f2(cy + fs * 0.35 + 0.1)} fontSize={fs} fill={dark ? '#FFF7E0' : m[3]}>{text}</text>
      <text {...F} x="32" y={f2(cy + fs * 0.35 - 0.6)} fontSize={fs} fill={dark ? m[3] : '#FFFFFF'}>{text}</text>
    </g>
  );
};

// Rama de laurel doble (izquierda y su espejo). Ángulos en grados SVG (90 = abajo).
const LEAF_D = 'M0 0 C2.3 -1.8 2.3 -5 0 -6.8 C-2.3 -5 -2.3 -1.8 0 0 Z';
const Laurel = ({ id, k = 'la', cx = 32, cy = 32, r = 24, from = 112, to = 226, n = 6, m = M.leaf }) => {
  const P = (t) => [cx + r * Math.cos((t * Math.PI) / 180), cy + r * Math.sin((t * Math.PI) / 180)];
  const [sx, sy] = P(from);
  const [ex, ey] = P(to);
  const branch = (
    <>
      <path d={`M${f2(sx)} ${f2(sy)} A${r} ${r} 0 0 1 ${f2(ex)} ${f2(ey)}`} stroke={m[3]} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {Array.from({ length: n }, (_, i) => {
        const t = from + ((to - from) * (i + 0.6)) / n;
        const [x, y] = P(t);
        return (
          <path key={i} d={LEAF_D} transform={`translate(${f2(x)} ${f2(y)}) rotate(${f2(t - 180 + (i % 2 ? 30 : -38))})`}
            fill={url(id, k)} stroke={m[3]} strokeWidth="0.85" strokeLinejoin="round" />
        );
      })}
      <path d={LEAF_D} transform={`translate(${f2(ex)} ${f2(ey)}) rotate(${f2(to - 180 + 8)})`} fill={url(id, k)} stroke={m[3]} strokeWidth="0.85" strokeLinejoin="round" />
    </>
  );
  return (
    <g>
      <defs><Lin id={id} k={k} m={m} /></defs>
      <g>{branch}</g>
      <g transform={`translate(${cx * 2} 0) scale(-1 1)`}>{branch}</g>
    </g>
  );
};

// Rayos de gloria (giran solo en el modal).
const Rays = ({ id, k = 'ry', cx = 32, cy = 30, r0 = 8, r1 = 31, n = 16, color = '#F59E0B', op = 0.62 }) => {
  const p = (a, r) => `${f2(cx + r * Math.cos(a))} ${f2(cy + r * Math.sin(a))}`;
  const d = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI;
    const w = (Math.PI / n) * (i % 2 ? 0.35 : 0.6);
    return `M${p(a - w * 0.2, r0)} L${p(a - w, r1)} L${p(a + w, r1)} L${p(a + w * 0.2, r0)} Z`;
  }).join(' ');
  return (
    <g className="ba-anim anim-spin" style={{ transformOrigin: '50% 50%' }}>
      <defs>
        <radialGradient id={`${id}${k}`} cx={cx} cy={cy} r={r1} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity={op} />
          <stop offset="0.6" stopColor={color} stopOpacity={op * 0.6} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={d} fill={url(id, k)} />
    </g>
  );
};

// Corona de oro con gemas (centrada en x, base en y + 6).
const Crown = ({ id, k = 'cr', x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs><Lin id={id} k={k} m={M.gold} /></defs>
    <path d="M-8 3.6 L-9.4 -4.4 L-4.4 -0.8 L0 -7 L4.4 -0.8 L9.4 -4.4 L8 3.6 Z" fill={url(id, k)} stroke={M.gold[3]} strokeWidth="1.3" strokeLinejoin="round" />
    <rect x="-8.6" y="2.6" width="17.2" height="3.6" rx="1.4" fill={url(id, k)} stroke={M.gold[3]} strokeWidth="1.2" />
    <path d="M-6.6 -1.2 L-7.4 2" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
    {[[-9.4, -4.4], [0, -7], [9.4, -4.4]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="1.5" fill="#F43F5E" stroke="#881337" strokeWidth="0.7" />
    ))}
    <circle cx="0" cy="4.4" r="1.3" fill="#38BDF8" stroke="#075985" strokeWidth="0.6" />
  </g>
);

// Espada (empuñadura en 0,0 apuntando hacia +y antes de rotar).
const Sword = ({ id, k = 'sw', x, y, rot, len = 44, hilt = M.gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <defs>
      <linearGradient id={`${id}${k}b`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor="#CBD5E1" />
        <stop offset="1" stopColor="#64748B" />
      </linearGradient>
      <Lin id={id} k={`${k}h`} m={hilt} />
    </defs>
    <path d={`M-2 8 H2 V${len - 4.5} L0 ${len} L-2 ${len - 4.5} Z`} fill={url(id, `${k}b`)} stroke="#475569" strokeWidth="1.1" strokeLinejoin="round" />
    <path d={`M-0.4 9.5 V${len - 5}`} stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="0.8" strokeLinecap="round" />
    <rect x="-1.25" y="0.4" width="2.5" height="6" rx="1" fill="#7C2D12" stroke="#451A03" strokeWidth="0.8" />
    <rect x="-5.4" y="5.6" width="10.8" height="2.8" rx="1.4" fill={url(id, `${k}h`)} stroke={hilt[3]} strokeWidth="1" />
    <circle cx="0" cy="-0.6" r="2.1" fill={url(id, `${k}h`)} stroke={hilt[3]} strokeWidth="1" />
  </g>
);

// Manzana: sello común de los logros docentes. Con contorno de pegatina blanca
// para despegarla de lo que tapa. `gold` en los escalones altos.
const APPLE = 'M0 -3.4 C-1.6 -5 -6.6 -5.2 -6.8 0.2 C-7 5 -3.8 7.8 -1.7 7.6 C-0.9 7.5 -0.6 7 0 7 C0.6 7 0.9 7.5 1.7 7.6 C3.8 7.8 7 5 6.8 0.2 C6.6 -5.2 1.6 -5 0 -3.4 Z';
const APPLE_LEAF = 'M0.6 -4.4 C1.6 -7.4 4.8 -8.4 7 -7.4 C6 -4.6 3 -3.6 0.6 -4.4 Z';
const APPLE_STEM = 'M-0.1 -3.2 C0 -5 0.3 -6.4 1.2 -7.8';
const Apple = ({ id, k = 'ap', x = 49.4, y = 13, s = 1, gold = false }) => {
  const m = gold ? M.gold : M.apple;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <Rad id={id} k={k} m={m} cx={0.34} cy={0.3} r={0.82} />
        <Lin id={id} k={`${k}l`} m={M.leaf} />
      </defs>
      <g fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
        <path d={APPLE} />
        <path d={APPLE_LEAF} />
        <path d={APPLE_STEM} fill="none" />
      </g>
      <path d={APPLE_STEM} stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d={APPLE_LEAF} fill={url(id, `${k}l`)} stroke="#166534" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M1.4 -4.9 L5.6 -7.2" stroke="#166534" strokeOpacity="0.6" strokeWidth="0.6" strokeLinecap="round" />
      <path d={APPLE} fill={url(id, k)} stroke={m[3]} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.6 -3.4 C6.6 -2.4 7 3.4 4.2 6.4 C5.2 3.2 5.2 -0.4 3.6 -3.4 Z" fill={m[3]} opacity="0.25" />
      <ellipse cx="-3.5" cy="-0.6" rx="1.3" ry="2.5" transform="rotate(24 -3.5 -0.6)" fill="#FFFFFF" opacity="0.85" />
      <circle cx="-1.6" cy="-2.7" r="0.6" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
};

// Sombra de contacto + halo de fondo (comunes a casi todas).
const Base = ({ id, sx = 32, sy = 52, srx = 20, halo = null }) => (
  <>
    <defs>
      <Glow id={id} k="cs" color="#1E1B4B" op={0.42} />
      {halo && <Glow id={id} k="ha" color={halo[3] || '#FFFFFF'} op={halo[4] || 0.55} />}
    </defs>
    {halo && <circle cx={halo[0]} cy={halo[1]} r={halo[2]} fill={url(id, 'ha')} />}
    <ellipse cx={sx} cy={sy} rx={srx} ry="2.6" fill={url(id, 'cs')} />
  </>
);

// Escala un grupo alrededor de (cx, cy) para que el dibujo llene el medallón.
const Zoom = ({ s, cx = 32, cy = 32, children }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>
);

/* ==========================================================================
   Ranking de clase
   ========================================================================== */

// Pizarra de clase con el podio dibujado a tiza (rank_class3).
const ClassBoard = ({ id, frame = M.wood, gems = false }) => (
  <g>
    <defs>
      <Lin id={id} k="fr" m={frame} />
      <Lin id={id} k="bd" m={M.board} />
    </defs>
    <rect x="9.5" y="11.5" width="45" height="32.5" rx="4.5" fill={url(id, 'fr')} stroke={frame[3]} strokeWidth="1.8" />
    <path d="M12.6 12.9 H51.4" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
    <rect x="13" y="15" width="38" height="26" rx="2" fill={url(id, 'bd')} stroke={M.board[3]} strokeWidth="1" />
    <path d="M14.4 16.3 H27 L18.6 39.8 H14.4 Z" fill="#FFFFFF" opacity="0.09" />
    <path d="M44 18 C46 18.6 47.4 19.4 48.4 21" stroke="#ECFDF5" strokeOpacity="0.25" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    {/* podio a tiza */}
    <g stroke="#ECFDF5" strokeWidth="1.25" strokeLinejoin="round" fill="#ECFDF5" fillOpacity="0.16">
      <rect x="18.5" y="30.5" width="8.5" height="8.6" />
      <rect x="27" y="26.2" width="10" height="12.9" />
      <rect x="37" y="33.4" width="8.5" height="5.7" />
    </g>
    <path d="M16.4 39.1 H47.6" stroke="#ECFDF5" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
    <text {...F} x="22.75" y="37.3" fontSize="5.6" fill="#ECFDF5">2</text>
    <text {...F} x="32" y="35.6" fontSize="7.6" fill="#ECFDF5">1</text>
    <text {...F} x="41.25" y="38.2" fontSize="4.6" fill="#ECFDF5">3</text>
    {/* repisa con tizas */}
    <rect x="17" y="40.4" width="6.6" height="2.3" rx="1.1" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.5" />
    <rect x="25" y="40.6" width="4.6" height="2.1" rx="1" fill="#F9A8D4" stroke="#BE185D" strokeWidth="0.5" />
    <rect x="10.5" y="42.2" width="43" height="3.6" rx="1.6" fill={url(id, 'fr')} stroke={frame[3]} strokeWidth="1.2" />
    {gems && [[9.8, 27.75], [54.2, 27.75]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="2.3" fill="#F43F5E" stroke="#881337" strokeWidth="0.8" />
        <circle cx={x - 0.7} cy={y - 0.7} r="0.7" fill="#FFFFFF" opacity="0.9" />
      </g>
    ))}
  </g>
);

const rankClass3 = (id, tier) => {
  const gold = tier === 3;
  const dy = tier === 0 ? 3 : -1.2;
  return (
    <>
      {gold && <Rays id={id} cy={19} r0={6} />}
      <Base id={id} sy={tier === 0 ? 51.4 : 46} srx={tier === 0 ? 25 : 22} halo={[32, 22, 18, '#FFFFFF', 0.7]} />
      {tier >= 2 && <Laurel id={id} cy={31} r={26} from={104} to={214} n={6} m={gold ? M.gold : M.leaf} />}
      <g transform={`translate(0 ${dy}) translate(32 29) scale(${tier === 0 ? 1.13 : 1}) translate(-32 -29)`}>
        <ClassBoard id={id} frame={gold ? M.gold : M.wood} gems={gold} />
        {tier >= 1 && (
          <>
            <Star id={id} k="s2" cx={14.6} cy={14.2} R={4.6} />
            <Star id={id} k="s3" cx={49.4} cy={14.2} R={4.6} />
          </>
        )}
        <g className="ba-anim anim-bob" style={{ transformOrigin: '50% 50%' }}>
          <Star id={id} cx={32} cy={18.4} R={tier >= 2 ? 8.6 : 7.8} />
        </g>
      </g>
      {tier > 0 && <Ribbon id={id} text={['', '×3', '×5', '×10'][tier]} m={[M.indigo, M.indigo, M.violet, M.pink][tier]} cy={52.6} />}
      <Sparks pts={tier === 0 ? [[7.4, 10.4, 2.8], [57, 44, 2.2]] : [[6.5, 22, 2.6], [57.5, 34, 2.2]]} />
    </>
  );
};

// Escarapela de "primero de la clase".
const scallopD = (cx, cy, rIn, rOut, n) => {
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const am = (a0 + a1) / 2;
    if (i === 0) d += `M${f2(cx + rIn * Math.cos(a0))} ${f2(cy + rIn * Math.sin(a0))}`;
    d += ` Q${f2(cx + rOut * Math.cos(am))} ${f2(cy + rOut * Math.sin(am))} ${f2(cx + rIn * Math.cos(a1))} ${f2(cy + rIn * Math.sin(a1))}`;
  }
  return `${d} Z`;
};

const Rosette = ({ id, cx = 32, cy = 26, m }) => {
  const n = 16;
  return (
    <g>
      <defs>
        <Lin id={id} k="rt" m={m} x1={0} y1={0} x2={1} y2={0.2} />
        <Rad id={id} k="rr" m={m} cx={0.38} cy={0.32} r={0.75} />
        <Lin id={id} k="ri" m={[m[0], m[0], m[1]]} />
        <Rad id={id} k="rc" m={M.gold} cx={0.36} cy={0.3} r={0.8} />
      </defs>
      {/* colas */}
      <path d={`M${cx - 6.6} ${cy + 6} L${cx - 12} ${cy + 29} L${cx - 8.2} ${cy + 26.4} L${cx - 4.9} ${cy + 30} L${cx + 0.2} ${cy + 8} Z`} fill={url(id, 'rt')} stroke={m[3]} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={`M${cx + 6.6} ${cy + 6} L${cx + 12} ${cy + 29} L${cx + 8.2} ${cy + 26.4} L${cx + 4.9} ${cy + 30} L${cx - 0.2} ${cy + 8} Z`} fill={url(id, 'rt')} stroke={m[3]} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={`M${cx - 5.4} ${cy + 10} L${cx - 9.4} ${cy + 26}`} stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
      <path d={`M${cx + 6.6} ${cy + 10} L${cx + 9.8} ${cy + 24}`} stroke={m[3]} strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
      {/* volante plisado */}
      <path d={scallopD(cx, cy, 14, 20.4, n)} fill={url(id, 'rr')} stroke={m[3]} strokeWidth="1.5" strokeLinejoin="round" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        return (
          <path key={i} d={`M${f2(cx + 11 * Math.cos(a))} ${f2(cy + 11 * Math.sin(a))} L${f2(cx + 14.6 * Math.cos(a))} ${f2(cy + 14.6 * Math.sin(a))}`}
            stroke={m[3]} strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
        );
      })}
      {/* aro */}
      <circle cx={cx} cy={cy} r="11.6" fill={url(id, 'ri')} stroke={m[3]} strokeWidth="1.1" />
      {/* botón de oro con el 1 */}
      <circle cx={cx} cy={cy} r="9" fill={url(id, 'rc')} stroke={M.gold[3]} strokeWidth="1.3" />
      <circle cx={cx} cy={cy} r="7.3" fill="none" stroke="#FEF3C7" strokeOpacity="0.75" strokeWidth="0.8" />
      <text {...F} x={cx} y={cy + 5.4} fontSize="14" fill="#FEF3C7">1</text>
      <text {...F} x={cx} y={cy + 4.7} fontSize="14" fill="#92400E">1</text>
      <ellipse cx={cx - 4} cy={cy - 4.6} rx="3" ry="1.4" transform={`rotate(-32 ${cx - 4} ${cy - 4.6})`} fill="#FFFFFF" opacity="0.75" />
    </g>
  );
};

const rankClass1 = (id, tier) => {
  const m = [M.indigo, M.violet, M.pink][tier];
  const dy = tier === 0 ? 2 : -1;
  return (
    <>
      {tier === 2 && <Rays id={id} cy={25} r0={10} />}
      <Base id={id} sy={tier === 0 ? 61 : 56} srx={11} halo={[32, 26, 20, '#FFFFFF', 0.7]} />
      {tier >= 1 && <Laurel id={id} cy={26 + dy} r={23.5} from={98} to={206} n={6} m={tier === 2 ? M.gold : M.leaf} />}
      <Zoom s={tier === 0 ? 1.14 : 1} cy={28}>
        <g className="ba-anim anim-sway" style={{ transformOrigin: '50% 0%' }}>
          <Rosette id={id} cy={26 + dy} m={m} />
        </g>
      </Zoom>
      {tier === 2 && <Crown id={id} x={32} y={7} s={0.95} />}
      {tier > 0 && <Ribbon id={id} text={['', '×3', '×5'][tier]} m={[M.indigo, M.indigo, M.gold][tier]} dark={tier === 2} cy={52.6} />}
      <Sparks pts={[[10.5, 12, 2.6], [54, 13.5, 2], [55.5, 40, 1.8]]} />
    </>
  );
};

/* ==========================================================================
   Quiz Battle (alumno): el rayo es el emblema de la familia
   ========================================================================== */

const Trophy = ({ id, base, num }) => {
  const c = M.gold;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}cu`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c[1]} />
          <stop offset="0.24" stopColor={c[0]} />
          <stop offset="0.56" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </linearGradient>
        <Lin id={id} k="pl" m={base} x1={0.3} y1={0} x2={0.7} y2={1} />
        <Rad id={id} k="em" m={M.indigo} />
      </defs>
      {/* asas */}
      {['M20.6 16.4 C11.2 15.8 10.8 29.6 22.6 31', 'M43.4 16.4 C52.8 15.8 53.2 29.6 41.4 31'].map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke={c[3]} strokeWidth="4.6" strokeLinecap="round" />
          <path d={d} fill="none" stroke={url(id, 'cu')} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}
      {/* copa */}
      <path d="M18.4 12.6 H45.6 L44.7 21.6 C44 30.8 38.8 36 32 36.4 C25.2 36 20 30.8 19.3 21.6 Z" fill={url(id, 'cu')} stroke={c[3]} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M40.6 15 C40.8 24 39.2 31 33.6 34.6 C38.6 33.6 42.4 29.4 43.2 21.8 L43.8 15 Z" fill={c[3]} opacity="0.2" />
      <ellipse cx="32" cy="12.6" rx="13.6" ry="2.6" fill={c[2]} stroke={c[3]} strokeWidth="1.3" />
      <path d="M20.6 13.4 Q32 16.4 43.4 13.4" stroke={c[0]} strokeOpacity="0.8" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M22.6 15.8 C22.4 22 23.2 27.4 26 31.2" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* emblema Quiz Battle */}
      <circle cx="32" cy="23.4" r="6.6" fill={url(id, 'em')} stroke={M.indigo[3]} strokeWidth="1.2" />
      <circle cx="32" cy="23.4" r="5.4" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="0.7" />
      <Bolt id={id} k="eb" x={32} y={23.6} s={0.55} />
      {/* pie */}
      <path d="M29.2 36 H34.8 L34 40.4 H30 Z" fill={url(id, 'cu')} stroke={c[3]} strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="25.6" y="39.8" width="12.8" height="3.2" rx="1.6" fill={url(id, 'cu')} stroke={c[3]} strokeWidth="1.2" />
      {/* peana con el número */}
      <path d="M21 43.4 H43 L44.8 54.4 H19.2 Z" fill={url(id, 'pl')} stroke={base[3]} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M21.8 44.7 H42.2" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.9" strokeLinecap="round" />
      <text {...F} x="32" y="52.9" fontSize="10" fill={base[3]}>{num}</text>
      <text {...F} x="32" y="52.2" fontSize="10" fill="#FDE68A">{num}</text>
    </g>
  );
};

const battleWin = (id, tier) => (
  <>
    {tier === 2 && <Rays id={id} cy={24} r0={9} />}
    <Base id={id} sy={58.6} srx={17} halo={[32, 24, 20, '#FFFFFF', 0.7]} />
    {tier >= 1 && <Laurel id={id} cy={31} r={27} from={98} to={204} n={6} m={tier === 2 ? M.gold : M.leaf} />}
    <Zoom s={1.13} cy={33.6}>
      <g className="ba-anim anim-bob" style={{ transformOrigin: '50% 50%' }}>
        <Trophy id={id} base={[M.indigo, M.violet, M.pink][tier]} num={['1', '3', '5'][tier]} />
      </g>
    </Zoom>
    {tier === 2 && <Star id={id} k="tp" cx={32} cy={3.4} R={3.9} sw={1.1} />}
    <Sparks pts={tier === 0 ? [[8.6, 10, 2.8], [56.4, 42, 2.2]] : [[7, 8, 2.6], [57, 8.6, 2.2], [57.5, 46, 2]]} />
  </>
);

// Podio de tres alturas (plata, oro, bronce) con perspectiva frontal.
const Block = ({ id, k, x, w, top, bottom = 50, m, num, fs }) => (
  <g>
    <defs><Lin id={id} k={k} m={m} x1={0.1} y1={0} x2={0.9} y2={1} /></defs>
    <path d={`M${x} ${top} L${x + 1.8} ${top - 2.6} H${x + w - 1.8} L${x + w} ${top} Z`} fill={m[0]} stroke={m[3]} strokeWidth="1.2" strokeLinejoin="round" />
    <rect x={x} y={top} width={w} height={bottom - top} fill={url(id, k)} stroke={m[3]} strokeWidth="1.4" strokeLinejoin="round" />
    <path d={`M${x + 1.2} ${top + 1.4} V${bottom - 1.4}`} stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
    <text {...F} x={x + w / 2} y={f2(top + 3.2 + fs * 0.72)} fontSize={fs} fill={m[0]} opacity="0.9">{num}</text>
    <text {...F} x={x + w / 2} y={f2(top + 2.6 + fs * 0.72)} fontSize={fs} fill={m[3]}>{num}</text>
  </g>
);

const Podium = ({ id }) => (
  <g>
    <Block id={id} k="pS" x={9} w={15.2} top={33} m={M.silver} num="2" fs={9} />
    <Block id={id} k="pB" x={39.8} w={15.2} top={37.4} m={M.bronze} num="3" fs={8} />
    <Block id={id} k="pG" x={24} w={16} top={26.4} m={M.gold} num="1" fs={11} />
  </g>
);

const battlePodium = (id, tier) => {
  const dy = tier === 0 ? 3 : -0.6;
  return (
    <>
      {tier === 3 && <Rays id={id} cy={15} r0={7} />}
      <Base id={id} sy={tier === 0 ? 55.6 : 50.4} srx={26} halo={[32, 15, 15, '#FDE68A', 0.6]} />
      {tier >= 2 && <Laurel id={id} cy={30} r={27} from={118} to={212} n={5} m={tier === 3 ? M.gold : M.leaf} />}
      <g transform={`translate(0 ${dy}) translate(32 30) scale(${tier === 0 ? 1.08 : 1}) translate(-32 -30)`}>
        <Podium id={id} />
        {tier >= 1 && (
          <>
            <Star id={id} k="s2" cx={16.6} cy={24.2} R={4.2} m={M.silver} sw={1.1} />
            <Star id={id} k="s3" cx={47.4} cy={28.6} R={4.2} m={M.bronze} sw={1.1} />
          </>
        )}
        <g className="ba-anim anim-bob" style={{ transformOrigin: '50% 50%' }}>
          <Bolt id={id} x={32} y={13.4} s={1.08} />
        </g>
      </g>
      {tier > 0 && <Ribbon id={id} text={['', '×3', '×5', '×10'][tier]} m={[M.indigo, M.indigo, M.violet, M.gold][tier]} dark={tier === 3} cy={54.4} />}
      <Sparks pts={[[11, 15, 2.4], [53.5, 13, 2.2]]} />
    </>
  );
};

const SHIELD = 'M32 9 C38 12 44 12.6 50 12 C50.6 26 49 38.5 32 51 C15 38.5 13.4 26 14 12 C20 12.6 26 12 32 9 Z';

const battlePlayed = (id, tier) => {
  const field = tier === 0 ? M.indigo : M.violet;
  const rim = tier === 0 ? M.silver : M.gold;
  return (
    <>
      <defs>
        <Lin id={id} k="sr" m={rim} />
        <Lin id={id} k="sf" m={field} />
      </defs>
      <Base id={id} sy={57} srx={12} halo={[32, 28, 22, '#FFFFFF', 0.7]} />
      {tier === 1 && <Laurel id={id} cy={30} r={25} from={100} to={206} n={6} m={M.gold} />}
      <Sword id={id} k="w1" x={10.4} y={7.4} rot={-45} len={52} />
      <Sword id={id} k="w2" x={53.6} y={7.4} rot={45} len={52} />

      <path d={SHIELD} fill={url(id, 'sr')} stroke={rim[3]} strokeWidth="1.8" strokeLinejoin="round" />
      <path d={SHIELD} transform="translate(32 29.6) scale(0.8) translate(-32 -29.6)" fill={url(id, 'sf')} stroke={field[3]} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 14.2 C36.8 16.6 41.6 17.1 46.4 16.6 C46.9 27.8 45.6 37.8 32 47.8 Z" fill={field[3]} opacity="0.22" />
      <path d="M18.2 17.4 C22.6 17.8 27.2 17.2 31.4 15" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1" fill="none" strokeLinecap="round" />
      <g className="ba-anim anim-bolt" style={{ transformOrigin: '50% 50%' }}>
        <Bolt id={id} x={32} y={29} s={1.05} />
      </g>
      {tier === 1 && [[32, 9.6], [14.4, 13], [49.6, 13]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.9" fill="#F43F5E" stroke="#881337" strokeWidth="0.7" />
      ))}
      <Ribbon id={id} text={tier === 0 ? '10' : '25'} m={tier === 0 ? M.indigo : M.gold} dark={tier === 1} cy={51.4} />
      <Sparks pts={[[8.5, 30, 2.2], [56, 26, 2.4]]} />
    </>
  );
};

/* ==========================================================================
   Docente (sello común: manzana arriba a la derecha)
   ========================================================================== */

const TIER_RIBBON = [M.indigo, M.violet, M.pink, M.gold];

// Alumno en busto (cara redonda, pelo, camiseta).
const SKIN = [
  ['#FFE9D6', '#F8C9A4', '#C98458', '#8A4B26'],
  ['#F7D2B0', '#DDA170', '#9A5A32', '#6B3A1F'],
  ['#D9A276', '#A8683F', '#6E3D1F', '#4A2612'],
];
const Kid = ({ id, k, x, y, s = 1, skin, hair, shirt, girl = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <Rad id={id} k={`${k}k`} m={skin} cx={0.4} cy={0.35} r={0.75} />
      <Lin id={id} k={`${k}s`} m={shirt} />
    </defs>
    <path d="M-9 14 C-9 8.6 -5.2 6.4 0 6.4 C5.2 6.4 9 8.6 9 14 Z" fill={url(id, `${k}s`)} stroke={shirt[3]} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M-2.6 6.7 L0 9.4 L2.6 6.7" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {girl && (
      <>
        <circle cx="-6.4" cy="-1.6" r="2.6" fill={hair} stroke={skin[3]} strokeWidth="0.9" />
        <circle cx="6.4" cy="-1.6" r="2.6" fill={hair} stroke={skin[3]} strokeWidth="0.9" />
      </>
    )}
    <circle cx="0" cy="0" r="6" fill={url(id, `${k}k`)} stroke={skin[3]} strokeWidth="1.2" />
    <path d="M-6.2 0.6 C-6.9 -5.6 -2.7 -7.4 0.5 -7.2 C4.6 -7 6.9 -4.4 6.2 0.4 C4.8 -2.6 2.2 -3.8 -0.4 -3.6 C-2.8 -3.4 -4.8 -1.9 -6.2 0.6 Z" fill={hair} stroke={skin[3]} strokeWidth="1" strokeLinejoin="round" />
    <path d="M-3.6 -5.2 C-2.2 -6.2 0 -6.4 1.6 -6" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    <circle cx="-2.1" cy="0.9" r="0.85" fill="#1E1B4B" />
    <circle cx="2.1" cy="0.9" r="0.85" fill="#1E1B4B" />
    <circle cx="-3.6" cy="2.6" r="1" fill="#F472B6" opacity="0.45" />
    <circle cx="3.6" cy="2.6" r="1" fill="#F472B6" opacity="0.45" />
    <path d="M-1.7 2.9 Q0 4.3 1.7 2.9" stroke="#7C2D12" strokeWidth="0.9" strokeLinecap="round" fill="none" />
  </g>
);

const teacherGroups = (id, tier) => {
  const dy = tier === 0 ? 2.6 : 0;
  const disc = [M.indigo, M.violet, M.pink][tier];
  const gold = tier === 2;
  return (
    <>
      {gold && <Rays id={id} cy={26} r0={12} />}
      <Base id={id} sy={47.6 + dy} srx={23} />
      <defs>
        <Rad id={id} k="gd" m={disc} cx={0.36} cy={0.24} r={0.9} />
        <Lin id={id} k="gb" m={gold ? M.gold : M.slate} x1={0.5} y1={0} x2={0.5} y2={1} />
      </defs>
      <g transform={`translate(0 ${dy})`}>
        {/* círculo del grupo */}
        <circle cx="32" cy="25" r="19" fill={url(id, 'gd')} stroke={gold ? M.gold[3] : disc[3]} strokeWidth="1.6" />
        <circle cx="32" cy="25" r="17.2" fill="none" stroke={gold ? M.gold[1] : '#FFFFFF'} strokeOpacity={gold ? 1 : 0.55} strokeWidth={gold ? 1.8 : 1} />
        <path d="M17.6 18.4 C20 12.4 25.6 8.8 32 8.8" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <Kid id={id} k="k1" x={18.8} y={29.6} s={1.04} skin={SKIN[1]} hair="#3B2416" shirt={M.pink} girl />
        <Kid id={id} k="k2" x={45.2} y={29.6} s={1.04} skin={SKIN[2]} hair="#1F1B3A" shirt={M.emerald} />
        <Kid id={id} k="k3" x={32} y={25.6} s={1.3} skin={SKIN[0]} hair="#8A4B1C" shirt={M.gold} />
        {/* banco */}
        <rect x="8.6" y="42.2" width="46.8" height="5" rx="2.5" fill={url(id, 'gb')} stroke={gold ? M.gold[3] : M.slate[3]} strokeWidth="1.3" />
        <path d="M11.4 43.5 H52.6" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="0.8" strokeLinecap="round" />
        {tier === 0 && (
          <g className="ba-anim anim-pulse" style={{ transformOrigin: '50% 50%' }}>
            <defs><Rad id={id} k="pl" m={M.emerald} /></defs>
            <circle cx="12.4" cy="12.6" r="6.4" fill="#FFFFFF" />
            <circle cx="12.4" cy="12.6" r="5.6" fill={url(id, 'pl')} stroke={M.emerald[3]} strokeWidth="1.3" />
            <path d="M12.4 9.4 V15.8 M9.2 12.6 H15.6" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" />
          </g>
        )}
      </g>
      {tier > 0 && <Ribbon id={id} text={tier === 1 ? '3' : '5'} m={TIER_RIBBON[tier]} cy={53.4} w={22} />}
      <Apple id={id} gold={gold} />
      {tier > 0 && <Sparks pts={[[7, 14, 2.6], [57.4, 34, 2.2]]} />}
    </>
  );
};

// Birrete (alumnado).
const Cap = ({ id, k, x, y, s = 1, rot = 0, tassel = M.gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs>
      <Lin id={id} k={`${k}t`} m={M.navy} />
      <Lin id={id} k={`${k}c`} m={['#4F46E5', '#312E81', '#1E1B4B']} x1={0} y1={0} x2={1} y2={0} />
      <Lin id={id} k={`${k}g`} m={tassel} />
    </defs>
    <path d="M-8.6 1.6 V7.4 C-8.6 11 8.6 11 8.6 7.4 V1.6 Z" fill={url(id, `${k}c`)} stroke={M.navy[3]} strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M-15 0 L0 -6.6 L15 0 L0 6.6 Z" fill={url(id, `${k}t`)} stroke={M.navy[3]} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M-11.8 -0.7 L0 -5.6 L5.4 -3.3" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.5 0.5 Q8 1.6 10.4 2.4 V9.2" stroke={tassel[3]} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <circle cx="0" cy="0" r="1.5" fill={url(id, `${k}g`)} stroke={tassel[3]} strokeWidth="0.7" />
    <path d="M9 8.6 H11.8 L12.6 13.4 H8.2 Z" fill={url(id, `${k}g`)} stroke={tassel[3]} strokeWidth="0.8" strokeLinejoin="round" />
  </g>
);

const teacherStudents = (id, tier) => (
  <>
    {tier === 2 && <Rays id={id} cy={26} r0={10} />}
    <Base id={id} sy={44} srx={16} halo={[30, 26, 20, '#FFFFFF', 0.75]} />
    {tier >= 1 && <Cap id={id} k="c2" x={19.6} y={19.4} s={0.7} rot={-18} />}
    {tier >= 1 && <Cap id={id} k="c3" x={42.6} y={23} s={0.7} rot={14} />}
    {tier === 2 && <Cap id={id} k="c4" x={30} y={11.6} s={0.6} rot={-6} tassel={M.pink} />}
    <g className="ba-anim anim-bob" style={{ transformOrigin: '50% 50%' }}>
      <Cap id={id} k="c1" x={31} y={tier === 0 ? 27.4 : 31} s={tier === 0 ? 1.46 : 1.12} />
    </g>
    <Ribbon id={id} text={['5', '25', '50'][tier]} m={TIER_RIBBON[tier]} cy={52.4} w={tier ? 24 : 20} />
    <Apple id={id} gold={tier === 2} />
    <Sparks pts={[[9, 34, 2.2], [55, 36, 2.2]]} />
  </>
);

// Portapapeles con lista de tareas.
const Clipboard = ({ id, board = M.indigo, check = 'big' }) => (
  <g>
    <defs>
      <Lin id={id} k="cbb" m={board} />
      <Lin id={id} k="cbp" m={M.paper} />
      <Lin id={id} k="cbc" m={M.silver} x1={0.5} y1={0} x2={0.5} y2={1} />
      <Rad id={id} k="cbk" m={M.emerald} />
    </defs>
    <rect x="15" y="10.5" width="30" height="38" rx="4.2" fill={url(id, 'cbb')} stroke={board[3]} strokeWidth="1.6" />
    <path d="M17.6 12.4 V44" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.9" strokeLinecap="round" />
    <rect x="18.6" y="15.4" width="22.8" height="30" rx="1.6" fill={url(id, 'cbp')} stroke={M.paper[3]} strokeWidth="0.9" />
    {/* pinza */}
    <path d="M24.4 13.6 V10.8 C24.4 9.2 25.6 8 27.2 8 H28.6 C29 6.4 30.4 5.4 32 5.4 C33.6 5.4 35 6.4 35.4 8 H36.8 C38.4 8 39.6 9.2 39.6 10.8 V13.6 C39.6 15 38.6 16 37.2 16 H26.8 C25.4 16 24.4 15 24.4 13.6 Z"
      fill={url(id, 'cbc')} stroke={M.silver[3]} strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="32" cy="8.3" r="1.2" fill={M.silver[3]} />
    <path d="M26 10.4 H38" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="0.8" strokeLinecap="round" />
    {check === 'big' ? (
      <g className="ba-anim anim-pulse" style={{ transformOrigin: '50% 50%' }}>
        <path d="M23.4 31 L28.6 36.4 L37.4 25.4" stroke={M.emerald[3]} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23.4 31 L28.6 36.4 L37.4 25.4" stroke={M.emerald[1]} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24.4 30.6 L28.6 34.8" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    ) : (
      [21.2, 28.6, 36].map((y) => (
        <g key={y}>
          <rect x="21.2" y={y} width="5.2" height="5.2" rx="1.3" fill={url(id, 'cbk')} stroke={M.emerald[3]} strokeWidth="0.9" />
          <path d={`M22.4 ${y + 2.7} L23.6 ${y + 3.9} L25.4 ${y + 1.5}`} stroke="#FFFFFF" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28.4" y={y + 1.4} width={y === 36 ? 7.6 : 10.6} height="2.4" rx="1.2" fill="#C7D2FE" />
        </g>
      ))
    )}
  </g>
);

const teacherTasks = (id, tier) => {
  const dy = tier === 0 ? 3 : -0.5;
  const gold = tier === 3;
  return (
    <>
      {gold && <Rays id={id} cy={27} r0={10} />}
      <Base id={id} sy={50 + dy} srx={17} />
      <g transform={`translate(0 ${dy}) translate(30 30) scale(${tier === 0 ? 1.1 : 1}) translate(-30 -30)`}>
        {tier >= 2 && (
          <>
            <rect x="15" y="10.5" width="30" height="38" rx="4.2" transform="rotate(-11 30 30)" fill={M.violet[1]} stroke={M.violet[3]} strokeWidth="1.4" />
            <rect x="15" y="10.5" width="30" height="38" rx="4.2" transform="rotate(8 30 30)" fill={M.pink[1]} stroke={M.pink[3]} strokeWidth="1.4" />
          </>
        )}
        <Clipboard id={id} board={gold ? M.gold : M.indigo} check={tier === 0 ? 'big' : 'list'} />
        {gold && <Star id={id} k="ts" cx={39.6} cy={41.4} R={6} sw={1.2} />}
      </g>
      {tier > 0 && <Ribbon id={id} text={['', '5', '15', '30'][tier]} m={TIER_RIBBON[tier]} cy={52.6} w={tier === 1 ? 20 : 24} dark={gold} />}
      <Apple id={id} gold={tier >= 2} />
      <Sparks pts={[[9.5, 20, 2.4], [55, 32, 2]]} />
    </>
  );
};

// Pulsador de concurso (lanzar una Quiz Battle).
const Buzzer = ({ id, base = M.indigo }) => (
  <g>
    <defs>
      <Lin id={id} k="bzb" m={base} x1={0} y1={0} x2={1} y2={0.3} />
      <Rad id={id} k="bzd" m={['#FFD1D1', '#F43F5E', '#9F1239']} cx={0.38} cy={0.28} r={0.85} />
    </defs>
    <path d="M17.4 35 V41.4 C17.4 45.2 46.6 45.2 46.6 41.4 V35 Z" fill={url(id, 'bzb')} stroke={base[3]} strokeWidth="1.5" strokeLinejoin="round" />
    <ellipse cx="32" cy="35" rx="14.6" ry="4.2" fill={base[0]} stroke={base[3]} strokeWidth="1.4" />
    <path d="M21.4 34.2 C21.4 25.4 26 21.2 32 21.2 C38 21.2 42.6 25.4 42.6 34.2 C42.6 37 21.4 37 21.4 34.2 Z" fill={url(id, 'bzd')} stroke="#881337" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M24.6 30 C24.8 26.2 27.4 23.6 30.8 23.2" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <Bolt id={id} k="bzl" x={33} y={29.6} s={0.5} />
  </g>
);

const teacherBattles = (id, tier) => {
  const gold = tier === 2;
  const dy = tier === 0 ? 3.4 : 0;
  return (
    <>
      {gold && <Rays id={id} cy={26} r0={10} />}
      <Base id={id} sy={tier === 0 ? 50.6 : 46.6} srx={19} halo={[32, 24, 19, '#FFFFFF', 0.7]} />
      <g transform={`translate(0 ${dy}) translate(32 30) scale(${tier === 0 ? 1.12 : 1.04}) translate(-32 -30)`}>
        {/* espadas cruzadas por encima del pulsador */}
        <Sword id={id} k="w1" x={12.4} y={38.6} rot={-135} len={44} />
        <Sword id={id} k="w2" x={51.6} y={38.6} rot={135} len={44} />
        <g className="ba-anim anim-pulse" style={{ transformOrigin: '50% 100%' }}>
          <Buzzer id={id} base={gold ? M.gold : [M.indigo, M.violet][tier]} />
        </g>
      </g>
      {tier > 0 && <Ribbon id={id} text={tier === 1 ? '5' : '15'} m={TIER_RIBBON[tier]} cy={52.8} w={tier === 1 ? 20 : 24} />}
      <Apple id={id} gold={gold} />
      <Sparks pts={[[8, 22, 2.6], [56.6, 30, 2.2]]} anim="twinkle-2" />
    </>
  );
};

// Bocadillo de chat + sobre.
const BUBBLE = 'M17 9.5 H43 C47.4 9.5 50 12.1 50 16.5 V28.5 C50 32.9 47.4 35.5 43 35.5 H27.5 L16.8 43.4 L19.4 35.5 H17 C12.6 35.5 10 32.9 10 28.5 V16.5 C10 12.1 12.6 9.5 17 9.5 Z';
const Envelope = ({ id, k = 'en', x, y, w = 22, h = 15, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <defs><Lin id={id} k={k} m={M.cream} /></defs>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="2" fill={url(id, k)} stroke={M.cream[3]} strokeWidth="1.3" />
    <path d={`M${-w / 2 + 0.8} ${h / 2 - 0.8} L0 ${h * 0.05} L${w / 2 - 0.8} ${h / 2 - 0.8}`} stroke={M.cream[3]} strokeOpacity="0.5" strokeWidth="0.8" fill="none" />
    <path d={`M${-w / 2 + 0.4} ${-h / 2 + 0.6} L0 ${h * 0.18} L${w / 2 - 0.4} ${-h / 2 + 0.6} Z`} fill="#FDE7C4" stroke={M.cream[3]} strokeWidth="1" strokeLinejoin="round" />
    <circle cx="0" cy={h * 0.14} r="2.6" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.8" />
    <path d={`M-0.9 ${h * 0.14 - 0.3} L0 ${h * 0.14 + 0.9} L0.9 ${h * 0.14 - 0.3}`} stroke="#FFD1D1" strokeWidth="0.6" fill="none" />
  </g>
);

const teacherMessages = (id, tier) => {
  const gold = tier === 3;
  const m = [M.indigo, M.violet, M.violet, M.violet][tier];
  const dy = tier === 0 ? 3 : 0;
  return (
    <>
      {gold && <Rays id={id} cy={23} r0={10} />}
      <Base id={id} sy={46 + dy} srx={18} />
      <defs><Lin id={id} k="bu" m={m} /></defs>
      <g transform={`translate(0 ${dy}) translate(30 27) scale(${tier === 0 ? 1.1 : 1}) translate(-30 -27)`}>
        {tier >= 1 && <Envelope id={id} x={43} y={37} rot={10} />}
        <path d={BUBBLE} fill={url(id, 'bu')} stroke={gold ? M.gold[2] : m[3]} strokeWidth={gold ? 2.4 : 1.6} strokeLinejoin="round" />
        {gold && <path d={BUBBLE} fill="none" stroke={M.gold[0]} strokeWidth="0.8" strokeLinejoin="round" opacity="0.9" />}
        <path d="M13.4 27 V17 C13.4 14.4 14.6 13 17.4 13 H30" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* puntos de "escribiendo…" (el primero parpadea si no hay corazón animado) */}
        <g className={tier < 2 ? 'ba-anim anim-blink-seq' : undefined} style={{ transformOrigin: '50% 50%' }}>
          <circle cx="21.6" cy="22.6" r="3" fill="#FFFFFF" />
        </g>
        <circle cx="30" cy="22.6" r="3" fill="#FFFFFF" opacity="0.92" />
        <circle cx="38.4" cy="22.6" r="3" fill="#FFFFFF" opacity="0.8" />
        {tier >= 2 && (
          <g className="ba-anim anim-pulse" style={{ transformOrigin: '50% 50%' }}>
            <defs><Rad id={id} k="hb" m={M.pink} /></defs>
            <circle cx="12.6" cy="11.4" r="6.4" fill={url(id, 'hb')} stroke={M.pink[3]} strokeWidth="1.3" />
            <path d="M12.6 15 C9.2 12.8 8.6 10.8 9.6 9.4 C10.6 8.2 12 8.6 12.6 9.8 C13.2 8.6 14.6 8.2 15.6 9.4 C16.6 10.8 16 12.8 12.6 15 Z" fill="#FFFFFF" />
          </g>
        )}
      </g>
      {tier > 0 && <Ribbon id={id} text={['', '10', '25', '50'][tier]} m={TIER_RIBBON[tier]} cy={52.6} w={24} dark={gold} />}
      <Apple id={id} gold={tier >= 2} />
      <Sparks pts={tier === 0 ? [[7.4, 40, 2.6], [56.6, 30, 2.2]] : [[6.6, 27, 2.4], [57.4, 26, 2.2]]} />
    </>
  );
};

// Calendario con el número de días en la hoja.
const teacherDays = (id, tier) => {
  const m = [M.indigo, M.violet, M.pink][tier];
  const ring = tier === 2 ? M.gold : M.silver;
  const num = ['7', '30', '90'][tier];
  const page = 'M16.5 14 H45.5 C48.3 14 50.5 16.2 50.5 19 V43.4 L43 51 H16.5 C13.7 51 11.5 48.8 11.5 46 V19 C11.5 16.2 13.7 14 16.5 14 Z';
  return (
    <>
      {tier === 2 && <Rays id={id} cy={32} r0={12} />}
      <Base id={id} sy={53} srx={20} />
      <defs>
        <Lin id={id} k="pg" m={M.paper} />
        <Lin id={id} k="hd" m={m} x1={0} y1={0} x2={1} y2={1} />
        <Lin id={id} k="rg" m={ring} x1={0} y1={0} x2={1} y2={0} />
      </defs>
      <rect x="13.4" y="16" width="39" height="37" rx="5" fill={m[0]} stroke={m[3]} strokeWidth="1.2" />
      <path d={page} fill={url(id, 'pg')} stroke={m[3]} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11.5 25 V19 C11.5 16.2 13.7 14 16.5 14 H45.5 C48.3 14 50.5 16.2 50.5 19 V25 Z" fill={url(id, 'hd')} stroke={m[3]} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.4 16.6 H44" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
      {[21.4, 40.6].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="19.6" rx="1.9" ry="1.5" fill={m[3]} />
          <rect x={x - 1.5} y="8.6" width="3" height="11.4" rx="1.5" fill={url(id, 'rg')} stroke={ring[3]} strokeWidth="1" />
        </g>
      ))}
      <text {...F} x="31" y={tier === 0 ? 47.2 : 46.4} fontSize={tier === 0 ? 22 : 18.5} fill={m[0]}>{num}</text>
      <text {...F} x="31" y={tier === 0 ? 46.4 : 45.6} fontSize={tier === 0 ? 22 : 18.5} fill={m[3]}>{num}</text>
      <path d="M50.5 43.4 L43 51 V46.2 C43 44.6 44.2 43.4 45.8 43.4 Z" fill={m[0]} stroke={m[3]} strokeWidth="1.2" strokeLinejoin="round" />
      <Apple id={id} x={49.6} y={13.4} gold={tier === 2} />
      <Sparks pts={tier === 0 ? [[8, 32, 2.2]] : [[7.6, 30, 2.4], [56.4, 40, 2]]} />
    </>
  );
};

// Ficha de app (valoraciones).
const AppTile = ({ id }) => (
  <g>
    <defs>
      <Lin id={id} k="tl" m={['#C4B5FD', '#8B5CF6', '#5B21B6']} />
    </defs>
    <rect x="12.5" y="11" width="28" height="28" rx="8" fill={url(id, 'tl')} stroke={M.violet[3]} strokeWidth="1.6" />
    <path d="M14.6 18.6 C14.6 15.2 16.6 13.2 20.4 13.2 H33 C36.6 13.2 38.4 15 38.4 18 C30 20.6 22 20.8 14.6 18.6 Z" fill="#FFFFFF" opacity="0.35" />
    <rect x="18.4" y="17" width="7" height="7" rx="2" fill="#FFFFFF" />
    <rect x="27.6" y="17" width="7" height="7" rx="2" fill="#FFFFFF" opacity="0.75" />
    <rect x="18.4" y="26.2" width="7" height="7" rx="2" fill="#FFFFFF" opacity="0.75" />
    <circle cx="31.1" cy="29.7" r="3.6" fill="#FDE68A" />
  </g>
);

const teacherRatings = (id, tier) => {
  const dy = tier === 0 ? 2.5 : -2.6;
  return (
    <>
      {tier === 1 && <Rays id={id} cy={34} r0={8} />}
      <Base id={id} sy={50 + dy} srx={17} />
      <g transform={`translate(0 ${dy}) translate(30 30) scale(${tier === 0 ? 1.1 : 0.94}) translate(-30 -30)`}>
        <AppTile id={id} />
        {tier === 1 && (
          <>
            <Star id={id} k="r2" cx={13} cy={41.4} R={5.6} sw={1.2} />
            <Star id={id} k="r3" cx={24.8} cy={44.8} R={4.8} sw={1.2} />
          </>
        )}
        <g className="ba-anim anim-bob" style={{ transformOrigin: '50% 50%' }}>
          <Star id={id} cx={41} cy={36.4} R={tier === 1 ? 11.4 : 12.4} />
        </g>
      </g>
      {tier === 1 && <Ribbon id={id} text="10" m={M.pink} cy={53.2} w={22} />}
      <Apple id={id} gold={tier === 1} />
      <Sparks pts={[[8.5, 17, 2.4], [56, 28, 2]]} />
    </>
  );
};

/* ==========================================================================
   Mapa de insignias
   ========================================================================== */

const BADGES = {
  rank_class3_1: (id) => rankClass3(id, 0),
  rank_class3_3: (id) => rankClass3(id, 1),
  rank_class3_5: (id) => rankClass3(id, 2),
  rank_class3_10: (id) => rankClass3(id, 3),
  rank_class1_1: (id) => rankClass1(id, 0),
  rank_class1_3: (id) => rankClass1(id, 1),
  rank_class1_5: (id) => rankClass1(id, 2),

  battle_win_1: (id) => battleWin(id, 0),
  battle_win_3: (id) => battleWin(id, 1),
  battle_win_5: (id) => battleWin(id, 2),
  battle_podium_1: (id) => battlePodium(id, 0),
  battle_podium_3: (id) => battlePodium(id, 1),
  battle_podium_5: (id) => battlePodium(id, 2),
  battle_podium_10: (id) => battlePodium(id, 3),
  battle_played_10: (id) => battlePlayed(id, 0),
  battle_played_25: (id) => battlePlayed(id, 1),

  teacher_first_group: (id) => teacherGroups(id, 0),
  teacher_groups_3: (id) => teacherGroups(id, 1),
  teacher_groups_5: (id) => teacherGroups(id, 2),
  teacher_students_5: (id) => teacherStudents(id, 0),
  teacher_students_25: (id) => teacherStudents(id, 1),
  teacher_students_50: (id) => teacherStudents(id, 2),
  teacher_first_task: (id) => teacherTasks(id, 0),
  teacher_tasks_5: (id) => teacherTasks(id, 1),
  teacher_tasks_15: (id) => teacherTasks(id, 2),
  teacher_tasks_30: (id) => teacherTasks(id, 3),
  teacher_first_battle: (id) => teacherBattles(id, 0),
  teacher_battles_5: (id) => teacherBattles(id, 1),
  teacher_battles_15: (id) => teacherBattles(id, 2),
  teacher_first_message: (id) => teacherMessages(id, 0),
  teacher_messages_10: (id) => teacherMessages(id, 1),
  teacher_messages_25: (id) => teacherMessages(id, 2),
  teacher_messages_50: (id) => teacherMessages(id, 3),
  teacher_days_7: (id) => teacherDays(id, 0),
  teacher_days_30: (id) => teacherDays(id, 1),
  teacher_days_90: (id) => teacherDays(id, 2),
  teacher_first_rating: (id) => teacherRatings(id, 0),
  teacher_ratings_10: (id) => teacherRatings(id, 1),
};

export default BADGES;
