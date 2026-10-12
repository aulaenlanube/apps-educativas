import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, EyeOff, ArrowLeft, Play, Trophy, XCircle, Coins, Repeat, Activity, Radio, BookOpen, Wifi, WifiOff,
} from 'lucide-react';
import useDuelChannel from '@/hooks/useDuelChannel';
import useDuelActor from '@/hooks/useDuelActor';
import {
  getDuelState, startDuel, voidDuel,
  teacherGetDuelState, teacherStartDuel, teacherVoidDuel,
} from '@/services/duelService';
import { DUELABLE_APPS } from '@/apps/config/duelableApps';
import UserAvatar, { rarityMeta } from '@/components/ui/UserAvatar';
import { useAvatarCatalog } from '@/hooks/useAvatarCatalog';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import BrandLoader from '@/components/ui/BrandLoader';
import './DuelLobby.css';

// Instrucciones por app. Pueden extenderse libremente.
const INSTRUCTIONS = {
  'rosco-del-saber': (
    <>
      <p>Jugad por turnos. En tu turno puedes contestar la letra activa, pasar o rendirte.</p>
      <p>Cuando pasas, el turno cambia al rival y la letra vuelve al final.</p>
      <p>Gana quien tenga mas aciertos al finalizar el rosco o quien complete todas las letras primero.</p>
    </>
  ),
  'snake': (
    <>
      <p>Ambos jugareis en el mismo tablero, cada uno controla su serpiente.</p>
      <p>No chocar con el rival ni con las paredes. Si mueres, pierdes la ronda.</p>
      <p>Al mejor de 5 rondas (el primero en ganar 3, gana el duelo).</p>
    </>
  ),
  'ahorcado': (
    <>
      <p>Compartis panel y palabra. Cada uno tiene sus propias vidas.</p>
      <p>Cualquiera puede resolver la palabra cuando quiera.</p>
      <p>Al mejor de 5 rondas (el primero en ganar 3, gana el duelo).</p>
    </>
  ),
};

const COUNTDOWN_SECONDS = 3;

export default function DuelLobby() {
  const { duelId } = useParams();
  const actor = useDuelActor();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [err, setErr] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | waiting | countdown | ready | starting | voided
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const countdownStartedRef = useRef(false);

  const isTeacherActor = actor?.type === 'teacher';
  // Ruta a la que volver al cancelar/terminar el duelo (panel del rol).
  const homePath = isTeacherActor ? '/dashboard' : '/mi-panel';

  const reload = useCallback(async () => {
    if (!actor) return;
    try {
      const s = isTeacherActor
        ? await teacherGetDuelState({ duelId })
        : await getDuelState({
            studentId: actor.id, sessionToken: actor.sessionToken, duelId,
          });
      setState(s);
      if (s.status === 'void' || s.status === 'cancelled' || s.status === 'rejected') setPhase('voided');
      else if (s.status === 'finished') setPhase('finished');
    } catch (e) {
      setErr(e.message);
    }
  }, [duelId, actor, isTeacherActor]);

  useEffect(() => {
    if (!actor) return;
    reload();
  }, [reload, actor]);

  const user = useMemo(() => actor ? ({
    id: actor.id,
    name: actor.name,
    emoji: actor.emoji,
    color: actor.color,
    selected_avatar_code: actor.selectedAvatarCode,
    role: state
      ? (state.challenger_id === actor.id && state.challenger_type === actor.type ? 'host' : 'guest')
      : 'player',
  }) : null, [actor, state]);

  const enabled = !!state && state.status !== 'finished' && state.status !== 'void';
  const { presence, isConnected, broadcast, onBroadcast } = useDuelChannel(duelId, user, enabled);

  const bothPresent = presence.length >= 2;
  const amHost = state && actor && state.challenger_id === actor.id && state.challenger_type === actor.type;
  const opponentIsMe = state && actor && state.opponent_id === actor.id && state.opponent_type === actor.type;

  // Cuando cambia presence a "ambos presentes", recargar estado por si el
  // rival acaba de aceptar (el retador tiene state.status cacheado).
  const prevBothPresentRef = useRef(false);
  useEffect(() => {
    if (bothPresent && !prevBothPresentRef.current) {
      prevBothPresentRef.current = true;
      reload();
    }
    if (!bothPresent) prevBothPresentRef.current = false;
  }, [bothPresent, reload]);

  // Cuando ambos presentes y aceptado → arrancar countdown
  useEffect(() => {
    if (!state || !bothPresent) return;
    if (phase === 'loading' || phase === 'waiting') setPhase('waiting');
    if (state.status === 'accepted' && bothPresent && !countdownStartedRef.current) {
      countdownStartedRef.current = true;
      setPhase('countdown'); setCountdown(COUNTDOWN_SECONDS);
    }
    if (state.status === 'in_progress') {
      setPhase('starting');
      redirectToGame();
    }
  }, [state, bothPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown → muestra instrucciones
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { setPhase('ready'); setShowInstructions(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Subscribirse a eventos del canal
  useEffect(() => {
    if (!isConnected) return;
    onBroadcast('game_started', () => {
      setPhase('starting');
      setTimeout(() => reload(), 300);
    });
    onBroadcast('duel_voided', () => { reload(); });
  }, [isConnected, onBroadcast, reload]);

  function redirectToGame() {
    if (!state) return;
    const subj = state.subject_id || 'lengua';
    const url = `/curso/${state.level}/${state.grade}/${subj}/app/${state.app_id}?duel=${duelId}`;
    navigate(url, { replace: true });
  }

  async function handleStart() {
    if (!amHost || !actor) return;
    try {
      if (isTeacherActor) {
        await teacherStartDuel({ duelId });
      } else {
        await startDuel({ studentId: actor.id, sessionToken: actor.sessionToken, duelId });
      }
      broadcast('game_started', { at: Date.now() });
      setPhase('starting');
      redirectToGame();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function confirmAbort() {
    setShowAbortModal(false);
    if (!actor) return;
    try {
      if (isTeacherActor) {
        await teacherVoidDuel({ duelId, reason: 'user_aborted' });
      } else {
        await voidDuel({ studentId: actor.id, sessionToken: actor.sessionToken, duelId, reason: 'user_aborted' });
      }
      broadcast('duel_voided', { reason: 'user_aborted' });
      navigate(homePath);
    } catch (e) { setErr(e.message); }
  }

  // Solo presentación: tamaño del avatar según el ancho de pantalla.
  const compact = useCompact();

  if (err) {
    return (
      <div className="dl-arena dl-arena--center">
        <ArenaBackdrop />
        <motion.div className="dl-notice" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="dl-notice__icon is-bad"><XCircle size={30} /></span>
          <p className="dl-notice__title">No se pudo cargar el duelo</p>
          <p className="dl-notice__text">{err}</p>
          <button type="button" onClick={() => navigate(homePath)} className="dl-btn dl-btn--ghost">
            <ArrowLeft size={16} /> Volver al panel
          </button>
        </motion.div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="dl-arena dl-arena--center">
        <ArenaBackdrop />
        <BrandLoader variant="inline" className="brand-loader--on-dark" label="Entrando en la sala…" />
      </div>
    );
  }

  const app = DUELABLE_APPS.find(a => a.id === state.app_id);
  const instructions = INSTRUCTIONS[state.app_id] || <p>Preparate para jugar.</p>;

  const rivalInfo = opponentIsMe ? state.challenger : state.opponent;
  const rivalHidden = rivalInfo?.hidden;

  // ─── Derivados de presentación ───────────────────────────────────────────
  const mePresent = presence.some(p => p.id === actor?.id);
  const rivalPresent = presence.some(p => p.id !== actor?.id);
  // Con el estado ya cargado, 'loading' solo significa "aún no estáis los dos":
  // se pinta igual que la espera.
  const view = phase === 'loading' ? 'waiting' : phase;
  const appTitle = cleanAppName(state.app_name) || app?.name || 'Duelo';
  // Duelo-tarea (lo crea el docente): +0,10 fijo al ganador y sin penalización;
  // el stake se ignora (CLAUDE.md, "Duelo-tarea").
  const isTask = state.is_task === true;
  const friendly = !isTask && Number(state.stake) === 0;
  const stakeLabel = isTask ? '+0,10 si ganas'
    : friendly ? 'Amistoso' : `${(+state.stake).toFixed(1).replace('.', ',')} pt`;
  const stakeSub = isTask ? 'Tarea · sin penalización si pierdes'
    : friendly ? 'No cambia la nota' : 'Nota en juego';
  const statusLabel = STATUS_LABEL[state.status] || state.status;
  const iWon = state.winner_id === actor?.id;

  return (
    <div className={`dl-arena is-${view}`}>
      <ArenaBackdrop />

      <div className="dl-wrap">
        <header className="dl-top">
          <button type="button" onClick={() => setShowAbortModal(true)} className="dl-exit">
            <ArrowLeft size={16} /> Salir del duelo
          </button>
          <span className={`dl-conn${isConnected ? ' is-on' : ''}`} title={`Conexion ${isConnected ? 'activa' : 'pendiente'}`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="dl-conn__txt">Conexión {isConnected ? 'activa' : 'pendiente'}</span>
            <b>{presence.length}/2</b>
          </span>
        </header>

        <motion.section
          className="dl-title"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="dl-title__icon">
            {hasAppIcon(state.app_id) ? <AppIcon appId={state.app_id} size={compact ? 52 : 68} /> : <Swords size={30} />}
          </span>
          <div className="dl-title__text">
            <p className="dl-kicker">
              <Swords size={13} /> Sala de duelo
              {state.is_hidden && <span className="dl-hidden-pill"><EyeOff size={12} /> Oculto</span>}
            </p>
            <h1>{appTitle}</h1>
            {app?.description && <p className="dl-title__desc">{app.description}</p>}
          </div>
        </motion.section>

        <section className="dl-stage">
          <PlayerCard
            side="me"
            label="Tú"
            role={amHost ? 'Retador' : 'Retado'}
            name={user.name}
            emoji={user.emoji}
            color={user.color}
            selectedAvatarCode={user.selected_avatar_code}
            present={mePresent}
            compact={compact}
          />
          <VsEmblem view={view} countdown={countdown} />
          <PlayerCard
            side="rival"
            label="Rival"
            role={amHost ? 'Retado' : 'Retador'}
            name={rivalHidden ? 'Oculto' : rivalInfo?.name}
            emoji={rivalHidden ? '🕵️' : rivalInfo?.emoji}
            color={rivalInfo?.color}
            selectedAvatarCode={rivalHidden ? null : rivalInfo?.selected_avatar_code}
            hidden={rivalHidden}
            present={rivalPresent}
            compact={compact}
          />
        </section>

        <section className="dl-info">
          <InfoPill icon={Coins} tone="amber" label={isTask ? 'Duelo-tarea' : 'Apuesta'} value={stakeLabel} sub={stakeSub} />
          <InfoPill icon={Repeat} tone="violet" label="Formato" value={state.best_of > 1 ? `Mejor de ${state.best_of}` : 'Una partida'} />
          <InfoPill icon={Activity} tone="cyan" label="Estado" value={statusLabel} />
        </section>

        <div className="dl-phase">
          <AnimatePresence mode="wait">
            {view === 'waiting' && (
              <motion.div key="wait" className="dl-step"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <div className="dl-radar" aria-hidden="true">
                  <span /><span /><span />
                  <Radio size={26} />
                </div>
                <p className="dl-step__title">Esperando al rival…</p>
                <p className="dl-step__text">
                  {bothPresent ? 'Preparando duelo' : 'Le avisaremos cuando esté listo.'}
                </p>
              </motion.div>
            )}
            {view === 'countdown' && (
              <motion.div key="cd" className="dl-step"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              >
                <p className="dl-step__kicker">El duelo comienza en</p>
                <motion.p
                  key={countdown}
                  className="dl-count"
                  initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                >
                  {countdown > 0 ? '¡Prepárate!' : '¡YA!'}
                </motion.p>
                <div className="dl-pips" aria-hidden="true">
                  {Array.from({ length: COUNTDOWN_SECONDS }, (_, i) => (
                    <i key={i} className={i < COUNTDOWN_SECONDS - countdown ? 'is-lit' : ''} />
                  ))}
                </div>
              </motion.div>
            )}
            {view === 'ready' && (
              <motion.div key="ready" className="dl-step dl-step--ready"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                {showInstructions && (
                  <div className="dl-rules">
                    <p className="dl-rules__head"><BookOpen size={15} /> Cómo se juega</p>
                    <div className="dl-rules__body">{instructions}</div>
                  </div>
                )}
                {amHost ? (
                  <motion.button
                    type="button"
                    onClick={handleStart}
                    className="dl-start"
                    whileHover={{ y: -3 }}
                    whileTap={{ y: 3 }}
                  >
                    <span className="dl-start__shine" aria-hidden="true" />
                    <Play size={22} fill="currentColor" /> Iniciar duelo
                  </motion.button>
                ) : (
                  <p className="dl-step__text">Esperando a que el retador pulse <strong>Iniciar duelo</strong>…</p>
                )}
              </motion.div>
            )}
            {view === 'starting' && (
              <motion.div key="starting" className="dl-step"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <BrandLoader variant="inline" className="brand-loader--on-dark" label="Cargando partida…" />
              </motion.div>
            )}
            {view === 'voided' && (
              <motion.div key="void" className="dl-step"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <span className="dl-notice__icon is-bad"><XCircle size={30} /></span>
                <p className="dl-step__title">Duelo cancelado</p>
                <p className="dl-step__text">{state.void_reason || 'La partida fue anulada.'}</p>
                <button type="button" onClick={() => navigate(homePath)} className="dl-btn dl-btn--ghost">
                  <ArrowLeft size={16} /> Volver al panel
                </button>
              </motion.div>
            )}
            {view === 'finished' && (
              <motion.div key="fin" className={`dl-step dl-result ${iWon ? 'is-win' : 'is-loss'}`}
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              >
                <span className="dl-result__trophy"><Trophy size={34} /></span>
                <p className="dl-step__title">
                  {state.winner_id === actor?.id ? '¡Has ganado!' : 'Has perdido'}
                </p>
                <button type="button" onClick={() => navigate(homePath)} className="dl-btn dl-btn--ghost">
                  <ArrowLeft size={16} /> Volver al panel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showAbortModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="dl-modal"
            onClick={() => setShowAbortModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="dl-modal__card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dl-abort-title"
            >
              <div className="dl-modal__head">
                <span className="dl-modal__icon"><XCircle size={22} /></span>
                <h3 id="dl-abort-title">Salir del duelo</h3>
              </div>
              <p className="dl-modal__text">
                ¿Seguro que quieres anular el duelo? La partida no afectará a la nota de ninguno.
              </p>
              <div className="dl-modal__actions">
                <button type="button" onClick={() => setShowAbortModal(false)} className="dl-btn dl-btn--ghost">
                  Seguir en la sala
                </button>
                <button type="button" onClick={confirmAbort} className="dl-btn dl-btn--danger">
                  Sí, anular duelo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Piezas de presentación ────────────────────────────────────────────────

const STATUS_LABEL = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  in_progress: 'En juego',
  finished: 'Terminado',
  void: 'Anulado',
  cancelled: 'Cancelado',
  rejected: 'Rechazado',
};

// Los app_name de los duelos llevan un emoji delante ("🎯 Ahorcado").
const cleanAppName = (name = '') =>
  String(name).replace(/^[\p{Extended_Pictographic}\p{Emoji_Presentation}️‍\s]+/u, '').trim();

function useCompact(query = '(max-width: 720px)') {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [query]);
  return match;
}

function ArenaBackdrop() {
  return (
    <div className="dl-bg" aria-hidden="true">
      <span className="dl-bg__side dl-bg__side--me" />
      <span className="dl-bg__side dl-bg__side--rival" />
      <span className="dl-bg__beam" />
      <span className="dl-bg__floor" />
      <span className="dl-bg__stars" />
    </div>
  );
}

function VsEmblem({ view, countdown }) {
  const counting = view === 'countdown';
  return (
    <div className={`dl-vs${counting ? ' is-counting' : ''}${view === 'ready' ? ' is-ready' : ''}`} aria-hidden="true">
      <span className="dl-vs__ring" />
      <span className="dl-vs__ring dl-vs__ring--2" />
      <svg className="dl-vs__bolt" viewBox="0 0 60 120">
        <path d="M36 2 L10 64 H28 L20 118 L52 46 H33 Z" />
      </svg>
      <div className="dl-vs__core">
        {/* Sin AnimatePresence: cada número entra con su propio "pop" (key) y
            el anterior desaparece al instante, para que la cuenta no se retrase. */}
        {counting ? (
          <motion.span
            key={`n${countdown}`}
            className={`dl-vs__num${countdown > 0 ? '' : ' is-go'}`}
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {countdown > 0 ? countdown : '¡YA!'}
          </motion.span>
        ) : (
          <motion.span
            key="vs"
            className="dl-vs__txt"
            initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          >
            VS
          </motion.span>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ side, label, role, name, emoji, color, selectedAvatarCode, hidden, present, compact }) {
  const { byCode } = useAvatarCatalog();
  const def = !hidden && selectedAvatarCode ? byCode(selectedAvatarCode) : null;
  const meta = def ? rarityMeta(def.rarity) : null;
  return (
    <motion.div
      className={`dl-player dl-player--${side}${present ? ' is-present' : ' is-away'}${hidden ? ' is-hidden' : ''}`}
      style={meta ? { '--glow': meta.glow, '--ring': meta.ring } : undefined}
      initial={{ opacity: 0, x: side === 'me' ? -48 : 48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 170, damping: 18, delay: side === 'me' ? 0.05 : 0.18 }}
    >
      <span className="dl-player__tag">{label}</span>
      <div className="dl-player__avatar">
        <span className="dl-player__halo" />
        {hidden ? (
          <div className="dl-mystery" style={{ width: compact ? 80 : 128, height: compact ? 80 : 128 }}>
            <span>?</span>
          </div>
        ) : (
          <UserAvatar
            selectedAvatarCode={selectedAvatarCode}
            avatarEmoji={emoji}
            avatarColor={color}
            size={compact ? 'lg' : 'xl'}
            shape="rounded"
            showRarityBorder
            showRarityGlow
          />
        )}
      </div>
      <strong className="dl-player__name">{name || '…'}</strong>
      <span className="dl-player__role">
        {hidden ? 'Se revelará al empezar' : role}
        {meta && <em className="dl-player__rarity">{meta.label}</em>}
      </span>
      <span className="dl-player__status">
        <i />{present ? 'Conectado' : 'Esperando…'}
      </span>
    </motion.div>
  );
}

function InfoPill({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className={`dl-pill dl-pill--${tone}`}>
      <span className="dl-pill__icon"><Icon size={16} /></span>
      <span className="dl-pill__body">
        <span className="dl-pill__label">{label}</span>
        <span className="dl-pill__value">{value}</span>
        {sub && <span className="dl-pill__sub">{sub}</span>}
      </span>
    </div>
  );
}
