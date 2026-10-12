// Pestaña "Mensajes" del alumno — mensajería (rediseño 2026).
// Lista de conversaciones (anuncios del grupo / chat con el profe), burbujas
// con avatares agrupadas por remitente, separadores de día y compositor.
// Solo presentación: la carga, el sondeo cada 15 s y el envío son los de siempre.
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Megaphone, User, Lock, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';
import BrandLoader from '@/components/ui/BrandLoader';
import { DashEmpty } from '@/components/dashboard/kit';
import './StudentChatTab.css';

const dayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const dayLabel = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return 'Hoy';
  if (dayKey(d) === dayKey(yesterday)) return 'Ayer';
  const opts = { weekday: 'long', day: 'numeric', month: 'long' };
  if (d.getFullYear() !== today.getFullYear()) opts.year = 'numeric';
  const s = d.toLocaleDateString('es-ES', opts);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const timeLabel = (iso) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

// Hora corta para la lista de conversaciones: hoy → hora; si no → fecha corta.
const shortWhen = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (dayKey(d) === dayKey(new Date())) return timeLabel(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const initialOf = (name) => (String(name || 'P').trim().charAt(0) || 'P').toUpperCase();

export default function StudentChatTab() {
  const { student } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('broadcasts'); // 'broadcasts' | 'private'
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesBoxRef = useRef(null);
  const pollRef = useRef(null);

  const fetchChat = useCallback(async (silent = false) => {
    if (!student) return;
    if (!silent) setLoading(true);
    const { data: result } = await supabase.rpc('student_get_chat_messages', {
      p_student_id: student.id,
      p_group_id: student.group_id,
      p_session_token: student.session_token,
    });
    if (result && !result.error) setData(result);
    if (!silent) setLoading(false);
  }, [student]);

  useEffect(() => { fetchChat(); }, [fetchChat]);

  // Poll every 15s
  useEffect(() => {
    pollRef.current = setInterval(() => fetchChat(true), 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchChat]);

  // Scroll el cajon de mensajes hasta abajo sin arrastrar la pagina entera:
  // scrollIntoView mueve tambien el viewport exterior, causando un scroll al
  // pulsar la pestana Mensajes. Aqui solo tocamos el scroll interno.
  useEffect(() => {
    const box = messagesBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [data, activeView]);

  const handleSend = async () => {
    if (!reply.trim() || !student) return;
    setSending(true);
    await supabase.rpc('student_send_message', {
      p_student_id: student.id,
      p_group_id: student.group_id,
      p_message: reply.trim(),
      p_session_token: student.session_token,
    });
    setReply('');
    await fetchChat(true);
    setSending(false);
  };

  const broadcasts = data?.broadcasts || [];
  const privateMessages = data?.private_messages || [];
  const currentMessages = activeView === 'broadcasts' ? broadcasts : privateMessages;

  // Nombre del profe para la cabecera del chat privado (del primer mensaje suyo).
  const teacherName = useMemo(() => {
    const all = [...(data?.private_messages || []), ...(data?.broadcasts || [])];
    const m = all.find((x) => x.sender_type !== 'student' && x.sender_name);
    return m?.sender_name || null;
  }, [data]);

  // Bloques por día y, dentro, rachas de mensajes seguidos del mismo remitente.
  const days = useMemo(() => {
    const list = (activeView === 'broadcasts' ? data?.broadcasts : data?.private_messages) || [];
    const out = [];
    list.forEach((msg, i) => {
      const key = dayKey(msg.created_at);
      let day = out[out.length - 1];
      if (!day || day.key !== key) {
        day = { key, label: dayLabel(msg.created_at), items: [] };
        out.push(day);
      }
      const prev = list[i - 1];
      const next = list[i + 1];
      const sameAsPrev = prev && prev.sender_type === msg.sender_type && prev.sender_name === msg.sender_name && dayKey(prev.created_at) === key;
      const sameAsNext = next && next.sender_type === msg.sender_type && next.sender_name === msg.sender_name && dayKey(next.created_at) === key;
      day.items.push({ msg, first: !sameAsPrev, last: !sameAsNext });
    });
    return out;
  }, [data, activeView]);

  if (loading) {
    return (
      <div className="sct sct--loading">
        <div className="sct-loading">
          <MessageSquare size={20} />
          <strong>Mensajes del profesor</strong>
          <BrandLoader variant="inline" />
        </div>
      </div>
    );
  }

  const lastBroadcast = broadcasts[broadcasts.length - 1];
  const lastPrivate = privateMessages[privateMessages.length - 1];
  const isBroadcast = activeView === 'broadcasts';

  return (
    <div className="sct">
      <div className="sct-shell">
        {/* ── Conversaciones ── */}
        <aside className="sct-side">
          <div className="sct-side__head">
            <MessageCircle size={18} />
            <span>Mensajes</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('broadcasts')}
            className={`sct-conv is-amber${isBroadcast ? ' is-active' : ''}`}
            aria-pressed={isBroadcast}
          >
            <span className="sct-conv__avatar"><Megaphone size={20} /></span>
            <span className="sct-conv__body">
              <span className="sct-conv__top">
                <strong>Anuncios del grupo</strong>
                {lastBroadcast && <time>{shortWhen(lastBroadcast.created_at)}</time>}
              </span>
              <span className="sct-conv__preview">
                {lastBroadcast ? lastBroadcast.message : 'Sin anuncios todavía'}
              </span>
            </span>
            {broadcasts.length > 0 && <span className="sct-conv__count">{broadcasts.length}</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('private')}
            className={`sct-conv is-violet${!isBroadcast ? ' is-active' : ''}`}
            aria-pressed={!isBroadcast}
          >
            <span className="sct-conv__avatar">
              {teacherName ? <span className="sct-conv__initial">{initialOf(teacherName)}</span> : <User size={20} />}
            </span>
            <span className="sct-conv__body">
              <span className="sct-conv__top">
                <strong>Chat con profesor</strong>
                {lastPrivate && <time>{shortWhen(lastPrivate.created_at)}</time>}
              </span>
              <span className="sct-conv__preview">
                {lastPrivate
                  ? `${lastPrivate.sender_type === 'student' ? 'Tú: ' : ''}${lastPrivate.message}`
                  : 'Escribe a tu profe'}
              </span>
            </span>
            {privateMessages.length > 0 && <span className="sct-conv__count">{privateMessages.length}</span>}
          </button>

          <p className="sct-side__tip">
            Los anuncios los ve todo el grupo. El chat con tu profe es privado: solo lo leéis vosotros dos.
          </p>
        </aside>

        {/* ── Conversación ── */}
        <section className={`sct-pane ${isBroadcast ? 'is-amber' : 'is-violet'}`}>
          <header className="sct-pane__head">
            <span className="sct-pane__avatar">
              {isBroadcast ? <Megaphone size={20} /> : (teacherName ? initialOf(teacherName) : <User size={20} />)}
            </span>
            <div className="sct-pane__titles">
              <h3>{isBroadcast ? 'Anuncios del grupo' : (teacherName || 'Chat con profesor')}</h3>
              <p>{isBroadcast ? 'Mensajes de tu profe para toda la clase' : 'Conversación privada con tu profe'}</p>
            </div>
            <span className="sct-pane__count">{currentMessages.length} mensaje{currentMessages.length !== 1 ? 's' : ''}</span>
          </header>

          <div ref={messagesBoxRef} className="sct-msgs">
            {currentMessages.length === 0 ? (
              <div className="sct-empty">
                {isBroadcast ? (
                  <DashEmpty title="No hay anuncios del grupo">
                    Aquí aparecerán los mensajes que el profesor envíe a todo el grupo.
                  </DashEmpty>
                ) : (
                  <DashEmpty title="No hay mensajes privados">
                    Escribe un mensaje para hablar con tu profesor.
                  </DashEmpty>
                )}
              </div>
            ) : (
              days.map((day) => (
                <div key={day.key} className="sct-day">
                  <div className="sct-day__sep"><span>{day.label}</span></div>
                  {day.items.map(({ msg, first, last }) => {
                    const mine = msg.sender_type === 'student';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`sct-row ${mine ? 'is-mine' : 'is-theirs'}${first ? ' is-first' : ''}${last ? ' is-last' : ''}`}
                      >
                        <span className="sct-row__avatar">
                          {last && (mine ? (
                            <UserAvatar
                              selectedAvatarCode={student?.selected_avatar_code}
                              avatarEmoji={student?.avatar_emoji}
                              avatarColor={student?.avatar_color}
                              size="sm"
                            />
                          ) : (
                            <span className="sct-teacher">
                              {isBroadcast ? <Megaphone size={15} /> : initialOf(msg.sender_name)}
                            </span>
                          ))}
                        </span>
                        <div className="sct-bubble">
                          {first && (
                            <span className="sct-bubble__name">{mine ? 'Tú' : msg.sender_name}</span>
                          )}
                          <p className="sct-bubble__text">{msg.message}</p>
                          <time className="sct-bubble__time" dateTime={msg.created_at}>{timeLabel(msg.created_at)}</time>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Reply input - only for private chat */}
          {activeView === 'private' ? (
            <div className="sct-composer">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Escribe un mensaje al profesor..."
                className="sct-composer__input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={sending}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !reply.trim()}
                className="sct-composer__send"
                aria-label="Enviar"
              >
                {sending ? (
                  <span className="sct-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          ) : (
            <div className="sct-readonly">
              <Lock size={14} /> Solo tu profe puede publicar anuncios. ¿Dudas? Escríbele por el chat privado.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
