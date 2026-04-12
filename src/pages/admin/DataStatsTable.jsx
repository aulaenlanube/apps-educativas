import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import materiasData from '../../../public/data/materias.json';
import { primariaApps } from '@/apps/config/primariaApps';
import { esoApps } from '@/apps/config/esoApps';
import { bachilleratoApps } from '@/apps/config/bachilleratoApps';

// App id → source (qué fuente de datos utiliza cada app)
// Si un combo curso/asignatura no tiene ninguna app de cierta fuente, esa celda no aplica
const APP_ID_TO_SOURCE = {
  // rosco
  'rosco-del-saber': 'rosco', 'ahorcado': 'rosco', 'crucigrama': 'rosco',
  'sopa-de-letras': 'rosco', 'millonario': 'rosco', 'anagramas': 'rosco',
  'criptograma': 'rosco', 'velocidad-respuesta': 'rosco',
  'conecta-parejas': 'rosco', 'dictado-interactivo': 'rosco',
  // runner
  'runner': 'runner', 'juego-memoria': 'runner', 'clasificador': 'runner',
  'lluvia-de-palabras': 'runner', 'excavacion-selectiva': 'runner',
  'snake': 'runner', 'torre-palabras': 'runner',
  // intruso
  'busca-el-intruso': 'intruso',
  // parejas
  'parejas': 'parejas',
  // frases
  'ordena-la-frase': 'frases',
  // historias
  'ordena-la-historia': 'historias',
  // detective
  'detective-de-palabras': 'detective',
  // comprensión
  'comprension-escrita': 'comprension', 'comprension-oral': 'comprension',
  // apps con contenido específico (app_content)
  'mesa-crafteo': 'elementos-quimica',
  'entrenador-tabla': 'elementos-quimica',
  'programacion-bloques-windows': 'bloques',
  'terminal-retro': 'terminal-retro',
  'generador-personajes-historicos': 'generador-personajes',
  'banco-recursos-tutoria': 'banco-tutoria',
};

// Para cada fuente "app_content" (contenido específico), define qué (subject_id, level)
// la utilizan según los configs de apps. Esto permite expandir las pocas filas globales
// del app_content en celdas (level, grade, subject) en la tabla pivote.
const APP_CONTENT_SUBJECT_MAP = {
  'elementos-quimica': {
    fisica: ['eso','bachillerato'],
    quimica: ['bachillerato'],
  },
  'bloques': {
    programacion: ['eso','bachillerato'],
  },
  'terminal-retro': {
    programacion: ['eso','bachillerato'],
  },
  'generador-personajes': {
    tutoria: ['primaria','eso','bachillerato'],
  },
  'banco-tutoria': {
    tutoria: ['primaria','eso','bachillerato'],
  },
};

// Calcula la cantidad de "items" disponibles en una celda (level, grade, subject)
// para una fuente del tipo app_content. Tiene en cuenta las quirks de cada app:
//   - elementos-quimica / banco-tutoria: contenido global (1 fila para todo)
//   - bloques / terminal-retro: el código del app fuerza level='eso' para bach
//   - generador-personajes: usa nivel real, con fallback a ESO desde Bach
function getAppContentItems(appType, level, grade, subject, contentStats) {
  const map = APP_CONTENT_SUBJECT_MAP[appType];
  if (!map) return null;
  if (!map[subject] || !map[subject].includes(level)) return null;

  if (appType === 'banco-tutoria' || appType === 'elementos-quimica') {
    const row = contentStats.find(r => r.app_type === appType);
    return row ? Number(row.items || 0) : 0;
  }
  if (appType === 'bloques' || appType === 'terminal-retro') {
    // Siempre usa nivel 'eso' (forzado en el código de la app)
    const row = contentStats.find(r =>
      r.app_type === appType && r.level === 'eso' &&
      Array.isArray(r.grades) && r.grades.includes(Number(grade))
    );
    return row ? Number(row.items || 0) : 0;
  }
  if (appType === 'generador-personajes') {
    // Match exacto por nivel + grado en rango
    let row = contentStats.find(r =>
      r.app_type === appType && r.level === level &&
      Array.isArray(r.grades) && r.grades.includes(Number(grade))
    );
    if (row) return Number(row.items || 0);
    // Fallback: bachillerato usa datos de eso
    if (level === 'bachillerato') {
      row = contentStats.find(r => r.app_type === appType && r.level === 'eso');
      return row ? Number(row.items || 0) : 0;
    }
    return 0;
  }
  return 0;
}

// Dado (level, grade, subject), devuelve set de fuentes que están disponibles
// según la config de apps (es decir, hay al menos una app que usa esa fuente)
function getSourcesForCombo(level, grade, subject) {
  const config = level === 'primaria' ? primariaApps : level === 'eso' ? esoApps : bachilleratoApps;
  const apps = config?.[String(grade)]?.[subject] || [];
  const sources = new Set();
  for (const app of apps) {
    const src = APP_ID_TO_SOURCE[app.id];
    if (src) sources.add(src);
  }
  return sources;
}

// Fuentes de datos → etiqueta legible + color + icono + target por combo + apps que la usan
// target = cantidad objetivo aproximada por combo (curso/asignatura)
const SOURCES = [
  {
    id: 'rosco', label: 'Palabras del Rosco', icon: '🔤', color: '#6366f1',
    unit: 'preguntas', target: 100,
    apps: ['Pasapalabra', 'Ahorcado', 'Crucigrama', 'Sopa de Letras', 'Millonario',
           'Anagramas', 'Criptograma', 'Velocidad de Respuesta', 'Conecta Parejas', 'Dictado Interactivo'],
  },
  {
    id: 'runner', label: 'Categorías Runner', icon: '🏃', color: '#0ea5e9',
    unit: 'categorías', target: 10,
    apps: ['Education Dash', 'Juego de Memoria', 'Clasificador', 'Lluvia de Palabras',
           'Excavación Selectiva', 'Snake', 'Torre de Palabras'],
  },
  {
    id: 'intruso', label: 'Busca el Intruso', icon: '🔍', color: '#f59e0b',
    unit: 'conjuntos', target: 10,
    apps: ['Busca el Intruso'],
  },
  {
    id: 'parejas', label: 'Parejas de Cartas', icon: '🃏', color: '#8b5cf6',
    unit: 'parejas', target: 25,
    apps: ['Parejas de Cartas'],
  },
  {
    id: 'frases', label: 'Ordena la Frase', icon: '📝', color: '#10b981',
    unit: 'frases', target: 100,
    apps: ['Ordena la Frase'],
  },
  {
    id: 'historias', label: 'Ordena la Historia', icon: '📖', color: '#ec4899',
    unit: 'historias', target: 50,
    apps: ['Ordena la Historia'],
  },
  {
    id: 'detective', label: 'Detective de Palabras', icon: '🕵️', color: '#64748b',
    unit: 'frases', target: 50,
    apps: ['Detective de Palabras'],
  },
  {
    id: 'comprension', label: 'Comprensión Lectora/Oral', icon: '📚', color: '#14b8a6',
    unit: 'textos', target: 20,
    apps: ['Comprensión Escrita', 'Comprensión Oral'],
  },
  // Apps con contenido específico (tabla app_content)
  {
    id: 'elementos-quimica', label: 'Elementos Química', icon: '🧪', color: '#06b6d4',
    unit: 'datasets', target: 1, isAppContent: true,
    apps: ['Mesa de Crafteo', 'Entrenador Tabla Periódica'],
  },
  {
    id: 'bloques', label: 'Programación con Bloques', icon: '💾', color: '#a855f7',
    unit: 'retos', target: 5, isAppContent: true,
    apps: ['Programación Visual'],
  },
  {
    id: 'terminal-retro', label: 'Terminal de Hackeo', icon: '📟', color: '#22c55e',
    unit: 'ejercicios', target: 5, isAppContent: true,
    apps: ['Terminal Retro'],
  },
  {
    id: 'generador-personajes', label: 'Personajes Históricos', icon: '✨', color: '#f43f5e',
    unit: 'personajes', target: 100, isAppContent: true,
    apps: ['Generador de Personajes Históricos'],
  },
  {
    id: 'banco-tutoria', label: 'Banco Recursos Tutoría', icon: '🎓', color: '#eab308',
    unit: 'recursos', target: 14, isAppContent: true,
    apps: ['Banco de Recursos Tutoría'],
  },
];

const LEVELS = [
  { id: 'primaria', label: 'Primaria', grades: [1, 2, 3, 4, 5, 6] },
  { id: 'eso', label: 'ESO', grades: [1, 2, 3, 4] },
  { id: 'bachillerato', label: 'Bachillerato', grades: [1, 2] },
];

// Progresión global de cursos (de menor a mayor) — misma que usa RoscoJuego
const GRADE_PROGRESSION = [];
for (let g = 1; g <= 6; g++) GRADE_PROGRESSION.push({ level: 'primaria', grade: g });
for (let g = 1; g <= 4; g++) GRADE_PROGRESSION.push({ level: 'eso', grade: g });
for (let g = 1; g <= 2; g++) GRADE_PROGRESSION.push({ level: 'bachillerato', grade: g });
const getProgressionIndex = (level, grade) =>
  GRADE_PROGRESSION.findIndex(p => p.level === level && p.grade === Number(grade));

// Umbrales para colorear según el % respecto al target del source
// Cada app tiene un target diferente (rosco ~100, runner ~10, etc)
function cellColor(value, target) {
  if (value == null || value === 0) return { bg: '#fef2f2', fg: '#991b1b', label: 'Sin datos' };
  const pct = (value / target) * 100;
  if (pct < 25) return { bg: '#fef3c7', fg: '#92400e', label: 'Muy escaso' };
  if (pct < 60) return { bg: '#fef9c3', fg: '#854d0e', label: 'Escaso' };
  if (pct < 90) return { bg: '#ecfccb', fg: '#3f6212', label: 'Casi completo' };
  return { bg: '#dcfce7', fg: '#166534', label: 'Completo' };
}

const DataStatsTable = () => {
  const [stats, setStats] = useState([]);
  const [contentStats, setContentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState('rosco');
  const [activeLevel, setActiveLevel] = useState('eso');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Carga paralela de las dos RPCs
    Promise.all([
      supabase.rpc('get_data_stats_json'),
      supabase.rpc('get_app_content_stats'),
    ]).then(([statsRes, contentRes]) => {
      if (cancelled) return;
      if (statsRes.error) {
        console.error('Error cargando stats:', statsRes.error.message);
        setStats([]);
      } else {
        setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
      }
      if (contentRes.error) {
        console.error('Error cargando contentStats:', contentRes.error.message);
        setContentStats([]);
      } else {
        setContentStats(Array.isArray(contentRes.data) ? contentRes.data : []);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Obtener todas las asignaturas del nivel activo a partir de materias.json
  const subjectsForLevel = useMemo(() => {
    const levelConf = LEVELS.find(l => l.id === activeLevel);
    if (!levelConf) return [];
    const set = new Map(); // subject_id → { id, nombre, icon }
    for (const grade of levelConf.grades) {
      const subjects = materiasData?.[activeLevel]?.[String(grade)] || [];
      for (const s of subjects) {
        if (!set.has(s.id)) set.set(s.id, s);
      }
    }
    return [...set.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [activeLevel]);

  // Filtrar stats por fuente y nivel activos
  const filteredStats = useMemo(() => {
    const result = new Map(); // `${subject}|${grade}` → count
    for (const row of stats) {
      if (row.source !== activeSource) continue;
      if (row.level !== activeLevel) continue;
      const key = `${row.subject_id}|${row.grade}`;
      result.set(key, Number(row.total));
    }
    return result;
  }, [stats, activeSource, activeLevel]);

  // Heredado: diferentes apps tienen distintas lógicas de fallback
  // - rosco: cursos ANTERIORES de cualquier nivel, misma asignatura
  // - detective: mismo nivel, fallback a 'general' subject o a grado 1 misma asignatura
  const inheritedStats = useMemo(() => {
    const result = new Map(); // `${subject}|${grade}` → count heredado
    const currentLvl = LEVELS.find(l => l.id === activeLevel);
    if (!currentLvl) return result;

    if (activeSource === 'rosco') {
      // Herencia de rosco: suma de datos de la misma asignatura en cursos ANTERIORES globales
      for (const subj of subjectsForLevel) {
        for (const grade of currentLvl.grades) {
          const curIdx = getProgressionIndex(activeLevel, grade);
          if (curIdx < 0) continue;
          let inherited = 0;
          for (let i = 0; i < curIdx; i++) {
            const prev = GRADE_PROGRESSION[i];
            for (const row of stats) {
              if (row.source !== 'rosco') continue;
              if (row.level !== prev.level) continue;
              if (Number(row.grade) !== prev.grade) continue;
              if (row.subject_id !== subj.id) continue;
              inherited += Number(row.total);
            }
          }
          result.set(`${subj.id}|${grade}`, inherited);
        }
      }
    }
    // Detective NO tiene herencia cruzada entre niveles. Su fallback intra-nivel
    // (subject='general' o grado 1) casi nunca aporta datos útiles, así que lo
    // omitimos para no confundir visualmente. Se muestra como conteo directo.
    return result;
  }, [stats, activeSource, activeLevel, subjectsForLevel]);

  // Totales por fuente (para mostrar en las pestañas)
  const totalsBySource = useMemo(() => {
    const totals = {};
    for (const s of SOURCES) totals[s.id] = 0;
    // Sources de stats normales (suma de filas en sus tablas)
    for (const row of stats) {
      totals[row.source] = (totals[row.source] || 0) + Number(row.total);
    }
    // Sources de app_content (suma de items de cada fila)
    for (const row of contentStats) {
      if (totals[row.app_type] != null) {
        totals[row.app_type] = (totals[row.app_type] || 0) + Number(row.items || 0);
      }
    }
    return totals;
  }, [stats, contentStats]);

  const currentLevel = LEVELS.find(l => l.id === activeLevel);
  const currentSource = SOURCES.find(s => s.id === activeSource);

  // Para cada asignatura calcular total, con flag de "aplica" por celda
  const subjectSummary = useMemo(() => {
    const isAppContent = currentSource && currentSource.isAppContent;
    return subjectsForLevel.map(subj => {
      const byGrade = {}; // grade → { count, inherited, applies }
      let total = 0;
      let applicableGrades = 0;
      for (const grade of currentLevel.grades) {
        const sources = getSourcesForCombo(activeLevel, grade, subj.id);
        const applies = sources.has(activeSource);
        let count = 0;
        let inherited = 0;
        if (isAppContent) {
          // Para apps con contenido específico calculamos el conteo desde contentStats
          count = applies ? (getAppContentItems(activeSource, activeLevel, grade, subj.id, contentStats) || 0) : 0;
        } else {
          count = filteredStats.get(`${subj.id}|${grade}`) || 0;
          inherited = inheritedStats.get(`${subj.id}|${grade}`) || 0;
        }
        byGrade[grade] = { count, inherited, applies };
        if (applies) {
          total += count;
          applicableGrades++;
        }
      }
      return { ...subj, byGrade, total, applicableGrades };
    });
  }, [subjectsForLevel, filteredStats, inheritedStats, contentStats, currentLevel, activeLevel, activeSource, currentSource]);

  // Filtrar asignaturas que tienen AL MENOS UN curso aplicable — para no mostrar
  // filas completas donde la app no existe en ningún curso de ese nivel
  const visibleSubjects = useMemo(() => {
    return subjectSummary.filter(s => s.applicableGrades > 0);
  }, [subjectSummary]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Cantidad de datos por app
          </h3>
          <p className="text-xs text-slate-500 mt-1">Detecta rápidamente combinaciones con pocos datos</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando estadísticas...</span>
        </div>
      ) : (
        <>
          {/* Fuente de datos (tabs) */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Tipo de dato</label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(src => {
                const isActive = activeSource === src.id;
                const total = totalsBySource[src.id] || 0;
                return (
                  <button
                    key={src.id}
                    onClick={() => setActiveSource(src.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive ? 'text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                    style={isActive ? { backgroundColor: src.color } : undefined}
                  >
                    <span>{src.icon}</span>
                    <span>{src.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25' : 'bg-slate-200 text-slate-500'}`}>
                      {total.toLocaleString('es-ES')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apps que consumen estos datos */}
          <div
            className="rounded-lg p-2.5 border"
            style={{ backgroundColor: `${currentSource.color}10`, borderColor: `${currentSource.color}30` }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-600">
                {currentSource.apps.length} {currentSource.apps.length === 1 ? 'app utiliza' : 'apps utilizan'} estos datos:
              </span>
              {currentSource.apps.map(name => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                  style={{ backgroundColor: `${currentSource.color}25`, color: currentSource.color }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Nivel */}
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nivel educativo</label>
            <div className="flex gap-1">
              {LEVELS.map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setActiveLevel(lvl.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeLevel === lvl.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 sticky left-0 bg-slate-50 z-10">
                    Asignatura
                  </th>
                  {currentLevel.grades.map(g => (
                    <th key={g} className="text-center px-2 py-2 font-semibold text-slate-600 w-16">
                      {g}º
                    </th>
                  ))}
                  <th className="text-center px-2 py-2 font-semibold text-slate-600 w-20 border-l border-slate-200">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleSubjects.length === 0 && (
                  <tr>
                    <td colSpan={currentLevel.grades.length + 2} className="text-center py-8 text-slate-400 italic">
                      Esta app no está disponible en ninguna asignatura de este nivel
                    </td>
                  </tr>
                )}
                {visibleSubjects.map((subj, idx) => (
                  <tr key={subj.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-3 py-1.5 font-medium text-slate-700 whitespace-nowrap sticky left-0 bg-inherit z-10 border-r border-slate-100">
                      <span className="mr-1">{subj.icon}</span>
                      {subj.nombre}
                    </td>
                    {currentLevel.grades.map(g => {
                      const cell = subj.byGrade[g] || { count: 0, inherited: 0, applies: false };
                      if (!cell.applies) {
                        return (
                          <td key={g} className="text-center px-1 py-1">
                            <span
                              className="inline-block w-full py-1 rounded text-slate-300"
                              title={`${currentSource.label} no disponible en ${subj.nombre} de ${g}º ${currentLevel.label}`}
                            >
                              ⊘
                            </span>
                          </td>
                        );
                      }
                      const hasInherited = cell.inherited > 0;
                      // Si hay 0 directo pero existe heredado, usar un color neutro azul
                      // que indique "la app funciona gracias a datos heredados"
                      let bg, fg;
                      if (cell.count === 0 && hasInherited) {
                        bg = '#dbeafe'; fg = '#1e40af'; // azul indicando heredado
                      } else {
                        const c = cellColor(cell.count, currentSource.target);
                        bg = c.bg; fg = c.fg;
                      }
                      const inheritedNote = hasInherited
                        ? ` — también accede a ${cell.inherited} heredados de cursos anteriores`
                        : '';
                      return (
                        <td key={g} className="text-center px-1 py-1">
                          <span
                            className="inline-flex items-center justify-center gap-1 w-full py-1 rounded font-semibold tabular-nums"
                            style={{ backgroundColor: bg, color: fg }}
                            title={`${subj.nombre} · ${g}º ${currentLevel.label}: ${cell.count} ${currentSource.unit}${inheritedNote}`}
                          >
                            {cell.count}
                            {hasInherited && (
                              <span className="text-[9px] opacity-70 font-normal">↩{cell.inherited}</span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center px-2 py-1 border-l border-slate-100">
                      <span className="font-bold text-slate-700 tabular-nums">
                        {subj.total.toLocaleString('es-ES')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t border-slate-200 font-bold text-slate-700">
                <tr>
                  <td className="px-3 py-2 sticky left-0 bg-slate-100 z-10">Total por curso</td>
                  {currentLevel.grades.map(g => {
                    const colTotal = visibleSubjects.reduce(
                      (sum, s) => sum + (s.byGrade[g]?.applies ? s.byGrade[g].count : 0),
                      0
                    );
                    return (
                      <td key={g} className="text-center px-2 py-2 tabular-nums">
                        {colTotal.toLocaleString('es-ES')}
                      </td>
                    );
                  })}
                  <td className="text-center px-2 py-2 border-l border-slate-200 tabular-nums text-indigo-700">
                    {visibleSubjects.reduce((sum, s) => sum + s.total, 0).toLocaleString('es-ES')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </motion.div>

          {/* Leyenda de colores */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="font-semibold">
              Leyenda (target {currentSource.label}: {currentSource.target} {currentSource.unit}):
            </span>
            {[
              { bg: '#fef2f2', fg: '#991b1b', label: 'Sin datos (0)' },
              { bg: '#fef3c7', fg: '#92400e', label: `Muy escaso (<${Math.round(currentSource.target * 0.25)})` },
              { bg: '#fef9c3', fg: '#854d0e', label: `Escaso (<${Math.round(currentSource.target * 0.6)})` },
              { bg: '#ecfccb', fg: '#3f6212', label: `Casi completo (<${Math.round(currentSource.target * 0.9)})` },
              { bg: '#dcfce7', fg: '#166534', label: `Completo (≥${Math.round(currentSource.target * 0.9)})` },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: l.bg, border: `1px solid ${l.fg}20` }} />
                {l.label}
              </span>
            ))}
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded text-slate-300 leading-none text-center">⊘</span>
              App no disponible
            </span>
            {activeSource === 'rosco' && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: '#dbeafe', border: '1px solid #1e40af20' }} />
                ↩N = accede a N heredados de cursos anteriores
              </span>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default DataStatsTable;
