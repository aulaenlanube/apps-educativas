// Ilustración de La Célula Vegetal (dibujo 600×500). Capas, de atrás adelante:
// citoplasma → pared celular (microfibrillas de celulosa cruzadas,
// plasmodesmos) → membrana plasmática (bicapa pegada a la pared) → vacuola
// central (tonoplasto, líquido translúcido) → REL → RER (abraza el núcleo y
// se mete bajo la vacuola) → núcleo → nucléolo → Golgi → cloroplastos
// (ciclosis) → mitocondrias → ribosomas → vida (sin eventos de puntero).
// Contrato con CelulaVegetal.jsx: mismas props que el antiguo CellDiagram y un
// <g className="organelle-region …"> por orgánulo.
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import {
  rng, r2, circlesPath, segsPath, polyPath, smoothPath, blobPts, roundRectPts, resampleClosed, offsetPts,
  at, deg, tiles,
} from './geom';
import {
  A, Travel, CommonDefs, Vesicle, Spark, Glint, Mitochondrion, NucleusBody, Nucleolus, RoughER, SmoothER,
  Golgi, Chloroplast, Ribosomes, ribosomeGeometry, bilayerGeometry, Bilayer,
} from './parts';

const SVG_W = 600;
const SVG_H = 500;

/* ───────────── geometría (una vez) ───────────── */

const WALL_OUT = { x: 48, y: 48, w: 504, h: 404, r: 42 };
const WALL_IN = { x: 63, y: 63, w: 474, h: 374, r: 30 };
const rrPath = ({ x, y, w, h, r }) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const inRR = (px, py, { x, y, w, h, r }) => {
  if (px < x || px > x + w || py < y || py > y + h) return false;
  const cx = Math.max(x + r, Math.min(x + w - r, px));
  const cy = Math.max(y + r, Math.min(y + h - r, py));
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};
const inWall = (x, y) => inRR(x, y, WALL_OUT) && !inRR(x, y, WALL_IN);

// microfibrillas de celulosa: dos capas cruzadas, recortadas a la banda
const wallFibres = (() => {
  const out = [[], []];
  [35, -35].forEach((a, layer) => {
    const t = (a * Math.PI) / 180;
    const dx = Math.cos(t);
    const dy = Math.sin(t);
    const nx = -dy;
    const ny = dx;
    for (let k = -420; k <= 420; k += 3.1) {
      const ox = 300 + nx * k;
      const oy = 250 + ny * k;
      let start = null;
      for (let s = -420; s <= 420; s += 1) {
        const x = ox + dx * s;
        const y = oy + dy * s;
        const inside = inWall(x, y);
        if (inside && start === null) start = s;
        if ((!inside || s === 420) && start !== null) {
          if (s - start > 1.5) out[layer].push([ox + dx * start, oy + dy * start, ox + dx * (s - 1), oy + dy * (s - 1)]);
          start = null;
        }
      }
    }
  });
  const R = rng(5);
  const speck = [];
  while (speck.length < 260) {
    const x = 48 + R() * 504;
    const y = 48 + R() * 404;
    if (inWall(x, y)) speck.push([x, y, 0.4 + R() * 0.5]);
  }
  const mid = ([a, b, c, d]) => [(a + c) / 2, (b + d) / 2];
  return {
    a: tiles(out[0], 130, (s) => mid(s)[0], (s) => mid(s)[1]).map(segsPath),
    b: tiles(out[1], 130, (s) => mid(s)[0], (s) => mid(s)[1]).map(segsPath),
    speck: tiles(speck, 160).map(circlesPath),
  };
})();

// plasmodesmos: canales que atraviesan la pared [x, y, horizontal?]
const PLASMO = [
  ...[150, 250, 350, 450].flatMap((x) => [[x, 55.5, false], [x, 444.5, false]]),
  ...[150, 250, 350].flatMap((y) => [[55.5, y, true], [544.5, y, true]]),
];

// membrana plasmática pegada a la pared (la vacuola la empuja: turgencia)
const MEM_PTS = roundRectPts(67.4, 67.4, 465.2, 365.2, 26.5, 1.5);
const MEM = resampleClosed(MEM_PTS, 4.3);
const MEM_FINE = resampleClosed(MEM_PTS, 2.5);
const BILAYER = bilayerGeometry(MEM, { pieces: 18 });
const MEM_MID = polyPath(offsetPts(MEM_FINE, 0), true);
const MEM_CORE = polyPath(offsetPts(MEM_FINE, 4.7), true) + polyPath(offsetPts(MEM_FINE, -4.7), true);
const CYTO = rrPath({ x: 63, y: 63, w: 474, h: 374, r: 30 });
const PROTEINS = [0.03, 0.09, 0.16, 0.24, 0.31, 0.37, 0.45, 0.53, 0.6, 0.66, 0.73, 0.8, 0.87, 0.94].map((s, i) => {
  const p = at(MEM, s);
  return { x: p.x, y: p.y, rot: deg(p.ny, -p.nx), col: ['a', 'b', 'c'][i % 3], channel: i % 3 === 1, anim: i % 3 === 0 };
});

// vacuola central
const VAC = blobPts(338, 250, 130, 128, 480, [[2, 0.035, 0.4], [3, 0.03, 1.3], [4, 0.018, 2.4], [6, 0.008, 0.2]]);
const VAC_S = resampleClosed(VAC, 2.8);
const VAC_PATH = polyPath(VAC.filter((_, i) => i % 2 === 0), true);
const TONO = bilayerGeometry(VAC_S, { half: 1.9, head: 0.85, pieces: 12 });
const VAC_LIT = (() => {
  const arc = VAC.filter((p, i) => i % 4 === 0 && p[0] < 330 && p[1] < 236).map(([x, y]) => [x + (338 - x) * 0.06, y + (250 - y) * 0.06]);
  arc.sort((p, q) => Math.atan2(p[1] - 250, p[0] - 338) - Math.atan2(q[1] - 250, q[0] - 338));
  return smoothPath(arc);
})();
const VAC_CAUSTIC = (() => {
  const arc = VAC.filter((p, i) => i % 4 === 0 && p[0] > 300 && p[1] > 300).map(([x, y]) => [x + (338 - x) * 0.07, y + (250 - y) * 0.07]);
  arc.sort((p, q) => Math.atan2(q[1] - 250, q[0] - 338) - Math.atan2(p[1] - 250, p[0] - 338));
  return smoothPath(arc);
})();
const vacSolutes = (() => {
  const R = rng(77);
  const pts = [];
  for (let i = 0; i < 70; i++) {
    const t = R() * Math.PI * 2;
    const k = Math.sqrt(R()) * 0.85;
    pts.push([338 + Math.cos(t) * 125 * k, 250 + Math.sin(t) * 122 * k, 0.4 + R() * 0.7]);
  }
  return tiles(pts, 90).map(circlesPath);
})();

// citosol
const insideCyto = (x, y) => inRR(x, y, { x: 76, y: 76, w: 448, h: 348, r: 20 });
const insideVac = (x, y) => ((x - 338) / 136) ** 2 + ((y - 250) / 134) ** 2 < 1;
const cytosol = (() => {
  const R = rng(55);
  const fine = [];
  while (fine.length < 220) {
    const x = 76 + R() * 448;
    const y = 76 + R() * 348;
    if (insideCyto(x, y) && !insideVac(x, y)) fine.push([x, y, 0.45 + R() * 0.7]);
  }
  return { fine: tiles(fine, 110).map(circlesPath) };
})();

// núcleo desplazado por la vacuola + retículos
const NUC = { cx: 148, cy: 182, rx: 50, ry: 47 };
const NUCLEOLUS = { cx: 157, cy: 193, r: 13.5 };
const RER_SHEETS = [
  { d: 9, a0: 18, a1: 160, th: 5.6, wob: 1.8, k: 6, ph: 0.3 },
  { d: 19.5, a0: 24, a1: 150, th: 5.4, wob: 2.2, k: 7, ph: 2 },
  { d: 30, a0: 30, a1: 142, th: 5.2, wob: 2, k: 6, ph: 3.4 },
];
const RER_HIT = RER_SHEETS.map((s) => {
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const t = ((s.a0 + ((s.a1 - s.a0) * i) / 18) * Math.PI) / 180;
    pts.push([NUC.cx + (NUC.rx + s.d) * Math.cos(t), NUC.cy + (NUC.ry + s.d) * Math.sin(t)]);
  }
  return polyPath(pts);
}).join('');
const REL_TUBES = [
  [[88, 262], [100, 276], [118, 272], [136, 284], [156, 278], [176, 290], [196, 286]],
  [[96, 300], [114, 292], [128, 304], [148, 300], [166, 312], [186, 306]],
  [[118, 272], [122, 290], [114, 292]],
  [[156, 278], [152, 294], [148, 300]],
  [[128, 304], [126, 322], [142, 330], [162, 326]],
  [[176, 290], [182, 304], [186, 306]],
];

const CHLOROS = [
  { x: 216, y: 97, len: 52, w: 26, rot: 6, seed: 21, dx: 5, dy: 0.5 },
  { x: 305, y: 95, len: 62, w: 30, rot: -5, seed: 22, dx: 6, dy: -0.5 },
  { x: 460, y: 106, len: 54, w: 27, rot: 28, seed: 23, dx: 4, dy: 3 },
  { x: 500, y: 198, len: 58, w: 28, rot: 82, seed: 24, dx: 0.5, dy: 6 },
  { x: 497, y: 332, len: 58, w: 28, rot: 100, seed: 25, dx: -0.8, dy: 6 },
  { x: 422, y: 405, len: 60, w: 29, rot: 4, seed: 26, dx: -6, dy: 0 },
  { x: 128, y: 370, len: 58, w: 28, rot: -18, seed: 27, dx: -3, dy: -4 },
];
const MITOS = [
  { x: 389, y: 91, len: 44, w: 20, rot: 8, seed: 31, d: -1 },
  { x: 258, y: 404, len: 48, w: 21, rot: -6, seed: 32, d: -2.6 },
  { x: 506, y: 263, len: 40, w: 18, rot: 94, seed: 33, d: -3.8 },
];
const GOLGI = { x: 336, y: 402, rot: 0, scale: 0.78 };

const RIBO = ribosomeGeometry([
  { pts: [[214, 330], [228, 342], [236, 358], [234, 374]], n: 6 },
  { pts: [[84, 130], [88, 146], [86, 162]], n: 3 },
  { pts: [[350, 76], [362, 80], [372, 76]], n: 3 },
  { pts: [[520, 132], [524, 148], [522, 162]], n: 3 },
  { pts: [[190, 400], [204, 410], [220, 408]], n: 3 },
  { pts: [[468, 410], [480, 402], [494, 404]], n: 3 },
], [
  [200, 250, 0.6], [92, 236, 1.2], [210, 130, 2], [470, 260, 1.4], [92, 340, 0.4], [180, 352, 2.2],
  [254, 76, 0.3], [520, 400, 1.1], [432, 76, 1.8],
]);

/* ───────────── piezas propias ───────────── */

function Protein({ u, col, channel }) {
  const fill = u(`prot${col.toUpperCase()}`);
  if (channel) {
    return (
      <g>
        <ellipse cx={-2.8} cy={0.3} rx={2.6} ry={6.6} fill={fill} />
        <ellipse cx={2.8} cy={0.3} rx={2.6} ry={6.6} fill={fill} />
        <rect x={-0.85} y={-5} width={1.7} height={10.6} rx={0.85} fill="#130d02" opacity={0.85} />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={0} cy={0.5} rx={4.1} ry={6.8} fill={fill} />
      <ellipse cx={-1.3} cy={3} rx={1.4} ry={2.4} fill="#fff" opacity={0.42} />
    </g>
  );
}

function Plasmodesma({ x, y, horizontal }) {
  const t = horizontal ? '' : 'rotate(90)';
  return (
    <g transform={`translate(${x} ${y}) ${t}`}>
      <rect x={-9.5} y={-2.1} width={19} height={4.2} rx={1.6} fill="#0b1f05" />
      <path d="M-9.5 -1.6H9.5M-9.5 1.6H9.5" stroke="#facc15" strokeWidth={0.6} opacity={0.8} />
      <path d="M-10 0H10" stroke="#bef264" strokeWidth={0.7} strokeDasharray="1.4 1" opacity={0.75} />
    </g>
  );
}

/* ───────────── dibujo ───────────── */

export default function PlantCellDiagram({ selectedId, onSelect, isQuizMode, feedbackState, viewBox }) {
  const [id, u] = useArtIds();
  const getRegionClass = (oid) => {
    if (!isQuizMode) return selectedId === oid ? 'active' : '';
    if (feedbackState && feedbackState.id === oid) return feedbackState.isCorrect ? 'correct' : 'incorrect';
    return '';
  };
  const region = (oid) => ({
    className: `organelle-region ${getRegionClass(oid)}`,
    onClick: (e) => { e.stopPropagation(); onSelect(oid); },
  });

  return (
    <svg className="cart-svg" viewBox={viewBox || `0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <CommonDefs id={id} />
        <radialGradient id={id('cyto')} cx="40%" cy="45%" r="65%">
          <stop offset="0" stopColor="#1f4a2c" />
          <stop offset="0.5" stopColor="#163a22" />
          <stop offset="0.85" stopColor="#0f2a19" />
          <stop offset="1" stopColor="#0a1f12" />
        </radialGradient>
        <linearGradient id={id('cytoRim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bbf7d0" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#bbf7d0" stopOpacity="0" />
          <stop offset="1" stopColor="#020c06" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={id('wall')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a3e635" />
          <stop offset="0.35" stopColor="#65a30d" />
          <stop offset="0.75" stopColor="#3f6212" />
          <stop offset="1" stopColor="#1f3308" />
        </linearGradient>
        <linearGradient id={id('wallEdge')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fee7" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#f7fee7" stopOpacity="0.05" />
          <stop offset="1" stopColor="#0b1a03" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={id('vac')} cx="44%" cy="40%" r="62%">
          <stop offset="0" stopColor="#a5f3fc" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#22d3ee" stopOpacity="0.36" />
          <stop offset="0.85" stopColor="#0e7490" stopOpacity="0.5" />
          <stop offset="1" stopColor="#164e63" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id={id('vacDepth')} cx="64%" cy="70%" r="60%">
          <stop offset="0" stopColor="#083344" stopOpacity="0" />
          <stop offset="0.6" stopColor="#083344" stopOpacity="0.08" />
          <stop offset="1" stopColor="#083344" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={id('protA')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.45" stopColor="#eab308" />
          <stop offset="1" stopColor="#713f12" />
        </radialGradient>
        <radialGradient id={id('protB')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fae8ff" />
          <stop offset="0.45" stopColor="#c026d3" />
          <stop offset="1" stopColor="#581c87" />
        </radialGradient>
        <radialGradient id={id('protC')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="0.45" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
      </defs>

      {/* sombra de la célula sobre la platina */}
      <g pointerEvents="none">
        <rect x={58} y={62} width={504} height={404} rx={44} fill={u('shadow')} opacity={0.65} />
      </g>

      {/* === CITOPLASMA === */}
      <g {...region('citoplasma')}>
        <path d={CYTO} fill={u('cyto')} />
        {cytosol.fine.map((d, i) => <path key={i} d={d} fill="#bbf7d0" opacity={0.2} />)}
        <path d={CYTO} fill={u('cytoRim')} />
      </g>

      {/* === PARED CELULAR === */}
      <g {...region('pared-celular')}>
        <path d={rrPath(WALL_OUT) + rrPath(WALL_IN)} fillRule="evenodd" fill={u('wall')} />
        {wallFibres.a.map((d, i) => <path key={`a${i}`} d={d} stroke="#ecfccb" strokeWidth={0.55} opacity={0.22} />)}
        {wallFibres.b.map((d, i) => <path key={`b${i}`} d={d} stroke="#1a2e05" strokeWidth={0.7} opacity={0.32} />)}
        {wallFibres.speck.map((d, i) => <path key={`s${i}`} d={d} fill="#d9f99d" opacity={0.3} />)}
        <path d={rrPath(WALL_OUT)} fill="none" stroke="#1a2e05" strokeWidth={1.6} />
        <path d={rrPath({ x: 49.5, y: 49.5, w: 501, h: 401, r: 40.5 })} fill="none" stroke={u('wallEdge')} strokeWidth={1.2} />
        <path d={rrPath({ x: 63.6, y: 63.6, w: 472.8, h: 372.8, r: 29.4 })} fill="none" stroke="#d9f99d" strokeWidth={0.8} opacity={0.35} />
        {PLASMO.map(([x, y, h]) => <Plasmodesma key={`${x}-${y}`} x={x} y={y} horizontal={h} />)}
      </g>

      {/* === MEMBRANA PLASMÁTICA === */}
      <g {...region('membrana')}>
        <path d={MEM_MID} fill="none" stroke="transparent" strokeWidth={14} />
        <path d={MEM_CORE} fillRule="evenodd" fill="#3a2a05" />
        <Bilayer geo={BILAYER} head="#facc15" hi="#fefce8" tail="#fde68a" />
        {PROTEINS.map((p, i) => (
          <g key={i} transform={`translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(p.rot)})`}>
            {p.anim
              ? <A c="cart-bob" dur={3.4 + (i % 4) * 0.6} d={-i * 0.8} dy={1.2}><Protein u={u} col={p.col} channel={p.channel} /></A>
              : <Protein u={u} col={p.col} channel={p.channel} />}
          </g>
        ))}
      </g>

      {/* === VACUOLA CENTRAL === */}
      <g {...region('vacuola')}>
        <path d={VAC_PATH} fill="#020c06" opacity={0.45} transform="translate(6 9)" />
        <path d={VAC_PATH} fill={u('vac')} />
        {vacSolutes.map((d, i) => <path key={i} d={d} fill="#e0f2fe" opacity={0.28} />)}
        <path d="M300 300l3 -5l3 5l-3 5Z M384 196l2.2 -3.8l2.2 3.8l-2.2 3.8Z M262 214l1.8 -3l1.8 3l-1.8 3Z" fill="#f0f9ff" opacity={0.55} />
        <g transform="translate(372 300)"><A c="cart-ripple" dur={7} d={-1} hi={0.55}><ellipse rx={34} ry={22} fill="none" stroke="#cffafe" strokeWidth={0.9} /></A></g>
        <g transform="translate(300 220)"><A c="cart-ripple" dur={8.5} d={-4.5} hi={0.45}><ellipse rx={40} ry={26} fill="none" stroke="#cffafe" strokeWidth={0.8} /></A></g>
        <g transform="translate(392 228)"><A c="cart-ripple" dur={9.5} d={-7.5} hi={0.4}><ellipse rx={28} ry={18} fill="none" stroke="#cffafe" strokeWidth={0.7} /></A></g>
        <path d={VAC_PATH} fill={u('vacDepth')} />
        <ellipse cx={292} cy={180} rx={70} ry={42} fill={u('gloss')} opacity={0.32} transform="rotate(-24 292 180)" />
        <path d={VAC_LIT} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" opacity={0.35} />
        <path d={VAC_LIT} fill="none" stroke="#fff" strokeWidth={1} strokeLinecap="round" opacity={0.65} />
        <path d={VAC_CAUSTIC} fill="none" stroke="#a5f3fc" strokeWidth={4} strokeLinecap="round" opacity={0.25} />
        <path d={VAC_CAUSTIC} fill="none" stroke="#ecfeff" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
        <rect x={262} y={150} width={16} height={10} rx={3} fill="#fff" opacity={0.28} transform="rotate(-28 270 155)" />
        <rect x={281} y={142} width={9} height={10} rx={3} fill="#fff" opacity={0.22} transform="rotate(-28 285 147)" />
        {/* tonoplasto */}
        <Bilayer geo={TONO} head="#67e8f9" hi="#ecfeff" tail="#a5f3fc" tailWidth={0.3} hiOpacity={0.55} tailOpacity={0.5} />
      </g>

      {/* === REL === */}
      <g {...region('reticulo-liso')}>
        <SmoothER u={u} tubes={REL_TUBES} seed={52} />
      </g>

      {/* === RER === */}
      <g {...region('reticulo-rugoso')}>
        <path d={RER_HIT} fill="none" stroke="transparent" strokeWidth={13} strokeLinecap="round" />
        <RoughER u={u} {...NUC} sheets={RER_SHEETS} />
      </g>

      {/* === NÚCLEO === */}
      <g {...region('nucleo')}>
        <NucleusBody u={u} {...NUC} seed={12} pores={14} />
      </g>

      {/* === NUCLÉOLO === */}
      <g {...region('nucleolo')}>
        <circle cx={NUCLEOLUS.cx} cy={NUCLEOLUS.cy} r={NUCLEOLUS.r + 5} fill="transparent" />
        <Nucleolus u={u} {...NUCLEOLUS} seed={4} />
      </g>

      {/* === APARATO DE GOLGI === */}
      <g {...region('golgi')}>
        <ellipse cx={GOLGI.x} cy={GOLGI.y} rx={42} ry={28} fill="transparent" />
        <Golgi u={u} {...GOLGI} />
      </g>

      {/* === CLOROPLASTOS (se desplazan con la ciclosis) === */}
      <g {...region('cloroplasto')}>
        {CHLOROS.map((c, i) => (
          <A key={c.seed} c="cart-drift" dur={9 + (i % 3) * 2.5} d={-i * 2.3} dx={c.dx} dy={c.dy}>
            <ellipse cx={c.x} cy={c.y} rx={c.len / 2 + 6} ry={c.w / 2 + 6} fill="transparent" transform={`rotate(${c.rot} ${c.x} ${c.y})`} />
            <Chloroplast u={u} {...c} />
          </A>
        ))}
      </g>

      {/* === MITOCONDRIAS === */}
      <g {...region('mitocondria')}>
        {MITOS.map((m) => (
          <g key={m.seed}>
            <rect x={-m.len / 2 - 7} y={-m.w / 2 - 7} width={m.len + 14} height={m.w + 14} rx={m.w / 2 + 7} fill="transparent" transform={`translate(${m.x} ${m.y}) rotate(${m.rot})`} />
            <Mitochondrion u={u} {...m} anim={{ dur: 4 + (m.seed % 3) * 0.9, d: m.d }} />
          </g>
        ))}
      </g>

      {/* === RIBOSOMAS === */}
      <g {...region('ribosoma')}>
        <Ribosomes geo={RIBO} />
      </g>

      {/* === VIDA: ciclosis, fotosíntesis, transporte (sin eventos de puntero) === */}
      <g pointerEvents="none">
        {/* corriente citoplasmática (sentido horario) */}
        {[
          [120, 80, 330, 4, 15, 0], [140, 84, 320, -2, 15, -7.5], [519, 130, 6, 250, 14, -3], [515, 150, -4, 240, 14, -10],
          [470, 420, -330, -4, 16, -2], [430, 416, -300, 2, 16, -10], [79, 400, 2, -280, 15, -5], [83, 380, -2, -250, 15, -12],
        ].map(([x, y, tx, ty, dur, d], i) => (
          <Travel key={i} x={x} y={y} tx={tx} ty={ty} dur={dur} d={d}>
            <circle r={i % 2 ? 1.1 : 1.5} fill={i % 2 ? '#d9f99d' : '#fef3c7'} opacity={0.7} />
          </Travel>
        ))}
        {/* Golgi → pared (polisacáridos de la pared) */}
        <Travel x={316} y={418} tx={-6} ty={14} dur={5.5} d={-1}><Vesicle u={u} r={2.2} /></Travel>
        <Travel x={356} y={420} tx={8} ty={12} dur={6.5} d={-4}><Vesicle u={u} r={2} /></Travel>
        {/* RE → Golgi */}
        <Travel x={210} y={300} tx={110} ty={88} dur={10} d={-3}><Vesicle u={u} r={2} blue /></Travel>
        {/* paso por un plasmodesmo */}
        <Travel x={250} y={70} tx={0} ty={-26} dur={6} d={-2}><circle r={1.2} fill="#d9f99d" /></Travel>
        <Travel x={70} y={350} tx={-26} ty={0} dur={7} d={-5}><circle r={1.2} fill="#fef3c7" /></Travel>
        {/* fotosíntesis: O₂ y azúcares salen de los cloroplastos; ATP de las mitocondrias */}
        {[
          [305, 80, 6, -12, '#ecfeff', 0], [322, 104, 10, 6, '#fde68a', -1.4], [216, 86, -4, -11, '#ecfeff', -0.7],
          [486, 198, -12, 4, '#ecfeff', -2.1], [484, 332, -12, -2, '#fde68a', -1], [422, 392, 2, -12, '#ecfeff', -2.6],
          [140, 360, 10, -10, '#fde68a', -0.4],
        ].map(([x, y, dx, dy, c, d], i) => (
          <g key={`o${i}`} transform={`translate(${x} ${y})`}>
            <A c="cart-spark" dur={3.4 + (i % 3) * 0.5} d={d} dx={dx} dy={dy}>
              <circle r={1.4} fill="none" stroke={c} strokeWidth={0.6} opacity={0.9} />
              <circle cx={-0.4} cy={-0.4} r={0.4} fill="#fff" />
            </A>
          </g>
        ))}
        {[[392, 78, 6, -12, -0.3], [262, 392, -6, -12, -1.5], [492, 262, -14, 2, -2.4]].map(([x, y, dx, dy, d], i) => (
          <g key={`s${i}`} transform={`translate(${x} ${y})`}>
            <A c="cart-spark" dur={2.9 + i * 0.4} d={d} dx={dx} dy={dy}><Spark u={u} r={1} /></A>
          </g>
        ))}
        {/* destellos */}
        <Glint u={u} x={276} y={160} size={8} dur={7} d={-2} />
        <Glint u={u} x={118} y={152} size={5} dur={6.5} d={-4.5} />
        <Glint u={u} x={292} y={86} size={4} dur={8} d={-1} />
      </g>
    </svg>
  );
}
