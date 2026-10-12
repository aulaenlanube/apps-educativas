import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Trash2, RefreshCw, Trophy, Clock, Crown, EyeOff, Users, HelpCircle, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashCard } from '@/components/dashboard/kit';
import './teacherPanels.css';

const DUEL_STATUS_LABEL = {
  pending:     { label: 'Pendiente',   tone: 'amber' },
  accepted:    { label: 'Aceptado',    tone: 'blue' },
  in_progress: { label: 'En curso',    tone: 'violet' },
  finished:    { label: 'Terminado',   tone: 'emerald' },
  void:        { label: 'Anulado',     tone: 'slate' },
  rejected:    { label: 'Rechazado',   tone: 'rose' },
};

const ACTIVE_STATUSES = ['pending', 'accepted', 'in_progress'];

function formatDateTime(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function stakeLabel(stake) {
  const n = Number(stake);
  if (n === 0) return 'Amistoso';
  return `Apuesta ${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Luchador de una tarjeta VS (avatar + nombre + papel en el duelo).
function Fighter({ player, side, isWinner, isLoser, role }) {
  return (
    <div className={`tp-fighter ${side === 'right' ? 'tp-fighter--right' : ''} ${isWinner ? 'is-winner' : ''} ${isLoser ? 'is-loser' : ''}`}>
      <span className="tp-fighter__av">
        <UserAvatar
          avatarEmoji={player?.emoji}
          avatarColor={player?.color}
          selectedAvatarCode={player?.selected_avatar_code}
          size="md"
        />
        {isWinner && <span className="tp-crown" aria-hidden="true"><Crown size={13} /></span>}
      </span>
      <span className="tp-fighter__name">
        {player?.name || '—'}
        <span className="tp-fighter__tag">{isWinner ? 'Ganador' : role}</span>
      </span>
    </div>
  );
}

// Podio de una batalla: 2º · 1º · 3º.
function Podium({ battle }) {
  const top = Array.isArray(battle.players) ? battle.players.slice(0, 3) : [];
  const slots = [[top[1], 2], [top[0], 1], [top[2], 3]];
  if (top.length === 0) return null;
  return (
    <div className="tp-podium">
      {slots.map(([p, pos]) => (p ? (
        <div
          key={`${battle.room_code}-${p.rank}`}
          className={`tp-podium__slot tp-podium__slot--${pos} ${p.in_group ? '' : 'is-out'}`}
          title={p.in_group ? undefined : 'No es de este grupo'}
        >
          <span className="tp-podium__av">
            <UserAvatar avatarEmoji={p.avatar_emoji} size={pos === 1 ? 'md' : 'sm'} />
            <span className={`tp-medal tp-medal--${pos}`}>{p.rank}</span>
          </span>
          <span className="tp-podium__name">{p.display_name}</span>
          <span className="tp-podium__step">{p.rank}º</span>
        </div>
      ) : (
        <div key={`ghost-${pos}`} className="tp-podium__slot"><span className="tp-podium__ghost" /></div>
      )))}
    </div>
  );
}

export default function GroupMatchesPanel({ groupId, groupName }) {
  const { toast } = useToast();
  const [duels, setDuels] = useState([]);
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState(null); // { kind: 'duel'|'battle', id }

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const [dRes, bRes] = await Promise.all([
      supabase.rpc('teacher_get_group_duels',   { p_group_id: groupId }),
      supabase.rpc('teacher_get_group_battles', { p_group_id: groupId }),
    ]);
    setDuels(dRes.data?.duels || []);
    setBattles(bRes.data?.battles || []);
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (toDelete.kind === 'duel') {
      const { data, error } = await supabase.rpc('teacher_delete_duel', { p_duel_id: toDelete.id });
      if (error || data?.error) {
        toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      } else {
        toast({ title: 'Duelo eliminado', description: 'Se han retirado sus puntos del ranking.' });
      }
    } else {
      const { data, error } = await supabase.rpc('teacher_delete_battle', { p_room_code: toDelete.id });
      if (error || data?.error) {
        toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
      } else {
        toast({ title: 'Batalla eliminada', description: `Retirados ${data?.affected_students || 0} alumnos.` });
      }
    }
    setToDelete(null);
    load();
  };

  const deleteLabel = useMemo(() => {
    if (!toDelete) return '';
    return toDelete.kind === 'duel'
      ? 'Esto borrará el duelo, sus rondas y los puntos (ganados o perdidos) que generó en las notas de ambos alumnos. La XP e insignias ya otorgadas se conservan.'
      : 'Esto borrará la batalla, todas sus respuestas y el bonus de podio aplicado a las notas de los alumnos. La XP e insignias ya otorgadas se conservan.';
  }, [toDelete]);

  const activeDuels = duels.filter(d => ACTIVE_STATUSES.includes(d.status)).length;
  const hiddenDuels = duels.filter(d => d.is_hidden).length;
  const summary = [
    { icon: Swords, value: duels.length, label: 'Duelos', tone: 'violet' },
    { icon: Flame, value: activeDuels, label: 'Activos', tone: 'rose' },
    { icon: EyeOff, value: hiddenDuels, label: 'De tarea', tone: 'slate' },
    { icon: Zap, value: battles.length, label: 'Batallas', tone: 'amber' },
  ];

  return (
    <DashCard
      as={motion.section}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tp-root"
      icon={Trophy}
      tone="amber"
      title={`Duelos y batallas de ${groupName || 'este grupo'}`}
      subtitle="La arena del grupo: retos 1 vs 1 y podios de las batallas"
      actions={(
        <button type="button" className="tp-iconbtn" onClick={load} disabled={loading} title="Recargar" aria-label="Recargar">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      )}
    >
      <div className="tp-arena__summary">
        {summary.map(s => (
          <span key={s.label} className={`tp-chipstat dk-tone-${s.tone}`}>
            <span className="tp-chipstat__icon"><s.icon size={17} /></span>
            <span>
              <span className="tp-chipstat__value">{s.value}</span>
              <span className="tp-chipstat__label">{s.label}</span>
            </span>
          </span>
        ))}
      </div>

      <div className="tp-arena__cols">
        {/* Duelos */}
        <section className="dk-tone-violet">
          <h4 className="tp-arena__head"><Swords size={18} /> Duelos ({duels.length})</h4>
          {duels.length === 0 ? (
            <div className="tp-arena__empty"><Swords size={28} />Ningún duelo aún.</div>
          ) : (
            <div className="tp-arena__list">
              {duels.map(d => {
                const winnerName = d.winner_id === d.challenger?.id ? d.challenger?.name
                                 : d.winner_id === d.opponent?.id   ? d.opponent?.name
                                 : null;
                const st = DUEL_STATUS_LABEL[d.status] || { label: d.status, tone: 'slate' };
                const chWins = !!winnerName && d.winner_id === d.challenger?.id;
                const opWins = !!winnerName && d.winner_id === d.opponent?.id;
                return (
                  <article key={d.id} className={`tp-vs ${d.status === 'in_progress' ? 'is-live' : ''}`}>
                    <div className="tp-vs__fighters">
                      <Fighter player={d.challenger} side="left" role="Retador" isWinner={chWins} isLoser={opWins} />
                      <span className="tp-vs__badge" aria-hidden="true"><span>VS</span></span>
                      <Fighter player={d.opponent} side="right" role="Rival" isWinner={opWins} isLoser={chWins} />
                    </div>
                    <div className="tp-vs__meta">
                      <span className={`tp-chip tp-chip--${st.tone}`}>{st.label}</span>
                      {d.is_hidden && <span className="tp-chip tp-chip--dark"><EyeOff size={11} /> Oculto</span>}
                      <span className="tp-vs__app">
                        {hasAppIcon(d.app_id) && <AppIcon appId={d.app_id} size={22} />}
                        {d.app_name}
                      </span>
                      <span>{stakeLabel(d.stake)}</span>
                      <span className="tp-vs__time"><Clock size={12} /> {formatDateTime(d.created_at)}</span>
                      <button
                        type="button"
                        onClick={() => setToDelete({ kind: 'duel', id: d.id })}
                        className="tp-iconbtn tp-iconbtn--ghost tp-vs__del"
                        title="Eliminar duelo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Batallas */}
        <section className="dk-tone-amber">
          <h4 className="tp-arena__head"><Zap size={18} /> Batallas ({battles.length})</h4>
          {battles.length === 0 ? (
            <div className="tp-arena__empty"><Zap size={28} />Ninguna batalla aún.</div>
          ) : (
            <div className="tp-arena__list">
              {battles.map(b => (
                <article key={b.room_code} className="tp-battle">
                  <div className="tp-battle__head">
                    <span className="tp-battle__code">#{b.room_code}</span>
                    {b.term && <span className="tp-chip tp-chip--pink">{b.term}ª ev.</span>}
                    <span className="tp-chip tp-chip--slate"><Users size={11} /> {b.group_player_count}/{b.player_count} del grupo</span>
                  </div>
                  <div className="tp-battle__meta">
                    <span><HelpCircle size={12} /> {b.total_questions} preg.</span>
                    <span><Clock size={12} /> {formatDateTime(b.created_at)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToDelete({ kind: 'battle', id: b.room_code })}
                    className="tp-iconbtn tp-iconbtn--ghost tp-battle__del"
                    title="Eliminar batalla"
                  >
                    <Trash2 size={16} />
                  </button>
                  <Podium battle={b} />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent className="tp-root tp-alert">
          <AlertDialogHeader>
            <span className="tp-alert__icon"><Trash2 size={24} /></span>
            <AlertDialogTitle className="tp-alert__title">¿Eliminar {toDelete?.kind === 'duel' ? 'duelo' : 'batalla'}?</AlertDialogTitle>
            <AlertDialogDescription className="tp-alert__desc">{deleteLabel}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="tp-alert__foot">
            <AlertDialogCancel className="tp-alert__cancel">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="tp-alert__ok">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashCard>
  );
}
