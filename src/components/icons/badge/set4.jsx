// Insignias redibujadas (rediseño 2026). Formato y reglas: src/components/icons/badge/README.md
// CODES de este set: robot_retos_eso1, robot_retos_eso2, robot_retos_eso3, robot_retos_eso4
//
// Familia "Domador de Retos" (programacion): supera los 5 retos de Nº ESO en
// "Programa al Robot". Composición común: la mascota (RobotMascot) en busto con la
// ficha de código "</>" como sello arriba a la izquierda y el curso en la cinta.
//   · eso1  índigo · eso2  violeta + destellos · eso3  rosa + laurel
//   · eso4  oro: rayos, laurel dorado, sello de oro y núcleo dorado.
import React from 'react';

const F = { fontFamily: 'Fredoka, system-ui, sans-serif', fontWeight: '700', textAnchor: 'middle' };

// Materiales: [luz, base, sombra, perfil] (perfil = contorno oscuro teñido).
const M = {
  gold: ['#FEF3C7', '#FBBF24', '#C2780A', '#92400E'],
  indigo: ['#C7D2FE', '#6366F1', '#3730A3', '#312E81'],
  violet: ['#EDE0FF', '#8B5CF6', '#5B21B6', '#4C1D95'],
  pink: ['#FCE7F3', '#EC4899', '#A3195B', '#831843'],
  leaf: ['#D9F99D', '#4ADE80', '#15803D', '#166534'],
  orb: ['#FDF4FF', '#F0ABFC', '#C026D3', '#86198F'],
  body: ['#C7D2FE', '#5B4FF0', '#3730A3', '#312E81'],
  core: ['#ECFEFF', '#22D3EE', '#0E7490', '#155E75'],
};

const url = (id, k) => `url(#${id}${k})`;
const f2 = (n) => Number(n.toFixed(2));

const Lin = ({ id, k, m, x1 = 0.15, y1 = 0, x2 = 0.85, y2 = 1 }) => (
  <linearGradient id={`${id}${k}`} x1={x1} y1={y1} x2={x2} y2={y2}>
    <stop offset="0" stopColor={m[0]} />
    <stop offset="0.5" stopColor={m[1]} />
    <stop offset="1" stopColor={m[2]} />
  </linearGradient>
);

const Rad = ({ id, k, m, cx = 0.36, cy = 0.3, r = 0.78 }) => (
  <radialGradient id={`${id}${k}`} cx={cx} cy={cy} r={r}>
    <stop offset="0" stopColor={m[0]} />
    <stop offset="0.45" stopColor={m[1]} />
    <stop offset="1" stopColor={m[2]} />
  </radialGradient>
);

const Glow = ({ id, k, color, op = 0.5 }) => (
  <radialGradient id={`${id}${k}`} cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor={color} stopOpacity={op} />
    <stop offset="0.6" stopColor={color} stopOpacity={op * 0.35} />
    <stop offset="1" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

const sparkD = (x, y, r) => {
  const q = r * 0.14;
  return `M${x} ${y - r} Q${x + q} ${y - q} ${x + r} ${y} Q${x + q} ${y + q} ${x} ${y + r} Q${x - q} ${y + q} ${x - r} ${y} Q${x - q} ${y - q} ${x} ${y - r} Z`;
};

const Sparks = ({ pts, anim = 'twinkle-2' }) => (
  <g className={`ba-anim anim-${anim}`} style={{ transformOrigin: '50% 50%' }}>
    {pts.map(([x, y, r, c = '#F59E0B'], i) => (
      <g key={i}>
        <path d={sparkD(x, y, r)} fill={c} />
        <path d={sparkD(x, y, r * 0.45)} fill="#FFFFFF" />
      </g>
    ))}
  </g>
);

// Rayos de gloria (giran solo en el modal).
const Rays = ({ id, k = 'ry', cx = 32, cy = 28, r0 = 9, r1 = 31, n = 16, color = '#F59E0B', op = 0.6 }) => {
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

// Rama de laurel doble alrededor del robot.
const LEAF_D = 'M0 0 C2.3 -1.8 2.3 -5 0 -6.8 C-2.3 -5 -2.3 -1.8 0 0 Z';
const Laurel = ({ id, k = 'la', cx = 32, cy = 30, r = 21, from = 108, to = 210, n = 5, m = M.leaf }) => {
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

// Cinta inferior con el curso.
const Ribbon = ({ id, k = 'rb', text, m, cy = 52.6, w = 30, fs = 8.6, dark = false }) => {
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
      <path d={`M${x0 + 2.5} ${y0 + d} H${x0 - 5.4} L${x0 - 2.9} ${cy + d} L${x0 - 5.4} ${y0 + h + d} H${x0 + 2.5} Z`} fill={m[2]} stroke={m[3]} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={`M${x1 - 2.5} ${y0 + d} H${x1 + 5.4} L${x1 + 2.9} ${cy + d} L${x1 + 5.4} ${y0 + h + d} H${x1 - 2.5} Z`} fill={m[2]} stroke={m[3]} strokeWidth="1.3" strokeLinejoin="round" />
      <path d={`M${x0} ${y0 + h} L${x0 + 2.5} ${y0 + h + d} V${y0 + h} Z`} fill={m[3]} />
      <path d={`M${x1} ${y0 + h} L${x1 - 2.5} ${y0 + h + d} V${y0 + h} Z`} fill={m[3]} />
      <path d={`M${x0} ${y0} Q32 ${y0 - 2} ${x1} ${y0} V${y0 + h} Q32 ${y0 + h - 2} ${x0} ${y0 + h} Z`} fill={url(id, k)} stroke={m[3]} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={`M${x0 + 1.6} ${y0 + 1.3} Q32 ${y0 - 0.6} ${x1 - 1.6} ${y0 + 1.3}`} stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <text {...F} x="32" y={f2(cy + fs * 0.35 + 0.1)} fontSize={fs} fill={dark ? '#FFF7E0' : m[3]}>{text}</text>
      <text {...F} x="32" y={f2(cy + fs * 0.35 - 0.6)} fontSize={fs} fill={dark ? m[3] : '#FFFFFF'}>{text}</text>
    </g>
  );
};

// Ficha de código "</>" (sello de la familia), centrada en x, y.
const CodeChip = ({ id, k = 'cc', x, y, m, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs><Lin id={id} k={k} m={m} /></defs>
    <rect x="-7.4" y="-5.2" width="14.8" height="12" rx="3.6" fill={m[3]} />
    <rect x="-7.4" y="-6.4" width="14.8" height="12" rx="3.6" fill={url(id, k)} stroke={m[3]} strokeWidth="1.3" />
    <path d="M-5 -4.4 H2.4" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.9" strokeLinecap="round" />
    <path d="M-2.6 -2.8 L-4.8 -0.4 L-2.6 2" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.6 -2.8 L4.8 -0.4 L2.6 2" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.9 -3.4 L-0.9 2.6" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" />
  </g>
);

// La mascota (RobotMascot) en busto, en coordenadas locales con la cabeza en 0,0:
// cabeza-monitor índigo, visor oscuro, ojo derecho mayor, antena con orbe rosa y
// núcleo cian en el pecho (dorado en el último escalón).
const Robot = ({ id, x, y, s = 1, goldCore = false, orbAnim = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <Lin id={id} k="rh" m={M.indigo} />
      <Lin id={id} k="rb" m={M.body} />
      <Rad id={id} k="ro" m={M.orb} />
      <Rad id={id} k="rc" m={goldCore ? M.gold : M.core} cx={0.4} cy={0.35} />
      <linearGradient id={`${id}rv`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1E1B4B" />
        <stop offset="1" stopColor="#0B0A24" />
      </linearGradient>
    </defs>
    {/* antena */}
    <path d="M0 -9 V-13.2" stroke={M.indigo[3]} strokeWidth="1.6" strokeLinecap="round" />
    <g className={orbAnim ? 'ba-anim anim-twinkle' : undefined} style={{ transformOrigin: '50% 50%' }}>
      <circle cx="0" cy="-15" r="2.9" fill={url(id, 'ro')} stroke={M.orb[3]} strokeWidth="1" />
      <circle cx="-0.9" cy="-15.9" r="0.85" fill="#FFFFFF" />
    </g>
    {/* cuerpo */}
    <path d="M-7.6 10.2 Q0 8.6 7.6 10.2 L8.6 18.2 Q0 20.6 -8.6 18.2 Z" fill={url(id, 'rb')} stroke={M.body[3]} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M-5.6 11.6 Q-2 10.8 1.6 10.9" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    <circle cx="0" cy="14.4" r="3.1" fill={url(id, 'rc')} stroke={goldCore ? M.gold[3] : M.core[3]} strokeWidth="0.9" />
    <g className="ba-anim anim-pulse" style={{ transformOrigin: '50% 50%' }}>
      <circle cx="0" cy="14.4" r="1.25" fill="#FFFFFF" opacity="0.95" />
    </g>
    {/* orejas */}
    <rect x="-13.8" y="-4" width="3.4" height="8" rx="1.7" fill="#818CF8" stroke={M.indigo[3]} strokeWidth="1.1" />
    <rect x="10.4" y="-4" width="3.4" height="8" rx="1.7" fill="#4338CA" stroke={M.indigo[3]} strokeWidth="1.1" />
    {/* cabeza */}
    <rect x="-11" y="-9" width="22" height="17.6" rx="6.2" fill={url(id, 'rh')} stroke={M.indigo[3]} strokeWidth="1.5" />
    <path d="M-8.2 -7.1 Q-3.2 -8.3 2.8 -8.1" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    <rect x="-8.6" y="-5.6" width="17.2" height="10.2" rx="4.8" fill={url(id, 'rv')} stroke="#22D3EE" strokeOpacity="0.6" strokeWidth="0.8" />
    {/* ojos (el derecho, mayor) */}
    <circle cx="-3.5" cy="-0.4" r="2.6" fill="#FFFFFF" />
    <circle cx="-3.3" cy="-0.2" r="1.4" fill="#6366F1" />
    <circle cx="-4" cy="-1" r="0.55" fill="#FFFFFF" />
    <circle cx="3.2" cy="-0.6" r="3.3" fill="#FFFFFF" />
    <circle cx="3.4" cy="-0.4" r="1.8" fill="#6366F1" />
    <circle cx="2.6" cy="-1.4" r="0.65" fill="#FFFFFF" />
    {/* sonrisa */}
    <path d="M-2.4 6.2 Q0 7.6 2.4 6.2" stroke="#67E8F9" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </g>
);

const TIERS = [
  { label: '1º ESO', m: M.indigo },
  { label: '2º ESO', m: M.violet },
  { label: '3º ESO', m: M.pink },
  { label: '4º ESO', m: M.gold },
];

const robotRetos = (id, tier) => {
  const { label, m } = TIERS[tier];
  const gold = tier === 3;
  return (
    <>
      <defs>
        <Glow id={id} k="cs" color="#1E1B4B" op={0.42} />
        <Glow id={id} k="ha" color={gold ? '#FDE68A' : '#FFFFFF'} op={gold ? 0.7 : 0.55} />
      </defs>
      {gold && <Rays id={id} />}
      <circle cx="32" cy="27" r="19" fill={url(id, 'ha')} />
      {tier >= 2 && <Laurel id={id} m={gold ? M.gold : M.leaf} />}
      <ellipse cx="32" cy="46.4" rx="13" ry="2.4" fill={url(id, 'cs')} />
      <Robot id={id} x={32} y={27} s={0.95} goldCore={gold} orbAnim={!gold} />
      <CodeChip id={id} x={14.2} y={15.6} m={m} s={tier === 0 ? 0.92 : 1} />
      <Ribbon id={id} text={label} m={m} />
      {tier >= 1 && <Sparks pts={tier === 1 ? [[51, 15, 2.6]] : [[51, 14, 2.8], [54.4, 34, 2]]} />}
    </>
  );
};

const BADGES = {
  robot_retos_eso1: (id) => robotRetos(id, 0),
  robot_retos_eso2: (id) => robotRetos(id, 1),
  robot_retos_eso3: (id) => robotRetos(id, 2),
  robot_retos_eso4: (id) => robotRetos(id, 3),
};

export default BADGES;
