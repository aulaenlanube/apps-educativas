import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Check, X, ArrowRightCircle, Flag } from 'lucide-react';
import { getRoscoData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';

// Rosco del Saber en modo duelo 1 vs 1. Turn-based:
//   - El host es la autoridad del estado; guest envia acciones por canal.
//   - Cada jugador tiene su propia lista de letras pendientes (se clonan del pool).
//   - En tu turno puedes contestar, pasar o rendirte.
//   - Gana quien acabe primero su rosco, o quien tenga mas aciertos al final.

const LETTER_ORDER = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function initialBoardFor(questions) {
  // Una lista ordenada de letras del rosco. Estado por letra:
  //   { letter, question, status: 'pending' | 'correct' | 'wrong' }
  return LETTER_ORDER
    .map(L => {
      const q = questions.find(qq => (qq.letra || '').toUpperCase() === L);
      if (!q) return null;
      return { letter: L, question: q, status: 'pending' };
    })
    .filter(Boolean);
}

function computeStats(board) {
  let correct = 0, wrong = 0, pending = 0;
  for (const c of board) {
    if (c.status === 'correct') correct++;
    else if (c.status === 'wrong') wrong++;
    else pending++;
  }
  return { correct, wrong, pending };
}

export default function RoscoDuel({ onGameComplete }) {
  const { level, grade, subjectId } = useParams();
  const duel = useDuel();
  const { duelId, duel: duelInfo, me, rival, channel, reportResult, voidGame } = duel;

  const [pool, setPool] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [state, setState] = useState(null);   // estado autoritativo (host)
  const [guess, setGuess] = useState('');
  const [msg, setMsg] = useState(null);
  const finishedRef = useRef(false);

  // Cargar preguntas (ambos lados cargan, pero el host usa su copia para mandar)
  useEffect(() => {
    if (!duelInfo) return;
    const lvl = duelInfo.level || level;
    const gr = duelInfo.grade || grade;
    const sj = duelInfo.subject_id || subjectId || 'lengua';
    setLoadingData(true);
    getRoscoData(lvl, gr, sj)
      .then(d => setPool(d || []))
      .catch(() => setPool([]))
      .finally(() => setLoadingData(false));
  }, [duelInfo, level, grade, subjectId]);

  // Host: inicializa el estado cuando ya tiene las preguntas y ambos estan en la sala
  useEffect(() => {
    if (!me?.isHost || !pool || pool.length === 0 || state) return;
    // Escogemos 1 pregunta por letra.
    const byLetter = {};
    for (const q of pool) {
      const L = (q.letra || '').toUpperCase();
      if (!byLetter[L]) byLetter[L] = q;
    }
    const selected = Object.values(byLetter);
    if (selected.length < 10) { setMsg('No hay suficientes preguntas para este rosco.'); return; }
    const hostBoard = initialBoardFor(selected);
    const guestBoard = initialBoardFor(selected);
    const init = {
      host: { id: me.id, board: hostBoard, index: 0, done: false },
      guest: { id: rival.id, board: guestBoard, index: 0, done: false },
      turn: 'host', // primer turno: host
      startedAt: Date.now(),
      finished: false,
      winnerId: null,
      reason: null,
    };
    setState(init);
    channel.broadcast('state', init);
  }, [me?.isHost, pool, state, rival?.id, me?.id, channel]);

  // Guest: escucha estados autoritativos
  useEffect(() => {
    if (!channel?.isConnected) return;
    channel.onBroadcast('state', (payload) => setState(payload));
    channel.onBroadcast('message', ({ text }) => setMsg(text));
    channel.onBroadcast('duel_finished', () => { /* lobby se encarga */ });
  }, [channel]);

  // Guest: cuando se conecta, pide estado inicial si no lo tiene
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id, channel]);

  // Host: responde a peticiones de estado
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      if (state) channel.broadcast('state', state);
    });
  }, [me?.isHost, channel, state]);

  // Acciones: answer / pass / surrender.
  // Guest las emite por canal "action"; host las aplica.
  const applyAction = useCallback((action) => {
    setState(prev => {
      if (!prev || prev.finished) return prev;
      const mine = action.by === 'host' ? 'host' : 'guest';
      if (prev.turn !== mine) return prev;
      const next = structuredClone(prev);
      const side = next[mine];
      const board = side.board;
      if (side.done) {
        next.turn = mine === 'host' ? 'guest' : 'host';
        return next;
      }
      const idx = side.index;
      const cell = board[idx];
      if (!cell) { side.done = true; return next; }

      if (action.type === 'answer') {
        const ok = norm(action.text) === norm(cell.question.solucion);
        cell.status = ok ? 'correct' : 'wrong';
        side.index = (idx + 1) % board.length;
      } else if (action.type === 'pass') {
        side.index = (idx + 1) % board.length;
      } else if (action.type === 'surrender') {
        side.done = true;
      }

      // ¿Ha completado una vuelta entera sin pendientes?
      const stats = computeStats(board);
      if (stats.pending === 0) side.done = true;

      // Siguiente turno
      next.turn = mine === 'host' ? 'guest' : 'host';

      // Si los dos han acabado → fin
      if (next.host.done && next.guest.done) {
        next.finished = true;
        const hs = computeStats(next.host.board).correct;
        const gs = computeStats(next.guest.board).correct;
        if (hs > gs) next.winnerId = next.host.id;
        else if (gs > hs) next.winnerId = next.guest.id;
        else next.winnerId = null; // empate
      }
      return next;
    });
  }, []);

  // Host: escucha acciones del guest
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('action', (payload) => applyAction({ ...payload, by: 'guest' }));
  }, [me?.isHost, channel, applyAction]);

  // Host: cuando cambia el estado autoritativo, difunde
  useEffect(() => {
    if (!me?.isHost || !state) return;
    channel.broadcast('state', state);
  }, [me?.isHost, state, channel]);

  // Reportar resultado una vez
  useEffect(() => {
    if (!me?.isHost || !state?.finished || finishedRef.current) return;
    finishedRef.current = true;
    const winnerId = state.winnerId;
    const doReport = async () => {
      if (!winnerId) {
        // empate → anulamos el duelo
        await voidGame('draw');
      } else {
        await reportResult(winnerId);
      }
      onGameComplete?.({
        mode: 'test',
        score: 0, maxScore: 0,
        correctAnswers: 0, totalQuestions: 0,
        durationSeconds: Math.round(((Date.now() - (state.startedAt || Date.now())) / 1000)),
      });
    };
    doReport();
  }, [me?.isHost, state, voidGame, reportResult, onGameComplete]);

  // UI
  if (duel.err) return <DuelError text={duel.err} />;
  if (duel.loading || loadingData || !state) {
    return <DuelLoading />;
  }

  const mySide = me.isHost ? state.host : state.guest;
  const rivalSide = me.isHost ? state.guest : state.host;
  const myTurn = (me.isHost && state.turn === 'host') || (!me.isHost && state.turn === 'guest');
  const current = mySide.board[mySide.index];

  function sendAction(action) {
    if (!myTurn || mySide.done) return;
    if (me.isHost) applyAction({ ...action, by: 'host' });
    else channel.broadcast('action', action);
    setGuess('');
  }

  const myStats = computeStats(mySide.board);
  const rivalStats = computeStats(rivalSide.board);
  const myPct = Math.round((myStats.correct / mySide.board.length) * 100) || 0;
  const rivalPct = Math.round((rivalStats.correct / rivalSide.board.length) * 100) || 0;

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-4 text-slate-800">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-violet-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Swords className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold">Duelo de Rosco</h2>
          <span className="ml-auto text-xs text-slate-500">
            Apuesta: {(+duelInfo.stake).toFixed(1).replace('.', ',')} pt
          </span>
        </div>

        {/* Marcadores */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <PlayerScore
            label="Tú" name={me.name} emoji={me.emoji}
            stats={myStats} pct={myPct} turn={myTurn} done={mySide.done}
          />
          <PlayerScore
            label="Rival" name={rival.hidden ? 'Oculto' : rival.name} emoji={rival.emoji}
            stats={rivalStats} pct={rivalPct} turn={!myTurn} done={rivalSide.done}
          />
        </div>

        {/* Letra activa + definicion */}
        <AnimatePresence mode="wait">
          {!state.finished ? (
            <motion.div
              key={current?.letter}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 mb-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-3xl font-black shadow">
                  {current?.letter}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-violet-700 uppercase">
                    {current?.question?.tipo === 'contiene' ? 'Contiene la' : 'Empieza por'} {current?.letter}
                  </p>
                  <p className="text-sm text-slate-700 leading-snug">{current?.question?.definicion}</p>
                </div>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); sendAction({ type: 'answer', text: guess }); }}
                className="flex gap-2 mt-3"
              >
                <input
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  placeholder={myTurn ? 'Escribe tu respuesta…' : `Turno de ${rival.name}`}
                  disabled={!myTurn || mySide.done}
                  className="flex-1 px-3 py-2 rounded-lg border border-violet-200 disabled:bg-slate-100 focus:ring-2 focus:ring-violet-400 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!myTurn || !guess.trim() || mySide.done}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-40"
                  title="Responder"
                ><Check className="w-4 h-4" /></button>
                <button
                  type="button"
                  onClick={() => sendAction({ type: 'pass' })}
                  disabled={!myTurn || mySide.done}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-40"
                  title="Pasapalabra"
                ><ArrowRightCircle className="w-4 h-4" /></button>
                <button
                  type="button"
                  onClick={() => sendAction({ type: 'surrender' })}
                  disabled={!myTurn || mySide.done}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold disabled:opacity-40"
                  title="Me rindo"
                ><Flag className="w-4 h-4" /></button>
              </form>
            </motion.div>
          ) : (
            <FinishedBanner state={state} me={me} rival={rival} />
          )}
        </AnimatePresence>

        {/* Mini rosco visual */}
        <div className="grid grid-cols-2 gap-4">
          <MiniBoard board={mySide.board} index={mySide.index} label="Tu rosco" />
          <MiniBoard board={rivalSide.board} index={rivalSide.index} label="Rosco del rival" />
        </div>

        {msg && (
          <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded p-2">{msg}</div>
        )}
      </div>
    </div>
  );
}

function PlayerScore({ label, name, emoji, stats, pct, turn, done }) {
  return (
    <div className={`p-3 rounded-xl border ${turn ? 'border-violet-400 bg-violet-50 shadow-sm' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2">
        <div className="text-2xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
          <p className="font-bold truncate text-sm">{name}</p>
        </div>
        {turn && !done && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-600 text-white">TURNO</span>}
        {done && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500 text-white">FIN</span>}
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className="text-emerald-600">✓ {stats.correct}</span>
        <span className="text-rose-600">✗ {stats.wrong}</span>
        <span className="text-slate-400">– {stats.pending}</span>
        <span className="ml-auto font-bold text-slate-700">{pct}%</span>
      </div>
    </div>
  );
}

function MiniBoard({ board, index, label }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</p>
      <div className="flex flex-wrap gap-0.5">
        {board.map((c, i) => {
          const bg = c.status === 'correct' ? 'bg-emerald-500 text-white'
            : c.status === 'wrong' ? 'bg-rose-500 text-white'
            : i === index ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500';
          return (
            <span key={c.letter} className={`w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center ${bg}`}>
              {c.letter}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function FinishedBanner({ state, me }) {
  const myId = me.id;
  const winner = state.winnerId;
  const title = !winner ? 'Empate' : winner === myId ? '¡Has ganado!' : 'Has perdido';
  const color = !winner ? 'from-slate-500 to-slate-700' : winner === myId ? 'from-emerald-500 to-green-600' : 'from-rose-500 to-rose-700';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-xl bg-gradient-to-r ${color} text-white text-center shadow-xl`}
    >
      <Trophy className="w-10 h-10 mx-auto mb-2" />
      <p className="text-2xl font-black">{title}</p>
      <p className="text-sm opacity-80 mt-1">
        {!winner ? 'La partida queda anulada.' : 'Tu nota se actualizará en unos segundos.'}
      </p>
    </motion.div>
  );
}

function DuelLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
    </div>
  );
}
function DuelError({ text }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="text-center">
        <X className="w-10 h-10 mx-auto mb-2 text-rose-500" />
        <p className="font-bold text-slate-700">No se pudo cargar el duelo</p>
        <p className="text-sm text-slate-500 mt-1">{text}</p>
      </div>
    </div>
  );
}
