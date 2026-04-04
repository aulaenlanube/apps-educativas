import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, KeyRound, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AVATAR_EMOJIS = [
  '🎓', '🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄',
  '🐲', '🦋', '🌟', '🚀', '⚽', '🎨', '🎵', '📚',
  '🦈', '🐧', '🦉', '🐝', '🌈', '🎮', '🏆', '💎',
  '🔥', '⚡', '🍕', '🌍', '🎯', '🧩', '🤖', '👾',
];

export default function StudentProfileEditor({ student, studentInfo, onProfileUpdated }) {
  const { toast } = useToast();
  const [selectedEmoji, setSelectedEmoji] = useState(studentInfo?.avatar_emoji || '🎓');
  const [savingEmoji, setSavingEmoji] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const username = student?.username || '';

  const handleSaveEmoji = async () => {
    if (selectedEmoji === studentInfo?.avatar_emoji) return;
    setSavingEmoji(true);

    const { data, error } = await supabase.rpc('student_update_profile', {
      p_student_id: student.id,
      p_group_id: student.group_id,
      p_avatar_emoji: selectedEmoji,
    });

    setSavingEmoji(false);

    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      // Actualizar localStorage
      const saved = JSON.parse(localStorage.getItem('student_session') || '{}');
      saved.avatar_emoji = selectedEmoji;
      localStorage.setItem('student_session', JSON.stringify(saved));

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
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{selectedEmoji}</span>
          <div>
            <p className="text-sm text-slate-600 font-medium">Elige tu avatar</p>
            <p className="text-xs text-slate-400">Selecciona un emoji de la lista</p>
          </div>
        </div>
        <div className="grid grid-cols-8 gap-2 mb-4">
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
        {selectedEmoji !== studentInfo?.avatar_emoji && (
          <Button
            onClick={handleSaveEmoji}
            disabled={savingEmoji}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            <Check className="w-4 h-4 mr-1" />
            {savingEmoji ? 'Guardando...' : 'Guardar avatar'}
          </Button>
        )}
      </motion.div>

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
