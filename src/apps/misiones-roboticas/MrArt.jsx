import React from 'react';
import {
  ArrowUp, RotateCcw, RotateCw, Undo2, Hand, Repeat, Repeat1, GitBranch, Split, Puzzle,
} from 'lucide-react';
import useArtIds from '@/components/art/useArtIds';
import { GlowGradient, MaterialGradient, ShadowGradient } from '@/components/art/primitives';

// Ilustraciones de "Programa al Robot · Misiones" (solo presentación).
// Sin filtros SVG: volumen con degradados, sombras con formas.

/* ───────── Robot visto desde arriba (familia de la mascota) ─────────
   Mira hacia la derecha (este); el tablero lo gira según su dirección.
   Cabeza-monitor índigo, visor con los dos ojos al frente (el derecho
   mayor), orbe rosa de la antena en el centro y propulsor detrás. */
export function TopBot() {
  const [id, url] = useArtIds();
  return (
    <svg className="art mr-bot" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <MaterialGradient id={id('head')} light="#c7d2fe" base="#6366f1" dark="#312e81" />
        <MaterialGradient id={id('limb')} light="#c4b5fd" base="#5b4ff0" dark="#312e81" />
        <linearGradient id={id('visor')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1450" />
          <stop offset="100%" stopColor="#0b0a24" />
        </linearGradient>
        <radialGradient id={id('orb')} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#fdf4ff" />
          <stop offset="40%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#a21caf" />
        </radialGradient>
        <radialGradient id={id('iris')} cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        <linearGradient id={id('flame')} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="40%" stopColor="#67e8f9" />
          <stop offset="80%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </linearGradient>
        <GlowGradient id={id('orbGlow')} color="#f0abfc" opacity={0.8} />
        <ShadowGradient id={id('shadow')} color="#0f0a32" opacity={0.5} />
      </defs>
      {/* sombra en el suelo */}
      <ellipse cx="33" cy="35" rx="24" ry="22" fill={url('shadow')} />
      {/* llama del propulsor (detrás) */}
      <path className="mr-bot__flame" d="M12 26Q-2 32 12 38Z" fill={url('flame')} />
      {/* orejeras */}
      <rect x="20" y="5" width="20" height="7" rx="3.5" fill={url('limb')} />
      <rect x="20" y="52" width="20" height="7" rx="3.5" fill={url('limb')} />
      {/* carcasa de la cabeza */}
      <rect x="11" y="10" width="40" height="44" rx="14" fill={url('head')} />
      <rect x="11.8" y="10.8" width="38.4" height="42.4" rx="13.2" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" fill="none" />
      <path d="M17 18Q22 13 30 13" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* visor al frente con los ojos */}
      <path d="M40 15H45Q55 15 55 27V37Q55 49 45 49H40Q37 49 37 46V18Q37 15 40 15Z" fill={url('visor')} stroke="#67e8f9" strokeOpacity="0.55" strokeWidth="1" />
      <circle cx="47" cy="24" r="4.2" fill="#fff" />
      <circle cx="47" cy="40" r="5.2" fill="#fff" />
      <circle cx="48.2" cy="24.3" r="2.4" fill={url('iris')} />
      <circle cx="48.4" cy="40.4" r="3" fill={url('iris')} />
      <circle cx="46.4" cy="23.1" r="0.9" fill="#fff" />
      <circle cx="46.6" cy="38.8" r="1.1" fill="#fff" />
      {/* antena con orbe rosa */}
      <circle cx="26" cy="32" r="9" fill={url('orbGlow')} />
      <circle cx="26" cy="32" r="4.4" fill={url('orb')} />
      <circle cx="24.6" cy="30.6" r="1.3" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/* Cristal (ítem a recoger) */
export function Gem() {
  const [id, url] = useArtIds();
  return (
    <svg className="art mr-gem" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id('g')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <GlowGradient id={id('glow')} color="#67e8f9" opacity={0.7} />
      </defs>
      <circle cx="16" cy="16" r="15" fill={url('glow')} />
      <path d="M9 11L13 6H19L23 11L16 26Z" fill={url('g')} />
      <path d="M9 11H23L16 26Z" fill="#0891b2" opacity="0.35" />
      <path d="M13 6L16 11L19 6M9 11L16 11L23 11M16 11V26" stroke="#ecfeff" strokeOpacity="0.6" strokeWidth="0.8" fill="none" strokeLinejoin="round" />
      <path d="M12 9.6L13.6 7.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* Plataforma de meta: anillos luminosos y banderín */
export function TargetPad() {
  const [id, url] = useArtIds();
  return (
    <svg className="art mr-pad" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <GlowGradient id={id('glow')} color="#fbbf24" opacity={0.75} />
        <linearGradient id={id('flag')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="17" r="15" fill={url('glow')} />
      <circle cx="16" cy="17" r="10.5" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="16" cy="17" r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.6" />
      <rect x="15.2" y="3.5" width="1.6" height="14" rx="0.8" fill="#475569" />
      <path d="M16.8 4H25L22.6 7.2L25 10.4H16.8Z" fill={url('flag')} />
    </svg>
  );
}

/* Miniatura de una misión (rejilla de caracteres de misionesData) */
export function MissionThumb({ grid }) {
  if (!Array.isArray(grid) || !grid.length) return null;
  const rows = grid.length;
  const cols = grid[0].length;
  const cells = [];
  grid.forEach((row, y) => row.forEach((c, x) => {
    const fill = c === '#' ? '#3730a3' : c === 'H' ? '#0f172a' : c === 'I' ? '#22d3ee' : c === 'T' ? '#fbbf24' : c === 'R' ? '#ec4899' : null;
    if (fill) cells.push(<rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width="0.84" height="0.84" rx="0.18" fill={fill} />);
  }));
  return (
    <svg className="mr-thumb" viewBox={`0 0 ${cols} ${rows}`} aria-hidden="true">
      <rect width={cols} height={rows} rx="0.5" fill="#e0e7ff" />
      {cells}
    </svg>
  );
}

/* Icono de cada tipo de bloque */
const ICON = {
  move: ArrowUp, turnL: RotateCcw, turnR: RotateCw, turn180: Undo2, pick: Hand,
  repeat: Repeat, while: Repeat1, if: GitBranch, ifelse: Split,
};
export function BlockGlyph({ type }) {
  const Icon = ICON[type] || Puzzle;
  return <span className="mr-block-ico" aria-hidden="true"><Icon size={14} strokeWidth={2.6} /></span>;
}
