import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Play, X, ListChecks, Lightbulb, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { AnimatedBorderButton } from '@/components/NavBackButton';
import { AnimatedGradientTitle } from '@/components/ui/GradientTitle';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import {
  APP_META, APP_AVAILABILITY, ALL_APP_IDS, buildLaunchPath, splitEmoji,
} from '@/data/appAvailability';
import {
  CATALOG_CATEGORIES, CONCEPT_CATEGORY, APP_ID_TO_CONCEPT, APP_VARIANT_SCOPE, APP_CONCEPTS,
} from '@/data/appsCatalog';
import { tiltProps, accentFor } from './navTilt';
import './NavPages.css';

const LEVEL_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'primaria', label: 'Primaria' },
  { id: 'eso', label: 'ESO' },
  { id: 'bachillerato', label: 'Bachillerato' },
  { id: 'ad', label: 'Atención a la Diversidad' },
];

// Construye la lista de items del catálogo (uno por variante de app).
function buildItems() {
  return ALL_APP_IDS.map((id) => {
    const meta = APP_META[id] || { id, name: id, description: '' };
    const conceptKey = APP_ID_TO_CONCEPT[id] || id;
    const concept = APP_CONCEPTS[conceptKey] || null;
    const { emoji, text } = splitEmoji(meta.name);
    return {
      id,
      name: text || meta.name,
      emoji,
      description: meta.description || (concept && concept.queEs) || '',
      conceptKey,
      concept,
      scope: APP_VARIANT_SCOPE[id] || '',
      category: CONCEPT_CATEGORY[conceptKey] || 'otros',
      availability: APP_AVAILABILITY[id] || [],
    };
  }).filter((it) => it.availability.length > 0);
}

// Selector de dónde jugar (etapa → curso → asignatura) + botón Probar.
const LaunchPicker = ({ item }) => {
  const navigate = useNavigate();
  const { availability } = item;

  const levels = useMemo(() => {
    const seen = [];
    availability.forEach((c) => { if (!seen.find((x) => x.level === c.level)) seen.push({ level: c.level, label: c.levelLabel }); });
    return seen;
  }, [availability]);

  const [level, setLevel] = useState(levels[0]?.level);

  const grades = useMemo(() => {
    const seen = [];
    availability.filter((c) => c.level === level).forEach((c) => {
      if (!seen.find((x) => x.grade === c.grade)) seen.push({ grade: c.grade, label: c.gradeLabel });
    });
    return seen;
  }, [availability, level]);

  const [grade, setGrade] = useState(grades[0]?.grade);

  const subjects = useMemo(
    () => availability.filter((c) => c.level === level && c.grade === grade),
    [availability, level, grade],
  );
  const [subjectId, setSubjectId] = useState(subjects[0]?.subjectId);

  const onLevel = (val) => {
    setLevel(val);
    const g = availability.find((c) => c.level === val);
    setGrade(g?.grade);
    const s = availability.find((c) => c.level === val && c.grade === g?.grade);
    setSubjectId(s?.subjectId);
  };
  const onGrade = (val) => {
    setGrade(val);
    const s = availability.find((c) => c.level === level && c.grade === val);
    setSubjectId(s?.subjectId);
  };

  const combo = subjects.find((c) => c.subjectId === subjectId) || subjects[0];
  const play = () => { if (combo) navigate(buildLaunchPath(item.id, combo)); };

  const selectCls = 'w-full appearance-none bg-white text-gray-800 text-sm font-medium rounded-xl border border-gray-200 pl-3 pr-9 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="rounded-2xl p-4 border border-indigo-100 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-indigo-600" /> Elige dónde quieres jugar
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {levels.length > 1 && (
          <div className="relative">
            <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Etapa</label>
            <select className={selectCls} value={level} onChange={(e) => onLevel(e.target.value)}>
              {levels.map((l) => <option key={l.level} value={l.level}>{l.label}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 bottom-3 pointer-events-none" />
          </div>
        )}
        {grades.length > 1 && (
          <div className="relative">
            <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Curso</label>
            <select className={selectCls} value={grade} onChange={(e) => onGrade(e.target.value)}>
              {grades.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 bottom-3 pointer-events-none" />
          </div>
        )}
        <div className="relative">
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1">Asignatura</label>
          <select className={selectCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 bottom-3 pointer-events-none" />
        </div>
      </div>
      <button
        type="button"
        onClick={play}
        className="fx-btn fx-shine mt-4 w-full"
      >
        <Play className="w-5 h-5 fill-current" /> Probar esta app
      </button>
    </div>
  );
};

// Modal con la descripción completa + cómo se juega + probar.
const AppModal = ({ item, onClose }) => {
  const onKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onKey]);

  const { concept } = item;
  const showIcon = hasAppIcon(item.id);
  const levels = [...new Set(item.availability.map((c) => c.levelLabel))];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        role="dialog" aria-modal="true"
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col ring-1 ring-white/60 shadow-[0_40px_100px_-30px_rgba(76,29,149,0.75),0_0_0_1px_rgba(139,92,246,0.15)]"
        initial={{ y: 40, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 40, scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      >
        {/* Cabecera */}
        <div className="np-modal-head flex items-start gap-4 p-5 sm:p-6">
          <div className="shrink-0 np-icon" style={{ '--np-accent': '#8b5cf6' }}>
            {showIcon
              ? <AppIcon appId={item.id} size={56} />
              : <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">{item.emoji || '🎮'}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{item.name}</h2>
            {item.scope ? <p className="text-xs font-semibold text-indigo-700 mt-0.5">{item.scope}</p> : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {levels.map((l) => <span key={l} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{l}</span>)}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="shrink-0 p-2 rounded-full bg-white/70 hover:bg-white text-gray-500 hover:text-gray-800 shadow-sm hover:rotate-90 transition-all duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {concept?.queEs && (
            <p className="text-[15px] text-gray-800 leading-relaxed">{concept.queEs}</p>
          )}
          {concept?.porQueRelevante && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-indigo-600" /> ¿Por qué es relevante?</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{concept.porQueRelevante}</p>
            </div>
          )}
          {concept?.comoFunciona && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">¿Cómo funciona?</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{concept.comoFunciona}</p>
            </div>
          )}
          {concept?.instrucciones?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-indigo-600" /> Cómo se juega</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
                {concept.instrucciones.map((p, i) => <li key={i}>{p}</li>)}
              </ol>
            </div>
          )}
          {concept?.modos?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Modos</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {concept.modos.map((m, i) => <li key={i}><span className="font-semibold">{m.nombre}:</span> {m.descripcion}</li>)}
              </ul>
            </div>
          )}
          {concept?.consejos?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-500" /> Consejos</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {concept.consejos.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {!concept && (
            <p className="text-sm text-gray-600">{item.description}</p>
          )}
          <LaunchPicker item={item} />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Tarjeta del catálogo: mismo lenguaje que las de AppListPage (tilt 3D con
// variables CSS + foco de luz + borde de aurora al hover).
const AppCard = ({ item, onOpen, index = 0 }) => {
  const showIcon = hasAppIcon(item.id);
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="np-card fx-spotlight fx-shine group"
      style={{ '--np-accent': accentFor(index) }}
      {...tiltProps}
    >
      <span className="np-card__glare" aria-hidden="true" />
      <span className="np-card__ring" aria-hidden="true" />
      <span className="np-card__body">
        <span className="flex items-center gap-4">
          <span className="np-icon">
            {showIcon
              ? <span className="np-icon__frame"><AppIcon appId={item.id} size={52} /></span>
              : <span className="np-icon__frame w-[52px] h-[52px] rounded-2xl bg-white/70 flex items-center justify-center text-3xl leading-none">{item.emoji || '🎮'}</span>}
          </span>
          <span className="flex-1 min-w-0">
            <span className="np-title block text-base">{item.name}</span>
            {item.scope ? <span className="block text-xs font-semibold text-indigo-700/90 dark:text-indigo-200/90 mt-0.5 line-clamp-1">{item.scope}</span> : null}
          </span>
        </span>
        <span className="np-cta np-cta--block">
          Ver detalles y jugar <ArrowRight className="w-4 h-4" />
        </span>
      </span>
    </button>
  );
};

const CatalogoPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => buildItems(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (levelFilter !== 'all' && !it.availability.some((c) => c.level === levelFilter)) return false;
      if (!q) return true;
      const hay = `${it.name} ${it.description} ${it.concept?.queEs || ''} ${it.scope}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, levelFilter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((it) => { (map[it.category] = map[it.category] || []).push(it); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name, 'es')));
    return map;
  }, [filtered]);

  const totalApps = items.length;

  return (
    <>
      <Helmet>
        <title>Catálogo de Apps — Todos los juegos educativos | Apps Educativas</title>
        <meta name="description" content={`Catálogo completo de las ${totalApps} apps y juegos educativos de la plataforma: qué son, para qué sirven, cómo se juegan y en qué cursos y asignaturas están disponibles. Gratis, sin descargas y sin registro.`} />
        <link rel="canonical" href="https://apps-educativas.com/catalogo" />
        <meta property="og:title" content="Catálogo de Apps Educativas" />
        <meta property="og:description" content="Descubre todas las apps y juegos educativos: qué son, por qué son relevantes y cómo se juegan." />
        <meta property="og:url" content="https://apps-educativas.com/catalogo" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Catálogo de Apps Educativas',
          description: 'Catálogo de apps y juegos educativos para Primaria, ESO, Bachillerato y Atención a la Diversidad.',
          url: 'https://apps-educativas.com/catalogo',
        })}</script>
      </Helmet>

      <div className="relative min-h-screen overflow-x-hidden">
        <div className="relative z-10">
          <Header subtitle="Catálogo de Apps">
            <AnimatedBorderButton
              onClick={() => navigate('/')}
              colors={['#ffffff', '#ffffff']}
              glowColor="rgba(255,255,255,0.45)"
              borderColor="#ffffff"
              shape="arrow"
            >
              Inicio
            </AnimatedBorderButton>
          </Header>

          <main className="container mx-auto px-6 py-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
              <div className="mb-4">
                <span className="np-kicker">
                  <span className="np-kicker__dot" aria-hidden="true" />
                  Todas las apps
                  <span className="np-count">{totalApps}</span>
                </span>
              </div>
              <AnimatedGradientTitle className="text-4xl md:text-6xl">Catálogo de Apps</AnimatedGradientTitle>
              <p className="np-sub text-base md:text-lg mt-4 max-w-3xl mx-auto leading-relaxed" style={{ display: 'block' }}>
                Explora todas las apps y juegos de la plataforma. Pulsa en cualquiera para ver <strong>qué es</strong>, <strong>por qué es útil</strong> y <strong>cómo se juega</strong>, y entra a probarla en cualquier curso o asignatura. Gratis y sin registro.
              </p>
            </motion.div>

            {/* Buscador + filtros */}
            <div className="max-w-3xl mx-auto mb-12 np-enter" style={{ '--i': 2 }}>
              <div className="relative mb-4">
                <Search className="w-5 h-5 text-violet-500 dark:text-violet-300 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar una app (rosco, fracciones, sopa de letras…)"
                  className="np-search"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {LEVEL_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLevelFilter(f.id)}
                    aria-pressed={levelFilter === f.id}
                    className={`np-chip ${levelFilter === f.id ? 'np-chip--active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wrapper con filter:blur(0px) para aislar el backdrop-blur de las tarjetas
                del fondo 3D (mismo truco que AppListPage / SubjectPage). */}
            <div style={{ filter: 'blur(0px)' }}>
              {filtered.length === 0 ? (
                <div className="np-panel max-w-md mx-auto text-center py-12 px-8">
                  <Search className="w-10 h-10 mx-auto mb-4 text-violet-300" aria-hidden="true" />
                  <p className="text-2xl font-bold mb-2">Sin resultados</p>
                  <p className="text-white/75">Prueba con otra búsqueda o cambia el filtro de etapa.</p>
                </div>
              ) : (
                CATALOG_CATEGORIES.map((cat) => {
                  const list = grouped[cat.id];
                  if (!list || list.length === 0) return null;
                  return (
                    <section key={cat.id} className="np-lazy-section">
                      <div className="flex items-center gap-3 mb-7 np-enter">
                        <span className="np-section-emoji" aria-hidden="true">{cat.emoji}</span>
                        <h2 className="np-section-title text-2xl md:text-3xl font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{cat.label}</h2>
                        <span className="np-count">{list.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                        {list.map((it, i) => (
                          <div key={it.id} className="np-enter" style={{ '--i': i }}>
                            <AppCard item={it} onOpen={setSelected} index={i} />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {selected && <AppModal key={selected.id} item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
};

export default CatalogoPage;
