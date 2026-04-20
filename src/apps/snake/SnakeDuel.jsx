import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, X } from 'lucide-react';
import { getRunnerData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';

// Snake 1 vs 1 en el mismo tablero.
//   * Tablero 24x24 (grande).
//   * Dos serpientes: host (violeta) y guest (esmeralda).
//   * Muere al chocar contra pared o cuerpo rival. Al primer muerto → fin de ronda.
//   * Best of 5 (primero a 3 gana).
//   * Cada 5 'frutas' correctas no hace falta — aqui simplificamos: comer
//     cualquier fruta aumenta tamaño.
//   * Host-authority: simula a 8Hz y difunde state. Guest solo envía 'input'.

const GRID = 24;
const TICK_MS = 140;
const TARGET_WINS = 3;
const INITIAL_LEN = 3;

function placeFruit(snakes, prev) {
  const occupied = new Set();
  for (const s of snakes) for (const seg of s.body) occupied.add(`${seg.x},${seg.y}`);
  for (let t = 0; t < 300; t++) {
    const x = Math.floor(Math.random() * GRID);
    const y = Math.floor(Math.random() * GRID);
    if (!occupied.has(`${x},${y}`)) return { x, y };
  }
  return prev || { x: 0, y: 0 };
}

function createInitialState(hostId, guestId) {
  const host = { owner: hostId, body: [], dir: { x: 1, y: 0 }, alive: true, size: INITIAL_LEN, pendingDir: null };
  for (let i = 0; i < INITIAL_LEN; i++) host.body.unshift({ x: 5 - i, y: 5 });
  const guest = { owner: guestId, body: [], dir: { x: -1, y: 0 }, alive: true, size: INITIAL_LEN, pendingDir: null };
  for (let i = 0; i < INITIAL_LEN; i++) guest.body.unshift({ x: GRID - 6 + i, y: GRID - 6 });
  return {
    snakes: { [hostId]: host, [guestId]: guest },
    fruit: placeFruit([host, guest]),
    ticks: 0,
    roundOver: false,
    roundWinner: null,
  };
}

export default function SnakeDuel({ onGameComplete }) {
  const { level, grade, subjectId } = useParams();
  const duel = useDuel();
  const { duelId, duel: duelInfo, me, rival, channel, reportResult } = duel;

  const [score, setScore] = useState(null);
  const [round, setRound] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const reportedRef = useRef(false);
  const keyRef = useRef({ x: 1, y: 0 });

  // Host-only: tick loop
  const intervalRef = useRef(null);
  const stateRef = useRef(null);
  stateRef.current = round;

  useEffect(() => {
    if (!me || !rival) return;
    if (!score) {
      const sc = { [me.id]: 0, [rival.id]: 0 };
      setScore(sc);
      if (me.isHost) {
        const init = createInitialState(me.id, rival.id);
        setRound(init);
        setCountdown(3);
        channel.broadcast('score', sc);
        channel.broadcast('round', init);
      }
    }
  }, [me, rival, score, channel]);

  // Guest: recibe broadcasts
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('score', (s) => setScore(s));
    channel.onBroadcast('round', (r) => setRound(r));
    channel.onBroadcast('countdown', ({ value }) => setCountdown(value));
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
  }, [channel, me?.isHost]);

  // Host: responde solicitudes de estado
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      if (score) channel.broadcast('score', score);
      if (round) channel.broadcast('round', round);
    });
    channel.onBroadcast('input', ({ player_id, dir }) => {
      // Set pendingDir para el player guest
      setRound(prev => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        const s = next.snakes[player_id];
        if (!s || !s.alive) return prev;
        // No permitir 180º
        if ((s.dir.x + dir.x === 0 && s.dir.y + dir.y === 0)) return prev;
        s.pendingDir = dir;
        return next;
      });
    });
  }, [me?.isHost, channel, round, score]);

  // Guest: pide estado al entrar
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id, channel]);

  // Countdown (host)
  useEffect(() => {
    if (!me?.isHost || countdown <= 0) return;
    const t = setTimeout(() => {
      const next = countdown - 1;
      setCountdown(next);
      channel.broadcast('countdown', { value: next });
    }, 800);
    return () => clearTimeout(t);
  }, [me?.isHost, countdown, channel]);

  // Host: loop de tick
  useEffect(() => {
    if (!me?.isHost || !round || countdown > 0 || finished) return;
    if (round.roundOver) return;

    intervalRef.current = setInterval(() => {
      setRound(prev => {
        if (!prev || prev.roundOver) return prev;
        const next = structuredClone(prev);
        next.ticks++;

        // Aplicar pendingDir
        for (const k of Object.keys(next.snakes)) {
          const s = next.snakes[k];
          if (s.pendingDir) { s.dir = s.pendingDir; s.pendingDir = null; }
        }

        // Mover serpientes
        for (const k of Object.keys(next.snakes)) {
          const s = next.snakes[k];
          if (!s.alive) continue;
          const head = s.body[0];
          const nh = { x: head.x + s.dir.x, y: head.y + s.dir.y };
          s.body.unshift(nh);
          if (s.body.length > s.size) s.body.pop();
        }

        // Detectar colisiones
        const ownerIds = Object.keys(next.snakes);
        for (const k of ownerIds) {
          const s = next.snakes[k];
          if (!s.alive) continue;
          const head = s.body[0];
          if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) { s.alive = false; continue; }
          for (const k2 of ownerIds) {
            const s2 = next.snakes[k2];
            // Contra cuerpo de cualquiera (incluido propio) pero permitir cola saliente seria complejo
            const body = k === k2 ? s2.body.slice(1) : s2.body;
            for (const seg of body) {
              if (seg.x === head.x && seg.y === head.y) { s.alive = false; break; }
            }
            if (!s.alive) break;
          }
        }

        // Comer fruta
        let ate = false;
        for (const k of ownerIds) {
          const s = next.snakes[k];
          if (!s.alive) continue;
          const head = s.body[0];
          if (head.x === next.fruit.x && head.y === next.fruit.y) {
            s.size += 1;
            ate = true;
          }
        }
        if (ate) next.fruit = placeFruit(Object.values(next.snakes), next.fruit);

        // Fin de ronda si alguien ha muerto
        const aliveIds = ownerIds.filter(k => next.snakes[k].alive);
        if (aliveIds.length < 2) {
          next.roundOver = true;
          // Ganador: el que sigue vivo, o en empate, el de mayor size
          if (aliveIds.length === 1) next.roundWinner = aliveIds[0];
          else {
            const a = next.snakes[ownerIds[0]];
            const b = next.snakes[ownerIds[1]];
            next.roundWinner = a.size > b.size ? a.owner : b.size > a.size ? b.owner : null;
          }
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(intervalRef.current);
  }, [me?.isHost, round?.roundOver, countdown, finished, round]);

  // Host: cuando round cambia, difunde
  useEffect(() => {
    if (!me?.isHost || !round) return;
    channel.broadcast('round', round);
  }, [me?.isHost, round, channel]);

  // Host: cuando termina ronda, actualizar score y arrancar siguiente o finalizar
  useEffect(() => {
    if (!me?.isHost || !round?.roundOver) return;
    const t = setTimeout(() => {
      setScore(prev => {
        if (!prev) return prev;
        const next = { ...prev };
        const w = round.roundWinner;
        if (w) next[w] = (next[w] || 0) + 1;
        channel.broadcast('score', next);

        const maxW = Math.max(...Object.values(next));
        if (maxW >= TARGET_WINS) {
          const finalWinner = Object.entries(next).find(([, v]) => v === maxW)?.[0];
          setWinnerId(finalWinner);
          setFinished(true);
          channel.broadcast('game_end', { winner_id: finalWinner });
        } else {
          // nueva ronda
          const init = createInitialState(me.id, rival.id);
          setRound(init);
          setCountdown(3);
          channel.broadcast('round', init);
          channel.broadcast('countdown', { value: 3 });
        }
        return next;
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [me?.isHost, round?.roundOver, round?.roundWinner, rival?.id, me?.id, channel]);

  // Reportar resultado final (host)
  useEffect(() => {
    if (!me?.isHost || !finished || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    onGameComplete?.({
      mode: 'test', score: 0, maxScore: 0,
      correctAnswers: 0, totalQuestions: 0,
      durationSeconds: 0,
    });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  // Controles (keyboard)
  useEffect(() => {
    if (!me || !round) return;
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      const curr = keyRef.current;
      if (curr.x + dir.x === 0 && curr.y + dir.y === 0) return;
      keyRef.current = dir;
      if (me.isHost) {
        setRound(prev => {
          if (!prev) return prev;
          const next = structuredClone(prev);
          const s = next.snakes[me.id];
          if (!s || !s.alive) return prev;
          s.pendingDir = dir;
          return next;
        });
      } else {
        channel.broadcast('input', { player_id: me.id, dir });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [me, round, channel]);

  if (duel.err) return <Err text={duel.err} />;
  if (duel.loading || !me || !round) return <Loading />;

  const mySnake = round.snakes[me.id];
  const rivalSnake = round.snakes[rival.id];
  const myScore = score?.[me.id] || 0;
  const rivalScore = score?.[rival.id] || 0;

  return (
    <div className="min-h-[80vh] flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-violet-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Swords className="w-5 h-5 text-violet-600" />
          <h2 className="text-lg font-bold text-slate-800">Snake Duelo · Al mejor de {TARGET_WINS * 2 - 1}</h2>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <ScoreBox label="Tú" name={me.name} emoji={me.emoji} color="bg-violet-600" points={myScore} target={TARGET_WINS} alive={mySnake?.alive} size={mySnake?.size} />
          <ScoreBox label="Rival" name={rival.hidden ? 'Oculto' : rival.name} emoji={rival.emoji} color="bg-emerald-600" points={rivalScore} target={TARGET_WINS} alive={rivalSnake?.alive} size={rivalSnake?.size} />
        </div>

        {/* Canvas */}
        <div className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 540 }}>
          <Board round={round} hostId={duelInfo.challenger_id} />
          <AnimatePresence>
            {countdown > 0 && (
              <motion.div
                key={countdown} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center text-7xl font-black text-white drop-shadow-lg"
              >{countdown}</motion.div>
            )}
            {round.roundOver && !finished && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="text-center text-white">
                  <p className="text-xl font-bold">
                    {round.roundWinner === me.id ? '¡Ganas la ronda!' :
                     round.roundWinner === rival.id ? 'Ronda para el rival' : 'Empate de ronda'}
                  </p>
                  <p className="text-sm opacity-80">Preparando siguiente…</p>
                </div>
              </motion.div>
            )}
            {finished && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${
                  winnerId === me.id ? 'from-emerald-500/90 to-green-700/90' : 'from-rose-600/90 to-rose-900/90'
                }`}
              >
                <div className="text-center text-white">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-2xl font-black">{winnerId === me.id ? '¡Has ganado!' : 'Has perdido'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-xs text-slate-500 text-center mt-3">
          Flechas o WASD para moverte. No choques contra las paredes ni contra la otra serpiente.
        </p>
      </div>
    </div>
  );
}

function Board({ round, hostId }) {
  const cells = [];
  const size = 100 / GRID;
  // Fondo — cuadricula no necesaria, SVG optimizado
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <rect x="0" y="0" width="100" height="100" fill="#0f172a" />
      {/* Fruta */}
      <rect
        x={round.fruit.x * size} y={round.fruit.y * size}
        width={size} height={size}
        rx="1" fill="#f59e0b"
      />
      {/* Snakes */}
      {Object.entries(round.snakes).map(([id, s]) => {
        const color = id === hostId ? '#a855f7' : '#10b981';
        return s.body.map((seg, i) => (
          <rect
            key={`${id}-${i}`} x={seg.x * size} y={seg.y * size}
            width={size} height={size}
            rx="1" fill={i === 0 ? color : (s.alive ? color : '#64748b')}
            opacity={i === 0 ? 1 : 0.8}
          />
        ));
      })}
    </svg>
  );
}

function ScoreBox({ label, name, emoji, color, points, target, alive, size }) {
  return (
    <div className="p-3 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-2xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase text-slate-500 tracking-wide">{label}</p>
          <p className="font-bold truncate text-sm">{name}</p>
        </div>
        <div className={`w-7 h-7 rounded-lg ${color} text-white flex items-center justify-center font-black`}>
          {points}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[11px]">
        <span className="text-slate-500">Tamaño: <strong>{size || 0}</strong></span>
        <span className={`ml-auto ${alive ? 'text-emerald-600' : 'text-rose-600'} font-bold`}>
          {alive ? 'viva' : '💀 muerta'}
        </span>
      </div>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded ${i < points ? color : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}

function Loading() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>; }
function Err({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
