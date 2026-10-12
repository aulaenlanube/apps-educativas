import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Swords, Trophy, LogOut, Skull, Target, Clock, Zap } from 'lucide-react';
import { getRunnerData } from '@/services/gameDataService';
import useDuel from '@/hooks/useDuel';
import DuelChatBar from '@/components/duel/DuelChatBar';
import UserAvatar from '@/components/ui/UserAvatar';
import { GameShell, GameHeader, Hud, HudStat, Chip, ProgressBar, GameButton, GameLoading, GameEmpty } from '../_shared/kit';
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

// Bloque especial: si disparas al bloque "invert", el rival tiene sus controles
// invertidos (izq↔dcha) durante INVERT_DURATION_MS. Se avisa con un banner.
const INVERT_DURATION_MS = 5000;
const INVERT_SPAWN_CHANCE = 0.12;
const INVERT_KILL_BONUS = 2;

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
  // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
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
      inverts:   { [me.id]: 0, [rival.id]: 0 },
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
      const inverts   = { ...(s.inverts   || {}) };

      // Inputs host — velocidad fija para ambos jugadores.
      // Si el host tiene activo el efecto "invert", izq↔dcha se intercambian.
      const hostShip = { ...s.ships[hostId] };
      const hostInverted = (inverts[hostId] || 0) > now;
      if (hostShip.alive) {
        const left  = hostInverted ? keysRef.current.right : keysRef.current.left;
        const right = hostInverted ? keysRef.current.left  : keysRef.current.right;
        if (left)  hostShip.x = Math.max(0, hostShip.x - SHIP_SPEED);
        if (right) hostShip.x = Math.min(ARENA_W - SHIP_W, hostShip.x + SHIP_SPEED);
        if (keysRef.current.mouseX != null) {
          const mx = keysRef.current.mouseX;
          hostShip.x = hostInverted ? (ARENA_W - SHIP_W) - mx : mx;
        }
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
            if (w.special === 'invert') {
              // Invierte los controles del rival durante INVERT_DURATION_MS.
              const opp = p.owner === hostId ? guestId : hostId;
              inverts[opp] = now + INVERT_DURATION_MS;
              scores[p.owner] = (scores[p.owner] || 0) + INVERT_KILL_BONUS;
            } else if (w.category === s.targetCat) {
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
          // Probabilidad de que el spawn sea un bloque "invert" (trampa para el rival)
          if (Math.random() < INVERT_SPAWN_CHANCE) {
            const text = '⚠️ INVERTIR RIVAL';
            const w = estimateTextWidth(text);
            words.push({
              id: ++s.seq,
              text, category: null, special: 'invert',
              x: rnd(20, ARENA_W - w - 20),
              y: rnd(WORD_BAND_TOP, WORD_BAND_BOT - WORD_H),
              vx: rnd(-0.8, 0.8),
              w, spawnedAt: now,
            });
          } else {
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
      }

      const next = {
        ...s,
        words, projs: liveProjs,
        ships: { [hostId]: hostShip, [guestId]: guestShip },
        scores, kills, penalties, combos, inverts,
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
      const invertedUntil = stateRef.current?.inverts?.[me.id] || 0;
      const inverted = invertedUntil > now;
      if (alive !== false) {
        // Velocidad fija — idéntica para ambos jugadores. Si estoy "invertido",
        // intercambio izq↔dcha y espejo la X del ratón respecto al arena.
        const left  = inverted ? keysRef.current.right : keysRef.current.left;
        const right = inverted ? keysRef.current.left  : keysRef.current.right;
        if (left)  localX = Math.max(0, localX - SHIP_SPEED);
        if (right) localX = Math.min(ARENA_W - SHIP_W, localX + SHIP_SPEED);
        if (keysRef.current.mouseX != null) {
          const mx = keysRef.current.mouseX;
          localX = inverted ? (ARENA_W - SHIP_W) - mx : mx;
        }
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
    // mode 'duel' para que NO cuente como intento de examen en la tarea.
    onGameComplete?.({ mode: 'duel', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0 });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.isHost, channel?.isConnected, me?.id]);

  // Escala del escenario: la física trabaja en 800×520 fijos; aquí solo se
  // ajusta el dibujo al ancho real del contenedor (solo vista).
  const [viewScale, setViewScale] = useState(1);
  const arenaMounted = !(duel.err || duel.loading || loading || !me || !rival);
  useLayoutEffect(() => {
    if (!arenaMounted) return undefined;
    const el = arenaRef.current;
    if (!el) return undefined;
    const update = () => setViewScale(el.clientWidth / ARENA_W || 1);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [arenaMounted]);

  const shellProps = { theme: 'dark', accent: '#6366f1', accent2: '#ec4899', className: 'np' };

  if (duel.err) return <Err text={duel.err} shellProps={shellProps} />;
  if (duel.loading || loading || !me || !rival) return <Loading shellProps={shellProps} />;

  const myScore    = state?.scores?.[me.id] ?? 0;
  const rivalScore = state?.scores?.[rival.id] ?? 0;
  const myKills    = state?.kills?.[me.id] ?? 0;
  const rivalKills = state?.kills?.[rival.id] ?? 0;
  const endsAt     = state?.endsAt ?? null;
  const secondsLeft = endsAt ? Math.max(0, Math.ceil((endsAt - performance.now()) / 1000)) : 60;
  const target = formatName(state?.targetCat || targetCat) || '—';
  const iWon = winnerId === me.id;

  // Vista compartida (coordenadas absolutas). Host se ve ABAJO, guest ARRIBA
  // en ambas pantallas — evita desincronías entre física y render.
  const renderShips = state?.ships ? Object.entries(state.ships).map(([id, s]) => {
    const isMine = id === me.id;
    const viewY = s.side === 'host' ? HOST_Y - SHIP_H : GUEST_Y;
    return { id, s, viewY, isMine, flip: viewY === GUEST_Y };
  }) : [];

  return (
    <GameShell {...shellProps}>
      <GameHeader
        compact
        right={(
          <Hud>
            <Chip tone="accent" icon={Swords}>Duelo</Chip>
            <HudStat icon={Clock} tone="time" value={`${secondsLeft}s`} label="Tiempo" />
          </Hud>
        )}
      />

      <div className="np-duel-head">
        <Pilot
          name="Tú"
          sub={me.name}
          avatar={{ code: me.selectedAvatarCode, emoji: me.emoji, color: me.color }}
          color="#22d3ee"
          score={myScore}
          kills={myKills}
          penalty={state?.penalties?.[me.id] || 0}
        />
        <span className="np-vs" aria-hidden="true">VS</span>
        <Pilot
          rivalSide
          name={rival.hidden ? 'Rival' : rival.name}
          sub={rival.hidden ? 'Oculto' : 'Rival'}
          avatar={{ code: rival.hidden ? null : rival.selectedAvatarCode, emoji: rival.emoji, color: rival.hidden ? null : rival.color }}
          color="#f472b6"
          score={rivalScore}
          kills={rivalKills}
          penalty={state?.penalties?.[rival.id] || 0}
        />
      </div>

      <div className="np-bar">
        <div className="np-target">
          <span className="np-target__icon"><Target size={18} /></span>
          <span className="np-target__text"><small>Dispara a</small><strong>{target}</strong></span>
        </div>
        <span className="np-cadence"><Skull size={15} /> <span className="np-cadence__label">Derribar al rival: +{KILL_BONUS}</span></span>
        <div className="np-timebar"><ProgressBar value={secondsLeft} max={60} tone={secondsLeft <= 10 ? 'bad' : secondsLeft <= 25 ? 'warn' : 'good'} label="Tiempo restante" /></div>
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
        <div className="np-viewport" style={{ width: ARENA_W, height: ARENA_H, transform: `scale(${viewScale})` }}>
          <div className="np-space" aria-hidden="true">
            <span className="np-space__stars" />
            <span className="np-space__stars np-space__stars--b" />
          </div>

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
          <div className="np-band" style={{ top: WORD_BAND_TOP, height: WORD_BAND_BOT - WORD_BAND_TOP }} aria-hidden="true" />

          {/* palabras */}
          {(state?.words || []).map(w => {
            const cls = w.special === 'invert'
              ? 'np-danger'
              : (w.category === (state?.targetCat || targetCat) ? 'np-target-word' : 'np-noise');
            return (
              <div key={w.id}
                className={`np-word ${cls}`}
                style={{ width: w.w, height: WORD_H, transform: `translate(${w.x}px, ${w.y}px)` }}>
                <span className="np-word__text">{w.text}</span>
              </div>
            );
          })}

          {/* aviso cuando MIS controles están invertidos */}
          {(state?.inverts?.[me.id] || 0) > performance.now() && (
            <div className="np-invert-banner">⚠️ ¡CONTROLES INVERTIDOS!</div>
          )}

          {/* proyectiles (estado absoluto difundido por el host) */}
          {(state?.projs || []).map(p => (
            <div key={p.id}
              className={`np-proj ${p.owner === me.id ? '' : 'is-rival'}`}
              style={{ width: PROJ_W, height: PROJ_H, transform: `translate(${p.x}px, ${p.y}px)` }} />
          ))}

          {/* naves */}
          {renderShips.map(({ id, s, viewY, isMine }) => {
            if (!s.alive) {
              // marca respawn
              const remain = Math.max(0, Math.ceil(((s.respawnAt ?? 0) - performance.now()) / 1000));
              return (
                <div key={id} className="np-dead" style={{ width: SHIP_W, height: SHIP_H, transform: `translate(${s.x}px, ${viewY}px)` }}>
                  <Skull size={16} /> {remain}s
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="np-overlay">
                <motion.span
                  className="np-countdown"
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                >
                  {countdown}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* fin */}
          {finished && (
            <div className="np-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className={`np-duel-end ${iWon ? '' : 'is-lost'}`}
              >
                <span className="np-duel-end__badge"><Trophy size={36} /></span>
                <strong className="np-duel-end__title">{iWon ? '¡Has ganado!' : 'Has perdido'}</strong>
                <div className="np-duel-end__scores">
                  <span className="np-duel-end__score is-me"><b>{myScore}</b><small>Tú</small></span>
                  <span className="np-duel-end__score is-rival"><b>{rivalScore}</b><small>Rival</small></span>
                </div>
                <GameButton size="lg" icon={LogOut} onClick={() => navigate('/mi-panel')}>Salir a mi panel</GameButton>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Disparo táctil */}
      <div className="np-mobile-fire">
        <GameButton
          variant="danger"
          size="lg"
          icon={Rocket}
          onTouchStart={(e) => { e.preventDefault(); keysRef.current.fire = true; }}
          onTouchEnd={() => { keysRef.current.fire = false; }}
          onMouseDown={() => { keysRef.current.fire = true; }}
          onMouseUp={() => { keysRef.current.fire = false; }}
          className="np-fire-btn"
        >
          Disparar
        </GameButton>
      </div>
      <DuelChatBar channel={channel} me={me} rival={rival} />
    </GameShell>
  );
}

function Pilot({ name, sub, color, score, kills, penalty, avatar, rivalSide = false }) {
  return (
    <div className={`np-pilot ${rivalSide ? 'np-pilot--rival' : ''}`} style={{ '--np-p': color }}>
      <span className="np-pilot__avatar">
        <UserAvatar selectedAvatarCode={avatar?.code} avatarEmoji={avatar?.emoji} avatarColor={avatar?.color} size="md" />
        <span className="np-pilot__ship" aria-hidden="true">
          <svg viewBox="0 0 70 36" width="30" height="16">
            <path d="M35 2 L60 20 L50 30 L35 24 L20 30 L10 20 Z" fill={color} />
            <circle cx="35" cy="18" r="4" fill="#fff" />
          </svg>
        </span>
      </span>
      <div className="np-pilot__info">
        <span className="np-pilot__name">{name}{sub && sub !== name ? <small style={{ opacity: 0.7, fontWeight: 700 }}> · {sub}</small> : null}</span>
        <span className="np-pilot__stats">
          <b className="np-pilot__score">{score}</b>
          <span title="Derribos"><Skull size={13} /> {kills}</span>
          <span className="np-cadence__bolts" title={`Cadencia de disparo (fallos ${penalty}/3)`}>
            {[0, 1, 2].map(i => (
              <span key={i} className={`np-bolt ${i < (MAX_PENALTY - penalty) ? 'is-on' : ''}`}><Zap size={13} /></span>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}

function Loading({ shellProps }) {
  return <GameShell {...shellProps}><GameLoading label="Conectando con tu rival…" /></GameShell>;
}
function Err({ text, shellProps }) {
  return <GameShell {...shellProps}><GameEmpty title="No se puede jugar el duelo">{text}</GameEmpty></GameShell>;
}
