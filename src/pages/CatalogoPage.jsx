import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Play, X, ListChecks, Lightbulb, GraduationCap, Sparkles } from 'lucide-react';
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

// Selector de dónde jugar (nivel → curso → asignatura) + botón Probar.
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

  // Reajusta curso/asignatura cuando cambian las opciones disponibles.
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

  const selectCls = 'w-full appearance-none bg-white/90 text-gray-800 text-sm font-medium rounded-xl border border-white/60 pl-3 pr-9 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="mt-4 rounded-2xl bg-slate-900/30 border border-white/15 p-4">
      <p className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4" /> Elige dónde quieres jugar
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {levels.length > 1 && (
          <div className="relative">
            <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1">Etapa</label>
            <select className={selectCls} value={level} onChange={(e) => onLevel(e.target.value)}>
              {levels.map((l) => <option key={l.level} value={l.level}>{l.label}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 bottom-3 pointer-events-none" />
          </div>
        )}
        {grades.length > 1 && (
          <div className="relative">
            <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1">Curso</label>
            <select className={selectCls} value={grade} onChange={(e) => onGrade(e.target.value)}>
              {grades.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 bottom-3 pointer-events-none" />
          </div>
        )}
        <div className="relative">
          <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-1">Asignatura</label>
          <select className={selectCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 bottom-3 pointer-events-none" />
        </div>
      </div>
      <button
        type="button"
        onClick={play}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white font-bold rounded-xl shadow-lg hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-95 transition-all"
      >
        <Play className="w-5 h-5 fill-current" /> Probar esta app
      </button>
    </div>
  );
};

const AppCard = ({ item }) => {
  const [open, setOpen] = useState(false);
  const { concept } = item;
  const showIcon = hasAppIcon(item.id);

  return (
    <motion.div
      layout
      className="bg-white/30 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg overflow-hidden flex flex-col"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {showIcon
              ? <AppIcon appId={item.id} size={56} />
              : <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center text-3xl">{item.emoji || '🎮'}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
            {item.scope
              ? <p className="text-xs font-semibold text-indigo-700 mt-0.5">{item.scope}</p>
              : null}
            <p className="text-sm text-gray-700 mt-1.5">{concept?.queEs || item.description}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...new Set(item.availability.map((c) => c.levelLabel))].map((lvl) => (
            <span key={lvl} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700">{lvl}</span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          {open ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {open ? 'Cerrar' : 'Ver cómo se juega y probar'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && concept && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/30 bg-white/20"
          >
            <div className="p-5 space-y-4">
              {concept.porQueRelevante && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">¿Por qué es relevante?</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{concept.porQueRelevante}</p>
                </div>
              )}
              {concept.comoFunciona && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">¿Cómo funciona?</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{concept.comoFunciona}</p>
                </div>
              )}
              {concept.instrucciones?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5"><ListChecks className="w-4 h-4" /> Cómo se juega</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {concept.instrucciones.map((p, i) => <li key={i}>{p}</li>)}
                  </ol>
                </div>
              )}
              {concept.modos?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Modos</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {concept.modos.map((m, i) => <li key={i}><span className="font-semibold">{m.nombre}:</span> {m.descripcion}</li>)}
                  </ul>
                </div>
              )}
              {concept.consejos?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5"><Lightbulb className="w-4 h-4" /> Consejos</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {concept.consejos.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
              <LaunchPicker item={item} />
            </div>
          </motion.div>
        )}
        {open && !concept && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/30 bg-white/20"
          >
            <div className="p-5"><LaunchPicker item={item} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CatalogoPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

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
              <AnimatedGradientTitle className="text-4xl md:text-6xl">Catálogo de Apps</AnimatedGradientTitle>
              <p className="text-lg md:text-xl text-white/90 mt-4 max-w-3xl mx-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                Explora todas las apps y juegos de la plataforma. Descubre <strong>qué son</strong>, <strong>por qué son útiles</strong> y <strong>cómo se juegan</strong>, y entra a probarlos en cualquier curso o asignatura. Gratis y sin registro.
              </p>
            </motion.div>

            {/* Buscador + filtros */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative mb-4">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar una app (rosco, fracciones, sopa de letras…)"
                  className="w-full bg-white/85 backdrop-blur rounded-2xl border border-white/60 pl-12 pr-4 py-3.5 text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {LEVEL_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLevelFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                      levelFilter === f.id
                        ? 'bg-white text-indigo-700 border-white shadow-md'
                        : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center text-white/85 py-20">
                <p className="text-2xl font-bold mb-2">Sin resultados</p>
                <p>Prueba con otra búsqueda o cambia el filtro de etapa.</p>
              </div>
            ) : (
              CATALOG_CATEGORIES.map((cat) => {
                const list = grouped[cat.id];
                if (!list || list.length === 0) return null;
                return (
                  <section key={cat.id} className="mb-14">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">{cat.emoji}</span>
                      <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{cat.label}</h2>
                      <span className="text-sm font-semibold text-white/70 bg-white/15 px-2.5 py-0.5 rounded-full">{list.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                      {list.map((it) => <AppCard key={it.id} item={it} />)}
                    </div>
                  </section>
                );
              })
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default CatalogoPage;
