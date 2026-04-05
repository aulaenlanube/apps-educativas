import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquarePlus, X, Send, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';

/**
 * Floating panel for rating an app and sending feedback.
 * Appears as a FAB button, expands into a panel.
 *
 * Props:
 *  - appId, appName, level, grade, subjectId: identifies the app version
 *  - variant: 'default' | 'retro' | 'fullscreen' (visual style matching app type)
 */
export default function AppRatingPanel({ appId, appName, level, grade, subjectId, variant = 'default' }) {
  const { user, student, role, displayName, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('rate'); // 'rate' | 'feedback' | 'myFeedbacks'

  // Rating state
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingSaved, setRatingSaved] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Feedback state
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // My feedbacks state
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const getUserInfo = useCallback(() => {
    if ((role === 'teacher' || role === 'admin') && user) return { type: 'teacher', id: user.id };
    if (role === 'free' && user) return { type: 'free', id: user.id };
    if (role === 'student' && student) return { type: 'student', id: student.id };
    return null;
  }, [role, user, student]);

  // Load average rating (always) and user's rating (if logged in)
  useEffect(() => {
    if (!open) return;

    const loadRatings = async () => {
      // Average
      const { data: avgData } = await supabase.rpc('get_app_avg_rating', {
        p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
      });
      if (avgData) {
        setAvgRating(avgData.avg_rating || 0);
        setTotalRatings(avgData.total_ratings || 0);
      }

      // User's rating
      const userInfo = getUserInfo();
      if (userInfo) {
        const { data: userData } = await supabase.rpc('get_user_rating', {
          p_user_type: userInfo.type, p_user_id: userInfo.id,
          p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
        });
        if (userData?.rating) setRating(userData.rating);
      }
    };

    loadRatings();
  }, [open, appId, level, grade, subjectId, getUserInfo]);

  // Load my feedbacks when that tab is selected
  useEffect(() => {
    if (!open || tab !== 'myFeedbacks') return;
    const userInfo = getUserInfo();
    if (!userInfo) return;

    const loadFeedbacks = async () => {
      const { data } = await supabase.rpc('get_user_feedbacks', {
        p_user_type: userInfo.type, p_user_id: userInfo.id,
      });
      if (data) setMyFeedbacks(data);
    };
    loadFeedbacks();
  }, [open, tab, getUserInfo]);

  const handleRatingChange = async (newRating) => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    setRating(newRating);
    setRatingLoading(true);
    setRatingSaved(false);

    await supabase.rpc('upsert_app_rating', {
      p_user_type: userInfo.type, p_user_id: userInfo.id,
      p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
      p_rating: newRating,
    });

    // Refresh average
    const { data: avgData } = await supabase.rpc('get_app_avg_rating', {
      p_app_id: appId, p_level: level, p_grade: grade, p_subject_id: subjectId,
    });
    if (avgData) {
      setAvgRating(avgData.avg_rating || 0);
      setTotalRatings(avgData.total_ratings || 0);
    }

    setRatingLoading(false);
    setRatingSaved(true);
    setTimeout(() => setRatingSaved(false), 2000);
  };

  const handleSendFeedback = async () => {
    if (!feedbackMsg.trim()) return;
    const userInfo = getUserInfo();
    if (!userInfo) return;

    setFeedbackLoading(true);
    await supabase.rpc('create_feedback', {
      p_user_type: userInfo.type,
      p_user_id: userInfo.id,
      p_user_display_name: displayName || 'Usuario',
      p_app_id: appId,
      p_app_name: appName,
      p_level: level,
      p_grade: grade,
      p_subject_id: subjectId,
      p_message: feedbackMsg.trim(),
    });

    setFeedbackLoading(false);
    setFeedbackSent(true);
    setFeedbackMsg('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const handleExpandFeedback = async (fb) => {
    if (expandedFeedback === fb.id) {
      setExpandedFeedback(null);
      setFeedbackMessages([]);
      return;
    }
    setExpandedFeedback(fb.id);
    setFeedbackMessages([]);
    const userInfo = getUserInfo();
    const { data } = await supabase.rpc('get_feedback_messages', {
      p_feedback_id: fb.id,
      p_user_id: userInfo?.id || null,
    });
    setFeedbackMessages(Array.isArray(data) ? data : []);
  };

  const handleReply = async (feedbackId) => {
    if (!replyMsg.trim()) return;
    const userInfo = getUserInfo();
    if (!userInfo) return;

    const msgText = replyMsg.trim();
    setReplyMsg('');
    setReplyLoading(true);

    await supabase.rpc('user_reply_feedback', {
      p_feedback_id: feedbackId,
      p_user_id: userInfo.id,
      p_user_name: displayName || 'Usuario',
      p_message: msgText,
    });

    // Refresh messages for this thread
    const { data } = await supabase.rpc('get_feedback_messages', {
      p_feedback_id: feedbackId,
      p_user_id: userInfo.id,
    });
    setFeedbackMessages(Array.isArray(data) ? data : []);
    setReplyLoading(false);
  };

  if (!isAuthenticated) return null;

  // FAB button styles
  const fabClass = variant === 'retro'
    ? 'bg-black border-2 border-green-500 text-green-400 hover:bg-green-900/50 hover:shadow-[0_0_15px_rgba(0,255,0,0.5)]'
    : variant === 'fullscreen'
      ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
      : 'bg-white shadow-lg border border-purple-200 text-purple-600 hover:bg-purple-50 hover:shadow-xl';

  return (
    <>
      {/* FAB Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all ${fabClass}`}
        title="Valorar esta app"
      >
        <Star className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 sm:max-h-[80vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4 text-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-bold text-sm">{appName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={Math.round(avgRating)} readOnly size="sm" />
                    <span className="text-xs text-purple-100">
                      {(avgRating / 2).toFixed(1)} ({totalRatings})
                    </span>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 shrink-0">
                {[
                  { id: 'rate', label: 'Valorar', icon: Star },
                  { id: 'feedback', label: 'Comentar', icon: MessageSquarePlus },
                  { id: 'myFeedbacks', label: 'Mis comentarios', icon: CheckCircle2 },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                      tab === t.id ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto flex-1">
                {tab === 'rate' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Tu valoracion:</p>
                      <StarRating
                        value={rating}
                        onChange={handleRatingChange}
                        size="lg"
                        showValue
                        className="justify-center"
                      />
                      {ratingLoading && (
                        <p className="text-xs text-gray-400 mt-2">Guardando...</p>
                      )}
                      {ratingSaved && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valoracion guardada
                        </motion.p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Media de la comunidad</p>
                      <div className="flex items-center justify-center gap-2">
                        <StarRating value={Math.round(avgRating)} readOnly size="md" />
                        <span className="text-lg font-bold text-amber-600">
                          {(avgRating / 2).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{totalRatings} valoracion{totalRatings !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                )}

                {tab === 'feedback' && (
                  <div className="space-y-3">
                    {feedbackSent ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                      >
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="font-semibold text-gray-800">Comentario enviado</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Lo revisara un administrador. Si responde, recibiras una notificacion.
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Cuentanos si encontraste algun error, si es demasiado facil o dificil para el nivel, o cualquier sugerencia de mejora.
                        </p>
                        <textarea
                          value={feedbackMsg}
                          onChange={(e) => setFeedbackMsg(e.target.value)}
                          placeholder="Escribe tu comentario aqui..."
                          rows={4}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                        />
                        <button
                          onClick={handleSendFeedback}
                          disabled={feedbackLoading || !feedbackMsg.trim()}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          {feedbackLoading ? 'Enviando...' : 'Enviar comentario'}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {tab === 'myFeedbacks' && (
                  <div className="space-y-3">
                    {myFeedbacks.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No has enviado comentarios sobre esta app.</p>
                    ) : (
                      myFeedbacks
                        .filter(fb => fb.app_id === appId && fb.level === level && fb.grade === grade && fb.subject_id === subjectId)
                        .map(fb => (
                          <div key={fb.id} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleExpandFeedback(fb)}
                              className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="text-left">
                                <p className="text-xs text-gray-400">
                                  {new Date(fb.created_at).toLocaleDateString('es-ES')}
                                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    fb.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                  }`}>
                                    {fb.status === 'open' ? 'ABIERTO' : 'RESUELTO'}
                                  </span>
                                  {fb.last_sender === 'admin' && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600">
                                      RESPUESTA
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-700 truncate mt-0.5">{fb.last_message}</p>
                              </div>
                              {expandedFeedback === fb.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>

                            {expandedFeedback === fb.id && (
                              <div className="border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-end px-3 pt-1.5">
                                  <button
                                    onClick={() => { setExpandedFeedback(null); setFeedbackMessages([]); }}
                                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors py-0.5 px-1.5 rounded hover:bg-gray-200"
                                  >
                                    <X className="w-3 h-3" />
                                    Ocultar
                                  </button>
                                </div>
                                <div className="px-3 py-1.5 space-y-2 max-h-48 overflow-y-auto">
                                {feedbackMessages.map(msg => (
                                  <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}
                                  >
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                                      msg.sender_type === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-white border border-gray-200 text-gray-700'
                                    }`}>
                                      <p className="text-[10px] font-bold mb-0.5 opacity-60">
                                        {msg.sender_type === 'admin' ? 'Admin' : 'Tu'}
                                      </p>
                                      <p>{msg.message}</p>
                                      <p className="text-[10px] opacity-40 mt-1">
                                        {new Date(msg.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                </div>

                                {/* Reply input */}
                                <div className="flex gap-2 px-3 py-2 border-t border-gray-100">
                                  <input
                                    type="text"
                                    value={replyMsg}
                                    onChange={(e) => setReplyMsg(e.target.value)}
                                    placeholder="Responder..."
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(fb.id); } }}
                                  />
                                  <button
                                    onClick={() => handleReply(fb.id)}
                                    disabled={replyLoading || !replyMsg.trim()}
                                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                    {myFeedbacks.filter(fb => fb.app_id === appId && fb.level === level && fb.grade === grade && fb.subject_id === subjectId).length === 0 && myFeedbacks.length > 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">No has enviado comentarios sobre esta app.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
