import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Copy, Play, SkipForward, Crown, Users, Clock, Zap, Trophy, StopCircle, FileText, Shuffle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import useQuizChannel, { generateRoomCode } from './useQuizChannel';
import { buildQuizQuestions } from './quizQuestionBuilder';
import { useTheme } from '@/contexts/ThemeContext';
import materiasData from '../../../public/data/materias.json';
import QBBackground from './QBBackground';
import QBStageAnimation from './QBStageAnimation';
import QBStageAnimationSimple from './QBStageAnimationSimple';
import './QuizBattle.css';

const OPTION_COLORS = ['#dc2626', '#2563eb', '#15803d', '#d97706'];
const OPTION_SHAPES = ['⭐', '❤️', '🔵', '🟩']; // emojis por opcion
const RANK_MEDALS = ['', '1', '2', '3', '4', '5'];

const getSubjects = (level, grade) => {
  if (!level || !grade) return [];
  const curso = materiasData?.[level]?.[String(grade)];
  return Array.isArray(curso) ? curso : [];
};

export default function QuizBattleHost() {
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  // ── Config state ──
  const [sourceMode, setSourceMode] = useState('random'); // 'random' | 'template'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [roomType, setRoomType] = useState('open'); // 'open' | 'group'
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [level, setLevel] = useState('primaria');
  const [grade, setGrade] = useState('1');
  const [subjectId, setSubjectId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(20);
  const [battleDifficulty, setBattleDifficulty] = useState('experto');
  const [shuffleColors, setShuffleColors] = useState(false); // cada alumno ve colores distintos
  const [bgAnimMode, setBgAnimMode] = useState('complex'); // 'none' | 'simple' | 'complex'

  const MAX_PLAYERS = 30;

  // ── Quota state ──
  const [quota, setQuota] = useState(null); // { quota, used, remaining }

  useEffect(() => {
    if (!teacher?.id) return;
    supabase.rpc('get_teacher_quiz_battle_quota', { p_teacher_id: teacher.id })
      .then(({ data }) => { if (data && !data.error) setQuota(data); });
  }, [teacher?.id]);

  // ── Game state ──
  const [phase, setPhase] = useState('config'); // config | waiting | countdown | question | results | final
  const [countdownValue, setCountdownValue] = useState(3);
  const [roomCode, setRoomCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({}); // { playerId: answerIndex }
  const [scores, setScores] = useState({}); // { playerId: { score, streak, lastDelta, correctCount } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);
  const questionStartRef = useRef(0);
  const answersRef = useRef({});
  const gamePlayersRef = useRef([]);
  const finishQuestionRef = useRef(null);
  // Filas acumuladas (player × pregunta) para persistir al acabar la batalla
  const questionResultsRef = useRef([]);

  const subjects = useMemo(() => getSubjects(level, parseInt(grade, 10)), [level, grade]);

  // Fetch teacher groups + templates
  useEffect(() => {
    const loadData = async () => {
      const [grpRes, tplRes] = await Promise.all([
        supabase.rpc('get_teacher_groups'),
        supabase.rpc('get_teacher_quiz_templates', { p_teacher_id: teacher?.id }),
      ]);
      if (Array.isArray(grpRes.data)) setGroups(grpRes.data);
      if (Array.isArray(tplRes.data)) setTemplates(tplRes.data);
    };
    if (teacher?.id) loadData();
  }, [teacher?.id]);

  // Auto-fill level/grade/subject from selected group
  useEffect(() => {
    if (roomType === 'group' && selectedGroupId) {
      const g = groups.find((gr) => gr.id === selectedGroupId);
      if (g?.level) setLevel(g.level);
      if (g?.grade) setGrade(String(g.grade));
      if (g?.subject_id) setSubjectId(g.subject_id);
    }
  }, [roomType, selectedGroupId, groups]);

  // Auto-select first subject
  useEffect(() => {
    if (subjects.length > 0 && !subjects.find((s) => s.id === subjectId)) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Channel ──
  const userInfo = useMemo(() => ({
    id: teacher?.id || 'host',
    name: teacher?.display_name || 'Profesor',
    emoji: '🎓',
    isHost: true,
  }), [teacher]);

  const { players, broadcast, onBroadcast, isConnected } = useQuizChannel(
    roomCode,
    userInfo,
    phase !== 'config'
  );

  // Filter out host from player list
  const gamePlayers = useMemo(() =>
    players.filter((p) => p.id !== userInfo.id),
    [players, userInfo.id]
  );

  // Keep refs in sync so the timer callback always reads the latest state
  useEffect(() => { gamePlayersRef.current = gamePlayers; }, [gamePlayers]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // ── Validate new players joining (group mode + max cap) ──
  useEffect(() => {
    if (phase === 'config' || !isConnected) return;

    onBroadcast('player:request-join', (data) => {
      const playerCount = gamePlayers.length;

      // Max players check
      if (playerCount >= MAX_PLAYERS) {
        broadcast('room:full', { playerId: data.playerId });
        return;
      }

      // Group restriction check
      if (roomType === 'group' && selectedGroupId) {
        if (!data.groupId || data.groupId !== selectedGroupId) {
          broadcast('room:restricted', { playerId: data.playerId });
          return;
        }
      }

      broadcast('room:accepted', { playerId: data.playerId });
    });
  }, [phase, isConnected, gamePlayers.length, roomType, selectedGroupId, onBroadcast, broadcast]);

  // ── Listen for player answers ──
  useEffect(() => {
    if (phase !== 'question') return;
    onBroadcast('player:answer', (data) => {
      setAnswers((prev) => {
        if (prev[data.playerId] !== undefined) return prev; // already answered
        // Store per-player answer timestamp (ms) so speed bonus is individual
        return {
          ...prev,
          [data.playerId]: {
            answerIndex: data.answerIndex,
            answeredAtMs: Date.now(),
          },
        };
      });
    });
  }, [phase, onBroadcast]);

  // ── Auto-cerrar pregunta cuando todos hayan respondido ──
  useEffect(() => {
    if (phase !== 'question') return;
    if (gamePlayers.length === 0) return;
    const answered = Object.keys(answers).length;
    if (answered >= gamePlayers.length) {
      const t = setTimeout(() => finishQuestionRef.current?.(currentQ), 400);
      return () => clearTimeout(t);
    }
  }, [phase, answers, gamePlayers.length, currentQ]);

  // ── Create room ──
  const handleCreateRoom = async () => {
    if (roomType === 'group' && !selectedGroupId) {
      toast({ title: 'Selecciona un grupo', variant: 'destructive' });
      return;
    }
    // Check quota
    if (quota && quota.remaining <= 0) {
      toast({
        title: 'Limite mensual alcanzado',
        description: `Has usado ${quota.used}/${quota.quota} partidas este mes. Contacta con el administrador.`,
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      let qs;

      if (sourceMode === 'template' && selectedTemplateId) {
        // Load template questions
        const { data: tpl } = await supabase.rpc('get_quiz_template', {
          p_template_id: selectedTemplateId,
          p_teacher_id: teacher.id,
        });
        if (!tpl || !Array.isArray(tpl.questions) || tpl.questions.length < 4) {
          toast({ title: 'La batalla no tiene suficientes preguntas', variant: 'destructive' });
          setLoading(false);
          return;
        }
        qs = tpl.questions;
      } else {
        qs = await buildQuizQuestions(level, parseInt(grade, 10), subjectId, questionCount, battleDifficulty);
      }

      if (!qs || qs.length < 4) {
        toast({ title: 'No hay suficientes preguntas', description: 'Prueba con otra asignatura o curso', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const code = generateRoomCode();
      setQuestions(qs);
      setRoomCode(code);
      setPhase('waiting');

      // Solo en modo "Solo mi grupo" se envía notificación a los alumnos del grupo
      // para que puedan unirse con un clic. En modo "Abierta" no se notifica:
      // los alumnos entran manualmente con el código.
      if (roomType === 'group' && selectedGroupId) {
        const groupName = groups.find((g) => g.id === selectedGroupId)?.name || 'tu grupo';
        try {
          await supabase.rpc('notify_group_quiz_battle', {
            p_group_id: selectedGroupId,
            p_teacher_name: teacher?.display_name || 'Tu profesor',
            p_room_code: code,
            p_group_name: groupName,
          });
        } catch (err) {
          console.warn('QuizBattle: could not send notifications', err);
        }
      }
    } catch (err) {
      console.error('QuizBattle: error building questions', err);
      toast({ title: 'Error al cargar preguntas', variant: 'destructive' });
    }
    setLoading(false);
  };

  // ── Start game ──
  const handleStart = () => {
    // Init scores for all connected players
    const initScores = {};
    gamePlayers.forEach((p) => {
      initScores[p.id] = { score: 0, streak: 0, lastDelta: 0, correctCount: 0 };
    });
    setScores(initScores);
    setCurrentQ(0);
    questionResultsRef.current = []; // reset detalle para la nueva partida
    broadcast('game:start', { totalQuestions: questions.length, bgAnimMode });
    // Cuenta atras 3,2,1 antes de la primera pregunta
    setCountdownValue(3);
    setPhase('countdown');
    broadcast('game:countdown', { from: 3, bgAnimMode });
    let n = 3;
    const cdInt = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(cdInt);
        launchQuestion(0);
      } else {
        setCountdownValue(n);
      }
    }, 1000);
  };

  // ── Launch a question ──
  const launchQuestion = useCallback((index) => {
    const q = questions[index];
    if (!q) return;
    setPhase('question');
    setCurrentQ(index);
    setAnswers({});
    setTimeLeft(timeLimit);
    questionStartRef.current = Date.now();

    // Broadcast question (without correct answer!)
    broadcast('game:question', {
      index,
      total: questions.length,
      question: q.question,
      options: q.options,
      timeLimit,
      shuffleColors, // cada jugador permuta sus propios colores si está activo
      bgAnimMode,
    });

    // Start timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartRef.current) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        // Use ref to always call the latest finishQuestion (avoids stale closure
        // that would leave `answers` snapshot empty when timer expires naturally)
        finishQuestionRef.current?.(index);
      }
    }, 250);
  }, [questions, timeLimit, broadcast, shuffleColors]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Finish question — score & broadcast ──
  // Called by timer OR by teacher pressing "Cerrar pregunta"
  const finishQuestion = useCallback((index) => {
    clearInterval(timerRef.current);
    const q = questions[index];
    if (!q) return;

    // Read latest answers and player list from refs (not closure) to avoid stale
    // state when invoked from the interval timer after many re-renders
    const finalAnswers = { ...answersRef.current };
    const currentPlayers = gamePlayersRef.current;

    const totalMs = timeLimit * 1000;
    const MAX_TIME_BONUS = 100; // hasta +100 puntos por responder al instante
    // Filas de detalle para persistir (una por jugador presente en la pregunta)
    const qRows = [];

    setScores((prev) => {
      const updated = { ...prev };

      Object.entries(finalAnswers).forEach(([playerId, ans]) => {
        // ans: { answerIndex, answeredAtMs }
        const answerIndex = ans?.answerIndex;
        const answeredAtMs = ans?.answeredAtMs ?? Date.now();
        if (!updated[playerId]) {
          updated[playerId] = { score: 0, streak: 0, lastDelta: 0, correctCount: 0 };
        }
        const isCorrect = answerIndex === q.correctIndex;
        let delta = 0;
        if (isCorrect) {
          updated[playerId].streak += 1;
          updated[playerId].correctCount += 1;
          const base = 100;
          const streakBonus = Math.min(updated[playerId].streak - 1, 5) * 20;
          // Bonus por velocidad individual (cada decima/ms cuenta)
          const elapsedMs = Math.max(0, answeredAtMs - questionStartRef.current);
          const remainingMs = Math.max(0, totalMs - elapsedMs);
          const timeBonus = totalMs > 0
            ? Math.round((remainingMs / totalMs) * MAX_TIME_BONUS)
            : 0;
          delta = base + streakBonus + timeBonus;
          updated[playerId].score += delta;
          updated[playerId].lastDelta = delta;
        } else {
          updated[playerId].streak = 0;
          updated[playerId].lastDelta = 0;
        }

        // Guardar fila de detalle para este jugador
        const responseMs = Math.max(0, answeredAtMs - questionStartRef.current);
        const player = currentPlayers.find((p) => p.id === playerId);
        qRows.push({
          playerId,
          display_name: player?.name || '',
          avatar_emoji: player?.emoji || '',
          question_index: index,
          question_text: q.question,
          correct_text: q.correct,
          answer_index: answerIndex,
          correct_index: q.correctIndex,
          is_correct: isCorrect,
          score_delta: delta,
          response_time_ms: responseMs,
        });
      });

      // Players who didn't answer: fila con answer_index=null, score=0
      currentPlayers.forEach((p) => {
        if (finalAnswers[p.id] === undefined) {
          if (updated[p.id]) {
            updated[p.id].streak = 0;
            updated[p.id].lastDelta = 0;
          }
          qRows.push({
            playerId: p.id,
            display_name: p.name || '',
            avatar_emoji: p.emoji || '',
            question_index: index,
            question_text: q.question,
            correct_text: q.correct,
            answer_index: null,
            correct_index: q.correctIndex,
            is_correct: false,
            score_delta: 0,
            response_time_ms: null,
          });
        }
      });

      return updated;
    });

    // Acumula las filas de detalle para persistirlas al final de la batalla
    questionResultsRef.current.push(...qRows);

    const dist = [0, 0, 0, 0];
    Object.values(finalAnswers).forEach((ans) => {
      const idx = ans?.answerIndex;
      if (typeof idx === 'number' && idx >= 0 && idx <= 3) dist[idx]++;
    });

    setPhase('results');

    setTimeout(() => {
      setScores((currentScores) => {
        const lb = buildLeaderboard(currentScores, gamePlayersRef.current);
        broadcast('game:timeout', {
          correctIndex: q.correctIndex,
          correct: q.correct,
          distribution: dist,
          leaderboard: lb.slice(0, 5),
          fullLeaderboard: lb, // para que cada alumno fuera del top-5 pueda ver su rank
        });
        return currentScores;
      });
    }, 50);
  }, [questions, timeLimit, broadcast]);

  // Keep ref in sync so setInterval callback always uses the latest version
  useEffect(() => { finishQuestionRef.current = finishQuestion; }, [finishQuestion]);

  // ── Close question early (teacher button) ──
  const handleCloseQuestion = () => {
    finishQuestion(currentQ);
  };

  // ── Next question ──
  const handleNext = () => {
    const next = currentQ + 1;
    if (next >= questions.length) {
      handleEndGame();
    } else {
      broadcast('game:next', {});
      launchQuestion(next);
    }
  };

  // ── End game ──
  const handleEndGame = async () => {
    setPhase('final');
    const lb = buildLeaderboard(scores, gamePlayers);

    // Persist results first so the RPC can return per-player new badges; then
    // broadcast game:end with that info so students see their unlocks live.
    setSaving(true);
    let playerBadges = {};
    try {
      const playersPayload = lb.map((p, i) => ({
        user_type: p.id.startsWith('guest-') ? 'guest' : 'student',
        user_id: p.id.startsWith('guest-') ? null : p.id,
        display_name: p.name,
        avatar_emoji: p.emoji,
        rank: i + 1,
        score: p.score,
        correct_answers: scores[p.id]?.correctCount || 0,
      }));

      const { data } = await supabase.rpc('save_quiz_battle_results', {
        p_room_code: roomCode,
        p_host_id: teacher?.id || null,
        p_level: level,
        p_grade: grade,
        p_subject_id: subjectId,
        p_time_per_question: timeLimit,
        p_total_questions: questions.length,
        p_players: playersPayload,
      });
      if (data?.player_badges && typeof data.player_badges === 'object') {
        playerBadges = data.player_badges;
      }

      // Persistir detalle (pregunta × jugador) para el historial del dashboard.
      // Mapeamos playerId → user_id/user_type tal como se envió en playersPayload
      // para que los alumnos autenticados queden enlazados con su UUID real.
      if (questionResultsRef.current.length > 0) {
        try {
          const rows = questionResultsRef.current.map((r) => {
            const isGuest = typeof r.playerId === 'string' && r.playerId.startsWith('guest-');
            return {
              user_id: isGuest ? null : r.playerId,
              user_type: isGuest ? 'guest' : 'student',
              display_name: r.display_name,
              avatar_emoji: r.avatar_emoji,
              question_index: r.question_index,
              question_text: r.question_text,
              correct_text: r.correct_text,
              answer_index: r.answer_index,
              correct_index: r.correct_index,
              is_correct: r.is_correct,
              score_delta: r.score_delta,
              response_time_ms: r.response_time_ms,
            };
          });
          await supabase.rpc('save_quiz_battle_question_results', {
            p_room_code: roomCode,
            p_rows: rows,
          });
        } catch (err) {
          console.warn('QuizBattle: error saving question details', err);
        }
      }
    } catch (err) {
      console.error('QuizBattle: error saving results', err);
    }
    setSaving(false);

    broadcast('game:end', { leaderboard: lb, playerBadges });
  };

  // ── Helpers ──
  function buildLeaderboard(scoresObj, playerList) {
    return playerList
      .map((p) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        score: scoresObj[p.id]?.score || 0,
        lastDelta: scoresObj[p.id]?.lastDelta || 0,
        correctCount: scoresObj[p.id]?.correctCount || 0,
      }))
      .sort((a, b) => b.score - a.score);
  }

  const leaderboard = useMemo(
    () => buildLeaderboard(scores, gamePlayers),
    [scores, gamePlayers]
  );

  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0];
    Object.values(answers).forEach((ans) => {
      const idx = ans?.answerIndex;
      if (typeof idx === 'number' && idx >= 0 && idx <= 3) dist[idx]++;
    });
    return dist;
  }, [answers]);

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentQ];
  const timerPct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const timerColor = timerPct > 50 ? 'qb-timer-green' : timerPct > 25 ? 'qb-timer-yellow' : 'qb-timer-red';

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quiz-battle/join/${roomCode}`
    : '';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({ title: 'Codigo copiado', description: roomCode });
  };

  // ── Cleanup ──
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Confetti final: ráfagas laterales cuando entramos en fase 'final' ──
  useEffect(() => {
    if (phase !== 'final') return;
    const duration = 3500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const frame = () => {
      const timeLeftMs = animationEnd - Date.now();
      if (timeLeftMs <= 0) return;
      const particleCount = 50 * (timeLeftMs / duration);
      confetti({ ...defaults, particleCount,
        origin: { x: Math.random() * 0.2, y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'] });
      confetti({ ...defaults, particleCount,
        origin: { x: 1 - Math.random() * 0.2, y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'] });
      requestAnimationFrame(frame);
    };
    frame();
  }, [phase]);

  // ═══════════════ RENDER ═══════════════
  const isTimerCritical = phase === 'question' && timeLeft <= 5 && timeLeft > 0;

  return (
    <div className={`qb-container ${theme === 'dark' ? 'qb-dark' : ''}`}>
      <QBBackground />
      <Header subtitle="Batalla" />

      <AnimatePresence mode="wait">
        {/* ── CONFIG ── */}
        {phase === 'config' && (
          <motion.div key="config" className="qb-config"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="qb-config-card">
              <div className="qb-config-title">Batalla</div>

              {/* Room type selector */}
              <div className="qb-field">
                <label>Tipo de sala</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setRoomType('open')}
                    className={`qb-toggle-btn ${roomType === 'open' ? 'is-active' : ''}`}>
                    <Users className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Abierta (max {MAX_PLAYERS})
                  </button>
                  <button type="button" onClick={() => setRoomType('group')}
                    className={`qb-toggle-btn ${roomType === 'group' ? 'is-active' : ''}`}>
                    <Crown className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Solo mi grupo
                  </button>
                </div>
              </div>

              {/* Group selector (only for group mode) */}
              {roomType === 'group' && (
                <div className="qb-field">
                  <label>Grupo</label>
                  <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                    <option value="">-- Selecciona un grupo --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.student_count || 0} alumnos)
                        {g.level && g.grade ? ` - ${g.level === 'bachillerato' ? 'Bach.' : g.level === 'primaria' ? 'Prim' : 'ESO'} ${g.grade}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Source mode */}
              <div className="qb-field">
                <label>Origen de las preguntas</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setSourceMode('random')}
                    className={`qb-toggle-btn ${sourceMode === 'random' ? 'is-active' : ''}`}>
                    <Shuffle className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Aleatorio
                  </button>
                  <button type="button" onClick={() => setSourceMode('template')}
                    className={`qb-toggle-btn ${sourceMode === 'template' ? 'is-active' : ''}`}>
                    <FileText className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Batalla
                  </button>
                </div>
              </div>

              {sourceMode === 'random' ? (
                <>
                  <div className="qb-field">
                    <label>Nivel</label>
                    <select value={level} onChange={(e) => { setLevel(e.target.value); setGrade('1'); }}>
                      <option value="primaria">Primaria</option>
                      <option value="eso">ESO</option>
                      <option value="bachillerato">Bachillerato</option>
                    </select>
                  </div>

                  <div className="qb-field">
                    <label>Curso</label>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                      {(level === 'primaria' ? [1,2,3,4,5,6] : level === 'eso' ? [1,2,3,4] : [1,2]).map((g) => (
                        <option key={g} value={g}>{g}o {level === 'primaria' ? 'Primaria' : level === 'eso' ? 'ESO' : 'Bach.'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dificultad de la batalla */}
                  <div className="qb-field">
                    <label>Dificultad</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      {[
                        { id: 'principiante', emoji: '🟢', label: 'Principiante' },
                        { id: 'intermedio', emoji: '🟡', label: 'Intermedio' },
                        { id: 'avanzado', emoji: '🟠', label: 'Avanzado' },
                        { id: 'experto', emoji: '🔴', label: 'Experto' },
                      ].map(d => (
                        <button key={d.id} type="button"
                          onClick={() => setBattleDifficulty(d.id)}
                          className={`qb-toggle-btn ${battleDifficulty === d.id ? 'is-active' : ''}`}
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}>
                          {d.emoji} {d.label}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', lineHeight: 1.3 }}>
                      {battleDifficulty === 'principiante' && 'Preguntas fáciles de cursos anteriores y cultura general.'}
                      {battleDifficulty === 'intermedio' && 'Mezcla de la asignatura actual con repasos de cursos anteriores.'}
                      {battleDifficulty === 'avanzado' && 'Solo la asignatura seleccionada, dificultad media-alta.'}
                      {battleDifficulty === 'experto' && 'Todo del temario de la asignatura y nivel. El máximo reto.'}
                    </p>
                  </div>

                  <div className="qb-field">
                    <label>Asignatura</label>
                    <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.icon} {s.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="qb-field">
                    <label>Preguntas: {questionCount}</label>
                    <input type="range" min="5" max="20" value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))} />
                    <div className="qb-range-val">{questionCount}</div>
                  </div>
                </>
              ) : (
                <div className="qb-field">
                  <label>Selecciona una batalla</label>
                  {templates.length === 0 ? (
                    <p className="qb-faint-text" style={{ fontSize: '0.8rem', padding: '0.5rem 0' }}>
                      No tienes batallas creadas. Crealas desde el panel del profesor, pestana "Batallas".
                    </p>
                  ) : (
                    <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                      <option value="">-- Elige batalla --</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.question_count} preguntas)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="qb-field">
                <label>Tiempo por pregunta: {timeLimit}s</label>
                <input type="range" min="10" max="30" step="5" value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))} />
                <div className="qb-range-val">{timeLimit}s</div>
              </div>

              {/* Animacion de fondo */}
              <div className="qb-field">
                <label>Animacion de fondo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { v: 'none',    icon: '🚫', label: 'Sin animacion',  desc: 'Interfaz limpia' },
                    { v: 'simple',  icon: '◯',  label: 'Simple',         desc: 'Anillos minimalistas' },
                    { v: 'complex', icon: '✨', label: 'Compleja',        desc: 'Efectos espectaculares' },
                  ].map(opt => (
                    <button key={opt.v} type="button"
                      onClick={() => setBgAnimMode(opt.v)}
                      className={`qb-toggle-btn ${bgAnimMode === opt.v ? 'is-active' : ''}`}
                      style={{ padding: '0.7rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{opt.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.7, marginTop: 2, fontWeight: 500 }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Anti-copia: cada alumno ve colores distintos */}
              <div className="qb-field">
                <label>Anti-copia</label>
                <button type="button"
                  onClick={() => setShuffleColors(v => !v)}
                  className={`qb-toggle-btn ${shuffleColors ? 'is-active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.3rem' }}>{shuffleColors ? '🎨' : '🔓'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>
                        {shuffleColors ? 'Colores aleatorios por alumno' : 'Colores iguales para todos'}
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 2, fontWeight: 500 }}>
                        {shuffleColors
                          ? 'Cada alumno ve las opciones en colores distintos. Evita copiar "la roja".'
                          : 'Activa esta opción para que cada alumno vea las opciones con un orden de colores distinto.'}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Quota info */}
              {quota && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: 12, marginBottom: '0.5rem',
                  background: quota.remaining > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(220,38,38,0.15)',
                  border: `1px solid ${quota.remaining > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
                  color: quota.remaining > 0 ? '#6ee7b7' : '#fca5a5',
                  fontSize: '0.8rem', fontWeight: 600, textAlign: 'center',
                }}>
                  {quota.remaining > 0
                    ? `${quota.remaining} partida${quota.remaining !== 1 ? 's' : ''} disponible${quota.remaining !== 1 ? 's' : ''} este mes (${quota.used}/${quota.quota} usadas)`
                    : `Limite alcanzado: ${quota.used}/${quota.quota} partidas este mes`}
                </div>
              )}

              <button className="qb-btn-primary" onClick={handleCreateRoom}
                disabled={
                  loading
                  || (quota && quota.remaining <= 0)
                  || (sourceMode === 'random' && !subjectId)
                  || (sourceMode === 'template' && !selectedTemplateId)
                }>
                {loading ? 'Cargando preguntas...'
                  : quota && quota.remaining <= 0 ? 'Sin partidas disponibles'
                  : 'Crear sala'}
              </button>

              <button className="qb-btn-back" onClick={() => navigate('/dashboard')}
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                <ArrowLeft className="w-4 h-4" /> Volver al panel
              </button>
            </div>
          </motion.div>
        )}

        {/* ── WAITING ── */}
        {phase === 'waiting' && (
          <motion.div key="waiting" className="qb-waiting"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Mode badge */}
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                background: roomType === 'group' ? 'rgba(139,92,246,0.3)' : 'rgba(16,185,129,0.3)',
                color: roomType === 'group' ? '#c4b5fd' : '#6ee7b7',
                border: `1px solid ${roomType === 'group' ? 'rgba(139,92,246,0.4)' : 'rgba(16,185,129,0.4)'}`,
              }}>
                {roomType === 'group' ? (
                  <><Crown className="w-3 h-3" /> Solo grupo: {groups.find((g) => g.id === selectedGroupId)?.name}</>
                ) : (
                  <><Users className="w-3 h-3" /> Sala abierta (max {MAX_PLAYERS})</>
                )}
              </span>
            </div>

            <p className="qb-faint-text" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              {roomType === 'group'
                ? 'Tus alumnos han recibido una notificacion'
                : 'Comparte este codigo con los jugadores'}
            </p>

            <div className="qb-room-code" onClick={handleCopyCode} title="Click para copiar">
              {roomCode}
            </div>
            <p className="qb-join-url">{joinUrl}</p>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <motion.span
                className="qb-player-count-ring"
                key={gamePlayers.length}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Users className="w-4 h-4" />
                {gamePlayers.length} jugador{gamePlayers.length !== 1 ? 'es' : ''} en directo
              </motion.span>
            </div>

            <div className="qb-players-grid">
              <AnimatePresence>
                {gamePlayers.map((p) => (
                  <motion.div key={p.id} className="qb-player-card"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}>
                    <div className="qb-player-emoji">{p.emoji}</div>
                    <div className="qb-player-name">{p.name}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button className="qb-btn-primary" onClick={handleStart}
              disabled={gamePlayers.length < 1}
              style={{ maxWidth: 320, margin: '0 auto' }}>
              <Play className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Empezar ({questions.length} preguntas)
            </button>
          </motion.div>
        )}

        {/* ── QUESTION ── */}
        {phase === 'countdown' && (
          <motion.div key="countdown-host" className="qb-countdown"
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

        {phase === 'question' && currentQuestion && (
          <motion.div key={`q${currentQ}`} className="qb-question-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {bgAnimMode === 'complex' && <QBStageAnimation intensity={isTimerCritical ? 'critical' : 'normal'} />}
            {bgAnimMode === 'simple'  && <QBStageAnimationSimple intensity={isTimerCritical ? 'critical' : 'normal'} />}

            <div className="qb-header">
              <span className="qb-q-number">Pregunta {currentQ + 1}/{questions.length}</span>
              <span className="qb-answer-count">
                {answeredCount}/{gamePlayers.length} respuestas
              </span>
            </div>

            <div className="qb-timer-bar">
              <div className={`qb-timer-fill ${timerColor}`} style={{ width: `${timerPct}%` }} />
            </div>

            <div className={`qb-timer-big ${isTimerCritical ? 'is-critical' : ''}`}>{timeLeft}</div>

            <motion.div
              key={`qtext${currentQ}`}
              className="qb-question-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              {currentQuestion.question}
            </motion.div>

            <div className="qb-options-grid">
              {currentQuestion.options.map((opt, i) => (
                <motion.div key={i} className={`qb-option qb-opt-${i}`} style={{ cursor: 'default' }}
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <span className="qb-opt-shape">{OPTION_SHAPES[i]}</span>
                  <span>{opt}</span>
                </motion.div>
              ))}
            </div>

            <button
              className="qb-btn-primary"
              onClick={handleCloseQuestion}
              style={{ maxWidth: 360, margin: '1.5rem auto 0', background: 'linear-gradient(135deg, #dc2626, #7f1d1d)', boxShadow: '0 4px 20px rgba(220,38,38,0.4)' }}
            >
              <StopCircle className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Cerrar pregunta ({answeredCount}/{gamePlayers.length})
            </button>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && currentQuestion && (
          <motion.div key="results" className="qb-results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            <div className="qb-results-title">
              Respuesta correcta: <strong style={{ color: '#10b981' }}>{currentQuestion.correct}</strong>
            </div>

            {/* Distribution chart — si shuffleColors, mostramos por texto (los colores
                que vio cada alumno son distintos, así que el color deja de tener sentido
                como identificador). */}
            <div className="qb-chart">
              {currentQuestion.options.map((opt, i) => {
                const count = distribution[i];
                const maxCount = Math.max(...distribution, 1);
                const pct = (count / maxCount) * 100;
                const isCorrect = i === currentQuestion.correctIndex;
                const labelBg = shuffleColors
                  ? (isCorrect ? '#10b981' : '#64748b')
                  : OPTION_COLORS[i];
                const barBg = shuffleColors
                  ? (isCorrect ? '#10b981' : 'rgba(100,116,139,0.85)')
                  : OPTION_COLORS[i];
                const label = shuffleColors
                  ? ['A', 'B', 'C', 'D'][i]
                  : OPTION_SHAPES[i];
                return (
                  <div key={i} className="qb-chart-row">
                    <div className="qb-chart-label" style={{ background: labelBg }}>
                      {label}
                    </div>
                    <div className="qb-chart-bar-track">
                      <motion.div
                        className={`qb-chart-bar-fill ${isCorrect ? 'is-correct' : ''}`}
                        style={{ background: barBg }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 8)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        {opt}
                        {isCorrect && (
                          <Check className="w-4 h-4" style={{ marginLeft: 'auto', marginRight: 6 }} />
                        )}
                      </motion.div>
                    </div>
                    <span className="qb-chart-count">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard top 5 */}
            <div className="qb-leaderboard">
              <div className="qb-lb-title">
                <Trophy className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Clasificacion
              </div>
              {leaderboard.slice(0, 5).map((p, i) => (
                <motion.div key={p.id} className="qb-lb-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}>
                  <span className="qb-lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="qb-lb-emoji">{p.emoji}</span>
                  <span className="qb-lb-name">{p.name}</span>
                  {p.lastDelta > 0 && (
                    <span className="qb-lb-delta">+{p.lastDelta}</span>
                  )}
                  <span className="qb-lb-score">{p.score.toLocaleString('es-ES')}</span>
                </motion.div>
              ))}
            </div>

            <button className="qb-btn-primary" onClick={handleNext}
              style={{ maxWidth: 360, margin: '0 auto' }}>
              <SkipForward className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              {currentQ + 1 < questions.length
                ? `Siguiente (${currentQ + 2}/${questions.length})`
                : 'Ver resultados finales'}
            </button>
          </motion.div>
        )}

        {/* ── FINAL ── */}
        {phase === 'final' && (
          <motion.div key="final" className="qb-final"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

            <motion.div className="qb-final-title"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
              🏆 Resultado Final 🏆
            </motion.div>

            {/* Podium top 3 */}
            <div className="qb-podium">
              {leaderboard[0] && <span className="qb-podium-rays" />}
              {[1, 0, 2].map((podiumIdx) => {
                const p = leaderboard[podiumIdx];
                if (!p) return null;
                const delay = podiumIdx === 0 ? 0.7 : podiumIdx === 1 ? 0.3 : 1.0;
                return (
                  <motion.div key={p.id} className={`qb-podium-col qb-podium-${podiumIdx + 1}`}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay, type: 'spring', stiffness: 120, damping: 18 }}>
                    <div className="qb-podium-emoji">{p.emoji}</div>
                    <div className="qb-podium-name">{p.name}</div>
                    <div className="qb-podium-score">{p.score.toLocaleString('es-ES')} pts</div>
                    <motion.div className="qb-podium-bar"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      style={{ transformOrigin: 'bottom' }}
                      transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}>
                      {podiumIdx + 1}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full ranking */}
            <div className="qb-leaderboard">
              <div className="qb-lb-title">Clasificacion completa</div>
              {leaderboard.map((p, i) => (
                <motion.div key={p.id} className="qb-lb-row"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.05, duration: 0.3 }}>
                  <span className="qb-lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="qb-lb-emoji">{p.emoji}</span>
                  <span className="qb-lb-name">{p.name}</span>
                  <span className="qb-lb-score">{p.score.toLocaleString('es-ES')}</span>
                </motion.div>
              ))}
            </div>

            <button className="qb-btn-back" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" /> Volver al panel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
