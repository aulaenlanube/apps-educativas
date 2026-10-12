import React from 'react';

/**
 * Animación "Compleja" del plató (opción del docente: bgAnimMode = 'complex').
 * Capas HTML independientes (halo, rayos, anillo de trazos, hexágonos,
 * triángulos, órbita y ondas) que se giran/escalan con CSS → el compositor
 * las mueve sin repintar el SVG. Sin filtros SVG. Colores por variables CSS
 * (QuizBattle.css, .qb-stagefx); con `intensity="critical"` (≤5 s) vira a
 * rojo y acelera. Se mueve solo con nivel de efectos alto.
 *
 * Prop `intensity`: 'normal' | 'critical'.
 */
export default function QBStageAnimation({ intensity = 'normal' }) {
  const critical = intensity === 'critical';
  return (
    <div className={`qb-stagefx qb-stagefx--complex ${critical ? 'is-critical' : ''}`} aria-hidden="true">
      <span className="qb-stagefx__halo" />
      <span className="qb-stagefx__wave" />
      <span className="qb-stagefx__wave qb-stagefx__wave--2" />
      <span className="qb-stagefx__wave qb-stagefx__wave--3" />

      <span className="qb-stagefx__layer qb-stagefx__rays">
        <svg viewBox="-200 -200 400 400">
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="-1.5" y="-190" width="3" height="58" rx="1.5" transform={`rotate(${i * 30})`} />
          ))}
        </svg>
      </span>

      <span className="qb-stagefx__layer qb-stagefx__ring">
        <svg viewBox="-200 -200 400 400">
          <circle r="160" strokeDasharray="16 9" />
        </svg>
      </span>

      <span className="qb-stagefx__layer qb-stagefx__hex">
        <svg viewBox="-200 -200 400 400">
          <polygon points="120,0 60,104 -60,104 -120,0 -60,-104 60,-104" />
          <polygon points="100,0 50,87 -50,87 -100,0 -50,-87 50,-87" strokeDasharray="3 6" className="is-thin" />
        </svg>
      </span>

      <span className="qb-stagefx__layer qb-stagefx__tri">
        <svg viewBox="-200 -200 400 400">
          <polygon points="0,-78 67,39 -67,39" />
          <polygon points="0,78 67,-39 -67,-39" className="is-alt" />
        </svg>
      </span>

      <span className="qb-stagefx__layer qb-stagefx__orbit">
        <svg viewBox="-200 -200 400 400">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 132} cy={Math.sin(a) * 132} r={i % 2 ? 3.5 : 5} className={i % 2 ? 'is-alt' : ''} />;
          })}
        </svg>
      </span>

      <span className="qb-stagefx__core" />
    </div>
  );
}
