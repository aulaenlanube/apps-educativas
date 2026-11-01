// Mapa interactivo (SVG) del motor de mapas. Zoom con rueda, botones y
// pellizco; arrastre para desplazarse; toque/clic para elegir una región o un
// accidente geográfico. Las capas pesadas están memoizadas: al hacer zoom solo
// cambia el viewBox y lo que mantiene su tamaño en pantalla (puntos, etiquetas).
//
// Contrato del objeto `world` (lo construye cada app):
//   width, height                 tamaño del lienzo proyectado
//   entries: Map(key → entry)     capa jugable por defecto (países, comunidades)
//   background: { sea, grid }     rutas del mar y de la retícula
//   context?: [{ key, d }]        tierras vecinas no jugables (gris)
//   frames?: string               marcos de recuadros (Canarias)
//   views.world                   encuadre inicial
//   nameOf(key)                   nombre para tooltips y etiquetas
// entry = { key, name, cont (grupo), d, parts: [{ cont, d }], centroid, marker, terr?, fill? }
// feature = { key, name, kind: 'line' | 'area' | 'point', type, d?, xy }
import React, { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Amplía la vista hasta la proporción del lienzo, sin moverla de su centro.
function fitAspect(v, aspect) {
  if (v.w / v.h > aspect) {
    const h = v.w / aspect;
    return { x: v.x, y: v.y - (h - v.h) / 2, w: v.w, h };
  }
  const w = v.h * aspect;
  return { x: v.x - (w - v.w) / 2, y: v.y, w, h: v.h };
}

// Con zoom, la vista no se sale del mapa; sin zoom, queda centrada.
const clampAxis = (start, size, total) => (size <= total ? Math.min(total - size, Math.max(0, start)) : (total - size) / 2);

// Lo más que se puede alejar: que quepa el mapa entero, sea más ancho o más alto que el lienzo.
const maxViewW = (world, aspect) => Math.max(world.width, world.height * aspect) * 1.06;

function clampView(v, world, aspect) {
  const w = Math.min(maxViewW(world, aspect), Math.max(world.width / (world.maxZoom || 45), v.w));
  const h = w / aspect;
  const cx = v.x + v.w / 2;
  const cy = v.y + v.h / 2;
  return { x: clampAxis(cx - w / 2, w, world.width), y: clampAxis(cy - h / 2, h, world.height), w, h };
}

/* ───────── capas ───────── */

const MapBase = memo(function MapBase({ world }) {
  const id = `gq-sea-${useId().replace(/:/g, '')}`;
  const bg = world.background || {};
  return (
    <g className="gq-base">
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#1677b3" />
          <stop offset="0.7" stopColor="#0d5288" />
          <stop offset="1" stopColor="#0a3a63" />
        </radialGradient>
      </defs>
      {bg.sea && <path d={bg.sea} className="gq-sea" fill={`url(#${id})`} />}
      {bg.grid && <path d={bg.grid} className="gq-grat" />}
      {world.context?.map((c) => <path key={c.key} d={c.d} className="gq-ctx" />)}
    </g>
  );
});

function landClass(e, state, colorBy) {
  const tint = colorBy === 'continent' ? e.cont || 'none' : 'none';
  return `gq-land gq-c-${tint}${e.terr ? ' is-terr' : ''}${state ? ` is-${state}` : ''}`;
}

const Lands = memo(function Lands({ entries, states, colorBy, group }) {
  const items = useMemo(() => [...entries.values()].filter((e) => e.d || e.parts?.length), [entries]);
  const groups = new Map();
  const push = (cont, el) => {
    const k = group ? cont || 'none' : 'all';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(el);
  };
  for (const e of items) {
    const cls = landClass(e, states?.[e.key], colorBy);
    const style = colorBy === 'own' && e.fill ? { '--f': e.fill, '--fh': e.fillHover || e.fill } : undefined;
    if (e.d) push(e.cont, <path key={e.key} d={e.d} className={cls} style={style} data-key={e.key} data-cont={e.cont || ''} />);
    e.parts?.forEach((p, i) => push(p.cont, <path key={`${e.key}~${i}`} d={p.d} className={cls} style={style} data-key={e.key} data-cont={p.cont} />));
  }
  return (
    <g className="gq-lands">
      {[...groups].map(([k, paths]) => <g key={k} className="gq-cont-group" data-group={k}>{paths}</g>)}
    </g>
  );
});

// Contorno por encima de todo para lo marcado (acierto, fallo, objetivo…).
const Highlights = memo(function Highlights({ entries, states }) {
  const keys = Object.keys(states || {}).filter((k) => states[k] !== 'dim');
  return (
    <g className="gq-hls" pointerEvents="none">
      {keys.map((k) => {
        const e = entries.get(k);
        if (!e?.d) return null;
        return <path key={k} d={e.d} className={`gq-hl is-${states[k]}`} />;
      })}
    </g>
  );
});

// Ríos (líneas), cordilleras/mares/desiertos/islas (áreas) y puntos.
const Features = memo(function Features({ features, states, pickable, className = '' }) {
  return (
    <g className={`gq-feats ${className}${pickable ? ' is-pickable' : ''}`}>
      {features.filter((f) => f.kind !== 'point').map((f) => {
        const st = states?.[f.key];
        const cls = `gq-feat gq-feat--${f.kind} gq-ft-${f.type}${st ? ` is-${st}` : ''}`;
        return (
          <g key={f.key} className={cls}>
            {f.kind === 'line' && <path d={f.d} className="gq-feat__hit" data-key={f.key} />}
            <path d={f.d} className="gq-feat__shape" data-key={f.kind === 'area' ? f.key : undefined} />
            {f.kind === 'line' && <path d={f.d} className="gq-feat__core" pointerEvents="none" />}
          </g>
        );
      })}
    </g>
  );
});

function FeaturePoints({ features, states, k }) {
  return (
    <g className="gq-fpts">
      {features.filter((f) => f.kind === 'point').map((f) => {
        const st = states?.[f.key];
        const [x, y] = f.xy;
        return (
          <g key={f.key} className={`gq-fpt gq-ft-${f.type}${st ? ` is-${st}` : ''}`}>
            <circle cx={x} cy={y} r={14 * k} className="gq-fpt__hit" data-key={f.key} />
            <circle cx={x} cy={y} r={7 * k} className="gq-fpt__dot" pointerEvents="none" />
          </g>
        );
      })}
    </g>
  );
}

function Markers({ entries, states, colorBy, k }) {
  const items = useMemo(() => [...entries.values()].filter((e) => e.marker), [entries]);
  return (
    <g className="gq-mks">
      {items.map((e) => {
        const [x, y] = e.centroid;
        const st = states?.[e.key];
        return (
          <g key={e.key} className={`gq-mk gq-c-${colorBy === 'continent' ? e.cont : 'none'}${st ? ` is-${st}` : ''}`}>
            <circle cx={x} cy={y} r={11 * k} className="gq-mk__hit" data-key={e.key} data-cont={e.cont} />
            <circle cx={x} cy={y} r={4.6 * k} className="gq-mk__dot" pointerEvents="none" />
          </g>
        );
      })}
    </g>
  );
}

// Etiqueta con halo que mantiene su tamaño en pantalla.
export function MapLabel({ x, y, text, tone = 'info', k, pin = true }) {
  const fs = 13.5 * k;
  return (
    <g className={`gq-lbl is-${tone}`} pointerEvents="none">
      {pin && <circle cx={x} cy={y} r={3.2 * k} className="gq-lbl__pin" />}
      <text x={x} y={y - 9 * k} fontSize={fs} textAnchor="middle" className="gq-lbl__halo" strokeWidth={4 * k}>{text}</text>
      <text x={x} y={y - 9 * k} fontSize={fs} textAnchor="middle" className="gq-lbl__text">{text}</text>
    </g>
  );
}

// Anillo que late alrededor de un punto (objetivo revelado, océano señalado).
export function PulseRing({ x, y, k, tone = 'target', r = 16 }) {
  return (
    <g className={`gq-ring is-${tone}`} pointerEvents="none">
      <circle cx={x} cy={y} r={r * k} className="gq-ring__wave" />
      <circle cx={x} cy={y} r={r * 0.42 * k} className="gq-ring__core" />
    </g>
  );
}

/* ───────── mapa ───────── */

const NO_FEATURES = [];

function MapView({
  world,
  entries,
  view,
  states,
  colorBy = 'uniform',
  groupByContinent = false,
  pickable = false,
  interactive = true,
  controls = true,
  markers = true,
  tooltip = false,
  features = NO_FEATURES,
  featuresPickable = false,
  meshes,
  labels,
  overlay,
  onPick,
  className = '',
  ariaLabel = 'Mapa',
}) {
  const layer = entries || world.entries;
  // Los mares van por debajo de la tierra (sus polígonos pisan la costa).
  const seas = useMemo(() => features.filter((f) => f.type === 'sea'), [features]);
  const onLand = useMemo(() => features.filter((f) => f.type !== 'sea'), [features]);
  const wrapRef = useRef(null);
  const target = view || world.views.world;
  const [aspect, setAspect] = useState(2);
  const [pxW, setPxW] = useState(800);
  const [vb, setVb] = useState(() => fitAspect(target, 2));
  const [tip, setTip] = useState(null);
  const vbRef = useRef(vb);
  const aspectRef = useRef(aspect);
  const measured = useRef(false);
  const anim = useRef(0);
  const gesture = useRef(null);
  const pointers = useRef(new Map());

  useEffect(() => { vbRef.current = vb; }, [vb]);
  useEffect(() => { setTip(null); }, [layer]);
  useEffect(() => { aspectRef.current = aspect; }, [aspect]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        aspectRef.current = width / height;
        measured.current = true;
        setAspect(width / height);
        setPxW(width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const animateTo = useCallback((v, dur = 700) => {
    cancelAnimationFrame(anim.current);
    const a = aspectRef.current;
    const to = clampView(fitAspect(v, a), world, a);
    const from = vbRef.current;
    if (dur <= 0 || prefersReducedMotion()) {
      setVb(to);
      return;
    }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = ease(p);
      setVb({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e });
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, [world]);

  // Ir a la vista pedida cuando cambia (o al medir el lienzo por primera vez, sin animar).
  const viewKey = `${target.x.toFixed(2)}|${target.y.toFixed(2)}|${target.w.toFixed(2)}|${target.h.toFixed(2)}`;
  useEffect(() => {
    animateTo(target, measured.current ? 700 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- viewKey resume la vista
  }, [viewKey, animateTo]);
  useEffect(() => {
    animateTo(target, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar el tamaño del lienzo
  }, [aspect]);

  const zoomAt = useCallback((v, scale, px, py, rect) => {
    const a = aspectRef.current;
    const w = Math.min(maxViewW(world, a), Math.max(world.width / (world.maxZoom || 45), v.w * scale));
    const s = w / v.w;
    const fx = (px - rect.left) / rect.width;
    const fy = (py - rect.top) / rect.height;
    const h = v.h * s;
    return clampView({ x: v.x + (v.w - w) * fx, y: v.y + (v.h - h) * fy, w, h }, world, a);
  }, [world]);

  // Rueda: zoom alrededor del cursor (listener no pasivo para poder cancelar el scroll).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !interactive) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      cancelAnimationFrame(anim.current);
      const rect = el.getBoundingClientRect();
      const scale = Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.004);
      setVb((v) => zoomAt(v, scale, e.clientX, e.clientY, rect));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive, zoomAt]);

  const nameOf = (key) => world.nameOf?.(key) ?? layer.get(key)?.name ?? null;

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    cancelAnimationFrame(anim.current);
    if (pointers.current.size === 1) {
      const hit = e.target.closest?.('[data-key]');
      gesture.current = { type: 'pan', x: e.clientX, y: e.clientY, vb: vbRef.current, moved: false, key: hit?.dataset.key || null, cont: hit?.dataset.cont || null };
    } else if (pointers.current.size === 2 && interactive) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), vb: vbRef.current, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, moved: true };
    }
  };

  const onPointerMove = (e) => {
    if (tooltip && !gesture.current) {
      const hit = e.target.closest?.('[data-key]');
      const name = hit ? nameOf(hit.dataset.key) : null;
      const rect = wrapRef.current.getBoundingClientRect();
      setTip(name ? { x: e.clientX - rect.left, y: e.clientY - rect.top, text: name } : null);
    }
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const rect = wrapRef.current.getBoundingClientRect();
    if (g.type === 'pan') {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.moved && Math.hypot(dx, dy) > 6) {
        g.moved = true;
        setTip(null);
      }
      if (g.moved && interactive) {
        const k = g.vb.w / rect.width;
        setVb(clampView({ ...g.vb, x: g.vb.x - dx * k, y: g.vb.y - dy * k }, world, aspectRef.current));
      }
    } else if (g.type === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      setVb(zoomAt(g.vb, g.dist / dist, g.mx, g.my, rect));
    }
  };

  const endPointer = (e, cancelled) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (!cancelled && g?.type === 'pan' && !g.moved && (pickable || featuresPickable) && g.key) onPick?.(g.key, g.cont);
    if (pointers.current.size === 0) {
      gesture.current = null;
    } else if (g?.type === 'pinch') {
      // Queda un dedo: sigue desplazando, sin contar como toque.
      const [p] = [...pointers.current.values()];
      gesture.current = { type: 'pan', x: p.x, y: p.y, vb: vbRef.current, moved: true, key: null, cont: null };
    }
  };

  const zoomButton = (scale) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const v = zoomAt(vbRef.current, scale, rect.left + rect.width / 2, rect.top + rect.height / 2, rect);
    animateTo(v, 320);
  };

  const k = vb.w / pxW; // unidades del mapa por píxel
  const cls = [
    'gq-map',
    pickable && 'is-pickable',
    groupByContinent && 'gq-map--group',
    interactive && 'is-interactive',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={wrapRef}
      className={cls}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPointer(e, false)}
      onPointerCancel={(e) => endPointer(e, true)}
      onPointerLeave={() => setTip(null)}
    >
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="gq-map__svg" role="img" aria-label={ariaLabel}>
        <MapBase world={world} />
        {seas.length > 0 && <Features features={seas} states={states} pickable={featuresPickable} className="gq-feats--sea" />}
        <Lands entries={layer} states={states} colorBy={colorBy} group={groupByContinent} />
        {meshes?.map((m) => <path key={m.key} d={m.d} className={`gq-mesh ${m.cls || ''}`} pointerEvents="none" />)}
        {world.frames && <path d={world.frames} className="gq-frames" pointerEvents="none" />}
        <Features features={onLand} states={states} pickable={featuresPickable} />
        <Highlights entries={layer} states={states} />
        {markers && <Markers entries={layer} states={states} colorBy={colorBy} k={k} />}
        <FeaturePoints features={features} states={states} k={k} />
        {overlay?.(k)}
        {labels?.map((l) => <MapLabel key={`${l.text}-${l.x}`} {...l} k={k} />)}
      </svg>
      {tip && <div className="gq-map__tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
      {interactive && controls && (
        <div className="gq-map__ctrls" onPointerDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => zoomButton(0.6)} aria-label="Acercar" title="Acercar"><Plus size={18} /></button>
          <button type="button" onClick={() => zoomButton(1.6)} aria-label="Alejar" title="Alejar"><Minus size={18} /></button>
          <button type="button" onClick={() => animateTo(target, 500)} aria-label="Encuadre inicial" title="Encuadre inicial"><Maximize2 size={16} /></button>
        </div>
      )}
    </div>
  );
}

export default memo(MapView);
