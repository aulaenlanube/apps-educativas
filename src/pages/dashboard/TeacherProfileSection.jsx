import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Mail, KeyRound, GraduationCap, Check, Trophy, Calendar, Sparkles, Award, Shield, Globe, School,
  BookOpen, Copy, Smile, User, Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/components/ui/use-toast';
import { sanitizePlainText } from '@/lib/sanitize';
import UserAvatar, { rarityMeta } from '@/components/ui/UserAvatar';
import AvatarGallery from '@/components/avatar/AvatarGallery';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';
import TeacherDuelPhrasesEditor from '@/components/duel/TeacherDuelPhrasesEditor';
import { DashCard, DashButton, XPBar } from '@/components/dashboard/kit';
import './teacherPanels.css';

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

// Cuerpo del perfil del docente: hero, selector de avatar emoji+color, galería
// de avatares especiales y formulario de datos. Se monta tanto en
// `/perfil` (ProfilePage) como en `/dashboard?tab=perfil` (DashboardPage).
const TeacherProfileSection = () => {
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
  const [timezone, setTimezone] = useState(teacher?.timezone || 'Europe/Madrid');
  const [saving, setSaving] = useState(false);

  const TIMEZONE_OPTIONS = (() => {
    try {
      const all = Intl.supportedValuesOf('timeZone');
      return Array.isArray(all) && all.length ? all : null;
    } catch {
      return null;
    }
  })() || [
    'Europe/Madrid', 'Atlantic/Canary', 'Europe/Lisbon', 'Europe/London',
    'Europe/Paris', 'Europe/Berlin', 'America/Argentina/Buenos_Aires',
    'America/Mexico_City', 'America/Bogota', 'America/Santiago', 'America/Lima',
  ];

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
    timezone !== (teacher?.timezone || 'Europe/Madrid') ||
    JSON.stringify([...educationLevels].sort()) !== JSON.stringify([...(teacher?.education_levels || [])].sort());

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  const selectedColorObj = AVATAR_COLORS.find(c => c.id === selectedColor) || AVATAR_COLORS[0];

  const { byCode } = useAvatarCatalog();
  const equippedAvatar = teacher?.selected_avatar_code ? byCode(teacher.selected_avatar_code) : null;
  const rMeta = equippedAvatar ? rarityMeta(equippedAvatar.rarity) : null;

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
        timezone,
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
  const saveDisabled = saving || (!hasProfileChanges && !hasAvatarChanges);
  const heroBio = equippedAvatar ? (bio ? `"${bio}"` : equippedAvatar.description) : (bio ? `"${bio}"` : null);

  return (
    <div className="tp-root tp-prof">
      {/* HERO: avatar grande + datos principales */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tp-prof-hero"
      >
        {equippedAvatar ? (
          // Avatar especial: fondo técnico oscuro con el brillo de su rareza
          <div
            className="tp-prof-hero__bg"
            style={{
              background: `radial-gradient(circle at 18% 35%, ${rMeta.glow}44 0%, transparent 55%), radial-gradient(circle at 85% 75%, ${rMeta.ring}33 0%, transparent 60%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)`,
            }}
          />
        ) : (
          // Avatar clásico: el color elegido pinta todo el héroe
          <div className={`tp-prof-hero__bg bg-gradient-to-br ${selectedColor}`} />
        )}
        <span className="tp-prof-hero__grid" aria-hidden="true" />
        <span className="tp-prof-hero__ring" aria-hidden="true" />
        <span className="tp-glasschip tp-prof-hero__role"><Shield size={14} /> {roleLabel}</span>

        <div className="tp-prof-hero__inner">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            {equippedAvatar ? (
              <div className="tp-prof-hero__special">
                <UserAvatar
                  selectedAvatarCode={teacher.selected_avatar_code}
                  size="hero"
                  shape="rounded"
                  showRarityBorder
                  showRarityGlow
                />
              </div>
            ) : (
              <div className={`tp-prof-hero__emoji bg-gradient-to-br ${selectedColor}`}>
                <span>{selectedEmoji}</span>
              </div>
            )}
          </motion.div>

          <div className="tp-prof-hero__text">
            {equippedAvatar && (
              <div className="tp-prof-hero__tags">
                <span
                  className="tp-prof-hero__rarity"
                  style={{ background: `linear-gradient(135deg, ${rMeta.ring}, ${rMeta.glow})` }}
                >
                  {rMeta.label}
                </span>
                <span className="tp-prof-hero__avtitle">{equippedAvatar.title}</span>
              </div>
            )}
            <h1 className="tp-prof-hero__name">{displayName || teacher?.display_name || 'Sin nombre'}</h1>
            {heroBio && <p className="tp-prof-hero__bio">{heroBio}</p>}

            <div className="tp-prof-hero__chips">
              <button type="button" onClick={handleCopyCode} className="tp-glasschip tp-glasschip--gold" title="Copiar código">
                <KeyRound size={14} /> {teacher?.teacher_code} <Copy size={13} />
              </button>
              <span className="tp-glasschip"><Trophy size={14} /> Nivel {level}</span>
              <span className="tp-glasschip"><Sparkles size={14} /> {totalXp.toLocaleString()} XP</span>
              <span className="tp-glasschip"><Award size={14} /> {totalEarned}/{totalAvailable} insignias</span>
              <span className="tp-glasschip"><Calendar size={14} /> Desde {formatDate(teacher?.created_at)}</span>
            </div>

            <XPBar value={xpInLevel} max={xpNeeded} level={level} label={`Nivel ${level} · ${xpProgress}% hacia el ${level + 1}`} />
          </div>
        </div>
      </motion.section>

      {/* Colección de avatares especiales */}
      <DashCard
        icon={Sparkles}
        tone="violet"
        title="Tu colección de avatares"
        subtitle="Desbloquea avatares valorando apps, publicando comentarios, ganando insignias o subiendo de nivel. Si equipas uno, reemplazará al emoji clásico."
      >
        <AvatarGallery mode="teacher" />
      </DashCard>

      {/* Personalización del avatar clásico (emoji) — sólo se usa si no hay
          ningún avatar especial equipado, por eso va después de la colección. */}
      <DashCard
        icon={Smile}
        tone="pink"
        title="Avatar clásico (emoji)"
        subtitle="Si no tienes ningún avatar especial equipado, se mostrará este emoji con su color de fondo."
      >
        <div className="tp-classic">
          <div className="tp-classic__preview">
            <div className={`tp-classic__tile bg-gradient-to-br ${selectedColor}`}>
              <span>{selectedEmoji}</span>
            </div>
            <span className="tp-classic__cap">
              {equippedAvatar ? 'En reserva: tienes un avatar especial equipado' : 'Así te verán'}
            </span>
          </div>

          <div className="tp-field">
            <span className="tp-label">Emoji</span>
            <div className="tp-emojis">
              {AVATAR_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`tp-emoji ${selectedEmoji === emoji ? 'is-on' : ''}`}
                  aria-pressed={selectedEmoji === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="tp-field">
            <span className="tp-label">Color del panel</span>
            <div className="tp-swatches">
              {AVATAR_COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={`tp-swatch ${selectedColor === color.id ? 'is-on' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                  title={color.label}
                  aria-pressed={selectedColor === color.id}
                >
                  {selectedColor === color.id && <Check size={20} />}
                </button>
              ))}
            </div>
            <p className="tp-help">Color actual: <strong>{selectedColorObj.label}</strong></p>
          </div>
        </div>
      </DashCard>

      {/* Frases para duelos (al final del bloque de avatar/colección) */}
      <TeacherDuelPhrasesEditor />

      {/* Datos del perfil */}
      <DashCard icon={User} tone="indigo" title="Datos del perfil" subtitle="Lo que ven tus alumnos y el resto de docentes">
        <div className="tp-fields">
          <div className="tp-field tp-field--full">
            <label className="tp-label" htmlFor="profile-name"><User size={14} /> Nombre para mostrar</label>
            <input
              id="profile-name"
              className="tp-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Tu nombre completo"
              maxLength={MAX_DISPLAY_NAME}
            />
          </div>

          <div className="tp-field tp-field--full">
            <label className="tp-label" htmlFor="profile-bio"><Sparkles size={14} /> Sobre mí</label>
            <textarea
              id="profile-bio"
              className="tp-textarea"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Cuéntanos algo sobre ti, tu asignatura, tus aficiones..."
              rows={3}
              maxLength={MAX_BIO}
            />
            <span className="tp-count">{bio.length}/{MAX_BIO}</span>
          </div>

          <div className="tp-field">
            <label className="tp-label" htmlFor="profile-center"><School size={14} /> Centro educativo</label>
            <input
              id="profile-center"
              className="tp-input"
              value={centerName}
              onChange={e => setCenterName(e.target.value)}
              placeholder="Nombre del centro"
              maxLength={MAX_SHORT}
            />
          </div>

          <div className="tp-field">
            <label className="tp-label" htmlFor="profile-specialty"><BookOpen size={14} /> Especialidad</label>
            <input
              id="profile-specialty"
              className="tp-input"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              placeholder="Ej: Lengua, Matematicas, Musica..."
              maxLength={MAX_SHORT}
            />
          </div>

          <div className="tp-field">
            <label className="tp-label" htmlFor="profile-website"><Globe size={14} /> Web personal</label>
            <input
              id="profile-website"
              className="tp-input"
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://mi-web.com"
              maxLength={MAX_WEBSITE}
            />
          </div>

          {/* Zona horaria (afecta al horario de clase de tus grupos) */}
          <div className="tp-field">
            <label className="tp-label" htmlFor="profile-timezone"><Clock size={14} /> Zona horaria</label>
            <select
              id="profile-timezone"
              className="tp-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="tp-help">Se usa para aplicar las horas de clase que configures en tus grupos.</p>
          </div>

          {/* Etapas educativas */}
          <div className="tp-field tp-field--full">
            <span className="tp-label"><GraduationCap size={14} /> Etapas educativas</span>
            <p className="tp-help">Selecciona las etapas en las que impartes clase</p>
            <div className="tp-toggles">
              {EDUCATION_LEVELS.map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => toggleLevel(lvl.id)}
                  className={`tp-toggle ${educationLevels.includes(lvl.id) ? 'is-on' : ''}`}
                  aria-pressed={educationLevels.includes(lvl.id)}
                >
                  {educationLevels.includes(lvl.id) && <Check size={14} />}
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datos no editables */}
        <div className="tp-facts" style={{ marginTop: 18 }}>
          <div className="tp-fact">
            <span className="tp-fact__icon"><Mail size={16} /></span>
            <div style={{ minWidth: 0 }}>
              <p className="tp-fact__label">Email</p>
              <p className="tp-fact__value">{teacher?.email}</p>
            </div>
          </div>
          <div className="tp-fact">
            <span className="tp-fact__icon"><Calendar size={16} /></span>
            <div style={{ minWidth: 0 }}>
              <p className="tp-fact__label">Miembro desde</p>
              <p className="tp-fact__value">{formatDate(teacher?.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <DashButton
          size="lg"
          icon={saving ? undefined : Save}
          onClick={handleSaveProfile}
          disabled={saveDisabled}
          style={{ width: '100%', marginTop: 18 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </DashButton>
      </DashCard>

      {/* Info codigo */}
      <DashCard icon={KeyRound} tone="amber" title="Tu código de profesor">
        <div className="tp-codebox">
          <span className="tp-codebox__code">{teacher?.teacher_code}</span>
          <DashButton variant="soft" size="sm" icon={Copy} onClick={handleCopyCode}>Copiar</DashButton>
          <p className="tp-codebox__text">Comparte este código con tus alumnos para que puedan iniciar sesión en la plataforma.</p>
        </div>
      </DashCard>

      {/* Barra flotante con cambios sin guardar */}
      {(hasProfileChanges || hasAvatarChanges) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="tp-savebar"
        >
          <span className="tp-savebar__text"><span className="tp-savebar__dot" /> Tienes cambios sin guardar</span>
          <DashButton icon={saving ? undefined : Save} onClick={handleSaveProfile} disabled={saveDisabled}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </DashButton>
        </motion.div>
      )}
    </div>
  );
};

export default TeacherProfileSection;
