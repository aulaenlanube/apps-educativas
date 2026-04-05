import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, TrendingUp } from 'lucide-react';

const GlobalStats = ({ stats }) => {
  if (!stats) return null;

  const topApps = stats.top_apps || [];
  const byLevel = stats.sessions_by_level || [];
  const byGrade = stats.sessions_by_grade || [];
  const recentActivity = stats.recent_activity || [];

  return (
    <div className="space-y-6">
      {/* Sessions by level */}
      {byLevel.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Partidas por nivel
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {byLevel.map(l => (
              <div key={l.level} className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-slate-800">{l.count}</div>
                <div className="text-sm text-slate-500 font-medium capitalize">{l.level}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sessions by grade */}
      {byGrade.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Partidas por curso</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {byGrade.map(g => (
              <div key={`${g.level}-${g.grade}`} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-slate-800">{g.count}</div>
                <div className="text-xs text-slate-500 capitalize">{g.level} {g.grade}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All apps ranking */}
      {topApps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-600" />
            Ranking de apps ({topApps.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">#</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">App</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">Partidas</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">Nota media</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">Popularidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topApps.map((app, i) => {
                  const maxCount = topApps[0]?.play_count || 1;
                  return (
                    <tr key={app.app_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{app.app_name}</td>
                      <td className="px-4 py-2.5 text-slate-600">{app.play_count}</td>
                      <td className="px-4 py-2.5 text-slate-600">{app.avg_nota != null ? `${app.avg_nota}/10` : '-'}</td>
                      <td className="px-4 py-2.5 w-40">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${(app.play_count / maxCount) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Activity chart */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Actividad diaria (30 dias)</h3>
          <div className="flex items-end gap-1 h-40">
            {recentActivity.map((day, i) => {
              const maxCount = Math.max(...recentActivity.map(d => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              const date = new Date(day.day);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div className="hidden group-hover:block absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}: {day.count}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all duration-300 min-h-[2px] ${
                      isWeekend
                        ? 'bg-gradient-to-t from-purple-400 to-purple-300'
                        : 'bg-gradient-to-t from-indigo-500 to-indigo-300'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">Hace 30 dias</span>
            <span className="text-xs text-slate-400">Hoy</span>
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
              <span className="text-xs text-slate-500">Laborable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-400 rounded-sm" />
              <span className="text-xs text-slate-500">Fin de semana</span>
            </div>
          </div>
        </motion.div>
      )}

      {topApps.length === 0 && recentActivity.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay datos de actividad todavia</p>
          <p className="text-sm">Los datos aparecerán cuando los usuarios jueguen partidas</p>
        </div>
      )}
    </div>
  );
};

export default GlobalStats;
