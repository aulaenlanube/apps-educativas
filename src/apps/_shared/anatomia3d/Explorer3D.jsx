// Explorador 3D del cuerpo humano: atlas 3D de las apps del cuerpo y modo libre de
// Anatomía 3D. Deslizador de capas (piel → músculos → profundos → órganos →
// esqueleto), vasos y nervios, lupa de rayos X, cortes, despiece, latido,
// buscador y ficha de cada estructura en el idioma activo.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Crosshair, Eye, HeartPulse, Layers, Minus, Plus, RotateCw, Scan, Scissors, Search, Sparkles, X, Maximize2, Boxes, Network, Droplet,
} from 'lucide-react';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { isWebGLAvailable } from '@/services/graphicsQuality';
import { BY_KEY } from '../anatomia/data/structures';
import { nameOf, genderOf, getLang } from '../anatomia/text';
import { StructureFacts } from '../anatomia/components';
import { Body3DCanvas, Body3D, BODY_TARGET, BODY_CAMERA } from './Body3D';
import { loadIndex3d } from './model';
import { keyForLevel } from './world3d';
import { ui3d, STOPS, stopConfig } from './ui3d';
import '../anatomia/anatomia.css';
import './anatomia3d.css';

export { keyForLevel };

export function sideLabel(key, side, lang) {
  if (!side) return '';
  const t = ui3d(lang);
  const g = genderOf(key, lang) || 'm';
  if (g.endsWith('p')) return '';
  const fem = g.startsWith('f');
  return side === 'R' ? (fem ? t.rightF : t.right) : (fem ? t.leftF : t.left);
}

const CUT_RANGE = { x: [-0.32, 0.32], y: [0.02, 1.74], z: [-0.18, 0.2] };

export default function Explorer3D({ lv = 6, lang = getLang(), platesWith = null, onOpenPlate = null, initialStop = 'musculos', compact = false }) {
  const t = ui3d(lang);
  const { tier } = useGraphicsQuality();
  const [webgl] = useState(() => isWebGLAvailable());
  const [stop, setStop] = useState(initialStop);
  const [vessels, setVessels] = useState(false);
  const [nerves, setNerves] = useState(false);
  const [lens, setLens] = useState(false);
  const [cutAxis, setCutAxis] = useState(null);
  const [cutAt, setCutAt] = useState(0.5);
  const [beat, setBeat] = useState(() => tier === 'high');
  const [detail, setDetail] = useState(() => tier === 'high');
  const [sel, setSel] = useState(null); // { key, side }
  const [isolate, setIsolate] = useState(false);
  const [explode, setExplode] = useState(0);
  const [hover, setHover] = useState(null);
  const [query, setQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [names, setNames] = useState([]);
  const [focusTick, setFocusTick] = useState(0);
  const canvas = useRef(null);
  const mouse = useRef(false);

  useEffect(() => {
    const m = window.matchMedia?.('(pointer: fine)');
    mouse.current = Boolean(m?.matches);
  }, []);

  // nombres para el buscador (todas las claves del modelo que existen en el catálogo y en el nivel)
  useEffect(() => {
    let alive = true;
    loadIndex3d().then((idx) => {
      if (!alive) return;
      const keys = new Set();
      for (const layer of Object.values(idx.layers)) for (const k of layer.byKey.keys()) if (BY_KEY[k] && (BY_KEY[k].l ?? 9) <= lv) keys.add(k);
      setNames([...keys].map((k) => ({ k, n: nameOf(k, lang) })).sort((a, b) => a.n.localeCompare(b.n, lang)));
    }).catch(() => {});
    return () => { alive = false; };
  }, [lv, lang]);

  const conf = useMemo(() => stopConfig(stop, { vessels, nerves, lens }), [stop, vessels, nerves, lens]);
  const clip = useMemo(() => {
    if (!cutAxis) return null;
    const [a, b] = CUT_RANGE[cutAxis];
    return { axis: cutAxis, at: a + (b - a) * cutAt };
  }, [cutAxis, cutAt]);

  const states = useMemo(() => (sel ? { [sel.key]: 'selected' } : null), [sel]);
  const labels = useMemo(() => (sel ? [{ key: sel.key, text: `${nameOf(sel.key, lang)}${sel.side ? ` ${sideLabel(sel.key, sel.side, lang)}` : ''}`, tone: 'info' }] : null), [sel, lang]);

  const onPick = useCallback((key, hit) => {
    if (!hit) { setSel(null); setIsolate(false); setExplode(0); return; }
    const k = keyForLevel(hit.part, lv);
    const chain = [hit.part.k, ...(hit.part.up || [])];
    const up = chain.slice(chain.indexOf(k) + 1);
    setSel((s) => (s?.key === k && s?.side === hit.part.side ? null : { key: k, side: hit.part.side, up }));
    setExplode(0);
  }, [lv]);
  const onHover = useCallback((key, hit) => setHover(hit ? keyForLevel(hit.part, lv) : null), [lv]);

  const ctl = () => canvas.current?.controls();
  const resetView = () => {
    ctl()?.setLookAt(...BODY_CAMERA, ...BODY_TARGET, true);
  };
  // Al elegir un corte, la cámara mira de frente a la cara cortada.
  const aimCut = (axis, at) => {
    const c = ctl();
    if (!c || !axis) return;
    const [a, b] = CUT_RANGE[axis];
    const pos = a + (b - a) * at;
    if (axis === 'x') c.setLookAt(3.7, 0.95, 0.35, 0, 0.88, 0, true);
    else if (axis === 'z') c.setLookAt(0.35, 0.95, 3.7, 0, 0.88, 0, true);
    else c.setLookAt(0, pos + 1.25, 0.75, 0, pos - 0.05, 0, true);
  };
  const chooseCut = (axis) => {
    setCutAxis(axis);
    const at = axis === 'y' ? 0.72 : 0.5;
    setCutAt(at);
    aimCut(axis, at);
  };
  const focusSel = () => { if (sel) setFocusTick((n) => n + 1); };
  const focusKey = useMemo(() => (focusTick && sel ? sel.key : null), [focusTick, sel]);

  const pickName = (k) => {
    setSel({ key: k, side: '', up: [] });
    setQuery('');
    setFocusTick((n) => n + 1);
    // si la estructura está en una capa apagada, ir a su parada
    loadIndex3d().then((idx) => {
      const layerOf = Object.values(idx.layers).find((l) => l.byKey.has(k))?.id;
      const toStop = { piel: 'piel', musculos: 'musculos', 'musculos-prof': 'musculos-prof', organos: 'organos', esqueleto: 'esqueleto' }[layerOf];
      if (layerOf === 'vasos') setVessels(true);
      else if (layerOf === 'nervios') setNerves(true);
      else if (toStop && conf.layers[layerOf] !== 'solid') setStop(toStop);
    });
  };

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    const nq = norm(q);
    return names.filter((x) => norm(x.n).includes(nq)).slice(0, 8);
  }, [query, names]);

  // Despiece de la estructura o del grupo que la contiene, si tiene varias piezas
  // (al tocar el frontal se despieza el cráneo; al tocar una válvula, el corazón).
  const [explodeKey, setExplodeKey] = useState(null);
  useEffect(() => {
    if (!sel) { setExplodeKey(null); return undefined; }
    let alive = true;
    loadIndex3d().then((idx) => {
      const count = (k) => Object.values(idx.layers).reduce((n, l) => n + (l.byKey.get(k)?.length || 0), 0);
      const k = [sel.key, ...(sel.up || [])].find((c) => count(c) > 2 && BY_KEY[c]) || null;
      if (alive) setExplodeKey(k);
    }).catch(() => {});
    return () => { alive = false; };
  }, [sel]);
  const groupParts = explodeKey;

  if (!webgl) return <div className="a3d-explorer a3d-explorer--none"><p>{t.noWebgl}</p></div>;

  return (
    <div className={`a3d-explorer${compact ? ' is-compact' : ''}`}>
      <div className="a3d-stage">
        <Body3DCanvas ref={canvas} tier={tier}>
          <Body3D
            layers={conf.layers}
            lod={detail ? 'h' : 'l'}
            states={states}
            isolate={isolate && sel ? [sel.key] : null}
            isolateMode="ghost"
            onPick={onPick}
            onHover={onHover}
            lens={lens}
            lensCut={conf.lensCut}
            lensOnly={conf.lensOnly}
            clip={clip}
            animate={beat && !explode}
            explode={explodeKey && explode > 0 ? { key: explodeKey, amount: explode } : null}
            focus={focusKey}
            labels={labels}
            onLoaded={() => setLoaded(true)}
          />
        </Body3DCanvas>

        {!loaded && <div className="a3d-loading"><span className="a3d-spinner" />{t.loading}</div>}

        {/* capas */}
        <div className="a3d-panel a3d-layers" role="group" aria-label={t.layers}>
          <span className="a3d-panel__title"><Layers size={15} /> {t.layers}</span>
          <div className="a3d-stops">
            {STOPS.map((s, i) => (
              <button key={s.id} type="button" className={`a3d-stop${stop === s.id ? ' is-on' : ''}`} style={{ '--i': i }} onClick={() => setStop(s.id)} aria-pressed={stop === s.id}>
                <span className={`a3d-stop__dot a3d-stop__dot--${s.id}`} />
                {t.stops[s.id]}
              </button>
            ))}
          </div>
          <div className="a3d-toggles">
            <button type="button" className={`a3d-chip a3d-chip--vas${vessels ? ' is-on' : ''}`} onClick={() => setVessels((v) => !v)} aria-pressed={vessels}><Droplet size={14} /> {t.vessels}</button>
            <button type="button" className={`a3d-chip a3d-chip--ner${nerves ? ' is-on' : ''}`} onClick={() => setNerves((v) => !v)} aria-pressed={nerves}><Network size={14} /> {t.nerves}</button>
          </div>
        </div>

        {/* herramientas */}
        <div className="a3d-panel a3d-tools">
          <button type="button" className={`a3d-tool${lens ? ' is-on' : ''}`} onClick={() => setLens((v) => !v)} aria-pressed={lens} title={t.xrayHelp}><Scan size={18} /><span>{t.xray}</span></button>
          <div className="a3d-tool-group">
            <button type="button" className={`a3d-tool${cutAxis ? ' is-on' : ''}`} onClick={() => chooseCut(cutAxis ? null : 'x')} aria-pressed={Boolean(cutAxis)}><Scissors size={18} /><span>{t.cut}</span></button>
            {cutAxis && (
              <div className="a3d-cut">
                <div className="a3d-seg">
                  {['x', 'z', 'y'].map((a) => <button key={a} type="button" className={cutAxis === a ? 'is-on' : ''} onClick={() => chooseCut(a)}>{t.cutAxes[a]}</button>)}
                </div>
                <input type="range" min={0} max={1} step={0.005} value={cutAt} onChange={(e) => setCutAt(+e.target.value)} aria-label={t.cut} />
              </div>
            )}
          </div>
          <button type="button" className={`a3d-tool${beat ? ' is-on' : ''}`} onClick={() => setBeat((v) => !v)} aria-pressed={beat}><HeartPulse size={18} /><span>{t.beat}</span></button>
          <button type="button" className={`a3d-tool${detail ? ' is-on' : ''}`} onClick={() => { setLoaded(false); setDetail((v) => !v); }} aria-pressed={detail}><Sparkles size={18} /><span>{t.detail}</span></button>
        </div>

        {/* cámara */}
        <div className="a3d-cam">
          <button type="button" onClick={() => ctl()?.dolly(0.45, true)} aria-label={t.zoomIn}><Plus size={18} /></button>
          <button type="button" onClick={() => ctl()?.dolly(-0.45, true)} aria-label={t.zoomOut}><Minus size={18} /></button>
          <button type="button" onClick={() => ctl()?.rotate(Math.PI / 4, 0, true)} aria-label={t.rotate}><RotateCw size={18} /></button>
          <button type="button" onClick={resetView} aria-label={t.reset}><Maximize2 size={18} /></button>
        </div>

        {/* buscador */}
        <div className="a3d-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
          {hits.length > 0 && (
            <ul className="a3d-search__list">
              {hits.map((h) => <li key={h.k}><button type="button" onClick={() => pickName(h.k)}>{h.n}</button></li>)}
            </ul>
          )}
        </div>

        {hover && !sel && <div className="a3d-hover">{nameOf(hover, lang)}</div>}
        <AnimatePresence>
          {sel && (
            <motion.aside
              key={sel.key}
              className="a3d-facts"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
            >
              <button type="button" className="a3d-facts__close" onClick={() => { setSel(null); setIsolate(false); setExplode(0); }} aria-label="×"><X size={16} /></button>
              <StructureFacts k={sel.key} lv={lv} lang={lang} platesWith={platesWith?.(sel.key) || []} onPlate={onOpenPlate} />
              <div className="a3d-facts__actions">
                <button type="button" className="a3d-chip" onClick={focusSel}><Crosshair size={14} /> {t.center}</button>
                <button type="button" className={`a3d-chip${isolate ? ' is-on' : ''}`} onClick={() => setIsolate((v) => !v)}><Eye size={14} /> {isolate ? t.showAll : t.isolate}</button>
                {groupParts && (
                  <label className="a3d-explode">
                    <Boxes size={14} /> {groupParts === sel.key ? t.explode : `${t.explode}: ${nameOf(groupParts, lang)}`}
                    <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} />
                  </label>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        {!sel && loaded && <div className="a3d-hint">{mouse.current ? t.tapHintMouse : t.tapHint}{lens ? ` ${t.xrayHelp}` : ''}</div>}
      </div>

      <p className="a3d-credits">{t.credits}</p>
    </div>
  );
}
