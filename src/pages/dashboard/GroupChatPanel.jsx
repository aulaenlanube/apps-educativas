import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, ChevronLeft, ChevronDown, Megaphone, Pin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import UserAvatar from '@/components/ui/UserAvatar';
import { DashCard, DashButton, Pill } from '@/components/dashboard/kit';
import './teacherPanels.css';

// ── Formato de fechas (solo presentación) ──────────────────────────────────
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const dayKey = (iso) => new Date(iso).toDateString();
function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
}
function shortWhen(iso) {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return fmtTime(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

// Chat del grupo con aspecto de mensajería: anuncios fijados arriba, lista de
// conversaciones con avatar y no leídos, y el hilo con burbujas a la derecha
// (en móvil, lista e hilo se alternan).
export default function GroupChatPanel({ groupId, groupName }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null); // null=overview, 'broadcast'=broadcast, studentId=private
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const fetchOverview = useCallback(async (silent = false) => {
    if (!groupId) return;
    if (!silent) setLoading(true);
    const { data } = await supabase.rpc('teacher_get_chat_overview', { p_group_id: groupId });
    if (data && !data.error) setOverview(data);
    if (!silent) setLoading(false);
  }, [groupId]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  // Poll overview every 15s when on overview screen
  useEffect(() => {
    if (selectedThread !== null) return;
    pollRef.current = setInterval(() => fetchOverview(true), 15000);
    return () => clearInterval(pollRef.current);
  }, [selectedThread, fetchOverview]);

  useEffect(() => {
    if (messages.length > 0) {
      // 'nearest': desplaza la lista de mensajes sin arrastrar la página entera
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const loadMessages = useCallback(async (studentId) => {
    setMessagesLoading(true);
    const { data } = await supabase.rpc('get_chat_messages', {
      p_group_id: groupId,
      p_student_id: studentId === 'broadcast' ? null : studentId,
    });
    setMessages(Array.isArray(data) ? data : []);
    setMessagesLoading(false);
  }, [groupId]);

  const openThread = async (threadId) => {
    setSelectedThread(threadId);
    setMessages([]);
    setReply('');
    await loadMessages(threadId);
  };

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await supabase.rpc('teacher_send_message', {
      p_group_id: groupId,
      p_student_id: selectedThread === 'broadcast' ? null : selectedThread,
      p_message: reply.trim(),
    });
    setReply('');
    await loadMessages(selectedThread);
    setSending(false);
    fetchOverview(true);
  };

  if (!groupId) return null;

  const threads = overview?.threads || [];
  const totalUnread = threads.reduce((sum, t) => sum + (t.unread_count || 0), 0);
  const hasThread = selectedThread !== null;
  const isBroadcast = selectedThread === 'broadcast';
  const studentInfo = hasThread && !isBroadcast && overview?.threads
    ? overview.threads.find(t => t.student_id === selectedThread)
    : null;
  const closeThread = () => { setSelectedThread(null); setMessages([]); };

  const studentAvatar = (info, size) => (
    <UserAvatar
      avatarEmoji={info?.avatar_emoji || '🎓'}
      avatarColor={info?.avatar_color}
      selectedAvatarCode={info?.selected_avatar_code}
      size={size}
    />
  );

  return (
    <DashCard
      className="tp-root tp-chatcard"
      icon={MessageSquare}
      tone="pink"
      title={`Chat de ${groupName}`}
      subtitle={`${threads.length} alumno${threads.length !== 1 ? 's' : ''} · anuncios y mensajes privados`}
      actions={(
        <>
          {totalUnread > 0 && <Pill tone="accent">{totalUnread} sin leer</Pill>}
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="tp-iconbtn"
            title={collapsed ? 'Mostrar chat' : 'Ocultar chat'}
            aria-expanded={!collapsed}
          >
            <ChevronDown size={18} className={`tp-collapse ${collapsed ? 'is-closed' : ''}`} />
          </button>
        </>
      )}
    >
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="chat-body"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <div className={`tp-chat ${hasThread ? 'has-thread' : ''}`}>
              {/* Lista de conversaciones */}
              <div className="tp-chat__list">
                {loading ? (
                  <div className="tp-center"><span className="tp-spin" /></div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openThread('broadcast')}
                      className={`tp-pin ${isBroadcast ? 'is-active' : ''}`}
                    >
                      <span className="tp-pin__tack" aria-hidden="true"><Pin size={12} /></span>
                      <span className="tp-pin__icon"><Megaphone size={22} /></span>
                      <span className="tp-pin__body">
                        <span className="tp-pin__title">Anuncios al grupo</span>
                        <span className="tp-pin__msg">
                          {overview?.last_broadcast
                            ? overview.last_broadcast.message
                            : 'Envía un mensaje a todos los alumnos'}
                        </span>
                      </span>
                      <span className="tp-pin__count">{overview?.broadcast_count || 0} msg</span>
                    </button>

                    {threads.length > 0 && <div className="tp-chat__sep">Conversaciones privadas</div>}

                    {threads.map(thread => {
                      const active = selectedThread === thread.student_id;
                      const unread = thread.has_unread && !active;
                      return (
                        <button
                          key={thread.student_id}
                          type="button"
                          onClick={() => openThread(thread.student_id)}
                          className={`tp-convo ${active ? 'is-active' : ''} ${unread ? 'is-unread' : ''}`}
                        >
                          <span className="tp-convo__av">
                            {studentAvatar(thread, 'md')}
                            {unread && <span className="tp-convo__dot" />}
                          </span>
                          <span className="tp-convo__body">
                            <span className="tp-convo__top">
                              <span className="tp-convo__name">{thread.display_name}</span>
                              {thread.last_message_at && (
                                <span className="tp-convo__time">{shortWhen(thread.last_message_at)}</span>
                              )}
                            </span>
                            <span className="tp-convo__msg">
                              <span>
                                {thread.last_message
                                  ? `${thread.last_sender === 'teacher' ? 'Tú: ' : ''}${thread.last_message}`
                                  : 'Sin mensajes'}
                              </span>
                              {thread.unread_count > 0 && !active && (
                                <span className="tp-count-badge">{thread.unread_count}</span>
                              )}
                            </span>
                          </span>
                        </button>
                      );
                    })}

                    {threads.length === 0 && (
                      <p className="tp-arena__empty">No hay alumnos en este grupo</p>
                    )}
                  </>
                )}
              </div>

              {/* Hilo abierto (o invitación a elegir uno) */}
              <div className="tp-chat__pane">
                {hasThread ? (
                  <div className="tp-thread">
                    <div className="tp-thread__head">
                      <button type="button" onClick={closeThread} className="tp-iconbtn" title="Volver" aria-label="Volver">
                        <ChevronLeft size={18} />
                      </button>
                      {isBroadcast
                        ? <span className="tp-thread__megaphone"><Megaphone size={20} /></span>
                        : studentAvatar(studentInfo, 'md')}
                      <div className="tp-thread__who">
                        <p className="tp-thread__name">
                          {isBroadcast ? 'Anuncios al grupo' : (studentInfo?.display_name || 'Alumno')}
                        </p>
                        <p className="tp-thread__sub">
                          {isBroadcast
                            ? `Lo verán los ${threads.length} alumnos de ${groupName}`
                            : 'Conversación privada'}
                        </p>
                      </div>
                    </div>

                    <div className="tp-thread__msgs">
                      {messagesLoading ? (
                        <div className="tp-center"><span className="tp-spin" /></div>
                      ) : messages.length === 0 ? (
                        <p className="tp-thread__empty">
                          {isBroadcast ? <Megaphone size={34} /> : <MessageSquare size={34} />}
                          {isBroadcast
                            ? 'No hay anuncios todavía. Envía el primer mensaje al grupo.'
                            : 'No hay mensajes. Inicia la conversación.'}
                        </p>
                      ) : (
                        messages.map((msg, i) => {
                          const mine = msg.sender_type === 'teacher';
                          const newDay = i === 0 || dayKey(messages[i - 1].created_at) !== dayKey(msg.created_at);
                          return (
                            <React.Fragment key={msg.id}>
                              {newDay && <span className="tp-day">{dayLabel(msg.created_at)}</span>}
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`tp-msg ${mine ? 'is-me' : 'is-them'}`}
                              >
                                {!mine && !isBroadcast && studentAvatar(studentInfo, 'sm')}
                                <div className="tp-bubble">
                                  <p className="tp-bubble__who">{msg.sender_name}</p>
                                  <p className="tp-bubble__text">{msg.message}</p>
                                  <p className="tp-bubble__time">{fmtTime(msg.created_at)}</p>
                                </div>
                              </motion.div>
                            </React.Fragment>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="tp-composer">
                      <input
                        type="text"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={isBroadcast ? 'Escribe un mensaje para todo el grupo...' : 'Escribe un mensaje...'}
                        className="tp-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        disabled={sending}
                      />
                      <DashButton
                        className="tp-send"
                        onClick={handleSend}
                        disabled={sending || !reply.trim()}
                        title="Enviar"
                        aria-label="Enviar"
                      >
                        {sending ? <span className="tp-spin tp-spin--sm tp-spin--light" /> : <Send size={18} />}
                      </DashButton>
                    </div>
                  </div>
                ) : (
                  <div className="tp-chat__idle">
                    <div className="tp-bubbles-art" aria-hidden="true">
                      <span><Megaphone size={22} /></span>
                      <span><MessageSquare size={22} /></span>
                    </div>
                    <strong>Elige una conversación</strong>
                    <p>Escribe un anuncio para todo {groupName} o abre el chat privado de un alumno.</p>
                    <DashButton variant="amber" size="sm" icon={Megaphone} onClick={() => openThread('broadcast')}>
                      Escribir anuncio
                    </DashButton>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashCard>
  );
}
