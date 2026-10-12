// Galería de avatares coleccionables (alumno y docente) — rediseño 2026.
// Resumen de la colección con contadores por rareza (que filtran), cartas de
// coleccionista con marco/brillo por rareza, estado equipado, barras de
// progreso para desbloquear y ficha de detalle en un portal.
// API: <AvatarGallery onSelected={fn} mode="student|teacher" />
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Sparkles, X, Trophy, Award, Star, Gem, Crown, Flame, LayoutGrid, Unlock, Smile, Target, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAvatarCollection } from '@/hooks/useAvatarCollection';
import { useToast } from '@/components/ui/use-toast';
import { rarityMeta } from '@/components/ui/UserAvatar';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/utils';
import './AvatarGallery.css';

const RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'common'];

// Estilos para los contadores por rareza (orden ascendente).
const RARITY_PROGRESS_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const RARITY_PROGRESS = {
  common:    { label: 'Comunes',     icon: Award },
  rare:      { label: 'Raros',       icon: Star },
  epic:      { label: 'Épicos',      icon: Gem },
  legendary: { label: 'Legendarios', icon: Crown },
  mythic:    { label: 'Míticos',     icon: Flame },
};

const fmtBonus = (v) => Number(v || 0).toFixed(2).replace('.', ',');

export default function AvatarGallery({ onSelected, mode = 'student' }) {
  const { student, updateStudentLocal, teacher, updateTeacherLocal } = useAuth();
  const { items, loading, refresh, ownedCount, totalCount, totalBonus } = useAvatarCollection(mode);
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [busyCode, setBusyCode] = useState(null);
  const isTeacherMode = mode === 'teacher';
  const selectedAvatarCode = isTeacherMode
    ? teacher?.selected_avatar_code
    : student?.selected_avatar_code;

  const filtered = useMemo(() => {
    let list = items;
    if (filter === 'owned') list = list.filter((i) => i.owned);
    else if (filter === 'locked') list = list.filter((i) => !i.owned);
    else if (filter !== 'all') list = list.filter((i) => i.rarity === filter);
    return list;
  }, [items, filter]);

  const rarityStats = useMemo(() => {
    const map = Object.fromEntries(RARITY_PROGRESS_ORDER.map((r) => [r, { earned: 0, total: 0 }]));
    for (const it of items) {
      if (!map[it.rarity]) map[it.rarity] = { earned: 0, total: 0 };
      map[it.rarity].total += 1;
      if (it.owned) map[it.rarity].earned += 1;
    }
    return map;
  }, [items]);
  const overallPct = totalCount > 0 ? (ownedCount / totalCount) * 100 : 0;

  const grouped = useMemo(() => {
    const map = new Map();
    RARITY_ORDER.forEach((r) => map.set(r, []));
    filtered.forEach((i) => {
      if (!map.has(i.rarity)) map.set(i.rarity, []);
      map.get(i.rarity).push(i);
    });
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [filtered]);

  const equippedItem = useMemo(() => items.find((i) => i.code === selectedAvatarCode) || null, [items, selectedAvatarCode]);

  const handleSelect = async (code) => {
    setBusyCode(code);
    let data, error;
    if (isTeacherMode) {
      if (!teacher?.id) { setBusyCode(null); return; }
      ({ data, error } = await supabase.rpc('teacher_avatar_select', { p_code: code }));
    } else {
      if (!student?.id || !student?.session_token) { setBusyCode(null); return; }
      ({ data, error } = await supabase.rpc('avatar_select', {
        p_student_id: student.id,
        p_session_token: student.session_token,
        p_code: code,
      }));
    }
    setBusyCode(null);
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      return;
    }
    if (isTeacherMode) {
      updateTeacherLocal({ selected_avatar_code: code });
    } else {
      updateStudentLocal({ selected_avatar_code: code });
    }
    toast({ title: 'Avatar equipado' });
    setDetail(null);
    refresh();
    onSelected?.(code);
  };

  const handleRevertToEmoji = async () => {
    setBusyCode('__null');
    let data, error;
    if (isTeacherMode) {
      if (!teacher?.id) { setBusyCode(null); return; }
      ({ data, error } = await supabase.rpc('teacher_avatar_select', { p_code: null }));
    } else {
      if (!student?.id || !student?.session_token) { setBusyCode(null); return; }
      ({ data, error } = await supabase.rpc('avatar_select', {
        p_student_id: student.id,
        p_session_token: student.session_token,
        p_code: null,
      }));
    }
    setBusyCode(null);
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      return;
    }
    if (isTeacherMode) {
      updateTeacherLocal({ selected_avatar_code: null });
    } else {
      updateStudentLocal({ selected_avatar_code: null });
    }
    toast({ title: 'Volviste al emoji' });
    refresh();
    onSelected?.(null);
  };

  const FILTERS = [
    { value: 'all',       label: 'Todos',         count: totalCount,              icon: LayoutGrid },
    { value: 'owned',     label: 'Desbloqueados', count: ownedCount,              icon: Unlock },
    { value: 'locked',    label: 'Bloqueados',    count: totalCount - ownedCount, icon: Lock },
  ];

  return (
    <div className="agl">
      {/* ── Resumen de la colección ── */}
      <motion.div
        className="agl-summary"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="agl-summary__top">
          <div className="agl-summary__ring" style={{ '--p': overallPct / 100 }}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="43" className="agl-summary__track" />
              <circle cx="50" cy="50" r="43" className="agl-summary__arc" pathLength="1" />
            </svg>
            <span className="agl-summary__pct">{Math.round(overallPct)}%</span>
          </div>
          <div className="agl-summary__text">
            <span className="agl-kicker"><Sparkles size={13} /> Tu colección</span>
            <div className="agl-summary__count">
              <AnimatedNumber value={ownedCount} className="agl-summary__num" />
              <span>/{totalCount}</span>
              <em>personajes</em>
            </div>
            <span className="agl-summary__sub">{totalCount - ownedCount} por desbloquear</span>
          </div>
          {!isTeacherMode && (
            <div className="agl-bonus" title="Suma de los avatares desbloqueados (tope +0,5)">
              <Trophy size={18} />
              <span className="agl-bonus__label">Bonus nota</span>
              <strong>+{fmtBonus(totalBonus)}</strong>
              <span className="agl-bonus__cap">tope +0,5</span>
            </div>
          )}
        </div>

        {/* Contadores por rareza (filtran) */}
        <div className="agl-rarities">
          {RARITY_PROGRESS_ORDER.map((r) => {
            const cfg = RARITY_PROGRESS[r];
            const stats = rarityStats[r] || { earned: 0, total: 0 };
            const Icon = cfg.icon;
            const pct = stats.total > 0 ? (stats.earned / stats.total) * 100 : 0;
            const complete = stats.total > 0 && stats.earned === stats.total;
            const active = filter === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setFilter((prev) => (prev === r ? 'all' : r))}
                className={cn('agl-rarity', `r-${r}`, active && 'is-active', complete && 'is-complete')}
                aria-pressed={active}
              >
                <span className="agl-rarity__gem"><Icon size={15} /></span>
                <span className="agl-rarity__label">{cfg.label}</span>
                {complete && <Sparkles size={13} className="agl-rarity__done" aria-label="¡Categoría completa!" />}
                <span className="agl-rarity__nums">
                  <AnimatedNumber value={stats.earned} className="agl-rarity__num" />
                  <span>/{stats.total}</span>
                </span>
                <span className="agl-rarity__bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Filtros + avatar equipado ── */}
      <div className="agl-toolbar">
        <div className="agl-seg" role="group" aria-label="Filtrar avatares">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? 'is-active' : ''}
              aria-pressed={filter === f.value}
            >
              <f.icon size={14} /> {f.label} <span className="agl-seg__n">{f.count}</span>
            </button>
          ))}
        </div>
        {RARITY_PROGRESS[filter] && (
          <button type="button" className={`agl-active-rar r-${filter}`} onClick={() => setFilter('all')}>
            {RARITY_PROGRESS[filter].label} <X size={13} />
          </button>
        )}
      </div>

      {/* Volver a emoji */}
      {selectedAvatarCode && (
        <div className={cn('agl-equipped', equippedItem && `r-${equippedItem.rarity}`)}>
          {equippedItem && (
            <img className="agl-equipped__img" src={equippedItem.image_sm || equippedItem.image_md} alt="" />
          )}
          <span className="agl-equipped__text">
            <strong>{equippedItem ? `Llevas equipado: ${equippedItem.title}` : 'Tienes un avatar especial equipado.'}</strong>
            <span>Si quieres, vuelve al emoji clásico.</span>
          </span>
          <button
            type="button"
            className="agl-btn agl-btn--soft"
            onClick={handleRevertToEmoji}
            disabled={busyCode === '__null'}
          >
            <Smile size={15} /> Usar emoji
          </button>
        </div>
      )}

      {/* ── Grupos por rareza ── */}
      {loading && <div className="agl-state">Cargando colección…</div>}
      {!loading && grouped.length === 0 && (
        <div className="agl-state">Sin avatares para este filtro.</div>
      )}

      {grouped.map(([rarity, list]) => {
        const cfg = RARITY_PROGRESS[rarity] || { label: rarity, icon: Award };
        const Icon = cfg.icon;
        const st = rarityStats[rarity] || { earned: 0, total: 0 };
        return (
          <section key={rarity} className={`agl-group r-${rarity}`}>
            <header className="agl-group__head">
              <span className="agl-group__gem"><Icon size={16} /></span>
              <h4 className="agl-group__title">{cfg.label}</h4>
              <span className="agl-group__count">{st.earned}/{st.total} desbloqueados</span>
              <span className="agl-group__line" aria-hidden="true" />
              <span className="agl-group__n">{list.length} avatares</span>
            </header>
            <div className="agl-grid">
              {list.map((item) => (
                <AvatarCard
                  key={item.code}
                  item={item}
                  onClick={() => setDetail(item)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Modal detalle */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {detail && (
            <DetailModal
              item={detail}
              onClose={() => setDetail(null)}
              onSelect={handleSelect}
              busy={busyCode === detail.code}
              isTeacherMode={isTeacherMode}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

function AvatarCard({ item, onClick }) {
  const locked = !item.owned;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('agl-card', `r-${item.rarity || 'common'}`, locked ? 'is-locked' : 'is-owned', item.selected && 'is-equipped')}
      title={item.title}
    >
      <span className="agl-card__frame">
        <span className="agl-card__art">
          <img src={item.image_md} alt={item.title} loading="lazy" />
          {!locked && <span className="agl-card__holo" aria-hidden="true" />}
          {locked && (
            <span className="agl-card__lock"><Lock size={18} /></span>
          )}
          {item.selected && (
            <span className="agl-card__equipped"><Check size={12} /> Equipado</span>
          )}
          <span className="agl-card__bonus">+{Number(item.points_bonus).toFixed(1)}</span>
        </span>
      </span>
      <span className="agl-card__body">
        <span className="agl-card__title">{item.title}</span>
        {locked ? (
          <>
            {item.unlock_label ? <span className="agl-card__req">{item.unlock_label}</span> : <span />}
            <span className="agl-card__progress">
              <span className="agl-card__bar"><i style={{ transform: `scaleX(${Math.max(0, Math.min(100, item.pct || 0)) / 100})` }} /></span>
              <span className="agl-card__nums">{item.progress}/{item.target}</span>
            </span>
          </>
        ) : (
          <span className="agl-card__ok"><Check size={12} /> Desbloqueado</span>
        )}
      </span>
    </button>
  );
}

function DetailModal({ item, onClose, onSelect, busy, isTeacherMode }) {
  const meta = rarityMeta(item.rarity);
  const locked = !item.owned;
  const pct = Math.max(0, Math.min(100, item.pct || 0));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const earnedDate = !locked && item.earned_at
    ? new Date(item.earned_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <motion.div
      className={`agl-modal r-${item.rarity || 'common'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="agl-modal__backdrop" aria-hidden="true" />
      <motion.div
        className="agl-modal__card"
        initial={{ scale: 0.86, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="agl-modal__close" aria-label="Cerrar">
          <X size={18} />
        </button>

        {/* Imagen grande con marco por rareza */}
        <div className={cn('agl-modal__stage', locked && 'is-locked')}>
          <span className="agl-modal__rays" aria-hidden="true" />
          <motion.div
            className="agl-modal__frame"
            initial={{ rotate: -4, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.05 }}
          >
            <img src={item.image_lg} alt={item.title} />
            {!locked && <span className="agl-card__holo" aria-hidden="true" />}
            {locked && (
              <span className="agl-modal__lock"><Lock size={40} /></span>
            )}
          </motion.div>
        </div>

        <div className="agl-modal__info">
          <div className="agl-modal__tags">
            <span className="agl-modal__rarity">{meta.label}</span>
            {item.selected && <span className="agl-modal__tag is-good"><Check size={12} /> Equipado</span>}
            {locked && <span className="agl-modal__tag"><Lock size={12} /> Bloqueado</span>}
          </div>
          <h3 className="agl-modal__title">{item.title}</h3>
          {item.description && <p className="agl-modal__desc">{item.description}</p>}

          {!isTeacherMode && (
            <div className="agl-modal__bonus">
              <Trophy size={16} />
              <span>
                Aporta <strong>+{Number(item.points_bonus).toFixed(2)}</strong> a tu nota media
              </span>
            </div>
          )}

          {locked ? (
            <div className="agl-modal__quest">
              <div className="agl-modal__quest-top">
                <Target size={15} />
                <span>{item.unlock_label || 'Cómo desbloquearlo'}</span>
                <strong>{item.progress}/{item.target}</strong>
              </div>
              <span className="agl-modal__bar"><i style={{ transform: `scaleX(${pct / 100})` }} /></span>
              <p>Sigue jugando: el avatar se desbloqueará automáticamente cuando completes el reto.</p>
            </div>
          ) : null}

          {!locked && (item.unlock_label || earnedDate) && (
            <div className="agl-modal__done">
              <Check size={16} />
              <div>
                {item.unlock_label && (<><strong>Conseguido:</strong> <span>{item.unlock_label}</span></>)}
                {earnedDate && <span className="agl-modal__date"><CalendarDays size={12} /> {earnedDate}</span>}
              </div>
            </div>
          )}

          {!locked && (
            <button
              type="button"
              onClick={() => onSelect(item.code)}
              disabled={busy || item.selected}
              className={cn('agl-btn agl-btn--lg', item.selected ? 'agl-btn--done' : 'agl-btn--primary')}
            >
              {item.selected ? '✓ Equipado' : busy ? 'Equipando…' : 'Equipar'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
