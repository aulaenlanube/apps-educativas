import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Sparkles, X, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAvatarCollection } from '@/hooks/useAvatarCollection';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { rarityMeta, RarityBadge } from '@/components/ui/UserAvatar';
import { cn } from '@/lib/utils';

const RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'common'];

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
      {/* Cabecera con stats y bonus */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-white/80">Tu colección</p>
              <p className="text-xl font-black">{ownedCount} / {totalCount} avatares</p>
            </div>
          </div>
          {!isTeacherMode && (
            <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2 border border-white/20">
              <p className="text-[10px] uppercase tracking-wider text-white/80 font-bold">Bonus en nota</p>
              <p className="text-2xl font-black tabular-nums">+{totalBonus.toFixed(2)}</p>
              <p className="text-[10px] text-white/70">tope +0,5</p>
            </div>
          )}
        </div>
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalCount ? (ownedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.6 }}
            className="h-full bg-gradient-to-r from-yellow-300 to-amber-400"
          />
        </div>
      </div>

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
