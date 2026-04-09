import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, MessageSquare, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function NotificationBell() {
  const { user, student, role, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const getUserId = useCallback(() => {
    if ((role === 'teacher' || role === 'admin' || role === 'free') && user) return user.id;
    if (role === 'student' && student) return student.id;
    return null;
  }, [role, user, student]);

  // Poll unread count every 30s
  useEffect(() => {
    if (!isAuthenticated) return;
    const userId = getUserId();
    if (!userId) return;

    const fetchCount = async () => {
      const { data } = await supabase.rpc('count_unread_notifications', { p_user_id: userId });
      if (data) setUnreadCount(data.count || 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, getUserId]);

  // Load notifications when opening
  useEffect(() => {
    if (!open) return;
    const userId = getUserId();
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase.rpc('get_user_notifications', { p_user_id: userId, p_limit: 20 });
      if (data) setNotifications(data);
      setLoading(false);
    };
    load();
  }, [open, getUserId]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkAllRead = async () => {
    const userId = getUserId();
    if (!userId) return;
    await supabase.rpc('mark_notifications_read', { p_user_id: userId });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id) => {
    const userId = getUserId();
    if (!userId) return;
    await supabase.rpc('mark_notifications_read', { p_user_id: userId, p_notification_ids: [id] });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full border border-purple-200 bg-white hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
      >
        <Bell className="w-4.5 h-4.5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sin notificaciones</p>
                </div>
              ) : (
                notifications.map(n => {
                  const isQuizInvite = n.type === 'quiz_battle_invite';
                  const quizCode = isQuizInvite && n.data?.room_code;

                  const handleClick = () => {
                    if (!n.read) handleMarkRead(n.id);
                    if (isQuizInvite && quizCode) {
                      setOpen(false);
                      navigate(`/quiz-battle/join/${quizCode}`);
                    }
                  };

                  return (
                    <div
                      key={n.id}
                      onClick={handleClick}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !n.read ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isQuizInvite
                            ? (!n.read ? 'bg-amber-100 text-amber-600' : 'bg-amber-50 text-amber-400')
                            : (!n.read ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400')
                        }`}>
                          {isQuizInvite ? <Zap className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                          {isQuizInvite && quizCode && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              <Zap className="w-3 h-3" /> Unirse: {quizCode}
                            </span>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.created_at).toLocaleString('es-ES', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
