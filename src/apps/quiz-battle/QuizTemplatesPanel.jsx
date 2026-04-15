import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Trash2, Edit3, Clock, AlertTriangle,
  Trophy, Users, Zap, BarChart3, Crown, Target, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import QuizTemplateEditor from './QuizTemplateEditor';
import QuizBattleDetailModal from './QuizBattleDetailModal';
import { Eye } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function QuizTemplatesPanel() {
  const { teacher } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [detailRoomCode, setDetailRoomCode] = useState(null);

  // Stats & history
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quota, setQuota] = useState(null);

  const fetchTemplates = useCallback(async () => {
    if (!teacher?.id) return;
    setLoading(true);
    const { data } = await supabase.rpc('get_teacher_quiz_templates', {
      p_teacher_id: teacher.id,
    });
    setTemplates(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [teacher?.id]);

  const fetchStats = useCallback(async () => {
    if (!teacher?.id) return;
    setHistoryLoading(true);

    const [statsRes, histRes, quotaRes] = await Promise.all([
      supabase.rpc('get_teacher_quiz_battle_stats', { p_teacher_id: teacher.id }),
      supabase
        .from('quiz_battle_sessions')
        .select('room_code, created_at, player_count, total_questions, level, grade, subject_id, time_per_question')
        .eq('user_id', teacher.id)
        .eq('user_type', 'host')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.rpc('get_teacher_quiz_battle_quota', { p_teacher_id: teacher.id }),
    ]);

    if (statsRes.data && !statsRes.data.error) setStats(statsRes.data);
    if (histRes.data) setHistory(histRes.data);
    if (quotaRes.data && !quotaRes.data.error) setQuota(quotaRes.data);
    setHistoryLoading(false);
  }, [teacher?.id]);

  useEffect(() => { fetchTemplates(); fetchStats(); }, [fetchTemplates, fetchStats]);

  const handleDelete = async (id) => {
    const { data } = await supabase.rpc('delete_quiz_template', {
      p_template_id: id,
      p_teacher_id: teacher.id,
    });
    if (data?.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({ title: 'Batalla eliminada' });
    }
    setDeleteConfirm(null);
  };

  const handleSaved = () => {
    setEditingId(null);
    fetchTemplates();
  };

  // ── Editor view ──
  if (editingId !== null) {
    return (
      <QuizTemplateEditor
        templateId={editingId === 'new' ? null : editingId}
        onBack={() => setEditingId(null)}
        onSaved={handleSaved}
      />
    );
  }

  // ── List view ──
  return (
    <div className="space-y-6">
      {/* ═══ Stats summary ═══ */}
      {!historyLoading && stats && stats.total_hosted > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-lg"
        >
          <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Resumen de tus Batallas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-black">{stats.total_hosted}</p>
              <p className="text-xs text-white/60">Batallas creadas</p>
            </div>
            <div>
              <p className="text-2xl font-black">{stats.total_players_served}</p>
              <p className="text-xs text-white/60">Jugadores totales</p>
            </div>
            <div>
              <p className="text-2xl font-black">{stats.avg_players || 0}</p>
              <p className="text-xs text-white/60">Media de jugadores</p>
            </div>
            <div>
              <p className="text-2xl font-black">{stats.subjects_used}</p>
              <p className="text-xs text-white/60">Asignaturas usadas</p>
            </div>
          </div>

          {/* Quota bar */}
          {quota && (
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/70">Cuota mensual</span>
                <span className="font-bold">{quota.used} / {quota.quota} usadas</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (quota.used / Math.max(quota.quota, 1)) * 100)}%`,
                    background: quota.remaining > 2 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                      quota.remaining > 0 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  }}
                />
              </div>
              <p className="text-[10px] text-white/50 mt-1">
                {quota.remaining > 0
                  ? `${quota.remaining} batalla${quota.remaining !== 1 ? 's' : ''} disponible${quota.remaining !== 1 ? 's' : ''} este mes`
                  : 'Limite mensual alcanzado'}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ Templates section ═══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Batallas disponibles
          </h2>
          <button
            onClick={() => setEditingId('new')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Batalla
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No tienes batallas creadas</p>
            <p className="text-slate-400 text-xs mt-1">Crea una batalla para elegir exactamente las preguntas que quieres usar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{t.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{t.question_count} preguntas</span>
                    {t.description && <span className="truncate">· {t.description}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(t.updated_at).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingId(t.id)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Battle history ═══ */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-purple-500" />
          Historial de partidas
        </h2>

        {historyLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Aun no has jugado ninguna batalla</p>
            <p className="text-slate-400 text-xs mt-1">Pulsa "Iniciar Batalla" para empezar tu primera partida</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Codigo</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Curso</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-center">
                      <Users className="w-3.5 h-3.5 inline" /> Jugadores
                    </th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-center">
                      <Target className="w-3.5 h-3.5 inline" /> Preguntas
                    </th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-center">
                      <Clock className="w-3.5 h-3.5 inline" /> Tiempo/preg.
                    </th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 inline" /> Fecha
                    </th>
                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((h, i) => (
                    <tr key={`${h.room_code}-${i}`} className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setDetailRoomCode(h.room_code)}>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs">
                          {h.room_code}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-xs">
                        {h.level && h.grade
                          ? `${h.level === 'primaria' ? 'Prim' : 'ESO'} ${h.grade}`
                          : '-'}
                        {h.subject_id && <span className="text-slate-400 ml-1">· {h.subject_id}</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3" /> {h.player_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-600 font-medium">
                        {h.total_questions || 0}
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-500">
                        {h.time_per_question ? `${h.time_per_question}s` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-400">
                        {formatDate(h.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetailRoomCode(h.room_code); }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Battle detail modal */}
      {detailRoomCode && (
        <QuizBattleDetailModal
          roomCode={detailRoomCode}
          onClose={() => setDetailRoomCode(null)}
        />
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Eliminar batalla</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Esta accion no se puede deshacer. Se eliminara la batalla y todas sus preguntas.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
