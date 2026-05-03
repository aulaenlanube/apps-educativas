import React from 'react';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';
import { cn } from '@/lib/utils';

const SIZE_PX = { xs: 24, sm: 32, md: 48, lg: 80, xl: 128, hero: 192, mega: 256 };

export const RARITY_META = {
  common:    { label: 'Común',      ring: '#94a3b8', glow: '#cbd5e1', bg: 'from-slate-300 to-slate-500' },
  rare:      { label: 'Raro',       ring: '#3b82f6', glow: '#60a5fa', bg: 'from-blue-400 to-indigo-500' },
  epic:      { label: 'Épico',      ring: '#a855f7', glow: '#c084fc', bg: 'from-purple-500 to-fuchsia-500' },
  legendary: { label: 'Legendario', ring: '#f59e0b', glow: '#fbbf24', bg: 'from-amber-400 to-orange-500' },
  mythic:    { label: 'Mítico',     ring: '#ef4444', glow: '#f87171', bg: 'from-red-500 via-rose-500 to-pink-500' },
};

export function rarityMeta(rarity) {
  return RARITY_META[rarity] || RARITY_META.common;
}

/**
 * Avatar unificado.
 * Props:
 *  - selectedAvatarCode, avatarEmoji, avatarColor: vienen del usuario
 *  - size: xs|sm|md|lg|xl|hero|mega (default: md)
 *  - shape: circle|rounded|square (default: circle)
 *  - showRarityBorder: pinta borde por rareza (default: true si hay imagen)
 *  - showRarityGlow: añade un glow animado (default: false; útil en duelo/batalla)
 *  - className extra
 *  - onClick
 */
export default function UserAvatar({
  selectedAvatarCode,
  avatarEmoji,
  avatarColor,
  size = 'md',
  shape = 'circle',
  showRarityBorder = true,
  showRarityGlow = false,
  className,
  onClick,
  title,
  fallbackInitial,
}) {
  const { byCode } = useAvatarCatalog();
  const def = selectedAvatarCode ? byCode(selectedAvatarCode) : null;
  const px = SIZE_PX[size] || SIZE_PX.md;

  const shapeClass = shape === 'square'
    ? 'rounded-md'
    : shape === 'rounded'
      ? 'rounded-2xl'
      : 'rounded-full';

  const meta = def ? rarityMeta(def.rarity) : null;
  const ring = showRarityBorder && def ? `inset 0 0 0 ${Math.max(2, Math.round(px / 28))}px ${meta.ring}` : 'none';
  const glow = showRarityGlow && def ? `0 0 ${Math.round(px / 6)}px ${meta.glow}` : 'none';
  const boxShadow = [ring, glow].filter((s) => s !== 'none').join(', ') || undefined;

  // Selección por tamaño de imagen.
  // image_sm (128w webp) cubre hasta lg (80px) — suficiente nitidez incluso en
  // pantallas retina y minimiza tráfico para listas con muchos avatares
  // (ej: opciones de duelo, paneles de jugador en duelos en vivo).
  const imgSrc = def
    ? (px <= 96 ? def.image_sm : px <= 192 ? def.image_md : def.image_lg)
    : null;

  return (
    <div
      onClick={onClick}
      title={title || avatarEmoji || ''}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden flex-shrink-0',
        shapeClass,
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ width: px, height: px, boxShadow }}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt=""
          width={px}
          height={px}
          loading="lazy"
          className={cn('w-full h-full object-cover', shapeClass)}
        />
      ) : (
        <div
          className={cn(
            'w-full h-full bg-gradient-to-br flex items-center justify-center text-white',
            shapeClass,
            avatarColor || 'from-blue-500 to-purple-500',
          )}
        >
          <span style={{ fontSize: Math.round(px * 0.55), lineHeight: 1 }} className="select-none drop-shadow-sm">
            {avatarEmoji || fallbackInitial || '🎓'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Render condicional de la "etiqueta de rareza" para usar fuera del avatar
 * (en gallery cards, perfil, etc.).
 */
export function RarityBadge({ rarity, className, size = 'sm' }) {
  if (!rarity) return null;
  const meta = rarityMeta(rarity);
  const sz = size === 'lg' ? 'text-sm px-3 py-1' : 'text-[10px] px-2 py-0.5';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wide text-white shadow',
        `bg-gradient-to-r ${meta.bg}`,
        sz,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
