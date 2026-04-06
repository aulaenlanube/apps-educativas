import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Clock, Target, Trophy, Flame, BarChart3,
  TrendingUp, Star, Rocket, Play
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import MyFeedbacksSection from '@/components/ui/MyFeedbacksSection';
import TeacherLogrosSection from './TeacherLogrosSection';

const FreeUserDashboard = () => {
  const { user, freeUser, displayName } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadStats = async () => {
      setLoading(true);

      // Obtener sesiones del usuario
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (sessions) {
        const completed = sessions.filter(s => s.completed);
        const totalTime = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
        const avgScore = completed.length > 0
          ? completed.reduce((acc, s) => acc + (s.score || 0), 0) / completed.length
          : 0;

        const subjects = new Set(sessions.map(s => s.subject_id).filter(Boolean));
        const apps = new Set(sessions.map(s => s.app_id).filter(Boolean));

        setStats({
          totalSessions: sessions.length,
          completedSessions: completed.length,
          totalMinutes: Math.round(totalTime / 60),
          avgScore: avgScore.toFixed(1),
          uniqueSubjects: subjects.size,
          uniqueApps: apps.size,
        });

        setRecentSessions(sessions.slice(0, 10));
      }

      setLoading(false);
    };

    loadStats();
  }, [user?.id]);

  const statCards = stats ? [
    { icon: Gamepad2, label: 'Partidas', value: stats.totalSessions, color: 'from-blue-500 to-blue-600' },
    { icon: Trophy, label: 'Completadas', value: stats.completedSessions, color: 'from-green-500 to-green-600' },
    { icon: Clock, label: 'Minutos', value: stats.totalMinutes, color: 'from-purple-500 to-purple-600' },
    { icon: Star, label: 'Nota media', value: stats.avgScore, color: 'from-amber-500 to-amber-600' },
    { icon: BarChart3, label: 'Materias', value: stats.uniqueSubjects, color: 'from-pink-500 to-pink-600' },
    { icon: Target, label: 'Apps usadas', value: stats.uniqueApps, color: 'from-cyan-500 to-cyan-600' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-pink-100 px-6 py-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-800">Hola, {displayName}!</h1>
              <p className="text-sm text-gray-500">Tu zona de practica libre</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-4 text-center"
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6 text-center mb-8"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-2">Sigue practicando</h2>
              <p className="text-sm text-gray-500 mb-4">
                Elige un curso y una asignatura para empezar a jugar. Todo tu progreso se guarda automaticamente.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Ir a jugar
              </Button>
            </motion.div>

            {/* Mis comentarios */}
            <div className="mb-8">
              <TeacherLogrosSection />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              <MyFeedbacksSection />
            </motion.div>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    Actividad reciente
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{s.app_name || s.app_id}</p>
                        <p className="text-xs text-gray-400">
                          {s.subject_id && <span className="capitalize">{s.subject_id} &middot; </span>}
                          {new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <div className="text-right">
                        {s.score != null && (
                          <span className={`text-sm font-bold ${s.score >= 7 ? 'text-green-600' : s.score >= 5 ? 'text-amber-600' : 'text-red-500'}`}>
                            {s.score.toFixed(1)}
                          </span>
                        )}
                        {s.completed ? (
                          <span className="block text-xs text-green-500">Completada</span>
                        ) : (
                          <span className="block text-xs text-gray-400">Abandonada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FreeUserDashboard;
