import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Bell, CheckCheck, MessageSquare, Zap, LogOut, Copy,
  LayoutDashboard, UserCircle, BarChart3, Rocket, Trophy,
  GraduationCap, Sun, Moon, Shield, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export default function MobileSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { displayName, role, teacher, freeUser, student, signOut, isAdmin, user } = useAuth();
  const { level, totalXp, xpForCurrentLevel, xpForNextLevel, totalEarned } = useGamification();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isStudentRole = role === 'student';

  const avatarEmoji = isStudentRole
    ? (student?.avatar_emoji || '🎓')
    : (teacher?.avatar_emoji || freeUser?.avatar_emoji || '👨‍🏫');
  const avatarColor = isStudentRole
    ? (student?.avatar_color || 'from-blue-500 to-purple-500')
    : (teacher?.avatar_color || freeUser?.avatar_color || 'from-blue-500 to-purple-500');

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  const subtitle = isStudentRole
    ? `@${student?.username} · ${student?.group_name}`
    : (teacher?.email || freeUser?.email || '');

  const getUserId = useCallback(() => {
    if ((role === 'teacher' || role === 'admin' || role === 'free') && user) return user.id;
    if (role === 'student' && student) return student.id;
    return null;
  }, [role, user, student]);

  // Fetch notifications when sidebar opens
  useEffect(() => {
    if (!open) return;
    const userId = getUserId();
    if (!userId) return;

    const load = async () => {
      setLoadingNotifs(true);
      const [countRes, listRes] = await Promise.all([
        supabase.rpc('count_unread_notifications', { p_user_id: userId }),
        supabase.rpc('get_user_notifications', { p_user_id: userId, p_limit: 10 }),
      ]);
      if (countRes.data) setUnreadCount(countRes.data.count || 0);
      if (listRes.data) setNotifications(listRes.data);
      setLoadingNotifs(false);
    };
    load();
  }, [open, getUserId]);

  const handleMarkAllRead = async () => {
    const userId = getUserId();
    if (!userId) return;
    await supabase.rpc('mark_notifications_read', { p_user_id: userId });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const nav = (path) => {
    onClose();
    navigate(path);
  };

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 1000));
    await signOut();
    setLoggingOut(false);
    setShowLogout(false);
    onClose();
    navigate('/');
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
    exit: { x: '100%', transition: { type: 'spring', damping: 30, stiffness: 300 } },
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-[9999] w-[85vw] max-w-[360px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Menu</span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {/* User card */}
              <div className={`mt-3 rounded-2xl bg-gradient-to-br ${avatarColor} p-4 text-white shadow-lg`}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <span className="text-3xl leading-none drop-shadow-sm">{avatarEmoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold truncate drop-shadow-sm">{displayName}</p>
                    <p className="text-xs text-white/80 truncate">{subtitle}</p>
                  </div>
                </div>
                {/* XP bar */}
                <div className="mt-3 bg-white/15 rounded-xl p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-white/25 flex items-center justify-center">
                        <span className="text-[9px] font-black">{level}</span>
                      </div>
                      <span className="text-[11px] font-bold text-white/90">Nivel {level}</span>
                    </div>
                    <span className="text-[10px] text-white/70">{totalXp.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-white/80"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-white/60">{xpInLevel} / {xpNeeded} XP</span>
                    <span className="text-[10px] text-white/60 flex items-center gap-0.5">
                      <Trophy className="w-2.5 h-2.5" /> {totalEarned}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-5 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Navegacion</p>

                {isAdmin && (
                  <SidebarItem icon={Shield} label="Admin" onClick={() => nav('/admin')} color="text-indigo-600" />
                )}

                {(role === 'teacher' || role === 'admin') && (
                  <>
                    <SidebarItem icon={UserCircle} label="Mi Perfil" onClick={() => nav('/perfil')} />
                    <SidebarItem icon={LayoutDashboard} label="Mi Panel" onClick={() => nav('/dashboard')} />
                    <SidebarItem icon={Copy} label={`Codigo: ${teacher?.teacher_code}`} onClick={handleCopyCode} />
                  </>
                )}

                {role === 'free' && (
                  <>
                    <SidebarItem icon={UserCircle} label="Mi Perfil" onClick={() => nav('/perfil')} />
                    <SidebarItem icon={Rocket} label="Mi Zona" onClick={() => nav('/mi-zona')} />
                  </>
                )}

                {isStudentRole && (
                  <>
                    <SidebarItem icon={BarChart3} label="Mi Panel" onClick={() => nav('/mi-panel?tab=overview')} />
                    <SidebarItem icon={Trophy} label="Mis Logros" onClick={() => nav('/mi-panel?tab=logros')} />
                    <SidebarItem icon={UserCircle} label="Mi Perfil" onClick={() => nav('/mi-panel?tab=profile')} />
                    <SidebarItem icon={GraduationCap} label={student?.group_name} disabled />
                  </>
                )}

                <SidebarItem
                  icon={theme === 'dark' ? Sun : Moon}
                  label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  onClick={toggleTheme}
                />
              </div>

              {/* Notifications */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3 h-3" />
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="ml-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-purple-600 hover:text-purple-800 font-medium flex items-center gap-0.5"
                    >
                      <CheckCheck className="w-3 h-3" /> Marcar
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                  {loadingNotifs ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 dark:text-slate-500">Sin notificaciones</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const isQuizInvite = n.type === 'quiz_battle_invite';
                      const quizCode = isQuizInvite && n.data?.room_code;

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (isQuizInvite && quizCode) {
                              onClose();
                              navigate(`/quiz-battle/join/${quizCode}`);
                            }
                          }}
                          className={`px-3 py-2.5 border-b border-slate-50 dark:border-slate-700 last:border-b-0 ${
                            isQuizInvite && quizCode ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : ''
                          } ${!n.read ? 'bg-purple-50/50 dark:bg-purple-900/20' : ''}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              isQuizInvite
                                ? (!n.read ? 'bg-amber-100 text-amber-600' : 'bg-amber-50 text-amber-400')
                                : (!n.read ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400')
                            }`}>
                              {isQuizInvite ? <Zap className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-tight ${!n.read ? 'font-semibold text-slate-800 dark:text-gray-100' : 'text-slate-600 dark:text-gray-300'}`}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{n.message}</p>
                              {isQuizInvite && quizCode && (
                                <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                  <Zap className="w-2.5 h-2.5" /> Unirse: {quizCode}
                                </span>
                              )}
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {new Date(n.created_at).toLocaleString('es-ES', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Logout */}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {!showLogout ? (
                    <motion.button
                      key="logout-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowLogout(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesion
                    </motion.button>
                  ) : !loggingOut ? (
                    <motion.div
                      key="logout-confirm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-xl border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
                    >
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">Seguro que quieres cerrar sesion?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowLogout(false)}
                          className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                        >
                          Cerrar sesion
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="logout-bye"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 flex flex-col items-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2"
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </motion.div>
                      <p className="text-sm font-bold text-slate-700 dark:text-gray-200">Hasta pronto!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function SidebarItem({ icon: Icon, label, onClick, color, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        disabled
          ? 'text-slate-400 dark:text-slate-500 cursor-default'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700'
      }`}
    >
      <Icon className={`w-5 h-5 ${color || (disabled ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400')}`} />
      <span className="flex-1 text-left truncate">{label}</span>
      {!disabled && <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
    </button>
  );
}
