import React from 'react';

/**
 * Fondo animado con 5 orbes de colores que flotan por la pantalla.
 * Se sitúa detrás de todo el contenido (z-index: 0, pointer-events: none).
 * Respeta el tema claro/oscuro via la opacidad heredada del tema.
 */
export default function QBBackground() {
  return (
    <div className="qb-bg-orbs" aria-hidden="true">
      <span className="qb-orb qb-orb-1" />
      <span className="qb-orb qb-orb-2" />
      <span className="qb-orb qb-orb-3" />
      <span className="qb-orb qb-orb-4" />
      <span className="qb-orb qb-orb-5" />
      <span className="qb-sparkles">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`qb-sparkle qb-sparkle-${i % 5}`} style={{
            left: `${(i * 73) % 100}%`,
            top: `${(i * 47) % 100}%`,
            animationDelay: `${(i * 0.7) % 6}s`,
          }} />
        ))}
      </span>
    </div>
  );
}
