import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Megaphone, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentChatTab() {
  const { student } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('broadcasts'); // 'broadcasts' | 'private'
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-slate-800">Mensajes del profesor</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-100 shadow-sm">
        <button
          onClick={() => setActiveView('broadcasts')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'broadcasts'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Anuncios del grupo
          {broadcasts.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeView === 'broadcasts' ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {broadcasts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('private')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'private'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          Chat con profesor
          {privateMessages.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeView === 'private' ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {privateMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 space-y-2.5 max-h-[400px] overflow-y-auto">
          {currentMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {activeView === 'broadcasts' ? (
                <>
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No hay anuncios del grupo</p>
                  <p className="text-xs mt-1">Aqui apareceran los mensajes que el profesor envie a todo el grupo.</p>
                </>
              ) : (
                <>
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No hay mensajes privados</p>
                  <p className="text-xs mt-1">Escribe un mensaje para hablar con tu profesor.</p>
                </>
              )}
            </div>
          ) : (
            currentMessages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  msg.sender_type === 'student'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : activeView === 'broadcasts'
                      ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-bl-sm'
                      : 'bg-purple-50 border border-purple-200 text-slate-800 rounded-bl-sm'
                }`}>
                  <p className={`text-[10px] font-bold mb-0.5 ${
                    msg.sender_type === 'student'
                      ? 'text-blue-200'
                      : activeView === 'broadcasts' ? 'text-amber-500' : 'text-purple-500'
                  }`}>
                    {msg.sender_type === 'student' ? 'Tu' : msg.sender_name}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${
                    msg.sender_type === 'student'
                      ? 'text-blue-300'
                      : activeView === 'broadcasts' ? 'text-amber-400' : 'text-purple-400'
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

        {/* Reply input - only for private chat */}
        {activeView === 'private' && (
          <div className="flex gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escribe un mensaje al profesor..."
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
        )}
      </div>
    </div>
  );
}
