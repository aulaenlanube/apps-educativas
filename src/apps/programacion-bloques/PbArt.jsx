import React from 'react';
import {
  ArrowUp, RotateCcw, RotateCw, Undo2, Hand, Zap, Repeat, Repeat1, Flag, ListOrdered,
  GitBranch, Split, Box, Lock, Equal, Braces, PhoneCall, CornerDownLeft, Puzzle,
} from 'lucide-react';
import useArtIds from '@/components/art/useArtIds';
import { GlowGradient } from '@/components/art/primitives';

// Ilustraciones propias de "Programa al Robot" (solo presentación):
//   · BiomeScene: paisaje de cada bioma (mapa de misiones y briefing).
//   · MiniMap: miniatura del tablero de un nivel (mapa y niveles de usuarios).
//   · BLOCK_ICON: icono de cada tipo de bloque.
// Sin filtros SVG; volumen con degradados y formas.

/* ───────────────────────── Paisajes por bioma ───────────────────────── */

const SKY = {
  meadow: ['#bae6fd', '#e0f2fe'],
  forest: ['#a7f3d0', '#ecfdf5'],
  mountain: ['#c7d2fe', '#eef2ff'],
  city: ['#fbcfe8', '#fde68a'],
  datacenter: ['#1e1b4b', '#312e81'],
};

export function BiomeScene({ biome = 'meadow' }) {
  const [id, url] = useArtIds();
  const [s1, s2] = SKY[biome] || SKY.meadow;
  return (
    <svg className="art pbx-scene" viewBox="0 0 120 56" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s1} />
          <stop offset="100%" stopColor={s2} />
        </linearGradient>
        <GlowGradient id={id('sun')} color={biome === 'datacenter' ? '#22d3ee' : '#fde68a'} opacity={0.95} />
        <linearGradient id={id('g1')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id={id('g2')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={id('pine')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id={id('rock')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
        <linearGradient id={id('bld')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id={id('bld2')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#831843" />
        </linearGradient>
        <linearGradient id={id('rack')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="120" height="56" fill={url('sky')} />

      {biome === 'meadow' && (
        <g>
          <circle cx="94" cy="16" r="16" fill={url('sun')} />
          <circle cx="94" cy="16" r="6" fill="#fef3c7" />
          <path d="M0 40Q30 26 62 36T120 32V56H0Z" fill={url('g1')} />
          <path d="M0 48Q40 36 80 46T120 44V56H0Z" fill={url('g2')} />
          <path d="M44 56Q50 46 58 41" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
          {[[16, 44, '#f472b6'], [26, 49, '#fde047'], [84, 47, '#f472b6'], [98, 51, '#fff'], [72, 52, '#fde047']].map(([x, y, c]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill={c} />
          ))}
          <path d="M8 18Q12 14 17 17Q21 13 26 17Q30 17 29 20H9Q6 20 8 18Z" fill="#fff" opacity="0.85" />
        </g>
      )}

      {biome === 'forest' && (
        <g>
          <circle cx="22" cy="14" r="13" fill={url('sun')} />
          <path d="M0 42Q34 30 70 38T120 34V56H0Z" fill="#22c55e" />
          {[[14, 40, 1], [32, 44, 1.25], [52, 38, 0.95], [74, 43, 1.35], [96, 37, 1.1], [110, 45, 0.9]].map(([x, y, k]) => (
            <g key={x} transform={`translate(${x} ${y}) scale(${k})`}>
              <rect x="-1.2" y="0" width="2.4" height="6" rx="0.8" fill="#78350f" />
              <path d="M0 -20L9 0H-9Z" fill={url('pine')} />
              <path d="M0 -26L7 -10H-7Z" fill={url('pine')} />
              <path d="M0 -26L-7 -10H-2Z" fill="#fff" opacity="0.18" />
            </g>
          ))}
          <path d="M0 52Q40 46 80 52T120 50V56H0Z" fill="#15803d" />
        </g>
      )}

      {biome === 'mountain' && (
        <g>
          <path d="M6 14Q10 10 15 13Q19 9 24 13Q28 13 27 16H7Q4 16 6 14Z" fill="#fff" opacity="0.9" />
          <path d="M-6 56L28 14L50 40L74 8L112 56Z" fill={url('rock')} />
          <path d="M28 14L36 24L31 22L26 27L21 23Z" fill="#fff" />
          <path d="M74 8L84 20L78 18L72 24L66 19Z" fill="#fff" />
          <path d="M74 8L112 56H92Z" fill="#1e1b4b" opacity="0.25" />
          <path d="M60 56L96 26L132 56Z" fill="#6366f1" />
          <path d="M96 26L104 34L98 33L93 37L89 32Z" fill="#e0e7ff" />
          <path d="M0 50Q40 44 70 50T120 48V56H0Z" fill="#a5b4fc" />
        </g>
      )}

      {biome === 'city' && (
        <g>
          <circle cx="60" cy="40" r="22" fill={url('sun')} />
          <circle cx="60" cy="40" r="9" fill="#fef3c7" opacity="0.9" />
          {[[4, 22, 16, 'bld'], [22, 14, 14, 'bld2'], [38, 26, 12, 'bld'], [72, 18, 14, 'bld2'], [88, 10, 16, 'bld'], [106, 24, 14, 'bld2']].map(([x, y, w, g]) => (
            <g key={x}>
              <rect x={x} y={y} width={w} height={56 - y} rx="1.5" fill={url(g)} />
              {Array.from({ length: Math.floor((52 - y) / 7) }).map((_, r) => (
                <g key={r}>
                  <rect x={x + 3} y={y + 4 + r * 7} width="3" height="3" rx="0.6" fill="#fde68a" opacity={(r + x) % 3 ? 0.9 : 0.35} />
                  <rect x={x + w - 6} y={y + 4 + r * 7} width="3" height="3" rx="0.6" fill="#fde68a" opacity={(r + x) % 2 ? 0.85 : 0.3} />
                </g>
              ))}
            </g>
          ))}
          <rect x="0" y="50" width="120" height="6" fill="#312e81" />
          <path d="M6 53H18M30 53H42M54 53H66M78 53H90M102 53H114" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}

      {biome === 'datacenter' && (
        <g>
          <circle cx="60" cy="18" r="30" fill={url('sun')} opacity="0.45" />
          <path d="M0 46H120M0 50H120M20 46L8 56M44 46L40 56M76 46L80 56M100 46L112 56" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="0.6" />
          {[8, 34, 60, 86].map((x, i) => (
            <g key={x}>
              <rect x={x} y="10" width="22" height="36" rx="2" fill={url('rack')} />
              <rect x={x} y="10" width="22" height="2" rx="1" fill="#94a3b8" opacity="0.6" />
              {[0, 1, 2, 3, 4].map((r) => (
                <g key={r}>
                  <rect x={x + 2.5} y={14 + r * 6.4} width="17" height="4.4" rx="0.8" fill="#0f172a" />
                  <circle cx={x + 5} cy={16.2 + r * 6.4} r="0.9" fill={(r + i) % 3 === 0 ? '#f472b6' : '#22d3ee'} />
                  <circle cx={x + 8} cy={16.2 + r * 6.4} r="0.9" fill={(r + i) % 2 ? '#4ade80' : '#22d3ee'} opacity="0.85" />
                  <rect x={x + 11} y={15.6 + r * 6.4} width="7" height="1.2" rx="0.6" fill="#334155" />
                </g>
              ))}
            </g>
          ))}
        </g>
      )}
      {/* brillo superior común */}
      <rect width="120" height="18" fill="#fff" opacity={biome === 'datacenter' ? 0.04 : 0.16} />
    </svg>
  );
}

/* ───────────────────────── Miniatura de tablero ───────────────────────── */

const MINI_FLOOR = {
  meadow: '#4ade80', forest: '#3aa04a', mountain: '#b4c0cf', city: '#a8afba', datacenter: '#5b6778',
};
const list = (v) => (v instanceof Set ? [...v] : Array.isArray(v) ? v : []);
const cellOf = (raw) => String(raw).split(':')[0].split(',').map(Number);

export function MiniMap({ world, biome = 'meadow' }) {
  if (!world) return null;
  const cols = world.cols || 8;
  const rows = world.rows || 8;
  const r = world.robot || { x: 0, y: rows - 1, dir: 'E' };
  const rot = { N: -90, E: 0, S: 90, W: 180 }[r.dir] || 0;
  const paint = (arr, fill, key) => list(arr).map((raw) => {
    const [x, y] = cellOf(raw);
    return <rect key={`${key}${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />;
  });
  return (
    <svg className="pbx-minimap" viewBox={`0 0 ${cols} ${rows}`} shapeRendering="crispEdges" aria-hidden="true">
      <rect width={cols} height={rows} fill={MINI_FLOOR[biome] || MINI_FLOOR.meadow} />
      {paint(world.water, '#2563eb', 'w')}
      {paint(world.holes, '#1c1917', 'h')}
      {paint(world.walls, '#111827', 'm')}
      {paint(world.crates, '#b45309', 'c')}
      <g shapeRendering="geometricPrecision">
        {list(world.items).map((raw) => {
          const [x, y] = cellOf(raw);
          return <circle key={`i${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r="0.26" fill="#bbf7d0" stroke="#15803d" strokeWidth="0.1" />;
        })}
        {world.target && (
          <g>
            <rect x={world.target.x + 0.18} y={world.target.y + 0.18} width="0.64" height="0.64" rx="0.12" fill="#fbbf24" />
            <rect x={world.target.x + 0.18} y={world.target.y + 0.18} width="0.32" height="0.32" fill="#111827" />
            <rect x={world.target.x + 0.5} y={world.target.y + 0.5} width="0.32" height="0.32" fill="#111827" />
          </g>
        )}
        <g transform={`translate(${r.x + 0.5} ${r.y + 0.5}) rotate(${rot})`}>
          <circle r="0.4" fill="#6366f1" stroke="#e0e7ff" strokeWidth="0.1" />
          <path d="M0.18 -0.2L0.42 0L0.18 0.2Z" fill="#67e8f9" />
        </g>
      </g>
    </svg>
  );
}

/* ───────────────────────── Iconos de bloque ───────────────────────── */

export const BLOCK_ICON = {
  move: ArrowUp,
  turnL: RotateCcw,
  turnR: RotateCw,
  turn180: Undo2,
  pick: Hand,
  fire_laser: Zap,
  repeat_n: Repeat,
  while_sensor: Repeat1,
  until_meta: Flag,
  for_range: ListOrdered,
  while_expr: Repeat1,
  if_sensor: GitBranch,
  ifelse_sensor: Split,
  if_expr: GitBranch,
  ifelse_expr: Split,
  var_decl: Box,
  assign: Equal,
  const_decl: Lock,
  proc_decl: Braces,
  proc_call: PhoneCall,
  func_decl: Braces,
  func_call: PhoneCall,
  return: CornerDownLeft,
};
export const blockIcon = (kind) => BLOCK_ICON[kind] || Puzzle;
