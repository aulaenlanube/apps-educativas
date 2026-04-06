import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Mail, KeyRound, GraduationCap, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';

const AVATAR_EMOJIS = [
  '👨‍🏫', '👩‍🏫', '🦊', '🐱', '🐶', '🐼', '🦁', '🦄',
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

const ProfilePage = () => {
  const { teacher, updateTeacherProfile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(teacher?.display_name || '');
  const [bio, setBio] = useState(teacher?.bio || '');
  const [selectedEmoji, setSelectedEmoji] = useState(teacher?.avatar_emoji || '👨‍🏫');
  const [selectedColor, setSelectedColor] = useState(teacher?.avatar_color || 'from-blue-500 to-purple-500');
  const [saving, setSaving] = useState(false);

  const hasAvatarChanges = selectedEmoji !== (teacher?.avatar_emoji || '👨‍🏫') || selectedColor !== (teacher?.avatar_color || 'from-blue-500 to-purple-500');
  const hasProfileChanges = displayName.trim() !== (teacher?.display_name || '') || bio.trim() !== (teacher?.bio || '');

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre no puede estar vacio' });
      return;
    }

    setSaving(true);
    const updates = {
      display_name: displayName.trim(),
      bio: bio.trim(),
      avatar_emoji: selectedEmoji,
      avatar_color: selectedColor,
    };
    const { error } = await updateTeacherProfile(updates);
    setSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Perfil actualizado' });
    }
  };

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  return (
    <div>
      <Header subtitle="Mi Perfil" />

      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">

          {/* Avatar y color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6"
          >
            <h3 className="text-base font-bold text-slate-800 mb-4">Imagen de perfil</h3>

            {/* Vista previa */}
            <div className="mb-5">
              <p className="text-sm text-slate-600 font-medium mb-2">Vista previa</p>
              <div className={`relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r ${selectedColor} pl-1.5 pr-3.5 py-1.5 w-fit overflow-hidden`}>
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="text-lg leading-none">{selectedEmoji}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-white leading-tight drop-shadow-sm">{displayName || teacher?.display_name}</span>
                  <span className="text-[10px] font-bold text-white/90 leading-tight bg-white/15 px-1.5 py-px rounded-full mt-0.5">Nv.1</span>
                </div>
              </div>
            </div>

            {/* Selector emoji */}
            <div className="mb-4">
              <Label className="text-slate-500 text-xs font-semibold mb-2 block">Emoji</Label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl p-2 rounded-xl transition-all ${
                      selectedEmoji === emoji ? 'bg-purple-100 ring-2 ring-purple-400 scale-110' : 'hover:bg-slate-100'
                    }`}
                  >{emoji}</button>
                ))}
              </div>
            </div>

            {/* Selector color */}
            <div>
              <Label className="text-slate-500 text-xs font-semibold mb-2 block">Color del panel</Label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_COLORS.map(color => (
                  <button key={color.id} type="button" onClick={() => setSelectedColor(color.id)}
                    className={`relative h-10 rounded-xl transition-all ${
                      selectedColor === color.id ? 'ring-2 ring-offset-2 ring-purple-400 scale-105' : 'hover:scale-105'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                    title={color.label}
                  >
                    {selectedColor === color.id && <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Datos del perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-5"
          >
            <h3 className="text-base font-bold text-slate-800">Datos del perfil</h3>

            {/* Info no editable */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {teacher?.email}
              </div>
              <button onClick={handleCopyCode}
                className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 transition-colors">
                <KeyRound className="w-4 h-4" />
                {teacher?.teacher_code}
              </button>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nombre</Label>
              <Input id="profile-name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre completo" />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Sobre mi</Label>
              <textarea id="profile-bio" value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Cuentanos algo sobre ti..."
                rows={4} maxLength={500}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
            </div>

            {/* Guardar */}
            <Button onClick={handleSaveProfile} disabled={saving || (!hasProfileChanges && !hasAvatarChanges)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {saving ? 'Guardando...' : <><Save className="w-4 h-4 mr-2" /> Guardar cambios</>}
            </Button>
          </motion.div>

          {/* Info codigo */}
          <div className="bg-white/60 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700">Tu codigo de profesor: <span className="text-purple-700 font-bold">{teacher?.teacher_code}</span></p>
                <p className="mt-1">Comparte este codigo con tus alumnos para que puedan iniciar sesion en la plataforma.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
