import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Copy, GraduationCap, UserCircle, BarChart3, Rocket, Trophy, Zap, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function UserMenu() {
  const { displayName, role, teacher, freeUser, student, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { level, totalXp, xpForCurrentLevel, xpForNextLevel, totalEarned } = useGamification();
  const { theme, toggleTheme } = useTheme();

  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    // Esperar a que se vea la animacion
    await new Promise(r => setTimeout(r, 1200));
    await signOut();
    setLoggingOut(false);
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className={`group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r ${avatarColor} px-1.5 py-1.5 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0">
              <span className="text-lg leading-none drop-shadow-sm">{avatarEmoji}</span>
            </div>
            <div className="hidden sm:flex flex-col items-start min-w-0 relative pr-2">
              <span className="text-xs font-bold text-white truncate max-w-[100px] leading-tight drop-shadow-sm">
                {displayName}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-white/90 leading-tight bg-white/15 px-1.5 py-px rounded-full">
                  Nv.{level}
                </span>
              </div>
            </div>
            <div className="sm:hidden absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-[8px] font-black text-white leading-none">{level}</span>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal p-3">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-sm`}>
                  <span className="text-2xl leading-none">{avatarEmoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-gray-100 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{subtitle}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700 dark:to-purple-900/30 rounded-xl p-2.5 border border-purple-100/50 dark:border-slate-600">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-black text-white">{level}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-200">Nivel {level}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{totalXp.toLocaleString()} XP</span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-400">{xpInLevel} / {xpNeeded} XP</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Trophy className="w-2.5 h-2.5" /> {totalEarned}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {(role === 'teacher' || role === 'admin') && (
            <>
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Mi Panel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <UserCircle className="mr-2 h-4 w-4" /> Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyCode}>
                <Copy className="mr-2 h-4 w-4" /> Codigo: {teacher?.teacher_code}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {role === 'free' && (
            <>
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <UserCircle className="mr-2 h-4 w-4" /> Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/mi-zona')}>
                <Rocket className="mr-2 h-4 w-4" /> Mi Zona
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {isStudentRole && (
            <>
              <DropdownMenuItem onClick={() => navigate('/mi-panel?tab=overview')}>
                <BarChart3 className="mr-2 h-4 w-4" /> Mi Panel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/mi-panel?tab=logros')}>
                <Trophy className="mr-2 h-4 w-4" /> Mis Logros
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/mi-panel?tab=profile')}>
                <UserCircle className="mr-2 h-4 w-4" /> Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <GraduationCap className="mr-2 h-4 w-4" /> {student?.group_name}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={(e) => { e.preventDefault(); toggleTheme(); }}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); setTimeout(() => setShowConfirm(true), 150); }} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de confirmacion de cierre de sesion — portal para centrar sobre todo */}
      {createPortal(
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => !loggingOut && setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {!loggingOut ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100">Cerrar sesion</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Hasta pronto, {displayName}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-6">
                      Se cerrara tu sesion en este dispositivo. Podras volver a iniciar sesion en cualquier momento.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Cerrar sesion
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bye"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-10 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                      className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-bold text-slate-800 dark:text-gray-100"
                    >
                      Sesion cerrada
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-slate-500 dark:text-gray-400 mt-1"
                    >
                      Hasta la proxima!
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
