// src/apps/mesa-crafteo/MesaCrafteo.jsx
// Mesa de Crafteo 2026: construye moléculas átomo a átomo en un laboratorio 3D.
//  · Campaña por mundos (diatómicas → geometría → dobles/triples → orgánica →
//    ácidos y anillos → iones → VSEPR avanzada) con estrellas y desbloqueos.
//  · Retos: "¿Qué molécula es?" y Contrarreloj. Laboratorio libre que reconoce
//    lo que construyes y lo guarda en el álbum molecular.
//  · Examen (cuenta para tareas): misma puntuación de crafteoScoring.js y una
//    sola llamada a onGameComplete({ mode: 'test', … }) por examen terminado.
// La práctica (niveles de campaña que mejoran tu marca, contrarreloj y quiz)
// se registra con mode 'practice', nunca 'test'.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  FlaskConical, GraduationCap, Map as MapIcon, BookOpen, Timer, HelpCircle, Home, Undo2, Trash2, Link2,
  Eraser, Crosshair, Check, Send, Star, Clock, Target, Sparkles, ArrowRight, RotateCcw, Atom, Beaker,
  Flame, SkipForward, Grid3x3, Eye, EyeOff, Lightbulb, Trophy, Zap, Box,
} from 'lucide-react';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import GraphicsQualitySelector from '@/components/ui/GraphicsQualitySelector';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import useFxTier from '@/hooks/useFxTier';
import { isWebGLAvailable } from '@/services/graphicsQuality';
import { getAppContent } from '../../services/gameDataService';
import PeriodicTableModal from '../_shared/PeriodicTableModal';
import {
  GameShell, GameButton, ModeSelect, ModeChip, ResultsScreen, FeedbackItem, ProgressDots, Hud, HudStat,
  ConfirmDialog, AnswerOption, useAppMeta, cleanAppName,
} from '../_shared/kit';
import { EXAM_DIFFICULTY, computeCrafteoNota, computeCrafteoScore, crafteoMaxScore } from './crafteoScoring';
import { MOLECULES, MOLECULE_BY_ID, courseRank, moleculesForRank } from './chem/molecules';
import { tokenInfo } from './chem/elements';
import {
  emptyModel, isSaturated, matchesMolecule, diagnose, identify, atomStatus,
} from './chem/graph';
import { displayOf } from './chem/display';
import {
  worldsForRank, worldLevels, computeStars, levelPoints, levelMaxPoints, isLevelUnlocked, paletteFor, labPalette,
  pickExamMolecules, examPalette, loadProgress, saveProgress, recordLevel, addToAlbum,
} from './campaign';
import useBuilder from './useBuilder';
import LabCanvas, { createActivity } from './scene/LabCanvas';
import MoleculeView from './scene/MoleculeView';
import Celebration from './scene/Celebration';
import { tierParams } from './scene/quality';
import Palette from './ui/Palette';
import MissionPanel from './ui/MissionPanel';
import CampaignMap from './ui/CampaignMap';
import Album from './ui/Album';
import Blueprint from './ui/Blueprint';
import MoleculeInfo, { Stars, FactChips } from './ui/MoleculeInfo';
import TutorialModal from './TutorialModal';
import './MesaCrafteo.css';

const SHELL = { accent: '#818cf8', accent2: '#22d3ee' };
const DIFF_NAME = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
const DIFF_TONE = { easy: 'easy', medium: 'medium', hard: 'exam' };
const DIFF_ICON = { easy: Beaker, medium: FlaskConical, hard: Atom };
const fmtMult = (m) => `×${String(m).replace('.', ',')} puntos`;
const LEVEL_LABEL = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Diversidad' };
const RUSH_SECONDS = 120;
const QUIZ_ROUNDS = 8;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

function useNow(active, ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}

function usePrefersReducedMotion() {
  const [r, setR] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
}

function useIsPhone() {
  const q = '(max-width: 720px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(q).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(q);
    if (!mq) return undefined;
    const on = () => setM(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return m;
}

// Opciones del "¿Qué molécula es?": el objetivo + 3 parecidas (tamaño o elementos).
function quizOptions(mol, pool) {
  const els = new Set(mol.atoms.map((t) => tokenInfo(t).el));
  const scored = pool.filter((m) => m.id !== mol.id).map((m) => {
    const shared = m.atoms.filter((t) => els.has(tokenInfo(t).el)).length / m.atoms.length;
    return { m, s: shared * 2 - Math.abs(m.atoms.length - mol.atoms.length) * 0.15 + Math.random() * 0.8 };
  }).sort((a, b) => b.s - a.s);
  return shuffle([mol, ...scored.slice(0, 3).map((x) => x.m)]);
}

const MesaCrafteo = ({ level: levelProp, grade = 1, corso, onGameComplete }) => {
  const meta = useAppMeta();
  const level = levelProp || meta.level || 'eso';
  const rank = courseRank(level, corso || grade);
  const pool = useMemo(() => moleculesForRank(rank), [rank]);
  const worlds = useMemo(() => worldsForRank(rank), [rank]);

  // ── calidad gráfica ──
  const { pref, tier: prefTier } = useGraphicsQuality();
  const [tier, setTier] = useState(prefTier);
  useEffect(() => { setTier(prefTier); }, [prefTier]);
  const params = tierParams(tier);
  const fx = useFxTier();
  const reduced = usePrefersReducedMotion();
  const phone = useIsPhone();
  const [webgl, setWebgl] = useState(() => isWebGLAvailable());

  // ── progreso ──
  const [progress, setProgress] = useState(() => loadProgress(MOLECULES));
  const progressRef = useRef(progress);
  const updateProgress = useCallback((fn) => {
    const next = fn(progressRef.current);
    progressRef.current = next;
    saveProgress(next);
    setProgress(next);
    return next;
  }, []);

  // ── escena ──
  const builder = useBuilder();
  const activity = useMemo(() => createActivity(), []);
  const extentRef = useRef({ r: 1, low: -1 });
  const pickerRef = useRef(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [viewKey, setViewKey] = useState(0);
  const [showLP, setShowLP] = useState(true);

  // ── pantallas ──
  const [screen, setScreen] = useState('home'); // home | map | album | play | viewer
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);
  sessionRef.current = session;
  const [showDiff, setShowDiff] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [coach, setCoach] = useState(null); // { text, tone, until }
  const [toast, setToast] = useState(null); // { text, mol }
  const [elementsData, setElementsData] = useState([]);
  const [viewerMol, setViewerMol] = useState(null);

  const timed = screen === 'play' && session && !session.done && !session.over && !session.showResults
    && ['level', 'exam', 'rush', 'quiz'].includes(session.kind);
  const now = useNow(timed, session?.kind === 'rush' ? 200 : 500);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; document.body.style.cursor = ''; };
  }, []);

  // Datos para la tabla periódica (no bloquean el juego).
  useEffect(() => {
    let alive = true;
    getAppContent('elementos-quimica').then((d) => { if (alive && d?.elements) setElementsData(d.elements); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Tutorial la primera vez.
  useEffect(() => {
    if (!progressRef.current.tutorialSeen) setShowTutorial(true);
  }, []);
  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    if (!progressRef.current.tutorialSeen) updateProgress((p) => ({ ...p, tutorialSeen: true }));
  }, [updateProgress]);

  const say = useCallback((text, tone = 'info', ms = 3200) => {
    if (!text) return;
    setCoach({ text, tone, until: Date.now() + ms, id: Math.random() });
  }, []);
  useEffect(() => {
    if (!coach) return undefined;
    const id = setTimeout(() => setCoach((c) => (c && c.until <= Date.now() + 20 ? null : c)), Math.max(50, coach.until - Date.now()));
    return () => clearTimeout(id);
  }, [coach]);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(id);
  }, [toast]);

  const discover = useCallback((mol) => {
    let isNew = false;
    updateProgress((p) => { const r = addToAlbum(p, mol.id); isNew = r.isNew; return r.progress; });
    if (isNew) setToast({ text: 'Nueva en tu álbum', mol });
    return isNew;
  }, [updateProgress]);

  const fireConfetti = useCallback(() => {
    if (reduced || fx !== 'high') return;
    confetti({ particleCount: 90, spread: 75, startVelocity: 38, origin: { x: phone ? 0.5 : 0.42, y: 0.55 }, colors: ['#22d3ee', '#a78bfa', '#fbbf24', '#4ade80'], disableForReducedMotion: true });
  }, [reduced, fx, phone]);

  // ── vitrina de la pantalla de inicio ──
  // (la mesa queda vacía detrás del menú: el panel la taparía)
  useEffect(() => { if (screen === 'home') builder.load(emptyModel()); }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═════════════ arranque de modos ═════════════
  const startLevel = useCallback((world, lv) => {
    builder.load(emptyModel());
    setSession({
      kind: 'level', world, level: lv, target: lv.molecule, palette: paletteFor(lv.molecule, lv.extras, lv.index),
      help: lv.help, hints: 0, wrong: 0, startedAt: Date.now(), done: false, result: null, lastWrongRev: -1, attempt: Date.now(),
    });
    setScreen('play');
    setViewKey((k) => k + 1);
    say(lv.index === 0 && world.id === 'w1'
      ? 'Toca el H de abajo para ponerlo en la mesa. Luego toca otro H: se unirá al primero.'
      : `Construye ${lv.molecule.name}.`, 'info', 5200);
  }, [builder, say]);

  const startLab = useCallback(() => {
    builder.load(emptyModel());
    setSession({ kind: 'lab', palette: labPalette(rank), found: null, lastFoundRev: -1 });
    setScreen('play');
    setViewKey((k) => k + 1);
    say('Laboratorio libre: construye lo que quieras. Si formas una molécula conocida, te avisaré.', 'info', 5000);
  }, [builder, rank, say]);

  const examTrackedRef = useRef(false);
  const startExam = useCallback((difficulty) => {
    const cfg = EXAM_DIFFICULTY[difficulty] || EXAM_DIFFICULTY.medium;
    const qs = pickExamMolecules(pool, difficulty, cfg.questions);
    builder.load(emptyModel());
    examTrackedRef.current = false;
    setSession({ kind: 'exam', difficulty, questions: qs, index: 0, answers: [], startedAt: Date.now(), finalTime: 0, showResults: false });
    setShowDiff(false);
    setScreen('play');
    setViewKey((k) => k + 1);
  }, [builder, pool]);

  const rushPool = useMemo(() => pool.filter((m) => m.atoms.length <= 9 && !m.ring), [pool]);
  const rushTrackedRef = useRef(false);
  const startRush = useCallback(() => {
    builder.load(emptyModel());
    rushTrackedRef.current = false;
    const t = rushPool[Math.floor(Math.random() * rushPool.length)];
    setSession({ kind: 'rush', target: t, endsAt: Date.now() + RUSH_SECONDS * 1000, startedAt: Date.now(), built: 0, skipped: 0, points: 0, log: [], over: false, lastRev: -1 });
    setScreen('play');
    setViewKey((k) => k + 1);
    say('¡Contrarreloj! Cada molécula suma 8 s. Saltar resta 5 s.', 'info', 4000);
  }, [builder, rushPool, say]);

  const quizTrackedRef = useRef(false);
  const startQuiz = useCallback(() => {
    const picks = shuffle(pool).slice(0, Math.min(QUIZ_ROUNDS, pool.length));
    const rounds = picks.map((m) => ({ mol: m, options: quizOptions(m, pool) }));
    quizTrackedRef.current = false;
    builder.load(displayOf(rounds[0].mol).model);
    setSession({ kind: 'quiz', rounds, index: 0, answer: null, correct: 0, streak: 0, best: 0, points: 0, roundAt: Date.now(), startedAt: Date.now(), over: false, log: [] });
    setScreen('play');
    setViewKey((k) => k + 1);
  }, [builder, pool]);

  const goHome = useCallback(() => {
    setSession(null); setScreen('home'); setConfirmExit(false); setCoach(null);
  }, []);

  // ═════════════ campaña: comprobar y completar ═════════════
  const levelSeconds = session?.kind === 'level' ? Math.max(0, Math.round(((session.done ? session.result.endedAt : now) - session.startedAt) / 1000)) : 0;

  const completeLevel = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'level' || s.done) return;
    const endedAt = Date.now();
    const seconds = Math.round((endedAt - s.startedAt) / 1000);
    const extraAtoms = Math.max(0, builder.placed - s.target.atoms.length);
    const { stars, clean, fast } = computeStars({ hints: s.hints, wrong: s.wrong, seconds, par: s.level.par, extraAtoms });
    const points = levelPoints(s.target, stars, seconds, s.level.par);
    let rec = null;
    updateProgress((p) => { rec = recordLevel(p, s.level.id, { stars, points }); return rec.progress; });
    const isNew = discover(s.target);
    setSession({ ...s, done: true, result: { stars, clean, fast, points, seconds, endedAt, improved: rec.improved, prevStars: rec.prevStars, isNew } });
    setCelebrateKey((k) => k + 1);
    builder.load(builder.model, { fresh: true, keepPlaced: true }); // encaja en su geometría ideal
    fireConfetti();
    // Práctica: solo cuando el nivel mejora tu marca (evita repetir el mismo nivel para farmear XP).
    if (rec.improved) {
      onGameComplete?.({
        mode: 'practice',
        score: points,
        maxScore: levelMaxPoints(s.target, s.level.par),
        correctAnswers: 1,
        totalQuestions: 1,
        durationSeconds: seconds,
      });
    }
  }, [builder, discover, fireConfetti, onGameComplete, updateProgress]);

  // Comprobación automática cuando la molécula queda "cerrada" (todas las valencias completas).
  useEffect(() => {
    const s = sessionRef.current;
    if (screen !== 'play' || !s) return;
    const model = builder.model;
    if (!model.atoms.length || !isSaturated(model)) return;
    if (s.kind === 'level' && !s.done) {
      if (matchesMolecule(model, s.target)) { completeLevel(); return; }
      if (s.lastWrongRev === builder.rev) return;
      const d = diagnose(model, s.target, pool);
      if (d.other) discover(d.other);
      setSession({ ...s, wrong: s.wrong + 1, lastWrongRev: builder.rev });
      say(d.text, 'bad', 6000);
    } else if (s.kind === 'rush' && !s.over) {
      if (s.lastRev === builder.rev) return;
      if (matchesMolecule(model, s.target)) {
        discover(s.target);
        const gain = 40 * s.target.diff + 10 * s.target.atoms.length;
        let next = s.target;
        for (let k = 0; k < 6 && next.id === s.target.id; k++) next = rushPool[Math.floor(Math.random() * rushPool.length)];
        setCelebrateKey((k) => k + 1);
        setSession({ ...s, built: s.built + 1, points: s.points + gain, endsAt: s.endsAt + 8000, target: next, log: [...s.log, { mol: s.target, ok: true }], lastRev: builder.rev });
        say(`¡${s.target.name}! +${gain} puntos · +8 s`, 'good', 2200);
        setTimeout(() => builder.load(emptyModel()), reduced ? 200 : 700);
      } else {
        const d = diagnose(model, s.target, pool);
        if (d.other) discover(d.other);
        setSession({ ...s, lastRev: builder.rev });
        say(d.text, 'bad', 4500);
      }
    } else if (s.kind === 'lab') {
      if (s.lastFoundRev === builder.rev) return;
      const found = identify(model, MOLECULES);
      setSession({ ...s, found: found || null, lastFoundRev: builder.rev });
      if (found) {
        discover(found);
        setCelebrateKey((k) => k + 1);
        fireConfetti();
      } else {
        say('Molécula completa, pero no está en el catálogo. ¡Prueba otra combinación!', 'info', 4500);
      }
    }
  }, [builder.rev, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  const takeHint = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'level' || s.done) return;
    setSession({ ...s, hints: s.hints + 1 });
  }, []);

  const levelReveal = (s) => {
    if (!s || s.kind !== 'level') return { formula: true, plan: false };
    const h = s.hints;
    if (s.help === 'guided') return { formula: true, plan: true, hintsLeft: 0 };
    if (s.help === 'formula') return { formula: true, plan: h >= 1, hintsLeft: h >= 1 ? 0 : 1 };
    return { formula: h >= 1, plan: h >= 2, hintsLeft: Math.max(0, 2 - h) };
  };

  const nextLevel = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'level') return;
    const wi = worlds.findIndex((w) => w.id === s.world.id);
    const lv = worldLevels(worlds[wi]);
    const p = progressRef.current;
    if (s.level.index + 1 < lv.length && isLevelUnlocked(worlds, wi, s.level.index + 1, p, rank)) {
      startLevel(worlds[wi], lv[s.level.index + 1]);
      return;
    }
    if (wi + 1 < worlds.length && isLevelUnlocked(worlds, wi + 1, 0, p, rank)) {
      startLevel(worlds[wi + 1], worldLevels(worlds[wi + 1])[0]);
      return;
    }
    setSession(null); setScreen('map');
  }, [worlds, rank, startLevel]);

  // ═════════════ examen ═════════════
  const submitExam = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'exam' || s.showResults) return;
    const q = s.questions[s.index];
    const ok = matchesMolecule(builder.model, q);
    if (ok) discover(q);
    const answers = [...s.answers, { mol: q, correct: ok, built: builder.model }];
    if (s.index + 1 < s.questions.length) {
      setSession({ ...s, answers, index: s.index + 1 });
      builder.load(emptyModel());
      say(`Respuesta guardada. Molécula ${s.index + 2} de ${s.questions.length}.`, 'info', 2200);
    } else {
      const finalTime = Math.floor((Date.now() - s.startedAt) / 1000);
      setSession({ ...s, answers, finalTime, showResults: true });
    }
  }, [builder, discover, say]);

  // Tracking del examen: UNA vez por examen terminado (CLAUDE.md §5).
  useEffect(() => {
    if (!session || session.kind !== 'exam' || !session.showResults || examTrackedRef.current) return;
    examTrackedRef.current = true;
    const total = session.questions.length;
    const correct = session.answers.filter((a) => a.correct).length;
    const { nota } = computeCrafteoNota(correct, total, session.difficulty);
    onGameComplete?.({
      mode: 'test',
      score: computeCrafteoScore(correct, total, session.finalTime, session.difficulty),
      maxScore: crafteoMaxScore(total, session.difficulty),
      correctAnswers: correct,
      totalQuestions: total,
      durationSeconds: session.finalTime || undefined,
      nota,
    });
  }, [session, onGameComplete]);

  // ═════════════ contrarreloj ═════════════
  const rushLeft = session?.kind === 'rush' ? Math.max(0, Math.ceil((session.endsAt - now) / 1000)) : 0;
  useEffect(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'rush' || s.over) return;
    if (now >= s.endsAt) setSession({ ...s, over: true, finalTime: Math.round((Date.now() - s.startedAt) / 1000) });
  }, [now]);
  useEffect(() => {
    if (!session || session.kind !== 'rush' || !session.over || rushTrackedRef.current) return;
    rushTrackedRef.current = true;
    onGameComplete?.({
      mode: 'practice',
      score: session.points,
      maxScore: Math.max(session.points, 1),
      correctAnswers: session.built,
      totalQuestions: Math.max(1, session.built + session.skipped),
      durationSeconds: session.finalTime,
    });
    if (session.points > (progressRef.current.bestRush || 0)) updateProgress((p) => ({ ...p, bestRush: session.points }));
  }, [session, onGameComplete, updateProgress]);
  const skipRush = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'rush' || s.over) return;
    let next = s.target;
    for (let k = 0; k < 6 && next.id === s.target.id; k++) next = rushPool[Math.floor(Math.random() * rushPool.length)];
    setSession({ ...s, skipped: s.skipped + 1, endsAt: s.endsAt - 5000, target: next, log: [...s.log, { mol: s.target, ok: false }] });
    builder.load(emptyModel());
  }, [builder, rushPool]);

  // ═════════════ ¿Qué molécula es? ═════════════
  const answerQuiz = useCallback((mol) => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'quiz' || s.answer) return;
    const round = s.rounds[s.index];
    const ok = mol.id === round.mol.id;
    const secs = (Date.now() - s.roundAt) / 1000;
    const streak = ok ? s.streak + 1 : 0;
    const gain = ok ? 100 + 20 * (streak - 1) + Math.max(0, Math.round(60 - secs * 6)) : 0;
    if (ok) { setCelebrateKey((k) => k + 1); discover(round.mol); }
    setSession({ ...s, answer: mol.id, correct: s.correct + (ok ? 1 : 0), streak, best: Math.max(s.best, streak), points: s.points + gain, log: [...s.log, { mol: round.mol, ok, picked: mol }] });
  }, [discover]);
  const nextQuiz = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.kind !== 'quiz') return;
    if (s.index + 1 >= s.rounds.length) {
      setSession({ ...s, over: true, finalTime: Math.round((Date.now() - s.startedAt) / 1000) });
      return;
    }
    builder.load(displayOf(s.rounds[s.index + 1].mol).model);
    setSession({ ...s, index: s.index + 1, answer: null, roundAt: Date.now() });
  }, [builder]);
  useEffect(() => {
    if (!session || session.kind !== 'quiz' || !session.over || quizTrackedRef.current) return;
    quizTrackedRef.current = true;
    onGameComplete?.({
      mode: 'practice',
      score: session.points,
      maxScore: session.rounds.length * 300,
      correctAnswers: session.correct,
      totalQuestions: session.rounds.length,
      durationSeconds: session.finalTime,
    });
    if (session.points > (progressRef.current.bestQuiz || 0)) updateProgress((p) => ({ ...p, bestQuiz: session.points }));
  }, [session, onGameComplete, updateProgress]);

  // ═════════════ visor 3D (desde el álbum) ═════════════
  const openViewer = useCallback((mol) => {
    setViewerMol(mol);
    builder.load(displayOf(mol).model);
    setScreen('viewer');
    setViewKey((k) => k + 1);
  }, [builder]);

  // ═════════════ interacción con la mesa ═════════════
  const canBuild = screen === 'play' && session && !session.done && !session.over && !session.showResults
    && ['level', 'lab', 'exam', 'rush'].includes(session.kind);

  const palette = useMemo(() => {
    if (!session) return [];
    if (session.kind === 'level' || session.kind === 'lab') return session.palette;
    if (session.kind === 'exam') return examPalette(session.questions[session.index], session.difficulty, rank);
    if (session.kind === 'rush') return paletteFor(session.target, rank >= 3 ? 1 : 0, session.built);
    return [];
  }, [session, rank]);

  const pick = useCallback((tok) => {
    if (!canBuild) return;
    const msg = builder.addToken(tok);
    if (msg) say(msg, 'warn', 3600);
  }, [builder, canBuild, say]);

  const dragMove = useCallback((tok, x, y) => {
    const t = pickerRef.current?.(x, y) || null;
    setDropTarget((prev) => (prev?.atomId === t?.atomId && prev?.slotIdx === t?.slotIdx ? prev : t));
  }, []);
  const drop = useCallback((tok, x, y) => {
    setDropTarget(null);
    if (!tok || !canBuild) return;
    const t = pickerRef.current?.(x, y);
    if (!builder.model.atoms.length) {
      // mesa vacía: vale soltar en cualquier punto del escenario
      if (y < window.innerHeight - 120) builder.addToken(tok);
      return;
    }
    if (!t) { say('Suelta el átomo encima de otro átomo o de uno de sus huecos brillantes.', 'warn'); return; }
    const msg = builder.addToken(tok, t);
    if (msg) say(msg, 'warn', 3600);
  }, [builder, canBuild, say]);

  const { tapAtom, tapBond } = builder;
  const onAtomTap = useCallback((id) => { const m = tapAtom(id); if (m) say(m, m.startsWith('¡') ? 'good' : 'warn'); }, [tapAtom, say]);
  const onBondTap = useCallback((a, b) => { const m = tapBond(a, b); if (m) say(m, m.startsWith('Para') ? 'warn' : 'info', 1800); }, [tapBond, say]);

  const checkNow = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    if (s.kind === 'exam') { submitExam(); return; }
    if (s.kind === 'level' || s.kind === 'rush') {
      const d = diagnose(builder.model, s.target, pool);
      if (d.kind === 'ok') return;
      say(d.text, isSaturated(builder.model) ? 'bad' : 'warn', 5200);
    }
  }, [builder.model, pool, say, submitExam]);

  // Teclado: Ctrl+Z deshacer, Supr quitar.
  useEffect(() => {
    if (!canBuild) return undefined;
    const onKey = (e) => {
      if (e.target?.closest?.('input, textarea')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); builder.undo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { builder.removeSelected(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canBuild, builder]);

  // Solo desarrollo: gancho para las capturas automáticas (tools/app-shots.mjs).
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__mcDebug = { builder, session, startLevel, worlds, pickerRef };
    return () => { delete window.__mcDebug; };
  });

  // ═════════════ entrenador (texto contextual) ═════════════
  const coachText = (() => {
    if (coach) return coach;
    if (!session || screen !== 'play') return null;
    if (session.kind === 'quiz') return null;
    const m = builder.model;
    if (session.done || session.over || session.showResults) return null;
    if (builder.link) return { text: builder.linkFrom == null ? 'Modo enlazar: toca el primer átomo.' : 'Ahora toca el segundo átomo para unirlos.', tone: 'info' };
    if (!m.atoms.length) return { text: phone ? 'Toca un elemento de abajo para ponerlo en la mesa.' : 'Toca un elemento de abajo (o arrástralo) para ponerlo en la mesa.', tone: 'info' };
    const target = session.target || (session.kind === 'exam' ? session.questions[session.index] : null);
    if (builder.attachId == null && !isSaturated(m)) return { text: 'Quedan huecos que no caben: toca un enlace para hacerlo doble o triple.', tone: 'info' };
    if (target && session.kind !== 'exam') {
      const need = target.atoms.length;
      const free = m.atoms.reduce((s, a) => s + atomStatus(m, a.id).free, 0);
      if (m.atoms.length === need && free > 0) return { text: '¡Ya están todos los átomos! Los huecos que sobran piden enlaces dobles o triples: toca un enlace.', tone: 'info' };
    }
    const at = builder.attachId != null ? m.atoms.find((a) => a.id === builder.attachId) : null;
    if (at) return { text: `El siguiente átomo se unirá al ${tokenInfo(at.tok).label} marcado. Toca otro átomo para cambiarlo.`, tone: 'info' };
    return null;
  })();

  // ═════════════ encuadre ═════════════
  const insets = useMemo(() => {
    if (screen === 'home') return phone ? { top: 40, bottom: 420 } : { top: 0, bottom: 420 };
    if (screen === 'viewer') return phone ? { top: 70, bottom: 330 } : { top: 70, right: 420, bottom: 30 };
    if (screen !== 'play') return { top: 0, bottom: 0 };
    if (session?.kind === 'quiz') return phone ? { top: 120, bottom: 300 } : { top: 90, right: 420, bottom: 40 };
    if (session?.done) return phone ? { top: 70, bottom: 380 } : { top: 80, right: 420, bottom: 60 };
    return phone ? { top: 160, bottom: 236 } : { top: 80, right: 372, bottom: 206 };
  }, [screen, phone, session?.kind, session?.done]);

  const autoRotate = !reduced && (
    screen === 'viewer'
    || (screen === 'play' && (session?.kind === 'quiz' || session?.done || (session?.kind === 'lab' && session?.found)))
  );
  const interactive = canBuild;

  // ═════════════ render ═════════════
  const courseText = meta.level ? (meta.grade && meta.level !== 'ad' ? `${meta.grade}º ${LEVEL_LABEL[meta.level] || meta.level}` : (LEVEL_LABEL[meta.level] || meta.level)) : '';
  const target = session?.kind === 'exam' ? session.questions[session.index] : session?.target;
  const reveal = levelReveal(session);
  const albumHave = progress.album.filter((id) => pool.some((m) => m.id === id)).length;

  // Memorizado: el reloj del HUD re-renderiza la app cada medio segundo y, sin
  // esto, cada re-render del árbol de r3f pediría un fotograma (frameloop demand).
  const showSlots = screen === 'play' && session?.kind !== 'quiz';
  const stage = useMemo(() => (webgl ? (
    <LabCanvas
      tier={tier}
      prefAuto={pref === 'auto'}
      onAutoDowngrade={setTier}
      onFail={() => setWebgl(false)}
      insets={insets}
      extentRef={extentRef}
      activity={activity}
      autoRotate={autoRotate}
      resetKey={viewKey}
    >
      <MoleculeView
        model={builder.model}
        layout={builder.layout}
        params={params}
        selectedId={interactive ? builder.selected : null}
        attachId={interactive ? builder.attachId : null}
        nextSlot={builder.nextSlot}
        linkFrom={builder.linkFrom}
        dropTarget={dropTarget}
        showLP={showLP}
        showSlots={showSlots}
        interactive={interactive}
        celebrateKey={celebrateKey}
        onAtomTap={onAtomTap}
        onSlotTap={builder.tapSlot}
        onBondTap={onBondTap}
        pickerRef={pickerRef}
        extentRef={extentRef}
        activity={activity}
        spawnFrom={builder.spawnFrom}
      />
      <Celebration fireKey={celebrateKey} tokens={builder.model.atoms.map((a) => a.tok)} count={params.burst} extentRef={extentRef} reduced={reduced} />
    </LabCanvas>
  ) : (
    <div className="mc-flat" style={{ '--top': `${insets.top || 0}px`, '--right': `${insets.right || 0}px`, '--bottom': `${insets.bottom || 0}px` }}>
      {builder.model.atoms.length > 0 && (
        <Blueprint
          model={builder.model}
          layout={builder.layout}
          interactive={interactive}
          showLP={showLP}
          showSlots={showSlots}
          selectedId={interactive ? builder.selected : null}
          attachId={interactive ? builder.attachId : null}
          onAtomTap={onAtomTap}
          onSlotTap={builder.tapSlot}
          onBondTap={onBondTap}
        />
      )}
      {screen === 'play' && <span className="mc-flat__note">Vista plana: este navegador no tiene gráficos 3D (WebGL).</span>}
    </div>
  )), [
    webgl, tier, pref, insets, autoRotate, viewKey, builder.model, builder.layout, builder.selected, builder.attachId,
    builder.nextSlot, builder.linkFrom, builder.tapSlot, builder.spawnFrom, dropTarget, showLP, showSlots, interactive,
    celebrateKey, params, reduced, onAtomTap, onBondTap, activity, screen,
  ]);

  const topbar = (chip, hud) => (
    <header className="mc-topbar">
      <div className="mc-topbar__id">
        {meta.appId && hasAppIcon(meta.appId) && <span className="mc-topbar__icon"><AppIcon appId={meta.appId} size={34} /></span>}
        <span className="mc-topbar__text">
          <strong>{cleanAppName(meta.name) || 'Mesa de Crafteo'}</strong>
          {courseText && <span>{courseText}</span>}
        </span>
      </div>
      {chip}
      {hud}
      <button type="button" className="gk-iconbtn" onClick={() => setShowTutorial(true)} title="Cómo se juega" aria-label="Cómo se juega"><HelpCircle size={18} /></button>
      <button type="button" className="gk-iconbtn" onClick={() => {
        const s = sessionRef.current;
        if (screen === 'play' && s && ((s.kind === 'exam' && !s.showResults) || (s.kind === 'rush' && !s.over) || (s.kind === 'quiz' && !s.over))) setConfirmExit(true);
        else if (screen === 'play' && s?.kind === 'level') { setSession(null); setScreen('map'); }
        else goHome();
      }} title="Salir" aria-label="Salir"><Home size={18} /></button>
    </header>
  );

  const liveStars = session?.kind === 'level' && !session.done
    ? computeStars({ hints: session.hints, wrong: session.wrong, seconds: levelSeconds, par: session.level.par, extraAtoms: Math.max(0, builder.placed - session.target.atoms.length) }).stars
    : 0;

  const tools = (primary) => (
    <div className="mc-dock">
      <div className="mc-dock__tools">
        <button type="button" className="mc-tool" onClick={builder.undo} disabled={!builder.canUndo} title="Deshacer (Ctrl+Z)"><Undo2 size={18} /><span>Deshacer</span></button>
        <button type="button" className="mc-tool" onClick={builder.removeSelected} disabled={!builder.model.atoms.length} title="Quitar el átomo seleccionado (Supr)"><Eraser size={18} /><span>Quitar</span></button>
        <button type="button" className={`mc-tool ${builder.link ? 'is-on' : ''}`} onClick={builder.toggleLink} disabled={builder.model.atoms.length < 3} aria-pressed={builder.link} title="Unir dos átomos (para cerrar anillos)"><Link2 size={18} /><span>Enlazar</span></button>
        <button type="button" className="mc-tool" onClick={builder.clear} disabled={!builder.model.atoms.length} title="Vaciar la mesa"><Trash2 size={18} /><span>Vaciar</span></button>
        <button type="button" className={`mc-tool ${showLP ? 'is-on' : ''}`} onClick={() => setShowLP((v) => !v)} aria-pressed={showLP} title="Mostrar pares solitarios">{showLP ? <Eye size={18} /> : <EyeOff size={18} />}<span>Pares</span></button>
        {webgl && <button type="button" className="mc-tool" onClick={() => setViewKey((k) => k + 1)} title="Centrar la vista"><Crosshair size={18} /><span>Centrar</span></button>}
      </div>
      {primary}
    </div>
  );

  const coachBubble = coachText && (
    <AnimatePresence>
      <motion.div key={coachText.text} className={`mc-coach is-${coachText.tone || 'info'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} role="status">
        {coachText.tone === 'bad' ? <Zap size={16} /> : coachText.tone === 'good' ? <Sparkles size={16} /> : <Lightbulb size={16} />}
        <span>{coachText.text}</span>
      </motion.div>
    </AnimatePresence>
  );

  const buildChrome = (kicker, primary, missionExtra, panelProps = {}) => (
    <>
      <aside className="mc-side">
        <MissionPanel kicker={kicker} target={session.kind === 'lab' ? null : target} model={builder.model} extra={missionExtra} {...panelProps} />
      </aside>
      <div className="mc-bottom">
        {coachBubble}
        {tools(primary)}
        <Palette tokens={palette} onPick={pick} onDragMove={dragMove} onDrop={drop} disabled={!canBuild} compactNames={phone} />
      </div>
    </>
  );

  let playUI = null;
  if (screen === 'play' && session) {
    const s = session;
    if (s.kind === 'level') {
      const wi = worlds.findIndex((w) => w.id === s.world.id);
      playUI = (
        <>
          {topbar(<ModeChip mode="practice" label={`Mundo ${wi + 1} · Nivel ${s.level.index + 1}`} />, (
            <Hud>
              <HudStat icon={Clock} tone="time" value={`${levelSeconds}s`} label={`Par ${s.level.par}s`} />
              <HudStat icon={Star} tone="streak" value={s.done ? s.result.stars : liveStars} label="Estrellas" />
            </Hud>
          ))}
          {!s.done && buildChrome(
            `${s.world.name}`,
            <button type="button" className="mc-check" onClick={checkNow} disabled={!builder.model.atoms.length}><Check size={20} /><span>Comprobar</span></button>,
            null,
            {
              showFormula: reveal.formula, showCounts: reveal.formula, showPlan: reveal.plan,
              hintsLeft: reveal.hintsLeft, onHint: takeHint,
              hintLabel: !reveal.formula ? 'Pista: ver la fórmula' : 'Pista: ver el plano',
              hintCost: '−1 ★',
            },
          )}
          {s.done && (
            <CompletionPanel
              mol={s.target}
              result={s.result}
              onNext={nextLevel}
              onRetry={() => startLevel(s.world, s.level)}
              onMap={() => { setSession(null); setScreen('map'); }}
            />
          )}
        </>
      );
    } else if (s.kind === 'lab') {
      playUI = (
        <>
          {topbar(<ModeChip mode="practice" label="Laboratorio libre" />, (
            <Hud><HudStat icon={BookOpen} tone="progress" value={`${albumHave}/${pool.length}`} label="Álbum" /></Hud>
          ))}
          {buildChrome('Laboratorio', (
            <button type="button" className="mc-check is-soft" onClick={() => setShowTable(true)} disabled={!elementsData.length}><Grid3x3 size={20} /><span>Tabla</span></button>
          ), s.found ? (
            <div className="mc-found">
              <span className="mc-kicker"><Sparkles size={13} /> ¡Has creado…!</span>
              <MoleculeInfo mol={s.found} />
              <GameButton variant="success" icon={RotateCcw} onClick={() => { builder.load(emptyModel()); setSession({ ...s, found: null }); }}>Nueva molécula</GameButton>
            </div>
          ) : null)}
        </>
      );
    } else if (s.kind === 'exam' && !s.showResults) {
      const elapsed = Math.floor((now - s.startedAt) / 1000);
      playUI = (
        <>
          {topbar(<ModeChip mode="exam" label={`Examen · ${DIFF_NAME[s.difficulty]}`} />, (
            <Hud>
              <HudStat icon={Target} tone="progress" value={`${s.index + 1}/${s.questions.length}`} label="Molécula" />
              <HudStat icon={Clock} tone="time" value={`${elapsed}s`} label="Tiempo" />
            </Hud>
          ))}
          {buildChrome(
            'Examen · sin ayudas',
            <button type="button" className="mc-check is-exam" onClick={submitExam} disabled={!builder.model.atoms.length}><Send size={19} /><span>Enviar</span></button>,
            <div className="mc-mission__dots"><ProgressDots total={s.questions.length} current={s.index} /></div>,
            { showFormula: s.difficulty !== 'hard', showCounts: s.difficulty === 'easy' },
          )}
        </>
      );
    } else if (s.kind === 'rush' && !s.over) {
      playUI = (
        <>
          {topbar(<ModeChip mode="medium" label="Contrarreloj" />, (
            <Hud>
              <HudStat icon={Timer} tone={rushLeft <= 10 ? 'bad' : 'time'} value={`${rushLeft}s`} label="Quedan" />
              <HudStat icon={FlaskConical} tone="good" value={s.built} label="Hechas" />
              <HudStat icon={Trophy} tone="score" value={s.points} label="Puntos" />
            </Hud>
          ))}
          {buildChrome(
            'Contrarreloj',
            <button type="button" className="mc-check is-soft" onClick={skipRush}><SkipForward size={19} /><span>Saltar −5 s</span></button>,
            null,
            { showFormula: true, showCounts: true },
          )}
        </>
      );
    } else if (s.kind === 'quiz' && !s.over) {
      const round = s.rounds[s.index];
      playUI = (
        <>
          {topbar(<ModeChip mode="easy" label="¿Qué molécula es?" />, (
            <Hud>
              <HudStat icon={Target} tone="progress" value={`${s.index + 1}/${s.rounds.length}`} label="Ronda" />
              <HudStat icon={Flame} tone="streak" value={s.streak} label="Racha" />
              <HudStat icon={Trophy} tone="score" value={s.points} label="Puntos" />
            </Hud>
          ))}
          <aside className="mc-side mc-side--quiz">
            <section className="mc-mission">
              <span className="mc-kicker"><Box size={13} /> Gira el modelo y elige</span>
              <h2 className="mc-mission__name">¿Qué molécula es?</h2>
              <div className="mc-quiz">
                {round.options.map((m, i) => {
                  const state = !s.answer ? 'idle' : m.id === round.mol.id ? 'correct' : m.id === s.answer ? 'wrong' : 'idle';
                  return (
                    <AnswerOption key={m.id} letter={'ABCD'[i]} state={state} className={s.answer && state === 'idle' ? 'is-dim' : ''}
                      onClick={() => answerQuiz(m)} disabled={!!s.answer}>
                      <span className="mc-quiz__opt"><b>{m.name}</b>{s.answer && <small>{m.formula}</small>}</span>
                    </AnswerOption>
                  );
                })}
              </div>
              {s.answer && (
                <motion.div className="mc-quiz__after" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <FactChips mol={round.mol} />
                  <GameButton variant="primary" iconRight={ArrowRight} onClick={nextQuiz} autoFocus>
                    {s.index + 1 < s.rounds.length ? 'Siguiente' : 'Ver resultados'}
                  </GameButton>
                </motion.div>
              )}
            </section>
          </aside>
        </>
      );
    }
  }

  // Resúmenes finales
  let results = null;
  if (screen === 'play' && session?.kind === 'exam' && session.showResults) {
    const total = session.questions.length;
    const correct = session.answers.filter((a) => a.correct).length;
    const cfg = EXAM_DIFFICULTY[session.difficulty];
    const { nota, surplusPoints } = computeCrafteoNota(correct, total, session.difficulty);
    const points = computeCrafteoScore(correct, total, session.finalTime, session.difficulty);
    results = (
      <ResultsScreen
        subtitle={`Mesa de Crafteo · ${DIFF_NAME[session.difficulty]} · ${cfg.note}`}
        nota={nota}
        points={points}
        stats={[
          { icon: Target, tone: 'good', label: 'Aciertos', value: `${correct}/${total}` },
          { icon: Clock, tone: 'time', label: 'Tiempo', value: `${session.finalTime}s` },
          { icon: GraduationCap, tone: 'progress', label: 'Dificultad', value: DIFF_NAME[session.difficulty] },
          ...(surplusPoints > 0 ? [{ icon: Sparkles, tone: 'streak', label: 'Extra de nota', value: `+${surplusPoints} pts` }] : []),
        ]}
        actions={[
          { label: 'Nuevo examen', onClick: () => setShowDiff(true), icon: RotateCcw },
          { label: 'Volver al inicio', onClick: goHome, icon: Home, variant: 'soft' },
        ]}
      >
        {session.answers.map((a, i) => (
          <FeedbackItem key={i} index={i + 1} ok={a.correct} title={`${a.mol.name} · ${a.mol.formula}`}>
            <div className="mc-fb">
              <Blueprint {...displayOf(a.mol)} className="mc-fb__bp" title={`Solución: ${a.mol.name}`} />
              <span>{a.correct ? 'Estructura correcta.' : diagnose(a.built, a.mol, pool).text}</span>
            </div>
          </FeedbackItem>
        ))}
      </ResultsScreen>
    );
  } else if (screen === 'play' && session?.kind === 'rush' && session.over) {
    const tot = Math.max(1, session.built + session.skipped);
    results = (
      <ResultsScreen
        mode="practice"
        title="¡Tiempo!"
        subtitle={`Contrarreloj · récord ${Math.max(progress.bestRush || 0, session.points)} puntos`}
        nota={Math.round((session.built / tot) * 100) / 10}
        points={session.points}
        stats={[
          { icon: FlaskConical, tone: 'good', label: 'Construidas', value: session.built },
          { icon: SkipForward, tone: 'bad', label: 'Saltadas', value: session.skipped },
          { icon: Clock, tone: 'time', label: 'Duración', value: `${session.finalTime}s` },
        ]}
        actions={[
          { label: 'Otra vez', onClick: startRush, icon: RotateCcw },
          { label: 'Volver al inicio', onClick: goHome, icon: Home, variant: 'soft' },
        ]}
      >
        {session.log.map((l, i) => <FeedbackItem key={i} index={i + 1} ok={l.ok} title={`${l.mol.name} · ${l.mol.formula}`} />)}
      </ResultsScreen>
    );
  } else if (screen === 'play' && session?.kind === 'quiz' && session.over) {
    results = (
      <ResultsScreen
        mode="practice"
        title="¡Ronda terminada!"
        subtitle={`¿Qué molécula es? · mejor racha ${session.best}`}
        nota={Math.round((session.correct / session.rounds.length) * 100) / 10}
        points={session.points}
        stats={[
          { icon: Check, tone: 'good', label: 'Aciertos', value: `${session.correct}/${session.rounds.length}` },
          { icon: Flame, tone: 'streak', label: 'Mejor racha', value: session.best },
          { icon: Clock, tone: 'time', label: 'Tiempo', value: `${session.finalTime}s` },
        ]}
        actions={[
          { label: 'Otra ronda', onClick: startQuiz, icon: RotateCcw },
          { label: 'Volver al inicio', onClick: goHome, icon: Home, variant: 'soft' },
        ]}
      >
        {session.log.map((l, i) => (
          <FeedbackItem key={i} index={i + 1} ok={l.ok} title={`${l.mol.name} · ${l.mol.formula}`}>
            {!l.ok && <>Elegiste {l.picked.name}.</>}
          </FeedbackItem>
        ))}
      </ResultsScreen>
    );
  }

  return (
    <GameShell theme="dark" wide {...SHELL} className={`mc-shell mc-screen-${screen}`}>
      <div className="mc-stage">{stage}</div>
      <div className="mc-vignette" aria-hidden="true" />

      {screen === 'home' && (
        <div className="mc-overlay mc-overlay--home">
          <motion.div className="mc-panel mc-panel--wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
            <ModeSelect
              description="Construye moléculas reales átomo a átomo: une, gira y descubre su forma en 3D."
              modes={[
                { id: 'campaign', tone: 'easy', icon: MapIcon, title: 'Campaña', desc: `${worlds.length} mundos, de las moléculas diatómicas a ${rank >= 5 ? 'los iones y la VSEPR' : rank >= 3 ? 'la química del carbono' : 'los enlaces triples'}.`, features: ['3 estrellas por nivel', 'Desbloquea mundos y moléculas'], cta: 'Jugar campaña' },
                { id: 'lab', tone: 'medium', icon: FlaskConical, title: 'Laboratorio libre', desc: 'Construye lo que quieras: si formas una molécula real, la reconoceré.', features: ['Todos los elementos de tu curso', 'Rellena tu álbum'], cta: 'Entrar al laboratorio' },
                { id: 'exam', tone: 'exam', title: 'Examen', desc: 'Construye las moléculas que te pidan, sin ayudas. Cuenta para tus tareas.', features: ['Nota sobre 10 (Fácil máx. 9 · Difícil ×1,1)', 'Puntos por rapidez'], cta: 'Elegir dificultad' },
              ]}
              onSelect={(id) => { if (id === 'campaign') setScreen('map'); else if (id === 'lab') startLab(); else setShowDiff(true); }}
              onHelp={() => setShowTutorial(true)}
              extra={(
                <div className="mc-extras">
                  <button type="button" className="mc-mini" onClick={startQuiz} style={{ '--t': '#22d3ee' }}>
                    <span className="mc-mini__icon"><Box size={20} /></span>
                    <span><strong>¿Qué molécula es?</strong><small>Reconoce {QUIZ_ROUNDS} modelos 3D{progress.bestQuiz ? ` · récord ${progress.bestQuiz}` : ''}</small></span>
                  </button>
                  <button type="button" className="mc-mini" onClick={startRush} style={{ '--t': '#fbbf24' }}>
                    <span className="mc-mini__icon"><Timer size={20} /></span>
                    <span><strong>Contrarreloj</strong><small>{RUSH_SECONDS} s para construir todas las que puedas{progress.bestRush ? ` · récord ${progress.bestRush}` : ''}</small></span>
                  </button>
                  <button type="button" className="mc-mini" onClick={() => setScreen('album')} style={{ '--t': '#a78bfa' }}>
                    <span className="mc-mini__icon"><BookOpen size={20} /></span>
                    <span><strong>Álbum molecular</strong><small>{albumHave} de {pool.length} moléculas descubiertas</small></span>
                  </button>
                  {webgl && <GraphicsQualitySelector className="gfxsel-on-dark mc-gfx" />}
                </div>
              )}
            />
          </motion.div>
        </div>
      )}

      {screen === 'map' && (
        <div className="mc-overlay mc-overlay--page">
          <CampaignMap worlds={worlds} progress={progress} rank={rank} onPlay={startLevel} onBack={() => setScreen('home')} />
        </div>
      )}

      {screen === 'album' && (
        <div className="mc-overlay mc-overlay--page">
          <Album molecules={pool} worlds={worlds} album={progress.album} onBack={() => setScreen('home')} onView3D={openViewer} />
        </div>
      )}

      {screen === 'viewer' && viewerMol && (
        <>
          {topbar(<ModeChip mode="practice" label="Álbum" />, null)}
          <aside className="mc-side mc-side--viewer">
            <section className="mc-mission">
              <MoleculeInfo mol={viewerMol} />
              <div className="mc-sheet__actions">
                <GameButton variant="soft" icon={BookOpen} onClick={() => setScreen('album')}>Volver al álbum</GameButton>
              </div>
            </section>
          </aside>
        </>
      )}

      {playUI}

      {results && (
        <div className="mc-overlay">
          <div className="mc-panel mc-panel--wide mc-panel--results">{results}</div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div className="mc-toast" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status">
            <BookOpen size={16} /> <span>{toast.text}: <strong>{toast.mol.name}</strong> {toast.mol.formula}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDiff && (
          <motion.div className="mc-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mc-panel mc-panel--wide" initial={{ y: 20 }} animate={{ y: 0 }}>
              <ModeSelect
                title="Configura el examen"
                description="La nota base está en Medio. Además, la puntuación depende del tiempo: dos alumnos con la misma nota pueden obtener puntos distintos."
                modes={['easy', 'medium', 'hard'].map((d) => ({
                  id: d, tone: DIFF_TONE[d], icon: DIFF_ICON[d], title: DIFF_NAME[d],
                  desc: `${EXAM_DIFFICULTY[d].questions} moléculas ${d === 'easy' ? 'sencillas, con fórmula y contador' : d === 'medium' ? 'variadas, con la fórmula' : 'exigentes: solo el nombre'}.`,
                  features: [EXAM_DIFFICULTY[d].note, fmtMult(EXAM_DIFFICULTY[d].scoreMult)],
                  cta: 'Empezar',
                }))}
                onSelect={startExam}
                footer={<GameButton variant="ghost" size="sm" onClick={() => setShowDiff(false)}>Cancelar</GameButton>}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmExit}
        title={session?.kind === 'exam' ? '¿Salir del examen?' : '¿Salir de la partida?'}
        confirmLabel="Salir"
        cancelLabel="Seguir jugando"
        tone="danger"
        onConfirm={goHome}
        onCancel={() => setConfirmExit(false)}
      >
        {session?.kind === 'exam' ? 'Si sales ahora, el examen no se entrega y no tendrá nota.' : 'Perderás el progreso de esta partida.'}
      </ConfirmDialog>

      <AnimatePresence>
        {showTable && <PeriodicTableModal elementsData={elementsData} onClose={() => setShowTable(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={closeTutorial} />}
      </AnimatePresence>
    </GameShell>
  );
};

// Panel de "¡molécula completa!" (campaña).
function CompletionPanel({ mol, result, onNext, onRetry, onMap }) {
  return (
    <motion.aside
      className="mc-side mc-side--done"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 22 }}
    >
      <section className="mc-mission mc-done">
        <span className="mc-done__tag"><Sparkles size={14} /> ¡Molécula completa!</span>
        <Stars value={result.stars} animate />
        <ul className="mc-done__crit">
          <li className="is-on"><Check size={13} /> Construida</li>
          <li className={result.clean ? 'is-on' : ''}><Check size={13} /> Sin pistas ni errores</li>
          <li className={result.fast ? 'is-on' : ''}><Check size={13} /> Rápida y limpia ({result.seconds}s)</li>
        </ul>
        <MoleculeInfo mol={mol} />
        <div className="mc-done__pts">
          <Trophy size={16} /> +{result.points} puntos
          {result.isNew && <span className="mc-pill is-new"><BookOpen size={12} /> Nueva en el álbum</span>}
          {!result.improved && <span className="mc-pill is-soft">Sin mejorar tu marca</span>}
        </div>
        <div className="mc-done__actions">
          <GameButton variant="success" size="lg" iconRight={ArrowRight} onClick={onNext} autoFocus>Siguiente</GameButton>
          <GameButton variant="soft" icon={RotateCcw} onClick={onRetry}>Repetir</GameButton>
          <GameButton variant="ghost" icon={MapIcon} onClick={onMap}>Mapa</GameButton>
        </div>
      </section>
    </motion.aside>
  );
}

export default MesaCrafteo;
