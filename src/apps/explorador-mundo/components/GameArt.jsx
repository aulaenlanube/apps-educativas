// Ilustraciones de las tarjetas de minijuego (120 × 84). Volumen con degradados,
// sombras de contacto y brillos; sin filtros SVG (guía de src/components/art).
import React, { useId } from 'react';

function useIds() {
  const base = useId().replace(/:/g, '');
  return (name) => `${base}-${name}`;
}

const Shadow = ({ id, cx, cy, rx, ry }) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />;

const ShadowDef = ({ id }) => (
  <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor="#0f172a" stopOpacity="0.38" />
    <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
  </radialGradient>
);

/* ¿Dónde está? — mapa plegado con chincheta */
function Donde() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('sea')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0369a1" /></linearGradient>
        <linearGradient id={id('sea2')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#075985" /></linearGradient>
        <linearGradient id={id('land')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bbf7d0" /><stop offset="1" stopColor="#22c55e" /></linearGradient>
        <radialGradient id={id('pin')} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fda4af" /><stop offset="0.5" stopColor="#f43f5e" /><stop offset="1" stopColor="#9f1239" /></radialGradient>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={60} cy={74} rx={46} ry={6} />
      <path d="M14 18 L42 12 L74 18 L106 12 V66 L74 72 L42 66 L14 72 Z" fill={`url(#${id('sea')})`} />
      <path d="M42 12 L74 18 V72 L42 66 Z" fill={`url(#${id('sea2')})`} />
      <path d="M20 30 q6 -8 14 -4 q6 4 2 10 q-4 6 -10 4 q-8 -2 -6 -10Z M50 24 q8 -4 14 2 q4 6 -2 12 q-6 4 -12 -2 q-4 -6 0 -12Z M80 40 q8 -6 16 0 q4 8 -4 14 q-8 4 -12 -2 q-4 -6 0 -12Z M28 50 q6 -2 8 4 q0 6 -6 6 q-6 -2 -2 -10Z" fill={`url(#${id('land')})`} />
      <path d="M14 18 L42 12 L74 18 L106 12" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.2" fill="none" />
      <path d="M57 30 v14" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="57" cy="45" rx="5" ry="1.8" fill="#0f172a" opacity="0.3" />
      <circle cx="57" cy="24" r="9" fill={`url(#${id('pin')})`} />
      <circle cx="54" cy="21" r="2.6" fill="#fff" opacity="0.75" />
    </svg>
  );
}

/* Siluetas — pantalla de radar con una bota punteada y signo de interrogación */
function Siluetas() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('scr')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e1b4b" /><stop offset="1" stopColor="#0b0a24" /></linearGradient>
        <linearGradient id={id('shape')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a7f3d0" /><stop offset="0.6" stopColor="#10b981" /><stop offset="1" stopColor="#047857" /></linearGradient>
        <radialGradient id={id('q')} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fef3c7" /><stop offset="0.55" stopColor="#fbbf24" /><stop offset="1" stopColor="#b45309" /></radialGradient>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={60} cy={76} rx={44} ry={5} />
      <rect x="16" y="8" width="88" height="64" rx="12" fill={`url(#${id('scr')})`} />
      <path d="M16 30H104M16 50H104M38 8V72M60 8V72M82 8V72" stroke="#67e8f9" strokeOpacity="0.14" strokeWidth="0.8" />
      <path d="M44 16 l14 6 l6 10 l10 8 l6 12 l-4 6 l-6 -6 l-8 -2 l-6 -10 l-10 -6 l-4 -10 Z" fill={`url(#${id('shape')})`} transform="translate(-4 2)" />
      <path d="M44 16 l14 6 l6 10 l10 8 l6 12 l-4 6 l-6 -6 l-8 -2 l-6 -10 l-10 -6 l-4 -10 Z" fill="none" stroke="#a7f3d0" strokeWidth="1.2" strokeDasharray="3 2.4" transform="translate(6 6)" opacity="0.7" />
      <rect x="16.5" y="8.5" width="87" height="63" rx="11.5" fill="none" stroke="#a5b4fc" strokeOpacity="0.45" />
      <circle cx="92" cy="58" r="11" fill={`url(#${id('q')})`} />
      <text x="92" y="63" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="700" fontSize="14" fill="#78350f">?</text>
    </svg>
  );
}

/* Banderas — mástil con bandera ondeando (colores de la plataforma) */
function Banderas() {
  const id = useIds();
  const wave = (y) => `M40 ${y} q12 -6 24 0 t24 0 t20 0`;
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('pole')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e2e8f0" /><stop offset="0.5" stopColor="#94a3b8" /><stop offset="1" stopColor="#475569" /></linearGradient>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.45" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id={id('knob')} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#d97706" /></radialGradient>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={36} cy={77} rx={18} ry={4} />
      <rect x="32" y="8" width="5" height="68" rx="2.5" fill={`url(#${id('pole')})`} />
      <circle cx="34.5" cy="8" r="4" fill={`url(#${id('knob')})`} />
      <path d={`${wave(14)} V30 q-10 -6 -20 0 t-24 0 t-24 0 Z`} fill="#8b5cf6" />
      <path d={`${wave(30)} V46 q-10 -6 -20 0 t-24 0 t-24 0 Z`} fill="#ec4899" />
      <path d={`${wave(46)} V62 q-10 -6 -20 0 t-24 0 t-24 0 Z`} fill="#fbbf24" />
      <path d={`${wave(14)} V30 q-10 -6 -20 0 t-24 0 t-24 0 Z`} fill={`url(#${id('gloss')})`} />
      <path d="M64 14 q0 24 0 48 M88 14 q0 24 0 48" stroke="#0f172a" strokeOpacity="0.12" strokeWidth="6" />
    </svg>
  );
}

/* Continentes y océanos — globo con anillo orbital */
function Continentes() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <radialGradient id={id('sea')} cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#7dd3fc" /><stop offset="0.6" stopColor="#0284c7" /><stop offset="1" stopColor="#0c4a6e" /></radialGradient>
        <linearGradient id={id('land')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        <linearGradient id={id('land2')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bbf7d0" /><stop offset="1" stopColor="#16a34a" /></linearGradient>
        <radialGradient id={id('hi')} cx="0.3" cy="0.25" r="0.5"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <clipPath id={id('clip')}><circle cx="60" cy="40" r="28" /></clipPath>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={60} cy={77} rx={30} ry={4.5} />
      <ellipse cx="60" cy="40" rx="46" ry="12" fill="none" stroke="#c4b5fd" strokeWidth="2.4" opacity="0.55" transform="rotate(-14 60 40)" />
      <circle cx="60" cy="40" r="28" fill={`url(#${id('sea')})`} />
      <g clipPath={`url(#${id('clip')})`}>
        <path d="M34 26 q10 -8 20 -2 q6 6 0 12 q-8 6 -4 14 q2 8 -8 8 q-10 -4 -12 -16 q-2 -10 4 -16Z" fill={`url(#${id('land2')})`} />
        <path d="M62 18 q12 -4 20 4 q6 8 -2 14 q-8 4 -6 12 q2 10 -6 12 q-8 0 -8 -12 q0 -10 -4 -16 q-2 -10 6 -14Z" fill={`url(#${id('land')})`} />
        <path d="M32 40 H88 M60 12 V68" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.8" />
      </g>
      <circle cx="60" cy="40" r="28" fill={`url(#${id('hi')})`} />
      <circle cx="100" cy="22" r="3" fill="#fde68a" />
      <circle cx="18" cy="56" r="2" fill="#f9a8d4" />
    </svg>
  );
}

/* Capitales — edificio neoclásico con estrella */
function Capitales() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('stone')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f8fafc" /><stop offset="0.6" stopColor="#cbd5e1" /><stop offset="1" stopColor="#64748b" /></linearGradient>
        <linearGradient id={id('roof')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7d2fe" /><stop offset="1" stopColor="#6366f1" /></linearGradient>
        <radialGradient id={id('star')} cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#fef9c3" /><stop offset="0.6" stopColor="#fbbf24" /><stop offset="1" stopColor="#b45309" /></radialGradient>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={60} cy={76} rx={42} ry={5} />
      <rect x="22" y="66" width="76" height="8" rx="2" fill={`url(#${id('stone')})`} />
      <rect x="28" y="60" width="64" height="7" rx="1.5" fill={`url(#${id('stone')})`} />
      {[34, 46, 58, 70, 82].map((x) => (
        <g key={x}>
          <rect x={x} y="36" width="6" height="24" rx="1.5" fill={`url(#${id('stone')})`} />
          <rect x={x + 1} y="37" width="1.4" height="22" rx="0.7" fill="#fff" opacity="0.7" />
        </g>
      ))}
      <rect x="28" y="31" width="64" height="6" rx="1.5" fill={`url(#${id('stone')})`} />
      <path d="M26 31 L60 12 L94 31 Z" fill={`url(#${id('roof')})`} />
      <path d="M26 31 L60 12" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M60 2 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8Z" fill={`url(#${id('star')})`} transform="translate(9 6.3) scale(0.85)" />
    </svg>
  );
}

/* Grandes ciudades — perfil de rascacielos al atardecer */
function Ciudades() {
  const id = useIds();
  const towers = [
    [18, 44, 12], [32, 26, 14], [48, 36, 10], [60, 14, 14], [76, 32, 12], [90, 22, 14], [104, 46, 8],
  ];
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4b5fd" /><stop offset="0.6" stopColor="#f9a8d4" /><stop offset="1" stopColor="#fed7aa" /></linearGradient>
        <linearGradient id={id('tw')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6366f1" /><stop offset="0.5" stopColor="#4338ca" /><stop offset="1" stopColor="#312e81" /></linearGradient>
        <radialGradient id={id('sun')} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fef3c7" /><stop offset="1" stopColor="#fbbf24" /></radialGradient>
        <clipPath id={id('clip')}><rect x="10" y="6" width="100" height="68" rx="12" /></clipPath>
      </defs>
      <g clipPath={`url(#${id('clip')})`}>
        <rect x="10" y="6" width="100" height="68" fill={`url(#${id('sky')})`} />
        <circle cx="84" cy="30" r="12" fill={`url(#${id('sun')})`} />
        {towers.map(([x, top, w]) => (
          <g key={x}>
            <rect x={x - w / 2} y={top} width={w} height={80 - top} fill={`url(#${id('tw')})`} />
            <rect x={x - w / 2} y={top} width={2} height={80 - top} fill="#a5b4fc" opacity="0.6" />
            {Array.from({ length: Math.floor((70 - top) / 7) }).map((_, i) => (
              <rect key={i} x={x - w / 2 + 3.5} y={top + 4 + i * 7} width={w - 7} height="2.2" rx="0.6" fill="#fde68a" opacity={i % 3 === 1 ? 0.35 : 0.85} />
            ))}
          </g>
        ))}
        <path d="M60 14 v-8" stroke="#312e81" strokeWidth="1.6" />
        <circle cx="60" cy="6" r="1.8" fill="#f472b6" />
      </g>
      <rect x="10.5" y="6.5" width="99" height="67" rx="11.5" fill="none" stroke="#fff" strokeOpacity="0.55" />
    </svg>
  );
}

/* Fronteras — dos países encajados con la frontera brillante */
function Vecinos() {
  const id = useIds();
  const left = 'M18 20 q14 -10 30 -4 l10 4 q-6 8 2 14 q8 6 0 14 q-6 8 -2 16 l-12 6 q-14 2 -24 -8 q-8 -14 -6 -26 q-2 -10 2 -16Z';
  const right = 'M58 20 q20 -8 36 2 q12 10 8 24 q-2 16 -14 22 q-14 6 -32 -2 q-4 -8 2 -16 q8 -8 0 -14 q-8 -6 0 -16Z';
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('a')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        <linearGradient id={id('b')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c7d2fe" /><stop offset="1" stopColor="#6366f1" /></linearGradient>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={60} cy={77} rx={44} ry={5} />
      <path d={left} fill={`url(#${id('a')})`} />
      <path d={right} fill={`url(#${id('b')})`} />
      <path d="M58 16 q-6 8 2 14 q8 6 0 14 q-6 8 -2 16 l0 8" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <path d="M58 16 q-6 8 2 14 q8 6 0 14 q-6 8 -2 16 l0 8" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 3" />
      <circle cx="34" cy="42" r="3" fill="#b45309" />
      <circle cx="82" cy="40" r="3" fill="#3730a3" />
    </svg>
  );
}

/* Relieve — montañas nevadas, un río que baja serpenteando y el mar */
function Relieve() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0f2fe" /><stop offset="1" stopColor="#bae6fd" /></linearGradient>
        <linearGradient id={id('mt')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d6b48a" /><stop offset="0.55" stopColor="#a16207" /><stop offset="1" stopColor="#713f12" /></linearGradient>
        <linearGradient id={id('mt2')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4a17a" /><stop offset="1" stopColor="#854d0e" /></linearGradient>
        <linearGradient id={id('grass')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86efac" /><stop offset="1" stopColor="#16a34a" /></linearGradient>
        <linearGradient id={id('river')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" /></linearGradient>
        <clipPath id={id('clip')}><rect x="10" y="6" width="100" height="68" rx="12" /></clipPath>
      </defs>
      <g clipPath={`url(#${id('clip')})`}>
        <rect x="10" y="6" width="100" height="68" fill={`url(#${id('sky')})`} />
        <path d="M6 58 L34 22 L50 40 L70 14 L100 52 L116 46 V80 H6 Z" fill={`url(#${id('mt')})`} />
        <path d="M70 14 L100 52 L86 50 Z M34 22 L50 40 L42 40 Z" fill="#451a03" opacity="0.25" />
        <path d="M34 22 L28 30 L32 29 L35 33 L39 28 Z M70 14 L62 25 L67 23 L71 28 L76 22 Z" fill="#fff" />
        <path d="M50 50 L78 30 L112 62 V80 H40 Z" fill={`url(#${id('mt2')})`} opacity="0.9" />
        <path d="M6 64 Q40 56 60 62 T116 60 V80 H6 Z" fill={`url(#${id('grass')})`} />
        <path d="M70 26 q-6 10 2 16 q8 6 -4 14 q-10 8 2 14 q8 4 4 14" fill="none" stroke={`url(#${id('river')})`} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M70 26 q-6 10 2 16 q8 6 -4 14 q-10 8 2 14 q8 4 4 14" fill="none" stroke="#e0f2fe" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      </g>
      <rect x="10.5" y="6.5" width="99" height="67" rx="11.5" fill="none" stroke="#fff" strokeOpacity="0.55" />
    </svg>
  );
}

/* Examen mixto — birrete sobre el globo */
function Examen() {
  const id = useIds();
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <defs>
        <radialGradient id={id('sea')} cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0c4a6e" /></radialGradient>
        <linearGradient id={id('cap')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4c1d95" /><stop offset="1" stopColor="#1e1b4b" /></linearGradient>
        <ShadowDef id={id('sh')} />
      </defs>
      <Shadow id={id('sh')} cx={60} cy={78} rx={28} ry={4} />
      <circle cx="60" cy="50" r="24" fill={`url(#${id('sea')})`} />
      <path d="M44 40 q8 -6 14 0 q4 6 -2 10 q-6 4 -2 10 q0 6 -8 4 q-6 -6 -6 -14Z M64 34 q10 -2 14 6 q2 8 -6 10 q-6 2 -4 10 q-2 6 -8 2 q-2 -8 0 -14 q-2 -10 4 -14Z" fill="#86efac" />
      <path d="M60 14 L92 26 L60 38 L28 26 Z" fill={`url(#${id('cap')})`} />
      <path d="M42 31 v9 q18 8 36 0 v-9 l-18 7Z" fill="#312e81" />
      <path d="M92 26 v16" stroke="#fbbf24" strokeWidth="1.6" />
      <circle cx="92" cy="44" r="3" fill="#fbbf24" />
    </svg>
  );
}

const ART = { donde: Donde, siluetas: Siluetas, banderas: Banderas, continentes: Continentes, capitales: Capitales, ciudades: Ciudades, vecinos: Vecinos, relieve: Relieve, exam: Examen, atlas: Continentes };

export default function GameArt({ game }) {
  const Art = ART[game] || Continentes;
  return <Art />;
}
