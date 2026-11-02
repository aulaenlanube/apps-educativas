// Atlas anatómico: material de estudio de las apps del cuerpo humano. Láminas
// agrupadas por categoría, vista de frente o de espaldas, lupa de rayos X que
// deja ver otra capa debajo del dedo, buscador y ficha de cada estructura.
// Se abre a pantalla completa por encima de la app (mismas props que geo/Atlas).
//   atlas = { title, subtitle, plates: [ids], lv, lang, lensFor?(id) }
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Info, ScanLine, Search, X, RotateCcw, Layers } from 'lucide-react';
import MapView from '../geo/MapView';
import { BY_KEY, STRUCTURES } from './data/structures';
import { PLATE_BY_ID, PLATE_CATS, VIEW_LABEL } from './data/plates';
import { APP_UI } from './uiStrings';
import { nameOf, systemName } from './text';
import { StructureFacts } from './components';

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const LI = { es: 0, en: 1, va: 2 };

// Capa que se ve con la lupa (misma vista, una capa "más adentro").
const LENS = {
  'cuerpo-a': 'mus-a', 'cuerpo-p': 'mus-p', 'mus-a': 'esq-a', 'mus-p': 'esq-p', 'org-a': 'esq-a',
  'org-prof-a': 'org-a', 'esq-a': 'org-a', 'esq-p': 'nerv-p', 'vas-a': 'esq-a', 'nerv-a': 'org-a', 'nerv-p': 'esq-p',
};
const LENS_CHOICES = ['cuerpo-a', 'mus-a', 'org-a', 'esq-a', 'vas-a', 'nerv-a'];
const viewOf = (id) => (id.endsWith('-p') ? 'p' : 'a');
const asView = (id, v) => (v === 'p' ? id.replace(/-a$/, '-p') : id.replace(/-p$/, '-a'));

export default function BodyAtlas({ open, onClose, world, atlas }) {
  const lang = atlas.lang || 'es';
  const t = APP_UI[lang] || APP_UI.es;
  const li = LI[lang] ?? 0;
  const plates = useMemo(() => atlas.plates.filter((id) => world.available(id)), [atlas.plates, world]);
  const [plateId, setPlateId] = useState(plates[0]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [lensOn, setLensOn] = useState(false);
  const [lensId, setLensId] = useState(null);
  const [ready, setReady] = useState(0);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const lensTarget = lensOn ? (lensId && world.available(asView(lensId, viewOf(plateId))) ? asView(lensId, viewOf(plateId)) : LENS[plateId]) : null;
  const canLens = Boolean(LENS[plateId]);

  useEffect(() => {
    if (!open || !plateId) return undefined;
    let alive = true;
    world.ensure([plateId, lensTarget].filter(Boolean)).then(() => { if (alive) setReady((n) => n + 1); }).catch(() => {});
    return () => { alive = false; };
  }, [open, plateId, lensTarget, world]);

  const loaded = world.has(plateId) && (!lensTarget || world.has(lensTarget));
  const scope = useMemo(
    () => (loaded ? (lensTarget ? world.scopeWithLens(plateId, lensTarget) : world.scope(plateId)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ready fuerza el recálculo al cargar
    [loaded, plateId, lensTarget, world, ready],
  );
  const entries = scope?.entries;

  // Buscador: estructuras del nivel que aparecen en alguna lámina del atlas.
  const keyPlates = useMemo(() => {
    const m = new Map();
    for (const id of plates) for (const k of world.index.plates[id]?.keys || []) {
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(id);
    }
    return m;
  }, [plates, world]);
  const matches = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return STRUCTURES.filter((s) => keyPlates.has(s.k) && s.l <= Math.max(atlas.lv || 6, 3) && [nameOf(s.k, lang), ...(s.alt || [])].some((n) => norm(n).includes(q)))
      .sort((a, b) => (norm(nameOf(a.k, lang)).startsWith(q) ? -1 : 0) - (norm(nameOf(b.k, lang)).startsWith(q) ? -1 : 0))
      .slice(0, 8);
  }, [query, keyPlates, lang, atlas.lv]);

  const choosePlate = (id) => {
    setPlateId(id);
    if (selected && !(world.index.plates[id]?.keys || []).includes(selected)) setSelected(null);
  };
  const selectKey = (k) => {
    setQuery('');
    setSelected(k);
    const ps = keyPlates.get(k) || [];
    if (!ps.includes(plateId) && ps.length) setPlateId(ps[0]);
  };

  const states = useMemo(() => (selected && entries?.has(selected) ? { [selected]: 'selected' } : {}), [selected, entries]);
  const view = useMemo(() => {
    if (!scope) return null;
    return selected && entries?.has(selected) ? scope.focusView(selected, null, true) : scope.views.world;
  }, [scope, selected, entries]);

  if (!open) return null;
  const meta = PLATE_BY_ID[plateId];
  const pair = meta?.pair && world.available(meta.pair) ? meta.pair : null;
  // Cada pareja (frente/espalda, exterior/corte…) ocupa una sola casilla: la primera.
  const shown = plates.filter((id, i) => {
    const pr = PLATE_BY_ID[id]?.pair;
    return !(pr && plates.indexOf(pr) > -1 && plates.indexOf(pr) < i);
  });
  const cats = PLATE_CATS.map((c) => ({ ...c, items: shown.filter((id) => PLATE_BY_ID[id]?.cat === c.id) })).filter((c) => c.items.length);
  const pairLabel = pair ? (VIEW_LABEL[world.index.plates[pair]?.view]?.[li] && world.index.plates[pair]?.kind === 'render' && world.index.plates[plateId]?.kind === 'render' ? VIEW_LABEL[world.index.plates[pair].view][li] : PLATE_BY_ID[pair]?.t[li]) : null;

  return createPortal(
    <motion.div className="gq-atlas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-modal="true" aria-label={atlas.title}>
      <motion.div className="gk-shell gk-theme-dark gq-atlas__panel ana-atlas" initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
        <header className="gq-atlas__top">
          <div className="gq-atlas__title">
            <span className="gq-atlas__logo"><ScanLine size={20} /></span>
            <div>
              <strong>{atlas.title}</strong>
              <span>{atlas.subtitle}</span>
            </div>
          </div>
          <div className="gq-atlas__search">
            <Search size={17} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} />
            {matches.length > 0 && (
              <ul className="gq-atlas__results" role="listbox">
                {matches.map((s) => (
                  <li key={s.k}>
                    <button type="button" onClick={() => selectKey(s.k)}>
                      <span><strong>{nameOf(s.k, lang)}</strong><small>{systemName(s.s, lang)}</small></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button ref={closeRef} type="button" className="gq-atlas__close" onClick={onClose} aria-label={t.close}><X size={20} /></button>
        </header>

        <div className="gq-atlas__body">
          <nav className="ana-atlas__plates" aria-label={t.plates}>
            {cats.map((c) => (
              <section key={c.id} className="ana-atlas__cat">
                <h5>{c.n[li]}</h5>
                <div>
                  {c.items.map((id) => {
                    const on = id === plateId || PLATE_BY_ID[id]?.pair === plateId;
                    return (
                      <button key={id} type="button" className={`ana-plate-btn ${on ? 'is-on' : ''}`} onClick={() => choosePlate(id)}>
                        <span className="ana-plate-btn__thumb"><img src={world.index.plates[id]?.img} alt="" loading="lazy" decoding="async" /></span>
                        {PLATE_BY_ID[id]?.t[li]}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className="gq-atlas__main" style={{ position: 'relative' }}>
            {scope ? (
              <MapView
                key={plateId}
                world={scope}
                entries={entries}
                view={view}
                states={states}
                pickable
                tooltip
                markers
                onPick={(k) => setSelected(k)}
                className="gq-map--atlas"
                ariaLabel={meta?.t[li] || atlas.title}
                hud={(
                  <div className="ana-atlas__tools">
                    {pair && (
                      <button type="button" onClick={() => choosePlate(pair)}>
                        <RotateCcw size={14} /> {pairLabel}
                      </button>
                    )}
                    {canLens && (
                      <button type="button" className={lensOn ? 'is-on' : ''} onClick={() => setLensOn((v) => !v)} aria-pressed={lensOn}>
                        <ScanLine size={14} /> {t.lens}
                      </button>
                    )}
                    {canLens && lensOn && (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={14} color="#a5f3fc" />
                        <select value={lensTarget ? asView(lensTarget, 'a') : ''} onChange={(e) => setLensId(e.target.value)} aria-label={t.lens}>
                          {LENS_CHOICES.filter((id) => asView(id, viewOf(plateId)) !== plateId && world.available(asView(id, viewOf(plateId)))).map((id) => (
                            <option key={id} value={id}>{PLATE_BY_ID[id]?.t[li]}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              />
            ) : (
              <div className="ana-atlas__loading">{t.loading}</div>
            )}
          </div>

          <aside className="gq-atlas__card">
            {selected && BY_KEY[selected] ? (
              <StructureFacts k={selected} lv={atlas.lv} lang={lang} platesWith={(keyPlates.get(selected) || []).filter((id) => !id.endsWith('-p') || !keyPlates.get(selected).includes(id.replace(/-p$/, '-a')))} onPlate={choosePlate} />
            ) : (
              <div className="gq-atlas__empty">
                <Info size={22} />
                <strong>{t.empty}</strong>
                <p>{t.emptyText}</p>
              </div>
            )}
            <p className="gq-atlas__credits">{t.credits}</p>
          </aside>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
