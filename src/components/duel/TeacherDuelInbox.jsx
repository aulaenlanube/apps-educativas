import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Clock, Loader2, CheckCircle2, Trash2, RefreshCw, GraduationCap } from 'lucide-react';
import { teacherGetMyDuels, teacherVoidDuel } from '@/services/duelService';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { useToast } from '@/components/ui/use-toast';
import { toastError } from '@/lib/supabaseErrors';
import { DashButton, DashEmpty } from '@/components/dashboard/kit';
import '@/pages/dashboard/teacherPanels.css';
import './teacherDuel.css';

const STATUS_META = {
  pending:     { label: 'Esperando',     icon: Clock,        cls: 'tp-chip--amber' },
  accepted:    { label: 'Aceptado',      icon: CheckCircle2, cls: 'tp-chip--emerald' },
  in_progress: { label: 'En curso',      icon: Loader2,      cls: 'tp-chip--blue' },
};

export default function TeacherDuelInbox({ open, onClose, onCreateClick }) {
  const { toast } = useToast();
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await teacherGetMyDuels();
      setOutgoing(Array.isArray(d?.outgoing) ? d.outgoing : []);
    } catch (e) {
      toast(toastError(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { if (open) reload(); }, [open, reload]);

  async function cancel(duelId) {
    setCancelling(duelId);
    try {
      await teacherVoidDuel({ duelId, reason: 'cancelled' });
      await reload();
      toast({ title: 'Duelo cancelado' });
    } catch (e) {
      toast(toastError(e));
    } finally {
      setCancelling(null);
    }
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="tp-root tp-modal"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="tp-modal__panel tp-modal__panel--sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tp-duel-inbox-title"
            onClick={e => e.stopPropagation()}
          >
            <header className="tp-dhead tp-dhead--duel">
              <div className="tp-dhead__row">
                <span className="tp-dhead__icon"><Swords size={26} /></span>
                <div className="tp-dhead__text">
                  <h2 id="tp-duel-inbox-title" className="tp-dhead__title">Mis duelos</h2>
                  <p className="tp-dhead__sub">Retos amistosos a tus alumnos</p>
                </div>
              </div>
              <div className="tp-dhead__tools">
                <button type="button" onClick={reload} className="tp-iconbtn tp-iconbtn--glass" title="Recargar" aria-label="Recargar">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button type="button" onClick={onClose} className="tp-iconbtn tp-iconbtn--glass" title="Cerrar" aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="tp-dbody">
              {loading ? (
                <div className="tp-center"><span className="tp-spin" /></div>
              ) : outgoing.length === 0 ? (
                <DashEmpty
                  title="No tienes duelos en curso"
                  action={(
                    <DashButton variant="rose" icon={Swords} onClick={() => { onClose?.(); onCreateClick?.(); }}>
                      Retar a un alumno
                    </DashButton>
                  )}
                >
                  Reta a un alumno para empezar uno amistoso.
                </DashEmpty>
              ) : (
                <div className="tp-duelrows">
                  {outgoing.map(d => {
                    const meta = STATUS_META[d.status] || STATUS_META.pending;
                    const Icon = meta.icon;
                    return (
                      <div key={d.duel_id} className="tp-duelrow">
                        <div className="tp-duelrow__vs">
                          <span className="tp-duelrow__me" title="Tú"><GraduationCap size={22} /></span>
                          <span className="tp-duelrow__x" aria-hidden="true"><Swords size={12} /></span>
                          <UserAvatar
                            selectedAvatarCode={d.opponent?.selected_avatar_code}
                            avatarEmoji={d.opponent?.emoji}
                            avatarColor={d.opponent?.color}
                            size="md"
                          />
                        </div>
                        <div className="tp-duelrow__body">
                          <div className="tp-duelrow__top">
                            <p className="tp-duelrow__name">vs {d.opponent?.name || 'Alumno'}</p>
                            <span className={`tp-chip ${meta.cls}`}>
                              <Icon size={12} className={d.status === 'in_progress' ? 'animate-spin' : ''} />
                              {meta.label}
                            </span>
                          </div>
                          <div className="tp-duelrow__meta">
                            {hasAppIcon(d.app_id) && <AppIcon appId={d.app_id} size={22} />}
                            <span>{d.app_name} · amistoso</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancel(d.duel_id)}
                          disabled={cancelling === d.duel_id}
                          className="tp-iconbtn tp-iconbtn--ghost"
                          title="Cancelar duelo"
                        >
                          {cancelling === d.duel_id ? <span className="tp-spin tp-spin--sm" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {outgoing.length > 0 && (
              <footer className="tp-dfoot">
                <DashButton
                  variant="rose"
                  icon={Swords}
                  onClick={() => { onClose?.(); onCreateClick?.(); }}
                  style={{ width: '100%' }}
                >
                  Retar a otro alumno
                </DashButton>
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
