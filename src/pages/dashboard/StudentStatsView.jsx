import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Gamepad2, Clock, Target, Trophy, CalendarDays,
  ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

function formatTime(seconds) {
  if (!seconds || seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

export default function StudentStatsView({ studentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data: result } = await supabase.rpc('teacher_get_student_stats', {
        p_student_id: studentId,
      });
      if (result && !result.error) setData(result);
      setLoading(false);
    }
    fetch();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No se pudieron cargar los datos</p>
        <Button variant="outline" onClick={onBack} className="mt-4">Volver</Button>
      </div>
    );
  }

  const { student, stats, apps_detail: apps, recent_sessions: recent } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{student.avatar_emoji || '🎓'}</span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{student.display_name}</h2>
            <p className="text-sm text-slate-500">@{student.username} &middot; {student.group_name}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatMini icon={Gamepad2} label="Partidas" value={stats.total_sessions || 0}
          sub={`${stats.practice_sessions || 0} prac. / ${stats.test_sessions || 0} exam.`} color="bg-blue-500" />
        <StatMini icon={Clock} label="Tiempo" value={formatTime(stats.total_time_seconds)}
          sub={`${stats.days_active || 0} dias activo`} color="bg-purple-500" />
        <StatMini icon={Target} label="Precision" value={`${stats.avg_accuracy || 0}%`}
          sub={`${stats.total_correct || 0}/${stats.total_questions || 0}`} color="bg-green-500" />
        <StatMini icon={Trophy} label="Mejor punt." value={stats.best_score || 0}
          sub={`Media exam.: ${stats.avg_test_score || 0}`} color="bg-amber-500" />
      </div>

      {/* Apps detail */}
      {apps && apps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-100 shadow-sm mb-6"
        >
          <div className="p-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Apps ({apps.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">App</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Partidas</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Precision</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Mejor</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Media exam.</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Tiempo</th>
                  <th className="px-4 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {apps.map((app) => (
                  <React.Fragment key={app.app_id}>
                    <tr
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedApp(expandedApp === app.app_id ? null : app.app_id)}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-700">{app.app_name}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600">
                        {app.total_plays}
                        <span className="text-xs text-slate-400 ml-1">({app.test_plays} exam.)</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          app.accuracy >= 80 ? 'bg-green-100 text-green-700'
                          : app.accuracy >= 50 ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }`}>{app.accuracy}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-amber-600">{app.best_score}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600">{app.avg_test_score}</td>
                      <td className="px-4 py-2.5 text-center text-slate-500">{formatTime(app.total_time_seconds)}</td>
                      <td className="px-4 py-2.5">
                        {expandedApp === app.app_id
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </td>
                    </tr>
                    {expandedApp === app.app_id && (
                      <tr>
                        <td colSpan={7}>
                          <div className="bg-slate-50 px-4 py-3 grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-slate-400">Media practica</p>
                              <p className="font-bold text-slate-700">{app.avg_score}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Mejor exam.</p>
                              <p className="font-bold text-amber-600">{app.best_test_score}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Ultima partida</p>
                              <p className="font-bold text-slate-700">{formatDateTime(app.last_played)}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Recent sessions */}
      {recent && recent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-100 shadow-sm"
        >
          <div className="p-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-green-500" />
              Ultimas partidas
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">App</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Modo</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Puntuacion</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500 text-center">Aciertos</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-500">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-700">{s.app_name}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.mode === 'test' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>{s.mode === 'test' ? 'Examen' : 'Practica'}</span>
                    </td>
                    <td className="px-4 py-2 text-center font-semibold">{s.score}{s.max_score > 0 ? `/${s.max_score}` : ''}</td>
                    <td className="px-4 py-2 text-center text-slate-500">
                      {s.total_questions > 0 ? `${s.correct_answers}/${s.total_questions}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{formatDateTime(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {(!apps || apps.length === 0) && (!recent || recent.length === 0) && (
        <div className="text-center py-12 text-slate-400">
          <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Este alumno aun no tiene actividad registrada</p>
        </div>
      )}
    </div>
  );
}

function StatMini({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}
