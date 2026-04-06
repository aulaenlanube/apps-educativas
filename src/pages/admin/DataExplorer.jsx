import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Database, Layers, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import {
  getRunnerData, getRoscoData, getIntrusoData, getParejasData,
  getOrdenaFrasesData, getOrdenaHistoriasData, getDetectiveData,
  getComprensionData, getAppContent, getAllSubjects,
} from '@/services/gameDataService';
import { primariaApps } from '@/apps/config/primariaApps';
import { esoApps } from '@/apps/config/esoApps';

const LEVELS = [
  { id: 'primaria', label: 'Primaria', grades: [1, 2, 3, 4, 5, 6] },
  { id: 'eso', label: 'ESO', grades: [1, 2, 3, 4] },
];

// Mapa: app id → cómo cargar sus datos y cómo visualizarlos
// Solo incluye apps que cargan datos de la DB
const APP_DATA_MAP = {
  'rosco-del-saber':        { label: 'Pasapalabra', icon: '🔤', fetch: (l,g,s) => getRoscoData(l,g,s), view: 'rosco', format: 'array' },
  'busca-el-intruso':       { label: 'Busca el Intruso', icon: '🔍', fetch: (l,g,s) => getIntrusoData(l,g,s), view: 'intruso', format: 'array' },
  'runner':                 { label: 'Education Dash', icon: '🏃', fetch: (l,g,s) => getRunnerData(l,g,s), view: 'runner', format: 'object', shared: true },
  'juego-memoria':          { label: 'Juego de Memoria', icon: '🧠', fetch: (l,g,s) => getRunnerData(l,g,s), view: 'runner', format: 'object', shared: true },
  'clasificador':           { label: 'Clasificador', icon: '🗂️', fetch: (l,g,s) => getRunnerData(l,g,s), view: 'runner', format: 'object', shared: true },
  'lluvia-de-palabras':     { label: 'Lluvia de Palabras', icon: '🌧️', fetch: (l,g,s) => getRunnerData(l,g,s), view: 'runner', format: 'object', shared: true },
  'excavacion-selectiva':   { label: 'Excavacion Selectiva', icon: '⛏️', fetch: (l,g,s) => getRunnerData(l,g,s), view: 'runner', format: 'object', shared: true },
  'snake':                  { label: 'Snake', icon: '🐍', fetch: (l,g,s) => getRunnerData(l,g,s), view: 'runner', format: 'object', shared: true },
  'parejas':                { label: 'Parejas de Cartas', icon: '🃏', fetch: (l,g,s) => getParejasData(l,g,s), view: 'parejas', format: 'array' },
  'ordena-la-frase':        { label: 'Ordena la Frase', icon: '📝', fetch: (l,g,s) => getOrdenaFrasesData(l,g,s), view: 'frases', format: 'array' },
  'ordena-la-historia':     { label: 'Ordena la Historia', icon: '📖', fetch: (l,g,s) => getOrdenaHistoriasData(l,g,s), view: 'historias', format: 'array' },
  'detective-de-palabras':  { label: 'Detective de Palabras', icon: '🕵️', fetch: (l,g,s) => getDetectiveData(l,g,s), view: 'detective', format: 'array' },
  'comprension-escrita':    { label: 'Comprension Escrita', icon: '📖', fetch: (l,g,s) => getComprensionData(l,g,s), view: 'comprension', format: 'array', shared: true },
  'comprension-oral':       { label: 'Comprension Oral', icon: '🎧', fetch: (l,g,s) => getComprensionData(l,g,s), view: 'comprension', format: 'array', shared: true },
  // Apps con getAppContent
  'mesa-crafteo':           { label: 'Mesa de Crafteo', icon: '🧪', fetch: () => getAppContent('elementos-quimica'), view: 'appContent', format: 'any', shared: true },
  'entrenador-tabla':       { label: 'Entrenador Tabla Periodica', icon: '🔬', fetch: () => getAppContent('elementos-quimica'), view: 'appContent', format: 'any', shared: true },
  'terminal-retro':         { label: 'Terminal de Hackeo', icon: '📟', fetch: (l,g) => getAppContent('terminal-retro', 'eso', g), view: 'appContent', format: 'any' },
  'programacion-bloques-windows': { label: 'Programacion Visual', icon: '💾', fetch: (l,g) => getAppContent('bloques', 'eso', g), view: 'appContent', format: 'any' },
  'generador-personajes-historicos': { label: 'Generador Personajes', icon: '✨', fetch: (l,g) => getAppContent('generador-personajes', l, g), view: 'appContent', format: 'any' },
  'banco-recursos-tutoria': { label: 'Banco Recursos Tutoria', icon: '🎓', fetch: () => getAppContent('banco-tutoria'), view: 'appContent', format: 'any' },
};

function hasData(result, format) {
  if (result == null) return false;
  if (format === 'any') return result != null && (typeof result !== 'object' || Object.keys(result).length > 0 || (Array.isArray(result) && result.length > 0));
  if (format === 'array') return Array.isArray(result) && result.length > 0;
  if (format === 'object') return typeof result === 'object' && !Array.isArray(result) && Object.keys(result).length > 0;
  return false;
}

function getAppsForContext(level, grade, subject) {
  const config = level === 'primaria' ? primariaApps : esoApps;
  const apps = config?.[String(grade)]?.[subject] || [];
  // Devolver solo las que tienen datos en DB, agrupando las que comparten datos
  const seen = new Set();
  const result = [];
  for (const app of apps) {
    const mapping = APP_DATA_MAP[app.id];
    if (!mapping) continue;
    // Para apps que comparten el mismo fetch (runner-based, comprension), agrupar
    const dataKey = mapping.view + ':' + (mapping.shared ? 'shared' : app.id);
    if (seen.has(dataKey)) continue;
    seen.add(dataKey);
    result.push({ appId: app.id, appName: app.name, ...mapping });
  }
  return result;
}

const DataExplorer = () => {
  const [subjects, setSubjects] = useState({});
  const [selectedLevel, setSelectedLevel] = useState('primaria');
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [stats, setStats] = useState(null);
  const [availability, setAvailability] = useState({});
  const [scanningAvailability, setScanningAvailability] = useState(false);

  useEffect(() => { getAllSubjects().then(setSubjects); }, []);

  const currentSubjects = useMemo(() => subjects[selectedLevel]?.[selectedGrade] || [], [subjects, selectedLevel, selectedGrade]);

  const availableApps = useMemo(() => {
    if (!selectedSubject) return [];
    return getAppsForContext(selectedLevel, selectedGrade, selectedSubject);
  }, [selectedLevel, selectedGrade, selectedSubject]);

  useEffect(() => {
    setSelectedSubject(null); setSelectedAppId(null); setData(null); setError(null); setStats(null); setAvailability({});
  }, [selectedLevel, selectedGrade]);

  useEffect(() => {
    setSelectedAppId(null); setData(null); setError(null); setStats(null);
  }, [selectedSubject]);

  // Scan availability
  useEffect(() => {
    if (!selectedSubject || availableApps.length === 0) { setAvailability({}); return; }
    let cancelled = false;
    setScanningAvailability(true);
    setAvailability({});
    const scan = async () => {
      const results = {};
      await Promise.all(availableApps.map(async (app) => {
        try {
          const result = await app.fetch(selectedLevel, selectedGrade, selectedSubject);
          results[app.appId] = hasData(result, app.format);
        } catch { results[app.appId] = false; }
      }));
      if (!cancelled) { setAvailability(results); setScanningAvailability(false); }
    };
    scan();
    return () => { cancelled = true; };
  }, [selectedLevel, selectedGrade, selectedSubject, availableApps]);

  // Fetch data
  useEffect(() => {
    if (!selectedSubject || !selectedAppId) return;
    const appConfig = availableApps.find(a => a.appId === selectedAppId);
    if (!appConfig) return;

    let cancelled = false;
    setLoading(true); setError(null); setData(null); setStats(null);
    setSearchTerm(''); setExpandedSections({});

    (async () => {
      try {
        const result = await appConfig.fetch(selectedLevel, selectedGrade, selectedSubject);
        if (cancelled) return;
        if (!hasData(result, appConfig.format)) {
          setError('No hay datos para esta combinacion');
        } else {
          setData(result);
          setStats(computeStats(appConfig.view, result));
        }
      } catch (e) {
        if (!cancelled) setError(`Error: ${e.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedLevel, selectedGrade, selectedSubject, selectedAppId, availableApps]);

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  const expandAll = () => {
    if (!data) return;
    const selectedApp = availableApps.find(a => a.appId === selectedAppId);
    const keys = getAllSectionKeys(selectedApp?.view, data);
    const allExpanded = keys.every(k => expandedSections[k]);
    setExpandedSections(allExpanded ? {} : Object.fromEntries(keys.map(k => [k, true])));
  };

  const currentLevelConfig = LEVELS.find(l => l.id === selectedLevel);
  const currentSubjectObj = currentSubjects.find(s => s.id === selectedSubject);
  const selectedAppConfig = availableApps.find(a => a.appId === selectedAppId);
  const availableCount = Object.values(availability).filter(Boolean).length;
  const totalScanned = Object.keys(availability).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Explorador de Datos
        </h3>

        {/* Level & Grade */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nivel</label>
            <div className="flex gap-1">
              {LEVELS.map(level => (
                <button key={level.id} onClick={() => { setSelectedLevel(level.id); setSelectedGrade(level.grades[0]); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedLevel === level.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >{level.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Curso</label>
            <div className="flex gap-1">
              {currentLevelConfig.grades.map(grade => (
                <button key={grade} onClick={() => setSelectedGrade(grade)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${selectedGrade === grade ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >{grade}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Asignatura</label>
          <div className="flex flex-wrap gap-2">
            {currentSubjects.map(subj => (
              <button key={subj.id} onClick={() => setSelectedSubject(subj.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedSubject === subj.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{subj.icon}</span>
                <span className="hidden sm:inline">{subj.nombre}</span>
                <span className="sm:hidden">{subj.id}</span>
              </button>
            ))}
            {currentSubjects.length === 0 && <p className="text-sm text-slate-400 italic">No hay asignaturas</p>}
          </div>
        </div>

        {/* Apps with data (dynamic) */}
        {selectedSubject && availableApps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">
              Apps con datos
              {scanningAvailability && <span className="ml-2 text-indigo-400 animate-pulse">Escaneando...</span>}
              {!scanningAvailability && totalScanned > 0 && (
                <span className="ml-2 text-slate-400">({availableCount}/{totalScanned} con datos)</span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableApps.map(app => {
                const has = availability[app.appId] === true;
                const no = availability[app.appId] === false;
                const scanning = availability[app.appId] === undefined && scanningAvailability;
                return (
                  <button key={app.appId} onClick={() => setSelectedAppId(app.appId)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all relative ${
                      selectedAppId === app.appId ? 'bg-indigo-600 text-white shadow-md'
                      : no ? 'bg-slate-50 text-slate-300 border border-slate-100 opacity-60'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg">{app.icon}</span>
                      {!scanning && has && selectedAppId !== app.appId && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {!scanning && no && selectedAppId !== app.appId && <XCircle className="w-4 h-4 text-slate-300" />}
                      {scanning && <div className="w-3 h-3 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    <span className="text-xs font-bold leading-tight">{app.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
        {selectedSubject && availableApps.length === 0 && (
          <p className="text-sm text-slate-400 italic">No hay apps con datos de base de datos para esta combinacion</p>
        )}
      </div>

      {/* Breadcrumb */}
      {selectedAppConfig && (
        <div className="text-sm text-slate-500 flex items-center gap-1 flex-wrap">
          <span className="font-medium text-slate-700">{currentLevelConfig.label} {selectedGrade}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-slate-700">{currentSubjectObj?.icon} {currentSubjectObj?.nombre}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-indigo-600">{selectedAppConfig.icon} {selectedAppConfig.label}</span>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search */}
      {data && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar en los datos..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
          </div>
          <button onClick={expandAll} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
            <Layers className="w-4 h-4" /><span className="hidden sm:inline">Expandir/Colapsar</span>
          </button>
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>}

      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">{error}</p>
        </motion.div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <DataView type={selectedAppConfig?.view} data={data} search={searchTerm} expanded={expandedSections} toggle={toggleSection} />
        </motion.div>
      )}

      {!selectedSubject && !loading && (
        <div className="text-center py-16">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Selecciona nivel, curso y asignatura para explorar los datos</p>
        </div>
      )}
      {selectedSubject && !selectedAppId && !loading && (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Selecciona una app para visualizar sus datos</p>
        </div>
      )}
    </div>
  );
};

// ──── DataView dispatcher ────
function DataView({ type, data, search, expanded, toggle }) {
  try {
    switch (type) {
      case 'rosco': return <RoscoView data={data} search={search} expanded={expanded} toggle={toggle} />;
      case 'intruso': return <IntrusoView data={data} search={search} expanded={expanded} toggle={toggle} />;
      case 'runner': return <RunnerView data={data} search={search} expanded={expanded} toggle={toggle} />;
      case 'parejas': return <ParejasView data={data} search={search} />;
      case 'frases': return <FrasesView data={data} search={search} />;
      case 'historias': return <HistoriasView data={data} search={search} expanded={expanded} toggle={toggle} />;
      case 'detective': return <DetectiveView data={data} search={search} />;
      case 'comprension': return <ComprensionView data={data} search={search} expanded={expanded} toggle={toggle} />;
      case 'appContent': return <AppContentView data={data} search={search} expanded={expanded} toggle={toggle} />;
      default: return <RawView data={data} />;
    }
  } catch (e) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-sm text-red-700 font-medium">Error al renderizar</p>
      <p className="text-xs text-red-500 mt-1">{e.message}</p>
      <RawView data={data} />
    </div>;
  }
}

function RawView({ data }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <p className="text-xs font-semibold text-slate-500 mb-2">Datos en bruto</p>
      <pre className="text-xs text-slate-600 overflow-auto max-h-96 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// ──── Stats ────
function computeStats(type, data) {
  try {
    switch (type) {
      case 'rosco': {
        if (!Array.isArray(data)) return null;
        const letters = [...new Set(data.map(d => d.letra).filter(Boolean))];
        const byType = {};
        data.forEach(d => { if (d.tipo) byType[d.tipo] = (byType[d.tipo] || 0) + 1; });
        return [
          { label: 'Total palabras', value: data.length },
          { label: 'Letras cubiertas', value: `${letters.length}/27` },
          { label: 'Empieza por', value: byType['empieza'] || 0 },
          { label: 'Contiene', value: byType['contiene'] || 0 },
        ];
      }
      case 'intruso': {
        if (!Array.isArray(data)) return null;
        const tc = data.reduce((s, d) => s + (Array.isArray(d.correctos) ? d.correctos.length : 0), 0);
        const ti = data.reduce((s, d) => s + (Array.isArray(d.intrusos) ? d.intrusos.length : 0), 0);
        return [{ label: 'Total conjuntos', value: data.length }, { label: 'Correctos', value: tc }, { label: 'Intrusos', value: ti }];
      }
      case 'runner': {
        if (typeof data !== 'object' || Array.isArray(data)) return null;
        const cats = Object.keys(data);
        const vals = Object.values(data).filter(Array.isArray);
        const total = vals.reduce((s, w) => s + w.length, 0);
        return [{ label: 'Categorias', value: cats.length }, { label: 'Total palabras', value: total }, { label: 'Media', value: cats.length ? Math.round(total / cats.length) : 0 }];
      }
      case 'parejas': return Array.isArray(data) ? [{ label: 'Total parejas', value: data.length }] : null;
      case 'frases': return Array.isArray(data) ? [{ label: 'Total frases', value: data.length }] : null;
      case 'historias': return Array.isArray(data) ? [{ label: 'Total historias', value: data.length }, { label: 'Total frases', value: data.reduce((s, h) => s + (Array.isArray(h) ? h.length : 0), 0) }] : null;
      case 'detective': return Array.isArray(data) ? [{ label: 'Total frases', value: data.length }] : null;
      case 'comprension': {
        if (!Array.isArray(data)) return null;
        const q = data.reduce((s, t) => s + (Array.isArray(t.preguntas) ? t.preguntas.length : 0), 0);
        return [{ label: 'Total textos', value: data.length }, { label: 'Total preguntas', value: q }];
      }
      case 'appContent': {
        if (Array.isArray(data)) return [{ label: 'Elementos', value: data.length }];
        if (typeof data === 'object' && data) return [{ label: 'Campos', value: Object.keys(data).length }];
        return null;
      }
      default: return null;
    }
  } catch { return null; }
}

function getAllSectionKeys(type, data) {
  try {
    if (type === 'rosco' && Array.isArray(data)) return [...new Set(data.map(d => d.letra).filter(Boolean))].sort();
    if (type === 'intruso' && Array.isArray(data)) return data.map((_, i) => `intruso-${i}`);
    if (type === 'runner' && typeof data === 'object' && !Array.isArray(data)) return Object.keys(data).sort();
    if (type === 'historias' && Array.isArray(data)) return data.map((_, i) => `historia-${i}`);
    if (type === 'comprension' && Array.isArray(data)) return data.map((_, i) => `texto-${i}`);
    if (type === 'appContent' && typeof data === 'object' && !Array.isArray(data)) return Object.keys(data);
    return [];
  } catch { return []; }
}

// ──── Helpers ────
function Highlight({ text, search }) {
  if (!search || text == null) return <>{String(text ?? '')}</>;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return <>{str}</>;
  return <>{str.slice(0, idx)}<mark className="bg-yellow-200 rounded px-0.5">{str.slice(idx, idx + search.length)}</mark>{str.slice(idx + search.length)}</>;
}
function matchesSearch(text, search) { return !search || String(text ?? '').toLowerCase().includes(search.toLowerCase()); }
function SectionHeader({ label, count, expanded, onClick, icon }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-left">
      {expanded ? <ChevronDown className="w-4 h-4 text-indigo-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      {icon && <span>{icon}</span>}
      <span className="font-semibold text-slate-700 flex-1">{label}</span>
      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{count}</span>
    </button>
  );
}

// ──── ROSCO ────
function RoscoView({ data, search, expanded, toggle }) {
  const safeData = Array.isArray(data) ? data : [];
  const byLetter = useMemo(() => {
    const map = {};
    safeData.forEach(item => { if (item?.letra) { (map[item.letra] ??= []).push(item); } });
    return map;
  }, [safeData]);
  const letters = Object.keys(byLetter).sort();
  if (!letters.length) return <RawView data={data} />;
  return (
    <div className="space-y-2">
      {letters.map(letter => {
        const items = byLetter[letter].filter(item => matchesSearch(item.solucion, search) || matchesSearch(item.definicion, search));
        if (!items.length && search) return null;
        return (
          <div key={letter}>
            <SectionHeader label={`Letra ${letter.toUpperCase()}`} count={items.length} expanded={expanded[letter]} onClick={() => toggle(letter)} icon="🔠" />
            <AnimatePresence>
              {expanded[letter] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="ml-6 mt-1 space-y-1">
                    {items.map((item, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-start gap-2">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.tipo === 'empieza' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.tipo === 'empieza' ? 'Empieza' : 'Contiene'}
                          </span>
                          {item.difficulty && <span className="text-xs text-slate-400">Dif. {item.difficulty}</span>}
                        </div>
                        <p className="flex-1 text-sm text-slate-600"><Highlight text={item.definicion} search={search} /></p>
                        <span className="font-bold text-indigo-700 text-sm bg-indigo-50 px-2 py-1 rounded-lg flex-shrink-0"><Highlight text={item.solucion} search={search} /></span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ──── INTRUSO ────
function IntrusoView({ data, search, expanded, toggle }) {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length > 0 && typeof safeData[0] === 'string') {
    const filtered = search ? safeData.filter(s => matchesSearch(s, search)) : safeData;
    return <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 mb-2">Modo visual ({safeData.length} elementos)</p>
      <div className="flex flex-wrap gap-1.5">{filtered.map((item, i) => <span key={i} className="text-sm bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"><Highlight text={item} search={search} /></span>)}</div>
    </div>;
  }
  const filtered = search ? safeData.filter(s => s && (matchesSearch(s.categoria, search) || (Array.isArray(s.correctos) && s.correctos.some(c => matchesSearch(c, search))) || (Array.isArray(s.intrusos) && s.intrusos.some(i => matchesSearch(i, search))))) : safeData;
  if (!filtered.length) return <RawView data={data} />;
  return (
    <div className="space-y-2">
      {filtered.map((set, i) => {
        if (!set || typeof set !== 'object') return null;
        const key = `intruso-${i}`, correctos = Array.isArray(set.correctos) ? set.correctos : [], intrusos = Array.isArray(set.intrusos) ? set.intrusos : [];
        return (
          <div key={key}>
            <SectionHeader label={set.categoria || `Conjunto ${i+1}`} count={`${correctos.length} + ${intrusos.length} intrusos`} expanded={expanded[key]} onClick={() => toggle(key)} icon="🏷️" />
            <AnimatePresence>
              {expanded[key] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="ml-6 mt-1 bg-white rounded-lg p-4 border border-slate-100 space-y-3">
                    <div><p className="text-xs font-semibold text-green-600 mb-1.5">Correctos</p><div className="flex flex-wrap gap-1.5">{correctos.map((c, j) => <span key={j} className="text-sm bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-200"><Highlight text={c} search={search} /></span>)}</div></div>
                    <div><p className="text-xs font-semibold text-red-500 mb-1.5">Intrusos</p><div className="flex flex-wrap gap-1.5">{intrusos.map((c, j) => <span key={j} className="text-sm bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200"><Highlight text={c} search={search} /></span>)}</div></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ──── RUNNER ────
function RunnerView({ data, search, expanded, toggle }) {
  if (typeof data !== 'object' || Array.isArray(data) || !data) return <RawView data={data} />;
  const categories = useMemo(() => Object.entries(data)
    .filter(([, w]) => Array.isArray(w))
    .map(([cat, words]) => ({ cat, words: search ? words.filter(w => matchesSearch(w, search)) : words }))
    .filter(c => !search || c.words.length > 0 || matchesSearch(c.cat, search))
    .sort((a, b) => a.cat.localeCompare(b.cat)),
  [data, search]);
  return (
    <div className="space-y-2">
      {categories.map(({ cat, words }) => (
        <div key={cat}>
          <SectionHeader label={cat} count={words.length} expanded={expanded[cat]} onClick={() => toggle(cat)} icon="📂" />
          <AnimatePresence>
            {expanded[cat] && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="ml-6 mt-1 bg-white rounded-lg p-4 border border-slate-100">
                  <div className="flex flex-wrap gap-1.5">{words.map((w, j) => <span key={j} className="text-sm bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"><Highlight text={w} search={search} /></span>)}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ──── PAREJAS ────
function ParejasView({ data, search }) {
  const safeData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => search ? safeData.filter(p => p && (matchesSearch(p.a, search) || matchesSearch(p.b, search))) : safeData, [safeData, search]);
  if (!filtered.length && !search) return <RawView data={data} />;
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-8">#</th><th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Elemento A</th><th className="text-center px-2 py-3 text-xs text-slate-400">↔</th><th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Elemento B</th></tr></thead>
        <tbody>{filtered.map((p, i) => <tr key={i} className="border-b border-slate-50 hover:bg-indigo-50/30"><td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{i+1}</td><td className="px-4 py-2.5 text-slate-700 font-medium"><Highlight text={p?.a} search={search} /></td><td className="px-2 py-2.5 text-center text-indigo-400">⇄</td><td className="px-4 py-2.5 text-slate-700"><Highlight text={p?.b} search={search} /></td></tr>)}</tbody>
      </table>
    </div>
  );
}

// ──── FRASES ────
function FrasesView({ data, search }) {
  const items = useMemo(() => {
    const safe = Array.isArray(data) ? data : [];
    const norm = safe.map(f => typeof f === 'string' ? f : (f?.solucion || f?.frase || JSON.stringify(f)));
    return search ? norm.filter(f => matchesSearch(f, search)) : norm;
  }, [data, search]);
  if (!items.length && !search) return <RawView data={data} />;
  return <div className="space-y-2">{items.map((f, i) => <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3"><span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5">{i+1}</span><p className="text-sm text-slate-700"><Highlight text={f} search={search} /></p></div>)}</div>;
}

// ──── HISTORIAS ────
function HistoriasView({ data, search, expanded, toggle }) {
  const safeData = Array.isArray(data) ? data : [];
  if (!safeData.length) return <RawView data={data} />;
  return (
    <div className="space-y-2">
      {safeData.map((h, i) => {
        const key = `historia-${i}`, sentences = Array.isArray(h) ? h : (typeof h === 'string' ? [h] : []);
        if (search && !sentences.some(s => matchesSearch(s, search))) return null;
        return (
          <div key={key}>
            <SectionHeader label={`Historia ${i+1}`} count={`${sentences.length} frases`} expanded={expanded[key]} onClick={() => toggle(key)} icon="📖" />
            <AnimatePresence>
              {expanded[key] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="ml-6 mt-1 space-y-1">{sentences.map((f, j) => <div key={j} className="bg-white rounded-lg p-3 border border-slate-100 flex items-start gap-2"><span className="text-xs bg-slate-200 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full font-bold flex-shrink-0">{j+1}</span><p className="text-sm text-slate-700"><Highlight text={typeof f === 'string' ? f : JSON.stringify(f)} search={search} /></p></div>)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ──── DETECTIVE ────
function DetectiveView({ data, search }) {
  const items = useMemo(() => {
    const safe = Array.isArray(data) ? data : [];
    const norm = safe.map(f => typeof f === 'string' ? f : (f?.solucion || JSON.stringify(f)));
    return search ? norm.filter(f => matchesSearch(f, search)) : norm;
  }, [data, search]);
  if (!items.length && !search) return <RawView data={data} />;
  return <div className="space-y-2">{items.map((f, i) => <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">{i+1}</span><span className="text-xs text-slate-400">Frase sin espacios</span></div><p className="text-sm text-slate-700 font-mono bg-slate-50 p-2 rounded-lg break-all"><Highlight text={f} search={search} /></p></div>)}</div>;
}

// ──── COMPRENSION ────
function ComprensionView({ data, search, expanded, toggle }) {
  const safeData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => search ? safeData.filter(t => t && (matchesSearch(t.titulo, search) || matchesSearch(t.texto, search) || (Array.isArray(t.preguntas) && t.preguntas.some(p => matchesSearch(p?.pregunta, search))))) : safeData, [safeData, search]);
  if (!filtered.length && !search) return <RawView data={data} />;
  return (
    <div className="space-y-2">
      {filtered.map((texto, i) => {
        if (!texto) return null;
        const key = `texto-${i}`, preguntas = Array.isArray(texto.preguntas) ? texto.preguntas : [];
        return (
          <div key={key}>
            <SectionHeader label={texto.titulo || `Texto ${i+1}`} count={`${preguntas.length} preguntas`} expanded={expanded[key]} onClick={() => toggle(key)} icon="📄" />
            <AnimatePresence>
              {expanded[key] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="ml-6 mt-1 space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Texto</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"><Highlight text={texto.texto} search={search} /></p>
                    </div>
                    {preguntas.map((preg, j) => {
                      if (!preg) return null;
                      const opciones = Array.isArray(preg.opciones) ? preg.opciones : [];
                      return (
                        <div key={j} className="bg-white rounded-lg p-4 border border-slate-100">
                          <p className="text-sm font-semibold text-slate-700 mb-2"><span className="text-indigo-500 mr-1">P{j+1}.</span><Highlight text={preg.pregunta} search={search} /></p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                            {opciones.map((op, k) => {
                              const ok = op === preg.respuesta || k === preg.correcta;
                              return <div key={k} className={`text-sm px-3 py-1.5 rounded-lg ${ok ? 'bg-green-50 text-green-700 border border-green-200 font-medium' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>{ok && <span className="mr-1">✓</span>}<Highlight text={op} search={search} /></div>;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ──── APP CONTENT (genérico para terminal, bloques, personajes, etc.) ────
function AppContentView({ data, search, expanded, toggle }) {
  if (data == null) return <RawView data={data} />;

  // Si es un array, mostrar como lista expandible
  if (Array.isArray(data)) {
    const filtered = search ? data.filter(item => matchesSearch(JSON.stringify(item), search)) : data;
    return (
      <div className="space-y-2">
        {filtered.map((item, i) => {
          if (typeof item === 'string') {
            return <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"><p className="text-sm text-slate-700"><Highlight text={item} search={search} /></p></div>;
          }
          if (typeof item === 'object' && item) {
            const key = `item-${i}`;
            const label = item.nombre || item.name || item.titulo || item.symbol || `Elemento ${i+1}`;
            return (
              <div key={key}>
                <SectionHeader label={String(label)} count={Object.keys(item).length + ' campos'} expanded={expanded[key]} onClick={() => toggle(key)} icon="📋" />
                <AnimatePresence>
                  {expanded[key] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="ml-6 mt-1 bg-white rounded-lg p-4 border border-slate-100">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(item).map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-xs font-semibold text-slate-500">{k}</dt>
                              <dd className="text-sm text-slate-700 break-words">
                                {typeof v === 'object' ? <pre className="text-xs bg-slate-50 p-1 rounded overflow-auto max-h-32">{JSON.stringify(v, null, 2)}</pre> : <Highlight text={String(v)} search={search} />}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 text-sm text-slate-700">{JSON.stringify(item)}</div>;
        })}
      </div>
    );
  }

  // Si es un objeto, mostrar sus claves como secciones
  if (typeof data === 'object') {
    const entries = Object.entries(data).filter(([, v]) => !search || matchesSearch(JSON.stringify(v), search));
    return (
      <div className="space-y-2">
        {entries.map(([k, v]) => {
          const count = Array.isArray(v) ? v.length + ' items' : (typeof v === 'object' && v ? Object.keys(v).length + ' campos' : '');
          return (
            <div key={k}>
              <SectionHeader label={k} count={count} expanded={expanded[k]} onClick={() => toggle(k)} icon="📂" />
              <AnimatePresence>
                {expanded[k] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="ml-6 mt-1 bg-white rounded-lg p-4 border border-slate-100">
                      {Array.isArray(v) ? (
                        <div className="flex flex-wrap gap-1.5">{v.map((item, j) => <span key={j} className="text-sm bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">{typeof item === 'object' ? JSON.stringify(item) : <Highlight text={String(item)} search={search} />}</span>)}</div>
                      ) : typeof v === 'object' && v ? (
                        <pre className="text-xs text-slate-600 overflow-auto max-h-64 whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</pre>
                      ) : (
                        <p className="text-sm text-slate-700"><Highlight text={String(v)} search={search} /></p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  return <RawView data={data} />;
}

export default DataExplorer;
