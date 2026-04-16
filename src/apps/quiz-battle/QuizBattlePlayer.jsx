import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, X, Trophy, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import useQuizChannel from './useQuizChannel';
import BadgeIcon from '@/components/ui/BadgeIcon';
import QBBackground from './QBBackground';
import QBStageAnimation from './QBStageAnimation';
import QBStageAnimationSimple from './QBStageAnimationSimple';
import { ROOM_CODE_RE, sanitizePlainText } from '@/lib/sanitize';
import './QuizBattle.css';

/** Contador que anima de 0 hasta `to` en `duration` segundos, con formato ES. */
function AnimatedNumber({ value, duration = 0.9, className, style, suffix = '' }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString('es-ES') + suffix);
  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <motion.span className={className} style={style}>{rounded}</motion.span>;
}

const OPTION_COLORS = ['#dc2626', '#2563eb', '#15803d', '#d97706'];
const OPTION_SHAPES = ['⭐', '❤️', '🔵', '🟩'];

export default function QuizBattlePlayer() {
  const { code: urlCode } = useParams();
  const { student } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

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

  const timerRef = useRef(null);
  const questionStartRef = useRef(0);
  const playerIdRef = useRef(student?.id || `guest-${crypto.randomUUID().slice(0, 8)}`);

  // ── User info ──
  const userInfo = useMemo(() => {
    if (student) {
      return { id: student.id, name: student.display_name, emoji: student.avatar_emoji || '🙂' };
    }
    return { id: playerIdRef.current, name: guestName || 'Jugador', emoji: guestEmoji };
  }, [student, guestName, guestEmoji]);

  // ── Channel ──
  const { players, broadcast, onBroadcast, isConnected } = useQuizChannel(
    joined ? roomCode : '',
    userInfo,
    joined
  );

  // ── Join handler ──
  const handleJoin = () => {
    if (!ROOM_CODE_RE.test(roomCode)) {
      setJoinError('Codigo invalido (4-8 letras/digitos)');
      return;
    }
    const cleanName = sanitizePlainText(guestName, 30);
    if (!student) {
      if (!cleanName) { setJoinError('Introduce tu nombre'); return; }
      if (cleanName !== guestName) setGuestName(cleanName);
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
  const timerPct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const timerColor = timerPct > 50 ? 'qb-timer-green' : timerPct > 25 ? 'qb-timer-yellow' : 'qb-timer-red';
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

  return (
    <div className={`qb-container ${theme === 'dark' ? 'qb-dark' : ''}`}>
      <QBBackground />
      <Header subtitle="Batalla" />

      <AnimatePresence mode="wait">
        {/* ── JOIN ── */}
        {phase === 'join' && (
          <motion.div key="join" className="qb-join"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚡</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Unirse al Quiz</h1>

            <input
              type="text"
              placeholder="CODIGO"
              maxLength={8}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
            />

            {!student && (
              <>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  maxLength={30}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value.replace(/[<>]/g, '').slice(0, 30))}
                  style={{ fontSize: '1rem', letterSpacing: 'normal', marginBottom: '0.75rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {['🙂', '😎', '🦊', '🐱', '🐸', '🦄', '🎮', '🚀', '⭐', '🔥'].map((e) => (
                    <button key={e} onClick={() => setGuestEmoji(e)}
                      style={{
                        fontSize: '1.5rem', padding: '0.3rem', border: '2px solid',
                        borderColor: guestEmoji === e ? '#fbbf24' : 'transparent',
                        borderRadius: 8, background: guestEmoji === e ? 'rgba(251,191,36,0.2)' : 'transparent',
                        cursor: 'pointer',
                      }}>{e}</button>
                  ))}
                </div>
              </>
            )}

            {joinError && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 12, marginBottom: '1rem',
                background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)',
                color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600,
              }}>
                {joinError}
              </div>
            )}

            <button className="qb-btn-primary" onClick={handleJoin}
              disabled={roomCode.length < 4 || (!student && !guestName.trim())}>
              Unirse
            </button>

            <button className="qb-btn-back" onClick={() => navigate(student ? '/mi-panel' : '/')}
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </motion.div>
        )}

        {/* ── WAITING ── */}
        {phase === 'waiting' && (
          <motion.div key="waiting-player" className="qb-waiting"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="qb-player-emoji-ripple"
              style={{ fontSize: '3.2rem', marginBottom: '0.5rem' }}
            >
              {userInfo.emoji}
            </motion.div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{userInfo.name}</h2>
            <p className="qb-faint-text" style={{ marginTop: '0.5rem' }}>
              Esperando a que el profesor inicie la partida...
            </p>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <motion.span className="qb-player-count-ring"
                key={players.length}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                {players.length} en la sala
              </motion.span>
            </div>

            <div className="qb-players-grid">
              {players.map((p) => (
                <div key={p.id} className="qb-player-card">
                  <div className="qb-player-emoji">{p.emoji}</div>
                  <div className="qb-player-name">{p.name}</div>
                </div>
              ))}
            </div>

            <div className="qb-spinner" style={{ minHeight: 60 }} />
          </motion.div>
        )}

        {/* ── QUESTION ── */}
        {phase === 'countdown' && (
          <motion.div key="countdown-player" className="qb-countdown"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {bgAnimMode === 'complex' && <QBStageAnimation intensity="normal" />}
            {bgAnimMode === 'simple'  && <QBStageAnimationSimple intensity="normal" />}
            <p className="qb-countdown-label">Preparate...</p>
            <motion.div
              key={`cd${countdownValue}`}
              className="qb-countdown-num"
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            >
              {countdownValue}
            </motion.div>
          </motion.div>
        )}

        {(phase === 'question' || phase === 'sent') && currentQuestion && (
          <motion.div key={`pq${questionIndex}`} className="qb-question-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {bgAnimMode === 'complex' && <QBStageAnimation intensity={isTimerCritical ? 'critical' : 'normal'} />}
            {bgAnimMode === 'simple'  && <QBStageAnimationSimple intensity={isTimerCritical ? 'critical' : 'normal'} />}

            <div className="qb-header">
              <span className="qb-q-number">
                {questionIndex + 1}/{totalQuestions}
              </span>
              <span className="qb-answer-count">
                <Clock className="w-3.5 h-3.5" style={{ display: 'inline', verticalAlign: 'middle' }} /> {timeLeft}s
              </span>
            </div>

            <div className="qb-timer-bar">
              <div className={`qb-timer-fill ${timerColor}`} style={{ width: `${timerPct}%` }} />
            </div>

            <div className={`qb-timer-big ${isTimerCritical ? 'is-critical' : ''}`}>{timeLeft}</div>

            <motion.div
              key={`pqtext${questionIndex}`}
              className="qb-question-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              {currentQuestion.question}
            </motion.div>

            <div className="qb-options-grid">
              {currentQuestion.options.map((_, visualSlot) => {
                // Slot visual: texto desde posPerm, color/forma desde colorPerm.
                const origIdx  = posPerm[visualSlot];
                const colorIdx = colorPerm[visualSlot];
                const opt = currentQuestion.options[origIdx];
                return (
                  <motion.button
                    key={visualSlot}
                    className={`qb-option qb-opt-${colorIdx} ${selectedAnswer === visualSlot ? 'qb-opt-selected' : ''}`}
                    disabled={selectedAnswer >= 0}
                    onClick={() => handleAnswer(visualSlot)}
                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1 + visualSlot * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="qb-opt-shape">{OPTION_SHAPES[colorIdx]}</span>
                    <span>{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {phase === 'sent' && (
              <motion.div
                className="qb-sent-msg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check className="w-6 h-6" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Respuesta enviada
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && (
          <motion.div key="results-player" className="qb-results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* My result */}
            <motion.div
              className={`qb-my-result ${selectedAnswer < 0 ? 'is-timeout' : isCorrect ? 'is-correct' : 'is-wrong'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            >
              <div className={`qb-my-result-icon ${selectedAnswer < 0 ? 'is-timeout' : isCorrect ? 'is-correct' : 'is-wrong'}`}>
                {selectedAnswer < 0 ? '⏰' : isCorrect ? '✅' : '❌'}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                {selectedAnswer < 0 ? 'Sin respuesta' : isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </div>
              {myDelta > 0 && (
                <motion.div
                  className="qb-my-result-points"
                  initial={{ opacity: 0, y: 8, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 240, damping: 12 }}
                >
                  +<AnimatedNumber value={myDelta} duration={0.7} /> puntos
                </motion.div>
              )}
              <div className="qb-my-result-total">
                Total: <AnimatedNumber value={myScore} duration={0.9} /> pts &nbsp;·&nbsp; Puesto #{myRank || '—'}
              </div>
            </motion.div>

            {/* Options with correct/wrong highlight (respetando las permutaciones) */}
            {currentQuestion && (
              <div className="qb-options-grid" style={{ marginBottom: '1.5rem' }}>
                {currentQuestion.options.map((_, visualSlot) => {
                  const origIdx  = posPerm[visualSlot];
                  const colorIdx = colorPerm[visualSlot];
                  const opt = currentQuestion.options[origIdx];
                  const isThisCorrect = visualSlot === correctVisualSlot;
                  const extra = isThisCorrect ? 'qb-opt-correct' : 'qb-opt-wrong';
                  return (
                    <div key={visualSlot}
                      className={`qb-option qb-opt-${colorIdx} ${extra}`}
                      style={{ cursor: 'default' }}>
                      <span className="qb-opt-shape">{OPTION_SHAPES[colorIdx]}</span>
                      <span>{opt}</span>
                      {isThisCorrect && <Check className="w-5 h-5" style={{ marginLeft: 'auto' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mini leaderboard */}
            <div className="qb-leaderboard">
              <div className="qb-lb-title">Top 5</div>
              {leaderboard.slice(0, 5).map((p, i) => (
                <div key={p.id} className={`qb-lb-row ${p.id === userInfo.id ? 'qb-opt-selected' : ''}`}
                  style={p.id === userInfo.id ? { background: 'rgba(251,191,36,0.15)', borderRadius: 10 } : {}}>
                  <span className="qb-lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="qb-lb-emoji">{p.emoji}</span>
                  <span className="qb-lb-name">{p.name}</span>
                  <span className="qb-lb-score">{p.score.toLocaleString('es-ES')}</span>
                </div>
              ))}
            </div>

            <p className="qb-faint-text" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
              Esperando al profesor...
            </p>
          </motion.div>
        )}

        {/* ── FINAL ── */}
        {phase === 'final' && (
          <motion.div key="final-player" className="qb-final"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

            <div className="qb-final-title">
              {myRank === 1 ? '🏆 ¡CAMPEÓN! 🏆' : myRank <= 3 ? '🏅 ¡En el podio! 🏅' : 'Resultado Final'}
            </div>

            {/* My result prominently */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              style={{
                fontSize: '5rem', fontWeight: 900, color: 'var(--qb-score-color)',
                textShadow: '0 0 24px var(--qb-code-shadow)', marginBottom: '0.25rem',
                lineHeight: 1,
              }}>
              #{myRank || '—'}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem', marginRight: 8 }}>{userInfo.emoji}</span>
              {userInfo.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'var(--qb-score-color)', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>
              <AnimatedNumber value={myScore} duration={1.6} /> <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>puntos</span>
            </motion.p>

            {/* New badges unlocked in this battle */}
            {newBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  margin: '0 auto 2rem',
                  padding: '1rem',
                  maxWidth: 420,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(236,72,153,0.18))',
                  border: '2px solid rgba(251,191,36,0.5)',
                  borderRadius: 16,
                  boxShadow: '0 0 30px rgba(251,191,36,0.25)',
                }}
              >
                <div style={{
                  fontSize: '0.9rem', fontWeight: 900, textAlign: 'center',
                  color: '#fbbf24', marginBottom: '0.75rem', letterSpacing: '0.05em',
                }}>
                  ¡INSIGNIA{newBadges.length > 1 ? 'S' : ''} DESBLOQUEADA{newBadges.length > 1 ? 'S' : ''}!
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {newBadges.map((b, i) => (
                    <motion.div
                      key={b.code}
                      initial={{ scale: 0, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{
                        delay: 0.6 + i * 0.3,
                        type: 'spring', stiffness: 180, damping: 14,
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.85rem',
                        padding: '0.6rem 0.8rem', borderRadius: 12,
                        background: 'rgba(0,0,0,0.25)',
                      }}
                    >
                      <BadgeIcon code={b.code} rarity={b.rarity} size={56} animated />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 900, fontSize: '1rem', color: '#fef3c7' }}>
                          {b.name_es}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.3 }}>
                          {b.description_es}
                        </div>
                        <div style={{
                          marginTop: 2, fontSize: '0.75rem', fontWeight: 800,
                          color: '#fbbf24',
                        }}>
                          +{b.xp_reward} XP
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Full ranking */}
            <div className="qb-leaderboard">
              <div className="qb-lb-title">Clasificacion completa</div>
              {finalLeaderboard.map((p, i) => (
                <div key={p.id} className="qb-lb-row"
                  style={p.id === userInfo.id ? { background: 'rgba(251,191,36,0.15)', borderRadius: 10 } : {}}>
                  <span className="qb-lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="qb-lb-emoji">{p.emoji}</span>
                  <span className="qb-lb-name">{p.name}</span>
                  <span className="qb-lb-score">{p.score.toLocaleString('es-ES')}</span>
                </div>
              ))}
            </div>

            <button className="qb-btn-back" onClick={() => navigate(student ? '/mi-panel' : '/')}>
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
