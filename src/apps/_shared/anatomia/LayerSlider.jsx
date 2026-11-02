// Deslizador «Capas» del atlas: va pelando el cuerpo entero de fuera adentro
// (piel → músculos → órganos → esqueleto, las capas que haya en la vista),
// fundiendo cada lámina con la siguiente. Vertical, en el borde izquierdo del
// mapa (las láminas de cuerpo entero son altas y estrechas: ahí no tapa el
// cuerpo): arriba la piel, abajo el esqueleto. Se arrastra con el dedo o el
// ratón, se toca una capa o se usan las flechas. El valor va al fondo del mapa
// por `mix` (sin re-pintar el atlas); al cambiar la capa dominante avisa con
// onLayer(i) para que el atlas cambie las zonas tocables y la ficha.
import React, { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { dominantLayer, layerBase, stepLayer } from './layers';

// Color de cada capa en el carril (igual que las láminas).
const LAYER_COLOR = {
  cuerpo: '#22d3ee', mus: '#ef4444', 'mus-prof': '#b91c1c', org: '#f9a8d4', 'org-prof': '#c084fc', esq: '#f5ecd2',
};
const THUMB = 30; // px, también en anatomia.css (--ana-thumb)

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
const at = (i, n) => `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${n > 1 ? i / (n - 1) : 0})`;
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export default function LayerSlider({ stack, index, mix, onLayer, t }) {
  const n = stack.length;
  const [v, setV] = useState(index);
  const [railH, setRailH] = useState(0);
  const vRef = useRef(index);
  const domRef = useRef(index);
  const anim = useRef(0);
  const railRef = useRef(null);
  const drag = useRef(null);
  const onLayerRef = useRef(onLayer);
  useEffect(() => { onLayerRef.current = onLayer; });
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  // Alto del carril para mover el tirador con transform (sin tocar el layout).
  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    setRailH(el.clientHeight);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setRailH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const apply = (x, notify = true) => {
    vRef.current = x;
    setV(x);
    mix.set({ v: x });
    const d = dominantLayer(x, n);
    if (d !== domRef.current) {
      domRef.current = d;
      if (notify) onLayerRef.current?.(d);
    }
  };
  const applyRef = useRef(apply);
  applyRef.current = apply;

  // La lámina cambió desde fuera (lista de láminas): ir a esa capa sin animar.
  useEffect(() => {
    if (index < 0 || dominantLayer(vRef.current, n) === index) {
      mix.set({ v: vRef.current });
      return;
    }
    cancelAnimationFrame(anim.current);
    domRef.current = index;
    applyRef.current(index, false);
  }, [index, n, mix]);

  // Pulsar una capa o las flechas: deslizamiento suave hasta ella.
  const glide = (to) => {
    cancelAnimationFrame(anim.current);
    const from = vRef.current;
    if (reduced() || Math.abs(to - from) < 0.01) {
      apply(to);
      return;
    }
    const dur = Math.min(800, 280 + 180 * Math.abs(to - from));
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2;
      applyRef.current(from + (to - from) * e);
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  };

  // Flechas: abajo/derecha = más adentro; arriba/izquierda = más afuera.
  const onKeyDown = (e) => {
    const k = e.key;
    let to = null;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown') to = stepLayer(vRef.current, 1, n);
    else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') to = stepLayer(vRef.current, -1, n);
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = n - 1;
    if (to === null) return;
    e.preventDefault();
    glide(to);
  };

  // Arrastre con el dedo o el ratón (el valor sigue al puntero).
  const valueAt = (clientY) => {
    const r = railRef.current.getBoundingClientRect();
    const span = Math.max(1, r.height - THUMB);
    return clamp((clientY - r.top - THUMB / 2) / span, 0, 1) * (n - 1);
  };
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    cancelAnimationFrame(anim.current);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    drag.current = e.pointerId;
    railRef.current?.focus({ preventScroll: true });
    apply(valueAt(e.clientY));
  };
  const onPointerMove = (e) => {
    if (drag.current !== e.pointerId) return;
    apply(valueAt(e.clientY));
  };
  const endDrag = (e) => {
    if (drag.current === e.pointerId) drag.current = null;
  };

  const names = stack.map((id) => t.layerNames?.[layerBase(id)] || id);
  const shorts = stack.map((id, i) => t.layerShort?.[layerBase(id)] || names[i]);
  const dom = dominantLayer(v, n);
  const rail = stack.map((id, i) => `${LAYER_COLOR[layerBase(id)] || '#67e8f9'} ${at(i, n)}`).join(', ');
  const thumbY = n > 1 ? (v / (n - 1)) * Math.max(0, railH - THUMB) : 0;

  return (
    <div className="ana-layers" role="group" aria-label={t.layers}>
      <div className="ana-layers__head" title={t.layersHint}>
        <Layers size={15} aria-hidden="true" />
        <span>{t.layers}</span>
      </div>
      <div className="ana-layers__body">
        <div
          ref={railRef}
          className="ana-layers__rail"
          role="slider"
          tabIndex={0}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={Math.round(v * 100) / 100}
          aria-valuetext={names[dom]}
          aria-label={`${t.layers} · ${t.layersHint}`}
          style={{ '--ana-rail': `linear-gradient(180deg, ${rail})` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
        >
          <span className="ana-layers__track" aria-hidden="true" />
          {stack.map((id, i) => <i key={id} className={`ana-layers__stop${i === dom ? ' is-on' : ''}`} style={{ top: at(i, n) }} aria-hidden="true" />)}
          <span className="ana-layers__thumb" style={{ transform: `translateY(${thumbY}px)` }} aria-hidden="true" />
        </div>
        <div className="ana-layers__ticks">
          {stack.map((id, i) => (
            <button key={id} type="button" tabIndex={-1} className={i === dom ? 'is-on' : ''} style={{ top: at(i, n) }} onClick={() => glide(i)} title={names[i]}>
              {shorts[i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
