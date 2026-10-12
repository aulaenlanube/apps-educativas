import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, MessageSquare, Zap, Swords, Trophy, Users, CheckCircle2, BellOff, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import './NotificationBell.css';

// ─── Presentación: tipo de aviso → icono, color y etiqueta ─────────────────
function notifKind(type = '') {
  if (type === 'duel_invite') return { icon: Swords, tone: 'rose', label: 'Reto' };
  if (type === 'duel_accepted') return { icon: Swords, tone: 'emerald', label: 'Duelo' };
  if (type === 'duel_result') return { icon: Trophy, tone: 'amber', label: 'Resultado' };
  if (type.startsWith('duel')) return { icon: Swords, tone: 'violet', label: 'Duelo' };
  if (type === 'quiz_battle_team_member') return { icon: Users, tone: 'violet', label: 'Equipo' };
  if (type.startsWith('quiz_battle')) return { icon: Zap, tone: 'amber', label: 'Batalla' };
  if (type === 'feedback_resolved') return { icon: CheckCircle2, tone: 'emerald', label: 'Comentario' };
  if (type.startsWith('feedback')) return { icon: MessageSquare, tone: 'sky', label: 'Comentario' };
  return { icon: Bell, tone: 'indigo', label: 'Aviso' };
}

// Agrupa por fecha conservando el orden del servidor (más recientes primero).
function dayBucket(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Anteriores';
  const start = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return 'Esta semana';
  return 'Anteriores';
}

function whenLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  if (mins < 60 * 12) return `Hace ${Math.round(mins / 60)} h`;
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationBell({ variant = 'default' }) {
  const isGlass = variant === 'glass';
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

  // Grupos por fecha (solo presentación).
  const groups = [];
  for (const n of notifications) {
    const key = dayBucket(n.created_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(n);
    else groups.push({ key, items: [n] });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notificaciones"
        aria-expanded={open}
        title="Notificaciones"
        className={`nb-trigger relative flex items-center justify-center w-9 h-9 rounded-full transition-colors focus:outline-none ${
          isGlass
            ? 'border border-white/15 bg-slate-900/35 backdrop-blur-md hover:bg-slate-900/55 focus:ring-2 focus:ring-white/20'
            : 'border border-purple-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-purple-300'
        }${unreadCount > 0 ? ' has-unread' : ''}${open ? ' is-open' : ''}`}
      >
        <Bell className={`nb-trigger__bell w-4.5 h-4.5 ${isGlass ? 'text-white/85' : 'text-gray-600 dark:text-slate-200'}`} />
        {unreadCount > 0 && (
          <span key={unreadCount} className="nb-count">
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
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="nb-panel"
            role="dialog"
            aria-label="Notificaciones"
          >
            {/* Cabecera */}
            <div className="nb-head">
              <span className="nb-head__icon" aria-hidden="true"><Bell size={18} /></span>
              <div className="nb-head__titles">
                <h3>Notificaciones</h3>
                <p>{unreadCount > 0 ? `${unreadCount} sin leer` : 'Estás al día'}</p>
              </div>
              {unreadCount > 0 && (
                <button type="button" onClick={handleMarkAllRead} className="nb-head__all">
                  <CheckCheck size={14} /> Marcar todas
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="nb-list">
              {loading ? (
                <div className="nb-skeleton" aria-label="Cargando">
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="nb-skeleton__row">
                      <span className="nb-skeleton__dot" />
                      <span className="nb-skeleton__lines"><i /><i /></span>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="nb-empty">
                  <span className="nb-empty__art" aria-hidden="true"><BellOff size={26} /></span>
                  <p className="nb-empty__title">Sin notificaciones</p>
                  <p className="nb-empty__text">Aquí verás retos, batallas y respuestas a tus comentarios.</p>
                </div>
              ) : (
                groups.map((g) => (
                  <section key={g.key} className="nb-group">
                    <p className="nb-group__label">{g.key}</p>
                    {g.items.map(n => {
                      const isTeamRep = n.type === 'quiz_battle_team_rep';
                      const isTeamMember = n.type === 'quiz_battle_team_member';
                      const isQuizInvite = n.type === 'quiz_battle_invite' || isTeamRep;
                      const isQuizRelated = isQuizInvite || isTeamMember;
                      const quizCode = isQuizRelated && n.data?.room_code;
                      const kind = notifKind(n.type);
                      const KindIcon = kind.icon;

                      const handleClick = () => {
                        if (!n.read) handleMarkRead(n.id);
                        // Solo el rep o las salas abiertas navegan a /join. Los
                        // miembros de equipo no se conectan — solo leen el aviso.
                        if (isQuizInvite && quizCode) {
                          setOpen(false);
                          navigate(`/quiz-battle/join/${quizCode}`);
                        }
                      };

                      return (
                        <div
                          key={n.id}
                          onClick={handleClick}
                          className={`nb-item nb-tone-${kind.tone}${!n.read ? ' is-unread' : ''}${isQuizInvite && quizCode ? ' is-action' : ''}`}
                        >
                          <span className="nb-item__icon" aria-hidden="true"><KindIcon size={17} /></span>
                          <div className="nb-item__body">
                            <p className="nb-item__top">
                              <span className="nb-item__kind">{kind.label}</span>
                              <span className="nb-item__time">{whenLabel(n.created_at)}</span>
                            </p>
                            <p className="nb-item__title">{n.title}</p>
                            {n.message && <p className="nb-item__msg">{n.message}</p>}
                            {isQuizInvite && quizCode && (
                              <span className="nb-chip nb-chip--join">
                                <Zap size={12} /> Unirse: {quizCode} <ChevronRight size={12} />
                              </span>
                            )}
                            {isTeamMember && (
                              <span className="nb-chip nb-chip--team">
                                <Users size={12} /> Equipo: {n.data?.team_name}
                              </span>
                            )}
                          </div>
                          {!n.read && <span className="nb-item__dot" aria-label="Sin leer" />}
                        </div>
                      );
                    })}
                  </section>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
