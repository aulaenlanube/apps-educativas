import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Swords, Trophy, X, LogOut, Target, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRunnerData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';
import { Ship } from './NavePalabras';
import './NavePalabras.css';

// Constantes (comparten tamaños con la versión solo)
const ARENA_W = 800;
const ARENA_H = 520;
const SHIP_W = 70;
const SHIP_H = 36;
const SHIP_SPEED = 7;
const PROJ_W = 4;
const PROJ_H = 14;
const PROJ_SPEED = 12;
const WORD_H = 36;
const GAME_DURATION_MS = 60000;
const RESPAWN_MS = 3000;
const KILL_BONUS = 3;
const BASE_FIRE_MS = 260;
const BASE_SPAWN_MS = 650;

// Penalizaciones por fallo (máx 3). Se recupera un nivel por cada 5 aciertos.
// La velocidad de la nave es SIEMPRE la misma para ambos jugadores.
// El castigo por fallo afecta SOLO a la cadencia de disparo.
const MAX_PENALTY = 3;
const COMBO_TO_RECOVER = 5;
const PENALTY_FIRE = [1.00, 1.60, 2.20, 3.00];

// zonas
const HOST_Y = ARENA_H - 60; // nave del host abajo
const GUEST_Y = 30;          // nave del guest arriba
const WORD_BAND_TOP = 170;
const WORD_BAND_BOT = 330;

// network
const TICK_MS = 33;          // ~30 Hz
const BROADCAST_EVERY = 2;   // ~15 Hz

function rnd(a, b) { return a + Math.random() * (b - a); }
function estimateTextWidth(text) { return Math.max(80, Math.min(240, text.length * 10 + 24)); }
function formatName(n) { return (n || '').replace(/_/g, ' ').toUpperCase(); }

export default function NavePalabrasDuel({ onGameComplete, registerDuelExit }) {
  const { level, grade, subjectId } = useParams();
  const navigate = useNavigate();
  const duel = useDuel();
  const { duel: duelInfo, me, rival, channel, reportResult } = duel;

  const arenaRef = useRef(null);

  // Data
  const [gameData, setGameData] = useState(null);
  const [targetCat, setTargetCat] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shared game state (HOST authoritative, GUEST mirrors)
  const [state, setState] = useState(null); // {words:[], projs:[], ships:{host:{x,alive,respawnAt},guest:{...}}, scores:{hostId,guestId}, startedAt, endsAt}
  const [finished, setFinished] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const reportedRef = useRef(false);
  const [countdown, setCountdown] = useState(null);
  const [missFlashKey, setMissFlashKey] = useState(0);
  const lastMyPenaltyRef = useRef(0);

  // Input refs
  const keysRef = useRef({ left: false, right: false, fire: false });
  const stateRef = useRef(null); stateRef.current = state;
  const lastBroadcastTickRef = useRef(0);
  const lastGuestInputRef = useRef({ x: null, firedAt: 0 });

  // Cargar datos
  useEffect(() => {
    if (!duelInfo) return;
    const lvl = duelInfo.level || level;
    const gr = duelInfo.grade || grade;
    const sj = duelInfo.subject_id || subjectId || 'lengua';
    setLoading(true);
    getRunnerData(lvl, gr, sj)
      .then(d => {
        setGameData(d || {});
        const types = Object.keys(d || {}).filter(k => k !== 'title' && k !== 'instructions' && Array.isArray(d[k]));
        if (types.length) setTargetCat(types[Math.floor(Math.random() * types.length)]);
      })
      .catch(() => setGameData({}))
      .finally(() => setLoading(false));
  }, [duelInfo, level, grade, subjectId]);

  // Host inicializa estado cuando hay datos y canal
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected || !gameData || !targetCat || state) return;
    const now = performance.now();
    const ini = {
      seq: 0,
      words: [],
      projs: [],
      ships: {
        [me.id]:   { x: ARENA_W / 2 - SHIP_W / 2, alive: true, respawnAt: 0, side: 'host',  color: '#22d3ee' },
        [rival.id]:{ x: ARENA_W / 2 - SHIP_W / 2, alive: true, respawnAt: 0, side: 'guest', color: '#f472b6' },
      },
      scores: { [me.id]: 0, [rival.id]: 0 },
      kills:  { [me.id]: 0, [rival.id]: 0 },
      penalties: { [me.id]: 0, [rival.id]: 0 },
      combos:    { [me.id]: 0, [rival.id]: 0 },
      startedAt: null,
      endsAt: null,
      targetCat,
    };
    setState(ini);
    stateRef.current = ini;
    channel.broadcast('state', ini);
    channel.broadcast('meta', { targetCat });
    // cuenta atras
    runCountdown();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.isHost, channel?.isConnected, gameData, targetCat]);

  // Guest listeners
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('state', (s) => {
      setState(s);
      stateRef.current = s;
    });
    channel.onBroadcast('meta', ({ targetCat: tc }) => { if (tc) setTargetCat(tc); });
    channel.onBroadcast('game_end', ({ winner_id }) => { setWinnerId(winner_id); setFinished(true); });
    channel.onBroadcast('countdown', ({ value }) => setCountdown(value));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.isConnected, me?.isHost]);

  // Host listens a inputs del guest
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('input_pos', ({ x }) => {
      lastGuestInputRef.current.x = x;
    });
    channel.onBroadcast('input_fire', () => {
      lastGuestInputRef.current.firedAt = performance.now();
      // Spawnear proyectil del guest ya en el tick
    });
    // Solicitud de estado (rejoin)
    channel.onBroadcast('request_state', () => {
      if (stateRef.current) channel.broadcast('state', stateRef.current);
      if (targetCat) channel.broadcast('meta', { targetCat });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.isHost, channel?.isConnected, targetCat]);

  // Guest pide estado al conectar
  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.broadcast('request_state', { from: me?.id });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.isConnected, me?.isHost]);

  // Cuenta atrás antes de arrancar
  const runCountdown = useCallback(() => {
    let n = 3;
    setCountdown(n);
    channel?.broadcast('countdown', { value: n });
    const id = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(id);
        setCountdown(null);
        channel?.broadcast('countdown', { value: 0 });
        // Arrancar oficialmente
        setState(prev => {
          if (!prev) return prev;
          const now = performance.now();
          const next = { ...prev, startedAt: now, endsAt: now + GAME_DURATION_MS };
          stateRef.current = next;
          channel?.broadcast('state', next);
          return next;
        });
      } else {
        setCountdown(n);
        channel?.broadcast('countdown', { value: n });
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  // Key handlers (ambos lados)
  useEffect(() => {
    const down = (e) => {
      if (e.repeat) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA')  { keysRef.current.left = true;  e.preventDefault(); }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') { keysRef.current.right = true; e.preventDefault(); }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW') {
        keysRef.current.fire = true; e.preventDefault();
      }
    };
    const up = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA')  keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW') keysRef.current.fire = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Mouse/touch
  const onPointerMove = (e) => {
    if (!arenaRef.current || finished) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const scale = ARENA_W / rect.width;
    keysRef.current.mouseX = Math.max(0, Math.min(ARENA_W - SHIP_W, (x * scale) - SHIP_W / 2));
  };
  const onPointerDown = (e) => { keysRef.current.fire = true; onPointerMove(e); };
  const onPointerUp = () => { keysRef.current.fire = false; };

  // Host loop
  useEffect(() => {
    if (!me?.isHost || !state || finished) return;
    const hostId = me.id;
    const guestId = rival.id;
    let lastFireHost = 0, lastFireGuest = 0, lastSpawn = 0, tickCount = 0;
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;
      const now = performance.now();
      const s = { ...stateRef.current };
      if (!s || !s.ships) return;

      const penalties = { ...(s.penalties || {}) };
      const combos    = { ...(s.combos    || {}) };

      // Inputs host — velocidad fija para ambos jugadores
      const hostShip = { ...s.ships[hostId] };
      if (hostShip.alive) {
        if (keysRef.current.left)  hostShip.x = Math.max(0, hostShip.x - SHIP_SPEED);
        if (keysRef.current.right) hostShip.x = Math.min(ARENA_W - SHIP_W, hostShip.x + SHIP_SPEED);
        if (keysRef.current.mouseX != null) hostShip.x = keysRef.current.mouseX;
      } else if (hostShip.respawnAt <= now) {
        hostShip.alive = true; hostShip.respawnAt = 0;
      }

      // Inputs guest
      const guestShip = { ...s.ships[guestId] };
      if (guestShip.alive) {
        if (lastGuestInputRef.current.x != null) {
          guestShip.x = Math.max(0, Math.min(ARENA_W - SHIP_W, lastGuestInputRef.current.x));
        }
      } else if (guestShip.respawnAt <= now) {
        guestShip.alive = true; guestShip.respawnAt = 0;
      }

      const projs = s.projs.slice();

      // fire host — cadencia penalizada si hay fallos
      const hostFireMs = BASE_FIRE_MS * (PENALTY_FIRE[penalties[hostId] || 0]);
      if (keysRef.current.fire && hostShip.alive && now - lastFireHost > hostFireMs) {
        lastFireHost = now;
        projs.push({
          id: ++s.seq,
          owner: hostId,
          x: hostShip.x + SHIP_W / 2 - PROJ_W / 2,
          y: HOST_Y - PROJ_H,
          vy: -PROJ_SPEED,
        });
      }
      // fire guest — cadencia penalizada también
      const guestFireMs = BASE_FIRE_MS * (PENALTY_FIRE[penalties[guestId] || 0]);
      if (lastGuestInputRef.current.firedAt && guestShip.alive && now - lastFireGuest > guestFireMs) {
        if (now - lastGuestInputRef.current.firedAt < 200) {
          lastFireGuest = now;
          lastGuestInputRef.current.firedAt = 0;
          projs.push({
            id: ++s.seq,
            owner: guestId,
            x: guestShip.x + SHIP_W / 2 - PROJ_W / 2,
            y: GUEST_Y + SHIP_H,
            vy: PROJ_SPEED,
          });
        }
      }

      // move projectiles + OOB
      const liveProjs = [];
      for (const p of projs) {
        p.y += p.vy;
        if (p.y > -PROJ_H && p.y < ARENA_H + PROJ_H) liveProjs.push(p);
      }

      // move words
      const words = [];
      for (const w of s.words) {
        const nx = w.x + w.vx;
        const clamped = Math.max(10, Math.min(ARENA_W - w.w - 10, nx));
        if (clamped !== nx) w.vx = -w.vx;
        w.x = clamped;
        // caducidad 10s
        if (now - w.spawnedAt < 10000) words.push(w);
      }

      // collisions proj vs word
      const scores = { ...s.scores };
      const kills  = { ...s.kills };
      for (let pi = liveProjs.length - 1; pi >= 0; pi--) {
        const p = liveProjs[pi];
        let hit = false;
        for (let wi = words.length - 1; wi >= 0; wi--) {
          const w = words[wi];
          if (p.x < w.x + w.w && p.x + PROJ_W > w.x && p.y < w.y + WORD_H && p.y + PROJ_H > w.y) {
            words.splice(wi, 1);
            hit = true;
            if (w.category === s.targetCat) {
              scores[p.owner] = (scores[p.owner] || 0) + 1;
              // combo + recuperación de penalización
              combos[p.owner] = (combos[p.owner] || 0) + 1;
              if (combos[p.owner] >= COMBO_TO_RECOVER) {
                combos[p.owner] = 0;
                if ((penalties[p.owner] || 0) > 0) penalties[p.owner] = penalties[p.owner] - 1;
              }
            } else {
              scores[p.owner] = Math.max(0, (scores[p.owner] || 0) - 1);
              combos[p.owner] = 0;
              if ((penalties[p.owner] || 0) < MAX_PENALTY) penalties[p.owner] = (penalties[p.owner] || 0) + 1;
            }
            break;
          }
        }
        if (hit) { liveProjs.splice(pi, 1); continue; }
      }

      // collisions proj vs ship rival
      const ships = { [hostId]: hostShip, [guestId]: guestShip };
      for (let pi = liveProjs.length - 1; pi >= 0; pi--) {
        const p = liveProjs[pi];
        const victimId = p.owner === hostId ? guestId : hostId;
        const ship = ships[victimId];
        if (!ship.alive) continue;
        const shipY = victimId === hostId ? HOST_Y - SHIP_H : GUEST_Y;
        const shipH = SHIP_H;
        if (p.x + PROJ_W > ship.x && p.x < ship.x + SHIP_W && p.y + PROJ_H > shipY && p.y < shipY + shipH) {
          liveProjs.splice(pi, 1);
          ship.alive = false;
          ship.respawnAt = now + RESPAWN_MS;
          kills[p.owner] = (kills[p.owner] || 0) + 1;
          scores[p.owner] = (scores[p.owner] || 0) + KILL_BONUS;
        }
      }

      // spawn new words if game started
      if (s.startedAt && now < s.endsAt) {
        if (now - lastSpawn > BASE_SPAWN_MS && words.length < 14) {
          lastSpawn = now;
          const types = Object.keys(gameData || {}).filter(k => k !== 'title' && k !== 'instructions' && Array.isArray(gameData[k]));
          if (types.length) {
            const cat = types[Math.floor(Math.random() * types.length)];
            const list = gameData[cat] || [];
            if (list.length) {
              const text = list[Math.floor(Math.random() * list.length)];
              const w = estimateTextWidth(text);
              words.push({
                id: ++s.seq,
                text, category: cat,
                x: rnd(20, ARENA_W - w - 20),
                y: rnd(WORD_BAND_TOP, WORD_BAND_BOT - WORD_H),
                vx: rnd(-0.8, 0.8),
                w, spawnedAt: now,
              });
            }
          }
        }
      }

      const next = {
        ...s,
        words, projs: liveProjs,
        ships: { [hostId]: hostShip, [guestId]: guestShip },
        scores, kills, penalties, combos,
      };
      stateRef.current = next;
      setState(next);

      // broadcast cada BROADCAST_EVERY
      tickCount++;
      if (tickCount % BROADCAST_EVERY === 0) {
        channel?.broadcast('state', next);
      }

      // Guest input pos (si host es guest no aplica): no aplica, este loop es host.

      // End?
      if (next.startedAt && now >= next.endsAt && !finished) {
        const winner = scores[hostId] >= scores[guestId] ? hostId : guestId;
        if (scores[hostId] === scores[guestId]) {
          // empate → gana quien más kills; si igual, host
          if (kills[hostId] < kills[guestId]) {
            setWinnerId(guestId);
            channel?.broadcast('game_end', { winner_id: guestId });
          } else {
            setWinnerId(hostId);
            channel?.broadcast('game_end', { winner_id: hostId });
          }
        } else {
          setWinnerId(winner);
          channel?.broadcast('game_end', { winner_id: winner });
        }
        setFinished(true);
        return;
      }
    };

    const id = setInterval(loop, TICK_MS);
    return () => { cancelled = true; clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.isHost, state?.startedAt != null, gameData, finished, channel, rival?.id]);

  // Guest manda posición propia + fuego
  useEffect(() => {
    if (me?.isHost || !channel?.isConnected || !state || finished) return;
    let localX = state.ships?.[me.id]?.x ?? ARENA_W / 2 - SHIP_W / 2;
    let lastSent = 0;
    const id = setInterval(() => {
      const now = performance.now();
      const alive = stateRef.current?.ships?.[me.id]?.alive;
      if (alive !== false) {
        // Velocidad fija — idéntica para ambos jugadores
        if (keysRef.current.left)  localX = Math.max(0, localX - SHIP_SPEED);
        if (keysRef.current.right) localX = Math.min(ARENA_W - SHIP_W, localX + SHIP_SPEED);
        if (keysRef.current.mouseX != null) localX = keysRef.current.mouseX;
      }
      if (now - lastSent > 60) {
        channel.broadcast('input_pos', { x: localX });
        lastSent = now;
      }
      if (keysRef.current.fire && alive !== false) {
        channel.broadcast('input_fire', {});
        // un único fire por tick (server rate-limita)
      }
    }, 50);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.isHost, channel?.isConnected, state?.startedAt != null, finished, me?.id]);

  // Host: reporta resultado
  useEffect(() => {
    if (!me?.isHost || !finished || !winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(winnerId);
    onGameComplete?.({ mode: 'test', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0 });
  }, [me?.isHost, finished, winnerId, reportResult, onGameComplete]);

  // Forfeit handler coherente con otros duelos
  // Detecta subidas de mi penalización y dispara flash visual
  useEffect(() => {
    if (!me?.id) return;
    const cur = state?.penalties?.[me.id] || 0;
    if (cur > lastMyPenaltyRef.current) {
      setMissFlashKey(k => k + 1);
    }
    lastMyPenaltyRef.current = cur;
  }, [state?.penalties?.[me?.id], me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const meRef = useRef(me); meRef.current = me;
  const rivalRef = useRef(rival); rivalRef.current = rival;
  const reportResultRef = useRef(reportResult); reportResultRef.current = reportResult;
  const chanRef = useRef(channel); chanRef.current = channel;

  useEffect(() => {
    if (!registerDuelExit) return;
    if (finished) { registerDuelExit(null); return; }
    if (!me?.id || !rival?.id) { registerDuelExit(null); return; }
    const forfeit = async () => {
      const m = meRef.current; const rv = rivalRef.current; const ch = chanRef.current;
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

  // Host atiende forfeit_request del guest
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('forfeit_request', () => {
      if (reportedRef.current || !me?.id) return;
      setWinnerId(me.id);
      setFinished(true);
      channel.broadcast('game_end', { winner_id: me.id });
    });
  }, [me?.isHost, channel?.isConnected, me?.id]);

  if (duel.err) return <Err text={duel.err} />;
  if (duel.loading || loading || !me || !rival) return <Loading />;

  const myScore    = state?.scores?.[me.id] ?? 0;
  const rivalScore = state?.scores?.[rival.id] ?? 0;
  const myKills    = state?.kills?.[me.id] ?? 0;
  const rivalKills = state?.kills?.[rival.id] ?? 0;
  const endsAt     = state?.endsAt ?? null;
  const secondsLeft = endsAt ? Math.max(0, Math.ceil((endsAt - performance.now()) / 1000)) : 60;

  // Vista compartida (coordenadas absolutas). Host se ve ABAJO, guest ARRIBA
  // en ambas pantallas — evita desincronías entre física y render.
  const renderShips = state?.ships ? Object.entries(state.ships).map(([id, s]) => {
    const isMine = id === me.id;
    const viewY = s.side === 'host' ? HOST_Y - SHIP_H : GUEST_Y;
    return { id, s, viewY, isMine, flip: viewY === GUEST_Y };
  }) : [];

  return (
    <div className="np-root">
      <div className={`np-head ${state?.startedAt ? 'np-head-playing' : ''}`}>
        {!state?.startedAt && (
          <div className="np-badge"><Swords className="w-4 h-4" /> Nave Palabras · Duelo</div>
        )}
        <div className="np-hud">⏱ <span className={secondsLeft <= 10 ? 'np-time-low' : ''}>{secondsLeft}s</span></div>
        <div className="np-hud">🎯 {formatName(state?.targetCat || targetCat) || '—'}</div>
        <div className="np-hud" style={{ background: 'rgba(34, 211, 238, 0.25)' }} title={`Cadencia de disparo (fallos ${state?.penalties?.[me.id] || 0}/3)`}>
          Tú: ★{myScore} 💀{myKills}{' '}
          <span className="np-hud-speed" style={{ marginLeft: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} className={i < (MAX_PENALTY - (state?.penalties?.[me.id] || 0)) ? 'np-spd-on' : 'np-spd-off'}>⚡</span>
            ))}
          </span>
        </div>
        <div className="np-hud" style={{ background: 'rgba(244, 114, 182, 0.25)' }} title={`Cadencia de disparo rival (fallos ${state?.penalties?.[rival.id] || 0}/3)`}>
          {rival.hidden ? 'Rival' : rival.name}: ★{rivalScore} 💀{rivalKills}{' '}
          <span className="np-hud-speed" style={{ marginLeft: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} className={i < (MAX_PENALTY - (state?.penalties?.[rival.id] || 0)) ? 'np-spd-on' : 'np-spd-off'}>⚡</span>
            ))}
          </span>
        </div>
      </div>

      <div
        ref={arenaRef}
        className="np-arena"
        style={{ aspectRatio: `${ARENA_W} / ${ARENA_H}` }}
        onMouseMove={onPointerMove}
        onMouseDown={onPointerDown}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchMove={onPointerMove}
        onTouchStart={onPointerDown}
        onTouchEnd={onPointerUp}
      >
        <div className="np-viewport" style={{ width: ARENA_W, height: ARENA_H }}>
          <div className="np-stars" />

          {/* Flash + texto de fallo */}
          <AnimatePresence>
            {missFlashKey > 0 && (
              <motion.div
                key={missFlashKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.75, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, times: [0, 0.2, 1] }}
                className="np-miss-flash"
              />
            )}
            {missFlashKey > 0 && (
              <motion.div
                key={`txt-${missFlashKey}`}
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ opacity: 1, scale: 1.1, y: 0 }}
                exit={{ opacity: 0, scale: 1.4, y: -30 }}
                transition={{ duration: 0.7 }}
                className="np-miss-text">
                ¡FALLO!
              </motion.div>
            )}
          </AnimatePresence>

          {/* zona palabras (banda central) */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: WORD_BAND_TOP, height: WORD_BAND_BOT - WORD_BAND_TOP,
            background: 'linear-gradient(180deg, rgba(168,85,247,0.08), rgba(34,211,238,0.08), rgba(168,85,247,0.08))',
            borderTop: '1px dashed rgba(168, 85, 247, 0.3)',
            borderBottom: '1px dashed rgba(34, 211, 238, 0.3)',
          }} />

          {/* palabras */}
          {(state?.words || []).map(w => (
            <div key={w.id}
              className={`np-word ${w.category === (state?.targetCat || targetCat) ? 'np-target-word' : 'np-noise'}`}
              style={{ left: w.x, top: w.y, width: w.w, height: WORD_H }}>
              {w.text}
            </div>
          ))}

          {/* proyectiles */}
          {(state?.projs || []).map(p => {
            // si somos guest, los proyectiles del rival (host) van "hacia abajo" en lógica
            // pero desde la perspectiva guest queremos que los del rival vengan de arriba hacia abajo.
            // La lógica ya está bien porque broadcasteamos state absoluto.
            const mine = p.owner === me.id;
            return (
              <div key={p.id}
                className="np-proj"
                style={{
                  left: p.x, top: p.y, width: PROJ_W, height: PROJ_H,
                  background: mine
                    ? 'linear-gradient(180deg, #fff, #22d3ee)'
                    : 'linear-gradient(180deg, #fff, #f472b6)',
                  boxShadow: mine ? '0 0 10px #22d3ee' : '0 0 10px #f472b6',
                }} />
            );
          })}

          {/* naves */}
          {renderShips.map(({ id, s, viewY, isMine }) => {
            if (!s.alive) {
              // marca respawn
              const remain = Math.max(0, Math.ceil(((s.respawnAt ?? 0) - performance.now()) / 1000));
              return (
                <div key={id} style={{
                  position: 'absolute', left: s.x, top: viewY,
                  width: SHIP_W, height: SHIP_H,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fca5a5', fontWeight: 900, fontSize: 14,
                }}>
                  <Skull className="w-4 h-4 mr-1" /> {remain}s
                </div>
              );
            }
            return (
              <Ship key={id}
                x={s.x}
                y={viewY}
                color={isMine ? '#22d3ee' : '#f472b6'}
                flip={viewY === GUEST_Y}
              />
            );
          })}

          {/* cuenta atrás */}
          <AnimatePresence>
            {countdown != null && countdown > 0 && (
              <motion.div
                key={countdown}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                className="np-overlay" style={{ background: 'rgba(10,12,50,0.6)' }}>
                <div style={{ fontSize: 90, fontWeight: 900, color: '#22d3ee', textShadow: '0 0 30px #22d3ee' }}>
                  {countdown}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* fin */}
          {finished && (
            <div className="np-overlay">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="np-panel np-panel-end"
                style={{ borderColor: winnerId === me.id ? '#10b981' : '#ef4444' }}>
                <Trophy className="np-trophy" />
                <h2 className="np-title">
                  {winnerId === me.id ? '¡HAS GANADO!' : 'Has perdido'}
                </h2>
                <div className="np-stats-row">
                  <div><div className="np-stat-n" style={{ color: '#22d3ee' }}>{myScore}</div><div className="np-stat-l">Tú</div></div>
                  <div><div className="np-stat-n" style={{ color: '#f472b6' }}>{rivalScore}</div><div className="np-stat-l">Rival</div></div>
                </div>
                <div className="np-actions-row">
                  <Button onClick={() => navigate('/mi-panel')} className="np-play-btn">
                    <LogOut className="w-4 h-4 mr-2" /> Salir a mi panel
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile fire */}
      <div className="np-mobile-fire">
        <button
          onTouchStart={(e) => { e.preventDefault(); keysRef.current.fire = true; }}
          onTouchEnd={() => { keysRef.current.fire = false; }}
          onMouseDown={() => { keysRef.current.fire = true; }}
          onMouseUp={() => { keysRef.current.fire = false; }}
          className="np-fire-btn">
          <Rocket className="w-6 h-6" /> DISPARAR
        </button>
      </div>
    </div>
  );
}

function Loading() { return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" /></div>; }
function Err({ text }) { return <div className="p-8 text-center"><X className="w-10 h-10 mx-auto mb-2 text-rose-500" /><p className="font-bold">Error</p><p className="text-sm text-slate-500">{text}</p></div>; }
