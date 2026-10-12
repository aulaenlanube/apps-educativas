import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Play, SkipForward, Crown, Users, User, Clock, Zap, Trophy, StopCircle, FileText, Shuffle, Check,
  Layers, Settings2, DoorOpen, BookOpen, Gamepad2, Ban, Circle, Sparkles, Palette, GraduationCap, ListOrdered,
  BarChart3, Target, Loader2, Shield,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import useQuizChannel, { generateRoomCode } from './useQuizChannel';
import useBattlePhrases from './useBattlePhrases';
import BattleRisingMessages from './BattleRisingMessages';
import { buildQuizQuestions, difficultyLabel, GLOBAL_SUBJECT_ID } from './quizQuestionBuilder';
import TeamSetupPanel from './TeamSetupPanel';
import materiasData from '../../../public/data/materias.json';
import QBBackground from './QBBackground';
import QBStageAnimation from './QBStageAnimation';
import QBStageAnimationSimple from './QBStageAnimationSimple';
import { GameShell, GameHeader, Hud, HudStat, ProgressBar, Panel, Chip, GameButton, Segmented } from '../_shared/kit';
import { QBEmblem, QBShape, QBTrophy, QBVerdictArt } from './QBArt';
import { QBAvatar, QBTimerRing, QBTile, QBLeaderboard, QBDistribution, QBPodium, QBQrCode, QBCodeTiles } from './QBParts';
import './QuizBattle.css';

// Solo presentación (rediseño 2026): letras de las opciones cuando el anti-copia
// está activo y tono de color de la dificultad.
const LETTERS = ['A', 'B', 'C', 'D'];
const difficultyTone = (n) => (n <= 4 ? 'easy' : n <= 6 ? 'medium' : 'exam');
const BG_ANIM_OPTIONS = [
  { v: 'none', Icon: Ban, label: 'Sin animación', desc: 'Interfaz limpia' },
  { v: 'simple', Icon: Circle, label: 'Simple', desc: 'Anillos minimalistas' },
  { v: 'complex', Icon: Sparkles, label: 'Compleja', desc: 'Efectos espectaculares' },
];
const TERM_OPTIONS = [
  { value: '1', label: '1ª ev.' },
  { value: '2', label: '2ª ev.' },
  { value: '3', label: '3ª ev.' },
  { value: 'none', label: 'No cuenta' },
];

const getSubjects = (level, grade) => {
  if (!level || !grade) return [];
  const curso = materiasData?.[level]?.[String(grade)];
  return Array.isArray(curso) ? curso : [];
};

// Heurística calendario escolar ES: sep–dic → 1ª, ene–mar → 2ª, abr–ago → 3ª.
// El docente puede override en el selector.
const guessCurrentTerm = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 9 && m <= 12) return 1;
  if (m >= 1 && m <= 3) return 2;
  return 3;
};

export default function QuizBattleHost() {
  const { teacher } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Config state ──
  const [sourceMode, setSourceMode] = useState('random'); // 'random' | 'template'
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [roomType, setRoomType] = useState('open'); // 'open' | 'group'
  const [battleKind, setBattleKind] = useState('individual'); // 'individual' | 'team' (solo en modo grupo)
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [level, setLevel] = useState('primaria');
  const [grade, setGrade] = useState('1');
  const [subjectId, setSubjectId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(20);
  const [battleDifficulty, setBattleDifficulty] = useState(7); // 1-10 (antes 'experto')
  // Equipos confirmados: [{ name, rep_student_id, member_ids[], team_id? }]
  const [confirmedTeams, setConfirmedTeams] = useState([]);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [shuffleColors, setShuffleColors] = useState(false); // cada alumno ve colores distintos
  const [bgAnimMode, setBgAnimMode] = useState('complex'); // 'none' | 'simple' | 'complex'
  // Evaluación a la que cuenta esta batalla (1|2|3|null). null => no suma a la nota.
  const [battleTerm, setBattleTerm] = useState(() => guessCurrentTerm());

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

  // Auto-select first subject (preserva __global__ si ya estaba elegido)
  useEffect(() => {
    if (subjectId === GLOBAL_SUBJECT_ID) return;
    if (subjects.length > 0 && !subjects.find((s) => s.id === subjectId)) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si dejamos modo grupo o cambia el grupo, descartamos los equipos para
  // evitar arrastrar configuraciones huérfanas.
  useEffect(() => {
    if (roomType !== 'group' || battleKind !== 'team') {
      setConfirmedTeams([]);
    }
  }, [roomType, battleKind, selectedGroupId]);

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

  // Mensajes efímeros de los jugadores. El host sólo los muestra (no envía)
  // a través del overlay global BattleRisingMessages. `onBroadcast` se pasa
  // directo (estable) para no matar los timers en cada render.
  const { messages: liveMessages } = useBattlePhrases(
    onBroadcast,
    phase === 'waiting' || phase === 'results' || phase === 'final',
  );

  // Filter out host from player list
  const gamePlayers = useMemo(() =>
    players.filter((p) => p.id !== userInfo.id),
    [players, userInfo.id]
  );

  // En batalla por equipos: para los renders mostramos el nombre del EQUIPO
  // (no el del rep). Lo computamos como otra capa, sin alterar la lógica
  // interna que sigue indexando por rep_student_id.
  const isTeamBattle = roomType === 'group' && battleKind === 'team' && confirmedTeams.length > 0;
  const teamByRepIdMemo = useMemo(
    () => new Map(confirmedTeams.map(t => [t.rep_student_id, t])),
    [confirmedTeams]
  );
  const decoratePlayer = useCallback((p) => {
    if (!isTeamBattle) return p;
    const team = teamByRepIdMemo.get(p.id);
    if (!team) return p;
    return { ...p, name: team.name, rep_name: p.name };
  }, [isTeamBattle, teamByRepIdMemo]);

  // Keep refs in sync so the timer callback always reads the latest state
  useEffect(() => { gamePlayersRef.current = gamePlayers; }, [gamePlayers]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // ── Validate new players joining (group mode + max cap + team rep) ──
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

      // En batalla por equipos solo aceptamos al representante de cada equipo.
      // Los demás miembros del equipo deben acudir al PC del rep, no conectarse.
      if (battleKind === 'team' && confirmedTeams.length > 0) {
        const team = confirmedTeams.find((t) => t.rep_student_id === data.playerId);
        if (!team) {
          broadcast('room:not-team-rep', { playerId: data.playerId });
          return;
        }
        // Anunciar al alumno qué equipo representa para que el cliente
        // pueda mostrar el banner correspondiente.
        broadcast('room:accepted', {
          playerId: data.playerId,
          team_id: team.team_id || null,
          team_name: team.name,
        });
        return;
      }

      broadcast('room:accepted', { playerId: data.playerId });
    });
  }, [phase, isConnected, gamePlayers.length, roomType, selectedGroupId, battleKind, confirmedTeams, onBroadcast, broadcast]);

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
    // Preflight: en modo grupo, validar que el grupo tenga horario de clase y estemos en franja
    if (roomType === 'group' && selectedGroupId) {
      const { data: runCheck } = await supabase.rpc('teacher_group_can_run_now', { p_group_id: selectedGroupId });
      if (runCheck && !runCheck.allowed) {
        toast({
          variant: 'destructive',
          title: !runCheck.has_hours ? 'Horario no configurado' : 'Fuera de horario',
          description: runCheck.reason || 'No se puede lanzar la batalla ahora.',
        });
        return;
      }
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

      const groupName = groups.find((g) => g.id === selectedGroupId)?.name || 'tu grupo';

      // En modo "Por equipos" usamos teacher_create_team_battle (graba teams +
      // notifica solo al rep de cada equipo, los demás miembros reciben aviso
      // informativo de que su rep es quien debe conectarse).
      if (roomType === 'group' && battleKind === 'team' && confirmedTeams.length > 0) {
        try {
          const teamsPayload = confirmedTeams.map(t => ({
            name: t.name,
            rep_student_id: t.rep_student_id,
            member_ids: t.member_ids,
          }));
          const { data, error } = await supabase.rpc('teacher_create_team_battle', {
            p_group_id: selectedGroupId,
            p_room_code: code,
            p_teams: teamsPayload,
            p_teacher_name: teacher?.display_name || 'Tu profesor',
            p_group_name: groupName,
          });
          if (error || data?.error) {
            console.warn('QuizBattle: error creating team battle', error || data?.error);
            toast({ title: 'Error al notificar equipos', variant: 'destructive' });
          }
        } catch (err) {
          console.warn('QuizBattle: could not create team battle', err);
        }
      } else if (roomType === 'group' && selectedGroupId) {
        // Modo individual con grupo: notificación masiva clásica.
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
      // En team battles, cada lb[i] es un rep; lo convertimos a fila por equipo
      // (un solo "p_player" por equipo, con team_id + played_by_user_id) para
      // que la RPC replique el resultado a TODOS los miembros del equipo.
      const isTeamBattle = roomType === 'group' && battleKind === 'team' && confirmedTeams.length > 0;
      const teamByRepId = new Map(confirmedTeams.map(t => [t.rep_student_id, t]));

      const playersPayload = isTeamBattle
        ? lb.map((p, i) => {
            const team = teamByRepId.get(p.id);
            return {
              team_id: team?.team_id || null,
              team_name: team?.name || '',
              played_by_user_id: p.id,
              member_ids: team?.member_ids || [p.id],
              rank: i + 1,
              score: p.score,
              correct_answers: scores[p.id]?.correctCount || 0,
            };
          })
        : lb.map((p, i) => ({
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
        p_term: battleTerm,
        p_group_id: roomType === 'group' ? selectedGroupId : null,
        p_battle_kind: isTeamBattle ? 'team' : 'individual',
        p_difficulty: typeof battleDifficulty === 'number' ? battleDifficulty : null,
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
      .map((p) => {
        const dec = decoratePlayer(p);
        return {
          id: p.id,
          name: dec.name,
          rep_name: dec.rep_name || null,
          emoji: p.emoji,
          color: p.color || null,
          selected_avatar_code: p.selected_avatar_code || null,
          score: scoresObj[p.id]?.score || 0,
          lastDelta: scoresObj[p.id]?.lastDelta || 0,
          correctCount: scoresObj[p.id]?.correctCount || 0,
        };
      })
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

  // Datos solo de presentación (no alteran el flujo de la batalla).
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const diffInfo = difficultyLabel(battleDifficulty);
  const joinPath = joinUrl.replace(/^https?:\/\//, '').replace(/\/[^/]*$/, '');
  const answeredPlayers = gamePlayers.filter((p) => answers[p.id] !== undefined);
  const needsTeams = roomType === 'group' && battleKind === 'team' && confirmedTeams.length < 2;
  const createDisabled = loading
    || (quota && quota.remaining <= 0)
    || (sourceMode === 'random' && !subjectId)
    || (sourceMode === 'template' && !selectedTemplateId)
    || needsTeams;
  const createLabel = loading ? 'Cargando preguntas...'
    : quota && quota.remaining <= 0 ? 'Sin partidas disponibles'
      : needsTeams ? 'Configura los equipos primero'
        : 'Crear sala';
  const pct = (v, min, max) => `${((v - min) / (max - min)) * 100}%`;
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
          wide
          accent="#8b5cf6"
          accent2="#ec4899"
          className={`qb-shell qb-shell--host is-${phase}`}
          scene={<QBBackground />}
        >
          <AnimatePresence mode="wait">
            {/* ── CONFIG ── */}
            {phase === 'config' && (
              <motion.div key="config" className="qb-phase qb-config" {...fadeUp}>
                <GameHeader
                  title="Quiz Battle"
                  subtitle="Batalla en directo"
                  icon={<QBEmblem size={60} />}
                  right={quota && (
                    <Chip tone={quota.remaining > 0 ? 'good' : 'bad'} icon={Zap}>
                      {quota.remaining > 0
                        ? `${quota.remaining} partida${quota.remaining !== 1 ? 's' : ''} este mes`
                        : 'Sin partidas este mes'}
                    </Chip>
                  )}
                />

                <div className="qb-config__grid">
                  <div className="qb-config__col">
                    {/* Sala */}
                    <Panel className="qb-card">
                      <h2 className="qb-card__title"><DoorOpen size={18} /> Sala</h2>

                      <div className="qb-field">
                        <span className="qb-label">Tipo de sala</span>
                        <div className="qb-seg-full">
                          <Segmented
                            value={roomType}
                            onChange={setRoomType}
                            options={[
                              { value: 'open', label: `Abierta (máx. ${MAX_PLAYERS})`, icon: Users },
                              { value: 'group', label: 'Solo mi grupo', icon: Crown },
                            ]}
                          />
                        </div>
                      </div>

                      {/* Group selector (only for group mode) */}
                      {roomType === 'group' && (
                        <div className="qb-field">
                          <label className="qb-label" htmlFor="qb-group">Grupo</label>
                          <select id="qb-group" className="qb-select" value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
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

                      {/* Modalidad: individual vs equipos (solo en modo grupo) */}
                      {roomType === 'group' && selectedGroupId && (
                        <div className="qb-field">
                          <span className="qb-label">Modalidad</span>
                          <div className="qb-seg-full">
                            <Segmented
                              value={battleKind}
                              onChange={setBattleKind}
                              options={[
                                { value: 'individual', label: 'Individual', icon: User },
                                { value: 'team', label: 'Por equipos', icon: Layers },
                              ]}
                            />
                          </div>
                          {battleKind === 'team' && (
                            <>
                              <p className="qb-help is-warn">
                                Solo el representante de cada equipo se conecta al PC. Los demás miembros van presencialmente y reciben los beneficios igual.
                              </p>
                              <GameButton
                                variant={confirmedTeams.length > 0 ? 'success' : 'warning'}
                                icon={confirmedTeams.length > 0 ? Check : Settings2}
                                onClick={() => setShowTeamSetup(true)}
                                className="qb-wide-btn"
                              >
                                {confirmedTeams.length > 0
                                  ? `${confirmedTeams.length} equipos configurados (cambiar)`
                                  : 'Configurar equipos'}
                              </GameButton>
                            </>
                          )}
                        </div>
                      )}
                    </Panel>

                    {/* Preguntas */}
                    <Panel className="qb-card">
                      <h2 className="qb-card__title"><BookOpen size={18} /> Preguntas</h2>

                      <div className="qb-field">
                        <span className="qb-label">Origen de las preguntas</span>
                        <div className="qb-seg-full">
                          <Segmented
                            value={sourceMode}
                            onChange={setSourceMode}
                            options={[
                              { value: 'random', label: 'Aleatorio', icon: Shuffle },
                              { value: 'template', label: 'Batalla', icon: FileText },
                            ]}
                          />
                        </div>
                      </div>

                      {sourceMode === 'random' ? (
                        <>
                          <div className="qb-field-row">
                            <div className="qb-field">
                              <label className="qb-label" htmlFor="qb-level">Nivel</label>
                              <select id="qb-level" className="qb-select" value={level} onChange={(e) => { setLevel(e.target.value); setGrade('1'); }}>
                                <option value="primaria">Primaria</option>
                                <option value="eso">ESO</option>
                                <option value="bachillerato">Bachillerato</option>
                              </select>
                            </div>
                            <div className="qb-field">
                              <label className="qb-label" htmlFor="qb-grade">Curso</label>
                              <select id="qb-grade" className="qb-select" value={grade} onChange={(e) => setGrade(e.target.value)}>
                                {(level === 'primaria' ? [1, 2, 3, 4, 5, 6] : level === 'eso' ? [1, 2, 3, 4] : [1, 2]).map((g) => (
                                  <option key={g} value={g}>{g}º {level === 'primaria' ? 'Primaria' : level === 'eso' ? 'ESO' : 'Bach.'}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="qb-field">
                            <label className="qb-label" htmlFor="qb-subject">Asignatura</label>
                            <select id="qb-subject" className="qb-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                              <option value={GLOBAL_SUBJECT_ID}>🌐 Global (todas las asignaturas)</option>
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.icon} {s.nombre}</option>
                              ))}
                            </select>
                            {subjectId === GLOBAL_SUBJECT_ID && (
                              <p className="qb-help is-warn">Las preguntas vendrán de TODAS las asignaturas del nivel y curso elegido.</p>
                            )}
                          </div>

                          {/* Dificultad de la batalla — escala 1-10 */}
                          <div className="qb-field">
                            <div className="qb-field__head">
                              <label className="qb-label" htmlFor="qb-diff">Dificultad</label>
                              <span className="qb-field__value">
                                {battleDifficulty}<small>/10</small>{' '}
                                <Chip tone="mode" className={`gk-tone-${difficultyTone(battleDifficulty)}`}>{diffInfo.label}</Chip>
                              </span>
                            </div>
                            <input
                              id="qb-diff" className="qb-range" type="range" min="1" max="10" step="1"
                              value={typeof battleDifficulty === 'number' ? battleDifficulty : 7}
                              style={{ '--p': pct(typeof battleDifficulty === 'number' ? battleDifficulty : 7, 1, 10) }}
                              onChange={(e) => setBattleDifficulty(parseInt(e.target.value, 10))}
                            />
                            <div className="qb-range-scale">
                              {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i + 1}</span>)}
                            </div>
                            <p className="qb-help">{diffInfo.desc}</p>
                          </div>

                          <div className="qb-field">
                            <div className="qb-field__head">
                              <label className="qb-label" htmlFor="qb-count">Número de preguntas</label>
                              <span className="qb-field__value">{questionCount}</span>
                            </div>
                            <input
                              id="qb-count" className="qb-range" type="range" min="5" max="20" value={questionCount}
                              style={{ '--p': pct(questionCount, 5, 20) }}
                              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="qb-field">
                          <label className="qb-label" htmlFor="qb-template">Selecciona una batalla</label>
                          {templates.length === 0 ? (
                            <p className="qb-help">
                              No tienes batallas creadas. Créalas desde el panel del profesor, pestaña &quot;Batallas&quot;.
                            </p>
                          ) : (
                            <select id="qb-template" className="qb-select" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
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
                    </Panel>
                  </div>

                  <div className="qb-config__col">
                    {/* Partida */}
                    <Panel className="qb-card">
                      <h2 className="qb-card__title"><Gamepad2 size={18} /> Partida</h2>

                      <div className="qb-field">
                        <div className="qb-field__head">
                          <label className="qb-label" htmlFor="qb-time">Tiempo por pregunta</label>
                          <span className="qb-field__value">{timeLimit}<small>s</small></span>
                        </div>
                        <input
                          id="qb-time" className="qb-range" type="range" min="10" max="30" step="5" value={timeLimit}
                          style={{ '--p': pct(timeLimit, 10, 30) }}
                          onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                        />
                      </div>

                      {/* Animación de fondo */}
                      <div className="qb-field">
                        <span className="qb-label">Animación de fondo</span>
                        <div className="qb-choices">
                          {BG_ANIM_OPTIONS.map((opt) => (
                            <button
                              key={opt.v}
                              type="button"
                              aria-pressed={bgAnimMode === opt.v}
                              onClick={() => setBgAnimMode(opt.v)}
                              className={`qb-choice ${bgAnimMode === opt.v ? 'is-active' : ''}`}
                            >
                              <span className="qb-choice__icon"><opt.Icon size={18} /></span>
                              <strong>{opt.label}</strong>
                              <small>{opt.desc}</small>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Evaluación a la que suma la batalla (podio: 1º +0,25 · 2º +0,10 · 3º +0,05, cap +1 por evaluación) */}
                      <div className="qb-field">
                        <span className="qb-label">¿A qué evaluación cuenta?</span>
                        <div className="qb-seg-full">
                          <Segmented
                            size="sm"
                            value={battleTerm === null ? 'none' : String(battleTerm)}
                            onChange={(v) => setBattleTerm(v === 'none' ? null : Number(v))}
                            options={TERM_OPTIONS}
                          />
                        </div>
                        <p className="qb-help">
                          {battleTerm === null
                            ? 'Esta batalla no afectará a la nota de los alumnos (solo XP e insignias).'
                            : `El podio sumará extra a la ${battleTerm}ª evaluación. Máximo +1 por alumno y evaluación.`}
                        </p>
                      </div>

                      {/* Anti-copia: cada alumno ve colores distintos */}
                      <div className="qb-field">
                        <span className="qb-label">Anti-copia</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={shuffleColors}
                          onClick={() => setShuffleColors((v) => !v)}
                          className={`qb-switch ${shuffleColors ? 'is-on' : ''}`}
                        >
                          <span className="qb-switch__icon"><Palette size={20} /></span>
                          <span className="qb-switch__text">
                            <strong>{shuffleColors ? 'Colores aleatorios por alumno' : 'Colores iguales para todos'}</strong>
                            <small>
                              {shuffleColors
                                ? 'Cada alumno ve las opciones en colores distintos. Evita copiar "la roja".'
                                : 'Activa esta opción para que cada alumno vea las opciones con un orden de colores distinto.'}
                            </small>
                          </span>
                          <span className="qb-switch__track"><span className="qb-switch__knob" /></span>
                        </button>
                      </div>
                    </Panel>

                    {/* Resumen + crear sala */}
                    <Panel variant="screen" className="qb-ticket">
                      <span className="qb-kicker">Resumen de la batalla</span>
                      <div className="qb-ticket__stats">
                        <div className="qb-ticket__stat">
                          <strong>{sourceMode === 'random' ? questionCount : (selectedTemplate?.question_count ?? '—')}</strong>
                          <span>Preguntas</span>
                        </div>
                        <div className="qb-ticket__stat">
                          <strong>{timeLimit}s</strong>
                          <span>Por pregunta</span>
                        </div>
                        <div className="qb-ticket__stat">
                          <strong>{sourceMode === 'random' ? `${battleDifficulty}/10` : <FileText size={26} />}</strong>
                          <span>{sourceMode === 'random' ? 'Dificultad' : 'Plantilla'}</span>
                        </div>
                      </div>
                      <div className="qb-ticket__tags">
                        <Chip icon={roomType === 'group' ? Crown : Users}>
                          {roomType === 'group' ? (selectedGroup?.name || 'Solo mi grupo') : 'Sala abierta'}
                        </Chip>
                        {roomType === 'group' && battleKind === 'team' && <Chip icon={Layers}>Por equipos</Chip>}
                        <Chip icon={GraduationCap}>{battleTerm === null ? 'No cuenta para nota' : `${battleTerm}ª evaluación`}</Chip>
                        {shuffleColors && <Chip icon={Palette}>Anti-copia</Chip>}
                      </div>

                      {/* Quota info */}
                      {quota && (
                        <div className={`qb-quota ${quota.remaining > 0 ? '' : 'is-out'}`}>
                          <span>
                            {quota.remaining > 0
                              ? `${quota.remaining} partida${quota.remaining !== 1 ? 's' : ''} disponible${quota.remaining !== 1 ? 's' : ''} este mes (${quota.used}/${quota.quota} usadas)`
                              : `Límite alcanzado: ${quota.used}/${quota.quota} partidas este mes`}
                          </span>
                          <ProgressBar value={quota.used} max={quota.quota || 1} tone={quota.remaining > 0 ? 'good' : 'bad'} />
                        </div>
                      )}

                      <GameButton
                        variant="primary"
                        size="lg"
                        icon={loading ? Loader2 : Zap}
                        onClick={handleCreateRoom}
                        disabled={createDisabled}
                        className="qb-wide-btn"
                      >
                        {createLabel}
                      </GameButton>
                      <GameButton variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')} className="qb-wide-btn">
                        Volver al panel
                      </GameButton>
                    </Panel>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── WAITING ── */}
            {phase === 'waiting' && (
              <motion.div key="waiting" className="qb-phase qb-lobby" {...fadeUp}>
                <div className="qb-lobby__bar">
                  <Chip tone={roomType === 'group' ? 'accent' : 'good'} icon={roomType === 'group' ? Crown : Users}>
                    {roomType === 'group' ? `Solo grupo: ${selectedGroup?.name || ''}` : `Sala abierta (máx. ${MAX_PLAYERS})`}
                  </Chip>
                  {isTeamBattle && <Chip icon={Layers}>Por equipos</Chip>}
                  <Chip icon={ListOrdered}>{questions.length} preguntas</Chip>
                  <Chip icon={Clock}>{timeLimit} s por pregunta</Chip>
                  <Chip icon={GraduationCap}>{battleTerm === null ? 'No cuenta para nota' : `${battleTerm}ª evaluación`}</Chip>
                  {shuffleColors && <Chip icon={Palette}>Anti-copia</Chip>}
                </div>

                <Panel variant="screen" className="qb-joinboard">
                  <div className="qb-joinboard__info">
                    <span className="qb-kicker">
                      {roomType === 'group'
                        ? 'Tus alumnos han recibido una notificación'
                        : 'Comparte este código con los jugadores'}
                    </span>
                    <p className="qb-joinboard__url">Entra en <strong>{joinPath}</strong> con el código</p>
                    <QBCodeTiles code={roomCode} onCopy={handleCopyCode} />
                    <p className="qb-joinboard__full">{joinUrl}</p>
                  </div>
                  <div className="qb-qrcard">
                    <QBQrCode value={joinUrl} size={188} />
                    <span>Escanea y juega</span>
                  </div>
                </Panel>

                <Panel className="qb-roster">
                  <div className="qb-roster__head">
                    <motion.span
                      className="qb-live"
                      key={gamePlayers.length}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <i />
                      {isTeamBattle
                        ? `${gamePlayers.length}/${confirmedTeams.length} equipos conectados`
                        : `${gamePlayers.length} jugador${gamePlayers.length !== 1 ? 'es' : ''} en directo`}
                    </motion.span>
                    <GameButton variant="success" size="lg" icon={Play} onClick={handleStart} disabled={gamePlayers.length < 1}>
                      Empezar ({questions.length} preguntas)
                    </GameButton>
                  </div>

                  {isTeamBattle ? (
                    <div className="qb-teams">
                      <AnimatePresence>
                        {confirmedTeams.map((t) => {
                          const connected = gamePlayers.find((p) => p.id === t.rep_student_id);
                          return (
                            <motion.div
                              key={t.rep_student_id}
                              className={`qb-team ${connected ? 'is-ready' : 'is-waiting'}`}
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                            >
                              {connected
                                ? <QBAvatar p={connected} size="md" />
                                : <span className="qb-team__shield"><Shield size={24} /></span>}
                              <span className="qb-team__text">
                                <strong>{t.name}</strong>
                                <small className={connected ? 'is-ok' : ''}>
                                  {connected ? `${connected.name} ✓` : `Esperando rep (${t.member_ids.length} miembros)`}
                                </small>
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : gamePlayers.length === 0 ? (
                    <div className="qb-roster__empty">
                      <QBEmblem size={64} />
                      <strong>Esperando jugadores<span className="qb-dots"><i /><i /><i /></span></strong>
                      <span>Aparecerán aquí en cuanto se unan con el código.</span>
                    </div>
                  ) : (
                    <div className="qb-chips">
                      <AnimatePresence>
                        {gamePlayers.map((p) => (
                          <motion.span
                            key={p.id}
                            className="qb-pchip"
                            initial={{ opacity: 0, scale: 0.4, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                          >
                            <QBAvatar p={p} size="md" />
                            <span>{p.name}</span>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </Panel>
              </motion.div>
            )}

            {/* ── COUNTDOWN ── */}
            {phase === 'countdown' && (
              <motion.div key="countdown-host" className="qb-phase qb-countdown"
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
                <span className="qb-countdown__sub">{questions.length} preguntas · {timeLimit} s cada una</span>
              </motion.div>
            )}

            {/* ── QUESTION ── */}
            {phase === 'question' && currentQuestion && (
              <motion.div key={`q${currentQ}`} className="qb-phase qb-play"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={phaseExit}>
                <div className="qb-topbar">
                  <Hud>
                    <HudStat icon={ListOrdered} tone="progress" value={`${currentQ + 1}/${questions.length}`} label="Pregunta" />
                    <HudStat icon={Users} tone="good" value={`${answeredCount}/${gamePlayers.length}`} label="Respuestas" />
                  </Hud>
                  <div className="qb-topbar__progress">
                    <ProgressBar value={currentQ + 1} max={questions.length} label="Progreso de la batalla" />
                  </div>
                  <GameButton variant="danger" icon={StopCircle} onClick={handleCloseQuestion}>
                    Cerrar pregunta ({answeredCount}/{gamePlayers.length})
                  </GameButton>
                </div>

                <motion.div
                  key={`qtext${currentQ}`}
                  className="qb-question"
                  initial={{ opacity: 0, y: -20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <span className="qb-question__tag">Pregunta {currentQ + 1}</span>
                  <p className="qb-question__text">{currentQuestion.question}</p>
                </motion.div>

                <div className="qb-arena">
                  <QBTimerRing timeLeft={timeLeft} timeLimit={timeLimit} />
                  <div className="qb-arena__center">
                    {bgAnimMode === 'complex' && <QBStageAnimation intensity={isTimerCritical ? 'critical' : 'normal'} />}
                    {bgAnimMode === 'simple' && <QBStageAnimationSimple intensity={isTimerCritical ? 'critical' : 'normal'} />}
                    <div className="qb-tray">
                      <span className="qb-tray__label">
                        {answeredCount > 0 ? 'Ya han respondido' : <>Esperando respuestas<span className="qb-dots"><i /><i /><i /></span></>}
                      </span>
                      <div className={`qb-tray__faces ${answeredCount > 0 ? '' : 'is-empty'}`}>
                        <AnimatePresence>
                          {answeredPlayers.map((p) => (
                            <motion.span
                              key={p.id}
                              className="qb-tray__face"
                              title={decoratePlayer(p).name}
                              initial={{ opacity: 0, scale: 0, y: 24 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                            >
                              <QBAvatar p={p} size="sm" />
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  <div className="qb-answered">
                    <motion.span
                      key={answeredCount}
                      className="qb-answered__num"
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                    >
                      {answeredCount}
                    </motion.span>
                    <span className="qb-answered__of">de {gamePlayers.length}</span>
                    <span className="qb-answered__label">respuestas</span>
                  </div>
                </div>

                {/* Con anti-copia cada alumno ve otros colores: en el proyector se
                    muestran neutras (A-D) para que el color no delate nada. */}
                <div className="qb-tiles qb-tiles--host">
                  {currentQuestion.options.map((opt, i) => (
                    <QBTile
                      key={i}
                      colorIdx={i}
                      neutral={shuffleColors}
                      letter={LETTERS[i]}
                      text={opt}
                      delay={0.1 + i * 0.08}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {phase === 'results' && currentQuestion && (
              <motion.div key="results" className="qb-phase qb-reveal" {...fadeUp}>
                <div className="qb-topbar">
                  <Hud>
                    <HudStat icon={ListOrdered} tone="progress" value={`${currentQ + 1}/${questions.length}`} label="Pregunta" />
                    <HudStat icon={Target} tone="good" value={`${distribution[currentQuestion.correctIndex] || 0}/${gamePlayers.length}`} label="Aciertos" />
                  </Hud>
                  <GameButton variant="primary" size="lg" iconRight={SkipForward} onClick={handleNext}>
                    {currentQ + 1 < questions.length
                      ? `Siguiente (${currentQ + 2}/${questions.length})`
                      : 'Ver resultados finales'}
                  </GameButton>
                </div>

                <motion.div
                  className="qb-answer-banner"
                  initial={{ opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <span className="qb-answer-banner__icon"><QBVerdictArt kind="correct" size={58} /></span>
                  <span className="qb-answer-banner__text">
                    <span className="qb-kicker">Respuesta correcta</span>
                    <strong>{currentQuestion.correct}</strong>
                  </span>
                  {!shuffleColors && (
                    <span className={`qb-answer-banner__shape qb-tile--c${currentQuestion.correctIndex}`}>
                      <QBShape kind={currentQuestion.correctIndex} size={32} />
                    </span>
                  )}
                </motion.div>
                <p className="qb-reveal__q">{currentQuestion.question}</p>

                <div className="qb-reveal__grid">
                  {/* Reparto — si shuffleColors, por letra (los colores que vio cada
                      alumno son distintos y dejan de identificar la opción). */}
                  <Panel className="qb-card">
                    <h2 className="qb-card__title"><BarChart3 size={18} /> Respuestas de la clase</h2>
                    <QBDistribution
                      options={currentQuestion.options}
                      distribution={distribution}
                      correctIndex={currentQuestion.correctIndex}
                      neutral={shuffleColors}
                    />
                  </Panel>

                  {/* Leaderboard top 5 */}
                  <Panel className="qb-card">
                    <h2 className="qb-card__title"><Trophy size={18} /> Clasificación</h2>
                    <QBLeaderboard entries={leaderboard.slice(0, 5)} startDelay={600} />
                  </Panel>
                </div>
              </motion.div>
            )}

            {/* ── FINAL ── */}
            {phase === 'final' && (
              <motion.div key="final" className="qb-phase qb-final"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={phaseExit}>
                <div className="qb-final__head">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  >
                    <QBTrophy size={78} />
                  </motion.span>
                  <div>
                    <h1 className="qb-final__title">¡Resultado final!</h1>
                    <p className="qb-final__sub">
                      {questions.length} preguntas · {leaderboard.length} {isTeamBattle ? 'equipos' : `jugador${leaderboard.length !== 1 ? 'es' : ''}`}
                    </p>
                  </div>
                  {saving && <Chip icon={Loader2}>Guardando resultados…</Chip>}
                </div>

                {/* Podium top 3 */}
                <QBPodium entries={leaderboard.slice(0, 3)} />

                {/* Full ranking */}
                <Panel className="qb-card qb-final__ranking">
                  <h2 className="qb-card__title"><ListOrdered size={18} /> Clasificación completa</h2>
                  <QBLeaderboard
                    entries={leaderboard}
                    animateRanks={false}
                    showDelta={false}
                    startDelay={1600}
                    dense={leaderboard.length > 8}
                  />
                </Panel>

                <div className="qb-cta">
                  <GameButton variant="soft" size="lg" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
                    Volver al panel
                  </GameButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GameShell>
      </main>

      {/* Overlay global de mensajes ascendentes (frases que envían los
          jugadores). El host sólo los visualiza. */}
      {(phase === 'waiting' || phase === 'results' || phase === 'final') && (
        <BattleRisingMessages messages={liveMessages} />
      )}

      {/* Overlay del configurador de equipos */}
      <AnimatePresence>
        {showTeamSetup && roomType === 'group' && selectedGroupId && (
          <motion.div
            key="team-setup-overlay"
            className="qb-team-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowTeamSetup(false); }}
          >
            <motion.div
              className="qb-team-modal"
              initial={{ y: 30, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 30, scale: 0.96, opacity: 0 }}
            >
              <TeamSetupPanel
                groupId={selectedGroupId}
                groupName={groups.find(g => g.id === selectedGroupId)?.name || ''}
                onCancel={() => setShowTeamSetup(false)}
                onConfirm={(teams) => {
                  setConfirmedTeams(teams);
                  setShowTeamSetup(false);
                  toast({
                    title: `${teams.length} equipos listos`,
                    description: 'Pulsa "Crear sala" para lanzar la batalla.',
                  });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
