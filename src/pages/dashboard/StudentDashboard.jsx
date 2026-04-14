import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Gamepad2, Clock, Target, Trophy, Flame, BarChart3,
  BookOpen, TrendingUp, CalendarDays, Timer, Star, Zap, MessageSquare,
  ChevronDown, ChevronUp, Award, ClipboardList, CheckCircle2, AlertTriangle, Circle,
  Play, Compass
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import StudentProfileEditor from './StudentProfileEditor';
import StudentChatTab from './StudentChatTab';
import StudentLogrosTab from './StudentLogrosTab';
import MyFeedbacksSection from '@/components/ui/MyFeedbacksSection';
import { useGamification } from '@/hooks/useGamification';

const SUBJECT_LABELS = {
  matematicas: 'Matematicas',
  lengua: 'Lengua',
  ingles: 'Ingles',
  'ciencias-naturales': 'Ciencias Naturales',
  'ciencias-sociales': 'Ciencias Sociales',
  historia: 'Historia',
  biologia: 'Biologia',
  fisica: 'Fisica',
  musica: 'Musica',
  plastica: 'Plastica',
  tecnologia: 'Tecnologia',
  'ed-fisica': 'Ed. Fisica',
  tutoria: 'Tutoria',
  valenciano: 'Valenciano',
  frances: 'Frances',
  programacion: 'Programacion',
  robotica: 'Robotica',
  ia: 'Inteligencia Artificial',
  latin: 'Latin',
  economia: 'Economia',
};

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

// ─── Stat Card ───────────────────────��───────────────────
function StatCard({ icon: Icon, label, value, subValue, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Apps Detail Table ───────────────────────────────────
function AppsDetail({ apps }) {
  const [expanded, setExpanded] = useState(null);
  const [showAll, setShowAll] = useState(false);

  if (!apps || apps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aun no has jugado ninguna partida</p>
      </div>
    );
  }

  const displayed = showAll ? apps : apps.slice(0, 10);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 rounded-l-lg">App</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center">Partidas</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center hidden sm:table-cell">Practica</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center hidden sm:table-cell">Examen</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center">Precision</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center">Nota</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 text-center hidden md:table-cell">Tiempo</th>
              <th className="px-3 py-2.5 text-xs font-medium text-slate-500 rounded-r-lg w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayed.map((app) => (
              <React.Fragment key={app.app_id + (app.level || '') + (app.grade || '')}>
                <tr
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === app.app_id ? null : app.app_id)}
                >
                  <td className="px-3 py-2.5">
                    <div>
                      <span className="font-medium text-slate-700">{app.app_name}</span>
                      {app.level && (
                        <span className="ml-2 text-xs text-slate-400 capitalize">
                          {app.level} {app.grade}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-slate-700">{app.total_plays}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500 hidden sm:table-cell">{app.practice_plays}</td>
                  <td className="px-3 py-2.5 text-center text-slate-500 hidden sm:table-cell">{app.test_plays}</td>
                  <td className="px-3 py-2.5 text-center">
                    <AccuracyBadge value={app.accuracy} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <NotaBadge value={app.best_nota ?? app.best_score} />
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-500 hidden md:table-cell">{formatTime(app.total_time_seconds)}</td>
                  <td className="px-3 py-2.5 text-center">
                    {expanded === app.app_id
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </td>
                </tr>
                <AnimatePresence>
                  {expanded === app.app_id && (
                    <tr>
                      <td colSpan={8}>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-slate-50 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <p className="text-xs text-slate-400">Nota media</p>
                              <p className="text-sm font-bold text-slate-700">{app.avg_nota ?? '-'}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Nota media examen</p>
                              <p className="text-sm font-bold text-slate-700">{app.avg_test_nota ?? '-'}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Mejor nota examen</p>
                              <p className="text-sm font-bold text-amber-600">{app.best_test_nota ?? '-'}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Duracion media</p>
                              <p className="text-sm font-bold text-slate-700">{formatTime(app.avg_duration_seconds)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Aciertos totales</p>
                              <p className="text-sm font-bold text-green-600">{app.total_correct} / {app.total_questions}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Asignatura</p>
                              <p className="text-sm font-bold text-slate-700">{SUBJECT_LABELS[app.subject_id] || app.subject_id || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Ultima partida</p>
                              <p className="text-sm font-bold text-slate-700">{formatDate(app.last_played)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Tiempo total</p>
                              <p className="text-sm font-bold text-slate-700">{formatTime(app.total_time_seconds)}</p>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {apps.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
        >
          {showAll ? 'Mostrar menos' : `Ver todas (${apps.length} apps)`}
        </button>
      )}
    </div>
  );
}

function AccuracyBadge({ value }) {
  const color = value >= 80 ? 'bg-green-100 text-green-700'
    : value >= 50 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {value}%
    </span>
  );
}

function NotaBadge({ value }) {
  const n = typeof value === 'number' ? value : parseFloat(value) || 0;
  const color = n >= 9 ? 'bg-green-100 text-green-700'
    : n >= 7 ? 'bg-emerald-100 text-emerald-700'
    : n >= 5 ? 'bg-amber-100 text-amber-700'
    : n > 0 ? 'bg-red-100 text-red-700'
    : 'bg-slate-100 text-slate-400';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {n > 0 ? `${n}/10` : '-'}
    </span>
  );
}

// ─── Recent Sessions ─────────────────────────────────────
function RecentSessions({ sessions }) {
  if (!sessions || sessions.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-3 py-2 text-xs font-medium text-slate-500 rounded-l-lg">App</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-500 text-center">Modo</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-500 text-center">Nota</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-500 text-center hidden sm:table-cell">Aciertos</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-500 text-center hidden sm:table-cell">Duracion</th>
            <th className="px-3 py-2 text-xs font-medium text-slate-500 rounded-r-lg">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sessions.map((s, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-2">
                <span className="font-medium text-slate-700">{s.app_name}</span>
                {s.level && (
                  <span className="ml-1 text-xs text-slate-400 capitalize">{s.level} {s.grade}</span>
                )}
              </td>
              <td className="px-3 py-2 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  s.mode === 'test' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {s.mode === 'test' ? 'Examen' : 'Practica'}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                <NotaBadge value={s.nota} />
              </td>
              <td className="px-3 py-2 text-center text-slate-500 hidden sm:table-cell">
                {s.total_questions > 0 ? `${s.correct_answers}/${s.total_questions}` : '-'}
              </td>
              <td className="px-3 py-2 text-center text-slate-500 hidden sm:table-cell">
                {formatTime(s.duration_seconds)}
              </td>
              <td className="px-3 py-2 text-xs text-slate-500">{formatDateTime(s.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Activity Chart ──────────────────────────────────────
function ActivityChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxSessions = Math.max(...data.map(d => d.sessions));

  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {data.map((day, i) => {
          const height = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
          const date = new Date(day.day);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
              <div className="hidden group-hover:block absolute -top-10 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}:
                {' '}{day.sessions} partida{day.sessions !== 1 ? 's' : ''}, {formatTime(day.total_seconds)}
              </div>
              <div
                className={`w-full rounded-t transition-all duration-300 min-h-[2px] ${
                  isWeekend
                    ? 'bg-gradient-to-t from-purple-400 to-purple-300'
                    : 'bg-gradient-to-t from-blue-500 to-blue-300'
                }`}
                style={{ height: `${Math.max(height, 3)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-slate-400">Hace 30 dias</span>
        <span className="text-xs text-slate-400">Hoy</span>
      </div>
    </div>
  );
}

// ─── Subject Stats ───────────────────────────────────────
function SubjectStats({ data }) {
  if (!data || data.length === 0) return null;

  const maxPlays = Math.max(...data.map(d => d.total_plays));

  return (
    <div className="space-y-3">
      {data.map((sub) => (
        <div key={sub.subject_id} className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 w-32 truncate">
            {SUBJECT_LABELS[sub.subject_id] || sub.subject_id}
          </span>
          <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(sub.total_plays / maxPlays) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600">
              {sub.total_plays} partidas - {sub.accuracy}%
            </span>
          </div>
          <span className="text-xs text-slate-400 w-16 text-right">{formatTime(sub.total_time_seconds)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function StudentDashboard() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [qbStats, setQbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // Sincronizar tab con query param cuando cambia la URL estando ya en la página
  const location = useLocation();
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [location.search]);
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const gamification = useGamification();

  const fetchDashboard = useCallback(async () => {
    if (!student) return;
    setLoading(true);

    const [dashResult, asgResult, qbResult] = await Promise.all([
      supabase.rpc('student_get_dashboard', {
        p_student_id: student.id,
        p_group_id: student.group_id,
      }),
      supabase.rpc('student_get_assignments', {
        p_student_id: student.id,
        p_group_id: student.group_id,
      }),
      supabase.rpc('get_student_quiz_battle_stats', {
        p_student_id: student.id,
      }).then(res => res, () => ({ data: null })),
    ]);

    if (dashResult.error) {
      setError(dashResult.error.message);
    } else if (dashResult.data?.error) {
      setError(dashResult.data.error);
    } else {
      setData(dashResult.data);
    }

    if (asgResult.data?.assignments) {
      setAssignments(asgResult.data.assignments);
    }

    if (qbResult?.data && !qbResult.data?.error) {
      setQbStats(qbResult.data);
    }

    setLoading(false);
  }, [student]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <div>
        <Header subtitle="Mi Panel" />
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header subtitle="Mi Panel" />
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="text-lg font-medium">No se pudieron cargar los datos</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const apps = data?.apps_detail || [];
  const recent = data?.recent_sessions || [];
  const daily = data?.daily_activity || [];
  const subjects = data?.by_subject || [];
  const studentInfo = data?.student || {};

  const pendingAssignments = assignments.filter(a => !a.completed);

  const hasGroup = !!student?.group_id;
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'logros', label: 'Logros', icon: Trophy },
    ...(hasGroup ? [
      { id: 'tasks', label: `Tareas${pendingAssignments.length > 0 ? ` (${pendingAssignments.length})` : ''}`, icon: ClipboardList },
      { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    ] : []),
    { id: 'apps', label: 'Apps', icon: Gamepad2 },
    { id: 'history', label: 'Historial', icon: CalendarDays },
    { id: 'feedback', label: 'Comentarios', icon: MessageSquare },
    { id: 'profile', label: 'Perfil', icon: Star },
  ];

  const groupLevel = student?.group_level;
  const groupGrade = student?.group_grade;
  const groupSubjectId = student?.group_subject_id;
  const exploreAppsPath = (groupLevel && groupGrade)
    ? (groupSubjectId
        ? `/curso/${groupLevel}/${groupGrade}/${groupSubjectId}`
        : `/curso/${groupLevel}/${groupGrade}`)
    : null;

  return (
    <div>
      <Header subtitle="Mi Panel" />
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-6 max-w-5xl">

          {/* Header del alumno */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-6"
          >
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              <div className="text-5xl shrink-0">{studentInfo.avatar_emoji || '🎓'}</div>
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-slate-800">{studentInfo.display_name}</h1>
                <p className="text-sm text-slate-500">@{studentInfo.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    student?.group_id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {student?.group_id ? student?.group_name || studentInfo.group_name : 'Practica libre'}
                  </span>
                  {student?.email_verified && (
                    <button onClick={() => setActiveTab('profile')}
                      className="text-[10px] text-slate-400 hover:text-indigo-600 transition-colors underline">
                      Cambiar
                    </button>
                  )}
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2 shrink-0">
                {exploreAppsPath && (
                  <button
                    onClick={() => navigate(exploreAppsPath)}
                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl text-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    title="Ir a las apps de tu asignatura"
                  >
                    <Compass className="w-6 h-6" />
                    Explorar Apps
                  </button>
                )}
                <button
                  onClick={() => navigate('/quiz-battle/join')}
                  className="flex items-center gap-2 px-4 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl text-sm font-bold hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  title="Unirse a un Batalla"
                >
                  <Zap className="w-5 h-5" />
                  Quiz
                </button>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-6 text-center shrink-0">
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{gamification.level}</p>
                  <p className="text-xs text-slate-500">Nivel</p>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 mx-auto">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                      style={{ width: `${gamification.xpForNextLevel > gamification.xpForCurrentLevel ? Math.min(100, Math.round(((gamification.totalXp - gamification.xpForCurrentLevel) / (gamification.xpForNextLevel - gamification.xpForCurrentLevel)) * 100)) : 100}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.days_active || 0}</p>
                  <p className="text-xs text-slate-500">Dias activo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.apps_played || 0}</p>
                  <p className="text-xs text-slate-500">Apps jugadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.total_sessions || 0}</p>
                  <p className="text-xs text-slate-500">Partidas</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-100 shadow-sm overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Resumen ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Gamepad2} label="Total partidas" value={stats.total_sessions || 0}
                  subValue={`${stats.practice_sessions || 0} practica / ${stats.test_sessions || 0} examen`}
                  color="bg-blue-500" delay={0} />
                <StatCard icon={Clock} label="Tiempo total" value={formatTime(stats.total_time_seconds)}
                  subValue={`Sesion mas larga: ${formatTime(stats.longest_session_seconds)}`}
                  color="bg-purple-500" delay={0.05} />
                <StatCard icon={Target} label="Precision global" value={`${stats.avg_accuracy || 0}%`}
                  subValue={`${stats.total_correct || 0} de ${stats.total_questions || 0} aciertos`}
                  color="bg-green-500" delay={0.1} />
                <StatCard icon={Trophy} label="Mejor nota" value={`${stats.best_nota ?? stats.best_score ?? 0}/10`}
                  subValue={`Media examen: ${stats.avg_test_nota ?? '-'}/10`}
                  color="bg-amber-500" delay={0.15} />
              </div>

              {/* Batalla stats */}
              {qbStats && qbStats.total_played > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 shadow-sm"
                >
                  <h3 className="text-base font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Batalla
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-amber-600 font-medium">Partidas</p>
                      <p className="text-2xl font-bold text-amber-900">{qbStats.total_played}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Victorias
                      </p>
                      <p className="text-2xl font-bold text-amber-900">{qbStats.total_wins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-medium">Podio (Top 3)</p>
                      <p className="text-2xl font-bold text-amber-900">{qbStats.total_podium}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 font-medium">Precision</p>
                      <p className="text-2xl font-bold text-amber-900">{qbStats.avg_accuracy}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-amber-200">
                    <div>
                      <p className="text-xs text-amber-600">Puesto medio</p>
                      <p className="text-lg font-bold text-amber-900">#{qbStats.avg_rank}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Mejor punt.</p>
                      <p className="text-lg font-bold text-amber-900">{qbStats.best_score}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">Media punt.</p>
                      <p className="text-lg font-bold text-amber-900">{qbStats.avg_score}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actividad diaria */}
              {daily.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Actividad (30 dias)
                  </h3>
                  <ActivityChart data={daily} />
                </motion.div>
              )}

              {/* Por asignatura */}
              {subjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Por asignatura
                  </h3>
                  <SubjectStats data={subjects} />
                </motion.div>
              )}

              {/* Top 5 apps */}
              {apps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Tus apps mas jugadas
                  </h3>
                  <div className="space-y-3">
                    {apps.slice(0, 5).map((app, i) => (
                      <div key={app.app_id} className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                          i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-slate-300'
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{app.app_name}</p>
                          <p className="text-xs text-slate-400">{app.total_plays} partidas &middot; Precision: {app.accuracy}%</p>
                        </div>
                        <div className="text-right">
                          <NotaBadge value={app.best_nota ?? app.best_score} />
                          <p className="text-xs text-slate-400 mt-0.5">mejor nota</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ── TAB: Tareas ── */}
          {activeTab === 'tasks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {/* Filtros */}
              {assignments.length > 0 && (
                <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm">
                  {[
                    { id: 'all', label: `Todas (${assignments.length})` },
                    { id: 'pending', label: `Pendientes (${assignments.filter(a => !a.completed).length})` },
                    { id: 'completed', label: `Completadas (${assignments.filter(a => a.completed).length})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setTaskFilter(f.id)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        taskFilter === f.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              {assignments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center text-slate-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No tienes tareas asignadas</p>
                </div>
              ) : (
                assignments
                  .filter(asg => taskFilter === 'all' ? true : taskFilter === 'completed' ? asg.completed : !asg.completed)
                  .map((asg) => {
                  const isOverdue = asg.due_date && new Date(asg.due_date) < new Date() && !asg.completed;
                  const canNavigate = asg.app_id && asg.level && asg.grade && asg.subject_id;
                  const appUrl = canNavigate
                    ? `/curso/${asg.level}/${asg.grade}/${asg.subject_id}/app/${asg.app_id}`
                    : null;
                  return (
                    <div
                      key={asg.id}
                      onClick={() => appUrl && navigate(appUrl)}
                      className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                        asg.completed ? 'border-green-200' : isOverdue ? 'border-amber-200' : 'border-slate-100'
                      } ${appUrl ? 'cursor-pointer hover:shadow-md hover:border-purple-200' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          asg.completed ? 'bg-green-100' : isOverdue ? 'bg-amber-100' : 'bg-slate-100'
                        }`}>
                          {asg.completed
                            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                            : isOverdue
                              ? <AlertTriangle className="w-5 h-5 text-amber-600" />
                              : <Circle className="w-5 h-5 text-slate-400" />
                          }
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${asg.completed ? 'text-green-700' : 'text-slate-800'}`}>
                            {asg.title || asg.app_name}
                          </p>
                          {asg.title && <p className="text-sm text-slate-500">{asg.app_name}</p>}
                          {asg.description && <p className="text-sm text-slate-400 mt-1 italic">{asg.description}</p>}

                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>Nota minima: <strong className="text-slate-600">{asg.min_score}/10</strong> en examen</span>
                            {asg.due_date && (
                              <span className={isOverdue ? 'text-amber-600 font-medium' : ''}>
                                Fecha limite: {new Date(asg.due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>

                          {/* Progreso del alumno */}
                          <div className="mt-2 flex items-center gap-3 text-sm">
                            {asg.completed ? (
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Completada - Tu mejor nota: {asg.best_nota ?? asg.best_score}/10
                              </span>
                            ) : (
                              <span className="text-slate-500">
                                {asg.attempts > 0
                                  ? `${asg.attempts} intento${asg.attempts !== 1 ? 's' : ''} - Mejor nota: ${asg.best_nota ?? asg.best_score ?? 0}/10 (necesitas ${asg.min_score}/10)`
                                  : 'Aun no has intentado esta tarea'
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Boton jugar */}
                        {appUrl && (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            asg.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md'
                          }`}>
                            <Play className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ── TAB: Mensajes ── */}
          {activeTab === 'messages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <StudentChatTab />
            </motion.div>
          )}

          {/* ── TAB: Apps ── */}
          {activeTab === 'apps' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-500" />
                Detalle por app ({apps.length})
              </h3>
              <AppsDetail apps={apps} />
            </motion.div>
          )}

          {/* ── TAB: Historial ── */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-green-500" />
                Ultimas partidas
              </h3>
              {recent.length > 0 ? (
                <RecentSessions sessions={recent} />
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>No hay partidas registradas</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB: Logros ── */}
          {activeTab === 'logros' && (
            <StudentLogrosTab gamification={gamification} />
          )}

          {/* ── TAB: Comentarios ── */}
          {activeTab === 'feedback' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <MyFeedbacksSection />
            </motion.div>
          )}

          {/* ── TAB: Perfil ── */}
          {activeTab === 'profile' && (
            <StudentProfileEditor
              student={student}
              studentInfo={studentInfo}
              onProfileUpdated={fetchDashboard}
            />
          )}

        </div>
      </div>
    </div>
  );
}
