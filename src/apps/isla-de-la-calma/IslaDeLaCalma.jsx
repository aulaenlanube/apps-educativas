// src/apps/isla-de-la-calma/IslaDeLaCalma.jsx
// Isla de la Calma — respiración guiada (rediseño 2026 sobre el kit _shared/kit).
// Sin modos, sin nota y sin tracking (CLAUDE.md §3): solo una pausa para respirar.
//
// La lógica NO cambia: 2,5 s de «Prepárate...» y, en cada ciclo, Inhala / Sostén /
// Exhala / Mantén cada 4 s (escala 1,5 / 1,5 / 1 / 1). Todo lo visual (escena
// nocturna, orbe, anillo que barre cada fase, puntos de ciclo) se deriva de ese
// estado, sin temporizadores propios: el anillo es una animación CSS que se
// reinicia al cambiar su `key`.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Minus, Plus, Volume2, VolumeX, Wind, Clock } from 'lucide-react';
import { GameShell, GameHeader, GameButton, Chip } from '../_shared/kit';
import useArtIds from '@/components/art/useArtIds';
import { GlowGradient, MaterialGradient, ShadowGradient, Sparkle } from '@/components/art/primitives';
import '@/styles/art.css';
import './IslaDeLaCalma.css';

/* ── Fases ───────────────────────────────────────────────────── */

// Texto de la instrucción → tono visual. Las claves son los textos exactos de la
// secuencia de respiración del efecto: si cambian allí, hay que cambiarlos aquí.
const PHASE_TONE = {
  'Prepárate...': 'prep',
  'Inhala...': 'inhale',
  'Sostén...': 'hold',
  'Exhala...': 'exhale',
  'Mantén...': 'rest',
};
const PHASE_HINT = {
  prep: 'Ponte cómodo y relaja los hombros',
  inhale: 'Llena de aire tu barriga, despacio',
  hold: 'Guarda el aire un momento',
  exhale: 'Suelta el aire poco a poco',
  rest: 'Quédate tranquilo antes de volver a empezar',
};
const PHASES = [
  { tone: 'inhale', label: 'Inhala' },
  { tone: 'hold', label: 'Sostén' },
  { tone: 'exhale', label: 'Exhala' },
  { tone: 'rest', label: 'Mantén' },
];
const TONES = ['prep', 'inhale', 'hold', 'exhale', 'rest'];
const MAX_CICLOS = 15;
const SEG_POR_CICLO = 16; // 4 fases × 4 s

const formatDuration = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (!m) return `${r} s`;
  return r ? `${m} min ${r} s` : `${m} min`;
};

/* ── Escena nocturna ─────────────────────────────────────────── */

// Estrellas fijas: posiciones pseudoaleatorias deterministas (no cambian entre renders).
const STARS = (() => {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    x: +(rnd() * 100).toFixed(2),
    y: +(2 + rnd() * 50).toFixed(2),
    s: +(1 + rnd() * 1.8).toFixed(2),
    d: +(rnd() * 6).toFixed(2),
    big: rnd() > 0.84,
  }));
})();

// Ola periódica (2 periodos de 600 u.) para poder desplazarla un 50 % en bucle.
const WAVE_CREST = 'M0 40 C100 18 200 18 300 40 S500 62 600 40 S800 18 900 40 S1100 62 1200 40';
const WAVE_FILL = `${WAVE_CREST} V100 H0 Z`;

const SeaWaves = () => {
  const [id, url] = useArtIds();
  const bands = [
    { top: '#2a5f86', bottom: '#123553', a: 0.55 },
    { top: '#1f5677', bottom: '#0d2a44', a: 0.8 },
    { top: '#1a4c69', bottom: '#081d31', a: 0.96 },
  ];
  return (
    <div className="cal-waves">
      {bands.map((b, i) => (
        <div key={i} className={`cal-wave cal-wave--${i}`}>
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id={id(`w${i}`)} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={b.top} stopOpacity={b.a} />
                <stop offset="1" stopColor={b.bottom} stopOpacity={b.a} />
              </linearGradient>
            </defs>
            <path d={WAVE_FILL} fill={url(`w${i}`)} />
            <path d={WAVE_CREST} fill="none" stroke="#a5f3fc" strokeOpacity={0.16 + i * 0.07} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      ))}
    </div>
  );
};

// Luna con halo, cráteres, sombra propia y brillo (luz desde arriba a la izquierda).
const MoonArt = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('halo')} color="#c7d2fe" opacity={0.4} mid={0.28} />
        <GlowGradient id={id('halo2')} color="#eef2ff" opacity={0.55} mid={0.42} />
        <radialGradient id={id('disc')} cx="0.36" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#fffef6" />
          <stop offset="0.45" stopColor="#f4efdb" />
          <stop offset="0.82" stopColor="#d8d1ee" />
          <stop offset="1" stopColor="#b3abdc" />
        </radialGradient>
        <radialGradient id={id('shade')} cx="0.82" cy="0.84" r="0.85">
          <stop offset="0" stopColor="#3f3480" stopOpacity="0.45" />
          <stop offset="0.6" stopColor="#3f3480" stopOpacity="0.12" />
          <stop offset="1" stopColor="#3f3480" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('clip')}><circle cx="100" cy="100" r="30" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="100" fill={url('halo')} />
      <circle cx="100" cy="100" r="54" fill={url('halo2')} />
      <circle cx="100" cy="100" r="30" fill={url('disc')} />
      <g clipPath={url('clip')}>
        {[[90, 94, 5.4], [111, 108, 7], [95, 117, 3.6], [113, 87, 3.2], [80, 108, 2.6]].map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill="#cbc3e4" opacity="0.75" />
            <path d={`M${x - r * 0.7} ${y + r * 0.7}A${r} ${r} 0 0 0 ${x + r * 0.7} ${y - r * 0.7}`} stroke="#fff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
          </g>
        ))}
        <circle cx="100" cy="100" r="30" fill={url('shade')} />
      </g>
      <path d="M75.5 90A27 27 0 0 1 95 73.4" stroke="#fff" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="88" cy="84" rx="8" ry="4.4" transform="rotate(-32 88 84)" fill="#fff" opacity="0.5" />
      <Sparkle x={150} y={52} r={4} fill="#eef2ff" opacity={0.85} idle delay={0.6} dur={4.4} />
    </svg>
  );
};

// Islotes lejanos en el horizonte (profundidad).
const FarIslets = () => (
  <svg className="cal-far" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 40V30C40 24 70 14 104 16C136 18 150 30 176 32C200 34 214 26 236 27C262 28 270 36 300 37L400 40Z" fill="#14254d" />
    <path d="M70 16.5C88 14 106 14.5 122 18" stroke="#a5b4fc" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>
);

// Frondas de palmera (copa en 151,88): [control alto 1, control alto 2, punta,
// control bajo cerca de la copa, control bajo cerca de la punta].
const FRONDS = [
  [[128, 98], [108, 120], [104, 150], [134, 104], [118, 122]],
  [[168, 102], [180, 124], [180, 150], [162, 108], [172, 126]],
  [[188, 88], [222, 102], [238, 136], [184, 98], [212, 110]],
  [[120, 72], [84, 80], [58, 112], [122, 92], [90, 94]],
  [[180, 62], [218, 60], [246, 76], [182, 80], [214, 76]],
  [[130, 58], [98, 44], [70, 48], [128, 72], [102, 58]],
  [[152, 56], [170, 34], [196, 26], [166, 64], [180, 46]],
];
const CROWN = [151, 88];
const avg = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const pt = (p) => `${p[0]} ${p[1]}`;
const frondPath = ([u1, u2, tip, l1, l2]) => `M${pt(CROWN)}C${pt(u1)} ${pt(u2)} ${pt(tip)}C${pt(l2)} ${pt(l1)} ${pt(CROWN)}Z`;
const midribPath = ([u1, u2, tip, l1, l2]) => `M${pt(CROWN)}C${pt(avg(u1, l1))} ${pt(avg(u2, l2))} ${pt(tip)}`;
const foldPath = ([u1, u2, tip, l1, l2]) => `M${pt(CROWN)}C${pt(avg(u1, l1))} ${pt(avg(u2, l2))} ${pt(tip)}C${pt(l2)} ${pt(l1)} ${pt(CROWN)}Z`;

const starPath = (cx, cy, R, r) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
};

const TRUNK_RINGS = [
  'M192.5 210Q200.5 213.5 208.8 210', 'M188.6 195.3Q197 199 205.2 194.3', 'M184.7 181Q192.8 184.5 200.5 179.7',
  'M180.2 167Q188 170.5 195.2 165.5', 'M175.3 153.3Q182.5 156.6 189.3 151.5', 'M169.7 139.7Q176.5 142.8 183 137.8',
  'M164 126.6Q170.4 129.4 176.3 124.7', 'M158.1 114Q164 116.6 169.6 112', 'M152 101.7Q157.4 104 162.7 99.7',
];

const Fronds = ({ leaf, rim }) => (
  <>
    {FRONDS.map((f, i) => (
      <g key={i}>
        <path d={frondPath(f)} fill={leaf} />
        <path d={foldPath(f)} fill="#06262b" opacity="0.32" />
        <path d={midribPath(f)} stroke="#ccfbf1" strokeOpacity={rim ? 0.5 : 0.18} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    ))}
  </>
);

// Isla con palmera a la luz de la luna (volumen: degradado, sombra propia, borde de luz).
const IslandArt = () => {
  const [id, url] = useArtIds();
  return (
    <svg className="art" viewBox="0 0 400 320" fill="none" aria-hidden="true">
      <defs>
        <MaterialGradient id={id('sand')} light="#fbecc8" base="#d6ad78" dark="#7a4f48" />
        <linearGradient id={id('sandShade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a1240" stopOpacity="0" />
          <stop offset="1" stopColor="#2a1240" stopOpacity="0.5" />
        </linearGradient>
        <MaterialGradient id={id('trunk')} light="#f1d2a4" base="#a46a44" dark="#4a2a26" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('trunkBack')} light="#6f5670" base="#46344f" dark="#251a35" x1={0} y1={0.5} x2={1} y2={0.5} />
        <MaterialGradient id={id('leaf')} light="#a7f3d0" base="#109486" dark="#0b3b40" />
        <MaterialGradient id={id('leafBack')} light="#3b8f95" base="#1d5f6c" dark="#0e3044" />
        <MaterialGradient id={id('rock')} light="#cfd7f6" base="#6b7aa6" dark="#262f55" />
        <radialGradient id={id('coco')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#c99467" />
          <stop offset="0.6" stopColor="#6b3f2a" />
          <stop offset="1" stopColor="#35190f" />
        </radialGradient>
        <ShadowGradient id={id('contact')} color="#020617" opacity={0.6} />
        <GlowGradient id={id('ripple')} color="#5eead4" opacity={0.2} />
        <linearGradient id={id('reflect')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a3f" stopOpacity="0.75" />
          <stop offset="1" stopColor="#0b2a40" stopOpacity="0" />
        </linearGradient>
        <GlowGradient id={id('fly')} color="#fef08a" opacity={0.9} mid={0.22} />
        <MaterialGradient id={id('star')} light="#fecdd3" base="#fb7185" dark="#be123c" />
      </defs>

      {/* agua: luz y sombra de contacto */}
      <ellipse cx="200" cy="286" rx="198" ry="30" fill={url('ripple')} />
      <ellipse cx="204" cy="285" rx="172" ry="13" fill={url('contact')} />
      <path d="M48 285C96 301 150 312 205 312C262 312 314 300 356 285Z" fill={url('reflect')} />
      <path d="M150 296H192M214 300H252M176 306H226" stroke="#a5f3fc" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="204" cy="290" rx="188" ry="16" stroke="#99f6e4" strokeOpacity="0.16" strokeWidth="1.4" />

      {/* palmera del fondo (más oscura, para dar profundidad) */}
      <path d="M254 230C260 196 272 160 287 131L296 133C283 162 273 198 269 230Z" fill={url('trunkBack')} />
      <g transform="translate(292 131) scale(-0.62 0.62) translate(-151 -88)">
        <Fronds leaf={url('leafBack')} />
      </g>

      {/* arena */}
      <path d="M40 285C62 246 120 220 200 216C284 214 338 244 362 285Z" fill={url('sand')} />
      <path d="M262 220C316 232 348 256 362 285L272 285C286 262 282 238 262 220Z" fill={url('sandShade')} />
      <path d="M44 281C120 289 290 289 358 281L362 285C290 293 120 293 40 285Z" fill="#6b4a4f" opacity="0.55" />
      <path d="M58 279C84 246 132 223 196 219" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M42 285.5C120 294 290 294 360 285.5" stroke="#ccfbf1" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />

      {/* rocas */}
      <path d="M68 286C64 271 75 258 92 258C107 258 117 269 114 286Z" fill={url('rock')} />
      <path d="M75 272C77 265 83 261 90 260.5" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M108 287C108 277 114 271.5 122 271.5C130 271.5 135.5 278 134 287Z" fill={url('rock')} />
      <path d="M112.5 279C113.5 275 117 273 120.5 273" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />

      {/* hierba y estrella de mar */}
      <g stroke="#2dd4bf" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.9">
        <path d="M140 226q-6-14-14-18M140 226q0-16 4-22M140 226q6-12 14-14" />
        <path d="M262 224q-5-12-12-15M262 224q2-14 7-19M262 224q7-9 15-10" />
      </g>
      <g stroke="#0f766e" strokeWidth="2" strokeLinecap="round">
        <path d="M134 228q-4-9-10-11M268 226q5-7 11-8" />
      </g>
      <path d={starPath(304, 262, 9, 3.8)} fill={url('star')} transform="rotate(14 304 262)" />
      <circle cx="301.5" cy="259" r="1.6" fill="#fff" opacity="0.7" />

      {/* palmera principal: se mece solo con efectos altos */}
      <g className="art-i-sway art-o-bottom" style={{ '--amp': '1.4deg', '--dur': '7s' }}>
        <path d="M194 224C188 176 166 128 146 90L156 88C178 126 204 174 212 224Z" fill={url('trunk')} />
        <path d="M156 88C178 126 204 174 212 224L205 224C198 176 173 128 152 90Z" fill="#2a1530" opacity="0.32" />
        {TRUNK_RINGS.map((d) => <path key={d} d={d} stroke="#3b2230" strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />)}
        <path d="M196.5 222C190.5 176 169 129 149.5 92" stroke="#fde7c8" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
        <Fronds leaf={url('leaf')} rim />
        <circle cx="145" cy="96" r="5.6" fill={url('coco')} />
        <circle cx="157" cy="97" r="5.6" fill={url('coco')} />
        <circle cx="151" cy="103.5" r="5.6" fill={url('coco')} />
        <circle cx="143.4" cy="94.2" r="1.5" fill="#fff" opacity="0.5" />
        <circle cx="155.4" cy="95.2" r="1.5" fill="#fff" opacity="0.5" />
      </g>

      {/* luciérnagas */}
      {[[96, 168, 0], [250, 176, 1.4], [116, 132, 2.6], [282, 210, 0.8]].map(([x, y, d]) => (
        <g key={`${x}-${y}`} className="art-i-twinkle" style={{ '--d': `${d}s`, '--dur': '3.6s' }}>
          <circle cx={x} cy={y} r="8" fill={url('fly')} />
          <circle cx={x} cy={y} r="1.7" fill="#fefce8" />
        </g>
      ))}
    </svg>
  );
};

const NightScene = ({ pantalla }) => (
  <div className={`cal-scene cal-scene--${pantalla}`} aria-hidden="true">
    <div className="cal-stars">
      {STARS.map((s) => (
        <i
          key={s.id}
          className={s.big ? 'is-big' : undefined}
          style={{ left: `${s.x}%`, top: `${s.y}%`, '--s': `${s.s}px`, '--d': `${s.d}s` }}
        />
      ))}
    </div>
    <span className="cal-shooting" />
    <div className="cal-moon"><MoonArt /></div>
    <FarIslets />
    <div className="cal-horizon" />
    <div className="cal-shine">
      {[26, 40, 30, 58, 44, 74, 52, 92, 64].map((w, i) => (
        <i key={i} style={{ width: w, '--i': i }} />
      ))}
    </div>
    <div className="cal-isle"><IslandArt /></div>
    <SeaWaves />
  </div>
);

/* ── Final: flor de loto sobre el agua ───────────────────────── */

const PETAL = 'M0 0C-17-16-16-50 0-70C16-50 17-16 0 0Z';
const PETAL_MID = 'M0-6C-2-28-2-46 0-62';
const PETAL_RIM = 'M-4-8C-14-22-13-46-1.5-64';

const LotusArt = () => {
  const [id, url] = useArtIds();
  const petal = (key, rot, scale, fill) => (
    <g key={key} transform={`translate(120 150) rotate(${rot}) scale(${scale})`}>
      <path d={PETAL} fill={fill} />
      <path d={PETAL_MID} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
      <path d={PETAL_RIM} stroke="#fff" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
  return (
    <svg className="art" viewBox="0 0 240 210" fill="none" aria-hidden="true">
      <defs>
        <GlowGradient id={id('aura')} color="#c4b5fd" opacity={0.5} mid={0.3} />
        <GlowGradient id={id('heartGlow')} color="#fde68a" opacity={0.85} mid={0.25} />
        <MaterialGradient id={id('back')} light="#fae8ff" base="#e879f9" dark="#7e22ce" />
        <MaterialGradient id={id('mid')} light="#fdf4ff" base="#f0abfc" dark="#a855f7" />
        <MaterialGradient id={id('front')} light="#ffffff" base="#f5d0fe" dark="#c084fc" />
        <MaterialGradient id={id('pad')} light="#99f6e4" base="#0f9b8e" dark="#0b3b40" />
        <radialGradient id={id('heart')} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#fefce8" />
          <stop offset="0.5" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#b45309" />
        </radialGradient>
        <GlowGradient id={id('reflect')} color="#f0abfc" opacity={0.35} />
      </defs>
      <circle cx="120" cy="108" r="104" fill={url('aura')} />
      <ellipse className="cal-ripple" cx="120" cy="162" rx="112" ry="24" stroke="#99f6e4" strokeOpacity="0.22" strokeWidth="1.6" />
      <ellipse className="cal-ripple cal-ripple--2" cx="120" cy="162" rx="80" ry="17" stroke="#99f6e4" strokeOpacity="0.32" strokeWidth="1.6" />
      <ellipse cx="120" cy="174" rx="54" ry="10" fill={url('reflect')} />

      {/* hojas de nenúfar */}
      <path d="M30 166C30 154 56 147 84 151L72 161L90 167C78 177 34 179 30 166Z" fill={url('pad')} />
      <path d="M36 160C46 154 62 151 78 152" stroke="#ccfbf1" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M210 170C210 158 184 151 156 155L168 165L150 171C162 181 206 183 210 170Z" fill={url('pad')} />
      <path d="M200 162C190 157 176 155 164 156" stroke="#ccfbf1" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />

      {/* loto: fila de atrás, media y delantera */}
      <g className="art-i-bob" style={{ '--dur': '6s', '--amp': '-3px' }}>
        {[-72, -40, 40, 72].map((r) => petal(`b${r}`, r, 0.86, url('back')))}
        {[-20, 20].map((r) => petal(`m${r}`, r, 1, url('mid')))}
        <circle cx="120" cy="140" r="26" fill={url('heartGlow')} />
        <circle cx="120" cy="141" r="8.5" fill={url('heart')} />
        {[[-9, -6], [-4, -11], [4, -11], [9, -6], [0, -13]].map(([dx, dy]) => (
          <circle key={`${dx}${dy}`} cx={120 + dx} cy={141 + dy} r="1.7" fill="#fef3c7" />
        ))}
        {[-50, 50].map((r) => petal(`f${r}`, r, 0.74, url('front')))}
        {petal('c', 0, 0.82, url('front'))}
      </g>

      <Sparkle x={48} y={62} r={6} fill="#fef3c7" idle />
      <Sparkle x={192} y={48} r={5} fill="#e0e7ff" idle delay={1.1} />
      <Sparkle x={206} y={112} r={3.6} idle delay={2} />
      <Sparkle x={34} y={118} r={3} fill="#ccfbf1" idle delay={0.5} />
    </svg>
  );
};

/* ── Piezas ──────────────────────────────────────────────────── */

const SoundToggle = ({ on, onToggle }) => (
  <button
    type="button"
    className={`cal-sound${on ? ' is-on' : ''}`}
    onClick={onToggle}
    aria-label={on ? 'Silenciar' : 'Activar sonido'}
    aria-pressed={on}
    title={on ? 'Silenciar el mar' : 'Escuchar el mar'}
  >
    {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
    <span>Sonido del mar</span>
    <span className="cal-sound__bars" aria-hidden="true"><i /><i /><i /></span>
  </button>
);

// Orbe de respiración: aura, pétalos y anillos siguen la escala (transición CSS
// lenta); el núcleo cambia de color fundiendo capas (solo opacidad).
const BreathOrb = ({ escala, tono, phaseKey, phaseDur }) => (
  <div className="cal-orb">
    <div className="cal-orb__aura" style={{ transform: `scale(${0.62 + escala * 0.34})` }}>
      {TONES.map((t) => <span key={t} className={`cal-tone--${t}${t === tono ? ' is-on' : ''}`} />)}
    </div>
    <div className="cal-orb__petals" style={{ transform: `rotate(${(escala - 1) * 40}deg) scale(${0.36 + escala * 0.44})` }}>
      {Array.from({ length: 8 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
    </div>
    <span className="cal-orb__ring cal-orb__ring--outer" style={{ transform: `scale(${0.86 + escala * 0.14})` }} />
    <span className="cal-orb__ring cal-orb__ring--inner" style={{ transform: `scale(${0.36 + escala * 0.3})` }} />

    {/* anillo de fase: barre una vez por fase y se reinicia con la key */}
    <div key={phaseKey} className="cal-dial" style={{ '--dur': phaseDur }}>
      <div className="cal-dial__ring">
        <span className="cal-dial__half cal-dial__half--r"><i /></span>
        <span className="cal-dial__half cal-dial__half--l"><i /></span>
      </div>
      <span className="cal-dial__tip" />
    </div>

    <div className="cal-orb__core" style={{ transform: `scale(${escala})` }}>
      {TONES.map((t) => <span key={t} className={`cal-orb__tone cal-tone--${t}${t === tono ? ' is-on' : ''}`} />)}
      <span className="cal-orb__gloss" />
    </div>
  </div>
);

/* ── Componente principal ────────────────────────────────────── */
const IslaDeLaCalma = () => {
  const [pantalla, setPantalla] = useState('inicio');
  const [numeroCiclos, setNumeroCiclos] = useState(5);
  const [instruccion, setInstruccion] = useState('Prepárate...');
  const [escalaCirculo, setEscalaCirculo] = useState(1);
  const [cicloActual, setCicloActual] = useState(0);
  const [audioActivado, setAudioActivado] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (pantalla !== 'respiracion') return;

    if (cicloActual > numeroCiclos) {
      setPantalla('final');
      return;
    }

    if (cicloActual === 0) {
      const timer = setTimeout(() => setCicloActual(1), 2500);
      return () => clearTimeout(timer);
    }

    const secuencia = [
      { texto: 'Inhala...', escala: 1.5 },
      { texto: 'Sostén...', escala: 1.5 },
      { texto: 'Exhala...', escala: 1 },
      { texto: 'Mantén...', escala: 1 },
    ];

    let step = 0;
    const nextStep = () => {
      if (step < secuencia.length) {
        setInstruccion(secuencia[step].texto);
        setEscalaCirculo(secuencia[step].escala);
        step++;
      } else {
        setCicloActual(c => c + 1);
      }
    };

    nextStep();
    const intervalo = setInterval(nextStep, 4000);
    return () => clearInterval(intervalo);
  }, [pantalla, cicloActual, numeroCiclos]);

  const handleEmpezar = () => {
    setInstruccion('Prepárate...');
    setCicloActual(0);
    setPantalla('respiracion');
  };

  const handleReiniciar = () => {
    setPantalla('inicio');
    setEscalaCirculo(1);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioActivado) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setAudioActivado(!audioActivado);
  };

  const adjustCycles = (delta) => {
    setNumeroCiclos(n => Math.max(1, Math.min(15, n + delta)));
  };

  // --- Solo presentación (derivado del estado) ---
  const tono = PHASE_TONE[instruccion] || 'prep';
  const preparando = cicloActual === 0;
  const cicloMostrado = Math.min(cicloActual, numeroCiclos);
  const duracion = formatDuration(numeroCiclos * SEG_POR_CICLO);
  const screenMotion = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -14 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <GameShell
      theme="dark"
      accent="#14b8a6"
      accent2="#818cf8"
      className={`cal-shell cal-shell--${pantalla}`}
      scene={<NightScene pantalla={pantalla} />}
    >
      <audio ref={audioRef} src="/audio/calm-sound.mp3" loop />

      <div className="cal-top">
        <GameHeader compact right={<SoundToggle on={audioActivado} onToggle={toggleAudio} />} />
      </div>

      <div className="cal-stage">
        <AnimatePresence mode="wait">
          {/* ── Pantalla inicio ──────────────────────────── */}
          {pantalla === 'inicio' && (
            <motion.section key="inicio" className="cal-intro" {...screenMotion}>
              <div className="cal-intro__copy">
                <Chip icon={Wind} className="cal-kicker">Respiración guiada</Chip>
                <h2 className="cal-title">Tómate un respiro</h2>
                <p className="cal-lead">
                  Una pausa para encontrar la calma a través de la respiración.
                  Sigue la animación y las instrucciones para relajar tu cuerpo y tu mente.
                </p>

                <ul className="cal-rhythm" aria-label="Cada respiración tiene cuatro pasos de 4 segundos">
                  {PHASES.map((p) => (
                    <li key={p.tone} className={`cal-rhythm__step cal-tone--${p.tone}`}>
                      <i aria-hidden="true" />
                      {p.label}
                      <small>4 s</small>
                    </li>
                  ))}
                </ul>

                <div className="cal-stepper" role="group" aria-label="Número de respiraciones">
                  <div className="cal-stepper__head">
                    <span className="cal-stepper__label">Respiraciones</span>
                    <span className="cal-stepper__time"><Clock size={13} /> ≈ {duracion}</span>
                  </div>
                  <div className="cal-stepper__row">
                    <button
                      type="button"
                      className="cal-stepper__btn cal-stepper__btn--minus"
                      onClick={() => adjustCycles(-1)}
                      disabled={numeroCiclos <= 1}
                      aria-label="Menos"
                    >
                      <Minus size={20} strokeWidth={2.6} />
                    </button>
                    <output className="cal-stepper__value" aria-live="polite">
                      <span key={numeroCiclos}>{numeroCiclos}</span>
                    </output>
                    <button
                      type="button"
                      className="cal-stepper__btn cal-stepper__btn--plus"
                      onClick={() => adjustCycles(1)}
                      disabled={numeroCiclos >= MAX_CICLOS}
                      aria-label="Más"
                    >
                      <Plus size={20} strokeWidth={2.6} />
                    </button>
                  </div>
                  <div className="cal-stepper__pearls" aria-hidden="true">
                    {Array.from({ length: MAX_CICLOS }, (_, i) => (
                      <i key={i} className={i < numeroCiclos ? 'is-on' : undefined} />
                    ))}
                  </div>
                </div>

                <GameButton size="lg" icon={Play} onClick={handleEmpezar} className="cal-cta">
                  Comenzar
                </GameButton>
              </div>
            </motion.section>
          )}

          {/* ── Pantalla respiración ─────────────────────── */}
          {pantalla === 'respiracion' && (
            <motion.section key="respiracion" className={`cal-breath cal-tone--${tono}`} {...screenMotion}>
              <BreathOrb
                escala={escalaCirculo}
                tono={tono}
                phaseKey={`${instruccion}-${cicloActual}`}
                phaseDur={preparando ? '2.5s' : '4s'}
              />

              <div className="cal-cue" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={instruccion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6 }}
                  >
                    <p className="cal-cue__word">{instruccion}</p>
                    <p className="cal-cue__hint">{PHASE_HINT[tono]}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <ol className="cal-phases" aria-label="Pasos de la respiración">
                {PHASES.map((p) => (
                  <li key={p.tone} className={`cal-phase cal-tone--${p.tone}${p.tone === tono ? ' is-on' : ''}`}>
                    <i aria-hidden="true" />
                    {p.label}
                  </li>
                ))}
              </ol>

              <div className="cal-cycles">
                <div className="cal-cycles__dots" aria-hidden="true">
                  {Array.from({ length: numeroCiclos }, (_, i) => {
                    const n = i + 1;
                    const state = n < cicloActual ? 'done' : n === cicloActual ? 'now' : 'todo';
                    return <i key={n} className={`is-${state}`} />;
                  })}
                </div>
                <span className="cal-cycles__text">
                  {preparando
                    ? 'Empezamos enseguida'
                    : <>Respiración <strong>{cicloMostrado}</strong> de {numeroCiclos}</>}
                </span>
              </div>
            </motion.section>
          )}

          {/* ── Pantalla final ───────────────────────────── */}
          {pantalla === 'final' && (
            <motion.section key="final" className="cal-final" {...screenMotion}>
              <h2 className="cal-title">Muy bien hecho</h2>
              <p className="cal-lead">
                Has completado tu ejercicio de relajación.
                Esperamos que te sientas más tranquilo y enfocado.
              </p>

              <motion.div
                className="cal-final__art"
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 110, damping: 16 }}
              >
                <LotusArt />
              </motion.div>

              <div className="cal-final__chips">
                <Chip icon={Wind}>{numeroCiclos} {numeroCiclos === 1 ? 'respiración' : 'respiraciones'}</Chip>
                <Chip icon={Clock}>{duracion} de calma</Chip>
              </div>

              <GameButton size="lg" icon={RotateCcw} onClick={handleReiniciar} className="cal-cta">
                Hacer otra vez
              </GameButton>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
};

export default IslaDeLaCalma;
