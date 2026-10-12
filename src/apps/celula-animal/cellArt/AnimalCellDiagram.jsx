// Ilustración de La Célula Animal (dibujo 600×500). Capas, de atrás adelante:
// citoplasma (profundidad, citosol, gránulos, inclusiones) → citoesqueleto
// (pasa POR DEBAJO de los orgánulos) → membrana plasmática (bicapa con
// proteínas) → REL → RER (abraza el núcleo y se esconde tras él) → núcleo →
// nucléolo → Golgi → mitocondrias → lisosomas → centrosoma → ribosomas →
// vida (vesículas, ATP, destellos; sin eventos de puntero).
// Contrato con CelulaAnimal.jsx: mismas props que el antiguo CellDiagram y un
// <g className="organelle-region …"> por orgánulo.
import React from 'react';
import useArtIds from '@/components/art/useArtIds';
import {
  rng, r2, circlesPath, segsPath, polyPath, smoothPath, blobPts, resampleClosed, bandPath, offsetPts, at, deg,
  chunk, tiles,
} from './geom';
import {
  A, Travel, CommonDefs, Vesicle, Spark, Glint, Mitochondrion, NucleusBody, Nucleolus, RoughER,
  SmoothER, Golgi, Lysosome, Centrosome, Ribosomes, ribosomeGeometry, bilayerGeometry, Bilayer,
} from './parts';

const SVG_W = 600;
const SVG_H = 500;

/* ───────────── geometría (una vez) ───────────── */

const CX = 300;
const CY = 250;
const CELL = blobPts(CX, CY, 271, 217, 720, [[2, 0.012, 0.6], [3, 0.016, 1.7], [5, 0.007, 0.3], [7, 0.004, 2.2]]);
const MEM = resampleClosed(CELL, 4.3);
const MEM_FINE = resampleClosed(CELL, 2.5);
const BILAYER = bilayerGeometry(MEM, { pieces: 18 });
const MEM_BAND = bandPath(MEM_FINE, 4.9, -4.9);
const MEM_MID = polyPath(offsetPts(MEM_FINE, 0), true);
const CYTO = polyPath(offsetPts(MEM_FINE, -4.2), true);
const insideCell = (x, y, k = 1) => ((x - CX) / (262 * k)) ** 2 + ((y - CY) / (208 * k)) ** 2 < 1;

// proteínas de membrana: [fracción del contorno, tipo, color, anima]
const PROTEINS = [
  [0.02, 'channel', 'a', true], [0.07, 'glyco', 'b', false], [0.115, 'glob', 'c', true], [0.17, 'glyco', 'a', false],
  [0.235, 'channel', 'b', false], [0.29, 'glob', 'a', true], [0.345, 'glyco', 'c', false], [0.41, 'glob', 'b', false],
  [0.465, 'channel', 'a', true], [0.53, 'glyco', 'b', false], [0.6, 'glob', 'c', false], [0.66, 'channel', 'c', true],
  [0.72, 'glyco', 'a', false], [0.79, 'glob', 'b', true], [0.85, 'glyco', 'c', false], [0.915, 'glob', 'a', false],
  [0.96, 'glyco', 'b', true],
].map(([s, type, col, anim]) => {
  const p = at(MEM, s);
  return { x: p.x, y: p.y, rot: deg(p.ny, -p.nx), type, col, anim };
});

// citosol: manchas de profundidad, gránulos en suspensión (por teselas) y
// pequeños cúmulos que derivan con la corriente citoplasmática; glucógeno.
const cytosol = (() => {
  const R = rng(91);
  const mottle = [];
  for (let i = 0; i < 14; i++) {
    let x;
    let y;
    do { x = CX + (R() - 0.5) * 480; y = CY + (R() - 0.5) * 380; } while (!insideCell(x, y, 0.8));
    mottle.push([x, y, 26 + R() * 40, R() > 0.45]);
  }
  const fine = [];
  for (let i = 0; i < 300; i++) {
    let x;
    let y;
    do { x = CX + (R() - 0.5) * 530; y = CY + (R() - 0.5) * 425; } while (!insideCell(x, y, 0.96));
    fine.push([x, y, 0.45 + R() * 0.75]);
  }
  const drifters = [];
  for (let i = 0; i < 16; i++) {
    let x;
    let y;
    do { x = CX + (R() - 0.5) * 500; y = CY + (R() - 0.5) * 400; } while (!insideCell(x, y, 0.9));
    const pts = [];
    for (let k = 0; k < 7; k++) pts.push([x + (R() - 0.5) * 18, y + (R() - 0.5) * 18, 0.55 + R() * 0.7]);
    const a = R() * Math.PI * 2;
    drifters.push({ d: circlesPath(pts), dx: r2(Math.cos(a) * (3 + R() * 3)), dy: r2(Math.sin(a) * (3 + R() * 3)), dur: r2(7 + R() * 7), del: r2(-R() * 9) });
  }
  const glyco = [];
  [[150, 360], [255, 135], [470, 300], [240, 455], [520, 160], [92, 250], [395, 448]].forEach(([x, y]) => {
    for (let k = 0; k < 6; k++) {
      const t = (k / 6) * Math.PI * 2;
      glyco.push([x + Math.cos(t) * 2.1, y + Math.sin(t) * 2.1, 0.95]);
    }
    glyco.push([x, y, 0.9]);
  });
  return { mottle, fine: tiles(fine, 110).map(circlesPath), drifters, glyco: circlesPath(glyco) };
})();

// citoesqueleto: microtúbulos que salen del centrosoma, corteza de actina
// bajo la membrana y filamentos intermedios
const CENTRO = [372, 318];
const cyto = (() => {
  const R = rng(17);
  const mts = [];
  const hits = [];
  const angles = [-161, -142, -122, -98, -74, -50, -24, 2, 26, 50, 76, 100, 124, 146, 178, 198];
  angles.forEach((a, i) => {
    const t = (a * Math.PI) / 180;
    let L = 30;
    while (insideCell(CENTRO[0] + Math.cos(t) * L, CENTRO[1] + Math.sin(t) * L, 0.95) && L < 600) L += 3;
    const bend = a === -161 ? 0 : (R() > 0.5 ? 1 : -1) * (5 + R() * 9);
    const pts = [0.14, 0.38, 0.62, 0.84, 1].map((f) => {
      const w = Math.sin(f * Math.PI) * bend;
      return [CENTRO[0] + Math.cos(t) * L * f - Math.sin(t) * w, CENTRO[1] + Math.sin(t) * L * f + Math.cos(t) * w];
    });
    const d = smoothPath(pts);
    mts.push(d);
    if (i % 2 === 0) hits.push(d);
  });
  const actin = [];
  for (let i = 0; i < 300; i++) {
    const s0 = R();
    const p = at(MEM_FINE, s0);
    const depth = 7 + R() * 13;
    const x = p.x - p.nx * depth;
    const y = p.y - p.ny * depth;
    const a = R() * Math.PI;
    const L = 3 + R() * 5;
    actin.push({ s: s0, seg: [x - Math.cos(a) * L, y - Math.sin(a) * L, x + Math.cos(a) * L, y + Math.sin(a) * L] });
  }
  const ropes = [[[70, 300], [160, 250], [210, 140], [300, 70]], [[120, 420], [250, 400], [330, 455]],
    [[430, 70], [500, 130], [545, 260]], [[480, 420], [540, 330]]];
  const strands = [];
  ropes.forEach((pts) => {
    for (const ph of [0, Math.PI]) {
      const out = [];
      for (let k = 0; k < pts.length - 1; k++) {
        const [x1, y1] = pts[k];
        const [x2, y2] = pts[k + 1];
        const L = Math.hypot(x2 - x1, y2 - y1);
        const nx = -(y2 - y1) / L;
        const ny = (x2 - x1) / L;
        const n = Math.round(L / 3);
        for (let j = 0; j < n; j++) {
          const f = j / n;
          const w = Math.sin(((k * L + f * L) / 9) + ph) * 1.4;
          out.push([x1 + (x2 - x1) * f + nx * w, y1 + (y2 - y1) * f + ny * w]);
        }
      }
      strands.push(smoothPath(out));
    }
  });
  return {
    mts, hits: hits.join(''),
    actin: chunk(actin, (q) => q.s, 12).map((list) => segsPath(list.map((q) => q.seg))),
    ropes: strands,
  };
})();

// núcleo y orgánulos
const NUC = { cx: 300, cy: 215, rx: 90, ry: 76 };
const NUCLEOLUS = { cx: 330, cy: 196, r: 19 };
const RER_SHEETS = [
  { d: 10, a0: 124, a1: 262, th: 6.4, wob: 2.4, k: 5, ph: 0.4 },
  { d: 22.5, a0: 131, a1: 254, th: 6.2, wob: 2.8, k: 6, ph: 1.9 },
  { d: 35, a0: 139, a1: 247, th: 6, wob: 3, k: 5, ph: 3.1 },
  { d: 47, a0: 150, a1: 236, th: 5.6, wob: 2.6, k: 7, ph: 0.9 },
];
const RER_HIT = (() => RER_SHEETS.map((s) => {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = ((s.a0 + ((s.a1 - s.a0) * i) / 20) * Math.PI) / 180;
    pts.push([NUC.cx + (NUC.rx + s.d) * Math.cos(t), NUC.cy + (NUC.ry + s.d) * Math.sin(t)]);
  }
  return polyPath(pts);
}).join(''))();

// REL: túbulos que serpentean desde el extremo inferior del RER
const REL_TUBES = [
  [[232, 292], [214, 301], [196, 296], [178, 306], [160, 300], [140, 311], [118, 305], [100, 318]],
  [[206, 300], [201, 318], [186, 330], [168, 327], [150, 340], [130, 335], [111, 348]],
  [[178, 306], [175, 326], [183, 346], [201, 354], [222, 351], [237, 364]],
  [[150, 340], [146, 358], [132, 371], [114, 369], [104, 378]],
  [[201, 354], [190, 372], [170, 380], [150, 376], [133, 371]],
  [[140, 311], [134, 327], [150, 340]],
  [[222, 351], [226, 334], [214, 319], [201, 318]],
];

const MITOS = [
  { x: 434, y: 352, len: 100, w: 42, rot: -22, seed: 3, d: -1.2 },
  { x: 196, y: 420, len: 72, w: 30, rot: 10, seed: 8, d: -3.4 },
  { x: 362, y: 90, len: 58, w: 25, rot: -9, seed: 13, d: -2.1 },
  { x: 108, y: 175, len: 52, w: 23, rot: 64, seed: 19, d: -4.4 },
];
const LYSOS = [
  { x: 490, y: 247, r: 14, seed: 5, d: -0.8 },
  { x: 518, y: 292, r: 10, seed: 9, d: -2.6 },
  { x: 418, y: 262, r: 8.5, seed: 12, d: -1.7 },
];
const GOLGI = { x: 448, y: 168, rot: -28 };

const RIBO = ribosomeGeometry([
  { pts: [[250, 318], [268, 324], [288, 334], [298, 352]], n: 6 },
  { pts: [[300, 392], [318, 402], [338, 400], [354, 388]], n: 6 },
  { pts: [[136, 238], [148, 252], [150, 270], [142, 288]], n: 6 },
  { pts: [[420, 404], [436, 413], [452, 412], [468, 400]], n: 5 },
  { pts: [[528, 178], [536, 196], [532, 216]], n: 4 },
  { pts: [[392, 112], [408, 118], [418, 132]], n: 4 },
  { pts: [[82, 270], [90, 288], [86, 304]], n: 3 },
  { pts: [[262, 452], [280, 456], [296, 452]], n: 3 },
], [
  [240, 280, 0.4], [318, 312, 1.2], [282, 372, 2], [360, 432, 0.3], [470, 200, 1.4], [455, 290, 2.6],
  [128, 405, 0.8], [170, 210, 1.9], [520, 330, 0.2], [222, 108, 1.1], [500, 400, 2.2], [88, 220, 0.5],
  [330, 460, 1.6], [400, 300, 0.9],
]);

// dos polisomas que derivan despacio (piezas pequeñas = repintado barato)
const RIBO_DRIFT = [
  ribosomeGeometry([{ pts: [[404, 214], [414, 226], [412, 242]], n: 4 }]),
  ribosomeGeometry([{ pts: [[232, 410], [246, 402], [262, 404]], n: 3 }]),
];

const LIPIDS = [[122, 262, 7], [264, 438, 5.5], [544, 248, 4.5]];

/* ───────────── piezas propias ───────────── */

const PROT_FILL = { a: 'protA', b: 'protB', c: 'protC' };

function MembraneProtein({ u, type, col }) {
  const fill = u(PROT_FILL[col]);
  if (type === 'channel') {
    return (
      <g>
        <ellipse cx={-3} cy={0.4} rx={2.8} ry={7} fill={fill} />
        <ellipse cx={3} cy={0.4} rx={2.8} ry={7} fill={fill} />
        <rect x={-0.9} y={-5.5} width={1.8} height={11.5} rx={0.9} fill="#04130c" opacity={0.85} />
        <ellipse cx={-3.6} cy={3} rx={1} ry={2.4} fill="#fff" opacity={0.4} />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={0} cy={0.6} rx={4.4} ry={7.2} fill={fill} />
      <ellipse cx={-1.4} cy={3.2} rx={1.5} ry={2.6} fill="#fff" opacity={0.42} />
      {type === 'glyco' && (
        <path
          d={`${circlesPath([[0, 9.6, 1.25], [0, 12.4, 1.2], [-1.9, 14.8, 1.1], [1.9, 14.8, 1.1], [-2.6, 17.4, 0.95]])}`}
          fill="#fbcfe8"
        />
      )}
      {type === 'glyco' && <path d="M0 7.6L0 12.4L-1.9 14.8L-2.6 17.4M0 12.4L1.9 14.8" stroke="#f9a8d4" strokeWidth={0.5} fill="none" />}
    </g>
  );
}

/* ───────────── dibujo ───────────── */

export default function AnimalCellDiagram({ selectedId, onSelect, isQuizMode, feedbackState, viewBox }) {
  const [id, u] = useArtIds();
  const getRegionClass = (oid) => {
    if (!isQuizMode) return selectedId === oid ? 'active' : '';
    if (feedbackState && feedbackState.id === oid) return feedbackState.isCorrect ? 'correct' : 'incorrect';
    return '';
  };
  const region = (oid) => ({ className: `organelle-region ${getRegionClass(oid)}`, onClick: () => onSelect(oid) });

  return (
    <svg className="cart-svg" viewBox={viewBox || `0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <CommonDefs id={id} />
        <radialGradient id={id('cyto')} cx="46%" cy="42%" r="62%">
          <stop offset="0" stopColor="#1f6149" />
          <stop offset="0.45" stopColor="#164a37" />
          <stop offset="0.8" stopColor="#0e3125" />
          <stop offset="1" stopColor="#09241a" />
        </radialGradient>
        <radialGradient id={id('cytoRim')} cx="50%" cy="50%" r="50%">
          <stop offset="0.74" stopColor="#020c08" stopOpacity="0" />
          <stop offset="1" stopColor="#020c08" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id={id('cytoLight')} cx="30%" cy="24%" r="55%">
          <stop offset="0" stopColor="#a7f3d0" stopOpacity="0.16" />
          <stop offset="1" stopColor="#a7f3d0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('aura')} cx="50%" cy="50%" r="50%">
          <stop offset="0.84" stopColor="#4ade80" stopOpacity="0" />
          <stop offset="0.925" stopColor="#4ade80" stopOpacity="0.2" />
          <stop offset="1" stopColor="#4ade80" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('mottleL')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#6ee7b7" stopOpacity="0.07" />
          <stop offset="1" stopColor="#6ee7b7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('mottleD')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#01110a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#01110a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('protA')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#f5d0fe" />
          <stop offset="0.45" stopColor="#c026d3" />
          <stop offset="1" stopColor="#581c87" />
        </radialGradient>
        <radialGradient id={id('protB')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="0.45" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
        <radialGradient id={id('protC')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="0.45" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
      </defs>

      {/* halo y sombra de la célula sobre la platina */}
      <g pointerEvents="none">
        <ellipse cx={CX + 10} cy={CY + 16} rx={286} ry={228} fill={u('shadow')} opacity={0.7} />
        <ellipse cx={CX} cy={CY} rx={300} ry={243} fill={u('aura')} />
      </g>

      {/* === CITOPLASMA === */}
      <g {...region('citoplasma')}>
        <path d={CYTO} fill={u('cyto')} />
        {cytosol.mottle.map(([x, y, r, light], i) => (
          <circle key={i} cx={r2(x)} cy={r2(y)} r={r2(r)} fill={u(light ? 'mottleL' : 'mottleD')} />
        ))}
        {cytosol.fine.map((d, i) => <path key={i} d={d} fill="#a7f3d0" opacity={0.22} />)}
        {cytosol.drifters.map((g, i) => (
          <A key={i} c="cart-drift" dur={g.dur} d={g.del} dx={g.dx} dy={g.dy}>
            <path d={g.d} fill={i % 3 ? '#a7f3d0' : '#fef3c7'} opacity={i % 3 ? 0.34 : 0.28} />
          </A>
        ))}
        <path d={cytosol.glyco} fill="#fde68a" opacity={0.35} />
        {LIPIDS.map(([x, y, r]) => (
          <g key={x}>
            <circle cx={x + 1.5} cy={y + 2.5} r={r + 1} fill="#020c08" opacity={0.4} />
            <circle cx={x} cy={y} r={r} fill={u('lipid')} opacity={0.85} />
            <circle cx={x - r * 0.35} cy={y - r * 0.38} r={r * 0.3} fill="#fff" opacity={0.7} />
          </g>
        ))}
        <path d={CYTO} fill={u('cytoLight')} />
        <path d={CYTO} fill={u('cytoRim')} />
      </g>

      {/* === CITOESQUELETO (por debajo de los orgánulos) === */}
      <g {...region('citoesqueleto')}>
        <path d={cyto.hits} fill="none" stroke="transparent" strokeWidth={8} />
        {cyto.actin.map((d, i) => <path key={i} d={d} stroke="#bbf7d0" strokeWidth={0.45} strokeLinecap="round" opacity={0.3} />)}
        {cyto.ropes.map((d, i) => <path key={i} d={d} fill="none" stroke="#6ee7b7" strokeWidth={0.65} opacity={0.26} />)}
        {cyto.mts.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#03140d" strokeWidth={2.6} strokeLinecap="round" opacity={0.4} transform="translate(1 1.6)" />
            <path d={d} fill="none" stroke="#86efac" strokeWidth={1.35} strokeLinecap="round" opacity={0.34} />
            <path d={d} fill="none" stroke="#f0fdf4" strokeWidth={0.45} strokeDasharray="2 1.3" opacity={0.32} />
          </g>
        ))}
      </g>

      {/* === MEMBRANA PLASMÁTICA: bicapa de fosfolípidos con proteínas === */}
      <g {...region('membrana')}>
        <path d={MEM_MID} fill="none" stroke="transparent" strokeWidth={18} />
        <path d={MEM_BAND} fillRule="evenodd" fill="#0c3b22" />
        <Bilayer geo={BILAYER} head="#4ade80" hi="#f0fdf4" tail="#d9f99d" />
        {PROTEINS.map((p, i) => (
          <g key={i} transform={`translate(${r2(p.x)} ${r2(p.y)}) rotate(${r2(p.rot)})`}>
            {p.anim
              ? <A c="cart-bob" dur={3.2 + (i % 4) * 0.7} d={-i * 0.9} dy={1.3}><MembraneProtein u={u} type={p.type} col={p.col} /></A>
              : <MembraneProtein u={u} type={p.type} col={p.col} />}
          </g>
        ))}
      </g>

      {/* === RETÍCULO ENDOPLASMÁTICO LISO === */}
      <g {...region('reticulo-liso')}>
        <SmoothER u={u} tubes={REL_TUBES} />
      </g>

      {/* === RETÍCULO ENDOPLASMÁTICO RUGOSO (abraza el núcleo) === */}
      <g {...region('reticulo-rugoso')}>
        <path d={RER_HIT} fill="none" stroke="transparent" strokeWidth={14} strokeLinecap="round" />
        <RoughER u={u} {...NUC} sheets={RER_SHEETS} />
      </g>

      {/* === NÚCLEO === */}
      <g {...region('nucleo')}>
        <NucleusBody u={u} {...NUC} seed={7} pores={20} />
      </g>

      {/* === NUCLÉOLO === */}
      <g {...region('nucleolo')}>
        <circle cx={NUCLEOLUS.cx} cy={NUCLEOLUS.cy} r={NUCLEOLUS.r + 5} fill="transparent" />
        <Nucleolus u={u} {...NUCLEOLUS} />
      </g>

      {/* === APARATO DE GOLGI === */}
      <g {...region('golgi')}>
        <ellipse cx={GOLGI.x} cy={GOLGI.y} rx={52} ry={40} fill="transparent" />
        <Golgi u={u} {...GOLGI} />
      </g>

      {/* === MITOCONDRIAS === */}
      <g {...region('mitocondria')}>
        {MITOS.map((m) => (
          <g key={m.seed}>
            <rect x={-m.len / 2 - 6} y={-m.w / 2 - 6} width={m.len + 12} height={m.w + 12} rx={m.w / 2 + 6} fill="transparent" transform={`translate(${m.x} ${m.y}) rotate(${m.rot})`} />
            <Mitochondrion u={u} {...m} anim={{ dur: 4.2 + (m.seed % 3) * 0.8, d: m.d }} />
          </g>
        ))}
      </g>

      {/* === LISOSOMAS === */}
      <g {...region('lisosoma')}>
        {LYSOS.map((l) => (
          <g key={l.seed}>
            <circle cx={l.x} cy={l.y} r={l.r + 7} fill="transparent" />
            <Lysosome u={u} {...l} spin={30 + l.r * 2} />
          </g>
        ))}
      </g>

      {/* === CENTROSOMA === */}
      <g {...region('centrosoma')}>
        <Centrosome u={u} x={CENTRO[0]} y={CENTRO[1]} scale={1.25} />
      </g>

      {/* === RIBOSOMAS LIBRES (polisomas) === */}
      <g {...region('ribosoma')}>
        <Ribosomes geo={RIBO} />
        <A c="cart-drift" dur={7} d={-2} dx={-3} dy={2.5}><Ribosomes geo={RIBO_DRIFT[0]} /></A>
        <A c="cart-drift" dur={8.5} d={-5} dx={3} dy={-2}><Ribosomes geo={RIBO_DRIFT[1]} /></A>
      </g>

      {/* === VIDA: transporte y energía (sin eventos de puntero) === */}
      <g pointerEvents="none">
        {/* RE → Golgi */}
        <Travel x={300} y={124} tx={118} ty={52} dur={9} d={-1}><Vesicle u={u} r={2.6} blue /></Travel>
        <Travel x={250} y={132} tx={160} ty={48} dur={11} d={-6}><Vesicle u={u} r={2.2} blue /></Travel>
        {/* Golgi → membrana (exocitosis) y Golgi → lisosoma */}
        <Travel x={486} y={150} tx={44} ty={-12} dur={7} d={-2}><Vesicle u={u} r={3.2} /></Travel>
        <Travel x={492} y={176} tx={62} ty={22} dur={8.5} d={-5.5}><Vesicle u={u} r={2.8} /></Travel>
        <Travel x={466} y={196} tx={20} ty={40} dur={6.5} d={-3.5}><Vesicle u={u} r={2.4} /></Travel>
        {/* carga por los microtúbulos (cinesina) */}
        <Travel x={CENTRO[0] - 22} y={CENTRO[1] + 26} tx={-150} ty={130} dur={13} d={-4}><Vesicle u={u} r={2.4} blue /></Travel>
        <Travel x={CENTRO[0] + 28} y={CENTRO[1] - 1} tx={150} ty={-4} dur={10} d={-8}><Vesicle u={u} r={2.2} /></Travel>
        {/* ATP saliendo de las mitocondrias */}
        {[
          [440, 324, 12, -20, 0], [470, 346, 18, -6, -1.1], [412, 372, -14, 14, -2.2], [398, 340, -18, -10, -0.5],
          [200, 400, 6, -18, -1.6], [168, 430, -16, 6, -2.6], [362, 74, 6, -14, -0.8], [96, 150, -14, -8, -1.9],
        ].map(([x, y, dx, dy, d], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <A c="cart-spark" dur={2.8 + (i % 3) * 0.6} d={d} dx={dx} dy={dy}><Spark u={u} /></A>
          </g>
        ))}
        {/* destellos de luz */}
        <Glint u={u} x={262} y={166} size={7} dur={7} d={-1} />
        <Glint u={u} x={414} y={336} size={5} dur={6} d={-3.5} />
        <Glint u={u} x={484} y={240} size={4.5} dur={5.5} d={-2} />
        <Glint u={u} x={355} y={82} size={4} dur={8} d={-5} />
      </g>
    </svg>
  );
}
