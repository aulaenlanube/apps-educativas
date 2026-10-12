import React from 'react';

/**
 * Plató de Quiz Battle: focos de colores que bajan desde el techo, cielo
 * estrellado, brillo del suelo y chispas. Va DENTRO del escenario (GameShell),
 * detrás de las fases (z-index 0, pointer-events none).
 * Todo es estático salvo con nivel de efectos alto (html[data-fx="high"]):
 * entonces los focos se balancean y las chispas titilan (solo transform/opacity).
 */
export default function QBBackground() {
  return (
    <div className="qb-bg" aria-hidden="true">
      <span className="qb-bg__stars" />
      <span className="qb-bg__beam qb-bg__beam--a" />
      <span className="qb-bg__beam qb-bg__beam--b" />
      <span className="qb-bg__beam qb-bg__beam--c" />
      <span className="qb-bg__beam qb-bg__beam--d" />
      <span className="qb-bg__floor" />
      <span className="qb-bg__sparkles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={`qb-sparkle qb-sparkle--${i % 4}`}
            style={{
              left: `${(i * 73 + 7) % 100}%`,
              top: `${(i * 41 + 11) % 92}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
            }}
          />
        ))}
      </span>
    </div>
  );
}
