// src/apps/la-fortaleza/FortalezaGame.jsx
// Componente de partida en 3D: escena three.js a pantalla completa + HUD +
// fases (quiz → construcción → oleada) + habilidades activas con energía.
// Recibe el contenido ya preparado por LaFortaleza.jsx y devuelve el resultado
// por onEnd(). onProgress() emite eventos de progreso (preparado para el duelo).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Coins, Star, Flame, Play, Volume2, VolumeX, Maximize2,
  FastForward, Flag, X, ArrowUpCircle, Trash2, Waves, Timer, Zap, Move,
} from 'lucide-react';
import {
  createGame, planNextWave, startWave, stepGame, placeTower, upgradeTower,
  sellTower, moveTower, classifyEnemy, bossStrike, bossEnrage, canBuildAt, rewardCorrectAnswer,
  castAbility, ABILITIES, ENERGY_MAX, MOVE_COST,
  TOWER_TYPES, MAX_TOWER_LEVEL, upgradeCost, sellValue, EXAM_WAVES,
} from './engine';
import { createScene3D } from './render3d';

const QUESTIONS_PER_WAVE = 2;
const QUIZ_SECONDS_EXAM = 30;
const BOSS_SECONDS = 25;
const DRAG_THRESHOLD = 8; // px: por debajo es un toque, por encima orbita la cámara

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

const FortalezaGame = ({ seed, mode, categories, questions, bossQuestions, sounds, onEnd, onProgress }) => {
  const isExam = mode === 'exam';

  // --- motor (uno por montaje, determinista por seed) ---
  const gameRef = useRef(null);
  if (!gameRef.current) {
    gameRef.current = createGame({ seed, mode, categories });
    planNextWave(gameRef.current);
  }
  const game = gameRef.current;

  // --- estado React (HUD y UI) ---
  const [phase, setPhase] = useState('quiz'); // quiz | build | wave | ended
  const [hud, setHud] = useState({ coins: game.coins, lives: game.lives, wave: game.wave, score: game.score, energy: game.energy, abilityReady: true });
  const [streak, setStreak] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [overlay, setOverlay] = useState(null); // classify | boss | catpick | quit
  const [placingType, setPlacingType] = useState(null);
  const [aimingAbility, setAimingAbility] = useState(null);
  const [movingTowerId, setMovingTowerId] = useState(null);
  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [forecast, setForecast] = useState(game.nextWave);

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
  const academicRef = useRef({
    correct: 0, total: 0,
    questions: { c: 0, t: 0 }, classify: { c: 0, t: 0 }, boss: { c: 0, t: 0 },
  });
  phaseRef.current = phase;
  overlayRef.current = overlay;
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
  const soundsRef = useRef(sounds);

  // --- fin de partida (una sola vez) ---
  const endGame = useCallback((outcome) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const g = gameRef.current;
    setPhase('ended');
    onEndRef.current?.({
      outcome,
      score: g.score,
      wave: g.wave,
      lives: g.lives,
      academic: { ...academicRef.current },
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
        wave: g.wave,
        lives: g.lives,
        academic: { ...academicRef.current },
        durationSeconds: Math.round(g.time),
        stats: { ...g.stats },
      });
    }
  }, []);

  // --- contabilidad académica ---
  const tally = useCallback((kind, correct) => {
    const a = academicRef.current;
    a.total++; a[kind].t++;
    if (correct) { a.correct++; a[kind].c++; }
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
        if (prev.qNum >= QUESTIONS_PER_WAVE) {
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

  // --- oráculo: pregunta exprés en plena oleada (siempre tipo test) ---
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
          setOverlay({ type: 'boss', enemyId: ev.enemy.id, question: q, input: '', feedback: null, timeLeft: BOSS_SECONDS });
          break;
        }
        case 'oracle':
          // si hay otro modal abierto, el oráculo pierde su turno
          if (!overlayRef.current) {
            snd.coin();
            setOverlay({ type: 'oracle', question: nextQuestion(), feedback: null, reward: 0, timeLeft: 12 });
          }
          break;
        case 'wave_end':
          snd.waveClear();
          setForecast(planNextWave(gameRef.current));
          setAimingAbility(null);
          onProgressRef.current?.({ type: 'wave_complete', wave: ev.wave, score: gameRef.current.score });
          openQuiz();
          break;
        case 'victory':
          snd.victory();
          endGame('victory');
          break;
        case 'defeat':
          snd.defeat();
          setOverlay(null);
          endGame('defeat');
          break;
        default: break;
      }
    }
  }, [bossQuestions, openQuiz, endGame, nextQuestion]);

  // --- escena 3D + bucle principal ---
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = createScene3D(mount, gameRef.current);
    sceneRef.current = scene;
    const ro = new ResizeObserver(() => scene.resize());
    ro.observe(mount);

    let raf = 0;
    let last = performance.now();
    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const g = gameRef.current;

      // Escala temporal: modal abierto → pausa (práctica) o cámara lenta (examen)
      let scale = speedRef.current;
      const ov = overlayRef.current;
      if (ov && (ov.type === 'classify' || ((ov.type === 'boss' || ov.type === 'oracle') && !ov.feedback))) {
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
        if (prev.coins === g.coins && prev.lives === g.lives && prev.wave === g.wave
          && prev.score === g.score && prev.energy === energy && prev.abilityReady === abilityReady) return prev;
        return { coins: g.coins, lives: g.lives, wave: g.wave, score: g.score, energy, abilityReady };
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
          ? canBuildAt(g, hoverCellRef.current[0], hoverCellRef.current[1]) && g.coins >= placeCost
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
  }, [handleEvents, isExam]);

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

    // 2) Enemigo (disparo de precisión) — solo durante la oleada y sin modal
    if (hit.kind === 'enemy' && phaseRef.current === 'wave' && !overlayRef.current && !placingRef.current) {
      const e = g.enemies.find((en) => en.id === hit.enemyId);
      if (e && e.hp > 0 && !e.classified) {
        setSelectedTowerId(null);
        setOverlay({ type: 'classify', enemyId: e.id, word: e.word });
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
      if (canBuildAt(g, col, row) && g.coins >= type.cost) {
        if (type.needsCategory) {
          setOverlay({ type: 'catpick', col, row, towerType: placingRef.current });
        } else {
          placeTower(g, col, row, placingRef.current);
          soundsRef.current.build();
        }
      }
      return;
    }

    // 5) Selección de torre / deseleccionar
    if (hit.kind === 'tower') setSelectedTowerId(hit.towerId);
    else setSelectedTowerId(null);
  }, []);

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
  const launchWave = useCallback(() => {
    startWave(gameRef.current);
    setForecast(null);
    setPhase('wave');
  }, []);

  const pickCategoryAndPlace = useCallback((catIdx) => {
    const ov = overlayRef.current;
    if (ov?.type !== 'catpick') return;
    placeTower(gameRef.current, ov.col, ov.row, ov.towerType, catIdx);
    soundsRef.current.build();
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

  const toggleSound = useCallback(() => setSoundOn(soundsRef.current.toggle()), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.();
  }, []);

  const toggleAbility = useCallback((id) => {
    setPlacingType(null);
    setSelectedTowerId(null);
    setMovingTowerId(null);
    setAimingAbility((prev) => (prev === id ? null : id));
  }, []);

  // --- derivados ---
  const selectedTower = selectedTowerId ? game.towers.find((t) => t.id === selectedTowerId) : null;
  const waveLabel = isExam ? `${Math.min(hud.wave + (phase === 'wave' ? 0 : 1), EXAM_WAVES)}/${EXAM_WAVES}` : `${hud.wave + (phase === 'wave' ? 0 : 1)}`;
  const a = academicRef.current;

  const forecastByCat = forecast
    ? forecast.entries.reduce((acc, e) => { acc[e.catIdx] = (acc[e.catIdx] || 0) + 1; return acc; }, {})
    : null;

  return (
    <div className="fort-game" ref={rootRef}>
      {/* ---------- HUD superior ---------- */}
      <div className="fort-hud">
        <span className="fort-hud-item lives"><Heart size={16} /> {hud.lives}</span>
        <span className="fort-hud-item coins"><Coins size={16} /> {hud.coins}</span>
        <span className="fort-hud-item wave"><Waves size={16} /> {waveLabel}</span>
        <span className="fort-hud-item score"><Star size={16} /> {hud.score.toLocaleString('es-ES')}</span>
        {streak > 1 && <span className="fort-hud-item streak"><Flame size={16} /> x{streak}</span>}
        <span className="fort-hud-spacer" />
        <span className="fort-hud-academic">🎓 {a.correct}/{a.total}</span>
        {phase === 'wave' && (
          <button className={`fort-hud-btn ${speed === 2 ? 'active' : ''}`} onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))} title="Velocidad x2">
            <FastForward size={16} />{speed === 2 ? ' x2' : ' x1'}
          </button>
        )}
        <button className="fort-hud-btn" onClick={toggleFullscreen} title="Pantalla completa"><Maximize2 size={16} /></button>
        <button className="fort-hud-btn" onClick={toggleSound} title="Sonido">
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
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
        {/* ---------- panel de quiz ---------- */}
        <AnimatePresence>
          {phase === 'quiz' && quiz && (
            <motion.div className="fort-quiz" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="fort-quiz-head">
                <span className="fort-quiz-tag">📜 Pregunta {quiz.qNum}/{QUESTIONS_PER_WAVE} · gana monedas y energía</span>
                {quiz.timeLeft != null && (
                  <span className={`fort-quiz-timer ${quiz.timeLeft <= 10 ? 'urgent' : ''}`}><Timer size={14} /> {quiz.timeLeft}s</span>
                )}
              </div>
              <p className="fort-quiz-def">{quiz.question.definicion}</p>

              {quiz.feedback ? (
                <div className={`fort-quiz-feedback ${quiz.feedback}`}>
                  {quiz.feedback === 'correct'
                    ? <>✅ ¡Correcto! <strong>+{quiz.reward} 🪙 +25 ⚡</strong>{streak > 1 ? ` (racha x${streak})` : ''}</>
                    : <>❌ Era: <strong>{quiz.question.solucion}</strong></>}
                </div>
              ) : isExam && quiz.question.qtype === 'write' ? (
                <form className="fort-quiz-form" onSubmit={(e) => { e.preventDefault(); if (quiz.input.trim()) answerQuiz(quiz.input); }}>
                  <input
                    autoFocus
                    value={quiz.input}
                    onChange={(e) => setQuiz((p) => ({ ...p, input: e.target.value }))}
                    placeholder="Escribe la respuesta..."
                    autoComplete="off" autoCorrect="off" spellCheck="false"
                  />
                  <button type="submit" disabled={!quiz.input.trim()}>Responder</button>
                </form>
              ) : (
                <div className="fort-quiz-options">
                  {quiz.question.options.map((opt) => (
                    <button key={opt} onClick={() => answerQuiz(opt)}>{opt}</button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal clasificación ---------- */}
        <AnimatePresence>
          {overlay?.type === 'classify' && (
            <motion.div className="fort-classify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button className="fort-classify-close" onClick={() => setOverlay(null)}><X size={16} /></button>
              <div className="fort-classify-word">«{overlay.word}»</div>
              <div className="fort-classify-ask">¿A qué categoría pertenece?</div>
              <div className="fort-classify-opts">
                {game.categories.map((cat, i) => (
                  <button key={cat.name} style={{ '--cat': cat.color }} onClick={() => answerClassify(i)}>
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="fort-classify-hint">✅ crítico + energía · ❌ torres atascadas 3s</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal jefe ---------- */}
        <AnimatePresence>
          {overlay?.type === 'boss' && (
            <motion.div className="fort-boss" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="fort-boss-head">
                <span>👑 ¡JEFE A LA VISTA!</span>
                <span className={`fort-quiz-timer ${overlay.timeLeft <= 8 ? 'urgent' : ''}`}><Timer size={14} /> {overlay.timeLeft}s</span>
              </div>
              <p className="fort-quiz-def">{overlay.question.definicion}</p>
              {overlay.feedback ? (
                <div className={`fort-quiz-feedback ${overlay.feedback}`}>
                  {overlay.feedback === 'correct'
                    ? '⚡ ¡Golpe de sabiduría! El jefe pierde el 70% de su vida'
                    : <>😤 El jefe se enfurece. Era: <strong>{overlay.question.solucion}</strong></>}
                </div>
              ) : isExam && overlay.question.qtype === 'write' ? (
                <form className="fort-quiz-form" onSubmit={(e) => { e.preventDefault(); if (overlay.input.trim()) answerBoss(overlay.input); }}>
                  <input
                    autoFocus
                    value={overlay.input}
                    onChange={(e) => setOverlay((p) => ({ ...p, input: e.target.value }))}
                    placeholder="Respuesta para debilitarlo..."
                    autoComplete="off" autoCorrect="off" spellCheck="false"
                  />
                  <button type="submit" disabled={!overlay.input.trim()}>¡Atacar!</button>
                </form>
              ) : (
                <div className="fort-quiz-options">
                  {overlay.question.options.map((opt) => (
                    <button key={opt} onClick={() => answerBoss(opt)}>{opt}</button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- pregunta del Oráculo (exprés, tipo test) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'oracle' && (
            <motion.div className="fort-oracle" initial={{ opacity: 0, y: -24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-boss-head oracle">
                <span>🧿 ¡El Oráculo pregunta!</span>
                <span className={`fort-quiz-timer ${overlay.timeLeft <= 4 ? 'urgent' : ''}`}><Timer size={14} /> {overlay.timeLeft}s</span>
              </div>
              <p className="fort-quiz-def">{overlay.question.definicion}</p>
              {overlay.feedback ? (
                <div className={`fort-quiz-feedback ${overlay.feedback}`}>
                  {overlay.feedback === 'correct'
                    ? <>✅ ¡Correcto! <strong>+{overlay.reward} 🪙 +25 ⚡</strong></>
                    : <>❌ Era: <strong>{overlay.question.solucion}</strong></>}
                </div>
              ) : (
                <div className="fort-quiz-options">
                  {overlay.question.options.map((opt) => (
                    <button key={opt} onClick={() => answerOracle(opt)}>{opt}</button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal elegir categoría al construir ---------- */}
        <AnimatePresence>
          {overlay?.type === 'catpick' && (
            <motion.div className="fort-classify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button className="fort-classify-close" onClick={() => setOverlay(null)}><X size={16} /></button>
              <div className="fort-classify-ask">{TOWER_TYPES[overlay.towerType].emoji} ¿Qué categoría vigilará esta torre?</div>
              <div className="fort-classify-opts">
                {game.categories.map((cat, i) => (
                  <button key={cat.name} style={{ '--cat': cat.color }} onClick={() => pickCategoryAndPlace(i)}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- modal confirmar rendición (práctica) ---------- */}
        <AnimatePresence>
          {overlay?.type === 'quit' && (
            <motion.div className="fort-classify" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="fort-classify-ask">🏳️ ¿Terminar la partida aquí?</div>
              <div className="fort-classify-hint">Se guardarán tus puntos y tu progreso.</div>
              <div className="fort-quit-btns">
                <button className="fort-btn-secondary" onClick={() => setOverlay(null)}>Seguir jugando</button>
                <button className="fort-btn-danger" onClick={() => endGame('finished')}>Terminar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- pronóstico + lanzar oleada ---------- */}
        {phase === 'build' && (
          <motion.div className="fort-buildbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="fort-forecast">
              {forecast && (
                <>
                  <span className="fort-forecast-label">
                    {forecast.isBossWave ? '👑 ' : '🌊 '}Oleada {forecast.wave}:
                  </span>
                  {isExam ? (
                    <span className="fort-forecast-cat">{forecast.entries.length} enemigos {forecast.isBossWave ? '+ JEFE' : ''} · categorías sorpresa</span>
                  ) : (
                    Object.entries(forecastByCat || {}).map(([catIdx, count]) => (
                      <span key={catIdx} className="fort-forecast-cat" style={{ '--cat': game.categories[catIdx].color }}>
                        {count} × {game.categories[catIdx].name}
                      </span>
                    ))
                  )}
                </>
              )}
            </div>
            <div className="fort-buildbar-actions">
              {!isExam && (
                <button className="fort-btn-secondary" onClick={() => setOverlay({ type: 'quit' })}><Flag size={15} /> Terminar</button>
              )}
              <button className="fort-btn-launch" onClick={launchWave}><Play size={17} /> ¡Lanzar oleada!</button>
            </div>
          </motion.div>
        )}

        {/* ---------- panel torre seleccionada ---------- */}
        <AnimatePresence>
          {selectedTower && (
            <motion.div className="fort-towerpanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
              <span className="fort-towerpanel-name">
                {TOWER_TYPES[selectedTower.type].emoji} {TOWER_TYPES[selectedTower.type].name}
                {selectedTower.catIdx != null && (
                  <span className="fort-towerpanel-cat" style={{ '--cat': game.categories[selectedTower.catIdx].color }}>
                    {game.categories[selectedTower.catIdx].name}
                  </span>
                )}
                <span className="fort-towerpanel-lvl">Nv. {selectedTower.level}</span>
              </span>
              {TOWER_TYPES[selectedTower.type].kind === 'oracle' ? null : selectedTower.level < MAX_TOWER_LEVEL ? (
                <button
                  className="fort-btn-upgrade"
                  disabled={hud.coins < upgradeCost(selectedTower.type, selectedTower.level)}
                  onClick={doUpgrade}
                >
                  <ArrowUpCircle size={15} /> Mejorar ({upgradeCost(selectedTower.type, selectedTower.level)} 🪙)
                </button>
              ) : (
                <span className="fort-towerpanel-max">⭐ Nivel máximo</span>
              )}
              <button className="fort-btn-secondary" disabled={hud.coins < MOVE_COST} onClick={startMove}>
                <Move size={15} /> Mover ({MOVE_COST} 🪙)
              </button>
              <button className="fort-btn-danger" onClick={doSell}><Trash2 size={15} /> Vender (+{sellValue(selectedTower)} 🪙)</button>
              <button className="fort-hud-btn" onClick={() => setSelectedTowerId(null)}><X size={15} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- aviso de colocación/apuntado/mover ---------- */}
        {(placingType || aimingAbility || movingTowerId) && (
          <div className="fort-placing-hint">
            {placingType
              ? `${TOWER_TYPES[placingType].desc} — toca una celda libre para construir`
              : aimingAbility
                ? `${ABILITIES[aimingAbility].desc} — toca el campo para lanzarla`
                : `Recolocando construcción — toca una celda libre (${MOVE_COST} 🪙)`}
          </div>
        )}
      </div>

      {/* ---------- barra inferior: torres + habilidades + energía ---------- */}
      {phase !== 'ended' && (
        <div className="fort-bottombar">
          <div className="fort-palette">
            {Object.values(TOWER_TYPES).map((t) => (
              <button
                key={t.id}
                className={`fort-palette-btn ${placingType === t.id ? 'selected' : ''}`}
                disabled={hud.coins < t.cost || (t.unique && game.towers.some((tw) => tw.type === t.id))}
                onClick={() => {
                  setSelectedTowerId(null);
                  setAimingAbility(null);
                  setMovingTowerId(null);
                  setPlacingType((p) => (p === t.id ? null : t.id));
                }}
                title={t.desc}
              >
                <span className="fort-palette-emoji">{t.emoji}</span>
                <span className="fort-palette-name">{t.name}</span>
                <span className="fort-palette-cost">{t.cost} 🪙</span>
              </button>
            ))}
          </div>

          <div className="fort-abilities">
            <div className="fort-energy" title="Energía: se carga acertando preguntas y clasificaciones">
              <Zap size={14} />
              <div className="fort-energy-bar">
                <div className="fort-energy-fill" style={{ width: `${(hud.energy / ENERGY_MAX) * 100}%` }} />
              </div>
              <span className="fort-energy-num">{hud.energy}</span>
            </div>
            <div className="fort-ability-btns">
              {Object.values(ABILITIES).map((ab) => (
                <button
                  key={ab.id}
                  className={`fort-ability-btn ${aimingAbility === ab.id ? 'selected' : ''}`}
                  disabled={phase !== 'wave' || hud.energy < ab.cost || !hud.abilityReady}
                  onClick={() => toggleAbility(ab.id)}
                  title={ab.desc}
                >
                  <span className="fort-palette-emoji">{ab.emoji}</span>
                  <span className="fort-palette-name">{ab.name}</span>
                  <span className="fort-ability-cost">{ab.cost} ⚡</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FortalezaGame;
