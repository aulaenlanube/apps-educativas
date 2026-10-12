// src/apps/la-fortaleza/FortalezaGame.jsx
// Componente de partida en 3D: escena three.js a pantalla completa + HUD +
// fases (quiz → construcción → oleada) + habilidades activas con energía.
// Recibe el contenido ya preparado por LaFortaleza.jsx y devuelve el resultado
// por onEnd(). onProgress() emite eventos de progreso (preparado para el duelo).

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Coins, Star, Flame, Play, Volume2, VolumeX, Maximize2,
  FastForward, Flag, X, ArrowUpCircle, Trash2, Waves, Timer, Zap, Move, LogOut, Castle, Settings2, Lock,
  Crosshair, Hammer, Landmark, Bomb, Hourglass, Trophy, Swords,
  Shield, Gem, GraduationCap, Check, Crown, ScrollText, Sailboat, Droplets, CloudSun, DoorOpen, Sparkles,
} from 'lucide-react';
import {
  HudStat, AnswerOption, GameButton, ProgressBar, Segmented,
} from '../_shared/kit';
import {
  createGame, startRun, stepGame, placeTower, upgradeTower,
  sellTower, moveTower, classifyEnemy, bossStrike, bossEnrage, canPlace, rewardCorrectAnswer,
  castAbility, ABILITIES, ENERGY_MAX, MOVE_COST,
  TOWER_TYPES, MAX_TOWER_LEVEL, upgradeCost, sellValue, EXAM_VICTORY_LEVEL,
  SANCT_UNLOCK_CORRECT, FORT_UPGRADES, buyFortUpgrade,
  RELICS, chooseRelic, enterEndless, scoreMult,
  merchantBoard, merchantResolve, wellEngage, wellCancel, wellBet, wellResolve,
  crackGeode, WELL_BETS, WELL_MULT,
} from './engine';
import { createScene3D, pickAmbience } from './render3d';
import FortIcon from './FortIcons';
import {
  QUALITY_LEVELS, QUALITY_LABELS, loadQualityPref, saveQualityPref,
  resolveQuality, lowerTier, createFpsGovernor,
} from './quality';

const PREP_QUESTIONS = 2;       // preguntas de la fase de preparación
const QUIZ_SECONDS_EXAM = 30;
const BOSS_SECONDS = 25;
const PERIODIC_SECONDS = 20;    // pregunta periódica durante la acción
const DRAG_THRESHOLD = 8; // px: por debajo es un toque, por encima orbita la cámara

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

// Presentación: letras de las opciones y colores de la app para el ámbito del kit
const LETTERS = ['A', 'B', 'C', 'D'];
const SCOPE_STYLE = { '--gk-accent': '#a855f7', '--gk-accent-2': '#f59e0b' };

const MINIGAME_BASE_POINTS = 50; // puntos = base · nº de acierto en la cadena
const MINIGAME_BASE_COINS = 15;  // monedas = base · nº de acierto en la cadena

// icono lucide por reliquia (coherente con la UI, sin emojis)
const RELIC_ICONS = {
  catalejo: Crosshair, forja: Hammer, argamasa: Landmark, bolsa: Coins,
  estandarte: Flag, polvora: Bomb, reloj: Hourglass, amuleto: Heart,
};

const FortalezaGame = ({ seed, mode, categories, questions, bossQuestions, pools, sounds, onEnd, onProgress, onExit }) => {
  const isExam = mode === 'exam';

  // --- motor (uno por montaje, determinista por seed) ---
  const gameRef = useRef(null);
  if (!gameRef.current) {
    gameRef.current = createGame({ seed, mode, categories });
  }
  const game = gameRef.current;

  // --- estado React (HUD y UI) ---
  const [phase, setPhase] = useState('quiz'); // quiz (preparación) | build (preparación) | run | ended
  const [mini, setMini] = useState(null); // {stage:'offer'|'playing', step, question, timeLeft, total, feedback}
  const [hud, setHud] = useState({ coins: game.coins, lives: game.lives, level: game.level, score: game.score, energy: game.energy, abilityReady: true, shield: 0, fortLevel: 0, relics: 0, endless: false });
  const [fortOpen, setFortOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [overlay, setOverlay] = useState(null); // classify | boss | question | catpick | quit
  const [placingType, setPlacingType] = useState(null);
  const [aimingAbility, setAimingAbility] = useState(null);
  const [movingTowerId, setMovingTowerId] = useState(null);
  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());

  // --- calidad gráfica: preferencia persistida + nivel efectivo resuelto ---
  const [gfxPref, setGfxPref] = useState(loadQualityPref);
  const [gfxTier, setGfxTier] = useState(() => resolveQuality(loadQualityPref()));
  const [gfxOpen, setGfxOpen] = useState(false);
  const [gfxToast, setGfxToast] = useState(null);
  const gfxPrefRef = useRef(gfxPref);
  gfxPrefRef.current = gfxPref;
  const gfxToastTimer = useRef(null);

  const changeQuality = useCallback((pref) => {
    saveQualityPref(pref);
    setGfxPref(pref);
    setGfxTier(resolveQuality(pref));
    setGfxOpen(false);
  }, []);

  // --- refs espejo para el bucle rAF y los handlers de puntero ---
  const phaseRef = useRef(phase);
  const overlayRef = useRef(overlay);
  const speedRef = useRef(speed);
  const placingRef = useRef(placingType);
  const aimingRef = useRef(aimingAbility);
  const movingRef = useRef(movingTowerId);
  const selectedRef = useRef(selectedTowerId);
  const hoverCellRef = useRef(null);
  const hoverFieldRef = useRef(null);
  const streakRef = useRef(0);
  const endedRef = useRef(false);
  const qPointerRef = useRef(0);
  const bossPointerRef = useRef(0);
  const miniPtrRef = useRef({ 1: 0, 2: 0, 3: 0 });
  const hardPtrRef = useRef(0); // preguntas difíciles del mercader y el pozo
  const miniRef = useRef(null);
  const academicRef = useRef({
    correct: 0, total: 0,
    questions: { c: 0, t: 0 }, classify: { c: 0, t: 0 }, boss: { c: 0, t: 0 },
  });
  // nota sellada al ganar el examen: el asedio infinito ya no la toca
  const sealedRef = useRef(null);
  phaseRef.current = phase;
  overlayRef.current = overlay;
  miniRef.current = mini;
  speedRef.current = speed;
  placingRef.current = placingType;
  aimingRef.current = aimingAbility;
  movingRef.current = movingTowerId;
  selectedRef.current = selectedTowerId;

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rootRef = useRef(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  const soundsRef = useRef(sounds);

  // --- fin de partida (una sola vez) ---
  const endGame = useCallback((outcome) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const g = gameRef.current;
    setPhase('ended');
    setMini(null);
    onEndRef.current?.({
      outcome,
      score: g.score,
      level: g.level,
      lives: g.lives,
      endless: g.endless,
      academic: sealedRef.current ? JSON.parse(JSON.stringify(sealedRef.current)) : { ...academicRef.current },
      durationSeconds: Math.round(g.time),
      stats: { ...g.stats },
    });
  }, []);

  // Abandono a mitad de partida (cierre/navegación): registra el parcial
  useEffect(() => () => {
    if (!endedRef.current && gameRef.current.time > 2) {
      endedRef.current = true;
      const g = gameRef.current;
      onEndRef.current?.({
        outcome: 'abandoned',
        score: g.score,
        level: g.level,
        lives: g.lives,
        endless: g.endless,
        academic: sealedRef.current ? JSON.parse(JSON.stringify(sealedRef.current)) : { ...academicRef.current },
        durationSeconds: Math.round(g.time),
        stats: { ...g.stats },
      });
    }
  }, []);

  // --- contabilidad académica ---
  const tally = useCallback((kind, correct) => {
    if (sealedRef.current) return; // asedio infinito: la nota ya está sellada
    const a = academicRef.current;
    a.total++; a[kind].t++;
    if (correct) {
      a.correct++; a[kind].c++;
      if (a.correct === SANCT_UNLOCK_CORRECT) setTimeout(() => soundsRef.current.unlock(), 600);
    }
  }, []);

  // --- preguntas ---
  const nextQuestion = useCallback(() => {
    const q = questions[qPointerRef.current % questions.length];
    qPointerRef.current++;
    return q;
  }, [questions]);

  const openQuiz = useCallback(() => {
    setQuiz({
      question: nextQuestion(), qNum: 1, input: '', feedback: null, reward: 0,
      timeLeft: isExam ? QUIZ_SECONDS_EXAM : null,
    });
    setPhase('quiz');
  }, [nextQuestion, isExam]);

  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    openQuiz();
  }, [openQuiz]);

  const answerQuiz = useCallback((answer) => {
    setQuiz((prev) => {
      if (!prev || prev.feedback) return prev;
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('questions', correct);
      let reward = 0;
      if (correct) {
        streakRef.current++;
        reward = rewardCorrectAnswer(gameRef.current, streakRef.current);
        soundsRef.current.correct();
        setTimeout(() => soundsRef.current.coin(), 250);
      } else {
        streakRef.current = 0;
        soundsRef.current.wrong();
      }
      setStreak(streakRef.current);
      return { ...prev, feedback: correct ? 'correct' : 'wrong', reward };
    });
  }, [tally]);

  // Avance tras el feedback del quiz
  useEffect(() => {
    if (!quiz?.feedback) return;
    const t = setTimeout(() => {
      setQuiz((prev) => {
        if (!prev) return prev;
        if (prev.qNum >= PREP_QUESTIONS) {
          setPhase('build');
          return null;
        }
        return {
          question: nextQuestion(), qNum: prev.qNum + 1, input: '', feedback: null, reward: 0,
          timeLeft: isExam ? QUIZ_SECONDS_EXAM : null,
        };
      });
    }, 1100);
    return () => clearTimeout(t);
  }, [quiz?.feedback, quiz?.qNum, nextQuestion, isExam]);

  // Temporizador del quiz (solo examen)
  useEffect(() => {
    if (!isExam || !quiz || quiz.feedback || quiz.timeLeft == null) return;
    if (quiz.timeLeft <= 0) { answerQuiz(null); return; }
    const t = setTimeout(() => setQuiz((p) => (p && !p.feedback ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [quiz, isExam, answerQuiz]);

  // --- jefe ---
  const answerBoss = useCallback((answer) => {
    setOverlay((prev) => {
      if (prev?.type !== 'boss' || prev.feedback) return prev;
      const g = gameRef.current;
      const alive = g.enemies.some((e) => e.id === prev.enemyId && e.hp > 0);
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('boss', correct);
      if (alive) {
        if (correct) { bossStrike(g, prev.enemyId); soundsRef.current.crit(); }
        else { bossEnrage(g, prev.enemyId); soundsRef.current.jam(); }
      } else if (correct) {
        soundsRef.current.correct();
      } else {
        soundsRef.current.wrong();
      }
      return { ...prev, feedback: correct ? 'correct' : 'wrong' };
    });
  }, [tally]);

  // Temporizador del jefe
  useEffect(() => {
    if (overlay?.type !== 'boss' || overlay.feedback) return;
    if (overlay.timeLeft <= 0) { answerBoss(null); return; }
    const t = setTimeout(() => setOverlay((p) => (p?.type === 'boss' && !p.feedback ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [overlay, answerBoss]);

  useEffect(() => {
    if (overlay?.type !== 'boss' || !overlay.feedback) return;
    const t = setTimeout(() => setOverlay(null), 1200);
    return () => clearTimeout(t);
  }, [overlay]);

  // --- Desafío Relámpago: cadena de aciertos con dificultad creciente ---
  const miniQuestion = useCallback((step) => {
    const want = step <= 3 ? 1 : step <= 6 ? 2 : 3;
    // usa el nivel deseado o el más alto disponible por debajo
    const diff = [want, want - 1, want - 2, want + 1, want + 2].find((d) => pools[d]?.length > 0) ?? 1;
    const pool = pools[diff] || [];
    const q = pool[miniPtrRef.current[diff] % pool.length];
    miniPtrRef.current[diff]++;
    return q;
  }, [pools]);

  const miniTimeFor = (step) => Math.max(10 - (step - 1), 4);

  const startMini = useCallback(() => {
    soundsRef.current.minigame();
    setMini({ stage: 'playing', step: 1, question: miniQuestion(1), timeLeft: miniTimeFor(1), total: 0, totalCoins: 0, feedback: null });
  }, [miniQuestion]);

  const endMini = useCallback(() => {
    setMini(null); // la acción continúa donde estaba
  }, []);

  const answerMini = useCallback((answer) => {
    setMini((prev) => {
      if (!prev || prev.stage !== 'playing' || prev.feedback) return prev;
      const g = gameRef.current;
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('questions', correct);
      if (correct) {
        const points = Math.round(MINIGAME_BASE_POINTS * prev.step * scoreMult(g));
        const coins = MINIGAME_BASE_COINS * prev.step;
        g.score += points;
        g.coins += coins;
        g.energy = Math.min(g.energy + 5, ENERGY_MAX);
        soundsRef.current.chain(prev.step);
        return {
          ...prev, feedback: 'correct', reward: points, rewardCoins: coins,
          total: prev.total + points, totalCoins: prev.totalCoins + coins,
        };
      }
      soundsRef.current.wrong();
      return { ...prev, feedback: 'wrong' };
    });
  }, [tally]);

  // Avance/cierre de la cadena + temporizador
  useEffect(() => {
    if (!mini || mini.stage !== 'playing') return;
    if (mini.feedback === 'correct') {
      const t = setTimeout(() => setMini((p) => (p ? {
        ...p, step: p.step + 1, question: miniQuestion(p.step + 1),
        timeLeft: miniTimeFor(p.step + 1), feedback: null, reward: 0,
      } : p)), 800);
      return () => clearTimeout(t);
    }
    if (mini.feedback === 'wrong') {
      const t = setTimeout(endMini, 1600);
      return () => clearTimeout(t);
    }
    if (mini.timeLeft <= 0) { answerMini(null); return; }
    const t = setTimeout(() => setMini((p) => (p && !p.feedback ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [mini, miniQuestion, answerMini, endMini]);

  // --- pregunta periódica durante la acción (el Oráculo las acelera) ---
  const answerOracle = useCallback((answer) => {
    setOverlay((prev) => {
      if (prev?.type !== 'oracle' || prev.feedback) return prev;
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('questions', correct);
      let reward = 0;
      if (correct) {
        streakRef.current++;
        reward = rewardCorrectAnswer(gameRef.current, streakRef.current);
        soundsRef.current.correct();
      } else {
        streakRef.current = 0;
        soundsRef.current.wrong();
      }
      setStreak(streakRef.current);
      return { ...prev, feedback: correct ? 'correct' : 'wrong', reward };
    });
  }, [tally]);

  // Temporizador del oráculo + cierre tras el feedback
  useEffect(() => {
    if (overlay?.type !== 'oracle') return;
    if (overlay.feedback) {
      const t = setTimeout(() => setOverlay(null), 1100);
      return () => clearTimeout(t);
    }
    if (overlay.timeLeft <= 0) { answerOracle(null); return; }
    const t = setTimeout(() => setOverlay((p) => (p?.type === 'oracle' && !p.feedback ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [overlay, answerOracle]);

  // --- minijuegos opcionales: Mercader Errante y Pozo de los Deseos ---
  // pregunta de la dificultad más alta disponible (puntero circular propio)
  const hardQuestion = useCallback(() => {
    const diff = [3, 2, 1].find((d) => pools[d]?.length > 0) ?? 1;
    const pool = pools[diff] || [];
    const q = pool[hardPtrRef.current % pool.length];
    hardPtrRef.current++;
    return q;
  }, [pools]);

  const answerMerchant = useCallback((answer) => {
    setOverlay((prev) => {
      if (prev?.type !== 'merchant' || prev.stage !== 'question' || prev.feedback) return prev;
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('questions', correct);
      const reward = merchantResolve(gameRef.current, correct);
      if (correct) {
        soundsRef.current.correct();
        setTimeout(() => soundsRef.current.coin(), 250);
      } else {
        soundsRef.current.wrong();
      }
      return { ...prev, feedback: correct ? 'correct' : 'wrong', reward };
    });
  }, [tally]);

  // Aceptar el trato revela la pregunta; ya no hay vuelta atrás (como en el
  // Desafío Relámpago: se declina ANTES de ver la pregunta, nunca después,
  // para que no se pueda filtrar solo las que sabes e inflar la nota).
  const acceptMerchant = useCallback(() => {
    const ov = overlayRef.current;
    if (ov?.type !== 'merchant' || ov.stage !== 'offer') return;
    setOverlay({ type: 'merchant', stage: 'question', question: hardQuestion(), feedback: null, reward: 0, timeLeft: PERIODIC_SECONDS });
  }, [hardQuestion]);

  const declineMerchant = useCallback(() => {
    merchantResolve(gameRef.current, null);
    setOverlay(null);
  }, []);

  const placeWellBet = useCallback((amount) => {
    if (!wellBet(gameRef.current, amount)) return;
    soundsRef.current.coin();
    setOverlay({ type: 'well', stage: 'question', bet: amount, question: hardQuestion(), feedback: null, payout: 0, timeLeft: PERIODIC_SECONDS });
  }, [hardQuestion]);

  const answerWell = useCallback((answer) => {
    setOverlay((prev) => {
      if (prev?.type !== 'well' || prev.stage !== 'question' || prev.feedback) return prev;
      const correct = answer != null && norm(answer) === norm(prev.question.solucion);
      tally('questions', correct);
      const payout = wellResolve(gameRef.current, correct);
      if (correct) {
        soundsRef.current.correct();
        setTimeout(() => soundsRef.current.coin(), 250);
      } else {
        soundsRef.current.wrong();
      }
      return { ...prev, feedback: correct ? 'correct' : 'wrong', payout };
    });
  }, [tally]);

  // Si otro overlay va a sustituir al del mercader/pozo (jefe, reliquia,
  // victoria, quit/exit, catpick), liquida antes el estado del engine para
  // que el barco no quede en 'trading' ni el pozo 'engaged' para siempre.
  // Pregunta vista sin responder = fallo (sin escapatoria para cherry-picking);
  // oferta/apuesta sin pregunta vista se cancelan sin coste ni tally.
  const settleMiniOverlay = useCallback(() => {
    const ov = overlayRef.current;
    if (!ov || ov.feedback) return;
    const g = gameRef.current;
    if (ov.type === 'merchant') {
      if (ov.stage === 'question') tally('questions', false);
      merchantResolve(g, null);
    } else if (ov.type === 'well') {
      if (ov.stage === 'question') {
        tally('questions', false);
        wellResolve(g, false);
      } else {
        wellCancel(g);
      }
    }
  }, [tally]);

  // Temporizador + cierre de los modales del mercader y el pozo. La oferta y
  // la apuesta también caducan (sin pregunta vista no hay penalización).
  useEffect(() => {
    const ov = overlay;
    if (ov?.type !== 'merchant' && ov?.type !== 'well') return;
    if (ov.feedback) {
      const t = setTimeout(() => setOverlay((p) => (p === ov ? null : p)), 1500);
      return () => clearTimeout(t);
    }
    if (ov.timeLeft <= 0) {
      if (ov.stage === 'question') {
        (ov.type === 'merchant' ? answerMerchant : answerWell)(null);
      } else {
        if (ov.type === 'merchant') merchantResolve(gameRef.current, null);
        else wellCancel(gameRef.current);
        setOverlay((p) => (p === ov ? null : p));
      }
      return;
    }
    const t = setTimeout(() => setOverlay((p) => (p === ov ? { ...p, timeLeft: p.timeLeft - 1 } : p)), 1000);
    return () => clearTimeout(t);
  }, [overlay, answerMerchant, answerWell]);

  // --- clasificación manual ---
  const answerClassify = useCallback((catIdx) => {
    const ov = overlayRef.current;
    if (ov?.type !== 'classify') return;
    const result = classifyEnemy(gameRef.current, ov.enemyId, catIdx);
    setOverlay(null);
    if (!result) return;
    tally('classify', result.correct);
    if (result.correct) soundsRef.current.crit();
    else soundsRef.current.jam();
  }, [tally]);

  // --- eventos del motor ---
  const handleEvents = useCallback((events) => {
    const snd = soundsRef.current;
    for (const ev of events) {
      switch (ev.t) {
        case 'shoot': snd.shoot(ev.tower); break;
        case 'hit': snd.hit(); break;
        case 'explosion': snd.explosion(); break;
        case 'death': snd.death(); break;
        case 'leak':
          snd.leak();
          onProgressRef.current?.({ type: 'hp', lives: gameRef.current.lives });
          break;
        case 'boss_spawn': {
          snd.bossSpawn();
          const q = bossQuestions[bossPointerRef.current % bossQuestions.length];
          bossPointerRef.current++;
          settleMiniOverlay(); // el jefe pisa el modal del mercader/pozo: liquidar antes
          setOverlay({ type: 'boss', enemyId: ev.enemy.id, question: q, input: '', feedback: null, timeLeft: BOSS_SECONDS });
          break;
        }
        case 'question_time':
          // si hay otro modal abierto, la pregunta pierde su turno
          if (!overlayRef.current && !miniRef.current) {
            snd.coin();
            setOverlay({ type: 'oracle', question: nextQuestion(), input: '', feedback: null, reward: 0, timeLeft: PERIODIC_SECONDS });
          }
          break;
        case 'level_up':
          snd.waveClear();
          onProgressRef.current?.({ type: 'level_up', level: ev.level, score: gameRef.current.score });
          break;
        case 'minigame_offer':
          if (!overlayRef.current && !miniRef.current) {
            setMini({ stage: 'offer', step: 0, total: 0 });
          }
          break;
        case 'merchant_docked': snd.shipBell(); break;
        case 'well_spawn': snd.splash(); break;
        case 'geode_spawn': snd.coin(); break;
        case 'ally_spawn': snd.allySpawn(); break;
        case 'ally_death': snd.jam(); break;
        case 'heal': snd.heal(); break;
        case 'shield_hit': snd.shield(); break;
        case 'gate_open': snd.gateOpen(); break;
        case 'tower_hit': snd.towerHit(); break;
        case 'tower_destroyed':
          snd.towerDown();
          if (selectedRef.current === ev.towerId) setSelectedTowerId(null);
          if (movingRef.current === ev.towerId) setMovingTowerId(null);
          break;
        case 'relic_offer':
          snd.unlock();
          settleMiniOverlay();
          setOverlay({ type: 'relic', options: ev.options });
          break;
        case 'victory':
          snd.victory();
          settleMiniOverlay();
          if (isExam) {
            // sella la nota en este instante y deja elegir: terminar o asedio
            sealedRef.current = JSON.parse(JSON.stringify(academicRef.current));
            setOverlay({ type: 'victory' });
          } else {
            endGame('victory');
          }
          break;
        case 'defeat':
          snd.defeat();
          setOverlay(null);
          // caer en el asedio infinito sigue siendo una victoria (nota sellada)
          endGame(gameRef.current.endless ? 'victory' : 'defeat');
          break;
        default: break;
      }
    }
  }, [bossQuestions, endGame, nextQuestion, isExam, settleMiniOverlay]);

  // --- escena 3D + bucle principal ---
  // gfxTier en las deps: cambiar la calidad desecha y reconstruye la escena
  // desde el estado del engine (la partida no se entera del cambio).
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = createScene3D(mount, gameRef.current, gfxTier);
    sceneRef.current = scene;
    const ro = new ResizeObserver(() => scene.resize());
    ro.observe(mount);

    // governor: si el equipo no sostiene los FPS en modo Auto, baja un nivel
    const governor = createFpsGovernor({
      onDowngrade: () => {
        if (gfxPrefRef.current !== 'auto') return;
        setGfxTier((tier) => {
          const next = lowerTier(tier);
          if (next === tier) return tier;
          setGfxToast(`Rendimiento bajo: calidad ajustada a ${QUALITY_LABELS[next]}`);
          clearTimeout(gfxToastTimer.current);
          gfxToastTimer.current = setTimeout(() => setGfxToast(null), 4500);
          return next;
        });
      },
    });

    let raf = 0;
    let last = performance.now();
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      governor.tick(dt);
      const g = gameRef.current;

      // Escala temporal: modal abierto → pausa (práctica) o cámara lenta (examen)
      let scale = speedRef.current;
      const ov = overlayRef.current;
      const mg = miniRef.current;
      if ((ov && (ov.type === 'classify' || ov.type === 'quit' || ov.type === 'exit'
        || ov.type === 'relic' || ov.type === 'victory'
        || ((ov.type === 'boss' || ov.type === 'oracle' || ov.type === 'merchant' || ov.type === 'well') && !ov.feedback)))
        || (mg && (mg.stage === 'offer' || !mg.feedback))) {
        scale = isExam ? 0.25 : 0;
      }
      if (phaseRef.current === 'ended') scale = 0.3;

      if (scale > 0 && !endedRef.current) {
        const events = stepGame(g, dt * scale);
        if (events.length) handleEvents(events);
      } else if (scale > 0) {
        stepGame(g, dt * scale);
      }

      if (ov?.type === 'boss' && !ov.feedback && !g.enemies.some((e) => e.id === ov.enemyId && e.hp > 0)) {
        setOverlay(null);
      }

      setHud((prev) => {
        const energy = Math.round(g.energy);
        const abilityReady = g.time >= g.abilityCdUntil;
        if (prev.coins === g.coins && prev.lives === g.lives && prev.level === g.level
          && prev.score === g.score && prev.energy === energy && prev.abilityReady === abilityReady
          && prev.shield === g.fortShield && prev.fortLevel === g.fortUpgrades.length
          && prev.relics === g.relics.length && prev.endless === g.endless) return prev;
        return {
          coins: g.coins, lives: g.lives, level: g.level, score: g.score, energy, abilityReady,
          shield: g.fortShield, fortLevel: g.fortUpgrades.length,
          relics: g.relics.length, endless: g.endless,
        };
      });

      // El modo "mover" reutiliza el fantasma de colocación con el tipo de la torre
      const movingTower = movingRef.current ? g.towers.find((t) => t.id === movingRef.current) : null;
      const placing = placingRef.current || (movingTower ? movingTower.type : null);
      const placeCost = placingRef.current ? TOWER_TYPES[placingRef.current].cost : MOVE_COST;
      scene.render({
        selectedTowerId: selectedRef.current,
        placingType: placing,
        hoverCell: placing ? hoverCellRef.current : null,
        placingValid: placing && hoverCellRef.current
          ? canPlace(g, placing, hoverCellRef.current[0], hoverCellRef.current[1]) && g.coins >= placeCost
          : false,
        aimingAbility: aimingRef.current,
        hoverField: hoverFieldRef.current,
      });
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [handleEvents, isExam, gfxTier]);

  // --- interacción: toque corto = acción, arrastre = orbitar, rueda/pellizco = zoom ---
  const pointersRef = useRef(new Map());
  const dragRef = useRef(null);

  const handleTap = useCallback((clientX, clientY) => {
    const scene = sceneRef.current;
    const g = gameRef.current;
    if (!scene) return;
    const hit = scene.pick(clientX, clientY);
    if (!hit) return;

    // 1) Apuntando una habilidad: lanzar donde se toque
    if (aimingRef.current) {
      let field = null;
      if (hit.kind === 'ground') field = hit.field;
      else if (hit.kind === 'enemy') {
        const e = g.enemies.find((en) => en.id === hit.enemyId);
        if (e) field = { x: e.x, y: e.y };
      }
      if (field && castAbility(g, aimingRef.current, field.x, field.y)) {
        soundsRef.current.ability(aimingRef.current);
        setAimingAbility(null);
      }
      return;
    }

    // 2) Enemigo (disparo de precisión) — solo durante la acción y sin modal
    if (hit.kind === 'enemy' && phaseRef.current === 'run' && !overlayRef.current && !placingRef.current) {
      const e = g.enemies.find((en) => en.id === hit.enemyId);
      if (e && e.hp > 0 && !e.classified) {
        setSelectedTowerId(null);
        setOverlay({ type: 'classify', enemyId: e.id, word: e.word });
      }
      return;
    }

    // 2b) Minijuegos opcionales: barco atracado, pozo de los deseos y geoda
    // (miniRef también bloquea: nada de apilarse sobre el Desafío Relámpago
    // ni de picar la geoda gratis con el tiempo congelado por su pausa)
    if (hit.kind === 'merchant' && phaseRef.current === 'run' && !overlayRef.current && !miniRef.current) {
      if (merchantBoard(g)) {
        soundsRef.current.shipBell();
        setSelectedTowerId(null);
        setOverlay({ type: 'merchant', stage: 'offer', feedback: null, timeLeft: PERIODIC_SECONDS });
      }
      return;
    }
    if (hit.kind === 'well' && phaseRef.current === 'run' && !overlayRef.current && !miniRef.current) {
      if (wellEngage(g)) {
        soundsRef.current.splash();
        setSelectedTowerId(null);
        setOverlay({ type: 'well', stage: 'bet', bet: 0, question: null, feedback: null, timeLeft: PERIODIC_SECONDS });
      }
      return;
    }
    if (hit.kind === 'geode' && phaseRef.current === 'run' && !overlayRef.current && !miniRef.current) {
      const res = crackGeode(g);
      if (res) {
        if (res.broken) soundsRef.current.geodeBreak();
        else soundsRef.current.geodeCrack(res.hits);
      }
      return;
    }

    // 3) Recolocar una construcción
    if (movingRef.current && hit.kind === 'ground') {
      const [col, row] = hit.cell;
      if (moveTower(g, movingRef.current, col, row)) {
        soundsRef.current.build();
        setMovingTowerId(null);
      }
      return;
    }

    // 4) Colocación de torre
    if (placingRef.current && hit.kind === 'ground') {
      const [col, row] = hit.cell;
      const type = TOWER_TYPES[placingRef.current];
      if (canPlace(g, placingRef.current, col, row) && g.coins >= type.cost) {
        if (type.needsCategory) {
          settleMiniOverlay(); // catpick pisa el overlay vigente
          setOverlay({ type: 'catpick', col, row, towerType: placingRef.current });
        } else {
          placeTower(g, col, row, placingRef.current);
          soundsRef.current.build();
        }
      }
      return;
    }

    // 5) Selección de fortaleza / torre / deseleccionar
    if (hit.kind === 'fortress' && !placingRef.current && !movingRef.current) {
      setSelectedTowerId(null);
      setFortOpen(true);
      return;
    }
    if (hit.kind === 'tower') setSelectedTowerId(hit.towerId);
    else setSelectedTowerId(null);
    setFortOpen(false);
  }, [settleMiniOverlay]);

  const updateHover = useCallback((clientX, clientY) => {
    const scene = sceneRef.current;
    if (!scene || (!placingRef.current && !aimingRef.current && !movingRef.current)) return;
    const hit = scene.pick(clientX, clientY);
    if (hit?.kind === 'ground') {
      hoverCellRef.current = hit.cell;
      hoverFieldRef.current = hit.field;
    } else if (hit?.kind === 'enemy') {
      const e = gameRef.current.enemies.find((en) => en.id === hit.enemyId);
      if (e) hoverFieldRef.current = { x: e.x, y: e.y };
    }
  }, []);

  const onPointerDown = useCallback((evt) => {
    // Solo cuenta lo que empieza sobre el canvas 3D: los modales y paneles
    // superpuestos no deben disparar taps/órbita al burbujear.
    if (evt.target?.tagName !== 'CANVAS') return;
    evt.currentTarget.setPointerCapture?.(evt.pointerId);
    pointersRef.current.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
    if (pointersRef.current.size === 1) {
      dragRef.current = { x: evt.clientX, y: evt.clientY, moved: false };
    } else {
      dragRef.current = null; // pellizco
    }
  }, []);

  const onPointerMove = useCallback((evt) => {
    const pointers = pointersRef.current;
    if (pointers.has(evt.pointerId)) {
      const prev = pointers.get(evt.pointerId);
      const dx = evt.clientX - prev.x, dy = evt.clientY - prev.y;

      if (pointers.size === 2) {
        // pellizco → zoom
        const [a, b] = [...pointers.values()];
        const before = Math.hypot(a.x - b.x, a.y - b.y);
        pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
        const [a2, b2] = [...pointers.values()];
        const after = Math.hypot(a2.x - b2.x, a2.y - b2.y);
        if (Math.abs(after - before) > 1) sceneRef.current?.zoom(before - after);
        return;
      }

      pointers.set(evt.pointerId, { x: evt.clientX, y: evt.clientY });
      const drag = dragRef.current;
      if (drag) {
        const total = Math.hypot(evt.clientX - drag.x, evt.clientY - drag.y);
        if (total > DRAG_THRESHOLD) drag.moved = true;
        if (drag.moved) sceneRef.current?.orbit(dx, dy);
      }
    }
    updateHover(evt.clientX, evt.clientY);
  }, [updateHover]);

  const onPointerUp = useCallback((evt) => {
    if (!pointersRef.current.has(evt.pointerId)) return;
    const drag = dragRef.current;
    pointersRef.current.delete(evt.pointerId);
    if (drag && !drag.moved && pointersRef.current.size === 0) {
      handleTap(evt.clientX, evt.clientY);
    }
    if (pointersRef.current.size === 0) dragRef.current = null;
  }, [handleTap]);

  const onWheel = useCallback((evt) => {
    sceneRef.current?.zoom(evt.deltaY);
  }, []);

  // --- acciones UI ---
  const startDefense = useCallback(() => {
    startRun(gameRef.current);
    setPhase('run');
  }, []);

  const pickCategoryAndPlace = useCallback((catIdx) => {
    const ov = overlayRef.current;
    if (ov?.type !== 'catpick') return;
    // la celda pudo ocuparse mientras elegías (p.ej. brotó una geoda ahí)
    if (placeTower(gameRef.current, ov.col, ov.row, ov.towerType, catIdx)) {
      soundsRef.current.build();
    } else {
      soundsRef.current.wrong();
    }
    setOverlay(null);
  }, []);

  const doUpgrade = useCallback(() => {
    if (upgradeTower(gameRef.current, selectedRef.current)) soundsRef.current.build();
  }, []);

  const startMove = useCallback(() => {
    setPlacingType(null);
    setAimingAbility(null);
    setMovingTowerId(selectedRef.current);
    setSelectedTowerId(null);
  }, []);

  const doSell = useCallback(() => {
    if (sellTower(gameRef.current, selectedRef.current)) {
      soundsRef.current.coin();
      setSelectedTowerId(null);
    }
  }, []);

  const doFortUpgrade = useCallback(() => {
    const up = buyFortUpgrade(gameRef.current);
    if (up) soundsRef.current.fortify();
  }, []);

  const pickRelic = useCallback((id) => {
    if (chooseRelic(gameRef.current, id)) {
      soundsRef.current.fortify();
      setOverlay(null);
    }
  }, []);

  const continueEndless = useCallback(() => {
    enterEndless(gameRef.current);
    soundsRef.current.gateOpen();
    setOverlay(null);
  }, []);

  const toggleSound = useCallback(() => setSoundOn(soundsRef.current.toggle()), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.();
  }, []);

  const toggleAbility = useCallback((id) => {
    setPlacingType(null);
    setSelectedTowerId(null);
    setMovingTowerId(null);
    setFortOpen(false);
    setGfxOpen(false);
    setAimingAbility((prev) => (prev === id ? null : id));
  }, []);

  // --- derivados ---
  const selectedTower = selectedTowerId ? game.towers.find((t) => t.id === selectedTowerId) : null;
  // nivel de amenaza (solo presentación): valor + etiqueta del marcador
  const levelValue = isExam
    ? (hud.endless ? `${hud.level}` : `${Math.min(hud.level, EXAM_VICTORY_LEVEL)}/${EXAM_VICTORY_LEVEL}`)
    : `${hud.level}`;
  const levelTag = hud.endless ? 'Asedio ∞' : 'Amenaza';
  const a = academicRef.current;
  const nextUp = FORT_UPGRADES[hud.fortLevel] ?? null;
  const ambience = useMemo(() => pickAmbience(seed), [seed]);
  const sealedNota = sealedRef.current
    ? (Math.round((sealedRef.current.correct / Math.max(sealedRef.current.total, 1)) * 100) / 10).toFixed(1)
    : null;
  const qualityOptions = [
    { value: 'auto', label: 'Auto', icon: Sparkles },
    ...QUALITY_LEVELS.map((l) => ({ value: l.id, label: l.name })),
  ];

  // Pregunta tipo test con las opciones del kit (A, B, C, D)
  const renderOptions = (options, onPick) => (
    <div className={`fort-dlg__options ${options.length === 2 ? 'is-two' : ''}`}>
      {options.map((opt, i) => (
        <AnswerOption key={opt} letter={LETTERS[i]} onClick={() => onPick(opt)}>{opt}</AnswerOption>
      ))}
    </div>
  );
  // Respuesta escrita (solo examen)
  const renderWrite = (value, onChange, onSubmit, placeholder, cta) => (
    <form className="fort-write" onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(value); }}>
      <input
        autoFocus
        className="fort-write__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Tu respuesta"
        autoComplete="off" autoCorrect="off" spellCheck="false"
      />
      <GameButton type="submit" variant="primary" disabled={!value.trim()}>{cta}</GameButton>
    </form>
  );

  return (
    <div className="fort-game gk-shell gk-theme-dark" ref={rootRef} style={SCOPE_STYLE}>
      {/* ---------- HUD superior ---------- */}
      <div className="fort-hud">
        <div className="fort-hud__stats">
          <HudStat icon={Heart} tone="lives" value={hud.lives} label="Vidas" />
          {game.fortShieldMax > 0 && <HudStat icon={Shield} tone="shield" value={hud.shield} label="Escudo" title="Escudo de la muralla externa" />}
          {hud.relics > 0 && (
            <HudStat
              icon={Gem}
              tone="relic"
              value={hud.relics}
              label="Reliquias"
              title={game.relics.map((id) => `${RELICS[id].name}: ${RELICS[id].desc}`).join('\n')}
            />
          )}
          <HudStat icon={Coins} tone="coins" value={hud.coins} label="Monedas" />
          <HudStat icon={Waves} tone={hud.endless ? 'bad' : 'progress'} value={levelValue} label={levelTag} />
          <HudStat icon={Star} tone="score" value={hud.score.toLocaleString('es-ES')} label="Puntos" />
          {streak > 1 && <HudStat icon={Flame} tone="streak" value={`×${streak}`} label="Racha" />}
        </div>
        <div className="fort-hud__tools">
          <HudStat icon={GraduationCap} tone="good" value={`${a.correct}/${a.total}`} label="Aciertos" title="Respuestas acertadas / respondidas" />
          {phase === 'run' && (
            <GameButton
              variant={speed === 2 ? 'warning' : 'soft'}
              size="sm"
              icon={FastForward}
              className="fort-speed"
              onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
              title="Velocidad x2"
            >
              ×{speed}
            </GameButton>
          )}
          {(phase === 'build' || phase === 'run') && (
            <button
              type="button"
              className={`gk-iconbtn fort-tool ${nextUp && hud.coins >= nextUp.cost ? 'fort-glow' : ''} ${fortOpen ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedTowerId(null);
                setPlacingType(null);
                setAimingAbility(null);
                setMovingTowerId(null);
                setGfxOpen(false);
                setFortOpen((o) => !o);
              }}
              title="Mejoras de la fortaleza"
              aria-label="Mejoras de la fortaleza"
            >
              <Castle size={18} />
            </button>
          )}
          {phase === 'run' && !isExam && (
            <button type="button" className="gk-iconbtn fort-tool" onClick={() => { settleMiniOverlay(); setOverlay({ type: 'quit' }); }} title="Terminar partida" aria-label="Terminar partida"><Flag size={18} /></button>
          )}
          {phase !== 'ended' && (
            <button type="button" className="gk-iconbtn fort-tool" onClick={() => { settleMiniOverlay(); setOverlay({ type: 'exit' }); }} title="Volver a la selección de modo" aria-label="Volver a la selección de modo"><LogOut size={18} /></button>
          )}
          <button
            type="button"
            className={`gk-iconbtn fort-tool ${gfxOpen ? 'is-active' : ''}`}
            onClick={() => { setFortOpen(false); setGfxOpen((o) => !o); }}
            title="Calidad gráfica"
            aria-label="Calidad gráfica"
          >
            <Settings2 size={18} />
          </button>
          <button type="button" className="gk-iconbtn fort-tool fort-hide-sm" onClick={toggleFullscreen} title="Pantalla completa" aria-label="Pantalla completa"><Maximize2 size={18} /></button>
          <button type="button" className="gk-iconbtn fort-tool" onClick={toggleSound} title="Sonido" aria-label="Sonido">
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* ---------- escena 3D ---------- */}
      <div
        ref={mountRef}
        className={`fort-3d ${placingType || aimingAbility ? 'targeting' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {/* viñeta cinematográfica (CSS puro: coste cero) */}
        <div className="fort-vignette" />

        {/* ---------- panel de calidad gráfica ---------- */}
        <AnimatePresence>
          {gfxOpen && (
            <motion.div className="fort-gfxpanel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="fort-gfxpanel__title"><span className="fort-medal fort-medal--sm"><Settings2 size={14} /></span> Calidad gráfica</div>
              <Segmented size="sm" options={qualityOptions} value={gfxPref} onChange={changeQuality} />
              <p className="fort-gfxpanel__note">
                Nivel activo: <strong>{QUALITY_LABELS[gfxTier]}</strong> · se aplica al instante, la partida no se pierde.
                {gfxPref === 'auto' && ' En Auto, si el equipo va justo se baja solo.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* aviso del governor de FPS */}
        <AnimatePresence>
          {gfxToast && (
            <motion.div className="fort-toast" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="fort-medal fort-medal--sm fort-medal--gold"><Settings2 size={14} /></span> {gfxToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- panel de quiz ---------- */}
        <AnimatePresence>
          {phase === 'quiz' && quiz && (
            <motion.div className="fort-dlg fort-dlg--quiz" role="dialog" aria-label="Pregunta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="fort-dlg__head">
                <span className="fort-medal"><ScrollText size={20} /></span>
                <div className="fort-dlg__titles">
                  <strong>Pregunta {quiz.qNum} de {PREP_QUESTIONS}</strong>
                  <span>Gana monedas y energía antes de la batalla</span>
                </div>
                {quiz.timeLeft != null && <TimerChip left={quiz.timeLeft} urgent={quiz.timeLeft <= 10} />}
              </div>
              {quiz.timeLeft != null && !quiz.feedback && <ProgressBar value={quiz.timeLeft} max={QUIZ_SECONDS_EXAM} tone={quiz.timeLeft <= 10 ? 'bad' : 'accent'} />}
              <p className="fort-dlg__text">{quiz.question.definicion}</p>

              {quiz.feedback ? (
                <Feedback ok={quiz.feedback === 'correct'}>
                  {quiz.feedback === 'correct'
                    ? <><strong>¡Correcto!</strong> <Reward coins={quiz.reward} energy={25} />{streak > 1 ? <span className="fort-fb__note">Racha ×{streak}</span> : null}</>
                    : <><strong>Era:</strong> {quiz.question.solucion}</>}
                </Feedback>
              ) : isExam && quiz.question.qtype === 'write' ? (
                renderWrite(quiz.input, (v) => setQuiz((p) => ({ ...p, input: v })), answerQuiz, 'Escribe la respuesta…', 'Responder')
              ) : (
                renderOptions(quiz.question.options, answerQuiz)
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Desafío Relámpago ---------- */}
        <AnimatePresence>
          {mini && (
            <motion.div className="fort-dlg fort-dlg--mini" role="dialog" aria-label="Desafío Relámpago" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              {mini.stage === 'offer' ? (
                <>
                  <div className="fort-dlg__hero">
                    <span className="fort-medal fort-medal--lg"><Zap size={30} /></span>
                    <strong className="fort-dlg__bigtitle">¡Desafío Relámpago!</strong>
                  </div>
                  <p className="fort-dlg__text">
                    Encadena aciertos: cada respuesta correcta vale más que la anterior
                    ({MINIGAME_BASE_POINTS}, {MINIGAME_BASE_POINTS * 2}, {MINIGAME_BASE_POINTS * 3}… puntos
                    y {MINIGAME_BASE_COINS}, {MINIGAME_BASE_COINS * 2}, {MINIGAME_BASE_COINS * 3}… monedas),
                    pero las preguntas se vuelven más difíciles y el tiempo se acorta. ¡La cadena dura hasta que falles!
                  </p>
                  <div className="fort-dlg__actions">
                    <GameButton variant="soft" onClick={endMini}>Ahora no</GameButton>
                    <GameButton variant="warning" icon={Zap} onClick={startMini}>¡Acepto!</GameButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="fort-dlg__head">
                    <span className="fort-medal"><Zap size={20} /></span>
                    <div className="fort-dlg__titles">
                      <strong>Cadena ×{mini.step}</strong>
                      <span className="fort-chain">{mini.total.toLocaleString('es-ES')} pts · {mini.totalCoins} <Coin /></span>
                    </div>
                    {!mini.feedback && <TimerChip left={mini.timeLeft} urgent={mini.timeLeft <= 3} />}
                  </div>
                  {!mini.feedback && <ProgressBar value={mini.timeLeft} max={miniTimeFor(mini.step)} tone={mini.timeLeft <= 3 ? 'bad' : 'warn'} />}
                  <p className="fort-dlg__text">{mini.question.definicion}</p>
                  {mini.feedback ? (
                    <Feedback ok={mini.feedback === 'correct'}>
                      {mini.feedback === 'correct'
                        ? <><strong>+{mini.reward} puntos</strong> <Reward coins={mini.rewardCoins} /> <span className="fort-fb__note">La siguiente vale {MINIGAME_BASE_POINTS * (mini.step + 1)} pts y {MINIGAME_BASE_COINS * (mini.step + 1)} <Coin /></span></>
                        : <><strong>Cadena rota.</strong> Era: <strong>{mini.question.solucion}</strong> <span className="fort-fb__note">Te llevas {mini.total.toLocaleString('es-ES')} puntos y {mini.totalCoins} <Coin /></span></>}
                    </Feedback>
                  ) : (
                    renderOptions(mini.question.options, answerMini)
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal clasificación ---------- */}
        <AnimatePresence>
          {overlay?.type === 'classify' && (
            <motion.div className="fort-dlg fort-dlg--small fort-dlg--classify" role="dialog" aria-label="Disparo de precisión" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button type="button" className="gk-iconbtn fort-dlg__close" onClick={() => setOverlay(null)} aria-label="Cerrar"><X size={16} /></button>
              <span className="fort-medal fort-medal--gold"><Crosshair size={20} /></span>
              <div className="fort-word">«{overlay.word}»</div>
              <div className="fort-dlg__ask">¿A qué categoría pertenece?</div>
              <div className="fort-cats">
                {game.categories.map((cat, i) => (
                  <button type="button" key={cat.name} className="fort-cat" style={{ '--cat': cat.color }} onClick={() => answerClassify(i)}>
                    <span className="fort-cat__dot" aria-hidden="true" />{cat.name}
                  </button>
                ))}
              </div>
              <div className="fort-dlg__hint"><Check size={13} /> crítico + energía · <X size={13} /> torres atascadas 3 s</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal jefe ---------- */}
        <AnimatePresence>
          {overlay?.type === 'boss' && (
            <motion.div className="fort-dlg fort-dlg--boss" role="dialog" aria-label="Jefe" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="fort-dlg__head">
                <span className="fort-medal fort-medal--gold"><Crown size={20} /></span>
                <div className="fort-dlg__titles">
                  <strong>¡Jefe a la vista!</strong>
                  <span>Acierta a tiempo y perderá el 70% de su vida</span>
                </div>
                {!overlay.feedback && <TimerChip left={overlay.timeLeft} urgent={overlay.timeLeft <= 8} />}
              </div>
              {!overlay.feedback && <ProgressBar value={overlay.timeLeft} max={BOSS_SECONDS} tone={overlay.timeLeft <= 8 ? 'bad' : 'warn'} />}
              <p className="fort-dlg__text">{overlay.question.definicion}</p>
              {overlay.feedback ? (
                <Feedback ok={overlay.feedback === 'correct'}>
                  {overlay.feedback === 'correct'
                    ? <><strong>¡Golpe de sabiduría!</strong> El jefe pierde el 70% de su vida.</>
                    : <><strong>El jefe se enfurece.</strong> Era: <strong>{overlay.question.solucion}</strong></>}
                </Feedback>
              ) : isExam && overlay.question.qtype === 'write' ? (
                renderWrite(overlay.input, (v) => setOverlay((p) => ({ ...p, input: v })), answerBoss, 'Respuesta para debilitarlo…', '¡Atacar!')
              ) : (
                renderOptions(overlay.question.options, answerBoss)
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- pregunta del Oráculo (exprés, tipo test) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'oracle' && (
            <motion.div className="fort-dlg fort-dlg--oracle" role="dialog" aria-label="Pregunta sorpresa" initial={{ opacity: 0, y: -24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-dlg__head">
                <span className="fort-medal"><Sparkles size={20} /></span>
                <div className="fort-dlg__titles">
                  <strong>¡Pregunta sorpresa!</strong>
                  <span>Monedas y energía si aciertas</span>
                </div>
                {!overlay.feedback && <TimerChip left={overlay.timeLeft} urgent={overlay.timeLeft <= 4} />}
              </div>
              {!overlay.feedback && <ProgressBar value={overlay.timeLeft} max={PERIODIC_SECONDS} tone={overlay.timeLeft <= 4 ? 'bad' : 'accent'} />}
              <p className="fort-dlg__text">{overlay.question.definicion}</p>
              {overlay.feedback ? (
                <Feedback ok={overlay.feedback === 'correct'}>
                  {overlay.feedback === 'correct'
                    ? <><strong>¡Correcto!</strong> <Reward coins={overlay.reward} energy={25} /></>
                    : <><strong>Era:</strong> {overlay.question.solucion}</>}
                </Feedback>
              ) : isExam && overlay.question.qtype === 'write' ? (
                renderWrite(overlay.input, (v) => setOverlay((p) => ({ ...p, input: v })), answerOracle, 'Escribe la respuesta…', 'Responder')
              ) : (
                renderOptions(overlay.question.options, answerOracle)
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal elegir categoría al construir ---------- */}
        <AnimatePresence>
          {overlay?.type === 'catpick' && (
            <motion.div className="fort-dlg fort-dlg--small" role="dialog" aria-label="Categoría de la torre" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button type="button" className="gk-iconbtn fort-dlg__close" onClick={() => setOverlay(null)} aria-label="Cerrar"><X size={16} /></button>
              <span className="fort-tile"><FortIcon id={overlay.towerType} size={40} /></span>
              <div className="fort-dlg__ask fort-dlg__ask--big">¿Qué categoría vigilará esta torre?</div>
              <div className="fort-cats">
                {game.categories.map((cat, i) => (
                  <button type="button" key={cat.name} className="fort-cat" style={{ '--cat': cat.color }} onClick={() => pickCategoryAndPlace(i)}>
                    <span className="fort-cat__dot" aria-hidden="true" />{cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* velo tras las confirmaciones de salir/terminar (solo presentación) */}
        <AnimatePresence>
          {(overlay?.type === 'quit' || overlay?.type === 'exit') && (
            <motion.div className="fort-scrim" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>

        {/* ---------- modal confirmar rendición (práctica) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'quit' && (
            <motion.div className="fort-dlg fort-dlg--small fort-dlg--confirm" role="dialog" aria-label="Terminar partida" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <span className="fort-medal fort-medal--lg"><Flag size={26} /></span>
              <div className="fort-dlg__ask fort-dlg__ask--big">¿Terminar la partida aquí?</div>
              <div className="fort-dlg__hint">Se guardarán tus puntos y tu progreso.</div>
              <div className="fort-dlg__actions">
                <GameButton variant="soft" onClick={() => setOverlay(null)}>Seguir jugando</GameButton>
                <GameButton variant="danger" icon={Flag} onClick={() => endGame('finished')}>Terminar</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal volver a la selección de modo ---------- */}
        <AnimatePresence>
          {overlay?.type === 'exit' && (
            <motion.div className="fort-dlg fort-dlg--small fort-dlg--confirm" role="dialog" aria-label="Salir" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <span className="fort-medal fort-medal--lg fort-medal--red"><DoorOpen size={26} /></span>
              <div className="fort-dlg__ask fort-dlg__ask--big">¿Volver a la selección de modo?</div>
              <div className="fort-dlg__hint">
                Se perderá el progreso de la partida actual.
                {isExam && ' El intento quedará registrado con tus aciertos hasta ahora.'}
              </div>
              <div className="fort-dlg__actions">
                <GameButton variant="soft" onClick={() => setOverlay(null)}>Seguir jugando</GameButton>
                <GameButton variant="danger" icon={LogOut} onClick={() => onExitRef.current?.()}>Salir</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- reliquia: elegir 1 de 3 (pausa/cámara lenta) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'relic' && (
            <motion.div className="fort-dlg fort-dlg--relic" role="dialog" aria-label="Reliquia" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-dlg__hero">
                <span className="fort-medal fort-medal--lg"><Gem size={28} /></span>
                <strong className="fort-dlg__bigtitle">¡Reliquia del nivel {hud.level}!</strong>
                <span className="fort-dlg__sub">Elige un poder permanente para esta partida</span>
              </div>
              <div className="fort-relics">
                {overlay.options.map((id) => {
                  const RelicIcon = RELIC_ICONS[id];
                  return (
                    <button type="button" key={id} className="fort-relic" onClick={() => pickRelic(id)}>
                      <span className="fort-relic__ico"><RelicIcon size={26} /></span>
                      <strong>{RELICS[id].name}</strong>
                      <span className="fort-relic__desc">{RELICS[id].desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- victoria del examen: terminar o asedio infinito ---------- */}
        <AnimatePresence>
          {overlay?.type === 'victory' && (
            <motion.div className="fort-dlg fort-dlg--victory" role="dialog" aria-label="Victoria" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-dlg__hero">
                <span className="fort-medal fort-medal--lg fort-medal--gold"><Trophy size={30} /></span>
                <strong className="fort-dlg__bigtitle">¡Fortaleza defendida!</strong>
              </div>
              <div className="fort-sealed">
                <span className="fort-sealed__label">Nota sellada</span>
                <span className="fort-sealed__value">{sealedNota?.replace('.', ',')}<small>/10</small></span>
              </div>
              <p className="fort-dlg__text">
                Puedes terminar aquí o lanzarte al <strong>Asedio infinito</strong>: enemigos cada vez más brutales
                y puntos multiplicados para el ranking. Pase lo que pase, la nota ya no cambia.
              </p>
              <div className="fort-dlg__actions">
                <GameButton variant="soft" icon={Flag} onClick={() => endGame('victory')}>Terminar con victoria</GameButton>
                <GameButton variant="danger" icon={Swords} onClick={continueEndless}>¡Asedio infinito!</GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Mercader Errante: pregunta difícil por monedas ---------- */}
        <AnimatePresence>
          {overlay?.type === 'merchant' && (
            <motion.div className="fort-dlg fort-dlg--merchant" role="dialog" aria-label="Mercader Errante" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-dlg__head">
                <span className="fort-medal"><Sailboat size={20} /></span>
                <div className="fort-dlg__titles">
                  <strong>El Mercader Errante</strong>
                  <span>Una pregunta difícil a cambio de monedas</span>
                </div>
                {!overlay.feedback && <TimerChip left={overlay.timeLeft} urgent={overlay.timeLeft <= 5} />}
              </div>
              {!overlay.feedback && <ProgressBar value={overlay.timeLeft} max={PERIODIC_SECONDS} tone={overlay.timeLeft <= 5 ? 'bad' : 'accent'} />}
              {overlay.stage === 'offer' ? (
                <>
                  <p className="fort-dlg__text fort-dlg__text--quote">
                    «Llevo una <strong>bolsa de monedas</strong> para quien responda mi pregunta,
                    grumete. Pero aviso: una vez la oigas, no hay vuelta atrás. ¿Cerramos el trato?»
                  </p>
                  <div className="fort-dlg__actions">
                    <GameButton variant="soft" onClick={declineMerchant}>Dejarlo zarpar</GameButton>
                    <GameButton variant="success" icon={Check} onClick={acceptMerchant}>¡Acepto el trato!</GameButton>
                  </div>
                </>
              ) : (
                <>
                  <p className="fort-dlg__text">{overlay.question.definicion}</p>
                  {overlay.feedback ? (
                    <Feedback ok={overlay.feedback === 'correct'}>
                      {overlay.feedback === 'correct'
                        ? <><strong>¡Trato cerrado!</strong> <Reward coins={overlay.reward} /></>
                        : <><strong>Era:</strong> {overlay.question.solucion}. El barco zarpa sin trato.</>}
                    </Feedback>
                  ) : (
                    renderOptions(overlay.question.options, answerMerchant)
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Pozo de los Deseos: apuesta + pregunta difícil ---------- */}
        <AnimatePresence>
          {overlay?.type === 'well' && (
            <motion.div className="fort-dlg fort-dlg--well" role="dialog" aria-label="Pozo de los Deseos" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-dlg__head">
                <span className="fort-medal"><Droplets size={20} /></span>
                <div className="fort-dlg__titles">
                  <strong>El Pozo de los Deseos</strong>
                  <span>Acierta y te devuelve ×{String(WELL_MULT).replace('.', ',')}</span>
                </div>
                {overlay.stage === 'question' && !overlay.feedback && <TimerChip left={overlay.timeLeft} urgent={overlay.timeLeft <= 5} />}
              </div>
              {overlay.stage === 'question' && !overlay.feedback && <ProgressBar value={overlay.timeLeft} max={PERIODIC_SECONDS} tone={overlay.timeLeft <= 5 ? 'bad' : 'accent'} />}
              {overlay.stage === 'bet' ? (
                <>
                  <p className="fort-dlg__text">
                    Lanza monedas al pozo y responde una pregunta difícil: si aciertas
                    el pozo te devuelve <strong>×{WELL_MULT}</strong>; si fallas, se hunden para siempre.
                  </p>
                  <div className="fort-bets">
                    {WELL_BETS.map((b) => (
                      <button type="button" key={b} className="fort-bet" disabled={hud.coins < b} onClick={() => placeWellBet(b)}>
                        <span className="fort-bet__stack" aria-hidden="true"><Coin size={20} /><Coin size={20} /><Coin size={20} /></span>
                        <strong>{b} <Coin /></strong>
                        <span className="fort-bet__win">acierto: +{Math.round(b * WELL_MULT)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="fort-dlg__actions">
                    <GameButton variant="ghost" onClick={() => { wellCancel(gameRef.current); setOverlay(null); }}>Ahora no</GameButton>
                  </div>
                </>
              ) : (
                <>
                  <p className="fort-dlg__text">{overlay.question.definicion}</p>
                  {overlay.feedback ? (
                    <Feedback ok={overlay.feedback === 'correct'}>
                      {overlay.feedback === 'correct'
                        ? <><strong>¡El pozo te lo devuelve con creces!</strong> <Reward coins={overlay.payout} /></>
                        : <><strong>Era:</strong> {overlay.question.solucion}. Las monedas se hunden… <span className="fort-reward fort-reward--loss">−{overlay.bet} <Coin /></span></>}
                    </Feedback>
                  ) : (
                    renderOptions(overlay.question.options, answerWell)
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pila inferior (flex): paneles de mejora/torre encima de la barra de
            preparación. Nunca se solapan entre sí. */}
        <div className="fort-bottomstack">
          {/* ---------- panel torre seleccionada ---------- */}
          <AnimatePresence>
            {selectedTower && (
              <motion.div className="fort-dock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <span className="fort-tile fort-tile--sm"><FortIcon id={selectedTower.type} size={34} /></span>
                <span className="fort-dock__info">
                  <strong>{TOWER_TYPES[selectedTower.type].name}</strong>
                  <span className="fort-dock__meta">
                    {selectedTower.catIdx != null && (
                      <span className="fort-catchip" style={{ '--cat': game.categories[selectedTower.catIdx].color }}>
                        {game.categories[selectedTower.catIdx].name}
                      </span>
                    )}
                    <span className="fort-pips" aria-label={`Nivel ${selectedTower.level} de ${MAX_TOWER_LEVEL}`}>
                      {Array.from({ length: MAX_TOWER_LEVEL }).map((_, i) => (
                        <i key={i} className={i < selectedTower.level ? 'is-on' : ''} />
                      ))}
                    </span>
                  </span>
                </span>
                <span className="fort-dock__actions">
                  {TOWER_TYPES[selectedTower.type].kind === 'oracle' ? null : selectedTower.level < MAX_TOWER_LEVEL ? (
                    <GameButton
                      variant="success"
                      size="sm"
                      icon={ArrowUpCircle}
                      disabled={hud.coins < upgradeCost(selectedTower.type, selectedTower.level)}
                      onClick={doUpgrade}
                    >
                      Mejorar · {upgradeCost(selectedTower.type, selectedTower.level)} <Coin />
                    </GameButton>
                  ) : (
                    <span className="fort-chip fort-chip--gold"><Star size={13} /> Nivel máximo</span>
                  )}
                  <GameButton variant="soft" size="sm" icon={Move} disabled={hud.coins < MOVE_COST} onClick={startMove}>
                    Mover · {MOVE_COST} <Coin />
                  </GameButton>
                  <GameButton variant="danger" size="sm" icon={Trash2} onClick={doSell}>
                    Vender · +{sellValue(selectedTower)} <Coin />
                  </GameButton>
                </span>
                <button type="button" className="gk-iconbtn fort-dock__close" onClick={() => setSelectedTowerId(null)} aria-label="Cerrar"><X size={16} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- panel de mejoras de la fortaleza ---------- */}
          <AnimatePresence>
            {fortOpen && !selectedTower && (
              <motion.div className="fort-dock fort-dock--fort" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <span className="fort-tile fort-tile--sm fort-tile--castle"><Castle size={26} /></span>
                <span className="fort-dock__info">
                  <strong>La Biblioteca</strong>
                  <span className="fort-dock__meta">
                    {game.fortUpgrades.map((id) => {
                      const up = FORT_UPGRADES.find((u) => u.id === id);
                      return <span key={id} className="fort-dock__owned" title={up.name}><FortIcon id={up.id} size={20} /></span>;
                    })}
                    {game.fortShieldMax > 0 && <span className="fort-chip"><Shield size={12} /> {hud.shield}/{game.fortShieldMax}</span>}
                    {game.fortUpgrades.length === 0 && <span className="fort-dock__muted">Sin mejoras todavía</span>}
                  </span>
                </span>
                {nextUp ? (
                  <>
                    <span className="fort-dock__next">
                      <FortIcon id={nextUp.id} size={26} />
                      <span><strong>{nextUp.name}:</strong> {nextUp.desc}</span>
                    </span>
                    <span className="fort-dock__actions">
                      <GameButton variant="success" size="sm" icon={ArrowUpCircle} disabled={hud.coins < nextUp.cost} onClick={doFortUpgrade}>
                        Construir · {nextUp.cost} <Coin />
                      </GameButton>
                    </span>
                  </>
                ) : (
                  <span className="fort-chip fort-chip--gold"><Star size={13} /> Fortaleza al máximo</span>
                )}
                <button type="button" className="gk-iconbtn fort-dock__close" onClick={() => setFortOpen(false)} aria-label="Cerrar"><X size={16} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- fase de preparación: construir y arrancar ---------- */}
          {phase === 'build' && (
            <motion.div className="fort-buildbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="fort-medal fort-medal--lg fort-hide-sm"><Hammer size={26} /></span>
              <div className="fort-buildbar__text">
                <strong>Prepara tus defensas</strong>
                <span>
                  Los enemigos saldrán sin parar y cada vez más rápido, y al subir la amenaza despertarán nuevas fortalezas
                  enemigas (hasta 3 frentes). {isExam ? `Aguanta hasta el nivel ${EXAM_VICTORY_LEVEL}.` : '¿Hasta qué nivel llegarás?'}
                </span>
                <span className="fort-buildbar__chips">
                  <span className="fort-chip"><CloudSun size={13} /> {ambience.name}</span>
                  {isExam && <span className="fort-chip fort-chip--exam"><GraduationCap size={13} /> Meta: nivel {EXAM_VICTORY_LEVEL}</span>}
                </span>
              </div>
              <GameButton variant="success" size="lg" icon={Play} onClick={startDefense}>¡Defender la Fortaleza!</GameButton>
            </motion.div>
          )}

        </div>

        {/* ---------- aviso de colocación/apuntado/mover ---------- */}
        {(placingType || aimingAbility || movingTowerId) && (
          <div className="fort-hint">
            <span className="fort-medal fort-medal--sm fort-medal--gold">
              {placingType ? <Hammer size={14} /> : aimingAbility ? <Crosshair size={14} /> : <Move size={14} />}
            </span>
            {placingType
              ? `${TOWER_TYPES[placingType].desc} — toca una celda libre para construir`
              : aimingAbility
                ? `${ABILITIES[aimingAbility].desc} — toca el campo para lanzarla`
                : <>Recolocando construcción — toca una celda libre ({MOVE_COST} <Coin />)</>}
          </div>
        )}
      </div>

      {/* ---------- barra inferior: torres + habilidades + energía ---------- */}
      {phase !== 'ended' && (
        <div className="fort-bottombar">
          <div className="fort-palette">
            {Object.values(TOWER_TYPES).map((t) => {
              const sanctLocked = t.id === 'santuario' && a.correct < SANCT_UNLOCK_CORRECT;
              return (
                <button
                  type="button"
                  key={t.id}
                  className={`fort-slot ${placingType === t.id ? 'is-selected' : ''} ${sanctLocked ? 'is-locked' : ''}`}
                  disabled={sanctLocked || hud.coins < t.cost || (t.unique && game.towers.some((tw) => tw.type === t.id))}
                  onClick={() => {
                    setSelectedTowerId(null);
                    setAimingAbility(null);
                    setMovingTowerId(null);
                    setFortOpen(false);
                    setPlacingType((p) => (p === t.id ? null : t.id));
                  }}
                  title={sanctLocked ? `Se desbloquea con ${SANCT_UNLOCK_CORRECT} aciertos (llevas ${a.correct})` : t.desc}
                >
                  <span className="fort-slot__face">
                    <span className="fort-slot__icon">{sanctLocked ? <Lock size={24} /> : <FortIcon id={t.id} size={40} />}</span>
                    <span className="fort-slot__name">{t.name}</span>
                    <span className="fort-slot__cost">
                      {sanctLocked ? <>{a.correct}/{SANCT_UNLOCK_CORRECT} <GraduationCap size={11} /></> : <>{t.cost} <Coin size={12} /></>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="fort-abilities">
            <div className="fort-energy" title="Energía: se carga acertando preguntas y clasificaciones">
              <span className="fort-energy__head"><Zap size={14} /> Energía <strong>{hud.energy}</strong></span>
              <ProgressBar value={hud.energy} max={ENERGY_MAX} tone="warn" label="Energía" />
            </div>
            <div className="fort-ability-btns">
              {Object.values(ABILITIES).map((ab) => (
                <button
                  type="button"
                  key={ab.id}
                  className={`fort-slot fort-slot--ability ${aimingAbility === ab.id ? 'is-selected' : ''}`}
                  disabled={phase !== 'run' || hud.energy < ab.cost || !hud.abilityReady}
                  onClick={() => toggleAbility(ab.id)}
                  title={ab.desc}
                >
                  <span className="fort-slot__face">
                    <span className="fort-slot__icon"><FortIcon id={ab.id} size={40} /></span>
                    <span className="fort-slot__name">{ab.name}</span>
                    <span className="fort-slot__cost fort-slot__cost--energy">{ab.cost} <Zap size={11} /></span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- piezas de presentación propias de la app ----------

// Moneda dibujada (sin gradientes con id: se repite muchas veces en pantalla)
function Coin({ size = 14 }) {
  return (
    <svg className="fort-coin" viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <circle cx="10" cy="10.6" r="8.6" fill="#b45309" />
      <circle cx="10" cy="9.6" r="8.6" fill="#f59e0b" />
      <circle cx="10" cy="9.6" r="6.2" fill="#fbbf24" stroke="#d97706" strokeWidth="1.1" />
      <path d="M7.6 7.4h4.8M10 7.4v5" stroke="#b45309" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="7.2" cy="5.6" rx="2.4" ry="1.3" fill="#fef3c7" opacity=".8" />
    </svg>
  );
}

// Recompensa (+monedas · +energía) con iconos propios
function Reward({ coins, energy }) {
  return (
    <span className="fort-reward">
      {coins != null && <span>+{coins} <Coin /></span>}
      {energy != null && <span className="fort-reward__energy">+{energy} <Zap size={13} /></span>}
    </span>
  );
}

// Cronómetro del diálogo
function TimerChip({ left, urgent }) {
  return (
    <span className={`fort-timer ${urgent ? 'is-urgent' : ''}`}>
      <Timer size={14} /> {left}s
    </span>
  );
}

// Retroalimentación tras responder (acierto / fallo)
function Feedback({ ok, children }) {
  return (
    <div className={`fort-fb ${ok ? 'is-ok' : 'is-ko'}`} role="status">
      <span className="fort-fb__badge">{ok ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}</span>
      <div className="fort-fb__text">{children}</div>
    </div>
  );
}

export default FortalezaGame;
