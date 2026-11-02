// Maniquí animado que hace un movimiento articular (minijuego "Movimientos").
// Vista de perfil (mirando a la derecha) para los movimientos del plano sagital
// y de frente para los del plano frontal, la rotación y la prono-supinación.
// El segmento que se mueve va resaltado; la animación va de la posición inicial
// a la final, se mantiene y reaparece desde el principio (sin "volver", para
// que el sentido del movimiento no sea ambiguo).
import React, { useId } from 'react';

// Animación de cada movimiento: vista, segmento que se mueve y ángulos.
const FIG = {
  'flex-codo': { view: 'side', seg: 'forearm', a: [0, -128] },
  'ext-codo': { view: 'side', seg: 'forearm', a: [-128, 0] },
  'flex-rodilla': { view: 'side', seg: 'shank', a: [0, 110] },
  'ext-rodilla': { view: 'side', seg: 'shank', a: [100, 0], pose: { thigh: -70 } },
  'flex-cadera': { view: 'side', seg: 'thigh', a: [0, -95] },
  'ext-cadera': { view: 'side', seg: 'thigh', a: [0, 32] },
  'flex-tronco': { view: 'side', seg: 'upper', a: [0, 72] },
  'flex-plantar': { view: 'side', seg: 'foot', a: [0, 42] },
  'flex-dorsal': { view: 'side', seg: 'foot', a: [0, -24] },
  'circ-hombro': { view: 'side', seg: 'arm', a: [0, -360], spin: true },
  'abd-hombro': { view: 'front', seg: 'armR', a: [0, 100] },
  'add-hombro': { view: 'front', seg: 'armR', a: [100, 0] },
  'abd-cadera': { view: 'front', seg: 'legR', a: [0, 32] },
  'add-cadera': { view: 'front', seg: 'legR', a: [32, 0] },
  'rot-cabeza': { view: 'front', seg: 'face', shift: [0, 13] },
  pronacion: { view: 'front', seg: 'handR', flip: [1, -1] },
  supinacion: { view: 'front', seg: 'handR', flip: [-1, 1] },
};

const BODY = { fill: 'rgba(21, 94, 117, .55)', stroke: '#67e8f9' };
const MOVE = { fill: 'rgba(251, 191, 36, .55)', stroke: '#fde68a' };

function Limb({ x, y, len, w = 12, hi, children, style, className }) {
  const c = hi ? MOVE : BODY;
  return (
    <g style={style} className={className}>
      <rect x={x - w / 2} y={y} width={w} height={len} rx={w / 2} fill={c.fill} stroke={c.stroke} strokeWidth="2" />
      {children}
    </g>
  );
}

const anim = (spec, origin) => {
  if (!spec) return undefined;
  const st = { transformOrigin: `${origin[0]}px ${origin[1]}px`, transformBox: 'view-box' };
  if (spec.spin) return { ...st, '--a0': `${spec.a[0]}deg`, '--a1': `${spec.a[1]}deg`, animation: 'ana-mv-spin 2.6s linear infinite' };
  return { ...st, '--a0': `${spec.a[0]}deg`, '--a1': `${spec.a[1]}deg`, animation: 'ana-mv 2.8s cubic-bezier(.45,0,.2,1) infinite' };
};
const still = (deg, origin) => (deg ? { transform: `rotate(${deg}deg)`, transformOrigin: `${origin[0]}px ${origin[1]}px`, transformBox: 'view-box' } : undefined);

function SideFigure({ spec }) {
  const m = spec.seg;
  const A = (s, o) => (m === s ? anim(spec, o) : still(spec.pose?.[s], o));
  // articulaciones: hombro (121,68) codo (121,106) cadera (121,128) rodilla (121,170) tobillo (121,210)
  return (
    <>
      <g style={A('upper', [121, 128])} className={m === 'upper' ? 'is-moving' : ''}>
        <circle cx="128" cy="38" r="17" fill={m === 'upper' ? MOVE.fill : BODY.fill} stroke={m === 'upper' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
        <circle cx="137" cy="35" r="2.4" fill="#cffafe" />
        <rect x="106" y="56" width="30" height="74" rx="13" fill={m === 'upper' ? MOVE.fill : BODY.fill} stroke={m === 'upper' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
        <g style={A('arm', [121, 68])}>
          <Limb x={121} y={66} len={42} hi={m === 'arm' || m === 'upper'} />
          <g style={A('forearm', [121, 106])}>
            <Limb x={121} y={104} len={36} w={11} hi={m === 'forearm' || m === 'arm' || m === 'upper'} />
            <ellipse cx="121" cy="146" rx="7" ry="9" fill={m === 'forearm' || m === 'arm' || m === 'upper' ? MOVE.fill : BODY.fill} stroke={m === 'forearm' || m === 'arm' || m === 'upper' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
          </g>
        </g>
      </g>
      <g style={A('thigh', [121, 128])}>
        <Limb x={121} y={126} len={46} w={15} hi={m === 'thigh'} />
        <g style={A('shank', [121, 170])}>
          <Limb x={121} y={168} len={44} w={13} hi={m === 'shank' || m === 'thigh'} />
          <g style={A('foot', [121, 210])}>
            <rect x="114" y="206" width="34" height="11" rx="5.5" fill={m === 'foot' || m === 'shank' || m === 'thigh' ? MOVE.fill : BODY.fill} stroke={m === 'foot' || m === 'shank' || m === 'thigh' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
          </g>
        </g>
      </g>
      <line x1="40" y1="222" x2="200" y2="222" stroke="rgba(103,232,249,.35)" strokeWidth="2" strokeDasharray="4 5" />
    </>
  );
}

function FrontFigure({ spec }) {
  const m = spec.seg;
  const A = (s, o) => (m === s ? anim(spec, o) : undefined);
  const faceStyle = m === 'face' ? { '--x0': `${spec.shift[0]}px`, '--x1': `${spec.shift[1]}px`, animation: 'ana-mv-x 2.8s cubic-bezier(.45,0,.2,1) infinite' } : undefined;
  const handStyle = m === 'handR' ? { transformOrigin: '84px 150px', transformBox: 'view-box', '--s0': spec.flip[0], '--s1': spec.flip[1], animation: 'ana-mv-sx 2.8s cubic-bezier(.45,0,.2,1) infinite' } : undefined;
  return (
    <>
      <circle cx="120" cy="36" r="18" fill={m === 'face' ? MOVE.fill : BODY.fill} stroke={m === 'face' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
      <g style={faceStyle}>
        <circle cx="113" cy="33" r="2.6" fill="#cffafe" />
        <circle cx="127" cy="33" r="2.6" fill="#cffafe" />
        <path d="M120 37 l-2 6 h4 z" fill="#a5f3fc" />
      </g>
      <rect x="99" y="56" width="42" height="74" rx="15" fill={BODY.fill} stroke={BODY.stroke} strokeWidth="2" />
      {/* brazo izquierdo del dibujo = derecho del sujeto */}
      <g style={A('armR', [96, 64])}>
        <Limb x={90} y={60} len={44} hi={m === 'armR'} style={{ transform: 'rotate(8deg)', transformOrigin: '90px 62px', transformBox: 'view-box' }} />
        <g style={{ transform: 'rotate(8deg)', transformOrigin: '90px 62px', transformBox: 'view-box' }}>
          <Limb x={90} y={102} len={36} w={11} hi={m === 'armR' || m === 'handR'} />
          <g style={handStyle}>
            <ellipse cx="90" cy="146" rx="8" ry="10" fill={m === 'handR' || m === 'armR' ? MOVE.fill : BODY.fill} stroke={m === 'handR' || m === 'armR' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
            <ellipse cx="81" cy="141" rx="3" ry="6" fill={m === 'handR' || m === 'armR' ? '#fbbf24' : '#22d3ee'} transform="rotate(-25 81 141)" />
          </g>
        </g>
      </g>
      <g style={{ transform: 'rotate(-8deg)', transformOrigin: '150px 62px', transformBox: 'view-box' }}>
        <Limb x={150} y={60} len={44} />
        <Limb x={150} y={102} len={36} w={11} />
        <ellipse cx="150" cy="146" rx="8" ry="10" fill={BODY.fill} stroke={BODY.stroke} strokeWidth="2" />
      </g>
      <g style={A('legR', [110, 130])}>
        <Limb x={110} y={128} len={88} w={16} hi={m === 'legR'} />
        <rect x="98" y="212" width="22" height="10" rx="5" fill={m === 'legR' ? MOVE.fill : BODY.fill} stroke={m === 'legR' ? MOVE.stroke : BODY.stroke} strokeWidth="2" />
      </g>
      <Limb x={130} y={128} len={88} w={16} />
      <rect x="120" y="212" width="22" height="10" rx="5" fill={BODY.fill} stroke={BODY.stroke} strokeWidth="2" />
    </>
  );
}

export default function MovementFigure({ fig }) {
  const spec = FIG[fig];
  const uid = useId().replace(/:/g, '');
  if (!spec) return null;
  return (
    <div className="gq-stage gq-stage--card ana-move-stage">
      <svg className="ana-move" viewBox="0 0 240 240" role="img" aria-label="Movimiento">
        <defs>
          <radialGradient id={`${uid}-bg`} cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#12305a" />
            <stop offset="1" stopColor="#0a1626" />
          </radialGradient>
        </defs>
        <rect width="240" height="240" rx="26" fill={`url(#${uid}-bg)`} />
        <g className="ana-move__fig">
          {spec.view === 'side' ? <SideFigure spec={spec} /> : <FrontFigure spec={spec} />}
        </g>
      </svg>
    </div>
  );
}

export const MOVEMENT_FIGS = Object.keys(FIG);
