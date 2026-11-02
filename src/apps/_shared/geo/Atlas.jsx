// Atlas: material de estudio del motor de mapas. Mapa coloreado, buscador,
// lista agrupada y ficha de cada elemento. Se abre a pantalla completa por
// encima de la app. El contenido lo pone cada app con `atlas`:
//   title, subtitle                 cabecera
//   items: [{ key, name, sub, flag, group, search: [] }]
//   groups: [{ id, label, color }]  filtros y secciones de la lista
//   layers?: [{ id, label }]        capas del mapa (p. ej. Comunidades / Provincias)
//   itemLayer(key)                  capa donde está un elemento
//   renderFacts(key, select)        ficha de un elemento
//   renderOther(key)                ficha de algo tocado en el mapa que no está en la lista
//   groupView(groupId)              encuadre de un grupo
//   credits                         texto de créditos al pie
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Globe2, Search, X, Map as MapIcon, List, Info } from 'lucide-react';
import { Segmented, useAppMeta } from '../kit';
import MapView from './MapView';
import { Flag } from './Visuals';

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Atlas({ open, onClose, world, atlas }) {
  // app a pantalla completa: el atlas también, y oscuro como la app
  const stage = useAppMeta().layout === 'stage';
  const [selected, setSelected] = useState(null);
  const [other, setOther] = useState(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('map');
  const [layerId, setLayerId] = useState(atlas.layers?.[0]?.id ?? null);
  const [query, setQuery] = useState('');
  const closeRef = useRef(null);
  const cardRef = useRef(null);

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

  const byKey = useMemo(() => new Map(atlas.items.map((it) => [it.key, it])), [atlas.items]);

  const matches = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return atlas.items.filter((it) => [it.name, it.sub, ...(it.search || [])].some((s) => s && norm(s).includes(q)))
      .sort((a, b) => (norm(a.name).startsWith(q) ? -1 : 0) - (norm(b.name).startsWith(q) ? -1 : 0) || a.name.localeCompare(b.name, 'es'))
      .slice(0, 8);
  }, [query, atlas.items]);

  const visibleItems = useMemo(() => atlas.items.filter((it) => !layerId || !atlas.itemLayer || atlas.itemLayer(it.key) === layerId), [atlas, layerId]);

  const listed = useMemo(() => atlas.groups
    .filter((g) => filter === 'all' || filter === g.id)
    .map((g) => ({ group: g, items: visibleItems.filter((it) => it.group === g.id).sort((a, b) => a.name.localeCompare(b.name, 'es')) }))
    .filter((s) => s.items.length), [filter, atlas.groups, visibleItems]);

  const entries = world ? world.layer(layerId) : null;

  const states = useMemo(() => {
    const s = {};
    if (!entries) return s;
    if (filter !== 'all') for (const e of entries.values()) if (e.cont !== filter) s[e.key] = 'dim';
    if (selected && entries.has(selected)) {
      for (const n of world.neighborsOf(selected, layerId)) s[n] = 'neighbor';
      s[selected] = 'selected';
    }
    return s;
  }, [world, entries, filter, selected, layerId]);

  const mapView = useMemo(() => {
    if (!world) return null;
    if (selected && entries?.has(selected)) return world.focusView(selected, layerId, true);
    if (filter !== 'all') return atlas.groupView?.(filter) || world.views.world;
    return world.views.world;
  }, [world, entries, selected, filter, layerId, atlas]);

  const select = (key) => {
    setSelected(key);
    setOther(null);
    setQuery('');
    setView('map');
    if (atlas.itemLayer) setLayerId(atlas.itemLayer(key));
    requestAnimationFrame(() => cardRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' }));
  };

  const onPick = (key) => {
    if (byKey.has(key)) select(key);
    else if (atlas.renderOther?.(key)) {
      setSelected(null);
      setOther(key);
    }
  };

  if (!open) return null;

  return createPortal(
    <motion.div className={`gq-atlas${stage ? ' gq-atlas--stage' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="dialog" aria-modal="true" aria-label={atlas.title}>
      <motion.div className={`gk-shell ${stage ? 'gk-theme-dark' : 'gk-theme-auto'} gq-atlas__panel`} initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
        <header className="gq-atlas__top">
          <div className="gq-atlas__title">
            <span className="gq-atlas__logo"><Globe2 size={20} /></span>
            <div>
              <strong>{atlas.title}</strong>
              <span>{atlas.subtitle}</span>
            </div>
          </div>
          <div className="gq-atlas__search">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={atlas.searchPlaceholder || 'Buscar…'}
              aria-label={atlas.searchPlaceholder || 'Buscar'}
            />
            {matches.length > 0 && (
              <ul className="gq-atlas__results" role="listbox">
                {matches.map((it) => (
                  <li key={it.key}>
                    <button type="button" onClick={() => select(it.key)}>
                      {it.flag && <Flag flag={it.flag} />}
                      <span><strong>{it.name}</strong><small>{it.sub}</small></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Segmented
            size="sm"
            value={view}
            onChange={setView}
            options={[{ value: 'map', label: 'Mapa', icon: MapIcon }, { value: 'list', label: 'Lista', icon: List }]}
          />
          <button ref={closeRef} type="button" className="gq-atlas__close" onClick={onClose} aria-label="Cerrar atlas"><X size={20} /></button>
        </header>

        <div className="gq-atlas__filters" role="group" aria-label="Filtrar">
          {atlas.layers && (
            <Segmented size="sm" value={layerId} onChange={(id) => { setLayerId(id); setSelected(null); }} options={atlas.layers.map((l) => ({ value: l.id, label: l.label }))} />
          )}
          <button type="button" className={`gq-filter ${filter === 'all' ? 'is-on' : ''}`} onClick={() => setFilter('all')}>Todos</button>
          {atlas.groups.map((g) => (
            <button key={g.id} type="button" className={`gq-filter ${filter === g.id ? 'is-on' : ''}`} style={{ '--c': g.color }} onClick={() => { setFilter(g.id); setSelected(null); }}>
              <i /> {g.label}
            </button>
          ))}
        </div>

        <div className="gq-atlas__body">
          <div className="gq-atlas__main">
            {view === 'map' ? (
              world && (
                <MapView
                  world={world}
                  entries={entries}
                  view={mapView}
                  states={states}
                  colorBy={atlas.colorBy || 'continent'}
                  meshes={world.meshesFor?.(layerId)}
                  pickable
                  tooltip
                  onPick={onPick}
                  className="gq-map--atlas"
                  ariaLabel={atlas.title}
                />
              )
            ) : (
              <div className="gq-atlas__list">
                {listed.map(({ group, items }) => (
                  <section key={group.id}>
                    <h4 style={{ '--c': group.color }}><i /> {group.label} <small>{items.length}</small></h4>
                    <div className="gq-atlas__grid">
                      {items.map((it) => (
                        <button key={it.key} type="button" className={`gq-tile ${selected === it.key ? 'is-on' : ''}`} onClick={() => select(it.key)}>
                          {it.flag && <Flag flag={it.flag} />}
                          <span><strong>{it.name}</strong><small>{it.sub}</small></span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
          <aside className="gq-atlas__card" ref={cardRef}>
            {selected && atlas.renderFacts(selected, select)}
            {!selected && other && atlas.renderOther(other)}
            {!selected && !other && (
              <div className="gq-atlas__empty">
                <Info size={22} />
                <strong>{atlas.emptyTitle || 'Elige un elemento'}</strong>
                <p>{atlas.emptyText || 'Tócalo en el mapa, búscalo o elígelo en la lista.'}</p>
              </div>
            )}
            {atlas.credits && <p className="gq-atlas__credits">{atlas.credits}</p>}
          </aside>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
