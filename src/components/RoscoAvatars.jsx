import React from 'react';
import { AVATARS } from './rosco-avatars';

// Personajes del Rosco del Saber (rediseño 2026): retratos de busto en SVG con
// el mismo encuadre, luz y acabado (ver src/components/rosco-avatars/).
// Cada personaje se identifica por un emoji (es lo que guarda la configuración).

const BY_ID = Object.fromEntries(AVATARS.map((a) => [a.id, a]));

// Lista ordenada de IDs para el selector (animales, fantasía, personas)
export const AVATAR_IDS = AVATARS.map((a) => a.id);

// Nombre, lema y colores de cada personaje: { [id]: { name, tagline, color, tint } }
export const AVATAR_META = Object.fromEntries(
  AVATARS.map(({ id, name, tagline, color, tint }) => [id, { name, tagline, color, tint }])
);

// Componente que renderiza un avatar por su emoji ID.
//   size: número (px) o cualquier medida CSS ('100%' para llenar su contenedor).
// El parpadeo y el pequeño gesto de cada personaje solo se animan con el nivel de
// efectos alto (html[data-fx="high"]) y nunca con prefers-reduced-motion (styles/art.css).
const RoscoAvatar = ({ id, size = 48, className = '' }) => {
  const Avatar = BY_ID[id]?.C;
  if (!Avatar) {
    // Emoji suelto (p. ej. el emoji de perfil del rival en un duelo)
    return (
      <span
        className={`ra-avatar ra-avatar--emoji ${className}`}
        style={{ width: size, height: size, display: 'inline-grid', placeItems: 'center', containerType: 'size', lineHeight: 1 }}
      >
        <span style={{ fontSize: typeof size === 'number' ? size * 0.7 : '70cqh' }}>{id}</span>
      </span>
    );
  }
  return (
    <div className={`ra-avatar inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Avatar />
    </div>
  );
};

export default RoscoAvatar;
