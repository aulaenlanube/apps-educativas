import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Swords, Trophy, LogOut, Skull, Target } from 'lucide-react';
import { getRunnerData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';
import DuelChatBar from '@/components/duel/DuelChatBar';
import UserAvatar from '@/components/ui/UserAvatar';
import InstructionsModal from '../_shared/InstructionsModal';
import { GameShell, GameHeader, Chip, KeyTile, GameButton, GameLoading, GameEmpty } from '../_shared/kit';
import { SnakeStar, SnakeWordGuide } from './SnakeParts';
import './Snake.css';

const GRID = 35;               // tablero grande
const TICK_MS = 180;
const ITEM_LIFESPAN = 15000;
const ITEM_BLINK_MS = 5000;
const INITIAL_LEN = 3;
const TARGET_WINS = 3;         // al mejor de 5

// Grados de giro de la cabeza según la dirección (solo dibujo)
const headAngle = (d) => (!d ? 0 : d.x === 1 ? 0 : d.x === -1 ? 180 : d.y === 1 ? 90 : d.y === -1 ? -90 : 0);

function formatName(name) {
  return name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
}

function initialSnake(startX, startY, dir) {
  const body = [];
  for (let i = 0; i < INITIAL_LEN; i++) body.push({ x: startX - i * dir.x, y: startY - i * dir.y });
  return body;
}

function createRound(hostId, guestId) {
  return {
    snakes: {
      [hostId]: {
        owner: hostId,
        body: initialSnake(8, Math.floor(GRID / 2), { x: 1, y: 0 }),
        dir: { x: 1, y: 0 }, pendingDir: null,
        alive: true, size: INITIAL_LEN,
        score: 0, combo: 0, starCombo: 0,
        pendingGrowth: 0, headAnim: null,
      },
      [guestId]: {
        owner: guestId,
        body: initialSnake(GRID - 9, Math.floor(GRID / 2), { x: -1, y: 0 }),
        dir: { x: -1, y: 0 }, pendingDir: null,
        alive: true, size: INITIAL_LEN,
        score: 0, combo: 0, starCombo: 0,
        pendingGrowth: 0, headAnim: null,
      },
    },
    food: [],
    catIndex: 0,
    ticks: 0,
    over: false,
    roundWinner: null,
  };
}

function placeFood(round, type, wordText) {
  const occupied = new Set();
  for (const s of Object.values(round.snakes)) for (const seg of s.body) occupied.add(`${seg.x},${seg.y}`);
  for (const f of round.food) occupied.add(`${f.x},${f.y}`);
  let tries = 0;
  while (tries++ < 200) {
    const x = Math.floor(Math.random() * GRID);
    const y = Math.floor(Math.random() * GRID);
    if (!occupied.has(`${x},${y}`)) {
      return {
        x, y, type, word: wordText,
        id: Date.now() + Math.random(),
        expiresAt: Date.now() + ITEM_LIFESPAN,
      };
    }
  }
  return null;
}

function pickWord(data, categories, catIndex) {
  const targetKey = categories[catIndex];
  const others = categories.filter((_, i) => i !== catIndex);
  const rand = Math.random();
  if (rand > 0.92) return { type: 'bonus', word: '' };
  if (rand > 0.6 && others.length > 0) {
    const k = others[Math.floor(Math.random() * others.length)];
    const ws = data[k]; return { type: 'invalid', word: ws[Math.floor(Math.random() * ws.length)] };
  }
  const ws = data[targetKey];
  return { type: 'valid', word: ws[Math.floor(Math.random() * ws.length)] };
}

export default function SnakeDuel({ onGameComplete, registerDuelExit }) {
  const { level, grade, subjectId } = useParams();
  const navigate = useNavigate();
  const duel = useDuel();
  const { duel: duelInfo, me, rival, channel, reportResult } = duel;

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [score, setScore] = useState(null);         // wins por jugador
  const [round, setRound] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [finished, setFinished] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [nextTopic, setNextTopic] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const reportedRef = useRef(false);
  const awardedRef = useRef(null);
  const levelupTimerRef = useRef(null);

  // Refs para que los handlers registrados una sola vez accedan al valor
  // actual (evita acumular listeners por cambio de referencia de canal).
  const roundRef = useRef(round);  roundRef.current = round;
  const scoreRef = useRef(score);  scoreRef.current = score;
  const chanRef  = useRef(channel); chanRef.current = channel;

  // === Cargar datos ===
  useEffect(() => {
    if (!duelInfo) return;
    const lvl = duelInfo.level || level;
    const gr = duelInfo.grade || grade;
    const sj = duelInfo.subject_id || subjectId || 'lengua';
    setLoadingData(true); setLoadErr(false);
    getRunnerData(lvl, gr, sj)
      .then(d => {
        if (!d || Object.keys(d).length === 0) { setLoadErr(true); return; }
        setData(d); setCategories(Object.keys(d));
      })
      .catch(() => setLoadErr(true))
      .finally(() => setLoadingData(false));
  }, [duelInfo, level, grade, subjectId]);

  // === Host: inicializa score + primera ronda + countdown ===
  useEffect(() => {
    if (!me?.isHost || !data || categories.length === 0 || round) return;
    const sc = { [me.id]: 0, [rival.id]: 0 };
    const r = createRound(me.id, rival.id);
    setScore(sc); setRound(r); setCountdown(3);
    channel.broadcast('score', sc);
    channel.broadcast('round', r);
    channel.broadcast('countdown', { value: 3 });
  }, [me?.isHost, data, categories, round, rival?.id, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Guest: listeners (una sola vez por conexion) ===
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('score', s => setScore(s));
    channel.onBroadcast('round', r => setRound(r));
    channel.onBroadcast('countdown', ({ value }) => setCountdown(value));
    channel.onBroadcast('levelup', ({ topic }) => setNextTopic(topic));
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
  }, [channel?.isConnected, me?.isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Guest: pide estado ===
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: responde peticiones + input del guest (una sola vez por conexion) ===
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('request_state', () => {
      const ch = chanRef.current;
      if (scoreRef.current) ch.broadcast('score', scoreRef.current);
      if (roundRef.current) ch.broadcast('round', roundRef.current);
    });
    channel.onBroadcast('input', ({ player_id, dir }) => {
      setRound(prev => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        const s = next.snakes[player_id];
        if (!s || !s.alive) return prev;
        if (s.dir.x + dir.x === 0 && s.dir.y + dir.y === 0) return prev;
        s.pendingDir = dir;
        return next;
      });
    });
    // Guest abandona → host gana; el efecto "reportar resultado final" se
    // encarga del RPC y del broadcast al detectar finished + winnerId.
    channel.onBroadcast('forfeit_request', () => {
      if (reportedRef.current || !me?.id) return;
      setWinnerId(me.id);
      setFinished(true);
      channel.broadcast('game_end', { winner_id: me.id });
    });
  }, [me?.isHost, channel?.isConnected, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Countdown ===
  useEffect(() => {
    if (!me?.isHost || countdown <= 0) return;
    const t = setTimeout(() => {
      const n = countdown - 1;
      setCountdown(n);
      channel.broadcast('countdown', { value: n });
    }, 800);
    return () => clearTimeout(t);
  }, [me?.isHost, countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: TICK loop ===
  useEffect(() => {
    if (!me?.isHost || !round || countdown > 0 || finished) return;
    if (round.over || nextTopic) return;

    const id = setInterval(() => {
      setRound(prev => {
        if (!prev || prev.over) return prev;
        const next = structuredClone(prev);
        next.ticks++;

        // Aplicar pendingDir
        for (const k of Object.keys(next.snakes)) {
          const s = next.snakes[k];
          if (s.pendingDir) { s.dir = s.pendingDir; s.pendingDir = null; }
          if (s.headAnim && next.ticks % 3 === 0) s.headAnim = null;
        }

        // Expirar comida
        const now = Date.now();
        next.food = next.food.filter(f => f.expiresAt > now);

        // Mover serpientes
        const alive = Object.keys(next.snakes).filter(k => next.snakes[k].alive);
        for (const k of alive) {
          const s = next.snakes[k];
          const head = s.body[0];
          const nh = { x: head.x + s.dir.x, y: head.y + s.dir.y };
          s.body.unshift(nh);
          if (s.pendingGrowth > 0) s.pendingGrowth -= 1;
          else if (s.body.length > s.size) s.body.pop();
        }

        // Colisiones
        for (const k of alive) {
          const s = next.snakes[k];
          const head = s.body[0];
          if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            s.alive = false; continue;
          }
          // Contra cualquier cuerpo (incluido propio menos cabeza)
          for (const k2 of Object.keys(next.snakes)) {
            const body = k === k2 ? next.snakes[k2].body.slice(1) : next.snakes[k2].body;
            for (const seg of body) {
              if (seg.x === head.x && seg.y === head.y) { s.alive = false; break; }
            }
            if (!s.alive) break;
          }
        }

        // Comer
        for (const k of alive) {
          const s = next.snakes[k];
          if (!s.alive) continue;
          const head = s.body[0];
          const fi = next.food.findIndex(f => f.x === head.x && f.y === head.y);
          if (fi === -1) continue;
          const item = next.food[fi];
          if (item.type === 'valid') {
            s.combo += 1;
            s.score += s.combo * 50;
            s.headAnim = 'success';
            s.pendingGrowth += s.combo;
            next.food.splice(fi, 1);
          } else if (item.type === 'invalid') {
            s.combo = 0; s.starCombo = 0;
            s.score = Math.max(0, s.score - 15);
            s.headAnim = 'error';
            s.pendingGrowth += 1;
            next.food.splice(fi, 1);
          } else if (item.type === 'bonus') {
            s.starCombo += 1;
            s.score += s.starCombo * 500;
            s.headAnim = 'bonus';
            s.pendingGrowth += 10;
            // cambio de tema → pausa corta, solo la provoca quien la come
            next.catIndex = (next.catIndex + 1) % categories.length;
            next.food = [];
            // marca levelup temporal
            next._levelup = categories.length > 0 ? formatName(categories[next.catIndex]) : '';
            next.food.splice(fi, 1);
          }
        }

        // Reponer comida
        while (next.food.length < 5 && data) {
          const pick = pickWord(data, categories, next.catIndex);
          const item = placeFood(next, pick.type, pick.word);
          if (!item) break;
          next.food.push(item);
        }

        // Fin de ronda si alguien muerto
        const aliveNow = Object.keys(next.snakes).filter(k => next.snakes[k].alive);
        if (aliveNow.length < 2) {
          next.over = true;
          if (aliveNow.length === 1) next.roundWinner = aliveNow[0];
          else {
            // empate: ganador = mayor score
            const arr = Object.values(next.snakes);
            if (arr[0].score > arr[1].score) next.roundWinner = arr[0].owner;
            else if (arr[1].score > arr[0].score) next.roundWinner = arr[1].owner;
            else next.roundWinner = null;
          }
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [me?.isHost, round?.over, countdown, finished, nextTopic, round, data, categories]);

  // === Host: cada vez que round cambia, difunde (con limite para no spamear) ===
  useEffect(() => {
    if (!me?.isHost || !round) return;
    channel.broadcast('round', round);
    // Si hay levelup pendiente, activar pausa de 3s y difundir
    if (round._levelup && !nextTopic) {
      setNextTopic(round._levelup);
      channel.broadcast('levelup', { topic: round._levelup });
      clearTimeout(levelupTimerRef.current);
      levelupTimerRef.current = setTimeout(() => {
        setNextTopic('');
        setRound(prev => {
          if (!prev) return prev;
          const next = structuredClone(prev);
          delete next._levelup;
          return next;
        });
        channel.broadcast('levelup', { topic: '' });
      }, 3000);
    }
  }, [me?.isHost, round, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: fin de ronda → sumar + siguiente ronda o fin ===
  useEffect(() => {
    if (!me?.isHost || !round?.over) return;
    const key = `${round.ticks}|${round.roundWinner}`;
    if (awardedRef.current === key) return;
    awardedRef.current = key;

    const t = setTimeout(() => {
      setScore(prev => {
        if (!prev) return prev;
        const ns = { ...prev };
        const w = round.roundWinner;
        if (w) ns[w] = (ns[w] || 0) + 1;
        channel.broadcast('score', ns);
        const maxW = Math.max(...Object.values(ns));
        if (maxW >= TARGET_WINS) {
          const fw = Object.entries(ns).find(([, v]) => v === maxW)?.[0];
          setWinnerId(fw); setFinished(true);
          channel.broadcast('game_end', { winner_id: fw });
        } else {
          const r = createRound(me.id, rival.id);
          setRound(r); setCountdown(3);
          channel.broadcast('round', r);
          channel.broadcast('countdown', { value: 3 });
        }
        return ns;
      });
    }, 1600);
    return () => clearTimeout(t);
  }, [me?.isHost, round?.over, round, rival?.id, me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Host: reportar resultado final ===
  useEffect(() => {
    if (!me?.isHost || !finished || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    // mode 'duel' para que NO cuente como intento de examen en la tarea.
    onGameComplete?.({ mode: 'duel', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0, durationSeconds: 0 });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  // === Registrar handler de abandono voluntario (cuenta como derrota) ===
  const meRef = useRef(me); meRef.current = me;
  const rivalRef = useRef(rival); rivalRef.current = rival;
  const reportResultRef = useRef(reportResult); reportResultRef.current = reportResult;

  useEffect(() => {
    if (!registerDuelExit) return;
    if (finished) { registerDuelExit(null); return; }
    if (!me?.id || !rival?.id) { registerDuelExit(null); return; }
    const forfeit = async () => {
      const m = meRef.current;
      const rv = rivalRef.current;
      const ch = chanRef.current;
      if (!m || !rv) return;
      if (m.isHost) {
        try { await reportResultRef.current?.(rv.id); } catch (_) { /* ignore */ }
        ch?.broadcast('game_end', { winner_id: rv.id });
      } else {
        ch?.broadcast('forfeit_request', { from: m.id });
        await new Promise(r => setTimeout(r, 1200));
      }
    };
    registerDuelExit(forfeit);
    return () => registerDuelExit(null);
  }, [registerDuelExit, finished, me?.id, me?.isHost, rival?.id]);

  // === Controles ===
  const sendDir = useCallback((dir) => {
    if (!me || !round || round.over || countdown > 0 || finished || nextTopic) return;
    if (me.isHost) {
      setRound(prev => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        const s = next.snakes[me.id];
        if (!s || !s.alive) return prev;
        if (s.dir.x + dir.x === 0 && s.dir.y + dir.y === 0) return prev;
        s.pendingDir = dir;
        return next;
      });
    } else {
      channel.broadcast('input', { player_id: me.id, dir });
    }
  }, [me, round, countdown, finished, nextTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
        W: { x: 0, y: -1 }, S: { x: 0, y: 1 },
        A: { x: -1, y: 0 }, D: { x: 1, y: 0 },
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      sendDir(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sendDir]);

  const shellProps = { theme: 'dark', accent: '#84cc16', accent2: '#e879f9', className: 'snk' };

  if (duel.err) return <ErrBox text={duel.err} shellProps={shellProps} />;
  if (loadErr) return <ErrBox text="No hay datos disponibles para este curso." shellProps={shellProps} />;
  if (duel.loading || loadingData || !me || !round || !score) return <Loader shellProps={shellProps} />;

  const mySnake = round.snakes[me.id];
  const rivalSnake = round.snakes[rival.id];
  const myScore = score[me.id] || 0;
  const rivalScore = score[rival.id] || 0;
  const currentCat = categories.length > 0 ? formatName(categories[round.catIndex]) : '';
  const iWon = winnerId === me.id;

  return (
    <GameShell {...shellProps}>
      <GameHeader
        compact
        onStudy={data ? () => setShowCheatSheet(true) : undefined}
        right={<Chip tone="accent" icon={Swords}>Duelo · al mejor de 5</Chip>}
      />

      <div className="snk-duel-head">
        <PlayerScore
          name={me.name}
          emoji={me.emoji} avatarColor={me.color} avatarCode={me.selectedAvatarCode}
          rivalSide={false} wins={myScore} target={TARGET_WINS}
          snakeScore={mySnake?.score || 0} alive={mySnake?.alive}
        />
        <span className="snk-vs" aria-hidden="true">VS</span>
        <PlayerScore
          name={rival.hidden ? 'Oculto' : rival.name}
          emoji={rival.emoji} avatarColor={rival.color} avatarCode={rival.selectedAvatarCode}
          rivalSide wins={rivalScore} target={TARGET_WINS}
          snakeScore={rivalSnake?.score || 0} alive={rivalSnake?.alive}
        />
      </div>

      {currentCat && (
        <div className="snk-topbar">
          <div className={`snk-target ${nextTopic ? 'is-changing' : ''}`}>
            <span className="snk-target__icon"><Target size={18} /></span>
            <span className="snk-target__text">
              <small>Come solo</small>
              <strong key={currentCat}>{currentCat}</strong>
            </span>
          </div>
          <span className="snk-duel-tip"><i className="snk-legend__dot is-mine" /> Tú · <i className="snk-legend__dot is-rival" /> Rival</span>
        </div>
      )}

      {/* TABLERO */}
      <div className="snk-board snk-board--duel">
        <div className="snk-board__grid" style={{ backgroundSize: `${200 / GRID}% ${200 / GRID}%` }} aria-hidden="true" />
        <div className="snk-board__glow" aria-hidden="true" />

        {/* CELDAS */}
        <div className="snk-cells" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gridTemplateRows: `repeat(${GRID}, 1fr)` }}>
          {/* Comida — en el duelo todas las palabras van sin color de ayuda. Solo
              el bonus (estrella) se distingue porque no lleva texto. */}
          {round.food.map(item => {
            const expiring = item.expiresAt - Date.now() < ITEM_BLINK_MS;
            return (
              <div
                key={item.id}
                className={`snk-food ${item.type === 'bonus' ? 'is-bonus' : 'is-neutral'} ${expiring ? 'is-expiring' : ''}`}
                style={{ gridColumnStart: item.x + 1, gridRowStart: item.y + 1 }}
              >
                {item.type === 'bonus' ? <SnakeStar /> : <span className="snk-food__orb" />}
                {item.word && (
                  <span className={`snk-word snk-word--sm ${item.y < 2 ? 'is-below' : ''} ${item.x < 4 ? 'is-left' : item.x > GRID - 5 ? 'is-right' : ''}`}>
                    {item.word}
                  </span>
                )}
              </div>
            );
          })}

          {/* Serpientes */}
          {Object.values(round.snakes).map(s => {
            const isMine = s.owner === me.id;
            const len = s.body.length;
            return s.body.map((seg, i) => {
              const isHead = i === 0;
              const isTail = i === len - 1 && len > 1;
              const t = len > 1 ? i / (len - 1) : 0;
              return (
                <div
                  key={`${s.owner}-${i}`}
                  className={`snk-seg ${isMine ? 'is-mine' : 'is-rival'} ${isHead ? 'snk-seg--head' : ''} ${isTail ? 'snk-seg--tail' : ''} ${i % 2 ? 'is-alt' : ''} ${!s.alive ? 'is-dead' : ''}`}
                  style={{ gridColumnStart: seg.x + 1, gridRowStart: seg.y + 1, '--t': t }}
                >
                  {isHead && (
                    <span className={`snk-head ${s.headAnim ? `is-${s.headAnim}` : ''}`}>
                      <span className="snk-head__face" style={{ transform: `rotate(${headAngle(s.dir)}deg)` }}>
                        <i className="snk-eye snk-eye--a" />
                        <i className="snk-eye snk-eye--b" />
                      </span>
                    </span>
                  )}
                </div>
              );
            });
          })}
        </div>

        {/* Avisos */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div key="cd" className="snk-overlay snk-overlay--soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.span
                key={`cd-${countdown}`}
                className="snk-countdown"
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
          {nextTopic && (
            <motion.div key="topic" className="snk-overlay snk-overlay--soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className="snk-card snk-card--gold"
                initial={{ scale: 0.6, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <span className="snk-card__rays" aria-hidden="true" />
                <span className="snk-card__star"><SnakeStar /></span>
                <span className="snk-card__kicker">¡Nueva temática!</span>
                <strong className="snk-card__topic">{nextTopic}</strong>
              </motion.div>
            </motion.div>
          )}
          {round.over && !finished && (
            <motion.div key="round" className="snk-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                className={`snk-card ${round.roundWinner === me.id ? '' : round.roundWinner === rival.id ? 'snk-card--over' : 'snk-card--warn'}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="snk-card__badge">
                  {round.roundWinner === me.id ? <Trophy size={26} /> : round.roundWinner === rival.id ? <Skull size={26} /> : <Swords size={26} />}
                </span>
                <strong className="snk-card__title">
                  {round.roundWinner === me.id ? '¡Ganas la ronda!' : round.roundWinner === rival.id ? 'Ronda para el rival' : 'Ronda empatada'}
                </strong>
                <span className="snk-card__hint">Marcador {myScore} – {rivalScore} · preparando la siguiente…</span>
              </motion.div>
            </motion.div>
          )}
          {finished && (
            <motion.div key="end" className={`snk-overlay ${iWon ? '' : 'snk-overlay--over'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div
                className={`snk-card snk-duel-end ${iWon ? '' : 'is-lost'}`}
                initial={{ scale: 0.7, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
              >
                <span className="snk-card__badge"><Trophy size={34} /></span>
                <span className="snk-card__kicker">Fin del duelo</span>
                <strong className="snk-card__title">{iWon ? '¡Has ganado!' : 'Has perdido'}</strong>
                <span className="snk-card__score">{myScore} – {rivalScore}</span>
                <GameButton size="lg" icon={LogOut} onClick={() => navigate('/mi-panel')} autoFocus>Salir a mi panel</GameButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles móvil */}
      <div className="snk-pad" aria-label="Controles de dirección">
        <span />
        <KeyTile className="snk-pad__key" onPointerDown={() => sendDir({ x: 0, y: -1 })} aria-label="Arriba"><ArrowUp size={24} /></KeyTile>
        <span />
        <KeyTile className="snk-pad__key" onPointerDown={() => sendDir({ x: -1, y: 0 })} aria-label="Izquierda"><ArrowLeft size={24} /></KeyTile>
        <KeyTile className="snk-pad__key" onPointerDown={() => sendDir({ x: 0, y: 1 })} aria-label="Abajo"><ArrowDown size={24} /></KeyTile>
        <KeyTile className="snk-pad__key" onPointerDown={() => sendDir({ x: 1, y: 0 })} aria-label="Derecha"><ArrowRight size={24} /></KeyTile>
      </div>

      <InstructionsModal isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} title="Guía de palabras">
        <SnakeWordGuide data={data} current={categories[round.catIndex]} />
      </InstructionsModal>

      <DuelChatBar channel={channel} me={me} rival={rival} />
    </GameShell>
  );
}

function PlayerScore({ name, emoji, avatarColor, avatarCode, rivalSide, wins, target, snakeScore, alive }) {
  return (
    <div className={`snk-player ${rivalSide ? 'snk-player--rival' : ''} ${alive === false ? 'is-dead' : ''}`}>
      <UserAvatar
        selectedAvatarCode={avatarCode}
        avatarEmoji={emoji}
        avatarColor={avatarColor}
        size="md"
      />
      <div className="snk-player__info">
        <span className="snk-player__name">{name}</span>
        <span className="snk-player__meta">
          <span className="snk-player__pts">{snakeScore} pts</span>
          <span>{alive === false ? <><Skull size={12} /> fuera</> : 'en juego'}</span>
        </span>
        <span className="snk-player__wins" aria-label={`${wins} de ${target} rondas`}>
          {Array.from({ length: target }).map((_, i) => (
            <span key={i} className={`snk-player__win ${i < wins ? 'is-on' : ''}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

function Loader({ shellProps }) {
  return <GameShell {...shellProps}><GameLoading label="Conectando con tu rival…" /></GameShell>;
}
function ErrBox({ text, shellProps }) {
  return <GameShell {...shellProps}><GameEmpty title="No se puede jugar el duelo">{text}</GameEmpty></GameShell>;
}
