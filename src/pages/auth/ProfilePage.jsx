import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Mail, KeyRound, GraduationCap, Check, Trophy, Calendar, Sparkles, Award, Shield, Globe, School, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import { sanitizePlainText } from '@/lib/sanitize';

// Limites acordes con la BD (defensa en profundidad; la RPC debe truncar tambien).
const MAX_DISPLAY_NAME = 80;
const MAX_BIO = 500;
const MAX_WEBSITE = 200;
const MAX_SHORT = 80;

const AVATAR_EMOJIS = [
  '👨‍🏫', '👩‍🏫', '🦊', '🐱', '🐶', '🐼', '🦁', '🦄',
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

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
};

const ProfilePage = () => {
  const { teacher, updateTeacherProfile } = useAuth();
  const { totalXp, level, xpForCurrentLevel, xpForNextLevel, totalEarned, totalAvailable } = useGamification();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(teacher?.display_name || '');
  const [bio, setBio] = useState(teacher?.bio || '');
  const [website, setWebsite] = useState(teacher?.website || '');
  const [specialty, setSpecialty] = useState(teacher?.specialty || '');
  const [centerName, setCenterName] = useState(teacher?.center_name || '');
  const [educationLevels, setEducationLevels] = useState(teacher?.education_levels || []);
  const [selectedEmoji, setSelectedEmoji] = useState(teacher?.avatar_emoji || '👨‍🏫');
  const [selectedColor, setSelectedColor] = useState(teacher?.avatar_color || 'from-blue-500 to-purple-500');
  const [saving, setSaving] = useState(false);

  const EDUCATION_LEVELS = [
    { id: 'infantil', label: 'Infantil' },
    { id: 'primaria', label: 'Primaria' },
    { id: 'secundaria', label: 'Secundaria (ESO)' },
    { id: 'bachillerato', label: 'Bachillerato' },
    { id: 'fp', label: 'FP' },
    { id: 'universidad', label: 'Universidad' },
  ];

  const toggleLevel = (levelId) => {
    setEducationLevels(prev =>
      prev.includes(levelId) ? prev.filter(l => l !== levelId) : [...prev, levelId]
    );
  };

  const hasAvatarChanges = selectedEmoji !== (teacher?.avatar_emoji || '👨‍🏫') || selectedColor !== (teacher?.avatar_color || 'from-blue-500 to-purple-500');
  const hasProfileChanges =
    displayName.trim() !== (teacher?.display_name || '') ||
    bio.trim() !== (teacher?.bio || '') ||
    website.trim() !== (teacher?.website || '') ||
    specialty.trim() !== (teacher?.specialty || '') ||
    centerName.trim() !== (teacher?.center_name || '') ||
    JSON.stringify([...educationLevels].sort()) !== JSON.stringify([...(teacher?.education_levels || [])].sort());

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  const selectedColorObj = AVATAR_COLORS.find(c => c.id === selectedColor) || AVATAR_COLORS[0];

  const handleSaveProfile = async () => {
    const cleanDisplayName = sanitizePlainText(displayName, MAX_DISPLAY_NAME);
    if (!cleanDisplayName) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre no puede estar vacio' });
      return;
    }

    setSaving(true);
    try {
      const updates = {
        display_name: cleanDisplayName,
        bio: sanitizePlainText(bio, MAX_BIO),
        website: sanitizePlainText(website, MAX_WEBSITE),
        specialty: sanitizePlainText(specialty, MAX_SHORT),
        center_name: sanitizePlainText(centerName, MAX_SHORT),
        education_levels: educationLevels,
        avatar_emoji: selectedEmoji,
        avatar_color: selectedColor,
      };
      const { error } = await updateTeacherProfile(updates);

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
        toast({ title: 'Perfil actualizado' });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Error inesperado' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  const roleLabel = teacher?.role === 'admin' ? 'Administrador' : teacher?.role === 'free' ? 'Usuario libre' : 'Docente';

  return (
    <div>
      <Header subtitle="Mi Perfil" />

      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

          {/* HERO CARD: Avatar grande + datos principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-lg border border-purple-100 overflow-hidden"
          >
            {/* Banner de fondo con nombre */}
            <div
              className={`h-40 sm:h-44 bg-gradient-to-r ${selectedColor} relative overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                }}
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                <Shield className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold text-white">{roleLabel}</span>
              </div>
              {/* Nombre sobre el banner */}
              <div className="absolute bottom-3 left-48 sm:left-52 right-4">
                <h1 className="text-3xl sm:text-4xl font-black text-white truncate drop-shadow-lg">
                  {displayName || teacher?.display_name || 'Sin nombre'}
                </h1>
                {bio && (
                  <p className="text-sm text-white/80 mt-1 italic truncate drop-shadow">"{bio}"</p>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 -mt-20 relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar grande */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0"
                >
                  <div
                    className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${selectedColor} flex items-center justify-center shadow-2xl border-4 border-white relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)',
                      }}
                    />
                    <span className="text-8xl leading-none drop-shadow-lg relative">{selectedEmoji}</span>
                  </div>
                </motion.div>

                {/* Chips */}
                <div className="flex-1 min-w-0 pt-2 sm:pt-24">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full px-3 py-1.5 text-xs font-bold transition-colors border border-purple-200"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {teacher?.teacher_code}
                    </button>
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-xs font-bold border border-amber-200">
                      <Trophy className="w-3.5 h-3.5" /> Nivel {level}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1.5 text-xs font-bold border border-indigo-200">
                      <Sparkles className="w-3.5 h-3.5" /> {totalXp.toLocaleString()} XP
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-xs font-bold border border-emerald-200">
                      <Award className="w-3.5 h-3.5" /> {totalEarned}/{totalAvailable} insignias
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 rounded-full px-3 py-1.5 text-xs font-bold border border-slate-200">
                      <Calendar className="w-3.5 h-3.5" /> Desde {formatDate(teacher?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra XP */}
              <div className="mt-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm font-black">
                      {level}
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Nivel actual</p>
                      <p className="text-sm font-bold">Nivel {level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Progreso</p>
                    <p className="text-sm font-bold">{xpInLevel} / {xpNeeded} XP</p>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personalización del avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6"
          >
            <h3 className="text-base font-bold text-slate-800 mb-1">Personaliza tu avatar</h3>
            <p className="text-xs text-slate-500 mb-5">Elige un emoji y un color que te representen. Verás los cambios en la vista previa de arriba.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector emoji */}
              <div>
                <Label className="text-slate-500 text-xs font-semibold mb-2 block uppercase tracking-wide">Emoji</Label>
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
                <Label className="text-slate-500 text-xs font-semibold mb-2 block uppercase tracking-wide">Color del panel</Label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button key={color.id} type="button" onClick={() => setSelectedColor(color.id)}
                      className={`relative h-12 rounded-xl transition-all ${
                        selectedColor === color.id ? 'ring-2 ring-offset-2 ring-purple-400 scale-105' : 'hover:scale-105'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                      title={color.label}
                    >
                      {selectedColor === color.id && <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow" />}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Color actual: <span className="font-semibold">{selectedColorObj.label}</span></p>
              </div>
            </div>
          </motion.div>

          {/* Datos del perfil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-5"
          >
            <h3 className="text-base font-bold text-slate-800">Datos del perfil</h3>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nombre para mostrar</Label>
              <Input id="profile-name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre completo" maxLength={MAX_DISPLAY_NAME} />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Sobre mi</Label>
              <textarea id="profile-bio" value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Cuéntanos algo sobre ti, tu asignatura, tus aficiones..."
                rows={3} maxLength={MAX_BIO}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{bio.length}/{MAX_BIO}</p>
            </div>

            {/* Web personal */}
            <div className="space-y-2">
              <Label htmlFor="profile-website" className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                Web personal
              </Label>
              <Input
                id="profile-website"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://mi-web.com"
                maxLength={MAX_WEBSITE}
              />
            </div>

            {/* Centro educativo + Especialidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-center" className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-purple-500" />
                  Centro educativo
                </Label>
                <Input
                  id="profile-center"
                  value={centerName}
                  onChange={e => setCenterName(e.target.value)}
                  placeholder="Nombre del centro"
                  maxLength={MAX_SHORT}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-specialty" className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Especialidad
                </Label>
                <Input
                  id="profile-specialty"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  placeholder="Ej: Lengua, Matematicas, Musica..."
                  maxLength={MAX_SHORT}
                />
              </div>
            </div>

            {/* Etapas educativas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                Etapas educativas
              </Label>
              <p className="text-xs text-slate-400">Selecciona las etapas en las que impartes clase</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {EDUCATION_LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => toggleLevel(lvl.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      educationLevels.includes(lvl.id)
                        ? 'bg-purple-100 text-purple-700 border-purple-300 ring-1 ring-purple-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {educationLevels.includes(lvl.id) && <Check className="w-3 h-3 inline mr-1" />}
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Datos no editables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Email</p>
                  <p className="truncate">{teacher?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Miembro desde</p>
                  <p className="truncate">{formatDate(teacher?.created_at)}</p>
                </div>
              </div>
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
                <p className="font-medium text-gray-700">Tu código de profesor: <span className="text-purple-700 font-bold">{teacher?.teacher_code}</span></p>
                <p className="mt-1">Comparte este código con tus alumnos para que puedan iniciar sesión en la plataforma.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
