// Pestaña "Perfil" del alumno — rediseño 2026.
// Ficha de jugador (avatar, nivel, XP) + índice de secciones + tarjetas del
// kit: galería de personajes, frases de duelo, avatar clásico (emoji),
// calidad gráfica, contraseña, email y grupos. Solo presentación: las RPC y
// los manejadores son los de siempre.
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Lock, Check, Users, Trophy, Sparkles, Award, Zap, Smile, Settings2, MessageSquare, Mail, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/components/ui/use-toast';
import EmailLinkSection from '@/components/student/EmailLinkSection';
import GroupSelector from '@/components/student/GroupSelector';
import UserAvatar, { rarityMeta } from '@/components/ui/UserAvatar';
import AvatarGallery from '@/components/avatar/AvatarGallery';
import DuelPhrasesEditor from '@/components/duel/DuelPhrasesEditor';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { DashCard, LevelShield, XPBar, DashButton } from '@/components/dashboard/kit';
import './StudentProfileEditor.css';

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

// Índice de secciones (solo navegación dentro de la pestaña).
const SECTIONS = [
  { id: 'spe-avatars', label: 'Personajes', icon: Sparkles },
  { id: 'spe-phrases', label: 'Frases', icon: MessageSquare },
  { id: 'spe-emoji', label: 'Emoji', icon: Smile },
  { id: 'spe-graphics', label: 'Gráficos', icon: Settings2 },
  { id: 'spe-password', label: 'Contraseña', icon: KeyRound },
  { id: 'spe-account', label: 'Email y grupos', icon: Mail },
];

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

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

  const displayName = studentInfo?.email_verified || student?.email_verified
    ? (studentInfo?.display_name || 'Alumno')
    : `@${username}`;
  const passwordMismatch = !!confirmPassword && newPassword !== confirmPassword;

  // Colores de la ficha: rareza del avatar equipado o el color del emoji.
  const idStyle = equippedAvatar
    ? { '--id-1': rMeta.ring, '--id-2': rMeta.glow }
    : { '--id-1': selectedColorObj.from, '--id-2': selectedColorObj.to };

  return (
    <div className="spe">
      {/* ── Ficha de jugador ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`spe-id ${equippedAvatar ? 'has-avatar' : 'is-classic'}`}
        style={idStyle}
      >
        <div className="spe-id__bg" aria-hidden="true">
          <span className="spe-id__grid" />
          <span className="spe-id__orb spe-id__orb--a" />
          <span className="spe-id__orb spe-id__orb--b" />
        </div>

        <motion.div
          className="spe-id__avatar"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          {equippedAvatar ? (
            <UserAvatar
              selectedAvatarCode={student.selected_avatar_code}
              size="hero"
              shape="rounded"
              showRarityBorder
              showRarityGlow
              className="spe-id__img"
            />
          ) : (
            <div
              className="spe-id__emoji"
              style={{ background: `linear-gradient(135deg, ${selectedColorObj.from}, ${selectedColorObj.to})` }}
            >
              <span>{selectedEmoji}</span>
            </div>
          )}
          <LevelShield level={level} />
        </motion.div>

        <div className="spe-id__main">
          <div className="spe-id__tags">
            <span className="spe-id__kicker">Ficha de jugador</span>
            {studentInfo?.group_name && (
              <span className="spe-id__tag"><Users size={13} /> {studentInfo.group_name}</span>
            )}
            {equippedAvatar && (
              <span className="spe-id__tag spe-id__tag--rar">
                <Crown size={13} /> {rMeta.label} · +{Number(equippedAvatar.points_bonus).toFixed(2)} nota
              </span>
            )}
          </div>

          <h1 className="spe-id__name">{displayName}</h1>
          {equippedAvatar ? (
            <p className="spe-id__desc">
              <strong>{equippedAvatar.title}</strong>
              {equippedAvatar.description ? ` — ${equippedAvatar.description}` : ''}
            </p>
          ) : (
            <p className="spe-id__desc">Avatar clásico. Desbloquea personajes jugando y equípalos desde tu galería.</p>
          )}


          {level >= 101 ? (
            <div className="spe-id__max"><Zap size={15} /> ¡Nivel máximo alcanzado!</div>
          ) : (
            <div className="spe-id__xp">
              <XPBar value={xpInLevel} max={xpNeeded} label={`Camino al nivel ${level + 1} · ${xpProgress}%`} />
              <span className="spe-id__left">
                <Zap size={13} /> Faltan {(xpNeeded - xpInLevel).toLocaleString('es-ES')} XP · nivel {level} de 101
              </span>
            </div>
          )}
        </div>

        <div className="spe-id__stats">
          <span className="spe-id__stat">
            <span className="spe-id__stat-icon is-amber"><Trophy size={16} /></span>
            <span><b>{level}</b><em>Nivel</em></span>
          </span>
          <span className="spe-id__stat">
            <span className="spe-id__stat-icon is-violet"><Sparkles size={16} /></span>
            <span><AnimatedNumber value={totalXp} className="spe-id__num" /><em>XP total</em></span>
          </span>
          <span className="spe-id__stat">
            <span className="spe-id__stat-icon is-emerald"><Award size={16} /></span>
            <span><b>{totalEarned}/{totalAvailable}</b><em>Insignias</em></span>
          </span>
        </div>
      </motion.section>

      {/* ── Índice de secciones ── */}
      <nav className="spe-jump" aria-label="Secciones del perfil">
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" className="spe-jump__btn" onClick={() => scrollToSection(s.id)}>
            <s.icon size={15} /> {s.label}
          </button>
        ))}
      </nav>

      {/* Galería de personajes (avatar coleccionables) */}
      <DashCard
        id="spe-avatars"
        className="spe-section"
        icon={Sparkles}
        tone="violet"
        title="Galería de personajes"
        subtitle="Desbloquea avatares jugando. Cada uno suma puntos a tu nota media (tope +0,5). Los más raros se ven sobre todo en duelo y batalla, como símbolo de estatus."
      >
        <AvatarGallery onSelected={() => onProfileUpdated?.()} />
      </DashCard>

      {/* Frases para duelos 1 vs 1 */}
      <div id="spe-phrases" className="spe-section">
        <DuelPhrasesEditor />
      </div>

      <div className="spe-split">
        {/* Personalizar avatar (emoji + color clásico) */}
        <DashCard
          id="spe-emoji"
          className="spe-section"
          icon={Smile}
          tone="amber"
          title="Avatar clásico (emoji)"
          subtitle="Si no tienes ningún avatar equipado, se mostrará este emoji con su color."
        >
          <div className="spe-emoji">
            <div className="spe-emoji__preview">
              <div
                className="spe-emoji__tile"
                style={{ background: `linear-gradient(135deg, ${selectedColorObj.from}, ${selectedColorObj.to})` }}
              >
                <span>{selectedEmoji}</span>
              </div>
              <div className="spe-emoji__meta">
                <span className="spe-label">Vista previa</span>
                <strong>{selectedColorObj.label}</strong>
                {equippedAvatar && <span className="spe-emoji__note">Ahora llevas un personaje equipado: el emoji se verá cuando vuelvas a él.</span>}
              </div>
            </div>

            {/* Selector emoji */}
            <div>
              <span className="spe-label">Emoji</span>
              <div className="spe-emoji__grid">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`spe-emoji__btn${selectedEmoji === emoji ? ' is-active' : ''}`}
                    aria-pressed={selectedEmoji === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector color */}
            <div>
              <span className="spe-label">Color del panel</span>
              <div className="spe-colors">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color.id)}
                    className={`spe-colors__btn${selectedColor === color.id ? ' is-active' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                    title={color.label}
                    aria-label={color.label}
                    aria-pressed={selectedColor === color.id}
                  >
                    {selectedColor === color.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {hasChanges && (
              <DashButton
                variant="amber"
                icon={Check}
                onClick={handleSaveAvatar}
                disabled={savingEmoji}
                className="spe-emoji__save"
              >
                {savingEmoji ? 'Guardando...' : 'Guardar avatar'}
              </DashButton>
            )}
          </div>
        </DashCard>

        <div className="spe-col">
          {/* Calidad gráfica global (se guarda por dispositivo) */}
          <DashCard
            id="spe-graphics"
            className="spe-section"
            icon={Settings2}
            tone="cyan"
            title="Calidad gráfica"
            subtitle="Se guarda en este dispositivo"
          >
            <p className="spe-text">
              Ajusta los gráficos de las apps 3D (La Fortaleza, Laboratorio de Física…) en este dispositivo.
              En Auto se adapta sola a la potencia del equipo.
            </p>
            <GraphicsQualitySelector variant="row" className="spe-gfx" />
          </DashCard>

          {/* Cambiar contraseña */}
          <DashCard
            id="spe-password"
            className="spe-section"
            icon={KeyRound}
            tone="orange"
            title="Cambiar contraseña"
            subtitle="Mínimo 4 caracteres"
          >
            <form onSubmit={handleChangePassword} className="spe-form">
              <div className="spe-field">
                <label htmlFor="current-pw" className="spe-label">Contraseña actual</label>
                <div className="spe-input">
                  <Lock size={16} className="spe-input__icon" />
                  <input
                    id="current-pw"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Tu contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="spe-input__eye"
                    aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="spe-field">
                <label htmlFor="new-pw" className="spe-label">Nueva contraseña</label>
                <div className="spe-input">
                  <Lock size={16} className="spe-input__icon" />
                  <input
                    id="new-pw"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Mínimo 4 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <div className="spe-field">
                <label htmlFor="confirm-pw" className="spe-label">Repetir nueva contraseña</label>
                <div className={`spe-input${passwordMismatch ? ' is-bad' : ''}`}>
                  <Lock size={16} className="spe-input__icon" />
                  <input
                    id="confirm-pw"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Repite la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={4}
                  />
                </div>
                {passwordMismatch && (
                  <p className="spe-error">Las contraseñas no coinciden</p>
                )}
              </div>

              <DashButton
                type="submit"
                variant="amber"
                icon={KeyRound}
                disabled={savingPassword || !currentPassword || newPassword.length < 4 || newPassword !== confirmPassword}
              >
                {savingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
              </DashButton>
            </form>
          </DashCard>
        </div>
      </div>

      {/* Vincular email + grupos */}
      <div id="spe-account" className="spe-section spe-account">
        <div className="spe-legacy">
          <EmailLinkSection
            student={student}
            studentInfo={studentInfo}
            onUpdated={onProfileUpdated}
          />
        </div>

        {/* Mis grupos (solo si tiene email verificado) */}
        {(student?.email_verified || studentInfo?.email_verified) && (
          <MyGroupsSection student={student} />
        )}
      </div>
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
    <DashCard icon={Users} tone="indigo" title="Mis grupos" subtitle="Cambia de grupo o únete a uno nuevo" className="spe-groups">
      <GroupSelector
        groups={groups}
        activeGroupId={student?.group_id || null}
        onSelect={handleSelect}
        showJoin={true}
        studentId={student.id}
        onGroupJoined={() => fetchGroups()}
      />
    </DashCard>
  );
}
