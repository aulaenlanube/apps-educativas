// src/pages/AdaptacionesPage.jsx
// /adaptaciones — TODAS las adaptaciones de la plataforma, agrupadas por app:
// en qué niveles, cursos y asignaturas está cada una, con enlace directo.
// Se calcula del registro real (src/data/appIndex.js), así que nunca se
// desactualiza. Parámetros de URL: ?q=texto, ?nivel=primaria|eso|bachillerato|ad
// y ?app=<id> (abre esa app y baja hasta ella).
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Home, LayoutGrid, Lightbulb, Sparkles, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { NavPill } from '@/components/NavBackButton';
import { AnimatedGradientTitle } from '@/components/ui/GradientTitle';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import useProposeAppDialog from '@/components/proposals/useProposeAppDialog';
import { APP_INDEX, LIVE_APP_STATS, normalizeText } from '@/data/appIndex';
import { STATS_LEVELS, formatCount, SITE_URL } from '@/data/appStats';
import './NavPages.css';
import './AdaptacionesPage.css';

const LEVEL_FILTERS = [{ level: 'all', label: 'Todos' }, ...STATS_LEVELS];
const LEVEL_SHORT = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };
const SORTED = [...APP_INDEX].sort((a, b) => a.name.localeCompare(b.name, 'es'));
const LATEST_KEY = LIVE_APP_STATS.ultima_app?.id;
const plural = (n, one, many) => `${formatCount(n)} ${n === 1 ? one : many}`;

// «1.º–6.º», «3.º, 5.º–6.º»
function gradeRanges(grades) {
  const nums = [...new Set(grades.map(Number))].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < nums.length; i++) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    parts.push(i === j ? `${nums[i]}.º` : `${nums[i]}.º–${nums[j]}.º`);
    i = j;
  }
  return parts.join(', ');
}

function levelSummary(adaptations) {
  return STATS_LEVELS
    .map(({ level }) => {
      const grades = adaptations.filter((a) => a.level === level).map((a) => a.grade);
      if (grades.length === 0) return null;
      return level === 'ad' ? LEVEL_SHORT.ad : `${LEVEL_SHORT[level]} ${gradeRanges(grades)}`;
    })
    .filter(Boolean)
    .join(' · ');
}

// Filas «curso → asignaturas» (con el nombre de la versión si es una familia).
function rowsOf(entry, adaptations) {
  const rows = [];
  const byKey = new Map();
  for (const a of adaptations) {
    const k = `${a.level}|${a.grade}|${a.appId}`;
    let row = byKey.get(k);
    if (!row) {
      row = { key: k, label: a.gradeLabel, variant: entry.family ? entry.variants[a.appId]?.name : null, items: [] };
      byKey.set(k, row);
      rows.push(row);
    }
    row.items.push(a);
  }
  return rows;
}

function filterIndex(query, level) {
  const q = normalizeText(query);
  const out = [];
  for (const e of SORTED) {
    let list = level === 'all' ? e.adaptations : e.adaptations.filter((a) => a.level === level);
    if (list.length === 0) continue;
    let matchedSubjects = null;
    if (q) {
      const nameHit = normalizeText([e.name, ...Object.values(e.variants).map((v) => v.name)].join(' ')).includes(q);
      if (!nameHit) {
        list = list.filter((a) => normalizeText(`${a.subjectName} ${a.gradeLabel}`).includes(q));
        if (list.length === 0) continue;
        matchedSubjects = [...new Set(list.map((a) => a.subjectName))];
      }
    }
    out.push({ entry: e, adaptations: list, matchedSubjects });
  }
  return out;
}

function AppBlock({ entry, adaptations, matchedSubjects, open, onToggle }) {
  const icon = entry.ids.find((id) => hasAppIcon(id));
  const panelId = `adp-panel-${entry.key}`;
  return (
    <article id={`app-${entry.key}`} className={`adp-card ${open ? 'is-open' : ''}`}>
      <button type="button" className="adp-card__head" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="adp-card__icon" aria-hidden="true">
          {icon ? <AppIcon appId={icon} size={48} /> : <span className="adp-card__emoji">{entry.emoji || '🎮'}</span>}
        </span>
        <span className="adp-card__text">
          <span className="adp-card__name">
            {entry.name}
            {entry.key === LATEST_KEY && <span className="adp-badge"><Sparkles className="w-3 h-3" aria-hidden="true" /> Nueva</span>}
          </span>
          <span className="adp-card__levels">
            {matchedSubjects && (
              <strong className="adp-card__match">
                {matchedSubjects.slice(0, 3).join(', ')}{matchedSubjects.length > 3 ? '…' : ''}
                {' · '}
              </strong>
            )}
            {levelSummary(adaptations)}
          </span>
        </span>
        <span className="adp-card__count">{plural(adaptations.length, 'adaptación', 'adaptaciones')}</span>
        <ChevronDown className="adp-card__chev w-5 h-5" aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="adp-card__body">
          {rowsOf(entry, adaptations).map((row) => (
            <div key={row.key} className="adp-row">
              <div className="adp-row__label">
                <span className="adp-row__grade">{row.label}</span>
                {row.variant && <span className="adp-row__variant">{row.variant}</span>}
              </div>
              <ul className="adp-row__chips">
                {row.items.map((a) => (
                  <li key={a.path}>
                    <Link to={a.path} className="adp-chip" title={`Abrir ${entry.name} · ${a.gradeLabel} · ${a.subjectName}`}>
                      {a.subjectName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default function AdaptacionesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialApp = params.get('app');
  const [query, setQuery] = useState(params.get('q') || '');
  const [level, setLevel] = useState(LEVEL_FILTERS.some((f) => f.level === params.get('nivel')) ? params.get('nivel') : 'all');
  const [openKeys, setOpenKeys] = useState(() => new Set(initialApp ? [initialApp] : []));
  const [openPropose, proposeDialog, preloadPropose] = useProposeAppDialog('adaptaciones');
  const stats = LIVE_APP_STATS;

  // La URL refleja búsqueda y nivel (enlaces compartibles), sin ensuciar el historial.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (level !== 'all') next.set('nivel', level);
    if (initialApp && openKeys.has(initialApp)) next.set('app', initialApp);
    setParams(next, { replace: true });
  }, [query, level]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialApp) return;
    const el = document.getElementById(`app-${initialApp}`);
    // 'start' (no 'center'): una app desplegada puede ser más alta que la pantalla.
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [initialApp]);

  const results = useMemo(() => filterIndex(query, level), [query, level]);
  const shownAdaptations = results.reduce((n, r) => n + r.adaptations.length, 0);
  const autoOpen = query.trim() !== '' && results.length <= 3;

  const toggle = (key) => setOpenKeys((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const title = `Todas las adaptaciones: ${formatCount(stats.apps)} apps en ${formatCount(stats.adaptaciones)} cursos y asignaturas | Apps Educativas`;
  const description = `Listado completo y actualizado de las ${formatCount(stats.adaptaciones)} adaptaciones de las ${formatCount(stats.apps)} apps educativas: en qué niveles, cursos y asignaturas está cada app, de 1.º de Primaria a 2.º de Bachillerato y Atención a la Diversidad.`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/adaptaciones`} />
        <meta property="og:title" content="Todas las adaptaciones de las apps educativas" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}/adaptaciones`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Todas las adaptaciones de las apps educativas',
          description,
          url: `${SITE_URL}/adaptaciones`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: stats.apps,
            itemListElement: SORTED.map((e, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: e.name,
              url: `${SITE_URL}${e.adaptations[0].path}`,
            })),
          },
        })}</script>
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden">
        <div className="relative z-10">
          <Header subtitle="Todas las adaptaciones">
            <NavPill icon={Home} onClick={() => navigate('/')}>Inicio</NavPill>
          </Header>

          <main className="container mx-auto px-4 sm:px-6 py-10 md:py-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-8">
              <div className="mb-4">
                <span className="np-kicker">
                  <span className="np-kicker__dot" aria-hidden="true" />
                  Todas las adaptaciones
                  <span className="np-count">{formatCount(stats.adaptaciones)}</span>
                </span>
              </div>
              <AnimatedGradientTitle className="text-4xl md:text-6xl">Dónde está cada app</AnimatedGradientTitle>
              <p className="adp-lead">
                <strong>{formatCount(stats.apps)} apps</strong> y <strong>{formatCount(stats.adaptaciones)} adaptaciones</strong>.
                Una adaptación es una app en un curso y una asignatura concretos, con el contenido de ese curso y esa
                asignatura: el Rosco de 3.º de Primaria de Ciencias y el de 1.º de ESO de Inglés son dos adaptaciones de la misma app.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                <Link to="/catalogo" className="np-chip inline-flex items-center gap-2 no-underline">
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" /> Catálogo de apps
                </Link>
                <button type="button" className="np-chip np-chip--active inline-flex items-center gap-2" onClick={openPropose} onPointerEnter={preloadPropose}>
                  <Lightbulb className="w-4 h-4" aria-hidden="true" /> Propón una app
                </button>
              </div>
            </motion.div>

            <div className="adp-levels" role="group" aria-label="Filtrar por nivel">
              {STATS_LEVELS.map(({ level: lv, label }) => {
                const l = stats.por_nivel[lv];
                if (!l) return null;
                const active = level === lv;
                return (
                  <button key={lv} type="button" className={`adp-level ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={() => setLevel(active ? 'all' : lv)}>
                    <span className="adp-level__name">{label}</span>
                    <span className="adp-level__num">{formatCount(l.adaptaciones)}</span>
                    <span className="adp-level__meta">adaptaciones · {plural(l.apps, 'app', 'apps')}</span>
                  </button>
                );
              })}
            </div>

            <div className="max-w-3xl mx-auto mb-6">
              <div className="relative mb-4">
                <Search className="w-5 h-5 text-violet-500 dark:text-violet-300 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busca una app o una asignatura (rosco, latín, fracciones…)"
                  className="np-search"
                  aria-label="Buscar una app o una asignatura"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {LEVEL_FILTERS.map((f) => (
                  <button key={f.level} type="button" onClick={() => setLevel(f.level)} aria-pressed={level === f.level} className={`np-chip ${level === f.level ? 'np-chip--active' : ''}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="adp-showing" aria-live="polite">
              {results.length === APP_INDEX.length && shownAdaptations === stats.adaptaciones
                ? `${plural(results.length, 'app', 'apps')} · ${plural(shownAdaptations, 'adaptación', 'adaptaciones')}. Pulsa una app para ver sus cursos y asignaturas.`
                : `Mostrando ${plural(results.length, 'app', 'apps')} · ${plural(shownAdaptations, 'adaptación', 'adaptaciones')}`}
              {(query || level !== 'all') && (
                <button type="button" className="adp-clear" onClick={() => { setQuery(''); setLevel('all'); }}>
                  <X className="w-3.5 h-3.5" aria-hidden="true" /> Quitar filtros
                </button>
              )}
            </p>

            <div className="adp-list" style={{ filter: 'blur(0px)' }}>
              {results.length === 0 ? (
                <div className="np-panel max-w-md mx-auto text-center py-10 px-8">
                  <Search className="w-10 h-10 mx-auto mb-4 text-violet-300" aria-hidden="true" />
                  <p className="text-2xl font-bold mb-2">Sin resultados</p>
                  <p className="text-white/75 mb-5">No hay ninguna app con ese nombre ni en esa asignatura. ¿Nos la propones?</p>
                  <button type="button" className="fx-btn fx-shine" onClick={openPropose} onPointerEnter={preloadPropose}>
                    <Lightbulb className="w-5 h-5" /> Propón una app
                  </button>
                </div>
              ) : (
                results.map(({ entry, adaptations, matchedSubjects }) => (
                  <AppBlock
                    key={entry.key}
                    entry={entry}
                    adaptations={adaptations}
                    matchedSubjects={matchedSubjects}
                    open={autoOpen || openKeys.has(entry.key)}
                    onToggle={() => toggle(entry.key)}
                  />
                ))
              )}
            </div>

            <section className="adp-cta np-panel">
              <div>
                <p className="adp-cta__title">¿Echas en falta alguna app?</p>
                <p className="adp-cta__text">Cuéntanos qué te gustaría tener y para qué curso. Si ya existe, te diremos dónde está.</p>
              </div>
              <button type="button" className="fx-btn fx-shine" onClick={openPropose} onPointerEnter={preloadPropose}>
                <Lightbulb className="w-5 h-5" /> Propón una app
              </button>
            </section>

            <p className="adp-foot">
              Las cifras salen del registro de apps de la plataforma y se recalculan en cada versión.
              También están en <a href="/datos/cifras-apps.json">formato JSON</a>.
            </p>
          </main>
        </div>
      </div>
      {proposeDialog}
    </>
  );
}
