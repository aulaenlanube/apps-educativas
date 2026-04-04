import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Target, Clock, Trophy, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

const UserDetail = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data: result } = await supabase.rpc('admin_get_user_sessions', {
      p_user_id: user.id,
      p_user_type: user.user_type,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });
    if (result && !result.error) setData(result);
    setLoading(false);
  }, [user.id, user.user_type, page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const stats = data?.stats;
  const sessions = data?.sessions || [];
  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const isTeacher = user.user_type === 'teacher';

  return (
    <div className="space-y-6">
      {/* User info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
            isTeacher ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {isTeacher ? (user.display_name?.[0]?.toUpperCase() || '?') : (user.avatar_emoji || '🎓')}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user.display_name}</h2>
            <div className="text-sm text-slate-500">
              {isTeacher
                ? `${user.email} · Codigo: ${user.teacher_code}`
                : `@${user.username} · ${user.group_name} · Prof: ${user.teacher_name}`
              }
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                isTeacher ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {isTeacher ? (user.role === 'admin' ? 'ADMIN' : 'DOCENTE') : 'ALUMNO'}
              </span>
              <span className="text-xs text-slate-400">
                Registrado: {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Partidas', value: stats.total_sessions, icon: Gamepad2, color: 'text-indigo-600' },
            { label: 'Precision', value: `${stats.avg_accuracy}%`, icon: Target, color: 'text-green-600' },
            { label: 'Tiempo total', value: `${stats.total_time_minutes}m`, icon: Clock, color: 'text-orange-600' },
            { label: 'Apps jugadas', value: stats.apps_played, icon: Star, color: 'text-purple-600' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <Icon className={`w-5 h-5 ${card.color} mb-2`} />
                <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                <div className="text-xs text-slate-500">{card.label}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {stats?.favorite_app && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              App favorita: <strong>{stats.favorite_app}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Sessions table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Historial de partidas</h3>
          <span className="text-xs text-slate-400">{data?.total || 0} total</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Sin partidas registradas</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">App</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">Curso</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">Modo</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">Puntuacion</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">Aciertos</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">Duracion</th>
                    <th className="px-4 py-2 text-xs font-medium text-slate-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-700">{s.app_name}</td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {s.level && s.grade ? `${s.level} ${s.grade}` : '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          s.mode === 'test' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {s.mode === 'test' ? 'Test' : 'Practica'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{s.score}</td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {s.total_questions > 0 ? `${s.correct_answers}/${s.total_questions}` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {s.duration_seconds ? `${Math.round(s.duration_seconds / 60)}m` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-slate-400">
                  Pagina {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
