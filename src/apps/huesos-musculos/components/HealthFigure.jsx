// Escenas de primeros auxilios (minijuego "Lesiones y primeros auxilios"):
// RCP con compresiones al ritmo de 100-120 por minuto, posición lateral de
// seguridad respirando, conducta PAS, método PRICE, desfibrilador (DEA) y
// botiquín. Solo se animan transform y opacity.
import React from 'react';
import {
  FigureStage, Mannequin, Props, TONES, posesOf,
} from './StretchFigure';
import { resolvePose } from './stretchRig';

const SCENE_CSS = `
@keyframes hm-cpr { 0%, 100% { transform: translateY(0); } 42% { transform: translateY(4.5px); } }
@keyframes hm-breath { 0%, 30% { opacity: 0; transform: translateX(0); } 55% { opacity: .9; } 100% { opacity: 0; transform: translateX(-10px); } }
@keyframes hm-blink { 0%, 60%, 100% { opacity: 1; } 75% { opacity: .35; } }
`;

const still = (spec) => {
  const p = resolvePose(spec, 0);
  return [p, p];
};

// Persona tumbada boca arriba (RCP).
const VICTIM = still({ view: 'side', root0: { x: 128, y: 194, r: -90 }, j0: { shF: -3, shN: -3, elF: -4, elN: -4, anF: 30, anN: 30, neck: -8 } });
// Posición lateral de seguridad: de lado en el suelo, vista de frente y un poco
// desde arriba (cabeza a la izquierda, inclinada hacia atrás). La pierna de
// arriba se dobla hacia delante y apoya la rodilla en el suelo, por delante de
// la de abajo; la mano de arriba va bajo la mejilla; el brazo de abajo, en
// ángulo recto con el cuerpo.
const PLS = still({
  view: 'front',
  root0: { x: 140, y: 192, r: -90 },
  j0: { legL: 2, knL: 3, legR: 60, knR: -57, ltR: 0.62, lsR: 0.92, neck: 16, armL: 168, elL: 50 },
  ik0: { armR: { to: 'head', off: [7, 12], s: -1 } },
});

function Cpr() {
  const chest = VICTIM[0].pts.chest;
  const hx = chest[0];
  const hy = chest[1] - 13;
  const sy = hy - Math.sqrt(56 * 56 - 20 * 20);
  const t = TONES.alt;
  const armAngle = (Math.atan2(20, hy - sy) * 180) / Math.PI;
  const anim = { animation: 'hm-cpr .55s ease-in-out infinite' };
  return (
    <>
      <rect x="18" y="203" width="204" height="9" rx="4.5" fill="rgba(167, 139, 250, .2)" stroke="rgba(196, 181, 253, .5)" strokeWidth="1.5" />
      <g style={anim}>
        <path d={`M${hx - 23} ${sy - 3} Q${hx - 26} ${sy + 18} ${hx - 16} ${sy + 52} L${hx + 16} ${sy + 52} Q${hx + 26} ${sy + 18} ${hx + 23} ${sy - 3} Q${hx} ${sy - 9} ${hx - 23} ${sy - 3} Z`} fill={t.fill} stroke={t.stroke} strokeWidth="2" />
        <rect x={hx - 5} y={sy - 12} width="10" height="9" rx="3" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
        <circle cx={hx} cy={sy - 25} r="13" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
        <circle cx={hx - 5} cy={sy - 23} r="2" fill="#fef3c7" />
        <circle cx={hx + 5} cy={sy - 23} r="2" fill="#fef3c7" />
      </g>
      <Mannequin poses={VICTIM} anim={false} />
      <g style={anim}>
        {[-1, 1].map((sx) => (
          <g key={sx} transform={`translate(${hx + sx * 20} ${sy}) rotate(${sx * armAngle})`}>
            <rect x="-5.5" y="-5.5" width="11" height="67" rx="5.5" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
          </g>
        ))}
        <ellipse cx={hx} cy={hy + 1} rx="10" ry="6" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
        <ellipse cx={hx} cy={hy - 3} rx="8" ry="5" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
      </g>
      <g transform="translate(196 40)">
        <path d="M0 6 C0 -2 10 -4 12 4 C14 -4 24 -2 24 6 C24 14 12 22 12 24 C12 22 0 14 0 6 Z" fill="#f43f5e" opacity=".9" style={{ transformOrigin: '12px 10px', transformBox: 'view-box', animation: 'hm-cpr .55s ease-in-out infinite' }} />
      </g>
    </>
  );
}

function Pls() {
  const head = PLS[0].pts.head;
  return (
    <g transform="translate(0 -48)">
      <path d="M8 222 L232 222 L218 196 L22 196 Z" fill="rgba(167, 139, 250, .16)" stroke="rgba(196, 181, 253, .45)" strokeWidth="1.5" strokeLinejoin="round" />
      <Mannequin poses={PLS} anim={false} />
      <g transform={`translate(${head[0] - 17} ${head[1] + 2})`}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${-i * 7} -6 q-4 6 0 12`} fill="none" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" style={{ animation: `hm-breath 4s ease-out ${i * 0.25}s infinite` }} />
        ))}
      </g>
    </g>
  );
}

function Pas() {
  return (
    <g>
      <g transform="translate(70 70)">
        <path d="M50 4 L96 86 H4 Z" fill="rgba(251, 191, 36, .2)" stroke="#fbbf24" strokeWidth="5" strokeLinejoin="round" />
        <rect x="45" y="30" width="10" height="34" rx="5" fill="#fde68a" />
        <circle cx="50" cy="74" r="6" fill="#fde68a" style={{ animation: 'hm-blink 1.6s ease-in-out infinite' }} />
      </g>
      <g transform="translate(150 150)">
        <rect width="58" height="58" rx="14" fill="#15803d" stroke="#86efac" strokeWidth="2.5" />
        <rect x="23" y="10" width="12" height="38" rx="2" fill="#f0fdf4" />
        <rect x="10" y="23" width="38" height="12" rx="2" fill="#f0fdf4" />
      </g>
      <g transform="translate(32 158)" opacity=".85">
        <rect width="36" height="56" rx="8" fill="rgba(14, 116, 144, .5)" stroke="#67e8f9" strokeWidth="2" />
        <rect x="6" y="8" width="24" height="32" rx="3" fill="rgba(165, 243, 252, .25)" />
        <circle cx="18" cy="48" r="3.5" fill="#67e8f9" />
      </g>
    </g>
  );
}

function Price() {
  return (
    <g>
      <rect x="120" y="150" width="96" height="40" rx="18" fill="rgba(167, 139, 250, .3)" stroke="rgba(196, 181, 253, .7)" strokeWidth="2" />
      <path d="M20 196 L120 160 L170 150" fill="none" stroke={TONES.body.stroke} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <path d="M20 196 L120 160 L170 150" fill="none" stroke={TONES.body.fill} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="170" y="128" width="14" height="30" rx="7" fill={TONES.body.fill} stroke={TONES.body.stroke} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={136 + i * 8} y="144" width="6" height="22" rx="2" transform={`rotate(-11 ${139 + i * 8} 155)`} fill="#f5f5f4" opacity=".85" />)}
      <g style={{ animation: 'hm-blink 3s ease-in-out infinite' }}>
        <rect x="132" y="120" width="40" height="26" rx="8" fill="rgba(186, 230, 253, .85)" stroke="#e0f2fe" strokeWidth="2" />
        <path d="M140 128 l6 6 m4 -6 l6 6 m4 -6 l6 6" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M200 70 v40 m-10 -28 l10 -12 l10 12" fill="none" stroke="#a5f3fc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Dea() {
  return (
    <g>
      <rect x="54" y="54" width="132" height="132" rx="26" fill="#16a34a" stroke="#bbf7d0" strokeWidth="3" />
      <path d="M120 165 C84 140 72 118 80 100 C88 82 112 84 120 102 C128 84 152 82 160 100 C168 118 156 140 120 165 Z" fill="#f0fdf4" />
      <path d="M126 92 L108 124 H122 L114 152 L138 114 H124 L132 92 Z" fill="#16a34a" style={{ animation: 'hm-blink 1.4s ease-in-out infinite' }} />
      <path d="M186 160 q24 4 24 30" fill="none" stroke="#bbf7d0" strokeWidth="3" />
      <rect x="198" y="188" width="24" height="16" rx="4" fill="rgba(240, 253, 244, .85)" />
    </g>
  );
}

function Kit() {
  return (
    <g>
      <path d="M96 66 v-12 a8 8 0 0 1 8 -8 h32 a8 8 0 0 1 8 8 v12" fill="none" stroke="#86efac" strokeWidth="6" />
      <rect x="44" y="66" width="152" height="118" rx="20" fill="#15803d" stroke="#86efac" strokeWidth="3" />
      <rect x="108" y="88" width="24" height="74" rx="4" fill="#f0fdf4" />
      <rect x="83" y="113" width="74" height="24" rx="4" fill="#f0fdf4" />
    </g>
  );
}

const SCENES = { rcp: Cpr, pls: Pls, pas: Pas, price: Price, dea: Dea, injury: Kit };
export const HEALTH_TOPICS = [...Object.keys(SCENES), 'estirar'];

// topic: rcp | pls | pas | price | dea | injury | estirar · title: texto bajo la escena
export default function HealthFigure({ topic, title, label = 'Primeros auxilios' }) {
  if (topic === 'estirar') {
    return (
      <FigureStage label={label}>
        <Props list={['floor']} />
        <Mannequin poses={posesOf('cuadriceps-pie')} anim={false} t={1} />
      </FigureStage>
    );
  }
  const Scene = SCENES[topic] || Kit;
  return (
    <FigureStage label={title || label} caption={title}>
      <style>{SCENE_CSS}</style>
      <Scene />
    </FigureStage>
  );
}
