import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Sparkles, X, Trophy, Award, Star, Gem, Crown, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAvatarCollection } from '@/hooks/useAvatarCollection';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { rarityMeta, RarityBadge } from '@/components/ui/UserAvatar';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/utils';

const RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'common'];

// Estilos para las mini-cards de progreso por rareza (orden ascendente para la barra).
const RARITY_PROGRESS_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const RARITY_PROGRESS = {
  common:    { label: 'Comunes',     icon: Award, ring: '#94a3b8', glow: '#cbd5e1', from: 'from-slate-400',  to: 'to-slate-500' },
  rare:      { label: 'Raros',       icon: Star,  ring: '#3b82f6', glow: '#60a5fa', from: 'from-blue-400',   to: 'to-indigo-500' },
  epic:      { label: 'Épicos',      icon: Gem,   ring: '#a855f7', glow: '#c084fc', from: 'from-purple-500', to: 'to-fuchsia-500' },
  legendary: { label: 'Legendarios', icon: Crown, ring: '#f59e0b', glow: '#fbbf24', from: 'from-amber-400',  to: 'to-orange-500' },
  mythic:    { label: 'Míticos',     icon: Flame, ring: '#ef4444', glow: '#f87171', from: 'from-rose-500',   to: 'to-pink-500' },
};

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
    { value: 'all',       label: `Todos (${totalCount})` },
    { value: 'owned',     label: `Desbloqueados (${ownedCount})` },
    { value: 'locked',    label: `Bloqueados (${totalCount - ownedCount})` },
    { value: 'mythic',    label: 'Míticos' },
    { value: 'legendary', label: 'Legendarios' },
    { value: 'epic',      label: 'Épicos' },
    { value: 'rare',      label: 'Raros' },
    { value: 'common',    label: 'Comunes' },
  ];

  return (
    <div className="space-y-4">
      {/* Cabecera con stats globales + desglose por rareza */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl"
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 22%, rgba(255,255,255,0.4) 0%, transparent 45%), radial-gradient(circle at 88% 80%, rgba(255,200,255,0.3) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
                className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow" />
              </motion.div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/70">Tu colección</p>
                <p className="text-base font-black leading-tight">Progreso de avatares</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="text-right">
                <div className="flex items-baseline gap-1 justify-end">
                  <AnimatedNumber value={ownedCount} className="text-3xl font-black drop-shadow tabular-nums" />
                  <span className="text-lg font-bold text-white/70">/{totalCount}</span>
                </div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">
                  {totalCount - ownedCount} por desbloquear
                </p>
              </div>
              {!isTeacherMode && (
                <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 border border-white/20 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-white/80 font-bold">Bonus nota</p>
                  <p className="text-xl font-black tabular-nums">+{totalBonus.toFixed(2)}</p>
                  <p className="text-[9px] text-white/70">tope +0,5</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Barra global */}
          <div className="mb-1">
            <div className="flex items-center justify-between text-xs text-white/85 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-semibold">{Math.round(overallPct)}% completado</span>
              </span>
              <span className="text-white/60 tabular-nums">{ownedCount} de {totalCount}</span>
            </div>
            <div className="relative w-full h-3 bg-white/15 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
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
          </div>

          {/* Mini-cards por rareza */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {RARITY_PROGRESS_ORDER.map((r, i) => {
              const cfg = RARITY_PROGRESS[r];
              const stats = rarityStats[r] || { earned: 0, total: 0 };
              const Icon = cfg.icon;
              const pct = stats.total > 0 ? (stats.earned / stats.total) * 100 : 0;
              const complete = stats.total > 0 && stats.earned === stats.total;
              const active = filter === r;
              return (
                <motion.button
                  key={r}
                  type="button"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter((prev) => (prev === r ? 'all' : r))}
                  className="group relative overflow-hidden rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 p-3 text-left transition-colors"
                  style={{
                    boxShadow: complete
                      ? `0 0 22px ${cfg.glow}80, inset 0 0 0 1.5px ${cfg.ring}`
                      : active
                        ? `inset 0 0 0 1.5px ${cfg.ring}`
                        : undefined,
                  }}
                >
                  <div
                    className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${cfg.ring}` }}
                  />

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cfg.from} ${cfg.to} flex items-center justify-center shadow-md`}
                      style={{ boxShadow: `0 0 12px ${cfg.glow}66` }}
                    >
                      <Icon className="w-3.5 h-3.5 text-white drop-shadow" />
                    </div>
                    <p className="text-[10px] uppercase font-black tracking-wider text-white/85 truncate">{cfg.label}</p>
                    <AnimatePresence>
                      {complete && (
                        <motion.span
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 350 }}
                          className="ml-auto text-yellow-300"
                          title="¡Categoría completa!"
                        >
                          <Sparkles className="w-3.5 h-3.5 drop-shadow" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber value={stats.earned} className="text-xl font-black tabular-nums drop-shadow" />
                    <span className="text-xs font-bold text-white/60">/ {stats.total}</span>
                    <span className="ml-auto text-[10px] font-bold text-white/70 tabular-nums">{Math.round(pct)}%</span>
                  </div>

                  <div className="mt-1.5 h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.55 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${cfg.ring}, ${cfg.glow})` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'text-xs font-bold rounded-full px-3 py-1.5 border transition-colors',
              filter === f.value
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Volver a emoji */}
      {selectedAvatarCode && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs">
          <span className="text-amber-800 font-medium">
            Tienes un avatar especial equipado. Si quieres, vuelve al emoji clásico.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRevertToEmoji}
            disabled={busyCode === '__null'}
          >
            Usar emoji
          </Button>
        </div>
      )}

      {/* Grupos por rareza */}
      {loading && <div className="text-center py-10 text-slate-500">Cargando colección…</div>}
      {!loading && grouped.length === 0 && (
        <div className="text-center py-10 text-slate-500">Sin avatares para este filtro.</div>
      )}

      {grouped.map(([rarity, list]) => (
        <section key={rarity} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <RarityBadge rarity={rarity} size="lg" />
            <span className="text-xs text-slate-500">{list.length} avatares</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 items-stretch">
            {list.map((item) => (
              <AvatarCard
                key={item.code}
                item={item}
                onClick={() => setDetail(item)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Modal detalle */}
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
      </AnimatePresence>
    </div>
  );
}

function AvatarCard({ item, onClick }) {
  const meta = rarityMeta(item.rarity);
  const locked = !item.owned;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative group bg-white rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-lg transition-all text-left h-full flex flex-col"
      style={{ borderColor: item.selected ? meta.ring : 'transparent' }}
    >
      {/* Imagen — siempre cuadrada para ancho consistente */}
      <div className="relative aspect-square bg-slate-100 flex-shrink-0">
        <img
          src={item.image_md}
          alt={item.title}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-all',
            locked && 'grayscale brightness-50',
          )}
        />
        {/* Borde rareza superpuesto */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 3px ${meta.ring}` }}
        />
        {/* Overlay locked */}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        )}
        {/* Equipped */}
        {item.selected && (
          <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
            <Check className="w-3 h-3" />
          </div>
        )}
        {/* Bonus chip */}
        <div
          className="absolute bottom-1.5 left-1.5 text-[10px] font-black rounded-full px-2 py-0.5 text-white shadow"
          style={{ background: `linear-gradient(135deg, ${meta.ring}, ${meta.glow})` }}
        >
          +{Number(item.points_bonus).toFixed(1)}
        </div>
      </div>
      {/* Texto — flex-1 para igualar altura entre tarjetas */}
      <div className="p-2 flex-1 flex flex-col justify-between gap-1.5 min-h-[68px]">
        {locked ? (
          <>
            {item.unlock_label ? (
              <p className="text-[10px] text-slate-600 font-medium leading-tight line-clamp-2">
                {item.unlock_label}
              </p>
            ) : (
              <span />
            )}
            <div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${item.pct || 0}%`,
                    background: `linear-gradient(90deg, ${meta.ring}, ${meta.glow})`,
                  }}
                />
              </div>
              <p className="text-[9px] text-slate-500 tabular-nums mt-1">
                {item.progress}/{item.target}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Desbloqueado
            </p>
            {item.unlock_label ? (
              <p className="text-[10px] text-slate-500 italic leading-tight line-clamp-2">
                {item.unlock_label}
              </p>
            ) : (
              <span />
            )}
          </>
        )}
      </div>
    </motion.button>
  );
}

function DetailModal({ item, onClose, onSelect, busy, isTeacherMode }) {
  const meta = rarityMeta(item.rarity);
  const locked = !item.owned;
  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Imagen grande con borde rareza */}
        <div className="relative">
          <img
            src={item.image_lg}
            alt={item.title}
            className={cn('w-full aspect-square object-cover', locked && 'grayscale brightness-50')}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 6px ${meta.ring}` }}
          />
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-16 h-16 text-white drop-shadow-2xl" />
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-end gap-2">
            <RarityBadge rarity={item.rarity} size="lg" />
          </div>
          <p className="text-base text-slate-700 italic leading-relaxed">{item.description}</p>

          {!isTeacherMode && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-800">
                Aporta <span className="text-amber-600">+{Number(item.points_bonus).toFixed(2)}</span> a tu nota media
              </span>
            </div>
          )}

          {locked ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{item.unlock_label || 'Cómo desbloquearlo'}</span>
                <span className="tabular-nums">{item.progress}/{item.target}</span>
              </div>
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${item.pct || 0}%`,
                    background: `linear-gradient(90deg, ${meta.ring}, ${meta.glow})`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Sigue jugando: el avatar se desbloqueará automáticamente cuando completes el reto.
              </p>
            </div>
          ) : null}

          {!locked && item.unlock_label && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800">
                <span className="font-bold">Conseguido:</span>{' '}
                <span className="italic">{item.unlock_label}</span>
              </div>
            </div>
          )}

          {!locked && (
            <Button
              onClick={() => onSelect(item.code)}
              disabled={busy || item.selected}
              className={cn(
                'w-full text-white font-bold',
                item.selected
                  ? 'bg-emerald-500 hover:bg-emerald-500'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700',
              )}
            >
              {item.selected ? '✓ Equipado' : busy ? 'Equipando…' : 'Equipar'}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
