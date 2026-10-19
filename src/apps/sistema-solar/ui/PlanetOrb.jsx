// src/apps/sistema-solar/ui/PlanetOrb.jsx
// Miniatura DOM de un astro: el mapa real (1k) proyectado en un círculo con
// luz y sombra por gradientes, anillos para Saturno/Urano y halo para el Sol.
// Estática (sin animaciones en bucle): se repite en barras y tarjetas.
import React from 'react';
import { BODY_COLOR } from '../model/planetFacts';
import { thumbTexture } from '../scene/textures';

export default function PlanetOrb({ id, color, size = 24, textured = true, className = '' }) {
  const tex = textured ? thumbTexture(id) : null;
  const style = { '--pc': color || BODY_COLOR[id] || '#818cf8', '--s': `${size}px` };
  if (tex) style['--tex'] = `url(${tex})`;
  return (
    <span className={`ss-orb ss-orb--${id} ${tex ? 'is-tex' : ''} ${className}`} style={style} aria-hidden="true">
      {(id === 'saturn' || id === 'uranus') && <span className="ss-orb__ring" />}
    </span>
  );
}
