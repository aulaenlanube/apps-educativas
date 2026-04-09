import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsDown, Send, MessageSquarePlus, Check, CheckCircle2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';

/**
 * Modal centrado que pide valorar la app tras completar una partida.
 * Muestra estrellas + botones de dificultad directamente.
 * - Cada 5 partidas (5, 10, 15...) mientras no haya valorado.
 * - No se cierra pulsando fuera.
 * - La dificultad seleccionada persiste entre aperturas.
 */
export default function RatingPromptModal({ appId, appName, level, grade, subjectId, completedCount }) {
  const { user, student, role, displayName, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ratingSaved, setRatingSaved] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [difficultySaved, setDifficultySaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Feedback (paso 2, opcional)
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const getUserInfo = useCallback(() => {
    if ((role === 'teacher' || role === 'admin') && user) return { type: 'teacher', id: user.id };
    if (role === 'free' && user) return { type: 'free', id: user.id };
    if (role === 'student' && student) return { type: 'student', id: student.id };
    return null;
  }, [role, user, student]);

  // Comprobar si el usuario ya ha valorado esta app
  useEffect(() => {
    if (!isAuthenticated || !appId) return;
    const userInfo = getUserInfo();
    if (!userInfo) return;

    (async () => {
      const { data } = await supabase.rpc('get_user_rating', {
        p_user_type: userInfo.type, p_user_id: userInfo.id,
        p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
      });
      if (data?.rating) {
        setHasRated(true);
        setRating(data.rating);
      }

      const { data: diffData } = await supabase.rpc('get_user_difficulty', {
        p_user_type: userInfo.type, p_user_id: userInfo.id,
        p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
      });
      if (diffData?.difficulty) setDifficulty(diffData.difficulty);
    })();
  }, [isAuthenticated, appId, level, grade, subjectId, getUserInfo]);

  // Decidir si mostrar el modal
  useEffect(() => {
    if (!isAuthenticated || hasRated || completedCount === 0) return;
    if (completedCount > 0 && completedCount % 5 === 0) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [completedCount, isAuthenticated, hasRated]);

  const handleRate = async (newRating) => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    setRating(newRating);
    setSaving(true);

    await supabase.rpc('upsert_app_rating', {
      p_user_type: userInfo.type, p_user_id: userInfo.id,
      p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
      p_rating: newRating,
    });

    setSaving(false);
    setRatingSaved(true);
    setHasRated(true);
    setTimeout(() => setRatingSaved(false), 2000);
  };

  const handleDeleteRatingConfirmed = async () => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    setDeleting(true);
    await supabase.rpc('delete_app_rating', {
      p_user_type: userInfo.type, p_user_id: userInfo.id,
      p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
    });
    setRating(0);
    setHasRated(false);
    setRatingSaved(false);
    setDifficulty(null);
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleDifficulty = async (value) => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    const prev = difficulty;
    const newVal = value === prev ? null : value;
    setDifficulty(newVal);
    if (!newVal) return;

    const labels = { easy: 'Demasiado facil para el nivel', ok: 'Dificultad adecuada para el nivel', hard: 'Demasiado dificil para el nivel' };
    await supabase.rpc('create_feedback', {
      p_user_type: userInfo.type,
      p_user_id: userInfo.id,
      p_user_display_name: displayName || 'Usuario',
      p_app_id: appId, p_app_name: appName,
      p_level: level, p_grade: grade, p_subject_id: subjectId,
      p_message: `[${labels[newVal]}]`,
    });
    setDifficultySaved(true);
    setTimeout(() => setDifficultySaved(false), 2000);
  };

  const handleSendFeedback = async () => {
    const userInfo = getUserInfo();
    if (!userInfo || !feedbackMsg.trim()) return;

    setFeedbackLoading(true);
    await supabase.rpc('create_feedback', {
      p_user_type: userInfo.type, p_user_id: userInfo.id,
      p_user_display_name: displayName || 'Usuario',
      p_app_id: appId, p_app_name: appName,
      p_level: level, p_grade: grade, p_subject_id: subjectId,
      p_message: feedbackMsg.trim(),
    });
    setFeedbackLoading(false);
    setFeedbackSent(true);
  };

  const handleClose = () => {
    setVisible(false);
    // NO resetear difficulty - persiste entre aperturas
    setShowFeedback(false);
    setFeedbackMsg('');
    setFeedbackSent(false);
  };

  if (!visible && !showDeleteConfirm) return null;

  return (
    <>
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 pt-6 pb-8 text-center relative">
              <button onClick={handleClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Star className="w-7 h-7 text-yellow-300 fill-yellow-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Valora esta app</h3>
              <p className="text-sm text-white/80 mt-1 truncate">{appName}</p>
            </div>

            {/* Content */}
            <div className="px-6 py-5 -mt-4 bg-white rounded-t-3xl relative">
              {!showFeedback && !feedbackSent ? (
                /* ── Vista principal: estrellas + dificultad ── */
                <div className="space-y-5">
                  {/* Estrellas */}
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-3">Tu opinion nos ayuda a mejorar</p>
                    <div className="flex justify-center">
                      <StarRating value={rating} onChange={handleRate} size="lg" />
                    </div>
                    {saving && <p className="text-xs text-slate-400 mt-2 animate-pulse">Guardando...</p>}
                    {ratingSaved && (
                      <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valoracion guardada
                      </motion.p>
                    )}
                    {rating > 0 && !saving && (
                      <button onClick={() => setShowDeleteConfirm(true)}
                        className="text-[11px] text-slate-400 hover:text-red-500 mt-2 flex items-center justify-center gap-1 transition-colors mx-auto">
                        <Trash2 className="w-3 h-3" /> Eliminar valoracion
                      </button>
                    )}
                  </div>

                  {/* Dificultad */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Es adecuada para el nivel?</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'easy', label: 'Muy facil', active: 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' },
                        { id: 'ok', label: 'Adecuada', active: 'bg-green-100 text-green-700 ring-2 ring-green-300' },
                        { id: 'hard', label: 'Muy dificil', active: 'bg-red-100 text-red-700 ring-2 ring-red-300' },
                      ].map(opt => (
                        <button key={opt.id} onClick={() => handleDifficulty(opt.id)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
                            difficulty === opt.id ? opt.active : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}>
                          {opt.id === 'easy' && <ThumbsDown className="w-3.5 h-3.5" />}
                          {opt.id === 'ok' && <Check className="w-3.5 h-3.5" />}
                          {opt.id === 'hard' && <ThumbsDown className="w-3.5 h-3.5 rotate-180" />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {difficultySaved && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-green-600 mt-1.5 text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Enviado
                      </motion.p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => setShowFeedback(true)}
                      className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors font-medium">
                      <MessageSquarePlus className="w-4 h-4" />
                      Dejar comentario
                    </button>
                    <button onClick={handleClose}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-2 px-4">
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : !feedbackSent ? (
                /* ── Formulario de comentario ── */
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Comentario adicional</p>
                    <textarea
                      value={feedbackMsg}
                      onChange={e => setFeedbackMsg(e.target.value)}
                      placeholder="Cuentanos como mejorar esta app..."
                      className="w-full h-20 p-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                      maxLength={500}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSendFeedback}
                      disabled={feedbackLoading || !feedbackMsg.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40">
                      <Send className="w-3.5 h-3.5" />
                      {feedbackLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                    <button onClick={() => setShowFeedback(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                      Volver
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Confirmacion ── */
                <div className="text-center space-y-3 py-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">💬</span>
                  </motion.div>
                  <p className="text-sm font-semibold text-slate-700">Comentario enviado!</p>
                  <p className="text-xs text-slate-400">Gracias por ayudarnos a mejorar</p>
                  <button onClick={handleClose}
                    className="mt-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all">
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {showDeleteConfirm && (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Eliminar valoracion</h3>
          </div>
          <p className="text-sm text-slate-600 mb-1">
            Se eliminara tu valoracion de <strong>{appName}</strong> y todos los comentarios que hayas enviado sobre esta app en este curso y asignatura.
          </p>
          <p className="text-xs text-slate-400 mb-4">Esta accion no se puede deshacer.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button onClick={handleDeleteRatingConfirmed} disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
