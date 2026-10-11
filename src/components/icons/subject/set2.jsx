// Ilustraciones de las tarjetas de asignatura (rediseño 2026).
// Contrato y guía de estilo: src/components/art/README.md
// IDS de este set: biologia, fisica, musica, plastica, tecnologia, ed-fisica, robotica, ia, latin, economia
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import { Sparkle, ShadowGradient, GlowGradient, GlossGradient, MaterialGradient } from '@/components/art/primitives';

/* ---------- Geometría precalculada (se evalúa una sola vez al cargar) ---------- */

const f = (n) => Number(n.toFixed(2));

// Punto de una elipse (centro cx,cy; semiejes rx,ry) girada `rot` grados, en el parámetro `t` (grados).
const onEllipse = (cx, cy, rx, ry, rot, t) => {
  const a = (rot * Math.PI) / 180;
  const p = (t * Math.PI) / 180;
  const x = rx * Math.cos(p);
  const y = ry * Math.sin(p);
  return [f(cx + x * Math.cos(a) - y * Math.sin(a)), f(cy + x * Math.sin(a) + y * Math.cos(a))];
};

// Silueta de engranaje (dientes trapezoidales) centrada en cx,cy.
const gearPath = (cx, cy, R, r, n, phase = 0) => {
  const step = (Math.PI * 2) / n;
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = phase + i * step;
    pts.push([r, a - step * 0.27], [R, a - step * 0.13], [R, a + step * 0.13], [r, a + step * 0.27]);
  }
  return `M${pts.map(([rad, ang]) => `${f(cx + rad * Math.cos(ang))} ${f(cy + rad * Math.sin(ang))}`).join(' L')} Z`;
};

// Doble hélice de ADN en coordenadas locales (eje horizontal de -14 a 14).
// Cada tramo va de cresta a cresta y cruza el eje en medio; en cada cruce una
// hebra queda delante y la otra detrás (se alterna), lo que da la torsión 3D.
const DNA_A = 9.2;
const DNA_W = 14;
const DNA_PEAKS = [-14, 0, 14];
const dnaY = (x) => -DNA_A * Math.cos((Math.PI * (x + 14)) / DNA_W); // hebra A (B = -A)
const dnaSeg = (i, sign) => {
  const x0 = DNA_PEAKS[i];
  const x1 = DNA_PEAKS[i + 1];
  const y0 = sign * dnaY(x0);
  const k = DNA_W * 0.36;
  return `M${x0} ${f(y0)} C${f(x0 + k)} ${f(y0)} ${f(x1 - k)} ${f(-y0)} ${x1} ${f(-y0)}`;
};
const DNA_SEGS = [0, 1].map((i) => {
  const aFront = i % 2 === 1; // primer cruce: B delante; segundo: A delante
  return {
    front: { d: dnaSeg(i, aFront ? 1 : -1), strand: aFront ? 'a' : 'b' },
    back: { d: dnaSeg(i, aFront ? -1 : 1), strand: aFront ? 'b' : 'a' },
  };
});
const DNA_RUNGS = [-13.2, -10.4, -4.3, -1.5, 1.5, 4.3, 10.4, 13.2].map((x, i) => ({
  x,
  y: f(dnaY(x)),
  c: i % 2 ? ['#67E8F9', '#818CF8'] : ['#FBBF24', '#F472B6'],
}));

/* ======================================================================
   Biología — Doble hélice de ADN con volumen (hebras en tubo que se
   cruzan delante/detrás) y dos células de cristal.
   Hover: la hélice da media vuelta, la célula sube y salta un destello.
   Reposo: la célula flota y titila un destello.
   ====================================================================== */
const Biologia = () => {
  const [id, url] = useArtIds();
  const strand = {
    a: { base: '#34D399', shade: '#065F46', back: '#059669' },
    b: { base: '#2DD4BF', shade: '#134E4A', back: '#0F766E' },
  };
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#10B981" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#022c22" opacity={0.36} />
        <radialGradient id={id('cell')} cx="0.36" cy="0.32" r="0.7">
          <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#6EE7B7" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.85" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44.6" rx="13" ry="2.1" fill={url('shadow')} />

      {/* hélice */}
      <g className="art-h-spin" style={{ '--spin': '180deg' }}>
        <g transform="translate(24 24) rotate(-50)">
          {/* hebras traseras (más oscuras y finas) */}
          {DNA_SEGS.map(({ back }) => (
            <path key={`b${back.d}`} d={back.d} stroke={strand[back.strand].back} strokeWidth="2.9" strokeLinecap="round" />
          ))}
          {/* pares de bases (dos colores por peldaño) */}
          {DNA_RUNGS.map(({ x, y, c }) => (
            <g key={x} strokeWidth="2" strokeLinecap="round">
              <line x1={x} y1={y} x2={x} y2="0" stroke={c[0]} />
              <line x1={x} y1="0" x2={x} y2={-y} stroke={c[1]} />
            </g>
          ))}
          {/* hebras delanteras: sombra, tubo y brillo */}
          {DNA_SEGS.map(({ front }) => (
            <g key={`f${front.d}`} strokeLinecap="round">
              <path d={front.d} transform="translate(0 0.6)" stroke={strand[front.strand].shade} strokeWidth="3.9" />
              <path d={front.d} stroke={strand[front.strand].base} strokeWidth="3.4" />
              <path d={front.d} transform="translate(0 -0.75)" stroke="#fff" strokeOpacity="0.65" strokeWidth="1" />
            </g>
          ))}
        </g>
      </g>

      {/* célula grande (flota) */}
      <g className="art-i-bob" style={{ '--amp': '-1.6px', '--dur': '4.6s' }}>
        <g className="art-h-lift" style={{ '--lift': '-3px' }}>
          <circle cx="9.6" cy="11.4" r="4.4" fill={url('cell')} />
          <circle cx="10.4" cy="12.2" r="1.6" fill="#047857" opacity="0.75" />
          <circle cx="9.9" cy="11.7" r="0.6" fill="#D1FAE5" opacity="0.8" />
          <ellipse cx="8.2" cy="9.6" rx="1.5" ry="0.9" transform="rotate(-35 8.2 9.6)" fill="#fff" opacity="0.85" />
          <circle cx="9.6" cy="11.4" r="4.1" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.5" />
        </g>
      </g>
      {/* célula pequeña */}
      <circle cx="40" cy="37.6" r="2.7" fill={url('cell')} />
      <circle cx="40.5" cy="38.1" r="0.95" fill="#047857" opacity="0.75" />
      <ellipse cx="39.1" cy="36.5" rx="0.9" ry="0.55" transform="rotate(-35 39.1 36.5)" fill="#fff" opacity="0.85" />

      <Sparkle x={40.4} y={8.6} r={2.4} fill="#D1FAE5" idle delay={0.4} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={7.4} y={36} r={2.4} fill="#FDE68A" /></g>
    </svg>
  );
};

/* ======================================================================
   Física y Química — Átomo: núcleo de protones y neutrones brillantes
   con tres órbitas y electrones de colores.
   Hover: las órbitas giran 120°, el núcleo se hincha y salta un destello.
   Reposo: late el halo del núcleo y titila un destello.
   ====================================================================== */
const ATOM = { cx: 24, cy: 24.6, rx: 19.2, ry: 6.9 };
const ELECTRONS = [
  { rot: 0, t: 196, c: 'eCyan' },
  { rot: 60, t: -26, c: 'ePink' },
  { rot: 120, t: 160, c: 'eAmber' },
].map((e) => ({ ...e, p: onEllipse(ATOM.cx, ATOM.cy, ATOM.rx, ATOM.ry, e.rot, e.t) }));

const Fisica = () => {
  const [id, url] = useArtIds();
  const sphere = (name, light, base, dark) => (
    <radialGradient id={id(name)} cx="0.35" cy="0.3" r="0.72">
      <stop offset="0%" stopColor={light} />
      <stop offset="45%" stopColor={base} />
      <stop offset="100%" stopColor={dark} />
    </radialGradient>
  );
  const nucleons = [
    { x: 22.3, y: 22.9, g: 'nViolet' },
    { x: 25.9, y: 22.7, g: 'nPink' },
    { x: 21.7, y: 26.4, g: 'nPink' },
    { x: 25.5, y: 26.5, g: 'nViolet' },
    { x: 23.8, y: 24.6, g: 'nPink' },
  ];
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#8B5CF6" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#1e1b4b" opacity={0.34} />
        <GlowGradient id={id('core')} color="#F0ABFC" opacity={0.85} mid={0.4} />
        <linearGradient id={id('ring')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EDE9FE" />
          <stop offset="45%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        {sphere('nPink', '#FDF2F8', '#F472B6', '#9D174D')}
        {sphere('nViolet', '#EDE9FE', '#8B5CF6', '#4C1D95')}
        {sphere('eCyan', '#ECFEFF', '#22D3EE', '#0E7490')}
        {sphere('ePink', '#FDF2F8', '#EC4899', '#831843')}
        {sphere('eAmber', '#FFFBEB', '#FBBF24', '#B45309')}
        <GlowGradient id={id('halo')} color="#fff" opacity={0.55} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44.8" rx="12" ry="1.9" fill={url('shadow')} />

      {/* halo del núcleo (late en reposo) */}
      <circle className="art-i-pulse" style={{ '--amp': 1.18, '--dur': '3.2s' }} cx={ATOM.cx} cy={ATOM.cy} r="9" fill={url('core')} />

      {/* órbitas + electrones */}
      <g className="art-h-spin" style={{ '--spin': '120deg' }}>
        <circle cx={ATOM.cx} cy={ATOM.cy} r="21.6" fill="none" />
        {[0, 60, 120].map((r) => (
          <g key={r} transform={`rotate(${r} ${ATOM.cx} ${ATOM.cy})`}>
            <ellipse cx={ATOM.cx} cy={ATOM.cy} rx={ATOM.rx} ry={ATOM.ry} stroke="#4C1D95" strokeOpacity="0.35" strokeWidth="2.6" />
            <ellipse cx={ATOM.cx} cy={ATOM.cy} rx={ATOM.rx} ry={ATOM.ry} stroke={url('ring')} strokeWidth="1.8" />
            <ellipse cx={ATOM.cx} cy={ATOM.cy - 0.35} rx={ATOM.rx - 0.4} ry={ATOM.ry - 0.35} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.5" />
          </g>
        ))}
        {ELECTRONS.map(({ p: [x, y], c }) => (
          <g key={c}>
            <circle cx={x} cy={y} r="4.2" fill={url('halo')} />
            <circle cx={x} cy={y} r="2.4" fill={url(c)} />
            <circle cx={x - 0.75} cy={y - 0.8} r="0.7" fill="#fff" opacity="0.9" />
          </g>
        ))}
      </g>

      {/* núcleo */}
      <g className="art-h-pop" style={{ '--pop': 1.18 }}>
        <circle cx="24.4" cy="25.4" r="5.6" fill="#2E1065" opacity="0.28" />
        {nucleons.map(({ x, y, g }) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="2.75" fill={url(g)} />
            <circle cx={x - 0.85} cy={y - 0.9} r="0.75" fill="#fff" opacity="0.8" />
          </g>
        ))}
      </g>

      <Sparkle x={9} y={9} r={2.4} fill="#EDE9FE" idle delay={0.8} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={41} y={42} r={2.4} fill="#FDE68A" /></g>
    </svg>
  );
};

/* ======================================================================
   Música — Corcheas unidas (♫) con relieve rosa y una corchea violeta.
   Hover: las notas bailan, la corchea pequeña salta y estalla un destello.
   Reposo: la corchea pequeña flota y titila un destello.
   ====================================================================== */
const Musica = () => {
  const [id, url] = useArtIds();
  const heads = [
    { cx: 15.2, cy: 35.4 },
    { cx: 33.2, cy: 31.4 },
  ];
  const glyph = (fill) => (
    <>
      {heads.map(({ cx, cy }) => (
        <ellipse key={cx} cx={cx} cy={cy} rx="5.7" ry="4.3" transform={`rotate(-22 ${cx} ${cy})`} fill={fill} />
      ))}
      <rect x="18.9" y="11" width="2.4" height="24" rx="1" fill={fill} />
      <rect x="36.9" y="7" width="2.4" height="24" rx="1" fill={fill} />
      <path d="M18.9 10.4 L39.3 6.2 L39.3 11.6 L18.9 15.8 Z" fill={fill} />
    </>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#EC4899" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#500724" opacity={0.36} />
        <linearGradient id={id('note')} gradientUnits="userSpaceOnUse" x1="10" y1="6" x2="38" y2="42">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="40%" stopColor="#F472B6" />
          <stop offset="75%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#9D174D" />
        </linearGradient>
        <MaterialGradient id={id('small')} light="#EDE9FE" base="#8B5CF6" dark="#4C1D95" />
        <GlossGradient id={id('gloss')} opacity={0.85} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="25" cy="44.4" rx="14" ry="2" fill={url('shadow')} />

      {/* corchea pequeña (flota) */}
      <g className="art-i-bob" style={{ '--amp': '-1.8px', '--dur': '3.6s' }}>
        <g className="art-h-jump" style={{ '--jump': '-5px', '--d': '.1s' }}>
          <g transform="translate(0.7 0.9)" fill="#3B0764">
            <ellipse cx="8.6" cy="20" rx="3.3" ry="2.5" transform="rotate(-22 8.6 20)" />
            <rect x="10.6" y="7.4" width="1.5" height="12.6" rx="0.6" />
            <path d="M11.2 7.4 C11.6 10 15.8 10.6 15.2 15.4 C14.6 12.8 13 12 11.2 11.8 Z" />
          </g>
          <ellipse cx="8.6" cy="20" rx="3.3" ry="2.5" transform="rotate(-22 8.6 20)" fill={url('small')} />
          <rect x="10.6" y="7.4" width="1.5" height="12.6" rx="0.6" fill="#7C3AED" />
          <path d="M11.2 7.4 C11.6 10 15.8 10.6 15.2 15.4 C14.6 12.8 13 12 11.2 11.8 Z" fill="#A78BFA" />
          <ellipse cx="7.7" cy="19.1" rx="1.2" ry="0.6" transform="rotate(-22 7.7 19.1)" fill="#fff" opacity="0.8" />
        </g>
      </g>

      {/* ♫ principal */}
      <g className="art-h-wiggle art-o-bottom">
        <g transform="translate(1.2 1.4)">{glyph('#831843')}</g>
        {glyph(url('note'))}
        {/* brillos */}
        <path d="M19.8 11.4 L38.4 7.6" stroke={url('gloss')} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M19.6 16.8 L19.6 31" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M37.6 12.6 L37.6 27" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
        {heads.map(({ cx, cy }) => (
          <ellipse key={cx} cx={cx - 2} cy={cy - 1.6} rx="2.3" ry="1.15" transform={`rotate(-22 ${cx - 2} ${cy - 1.6})`} fill="#fff" opacity="0.75" />
        ))}
        <path d="M11 37.6 C12.6 39.6 16.6 39.8 19.6 37.6" stroke="#500724" strokeOpacity="0.3" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      <Sparkle x={42} y={19} r={2.4} fill="#FDE68A" idle delay={0.6} />
      <g className="art-h-burst" style={{ '--d': '.18s' }}><Sparkle x={44} y={38} r={2.6} fill="#FBCFE8" /></g>
    </svg>
  );
};

/* ======================================================================
   Educación Plástica — Paleta de madera con gotas de pintura brillantes
   y un pincel que pinta un trazo violeta.
   Hover: el pincel da pinceladas, la gota roja crece y salta un destello.
   Reposo: titila un destello.
   ====================================================================== */
const PALETTE_D = 'M6 27.4 C5.4 18.6 13.4 11.4 23.6 11.2 C33.8 11 41.6 17 41.8 24.4 C42 29.4 38.8 31.4 35.4 30.4 C32.4 29.6 29.6 31 30.2 34.4 C30.8 37.8 28.4 41.6 21.6 41.6 C12.8 41.6 6.6 36 6 27.4 Z';
const PAINTS = [
  { k: 'red', x: 12.6, y: 22.4, r: 3.1, c: ['#FECACA', '#EF4444', '#991B1B'] },
  { k: 'amber', x: 19.6, y: 16.9, r: 3.1, c: ['#FEF3C7', '#FBBF24', '#B45309'] },
  { k: 'green', x: 27.8, y: 16.4, r: 3.1, c: ['#D1FAE5', '#10B981', '#065F46'] },
  { k: 'blue', x: 36.4, y: 25.2, r: 2.8, c: ['#DBEAFE', '#3B82F6', '#1E3A8A'] },
];

const Plastica = () => {
  const [id, url] = useArtIds();
  const blob = ({ k, x, y, r }) => (
    <g key={k}>
      <ellipse cx={x + 0.4} cy={y + 0.8} rx={r} ry={r * 0.9} fill="#7C2D12" opacity="0.28" />
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.9} fill={url(k)} />
      <ellipse cx={x - r * 0.38} cy={y - r * 0.36} rx={r * 0.38} ry={r * 0.24} transform={`rotate(-30 ${x - r * 0.38} ${y - r * 0.36})`} fill="#fff" opacity="0.85" />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#A855F7" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#3b0764" opacity={0.36} />
        <MaterialGradient id={id('wood')} light="#FFF4DE" base="#F2CD94" dark="#C98A48" />
        <linearGradient id={id('hole')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6B3A12" />
          <stop offset="100%" stopColor="#B87A3E" />
        </linearGradient>
        {PAINTS.map(({ k, c }) => (
          <radialGradient key={k} id={id(k)} cx="0.38" cy="0.32" r="0.72">
            <stop offset="0%" stopColor={c[0]} />
            <stop offset="45%" stopColor={c[1]} />
            <stop offset="100%" stopColor={c[2]} />
          </radialGradient>
        ))}
        <MaterialGradient id={id('handle')} light="#E9D5FF" base="#A855F7" dark="#581C87" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('ferrule')} light="#F8FAFC" base="#CBD5E1" dark="#64748B" x1={0} y1={0.5} x2={1} y2={0.5} />
        <GlossGradient id={id('gloss')} opacity={0.75} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44.4" rx="15" ry="2.1" fill={url('shadow')} />

      {/* paleta: canto, cara y luces */}
      <path d={PALETTE_D} transform="translate(0.3 1.7)" fill="#8A4B1C" />
      <path d={PALETTE_D} fill={url('wood')} />
      <path d="M8.2 22.8 C10.2 16 16.2 12.4 23.6 12.3" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 16.6 C16 13.6 20.6 12.8 25 13" stroke={url('gloss')} strokeWidth="2" strokeLinecap="round" />
      <path d="M8.6 33.6 C11.4 38.4 16 40.6 21.6 40.6 C26 40.6 28.6 39.2 29.6 36.8" stroke="#7C3F12" strokeOpacity="0.25" strokeWidth="1.1" strokeLinecap="round" />
      {/* agujero del pulgar */}
      <ellipse cx="14.4" cy="31.6" rx="2.9" ry="2.3" fill={url('hole')} />
      <path d="M12.2 33 C13 34.2 15.6 34.4 16.9 32.8" stroke="#FFF4DE" strokeOpacity="0.8" strokeWidth="0.6" strokeLinecap="round" />

      {/* gotas de pintura */}
      {PAINTS.filter((p) => p.k !== 'red').map(blob)}
      <g className="art-h-pop" style={{ '--pop': 1.22 }}>{blob(PAINTS[0])}</g>

      {/* trazo violeta recién pintado */}
      <path d="M17.6 37 C19.8 35.4 22.4 35 24.6 32.4" stroke="#7E22CE" strokeWidth="3" strokeLinecap="round" opacity="0.35" transform="translate(0.3 0.6)" />
      <path d="M17.6 37 C19.8 35.4 22.4 35 24.6 32.4" stroke="#A855F7" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M18.4 35.8 C20 34.8 21.6 34.4 23.2 33" stroke="#F3E8FF" strokeOpacity="0.7" strokeWidth="0.6" strokeLinecap="round" />

      {/* pincel */}
      <g className="art-h-wiggle" style={{ transformOrigin: '0% 100%' }}>
        <g transform="translate(25.6 31) rotate(40)">
          {/* sombra del pincel */}
          <path d="M-1.2 -26.4 L1.2 -26.4 L1.6 -10 L-1.6 -10 Z" transform="translate(1.1 0.4)" fill="#3b0764" opacity="0.25" />
          {/* mango */}
          <path d="M-1.6 -10 L-1.15 -26 Q0 -27.6 1.15 -26 L1.6 -10 Z" fill={url('handle')} />
          <path d="M-0.95 -11 L-0.65 -25.4" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.55" strokeLinecap="round" />
          {/* virola */}
          <rect x="-1.9" y="-10.4" width="3.8" height="4.6" rx="0.6" fill={url('ferrule')} />
          <path d="M-1.9 -8.6 H1.9" stroke="#64748B" strokeWidth="0.45" />
          {/* pelo con pintura */}
          <path d="M-1.8 -5.8 C-2.1 -2.6 -0.9 -0.6 0 0.6 C0.9 -0.6 2.1 -2.6 1.8 -5.8 Z" fill="#F5D9A8" />
          <path d="M-1.6 -3.4 C-1.4 -1.6 -0.7 -0.4 0 0.6 C0.7 -0.4 1.4 -1.6 1.6 -3.4 Z" fill="#A855F7" />
          <path d="M-0.9 -5.4 L-0.7 -2.6" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.45" strokeLinecap="round" />
        </g>
      </g>

      <Sparkle x={43} y={9.6} r={2.3} fill="#F3E8FF" idle delay={0.5} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={5.4} y={11} r={2.5} fill="#FDE68A" /></g>
    </svg>
  );
};

/* ======================================================================
   Tecnología — Dos engranajes engranados (acero y latón) con pistas de
   circuito y LEDs cian.
   Hover: los engranajes giran engranados en sentidos opuestos.
   Reposo: un LED respira y titila un destello.
   Los engranajes giran con relleno radial (simétrico) y la iluminación va
   en capas fijas encima, así la luz no "rota" con la pieza.
   ====================================================================== */
const GEAR_BIG = { cx: 19, cy: 26.4, R: 14.4, r: 11.4, n: 10 };
const GEAR_SMALL = { cx: 35.4, cy: 12.6, R: 8, r: 5.9, n: 8 };
const GEAR_BIG_D = gearPath(GEAR_BIG.cx, GEAR_BIG.cy, GEAR_BIG.R, GEAR_BIG.r, GEAR_BIG.n, 0.16);
const GEAR_SMALL_D = gearPath(GEAR_SMALL.cx, GEAR_SMALL.cy, GEAR_SMALL.R, GEAR_SMALL.r, GEAR_SMALL.n, 0.05);
const GEAR_HOLES = Array.from({ length: 6 }, (_, i) => {
  const a = (i * Math.PI) / 3 + 0.3;
  return [f(GEAR_BIG.cx + 7.5 * Math.cos(a)), f(GEAR_BIG.cy + 7.5 * Math.sin(a))];
});

const Tecnologia = () => {
  const [id, url] = useArtIds();
  const bigSpin = { '--spin': '72deg' };
  const smallSpin = { '--spin': '-90deg' };
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#64748B" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#0f172a" opacity={0.38} />
        <radialGradient id={id('steel')} gradientUnits="userSpaceOnUse" cx={GEAR_BIG.cx} cy={GEAR_BIG.cy} r={GEAR_BIG.R}>
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="62%" stopColor="#CBD5E1" />
          <stop offset="84%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </radialGradient>
        <radialGradient id={id('brass')} gradientUnits="userSpaceOnUse" cx={GEAR_SMALL.cx} cy={GEAR_SMALL.cy} r={GEAR_SMALL.R}>
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="62%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <linearGradient id={id('light')} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="65%" stopColor="#0F172A" stopOpacity="0" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.4" />
        </linearGradient>
        <MaterialGradient id={id('hub')} light="#C7D2FE" base="#6366F1" dark="#312E81" />
        <GlowGradient id={id('led')} color="#22D3EE" opacity={0.9} />
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="22" cy="44.4" rx="15" ry="2.1" fill={url('shadow')} />

      {/* pistas de circuito */}
      <g stroke="#0E7490" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M33 30.4 H38.4 L41.4 27.4" />
        <path d="M31.4 35.4 H42" />
      </g>
      <g stroke="#67E8F9" strokeWidth="0.45" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M33 30.1 H38.3 L41.2 27.2" />
        <path d="M31.4 35.1 H41.8" />
      </g>
      <circle className="art-i-glow" style={{ '--lo': 0.35, '--hi': 1, '--dur': '2.6s' }} cx="42" cy="26.8" r="3.6" fill={url('led')} />
      <circle cx="42" cy="26.8" r="1.5" fill="#ECFEFF" stroke="#0891B2" strokeWidth="0.6" />
      <circle cx="42.8" cy="35.4" r="2.6" fill={url('led')} opacity="0.6" />
      <circle cx="42.8" cy="35.4" r="1.2" fill="#ECFEFF" stroke="#0891B2" strokeWidth="0.5" />

      {/* engranaje pequeño (latón) */}
      <g transform="translate(0.8 1.1)">
        <g className="art-h-spin" style={smallSpin}><path d={GEAR_SMALL_D} fill="#78350F" /></g>
      </g>
      <g className="art-h-spin" style={smallSpin}><path d={GEAR_SMALL_D} fill={url('brass')} /></g>
      <circle cx={GEAR_SMALL.cx} cy={GEAR_SMALL.cy} r={GEAR_SMALL.r - 0.2} fill={url('light')} />
      <circle cx={GEAR_SMALL.cx} cy={GEAR_SMALL.cy} r="2.3" fill="#92400E" />
      <circle cx={GEAR_SMALL.cx} cy={GEAR_SMALL.cy} r="1.1" fill="#451A03" />
      <path d="M30.4 10.4 C31.2 8.6 32.8 7.4 34.8 7.1" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.8" strokeLinecap="round" />

      {/* engranaje grande (acero) */}
      <g transform="translate(1 1.4)">
        <g className="art-h-spin" style={bigSpin}><path d={GEAR_BIG_D} fill="#334155" /></g>
      </g>
      <g className="art-h-spin" style={bigSpin}>
        <path d={GEAR_BIG_D} fill={url('steel')} />
        {GEAR_HOLES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.55" fill="#475569" />
        ))}
      </g>
      <circle cx={GEAR_BIG.cx} cy={GEAR_BIG.cy} r={GEAR_BIG.r - 0.3} fill={url('light')} />
      <circle cx={GEAR_BIG.cx} cy={GEAR_BIG.cy} r="9.6" stroke="#475569" strokeOpacity="0.35" strokeWidth="0.6" />
      {/* buje índigo */}
      <circle cx={GEAR_BIG.cx + 0.4} cy={GEAR_BIG.cy + 0.6} r="4.6" fill="#1E1B4B" opacity="0.35" />
      <circle cx={GEAR_BIG.cx} cy={GEAR_BIG.cy} r="4.6" fill={url('hub')} />
      <circle cx={GEAR_BIG.cx} cy={GEAR_BIG.cy} r="1.8" fill="#1E1B4B" />
      <circle cx={GEAR_BIG.cx} cy={GEAR_BIG.cy} r="0.8" fill="#22D3EE" />
      <ellipse cx={GEAR_BIG.cx - 1.6} cy={GEAR_BIG.cy - 2.2} rx="1.6" ry="0.8" transform={`rotate(-30 ${GEAR_BIG.cx - 1.6} ${GEAR_BIG.cy - 2.2})`} fill="#fff" opacity="0.7" />
      {/* luz de borde y brillo especular */}
      <path d="M8.6 22.4 C9.8 17.8 13.6 14.6 18.2 14.2" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.9" strokeLinecap="round" />
      <ellipse cx="13.4" cy="19.8" rx="3.6" ry="1.5" transform="rotate(-40 13.4 19.8)" fill={url('gloss')} />

      <Sparkle x={7} y={8.6} r={2.4} fill="#E2E8F0" idle delay={0.3} />
    </svg>
  );
};

/* ======================================================================
   Educación Física — Zapatilla de deporte roja con suela blanca,
   cordones y talonera ámbar.
   Hover: la zapatilla da una zancada (sube y levanta la puntera) y
   aparecen las líneas de velocidad. Reposo: titila un destello.
   Inclinada unos grados en reposo para dar sensación de carrera.
   ====================================================================== */
const SHOE_UPPER = 'M6.6 31 C6.1 26 6.2 21.6 7 19 C7.7 16.6 9 15.4 10.6 15.6 C13 16 15 17.2 17 18.4 C17.6 16.4 18.6 14.4 20.2 13.9 C21.4 13.6 22.4 14.2 23 15.2 C26 18.6 30 21.6 35 23.4 C39.4 24.8 42.6 26 43.6 28.6 C44 29.6 43.8 30.6 43.4 31 Z';
const SHOE_SOLE = 'M5 33.6 C5 31.6 6 30.4 8 30.4 L40.6 30.4 C43.2 30.4 44.8 31.8 44.4 34 C44 36.2 42.4 37.4 40 37.4 L8.6 37.4 C6.2 37.4 5 35.8 5 33.6 Z';

const EdFisica = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#EF4444" opacity={0.26} />
        <ShadowGradient id={id('shadow')} color="#450a0a" opacity={0.4} />
        <MaterialGradient id={id('upper')} light="#FECACA" base="#EF4444" dark="#991B1B" />
        <linearGradient id={id('sole')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <MaterialGradient id={id('gold')} light="#FEF3C7" base="#FBBF24" dark="#B45309" />
        <linearGradient id={id('shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7F1D1D" stopOpacity="0" />
          <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0.45" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.75} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="25" cy="42.6" rx="18" ry="2.2" fill={url('shadow')} />

      {/* líneas de velocidad (aparecen) */}
      <g className="art-h-show" stroke="#F87171" strokeLinecap="round">
        <path d="M0.8 20.6 H4.6" strokeWidth="1.3" />
        <path d="M0.2 25 H4.4" strokeWidth="1.1" opacity="0.8" />
        <path d="M1.2 29.2 H4.2" strokeWidth="0.9" opacity="0.6" />
      </g>

      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g className="art-h-tilt" style={{ '--tilt': '-7deg', transformOrigin: '20% 100%' }}>
          <g transform="rotate(-6 25 29)">
          {/* pala */}
          <path d={SHOE_UPPER} fill={url('upper')} />
          <path d="M33 22.4 C38.6 24.4 42.6 25.8 43.6 28.6 C44 29.6 43.8 30.6 43.4 31 L31.6 31 C35.6 29.6 37.2 26.4 33 22.4 Z" fill={url('shade')} />
          {/* puntera */}
          <path d="M36.6 31 C36.8 27.6 38.6 25 41 25.6 C42.6 26.2 43.6 27.4 43.6 28.6 C44 29.6 43.8 30.6 43.4 31 Z" fill="#FEE2E2" />
          <path d="M37.6 30.4 C37.8 28 39 26.4 40.8 26.6" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.6" strokeLinecap="round" />
          {/* franja lateral ámbar */}
          <path d="M10.4 27.4 C17 28.2 24.6 26.6 31.6 22.6 L33.6 23.6 C26.4 28.6 18 30.6 10.6 29.8 Z" fill={url('gold')} />
          {/* talonera y forro del cuello */}
          <path d="M7 19 C7.7 16.6 9 15.4 10.6 15.6 L10.4 18.4 C9.2 18.6 8.2 19.6 7.6 21.2 Z" fill={url('gold')} />
          <path d="M10.6 15.8 C13 16.2 15 17.4 17 18.6" stroke="#7F1D1D" strokeWidth="1.5" strokeLinecap="round" />
          {/* lengüeta */}
          <path d="M17.6 18 C18.2 16.2 19 14.6 20.2 14.2 C21.2 13.9 22 14.4 22.6 15.4" stroke="#FCA5A5" strokeWidth="0.8" strokeLinecap="round" />
          {/* cordones */}
          {[[19.4, 18.2, 22.6, 16.6], [22.2, 20.6, 25.6, 19.2], [25.2, 22.8, 28.4, 21.4], [28.2, 24.6, 31.2, 23.4]].map(([x1, y1, x2, y2]) => (
            <g key={x1} strokeLinecap="round">
              <line x1={x1} y1={y1 + 0.5} x2={x2} y2={y2 + 0.5} stroke="#7F1D1D" strokeOpacity="0.5" strokeWidth="1.3" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="1.2" />
            </g>
          ))}
          {/* brillo y luz de borde */}
          <path d="M7.8 28 C7.4 24 7.6 20.4 8.6 18.4" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M24 17.2 C26.6 19.6 29.4 21.4 32.4 22.6" stroke={url('gloss')} strokeWidth="1.4" strokeLinecap="round" />
          {/* suela */}
          <path d={SHOE_SOLE} fill={url('sole')} />
          <path d="M6.4 33.4 L43.6 33.4" stroke="#FBBF24" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M6.6 31.2 H41" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M6.4 36.4 C7 37 7.6 37.4 8.6 37.4 L40 37.4 C41.6 37.4 42.8 36.9 43.6 35.8" stroke="#475569" strokeOpacity="0.6" strokeWidth="1" strokeLinecap="round" />
          {[11, 16, 21, 26, 31, 36].map((x) => (
            <line key={x} x1={x} y1="35.2" x2={x + 1.2} y2="37" stroke="#64748B" strokeOpacity="0.45" strokeWidth="0.6" strokeLinecap="round" />
          ))}
          </g>
        </g>
      </g>

      <Sparkle x={36} y={10} r={2.6} fill="#FEF3C7" idle delay={0.5} />
    </svg>
  );
};

/* ======================================================================
   Robótica — Mini versión de la mascota de la plataforma: cabeza-monitor
   índigo, visor oscuro, ojos asimétricos (el derecho mayor), antena con
   orbe rosa y núcleo cian en el pecho.
   Hover: da un salto y pone ojos felices.
   Reposo: parpadea y respira la luz del orbe.
   ====================================================================== */
const Robotica = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#38BDF8" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#1e1b4b" opacity={0.42} />
        <linearGradient id={id('head')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="35%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <linearGradient id={id('limb')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <MaterialGradient id={id('body')} light="#A5B4FC" base="#5B4FF0" dark="#312E81" />
        <linearGradient id={id('visor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="55%" stopColor="#0B0A24" />
          <stop offset="100%" stopColor="#1A1450" />
        </linearGradient>
        <radialGradient id={id('sclera')} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="80%" stopColor="#EEF0FF" />
          <stop offset="100%" stopColor="#C7CBF2" />
        </radialGradient>
        <radialGradient id={id('iris')} cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
        <radialGradient id={id('orb')} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FDF4FF" />
          <stop offset="40%" stopColor="#F0ABFC" />
          <stop offset="100%" stopColor="#A21CAF" />
        </radialGradient>
        <GlowGradient id={id('orbGlow')} color="#F0ABFC" opacity={0.8} />
        <radialGradient id={id('core')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ECFEFF" />
          <stop offset="35%" stopColor="#67E8F9" />
          <stop offset="75%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('metal')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#F1F0FF" />
          <stop offset="45%" stopColor="#A5A3C9" />
          <stop offset="100%" stopColor="#47456B" />
        </radialGradient>
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      <circle cx="24" cy="25" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="45.4" rx="11.5" ry="1.9" fill={url('shadow')} />

      <g className="art-h-jump" style={{ '--jump': '-4px' }}>
        {/* torso con núcleo IA */}
        <rect x="14.4" y="35" width="19.2" height="9.6" rx="4.8" fill={url('body')} />
        <path d="M16.6 36.6 Q24 35 31.4 36.6" stroke={url('gloss')} strokeWidth="1" strokeLinecap="round" />
        <circle cx="24" cy="39.8" r="4.2" fill={url('core')} />
        <circle cx="24" cy="39.8" r="1.9" fill="#0E7490" stroke="#A5F3FC" strokeWidth="0.4" />
        <circle cx="24" cy="39.8" r="0.9" fill="#ECFEFF" />
        {/* cuello */}
        <rect x="21.2" y="33.6" width="5.6" height="2.6" rx="1" fill={url('metal')} />

        {/* antena */}
        <path d="M24 11.6 L24 7.8 L22.6 5.6" stroke="#4F46E5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24.35 11.2 L24.35 8 L23.1 6" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.4" strokeLinecap="round" />
        <circle cx="24" cy="8.2" r="0.85" fill={url('metal')} />
        <circle className="art-i-glow" style={{ '--lo': 0.35, '--hi': 1, '--dur': '2.8s' }} cx="22.4" cy="4.6" r="4.2" fill={url('orbGlow')} />
        <circle cx="22.4" cy="4.6" r="2.25" fill={url('orb')} />
        <circle cx="21.65" cy="3.85" r="0.75" fill="#fff" opacity="0.85" />

        {/* orejeras */}
        <rect x="6" y="18.4" width="4.4" height="9.2" rx="2.2" fill={url('limb')} />
        <rect x="37.6" y="18.4" width="4.4" height="9.2" rx="2.2" fill={url('limb')} />
        <circle cx="8.2" cy="23" r="0.85" fill="#67E8F9" />
        <circle cx="39.8" cy="23" r="0.85" fill="#67E8F9" />

        {/* carcasa */}
        <rect x="9" y="11.2" width="30" height="24" rx="8.8" fill={url('head')} />
        <rect x="9.2" y="11.4" width="29.6" height="23.6" rx="8.6" stroke="#fff" strokeOpacity="0.4" strokeWidth="0.4" />
        <path d="M13 14.6 Q17.4 12 24.4 12.4" stroke={url('gloss')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.8 29.8 Q12 33.4 15.6 34.4" stroke="#1E1B4B" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />

        {/* visor */}
        <rect x="11.6" y="15.4" width="24.8" height="14.6" rx="7.2" fill="#1E1B4B" opacity="0.55" />
        <rect x="12.2" y="16" width="23.6" height="13.4" rx="6.6" fill={url('visor')} />
        {[19.6, 22.4, 25.2].map((y) => (
          <line key={y} x1="13.4" x2="34.6" y1={y} y2={y} stroke="#818CF8" strokeOpacity="0.12" strokeWidth="0.3" />
        ))}
        {/* ojos (parpadean); en hover se cambian por ojos felices */}
        <g className="art-h-hide">
          <g className="art-i-blink" style={{ '--dur': '4.6s' }}>
            <circle cx="19.4" cy="22.7" r="3.15" fill={url('sclera')} />
            <circle cx="19.7" cy="22.9" r="1.85" fill={url('iris')} />
            <circle cx="19.7" cy="22.9" r="0.85" fill="#0B0A24" />
            <circle cx="19" cy="22.1" r="0.6" fill="#fff" />
            <circle cx="28.6" cy="22.3" r="4" fill={url('sclera')} />
            <circle cx="28.9" cy="22.5" r="2.3" fill={url('iris')} />
            <circle cx="28.9" cy="22.5" r="1.05" fill="#0B0A24" />
            <circle cx="28.05" cy="21.55" r="0.75" fill="#fff" />
            <circle cx="29.7" cy="23.3" r="0.32" fill="#fff" opacity="0.8" />
          </g>
        </g>
        <g className="art-h-show" stroke="#E0E7FF" strokeLinecap="round">
          <path d="M16.6 23.8 Q19.4 20 22.2 23.8" strokeWidth="1.2" />
          <path d="M25.1 23.6 Q28.6 19 32.1 23.6" strokeWidth="1.4" />
        </g>
        <path d="M14 18.4 Q22 16.8 33.2 17.8 L32.6 19 Q22 18.2 14.4 19.8 Z" fill="#fff" opacity="0.12" />
        <rect x="12.2" y="16" width="23.6" height="13.4" rx="6.6" stroke="#67E8F9" strokeOpacity="0.4" strokeWidth="0.4" />

        {/* mejillas, boca-pantalla, tornillos y LED */}
        <ellipse cx="12.4" cy="31.6" rx="1.7" ry="0.95" fill="#F472B6" opacity="0.6" />
        <ellipse cx="35.6" cy="31.6" rx="1.7" ry="0.95" fill="#F472B6" opacity="0.6" />
        <rect x="20.2" y="30.6" width="7.6" height="2.8" rx="1.4" fill="#0B0A24" stroke="#67E8F9" strokeOpacity="0.35" strokeWidth="0.3" />
        <path d="M21.9 31.5 Q24 33.1 26.1 31.5" stroke="#67E8F9" strokeWidth="0.7" strokeLinecap="round" />
        <circle cx="11.5" cy="13.7" r="0.55" fill={url('metal')} />
        <circle cx="36.5" cy="13.7" r="0.55" fill={url('metal')} />
        <circle cx="34.6" cy="32.6" r="0.5" fill="#4ADE80" />
      </g>
    </svg>
  );
};

/* ======================================================================
   Inteligencia Artificial — Cerebro mitad orgánico (violeta brillante)
   y mitad chip (índigo con pistas y nodos cian).
   Hover: el cerebro crece, los nodos se encienden y salta un destello.
   Reposo: las pistas cian respiran y titila un destello.
   ====================================================================== */
const BRAIN_L = 'M24 9.4 C21.6 7.4 17.6 7.6 15.6 10 C12 9.6 9.4 12.4 9.8 15.8 C7.2 17.4 6.6 21.2 8.4 23.6 C6.8 26.2 7.6 30 10.4 31.2 C10.8 34.8 14 37.2 17.4 36.4 C19.4 38.6 22.6 38.6 24 36.8 Z';
const BRAIN_R = 'M24 9.4 C26.4 7.4 30.4 7.6 32.4 10 C36 9.6 38.6 12.4 38.2 15.8 C40.8 17.4 41.4 21.2 39.6 23.6 C41.2 26.2 40.4 30 37.6 31.2 C37.2 34.8 34 37.2 30.6 36.4 C28.6 38.6 25.4 38.6 24 36.8 Z';
const IA_TRACES = ['M24.6 13.6 H28.6 L31.4 16.4', 'M24.6 20.4 H34.4', 'M24.6 26.2 H28 L30.8 29 H34.6', 'M24.6 32.2 H28.6 L30.4 34'];
const IA_NODES = [[31.8, 16.8], [35.4, 20.4], [35.6, 29], [30.8, 34.4]];

const IA = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#7C3AED" opacity={0.3} />
        <ShadowGradient id={id('shadow')} color="#1e1b4b" opacity={0.4} />
        <MaterialGradient id={id('lobe')} light="#F5D0FE" base="#C084FC" dark="#6D28D9" />
        <MaterialGradient id={id('chip')} light="#818CF8" base="#4338CA" dark="#1E1B4B" />
        <GlowGradient id={id('node')} color="#22D3EE" opacity={0.95} />
        <GlossGradient id={id('gloss')} opacity={0.8} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44" rx="13" ry="2" fill={url('shadow')} />

      <g className="art-h-pop" style={{ '--pop': 1.07 }}>
        <g transform="translate(24 23.4) scale(1.1) translate(-24 -23.4)">
        {/* grosor (canto inferior) */}
        <path d={BRAIN_L} transform="translate(0.6 1.5)" fill="#4C1D95" />
        <path d={BRAIN_R} transform="translate(0.6 1.5)" fill="#1E1B4B" />

        {/* hemisferio orgánico */}
        <path d={BRAIN_L} fill={url('lobe')} />
        <g strokeLinecap="round" fill="none">
          <path d="M12.2 15.4 C14.6 14 16.8 15.6 18.6 13.8" stroke="#6D28D9" strokeOpacity="0.55" strokeWidth="1" />
          <path d="M10.2 21.8 C13 20.4 15.6 22.6 18.4 20.8 C19.8 19.8 21 20.6 21.8 19.6" stroke="#6D28D9" strokeOpacity="0.55" strokeWidth="1" />
          <path d="M10.8 28.4 C13.6 27 16 29.2 19.2 27.4" stroke="#6D28D9" strokeOpacity="0.55" strokeWidth="1" />
          <path d="M14.6 33.6 C16.6 32.2 18.8 33.4 21 32" stroke="#6D28D9" strokeOpacity="0.5" strokeWidth="1" />
          <path d="M12.2 14.7 C14.6 13.3 16.8 14.9 18.6 13.1" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.55" />
          <path d="M10.2 21.1 C13 19.7 15.6 21.9 18.4 20.1" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.55" />
          <path d="M10.8 27.7 C13.6 26.3 16 28.5 19.2 26.7" stroke="#fff" strokeOpacity="0.45" strokeWidth="0.55" />
        </g>

        {/* hemisferio chip */}
        <path d={BRAIN_R} fill={url('chip')} />
        <path d={BRAIN_R} stroke="#A5B4FC" strokeOpacity="0.55" strokeWidth="0.6" />
        <g stroke="#0E7490" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {IA_TRACES.map((d) => <path key={d} d={d} />)}
        </g>
        <g className="art-i-glow" style={{ '--lo': 0.55, '--hi': 1, '--dur': '3s' }} stroke="#67E8F9" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
          {IA_TRACES.map((d) => <path key={d} d={d} />)}
        </g>
        <g className="art-h-show">
          {IA_NODES.map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="3.4" fill={url('node')} />)}
        </g>
        {IA_NODES.map(([x, y]) => (
          <circle key={`n${x + y}`} cx={x} cy={y} r="1.15" fill="#ECFEFF" stroke="#22D3EE" strokeWidth="0.6" />
        ))}

        {/* cisura central, luz de borde y brillo */}
        <path d="M24 9.6 V36.6" stroke="#1E1B4B" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M8.8 22.4 C7.6 19.6 8.6 16.8 10.4 15.6 C10.2 12.6 12.4 10.2 15.6 10.6 C17.4 8.6 20.6 8.2 22.8 9.6" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M25.6 9.4 C27.8 8.2 30.6 8.6 32.2 10.4 C34 10.2 35.8 11 36.8 12.6" stroke="#C7D2FE" strokeOpacity="0.7" strokeWidth="0.7" strokeLinecap="round" />
        <ellipse cx="15.4" cy="12.6" rx="3.4" ry="1.3" transform="rotate(-18 15.4 12.6)" fill={url('gloss')} />
        </g>
      </g>

      <Sparkle x={41.6} y={8.4} r={2.4} fill="#CFFAFE" idle delay={0.7} />
      <g className="art-h-burst" style={{ '--d': '.12s' }}><Sparkle x={5.6} y={38.4} r={2.4} fill="#F0ABFC" /></g>
    </svg>
  );
};

/* ======================================================================
   Latín — Casco de centurión romano visto de frente: cúpula dorada,
   penacho rojo transversal en abanico, carrilleras y guardanuca.
   Hover: el casco cabecea y el penacho se agita; salta un destello.
   Reposo: titilan dos destellos del metal.
   ====================================================================== */
// Cerdas del penacho: radios desde (24, 22) entre 200° y 340°.
const CREST_LINES = Array.from({ length: 9 }, (_, i) => {
  const a = ((200 + i * 17.5) * Math.PI) / 180;
  return [f(24 + 10.6 * Math.cos(a)), f(22 + 10.6 * Math.sin(a)), f(24 + 16.4 * Math.cos(a)), f(22 + 16.4 * Math.sin(a))];
});
const CHEEK_L = 'M10.6 28.4 C13.4 29.2 16.4 29.6 19.4 29.8 C19.8 34 19.4 38 17.6 41.2 C15.6 43 12.6 42 11.8 39.6 C10.8 36.4 10.4 32.4 10.6 28.4 Z';
const CHEEK_R = 'M37.4 28.4 C34.6 29.2 31.6 29.6 28.6 29.8 C28.2 34 28.6 38 30.4 41.2 C32.4 43 35.4 42 36.2 39.6 C37.2 36.4 37.6 32.4 37.4 28.4 Z';
const BROW_RIVETS = [12.6, 18.2, 24, 29.8, 35.4].map((x) => [x, f(26.75 + 1.35 * (1 - ((x - 24) / 14.6) ** 2))]);

const Latin = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#CA8A04" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#422006" opacity={0.4} />
        <MaterialGradient id={id('gold')} light="#FEF9C3" base="#EAB308" dark="#854D0E" />
        <MaterialGradient id={id('goldDark')} light="#FDE68A" base="#CA8A04" dark="#713F12" />
        <MaterialGradient id={id('crest')} light="#FECACA" base="#DC2626" dark="#7F1D1D" />
        <linearGradient id={id('core')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#713F12" stopOpacity="0" />
          <stop offset="100%" stopColor="#713F12" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id('hollow')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C0A02" />
          <stop offset="100%" stopColor="#6B3A0C" />
        </linearGradient>
        <GlossGradient id={id('gloss')} opacity={0.85} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="24" cy="44.2" rx="14.5" ry="2.1" fill={url('shadow')} />

      <g className="art-h-tilt art-o-bottom" style={{ '--tilt': '-6deg' }}>
        {/* penacho transversal (detrás de la cúpula) */}
        <g className="art-h-wiggle art-o-bottom">
          <path d="M6.6 19.4 C6 9.6 14 3 24 3 C34 3 42 9.6 41.4 19.4 C38 16.4 32 14 24 14 C16 14 10 16.4 6.6 19.4 Z" fill={url('crest')} />
          <g stroke="#7F1D1D" strokeOpacity="0.5" strokeWidth="0.7" strokeLinecap="round">
            {CREST_LINES.map(([x1, y1, x2, y2]) => <line key={x1} x1={x1} y1={y1} x2={x2} y2={y2} />)}
          </g>
          <path d="M8.6 14.4 C11 8.4 16.8 5 24 4.6" stroke="#FECACA" strokeOpacity="0.8" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M33.6 6.4 C37.4 8.6 39.8 12 40.4 16.4" stroke="#450A0A" strokeOpacity="0.3" strokeWidth="1.1" strokeLinecap="round" />
        </g>

        {/* guardanuca (asoma a los lados) */}
        <path d="M10.6 28 C8.8 30.4 6.8 32.4 5.2 33.4 C4.6 34 5 35 6 34.8 L12.4 33.6 Z" fill={url('goldDark')} />
        <path d="M37.4 28 C39.2 30.4 41.2 32.4 42.8 33.4 C43.4 34 43 35 42 34.8 L35.6 33.6 Z" fill="#A16207" />

        {/* cúpula */}
        <path d="M10.6 27 C10.2 17.4 16.2 11.4 24 11.4 C31.8 11.4 37.8 17.4 37.4 27 Z" fill={url('gold')} />
        <path d="M30.4 12.8 C35.2 15 37.8 20 37.4 27 L33.6 27 C33.8 20.6 32.6 16 30.4 12.8 Z" fill={url('core')} />
        <path d="M11.9 24.4 C11.8 18.8 15 14.4 19.4 12.6" stroke="#fff" strokeOpacity="0.65" strokeWidth="0.8" strokeLinecap="round" />
        <ellipse cx="17.2" cy="17.4" rx="4.2" ry="1.9" transform="rotate(-38 17.2 17.4)" fill={url('gloss')} />
        {/* nervio central y soporte del penacho */}
        <path d="M24 12.6 V25.6" stroke="#854D0E" strokeOpacity="0.5" strokeWidth="1" strokeLinecap="round" />
        <path d="M23.4 13 V25" stroke="#FEF9C3" strokeOpacity="0.55" strokeWidth="0.4" strokeLinecap="round" />
        <rect x="21.6" y="9.4" width="4.8" height="3" rx="1" fill={url('goldDark')} />
        <rect x="22" y="9.7" width="1.9" height="0.8" rx="0.4" fill="#FEF9C3" opacity="0.85" />

        {/* hueco de la cara */}
        <path d="M17.6 28.6 C21.6 29.4 26.4 29.4 30.4 28.6 L30 40.4 C27.6 41.6 20.4 41.6 18 40.4 Z" fill={url('hollow')} />

        {/* carrilleras */}
        <path d={CHEEK_L} fill={url('gold')} />
        <path d={CHEEK_R} fill={url('goldDark')} />
        <path d="M30.6 30.6 C30.6 34.6 31.2 38 32.6 41.6 C34.4 42 35.6 41.2 36.2 39.6 C37.2 36.4 37.6 32.4 37.4 28.6 Z" fill={url('core')} />
        <path d="M11.7 30.4 C11.5 33.6 11.9 36.8 12.7 39.2" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" strokeLinecap="round" />
        {[[14.9, 35.4], [33.1, 35.4]].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="1.5" fill="#854D0E" opacity="0.55" />
            <circle cx={x - 0.2} cy={y - 0.2} r="1.25" fill={url('gold')} />
            <circle cx={x - 0.6} cy={y - 0.6} r="0.4" fill="#fff" opacity="0.9" />
          </g>
        ))}

        {/* banda de la frente con remaches */}
        <path d="M9.4 25 C16 26.8 32 26.8 38.6 25 L38.6 28.4 C32 30.2 16 30.2 9.4 28.4 Z" fill={url('goldDark')} />
        <path d="M10 25.3 C16.4 27 31.6 27 38 25.3" stroke="#FEF9C3" strokeOpacity="0.8" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M10 28.6 C16.4 30.3 31.6 30.3 38 28.6" stroke="#422006" strokeOpacity="0.35" strokeWidth="0.6" strokeLinecap="round" />
        {BROW_RIVETS.map(([x, y]) => <circle key={x} cx={x} cy={y} r="0.6" fill="#FEF9C3" />)}
      </g>

      <Sparkle x={15.4} y={16.4} r={2.2} idle delay={0.2} />
      <Sparkle x={43.2} y={24} r={1.8} fill="#FEF3C7" idle delay={1.4} />
      <g className="art-h-burst" style={{ '--d': '.15s' }}><Sparkle x={4.6} y={24.6} r={2.4} fill="#FDE68A" /></g>
    </svg>
  );
};

/* ======================================================================
   Economía — Gráfico de barras 3D esmeralda, flecha dorada al alza y
   moneda de euro.
   Hover: la flecha sube, la moneda salta y estalla un destello.
   Reposo: titila el brillo de la moneda.
   ====================================================================== */
const BARS = [
  { x: 16.6, top: 30.4 },
  { x: 24.4, top: 24.2 },
  { x: 32.2, top: 17.2 },
];
const BAR_W = 5.4;
const BAR_DX = 2.3;
const BAR_DY = 1.5;
const BAR_BASE = 40;
const ARROW_LINE = 'M7.4 24.6 L15.4 18.2 L21 21.6 L36.3 7.9';
const ARROW_HEAD = 'M40.4 4.4 L38.3 10.3 L34.3 5.8 Z';
const COIN = { cx: 11.6, cy: 34.4, r: 7.2 };

const Economia = () => {
  const [id, url] = useArtIds();
  const { cx, cy, r } = COIN;
  return (
    <svg className="art" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#059669" opacity={0.28} />
        <ShadowGradient id={id('shadow')} color="#022c22" opacity={0.38} />
        <linearGradient id={id('front')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id={id('arrow')} gradientUnits="userSpaceOnUse" x1="7" y1="25" x2="40" y2="4">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <MaterialGradient id={id('coin')} light="#FEF9C3" base="#FBBF24" dark="#B45309" />
        <GlossGradient id={id('gloss')} opacity={0.85} />
      </defs>

      <circle cx="24" cy="24" r="22" fill={url('aura')} />
      <ellipse cx="25" cy="42.8" rx="17" ry="2.2" fill={url('shadow')} />

      {/* barras 3D */}
      {BARS.map(({ x, top }) => (
        <g key={x}>
          <path d={`M${x + BAR_W} ${top} L${f(x + BAR_W + BAR_DX)} ${f(top - BAR_DY)} L${f(x + BAR_W + BAR_DX)} ${f(BAR_BASE - BAR_DY)} L${x + BAR_W} ${BAR_BASE} Z`} fill={url('side')} />
          <path d={`M${x} ${top} L${f(x + BAR_DX)} ${f(top - BAR_DY)} L${f(x + BAR_W + BAR_DX)} ${f(top - BAR_DY)} L${x + BAR_W} ${top} Z`} fill="#A7F3D0" />
          <rect x={x} y={top} width={BAR_W} height={BAR_BASE - top} fill={url('front')} />
          <rect x={x + 0.7} y={top + 0.8} width="1" height={BAR_BASE - top - 1.6} rx="0.5" fill="#fff" opacity="0.45" />
        </g>
      ))}
      {/* línea base */}
      <path d="M14.6 40.2 H42.4" stroke="#064E3B" strokeOpacity="0.45" strokeWidth="0.9" strokeLinecap="round" />

      {/* flecha al alza */}
      <g className="art-h-lift" style={{ '--lift': '-3px' }}>
        <g transform="translate(0.8 1)">
          <path d={ARROW_LINE} stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ARROW_HEAD} fill="#92400E" stroke="#92400E" strokeWidth="0.8" strokeLinejoin="round" />
        </g>
        <path d={ARROW_LINE} stroke={url('arrow')} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d={ARROW_HEAD} fill={url('arrow')} stroke={url('arrow')} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M8 23.6 L15.3 17.7 M21.4 20.6 L35.4 8.1" stroke="#FFFBEB" strokeOpacity="0.85" strokeWidth="0.6" strokeLinecap="round" />
      </g>

      {/* moneda de euro */}
      <g className="art-h-jump" style={{ '--jump': '-5px', '--d': '.08s' }}>
        <circle cx={cx + 0.9} cy={cy + 1.1} r={r} fill="#92400E" />
        <circle cx={cx} cy={cy} r={r} fill={url('coin')} />
        <circle cx={cx} cy={cy} r={r - 1.3} stroke="#B45309" strokeOpacity="0.55" strokeWidth="0.7" />
        <circle cx={cx} cy={cy} r={r - 0.4} stroke="#FEF9C3" strokeOpacity="0.6" strokeWidth="0.4" strokeDasharray="1 0.9" />
        <g stroke="#92400E" strokeLinecap="round">
          <path d={`M${cx + 2.4} ${cy - 2.6} A3.6 3.6 0 1 0 ${cx + 2.4} ${cy + 2.6}`} strokeWidth="1.3" />
          <path d={`M${cx - 3.6} ${cy - 0.8} H${cx + 0.8} M${cx - 3.6} ${cy + 0.9} H${cx + 0.4}`} strokeWidth="0.85" />
        </g>
        <ellipse cx={cx - 2.6} cy={cy - 3.6} rx="2.6" ry="1.1" transform={`rotate(-35 ${cx - 2.6} ${cy - 3.6})`} fill={url('gloss')} />
        <Sparkle x={cx - 3.8} y={cy - 4.2} r={2} idle delay={0.4} />
      </g>

      <g className="art-h-burst" style={{ '--d': '.18s' }}><Sparkle x={44.6} y={14} r={2.4} fill="#FDE68A" /></g>
    </svg>
  );
};

const ICONS = {
  biologia: Biologia,
  fisica: Fisica,
  musica: Musica,
  plastica: Plastica,
  tecnologia: Tecnologia,
  'ed-fisica': EdFisica,
  robotica: Robotica,
  ia: IA,
  latin: Latin,
  economia: Economia,
};

export default ICONS;
