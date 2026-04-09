import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Send, CheckCircle2,
  Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 20;

export default function FeedbackPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => { setPage(1); }, [status]);

  const fetchFeedbacks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data } = await supabase.rpc('admin_get_feedbacks', {
      p_status: status,
      p_page: page,
      p_page_size: PAGE_SIZE,
      p_search: debouncedSearch || null,
    });
    if (data && !data.error) {
      setFeedbacks(data.feedbacks || []);
      setTotal(data.total || 0);
      setOpenCount(data.open_count || 0);
      setResolvedCount(data.resolved_count || 0);
    }
    if (!silent) setLoading(false);
  }, [status, page, debouncedSearch]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = useCallback(async (fb) => {
    const { data } = await supabase.rpc('get_feedback_messages', {
      p_feedback_id: fb.id,
      p_user_id: fb.user_id,
    });
    setMessages(Array.isArray(data) ? data : []);
  }, []);

  const handleExpand = async (fb) => {
    if (expandedId === fb.id) {
      setExpandedId(null);
      setMessages([]);
      return;
    }
    setExpandedId(fb.id);
    setMessages([]);
    setReply('');
    setMessagesLoading(true);
    await loadMessages(fb);
    setMessagesLoading(false);
  };

  const handleSend = async (fb) => {
    if (!reply.trim()) return;
    setSending(true);
    await supabase.rpc('admin_reply_feedback', {
      p_feedback_id: fb.id,
      p_message: reply.trim(),
    });
    setReply('');
    await loadMessages(fb);
    setSending(false);
    fetchFeedbacks(true);
  };

  const handleResolve = async (fb) => {
    await supabase.rpc('admin_resolve_feedback', {
      p_feedback_id: fb.id,
    });
    fetchFeedbacks(true);
  };

  const handleReopen = async (fb) => {
    await supabase
      .from('app_feedback')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', fb.id);
    fetchFeedbacks(true);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap">
        {[
          { id: 'all', label: `Todos (${total})`, icon: MessageSquare },
          { id: 'open', label: `Abiertos (${openCount})`, icon: Clock },
          { id: 'resolved', label: `Resueltos (${resolvedCount})`, icon: CheckCircle2 },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setStatus(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              status === f.id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por app o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No hay comentarios</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {feedbacks.map((fb, i) => (
              <div key={fb.id}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleExpand(fb)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          fb.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {fb.status === 'open' ? 'ABIERTO' : 'RESUELTO'}
                        </span>
                        <span className="text-sm font-semibold text-slate-800 truncate">{fb.app_name}</span>
                        <span className="text-xs text-slate-400">
                          {fb.grade}o {fb.level === 'bachillerato' ? 'Bach.' : fb.level === 'eso' ? 'ESO' : 'Primaria'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{fb.first_message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${
                          fb.user_type === 'teacher' ? 'text-blue-600' : fb.user_type === 'free' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {fb.user_display_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {fb.message_count} mensaje{fb.message_count !== 1 ? 's' : ''}
                        </span>
                        {fb.last_sender === 'user' && fb.message_count > 1 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-600">
                            PENDIENTE
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-slate-400">
                        {new Date(fb.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                      {expandedId === fb.id
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {expandedId === fb.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-50 border-t border-slate-100">
                        {/* Header: info + actions */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Usuario: <span className="font-medium text-slate-700">{fb.user_display_name}</span> ({fb.user_type})</span>
                            <span>·</span>
                            <span>{fb.grade}o {fb.level === 'bachillerato' ? 'Bach.' : fb.level === 'eso' ? 'ESO' : 'Primaria'} - {fb.subject_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {fb.status === 'open' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleResolve(fb); }}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg text-[10px] font-medium hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Resuelto
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReopen(fb); }}
                                className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-medium hover:bg-amber-600 transition-colors"
                              >
                                <Clock className="w-3 h-3" /> Reabrir
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedId(null); setMessages([]); }}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-200"
                            >
                              <X className="w-3.5 h-3.5" />
                              Ocultar
                            </button>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="px-4 py-2 space-y-2.5 max-h-[400px] overflow-y-auto">
                          {messagesLoading ? (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                            </div>
                          ) : messages.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No hay mensajes</p>
                          ) : (
                            messages.map(msg => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                                  msg.sender_type === 'admin'
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                                }`}>
                                  <p className={`text-[10px] font-bold mb-0.5 ${
                                    msg.sender_type === 'admin' ? 'text-indigo-200' : 'text-slate-400'
                                  }`}>
                                    {msg.sender_name}
                                  </p>
                                  <p className="whitespace-pre-wrap">{msg.message}</p>
                                  <p className={`text-[10px] mt-1 ${
                                    msg.sender_type === 'admin' ? 'text-indigo-300' : 'text-slate-400'
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
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(fb);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            disabled={sending}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSend(fb); }}
                            disabled={sending || !reply.trim()}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {sending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Enviar
                              </>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Pagina {page} de {totalPages}</span>
            <div className="flex items-center gap-1">
              <PagBtn onClick={() => setPage(1)} disabled={page <= 1}><ChevronsLeft className="w-4 h-4" /></PagBtn>
              <PagBtn onClick={() => setPage(p => p - 1)} disabled={page <= 1}><ChevronLeft className="w-4 h-4" /></PagBtn>
              <PagBtn onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}><ChevronRight className="w-4 h-4" /></PagBtn>
              <PagBtn onClick={() => setPage(totalPages)} disabled={page >= totalPages}><ChevronsRight className="w-4 h-4" /></PagBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PagBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      {children}
    </button>
  );
}
