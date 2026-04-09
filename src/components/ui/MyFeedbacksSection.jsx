import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Reusable section that shows the current user's feedback threads with chat.
 * Can be embedded in any dashboard (teacher, student, free, admin).
 */
export default function MyFeedbacksSection() {
  const { user, student, role, displayName } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyMsg, setReplyMsg] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getUserInfo = useCallback(() => {
    if ((role === 'teacher' || role === 'admin') && user) return { type: 'teacher', id: user.id };
    if (role === 'free' && user) return { type: 'free', id: user.id };
    if (role === 'student' && student) return { type: 'student', id: student.id };
    return null;
  }, [role, user, student]);

  // Load feedbacks - silent=true skips spinner (used after reply)
  const loadFeedbacks = useCallback(async (silent = false) => {
    const userInfo = getUserInfo();
    if (!userInfo) { setInitialLoading(false); return; }

    if (!silent) setInitialLoading(true);
    const { data } = await supabase.rpc('get_user_feedbacks', {
      p_user_type: userInfo.type,
      p_user_id: userInfo.id,
    });
    if (Array.isArray(data)) setFeedbacks(data);
    if (!silent) setInitialLoading(false);
  }, [getUserInfo]);

  useEffect(() => { loadFeedbacks(); }, [loadFeedbacks]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = useCallback(async (fbId) => {
    const userInfo = getUserInfo();
    const { data } = await supabase.rpc('get_feedback_messages', {
      p_feedback_id: fbId,
      p_user_id: userInfo?.id || null,
    });
    setMessages(Array.isArray(data) ? data : []);
  }, [getUserInfo]);

  const handleExpand = async (fbId) => {
    if (expandedId === fbId) {
      setExpandedId(null);
      setMessages([]);
      return;
    }
    setExpandedId(fbId);
    setMessages([]);
    setMessagesLoading(true);
    await loadMessages(fbId);
    setMessagesLoading(false);
  };

  const handleReply = async (fbId) => {
    if (!replyMsg.trim()) return;
    const userInfo = getUserInfo();
    if (!userInfo) return;

    const msgText = replyMsg.trim();
    setReplyMsg('');
    setReplyLoading(true);

    await supabase.rpc('user_reply_feedback', {
      p_feedback_id: fbId,
      p_user_id: userInfo.id,
      p_user_name: displayName || 'Usuario',
      p_message: msgText,
    });

    // Refresh messages for the current thread
    await loadMessages(fbId);
    setReplyLoading(false);

    // Silently refresh feedbacks list (updates message_count, last_message etc.)
    loadFeedbacks(true);
  };

  if (initialLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          <h2 className="font-bold text-gray-800">Mis comentarios</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          <h2 className="font-bold text-gray-800">Mis comentarios</h2>
        </div>
        <span className="text-xs text-slate-400">{feedbacks.length} enviado{feedbacks.length !== 1 ? 's' : ''}</span>
      </div>

      {feedbacks.length === 0 ? (
        <div className="py-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No has enviado comentarios todavia.</p>
          <p className="text-xs text-slate-300 mt-1">Puedes enviar sugerencias desde cualquier app.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {feedbacks.map((fb) => (
            <div key={fb.id}>
              <button
                onClick={() => handleExpand(fb.id)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{fb.app_name}</span>
                    <span className="text-xs text-slate-400">
                      {fb.grade}o {fb.level === 'bachillerato' ? 'Bach.' : fb.level === 'eso' ? 'ESO' : 'Primaria'}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      fb.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {fb.status === 'open' ? 'ABIERTO' : 'RESUELTO'}
                    </span>
                    {fb.last_sender === 'admin' && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-600 animate-pulse">
                        NUEVA RESPUESTA
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{fb.last_message}</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {new Date(fb.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}{fb.message_count} mensaje{fb.message_count !== 1 ? 's' : ''}
                  </p>
                </div>
                {expandedId === fb.id
                  ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                }
              </button>

              <AnimatePresence>
                {expandedId === fb.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-50 border-t border-slate-100">
                      {/* Close button */}
                      <div className="flex items-center justify-between px-4 pt-2 pb-0">
                        <span className="text-xs text-slate-400">{messages.length} mensaje{messages.length !== 1 ? 's' : ''}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedId(null); setMessages([]); }}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                          Ocultar
                        </button>
                      </div>
                      {/* Messages area */}
                      <div className="px-4 py-2 space-y-2.5 max-h-80 overflow-y-auto">
                        {messagesLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
                          </div>
                        ) : messages.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">No hay mensajes</p>
                        ) : (
                          messages.map(msg => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                                msg.sender_type === 'admin'
                                  ? 'bg-purple-100 text-purple-800 rounded-bl-sm'
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-br-sm shadow-sm'
                              }`}>
                                <p className={`text-[10px] font-bold mb-0.5 ${
                                  msg.sender_type === 'admin' ? 'text-purple-500' : 'text-slate-400'
                                }`}>
                                  {msg.sender_type === 'admin' ? `Admin (${msg.sender_name})` : 'Tu'}
                                </p>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${
                                  msg.sender_type === 'admin' ? 'text-purple-400' : 'text-slate-300'
                                }`}>
                                  {new Date(msg.created_at).toLocaleString('es-ES', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Reply input */}
                      <div className="flex gap-2 px-4 py-3 border-t border-slate-100 bg-white">
                        <input
                          type="text"
                          value={replyMsg}
                          onChange={(e) => setReplyMsg(e.target.value)}
                          placeholder="Escribe una respuesta..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReply(fb.id);
                            }
                          }}
                          disabled={replyLoading}
                        />
                        <button
                          onClick={() => handleReply(fb.id)}
                          disabled={replyLoading || !replyMsg.trim()}
                          className="px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {replyLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
