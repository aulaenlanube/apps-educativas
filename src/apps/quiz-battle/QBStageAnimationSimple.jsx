import React from 'react';

/**
 * Animación "Simple" del plató (bgAnimMode = 'simple'): tres anillos finos y
 * cuatro puntos cardinales. Mismo sistema de capas que QBStageAnimation (giro
 * por CSS, sin filtros) y mismo cambio a rojo con `intensity="critical"`.
 */
export default function QBStageAnimationSimple({ intensity = 'normal' }) {
  const critical = intensity === 'critical';
  return (
    <div className={`qb-stagefx qb-stagefx--simple ${critical ? 'is-critical' : ''}`} aria-hidden="true">
      <span className="qb-stagefx__layer qb-stagefx__ring">
        <svg viewBox="-200 -200 400 400"><circle r="170" strokeDasharray="2 7" className="is-thin" /></svg>
      </span>
      <span className="qb-stagefx__layer qb-stagefx__hex">
        <svg viewBox="-200 -200 400 400"><circle r="120" strokeDasharray="4 10" className="is-thin" /></svg>
      </span>
      <span className="qb-stagefx__layer qb-stagefx__orbit">
        <svg viewBox="-200 -200 400 400">
          {[[0, -150], [150, 0], [0, 150], [-150, 0]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" />)}
        </svg>
      </span>
      <span className="qb-stagefx__pulse" />
      <span className="qb-stagefx__core qb-stagefx__core--small" />
    </div>
  );
}
