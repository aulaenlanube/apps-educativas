import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, EyeOff, ArrowLeft, Play, Users, Trophy, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import useDuelChannel from '@/hooks/useDuelChannel';
import { getDuelState, startDuel, voidDuel } from '@/services/duelService';
import { DUELABLE_APPS, getDuelConfig } from '@/apps/config/duelableApps';
import InstructionsModal from '@/apps/_shared/InstructionsModal';

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
  const { student } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [err, setErr] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | waiting | countdown | ready | starting | voided
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [showInstructions, setShowInstructions] = useState(false);
  const countdownStartedRef = useRef(false);

  const reload = useCallback(async () => {
    try {
      const s = await getDuelState({
        studentId: student.id, sessionToken: student.session_token, duelId,
      });
      setState(s);
      if (s.status === 'void' || s.status === 'cancelled' || s.status === 'rejected') setPhase('voided');
      else if (s.status === 'finished') setPhase('finished');
    } catch (e) {
      setErr(e.message);
    }
  }, [duelId, student]);

  useEffect(() => {
    if (!student) return;
    reload();
  }, [reload, student]);

  const user = useMemo(() => student ? ({
    id: student.id,
    name: student.display_name || student.username,
    emoji: student.avatar_emoji || '🎓',
    role: state ? (state.challenger_id === student.id ? 'host' : 'guest') : 'player',
  }) : null, [student, state]);

  const enabled = !!state && state.status !== 'finished' && state.status !== 'void';
  const { presence, isConnected, broadcast, onBroadcast } = useDuelChannel(duelId, user, enabled);

  const bothPresent = presence.length >= 2;
  const amHost = state && state.challenger_id === student?.id;
  const opponentIsMe = state && state.opponent_id === student?.id;

  // Cuando ambos presentes y aceptado → arrancar countdown (solo host lo dispara broadcast)
  useEffect(() => {
    if (!state || !bothPresent) return;
    if (phase === 'loading') setPhase('waiting');
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
    if (!amHost) return;
    try {
      await startDuel({ studentId: student.id, sessionToken: student.session_token, duelId });
      broadcast('game_started', { at: Date.now() });
      setPhase('starting');
      redirectToGame();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleAbort() {
    if (!window.confirm('¿Anular el duelo? La partida no afectará a tu nota.')) return;
    try {
      await voidDuel({ studentId: student.id, sessionToken: student.session_token, duelId, reason: 'user_aborted' });
      broadcast('duel_voided', { reason: 'user_aborted' });
      navigate('/mi-panel');
    } catch (e) { setErr(e.message); }
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-3 text-rose-400" />
          <p className="font-bold">No se pudo cargar el duelo</p>
          <p className="text-sm text-slate-400 mt-1">{err}</p>
          <button onClick={() => navigate('/mi-panel')} className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
            Volver al panel
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  const app = DUELABLE_APPS.find(a => a.id === state.app_id);
  const instructions = INSTRUCTIONS[state.app_id] || <p>Preparate para jugar.</p>;

  const rivalInfo = opponentIsMe ? state.challenger : state.opponent;
  const rivalHidden = rivalInfo?.hidden;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-fuchsia-900 text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <button
          onClick={handleAbort}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Salir del duelo
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Sala de duelo</p>
                <h1 className="text-xl font-bold">{state.app_name}</h1>
              </div>
            </div>
            {state.is_hidden && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/10">
                <EyeOff className="w-3.5 h-3.5" /> Oculto
              </div>
            )}
          </div>

          {/* Jugadores */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <PlayerCard
              label="Tú"
              name={user.name}
              emoji={user.emoji}
              present={presence.some(p => p.id === student.id)}
            />
            <PlayerCard
              label="Rival"
              name={rivalHidden ? 'Oculto' : rivalInfo?.name}
              emoji={rivalHidden ? '🕵️' : rivalInfo?.emoji}
              present={presence.some(p => p.id !== student.id)}
            />
          </div>

          {/* Info duelo */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm mb-6">
            <InfoPill label="Apuesta" value={`${(+state.stake).toFixed(1).replace('.', ',')} pt`} />
            <InfoPill label="Formato" value={state.best_of > 1 ? `Mejor de ${state.best_of}` : 'Una partida'} />
            <InfoPill label="Estado" value={state.status} />
          </div>

          {/* Fase */}
          <AnimatePresence mode="wait">
            {phase === 'waiting' && (
              <motion.div key="wait"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <Users className="w-12 h-12 mx-auto mb-3 text-white/40 animate-pulse" />
                <p className="text-lg font-bold">Esperando al rival…</p>
                <p className="text-sm text-white/60">
                  {bothPresent ? 'Preparando duelo' : 'Le avisaremos cuando esté listo.'}
                </p>
              </motion.div>
            )}
            {phase === 'countdown' && (
              <motion.div key="cd"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <p className="text-xs uppercase tracking-widest text-white/60 mb-2">El duelo comienza en</p>
                <motion.p
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-black bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
                >
                  {countdown > 0 ? countdown : '¡YA!'}
                </motion.p>
              </motion.div>
            )}
            {phase === 'ready' && (
              <motion.div key="ready"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="bg-white/5 rounded-xl p-4 mb-4 text-left text-sm leading-relaxed text-white/90 space-y-2">
                  {instructions}
                </div>
                {amHost ? (
                  <button
                    onClick={handleStart}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-lg shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" /> Iniciar duelo
                  </button>
                ) : (
                  <p className="text-sm text-white/70">Esperando a que el retador pulse <strong>Iniciar duelo</strong>…</p>
                )}
              </motion.div>
            )}
            {phase === 'starting' && (
              <motion.div key="starting"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3" />
                <p className="text-sm text-white/70">Cargando partida…</p>
              </motion.div>
            )}
            {phase === 'voided' && (
              <motion.div key="void"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <XCircle className="w-12 h-12 mx-auto mb-3 text-rose-400" />
                <p className="text-lg font-bold">Duelo cancelado</p>
                <p className="text-sm text-white/70">{state.void_reason || 'La partida fue anulada.'}</p>
                <button onClick={() => navigate('/mi-panel')} className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                  Volver al panel
                </button>
              </motion.div>
            )}
            {phase === 'finished' && (
              <motion.div key="fin"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                <p className="text-lg font-bold">
                  {state.winner_id === student.id ? '¡Has ganado!' : 'Has perdido'}
                </p>
                <button onClick={() => navigate('/mi-panel')} className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                  Volver al panel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-[11px] text-white/30 text-center mt-4">
          Conexion {isConnected ? 'activa' : 'pendiente'} · {presence.length}/2 en sala
        </p>
      </div>
    </div>
  );
}

function PlayerCard({ label, name, emoji, present }) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-3 ${
      present ? 'bg-emerald-500/10 border-emerald-400/40' : 'bg-white/5 border-white/10'
    }`}>
      <div className="text-3xl">{emoji || '🎓'}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-white/60">{label}</p>
        <p className="font-bold truncate">{name || '…'}</p>
        <p className={`text-[10px] ${present ? 'text-emerald-300' : 'text-white/40'}`}>
          {present ? 'conectado' : 'esperando'}
        </p>
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg py-2">
      <p className="text-[10px] uppercase text-white/50">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
