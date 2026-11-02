// Maniquí animado de los estiramientos (minijuego "Estiramientos"): pasa de la
// postura inicial a la del estiramiento, la mantiene y vuelve. Cada segmento es
// un grupo que gira sobre su articulación (solo se anima `transform`). Al
// responder se ilumina el músculo que se estira.
// También lo usan las escenas de primeros auxilios (Mannequin).
import React, { useId } from 'react';
import {
  LEN, FRONT, FLOOR, STRETCH_POSES, resolveStretch,
} from './stretchRig';

const DUR = 5.2;
const EASE = 'cubic-bezier(.45,0,.25,1)';
export const TONES = {
  body: { fill: 'rgba(17, 86, 110, .95)', stroke: '#67e8f9' },
  far: { fill: 'rgba(8, 38, 56, .97)', stroke: 'rgba(103, 232, 249, .5)' },
  alt: { fill: 'rgba(120, 53, 15, .72)', stroke: '#fcd34d' },
  altFar: { fill: 'rgba(69, 32, 10, .92)', stroke: 'rgba(252, 211, 77, .55)' },
};
const HL = '#fb7185';

const KEYFRAMES = `
@keyframes hmst-r { 0%, 14% { transform: rotate(var(--a0)); } 46%, 84% { transform: rotate(var(--a1)); } 100% { transform: rotate(var(--a0)); } }
@keyframes hmst-t { 0%, 14% { transform: translate(var(--x0), var(--y0)); } 46%, 84% { transform: translate(var(--x1), var(--y1)); } 100% { transform: translate(var(--x0), var(--y0)); } }
@keyframes hmst-s { 0%, 14% { transform: scale(1, var(--s0)); } 46%, 84% { transform: scale(1, var(--s1)); } 100% { transform: scale(1, var(--s0)); } }
@keyframes hmst-glow { from { opacity: .45; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hm-fig [style*="animation"] { animation-duration: 10s !important; } }
`;
export const FigureKeyframes = () => <style>{KEYFRAMES}</style>;

const ORIGIN = { transformOrigin: '0px 0px', transformBox: 'view-box' };
const anim = (name) => ({ animation: `${name} ${DUR}s ${EASE} infinite` });

// Estilos de un grupo según el modo: animado (dos posturas) o quieto en la postura t.
function makeStyles(mode) {
  const pick = (v0, v1) => (mode.t === 1 ? v1 : v0);
  return {
    rot: (v0 = 0, v1 = v0) => {
      if (mode.anim && Math.abs(v0 - v1) > 0.05) return { ...ORIGIN, '--a0': `${v0}deg`, '--a1': `${v1}deg`, ...anim('hmst-r') };
      const v = mode.anim ? v0 : pick(v0, v1);
      return v ? { ...ORIGIN, transform: `rotate(${v}deg)` } : undefined;
    },
    tr: ([x0, y0], [x1, y1] = [x0, y0]) => {
      if (mode.anim && (Math.abs(x0 - x1) > 0.05 || Math.abs(y0 - y1) > 0.05)) {
        return { ...ORIGIN, '--x0': `${x0}px`, '--y0': `${y0}px`, '--x1': `${x1}px`, '--y1': `${y1}px`, ...anim('hmst-t') };
      }
      const [x, y] = mode.anim ? [x0, y0] : mode.t === 1 ? [x1, y1] : [x0, y0];
      return { ...ORIGIN, transform: `translate(${x}px, ${y}px)` };
    },
    sc: (s0 = 1, s1 = s0) => {
      if (mode.anim && Math.abs(s0 - s1) > 0.005) return { ...ORIGIN, '--s0': s0, '--s1': s1, ...anim('hmst-s') };
      const s = mode.anim ? s0 : pick(s0, s1);
      return s !== 1 ? { ...ORIGIN, transform: `scale(1, ${s})` } : undefined;
    },
  };
}

function Capsule({ length, w, tone }) {
  return <rect x={-w / 2} y={-w / 2} width={w} height={length + w} rx={w / 2} fill={tone.fill} stroke={tone.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />;
}

// Banda del músculo estirado (dentro del segmento, en su cara anterior o posterior).
function Band({ length, w, side, from, to, show }) {
  if (!show) return null;
  const x = side > 0 ? w / 2 - 6.5 : -w / 2 + 1.5;
  const y0 = from ?? 3;
  const y1 = to ?? length - 3;
  return (
    <g style={{ animation: 'hmst-glow 1.1s ease-in-out infinite alternate' }}>
      <rect x={x - 2} y={Math.min(y0, y1) - 2} width={9} height={Math.abs(y1 - y0) + 4} rx={4.5} fill="rgba(251, 113, 133, .3)" />
      <rect x={x} y={Math.min(y0, y1)} width={5} height={Math.abs(y1 - y0)} rx={2.5} fill={HL} />
    </g>
  );
}

const bandFor = (hl, seg) => (hl || []).filter((h) => h.seg === seg);

/* ───────── de perfil ───────── */

function SideBody({ a, b, st, hl, show, order, tone = 'body' }) {
  const near = TONES[tone];
  const far = TONES[tone === 'alt' ? 'altFar' : 'far'];
  const J = (k) => [a.j[k] || 0, b.j[k] || 0];
  const sideSign = (s) => (s === 'back' ? -1 : 1);
  const bands = (seg, length, w) => bandFor(hl, seg).map((h, i) => <Band key={i} length={length} w={w} side={sideSign(h.side)} from={h.from} to={h.to} show={show} />);

  const arm = (s) => {
    const t = s === 'N' ? near : far;
    return (
      <g transform={`translate(0 ${-LEN.torso})`}>
        <g style={st.rot(...J(`sh${s}`))}>
          <Capsule length={LEN.ua} w={11} tone={t} />
          {bands(`upperArm${s}`, LEN.ua, 11)}
          <g transform={`translate(0 ${LEN.ua})`}>
            <g style={st.rot(...J(`el${s}`))}>
              <Capsule length={LEN.fa} w={10} tone={t} />
              <circle cx="0" cy={LEN.fa + 4} r="6" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
            </g>
          </g>
        </g>
      </g>
    );
  };
  const F = (k) => [a.j[k] ?? 1, b.j[k] ?? 1];
  const leg = (s) => {
    const t = s === 'N' ? near : far;
    const [lt0, lt1] = F(`lt${s}`);
    const [ls0, ls1] = F(`ls${s}`);
    return (
      <g style={st.rot(...J(`hip${s}`))}>
        <g style={st.sc(lt0, lt1)}>
          <Capsule length={LEN.th} w={16} tone={t} />
          {bands(`thigh${s}`, LEN.th, 16)}
        </g>
        <g style={st.tr([0, LEN.th * lt0], [0, LEN.th * lt1])}>
          <g style={st.rot(...J(`kn${s}`))}>
            <g style={st.sc(ls0, ls1)}>
              <Capsule length={LEN.sh} w={13} tone={t} />
              {bands(`shank${s}`, LEN.sh, 13)}
            </g>
            <g style={st.tr([0, LEN.sh * ls0], [0, LEN.sh * ls1])}>
              <g style={st.rot(...J(`an${s}`))}>
                <rect x="-6" y="-3" width="25" height="8" rx="4" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
              </g>
            </g>
          </g>
        </g>
      </g>
    );
  };
  const torso = (
    <g style={st.rot(...J('trunk'))}>
      {arm('F')}
      <rect x="-12.5" y="-60" width="25" height="69" rx="12.5" fill={near.fill} stroke={near.stroke} strokeWidth="2" />
      {bandFor(hl, 'torso').map((h, i) => <Band key={i} length={0} w={25} side={sideSign(h.side)} from={h.from} to={h.to} show={show} />)}
      <g transform={`translate(0 ${-LEN.neck})`}>
        <g style={st.rot(...J('neck'))}>
          <rect x="-4.5" y="-6" width="9" height="9" rx="3" fill={near.fill} stroke={near.stroke} strokeWidth="2" />
          <circle cx="3" cy="-13" r="13" fill={near.fill} stroke={near.stroke} strokeWidth="2" />
          <circle cx="10" cy="-15" r="2.2" fill="#cffafe" />
          <path d="M15.5 -11 q2.5 1.5 0 3.5" fill="none" stroke={near.stroke} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
      {arm('N')}
    </g>
  );
  return (
    <g transform={`translate(${a.root.x} ${a.root.y})`}>
      <g style={st.tr([0, 0], [b.root.x - a.root.x, b.root.y - a.root.y])}>
        <g style={st.rot(a.root.r || 0, b.root.r || 0)}>
          {order === 'legsFirst' ? <>{leg('F')}{leg('N')}{torso}</> : <>{leg('F')}{torso}{leg('N')}</>}
        </g>
      </g>
    </g>
  );
}

/* ───────── de frente ───────── */

function FrontBody({ a, b, st, hl, show, tone = 'body' }) {
  const t = TONES[tone];
  const J = (k) => [a.j[k] || 0, b.j[k] || 0];
  const F = (k) => [a.j[k] ?? 1, b.j[k] ?? 1];
  const sign = (h, s) => (h.side === 'in' ? (s === 'L' ? 1 : -1) : h.side === 'out' ? (s === 'L' ? -1 : 1) : h.side === 'back' ? -1 : 1);
  const leg = (s, sx) => {
    const [lt0, lt1] = F(`lt${s}`);
    const [ls0, ls1] = F(`ls${s}`);
    return (
      <g transform={`translate(${sx * FRONT.hipX} 2)`}>
        <g style={st.rot(...J(`leg${s}`))}>
          <g style={st.sc(lt0, lt1)}>
            <Capsule length={LEN.th} w={16} tone={t} />
            {bandFor(hl, `thigh${s}`).map((h, i) => <Band key={i} length={LEN.th} w={16} side={sign(h, s)} from={h.from} to={h.to} show={show} />)}
          </g>
          <g style={st.tr([0, LEN.th * lt0], [0, LEN.th * lt1])}>
            <g style={st.rot(...J(`kn${s}`))}>
              <g style={st.sc(ls0, ls1)}>
                <Capsule length={LEN.sh} w={13} tone={t} />
              </g>
              <g style={st.tr([0, LEN.sh * ls0], [0, LEN.sh * ls1])}>
                <ellipse cx={sx * 3} cy="4" rx="8" ry="5" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
              </g>
            </g>
          </g>
        </g>
      </g>
    );
  };
  const arm = (s, sx) => (
    <g transform={`translate(${sx * FRONT.shX} ${-FRONT.shY})`}>
      <g style={st.rot(...J(`arm${s}`))}>
        <Capsule length={FRONT.ua} w={11} tone={t} />
        <g transform={`translate(0 ${FRONT.ua})`}>
          <g style={st.rot(...J(`el${s}`))}>
            <Capsule length={FRONT.fa} w={10} tone={t} />
            <circle cx="0" cy={FRONT.fa + 4} r="6" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
          </g>
        </g>
      </g>
    </g>
  );
  const torsoBands = bandFor(hl, 'torso').map((h, i) => {
    const x = h.side === 'out' ? 10 : -15;
    return show ? (
      <g key={i} style={{ animation: 'hmst-glow 1.1s ease-in-out infinite alternate' }}>
        <rect x={x - 2} y={h.from - 2} width={9} height={h.to - h.from + 4} rx={4.5} fill="rgba(251, 113, 133, .3)" />
        <rect x={x} y={h.from} width={5} height={h.to - h.from} rx={2.5} fill={HL} />
      </g>
    ) : null;
  });
  const neckBand = show && bandFor(hl, 'neckR').length ? (
    <g style={{ animation: 'hmst-glow 1.1s ease-in-out infinite alternate' }}>
      <path d="M4 -53 Q 12 -51 19 -47" fill="none" stroke="rgba(251, 113, 133, .35)" strokeWidth="10" strokeLinecap="round" />
      <path d="M4 -53 Q 12 -51 19 -47" fill="none" stroke={HL} strokeWidth="5" strokeLinecap="round" />
    </g>
  ) : null;
  return (
    <g transform={`translate(${a.root.x} ${a.root.y})`}>
      <g style={st.tr([0, 0], [b.root.x - a.root.x, b.root.y - a.root.y])}>
        <g style={st.rot(a.root.r || 0, b.root.r || 0)}>
          {leg('L', -1)}
          {leg('R', 1)}
          <g style={st.rot(...J('trunk'))}>
            <path d="M-22 -50 Q-25 -38 -17 -13 L-16 4 Q0 11 16 4 L17 -13 Q25 -38 22 -50 Q0 -57 -22 -50 Z" fill={t.fill} stroke={t.stroke} strokeWidth="2" strokeLinejoin="round" />
            {torsoBands}
            <g transform={`translate(0 ${-FRONT.neck})`}>
              <g style={st.rot(...J('neck'))}>
                <rect x="-5" y="-7" width="10" height="9" rx="3" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
                <circle cx="0" cy="-14" r="13" fill={t.fill} stroke={t.stroke} strokeWidth="2" />
                <circle cx="-5" cy="-16" r="2.2" fill="#cffafe" />
                <circle cx="5" cy="-16" r="2.2" fill="#cffafe" />
                <path d="M0 -13 l-2 5 h4 z" fill="#a5f3fc" />
              </g>
            </g>
            {neckBand}
            {arm('L', -1)}
            {arm('R', 1)}
          </g>
        </g>
      </g>
    </g>
  );
}

// Cuerpo con dos posturas resueltas [a, b] (animado) o quieto en la postura t.
export function Mannequin({ poses, anim = true, t = 0, hl, show = false, order, tone }) {
  const [a, b] = poses;
  const st = makeStyles({ anim, t });
  return a.view === 'front'
    ? <FrontBody a={a} b={b} st={st} hl={hl} show={show} tone={tone} />
    : <SideBody a={a} b={b} st={st} hl={hl} show={show} order={order} tone={tone} />;
}

/* ───────── decorado ───────── */

export function Props({ list = [] }) {
  return (
    <g aria-hidden="true">
      {list.includes('wall') && (
        <g>
          <rect x="204" y="26" width="16" height={FLOOR - 26} fill="rgba(148, 163, 184, .16)" stroke="rgba(203, 213, 225, .45)" strokeWidth="1.5" />
          {[52, 84, 116, 148, 180].map((y, i) => <line key={y} x1="204" x2="220" y1={y} y2={y} stroke="rgba(203, 213, 225, .28)" strokeWidth="1.2" strokeDasharray={i % 2 ? '0' : '0'} />)}
        </g>
      )}
      {list.includes('door') && (
        <g>
          <rect x="58" y="24" width="12" height={FLOOR - 24} rx="2" fill="rgba(180, 132, 84, .35)" stroke="rgba(253, 230, 138, .55)" strokeWidth="1.5" />
          <rect x="58" y="24" width="40" height="9" rx="2" fill="rgba(180, 132, 84, .3)" stroke="rgba(253, 230, 138, .45)" strokeWidth="1.5" />
        </g>
      )}
      {list.includes('mat') && <rect x="22" y="210" width="196" height="9" rx="4.5" fill="rgba(167, 139, 250, .24)" stroke="rgba(196, 181, 253, .6)" strokeWidth="1.5" />}
      {(list.includes('floor') || list.includes('mat')) && <line x1="16" y1={FLOOR} x2="224" y2={FLOOR} stroke="rgba(103,232,249,.35)" strokeWidth="2" strokeDasharray="4 5" />}
    </g>
  );
}

export function FigureStage({ children, label, caption }) {
  const uid = useId().replace(/:/g, '');
  return (
    <div className="gq-stage gq-stage--card ana-move-stage">
      <svg className="ana-move hm-fig" viewBox="0 0 240 240" role="img" aria-label={label}>
        <FigureKeyframes />
        <defs>
          <radialGradient id={`${uid}-bg`} cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#12305a" />
            <stop offset="1" stopColor="#0a1626" />
          </radialGradient>
        </defs>
        <rect width="240" height="240" rx="26" fill={`url(#${uid}-bg)`} />
        {children}
      </svg>
      {caption && <strong className="gq-bigname">{caption}</strong>}
    </div>
  );
}

const CACHE = new Map();
export const posesOf = (fig) => {
  if (!CACHE.has(fig)) CACHE.set(fig, STRETCH_POSES[fig] ? resolveStretch(STRETCH_POSES[fig]) : null);
  return CACHE.get(fig);
};

// fig: clave de STRETCH_POSES · done: ya se ha respondido (se ilumina el músculo)
// t: 0 | 1 para pintarla quieta (capturas y tests)
export default function StretchFigure({ fig, done = false, t, label = 'Estiramiento' }) {
  const spec = STRETCH_POSES[fig];
  const poses = posesOf(fig);
  if (!spec || !poses) return null;
  return (
    <FigureStage label={label}>
      <Props list={spec.props} />
      <Mannequin poses={poses} anim={t === undefined} t={t} hl={spec.hl} show={done} order={spec.order} />
    </FigureStage>
  );
}
