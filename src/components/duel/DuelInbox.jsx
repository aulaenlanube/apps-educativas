// Arena de duelos del alumno (Resumen de /mi-panel) — rediseño 2026.
// Cada duelo es una carta "VS" (tú contra tu rival, con avatares) con el juego,
// lo que hay en juego y sus acciones. Solo presentación: aceptar, rechazar,
// entrar y mostrar identidad llaman a los mismos servicios que antes.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swords, EyeOff, Eye, Check, X, ArrowRight, Clock, Lock, Gamepad2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { acceptDuel, rejectDuel, setDuelReveal } from '@/services/duelService';
import { useToast } from '@/components/ui/use-toast';
import UserAvatar from '@/components/ui/UserAvatar';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashCard, DashButton, Pill } from '@/components/dashboard/kit';
import './DuelInbox.css';

function stakeLabel(n) {
  return `${(+n).toFixed(1).replace('.', ',')} pt`;
}

function statusLabel(s) {
  return {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    in_progress: 'En curso',
  }[s] || s;
}

export default function DuelInbox({ duels, onChange }) {
  const { student } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const [revealBusy, setRevealBusy] = useState(null);

  const { incoming = [], outgoing = [] } = duels || {};
  if (incoming.length === 0 && outgoing.length === 0) return null;

  async function handleAccept(duelId) {
    setBusy(duelId);
    try {
      await acceptDuel({ studentId: student.id, sessionToken: student.session_token, duelId });
      onChange?.();
      navigate(`/duelo/${duelId}`);
    } finally { setBusy(null); }
  }

  async function handleReject(duelId) {
    setBusy(duelId);
    try {
      await rejectDuel({ studentId: student.id, sessionToken: student.session_token, duelId });
      onChange?.();
    } finally { setBusy(null); }
  }

  function handleEnter(d) {
    // Duelos-tarea: bloquear fuera del horario de clase del grupo.
    if (d.is_task && d.in_class_window === false) {
      toast({
        variant: 'destructive',
        title: 'Fuera del horario de clase',
        description: 'Este duelo solo se puede jugar dentro de la franja configurada por tu profesor.',
      });
      return;
    }
    navigate(`/duelo/${d.duel_id}`);
  }

  // Cada jugador controla SU PROPIA visibilidad: al pulsar "Mostrar mi
  // identidad" se persiste en el servidor y el RIVAL te verá. Tú sigues sin
  // ver al rival hasta que el rival lo active voluntariamente.
  async function handleToggleMyReveal(d) {
    setRevealBusy(d.duel_id);
    try {
      await setDuelReveal({
        studentId: student.id,
        sessionToken: student.session_token,
        duelId: d.duel_id,
        revealed: !d.me_revealed,
      });
      onChange?.();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setRevealBusy(null);
    }
  }

  function renderCard(d, kind) {
    const isTask = !!d.is_task;
    const rival = kind === 'incoming' ? d.challenger : d.opponent;
    // El rival es visible solo si el RIVAL ha activado su reveal. Para duelos
    // personales clásicos el backend inicializa ambos flags a true, así que
    // este flujo no cambia su comportamiento.
    const rivalHidden = rival?.hidden === true || d.rival_revealed === false;
    const rivalEmoji = rivalHidden ? '🕵️' : (rival?.emoji || '🎓');
    const rivalName = rivalHidden ? 'Rival oculto' : (rival?.name || 'Rival');

    const canEnter = !(isTask && d.in_class_window === false);
    const isPending = d.status === 'pending';
    const showAcceptButtons = kind === 'incoming' && isPending && !isTask;

    const variant = isTask ? 'is-task' : kind === 'incoming' ? 'is-incoming' : 'is-outgoing';
    const tag = isTask ? 'Tarea · pendiente' : (kind === 'incoming' ? 'te reta' : statusLabel(d.status));
    const friendly = Number(d.stake) === 0;

    return (
      <motion.article
        key={d.duel_id}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.25 }}
        className={`dib-card ${variant}`}
      >
        <header className="dib-card__top">
          <span className="dib-tag">{tag}</span>
          {d.is_hidden && (
            <span title="Duelo oculto" className="dib-hiddenflag"><EyeOff size={13} /> Oculto</span>
          )}
          {!isTask && !isPending && (
            <span className="dib-stakechip">{friendly ? 'Amistoso' : `±${stakeLabel(d.stake)}`}</span>
          )}
        </header>

        {/* Tú VS rival */}
        <div className="dib-vs">
          <div className="dib-fighter is-me">
            <span className="dib-fighter__ava">
              <UserAvatar
                selectedAvatarCode={student?.selected_avatar_code}
                avatarEmoji={student?.avatar_emoji}
                avatarColor={student?.avatar_color}
                size="lg"
                shape="rounded"
                showRarityBorder={false}
              />
            </span>
            <strong className="dib-fighter__name">Tú</strong>
          </div>

          <div className={`dib-vs__mark ${showAcceptButtons || isTask ? 'is-hot' : ''}`} aria-label="contra">
            <span>VS</span>
          </div>

          <div className={`dib-fighter is-rival ${rivalHidden ? 'is-hidden' : ''}`}>
            <span className="dib-fighter__ava">
              {rivalHidden ? (
                <span className="dib-mystery" aria-hidden="true">
                  <span className="dib-mystery__emoji">{rivalEmoji}</span>
                  <span className="dib-mystery__q">?</span>
                </span>
              ) : (
                <UserAvatar
                  selectedAvatarCode={rival?.selected_avatar_code}
                  avatarEmoji={rivalEmoji}
                  avatarColor={rival?.color}
                  size="lg"
                  shape="rounded"
                  showRarityBorder={false}
                />
              )}
            </span>
            <strong className="dib-fighter__name" title={rivalName}>
              {kind === 'outgoing' && !rivalHidden ? `vs ${rivalName}` : rivalName}
            </strong>
            {d.rival_is_teacher && !rivalHidden && (
              <span className="dib-teacher"><GraduationCap size={12} /> Profe</span>
            )}
          </div>
        </div>

        {/* Juego */}
        <div className="dib-game">
          {d.app_id && hasAppIcon(d.app_id)
            ? <AppIcon appId={d.app_id} size={34} />
            : <span className="dib-game__fallback"><Gamepad2 size={17} /></span>}
          <span className="dib-game__name">{d.app_name}</span>
          {d.best_of > 1 && <span className="dib-game__bo">al mejor de {d.best_of}</span>}
        </div>

        {/* Aviso clásico de duelo personal pendiente */}
        {isPending && !isTask && kind === 'incoming' && (
          <div className="dib-info">
            <div className="dib-info__stake">
              <span>En juego</span>
              <strong>{friendly ? 'Amistoso' : `±${stakeLabel(d.stake)}`}</strong>
            </div>
            <p>
              {friendly ? (
                <>Duelo <strong>amistoso</strong>: el resultado no afecta a la nota de ninguno. Decide si aceptas el reto.</>
              ) : (
                <>
                  Si <strong>ganas</strong> sumas <strong className="is-win">+{stakeLabel(d.stake)}</strong> a tu nota.
                  Si <strong>pierdes</strong> restas <strong className="is-lose">−{stakeLabel(d.stake)}</strong>.
                  Decide si aceptas el reto.
                </>
              )}
            </p>
          </div>
        )}

        {/* Reto enviado, a la espera de que el rival acepte */}
        {isPending && !isTask && kind === 'outgoing' && (
          <div className="dib-info">
            <div className="dib-info__stake">
              <span>En juego</span>
              <strong>{friendly ? 'Amistoso' : `±${stakeLabel(d.stake)}`}</strong>
            </div>
            <p>
              <strong>Reto enviado.</strong> En cuanto tu rival lo acepte podréis entrar a jugar.
            </p>
          </div>
        )}

        {isTask && (
          <div className="dib-info">
            <div className="dib-info__stake">
              <span>Tarea</span>
              <strong>+0,10</strong>
            </div>
            <p>
              Tienes un <strong>duelo pendiente</strong> asignado por tu profesor. Si <strong>ganas</strong> sumas <strong className="is-win">+0,10</strong> a tu bonus de duelos; si pierdes, <strong>sin penalización</strong>.
              {d.in_class_window === false && (
                <> <br /><span className="dib-info__warn">Solo se puede jugar dentro del horario de clase.</span></>
              )}
            </p>
          </div>
        )}

        <footer className="dib-card__foot">
          {/* Toggle propio: solo relevante cuando el duelo empieza oculto
              (tarea o personal con is_hidden). Para personales visibles
              me_revealed ya viene true y no mostramos el botón. */}
          {(isTask || d.is_hidden) && (
            <button
              type="button"
              onClick={() => handleToggleMyReveal(d)}
              disabled={revealBusy === d.duel_id}
              title={d.me_revealed
                ? 'Tu rival puede verte. Pulsa para volver a ocultarte.'
                : 'Tu rival no sabe quién eres. Pulsa para mostrarle tu identidad.'}
              className={`dib-reveal ${d.me_revealed ? 'is-on' : ''}`}
            >
              {d.me_revealed ? <Eye size={14} /> : <EyeOff size={14} />}
              {d.me_revealed ? 'Mi rival me ve' : 'Mostrar mi identidad'}
            </button>
          )}

          <div className="dib-card__actions">
            {showAcceptButtons ? (
              <>
                <DashButton
                  size="sm"
                  variant="emerald"
                  icon={Check}
                  onClick={() => handleAccept(d.duel_id)}
                  disabled={busy === d.duel_id}
                  title="Aceptar"
                >
                  Aceptar
                </DashButton>
                <DashButton
                  size="sm"
                  variant="glass"
                  icon={X}
                  onClick={() => handleReject(d.duel_id)}
                  disabled={busy === d.duel_id}
                  title="Rechazar"
                >
                  Rechazar
                </DashButton>
              </>
            ) : kind === 'outgoing' && isPending && !isTask ? (
              <span className="dib-waiting">
                <span className="dib-waiting__dot" aria-hidden="true" />
                <Clock size={14} /> esperando
              </span>
            ) : (
              <DashButton
                size="sm"
                variant={canEnter ? 'amber' : 'glass'}
                onClick={() => handleEnter(d)}
                disabled={!canEnter}
                title={canEnter ? 'Entrar al duelo' : 'Fuera del horario de clase'}
              >
                {canEnter
                  ? (<>Entrar <ArrowRight size={15} /></>)
                  : (<><Lock size={14} /> Fuera de horario</>)}
              </DashButton>
            )}
          </div>
        </footer>
      </motion.article>
    );
  }

  const total = incoming.length + outgoing.length;

  return (
    <DashCard
      icon={Swords}
      tone="rose"
      className="dib"
      title="Arena de duelos"
      subtitle="Retos 1 vs 1 con tu clase"
      actions={(
        <Pill tone={incoming.length ? 'accent' : 'soft'}>
          {total} activo{total !== 1 ? 's' : ''}
        </Pill>
      )}
    >
      <div className="dib-grid">
        <AnimatePresence>
          {incoming.map(d => renderCard(d, 'incoming'))}
          {outgoing.map(d => renderCard(d, 'outgoing'))}
        </AnimatePresence>
      </div>
    </DashCard>
  );
}
