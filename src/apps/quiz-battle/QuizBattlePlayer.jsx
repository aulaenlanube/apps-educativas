import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Trophy, Crown, Zap, Medal, ListOrdered, AlertTriangle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import useQuizChannel from './useQuizChannel';
import useBattlePhrases from './useBattlePhrases';
import BattleRisingMessages from './BattleRisingMessages';
import PhraseLauncher from '@/components/duel/PhraseLauncher';
import BadgeIcon from '@/components/ui/BadgeIcon';
import QBBackground from './QBBackground';
import QBStageAnimation from './QBStageAnimation';
import QBStageAnimationSimple from './QBStageAnimationSimple';
import { ROOM_CODE_RE, sanitizePlainText } from '@/lib/sanitize';
import { GameShell, HudStat, Panel, Chip, GameButton } from '../_shared/kit';
import { QBEmblem, QBShape, QBMedal, QBVerdictArt } from './QBArt';
import { QBNumber, QBAvatar, QBTimerRing, QBTile, QBLeaderboard } from './QBParts';
import './QuizBattle.css';

// Avatares para invitados (sin cuenta): contenido, no ilustración.
const GUEST_EMOJIS = ['🙂', '😎', '🦊', '🐱', '🐸', '🦄', '🎮', '🚀', '⭐', '🔥'];


export default function QuizBattlePlayer() {
  const { code: urlCode } = useParams();
  const { student } = useAuth();
  const navigate = useNavigate();

  // ── Join state ──
  const [roomCode, setRoomCode] = useState(urlCode?.toUpperCase() || '');
  const [joined, setJoined] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmoji, setGuestEmoji] = useState('🙂');
  const [joinError, setJoinError] = useState('');

  // ── Game state ──
  const [phase, setPhase] = useState('join'); // join | waiting | countdown | question | sent | results | final
  const [countdownValue, setCountdownValue] = useState(3);
  const [bgAnimMode, setBgAnimMode] = useState('complex');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLimit, setTimeLimit] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [myDelta, setMyDelta] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [distribution, setDistribution] = useState([0, 0, 0, 0]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);
  const [newBadges, setNewBadges] = useState([]);
  // Permutaciones independientes anti-copia (se barajan al recibir cada pregunta):
  //  - posPerm[visualSlot]   = índice ORIGINAL de la opción que se muestra ahí
  //                            → permuta la POSICIÓN del texto.
  //  - colorPerm[visualSlot] = índice del color/forma que se pinta en ese slot
  //                            → permuta el COLOR (independiente de la posición).
  //  Default [0,1,2,3] en ambos = sin permutar (cuando shuffleColors es false).
  const [posPerm, setPosPerm]     = useState([0, 1, 2, 3]);
  const [colorPerm, setColorPerm] = useState([0, 1, 2, 3]);

  // Team battles: cuando la sala es por equipos, el alumno debe ser el rep
  // de algún equipo. Si no, no se conecta (recibe room:not-team-rep).
  const [teamInfo, setTeamInfo] = useState(null); // { team_id, team_name } cuando soy rep

  const timerRef = useRef(null);
  const questionStartRef = useRef(0);
  const playerIdRef = useRef(student?.id || `guest-${crypto.randomUUID().slice(0, 8)}`);

  // ── User info ──
  const userInfo = useMemo(() => {
    if (student) {
      return {
        id: student.id,
        name: student.display_name,
        emoji: student.avatar_emoji || '🙂',
        color: student.avatar_color,
        selected_avatar_code: student.selected_avatar_code,
      };
    }
    return { id: playerIdRef.current, name: guestName || 'Jugador', emoji: guestEmoji };
  }, [student, guestName, guestEmoji]);

  // ── Channel ──
  const { players, broadcast, onBroadcast, isConnected } = useQuizChannel(
    joined ? roomCode : '',
    userInfo,
    joined
  );

  // Mensajes efímeros que llegan del canal Realtime. Se renderizan como
  // un overlay global (BattleRisingMessages) que sube desde abajo y se
  // difumina; ya no van anclados al avatar de cada jugador.
  // Pasamos `onBroadcast` directamente (referencia estable de useCallback)
  // — si se envuelve en un objeto los timers de expiración se matan en
  // cada render y los mensajes se apilan.
  const { messages: liveMessages, pushPhrase } = useBattlePhrases(
    onBroadcast,
    joined && (phase === 'waiting' || phase === 'results' || phase === 'final'),
  );

  // ── Join handler ──
  const handleJoin = async () => {
    if (!ROOM_CODE_RE.test(roomCode)) {
      setJoinError('Codigo invalido (4-8 letras/digitos)');
      return;
    }
    const cleanName = sanitizePlainText(guestName, 30);
    if (!student) {
      if (!cleanName) { setJoinError('Introduce tu nombre'); return; }
      if (cleanName !== guestName) setGuestName(cleanName);
    }

    // Si la sala es por equipos y este alumno no es representante, abortamos
    // la conexión antes incluso de unirse al canal — así no consume slot.
    if (student?.id) {
      try {
        const { data } = await supabase.rpc('get_team_for_battle', {
          p_room_code: roomCode,
          p_student_id: student.id,
        });
        if (data?.found) {
          if (!data.is_rep) {
            // El alumno está en algún equipo pero no es el rep
            const repName = data.rep_name || 'tu compañero/a';
            setJoinError(`Esta batalla es por equipos. Tu equipo es "${data.team_name}", y solo el representante (${repName}) puede conectarse. Ve a su PC para apoyar.`);
            return;
          }
          setTeamInfo({ team_id: data.team_id, team_name: data.team_name });
        }
      } catch (err) {
        // Si falla la RPC simplemente seguimos como batalla individual; el
        // host hará la validación final igualmente.
        console.warn('QuizBattle: get_team_for_battle failed', err);
      }
    }

    setJoinError('');
    setJoined(true);
    setPhase('waiting');
  };

  // Auto-join if URL has code and student is logged in
  useEffect(() => {
    if (urlCode && student && !joined) {
      setRoomCode(urlCode.toUpperCase());
      setJoined(true);
      setPhase('waiting');
    }
  }, [urlCode, student]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send join request once connected + listen for validation ──
  useEffect(() => {
    if (!joined || !isConnected) return;

    // Send request to host with our group info
    broadcast('player:request-join', {
      playerId: userInfo.id,
      groupId: student?.group_id || null,
    });

    onBroadcast('room:restricted', (data) => {
      if (data.playerId === userInfo.id) {
        setJoinError('Esta sala es solo para un grupo especifico. No tienes acceso.');
        setJoined(false);
        setPhase('join');
      }
    });

    onBroadcast('room:full', (data) => {
      if (data.playerId === userInfo.id) {
        setJoinError('La sala esta llena (maximo 30 jugadores).');
        setJoined(false);
        setPhase('join');
      }
    });

    onBroadcast('room:not-team-rep', (data) => {
      if (data.playerId === userInfo.id) {
        setJoinError('Esta sala es por equipos y solo se conecta el representante de cada equipo. Ve al PC del representante de tu equipo.');
        setJoined(false);
        setPhase('join');
        setTeamInfo(null);
      }
    });

    onBroadcast('room:accepted', (data) => {
      if (data.playerId === userInfo.id && data.team_name) {
        setTeamInfo({ team_id: data.team_id, team_name: data.team_name });
      }
    });
  }, [joined, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for game events ──
  useEffect(() => {
    if (!joined) return;

    onBroadcast('game:start', (data) => {
      setTotalQuestions(data.totalQuestions);
      if (data.bgAnimMode) setBgAnimMode(data.bgAnimMode);
    });

    onBroadcast('game:countdown', (data) => {
      const from = data?.from || 3;
      if (data?.bgAnimMode) setBgAnimMode(data.bgAnimMode);
      setCountdownValue(from);
      setPhase('countdown');
      let n = from;
      const cdInt = setInterval(() => {
        n -= 1;
        if (n <= 0) clearInterval(cdInt);
        else setCountdownValue(n);
      }, 1000);
    });

    onBroadcast('game:question', (data) => {
      if (data.bgAnimMode) setBgAnimMode(data.bgAnimMode);
      setPhase('question');
      setQuestionIndex(data.index);
      setCurrentQuestion({ question: data.question, options: data.options });
      setTimeLimit(data.timeLimit);
      setTimeLeft(data.timeLimit);
      setSelectedAnswer(-1);
      setCorrectIndex(-1);
      // Cada alumno genera dos permutaciones independientes (Fisher-Yates) para
      // que ni la posición ni el color delaten la respuesta. El host recibe el
      // índice ORIGINAL (traducido vía posPerm en handleAnswer), así que nada
      // del scoring cambia.
      if (data.shuffleColors) {
        const shuffle = () => {
          const a = [0, 1, 2, 3];
          for (let k = a.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [a[k], a[j]] = [a[j], a[k]];
          }
          return a;
        };
        setPosPerm(shuffle());
        setColorPerm(shuffle());
      } else {
        setPosPerm([0, 1, 2, 3]);
        setColorPerm([0, 1, 2, 3]);
      }
      questionStartRef.current = Date.now();

      // Local timer
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - questionStartRef.current) / 1000);
        const remaining = Math.max(0, data.timeLimit - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) clearInterval(timerRef.current);
      }, 250);
    });

    onBroadcast('game:timeout', (data) => {
      clearInterval(timerRef.current);
      setCorrectIndex(data.correctIndex);
      setDistribution(data.distribution);
      setLeaderboard(data.leaderboard);

      // Rank/score must come from the full leaderboard, otherwise players
      // outside the top-5 would always see #0 and 0 pts.
      const lookup = Array.isArray(data.fullLeaderboard) && data.fullLeaderboard.length > 0
        ? data.fullLeaderboard
        : data.leaderboard;
      const myEntry = lookup.find((p) => p.id === userInfo.id);
      if (myEntry) {
        setMyScore(myEntry.score);
        setMyDelta(myEntry.lastDelta);
        setMyRank(lookup.indexOf(myEntry) + 1);
      }
      setPhase('results');
    });

    onBroadcast('game:next', () => {
      // Wait for next game:question
    });

    onBroadcast('game:end', (data) => {
      clearInterval(timerRef.current);
      setFinalLeaderboard(data.leaderboard);
      const myEntry = data.leaderboard.find((p) => p.id === userInfo.id);
      if (myEntry) {
        setMyScore(myEntry.score);
        setMyRank(data.leaderboard.indexOf(myEntry) + 1);
      }
      // Extract this student's newly unlocked battle badges (if any)
      const myBadges = data.playerBadges?.[userInfo.id];
      if (Array.isArray(myBadges) && myBadges.length > 0) {
        setNewBadges(myBadges);
      } else {
        setNewBadges([]);
      }
      setPhase('final');
    });
  }, [joined, onBroadcast, userInfo.id]);

  // ── Cleanup timer ──
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Submit answer ──
  // visualSlot = posición que el alumno ha pulsado (0..3 en su pantalla).
  // El host siempre espera el índice ORIGINAL de la opción; traducimos vía posPerm.
  const handleAnswer = (visualSlot) => {
    if (selectedAnswer >= 0) return;
    setSelectedAnswer(visualSlot);
    const originalIndex = posPerm[visualSlot];
    broadcast('player:answer', {
      playerId: userInfo.id,
      playerName: userInfo.name,
      answerIndex: originalIndex,
      timestamp: Date.now(),
    });
    setPhase('sent');
  };

  // ── Derived ──
  // selectedAnswer es la posición visual pulsada; traducimos al índice original
  // antes de comparar con correctIndex (que siempre es el índice original).
  const isCorrect = selectedAnswer >= 0 && posPerm[selectedAnswer] === correctIndex;
  // Posición visual en la que aparece la opción correcta para este alumno
  const correctVisualSlot = correctIndex >= 0 ? posPerm.indexOf(correctIndex) : -1;

  // Confetti cuando el alumno es top-3 al terminar
  useEffect(() => {
    if (phase !== 'final') return;
    if (myRank > 0 && myRank <= 3) {
      const colors = ['#fbbf24', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];
      // Tres ráfagas espaciadas
      [0, 400, 900].forEach((delay, i) => {
        setTimeout(() => {
          confetti({
            particleCount: myRank === 1 ? 120 : 80,
            spread: 80 + i * 20,
            origin: { y: 0.6 },
            colors,
          });
        }, delay);
      });
    }
  }, [phase, myRank]);

  // ═══════════════ RENDER ═══════════════
  const isTimerCritical = phase === 'question' && timeLeft <= 5 && timeLeft > 0;

  // Datos solo de presentación (no alteran el flujo de la batalla).
  const verdict = selectedAnswer < 0 ? 'timeout' : isCorrect ? 'correct' : 'wrong';
  const correctText = currentQuestion && correctIndex >= 0 ? currentQuestion.options[correctIndex] : '';
  const myFinal = finalLeaderboard.find((p) => p.id === userInfo.id);
  const joinDisabled = roomCode.length < 4 || (!student && !guestName.trim());
  // Transiciones de fase cortas y solo de opacidad al salir: con AnimatePresence
  // mode="wait" la fase siguiente no entra hasta que la anterior termina de salir.
  const phaseExit = { opacity: 0, transition: { duration: 0.18 } };
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }, exit: phaseExit };

  return (
    <div className="qb-container">
      <Header subtitle="Batalla" />

      <main className="qb-main">
        <GameShell
          theme="dark"
          accent="#8b5cf6"
          accent2="#ec4899"
          className={`qb-shell qb-shell--player is-${phase}`}
          scene={<QBBackground />}
        >
          <AnimatePresence mode="wait">
            {/* ── JOIN ── */}
            {phase === 'join' && (
              <motion.div key="join" className="qb-phase qb-join" {...fadeUp}>
                <div className="qb-join__hero">
                  <motion.span
                    className="qb-join__emblem"
                    initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  >
                    <QBEmblem size={104} />
                  </motion.span>
                  <h1 className="qb-join__title">Quiz Battle</h1>
                  <p className="qb-join__sub">Únete a la batalla en directo de tu clase</p>
                </div>

                {/* Formulario real para que "Intro"/"Ir" del teclado móvil también una. */}
                <form
                  className="gk-panel gk-panel--surface qb-join__card"
                  onSubmit={(e) => { e.preventDefault(); if (!joinDisabled) handleJoin(); }}
                >
                  {student && (
                    <div className="qb-whoami">
                      <QBAvatar p={userInfo} size="md" />
                      <div>
                        <span className="qb-label">Jugarás como</span>
                        <strong>{userInfo.name}</strong>
                      </div>
                    </div>
                  )}

                  <label className="qb-label" htmlFor="qb-code">Código de la sala</label>
                  <input
                    id="qb-code"
                    className="qb-input qb-input--code"
                    type="text"
                    placeholder="CÓDIGO"
                    maxLength={8}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  />

                  {!student && (
                    <>
                      <label className="qb-label" htmlFor="qb-name">Tu nombre</label>
                      <input
                        id="qb-name"
                        className="qb-input"
                        type="text"
                        placeholder="¿Cómo te llamas?"
                        maxLength={30}
                        autoComplete="off"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value.replace(/[<>]/g, '').slice(0, 30))}
                      />
                      <span className="qb-label">Elige tu avatar</span>
                      <div className="qb-emojis">
                        {GUEST_EMOJIS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            aria-pressed={guestEmoji === e}
                            onClick={() => setGuestEmoji(e)}
                            className={`qb-emoji-btn ${guestEmoji === e ? 'is-active' : ''}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {joinError && (
                    <div className="qb-alert gk-anim-shake" role="alert">
                      <AlertTriangle size={18} />
                      <span>{joinError}</span>
                    </div>
                  )}

                  <GameButton type="submit" variant="primary" size="lg" icon={Zap} disabled={joinDisabled} className="qb-wide-btn">
                    Unirse
                  </GameButton>
                </form>

                <GameButton variant="ghost" icon={ArrowLeft} className="qb-join__back" onClick={() => navigate(student ? '/mi-panel' : '/')}>
                  Volver
                </GameButton>
              </motion.div>
            )}

            {/* ── WAITING ── */}
            {phase === 'waiting' && (
              <motion.div key="waiting-player" className="qb-phase qb-wait" {...fadeUp}>
                <div className="qb-wait__stage">
                  <span className="qb-wait__spot" />
                  <span className="qb-wait__floor" />
                  <span className="qb-wait__ring" />
                  <span className="qb-wait__ring qb-wait__ring--2" />
                  <motion.span
                    className="qb-wait__avatar"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <QBAvatar p={userInfo} size="xl" glow />
                  </motion.span>
                </div>
                <h2 className="qb-wait__name">{userInfo.name}</h2>
                <Chip tone="good" icon={Check}>¡Estás dentro!</Chip>

                {teamInfo && (
                  <motion.div
                    className="qb-team-banner"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <span className="qb-team-banner__kicker"><Crown size={15} /> REPRESENTANTE DEL EQUIPO</span>
                    <strong>{teamInfo.team_name}</strong>
                    <p>Juegas por todo tu equipo. Los demás miembros recibirán los mismos beneficios que tú al final.</p>
                  </motion.div>
                )}

                <p className="qb-wait__msg">
                  Esperando a que el profesor inicie la partida<span className="qb-dots"><i /><i /><i /></span>
                </p>

                <Panel className="qb-wait__room">
                  <motion.span
                    className="qb-live"
                    key={players.length}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <i /> {players.length} en la sala
                  </motion.span>
                  <div className="qb-chips qb-chips--sm">
                    {players.map((p) => (
                      <span key={p.id} className={`qb-pchip ${p.id === userInfo.id ? 'is-me' : ''}`}>
                        <QBAvatar p={p} size="xs" />
                        <span>{p.name}</span>
                      </span>
                    ))}
                  </div>
                </Panel>
              </motion.div>
            )}

            {/* ── COUNTDOWN ── */}
            {phase === 'countdown' && (
              <motion.div key="countdown-player" className="qb-phase qb-countdown"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={phaseExit}>
                {bgAnimMode === 'complex' && <QBStageAnimation intensity="normal" />}
                {bgAnimMode === 'simple' && <QBStageAnimationSimple intensity="normal" />}
                <span className="qb-countdown__label">¡Prepárate!</span>
                <div className="qb-countdown__ring">
                  <span key={`burst${countdownValue}`} className="qb-countdown__burst" />
                  <motion.span
                    key={`cd${countdownValue}`}
                    className="qb-countdown__num"
                    initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  >
                    {countdownValue}
                  </motion.span>
                </div>
                {totalQuestions > 0 && <span className="qb-countdown__sub">{totalQuestions} preguntas</span>}
              </motion.div>
            )}

            {/* ── QUESTION ── */}
            {(phase === 'question' || phase === 'sent') && currentQuestion && (
              <motion.div key={`pq${questionIndex}`} className="qb-phase qb-play qb-play--player"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={phaseExit}>
                <div className="qb-topbar qb-topbar--player">
                  <HudStat icon={ListOrdered} tone="progress" value={`${questionIndex + 1}/${totalQuestions}`} label="Pregunta" />
                  <QBTimerRing timeLeft={timeLeft} timeLimit={timeLimit} size="sm" />
                  <HudStat icon={Trophy} tone="score" value={myScore.toLocaleString('es-ES')} label="Puntos" />
                </div>

                <div className="qb-question-wrap">
                  {bgAnimMode === 'complex' && <QBStageAnimation intensity={isTimerCritical ? 'critical' : 'normal'} />}
                  {bgAnimMode === 'simple' && <QBStageAnimationSimple intensity={isTimerCritical ? 'critical' : 'normal'} />}
                  <motion.div
                    key={`pqtext${questionIndex}`}
                    className="qb-question qb-question--player"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <p className="qb-question__text">{currentQuestion.question}</p>
                  </motion.div>
                </div>

                <div className="qb-tiles qb-tiles--player">
                  {currentQuestion.options.map((_, visualSlot) => {
                    // Slot visual: texto desde posPerm, color/forma desde colorPerm.
                    const origIdx = posPerm[visualSlot];
                    const colorIdx = colorPerm[visualSlot];
                    const opt = currentQuestion.options[origIdx];
                    const state = selectedAnswer < 0 ? 'idle' : selectedAnswer === visualSlot ? 'selected' : 'dim';
                    return (
                      <QBTile
                        key={visualSlot}
                        interactive
                        colorIdx={colorIdx}
                        text={opt}
                        state={state}
                        disabled={selectedAnswer >= 0}
                        onClick={() => handleAnswer(visualSlot)}
                        delay={0.1 + visualSlot * 0.08}
                      />
                    );
                  })}

                  <AnimatePresence>
                    {phase === 'sent' && (
                      <motion.div className="qb-sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={phaseExit}>
                        <motion.div
                          className="qb-sent__card"
                          initial={{ opacity: 0, scale: 0.7, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                        >
                          {selectedAnswer >= 0 && (
                            <span className={`qb-sent__shape qb-tile--c${colorPerm[selectedAnswer]}`}>
                              <QBShape kind={colorPerm[selectedAnswer]} size={44} />
                            </span>
                          )}
                          <strong>Respuesta enviada</strong>
                          <span>¿Habrás acertado? Espera a que se cierre la pregunta<span className="qb-dots"><i /><i /><i /></span></span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {phase === 'results' && (
              <motion.div key="results-player" className="qb-phase qb-feedback" {...fadeUp}>
                {/* My result */}
                <motion.div
                  className={`qb-verdict is-${verdict}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                >
                  <span className="qb-verdict__burst" />
                  <motion.span
                    className="qb-verdict__art"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 12 }}
                  >
                    <QBVerdictArt kind={verdict} size={92} />
                  </motion.span>
                  <strong className="qb-verdict__title">
                    {verdict === 'timeout' ? 'Sin respuesta' : verdict === 'correct' ? '¡Correcto!' : 'Incorrecto'}
                  </strong>
                  {myDelta > 0 && (
                    <motion.span
                      className="qb-verdict__points"
                      initial={{ opacity: 0, y: 8, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.25, type: 'spring', stiffness: 240, damping: 12 }}
                    >
                      +<QBNumber value={myDelta} duration={0.7} /> <small>puntos</small>
                    </motion.span>
                  )}
                  {verdict !== 'correct' && correctText && (
                    <span className="qb-verdict__answer">La respuesta correcta era <b>{correctText}</b></span>
                  )}
                </motion.div>

                <div className="qb-feedback__stats">
                  <HudStat icon={Trophy} tone="score" value={<QBNumber value={myScore} duration={0.9} />} label="Puntos" />
                  <HudStat icon={Medal} tone="streak" value={`#${myRank || '—'}`} label="Puesto" />
                </div>

                {/* Options with correct/wrong highlight (respetando las permutaciones) */}
                {currentQuestion && (
                  <div className="qb-tiles qb-tiles--reveal">
                    {currentQuestion.options.map((_, visualSlot) => {
                      const origIdx = posPerm[visualSlot];
                      const colorIdx = colorPerm[visualSlot];
                      const opt = currentQuestion.options[origIdx];
                      const isThisCorrect = visualSlot === correctVisualSlot;
                      const state = isThisCorrect ? 'correct' : visualSlot === selectedAnswer ? 'wrong' : 'missed';
                      return (
                        <QBTile
                          key={visualSlot}
                          size="sm"
                          colorIdx={colorIdx}
                          text={opt}
                          state={state}
                          count={distribution[origIdx] || 0}
                          delay={0.2 + visualSlot * 0.06}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Mini leaderboard */}
                <Panel className="qb-card">
                  <h2 className="qb-card__title"><Trophy size={18} /> Top 5</h2>
                  <QBLeaderboard entries={leaderboard.slice(0, 5)} meId={userInfo.id} startDelay={500} dense />
                </Panel>

                <p className="qb-wait__msg is-small">
                  Esperando al profesor<span className="qb-dots"><i /><i /><i /></span>
                </p>
              </motion.div>
            )}

            {/* ── FINAL ── */}
            {phase === 'final' && (
              <motion.div key="final-player" className="qb-phase qb-final qb-final--player"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={phaseExit}>
                <div className="qb-final__medal">
                  <span className="qb-final__rays" />
                  <motion.span
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 12 }}
                  >
                    <QBMedal rank={myRank} size={128} />
                  </motion.span>
                </div>

                <motion.h1
                  className="qb-final__title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  style={{ textAlign: 'center' }}
                >
                  {myRank === 1 ? '¡Campeón!' : myRank > 0 && myRank <= 3 ? '¡En el podio!' : 'Resultado final'}
                </motion.h1>

                <motion.div
                  className="qb-final__me"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <QBAvatar p={userInfo} size="md" glow />
                  <strong>{userInfo.name}</strong>
                </motion.div>

                <motion.div
                  className="qb-final__stats"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="qb-bigstat is-score">
                    <QBNumber value={myScore} duration={1.6} className="qb-bigstat__value" />
                    <span>puntos</span>
                  </div>
                  <div className="qb-bigstat">
                    <span className="qb-bigstat__value">
                      {myFinal && totalQuestions > 0 ? `${myFinal.correctCount}/${totalQuestions}` : '—'}
                    </span>
                    <span>aciertos</span>
                  </div>
                  <div className="qb-bigstat">
                    <span className="qb-bigstat__value">#{myRank || '—'}</span>
                    <span>de {finalLeaderboard.length}</span>
                  </div>
                </motion.div>

                {/* New badges unlocked in this battle */}
                {newBadges.length > 0 && (
                  <motion.div
                    className="qb-badges"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <span className="qb-badges__title">
                      <Sparkles size={16} />
                      ¡Insignia{newBadges.length > 1 ? 's' : ''} desbloqueada{newBadges.length > 1 ? 's' : ''}!
                    </span>
                    {newBadges.map((b, i) => (
                      <motion.div
                        key={b.code}
                        className="qb-badge"
                        initial={{ scale: 0, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.3, type: 'spring', stiffness: 180, damping: 14 }}
                      >
                        <BadgeIcon code={b.code} rarity={b.rarity} size={56} animated />
                        <div>
                          <strong>{b.name_es}</strong>
                          <span>{b.description_es}</span>
                          <em>+{b.xp_reward} XP</em>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Full ranking */}
                <Panel className="qb-card">
                  <h2 className="qb-card__title"><ListOrdered size={18} /> Clasificación completa</h2>
                  <QBLeaderboard
                    entries={finalLeaderboard}
                    meId={userInfo.id}
                    animateRanks={false}
                    showDelta={false}
                    startDelay={700}
                    dense
                  />
                </Panel>

                <div className="qb-cta">
                  <GameButton variant="soft" size="lg" icon={ArrowLeft} onClick={() => navigate(student ? '/mi-panel' : '/')}>
                    Volver
                  </GameButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GameShell>
      </main>

      {/* Overlay global de mensajes ascendentes. Aparecen en posiciones
          aleatorias de la parte inferior y suben mientras se difuminan. */}
      {joined && (phase === 'waiting' || phase === 'results' || phase === 'final') && (
        <BattleRisingMessages messages={liveMessages} />
      )}

      {/* Lanzador de frases (botón flotante esquina inferior izquierda).
          Sólo en sala de espera y entre preguntas (no durante la pregunta
          activa para no distraer). Se autoeco la frase enviada para que el
          jugador vea su propio mensaje (el canal Realtime no devuelve el
          broadcast al emisor). */}
      {joined && (phase === 'waiting' || phase === 'results') && (
        <PhraseLauncher
          channel={{ broadcast }}
          me={{ id: userInfo.id }}
          eventName="battle:phrase_message"
          onSent={pushPhrase}
        />
      )}
    </div>
  );
}
