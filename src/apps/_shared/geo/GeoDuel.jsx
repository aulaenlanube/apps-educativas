// Duelo 1 vs 1 del motor de mapas (Explorador del Mundo, Explorador de España):
// carrera de 10 preguntas simultáneas. El anfitrión (retador) genera las
// preguntas, corrige y difunde el estado; el invitado solo envía respuestas.
// Supabase no hace eco al emisor: el anfitrión procesa sus propias respuestas
// directamente. 20 s por pregunta, un intento; 100 puntos por acierto y hasta
// 50 más por rapidez. Gana quien sume más puntos.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, Clock, Hourglass, LogOut, Swords, Trophy, X } from 'lucide-react';
import useDuel from '@/hooks/useDuel';
import UserAvatar from '@/components/ui/UserAvatar';
import DuelChatBar from '@/components/duel/DuelChatBar';
import { GameShell, GameButton, GameLoading, GameEmpty, ProgressDots, ProgressBar } from '../kit';
import MapView from './MapView';
import { Subject, Options, useLocateMap, judgeMapPick, mapHelpText, scopeOf } from './QuizPlay';
import { mergeUi } from './ui';
import './geo.css';

export const DUEL_QUESTIONS = 10;
export const QUESTION_MS = 20000;
const REVEAL_MS = 2800;
const COUNTDOWN = 3;
const WAIT_RIVAL_MS = 10000;

const STORAGE_PREFIX = 'geoduel:';
const loadCheckpoint = (duelId) => {
  try { return JSON.parse(window.localStorage.getItem(STORAGE_PREFIX + duelId) || 'null'); } catch { return null; }
};
const saveCheckpoint = (duelId, data) => {
  try { window.localStorage.setItem(STORAGE_PREFIX + duelId, JSON.stringify(data)); } catch { /* sin almacenamiento */ }
};
const clearCheckpoint = (duelId) => {
  try { window.localStorage.removeItem(STORAGE_PREFIX + duelId); } catch { /* sin almacenamiento */ }
};

export const duelPoints = (correct, ms) => (correct ? 100 + Math.max(0, Math.round(50 * (1 - ms / QUESTION_MS))) : 0);

// Ganador: más puntos; si empatan, más aciertos; si siguen, menos tiempo total.
export function duelWinner(state, a, b) {
  const sum = (id, f) => Object.values(state.answers[id] || {}).reduce((acc, r) => acc + f(r), 0);
  const pa = state.scores[a] || 0;
  const pb = state.scores[b] || 0;
  if (pa !== pb) return pa > pb ? a : b;
  const ca = sum(a, (r) => (r.correct ? 1 : 0));
  const cb = sum(b, (r) => (r.correct ? 1 : 0));
  if (ca !== cb) return ca > cb ? a : b;
  return sum(a, (r) => r.ms) <= sum(b, (r) => r.ms) ? a : b;
}

function PlayerChip({ player, label, score, status, side }) {
  return (
    <div className={`gq-duel-player is-${side}`}>
      <UserAvatar selectedAvatarCode={player?.selectedAvatarCode} avatarEmoji={player?.emoji} avatarColor={player?.color} size="md" />
      <div className="gq-duel-player__id">
        <span>{label}</span>
        <strong>{player?.name || '…'}</strong>
      </div>
      <span className="gq-duel-player__score">{score.toLocaleString('es-ES')}</span>
      {status && <span className={`gq-duel-player__status is-${status.tone}`}>{status.icon}{status.text}</span>}
    </div>
  );
}

export default function GeoDuel({ config: baseConfig, onGameComplete, registerDuelExit }) {
  const { duelId, me, rival, channel, reportResult, loading, err } = useDuel();
  const navigate = useNavigate();
  const { level, grade, subjectId } = useParams();
  const lv = useMemo(() => baseConfig.levelFor(level, parseInt(grade, 10), subjectId), [baseConfig, level, grade, subjectId]);
  // Idioma de la asignatura (el mismo para los dos: comparten curso y asignatura).
  const lang = useMemo(() => baseConfig.defaultLang?.(level, subjectId) ?? null, [baseConfig, level, subjectId]);
  const config = useMemo(() => (baseConfig.localize ? baseConfig.localize(lang) : baseConfig), [baseConfig, lang]);
  const ui = useMemo(() => mergeUi(config.ui), [config]);

  const [world, setWorld] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [restored] = useState(() => (duelId ? loadCheckpoint(duelId) : null));
  const [questions, setQuestions] = useState(restored?.questions || null);
  const [state, setState] = useState(restored?.state || null);
  const [countdown, setCountdown] = useState(null);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [myPick, setMyPick] = useState(null); // { idx, key, cont }

  const stateRef = useRef(state);
  const questionsRef = useRef(questions);
  const chanRef = useRef(channel);
  const worldRef = useRef(null);
  const startedRef = useRef(Boolean(restored?.questions));
  const reportedRef = useRef(false);
  const timerRef = useRef(0);
  const shownAtRef = useRef(Date.now());
  const deadlineRef = useRef(0);
  const revealRef = useRef(null);
  const processRef = useRef(null);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { chanRef.current = channel; }, [channel]);
  useEffect(() => { worldRef.current = world; }, [world]);
  useEffect(() => { deadlineRef.current = deadline; }, [deadline]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Mapa (y datos extra del duelo, como el relieve).
  useEffect(() => {
    let alive = true;
    config.load()
      .then((w) => (config.prepare ? config.prepare('duel', w, lv).then(() => w) : w))
      .then((w) => { if (alive) setWorld(w); })
      .catch((e) => { if (alive) setLoadErr(e.message || ui.loadErrorTitle); });
    return () => { alive = false; };
  }, [config, lv, ui]);

  // Cada pregunta nueva: reloj local y respuesta propia en blanco.
  const enterQuestion = useCallback((s) => {
    const t = Date.now();
    shownAtRef.current = t;
    setNow(t);
    setDeadline(t + (s.endsIn ?? QUESTION_MS));
  }, []);

  const applyState = useCallback((s) => {
    const prev = stateRef.current;
    stateRef.current = s;
    setState(s);
    if (s.phase !== 'countdown') setCountdown(null);
    if (s.phase === 'question' && (prev?.phase !== 'question' || prev?.idx !== s.idx)) enterQuestion(s);
  }, [enterQuestion]);

  /* ───────── anfitrión ───────── */

  const publish = useCallback((s) => {
    applyState(s);
    chanRef.current?.broadcast('state', s);
  }, [applyState]);

  const endGame = useCallback((forcedWinner) => {
    clearTimeout(timerRef.current);
    const s = stateRef.current;
    if (!s || s.phase === 'ended') return;
    const winnerId = forcedWinner || duelWinner(s, me.id, rival.id);
    publish({ ...s, phase: 'ended', winnerId });
    chanRef.current?.broadcast('game_end', { winner_id: winnerId });
  }, [me?.id, rival?.id, publish]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToQuestion = useCallback((idx) => {
    clearTimeout(timerRef.current);
    const s = stateRef.current;
    publish({ ...s, phase: 'question', idx, endsIn: QUESTION_MS });
    timerRef.current = setTimeout(() => revealRef.current(idx), QUESTION_MS + 400);
  }, [publish]);

  const reveal = useCallback((idx) => {
    const s = stateRef.current;
    if (!s || s.phase !== 'question' || s.idx !== idx) return;
    clearTimeout(timerRef.current);
    publish({ ...s, phase: 'reveal' });
    timerRef.current = setTimeout(() => {
      if (idx + 1 < questionsRef.current.length) goToQuestion(idx + 1);
      else endGame();
    }, REVEAL_MS);
  }, [publish, goToQuestion, endGame]);
  useEffect(() => { revealRef.current = reveal; }, [reveal]);

  const processAnswer = useCallback(({ by, idx, key, cont, ms, pt }) => {
    if (!me?.isHost) return;
    const s = stateRef.current;
    const q = questionsRef.current?.[idx];
    if (!s || !q || s.phase !== 'question' || s.idx !== idx || s.answers[by]?.[idx]) return;
    const ok = q.kind === 'choice' ? q.answer.includes(key) : judgeMapPick(q, key, cont, [], scopeOf(worldRef.current, q.layer), 0, Array.isArray(pt) ? pt : null);
    if (ok === null) return;
    const time = Math.max(0, Math.min(QUESTION_MS, Number(ms) || QUESTION_MS));
    const points = duelPoints(ok, time);
    const next = {
      ...s,
      answers: { ...s.answers, [by]: { ...(s.answers[by] || {}), [idx]: { key, cont, correct: ok, ms: time, points } } },
      scores: { ...s.scores, [by]: (s.scores[by] || 0) + points },
    };
    publish(next);
    if (next.answers[me.id]?.[idx] && next.answers[rival.id]?.[idx]) revealRef.current(idx);
  }, [me?.isHost, me?.id, rival?.id, publish]);
  useEffect(() => { processRef.current = processAnswer; }, [processAnswer]);

  const startGame = useCallback(() => {
    if (!me?.isHost || startedRef.current || !worldRef.current) return;
    startedRef.current = true;
    const qs = config.buildRound({ lv, region: 'all', difficulty: 'exam', world: worldRef.current, lang, duel: true }, 'exam', DUEL_QUESTIONS);
    questionsRef.current = qs;
    setQuestions(qs);
    const init = { phase: 'countdown', idx: 0, answers: { [me.id]: {}, [rival.id]: {} }, scores: { [me.id]: 0, [rival.id]: 0 } };
    chanRef.current?.broadcast('setup', { questions: qs });
    publish(init);
    let n = COUNTDOWN;
    setCountdown(n);
    chanRef.current?.broadcast('countdown', { n });
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(null);
        goToQuestion(0);
        return;
      }
      setCountdown(n);
      chanRef.current?.broadcast('countdown', { n });
      timerRef.current = setTimeout(tick, 1000);
    };
    timerRef.current = setTimeout(tick, 1000);
  }, [me?.isHost, me?.id, rival?.id, config, lv, lang, publish, goToQuestion]);

  // El anfitrión arranca cuando el rival está conectado (o tras una espera).
  const rivalPresent = Boolean(rival?.id && channel?.presence?.some((p) => p.id === rival.id));
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected || !world || startedRef.current) return undefined;
    if (rivalPresent) {
      startGame();
      return undefined;
    }
    const t = setTimeout(startGame, WAIT_RIVAL_MS);
    return () => clearTimeout(t);
  }, [me?.isHost, channel?.isConnected, world, rivalPresent, startGame]);

  // Anfitrión que recarga a mitad: retoma la pregunta en curso con el tiempo completo.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!restored || resumedRef.current || !me?.isHost || !channel?.isConnected || !world) return;
    resumedRef.current = true;
    const s = stateRef.current;
    channel.broadcast('setup', { questions: questionsRef.current });
    if (!s || s.phase === 'ended') return;
    goToQuestion(s.phase === 'countdown' ? 0 : s.idx);
  }, [restored, me?.isHost, channel?.isConnected, world, channel, goToQuestion]);

  // Escucha del anfitrión.
  useEffect(() => {
    if (!me?.isHost || !channel?.isConnected) return;
    channel.onBroadcast('answer', (p) => processRef.current?.(p));
    channel.onBroadcast('request_state', () => {
      if (questionsRef.current) channel.broadcast('setup', { questions: questionsRef.current });
      const s = stateRef.current;
      if (s) {
        const endsIn = s.phase === 'question' ? Math.max(0, deadlineRef.current - Date.now()) : undefined;
        channel.broadcast('state', { ...s, endsIn });
      }
    });
    channel.onBroadcast('forfeit_request', () => {
      if (stateRef.current?.phase === 'ended' || !me?.id) return;
      endGame(me.id);
    });
  }, [me?.isHost, channel?.isConnected]); // eslint-disable-line react-hooks/exhaustive-deps


  /* ───────── invitado ───────── */

  useEffect(() => {
    if (!channel?.isConnected || me?.isHost) return;
    channel.onBroadcast('setup', ({ questions: qs }) => {
      questionsRef.current = qs;
      setQuestions(qs);
    });
    channel.onBroadcast('state', (s) => applyState(s));
    channel.onBroadcast('countdown', ({ n }) => setCountdown(n > 0 ? n : null));
    channel.onBroadcast('game_end', ({ winner_id }) => {
      const s = stateRef.current;
      if (s && s.phase !== 'ended') applyState({ ...s, phase: 'ended', winnerId: winner_id });
    });
    channel.broadcast('request_state', { from: me?.id });
  }, [channel?.isConnected, me?.isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ───────── ambos ───────── */

  // Reloj de la barra de tiempo.
  useEffect(() => {
    if (state?.phase !== 'question') return undefined;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [state?.phase, state?.idx]);

  // Guardar el progreso por si alguien recarga la página.
  useEffect(() => {
    if (!duelId || !questions || !state) return;
    if (state.phase === 'ended') clearCheckpoint(duelId);
    else saveCheckpoint(duelId, { questions, state });
  }, [duelId, questions, state]);

  const answer = (key, cont, pt) => {
    const s = stateRef.current;
    const q = questionsRef.current?.[s?.idx];
    if (!s || !q || s.phase !== 'question' || myPick?.idx === s.idx || s.answers[me.id]?.[s.idx]) return;
    if (q.kind !== 'choice' && judgeMapPick(q, key, cont, [], scopeOf(worldRef.current, q.layer)) === null) return;
    setMyPick({ idx: s.idx, key, cont });
    const payload = { by: me.id, idx: s.idx, key, cont: cont || null, ms: Date.now() - shownAtRef.current, ...(pt ? { pt } : {}) };
    if (me.isHost) processRef.current(payload);
    else chanRef.current?.broadcast('answer', payload);
  };

  // Resultado: lo reporta el anfitrión una sola vez.
  useEffect(() => {
    if (!me?.isHost || state?.phase !== 'ended' || !state.winnerId || reportedRef.current) return;
    reportedRef.current = true;
    reportResult(state.winnerId);
    // mode 'duel' para que NO cuente como intento de examen en la tarea.
    onGameComplete?.({ mode: 'duel', score: 0, maxScore: 0, correctAnswers: 0, totalQuestions: 0, durationSeconds: 0 });
  }, [me?.isHost, state?.phase, state?.winnerId, reportResult, onGameComplete]);

  const iWon = state?.phase === 'ended' && state.winnerId === me?.id;
  useEffect(() => {
    if (iWon) confetti({ particleCount: 180, spread: 100, origin: { y: 0.5 }, colors: ['#0ea5e9', '#10b981', '#fbbf24', '#ec4899'] });
  }, [iWon]);

  // Abandono voluntario (AppRunnerPage lo llama al confirmar la salida): cuenta como derrota.
  const meRef = useRef(me);
  const rivalRef = useRef(rival);
  const reportRef = useRef(reportResult);
  useEffect(() => { meRef.current = me; rivalRef.current = rival; reportRef.current = reportResult; }, [me, rival, reportResult]);
  useEffect(() => {
    if (!registerDuelExit) return undefined;
    if (state?.phase === 'ended' || !me?.id || !rival?.id) { registerDuelExit(null); return undefined; }
    const forfeit = async () => {
      const m = meRef.current;
      const rv = rivalRef.current;
      if (!m || !rv) return;
      if (m.isHost) {
        try { await reportRef.current?.(rv.id); } catch { /* ignorar */ }
        chanRef.current?.broadcast('game_end', { winner_id: rv.id });
      } else {
        chanRef.current?.broadcast('forfeit_request', { from: m.id });
        await new Promise((r) => setTimeout(r, 1200));
      }
    };
    registerDuelExit(forfeit);
    return () => registerDuelExit(null);
  }, [registerDuelExit, state?.phase, me?.id, me?.isHost, rival?.id]);

  /* ───────── pantalla ───────── */

  const shell = { ...config.shell, wide: true };
  const idx = state?.idx ?? 0;
  const q = questions?.[idx];
  const phase = state?.phase;
  const done = phase === 'reveal' || phase === 'ended';
  const mine = state?.answers?.[me?.id]?.[idx];
  const theirs = state?.answers?.[rival?.id]?.[idx];
  const pending = myPick?.idx === idx ? myPick : null;
  const myKey = mine?.key ?? pending?.key ?? null;

  const mw = world && q ? scopeOf(world, q.layer) : world;
  const extraLabels = useMemo(() => {
    if (!done || !q || q.kind === 'choice' || !mw) return [];
    const at = (key) => {
      const f = mw.features?.get(key);
      if (f) return f.xy;
      return mw.layer(q.layer).get(key)?.centroid;
    };
    const list = [];
    if (mine && !mine.correct) { const xy = at(mine.key); if (xy) list.push({ x: xy[0], y: xy[1], text: `${ui.you}: ${mw.nameOf(mine.key)}`, tone: 'bad' }); }
    if (theirs && !theirs.correct) { const xy = at(theirs.key); if (xy) list.push({ x: xy[0], y: xy[1], text: `${rival?.name}: ${mw.nameOf(theirs.key)}`, tone: 'bad' }); }
    return list;
  }, [done, q, mw, mine, theirs, rival?.name, ui]);

  const fakeQ = q || { kind: 'choice', options: [], answer: [] };
  const m = useLocateMap(mw || { layer: () => new Map(), views: {}, features: new Map() }, fakeQ, {
    tries: [], done, correct: Boolean(mine?.correct), difficulty: 'exam', extraLabels,
  });

  if (loading || !world || (!questions && !loadErr && !err)) {
    return (
      <GameShell {...shell}>
        <GameLoading label={loading || !world ? ui.preparingDuel : ui.waitingFor(rival?.name)} />
        {channel && me && rival && <DuelChatBar channel={channel} me={me} rival={rival} />}
      </GameShell>
    );
  }
  if (err || loadErr) {
    return (
      <GameShell {...shell}>
        <GameEmpty title={ui.duelLoadError}>{err || loadErr}</GameEmpty>
      </GameShell>
    );
  }

  const myScore = state?.scores?.[me.id] || 0;
  const rivalScore = state?.scores?.[rival.id] || 0;
  const timeLeft = phase === 'question' ? Math.max(0, deadline - now) : 0;
  const statusOf = (ans, isMe) => {
    if (phase === 'question') {
      if (ans || (isMe && pending)) return { tone: 'ready', icon: <Check size={12} strokeWidth={3} />, text: ui.answered };
      return { tone: 'thinking', icon: <Hourglass size={12} />, text: ui.thinking };
    }
    if (phase === 'reveal') {
      if (!ans) return { tone: 'bad', icon: <Clock size={12} />, text: ui.noAnswer };
      return ans.correct
        ? { tone: 'good', icon: <Check size={12} strokeWidth={3} />, text: `+${ans.points}` }
        : { tone: 'bad', icon: <X size={12} strokeWidth={3} />, text: ui.miss };
    }
    return null;
  };
  const marks = done && q?.kind === 'choice' ? (() => {
    const mk = {};
    if (mine) (mk[mine.key] ||= []).push({ label: ui.you, tone: 'me' });
    if (theirs) (mk[theirs.key] ||= []).push({ label: rival.name, tone: 'rival' });
    return mk;
  })() : undefined;
  const results = questions.map((_, i) => {
    const a = state?.answers?.[me.id]?.[i];
    if (i > idx || (i === idx && !done)) return undefined;
    return Boolean(a?.correct);
  });

  return (
    <>
      <GameShell {...shell}>
        <div className="gq-duel">
          <div className="gq-duel__top">
            <PlayerChip player={me} label={ui.you} score={myScore} status={statusOf(mine, true)} side="me" />
            <span className="gq-duel__vs"><Swords size={20} /><small>{Math.min(idx + 1, questions.length)}/{questions.length}</small></span>
            <PlayerChip player={rival} label={ui.rival} score={rivalScore} status={statusOf(theirs, false)} side="rival" />
          </div>

          <ProgressDots total={questions.length} current={idx} results={results} />

          {phase === 'countdown' ? (
            <motion.div key={countdown} className="gq-duel__countdown" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {countdown || ui.go}
            </motion.div>
          ) : phase === 'ended' ? (
            <motion.div className={`gq-duel__final ${iWon ? 'is-won' : 'is-lost'}`} initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
              <span className="gq-duel__medal"><Trophy size={36} /></span>
              <strong>{iWon ? ui.duelWon : ui.duelLost}</strong>
              <span>{myScore.toLocaleString('es-ES')} – {rivalScore.toLocaleString('es-ES')} {ui.pointsSuffix}</span>
              <GameButton variant="soft" icon={LogOut} onClick={() => navigate('/mi-panel')}>{ui.exitToPanel}</GameButton>
            </motion.div>
          ) : q ? (
            <div className="gq-q">
              <div className="gq-duel__timer">
                <ProgressBar value={timeLeft} max={QUESTION_MS} tone={timeLeft < 5000 ? 'bad' : 'good'} label={ui.time} />
                <span><Clock size={13} /> {Math.ceil(timeLeft / 1000)} s</span>
              </div>
              <div className="gq-q__prompt"><h2>{q.prompt}</h2></div>
              {m.isMapQ ? (
                <div className="gq-q__mapwrap">
                  <MapView
                    world={mw}
                    entries={m.layer}
                    view={m.view}
                    states={done ? m.states : (pending ? { [pending.key]: 'selected' } : null)}
                    colorBy="uniform"
                    groupByContinent={q.kind === 'locate-group'}
                    pickable={!done && !pending && q.kind !== 'locate-feature'}
                    features={m.features}
                    featuresPickable={!done && !pending && q.kind === 'locate-feature'}
                    meshes={mw.meshesFor?.(q.layer)}
                    markers={q.kind !== 'locate-feature'}
                    onPick={answer}
                    labels={done ? m.labels : []}
                    overlay={m.overlay}
                    className="gq-map--game"
                    ariaLabel={q.prompt}
                  />
                  {!done && <span className="gq-q__maphelp">{pending ? ui.waitingFor(rival.name) : mapHelpText(q, ui)}</span>}
                </div>
              ) : (
                <div className={`gq-q__body ${['map', 'point', 'feature'].includes(q.subject?.type) ? 'is-wide-visual' : ''}`}>
                  <div className="gq-q__visual"><Subject q={q} world={world} done={done} renderCustom={config.renderSubject} /></div>
                  <Options q={q} world={world} done={done} picked={myKey} onAnswer={(k) => answer(k)} disabled={Boolean(pending)} marks={marks} />
                </div>
              )}
              {done && (
                <div className={`gq-fb ${mine?.correct ? 'is-good' : 'is-bad'}`} role="status">
                  <span className="gq-fb__badge">{mine?.correct ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}</span>
                  <div className="gq-fb__text">
                    <strong>{mine?.correct ? ui.praise[0] : mine ? ui.wrong : ui.timeUp}{mine?.points ? <span className="gq-fb__gain">+{mine.points}</span> : null}</strong>
                    <span>{ui.correctAnswer} <b>{q.answerLabel}</b></span>
                    {q.explain && <span className="gq-fb__explain">{q.explain}</span>}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </GameShell>
      <DuelChatBar channel={channel} me={me} rival={rival} />
    </>
  );
}
