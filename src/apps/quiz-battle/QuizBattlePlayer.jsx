import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Trophy, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import useQuizChannel from './useQuizChannel';
import BadgeIcon from '@/components/ui/BadgeIcon';
import './QuizBattle.css';

const OPTION_COLORS = ['#dc2626', '#2563eb', '#15803d', '#d97706'];
const OPTION_SHAPES = ['\u25B2', '\u25C6', '\u25CF', '\u25A0'];

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
  const [phase, setPhase] = useState('join'); // join | waiting | question | sent | results | final
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
    if (roomCode.length < 4) return;
    if (!student && !guestName.trim()) return;
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
    });

    onBroadcast('game:question', (data) => {
      setPhase('question');
      setQuestionIndex(data.index);
      setCurrentQuestion({ question: data.question, options: data.options });
      setTimeLimit(data.timeLimit);
      setTimeLeft(data.timeLimit);
      setSelectedAnswer(-1);
      setCorrectIndex(-1);
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
  const handleAnswer = (index) => {
    if (selectedAnswer >= 0) return;
    setSelectedAnswer(index);
    broadcast('player:answer', {
      playerId: userInfo.id,
      playerName: userInfo.name,
      answerIndex: index,
      timestamp: Date.now(),
    });
    setPhase('sent');
  };

  // ── Derived ──
  const timerPct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const timerColor = timerPct > 50 ? 'qb-timer-green' : timerPct > 25 ? 'qb-timer-yellow' : 'qb-timer-red';
  const isCorrect = selectedAnswer === correctIndex;

  // ═══════════════ RENDER ═══════════════
  return (
    <div className={`qb-container ${theme === 'dark' ? 'qb-dark' : ''}`}>
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
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            />

            {!student && (
              <>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  maxLength={20}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
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

            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{userInfo.emoji}</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{userInfo.name}</h2>
            <p className="qb-faint-text" style={{ marginTop: '0.5rem' }}>
              Esperando a que el profesor inicie la partida...
            </p>

            <div className="qb-player-count" style={{ marginTop: '1.5rem' }}>
              {players.length} en la sala
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
        {(phase === 'question' || phase === 'sent') && currentQuestion && (
          <motion.div key={`pq${questionIndex}`} className="qb-question-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

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

            <div className="qb-question-text">{currentQuestion.question}</div>

            <div className="qb-options-grid">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  className={`qb-option qb-opt-${i} ${selectedAnswer === i ? 'qb-opt-selected' : ''}`}
                  disabled={selectedAnswer >= 0}
                  onClick={() => handleAnswer(i)}
                >
                  <span className="qb-opt-shape">{OPTION_SHAPES[i]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {phase === 'sent' && (
              <div className="qb-sent-msg">Respuesta enviada</div>
            )}
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && (
          <motion.div key="results-player" className="qb-results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* My result */}
            <div className="qb-my-result">
              <div className="qb-my-result-icon">
                {selectedAnswer < 0 ? '⏰' : isCorrect ? '✅' : '❌'}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                {selectedAnswer < 0 ? 'Sin respuesta' : isCorrect ? 'Correcto!' : 'Incorrecto'}
              </div>
              {myDelta > 0 && (
                <div className="qb-my-result-points">+{myDelta} puntos</div>
              )}
              <div className="qb-my-result-total">
                Total: {myScore.toLocaleString('es-ES')} pts | Puesto #{myRank}
              </div>
            </div>

            {/* Options with correct/wrong highlight */}
            {currentQuestion && (
              <div className="qb-options-grid" style={{ marginBottom: '1.5rem' }}>
                {currentQuestion.options.map((opt, i) => {
                  let extra = '';
                  if (i === correctIndex) extra = 'qb-opt-correct';
                  else if (selectedAnswer === i) extra = 'qb-opt-wrong';
                  else extra = 'qb-opt-wrong';
                  return (
                    <div key={i} className={`qb-option qb-opt-${i} ${extra}`} style={{ cursor: 'default' }}>
                      <span className="qb-opt-shape">{OPTION_SHAPES[i]}</span>
                      <span>{opt}</span>
                      {i === correctIndex && <Check className="w-5 h-5" style={{ marginLeft: 'auto' }} />}
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

            <div className="qb-final-title">Resultado Final</div>

            {/* My result prominently */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              style={{
                fontSize: '4rem', fontWeight: 900, color: 'var(--qb-score-color)',
                textShadow: '0 0 20px var(--qb-code-shadow)', marginBottom: '0.5rem'
              }}>
              #{myRank}
            </motion.div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {userInfo.emoji} {userInfo.name}
            </p>
            <p style={{ color: 'var(--qb-score-color)', fontWeight: 900, fontSize: '1.1rem', marginBottom: '2rem' }}>
              {myScore.toLocaleString('es-ES')} puntos
            </p>

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
