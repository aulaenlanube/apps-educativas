import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, KeyRound, Eye, EyeOff, Lock, Check, Users, Trophy, Sparkles, Award, Calendar, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmailLinkSection from '@/components/student/EmailLinkSection';
import GroupSelector from '@/components/student/GroupSelector';
import UserAvatar, { rarityMeta } from '@/components/ui/UserAvatar';
import AvatarGallery from '@/components/avatar/AvatarGallery';
import DuelPhrasesEditor from '@/components/duel/DuelPhrasesEditor';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

const AVATAR_EMOJIS = [
  '🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄',
  '🐲', '🦋', '🌟', '🚀', '⚽', '🎨', '🎵', '📚',
  '🦈', '🐧', '🦉', '🐝', '🌈', '🎮', '🏆', '💎',
  '🔥', '⚡', '🍕', '🌍', '🎯', '🧩', '🤖', '👾',
  '💀', '👻', '👽', '🤡', '💩', '🧛', '🧟', '🫠',
  '🤪', '😈', '🥸', '🤮', '🫣', '🤯', '🦠', '🍑',
];

const AVATAR_COLORS = [
  { id: 'from-blue-500 to-purple-500', label: 'Azul-Morado', from: '#3b82f6', to: '#a855f7' },
  { id: 'from-pink-500 to-rose-500', label: 'Rosa', from: '#ec4899', to: '#f43f5e' },
  { id: 'from-green-500 to-emerald-500', label: 'Verde', from: '#22c55e', to: '#10b981' },
  { id: 'from-orange-500 to-amber-500', label: 'Naranja', from: '#f97316', to: '#f59e0b' },
  { id: 'from-cyan-500 to-blue-500', label: 'Cian', from: '#06b6d4', to: '#3b82f6' },
  { id: 'from-violet-500 to-fuchsia-500', label: 'Violeta', from: '#8b5cf6', to: '#d946ef' },
  { id: 'from-red-500 to-orange-500', label: 'Rojo', from: '#ef4444', to: '#f97316' },
  { id: 'from-teal-500 to-cyan-500', label: 'Turquesa', from: '#14b8a6', to: '#06b6d4' },
  { id: 'from-indigo-500 to-blue-500', label: 'Indigo', from: '#6366f1', to: '#3b82f6' },
  { id: 'from-yellow-400 to-orange-500', label: 'Amarillo', from: '#facc15', to: '#f97316' },
  { id: 'from-slate-600 to-slate-800', label: 'Oscuro', from: '#475569', to: '#1e293b' },
  { id: 'from-rose-400 to-purple-500', label: 'Pastel', from: '#fb7185', to: '#a855f7' },
];

export default function StudentProfileEditor({ student, studentInfo, onProfileUpdated }) {
  const { updateStudentLocal } = useAuth();
  const { totalXp, level, xpForCurrentLevel, xpForNextLevel, totalEarned, totalAvailable } = useGamification();
  const { toast } = useToast();
  const [selectedEmoji, setSelectedEmoji] = useState(studentInfo?.avatar_emoji || '🎓');
  const [selectedColor, setSelectedColor] = useState(studentInfo?.avatar_color || student?.avatar_color || 'from-blue-500 to-purple-500');
  const [savingEmoji, setSavingEmoji] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const username = student?.username || '';

  const currentColor = studentInfo?.avatar_color || student?.avatar_color || 'from-blue-500 to-purple-500';
  const hasChanges = selectedEmoji !== (studentInfo?.avatar_emoji || '🎓') || selectedColor !== currentColor;

  const handleSaveAvatar = async () => {
    if (!hasChanges) return;
    setSavingEmoji(true);

    const params = {
      p_student_id: student.id,
      p_group_id: student.group_id,
      p_session_token: student.session_token,
    };
    if (selectedEmoji !== (studentInfo?.avatar_emoji || '🎓')) params.p_avatar_emoji = selectedEmoji;
    if (selectedColor !== currentColor) params.p_avatar_color = selectedColor;

    const { data, error } = await supabase.rpc('student_update_profile', params);

    setSavingEmoji(false);

    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      const updates = {};
      if (params.p_avatar_emoji) updates.avatar_emoji = selectedEmoji;
      if (params.p_avatar_color) updates.avatar_color = selectedColor;
      updateStudentLocal(updates);

      toast({ title: 'Avatar actualizado' });
      onProfileUpdated?.();
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 4) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contrasena debe tener al menos 4 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contrasenas no coinciden' });
      return;
    }

    setSavingPassword(true);

    const { data, error } = await supabase.rpc('student_update_profile', {
      p_student_id: student.id,
      p_group_id: student.group_id,
      p_new_password: newPassword,
      p_current_password: currentPassword || null,
      p_session_token: student.session_token,
    });

    setSavingPassword(false);

    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      toast({ title: 'Contrasena actualizada' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;
  const selectedColorObj = AVATAR_COLORS.find(c => c.id === selectedColor) || AVATAR_COLORS[0];

  const { byCode } = useAvatarCatalog();
  const equippedAvatar = student?.selected_avatar_code ? byCode(student.selected_avatar_code) : null;
  const equippedRarity = equippedAvatar?.rarity;
  const rMeta = equippedRarity ? rarityMeta(equippedRarity) : null;

  return (
    <div className="space-y-6">
      {/* HERO CARD: layout técnico cuando hay avatar equipado, banner clásico cuando no */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-purple-100 dark:border-slate-700 overflow-hidden"
      >
        {equippedAvatar ? (
          // Layout con avatar: fondo técnico oscuro con grid + glow de rareza
          <div
            className="relative px-5 sm:px-7 py-6 sm:py-7 overflow-hidden"
            style={{
              background: `radial-gradient(circle at 20% 30%, ${rMeta.glow}33 0%, transparent 55%), radial-gradient(circle at 80% 70%, ${rMeta.ring}22 0%, transparent 60%), linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`,
            }}
          >
            {/* Grid técnico */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Líneas diagonales sutiles */}
            <div
              className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage:
                  `repeating-linear-gradient(45deg, transparent 0 80px, ${rMeta.ring}33 80px 81px)`,
              }}
            />
            {/* Highlight superior */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${rMeta.glow}, transparent)` }}
            />
            {studentInfo?.group_name && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/8 backdrop-blur-md rounded-full px-3 py-1 border border-white/15">
                <Users className="w-3.5 h-3.5 text-white/80" />
                <span className="text-xs font-bold text-white/90">{studentInfo.group_name}</span>
              </div>
            )}

            <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-7 items-start sm:items-center">
              {/* Avatar enorme */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="flex-shrink-0"
              >
                <UserAvatar
                  selectedAvatarCode={student.selected_avatar_code}
                  size="mega"
                  shape="rounded"
                  showRarityBorder
                  showRarityGlow
                  className="shadow-[0_0_60px_rgba(0,0,0,0.6)]"
                />
              </motion.div>

              <div className="flex-1 min-w-0 space-y-3">
                {/* Etiqueta rareza + bonus */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                    style={{ background: `linear-gradient(135deg, ${rMeta.ring}, ${rMeta.glow})` }}
                  >
                    {rMeta.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                    +{Number(equippedAvatar.points_bonus).toFixed(2)} pts · nota media
                  </span>
                </div>

                {/* Nombre alumno */}
                <h1 className="text-2xl sm:text-3xl font-black text-white truncate">
                  {studentInfo?.email_verified || student?.email_verified
                    ? (studentInfo?.display_name || 'Alumno')
                    : `@${username}`}
                </h1>

                {/* Descripción del avatar */}
                {equippedAvatar.description && (
                  <p className="text-sm text-white/70 italic leading-snug max-w-prose">
                    {equippedAvatar.description}
                  </p>
                )}

                {/* Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-amber-300 rounded-full px-3 py-1.5 text-xs font-bold border border-white/15 backdrop-blur">
                    <Trophy className="w-3.5 h-3.5" /> Nivel {level}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-indigo-200 rounded-full px-3 py-1.5 text-xs font-bold border border-white/15 backdrop-blur">
                    <Sparkles className="w-3.5 h-3.5" /> {totalXp.toLocaleString()} XP
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-emerald-300 rounded-full px-3 py-1.5 text-xs font-bold border border-white/15 backdrop-blur">
                    <Award className="w-3.5 h-3.5" /> {totalEarned}/{totalAvailable} insignias
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Layout clásico (banner color + emoji) cuando no hay avatar
          <>
            <div className={`h-36 sm:h-40 bg-gradient-to-r ${selectedColor} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                }}
              />
              {studentInfo?.group_name && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                  <Users className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white">{studentInfo.group_name}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-40 sm:left-48 right-4">
                <h1 className="text-2xl sm:text-3xl font-black text-white truncate drop-shadow-lg">
                  {studentInfo?.email_verified || student?.email_verified
                    ? (studentInfo?.display_name || 'Alumno')
                    : `@${username}`}
                </h1>
              </div>
            </div>

            <div className="px-5 sm:px-6 pb-5 -mt-16 sm:-mt-20 relative">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0"
                >
                  <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br ${selectedColor} flex items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)' }}
                    />
                    <span className="text-6xl sm:text-7xl leading-none drop-shadow-lg relative">{selectedEmoji}</span>
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0 pt-2 sm:pt-24">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-xs font-bold border border-amber-200">
                      <Trophy className="w-3.5 h-3.5" /> Nivel {level}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1.5 text-xs font-bold border border-indigo-200">
                      <Sparkles className="w-3.5 h-3.5" /> {totalXp.toLocaleString()} XP
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-xs font-bold border border-emerald-200">
                      <Award className="w-3.5 h-3.5" /> {totalEarned}/{totalAvailable} insignias
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="px-5 sm:px-6 pb-5 pt-4 relative">

          {/* Progreso de experiencia */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative overflow-hidden mt-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg"
          >
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 12% 20%, rgba(255,255,255,0.4) 0%, transparent 45%), radial-gradient(circle at 88% 80%, rgba(255,200,255,0.3) 0%, transparent 50%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            <div className="relative p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                    className="relative w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg"
                    style={{ boxShadow: '0 0 20px rgba(253,224,71,0.35)' }}
                  >
                    <span className="text-2xl font-black tabular-nums drop-shadow">{level}</span>
                  </motion.div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/70">Tu progreso</p>
                    <p className="text-base font-black leading-tight">Nivel {level} de 101</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, duration: 0.4 }}
                  className="text-right"
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">XP total</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <AnimatedNumber value={totalXp} className="text-2xl font-black tabular-nums drop-shadow" />
                  </div>
                </motion.div>
              </div>

              {/* Barra principal */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-white/85 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="font-semibold">
                      {level >= 101 ? '¡Nivel máximo alcanzado!' : `Camino al nivel ${level + 1}`}
                    </span>
                  </span>
                  <span className="text-white/70 tabular-nums">
                    {level >= 101 ? '—' : `${xpInLevel.toLocaleString('es-ES')} / ${xpNeeded.toLocaleString('es-ES')} XP`}
                  </span>
                </div>
                <div className="relative w-full h-3 bg-white/15 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 shadow-[0_0_16px_rgba(251,191,36,0.55)]"
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '120%' }}
                    transition={{ duration: 1.6, delay: 0.45, ease: 'easeOut' }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/65">
                  <span>{xpProgress}% del nivel</span>
                  {level < 101 && (
                    <span className="tabular-nums">Faltan {(xpNeeded - xpInLevel).toLocaleString('es-ES')} XP</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Galería de personajes (avatar coleccionables) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 mb-1">Galería de personajes</h3>
        <p className="text-xs text-slate-500 mb-4">
          Desbloquea avatares jugando. Cada uno suma puntos a tu nota media (tope +0,5). Los más raros se ven sobre todo en duelo y batalla, como símbolo de estatus.
        </p>
        <AvatarGallery onSelected={() => onProfileUpdated?.()} />
      </motion.div>

      {/* Frases para duelos 1 vs 1 */}
      <DuelPhrasesEditor />

      {/* Calidad gráfica global (se guarda por dispositivo) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Calidad gráfica</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Ajusta los gráficos de las apps 3D (La Fortaleza, Laboratorio de Física…) en este dispositivo.
          En Auto se adapta sola a la potencia del equipo.
        </p>
        <GraphicsQualitySelector variant="row" />
      </motion.div>

      {/* Personalizar avatar (emoji + color clásico) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 mb-1">Avatar clásico (emoji)</h3>
        <p className="text-xs text-slate-500 mb-5">Si no tienes ningún avatar equipado, se mostrará este emoji con su color.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selector emoji */}
          <div>
            <Label className="text-slate-500 text-xs font-semibold mb-2 block uppercase tracking-wide">Emoji</Label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-purple-100 ring-2 ring-purple-400 scale-110'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Selector color */}
          <div>
            <Label className="text-slate-500 text-xs font-semibold mb-2 block uppercase tracking-wide">Color del panel</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={`relative h-10 rounded-xl transition-all ${
                    selectedColor === color.id
                      ? 'ring-2 ring-offset-2 ring-purple-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                  title={color.label}
                >
                  {selectedColor === color.id && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Color actual: <span className="font-semibold">{selectedColorObj.label}</span></p>
          </div>
        </div>

        {hasChanges && (
          <Button
            onClick={handleSaveAvatar}
            disabled={savingEmoji}
            className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            <Check className="w-4 h-4 mr-1" />
            {savingEmoji ? 'Guardando...' : 'Guardar avatar'}
          </Button>
        )}
      </motion.div>

      {/* Vincular email */}
      <EmailLinkSection
        student={student}
        studentInfo={studentInfo}
        onUpdated={onProfileUpdated}
      />

      {/* Mis grupos (solo si tiene email verificado) */}
      {(student?.email_verified || studentInfo?.email_verified) && (
        <MyGroupsSection student={student} />
      )}

      {/* Cambiar contrasena */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          Cambiar contrasena
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Contrasena actual</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="current-pw"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Tu contrasena actual"
                className="pl-10 pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pw">Nueva contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="new-pw"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Minimo 4 caracteres"
                className="pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Repetir nueva contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="confirm-pw"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Repite la nueva contrasena"
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Las contrasenas no coinciden</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={savingPassword || !currentPassword || newPassword.length < 4 || newPassword !== confirmPassword}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            {savingPassword ? 'Cambiando...' : 'Cambiar contrasena'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function MyGroupsSection({ student }) {
  const { switchStudentGroup } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    const { data } = await supabase.rpc('student_get_my_groups', { p_student_id: student.id, p_session_token: student.session_token });
    setGroups(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, [student.id]);

  const handleSelect = (group) => {
    switchStudentGroup(group);
    toast({ title: group ? `Grupo activo: ${group.group_name}` : 'Practica libre activada' });
  };

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-500" />
        Mis grupos
      </h3>
      <GroupSelector
        groups={groups}
        activeGroupId={student?.group_id || null}
        onSelect={handleSelect}
        showJoin={true}
        studentId={student.id}
        onGroupJoined={() => fetchGroups()}
      />
    </motion.div>
  );
}
