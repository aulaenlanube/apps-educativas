// "Mundo" del cuerpo humano para el motor de mapas (src/apps/_shared/geo):
// cada lámina (public/data/anatomia/<id>.json) es un ámbito con sus propias
// coordenadas, su ilustración de fondo y sus estructuras tocables. Las láminas
// se cargan bajo demanda (world.ensure) antes de cada ronda.
import React, {
  useEffect, useId, useRef, useState, useSyncExternalStore,
} from 'react';
import { motion } from 'framer-motion';
import useFxTier from '@/hooks/useFxTier';
import { BY_KEY } from './data/structures';
import { nameOf, systemName } from './text';
import { livingOf, livingPaused, originPct } from './living';
import { layerMix, dominantLayer } from './layers';

const BASE = '/data/anatomia';
const EMPTY = new Map();
const NONE = [];
let indexP = null;
const plateP = new Map();

const fetchJson = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
});

function loadIndex() {
  if (!indexP) indexP = fetchJson(`${BASE}/index.json`).catch((e) => { indexP = null; throw e; });
  return indexP;
}

function loadPlate(id) {
  if (!plateP.has(id)) plateP.set(id, fetchJson(`${BASE}/${id}.json`).catch((e) => { plateP.delete(id); throw e; }));
  return plateP.get(id);
}

/* ───────── rutas ───────── */

// Escala y desplaza una ruta compacta (M absoluto, l relativo, z).
export function transformPath(d, s, tx, ty) {
  const r = (v) => Math.round(v * 10) / 10;
  return d.replace(/([MLlmz])([^MLlmz]*)/g, (_, cmd, args) => {
    const n = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
    if (cmd === 'z') return 'z';
    const out = [];
    for (let i = 0; i + 1 < n.length; i += 2) {
      if (cmd === 'M' || cmd === 'L') out.push(r(n[i] * s + tx), r(n[i + 1] * s + ty));
      else out.push(r(n[i] * s), r(n[i + 1] * s));
    }
    return `${cmd}${out.join(' ')}`;
  });
}

/* ───────── fondo de cada lámina ───────── */

// Lupa de rayos X: deja ver otra lámina debajo del dedo o del ratón.
function XrayLens({ lens, k }) {
  const id = `ana-lens-${useId().replace(/:/g, '')}`;
  const clipRef = useRef(null);
  const ringRef = useRef(null);
  const groupRef = useRef(null);
  const r = (lens.r || 90) * k;
  useEffect(() => {
    const svg = groupRef.current?.ownerSVGElement;
    if (!svg) return undefined;
    const move = (e) => {
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      for (const el of [clipRef.current, ringRef.current]) {
        el?.setAttribute('cx', p.x);
        el?.setAttribute('cy', p.y);
      }
      groupRef.current?.setAttribute('opacity', '1');
    };
    const leave = () => groupRef.current?.setAttribute('opacity', '0');
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerleave', leave);
    return () => {
      svg.removeEventListener('pointermove', move);
      svg.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <g ref={groupRef} opacity="0" pointerEvents="none" className="ana-lens">
      <defs>
        <clipPath id={id}><circle ref={clipRef} cx={-9999} cy={-9999} r={r} /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-lens.w} y={-lens.h} width={lens.w * 3} height={lens.h * 3} className="ana-lens__bg" />
        {lens.ghost && <image href={lens.ghost} width={lens.w} height={lens.h} />}
        <image href={lens.img} width={lens.w} height={lens.h} />
      </g>
      <circle ref={ringRef} cx={-9999} cy={-9999} r={r} className="ana-lens__ring" strokeWidth={3 * k} />
    </g>
  );
}

/* ───────── órganos vivos: corazón que late y pulmones que respiran ───────── */

// Solo con nivel de efectos alto y sin movimiento reducido (el CSS también lo exige).
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
function useLiveMotion() {
  const fx = useFxTier();
  const [still, setStill] = useState(reducedMotion);
  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : null;
    if (!mq?.addEventListener) return undefined;
    const on = () => setStill(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fx === 'high' && !still;
}

const LIVE = new WeakMap();
const livingFor = (plate) => {
  if (!LIVE.has(plate)) LIVE.set(plate, livingOf(plate));
  return LIVE.get(plate);
};

// Grupo que late o respira (escala desde su origen). Con `clip`, una copia de la
// lámina recortada por la silueta de la estructura; si no, lo que lleve dentro.
function LiveGroup({ group, plate, states, clip = false, children }) {
  const id = `ana-live-${useId().replace(/:/g, '')}`;
  const cls = `ana-live ana-live--${group.type}${livingPaused(group, states) ? ' is-paused' : ''}`;
  return (
    <g className={cls} style={{ transformOrigin: originPct(group, plate.w, plate.h) }}>
      {clip ? (
        <>
          <defs>
            <clipPath id={id}>
              {group.keys.map((key) => <path key={key} d={plate.entries.get(key).d} clipRule="evenodd" />)}
            </clipPath>
          </defs>
          <image href={plate.img} width={plate.w} height={plate.h} clipPath={`url(#${id})`} />
        </>
      ) : children}
    </g>
  );
}

// Imagen de una lámina con sus órganos vivos (si toca).
function PlateImage({ plate, states, live }) {
  const groups = live ? livingFor(plate) : NONE;
  const whole = groups.find((g) => g.whole);
  const img = <image href={plate.img} width={plate.w} height={plate.h} className="ana-bd__img" />;
  return (
    <>
      {whole ? <LiveGroup group={whole} plate={plate} states={states}>{img}</LiveGroup> : img}
      {groups.filter((g) => !g.whole).map((g) => <LiveGroup key={g.type} group={g} plate={plate} states={states} clip />)}
    </>
  );
}

function PlateBackdrop({ world, k, states }) {
  const p = world.plate;
  const live = useLiveMotion();
  return (
    <g className="ana-bd" pointerEvents="none">
      {p.ghost && <image href={p.ghost} width={p.w} height={p.h} className="ana-bd__ghost" />}
      <PlateImage plate={p} states={states} live={live} />
      {world.lens && <XrayLens lens={world.lens} k={k} />}
    </g>
  );
}

// Capas del cuerpo entero fundidas según el deslizador del atlas (world.mix):
// la de dentro debajo y la de fuera encima, solo con opacidad. Las marcas
// (seleccionada…) son de la capa dominante.
function LayersBackdrop({ world, k, states }) {
  const { v, lens } = useSyncExternalStore(world.mix.subscribe, world.mix.get, world.mix.get);
  const live = useLiveMotion();
  const { layers } = world;
  const mix = layerMix(v, layers.length);
  const dom = dominantLayer(v, layers.length);
  const ghost = layers.find((p) => p.ghost)?.ghost;
  const order = layers.map((_, i) => i).reverse();
  return (
    <g className="ana-bd" pointerEvents="none">
      {ghost && <image href={ghost} width={world.width} height={world.height} className="ana-bd__ghost" />}
      {order.map((i) => {
        const o = mix[i];
        const on = o > 0.002;
        return (
          <g key={layers[i].id} opacity={o} visibility={on ? 'visible' : 'hidden'}>
            <PlateImage plate={layers[i]} states={i === dom ? states : null} live={live && on} />
          </g>
        );
      })}
      {lens && <XrayLens lens={lens} k={k} />}
    </g>
  );
}

/* ───────── recorridos (estela y robot) ───────── */

export function MiniRobot({ x, y, size, from }) {
  const s = size / 40;
  const body = (
    <g transform={`scale(${s}) translate(-20 -24)`}>
      <ellipse cx="20" cy="45" rx="13" ry="3.5" fill="#020617" opacity=".45" />
      <line x1="20" y1="5" x2="20" y2="11" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="4" r="3.4" fill="#f472b6" stroke="#fdf2f8" strokeWidth="1" />
      <rect x="5" y="10" width="30" height="26" rx="10" fill="#6366f1" stroke="#c7d2fe" strokeWidth="1.6" />
      <rect x="9" y="15" width="22" height="13" rx="6" fill="#0f172a" />
      <circle cx="15" cy="21.5" r="2.6" fill="#22d3ee" />
      <circle cx="25.5" cy="21.5" r="3.4" fill="#22d3ee" />
      <rect x="11" y="36" width="18" height="6" rx="3" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="1.2" />
    </g>
  );
  if (from) {
    return (
      <motion.g initial={{ x: from[0], y: from[1] }} animate={{ x, y }} transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }} className="ana-robot">
        {body}
      </motion.g>
    );
  }
  return <g transform={`translate(${x} ${y})`} className="ana-robot">{body}</g>;
}

function Trail({ points, k, active = true }) {
  if (points.length < 2) return null;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');
  return (
    <g className={`ana-trail ${active ? 'is-active' : ''}`} pointerEvents="none">
      <path d={d} className="ana-trail__glow" strokeWidth={10 * k} />
      <path d={d} className="ana-trail__line" strokeWidth={3.2 * k} strokeDasharray={`${8 * k} ${6 * k}`} />
      {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={5 * k} className="ana-trail__dot" />)}
    </g>
  );
}

function QuestionOverlay({ scope, q, done, correct, k, progress = 0, subject }) {
  const at = (key) => scope.entries.get(key)?.centroid || null;
  if (q.kind === 'sequence') {
    const n = done && correct ? q.stops.length : progress;
    const pts = q.stops.slice(0, n).map(at).filter(Boolean);
    return <Trail points={pts} k={k} />;
  }
  if (!q.trail?.length) return null;
  const pts = q.trail.map(at).filter(Boolean);
  const here = pts[pts.length - 1];
  const from = q.robotFrom ? at(q.robotFrom) : null;
  return (
    <>
      <Trail points={pts} k={k} />
      {here && <MiniRobot x={here[0]} y={here[1] - 22 * k} size={44 * k} from={!subject && from ? [from[0], from[1] - 22 * k] : null} />}
    </>
  );
}

/* ───────── mundo ───────── */

function buildPlate(data, index) {
  const meta = index.plates[data.id] || {};
  const entries = new Map();
  for (const e of data.entries) {
    const s = BY_KEY[e.k];
    entries.set(e.k, {
      key: e.k,
      get name() { return nameOf(e.k); },
      // grupo: el de la lámina (arterias/venas…), la zona de las partes externas o el sistema
      cont: e.gp || s?.grp || s?.s || 'otros',
      d: e.d,
      centroid: e.c,
      area: e.a,
      box: e.b,
      marker: e.a < 60,
      // zonas que quedan dentro de esta (lámina dibujada): tocarlas también vale
      contains: e.x || null,
      covered: Boolean(e.cv),
    });
  }
  const ghost = meta.frame === 'body' ? index.ghosts?.[data.view] : null;
  return { ...data, entries, ghost, shapes: data.shapes || {} };
}

export async function loadBodyWorld() {
  const index = await loadIndex();
  return makeBodyWorld(index, loadPlate);
}

// Mundo a partir del índice y de una función que carga cada lámina (los tests
// la leen del disco).
export function makeBodyWorld(index, loader) {
  const plates = new Map();
  const scopes = new Map();

  const makeScope = (plate) => {
    const { w, h } = plate;
    const views = { world: { x: 0, y: 0, w, h }, full: { x: 0, y: 0, w, h } };
    const scope = {
      id: plate.id,
      plate,
      width: w,
      height: h,
      maxZoom: plate.kind === 'svg' ? 6 : 10,
      views,
      entries: plate.entries,
      layer: () => plate.entries,
      nameOf: (key) => nameOf(key),
      groupName: (g) => systemName(g),
      neighborsOf: () => [],
      features: EMPTY,
      featureView: () => views.world,
      Backdrop: PlateBackdrop,
      className: `ana-map ana-map--${plate.kind}`,
      focusView(key, _layer, wide = false) {
        const e = plate.entries.get(key);
        if (!e) return views.world;
        const [x0, y0, x1, y1] = e.box;
        const f = wide ? 2.6 : 2;
        const bw = Math.max((x1 - x0) * f, w * (wide ? 0.4 : 0.28));
        const bh = Math.max((y1 - y0) * f, h * (wide ? 0.25 : 0.16));
        const cx = (x0 + x1) / 2; const cy = (y0 + y1) / 2;
        return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
      },
      // Vista alrededor de una estructura (modo fácil: el mapa empieza cerca).
      around(key, factor = 3.2) {
        const e = plate.entries.get(key);
        if (!e) return views.world;
        const [x0, y0, x1, y1] = e.box;
        const bw = Math.min(w, Math.max((x1 - x0) * factor, w * 0.5));
        const bh = Math.min(h, Math.max((y1 - y0) * factor, h * 0.32));
        const cx = (x0 + x1) / 2; const cy = (y0 + y1) / 2;
        return { x: Math.max(0, Math.min(w - bw, cx - bw / 2)), y: Math.max(0, Math.min(h - bh, cy - bh / 2)), w: bw, h: bh };
      },
    };
    scope.questionOverlay = (q, opts) => <QuestionOverlay scope={scope} q={q} {...opts} />;
    return scope;
  };

  const world = {
    index,
    plates,
    views: { world: { x: 0, y: 0, w: 100, h: 100 } },
    features: EMPTY,
    has: (id) => plates.has(id),
    available: (id) => Boolean(index.plates[id]),
    async ensure(ids) {
      const need = [...new Set(ids)].filter((id) => id && !plates.has(id) && index.plates[id]);
      const loaded = await Promise.all(need.map((id) => loader(id)));
      loaded.forEach((data) => plates.set(data.id, buildPlate(data, index)));
      return world;
    },
    scope(id) {
      const plate = plates.get(id);
      if (!plate) return world;
      if (!scopes.has(id)) scopes.set(id, makeScope(plate));
      return scopes.get(id);
    },
    // Lo que enseña la lupa de rayos X sobre otra lámina (cargada).
    lensOf(id) {
      const lp = plates.get(id);
      return lp ? { img: lp.img, ghost: lp.ghost, w: lp.w, h: lp.h, r: 90 } : null;
    },
    // Ámbito con lupa de rayos X sobre otra lámina (atlas).
    scopeWithLens(id, lensId) {
      const base = world.scope(id);
      const lens = world.lensOf(lensId);
      if (!lens || base === world) return base;
      return { ...base, lens };
    },
    // Ámbito de capas (atlas): láminas de cuerpo entero con el mismo encuadre,
    // fundidas por el deslizador. `mix` = createMixStore() (valor y lupa); las
    // zonas tocables las pasa el atlas (las de la capa dominante).
    scopeLayers(ids, mix) {
      const ps = ids.map((id) => plates.get(id));
      if (ps.length < 2 || ps.some((p) => !p)) return null;
      const base = world.scope(ids[0]);
      return { ...base, id: `capas:${ids.join('+')}`, layers: ps, mix, lens: null, Backdrop: LayersBackdrop };
    },
    layer: (id) => plates.get(id)?.entries || EMPTY,
    nameOf: (key) => nameOf(key),
    groupName: (g) => systemName(g),
    // Láminas cargadas donde aparece una estructura.
    platesWith: (key) => [...plates.values()].filter((p) => p.entries.has(key)).map((p) => p.id),
    shapePath(key, size, pad, layer) {
      const p = plates.get(layer) || [...plates.values()].find((pl) => pl.shapes[key]);
      const sh = p?.shapes[key];
      if (!sh) return '';
      const s = (size - 2 * pad) / Math.max(sh.w, sh.h);
      return transformPath(sh.d, s, (size - sh.w * s) / 2, (size - sh.h * s) / 2);
    },
    hasShape: (key, layer) => Boolean(plates.get(layer)?.shapes[key]),
  };
  return world;
}
