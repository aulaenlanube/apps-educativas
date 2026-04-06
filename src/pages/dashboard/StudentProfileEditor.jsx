import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, KeyRound, Eye, EyeOff, Lock, Check, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmailLinkSection from '@/components/student/EmailLinkSection';
import GroupSelector from '@/components/student/GroupSelector';

const AVATAR_EMOJIS = [
  '🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄',
  '🐲', '🦋', '🌟', '🚀', '⚽', '🎨', '🎵', '📚',
  '🦈', '🐧', '🦉', '🐝', '🌈', '🎮', '🏆', '💎',
  '🔥', '⚡', '🍕', '🌍', '🎯', '🧩', '🤖', '👾',
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

  return (
    <div className="space-y-6">
      {/* Info de perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-purple-500" />
          Mi perfil
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-slate-500">Nombre de usuario</Label>
            <p className="text-lg font-semibold text-slate-800 mt-1">@{username}</p>
            <p className="text-xs text-slate-400 mt-0.5">El nombre de usuario no se puede modificar</p>
          </div>
          <div>
            <Label className="text-slate-500">Nombre</Label>
            <p className="text-base font-medium text-slate-700 mt-1">{studentInfo?.display_name}</p>
          </div>
          <div>
            <Label className="text-slate-500">Grupo</Label>
            <p className="text-base font-medium text-slate-700 mt-1">{studentInfo?.group_name}</p>
          </div>
        </div>
      </motion.div>

      {/* Selector de avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-800 mb-4">Imagen de perfil</h3>
        <div className="mb-5">
          <p className="text-sm text-slate-600 font-medium mb-2">Vista previa</p>
          <div className={`relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r ${selectedColor} pl-1.5 pr-3.5 pt-1.5 pb-3 w-fit overflow-hidden`}>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <span className="text-lg leading-none">{selectedEmoji}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-white leading-tight drop-shadow-sm">{studentInfo?.display_name || 'Alumno'}</span>
              <span className="text-[10px] font-bold text-white/90 leading-tight bg-white/15 px-1.5 py-px rounded-full mt-0.5">Nv.1</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/15 rounded-b-2xl overflow-hidden">
              <div className="h-full bg-white/40 rounded-b-2xl w-1/3" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-slate-500 text-xs font-semibold mb-2 block">Emoji</Label>
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

        <div className="mb-4">
          <Label className="text-slate-500 text-xs font-semibold mb-2 block">Color del panel</Label>
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
        </div>

        {hasChanges && (
          <Button
            onClick={handleSaveAvatar}
            disabled={savingEmoji}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
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
    const { data } = await supabase.rpc('student_get_my_groups', { p_student_id: student.id });
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
