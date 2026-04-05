import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Users, User, ChevronLeft, Megaphone,
  X, Circle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Thread view
  if (selectedThread !== null) {
    const isBroadcast = selectedThread === 'broadcast';
    const studentInfo = !isBroadcast && overview?.threads
      ? overview.threads.find(t => t.student_id === selectedThread)
      : null;

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { setSelectedThread(null); setMessages([]); }}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {isBroadcast ? (
              <>
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Anuncios al grupo</span>
              </>
            ) : (
              <>
                <span className="text-lg">{studentInfo?.avatar_emoji || '🎓'}</span>
                <span className="font-medium">{studentInfo?.display_name || 'Alumno'}</span>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className="p-3 space-y-2.5 max-h-[350px] overflow-y-auto">
            {messagesLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                {isBroadcast ? 'No hay anuncios todavia. Envia el primer mensaje al grupo.' : 'No hay mensajes. Inicia la conversacion.'}
              </p>
            ) : (
              messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender_type === 'teacher' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    msg.sender_type === 'teacher'
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className={`text-[10px] font-bold mb-0.5 ${
                      msg.sender_type === 'teacher' ? 'text-purple-200' : 'text-slate-400'
                    }`}>
                      {msg.sender_name}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender_type === 'teacher' ? 'text-purple-300' : 'text-slate-400'
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

          {/* Reply */}
          <div className="flex gap-2 px-3 py-2.5 border-t border-slate-100 bg-white">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={isBroadcast ? 'Escribe un mensaje para todo el grupo...' : 'Escribe un mensaje...'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Overview
  const threads = overview?.threads || [];
  const totalUnread = threads.reduce((sum, t) => sum + (t.unread_count || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          Chat de {groupName}
        </h3>
        {totalUnread > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-600">
            {totalUnread} sin leer
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Broadcast thread */}
          <button
            onClick={() => openThread('broadcast')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-left border border-slate-100"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Megaphone className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">Anuncios al grupo</p>
              <p className="text-xs text-slate-400 truncate">
                {overview?.last_broadcast
                  ? overview.last_broadcast.message
                  : 'Envia un mensaje a todos los alumnos'}
              </p>
            </div>
            <span className="text-xs text-slate-400">{overview?.broadcast_count || 0} msg</span>
          </button>

          {/* Divider */}
          {threads.length > 0 && (
            <div className="flex items-center gap-2 py-1.5 px-1">
              <span className="text-xs text-slate-400 font-medium">Conversaciones privadas</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
          )}

          {/* Student threads */}
          {threads.map(thread => (
            <button
              key={thread.student_id}
              onClick={() => openThread(thread.student_id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left border ${
                thread.has_unread ? 'border-purple-200 bg-purple-50/30' : 'border-slate-100'
              }`}
            >
              <div className="relative">
                <span className="text-2xl">{thread.avatar_emoji || '🎓'}</span>
                {thread.has_unread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${thread.has_unread ? 'text-purple-800' : 'text-slate-800'}`}>
                    {thread.display_name}
                  </p>
                  {thread.unread_count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500 text-white">
                      {thread.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {thread.last_message || 'Sin mensajes'}
                </p>
              </div>
              {thread.last_message_at && (
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(thread.last_message_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </button>
          ))}

          {threads.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay alumnos en este grupo</p>
          )}
        </div>
      )}
    </div>
  );
}
