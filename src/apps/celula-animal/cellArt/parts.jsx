// Piezas compartidas de las ilustraciones de Célula Animal / Célula Vegetal.
// Cada orgánulo es un volumen: cuerpo con degradado (luz arriba-izquierda),
// canto oscuro, brillo especular y sombra de contacto proyectada sobre el
// citoplasma (formas con degradado: nada de <filter>). El detalle repetitivo
// va agrupado en un <path> por capa (ver geom.js). La animación usa SOLO las
// clases cart-* de cellArt.css (transform/opacity, solo con efectos altos).
import React from 'react';
import {
  rng, r2, circlesPath, ellipsesPath, segsPath, polyPath, smoothPath, chunk, tubeShape,
} from './geom';
import './cellArt.css';

/* ───────────── animación ───────────── */

const sec = (v) => (typeof v === 'number' ? `${v}s` : v);
const px = (v) => (typeof v === 'number' ? `${v}px` : v);

// <A c="cart-bob" dur={5} d={-2} dy={-2}>…</A>  → <g class style={--vars}>
export function A({ c, dur, d, dx, dy, tx, ty, s, s2, a, lo, hi, children, ...rest }) {
  const style = {};
  if (dur != null) style['--dur'] = sec(dur);
  if (d != null) style['--d'] = sec(d);
  if (dx != null) style['--dx'] = px(dx);
  if (dy != null) style['--dy'] = px(dy);
  if (tx != null) style['--tx'] = px(tx);
  if (ty != null) style['--ty'] = px(ty);
  if (s != null) style['--s'] = s;
  if (s2 != null) style['--s2'] = s2;
  if (a != null) style['--a'] = `${a}deg`;
  if (lo != null) style['--lo'] = lo;
  if (hi != null) style['--hi'] = hi;
  return <g className={c} style={style} {...rest}>{children}</g>;
}

// Partícula que viaja de (x, y) a (x+tx, y+ty) por una curva y se desvanece
// al llegar. Estático (efectos medios/bajos): queda quieta en su origen.
export function Travel({ x, y, tx, ty, dur = 8, d = 0, children }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)})`} pointerEvents="none">
      <A c="cart-tx" tx={tx} dur={dur} d={d}>
        <A c="cart-ty" ty={ty} dur={dur} d={d}>
          <A c="cart-life" dur={dur} d={d}>{children}</A>
        </A>
      </A>
    </g>
  );
}

/* ───────────── degradados comunes ───────────── */

const Radial = ({ id, stops, cx = '35%', cy = '30%', r = '70%', fx, fy }) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r} fx={fx} fy={fy}>
    {stops.map(([o, c, op = 1]) => <stop key={o} offset={o} stopColor={c} stopOpacity={op} />)}
  </radialGradient>
);
const Linear = ({ id, stops, x1 = '0', y1 = '0', x2 = '0', y2 = '1' }) => (
  <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
    {stops.map(([o, c, op = 1]) => <stop key={o} offset={o} stopColor={c} stopOpacity={op} />)}
  </linearGradient>
);

export function CommonDefs({ id }) {
  return (
    <>
      <Radial id={id('shadow')} cx="50%" cy="50%" r="50%" stops={[['0', '#01060c', 0.62], ['0.55', '#01060c', 0.32], ['1', '#01060c', 0]]} />
      <Radial id={id('gloss')} cx="50%" cy="50%" r="50%" stops={[['0', '#ffffff', 0.75], ['0.45', '#ffffff', 0.22], ['1', '#ffffff', 0]]} />
      <Radial id={id('glow')} cx="50%" cy="50%" r="50%" stops={[['0', '#ffffff', 0.9], ['0.3', '#ffffff', 0.35], ['1', '#ffffff', 0]]} />
      <Radial id={id('sparkGlow')} cx="50%" cy="50%" r="50%" stops={[['0', '#fef08a', 0.95], ['0.35', '#facc15', 0.45], ['1', '#facc15', 0]]} />
      <Radial id={id('sphereShade')} cx="36%" cy="32%" r="72%" stops={[['0', '#05021a', 0], ['0.55', '#05021a', 0.04], ['1', '#05021a', 0.62]]} />
      <Linear id={id('capShade')} stops={[['0', '#1c0700', 0], ['0.5', '#1c0700', 0], ['1', '#1c0700', 0.5]]} />
      {/* mitocondria */}
      <Radial id={id('mitoSkin')} stops={[['0', '#fde68a'], ['0.35', '#f59e0b'], ['0.8', '#b45309'], ['1', '#7c2d12']]} />
      <Radial id={id('mitoMatrix')} cx="40%" cy="38%" stops={[['0', '#fcd34d'], ['0.5', '#e08a12'], ['1', '#9a3412']]} />
      {/* núcleo */}
      <Radial id={id('nucEnv')} stops={[['0', '#ddd6fe'], ['0.4', '#a78bfa'], ['0.85', '#6d28d9'], ['1', '#4c1d95']]} />
      <Radial id={id('nucBody')} cx="38%" cy="34%" stops={[['0', '#7c5bd6'], ['0.35', '#5132a8'], ['0.75', '#2e1a72'], ['1', '#1b0f4a']]} />
      <Radial id={id('nucleolus')} cx="34%" cy="30%" stops={[['0', '#e9d5ff'], ['0.25', '#a855f7'], ['0.7', '#6b21a8'], ['1', '#3b0764']]} />
      {/* retículos y golgi */}
      <Linear id={id('rer')} x1="0" y1="0" x2="0.6" y2="1" stops={[['0', '#93c5fd'], ['0.45', '#3b82f6'], ['1', '#1e3a8a']]} />
      <Linear id={id('rel')} x1="0" y1="0" x2="0.4" y2="1" stops={[['0', '#99f6e4'], ['0.5', '#2dd4bf'], ['1', '#0f766e']]} />
      <Linear id={id('golgi')} x1="0" y1="0" x2="0.25" y2="1" stops={[['0', '#99f6e4'], ['0.4', '#14b8a6'], ['1', '#0b4f4a']]} />
      <Radial id={id('vesicle')} stops={[['0', '#ccfbf1'], ['0.45', '#2dd4bf'], ['1', '#0f5f58']]} />
      <Radial id={id('vesicleBlue')} stops={[['0', '#dbeafe'], ['0.45', '#60a5fa'], ['1', '#1e3a8a']]} />
      {/* lisosoma */}
      <Radial id={id('lyso')} stops={[['0', '#fecdd3'], ['0.3', '#fb7185'], ['0.75', '#be123c'], ['1', '#6b0a24']]} />
      {/* centrosoma */}
      <Linear id={id('centro')} stops={[['0', '#fae8ff'], ['0.35', '#e879f9'], ['0.75', '#a21caf'], ['1', '#581c87']]} />
      <Radial id={id('pcm')} cx="50%" cy="50%" r="50%" stops={[['0', '#f0abfc', 0.5], ['0.5', '#d946ef', 0.18], ['1', '#d946ef', 0]]} />
      {/* inclusiones */}
      <Radial id={id('lipid')} stops={[['0', '#fefce8'], ['0.4', '#fde047'], ['1', '#a16207']]} />
      {/* cloroplasto */}
      <Radial id={id('chloroEnv')} stops={[['0', '#dcfce7'], ['0.35', '#86efac'], ['0.85', '#16a34a'], ['1', '#14532d']]} />
      <Radial id={id('stroma')} cx="40%" cy="36%" stops={[['0', '#86efac'], ['0.45', '#22c55e'], ['1', '#166534']]} />
      <Linear id={id('granum')} x1="0" y1="0" x2="1" y2="0" stops={[['0', '#14532d'], ['0.3', '#15803d'], ['0.7', '#166534'], ['1', '#052e16']]} />
    </>
  );
}

/* ───────────── piezas pequeñas ───────────── */

// Sombra de contacto proyectada (abajo-derecha)
export const Shadow = ({ u, x, y, rx, ry, rot = 0, o = 1 }) => (
  <ellipse
    cx={0} cy={0} rx={rx} ry={ry} fill={u('shadow')} opacity={o}
    transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`}
  />
);

// Vesícula esférica con brillo
export const Vesicle = ({ u, x = 0, y = 0, r = 3, blue = false }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={u(blue ? 'vesicleBlue' : 'vesicle')} />
    <circle cx={x} cy={y} r={r} fill="none" stroke={blue ? '#1e3a8a' : '#0f5f58'} strokeWidth={0.5} opacity={0.8} />
    <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.32} fill="#fff" opacity={0.75} />
  </g>
);

// Chispa de ATP (para cart-spark)
export const Spark = ({ u, r = 1.2 }) => (
  <g>
    <circle r={r * 3.2} fill={u('sparkGlow')} />
    <circle r={r} fill="#fefce8" />
  </g>
);

// Destello puntual (cristal / superficie húmeda)
export const Glint = ({ u, x, y, size = 6, dur = 6, d = 0 }) => (
  <g transform={`translate(${x} ${y})`} pointerEvents="none">
    <A c="cart-twinkle" dur={dur} d={d}>
      <circle r={size * 0.9} fill={u('glow')} opacity={0.55} />
      <path
        d={`M0 ${-size}L${size * 0.16} ${-size * 0.16}L${size} 0L${size * 0.16} ${size * 0.16}L0 ${size}L${-size * 0.16} ${size * 0.16}L${-size} 0L${-size * 0.16} ${-size * 0.16}Z`}
        fill="#fff"
        opacity={0.9}
      />
    </A>
  </g>
);

/* ───────────── mitocondria ───────────── */

function mitoGeometry(len, w, seed) {
  const R = rng(seed);
  const L = len / 2;
  const H = w / 2;
  const inset = 2.9;
  const folds = Math.max(4, Math.round(len / 9));
  const cristae = [];
  for (let i = 0; i < folds; i++) {
    const x = -L + H * 0.75 + ((len - H * 1.5) * (i + 0.5)) / folds + (R() - 0.5) * 2;
    const top = i % 2 === 0;
    const edge = top ? -(H - inset) : H - inset;
    const depth = (2 * (H - inset)) * (0.58 + R() * 0.16);
    const tipY = top ? edge + depth : edge - depth;
    const wig = (R() - 0.5) * 4;
    cristae.push(`M${r2(x)} ${r2(edge)}Q${r2(x + wig)} ${r2((edge + tipY) / 2)} ${r2(x + wig * 0.4)} ${r2(tipY)}`);
  }
  const granules = [];
  for (let i = 0; i < Math.round(len / 4); i++) {
    granules.push([(R() - 0.5) * (len - H * 1.2), (R() - 0.5) * (w - 8), 0.45 + R() * 0.5]);
  }
  return { L, H, inset, cristae: cristae.join(''), granules: circlesPath(granules) };
}

export function Mitochondrion({ u, x, y, len, w, rot = 0, seed = 1, anim }) {
  const g = React.useMemo(() => mitoGeometry(len, w, seed), [len, w, seed]);
  const { L, H, inset } = g;
  const body = (
    <g>
      <rect x={-L} y={-H} width={len} height={w} rx={H} fill={u('mitoSkin')} />
      <rect x={-L} y={-H} width={len} height={w} rx={H} fill="none" stroke="#7c2d12" strokeWidth={0.9} opacity={0.75} />
      {/* espacio intermembrana */}
      <rect x={-L + 1.5} y={-H + 1.5} width={len - 3} height={w - 3} rx={H - 1.5} fill="#7c2d12" opacity={0.9} />
      {/* matriz + membrana interna */}
      <rect x={-L + inset} y={-H + inset} width={len - inset * 2} height={w - inset * 2} rx={H - inset} fill={u('mitoMatrix')} />
      <path d={g.granules} fill="#fff7d6" opacity={0.5} />
      <ellipse cx={L * 0.35} cy={1} rx={3.2} ry={2} fill="none" stroke="#fde68a" strokeWidth={0.55} opacity={0.6} />
      {/* crestas: pliegues de la membrana interna */}
      <path d={g.cristae} fill="none" stroke="#fde68a" strokeWidth={3} strokeLinecap="round" />
      <path d={g.cristae} fill="none" stroke="#9a3412" strokeWidth={1.05} strokeLinecap="round" opacity={0.85} />
      <rect x={-L + inset} y={-H + inset} width={len - inset * 2} height={w - inset * 2} rx={H - inset} fill="none" stroke="#fde68a" strokeWidth={1} opacity={0.9} />
      {/* volumen */}
      <rect x={-L} y={-H} width={len} height={w} rx={H} fill={u('capShade')} />
      <ellipse cx={-L * 0.22} cy={-H * 0.52} rx={L * 0.62} ry={H * 0.24} fill={u('gloss')} opacity={0.7} />
      <path d={`M${r2(-L + H)} ${r2(-H + 0.9)}L${r2(L - H)} ${r2(-H + 0.9)}`} stroke="#fff" strokeWidth={0.8} strokeLinecap="round" opacity={0.4} />
    </g>
  );
  return (
    <g>
      <Shadow u={u} x={x + 4} y={y + 6} rx={L + 4} ry={H + 3} rot={rot} o={0.95} />
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {anim ? <A c="cart-breathe" s={1.025} s2={0.97} {...anim}>{body}</A> : body}
      </g>
    </g>
  );
}

/* ───────────── núcleo ───────────── */

function nucleusGeometry(cx, cy, rx, ry, seed, pores) {
  const R = rng(seed);
  const inside = (x, y, k) => ((x - cx) / (rx * k)) ** 2 + ((y - cy) / (ry * k)) ** 2 < 1;
  const walk = (steps, k) => {
    let x = cx + (R() - 0.5) * rx * 1.2;
    let y = cy + (R() - 0.5) * ry * 1.2;
    let a = R() * Math.PI * 2;
    const pts = [];
    for (let i = 0; i < steps; i++) {
      pts.push([x, y]);
      a += (R() - 0.5) * 1.6;
      let nx = x + Math.cos(a) * 6;
      let ny = y + Math.sin(a) * 6;
      if (!inside(nx, ny, k)) {
        a = Math.atan2(cy - y, cx - x) + (R() - 0.5);
        nx = x + Math.cos(a) * 6;
        ny = y + Math.sin(a) * 6;
      }
      x = nx;
      y = ny;
    }
    return smoothPath(pts);
  };
  const size = Math.sqrt((rx * ry) / (90 * 76));
  const threadsA = Array.from({ length: Math.max(3, Math.round(9 * size)) }, () => walk(Math.round(16 * size), 0.86)).join('');
  const threadsB = Array.from({ length: Math.max(3, Math.round(8 * size)) }, () => walk(Math.round(13 * size), 0.82)).join('');
  const dots = [];
  for (let i = 0; i < Math.round(70 * size * size); i++) {
    const t = R() * Math.PI * 2;
    const k = Math.sqrt(R()) * 0.88;
    dots.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k, 0.5 + R() * 0.8]);
  }
  // heterocromatina pegada a la envoltura
  const hetero = [];
  for (let i = 0; i < 16; i++) {
    const t = (i / 16) * Math.PI * 2 + R() * 0.3;
    const k = 0.9 - R() * 0.05;
    hetero.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k, 4 + R() * 6, 2 + R() * 2.2, (t * 180) / Math.PI + 90]);
  }
  // poros: hueco que atraviesa la envoltura + complejo del poro
  const gaps = [];
  const beads = [];
  const rim = [];
  for (let i = 0; i < pores; i++) {
    const t = (i / pores) * Math.PI * 2 + 0.12 + (R() - 0.5) * 0.12;
    const px0 = cx + Math.cos(t) * (rx + 2.3);
    const py0 = cy + Math.sin(t) * (ry + 2.3);
    let nx = Math.cos(t) / rx;
    let ny = Math.sin(t) / ry;
    const nl = Math.hypot(nx, ny);
    nx /= nl;
    ny /= nl;
    const tx = -ny;
    const ty = nx;
    const hw = 1.7;
    const hl = 3.8;
    gaps.push(polyPath([
      [px0 + tx * hw + nx * hl, py0 + ty * hw + ny * hl],
      [px0 - tx * hw + nx * hl, py0 - ty * hw + ny * hl],
      [px0 - tx * hw - nx * hl, py0 - ty * hw - ny * hl],
      [px0 + tx * hw - nx * hl, py0 + ty * hw - ny * hl],
    ], true));
    beads.push([px0, py0, 0.95]);
    rim.push([px0 + tx * 2.4 + nx * 2.6, py0 + ty * 2.4 + ny * 2.6, 0.75]);
    rim.push([px0 - tx * 2.4 + nx * 2.6, py0 - ty * 2.4 + ny * 2.6, 0.75]);
  }
  return {
    threadsA, threadsB, dots: circlesPath(dots), hetero: ellipsesPath(hetero),
    gaps: gaps.join(''), beads: circlesPath(beads), rim: circlesPath(rim),
  };
}

export function NucleusBody({ u, cx, cy, rx, ry, seed = 7, pores = 18 }) {
  const g = React.useMemo(() => nucleusGeometry(cx, cy, rx, ry, seed, pores), [cx, cy, rx, ry, seed, pores]);
  return (
    <g>
      <ellipse cx={cx + 7} cy={cy + 11} rx={rx + 10} ry={ry + 7} fill={u('shadow')} />
      {/* envoltura nuclear: membrana externa, espacio perinuclear, membrana interna */}
      <ellipse cx={cx} cy={cy} rx={rx + 4.6} ry={ry + 4.6} fill={u('nucEnv')} />
      <ellipse cx={cx} cy={cy} rx={rx + 2.7} ry={ry + 2.7} fill="#1e0b4b" />
      <ellipse cx={cx} cy={cy} rx={rx + 1.5} ry={ry + 1.5} fill="#a78bfa" opacity={0.9} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={u('nucBody')} />
      {/* cromatina */}
      <path d={g.hetero} fill="#1e0b4b" opacity={0.5} />
      <path d={g.threadsA} fill="none" stroke="#8b5cf6" strokeWidth={2.6} strokeLinecap="round" opacity={0.32} />
      <path d={g.threadsA} fill="none" stroke="#c4b5fd" strokeWidth={0.7} strokeLinecap="round" opacity={0.25} />
      <path d={g.dots} fill="#ddd6fe" opacity={0.4} />
      <A c="cart-fade" dur={4.5} d={-1.3} lo={0.1} hi={0.6}>
        <path d={g.threadsB} fill="none" stroke="#a78bfa" strokeWidth={1.8} strokeLinecap="round" opacity={0.5} />
        <path d={g.threadsB} fill="none" stroke="#ede9fe" strokeWidth={0.5} strokeLinecap="round" opacity={0.45} />
      </A>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={u('sphereShade')} />
      {/* poros nucleares */}
      <path d={g.gaps} fill="#12062e" />
      <path d={g.rim} fill="#ddd6fe" opacity={0.85} />
      <path d={g.beads} fill="#f5d0fe" />
      {/* luz */}
      <ellipse cx={cx - rx * 0.3} cy={cy - ry * 0.48} rx={rx * 0.46} ry={ry * 0.22} fill={u('gloss')} opacity={0.42} />
      <path
        d={`M${r2(cx + rx * Math.cos(3.6))} ${r2(cy + ry * Math.sin(3.6))}A${rx} ${ry} 0 0 1 ${r2(cx + rx * Math.cos(4.5))} ${r2(cy + ry * Math.sin(4.5))}`}
        fill="none" stroke="#fff" strokeWidth={1.1} strokeLinecap="round" opacity={0.35}
      />
      <path
        d={`M${r2(cx + (rx - 3) * Math.cos(0.25))} ${r2(cy + (ry - 3) * Math.sin(0.25))}A${rx - 3} ${ry - 3} 0 0 1 ${r2(cx + (rx - 3) * Math.cos(1.25))} ${r2(cy + (ry - 3) * Math.sin(1.25))}`}
        fill="none" stroke="#c4b5fd" strokeWidth={1.4} strokeLinecap="round" opacity={0.3}
      />
    </g>
  );
}

function nucleolusGeometry(cx, cy, r, seed) {
  const R = rng(seed);
  const gran = [];
  for (let i = 0; i < 46; i++) {
    const t = R() * Math.PI * 2;
    const k = Math.sqrt(R()) * 0.9;
    gran.push([cx + Math.cos(t) * r * k, cy + Math.sin(t) * r * k, 0.45 + R() * 0.55]);
  }
  const fib = [];
  for (let i = 0; i < 5; i++) {
    const t = R() * Math.PI * 2;
    const k = R() * 0.55;
    fib.push([cx + Math.cos(t) * r * k, cy + Math.sin(t) * r * k, r * (0.16 + R() * 0.12)]);
  }
  return { gran: circlesPath(gran), fib: circlesPath(fib), fibRing: circlesPath(fib.map(([x, y, rr]) => [x, y, rr + 1.2])) };
}

export function Nucleolus({ u, cx, cy, r, seed = 3 }) {
  const g = React.useMemo(() => nucleolusGeometry(cx, cy, r, seed), [cx, cy, r, seed]);
  return (
    <g>
      <ellipse cx={cx + 3} cy={cy + 5} rx={r + 3} ry={r * 0.8} fill={u('shadow')} />
      <circle cx={cx} cy={cy} r={r} fill={u('nucleolus')} />
      <path d={g.fibRing} fill="#3b0764" opacity={0.55} />
      <path d={g.fib} fill="#f0abfc" opacity={0.45} />
      <path d={g.gran} fill="#f5f3ff" opacity={0.45} />
      <circle cx={cx} cy={cy} r={r} fill={u('sphereShade')} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2e1065" strokeWidth={0.8} opacity={0.7} />
      <ellipse cx={cx - r * 0.32} cy={cy - r * 0.42} rx={r * 0.42} ry={r * 0.24} fill={u('gloss')} opacity={0.75} />
    </g>
  );
}

/* ───────────── retículo endoplasmático rugoso ───────────── */

// Cisternas que abrazan la envoltura nuclear (elipse cx, cy, rx, ry).
// sheets = [{ d, a0, a1, th, wob, k, ph }] (ángulos en grados)
function rerGeometry(cx, cy, rx, ry, sheets) {
  const shapes = [];
  const lumen = [];
  const lit = [];
  const under = [];
  const ribos = [];
  const riboHi = [];
  const pt = (t, off) => [cx + (rx + off) * Math.cos(t), cy + (ry + off) * Math.sin(t)];
  for (const s of sheets) {
    const n = 60;
    const outer = [];
    const inner = [];
    const mid = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const t = ((s.a0 + (s.a1 - s.a0) * f) * Math.PI) / 180;
      const off = s.d + s.wob * Math.sin(t * s.k + s.ph);
      const th = s.th * (0.3 + 0.7 * Math.sqrt(Math.sin(Math.PI * f)));
      outer.push(pt(t, off + th / 2));
      inner.push(pt(t, off - th / 2));
      mid.push(pt(t, off));
      if (i % 2 === 0 && i > 1 && i < n - 1) {
        const o1 = pt(t, off + th / 2 + 1.35);
        const o2 = pt(t, off - th / 2 - 1.35);
        ribos.push([o1[0], o1[1], 1.3], [o2[0], o2[1], 1.2]);
        riboHi.push([o1[0] - 0.4, o1[1] - 0.45, 0.48], [o2[0] - 0.4, o2[1] - 0.45, 0.45]);
      }
    }
    shapes.push(polyPath([...outer, ...inner.reverse()], true));
    lumen.push(polyPath(mid.slice(3, -3)));
    lit.push(polyPath(outer.slice(4, -4)));
    under.push(polyPath(inner.slice(4, -4)));
  }
  return { shapes, lumen: lumen.join(''), lit: lit.join(''), under: under.join(''), ribos: circlesPath(ribos), riboHi: circlesPath(riboHi) };
}

export function RoughER({ u, cx, cy, rx, ry, sheets }) {
  const g = React.useMemo(() => rerGeometry(cx, cy, rx, ry, sheets), [cx, cy, rx, ry, sheets]);
  return (
    <g>
      <path d={g.shapes.join('')} fill="#010a1f" opacity={0.5} transform="translate(3 4.5)" />
      {g.shapes.map((d, i) => <path key={i} d={d} fill={u('rer')} />)}
      <path d={g.under} fill="none" stroke="#172554" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
      <path d={g.lumen} fill="none" stroke="#1e3a8a" strokeWidth={1.4} strokeLinecap="round" opacity={0.55} />
      <path d={g.lit} fill="none" stroke="#dbeafe" strokeWidth={0.7} strokeLinecap="round" opacity={0.55} />
      <path d={g.ribos} fill="#1d4ed8" transform="translate(0.5 0.8)" opacity={0.6} />
      <path d={g.ribos} fill="#7cb4fb" />
      <path d={g.riboHi} fill="#eff6ff" opacity={0.8} />
    </g>
  );
}

/* ───────────── retículo endoplasmático liso ───────────── */

// Red de túbulos que serpentean y se cruzan (cada uno proyecta sombra sobre
// los de debajo). tubes = [[[x, y], …], …]
function relGeometry(tubes, seed) {
  const R = rng(seed);
  return tubes.map((pts) => {
    const ph = R() * 6;
    const fr = 3 + R() * 3;
    const base = 4.2 + R() * 1.2;
    const t = tubeShape(pts, (f) => base * (0.82 + 0.28 * Math.sin(f * fr * Math.PI + ph)) * (0.55 + 0.45 * Math.min(1, Math.sin(Math.PI * f) * 4)));
    return {
      shape: smoothPath(t.outline, true),
      lit: polyPath(t.lit.slice(2, -2)),
      dark: polyPath(t.dark.slice(2, -2)),
      mid: polyPath(t.mid.slice(3, -3)),
      hit: polyPath(t.mid),
    };
  });
}

export function SmoothER({ u, tubes, seed = 41 }) {
  const g = React.useMemo(() => relGeometry(tubes, seed), [tubes, seed]);
  return (
    <g>
      {g.map((t, i) => <path key={`h${i}`} d={t.hit} fill="none" stroke="transparent" strokeWidth={14} strokeLinecap="round" />)}
      {g.map((t, i) => (
        <g key={i}>
          <path d={t.shape} fill="#011513" opacity={0.5} transform="translate(1.8 2.8)" />
          <path d={t.shape} fill={u('rel')} />
          <path d={t.shape} fill="none" stroke="#0b4f4a" strokeWidth={0.6} />
          <path d={t.mid} fill="none" stroke="#0f766e" strokeWidth={1.1} strokeLinecap="round" opacity={0.45} />
          <path d={t.dark} fill="none" stroke="#063b37" strokeWidth={0.9} strokeLinecap="round" opacity={0.7} />
          <path d={t.lit} fill="none" stroke="#ccfbf1" strokeWidth={0.75} strokeLinecap="round" opacity={0.75} />
        </g>
      ))}
    </g>
  );
}

/* ───────────── aparato de Golgi ───────────── */

function golgiGeometry(seed, scale) {
  const R = rng(seed);
  const halfs = [34, 38, 39, 37, 33, 27].map((h) => h * scale);
  const cis = [];
  halfs.forEach((L, i) => {
    const y0 = (16 - i * 6.6) * scale;
    const k = -9 * scale;
    const top = [];
    const bot = [];
    const mid = [];
    const n = 30;
    for (let j = 0; j <= n; j++) {
      const f = -1 + (2 * j) / n;
      const x = f * L;
      const y = y0 + k * f * f;
      const th = (3.5 + 3.8 * f ** 6) * scale;
      top.push([x, y - th / 2]);
      bot.push([x, y + th / 2]);
      mid.push([x, y]);
    }
    const capR = [L + 1.6 * scale, y0 + k];
    const capL = [-L - 1.6 * scale, y0 + k];
    const shape = smoothPath([capL, ...top, capR, ...bot.reverse()], true);
    cis.push({ shape, lumen: polyPath(mid.slice(4, -4)), lit: polyPath(top.slice(3, -3)), ends: [capL, capR] });
  });
  // vesículas: brotando de la cara trans y viajando desde el RE (cara cis)
  const buds = [];
  cis.slice(3).forEach((c, j) => {
    c.ends.forEach(([x, y], e) => buds.push([x + (e ? 2 : -2) * scale, y - 1.2 * scale, (1.9 + R() * 0.8) * scale]));
    if (j === 2) buds.push([(R() - 0.5) * 14 * scale, (16 - 5 * 6.6 - 4) * scale, 2.8 * scale]);
  });
  const free = [
    [-18, -29, 2.6], [8, -33, 2.1], [27, -28, 2.7], [44, -14, 2.2]
  ].map(([x, y, r]) => [x * scale, y * scale, r * scale]);
  const cisVes = [[-22, 27, 2.4], [-6, 30, 2.1], [14, 27.5, 2.3], [30, 22, 2]].map(([x, y, r]) => [x * scale, y * scale, r * scale]);
  return { cis, buds, free, cisVes };
}

export function Golgi({ u, x, y, rot = 0, scale = 1, seed = 11 }) {
  const g = React.useMemo(() => golgiGeometry(seed, scale), [seed, scale]);
  const ves = (list, blue) => (
    <>
      <path d={circlesPath(list.map(([vx, vy, r]) => [vx + 1, vy + 1.6, r + 0.4]))} fill="#011513" opacity={0.45} />
      <path d={circlesPath(list)} fill={u(blue ? 'vesicleBlue' : 'vesicle')} />
      <path d={circlesPath(list)} fill="none" stroke={blue ? '#1e3a8a' : '#0b4f4a'} strokeWidth={0.5} />
      <path d={circlesPath(list.map(([vx, vy, r]) => [vx - r * 0.35, vy - r * 0.4, r * 0.32]))} fill="#fff" opacity={0.8} />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse cx={4} cy={9} rx={50 * scale} ry={30 * scale} fill={u('shadow')} />
      {ves(g.cisVes, true)}
      {[...g.cis].reverse().map((c, i) => (
        <g key={i}>
          <path d={c.shape} fill="#011513" opacity={0.5} transform={`translate(${1.2 * scale} ${2.4 * scale})`} />
          <path d={c.shape} fill={u('golgi')} />
          <path d={c.shape} fill="none" stroke="#0b4f4a" strokeWidth={0.6} />
          <path d={c.lumen} fill="none" stroke="#0b4f4a" strokeWidth={1.1} strokeLinecap="round" opacity={0.6} />
          <path d={c.lit} fill="none" stroke="#ccfbf1" strokeWidth={0.65} strokeLinecap="round" opacity={0.6} />
        </g>
      ))}
      {ves(g.buds)}
      {ves(g.free)}
    </g>
  );
}

/* ───────────── lisosoma ───────────── */

function lysoGeometry(r, seed) {
  const R = rng(seed);
  const enz = [];
  for (let i = 0; i < Math.round(r * 2.4); i++) {
    const t = R() * Math.PI * 2;
    const k = Math.sqrt(R()) * 0.72;
    enz.push([Math.cos(t) * r * k, Math.sin(t) * r * k, 0.45 + R() * 0.6]);
  }
  const debris = [];
  for (let i = 0; i < 3; i++) {
    const t = R() * Math.PI * 2;
    const k = R() * 0.45;
    debris.push([Math.cos(t) * r * k, Math.sin(t) * r * k, r * (0.12 + R() * 0.1), r * (0.08 + R() * 0.06), R() * 180]);
  }
  const pumps = [];
  for (let i = 0; i < 9; i++) {
    const t = (i / 9) * Math.PI * 2 + R() * 0.3;
    pumps.push([Math.cos(t) * (r - 0.3), Math.sin(t) * (r - 0.3), 0.9]);
  }
  return { enz: circlesPath(enz), debris: ellipsesPath(debris), pumps: circlesPath(pumps) };
}

export function Lysosome({ u, x, y, r, seed = 5, spin = 40, d = 0 }) {
  const g = React.useMemo(() => lysoGeometry(r, seed), [r, seed]);
  return (
    <g>
      <ellipse cx={x + 3} cy={y + r * 0.55} rx={r + 3} ry={r * 0.7} fill={u('shadow')} />
      <g transform={`translate(${x} ${y})`}>
        <A c="cart-bob" dur={4.6} d={d} dy={-1.6}>
          <circle r={r + 1.2} fill="#881337" />
          <circle r={r} fill={u('lyso')} />
          <A c="cart-spin" dur={spin} d={d}>
            <path d={g.debris} fill="#4c0519" opacity={0.45} />
            <path d={g.enz} fill="#fecdd3" opacity={0.5} />
          </A>
          <circle r={r} fill={u('sphereShade')} />
          <path d={g.pumps} fill="#fda4af" opacity={0.9} />
          <ellipse cx={-r * 0.32} cy={-r * 0.42} rx={r * 0.46} ry={r * 0.26} fill={u('gloss')} opacity={0.85} />
          <circle cx={-r * 0.42} cy={-r * 0.5} r={Math.max(0.8, r * 0.09)} fill="#fff" opacity={0.9} />
        </A>
      </g>
    </g>
  );
}

/* ───────────── centrosoma ───────────── */

function centroGeometry() {
  const trip = [];
  for (let k = 0; k < 9; k++) {
    const t = (k / 9) * Math.PI * 2;
    for (let j = 0; j < 3; j++) {
      const rr = 3.3 + (j - 1) * 0.15;
      const a = t + (j - 1) * 0.2;
      trip.push([Math.cos(a) * rr * 1.08 + (j - 1) * Math.cos(t + 1.2) * 0.75, Math.sin(a) * rr + (j - 1) * Math.sin(t + 1.2) * 0.75, 0.58]);
    }
  }
  const sideLines = segsPath([-3.2, -1.6, 0, 1.6, 3.2].map((yy) => [-10.5, yy, 10.5, yy]));
  const aster = [];
  for (let i = 0; i < 18; i++) {
    const t = (i / 18) * Math.PI * 2 + (i % 2) * 0.1;
    const r1 = 13;
    const r2_ = 24 + (i % 3) * 5;
    aster.push([Math.cos(t) * r1, Math.sin(t) * r1, Math.cos(t) * r2_, Math.sin(t) * r2_]);
  }
  return { trip: circlesPath(trip), sideLines, aster: segsPath(aster) };
}
const CENTRO = centroGeometry();

export function Centrosome({ u, x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <A c="cart-breathe" dur={4} s={1.12} s2={1.12}>
        <circle r={30} fill={u('pcm')} />
      </A>
      <A c="cart-fade" dur={3.6} lo={0.35} hi={0.9}>
        <path d={CENTRO.aster} stroke="#f5d0fe" strokeWidth={0.7} strokeLinecap="round" opacity={0.6} />
      </A>
      <ellipse cx={4} cy={8} rx={22} ry={11} fill={u('shadow')} />
      {/* centriolo de lado (cilindro) */}
      <g transform="translate(-6 4) rotate(-14)">
        <rect x={-11} y={-4.8} width={22} height={9.6} rx={1.6} fill={u('centro')} />
        <path d={CENTRO.sideLines} stroke="#701a75" strokeWidth={0.6} opacity={0.7} transform="translate(0 0.5)" />
        <path d={CENTRO.sideLines} stroke="#fae8ff" strokeWidth={0.45} opacity={0.6} />
        <ellipse cx={11} cy={0} rx={2.4} ry={4.8} fill="#86198f" />
        <ellipse cx={11} cy={0} rx={1.4} ry={3.2} fill="#3b0764" />
        <rect x={-10} y={-4} width={19} height={1.5} rx={0.7} fill="#fff" opacity={0.45} />
      </g>
      {/* centriolo perpendicular (visto desde arriba: 9 tripletes) */}
      <g transform="translate(7 -6)">
        <rect x={-5.6} y={-1} width={11.2} height={11} rx={1.4} fill={u('centro')} />
        <ellipse cx={0} cy={10} rx={5.6} ry={2.6} fill="#701a75" />
        <ellipse cx={0} cy={-1} rx={5.9} ry={5.4} fill="#f0abfc" />
        <ellipse cx={0} cy={-1} rx={4.9} ry={4.5} fill="#4a044e" />
        <path d={CENTRO.trip} fill="#f5d0fe" transform="translate(0 -1)" />
        <ellipse cx={-2.2} cy={-4.2} rx={2.4} ry={1.1} fill="#fff" opacity={0.35} />
      </g>
    </g>
  );
}

/* ───────────── ribosomas libres (polisomas) ───────────── */

// polys = [{ pts: [[x, y], …], n }] — ribosomas repartidos sobre el ARNm
export function ribosomeGeometry(polys, singles = []) {
  const big = [];
  const small = [];
  const hi = [];
  const mrna = [];
  const hits = [];
  const place = (x, y, a) => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    big.push([x - s * 1.1, y + c * 1.1, 2.3, 1.75, (a * 180) / Math.PI]);
    small.push([x + s * 1.2, y - c * 1.2, 1.7, 1.15, (a * 180) / Math.PI]);
    hi.push([x + s * 1.3 - 0.6, y - c * 1.3 - 0.4, 0.5]);
  };
  for (const p of polys) {
    mrna.push(smoothPath(p.pts));
    const segs = [];
    let total = 0;
    for (let i = 0; i < p.pts.length - 1; i++) {
      const L = Math.hypot(p.pts[i + 1][0] - p.pts[i][0], p.pts[i + 1][1] - p.pts[i][1]);
      segs.push(L);
      total += L;
    }
    for (let k = 0; k < p.n; k++) {
      let target = ((k + 0.5) / p.n) * total;
      let i = 0;
      while (i < segs.length - 1 && target > segs[i]) { target -= segs[i]; i++; }
      const a0 = p.pts[i];
      const b0 = p.pts[i + 1];
      const f = target / segs[i];
      place(a0[0] + (b0[0] - a0[0]) * f, a0[1] + (b0[1] - a0[1]) * f, Math.atan2(b0[1] - a0[1], b0[0] - a0[0]));
    }
    const xs = p.pts.map((q) => q[0]);
    const ys = p.pts.map((q) => q[1]);
    hits.push([(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2,
      Math.max(11, (Math.max(...xs) - Math.min(...xs)) / 2 + 6, (Math.max(...ys) - Math.min(...ys)) / 2 + 6)]);
  }
  for (const [x, y, a] of singles) {
    place(x, y, a);
    hits.push([x, y, 10]);
  }
  return {
    big: ellipsesPath(big), small: ellipsesPath(small), hi: circlesPath(hi), mrna: mrna.join(''),
    hits: circlesPath(hits.map(([x, y, r]) => [x, y, r])),
  };
}

export function Ribosomes({ geo }) {
  return (
    <g>
      <path d={geo.hits} fill="transparent" />
      <path d={geo.mrna} fill="none" stroke="#f9a8d4" strokeWidth={0.6} strokeLinecap="round" opacity={0.7} />
      <path d={geo.big} fill="#020617" opacity={0.45} transform="translate(0.9 1.4)" />
      <path d={geo.big} fill="#2563eb" />
      <path d={geo.small} fill="#93c5fd" />
      <path d={geo.hi} fill="#eff6ff" opacity={0.85} />
    </g>
  );
}

/* ───────────── bicapa lipídica ───────────── */

// samples: curva remuestreada (geom.resampleClosed) con normal hacia fuera.
// Devuelve trozos (cada uno con cabezas, brillos y colas) para que el pintado
// parcial no tenga que recorrer todo el contorno.
export function bilayerGeometry(samples, { half = 3.3, head = 1.35, pieces = 18 } = {}) {
  return chunk(samples, (p) => p.s, pieces).map((list) => {
    const heads = [];
    const headHi = [];
    const tails = [];
    for (const p of list) {
      for (const sgn of [1, -1]) {
        const hx = p.x + p.nx * half * sgn;
        const hy = p.y + p.ny * half * sgn;
        heads.push([hx, hy, head]);
        headHi.push([hx - head * 0.3, hy - head * 0.35, head * 0.4]);
        const t0 = half - head * 0.9;
        const t1 = 0.35;
        for (const lat of [-0.55, 0.55]) {
          tails.push([
            p.x + p.nx * t0 * sgn + p.tx * lat, p.y + p.ny * t0 * sgn + p.ty * lat,
            p.x + p.nx * t1 * sgn + p.tx * lat * 0.8, p.y + p.ny * t1 * sgn + p.ty * lat * 0.8,
          ]);
        }
      }
    }
    return { heads: circlesPath(heads), headHi: circlesPath(headHi), tails: segsPath(tails) };
  });
}

export function Bilayer({ geo, head, hi = '#ffffff', tail, hiOpacity = 0.6, tailOpacity = 0.6, tailWidth = 0.42 }) {
  return (
    <g>
      {geo.map((c, i) => <path key={`t${i}`} d={c.tails} stroke={tail} strokeWidth={tailWidth} opacity={tailOpacity} />)}
      {geo.map((c, i) => <path key={`h${i}`} d={c.heads} fill={head} />)}
      {geo.map((c, i) => <path key={`i${i}`} d={c.headHi} fill={hi} opacity={hiOpacity} />)}
    </g>
  );
}

/* ───────────── cloroplasto ───────────── */

function chloroGeometry(len, w, seed) {
  const R = rng(seed);
  const L = len / 2;
  const H = w / 2;
  const n = Math.max(3, Math.round(len / 13));
  const coins = [];
  const coinHi = [];
  const lam = [];
  const centers = [];
  for (let i = 0; i < n; i++) {
    const x = -L * 0.72 + ((L * 1.44) * i) / (n - 1) + (R() - 0.5) * 2.5;
    const span = H * Math.sqrt(Math.max(0, 1 - (x / L) ** 2));
    const stack = Math.max(3, Math.min(8, Math.floor((span * 1.35) / 2.35)));
    const cw = 8.5 + R() * 2;
    const yy = (R() - 0.5) * 3;
    centers.push([x, yy]);
    for (let k = 0; k < stack; k++) {
      const cy = yy + (k - (stack - 1) / 2) * 2.35;
      coins.push(`M${r2(x - cw / 2 + 0.9)} ${r2(cy - 0.95)}h${r2(cw - 1.8)}a0.9 0.95 0 0 1 0 1.9h${r2(-(cw - 1.8))}a0.9 0.95 0 0 1 0 -1.9Z`);
      coinHi.push([x - cw / 2 + 1, cy - 0.75, x + cw / 2 - 1, cy - 0.75]);
    }
  }
  for (let i = 0; i < centers.length - 1; i++) {
    const [x1, y1] = centers[i];
    const [x2, y2] = centers[i + 1];
    lam.push(`M${r2(x1)} ${r2(y1 - 1.5)}Q${r2((x1 + x2) / 2)} ${r2((y1 + y2) / 2 - 4)} ${r2(x2)} ${r2(y2 - 1.2)}`);
    lam.push(`M${r2(x1)} ${r2(y1 + 2)}Q${r2((x1 + x2) / 2)} ${r2((y1 + y2) / 2 + 4.5)} ${r2(x2)} ${r2(y2 + 1.6)}`);
  }
  const globs = [];
  for (let i = 0; i < 6; i++) globs.push([(R() - 0.5) * len * 0.75, (R() - 0.5) * w * 0.55, 0.6 + R() * 0.6]);
  return {
    L, H, coins: coins.join(''), coinHi: segsPath(coinHi), lam: lam.join(''), globs: circlesPath(globs),
    starch: [L * 0.42 * (R() > 0.5 ? 1 : -1), H * 0.35],
  };
}

export function Chloroplast({ u, x, y, len, w, rot = 0, seed = 21 }) {
  const g = React.useMemo(() => chloroGeometry(len, w, seed), [len, w, seed]);
  const { L, H } = g;
  return (
    <g>
      <Shadow u={u} x={x + 4} y={y + 6} rx={L + 4} ry={H + 3} rot={rot} />
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {/* doble membrana */}
        <ellipse rx={L} ry={H} fill={u('chloroEnv')} />
        <ellipse rx={L - 1.4} ry={H - 1.4} fill="#14532d" />
        <ellipse rx={L - 2.3} ry={H - 2.3} fill={u('stroma')} />
        {/* lamelas del estroma, grana (pilas de tilacoides), almidón y plastoglóbulos */}
        <path d={g.lam} fill="none" stroke="#14532d" strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />
        <path d={g.lam} fill="none" stroke="#bbf7d0" strokeWidth={0.6} strokeLinecap="round" opacity={0.55} />
        <path d={g.coins} fill="#052e16" opacity={0.5} transform="translate(0.6 0.9)" />
        <path d={g.coins} fill={u('granum')} />
        <path d={g.coinHi} stroke="#86efac" strokeWidth={0.45} opacity={0.85} />
        <ellipse cx={g.starch[0]} cy={g.starch[1]} rx={3.6} ry={2.4} fill="#fef9c3" opacity={0.75} />
        <ellipse cx={g.starch[0] - 0.8} cy={g.starch[1] - 0.8} rx={1.4} ry={0.8} fill="#fff" opacity={0.7} />
        <path d={g.globs} fill="#facc15" opacity={0.7} />
        {/* volumen */}
        <ellipse rx={L} ry={H} fill={u('sphereShade')} opacity={0.8} />
        <ellipse cx={-L * 0.25} cy={-H * 0.5} rx={L * 0.55} ry={H * 0.24} fill={u('gloss')} opacity={0.6} />
        <ellipse rx={L} ry={H} fill="none" stroke="#052e16" strokeWidth={0.8} opacity={0.7} />
      </g>
    </g>
  );
}
