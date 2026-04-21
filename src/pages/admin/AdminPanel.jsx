import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Users2, Gamepad2, BarChart3, MessageSquare, ArrowLeft, RefreshCw, Database, Zap, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import UsersTable from './UsersTable';
import UserDetail from './UserDetail';
import GlobalStats from './GlobalStats';
import FeedbackPanel from './FeedbackPanel';
import DataExplorer from './DataExplorer';
import XPConfigPanel from './XPConfigPanel';
import AppsModeReport from './AppsModeReport';
import GroupsPanel from './GroupsPanel';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc('admin_get_global_stats');
    if (data && !data.error) setGlobalStats(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'groups', label: 'Grupos', icon: Users2 },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'stats', label: 'Estadisticas', icon: Gamepad2 },
    { id: 'data', label: 'Datos', icon: Database },
    { id: 'xp', label: 'Experiencia', icon: Zap },
    { id: 'apps', label: 'Apps', icon: ListChecks },
  ];

  if (selectedUser) {
    return (
      <div>
        <Header subtitle="Panel Admin" />
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a usuarios
            </button>
            <UserDetail user={selectedUser} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header subtitle="Panel Admin" />
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Panel de Administracion</h1>
                <p className="text-sm text-slate-500">Bienvenido, {teacher?.display_name}</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 mb-6 border border-slate-200 w-fit">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab stats={globalStats} />}
              {activeTab === 'users' && (
                <UsersTable onSelectUser={setSelectedUser} />
              )}
              {activeTab === 'groups' && <GroupsPanel />}
              {activeTab === 'feedback' && <FeedbackPanel />}
              {activeTab === 'stats' && <GlobalStats stats={globalStats} />}
              {activeTab === 'data' && <DataExplorer />}
              {activeTab === 'xp' && <XPConfigPanel />}
              {activeTab === 'apps' && <AppsModeReport />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function OverviewTab({ stats }) {
  if (!stats) return null;

  const mainCards = [
    { label: 'Docentes', value: stats.total_teachers, icon: '👨‍🏫' },
    { label: 'Libres', value: stats.total_free ?? 0, icon: '🚀' },
    { label: 'Alumnos', value: stats.total_students, icon: '🎓' },
    { label: 'Grupos', value: stats.total_groups, icon: '👥' },
    { label: 'Partidas totales', value: stats.total_sessions, icon: '🎮' },
    { label: 'Partidas hoy', value: stats.sessions_today, icon: '📅' },
  ];

  const detailCards = [
    { label: 'Completadas', value: stats.completed_sessions, icon: '✅' },
    { label: 'Abandonadas', value: stats.abandoned_sessions, icon: '🚪' },
    { label: 'Anonimas', value: stats.anonymous_sessions, icon: '👤' },
    { label: 'Tasa abandono', value: `${stats.abandonment_rate ?? 0}%`, icon: '📉' },
    { label: 'Duracion media', value: stats.avg_duration_seconds ? `${Math.round(stats.avg_duration_seconds / 60)}m` : '0m', icon: '⏱️' },
    { label: 'Este mes', value: stats.sessions_this_month, icon: '📆' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mainCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold text-slate-800">{card.value ?? 0}</div>
            <div className="text-xs text-slate-500 font-medium">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {detailCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold text-slate-800">{card.value ?? 0}</div>
            <div className="text-xs text-slate-500 font-medium">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Top apps */}
      {stats.top_apps && stats.top_apps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Apps mas populares</h3>
          <div className="space-y-3">
            {stats.top_apps.slice(0, 8).map((app, i) => {
              const maxCount = stats.top_apps[0]?.play_count || 1;
              const abandonRate = app.play_count > 0
                ? Math.round((app.abandoned_count || 0) / app.play_count * 100)
                : 0;
              return (
                <div key={app.app_id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400 w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{app.app_name}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{app.play_count} partidas</span>
                        <span className="text-green-600">{app.completed_count || 0} completadas</span>
                        {abandonRate > 0 && <span className="text-amber-600">{abandonRate}% abandono</span>}
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(app.play_count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent activity chart */}
      {stats.recent_activity && stats.recent_activity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad ultimos 30 dias</h3>
          <div className="flex items-end gap-1 h-32">
            {stats.recent_activity.map((day, i) => {
              const maxCount = Math.max(...stats.recent_activity.map(d => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className="hidden group-hover:block absolute -mt-8 bg-slate-800 text-white text-xs px-2 py-1 rounded">
                    {day.count}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t transition-all duration-300 min-h-[2px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${new Date(day.day).toLocaleDateString('es-ES')}: ${day.count} partidas`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">Hace 30 dias</span>
            <span className="text-xs text-slate-400">Hoy</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AdminPanel;
