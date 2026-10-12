import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, Send, X, ShieldCheck, CheckCircle2, CircleDot, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashCard, DashEmpty, Pill } from '@/components/dashboard/kit';
import './MyFeedbacksSection.css';

const levelLabel = (level) => (level === 'bachillerato' ? 'Bach.' : level === 'eso' ? 'ESO' : 'Primaria');

/**
 * Reusable section that shows the current user's feedback threads with chat.
 * Can be embedded in any dashboard (teacher, student, free, admin).
 * Rediseño 2026: hilos como tarjetas de conversación (icono de la app,
 * estado, novedad) y la conversación en burbujas con su compositor.
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
      <DashCard className="mfb" icon={MessageSquare} tone="violet" title="Mis comentarios">
        <div className="mfb-loading">
          <span className="mfb-spin" />
        </div>
      </DashCard>
    );
  }

  const openCount = feedbacks.filter((f) => f.status === 'open').length;
  const resolvedCount = feedbacks.length - openCount;
  const newReplies = feedbacks.filter((f) => f.last_sender === 'admin').length;

  return (
    <DashCard
      className="mfb"
      icon={MessageSquare}
      tone="violet"
      title="Mis comentarios"
      subtitle="Tus sugerencias sobre las apps y las respuestas del equipo"
      actions={<Pill>{feedbacks.length} enviado{feedbacks.length !== 1 ? 's' : ''}</Pill>}
    >
      {feedbacks.length === 0 ? (
        <DashEmpty title="No has enviado comentarios todavía.">
          Puedes enviar sugerencias desde cualquier app.
        </DashEmpty>
      ) : (
        <>
          <div className="mfb-stats">
            <span className="mfb-stat is-open"><CircleDot size={14} /> {openCount} abierto{openCount !== 1 ? 's' : ''}</span>
            <span className="mfb-stat is-done"><CheckCircle2 size={14} /> {resolvedCount} resuelto{resolvedCount !== 1 ? 's' : ''}</span>
            {newReplies > 0 && (
              <span className="mfb-stat is-new"><Sparkles size={14} /> {newReplies} con respuesta nueva</span>
            )}
          </div>

          <div className="mfb-list">
            {feedbacks.map((fb) => {
              const isOpen = expandedId === fb.id;
              const hasNew = fb.last_sender === 'admin';
              return (
                <article key={fb.id} className={`mfb-thread${isOpen ? ' is-open' : ''}${hasNew ? ' has-new' : ''}`}>
                  <button
                    type="button"
                    onClick={() => handleExpand(fb.id)}
                    className="mfb-thread__head"
                    aria-expanded={isOpen}
                  >
                    <span className="mfb-thread__icon">
                      {fb.app_id && hasAppIcon(fb.app_id)
                        ? <AppIcon appId={fb.app_id} size={46} />
                        : <span className="mfb-thread__fallback"><MessageSquare size={20} /></span>}
                    </span>
                    <span className="mfb-thread__body">
                      <span className="mfb-thread__top">
                        <strong>{fb.app_name}</strong>
                        <span className="mfb-thread__course">{fb.grade}º {levelLabel(fb.level)}</span>
                        <span className={`mfb-status ${fb.status === 'open' ? 'is-open' : 'is-done'}`}>
                          {fb.status === 'open' ? 'Abierto' : 'Resuelto'}
                        </span>
                        {hasNew && <span className="mfb-new">Nueva respuesta</span>}
                      </span>
                      <span className="mfb-thread__last">
                        {fb.last_sender === 'admin' ? <b>Equipo: </b> : fb.last_sender ? <b>Tú: </b> : null}
                        {fb.last_message}
                      </span>
                      <span className="mfb-thread__meta">
                        {new Date(fb.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}{fb.message_count} mensaje{fb.message_count !== 1 ? 's' : ''}
                      </span>
                    </span>
                    <ChevronDown size={18} className="mfb-thread__chev" />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mfb-conv-wrap"
                      >
                        <div className="mfb-conv">
                          {/* Close button */}
                          <div className="mfb-conv__bar">
                            <span>{messages.length} mensaje{messages.length !== 1 ? 's' : ''}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedId(null); setMessages([]); }}
                              className="mfb-conv__hide"
                            >
                              <X size={14} />
                              Ocultar
                            </button>
                          </div>
                          {/* Messages area */}
                          <div className="mfb-conv__msgs">
                            {messagesLoading ? (
                              <div className="mfb-loading mfb-loading--sm"><span className="mfb-spin" /></div>
                            ) : messages.length === 0 ? (
                              <p className="mfb-conv__empty">No hay mensajes</p>
                            ) : (
                              messages.map(msg => {
                                const fromAdmin = msg.sender_type === 'admin';
                                return (
                                  <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mfb-msg ${fromAdmin ? 'is-admin' : 'is-mine'}`}
                                  >
                                    {fromAdmin && <span className="mfb-msg__avatar"><ShieldCheck size={16} /></span>}
                                    <div className="mfb-msg__bubble">
                                      <span className="mfb-msg__name">
                                        {fromAdmin ? `Admin (${msg.sender_name})` : 'Tú'}
                                      </span>
                                      <p className="mfb-msg__text">{msg.message}</p>
                                      <time className="mfb-msg__time">
                                        {new Date(msg.created_at).toLocaleString('es-ES', {
                                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                      </time>
                                    </div>
                                  </motion.div>
                                );
                              })
                            )}
                            <div ref={messagesEndRef} />
                          </div>

                          {/* Reply input */}
                          <div className="mfb-composer">
                            <input
                              type="text"
                              value={replyMsg}
                              onChange={(e) => setReplyMsg(e.target.value)}
                              placeholder="Escribe una respuesta..."
                              className="mfb-composer__input"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReply(fb.id);
                                }
                              }}
                              disabled={replyLoading}
                            />
                            <button
                              type="button"
                              onClick={() => handleReply(fb.id)}
                              disabled={replyLoading || !replyMsg.trim()}
                              className="mfb-composer__send"
                              aria-label="Enviar respuesta"
                            >
                              {replyLoading ? (
                                <span className="mfb-spin mfb-spin--light" />
                              ) : (
                                <Send size={17} />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </>
      )}
    </DashCard>
  );
}
